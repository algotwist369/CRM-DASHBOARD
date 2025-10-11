import React from 'react'
import { StatusBadge, Button, Card } from '../../common'

const AppointmentCard = ({ 
  appointment,
  onEdit,
  onCancel,
  onReschedule,
  onComplete,
  showActions = true,
  className = ''
}) => {
  const {
    id,
    customerName,
    customerPhone,
    serviceName,
    staffName,
    appointmentDate,
    appointmentTime,
    duration,
    status,
    totalPrice,
    notes,
    businessName
  } = appointment

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatTime = (timeString) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    })
  }

  const getStatusColor = (status) => {
    const statusColors = {
      scheduled: 'primary',
      confirmed: 'info',
      in_progress: 'warning',
      completed: 'success',
      cancelled: 'danger',
      no_show: 'default'
    }
    return statusColors[status] || 'default'
  }

  const canEdit = ['scheduled', 'confirmed'].includes(status)
  const canCancel = ['scheduled', 'confirmed'].includes(status)
  const canReschedule = ['scheduled', 'confirmed'].includes(status)
  const canComplete = status === 'in_progress'

  return (
    <Card className={`hover:shadow-md transition-shadow ${className}`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-lg font-semibold text-gray-900">
              {serviceName}
            </h3>
            <StatusBadge status={status} />
          </div>
          {businessName && (
            <p className="text-sm text-gray-600 mb-1">
              {businessName}
            </p>
          )}
        </div>
        {totalPrice && (
          <div className="text-right">
            <p className="text-lg font-semibold text-gray-900">
              ${totalPrice}
            </p>
            <p className="text-sm text-gray-500">
              {duration} min
            </p>
          </div>
        )}
      </div>

      {/* Customer Info */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-1">
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <span className="font-medium text-gray-900">{customerName}</span>
        </div>
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
          </svg>
          <span className="text-sm text-gray-600">{customerPhone}</span>
        </div>
      </div>

      {/* Appointment Details */}
      <div className="mb-4 space-y-2">
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span className="text-sm text-gray-600">
            {formatDate(appointmentDate)} at {formatTime(appointmentTime)}
          </span>
        </div>
        {staffName && (
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span className="text-sm text-gray-600">Staff: {staffName}</span>
          </div>
        )}
      </div>

      {/* Notes */}
      {notes && (
        <div className="mb-4 p-3 bg-gray-50 rounded-md">
          <p className="text-sm text-gray-700">
            <span className="font-medium">Notes:</span> {notes}
          </p>
        </div>
      )}

      {/* Actions */}
      {showActions && (
        <div className="flex items-center gap-2 pt-4 border-t border-gray-200">
          {canEdit && onEdit && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(appointment)}
            >
              Edit
            </Button>
          )}
          {canReschedule && onReschedule && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onReschedule(appointment)}
            >
              Reschedule
            </Button>
          )}
          {canComplete && onComplete && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => onComplete(appointment)}
            >
              Complete
            </Button>
          )}
          {canCancel && onCancel && (
            <Button
              variant="danger"
              size="sm"
              onClick={() => onCancel(appointment)}
            >
              Cancel
            </Button>
          )}
        </div>
      )}
    </Card>
  )
}

export default AppointmentCard
