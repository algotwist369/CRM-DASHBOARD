import React from 'react'
import { Card, Button, Badge, StatusBadge } from '../../common'
import { StatCard } from '../../charts'

const CampaignCard = ({ 
  campaign,
  onViewDetails,
  onEdit,
  onDelete,
  onStart,
  onPause,
  onStop,
  onViewAnalytics,
  showActions = true,
  className = ''
}) => {
  const {
    id,
    name,
    description,
    type,
    status,
    targetAudience,
    scheduledAt,
    sentAt,
    completedAt,
    totalRecipients,
    deliveredCount,
    openedCount,
    clickedCount,
    conversionCount,
    createdBy,
    createdAt,
    businessId,
    template,
    metadata = {}
  } = campaign

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

  const getCampaignIcon = (type) => {
    switch (type) {
      case 'email':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        )
      case 'sms':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        )
      case 'push':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4.828 7l2.586 2.586a2 2 0 002.828 0L12 7l-2.586-2.586a2 2 0 00-2.828 0L4.828 7z" />
          </svg>
        )
      case 'promotion':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
          </svg>
        )
      default:
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4.828 7l2.586 2.586a2 2 0 002.828 0L12 7l-2.586-2.586a2 2 0 00-2.828 0L4.828 7z" />
          </svg>
        )
    }
  }

  const getTypeColor = (type) => {
    switch (type) {
      case 'email': return 'blue'
      case 'sms': return 'green'
      case 'push': return 'purple'
      case 'promotion': return 'orange'
      default: return 'default'
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'draft': return 'default'
      case 'scheduled': return 'info'
      case 'running': return 'success'
      case 'paused': return 'warning'
      case 'completed': return 'success'
      case 'cancelled': return 'danger'
      default: return 'default'
    }
  }

  const calculateOpenRate = () => {
    if (!deliveredCount || deliveredCount === 0) return 0
    return ((openedCount || 0) / deliveredCount * 100).toFixed(1)
  }

  const calculateClickRate = () => {
    if (!deliveredCount || deliveredCount === 0) return 0
    return ((clickedCount || 0) / deliveredCount * 100).toFixed(1)
  }

  const calculateConversionRate = () => {
    if (!deliveredCount || deliveredCount === 0) return 0
    return ((conversionCount || 0) / deliveredCount * 100).toFixed(1)
  }

  const canStart = status === 'draft' || status === 'scheduled'
  const canPause = status === 'running'
  const canStop = status === 'running' || status === 'paused'
  const canEdit = status === 'draft'

  return (
    <Card className={`hover:shadow-lg transition-shadow ${className}`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-3 flex-1">
          {/* Icon */}
          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
            getTypeColor(type) === 'blue' ? 'bg-blue-100 text-blue-600' :
            getTypeColor(type) === 'green' ? 'bg-green-100 text-green-600' :
            getTypeColor(type) === 'purple' ? 'bg-purple-100 text-purple-600' :
            getTypeColor(type) === 'orange' ? 'bg-orange-100 text-orange-600' :
            'bg-gray-100 text-gray-600'
          }`}>
            {getCampaignIcon(type)}
          </div>
          
          {/* Content */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-lg font-semibold text-gray-900">
                {name}
              </h3>
              <Badge variant={getTypeColor(type)} size="sm">
                {type}
              </Badge>
              <StatusBadge 
                status={status} 
                size="sm"
              />
            </div>
            <p className="text-sm text-gray-600 line-clamp-2">
              {description}
            </p>
          </div>
        </div>
        
        {/* Time */}
        <div className="text-right">
          <p className="text-xs text-gray-500">
            {status === 'scheduled' ? 'Scheduled' : 
             status === 'running' ? 'Started' :
             status === 'completed' ? 'Completed' : 'Created'}
          </p>
          <p className="text-xs text-gray-500">
            {status === 'scheduled' ? getTimeAgo(scheduledAt) :
             status === 'running' ? getTimeAgo(sentAt) :
             status === 'completed' ? getTimeAgo(completedAt) : getTimeAgo(createdAt)}
          </p>
        </div>
      </div>

      {/* Campaign Stats */}
      <div className="mb-4 grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="Recipients"
          value={totalRecipients || 0}
          format="number"
          color="blue"
          size="sm"
        />
        <StatCard
          title="Delivered"
          value={deliveredCount || 0}
          format="number"
          color="green"
          size="sm"
        />
        <StatCard
          title="Opened"
          value={`${calculateOpenRate()}%`}
          format="percentage"
          color="purple"
          size="sm"
        />
        <StatCard
          title="Clicked"
          value={`${calculateClickRate()}%`}
          format="percentage"
          color="orange"
          size="sm"
        />
      </div>

      {/* Target Audience */}
      <div className="mb-4 p-3 bg-gray-50 ">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Target Audience</h4>
        <div className="flex items-center gap-2">
          <Badge variant="outline" size="sm">
            {targetAudience?.type || 'All Customers'}
          </Badge>
          {targetAudience?.count && (
            <span className="text-sm text-gray-600">
              ({targetAudience.count} recipients)
            </span>
          )}
        </div>
      </div>

      {/* Schedule Information */}
      {scheduledAt && (
        <div className="mb-4 p-3 bg-blue-50 ">
          <h4 className="text-sm font-medium text-blue-900 mb-1">Schedule</h4>
          <p className="text-sm text-blue-700">
            {formatDate(scheduledAt)} at {formatTime(scheduledAt)}
          </p>
        </div>
      )}

      {/* Performance Metrics */}
      {status === 'completed' && (
        <div className="mb-4 p-3 bg-green-50 ">
          <h4 className="text-sm font-medium text-green-900 mb-2">Performance Summary</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-green-700">Open Rate</p>
              <p className="font-medium text-green-900">{calculateOpenRate()}%</p>
            </div>
            <div>
              <p className="text-green-700">Click Rate</p>
              <p className="font-medium text-green-900">{calculateClickRate()}%</p>
            </div>
            <div>
              <p className="text-green-700">Conversion Rate</p>
              <p className="font-medium text-green-900">{calculateConversionRate()}%</p>
            </div>
            <div>
              <p className="text-green-700">Total Conversions</p>
              <p className="font-medium text-green-900">{conversionCount || 0}</p>
            </div>
          </div>
        </div>
      )}

      {/* Template Information */}
      {template && (
        <div className="mb-4 p-3 bg-gray-50 ">
          <h4 className="text-sm font-medium text-gray-700 mb-1">Template</h4>
          <p className="text-sm text-gray-600">{template.name}</p>
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
              onClick={() => onViewDetails(campaign)}
            >
              View Details
            </Button>
          )}
          {onViewAnalytics && (status === 'completed' || status === 'running') && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onViewAnalytics(campaign)}
            >
              Analytics
            </Button>
          )}
          {onEdit && canEdit && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(campaign)}
            >
              Edit
            </Button>
          )}
          {onStart && canStart && (
            <Button
              variant="success"
              size="sm"
              onClick={() => onStart(campaign)}
            >
              Start
            </Button>
          )}
          {onPause && canPause && (
            <Button
              variant="warning"
              size="sm"
              onClick={() => onPause(campaign)}
            >
              Pause
            </Button>
          )}
          {onStop && canStop && (
            <Button
              variant="danger"
              size="sm"
              onClick={() => onStop(campaign)}
            >
              Stop
            </Button>
          )}
          {onDelete && canEdit && (
            <Button
              variant="danger"
              size="sm"
              onClick={() => onDelete(campaign)}
            >
              Delete
            </Button>
          )}
        </div>
      )}
    </Card>
  )
}

export default CampaignCard
