import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  FaUser,
  FaPhoneAlt,
  FaEnvelope,
  FaIdBadge,
  FaRupeeSign,
  FaSpinner,
  FaSearch,
  FaFilter,
  FaEdit,
  FaTrash,
  FaEye,
  FaPlus,
  FaCalendar
} from 'react-icons/fa'
import { toast } from 'react-hot-toast'
import managerService from '../../../../services/manager/managerService'

const ROLE_COLORS = {
  stylist: 'bg-blue-100 text-blue-700',
  therapist: 'bg-purple-100 text-purple-700',
  receptionist: 'bg-green-100 text-green-700',
  cleaner: 'bg-orange-100 text-orange-700',
  assistant: 'bg-gray-100 text-gray-700',
  other: 'bg-pink-100 text-pink-700',
}

const StaffList = () => {
  const navigate = useNavigate()
  const [staff, setStaff] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [filterRole, setFilterRole] = useState('')
  const [deleting, setDeleting] = useState(null)
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    limit: 10,
    total: 0,
  })

  const fetchStaff = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const params = {
        page: pagination.currentPage,
        limit: pagination.limit,
      }
      if (debouncedSearch) params.search = debouncedSearch
      if (filterRole) params.role = filterRole

      const res = await managerService.getStaff(params)
      if (res.success) {
        const staffData = res.data?.data || []
        setStaff(staffData)
        if (res.data?.pagination) {
          setPagination(prev => ({
            ...prev,
            totalPages: res.data.pagination.pages || 1,
            total: res.data.pagination.total || 0,
          }))
        }
      } else {
        setError(res.error || 'Failed to fetch staff')
      }
    } catch (e) {
      setError('Failed to fetch staff')
    } finally {
      setLoading(false)
    }
  }, [debouncedSearch, filterRole, pagination.currentPage, pagination.limit])

  useEffect(() => {
    fetchStaff()
  }, [fetchStaff])

  useEffect(() => {
    const id = setTimeout(() => setDebouncedSearch(search.trim()), 400)
    return () => clearTimeout(id)
  }, [search])

  const handlePageChange = useCallback((newPage) => {
    setPagination(prev => ({ ...prev, currentPage: newPage }))
  }, [])

  const handleFilterChange = useCallback((role) => {
    setFilterRole(role)
    setPagination(prev => ({ ...prev, currentPage: 1 }))
  }, [])

  const handleDelete = async (staffId) => {
    if (!window.confirm('Are you sure you want to delete this staff member?')) {
      return
    }

    try {
      setDeleting(staffId)
      const res = await managerService.deleteStaff(staffId)
      if (res.success) {
        toast.success('Staff deleted successfully')
        fetchStaff()
      } else {
        toast.error(res.error || 'Failed to delete staff')
      }
    } catch (e) {
      toast.error('Failed to delete staff')
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

  return (
    <div className="p-3 sm:p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Staff Management</h1>
            <p className="text-gray-600 mt-1">Manage your staff members</p>
          </div>
          <Link
            to="/manager/staff/add"
            className="flex items-center justify-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <FaPlus />
            <span>Add Staff</span>
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          {/* Role Filter */}
          <div className="relative">
            <FaFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <select
              value={filterRole}
              onChange={(e) => handleFilterChange(e.target.value)}
              className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 appearance-none bg-white"
            >
              <option value="">All Roles</option>
              <option value="stylist">Stylist</option>
              <option value="therapist">Therapist</option>
              <option value="receptionist">Receptionist</option>
              <option value="cleaner">Cleaner</option>
              <option value="assistant">Assistant</option>
              <option value="other">Other</option>
            </select>
          </div>
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
      ) : staff.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <FaUser className="text-6xl text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No staff members found</h3>
          <p className="text-gray-500 mb-6">Get started by adding your first staff member</p>
          <Link
            to="/manager/staff/add"
            className="inline-flex items-center gap-2 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <FaPlus />
            <span>Add Staff</span>
          </Link>
        </div>
      ) : (
        <>
          {/* Staff Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {staff.map((member) => (
              <div
                key={member._id || member.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                      <FaUser className="text-primary-600 text-xl" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{member.name}</h3>
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-1 ${
                        ROLE_COLORS[member.role] || ROLE_COLORS.other
                      }`}>
                        {member.role || 'N/A'}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Link
                      to={`/manager/staff/${member._id || member.id}`}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="View Details"
                    >
                      <FaEye />
                    </Link>
                    <Link
                      to={`/manager/staff/${member._id || member.id}/edit`}
                      className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <FaEdit />
                    </Link>
                    <button
                      onClick={() => handleDelete(member._id || member.id)}
                      disabled={deleting === (member._id || member.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                      title="Delete"
                    >
                      {deleting === (member._id || member.id) ? (
                        <FaSpinner className="animate-spin" />
                      ) : (
                        <FaTrash />
                      )}
                    </button>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  {member.phone && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <FaPhoneAlt className="text-gray-400" />
                      <span>{member.phone}</span>
                    </div>
                  )}
                  {member.email && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <FaEnvelope className="text-gray-400" />
                      <span className="truncate">{member.email}</span>
                    </div>
                  )}
                  {member.specialization && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <FaIdBadge className="text-gray-400" />
                      <span>{member.specialization}</span>
                    </div>
                  )}
                  {member.experience !== undefined && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <FaCalendar className="text-gray-400" />
                      <span className="font-medium">Experience:</span> {member.experience} years
                    </div>
                  )}
                  {(member.salary || member.commission) && (
                    <div className="flex items-center gap-4 pt-2 border-t border-gray-100">
                      {member.salary && (
                        <div className="flex items-center gap-1 text-gray-600">
                          <FaRupeeSign className="text-green-600" />
                          <span className="font-medium">{formatCurrency(member.salary)}</span>
                        </div>
                      )}
                      {member.commission > 0 && (
                        <div className="text-gray-600">
                          <span className="font-medium">{member.commission}%</span> commission
                        </div>
                      )}
                    </div>
                  )}
                  {member.joiningDate && (
                    <div className="text-xs text-gray-500 pt-2 border-t border-gray-100">
                      Joined: {formatDate(member.joiningDate)}
                    </div>
                  )}
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
                {pagination.total} staff members
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

export default StaffList
