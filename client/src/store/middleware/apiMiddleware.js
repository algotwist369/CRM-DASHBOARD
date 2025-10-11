import { createListenerMiddleware } from '@reduxjs/toolkit'
import { setGlobalLoading, showToast } from '../slices/uiSlice'

// Create the middleware instance
export const apiMiddleware = createListenerMiddleware()

// Global loading middleware
apiMiddleware.startListening({
  predicate: (action) => {
    // Listen for async thunk actions
    return action.type.endsWith('/pending')
  },
  effect: async (action, listenerApi) => {
    // Show global loading for certain actions
    const globalLoadingActions = [
      'auth/loginUser',
      'auth/registerUser',
      'auth/logoutUser',
      'admin/getDashboard',
      'business/getBusinesses',
      'staff/getStaff',
      'customer/getCustomers',
      'appointment/getAppointments',
      'transaction/getTransactions',
      'notification/getNotifications',
      'report/getReports'
    ]
    
    if (globalLoadingActions.some(actionType => action.type.startsWith(actionType))) {
      listenerApi.dispatch(setGlobalLoading(true))
    }
  }
})

apiMiddleware.startListening({
  predicate: (action) => {
    return action.type.endsWith('/fulfilled') || action.type.endsWith('/rejected')
  },
  effect: async (action, listenerApi) => {
    // Hide global loading
    listenerApi.dispatch(setGlobalLoading(false))
  }
})

// Error handling middleware
apiMiddleware.startListening({
  predicate: (action) => {
    return action.type.endsWith('/rejected')
  },
  effect: async (action, listenerApi) => {
    const error = action.payload
    
    // Don't show toast for auth errors (handled separately)
    if (action.type.includes('auth/')) {
      return
    }
    
    // Show error toast
    listenerApi.dispatch(showToast({
      type: 'error',
      message: error || 'An error occurred. Please try again.',
      duration: 5000
    }))
  }
})

// Success handling middleware
apiMiddleware.startListening({
  predicate: (action) => {
    return action.type.endsWith('/fulfilled')
  },
  effect: async (action, listenerApi) => {
    // Show success toast for certain actions
    const successActions = [
      'business/createBusiness',
      'business/updateBusiness',
      'business/deleteBusiness',
      'staff/createStaff',
      'staff/updateStaff',
      'staff/deleteStaff',
      'customer/createCustomer',
      'customer/updateCustomer',
      'customer/deleteCustomer',
      'appointment/createAppointment',
      'appointment/updateAppointment',
      'appointment/deleteAppointment',
      'transaction/createTransaction',
      'transaction/updateTransaction',
      'transaction/deleteTransaction',
      'notification/createNotification',
      'notification/updateNotification',
      'notification/deleteNotification',
      'report/generateReport',
      'report/updateReport',
      'report/deleteReport'
    ]
    
    if (successActions.some(actionType => action.type.startsWith(actionType))) {
      const actionName = action.type.split('/')[1]
      const entityName = action.type.split('/')[0]
      
      let message = ''
      if (actionName.includes('create')) {
        message = `${entityName} created successfully`
      } else if (actionName.includes('update')) {
        message = `${entityName} updated successfully`
      } else if (actionName.includes('delete')) {
        message = `${entityName} deleted successfully`
      }
      
      if (message) {
        listenerApi.dispatch(showToast({
          type: 'success',
          message,
          duration: 3000
        }))
      }
    }
  }
})

// Request/Response logging middleware
export const loggingMiddleware = createListenerMiddleware()

loggingMiddleware.startListening({
  predicate: (action) => {
    return action.type.endsWith('/pending') || 
           action.type.endsWith('/fulfilled') || 
           action.type.endsWith('/rejected')
  },
  effect: async (action, listenerApi) => {
    if (import.meta.env.MODE === 'development') {
      const timestamp = new Date().toISOString()
      const actionType = action.type
      
      if (actionType.endsWith('/pending')) {
        console.log(`🚀 [${timestamp}] API Request:`, actionType)
      } else if (actionType.endsWith('/fulfilled')) {
        console.log(`✅ [${timestamp}] API Success:`, actionType, action.payload)
      } else if (actionType.endsWith('/rejected')) {
        console.error(`❌ [${timestamp}] API Error:`, actionType, action.payload)
      }
    }
  }
})

// Cache middleware
export const cacheMiddleware = createListenerMiddleware()

