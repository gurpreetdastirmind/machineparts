// frontend/src/pages/Home.jsx
import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { productService } from '../services/productService'
import { categoryService } from '../services/categoryService'
import { useCart } from '../context/CartContext'
import ProductCard from '../components/Product/ProductCard'
import HomeCoupons from '../components/Common/HomeCoupons'
import {
  FiChevronRight, FiClock, FiTruck, FiShield,
  FiRefreshCw, FiAward, FiTrendingUp, FiZap,
  FiStar, FiPackage, FiGift, FiShoppingBag, FiCalendar,
  FiCpu, FiSmartphone, FiMonitor, FiCrop, FiLayers, FiGrid,
  FiTool, FiScissors, FiBox, FiSettings, FiPenTool, FiBriefcase,
  FiEye, FiShoppingCart, FiX
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

import feedDogImg from '../images/needle_plates.jpg'
import bobbinImg from '../images/bobbin_case.jpg'
import hookSetsImg from '../images/needle_bar.jpg'

// Brand logos with proper casing - ONLY brands with actual images
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

// Brand colors for fallback
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

const FALLBACK_CATEGORIES_WITH_IMAGES = [
  { id: 1, name: 'JUKI', slug: 'juki', productCount: 0 },
  { id: 2, name: 'JACK', slug: 'jack', productCount: 0 },
  { id: 3, name: 'PEGASUS', slug: 'pegasus', productCount: 0 },
  { id: 4, name: 'SIRUBA', slug: 'siruba', productCount: 0 },
  { id: 5, name: 'YAMATO', slug: 'yamato', productCount: 0 },
  { id: 6, name: 'BROTHER', slug: 'brother', productCount: 0 },
  { id: 7, name: 'KANSAI SPECIAL', slug: 'kansai-special', productCount: 0 },
]

const gaugeSetsData = [
  {
    id: '202554e1',
    name: '202554E1 Gauge Set Pegasus M800 Overlock Machine',
    price: 850.00,
    image: gaugeSetImg
  },
  {
    id: 'k1-g821',
    name: 'K-1 G821 Profile Stitch Gauge Set Single Needle Lock Stitch Sewing Machine',
    price: 550.00,
    image: needlePlatesImg
  },
  {
    id: 'gauge-1412',
    name: 'Gauge Set 1412 6-Needle 1/4" KANSAI SPECIAL DFB-1406 Multi...',
    price: 2450.00,
    image: gaugeSetImg
  },
  {
    id: 'gauge-11',
    name: 'Gauge Set 11 Needle Kansai Multi-Needle Machine',
    price: 2450.00,
    image: needlePlatesImg
  }
]

// ✅ FIXED: All 4 internal parts use the correct needle bar image
const INTERNAL_PARTS_FALLBACK = [
  {
    id: 'internal-1',
    name: 'NEEDLE BAR for JACK F4, JK-9100, JK-8900 Single Needle Lock-Stitch Machine',
    price: 50.00,
    image: gaugeSetImg
  },
  {
    id: 'internal-2',
    name: 'KF33 / KF32 Needle Bar Asm Siruba 747 Overlock Machine',
    price: 300.00,
    image: gaugeSetImg
  },
  {
    id: 'internal-3',
    name: 'Needle Bar With Bush Set For High Speed Machine',
    price: 450.00,
    image: gaugeSetImg
  },
  {
    id: 'internal-4',
    name: '251000-910 / 206059A / 251003 Needle Bar Assembly',
    price: 750.00,
    image: gaugeSetImg
  }
]

const Home = () => {
  const { t } = useTranslation()
  const { addToCart } = useCart()

  const machineParts = [
    {
      id: 1,
      name: t('home.parts.needlePlates'),
      slug: 'needle-plates',
      icon: FiTool,
      image: needlePlatesImg,
      color: 'from-blue-500 to-indigo-600',
      description: t('home.parts.needlePlatesDesc')
    },
    {
      id: 2,
      name: t('home.parts.pressureFoot'),
      slug: 'pressure-foot',
      icon: FiSettings,
      image: pressureFootImg,
      color: 'from-green-500 to-emerald-600',
      description: t('home.parts.pressureFootDesc')
    },
    {
      id: 3,
      name: t('home.parts.bobbinCases'),
      slug: 'bobbin-case',
      icon: FiBox,
      image: bobbinCasesImg,
      color: 'from-purple-500 to-pink-600',
      description: t('home.parts.bobbinCasesDesc')
    },
    {
      id: 4,
      name: t('home.parts.needleBar'),
      slug: 'Needle-bar',
      icon: FiScissors,
      image: gaugeSetImg,
      color: 'from-amber-500 to-orange-600',
      description: t('home.parts.needleBarDesc')
    },
  ]

  const internalPartsTabs = [
    { id: 'needle-bar-bush', label: t('home.internalTabs.needleBarBush') },
    { id: 'connecting-rods', label: t('home.internalTabs.connectingRods') },
    { id: 'looper-assembly', label: t('home.internalTabs.looperAssembly') },
  ]

  const [featuredProducts, setFeaturedProducts] = useState([])
  const [hotDeals, setHotDeals] = useState([])
  const [newArrivals, setNewArrivals] = useState([])
  const [bestSellers, setBestSellers] = useState([])
  const [bundleProducts, setBundleProducts] = useState([])
  const [mostPopularProducts, setMostPopularProducts] = useState([])
  const [internalParts, setInternalParts] = useState([])
  const [activeInternalTab, setActiveInternalTab] = useState('needle-bar-bush')
  const [categories, setCategories] = useState(FALLBACK_CATEGORIES_WITH_IMAGES)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Quick View Modal State
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleQuickView = (product) => {
    setSelectedProduct(product)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setSelectedProduct(null)
  }

  // ✅ Handle Add to Cart for hardcoded products (gauge sets + internal parts)
  const handleAddToCart = (product) => {
    addToCart(
      {
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image || product.images?.[0],
      },
      1
    )
  }

  useEffect(() => {
    fetchHomeData()
  }, [])

  const normalizeCategoryName = (name) => {
    if (!name) return ''
    const upper = name.toUpperCase().trim()
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

      if (allProducts.length > 0) {
        const featuredData = allProducts.filter(p => p.isFeatured === true || p.isFeatured === 'true' || p.isFeatured === 1)
        const hotDealsData = allProducts.filter(p => p.isHotDeal === true || p.isHotDeal === 'true' || p.isHotDeal === 1)
        const newArrivalsData = allProducts.filter(p => p.isNewArrival === true || p.isNewArrival === 'true' || p.isNewArrival === 1)
        const bestSellersData = allProducts.filter(p => p.isBestSeller === true || p.isBestSeller === 'true' || p.isBestSeller === 1)
        const bundleData = allProducts.filter(p => p.isBundle === true || p.isBundle === 'true' || p.isBundle === 1)
        const mostPopularData = allProducts.filter(p => p.isMostPopular === true || p.isMostPopular === 'true' || p.isMostPopular === 1)

        const internalPartsData = allProducts.filter(p =>
          p.category?.toLowerCase() === 'internal-parts' ||
          p.category?.toLowerCase() === 'internal parts' ||
          p.isInternalPart === true
        )

        setFeaturedProducts(featuredData)
        setHotDeals(hotDealsData)
        setNewArrivals(newArrivalsData)
        setBestSellers(bestSellersData)
        setBundleProducts(bundleData)
        setMostPopularProducts(mostPopularData)
        setInternalParts(internalPartsData)
      }

      try {
        const categoriesRes = await categoryService.getCategories()
        let categoriesData = []
        if (categoriesRes.data?.data) {
          categoriesData = categoriesRes.data.data
        } else if (Array.isArray(categoriesRes.data)) {
          categoriesData = categoriesRes.data
        } else if (categoriesRes.data?.categories) {
          categoriesData = categoriesRes.data.categories
        }

        const categoryMap = new Map()

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

        categoriesData.forEach(cat => {
          const normalizedName = normalizeCategoryName(cat.name)
          const hasLogo = brandLogos[normalizedName] !== undefined
          if (!hasLogo) return

          const productCount = allProducts.filter(p =>
            p.category === cat.slug ||
            p.category === cat.name ||
            p.categoryId === cat.id
          ).length

          if (categoryMap.has(normalizedName)) {
            const existing = categoryMap.get(normalizedName)
            const finalCount = Math.max(existing.productCount, productCount)
            categoryMap.set(normalizedName, {
              ...existing,
              productCount: finalCount,
              slug: cat.slug || existing.slug
            })
          } else {
            categoryMap.set(normalizedName, {
              ...cat,
              name: normalizedName,
              productCount,
              id: cat.id || Math.random() * 1000,
              slug: cat.slug || normalizedName.toLowerCase()
            })
          }
        })

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

        setCategories(mergedCategories)

      } catch (error) {
        console.warn('Failed to fetch categories:', error)
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

  // ✅ FIXED: Filter by product NAME (since DB products don't have subCategory/type fields)
  const filteredInternalParts = internalParts.filter((p) => {
    if (!activeInternalTab) return true

    const name = (p.name || '').toLowerCase()
    const sub = (p.subCategory || p.type || '').toLowerCase()

    if (activeInternalTab === 'needle-bar-bush') {
      return (
        name.includes('needle bar') ||
        name.includes('bush') ||
        sub.includes('needle-bar') ||
        sub.includes('bush')
      )
    }
    if (activeInternalTab === 'connecting-rods') {
      return name.includes('connecting') || name.includes('rod') || sub.includes('connecting')
    }
    if (activeInternalTab === 'looper-assembly') {
      return name.includes('looper') || sub.includes('looper')
    }
    return true
  })

  return (
    <div className="w-full relative">
      {/* Hero Banner Carousel */}
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
                    {t('home.hero.slide1Title')}
                  </h1>
                  <p className="text-lg md:text-xl text-white/90 mb-6">
                    {t('home.hero.slide1Subtitle')}
                  </p>
                  <Link
                    to="/products"
                    className="inline-block px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
                  >
                    {t('home.shopNow')}
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
                  <div className="text-sm uppercase tracking-wider text-green-400 mb-2">
                    {t('home.premiumQuality')}
                  </div>
                  <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">
                    {t('home.hero.slide2Title')}
                  </h1>
                  <p className="text-lg md:text-xl text-white/90 mb-6">
                    {t('home.hero.slide2Subtitle')}
                  </p>
                  <Link
                    to="/products?category=jack"
                    className="inline-block px-8 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors shadow-lg hover:shadow-xl"
                  >
                    {t('home.hero.slide2Cta')}
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
                  <div className="text-sm uppercase tracking-wider text-yellow-400 mb-2">
                    {t('home.premiumQuality')}
                  </div>
                  <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">
                    {t('home.hero.slide3Title')}
                  </h1>
                  <p className="text-lg md:text-xl text-white/90 mb-6">
                    {t('home.hero.slide3Subtitle')}
                  </p>
                  <Link
                    to="/products?category=heavy-duty"
                    className="inline-block px-8 py-3 bg-orange-600 text-white rounded-lg font-semibold hover:bg-orange-700 transition-colors shadow-lg hover:shadow-xl"
                  >
                    {t('home.hero.slide3Cta')}
                  </Link>
                </div>
              </div>
            </div>
          </SwiperSlide>
        </Swiper>
      </section>

      {/* ====== SHOP BY CATEGORY ====== */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center">
            <FiPackage className="text-blue-600 mr-2" size={28} />
            {t('home.shopByCategory')}
          </h2>
          <Link to="/products" className="text-blue-600 hover:underline flex items-center text-sm">
            {t('home.viewAllCategories')} <FiChevronRight className="ml-1" />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {categoriesToShow.map((category) => {
            const logoUrl = brandLogos[category.name] || null
            const bgColor = brandColors[category.name] || 'bg-blue-600'

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
          { icon: FiTruck, label: t('home.freeShipping'), desc: t('home.onOrdersOver') },
          { icon: FiShield, label: t('home.securePayment'), desc: t('home.secureCheckout') },
          { icon: FiRefreshCw, label: t('home.easyReturns'), desc: t('home.returnPolicy') },
          { icon: FiAward, label: t('home.qualityGuarantee'), desc: t('home.genuineParts') },
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
            <div className="relative z-10 container-custom py-10 md:py-14">
              <div className="max-w-2xl">
                <div className="inline-flex items-center gap-2 bg-cyan-500/20 backdrop-blur-sm text-cyan-300 px-4 py-1.5 rounded-full text-sm font-medium mb-4 border border-cyan-400/30">
                  <FiCpu className="text-cyan-400" size={16} />
                  <span>{t('home.newInnovation')}</span>
                </div>
                <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold text-white mb-3 leading-tight">
                  <span className="block text-sm md:text-base font-normal text-cyan-300/80 uppercase tracking-wider mb-1">
                    {t('home.smartHeavyDuty.tagline')}
                  </span>
                  {t('home.smartHeavyDuty.title')} <br className="hidden sm:block" />
                  <span className="bg-gradient-to-r from-cyan-300 to-blue-300 bg-clip-text text-transparent">
                    {t('home.smartHeavyDuty.subtitle')}
                  </span>
                </h2>
                <p className="text-white/80 text-sm md:text-base lg:text-lg mb-6 max-w-xl leading-relaxed">
                  {t('home.smartHeavyDuty.description')}
                </p>
                <Link
                  to="/products/hd9120-presale"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-lg hover:from-cyan-600 hover:to-blue-700 transition-all duration-300 shadow-lg"
                >
                  <FiSmartphone size={18} />
                  <span>{t('home.smartHeavyDuty.cta')}</span>
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
            {t('home.shopByMachineParts')}
          </h2>
          <p className="text-gray-500 text-sm md:text-base">
            {t('home.shopByMachinePartsSubtitle')}
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
                  />
                ) : (
                  <div className={`w-full h-full bg-gradient-to-br ${part.color} flex items-center justify-center`}>
                    <span className="text-white text-6xl font-bold">{part.name.charAt(0)}</span>
                  </div>
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-70 group-hover:opacity-80 transition-opacity duration-300"></div>

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
                    <span className="inline-block px-4 py-1.5 bg-white/20 backdrop-blur-sm text-white text-xs font-semibold rounded-full border border-white/30">
                      {t('home.shopNow')} →
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
            className="relative min-h-[280px] md:min-[320px] flex items-center"
            style={{
              backgroundImage: `url(${sewingMonthBanner})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat'
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-900/80 via-purple-800/60 to-pink-700/40"></div>
            <div className="relative z-10 container-custom py-10 md:py-14">
              <div className="max-w-2xl">
                <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white px-4 py-1.5 rounded-full text-sm font-medium mb-4 border border-white/10">
                  <FiCalendar className="text-yellow-300" size={16} />
                  <span>{t('home.sewingMonth.date')}</span>
                </div>
                <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold text-white mb-3 leading-tight">
                  {t('home.sewingMonth.title')} <br className="hidden sm:block" />
                  <span className="bg-gradient-to-r from-yellow-300 to-pink-300 bg-clip-text text-transparent">
                    {t('home.sewingMonth.highlight')}
                  </span>
                </h2>
                <p className="text-white/90 text-sm md:text-base lg:text-lg mb-6 max-w-xl leading-relaxed">
                  {t('home.sewingMonth.description')}
                </p>
                <Link
                  to="/products?category=sewing-machines"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-semibold rounded-lg hover:from-yellow-500 hover:to-orange-600 transition-all duration-300 shadow-lg"
                >
                  <span>{t('home.shopNow')}</span>
                  <FiChevronRight size={18} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ====== HOT COLLECTIONS SECTION ====== */}
      <section className="mb-10 px-4 md:px-6 lg:px-8">
        <div className="border-b border-gray-200 pb-2 mb-6">
          <h2 className="text-2xl font-normal text-gray-800 inline-block border-b-2 border-lime-500 pb-2">
            {t('home.hotCollections')}
          </h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {[
            { title: t('home.hotTiles.feedDog'), image: feedDogImg, slug: 'feed-dog' },
            { title: t('home.hotTiles.bobbin'), image: bobbinImg, slug: 'bobbin' },
            { title: t('home.hotTiles.bobbinCase'), image: bobbinCasesImg, slug: 'bobbin-case' },
            { title: t('home.hotTiles.hookSets'), image: hookSetsImg, slug: 'hook-sets' },
            { title: t('home.hotTiles.needlePlates'), image: needlePlatesImg, slug: 'needle-plates' },
          ].map((item, idx) => (
            <Link
              key={idx}
              to={`/products?category=${item.slug}`}
              className="bg-white border border-lime-400 rounded-md p-3 flex items-center justify-between shadow-sm hover:shadow-md transition-shadow h-24 w-full"
            >
              <div className="w-1/2 h-full flex items-center justify-center p-1">
                <img
                  src={item.image}
                  alt={item.title}
                  className="max-h-full max-w-full object-contain"
                />
              </div>
              <div className="w-1/2 pl-2 text-left">
                <span className="text-xs font-semibold text-gray-800 tracking-wide leading-tight block">
                  {item.title}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ====== INTERNAL PARTS SECTION ====== */}
      <section className="mb-12 px-4 md:px-6 lg:px-8 pb-8 border-b border-gray-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-6">
            <h2 className="text-2xl font-bold text-gray-800 border-b-2 border-lime-500 pb-1">
              {t('home.internalParts')}
            </h2>

            <div className="flex items-center gap-2 overflow-x-auto py-1">
              {internalPartsTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveInternalTab(tab.id)}
                  className={`px-4 py-1.5 text-sm font-medium rounded-full transition-colors whitespace-nowrap ${activeInternalTab === tab.id
                    ? 'bg-lime-500 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <Link
            to="/products?category=internal-parts"
            className="text-gray-600 hover:text-gray-900 text-sm font-medium flex items-center gap-1 self-end md:self-auto"
          >
            {t('home.seeAll')} <FiChevronRight size={16} />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {/* ✅ FIXED: Use filtered results, or fallback with correct images */}
          {(filteredInternalParts.length > 0 ? filteredInternalParts : INTERNAL_PARTS_FALLBACK)
            .slice(0, 4)
            .map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-lg p-3 border border-gray-200 flex gap-3 items-center shadow-sm hover:shadow-md transition-shadow relative"
              >
                <div className="w-24 h-24 flex-shrink-0 bg-gray-50 rounded overflow-hidden">
                  <img
                    src={product.image || product.images?.[0] || gaugeSetImg}
                    alt={product.name}
                    className="w-full h-full object-contain p-2"
                    onError={(e) => {
                      e.target.onerror = null
                      e.target.src = gaugeSetImg
                    }}
                  />
                </div>

                <div className="flex-1 min-w-0 pr-8">
                  <h3 className="text-xs font-bold text-blue-700 uppercase line-clamp-2 mb-1 leading-tight">
                    {product.name}
                  </h3>
                  <div className="text-lime-600 font-bold text-base">
                    Rs. {Number(product.price).toFixed(2)}
                  </div>
                  <span className="text-[10px] text-gray-400 block">
                    {t('home.inclTaxes')}
                  </span>
                </div>

                {/* ✅ FIXED: If real product (has numeric id), go to product page.
                    If fallback (string id), go to filtered products list. */}
                {typeof product.id === 'number' ? (
                  <Link
                    to={`/products/${product.id}`}
                    className="absolute right-3 bottom-3 w-8 h-8 rounded-full bg-lime-500 text-white flex items-center justify-center hover:bg-lime-600 transition-colors shadow-sm"
                    title="View Product"
                  >
                    <FiChevronRight size={18} />
                  </Link>
                ) : (
                  <Link
                    to="/products?category=needle"
                    className="absolute right-3 bottom-3 w-8 h-8 rounded-full bg-lime-500 text-white flex items-center justify-center hover:bg-lime-600 transition-colors shadow-sm"
                    title="Browse Internal Parts"
                  >
                    <FiChevronRight size={18} />
                  </Link>
                )}
              </div>
            ))}
        </div>
      </section>

      {/* ====== MOST POPULAR SECTION ====== */}
      {mostPopularProducts.length > 0 && (
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center">
              <FiTrendingUp className="text-rose-500 mr-2" size={28} />
              <span className="bg-rose-500 text-white text-xs px-2 py-1 rounded mr-2">
                {t('home.popular')}
              </span>
              {t('home.mostPopular')}
            </h2>
            <Link to="/products?sort=most-popular" className="text-blue-600 hover:underline flex items-center text-sm">
              {t('home.viewAll')} <FiChevronRight className="ml-1" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {mostPopularProducts.slice(0, 4).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* ====== GAUGE SETS SECTION ====== */}
      <section className="mb-12 border-b border-gray-200 pb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800 border-b-2 border-lime-500 pb-1 inline-block">
            {t('home.gaugeSets')}
          </h2>
          <Link
            to="/products?category=gauge-sets"
            className="text-gray-600 hover:text-gray-900 text-sm font-medium flex items-center gap-1"
          >
            {t('home.seeAll')} <FiChevronRight size={16} />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 items-start">
          {/* Category Card */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm flex flex-col items-center justify-between p-4 h-[240px]">
            <div className="w-full flex-1 flex items-center justify-center p-2">
              <img
                src={gaugeSetImg}
                alt="Gauge Sets Category"
                className="max-h-20 max-w-full object-contain"
              />
            </div>
            <div className="w-full pt-2 flex justify-center">
              <Link
                to="/products?category=gauge-sets"
                className="bg-[#9ec828] hover:bg-[#8eb81f] text-white font-bold py-2 px-5 rounded-2xl text-center text-xs leading-snug shadow-sm inline-block"
              >
                {t('home.shop')}<br />{t('home.now')}
              </Link>
            </div>
          </div>

          {/* Product Cards */}
          {gaugeSetsData.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between overflow-hidden"
            >
              <div className="p-3 pb-1">
                <h3 className="text-xs font-bold text-blue-800 line-clamp-2 leading-snug min-h-[2.25rem]">
                  {product.name}
                </h3>
              </div>

              <div className="w-full aspect-square bg-white flex items-center justify-center p-3">
                <img
                  src={product.image}
                  alt={product.name}
                  className="max-h-full max-w-full object-contain"
                />
              </div>

              <div className="p-3 pt-2 border-t border-gray-100 mt-auto">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-lime-600 font-bold text-base">
                      Rs. {Number(product.price).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </div>
                    <span className="text-[10px] text-gray-400 block">
                      {t('home.inclTaxes')}
                    </span>
                  </div>

                  <button
                    onClick={() => handleAddToCart(product)}
                    className="w-8 h-8 rounded-full bg-lime-500 hover:bg-lime-600 text-white flex items-center justify-center transition-colors shadow-sm"
                    title={t('product.addToCart')}
                  >
                    <FiShoppingCart size={16} />
                  </button>
                </div>

                <div className="mt-2 pt-2 border-t border-gray-100 text-center">
                  <button
                    type="button"
                    onClick={() => handleQuickView(product)}
                    className="inline-flex items-center gap-1 text-[11px] text-gray-500 hover:text-gray-800 transition-colors"
                  >
                    <FiEye size={13} /> {t('home.view')}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ====== BUNDLE & SAVE SECTION ====== */}
      {bundleProducts.length > 0 && (
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center">
              <FiGift className="text-amber-500 mr-2" size={28} />
              {t('home.bundleAndSave')}
            </h2>
            <Link to="/products?sort=bundle" className="text-blue-600 hover:underline flex items-center text-sm">
              {t('home.viewAll')} <FiChevronRight className="ml-1" />
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
              <span className="bg-red-500 text-white text-xs px-2 py-1 rounded mr-2">
                {t('home.hot')}
              </span>
              {t('home.hotCollection')}
            </h2>
            <Link to="/products?sort=hot-deals" className="text-blue-600 hover:underline flex items-center text-sm">
              {t('home.viewAll')} <FiChevronRight className="ml-1" />
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
              {t('home.bestSelling')}
            </h2>
            <Link to="/products?sort=best-sellers" className="text-blue-600 hover:underline flex items-center text-sm">
              {t('home.viewAll')} <FiChevronRight className="ml-1" />
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
              <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded mr-2">
                {t('home.new')}
              </span>
              {t('home.newArrivals')}
            </h2>
            <Link to="/products?sort=newest" className="text-blue-600 hover:underline flex items-center text-sm">
              {t('home.viewAll')} <FiChevronRight className="ml-1" />
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
              {t('home.specialOffers')}
            </h2>
            <Link to="/products" className="text-blue-600 hover:underline flex items-center text-sm">
              {t('home.viewAll')} <FiChevronRight className="ml-1" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {featuredProducts.slice(0, 4).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* ====== HOME COUPONS SECTION ====== */}
      <HomeCoupons />

      {/* ====== QUICK VIEW MODAL OVERLAY ====== */}
      {isModalOpen && selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 md:p-8 overflow-hidden">
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 z-10 w-9 h-9 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full flex items-center justify-center transition-colors shadow-sm"
              aria-label="Close modal"
            >
              <FiX size={20} />
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              <div className="w-full h-64 bg-gray-50 rounded-xl overflow-hidden flex items-center justify-center p-4 border border-gray-100">
                <img
                  src={selectedProduct.image || selectedProduct.images?.[0]}
                  alt={selectedProduct.name}
                  className="max-h-full max-w-full object-contain"
                />
              </div>

              <div className="flex flex-col">
                <h3 className="text-lg font-bold text-gray-800 leading-snug mb-3">
                  {selectedProduct.name}
                </h3>

                <div className="text-lime-600 font-bold text-2xl mb-1">
                  Rs. {Number(selectedProduct.price).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </div>
                <span className="text-xs text-gray-400 mb-6 block">
                  {t('home.inclTaxes')}
                </span>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      handleAddToCart(selectedProduct)
                      closeModal()
                    }}
                    className="flex-1 py-3 bg-lime-500 hover:bg-lime-600 text-white font-semibold rounded-lg shadow transition-colors flex items-center justify-center gap-2"
                  >
                    <FiShoppingCart size={18} /> {t('product.addToCart')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Home