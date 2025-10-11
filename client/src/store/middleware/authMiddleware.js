import { createListenerMiddleware } from '@reduxjs/toolkit'
import { clearAuth, setUser, setToken } from '../slices/authSlice'
import { authService } from '../../services/auth'

// Create the middleware instance
export const authMiddleware = createListenerMiddleware()

// Listen for auth state changes
authMiddleware.startListening({
  actionCreator: setUser,
  effect: async (action, listenerApi) => {
    const user = action.payload
    if (user) {
      // Store user data in localStorage
      localStorage.setItem('userData', JSON.stringify(user))
      
      // Set auth token if available
      const token = authService.getToken()
      if (token) {
        listenerApi.dispatch(setToken(token))
      }
    }
  }
})

// Listen for token changes
authMiddleware.startListening({
  actionCreator: setToken,
  effect: async (action, listenerApi) => {
    const token = action.payload
    if (token) {
      // Store token in localStorage
      localStorage.setItem('authToken', token)
      
      // Set authorization header for API requests
      authService.setToken(token)
    }
  }
})

// Listen for auth clear
authMiddleware.startListening({
  actionCreator: clearAuth,
  effect: async (action, listenerApi) => {
    // Clear localStorage
    localStorage.removeItem('authToken')
    localStorage.removeItem('userData')
    localStorage.removeItem('userRole')
    localStorage.removeItem('userId')
    
    // Clear auth token from API client
    authService.removeAuthToken()
  }
})

// Auto-login on app start
export const initializeAuth = () => (dispatch, getState) => {
  const token = localStorage.getItem('authToken')
  const userData = localStorage.getItem('userData')
  
  if (token && userData) {
    try {
      const user = JSON.parse(userData)
      dispatch(setToken(token))
      dispatch(setUser(user))
    } catch (error) {
      console.error('Error parsing user data:', error)
      dispatch(clearAuth())
    }
  }
}

// Token refresh middleware
export const tokenRefreshMiddleware = createListenerMiddleware()

tokenRefreshMiddleware.startListening({
  predicate: (action, currentState, previousState) => {
    // Listen for any API action that might fail due to expired token
    return action.type.endsWith('/rejected') && 
           action.payload?.status === 401
  },
  effect: async (action, listenerApi) => {
    const state = listenerApi.getState()
    const { token } = state.auth
    
    if (token) {
      try {
        // Attempt to refresh token
        const result = await authService.refreshToken()
        if (result.success) {
          listenerApi.dispatch(setToken(result.token))
          // Retry the original action
          // Note: This would need to be implemented based on your specific needs
        } else {
          // Refresh failed, logout user
          listenerApi.dispatch(clearAuth())
        }
      } catch (error) {
        console.error('Token refresh failed:', error)
        listenerApi.dispatch(clearAuth())
      }
    }
  }
})

// Role-based access middleware
export const roleMiddleware = createListenerMiddleware()

roleMiddleware.startListening({
  predicate: (action) => {
    // Listen for actions that require specific roles
    return action.meta?.requiresRole
  },
  effect: async (action, listenerApi) => {
    const state = listenerApi.getState()
    const { user } = state.auth
    const requiredRole = action.meta.requiresRole
    
    if (!user || !user.role) {
      console.warn('User not authenticated for role-required action')
      return
    }
    
    if (Array.isArray(requiredRole)) {
      if (!requiredRole.includes(user.role)) {
        console.warn(`User role ${user.role} not in required roles:`, requiredRole)
        return
      }
    } else if (user.role !== requiredRole) {
      console.warn(`User role ${user.role} does not match required role: ${requiredRole}`)
      return
    }
  }
})

// Session timeout middleware
export const sessionTimeoutMiddleware = createListenerMiddleware()

let sessionTimeoutId = null

sessionTimeoutMiddleware.startListening({
  actionCreator: setUser,
  effect: async (action, listenerApi) => {
    // Clear existing timeout
    if (sessionTimeoutId) {
      clearTimeout(sessionTimeoutId)
    }
    
    // Set new timeout (30 minutes)
    const SESSION_TIMEOUT = 30 * 60 * 1000
    sessionTimeoutId = setTimeout(() => {
      console.log('Session timeout - logging out user')
      listenerApi.dispatch(clearAuth())
    }, SESSION_TIMEOUT)
  }
})

sessionTimeoutMiddleware.startListening({
  actionCreator: clearAuth,
  effect: async (action, listenerApi) => {
    // Clear timeout on logout
    if (sessionTimeoutId) {
      clearTimeout(sessionTimeoutId)
      sessionTimeoutId = null
    }
  }
})

// Activity tracking middleware
export const activityMiddleware = createListenerMiddleware()

let lastActivity = Date.now()

// Track user activity
const trackActivity = () => {
  lastActivity = Date.now()
}

// Add event listeners for user activity
if (typeof window !== 'undefined') {
  ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'].forEach(event => {
    document.addEventListener(event, trackActivity, true)
  })
}

activityMiddleware.startListening({
  predicate: () => true, // Listen to all actions
  effect: async (action, listenerApi) => {
    const now = Date.now()
    const INACTIVITY_TIMEOUT = 15 * 60 * 1000 // 15 minutes
    
    if (now - lastActivity > INACTIVITY_TIMEOUT) {
      console.log('User inactive - logging out')
      listenerApi.dispatch(clearAuth())
    }
  }
})

export default authMiddleware
