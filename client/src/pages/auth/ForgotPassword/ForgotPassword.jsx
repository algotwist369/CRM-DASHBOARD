import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Card, Button, Input, Alert } from '../../../components'

const ForgotPassword = () => {
  const [formData, setFormData] = useState({
    email: '',
    resetMethod: 'email' // email or sms
  })
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    setIsLoading(true)
    
    try {
      // Simulate API call
      
      setIsSubmitted(true)
    } catch (error) {
      setErrors({ general: 'Failed to send reset instructions. Please try again.' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendEmail = async () => {
    setIsLoading(true)
    
    try {
      // Simulate API call
      
      // Show success message
      setErrors({})
    } catch (error) {
      setErrors({ general: 'Failed to resend email. Please try again.' })
    } finally {
      setIsLoading(false)
    }
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          {/* Logo/Brand */}
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Check your email
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            We've sent password reset instructions to
          </p>
          <p className="text-center text-sm font-medium text-gray-900">
            {formData.email}
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <Card className="py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <div className="text-center space-y-6">
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center justify-center mb-2">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-sm font-medium text-green-900 mb-1">
                  Email sent successfully
                </h3>
                <p className="text-sm text-green-700">
                  Please check your email and follow the instructions to reset your password.
                </p>
              </div>

              <div className="text-sm text-gray-600">
                <p className="mb-2">Didn't receive the email?</p>
                <ul className="text-left space-y-1">
                  <li>• Check your spam/junk folder</li>
                  <li>• Make sure you entered the correct email address</li>
                  <li>• Wait a few minutes for the email to arrive</li>
                </ul>
              </div>

              <div className="space-y-3">
                <Button
                  variant="outline"
                  onClick={handleResendEmail}
                  loading={isLoading}
                  className="w-full"
                >
                  Resend Email
                </Button>
                
                <Button
                  variant="primary"
                  onClick={() => setIsSubmitted(false)}
                  className="w-full"
                >
                  Try Different Email
                </Button>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <Link
                  to="/auth/login"
                  className="text-sm text-primary-600 hover:text-primary-500"
                >
                  ← Back to Sign In
                </Link>
              </div>
            </div>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Logo/Brand */}
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Forgot your password?
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          No worries! Enter your email address and we'll send you instructions to reset your password.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Card className="py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Error Alert */}
            {errors.general && (
              <Alert type="error" message={errors.general} />
            )}

            {/* Reset Method Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                How would you like to reset your password?
              </label>
              <div className="space-y-2">
                <label className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="resetMethod"
                    value="email"
                    checked={formData.resetMethod === 'email'}
                    onChange={(e) => handleInputChange('resetMethod', e.target.value)}
                    className="text-primary-600 focus:ring-primary-500"
                  />
                  <div className="ml-3">
                    <div className="flex items-center">
                      <svg className="w-5 h-5 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <span className="text-sm font-medium text-gray-900">Email</span>
                    </div>
                    <p className="text-xs text-gray-500">We'll send reset instructions to your email</p>
                  </div>
                </label>
                
                <label className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="resetMethod"
                    value="sms"
                    checked={formData.resetMethod === 'sms'}
                    onChange={(e) => handleInputChange('resetMethod', e.target.value)}
                    className="text-primary-600 focus:ring-primary-500"
                  />
                  <div className="ml-3">
                    <div className="flex items-center">
                      <svg className="w-5 h-5 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      <span className="text-sm font-medium text-gray-900">SMS</span>
                    </div>
                    <p className="text-xs text-gray-500">We'll send a reset code to your phone</p>
                  </div>
                </label>
              </div>
            </div>

            {/* Email/Phone Field */}
            <Input
              label={formData.resetMethod === 'email' ? 'Email Address' : 'Phone Number'}
              name="email"
              type={formData.resetMethod === 'email' ? 'email' : 'tel'}
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder={formData.resetMethod === 'email' ? 'Enter your email address' : 'Enter your phone number'}
              required
              error={errors.email}
              icon={
                formData.resetMethod === 'email' ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                )
              }
            />

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={isLoading}
              className="w-full"
            >
              {isLoading ? 'Sending...' : 'Send Reset Instructions'}
            </Button>

            {/* Back to Login */}
            <div className="text-center">
              <Link
                to="/auth/login"
                className="text-sm text-primary-600 hover:text-primary-500"
              >
                ← Back to Sign In
              </Link>
            </div>
          </form>

          {/* Help Section */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="text-center">
              <h3 className="text-sm font-medium text-gray-900 mb-2">Need help?</h3>
              <p className="text-sm text-gray-600 mb-4">
                If you're having trouble resetting your password, contact our support team.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  // Handle support contact
                  console.log('Contact support')
                }}
              >
                Contact Support
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}

export default ForgotPassword
