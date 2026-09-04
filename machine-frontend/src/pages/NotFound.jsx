import React from 'react'
import { Link } from 'react-router-dom'

const NotFound = () => {
  return (
    <div className="container-custom py-12 flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-800 dark:text-white mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-2">Page Not Found</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-6">The page you're looking for doesn't exist or has been moved</p>
        <Link to="/" className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          Go Back Home
        </Link>
      </div>
    </div>
  )
}

export default NotFound