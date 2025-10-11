// Store exports
export { store, persistor, storeConfig, storeUtils, storeEnhancers, initializeStore, cleanupStore } from './store'

// Reducer exports
export * from './slices'

// Selector exports
export * from './selectors'

// Middleware exports
export * from './middleware'

// Action exports
export {
  // Auth actions
  clearError,
  clearAuth,
  setUser,
  setToken,
  incrementOTPAttempts,
  resetOTPAttempts,
  setOTPSent,
  setOTPVerified,
  setPasswordResetRequested,
  setPasswordReset,
  setRegistrationCompleted,
  setEmailVerified
} from './slices/authSlice'

export {
  // Admin actions
  clearAdminError,
  setCurrentManager,
  clearCurrentManager,
  updateManagerInList,
  removeManagerFromList
} from './slices/adminSlice'

export {
  // Business actions
  clearBusinessError,
  setCurrentBusiness,
  clearCurrentBusiness,
  updateBusinessInList,
  removeBusinessFromList
} from './slices/businessSlice'

export {
  // Staff actions
  clearStaffError,
  setCurrentStaff,
  clearCurrentStaff,
  updateStaffInList,
  removeStaffFromList
} from './slices/staffSlice'

export {
  // Customer actions
  clearCustomerError,
  setCurrentCustomer,
  clearCurrentCustomer,
  updateCustomerInList,
  removeCustomerFromList
} from './slices/customerSlice'

export {
  // Appointment actions
  clearAppointmentError,
  setCurrentAppointment,
  clearCurrentAppointment,
  updateAppointmentInList,
  removeAppointmentFromList
} from './slices/appointmentSlice'

export {
  // Transaction actions
  clearTransactionError,
  setCurrentTransaction,
  clearCurrentTransaction,
  updateTransactionInList,
  removeTransactionFromList
} from './slices/transactionSlice'

export {
  // Notification actions
  clearNotificationError,
  setCurrentNotification,
  clearCurrentNotification,
  updateNotificationInList,
  removeNotificationFromList,
  markAsReadInList,
  decrementUnreadCount,
  incrementUnreadCount
} from './slices/notificationSlice'

export {
  // Report actions
  clearReportError,
  setCurrentReport,
  clearCurrentReport,
  updateReportInList,
  removeReportFromList
} from './slices/reportSlice'

export {
  // UI actions
  toggleSidebar,
  openSidebar,
  closeSidebar,
  toggleSidebarCollapse,
  collapseSidebar,
  expandSidebar,
  setThemeMode,
  setPrimaryColor,
  setSecondaryColor,
  toggleTheme,
  setHeaderHeight,
  setSidebarWidth,
  setCollapsedSidebarWidth,
  openModal,
  closeModal,
  showToast,
  hideToast,
  setGlobalLoading,
  setPageLoading,
  setComponentLoading,
  setSearchQuery,
  setSearchActive,
  setSearchResults,
  clearSearch,
  setActiveFilter,
  removeActiveFilter,
  clearActiveFilters,
  applyFilters,
  clearAppliedFilters,
  setCurrentPage,
  setPageSize,
  setTotalItems,
  setPagination,
  resetPagination,
  setSortField,
  setSortDirection,
  setSort,
  toggleSort,
  clearSort,
  resetUI
} from './slices/uiSlice'

// Async thunk exports
export {
  // Auth async thunks
  loginUser,
  registerUser,
  logoutUser,
  verifyToken,
  refreshToken,
  verifyOTP,
  resendOTP,
  forgotPassword,
  resetPassword
} from './slices/authSlice'

export {
  // Admin async thunks
  getAdminDashboard,
  getAdminStats,
  getManagers,
  getManager,
  createManager,
  updateManager,
  deleteManager,
  getAdminReports,
  exportAdminData
} from './slices/adminSlice'

export {
  // Business async thunks
  getBusinesses,
  getBusiness,
  createBusiness,
  updateBusiness,
  deleteBusiness
} from './slices/businessSlice'

export {
  // Staff async thunks
  getStaff,
  getStaffMember,
  createStaff,
  updateStaff,
  deleteStaff
} from './slices/staffSlice'

export {
  // Customer async thunks
  getCustomers,
  getCustomer,
  createCustomer,
  updateCustomer,
  deleteCustomer
} from './slices/customerSlice'

export {
  // Appointment async thunks
  getAppointments,
  getAppointment,
  createAppointment,
  updateAppointment,
  deleteAppointment,
  getAvailableSlots
} from './slices/appointmentSlice'

export {
  // Transaction async thunks
  getTransactions,
  getTransaction,
  createTransaction,
  updateTransaction,
  deleteTransaction
} from './slices/transactionSlice'

export {
  // Notification async thunks
  getNotifications,
  getNotification,
  createNotification,
  updateNotification,
  deleteNotification,
  markNotificationAsRead,
  getUnreadCount
} from './slices/notificationSlice'

export {
  // Report async thunks
  getReports,
  getReport,
  generateReport,
  updateReport,
  deleteReport,
  downloadReport
} from './slices/reportSlice'

