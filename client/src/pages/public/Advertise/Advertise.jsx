import React, { useState, useEffect } from 'react'
import { usePageTitle } from '../../../hooks/usePageTitle'
import { FaBullhorn, FaChartLine, FaUsers, FaCheckCircle, FaSpinner } from 'react-icons/fa'
import { toast } from 'react-hot-toast'
import { useAdvertise } from '../../../hooks/public/useAdvertise'

// Mobile number validation helper
const validatePhoneNumber = (phone) => {
  if (!phone) return { valid: false, error: 'Phone number is required' }
  const cleanPhone = phone.replace(/[^0-9]/g, '')
  if (cleanPhone.length < 7 || cleanPhone.length > 15) {
    return { valid: false, error: 'Phone number must be between 7 and 15 digits' }
  }
  return { valid: true, cleanPhone }
}

const Advertise = () => {
  usePageTitle('Advertise - Booking App')
  const { sendOtp, verifyOtp, createAdvertise, loading: apiLoading } = useAdvertise()

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    businessName: '',
    website: '',
    budget: '',
    timeline: '',
    message: ''
  })
  const [step, setStep] = useState(1) // 1: Form, 2: OTP Verification
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [isVerifying, setIsVerifying] = useState(false)
  const [isSendingOtp, setIsSendingOtp] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const [isPhoneVerified, setIsPhoneVerified] = useState(false)
  const [fieldErrors, setFieldErrors] = useState({})
  const [status, setStatus] = useState('idle') // 'idle', 'loading', 'success', 'error'

  // Countdown timer for resend OTP
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  // Auto-focus first OTP input when OTP step opens
  useEffect(() => {
    if (step === 2) {
      setTimeout(() => {
        document.getElementById('otp-0')?.focus()
      }, 100)
    }
  }, [step])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))

    // Clear field error when user starts typing
    if (fieldErrors[name]) {
      setFieldErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const validateForm = () => {
    const errors = {}

    if (!formData.name.trim()) {
      errors.name = 'Name is required'
    } else if (formData.name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters'
    }

    if (!formData.email.trim()) {
      errors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Invalid email address'
    }

    const phoneValidation = validatePhoneNumber(formData.phone)
    if (!phoneValidation.valid) {
      errors.phone = phoneValidation.error
    }

    if (!formData.businessName.trim()) {
      errors.businessName = 'Business/Company name is required'
    } else if (formData.businessName.trim().length < 2) {
      errors.businessName = 'Business name must be at least 2 characters'
    }

    if (!formData.budget.trim()) {
      errors.budget = 'Budget is required'
    }

    if (!formData.timeline.trim()) {
      errors.timeline = 'Timeline is required'
    }

    if (!formData.message.trim()) {
      errors.message = 'Message is required'
    } else if (formData.message.trim().length < 5) {
      errors.message = 'Message must be at least 5 characters'
    }

    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleOTPChange = (index, value) => {
    if (value.length > 1) return

    const newOtp = [...otp]
    newOtp[index] = value.replace(/[^0-9]/g, '')
    setOtp(newOtp)

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`)
      if (nextInput) nextInput.focus()
    }
  }

  const handleOTPKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`)
      if (prevInput) prevInput.focus()
    }
  }

  const handleSendOtp = async () => {
    setFieldErrors({})

    // Validate form first
    if (!validateForm()) {
      toast.error('Please correct the errors below')
      return
    }

    try {
      setIsSendingOtp(true)
      const phoneValidation = validatePhoneNumber(formData.phone)
      await sendOtp(phoneValidation.cleanPhone, formData.name.trim())

      setStep(2)
      setCountdown(60) // 60 seconds countdown
      toast.success('OTP sent to your mobile number')
    } catch (err) {
      toast.error(err.message || 'Failed to send OTP. Please try again.')
    } finally {
      setIsSendingOtp(false)
    }
  }

  const handleResendOTP = async () => {
    if (countdown > 0) return

    try {
      const phoneValidation = validatePhoneNumber(formData.phone)
      await sendOtp(phoneValidation.cleanPhone, formData.name.trim())

      toast.success('OTP resent to your mobile number')
      setOtp(['', '', '', '', '', ''])
      setCountdown(60)
      document.getElementById('otp-0')?.focus()
    } catch (err) {
      toast.error(err.message || 'Failed to resend OTP. Please try again.')
    }
  }

  const handleVerifyOtp = async () => {
    const otpValue = otp.join('')

    if (otpValue.length !== 6) {
      toast.error('Please enter complete OTP')
      return
    }

    try {
      setIsVerifying(true)
      const phoneValidation = validatePhoneNumber(formData.phone)
      await verifyOtp(phoneValidation.cleanPhone, otpValue)

      setIsPhoneVerified(true)
      toast.success('Phone number verified successfully!')

      // Automatically submit the form after OTP verification
      await handleSubmitForm()
    } catch (err) {
      toast.error(err.message || 'Invalid OTP. Please try again.')
      setOtp(['', '', '', '', '', ''])
      document.getElementById('otp-0')?.focus()
    } finally {
      setIsVerifying(false)
    }
  }

  const handleSubmitForm = async () => {
    try {
      setStatus('loading')

      // Prepare data for API (map frontend fields to backend fields)
      const phoneValidation = validatePhoneNumber(formData.phone)
      const apiData = {
        name: formData.name.trim(),
        company: formData.businessName.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: phoneValidation.cleanPhone,
        website: formData.website.trim() || undefined,
        budget: formData.budget.trim(),
        timeline: formData.timeline.trim(),
        message: formData.message.trim()
      }

      await createAdvertise(apiData)

      setStatus('success')
      toast.success('Advertising request submitted successfully! We\'ll contact you soon.')

      // Reset form after success
      setTimeout(() => {
        setFormData({
          name: '',
          email: '',
          phone: '',
          businessName: '',
          website: '',
          budget: '',
          timeline: '',
          message: ''
        })
        setOtp(['', '', '', '', '', ''])
        setStep(1)
        setIsPhoneVerified(false)
        setStatus('idle')
      }, 2000)
    } catch (err) {
      setStatus('error')
      toast.error(err.message || 'Failed to submit request. Please try again.')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // If phone is not verified, send OTP first
    if (!isPhoneVerified && step === 1) {
      await handleSendOtp()
      return
    }

    // If on OTP step, verify OTP
    if (step === 2) {
      await handleVerifyOtp()
      return
    }
  }

  const benefits = [
    'Reach thousands of potential customers',
    'Targeted advertising options',
    'Multiple ad formats available',
    'Real-time performance tracking',
    'Flexible budget options',
    'Dedicated account manager'
  ]

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Hero Section */}
      <div className="bg-primary-600 text-white py-12">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <FaBullhorn className="mx-auto text-4xl mb-3" />
          <h1 className="text-3xl sm:text-4xl font-semibold mb-2">
            Advertise With Us
          </h1>
          <p className="text-sm sm:text-base text-primary-100">
            Reach customers actively looking for your services
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">

          {/* Benefits */}
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Why Advertise With Us?
            </h2>

            <p className="text-sm text-gray-600 mb-6">
              Promote your business to customers who are already searching for services like yours.
            </p>

            <div className="space-y-3 mb-6">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex gap-2 text-sm text-gray-700">
                  <FaCheckCircle className="text-primary-600 mt-0.5" />
                  <span>{benefit}</span>
                </div>
              ))}
            </div>

            <div className="border border-gray-200 bg-white p-5 space-y-4">
              <div className="flex items-center gap-3">
                <FaChartLine className="text-primary-600" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Track performance</p>
                  <p className="text-xs text-gray-500">Real-time ad insights</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <FaUsers className="text-primary-600" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Targeted reach</p>
                  <p className="text-xs text-gray-500">Customers near your location</p>
                </div>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="bg-white border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-5">
              Get Started Securely
            </h2>

            {/* Steps */}
            <div className="flex items-center justify-center gap-6 mb-6 text-sm">
              <span className={step >= 1 ? "text-primary-600 font-medium" : "text-gray-400"}>
                1. Details
              </span>
              <span className="text-gray-300">—</span>
              <span className={step >= 2 ? "text-primary-600 font-medium" : "text-gray-400"}>
                2. Verify
              </span>
            </div>

            {/* OTP Step */}
            {step === 2 && (
              <div className="space-y-5 mb-6">

                <div className="text-center text-sm">
                  <p className="text-gray-600">Enter the 6-digit OTP sent to</p>
                  <p className="font-medium text-gray-900">{formData.phone}</p>
                  <p className="text-xs text-gray-500 mt-1">🔐 For your security</p>
                </div>

                <div className="flex justify-center gap-2">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      id={`otp-${index}`}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOTPChange(index, e.target.value)}
                      onKeyDown={(e) => handleOTPKeyDown(index, e)}
                      placeholder="•"
                      className="w-10 h-12 text-center text-lg border border-gray-300 focus:outline-none focus:border-primary-500"
                    />
                  ))}
                </div>

                <button
                  type="button"
                  onClick={handleVerifyOtp}
                  disabled={isVerifying || otp.join('').length !== 6}
                  className="w-full py-3 bg-primary-600 text-white text-sm font-medium disabled:opacity-50"
                >
                  {isVerifying ? "Verifying..." : "Verify & Submit"}
                </button>

                <button
                  type="button"
                  onClick={handleResendOTP}
                  disabled={countdown > 0}
                  className={`w-full text-xs text-center ${countdown > 0 ? "text-gray-400" : "text-primary-600"
                    }`}
                >
                  {countdown > 0
                    ? `Resend OTP in ${countdown}s`
                    : "Didn't receive OTP? Resend"}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setStep(1)
                    setOtp(['', '', '', '', '', ''])
                    setCountdown(0)
                  }}
                  className="w-full text-xs text-gray-500"
                >
                  ← Change phone number
                </button>
              </div>
            )}

            {/* Form Step */}
            {step === 1 && (
              <form onSubmit={handleSubmit} className="space-y-4 text-sm">

                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="Your full name *"
                  className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-primary-500"
                />

                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="Email address *"
                  className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-primary-500"
                />

                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  placeholder="Mobile number (OTP verification) *"
                  className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-primary-500"
                />

                <input
                  type="text"
                  name="businessName"
                  value={formData.businessName}
                  onChange={handleChange}
                  required
                  placeholder="Business / Company name *"
                  className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-primary-500"
                />

                <input
                  type="url"
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                  placeholder="Website (optional)"
                  className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-primary-500"
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <select
                    name="budget"
                    value={formData.budget}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-primary-500"
                  >
                    <option value="">Monthly budget *</option>
                    <option value="under-500">Under $500</option>
                    <option value="500-1000">$500 - $1,000</option>
                    <option value="1000-5000">$1,000 - $5,000</option>
                    <option value="5000+">$5,000+</option>
                  </select>

                  <select
                    name="timeline"
                    value={formData.timeline}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-primary-500"
                  >
                    <option value="">Timeline *</option>
                    <option value="immediate">Immediate</option>
                    <option value="1-month">Within 1 month</option>
                    <option value="2-3-months">2-3 months</option>
                    <option value="3-6-months">3-6 months</option>
                    <option value="6-months+">6+ months</option>
                  </select>
                </div>

                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows={4}
                  required
                  placeholder="Tell us about your advertising needs *"
                  className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-primary-500"
                />

                <button
                  type="submit"
                  disabled={status === 'success' || isSendingOtp || apiLoading}
                  className="w-full py-3 bg-primary-600 text-white text-sm font-medium disabled:opacity-50"
                >
                  {isSendingOtp
                    ? "Sending OTP..."
                    : status === "success"
                      ? "Request Submitted"
                      : "Continue securely"}
                </button>

                <p className="text-xs text-gray-500 text-center">
                  🔒 Your information is encrypted & secure. OTP verification required.
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Advertise

