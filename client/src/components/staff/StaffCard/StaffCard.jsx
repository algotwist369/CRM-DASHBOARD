import React from 'react'
import { Card, Button, Badge, StatusBadge } from '../../common'
import StaffRoleBadge from '../StaffRoleBadge/StaffRoleBadge'

const StaffCard = ({ 
  staff,
  onEdit,
  onDelete,
  onViewProfile,
  onViewSchedule,
  onViewPerformance,
  onAssignAppointment,
  showActions = true,
  className = ''
}) => {
  const {
    name,
    email,
    phone,
    avatar,
    role,
    specialties,
    experience,
    rating,
    totalAppointments,
    totalRevenue,
    isActive,
    workingHours,
    notes,
    createdAt
  } = staff

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

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const renderStars = (rating) => {
    const stars = []
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 !== 0

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <svg key={i} className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      )
    }

    if (hasHalfStar) {
      stars.push(
        <svg key="half" className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
          <defs>
            <linearGradient id="half-star">
              <stop offset="50%" stopColor="currentColor" />
              <stop offset="50%" stopColor="transparent" />
            </linearGradient>
          </defs>
          <path fill="url(#half-star)" d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      )
    }

    const emptyStars = 5 - Math.ceil(rating)
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <svg key={`empty-${i}`} className="w-4 h-4 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      )
    }

    return stars
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
              status={isActive ? 'active' : 'inactive'} 
              size="sm"
              className="absolute -bottom-1 -right-1"
            />
          </div>
          
          {/* Staff Info */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-lg font-semibold text-gray-900">
                {name}
              </h3>
              <StaffRoleBadge role={role} />
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center">
                {renderStars(rating || 0)}
              </div>
              <span className="text-sm text-gray-600">
                {rating ? rating.toFixed(1) : 'No rating'}
              </span>
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

      {/* Specialties */}
      {specialties && specialties.length > 0 && (
        <div className="mb-4">
          <p className="text-sm font-medium text-gray-700 mb-2">Specialties</p>
          <div className="flex flex-wrap gap-1">
            {specialties.slice(0, 3).map((specialty, index) => (
              <Badge key={index} variant="outline" size="sm">
                {specialty}
              </Badge>
            ))}
            {specialties.length > 3 && (
              <Badge variant="outline" size="sm">
                +{specialties.length - 3} more
              </Badge>
            )}
          </div>
        </div>
      )}

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
            {formatCurrency(totalRevenue)}
          </p>
          <p className="text-sm text-gray-500">Revenue</p>
        </div>
      </div>

      {/* Experience */}
      {experience && (
        <div className="mb-4 p-3 bg-blue-50 ">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-blue-900">Experience</span>
            <span className="text-sm text-blue-700">
              {experience} years
            </span>
          </div>
        </div>
      )}

      {/* Working Hours */}
      {workingHours && (
        <div className="mb-4">
          <p className="text-sm font-medium text-gray-700 mb-1">Working Hours</p>
          <p className="text-sm text-gray-600">
            {workingHours.start} - {workingHours.end}
          </p>
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
        Joined: {formatDate(createdAt)}
      </div>

      {/* Actions */}
      {showActions && (
        <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-200">
          {onViewProfile && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => onViewProfile(staff)}
            >
              View Profile
            </Button>
          )}
          {onViewSchedule && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onViewSchedule(staff)}
            >
              Schedule
            </Button>
          )}
          {onViewPerformance && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onViewPerformance(staff)}
            >
              Performance
            </Button>
          )}
          {onAssignAppointment && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onAssignAppointment(staff)}
            >
              Assign
            </Button>
          )}
          {onEdit && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(staff)}
            >
              Edit
            </Button>
          )}
          {onDelete && (
            <Button
              variant="danger"
              size="sm"
              onClick={() => onDelete(staff)}
            >
              Delete
            </Button>
          )}
        </div>
      )}
    </Card>
  )
}

export default StaffCard
