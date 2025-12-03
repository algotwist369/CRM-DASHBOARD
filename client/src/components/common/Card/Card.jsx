import React from 'react'

const Card = ({ 
  children, 
  title, 
  subtitle,
  header,
  footer,
  variant = 'default',
  padding = 'default',
  shadow = 'default',
  className = '',
  onClick,
  ...props 
}) => {
  const baseClasses = 'bg-white  border border-gray-200'
  
  const variantClasses = {
    default: 'bg-white',
    primary: 'bg-primary-50 border-primary-200',
    success: 'bg-green-50 border-green-200',
    warning: 'bg-yellow-50 border-yellow-200',
    danger: 'bg-red-50 border-red-200',
    info: 'bg-blue-50 border-blue-200'
  }
  
  const paddingClasses = {
    none: '',
    sm: 'p-4',
    default: 'p-6',
    lg: 'p-8'
  }
  
  const shadowClasses = {
    none: '',
    sm: '',
    default: 'shadow',
    lg: 'shadow-lg',
    xl: 'shadow-xl'
  }
  
  const interactiveClasses = onClick ? 'cursor-pointer hover:shadow-md transition-shadow duration-200' : ''
  
  const cardClasses = `${baseClasses} ${variantClasses[variant]} ${shadowClasses[shadow]} ${interactiveClasses} ${className}`

  return (
    <div className={cardClasses} onClick={onClick} {...props}>
      {/* Header */}
      {(title || subtitle || header) && (
        <div className="border-b border-gray-200 pb-4 mb-4">
          {header ? (
            header
          ) : (
            <div>
              {title && (
                <h3 className="text-lg font-semibold text-gray-900">
                  {title}
                </h3>
              )}
              {subtitle && (
                <p className="mt-1 text-sm text-gray-600">
                  {subtitle}
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Content */}
      <div className={paddingClasses[padding]}>
        {children}
      </div>

      {/* Footer */}
      {footer && (
        <div className="border-t border-gray-200 pt-4 mt-4">
          {footer}
        </div>
      )}
    </div>
  )
}

// Card Header Component
export const CardHeader = ({ children, className = '' }) => (
  <div className={`border-b border-gray-200 pb-4 mb-4 ${className}`}>
    {children}
  </div>
)

// Card Body Component
export const CardBody = ({ children, className = '' }) => (
  <div className={`${className}`}>
    {children}
  </div>
)

// Card Footer Component
export const CardFooter = ({ children, className = '' }) => (
  <div className={`border-t border-gray-200 pt-4 mt-4 ${className}`}>
    {children}
  </div>
)

export default Card
