import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import {
    FaSpinner,
    FaCheckCircle,
    FaArrowRight,
    FaArrowLeft,
    FaExclamationTriangle,
    FaCopy,
    FaCalendarAlt,
    FaClock,
    FaUser,
    FaPhoneAlt,
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
import { useLeadTracking } from '../../../../hooks/useLeadTracking';

const BookingConfirmation = () => {
    const navigate = useNavigate()
    const { businessLink } = useParams()
    const [business, setBusiness] = useState(null)
    const [bookingData, setBookingData] = useState(null)
    const [submitting, setSubmitting] = useState(false)
    const [appointment, setAppointment] = useState(null)
    const [paymentMethod, setPaymentMethod] = useState('cash')
    const [showOTPModal, setShowOTPModal] = useState(false)
    const [otp, setOtp] = useState(['', '', '', ''])
    const [verifyingOTP, setVerifyingOTP] = useState(false)
    const [phoneForOTP, setPhoneForOTP] = useState('')
    const [otpTimeLeft, setOtpTimeLeft] = useState(0)
    const [canResend, setCanResend] = useState(false)
    const [lastBookingPayload, setLastBookingPayload] = useState(null)
    const [resendingOTP, setResendingOTP] = useState(false)
    const [showExitConfirmation, setShowExitConfirmation] = useState(false)

    // Online payment discount configuration
    const ONLINE_PAYMENT_DISCOUNT = 10
    const onlinePaymentMethods = ['upi', 'card', 'netbanking', 'wallet', 'online']
    const isOnlinePayment = onlinePaymentMethods.includes(paymentMethod)

    // Update page title
    usePageTitle()

    // Track page view
    useLeadTracking(business?._id, !!business);

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'instant' })
        loadBookingData()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [businessLink])

    useEffect(() => {
        let timer
        if (showOTPModal && otpTimeLeft > 0) {
            timer = setInterval(() => {
                setOtpTimeLeft((prev) => prev - 1)
            }, 1000)
        } else if (otpTimeLeft === 0) {
            setCanResend(true)
        }
        return () => clearInterval(timer)
    }, [showOTPModal, otpTimeLeft])

    // --- Mobile/Browser Back Button Interception ---
    useEffect(() => {
        // 1. Push a "dummy" state to create a history buffer
        // This ensures the first "Back" click is trapped
        window.history.pushState(null, document.title, window.location.href);

        const handlePopState = (event) => {
            // 2. When user presses Back, browser pops the state we pushed.
            // We are still on the same pageURL, effectively.
            // We intercept this action to show the retention modal.

            // Prevent default isn't strictly needed for popstate but good practice mentally
            // event.preventDefault() 

            setShowExitConfirmation(true)

            // 3. Re-push the state to "reset" the trap in case they dismiss the modal
            // or if they are just trying to leave again.
            // This is crucial: if we don't re-push, the next back click would actually leave.
            window.history.pushState(null, document.title, window.location.href);
        };

        window.addEventListener('popstate', handlePopState);

        return () => {
            window.removeEventListener('popstate', handlePopState);
        };
    }, []);

    const formatTimer = (seconds) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins}:${secs.toString().padStart(2, '0')}`
    }

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

            if (result.success) {
                if (result.data.requiresOTP) {
                    setPhoneForOTP(result.data.phone)
                    setLastBookingPayload(bookingPayload)

                    if (result.data.expiresAt) {
                        const expiresAt = new Date(result.data.expiresAt).getTime()
                        const now = new Date().getTime()
                        const diffSeconds = Math.max(0, Math.floor((expiresAt - now) / 1000))
                        setOtpTimeLeft(diffSeconds)
                        setCanResend(false)
                    } else {
                        // Fallback default
                        setOtpTimeLeft(600) // 10 mins
                        setCanResend(false)
                    }

                    setShowOTPModal(true)
                    toast.success("OTP sent to your mobile number")
                } else {
                    // Direct booking (fallback/legacy)
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
                }
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

    const handleVerifyOTP = async () => {
        const otpString = otp.join('')
        if (otpString.length !== 4) return toast.error("Please enter valid 4-digit OTP")

        setVerifyingOTP(true)
        try {
            const result = await appointmentService.verifyBookAppointment(businessLink, {
                phone: phoneForOTP,
                otp: otpString
            })

            if (result.success && result.data.success) {
                const appointmentData = result.data.data?.appointment
                const confirmationCode = result.data.data?.confirmationCode || appointmentData?.confirmationCode

                setAppointment({ ...appointmentData, confirmationCode })
                setShowOTPModal(false)

                // Clear session
                sessionStorage.removeItem('selectedServices')
                sessionStorage.removeItem('selectedStaff')
                sessionStorage.removeItem('selectedDate')
                sessionStorage.removeItem('selectedTime')
                sessionStorage.removeItem('customerInfo')

                toast.success('Appointment confirmed!')
            } else {
                toast.error(result.error || result.data?.message || "Invalid OTP")
            }
        } catch (err) {
            console.error(err)
            toast.error("Verification failed")
        } finally {
            setVerifyingOTP(false)
        }
    }



    const handleResendOTP = async () => {
        if (!lastBookingPayload) return

        setResendingOTP(true)
        try {
            const result = await appointmentService.bookAppointment(businessLink, lastBookingPayload)

            if (result.success && result.data.requiresOTP) {
                toast.success("OTP Resent!")
                setOtp(['', '', '', ''])

                if (result.data.expiresAt) {
                    const expiresAt = new Date(result.data.expiresAt).getTime()
                    const now = new Date().getTime()
                    const diffSeconds = Math.max(0, Math.floor((expiresAt - now) / 1000))
                    setOtpTimeLeft(diffSeconds)
                } else {
                    setOtpTimeLeft(600)
                }
                setCanResend(false)
            } else {
                toast.error("Failed to resend OTP")
            }
        } catch (err) {
            toast.error("Error resending OTP")
        } finally {
            setResendingOTP(false)
        }
    }

    const handlePrint = () => window.print()

    const handleBack = () => {
        // Show retention modal instead of navigating immediately
        setShowExitConfirmation(true)
    }

    const confirmExit = () => {
        setShowExitConfirmation(false)
        // Explicitly navigate away. 
        // Since we have been pushing states to the history stack, simple back() logic
        // might get stuck in our loop. Using replace or explicit path is safer.
        navigate(`/book/${businessLink}/customer`, { replace: true })
    }

    const cancelExit = () => {
        setShowExitConfirmation(false)
    }

    // --- Render Helpers ---

    // Reusable UI Component
    const Card = ({ children, className = "" }) => (
        <div className={`bg-white border p-3 ${className}`}>
            {children}
        </div>
    );

    const SectionHeader = ({ title }) => (
        <h2 className="text-xs uppercase tracking-wide text-gray-500 font-medium mb-2">{title}</h2>
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
        <div className="min-h-screen bg-gray-50 py-4 px-4 pb-20">
            <div className="max-w-6xl mx-auto">
                {!appointment ? (
                    <>

                        {/* Page Header */}
                        <div className="mb-4 max-w-5xl mx-auto flex items-start justify-between">
                            <button
                                onClick={handleBack}
                                className="text-gray-500 hover:text-gray-900 p-2 -ml-2 rounded-full hover:bg-gray-100"
                            >
                                <FaArrowLeft size={18} />
                            </button>
                            <div className="text-right flex-1">
                                <h1 className="text-lg font-bold text-gray-900">Finalize Your Booking</h1>
                                <p className="text-gray-500 mt-1 text-xs">Please check your details before finalizing.</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 max-w-5xl mx-auto">

                            {/* LEFT COLUMN: Details */}
                            <div className="lg:col-span-7 space-y-3">

                                {/* 1. Date & Time */}
                                <Card>
                                    <SectionHeader title="Appointment Time" />
                                    <div className="flex flex-row gap-3">
                                        <div className="flex items-center gap-2 flex-1">
                                            <div className="p-2 bg-primary-50 text-primary-600 rounded">
                                                <FaCalendarAlt className="text-sm" />
                                            </div>
                                            <div>
                                                <p className="text-gray-900 font-semibold text-sm">
                                                    {new Date(bookingData.date).toLocaleDateString('en-US', {
                                                        weekday: 'short', month: 'short', day: 'numeric'
                                                    })}
                                                </p>
                                                <p className="text-gray-500 text-xs">{new Date(bookingData.date).getFullYear()}</p>
                                            </div>
                                        </div>
                                        <div className="w-px bg-gray-100"></div>
                                        <div className="flex items-center gap-2 flex-1">
                                            <div className="p-2 bg-primary-50 text-primary-600 rounded">
                                                <FaClock className="text-sm" />
                                            </div>
                                            <div>
                                                <p className="text-gray-900 font-semibold text-sm">{formatTime(bookingData.time)}</p>
                                                <p className="text-gray-500 text-xs">{totalDuration} Mins</p>
                                            </div>
                                        </div>
                                    </div>
                                </Card>

                                {/* 2. Staff Member (NEW SECTION) */}
                                {bookingData.staff && (
                                    <Card>
                                        <SectionHeader title="Selected Professional" />
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-primary-50 border flex items-center justify-center text-primary-600">
                                                <FaUserTie size={16} />
                                            </div>
                                            <div>
                                                <p className="text-gray-900 font-semibold text-sm">
                                                    {bookingData.staff.name}
                                                </p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="text-xs font-medium uppercase tracking-wide text-primary-700 bg-primary-50 px-2 py-0.5 rounded">
                                                        {bookingData.staff.role || 'Staff'}
                                                    </span>
                                                    {bookingData.staff.specialization && (
                                                        <span className="text-xs text-gray-500">
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
                                        {bookingData.services.map((service, index) => {
                                            const duration = typeof service === 'object' ? (service.duration || service.time || 60) : 60
                                            return (
                                                <div key={index} className="flex items-center justify-between py-2 first:pt-0 last:pb-0">
                                                    <div>
                                                        <span className="text-gray-900 font-medium text-xs block">{getServiceName(service)}</span>
                                                        <div className="flex items-center gap-2 mt-0.5">
                                                            <span className="text-gray-500 text-xs">{duration} min</span>
                                                            <span className="text-red-500 font-bold text-xs">40% OFF</span>
                                                        </div>
                                                    </div>
                                                    {getServicePrice(service) > 0 && (
                                                        <span className="text-gray-600 text-xs">₹{getServicePrice(service).toLocaleString()}</span>
                                                    )}
                                                </div>
                                            )
                                        })}
                                    </div>
                                </Card>

                                {/* 4. Customer Info */}
                                <Card>
                                    <SectionHeader title="Your Details" />
                                    <div className="grid grid-cols-2 gap-y-2 gap-x-3">
                                        <div className="flex items-center gap-2">
                                            <FaUser className="text-gray-400 text-xs" />
                                            <span className="text-gray-900 font-medium text-xs truncate">{bookingData.customer.name}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <FaPhoneAlt className="text-gray-400 text-xs" />
                                            <span className="text-gray-900 text-xs truncate">{bookingData.customer.phone}</span>
                                        </div>
                                        <div className="flex items-center gap-2 col-span-2">
                                            <FaEnvelope className="text-gray-400 text-xs" />
                                            <span className="text-gray-900 text-xs truncate">{bookingData.customer.email}</span>
                                        </div>
                                    </div>
                                </Card>
                            </div>

                            {/* RIGHT COLUMN: Payment & Actions */}
                            <div className="lg:col-span-5 space-y-4">
                                <Card className="sticky top-4">
                                    <h2 className="text-base font-semibold text-gray-900 mb-3">Payment Summary</h2>

                                    {/* Price Breakdown */}
                                    <div className="space-y-2 mb-4 bg-gray-50 p-3 rounded">
                                        <div className="flex justify-between text-gray-600 text-xs">
                                            <span>Subtotal</span>
                                            <span>₹{basePrice.toLocaleString()}</span>
                                        </div>

                                        {isOnlinePayment && (
                                            <div className="flex justify-between text-green-600 font-medium text-xs">
                                                <span className="flex items-center gap-2">
                                                    Discount <span className="text-xs bg-green-100 px-1 py-0.5 font-bold uppercase rounded">{ONLINE_PAYMENT_DISCOUNT}% OFF</span>
                                                </span>
                                                <span>-₹{discount.toLocaleString()}</span>
                                            </div>
                                        )}

                                        <div className="pt-2 mt-1 border-t border-gray-200 flex justify-between items-end">
                                            <span className="text-gray-900 font-semibold text-sm">Total to Pay</span>
                                            <span className="text-lg font-bold text-gray-900">
                                                ₹{isOnlinePayment ? finalPrice.toLocaleString() : basePrice.toLocaleString()}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Payment Methods */}
                                    <div className="mb-4">
                                        <label className="block text-xs font-medium uppercase text-gray-500 mb-2">Select Payment Method</label>
                                        <div className="grid grid-cols-2 gap-2">
                                            {[
                                                { value: 'cash', label: 'Cash', icon: FaMoneyBillWave, isOnline: false, key: 'cash' },
                                                { value: 'upi', label: 'UPI', icon: FaMobileAlt, isOnline: true, key: 'upi' },
                                                { value: 'card', label: 'Card', icon: FaCreditCard, isOnline: true, key: 'card' },
                                                { value: 'wallet', label: 'Wallet', icon: FaWallet, isOnline: true, key: 'wallet' },
                                                { value: 'netbanking', label: 'Net Bank', icon: FaCreditCard, isOnline: true, key: 'netBanking' }
                                            ].filter(method => business?.paymentMethods?.[method.key]).map((method) => {
                                                const Icon = method.icon
                                                const isSelected = paymentMethod === method.value
                                                return (
                                                    <button
                                                        key={method.value}
                                                        type="button"
                                                        onClick={() => setPaymentMethod(method.value)}
                                                        className={`
                                                            relative flex flex-col items-center justify-center gap-1 p-2 border h-14 rounded
                                                            ${isSelected
                                                                ? 'border-primary-600 bg-primary-50 text-primary-700'
                                                                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-600'
                                                            }
                                                        `}
                                                    >
                                                        <Icon className={isSelected ? 'text-primary-600' : 'text-gray-400'} size={16} />
                                                        <span className="text-xs font-medium">{method.label}</span>
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
                                        (business?.paymentMethods?.upi ||
                                            business?.paymentMethods?.card ||
                                            business?.paymentMethods?.netBanking ||
                                            business?.paymentMethods?.wallet) && (
                                            <div className="bg-blue-50 border border-blue-100 p-2 mb-4 flex gap-2 items-start rounded">
                                                <div className="bg-blue-100 p-1 rounded-full text-blue-600 shrink-0 mt-0.5">
                                                    <FaDollarSign size={10} />
                                                </div>
                                                <div>
                                                    <p className="text-xs font-bold text-blue-900">Save ₹{discount.toLocaleString()}</p>
                                                    <p className="text-xs text-blue-700 mt-0.5">Pay online now to save {ONLINE_PAYMENT_DISCOUNT}% on your booking.</p>
                                                </div>
                                            </div>
                                        ))}

                                    {/* Submit Button */}
                                    <button
                                        onClick={handleConfirmBooking}
                                        disabled={submitting}
                                        className="w-full py-2 bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-70 disabled:cursor-not-allowed font-medium text-sm flex items-center justify-center gap-2 rounded"
                                    >
                                        {submitting ? (
                                            <><FaSpinner className="animate-spin" /> Processing...</>
                                        ) : (
                                            <span>Complete & Book</span>
                                        )}
                                    </button>
                                    <div className="flex items-center justify-center gap-1 mt-2 text-gray-400 text-xs">
                                        <svg className="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <span>Secure Booking • Payment collected at venue</span>
                                    </div>
                                </Card>
                            </div>
                        </div>
                    </>
                ) : (
                    /* --- SUCCESS STATE --- */
                    <div className="max-w-xl mx-auto pt-4">
                        <div className="bg-white overflow-hidden border rounded">
                            {/* Success Header */}
                            <div className="bg-green-50 p-6 text-center border-b">
                                <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <FaCheckCircle className="text-green-600 text-2xl" />
                                </div>
                                <h1 className="text-lg font-bold text-gray-900 mb-1">Booking Confirmed!</h1>
                                <p className="text-gray-600 text-xs">Your appointment is successfully scheduled.</p>
                            </div>

                            {/* Details Body */}
                            <div className="p-6 space-y-4">

                                {/* Code Box */}
                                <div className="border border-dashed p-3 flex flex-col items-center bg-gray-50">
                                    <span className="text-xs uppercase tracking-wider text-gray-500 font-medium mb-2">Confirmation Code</span>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xl font-mono font-bold text-gray-900 tracking-wider">
                                            {appointment.confirmationCode}
                                        </span>
                                        <button
                                            onClick={handleCopyConfirmationCode}
                                            className="text-gray-400 hover:text-primary-600 p-1"
                                            title="Copy Code"
                                        >
                                            <FaCopy size={14} />
                                        </button>
                                    </div>
                                </div>

                                {/* Quick Info */}
                                <div className="space-y-2 text-xs">
                                    <div className="flex justify-between items-center py-2 border-b">
                                        <span className="text-gray-500">Date</span>
                                        <span className="text-gray-900 font-medium text-right">
                                            {new Date(appointment.appointmentDate).toLocaleDateString('en-US', {
                                                weekday: 'short', month: 'long', day: 'numeric', year: 'numeric'
                                            })}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center py-2 border-b">
                                        <span className="text-gray-500">Time</span>
                                        <span className="text-gray-900 font-medium">{formatTime(appointment.startTime)}</span>
                                    </div>

                                    {/* Staff in Success View */}
                                    {bookingData.staff && (
                                        <div className="flex justify-between items-center py-2 border-b">
                                            <span className="text-gray-500">Professional</span>
                                            <span className="text-gray-900 font-medium">{bookingData.staff.name}</span>
                                        </div>
                                    )}

                                    {appointment.business && (
                                        <div className="flex justify-between items-center py-2 border-b">
                                            <span className="text-gray-500">Venue</span>
                                            <span className="text-gray-900 font-medium">{appointment.business.name}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Success Actions */}
                                <div className="grid grid-cols-2 gap-3 pt-2">
                                    <button
                                        onClick={handlePrint}
                                        className="flex items-center justify-center gap-2 px-3 py-2 border text-gray-700 hover:bg-gray-50 text-xs"
                                    >
                                        <FaPrint /> Print
                                    </button>
                                    <button
                                        onClick={handleViewAppointment}
                                        className="flex items-center justify-center gap-2 px-3 py-2 bg-primary-600 text-white hover:bg-primary-700 text-xs"
                                    >
                                        <FaArrowRight size={10} /> View Appointment
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                {/* OTP Modal */}
                {showOTPModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                        <div className="bg-white rounded p-4 max-w-sm w-full">
                            <h3 className="text-base font-semibold text-gray-900 mb-2">Verify Mobile Number</h3>
                            <p className="text-xs text-gray-500 mb-4">
                                Enter the OTP sent to <span className="font-medium text-gray-700">{phoneForOTP}</span>
                            </p>

                            <div className="flex gap-2 justify-center mb-6">
                                {otp.map((digit, index) => (
                                    <input
                                        key={index}
                                        id={`otp-input-${index}`}
                                        type="text"
                                        value={digit}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            if (!/^\d*$/.test(val)) return;

                                            const newOtp = [...otp];
                                            newOtp[index] = val.substring(val.length - 1);
                                            setOtp(newOtp);

                                            if (val && index < 3) {
                                                document.getElementById(`otp-input-${index + 1}`).focus();
                                            }
                                        }}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Backspace' && !otp[index] && index > 0) {
                                                document.getElementById(`otp-input-${index - 1}`).focus();
                                            }
                                        }}
                                        className="w-10 h-10 text-center text-lg border rounded focus:border-primary-600 focus:outline-none"
                                        maxLength={1}
                                        autoFocus={index === 0}
                                    />
                                ))}
                            </div>

                            <div className="flex flex-col gap-2">
                                <button
                                    onClick={handleVerifyOTP}
                                    disabled={verifyingOTP}
                                    className="w-full py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded disabled:opacity-70 flex items-center justify-center gap-2"
                                >
                                    {verifyingOTP ? <FaSpinner className="animate-spin" /> : "Verify Booking"}
                                </button>
                                {/* Resend Logic */}
                                <div className="text-center text-xs font-medium">
                                    {otpTimeLeft > 0 ? (
                                        <span className="text-gray-500">
                                            Resend OTP in <span className="text-primary-600 tabular-nums">{formatTimer(otpTimeLeft)}</span>
                                        </span>
                                    ) : (
                                        <button
                                            onClick={handleResendOTP}
                                            disabled={resendingOTP}
                                            className="text-primary-600 hover:text-primary-700 hover:underline disabled:opacity-50"
                                        >
                                            {resendingOTP ? "Resending..." : "Resend OTP"}
                                        </button>
                                    )}
                                </div>

                                <button
                                    onClick={() => setShowOTPModal(false)}
                                    className="w-full py-2 text-gray-500 hover:text-gray-700 text-xs"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Exit Intent Retention Modal */}
            {showExitConfirmation && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4">
                    <div className="bg-white rounded max-w-md w-full overflow-hidden">
                        <div className="bg-amber-50 p-4 text-center border-b">
                            <div className="w-12 h-12 bg-amber-100 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-3">
                                <FaExclamationTriangle size={24} />
                            </div>
                            <h3 className="text-base font-semibold text-gray-900 mb-1">Wait! Don't lose your spot!</h3>
                            <p className="text-gray-600 text-xs">
                                You are just one step away from confirming your appointment.
                            </p>
                        </div>
                        <div className="p-4">
                            <div className="bg-red-50 border border-red-100 rounded p-3 mb-4">
                                <div className="text-xs text-red-800">
                                    <p className="font-bold">Last Chance for 40% OFF</p>
                                    <p>If you leave now, you will lose your <span className="font-bold">40% discount</span> and your preferred specific time slot might be taken by someone else.</p>
                                </div>
                            </div>

                            <div className="flex flex-col gap-2">
                                <button
                                    onClick={cancelExit}
                                    className="w-full py-2 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded text-sm"
                                >
                                    Complete Booking
                                </button>
                                <button
                                    onClick={confirmExit}
                                    className="w-full py-2 text-gray-400 hover:text-gray-600 text-xs hover:underline"
                                >
                                    Leave Anyway
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default BookingConfirmation
