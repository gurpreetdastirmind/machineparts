// backend/seed-csv.js
const fs = require('fs');
const path = require('path');
const { db, hashPassword } = require('./config/database');

// Parse CSV line handling quoted fields
function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];
    
    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

// Parse full CSV content
function parseCSV(content) {
  const lines = [];
  let currentLine = '';
  let inQuotes = false;
  
  for (let i = 0; i < content.length; i++) {
    const char = content[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
      currentLine += char;
    } else if (char === '\n' && !inQuotes) {
      if (currentLine.trim()) {
        lines.push(currentLine);
      }
      currentLine = '';
    } else if (char === '\r' && !inQuotes) {
      // Skip carriage returns
    } else {
      currentLine += char;
    }
  }
  
  if (currentLine.trim()) {
    lines.push(currentLine);
  }
  
  return lines;
}

// Clean description - remove "Description" prefix and clean up
function cleanDescription(desc) {
  if (!desc) return '';
  
  let cleaned = desc.trim();
  
  // Remove leading "Description" or "Description " prefix
  if (cleaned.toLowerCase().startsWith('description')) {
    cleaned = cleaned.substring(11).trim();
  }
  
  // Remove leading colon if present
  if (cleaned.startsWith(':')) {
    cleaned = cleaned.substring(1).trim();
  }
  
  return cleaned;
}

// Parse images from pipe-separated string
function parseImages(imagesStr) {
  if (!imagesStr) return [];
  
  return imagesStr
    .split('|')
    .map(img => img.trim())
    .filter(img => img && img.length > 0);
}

// Generate SKU from product name
function generateSKU(name, index) {
  const prefix = 'RK';
  const num = String(index + 1).padStart(5, '0');
  return `${prefix}${num}`;
}

// Extract brand from product name
function extractBrand(name) {
  if (!name) return '';
  
  const brands = ['Groz Beckert', 'Flying Tiger', 'Organ', 'JUKI', 'JACK', 'Brother', 'Singer'];
  const lowerName = name.toLowerCase();
  
  for (const brand of brands) {
    if (lowerName.includes(brand.toLowerCase())) {
      return brand;
    }
  }
  
  // Try to extract first word or two as brand
  const words = name.split(' ');
  if (words.length >= 2) {
    return words.slice(0, 2).join(' ');
  }
  return words[0] || '';
}

async function importCSV(csvPath) {
  console.log('🚀 Starting CSV import...');
  console.log(`📁 Reading file: ${csvPath}`);
  
  try {
    const content = fs.readFileSync(csvPath, 'utf-8');
    
    // Remove BOM if present
    const cleanContent = content.replace(/^\uFEFF/, '');
    
    const lines = parseCSV(cleanContent);
    console.log(`📊 Found ${lines.length} lines in CSV`);
    
    // Skip header row
    const dataLines = lines.slice(1);
    console.log(`📦 Processing ${dataLines.length} products...`);
    
    let imported = 0;
    let failed = 0;
    const errors = [];
    
    for (let i = 0; i < dataLines.length; i++) {
      const line = dataLines[i];
      if (!line.trim()) continue;
      
      try {
        const fields = parseCSVLine(line);
        
        // CSV columns: collection, product_name, price, sku_collection, description, image_count, images
        const collection = fields[0] || '';
        const productName = fields[1] || '';
        const priceStr = fields[2] || '0';
        // fields[3] is sku_collection - SKIP THIS
        const rawDescription = fields[4] || '';
        const imageCount = parseInt(fields[5]) || 0;
        const imagesStr = fields[6] || '';
        
        // Parse price (remove "Rs. " prefix and commas)
        const price = parseFloat(
          priceStr
            .replace(/Rs\.?\s*/gi, '')
            .replace(/,/g, '')
            .trim()
        ) || 0;
        
        // Clean description
        const description = cleanDescription(rawDescription);
        
        // Parse images
        const images = parseImages(imagesStr);
        
        // Generate SKU
        const sku = generateSKU(productName, i);
        
        // Extract brand
        const brand = extractBrand(productName);
        
        // Determine category based on collection or product name
        let category = 'Sewing Parts';
        if (productName.toLowerCase().includes('needle')) {
          category = 'Needles';
        } else if (collection.includes('DDL')) {
          category = 'Single Needle Machine Parts';
        }
        
        console.log(`\n📝 [${i + 1}/${dataLines.length}] Processing: ${productName.substring(0, 50)}...`);
        console.log(`   Collection: ${collection}`);
        console.log(`   Price: ₹${price}`);
        console.log(`   Images: ${images.length}`);
        console.log(`   Brand: ${brand}`);
        
        // Insert product
        const productId = await new Promise((resolve, reject) => {
          db.run(
            `INSERT INTO products (
              name, sku, description, price, discountedPrice, stock, 
              category, categoryId, brand, imageUrl, images, specifications,
              isBestSeller, isNewArrival, isHotDeal, isFeatured, isBundle, 
              isMostPopular, rating, reviewCount, createdAt, updatedAt
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0, ?, ?)`,
            [
              productName,
              sku,
              description,
              price,
              price, // discountedPrice same as price initially
              100, // default stock
              category,
              null, // categoryId
              brand,
              images[0] || '', // main imageUrl
              '[]', // legacy images field
              '', // specifications
              0, // isBestSeller
              0, // isNewArrival
              0, // isHotDeal
              0, // isFeatured
              0, // isBundle
              0, // isMostPopular
              new Date().toISOString(),
              new Date().toISOString()
            ],
            function(err) {
              if (err) {
                reject(err);
              } else {
                resolve(this.lastID);
              }
            }
          );
        });
        
        // Insert images into product_images table
        if (images.length > 0) {
          for (let j = 0; j < images.length; j++) {
            await new Promise((resolve, reject) => {
              db.run(
                `INSERT INTO product_images (productId, imageUrl, sortOrder, createdAt) VALUES (?, ?, ?, ?)`,
                [productId, images[j], j, new Date().toISOString()],
                (err) => {
                  if (err) reject(err);
                  else resolve();
                }
              );
            });
          }
        }
        
        imported++;
        console.log(`   ✅ Imported successfully (ID: ${productId})`);
        
      } catch (error) {
        failed++;
        const errorMsg = `Line ${i + 2}: ${error.message}`;
        errors.push(errorMsg);
        console.error(`   ❌ Failed: ${error.message}`);
      }
    }
    
    console.log('\n' + '='.repeat(50));
    console.log('📊 IMPORT COMPLETE');
    console.log('='.repeat(50));
    console.log(`✅ Successfully imported: ${imported} products`);
    console.log(`❌ Failed: ${failed} products`);
    
    if (errors.length > 0) {
      console.log('\n⚠️ Errors:');
      errors.forEach(err => console.log(`   - ${err}`));
    }
    
  } catch (error) {
    console.error('❌ Import failed:', error);
    throw error;
  }
}

// Run import
const csvPath = process.argv[2] || path.join(__dirname, 'products.csv-Sheet1.csv');

if (!fs.existsSync(csvPath)) {
  console.error(`❌ CSV file not found: ${csvPath}`);
  console.log('\nUsage: node seed-csv.js [path-to-csv-file]');
  process.exit(1);
}

// Wait for DB to initialize, then import
setTimeout(() => {
  importCSV(csvPath)
    .then(() => {
      console.log('\n🎉 Import process completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Import process failed:', error);
      process.exit(1);
    });
}, 2000); // Wait 2 seconds for DB to initialize