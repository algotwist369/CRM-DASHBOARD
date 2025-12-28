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
    description: 'See exactly how Spa Advisor fits your workflows across scheduling, marketing, and analytics.'
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
        navigate('/spa', {
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
    <div className="bg-white border border-gray-200 p-6 sm:p-7">
      <h2 className="text-xl font-semibold text-gray-900 mb-1">
        Request your live walkthrough
      </h2>
      <p className="text-sm text-gray-600 mb-5">
        {step === 1
          ? "Share a few details and we’ll follow up within one business day."
          : "We’ve sent a 6-digit OTP to verify your phone number."
        }
      </p>

      {/* Progress */}
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
        <div className="space-y-5">

          <div className="text-center">
            <p className="text-sm text-gray-600">Enter OTP sent to</p>
            <p className="font-medium text-gray-900">{formValues.phone}</p>
            <p className="text-xs text-gray-500 mt-1">🔒 Secure verification</p>
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
                className="w-10 h-11 text-center text-lg border border-gray-300 focus:outline-none focus:border-primary-500"
              />
            ))}
          </div>

          <button
            type="button"
            onClick={handleVerifyOtp}
            disabled={isVerifying || otp.join('').length !== 6}
            className="w-full py-2.5 bg-primary-600 text-white text-sm font-medium disabled:opacity-50"
          >
            {isVerifying ? "Verifying..." : "Verify & Submit"}
          </button>

          <button
            type="button"
            onClick={handleResendOTP}
            disabled={countdown > 0}
            className={`block w-full text-xs ${countdown > 0 ? "text-gray-400" : "text-primary-600"
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
            className="block w-full text-xs text-gray-500"
          >
            ← Change phone number
          </button>
        </div>
      )}

      {/* Form Step */}
      {step === 1 && (
        <form className="space-y-4 text-sm" onSubmit={handleSubmit}>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              id="fullName"
              name="fullName"
              type="text"
              placeholder="Full name *"
              value={formValues.fullName}
              onChange={handleChange}
              className={`w-full border px-3 py-2 focus:outline-none ${fieldErrors.fullName ? "border-red-500" : "border-gray-300 focus:border-primary-500"
                }`}
              required
            />

            <input
              id="businessName"
              name="businessName"
              type="text"
              placeholder="Business name *"
              value={formValues.businessName}
              onChange={handleChange}
              className={`w-full border px-3 py-2 focus:outline-none ${fieldErrors.businessName ? "border-red-500" : "border-gray-300 focus:border-primary-500"
                }`}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              id="email"
              name="email"
              type="email"
              placeholder="Work email *"
              value={formValues.email}
              onChange={handleChange}
              className={`w-full border px-3 py-2 focus:outline-none ${fieldErrors.email ? "border-red-500" : "border-gray-300 focus:border-primary-500"
                }`}
              required
            />

            <input
              id="phone"
              name="phone"
              type="tel"
              placeholder="Phone / WhatsApp *"
              value={formValues.phone}
              onChange={handleChange}
              className={`w-full border px-3 py-2 focus:outline-none ${fieldErrors.phone ? "border-red-500" : "border-gray-300 focus:border-primary-500"
                }`}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              id="teamSize"
              name="teamSize"
              type="text"
              placeholder="Team size"
              value={formValues.teamSize}
              onChange={handleChange}
              className={`w-full border px-3 py-2 focus:outline-none ${fieldErrors.teamSize ? "border-red-500" : "border-gray-300 focus:border-primary-500"
                }`}
              required
            />

            <select
              id="objective"
              name="objective"
              value={formValues.objective}
              onChange={handleChange}
              className="w-full border border-gray-300 px-3 py-2 focus:outline-none focus:border-primary-500"
            >
              {objectives.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <textarea
            id="message"
            name="message"
            rows={4}
            placeholder="Anything else we should know?"
            value={formValues.message}
            onChange={handleChange}
            className={`w-full border px-3 py-2 focus:outline-none ${fieldErrors.message ? "border-red-500" : "border-gray-300 focus:border-primary-500"
              }`}
            required
          />

          {error && (
            <div className="text-sm text-red-600">{error}</div>
          )}
          {status === "success" && (
            <div className="text-sm text-green-600">
              Thank you! Our team will reach out shortly.
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitDisabled || isSendingOtp}
            className="w-full py-2.5 bg-primary-600 text-white text-sm font-medium disabled:opacity-50"
          >
            {isSendingOtp ? "Sending OTP..." : "Verify phone & continue"}
          </button>

          <p className="text-xs text-gray-500 text-center">
            🔒 OTP verification keeps your request secure
          </p>
        </form>
      )}
    </div>

  )
}

const BookDemo = () => {
  usePageTitle('Book a Demo - Spa Advisor')

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Hero */}
      <section className="bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">

            <div>
              <span className="text-xs font-medium text-primary-600 mb-3 block">
                Book a demo
              </span>

              <h1 className="text-3xl sm:text-4xl font-semibold text-gray-900 mb-4">
                Discover Spa Advisor in{" "}
                <span className="text-primary-600">one focused session</span>
              </h1>

              <p className="text-base text-gray-600 mb-6">
                See how service businesses use Spa Advisor to manage bookings,
                improve customer experience, and grow—without complexity.
              </p>

              <ul className="space-y-2 mb-6">
                {heroHighlights.map((highlight) => (
                  <li key={highlight} className="flex gap-2 text-sm text-gray-700">
                    <span className="mt-2 h-1.5 w-1.5 rounded-full bg-primary-500" />
                    <span>{highlight}</span>
                  </li>
                ))}
              </ul>

              <div className="text-sm text-gray-500">
                Prefer email?{" "}
                <Link
                  to="/contact"
                  className="text-primary-600 font-medium hover:underline"
                >
                  Talk to our team
                </Link>
              </div>
            </div>

            <BookDemoForm mode="page" />
          </div>
        </div>
      </section>

      {/* Summary */}
      <section className="bg-gray-900 text-white py-14 sm:py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {summaryPoints.map((point) => {
              const Icon = point.icon
              return (
                <div
                  key={point.title}
                  className="border border-white/10 p-5 bg-white/5"
                >
                  <div className="w-9 h-9 mb-3 flex items-center justify-center bg-primary-600 text-white">
                    <Icon className="w-4 h-4" />
                  </div>
                  <h3 className="text-base font-medium mb-1">
                    {point.title}
                  </h3>
                  <p className="text-sm text-gray-300">
                    {point.description}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="bg-white py-14 sm:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-semibold text-gray-900 mb-3">
            What happens after I book?
          </h2>

          <p className="text-base text-gray-600 mb-8">
            A simple, transparent process—no surprises.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 text-left">
            {[
              {
                step: "01",
                title: "Discovery call",
                description:
                  "Quick call to understand goals, current setup, and expectations."
              },
              {
                step: "02",
                title: "Custom demo",
                description:
                  "Live walkthrough tailored to your workflows and business type."
              },
              {
                step: "03",
                title: "Next steps",
                description:
                  "Clear proposal with pricing, onboarding, and timelines."
              }
            ].map((item) => (
              <div
                key={item.step}
                className="border border-gray-200 bg-gray-50 p-5"
              >
                <span className="block text-sm font-medium text-primary-600 mb-2">
                  {item.step}
                </span>
                <h3 className="text-base font-medium text-gray-900 mb-1">
                  {item.title}
                </h3>
                <p className="text-sm text-gray-600">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>

  )
}

export default BookDemo
