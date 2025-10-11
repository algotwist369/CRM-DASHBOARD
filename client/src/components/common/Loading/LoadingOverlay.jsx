import React from 'react'
import LoadingSpinner from './LoadingSpinner'

const LoadingOverlay = ({ 
  isLoading, 
  children, 
  text = 'Loading...',
  spinnerSize = 'lg',
  className = ''
}) => {
  if (!isLoading) {
    return children
  }

  return (
    <div className={`relative ${className}`}>
      {children}
      <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
        <div className="text-center">
          <LoadingSpinner size={spinnerSize} />
          {text && (
            <p className="mt-2 text-sm text-gray-600">{text}</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default LoadingOverlay
