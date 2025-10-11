import { useState, useEffect, useCallback } from 'react'
import { useApi } from '../api/useApi'

export const useStaff = (staffId) => {
  const [staff, setStaff] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const { get, put, patch, delete: del } = useApi()

  const fetchStaff = useCallback(async () => {
    if (!staffId) return

    try {
      setLoading(true)
      setError(null)
      const result = await get(`/staff/${staffId}`)
      setStaff(result.data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [staffId, get])

  const updateStaff = useCallback(async (updateData) => {
    try {
      setLoading(true)
      setError(null)
      const result = await put(`/staff/${staffId}`, updateData)
      setStaff(result.data)
      return result.data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [staffId, put])

  const patchStaff = useCallback(async (patchData) => {
    try {
      setLoading(true)
      setError(null)
      const result = await patch(`/staff/${staffId}`, patchData)
      setStaff(result.data)
      return result.data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [staffId, patch])

  const deleteStaff = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      await del(`/staff/${staffId}`)
      setStaff(null)
      return true
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [staffId, del])

  const updateStaffStatus = useCallback(async (status) => {
    return patchStaff({ status })
  }, [patchStaff])

  const updateStaffRole = useCallback(async (role) => {
    return patchStaff({ role })
  }, [patchStaff])

  const updateStaffSchedule = useCallback(async (schedule) => {
    return patchStaff({ schedule })
  }, [patchStaff])

  const getStaffAppointments = useCallback(async (params = {}) => {
    try {
      setLoading(true)
      setError(null)
      const queryParams = new URLSearchParams(params).toString()
      const result = await get(`/staff/${staffId}/appointments?${queryParams}`)
      return result.data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [staffId, get])

  const getStaffCustomers = useCallback(async (params = {}) => {
    try {
      setLoading(true)
      setError(null)
      const queryParams = new URLSearchParams(params).toString()
      const result = await get(`/staff/${staffId}/customers?${queryParams}`)
      return result.data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [staffId, get])

  const getStaffSchedule = useCallback(async (params = {}) => {
    try {
      setLoading(true)
      setError(null)
      const queryParams = new URLSearchParams(params).toString()
      const result = await get(`/staff/${staffId}/schedule?${queryParams}`)
      return result.data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [staffId, get])

  const getStaffAvailability = useCallback(async (date) => {
    try {
      setLoading(true)
      setError(null)
      const params = new URLSearchParams({ date })
      const result = await get(`/staff/${staffId}/availability?${params}`)
      return result.data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [staffId, get])

  const updateStaffAvailability = useCallback(async (availability) => {
    return patchStaff({ availability })
  }, [patchStaff])

  const getStaffServices = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const result = await get(`/staff/${staffId}/services`)
      return result.data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [staffId, get])

  const updateStaffServices = useCallback(async (services) => {
    return patchStaff({ services })
  }, [patchStaff])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const reset = useCallback(() => {
    setStaff(null)
    setError(null)
    setLoading(false)
  }, [])

  useEffect(() => {
    if (staffId) {
      fetchStaff()
    }
  }, [staffId, fetchStaff])

  return {
    staff,
    loading,
    error,
    fetchStaff,
    updateStaff,
    patchStaff,
    deleteStaff,
    updateStaffStatus,
    updateStaffRole,
    updateStaffSchedule,
    getStaffAppointments,
    getStaffCustomers,
    getStaffSchedule,
    getStaffAvailability,
    updateStaffAvailability,
    getStaffServices,
    updateStaffServices,
    clearError,
    reset
  }
}

export default useStaff
