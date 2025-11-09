import React, { useState, useEffect, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  FaReceipt,
  FaSpinner,
  FaSearch,
  FaCalendarAlt,
  FaFilter,
  FaPlus,
  FaEye,
  FaEdit,
  FaTrash
} from 'react-icons/fa'
import { toast } from 'react-hot-toast'
import staffService from '../../../../services/staff/staffService'

const SERVICE_TYPE_OPTIONS = [
  { value: '', label: 'All Service Types' },
  { value: 'hair', label: 'Hair' },
  { value: 'facial', label: 'Facial' },
  { value: 'massage', label: 'Massage' },
  { value: 'nail', label: 'Nail' },
  { value: 'spa', label: 'Spa' },
  { value: 'room', label: 'Room' },
  { value: 'food', label: 'Food' },
  { value: 'other', label: 'Other' }
]

const SERVICE_TYPE_BADGES = {
  hair: 'bg-blue-100 text-blue-700',
  facial: 'bg-pink-100 text-pink-700',
  massage: 'bg-purple-100 text-purple-700',
  nail: 'bg-red-100 text-red-700',
  spa: 'bg-green-100 text-green-700',
  room: 'bg-yellow-100 text-yellow-700',
  food: 'bg-orange-100 text-orange-700',
  other: 'bg-gray-100 text-gray-700'
}

