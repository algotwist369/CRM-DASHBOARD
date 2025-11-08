import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  AiOutlineUser,
  AiOutlineLock
} from 'react-icons/ai'
import { toast } from 'react-hot-toast'
import authService from '../../../services/auth/authService'

const StaffLogin = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    username: '',
    pin: '',
    rememberMe: false
  })
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)

  // Load remembered credentials on mount
  useEffect(() => {
    const remembered = authService.getRememberedCredentials('staff')
    if (remembered) {
      setFormData(prev => ({
        ...prev,
        username: remembered.username,
        rememberMe: remembered.rememberMe
      }))
    }
  }, [])

  // Realtime validation on each input change
  const validateField = (field, value) => {
    let error = ''

    if (field === 'username') {
      if (!value.trim()) error = 'Username is required'
      else if (value.trim().length < 3) error = 'Username must be at least 3 characters'
    }

    if (field === 'pin') {
      if (!value.trim()) error = 'PIN is required'
      else if (!/^\d+$/.test(value)) error = 'PIN must contain only numbers'
      else if (value.length !== 4) error = 'PIN must be exactly 4 digits'
    }

    setErrors(prev => ({ ...prev, [field]: error }))
  }

  const handleInputChange = (field, value) => {
    // For PIN, only allow numeric input and limit to 4 digits
    if (field === 'pin') {
      const numericValue = value.replace(/\D/g, '').slice(0, 4)
      setFormData(prev => ({ ...prev, [field]: numericValue }))
      validateField(field, numericValue)
    } else {
      setFormData(prev => ({ ...prev, [field]: value }))
      validateField(field, value)
    }
  }

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required'
    } else if (formData.username.trim().length < 3) {
      newErrors.username = 'Username must be at least 3 characters'
    }

    if (!formData.pin.trim()) {
      newErrors.pin = 'PIN is required'
    } else if (!/^\d{4}$/.test(formData.pin)) {
      newErrors.pin = 'PIN must be exactly 4 digits'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async e => {
    e.preventDefault()
    if (!validateForm()) return
    
    setIsLoading(true)
    try {
      const result = await authService.loginStaff({
        username: formData.username.trim(),
        pin: formData.pin,
        rememberMe: formData.rememberMe
      })

      if (result.success) {
        toast.success('Login successful!')
        
        // Store user data
        if (result.user) {
          localStorage.setItem('user', JSON.stringify(result.user))
        }
        
        // Navigate to staff dashboard
        navigate('/staff/dashboard')
      } else {
        setErrors({
          general: result.error || 'Login failed. Please check your credentials.'
        })
        toast.error(result.error || 'Login failed')
      }
    } catch (error) {
      console.error('Staff login error:', error)
      setErrors({ general: 'Unexpected error. Please try again.' })
      toast.error('Unexpected error')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className='max-h-screen flex flex-col justify-center items-center px-4'>
      <div className='w-full max-w-md bg-white shadow-lg rounded-xl p-8'>
        <h2 className='text-center text-2xl font-semibold text-gray-800 mb-1'>
          Staff Login 👤
        </h2>
        <p className='text-center text-gray-500 text-sm mb-6'>
          Sign in with your username and PIN
        </p>

        {errors.general && (
          <div className='bg-red-50 text-red-600 text-sm p-3 rounded-md mb-3 border border-red-200'>
            {errors.general}
          </div>
        )}

        <form onSubmit={handleSubmit} className='space-y-5'>
          {/* Username */}
          <div>
            <label className='block text-sm text-gray-700 mb-1'>
              Username
            </label>
            <div className='relative'>
              <AiOutlineUser className='absolute left-3 top-3.5 text-gray-400 text-lg' />
              <input
                type='text'
                className={`w-full border ${
                  errors.username ? 'border-red-400' : 'border-gray-300'
                } rounded-lg pl-10 pr-3 py-2 focus:outline-none focus:ring-1 ${
                  errors.username ? 'focus:ring-red-400' : 'focus:ring-gray-400'
                } text-gray-700`}
                placeholder='Enter your username'
                value={formData.username}
                onChange={e => handleInputChange('username', e.target.value)}
                autoComplete='username'
              />
            </div>
            {errors.username && (
              <p className='text-red-500 text-xs mt-1'>{errors.username}</p>
            )}
          </div>

          {/* PIN */}
          <div>
            <label className='block text-sm text-gray-700 mb-1'>PIN (4 digits)</label>
            <div className='relative'>
              <AiOutlineLock className='absolute left-3 top-3.5 text-gray-400 text-lg' />
              <input
                type='password'
                inputMode='numeric'
                maxLength={4}
                className={`w-full border ${
                  errors.pin ? 'border-red-400' : 'border-gray-300'
                } rounded-lg pl-10 pr-3 py-2 focus:outline-none focus:ring-1 ${
                  errors.pin ? 'focus:ring-red-400' : 'focus:ring-gray-400'
                } text-gray-700 text-center text-2xl tracking-widest`}
                placeholder='••••'
                value={formData.pin}
                onChange={e => handleInputChange('pin', e.target.value)}
                autoComplete='off'
              />
            </div>
            {errors.pin && (
              <p className='text-red-500 text-xs mt-1'>{errors.pin}</p>
            )}
          </div>

          {/* Remember Me */}
          <div className='flex items-center justify-between text-sm'>
            <label className='flex items-center gap-2 text-gray-600'>
              <input
                type='checkbox'
                checked={formData.rememberMe}
                onChange={e => handleInputChange('rememberMe', e.target.checked)}
                className='accent-gray-600'
              />
              Remember me
            </label>
            <Link
              to='/auth/forgot-password'
              className='text-gray-700 hover:underline'
            >
              Need help?
            </Link>
          </div>

          {/* Submit Button */}
          <button
            type='submit'
            disabled={isLoading}
            className='w-full bg-gray-800 text-white py-2 rounded-lg font-medium hover:bg-gray-700 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed'
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        {/* Other Login Links */}
        <div className='mt-6 space-y-2'>
          <p className='text-center text-gray-600 text-sm'>
            Are you a manager?{' '}
            <Link
              to='/auth/manager-login'
              className='font-medium text-gray-800 hover:underline'
            >
              Manager Login
            </Link>
          </p>
          <p className='text-center text-gray-600 text-sm'>
            Are you an admin?{' '}
            <Link
              to='/auth/login'
              className='font-medium text-gray-800 hover:underline'
            >
              Admin Login
            </Link>
          </p>
          <p className='text-center text-gray-600 text-sm'>
            Don't have an account? Contact your administrator
          </p>
        </div>
      </div>
    </div>
  )
}

export default StaffLogin

