import { useState, useCallback } from 'react'
import { useApi } from '../api/useApi'
import { paymentService } from '../../services/public/paymentService'

export const useBooking = () => {
  const [bookingData, setBookingData] = useState({
    businessId: '',
    customerId: '',
    staffId: '',
    serviceId: '',
    scheduledDateTime: '',
    duration: 60,
    notes: '',
    specialRequests: '',
    status: 'pending'
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [step, setStep] = useState(1)
  const { post } = useApi()

  const updateBookingData = useCallback((updates) => {
    setBookingData(prev => ({ ...prev, ...updates }))
  }, [])

  const setBookingStep = useCallback((newStep) => {
    setStep(newStep)
  }, [])

  const nextStep = useCallback(() => {
    setStep(prev => prev + 1)
  }, [])

  const prevStep = useCallback(() => {
    setStep(prev => Math.max(1, prev - 1))
  }, [])

  const createBooking = useCallback(async (additionalData = {}) => {
    try {
      setLoading(true)
      setError(null)

      const finalBookingData = {
        ...bookingData,
        ...additionalData
      }

      const result = await post('/appointments', finalBookingData)

      // Reset booking data after successful creation
      setBookingData({
        businessId: '',
        customerId: '',
        staffId: '',
        serviceId: '',
        scheduledDateTime: '',
        duration: 60,
        notes: '',
        specialRequests: '',
        status: 'pending'
      })
      setStep(1)

      return result.data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [bookingData, post])

  const loadRazorpay = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script')
      script.src = 'https://checkout.razorpay.com/v1/checkout.js'
      script.onload = () => resolve(true)
      script.onerror = () => resolve(false)
      document.body.appendChild(script)
    })
  }

  const processPayment = useCallback(async (amount, businessId, customerInfo) => {
    try {
      setLoading(true)
      setError(null)

      const res = await loadRazorpay()

      if (!res) {
        throw new Error('Razorpay SDK failed to load. Are you online?')
      }

      // 1. Create Order
      const order = await paymentService.createOrder(amount, 'INR', `receipt_${Date.now()}`, businessId)

      return new Promise((resolve, reject) => {
        const options = {
          key: import.meta.env.VITE_RAZORPAY_KEY_ID, // Use environment variable
          amount: order.order.amount,
          currency: order.order.currency,
          name: "Spa Advisor", // Or Business Name
          description: "Appointment Booking",
          image: "/logo.png", // Add logo URL if available
          order_id: order.order.id,
          handler: async function (response) {
            try {
              // 2. Verify Payment
              const verification = await paymentService.verifyPayment({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature
              })

              resolve({
                success: true,
                paymentId: response.razorpay_payment_id,
                orderId: response.razorpay_order_id,
                signature: response.razorpay_signature
              })
            } catch (err) {
              reject(err)
            }
          },
          prefill: {
            name: customerInfo.name,
            email: customerInfo.email,
            contact: customerInfo.phone
          },
          notes: {
            address: "Spa Advisor Booking"
          },
          theme: {
            color: "#3399cc"
          },
          modal: {
            ondismiss: function () {
              setLoading(false);
              reject(new Error("Payment cancelled by user"));
            }
          }
        }

        const paymentObject = new window.Razorpay(options)
        paymentObject.open()
      })

    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      // Don't set loading false here because we want to wait for the modal
    }
  }, [])

  const validateBooking = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const result = await post('/appointments/validate', bookingData)
      return result.data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [bookingData, post])

  const checkAvailability = useCallback(async (dateTime, staffId, serviceId) => {
    try {
      setLoading(true)
      setError(null)

      const result = await post('/appointments/check-availability', {
        dateTime,
        staffId,
        serviceId
      })
      return result.data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [post])

  const calculatePrice = useCallback(async (serviceId, addOns = []) => {
    try {
      setLoading(true)
      setError(null)

      const result = await post('/appointments/calculate-price', {
        serviceId,
        addOns
      })
      return result.data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [post])

  const sendConfirmation = useCallback(async (appointmentId) => {
    try {
      setLoading(true)
      setError(null)

      const result = await post(`/appointments/${appointmentId}/send-confirmation`)
      return result.data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [post])

  const sendReminder = useCallback(async (appointmentId, type = 'email') => {
    try {
      setLoading(true)
      setError(null)

      const result = await post(`/appointments/${appointmentId}/send-reminder`, { type })
      return result.data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [post])

  const rescheduleBooking = useCallback(async (appointmentId, newDateTime, reason = '') => {
    try {
      setLoading(true)
      setError(null)

      const result = await post(`/appointments/${appointmentId}/reschedule`, {
        newDateTime,
        reason
      })
      return result.data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [post])

  const cancelBooking = useCallback(async (appointmentId, reason = '') => {
    try {
      setLoading(true)
      setError(null)

      const result = await post(`/appointments/${appointmentId}/cancel`, {
        reason
      })
      return result.data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [post])

  const getBookingConfirmation = useCallback(async (appointmentId) => {
    try {
      setLoading(true)
      setError(null)

      const result = await post(`/appointments/${appointmentId}/confirmation`)
      return result.data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [post])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const resetBooking = useCallback(() => {
    setBookingData({
      businessId: '',
      customerId: '',
      staffId: '',
      serviceId: '',
      scheduledDateTime: '',
      duration: 60,
      notes: '',
      specialRequests: '',
      status: 'pending'
    })
    setStep(1)
    setError(null)
    setLoading(false)
  }, [])

  return {
    bookingData,
    loading,
    error,
    step,
    updateBookingData,
    setBookingStep,
    nextStep,
    prevStep,
    createBooking,
    validateBooking,
    checkAvailability,
    calculatePrice,
    sendConfirmation,
    sendReminder,
    rescheduleBooking,
    cancelBooking,
    getBookingConfirmation,
    processPayment,
    clearError,
    resetBooking
  }
}

export default useBooking
