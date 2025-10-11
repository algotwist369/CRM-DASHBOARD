import React, { useState, useEffect, createContext, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import mockApiService from '../../services/mockApiService'

// Create Auth Context
const AuthContext = createContext()

// Auth Provider Component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    try {
      setLoading(true)
      
      // Check for stored auth token
      const token = localStorage.getItem('authToken')
      const userData = localStorage.getItem('userData')
      
      if (!token || !userData) {
        setLoading(false)
        return
      }

      try {
        const user = JSON.parse(userData)
        setUser(user)
        setIsAuthenticated(true)
      } catch (error) {
        // Invalid user data, clear it
        localStorage.removeItem('authToken')
        localStorage.removeItem('userData')
        localStorage.removeItem('userRole')
        localStorage.removeItem('userId')
      }
    } catch (error) {
      console.error('Auth check failed:', error)
      localStorage.removeItem('authToken')
      localStorage.removeItem('userData')
      localStorage.removeItem('userRole')
      localStorage.removeItem('userId')
    } finally {
      setLoading(false)
    }
  }

  const login = async (credentials) => {
    try {
      setLoading(true)
      
      const result = await mockApiService.login(credentials)
      
      if (result.success) {
        const { user, token } = result.data
        
        // Store auth data
        localStorage.setItem('authToken', token)
        localStorage.setItem('userData', JSON.stringify(user))
        localStorage.setItem('userRole', user.role)
        localStorage.setItem('userId', user.id)
        
        setUser(user)
        setIsAuthenticated(true)
        
        return { success: true, user }
      } else {
        return { success: false, error: result.message }
      }
    } catch (error) {
      console.error('Login failed:', error)
      return { success: false, error: 'Network error occurred' }
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    try {
      // Call logout API
      await mockApiService.logout()
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      // Clear auth data
      localStorage.removeItem('authToken')
      localStorage.removeItem('userData')
      localStorage.removeItem('userRole')
      localStorage.removeItem('userId')
      
      setUser(null)
      setIsAuthenticated(false)
      
      // Redirect to login
      navigate('/auth/login')
    }
  }

  const updateUser = (userData) => {
    setUser(prev => ({ ...prev, ...userData }))
  }

  const hasRole = (role) => {
    return user?.role === role
  }

  const hasPermission = (permission) => {
    return user?.permissions?.includes(permission) || false
  }

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    logout,
    updateUser,
    hasRole,
    hasPermission,
    checkAuthStatus
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext)
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  
  return context
}

export default useAuth
