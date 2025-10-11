import React from 'react'
import { StatusBadge } from '../../common'

const AppointmentStatus = ({ 
  status, 
  showIcon = true, 
  showProgress = false,
  size = 'md',
  className = ''
}) => {
  const statusConfig = {
    scheduled: {
      label: 'Scheduled',
      color: 'primary',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      progress: 25,
      description: 'Appointment is scheduled and waiting for confirmation'
    },
    confirmed: {
      label: 'Confirmed',
      color: 'info',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      progress: 50,
      description: 'Appointment is confirmed and ready'
    },
    in_progress: {
      label: 'In Progress',
      color: 'warning',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      progress: 75,
      description: 'Appointment is currently in progress'
    },
    completed: {
      label: 'Completed',
      color: 'success',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      ),
      progress: 100,
      description: 'Appointment has been completed successfully'
    },
    cancelled: {
      label: 'Cancelled',
      color: 'danger',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      ),
      progress: 0,
      description: 'Appointment has been cancelled'
    },
    no_show: {
      label: 'No Show',
      color: 'default',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      ),
      progress: 0,
      description: 'Customer did not show up for the appointment'
    }
  }

  const config = statusConfig[status] || statusConfig.scheduled

  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-2'
  }

  const iconSizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  }

  if (showProgress) {
    return (
      <div className={`space-y-2 ${className}`}>
        {/* Status Badge with Icon */}
        <div className="flex items-center gap-2">
          <StatusBadge 
            status={status} 
            size={size}
          />
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-300 ${
              config.color === 'primary' ? 'bg-primary-600' :
              config.color === 'info' ? 'bg-blue-600' :
              config.color === 'warning' ? 'bg-yellow-600' :
              config.color === 'success' ? 'bg-green-600' :
              config.color === 'danger' ? 'bg-red-600' :
              'bg-gray-600'
            }`}
            style={{ width: `${config.progress}%` }}
          />
        </div>

        {/* Description */}
        <p className="text-sm text-gray-600">
          {config.description}
        </p>
      </div>
    )
  }

  return (
    <StatusBadge 
      status={status} 
      size={size} 
      className={className}
    />
  )
}

// Status Timeline Component
export const AppointmentStatusTimeline = ({ 
  currentStatus, 
  className = '' 
}) => {
  const statuses = ['scheduled', 'confirmed', 'in_progress', 'completed']
  const currentIndex = statuses.indexOf(currentStatus)

  return (
    <div className={`space-y-4 ${className}`}>
      {statuses.map((status, index) => {
        const config = {
          scheduled: { label: 'Scheduled', color: 'primary' },
          confirmed: { label: 'Confirmed', color: 'info' },
          in_progress: { label: 'In Progress', color: 'warning' },
          completed: { label: 'Completed', color: 'success' }
        }[status]

        const isActive = index <= currentIndex
        const isCurrent = index === currentIndex

        return (
          <div key={status} className="flex items-center">
            {/* Status Circle */}
            <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
              isActive 
                ? `bg-${config.color}-600 text-white` 
                : 'bg-gray-200 text-gray-400'
            }`}>
              {isActive ? (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              ) : (
                <span className="text-sm font-medium">{index + 1}</span>
              )}
            </div>

            {/* Status Label */}
            <div className="ml-3">
              <p className={`text-sm font-medium ${
                isCurrent ? `text-${config.color}-600` : 
                isActive ? 'text-gray-900' : 'text-gray-500'
              }`}>
                {config.label}
              </p>
            </div>

            {/* Connector Line */}
            {index < statuses.length - 1 && (
              <div className={`absolute left-4 top-8 w-0.5 h-8 ${
                index < currentIndex ? `bg-${config.color}-600` : 'bg-gray-200'
              }`} />
            )}
          </div>
        )
      })}
    </div>
  )
}

export default AppointmentStatus
