import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  AiOutlineEye,
  AiOutlineEyeInvisible,
  AiOutlineMail,
  AiOutlineLock
} from 'react-icons/ai'
import { toast } from 'react-hot-toast'
import authService from '../../../services/auth/authService'

const Login = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  })
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  // Realtime validation on each input change
  const validateField = (field, value) => {
    let error = ''

    if (field === 'email') {
      if (!value.trim()) error = 'Email is required'
      else if (!/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(value))
        error = 'Enter a valid email address'
    }

    if (field === 'password') {
      if (!value.trim()) error = 'Password is required'
      else if (value.length < 6) error = 'Minimum 6 characters required'
    }

    setErrors(prev => ({ ...prev, [field]: error }))
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    validateField(field, value)
  }

  const validateForm = () => {
    const newErrors = {}
    if (!formData.email.trim()) newErrors.email = 'Email is required'
    else if (!/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(formData.email))
      newErrors.email = 'Enter a valid email address'

    if (!formData.password.trim()) newErrors.password = 'Password is required'
    else if (formData.password.length < 6)
      newErrors.password = 'Minimum 6 characters required'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async e => {
    e.preventDefault()
    if (!validateForm()) return
    setIsLoading(true)
    try {
      const result = await authService.login({
        email: formData.email,
        password: formData.password
      })
      console.log("result:", result)
      if (result.success) {
        toast.success('Login successful!')
        localStorage.setItem('user', JSON.stringify(result.user))
        navigate(`/${result.user.role.toLowerCase()}/dashboard`)
      } else {
        setErrors({
          general: result.error || 'Login failed. Please check credentials.'
        })
        toast.error(result.error || 'Login failed')
      }
    } catch (error) {
      console.error('Login error:', error)
      setErrors({ general: 'Unexpected error. Try again.' })
      toast.error('Unexpected error')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className='max-h-screen flex flex-col justify-center items-center px-4'>
      <div className='w-full max-w-md bg-white shadow-lg rounded-xl p-8'>
        <h2 className='text-center text-2xl font-semibold text-gray-800 mb-1'>
          Welcome Back 👋
        </h2>
        <p className='text-center text-gray-500 text-sm mb-6'>
          Sign in to continue to your account
        </p>

        {errors.general && (
          <div className='bg-red-50 text-red-600 text-sm p-3 rounded-md mb-3 border border-red-200'>
            {errors.general}
          </div>
        )}

        <form onSubmit={handleSubmit} className='space-y-5'>
          {/* Email */}
          <div>
            <label className='block text-sm text-gray-700 mb-1'>
              Email Address
            </label>
            <div className='relative'>
              <AiOutlineMail className='absolute left-3 top-3.5 text-gray-400 text-lg' />
              <input
                type='email'
                className={`w-full border ${
                  errors.email ? 'border-red-400' : 'border-gray-300'
                } rounded-lg pl-10 pr-3 py-2 focus:outline-none focus:ring-1 ${
                  errors.email ? 'focus:ring-red-400' : 'focus:ring-gray-400'
                } text-gray-700`}
                placeholder='you@example.com'
                value={formData.email}
                onChange={e => handleInputChange('email', e.target.value)}
              />
            </div>
            {errors.email && (
              <p className='text-red-500 text-xs mt-1'>{errors.email}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className='block text-sm text-gray-700 mb-1'>Password</label>
            <div className='relative'>
              <AiOutlineLock className='absolute left-3 top-3.5 text-gray-400 text-lg' />
              <input
                type={showPassword ? 'text' : 'password'}
                className={`w-full border ${
                  errors.password ? 'border-red-400' : 'border-gray-300'
                } rounded-lg pl-10 pr-10 py-2 focus:outline-none focus:ring-1 ${
                  errors.password ? 'focus:ring-red-400' : 'focus:ring-gray-400'
                } text-gray-700`}
                placeholder='Enter your password'
                value={formData.password}
                onChange={e => handleInputChange('password', e.target.value)}
              />
              <div
                className='absolute right-3 top-3.5 text-gray-400 cursor-pointer text-lg'
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
              </div>
            </div>
            {errors.password && (
              <p className='text-red-500 text-xs mt-1'>{errors.password}</p>
            )}
          </div>

          {/* Remember Me + Forgot Password */}
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
              Forgot password?
            </Link>
          </div>

          {/* Submit Button */}
          <button
            type='submit'
            disabled={isLoading}
            className='w-full bg-gray-800 text-white py-2 rounded-lg font-medium hover:bg-gray-700 transition duration-200'
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        {/* Register Link */}
        <div className='mt-6 space-y-2'>
          <p className='text-center text-gray-600 text-sm'>
            Don't have an account?{' '}
            <Link
              to='/auth/register'
              className='font-medium text-gray-800 hover:underline'
            >
              Create one
            </Link>
          </p>
          <p className='text-center text-gray-600 text-sm'>
            Are you a manager?{' '}
            <Link
              to='/auth/manager-login'
              className='font-medium text-gray-800 hover:underline'
            >
              Manager Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login
