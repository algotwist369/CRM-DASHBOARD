/**
 * Main utilities index
 * 
 * This file exports all utility functions from the utils directory.
 * Import specific utilities as needed to avoid bloating your bundle.
 */

// Authentication utilities
export * from './auth'

// Validation utilities
export * from './validation'

// Date utilities
export * from './date'

// Format utilities
export * from './format'

// Business utilities
export * from './business'

// Customer utilities
export * from './customer'

// Appointment utilities
export * from './appointment'

// Notification utilities
export * from './notification'

// Report utilities
export * from './report'

// Common utilities
export * from './common'

// Default exports for each utility category
export { default as authUtils } from './auth'
export { default as validationUtils } from './validation'
export { default as dateUtils } from './date'
export { default as formatUtils } from './format'
export { default as businessUtils } from './business'
export { default as customerUtils } from './customer'
export { default as appointmentUtils } from './appointment'
export { default as notificationUtils } from './notification'
export { default as reportUtils } from './report'
export { default as commonUtils } from './common'

// Re-export commonly used utilities for convenience
export {
  // Auth utilities
  setToken,
  getToken,
  removeToken,
  decodeToken,
  isTokenExpired,
  hasRole,
  getRoles,
  isManager,
  isAdmin,
  hasPermission,
  canEdit,
  canView,
  
  // Validation utilities
  isValidEmail,
  isValidPassword,
  isStrongPassword,
  isPhoneNumber,
  validateForm,
  formatErrorMessage,
  
  // Date utilities
  formatDate,
  isPastDate,
  addDays,
  diffDates,
  formatTime,
  isBusinessHours,
  addMinutes,
  getDaysInMonth,
  getWeeksInMonth,
  isWeekend,
  
  // Format utilities
  formatCurrency,
  toCurrency,
  formatNumber,
  roundNumber,
  toPercentage,
  capitalize,
  truncate,
  slugify,
  formatPhoneNumber,
  isValidPhoneNumber,
  formatEmail,
  isValidEmail as isValidEmailFormat,
  
  // Business utilities
  formatBusinessName,
  generateBusinessSlug,
  isValidBusinessName,
  formatBusinessAddress,
  isValidBusinessHours,
  formatBusinessHours,
  isBusinessOpen,
  calculateBusinessRating,
  formatBusinessRating,
  getBusinessStatus,
  formatBusinessStatus,
  getBusinessTypeDisplayName,
  getBusinessMetrics,
  
  // Customer utilities
  formatCustomerName,
  isValidCustomerName,
  isValidCustomerEmail,
  isValidCustomerPhone,
  calculateCustomerAge,
  getCustomerAgeGroup,
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
  
  // Appointment utilities
  isValidAppointment,
  isValidAppointmentDate,
  isValidAppointmentTime,
  isValidAppointmentDuration,
  isValidAppointmentStatus,
  getAppointmentStatusDisplayName,
  getAppointmentStatusColor,
  calculateAppointmentEndTime,
  isAppointmentInPast,
  isAppointmentToday,
  isAppointmentTomorrow,
  isAppointmentThisWeek,
  isAppointmentThisMonth,
  getAppointmentRelativeTime,
  formatAppointmentDate,
  formatAppointmentTime,
  formatAppointmentDuration,
  getAppointmentStatistics,
  
  // Notification utilities
  createNotification,
  generateNotificationId,
  isValidNotification,
  getNotificationTypeDisplayName,
  getNotificationTypeColor,
  getNotificationTypeIcon,
  formatNotificationMessage,
  isNotificationExpired,
  isNotificationRead,
  markNotificationAsRead,
  markNotificationAsUnread,
  getNotificationStatistics,
  
  // Report utilities
  createReport,
  generateReportId,
  validateReportData,
  getReportTypeDisplayName,
  getReportStatusDisplayName,
  getReportStatusColor,
  getReportStatusIcon,
  updateReportStatus,
  calculateReportStatistics,
  getReportStatistics,
  
  // Common utilities
  isArray,
  isEmpty as isEmptyArray,
  hasItems,
  getLength as getArrayLength,
  getFirst,
  getLast,
  removeDuplicates,
  groupBy,
  sortBy,
  filterBy,
  findBy,
  isObject,
  isEmpty as isEmptyObject,
  hasProperties,
  getKeys,
  getValues,
  getEntries,
  getSize as getObjectSize,
  getNested,
  setNested,
  removeProperty,
  pick,
  omit,
  merge,
  deepMerge,
  clone,
  deepClone,
  isString,
  isEmpty as isEmptyString,
  isBlank,
  isNotBlank,
  getLength as getStringLength,
  capitalize as capitalizeString,
  titleCase,
  camelCase,
  kebabCase,
  snakeCase,
  pascalCase,
  truncate as truncateString,
  slugify as slugifyString,
  isFile,
  isFileList,
  getFileExtension,
  getFileSize,
  formatFileSize,
  getFileMimeType,
  isImageFile,
  isVideoFile,
  isAudioFile,
  isDocumentFile,
  validateFileSize,
  validateFileType,
  validateFileExtension,
  isValidURL,
  parseURL,
  getURLProtocol,
  getURLHostname,
  getURLPort,
  getURLPathname,
  getURLSearchParams,
  getURLHash,
  getURLOrigin,
  buildURL,
  addQueryParam,
  removeQueryParam,
  getQueryParam,
  getAllQueryParams,
  setQueryParams,
  clearQueryParams,
  isAbsoluteURL,
  isRelativeURL,
  toAbsoluteURL,
  toRelativeURL,
  isSameOrigin,
  getDomain,
  getSubdomain,
  isHTTPS,
  isHTTP,
  forceHTTPS,
  isLocalStorageAvailable,
  isSessionStorageAvailable,
  setLocalStorageItem,
  getLocalStorageItem,
  removeLocalStorageItem,
  clearLocalStorage,
  getLocalStorageKeys,
  getLocalStorageSize,
  setSessionStorageItem,
  getSessionStorageItem,
  removeSessionStorageItem,
  clearSessionStorage,
  getSessionStorageKeys,
  getSessionStorageSize,
  setStorageItemWithExpiration,
  getStorageItemWithExpiration,
  isStorageItemExpired,
  cleanExpiredStorageItems,
  getStorageStatistics,
  exportStorageData,
  importStorageData,
  isError,
  isErrorLike,
  createError,
  getErrorMessage,
  getErrorCode,
  getErrorStack,
  getErrorDetails,
  getErrorTimestamp,
  formatError,
  logError as logErrorUtil,
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
  logFunction
} from './common'

