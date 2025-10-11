/**
 * Service utility functions
 */

/**
 * Format service name
 * @param {string} name - Service name
 * @returns {string} Formatted service name
 */
export const formatServiceName = (name) => {
  if (!name || typeof name !== 'string') return ''
  return name.trim()
}

/**
 * Validate service name
 * @param {string} name - Service name
 * @returns {boolean} Is valid service name
 */
export const isValidServiceName = (name) => {
  if (!name || typeof name !== 'string') return false
  return name.trim().length >= 2 && name.trim().length <= 100
}

/**
 * Validate service description
 * @param {string} description - Service description
 * @returns {boolean} Is valid service description
 */
export const isValidServiceDescription = (description) => {
  if (!description || typeof description !== 'string') return false
  return description.trim().length >= 10 && description.trim().length <= 500
}

/**
 * Validate service price
 * @param {number} price - Service price
 * @returns {boolean} Is valid service price
 */
export const isValidServicePrice = (price) => {
  if (typeof price !== 'number') return false
  return price >= 0 && price <= 10000
}

/**
 * Format service price
 * @param {number} price - Service price
 * @param {string} currency - Currency code
 * @param {string} format - Format to use
 * @returns {string} Formatted price
 */
export const formatServicePrice = (price, currency = 'USD', format = 'currency') => {
  if (typeof price !== 'number') return '0.00'
  
  switch (format) {
    case 'currency':
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency
      }).format(price)
    case 'number':
      return price.toFixed(2)
    case 'integer':
      return Math.round(price).toString()
    default:
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency
      }).format(price)
  }
}

/**
 * Validate service duration
 * @param {number} duration - Service duration in minutes
 * @returns {boolean} Is valid service duration
 */
export const isValidServiceDuration = (duration) => {
  if (typeof duration !== 'number') return false
  return duration >= 15 && duration <= 480 // 15 minutes to 8 hours
}

/**
 * Format service duration
 * @param {number} duration - Service duration in minutes
 * @param {string} format - Format to use
 * @returns {string} Formatted duration
 */
export const formatServiceDuration = (duration, format = 'readable') => {
  if (typeof duration !== 'number') return '0 minutes'
  
  const hours = Math.floor(duration / 60)
  const minutes = duration % 60
  
  switch (format) {
    case 'readable':
      if (hours === 0) return `${minutes} minutes`
      if (minutes === 0) return `${hours} hour${hours > 1 ? 's' : ''}`
      return `${hours} hour${hours > 1 ? 's' : ''} ${minutes} minutes`
    case 'short':
      if (hours === 0) return `${minutes}m`
      if (minutes === 0) return `${hours}h`
      return `${hours}h ${minutes}m`
    case 'minutes':
      return `${duration} minutes`
    case 'hours':
      return `${(duration / 60).toFixed(1)} hours`
    default:
      if (hours === 0) return `${minutes} minutes`
      if (minutes === 0) return `${hours} hour${hours > 1 ? 's' : ''}`
      return `${hours} hour${hours > 1 ? 's' : ''} ${minutes} minutes`
  }
}

/**
 * Validate service category
 * @param {string} category - Service category
 * @returns {boolean} Is valid service category
 */
export const isValidServiceCategory = (category) => {
  if (!category || typeof category !== 'string') return false
  
  const validCategories = [
    'hair', 'nails', 'massage', 'facial', 'body', 'eyebrows', 
    'eyelashes', 'waxing', 'makeup', 'spa', 'wellness', 'other'
  ]
  
  return validCategories.includes(category.toLowerCase())
}

/**
 * Get service category display name
 * @param {string} category - Service category
 * @returns {string} Display name
 */
export const getServiceCategoryDisplayName = (category) => {
  const categoryMap = {
    hair: 'Hair Services',
    nails: 'Nail Services',
    massage: 'Massage Therapy',
    facial: 'Facial Treatments',
    body: 'Body Treatments',
    eyebrows: 'Eyebrow Services',
    eyelashes: 'Eyelash Services',
    waxing: 'Waxing Services',
    makeup: 'Makeup Services',
    spa: 'Spa Services',
    wellness: 'Wellness Services',
    other: 'Other Services'
  }
  
  return categoryMap[category] || 'Other Services'
}

