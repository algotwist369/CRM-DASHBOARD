/**
 * Data formatting utility functions
 */

/**
 * Format phone number
 * @param {string} phone - Phone number to format
 * @param {string} format - Format type ('US', 'international', 'clean')
 * @returns {string} Formatted phone number
 */
export const formatPhoneNumber = (phone, format = 'US') => {
  if (!phone) return ''
  
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '')
  
  switch (format) {
    case 'US':
      if (cleaned.length === 10) {
        return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`
      } else if (cleaned.length === 11 && cleaned[0] === '1') {
        return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`
      }
      break
    case 'international':
      if (cleaned.length === 10) {
        return `+1-${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6)}`
      } else if (cleaned.length === 11 && cleaned[0] === '1') {
        return `+1-${cleaned.slice(1, 4)}-${cleaned.slice(4, 7)}-${cleaned.slice(7)}`
      }
      break
    case 'clean':
      return cleaned
    default:
      return phone
  }
  
  return phone
}

/**
 * Format email address
 * @param {string} email - Email to format
 * @returns {string} Formatted email (lowercase, trimmed)
 */
export const formatEmail = (email) => {
  if (!email) return ''
  return email.toLowerCase().trim()
}

/**
 * Format name (capitalize first letter of each word)
 * @param {string} name - Name to format
 * @returns {string} Formatted name
 */
export const formatName = (name) => {
  if (!name) return ''
  return name
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

/**
 * Format address
 * @param {object} address - Address object
 * @returns {string} Formatted address
 */
export const formatAddress = (address) => {
  if (!address) return ''
  
  const parts = []
  if (address.street) parts.push(address.street)
  if (address.city) parts.push(address.city)
  if (address.state) parts.push(address.state)
  if (address.zipCode) parts.push(address.zipCode)
  if (address.country) parts.push(address.country)
  
  return parts.join(', ')
}

/**
 * Format currency amount
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency code (default: 'USD')
 * @param {string} locale - Locale (default: 'en-US')
 * @returns {string} Formatted currency
 */
export const formatCurrency = (amount, currency = 'USD', locale = 'en-US') => {
  if (amount === null || amount === undefined || isNaN(amount)) return '$0.00'
  
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency
  }).format(amount)
}

/**
 * Format number with commas
 * @param {number} number - Number to format
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted number
 */
export const formatNumber = (number, decimals = 0) => {
  if (number === null || number === undefined || isNaN(number)) return '0'
  
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(number)
}

/**
 * Format percentage
 * @param {number} value - Value to format
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted percentage
 */
export const formatPercentage = (value, decimals = 1) => {
  if (value === null || value === undefined || isNaN(value)) return '0%'
  
  return new Intl.NumberFormat('en-US', {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(value / 100)
}

/**
 * Format date
 * @param {Date|string} date - Date to format
 * @param {string} format - Format type ('short', 'long', 'medium', 'full', 'custom')
 * @param {string} customFormat - Custom format string
 * @returns {string} Formatted date
 */
export const formatDate = (date, format = 'short', customFormat = '') => {
  if (!date) return ''
  
  const dateObj = new Date(date)
  if (isNaN(dateObj.getTime())) return ''
  
  switch (format) {
    case 'short':
      return dateObj.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      })
    case 'long':
      return dateObj.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    case 'medium':
      return dateObj.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    case 'full':
      return dateObj.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    case 'custom':
      return formatCustomDate(dateObj, customFormat)
    default:
      return dateObj.toLocaleDateString()
  }
}

/**
 * Format time
 * @param {Date|string} time - Time to format
 * @param {string} format - Format type ('12h', '24h')
 * @returns {string} Formatted time
 */
export const formatTime = (time, format = '12h') => {
  if (!time) return ''
  
  const timeObj = new Date(time)
  if (isNaN(timeObj.getTime())) return ''
  
  const options = {
    hour: 'numeric',
    minute: '2-digit',
    hour12: format === '12h'
  }
  
  return timeObj.toLocaleTimeString('en-US', options)
}

/**
 * Format date and time
 * @param {Date|string} datetime - Date and time to format
 * @param {string} dateFormat - Date format type
 * @param {string} timeFormat - Time format type
 * @returns {string} Formatted date and time
 */
export const formatDateTime = (datetime, dateFormat = 'short', timeFormat = '12h') => {
  if (!datetime) return ''
  
  const dateStr = formatDate(datetime, dateFormat)
  const timeStr = formatTime(datetime, timeFormat)
  
  return `${dateStr} at ${timeStr}`
}

