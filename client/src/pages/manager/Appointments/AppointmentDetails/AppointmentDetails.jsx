import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import {
  FaArrowLeft,
  FaCalendarAlt,
  FaUser,
  FaPhone,
  FaEnvelope,
  FaSpinner,
  FaEdit,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaDollarSign,
  FaMapMarkerAlt,
  FaUserTie,
  FaStickyNote,
  FaExclamationCircle
} from 'react-icons/fa'
import managerService from '../../../../services/manager/managerService'

const AppointmentDetails = () => {
  const navigate = useNavigate()
  const { id: appointmentId } = useParams()
  const [loading, setLoading] = useState(true)
  const [appointment, setAppointment] = useState(null)
  const [updating, setUpdating] = useState(false)
  const [statusUpdate, setStatusUpdate] = useState({
    status: '',
    notes: ''
  })
  const [showStatusModal, setShowStatusModal] = useState(false)

  useEffect(() => {
    if (appointmentId && appointmentId !== 'undefined') {
      fetchAppointmentDetails()
    } else {
      toast.error('Invalid appointment ID')
      navigate('/manager/appointments')
    }
  }, [appointmentId])

  const fetchAppointmentDetails = async () => {
    if (!appointmentId || appointmentId === 'undefined') {
      return
    }

    try {
      setLoading(true)
      // Use getAppointments and filter, or create a separate endpoint call
      // For now, we'll get all and filter client-side, but ideally should have getAppointmentById
      const result = await managerService.getAppointments({})
      
      if (result.success) {
        const appointments = result.data?.data || result.data || []
        const foundAppointment = appointments.find(apt => apt._id === appointmentId)
        
        if (foundAppointment) {
          setAppointment(foundAppointment)
          setStatusUpdate({
            status: foundAppointment.status || '',
            notes: foundAppointment.completionNotes || ''
          })
        } else {
          toast.error('Appointment not found')
          navigate('/manager/appointments')
        }
      } else {
        toast.error(result.error || 'Failed to fetch appointment details')
        navigate('/manager/appointments')
      }
    } catch (error) {
      toast.error('Failed to fetch appointment details')
      console.error(error)
      navigate('/manager/appointments')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async () => {
    if (!statusUpdate.status) {
      toast.error('Please select a status')
      return
    }

    try {
      setUpdating(true)
      const result = await managerService.updateAppointmentStatus(
        appointmentId,
        statusUpdate.status,
        statusUpdate.notes
      )

      if (result.success) {
        toast.success('Appointment status updated successfully')
        setShowStatusModal(false)
        fetchAppointmentDetails()
      } else {
        toast.error(result.error || 'Failed to update appointment status')
      }
    } catch (error) {
      toast.error('Failed to update appointment status')
      console.error(error)
    } finally {
      setUpdating(false)
    }
  }

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
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount || 0)
  }

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <FaSpinner className="animate-spin mx-auto text-primary-600 text-4xl mb-4" />
          <p className="text-gray-600">Loading appointment details...</p>
        </div>
      </div>
    )
  }

  if (!appointment) {
    return (
      <div className="p-6 text-center text-gray-600">
        <p>No appointment found or an error occurred.</p>
        <button
          onClick={() => navigate('/manager/appointments')}
          className="mt-4 text-primary-600 hover:underline"
        >
          Go back to Appointments
        </button>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/manager/appointments')}
            className="p-2 hover:bg-gray-100  transition-colors"
          >
            <FaArrowLeft className="text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <FaCalendarAlt className="text-primary-600" />
              Appointment Details
            </h1>
            <p className="text-gray-600 mt-1">View and manage appointment information</p>
          </div>
        </div>
        <button
          onClick={() => setShowStatusModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white  hover:bg-primary-700 transition-colors"
        >
          <FaEdit />
          Update Status
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Appointment Information */}
          <div className="bg-white   border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Appointment Information</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date & Time</label>
                <p className="text-gray-900 flex items-center gap-2">
                  <FaCalendarAlt className="text-gray-400" />
                  {formatDateTime(appointment.appointmentDate, appointment.startTime)}
                </p>
                {appointment.endTime && (
                  <p className="text-sm text-gray-600 ml-6">Ends at {appointment.endTime}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <div className="flex items-center gap-2">
                  {getStatusIcon(appointment.status)}
                  <span className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${getStatusBadge(appointment.status)}`}>
                    {appointment.status?.replace('_', ' ') || 'Pending'}
                  </span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirmation Code</label>
                <p className="text-gray-900 font-mono">{appointment.confirmationCode || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
                <p className="text-gray-900">{appointment.duration || 60} minutes</p>
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Services</label>
                <div className="flex flex-wrap gap-2">
                  {Array.isArray(appointment.services)
                    ? appointment.services.map((service, index) => (
                        <span key={index} className="px-3 py-1 bg-primary-100 text-primary-800  text-sm">
                          {service?.serviceName || service}
                        </span>
                      ))
                    : appointment.serviceName && (
                        <span className="px-3 py-1 bg-primary-100 text-primary-800  text-sm">
                          {appointment.serviceName}
                        </span>
                      )}
                </div>
              </div>
            </div>
          </div>

          {/* Customer Information */}
          <div className="bg-white   border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Customer Information</h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <FaUser className="text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Name</p>
                  <p className="text-gray-900">{appointment.customer?.name || 'N/A'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <FaPhone className="text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Phone</p>
                  <p className="text-gray-900">{appointment.customer?.phone || 'N/A'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <FaEnvelope className="text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Email</p>
                  <p className="text-gray-900">{appointment.customer?.email || 'N/A'}</p>
                </div>
              </div>
              {appointment.customer?._id && (
                <button
                  onClick={() => navigate(`/manager/customers/${appointment.customer._id}`)}
                  className="mt-4 text-primary-600 hover:text-primary-700 text-sm font-medium"
                >
                  View Customer Profile →
                </button>
              )}
            </div>
          </div>

          {/* Staff Information */}
          {appointment.staff && (
            <div className="bg-white   border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Staff Information</h2>
              <div className="flex items-center gap-3">
                <FaUserTie className="text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Assigned Staff</p>
                  <p className="text-gray-900">{appointment.staff?.name || 'TBD'}</p>
                  {appointment.staff?.role && (
                    <p className="text-sm text-gray-500">{appointment.staff.role}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Notes */}
          {(appointment.customerNotes || appointment.specialRequests || appointment.completionNotes) && (
            <div className="bg-white   border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FaStickyNote />
                Notes
              </h2>
              <div className="space-y-3">
                {appointment.customerNotes && (
                  <div>
                    <p className="text-sm font-medium text-gray-700">Customer Notes</p>
                    <p className="text-gray-900">{appointment.customerNotes}</p>
                  </div>
                )}
                {appointment.specialRequests && (
                  <div>
                    <p className="text-sm font-medium text-gray-700">Special Requests</p>
                    <p className="text-gray-900">{appointment.specialRequests}</p>
                  </div>
                )}
                {appointment.completionNotes && (
                  <div>
                    <p className="text-sm font-medium text-gray-700">Completion Notes</p>
                    <p className="text-gray-900">{appointment.completionNotes}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Summary */}
          <div className="bg-white   border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Summary</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Total Amount</span>
                <span className="text-lg font-bold text-green-600">
                  {formatCurrency(appointment.finalPrice || appointment.totalPrice || 0)}
                </span>
              </div>
              {appointment.basePrice && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Base Price</span>
                  <span className="text-gray-900">{formatCurrency(appointment.basePrice)}</span>
                </div>
              )}
              {appointment.discount > 0 && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Discount</span>
                  <span className="text-green-600">-{formatCurrency(appointment.discount)}</span>
                </div>
              )}
              {appointment.tax > 0 && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Tax</span>
                  <span className="text-gray-900">{formatCurrency(appointment.tax)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-white   border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Timeline</h2>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-gray-500">Created</p>
                <p className="text-sm text-gray-900">{formatDate(appointment.createdAt)}</p>
              </div>
              {appointment.confirmedAt && (
                <div>
                  <p className="text-xs text-gray-500">Confirmed</p>
                  <p className="text-sm text-gray-900">{formatDate(appointment.confirmedAt)}</p>
                </div>
              )}
              {appointment.completedAt && (
                <div>
                  <p className="text-xs text-gray-500">Completed</p>
                  <p className="text-sm text-gray-900">{formatDate(appointment.completedAt)}</p>
                </div>
              )}
              {appointment.cancelledAt && (
                <div>
                  <p className="text-xs text-gray-500">Cancelled</p>
                  <p className="text-sm text-gray-900">{formatDate(appointment.cancelledAt)}</p>
                  {appointment.cancellationReason && (
                    <p className="text-xs text-red-600 mt-1">{appointment.cancellationReason}</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Status Update Modal */}
      {showStatusModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white  shadow-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Update Appointment Status</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={statusUpdate.status}
                  onChange={(e) => setStatusUpdate(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300  focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Select Status</option>
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
                  value={statusUpdate.notes}
                  onChange={(e) => setStatusUpdate(prev => ({ ...prev, notes: e.target.value }))}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300  focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Add notes about this status update..."
                />
              </div>
            </div>

            <div className="flex items-center gap-3 mt-6">
              <button
                onClick={handleStatusUpdate}
                disabled={updating || !statusUpdate.status}
                className="flex-1 px-4 py-2 bg-primary-600 text-white  hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {updating ? (
                  <>
                    <FaSpinner className="animate-spin inline mr-2" />
                    Updating...
                  </>
                ) : (
                  'Update Status'
                )}
              </button>
              <button
                onClick={() => {
                  setShowStatusModal(false)
                  setStatusUpdate({
                    status: appointment.status || '',
                    notes: appointment.completionNotes || ''
                  })
                }}
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

export default AppointmentDetails
