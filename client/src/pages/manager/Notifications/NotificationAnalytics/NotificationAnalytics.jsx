import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import {
  FaArrowLeft,
  FaChartLine,
  FaUsers,
  FaEnvelope,
  FaCheckCircle,
  FaTimesCircle,
  FaSpinner,
  FaEye,
  FaMousePointer,
  FaDollarSign,
  FaCalendarCheck
} from 'react-icons/fa'
import managerService from '../../../../services/manager/managerService'

const NotificationAnalytics = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const [loading, setLoading] = useState(true)
  const [analytics, setAnalytics] = useState(null)
  const [notification, setNotification] = useState(null)

  useEffect(() => {
    fetchAnalytics()
  }, [id])

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      const result = await managerService.getNotificationAnalytics(id)
      
      if (result.success) {
        setAnalytics(result.data.data)
        // Also fetch notification details
        const notifResult = await managerService.getNotifications({})
        if (notifResult.success) {
          const notif = notifResult.data.data.find(n => n._id === id)
          setNotification(notif)
        }
      } else {
        toast.error(result.error || 'Failed to fetch analytics')
        navigate('/manager/notifications')
      }
    } catch (error) {
      toast.error('Failed to fetch analytics')
      console.error(error)
      navigate('/manager/notifications')
    } finally {
      setLoading(false)
    }
  }

  // Real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      if (id) {
        fetchAnalytics()
      }
    }, 30000) // Refresh every 30 seconds

    return () => clearInterval(interval)
  }, [id])

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0)
  }

  const formatPercentage = (value) => {
    return `${(value || 0).toFixed(2)}%`
  }

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <FaSpinner className="animate-spin mx-auto text-primary-600 text-4xl mb-4" />
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    )
  }

  if (!analytics) {
    return (
      <div className="p-6">
        <p className="text-gray-600">No analytics data available</p>
      </div>
    )
  }

  const { overview, performance, deliveries } = analytics

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/manager/notifications')}
            className="p-2 hover:bg-gray-100  transition-colors"
          >
            <FaArrowLeft className="text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <FaChartLine className="text-primary-600" />
              Notification Analytics
            </h1>
            {notification && (
              <p className="text-gray-600 mt-1">{notification.title}</p>
            )}
          </div>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white   border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Total Recipients</span>
            <FaUsers className="text-blue-500" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{overview.totalRecipients || 0}</p>
        </div>

        <div className="bg-white   border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Sent</span>
            <FaEnvelope className="text-green-500" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{overview.sent || 0}</p>
          <p className="text-sm text-gray-500 mt-1">
            {formatPercentage(overview.deliveryRate)} delivery rate
          </p>
        </div>

        <div className="bg-white   border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Delivered</span>
            <FaCheckCircle className="text-blue-500" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{overview.delivered || 0}</p>
        </div>

        <div className="bg-white   border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Failed</span>
            <FaTimesCircle className="text-red-500" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{overview.failed || 0}</p>
        </div>
      </div>

      {/* Engagement Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white   border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Opened</span>
            <FaEye className="text-purple-500" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{overview.opened || 0}</p>
          <p className="text-sm text-gray-500 mt-1">
            {formatPercentage(performance.openRate)} open rate
          </p>
        </div>

        <div className="bg-white   border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Clicked</span>
            <FaMousePointer className="text-indigo-500" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{overview.clicked || 0}</p>
          <p className="text-sm text-gray-500 mt-1">
            {formatPercentage(performance.clickRate)} click rate
          </p>
        </div>

        <div className="bg-white   border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Engagement</span>
            <FaChartLine className="text-primary-500" />
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {formatPercentage(overview.engagementRate)}
          </p>
          <p className="text-sm text-gray-500 mt-1">Overall engagement</p>
        </div>

        <div className="bg-white   border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Conversions</span>
            <FaCalendarCheck className="text-green-500" />
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {formatPercentage(performance.conversionRate)}
          </p>
          <p className="text-sm text-gray-500 mt-1">Conversion rate</p>
        </div>
      </div>

      {/* Performance Metrics */}
      {(performance.revenue > 0 || performance.newBookings > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white   border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <FaDollarSign className="text-green-500" />
                Revenue Generated
              </h3>
            </div>
            <p className="text-3xl font-bold text-green-600">
              {formatCurrency(performance.revenue)}
            </p>
            <p className="text-sm text-gray-500 mt-2">
              From this notification campaign
            </p>
          </div>

          <div className="bg-white   border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <FaCalendarCheck className="text-blue-500" />
                New Bookings
              </h3>
            </div>
            <p className="text-3xl font-bold text-blue-600">
              {performance.newBookings || 0}
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Bookings generated from this notification
            </p>
          </div>
        </div>
      )}

      {/* Delivery Details */}
      {deliveries && deliveries.length > 0 && (
        <div className="bg-white   border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Delivery Details</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Customer</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Channel</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Sent At</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Delivered At</th>
                  {deliveries.some(d => d.failureReason) && (
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Failure Reason</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {deliveries.slice(0, 50).map((delivery, index) => (
                  <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm text-gray-900">
                      {delivery.customer?.name || delivery.customer?.email || 'Unknown'}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600 capitalize">
                      {delivery.channel}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                        delivery.status === 'sent' || delivery.status === 'delivered' || delivery.status === 'opened' || delivery.status === 'clicked'
                          ? 'bg-green-100 text-green-800'
                          : delivery.status === 'failed' || delivery.status === 'bounced'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {delivery.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {delivery.sentAt 
                        ? new Date(delivery.sentAt).toLocaleString()
                        : '-'}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {delivery.deliveredAt 
                        ? new Date(delivery.deliveredAt).toLocaleString()
                        : '-'}
                    </td>
                    {deliveries.some(d => d.failureReason) && (
                      <td className="py-3 px-4 text-sm text-red-600">
                        {delivery.failureReason || '-'}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
            {deliveries.length > 50 && (
              <p className="text-sm text-gray-500 mt-4 px-4">
                Showing first 50 of {deliveries.length} deliveries
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default NotificationAnalytics

