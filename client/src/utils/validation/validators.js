/**
 * Validation utility functions
 */

/**
 * Check if value is required (not empty)
 * @param {any} value - Value to check
 * @returns {boolean} True if value is not empty
 */
export const isRequired = (value) => {
  if (value === null || value === undefined) return false
  if (typeof value === 'string') return value.trim().length > 0
  if (Array.isArray(value)) return value.length > 0
  if (typeof value === 'object') return Object.keys(value).length > 0
  return true
}

/**
 * Check if value is a valid email
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid email
 */
export const isValidEmail = (email) => {
  if (!email || typeof email !== 'string') return false
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Check if value is a valid phone number
 * @param {string} phone - Phone number to validate
 * @returns {boolean} True if valid phone number
 */
export const isValidPhone = (phone) => {
  if (!phone || typeof phone !== 'string') return false
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/
  return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''))
}

/**
 * Check if value is a valid URL
 * @param {string} url - URL to validate
 * @returns {boolean} True if valid URL
 */
export const isValidUrl = (url) => {
  if (!url || typeof url !== 'string') return false
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

/**
 * Check if value is a valid date
 * @param {any} date - Date to validate
 * @returns {boolean} True if valid date
 */
export const isValidDate = (date) => {
  if (!date) return false
  const dateObj = new Date(date)
  return dateObj instanceof Date && !isNaN(dateObj)
}

/**
 * Check if value is a valid number
 * @param {any} value - Value to validate
 * @returns {boolean} True if valid number
 */
export const isValidNumber = (value) => {
  return !isNaN(value) && isFinite(value)
}

/**
 * Check if value is a valid integer
 * @param {any} value - Value to validate
 * @returns {boolean} True if valid integer
 */
export const isValidInteger = (value) => {
  return isValidNumber(value) && Number.isInteger(Number(value))
}

/**
 * Check if value is a valid positive number
 * @param {any} value - Value to validate
 * @returns {boolean} True if valid positive number
 */
export const isValidPositiveNumber = (value) => {
  return isValidNumber(value) && Number(value) > 0
}

/**
 * Check if value is a valid negative number
 * @param {any} value - Value to validate
 * @returns {boolean} True if valid negative number
 */
export const isValidNegativeNumber = (value) => {
  return isValidNumber(value) && Number(value) < 0
}

/**
 * Check if value is within range
 * @param {any} value - Value to validate
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {boolean} True if value is within range
 */
export const isInRange = (value, min, max) => {
  if (!isValidNumber(value)) return false
  const numValue = Number(value)
  return numValue >= min && numValue <= max
}

/**
 * Check if string has minimum length
 * @param {string} value - String to validate
 * @param {number} minLength - Minimum length
 * @returns {boolean} True if string meets minimum length
 */
export const hasMinLength = (value, minLength) => {
  if (!value || typeof value !== 'string') return false
  return value.length >= minLength
}

/**
 * Check if string has maximum length
 * @param {string} value - String to validate
 * @param {number} maxLength - Maximum length
 * @returns {boolean} True if string meets maximum length
 */
export const hasMaxLength = (value, maxLength) => {
  if (!value || typeof value !== 'string') return false
  return value.length <= maxLength
}

/**
 * Check if string has exact length
 * @param {string} value - String to validate
 * @param {number} length - Exact length
 * @returns {boolean} True if string has exact length
 */
export const hasExactLength = (value, length) => {
  if (!value || typeof value !== 'string') return false
  return value.length === length
}

/**
 * Check if string contains only letters
 * @param {string} value - String to validate
 * @returns {boolean} True if string contains only letters
 */
export const isAlpha = (value) => {
  if (!value || typeof value !== 'string') return false
  return /^[a-zA-Z]+$/.test(value)
}

/**
 * Check if string contains only letters and numbers
 * @param {string} value - String to validate
 * @returns {boolean} True if string contains only letters and numbers
 */
export const isAlphaNumeric = (value) => {
  if (!value || typeof value !== 'string') return false
  return /^[a-zA-Z0-9]+$/.test(value)
}

/**
 * Check if string contains only numbers
 * @param {string} value - String to validate
 * @returns {boolean} True if string contains only numbers
 */
export const isNumeric = (value) => {
  if (!value || typeof value !== 'string') return false
  return /^[0-9]+$/.test(value)
}

/**
 * Check if string is a valid password
 * @param {string} password - Password to validate
 * @param {object} options - Password validation options
 * @returns {boolean} True if valid password
 */
export const isValidPassword = (password, options = {}) => {
  if (!password || typeof password !== 'string') return false
  
  const {
    minLength = 8,
    requireUppercase = true,
    requireLowercase = true,
    requireNumbers = true,
    requireSpecialChars = true
  } = options
  
  if (password.length < minLength) return false
  if (requireUppercase && !/[A-Z]/.test(password)) return false
  if (requireLowercase && !/[a-z]/.test(password)) return false
  if (requireNumbers && !/[0-9]/.test(password)) return false
  if (requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) return false
  
  return true
}

/**
 * Check if value is a valid UUID
 * @param {string} value - Value to validate
 * @returns {boolean} True if valid UUID
 */
export const isValidUuid = (value) => {
  if (!value || typeof value !== 'string') return false
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  return uuidRegex.test(value)
}

/**
 * Check if value is a valid credit card number
 * @param {string} value - Credit card number to validate
 * @returns {boolean} True if valid credit card number
 */
export const isValidCreditCard = (value) => {
  if (!value || typeof value !== 'string') return false
  
  // Remove spaces and dashes
  const cleaned = value.replace(/[\s\-]/g, '')
  
  // Check if it's all digits and has valid length
  if (!/^\d{13,19}$/.test(cleaned)) return false
  
  // Luhn algorithm
  let sum = 0
  let isEven = false
  
  for (let i = cleaned.length - 1; i >= 0; i--) {
    let digit = parseInt(cleaned[i])
    
    if (isEven) {
      digit *= 2
      if (digit > 9) {
        digit -= 9
      }
    }
    
    sum += digit
    isEven = !isEven
  }
  
  return sum % 10 === 0
}

/**
 * Check if value is a valid postal code
 * @param {string} value - Postal code to validate
 * @param {string} country - Country code (optional)
 * @returns {boolean} True if valid postal code
 */
export const isValidPostalCode = (value, country = 'US') => {
  if (!value || typeof value !== 'string') return false
  
  const patterns = {
    US: /^\d{5}(-\d{4})?$/,
    CA: /^[A-Za-z]\d[A-Za-z] \d[A-Za-z]\d$/,
    UK: /^[A-Z]{1,2}\d[A-Z\d]? \d[A-Z]{2}$/,
    DE: /^\d{5}$/,
    FR: /^\d{5}$/,
    IT: /^\d{5}$/,
    ES: /^\d{5}$/,
    AU: /^\d{4}$/,
    JP: /^\d{3}-\d{4}$/
  }
  
  const pattern = patterns[country.toUpperCase()]
  return pattern ? pattern.test(value) : false
}

/**
 * Check if value is a valid IP address
 * @param {string} value - IP address to validate
 * @returns {boolean} True if valid IP address
 */
export const isValidIpAddress = (value) => {
  if (!value || typeof value !== 'string') return false
  
  // IPv4
  const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
  if (ipv4Regex.test(value)) return true
  
  // IPv6
  const ipv6Regex = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/
  if (ipv6Regex.test(value)) return true
  
  return false
}

/**
 * Check if value is a valid time format (HH:MM)
 * @param {string} value - Time to validate
 * @returns {boolean} True if valid time format
 */
export const isValidTime = (value) => {
  if (!value || typeof value !== 'string') return false
  const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/
  return timeRegex.test(value)
}

/**
 * Check if value is a valid time range
 * @param {string} startTime - Start time
 * @param {string} endTime - End time
 * @returns {boolean} True if valid time range
 */
export const isValidTimeRange = (startTime, endTime) => {
  if (!isValidTime(startTime) || !isValidTime(endTime)) return false
  
  const start = new Date(`2000-01-01 ${startTime}`)
  const end = new Date(`2000-01-01 ${endTime}`)
  
  return start < end
}

/**
 * Check if value is a valid business hours format
 * @param {object} hours - Business hours object
 * @returns {boolean} True if valid business hours
 */
export const isValidBusinessHours = (hours) => {
  if (!hours || typeof hours !== 'object') return false
  
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
  
  for (const day of days) {
    if (hours[day]) {
      const dayHours = hours[day]
      if (dayHours.isOpen) {
        if (!isValidTime(dayHours.open) || !isValidTime(dayHours.close)) {
          return false
        }
        if (!isValidTimeRange(dayHours.open, dayHours.close)) {
          return false
        }
      }
    }
  }
  
  return true
}

/**
 * Check if value is a valid appointment duration
 * @param {number} duration - Duration in minutes
 * @returns {boolean} True if valid duration
 */
export const isValidAppointmentDuration = (duration) => {
  return isValidPositiveNumber(duration) && duration >= 15 && duration <= 480
}

/**
 * Check if value is a valid rating
 * @param {number} rating - Rating value
 * @param {number} maxRating - Maximum rating (default: 5)
 * @returns {boolean} True if valid rating
 */
export const isValidRating = (rating, maxRating = 5) => {
  return isValidNumber(rating) && rating >= 0 && rating <= maxRating
}

/**
 * Check if value is a valid percentage
 * @param {number} value - Percentage value
 * @returns {boolean} True if valid percentage
 */
export const isValidPercentage = (value) => {
  return isValidNumber(value) && value >= 0 && value <= 100
}

/**
 * Check if value is a valid currency amount
 * @param {number} amount - Currency amount
 * @returns {boolean} True if valid currency amount
 */
export const isValidCurrencyAmount = (amount) => {
  return isValidNumber(amount) && amount >= 0
}

/**
 * Check if value is a valid file size
 * @param {number} size - File size in bytes
 * @param {number} maxSize - Maximum file size in bytes
 * @returns {boolean} True if valid file size
 */
export const isValidFileSize = (size, maxSize) => {
  return isValidNumber(size) && size > 0 && size <= maxSize
}

/**
 * Check if value is a valid file type
 * @param {string} filename - File name
 * @param {string[]} allowedTypes - Allowed file extensions
 * @returns {boolean} True if valid file type
 */
export const isValidFileType = (filename, allowedTypes) => {
  if (!filename || typeof filename !== 'string') return false
  if (!Array.isArray(allowedTypes)) return false
  
  const extension = filename.split('.').pop()?.toLowerCase()
  return allowedTypes.includes(extension)
}

/**
 * Check if value is a valid array
 * @param {any} value - Value to validate
 * @returns {boolean} True if valid array
 */
export const isValidArray = (value) => {
  return Array.isArray(value)
}

/**
 * Check if value is a valid object
 * @param {any} value - Value to validate
 * @returns {boolean} True if valid object
 */
export const isValidObject = (value) => {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

/**
 * Check if value is a valid boolean
 * @param {any} value - Value to validate
 * @returns {boolean} True if valid boolean
 */
export const isValidBoolean = (value) => {
  return typeof value === 'boolean'
}

/**
 * Check if value is a valid string
 * @param {any} value - Value to validate
 * @returns {boolean} True if valid string
 */
export const isValidString = (value) => {
  return typeof value === 'string'
}

/**
 * Check if value is a valid function
 * @param {any} value - Value to validate
 * @returns {boolean} True if valid function
 */
export const isValidFunction = (value) => {
  return typeof value === 'function'
}

/**
 * Check if value is a valid JSON string
 * @param {string} value - JSON string to validate
 * @returns {boolean} True if valid JSON string
 */
export const isValidJson = (value) => {
  if (!value || typeof value !== 'string') return false
  try {
    JSON.parse(value)
    return true
  } catch {
    return false
  }
}

/**
 * Check if value is a valid base64 string
 * @param {string} value - Base64 string to validate
 * @returns {boolean} True if valid base64 string
 */
export const isValidBase64 = (value) => {
  if (!value || typeof value !== 'string') return false
  const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/
  return base64Regex.test(value)
}

/**
 * Check if value is a valid hex color
 * @param {string} value - Hex color to validate
 * @returns {boolean} True if valid hex color
 */
export const isValidHexColor = (value) => {
  if (!value || typeof value !== 'string') return false
  const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/
  return hexColorRegex.test(value)
}

/**
 * Check if value is a valid RGB color
 * @param {string} value - RGB color to validate
 * @returns {boolean} True if valid RGB color
 */
export const isValidRgbColor = (value) => {
  if (!value || typeof value !== 'string') return false
  const rgbColorRegex = /^rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)$/
  const match = value.match(rgbColorRegex)
  if (!match) return false
  
  const r = parseInt(match[1])
  const g = parseInt(match[2])
  const b = parseInt(match[3])
  
  return r >= 0 && r <= 255 && g >= 0 && g <= 255 && b >= 0 && b <= 255
}

/**
 * Check if value is a valid HSL color
 * @param {string} value - HSL color to validate
 * @returns {boolean} True if valid HSL color
 */
export const isValidHslColor = (value) => {
  if (!value || typeof value !== 'string') return false
  const hslColorRegex = /^hsl\(\s*(\d{1,3})\s*,\s*(\d{1,3})%\s*,\s*(\d{1,3})%\s*\)$/
  const match = value.match(hslColorRegex)
  if (!match) return false
  
  const h = parseInt(match[1])
  const s = parseInt(match[2])
  const l = parseInt(match[3])
  
  return h >= 0 && h <= 360 && s >= 0 && s <= 100 && l >= 0 && l <= 100
}

export default {
  isRequired,
  isValidEmail,
  isValidPhone,
  isValidUrl,
  isValidDate,
  isValidNumber,
  isValidInteger,
  isValidPositiveNumber,
  isValidNegativeNumber,
  isInRange,
  hasMinLength,
  hasMaxLength,
  hasExactLength,
  isAlpha,
  isAlphaNumeric,
  isNumeric,
  isValidPassword,
  isValidUuid,
  isValidCreditCard,
  isValidPostalCode,
  isValidIpAddress,
  isValidTime,
  isValidTimeRange,
  isValidBusinessHours,
  isValidAppointmentDuration,
  isValidRating,
  isValidPercentage,
  isValidCurrencyAmount,
  isValidFileSize,
  isValidFileType,
  isValidArray,
  isValidObject,
  isValidBoolean,
  isValidString,
  isValidFunction,
  isValidJson,
  isValidBase64,
  isValidHexColor,
  isValidRgbColor,
  isValidHslColor
}
