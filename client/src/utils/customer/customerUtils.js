/**
 * Customer utility functions
 */

/**
 * Format customer name
 * @param {string} firstName - First name
 * @param {string} lastName - Last name
 * @param {string} format - Format to use
 * @returns {string} Formatted name
 */
export const formatCustomerName = (firstName, lastName, format = 'full') => {
  if (!firstName || !lastName) return ''
  
  const first = firstName.trim()
  const last = lastName.trim()
  
  switch (format) {
    case 'full':
      return `${first} ${last}`
    case 'last-first':
      return `${last}, ${first}`
    case 'first':
      return first
    case 'last':
      return last
    case 'initials':
      return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase()
    default:
      return `${first} ${last}`
  }
}

/**
 * Validate customer name
 * @param {string} firstName - First name
 * @param {string} lastName - Last name
 * @returns {boolean} Is valid customer name
 */
export const isValidCustomerName = (firstName, lastName) => {
  if (!firstName || !lastName) return false
  return firstName.trim().length >= 2 && lastName.trim().length >= 2
}

/**
 * Validate customer email
 * @param {string} email - Customer email
 * @returns {boolean} Is valid customer email
 */
export const isValidCustomerEmail = (email) => {
  if (!email || typeof email !== 'string') return false
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Validate customer phone
 * @param {string} phone - Customer phone
 * @returns {boolean} Is valid customer phone
 */
export const isValidCustomerPhone = (phone) => {
  if (!phone || typeof phone !== 'string') return false
  
  const digits = phone.replace(/\D/g, '')
  return digits.length === 10 || (digits.length === 11 && digits[0] === '1')
}

/**
 * Validate customer date of birth
 * @param {string|Date} dateOfBirth - Date of birth
 * @returns {boolean} Is valid date of birth
 */
export const isValidCustomerDateOfBirth = (dateOfBirth) => {
  if (!dateOfBirth) return false
  
  const date = new Date(dateOfBirth)
  const now = new Date()
  const age = now.getFullYear() - date.getFullYear()
  
  return age >= 0 && age <= 120
}

/**
 * Calculate customer age
 * @param {string|Date} dateOfBirth - Date of birth
 * @returns {number} Customer age
 */
export const calculateCustomerAge = (dateOfBirth) => {
  if (!dateOfBirth) return 0
  
  const birthDate = new Date(dateOfBirth)
  const now = new Date()
  let age = now.getFullYear() - birthDate.getFullYear()
  
  const monthDiff = now.getMonth() - birthDate.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birthDate.getDate())) {
    age--
  }
  
  return age
}

/**
 * Get customer age group
 * @param {string|Date} dateOfBirth - Date of birth
 * @returns {string} Age group
 */
export const getCustomerAgeGroup = (dateOfBirth) => {
  const age = calculateCustomerAge(dateOfBirth)
  
  if (age < 18) return 'minor'
  if (age >= 18 && age < 25) return 'young-adult'
  if (age >= 25 && age < 35) return 'adult'
  if (age >= 35 && age < 50) return 'middle-aged'
  if (age >= 50 && age < 65) return 'mature'
  return 'senior'
}

/**
 * Validate customer address
 * @param {object} address - Customer address
 * @returns {boolean} Is valid customer address
 */
export const isValidCustomerAddress = (address) => {
  if (!address || typeof address !== 'object') return false
  
  const required = ['street', 'city', 'state', 'zipCode', 'country']
  return required.every(field => address[field] && typeof address[field] === 'string' && address[field].trim().length > 0)
}

/**
 * Format customer address
 * @param {object} address - Customer address
 * @param {string} format - Format to use
 * @returns {string} Formatted address
 */
