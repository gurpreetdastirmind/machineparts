import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'  // ✅ ADD
import {
  FiFacebook,
  FiTwitter,
  FiInstagram,
  FiYoutube,
  FiMail,
  FiPhone,
  FiMapPin,
  FiSend
} from 'react-icons/fi'
import toast from 'react-hot-toast'
import machineLogo from '/src/images/logo_footer1.png'

const Footer = () => {
  const { t } = useTranslation()  // ✅ ADD HOOK
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubscribe = async (e) => {
    e.preventDefault()
    if (!email) {
      toast.error(t('footer.enterEmail'))  // ✅ TRANSLATED
      return
    }
    setLoading(true)
    try {
      toast.success(t('footer.subscribeSuccess'))  // ✅ TRANSLATED
      setEmail('')
    } catch (error) {
      toast.error(t('footer.subscribeFailed'))  // ✅ TRANSLATED
    } finally {
      setLoading(false)
    }
  }

  // ✅ Use translation keys for section titles — we use a lookup
  const footerLinks = {
    [t('footer.quickLinks')]: [
      { name: t('footer.aboutUs'), path: '/about' },
      { name: t('footer.contactUs'), path: '/contact' },
      { name: t('footer.faqs'), path: '/faqs' },
      { name: t('footer.blog'), path: '/blog' },
    ],
    [t('footer.categories')]: [
      { name: t('footer.sewingParts'), path: '/products?category=sewing-parts' },
      { name: t('footer.cutting'), path: '/products?category=cutting' },
      { name: t('footer.fusing'), path: '/products?category=fusing' },
      { name: t('footer.steamIron'), path: '/products?category=steam-iron' },
    ],
    [t('footer.customerService')]: [
      { name: t('footer.privacyPolicy'), path: '/privacy' },
      { name: t('footer.termsConditions'), path: '/terms' },
      { name: t('footer.shippingPolicy'), path: '/shipping' },
      { name: t('footer.returnPolicy'), path: '/returns' },
    ],
  }

  const paymentMethods = [
    { name: 'Visa', icon: '💳' },
    { name: 'Mastercard', icon: '💳' },
    { name: 'Razorpay', icon: '💰' },
    { name: 'UPI', icon: '📱' },
  ]

  return (
    <footer className="bg-gray-900 text-gray-300 pt-12 mt-16 md:mt-16 lg:mt-20">
      <div className="container-custom py-12 pl-4 md:pl-6 lg:pl-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* Company Info */}
          <div className="lg:col-span-4">
            <Link to="/" className="inline-block mb-4">
              <img
                src={machineLogo}
                alt="SAINATH IMPEX"
                className="h-24 w-auto object-contain"
                onError={(e) => {
                  e.target.style.display = 'none'
                  const parent = e.target.parentElement
                  if (parent) {
                    parent.innerHTML = `
                      <h3 class="text-white font-bold text-2xl mb-4">SAINATH IMPEX</h3>
                    `
                  }
                }}
              />
            </Link>
            <p className="text-sm leading-relaxed mb-4 max-w-sm">
              {t('footer.description')}  {/* ✅ TRANSLATED */}
            </p>
            <div className="space-y-3 text-sm">
              <p className="flex items-center gap-2">
                <FiMapPin className="text-blue-400 flex-shrink-0" />
                <span>70 Feet Rd, next to COMPUTER CARE CLINIC CORNER SHOWROOM, Jain Colony, Sunder Nagar, Ludhiana, Punjab 141007</span>
              </p>
              <p className="flex items-center gap-2">
                <FiPhone className="text-blue-400 flex-shrink-0" />
                <span>+91 9877087682</span>
              </p>
              <p className="flex items-center gap-2">
                <FiMail className="text-blue-400 flex-shrink-0" />
                <span>sewingmachinesandmachineparts@gmail.com</span>
              </p>
            </div>
          </div>

          {/* Quick Links / Categories / Customer Service */}
          <div className="lg:col-span-8">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
              {Object.entries(footerLinks).map(([title, links]) => (
                <div key={title}>
                  <h4 className="text-white font-semibold text-lg mb-4">{title}</h4>
                  <ul className="space-y-3">
                    {links.map((link) => (
                      <li key={link.name}>
                        <Link
                          to={link.path}
                          className="text-sm hover:text-blue-400 transition-colors"
                        >
                          {link.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Newsletter Section */}
        <div className="mt-16 pt-12 border-t border-gray-800">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h4 className="text-white font-semibold text-lg">
                {t('footer.newsletter')}  {/* ✅ TRANSLATED */}
              </h4>
              <p className="text-sm text-gray-400">
                {t('footer.newsletterMessage')}  {/* ✅ TRANSLATED */}
              </p>
            </div>
            <form onSubmit={handleSubscribe} className="flex w-full md:w-auto gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('footer.enterEmail')}  // ✅ TRANSLATED
                className="flex-1 md:w-80 px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 focus:outline-none focus:border-blue-500 text-white placeholder-gray-500"
              />
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                <FiSend size={18} />
                {t('footer.subscribe')}  {/* ✅ TRANSLATED */}
              </button>
            </form>
          </div>
        </div>

        {/* Social & Payment */}
        <div className="mt-12 pt-12 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-400">
              {t('footer.followUs')}  {/* ✅ TRANSLATED */}
            </span>
            <div className="flex gap-4">
              <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors">
                <FiFacebook size={22} />
              </a>
              <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors">
                <FiTwitter size={22} />
              </a>
              <a href="#" className="text-gray-400 hover:text-pink-400 transition-colors">
                <FiInstagram size={22} />
              </a>
              <a href="#" className="text-gray-400 hover:text-red-400 transition-colors">
                <FiYoutube size={22} />
              </a>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-400">
              {t('footer.paymentMethods')}  {/* ✅ TRANSLATED */}
            </span>
            <div className="flex gap-2">
              {paymentMethods.map((method, index) => (
                <span
                  key={index}
                  className="px-3 py-1.5 bg-gray-800 rounded text-sm text-white"
                  title={method.name}
                >
                  {method.icon}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-12 pt-12 border-t border-gray-800 text-center text-sm text-gray-500">
          <p>© {new Date().getFullYear()} SAINATH IMPEX. {t('footer.allRightsReserved')}</p>
          {/* ✅ TRANSLATED */}
        </div>
      </div>
    </footer>
  )
}

export default Footer