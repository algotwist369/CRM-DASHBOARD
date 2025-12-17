import React, { useState, useEffect, useMemo, useCallback, memo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import {
  FaSpinner,
  FaArrowLeft,
  FaArrowRight,
  FaUser,
  FaEnvelope,
  FaPhoneAlt,
  FaCalendarAlt,
} from 'react-icons/fa'
import { usePageTitle } from '../../../../hooks/usePageTitle'
import { useLeadTracking } from '../../../../hooks/useLeadTracking'
import './CustomerInfo.module.css'

const currencySymbols = {
  INR: '₹',
  USD: '$',
  EUR: '€',
  GBP: '£',
  AED: 'د.إ'
}

const formatPrice = (value = 0, currency = 'INR') => {
  if (!value && value !== 0) return '--'
  const symbol = currencySymbols[currency] || ''
  const roundedValue = Math.round(Number(value))
  return symbol ? `${symbol}${roundedValue.toLocaleString('en-IN')}` : `${currency} ${roundedValue.toLocaleString('en-IN')}`
}

const formatDuration = (minutes) => {
  if (!minutes) return null
  if (minutes < 60) return `${minutes} min`
  const hrs = Math.floor(minutes / 60)
  const mins = minutes % 60
  if (!mins) return `${hrs} hr${hrs > 1 ? 's' : ''}`
  return `${hrs} hr${hrs > 1 ? 's' : ''} ${mins} min`
}

const formatTime = (time) => {
  if (!time) return ''
  const [hours, minutes] = time.split(':')
  const hour = parseInt(hours)
  const ampm = hour >= 12 ? 'PM' : 'AM'
  const hour12 = hour % 12 || 12
  return `${hour12}:${minutes} ${ampm}`
}

const CustomerInfo = () => {
  const navigate = useNavigate()
  const { businessLink } = useParams()

  // Lazy initialize state from sessionStorage to avoid layout shifts
  const [business, setBusiness] = useState(() => {
    try {
      const stored = sessionStorage.getItem('bookingBusiness')
      return stored ? JSON.parse(stored) : null
    } catch {
      return null
    }
  })

  // Redirect if no business data found
  useEffect(() => {
    if (!business) {
      navigate(`/${businessLink}`)
    }
  }, [business, businessLink, navigate])

  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState(() => {
    try {
      const saved = sessionStorage.getItem('customerInfo')
      return saved ? { ...JSON.parse(saved) } : {
        name: '',
        email: '',
        phone: '',
        dateOfBirth: '',
        gender: '',
        notes: '',
        specialRequests: '',
      }
    } catch {
      return {
        name: '',
        email: '',
        phone: '',
        dateOfBirth: '',
        gender: '',
        notes: '',
        specialRequests: '',
      }
    }
  })

  const [errors, setErrors] = useState({})

  const [selectedServices, setSelectedServices] = useState(() => {
    try {
      const saved = sessionStorage.getItem('selectedServices')
      const parsed = saved ? JSON.parse(saved) : []
      return Array.isArray(parsed) ? parsed : []
    } catch {
      return []
    }
  })

  const [selectedStaff, setSelectedStaff] = useState(() => {
    try {
      const saved = sessionStorage.getItem('selectedStaff')
      return saved ? JSON.parse(saved) : null
    } catch {
      return null
    }
  })

  const [selectedDate, setSelectedDate] = useState(() => {
    return sessionStorage.getItem('selectedDate') || ''
  })

  const [selectedTime, setSelectedTime] = useState(() => {
    return sessionStorage.getItem('selectedTime') || ''
  })

  // Update page title
  usePageTitle()

  // Track page view
  useLeadTracking(business?._id, !!business);

  // Combined initialization for better performance
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [])

  const handleChange = useCallback((e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    setErrors(prev => {
      if (prev[name]) {
        return { ...prev, [name]: '' }
      }
      return prev
    })
  }, [])

  const validate = useCallback(() => {
    const newErrors = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required'
    } else if (!/^[0-9]{10}$/.test(formData.phone.replace(/\D/g, ''))) {
      newErrors.phone = 'Please enter a valid 10-digit phone number'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [formData])

  const handleContinue = useCallback(() => {
    if (!validate()) {
      toast.error('Please fill in all required fields correctly')
      return
    }

    sessionStorage.setItem('customerInfo', JSON.stringify(formData))
    navigate(`/book/${businessLink}/confirmation`)
  }, [formData, businessLink, navigate, validate])

  const handleBack = useCallback(() => {
    navigate(`/book/${businessLink}/time`)
  }, [businessLink, navigate])

  // Calculate totals from selected services
  const totals = useMemo(() => {
    const totalPrice = selectedServices.reduce((sum, service) => sum + (Number(service?.price) || 0), 0)
    const totalDuration = selectedServices.reduce((sum, service) => sum + (Number(service?.duration) || 0), 0)
    const currency = selectedServices[0]?.currency || business?.currency || 'INR'

    return {
      price: totalPrice,
      duration: totalDuration,
      currency,
      priceLabel: selectedServices.length ? formatPrice(totalPrice, currency) : null,
      durationLabel: formatDuration(totalDuration)
    }
  }, [selectedServices, business?.currency])

  // Format service details for display
  const serviceDetails = useMemo(() => {
    return selectedServices.map((service, index) => {
      const serviceName = service?.serviceName || service?.name || `Service ${index + 1}`
      const optionLabel = service?.optionLabel || service?.pricingOptionLabel || null
      const duration = Number(service?.duration) || 0
      const price = service?.price
      const currency = service?.currency || business?.currency || 'INR'

      return {
        name: serviceName,
        optionLabel,
        durationLabel: formatDuration(duration),
        priceLabel: price !== undefined && price !== null ? formatPrice(price, currency) : null
      }
    })
  }, [selectedServices, business?.currency])

  if (loading || !business) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <FaSpinner className="animate-spin mx-auto text-primary-600 text-2xl mb-3" />
          <p className="text-gray-600 text-sm">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-4 px-4 pb-16">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-4">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-2 text-xs"
          >
            <FaArrowLeft className="text-xs" />
            <span>Back</span>
          </button>
          <h1 className="text-lg font-bold text-gray-900">Finalize Your Booking</h1>
          <p className="text-gray-600 mt-1 text-xs">Almost done! Enter your details to secure your spot.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Form */}
          <div className="lg:col-span-2">
            <div className="bg-white border p-3 space-y-4">

              {/* Required Fields */}
              <div>
                <h2 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
                  <span className="w-1 h-4 bg-primary-600"></span>
                  <span>Contact Details</span>
                </h2>
                <div className="space-y-3">

                  {/* Name */}
                  <div>
                    <label className="block text-xs text-gray-700 mb-1">
                      Full Name
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                        <FaUser className="text-gray-400 text-xs" />
                      </div>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        autoComplete="name"
                        className={`w-full pl-8 pr-3 py-2 border rounded focus:outline-none focus:border-primary-500 text-xs ${errors.name ? 'border-red-500 bg-red-50' : ''}`}
                        placeholder="e.g. John Doe"
                      />
                    </div>
                    {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-xs text-gray-700 mb-1">
                      Email Address
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                        <FaEnvelope className="text-gray-400 text-xs" />
                      </div>
                      <input
                        type="email"
                        inputMode="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        autoComplete="email"
                        className={`w-full pl-8 pr-3 py-2 border rounded focus:outline-none focus:border-primary-500 text-xs ${errors.email ? 'border-red-500 bg-red-50' : ''}`}
                        placeholder="john@example.com"
                      />
                    </div>
                    {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-xs text-gray-700 mb-1">
                      Mobile Number
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                        <FaPhoneAlt className="text-gray-400 text-xs" />
                      </div>
                      <input
                        type="tel"
                        inputMode="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        autoComplete="tel"
                        className={`w-full pl-8 pr-3 py-2 border rounded focus:outline-none focus:border-primary-500 text-xs ${errors.phone ? 'border-red-500 bg-red-50' : ''}`}
                        placeholder="10-digit number"
                        maxLength={10}
                      />
                    </div>
                    {errors.phone && <p className="mt-1 text-xs text-red-600">{errors.phone}</p>}
                  </div>
                </div>
              </div>

              {/* Optional Fields */}
              <div className="pt-2">
                <h2 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
                  <span className="w-1 h-4 bg-gray-300"></span>
                  <span>Personalize Your Visit</span>
                </h2>
                <div className="space-y-3">

                  {/* DOB and Gender Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Date of Birth */}
                    <div>
                      <label className="block text-xs text-gray-700 mb-1">
                        Date of Birth (optional)
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                          <FaCalendarAlt className="text-gray-400 text-xs" />
                        </div>
                        <input
                          type="date"
                          name="dateOfBirth"
                          value={formData.dateOfBirth}
                          onChange={handleChange}
                          className="w-full pl-8 pr-3 py-2 border rounded focus:outline-none focus:border-primary-500 text-xs"
                          max={new Date().toISOString().split('T')[0]}
                        />
                      </div>
                    </div>

                    {/* Gender */}
                    <div>
                      <label className="block text-xs text-gray-700 mb-1">Gender</label>
                      <select
                        name="gender"
                        value={formData.gender}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border rounded focus:outline-none focus:border-primary-500 bg-white text-xs"
                      >
                        <option value="">Select gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                        <option value="prefer_not_to_say">Prefer not to say</option>
                      </select>
                    </div>
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="block text-xs text-gray-700 mb-1">Anything else we should know?</label>
                    <textarea
                      name="notes"
                      value={formData.notes}
                      onChange={handleChange}
                      rows={3}
                      className="w-full px-3 py-2 border rounded focus:outline-none focus:border-primary-500 text-xs"
                      placeholder="Any additional information..."
                    />
                  </div>

                  {/* Special Requests */}
                  <div>
                    <label className="block text-xs text-gray-700 mb-1">Special Preferences</label>
                    <textarea
                      name="specialRequests"
                      value={formData.specialRequests}
                      onChange={handleChange}
                      rows={3}
                      className="w-full px-3 py-2 border rounded focus:outline-none focus:border-primary-500 text-xs"
                      placeholder="Any special requests or preferences..."
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Summary Sidebar */}
          <div className="space-y-3">
            <div className="bg-white border p-3 rounded lg:sticky lg:top-4">
              <h2 className="text-sm font-semibold text-gray-900 mb-3">Booking Summary</h2>

              <div className="space-y-3 mb-3 text-xs">
                {/* Business */}
                <div className="flex items-center justify-between">
                  <span className="text-gray-900 font-medium truncate text-xs">{business.name}</span>
                </div>

                {/* Services */}
                {selectedServices.length > 0 && (
                  <div className="border-t pt-2 mt-2">
                    <p className="text-xs font-medium uppercase tracking-wide text-gray-500 mb-1">Services</p>
                    <div className="space-y-2">
                      {serviceDetails.map((service, index) => (
                        <div key={index} className="flex items-start justify-between">
                          <div className="flex-1 min-w-0 pr-2">
                            <p className="text-gray-900 font-medium text-xs">{service.name}</p>
                            {service.optionLabel && (
                              <p className="text-xs text-gray-500 mt-0.5">{service.optionLabel}</p>
                            )}
                            {service.durationLabel && (
                              <p className="text-xs text-gray-500 mt-0.5">{service.durationLabel}</p>
                            )}
                          </div>
                          {service.priceLabel && (
                            <p className="font-semibold text-gray-900 ml-2 whitespace-nowrap text-xs">{service.priceLabel}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Staff */}
                <div className="border-t pt-2">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 text-xs">Staff</span>
                    <span className="text-gray-900 font-medium truncate ml-2 text-xs">
                      {selectedStaff?.name || 'Any Available'}
                    </span>
                  </div>
                </div>

                {/* Date & Time */}
                {(selectedDate || selectedTime) && (
                  <div className="border-t pt-2 mt-2">
                    <p className="text-xs font-medium uppercase tracking-wide text-gray-500 mb-1">Appointment</p>
                    {selectedDate && (
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-gray-600 text-xs">Date</span>
                        <span className="text-gray-900 font-medium text-xs">
                          {new Date(selectedDate).toLocaleDateString('en-US', {
                            weekday: 'short',
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </span>
                      </div>
                    )}
                    {selectedTime && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600 text-xs">Time</span>
                        <span className="text-gray-900 font-medium text-xs">{formatTime(selectedTime)}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Totals */}
                {(totals.durationLabel || totals.priceLabel) && (
                  <div className="border-t pt-2 mt-2">
                    <div className="flex items-center justify-between font-bold text-gray-900 text-sm">
                      <span>Total</span>
                      <div className="text-right">
                        {totals.durationLabel && <p className="text-xs font-normal text-gray-500 mb-0.5">{totals.durationLabel}</p>}
                        {totals.priceLabel && <p className="text-sm">{totals.priceLabel}</p>}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Buttons - Hidden on mobile */}
              <div className="hidden md:flex flex-col gap-2 mt-3">
                <button
                  onClick={handleContinue}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-primary-600 text-white hover:bg-primary-700 text-xs"
                >
                  Continue to Review
                  <FaArrowRight className="text-xs" />
                </button>
                <div className="flex items-center justify-center gap-1 text-gray-500 text-xs mt-1">
                  <svg className="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <span>Your information is safe with us</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Fixed Bottom Button for Mobile */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t p-3 z-50">
        <button
          onClick={handleContinue}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-primary-600 text-white rounded hover:bg-primary-700 text-xs"
        >
          Continue
          <FaArrowRight className="text-xs" />
        </button>
      </div>
    </div>
  )
}

export default CustomerInfo
