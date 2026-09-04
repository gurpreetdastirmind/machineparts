import React from 'react'

const ProductSkeleton = () => {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="skeleton aspect-square w-full"></div>
      <div className="p-3 space-y-2">
        <div className="skeleton h-4 w-3/4 rounded"></div>
        <div className="skeleton h-3 w-1/2 rounded"></div>
        <div className="flex justify-between items-center">
          <div className="skeleton h-5 w-1/3 rounded"></div>
          <div className="skeleton h-8 w-8 rounded-full"></div>
        </div>
      </div>
    </div>
  )
}

export default ProductSkeleton