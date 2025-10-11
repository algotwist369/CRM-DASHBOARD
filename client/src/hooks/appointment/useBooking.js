import { useState, useCallback } from 'react'
import { useApi } from '../api/useApi'

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
    clearError,
    resetBooking
  }
}

export default useBooking
