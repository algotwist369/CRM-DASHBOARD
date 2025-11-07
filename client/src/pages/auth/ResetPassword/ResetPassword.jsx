import React, { useState } from 'react'
import { AiOutlineLock, AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import authService from '../../../services/auth/authService'

const ResetPassword = () => {
  const navigate = useNavigate()
  const { token } = useParams()

  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  })
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // Password strength check
  const getPasswordStrength = (password) => {
    if (password.length === 0) return ''
    if (password.length < 6) return 'Weak'
    if (password.length < 10) return 'Moderate'
    return 'Strong'
  }

  // Live validation while typing
  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))

    const newErrors = { ...errors }
    if (field === 'password') {
      if (!value.trim()) newErrors.password = 'Password is required'
      else if (value.length < 6) newErrors.password = 'Minimum 6 characters required'
      else newErrors.password = ''
    }
    if (field === 'confirmPassword') {
      if (!value.trim()) newErrors.confirmPassword = 'Confirm password is required'
      else if (value !== formData.password) newErrors.confirmPassword = 'Passwords do not match'
      else newErrors.confirmPassword = ''
    }
    setErrors(newErrors)
  }

  // Validate form on submit
  const validateForm = () => {
    const newErrors = {}
    if (!formData.password.trim()) newErrors.password = 'Password is required'
    else if (formData.password.length < 6) newErrors.password = 'Minimum 6 characters required'
    if (!formData.confirmPassword.trim()) newErrors.confirmPassword = 'Confirm password is required'
    else if (formData.confirmPassword !== formData.password)
      newErrors.confirmPassword = 'Passwords do not match'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Handle form submit
  const handleSubmit = async e => {
    e.preventDefault()
    if (!validateForm()) return

    setIsLoading(true)
    try {
      const result = await authService.resetPassword(token, formData.password)
      if (result.success) {
        toast.success('Password reset successful!')
        navigate('/auth/login')
      } else {
        toast.error(result.error || 'Password reset failed. Try again.')
      }
    } catch (error) {
      console.error('Reset Password Error:', error)
      toast.error('Unexpected error occurred.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4">
      <div className="w-full max-w-md bg-white shadow-lg rounded-xl p-8">
        <h2 className="text-center text-2xl font-semibold text-gray-800 mb-1">
          Reset Password 🔒
        </h2>
        <p className="text-center text-gray-500 text-sm mb-6">
          Enter a new password for your account
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* New Password */}
          <div>
            <label className="block text-sm text-gray-700 mb-1">New Password</label>
            <div className="relative">
              <AiOutlineLock className="absolute left-3 top-3.5 text-gray-400 text-lg" />
              <input
                type={showPassword ? 'text' : 'password'}
                className={`w-full border rounded-lg pl-10 pr-10 py-2 focus:outline-none focus:ring-1 focus:ring-gray-400 text-gray-700 ${errors.password ? 'border-red-500' : 'border-gray-300'
                  }`}
                placeholder="Enter new password"
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

            {/* Password strength */}
            {formData.password && (
              <p
                className={`text-xs mt-1 ${getPasswordStrength(formData.password) === 'Weak'
                    ? 'text-red-500'
                    : getPasswordStrength(formData.password) === 'Moderate'
                      ? 'text-yellow-500'
                      : 'text-green-500'
                  }`}
              >
                Strength: {getPasswordStrength(formData.password)}
              </p>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm text-gray-700 mb-1">Confirm Password</label>
            <div className="relative">
              <AiOutlineLock className="absolute left-3 top-3.5 text-gray-400 text-lg" />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                className={`w-full border rounded-lg pl-10 pr-10 py-2 focus:outline-none focus:ring-1 focus:ring-gray-400 text-gray-700 ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                  }`}
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={e => handleInputChange('confirmPassword', e.target.value)}
              />
              <div
                className="absolute right-3 top-3.5 text-gray-400 cursor-pointer text-lg"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
              </div>
            </div>
            {errors.confirmPassword && (
              <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gray-800 text-white py-2 rounded-lg font-medium hover:bg-gray-700 transition duration-200"
          >
            {isLoading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>

        {/* Back to Login */}
        <p className="mt-6 text-center text-gray-600 text-sm">
          Remembered your password?{' '}
          <span
            onClick={() => navigate('/auth/login')}
            className="font-medium text-gray-800 hover:underline cursor-pointer"
          >
            Sign in
          </span>
        </p>
      </div>
    </div>
  )
}

export default ResetPassword
