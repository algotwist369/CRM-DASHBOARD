import React from 'react'
import { Card, Button, Badge, StatusBadge } from '../../common'

const CustomerCard = ({ 
  customer,
  onEdit,
  onDelete,
  onViewProfile,
  onViewHistory,
  onBookAppointment,
  onSendMessage,
  showActions = true,
  className = ''
}) => {
  const {
    name,
    email,
    phone,
    avatar,
    totalAppointments,
    totalSpent,
    lastVisit,
    status,
    preferredServices,
    notes,
    createdAt
  } = customer

  const formatDate = (dateString) => {
    if (!dateString) return 'Never'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0)
  }

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'success'
      case 'inactive': return 'danger'
      case 'vip': return 'warning'
      case 'new': return 'info'
      default: return 'default'
    }
  }

  return (
    <Card className={`hover:shadow-lg transition-shadow ${className}`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="relative">
            {avatar ? (
              <img
                src={avatar}
                alt={name}
                className="w-12 h-12 rounded-full object-cover"
              />
            ) : (
              <div className="w-12 h-12 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center font-semibold text-sm">
                {getInitials(name)}
              </div>
            )}
            <StatusBadge 
              status={getStatusColor(status)} 
              size="sm"
              className="absolute -bottom-1 -right-1"
            />
          </div>
          
          {/* Customer Info */}
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              {name}
            </h3>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant={getStatusColor(status)} size="sm">
                {status?.toUpperCase() || 'ACTIVE'}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Info */}
      <div className="mb-4 space-y-2">
        {email && (
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <span className="text-sm text-gray-600 truncate">{email}</span>
          </div>
        )}
        {phone && (
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            <span className="text-sm text-gray-600">{phone}</span>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="text-center p-3 bg-gray-50 ">
          <p className="text-xl font-semibold text-gray-900">
            {totalAppointments || 0}
          </p>
          <p className="text-sm text-gray-500">Appointments</p>
        </div>
        <div className="text-center p-3 bg-gray-50 ">
          <p className="text-xl font-semibold text-gray-900">
            {formatCurrency(totalSpent)}
          </p>
          <p className="text-sm text-gray-500">Total Spent</p>
        </div>
      </div>

      {/* Last Visit */}
      <div className="mb-4 p-3 bg-blue-50 ">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-blue-900">Last Visit</span>
          <span className="text-sm text-blue-700">
            {formatDate(lastVisit)}
          </span>
        </div>
      </div>

      {/* Preferred Services */}
      {preferredServices && preferredServices.length > 0 && (
        <div className="mb-4">
          <p className="text-sm font-medium text-gray-700 mb-2">Preferred Services</p>
          <div className="flex flex-wrap gap-1">
            {preferredServices.slice(0, 3).map((service, index) => (
              <Badge key={index} variant="outline" size="sm">
                {service}
              </Badge>
            ))}
            {preferredServices.length > 3 && (
              <Badge variant="outline" size="sm">
                +{preferredServices.length - 3} more
              </Badge>
            )}
          </div>
        </div>
      )}

      {/* Notes Preview */}
      {notes && (
        <div className="mb-4">
          <p className="text-sm font-medium text-gray-700 mb-1">Notes</p>
          <p className="text-sm text-gray-600 line-clamp-2">
            {notes}
          </p>
        </div>
      )}

      {/* Created Date */}
      <div className="mb-4 text-sm text-gray-500">
        Customer since: {formatDate(createdAt)}
      </div>

      {/* Actions */}
      {showActions && (
        <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-200">
          {onViewProfile && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => onViewProfile(customer)}
            >
              View Profile
            </Button>
          )}
          {onBookAppointment && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onBookAppointment(customer)}
            >
              Book Appointment
            </Button>
          )}
          {onViewHistory && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onViewHistory(customer)}
            >
              History
            </Button>
          )}
          {onSendMessage && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onSendMessage(customer)}
            >
              Message
            </Button>
          )}
          {onEdit && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(customer)}
            >
              Edit
            </Button>
          )}
          {onDelete && (
            <Button
              variant="danger"
              size="sm"
              onClick={() => onDelete(customer)}
            >
              Delete
            </Button>
          )}
        </div>
      )}
    </Card>
  )
}

export default CustomerCard
