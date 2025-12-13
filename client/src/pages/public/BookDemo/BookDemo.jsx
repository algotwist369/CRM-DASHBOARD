import React, { useMemo, useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { FaCalendarAlt, FaClipboardCheck, FaHeadset, FaShieldAlt, FaSpinner, FaCheckCircle } from 'react-icons/fa'
import { toast } from 'react-hot-toast'
import { usePageTitle } from '../../../hooks/usePageTitle'
import { useBookDemo } from '../../../hooks/public/useBookDemo'

const summaryPoints = [
  {
    icon: FaCalendarAlt,
    title: '30-Minute Strategy Call',
    description: 'See exactly how Booking App fits your workflows across scheduling, marketing, and analytics.'
  },
  {
    icon: FaClipboardCheck,
    title: 'Personalized Action Plan',
    description: 'We map your goals to an implementation timeline, integrations, and adoption steps.'
  },
  {
    icon: FaShieldAlt,
    title: 'Proof of Success',
    description: 'Walk through case studies and live dashboards from businesses like yours.'
  },
  {
    icon: FaHeadset,
    title: 'Dedicated Advisor',
    description: 'Meet your success partner who stays with you from onboarding to scale.'
  }
]

const initialFormState = {
  fullName: '',
  businessName: '',
  email: '',
  phone: '',
  teamSize: '',
  objective: 'scale-bookings',
  message: ''
}

// Mobile number validation helper
const validatePhoneNumber = (phone) => {
  if (!phone) return { valid: false, error: 'Phone number is required' }
  const cleanPhone = phone.replace(/[^0-9]/g, '')
  if (cleanPhone.length < 7 || cleanPhone.length > 15) {
    return { valid: false, error: 'Phone number must be between 7 and 15 digits' }
  }
  return { valid: true, cleanPhone }
}

const objectives = [
  { value: 'scale-bookings', label: 'Increase online bookings' },
  { value: 'streamline-ops', label: 'Streamline operations & staffing' },
  { value: 'grow-reviews', label: 'Grow reviews & reputation' },
  { value: 'all-in-one', label: 'All-in-one management' }
]

const heroHighlights = [
  'Live walkthrough tailored to your business',
  'Answers to pricing, onboarding, and ROI questions',
  'No obligation — we succeed when you do'
]

export const BookDemoForm = ({ mode = 'page', onComplete, initialData = {} }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const { sendOtp, verifyOtp, createBookDemo, loading: apiLoading } = useBookDemo()

  const initialValues = useMemo(() => {
    const fromLocation =
      mode === 'page' && location.state && typeof location.state === 'object'
        ? location.state
        : {}
    return { ...initialFormState, ...initialData, ...fromLocation }
  }, [initialData, location.state, mode])

  const [formValues, setFormValues] = useState(initialValues)
  const [status, setStatus] = useState('idle') // 'idle', 'loading', 'otp-sent', 'otp-verifying', 'success', 'error'
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const [step, setStep] = useState(1) // 1: Form, 2: OTP Verification
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [isVerifying, setIsVerifying] = useState(false)
  const [isSendingOtp, setIsSendingOtp] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const [isPhoneVerified, setIsPhoneVerified] = useState(false)

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

  const isSubmitDisabled = useMemo(() => {
    if (status === 'success' || apiLoading || isVerifying || isSendingOtp) return true
    if (step === 2) return otp.join('').length !== 6 || isVerifying
    return (
      !formValues.fullName.trim() ||
      !formValues.email.trim() ||
      !formValues.businessName.trim() ||
      !formValues.phone.trim() ||
      !formValues.teamSize.trim() ||
      !formValues.message.trim()
    )
  }, [formValues, status, apiLoading, step, otp, isVerifying, isSendingOtp])

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormValues((prev) => ({ ...prev, [name]: value }))
    
    // Clear field error when user starts typing
    if (fieldErrors[name]) {
      setFieldErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
    
    // Clear general error
    if (error) {
      setError('')
    }
  }

  const validateForm = () => {
    const errors = {}
    
    if (!formValues.fullName.trim()) {
      errors.fullName = 'Full name is required'
    } else if (formValues.fullName.trim().length < 2) {
      errors.fullName = 'Full name must be at least 2 characters'
    }
    
    if (!formValues.businessName.trim()) {
      errors.businessName = 'Business name is required'
    } else if (formValues.businessName.trim().length < 2) {
      errors.businessName = 'Business name must be at least 2 characters'
    }
    
    if (!formValues.email.trim()) {
      errors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formValues.email)) {
      errors.email = 'Invalid email address'
    }
    
    const phoneValidation = validatePhoneNumber(formValues.phone)
    if (!phoneValidation.valid) {
      errors.phone = phoneValidation.error
    }
    
    if (!formValues.teamSize.trim()) {
      errors.teamSize = 'Team size is required'
    }
    
    if (!formValues.message.trim()) {
      errors.message = 'Message is required'
    } else if (formValues.message.trim().length < 5) {
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
    setError('')
    setFieldErrors({})
    
    // Validate form first
    if (!validateForm()) {
      setError('Please correct the errors below')
      return
    }

    try {
      setIsSendingOtp(true)
      const phoneValidation = validatePhoneNumber(formValues.phone)
      await sendOtp(phoneValidation.cleanPhone, formValues.fullName.trim())

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
      const phoneValidation = validatePhoneNumber(formValues.phone)
      await sendOtp(phoneValidation.cleanPhone, formValues.fullName.trim())

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
      const phoneValidation = validatePhoneNumber(formValues.phone)
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
      const phoneValidation = validatePhoneNumber(formValues.phone)
      const apiData = {
        fullName: formValues.fullName.trim(),
        businessName: formValues.businessName.trim(),
        email: formValues.email.trim().toLowerCase(),
        phoneNumber: phoneValidation.cleanPhone,
        teamSize: formValues.teamSize.trim(),
        primaryObjective: formValues.objective || 'scale-bookings',
        message: formValues.message.trim()
      }

      await createBookDemo(apiData)
      
      setStatus('success')
      toast.success('Demo request submitted successfully! We\'ll contact you soon.')
      
      // Reset form after success
      setTimeout(() => {
        setFormValues(initialFormState)
        setOtp(['', '', '', '', '', ''])
        setStep(1)
        setIsPhoneVerified(false)
        setStatus('idle')
      }, 2000)
      
      if (mode === 'modal') {
        onComplete?.(apiData)
      } else {
        navigate('/contact', {
          replace: false,
          state: { intent: 'book-demo', payload: apiData, message: 'BookDemoFormSubmitted' }
        })
      }
    } catch (err) {
      setStatus('error')
      const errorMessage = err.message || 'Failed to submit demo request. Please try again.'
      setError(errorMessage)
      toast.error(errorMessage)
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    
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

  return (
    <div className="bg-white border border-gray-200 shadow-lg p-6 sm:p-8">
      <h2 className="text-2xl font-semibold text-gray-900 mb-2">Request your live walkthrough</h2>
      <p className="text-sm text-gray-600 mb-6">
        {step === 1 
          ? "Share a few details and we'll follow up within one business day."
          : "We've sent a 6-digit OTP to verify your phone number."
        }
      </p>

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
        <div className="space-y-4">
          <div className="text-center mb-6">
            <p className="text-gray-600 mb-1">
              We've sent a 6-digit OTP to
            </p>
            <p className="text-lg font-semibold text-gray-900">
              {formValues.phone}
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
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="block text-sm font-semibold text-gray-700" htmlFor="fullName">
              Full name
            </label>
            <input
              id="fullName"
              name="fullName"
              type="text"
              placeholder="Alex Johnson"
              value={formValues.fullName}
              onChange={handleChange}
              className={`w-full border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-200 ${
                fieldErrors.fullName 
                  ? 'border-red-500 focus:border-red-500' 
                  : 'border-gray-300 focus:border-primary-500'
              }`}
              required
            />
            {fieldErrors.fullName && (
              <p className="text-xs text-red-600 mt-1">{fieldErrors.fullName}</p>
            )}
          </div>
          <div className="space-y-1">
            <label className="block text-sm font-semibold text-gray-700" htmlFor="businessName">
              Business name
            </label>
            <input
              id="businessName"
              name="businessName"
              type="text"
              placeholder="Glow & Co. Salon"
              value={formValues.businessName}
              onChange={handleChange}
              className={`w-full border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-200 ${
                fieldErrors.businessName 
                  ? 'border-red-500 focus:border-red-500' 
                  : 'border-gray-300 focus:border-primary-500'
              }`}
              required
            />
            {fieldErrors.businessName && (
              <p className="text-xs text-red-600 mt-1">{fieldErrors.businessName}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="block text-sm font-semibold text-gray-700" htmlFor="email">
              Work email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="you@business.com"
              value={formValues.email}
              onChange={handleChange}
              className={`w-full border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-200 ${
                fieldErrors.email 
                  ? 'border-red-500 focus:border-red-500' 
                  : 'border-gray-300 focus:border-primary-500'
              }`}
              required
            />
            {fieldErrors.email && (
              <p className="text-xs text-red-600 mt-1">{fieldErrors.email}</p>
            )}
          </div>
          <div className="space-y-1">
            <label className="block text-sm font-semibold text-gray-700" htmlFor="phone">
              Phone / WhatsApp <span className="text-red-500">*</span>
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              placeholder="+91 9876543210 or 9876543210"
              value={formValues.phone}
              onChange={handleChange}
              className={`w-full border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-200 ${
                fieldErrors.phone 
                  ? 'border-red-500 focus:border-red-500' 
                  : 'border-gray-300 focus:border-primary-500'
              }`}
              required
            />
            {fieldErrors.phone && (
              <p className="text-xs text-red-600 mt-1">{fieldErrors.phone}</p>
            )}
            <p className="text-xs text-gray-500 mt-1">Enter 7-15 digits (spaces and special characters will be removed)</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="block text-sm font-semibold text-gray-700" htmlFor="teamSize">
              Team size
            </label>
            <input
              id="teamSize"
              name="teamSize"
              type="text"
              placeholder="e.g. 10 staff across 2 branches"
              value={formValues.teamSize}
              onChange={handleChange}
              className={`w-full border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-200 ${
                fieldErrors.teamSize 
                  ? 'border-red-500 focus:border-red-500' 
                  : 'border-gray-300 focus:border-primary-500'
              }`}
              required
            />
            {fieldErrors.teamSize && (
              <p className="text-xs text-red-600 mt-1">{fieldErrors.teamSize}</p>
            )}
          </div>
          <div className="space-y-1">
            <label className="block text-sm font-semibold text-gray-700" htmlFor="objective">
              Primary objective
            </label>
            <select
              id="objective"
              name="objective"
              value={formValues.objective}
              onChange={handleChange}
              className="w-full  border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
            >
              {objectives.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-semibold text-gray-700" htmlFor="message">
            Anything else you'd like us to know?
          </label>
          <textarea
            id="message"
            name="message"
            placeholder="Share current tools, challenges, or timelines so we tailor the walkthrough."
            rows={4}
            value={formValues.message}
            onChange={handleChange}
            className={`w-full border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-200 ${
              fieldErrors.message 
                ? 'border-red-500 focus:border-red-500' 
                : 'border-gray-300 focus:border-primary-500'
            }`}
            required
          />
          {fieldErrors.message && (
            <p className="text-xs text-red-600 mt-1">{fieldErrors.message}</p>
          )}
        </div>

        {error && (
          <div className="border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700 rounded">
            {error}
          </div>
        )}
        {status === 'success' && (
          <div className="border border-green-200 bg-green-50 px-4 py-2 text-sm text-green-700 rounded">
            Thank you! Our team will reach out shortly to confirm your demo.
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitDisabled || isSendingOtp}
          className="w-full inline-flex items-center justify-center gap-2 bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-700 disabled:bg-primary-300 disabled:cursor-not-allowed transition-colors rounded"
        >
          {isSendingOtp ? (
            <>
              <FaSpinner className="animate-spin" />
              <span>Sending OTP...</span>
            </>
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
  )
}

const BookDemo = () => {
  usePageTitle('Book a Demo - Booking App')

  return (
    <div className="min-h-screen bg-gray-50">
      <section className="bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="inline-flex items-center px-3 py-1 text-xs font-semibold uppercase tracking-wide bg-primary-100 text-primary-700 rounded-full mb-4">
                Book a Demo
              </span>
              <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
                Discover Booking App in <span className="text-primary-600">one focused session</span>
              </h1>
              <p className="text-lg text-gray-600 mb-6">
                We’ll show you how modern salons, clinics, and service brands use Booking App to operate smarter, delight customers, and grow faster.
                Walk away with a clear game plan for your business — no pressure, no jargon.
              </p>
              <ul className="space-y-3 mb-8">
                {heroHighlights.map((highlight) => (
                  <li key={highlight} className="flex items-start gap-3">
                    <span className="mt-1 inline-flex h-2.5 w-2.5 rounded-full bg-primary-500"></span>
                    <span className="text-base text-gray-700">{highlight}</span>
                  </li>
                ))}
              </ul>
              <div className="flex flex-wrap gap-3 text-sm text-gray-500">
                <span>Prefer email?</span>
                <Link to="/contact" className="text-primary-600 font-semibold hover:text-primary-700">
                  Talk to our team
                </Link>
              </div>
            </div>

            <BookDemoForm mode="page" />
          </div>
        </div>
      </section>

      <section className="bg-gray-900 text-white py-16 sm:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {summaryPoints.map((point) => {
              const Icon = point.icon
              return (
                <div key={point.title} className="bg-white/5 border border-white/10  p-6 flex flex-col h-full">
                  <div className="w-10 h-10 rounded-full bg-primary-500 text-white flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{point.title}</h3>
                  <p className="text-sm text-gray-200 flex-1">{point.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      <section className="bg-white py-16 sm:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">What happens after I book?</h2>
          <p className="text-lg text-gray-600 mb-10">
            We believe in clarity from the first conversation. Here’s how the process works once you submit the form.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-left">
            {[
              {
                step: '01',
                title: 'Discovery call',
                description: 'We connect within one business day to confirm goals, current tools, and stakeholders.'
              },
              {
                step: '02',
                title: 'Custom demo',
                description: 'Our advisor walks you through Booking App tailored to your workflows and data.'
              },
              {
                step: '03',
                title: 'Next steps',
                description: 'Receive a proposal with pricing, onboarding plan, and ROI milestones if you’re ready.'
              }
            ].map((item) => (
              <div key={item.step} className="bg-gray-50 border border-gray-200  p-6 ">
                <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-primary-100 text-primary-700 font-semibold mb-4">
                  {item.step}
                </span>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

export default BookDemo
