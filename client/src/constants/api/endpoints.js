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
    businesses: `${API_BASE_URL}/admin/businesses`,
    business: (id) => `${API_BASE_URL}/admin/${id}`,
    createBusiness: `${API_BASE_URL}/admin/business`,
    updateBusiness: (id) => `${API_BASE_URL}/admin/business/${id}`,
    deleteBusiness: (id) => `${API_BASE_URL}/admin/business/${id}`,
    businessLink: (id) => `${API_BASE_URL}/admin/business/${id}/link`,
    managers: `${API_BASE_URL}/admin/managers`,
    manager: (id) => `${API_BASE_URL}/admin/manager/${id}`,
    createManager: `${API_BASE_URL}/admin/manager`,
    updateManager: (id) => `${API_BASE_URL}/admin/manager/${id}`,
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
  },

  // Staff endpoints
  staff: {
    profile: `${API_BASE_URL}/staff/profile`,
    updateProfile: `${API_BASE_URL}/staff/profile`,
    business: `${API_BASE_URL}/staff/business`,
  },

  // Appointment endpoints
  appointments: {
    businessInfo: (link) => `${API_BASE_URL}/appointments/business/${link}/info`,
    businessInfoById: (id) => `${API_BASE_URL}/appointments/business/${id}/info`,
    availableSlots: (link) => `${API_BASE_URL}/appointments/business/${link}/slots`,
    availableSlotsById: (id) => `${API_BASE_URL}/appointments/business/${id}/slots`,
    bookAppointment: (link) => `${API_BASE_URL}/appointments/business/${link}/book`,
    bookAppointmentById: `${API_BASE_URL}/appointments/book`,
    appointmentByCode: (code) => `${API_BASE_URL}/appointments/confirmation/${code}`,
    cancelAppointment: (code) => `${API_BASE_URL}/appointments/confirmation/${code}/cancel`,
    getAppointments: `${API_BASE_URL}/appointments`,
    updateAppointmentStatus: (id) => `${API_BASE_URL}/appointments/${id}/status`,
  },

  // Business endpoints
  business: {
    infoByLink: (link) => `${API_BASE_URL}/business/info/${link}`,
    getById: (id) => `${API_BASE_URL}/business/${id}`,
    getStaff: (id) => `${API_BASE_URL}/business/${id}/staff`,
    getDailyRecords: (id) => `${API_BASE_URL}/business/${id}/daily-business`,
    getAnalytics: (id) => `${API_BASE_URL}/business/${id}/analytics`,
  },

  // Customer endpoints
  customers: {
    list: `${API_BASE_URL}/customers`,
    getById: (id) => `${API_BASE_URL}/customers/${id}`,
    update: (id) => `${API_BASE_URL}/customers/${id}`,
    addNote: (id) => `${API_BASE_URL}/customers/${id}/notes`,
    getTimeline: (id) => `${API_BASE_URL}/customers/${id}/timeline`,
    getSegments: `${API_BASE_URL}/customers/analytics/segments`,
    getAnalytics: `${API_BASE_URL}/customers/analytics/overview`,
    getInsights: `${API_BASE_URL}/customers/analytics/insights`,
    getTargetCustomers: `${API_BASE_URL}/customers/analytics/target`,
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
    getAnalytics: `${API_BASE_URL}/reports/analytics`,
    export: `${API_BASE_URL}/reports/export`,
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
}

export default endpoints
