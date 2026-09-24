// frontend/src/pages/Contact.jsx
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'   // ✅ ADD
import {
  FiMapPin,
  FiPhone,
  FiMail,
  FiClock,
  FiSend,
  FiFacebook,
  FiTwitter,
  FiInstagram,
  FiYoutube
} from 'react-icons/fi'
import toast from 'react-hot-toast'
import api from '../services/api'

const Contact = () => {
  const { t } = useTranslation()   // ✅ ADD HOOK
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  })
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.name || !formData.email || !formData.message) {
      toast.error(t('contact.fillRequired'))   // ✅ TRANSLATED
      return
    }

    setLoading(true)
    try {
      const response = await api.post('/contact', formData)

      if (response.data.success) {
        toast.success(t('contact.sendSuccess'))   // ✅ TRANSLATED
        setFormData({
          name: '',
          email: '',
          phone: '',
          subject: '',
          message: ''
        })
      } else {
        toast.error(response.data.message || t('contact.sendFailed'))   // ✅ TRANSLATED
      }
    } catch (error) {
      console.error('Contact form error:', error)
      const errorMsg = error.response?.data?.message || t('contact.sendFailedRetry')   // ✅ TRANSLATED
      toast.error(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  const contactInfo = [
    {
      icon: FiMapPin,
      title: t('contact.visitUs'),   // ✅ TRANSLATED
      // ✅ Address stays as-is (real-world data — no translation needed)
      details: [
        '70 Feet Rd, next to COMPUTER CARE CLINIC CORNER SHOWROOM, Jain Colony, Sunder Nagar',
        'Ludhiana, Punjab 141007',
        'India'
      ],
      color: 'text-blue-600'
    },
    {
      icon: FiPhone,
      title: t('contact.callUs'),    // ✅ TRANSLATED
      details: ['+91 9877087682'],
      color: 'text-green-600'
    },
    {
      icon: FiMail,
      title: t('contact.emailUs'),   // ✅ TRANSLATED
      details: ['sewingmachinesandmachineparts@gmail.com'],
      color: 'text-red-600'
    },
    {
      icon: FiClock,
      title: t('contact.workingHours'),   // ✅ TRANSLATED
      // ✅ Day names use translation — Mon/Sun prefixes come from JSON
      details: [
        `${t('contact.monSat')}: 9:30 AM - 8:00 PM`,
        `${t('contact.sun')}: 10:00 AM - 3:00 PM`
      ],
      color: 'text-purple-600'
    }
  ]

  const socialLinks = [
    { icon: FiFacebook, href: '#', label: 'Facebook', color: 'hover:bg-blue-600' },
    { icon: FiTwitter, href: '#', label: 'Twitter', color: 'hover:bg-blue-400' },
    { icon: FiInstagram, href: '#', label: 'Instagram', color: 'hover:bg-pink-600' },
    { icon: FiYoutube, href: '#', label: 'YouTube', color: 'hover:bg-red-600' },
  ]

  const mapEmbedUrl =
    "https://www.google.com/maps?q=Sainath+Impex,+70+Feet+Rd,+Ludhiana,+Punjab&output=embed"

  const mapsDirectUrl = `https://www.google.com/maps?q=30.924974438819994,75.86963990460228&z=17`

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Page Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-12">
        <div className="container-custom">
          <h1 className="text-4xl font-bold mb-2">
            {t('contact.title')}   {/* ✅ TRANSLATED */}
          </h1>
          <p className="text-blue-100 text-lg">
            {t('contact.subtitle')}   {/* ✅ TRANSLATED */}
          </p>
        </div>
      </div>

      {/* Contact Section */}
      <div className="container-custom py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Info Cards */}
          <div className="lg:col-span-1 space-y-4">
            {contactInfo.map((item, index) => (
              <div
                key={index}
                className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow overflow-hidden"   // ✅ ADD overflow-hidden
              >
                <div className="flex items-start gap-4">
                  <div className={`${item.color} bg-gray-50 p-3 rounded-lg flex-shrink-0`}>   {/* ✅ ADD flex-shrink-0 */}
                    <item.icon size={24} />
                  </div>
                  {/* ✅ ADD: min-w-0 lets this flex child shrink */}
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-gray-800 text-lg">
                      {item.title}
                    </h3>
                    {item.details.map((detail, idx) => (
                      <p
                        key={idx}
                        // ✅ ADD: break-words + break-all ensures long emails/strings wrap
                        className="text-gray-600 text-sm mt-0.5 break-words break-all"
                      >
                        {detail}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            ))}

            {/* Social Links */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="font-semibold text-gray-800 text-lg mb-4">
                {t('contact.followUs')}   {/* ✅ TRANSLATED */}
              </h3>
              <div className="flex gap-3">
                {socialLinks.map((social, index) => (
                  <a
                    key={index}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`p-3 bg-gray-100 rounded-lg text-gray-600 transition-all ${social.color} hover:text-white`}
                    aria-label={social.label}
                  >
                    <social.icon size={20} />
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-md p-6 md:p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                {t('contact.sendMessage')}   {/* ✅ TRANSLATED */}
              </h2>
              <p className="text-gray-600 mb-6">
                {t('contact.sendMessageSubtitle')}   {/* ✅ TRANSLATED */}
              </p>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      {t('contact.fullName')} *   {/* ✅ TRANSLATED */}
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder={t('contact.yourFullName')}   // ✅ TRANSLATED
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      {t('contact.emailAddress')} *   {/* ✅ TRANSLATED */}
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder={t('contact.yourEmail')}   // ✅ TRANSLATED
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                      {t('contact.phoneNumber')}   {/* ✅ TRANSLATED */}
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+91 9876543210"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
                    />
                  </div>
                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                      {t('contact.subject')}   {/* ✅ TRANSLATED */}
                    </label>
                    <input
                      type="text"
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      placeholder={t('contact.subjectPlaceholder')}   // ✅ TRANSLATED
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                    {t('contact.message')} *   {/* ✅ TRANSLATED */}
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows="5"
                    placeholder={t('contact.messagePlaceholder')}   // ✅ TRANSLATED
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition resize-none"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full md:w-auto px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <span className="spinner w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      {t('contact.sending')}   {/* ✅ TRANSLATED */}
                    </>
                  ) : (
                    <>
                      <FiSend size={18} />
                      {t('contact.send')}   {/* ✅ TRANSLATED */}
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Map Section */}
        <div className="mt-12">
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-2xl font-bold text-gray-800">
                {t('contact.findUsHere')}   {/* ✅ TRANSLATED */}
              </h2>
              {/* ✅ ADD break-words so the long address doesn't overflow */}
              <p className="text-gray-600 text-sm mt-1 break-words">
                70 Feet Rd, next to COMPUTER CARE CLINIC CORNER SHOWROOM, Jain Colony, Sunder Nagar, Ludhiana, Punjab 141007
              </p>
              <div className="flex flex-wrap items-center gap-3 mt-2">
                <span className="inline-flex items-center gap-1 text-gray-500 text-xs break-all">
                  <span>📍</span> {t('contact.coordinates')}: 30.924974438819994, 75.86963990460228   {/* ✅ TRANSLATED */}
                </span>
                <a
                  href={mapsDirectUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 text-xs font-medium underline inline-flex items-center gap-1"
                >
                  {t('contact.openInMaps')} →   {/* ✅ TRANSLATED */}
                </a>
              </div>
            </div>
            <div className="aspect-video w-full bg-gray-200">
              <iframe
                src={mapEmbedUrl}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Sainath Impex Location - 70 Feet Rd, Ludhiana"
                className="w-full h-full"
              />
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-800 text-center mb-8">
            {t('contact.faq')}   {/* ✅ TRANSLATED */}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { q: t('contact.faq1Q'), a: t('contact.faq1A') },   /* ✅ TRANSLATED */
              { q: t('contact.faq2Q'), a: t('contact.faq2A') },   /* ✅ TRANSLATED */
              { q: t('contact.faq3Q'), a: t('contact.faq3A') },   /* ✅ TRANSLATED */
              { q: t('contact.faq4Q'), a: t('contact.faq4A') }    /* ✅ TRANSLATED */
            ].map((faq, index) => (
              <div key={index} className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
                <h4 className="font-semibold text-gray-800 text-lg mb-2">
                  {faq.q}
                </h4>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Contact