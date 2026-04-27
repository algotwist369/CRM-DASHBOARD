import { configureStore } from '@reduxjs/toolkit'
import { persistStore, persistReducer } from 'redux-persist'
import storage from 'redux-persist/lib/storage'
import { combineReducers } from '@reduxjs/toolkit'

// Import reducers
import authReducer from './slices/authSlice'
import adminReducer from './slices/adminSlice'
import businessReducer from './slices/businessSlice'
import staffReducer from './slices/staffSlice'
import customerReducer from './slices/customerSlice'
import appointmentReducer from './slices/appointmentSlice'
import transactionReducer from './slices/transactionSlice'
import notificationReducer from './slices/notificationSlice'
import reportReducer from './slices/reportSlice'
import uiReducer from './slices/uiSlice'

// Import middleware
import { authMiddleware, tokenRefreshMiddleware, roleMiddleware, sessionTimeoutMiddleware, activityMiddleware } from './middleware/authMiddleware'
import { apiMiddleware, loggingMiddleware, cacheMiddleware, retryMiddleware, optimisticUpdatesMiddleware, rateLimitMiddleware } from './middleware/apiMiddleware'

// Persist configuration
const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['auth', 'ui'], // Only persist auth and UI state
  blacklist: ['admin', 'business', 'staff', 'customer', 'appointment', 'transaction', 'notification', 'report'] // Don't persist API data
}

// Auth persist configuration
const authPersistConfig = {
  key: 'auth',
  storage,
  whitelist: ['user', 'token', 'isAuthenticated'] // Only persist essential auth data
}

// UI persist configuration
const uiPersistConfig = {
  key: 'ui',
  storage,
  whitelist: ['theme', 'sidebar', 'layout'] // Only persist UI preferences
}

// Combine reducers
const rootReducer = combineReducers({
  auth: persistReducer(authPersistConfig, authReducer),
  admin: adminReducer,
  business: businessReducer,
  staff: staffReducer,
  customer: customerReducer,
  appointment: appointmentReducer,
  transaction: transactionReducer,
  notification: notificationReducer,
  report: reportReducer,
  ui: persistReducer(uiPersistConfig, uiReducer)
})

// Persist the root reducer
const persistedReducer = persistReducer(persistConfig, rootReducer)

// Configure store
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          'persist/PERSIST',
          'persist/REHYDRATE',
          'persist/PAUSE',
          'persist/PURGE',
          'persist/REGISTER',
          'persist/FLUSH'
        ],
        ignoredActionsPaths: ['meta.arg', 'payload.timestamp'],
        ignoredPaths: ['_persist']
      },
      immutableCheck: {
        ignoredPaths: ['_persist']
      }
    })
    .concat(authMiddleware.middleware)
    .concat(tokenRefreshMiddleware.middleware)
    .concat(roleMiddleware.middleware)
    .concat(sessionTimeoutMiddleware.middleware)
    .concat(activityMiddleware.middleware)
    .concat(apiMiddleware.middleware)
    .concat(loggingMiddleware.middleware)
    .concat(cacheMiddleware.middleware)
    .concat(retryMiddleware.middleware)
    .concat(optimisticUpdatesMiddleware.middleware)
    .concat(rateLimitMiddleware.middleware),
  devTools: import.meta.env.MODE !== 'production'
})

// Create persistor
export const persistor = persistStore(store)

// Export types (commented out for JavaScript)
// export type RootState = ReturnType<typeof store.getState>
// export type AppDispatch = typeof store.dispatch

// Store configuration
export const storeConfig = {
  // Redux DevTools configuration
  devTools: {
    name: 'SpaAdvisor Store',
    trace: true,
    traceLimit: 25
  },
  
  // Middleware configuration
  middleware: {
    // API middleware configuration
    api: {
      retryAttempts: 3,
      retryDelay: 1000,
      cacheDuration: 5 * 60 * 1000, // 5 minutes
      rateLimitWindow: 60000, // 1 minute
      maxRequestsPerWindow: 60
    },
    
    // Auth middleware configuration
    auth: {
      sessionTimeout: 30 * 60 * 1000, // 30 minutes
      inactivityTimeout: 15 * 60 * 1000, // 15 minutes
      tokenRefreshThreshold: 5 * 60 * 1000 // 5 minutes before expiry
    }
  },
  
  // Persist configuration
  persist: {
    key: 'crm-dashboard',
    version: 1,
    migrate: (state) => {
      // Handle state migrations if needed
      return state
    }
  }
}

// Store utilities
export const storeUtils = {
  // Reset store
  resetStore: () => {
    store.dispatch({ type: 'RESET_STORE' })
  },
  
  // Get store state
  getState: () => store.getState(),
  
  // Dispatch action
  dispatch: (action) => store.dispatch(action),
  
  // Subscribe to store changes
  subscribe: (callback) => store.subscribe(callback),
  
  // Get specific slice state
  getSliceState: (sliceName) => {
    const state = store.getState()
    return state[sliceName]
  },
  
  // Check if store is hydrated
  isHydrated: () => {
    const state = store.getState()
    return state._persist?.rehydrated || false
  }
}

// Store enhancers
export const storeEnhancers = {
  // Development enhancers
  development: process.env.NODE_ENV === 'development' ? [
    // Add development-specific enhancers here
  ] : [],
  
  // Production enhancers
  production: process.env.NODE_ENV === 'production' ? [
    // Add production-specific enhancers here
  ] : []
}

// Store initialization
export const initializeStore = () => {
  // Initialize auth state
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('authToken')
    const userData = localStorage.getItem('userData')
    
    if (token && userData) {
      try {
        const user = JSON.parse(userData)
        store.dispatch({
          type: 'auth/setUser',
          payload: user
        })
        store.dispatch({
          type: 'auth/setToken',
          payload: token
        })
      } catch (error) {
        console.error('Error initializing auth state:', error)
        localStorage.removeItem('authToken')
        localStorage.removeItem('userData')
      }
    }
  }
  
  return store
}

// Store cleanup
export const cleanupStore = () => {
  // Clear all persisted data
  persistor.purge()
  
  // Reset store state
  storeUtils.resetStore()
}

// Export store instance
export default store