// Middleware exports
export {
  authMiddleware,
  tokenRefreshMiddleware,
  roleMiddleware,
  sessionTimeoutMiddleware,
  activityMiddleware,
  initializeAuth
} from './middleware/authMiddleware'

export {
  apiMiddleware,
  loggingMiddleware,
  cacheMiddleware,
  retryMiddleware,
  optimisticUpdatesMiddleware,
  rateLimitMiddleware
} from './middleware/apiMiddleware'

// Store types (commented out for JavaScript)
// export type { RootState, AppDispatch } from './store'

// Store hooks (for use with React Redux)
export { useSelector, useDispatch, useStore } from 'react-redux'

// Custom hooks
export { useAppSelector, useAppDispatch } from './hooks'

// Store constants
export const STORE_CONSTANTS = {
  // Action types
  ACTION_TYPES: {
    // Auth
    LOGIN_USER: 'auth/loginUser',
    REGISTER_USER: 'auth/registerUser',
    LOGOUT_USER: 'auth/logoutUser',
    VERIFY_TOKEN: 'auth/verifyToken',
    REFRESH_TOKEN: 'auth/refreshToken',
    
    // Admin
    GET_ADMIN_DASHBOARD: 'admin/getDashboard',
    GET_ADMIN_STATS: 'admin/getStats',
    GET_BUSINESSES: 'admin/getBusinesses',
    GET_MANAGERS: 'admin/getManagers',
    
    // Business
    GET_BUSINESS: 'business/getBusiness',
    CREATE_BUSINESS: 'business/createBusiness',
    UPDATE_BUSINESS: 'business/updateBusiness',
    DELETE_BUSINESS: 'business/deleteBusiness',
    
    // Staff
    GET_STAFF: 'staff/getStaff',
    CREATE_STAFF: 'staff/createStaff',
    UPDATE_STAFF: 'staff/updateStaff',
    DELETE_STAFF: 'staff/deleteStaff',
    
    // Customer
    GET_CUSTOMERS: 'customer/getCustomers',
    CREATE_CUSTOMER: 'customer/createCustomer',
    UPDATE_CUSTOMER: 'customer/updateCustomer',
    DELETE_CUSTOMER: 'customer/deleteCustomer',
    
    // Appointment
    GET_APPOINTMENTS: 'appointment/getAppointments',
    CREATE_APPOINTMENT: 'appointment/createAppointment',
    UPDATE_APPOINTMENT: 'appointment/updateAppointment',
    DELETE_APPOINTMENT: 'appointment/deleteAppointment',
    
    // Transaction
    GET_TRANSACTIONS: 'transaction/getTransactions',
    CREATE_TRANSACTION: 'transaction/createTransaction',
    UPDATE_TRANSACTION: 'transaction/updateTransaction',
    DELETE_TRANSACTION: 'transaction/deleteTransaction',
    
    // Notification
    GET_NOTIFICATIONS: 'notification/getNotifications',
    CREATE_NOTIFICATION: 'notification/createNotification',
    UPDATE_NOTIFICATION: 'notification/updateNotification',
    DELETE_NOTIFICATION: 'notification/deleteNotification',
    
    // Report
    GET_REPORTS: 'report/getReports',
    GENERATE_REPORT: 'report/generateReport',
    UPDATE_REPORT: 'report/updateReport',
    DELETE_REPORT: 'report/deleteReport'
  },
  
  // Status types
  STATUS_TYPES: {
    PENDING: 'pending',
    FULFILLED: 'fulfilled',
    REJECTED: 'rejected'
  },
  
  // User roles
  USER_ROLES: {
    ADMIN: 'admin',
    MANAGER: 'manager',
    STAFF: 'staff',
    CUSTOMER: 'customer'
  },
  
  // Theme modes
  THEME_MODES: {
    LIGHT: 'light',
    DARK: 'dark'
  },
  
  // Toast types
  TOAST_TYPES: {
    SUCCESS: 'success',
    ERROR: 'error',
    WARNING: 'warning',
    INFO: 'info'
  },
  
  // Modal types
  MODAL_TYPES: {
    CONFIRM: 'confirm',
    FORM: 'form',
    INFO: 'info',
    CUSTOM: 'custom'
  }
}

// Store utilities
export const storeHelpers = {
  // Create action creator
  createAction: (type, payload) => ({ type, payload }),
  
  // Create async action creator
  createAsyncAction: (type, payload, meta) => ({ type, payload, meta }),
  
  // Check if action is pending
  isPending: (action) => action.type.endsWith('/pending'),
  
  // Check if action is fulfilled
  isFulfilled: (action) => action.type.endsWith('/fulfilled'),
  
  // Check if action is rejected
  isRejected: (action) => action.type.endsWith('/rejected'),
  
  // Get action type without status
  getActionType: (action) => action.type.replace(/\/\w+$/, ''),
  
  // Create error action
  createErrorAction: (type, error) => ({ type, payload: error, error: true })
}

// Default export - store is already exported above
// export default store