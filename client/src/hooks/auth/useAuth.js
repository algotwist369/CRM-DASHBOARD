import { useState, useEffect, createContext, useContext } from 'react'
import { useNavigate } from 'react-router-dom'

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
      if (!token) {
        setLoading(false)
        return
      }

      // Verify token with backend
      const response = await fetch('/api/auth/verify', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const userData = await response.json()
        setUser(userData.user)
        setIsAuthenticated(true)
      } else {
        // Token is invalid, clear it
        localStorage.removeItem('authToken')
        localStorage.removeItem('userRole')
      }
    } catch (error) {
      console.error('Auth check failed:', error)
      localStorage.removeItem('authToken')
      localStorage.removeItem('userRole')
    } finally {
      setLoading(false)
    }
  }

  const login = async (credentials) => {
    try {
      setLoading(true)
      
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(credentials)
      })

      if (response.ok) {
        const data = await response.json()
        
        // Store auth data
        localStorage.setItem('authToken', data.token)
        localStorage.setItem('userRole', data.user.role)
        
        setUser(data.user)
        setIsAuthenticated(true)
        
        return { success: true, user: data.user }
      } else {
        const error = await response.json()
        return { success: false, error: error.message }
      }
    } catch (error) {
      console.error('Login failed:', error)
      return { success: false, error: 'Network error occurred' }
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    // Clear auth data
    localStorage.removeItem('authToken')
    localStorage.removeItem('userRole')
    
    setUser(null)
    setIsAuthenticated(false)
    
    // Redirect to login
    navigate('/auth/login')
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
