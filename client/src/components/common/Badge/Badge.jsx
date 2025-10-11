import React from 'react'

const Badge = ({ 
  children, 
  variant = 'default',
  size = 'md',
  dot = false,
  className = '',
  ...props 
}) => {
  const baseClasses = 'inline-flex items-center font-medium rounded-full'
  
  const variantClasses = {
    default: 'bg-gray-100 text-gray-800',
    primary: 'bg-primary-100 text-primary-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    danger: 'bg-red-100 text-red-800',
    info: 'bg-blue-100 text-blue-800',
    purple: 'bg-purple-100 text-purple-800',
    pink: 'bg-pink-100 text-pink-800',
    indigo: 'bg-indigo-100 text-indigo-800'
  }
  
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-0.5 text-sm',
    lg: 'px-3 py-1 text-base'
  }
  
  const dotClasses = {
    sm: 'w-1.5 h-1.5',
    md: 'w-2 h-2',
    lg: 'w-2.5 h-2.5'
  }

  return (
    <span className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`} {...props}>
      {dot && (
        <span className={`${dotClasses[size]} rounded-full mr-1.5`} style={{ backgroundColor: 'currentColor' }} />
      )}
      {children}
    </span>
  )
}

// Status Badge Component
export const StatusBadge = ({ status, className = '' }) => {
  const statusConfig = {
    active: { variant: 'success', text: 'Active' },
    inactive: { variant: 'default', text: 'Inactive' },
    pending: { variant: 'warning', text: 'Pending' },
    approved: { variant: 'success', text: 'Approved' },
    rejected: { variant: 'danger', text: 'Rejected' },
    completed: { variant: 'success', text: 'Completed' },
    cancelled: { variant: 'danger', text: 'Cancelled' },
    scheduled: { variant: 'info', text: 'Scheduled' },
    in_progress: { variant: 'warning', text: 'In Progress' },
    draft: { variant: 'default', text: 'Draft' },
    published: { variant: 'success', text: 'Published' }
  }

  const config = statusConfig[status] || { variant: 'default', text: status }

  return (
    <Badge variant={config.variant} className={className}>
      {config.text}
    </Badge>
  )
}

// Count Badge Component
export const CountBadge = ({ count, max = 99, variant = 'danger', className = '' }) => {
  const displayCount = count > max ? `${max}+` : count.toString()
  
  return (
    <Badge variant={variant} size="sm" className={className}>
      {displayCount}
    </Badge>
  )
}

export default Badge
