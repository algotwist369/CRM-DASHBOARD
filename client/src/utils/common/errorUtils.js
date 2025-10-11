/**
 * Error utility functions
 */

/**
 * Check if value is an Error
 * @param {any} value - Value to check
 * @returns {boolean} Is Error
 */
export const isError = (value) => {
  return value instanceof Error
}

/**
 * Check if value is an Error-like object
 * @param {any} value - Value to check
 * @returns {boolean} Is Error-like
 */
export const isErrorLike = (value) => {
  return value && typeof value === 'object' && 'message' in value && 'stack' in value
}

/**
 * Create error object
 * @param {string} message - Error message
 * @param {string} code - Error code
 * @param {any} details - Error details
 * @returns {object} Error object
 */
export const createError = (message, code = null, details = null) => {
  const error = new Error(message)
  
  if (code) {
    error.code = code
  }
  
  if (details) {
    error.details = details
  }
  
  error.timestamp = new Date().toISOString()
  
  return error
}

/**
 * Get error message
 * @param {any} error - Error object
 * @returns {string} Error message
 */
export const getErrorMessage = (error) => {
  if (!error) return 'Unknown error'
  
  if (typeof error === 'string') return error
  
  if (isError(error) || isErrorLike(error)) {
    return error.message || 'Unknown error'
  }
  
  return String(error)
}

/**
 * Get error code
 * @param {any} error - Error object
 * @returns {string|null} Error code
 */
export const getErrorCode = (error) => {
  if (!error || typeof error !== 'object') return null
  
  return error.code || null
}

/**
 * Get error stack
 * @param {any} error - Error object
 * @returns {string|null} Error stack
 */
export const getErrorStack = (error) => {
  if (!error || typeof error !== 'object') return null
  
  return error.stack || null
}

/**
 * Get error details
 * @param {any} error - Error object
 * @returns {any} Error details
 */
export const getErrorDetails = (error) => {
  if (!error || typeof error !== 'object') return null
  
  return error.details || null
}

/**
 * Get error timestamp
 * @param {any} error - Error object
 * @returns {string|null} Error timestamp
 */
export const getErrorTimestamp = (error) => {
  if (!error || typeof error !== 'object') return null
  
  return error.timestamp || null
}

/**
 * Format error for display
 * @param {any} error - Error object
 * @param {string} format - Format type
 * @returns {string} Formatted error
 */
export const formatError = (error, format = 'full') => {
  if (!error) return 'No error information available'
  
  const message = getErrorMessage(error)
  const code = getErrorCode(error)
  const stack = getErrorStack(error)
  const timestamp = getErrorTimestamp(error)
  
  switch (format) {
    case 'message':
      return message
    case 'code':
      return code || message
    case 'stack':
      return stack || message
    case 'full':
      let formatted = message
      if (code) formatted += ` (${code})`
      if (timestamp) formatted += ` [${timestamp}]`
      if (stack) formatted += `\n\nStack trace:\n${stack}`
      return formatted
    case 'json':
      return JSON.stringify({
        message,
        code,
        stack,
        timestamp
      }, null, 2)
    default:
      return message
  }
}

/**
 * Log error
 * @param {any} error - Error object
 * @param {string} level - Log level
 * @param {object} context - Additional context
 * @returns {void}
 */
export const logError = (error, level = 'error', context = {}) => {
  const errorInfo = {
    message: getErrorMessage(error),
    code: getErrorCode(error),
    stack: getErrorStack(error),
    timestamp: getErrorTimestamp(error) || new Date().toISOString(),
    context
  }
  
  switch (level) {
    case 'debug':
      console.debug('Error:', errorInfo)
      break
    case 'info':
      console.info('Error:', errorInfo)
      break
    case 'warn':
      console.warn('Error:', errorInfo)
      break
    case 'error':
    default:
      console.error('Error:', errorInfo)
      break
  }
}

/**
 * Handle error
 * @param {any} error - Error object
 * @param {function} handler - Error handler function
 * @param {object} context - Additional context
 * @returns {any} Handler result
 */
export const handleError = (error, handler, context = {}) => {
  if (typeof handler !== 'function') {
    logError(error, 'error', context)
    return null
  }
  
  try {
    return handler(error, context)
  } catch (handlerError) {
    logError(handlerError, 'error', { originalError: error, context })
    return null
  }
}

/**
 * Wrap function with error handling
 * @param {function} fn - Function to wrap
 * @param {function} errorHandler - Error handler
 * @returns {function} Wrapped function
 */
export const withErrorHandling = (fn, errorHandler = null) => {
  return (...args) => {
    try {
      return fn(...args)
    } catch (error) {
      if (errorHandler) {
        return errorHandler(error, args)
      } else {
        logError(error, 'error', { args })
        throw error
      }
    }
  }
}

/**
 * Wrap async function with error handling
 * @param {function} fn - Async function to wrap
 * @param {function} errorHandler - Error handler
 * @returns {function} Wrapped async function
 */