/**
 * Validate service status
 * @param {string} status - Service status
 * @returns {boolean} Is valid service status
 */
export const isValidServiceStatus = (status) => {
  if (!status || typeof status !== 'string') return false
  
  const validStatuses = ['active', 'inactive', 'suspended', 'discontinued']
  return validStatuses.includes(status.toLowerCase())
}

/**
 * Get service status display name
 * @param {string} status - Service status
 * @returns {string} Display name
 */
export const getServiceStatusDisplayName = (status) => {
  const statusMap = {
    active: 'Active',
    inactive: 'Inactive',
    suspended: 'Suspended',
    discontinued: 'Discontinued'
  }
  
  return statusMap[status] || 'Unknown'
}

/**
 * Calculate service popularity
 * @param {array} appointments - Service appointments
 * @param {number} totalAppointments - Total appointments
 * @returns {number} Popularity percentage
 */
export const calculateServicePopularity = (appointments, totalAppointments) => {
  if (!appointments || !Array.isArray(appointments) || totalAppointments === 0) return 0
  
  return (appointments.length / totalAppointments) * 100
}

/**
 * Calculate service revenue
 * @param {array} appointments - Service appointments
 * @param {number} price - Service price
 * @returns {number} Total revenue
 */
export const calculateServiceRevenue = (appointments, price) => {
  if (!appointments || !Array.isArray(appointments) || typeof price !== 'number') return 0
  
  const completedAppointments = appointments.filter(apt => apt.status === 'completed')
  return completedAppointments.length * price
}

/**
 * Get service metrics
 * @param {object} service - Service data
 * @returns {object} Service metrics
 */
export const getServiceMetrics = (service) => {
  if (!service || typeof service !== 'object') return {}
  
  const { appointments, price, duration } = service
  
  return {
    totalBookings: appointments?.length || 0,
    completedBookings: appointments?.filter(apt => apt.status === 'completed').length || 0,
    cancelledBookings: appointments?.filter(apt => apt.status === 'cancelled').length || 0,
    noShowBookings: appointments?.filter(apt => apt.status === 'no-show').length || 0,
    completionRate: appointments ? 
      (appointments.filter(apt => apt.status === 'completed').length / appointments.length * 100) : 0,
    totalRevenue: calculateServiceRevenue(appointments, price),
    averageDuration: duration || 0,
    popularity: calculateServicePopularity(appointments, appointments?.length || 0)
  }
}

/**
 * Sort services by criteria
 * @param {array} services - Services to sort
 * @param {string} criteria - Sort criteria
 * @param {string} direction - Sort direction
 * @returns {array} Sorted services
 */
export const sortServices = (services, criteria = 'name', direction = 'asc') => {
  if (!services || !Array.isArray(services)) return []
  
  return [...services].sort((a, b) => {
    let aValue, bValue
    
    switch (criteria) {
      case 'name':
        aValue = a.name?.toLowerCase() || ''
        bValue = b.name?.toLowerCase() || ''
        break
      case 'price':
        aValue = a.price || 0
        bValue = b.price || 0
        break
      case 'duration':
        aValue = a.duration || 0
        bValue = b.duration || 0
        break
      case 'category':
        aValue = a.category?.toLowerCase() || ''
        bValue = b.category?.toLowerCase() || ''
        break
      case 'status':
        aValue = a.status?.toLowerCase() || ''
        bValue = b.status?.toLowerCase() || ''
        break
      case 'popularity':
        aValue = calculateServicePopularity(a.appointments, a.appointments?.length || 0)
        bValue = calculateServicePopularity(b.appointments, b.appointments?.length || 0)
        break
      case 'revenue':
        aValue = calculateServiceRevenue(a.appointments, a.price)
        bValue = calculateServiceRevenue(b.appointments, b.price)
        break
      default:
        aValue = a.name?.toLowerCase() || ''
        bValue = b.name?.toLowerCase() || ''
    }
    
    if (direction === 'desc') {
      return bValue > aValue ? 1 : bValue < aValue ? -1 : 0
    }
    
    return aValue > bValue ? 1 : aValue < bValue ? -1 : 0
  })
}

/**
 * Filter services by criteria
 * @param {array} services - Services to filter
 * @param {object} filters - Filter criteria
 * @returns {array} Filtered services
 */
