import React, { useState } from 'react'
import { Link } from 'react-router-dom'
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

const Footer = () => {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubscribe = async (e) => {
    e.preventDefault()
    if (!email) {
      toast.error('Please enter your email')
      return
    }
    setLoading(true)
    try {
      // Call API to subscribe
      // await newsletterService.subscribe(email)
      toast.success('Subscribed successfully!')
      setEmail('')
    } catch (error) {
      toast.error('Failed to subscribe')
    } finally {
      setLoading(false)
    }
  }

  const footerLinks = {
    'Quick Links': [
      { name: 'About Us', path: '/about' },
      { name: 'Contact Us', path: '/contact' },
      { name: 'FAQs', path: '/faqs' },
      { name: 'Blog', path: '/blog' },
    ],
    'Categories': [
      { name: 'Sewing Parts', path: '/products?category=sewing-parts' },
      { name: 'Cutting', path: '/products?category=cutting' },
      { name: 'Fusing', path: '/products?category=fusing' },
      { name: 'Steam Iron', path: '/products?category=steam-iron' },
    ],
    'Customer Service': [
      { name: 'Privacy Policy', path: '/privacy' },
      { name: 'Terms & Conditions', path: '/terms' },
      { name: 'Shipping Policy', path: '/shipping' },
      { name: 'Return Policy', path: '/returns' },
    ],
  }

  const paymentMethods = [
    { name: 'Visa', icon: '💳' },
    { name: 'Mastercard', icon: '💳' },
    { name: 'Razorpay', icon: '💰' },
    { name: 'UPI', icon: '📱' },
  ]

  return (
    <footer className="bg-gray-900 text-gray-300">
      {/* Main Footer */}
      <div className="container-custom py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <h3 className="text-white font-bold text-xl mb-4">MachineParts</h3>
            <p className="text-sm leading-relaxed mb-4">
              Your one-stop destination for all sewing machine parts and accessories. 
              Quality products at competitive prices.
            </p>
            <div className="space-y-2 text-sm">
              <p className="flex items-center gap-2">
                <FiMapPin className="text-blue-400" />
                <span>123, Industrial Area, Delhi, India</span>
              </p>
              <p className="flex items-center gap-2">
                <FiPhone className="text-blue-400" />
                <span>+91 1234567890</span>
              </p>
              <p className="flex items-center gap-2">
                <FiMail className="text-blue-400" />
                <span>info@machineparts.com</span>
              </p>
            </div>
          </div>

          {/* Quick Links */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="text-white font-semibold mb-4">{title}</h4>
              <ul className="space-y-2">
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

        {/* Newsletter Section */}
        <div className="mt-8 pt-8 border-t border-gray-800">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h4 className="text-white font-semibold text-lg">
                Subscribe to our Newsletter
              </h4>
              <p className="text-sm text-gray-400">
                Get the latest updates and offers directly in your inbox.
              </p>
            </div>
            <form onSubmit={handleSubscribe} className="flex w-full md:w-auto gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="flex-1 md:w-64 px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 focus:outline-none focus:border-blue-500 text-white placeholder-gray-500"
              />
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                <FiSend size={18} />
                Subscribe
              </button>
            </form>
          </div>
        </div>

        {/* Social & Payment */}
        <div className="mt-8 pt-8 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-400">Follow us:</span>
            <div className="flex gap-3">
              <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors">
                <FiFacebook size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors">
                <FiTwitter size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-pink-400 transition-colors">
                <FiInstagram size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-red-400 transition-colors">
                <FiYoutube size={20} />
              </a>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-400">Payment Methods:</span>
            <div className="flex gap-2">
              {paymentMethods.map((method, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-gray-800 rounded text-sm text-white"
                  title={method.name}
                >
                  {method.icon}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 pt-8 border-t border-gray-800 text-center text-sm text-gray-500">
          <p>© {new Date().getFullYear()} MachineParts. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer