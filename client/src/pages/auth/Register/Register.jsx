import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  AiOutlineEye,
  AiOutlineEyeInvisible,
  AiOutlineMail,
  AiOutlineUser,
  AiOutlineLock
} from 'react-icons/ai';
import { FaPhoneAlt } from "react-icons/fa";
import { FiPhone } from "react-icons/fi";
import { toast } from 'react-hot-toast'
import authService from '../../../services/auth/authService'

const Register = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    companyName: '',
    name: '',
    email: '',
    phone: '',
    password: ''
  })
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  // Validation logic for a single field
  const validateField = (field, value) => {
    let error = ''

    switch (field) {
      case 'companyName':
        if (!value.trim()) error = 'Company name is required'
        break
      case 'name':
        if (!value.trim()) error = 'Full name is required'
        break
      case 'email':
        if (!value.trim()) error = 'Email is required'
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
          error = 'Enter a valid email address'
        break
      case 'phone':
        if (!value.trim()) error = 'Phone number is required'
        else if (!/^(?:\+91|91)?[6-9]\d{9}$/.test(value))
          error = 'Enter a valid 10-digit Indian phone number'
        break
      case 'password':
        if (!value.trim()) error = 'Password is required'
        else if (value.length < 6)
          error = 'Password must be at least 6 characters long'
        else if (!/(?=.*[A-Z])/.test(value))
          error = 'Include at least one uppercase letter'
        else if (!/(?=.*[a-z])/.test(value))
          error = 'Include at least one lowercase letter'
        else if (!/(?=.*\d)/.test(value)) error = 'Include at least one number'
        else if (!/(?=.*[@$!%*?&])/.test(value))
          error = 'Include at least one special character (@, #, $, etc.)'
        break
      default:
        break
    }

    setErrors(prev => ({ ...prev, [field]: error }))
  }

  // Handle input changes + validate while typing
  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    validateField(field, value)
  }

  // Validate entire form before submit
  const validateForm = () => {
    const fields = Object.keys(formData)
    const newErrors = {}
    fields.forEach(field => {
      validateField(field, formData[field])
      if (errors[field]) newErrors[field] = errors[field]
    })
    return Object.values(newErrors).every(error => !error)
  }

  // Handle submit
  const handleSubmit = async e => {
    e.preventDefault()
    if (!validateForm()) return

    setIsLoading(true)
    try {
      const result = await authService.register(formData)

      if (result.success) {
        toast.success('Registration successful!')
        navigate('/auth/login')
      } else {
        setErrors({ general: result.error || 'Registration failed. Please try again.' })
        toast.error(result.error || 'Registration failed')
      }
    } catch (error) {
      console.error('Register error:', error)
      setErrors({ general: 'Unexpected error. Try again.' })
      toast.error('Unexpected error')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center">
      <div className="w-full max-w-md bg-white/90 border border-gray-100 rounded-2xl shadow-sm p-8">
        <h2 className="text-center text-[1.4rem] font-semibold text-gray-900 mb-1">
          Create your account
        </h2>
        <p className="text-center text-gray-500 text-sm mb-6">
          Register your business admin account
        </p>

        {errors.general && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600">
            {errors.general}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Company Name */}
          <div className="space-y-1">
            <label className="block text-xs font-medium text-gray-700">
              Company Name
            </label>
            <div className="relative">
              <AiOutlineUser className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-base" />
              <input
                type="text"
                className={`w-full rounded-lg border pl-10 pr-3 py-2 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 ${errors.companyName
                    ? 'border-red-300 focus:ring-red-200'
                    : 'border-gray-200 focus:ring-gray-200'
                  }`}
                placeholder="Enter your company name"
                value={formData.companyName}
                onChange={e => handleInputChange('companyName', e.target.value)}
              />
            </div>
            {errors.companyName && (
              <p className="text-[11px] text-red-500">{errors.companyName}</p>
            )}
          </div>

          {/* Full Name */}
          <div className="space-y-1">
            <label className="block text-xs font-medium text-gray-700">
              Full Name
            </label>
            <div className="relative">
              <AiOutlineUser className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-base" />
              <input
                type="text"
                className={`w-full rounded-lg border pl-10 pr-3 py-2 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 ${errors.name
                    ? 'border-red-300 focus:ring-red-200'
                    : 'border-gray-200 focus:ring-gray-200'
                  }`}
                placeholder="Enter your full name"
                value={formData.name}
                onChange={e => handleInputChange('name', e.target.value)}
              />
            </div>
            {errors.name && (
              <p className="text-[11px] text-red-500">{errors.name}</p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-1">
            <label className="block text-xs font-medium text-gray-700">
              Email Address
            </label>
            <div className="relative">
              <AiOutlineMail className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-base" />
              <input
                type="email"
                className={`w-full rounded-lg border pl-10 pr-3 py-2 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 ${errors.email
                    ? 'border-red-300 focus:ring-red-200'
                    : 'border-gray-200 focus:ring-gray-200'
                  }`}
                placeholder="you@example.com"
                value={formData.email}
                onChange={e => handleInputChange('email', e.target.value)}
              />
            </div>
            {errors.email && (
              <p className="text-[11px] text-red-500">{errors.email}</p>
            )}
          </div>

          {/* Phone */}
          <div className="space-y-1">
            <label className="block text-xs font-medium text-gray-700">
              Phone Number
            </label>
            <div className="relative">
              <FiPhone className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-base" />
              <input
                type="tel"
                maxLength={10}
                className={`w-full rounded-lg border pl-10 pr-3 py-2 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 ${errors.phone
                    ? 'border-red-300 focus:ring-red-200'
                    : 'border-gray-200 focus:ring-gray-200'
                  }`}
                placeholder="Enter your phone number"
                value={formData.phone}
                onChange={e =>
                  handleInputChange('phone', e.target.value.replace(/\D/g, ''))
                }
              />
            </div>
            {errors.phone && (
              <p className="text-[11px] text-red-500">{errors.phone}</p>
            )}
          </div>

          {/* Password */}
          <div className="space-y-1">
            <label className="block text-xs font-medium text-gray-700">
              Password
            </label>
            <div className="relative">
              <AiOutlineLock className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-base" />
              <input
                type={showPassword ? 'text' : 'password'}
                className={`w-full rounded-lg border pl-10 pr-10 py-2 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 ${errors.password
                    ? 'border-red-300 focus:ring-red-200'
                    : 'border-gray-200 focus:ring-gray-200'
                  }`}
                placeholder="Enter your password"
                value={formData.password}
                onChange={e => handleInputChange('password', e.target.value)}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-base"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
              </button>
            </div>
            {errors.password && (
              <p className="text-[11px] text-red-500">{errors.password}</p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-lg bg-gray-900 py-2.5 text-sm font-semibold text-white hover:bg-gray-800 disabled:opacity-60 disabled:cursor-not-allowed transition"
          >
            {isLoading ? 'Registering...' : 'Create Account'}
          </button>
        </form>

        {/* Login link */}
        <p className="mt-6 text-center text-xs text-gray-600">
          Already have an account?{' '}
          <Link
            to="/auth/login"
            className="font-medium text-gray-900 underline-offset-2 hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>

  )
}

export default Register
