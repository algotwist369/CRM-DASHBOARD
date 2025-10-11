import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Card, Button, Badge, Alert } from '../../../../components'
import appointmentService from '../../../../services/appointment/appointmentService'
import { toast } from 'react-hot-toast'

const TimeSelection = () => {
  const navigate = useNavigate()
  const { businessLink } = useParams()
  const [loading, setLoading] = useState(true)
  const [availableSlots, setAvailableSlots] = useState({})
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [selectedService, setSelectedService] = useState(null)
  const [selectedStaff, setSelectedStaff] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    // Get selected service and staff from session storage
    const service = sessionStorage.getItem('selectedService')
    const staff = sessionStorage.getItem('selectedStaff')
    
    if (service && businessLink) {
      setSelectedService(JSON.parse(service))
    }
    if (staff) {
      setSelectedStaff(JSON.parse(staff))
    }
    
    // Set default date to tomorrow
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    setSelectedDate(tomorrow.toISOString().split('T')[0])
    
    fetchAvailableSlots()
  }, [])

  const fetchAvailableSlots = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const result = await appointmentService.getAvailableSlots(businessLink)
      
      if (result.success) {
        setAvailableSlots(result.data)
        toast.success('Available time slots loaded!')
      } else {
        setError(result.error || 'Failed to load available time slots')
        toast.error(result.error || 'Failed to load available time slots')
      }
    } catch (error) {
      console.error('Error fetching available slots:', error)
      setError('An unexpected error occurred')
      toast.error('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }
      
          }
        }
        
      }
      
    } catch (error) {
      console.error('Error fetching available slots:', error)
      setError('Failed to load available time slots')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatTime = (timeString) => {
    const [hours, minutes] = timeString.split(':')
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour % 12 || 12
    return `${displayHour}:${minutes} ${ampm}`
  }

  const handleDateSelect = (date) => {
    setSelectedDate(date)
    setSelectedTime('')
  }

  const handleTimeSelect = (time) => {
    setSelectedTime(time)
  }

  const handleContinue = () => {
    if (selectedDate && selectedTime) {
      // Store selected date and time in session storage
      sessionStorage.setItem('selectedDateTime', JSON.stringify({
        date: selectedDate,
        time: selectedTime
      }))
      navigate('/booking/customer-info')
    }
  }

  const handleBack = () => {
    navigate('/booking/staff-selection')
  }

  const getAvailableDates = () => {
    return Object.keys(availableSlots).sort()
  }

  const getAvailableTimes = (date) => {
    return availableSlots[date] || []
  }

  const isDateAvailable = (date) => {
    const slots = availableSlots[date]
    return slots && slots.some(slot => slot.available)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading available time slots...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Alert
            type="error"
            title="Error"
            message={error}
          />
          <Button variant="primary" className="mt-4" onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Select Date & Time</h1>
          <p className="text-lg text-gray-600">Choose your preferred appointment time</p>
        </div>

        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-center">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">1</span>
              </div>
              <div className="w-16 h-1 bg-primary-600"></div>
              <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">2</span>
              </div>
              <div className="w-16 h-1 bg-primary-600"></div>
              <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">3</span>
              </div>
              <div className="w-16 h-1 bg-primary-600"></div>
              <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">4</span>
              </div>
              <div className="w-16 h-1 bg-gray-300"></div>
              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                <span className="text-gray-500 text-sm font-medium">5</span>
              </div>
            </div>
          </div>
          <div className="flex justify-center mt-2">
            <span className="text-sm text-gray-500">Time Selection</span>
          </div>
        </div>

        {/* Selected Service & Staff Info */}
        <div className="mb-8">
          <Card>
            <div className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div>
                    <h3 className="font-medium text-gray-900">Service</h3>
                    <p className="text-sm text-gray-600">{selectedService?.name}</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Stylist</h3>
                    <p className="text-sm text-gray-600">{selectedStaff?.name}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-gray-900">
                    {selectedService && selectedStaff ? 
                      `$${(selectedService.price * selectedStaff.priceModifier).toFixed(2)}` : 
                      'Price TBD'
                    }
                  </p>
                  <p className="text-sm text-gray-500">{selectedService?.duration} minutes</p>
                </div>
              </div>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Date Selection */}
          <Card>
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Select Date</h2>
              <div className="space-y-2">
                {getAvailableDates().map((date) => (
                  <button
                    key={date}
                    onClick={() => handleDateSelect(date)}
                    className={`w-full p-3 text-left rounded-lg border transition-colors ${
                      selectedDate === date
                        ? 'border-primary-500 bg-primary-50 text-primary-900'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{formatDate(date)}</p>
                        <p className="text-sm text-gray-500">
                          {getAvailableTimes(date).filter(slot => slot.available).length} slots available
                        </p>
                      </div>
                      {selectedDate === date && (
                        <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </Card>

          {/* Time Selection */}
          <Card>
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Select Time {selectedDate && `- ${formatDate(selectedDate)}`}
              </h2>
              {selectedDate ? (
                <div className="grid grid-cols-3 gap-2">
                  {getAvailableTimes(selectedDate).map((slot) => (
                    <button
                      key={slot.time}
                      onClick={() => slot.available && handleTimeSelect(slot.time)}
                      disabled={!slot.available}
                      className={`p-2 text-sm rounded-lg border transition-colors ${
                        selectedTime === slot.time
                          ? 'border-primary-500 bg-primary-50 text-primary-900'
                          : slot.available
                          ? 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                          : 'border-gray-100 bg-gray-50 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      {formatTime(slot.time)}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-gray-500">Please select a date first</p>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8">
          <Button variant="outline" onClick={handleBack}>
            ← Back
          </Button>
          <Button
            variant="primary"
            onClick={handleContinue}
            disabled={!selectedDate || !selectedTime}
          >
            Continue to Customer Info →
          </Button>
        </div>

        {/* Selected Time Summary */}
        {selectedDate && selectedTime && (
          <div className="mt-8">
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Selected Appointment Time</h3>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">{formatDate(selectedDate)}</h4>
                    <p className="text-sm text-gray-600">at {formatTime(selectedTime)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Duration</p>
                    <p className="font-medium text-gray-900">{selectedService?.duration} minutes</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}

export default TimeSelection
