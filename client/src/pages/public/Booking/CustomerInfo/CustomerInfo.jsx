import React, { useState, useEffect, useMemo, useCallback } from 'react'
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
  const [business, setBusiness] = useState(null)
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    notes: '',
    specialRequests: '',
  })
  const [errors, setErrors] = useState({})
  const [selectedServices, setSelectedServices] = useState([])
  const [selectedStaff, setSelectedStaff] = useState(null)
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')

  // Update page title
  usePageTitle()

  useEffect(() => {
    // Load business data
    const businessData = sessionStorage.getItem('bookingBusiness')
    if (businessData) {
      try {
        setBusiness(JSON.parse(businessData))
        setLoading(false)
      } catch {
        navigate(`/${businessLink}`)
        return
      }
    } else {
      navigate(`/${businessLink}`)
      return
    }

    // Load customer data
    const saved = sessionStorage.getItem('customerInfo')
    if (saved) {
      try {
        setFormData(prev => ({ ...prev, ...JSON.parse(saved) }))
      } catch {
        // Failed to load - continue with default form
      }
    }

    // Load previous steps data
    const savedServices = sessionStorage.getItem('selectedServices')
    if (savedServices) {
      try {
        const parsed = JSON.parse(savedServices)
        setSelectedServices(Array.isArray(parsed) ? parsed : [])
      } catch {
        setSelectedServices([])
      }
    }

    const savedStaff = sessionStorage.getItem('selectedStaff')
    if (savedStaff) {
      try {
        setSelectedStaff(JSON.parse(savedStaff))
      } catch {
        setSelectedStaff(null)
      }
    }

    const savedDate = sessionStorage.getItem('selectedDate')
    const savedTime = sessionStorage.getItem('selectedTime')
    if (savedDate) setSelectedDate(savedDate)
    if (savedTime) setSelectedTime(savedTime)
  }, [businessLink, navigate])

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
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <FaArrowLeft />
            Back
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Your Information</h1>
          <p className="text-gray-600 mt-2">Please provide your details to complete the booking</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form */}
          <div className="lg:col-span-2">
            <div className="bg-white   border border-gray-200 p-6 space-y-6">

              {/* Required Fields */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Required Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                  {/* Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <FaUser className="inline mr-2" />
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className={`w-full px-4 py-2 border  focus:outline-none focus:ring-2 focus:ring-primary-500 ${errors.name ? 'border-red-500' : 'border-gray-300'
                        }`}
                      placeholder="Full name"
                    />
                    {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <FaEnvelope className="inline mr-2" />
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={`w-full px-4 py-2 border  focus:outline-none focus:ring-2 focus:ring-primary-500 ${errors.email ? 'border-red-500' : 'border-gray-300'
                        }`}
                      placeholder="your.email@example.com"
                    />
                    {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <FaPhoneAlt className="inline mr-2" />
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className={`w-full px-4 py-2 border  focus:outline-none focus:ring-2 focus:ring-primary-500 ${errors.phone ? 'border-red-500' : 'border-gray-300'
                        }`}
                      placeholder="10-digit phone number"
                      maxLength={10}
                    />
                    {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
                  </div>
                </div>
              </div>

              {/* Optional Fields */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Optional Information</h2>
                <div className="space-y-4">

                  {/* DOB and Gender Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Date of Birth */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <FaCalendarAlt className="inline mr-2" />
                        Date of Birth
                      </label>
                      <input
                        type="date"
                        name="dateOfBirth"
                        value={formData.dateOfBirth}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300  focus:outline-none focus:ring-2 focus:ring-primary-500"
                        max={new Date().toISOString().split('T')[0]}
                      />
                    </div>

                    {/* Gender */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                      <select
                        name="gender"
                        value={formData.gender}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300  focus:outline-none focus:ring-2 focus:ring-primary-500"
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">Additional Notes</label>
                    <textarea
                      name="notes"
                      value={formData.notes}
                      onChange={handleChange}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300  focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="Any additional information..."
                    />
                  </div>

                  {/* Special Requests */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Special Requests</label>
                    <textarea
                      name="specialRequests"
                      value={formData.specialRequests}
                      onChange={handleChange}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300  focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="Any special requests or preferences..."
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Summary Sidebar */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6 sticky top-[4.1rem]">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Booking Summary</h2>

              <div className="space-y-4 mb-4 text-sm">
                {/* Business */}
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Business</span>
                  <span className="text-gray-900 font-medium">{business.name}</span>
                </div>

                {/* Services */}
                {selectedServices.length > 0 && (
                  <div className="border-t border-gray-100 pt-3">
                    <p className="text-xs uppercase tracking-wide text-gray-500 mb-2">Services</p>
                    <div className="space-y-2">
                      {serviceDetails.map((service, index) => (
                        <div key={index} className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900">{service.name}</p>
                            {service.optionLabel && (
                              <p className="text-xs text-gray-500">{service.optionLabel}</p>
                            )}
                            {service.durationLabel && (
                              <p className="text-xs text-gray-500">{service.durationLabel}</p>
                            )}
                          </div>
                          {service.priceLabel && (
                            <p className="text-sm font-semibold text-gray-900 ml-2">{service.priceLabel}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Staff */}
                <div className="border-t border-gray-100 pt-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Staff</span>
                    <span className="text-gray-900 font-medium">
                      {selectedStaff?.name || 'Any Available'}
                    </span>
                  </div>
                </div>

                {/* Date & Time */}
                {(selectedDate || selectedTime) && (
                  <div className="border-t border-gray-100 pt-3">
                    <p className="text-xs uppercase tracking-wide text-gray-500 mb-2">Appointment</p>
                    {selectedDate && (
                      <div className="flex items-center justify-between mb-1">
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
                  <div className="border-t border-gray-200 pt-3">
                    <div className="flex items-center justify-between font-semibold text-gray-900">
                      <span>Total</span>
                      <div className="text-right">
                        {totals.durationLabel && <p className="text-sm">{totals.durationLabel}</p>}
                        {totals.priceLabel && <p className="text-lg">{totals.priceLabel}</p>}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-3 mt-6">
                <button
                  onClick={handleBack}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                >
                  <FaArrowLeft />
                  Back
                </button>
                <button
                  onClick={handleContinue}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
                >
                  Continue
                  <FaArrowRight />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CustomerInfo
