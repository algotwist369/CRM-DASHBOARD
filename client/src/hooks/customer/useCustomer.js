import { useState, useEffect, useCallback } from 'react'
import { useApi } from '../api/useApi'

export const useCustomer = (customerId) => {
  const [customer, setCustomer] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const { get, put, patch, delete: del } = useApi()

  const fetchCustomer = useCallback(async () => {
    if (!customerId) return

    try {
      setLoading(true)
      setError(null)
      const result = await get(`/customers/${customerId}`)
      setCustomer(result.data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [customerId, get])

  const updateCustomer = useCallback(async (updateData) => {
    try {
      setLoading(true)
      setError(null)
      const result = await put(`/customers/${customerId}`, updateData)
      setCustomer(result.data)
      return result.data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [customerId, put])

  const patchCustomer = useCallback(async (patchData) => {
    try {
      setLoading(true)
      setError(null)
      const result = await patch(`/customers/${customerId}`, patchData)
      setCustomer(result.data)
      return result.data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [customerId, patch])

  const deleteCustomer = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      await del(`/customers/${customerId}`)
      setCustomer(null)
      return true
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [customerId, del])

  const updateCustomerStatus = useCallback(async (status) => {
    return patchCustomer({ status })
  }, [patchCustomer])

  const updateCustomerPreferences = useCallback(async (preferences) => {
    return patchCustomer({ preferences })
  }, [patchCustomer])

  const getCustomerAppointments = useCallback(async (params = {}) => {
    try {
      setLoading(true)
      setError(null)
      const queryParams = new URLSearchParams(params).toString()
      const result = await get(`/customers/${customerId}/appointments?${queryParams}`)
      return result.data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [customerId, get])

  const getCustomerTransactions = useCallback(async (params = {}) => {
    try {
      setLoading(true)
      setError(null)
      const queryParams = new URLSearchParams(params).toString()
      const result = await get(`/customers/${customerId}/transactions?${queryParams}`)
      return result.data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [customerId, get])

  const getCustomerHistory = useCallback(async (params = {}) => {
    try {
      setLoading(true)
      setError(null)
      const queryParams = new URLSearchParams(params).toString()
      const result = await get(`/customers/${customerId}/history?${queryParams}`)
      return result.data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [customerId, get])

  const getCustomerNotes = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const result = await get(`/customers/${customerId}/notes`)
      return result.data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [customerId, get])

  const addCustomerNote = useCallback(async (note) => {
    try {
      setLoading(true)
      setError(null)
      const result = await patch(`/customers/${customerId}/notes`, { note })
      return result.data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [customerId, patch])

  const getCustomerLoyaltyPoints = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const result = await get(`/customers/${customerId}/loyalty-points`)
      return result.data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [customerId, get])

  const updateCustomerLoyaltyPoints = useCallback(async (points, reason) => {
    try {
      setLoading(true)
      setError(null)
      const result = await patch(`/customers/${customerId}/loyalty-points`, { points, reason })
      return result.data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [customerId, patch])

  const getCustomerSegments = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const result = await get(`/customers/${customerId}/segments`)
      return result.data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [customerId, get])

  const addCustomerToSegment = useCallback(async (segmentId) => {
    try {
      setLoading(true)
      setError(null)
      const result = await patch(`/customers/${customerId}/segments`, { segmentId })
      return result.data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [customerId, patch])

  const removeCustomerFromSegment = useCallback(async (segmentId) => {
    try {
      setLoading(true)
      setError(null)
      const result = await del(`/customers/${customerId}/segments/${segmentId}`)
      return result.data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [customerId, del])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const reset = useCallback(() => {
    setCustomer(null)
    setError(null)
    setLoading(false)
  }, [])

  useEffect(() => {
    if (customerId) {
      fetchCustomer()
    }
  }, [customerId, fetchCustomer])

  return {
    customer,
    loading,
    error,
    fetchCustomer,
    updateCustomer,
    patchCustomer,
    deleteCustomer,
    updateCustomerStatus,
    updateCustomerPreferences,
    getCustomerAppointments,
    getCustomerTransactions,
    getCustomerHistory,
    getCustomerNotes,
    addCustomerNote,
    getCustomerLoyaltyPoints,
    updateCustomerLoyaltyPoints,
    getCustomerSegments,
    addCustomerToSegment,
    removeCustomerFromSegment,
    clearError,
    reset
  }
}

export default useCustomer
