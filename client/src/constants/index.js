// Main constants index file
// Exports all constants from subdirectories

// API constants
export * from './api'

// Authentication constants
export * from './auth'

// Business constants
export * from './business'

// Customer constants
export * from './customer'

// Appointment constants
export * from './appointment'

// Notification constants
export * from './notification'

// UI constants
export * from './ui'

// Validation constants
export * from './validation'

// Configuration
export { default as config, CONFIG_UTILITIES } from './config'

// Re-export specific constants for convenience
export { endpoints } from './api/endpoints'
export { HTTP_STATUS, API_STATUS, REQUEST_STATUS } from './api/statusCodes'
export { API_ERROR_MESSAGES, VALIDATION_ERROR_MESSAGES, USER_ERROR_MESSAGES } from './api/errorMessages'

export { USER_ROLES, ROLE_HIERARCHY, ROLE_DISPLAY_NAMES } from './auth/roles'
export { PERMISSIONS, ROLE_PERMISSIONS } from './auth/permissions'
export { TOKEN_KEYS, SESSION_KEYS, LOCAL_STORAGE_KEYS } from './auth/tokenKeys'

export { BUSINESS_TYPES, BUSINESS_TYPE_DISPLAY_NAMES } from './business/businessTypes'
export { SERVICE_TYPES, SERVICE_TYPE_DISPLAY_NAMES } from './business/serviceTypes'
export { STAFF_ROLES, STAFF_ROLE_DISPLAY_NAMES } from './business/staffRoles'

export { CUSTOMER_SEGMENTS, CUSTOMER_SEGMENT_DISPLAY_NAMES } from './customer/customerSegments'
export { CUSTOMER_STATUS, CUSTOMER_STATUS_DISPLAY_NAMES } from './customer/customerStatus'

export { APPOINTMENT_STATUS, APPOINTMENT_STATUS_DISPLAY_NAMES } from './appointment/appointmentStatus'
export { BOOKING_SOURCES, BOOKING_SOURCE_DISPLAY_NAMES } from './appointment/bookingSources'
export { PAYMENT_METHODS, PAYMENT_METHOD_DISPLAY_NAMES } from './appointment/paymentMethods'

export { NOTIFICATION_TYPES, NOTIFICATION_TYPE_DISPLAY_NAMES } from './notification/notificationTypes'
export { CAMPAIGN_TYPES, CAMPAIGN_TYPE_DISPLAY_NAMES } from './notification/campaignTypes'
export { DELIVERY_CHANNELS, DELIVERY_CHANNEL_DISPLAY_NAMES } from './notification/deliveryChannels'

export { COLORS, SEMANTIC_COLORS, THEME_COLORS } from './ui/colors'
export { BREAKPOINTS, BREAKPOINT_VALUES, MEDIA_QUERIES } from './ui/breakpoints'
export { SPACING, SEMANTIC_SPACING, RESPONSIVE_SPACING } from './ui/spacing'
export { TYPOGRAPHY, TYPOGRAPHY_SCALE, RESPONSIVE_TYPOGRAPHY } from './ui/typography'
export { ANIMATIONS, ANIMATION_PRESETS, ANIMATION_UTILITIES } from './ui/animations'

export { VALIDATION_PATTERNS, PATTERN_DESCRIPTIONS } from './validation/patterns'
export { VALIDATION_LIMITS, LIMIT_CATEGORIES, LIMIT_VALIDATORS } from './validation/limits'
