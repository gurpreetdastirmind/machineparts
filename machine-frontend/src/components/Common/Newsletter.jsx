import React, { useState } from 'react'
import { FiSend } from 'react-icons/fi'
import toast from 'react-hot-toast'

const Newsletter = () => {
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
      // API call to subscribe
      await new Promise(resolve => setTimeout(resolve, 1000))
      toast.success('Subscribed successfully!')
      setEmail('')
    } catch (error) {
      toast.error('Failed to subscribe')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg p-8 text-white">
      <div className="max-w-2xl mx-auto text-center">
        <h3 className="text-2xl font-bold mb-2">Subscribe to our Newsletter</h3>
        <p className="text-blue-100 mb-4">Get the latest updates and offers directly in your inbox.</p>
        <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            className="flex-1 px-4 py-2 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-white"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-white text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <FiSend size={18} />
            Subscribe
          </button>
        </form>
      </div>
    </div>
  )
}

export default Newsletter
