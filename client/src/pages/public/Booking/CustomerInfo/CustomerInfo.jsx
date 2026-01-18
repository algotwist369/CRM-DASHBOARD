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
  FaChevronDown,
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
  const [isSummaryOpen, setIsSummaryOpen] = useState(false)

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

    if (formData.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
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
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-4 px-4 pb-20">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-gray-600 hover:text-primary-600 mb-3 text-sm font-medium transition-colors"
          >
            <FaArrowLeft className="text-sm" />
            <span>Back</span>
          </button>
          <h1 className="md:flex hidden text-2xl md:text-3xl font-bold text-gray-900 mb-2">Your Details</h1>
          <p className="md:flex hidden text-gray-600 text-sm md:text-base">Almost done! Enter your information to complete the booking.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          {/* Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6 space-y-6">

              {/* Required Fields */}
              <div>
                <h2 className="text-base md:text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="w-1 h-5 bg-primary-600 rounded-full"></span>
                  <span>Contact Information</span>
                </h2>
                <div className="space-y-4">

                  {/* Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaUser className="text-gray-400 text-sm" />
                      </div>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        autoComplete="name"
                        className={`w-full pl-10 pr-3 py-2.5 md:py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm transition-all ${errors.name ? 'border-red-500 bg-red-50 focus:ring-red-500' : 'border-gray-300'}`}
                        placeholder="e.g. John Doe"
                      />
                    </div>
                    {errors.name && <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1"><span>⚠️</span>{errors.name}</p>}
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Email Address <span className="text-gray-400 text-xs">(optional)</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaEnvelope className="text-gray-400 text-sm" />
                      </div>
                      <input
                        type="email"
                        inputMode="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        autoComplete="email"
                        className={`w-full pl-10 pr-3 py-2.5 md:py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm transition-all ${errors.email ? 'border-red-500 bg-red-50 focus:ring-red-500' : 'border-gray-300'}`}
                        placeholder="john@example.com"
                      />
                    </div>
                    {errors.email && <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1"><span>⚠️</span>{errors.email}</p>}
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Mobile Number <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaPhoneAlt className="text-gray-400 text-sm" />
                      </div>
                      <input
                        type="tel"
                        inputMode="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        autoComplete="tel"
                        className={`w-full pl-10 pr-3 py-2.5 md:py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm transition-all ${errors.phone ? 'border-red-500 bg-red-50 focus:ring-red-500' : 'border-gray-300'}`}
                        placeholder="10-digit number"
                        maxLength={10}
                      />
                    </div>
                    {errors.phone && <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1"><span>⚠️</span>{errors.phone}</p>}
                  </div>
                </div>
              </div>

              {/* Optional Fields */}
              <div className="border-gray-200">
                <h2 className="text-base md:text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  {/* <span className="w-1 h-5 bg-gray-400 rounded-full"></span> */}
                  {/* <span>Additional Details</span> */}
                  {/* <span className="text-xs font-normal text-gray-500">(optional)</span> */}
                </h2>
                <div className="space-y-4">

                  {/* DOB and Gender Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Date of Birth */}
                    <div className='hidden'>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Date of Birth
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <FaCalendarAlt className="text-gray-400 text-sm" />
                        </div>
                        <input
                          type="date"
                          name="dateOfBirth"
                          value={formData.dateOfBirth}
                          onChange={handleChange}
                          className="w-full pl-10 pr-3 py-2.5 md:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm transition-all"
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
                        className="w-full px-3 py-2.5 md:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white text-sm transition-all"
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
                  <div className='hidden'>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Special Notes</label>
                    <textarea
                      name="notes"
                      value={formData.notes}
                      onChange={handleChange}
                      rows={3}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm resize-none transition-all"
                      placeholder="Any health conditions, allergies, or preferences we should know about..."
                    />
                  </div>

                  {/* Special Requests */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Special Requests (optional) </label>
                    <textarea
                      name="specialRequests"
                      value={formData.specialRequests}
                      onChange={handleChange}
                      rows={3}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm resize-none transition-all"
                      placeholder="Any specific requests or accommodations you'd like..."
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Summary Sidebar */}
          <div className="space-y-4">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden lg:sticky lg:top-4">
              {/* Header - Clickable on mobile, static on desktop */}
              <button
                onClick={() => setIsSummaryOpen(!isSummaryOpen)}
                className="w-full md:cursor-default p-4 md:p-5 flex items-center justify-between md:pointer-events-none"
              >
                <h2 className="text-base md:text-lg font-semibold text-gray-900">Booking Summary</h2>
                <FaChevronDown
                  className={`md:hidden text-gray-600 transition-transform duration-300 ${isSummaryOpen ? 'rotate-180' : ''}`}
                />
              </button>

              {/* Collapsible Content - Smooth transition on mobile, always visible on desktop */}
              <div
                className={`md:block transition-all duration-300 ease-in-out ${isSummaryOpen
                    ? 'max-h-[2000px] opacity-100'
                    : 'max-h-0 opacity-0 md:max-h-none md:opacity-100'
                  }`}
              >
                <div className="px-4 pb-4 md:px-5 md:pb-5 md:pt-0 border-t md:border-t-0 border-gray-200">
                  <div className="space-y-3 text-sm pt-4 md:pt-0">
                    {/* Business */}
                    <div className="bg-primary-50 rounded-lg p-3">
                      <p className="text-xs font-medium uppercase tracking-wide text-primary-600 mb-1">Business</p>
                      <p className="text-sm font-semibold text-gray-900">{business.name}</p>
                    </div>

                    {/* Services */}
                    {selectedServices.length > 0 && (
                      <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-gray-500 mb-2">Services</p>
                        <div className="space-y-2">
                          {serviceDetails.map((service, index) => (
                            <div key={index} className="flex items-start justify-between p-2.5 bg-gray-50 rounded-lg">
                              <div className="flex-1 min-w-0 pr-2">
                                <p className="text-gray-900 font-medium text-sm">{service.name}</p>
                                {service.optionLabel && (
                                  <p className="text-xs text-gray-500 mt-0.5">{service.optionLabel}</p>
                                )}
                                {service.durationLabel && (
                                  <p className="text-xs text-primary-600 mt-1 font-medium">{service.durationLabel}</p>
                                )}
                              </div>
                              {service.priceLabel && (
                                <p className="font-semibold text-gray-900 ml-2 whitespace-nowrap text-sm">{service.priceLabel}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Staff */}
                    <div className="flex items-center justify-between py-2 border-t border-gray-200">
                      <span className="text-gray-600 text-sm">Professional</span>
                      <span className="text-gray-900 font-medium text-sm">
                        {selectedStaff?.name || 'Any Available'}
                      </span>
                    </div>

                    {/* Date & Time */}
                    {(selectedDate || selectedTime) && (
                      <div className="pt-3 border-t border-gray-200">
                        <p className="text-xs font-medium uppercase tracking-wide text-gray-500 mb-2">Appointment</p>
                        <div className="space-y-2">
                          {selectedDate && (
                            <div className="flex items-center justify-between">
                              <span className="text-gray-600 text-sm">Date</span>
                              <span className="text-gray-900 font-medium text-sm">
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
                              <span className="text-gray-600 text-sm">Time</span>
                              <span className="text-gray-900 font-medium text-sm">{formatTime(selectedTime)}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Totals */}
                    {(totals.durationLabel || totals.priceLabel) && (
                      <div className="pt-3 mt-3 border-t-2 border-gray-300">
                        <div className="flex items-center justify-between">
                          <span className="text-base font-semibold text-gray-900">Total</span>
                          <div className="text-right">
                            {totals.durationLabel && <p className="text-xs text-gray-500 mb-1">{totals.durationLabel}</p>}
                            {totals.priceLabel && <p className="text-lg font-bold text-primary-600">{totals.priceLabel}</p>}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Desktop Button */}
                  <div className="hidden md:block mt-5 pt-4 border-t border-gray-200">
                    <button
                      onClick={handleContinue}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors shadow-sm hover:shadow-md text-sm font-medium"
                    >
                      Continue to Review
                      <FaArrowRight className="text-sm" />
                    </button>
                    <div className="flex items-center justify-center gap-1.5 text-gray-500 text-xs mt-3">
                      <svg className="w-3.5 h-3.5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      <span>Your information is secure</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Fixed Bottom Button for Mobile */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg p-4 z-50">
        <button
          onClick={handleContinue}
          className="w-full flex items-center justify-center gap-2 px-4 py-3.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 active:bg-primary-800 transition-all shadow-md text-sm font-semibold"
        >
          Continue to Review
          <FaArrowRight className="text-sm" />
        </button>
      </div>
    </div>
  )
}

export default CustomerInfo
