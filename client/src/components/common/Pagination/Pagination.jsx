import React from 'react'

const Pagination = ({ 
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  showFirstLast = true,
  showPrevNext = true,
  maxVisiblePages = 5,
  className = '',
  size = 'md'
}) => {
  const sizeClasses = {
    sm: 'px-2 py-1 text-sm',
    md: 'px-3 py-2 text-sm',
    lg: 'px-4 py-2 text-base'
  }

  const getVisiblePages = () => {
    const pages = []
    const halfVisible = Math.floor(maxVisiblePages / 2)
    
    let startPage = Math.max(1, currentPage - halfVisible)
    let endPage = Math.min(totalPages, currentPage + halfVisible)
    
    // Adjust if we're near the beginning or end
    if (endPage - startPage + 1 < maxVisiblePages) {
      if (startPage === 1) {
        endPage = Math.min(totalPages, startPage + maxVisiblePages - 1)
      } else {
        startPage = Math.max(1, endPage - maxVisiblePages + 1)
      }
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i)
    }
    
    return pages
  }

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      onPageChange(page)
    }
  }

  const visiblePages = getVisiblePages()

  if (totalPages <= 1) {
    return null
  }

  return (
    <nav className={`flex items-center justify-between ${className}`}>
      {/* Page Info */}
      <div className="flex items-center text-sm text-gray-700">
        <span>
          Page {currentPage} of {totalPages}
        </span>
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center space-x-1">
        {/* First Page */}
        {showFirstLast && currentPage > 1 && (
          <button
            onClick={() => handlePageChange(1)}
            className={`${sizeClasses[size]} text-gray-500 hover:text-gray-700 hover:bg-gray-100  transition-colors`}
            title="First page"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            </svg>
          </button>
        )}

        {/* Previous Page */}
        {showPrevNext && (
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={`${sizeClasses[size]} text-gray-500 hover:text-gray-700 hover:bg-gray-100  transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent`}
            title="Previous page"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}

        {/* Page Numbers */}
        {visiblePages.map((page) => (
          <button
            key={page}
            onClick={() => handlePageChange(page)}
            className={`${sizeClasses[size]} font-medium  transition-colors ${
              page === currentPage
                ? 'bg-primary-600 text-white'
                : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            {page}
          </button>
        ))}

        {/* Next Page */}
        {showPrevNext && (
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`${sizeClasses[size]} text-gray-500 hover:text-gray-700 hover:bg-gray-100  transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent`}
            title="Next page"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}

        {/* Last Page */}
        {showFirstLast && currentPage < totalPages && (
          <button
            onClick={() => handlePageChange(totalPages)}
            className={`${sizeClasses[size]} text-gray-500 hover:text-gray-700 hover:bg-gray-100  transition-colors`}
            title="Last page"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
            </svg>
          </button>
        )}
      </div>
    </nav>
  )
}

// Simple Pagination Component
export const SimplePagination = ({ 
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  className = ''
}) => {
  return (
    <div className={`flex items-center justify-center space-x-2 ${className}`}>
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300  hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Previous
      </button>
      
      <span className="px-3 py-2 text-sm text-gray-700">
        {currentPage} of {totalPages}
      </span>
      
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300  hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Next
      </button>
    </div>
  )
}

export default Pagination
