import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { FaBell, FaCheck, FaTrash, FaFilter, FaArrowLeft } from "react-icons/fa"
import { HiRefresh } from "react-icons/hi"
import adminService from '../../../services/admin/adminService'
import { useSocket } from '../../../contexts/SocketContext'

const NotificationsList = () => {
  const navigate = useNavigate()
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [pagination, setPagination] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [isRead, setIsRead] = useState('')
  const [type, setType] = useState('')
  const [unreadCount, setUnreadCount] = useState(0)
  const { socket, connected } = useSocket()

  // ✅ ROUTE 1: GET /admin/notifications
  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true)
      const params = {
        page: currentPage,
        limit: 20,
        ...(isRead && { read: isRead === 'true' }),
        ...(type && { type })
      }
      
      const result = await adminService.getNotifications(params)
      if (result.success) {
        setNotifications(result.data || [])
        setPagination(result.pagination || null)
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [currentPage, isRead, type])

  // ✅ ROUTE 2: GET /admin/notifications/unread-count
  const fetchUnreadCount = useCallback(async () => {
    try {
      const result = await adminService.getUnreadNotificationCount()
      if (result.success) {
        setUnreadCount(result.data?.count || 0)
      }
    } catch (error) {
      console.error('Failed to fetch unread count:', error)
    }
  }, [])

  useEffect(() => {
    fetchNotifications()
    fetchUnreadCount()
  }, [fetchNotifications, fetchUnreadCount])

  // 🔥 REAL-TIME: Listen for new notifications via Socket.IO
  useEffect(() => {
    if (!socket || !connected) return;

    const handleNewNotification = (data) => {
      console.log('🔔 [NotificationsList] Real-time notification received:', data);
      
      // Update unread count immediately
      if (data.unreadCount !== undefined) {
        setUnreadCount(data.unreadCount);
      } else {
        setUnreadCount(prev => prev + 1);
      }

      // If notification details provided, add it to the list
      if (data.notification) {
        setNotifications(prev => {
          // Check if on first page and showing all or unread only
          if (currentPage === 1 && (!isRead || isRead === 'false')) {
            // Add new notification at the top
            return [data.notification, ...prev];
          }
          return prev;
        });
      }

      // Show browser notification if permission granted
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(data.notification?.title || 'New Notification', {
          body: data.notification?.message,
          icon: '/favicon.ico',
          badge: '/favicon.ico',
          tag: data.notification?._id
        });
      }
    };

    // Listen for admin notifications
    socket.on('admin:notification:new', handleNewNotification);
    socket.on('notification:new', handleNewNotification); // Fallback

    // Listen for notification read events
    socket.on('admin:notification:read', (data) => {
      console.log('🔔 [NotificationsList] Notification marked as read:', data);
      
      // Update the notification in the list
      if (data.notificationId) {
        setNotifications(prev => prev.map(notif => 
          notif._id === data.notificationId 
            ? { ...notif, read: true, readAt: new Date() }
            : notif
        ));
      }
      
      // Update unread count
      if (data.unreadCount !== undefined) {
        setUnreadCount(data.unreadCount);
      } else {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    });

    // Listen for all read event
    socket.on('admin:notification:all-read', (data) => {
      console.log('🔔 [NotificationsList] All notifications marked as read');
      
      // Update all notifications
      setNotifications(prev => prev.map(notif => ({ 
        ...notif, 
        read: true, 
        readAt: new Date() 
      })));
      
      // Reset unread count
      setUnreadCount(0);
    });

    // Listen for notification deleted event
    socket.on('admin:notification:deleted', (data) => {
      console.log('🔔 [NotificationsList] Notification deleted:', data);
      
      // Remove notification from list
      if (data.notificationId) {
        setNotifications(prev => prev.filter(notif => notif._id !== data.notificationId));
      }
      
      // Update unread count
      if (data.unreadCount !== undefined) {
        setUnreadCount(data.unreadCount);
      }
    });

    // Listen for all notifications deleted event
    socket.on('admin:notification:all-deleted', (data) => {
      console.log('🔔 [NotificationsList] All notifications deleted');
      
      // Clear all notifications
      setNotifications([]);
      setUnreadCount(0);
    });

    // Cleanup
    return () => {
      socket.off('admin:notification:new', handleNewNotification);
      socket.off('notification:new', handleNewNotification);
      socket.off('admin:notification:read');
      socket.off('admin:notification:all-read');
      socket.off('admin:notification:deleted');
      socket.off('admin:notification:all-deleted');
    };
  }, [socket, connected, currentPage, isRead]);

  // Request notification permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  const handleRefresh = () => {
    setRefreshing(true)
    fetchNotifications()
    fetchUnreadCount()
  }

  // ✅ ROUTE 4: PUT /admin/notifications/:id/read
  const handleMarkAsRead = async (notificationId) => {
    try {
      const result = await adminService.markNotificationAsRead(notificationId)
      if (result.success) {
        setNotifications(prev => 
          prev.map(n => n._id === notificationId ? { ...n, read: true, isRead: true } : n)
        )
        fetchUnreadCount() // Refresh count
      }
    } catch (error) {
      console.error('Failed to mark notification as read:', error)
    }
  }

  // ✅ ROUTE 5: PUT /admin/notifications/read-all
  const handleMarkAllAsRead = async () => {
    try {
      const result = await adminService.markAllNotificationsAsRead()
      if (result.success) {
        setNotifications(prev => prev.map(n => ({ ...n, read: true, isRead: true })))
        setUnreadCount(0)
      }
    } catch (error) {
      console.error('Failed to mark all as read:', error)
    }
  }

  // ✅ ROUTE 6: DELETE /admin/notifications/:id
  const handleDelete = async (notificationId) => {
    if (!window.confirm('Are you sure you want to delete this notification?')) return
    
    try {
      const result = await adminService.deleteNotification(notificationId)
      if (result.success) {
        setNotifications(prev => prev.filter(n => n._id !== notificationId))
        fetchUnreadCount() // Refresh count
      }
    } catch (error) {
      console.error('Failed to delete notification:', error)
    }
  }

  // ✅ NEW ROUTE: DELETE /admin/notifications/all
  const handleClearAll = async () => {
    if (!window.confirm('Are you sure you want to delete ALL notifications? This action cannot be undone.')) return
    
    try {
      const result = await adminService.deleteAllNotifications()
      if (result.success) {
        setNotifications([])
        setUnreadCount(0)
      }
    } catch (error) {
      console.error('Failed to clear all notifications:', error)
    }
  }

  const formatTime = (dateString) => {
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

  const getTypeColor = (type) => {
    switch (type) {
      case 'business': return 'bg-purple-100 text-purple-800'
      case 'user': return 'bg-green-100 text-green-800'
      case 'security': return 'bg-red-100 text-red-800'
      case 'payment': return 'bg-yellow-100 text-yellow-800'
      case 'system': return 'bg-gray-100 text-gray-800'
      case 'update': return 'bg-indigo-100 text-indigo-800'
      case 'reminder': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <div className="bg-white rounded-lg p-5 sm:p-6 border border-gray-200">
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
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium text-gray-700"
              >
                <FaArrowLeft className="text-gray-600" />
                <span className="hidden sm:inline">Back</span>
              </button>
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 text-sm font-medium"
              >
                <HiRefresh className={`text-lg ${refreshing ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Refresh</span>
              </button>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium"
                >
                  <FaCheck />
                  <span className="hidden sm:inline">Mark All</span>
                </button>
              )}
              <button
                onClick={handleClearAll}
                disabled={notifications.length === 0}
                className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                title="Delete all notifications permanently"
              >
                <FaTrash />
                <span className="hidden sm:inline">Clear All</span>
                <span className="sm:hidden">{notifications.length}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex items-center gap-2">
            <FaFilter className="text-gray-600" />
            <span className="text-sm font-semibold text-gray-700">Filters</span>
          </div>
          <div className="flex flex-wrap gap-3 flex-1">
            <select
              value={isRead}
              onChange={(e) => setIsRead(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
            >
              <option value="">All Status</option>
              <option value="false">Unread Only</option>
              <option value="true">Read Only</option>
            </select>
            
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
            >
              <option value="">All Types</option>
              <option value="system">System</option>
              <option value="business">Business</option>
              <option value="user">User</option>
              <option value="payment">Payment</option>
              <option value="security">Security</option>
              <option value="update">Update</option>
              <option value="reminder">Reminder</option>
            </select>

            {(isRead || type) && (
              <button
                onClick={() => {
                  setIsRead('')
                  setType('')
                  setCurrentPage(1)
                }}
                className="px-4 py-2 text-sm text-red-600 hover:text-red-700 font-medium"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        {loading ? (
          <div className="p-12 text-center text-gray-500">
            <FaBell className="mx-auto text-4xl mb-4 opacity-30" />
            Loading notifications...
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <FaBell className="mx-auto text-4xl mb-4 opacity-30" />
            No notifications found
          </div>
        ) : (
          <>
            <div className="divide-y divide-gray-200">
              {notifications.map((notification) => {
                const isUnread = !notification.read && !notification.isRead
                return (
                  <div
                    key={notification._id}
                    className={`p-4 hover:bg-gray-50 transition-colors ${
                      isUnread ? 'bg-blue-50/50' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        {/* Read Indicator */}
                        <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                          isUnread ? 'bg-blue-500' : 'bg-gray-300'
                        }`}></div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <h3 className={`text-sm ${isUnread ? 'font-semibold' : 'font-medium'} text-gray-900`}>
                              {notification.title}
                            </h3>
                            {notification.type && (
                              <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getTypeColor(notification.type)}`}>
                                {notification.type}
                              </span>
                            )}
                            {notification.priority && (
                              <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getPriorityColor(notification.priority)}`}>
                                {notification.priority}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{notification.message}</p>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span>{formatTime(notification.createdAt)}</span>
                            {notification.actionUrl && (
                              <a href={notification.actionUrl} className="text-blue-600 hover:underline">
                                {notification.actionText || 'View Details'}
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {/* Actions */}
                      <div className="flex items-center gap-2 ml-4 flex-shrink-0">
                        {isUnread && (
                          <button
                            onClick={() => handleMarkAsRead(notification._id)}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Mark as read"
                          >
                            <FaCheck />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(notification._id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="flex items-center justify-between p-4 border-t border-gray-200">
                <div className="text-sm text-gray-600">
                  Showing {((currentPage - 1) * 20) + 1} to {Math.min(currentPage * 20, pagination.total)} of {pagination.total} notifications
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <span className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-50 border border-gray-300 rounded-md">
                    Page {currentPage} of {pagination.totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(prev => prev + 1)}
                    disabled={currentPage >= pagination.totalPages}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
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

export default NotificationsList

