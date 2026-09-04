import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { FiChevronRight, FiHome } from 'react-icons/fi'

const Breadcrumb = () => {
  const location = useLocation()
  const pathnames = location.pathname.split('/').filter(x => x)

  if (pathnames.length === 0) return null

  return (
    <nav className="text-sm text-gray-500 mb-4">
      <ol className="flex items-center flex-wrap gap-1">
        <li>
          <Link to="/" className="hover:text-blue-600 flex items-center">
            <FiHome size={14} className="mr-1" />
            Home
          </Link>
        </li>
        {pathnames.map((name, index) => {
          const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`
          const isLast = index === pathnames.length - 1
          const displayName = name.charAt(0).toUpperCase() + name.slice(1).replace(/-/g, ' ')

          return (
            <li key={name} className="flex items-center">
              <FiChevronRight size={12} className="mx-1" />
              {isLast ? (
                <span className="text-gray-800 font-medium">{displayName}</span>
              ) : (
                <Link to={routeTo} className="hover:text-blue-600">
                  {displayName}
                </Link>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

export default Breadcrumb