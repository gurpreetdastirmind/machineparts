// frontend/src/pages/Home.jsx
import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { productService } from '../services/productService'
import { categoryService } from '../services/categoryService'
import ProductCard from '../components/Product/ProductCard'
import {
  FiChevronRight, FiClock, FiTruck, FiShield,
  FiRefreshCw, FiAward, FiTrendingUp, FiZap,
  FiStar, FiPackage, FiGift, FiShoppingBag, FiCalendar,
  FiCpu, FiSmartphone, FiMonitor, FiCrop, FiLayers, FiGrid,
  FiTool, FiScissors, FiBox, FiSettings, FiPenTool, FiBriefcase
} from 'react-icons/fi'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay, Pagination, Navigation } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/pagination'
import 'swiper/css/navigation'

// Brand Logo Images
import jukiLogo from '../images/juki.webp'
import jackLogo from '../images/jack1.webp'
import pegasusLogo from '../images/pegasus.png'
import sirubaLogo from '../images/siruba.png'
import yamatoLogo from '../images/yamato.png'
import brotherLogo from '../images/brother.png'
import kansaiLogo from '../images/kansai_special.png'

// Background Images
import backgroundImg from '../images/backgroundimg.jpg'
import backgroundImg2 from '../images/backgroundimg2.jpg'
import jackbackground from '../images/jackbackground.jpg'

// Banner Images
import sewingMonthBanner from '../images/banner_img.webp'
import smartHeavyBanner from '../images/heavy_duty_banner.webp'

// Machine Part Images
import needlePlatesImg from '../images/needle_plates.jpg'
import pressureFootImg from '../images/pressure_foot.jpg'
import bobbinCasesImg from '../images/bobbin_case.jpg'
import gaugeSetImg from '../images/needle_bar.jpg'

// Sewing Section Images
import sewingmachine from '../images/sewing_machine.webp'
import sergers from "../images/serger.webp"
import beginnersewing from "../images/SINGER_M15.webp"
import quanlitymachine from "../images/quality_machine.webp"
import sewingaccessories from "../images/sewing_accessories.webp"
import embroiderMachine from "../images/Embroidery.avif"

// ✅ Brand logos with proper casing - ONLY brands with actual images
const brandLogos = {
  'JUKI': jukiLogo,
  'JACK': jackLogo,
  'PEGASUS': pegasusLogo,
  'SIRUBA': sirubaLogo,
  'YAMATO': yamatoLogo,
  'BROTHER': brotherLogo,
  'KANSAI SPECIAL': kansaiLogo,
  'KANSAI': kansaiLogo,
}

// ✅ Brand colors for fallback (when image fails to load)
const brandColors = {
  'JUKI': 'bg-blue-600',
  'JACK': 'bg-green-600',
  'PEGASUS': 'bg-purple-600',
  'SIRUBA': 'bg-orange-600',
  'YAMATO': 'bg-red-600',
  'BROTHER': 'bg-cyan-600',
  'KANSAI SPECIAL': 'bg-indigo-600',
  'KANSAI': 'bg-indigo-600',
}

// ✅ ONLY categories that have logos - removed C, H, F, N, S, S
const FALLBACK_CATEGORIES_WITH_IMAGES = [
  { id: 1, name: 'JUKI', slug: 'juki', productCount: 0 },
  { id: 2, name: 'JACK', slug: 'jack', productCount: 0 },
  { id: 3, name: 'PEGASUS', slug: 'pegasus', productCount: 0 },
  { id: 4, name: 'SIRUBA', slug: 'siruba', productCount: 0 },
  { id: 5, name: 'YAMATO', slug: 'yamato', productCount: 0 },
  { id: 6, name: 'BROTHER', slug: 'brother', productCount: 0 },
  { id: 7, name: 'KANSAI SPECIAL', slug: 'kansai-special', productCount: 0 },
]

