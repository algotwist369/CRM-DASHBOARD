import { useState, useEffect, useCallback } from 'react'
import { useApi } from '../api/useApi'

export const useAppointments = (options = {}) => {
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [pagination, setPagination] = useState(null)
  const { get, post } = useApi()

  const {
    page = 1,
    limit = 20,
    search = '',
    status = '',
    staffId = '',
    customerId = '',
    businessId = '',
    startDate = '',
    endDate = '',
    sortBy = 'scheduledDateTime',
    sortOrder = 'asc',
    enabled = true,
    onSuccess,
    onError
  } = options

  const fetchAppointments = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        sortBy,
        sortOrder,
        ...(search && { search }),
        ...(status && { status }),
        ...(staffId && { staffId }),
        ...(customerId && { customerId }),
        ...(businessId && { businessId }),
        ...(startDate && { startDate }),
        ...(endDate && { endDate })
      })

      const result = await get(`/appointments?${params}`)
      const { data, pagination: paginationData } = result.data

      setAppointments(data)
      setPagination(paginationData)

      if (onSuccess) {
        onSuccess(data, paginationData)
      }
    } catch (err) {
      setError(err.message)
      if (onError) {
        onError(err)
      }
    } finally {
      setLoading(false)
    }
  }, [page, limit, search, status, staffId, customerId, businessId, startDate, endDate, sortBy, sortOrder, get, onSuccess, onError])

  const createAppointment = useCallback(async (appointmentData) => {
    try {
      setLoading(true)
      setError(null)
      const result = await post('/appointments', appointmentData)
      
      // Add new appointment to the list
      setAppointments(prev => [result.data, ...prev])
      
      return result.data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [post])

  const updateAppointment = useCallback(async (appointmentId, updateData) => {
    try {
      setLoading(true)
      setError(null)
      const result = await post(`/appointments/${appointmentId}`, updateData)
      
      // Update appointment in the list
      setAppointments(prev => 
        prev.map(appointment => 
          appointment.id === appointmentId ? result.data : appointment
        )
      )
      
      return result.data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [post])

  const deleteAppointment = useCallback(async (appointmentId) => {
    try {
      setLoading(true)
      setError(null)
      await post(`/appointments/${appointmentId}/delete`)
      
      // Remove appointment from the list
      setAppointments(prev => prev.filter(appointment => appointment.id !== appointmentId))
      
      return true
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [post])

  const bulkUpdateAppointments = useCallback(async (appointmentIds, updateData) => {
    try {
      setLoading(true)
      setError(null)
      const result = await post('/appointments/bulk-update', {
        appointmentIds,
        updateData
      })
      
      // Update appointments in the list
      setAppointments(prev => 
        prev.map(appointment => 
          appointmentIds.includes(appointment.id) 
            ? { ...appointment, ...updateData }
            : appointment
        )
      )
      
      return result.data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [post])

  const bulkDeleteAppointments = useCallback(async (appointmentIds) => {
    try {
      setLoading(true)
      setError(null)
      await post('/appointments/bulk-delete', { appointmentIds })
      
      // Remove appointments from the list
      setAppointments(prev => 
        prev.filter(appointment => !appointmentIds.includes(appointment.id))
      )
      
      return true
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [post])

  const getAppointmentStats = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const result = await get('/appointments/stats')
      return result.data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [get])

  const getTodayAppointments = useCallback(async (params = {}) => {
    try {
      setLoading(true)
      setError(null)
      const queryParams = new URLSearchParams(params).toString()
      const result = await get(`/appointments/today?${queryParams}`)
      return result.data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [get])

  const getUpcomingAppointments = useCallback(async (params = {}) => {
    try {
      setLoading(true)
      setError(null)
      const queryParams = new URLSearchParams(params).toString()
      const result = await get(`/appointments/upcoming?${queryParams}`)
      return result.data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [get])

  const getOverdueAppointments = useCallback(async (params = {}) => {
    try {
      setLoading(true)
      setError(null)
      const queryParams = new URLSearchParams(params).toString()
      const result = await get(`/appointments/overdue?${queryParams}`)
      return result.data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [get])

  const getAppointmentsByDate = useCallback(async (date, params = {}) => {
    try {
      setLoading(true)
      setError(null)
      const queryParams = new URLSearchParams({ date, ...params }).toString()
      const result = await get(`/appointments/by-date?${queryParams}`)
      return result.data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [get])

  const getAppointmentsByStatus = useCallback(async (status, params = {}) => {
    try {
      setLoading(true)
      setError(null)
      const queryParams = new URLSearchParams({ status, ...params }).toString()
      const result = await get(`/appointments/by-status?${queryParams}`)
      return result.data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [get])

  const exportAppointments = useCallback(async (format = 'csv', filters = {}) => {
    try {
      setLoading(true)
      setError(null)
      
      const params = new URLSearchParams({
        format,
        ...filters
      })
      
      const result = await get(`/appointments/export?${params}`)
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
    setAppointments([])
    setError(null)
    setPagination(null)
    setLoading(false)
  }, [])

  useEffect(() => {
    if (enabled) {
      fetchAppointments()
    }
  }, [enabled, fetchAppointments])

  return {
    appointments,
    loading,
    error,
    pagination,
    fetchAppointments,
    createAppointment,
    updateAppointment,
    deleteAppointment,
    bulkUpdateAppointments,
    bulkDeleteAppointments,
    getAppointmentStats,
    getTodayAppointments,
    getUpcomingAppointments,
    getOverdueAppointments,
    getAppointmentsByDate,
    getAppointmentsByStatus,
    exportAppointments,
    clearError,
    reset
  }
}

export default useAppointments