export const formatCustomerAddress = (address, format = 'full') => {
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
 * Calculate customer lifetime value
 * @param {object} customer - Customer data
 * @returns {number} Lifetime value
 */
export const calculateCustomerLifetimeValue = (customer) => {
  if (!customer || typeof customer !== 'object') return 0
  
  const { appointments, transactions } = customer
  
  let totalValue = 0
  
  if (appointments && Array.isArray(appointments)) {
    totalValue += appointments
      .filter(apt => apt.status === 'completed')
      .reduce((sum, apt) => sum + (apt.service?.price || 0), 0)
  }
  
  if (transactions && Array.isArray(transactions)) {
    totalValue += transactions
      .filter(txn => txn.status === 'completed')
      .reduce((sum, txn) => sum + (txn.amount || 0), 0)
  }
  
  return totalValue
}

/**
 * Calculate customer visit frequency
 * @param {object} customer - Customer data
 * @param {number} periodDays - Period in days
 * @returns {number} Visit frequency
 */
export const calculateCustomerVisitFrequency = (customer, periodDays = 365) => {
  if (!customer || typeof customer !== 'object') return 0
  
  const { appointments } = customer
  if (!appointments || !Array.isArray(appointments)) return 0
  
  const now = new Date()
  const periodStart = new Date(now.getTime() - (periodDays * 24 * 60 * 60 * 1000))
  
  const recentAppointments = appointments.filter(apt => {
    const aptDate = new Date(apt.date)
    return aptDate >= periodStart && aptDate <= now
  })
  
  return recentAppointments.length
}

/**
 * Calculate customer average spend
 * @param {object} customer - Customer data
 * @returns {number} Average spend per visit
 */
export const calculateCustomerAverageSpend = (customer) => {
  if (!customer || typeof customer !== 'object') return 0
  
  const { appointments } = customer
  if (!appointments || !Array.isArray(appointments)) return 0
  
  const completedAppointments = appointments.filter(apt => apt.status === 'completed')
  if (completedAppointments.length === 0) return 0
  
  const totalSpend = completedAppointments.reduce((sum, apt) => sum + (apt.service?.price || 0), 0)
  return totalSpend / completedAppointments.length
}

/**
 * Get customer last visit
 * @param {object} customer - Customer data
 * @returns {Date|null} Last visit date
 */
export const getCustomerLastVisit = (customer) => {
  if (!customer || typeof customer !== 'object') return null
  
  const { appointments } = customer
  if (!appointments || !Array.isArray(appointments)) return null
  
  const completedAppointments = appointments
    .filter(apt => apt.status === 'completed')
    .sort((a, b) => new Date(b.date) - new Date(a.date))
  
  return completedAppointments.length > 0 ? new Date(completedAppointments[0].date) : null
}

/**
 * Calculate customer days since last visit
 * @param {object} customer - Customer data
 * @returns {number} Days since last visit
 */
export const calculateCustomerDaysSinceLastVisit = (customer) => {
  const lastVisit = getCustomerLastVisit(customer)
  if (!lastVisit) return null
  
  const now = new Date()
  const diffTime = Math.abs(now - lastVisit)
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

/**
 * Get customer preferences
 * @param {object} customer - Customer data
 * @returns {object} Customer preferences
 */
export const getCustomerPreferences = (customer) => {
  if (!customer || typeof customer !== 'object') return {}
  
  const { appointments, services, staff } = customer
  
  const preferences = {
    favoriteServices: [],
    favoriteStaff: [],
    preferredTimes: [],
    preferredDays: []
  }
  
  if (appointments && Array.isArray(appointments)) {
    const serviceCounts = {}
    const staffCounts = {}
    const timeCounts = {}
    const dayCounts = {}
    
    appointments.forEach(apt => {
      if (apt.service) {
        serviceCounts[apt.service.id] = (serviceCounts[apt.service.id] || 0) + 1
      }
      if (apt.staff) {
        staffCounts[apt.staff.id] = (staffCounts[apt.staff.id] || 0) + 1
      }
      if (apt.time) {
        timeCounts[apt.time] = (timeCounts[apt.time] || 0) + 1
      }
      if (apt.date) {
        const day = new Date(apt.date).getDay()
        dayCounts[day] = (dayCounts[day] || 0) + 1
      }
    })
    
    preferences.favoriteServices = Object.entries(serviceCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([id]) => id)
    
    preferences.favoriteStaff = Object.entries(staffCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([id]) => id)
    
    preferences.preferredTimes = Object.entries(timeCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([time]) => time)
    
    preferences.preferredDays = Object.entries(dayCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([day]) => parseInt(day))
  }
  
  return preferences
}

/**
 * Calculate customer satisfaction score
 * @param {object} customer - Customer data
 * @returns {number} Satisfaction score
 */
export const calculateCustomerSatisfactionScore = (customer) => {
  if (!customer || typeof customer !== 'object') return 0
  
  const { reviews, feedback } = customer
  
  let totalScore = 0
  let totalCount = 0
  
  if (reviews && Array.isArray(reviews)) {
    reviews.forEach(review => {
      if (review.rating && typeof review.rating === 'number') {
        totalScore += review.rating
        totalCount++
      }
    })
  }
  
  if (feedback && Array.isArray(feedback)) {
    feedback.forEach(fb => {
      if (fb.rating && typeof fb.rating === 'number') {
        totalScore += fb.rating
        totalCount++
      }
    })
  }
  
  return totalCount > 0 ? totalScore / totalCount : 0
}

/**
 * Get customer status
 * @param {object} customer - Customer data
 * @returns {string} Customer status
 */
export const getCustomerStatus = (customer) => {
  if (!customer || typeof customer !== 'object') return 'unknown'
  
  const { isActive, isVerified, isBlocked } = customer
  
  if (isBlocked) return 'blocked'
  if (!isActive) return 'inactive'
  if (!isVerified) return 'unverified'
  
  return 'active'
}

/**
 * Format customer status
 * @param {string} status - Customer status
 * @returns {string} Formatted status
 */
export const formatCustomerStatus = (status) => {
  const statusMap = {
    active: 'Active',
    inactive: 'Inactive',
    blocked: 'Blocked',
    unverified: 'Unverified',
    unknown: 'Unknown'
  }
  
  return statusMap[status] || 'Unknown'
}

/**
 * Get customer metrics
 * @param {object} customer - Customer data
 * @returns {object} Customer metrics
 */
export const getCustomerMetrics = (customer) => {
  if (!customer || typeof customer !== 'object') return {}
  
  return {
    lifetimeValue: calculateCustomerLifetimeValue(customer),
    visitFrequency: calculateCustomerVisitFrequency(customer),
    averageSpend: calculateCustomerAverageSpend(customer),
    lastVisit: getCustomerLastVisit(customer),
    daysSinceLastVisit: calculateCustomerDaysSinceLastVisit(customer),
    satisfactionScore: calculateCustomerSatisfactionScore(customer),
    totalAppointments: customer.appointments?.length || 0,
    totalReviews: customer.reviews?.length || 0,
    totalTransactions: customer.transactions?.length || 0,
    age: calculateCustomerAge(customer.dateOfBirth),
    ageGroup: getCustomerAgeGroup(customer.dateOfBirth),
    preferences: getCustomerPreferences(customer)
  }
}

/**
 * Sort customers by criteria
 * @param {array} customers - Customers to sort
 * @param {string} criteria - Sort criteria
 * @param {string} direction - Sort direction
 * @returns {array} Sorted customers
 */
export const sortCustomers = (customers, criteria = 'name', direction = 'asc') => {
  if (!customers || !Array.isArray(customers)) return []
  
  return [...customers].sort((a, b) => {
    let aValue, bValue
    
    switch (criteria) {
      case 'name':
        aValue = formatCustomerName(a.firstName, a.lastName).toLowerCase()
        bValue = formatCustomerName(b.firstName, b.lastName).toLowerCase()
        break
      case 'email':
        aValue = a.email?.toLowerCase() || ''
        bValue = b.email?.toLowerCase() || ''
        break
      case 'phone':
        aValue = a.phone || ''
        bValue = b.phone || ''
        break
      case 'lifetimeValue':
        aValue = calculateCustomerLifetimeValue(a)
        bValue = calculateCustomerLifetimeValue(b)
        break
      case 'visitFrequency':
        aValue = calculateCustomerVisitFrequency(a)
        bValue = calculateCustomerVisitFrequency(b)
        break
      case 'averageSpend':
        aValue = calculateCustomerAverageSpend(a)
        bValue = calculateCustomerAverageSpend(b)
        break
      case 'lastVisit':
        aValue = getCustomerLastVisit(a) || new Date(0)
        bValue = getCustomerLastVisit(b) || new Date(0)
        break
      case 'satisfaction':
        aValue = calculateCustomerSatisfactionScore(a)
        bValue = calculateCustomerSatisfactionScore(b)
        break
      default:
        aValue = formatCustomerName(a.firstName, a.lastName).toLowerCase()
        bValue = formatCustomerName(b.firstName, b.lastName).toLowerCase()
    }
    
    if (direction === 'desc') {
      return bValue > aValue ? 1 : bValue < aValue ? -1 : 0
    }
    
    return aValue > bValue ? 1 : aValue < bValue ? -1 : 0
  })
}

/**
 * Filter customers by criteria
 * @param {array} customers - Customers to filter
 * @param {object} filters - Filter criteria
 * @returns {array} Filtered customers
 */
export const filterCustomers = (customers, filters = {}) => {
  if (!customers || !Array.isArray(customers)) return []
  
  return customers.filter(customer => {
    if (filters.status && getCustomerStatus(customer) !== filters.status) return false
    if (filters.ageGroup && getCustomerAgeGroup(customer.dateOfBirth) !== filters.ageGroup) return false
    if (filters.minLifetimeValue && calculateCustomerLifetimeValue(customer) < filters.minLifetimeValue) return false
    if (filters.maxLifetimeValue && calculateCustomerLifetimeValue(customer) > filters.maxLifetimeValue) return false
    if (filters.minVisitFrequency && calculateCustomerVisitFrequency(customer) < filters.minVisitFrequency) return false
    if (filters.maxVisitFrequency && calculateCustomerVisitFrequency(customer) > filters.maxVisitFrequency) return false
    if (filters.search && !formatCustomerName(customer.firstName, customer.lastName).toLowerCase().includes(filters.search.toLowerCase())) return false
    
    return true
  })
}

/**
 * Customer constants
 */
export const CUSTOMER_CONSTANTS = {
  STATUSES: {
    ACTIVE: 'active',
    INACTIVE: 'inactive',
    BLOCKED: 'blocked',
    UNVERIFIED: 'unverified',
    UNKNOWN: 'unknown'
  },
  AGE_GROUPS: {
    MINOR: 'minor',
    YOUNG_ADULT: 'young-adult',
    ADULT: 'adult',
    MIDDLE_AGED: 'middle-aged',
    MATURE: 'mature',
    SENIOR: 'senior'
  },
  NAME_FORMATS: {
    FULL: 'full',
    LAST_FIRST: 'last-first',
    FIRST: 'first',
    LAST: 'last',
    INITIALS: 'initials'
  },
  ADDRESS_FORMATS: {
    FULL: 'full',
    SHORT: 'short',
    CITY_STATE: 'city-state',
    ZIP: 'zip'
  },
  SORT_CRITERIA: {
    NAME: 'name',
    EMAIL: 'email',
    PHONE: 'phone',
    LIFETIME_VALUE: 'lifetimeValue',
    VISIT_FREQUENCY: 'visitFrequency',
    AVERAGE_SPEND: 'averageSpend',
    LAST_VISIT: 'lastVisit',
    SATISFACTION: 'satisfaction'
  },
  SORT_DIRECTIONS: {
    ASC: 'asc',
    DESC: 'desc'
  }
}

export default {
  formatCustomerName,
  isValidCustomerName,
  isValidCustomerEmail,
  isValidCustomerPhone,
  isValidCustomerDateOfBirth,
  calculateCustomerAge,
  getCustomerAgeGroup,
  isValidCustomerAddress,
  formatCustomerAddress,
  calculateCustomerLifetimeValue,
  calculateCustomerVisitFrequency,
  calculateCustomerAverageSpend,
  getCustomerLastVisit,
  calculateCustomerDaysSinceLastVisit,
  getCustomerPreferences,
  calculateCustomerSatisfactionScore,
  getCustomerStatus,
  formatCustomerStatus,
  getCustomerMetrics,
  sortCustomers,
  filterCustomers,
  CUSTOMER_CONSTANTS
}
