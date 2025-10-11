/**
 * Log utility functions
 */

/**
 * Log levels
 */
export const LOG_LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
  CRITICAL: 4
}

/**
 * Current log level
 */
let currentLogLevel = LOG_LEVELS.INFO

/**
 * Set log level
 * @param {number|string} level - Log level
 * @returns {void}
 */
export const setLogLevel = (level) => {
  if (typeof level === 'string') {
    const levelMap = {
      debug: LOG_LEVELS.DEBUG,
      info: LOG_LEVELS.INFO,
      warn: LOG_LEVELS.WARN,
      error: LOG_LEVELS.ERROR,
      critical: LOG_LEVELS.CRITICAL
    }
    currentLogLevel = levelMap[level.toLowerCase()] || LOG_LEVELS.INFO
  } else if (typeof level === 'number') {
    currentLogLevel = level
  }
}

/**
 * Get current log level
 * @returns {number} Current log level
 */
export const getLogLevel = () => {
  return currentLogLevel
}

/**
 * Check if log level is enabled
 * @param {number} level - Log level to check
 * @returns {boolean} Is enabled
 */
export const isLogLevelEnabled = (level) => {
  return level >= currentLogLevel
}

/**
 * Format log message
 * @param {string} level - Log level
 * @param {string} message - Log message
 * @param {any} data - Additional data
 * @param {object} context - Context information
 * @returns {string} Formatted log message
 */
export const formatLogMessage = (level, message, data = null, context = {}) => {
  const timestamp = new Date().toISOString()
  const levelUpper = level.toUpperCase()
  
  let formatted = `[${timestamp}] ${levelUpper}: ${message}`
  
  if (data !== null) {
    formatted += `\nData: ${JSON.stringify(data, null, 2)}`
  }
  
  if (Object.keys(context).length > 0) {
    formatted += `\nContext: ${JSON.stringify(context, null, 2)}`
  }
  
  return formatted
}

/**
 * Log debug message
 * @param {string} message - Log message
 * @param {any} data - Additional data
 * @param {object} context - Context information
 * @returns {void}
 */
export const logDebug = (message, data = null, context = {}) => {
  if (!isLogLevelEnabled(LOG_LEVELS.DEBUG)) return
  
  const formatted = formatLogMessage('debug', message, data, context)
  console.debug(formatted)
}

/**
 * Log info message
 * @param {string} message - Log message
 * @param {any} data - Additional data
 * @param {object} context - Context information
 * @returns {void}
 */
export const logInfo = (message, data = null, context = {}) => {
  if (!isLogLevelEnabled(LOG_LEVELS.INFO)) return
  
  const formatted = formatLogMessage('info', message, data, context)
  console.info(formatted)
}

/**
 * Log warning message
 * @param {string} message - Log message
 * @param {any} data - Additional data
 * @param {object} context - Context information
 * @returns {void}
 */
export const logWarn = (message, data = null, context = {}) => {
  if (!isLogLevelEnabled(LOG_LEVELS.WARN)) return
  
  const formatted = formatLogMessage('warn', message, data, context)
  console.warn(formatted)
}

/**
 * Log error message
 * @param {string} message - Log message
 * @param {any} data - Additional data
 * @param {object} context - Context information
 * @returns {void}
 */
export const logError = (message, data = null, context = {}) => {
  if (!isLogLevelEnabled(LOG_LEVELS.ERROR)) return
  
  const formatted = formatLogMessage('error', message, data, context)
  console.error(formatted)
}

/**
 * Log critical message
 * @param {string} message - Log message
 * @param {any} data - Additional data
 * @param {object} context - Context information
 * @returns {void}
 */
export const logCritical = (message, data = null, context = {}) => {
  if (!isLogLevelEnabled(LOG_LEVELS.CRITICAL)) return
  
  const formatted = formatLogMessage('critical', message, data, context)
  console.error(formatted)
}

/**
 * Log message with specified level
 * @param {string} level - Log level
 * @param {string} message - Log message
 * @param {any} data - Additional data
 * @param {object} context - Context information
 * @returns {void}
 */
export const log = (level, message, data = null, context = {}) => {
  const levelMap = {
    debug: logDebug,
    info: logInfo,
    warn: logWarn,
    error: logError,
    critical: logCritical
  }
  
  const logFunction = levelMap[level.toLowerCase()]
  if (logFunction) {
    logFunction(message, data, context)
  } else {
    logError(`Unknown log level: ${level}`, { message, data, context })
  }
}

/**
 * Create logger with context
 * @param {object} context - Default context
 * @returns {object} Logger object
 */
export const createLogger = (context = {}) => {
  return {
    debug: (message, data = null, additionalContext = {}) => {
      logDebug(message, data, { ...context, ...additionalContext })
    },
    info: (message, data = null, additionalContext = {}) => {
      logInfo(message, data, { ...context, ...additionalContext })
    },
    warn: (message, data = null, additionalContext = {}) => {
      logWarn(message, data, { ...context, ...additionalContext })
    },
    error: (message, data = null, additionalContext = {}) => {
      logError(message, data, { ...context, ...additionalContext })
    },
    critical: (message, data = null, additionalContext = {}) => {
      logCritical(message, data, { ...context, ...additionalContext })
    }
  }
}

