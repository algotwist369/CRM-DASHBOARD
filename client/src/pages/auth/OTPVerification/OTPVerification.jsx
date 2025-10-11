import React, { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Card, Button, Alert } from '../../../components'
import authService from '../../../services/auth/authService'
import { toast } from 'react-hot-toast'

const OTPVerification = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [timeLeft, setTimeLeft] = useState(300) // 5 minutes
  const [isVerified, setIsVerified] = useState(false)
  const inputRefs = useRef([])

  // Get verification data from location state
  const verificationData = location.state || {
    email: 'user@example.com',
    phone: '+1234567890',
    type: 'email', // email or sms
    purpose: 'registration' // registration, login, password_reset
  }

  useEffect(() => {
    // Start countdown timer
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleOtpChange = (index, value) => {
    // Only allow numbers
    if (!/^\d*$/.test(value)) return

    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)

    // Clear error when user starts typing
    if (errors.otp) {
      setErrors(prev => ({ ...prev, otp: '' }))
    }

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index, e) => {
    // Handle backspace
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
    
    // Handle paste
    if (e.key === 'v' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault()
      navigator.clipboard.readText().then(text => {
        const pastedOtp = text.replace(/\D/g, '').slice(0, 6)
        const newOtp = [...otp]
        for (let i = 0; i < pastedOtp.length; i++) {
          newOtp[i] = pastedOtp[i]
        }
        setOtp(newOtp)
        inputRefs.current[Math.min(pastedOtp.length - 1, 5)]?.focus()
      })
    }
  }

  const validateOtp = () => {
    const otpString = otp.join('')
    
    if (otpString.length !== 6) {
      setErrors({ otp: 'Please enter the complete 6-digit code' })
      return false
    }
    
    if (!/^\d{6}$/.test(otpString)) {
      setErrors({ otp: 'Please enter a valid 6-digit code' })
      return false
    }
    
    return true
  }

  const handleVerify = async (e) => {
    e.preventDefault()
    
    if (!validateOtp()) return
    
    setIsLoading(true)
    setErrors({})
    
    try {
      const otpString = otp.join('')
      
      const result = await authService.verifyOTP(otpString, verificationData.type)
      
      if (result.success) {
        setIsVerified(true)
        toast.success('OTP verified successfully!')
        
        // Redirect based on purpose
        setTimeout(() => {
          switch (verificationData.purpose) {
            case 'registration':
              navigate('/auth/login', { 
                state: { message: 'Account verified successfully! Please sign in.' }
              })
              break
            case 'login':
              navigate('/dashboard')
              break
            case 'password_reset':
              navigate('/auth/reset-password', { 
                state: { token: result.data.token }
              })
              break
            default:
              navigate('/dashboard')
          }
        }, 2000)
      } else {
        setErrors({ otp: result.error || 'Invalid verification code. Please try again.' })
        toast.error(result.error || 'Invalid verification code')
      }
    } catch (error) {
      console.error('OTP verification error:', error)
      setErrors({ general: 'Verification failed. Please try again.' })
      toast.error('Verification failed')
    } finally {
      setIsLoading(false)
    }
  }

  const handleResend = async () => {
    setIsResending(true)
    setErrors({})
    
    try {
      const result = await authService.sendOTP(verificationData.email, verificationData.type)
      
      if (result.success) {
        toast.success('Verification code sent successfully!')
        
        // Reset timer
        setTimeLeft(300)
        
        // Clear OTP
        setOtp(['', '', '', '', '', ''])
        
        // Focus first input
        inputRefs.current[0]?.focus()
      } else {
        setErrors({ general: result.error || 'Failed to resend code. Please try again.' })
        toast.error(result.error || 'Failed to resend code')
      }
    } catch (error) {
      console.error('Resend OTP error:', error)
      setErrors({ general: 'Failed to resend code. Please try again.' })
      toast.error('Failed to resend code')
    } finally {
      setIsResending(false)
    }
  }

  const getPurposeText = () => {
    switch (verificationData.purpose) {
      case 'registration':
        return 'verify your account'
      case 'login':
        return 'complete your sign in'
      case 'password_reset':
        return 'reset your password'
      default:
        return 'complete verification'
    }
  }

  const getContactInfo = () => {
    if (verificationData.type === 'email') {
      return verificationData.email
    } else {
      return verificationData.phone
    }
  }

  if (isVerified) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Verification Successful
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Your account has been verified successfully.
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <Card className="py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <div className="text-center space-y-6">
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center justify-center mb-2">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-sm font-medium text-green-900 mb-1">
                  Account Verified
                </h3>
                <p className="text-sm text-green-700">
                  Redirecting you now...
                </p>
              </div>

              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
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
          Verify Your {verificationData.type === 'email' ? 'Email' : 'Phone'}
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          We've sent a 6-digit verification code to {getContactInfo()}
        </p>
        <p className="text-center text-sm text-gray-500">
          Enter the code below to {getPurposeText()}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Card className="py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleVerify}>
            {/* Error Alert */}
            {errors.general && (
              <Alert type="error" message={errors.general} />
            )}

            {/* OTP Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3 text-center">
                Enter verification code
              </label>
              <div className="flex justify-center space-x-2">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={el => inputRefs.current[index] = el}
                    type="text"
                    inputMode="numeric"
                    maxLength="1"
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className={`w-12 h-12 text-center text-lg font-semibold border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                      errors.otp ? 'border-red-500' : 'border-gray-300'
                    }`}
                    autoComplete="off"
                  />
                ))}
              </div>
              {errors.otp && (
                <p className="mt-2 text-sm text-red-600 text-center">{errors.otp}</p>
              )}
            </div>

            {/* Timer */}
            <div className="text-center">
              {timeLeft > 0 ? (
                <p className="text-sm text-gray-600">
                  Code expires in <span className="font-medium text-gray-900">{formatTime(timeLeft)}</span>
                </p>
              ) : (
                <p className="text-sm text-red-600">
                  Verification code has expired
                </p>
              )}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={isLoading}
              disabled={otp.join('').length !== 6 || timeLeft === 0}
              className="w-full"
            >
              {isLoading ? 'Verifying...' : 'Verify Code'}
            </Button>

            {/* Resend Code */}
            <div className="text-center">
              {timeLeft === 0 ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleResend}
                  loading={isResending}
                  className="w-full"
                >
                  {isResending ? 'Resending...' : 'Resend Code'}
                </Button>
              ) : (
                <p className="text-sm text-gray-600">
                  Didn't receive the code?{' '}
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={isResending}
                    className="text-primary-600 hover:text-primary-500 font-medium disabled:opacity-50"
                  >
                    {isResending ? 'Resending...' : 'Resend'}
                  </button>
                </p>
              )}
            </div>

            {/* Change Contact Info */}
            <div className="text-center">
              <p className="text-sm text-gray-600">
                Wrong {verificationData.type === 'email' ? 'email' : 'phone number'}?{' '}
                <Link
                  to={verificationData.purpose === 'registration' ? '/auth/register' : '/auth/login'}
                  className="text-primary-600 hover:text-primary-500 font-medium"
                >
                  Go back and change
                </Link>
              </p>
            </div>
          </form>

          {/* Help Section */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="text-center">
              <h3 className="text-sm font-medium text-gray-900 mb-2">Need help?</h3>
              <p className="text-sm text-gray-600 mb-4">
                If you're having trouble receiving the verification code, check your spam folder or contact support.
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

        {/* Demo Code */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="text-sm font-medium text-blue-900 mb-2">Demo Verification Code</h3>
          <p className="text-sm text-blue-700">
            For testing purposes, use: <span className="font-mono font-bold">123456</span>
          </p>
        </div>
      </div>
    </div>
  )
}

export default OTPVerification
