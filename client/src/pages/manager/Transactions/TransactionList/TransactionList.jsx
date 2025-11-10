import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  FaRupeeSign,
  FaCalendarAlt,
  FaUser,
  FaPhoneAlt,
  FaSpinner,
  FaSearch,
  FaFilter,
  FaEye,
  FaPlus,
  FaReceipt
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

const PAYMENT_STATUS_COLORS = {
  completed: 'bg-green-100 text-green-700',
  approved: 'bg-green-100 text-green-700',
  pending: 'bg-yellow-100 text-yellow-700',
  refunded: 'bg-red-100 text-red-700',
  failed: 'bg-red-100 text-red-700',
}

const PAYMENT_METHOD_COLORS = {
  cash: 'bg-gray-100 text-gray-700',
  card: 'bg-blue-100 text-blue-700',
  upi: 'bg-purple-100 text-purple-700',
  wallet: 'bg-emerald-100 text-emerald-700',
  other: 'bg-slate-100 text-slate-700',
}

const TransactionList = () => {
  const navigate = useNavigate()
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [filterServiceType, setFilterServiceType] = useState('')
  const [filterPaymentStatus, setFilterPaymentStatus] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    limit: 10,
    total: 0,
  })

  const fetchTransactions = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const params = {
        page: pagination.currentPage,
        limit: pagination.limit,
      }
      if (startDate) params.startDate = startDate
      if (endDate) params.endDate = endDate
      if (filterServiceType) params.serviceType = filterServiceType
      if (filterPaymentStatus) params.paymentStatus = filterPaymentStatus

      const res = await managerService.getTransactions(params)
      if (res.success) {
        const transactionData = res.data?.data || []
        let filteredData = transactionData
        if (debouncedSearch) {
          filteredData = transactionData.filter(t =>
            t.customerName?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
            t.customerPhone?.includes(debouncedSearch) ||
            t.serviceName?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
            t.paymentMethod?.toLowerCase().includes(debouncedSearch.toLowerCase())
          )
        }
        setTransactions(filteredData)
        if (res.data?.pagination) {
          setPagination(prev => ({
            ...prev,
            totalPages: res.data.pagination.pages || 1,
            total: res.data.pagination.total || 0,
          }))
        }
      } else {
        setError(res.error || 'Failed to fetch transactions')
        toast.error(res.error || 'Failed to fetch transactions')
      }
    } catch (e) {
      setError('Failed to fetch transactions')
      toast.error('Failed to fetch transactions')
    } finally {
      setLoading(false)
    }
  }, [debouncedSearch, filterServiceType, filterPaymentStatus, startDate, endDate, pagination.currentPage, pagination.limit])

  useEffect(() => {
    fetchTransactions()
  }, [fetchTransactions])

  useEffect(() => {
    const id = setTimeout(() => setDebouncedSearch(search.trim()), 400)
    return () => clearTimeout(id)
  }, [search])

  const handlePageChange = useCallback((newPage) => {
    setPagination(prev => ({ ...prev, currentPage: newPage }))
  }, [])

  const handleFilterChange = useCallback(() => {
    setPagination(prev => ({ ...prev, currentPage: 1 }))
  }, [])

  const formatCurrency = (amount) => {
    const value = Number(amount || 0)
    return value.toLocaleString('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: value < 1000 ? 2 : 0
    })
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

  const summary = useMemo(() => {
    const base = {
      overallCount: pagination.total || 0,
      pageCount: transactions.length,
      completed: 0,
      pending: 0,
      refunded: 0,
      revenue: 0,
      averageTicket: 0
    }

    if (!transactions.length) {
      return base
    }

    let revenue = 0
    let completed = 0
    let pending = 0
    let refunded = 0

    transactions.forEach((transaction) => {
      const amount = Number(transaction.finalPrice || 0)
      revenue += amount

      const status = (transaction.paymentStatus || '').toLowerCase()
      if (status === 'completed') completed += 1
      else if (status === 'pending') pending += 1
      else if (status === 'refunded') refunded += 1
    })

    return {
      overallCount: pagination.total || transactions.length,
      pageCount: transactions.length,
      completed,
      pending,
      refunded,
      revenue,
      averageTicket: transactions.length ? revenue / transactions.length : 0
    }
  }, [transactions, pagination.total])

  return (
    <div className="p-3 sm:p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Transactions</h1>
            <p className="text-gray-600 mt-1">View and manage all transactions</p>
          </div>
          <Link
            to="/manager/transactions/add"
            className="flex items-center justify-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <FaPlus />
            <span>Add Transaction</span>
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search transactions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          {/* Start Date */}
          <div className="relative">
            <FaCalendarAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
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

          {/* End Date */}
          <div className="relative">
            <FaCalendarAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
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

          {/* Service Type Filter */}
          <div className="relative">
            <FaFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <select
              value={filterServiceType}
              onChange={(e) => {
                setFilterServiceType(e.target.value)
                handleFilterChange()
              }}
              className="w-full pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 appearance-none bg-white"
            >
              <option value="">All Service Types</option>
              <option value="hair">Hair</option>
              <option value="facial">Facial</option>
              <option value="massage">Massage</option>
              <option value="nail">Nail</option>
              <option value="spa">Spa</option>
              <option value="room">Room</option>
              <option value="food">Food</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Payment Status Filter */}
          <div className="relative">
            <FaFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <select
              value={filterPaymentStatus}
              onChange={(e) => {
                setFilterPaymentStatus(e.target.value)
                handleFilterChange()
              }}
              className="w-full pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 appearance-none bg-white"
            >
              <option value="">All Payment Status</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="refunded">Refunded</option>
            </select>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
          <p className="text-xs uppercase text-gray-500 tracking-wide">Total Transactions</p>
          <p className="mt-2 text-2xl font-semibold text-gray-900">{summary.overallCount}</p>
          <p className="text-xs text-gray-500 mt-1">Showing {summary.pageCount} on this page</p>
        </div>
        <div className="bg-white border border-green-200 rounded-xl p-4 shadow-sm">
          <p className="text-xs uppercase text-green-600 tracking-wide">Completed</p>
          <p className="mt-2 text-2xl font-semibold text-green-700">{summary.completed}</p>
          <p className="text-xs text-green-500 mt-1">Payments received</p>
        </div>
        <div className="bg-white border border-yellow-200 rounded-xl p-4 shadow-sm">
          <p className="text-xs uppercase text-yellow-600 tracking-wide">Pending</p>
          <p className="mt-2 text-2xl font-semibold text-yellow-700">{summary.pending}</p>
          <p className="text-xs text-yellow-500 mt-1">Awaiting payment confirmation</p>
        </div>
        <div className="bg-white border border-blue-200 rounded-xl p-4 shadow-sm">
          <p className="text-xs uppercase text-blue-600 tracking-wide">Revenue (Page)</p>
          <p className="mt-2 text-2xl font-semibold text-blue-700">{formatCurrency(summary.revenue)}</p>
          <p className="text-xs text-blue-500 mt-1">Avg ticket {formatCurrency(summary.averageTicket)}</p>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <FaSpinner className="animate-spin text-4xl text-primary-600" />
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-600">
          {error}
        </div>
      ) : transactions.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <FaReceipt className="text-6xl text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No transactions found</h3>
          <p className="text-gray-500 mb-6">Get started by adding your first transaction</p>
          <Link
            to="/manager/transactions/add"
            className="inline-flex items-center gap-2 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <FaPlus />
            <span>Add Transaction</span>
          </Link>
        </div>
      ) : (
        <>
          {/* Transactions Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Service
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Payment
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date & Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {transactions.map((transaction) => (
                    <tr key={transaction._id || transaction.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {transaction.customerName || '-'}
                            </div>
                            {transaction.customerPhone && (
                              <div className="text-sm text-gray-500 flex items-center gap-1">

                                {transaction.customerPhone}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{transaction.serviceName || '-'}</div>
                        {transaction.serviceCategory && (
                          <div className="text-sm text-gray-500">{transaction.serviceCategory}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                          SERVICE_TYPE_COLORS[transaction.serviceType] || SERVICE_TYPE_COLORS.other
                        }`}>
                          {transaction.serviceType || 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <FaRupeeSign className="text-green-600" />
                          <span className="text-sm font-semibold text-gray-900">
                            {formatCurrency(transaction.finalPrice)}
                          </span>
                        </div>
                        {transaction.discount > 0 && (
                          <div className="text-xs text-gray-500">
                            Discount: {formatCurrency(transaction.discount)}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col gap-1">
                          <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium capitalize ${
                            PAYMENT_METHOD_COLORS[transaction.paymentMethod] || PAYMENT_METHOD_COLORS.other
                          }`}>
                            {transaction.paymentMethod || 'N/A'}
                          </span>
                          <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium capitalize ${
                            PAYMENT_STATUS_COLORS[transaction.paymentStatus] || PAYMENT_STATUS_COLORS.pending
                          }`}>
                            {transaction.paymentStatus || 'pending'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{formatDate(transaction.transactionDate)}</div>
                        <div className="text-sm text-gray-500">{formatTime(transaction.transactionDate)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <Link
                          to={`/manager/transactions/${transaction._id || transaction.id}`}
                          className="text-primary-600 hover:text-primary-900 inline-flex items-center gap-1"
                        >
                          <FaEye />
                          <span>View</span>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50">
                <div className="text-sm text-gray-600">
                  Showing {(pagination.currentPage - 1) * pagination.limit + 1} to{' '}
                  {Math.min(pagination.currentPage * pagination.limit, pagination.total)} of{' '}
                  {pagination.total} transactions
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                    disabled={pagination.currentPage === 1}
                    className="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <span className="px-3 py-1 text-sm text-gray-700 border border-gray-300 rounded-lg bg-white">
                    {pagination.currentPage} / {pagination.totalPages}
                  </span>
                  <button
                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                    disabled={pagination.currentPage >= pagination.totalPages}
                    className="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}

export default TransactionList