/**
 * Format duration in minutes to human readable format
 * @param {number} minutes - Duration in minutes
 * @returns {string} Formatted duration
 */
export const formatDuration = (minutes) => {
  if (!minutes || isNaN(minutes)) return '0 minutes'
  
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  
  if (hours === 0) {
    return `${mins} minute${mins !== 1 ? 's' : ''}`
  } else if (mins === 0) {
    return `${hours} hour${hours !== 1 ? 's' : ''}`
  } else {
    return `${hours} hour${hours !== 1 ? 's' : ''} ${mins} minute${mins !== 1 ? 's' : ''}`
  }
}

/**
 * Format file size
 * @param {number} bytes - File size in bytes
 * @returns {string} Formatted file size
 */
export const formatFileSize = (bytes) => {
  if (!bytes || isNaN(bytes)) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

/**
 * Format relative time (e.g., "2 hours ago")
 * @param {Date|string} date - Date to format
 * @returns {string} Formatted relative time
 */
export const formatRelativeTime = (date) => {
  if (!date) return ''
  
  const dateObj = new Date(date)
  if (isNaN(dateObj.getTime())) return ''
  
  const now = new Date()
  const diffInSeconds = Math.floor((now - dateObj) / 1000)
  
  if (diffInSeconds < 60) {
    return 'just now'
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60)
    return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600)
    return `${hours} hour${hours !== 1 ? 's' : ''} ago`
  } else if (diffInSeconds < 2592000) {
    const days = Math.floor(diffInSeconds / 86400)
    return `${days} day${days !== 1 ? 's' : ''} ago`
  } else if (diffInSeconds < 31536000) {
    const months = Math.floor(diffInSeconds / 2592000)
    return `${months} month${months !== 1 ? 's' : ''} ago`
  } else {
    const years = Math.floor(diffInSeconds / 31536000)
    return `${years} year${years !== 1 ? 's' : ''} ago`
  }
}

/**
 * Format business hours
 * @param {object} hours - Business hours object
 * @returns {string} Formatted business hours
 */
export const formatBusinessHours = (hours) => {
  if (!hours) return 'Closed'
  
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
  const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  
  const formattedHours = days.map((day, index) => {
    const dayHours = hours[day]
    if (!dayHours || !dayHours.isOpen) {
      return `${dayNames[index]}: Closed`
    }
    
    const openTime = formatTime(dayHours.open, '12h')
    const closeTime = formatTime(dayHours.close, '12h')
    
    return `${dayNames[index]}: ${openTime} - ${closeTime}`
  })
  
  return formattedHours.join('\n')
}

/**
 * Format appointment status
 * @param {string} status - Appointment status
 * @returns {string} Formatted status
 */
export const formatAppointmentStatus = (status) => {
  const statusMap = {
    scheduled: 'Scheduled',
    confirmed: 'Confirmed',
    in_progress: 'In Progress',
    completed: 'Completed',
    cancelled: 'Cancelled',
    no_show: 'No Show'
  }
  
  return statusMap[status] || status
}

/**
 * Format transaction status
 * @param {string} status - Transaction status
 * @returns {string} Formatted status
 */
export const formatTransactionStatus = (status) => {
  const statusMap = {
    pending: 'Pending',
    completed: 'Completed',
    failed: 'Failed',
    refunded: 'Refunded',
    cancelled: 'Cancelled'
  }
  
  return statusMap[status] || status
}

/**
 * Format user role
 * @param {string} role - User role
 * @returns {string} Formatted role
 */
export const formatUserRole = (role) => {
  const roleMap = {
    admin: 'Administrator',
    manager: 'Manager',
    staff: 'Staff',
    customer: 'Customer'
  }
  
  return roleMap[role] || role
}

/**
 * Format notification type
 * @param {string} type - Notification type
 * @returns {string} Formatted type
 */
export const formatNotificationType = (type) => {
  const typeMap = {
    email: 'Email',
    sms: 'SMS',
    push: 'Push Notification',
    in_app: 'In-App Notification'
  }
  
  return typeMap[type] || type
}

/**
 * Format priority level
 * @param {string} priority - Priority level
 * @returns {string} Formatted priority
 */
export const formatPriority = (priority) => {
  const priorityMap = {
    low: 'Low',
    medium: 'Medium',
    high: 'High',
    urgent: 'Urgent'
  }
  
  return priorityMap[priority] || priority
}

/**
 * Format customer segment
 * @param {string} segment - Customer segment
 * @returns {string} Formatted segment
 */
