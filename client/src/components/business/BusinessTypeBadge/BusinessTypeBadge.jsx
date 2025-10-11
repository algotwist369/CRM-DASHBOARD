import React from 'react'
import { Badge } from '../../common'

const BusinessTypeBadge = ({ 
  type, 
  size = 'md',
  showIcon = true,
  className = ''
}) => {
  const typeConfig = {
    salon: {
      label: 'Salon',
      color: 'pink',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" />
        </svg>
      ),
      description: 'Hair salon and beauty services'
    },
    spa: {
      label: 'Spa',
      color: 'green',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      ),
      description: 'Wellness and relaxation services'
    },
    hotel: {
      label: 'Hotel',
      color: 'blue',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
      description: 'Hotel and accommodation services'
    }
  }

  const config = typeConfig[type] || {
    label: type || 'Unknown',
    color: 'default',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
    description: 'Business type not specified'
  }

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-0.5',
    lg: 'text-base px-3 py-1'
  }

  const iconSizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  }

  return (
    <Badge 
      variant={config.color} 
      size={size}
      className={`flex items-center gap-1 ${className}`}
    >
      {showIcon && (
        <span className={iconSizeClasses[size]}>
          {config.icon}
        </span>
      )}
      {config.label}
    </Badge>
  )
}

// Business Type Selector Component
export const BusinessTypeSelector = ({ 
  selectedType,
  onTypeSelect,
  className = ''
}) => {
  const types = [
    { value: 'salon', label: 'Salon', icon: '✂️' },
    { value: 'spa', label: 'Spa', icon: '🧘' },
    { value: 'hotel', label: 'Hotel', icon: '🏨' }
  ]

  return (
    <div className={`space-y-3 ${className}`}>
      <h3 className="text-sm font-medium text-gray-900">Business Type</h3>
      <div className="grid grid-cols-1 gap-2">
        {types.map((type) => (
          <button
            key={type.value}
            onClick={() => onTypeSelect(type.value)}
            className={`p-3 text-left border rounded-lg transition-all duration-200 ${
              selectedType === type.value
                ? 'bg-primary-50 border-primary-300 ring-2 ring-primary-200'
                : 'bg-white border-gray-200 hover:border-primary-300 hover:bg-primary-50'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">{type.icon}</span>
              <div>
                <p className="font-medium text-gray-900">{type.label}</p>
                <p className="text-sm text-gray-500">
                  {type.value === 'salon' && 'Hair salon and beauty services'}
                  {type.value === 'spa' && 'Wellness and relaxation services'}
                  {type.value === 'hotel' && 'Hotel and accommodation services'}
                </p>
              </div>
              {selectedType === type.value && (
                <svg className="w-5 h-5 text-primary-600 ml-auto" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

// Business Type Display Component
export const BusinessTypeDisplay = ({ 
  type, 
  showDescription = false,
  className = ''
}) => {
  const typeConfig = {
    salon: { label: 'Salon', icon: '✂️', description: 'Hair salon and beauty services' },
    spa: { label: 'Spa', icon: '🧘', description: 'Wellness and relaxation services' },
    hotel: { label: 'Hotel', icon: '🏨', description: 'Hotel and accommodation services' }
  }

  const config = typeConfig[type] || { 
    label: type || 'Unknown', 
    icon: '🏢', 
    description: 'Business type not specified' 
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span className="text-lg">{config.icon}</span>
      <div>
        <p className="font-medium text-gray-900">{config.label}</p>
        {showDescription && (
          <p className="text-sm text-gray-500">{config.description}</p>
        )}
      </div>
    </div>
  )
}

export default BusinessTypeBadge
