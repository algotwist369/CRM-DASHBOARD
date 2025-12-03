import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  FaCalendarAlt,
  FaDollarSign,
  FaUsers,
  FaSpinner,
  FaSearch,
  FaFilter,
  FaEye,
  FaPlus,
  FaEdit,
  FaTrash,
  FaChartLine,
  FaArrowLeft
} from 'react-icons/fa'
import { toast } from 'react-hot-toast'
import managerService from '../../../../services/manager/managerService'

const DailyBusinessList = () => {
  const navigate = useNavigate()
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [deleting, setDeleting] = useState(null)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
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

      const res = await managerService.getDailyBusinessRecords(params)
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
  }, [startDate, endDate, pagination.currentPage, pagination.limit])

  useEffect(() => {
    fetchRecords()
  }, [fetchRecords])

  const handlePageChange = useCallback((newPage) => {
    setPagination(prev => ({ ...prev, currentPage: newPage }))
  }, [])

  const handleDelete = async (recordId) => {
    if (!window.confirm('Are you sure you want to delete this daily business record?')) {
      return
    }

    try {
      setDeleting(recordId)
      const res = await managerService.deleteDailyBusiness(recordId)
      if (res.success) {
        toast.success('Daily business record deleted successfully')
        fetchRecords()
      } else {
        toast.error(res.error || 'Failed to delete record')
      }
    } catch (e) {
      toast.error('Failed to delete record')
    } finally {
      setDeleting(null)
    }
  }

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

  return (
    <div className="p-3 sm:p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Daily Business Records</h1>
            <p className="text-gray-600 mt-1">Track your daily business performance</p>
          </div>
          <div className="flex gap-3">
            <Link
              to="/manager/daily-business/analytics"
              className="flex items-center justify-center gap-2 px-4 py-2 border border-primary-600 text-primary-600  hover:bg-primary-50 transition-colors"
            >
              <FaChartLine />
              <span>Analytics</span>
            </Link>
            <Link
              to="/manager/daily-business/add"
              className="flex items-center justify-center gap-2 px-4 py-2 bg-primary-600 text-white  hover:bg-primary-700 transition-colors"
            >
              <FaPlus />
              <span>Add Record</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white   border border-gray-200 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              className="w-full pl-10 pr-4 py-2 border border-gray-300  focus:outline-none focus:ring-2 focus:ring-primary-500"
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
              className="w-full pl-10 pr-4 py-2 border border-gray-300  focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="End Date"
            />
          </div>

          {/* Clear Filters */}
          {(startDate || endDate) && (
            <button
              onClick={() => {
                setStartDate('')
                setEndDate('')
                handleFilterChange()
              }}
              className="px-4 py-2 border border-gray-300  text-gray-700 hover:bg-gray-50 transition-colors"
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
        <div className="bg-red-50 border border-red-200  p-4 text-red-600">
          {error}
        </div>
      ) : records.length === 0 ? (
        <div className="bg-white   border border-gray-200 p-12 text-center">
          <FaCalendarAlt className="text-6xl text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No daily business records found</h3>
          <p className="text-gray-500 mb-6">Get started by adding your first daily business record</p>
          <Link
            to="/manager/daily-business/add"
            className="inline-flex items-center gap-2 px-6 py-2 bg-primary-600 text-white  hover:bg-primary-700 transition-colors"
          >
            <FaPlus />
            <span>Add Record</span>
          </Link>
        </div>
      ) : (
        <>
          {/* Records Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {records.map((record) => (
              <div
                key={record._id || record.id}
                className="bg-white   border border-gray-200 p-5 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <FaCalendarAlt className="text-primary-600" />
                      <h3 className="font-semibold text-gray-900">
                        {formatDate(record.date)}
                      </h3>
                    </div>
                    {record.business && (
                      <p className="text-sm text-gray-500">{record.business.name}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Link
                      to={`/manager/daily-business/${record._id || record.id}`}
                      className="p-2 text-blue-600 hover:bg-blue-50  transition-colors"
                      title="View Details"
                    >
                      <FaEye />
                    </Link>
                    <Link
                      to={`/manager/daily-business/${record._id || record.id}/edit`}
                      className="p-2 text-gray-600 hover:bg-gray-50  transition-colors"
                      title="Edit"
                    >
                      <FaEdit />
                    </Link>
                    <button
                      onClick={() => handleDelete(record._id || record.id)}
                      disabled={deleting === (record._id || record.id)}
                      className="p-2 text-red-600 hover:bg-red-50  transition-colors disabled:opacity-50"
                      title="Delete"
                    >
                      {deleting === (record._id || record.id) ? (
                        <FaSpinner className="animate-spin" />
                      ) : (
                        <FaTrash />
                      )}
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  {/* Revenue */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-gray-600">
                      <FaDollarSign className="text-green-600" />
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

                  {/* Services Count */}
                  {record.services && record.services.length > 0 && (
                    <div className="pt-3 border-t border-gray-100">
                      <p className="text-xs text-gray-500">
                        {record.services.length} service{record.services.length !== 1 ? 's' : ''} recorded
                      </p>
                    </div>
                  )}

                  {/* Completion Status */}
                  {record.isCompleted !== undefined && (
                    <div className="pt-2">
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                        record.isCompleted
                          ? 'bg-green-100 text-green-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {record.isCompleted ? 'Completed' : 'Pending'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between p-4 border-t border-gray-200 bg-white ">
              <div className="text-sm text-gray-600">
                Showing {(pagination.currentPage - 1) * pagination.limit + 1} to{' '}
                {Math.min(pagination.currentPage * pagination.limit, pagination.total)} of{' '}
                {pagination.total} records
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={pagination.currentPage === 1}
                  className="px-3 py-1 text-sm border border-gray-300  hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="px-3 py-1 text-sm text-gray-700 border border-gray-300 ">
                  {pagination.currentPage} / {pagination.totalPages}
                </span>
                <button
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  disabled={pagination.currentPage >= pagination.totalPages}
                  className="px-3 py-1 text-sm border border-gray-300  hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
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

export default DailyBusinessList
