import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import {
  FaUsers,
  FaSearch,
  FaFilter,
  FaEye,
  FaSpinner,
  FaPhoneAlt,
  FaRupeeSign,
  FaStar,
  FaChartLine,
  FaArrowUp,
  FaArrowDown
} from 'react-icons/fa'
import managerService from '../../../../services/manager/managerService'
import {
  normalizeCustomerCollection,
  formatCurrency,
  formatDate,
  buildCustomerTypeFilterOptions,
  formatNumber
} from '../utils/customerUtils'

const SEGMENT_STYLES = {
  vip: { label: 'VIP', color: 'bg-purple-100 text-purple-800' },
  loyal: { label: 'Loyal', color: 'bg-green-100 text-green-800' },
  returning: { label: 'Returning', color: 'bg-blue-100 text-blue-800' },
  new: { label: 'New', color: 'bg-sky-100 text-sky-800' },
  at_risk: { label: 'At Risk', color: 'bg-red-100 text-red-800' },
  inactive: { label: 'Inactive', color: 'bg-red-100 text-red-800' },
  regular: { label: 'Regular', color: 'bg-gray-100 text-gray-800' }
}

const deriveSegmentDetails = ({ customerType, totalVisits, totalSpent, lastVisit, isActive }) => {
  const key = (customerType || '').toLowerCase()
  if (SEGMENT_STYLES[key]) {
    const { label, color } = SEGMENT_STYLES[key]
    return { key, label, color }
  }

  if (!isActive) return { key: 'inactive', ...SEGMENT_STYLES.inactive }

  if (totalVisits <= 1) return { key: 'new', ...SEGMENT_STYLES.new }
  if (totalVisits >= 5 || totalSpent >= 50000) return { key: 'loyal', ...SEGMENT_STYLES.loyal }

  if (lastVisit) {
    const daysSince = Math.floor((Date.now() - new Date(lastVisit).getTime()) / (1000 * 60 * 60 * 24))
    if (daysSince > 90) {
      return { key: 'at_risk', ...SEGMENT_STYLES.at_risk }
    }
  }

  return { key: 'regular', ...SEGMENT_STYLES.regular }
}

const normalizeCustomerRecord = (raw) => {
  const totalVisits = raw.totalVisits ?? raw.stats?.totalVisits ?? 0
  const totalSpent = raw.totalSpent ?? raw.stats?.totalSpent ?? 0
  const averageSpent = raw.averageSpent ?? raw.stats?.averageSpent ?? 0
  const lastVisit = raw.lastVisit ?? raw.stats?.lastVisit ?? null
  const averageRating = raw.averageRating ?? raw.stats?.averageRating ?? 0
  const isActive = raw.isActive ?? raw.status === 'active'

  const segment = deriveSegmentDetails({
    customerType: raw.customerType,
    totalVisits,
    totalSpent,
    lastVisit,
    isActive
  })

  const name = raw.fullName || raw.name || [raw.firstName, raw.lastName].filter(Boolean).join(' ').trim() || 'Unnamed Customer'

  return {
    id: raw.id || raw._id,
    name,
    email: raw.email || raw.contactEmail || '',
    phone: raw.phone || raw.contactPhone || '',
    customerType: raw.customerType || segment.key,
    totalVisits,
    totalSpent,
    averageSpent,
    lastVisit,
    loyaltyPoints: raw.loyaltyPoints ?? 0,
    membershipTier: raw.membershipTier || 'standard',
    averageRating,
    isActive,
    createdAt: raw.createdAt,
    tags: raw.tags || [],
    segmentKey: segment.key,
    segmentLabel: segment.label,
    segmentColor: segment.color
  }
}

