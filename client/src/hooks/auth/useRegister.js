import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import authService from '../../services/auth/authService'

export const useRegister = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const navigate = useNavigate()

  const registerUser = async (userData) => {
    try {
      if (loading) return { success: false, error: 'Already submitting' }
      setLoading(true)
      setError(null)
      setSuccess(false)

      const result = await authService.register(userData)

      if (result.success) {
        setSuccess(true)
        
        // If registration requires email verification
        if (result.data?.requiresVerification) {
          navigate('/auth/verify-email', { 
            state: { email: userData.email } 
          })
        } else {
          // Auto-login after successful registration
          navigate('/auth/login', { 
            state: { message: 'Registration successful. Please login.' } 
          })
        }
        
        return { success: true, data: result.data }
      } else {
        setError(result.error || 'Registration failed')
        return { success: false, error: result.error }
      }
    } catch (error) {
      const errorMessage = 'Network error occurred'
      setError(errorMessage)
      console.error('Registration error:', error)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  const verifyEmail = async (token) => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ token })
      })

      const result = await response.json()

      if (response.ok) {
        setSuccess(true)
        navigate('/auth/login', { 
          state: { message: 'Email verified successfully. Please login.' } 
        })
        return { success: true }
      } else {
        setError(result.message || 'Email verification failed')
        return { success: false, error: result.message }
      }
    } catch (error) {
      const errorMessage = 'Email verification failed'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  const resendVerification = async (email) => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      })

      const result = await response.json()

      if (response.ok) {
        setSuccess(true)
        return { success: true, message: 'Verification email sent' }
      } else {
        setError(result.message || 'Failed to resend verification email')
        return { success: false, error: result.message }
      }
    } catch (error) {
      const errorMessage = 'Failed to resend verification email'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  const clearError = () => {
    setError(null)
  }

  const clearSuccess = () => {
    setSuccess(false)
  }

  return {
    registerUser,
    verifyEmail,
    resendVerification,
    loading,
    error,
    success,
    clearError,
    clearSuccess
  }
}

export default useRegister
