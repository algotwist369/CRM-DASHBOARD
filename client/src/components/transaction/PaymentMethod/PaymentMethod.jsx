import React from 'react'
import { Badge, Button } from '../../common'

const PaymentMethod = ({ 
  method, 
  status = 'completed',
  showIcon = true,
  showStatus = true,
  size = 'md',
  className = ''
}) => {
  const paymentMethodConfig = {
    cash: {
      label: 'Cash',
      color: 'green',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
        </svg>
      ),
      description: 'Cash payment'
    },
    card: {
      label: 'Credit/Debit Card',
      color: 'blue',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
      ),
      description: 'Credit or debit card payment'
    },
    // digital_wallet: {
    //   label: 'Digital Wallet',
    //   color: 'purple',
    //   icon: (
    //     <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    //       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
    //     </svg>
    //   ),
    //   description: 'Digital wallet payment (Apple Pay, Google Pay, etc.)'
    // },
    bank_transfer: {
      label: 'Bank Transfer',
      color: 'indigo',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
        </svg>
      ),
      description: 'Direct bank transfer'
    },
    check: {
      label: 'Check',
      color: 'yellow',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      description: 'Check payment'
    },
    gift_card: {
      label: 'Gift Card',
      color: 'pink',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      ),
      description: 'Gift card payment'
    },
    installment: {
      label: 'Installment',
      color: 'orange',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
      ),
      description: 'Installment payment plan'
    }
  }

  const config = paymentMethodConfig[method] || {
    label: method || 'Unknown',
    color: 'default',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    description: 'Payment method'
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
    <div className={`flex items-center gap-2 ${className}`}>
      <Badge 
        variant={config.color} 
        size={size}
        className="flex items-center gap-1"
      >
        {showIcon && (
          <span className={iconSizeClasses[size]}>
            {config.icon}
          </span>
        )}
        {config.label}
      </Badge>
      {showStatus && (
        <Badge 
          variant={status === 'completed' ? 'success' : 
                  status === 'pending' ? 'warning' : 
                  status === 'failed' ? 'danger' : 'default'} 
          size={size}
        >
          {status}
        </Badge>
      )}
    </div>
  )
}

// Payment Method Selector Component
export const PaymentMethodSelector = ({ 
  selectedMethod,
  onMethodSelect,
  showDescriptions = true,
  className = ''
}) => {
  const methods = [
    { value: 'cash', label: 'Cash', icon: '💵', description: 'Cash payment' },
    { value: 'card', label: 'Credit/Debit Card', icon: '💳', description: 'Credit or debit card payment' },
    // { value: 'digital_wallet', label: 'Digital Wallet', icon: '📱', description: 'Apple Pay, Google Pay, etc.' },
    { value: 'bank_transfer', label: 'Bank Transfer', icon: '🏦', description: 'Direct bank transfer' },
    { value: 'check', label: 'Check', icon: '📝', description: 'Check payment' },
    { value: 'gift_card', label: 'Gift Card', icon: '🎁', description: 'Gift card payment' },
    { value: 'installment', label: 'Installment', icon: '📅', description: 'Installment payment plan' }
  ]

  return (
    <div className={`space-y-3 ${className}`}>
      <h3 className="text-sm font-medium text-gray-900">Payment Method</h3>
      <div className="grid grid-cols-1 gap-2">
        {methods.map((method) => (
          <button
            key={method.value}
            onClick={() => onMethodSelect(method.value)}
            className={`p-3 text-left border  transition-all duration-200 ${
              selectedMethod === method.value
                ? 'bg-primary-50 border-primary-300 ring-2 ring-primary-200'
                : 'bg-white border-gray-200 hover:border-primary-300 hover:bg-primary-50'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">{method.icon}</span>
              <div className="flex-1">
                <p className="font-medium text-gray-900">{method.label}</p>
                {showDescriptions && (
                  <p className="text-sm text-gray-500">{method.description}</p>
                )}
              </div>
              {selectedMethod === method.value && (
                <svg className="w-5 h-5 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
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

// Payment Method Display Component
export const PaymentMethodDisplay = ({ 
  method, 
  showDescription = false,
  className = ''
}) => {
  const methodConfig = {
    cash: { label: 'Cash', icon: '💵', description: 'Cash payment' },
    card: { label: 'Credit/Debit Card', icon: '💳', description: 'Credit or debit card payment' },
    // digital_wallet: { label: 'Digital Wallet', icon: '📱', description: 'Apple Pay, Google Pay, etc.' },
    bank_transfer: { label: 'Bank Transfer', icon: '🏦', description: 'Direct bank transfer' },
    check: { label: 'Check', icon: '📝', description: 'Check payment' },
    gift_card: { label: 'Gift Card', icon: '🎁', description: 'Gift card payment' },
    installment: { label: 'Installment', icon: '📅', description: 'Installment payment plan' }
  }

  const config = methodConfig[method] || { 
    label: method || 'Unknown', 
    icon: '❓', 
    description: 'Payment method' 
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

// Payment Status Badge Component
export const PaymentStatusBadge = ({ 
  status, 
  size = 'md',
  showIcon = true,
  className = ''
}) => {
  const statusConfig = {
    completed: {
      label: 'Completed',
      color: 'success',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    pending: {
      label: 'Pending',
      color: 'warning',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    failed: {
      label: 'Failed',
      color: 'danger',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    refunded: {
      label: 'Refunded',
      color: 'info',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
        </svg>
      )
    },
    cancelled: {
      label: 'Cancelled',
      color: 'default',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      )
    }
  }

  const config = statusConfig[status] || {
    label: status || 'Unknown',
    color: 'default',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )
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

export default PaymentMethod