const CustomerList = () => {
  const navigate = useNavigate()
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [segmentFilter, setSegmentFilter] = useState('')
  const [sortBy, setSortBy] = useState('createdAt')
  const [sortOrder, setSortOrder] = useState('desc')
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 0 })

  const fetchCustomers = useCallback(async () => {
    try {
      setLoading(true)
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        sortBy,
        sortOrder
      }
      
      if (debouncedSearch) params.search = debouncedSearch
      if (segmentFilter) params.customerType = segmentFilter

      const result = await managerService.getCustomers(params)
      
      if (result.success) {
        const normalized = normalizeCustomerCollection(result.data?.data || result.data || [])
        setCustomers(normalized)
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
      console.error(error)
    } finally {
      setLoading(false)
    }
  }, [pagination.page, pagination.limit, debouncedSearch, segmentFilter, sortBy, sortOrder])

  useEffect(() => {
    fetchCustomers()
  }, [fetchCustomers])

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm)
      setPagination(prev => ({ ...prev, page: 1 }))
    }, 500)
    return () => clearTimeout(timer)
  }, [searchTerm])

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      setSortOrder('desc')
    }
  }

  const SortIcon = ({ field }) => {
    if (sortBy !== field) return null
    return sortOrder === 'asc' ? <FaArrowUp className="ml-1" /> : <FaArrowDown className="ml-1" />
  }

  const segmentOptions = useMemo(() => buildCustomerTypeFilterOptions(customers), [customers])

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FaUsers className="text-primary-600" />
            Customers
          </h1>
          <p className="text-gray-600 mt-1">Manage and analyze your customer base</p>
        </div>
        <button
          onClick={() => navigate('/manager/customers/analytics')}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white  hover:bg-primary-700 transition-colors"
        >
          <FaChartLine />
          View Analytics
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white   border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative md:col-span-2">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, email, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300  focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <select
            value={segmentFilter}
            onChange={(e) => {
              setSegmentFilter(e.target.value)
              setPagination(prev => ({ ...prev, page: 1 }))
            }}
            className="px-4 py-2 border border-gray-300  focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            {segmentOptions.map((option) => (
              <option key={option.value || 'all'} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <select
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [field, order] = e.target.value.split('-')
              setSortBy(field)
              setSortOrder(order)
            }}
            className="px-4 py-2 border border-gray-300  focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="createdAt-desc">Newest First</option>
            <option value="createdAt-asc">Oldest First</option>
            <option value="name-asc">Name (A-Z)</option>
            <option value="name-desc">Name (Z-A)</option>
          </select>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white   border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Customers</p>
              <p className="text-2xl font-bold text-gray-900">{pagination.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white   border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active</p>
              <p className="text-2xl font-bold text-primary-600">
                {customers.filter(c => c.isActive).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white   border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-primary-600">
                {formatCurrency(customers.reduce((sum, c) => sum + (c.totalSpent || 0), 0))}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white   border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 text-center">Avg. Spending</p>
              <p className="text-2xl font-bold text-primary-600">
                {customers.length > 0
                  ? formatCurrency(customers.reduce((sum, c) => sum + (c.averageSpent || 0), 0) / customers.length)
                  : formatCurrency(0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white   border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <FaSpinner className="animate-spin mx-auto text-primary-600 text-3xl mb-4" />
            <p className="text-gray-600">Loading customers...</p>
          </div>
        ) : customers.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-gray-600">No customers found</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('name')}
                    >
                      <div className="flex items-center">
                        Customer
                        <SortIcon field="name" />
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Segment
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Visits
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Spent
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Last Visit
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rating
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {customers.map((customer) => {
                    const {
                      id,
                      name,
                      email,
                      phone,
                      totalVisits,
                      totalSpent,
                      lastVisit,
                      averageRating,
                      segmentLabel,
                      segmentColor
                    } = customer

                    return (
                      <tr 
                        key={id} 
                        className="hover:bg-gray-50 transition-colors cursor-pointer"
                        onClick={() => navigate(`/manager/customers/${id}`)}
                      >


                        <td className=" py-1 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900">{name}</div>
                              <div className="text-xs text-gray-500">{email}</div>
                            </div>
                          </div>
                        </td>


                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 flex items-center gap-2">
                            <FaPhoneAlt className="text-gray-400 " />
                            {phone}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${segmentColor}`}>
                            {segmentLabel}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {totalVisits || 0}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-semibold text-gray-900">
                            {formatCurrency(totalSpent || 0)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">
                            {formatDate(lastVisit)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-1">
                            <FaStar className="text-yellow-400" />
                            <span className="text-sm text-gray-900">
                              {(averageRating || 0).toFixed(1)}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                navigate(`/manager/customers/${id}`)
                              }}
                              className="p-2 text-primary-600 hover:bg-primary-50  transition-colors"
                              title="View Details"
                            >
                              <FaEye />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                  {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                  {pagination.total} customers
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                    disabled={pagination.page === 1}
                    className="px-4 py-2 border border-gray-300  hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <span className="px-4 py-2 text-sm text-gray-700">
                    Page {pagination.page} of {pagination.pages}
                  </span>
                  <button
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                    disabled={pagination.page >= pagination.pages}
                    className="px-4 py-2 border border-gray-300  hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default CustomerList