const formatCurrency = (amount) => {
  const numeric = Number(amount || 0)
  return `₹${numeric.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

const formatDate = (value) => {
  if (!value) return '—'
  const date = new Date(value)
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  })
}

const formatTime = (value) => {
  if (!value) return '—'
  const date = new Date(value)
  return date.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

const StaffTransactionList = () => {
  const navigate = useNavigate()
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [serviceType, setServiceType] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    total: 0,
    limit: 10
  })

  const fetchTransactions = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const params = {
        page: pagination.currentPage,
        limit: pagination.limit
      }
      if (serviceType) params.serviceType = serviceType
      if (startDate) params.startDate = startDate
      if (endDate) params.endDate = endDate

      const result = await staffService.getTransactions(params)
      if (!result.success) {
        setError(result.error || 'Failed to load transactions')
        return
      }

      const list = result.data?.data || []
      let filtered = list
      if (debouncedSearch) {
        const needle = debouncedSearch.toLowerCase()
        filtered = list.filter((transaction) =>
          transaction.customerName?.toLowerCase().includes(needle) ||
          transaction.customerPhone?.includes(debouncedSearch) ||
          transaction.serviceName?.toLowerCase().includes(needle)
        )
      }

      setTransactions(filtered)

      if (result.data?.pagination) {
        const { page: currentPage, pages, total, limit } = result.data.pagination
        setPagination((prev) => ({
          ...prev,
          currentPage: currentPage || prev.currentPage,
          totalPages: pages || prev.totalPages,
          total: total || prev.total,
          limit: limit || prev.limit
        }))
      }
    } catch (err) {
      console.error('Failed to fetch transactions', err)
      setError('Failed to load transactions')
    } finally {
      setLoading(false)
    }
  }, [debouncedSearch, serviceType, startDate, endDate, pagination.currentPage, pagination.limit])

  useEffect(() => {
    fetchTransactions()
  }, [fetchTransactions])

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedSearch(search.trim())
    }, 300)
    return () => clearTimeout(timeout)
  }, [search])

  const handleFilterChange = () => {
    setPagination((prev) => ({ ...prev, currentPage: 1 }))
  }

  const handlePageChange = (page) => {
    setPagination((prev) => ({ ...prev, currentPage: page }))
  }

  const handleDelete = async (transactionId) => {
    const confirmed = window.confirm('Are you sure you want to delete this transaction?')
    if (!confirmed) return

    const result = await staffService.deleteTransaction(transactionId)
    if (result.success) {
      toast.success('Transaction deleted successfully')
      fetchTransactions()
    } else {
      toast.error(result.error || 'Failed to delete transaction')
    }
  }

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">My Transactions</h1>
          <p className="text-sm text-gray-600">Track the services you have completed and their payments.</p>
        </div>
        <button
          onClick={() => navigate('/staff/transactions/add')}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          <FaPlus />
          <span>Add Transaction</span>
        </button>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by customer or service"
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div className="relative">
            <FaCalendarAlt className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value)
                handleFilterChange()
              }}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div className="relative">
            <FaCalendarAlt className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value)
                handleFilterChange()
              }}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div className="relative">
            <FaFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <select
              value={serviceType}
              onChange={(e) => {
                setServiceType(e.target.value)
                handleFilterChange()
              }}
              className="w-full pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 appearance-none"
            >
              {SERVICE_TYPE_OPTIONS.map((option) => (
                <option key={option.value || 'all'} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-16">
          <FaSpinner className="w-8 h-8 animate-spin text-primary-600" />
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4">
          {error}
        </div>
      ) : transactions.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
          <FaReceipt className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No transactions found</h3>
          <p className="text-sm text-gray-600 mb-6">Create your first transaction to see it listed here.</p>
          <button
            onClick={() => navigate('/staff/transactions/add')}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <FaPlus />
            <span>Add Transaction</span>
          </button>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Service</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Payment</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Date & Time</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"></th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {transactions.map((transaction) => (
                  <tr key={transaction._id || transaction.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="font-medium">{transaction.customerName || 'Walk-in Customer'}</div>
                      {transaction.customerPhone && (
                        <div className="text-xs text-gray-500">{transaction.customerPhone}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      <div>{transaction.serviceName || '—'}</div>
                      {transaction.serviceCategory && (
                        <div className="text-xs text-gray-500">{transaction.serviceCategory}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        SERVICE_TYPE_BADGES[transaction.serviceType] || SERVICE_TYPE_BADGES.other
                      }`}>
                        {transaction.serviceType || 'Other'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">
                      {formatCurrency(transaction.finalPrice)}
                      {transaction.discount > 0 && (
                        <div className="text-xs text-gray-500">Discount: {formatCurrency(transaction.discount)}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      <div className="capitalize">{transaction.paymentMethod || 'cash'}</div>
                      <div className={`inline-flex mt-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                        transaction.paymentStatus === 'completed'
                          ? 'bg-green-100 text-green-700'
                          : transaction.paymentStatus === 'pending'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {transaction.paymentStatus || 'completed'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      <div>{formatDate(transaction.transactionDate)}</div>
                      <div className="text-xs text-gray-500">{formatTime(transaction.transactionDate)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-3">
                        <Link
                          to={`/staff/transactions/${transaction._id || transaction.id}`}
                          className="inline-flex items-center gap-1 text-primary-600 hover:text-primary-800"
                        >
                          <FaEye className="text-xs" />
                          View
                        </Link>
                        <Link
                          to={`/staff/transactions/${transaction._id || transaction.id}/edit`}
                          className="inline-flex items-center gap-1 text-amber-600 hover:text-amber-800"
                        >
                          <FaEdit className="text-xs" />
                          Edit
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleDelete(transaction._id || transaction.id)}
                          className="inline-flex items-center gap-1 text-red-600 hover:text-red-800"
                        >
                          <FaTrash className="text-xs" />
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {pagination.totalPages > 1 && (
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50 text-sm text-gray-600">
              <div>
                Showing {(pagination.currentPage - 1) * pagination.limit + 1} to{' '}
                {Math.min(pagination.currentPage * pagination.limit, pagination.total)} of {pagination.total} transactions
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handlePageChange(Math.max(1, pagination.currentPage - 1))}
                  disabled={pagination.currentPage === 1}
                  className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-white disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="px-3 py-1 border border-gray-300 rounded-lg bg-white">
                  {pagination.currentPage} / {pagination.totalPages}
                </span>
                <button
                  onClick={() => handlePageChange(Math.min(pagination.totalPages, pagination.currentPage + 1))}
                  disabled={pagination.currentPage >= pagination.totalPages}
                  className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-white disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default StaffTransactionList