const cache = new Map()
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

cacheMiddleware.startListening({
  predicate: (action) => {
    return action.type.endsWith('/pending')
  },
  effect: async (action, listenerApi) => {
    const cacheKey = action.type.replace('/pending', '')
    const cached = cache.get(cacheKey)
    
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      // Return cached data instead of making API call
      listenerApi.dispatch({
        type: action.type.replace('/pending', '/fulfilled'),
        payload: cached.data
      })
      return
    }
  }
})

cacheMiddleware.startListening({
  predicate: (action) => {
    return action.type.endsWith('/fulfilled')
  },
  effect: async (action, listenerApi) => {
    const cacheKey = action.type.replace('/fulfilled', '')
    
    // Cache GET requests only
    if (action.type.includes('get') || action.type.includes('fetch')) {
      cache.set(cacheKey, {
        data: action.payload,
        timestamp: Date.now()
      })
    }
  }
})

// Retry middleware
export const retryMiddleware = createListenerMiddleware()

const retryAttempts = new Map()
const MAX_RETRY_ATTEMPTS = 3
const RETRY_DELAY = 1000

retryMiddleware.startListening({
  predicate: (action) => {
    return action.type.endsWith('/rejected')
  },
  effect: async (action, listenerApi) => {
    const actionType = action.type.replace('/rejected', '')
    const attempts = retryAttempts.get(actionType) || 0
    
    // Only retry on network errors or 5xx status codes
    const shouldRetry = action.payload?.status >= 500 || 
                       action.payload?.code === 'NETWORK_ERROR'
    
    if (shouldRetry && attempts < MAX_RETRY_ATTEMPTS) {
      retryAttempts.set(actionType, attempts + 1)
      
      // Wait before retrying
      setTimeout(() => {
        // This would need to be implemented based on your specific retry logic
        console.log(`Retrying ${actionType} (attempt ${attempts + 1})`)
      }, RETRY_DELAY * (attempts + 1))
    } else {
      // Clear retry attempts
      retryAttempts.delete(actionType)
    }
  }
})

// Optimistic updates middleware
export const optimisticUpdatesMiddleware = createListenerMiddleware()

optimisticUpdatesMiddleware.startListening({
  predicate: (action) => {
    return action.type.endsWith('/pending') && action.meta?.optimisticUpdate
  },
  effect: async (action, listenerApi) => {
    const { optimisticUpdate } = action.meta
    
    if (optimisticUpdate) {
      // Apply optimistic update
      listenerApi.dispatch(optimisticUpdate)
    }
  }
})

optimisticUpdatesMiddleware.startListening({
  predicate: (action) => {
    return action.type.endsWith('/rejected') && action.meta?.optimisticUpdate
  },
  effect: async (action, listenerApi) => {
    const { revertOptimisticUpdate } = action.meta
    
    if (revertOptimisticUpdate) {
      // Revert optimistic update on failure
      listenerApi.dispatch(revertOptimisticUpdate)
    }
  }
})

// Rate limiting middleware
export const rateLimitMiddleware = createListenerMiddleware()

const requestCounts = new Map()
const RATE_LIMIT_WINDOW = 60000 // 1 minute
const MAX_REQUESTS_PER_WINDOW = 60

rateLimitMiddleware.startListening({
  predicate: (action) => {
    return action.type.endsWith('/pending')
  },
  effect: async (action, listenerApi) => {
    const now = Date.now()
    const windowStart = now - RATE_LIMIT_WINDOW
    
    // Clean up old entries
    for (const [timestamp, count] of requestCounts.entries()) {
      if (timestamp < windowStart) {
        requestCounts.delete(timestamp)
      }
    }
    
    // Count current requests
    const currentRequests = Array.from(requestCounts.values()).reduce((sum, count) => sum + count, 0)
    
    if (currentRequests >= MAX_REQUESTS_PER_WINDOW) {
      // Rate limit exceeded
      listenerApi.dispatch(showToast({
        type: 'warning',
        message: 'Too many requests. Please wait a moment.',
        duration: 3000
      }))
      
      // Reject the action
      listenerApi.dispatch({
        type: action.type.replace('/pending', '/rejected'),
        payload: 'Rate limit exceeded'
      })
      return
    }
    
    // Increment request count
    const currentCount = requestCounts.get(now) || 0
    requestCounts.set(now, currentCount + 1)
  }
})

export default apiMiddleware
