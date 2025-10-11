import { useState, useEffect, useCallback } from 'react'
import { useApi } from '../api/useApi'

export const useCustomerAnalytics = (options = {}) => {
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const { get } = useApi()

  const {
    businessId = '',
    period = '30d',
    startDate,
    endDate,
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
        ...(businessId && { businessId }),
        ...(startDate && { startDate }),
        ...(endDate && { endDate })
      })

      const result = await get(`/customers/analytics?${params}`)
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

  const getCustomerGrowth = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams({
        period,
        ...(businessId && { businessId }),
        ...(startDate && { startDate }),
        ...(endDate && { endDate })
      })

      const result = await get(`/customers/analytics/growth?${params}`)
      return result.data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [businessId, period, startDate, endDate, get])

  const getCustomerRetention = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams({
        period,
        ...(businessId && { businessId }),
        ...(startDate && { startDate }),
        ...(endDate && { endDate })
      })

      const result = await get(`/customers/analytics/retention?${params}`)
      return result.data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [businessId, period, startDate, endDate, get])

  const getCustomerSegmentation = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams({
        period,
        ...(businessId && { businessId }),
        ...(startDate && { startDate }),
        ...(endDate && { endDate })
      })

      const result = await get(`/customers/analytics/segmentation?${params}`)
      return result.data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [businessId, period, startDate, endDate, get])

  const getCustomerLifetimeValue = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams({
        period,
        ...(businessId && { businessId }),
        ...(startDate && { startDate }),
        ...(endDate && { endDate })
      })

      const result = await get(`/customers/analytics/lifetime-value?${params}`)
      return result.data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [businessId, period, startDate, endDate, get])

  const getCustomerChurn = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams({
        period,
        ...(businessId && { businessId }),
        ...(startDate && { startDate }),
        ...(endDate && { endDate })
      })

      const result = await get(`/customers/analytics/churn?${params}`)
      return result.data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [businessId, period, startDate, endDate, get])

  const getCustomerDemographics = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams({
        period,
        ...(businessId && { businessId }),
        ...(startDate && { startDate }),
        ...(endDate && { endDate })
      })

      const result = await get(`/customers/analytics/demographics?${params}`)
      return result.data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [businessId, period, startDate, endDate, get])

  const getCustomerBehavior = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams({
        period,
        ...(businessId && { businessId }),
        ...(startDate && { startDate }),
        ...(endDate && { endDate })
      })

      const result = await get(`/customers/analytics/behavior?${params}`)
      return result.data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [businessId, period, startDate, endDate, get])

  const getCustomerPreferences = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams({
        period,
        ...(businessId && { businessId }),
        ...(startDate && { startDate }),
        ...(endDate && { endDate })
      })

      const result = await get(`/customers/analytics/preferences?${params}`)
      return result.data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [businessId, period, startDate, endDate, get])

  const getCustomerTrends = useCallback(async (metric) => {
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

      const result = await get(`/customers/analytics/trends?${params}`)
      return result.data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [businessId, period, startDate, endDate, get])

  const getCustomerInsights = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams({
        period,
        ...(businessId && { businessId }),
        ...(startDate && { startDate }),
        ...(endDate && { endDate })
      })

      const result = await get(`/customers/analytics/insights?${params}`)
      return result.data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [businessId, period, startDate, endDate, get])

  const exportCustomerAnalytics = useCallback(async (format = 'csv', type = 'overview') => {
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

      const result = await get(`/customers/analytics/export?${params}`)
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
    getCustomerGrowth,
    getCustomerRetention,
    getCustomerSegmentation,
    getCustomerLifetimeValue,
    getCustomerChurn,
    getCustomerDemographics,
    getCustomerBehavior,
    getCustomerPreferences,
    getCustomerTrends,
    getCustomerInsights,
    exportCustomerAnalytics,
    clearError,
    reset
  }
}

export default useCustomerAnalytics
