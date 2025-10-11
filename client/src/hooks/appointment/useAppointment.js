import { useState, useEffect, useCallback } from 'react'
import { useApi } from '../api/useApi'

export const useAppointment = (appointmentId) => {
  const [appointment, setAppointment] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const { get, put, patch, delete: del } = useApi()

  const fetchAppointment = useCallback(async () => {
    if (!appointmentId) return

    try {
      setLoading(true)
      setError(null)
      const result = await get(`/appointments/${appointmentId}`)
      setAppointment(result.data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [appointmentId, get])

  const updateAppointment = useCallback(async (updateData) => {
    try {
      setLoading(true)
      setError(null)
      const result = await put(`/appointments/${appointmentId}`, updateData)
      setAppointment(result.data)
      return result.data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [appointmentId, put])

  const patchAppointment = useCallback(async (patchData) => {
    try {
      setLoading(true)
      setError(null)
      const result = await patch(`/appointments/${appointmentId}`, patchData)
      setAppointment(result.data)
      return result.data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [appointmentId, patch])

  const deleteAppointment = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      await del(`/appointments/${appointmentId}`)
      setAppointment(null)
      return true
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [appointmentId, del])

  const updateAppointmentStatus = useCallback(async (status, notes = '') => {
    return patchAppointment({ status, notes })
  }, [patchAppointment])

  const rescheduleAppointment = useCallback(async (newDateTime, reason = '') => {
    return patchAppointment({ 
      scheduledDateTime: newDateTime, 
      rescheduleReason: reason,
      status: 'rescheduled'
    })
  }, [patchAppointment])

  const cancelAppointment = useCallback(async (reason = '') => {
    return patchAppointment({ 
      status: 'cancelled', 
      cancellationReason: reason,
      cancelledAt: new Date().toISOString()
    })
  }, [patchAppointment])

  const completeAppointment = useCallback(async (notes = '', services = []) => {
    return patchAppointment({ 
      status: 'completed', 
      completionNotes: notes,
      completedServices: services,
      completedAt: new Date().toISOString()
    })
  }, [patchAppointment])

  const addAppointmentNotes = useCallback(async (notes) => {
    return patchAppointment({ notes })
  }, [patchAppointment])

  const updateAppointmentServices = useCallback(async (services) => {
    return patchAppointment({ services })
  }, [patchAppointment])

  const updateAppointmentStaff = useCallback(async (staffId) => {
    return patchAppointment({ staffId })
  }, [patchAppointment])

  const getAppointmentHistory = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const result = await get(`/appointments/${appointmentId}/history`)
      return result.data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [appointmentId, get])

  const getAppointmentReminders = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const result = await get(`/appointments/${appointmentId}/reminders`)
      return result.data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [appointmentId, get])

  const sendAppointmentReminder = useCallback(async (type = 'email') => {
    try {
      setLoading(true)
      setError(null)
      const result = await patch(`/appointments/${appointmentId}/reminders`, { type })
      return result.data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [appointmentId, patch])

  const getAppointmentFeedback = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const result = await get(`/appointments/${appointmentId}/feedback`)
      return result.data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [appointmentId, get])

  const addAppointmentFeedback = useCallback(async (feedback) => {
    try {
      setLoading(true)
      setError(null)
      const result = await patch(`/appointments/${appointmentId}/feedback`, feedback)
      return result.data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [appointmentId, patch])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const reset = useCallback(() => {
    setAppointment(null)
    setError(null)
    setLoading(false)
  }, [])

  useEffect(() => {
    if (appointmentId) {
      fetchAppointment()
    }
  }, [appointmentId, fetchAppointment])

  return {
    appointment,
    loading,
    error,
    fetchAppointment,
    updateAppointment,
    patchAppointment,
    deleteAppointment,
    updateAppointmentStatus,
    rescheduleAppointment,
    cancelAppointment,
    completeAppointment,
    addAppointmentNotes,
    updateAppointmentServices,
    updateAppointmentStaff,
    getAppointmentHistory,
    getAppointmentReminders,
    sendAppointmentReminder,
    getAppointmentFeedback,
    addAppointmentFeedback,
    clearError,
    reset
  }
}

export default useAppointment
