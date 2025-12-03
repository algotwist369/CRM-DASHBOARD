import React, { useState } from 'react'
import { Badge, Button, Input } from '../../common'

const ServiceSelector = ({ 
  services = [],
  selectedServices = [],
  onServiceSelect,
  onServiceRemove,
  multiple = false,
  showPrices = true,
  showDuration = true,
  showDescription = true,
  disabled = false,
  className = ''
}) => {
  const [searchTerm, setSearchTerm] = useState('')

  const filteredServices = services.filter(service =>
    service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    service.category?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleServiceClick = (service) => {
    if (disabled) return

    if (multiple) {
      const isSelected = selectedServices.some(s => s.id === service.id)
      if (isSelected) {
        onServiceRemove(service)
      } else {
        onServiceSelect(service)
      }
    } else {
      onServiceSelect(service)
    }
  }

  const isServiceSelected = (service) => {
    return selectedServices.some(s => s.id === service.id)
  }

  const getServiceClasses = (service) => {
    const isSelected = isServiceSelected(service)
    const baseClasses = 'w-full p-4 text-left border  transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2'
    
    if (disabled) {
      return `${baseClasses} bg-gray-50 border-gray-200 cursor-not-allowed`
    }
    
    if (isSelected) {
      return `${baseClasses} bg-primary-50 border-primary-300 ring-2 ring-primary-200`
    }
    
    return `${baseClasses} bg-white border-gray-200 hover:border-primary-300 hover:bg-primary-50 focus:ring-primary-500`
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price)
  }

  const formatDuration = (minutes) => {
    if (minutes < 60) {
      return `${minutes}m`
    }
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`
  }

  return (
    <div className={className}>
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Select {multiple ? 'Services' : 'Service'}
        </h3>
        {multiple && selectedServices.length > 0 && (
          <p className="text-sm text-gray-600">
            {selectedServices.length} service{selectedServices.length !== 1 ? 's' : ''} selected
          </p>
        )}
      </div>

      {/* Search */}
      <div className="mb-4">
        <Input
          type="text"
          placeholder="Search services..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Selected Services Summary */}
      {multiple && selectedServices.length > 0 && (
        <div className="mb-4 p-3 bg-primary-50 border border-primary-200 ">
          <h4 className="text-sm font-medium text-primary-800 mb-2">
            Selected Services:
          </h4>
          <div className="flex flex-wrap gap-2">
            {selectedServices.map((service) => (
              <Badge
                key={service.id}
                variant="primary"
                className="flex items-center gap-1"
              >
                {service.name}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onServiceRemove(service)}
                  className="ml-1 hover:bg-primary-200 rounded-full p-0.5"
                >
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </Button>
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Services Grid */}
      <div className="grid gap-3">
        {filteredServices.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <p>No services found</p>
          </div>
        ) : (
          filteredServices.map((service) => (
            <button
              key={service.id}
              onClick={() => handleServiceClick(service)}
              className={getServiceClasses(service)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-gray-900">
                      {service.name}
                    </h4>
                    {service.category && (
                      <Badge variant="default" size="sm">
                        {service.category}
                      </Badge>
                    )}
                    {isServiceSelected(service) && (
                      <svg className="w-5 h-5 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  
                  {showDescription && service.description && (
                    <p className="text-sm text-gray-600 mb-2">
                      {service.description}
                    </p>
                  )}
                  
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    {showDuration && service.duration && (
                      <div className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {formatDuration(service.duration)}
                      </div>
                    )}
                    {showPrices && service.price && (
                      <div className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                        </svg>
                        {formatPrice(service.price)}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </button>
          ))
        )}
      </div>

      {/* Total Summary */}
      {multiple && selectedServices.length > 0 && (
        <div className="mt-6 p-4 bg-gray-50 border border-gray-200 ">
          <div className="flex justify-between items-center">
            <span className="font-medium text-gray-900">
              Total Duration:
            </span>
            <span className="text-gray-600">
              {formatDuration(selectedServices.reduce((total, service) => total + (service.duration || 0), 0))}
            </span>
          </div>
          <div className="flex justify-between items-center mt-1">
            <span className="font-medium text-gray-900">
              Total Price:
            </span>
            <span className="text-lg font-semibold text-gray-900">
              {formatPrice(selectedServices.reduce((total, service) => total + (service.price || 0), 0))}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

// Service Card Component
export const ServiceCard = ({ 
  service, 
  isSelected = false, 
  onSelect, 
  className = '' 
}) => {
  const handleClick = () => {
    if (onSelect) {
      onSelect(service)
    }
  }

  return (
    <div
      onClick={handleClick}
      className={`p-4 border  cursor-pointer transition-all duration-200 ${
        isSelected 
          ? 'bg-primary-50 border-primary-300 ring-2 ring-primary-200' 
          : 'bg-white border-gray-200 hover:border-primary-300 hover:bg-primary-50'
      } ${className}`}
    >
      <div className="flex items-start justify-between mb-2">
        <h4 className="font-medium text-gray-900">{service.name}</h4>
        {isSelected && (
          <svg className="w-5 h-5 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        )}
      </div>
      
      {service.description && (
        <p className="text-sm text-gray-600 mb-2">{service.description}</p>
      )}
      
      <div className="flex items-center justify-between text-sm text-gray-500">
        <span>{service.duration}m</span>
        <span className="font-medium">${service.price}</span>
      </div>
    </div>
  )
}

export default ServiceSelector
