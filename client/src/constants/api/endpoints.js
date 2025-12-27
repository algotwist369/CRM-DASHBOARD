const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'

export const endpoints = {
  // Auth endpoints
  auth: {
    login: `${API_BASE_URL}/auth/login`,
    register: `${API_BASE_URL}/auth/register`,
    logout: `${API_BASE_URL}/auth/logout`,
    refresh: `${API_BASE_URL}/auth/refresh`,
    sendOTP: `${API_BASE_URL}/auth/otp/send`,
    verifyOTP: `${API_BASE_URL}/auth/otp/verify`,
  },

  // Admin endpoints
  admin: {
    dashboard: `${API_BASE_URL}/admin/dashboard`,
    stats: `${API_BASE_URL}/admin/stats`,
    // Notifications
    notifications: `${API_BASE_URL}/admin/notifications`,
    unreadCount: `${API_BASE_URL}/admin/notifications/unread-count`,
    recentNotifications: `${API_BASE_URL}/admin/notifications/recent`,
    markNotificationRead: (id) => `${API_BASE_URL}/admin/notifications/${id}/read`,
    markAllNotificationsRead: `${API_BASE_URL}/admin/notifications/read-all`,
    deleteNotification: (id) => `${API_BASE_URL}/admin/notifications/${id}`,
    deleteAllNotifications: `${API_BASE_URL}/admin/notifications/all`,
    // Profile & Settings
    getProfile: `${API_BASE_URL}/admin/profile`,
    updateProfile: `${API_BASE_URL}/admin/profile`,
    updatePassword: `${API_BASE_URL}/admin/password`,
    // Business Management
    businesses: `${API_BASE_URL}/admin/businesses`,
    business: (id) => `${API_BASE_URL}/admin/${id}`,
    createBusiness: `${API_BASE_URL}/admin/business`,
    updateBusiness: (id) => `${API_BASE_URL}/business/${id}`,
    updateBusinessStatus: (id) => `${API_BASE_URL}/admin/business/${id}/status`,
    deleteBusiness: (id) => `${API_BASE_URL}/admin/business/${id}`,
    businessLink: (id) => `${API_BASE_URL}/admin/business/${id}/link`,
    // Manager Management
    managers: `${API_BASE_URL}/admin/managers`,
    manager: (id) => `${API_BASE_URL}/admin/manager/${id}`,
    createManager: `${API_BASE_URL}/admin/manager`,
    updateManager: (id) => `${API_BASE_URL}/admin/manager/${id}`,
    updateManagerStatus: (id) => `${API_BASE_URL}/admin/manager/${id}/status`,
    deleteManager: (id) => `${API_BASE_URL}/admin/manager/${id}`,
  },

  // Manager endpoints
  manager: {
    dashboard: `${API_BASE_URL}/manager/dashboard`,
    staff: `${API_BASE_URL}/manager/staff`,
    staffMember: (id) => `${API_BASE_URL}/manager/staff/${id}`,
    addStaff: `${API_BASE_URL}/manager/staff`,
    updateStaff: (id) => `${API_BASE_URL}/manager/staff/${id}`,
    deleteStaff: (id) => `${API_BASE_URL}/manager/staff/${id}`,
    transactions: `${API_BASE_URL}/manager/transactions`,
    addTransaction: `${API_BASE_URL}/manager/transaction`,
    getTransaction: (id) => `${API_BASE_URL}/manager/transaction/${id}`,
    updateTransaction: (id) => `${API_BASE_URL}/manager/transaction/${id}`,
  },

  // Staff endpoints
  staff: {
    dashboard: `${API_BASE_URL}/staff/dashboard`,
    profile: `${API_BASE_URL}/staff/profile`,
    updateProfile: `${API_BASE_URL}/staff/profile`,
    business: `${API_BASE_URL}/staff/business`,
    // Notifications (prepared for future implementation)
    notifications: `${API_BASE_URL}/staff/notifications`,
    unreadCount: `${API_BASE_URL}/staff/notifications/unread-count`,
    recentNotifications: `${API_BASE_URL}/staff/notifications/recent`,
    markNotificationRead: (id) => `${API_BASE_URL}/staff/notifications/${id}/read`,
    markAllNotificationsRead: `${API_BASE_URL}/staff/notifications/read-all`,
  },

  // Appointment endpoints
  appointments: {
    // Public/booking endpoints
    businessInfo: (link) => `${API_BASE_URL}/appointments/business/${link}/info`,
    businessInfoById: (id) => `${API_BASE_URL}/appointments/business/${id}/info`,
    availableSlots: (link) => `${API_BASE_URL}/appointments/business/${link}/slots`,
    availableSlotsById: (id) => `${API_BASE_URL}/appointments/business/${id}/slots`,
    bookAppointment: (link) => `${API_BASE_URL}/appointments/business/${link}/book`,
    verifyBookAppointment: (link) => `${API_BASE_URL}/appointments/business/${link}/book/verify`,
    bookAppointmentById: `${API_BASE_URL}/appointments/book`,
    appointmentByCode: (code) => `${API_BASE_URL}/appointments/confirmation/${code}`,
    cancelAppointment: (code) => `${API_BASE_URL}/appointments/confirmation/${code}/cancel`,
    // Admin/Manager endpoints
    list: `${API_BASE_URL}/appointments`,
    create: `${API_BASE_URL}/appointments`,
    getById: (id) => `${API_BASE_URL}/appointments/${id}`,
    update: (id) => `${API_BASE_URL}/appointments/${id}`,
    stats: `${API_BASE_URL}/appointments/stats`,
    confirm: (id) => `${API_BASE_URL}/appointments/${id}/confirm`,
    start: (id) => `${API_BASE_URL}/appointments/${id}/start`,
    complete: (id) => `${API_BASE_URL}/appointments/${id}/complete`,
    cancel: (id) => `${API_BASE_URL}/appointments/${id}/cancel`,
    reschedule: (id) => `${API_BASE_URL}/appointments/${id}/reschedule`,
    markNoShow: (id) => `${API_BASE_URL}/appointments/${id}/no-show`,
    addReview: (id) => `${API_BASE_URL}/appointments/${id}/review`,
    updateAppointmentStatus: (id) => `${API_BASE_URL}/appointments/${id}/status`,
  },

  // Business endpoints
  business: {
    infoByLink: (link) => `${API_BASE_URL}/business/info/${link}`,
    getById: (id) => `${API_BASE_URL}/business/${id}`,
    getStaff: (id) => `${API_BASE_URL}/business/${id}/staff`,
    getAnalytics: (id) => `${API_BASE_URL}/business/${id}/analytics`,
    // Daily Business Management
    getDailyRecords: (id) => `${API_BASE_URL}/business/${id}/daily-business`,
    getDailySummary: (id) => `${API_BASE_URL}/business/${id}/daily-business/summary`,
    getDailyAnalytics: (id) => `${API_BASE_URL}/business/${id}/daily-business/analytics`,
    reviews: (id) => `${API_BASE_URL}/business/public/${id}/reviews`,
    addReview: (id) => `${API_BASE_URL}/business/public/${id}/reviews`,
    markReviewHelpful: (id) => `${API_BASE_URL}/business/public/reviews/${id}/helpful`,

  },

  // Customer endpoints
  customers: {
    list: `${API_BASE_URL}/customers`,
    create: `${API_BASE_URL}/customers`,
    getById: (id) => `${API_BASE_URL}/customers/${id}`,
    update: (id) => `${API_BASE_URL}/customers/${id}`,
    delete: (id) => `${API_BASE_URL}/customers/${id}`,
    stats: `${API_BASE_URL}/customers/stats`,
    addNote: (id) => `${API_BASE_URL}/customers/${id}/notes`,
    getTimeline: (id) => `${API_BASE_URL}/customers/${id}/timeline`,
    getSegments: `${API_BASE_URL}/customers/analytics/segments`,
    getAnalytics: `${API_BASE_URL}/customers/analytics/overview`,
    getInsights: `${API_BASE_URL}/customers/analytics/insights`,
    getTargetCustomers: `${API_BASE_URL}/customers/analytics/target`,
    updateTier: (id) => `${API_BASE_URL}/customers/${id}/tier`,
  },

  // Notification endpoints
  notifications: {
    create: `${API_BASE_URL}/notifications`,
    send: (id) => `${API_BASE_URL}/notifications/${id}/send`,
    list: `${API_BASE_URL}/notifications`,
    getAnalytics: (id) => `${API_BASE_URL}/notifications/${id}/analytics`,
    createCampaign: `${API_BASE_URL}/notifications/campaigns`,
    getCampaigns: `${API_BASE_URL}/notifications/campaigns`,
    getCustomerAnalytics: `${API_BASE_URL}/notifications/analytics/customers`,
  },

  // Report endpoints
  reports: {
    list: `${API_BASE_URL}/reports`,
    analytics: `${API_BASE_URL}/reports/analytics`,
    getAnalytics: `${API_BASE_URL}/reports/analytics`,
    summary: `${API_BASE_URL}/reports/summary`,
    trends: `${API_BASE_URL}/reports/trends`,
    export: `${API_BASE_URL}/reports/export`,
  },

  // Service endpoints
  services: {
    list: `${API_BASE_URL}/services`,
    create: `${API_BASE_URL}/services`,
    getById: (id) => `${API_BASE_URL}/services/${id}`,
    update: (id) => `${API_BASE_URL}/services/${id}`,
    delete: (id) => `${API_BASE_URL}/services/${id}`,
    popular: `${API_BASE_URL}/services/popular`,
    featured: `${API_BASE_URL}/services/featured`,
    categories: `${API_BASE_URL}/services/categories`,
    updateInventory: (id) => `${API_BASE_URL}/services/${id}/inventory`,
    publicByBusiness: (identifier) => `${API_BASE_URL}/services/public/business/${identifier}`,
  },

  // Daily Business endpoints
  dailyBusiness: {
    create: `${API_BASE_URL}/daily-business`,
    list: `${API_BASE_URL}/daily-business`,
    getSummary: `${API_BASE_URL}/daily-business/summary`,
    getAnalytics: `${API_BASE_URL}/daily-business/analytics`,
    update: (id) => `${API_BASE_URL}/daily-business/${id}`,
    delete: (id) => `${API_BASE_URL}/daily-business/${id}`,
  },

  // Campaign endpoints
  campaigns: {
    // Basic CRUD
    list: `${API_BASE_URL}/campaigns`,
    create: `${API_BASE_URL}/campaigns`,
    getById: (id) => `${API_BASE_URL}/campaigns/${id}`,
    update: (id) => `${API_BASE_URL}/campaigns/${id}`,
    delete: (id) => `${API_BASE_URL}/campaigns/${id}`,
    stats: `${API_BASE_URL}/campaigns/stats`,
    audienceCount: `${API_BASE_URL}/campaigns/audience-count`,

    // Campaign Actions
    launch: (id) => `${API_BASE_URL}/campaigns/${id}/launch`,
    cancel: (id) => `${API_BASE_URL}/campaigns/${id}/cancel`,
    clone: (id) => `${API_BASE_URL}/campaigns/${id}/clone`,

    // Templates
    templates: `${API_BASE_URL}/campaigns/templates`,
    createTemplate: `${API_BASE_URL}/campaigns/templates`,
    popularTemplates: `${API_BASE_URL}/campaigns/templates/popular`,
    getTemplate: (id) => `${API_BASE_URL}/campaigns/templates/${id}`,
    updateTemplate: (id) => `${API_BASE_URL}/campaigns/templates/${id}`,
    deleteTemplate: (id) => `${API_BASE_URL}/campaigns/templates/${id}`,

    // Automated Campaigns
    automated: `${API_BASE_URL}/campaigns/automated`,
    createAutomated: `${API_BASE_URL}/campaigns/automated`,
    triggerAutomated: (id) => `${API_BASE_URL}/campaigns/automated/${id}/trigger`,

    // Drip Campaigns
    drip: `${API_BASE_URL}/campaigns/drip`,
    createDrip: `${API_BASE_URL}/campaigns/drip`,
    enrollDrip: (id) => `${API_BASE_URL}/campaigns/drip/${id}/enroll`,
    dripEnrollments: (id) => `${API_BASE_URL}/campaigns/drip/${id}/enrollments`,

    // A/B Testing
    startABTest: (id) => `${API_BASE_URL}/campaigns/${id}/ab-test/start`,
    getABTestResults: (id) => `${API_BASE_URL}/campaigns/${id}/ab-test/results`,

    // Tracking & Analytics
    generateTrackingLink: `${API_BASE_URL}/campaigns/tracking/generate-link`,
    bestTimeToSend: `${API_BASE_URL}/campaigns/analytics/best-time`,
    customerPattern: (customerId) => `${API_BASE_URL}/campaigns/analytics/customer-pattern/${customerId}`,
    compareCampaigns: `${API_BASE_URL}/campaigns/analytics/compare`,
    insights: `${API_BASE_URL}/campaigns/analytics/insights`,
  },

  // Business Settings endpoints
  businessSettings: {
    get: `${API_BASE_URL}/settings`,
    updateBusinessHours: `${API_BASE_URL}/settings/business-hours`,
    updateAppointments: `${API_BASE_URL}/settings/appointments`,
    updateNotifications: `${API_BASE_URL}/settings/notifications`,
    updatePayments: `${API_BASE_URL}/settings/payments`,
    updateTax: `${API_BASE_URL}/settings/tax`,
    updateGeneral: `${API_BASE_URL}/settings/general`,
    updateLoyalty: `${API_BASE_URL}/settings/loyalty`,
    addHoliday: `${API_BASE_URL}/settings/holidays`,
    removeHoliday: `${API_BASE_URL}/settings/holidays`,
  },

  // Invoice endpoints
  invoices: {
    list: `${API_BASE_URL}/invoices`,
    create: `${API_BASE_URL}/invoices`,
    getById: (id) => `${API_BASE_URL}/invoices/${id}`,
    update: (id) => `${API_BASE_URL}/invoices/${id}`,
    cancel: (id) => `${API_BASE_URL}/invoices/${id}/cancel`,
    stats: `${API_BASE_URL}/invoices/stats`,
    overdue: `${API_BASE_URL}/invoices/overdue`,
    addPayment: (id) => `${API_BASE_URL}/invoices/${id}/payment`,
    addRefund: (id) => `${API_BASE_URL}/invoices/${id}/refund`,
  },

  // Review endpoints
  reviews: {
    list: `${API_BASE_URL}/reviews`,
    create: `${API_BASE_URL}/reviews`,
    getById: (id) => `${API_BASE_URL}/reviews/${id}`,
    update: (id) => `${API_BASE_URL}/reviews/${id}`,
    delete: (id) => `${API_BASE_URL}/reviews/${id}`,
    stats: `${API_BASE_URL}/reviews/stats`,
    featured: `${API_BASE_URL}/reviews/featured`,
    approve: (id) => `${API_BASE_URL}/reviews/${id}/approve`,
    reject: (id) => `${API_BASE_URL}/reviews/${id}/reject`,
    flag: (id) => `${API_BASE_URL}/reviews/${id}/flag`,
    addResponse: (id) => `${API_BASE_URL}/reviews/${id}/response`,
    markHelpful: (id) => `${API_BASE_URL}/reviews/${id}/helpful`,
  },

  // Analytics endpoints
  analytics: {
    dashboard: `${API_BASE_URL}/analytics/dashboard`,
    revenue: `${API_BASE_URL}/analytics/revenue`,
    customers: `${API_BASE_URL}/analytics/customers`,
    services: `${API_BASE_URL}/analytics/services`,
    appointments: `${API_BASE_URL}/analytics/appointments`,
    staff: `${API_BASE_URL}/analytics/staff`,
    trends: `${API_BASE_URL}/analytics/trends`,
  },

  // Lead Tracking & Analytics
  leads: {
    track: `${API_BASE_URL}/leads/track`,
    analytics: {
      summary: `${API_BASE_URL}/leads/analytics/summary`,
      businessBreakdown: `${API_BASE_URL}/leads/analytics/business-breakdown`,
      ipJourneys: `${API_BASE_URL}/leads/analytics/ip-journeys`,
    }
  },
  // Inquiry endpoints
  inquiries: {
    list: `${API_BASE_URL}/inquiries`,
    export: `${API_BASE_URL}/inquiries/export`,
    sendOtp: `${API_BASE_URL}/inquiries/send-otp`,
    create: `${API_BASE_URL}/inquiries`,
    receive: (id) => `${API_BASE_URL}/inquiries/${id}/receive`,
    delete: (id) => `${API_BASE_URL}/inquiries/${id}`,
  }
}

export default endpoints
