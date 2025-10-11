/**
 * Business utility functions
 */

/**
 * Format business name
 * @param {string} name - Business name
 * @returns {string} Formatted business name
 */
export const formatBusinessName = (name) => {
  if (!name || typeof name !== 'string') return ''
  return name.trim()
}

/**
 * Generate business slug
 * @param {string} name - Business name
 * @returns {string} Business slug
 */
export const generateBusinessSlug = (name) => {
  if (!name || typeof name !== 'string') return ''
  
  return name
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/**
 * Validate business name
 * @param {string} name - Business name
 * @returns {boolean} Is valid business name
 */
export const isValidBusinessName = (name) => {
  if (!name || typeof name !== 'string') return false
  return name.trim().length >= 2 && name.trim().length <= 100
}

/**
 * Validate business description
 * @param {string} description - Business description
 * @returns {boolean} Is valid business description
 */
export const isValidBusinessDescription = (description) => {
  if (!description || typeof description !== 'string') return false
  return description.trim().length >= 10 && description.trim().length <= 1000
}

/**
 * Validate business address
 * @param {object} address - Business address
 * @returns {boolean} Is valid business address
 */
export const isValidBusinessAddress = (address) => {
  if (!address || typeof address !== 'object') return false
  
  const required = ['street', 'city', 'state', 'zipCode', 'country']
  return required.every(field => address[field] && typeof address[field] === 'string' && address[field].trim().length > 0)
}

/**
 * Format business address
 * @param {object} address - Business address
 * @param {string} format - Format to use
 * @returns {string} Formatted address
 */
export const formatBusinessAddress = (address, format = 'full') => {
  if (!address || typeof address !== 'object') return ''
  
  const { street, city, state, zipCode, country } = address
  
  switch (format) {
    case 'full':
      return `${street}, ${city}, ${state} ${zipCode}, ${country}`
    case 'short':
      return `${city}, ${state}`
    case 'city-state':
      return `${city}, ${state}`
    case 'zip':
      return zipCode
    default:
      return `${street}, ${city}, ${state} ${zipCode}, ${country}`
  }
}

/**
 * Validate business hours
 * @param {object} hours - Business hours
 * @returns {boolean} Is valid business hours
 */
export const isValidBusinessHours = (hours) => {
  if (!hours || typeof hours !== 'object') return false
  
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
  
  return days.every(day => {
    const dayHours = hours[day]
    if (!dayHours) return true // Closed is valid
    
    return dayHours.open && dayHours.close && 
           typeof dayHours.open === 'string' && 
           typeof dayHours.close === 'string'
  })
}

/**
 * Format business hours
 * @param {object} hours - Business hours
 * @param {string} format - Format to use
 * @returns {string} Formatted business hours
 */
export const formatBusinessHours = (hours, format = 'full') => {
  if (!hours || typeof hours !== 'object') return ''
  
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
  const dayNames = {
    monday: 'Monday',
    tuesday: 'Tuesday',
    wednesday: 'Wednesday',
    thursday: 'Thursday',
    friday: 'Friday',
    saturday: 'Saturday',
    sunday: 'Sunday'
  }
  
  if (format === 'summary') {
    const openDays = days.filter(day => hours[day] && hours[day].open)
    const closedDays = days.filter(day => !hours[day] || !hours[day].open)
    
    if (openDays.length === 7) return 'Open 7 days a week'
    if (openDays.length === 5 && !openDays.includes('saturday') && !openDays.includes('sunday')) {
      return 'Monday - Friday'
    }
    if (closedDays.length === 1) {
      return `Closed ${dayNames[closedDays[0]]}`
    }
    
    return `${openDays.length} days a week`
  }
  
  return days.map(day => {
    const dayHours = hours[day]
    const dayName = dayNames[day]
    
    if (!dayHours || !dayHours.open) {
      return `${dayName}: Closed`
    }
    
    return `${dayName}: ${dayHours.open} - ${dayHours.close}`
  }).join('\n')
}

/**
 * Check if business is open
 * @param {object} hours - Business hours
 * @param {Date} date - Date to check
 * @returns {boolean} Is business open
 */
export const isBusinessOpen = (hours, date = new Date()) => {
  if (!hours || typeof hours !== 'object') return false
  
  const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
  const currentDay = dayNames[date.getDay()]
  const currentTime = date.toTimeString().slice(0, 5)
  
  const dayHours = hours[currentDay]
  if (!dayHours || !dayHours.open) return false
  
  return currentTime >= dayHours.open && currentTime <= dayHours.close
}

/**
 * Get next business day
 * @param {object} hours - Business hours
 * @param {Date} date - Current date
 * @returns {Date} Next business day
 */
export const getNextBusinessDay = (hours, date = new Date()) => {
  if (!hours || typeof hours !== 'object') return date
  
  const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
  let nextDate = new Date(date)
  
  for (let i = 0; i < 7; i++) {
    nextDate.setDate(nextDate.getDate() + 1)
    const dayName = dayNames[nextDate.getDay()]
    
    if (hours[dayName] && hours[dayName].open) {
      return nextDate
    }
  }
  
  return nextDate
}

/**
 * Calculate business rating
 * @param {array} reviews - Business reviews
 * @returns {object} Business rating
 */
export const calculateBusinessRating = (reviews) => {
  if (!reviews || !Array.isArray(reviews) || reviews.length === 0) {
    return { average: 0, count: 0, distribution: {} }
  }
  
  const validReviews = reviews.filter(review => 
    review && typeof review.rating === 'number' && review.rating >= 1 && review.rating <= 5
  )
  
  if (validReviews.length === 0) {
    return { average: 0, count: 0, distribution: {} }
  }
  
  const total = validReviews.reduce((sum, review) => sum + review.rating, 0)
  const average = total / validReviews.length
  
  const distribution = {}
  for (let i = 1; i <= 5; i++) {
    distribution[i] = validReviews.filter(review => review.rating === i).length
  }
  
  return {
    average: Math.round(average * 10) / 10,
    count: validReviews.length,
    distribution
  }
}

/**
 * Format business rating
 * @param {number} rating - Business rating
 * @param {number} maxRating - Maximum rating
 * @returns {string} Formatted rating
 */
export const formatBusinessRating = (rating, maxRating = 5) => {
  if (typeof rating !== 'number' || rating < 0) return '0.0'
  
  return rating.toFixed(1)
}

/**
 * Generate business QR code data
 * @param {object} business - Business data
 * @returns {string} QR code data
 */
export const generateBusinessQRData = (business) => {
  if (!business || typeof business !== 'object') return ''
  
  const { id, name, slug, website, phone, email } = business
  
  return JSON.stringify({
    type: 'business',
    id,
    name,
    slug,
    website,
    phone,
    email,
    timestamp: new Date().toISOString()
  })
}

/**
 * Validate business contact info
 * @param {object} contact - Business contact info
 * @returns {boolean} Is valid contact info
 */
export const isValidBusinessContact = (contact) => {
  if (!contact || typeof contact !== 'object') return false
  
  const { phone, email, website } = contact
  
  // At least one contact method is required
  if (!phone && !email && !website) return false
  
  // Validate phone if provided
  if (phone && typeof phone !== 'string') return false
  
  // Validate email if provided
  if (email && typeof email !== 'string') return false
  
  // Validate website if provided
  if (website && typeof website !== 'string') return false
  
  return true
}

/**
 * Format business contact info
 * @param {object} contact - Business contact info
 * @param {string} format - Format to use
 * @returns {string} Formatted contact info
 */
export const formatBusinessContact = (contact, format = 'full') => {
  if (!contact || typeof contact !== 'object') return ''
  
  const { phone, email, website } = contact
  
  switch (format) {
    case 'phone':
      return phone || ''
    case 'email':
      return email || ''
    case 'website':
      return website || ''
    case 'full':
      return [phone, email, website].filter(Boolean).join(' | ')
    default:
      return [phone, email, website].filter(Boolean).join(' | ')
  }
}

/**
 * Get business status
 * @param {object} business - Business data
 * @returns {string} Business status
 */
export const getBusinessStatus = (business) => {
  if (!business || typeof business !== 'object') return 'unknown'
  
  const { isActive, isVerified, isSuspended } = business
  
  if (isSuspended) return 'suspended'
  if (!isActive) return 'inactive'
  if (!isVerified) return 'unverified'
  
  return 'active'
}

/**
 * Format business status
 * @param {string} status - Business status
 * @returns {string} Formatted status
 */
export const formatBusinessStatus = (status) => {
  const statusMap = {
    active: 'Active',
    inactive: 'Inactive',
    suspended: 'Suspended',
    unverified: 'Unverified',
    unknown: 'Unknown'
  }
  
  return statusMap[status] || 'Unknown'
}

/**
 * Get business type display name
 * @param {string} type - Business type
 * @returns {string} Display name
 */
export const getBusinessTypeDisplayName = (type) => {
  const typeMap = {
    salon: 'Hair Salon',
    spa: 'Spa',
    barbershop: 'Barbershop',
    nail: 'Nail Salon',
    massage: 'Massage Therapy',
    beauty: 'Beauty Salon',
    wellness: 'Wellness Center',
    fitness: 'Fitness Center',
    medical: 'Medical Spa',
    dental: 'Dental Practice',
    other: 'Other'
  }
  
  return typeMap[type] || 'Other'
}

/**
 * Validate business type
 * @param {string} type - Business type
 * @returns {boolean} Is valid business type
 */
export const isValidBusinessType = (type) => {
  if (!type || typeof type !== 'string') return false
  
  const validTypes = [
    'salon', 'spa', 'barbershop', 'nail', 'massage', 
    'beauty', 'wellness', 'fitness', 'medical', 'dental', 'other'
  ]
  
  return validTypes.includes(type.toLowerCase())
}

/**
 * Get business metrics
 * @param {object} business - Business data
 * @returns {object} Business metrics
 */
export const getBusinessMetrics = (business) => {
  if (!business || typeof business !== 'object') return {}
  
  const { reviews, appointments, customers, staff, services } = business
  
  return {
    totalReviews: reviews?.length || 0,
    totalAppointments: appointments?.length || 0,
    totalCustomers: customers?.length || 0,
    totalStaff: staff?.length || 0,
    totalServices: services?.length || 0,
    averageRating: calculateBusinessRating(reviews).average,
    completionRate: appointments ? 
      (appointments.filter(apt => apt.status === 'completed').length / appointments.length * 100) : 0
  }
}

/**
 * Business constants
 */
export const BUSINESS_CONSTANTS = {
  TYPES: {
    SALON: 'salon',
    SPA: 'spa',
    BARBERSHOP: 'barbershop',
    NAIL: 'nail',
    MASSAGE: 'massage',
    BEAUTY: 'beauty',
    WELLNESS: 'wellness',
    FITNESS: 'fitness',
    MEDICAL: 'medical',
    DENTAL: 'dental',
    OTHER: 'other'
  },
  STATUSES: {
    ACTIVE: 'active',
    INACTIVE: 'inactive',
    SUSPENDED: 'suspended',
    UNVERIFIED: 'unverified',
    UNKNOWN: 'unknown'
  },
  ADDRESS_FORMATS: {
    FULL: 'full',
    SHORT: 'short',
    CITY_STATE: 'city-state',
    ZIP: 'zip'
  },
  HOURS_FORMATS: {
    FULL: 'full',
    SUMMARY: 'summary'
  },
  CONTACT_FORMATS: {
    FULL: 'full',
    PHONE: 'phone',
    EMAIL: 'email',
    WEBSITE: 'website'
  }
}

export default {
  formatBusinessName,
  generateBusinessSlug,
  isValidBusinessName,
  isValidBusinessDescription,
  isValidBusinessAddress,
  formatBusinessAddress,
  isValidBusinessHours,
  formatBusinessHours,
  isBusinessOpen,
  getNextBusinessDay,
  calculateBusinessRating,
  formatBusinessRating,
  generateBusinessQRData,
  isValidBusinessContact,
  formatBusinessContact,
  getBusinessStatus,
  formatBusinessStatus,
  getBusinessTypeDisplayName,
  isValidBusinessType,
  getBusinessMetrics,
  BUSINESS_CONSTANTS
}
