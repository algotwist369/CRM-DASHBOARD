import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import {
  FaSpinner,
  FaArrowLeft,
  FaArrowRight,
  FaCalendarAlt,
  FaClock,
  FaCheckCircle,
  FaUser
} from 'react-icons/fa'
import appointmentService from '../../../../services/public/appointmentService'
import { usePageTitle } from '../../../../hooks/usePageTitle'
import { useLeadTracking } from '../../../../hooks/useLeadTracking';

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

const TimeSelection = () => {
  const navigate = useNavigate()
  const { businessLink } = useParams()
  const [business, setBusiness] = useState(null)
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [slots, setSlots] = useState([])
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [selectedServices, setSelectedServices] = useState([])
  const [selectedStaff, setSelectedStaff] = useState(null)
  const [customerInfo, setCustomerInfo] = useState(null)

  // Update page title
  usePageTitle()

  // Track page view
  useLeadTracking(business?._id, !!business);

  useEffect(() => {
    window.scrollTo(0, 0)

    // Load business data
    const businessData = sessionStorage.getItem('bookingBusiness')
    if (businessData) {
      try {
        setBusiness(JSON.parse(businessData))
      } catch {
        navigate(`/${businessLink}`)
        return
      }
    } else {
      navigate(`/${businessLink}`)
      return
    }

    // Load saved date/time
    const savedDate = sessionStorage.getItem('selectedDate')
    const savedTime = sessionStorage.getItem('selectedTime')
    const initialDate = savedDate || new Date().toISOString().split('T')[0]
    setSelectedDate(initialDate)
    if (savedTime) setSelectedTime(savedTime)

    // Load previous steps data
    const savedServices = sessionStorage.getItem('selectedServices')
    const savedStaff = sessionStorage.getItem('selectedStaff')
    const savedCustomer = sessionStorage.getItem('customerInfo')

    if (savedServices) {
      try {
        const parsed = JSON.parse(savedServices)
        setSelectedServices(Array.isArray(parsed) ? parsed : [])
      } catch {
        setSelectedServices([])
      }
    }

    if (savedStaff) {
      try {
        const parsed = JSON.parse(savedStaff)
        setSelectedStaff(parsed)
      } catch {
        setSelectedStaff(null)
      }
    }

    if (savedCustomer) {
      try {
        setCustomerInfo(JSON.parse(savedCustomer))
      } catch {
        setCustomerInfo(null)
      }
    }
  }, [businessLink, navigate])

  const fetchAvailableSlots = useCallback(async (date) => {
    if (!date || !business) return

    try {
      setLoadingSlots(true)
      const selectedStaff = JSON.parse(sessionStorage.getItem('selectedStaff') || 'null')

      const params = {
        date: date
      }

      if (selectedStaff && selectedStaff._id) {
        params.staffId = selectedStaff._id
      }

      const result = await appointmentService.getAvailableSlots(businessLink, params)

      if (result.success && result.data?.success) {
        const responseData = result.data.data
        const slotsData = responseData?.slots || []
        const availableSlotsData = responseData?.availableSlots || []

        // Use slots array if available (has more info), otherwise convert availableSlots
        if (slotsData.length > 0) {
          setSlots(slotsData)
        } else if (availableSlotsData.length > 0) {
          // Convert availableSlots array to slots format
          setSlots(availableSlotsData.map(startTime => ({
            startTime,
            available: true
          })))
        } else {
          setSlots([])
        }
      } else {
        toast.error(result.error || 'Failed to fetch available time slots')
        setSlots([])
      }
    } catch (error) {
      toast.error('Failed to load available slots')
      console.error(error)
      setSlots([])
    } finally {
      setLoadingSlots(false)
    }
  }, [businessLink, business])

  const handleDateChange = useCallback(async (date) => {
    if (!date) return

    setSelectedDate(date)
    setSelectedTime('')
    sessionStorage.setItem('selectedDate', date)
    sessionStorage.removeItem('selectedTime')
    await fetchAvailableSlots(date)
  }, [fetchAvailableSlots])

  // Check if a time slot is too soon (for today's date)
  // Backend requires minAdvanceBookingHours (default 2 hours) advance booking
  const isSlotInPast = useCallback((slotTime, date) => {
    if (!slotTime || !date) return false

    const today = new Date().toISOString().split('T')[0]
    if (date !== today) return false

    const now = new Date()
    const [hours, minutes] = slotTime.split(':')
    const slotDateTime = new Date()
    slotDateTime.setHours(parseInt(hours), parseInt(minutes || 0), 0, 0)

    // Use business setting for min advance booking hours (default 2 hours = 120 minutes)
    const minAdvanceHours = business?.appointmentSettings?.minAdvanceBookingHours || 2
    const minAdvanceMinutes = minAdvanceHours * 60

    // Subtract the minimum advance booking time from slot time
    slotDateTime.setMinutes(slotDateTime.getMinutes() - minAdvanceMinutes)

    return slotDateTime < now
  }, [business?.appointmentSettings?.minAdvanceBookingHours])

  // Get all slots with disabled state (memoized)
  const allSlots = useMemo(() => {
    return slots.map(slot => ({
      ...slot,
      isDisabled: slot.available === false || isSlotInPast(slot.startTime, selectedDate)
    }))
  }, [slots, selectedDate, isSlotInPast])

  const selectTime = useCallback((time) => {
    setSelectedTime(time)
    sessionStorage.setItem('selectedTime', time)
  }, [])

  const handleContinue = useCallback(() => {
    if (!selectedDate) {
      toast.error('Please select a date')
      return
    }
    if (!selectedTime) {
      toast.error('Please select a time slot')
      return
    }

    sessionStorage.setItem('selectedDate', selectedDate)
    sessionStorage.setItem('selectedTime', selectedTime)
    navigate(`/book/${businessLink}/customer`)
  }, [selectedDate, selectedTime, businessLink, navigate])

  const handleBack = useCallback(() => {
    navigate(`/book/${businessLink}/services`)
  }, [businessLink, navigate])

  const minDate = useMemo(() => new Date().toISOString().split('T')[0], [])

  const maxDate = useMemo(() => {
    const maxDays = business?.appointmentSettings?.advanceBookingDays || 30
    const date = new Date()
    date.setDate(date.getDate() + maxDays)
    return date.toISOString().split('T')[0]
  }, [business?.appointmentSettings?.advanceBookingDays])

  const formatTime = useCallback((time) => {
    if (!time) return ''
    const [hours, minutes] = time.split(':')
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const hour12 = hour % 12 || 12
    return `${hour12}:${minutes} ${ampm}`
  }, [])

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

  useEffect(() => {
    if (selectedDate && business) {
      fetchAvailableSlots(selectedDate)
    }
  }, [selectedDate, fetchAvailableSlots, business])

  if (!business) {
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
          <h1 className="text-3xl font-bold text-gray-900">Select Date & Time</h1>
          <p className="text-gray-600 mt-2">Choose your preferred appointment date and time</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Date & Time Selection */}
          <div className="lg:col-span-2 space-y-6">
            {/* Date Picker */}
            <div className="bg-white   border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FaCalendarAlt className="text-primary-600" />
                Select Date
              </h2>
              <input
                type="date"
                value={selectedDate}
                min={minDate}
                max={maxDate}
                onChange={(e) => handleDateChange(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-lg"
              />
            </div>

            {/* Time Slots */}
            {selectedDate && (
              <div className="bg-white   border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <FaClock className="text-primary-600" />
                  Available Time Slots
                </h2>

                {loadingSlots ? (
                  <div className="flex items-center justify-center py-12">
                    <FaSpinner className="animate-spin text-primary-600 text-2xl mr-3" />
                    <span className="text-gray-600">Loading available slots...</span>
                  </div>
                ) : allSlots.length === 0 ? (
                  <div className="text-center py-12 text-gray-600">
                    <FaClock className="mx-auto text-gray-400 text-4xl mb-4" />
                    <p>No time slots for this date</p>
                    <p className="text-sm mt-2">Please select a different date</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {allSlots.map((slot) => {
                      const slotTime = slot.startTime
                      const isSelected = selectedTime === slotTime
                      const isDisabled = slot.isDisabled

                      return (
                        <button
                          key={slotTime}
                          onClick={() => !isDisabled && selectTime(slotTime)}
                          disabled={isDisabled}
                          className={`p-3 rounded-lg border-2 transition-all ${isSelected
                              ? 'border-green-600 bg-green-600 text-white shadow-md font-semibold'
                              : isDisabled
                                ? 'border-gray-300 bg-gray-100 text-gray-400 cursor-not-allowed opacity-60'
                                : 'border-green-300 bg-green-50 text-green-700 hover:border-green-500 hover:bg-green-100 font-medium cursor-pointer'
                            }`}
                          title={isDisabled ? 'This time slot is not available' : ''}
                        >
                          {formatTime(slotTime)}
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            )}
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

                {/* Customer Info */}
                {customerInfo && (
                  <div className="border-t border-gray-100 pt-3">
                    <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">Contact</p>
                    <p className="text-sm font-medium text-gray-900">{customerInfo.name}</p>
                    {customerInfo.phone && <p className="text-xs text-gray-600">{customerInfo.phone}</p>}
                    {customerInfo.email && <p className="text-xs text-gray-500">{customerInfo.email}</p>}
                  </div>
                )}

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

              <button
                onClick={handleContinue}
                disabled={!selectedDate || !selectedTime}
                className="w-full mt-6 flex items-center justify-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
              >
                Continue
                <FaArrowRight />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TimeSelection