export const filterServices = (services, filters = {}) => {
  if (!services || !Array.isArray(services)) return []
  
  return services.filter(service => {
    if (filters.category && service.category !== filters.category) return false
    if (filters.status && service.status !== filters.status) return false
    if (filters.minPrice && service.price < filters.minPrice) return false
    if (filters.maxPrice && service.price > filters.maxPrice) return false
    if (filters.minDuration && service.duration < filters.minDuration) return false
    if (filters.maxDuration && service.duration > filters.maxDuration) return false
    if (filters.search && !service.name?.toLowerCase().includes(filters.search.toLowerCase())) return false
    
    return true
  })
}

/**
 * Group services by category
 * @param {array} services - Services to group
 * @returns {object} Grouped services
 */
export const groupServicesByCategory = (services) => {
  if (!services || !Array.isArray(services)) return {}
  
  return services.reduce((groups, service) => {
    const category = service.category || 'other'
    if (!groups[category]) {
      groups[category] = []
    }
    groups[category].push(service)
    return groups
  }, {})
}

/**
 * Get service recommendations
 * @param {array} services - Available services
 * @param {object} customer - Customer data
 * @param {number} limit - Maximum recommendations
 * @returns {array} Recommended services
 */
export const getServiceRecommendations = (services, customer, limit = 5) => {
  if (!services || !Array.isArray(services) || !customer) return []
  
  // Simple recommendation logic based on customer preferences and service popularity
  const recommendations = services
    .filter(service => service.status === 'active')
    .map(service => ({
      ...service,
      score: calculateServicePopularity(service.appointments, service.appointments?.length || 0)
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
  
  return recommendations
}

/**
 * Validate service booking
 * @param {object} service - Service to book
 * @param {object} appointment - Appointment data
 * @returns {object} Validation result
 */
export const validateServiceBooking = (service, appointment) => {
  if (!service || !appointment) {
    return { isValid: false, error: 'Service and appointment data required' }
  }
  
  if (service.status !== 'active') {
    return { isValid: false, error: 'Service is not available for booking' }
  }
  
  if (!isValidServiceDuration(service.duration)) {
    return { isValid: false, error: 'Invalid service duration' }
  }
  
  if (!isValidServicePrice(service.price)) {
    return { isValid: false, error: 'Invalid service price' }
  }
  
  return { isValid: true, error: null }
}

/**
 * Service constants
 */
export const SERVICE_CONSTANTS = {
  CATEGORIES: {
    HAIR: 'hair',
    NAILS: 'nails',
    MASSAGE: 'massage',
    FACIAL: 'facial',
    BODY: 'body',
    EYEBROWS: 'eyebrows',
    EYELASHES: 'eyelashes',
    WAXING: 'waxing',
    MAKEUP: 'makeup',
    SPA: 'spa',
    WELLNESS: 'wellness',
    OTHER: 'other'
  },
  STATUSES: {
    ACTIVE: 'active',
    INACTIVE: 'inactive',
    SUSPENDED: 'suspended',
    DISCONTINUED: 'discontinued'
  },
  PRICE_FORMATS: {
    CURRENCY: 'currency',
    NUMBER: 'number',
    INTEGER: 'integer'
  },
  DURATION_FORMATS: {
    READABLE: 'readable',
    SHORT: 'short',
    MINUTES: 'minutes',
    HOURS: 'hours'
  },
  SORT_CRITERIA: {
    NAME: 'name',
    PRICE: 'price',
    DURATION: 'duration',
    CATEGORY: 'category',
    STATUS: 'status',
    POPULARITY: 'popularity',
    REVENUE: 'revenue'
  },
  SORT_DIRECTIONS: {
    ASC: 'asc',
    DESC: 'desc'
  }
}

export default {
  formatServiceName,
  isValidServiceName,
  isValidServiceDescription,
  isValidServicePrice,
  formatServicePrice,
  isValidServiceDuration,
  formatServiceDuration,
  isValidServiceCategory,
  getServiceCategoryDisplayName,
  isValidServiceStatus,
  getServiceStatusDisplayName,
  calculateServicePopularity,
  calculateServiceRevenue,
  getServiceMetrics,
  sortServices,
  filterServices,
  groupServicesByCategory,
  getServiceRecommendations,
  validateServiceBooking,
  SERVICE_CONSTANTS
}
