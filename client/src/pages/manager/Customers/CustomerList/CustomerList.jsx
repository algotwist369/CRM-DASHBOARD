import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import {
  FaUsers,
  FaSearch,
  FaFilter,
  FaEye,
  FaEdit,
  FaSpinner,
  FaPhone,
  FaEnvelope,
  FaDollarSign,
  FaCalendarAlt,
  FaStar,
  FaChartLine,
  FaArrowUp,
  FaArrowDown
} from 'react-icons/fa'
import managerService from '../../../../services/manager/managerService'

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
      if (segmentFilter) params.segment = segmentFilter

      const result = await managerService.getCustomers(params)
      
      if (result.success) {
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

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount || 0)
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'Never'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getSegmentBadge = (customer) => {
    const visits = customer.stats?.totalVisits || 0
    const spent = customer.stats?.totalSpent || 0
    const lastVisit = customer.stats?.lastVisit
    
    if (visits === 1) return { label: 'New', color: 'bg-blue-100 text-blue-800' }
    if (visits >= 2 && visits <= 4) return { label: 'Returning', color: 'bg-green-100 text-green-800' }
    if (visits >= 5) return { label: 'Loyal', color: 'bg-purple-100 text-purple-800' }
    if (spent >= 5000) return { label: 'High Value', color: 'bg-yellow-100 text-yellow-800' }
    if (lastVisit) {
      const daysSince = Math.floor((new Date() - new Date(lastVisit)) / (1000 * 60 * 60 * 24))
      if (daysSince > 90) return { label: 'Inactive', color: 'bg-red-100 text-red-800' }
    }
    return { label: 'Active', color: 'bg-gray-100 text-gray-800' }
  }

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
            <option value="">All Segments</option>
            <option value="new">New Customers</option>
            <option value="returning">Returning Customers</option>
            <option value="loyal">Loyal Customers</option>
            <option value="inactive">Inactive Customers</option>
            <option value="high_value">High Value Customers</option>
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
            <FaUsers className="text-3xl text-primary-500" />
          </div>
        </div>

        <div className="bg-white   border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active</p>
              <p className="text-2xl font-bold text-green-600">
                {customers.filter(c => c.status === 'active').length}
              </p>
            </div>
            <FaUsers className="text-3xl text-green-500" />
          </div>
        </div>

        <div className="bg-white   border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-blue-600">
                {formatCurrency(customers.reduce((sum, c) => sum + (c.stats?.totalSpent || 0), 0))}
              </p>
            </div>
            <FaDollarSign className="text-3xl text-blue-500" />
          </div>
        </div>

        <div className="bg-white   border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg. Spending</p>
              <p className="text-2xl font-bold text-purple-600">
                {customers.length > 0
                  ? formatCurrency(customers.reduce((sum, c) => sum + (c.stats?.totalSpent || 0), 0) / customers.length)
                  : formatCurrency(0)}
              </p>
            </div>
            <FaChartLine className="text-3xl text-purple-500" />
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
            <FaUsers className="mx-auto text-gray-400 text-4xl mb-4" />
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
                    const segment = getSegmentBadge(customer)
                    return (
                      <tr 
                        key={customer._id} 
                        className="hover:bg-gray-50 transition-colors cursor-pointer"
                        onClick={() => navigate(`/manager/customers/${customer._id}`)}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center mr-3">
                              <FaUsers className="text-primary-600" />
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900">{customer.name}</div>
                              <div className="text-xs text-gray-500">{customer.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 flex items-center gap-2">
                            <FaPhone className="text-gray-400" />
                            {customer.phone}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${segment.color}`}>
                            {segment.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {customer.stats?.totalVisits || 0}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-semibold text-gray-900">
                            {formatCurrency(customer.stats?.totalSpent || 0)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">
                            {formatDate(customer.stats?.lastVisit)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-1">
                            <FaStar className="text-yellow-400" />
                            <span className="text-sm text-gray-900">
                              {(customer.stats?.averageRating || 0).toFixed(1)}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                navigate(`/manager/customers/${customer._id}`)
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
