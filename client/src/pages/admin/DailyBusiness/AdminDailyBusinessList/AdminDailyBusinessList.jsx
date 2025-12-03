import React, { useState, useEffect, useCallback, useRef, memo } from 'react'
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

// --- Helper Functions ---
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

// --- Sub-Components ---

const Header = memo(({ onRefresh, refreshing, onBack }) => (
  <div className="mb-6">
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Daily Business Records</h1>
        <p className="text-gray-600 mt-1">View all daily business records across businesses</p>
      </div>
      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
        <button
          onClick={onBack}
          className="flex items-center gap-2 bg-gray-100 text-gray-700 px-3 sm:px-4 py-2  hover:bg-gray-200 transition-colors text-sm font-medium"
          title="Back to Dashboard"
        >
          <FiArrowLeft className="text-base sm:text-lg" />
          <span className="hidden sm:inline">Back</span>
        </button>
        <button
          onClick={onRefresh}
          disabled={refreshing}
          className="flex items-center gap-2 bg-gray-100 text-gray-700 px-3 sm:px-4 py-2  hover:bg-gray-200 transition-colors text-sm font-medium disabled:opacity-50"
          title="Refresh Records"
        >
          <FiRefreshCw className={`text-base sm:text-lg ${refreshing ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">Refresh</span>
        </button>
        <Link
          to="/admin/daily-business/analytics"
          className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 border border-primary-600 text-primary-600  hover:bg-primary-50 transition-colors text-sm font-medium"
        >
          <FaChartLine />
          <span className="hidden sm:inline">Analytics</span>
        </Link>
      </div>
    </div>
  </div>
))

const FilterSection = memo(({
  businesses,
  businessFilter,
  setBusinessFilter,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  onFilterChange,
  onClearFilters
}) => (
  <div className="bg-white   border border-gray-200 p-4 mb-6">
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {/* Business Filter */}
      {businesses.length > 0 && (
        <div className="relative">
          <FaBuilding className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <select
            value={businessFilter}
            onChange={(e) => {
              setBusinessFilter(e.target.value)
              onFilterChange()
            }}
            className="w-full pl-10 pr-4 py-2 border border-gray-300  focus:outline-none focus:ring-2 focus:ring-primary-500 appearance-none bg-white"
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
            onFilterChange()
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
            onFilterChange()
          }}
          className="w-full pl-10 pr-4 py-2 border border-gray-300  focus:outline-none focus:ring-2 focus:ring-primary-500"
          placeholder="End Date"
        />
      </div>

      {/* Clear Filters */}
      {(startDate || endDate || businessFilter) && (
        <button
          onClick={onClearFilters}
          className="px-4 py-2 border border-gray-300  text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Clear Filters
        </button>
      )}
    </div>
  </div>
))

const BusinessRecordCard = memo(({ record }) => (
  <div className="bg-white  border border-gray-200 p-4 hover:border-gray-300 transition-colors">
    <div className="flex justify-between items-start mb-3">
      <div>
        <h3 className="font-semibold text-gray-900 text-sm">
          {formatDate(record.date)}
        </h3>
        {record.business && (
          <p className="text-xs text-gray-500 mt-0.5">
            {record.business.name}
            {record.business.branch && <span className="text-gray-400"> ({record.business.branch})</span>}
          </p>
        )}
      </div>
      <Link
        to={`/admin/daily-business/${record._id || record.id}`}
        className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50  transition-colors"
        title="View Details"
      >
        <FaEye className="text-sm" />
      </Link>
    </div>

    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-gray-500 text-xs">Revenue</span>
        <span className="font-medium text-gray-900 text-sm">{formatCurrency(record.totalIncome)}</span>
      </div>
      <div className="flex justify-between items-center">
        <span className="text-gray-500 text-xs">Customers</span>
        <span className="font-medium text-gray-900 text-sm">{record.totalCustomers || 0}</span>
      </div>
      <div className="pt-2 border-t border-gray-100 flex justify-between items-center">
        <span className="text-gray-500 text-xs">Net Profit</span>
        <span className={`text-sm font-bold ${record.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          {formatCurrency(record.netProfit)}
        </span>
      </div>
    </div>
  </div>
))

const Pagination = memo(({ currentPage, totalPages, total, limit, onPageChange }) => {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between p-4 border-t border-gray-200 bg-white ">
      <div className="text-sm text-gray-600">
        Showing {(currentPage - 1) * limit + 1} to{' '}
        {Math.min(currentPage * limit, total)} of{' '}
        {total} records
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3 py-1 text-sm border border-gray-300  hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>
        <span className="px-3 py-1 text-sm text-gray-700 border border-gray-300 ">
          {currentPage} / {totalPages}
        </span>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="px-3 py-1 text-sm border border-gray-300  hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
    </div>
  )
})

// --- Main Component ---

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

  // Ref to prevent duplicate API calls (especially in React StrictMode)
  const fetchingRef = useRef(false)
  const abortControllerRef = useRef(null)

  const fetchRecords = useCallback(async () => {
    // Prevent duplicate calls
    if (fetchingRef.current) {
      return
    }

    // Cancel any ongoing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    try {
      fetchingRef.current = true
      abortControllerRef.current = new AbortController()

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
      if (e.name !== 'AbortError') {
        setError('Failed to fetch daily business records')
      }
    } finally {
      setLoading(false)
      fetchingRef.current = false
      abortControllerRef.current = null
    }
  }, [startDate, endDate, businessFilter, pagination.currentPage, pagination.limit])

  useEffect(() => {
    fetchRecords()

    // Cleanup function to abort request on unmount
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [fetchRecords])

  const handlePageChange = useCallback((newPage) => {
    setPagination(prev => ({ ...prev, currentPage: newPage }))
  }, [])

  const handleFilterChange = useCallback(() => {
    setPagination(prev => ({ ...prev, currentPage: 1 }))
  }, [])

  const handleClearFilters = useCallback(() => {
    setStartDate('')
    setEndDate('')
    setBusinessFilter('')
    setPagination(prev => ({ ...prev, currentPage: 1 }))
  }, [])

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

  // Get unique businesses from records for the filter dropdown
  // Note: ideally this list should come from a separate API call to get all businesses,
  // but for now we derive it from the loaded records as per original logic, 
  // or we could fetch all businesses if needed. 
  // Keeping original logic for now to match user request.
  const businesses = React.useMemo(() => {
    return Array.from(
      new Set(
        records
          .filter(r => r.business)
          .map(r => JSON.stringify({ id: r.business._id || r.business.id, name: r.business.name }))
      )
    ).map(str => JSON.parse(str))
  }, [records])

  return (
    <div className="p-3 sm:p-6 bg-gray-50 min-h-screen">
      <Header
        onRefresh={handleRefresh}
        refreshing={refreshing}
        onBack={handleBack}
      />

      <FilterSection
        businesses={businesses}
        businessFilter={businessFilter}
        setBusinessFilter={setBusinessFilter}
        startDate={startDate}
        setStartDate={setStartDate}
        endDate={endDate}
        setEndDate={setEndDate}
        onFilterChange={handleFilterChange}
        onClearFilters={handleClearFilters}
      />

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

          <Pagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            total={pagination.total}
            limit={pagination.limit}
            onPageChange={handlePageChange}
          />
        </>
      )}
    </div>
  )
}

export default AdminDailyBusinessList
