import React from 'react'
import { Card, Button, Badge, StatusBadge } from '../../common'

const ReportCard = ({ 
  report,
  onView,
  onEdit,
  onDelete,
  onDownload,
  onShare,
  onSchedule,
  showActions = true,
  className = ''
}) => {
  const {
    id,
    name,
    description,
    type,
    category,
    status,
    generatedAt,
    generatedBy,
    lastModified,
    fileSize,
    format,
    recordCount,
    parameters = {},
    schedule,
    isPublic,
    tags = [],
    metadata = {}
  } = report

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

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getReportIcon = (type) => {
    switch (type) {
      case 'financial':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
          </svg>
        )
      case 'customer':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        )
      case 'appointment':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        )
      case 'staff':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        )
      case 'inventory':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        )
      case 'analytics':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        )
      default:
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        )
    }
  }

  const getTypeColor = (type) => {
    switch (type) {
      case 'financial': return 'green'
      case 'customer': return 'blue'
      case 'appointment': return 'purple'
      case 'staff': return 'orange'
      case 'inventory': return 'yellow'
      case 'analytics': return 'indigo'
      default: return 'default'
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'generated': return 'success'
      case 'generating': return 'warning'
      case 'failed': return 'danger'
      case 'scheduled': return 'info'
      case 'draft': return 'default'
      default: return 'default'
    }
  }

  const getFormatIcon = (format) => {
    switch (format) {
      case 'pdf':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        )
      case 'excel':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        )
      case 'csv':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        )
      default:
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        )
    }
  }

  return (
    <Card className={`hover:shadow-lg transition-shadow ${className}`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-3 flex-1">
          {/* Icon */}
          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
            getTypeColor(type) === 'green' ? 'bg-green-100 text-green-600' :
            getTypeColor(type) === 'blue' ? 'bg-blue-100 text-blue-600' :
            getTypeColor(type) === 'purple' ? 'bg-purple-100 text-purple-600' :
            getTypeColor(type) === 'orange' ? 'bg-orange-100 text-orange-600' :
            getTypeColor(type) === 'yellow' ? 'bg-yellow-100 text-yellow-600' :
            getTypeColor(type) === 'indigo' ? 'bg-indigo-100 text-indigo-600' :
            'bg-gray-100 text-gray-600'
          }`}>
            {getReportIcon(type)}
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
              {isPublic && (
                <Badge variant="info" size="sm">
                  Public
                </Badge>
              )}
            </div>
            <p className="text-sm text-gray-600 line-clamp-2">
              {description}
            </p>
          </div>
        </div>
        
        {/* Time */}
        <div className="text-right">
          <p className="text-xs text-gray-500">
            {status === 'generated' ? 'Generated' : 
             status === 'generating' ? 'Generating' :
             status === 'scheduled' ? 'Scheduled' : 'Created'}
          </p>
          <p className="text-xs text-gray-500">
            {status === 'generated' ? getTimeAgo(generatedAt) :
             status === 'generating' ? 'In progress' :
             status === 'scheduled' ? getTimeAgo(schedule?.nextRun) : getTimeAgo(lastModified)}
          </p>
        </div>
      </div>

      {/* Report Details */}
      <div className="mb-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
        <div>
          <p className="text-gray-500">Format</p>
          <div className="flex items-center gap-1">
            {getFormatIcon(format)}
            <span className="font-medium text-gray-900 uppercase">{format}</span>
          </div>
        </div>
        <div>
          <p className="text-gray-500">Records</p>
          <p className="font-medium text-gray-900">{recordCount?.toLocaleString() || 'N/A'}</p>
        </div>
        <div>
          <p className="text-gray-500">File Size</p>
          <p className="font-medium text-gray-900">{fileSize ? formatFileSize(fileSize) : 'N/A'}</p>
        </div>
        <div>
          <p className="text-gray-500">Generated By</p>
          <p className="font-medium text-gray-900">{generatedBy || 'System'}</p>
        </div>
      </div>

      {/* Category and Tags */}
      <div className="mb-4">
        {category && (
          <div className="mb-2">
            <span className="text-sm text-gray-500">Category: </span>
            <Badge variant="outline" size="sm">{category}</Badge>
          </div>
        )}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            <span className="text-sm text-gray-500 mr-2">Tags:</span>
            {tags.map((tag, index) => (
              <Badge key={index} variant="default" size="sm">{tag}</Badge>
            ))}
          </div>
        )}
      </div>

      {/* Parameters */}
      {parameters && Object.keys(parameters).length > 0 && (
        <div className="mb-4 p-3 bg-gray-50 ">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Report Parameters</h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            {Object.entries(parameters).slice(0, 4).map(([key, value]) => (
              <div key={key} className="flex justify-between">
                <span className="text-gray-600 capitalize">{key.replace(/([A-Z])/g, ' $1')}:</span>
                <span className="text-gray-900">{value}</span>
              </div>
            ))}
            {Object.keys(parameters).length > 4 && (
              <div className="col-span-2 text-xs text-gray-500">
                +{Object.keys(parameters).length - 4} more parameters
              </div>
            )}
          </div>
        </div>
      )}

      {/* Schedule Information */}
      {schedule && (
        <div className="mb-4 p-3 bg-blue-50 ">
          <h4 className="text-sm font-medium text-blue-900 mb-1">Schedule</h4>
          <div className="text-sm text-blue-700">
            <p>Frequency: {schedule.frequency}</p>
            {schedule.nextRun && (
              <p>Next Run: {formatDate(schedule.nextRun)} at {formatTime(schedule.nextRun)}</p>
            )}
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
          {onView && status === 'generated' && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => onView(report)}
            >
              View Report
            </Button>
          )}
          {onDownload && status === 'generated' && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDownload(report)}
            >
              Download
            </Button>
          )}
          {onEdit && (status === 'draft' || status === 'generated') && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(report)}
            >
              Edit
            </Button>
          )}
          {onShare && status === 'generated' && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onShare(report)}
            >
              Share
            </Button>
          )}
          {onSchedule && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onSchedule(report)}
            >
              Schedule
            </Button>
          )}
          {onDelete && (
            <Button
              variant="danger"
              size="sm"
              onClick={() => onDelete(report)}
            >
              Delete
            </Button>
          )}
        </div>
      )}
    </Card>
  )
}

export default ReportCard
