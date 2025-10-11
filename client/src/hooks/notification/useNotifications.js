import { useState, useEffect, useCallback } from 'react'
import { useApi } from '../api/useApi'

export const useNotifications = (options = {}) => {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [pagination, setPagination] = useState(null)
  const { get, post } = useApi()

  const {
    page = 1,
    limit = 20,
    search = '',
    status = '',
    type = '',
    businessId = '',
    startDate = '',
    endDate = '',
    sortBy = 'createdAt',
    sortOrder = 'desc',
    enabled = true,
    onSuccess,
    onError
  } = options

  const fetchNotifications = useCallback(async () => {
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
        ...(type && { type }),
        ...(businessId && { businessId }),
        ...(startDate && { startDate }),
        ...(endDate && { endDate })
      })

      const result = await get(`/notifications?${params}`)
      const { data, pagination: paginationData } = result.data

      setNotifications(data)
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
  }, [page, limit, search, status, type, businessId, startDate, endDate, sortBy, sortOrder, get, onSuccess, onError])

  const createNotification = useCallback(async (notificationData) => {
    try {
      setLoading(true)
      setError(null)
      const result = await post('/notifications', notificationData)
      
      // Add new notification to the list
      setNotifications(prev => [result.data, ...prev])
      
      return result.data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [post])

  const updateNotification = useCallback(async (notificationId, updateData) => {
    try {
      setLoading(true)
      setError(null)
      const result = await post(`/notifications/${notificationId}`, updateData)
      
      // Update notification in the list
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === notificationId ? result.data : notification
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

  const deleteNotification = useCallback(async (notificationId) => {
    try {
      setLoading(true)
      setError(null)
      await post(`/notifications/${notificationId}/delete`)
      
      // Remove notification from the list
      setNotifications(prev => prev.filter(notification => notification.id !== notificationId))
      
      return true
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [post])

  const bulkUpdateNotifications = useCallback(async (notificationIds, updateData) => {
    try {
      setLoading(true)
      setError(null)
      const result = await post('/notifications/bulk-update', {
        notificationIds,
        updateData
      })
      
      // Update notifications in the list
      setNotifications(prev => 
        prev.map(notification => 
          notificationIds.includes(notification.id) 
            ? { ...notification, ...updateData }
            : notification
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

  const bulkDeleteNotifications = useCallback(async (notificationIds) => {
    try {
      setLoading(true)
      setError(null)
      await post('/notifications/bulk-delete', { notificationIds })
      
      // Remove notifications from the list
      setNotifications(prev => 
        prev.filter(notification => !notificationIds.includes(notification.id))
      )
      
      return true
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [post])

  const markAllAsRead = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const result = await post('/notifications/mark-all-read')
      
      // Update all notifications in the list
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, status: 'read' }))
      )
      
      return result.data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [post])

  const getNotificationStats = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const result = await get('/notifications/stats')
      return result.data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [get])

  const getUnreadCount = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const result = await get('/notifications/unread-count')
      return result.data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [get])

  const getRecentNotifications = useCallback(async (limit = 10) => {
    try {
      setLoading(true)
      setError(null)
      const result = await get(`/notifications/recent?limit=${limit}`)
      return result.data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [get])

  const getScheduledNotifications = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const result = await get('/notifications/scheduled')
      return result.data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [get])

  const getFailedNotifications = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const result = await get('/notifications/failed')
      return result.data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [get])

  const retryFailedNotification = useCallback(async (notificationId) => {
    try {
      setLoading(true)
      setError(null)
      const result = await post(`/notifications/${notificationId}/retry`)
      return result.data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [post])

  const exportNotifications = useCallback(async (format = 'csv', filters = {}) => {
    try {
      setLoading(true)
      setError(null)
      
      const params = new URLSearchParams({
        format,
        ...filters
      })
      
      const result = await get(`/notifications/export?${params}`)
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
    setNotifications([])
    setError(null)
    setPagination(null)
    setLoading(false)
  }, [])

  useEffect(() => {
    if (enabled) {
      fetchNotifications()
    }
  }, [enabled, fetchNotifications])

  return {
    notifications,
    loading,
    error,
    pagination,
    fetchNotifications,
    createNotification,
    updateNotification,
    deleteNotification,
    bulkUpdateNotifications,
    bulkDeleteNotifications,
    markAllAsRead,
    getNotificationStats,
    getUnreadCount,
    getRecentNotifications,
    getScheduledNotifications,
    getFailedNotifications,
    retryFailedNotification,
    exportNotifications,
    clearError,
    reset
  }
}

export default useNotifications
