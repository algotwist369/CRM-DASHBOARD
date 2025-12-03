import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  AiOutlineEye,
  AiOutlineEyeInvisible,
  AiOutlineMail,
  AiOutlineUser,
  AiOutlineLock,
  AiOutlinePhone
} from 'react-icons/ai'
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
    <div className="min-h-screen flex flex-col justify-center items-center px-4 bg-gray-50">
      <div className="w-full max-w-md bg-white shadow-lg  p-8">
        <h2 className="text-center text-2xl font-semibold text-gray-800 mb-1">
          Create Your Account ✨
        </h2>
        <p className="text-center text-gray-500 text-sm mb-6">
          Register your business admin account
        </p>

        {errors.general && (
          <div className="bg-red-50 text-red-600 text-sm p-3  mb-3 border border-red-200">
            {errors.general}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Company Name */}
          <div>
            <label className="block text-sm text-gray-700 mb-1">Company Name</label>
            <div className="relative">
              <AiOutlineUser className="absolute left-3 top-3.5 text-gray-400 text-lg" />
              <input
                type="text"
                className={`w-full border  pl-10 pr-3 py-2 text-gray-700 focus:outline-none focus:ring-1 ${
                  errors.companyName ? 'border-red-400 focus:ring-red-400' : 'border-gray-300 focus:ring-gray-400'
                }`}
                placeholder="Enter your company name"
                value={formData.companyName}
                onChange={e => handleInputChange('companyName', e.target.value)}
              />
            </div>
            {errors.companyName && <p className="text-red-500 text-xs mt-1">{errors.companyName}</p>}
          </div>

          {/* Full Name */}
          <div>
            <label className="block text-sm text-gray-700 mb-1">Full Name</label>
            <div className="relative">
              <AiOutlineUser className="absolute left-3 top-3.5 text-gray-400 text-lg" />
              <input
                type="text"
                className={`w-full border  pl-10 pr-3 py-2 text-gray-700 focus:outline-none focus:ring-1 ${
                  errors.name ? 'border-red-400 focus:ring-red-400' : 'border-gray-300 focus:ring-gray-400'
                }`}
                placeholder="Enter your full name"
                value={formData.name}
                onChange={e => handleInputChange('name', e.target.value)}
              />
            </div>
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm text-gray-700 mb-1">Email Address</label>
            <div className="relative">
              <AiOutlineMail className="absolute left-3 top-3.5 text-gray-400 text-lg" />
              <input
                type="email"
                className={`w-full border  pl-10 pr-3 py-2 text-gray-700 focus:outline-none focus:ring-1 ${
                  errors.email ? 'border-red-400 focus:ring-red-400' : 'border-gray-300 focus:ring-gray-400'
                }`}
                placeholder="you@example.com"
                value={formData.email}
                onChange={e => handleInputChange('email', e.target.value)}
              />
            </div>
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm text-gray-700 mb-1">Phone Number</label>
            <div className="relative">
              <AiOutlinePhone className="absolute left-3 top-3.5 text-gray-400 text-lg" />
              <input
                type="tel"
                maxLength={10}
                className={`w-full border  pl-10 pr-3 py-2 text-gray-700 focus:outline-none focus:ring-1 ${
                  errors.phone ? 'border-red-400 focus:ring-red-400' : 'border-gray-300 focus:ring-gray-400'
                }`}
                placeholder="Enter your phone number"
                value={formData.phone}
                onChange={e => handleInputChange('phone', e.target.value.replace(/\D/g, ''))}
              />
            </div>
            {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm text-gray-700 mb-1">Password</label>
            <div className="relative">
              <AiOutlineLock className="absolute left-3 top-3.5 text-gray-400 text-lg" />
              <input
                type={showPassword ? 'text' : 'password'}
                className={`w-full border  pl-10 pr-10 py-2 text-gray-700 focus:outline-none focus:ring-1 ${
                  errors.password ? 'border-red-400 focus:ring-red-400' : 'border-gray-300 focus:ring-gray-400'
                }`}
                placeholder="Enter your password"
                value={formData.password}
                onChange={e => handleInputChange('password', e.target.value)}
              />
              <div
                className="absolute right-3 top-3.5 text-gray-400 cursor-pointer text-lg"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
              </div>
            </div>
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gray-800 text-white py-2  font-medium hover:bg-gray-700 transition duration-200"
          >
            {isLoading ? 'Registering...' : 'Create Account'}
          </button>
        </form>

        {/* Login link */}
        <p className="mt-6 text-center text-gray-600 text-sm">
          Already have an account?{' '}
          <Link to="/auth/login" className="font-medium text-gray-800 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}

export default Register
