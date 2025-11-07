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
  FaPrint,
  FaCreditCard,
  FaMobileAlt,
  FaWallet,
  FaMoneyBillWave
} from 'react-icons/fa'
import appointmentService from '../../../../services/public/appointmentService'
import { usePageTitle } from '../../../../hooks/usePageTitle'

const BookingConfirmation = () => {
  const navigate = useNavigate()
  const { businessLink } = useParams()
  const [business, setBusiness] = useState(null)
  const [bookingData, setBookingData] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [appointment, setAppointment] = useState(null)
  const [paymentMethod, setPaymentMethod] = useState('cash')
  
  // Online payment discount configuration
  const ONLINE_PAYMENT_DISCOUNT = 10 // 10% discount
  const onlinePaymentMethods = ['upi', 'card', 'netbanking', 'wallet', 'online']
  const isOnlinePayment = onlinePaymentMethods.includes(paymentMethod)

  // Update page title
  usePageTitle()

  useEffect(() => {
    loadBookingData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [businessLink])

  const loadBookingData = () => {
    const businessData = sessionStorage.getItem('bookingBusiness')
    const selectedServices = JSON.parse(sessionStorage.getItem('selectedServices') || '[]')
    const selectedStaff = JSON.parse(sessionStorage.getItem('selectedStaff') || 'null')
    const selectedDate = sessionStorage.getItem('selectedDate')
    const selectedTime = sessionStorage.getItem('selectedTime')
    const customerInfo = JSON.parse(sessionStorage.getItem('customerInfo') || '{}')

    // Debug: Log what's missing
    const missingSteps = []
    if (!businessData) missingSteps.push('Business information')
    if (selectedServices.length === 0) missingSteps.push('Service selection')
    if (!selectedDate) missingSteps.push('Date selection')
    if (!selectedTime) missingSteps.push('Time selection')
    if (!customerInfo || !customerInfo.name) missingSteps.push('Customer information')

    if (missingSteps.length > 0) {
      console.error('Missing booking steps:', missingSteps)
      console.error('SessionStorage data:', {
        businessData: !!businessData,
        selectedServices: selectedServices.length,
        selectedDate,
        selectedTime,
        customerInfo
      })
      toast.error(`Please complete: ${missingSteps.join(', ')}`)
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
      console.error('Error parsing booking data:', error)
      toast.error('Failed to load booking data')
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
    const basePrice = bookingData.services.reduce((total, service) => {
      const price = typeof service === 'object' ? (service.price || service.cost || 0) : 0
      return total + price
    }, 0)
    return basePrice
  }
  
  const calculateDiscountedPrice = () => {
    const basePrice = calculateTotalPrice()
    if (isOnlinePayment) {
      const discount = (basePrice * ONLINE_PAYMENT_DISCOUNT) / 100
      return basePrice - discount
    }
    return basePrice
  }
  
  const calculateDiscount = () => {
    if (!isOnlinePayment) return 0
    const basePrice = calculateTotalPrice()
    return (basePrice * ONLINE_PAYMENT_DISCOUNT) / 100
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
            serviceId: service._id || service.id || undefined,
            _id: service._id || service.id || undefined,
            id: service._id || service.id || undefined,
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
      // Handle time format (could be "14:30" or "2:30 PM")
      let timeStr = bookingData.time.trim()
      let isPM = false
      
      // Check for AM/PM
      if (timeStr.includes('PM') || timeStr.includes('pm')) {
        isPM = true
        timeStr = timeStr.replace(/PM|pm/gi, '').trim()
      } else if (timeStr.includes('AM') || timeStr.includes('am')) {
        timeStr = timeStr.replace(/AM|am/gi, '').trim()
      }
      
      // Extract hours and minutes
      const [hourStr, minuteStr] = timeStr.split(':')
      let hours = parseInt(hourStr, 10) || 0
      const minutes = parseInt(minuteStr, 10) || 0
      
      // Convert to 24-hour format
      if (isPM && hours !== 12) {
        hours += 12
      } else if (!isPM && hours === 12) {
        hours = 0
      }
      
      // Calculate end time
      const startMinutes = hours * 60 + minutes
      const totalMinutes = calculateTotalDuration()
      const endMinutes = startMinutes + totalMinutes
      const endHour = Math.floor(endMinutes / 60)
      const endMinute = endMinutes % 60
      
      // Handle hours that go past 24 (next day)
      const finalHour = endHour % 24
      const endTime = `${String(finalHour).padStart(2, '0')}:${String(endMinute).padStart(2, '0')}`

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
        specialRequests: bookingData.customer.specialRequests || '',
        paymentMethod: paymentMethod
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

  const basePrice = calculateTotalPrice()
  const discount = calculateDiscount()
  const finalPrice = calculateDiscountedPrice()
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
                    {isOnlinePayment && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-3">
                        <div className="flex items-center gap-2">
                          <FaDollarSign className="text-green-600 text-sm" />
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-gray-900">
                              {ONLINE_PAYMENT_DISCOUNT}% Discount Applied
                            </p>
                            <p className="text-xs text-gray-600 mt-0.5">
                              You save ₹{discount.toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                    {!isOnlinePayment && paymentMethod === 'cash' && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
                        <div className="flex items-start gap-2">
                          <FaDollarSign className="text-blue-600 text-sm mt-0.5" />
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-gray-900 mb-2">
                              Save {ONLINE_PAYMENT_DISCOUNT}% with Online Payment
                            </p>
                            <div className="bg-white rounded p-2 border border-gray-200">
                              <div className="flex items-center justify-between text-xs mb-1">
                                <span className="text-gray-600">Cash Payment:</span>
                                <span className="font-medium text-gray-900">₹{basePrice.toLocaleString()}</span>
                              </div>
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-gray-600">Online Payment:</span>
                                <span className="font-semibold text-green-600">₹{finalPrice.toLocaleString()}</span>
                              </div>
                              <div className="flex items-center justify-between text-xs mt-1 pt-1 border-t border-gray-100">
                                <span className="text-gray-700">You Save:</span>
                                <span className="font-semibold text-green-600">₹{discount.toLocaleString()}</span>
                              </div>
                            </div>
                            <p className="text-xs text-gray-600 mt-2">
                              Select UPI, Card, Wallet, Net Banking, or Online to avail discount
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Base Price</span>
                      <span className={`text-base font-medium ${isOnlinePayment ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                        ₹{basePrice.toLocaleString()}
                      </span>
                    </div>
                    {isOnlinePayment && (
                      <>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-green-600 font-medium">Discount ({ONLINE_PAYMENT_DISCOUNT}%)</span>
                          <span className="text-green-600 font-semibold">-₹{discount.toLocaleString()}</span>
                        </div>
                        <div className="border-t border-gray-200 pt-2 mt-2">
                          <div className="flex items-center justify-between">
                            <span className="text-gray-700 font-semibold">Final Price</span>
                            <span className="text-xl font-bold text-green-600">₹{finalPrice.toLocaleString()}</span>
                          </div>
                        </div>
                      </>
                    )}
                    {!isOnlinePayment && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-700 font-semibold">Total Price</span>
                        <span className="text-xl font-bold text-green-600">₹{basePrice.toLocaleString()}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Duration</span>
                      <span className="text-gray-900">{totalDuration} minutes</span>
                    </div>
                  </div>

                  {/* Payment Method Selection */}
                  <div className="border-t border-gray-200 pt-4 mb-4">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">Payment Method</h3>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { value: 'cash', label: 'Cash', icon: FaMoneyBillWave, isOnline: false },
                        { value: 'upi', label: 'UPI', icon: FaMobileAlt, isOnline: true, badge: `${ONLINE_PAYMENT_DISCOUNT}% OFF` },
                        { value: 'card', label: 'Card', icon: FaCreditCard, isOnline: true, badge: `${ONLINE_PAYMENT_DISCOUNT}% OFF` },
                        { value: 'wallet', label: 'Wallet', icon: FaWallet, isOnline: true, badge: `${ONLINE_PAYMENT_DISCOUNT}% OFF` },
                        { value: 'netbanking', label: 'Net Banking', icon: FaCreditCard, isOnline: true, badge: `${ONLINE_PAYMENT_DISCOUNT}% OFF` },
                        { value: 'online', label: 'Online', icon: FaMobileAlt, isOnline: true, badge: `${ONLINE_PAYMENT_DISCOUNT}% OFF` }
                      ].map((method) => {
                        const Icon = method.icon
                        const isSelected = paymentMethod === method.value
                        const isOnlineMethod = method.isOnline
                        return (
                          <button
                            key={method.value}
                            type="button"
                            onClick={() => setPaymentMethod(method.value)}
                            className={`relative flex items-center gap-2 p-2.5 rounded-lg border-2 transition-all text-sm ${
                              isSelected
                                ? isOnlineMethod
                                  ? 'border-green-500 bg-green-50 text-green-700 font-semibold'
                                  : 'border-primary-600 bg-primary-50 text-primary-700 font-semibold'
                                : 'border-gray-200 hover:border-primary-300 hover:bg-gray-50 text-gray-700'
                            }`}
                          >
                            <Icon className={`${isSelected ? (isOnlineMethod ? 'text-green-600' : 'text-primary-600') : 'text-gray-500'}`} />
                            <span className="flex-1 text-left">{method.label}</span>
                            {method.badge && (
                              <span className="absolute -top-1.5 -right-1.5 bg-green-600 text-white text-[9px] font-semibold px-1.5 py-0.5 rounded-full">
                                {method.badge}
                              </span>
                            )}
                          </button>
                        )
                      })}
                    </div>
                    {isOnlinePayment && (
                      <div className="mt-3 p-2.5 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-xs text-gray-700">
                          Discount of ₹{discount.toLocaleString()} applied to your booking
                        </p>
                      </div>
                    )}
                    {!isOnlinePayment && paymentMethod === 'cash' && (
                      <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-xs font-medium text-gray-900 mb-2">
                          Online Payment Discount Available
                        </p>
                        <div className="bg-white rounded p-2 border border-gray-200 mb-2">
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="text-gray-600">Cash:</span>
                            <span className="font-medium text-gray-900">₹{basePrice.toLocaleString()}</span>
                          </div>
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-gray-600">Online:</span>
                            <span className="font-semibold text-green-600">₹{finalPrice.toLocaleString()}</span>
                          </div>
                        </div>
                        <p className="text-xs text-gray-600">
                          Get {ONLINE_PAYMENT_DISCOUNT}% off with UPI, Card, Wallet, Net Banking, or Online payment
                        </p>
                      </div>
                    )}
                    <p className="text-xs text-gray-500 mt-2">
                      Payment will be collected at the time of service
                    </p>
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