export const formatCustomerSegment = (segment) => {
  const segmentMap = {
    vip: 'VIP',
    regular: 'Regular',
    new: 'New',
    at_risk: 'At Risk'
  }
  
  return segmentMap[segment] || segment
}

/**
 * Format report type
 * @param {string} type - Report type
 * @returns {string} Formatted type
 */
export const formatReportType = (type) => {
  const typeMap = {
    business: 'Business Report',
    staff: 'Staff Report',
    customer: 'Customer Report',
    appointment: 'Appointment Report',
    transaction: 'Transaction Report',
    revenue: 'Revenue Report',
    analytics: 'Analytics Report'
  }
  
  return typeMap[type] || type
}

/**
 * Format report format
 * @param {string} format - Report format
 * @returns {string} Formatted format
 */
export const formatReportFormat = (format) => {
  const formatMap = {
    pdf: 'PDF',
    excel: 'Excel',
    csv: 'CSV',
    json: 'JSON'
  }
  
  return formatMap[format] || format.toUpperCase()
}

/**
 * Format custom date
 * @param {Date} date - Date object
 * @param {string} format - Custom format string
 * @returns {string} Formatted date
 */
const formatCustomDate = (date, format) => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hours = date.getHours()
  const minutes = date.getMinutes()
  const seconds = date.getSeconds()
  
  return format
    .replace('YYYY', year)
    .replace('MM', month.toString().padStart(2, '0'))
    .replace('DD', day.toString().padStart(2, '0'))
    .replace('HH', hours.toString().padStart(2, '0'))
    .replace('mm', minutes.toString().padStart(2, '0'))
    .replace('ss', seconds.toString().padStart(2, '0'))
}

/**
 * Format text with line breaks
 * @param {string} text - Text to format
 * @param {number} maxLength - Maximum length per line
 * @returns {string} Formatted text
 */
export const formatTextWithLineBreaks = (text, maxLength = 80) => {
  if (!text) return ''
  
  const words = text.split(' ')
  const lines = []
  let currentLine = ''
  
  words.forEach(word => {
    if ((currentLine + word).length <= maxLength) {
      currentLine += (currentLine ? ' ' : '') + word
    } else {
      if (currentLine) lines.push(currentLine)
      currentLine = word
    }
  })
  
  if (currentLine) lines.push(currentLine)
  
  return lines.join('\n')
}

/**
 * Format initials from name
 * @param {string} name - Full name
 * @returns {string} Initials
 */
export const formatInitials = (name) => {
  if (!name) return ''
  
  return name
    .split(' ')
    .map(word => word.charAt(0).toUpperCase())
    .join('')
    .slice(0, 2)
}

/**
 * Format slug from text
 * @param {string} text - Text to convert to slug
 * @returns {string} Slug
 */
export const formatSlug = (text) => {
  if (!text) return ''
  
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/**
 * Format title case
 * @param {string} text - Text to format
 * @returns {string} Title case text
 */
export const formatTitleCase = (text) => {
  if (!text) return ''
  
  return text
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

/**
 * Format camel case
 * @param {string} text - Text to format
 * @returns {string} Camel case text
 */
export const formatCamelCase = (text) => {
  if (!text) return ''
  
  return text
    .toLowerCase()
    .replace(/[^a-zA-Z0-9]+(.)/g, (match, chr) => chr.toUpperCase())
}

/**
 * Format kebab case
 * @param {string} text - Text to format
 * @returns {string} Kebab case text
 */
export const formatKebabCase = (text) => {
  if (!text) return ''
  
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/**
 * Format snake case
 * @param {string} text - Text to format
 * @returns {string} Snake case text
 */
export const formatSnakeCase = (text) => {
  if (!text) return ''
  
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .replace(/[\s-]+/g, '_')
    .replace(/^_+|_+$/g, '')
}

export default {
  formatPhoneNumber,
  formatEmail,
  formatName,
  formatAddress,
  formatCurrency,
  formatNumber,
  formatPercentage,
  formatDate,
  formatTime,
  formatDateTime,
  formatDuration,
  formatFileSize,
  formatRelativeTime,
  formatBusinessHours,
  formatAppointmentStatus,
  formatTransactionStatus,
  formatUserRole,
  formatNotificationType,
  formatPriority,
  formatCustomerSegment,
  formatReportType,
  formatReportFormat,
  formatTextWithLineBreaks,
  formatInitials,
  formatSlug,
  formatTitleCase,
  formatCamelCase,
  formatKebabCase,
  formatSnakeCase
}
