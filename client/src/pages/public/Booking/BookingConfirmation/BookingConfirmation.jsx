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
  FaMoneyBillWave,
  FaUserTie // Added for Staff
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
  const ONLINE_PAYMENT_DISCOUNT = 10 
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

    const missingSteps = []
    if (!businessData) missingSteps.push('Business information')
    if (selectedServices.length === 0) missingSteps.push('Service selection')
    if (!selectedDate) missingSteps.push('Date selection')
    if (!selectedTime) missingSteps.push('Time selection')
    if (!customerInfo || !customerInfo.name) missingSteps.push('Customer information')

    if (missingSteps.length > 0) {
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

  // --- Helpers ---

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

  // --- Actions ---

  const handleConfirmBooking = async () => {
    if (!bookingData || !business) return

    try {
      setSubmitting(true)

      // Service Type Logic
      const getServiceType = (service, businessType) => {
        if (service.serviceType) return service.serviceType
        
        const serviceName = (typeof service === 'object' 
          ? (service.name || service.serviceName || service.title || '') 
          : service).toLowerCase()
        
        if (serviceName.match(/hair|cut|color|highlight/)) return 'hair'
        if (serviceName.match(/facial|skin/)) return 'facial'
        if (serviceName.match(/massage/)) return 'massage'
        if (serviceName.match(/nail|manicure|pedicure/)) return 'nail'
        if (serviceName.match(/spa/)) return 'spa'
        if (serviceName.match(/room/)) return 'room'
        if (serviceName.match(/food|meal/)) return 'food'
        
        if (businessType) {
          const bt = businessType.toLowerCase()
          if (bt.includes('salon') || bt.includes('hair')) return 'hair'
          if (bt.includes('spa')) return 'spa'
          if (bt.includes('hotel') || bt.includes('room')) return 'room'
          if (bt.includes('restaurant') || bt.includes('food')) return 'food'
        }
        return 'other'
      }

      // Prepare payload
      const servicesArray = bookingData.services.map(service => {
        const isObj = typeof service === 'object'
        return {
          serviceId: isObj ? (service._id || service.id) : undefined,
          serviceName: isObj ? (service.name || service.serviceName || service.title) : service,
          serviceType: getServiceType(service, business?.type),
          price: isObj ? (service.price || service.cost || 0) : 0,
          duration: isObj ? (service.duration || service.time || 60) : 60
        }
      })

      // Calculate End Time
      let timeStr = bookingData.time.trim()
      let isPM = /PM|pm/.test(timeStr)
      timeStr = timeStr.replace(/AM|PM|am|pm/gi, '').trim()
      
      const [hourStr, minuteStr] = timeStr.split(':')
      let hours = parseInt(hourStr, 10) || 0
      const minutes = parseInt(minuteStr, 10) || 0
      
      if (isPM && hours !== 12) hours += 12
      else if (!isPM && hours === 12) hours = 0
      
      const totalMinutes = calculateTotalDuration()
      const endMinutes = (hours * 60 + minutes) + totalMinutes
      const finalHour = Math.floor(endMinutes / 60) % 24
      const finalMinute = endMinutes % 60
      const endTime = `${String(finalHour).padStart(2, '0')}:${String(finalMinute).padStart(2, '0')}`

      const bookingPayload = {
        customerInfo: {
          name: bookingData.customer.name,
          email: bookingData.customer.email,
          phone: bookingData.customer.phone,
          address: bookingData.customer.address,
          preferences: { notes: bookingData.customer.notes }
        },
        appointmentDate: bookingData.date,
        startTime: bookingData.time,
        endTime: endTime,
        services: servicesArray,
        staffId: bookingData.staff?._id || bookingData.staff?.id || null,
        customerNotes: bookingData.customer.notes || '',
        paymentMethod: paymentMethod
      }

      const result = await appointmentService.bookAppointment(businessLink, bookingPayload)

      if (result.success && result.data?.success) {
        const appointmentData = result.data.data?.appointment
        const confirmationCode = result.data.data?.confirmationCode || appointmentData?.confirmationCode

        setAppointment({ ...appointmentData, confirmationCode })
        
        // Clear session
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
      toast.success('Code copied!')
    }
  }

  const handleViewAppointment = () => {
    if (appointment?.confirmationCode) {
      navigate(`/appointment/${appointment.confirmationCode}`)
    }
  }

  const handlePrint = () => window.print()

  // --- Render Helpers ---

  // Reusable UI Component
  const Card = ({ children, className = "" }) => (
    <div className={`bg-white  border border-gray-100  p-6 ${className}`}>
      {children}
    </div>
  );

  const SectionHeader = ({ title }) => (
    <h2 className="text-sm uppercase tracking-wide text-gray-500 font-semibold mb-4">{title}</h2>
  );

  // Loading State
  if (!business || !bookingData) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
        <FaSpinner className="animate-spin text-primary-600 text-4xl mb-4" />
        <p className="text-gray-600 font-medium animate-pulse">Preparing your booking...</p>
      </div>
    )
  }

  const basePrice = calculateTotalPrice()
  const discount = calculateDiscount()
  const finalPrice = calculateDiscountedPrice()
  const totalDuration = calculateTotalDuration()

  return (
    <div className="min-h-screen bg-gray-50/50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-6xl mx-auto">
        {!appointment ? (
          <>
            {/* Page Header */}
            <div className="mb-8 max-w-5xl mx-auto">
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Review & Confirm</h1>
              <p className="text-gray-500 mt-2 text-lg">Please check your details before finalizing.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-5xl mx-auto">
              
              {/* LEFT COLUMN: Details */}
              <div className="lg:col-span-7 space-y-6">
                
                {/* 1. Date & Time */}
                <Card>
                  <SectionHeader title="Appointment Time" />
                  <div className="flex flex-col sm:flex-row gap-6">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="p-3 bg-primary-50  text-primary-600">
                        <FaCalendarAlt size={20} />
                      </div>
                      <div>
                        <p className="text-gray-900 font-semibold text-lg">
                          {new Date(bookingData.date).toLocaleDateString('en-US', {
                            weekday: 'long', month: 'short', day: 'numeric'
                          })}
                        </p>
                        <p className="text-gray-500 text-sm">{new Date(bookingData.date).getFullYear()}</p>
                      </div>
                    </div>
                    <div className="w-px bg-gray-100 hidden sm:block"></div>
                    <div className="flex items-start gap-4 flex-1">
                      <div className="p-3 bg-primary-50  text-primary-600">
                        <FaClock size={20} />
                      </div>
                      <div>
                        <p className="text-gray-900 font-semibold text-lg">{formatTime(bookingData.time)}</p>
                        <p className="text-gray-500 text-sm">{totalDuration} Minutes</p>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* 2. Staff Member (NEW SECTION) */}
                {bookingData.staff && (
                  <Card>
                    <SectionHeader title="Selected Professional" />
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-primary-50 border border-primary-100 flex items-center justify-center text-primary-600">
                            <FaUserTie size={20} />
                        </div>
                        <div>
                            <p className="text-gray-900 font-semibold text-lg leading-tight">
                                {bookingData.staff.name}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs font-medium uppercase tracking-wide text-primary-700 bg-primary-50 px-2 py-0.5 rounded-full">
                                    {bookingData.staff.role || 'Staff'}
                                </span>
                                {bookingData.staff.specialization && (
                                    <span className="text-sm text-gray-500">
                                        • {bookingData.staff.specialization}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                  </Card>
                )}

                {/* 3. Services */}
                <Card>
                  <SectionHeader title="Selected Services" />
                  <div className="divide-y divide-gray-50">
                    {bookingData.services.map((service, index) => (
                      <div key={index} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                        <span className="text-gray-900 font-medium">{getServiceName(service)}</span>
                        {getServicePrice(service) > 0 && (
                          <span className="text-gray-600">₹{getServicePrice(service).toLocaleString()}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </Card>

                {/* 4. Customer Info */}
                <Card>
                  <SectionHeader title="Your Details" />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-6">
                    <div className="flex items-center gap-3">
                      <FaUser className="text-gray-400" />
                      <span className="text-gray-900 font-medium">{bookingData.customer.name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <FaPhone className="text-gray-400" />
                      <span className="text-gray-900">{bookingData.customer.phone}</span>
                    </div>
                    <div className="flex items-center gap-3 md:col-span-2">
                      <FaEnvelope className="text-gray-400" />
                      <span className="text-gray-900">{bookingData.customer.email}</span>
                    </div>
                  </div>
                </Card>
              </div>

              {/* RIGHT COLUMN: Payment & Actions */}
              <div className="lg:col-span-5 space-y-6">
                <Card className="sticky top-6 border-primary-100 ring-4 ring-gray-50/50">
                  <h2 className="text-xl font-bold text-gray-900 mb-6">Payment Summary</h2>
                  
                  {/* Price Breakdown */}
                  <div className="space-y-3 mb-6 bg-gray-50  p-4">
                    <div className="flex justify-between text-gray-600">
                      <span>Subtotal</span>
                      <span>₹{basePrice.toLocaleString()}</span>
                    </div>
                    
                    {isOnlinePayment && (
                      <div className="flex justify-between text-green-600 font-medium">
                        <span className="flex items-center gap-2">
                          Discount <span className="text-[10px] bg-green-100 px-1.5 py-0.5  font-bold uppercase">{ONLINE_PAYMENT_DISCOUNT}% OFF</span>
                        </span>
                        <span>-₹{discount.toLocaleString()}</span>
                      </div>
                    )}

                    <div className="pt-3 mt-1 border-t border-gray-200 flex justify-between items-end">
                      <span className="text-gray-900 font-semibold">Total to Pay</span>
                      <span className="text-2xl font-bold text-gray-900">
                        ₹{isOnlinePayment ? finalPrice.toLocaleString() : basePrice.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Payment Methods */}
                  <div className="mb-6">
                    <label className="block text-xs font-bold uppercase text-gray-500 mb-3 tracking-wide">Select Payment Method</label>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { value: 'cash', label: 'Cash', icon: FaMoneyBillWave, isOnline: false },
                        { value: 'upi', label: 'UPI', icon: FaMobileAlt, isOnline: true },
                        { value: 'card', label: 'Card', icon: FaCreditCard, isOnline: true },
                        { value: 'wallet', label: 'Wallet', icon: FaWallet, isOnline: true },
                        { value: 'netbanking', label: 'Net Bank', icon: FaCreditCard, isOnline: true },
                        { value: 'online', label: 'Other', icon: FaMobileAlt, isOnline: true }
                      ].map((method) => {
                        const Icon = method.icon
                        const isSelected = paymentMethod === method.value
                        return (
                          <button
                            key={method.value}
                            type="button"
                            onClick={() => setPaymentMethod(method.value)}
                            className={`
                              relative flex flex-col items-center justify-center gap-2 p-3  border transition-all duration-200 h-20
                              ${isSelected 
                                ? 'border-primary-600 bg-primary-50 text-primary-700 ring-1 ring-primary-600' 
                                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-600'
                              }
                            `}
                          >
                            <Icon className={isSelected ? 'text-primary-600' : 'text-gray-400'} size={20} />
                            <span className="text-xs font-semibold">{method.label}</span>
                            {method.isOnline && (
                               <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                            )}
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* Discount Nudge */}
                  {!isOnlinePayment && paymentMethod === 'cash' && (
                    <div className="bg-blue-50 border border-blue-100  p-3 mb-6 flex gap-3 items-start">
                      <div className="bg-blue-100 p-1.5 rounded-full text-blue-600 shrink-0 mt-0.5">
                        <FaDollarSign size={12} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-blue-900">Save ₹{discount.toLocaleString()}</p>
                        <p className="text-xs text-blue-700 mt-0.5">Pay online now to save {ONLINE_PAYMENT_DISCOUNT}% on your booking.</p>
                      </div>
                    </div>
                  )}

                  {/* Submit Button */}
                  <button
                    onClick={handleConfirmBooking}
                    disabled={submitting}
                    className="w-full py-4 bg-gray-900 text-white  hover:bg-black disabled:opacity-70 disabled:cursor-not-allowed transition-all font-semibold text-lg  hover: flex items-center justify-center gap-3 transform active:scale-[0.99]"
                  >
                    {submitting ? (
                      <><FaSpinner className="animate-spin" /> Processing...</>
                    ) : (
                      <>Confirm Booking <FaArrowRight size={16} /></>
                    )}
                  </button>
                  <p className="text-center text-xs text-gray-400 mt-4">
                    Payment collected at venue or via online link.
                  </p>
                </Card>
              </div>
            </div>
          </>
        ) : (
          /* --- SUCCESS STATE --- */
          <div className="max-w-xl mx-auto pt-10">
            <div className="bg-white   overflow-hidden border border-gray-100">
              {/* Success Header */}
              <div className="bg-green-50 p-10 text-center border-b border-green-100">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 ">
                  <FaCheckCircle className="text-green-600 text-4xl" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Booking Confirmed!</h1>
                <p className="text-gray-600">Your appointment is successfully scheduled.</p>
              </div>

              {/* Details Body */}
              <div className="p-8 space-y-6">
                
                {/* Code Box */}
                <div className="border-2 border-dashed border-gray-200  p-4 flex flex-col items-center bg-gray-50/50">
                  <span className="text-xs uppercase tracking-wider text-gray-500 font-semibold mb-2">Confirmation Code</span>
                  <div className="flex items-center gap-3">
                    <span className="text-3xl font-mono font-bold text-gray-900 tracking-wider">
                      {appointment.confirmationCode}
                    </span>
                    <button 
                      onClick={handleCopyConfirmationCode}
                      className="text-gray-400 hover:text-primary-600 transition-colors p-2 hover:bg-white "
                      title="Copy Code"
                    >
                      <FaCopy size={18} />
                    </button>
                  </div>
                </div>

                {/* Quick Info */}
                <div className="space-y-4 text-sm">
                  <div className="flex justify-between items-center py-3 border-b border-gray-100">
                    <span className="text-gray-500">Date</span>
                    <span className="text-gray-900 font-medium text-right">
                      {new Date(appointment.appointmentDate).toLocaleDateString('en-US', {
                        weekday: 'short', month: 'long', day: 'numeric', year: 'numeric'
                      })}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-gray-100">
                    <span className="text-gray-500">Time</span>
                    <span className="text-gray-900 font-medium">{formatTime(appointment.startTime)}</span>
                  </div>
                  
                  {/* Staff in Success View */}
                  {bookingData.staff && (
                      <div className="flex justify-between items-center py-3 border-b border-gray-100">
                        <span className="text-gray-500">Professional</span>
                        <span className="text-gray-900 font-medium">{bookingData.staff.name}</span>
                      </div>
                  )}

                  {appointment.business && (
                    <div className="flex justify-between items-center py-3 border-b border-gray-100">
                      <span className="text-gray-500">Venue</span>
                      <span className="text-gray-900 font-medium">{appointment.business.name}</span>
                    </div>
                  )}
                </div>

                {/* Success Actions */}
                <div className="grid grid-cols-2 gap-4 pt-4">
                  <button
                    onClick={handlePrint}
                    className="flex items-center justify-center gap-2 px-4 py-3 border border-gray-200 text-gray-700  hover:bg-gray-50 font-medium transition-colors"
                  >
                    <FaPrint /> Print
                  </button>
                  <button
                    onClick={handleViewAppointment}
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-primary-600 text-white  hover:bg-primary-700 font-medium transition-colors"
                  >
                    Details <FaArrowRight size={12} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default BookingConfirmation