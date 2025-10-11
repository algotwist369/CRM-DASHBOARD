import React from 'react'

const LoadingSkeleton = ({ 
  variant = 'text',
  width = '100%',
  height = '1rem',
  className = '',
  lines = 1
}) => {
  const baseClasses = 'animate-pulse bg-gray-200 rounded'
  
  const variantClasses = {
    text: 'h-4',
    title: 'h-6',
    avatar: 'rounded-full',
    button: 'h-10',
    card: 'h-32',
    image: 'h-48'
  }

  if (lines > 1) {
    return (
      <div className={className}>
        {[...Array(lines)].map((_, index) => (
          <div
            key={index}
            className={`${baseClasses} ${variantClasses[variant]} ${
              index < lines - 1 ? 'mb-2' : ''
            }`}
            style={{ 
              width: index === lines - 1 ? '75%' : width,
              height: variant === 'text' ? '1rem' : height
            }}
          />
        ))}
      </div>
    )
  }

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      style={{ width, height }}
    />
  )
}

// Predefined skeleton components
export const TextSkeleton = ({ lines = 3, className = '' }) => (
  <LoadingSkeleton variant="text" lines={lines} className={className} />
)

export const TitleSkeleton = ({ className = '' }) => (
  <LoadingSkeleton variant="title" width="60%" className={className} />
)

export const AvatarSkeleton = ({ size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-20 h-20'
  }
  
  return (
    <LoadingSkeleton 
      variant="avatar" 
      className={`${sizeClasses[size]} ${className}`}
    />
  )
}

export const CardSkeleton = ({ className = '' }) => (
  <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
    <div className="flex items-center mb-4">
      <AvatarSkeleton size="md" className="mr-3" />
      <div className="flex-1">
        <TitleSkeleton />
        <TextSkeleton lines={1} className="mt-2" />
      </div>
    </div>
    <TextSkeleton lines={2} />
  </div>
)

export const TableSkeleton = ({ rows = 5, columns = 4, className = '' }) => (
  <div className={`bg-white rounded-lg shadow overflow-hidden ${className}`}>
    <div className="animate-pulse">
      {/* Header */}
      <div className="h-12 bg-gray-200"></div>
      {/* Rows */}
      {[...Array(rows)].map((_, i) => (
        <div key={i} className="h-16 bg-gray-100 border-t border-gray-200 flex items-center px-6">
          {[...Array(columns)].map((_, j) => (
            <div key={j} className="flex-1">
              <div className="h-4 bg-gray-300 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      ))}
    </div>
  </div>
)

export default LoadingSkeleton
