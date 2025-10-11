import { useState, useEffect, useCallback } from 'react'
import { useApi } from '../api/useApi'

export const useStaffPerformance = (staffId, options = {}) => {
  const [performance, setPerformance] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const { get } = useApi()

  const {
    period = '30d',
    startDate,
    endDate,
    enabled = true,
    onSuccess,
    onError
  } = options

  const fetchPerformance = useCallback(async () => {
    if (!staffId) return

    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams({
        period,
        ...(startDate && { startDate }),
        ...(endDate && { endDate })
      })

      const result = await get(`/staff/${staffId}/performance?${params}`)
      setPerformance(result.data)

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
  }, [staffId, period, startDate, endDate, get, onSuccess, onError])

  const getAppointmentStats = useCallback(async () => {
    if (!staffId) return

    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams({
        period,
        ...(startDate && { startDate }),
        ...(endDate && { endDate })
      })

      const result = await get(`/staff/${staffId}/performance/appointments?${params}`)
      return result.data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [staffId, period, startDate, endDate, get])

  const getRevenueStats = useCallback(async () => {
    if (!staffId) return

    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams({
        period,
        ...(startDate && { startDate }),
        ...(endDate && { endDate })
      })

      const result = await get(`/staff/${staffId}/performance/revenue?${params}`)
      return result.data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [staffId, period, startDate, endDate, get])

  const getCustomerStats = useCallback(async () => {
    if (!staffId) return

    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams({
        period,
        ...(startDate && { startDate }),
        ...(endDate && { endDate })
      })

      const result = await get(`/staff/${staffId}/performance/customers?${params}`)
      return result.data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [staffId, period, startDate, endDate, get])

  const getRatingStats = useCallback(async () => {
    if (!staffId) return

    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams({
        period,
        ...(startDate && { startDate }),
        ...(endDate && { endDate })
      })

      const result = await get(`/staff/${staffId}/performance/ratings?${params}`)
      return result.data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [staffId, period, startDate, endDate, get])

  const getServiceStats = useCallback(async () => {
    if (!staffId) return

    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams({
        period,
        ...(startDate && { startDate }),
        ...(endDate && { endDate })
      })

      const result = await get(`/staff/${staffId}/performance/services?${params}`)
      return result.data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [staffId, period, startDate, endDate, get])

  const getTrends = useCallback(async (metric) => {
    if (!staffId) return

    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams({
        metric,
        period,
        ...(startDate && { startDate }),
        ...(endDate && { endDate })
      })

      const result = await get(`/staff/${staffId}/performance/trends?${params}`)
      return result.data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [staffId, period, startDate, endDate, get])

  const getComparativePerformance = useCallback(async (comparePeriod) => {
    if (!staffId) return

    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams({
        period,
        comparePeriod,
        ...(startDate && { startDate }),
        ...(endDate && { endDate })
      })

      const result = await get(`/staff/${staffId}/performance/compare?${params}`)
      return result.data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [staffId, period, startDate, endDate, get])

  const getTopCustomers = useCallback(async () => {
    if (!staffId) return

    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams({
        period,
        ...(startDate && { startDate }),
        ...(endDate && { endDate })
      })

      const result = await get(`/staff/${staffId}/performance/top-customers?${params}`)
      return result.data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [staffId, period, startDate, endDate, get])

  const getScheduleUtilization = useCallback(async () => {
    if (!staffId) return

    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams({
        period,
        ...(startDate && { startDate }),
        ...(endDate && { endDate })
      })

      const result = await get(`/staff/${staffId}/performance/schedule-utilization?${params}`)
      return result.data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [staffId, period, startDate, endDate, get])

  const exportPerformance = useCallback(async (format = 'csv', type = 'overview') => {
    if (!staffId) return

    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams({
        format,
        type,
        period,
        ...(startDate && { startDate }),
        ...(endDate && { endDate })
      })

      const result = await get(`/staff/${staffId}/performance/export?${params}`)
      return result.data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [staffId, period, startDate, endDate, get])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const reset = useCallback(() => {
    setPerformance(null)
    setError(null)
    setLoading(false)
  }, [])

  useEffect(() => {
    if (enabled && staffId) {
      fetchPerformance()
    }
  }, [enabled, staffId, fetchPerformance])

  return {
    performance,
    loading,
    error,
    fetchPerformance,
    getAppointmentStats,
    getRevenueStats,
    getCustomerStats,
    getRatingStats,
    getServiceStats,
    getTrends,
    getComparativePerformance,
    getTopCustomers,
    getScheduleUtilization,
    exportPerformance,
    clearError,
    reset
  }
}

export default useStaffPerformance
