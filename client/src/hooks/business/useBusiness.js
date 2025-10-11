import { useState, useEffect, useCallback } from 'react'
import { useApi } from '../api/useApi'

export const useBusiness = (businessId) => {
  const [business, setBusiness] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const { get, put, patch, delete: del } = useApi()

  const fetchBusiness = useCallback(async () => {
    if (!businessId) return

    try {
      setLoading(true)
      setError(null)
      const result = await get(`/businesses/${businessId}`)
      setBusiness(result.data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [businessId, get])

  const updateBusiness = useCallback(async (updateData) => {
    try {
      setLoading(true)
      setError(null)
      const result = await put(`/businesses/${businessId}`, updateData)
      setBusiness(result.data)
      return result.data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [businessId, put])

  const patchBusiness = useCallback(async (patchData) => {
    try {
      setLoading(true)
      setError(null)
      const result = await patch(`/businesses/${businessId}`, patchData)
      setBusiness(result.data)
      return result.data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [businessId, patch])

  const deleteBusiness = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      await del(`/businesses/${businessId}`)
      setBusiness(null)
      return true
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [businessId, del])

  const updateBusinessStatus = useCallback(async (status) => {
    return patchBusiness({ status })
  }, [patchBusiness])

  const updateBusinessSettings = useCallback(async (settings) => {
    return patchBusiness({ settings })
  }, [patchBusiness])

  const getBusinessStats = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const result = await get(`/businesses/${businessId}/stats`)
      return result.data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [businessId, get])

  const getBusinessStaff = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const result = await get(`/businesses/${businessId}/staff`)
      return result.data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [businessId, get])

  const getBusinessCustomers = useCallback(async (params = {}) => {
    try {
      setLoading(true)
      setError(null)
      const queryParams = new URLSearchParams(params).toString()
      const result = await get(`/businesses/${businessId}/customers?${queryParams}`)
      return result.data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [businessId, get])

  const getBusinessAppointments = useCallback(async (params = {}) => {
    try {
      setLoading(true)
      setError(null)
      const queryParams = new URLSearchParams(params).toString()
      const result = await get(`/businesses/${businessId}/appointments?${queryParams}`)
      return result.data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [businessId, get])

  const getBusinessTransactions = useCallback(async (params = {}) => {
    try {
      setLoading(true)
      setError(null)
      const queryParams = new URLSearchParams(params).toString()
      const result = await get(`/businesses/${businessId}/transactions?${queryParams}`)
      return result.data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [businessId, get])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const reset = useCallback(() => {
    setBusiness(null)
    setError(null)
    setLoading(false)
  }, [])

  useEffect(() => {
    if (businessId) {
      fetchBusiness()
    }
  }, [businessId, fetchBusiness])

  return {
    business,
    loading,
    error,
    fetchBusiness,
    updateBusiness,
    patchBusiness,
    deleteBusiness,
    updateBusinessStatus,
    updateBusinessSettings,
    getBusinessStats,
    getBusinessStaff,
    getBusinessCustomers,
    getBusinessAppointments,
    getBusinessTransactions,
    clearError,
    reset
  }
}

export default useBusiness
