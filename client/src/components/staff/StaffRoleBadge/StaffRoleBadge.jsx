import React from 'react'
import { Badge } from '../../common'

const StaffRoleBadge = ({ 
  role, 
  size = 'md',
  showIcon = true,
  className = ''
}) => {
  const roleConfig = {
    manager: {
      label: 'Manager',
      color: 'purple',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      description: 'Manages business operations and staff'
    },
    stylist: {
      label: 'Stylist',
      color: 'pink',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" />
        </svg>
      ),
      description: 'Provides hair styling and beauty services'
    },
    therapist: {
      label: 'Therapist',
      color: 'green',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      ),
      description: 'Provides spa and wellness treatments'
    },
    receptionist: {
      label: 'Receptionist',
      color: 'blue',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
        </svg>
      ),
      description: 'Handles customer service and appointments'
    },
    technician: {
      label: 'Technician',
      color: 'yellow',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      description: 'Provides technical services and treatments'
    },
    assistant: {
      label: 'Assistant',
      color: 'gray',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
      description: 'Assists with various tasks and services'
    }
  }

  const config = roleConfig[role] || {
    label: role || 'Staff',
    color: 'default',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
    description: 'Staff member'
  }

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-0.5',
    lg: 'text-base px-3 py-1'
  }

  const iconSizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  }

  return (
    <Badge 
      variant={config.color} 
      size={size}
      className={`flex items-center gap-1 ${className}`}
    >
      {showIcon && (
        <span className={iconSizeClasses[size]}>
          {config.icon}
        </span>
      )}
      {config.label}
    </Badge>
  )
}

// Staff Role Selector Component
export const StaffRoleSelector = ({ 
  selectedRole,
  onRoleSelect,
  className = ''
}) => {
  const roles = [
    { value: 'manager', label: 'Manager', icon: '👑', description: 'Manages business operations and staff' },
    { value: 'stylist', label: 'Stylist', icon: '✂️', description: 'Provides hair styling and beauty services' },
    { value: 'therapist', label: 'Therapist', icon: '🧘', description: 'Provides spa and wellness treatments' },
    { value: 'receptionist', label: 'Receptionist', icon: '📞', description: 'Handles customer service and appointments' },
    { value: 'technician', label: 'Technician', icon: '🔧', description: 'Provides technical services and treatments' },
    { value: 'assistant', label: 'Assistant', icon: '👤', description: 'Assists with various tasks and services' }
  ]

  return (
    <div className={`space-y-3 ${className}`}>
      <h3 className="text-sm font-medium text-gray-900">Staff Role</h3>
      <div className="grid grid-cols-1 gap-2">
        {roles.map((role) => (
          <button
            key={role.value}
            onClick={() => onRoleSelect(role.value)}
            className={`p-3 text-left border  transition-all duration-200 ${
              selectedRole === role.value
                ? 'bg-primary-50 border-primary-300 ring-2 ring-primary-200'
                : 'bg-white border-gray-200 hover:border-primary-300 hover:bg-primary-50'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">{role.icon}</span>
              <div>
                <p className="font-medium text-gray-900">{role.label}</p>
                <p className="text-sm text-gray-500">{role.description}</p>
              </div>
              {selectedRole === role.value && (
                <svg className="w-5 h-5 text-primary-600 ml-auto" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

// Staff Role Display Component
export const StaffRoleDisplay = ({ 
  role, 
  showDescription = false,
  className = ''
}) => {
  const roleConfig = {
    manager: { label: 'Manager', icon: '👑', description: 'Manages business operations and staff' },
    stylist: { label: 'Stylist', icon: '✂️', description: 'Provides hair styling and beauty services' },
    therapist: { label: 'Therapist', icon: '🧘', description: 'Provides spa and wellness treatments' },
    receptionist: { label: 'Receptionist', icon: '📞', description: 'Handles customer service and appointments' },
    technician: { label: 'Technician', icon: '🔧', description: 'Provides technical services and treatments' },
    assistant: { label: 'Assistant', icon: '👤', description: 'Assists with various tasks and services' }
  }

  const config = roleConfig[role] || { 
    label: role || 'Staff', 
    icon: '👤', 
    description: 'Staff member' 
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span className="text-lg">{config.icon}</span>
      <div>
        <p className="font-medium text-gray-900">{config.label}</p>
        {showDescription && (
          <p className="text-sm text-gray-500">{config.description}</p>
        )}
      </div>
    </div>
  )
}

export default StaffRoleBadge
