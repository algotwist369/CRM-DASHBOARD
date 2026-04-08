import React, { useState, useEffect, useCallback, memo, useRef, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import {
  FaCalendarAlt,
  FaSearch,
  FaSpinner,
  FaEye,
  FaEdit,
  FaPhoneAlt,
  FaArrowUp,
  FaArrowDown,
  FaCopy
} from 'react-icons/fa'
import managerService from '../../../../services/manager/managerService'
import { useSocket } from '../../../../contexts/SocketContext'

// Memoized Helper Functions
const getStatusBadge = (status) => {
  const badges = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-blue-100 text-blue-800',
    in_progress: 'bg-purple-100 text-purple-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
    no_show: 'bg-gray-100 text-gray-800'
  }
  return badges[status] || 'bg-gray-100 text-gray-800'
}

const formatDateTime = (dateString, timeString) => {
  if (!dateString) return 'N/A'
  const date = new Date(dateString)
  if (timeString) {
    // Parse the time and convert to 12-hour format with AM/PM
    const [hours, minutes] = timeString.split(':')
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const hour12 = hour % 12 || 12
    return (
      <div className="flex flex-col">
        <span>{date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}</span>
        <span className="text-xs text-gray-500">{hour12}:{minutes} {ampm}</span>
      </div>
    )
  }
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR'
  }).format(amount || 0)
}

const isNewAppointment = (appointment) => {
  if (!appointment.createdAt) return false
  const createdDate = new Date(appointment.createdAt)
  const now = new Date()
  const hoursSinceCreation = (now - createdDate) / (1000 * 60 * 60)
  return hoursSinceCreation <= 24
}

// Memoized Appointment Row Component
const AppointmentRow = memo(({ appointment, updatingStatus, onQuickUpdate, onViewDetails, onUpdateStatusClick, onCopyBooking, copiedBooking }) => {
  return (
    <tr className="hover:bg-gray-50 transition-colors">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm flex items-center gap-2">
          <div className="font-medium text-gray-900">
            {appointment.bookingNumber || 'N/A'}
          </div>
          {appointment.bookingNumber && (
            copiedBooking === appointment.bookingNumber ? (
              <span className="text-xs text-green-600 font-medium">Copied!</span>
            ) : (
              <button
                onClick={() => onCopyBooking(appointment.bookingNumber)}
                className="p-1 text-gray-400 hover:text-primary-600 transition-colors"
                title="Copy booking number"
              >
                <FaCopy className="text-xs" />
              </button>
            )
          )}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm">
          <div className="font-medium text-gray-900 flex items-center gap-2">
            {formatDateTime(appointment.appointmentDate, appointment.startTime)}
            {isNewAppointment(appointment) && (
              <span className="px-2 py-0.5 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
                NEW
              </span>
            )}
          </div>
          {appointment.confirmationCode && (
            <div className="text-xs text-gray-500">Code: {appointment.confirmationCode}</div>
          )}
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="text-sm">
          <div className="font-medium text-gray-900">
            {appointment.customer
              ? `${appointment.customer.firstName || ''} ${appointment.customer.lastName || ''}`.trim()
              : 'N/A'}
          </div>
          <div className="text-xs text-gray-500 flex items-center gap-2">
            <FaPhoneAlt className="text-gray-400" />
            {appointment.customer?.phone || 'N/A'}
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="text-sm">
          <div className="font-medium text-gray-900">
            {appointment.service?.name || 'N/A'}
          </div>
          {(appointment.duration || appointment.service?.duration) && (
            <div className="text-xs text-green-500 font-semibold">{appointment.duration || appointment.service.duration} min</div>
          )}
        </div>
      </td>
      {/* <td className="px-6 py-4">
        <div className="text-sm text-gray-900">
          {appointment.staff?.name || 'TBD'}
        </div>
        {appointment.staff?.role && (
          <div className="text-xs text-gray-500">{appointment.staff.role}</div>
        )}
      </td> */}
      <td className="px-6 py-4">
        <div className="text-sm font-semibold text-gray-900">
          {formatCurrency(appointment.totalAmount || 0)}
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="text-sm text-gray-500">
          {appointment.createdAt ? (() => {
            const date = new Date(appointment.createdAt);
            return (
              <div className="flex flex-col">
                <span className="text-gray-900">{date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}</span>
                <span className="text-xs text-gray-500">{date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}</span>
              </div>
            );
          })() : 'N/A'}
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="relative flex items-center gap-2">
          <select
            value={appointment.status || 'pending'}
            onChange={(e) => onQuickUpdate(appointment, e.target.value)}
            disabled={updatingStatus}
            className={`px-3 py-1.5 text-xs font-medium capitalize cursor-pointer border-0 focus:outline-none focus:ring-2 focus:ring-primary-500 ${getStatusBadge(appointment.status)} ${updatingStatus ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90'
              }`}
            title="Quick status update"
          >
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
            <option value="no_show">No Show</option>
          </select>
          {updatingStatus && (
            <FaSpinner className="animate-spin text-primary-600 text-sm" />
          )}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right">
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={() => onViewDetails(appointment._id)}
            className="p-2 text-primary-600 hover:bg-primary-50 transition-colors"
            title="View Details"
          >
            <FaEye />
          </button>
          <button
            onClick={() => onUpdateStatusClick(appointment)}
            className="p-2 text-gray-600 hover:bg-gray-50 transition-colors"
            title="Update Status with Notes"
          >
            <FaEdit />
          </button>
        </div>
      </td>
    </tr>
  )
})

