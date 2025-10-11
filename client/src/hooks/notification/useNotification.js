import { useState, useEffect, useCallback } from 'react'
import { useApi } from '../api/useApi'

export const useNotification = (notificationId) => {
  const [notification, setNotification] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const { get, put, patch, delete: del } = useApi()

  const fetchNotification = useCallback(async () => {
    if (!notificationId) return

    try {
      setLoading(true)
      setError(null)
      const result = await get(`/notifications/${notificationId}`)
      setNotification(result.data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [notificationId, get])

  const updateNotification = useCallback(async (updateData) => {
    try {
      setLoading(true)
      setError(null)
      const result = await put(`/notifications/${notificationId}`, updateData)
      setNotification(result.data)
      return result.data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [notificationId, put])

  const patchNotification = useCallback(async (patchData) => {
    try {
      setLoading(true)
      setError(null)
      const result = await patch(`/notifications/${notificationId}`, patchData)
      setNotification(result.data)
      return result.data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [notificationId, patch])

  const deleteNotification = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      await del(`/notifications/${notificationId}`)
      setNotification(null)
      return true
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [notificationId, del])

  const markAsRead = useCallback(async () => {
    return patchNotification({ status: 'read', readAt: new Date().toISOString() })
  }, [patchNotification])

  const markAsUnread = useCallback(async () => {
    return patchNotification({ status: 'unread', readAt: null })
  }, [patchNotification])

  const updateNotificationStatus = useCallback(async (status) => {
    return patchNotification({ status })
  }, [patchNotification])

  const scheduleNotification = useCallback(async (scheduledAt) => {
    return patchNotification({ 
      status: 'scheduled', 
      scheduledAt,
      sentAt: null
    })
  }, [patchNotification])

  const sendNotification = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const result = await patch(`/notifications/${notificationId}/send`)
      return result.data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [notificationId, patch])

  const getNotificationStats = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const result = await get(`/notifications/${notificationId}/stats`)
      return result.data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [notificationId, get])

  const getNotificationRecipients = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const result = await get(`/notifications/${notificationId}/recipients`)
      return result.data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [notificationId, get])

  const addRecipients = useCallback(async (recipients) => {
    try {
      setLoading(true)
      setError(null)
      const result = await patch(`/notifications/${notificationId}/recipients`, { recipients })
      return result.data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [notificationId, patch])

  const removeRecipients = useCallback(async (recipientIds) => {
    try {
      setLoading(true)
      setError(null)
      const result = await del(`/notifications/${notificationId}/recipients`, {
        body: JSON.stringify({ recipientIds })
      })
      return result.data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [notificationId, del])

  const getNotificationHistory = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const result = await get(`/notifications/${notificationId}/history`)
      return result.data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [notificationId, get])

  const duplicateNotification = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const result = await post(`/notifications/${notificationId}/duplicate`)
      return result.data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [notificationId, post])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const reset = useCallback(() => {
    setNotification(null)
    setError(null)
    setLoading(false)
  }, [])

  useEffect(() => {
    if (notificationId) {
      fetchNotification()
    }
  }, [notificationId, fetchNotification])

  return {
    notification,
    loading,
    error,
    fetchNotification,
    updateNotification,
    patchNotification,
    deleteNotification,
    markAsRead,
    markAsUnread,
    updateNotificationStatus,
    scheduleNotification,
    sendNotification,
    getNotificationStats,
    getNotificationRecipients,
    addRecipients,
    removeRecipients,
    getNotificationHistory,
    duplicateNotification,
    clearError,
    reset
  }
}

export default useNotification
