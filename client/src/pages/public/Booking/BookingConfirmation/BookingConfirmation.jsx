import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import {
  FaSpinner,
  FaCheckCircle,
  FaArrowRight,
  FaCopy,
  FaCalendarAlt,
  FaClock,
  FaUser,
  FaPhone,
  FaEnvelope,
  FaDollarSign,
  FaPrint
} from 'react-icons/fa'
import appointmentService from '../../../../services/public/appointmentService'

const BookingConfirmation = () => {
  const navigate = useNavigate()
  const { businessLink } = useParams()
  const [business, setBusiness] = useState(null)
  const [bookingData, setBookingData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [appointment, setAppointment] = useState(null)

  useEffect(() => {
    loadBookingData()
  }, [businessLink])

  const loadBookingData = () => {
    const businessData = sessionStorage.getItem('bookingBusiness')
    const selectedServices = JSON.parse(sessionStorage.getItem('selectedServices') || '[]')
    const selectedStaff = JSON.parse(sessionStorage.getItem('selectedStaff') || 'null')
    const selectedDate = sessionStorage.getItem('selectedDate')
    const selectedTime = sessionStorage.getItem('selectedTime')
    const customerInfo = JSON.parse(sessionStorage.getItem('customerInfo') || '{}')

    if (!businessData || selectedServices.length === 0 || !selectedDate || !selectedTime || !customerInfo.name) {
      toast.error('Please complete all booking steps')
      navigate(`/${businessLink}`)
      return
    }

    try {
      const parsedBusiness = JSON.parse(businessData)
      setBusiness(parsedBusiness)
      
      setBookingData({
        services: selectedServices,
        staff: selectedStaff,
        date: selectedDate,
        time: selectedTime,
        customer: customerInfo
      })
    } catch (error) {
      navigate(`/${businessLink}`)
    }
  }

  const formatTime = (time) => {
    if (!time) return ''
    if (time.includes('AM') || time.includes('PM')) return time
    const [hours, minutes] = time.split(':')
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const hour12 = hour % 12 || 12
    return `${hour12}:${minutes} ${ampm}`
  }

  const calculateTotalPrice = () => {
    if (!bookingData?.services) return 0
    return bookingData.services.reduce((total, service) => {
      const price = typeof service === 'object' ? (service.price || service.cost || 0) : 0
      return total + price
    }, 0)
  }

  const calculateTotalDuration = () => {
    if (!bookingData?.services) return 0
    return bookingData.services.reduce((total, service) => {
      const duration = typeof service === 'object' ? (service.duration || service.time || 60) : 60
      return total + duration
    }, 0)
  }

  const getServiceName = (service) => {
    if (typeof service === 'object') {
      return service.name || service.serviceName || service.title || 'Service'
    }
    return service
  }

  const getServicePrice = (service) => {
    if (typeof service === 'object') {
      return service.price || service.cost || 0
    }
    return 0
  }

  const handleConfirmBooking = async () => {
    if (!bookingData || !business) return

    try {
      setSubmitting(true)

      // Helper function to determine serviceType from service name or business type
      const getServiceType = (service, businessType) => {
        if (service.serviceType) {
          return service.serviceType
        }
        
        // Try to infer from service name
        const serviceName = (typeof service === 'object' 
          ? (service.name || service.serviceName || service.title || '') 
          : service).toLowerCase()
        
        if (serviceName.includes('hair') || serviceName.includes('cut') || serviceName.includes('color') || serviceName.includes('highlight')) {
          return 'hair'
        }
        if (serviceName.includes('facial') || serviceName.includes('skin')) {
          return 'facial'
        }
        if (serviceName.includes('massage')) {
          return 'massage'
        }
        if (serviceName.includes('nail') || serviceName.includes('manicure') || serviceName.includes('pedicure')) {
          return 'nail'
        }
        if (serviceName.includes('spa')) {
          return 'spa'
        }
        if (serviceName.includes('room')) {
          return 'room'
        }
        if (serviceName.includes('food') || serviceName.includes('meal')) {
          return 'food'
        }
        
        // Try to infer from business type
        if (businessType) {
          const businessTypeLower = businessType.toLowerCase()
          if (businessTypeLower.includes('salon') || businessTypeLower.includes('hair')) {
            return 'hair'
          }
          if (businessTypeLower.includes('spa')) {
            return 'spa'
          }
          if (businessTypeLower.includes('hotel') || businessTypeLower.includes('room')) {
            return 'room'
          }
          if (businessTypeLower.includes('restaurant') || businessTypeLower.includes('food')) {
            return 'food'
          }
        }
        
        // Default to 'other'
        return 'other'
      }

      // Prepare services array for API
      const servicesArray = bookingData.services.map(service => {
        if (typeof service === 'object') {
          return {
            serviceName: service.name || service.serviceName || service.title || 'Service',
            serviceType: getServiceType(service, business?.type),
            serviceCategory: service.category || service.serviceCategory || undefined,
            price: service.price || service.cost || 0,
            duration: service.duration || service.time || 60
          }
        }
        return { 
          serviceName: service, 
          serviceType: getServiceType(service, business?.type),
          price: 0, 
          duration: 60 
        }
      })

      // Calculate end time
      const [startHour, startMinute] = bookingData.time.split(':')
      const startMinutes = parseInt(startHour) * 60 + parseInt(startMinute)
      const totalMinutes = calculateTotalDuration()
      const endMinutes = startMinutes + totalMinutes
      const endHour = Math.floor(endMinutes / 60)
      const endMinute = endMinutes % 60
      const endTime = `${String(endHour).padStart(2, '0')}:${String(endMinute).padStart(2, '0')}`

      const bookingPayload = {
        customerInfo: {
          name: bookingData.customer.name,
          email: bookingData.customer.email,
          phone: bookingData.customer.phone,
          dateOfBirth: bookingData.customer.dateOfBirth || undefined,
          gender: bookingData.customer.gender || undefined,
          address: bookingData.customer.address || undefined,
          preferences: {
            notes: bookingData.customer.notes || undefined
          }
        },
        appointmentDate: bookingData.date,
        startTime: bookingData.time,
        endTime: endTime,
        services: servicesArray,
        staffId: bookingData.staff?._id || bookingData.staff?.id || null,
        customerNotes: bookingData.customer.notes || '',
        specialRequests: bookingData.customer.specialRequests || ''
      }

      const result = await appointmentService.bookAppointment(businessLink, bookingPayload)

      if (result.success && result.data?.success) {
        const appointmentData = result.data.data?.appointment
        const confirmationCode = result.data.data?.confirmationCode || appointmentData?.confirmationCode

        setAppointment({
          ...appointmentData,
          confirmationCode
        })

        // Clear booking data from session
        sessionStorage.removeItem('selectedServices')
        sessionStorage.removeItem('selectedStaff')
        sessionStorage.removeItem('selectedDate')
        sessionStorage.removeItem('selectedTime')
        sessionStorage.removeItem('customerInfo')

        toast.success('Appointment booked successfully!')
      } else {
        toast.error(result.error || result.data?.message || 'Failed to book appointment')
      }
    } catch (error) {
      toast.error('Failed to book appointment. Please try again.')
      console.error(error)
    } finally {
      setSubmitting(false)
    }
  }

  const handleCopyConfirmationCode = () => {
    if (appointment?.confirmationCode) {
      navigator.clipboard.writeText(appointment.confirmationCode)
      toast.success('Confirmation code copied to clipboard!')
    }
  }

  const handleViewAppointment = () => {
    if (appointment?.confirmationCode) {
      navigate(`/appointment/${appointment.confirmationCode}`)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  if (!business || !bookingData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="text-center">
          <FaSpinner className="animate-spin mx-auto text-primary-600 text-4xl mb-4" />
          <p className="text-gray-600">Loading booking details...</p>
        </div>
      </div>
    )
  }

  const totalPrice = calculateTotalPrice()
  const totalDuration = calculateTotalDuration()

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {!appointment ? (
          <>
            {/* Booking Summary Before Confirmation */}
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900">Confirm Your Booking</h1>
              <p className="text-gray-600 mt-2">Please review your booking details and confirm</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Booking Details */}
              <div className="lg:col-span-2 space-y-6">
                {/* Appointment Details */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Appointment Details</h2>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <FaCalendarAlt className="text-primary-600" />
                      <div>
                        <p className="text-sm text-gray-600">Date</p>
                        <p className="text-gray-900 font-medium">
                          {new Date(bookingData.date).toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <FaClock className="text-primary-600" />
                      <div>
                        <p className="text-sm text-gray-600">Time</p>
                        <p className="text-gray-900 font-medium">{formatTime(bookingData.time)}</p>
                        <p className="text-xs text-gray-500">Duration: {totalDuration} minutes</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Services */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Services</h2>
                  <div className="space-y-2">
                    {bookingData.services.map((service, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-gray-900">{getServiceName(service)}</span>
                        {getServicePrice(service) > 0 && (
                          <span className="text-gray-600 font-medium">₹{getServicePrice(service).toLocaleString()}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Customer Information */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Information</h2>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <FaUser className="text-gray-400" />
                      <span className="text-gray-900">{bookingData.customer.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FaEnvelope className="text-gray-400" />
                      <span className="text-gray-900">{bookingData.customer.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FaPhone className="text-gray-400" />
                      <span className="text-gray-900">{bookingData.customer.phone}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Summary & Confirm */}
              <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Booking Summary</h2>
                  
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Total Price</span>
                      <span className="text-xl font-bold text-green-600">₹{totalPrice.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Duration</span>
                      <span className="text-gray-900">{totalDuration} minutes</span>
                    </div>
                  </div>

                  <button
                    onClick={handleConfirmBooking}
                    disabled={submitting}
                    className="w-full mt-6 flex items-center justify-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                  >
                    {submitting ? (
                      <>
                        <FaSpinner className="animate-spin" />
                        Booking...
                      </>
                    ) : (
                      <>
                        Confirm Booking
                        <FaCheckCircle />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Success Confirmation */}
            <div className="bg-white rounded-xl shadow-sm border-2 border-green-200 p-8 text-center">
              <FaCheckCircle className="mx-auto text-green-600 text-5xl mb-4" />
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Booking Confirmed!</h1>
              <p className="text-gray-600 mb-6">Your appointment has been successfully booked</p>
              
              <div className="bg-gray-50 rounded-lg p-4 mb-6 inline-block">
                <p className="text-sm text-gray-600 mb-1">Confirmation Code</p>
                <div className="flex items-center gap-2">
                  <p className="text-2xl font-mono font-bold text-primary-600">
                    {appointment.confirmationCode}
                  </p>
                  <button
                    onClick={handleCopyConfirmationCode}
                    className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded-lg transition-colors"
                    title="Copy confirmation code"
                  >
                    <FaCopy />
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-center gap-4">
                <button
                  onClick={handleViewAppointment}
                  className="flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
                >
                  View Appointment
                  <FaArrowRight />
                </button>
                <button
                  onClick={handlePrint}
                  className="flex items-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  <FaPrint />
                  Print
                </button>
              </div>
            </div>

            {/* Appointment Details */}
            <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Appointment Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Date & Time</p>
                  <p className="text-gray-900 font-medium">
                    {new Date(appointment.appointmentDate).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric'
                    })} at {formatTime(appointment.startTime)}
                  </p>
                </div>
                {appointment.business && (
                  <div>
                    <p className="text-sm text-gray-600">Business</p>
                    <p className="text-gray-900 font-medium">{appointment.business.name}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <span className="inline-block px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                    {appointment.status || 'Pending'}
                  </span>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default BookingConfirmation
