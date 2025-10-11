import { useState, useEffect, useCallback } from 'react'
import { useApi } from '../api/useApi'

export const useAnalytics = (options = {}) => {
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const { get } = useApi()

  const {
    businessId = '',
    period = '30d',
    startDate,
    endDate,
    type = 'overview',
    enabled = true,
    onSuccess,
    onError
  } = options

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams({
        period,
        type,
        ...(businessId && { businessId }),
        ...(startDate && { startDate }),
        ...(endDate && { endDate })
      })

      const result = await get(`/analytics?${params}`)
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
  }, [businessId, period, startDate, endDate, type, get, onSuccess, onError])

  const getRevenueAnalytics = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams({
        period,
        ...(businessId && { businessId }),
        ...(startDate && { startDate }),
        ...(endDate && { endDate })
      })

      const result = await get(`/analytics/revenue?${params}`)
      return result.data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [businessId, period, startDate, endDate, get])

  const getCustomerAnalytics = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams({
        period,
        ...(businessId && { businessId }),
        ...(startDate && { startDate }),
        ...(endDate && { endDate })
      })

      const result = await get(`/analytics/customers?${params}`)
      return result.data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [businessId, period, startDate, endDate, get])

  const getAppointmentAnalytics = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams({
        period,
        ...(businessId && { businessId }),
        ...(startDate && { startDate }),
        ...(endDate && { endDate })
      })

      const result = await get(`/analytics/appointments?${params}`)
      return result.data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [businessId, period, startDate, endDate, get])

  const getStaffAnalytics = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams({
        period,
        ...(businessId && { businessId }),
        ...(startDate && { startDate }),
        ...(endDate && { endDate })
      })

      const result = await get(`/analytics/staff?${params}`)
      return result.data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [businessId, period, startDate, endDate, get])

  const getServiceAnalytics = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams({
        period,
        ...(businessId && { businessId }),
        ...(startDate && { startDate }),
        ...(endDate && { endDate })
      })

      const result = await get(`/analytics/services?${params}`)
      return result.data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [businessId, period, startDate, endDate, get])

  const getTrends = useCallback(async (metric) => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams({
        metric,
        period,
        ...(businessId && { businessId }),
        ...(startDate && { startDate }),
        ...(endDate && { endDate })
      })

      const result = await get(`/analytics/trends?${params}`)
      return result.data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [businessId, period, startDate, endDate, get])

  const getComparativeAnalytics = useCallback(async (comparePeriod) => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams({
        period,
        comparePeriod,
        ...(businessId && { businessId }),
        ...(startDate && { startDate }),
        ...(endDate && { endDate })
      })

      const result = await get(`/analytics/compare?${params}`)
      return result.data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [businessId, period, startDate, endDate, get])

  const getKPIs = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams({
        period,
        ...(businessId && { businessId }),
        ...(startDate && { startDate }),
        ...(endDate && { endDate })
      })

      const result = await get(`/analytics/kpis?${params}`)
      return result.data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [businessId, period, startDate, endDate, get])

  const getDashboardData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams({
        period,
        ...(businessId && { businessId }),
        ...(startDate && { startDate }),
        ...(endDate && { endDate })
      })

      const result = await get(`/analytics/dashboard?${params}`)
      return result.data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [businessId, period, startDate, endDate, get])

  const getInsights = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams({
        period,
        ...(businessId && { businessId }),
        ...(startDate && { startDate }),
        ...(endDate && { endDate })
      })

      const result = await get(`/analytics/insights?${params}`)
      return result.data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [businessId, period, startDate, endDate, get])

  const exportAnalytics = useCallback(async (format = 'csv', type = 'overview') => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams({
        format,
        type,
        period,
        ...(businessId && { businessId }),
        ...(startDate && { startDate }),
        ...(endDate && { endDate })
      })

      const result = await get(`/analytics/export?${params}`)
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
    if (enabled) {
      fetchAnalytics()
    }
  }, [enabled, fetchAnalytics])

  return {
    analytics,
    loading,
    error,
    fetchAnalytics,
    getRevenueAnalytics,
    getCustomerAnalytics,
    getAppointmentAnalytics,
    getStaffAnalytics,
    getServiceAnalytics,
    getTrends,
    getComparativeAnalytics,
    getKPIs,
    getDashboardData,
    getInsights,
    exportAnalytics,
    clearError,
    reset
  }
}

export default useAnalytics
