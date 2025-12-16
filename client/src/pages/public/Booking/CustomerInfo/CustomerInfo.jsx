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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="text-center">
          <FaSpinner className="animate-spin mx-auto text-primary-600 text-4xl mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-1.5 sm:py-8 px-1.5 sm:px-6 lg:px-8 pb-14 lg:pb-8 mx-2 md:mx-0">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-4 sm:mb-6">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-3 sm:mb-4 transition-colors text-sm sm:text-base font-medium"
          >
            <FaArrowLeft className="text-sm sm:text-base" />
            <span>Back</span>
          </button>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Finalize Your Booking</h1>
          <p className="text-gray-600 mt-1 sm:mt-2 text-base">Almost done! Enter your details to secure your spot.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-2 sm:gap-6">
          {/* Form */}
          <div className="lg:col-span-2">
            <div className="bg-white border border-gray-200 p-1.5 sm:p-6 space-y-2 sm:space-y-6">

              {/* Required Fields */}
              <div>
                <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="w-1 h-6 bg-primary-600 rounded-sm"></span>
                  <span>Contact Details</span>
                </h2>
                <div className="space-y-4">

                  {/* Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Full Name
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaUser className="text-gray-400 text-lg" />
                      </div>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        autoComplete="name"
                        className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all text-base shadow-sm ${errors.name ? 'border-red-500 bg-red-50' : 'border-gray-300'
                          }`}
                        placeholder="e.g. John Doe"
                      />
                    </div>
                    {errors.name && <p className="mt-1 text-sm text-red-600 fade-in">{errors.name}</p>}
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Email Address
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaEnvelope className="text-gray-400 text-lg" />
                      </div>
                      <input
                        type="email"
                        inputMode="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        autoComplete="email"
                        className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all text-base shadow-sm ${errors.email ? 'border-red-500 bg-red-50' : 'border-gray-300'
                          }`}
                        placeholder="john@example.com"
                      />
                    </div>
                    {errors.email && <p className="mt-1 text-sm text-red-600 fade-in">{errors.email}</p>}
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Mobile Number
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaPhoneAlt className="text-gray-400" />
                      </div>
                      <input
                        type="tel"
                        inputMode="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        autoComplete="tel"
                        className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all text-base shadow-sm ${errors.phone ? 'border-red-500 bg-red-50' : 'border-gray-300'
                          }`}
                        placeholder="10-digit number"
                        maxLength={10}
                      />
                    </div>
                    {errors.phone && <p className="mt-1 text-sm text-red-600 fade-in">{errors.phone}</p>}
                  </div>
                </div>
              </div>

              {/* Optional Fields */}
              <div className="pt-2">
                <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="w-1 h-6 bg-gray-300 rounded-sm"></span>
                  <span>Personalize Your Visit</span>
                </h2>
                <div className="space-y-4">

                  {/* DOB and Gender Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Date of Birth */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Date of Birth (optional)
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <FaCalendarAlt className="text-gray-400" />
                        </div>
                        <input
                          type="date"
                          name="dateOfBirth"
                          value={formData.dateOfBirth}
                          onChange={handleChange}
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all text-base shadow-sm"
                          max={new Date().toISOString().split('T')[0]}
                        />
                      </div>
                    </div>

                    {/* Gender */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Gender</label>
                      <select
                        name="gender"
                        value={formData.gender}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all bg-white text-base shadow-sm"
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
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Anything else we should know?</label>
                    <textarea
                      name="notes"
                      value={formData.notes}
                      onChange={handleChange}
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all text-base shadow-sm"
                      placeholder="Any additional information..."
                    />
                  </div>

                  {/* Special Requests */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Special Preferences</label>
                    <textarea
                      name="specialRequests"
                      value={formData.specialRequests}
                      onChange={handleChange}
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all text-base shadow-sm"
                      placeholder="Any special requests or preferences..."
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Summary Sidebar */}
          <div className="space-y-4">
            <div className="bg-white border border-gray-200 p-4 sm:p-6 rounded-lg shadow-sm lg:sticky lg:top-6">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Booking Summary</h2>

              <div className="space-y-4 mb-4 text-sm">
                {/* Business */}
                <div className="flex items-center justify-between">
                  <span className="text-gray-900 font-medium truncate">{business.name}</span>
                </div>

                {/* Services */}
                {selectedServices.length > 0 && (
                  <div className="border-t border-gray-100 pt-3 mt-3">
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">Services</p>
                    <div className="space-y-3">
                      {serviceDetails.map((service, index) => (
                        <div key={index} className="flex items-start justify-between">
                          <div className="flex-1 min-w-0 pr-3">
                            <p className="text-gray-900 font-medium">{service.name}</p>
                            {service.optionLabel && (
                              <p className="text-xs text-gray-500 mt-0.5">{service.optionLabel}</p>
                            )}
                            {service.durationLabel && (
                              <p className="text-xs text-gray-500 mt-0.5">{service.durationLabel}</p>
                            )}
                          </div>
                          {service.priceLabel && (
                            <p className="font-semibold text-gray-900 ml-3 whitespace-nowrap">{service.priceLabel}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Staff */}
                <div className="border-t border-gray-100 pt-2 sm:pt-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Staff</span>
                    <span className="text-gray-900 font-medium truncate ml-2">
                      {selectedStaff?.name || 'Any Available'}
                    </span>
                  </div>
                </div>

                {/* Date & Time */}
                {(selectedDate || selectedTime) && (
                  <div className="border-t border-gray-100 pt-3 mt-3">
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">Appointment</p>
                    {selectedDate && (
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-gray-600">Date</span>
                        <span className="text-gray-900 font-medium">
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
                        <span className="text-gray-600">Time</span>
                        <span className="text-gray-900 font-medium">{formatTime(selectedTime)}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Totals */}
                {(totals.durationLabel || totals.priceLabel) && (
                  <div className="border-t border-gray-200 pt-3 mt-3">
                    <div className="flex items-center justify-between font-bold text-gray-900 text-lg">
                      <span>Total</span>
                      <div className="text-right">
                        {totals.durationLabel && <p className="text-sm font-normal text-gray-500 mb-0.5">{totals.durationLabel}</p>}
                        {totals.priceLabel && <p>{totals.priceLabel}</p>}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Buttons - Hidden on mobile */}
              <div className="hidden md:flex flex-col gap-3 mt-4 sm:mt-6">
                <button
                  onClick={handleContinue}
                  className="w-full flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-primary-600 text-white hover:bg-primary-700 transition-all duration-200 font-medium hover:shadow-md text-sm sm:text-base"
                >
                  Continue to Review
                  <FaArrowRight className="text-xs sm:text-base" />
                </button>
                <div className="flex items-center justify-center gap-2 text-gray-500 text-xs sm:text-sm mt-1">
                  <svg className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-50">
        <button
          onClick={handleContinue}
          className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-all duration-200 font-semibold text-base shadow-lg active:scale-[0.98]"
        >
          Review & Confirm
          <FaArrowRight />
        </button>
      </div>
    </div>
  )
}

export default CustomerInfo
