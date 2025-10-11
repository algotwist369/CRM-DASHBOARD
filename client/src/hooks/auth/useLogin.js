import { useState } from 'react'
import { useAuth } from './useAuth'
import { useNavigate } from 'react-router-dom'

export const useLogin = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const { login } = useAuth()
  const navigate = useNavigate()

  const loginUser = async (credentials) => {
    try {
      setLoading(true)
      setError(null)

      const result = await login(credentials)

      if (result.success) {
        // Redirect based on user role
        const redirectPath = getRedirectPath(result.user.role)
        navigate(redirectPath)
        return { success: true }
      } else {
        setError(result.error)
        return { success: false, error: result.error }
      }
    } catch (error) {
      const errorMessage = 'An unexpected error occurred'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  const getRedirectPath = (role) => {
    switch (role) {
      case 'admin':
        return '/admin/dashboard'
      case 'manager':
        return '/manager/dashboard'
      case 'staff':
        return '/staff/dashboard'
      default:
        return '/'
    }
  }

  const clearError = () => {
    setError(null)
  }

  return {
    loginUser,
    loading,
    error,
    clearError
  }
}

export default useLogin
