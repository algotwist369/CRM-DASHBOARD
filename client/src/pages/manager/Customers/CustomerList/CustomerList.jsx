import React, { useState, useEffect, useCallback, useMemo, memo, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import {
  FaUsers,
  FaSearch,
  FaEye,
  FaSpinner,
  FaPhoneAlt,
  FaStar,
  FaChartLine
} from 'react-icons/fa'
import managerService from '../../../../services/manager/managerService'

// Memoized Stat Card
const StatCard = memo(({ title, value, color = "text-gray-900" }) => (
  <div className="bg-white border border-gray-200 p-3">
    <p className="text-xs text-gray-500">{title}</p>
    <p className={`text-xl font-semibold ${color}`}>{value}</p>
  </div>
))

// Memoized Customer Row - Updated to match backend response
const CustomerRow = memo(({ customer, onView, onUpdateTier, formatCurrency, formatDate, getSegment }) => {
  const segment = getSegment(customer)
  const isWalkin = (customer.id || customer._id)?.toString().startsWith('walkin_');

  return (
    <tr className="border-b border-gray-100 hover:bg-gray-50">
      <td className="px-3 py-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-primary-600 text-sm font-medium">
              {customer.fullName?.charAt(0) || 'C'}
            </span>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{customer.fullName}</p>
            <p className="text-xs text-gray-500 truncate hidden sm:block">{customer.email || '-'}</p>
          </div>
        </div>
      </td>
      <td className="px-3 py-3 hidden md:table-cell">
        <div className="flex items-center gap-1 text-sm text-gray-600">
          <FaPhoneAlt className="text-gray-400" size={10} />
          {customer.phone}
        </div>
      </td>
      <td className="px-3 py-3">
        <span className={`px-2 py-0.5 rounded-full text-xs ${segment.color}`}>
          {segment.label}
        </span>
      </td>
      <td className="px-3 py-3 text-sm text-gray-900 hidden lg:table-cell">
        {customer.totalVisits || 0}
      </td>
      <td className="px-3 py-3 text-sm font-medium text-gray-900">
        {formatCurrency(customer.totalSpent || 0)}
      </td>
      <td className="px-3 py-3 text-sm text-gray-500 hidden lg:table-cell">
        {formatDate(customer.lastVisit)}
      </td>
      <td className="px-3 py-3 hidden sm:table-cell" onClick={(e) => e.stopPropagation()}>
        <select
          value={customer.membershipTier || 'none'}
          onChange={(e) => onUpdateTier(customer.id || customer._id, e.target.value)}
          disabled={isWalkin}
          title={isWalkin ? "Register customer to update tier" : "Update Tier"}
          className={`px-2 py-1 rounded text-xs border-0 focus:ring-0 ${isWalkin ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
            } ${customer.membershipTier === 'platinum' ? 'bg-purple-100 text-purple-700' :
              customer.membershipTier === 'gold' ? 'bg-yellow-100 text-yellow-700' :
                customer.membershipTier === 'silver' ? 'bg-gray-100 text-gray-700' :
                  customer.membershipTier === 'bronze' ? 'bg-orange-100 text-orange-700' :
                    'bg-gray-100 text-gray-600'
            }`}
        >
          <option value="none" className="bg-white text-gray-600">None</option>
          <option value="bronze" className="bg-white text-orange-700">Bronze</option>
          <option value="silver" className="bg-white text-gray-700">Silver</option>
          <option value="gold" className="bg-white text-yellow-700">Gold</option>
          <option value="platinum" className="bg-white text-purple-700">Platinum</option>
        </select>
      </td>
      <td className="px-3 py-3 text-right">
        <button
          onClick={(e) => { e.stopPropagation(); onView(customer.id || customer._id) }}
          className="p-1.5 text-primary-600 hover:bg-primary-50"
        >
          <FaEye size={14} />
        </button>
      </td>
    </tr>
  )
})

// Memoized Pagination
const Pagination = memo(({ page, pages, total, limit, onPageChange }) => {
  if (pages <= 1) return null

  return (
    <div className="flex items-center justify-between p-3 border-t border-gray-200 text-sm">
      <span className="text-gray-500 hidden sm:inline">
        {((page - 1) * limit) + 1}-{Math.min(page * limit, total)} of {total}
      </span>
      <div className="flex gap-2">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          className="px-3 py-1 border border-gray-300 hover:bg-gray-50 disabled:opacity-50"
        >
          Prev
        </button>
        <span className="px-3 py-1 bg-gray-100 border border-gray-200">
          {page}/{pages}
        </span>
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= pages}
          className="px-3 py-1 border border-gray-300 hover:bg-gray-50 disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  )
})

const CustomerList = () => {
  const navigate = useNavigate()
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('')  // customerType: new, regular, vip, inactive
  const [sortBy, setSortBy] = useState('lastVisit')
  const [sortOrder, setSortOrder] = useState('desc')
  const [pagination, setPagination] = useState({ page: 1, limit: 12, total: 0, pages: 0 })

  // Refs for preventing duplicate calls
  const fetchingRef = useRef(false)
  const lastParamsRef = useRef('')

  const fetchCustomers = useCallback(async () => {
    const params = {
      page: pagination.page,
      limit: pagination.limit,
      sortBy,
      sortOrder,
      search: debouncedSearch || undefined,
      customerType: typeFilter || undefined
    }

    // Prevent duplicate calls
    const paramsKey = JSON.stringify(params)
    if (paramsKey === lastParamsRef.current) return
    if (fetchingRef.current) return

    try {
      fetchingRef.current = true
      lastParamsRef.current = paramsKey
      setLoading(true)

      const result = await managerService.getCustomers(params)

      if (result.success) {
        // Backend returns data directly in result.data.data
        setCustomers(result.data.data || [])
        setPagination(prev => ({
          ...prev,
          total: result.data.pagination?.total || 0,
          pages: result.data.pagination?.pages || 0
        }))
      } else {
        toast.error(result.error || 'Failed to fetch customers')
      }
    } catch (error) {
      toast.error('Failed to fetch customers')
    } finally {
      setLoading(false)
      fetchingRef.current = false
    }
  }, [pagination.page, pagination.limit, debouncedSearch, typeFilter, sortBy, sortOrder])

  useEffect(() => {
    fetchCustomers()
  }, [fetchCustomers])

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm)
      setPagination(prev => ({ ...prev, page: 1 }))
    }, 400)
    return () => clearTimeout(timer)
  }, [searchTerm])

  const formatCurrency = useCallback((amount) => {
    return `₹${(amount || 0).toLocaleString('en-IN')}`
  }, [])

  const formatDate = useCallback((dateString) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })
  }, [])

  // Segment based on backend customerType field
  const getSegment = useCallback((customer) => {
    const type = customer.customerType

    // Use customerType from backend directly
    if (type === 'vip') return { label: 'VIP', color: 'bg-yellow-100 text-yellow-700' }
    if (type === 'regular') return { label: 'Regular', color: 'bg-blue-100 text-blue-700' }
    if (type === 'inactive') return { label: 'Inactive', color: 'bg-red-100 text-red-700' }
    if (type === 'new') return { label: 'New', color: 'bg-green-100 text-green-700' }

    return { label: 'Active', color: 'bg-gray-100 text-gray-600' }
  }, [])

  const handlePageChange = useCallback((newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }))
  }, [])

  const handleView = useCallback((id) => {
    navigate(`/manager/customers/${id}`)
  }, [navigate])

  const handleUpdateTier = useCallback(async (customerId, newTier) => {
    try {
      const result = await managerService.updateCustomerTier(customerId, newTier)
      if (result.success) {
        toast.success(`Tier updated to ${newTier}`)
        setCustomers(prev => prev.map(c =>
          (c.id === customerId || c._id === customerId) ? { ...c, membershipTier: newTier } : c
        ))
      } else {
        toast.error(result.error || 'Failed to update tier')
      }
    } catch (error) {
      toast.error('Failed to update tier')
    }
  }, [])

  // Memoized stats from backend data
  const stats = useMemo(() => {
    const totalSpent = customers.reduce((sum, c) => sum + (c.totalSpent || 0), 0)
    const activeCount = customers.filter(c => c.isActive !== false).length
    return {
      total: pagination.total,
      active: activeCount,
      revenue: formatCurrency(totalSpent),
      avgSpend: formatCurrency(customers.length > 0 ? totalSpent / customers.length : 0)
    }
  }, [customers, pagination.total, formatCurrency])

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <FaUsers className="text-primary-600" />
            Customers
          </h1>
          <p className="text-sm text-gray-600">Manage your customer base</p>
        </div>
        <button
          onClick={() => navigate('/manager/customers/analytics')}
          className="flex items-center gap-2 px-3 py-2 bg-primary-600 text-white text-sm hover:bg-primary-700"
        >
          <FaChartLine size={14} />
          <span className="hidden sm:inline">Analytics</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        <StatCard title="Total" value={stats.total} />
        <StatCard title="Active" value={stats.active} color="text-green-600" />
        <StatCard title="Revenue" value={stats.revenue} color="text-blue-600" />
        <StatCard title="Avg Spend" value={stats.avgSpend} color="text-purple-600" />
      </div>

      {/* Filters */}
      <div className="bg-white border border-gray-200 p-3 mb-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={14} />
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-gray-300 text-sm focus:outline-none focus:border-primary-500"
            />
          </div>
          <select
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value)
              setPagination(prev => ({ ...prev, page: 1 }))
            }}
            className="px-3 py-2 border border-gray-300 text-sm focus:outline-none focus:border-primary-500 bg-white"
          >
            <option value="">All Types</option>
            <option value="new">New</option>
            <option value="regular">Regular</option>
            <option value="vip">VIP</option>
            <option value="inactive">Inactive</option>
          </select>
          <select
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [field, order] = e.target.value.split('-')
              setSortBy(field)
              setSortOrder(order)
            }}
            className="px-3 py-2 border border-gray-300 text-sm focus:outline-none focus:border-primary-500 bg-white"
          >
            <option value="lastVisit-desc">Recent</option>
            <option value="createdAt-desc">Newest</option>
            <option value="totalSpent-desc">Top Spenders</option>
            <option value="totalVisits-desc">Most Visits</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200">
        {loading ? (
          <div className="p-8 text-center">
            <FaSpinner className="animate-spin mx-auto text-primary-600 text-2xl" />
          </div>
        ) : customers.length === 0 ? (
          <div className="p-8 text-center">
            <FaUsers className="mx-auto text-gray-300 text-3xl mb-2" />
            <p className="text-sm text-gray-500">No customers found</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Customer</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 hidden md:table-cell">Phone</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Segment</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 hidden lg:table-cell">Visits</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Spent</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 hidden lg:table-cell">Last Visit</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 hidden sm:table-cell">Tier</th>
                    <th className="px-3 py-2 text-right text-xs font-medium text-gray-500">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map((customer) => (
                    <CustomerRow
                      key={customer.id || customer._id}
                      customer={customer}
                      onView={handleView}
                      onUpdateTier={handleUpdateTier}
                      formatCurrency={formatCurrency}
                      formatDate={formatDate}
                      getSegment={getSegment}
                    />
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination
              page={pagination.page}
              pages={pagination.pages}
              total={pagination.total}
              limit={pagination.limit}
              onPageChange={handlePageChange}
            />
          </>
        )}
      </div>
    </div>
  )
}

export default memo(CustomerList)
