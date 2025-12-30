/**
 * Phone utility functions
 */

/**
 * Format phone number
 * @param {string} phone - Phone number to format
 * @param {string} format - Format to use
 * @returns {string} Formatted phone number
 */
export const sanitizePhoneNumber = (phone) => {
  if (!phone || typeof phone !== 'string') return ''
  return phone.replace(/\D/g, '')
}

/**
 * Format phone number
 */
export const formatPhoneNumber = (phone, format = 'US') => {
  if (!phone || typeof phone !== 'string') return ''

  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '')

  switch (format) {
    case 'US':
      if (digits.length === 10) {
        return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`
      } else if (digits.length === 11 && digits[0] === '1') {
        return `+1 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`
      }
      break

    case 'INTERNATIONAL':
      if (digits.length >= 10) {
        return `+${digits}`
      }
      break

    case 'DASHES':
      if (digits.length === 10) {
        return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`
      }
      break

    case 'DOTS':
      if (digits.length === 10) {
        return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`
      }
      break

    case 'SPACES':
      if (digits.length === 10) {
        return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`
      }
      break

    case 'PARENTHESES':
      if (digits.length === 10) {
        return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)} ${digits.slice(6)}`
      }
      break

    default:
      return digits
  }

  return phone
}

/**
 * Parse phone number
 * @param {string} phone - Phone number to parse
 * @returns {object} Parsed phone number
 */
export const parsePhoneNumber = (phone) => {
  if (!phone || typeof phone !== 'string') return null

  const digits = phone.replace(/\D/g, '')

  if (digits.length === 10) {
    return {
      countryCode: '1',
      areaCode: digits.slice(0, 3),
      exchange: digits.slice(3, 6),
      number: digits.slice(6),
      formatted: formatPhoneNumber(phone, 'US'),
      international: `+1${digits}`,
      e164: `+1${digits}`
    }
  } else if (digits.length === 11 && digits[0] === '1') {
    return {
      countryCode: '1',
      areaCode: digits.slice(1, 4),
      exchange: digits.slice(4, 7),
      number: digits.slice(7),
      formatted: formatPhoneNumber(phone, 'US'),
      international: `+${digits}`,
      e164: `+${digits}`
    }
  }

  return null
}

/**
 * Validate phone number
 * @param {string} phone - Phone number to validate
 * @param {string} country - Country code
 * @returns {boolean} Is valid phone number
 */
export const isValidPhoneNumber = (phone, country = 'US') => {
  if (!phone || typeof phone !== 'string') return false

  const digits = phone.replace(/\D/g, '')

  switch (country) {
    case 'US':
      return digits.length === 10 || (digits.length === 11 && digits[0] === '1')

    case 'CA':
      return digits.length === 10 || (digits.length === 11 && digits[0] === '1')

    case 'UK':
      return digits.length >= 10 && digits.length <= 15

    case 'AU':
      return digits.length >= 9 && digits.length <= 12

    case 'DE':
      return digits.length >= 10 && digits.length <= 15

    case 'FR':
      return digits.length >= 10 && digits.length <= 15

    case 'JP':
      return digits.length >= 10 && digits.length <= 15

    case 'CN':
      return digits.length >= 10 && digits.length <= 15

    case 'IN':
      return digits.length >= 10 && digits.length <= 15

    case 'BR':
      return digits.length >= 10 && digits.length <= 15

    default:
      return digits.length >= 7 && digits.length <= 15
  }
}

/**
 * Get phone number type
 * @param {string} phone - Phone number to analyze
 * @returns {string} Phone number type
 */
export const getPhoneNumberType = (phone) => {
  if (!phone || typeof phone !== 'string') return 'unknown'

  const digits = phone.replace(/\D/g, '')

  if (digits.length === 10) {
    const areaCode = digits.slice(0, 3)
    const exchange = digits.slice(3, 6)

    // Check for toll-free numbers
    if (['800', '833', '844', '855', '866', '877', '888'].includes(areaCode)) {
      return 'toll-free'
    }

    // Check for premium rate numbers
    if (['900', '976'].includes(areaCode)) {
      return 'premium'
    }

    // Check for special services
    if (['911', '411', '311', '211', '511'].includes(digits.slice(0, 3))) {
      return 'emergency'
    }

    return 'standard'
  }

  return 'unknown'
}

/**
 * Mask phone number
 * @param {string} phone - Phone number to mask
 * @param {number} visibleStart - Number of digits to show at start
 * @param {number} visibleEnd - Number of digits to show at end
 * @param {string} maskChar - Character to use for masking
 * @returns {string} Masked phone number
 */
export const maskPhoneNumber = (phone, visibleStart = 3, visibleEnd = 4, maskChar = '*') => {
  if (!phone || typeof phone !== 'string') return ''

  const digits = phone.replace(/\D/g, '')
  if (digits.length <= visibleStart + visibleEnd) return phone

  const start = digits.slice(0, visibleStart)
  const end = digits.slice(-visibleEnd)
  const middle = maskChar.repeat(digits.length - visibleStart - visibleEnd)

  return start + middle + end
}

/**
 * Extract phone numbers from text
 * @param {string} text - Text to extract phone numbers from
 * @returns {array} Array of phone numbers
 */
export const extractPhoneNumbers = (text) => {
  if (!text || typeof text !== 'string') return []

  const phoneRegex = /(\+?1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})/g
  const matches = []
  let match

  while ((match = phoneRegex.exec(text)) !== null) {
    const fullMatch = match[0]
    const countryCode = match[1] || ''
    const areaCode = match[2]
    const exchange = match[3]
    const number = match[4]

    matches.push({
      full: fullMatch,
      countryCode: countryCode.replace(/\D/g, ''),
      areaCode,
      exchange,
      number,
      digits: `${areaCode}${exchange}${number}`,
      formatted: formatPhoneNumber(fullMatch, 'US')
    })
  }

  return matches
}

/**
 * Normalize phone number
 * @param {string} phone - Phone number to normalize
 * @returns {string} Normalized phone number
 */
export const normalizePhoneNumber = (phone) => {
  if (!phone || typeof phone !== 'string') return ''

  const digits = phone.replace(/\D/g, '')

  if (digits.length === 10) {
    return digits
  } else if (digits.length === 11 && digits[0] === '1') {
    return digits.slice(1)
  }

  return digits
}

/**
 * Format phone number for display
 * @param {string} phone - Phone number to format
 * @param {string} format - Format to use
 * @returns {string} Formatted phone number for display
 */
export const formatPhoneForDisplay = (phone, format = 'US') => {
  if (!phone || typeof phone !== 'string') return ''

  const normalized = normalizePhoneNumber(phone)
  return formatPhoneNumber(normalized, format)
}

/**
 * Get phone number country
 * @param {string} phone - Phone number to analyze
 * @returns {string} Country code
 */
export const getPhoneCountry = (phone) => {
  if (!phone || typeof phone !== 'string') return 'unknown'

  const digits = phone.replace(/\D/g, '')

  if (digits.length >= 10) {
    if (digits.length === 10 || (digits.length === 11 && digits[0] === '1')) {
      return 'US'
    } else if (digits.length === 11 && digits[0] === '4') {
      return 'UK'
    } else if (digits.length === 11 && digits[0] === '6') {
      return 'AU'
    } else if (digits.length === 11 && digits[0] === '4') {
      return 'DE'
    } else if (digits.length === 11 && digits[0] === '3') {
      return 'FR'
    } else if (digits.length === 11 && digits[0] === '8') {
      return 'JP'
    } else if (digits.length === 11 && digits[0] === '8') {
      return 'CN'
    } else if (digits.length === 11 && digits[0] === '9') {
      return 'IN'
    } else if (digits.length === 11 && digits[0] === '5') {
      return 'BR'
    }
  }

  return 'unknown'
}

/**
 * Compare phone numbers
 * @param {string} phone1 - First phone number
 * @param {string} phone2 - Second phone number
 * @returns {boolean} Are phone numbers equal
 */
export const comparePhoneNumbers = (phone1, phone2) => {
  if (!phone1 || !phone2) return false

  const normalized1 = normalizePhoneNumber(phone1)
  const normalized2 = normalizePhoneNumber(phone2)

  return normalized1 === normalized2
}

/**
 * Get phone number info
 * @param {string} phone - Phone number to analyze
 * @returns {object} Phone number information
 */
export const getPhoneNumberInfo = (phone) => {
  if (!phone || typeof phone !== 'string') return null

  const digits = phone.replace(/\D/g, '')
  const parsed = parsePhoneNumber(phone)

  return {
    original: phone,
    digits,
    normalized: normalizePhoneNumber(phone),
    formatted: formatPhoneNumber(phone, 'US'),
    international: parsed?.international || '',
    e164: parsed?.e164 || '',
    country: getPhoneCountry(phone),
    type: getPhoneNumberType(phone),
    isValid: isValidPhoneNumber(phone),
    areaCode: parsed?.areaCode || '',
    exchange: parsed?.exchange || '',
    number: parsed?.number || ''
  }
}

/**
 * Phone number formats
 */
export const PHONE_FORMATS = {
  US: 'US',
  INTERNATIONAL: 'INTERNATIONAL',
  DASHES: 'DASHES',
  DOTS: 'DOTS',
  SPACES: 'SPACES',
  PARENTHESES: 'PARENTHESES'
}

/**
 * Phone number types
 */
export const PHONE_TYPES = {
  STANDARD: 'standard',
  TOLL_FREE: 'toll-free',
  PREMIUM: 'premium',
  EMERGENCY: 'emergency',
  UNKNOWN: 'unknown'
}

/**
 * Country codes
 */
export const COUNTRY_CODES = {
  US: '1',
  CA: '1',
  UK: '44',
  AU: '61',
  DE: '49',
  FR: '33',
  JP: '81',
  CN: '86',
  IN: '91',
  BR: '55'
}

export default {
  sanitizePhoneNumber,
  formatPhoneNumber,
  parsePhoneNumber,
  isValidPhoneNumber,
  getPhoneNumberType,
  maskPhoneNumber,
  extractPhoneNumbers,
  normalizePhoneNumber,
  formatPhoneForDisplay,
  getPhoneCountry,
  comparePhoneNumbers,
  getPhoneNumberInfo,
  PHONE_FORMATS,
  PHONE_TYPES,
  COUNTRY_CODES
}
