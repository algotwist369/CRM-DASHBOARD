import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  FaCalendarAlt,
  FaRupeeSign,
  FaUsers,
  FaSpinner,
  FaEye,
  FaChartLine,
  FaBuilding
} from 'react-icons/fa'
import { FiRefreshCw, FiArrowLeft } from 'react-icons/fi'
import { toast } from 'react-hot-toast'
import adminService from '../../../../services/admin/adminService'

const AdminDailyBusinessList = () => {
  const navigate = useNavigate()
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [businessFilter, setBusinessFilter] = useState('')
  const [refreshing, setRefreshing] = useState(false)
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    limit: 10,
    total: 0,
  })

  const fetchRecords = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const params = {
        page: pagination.currentPage,
        limit: pagination.limit,
      }
      if (startDate) params.startDate = startDate
      if (endDate) params.endDate = endDate
      if (businessFilter) params.businessId = businessFilter

      const res = await adminService.getDailyBusinessRecords(params)
      if (res.success) {
        const recordsData = res.data?.data || []
        setRecords(recordsData)
        if (res.data?.pagination) {
          setPagination(prev => ({
            ...prev,
            totalPages: res.data.pagination.pages || 1,
            total: res.data.pagination.total || 0,
          }))
        }
      } else {
        setError(res.error || 'Failed to fetch daily business records')
      }
    } catch (e) {
      setError('Failed to fetch daily business records')
    } finally {
      setLoading(false)
    }
  }, [startDate, endDate, businessFilter, pagination.currentPage, pagination.limit])

  useEffect(() => {
    fetchRecords()
  }, [fetchRecords])

  const handlePageChange = useCallback((newPage) => {
    setPagination(prev => ({ ...prev, currentPage: newPage }))
  }, [])

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

  const handleFilterChange = () => {
    setPagination(prev => ({ ...prev, currentPage: 1 }))
  }

  const handleRefresh = useCallback(async () => {
    setRefreshing(true)
    try {
      await fetchRecords()
      toast.success('Records refreshed successfully')
    } catch (error) {
      toast.error('Failed to refresh records')
    } finally {
      setRefreshing(false)
    }
  }, [fetchRecords])

  const handleBack = useCallback(() => {
    navigate('/admin/dashboard')
  }, [navigate])

  // Get unique businesses from records
  const businesses = Array.from(
    new Set(
      records
        .filter(r => r.business)
        .map(r => ({ id: r.business._id || r.business.id, name: r.business.name }))
    )
  ).reduce((acc, curr) => {
    if (!acc.find(b => b.id === curr.id)) {
      acc.push(curr)
    }
    return acc
  }, [])

  return (
    <div className="p-3 sm:p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Daily Business Records</h1>
            <p className="text-gray-600 mt-1">View all daily business records across businesses</p>
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <button 
              onClick={handleBack} 
              className="flex items-center gap-2 bg-gray-100 text-gray-700 px-3 sm:px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
              title="Back to Dashboard"
            >
              <FiArrowLeft className="text-base sm:text-lg" />
              <span className="hidden sm:inline">Back</span>
            </button>
            <button 
              onClick={handleRefresh} 
              disabled={refreshing}
              className="flex items-center gap-2 bg-gray-100 text-gray-700 px-3 sm:px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium disabled:opacity-50"
              title="Refresh Records"
            >
              <FiRefreshCw className={`text-base sm:text-lg ${refreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
            <Link
              to="/admin/daily-business/analytics"
              className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 border border-primary-600 text-primary-600 rounded-lg hover:bg-primary-50 transition-colors text-sm font-medium"
            >
              <FaChartLine />
              <span className="hidden sm:inline">Analytics</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Business Filter */}
          {businesses.length > 0 && (
            <div className="relative">
              <FaBuilding className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <select
                value={businessFilter}
                onChange={(e) => {
                  setBusinessFilter(e.target.value)
                  handleFilterChange()
                }}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 appearance-none bg-white"
              >
                <option value="">All Businesses</option>
                {businesses.map((business) => (
                  <option key={business.id} value={business.id}>
                    {business.name}
                  </option>
                ))}
              </select>
            </div>
          )}

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
              placeholder="Start Date"
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
              placeholder="End Date"
            />
          </div>

          {/* Clear Filters */}
          {(startDate || endDate || businessFilter) && (
            <button
              onClick={() => {
                setStartDate('')
                setEndDate('')
                setBusinessFilter('')
                handleFilterChange()
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Clear Filters
            </button>
          )}
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
      ) : records.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <FaCalendarAlt className="text-6xl text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No daily business records found</h3>
          <p className="text-gray-500">No records match your filter criteria</p>
        </div>
      ) : (
        <>
          {/* Records Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {records.map((record) => (
              <div
                key={record._id || record.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow"
              >
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-1">
                    <FaCalendarAlt className="text-primary-600" />
                    <h3 className="font-semibold text-gray-900">
                      {formatDate(record.date)}
                    </h3>
                  </div>
                  {record.business && (
                    <div className="flex items-center gap-2">
                      <FaBuilding className="text-gray-400 text-sm" />
                      <p className="text-sm text-gray-500">{record.business.name}</p>
                      {record.business.branch && (
                        <span className="text-xs text-gray-400">({record.business.branch})</span>
                      )}
                    </div>
                  )}
                  {record.manager && (
                    <p className="text-xs text-gray-400 mt-1">
                      Manager: {typeof record.manager === 'object' ? record.manager.name : record.manager}
                    </p>
                  )}
                </div>

                <div className="space-y-3">
                  {/* Revenue */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-gray-600">
                      <FaRupeeSign className="text-green-600" />
                      <span className="text-sm">Revenue</span>
                    </div>
                    <span className="font-semibold text-gray-900">
                      {formatCurrency(record.totalIncome)}
                    </span>
                  </div>

                  {/* Customers */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-gray-600">
                      <FaUsers className="text-blue-600" />
                      <span className="text-sm">Customers</span>
                    </div>
                    <span className="font-semibold text-gray-900">
                      {record.totalCustomers || 0}
                    </span>
                  </div>

                  {/* Expenses & Profit */}
                  <div className="pt-3 border-t border-gray-100 space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Expenses</span>
                      <span className="text-red-600 font-medium">
                        {formatCurrency(record.totalExpenses)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700 font-medium">Net Profit</span>
                      <span className={`font-bold ${
                        record.netProfit >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {formatCurrency(record.netProfit)}
                      </span>
                    </div>
                  </div>

                  {/* View Details Button */}
                  <div className="pt-3 border-t border-gray-100">
                    <Link
                      to={`/admin/daily-business/${record._id || record.id}`}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                    >
                      <FaEye />
                      <span>View Details</span>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between p-4 border-t border-gray-200 bg-white rounded-xl">
              <div className="text-sm text-gray-600">
                Showing {(pagination.currentPage - 1) * pagination.limit + 1} to{' '}
                {Math.min(pagination.currentPage * pagination.limit, pagination.total)} of{' '}
                {pagination.total} records
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={pagination.currentPage === 1}
                  className="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="px-3 py-1 text-sm text-gray-700 border border-gray-300 rounded-lg">
                  {pagination.currentPage} / {pagination.totalPages}
                </span>
                <button
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  disabled={pagination.currentPage >= pagination.totalPages}
                  className="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default AdminDailyBusinessList

