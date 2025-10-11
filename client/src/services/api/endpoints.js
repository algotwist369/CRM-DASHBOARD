// API Endpoints Configuration
const API_ENDPOINTS = {
  // Authentication endpoints
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    VERIFY_EMAIL: '/auth/verify-email',
    RESEND_VERIFICATION: '/auth/resend-verification',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    VERIFY_OTP: '/auth/verify-otp',
    RESEND_OTP: '/auth/resend-otp',
    VERIFY_TOKEN: '/auth/me'
  },

  // Admin endpoints
  ADMIN: {
    DASHBOARD: '/admin/dashboard',
    BUSINESSES: '/admin/businesses',
    BUSINESS: (id) => `/admin/businesses/${id}`,
    MANAGERS: '/admin/managers',
    MANAGER: (id) => `/admin/managers/${id}`,
    REPORTS: '/admin/reports',
    STATS: '/admin/stats',
    EXPORT: '/admin/export'
  },

  // Business endpoints
  BUSINESS: {
    LIST: '/businesses',
    CREATE: '/businesses',
    GET: (id) => `/businesses/${id}`,
    UPDATE: (id) => `/businesses/${id}`,
    DELETE: (id) => `/businesses/${id}`,
    STATS: (id) => `/businesses/${id}/stats`,
    STAFF: (id) => `/businesses/${id}/staff`,
    CUSTOMERS: (id) => `/businesses/${id}/customers`,
    APPOINTMENTS: (id) => `/businesses/${id}/appointments`,
    TRANSACTIONS: (id) => `/businesses/${id}/transactions`,
    ANALYTICS: (id) => `/businesses/${id}/analytics`,
    EXPORT: (id) => `/businesses/${id}/export`
  },

  // Manager endpoints
  MANAGER: {
    DASHBOARD: '/manager/dashboard',
    STAFF: '/manager/staff',
    STAFF_MEMBER: (id) => `/manager/staff/${id}`,
    CUSTOMERS: '/manager/customers',
    CUSTOMER: (id) => `/manager/customers/${id}`,
    APPOINTMENTS: '/manager/appointments',
    APPOINTMENT: (id) => `/manager/appointments/${id}`,
    TRANSACTIONS: '/manager/transactions',
    TRANSACTION: (id) => `/manager/transactions/${id}`,
    DAILY_BUSINESS: '/manager/daily-business',
    DAILY_BUSINESS_ITEM: (id) => `/manager/daily-business/${id}`,
    NOTIFICATIONS: '/manager/notifications',
    NOTIFICATION: (id) => `/manager/notifications/${id}`,
    CAMPAIGNS: '/manager/campaigns',
    CAMPAIGN: (id) => `/manager/campaigns/${id}`,
    REPORTS: '/manager/reports'
  },

  // Staff endpoints
  STAFF: {
    DASHBOARD: '/staff/dashboard',
    PROFILE: '/staff/profile',
    BUSINESS: '/staff/business',
    APPOINTMENTS: '/staff/appointments',
    APPOINTMENT: (id) => `/staff/appointments/${id}`,
    CUSTOMERS: '/staff/customers',
    CUSTOMER: (id) => `/staff/customers/${id}`,
    SCHEDULE: '/staff/schedule',
    AVAILABILITY: '/staff/availability',
    PERFORMANCE: '/staff/performance',
    SERVICES: '/staff/services'
  },

  // Customer endpoints
  CUSTOMER: {
    LIST: '/customers',
    CREATE: '/customers',
    GET: (id) => `/customers/${id}`,
    UPDATE: (id) => `/customers/${id}`,
    DELETE: (id) => `/customers/${id}`,
    APPOINTMENTS: (id) => `/customers/${id}/appointments`,
    TRANSACTIONS: (id) => `/customers/${id}/transactions`,
    HISTORY: (id) => `/customers/${id}/history`,
    NOTES: (id) => `/customers/${id}/notes`,
    LOYALTY_POINTS: (id) => `/customers/${id}/loyalty-points`,
    SEGMENTS: (id) => `/customers/${id}/segments`,
    ANALYTICS: '/customers/analytics',
    EXPORT: '/customers/export'
  },

  // Appointment endpoints
  APPOINTMENT: {
    LIST: '/appointments',
    CREATE: '/appointments',
    GET: (id) => `/appointments/${id}`,
    UPDATE: (id) => `/appointments/${id}`,
    DELETE: (id) => `/appointments/${id}`,
    AVAILABLE_SLOTS: '/appointments/available-slots',
    CHECK_AVAILABILITY: '/appointments/check-availability',
    STAFF_AVAILABILITY: '/appointments/staff-availability',
    BUSINESS_HOURS: '/appointments/business-hours',
    BLOCKED_SLOTS: '/appointments/blocked-slots',
    RECURRING_SLOTS: '/appointments/recurring-slots',
    SLOT_RECOMMENDATIONS: '/appointments/slot-recommendations',
    VALIDATE: '/appointments/validate',
    CALCULATE_PRICE: '/appointments/calculate-price',
    SEND_CONFIRMATION: (id) => `/appointments/${id}/send-confirmation`,
    SEND_REMINDER: (id) => `/appointments/${id}/send-reminder`,
    RESCHEDULE: (id) => `/appointments/${id}/reschedule`,
    CANCEL: (id) => `/appointments/${id}/cancel`,
    CONFIRMATION: (id) => `/appointments/${id}/confirmation`,
    HISTORY: (id) => `/appointments/${id}/history`,
    REMINDERS: (id) => `/appointments/${id}/reminders`,
    FEEDBACK: (id) => `/appointments/${id}/feedback`,
    STATS: '/appointments/stats',
    TODAY: '/appointments/today',
    UPCOMING: '/appointments/upcoming',
    OVERDUE: '/appointments/overdue',
    BY_DATE: '/appointments/by-date',
    BY_STATUS: '/appointments/by-status',
    EXPORT: '/appointments/export'
  },

  // Transaction endpoints
  TRANSACTION: {
    LIST: '/transactions',
    CREATE: '/transactions',
    GET: (id) => `/transactions/${id}`,
    UPDATE: (id) => `/transactions/${id}`,
    DELETE: (id) => `/transactions/${id}`,
    RECEIPT: (id) => `/transactions/${id}/receipt`,
    SEND_RECEIPT: (id) => `/transactions/${id}/send-receipt`,
    HISTORY: (id) => `/transactions/${id}/history`,
    ITEMS: (id) => `/transactions/${id}/items`,
    ADD_ITEM: (id) => `/transactions/${id}/items`,
    REMOVE_ITEM: (id, itemId) => `/transactions/${id}/items/${itemId}`,
    APPLY_DISCOUNT: (id) => `/transactions/${id}/discount`,
    REMOVE_DISCOUNT: (id) => `/transactions/${id}/discount`,
    CALCULATE_TAX: (id) => `/transactions/${id}/calculate-tax`,
    STATS: '/transactions/stats',
    TODAY: '/transactions/today',
    BY_DATE: '/transactions/by-date',
    BY_STATUS: '/transactions/by-status',
    BY_PAYMENT_METHOD: '/transactions/by-payment-method',
    REVENUE: '/transactions/revenue',
    TOP_CUSTOMERS: '/transactions/top-customers',
    TOP_SERVICES: '/transactions/top-services',
    EXPORT: '/transactions/export'
  },

  // Notification endpoints
  NOTIFICATION: {
    LIST: '/notifications',
    CREATE: '/notifications',
    GET: (id) => `/notifications/${id}`,
    UPDATE: (id) => `/notifications/${id}`,
    DELETE: (id) => `/notifications/${id}`,
    SEND: (id) => `/notifications/${id}/send`,
    STATS: (id) => `/notifications/${id}/stats`,
    RECIPIENTS: (id) => `/notifications/${id}/recipients`,
    ADD_RECIPIENTS: (id) => `/notifications/${id}/recipients`,
    REMOVE_RECIPIENTS: (id) => `/notifications/${id}/recipients`,
    HISTORY: (id) => `/notifications/${id}/history`,
    DUPLICATE: (id) => `/notifications/${id}/duplicate`,
    MARK_ALL_READ: '/notifications/mark-all-read',
    UNREAD_COUNT: '/notifications/unread-count',
    RECENT: '/notifications/recent',
    SCHEDULED: '/notifications/scheduled',
    FAILED: '/notifications/failed',
    RETRY: (id) => `/notifications/${id}/retry`,
    EXPORT: '/notifications/export'
  },

  // Campaign endpoints
  CAMPAIGN: {
    LIST: '/campaigns',
    CREATE: '/campaigns',
    GET: (id) => `/campaigns/${id}`,
    UPDATE: (id) => `/campaigns/${id}`,
    DELETE: (id) => `/campaigns/${id}`,
    LAUNCH: (id) => `/campaigns/${id}/launch`,
    PAUSE: (id) => `/campaigns/${id}/pause`,
    STOP: (id) => `/campaigns/${id}/stop`,
    DUPLICATE: (id) => `/campaigns/${id}/duplicate`,
    STATS: (id) => `/campaigns/${id}/stats`,
    ANALYTICS: (id) => `/campaigns/${id}/analytics`,
    RECIPIENTS: (id) => `/campaigns/${id}/recipients`,
    TEMPLATES: '/campaigns/templates',
    FROM_TEMPLATE: '/campaigns/from-template',
    ACTIVE: '/campaigns/active',
    SCHEDULED: '/campaigns/scheduled',
    EXPORT: '/campaigns/export'
  },

  // Report endpoints
  REPORT: {
    LIST: '/reports',
    GENERATE: '/reports/generate',
    GET: (id) => `/reports/${id}`,
    UPDATE: (id) => `/reports/${id}`,
    DELETE: (id) => `/reports/${id}`,
    DATA: (id) => `/reports/${id}/data`,
    DOWNLOAD: (id) => `/reports/${id}/download`,
    SCHEDULE: (id) => `/reports/${id}/schedule`,
    TEMPLATES: '/reports/templates',
    FROM_TEMPLATE: '/reports/from-template',
    TYPES: '/reports/types',
    STATS: '/reports/stats',
    SCHEDULED: '/reports/scheduled',
    RECENT: '/reports/recent',
    EXPORT: '/reports/export'
  },

  // Analytics endpoints
  ANALYTICS: {
    OVERVIEW: '/analytics',
    REVENUE: '/analytics/revenue',
    CUSTOMERS: '/analytics/customers',
    APPOINTMENTS: '/analytics/appointments',
    STAFF: '/analytics/staff',
    SERVICES: '/analytics/services',
    TRENDS: '/analytics/trends',
    COMPARE: '/analytics/compare',
    KPIS: '/analytics/kpis',
    DASHBOARD: '/analytics/dashboard',
    INSIGHTS: '/analytics/insights',
    EXPORT: '/analytics/export'
  },

  // Public endpoints
  PUBLIC: {
    BUSINESS_INFO: '/public/business-info',
    SERVICES: '/public/services',
    STAFF: '/public/staff',
    AVAILABLE_SLOTS: '/public/available-slots',
    BOOKING: '/public/booking',
    APPOINTMENT_STATUS: '/public/appointment-status'
  },

  // Upload endpoints
  UPLOAD: {
    IMAGE: '/upload/image',
    DOCUMENT: '/upload/document',
    AVATAR: '/upload/avatar',
    BUSINESS_LOGO: '/upload/business-logo',
    SERVICE_IMAGE: '/upload/service-image'
  },

  // Export endpoints
  EXPORT: {
    CSV: '/export/csv',
    PDF: '/export/pdf',
    EXCEL: '/export/excel',
    JSON: '/export/json'
  },

  // Customer segments endpoints
  CUSTOMER_SEGMENTS: {
    LIST: '/customer-segments',
    CREATE: '/customer-segments',
    GET: (id) => `/customer-segments/${id}`,
    UPDATE: (id) => `/customer-segments/${id}`,
    DELETE: (id) => `/customer-segments/${id}`,
    CUSTOMERS: (id) => `/customer-segments/${id}/customers`,
    ADD_CUSTOMERS: (id) => `/customer-segments/${id}/customers`,
    REMOVE_CUSTOMERS: (id) => `/customer-segments/${id}/customers`,
    ANALYTICS: (id) => `/customer-segments/${id}/analytics`,
    STATS: '/customer-segments/stats',
    TEMPLATES: '/customer-segments/templates',
    FROM_TEMPLATE: '/customer-segments/from-template',
    EXPORT: (id) => `/customer-segments/${id}/export`
  },

  // Service endpoints
  SERVICE: {
    LIST: '/services',
    CREATE: '/services',
    GET: (id) => `/services/${id}`,
    UPDATE: (id) => `/services/${id}`,
    DELETE: (id) => `/services/${id}`,
    DURATION: (id) => `/services/${id}/duration`,
    PRICING: (id) => `/services/${id}/pricing`,
    AVAILABILITY: (id) => `/services/${id}/availability`
  }
}

// Helper function to build query strings
export const buildQueryString = (params) => {
  const searchParams = new URLSearchParams()
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== '') {
      if (Array.isArray(value)) {
        value.forEach(item => searchParams.append(key, item))
      } else {
        searchParams.append(key, value)
      }
    }
  })
  
  return searchParams.toString()
}

// Helper function to build endpoint with query params
export const buildEndpoint = (endpoint, params = {}) => {
  const queryString = buildQueryString(params)
  return queryString ? `${endpoint}?${queryString}` : endpoint
}

export default API_ENDPOINTS
