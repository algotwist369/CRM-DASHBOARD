import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  FaDollarSign,
  FaUser,
  FaPhoneAlt,
  FaEnvelope,
  FaClipboardList,
  FaTags,
  FaCreditCard,
  FaUserTag,
  FaStickyNote,
  FaStar,
  FaArrowLeft,
  FaCalendarAlt,
  FaSpinner,
  FaCheckCircle,
  FaClock,
  FaTimesCircle
} from 'react-icons/fa'
import { toast } from 'react-hot-toast'
import managerService from '../../../../services/manager/managerService'

const SERVICE_TYPE_COLORS = {
  hair: 'bg-blue-100 text-blue-700',
  facial: 'bg-pink-100 text-pink-700',
  massage: 'bg-purple-100 text-purple-700',
  nail: 'bg-red-100 text-red-700',
  spa: 'bg-green-100 text-green-700',
  room: 'bg-yellow-100 text-yellow-700',
  food: 'bg-orange-100 text-orange-700',
  other: 'bg-gray-100 text-gray-700',
}

const TransactionDetails = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const [loading, setLoading] = useState(true)
  const [transaction, setTransaction] = useState(null)

  useEffect(() => {
    const fetchTransaction = async () => {
      try {
        setLoading(true)
        const res = await managerService.getTransactions({ limit: 1000 })
        if (res.success) {
          const transactionList = res.data?.data || []
          const foundTransaction = transactionList.find(
            t => t._id === id || t.id === id
          )
          if (foundTransaction) {
            setTransaction(foundTransaction)
          } else {
            toast.error('Transaction not found')
            navigate('/manager/transactions')
          }
        } else {
          toast.error('Failed to load transaction details')
          navigate('/manager/transactions')
        }
      } catch (error) {
        toast.error('Failed to load transaction details')
        navigate('/manager/transactions')
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchTransaction()
    }
  }, [id, navigate])

  const formatCurrency = (amount) => {
    if (!amount) return '₹0'
    return `₹${parseInt(amount).toLocaleString('en-IN')}`
  }

  const formatDate = (dateString) => {
    if (!dateString) return '-'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  }

  const formatTime = (dateString) => {
    if (!dateString) return '-'
    const date = new Date(dateString)
    return date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getPaymentStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <FaCheckCircle className="text-green-600" />
      case 'pending':
        return <FaClock className="text-yellow-600" />
      case 'refunded':
        return <FaTimesCircle className="text-red-600" />
      default:
        return <FaClock className="text-gray-600" />
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <FaSpinner className="animate-spin text-4xl text-primary-600" />
      </div>
    )
  }

  if (!transaction) {
    return null
  }

  return (
    <div className="p-3 sm:p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <FaArrowLeft />
          <span>Back</span>
        </button>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Transaction Details</h1>
            <p className="text-gray-600 mt-1">View transaction information</p>
          </div>
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${transaction.paymentStatus === 'completed'
                ? 'bg-green-100 text-green-700'
                : transaction.paymentStatus === 'pending'
                  ? 'bg-yellow-100 text-yellow-700'
                  : 'bg-red-100 text-red-700'
              }`}>
              {getPaymentStatusIcon(transaction.paymentStatus)}
              {transaction.paymentStatus || 'completed'}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Information */}
          <div className="bg-white   border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Customer Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <FaUser className="text-gray-400 text-xl" />
                <div>
                  <p className="text-sm text-gray-500">Customer Name</p>
                  <p className="font-medium text-gray-900">{transaction.customerName || '-'}</p>
                </div>
              </div>
              {transaction.customerPhone && (
                <div className="flex items-center gap-3">
                  <FaPhoneAlt className="text-gray-400 text-xl" />
                  <div>
                    <p className="text-sm text-gray-500">Phone Number</p>
                    <p className="font-medium text-gray-900">{transaction.customerPhone}</p>
                  </div>
                </div>
              )}
              {transaction.customerEmail && (
                <div className="flex items-center gap-3">
                  <FaEnvelope className="text-gray-400 text-xl" />
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium text-gray-900">{transaction.customerEmail}</p>
                  </div>
                </div>
              )}
              {transaction.isNewCustomer !== undefined && (
                <div className="flex items-center gap-3">
                  <FaUserTag className="text-gray-400 text-xl" />
                  <div>
                    <p className="text-sm text-gray-500">Customer Type</p>
                    <p className="font-medium text-gray-900">
                      {transaction.isNewCustomer ? 'New Customer' : 'Returning Customer'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Service Information */}
          <div className="bg-white   border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Service Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <FaClipboardList className="text-gray-400 text-xl" />
                <div>
                  <p className="text-sm text-gray-500">Service Name</p>
                  <p className="font-medium text-gray-900">{transaction.serviceName || '-'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <FaTags className="text-gray-400 text-xl" />
                <div>
                  <p className="text-sm text-gray-500">Service Type</p>
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${SERVICE_TYPE_COLORS[transaction.serviceType] || SERVICE_TYPE_COLORS.other
                    }`}>
                    {transaction.serviceType || 'N/A'}
                  </span>
                </div>
              </div>
              {transaction.serviceCategory && (
                <div className="flex items-center gap-3">
                  <FaTags className="text-gray-400 text-xl" />
                  <div>
                    <p className="text-sm text-gray-500">Service Category</p>
                    <p className="font-medium text-gray-900">{transaction.serviceCategory}</p>
                  </div>
                </div>
              )}
              {transaction.staff && (
                <div className="flex items-center gap-3">
                  <FaUserTag className="text-gray-400 text-xl" />
                  <div>
                    <p className="text-sm text-gray-500">Staff Member</p>
                    <p className="font-medium text-gray-900">
                      {typeof transaction.staff === 'object'
                        ? transaction.staff.name
                        : 'Staff Member'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Pricing Information */}
          <div className="bg-white   border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Pricing Breakdown</h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Base Price</span>
                <span className="font-medium text-gray-900">{formatCurrency(transaction.basePrice)}</span>
              </div>
              {transaction.discount > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Discount</span>
                  <span className="font-medium text-red-600">-{formatCurrency(transaction.discount)}</span>
                </div>
              )}
              {transaction.tax > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Tax</span>
                  <span className="font-medium text-gray-900">+{formatCurrency(transaction.tax)}</span>
                </div>
              )}
              <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                <span className="text-lg font-semibold text-gray-900">Final Price</span>
                <span className="text-lg font-bold text-primary-600">
                  {formatCurrency(transaction.finalPrice)}
                </span>
              </div>
            </div>
          </div>

          {/* Additional Information */}
          {(transaction.notes || transaction.rating) && (
            <div className="bg-white   border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Additional Information</h2>
              <div className="space-y-4">
                {transaction.notes && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <FaStickyNote className="text-gray-400" />
                      <span className="text-sm font-medium text-gray-700">Notes</span>
                    </div>
                    <p className="text-gray-900 pl-6">{transaction.notes}</p>
                  </div>
                )}
                {transaction.rating && (
                  <div className="flex items-center gap-3">
                    <FaStar className="text-yellow-500" />
                    <span className="text-sm font-medium text-gray-700">Rating:</span>
                    <span className="font-semibold text-gray-900">{transaction.rating} / 5.0</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Payment Information */}
          <div className="bg-white   border border-gray-200 p-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">Payment Information</h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Payment Method</p>
                <div className="flex items-center gap-2 mt-1">
                  <FaCreditCard className="text-gray-400" />
                  <span className="font-medium text-gray-900 capitalize">
                    {transaction.paymentMethod || '-'}
                  </span>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500">Payment Status</p>
                <div className="flex items-center gap-2 mt-1">
                  {getPaymentStatusIcon(transaction.paymentStatus)}
                  <span className="font-medium text-gray-900 capitalize">
                    {transaction.paymentStatus || 'completed'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Transaction Details */}
          <div className="bg-white   border border-gray-200 p-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">Transaction Details</h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Transaction Date</p>
                <div className="flex items-center gap-2 mt-1">
                  <FaCalendarAlt className="text-gray-400" />
                  <span className="font-medium text-gray-900">
                    {formatDate(transaction.transactionDate)}
                  </span>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500">Transaction Time</p>
                <p className="font-medium text-gray-900 mt-1">
                  {formatTime(transaction.transactionDate)}
                </p>
              </div>
              {transaction.transactionDate && (
                <div>
                  <p className="text-sm text-gray-500">Created</p>
                  <p className="font-medium text-gray-900 mt-1">
                    {formatDate(transaction.createdAt || transaction.transactionDate)}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TransactionDetails
