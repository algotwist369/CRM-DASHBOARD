import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { AiOutlineMail, AiOutlinePhone } from 'react-icons/ai'
import { toast } from 'react-hot-toast'

const ForgotPassword = () => {
  const [formData, setFormData] = useState({ email: '', resetMethod: 'email' })
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }))
  }

  const validateForm = () => {
    const newErrors = {}
    if (!formData.email.trim()) {
      newErrors.email =
        formData.resetMethod === 'email'
          ? 'Email is required'
          : 'Phone number is required'
    } else if (
      formData.resetMethod === 'email' &&
      !/\S+@\S+\.\S+/.test(formData.email)
    ) {
      newErrors.email = 'Enter a valid email address'
    } else if (
      formData.resetMethod === 'sms' &&
      !/^[0-9]{10}$/.test(formData.email)
    ) {
      newErrors.email = 'Enter a valid 10-digit phone number'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async e => {
    e.preventDefault()
    if (!validateForm()) return
    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      setIsSubmitted(true)
      toast.success(
        formData.resetMethod === 'email'
          ? 'Password reset email sent!'
          : 'Reset code sent via SMS!'
      )
    } catch (error) {
      setErrors({ general: 'Something went wrong. Please try again.' })
      toast.error('Failed to send reset instructions')
    } finally {
      setIsLoading(false)
    }
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center px-4">
        <div className="w-full max-w-md bg-white shadow-lg  p-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center">
              <svg
                className="w-7 h-7 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          </div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">
            Check your {formData.resetMethod === 'email' ? 'Email' : 'SMS'}
          </h2>
          <p className="text-gray-600 text-sm mb-6">
            We’ve sent reset instructions to{' '}
            <span className="font-medium text-gray-900">{formData.email}</span>
          </p>

          <button
            onClick={() => setIsSubmitted(false)}
            className="w-full bg-gray-800 text-white py-2  font-medium hover:bg-gray-700 transition duration-200 mb-3"
          >
            Try Different {formData.resetMethod === 'email' ? 'Email' : 'Phone'}
          </button>

          <Link
            to="/auth/login"
            className="text-sm text-gray-700 hover:underline block mt-2"
          >
            ← Back to Sign In
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4">
      <div className="w-full max-w-md bg-white shadow-lg  p-8">
        <h2 className="text-center text-2xl font-semibold text-gray-800 mb-1">
          Forgot your password?
        </h2>
        <p className="text-center text-gray-500 text-sm mb-6">
          No worries! Choose how you'd like to reset it.
        </p>

        {errors.general && (
          <div className="bg-red-50 text-red-600 text-sm p-3  mb-3 border border-red-200">
            {errors.general}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Reset Method Selection */}
          <div>
            <label className="block text-sm text-gray-700 mb-2">
              Reset method
            </label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-600">
                <input
                  type="radio"
                  name="resetMethod"
                  value="email"
                  checked={formData.resetMethod === 'email'}
                  onChange={e => handleInputChange('resetMethod', e.target.value)}
                  className="accent-gray-600"
                />
                Email
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-600">
                <input
                  type="radio"
                  name="resetMethod"
                  value="sms"
                  checked={formData.resetMethod === 'sms'}
                  onChange={e => handleInputChange('resetMethod', e.target.value)}
                  className="accent-gray-600"
                />
                SMS
              </label>
            </div>
          </div>

          {/* Email / Phone Field */}
          <div>
            <label className="block text-sm text-gray-700 mb-1">
              {formData.resetMethod === 'email'
                ? 'Email Address'
                : 'Phone Number'}
            </label>
            <div className="relative">
              {formData.resetMethod === 'email' ? (
                <AiOutlineMail className="absolute left-3 top-3.5 text-gray-400 text-lg" />
              ) : (
                <AiOutlinePhone className="absolute left-3 top-3.5 text-gray-400 text-lg" />
              )}
              <input
                type={formData.resetMethod === 'email' ? 'email' : 'tel'}
                className="w-full border border-gray-300  pl-10 pr-3 py-2 focus:outline-none focus:ring-1 focus:ring-gray-400 text-gray-700"
                placeholder={
                  formData.resetMethod === 'email'
                    ? 'you@example.com'
                    : 'Enter your phone number'
                }
                value={formData.email}
                onChange={e => handleInputChange('email', e.target.value)}
              />
            </div>
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">{errors.email}</p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gray-800 text-white py-2  font-medium hover:bg-gray-700 transition duration-200"
          >
            {isLoading ? 'Sending...' : 'Send Reset Instructions'}
          </button>
        </form>

        {/* Back to Login */}
        <p className="mt-6 text-center text-gray-600 text-sm">
          Remember your password?{' '}
          <Link to="/auth/login" className="font-medium text-gray-800 hover:underline">
            Back to Sign In
          </Link>
        </p>
      </div>
    </div>
  )
}

export default ForgotPassword
