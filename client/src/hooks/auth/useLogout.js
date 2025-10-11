import { useState } from 'react'
import { useAuth } from './useAuth'
import { useNavigate } from 'react-router-dom'

export const useLogout = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const { logout } = useAuth()
  const navigate = useNavigate()

  const logoutUser = async () => {
    try {
      setLoading(true)
      setError(null)

      // Call logout API to invalidate token on server
      const token = localStorage.getItem('authToken')
      if (token) {
        try {
          await fetch('/api/auth/logout', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          })
        } catch (apiError) {
          // Even if API call fails, we still want to logout locally
          console.warn('Logout API call failed:', apiError)
        }
      }

      // Clear local auth state
      logout()

      return { success: true }
    } catch (error) {
      const errorMessage = 'Logout failed'
      setError(errorMessage)
      console.error('Logout error:', error)
      
      // Force logout even if there's an error
      logout()
      
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  const clearError = () => {
    setError(null)
  }

  return {
    logoutUser,
    loading,
    error,
    clearError
  }
}

export default useLogout
