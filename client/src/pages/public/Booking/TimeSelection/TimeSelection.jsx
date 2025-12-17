import React, { useState, useEffect, useMemo, useCallback, memo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { useQuery } from '@tanstack/react-query'
import {
  FaSpinner,
  FaArrowLeft,
  FaArrowRight,
  FaCalendarAlt,
  FaClock,
} from 'react-icons/fa'
import LazySection from '../../../../components/common/LazySection/LazySection'
import appointmentService from '../../../../services/public/appointmentService'
import { usePageTitle } from '../../../../hooks/usePageTitle'
import { useLeadTracking } from '../../../../hooks/useLeadTracking';
import './TimeSelection.module.css'

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
  // slots and loadingSlots are now managed by useQuery
  const [selectedServices, setSelectedServices] = useState([])
  const [selectedStaff, setSelectedStaff] = useState(null)
  const [customerInfo, setCustomerInfo] = useState(null)

  // Update page title
  usePageTitle()

  // Track page view
  useLeadTracking(business?._id, !!business);

  // Combine initialization for better performance
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })

    // Load all session data in one batch
    const businessData = sessionStorage.getItem('bookingBusiness')
    const savedDate = sessionStorage.getItem('selectedDate')
    const savedTime = sessionStorage.getItem('selectedTime')
    const savedServices = sessionStorage.getItem('selectedServices')
    const savedStaff = sessionStorage.getItem('selectedStaff')
    const savedCustomer = sessionStorage.getItem('customerInfo')

    // Load business data
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
    const initialDate = savedDate || new Date().toISOString().split('T')[0]
    setSelectedDate(initialDate)
    if (savedTime) setSelectedTime(savedTime)

    // Load previous steps data
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

  const {
    data: slots = [],
    isLoading: loadingSlots,
    isFetching: isFetchingSlots
  } = useQuery({
    queryKey: ['availableSlots', businessLink, selectedDate, selectedStaff?._id],
    queryFn: async () => {
      if (!selectedDate || !business) return []

      const params = { date: selectedDate }
      if (selectedStaff && selectedStaff._id) {
        params.staffId = selectedStaff._id
      }

      const result = await appointmentService.getAvailableSlots(businessLink, params)

      if (result.success && result.data?.success) {
        const responseData = result.data.data
        const slotsData = responseData?.slots || []
        const availableSlotsData = responseData?.availableSlots || []

        if (slotsData.length > 0) {
          return slotsData
        } else if (availableSlotsData.length > 0) {
          return availableSlotsData.map(startTime => ({
            startTime,
            available: true
          }))
        }
        return []
      }
      throw new Error(result.error || 'Failed to fetch slots')
    },
    enabled: !!selectedDate && !!business,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
    placeholderData: (previousData) => previousData // Keep showing previous data while fetching new date
  })

  const handleDateChange = useCallback((date) => {
    if (!date) return
    setSelectedDate(date)
    setSelectedTime('')
    sessionStorage.setItem('selectedDate', date)
    sessionStorage.removeItem('selectedTime')
  }, [])

  // Check if a time slot is too soon (for today's date)
  // Backend requires minAdvanceBookingHours (default 30 minutes = 0.5 hours) advance booking
  const isSlotInPast = useCallback((slotTime, date) => {
    if (!slotTime || !date) return false

    const today = new Date().toISOString().split('T')[0]
    if (date !== today) return false

    const now = new Date()
    const [hours, minutes] = slotTime.split(':')
    const slotDateTime = new Date()
    slotDateTime.setHours(parseInt(hours), parseInt(minutes || 0), 0, 0)

    // Use business setting for min advance booking hours
    // Business setting is in hours, convert to minutes (default 0.5 hours = 30 minutes)
    const minAdvanceHours = business?.appointmentSettings?.minAdvanceBookingHours
    const minAdvanceMinutes = minAdvanceHours 
      ? minAdvanceHours * 60 // Convert hours to minutes (e.g., 0.5 hours = 30 minutes, 2 hours = 120 minutes)
      : 30 // Default 30 minutes (0.5 hours) instead of 2 hours (120 minutes)

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

  // Filter available slots for mobile view (only show available slots)
  const availableSlotsForMobile = useMemo(() => {
    return allSlots.filter(slot => !slot.isDisabled)
  }, [allSlots])

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



  if (!business) {
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
          <h1 className="text-lg font-bold text-gray-900">Select Date & Time</h1>
          <p className="text-gray-600 mt-1 text-xs">Choose your preferred appointment date and time</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Date & Time Selection */}
          <div className="lg:col-span-2 space-y-3">
            {/* Date Picker */}
            <div className="bg-white border p-3 rounded">
              <h2 className="text-sm font-medium text-gray-900 mb-2 flex items-center gap-2">
                <FaCalendarAlt className="text-primary-600 text-xs" />
                <span>Select Date</span>
              </h2>
              <input
                type="date"
                value={selectedDate}
                min={minDate}
                max={maxDate}
                onChange={(e) => handleDateChange(e.target.value)}
                className="w-full px-3 py-2 border rounded focus:outline-none focus:border-primary-500 text-sm"
              />
            </div>

            {/* Time Slots */}
            {selectedDate && (
              <LazySection fallback={
                <div className="bg-white border p-3 rounded">
                  <h2 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
                    <FaClock className="text-primary-600 text-xs" />
                    <span>Available Time Slots</span>
                  </h2>
                  <div className="grid grid-cols-3 gap-2">
                    {[...Array(9)].map((_, index) => (
                      <div
                        key={index}
                        className="h-10 border bg-gray-100 animate-pulse rounded"
                      />
                    ))}
                  </div>
                </div>
              }>
                <div className="bg-white border p-3 rounded">
                  <h2 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
                    <FaClock className="text-primary-600 text-xs" />
                    <span>Available Time Slots</span>
                  </h2>

                  {loadingSlots || isFetchingSlots ? (
                    <>
                      {/* Mobile loading skeleton */}
                      <div className="grid grid-cols-3 gap-2 md:hidden">
                        {[...Array(9)].map((_, index) => (
                          <div
                            key={index}
                            className="h-10 border bg-gray-100 animate-pulse rounded"
                          />
                        ))}
                      </div>
                      {/* Desktop loading skeleton */}
                      <div className="hidden md:grid grid-cols-4 gap-2">
                        {[...Array(12)].map((_, index) => (
                          <div
                            key={index}
                            className="h-10 border bg-gray-100 animate-pulse rounded"
                          />
                        ))}
                      </div>
                    </>
                  ) : allSlots.length === 0 ? (
                    <div className="text-center py-6 text-gray-600">
                      <FaClock className="mx-auto text-gray-400 text-2xl mb-2" />
                      <p className="text-sm font-medium">No time slots available</p>
                      <p className="text-xs mt-1">Try selecting another date</p>
                    </div>
                  ) : (
                    <>
                      {/* Mobile View: Show only available slots */}
                      <div className="grid grid-cols-3 gap-2 md:hidden">
                        {availableSlotsForMobile.length === 0 ? (
                          <div className="col-span-3 text-center py-4 text-gray-600">
                            <FaClock className="mx-auto text-gray-400 text-xl mb-2" />
                            <p className="text-xs font-medium">No available slots</p>
                            <p className="text-xs mt-1">Try selecting another date</p>
                          </div>
                        ) : (
                          availableSlotsForMobile.map((slot) => {
                            const slotTime = slot.startTime
                            const isSelected = selectedTime === slotTime

                            return (
                              <button
                                key={slotTime}
                                onClick={() => selectTime(slotTime)}
                                className={`
                                  py-2 px-1 border rounded text-xs font-medium
                                  ${isSelected
                                      ? 'border-green-600 bg-green-600 text-white'
                                      : 'border-green-200 bg-green-50 text-green-700 hover:border-green-500 hover:bg-green-100'
                                    }
                                `}
                              >
                                {formatTime(slotTime)}
                              </button>
                            )
                          })
                        )}
                      </div>

                      {/* Desktop View: Show all slots (with disabled ones grayed out) */}
                      <div className="hidden md:grid grid-cols-4 gap-2">
                        {allSlots.map((slot) => {
                          const slotTime = slot.startTime
                          const isSelected = selectedTime === slotTime
                          const isDisabled = slot.isDisabled

                          return (
                            <button
                              key={slotTime}
                              onClick={() => !isDisabled && selectTime(slotTime)}
                              disabled={isDisabled}
                              className={`
                                py-2 px-1 border rounded text-xs font-medium
                                ${isSelected
                                    ? 'border-green-600 bg-green-600 text-white'
                                    : isDisabled
                                      ? 'border-gray-100 bg-gray-50 text-gray-300 cursor-not-allowed'
                                      : 'border-green-200 bg-green-50 text-green-700 hover:border-green-500 hover:bg-green-100'
                                  }
                              `}
                              title={isDisabled ? 'Not available' : ''}
                            >
                              {formatTime(slotTime)}
                            </button>
                          )
                        })}
                      </div>
                    </>
                  )}
                </div>
              </LazySection>
            )}
          </div>

          {/* Summary Sidebar */}
          <div className="space-y-3">
            <div className="bg-white border p-3 rounded lg:sticky lg:top-4">
              <h2 className="text-sm font-semibold text-gray-900 mb-3">Booking Summary</h2>

              <div className="space-y-3 mb-3 text-xs">
                {/* Business */}
                <div className="flex items-center justify-between pb-2 border-b">
                  <span className="text-gray-600">Business</span>
                  <span className="text-gray-900 font-medium truncate ml-2">{business.name}</span>
                </div>

                {/* Services */}
                {selectedServices.length > 0 && (
                  <div className="pb-2 border-b">
                    <p className="text-xs font-medium uppercase tracking-wide text-gray-500 mb-1">Services</p>
                    <div className="space-y-1">
                      {serviceDetails.map((service, index) => (
                        <div key={index} className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <p className="text-gray-900 font-medium text-xs">{service.name}</p>
                            {service.optionLabel && (
                              <p className="text-xs text-gray-500 mt-0.5">{service.optionLabel}</p>
                            )}
                            {service.durationLabel && (
                              <p className="text-xs text-gray-500 mt-0.5">{service.durationLabel}</p>
                            )}
                          </div>
                          {service.priceLabel && (
                            <p className="font-semibold text-gray-900 ml-2 text-xs">{service.priceLabel}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Staff */}
                <div className="pb-2 border-b">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Staff</span>
                    <span className="text-gray-900 font-medium truncate ml-2 text-xs">
                      {selectedStaff?.name || 'Any Available'}
                    </span>
                  </div>
                </div>

                {/* Customer Info */}
                {customerInfo && (
                  <div className="pb-2 border-b">
                    <p className="text-xs font-medium uppercase tracking-wide text-gray-500 mb-1">Contact</p>
                    <p className="font-medium text-gray-900 text-xs">{customerInfo.name}</p>
                    {customerInfo.phone && <p className="text-gray-600 mt-0.5 text-xs">{customerInfo.phone}</p>}
                  </div>
                )}

                {/* Date & Time */}
                {(selectedDate || selectedTime) && (
                  <div className="pb-2 border-b">
                    <p className="text-xs font-medium uppercase tracking-wide text-gray-500 mb-1">Appointment</p>
                    {selectedDate && (
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-gray-600">Date</span>
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
                        <span className="text-gray-600">Time</span>
                        <span className="text-gray-900 font-medium text-xs">{formatTime(selectedTime)}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Totals */}
                {(totals.durationLabel || totals.priceLabel) && (
                  <div className="pt-1">
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

              <button
                onClick={handleContinue}
                disabled={!selectedDate || !selectedTime}
                className="hidden md:flex w-full mt-3 items-center justify-center gap-2 px-4 py-2 bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed text-xs"
              >
                Continue
                <FaArrowRight className="text-xs" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Fixed Bottom Button for Mobile */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-50">
        <button
          onClick={handleContinue}
          disabled={!selectedDate || !selectedTime}
          className="w-full flex items-center justify-center gap-2 px-6 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all duration-200 font-semibold text-base shadow-lg active:scale-[0.98]"
        >
          Continue
          <FaArrowRight />
        </button>
      </div>
    </div>
  )
}

export default TimeSelection
