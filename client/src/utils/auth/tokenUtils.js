/**
 * Token utility functions for JWT token management
 */

// Token storage keys
const TOKEN_KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  TOKEN_EXPIRY: 'token_expiry'
}

/**
 * Store token in localStorage
 * @param {string} token - JWT token
 * @param {string} type - Token type ('access' or 'refresh')
 */
export const storeToken = (token, type = 'access') => {
  try {
    const key = type === 'access' ? TOKEN_KEYS.ACCESS_TOKEN : TOKEN_KEYS.REFRESH_TOKEN
    localStorage.setItem(key, token)
    
    if (type === 'access') {
      // Store token expiry time
      const expiry = getTokenExpiry(token)
      if (expiry) {
        localStorage.setItem(TOKEN_KEYS.TOKEN_EXPIRY, expiry.toString())
      }
    }
  } catch (error) {
    console.error('Error storing token:', error)
  }
}

/**
 * Retrieve token from localStorage
 * @param {string} type - Token type ('access' or 'refresh')
 * @returns {string|null} Token or null if not found
 */
export const getToken = (type = 'access') => {
  try {
    const key = type === 'access' ? TOKEN_KEYS.ACCESS_TOKEN : TOKEN_KEYS.REFRESH_TOKEN
    return localStorage.getItem(key)
  } catch (error) {
    console.error('Error retrieving token:', error)
    return null
  }
}

/**
 * Remove token from localStorage
 * @param {string} type - Token type ('access' or 'refresh')
 */
export const removeToken = (type = 'access') => {
  try {
    const key = type === 'access' ? TOKEN_KEYS.ACCESS_TOKEN : TOKEN_KEYS.REFRESH_TOKEN
    localStorage.removeItem(key)
    
    if (type === 'access') {
      localStorage.removeItem(TOKEN_KEYS.TOKEN_EXPIRY)
    }
  } catch (error) {
    console.error('Error removing token:', error)
  }
}

/**
 * Clear all tokens from localStorage
 */
export const clearAllTokens = () => {
  try {
    Object.values(TOKEN_KEYS).forEach(key => {
      localStorage.removeItem(key)
    })
  } catch (error) {
    console.error('Error clearing tokens:', error)
  }
}

/**
 * Decode JWT token payload
 * @param {string} token - JWT token
 * @returns {object|null} Decoded payload or null if invalid
 */
export const decodeToken = (token) => {
  try {
    if (!token) return null
    
    const parts = token.split('.')
    if (parts.length !== 3) return null
    
    const payload = parts[1]
    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'))
    return JSON.parse(decoded)
  } catch (error) {
    console.error('Error decoding token:', error)
    return null
  }
}

/**
 * Get token expiry time
 * @param {string} token - JWT token
 * @returns {number|null} Expiry timestamp or null if invalid
 */
export const getTokenExpiry = (token) => {
  try {
    const payload = decodeToken(token)
    return payload?.exp ? payload.exp * 1000 : null
  } catch (error) {
    console.error('Error getting token expiry:', error)
    return null
  }
}

/**
 * Check if token is expired
 * @param {string} token - JWT token
 * @returns {boolean} True if expired, false otherwise
 */
export const isTokenExpired = (token) => {
  try {
    const expiry = getTokenExpiry(token)
    if (!expiry) return true
    
    return Date.now() >= expiry
  } catch (error) {
    console.error('Error checking token expiry:', error)
    return true
  }
}

/**
 * Check if token will expire soon
 * @param {string} token - JWT token
 * @param {number} thresholdMinutes - Minutes before expiry to consider "soon"
 * @returns {boolean} True if expiring soon, false otherwise
 */
export const isTokenExpiringSoon = (token, thresholdMinutes = 5) => {
  try {
    const expiry = getTokenExpiry(token)
    if (!expiry) return true
    
    const threshold = thresholdMinutes * 60 * 1000
    return Date.now() >= (expiry - threshold)
  } catch (error) {
    console.error('Error checking token expiry soon:', error)
    return true
  }
}

/**
 * Get token time until expiry
 * @param {string} token - JWT token
 * @returns {number|null} Milliseconds until expiry or null if invalid
 */
export const getTimeUntilExpiry = (token) => {
  try {
    const expiry = getTokenExpiry(token)
    if (!expiry) return null
    
    return expiry - Date.now()
  } catch (error) {
    console.error('Error getting time until expiry:', error)
    return null
  }
}

/**
 * Get token time until expiry in human readable format
 * @param {string} token - JWT token
 * @returns {string|null} Human readable time or null if invalid
 */
export const getTimeUntilExpiryFormatted = (token) => {
  try {
    const timeUntilExpiry = getTimeUntilExpiry(token)
    if (timeUntilExpiry === null) return null
    
    if (timeUntilExpiry <= 0) return 'Expired'
    
    const minutes = Math.floor(timeUntilExpiry / (1000 * 60))
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)
    
    if (days > 0) return `${days} day${days > 1 ? 's' : ''}`
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''}`
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''}`
    
    return 'Less than a minute'
  } catch (error) {
    console.error('Error formatting time until expiry:', error)
    return null
  }
}

