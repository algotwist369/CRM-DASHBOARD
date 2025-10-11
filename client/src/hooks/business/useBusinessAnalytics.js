import { useState, useEffect, useCallback } from 'react'
import { useApi } from '../api/useApi'

export const useBusinessAnalytics = (businessId, options = {}) => {
  const [analytics, setAnalytics] = useState(null)
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

  const fetchAnalytics = useCallback(async () => {
    if (!businessId) return

    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams({
        period,
        ...(startDate && { startDate }),
        ...(endDate && { endDate })
      })

      const result = await get(`/businesses/${businessId}/analytics?${params}`)
      setAnalytics(result.data)

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
  }, [businessId, period, startDate, endDate, get, onSuccess, onError])

  const getRevenueAnalytics = useCallback(async () => {
    if (!businessId) return

    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams({
        period,
        ...(startDate && { startDate }),
        ...(endDate && { endDate })
      })

      const result = await get(`/businesses/${businessId}/analytics/revenue?${params}`)
      return result.data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [businessId, period, startDate, endDate, get])

  const getCustomerAnalytics = useCallback(async () => {
    if (!businessId) return

    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams({
        period,
        ...(startDate && { startDate }),
        ...(endDate && { endDate })
      })

      const result = await get(`/businesses/${businessId}/analytics/customers?${params}`)
      return result.data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [businessId, period, startDate, endDate, get])

  const getAppointmentAnalytics = useCallback(async () => {
    if (!businessId) return

    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams({
        period,
        ...(startDate && { startDate }),
        ...(endDate && { endDate })
      })

      const result = await get(`/businesses/${businessId}/analytics/appointments?${params}`)
      return result.data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [businessId, period, startDate, endDate, get])

  const getStaffPerformance = useCallback(async () => {
    if (!businessId) return

    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams({
        period,
        ...(startDate && { startDate }),
        ...(endDate && { endDate })
      })

      const result = await get(`/businesses/${businessId}/analytics/staff-performance?${params}`)
      return result.data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [businessId, period, startDate, endDate, get])

  const getServiceAnalytics = useCallback(async () => {
    if (!businessId) return

    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams({
        period,
        ...(startDate && { startDate }),
        ...(endDate && { endDate })
      })

      const result = await get(`/businesses/${businessId}/analytics/services?${params}`)
      return result.data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [businessId, period, startDate, endDate, get])

  const getTrends = useCallback(async (metric) => {
    if (!businessId) return

    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams({
        metric,
        period,
        ...(startDate && { startDate }),
        ...(endDate && { endDate })
      })

      const result = await get(`/businesses/${businessId}/analytics/trends?${params}`)
      return result.data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [businessId, period, startDate, endDate, get])

  const getComparativeAnalytics = useCallback(async (comparePeriod) => {
    if (!businessId) return

    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams({
        period,
        comparePeriod,
        ...(startDate && { startDate }),
        ...(endDate && { endDate })
      })

      const result = await get(`/businesses/${businessId}/analytics/compare?${params}`)
      return result.data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [businessId, period, startDate, endDate, get])

  const exportAnalytics = useCallback(async (format = 'csv', type = 'overview') => {
    if (!businessId) return

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

      const result = await get(`/businesses/${businessId}/analytics/export?${params}`)
      return result.data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [businessId, period, startDate, endDate, get])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const reset = useCallback(() => {
    setAnalytics(null)
    setError(null)
    setLoading(false)
  }, [])

  useEffect(() => {
    if (enabled && businessId) {
      fetchAnalytics()
    }
  }, [enabled, businessId, fetchAnalytics])

  return {
    analytics,
    loading,
    error,
    fetchAnalytics,
    getRevenueAnalytics,
    getCustomerAnalytics,
    getAppointmentAnalytics,
    getStaffPerformance,
    getServiceAnalytics,
    getTrends,
    getComparativeAnalytics,
    exportAnalytics,
    clearError,
    reset
  }
}

export default useBusinessAnalytics