// Export constants
export {
  AUTH_CONSTANTS,
  VALIDATION_CONSTANTS,
  DATE_CONSTANTS,
  FORMAT_CONSTANTS,
  BUSINESS_CONSTANTS,
  CUSTOMER_CONSTANTS,
  APPOINTMENT_CONSTANTS,
  NOTIFICATION_CONSTANTS,
  REPORT_CONSTANTS,
  ARRAY_CONSTANTS,
  OBJECT_CONSTANTS,
  STRING_CONSTANTS,
  FILE_CONSTANTS,
  URL_CONSTANTS,
  STORAGE_CONSTANTS,
  ERROR_CONSTANTS,
  LOG_CONSTANTS
} from './common'

// Utility function to get all available utilities
export const getAvailableUtilities = () => {
  return {
    auth: [
      'setToken', 'getToken', 'removeToken', 'decodeToken', 'isTokenExpired',
      'hasRole', 'getRoles', 'isManager', 'isAdmin',
      'hasPermission', 'canEdit', 'canView'
    ],
    validation: [
      'isValidEmail', 'isValidPassword', 'isStrongPassword', 'isPhoneNumber',
      'validateForm', 'formatErrorMessage'
    ],
    date: [
      'formatDate', 'isPastDate', 'addDays', 'diffDates',
      'formatTime', 'isBusinessHours', 'addMinutes',
      'getDaysInMonth', 'getWeeksInMonth', 'isWeekend'
    ],
    format: [
      'formatCurrency', 'toCurrency', 'formatNumber', 'roundNumber', 'toPercentage',
      'capitalize', 'truncate', 'slugify',
      'formatPhoneNumber', 'isValidPhoneNumber',
      'formatEmail', 'isValidEmail'
    ],
    business: [
      'formatBusinessName', 'generateBusinessSlug', 'isValidBusinessName',
      'formatBusinessAddress', 'isValidBusinessHours', 'formatBusinessHours',
      'isBusinessOpen', 'calculateBusinessRating', 'formatBusinessRating',
      'getBusinessStatus', 'formatBusinessStatus', 'getBusinessTypeDisplayName',
      'getBusinessMetrics'
    ],
    customer: [
      'formatCustomerName', 'isValidCustomerName', 'isValidCustomerEmail',
      'isValidCustomerPhone', 'calculateCustomerAge', 'getCustomerAgeGroup',
      'formatCustomerAddress', 'calculateCustomerLifetimeValue',
      'calculateCustomerVisitFrequency', 'calculateCustomerAverageSpend',
      'getCustomerLastVisit', 'calculateCustomerDaysSinceLastVisit',
      'getCustomerPreferences', 'calculateCustomerSatisfactionScore',
      'getCustomerStatus', 'formatCustomerStatus', 'getCustomerMetrics'
    ],
    appointment: [
      'isValidAppointment', 'isValidAppointmentDate', 'isValidAppointmentTime',
      'isValidAppointmentDuration', 'isValidAppointmentStatus',
      'getAppointmentStatusDisplayName', 'getAppointmentStatusColor',
      'calculateAppointmentEndTime', 'isAppointmentInPast', 'isAppointmentToday',
      'isAppointmentTomorrow', 'isAppointmentThisWeek', 'isAppointmentThisMonth',
      'getAppointmentRelativeTime', 'formatAppointmentDate', 'formatAppointmentTime',
      'formatAppointmentDuration', 'getAppointmentStatistics'
    ],
    notification: [
      'createNotification', 'generateNotificationId', 'isValidNotification',
      'getNotificationTypeDisplayName', 'getNotificationTypeColor',
      'getNotificationTypeIcon', 'formatNotificationMessage',
      'isNotificationExpired', 'isNotificationRead', 'markNotificationAsRead',
      'markNotificationAsUnread', 'getNotificationStatistics'
    ],
    report: [
      'createReport', 'generateReportId', 'validateReportData',
      'getReportTypeDisplayName', 'getReportStatusDisplayName',
      'getReportStatusColor', 'getReportStatusIcon', 'updateReportStatus',
      'calculateReportStatistics', 'getReportStatistics'
    ],
    common: [
      'isArray', 'isEmptyArray', 'hasItems', 'getArrayLength', 'getFirst', 'getLast',
      'removeDuplicates', 'groupBy', 'sortBy', 'filterBy', 'findBy',
      'isObject', 'isEmptyObject', 'hasProperties', 'getKeys', 'getValues',
      'getEntries', 'getObjectSize', 'getNested', 'setNested', 'removeProperty',
      'pick', 'omit', 'merge', 'deepMerge', 'clone', 'deepClone',
      'isString', 'isEmptyString', 'isBlank', 'isNotBlank', 'getStringLength',
      'capitalizeString', 'titleCase', 'camelCase', 'kebabCase', 'snakeCase',
      'pascalCase', 'truncateString', 'slugifyString',
      'isFile', 'isFileList', 'getFileExtension', 'getFileSize', 'formatFileSize',
      'getFileMimeType', 'isImageFile', 'isVideoFile', 'isAudioFile',
      'isDocumentFile', 'validateFileSize', 'validateFileType', 'validateFileExtension',
      'isValidURL', 'parseURL', 'getURLProtocol', 'getURLHostname', 'getURLPort',
      'getURLPathname', 'getURLSearchParams', 'getURLHash', 'getURLOrigin',
      'buildURL', 'addQueryParam', 'removeQueryParam', 'getQueryParam',
      'getAllQueryParams', 'setQueryParams', 'clearQueryParams',
      'isAbsoluteURL', 'isRelativeURL', 'toAbsoluteURL', 'toRelativeURL',
      'isSameOrigin', 'getDomain', 'getSubdomain', 'isHTTPS', 'isHTTP', 'forceHTTPS',
      'isLocalStorageAvailable', 'isSessionStorageAvailable',
      'setLocalStorageItem', 'getLocalStorageItem', 'removeLocalStorageItem',
      'clearLocalStorage', 'getLocalStorageKeys', 'getLocalStorageSize',
      'setSessionStorageItem', 'getSessionStorageItem', 'removeSessionStorageItem',
      'clearSessionStorage', 'getSessionStorageKeys', 'getSessionStorageSize',
      'setStorageItemWithExpiration', 'getStorageItemWithExpiration',
      'isStorageItemExpired', 'cleanExpiredStorageItems', 'getStorageStatistics',
      'exportStorageData', 'importStorageData',
      'isError', 'isErrorLike', 'createError', 'getErrorMessage', 'getErrorCode',
      'getErrorStack', 'getErrorDetails', 'getErrorTimestamp', 'formatError',
      'logErrorUtil', 'handleError', 'withErrorHandling', 'withAsyncErrorHandling',
      'retryWithErrorHandling', 'validateError', 'getErrorType',
      'isNetworkError', 'isValidationError', 'isAuthenticationError',
      'isServerError', 'getErrorSeverity',
      'setLogLevel', 'getLogLevel', 'isLogLevelEnabled', 'formatLogMessage',
      'logDebug', 'logInfo', 'logWarn', 'logError', 'logCritical', 'log',
      'createLogger', 'logPerformance', 'logApiRequest', 'logApiResponse',
      'logUserAction', 'logSecurityEvent', 'logBusinessEvent', 'logSystemEvent',
      'logErrorWithStack', 'logFunctionEntry', 'logFunctionExit', 'logFunction'
    ]
  }
}

// Utility function to check if a utility exists
export const hasUtility = (category, utilityName) => {
  const utilities = getAvailableUtilities()
  return utilities[category] && utilities[category].includes(utilityName)
}

// Utility function to get utility category
export const getUtilityCategory = (utilityName) => {
  const utilities = getAvailableUtilities()
  
  for (const [category, utilityList] of Object.entries(utilities)) {
    if (utilityList.includes(utilityName)) {
      return category
    }
  }
  
  return null
}

// Utility function to get all utilities in a category
export const getUtilitiesInCategory = (category) => {
  const utilities = getAvailableUtilities()
  return utilities[category] || []
}

// Export version information
export const UTILS_VERSION = '1.0.0'

// Export build information
export const UTILS_BUILD_INFO = {
  version: UTILS_VERSION,
  buildDate: new Date().toISOString(),
  categories: Object.keys(getAvailableUtilities()),
  totalUtilities: Object.values(getAvailableUtilities()).flat().length
}