// Machine Parts
const machineParts = [
  {
    id: 1,
    name: 'NEEDLE PLATES',
    slug: 'needle-plates',
    icon: FiTool,
    image: needlePlatesImg,
    color: 'from-blue-500 to-indigo-600',
    description: 'Precision needle plates for smooth sewing'
  },
  {
    id: 2,
    name: 'PRESSURE FOOT',
    slug: 'pressure-foot',
    icon: FiSettings,
    image: pressureFootImg,
    color: 'from-green-500 to-emerald-600',
    description: 'Various pressure feet for different techniques'
  },
  {
    id: 3,
    name: 'BOBBIN CASES',
    slug: 'bobbin-cases',
    icon: FiBox,
    image: bobbinCasesImg,
    color: 'from-purple-500 to-pink-600',
    description: 'Quality bobbin cases for consistent stitching'
  },
  {
    id: 4,
    name: 'NEEDLE BAR',
    slug: 'Needle-bar',
    icon: FiScissors,
    image: gaugeSetImg,
    color: 'from-amber-500 to-orange-600',
    description: 'Essential gauge tools for precise measurements'
  },
]

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([])
  const [hotDeals, setHotDeals] = useState([])
  const [newArrivals, setNewArrivals] = useState([])
  const [bestSellers, setBestSellers] = useState([])
  const [bundleProducts, setBundleProducts] = useState([])
  const [mostPopularProducts, setMostPopularProducts] = useState([])
  const [categories, setCategories] = useState(FALLBACK_CATEGORIES_WITH_IMAGES)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchHomeData()
  }, [])

  // ✅ Helper function to normalize category names for deduplication
  const normalizeCategoryName = (name) => {
    if (!name) return ''
    const upper = name.toUpperCase().trim()
    // Handle common variations
    if (upper.includes('KANSAI')) return 'KANSAI SPECIAL'
    if (upper === 'PEBASUS') return 'PEGASUS'
    if (upper === 'IYAMATO' || upper === 'YAMATO') return 'YAMATO'
    if (upper === 'BROTHER') return 'BROTHER'
    if (upper === 'JUKI') return 'JUKI'
    if (upper === 'JACK') return 'JACK'
    if (upper === 'SIRUBA') return 'SIRUBA'
    return upper
  }

  const fetchHomeData = async () => {
    try {
      setLoading(true)
      setError(null)

      let allProducts = []
      try {
        const allProductsRes = await productService.getProducts({ limit: 100 })
        console.log('===== FULL API RESPONSE =====')
        console.log(allProductsRes.data)

        if (allProductsRes.data?.data?.products) {
          allProducts = allProductsRes.data.data.products
        } else if (allProductsRes.data?.products) {
          allProducts = allProductsRes.data.products
        } else if (Array.isArray(allProductsRes.data?.data)) {
          allProducts = allProductsRes.data.data
        } else if (Array.isArray(allProductsRes.data)) {
          allProducts = allProductsRes.data
        }
      } catch (error) {
        console.warn('Failed to fetch products from API:', error)
      }

      console.log('===== ALL PRODUCTS =====')
      console.log(allProducts)

      if (allProducts.length > 0) {
        const featuredData = allProducts.filter(p =>
          p.isFeatured === true ||
          p.isFeatured === 'true' ||
          p.isFeatured === 1 ||
          p.isFeatured === '1'
        )

        const hotDealsData = allProducts.filter(p =>
          p.isHotDeal === true ||
          p.isHotDeal === 'true' ||
          p.isHotDeal === 1 ||
          p.isHotDeal === '1'
        )

        const newArrivalsData = allProducts.filter(p =>
          p.isNewArrival === true ||
          p.isNewArrival === 'true' ||
          p.isNewArrival === 1 ||
          p.isNewArrival === '1'
        )

        const bestSellersData = allProducts.filter(p =>
          p.isBestSeller === true ||
          p.isBestSeller === 'true' ||
          p.isBestSeller === 1 ||
          p.isBestSeller === '1'
        )

        const bundleData = allProducts.filter(p =>
          p.isBundle === true ||
          p.isBundle === 'true' ||
          p.isBundle === 1 ||
          p.isBundle === '1'
        )

        const mostPopularData = allProducts.filter(p =>
          p.isMostPopular === true ||
          p.isMostPopular === 'true' ||
          p.isMostPopular === 1 ||
          p.isMostPopular === '1'
        )

        setFeaturedProducts(featuredData)
        setHotDeals(hotDealsData)
        setNewArrivals(newArrivalsData)
        setBestSellers(bestSellersData)
        setBundleProducts(bundleData)
        setMostPopularProducts(mostPopularData)
      } else {
        setFeaturedProducts([])
        setHotDeals([])
        setNewArrivals([])
        setBestSellers([])
        setBundleProducts([])
        setMostPopularProducts([])
      }

      // ✅ Fetch categories and FILTER to only show ones with logos
      try {
        const categoriesRes = await categoryService.getCategories()
        console.log('Categories Response:', categoriesRes.data)

        let categoriesData = []
        if (categoriesRes.data?.data) {
          categoriesData = categoriesRes.data.data
        } else if (Array.isArray(categoriesRes.data)) {
          categoriesData = categoriesRes.data
        } else if (categoriesRes.data?.categories) {
          categoriesData = categoriesRes.data.categories
        }

        // ✅ FIX: Use a Map to deduplicate by normalized name
        const categoryMap = new Map()

        // First, add all fallback categories (ONLY the ones with images)
        FALLBACK_CATEGORIES_WITH_IMAGES.forEach(cat => {
          const normalizedName = normalizeCategoryName(cat.name)
          const productCount = allProducts.filter(p =>
            p.category === cat.slug ||
            p.category === cat.name ||
            p.categoryId === cat.id
          ).length
          categoryMap.set(normalizedName, { 
            ...cat, 
            name: normalizedName,
            productCount,
            id: cat.id,
            slug: cat.slug
          })
        })

        // Then, add/merge API categories but ONLY if they have a logo
        categoriesData.forEach(cat => {
          const normalizedName = normalizeCategoryName(cat.name)
          
          // ✅ SKIP categories that don't have a logo
          const hasLogo = brandLogos[normalizedName] !== undefined
          if (!hasLogo) {
            console.log(`⏭️ Skipping category "${cat.name}" - no logo found`)
            return
          }
          
          const productCount = allProducts.filter(p =>
            p.category === cat.slug ||
            p.category === cat.name ||
            p.categoryId === cat.id
          ).length
          
          // If this category already exists in the map, update its product count
          if (categoryMap.has(normalizedName)) {
            const existing = categoryMap.get(normalizedName)
            const finalCount = Math.max(existing.productCount, productCount)
            categoryMap.set(normalizedName, { 
              ...existing, 
              productCount: finalCount,
              slug: cat.slug || existing.slug
            })
          } else {
            // New category not in fallback but has a logo
            categoryMap.set(normalizedName, { 
              ...cat, 
              name: normalizedName,
              productCount,
              id: cat.id || Math.random() * 1000,
              slug: cat.slug || normalizedName.toLowerCase()
            })
          }
        })

        // Convert Map back to array and sort with brand order
        const mergedCategories = Array.from(categoryMap.values())
          .sort((a, b) => {
            const brandOrder = ['JUKI', 'JACK', 'PEGASUS', 'SIRUBA', 'YAMATO', 'BROTHER', 'KANSAI SPECIAL']
            const aIndex = brandOrder.indexOf(a.name)
            const bIndex = brandOrder.indexOf(b.name)
            if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex
            if (aIndex !== -1) return -1
            if (bIndex !== -1) return 1
            return a.name.localeCompare(b.name)
          })

        console.log('✅ Final Categories (with logos only):', mergedCategories)
        setCategories(mergedCategories)

      } catch (error) {
        console.warn('Failed to fetch categories:', error)
        // Use fallback categories with product counts
        const updatedFallback = FALLBACK_CATEGORIES_WITH_IMAGES.map(cat => {
          const productCount = allProducts.filter(p =>
            p.category === cat.slug ||
            p.category === cat.name
          ).length
          return { ...cat, productCount }
        })
        setCategories(updatedFallback)
      }

    } catch (error) {
      console.error('Error fetching home data:', error)
      setError('Failed to load some content.')
      setFeaturedProducts([])
      setHotDeals([])
      setNewArrivals([])
      setBestSellers([])
      setBundleProducts([])
      setMostPopularProducts([])
      setCategories(FALLBACK_CATEGORIES_WITH_IMAGES)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="spinner"></div>
      </div>
    )
  }

  const categoriesToShow = Array.isArray(categories) ? categories : FALLBACK_CATEGORIES_WITH_IMAGES

  return (
    <div className="w-full">
      {/* Hero Banner with Carousel */}
      <section className="mb-8">
        <Swiper
          modules={[Autoplay, Pagination, Navigation]}
          autoplay={{ delay: 5000, disableOnInteraction: false }}
          pagination={{ clickable: true }}
          navigation
          className="rounded-lg overflow-hidden"
        >
          <SwiperSlide>
            <div className="relative min-h-[350px] md:min-h-[400px] flex items-center"
              style={{
                backgroundImage: `url(${backgroundImg})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat'
              }}
            >
              <div className="absolute inset-0 bg-black/50"></div>
              <div className="relative z-10 container-custom py-12 md:py-16">
                <div className="max-w-2xl">
                  <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">
                    Welcome to MachineParts
                  </h1>
                  <p className="text-lg md:text-xl text-white/90 mb-6">
                    Your one-stop shop for all sewing machine parts
                  </p>
                  <Link
                    to="/products"
                    className="inline-block px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
                  >
                    Shop Now
                  </Link>
                </div>
              </div>
            </div>
          </SwiperSlide>

          <SwiperSlide>
            <div className="relative min-h-[350px] md:min-h-[400px] flex items-center"
              style={{
                backgroundImage: `url(${jackbackground})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat'
              }}
            >
              <div className="absolute inset-0 bg-black/50"></div>
              <div className="relative z-10 container-custom py-12 md:py-16">
                <div className="max-w-2xl">
                  <div className="text-sm uppercase tracking-wider text-green-400 mb-2">Premium Quality</div>
                  <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">
                    JACK Sewing Machines
                  </h1>
                  <p className="text-lg md:text-xl text-white/90 mb-6">
                    High-performance industrial sewing machines
                  </p>
                  <Link
                    to="/products?category=jack"
                    className="inline-block px-8 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors shadow-lg hover:shadow-xl"
                  >
                    Explore JACK
                  </Link>
                </div>
              </div>
            </div>
          </SwiperSlide>

          <SwiperSlide>
            <div className="relative min-h-[350px] md:min-h-[400px] flex items-center"
              style={{
                backgroundImage: `url(${backgroundImg2})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat'
              }}
            >
              <div className="absolute inset-0 bg-black/50"></div>
              <div className="relative z-10 container-custom py-12 md:py-16">
                <div className="max-w-2xl">
                  <div className="text-sm uppercase tracking-wider text-yellow-400 mb-2">Premium Quality</div>
                  <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">
                    Heavy Duty Sewing Machines
                  </h1>
                  <p className="text-lg md:text-xl text-white/90 mb-6">
                    Industrial grade parts & accessories
                  </p>
                  <Link
                    to="/products?category=heavy-duty"
                    className="inline-block px-8 py-3 bg-orange-600 text-white rounded-lg font-semibold hover:bg-orange-700 transition-colors shadow-lg hover:shadow-xl"
                  >
                    Explore Now
                  </Link>
                </div>
              </div>
            </div>
          </SwiperSlide>
        </Swiper>
      </section>

      {/* ====== SHOP BY CATEGORY - ONLY BRANDS WITH IMAGES ====== */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center">
            <FiPackage className="text-blue-600 mr-2" size={28} />
            Shop by Category
          </h2>
          <Link to="/products" className="text-blue-600 hover:underline flex items-center text-sm">
            View All Categories <FiChevronRight className="ml-1" />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {categoriesToShow.map((category) => {
            const logoUrl = brandLogos[category.name] || null
            const bgColor = brandColors[category.name] || 'bg-blue-600'
            
            // ✅ Only render if there's a logo URL
            if (!logoUrl) return null
            
            return (
              <Link
                key={category.id}
                to={`/products?category=${category.slug || category.name.toLowerCase()}`}
                className="group relative overflow-hidden rounded-xl shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 bg-white h-48"
              >
                <div className="relative w-full h-full">
                  <img
                    src={logoUrl}
                    alt={category.name}
                    className="w-full h-full object-contain p-4 bg-white group-hover:scale-110 transition-transform duration-700"
                    onError={(e) => {
                      e.target.style.display = 'none'
                      const parent = e.target.parentElement
                      if (parent) {
                        parent.innerHTML = `
                          <div class="w-full h-full ${bgColor} flex items-center justify-center">
                            <span class="text-white text-4xl font-bold">${category.name.charAt(0)}</span>
                          </div>
                        `
                      }
                    }}
                  />
                </div>
              </Link>
            )
          })}
        </div>
      </section>

      {/* Features Banner */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { icon: FiTruck, label: 'Free Shipping', desc: 'On orders over ₹1000' },
          { icon: FiShield, label: 'Secure Payment', desc: '100% secure checkout' },
          { icon: FiRefreshCw, label: 'Easy Returns', desc: '7 days return policy' },
          { icon: FiAward, label: 'Quality Guarantee', desc: 'Genuine parts only' },
        ].map((item, idx) => (
          <div key={idx} className="bg-white rounded-lg shadow p-4 text-center hover:shadow-lg transition-shadow">
            <item.icon className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <h4 className="font-semibold text-gray-800 text-sm">{item.label}</h4>
            <p className="text-xs text-gray-500">{item.desc}</p>
          </div>
        ))}
      </section>

      {/* ====== SMART HEAVY DUTY BANNER ====== */}
      <section className="mb-12">
        <div className="relative rounded-2xl overflow-hidden shadow-lg">
          <div
            className="relative min-h-[280px] md:min-h-[340px] flex items-center"
            style={{
              backgroundImage: `url(${smartHeavyBanner})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat'
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-slate-900/85 via-blue-900/70 to-cyan-800/50"></div>
            <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-400/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4"></div>
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-400/10 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4"></div>
            <div className="absolute top-1/2 right-20 w-40 h-40 bg-purple-400/5 rounded-full blur-2xl"></div>
            <div className="absolute inset-0 opacity-5" style={{
              backgroundImage: `
                linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
              `,
              backgroundSize: '40px 40px'
            }}></div>

            <div className="relative z-10 container-custom py-10 md:py-14">
              <div className="max-w-2xl">
                <div className="inline-flex items-center gap-2 bg-cyan-500/20 backdrop-blur-sm text-cyan-300 px-4 py-1.5 rounded-full text-sm font-medium mb-4 border border-cyan-400/30">
                  <FiCpu className="text-cyan-400" size={16} />
                  <span>New Innovation</span>
                </div>
                <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold text-white mb-3 leading-tight">
                  <span className="block text-sm md:text-base font-normal text-cyan-300/80 uppercase tracking-wider mb-1">
                    BE FIRST IN LINE FOR SMART HEAVY DUTY
                  </span>
                  New Heavy Duty. <br className="hidden sm:block" />
                  <span className="bg-gradient-to-r from-cyan-300 to-blue-300 bg-clip-text text-transparent">
                    Now embroidery-capable.
                  </span>
                </h2>
                <p className="text-white/80 text-sm md:text-base lg:text-lg mb-6 max-w-xl leading-relaxed">
                  The Heavy Duty™ you love, made smarter. With the CREATIVE™ app, your phone becomes your control center, giving you access to stitch selection, real-time adjustments and built-in guidance.
                </p>
                <Link
                  to="/products/hd9120-presale"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-lg hover:from-cyan-600 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-cyan-500/30 transform hover:-translate-y-0.5"
                >
                  <FiSmartphone size={18} />
                  <span>Shop HD9120 Presale</span>
                  <FiChevronRight size={18} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ====== SHOP BY MACHINE PARTS ====== */}
      <section className="mb-12">
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
            Shop by Machine Parts
          </h2>
          <p className="text-gray-500 text-sm md:text-base">
            Find the perfect sewing machine parts for your needs
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {machineParts.map((part) => (
            <Link
              key={part.id}
              to={`/products?category=${part.slug}`}
              className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 bg-white"
            >
              <div className="relative h-64 md:h-72 overflow-hidden">
                {part.image ? (
                  <img
                    src={part.image}
                    alt={part.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    onError={(e) => {
                      e.target.style.display = 'none'
                      const parent = e.target.parentElement
                      if (parent) {
                        parent.innerHTML = `
                          <div class="w-full h-full bg-gradient-to-br ${part.color} flex items-center justify-center">
                            <span class="text-white text-6xl font-bold">${part.name.charAt(0)}</span>
                          </div>
                        `
                      }
                    }}
                  />
                ) : (
                  <div className={`w-full h-full bg-gradient-to-br ${part.color} flex items-center justify-center`}>
                    <span className="text-white text-6xl font-bold">{part.name.charAt(0)}</span>
                  </div>
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-70 group-hover:opacity-80 transition-opacity duration-300"></div>
                <div className="absolute inset-0 opacity-10" style={{
                  backgroundImage: `radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%)`
                }}></div>

                <div className="absolute bottom-0 left-0 right-0 p-5 pb-6">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="bg-white/20 backdrop-blur-sm rounded-full p-1.5">
                      <part.icon className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-white/60 text-[10px] font-medium uppercase tracking-wider">
                      {part.slug}
                    </span>
                  </div>

                  <h3 className="text-sm md:text-base font-bold text-white uppercase tracking-wide leading-tight mb-1">
                    {part.name}
                  </h3>

                  <div className="overflow-hidden max-h-0 group-hover:max-h-12 transition-all duration-300">
                    <p className="text-white/80 text-xs mt-1">
                      {part.description}
                    </p>
                  </div>

                  <div className="mt-3 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                    <span className="inline-block px-4 py-1.5 bg-white/20 backdrop-blur-sm text-white text-xs font-semibold rounded-full border border-white/30 hover:bg-white/30 hover:scale-105 transition-all duration-300">
                      Shop Now →
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ====== NATIONAL SEWING MONTH BANNER ====== */}
      <section className="mb-12">
        <div className="relative rounded-2xl overflow-hidden shadow-lg">
          <div
            className="relative min-h-[280px] md:min-h-[320px] flex items-center"
            style={{
              backgroundImage: `url(${sewingMonthBanner})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat'
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-900/80 via-purple-800/60 to-pink-700/40"></div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-400/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4"></div>
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-pink-400/10 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4"></div>

            <div className="relative z-10 container-custom py-10 md:py-14">
              <div className="max-w-2xl">
                <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white px-4 py-1.5 rounded-full text-sm font-medium mb-4 border border-white/10">
                  <FiCalendar className="text-yellow-300" size={16} />
                  <span>September 2026</span>
                </div>
                <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold text-white mb-3 leading-tight">
                  Celebrate National <br className="hidden sm:block" />
                  <span className="bg-gradient-to-r from-yellow-300 to-pink-300 bg-clip-text text-transparent">Sewing Month</span>
                </h2>
                <p className="text-white/90 text-sm md:text-base lg:text-lg mb-6 max-w-xl leading-relaxed">
                  Sew into National Sewing Month with hot deals on SINGER® machines. Shop Last Chance and Final Markdown machines at incredible prices, plus save an extra 10% on refurbished machines.
                </p>
                <Link
                  to="/products?category=sewing-machines"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-semibold rounded-lg hover:from-yellow-500 hover:to-orange-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  <span>Shop Now</span>
                  <FiChevronRight size={18} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ====== MOST POPULAR SECTION ====== */}
      {mostPopularProducts.length > 0 && (
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center">
              <FiTrendingUp className="text-rose-500 mr-2" size={28} />
              <span className="bg-rose-500 text-white text-xs px-2 py-1 rounded mr-2">POPULAR</span>
              Most Popular
            </h2>
            <Link to="/products?sort=most-popular" className="text-blue-600 hover:underline flex items-center text-sm">
              View All <FiChevronRight className="ml-1" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {mostPopularProducts.slice(0, 4).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* ====== BUNDLE & SAVE SECTION ====== */}
      {bundleProducts.length > 0 && (
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center">
              <FiGift className="text-amber-500 mr-2" size={28} />
              Bundle & Save
            </h2>
            <Link to="/products?sort=bundle" className="text-blue-600 hover:underline flex items-center text-sm">
              View All <FiChevronRight className="ml-1" />
            </Link>
          </div>
          <Swiper
            modules={[Autoplay, Pagination, Navigation]}
            autoplay={{ delay: 4000, disableOnInteraction: false }}
            pagination={{ clickable: true }}
            navigation
            breakpoints={{
              640: { slidesPerView: 1, spaceBetween: 20 },
              768: { slidesPerView: 2, spaceBetween: 20 },
              1024: { slidesPerView: 3, spaceBetween: 24 },
              1280: { slidesPerView: 4, spaceBetween: 24 },
            }}
            className="bundle-slider"
          >
            {bundleProducts.map((product) => (
              <SwiperSlide key={product.id}>
                <ProductCard product={product} />
              </SwiperSlide>
            ))}
          </Swiper>
        </section>
      )}

      {/* ====== HOT COLLECTION / HOT DEALS ====== */}
      {hotDeals.length > 0 && (
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center">
              <FiZap className="text-red-500 mr-2" size={28} />
              <span className="bg-red-500 text-white text-xs px-2 py-1 rounded mr-2">HOT</span>
              Hot Collection
            </h2>
            <Link to="/products?sort=hot-deals" className="text-blue-600 hover:underline flex items-center text-sm">
              View All <FiChevronRight className="ml-1" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {hotDeals.slice(0, 4).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* ====== BEST SELLING PRODUCTS ====== */}
      {bestSellers.length > 0 && (
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center">
              <FiTrendingUp className="text-green-500 mr-2" size={28} />
              Best Selling
            </h2>
            <Link to="/products?sort=best-sellers" className="text-blue-600 hover:underline flex items-center text-sm">
              View All <FiChevronRight className="ml-1" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {bestSellers.slice(0, 4).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* ====== NEW ARRIVALS ====== */}
      {newArrivals.length > 0 && (
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center">
              <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded mr-2">NEW</span>
              New Arrivals
            </h2>
            <Link to="/products?sort=newest" className="text-blue-600 hover:underline flex items-center text-sm">
              View All <FiChevronRight className="ml-1" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {newArrivals.slice(0, 4).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* ====== FEATURED / SPECIAL OFFERS ====== */}
      {featuredProducts.length > 0 && (
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center">
              <FiStar className="text-yellow-500 mr-2" size={28} />
              Special Offers
            </h2>
            <Link to="/products" className="text-blue-600 hover:underline flex items-center text-sm">
              View All <FiChevronRight className="ml-1" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {featuredProducts.slice(0, 4).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* ====== SEWING MACHINES & EMBROIDERY SECTION ====== */}
      <section className="mb-12 py-8 bg-gradient-to-b from-white to-gray-50/80 rounded-2xl">
        <div className="container-custom">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              Sewing Machines & Embroidery Machines for Every Skill Level
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-600 mx-auto rounded-full"></div>
          </div>

          <div className="max-w-4xl mx-auto text-center mb-12">
            <p className="text-gray-600 text-sm md:text-base leading-relaxed">
              For nearly 175 years, the <span className="font-semibold text-blue-600">SINGER®</span> brand has been a leader in sewing innovation,
              creating reliable <span className="font-semibold">sewing machines</span> and <span className="font-semibold">embroidery machines</span> trusted by makers worldwide.
              From <span className="font-semibold">beginner sewing machines</span> for first-time enthusiasts to advanced and professional sewing
              and embroidery machines for experienced creators, <span className="font-semibold text-blue-600">SINGER®</span> offers tools for every skill level.
              Explore our extensive selection of sewing machines, embroidery machines, <span className="font-semibold">quilting machines</span> and
              <span className="font-semibold"> sewing accessories</span>, all designed to help bring your creative projects to life with precision
              and confidence.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group">
              <div className="relative h-48 overflow-hidden">
                <img
                  src={sewingmachine}
                  alt="Sewing Machines"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <div className="absolute bottom-4 left-4">
                  <span className="text-white text-xl font-bold">Sewing Machines</span>
                </div>
              </div>
              <div className="p-5">
                <p className="text-gray-600 text-sm leading-relaxed">
                  The heart of the <span className="font-semibold text-blue-600">SINGER®</span> brand. Our versatile selection of sewing machines offers everything from basic utility models for everyday tasks to advanced computerized sewing machines with hundreds of built-in stitches.
                </p>
                <Link
                  to="/products?category=sewing-machines"
                  className="inline-flex items-center gap-1 mt-4 text-blue-600 font-semibold hover:text-blue-800 transition-colors group-hover:gap-2"
                >
                  Explore Sewing Machines
                  <FiChevronRight className="transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group">
              <div className="relative h-48 overflow-hidden">
                <img
                  src={embroiderMachine}
                  alt="Embroidery Machines"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <div className="absolute bottom-4 left-4">
                  <span className="text-white text-xl font-bold">Embroidery Machines</span>
                </div>
              </div>
              <div className="p-5">
                <p className="text-gray-600 text-sm leading-relaxed">
                  Take your personalization and embellishment to the next level. Our cutting-edge embroidery machines provide vast design libraries, easy-to-use software and precise stitch quality.
                </p>
                <Link
                  to="/products?category=embroidery"
                  className="inline-flex items-center gap-1 mt-4 text-blue-600 font-semibold hover:text-blue-800 transition-colors group-hover:gap-2"
                >
                  Explore Embroidery
                  <FiChevronRight className="transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group">
              <div className="relative h-48 overflow-hidden">
                <img
                  src={sergers}
                  alt="Sergers"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <div className="absolute bottom-4 left-4">
                  <span className="text-white text-xl font-bold">Sergers</span>
                </div>
              </div>
              <div className="p-5">
                <p className="text-gray-600 text-sm leading-relaxed">
                  For professional-quality finishes and construction. A serger machine is essential for trimming seam allowances, overcasting edges and creating clean, durable hems.
                </p>
                <Link
                  to="/products?category=sergers"
                  className="inline-flex items-center gap-1 mt-4 text-blue-600 font-semibold hover:text-blue-800 transition-colors group-hover:gap-2"
                >
                  Explore Sergers
                  <FiChevronRight className="transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </div>
          </div>

          <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link 
              to="/products?category=beginner" 
              className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 h-[300px]"
            >
              <div className="relative w-full h-full">
                <img
                  src={beginnersewing}
                  alt="Beginner Sewing Machines"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <div className="inline-block bg-blue-500/90 backdrop-blur-sm rounded-full px-4 py-1 text-white text-[11px] font-bold uppercase tracking-wider mb-3">
                    Beginner
                  </div>
                  <h4 className="font-bold text-white text-xl mb-2">Beginner Sewing Machines</h4>
                  <p className="text-white/90 text-sm leading-relaxed line-clamp-2">
                    New to sewing? Start your journey with confidence. Our reliable and intuitive beginner sewing machines are easy to set up.
                  </p>
                  <span className="inline-flex items-center gap-2 mt-4 text-white/90 text-sm font-semibold group-hover:text-white group-hover:gap-3 transition-all duration-300">
                    Shop Beginner 
                    <FiChevronRight className="transition-transform group-hover:translate-x-1" size={16} />
                  </span>
                </div>
              </div>
            </Link>

            <Link 
              to="/products?category=quilting" 
              className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 h-[300px]"
            >
              <div className="relative w-full h-full">
                <img
                  src={quanlitymachine}
                  alt="Quilting Machines"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <div className="inline-block bg-purple-500/90 backdrop-blur-sm rounded-full px-4 py-1 text-white text-[11px] font-bold uppercase tracking-wider mb-3">
                    Quilting
                  </div>
                  <h4 className="font-bold text-white text-xl mb-2">Quilting Machines</h4>
                  <p className="text-white/90 text-sm leading-relaxed line-clamp-2">
                    Designed with the space and power a quilter needs. SINGER® quilting machines feature extended work areas.
                  </p>
                  <span className="inline-flex items-center gap-2 mt-4 text-white/90 text-sm font-semibold group-hover:text-white group-hover:gap-3 transition-all duration-300">
                    Shop Quilting 
                    <FiChevronRight className="transition-transform group-hover:translate-x-1" size={16} />
                  </span>
                </div>
              </div>
            </Link>

            <Link 
              to="/products?category=accessories" 
              className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 h-[300px]"
            >
              <div className="relative w-full h-full">
                <img
                  src={sewingaccessories}
                  alt="Sewing Accessories"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <div className="inline-block bg-amber-500/90 backdrop-blur-sm rounded-full px-4 py-1 text-white text-[11px] font-bold uppercase tracking-wider mb-3">
                    Accessories
                  </div>
                  <h4 className="font-bold text-white text-xl mb-2">Sewing Accessories</h4>
                  <p className="text-white/90 text-sm leading-relaxed line-clamp-2">
                    Complete your creative workspace with the necessary tools. Shop our wide range of sewing accessories.
                  </p>
                  <span className="inline-flex items-center gap-2 mt-4 text-white/90 text-sm font-semibold group-hover:text-white group-hover:gap-3 transition-all duration-300">
                    Shop Accessories 
                    <FiChevronRight className="transition-transform group-hover:translate-x-1" size={16} />
                  </span>
                </div>
              </div>
            </Link>
          </div>

          <div className="mt-10 text-center">
            <Link
              to="/products"
              className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <span>Explore All Machines</span>
              <FiChevronRight size={18} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home