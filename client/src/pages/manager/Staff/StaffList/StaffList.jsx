import React, { useState, useEffect, useCallback, memo, useMemo, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  FaUser,
  FaPhoneAlt,
  FaEnvelope,
  FaSpinner,
  FaSearch,
  FaEdit,
  FaTrash,
  FaEye,
  FaPlus
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

// Memoized Staff Card Component
const StaffCard = memo(({ member, onDelete, deleting }) => {
  const memberId = member._id || member.id

  return (
    <div className="bg-white border border-gray-200 p-4 hover:shadow-sm transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
            <FaUser className="text-primary-600" />
          </div>
          <div>
            <h3 className="font-medium text-gray-900">{member.name}</h3>
            <span className={`inline-block px-2 py-0.5 rounded-full text-xs ${ROLE_COLORS[member.role] || ROLE_COLORS.other
              }`}>
              {member.role || 'N/A'}
            </span>
          </div>
        </div>
        <div className="flex gap-1">
          <Link
            to={`/manager/staff/${memberId}`}
            className="p-1.5 text-blue-600 hover:bg-blue-50 transition-colors"
          >
            <FaEye size={14} />
          </Link>
          <Link
            to={`/manager/staff/${memberId}/edit`}
            className="p-1.5 text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <FaEdit size={14} />
          </Link>
          <button
            onClick={() => onDelete(memberId)}
            disabled={deleting === memberId}
            className="p-1.5 text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
          >
            {deleting === memberId ? <FaSpinner className="animate-spin" size={14} /> : <FaTrash size={14} />}
          </button>
        </div>
      </div>

      <div className="space-y-1 text-sm text-gray-600">
        {member.phone && (
          <div className="flex items-center gap-2">
            <FaPhoneAlt className="text-gray-400" size={12} />
            <span>{member.phone}</span>
          </div>
        )}
        {member.email && (
          <div className="flex items-center gap-2">
            <FaEnvelope className="text-gray-400" size={12} />
            <span className="truncate">{member.email}</span>
          </div>
        )}
        {(member.salary || member.commission > 0) && (
          <div className="flex items-center gap-3 pt-2 border-t border-gray-100 mt-2">
            {member.salary && (
              <span className="text-gray-700">₹{parseInt(member.salary).toLocaleString('en-IN')}</span>
            )}
            {member.commission > 0 && (
              <span className="text-gray-500">{member.commission}% comm</span>
            )}
          </div>
        )}
      </div>
    </div>
  )
})

// Memoized Pagination Component
const Pagination = memo(({ pagination, onPageChange }) => {
  if (pagination.totalPages <= 1) return null

  return (
    <div className="flex items-center justify-between p-3 border-t border-gray-200 bg-white text-sm">
      <span className="text-gray-600">
        Page {pagination.currentPage} of {pagination.totalPages}
      </span>
      <div className="flex gap-2">
        <button
          onClick={() => onPageChange(pagination.currentPage - 1)}
          disabled={pagination.currentPage === 1}
          className="px-3 py-1 border border-gray-300 hover:bg-gray-50 disabled:opacity-50"
        >
          Prev
        </button>
        <button
          onClick={() => onPageChange(pagination.currentPage + 1)}
          disabled={pagination.currentPage >= pagination.totalPages}
          className="px-3 py-1 border border-gray-300 hover:bg-gray-50 disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  )
})

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
    limit: 12,
    total: 0,
  })

  // Refs for preventing duplicate calls
  const fetchingRef = useRef(false)
  const abortControllerRef = useRef(null)
  const lastParamsRef = useRef('')

  const fetchStaff = useCallback(async () => {
    const params = {
      page: pagination.currentPage,
      limit: pagination.limit,
      search: debouncedSearch || undefined,
      role: filterRole || undefined,
    }

    // Prevent duplicate calls with same params
    const paramsKey = JSON.stringify(params)
    if (paramsKey === lastParamsRef.current && !loading) return
    if (fetchingRef.current) return

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    try {
      fetchingRef.current = true
      abortControllerRef.current = new AbortController()
      lastParamsRef.current = paramsKey
      setLoading(true)
      setError(null)

      const res = await managerService.getStaff(params)

      if (res.success) {
        setStaff(res.data?.data || [])
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
      if (e.name !== 'AbortError') {
        setError('Failed to fetch staff')
      }
    } finally {
      setLoading(false)
      fetchingRef.current = false
    }
  }, [debouncedSearch, filterRole, pagination.currentPage, pagination.limit])

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search.trim()), 400)
    return () => clearTimeout(timer)
  }, [search])

  // Fetch on param changes
  useEffect(() => {
    fetchStaff()
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [fetchStaff])

  const handlePageChange = useCallback((newPage) => {
    setPagination(prev => ({ ...prev, currentPage: newPage }))
  }, [])

  const handleFilterChange = useCallback((role) => {
    setFilterRole(role)
    setPagination(prev => ({ ...prev, currentPage: 1 }))
  }, [])

  const handleDelete = useCallback(async (staffId) => {
    if (!window.confirm('Delete this staff member?')) return

    try {
      setDeleting(staffId)
      const res = await managerService.deleteStaff(staffId)
      if (res.success) {
        toast.success('Staff deleted')
        lastParamsRef.current = '' // Force refetch
        fetchStaff()
      } else {
        toast.error(res.error || 'Failed to delete')
      }
    } catch (e) {
      toast.error('Failed to delete')
    } finally {
      setDeleting(null)
    }
  }, [fetchStaff])

  // Memoize staff list to prevent unnecessary re-renders
  const staffCards = useMemo(() => (
    staff.map((member) => (
      <StaffCard
        key={member._id || member.id}
        member={member}
        onDelete={handleDelete}
        deleting={deleting}
      />
    ))
  ), [staff, handleDelete, deleting])

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Staff</h1>
          <p className="text-sm text-gray-600">Manage staff members</p>
        </div>
        <Link
          to="/manager/staff/add"
          className="flex items-center gap-2 px-3 py-2 bg-primary-600 text-white text-sm hover:bg-primary-700 transition-colors"
        >
          <FaPlus size={12} />
          Add Staff
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white border border-gray-200 p-3 mb-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={14} />
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-gray-300 text-sm focus:outline-none focus:border-primary-500"
            />
          </div>
          <select
            value={filterRole}
            onChange={(e) => handleFilterChange(e.target.value)}
            className="px-3 py-2 border border-gray-300 text-sm focus:outline-none focus:border-primary-500 bg-white"
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

      {/* Content */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <FaSpinner className="animate-spin text-3xl text-primary-600" />
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 p-4 text-red-600 text-sm">
          {error}
        </div>
      ) : staff.length === 0 ? (
        <div className="bg-white border border-gray-200 p-8 text-center">
          <FaUser className="text-4xl text-gray-300 mx-auto mb-3" />
          <h3 className="font-medium text-gray-700 mb-1">No staff found</h3>
          <p className="text-sm text-gray-500 mb-4">Add your first staff member</p>
          <Link
            to="/manager/staff/add"
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white text-sm hover:bg-primary-700"
          >
            <FaPlus size={12} />
            Add Staff
          </Link>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-4">
            {staffCards}
          </div>
          <Pagination pagination={pagination} onPageChange={handlePageChange} />
        </>
      )}
    </div>
  )
}

export default StaffList