const AppointmentList = () => {
  const navigate = useNavigate()
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [dateFilter, setDateFilter] = useState('')
  const [sortBy, setSortBy] = useState('createdAt')
  const [sortOrder, setSortOrder] = useState('desc')
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 0 })
  const [updatingStatus, setUpdatingStatus] = useState({})
  const [copiedBooking, setCopiedBooking] = useState(null)

  // Debounce search term
  const [debouncedSearch, setDebouncedSearch] = useState('')

  const [statusUpdateModal, setStatusUpdateModal] = useState({
    show: false,
    appointment: null,
    newStatus: '',
    notes: ''
  })

  // Refs to prevent duplicate fetches
  const fetchingRef = useRef(false)
  const mountedRef = useRef(false)

  // Handle search debounce and page reset
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm !== debouncedSearch) {
        setDebouncedSearch(searchTerm)
        setPagination(prev => ({ ...prev, page: 1 }))
      }
    }, 500)
    return () => clearTimeout(timer)
  }, [searchTerm]) // Only depend on searchTerm

  const fetchAppointments = useCallback(async () => {
    // Prevent duplicate simultaneous fetches
    if (fetchingRef.current) return

    try {
      fetchingRef.current = true
      setLoading(true)
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        sortBy,
        sortOrder,
        search: debouncedSearch
      }

      if (statusFilter) params.status = statusFilter
      if (dateFilter) params.date = dateFilter

      const result = await managerService.getAppointments(params)

      if (result.success) {
        setAppointments(result.data?.data || result.data || [])
        setPagination(prev => ({
          ...prev,
          total: result.data?.pagination?.total || 0,
          pages: result.data?.pagination?.pages || 0
        }))
      } else {
        toast.error(result.error || 'Failed to fetch appointments')
      }
    } catch (error) {
      toast.error('Failed to fetch appointments')
      console.error(error)
    } finally {
      setLoading(false)
      fetchingRef.current = false
    }
  }, [pagination.page, pagination.limit, statusFilter, dateFilter, sortBy, sortOrder, debouncedSearch])

  // Socket integration - optimize by not depending on fetchAppointments
  const { socket } = useSocket() || {}
  const currentPageRef = useRef(pagination.page)

  useEffect(() => {
    currentPageRef.current = pagination.page
  }, [pagination.page])

  useEffect(() => {
    if (!socket) return

    const handleNewAppointment = () => {
      // Only refresh if on page 1
      if (currentPageRef.current === 1) {
        fetchAppointments()
        toast.success('New appointment received!')
      } else {
        toast.info('New appointment received. Refresh to view.', { duration: 4000, icon: '📅' })
      }
    }

    const handleAppointmentUpdated = (data) => {
      setAppointments(prev => prev.map(appt =>
        appt._id === data.appointmentId ? { ...appt, ...data.data } : appt
      ))
    }

    socket.on('new_appointment', handleNewAppointment)
    socket.on('appointment_updated', handleAppointmentUpdated)
    socket.on('appointment_cancelled', handleAppointmentUpdated)

    return () => {
      socket.off('new_appointment', handleNewAppointment)
      socket.off('appointment_updated', handleAppointmentUpdated)
      socket.off('appointment_cancelled', handleAppointmentUpdated)
    }
  }, [socket]) // Removed fetchAppointments from deps

  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true
    }
    fetchAppointments()
  }, [fetchAppointments])

  const handlePageChange = useCallback((newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }))
  }, [])

  const handleViewDetails = useCallback((id) => {
    navigate(`/manager/appointments/${id}`)
  }, [navigate])

  const closeModal = useCallback(() => {
    setStatusUpdateModal({ show: false, appointment: null, newStatus: '', notes: '' })
  }, [])

  const handleUpdateStatusClick = useCallback((appointment) => {
    setStatusUpdateModal({
      show: true,
      appointment: appointment,
      newStatus: appointment.status || 'pending',
      notes: ''
    })
  }, [])

  const handleCopyBooking = useCallback((bookingNumber) => {
    navigator.clipboard.writeText(bookingNumber).then(() => {
      setCopiedBooking(bookingNumber)
      setTimeout(() => setCopiedBooking(null), 2000)
    }).catch(() => {
      toast.error('Failed to copy')
    })
  }, [])

  const quickStatusUpdate = useCallback(async (appointment, newStatus) => {
    if (!appointment || !newStatus || newStatus === appointment.status) return

    // Optimistic Update
    const oldStatus = appointment.status
    setAppointments(prev => prev.map(a =>
      a._id === appointment._id ? { ...a, status: newStatus } : a
    ))
    setUpdatingStatus(prev => ({ ...prev, [appointment._id]: true }))

    try {
      const result = await managerService.updateAppointmentStatus(appointment._id, newStatus)

      if (result.success) {
        toast.success('Status updated')
        // No need to fetchAppointments if successful, data is already correct
        // Optionally update with full returned data ensuring fields like completedAt are synced
        setAppointments(prev => prev.map(a =>
          a._id === appointment._id ? { ...a, ...result.data } : a
        ))
      } else {
        // Revert on failure
        setAppointments(prev => prev.map(a =>
          a._id === appointment._id ? { ...a, status: oldStatus } : a
        ))
        toast.error(result.error || 'Failed to update status')
      }
    } catch (error) {
      // Revert on error
      setAppointments(prev => prev.map(a =>
        a._id === appointment._id ? { ...a, status: oldStatus } : a
      ))
      toast.error('Failed to update status')
    } finally {
      setUpdatingStatus(prev => ({ ...prev, [appointment._id]: false }))
    }
  }, [])

  const confirmStatusUpdate = useCallback(async () => {
    const { appointment, newStatus, notes } = statusUpdateModal
    if (!appointment || !newStatus) return

    setUpdatingStatus(prev => ({ ...prev, [appointment._id]: true }))
    try {
      const result = await managerService.updateAppointmentStatus(
        appointment._id,
        newStatus,
        notes || ''
      )

      if (result.success) {
        toast.success('Appointment status updated')
        closeModal()
        // Update local state
        setAppointments(prev => prev.map(a =>
          a._id === appointment._id ? { ...a, ...result.data } : a
        ))
      } else {
        toast.error(result.error || 'Failed to update status')
      }
    } catch (error) {
      toast.error('Failed to update status')
    } finally {
      setUpdatingStatus(prev => ({ ...prev, [appointment._id]: false }))
    }
  }, [statusUpdateModal, closeModal])

  // Memoized values for better performance
  const hasAppointments = useMemo(() => appointments.length > 0, [appointments.length])
  const showPagination = useMemo(() => pagination.pages > 1, [pagination.pages])
  const hasActiveFilters = useMemo(() => statusFilter || dateFilter, [statusFilter, dateFilter])

  return (
    <div className="p-6 space-y-6 transition-all duration-200">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FaCalendarAlt className="text-primary-600" />
            Appointments
          </h1>
          <p className="text-gray-600 mt-1">Manage all customer appointments</p>
        </div>
        <button
          onClick={() => navigate('/manager/appointments/calendar')}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white hover:bg-primary-700 transition-colors"
        >
          <FaCalendarAlt />
          Calendar View
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white border border-gray-200 p-4 transition-all duration-200">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by ID or booking number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
            <option value="no_show">No Show</option>
          </select>
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
          </input>
          <div className="flex items-center gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="createdAt">Date Created</option>
              <option value="appointmentDate">Appointment Date</option>
              <option value="totalAmount">Amount</option>
            </select>
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 hover:bg-gray-50 transition-colors"
            >
              <span className="transition-transform duration-200">
                {sortOrder === 'asc' ? <FaArrowUp /> : <FaArrowDown />}
              </span>
              Sort
            </button>
            {hasActiveFilters && (
              <button
                onClick={() => {
                  setStatusFilter('')
                  setDateFilter('')
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-900"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Appointments Table */}
      <div className="bg-white border border-gray-200">
        {loading ? (
          <div className="p-12 text-center">
            <FaSpinner className="animate-spin mx-auto text-primary-600 text-4xl mb-4" />
            <p className="text-gray-600">Loading appointments...</p>
          </div>
        ) : !hasAppointments ? (
          <div className="p-12 text-center transition-opacity duration-200">
            <FaCalendarAlt className="mx-auto text-gray-400 text-4xl mb-4" />
            <p className="text-gray-600">No appointments found</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Booking ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date & Time</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Services</th>
                    {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Staff</th> */}
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date & Time</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {appointments.map((appointment) => (
                    <AppointmentRow
                      key={appointment.bookingNumber}
                      appointment={appointment}
                      updatingStatus={updatingStatus[appointment._id]}
                      onQuickUpdate={quickStatusUpdate}
                      onViewDetails={handleViewDetails}
                      copiedBooking={copiedBooking}
                      onUpdateStatusClick={handleUpdateStatusClick}
                      onCopyBooking={handleCopyBooking}
                    />
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {showPagination && (
              <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                  {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                  {pagination.total} appointments
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1}
                    className="px-4 py-2 border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <span className="px-4 py-2 text-sm text-gray-700">
                    Page {pagination.page} of {pagination.pages}
                  </span>
                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page >= pagination.pages}
                    className="px-4 py-2 border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Status Update Modal */}
      {statusUpdateModal.show && statusUpdateModal.appointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white shadow-lg p-6 max-w-md w-full">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Update Appointment Status</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={statusUpdateModal.newStatus || statusUpdateModal.appointment.status}
                  onChange={(e) => setStatusUpdateModal(prev => ({ ...prev, newStatus: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="no_show">No Show</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Notes (Optional)</label>
                <textarea
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Add notes about this status update..."
                  onChange={(e) => setStatusUpdateModal(prev => ({ ...prev, notes: e.target.value }))}
                />
              </div>
            </div>

            <div className="flex items-center gap-3 mt-6">
              <button
                onClick={confirmStatusUpdate}
                disabled={updatingStatus[statusUpdateModal.appointment?._id]}
                className="flex-1 px-4 py-2 bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {updatingStatus[statusUpdateModal.appointment?._id] ? (
                  <>
                    <FaSpinner className="animate-spin inline mr-2" />
                    Updating...
                  </>
                ) : (
                  'Update Status'
                )}
              </button>
              <button
                onClick={closeModal}
                className="px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AppointmentList
