import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import {
  FaSpinner,
  FaArrowLeft,
  FaArrowRight,
  FaCheckCircle,
  FaCalendarAlt,
  FaClock
} from 'react-icons/fa'
import appointmentService from '../../../../services/public/appointmentService'
import { usePageTitle } from '../../../../hooks/usePageTitle'

const TimeSelection = () => {
  const navigate = useNavigate()
  const { businessLink } = useParams()
  const [business, setBusiness] = useState(null)
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [availableSlots, setAvailableSlots] = useState([])
  const [loading, setLoading] = useState(false)
  const [loadingSlots, setLoadingSlots] = useState(false)

  // Update page title
  usePageTitle()

  useEffect(() => {
    window.scrollTo(0, 0)
    loadBusinessData()
    loadSelectedTime()
    const today = new Date().toISOString().split('T')[0]
    setSelectedDate(today)
  }, [businessLink])

  const loadBusinessData = () => {
    const businessData = sessionStorage.getItem('bookingBusiness')
    if (businessData) {
      try {
        const parsed = JSON.parse(businessData)
        setBusiness(parsed)
      } catch (error) {
        navigate(`/${businessLink}`)
      }
    } else {
      navigate(`/${businessLink}`)
    }
  }

  const loadSelectedTime = () => {
    const savedDate = sessionStorage.getItem('selectedDate')
    const savedTime = sessionStorage.getItem('selectedTime')
    if (savedDate) setSelectedDate(savedDate)
    if (savedTime) setSelectedTime(savedTime)
  }

  const handleDateChange = async (date) => {
    if (!date) return

    setSelectedDate(date)
    setSelectedTime('')
    sessionStorage.setItem('selectedDate', date)
    sessionStorage.removeItem('selectedTime')

    await fetchAvailableSlots(date)
  }

  const fetchAvailableSlots = async (date) => {
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
        const slots = result.data.data?.availableSlots || []
        setAvailableSlots(slots)
      } else {
        toast.error(result.error || 'Failed to fetch available time slots')
        setAvailableSlots([])
      }
    } catch (error) {
      toast.error('Failed to load available slots')
      console.error(error)
      setAvailableSlots([])
    } finally {
      setLoadingSlots(false)
    }
  }

  const selectTime = (time) => {
    setSelectedTime(time)
    sessionStorage.setItem('selectedTime', time)
  }

  const handleContinue = () => {
    if (!selectedDate) {
      toast.error('Please select a date')
      return
    }
    if (!selectedTime) {
      toast.error('Please select a time slot')
      return
    }

    // Ensure data is saved before navigation
    sessionStorage.setItem('selectedDate', selectedDate)
    sessionStorage.setItem('selectedTime', selectedTime)

    navigate(`/book/${businessLink}/customer`) // Go to customer info page
  }

  const handleBack = () => {
    navigate(`/book/${businessLink}/staff`) // Go back to staff selection page
  }

  const getMinDate = () => {
    const today = new Date()
    return today.toISOString().split('T')[0]
  }

  const getMaxDate = () => {
    const maxDays = business?.appointmentSettings?.advanceBookingDays || 30
    const today = new Date()
    today.setDate(today.getDate() + maxDays)
    return today.toISOString().split('T')[0]
  }

  const formatTime = (time) => {
    if (!time) return ''
    // Convert 24-hour format to 12-hour format
    const [hours, minutes] = time.split(':')
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const hour12 = hour % 12 || 12
    return `${hour12}:${minutes} ${ampm}`
  }

  useEffect(() => {
    if (selectedDate) {
      fetchAvailableSlots(selectedDate)
    }
  }, [selectedDate])

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
                min={getMinDate()}
                max={getMaxDate()}
                onChange={(e) => handleDateChange(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300  focus:outline-none focus:ring-2 focus:ring-primary-500 text-lg"
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
                ) : availableSlots.length === 0 ? (
                  <div className="text-center py-12 text-gray-600">
                    <FaClock className="mx-auto text-gray-400 text-4xl mb-4" />
                    <p>No available time slots for this date</p>
                    <p className="text-sm mt-2">Please select a different date</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {availableSlots.map((slot, index) => {
                      const slotTime = slot.time || slot.startTime || slot
                      const isSelected = selectedTime === slotTime
                      const isAvailable = slot.available !== false

                      return (
                        <button
                          key={index}
                          onClick={() => isAvailable && selectTime(slotTime)}
                          disabled={!isAvailable}
                          className={`p-3  border-2 transition-all ${isSelected
                            ? 'border-green-200 bg-green-200 text-green-700 shadow-md font-semibold' // Selected State (Solid Green)
                            : isAvailable
                              ? 'border-green-200 bg-green-50 text-green-700 hover:border-green-400 hover:bg-green-100' // Available State (Light Green)
                              : 'border-gray-100 bg-gray-50 text-gray-400 cursor-not-allowed opacity-50' // Unavailable State
                            }`}
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
            <div className="bg-white   border border-gray-200 p-6 sticky top-[4.1rem]">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Booking Summary</h2>

              <div className="space-y-3 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Business</span>
                  <span className="text-gray-900 font-medium">{business.name}</span>
                </div>
                {selectedDate && (
                  <div className="flex items-center justify-between text-sm">
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
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Time</span>
                    <span className="text-gray-900 font-medium">{formatTime(selectedTime)}</span>
                  </div>
                )}
              </div>

              <button
                onClick={handleContinue}
                disabled={!selectedDate || !selectedTime}
                className="w-full mt-6 flex items-center justify-center gap-2 px-6 py-3 bg-primary-600 text-white  hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
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
