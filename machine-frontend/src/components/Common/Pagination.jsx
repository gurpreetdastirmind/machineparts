import React from 'react'
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi'

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const getPageNumbers = () => {
    const pages = []
    const maxVisible = 5
    const halfVisible = Math.floor(maxVisible / 2)

    let start = Math.max(1, currentPage - halfVisible)
    let end = Math.min(totalPages, start + maxVisible - 1)

    if (end - start < maxVisible - 1) {
      start = Math.max(1, end - maxVisible + 1)
    }

    for (let i = start; i <= end; i++) {
      pages.push(i)
    }

    return pages
  }

  if (totalPages <= 1) return null

  return (
    <div className="flex items-center justify-center gap-1">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <FiChevronLeft size={18} />
      </button>

      {currentPage > 3 && (
        <>
          <button
            onClick={() => onPageChange(1)}
            className="px-3 py-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            1
          </button>
          <span className="px-2 text-gray-500">...</span>
        </>
      )}

      {getPageNumbers().map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`px-3 py-1 rounded-lg transition-colors ${
            currentPage === page
              ? 'bg-blue-600 text-white'
              : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
          }`}
        >
          {page}
        </button>
      ))}

      {currentPage < totalPages - 2 && (
        <>
          <span className="px-2 text-gray-500">...</span>
          <button
            onClick={() => onPageChange(totalPages)}
            className="px-3 py-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            {totalPages}
          </button>
        </>
      )}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <FiChevronRight size={18} />
      </button>
    </div>
  )
}

export default Pagination