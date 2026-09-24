// frontend/src/pages/About.jsx
import React, { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'   // ✅ ADD (1 line)
import {
  FiAward,
  FiUsers,
  FiPackage,
  FiClock,
  FiCheckCircle,
  FiTruck,
  FiHeadphones,
  FiShield,
  FiTrendingUp,
  FiHeart,
  FiStar,
  FiGlobe,
  FiArrowRight
} from 'react-icons/fi'

const About = () => {
  const { t } = useTranslation()   // ✅ ADD HOOK
  const statsRef = useRef(null)
  const valuesRef = useRef(null)
  const teamRef = useRef(null)

  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-fadeIn')
          entry.target.classList.remove('opacity-0')
        }
      })
    }, observerOptions)

    const sections = [statsRef.current, valuesRef.current, teamRef.current]
    sections.forEach(section => {
      if (section) observer.observe(section)
    })

    return () => observer.disconnect()
  }, [])

  // ✅ Arrays now use t() — values pulled from JSON
  const stats = [
    { icon: FiUsers, value: '500+', label: t('about.statHappyCustomers'), color: 'from-blue-500 to-blue-600' },
    { icon: FiPackage, value: '10,000+', label: t('about.statProductsSold'), color: 'from-emerald-500 to-emerald-600' },
    { icon: FiAward, value: '50+', label: t('about.statBrandPartners'), color: 'from-purple-500 to-purple-600' },
    { icon: FiClock, value: '10+', label: t('about.statYearsExperience'), color: 'from-amber-500 to-amber-600' },
  ]

  const values = [
    {
      icon: FiCheckCircle,
      title: t('about.valueQualityTitle'),
      description: t('about.valueQualityDesc'),
      color: 'text-blue-600',
      bg: 'bg-blue-50'
    },
    {
      icon: FiShield,
      title: t('about.valueTrustTitle'),
      description: t('about.valueTrustDesc'),
      color: 'text-emerald-600',
      bg: 'bg-emerald-50'
    },
    {
      icon: FiHeadphones,
      title: t('about.valueSupportTitle'),
      description: t('about.valueSupportDesc'),
      color: 'text-purple-600',
      bg: 'bg-purple-50'
    },
    {
      icon: FiTruck,
      title: t('about.valueDeliveryTitle'),
      description: t('about.valueDeliveryDesc'),
      color: 'text-amber-600',
      bg: 'bg-amber-50'
    }
  ]

  // ✅ Team names stay as-is (proper nouns) but role & experience are translated
  const teamMembers = [
    {
      name: 'Mr. Rajesh Kumar',
      role: t('about.teamRajeshRole'),
      experience: t('about.teamRajeshExp'),
      initials: 'RK',
      gradient: 'from-blue-600 to-blue-800'
    },
    {
      name: 'Mrs. Priya Sharma',
      role: t('about.teamPriyaRole'),
      experience: t('about.teamPriyaExp'),
      initials: 'PS',
      gradient: 'from-emerald-600 to-emerald-800'
    },
    {
      name: 'Mr. Amit Patel',
      role: t('about.teamAmitRole'),
      experience: t('about.teamAmitExp'),
      initials: 'AP',
      gradient: 'from-purple-600 to-purple-800'
    },
    {
      name: 'Ms. Sneha Reddy',
      role: t('about.teamSnehaRole'),
      experience: t('about.teamSnehaExp'),
      initials: 'SR',
      gradient: 'from-amber-600 to-amber-800'
    }
  ]

  const achievements = [
    {
      icon: FiTrendingUp,
      title: t('about.achievementLeaderTitle'),
      description: t('about.achievementLeaderDesc'),
      gradient: 'from-blue-500 to-cyan-500'
    },
    {
      icon: FiHeart,
      title: t('about.achievementCustomerTitle'),
      description: t('about.achievementCustomerDesc'),
      gradient: 'from-rose-500 to-pink-500'
    },
    {
      icon: FiStar,
      title: t('about.achievementQualityTitle'),
      description: t('about.achievementQualityDesc'),
      gradient: 'from-amber-500 to-orange-500'
    },
    {
      icon: FiGlobe,
      title: t('about.achievementGlobalTitle'),
      description: t('about.achievementGlobalDesc'),
      gradient: 'from-emerald-500 to-teal-500'
    }
  ]

  // ✅ Brand names stay as-is (proper nouns — never translated)
  const brands = ['JUKI', 'JACK', 'PEGASUS', 'SIRUBA', 'YAMATO', 'BROTHER', 'KANSAI SPECIAL']
  const brandColors = [
    'border-blue-200 bg-blue-50',
    'border-emerald-200 bg-emerald-50',
    'border-purple-200 bg-purple-50',
    'border-amber-200 bg-amber-50',
    'border-rose-200 bg-rose-50',
    'border-cyan-200 bg-cyan-50',
    'border-indigo-200 bg-indigo-50'
  ]

  return (
    <div className="bg-gray-50 min-h-screen overflow-x-hidden">
      {/* ===== HERO SECTION ===== */}
      <section className="relative bg-gradient-to-r from-blue-700 via-blue-600 to-blue-800 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
              <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" strokeWidth="0.5"/>
            </pattern>
            <rect width="100" height="100" fill="url(#grid)" />
          </svg>
        </div>
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-white/5 to-transparent" />
        <div className="container-custom relative py-12 md:py-20">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-1.5 mb-4 text-sm font-medium">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              {t('about.since2014')}   {/* ✅ TRANSLATED */}
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight mb-3">
              {t('about.about')} <span className="text-yellow-300">SAINATH IMPEX</span>   {/* ✅ TRANSLATED */}
            </h1>
            <p className="text-blue-100 text-base md:text-lg max-w-2xl leading-relaxed">
              {t('about.subtitle')}   {/* ✅ TRANSLATED */}
            </p>
            <div className="flex flex-wrap gap-3 mt-6">
              <Link
                to="/products"
                className="inline-flex items-center gap-2 bg-white text-blue-700 px-5 py-2.5 rounded-lg font-semibold hover:bg-blue-50 transition-all shadow-lg hover:shadow-xl"
              >
                {t('about.browseProducts')}   {/* ✅ TRANSLATED */}
                <FiArrowRight />
              </Link>
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 bg-transparent border-2 border-white/50 text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-white/10 transition-all"
              >
                {t('about.getInTouch')}   {/* ✅ TRANSLATED */}
              </Link>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 80L60 73.3C120 66.7 240 53.3 360 46.7C480 40 600 40 720 42.7C840 45.3 960 53.3 1080 56C1200 58.7 1320 56 1380 54.7L1440 53.3V80H1380C1320 80 1200 80 1080 80C960 80 840 80 720 80C600 80 480 80 360 80C240 80 120 80 60 80H0Z" fill="#F9FAFB"/>
          </svg>
        </div>
      </section>

      {/* ===== OUR STORY ===== */}
      <section className="container-custom py-12 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div>
            <div className="inline-flex items-center gap-2 text-blue-600 font-semibold text-sm mb-2">
              <span className="w-8 h-0.5 bg-blue-600" />
              {t('about.ourJourney')}   {/* ✅ TRANSLATED */}
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-3">
              {t('about.journeyTitle')} <span className="text-blue-600">{t('about.journeyHighlight')}</span>   {/* ✅ TRANSLATED */}
            </h2>
            <p className="text-gray-600 leading-relaxed text-sm md:text-base mb-3">
              {t('about.storyP1')}   {/* ✅ TRANSLATED */}
            </p>
            <p className="text-gray-600 leading-relaxed text-sm md:text-base mb-3">
              {t('about.storyP2Before')}
              <span className="font-semibold text-blue-600"> JUKI, JACK, PEGASUS, SIRUBA, YAMATO, BROTHER,</span>
              {' '}{t('about.storyP2And')} <span className="font-semibold text-blue-600">KANSAI SPECIAL</span>. {t('about.storyP2After')}
              {/* ✅ TRANSLATED */}
            </p>
            <p className="text-gray-600 leading-relaxed text-sm md:text-base">
              {t('about.storyP3')}   {/* ✅ TRANSLATED */}
            </p>
            <div className="grid grid-cols-2 gap-3 mt-5">
              {[
                { label: t('about.storyQualityParts'), sub: t('about.storyGenuine'), icon: '🏭' },
                { label: t('about.storyFastGrowth'), sub: t('about.story10Years'), icon: '🚀' },
                { label: t('about.storyTrusted'), sub: t('about.story500Clients'), icon: '🤝' },
                { label: t('about.storyGlobalReach'), sub: t('about.story20Countries'), icon: '🌍' },
              ].map((item, i) => (
                <div key={i} className="bg-white rounded-xl shadow-sm p-3 text-center border border-gray-100 hover:shadow-md transition-shadow">
                  <div className="text-xl mb-0.5">{item.icon}</div>
                  <p className="font-semibold text-gray-800 text-xs">{item.label}</p>
                  <p className="text-xs text-gray-500">{item.sub}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="relative">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-3">
                <div className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl p-5 text-white shadow-xl">
                  <div className="text-3xl font-bold">2014</div>
                  <div className="text-xs opacity-80">{t('about.founded')}</div>   {/* ✅ */}
                </div>
                <div className="bg-white rounded-2xl p-5 shadow-lg border border-gray-100">
                  <div className="text-2xl font-bold text-blue-600">500+</div>
                  <div className="text-xs text-gray-500">{t('about.happyClients')}</div>   {/* ✅ */}
                </div>
                <div className="bg-white rounded-2xl p-5 shadow-lg border border-gray-100">
                  <div className="text-2xl font-bold text-emerald-600">20+</div>
                  <div className="text-xs text-gray-500">{t('about.countriesServed')}</div>   {/* ✅ */}
                </div>
              </div>
              <div className="space-y-3 mt-6">
                <div className="bg-white rounded-2xl p-5 shadow-lg border border-gray-100">
                  <div className="text-2xl font-bold text-purple-600">50+</div>
                  <div className="text-xs text-gray-500">{t('about.brandPartnersSmall')}</div>   {/* ✅ */}
                </div>
                <div className="bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-2xl p-5 text-white shadow-xl">
                  <div className="text-3xl font-bold">10K+</div>
                  <div className="text-xs opacity-80">{t('about.productsSold')}</div>   {/* ✅ */}
                </div>
                <div className="bg-gradient-to-br from-amber-500 to-amber-700 rounded-2xl p-5 text-white shadow-xl">
                  <div className="text-3xl font-bold">10+</div>
                  <div className="text-xs opacity-80">{t('about.yearsExperience')}</div>   {/* ✅ */}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== STATISTICS SECTION ===== */}
      <section ref={statsRef} className="bg-gradient-to-r from-blue-600 to-blue-800 py-12 opacity-0">
        <div className="container-custom">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {stats.map((stat, index) => (
              <div key={index} className="text-center text-white group">
                <div className={`w-12 h-12 md:w-16 md:h-16 mx-auto mb-2 rounded-2xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                  <stat.icon size={24} className="text-white" />
                </div>
                <div className="text-2xl md:text-4xl font-bold">{stat.value}</div>
                <div className="text-blue-100 text-xs md:text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CORE VALUES ===== */}
      <section ref={valuesRef} className="container-custom py-12 md:py-16 opacity-0">
        <div className="text-center mb-8 md:mb-10">
          <div className="inline-flex items-center gap-2 text-blue-600 font-semibold text-sm mb-2">
            <span className="w-8 h-0.5 bg-blue-600" />
            {t('about.whatDrivesUs')}   {/* ✅ TRANSLATED */}
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
            {t('about.coreValues')}   {/* ✅ TRANSLATED */}
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-sm md:text-base">
            {t('about.coreValuesSubtitle')}   {/* ✅ TRANSLATED */}
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {values.map((value, index) => (
            <div
              key={index}
              className={`${value.bg} rounded-2xl p-5 hover:shadow-xl transition-all duration-300 group border border-transparent hover:border-gray-200`}
            >
              <div className={`${value.color} mb-3 group-hover:scale-110 transition-transform`}>
                <value.icon size={30} strokeWidth={1.5} />
              </div>
              <h3 className="text-base md:text-lg font-semibold text-gray-800 mb-1">{value.title}</h3>
              <p className="text-gray-600 text-xs md:text-sm leading-relaxed">{value.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ===== WHY CHOOSE US ===== */}
      <section className="bg-gray-100 py-12 md:py-16">
        <div className="container-custom">
          <div className="text-center mb-8 md:mb-10">
            <div className="inline-flex items-center gap-2 text-blue-600 font-semibold text-sm mb-2">
              <span className="w-8 h-0.5 bg-blue-600" />
              {t('about.whySainath')}   {/* ✅ TRANSLATED */}
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
              {t('about.whyChooseUs')}   {/* ✅ TRANSLATED */}
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-sm md:text-base">
              {t('about.whyChooseUsSubtitle')}   {/* ✅ TRANSLATED */}
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {achievements.map((item, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-5 text-center hover:shadow-xl transition-all duration-300 group border border-gray-100 hover:border-transparent"
              >
                <div className={`w-14 h-14 md:w-16 md:h-16 mx-auto mb-3 rounded-2xl bg-gradient-to-br ${item.gradient} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                  <item.icon size={24} className="text-white" />
                </div>
                <h3 className="font-semibold text-gray-800 text-base md:text-lg mb-0.5">{item.title}</h3>
                <p className="text-gray-600 text-xs md:text-sm">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== TEAM SECTION ===== */}
      <section ref={teamRef} className="container-custom py-12 md:py-16 opacity-0">
        <div className="text-center mb-8 md:mb-10">
          <div className="inline-flex items-center gap-2 text-blue-600 font-semibold text-sm mb-2">
            <span className="w-8 h-0.5 bg-blue-600" />
            {t('about.meetTheTeam')}   {/* ✅ TRANSLATED */}
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
            {t('about.ourLeadership')}   {/* ✅ TRANSLATED */}
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-sm md:text-base">
            {t('about.ourLeadershipSubtitle')}   {/* ✅ TRANSLATED */}
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {teamMembers.map((member, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden group"
            >
              <div className={`bg-gradient-to-br ${member.gradient} p-5 text-center`}>
                <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-white/20 backdrop-blur-sm mx-auto flex items-center justify-center text-white text-2xl md:text-3xl font-bold border-4 border-white/30 group-hover:scale-110 transition-transform">
                  {member.initials}
                </div>
              </div>
              <div className="p-4 md:p-6 text-center">
                <h3 className="font-semibold text-gray-800 text-base md:text-lg">{member.name}</h3>
                <p className="text-blue-600 text-xs md:text-sm font-medium">{member.role}</p>
                <p className="text-gray-500 text-xs mt-1">{member.experience}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ===== BRAND PARTNERS ===== */}
      <section className="bg-white py-12 md:py-16 border-t border-gray-100">
        <div className="container-custom">
          <div className="text-center mb-8 md:mb-10">
            <div className="inline-flex items-center gap-2 text-blue-600 font-semibold text-sm mb-2">
              <span className="w-8 h-0.5 bg-blue-600" />
              {t('about.ourPartners')}   {/* ✅ TRANSLATED */}
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
              {t('about.brandPartners')}   {/* ✅ TRANSLATED */}
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-sm md:text-base">
              {t('about.brandPartnersSubtitle')}   {/* ✅ TRANSLATED */}
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3 md:gap-4">
            {brands.map((brand, index) => (
              <div
                key={index}
                className={`rounded-xl p-3 md:p-4 text-center border-2 ${brandColors[index % brandColors.length]} hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-default`}
              >
                <div className="font-bold text-gray-700 text-xs md:text-sm">{brand}</div>
                <div className="text-xs text-gray-400 mt-0.5">★ {t('about.partner')}</div>   {/* ✅ TRANSLATED */}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA SECTION ===== */}
      <section className="relative bg-gradient-to-r from-blue-700 via-blue-600 to-blue-800 py-12 md:py-16 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <pattern id="grid2" width="10" height="10" patternUnits="userSpaceOnUse">
              <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" strokeWidth="0.5"/>
            </pattern>
            <rect width="100" height="100" fill="url(#grid2)" />
          </svg>
        </div>
        <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-white/5 to-transparent" />
        <div className="absolute bottom-0 left-0 w-1/4 h-1/2 bg-gradient-to-r from-white/5 to-transparent rounded-r-full" />
        <div className="container-custom relative text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
            {t('about.readyToWork')}   {/* ✅ TRANSLATED */}
          </h2>
          <p className="text-blue-100 text-base md:text-lg mb-6 max-w-2xl mx-auto">
            {t('about.readyMessage')}   {/* ✅ TRANSLATED */}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/products"
              className="inline-flex items-center gap-2 px-6 md:px-8 py-2.5 md:py-3 bg-white text-blue-700 rounded-xl font-semibold hover:bg-blue-50 transition-all shadow-lg hover:shadow-xl"
            >
              {t('about.browseProducts')}   {/* ✅ TRANSLATED */}
              <FiArrowRight />
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 px-6 md:px-8 py-2.5 md:py-3 bg-transparent text-white border-2 border-white/50 rounded-xl font-semibold hover:bg-white/10 transition-all"
            >
              {t('about.contactUs')}   {/* ✅ TRANSLATED */}
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

export default About