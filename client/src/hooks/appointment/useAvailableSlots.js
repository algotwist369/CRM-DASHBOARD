import { useState, useEffect, useCallback } from 'react'
import { useApi } from '../api/useApi'

export const useAvailableSlots = (options = {}) => {
  const [slots, setSlots] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const { get } = useApi()

  const {
    date,
    staffId,
    serviceId,
    businessId,
    duration = 60,
    enabled = true,
    onSuccess,
    onError
  } = options

  const fetchAvailableSlots = useCallback(async () => {
    if (!date || !businessId) return

    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams({
        date,
        businessId,
        duration: duration.toString(),
        ...(staffId && { staffId }),
        ...(serviceId && { serviceId })
      })

      const result = await get(`/appointments/available-slots?${params}`)
      setSlots(result.data)

      if (onSuccess) {
        onSuccess(result.data)
      }
    } catch (err) {
      setError(err.message)
      if (onError) {
        onError(err)
      }
    } finally {
      setLoading(false)
    }
  }, [date, staffId, serviceId, businessId, duration, get, onSuccess, onError])

  const checkSlotAvailability = useCallback(async (dateTime, staffId, serviceId) => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams({
        dateTime,
        staffId,
        serviceId
      })

      const result = await get(`/appointments/check-availability?${params}`)
      return result.data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [get])

  const getStaffAvailability = useCallback(async (staffId, date) => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams({
        staffId,
        date
      })

      const result = await get(`/appointments/staff-availability?${params}`)
      return result.data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [get])

  const getBusinessHours = useCallback(async (businessId, date) => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams({
        businessId,
        date
      })

      const result = await get(`/appointments/business-hours?${params}`)
      return result.data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [get])

  const getServiceDuration = useCallback(async (serviceId) => {
    try {
      setLoading(true)
      setError(null)

      const result = await get(`/services/${serviceId}/duration`)
      return result.data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [get])

  const getStaffSchedule = useCallback(async (staffId, startDate, endDate) => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams({
        staffId,
        startDate,
        endDate
      })

      const result = await get(`/appointments/staff-schedule?${params}`)
      return result.data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [get])

  const getBlockedSlots = useCallback(async (businessId, date) => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams({
        businessId,
        date
      })

      const result = await get(`/appointments/blocked-slots?${params}`)
      return result.data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [get])

  const getRecurringSlots = useCallback(async (businessId, startDate, endDate) => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams({
        businessId,
        startDate,
        endDate
      })

      const result = await get(`/appointments/recurring-slots?${params}`)
      return result.data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [get])

  const getSlotRecommendations = useCallback(async (preferences) => {
    try {
      setLoading(true)
      setError(null)

      const result = await get('/appointments/slot-recommendations', {
        body: JSON.stringify(preferences)
      })
      return result.data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [get])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const reset = useCallback(() => {
    setSlots([])
    setError(null)
    setLoading(false)
  }, [])

  useEffect(() => {
    if (enabled && date && businessId) {
      fetchAvailableSlots()
    }
  }, [enabled, date, businessId, fetchAvailableSlots])

  return {
    slots,
    loading,
    error,
    fetchAvailableSlots,
    checkSlotAvailability,
    getStaffAvailability,
    getBusinessHours,
    getServiceDuration,
    getStaffSchedule,
    getBlockedSlots,
    getRecurringSlots,
    getSlotRecommendations,
    clearError,
    reset
  }
}

export default useAvailableSlots
