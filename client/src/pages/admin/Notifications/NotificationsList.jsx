import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { FaBell, FaCheck, FaTrash, FaFilter, FaArrowLeft, FaExclamationCircle, FaInfoCircle } from "react-icons/fa"
import { HiRefresh, HiOutlineX } from "react-icons/hi"
import adminService from '../../../services/admin/adminService'
import { useSocket } from '../../../contexts/SocketContext'
import { toast } from 'react-hot-toast'

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
        ...(isRead && { isRead: isRead === 'true' }),
        ...(type && { type })
      }
      
      const result = await adminService.getNotifications(params)
      if (result.success) {
        setNotifications(result.data || [])
        setPagination(result.pagination || null)
        if (result.unreadCount !== undefined) {
          setUnreadCount(result.unreadCount)
        }
      } else {
        toast.error(result.error || 'Failed to fetch notifications')
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error)
      toast.error('Failed to fetch notifications')
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
        if (result.unreadCount !== undefined) {
          setUnreadCount(result.unreadCount)
        } else {
          fetchUnreadCount() // Refresh count
        }
        toast.success('Notification marked as read')
      } else {
        toast.error(result.error || 'Failed to mark notification as read')
      }
    } catch (error) {
      console.error('Failed to mark notification as read:', error)
      toast.error('Failed to mark notification as read')
    }
  }

  // ✅ ROUTE 5: PUT /admin/notifications/read-all
  const handleMarkAllAsRead = async () => {
    try {
      const result = await adminService.markAllNotificationsAsRead()
      if (result.success) {
        setNotifications(prev => prev.map(n => ({ ...n, read: true, isRead: true })))
        setUnreadCount(0)
        toast.success('All notifications marked as read')
      } else {
        toast.error(result.error || 'Failed to mark all notifications as read')
      }
    } catch (error) {
      console.error('Failed to mark all as read:', error)
      toast.error('Failed to mark all notifications as read')
    }
  }

  // ✅ ROUTE 6: DELETE /admin/notifications/:id
  const handleDelete = async (notificationId) => {
    if (!window.confirm('Are you sure you want to delete this notification?')) return
    
    try {
      const result = await adminService.deleteNotification(notificationId)
      if (result.success) {
        setNotifications(prev => prev.filter(n => n._id !== notificationId))
        if (result.unreadCount !== undefined) {
          setUnreadCount(result.unreadCount)
        } else {
          fetchUnreadCount() // Refresh count
        }
        toast.success('Notification deleted')
      } else {
        toast.error(result.error || 'Failed to delete notification')
      }
    } catch (error) {
      console.error('Failed to delete notification:', error)
      toast.error('Failed to delete notification')
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
        setCurrentPage(1)
        toast.success('All notifications cleared')
      } else {
        toast.error(result.error || 'Failed to clear all notifications')
      }
    } catch (error) {
      console.error('Failed to clear all notifications:', error)
      toast.error('Failed to clear all notifications')
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
        <div className="bg-white  p-5 sm:p-6 border border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-primary-600  flex items-center justify-center">
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
                className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-white border border-gray-300  hover:bg-gray-50 text-sm font-medium text-gray-700"
              >
                <FaArrowLeft className="text-gray-600" />
                <span className="hidden sm:inline">Back</span>
              </button>
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-primary-600 text-white  hover:bg-primary-700 disabled:opacity-50 text-sm font-medium"
              >
                <HiRefresh className={`text-lg ${refreshing ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Refresh</span>
              </button>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-green-600 text-white  hover:bg-green-700 text-sm font-medium"
                >
                  <FaCheck />
                  <span className="hidden sm:inline">Mark All</span>
                </button>
              )}
              <button
                onClick={handleClearAll}
                disabled={notifications.length === 0}
                className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-red-600 text-white  hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
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
      <div className="bg-white   border border-gray-200 p-4 sm:p-5 mb-6">
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
                setCurrentPage(1)
              }}
              className="px-4 py-2 border border-gray-300  focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm bg-white"
            >
              <option value="">All Status</option>
              <option value="false">Unread Only</option>
              <option value="true">Read Only</option>
            </select>
            
            <select
              value={type}
              onChange={(e) => {
                setType(e.target.value)
                setCurrentPage(1)
              }}
              className="px-4 py-2 border border-gray-300  focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm bg-white"
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
                className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:text-red-700 font-medium hover:bg-red-50  transition-colors"
              >
                <HiOutlineX className="text-base" />
                Clear Filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="bg-white   border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-500">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading notifications...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <FaBell className="mx-auto text-5xl mb-4 opacity-20 text-gray-400" />
            <p className="text-gray-600 font-medium">No notifications found</p>
            <p className="text-sm text-gray-500 mt-2">
              {(isRead || type) ? 'Try adjusting your filters' : 'You\'re all caught up!'}
            </p>
          </div>
        ) : (
          <>
            <div className="divide-y divide-gray-200">
              {notifications.map((notification) => {
                const isUnread = !notification.read && !notification.isRead
                return (
                  <div
                    key={notification._id || notification.id}
                    className={`p-4 sm:p-5 hover:bg-gray-50 transition-all duration-200 border-l-4 ${
                      isUnread 
                        ? 'bg-blue-50/30 border-l-blue-500' 
                        : 'border-l-transparent'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        {/* Icon based on type */}
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                          isUnread 
                            ? 'bg-blue-100 text-blue-600' 
                            : 'bg-gray-100 text-gray-500'
                        }`}>
                          {notification.type === 'security' ? (
                            <FaExclamationCircle className="text-sm" />
                          ) : notification.type === 'payment' ? (
                            <FaInfoCircle className="text-sm" />
                          ) : (
                            <FaBell className="text-sm" />
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div className="flex-1 min-w-0">
                              <h3 className={`text-base ${isUnread ? 'font-semibold' : 'font-medium'} text-gray-900 mb-1`}>
                                {notification.title || 'Notification'}
                              </h3>
                              <p className="text-sm text-gray-600 leading-relaxed">{notification.message || notification.body || 'No message'}</p>
                            </div>
                            {isUnread && (
                              <span className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0 mt-1"></span>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-3 flex-wrap mt-3">
                            {notification.type && (
                              <span className={`px-2.5 py-1  text-xs font-medium ${getTypeColor(notification.type)}`}>
                                {notification.type}
                              </span>
                            )}
                            {notification.priority && (
                              <span className={`px-2.5 py-1  text-xs font-medium border ${getPriorityColor(notification.priority)}`}>
                                {notification.priority}
                              </span>
                            )}
                            <span className="text-xs text-gray-500">
                              {formatTime(notification.createdAt || notification.createdAt)}
                            </span>
                            {notification.relatedBusiness && (
                              <span className="text-xs text-gray-500">
                                • {notification.relatedBusiness.name || 'Business'}
                              </span>
                            )}
                          </div>
                          
                          {notification.actionUrl && (
                            <div className="mt-3">
                              <a 
                                href={notification.actionUrl} 
                                className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium hover:underline"
                              >
                                {notification.actionText || 'View Details'}
                                <span>→</span>
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Actions */}
                      <div className="flex items-center gap-1 flex-shrink-0">
                        {isUnread && (
                          <button
                            onClick={() => handleMarkAsRead(notification._id || notification.id)}
                            className="p-2.5 text-green-600 hover:bg-green-50  transition-colors"
                            title="Mark as read"
                          >
                            <FaCheck className="text-sm" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(notification._id || notification.id)}
                          className="p-2.5 text-red-600 hover:bg-red-50  transition-colors"
                          title="Delete"
                        >
                          <FaTrash className="text-sm" />
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 sm:p-5 border-t border-gray-200 bg-gray-50">
                <div className="text-sm text-gray-600">
                  Showing <span className="font-medium">{((currentPage - 1) * (pagination.limit || 20)) + 1}</span> to{' '}
                  <span className="font-medium">{Math.min(currentPage * (pagination.limit || 20), pagination.total)}</span> of{' '}
                  <span className="font-medium">{pagination.total}</span> notifications
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300  hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Previous
                  </button>
                  <span className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 ">
                    Page {currentPage} of {pagination.totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, pagination.totalPages))}
                    disabled={currentPage >= pagination.totalPages}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300  hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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

