import React from 'react'
import { Card, Button, Badge, StatusBadge } from '../../common'

const NotificationCard = ({ 
  notification,
  onMarkAsRead,
  onMarkAsUnread,
  onDelete,
  onViewDetails,
  onResend,
  showActions = true,
  className = ''
}) => {
  const {
    id,
    title,
    message,
    type,
    priority,
    status,
    recipientType,
    recipients,
    sentAt,
    readAt,
    deliveryStatus,
    campaignId,
    businessId,
    createdBy,
    metadata = {}
  } = notification

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    })
  }

  const getTimeAgo = (dateString) => {
    const now = new Date()
    const date = new Date(dateString)
    const diffInMinutes = Math.floor((now - date) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
    return `${Math.floor(diffInMinutes / 1440)}d ago`
  }

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'appointment':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        )
      case 'payment':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
          </svg>
        )
      case 'reminder':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4.828 7l2.586 2.586a2 2 0 002.828 0L12 7l-2.586-2.586a2 2 0 00-2.828 0L4.828 7z" />
          </svg>
        )
      case 'promotion':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
          </svg>
        )
      case 'system':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          </svg>
        )
      case 'alert':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        )
      default:
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4.828 7l2.586 2.586a2 2 0 002.828 0L12 7l-2.586-2.586a2 2 0 00-2.828 0L4.828 7z" />
          </svg>
        )
    }
  }

  const getTypeColor = (type) => {
    switch (type) {
      case 'appointment': return 'blue'
      case 'payment': return 'green'
      case 'reminder': return 'yellow'
      case 'promotion': return 'purple'
      case 'system': return 'gray'
      case 'alert': return 'red'
      default: return 'default'
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'danger'
      case 'medium': return 'warning'
      case 'low': return 'info'
      default: return 'default'
    }
  }

  const getDeliveryStatusColor = (status) => {
    switch (status) {
      case 'delivered': return 'success'
      case 'pending': return 'warning'
      case 'failed': return 'danger'
      case 'sent': return 'info'
      default: return 'default'
    }
  }

  const isRead = readAt !== null
  const isUnread = !isRead

  return (
    <Card className={`hover:shadow-lg transition-shadow ${isUnread ? 'border-l-4 border-l-primary-500' : ''} ${className}`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-3 flex-1">
          {/* Icon */}
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
            getTypeColor(type) === 'blue' ? 'bg-blue-100 text-blue-600' :
            getTypeColor(type) === 'green' ? 'bg-green-100 text-green-600' :
            getTypeColor(type) === 'yellow' ? 'bg-yellow-100 text-yellow-600' :
            getTypeColor(type) === 'purple' ? 'bg-purple-100 text-purple-600' :
            getTypeColor(type) === 'red' ? 'bg-red-100 text-red-600' :
            'bg-gray-100 text-gray-600'
          }`}>
            {getNotificationIcon(type)}
          </div>
          
          {/* Content */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className={`text-lg font-semibold ${isUnread ? 'text-gray-900' : 'text-gray-700'}`}>
                {title}
              </h3>
              <Badge variant={getTypeColor(type)} size="sm">
                {type}
              </Badge>
              <Badge variant={getPriorityColor(priority)} size="sm">
                {priority}
              </Badge>
            </div>
            <p className={`text-sm ${isUnread ? 'text-gray-700' : 'text-gray-500'} line-clamp-2`}>
              {message}
            </p>
          </div>
        </div>
        
        {/* Status and Time */}
        <div className="text-right">
          <StatusBadge 
            status={deliveryStatus} 
            size="sm"
            className="mb-1"
          />
          <p className="text-xs text-gray-500">
            {getTimeAgo(sentAt)}
          </p>
        </div>
      </div>

      {/* Metadata */}
      <div className="mb-4 grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-gray-500">Recipients</p>
          <p className="font-medium text-gray-900">
            {recipientType === 'all' ? 'All Customers' : 
             recipientType === 'specific' ? `${recipients?.length || 0} customers` :
             recipientType === 'segment' ? 'Customer Segment' : 'N/A'}
          </p>
        </div>
        <div>
          <p className="text-gray-500">Sent</p>
          <p className="font-medium text-gray-900">
            {formatDate(sentAt)} at {formatTime(sentAt)}
          </p>
        </div>
      </div>

      {/* Read Status */}
      {isRead && (
        <div className="mb-4 p-2 bg-green-50 border border-green-200 rounded">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm text-green-700">
              Read on {formatDate(readAt)} at {formatTime(readAt)}
            </span>
          </div>
        </div>
      )}

      {/* Additional Metadata */}
      {metadata && Object.keys(metadata).length > 0 && (
        <div className="mb-4 p-3 bg-gray-50 ">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Additional Information</h4>
          <div className="space-y-1">
            {Object.entries(metadata).map(([key, value]) => (
              <div key={key} className="flex justify-between text-sm">
                <span className="text-gray-600 capitalize">{key.replace(/([A-Z])/g, ' $1')}:</span>
                <span className="text-gray-900">{value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      {showActions && (
        <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-200">
          {onViewDetails && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => onViewDetails(notification)}
            >
              View Details
            </Button>
          )}
          {onMarkAsRead && isUnread && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onMarkAsRead(notification)}
            >
              Mark as Read
            </Button>
          )}
          {onMarkAsUnread && isRead && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onMarkAsUnread(notification)}
            >
              Mark as Unread
            </Button>
          )}
          {onResend && deliveryStatus === 'failed' && (
            <Button
              variant="warning"
              size="sm"
              onClick={() => onResend(notification)}
            >
              Resend
            </Button>
          )}
          {onDelete && (
            <Button
              variant="danger"
              size="sm"
              onClick={() => onDelete(notification)}
            >
              Delete
            </Button>
          )}
        </div>
      )}
    </Card>
  )
}

export default NotificationCard