/**
 * Validate token format
 * @param {string} token - JWT token
 * @returns {boolean} True if valid format, false otherwise
 */
export const isValidTokenFormat = (token) => {
  try {
    if (!token || typeof token !== 'string') return false
    
    const parts = token.split('.')
    return parts.length === 3 && parts.every(part => part.length > 0)
  } catch (error) {
    console.error('Error validating token format:', error)
    return false
  }
}

/**
 * Get token issuer
 * @param {string} token - JWT token
 * @returns {string|null} Issuer or null if invalid
 */
export const getTokenIssuer = (token) => {
  try {
    const payload = decodeToken(token)
    return payload?.iss || null
  } catch (error) {
    console.error('Error getting token issuer:', error)
    return null
  }
}

/**
 * Get token subject (user ID)
 * @param {string} token - JWT token
 * @returns {string|null} Subject or null if invalid
 */
export const getTokenSubject = (token) => {
  try {
    const payload = decodeToken(token)
    return payload?.sub || null
  } catch (error) {
    console.error('Error getting token subject:', error)
    return null
  }
}

/**
 * Get token audience
 * @param {string} token - JWT token
 * @returns {string|array|null} Audience or null if invalid
 */
export const getTokenAudience = (token) => {
  try {
    const payload = decodeToken(token)
    return payload?.aud || null
  } catch (error) {
    console.error('Error getting token audience:', error)
    return null
  }
}

/**
 * Get token issued at time
 * @param {string} token - JWT token
 * @returns {number|null} Issued at timestamp or null if invalid
 */
export const getTokenIssuedAt = (token) => {
  try {
    const payload = decodeToken(token)
    return payload?.iat ? payload.iat * 1000 : null
  } catch (error) {
    console.error('Error getting token issued at:', error)
    return null
  }
}

/**
 * Get token not before time
 * @param {string} token - JWT token
 * @returns {number|null} Not before timestamp or null if invalid
 */
export const getTokenNotBefore = (token) => {
  try {
    const payload = decodeToken(token)
    return payload?.nbf ? payload.nbf * 1000 : null
  } catch (error) {
    console.error('Error getting token not before:', error)
    return null
  }
}

/**
 * Check if token is valid (not expired and valid format)
 * @param {string} token - JWT token
 * @returns {boolean} True if valid, false otherwise
 */
export const isValidToken = (token) => {
  try {
    return isValidTokenFormat(token) && !isTokenExpired(token)
  } catch (error) {
    console.error('Error validating token:', error)
    return false
  }
}

/**
 * Get token claims (custom data)
 * @param {string} token - JWT token
 * @returns {object|null} Claims or null if invalid
 */
export const getTokenClaims = (token) => {
  try {
    const payload = decodeToken(token)
    if (!payload) return null
    
    // Remove standard JWT claims
    const standardClaims = ['iss', 'sub', 'aud', 'exp', 'nbf', 'iat', 'jti']
    const claims = {}
    
    Object.keys(payload).forEach(key => {
      if (!standardClaims.includes(key)) {
        claims[key] = payload[key]
      }
    })
    
    return claims
  } catch (error) {
    console.error('Error getting token claims:', error)
    return null
  }
}

/**
 * Create authorization header
 * @param {string} token - JWT token
 * @param {string} type - Token type ('Bearer', 'Basic', etc.)
 * @returns {string|null} Authorization header or null if invalid
 */
export const createAuthHeader = (token, type = 'Bearer') => {
  try {
    if (!token || !isValidTokenFormat(token)) return null
    return `${type} ${token}`
  } catch (error) {
    console.error('Error creating auth header:', error)
    return null
  }
}

/**
 * Extract token from authorization header
 * @param {string} header - Authorization header
 * @param {string} type - Expected token type ('Bearer', 'Basic', etc.)
 * @returns {string|null} Token or null if invalid
 */
export const extractTokenFromHeader = (header, type = 'Bearer') => {
  try {
    if (!header || typeof header !== 'string') return null
    
    const parts = header.split(' ')
    if (parts.length !== 2 || parts[0] !== type) return null
    
    return parts[1]
  } catch (error) {
    console.error('Error extracting token from header:', error)
    return null
  }
}

/**
 * Token utility constants
 */
export const TOKEN_CONSTANTS = {
  STORAGE_KEYS: TOKEN_KEYS,
  DEFAULT_THRESHOLD_MINUTES: 5,
  TOKEN_TYPES: {
    ACCESS: 'access',
    REFRESH: 'refresh'
  },
  AUTH_TYPES: {
    BEARER: 'Bearer',
    BASIC: 'Basic'
  }
}

export default {
  storeToken,
  getToken,
  removeToken,
  clearAllTokens,
  decodeToken,
  getTokenExpiry,
  isTokenExpired,
  isTokenExpiringSoon,
  getTimeUntilExpiry,
  getTimeUntilExpiryFormatted,
  isValidTokenFormat,
  getTokenIssuer,
  getTokenSubject,
  getTokenAudience,
  getTokenIssuedAt,
  getTokenNotBefore,
  isValidToken,
  getTokenClaims,
  createAuthHeader,
  extractTokenFromHeader,
  TOKEN_CONSTANTS
}