/**
 * Log performance timing
 * @param {string} label - Timing label
 * @param {number} startTime - Start time
 * @param {number} endTime - End time
 * @param {object} context - Context information
 * @returns {void}
 */
export const logPerformance = (label, startTime, endTime, context = {}) => {
  const duration = endTime - startTime
  const message = `Performance: ${label} took ${duration}ms`
  
  logInfo(message, { duration, startTime, endTime }, context)
}

/**
 * Log API request
 * @param {string} method - HTTP method
 * @param {string} url - Request URL
 * @param {object} data - Request data
 * @param {object} context - Context information
 * @returns {void}
 */
export const logApiRequest = (method, url, data = null, context = {}) => {
  const message = `API Request: ${method} ${url}`
  
  logInfo(message, { method, url, data }, context)
}

/**
 * Log API response
 * @param {string} method - HTTP method
 * @param {string} url - Request URL
 * @param {number} status - Response status
 * @param {any} data - Response data
 * @param {object} context - Context information
 * @returns {void}
 */
export const logApiResponse = (method, url, status, data = null, context = {}) => {
  const message = `API Response: ${method} ${url} - ${status}`
  
  if (status >= 400) {
    logError(message, { method, url, status, data }, context)
  } else {
    logInfo(message, { method, url, status, data }, context)
  }
}

/**
 * Log user action
 * @param {string} action - User action
 * @param {object} data - Action data
 * @param {object} context - Context information
 * @returns {void}
 */
export const logUserAction = (action, data = null, context = {}) => {
  const message = `User Action: ${action}`
  
  logInfo(message, data, context)
}

/**
 * Log security event
 * @param {string} event - Security event
 * @param {object} data - Event data
 * @param {object} context - Context information
 * @returns {void}
 */
export const logSecurityEvent = (event, data = null, context = {}) => {
  const message = `Security Event: ${event}`
  
  logWarn(message, data, context)
}

/**
 * Log business event
 * @param {string} event - Business event
 * @param {object} data - Event data
 * @param {object} context - Context information
 * @returns {void}
 */
export const logBusinessEvent = (event, data = null, context = {}) => {
  const message = `Business Event: ${event}`
  
  logInfo(message, data, context)
}

/**
 * Log system event
 * @param {string} event - System event
 * @param {object} data - Event data
 * @param {object} context - Context information
 * @returns {void}
 */
export const logSystemEvent = (event, data = null, context = {}) => {
  const message = `System Event: ${event}`
  
  logInfo(message, data, context)
}

/**
 * Log error with stack trace
 * @param {Error} error - Error object
 * @param {object} context - Context information
 * @returns {void}
 */
export const logErrorWithStack = (error, context = {}) => {
  const message = `Error: ${error.message}`
  const data = {
    name: error.name,
    message: error.message,
    stack: error.stack,
    code: error.code
  }
  
  logError(message, data, context)
}

/**
 * Log function entry
 * @param {string} functionName - Function name
 * @param {array} args - Function arguments
 * @param {object} context - Context information
 * @returns {void}
 */
export const logFunctionEntry = (functionName, args = [], context = {}) => {
  const message = `Function Entry: ${functionName}`
  
  logDebug(message, { args }, context)
}

/**
 * Log function exit
 * @param {string} functionName - Function name
 * @param {any} result - Function result
 * @param {object} context - Context information
 * @returns {void}
 */
export const logFunctionExit = (functionName, result = null, context = {}) => {
  const message = `Function Exit: ${functionName}`
  
  logDebug(message, { result }, context)
}

/**
 * Log function with entry and exit
 * @param {string} functionName - Function name
 * @param {function} fn - Function to wrap
 * @param {object} context - Context information
 * @returns {function} Wrapped function
 */
export const logFunction = (functionName, fn, context = {}) => {
  return (...args) => {
    logFunctionEntry(functionName, args, context)
    
    try {
      const result = fn(...args)
      
      if (result instanceof Promise) {
        return result.then(
          (resolved) => {
            logFunctionExit(functionName, resolved, context)
            return resolved
          },
          (rejected) => {
            logErrorWithStack(rejected, { functionName, args, ...context })
            throw rejected
          }
        )
      } else {
        logFunctionExit(functionName, result, context)
        return result
      }
    } catch (error) {
      logErrorWithStack(error, { functionName, args, ...context })
      throw error
    }
  }
}

/**
 * Log constants
 */
export const LOG_CONSTANTS = {
  LEVELS: LOG_LEVELS,
  TYPES: {
    DEBUG: 'debug',
    INFO: 'info',
    WARN: 'warn',
    ERROR: 'error',
    CRITICAL: 'critical'
  },
  CATEGORIES: {
    PERFORMANCE: 'performance',
    API: 'api',
    USER: 'user',
    SECURITY: 'security',
    BUSINESS: 'business',
    SYSTEM: 'system',
    FUNCTION: 'function'
  }
}

export default {
  LOG_LEVELS,
  setLogLevel,
  getLogLevel,
  isLogLevelEnabled,
  formatLogMessage,
  logDebug,
  logInfo,
  logWarn,
  logError,
  logCritical,
  log,
  createLogger,
  logPerformance,
  logApiRequest,
  logApiResponse,
  logUserAction,
  logSecurityEvent,
  logBusinessEvent,
  logSystemEvent,
  logErrorWithStack,
  logFunctionEntry,
  logFunctionExit,
  logFunction,
  LOG_CONSTANTS
}
