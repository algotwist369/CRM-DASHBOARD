import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Card, Button, Alert, Badge } from '../../../../components'
import appointmentService from '../../../../services/appointment/appointmentService'
import { toast } from 'react-hot-toast'

const BookingConfirmation = () => {
  const navigate = useNavigate()
  const { businessLink } = useParams()
  const [loading, setLoading] = useState(false)
  const [bookingData, setBookingData] = useState(null)
  const [confirmationNumber, setConfirmationNumber] = useState('')
  const [error, setError] = useState(null)

  useEffect(() => {
    // Get all booking data from session storage
    const service = sessionStorage.getItem('selectedService')
    const staff = sessionStorage.getItem('selectedStaff')
    const dateTime = sessionStorage.getItem('selectedDateTime')
    const customerInfo = sessionStorage.getItem('customerInfo')
    
    if (service && staff && dateTime && customerInfo && businessLink) {
      setBookingData({
        service: JSON.parse(service),
        staff: JSON.parse(staff),
        dateTime: JSON.parse(dateTime),
        customerInfo: JSON.parse(customerInfo)
      })
    } else {
      // Redirect to booking start if data is missing
      navigate('/booking/business-info')
    }
  }, [navigate])

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

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const generateConfirmationNumber = () => {
    const timestamp = Date.now().toString(36)
    const random = Math.random().toString(36).substr(2, 5)
    return `ELITE-${timestamp}-${random}`.toUpperCase()
  }

  const handleConfirmBooking = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const bookingPayload = {
        serviceId: bookingData.service.id,
        staffId: bookingData.staff.id,
        date: bookingData.dateTime.date,
        time: bookingData.dateTime.time,
        customerInfo: bookingData.customerInfo
      }
      
      const result = await appointmentService.bookAppointment(businessLink, bookingPayload)
      
      if (result.success) {
        const confirmation = result.data.confirmationCode || generateConfirmationNumber()
        setConfirmationNumber(confirmation)
        
        toast.success('Booking confirmed successfully!')
        
        // Clear booking data from session storage
        sessionStorage.removeItem('selectedService')
        sessionStorage.removeItem('selectedStaff')
        sessionStorage.removeItem('selectedDateTime')
        sessionStorage.removeItem('customerInfo')
        
        // Navigate to confirmation page
        navigate(`/appointment-status/${confirmation}`)
      } else {
        setError(result.error || 'Failed to confirm booking')
        toast.error(result.error || 'Failed to confirm booking')
      }
    } catch (error) {
      console.error('Error confirming booking:', error)
      setError('An unexpected error occurred. Please try again.')
      toast.error('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleEditBooking = () => {
    navigate('/booking/service-selection')
  }

  const handleNewBooking = () => {
    navigate('/booking/business-info')
  }

  const handleViewStatus = () => {
    navigate(`/appointment-status/${confirmationNumber}`)
  }

  if (!bookingData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading booking details...</p>
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

  if (confirmationNumber) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Success Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Booking Confirmed!</h1>
            <p className="text-lg text-gray-600">Your appointment has been successfully booked</p>
            <div className="mt-4">
              <Badge variant="success" size="lg">
                Confirmation: {confirmationNumber}
              </Badge>
            </div>
          </div>

          {/* Confirmation Details */}
          <Card className="mb-8">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Appointment Details</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium text-gray-900">Service</h3>
                    <p className="text-gray-600">{bookingData.service.name}</p>
                    <p className="text-sm text-gray-500">{bookingData.service.duration} minutes</p>
                  </div>
                  
                  <div>
                    <h3 className="font-medium text-gray-900">Stylist</h3>
                    <p className="text-gray-600">{bookingData.staff.name}</p>
                    <p className="text-sm text-gray-500">{bookingData.staff.role}</p>
                  </div>
                  
                  <div>
                    <h3 className="font-medium text-gray-900">Date & Time</h3>
                    <p className="text-gray-600">{formatDate(bookingData.dateTime.date)}</p>
                    <p className="text-sm text-gray-500">at {formatTime(bookingData.dateTime.time)}</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium text-gray-900">Customer</h3>
                    <p className="text-gray-600">
                      {bookingData.customerInfo.firstName} {bookingData.customerInfo.lastName}
                    </p>
                    <p className="text-sm text-gray-500">{bookingData.customerInfo.email}</p>
                    <p className="text-sm text-gray-500">{bookingData.customerInfo.phone}</p>
                  </div>
                  
                  <div>
                    <h3 className="font-medium text-gray-900">Total Amount</h3>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatCurrency(bookingData.service.price * bookingData.staff.priceModifier)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Important Information */}
          <Card className="mb-8">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Important Information</h2>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-blue-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="text-sm text-gray-700">
                      <strong>Arrival Time:</strong> Please arrive 10 minutes before your scheduled appointment time.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-blue-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="text-sm text-gray-700">
                      <strong>Cancellation Policy:</strong> Please cancel or reschedule at least 24 hours in advance to avoid cancellation fees.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-blue-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="text-sm text-gray-700">
                      <strong>Payment:</strong> Payment is due at the time of service. We accept cash, credit cards, and digital payments.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-blue-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="text-sm text-gray-700">
                      <strong>Contact:</strong> If you need to make changes, please call us at (555) 123-4567 or email info@elitehair.com.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="primary" onClick={handleViewStatus}>
              View Appointment Status
            </Button>
            <Button variant="outline" onClick={handleNewBooking}>
              Book Another Appointment
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Confirm Your Booking</h1>
          <p className="text-lg text-gray-600">Please review your appointment details before confirming</p>
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
              <div className="w-16 h-1 bg-primary-600"></div>
              <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">5</span>
              </div>
            </div>
          </div>
          <div className="flex justify-center mt-2">
            <span className="text-sm text-gray-500">Confirmation</span>
          </div>
        </div>

        {/* Booking Summary */}
        <Card className="mb-8">
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Booking Summary</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-gray-900">Service</h3>
                  <p className="text-gray-600">{bookingData.service.name}</p>
                  <p className="text-sm text-gray-500">{bookingData.service.duration} minutes</p>
                </div>
                
                <div>
                  <h3 className="font-medium text-gray-900">Stylist</h3>
                  <p className="text-gray-600">{bookingData.staff.name}</p>
                  <p className="text-sm text-gray-500">{bookingData.staff.role}</p>
                </div>
                
                <div>
                  <h3 className="font-medium text-gray-900">Date & Time</h3>
                  <p className="text-gray-600">{formatDate(bookingData.dateTime.date)}</p>
                  <p className="text-sm text-gray-500">at {formatTime(bookingData.dateTime.time)}</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-gray-900">Customer</h3>
                  <p className="text-gray-600">
                    {bookingData.customerInfo.firstName} {bookingData.customerInfo.lastName}
                  </p>
                  <p className="text-sm text-gray-500">{bookingData.customerInfo.email}</p>
                  <p className="text-sm text-gray-500">{bookingData.customerInfo.phone}</p>
                </div>
                
                <div>
                  <h3 className="font-medium text-gray-900">Total Amount</h3>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(bookingData.service.price * bookingData.staff.priceModifier)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Terms and Conditions */}
        <Card className="mb-8">
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Terms and Conditions</h2>
            <div className="space-y-3 text-sm text-gray-600">
              <p>
                By confirming this booking, you agree to our terms and conditions, including our cancellation policy and payment terms.
              </p>
              <p>
                We require 24 hours notice for cancellations or rescheduling. Late cancellations may be subject to a cancellation fee.
              </p>
              <p>
                Payment is due at the time of service. We accept cash, credit cards, and digital payments.
              </p>
              <p>
                Please arrive 10 minutes before your scheduled appointment time to ensure a smooth experience.
              </p>
            </div>
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            variant="primary"
            size="lg"
            onClick={handleConfirmBooking}
            loading={loading}
          >
            Confirm Booking
          </Button>
          <Button variant="outline" size="lg" onClick={handleEditBooking}>
            Edit Booking
          </Button>
        </div>
      </div>
    </div>
  )
}

export default BookingConfirmation
