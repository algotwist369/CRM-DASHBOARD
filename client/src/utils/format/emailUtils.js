/**
 * Email utility functions
 */

/**
 * Validate email address
 * @param {string} email - Email address to validate
 * @returns {boolean} Is valid email address
 */
export const isValidEmail = (email) => {
  if (!email || typeof email !== 'string') return false
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Format email address
 * @param {string} email - Email address to format
 * @returns {string} Formatted email address
 */
export const formatEmail = (email) => {
  if (!email || typeof email !== 'string') return ''
  
  return email.toLowerCase().trim()
}

/**
 * Parse email address
 * @param {string} email - Email address to parse
 * @returns {object} Parsed email address
 */
export const parseEmail = (email) => {
  if (!email || typeof email !== 'string') return null
  
  const formatted = formatEmail(email)
  const [localPart, domain] = formatted.split('@')
  
  if (!localPart || !domain) return null
  
  const [domainName, ...tldParts] = domain.split('.')
  const tld = tldParts.join('.')
  
  return {
    original: email,
    formatted,
    localPart,
    domain,
    domainName,
    tld,
    isValid: isValidEmail(email)
  }
}

/**
 * Get email domain
 * @param {string} email - Email address
 * @returns {string} Email domain
 */
export const getEmailDomain = (email) => {
  if (!email || typeof email !== 'string') return ''
  
  const parsed = parseEmail(email)
  return parsed?.domain || ''
}

/**
 * Get email local part
 * @param {string} email - Email address
 * @returns {string} Email local part
 */
export const getEmailLocalPart = (email) => {
  if (!email || typeof email !== 'string') return ''
  
  const parsed = parseEmail(email)
  return parsed?.localPart || ''
}

/**
 * Check if email is from domain
 * @param {string} email - Email address
 * @param {string} domain - Domain to check
 * @returns {boolean} Is email from domain
 */
export const isEmailFromDomain = (email, domain) => {
  if (!email || !domain) return false
  
  const emailDomain = getEmailDomain(email)
  return emailDomain.toLowerCase() === domain.toLowerCase()
}

/**
 * Check if email is from common provider
 * @param {string} email - Email address
 * @returns {boolean} Is email from common provider
 */
export const isEmailFromCommonProvider = (email) => {
  if (!email || typeof email !== 'string') return false
  
  const commonProviders = [
    'gmail.com',
    'yahoo.com',
    'hotmail.com',
    'outlook.com',
    'aol.com',
    'icloud.com',
    'protonmail.com',
    'yandex.com',
    'mail.ru',
    'zoho.com'
  ]
  
  const domain = getEmailDomain(email)
  return commonProviders.includes(domain.toLowerCase())
}

/**
 * Mask email address
 * @param {string} email - Email address to mask
 * @param {number} visibleStart - Number of characters to show at start
 * @param {number} visibleEnd - Number of characters to show at end
 * @param {string} maskChar - Character to use for masking
 * @returns {string} Masked email address
 */
export const maskEmail = (email, visibleStart = 2, visibleEnd = 3, maskChar = '*') => {
  if (!email || typeof email !== 'string') return ''
  
  const parsed = parseEmail(email)
  if (!parsed) return email
  
  const { localPart, domain } = parsed
  
  if (localPart.length <= visibleStart + visibleEnd) {
    return `${localPart}@${domain}`
  }
  
  const maskedLocal = localPart.slice(0, visibleStart) + 
                     maskChar.repeat(localPart.length - visibleStart - visibleEnd) + 
                     localPart.slice(-visibleEnd)
  
  return `${maskedLocal}@${domain}`
}

/**
 * Extract email addresses from text
 * @param {string} text - Text to extract email addresses from
 * @returns {array} Array of email addresses
 */
export const extractEmails = (text) => {
  if (!text || typeof text !== 'string') return []
  
  const emailRegex = /[^\s@]+@[^\s@]+\.[^\s@]+/g
  const matches = text.match(emailRegex) || []
  
  return matches.map(email => ({
    original: email,
    formatted: formatEmail(email),
    isValid: isValidEmail(email),
    domain: getEmailDomain(email),
    localPart: getEmailLocalPart(email)
  }))
}

/**
 * Normalize email address
 * @param {string} email - Email address to normalize
 * @returns {string} Normalized email address
 */
export const normalizeEmail = (email) => {
  if (!email || typeof email !== 'string') return ''
  
  return formatEmail(email)
}

/**
 * Compare email addresses
 * @param {string} email1 - First email address
 * @param {string} email2 - Second email address
 * @returns {boolean} Are email addresses equal
 */
export const compareEmails = (email1, email2) => {
  if (!email1 || !email2) return false
  
  const normalized1 = normalizeEmail(email1)
  const normalized2 = normalizeEmail(email2)
  
  return normalized1 === normalized2
}

/**
 * Get email provider info
 * @param {string} email - Email address
 * @returns {object} Email provider information
 */
export const getEmailProviderInfo = (email) => {
  if (!email || typeof email !== 'string') return null
  
  const domain = getEmailDomain(email)
  const provider = domain.toLowerCase()
  
  const providerInfo = {
    domain: provider,
    isCommon: isEmailFromCommonProvider(email),
    type: 'unknown'
  }
  
  // Categorize provider types
  if (provider.includes('gmail') || provider.includes('google')) {
    providerInfo.type = 'google'
  } else if (provider.includes('yahoo')) {
    providerInfo.type = 'yahoo'
  } else if (provider.includes('microsoft') || provider.includes('hotmail') || provider.includes('outlook')) {
    providerInfo.type = 'microsoft'
  } else if (provider.includes('apple') || provider.includes('icloud')) {
    providerInfo.type = 'apple'
  } else if (provider.includes('protonmail')) {
    providerInfo.type = 'protonmail'
  } else if (provider.includes('yandex')) {
    providerInfo.type = 'yandex'
  } else if (provider.includes('mail.ru')) {
    providerInfo.type = 'mailru'
  } else if (provider.includes('zoho')) {
    providerInfo.type = 'zoho'
  } else if (provider.includes('aol')) {
    providerInfo.type = 'aol'
  } else {
    providerInfo.type = 'custom'
  }
  
  return providerInfo
}

/**
 * Generate email from name
 * @param {string} firstName - First name
 * @param {string} lastName - Last name
 * @param {string} domain - Domain to use
 * @param {string} format - Format to use
 * @returns {string} Generated email address
 */
export const generateEmailFromName = (firstName, lastName, domain, format = 'first.last') => {
  if (!firstName || !lastName || !domain) return ''
  
  const first = firstName.toLowerCase().trim()
  const last = lastName.toLowerCase().trim()
  const cleanDomain = domain.toLowerCase().trim()
  
  let localPart = ''
  
  switch (format) {
    case 'first.last':
      localPart = `${first}.${last}`
      break
    case 'firstlast':
      localPart = `${first}${last}`
      break
    case 'last.first':
      localPart = `${last}.${first}`
      break
    case 'lastfirst':
      localPart = `${last}${first}`
      break
    case 'first_last':
      localPart = `${first}_${last}`
      break
    case 'first-last':
      localPart = `${first}-${last}`
      break
    case 'first':
      localPart = first
      break
    case 'last':
      localPart = last
      break
    default:
      localPart = `${first}.${last}`
  }
  
  return `${localPart}@${cleanDomain}`
}

/**
 * Check if email is disposable
 * @param {string} email - Email address
 * @returns {boolean} Is disposable email
 */
export const isDisposableEmail = (email) => {
  if (!email || typeof email !== 'string') return false
  
  const disposableDomains = [
    '10minutemail.com',
    'tempmail.org',
    'guerrillamail.com',
    'mailinator.com',
    'temp-mail.org',
    'throwaway.email',
    'getnada.com',
    'maildrop.cc',
    'yopmail.com',
    'sharklasers.com'
  ]
  
  const domain = getEmailDomain(email)
  return disposableDomains.includes(domain.toLowerCase())
}

/**
 * Get email info
 * @param {string} email - Email address to analyze
 * @returns {object} Email information
 */
export const getEmailInfo = (email) => {
  if (!email || typeof email !== 'string') return null
  
  const parsed = parseEmail(email)
  if (!parsed) return null
  
  const providerInfo = getEmailProviderInfo(email)
  
  return {
    ...parsed,
    provider: providerInfo,
    isDisposable: isDisposableEmail(email),
    isCommon: isEmailFromCommonProvider(email)
  }
}

/**
 * Email formats
 */
export const EMAIL_FORMATS = {
  FIRST_LAST: 'first.last',
  FIRSTLAST: 'firstlast',
  LAST_FIRST: 'last.first',
  LASTFIRST: 'lastfirst',
  FIRST_LAST_UNDERSCORE: 'first_last',
  FIRST_LAST_DASH: 'first-last',
  FIRST: 'first',
  LAST: 'last'
}

/**
 * Email provider types
 */
export const EMAIL_PROVIDER_TYPES = {
  GOOGLE: 'google',
  YAHOO: 'yahoo',
  MICROSOFT: 'microsoft',
  APPLE: 'apple',
  PROTONMAIL: 'protonmail',
  YANDEX: 'yandex',
  MAILRU: 'mailru',
  ZOHO: 'zoho',
  AOL: 'aol',
  CUSTOM: 'custom',
  UNKNOWN: 'unknown'
}

/**
 * Common email providers
 */
export const COMMON_EMAIL_PROVIDERS = [
  'gmail.com',
  'yahoo.com',
  'hotmail.com',
  'outlook.com',
  'aol.com',
  'icloud.com',
  'protonmail.com',
  'yandex.com',
  'mail.ru',
  'zoho.com'
]

/**
 * Disposable email domains
 */
export const DISPOSABLE_EMAIL_DOMAINS = [
  '10minutemail.com',
  'tempmail.org',
  'guerrillamail.com',
  'mailinator.com',
  'temp-mail.org',
  'throwaway.email',
  'getnada.com',
  'maildrop.cc',
  'yopmail.com',
  'sharklasers.com'
]

export default {
  isValidEmail,
  formatEmail,
  parseEmail,
  getEmailDomain,
  getEmailLocalPart,
  isEmailFromDomain,
  isEmailFromCommonProvider,
  maskEmail,
  extractEmails,
  normalizeEmail,
  compareEmails,
  getEmailProviderInfo,
  generateEmailFromName,
  isDisposableEmail,
  getEmailInfo,
  EMAIL_FORMATS,
  EMAIL_PROVIDER_TYPES,
  COMMON_EMAIL_PROVIDERS,
  DISPOSABLE_EMAIL_DOMAINS
}
