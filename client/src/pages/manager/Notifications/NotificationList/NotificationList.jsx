import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import {
  FaBell,
  FaPlus,
  FaSearch,
  FaFilter,
  FaEye,
  FaPaperPlane,
  FaChartLine,
  FaCalendarAlt,
  FaSpinner,
  FaEnvelope,
  FaSms,
  FaWhatsapp,
  FaMobileAlt
} from 'react-icons/fa'
import managerService from '../../../../services/manager/managerService'

const NotificationList = () => {
  const navigate = useNavigate()
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [dateRange, setDateRange] = useState({ start: '', end: '' })
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 0 })
  const [sendingNotification, setSendingNotification] = useState(null)

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true)
      const params = {
        page: pagination.page,
        limit: pagination.limit
      }
      
      if (statusFilter) params.status = statusFilter
      if (typeFilter) params.type = typeFilter
      if (dateRange.start) params.startDate = dateRange.start
      if (dateRange.end) params.endDate = dateRange.end

      const result = await managerService.getNotifications(params)
      
      if (result.success) {
        setNotifications(result.data.data || [])
        setPagination(prev => ({
          ...prev,
          total: result.data.pagination?.total || 0,
          pages: result.data.pagination?.pages || 0
        }))
      } else {
        toast.error(result.error || 'Failed to fetch notifications')
      }
    } catch (error) {
      toast.error('Failed to fetch notifications')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }, [pagination.page, pagination.limit, statusFilter, typeFilter, dateRange])

  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

  // Real-time updates - refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (!loading) {
        fetchNotifications()
      }
    }, 30000)

    return () => clearInterval(interval)
  }, [fetchNotifications, loading])

  const handleSendNotification = async (notificationId) => {
    if (!window.confirm('Are you sure you want to send this notification?')) {
      return
    }

    try {
      setSendingNotification(notificationId)
      const result = await managerService.sendNotification(notificationId)
      
      if (result.success) {
        toast.success('Notification sent successfully!')
        fetchNotifications() // Refresh list
      } else {
        toast.error(result.error || 'Failed to send notification')
      }
    } catch (error) {
      toast.error('Failed to send notification')
      console.error(error)
    } finally {
      setSendingNotification(null)
    }
  }

  const getStatusBadge = (status) => {
    const badges = {
      draft: 'bg-gray-100 text-gray-800',
      scheduled: 'bg-blue-100 text-blue-800',
      sending: 'bg-yellow-100 text-yellow-800',
      sent: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
      cancelled: 'bg-gray-100 text-gray-800'
    }
    return badges[status] || badges.draft
  }

  const getTypeIcon = (type) => {
    const icons = {
      promotion: <FaBell className="text-purple-600" />,
      reminder: <FaCalendarAlt className="text-blue-600" />,
      announcement: <FaEnvelope className="text-green-600" />,
      offer: <FaBell className="text-orange-600" />,
      event: <FaCalendarAlt className="text-red-600" />,
      appointment: <FaCalendarAlt className="text-indigo-600" />,
      general: <FaBell className="text-gray-600" />
    }
    return icons[type] || icons.general
  }

  const getChannelIcon = (channel) => {
    const icons = {
      email: <FaEnvelope className="text-blue-500" />,
      sms: <FaSms className="text-green-500" />,
      whatsapp: <FaWhatsapp className="text-green-600" />,
      push: <FaMobileAlt className="text-purple-500" />
    }
    return icons[channel] || <FaEnvelope />
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const filteredNotifications = notifications.filter(notif => {
    if (searchTerm) {
      const search = searchTerm.toLowerCase()
      return (
        notif.title?.toLowerCase().includes(search) ||
        notif.message?.toLowerCase().includes(search)
      )
    }
    return true
  })

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FaBell className="text-primary-600" />
            Notifications
          </h1>
          <p className="text-gray-600 mt-1">Manage and send notifications to customers</p>
        </div>
        <button
          onClick={() => navigate('/manager/notifications/create')}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white  hover:bg-primary-700 transition-colors"
        >
          <FaPlus />
          Create Notification
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white   border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search notifications..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300  focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300  focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">All Status</option>
            <option value="draft">Draft</option>
            <option value="scheduled">Scheduled</option>
            <option value="sending">Sending</option>
            <option value="sent">Sent</option>
            <option value="failed">Failed</option>
            <option value="cancelled">Cancelled</option>
          </select>

          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300  focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">All Types</option>
            <option value="promotion">Promotion</option>
            <option value="reminder">Reminder</option>
            <option value="announcement">Announcement</option>
            <option value="offer">Offer</option>
            <option value="event">Event</option>
            <option value="appointment">Appointment</option>
            <option value="general">General</option>
          </select>

          {/* Date Range */}
          <div className="flex gap-2">
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
              className="flex-1 px-4 py-2 border border-gray-300  focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
              className="flex-1 px-4 py-2 border border-gray-300  focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="bg-white   border border-gray-200">
        {loading ? (
          <div className="p-12 text-center">
            <FaSpinner className="animate-spin mx-auto text-primary-600 text-3xl mb-4" />
            <p className="text-gray-600">Loading notifications...</p>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="p-12 text-center">
            <FaBell className="mx-auto text-gray-400 text-4xl mb-4" />
            <p className="text-gray-600">No notifications found</p>
            <button
              onClick={() => navigate('/manager/notifications/create')}
              className="mt-4 text-primary-600 hover:text-primary-700"
            >
              Create your first notification
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredNotifications.map((notification) => (
              <div
                key={notification._id}
                className="p-6 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {getTypeIcon(notification.type)}
                      <h3 className="text-lg font-semibold text-gray-900">
                        {notification.title}
                      </h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(notification.status)}`}>
                        {notification.status}
                      </span>
                    </div>
                    
                    <p className="text-gray-600 mb-3">{notification.message}</p>
                    
                    <div className="flex items-center gap-6 text-sm text-gray-500">
                      {/* Delivery Channels */}
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Channels:</span>
                        <div className="flex gap-2">
                          {notification.delivery?.channels?.map((channel, idx) => (
                            <div key={idx} className="flex items-center gap-1">
                              {getChannelIcon(channel)}
                              <span className="text-xs">{channel}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="flex items-center gap-4">
                        <span>
                          <strong>{notification.stats?.totalRecipients || 0}</strong> recipients
                        </span>
                        {notification.stats?.sent > 0 && (
                          <span className="text-green-600">
                            <strong>{notification.stats.sent}</strong> sent
                          </span>
                        )}
                        {notification.stats?.failed > 0 && (
                          <span className="text-red-600">
                            <strong>{notification.stats.failed}</strong> failed
                          </span>
                        )}
                      </div>

                      {/* Date */}
                      <span>{formatDate(notification.createdAt)}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 ml-4">
                    {notification.status === 'draft' && (
                      <button
                        onClick={() => handleSendNotification(notification._id)}
                        disabled={sendingNotification === notification._id}
                        className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white  hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {sendingNotification === notification._id ? (
                          <FaSpinner className="animate-spin" />
                        ) : (
                          <FaPaperPlane />
                        )}
                        Send
                      </button>
                    )}
                    
                    <button
                      onClick={() => navigate(`/manager/notifications/${notification._id}/analytics`)}
                      className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700  hover:bg-gray-50 transition-colors"
                    >
                      <FaChartLine />
                      Analytics
                    </button>
                    
                    <button
                      onClick={() => navigate(`/manager/notifications/${notification._id}`)}
                      className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700  hover:bg-gray-50 transition-colors"
                    >
                      <FaEye />
                      View
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {!loading && pagination.pages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
              {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
              {pagination.total} notifications
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                disabled={pagination.page === 1}
                className="px-4 py-2 border border-gray-300  hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="px-4 py-2 text-sm text-gray-700">
                Page {pagination.page} of {pagination.pages}
              </span>
              <button
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                disabled={pagination.page >= pagination.pages}
                className="px-4 py-2 border border-gray-300  hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default NotificationList
