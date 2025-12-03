import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import {
  FaCalendarAlt,
  FaSearch,
  FaFilter,
  FaSpinner,
  FaEye,
  FaEdit,
  FaClock,
  FaUser,
  FaPhoneAlt,
  FaEnvelope,
  FaMapMarkerAlt,
  FaCheckCircle,
  FaTimesCircle,
  FaExclamationCircle,
  FaArrowUp,
  FaArrowDown
} from 'react-icons/fa'
import managerService from '../../../../services/manager/managerService'
import normalizeAppointment from '../../../../utils/appointment/normalizeAppointment'

const AppointmentList = () => {
  const navigate = useNavigate()
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [dateFilter, setDateFilter] = useState('')
  const [sortBy, setSortBy] = useState('createdAt')
  const [sortOrder, setSortOrder] = useState('desc') // Show newest first
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 0 })
  const [updatingStatus, setUpdatingStatus] = useState({})
  const [statusUpdateModal, setStatusUpdateModal] = useState({ 
    show: false, 
    appointment: null, 
    newStatus: '',
    notes: ''
  })

  const fetchAppointments = useCallback(async () => {
    try {
      setLoading(true)
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        sortBy,
        sortOrder
      }

      if (statusFilter) params.status = statusFilter
      if (dateFilter) params.date = dateFilter

      const result = await managerService.getAppointments(params)

      if (result.success) {
        let fetchedAppointments = result.data?.data || result.data || []
        fetchedAppointments = fetchedAppointments.map(normalizeAppointment)
        
        // Client-side search
        if (searchTerm) {
          const term = searchTerm.toLowerCase()
          fetchedAppointments = fetchedAppointments.filter(apt =>
            apt.customer?.name?.toLowerCase().includes(term) ||
            apt.customer?.phone?.includes(searchTerm) ||
            apt.customer?.email?.toLowerCase().includes(term) ||
            apt.confirmationCode?.toLowerCase().includes(term) ||
            apt.bookingNumber?.toLowerCase().includes(term)
          )
        }

        setAppointments(fetchedAppointments)
        setPagination(prev => ({
          ...prev,
          total: result.data?.pagination?.total || fetchedAppointments.length,
          pages: result.data?.pagination?.pages || Math.ceil((result.data?.pagination?.total || fetchedAppointments.length) / pagination.limit)
        }))
      } else {
        toast.error(result.error || 'Failed to fetch appointments')
      }
    } catch (error) {
      toast.error('Failed to fetch appointments')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }, [pagination.page, pagination.limit, statusFilter, dateFilter, sortBy, sortOrder, searchTerm])

  useEffect(() => {
    fetchAppointments()
  }, [fetchAppointments])

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

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <FaCheckCircle className="text-green-600" />
      case 'cancelled':
        return <FaTimesCircle className="text-red-600" />
      case 'confirmed':
        return <FaCheckCircle className="text-blue-600" />
      case 'pending':
        return <FaExclamationCircle className="text-yellow-600" />
      default:
        return <FaClock className="text-gray-600" />
    }
  }

  const formatDateTime = (dateString, timeString) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    const formattedDate = date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
    return timeString ? `${formattedDate} at ${timeString}` : formattedDate
  }

  const isNewAppointment = (appointment) => {
    if (!appointment.createdAt) return false
    const createdDate = new Date(appointment.createdAt)
    const now = new Date()
    const hoursSinceCreation = (now - createdDate) / (1000 * 60 * 60)
    return hoursSinceCreation <= 24 // New if created within last 24 hours
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount || 0)
  }

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }))
  }

  const handleStatusChange = (appointment, newStatus) => {
    setStatusUpdateModal({
      show: true,
      appointment: appointment,
      newStatus: newStatus
    })
  }

  const confirmStatusUpdate = async () => {
    const { appointment, newStatus, notes } = statusUpdateModal
    if (!appointment || !newStatus) return

    try {
      setUpdatingStatus(prev => ({ ...prev, [appointment._id]: true }))
      const result = await managerService.updateAppointmentStatus(
        appointment._id,
        newStatus,
        notes || ''
      )

      if (result.success) {
        toast.success('Appointment status updated successfully')
        setStatusUpdateModal({ show: false, appointment: null })
        setAppointments(prev =>
          prev.map(item =>
            item._id === appointment._id
              ? normalizeAppointment({ ...item, ...result.data?.data, status: newStatus, staffNotes: notes })
              : item
          )
        )
      } else {
        toast.error(result.error || 'Failed to update appointment status')
      }
    } catch (error) {
      toast.error('Failed to update appointment status')
      console.error(error)
    } finally {
      setUpdatingStatus(prev => ({ ...prev, [appointment._id]: false }))
    }
  }

  const quickStatusUpdate = async (appointment, newStatus) => {
    if (!appointment || !newStatus || newStatus === appointment.status) return

    try {
      setUpdatingStatus(prev => ({ ...prev, [appointment._id]: true }))
      const result = await managerService.updateAppointmentStatus(appointment._id, newStatus)

      if (result.success) {
        toast.success('Status updated successfully')
        const updated = result.data?.data || { status: newStatus }
        setAppointments(prev =>
          prev.map(item =>
            item._id === appointment._id
              ? normalizeAppointment({ ...item, ...updated })
              : item
          )
        )
      } else {
        toast.error(result.error || 'Failed to update status')
      }
    } catch (error) {
      toast.error('Failed to update status')
      console.error(error)
    } finally {
      setUpdatingStatus(prev => ({ ...prev, [appointment._id]: false }))
    }
  }

  return (
    <div className="p-6 space-y-6">
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
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white  hover:bg-primary-700 transition-colors"
        >
          <FaCalendarAlt />
          Calendar View
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white   border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search appointments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300  focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300  focus:outline-none focus:ring-2 focus:ring-primary-500"
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
            className="px-4 py-2 border border-gray-300  focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300  hover:bg-gray-50 transition-colors"
            >
              {sortOrder === 'asc' ? <FaArrowUp /> : <FaArrowDown />}
              Sort
            </button>
            {(statusFilter || dateFilter) && (
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
      <div className="bg-white   border border-gray-200">
        {loading ? (
          <div className="p-12 text-center">
            <FaSpinner className="animate-spin mx-auto text-primary-600 text-4xl mb-4" />
            <p className="text-gray-600">Loading appointments...</p>
          </div>
        ) : appointments.length === 0 ? (
          <div className="p-12 text-center">
            <FaCalendarAlt className="mx-auto text-gray-400 text-4xl mb-4" />
            <p className="text-gray-600">No appointments found</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date & Time</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Services</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Staff</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {appointments.map((appointment) => (
                    <tr key={appointment._id} className="hover:bg-gray-50 transition-colors">
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
                            <div className="text-xs text-gray-500">booking ID: {appointment.confirmationCode}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <div className="font-medium text-gray-900">{appointment.customer?.name || 'N/A'}</div>
                          <div className="text-xs text-gray-500 flex items-center gap-2">
                            <FaPhoneAlt className="text-gray-400" />
                            {appointment.customer?.phone || 'N/A'}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {Array.isArray(appointment.services)
                            ? appointment.services.map(s => s?.serviceName || s).join(', ')
                            : appointment.serviceName || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {appointment.staff?.name || 'TBD'}
                        </div>
                        {appointment.staff?.role && (
                          <div className="text-xs text-gray-500">{appointment.staff.role}</div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-semibold text-gray-900">
                          {formatCurrency(appointment.totalAmount || appointment.finalPrice || appointment.totalPrice || 0)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="relative flex items-center gap-2">
                          <select
                            value={appointment.status || 'pending'}
                            onChange={(e) => quickStatusUpdate(appointment, e.target.value)}
                            disabled={updatingStatus[appointment._id]}
                            className={`px-3 py-1.5  text-xs font-medium capitalize cursor-pointer border-0 focus:outline-none focus:ring-2 focus:ring-primary-500 ${getStatusBadge(appointment.status)} ${
                              updatingStatus[appointment._id] ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90'
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
                          {updatingStatus[appointment._id] && (
                            <FaSpinner className="animate-spin text-primary-600 text-sm" />
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => navigate(`/manager/appointments/${appointment._id}`)}
                            className="p-2 text-primary-600 hover:bg-primary-50  transition-colors"
                            title="View Details"
                          >
                            <FaEye />
                          </button>
              <button
                onClick={() => {
                  setStatusUpdateModal({
                    show: true,
                    appointment: appointment,
                    newStatus: appointment.status || 'pending',
                    notes: ''
                  })
                }}
                className="p-2 text-gray-600 hover:bg-gray-50  transition-colors"
                title="Update Status with Notes"
              >
                <FaEdit />
              </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
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
                    className="px-4 py-2 border border-gray-300  hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <span className="px-4 py-2 text-sm text-gray-700">
                    Page {pagination.page} of {pagination.pages}
                  </span>
                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
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

      {/* Status Update Modal */}
      {statusUpdateModal.show && statusUpdateModal.appointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white  shadow-lg p-6 max-w-md w-full">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Update Appointment Status</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={statusUpdateModal.newStatus || statusUpdateModal.appointment.status}
                  onChange={(e) => setStatusUpdateModal(prev => ({ ...prev, newStatus: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300  focus:outline-none focus:ring-2 focus:ring-primary-500"
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
                  className="w-full px-3 py-2 border border-gray-300  focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Add notes about this status update..."
                  onChange={(e) => setStatusUpdateModal(prev => ({ ...prev, notes: e.target.value }))}
                />
              </div>
            </div>

            <div className="flex items-center gap-3 mt-6">
              <button
                onClick={confirmStatusUpdate}
                disabled={updatingStatus[statusUpdateModal.appointment?._id]}
                className="flex-1 px-4 py-2 bg-primary-600 text-white  hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
                onClick={() => setStatusUpdateModal({ show: false, appointment: null, newStatus: '', notes: '' })}
                className="px-4 py-2 border border-gray-300 text-gray-700  hover:bg-gray-50 transition-colors"
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