export const withAsyncErrorHandling = (fn, errorHandler = null) => {
  return async (...args) => {
    try {
      return await fn(...args)
    } catch (error) {
      if (errorHandler) {
        return errorHandler(error, args)
      } else {
        logError(error, 'error', { args })
        throw error
      }
    }
  }
}

/**
 * Retry function with error handling
 * @param {function} fn - Function to retry
 * @param {number} maxRetries - Maximum number of retries
 * @param {number} delay - Delay between retries in milliseconds
 * @param {function} shouldRetry - Function to determine if should retry
 * @returns {Promise} Promise that resolves with function result
 */
export const retryWithErrorHandling = async (fn, maxRetries = 3, delay = 1000, shouldRetry = null) => {
  let lastError = null
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error
      
      if (attempt === maxRetries) {
        break
      }
      
      if (shouldRetry && !shouldRetry(error)) {
        break
      }
      
      if (delay > 0) {
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
  }
  
  throw lastError
}

/**
 * Validate error
 * @param {any} error - Error to validate
 * @returns {object} Validation result
 */
export const validateError = (error) => {
  if (!error) {
    return { isValid: false, error: 'Error is required' }
  }
  
  if (typeof error === 'string') {
    return { isValid: true, error: null }
  }
  
  if (isError(error) || isErrorLike(error)) {
    return { isValid: true, error: null }
  }
  
  return { isValid: false, error: 'Invalid error format' }
}

/**
 * Get error type
 * @param {any} error - Error object
 * @returns {string} Error type
 */
export const getErrorType = (error) => {
  if (!error) return 'unknown'
  
  if (typeof error === 'string') return 'string'
  if (isError(error)) return 'Error'
  if (isErrorLike(error)) return 'Error-like'
  
  return typeof error
}

/**
 * Check if error is network error
 * @param {any} error - Error object
 * @returns {boolean} Is network error
 */
export const isNetworkError = (error) => {
  if (!error) return false
  
  const message = getErrorMessage(error).toLowerCase()
  const networkKeywords = ['network', 'connection', 'timeout', 'fetch', 'xhr', 'cors']
  
  return networkKeywords.some(keyword => message.includes(keyword))
}

/**
 * Check if error is validation error
 * @param {any} error - Error object
 * @returns {boolean} Is validation error
 */
export const isValidationError = (error) => {
  if (!error) return false
  
  const message = getErrorMessage(error).toLowerCase()
  const validationKeywords = ['validation', 'invalid', 'required', 'format', 'pattern']
  
  return validationKeywords.some(keyword => message.includes(keyword))
}

/**
 * Check if error is authentication error
 * @param {any} error - Error object
 * @returns {boolean} Is authentication error
 */
export const isAuthenticationError = (error) => {
  if (!error) return false
  
  const message = getErrorMessage(error).toLowerCase()
  const authKeywords = ['authentication', 'authorization', 'unauthorized', 'forbidden', 'token', 'login']
  
  return authKeywords.some(keyword => message.includes(keyword))
}

/**
 * Check if error is server error
 * @param {any} error - Error object
 * @returns {boolean} Is server error
 */
export const isServerError = (error) => {
  if (!error) return false
  
  const code = getErrorCode(error)
  if (code && typeof code === 'number') {
    return code >= 500 && code < 600
  }
  
  const message = getErrorMessage(error).toLowerCase()
  const serverKeywords = ['server', 'internal', 'database', 'service', '500', '502', '503', '504']
  
  return serverKeywords.some(keyword => message.includes(keyword))
}

/**
 * Get error severity
 * @param {any} error - Error object
 * @returns {string} Error severity
 */
export const getErrorSeverity = (error) => {
  if (!error) return 'unknown'
  
  if (isNetworkError(error)) return 'medium'
  if (isValidationError(error)) return 'low'
  if (isAuthenticationError(error)) return 'high'
  if (isServerError(error)) return 'high'
  
  return 'medium'
}

/**
 * Error constants
 */
export const ERROR_CONSTANTS = {
  TYPES: {
    STRING: 'string',
    ERROR: 'Error',
    ERROR_LIKE: 'Error-like',
    UNKNOWN: 'unknown'
  },
  SEVERITIES: {
    LOW: 'low',
    MEDIUM: 'medium',
    HIGH: 'high',
    CRITICAL: 'critical'
  },
  LEVELS: {
    DEBUG: 'debug',
    INFO: 'info',
    WARN: 'warn',
    ERROR: 'error'
  },
  FORMATS: {
    MESSAGE: 'message',
    CODE: 'code',
    STACK: 'stack',
    FULL: 'full',
    JSON: 'json'
  }
}

export default {
  isError,
  isErrorLike,
  createError,
  getErrorMessage,
  getErrorCode,
  getErrorStack,
  getErrorDetails,
  getErrorTimestamp,
  formatError,
  logError,
  handleError,
  withErrorHandling,
  withAsyncErrorHandling,
  retryWithErrorHandling,
  validateError,
  getErrorType,
  isNetworkError,
  isValidationError,
  isAuthenticationError,
  isServerError,
  getErrorSeverity,
  ERROR_CONSTANTS
}
