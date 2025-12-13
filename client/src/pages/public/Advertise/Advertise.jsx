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
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary-600 to-primary-800 text-white py-16 sm:py-20 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <FaBullhorn className="mx-auto text-5xl sm:text-6xl mb-4" />
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4">
              Advertise With Us
            </h1>
            <p className="text-xl sm:text-2xl text-primary-100 max-w-3xl mx-auto">
              Reach thousands of customers looking for your services
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Benefits */}
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Why Advertise With Us?</h2>
            <p className="text-lg text-gray-600 mb-8">
              Our platform connects businesses with customers actively looking for services. 
              Advertise your business and reach your target audience effectively.
            </p>

            <div className="space-y-4 mb-8">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-start gap-3">
                  <FaCheckCircle className="text-primary-600 mt-1 flex-shrink-0" />
                  <span className="text-gray-700">{benefit}</span>
                </div>
              ))}
            </div>

            <div className="bg-primary-50  p-6 border border-primary-200">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-primary-600  flex items-center justify-center">
                  <FaChartLine className="text-white text-xl" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Track Your Results</h3>
                  <p className="text-sm text-gray-600">Monitor ad performance in real-time</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary-600  flex items-center justify-center">
                  <FaUsers className="text-white text-xl" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Targeted Audience</h3>
                  <p className="text-sm text-gray-600">Reach customers in your area</p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white border border-gray-200 shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Get Started</h2>
            
            {/* Progress Steps */}
            <div className="mb-6 flex items-center justify-center gap-4">
              <div className={`flex items-center gap-2 ${step >= 1 ? 'text-primary-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                  step >= 1 ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-500'
                }`}>
                  {step > 1 ? <FaCheckCircle /> : '1'}
                </div>
                <span className="text-sm font-medium hidden sm:block">Details</span>
              </div>
              <div className={`w-16 h-0.5 ${step >= 2 ? 'bg-primary-600' : 'bg-gray-200'}`}></div>
              <div className={`flex items-center gap-2 ${step >= 2 ? 'text-primary-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                  step >= 2 ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-500'
                }`}>
                  {step > 2 ? <FaCheckCircle /> : '2'}
                </div>
                <span className="text-sm font-medium hidden sm:block">Verify</span>
              </div>
            </div>

            {/* OTP Verification Step */}
            {step === 2 && (
              <div className="space-y-4 mb-6">
                <div className="text-center mb-6">
                  <p className="text-gray-600 mb-1">
                    We've sent a 6-digit OTP to
                  </p>
                  <p className="text-lg font-semibold text-gray-900">
                    {formData.phone}
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    Please check your SMS inbox
                  </p>
                </div>

                <div className="flex justify-center gap-3 mb-4">
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
                      className="w-12 h-12 text-center text-xl font-semibold border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
                    />
                  ))}
                </div>

                <div className="text-center space-y-2">
                  <button
                    type="button"
                    onClick={handleVerifyOtp}
                    disabled={isVerifying || otp.join('').length !== 6}
                    className="w-full px-6 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 active:bg-primary-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    {isVerifying ? (
                      <>
                        <FaSpinner className="animate-spin" />
                        <span>Verifying...</span>
                      </>
                    ) : (
                      <span>Verify & Submit</span>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleResendOTP}
                    disabled={countdown > 0}
                    className={`text-sm font-medium transition-all duration-200 ${
                      countdown > 0
                        ? 'text-gray-400 cursor-not-allowed'
                        : 'text-primary-600 hover:text-primary-700'
                    }`}
                  >
                    {countdown > 0 ? (
                      <span>Resend OTP in {countdown}s</span>
                    ) : (
                      <span>Didn't receive OTP? Resend</span>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setStep(1)
                      setOtp(['', '', '', '', '', ''])
                      setCountdown(0)
                    }}
                    className="block w-full text-sm text-gray-600 hover:text-primary-600 transition-colors duration-200"
                  >
                    ← Change Phone Number
                  </button>
                </div>
              </div>
            )}

            {/* Form Step */}
            {step === 1 && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-200 ${
                    fieldErrors.name 
                      ? 'border-red-500 focus:border-red-500' 
                      : 'border-gray-300 focus:border-primary-500'
                  }`}
                />
                {fieldErrors.name && (
                  <p className="text-xs text-red-600 mt-1">{fieldErrors.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-200 ${
                    fieldErrors.email 
                      ? 'border-red-500 focus:border-red-500' 
                      : 'border-gray-300 focus:border-primary-500'
                  }`}
                />
                {fieldErrors.email && (
                  <p className="text-xs text-red-600 mt-1">{fieldErrors.email}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  placeholder="+91 9876543210 or 9876543210"
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-200 ${
                    fieldErrors.phone 
                      ? 'border-red-500 focus:border-red-500' 
                      : 'border-gray-300 focus:border-primary-500'
                  }`}
                />
                {fieldErrors.phone && (
                  <p className="text-xs text-red-600 mt-1">{fieldErrors.phone}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">Enter 7-15 digits (spaces and special characters will be removed)</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Business/Company Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="businessName"
                  value={formData.businessName}
                  onChange={handleChange}
                  required
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-200 ${
                    fieldErrors.businessName 
                      ? 'border-red-500 focus:border-red-500' 
                      : 'border-gray-300 focus:border-primary-500'
                  }`}
                />
                {fieldErrors.businessName && (
                  <p className="text-xs text-red-600 mt-1">{fieldErrors.businessName}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Website
                </label>
                <input
                  type="url"
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300  focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Monthly Budget <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="budget"
                    value={formData.budget}
                    onChange={handleChange}
                    required
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-200 ${
                      fieldErrors.budget 
                        ? 'border-red-500 focus:border-red-500' 
                        : 'border-gray-300 focus:border-primary-500'
                    }`}
                  >
                    <option value="">Select budget range</option>
                    <option value="under-500">Under $500</option>
                    <option value="500-1000">$500 - $1,000</option>
                    <option value="1000-5000">$1,000 - $5,000</option>
                    <option value="5000+">$5,000+</option>
                  </select>
                  {fieldErrors.budget && (
                    <p className="text-xs text-red-600 mt-1">{fieldErrors.budget}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Timeline <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="timeline"
                    value={formData.timeline}
                    onChange={handleChange}
                    required
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-200 ${
                      fieldErrors.timeline 
                        ? 'border-red-500 focus:border-red-500' 
                        : 'border-gray-300 focus:border-primary-500'
                    }`}
                  >
                    <option value="">Select timeline</option>
                    <option value="immediate">Immediate</option>
                    <option value="1-month">Within 1 month</option>
                    <option value="2-3-months">2-3 months</option>
                    <option value="3-6-months">3-6 months</option>
                    <option value="6-months+">6+ months</option>
                  </select>
                  {fieldErrors.timeline && (
                    <p className="text-xs text-red-600 mt-1">{fieldErrors.timeline}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows={4}
                  required
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-200 ${
                    fieldErrors.message 
                      ? 'border-red-500 focus:border-red-500' 
                      : 'border-gray-300 focus:border-primary-500'
                  }`}
                  placeholder="Tell us about your advertising needs..."
                />
                {fieldErrors.message && (
                  <p className="text-xs text-red-600 mt-1">{fieldErrors.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={status === 'success' || isSendingOtp || apiLoading}
                className="w-full px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 disabled:bg-primary-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {isSendingOtp ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    <span>Sending OTP...</span>
                  </>
                ) : status === 'success' ? (
                  'Request Submitted'
                ) : (
                  'Verify Phone & Continue'
                )}
              </button>
              <p className="text-xs text-gray-500 text-center">
                We'll verify your phone number with OTP to ensure we can reach you.
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

