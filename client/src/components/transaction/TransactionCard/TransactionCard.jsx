import React from 'react'
import { Card, Button, Badge, StatusBadge } from '../../common'
import PaymentMethod from '../PaymentMethod/PaymentMethod'

const TransactionCard = ({ 
  transaction,
  onViewDetails,
  onRefund,
  onPrint,
  onExport,
  onEdit,
  showActions = true,
  className = ''
}) => {
  const {
    id,
    customerName,
    customerPhone,
    customerEmail,
    businessName,
    services,
    totalAmount,
    discount,
    tax,
    finalPrice,
    paymentMethod,
    paymentStatus,
    transactionDate,
    transactionTime,
    staffName,
    notes,
    receiptNumber,
    isRefunded,
    refundAmount,
    refundDate
  } = transaction

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0)
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
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

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'success'
      case 'pending': return 'warning'
      case 'failed': return 'danger'
      case 'refunded': return 'info'
      case 'cancelled': return 'default'
      default: return 'default'
    }
  }

  const getPaymentStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
      case 'pending':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
      case 'failed':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
      case 'refunded':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
          </svg>
        )
      default:
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
    }
  }

  return (
    <Card className={`hover:shadow-lg transition-shadow ${className}`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-lg font-semibold text-gray-900">
              Transaction #{receiptNumber || id}
            </h3>
            <StatusBadge 
              status={paymentStatus} 
              size="sm"
              className="flex items-center gap-1"
            >
              {getPaymentStatusIcon(paymentStatus)}
            </StatusBadge>
          </div>
          <p className="text-sm text-gray-600">
            {formatDate(transactionDate)} at {formatTime(transactionTime)}
          </p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-gray-900">
            {formatCurrency(finalPrice)}
          </p>
          {isRefunded && (
            <p className="text-sm text-red-600">
              Refunded: {formatCurrency(refundAmount)}
            </p>
          )}
        </div>
      </div>

      {/* Customer Information */}
      <div className="mb-4 p-3 bg-gray-50 ">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Customer Information</h4>
        <div className="space-y-1">
          <p className="text-sm text-gray-900">
            <span className="font-medium">Name:</span> {customerName}
          </p>
          {customerPhone && (
            <p className="text-sm text-gray-600">
              <span className="font-medium">Phone:</span> {customerPhone}
            </p>
          )}
          {customerEmail && (
            <p className="text-sm text-gray-600">
              <span className="font-medium">Email:</span> {customerEmail}
            </p>
          )}
        </div>
      </div>

      {/* Business & Staff */}
      <div className="mb-4 grid grid-cols-2 gap-4">
        <div>
          <p className="text-sm font-medium text-gray-700">Business</p>
          <p className="text-sm text-gray-900">{businessName}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-700">Staff</p>
          <p className="text-sm text-gray-900">{staffName}</p>
        </div>
      </div>

      {/* Services */}
      {services && services.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Services</h4>
          <div className="space-y-2">
            {services.map((service, index) => (
              <div key={index} className="flex justify-between items-center p-2 bg-white border rounded">
                <div>
                  <p className="text-sm font-medium text-gray-900">{service.name}</p>
                  {service.duration && (
                    <p className="text-xs text-gray-500">{service.duration} mins</p>
                  )}
                </div>
                <p className="text-sm font-medium text-gray-900">
                  {formatCurrency(service.price)}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Payment Details */}
      <div className="mb-4 p-3 bg-blue-50 ">
        <h4 className="text-sm font-medium text-blue-900 mb-2">Payment Details</h4>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-blue-700">Subtotal:</span>
            <span className="text-blue-900">{formatCurrency(totalAmount)}</span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-blue-700">Discount:</span>
              <span className="text-green-600">-{formatCurrency(discount)}</span>
            </div>
          )}
          {tax > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-blue-700">Tax:</span>
              <span className="text-blue-900">{formatCurrency(tax)}</span>
            </div>
          )}
          <div className="flex justify-between text-sm font-medium border-t border-blue-200 pt-2">
            <span className="text-blue-900">Total:</span>
            <span className="text-blue-900">{formatCurrency(finalPrice)}</span>
          </div>
        </div>
      </div>

      {/* Payment Method */}
      <div className="mb-4">
        <PaymentMethod 
          method={paymentMethod}
          status={paymentStatus}
          showIcon={true}
          size="sm"
        />
      </div>

      {/* Notes */}
      {notes && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-700 mb-1">Notes</h4>
          <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
            {notes}
          </p>
        </div>
      )}

      {/* Refund Information */}
      {isRefunded && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 ">
          <h4 className="text-sm font-medium text-red-900 mb-1">Refund Information</h4>
          <div className="space-y-1">
            <p className="text-sm text-red-700">
              <span className="font-medium">Refund Amount:</span> {formatCurrency(refundAmount)}
            </p>
            <p className="text-sm text-red-700">
              <span className="font-medium">Refund Date:</span> {formatDate(refundDate)}
            </p>
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
              onClick={() => onViewDetails(transaction)}
            >
              View Details
            </Button>
          )}
          {onPrint && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPrint(transaction)}
            >
              Print Receipt
            </Button>
          )}
          {onExport && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onExport(transaction)}
            >
              Export
            </Button>
          )}
          {onEdit && paymentStatus === 'pending' && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(transaction)}
            >
              Edit
            </Button>
          )}
          {onRefund && paymentStatus === 'completed' && !isRefunded && (
            <Button
              variant="danger"
              size="sm"
              onClick={() => onRefund(transaction)}
            >
              Refund
            </Button>
          )}
        </div>
      )}
    </Card>
  )
}

export default TransactionCard
