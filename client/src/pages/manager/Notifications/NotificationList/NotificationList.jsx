import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { FaBell, FaCheck, FaTrash, FaFilter, FaArrowLeft, FaExclamationCircle, FaInfoCircle, FaCalendarAlt, FaCheckDouble, FaBug, FaSpinner, FaEye } from "react-icons/fa"
import { HiRefresh, HiOutlineX } from "react-icons/hi"
import managerService from '../../../../services/manager/managerService'
import { useSocket } from '../../../../contexts/SocketContext'
import { toast } from 'react-hot-toast'

const NotificationList = () => {
  const navigate = useNavigate()
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 0 })
  const [isRead, setIsRead] = useState('')
  const [unreadCount, setUnreadCount] = useState(0)
  const { socket, connected } = useSocket()

  // Refs for optimization
  const abortControllerRef = useRef(null)
  const debounceTimeoutRef = useRef(null)

  // Fetch Notifications
  const fetchNotifications = useCallback(async (page = 1) => {
    // Cancel previous request if exists
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    abortControllerRef.current = new AbortController()

    try {
      if (page === 1) setLoading(true) // Only full loader for first page/refresh

      const params = {
        page: page,
        limit: pagination.limit || 20,
        isRead: isRead === 'true' ? true : isRead === 'false' ? false : undefined
      }

      const result = await managerService.getAlerts(params, {
        signal: abortControllerRef.current.signal
      })

      if (result.success) {
        setNotifications(result.data.data || [])
        setPagination({
          page: result.data.pagination?.page || 1,
          limit: result.data.pagination?.limit || 20,
          total: result.data.pagination?.total || 0,
          pages: result.data.pagination?.pages || 0
        })
        if (result.data.unreadCount !== undefined) {
          setUnreadCount(result.data.unreadCount)
        }
      }
    } catch (error) {
      if (error.name === 'CanceledError' || error.message === 'canceled') {
        // Request was canceled, do nothing
        return;
      }
      console.error('Failed to fetch notifications:', error)
      toast.error('Failed to load notifications')
    } finally {
      // Only update loading state if this is the ACTIVE request (not canceled)
      if (abortControllerRef.current && !abortControllerRef.current.signal.aborted) {
        setLoading(false)
        setRefreshing(false)
        abortControllerRef.current = null
      }
    }
  }, [pagination.limit, isRead])

  // Initial Fetch
  useEffect(() => {
    fetchNotifications(1)

    return () => {
      // Cleanup on unmount
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [fetchNotifications])

  // Real-time updates with Debounce
  useEffect(() => {
    if (!socket || !connected) return;

    const handleNewAppointment = (data) => {
      // Clear existing timeout
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current)
      }

      // Set new timeout (debounce 1s)
      debounceTimeoutRef.current = setTimeout(() => {
        // toast.success(`New Updates Available`); // Optional: notify user
        fetchNotifications(1);
      }, 1000)
    };

    socket.on('new_appointment', handleNewAppointment);
    socket.on('appointment_updated', handleNewAppointment);
    socket.on('appointment_cancelled', handleNewAppointment);

    return () => {
      if (debounceTimeoutRef.current) clearTimeout(debounceTimeoutRef.current)
      socket.off('new_appointment', handleNewAppointment);
      socket.off('appointment_updated', handleNewAppointment);
      socket.off('appointment_cancelled', handleNewAppointment);
    };
  }, [socket, connected, fetchNotifications])

  const handleRefresh = () => {
    setRefreshing(true)
    fetchNotifications(pagination.page)
  }

  const handleMarkAsRead = async (notificationId) => {
    try {
      await managerService.markAlertAsRead(notificationId)
      // Optimistic update
      setNotifications(prev =>
        prev.map(n => n._id === notificationId ? { ...n, isRead: true } : n)
      )
      setUnreadCount(prev => Math.max(0, prev - 1))
      toast.success('Marked as read')
    } catch (error) {
      console.error('Failed to mark as read:', error)
      toast.error('Failed to mark as read')
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      setRefreshing(true)
      await managerService.markAllAlertsAsRead()
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
      setUnreadCount(0)
      toast.success('All marked as read')
      setRefreshing(false)
    } catch (error) {
      console.error('Failed to mark all as read:', error)
      toast.error('Failed to update notifications')
      setRefreshing(false)
    }
  }

  const handleNotificationClick = async (notification) => {
    // 1. Mark as read if needed
    if (!notification.isRead) {
      try {
        managerService.markAlertAsRead(notification._id);
        setNotifications(prev =>
          prev.map(n => n._id === notification._id ? { ...n, isRead: true } : n)
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      } catch (err) { console.error(err); }
    }

    // 2. Navigate
    const appointmentId = notification.relatedAppointment || notification.appointmentId;

    if (appointmentId) {
      navigate(`/manager/appointments/${appointmentId}`);
    } else if (notification.actionUrl) {
      if (notification.actionUrl.startsWith('http')) {
        window.location.href = notification.actionUrl;
      } else {
        navigate(notification.actionUrl);
      }
    }
  }

  const handleCreateTest = async () => {
    const res = await managerService.createTestNotification();
    if (res.success) {
      toast.success("Test notification created!");
      fetchNotifications(1);
    } else {
      toast.error("Failed to create test: " + res.error);
    }
  }

  const formatTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = Math.floor((now - date) / 1000)

    if (diffInSeconds < 60) {
      return 'Just now'
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60)
      return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600)
      return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`
    } else if (diffInSeconds < 604800) {
      const days = Math.floor(diffInSeconds / 86400)
      return `${days} ${days === 1 ? 'day' : 'days'} ago`
    } else {
      return date.toLocaleDateString()
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200'
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'normal': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'low': return 'bg-gray-100 text-gray-800 border-gray-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <div className="bg-white p-5 sm:p-6 border border-gray-200 rounded-lg shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
                  <FaBell className="text-white text-lg" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Notifications</h1>
                  <p className="text-xs sm:text-sm text-gray-500">
                    {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg text-sm font-medium text-gray-700 disabled:opacity-50"
              >
                <HiRefresh className={`text-lg ${refreshing ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Refresh</span>
              </button>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-primary-600 text-white hover:bg-primary-700 rounded-lg text-sm font-medium"
                >
                  <FaCheckDouble />
                  <span className="hidden sm:inline">Mark All Read</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-5 mb-6 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex items-center gap-2">
            <FaFilter className="text-gray-600" />
            <span className="text-sm font-semibold text-gray-700">Filters</span>
          </div>
          <div className="flex flex-wrap gap-3 flex-1 w-full sm:w-auto">
            <select
              value={isRead}
              onChange={(e) => {
                setIsRead(e.target.value)
                setPagination(prev => ({ ...prev, page: 1 }))
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm bg-white"
            >
              <option value="">All Status</option>
              <option value="false">Unread Only</option>
              <option value="true">Read Only</option>
            </select>

            {(isRead) && (
              <button
                onClick={() => {
                  setIsRead('')
                  setPagination(prev => ({ ...prev, page: 1 }))
                }}
                className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:text-red-700 font-medium hover:bg-red-50 rounded-lg transition-colors"
              >
                <HiOutlineX className="text-base" />
                Clear Filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
        {loading && notifications.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <FaSpinner className="animate-spin w-8 h-8 text-primary-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading notifications...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <FaBell className="mx-auto text-5xl mb-4 opacity-20 text-gray-400" />
            <p className="text-gray-600 font-medium">No notifications found</p>
            <p className="text-sm text-gray-500 mt-2">
              {isRead ? 'Try adjusting your filters' : 'You\'re all caught up!'}
            </p>
          </div>
        ) : (
          <>
            <div className="divide-y divide-gray-200">
              {notifications.map((notification) => {
                const isUnread = !notification.isRead
                const isClickable = notification.relatedAppointment || notification.appointmentId || notification.actionUrl;

                return (
                  <div
                    key={notification._id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`p-4 sm:p-5 hover:bg-gray-50 transition-all duration-200 border-l-4 ${isUnread
                      ? 'bg-blue-50/30 border-l-blue-500'
                      : 'border-l-transparent'
                      } ${isClickable ? 'cursor-pointer' : ''}`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        {/* Icon */}
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${isUnread
                          ? 'bg-blue-100 text-blue-600'
                          : 'bg-gray-100 text-gray-500'
                          }`}>
                          {notification.type === 'appointment' ? <FaCalendarAlt /> : <FaBell />}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div className="flex-1 min-w-0">
                              <h3 className={`text-base ${isUnread ? 'font-semibold' : 'font-medium'} text-gray-900 mb-1`}>
                                {notification.title}
                              </h3>
                              <p className="text-sm text-gray-600 leading-relaxed">{notification.message}</p>
                            </div>
                            {isUnread && (
                              <span className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0 mt-1"></span>
                            )}
                          </div>

                          <div className="flex items-center gap-3 flex-wrap mt-3">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${getPriorityColor(notification.priority || 'normal')}`}>
                              {notification.priority || 'normal'}
                            </span>
                            <span className="text-xs text-gray-500">
                              {formatTime(notification.createdAt)}
                            </span>
                            {isClickable && (
                              <span className="text-xs text-primary-600 flex items-center gap-1 font-medium">
                                <FaEye className="text-[10px]" /> View Details
                              </span>
                            )}
                          </div>

                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1 flex-shrink-0">
                        {isUnread && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMarkAsRead(notification._id);
                            }}
                            className="p-2.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors z-10"
                            title="Mark as read"
                          >
                            <FaCheck className="text-sm" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 sm:p-5 border-t border-gray-200 bg-gray-50">
                <div className="text-sm text-gray-600">
                  Page {pagination.page} of {pagination.pages}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => fetchNotifications(pagination.page - 1)}
                    disabled={pagination.page === 1}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => fetchNotifications(pagination.page + 1)}
                    disabled={pagination.page >= pagination.pages}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default NotificationList
