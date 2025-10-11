import React from 'react'
import { Card, Button, StatusBadge } from '../../common'
import BusinessTypeBadge from '../BusinessTypeBadge/BusinessTypeBadge'

const BusinessCard = ({ 
  business,
  onEdit,
  onDelete,
  onViewDetails,
  onManageStaff,
  onManageManagers,
  onViewAnalytics,
  showActions = true,
  className = ''
}) => {
  const {
    name,
    type,
    branch,
    address,
    phone,
    email,
    businessLink,
    isActive,
    managers,
    staff,
    totalRevenue,
    totalCustomers,
    totalAppointments,
    createdAt
  } = business

  const formatDate = (dateString) => {
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

  const getStatusColor = (isActive) => {
    return isActive ? 'success' : 'danger'
  }

  return (
    <Card className={`hover:shadow-lg transition-shadow ${className}`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-xl font-semibold text-gray-900">
              {name}
            </h3>
            <BusinessTypeBadge type={type} />
            <StatusBadge status={isActive ? 'active' : 'inactive'} />
          </div>
          {branch && (
            <p className="text-sm text-gray-600 mb-1">
              {branch}
            </p>
          )}
        </div>
        <div className="text-right">
          <p className="text-lg font-semibold text-gray-900">
            {formatCurrency(totalRevenue)}
          </p>
          <p className="text-sm text-gray-500">
            Total Revenue
          </p>
        </div>
      </div>

      {/* Business Info */}
      <div className="mb-4 space-y-2">
        {address && (
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="text-sm text-gray-600">{address}</span>
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
        {email && (
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <span className="text-sm text-gray-600">{email}</span>
          </div>
        )}
      </div>

      {/* Business Link */}
      {businessLink && (
        <div className="mb-4 p-3 bg-gray-50 rounded-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">Public Booking Link</p>
              <p className="text-xs text-gray-500 truncate">{businessLink}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(businessLink, '_blank')}
            >
              View
            </Button>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="text-center">
          <p className="text-2xl font-semibold text-gray-900">
            {managers?.length || 0}
          </p>
          <p className="text-sm text-gray-500">Managers</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-semibold text-gray-900">
            {staff?.length || 0}
          </p>
          <p className="text-sm text-gray-500">Staff</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-semibold text-gray-900">
            {totalCustomers || 0}
          </p>
          <p className="text-sm text-gray-500">Customers</p>
        </div>
      </div>

      {/* Additional Stats */}
      <div className="mb-4 p-3 bg-blue-50 rounded-md">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-blue-900">Total Appointments</span>
          <span className="text-lg font-semibold text-blue-900">
            {totalAppointments || 0}
          </span>
        </div>
      </div>

      {/* Created Date */}
      <div className="mb-4 text-sm text-gray-500">
        Created: {formatDate(createdAt)}
      </div>

      {/* Actions */}
      {showActions && (
        <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-200">
          {onViewDetails && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => onViewDetails(business)}
            >
              View Details
            </Button>
          )}
          {onEdit && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(business)}
            >
              Edit
            </Button>
          )}
          {onManageStaff && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onManageStaff(business)}
            >
              Manage Staff
            </Button>
          )}
          {onManageManagers && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onManageManagers(business)}
            >
              Manage Managers
            </Button>
          )}
          {onViewAnalytics && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onViewAnalytics(business)}
            >
              Analytics
            </Button>
          )}
          {onDelete && (
            <Button
              variant="danger"
              size="sm"
              onClick={() => onDelete(business)}
            >
              Delete
            </Button>
          )}
        </div>
      )}
    </Card>
  )
}

export default BusinessCard
