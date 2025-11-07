import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import {
  FaCalendarAlt,
  FaCheckCircle,
  FaTimesCircle,
  FaSpinner,
  FaClock,
  FaUser,
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaDollarSign,
  FaUserTie,
  FaPrint,
  FaShare,
  FaArrowLeft,
  FaExclamationTriangle
} from 'react-icons/fa'
import apiClient from '../../../services/api/client'
import { endpoints } from '../../../constants/api/endpoints'

const AppointmentStatus = () => {
  const navigate = useNavigate()
  const { confirmationCode } = useParams()
  const [loading, setLoading] = useState(true)
  const [appointment, setAppointment] = useState(null)
  const [cancelling, setCancelling] = useState(false)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [cancelReason, setCancelReason] = useState('')

  useEffect(() => {
    if (confirmationCode) {
      fetchAppointmentByCode()
    } else {
      toast.error('Invalid confirmation code')
      navigate('/')
    }
  }, [confirmationCode])

  const fetchAppointmentByCode = async () => {
    try {
      setLoading(true)
      const response = await apiClient.get(endpoints.appointments.appointmentByCode(confirmationCode))
      
      if (response.data.success) {
        setAppointment(response.data.data)
      } else {
        toast.error(response.data.message || 'Appointment not found')
        setAppointment(null)
      }
    } catch (error) {
      toast.error('Failed to fetch appointment')
      console.error(error)
      setAppointment(null)
    } finally {
      setLoading(false)
    }
  }

  const handleCancelAppointment = async () => {
    if (!cancelReason.trim()) {
      toast.error('Please provide a cancellation reason')
      return
    }

    try {
      setCancelling(true)
      const response = await apiClient.post(
        endpoints.appointments.cancelAppointment(confirmationCode),
        { reason: cancelReason }
      )

      if (response.data.success) {
        toast.success('Appointment cancelled successfully')
        setShowCancelModal(false)
        setCancelReason('')
        fetchAppointmentByCode() // Refresh appointment data
      } else {
        toast.error(response.data.message || 'Failed to cancel appointment')
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to cancel appointment')
      console.error(error)
    } finally {
      setCancelling(false)
    }
  }

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      confirmed: 'bg-blue-100 text-blue-800 border-blue-300',
      in_progress: 'bg-purple-100 text-purple-800 border-purple-300',
      completed: 'bg-green-100 text-green-800 border-green-300',
      cancelled: 'bg-red-100 text-red-800 border-red-300',
      no_show: 'bg-gray-100 text-gray-800 border-gray-300'
    }
    return badges[status] || 'bg-gray-100 text-gray-800 border-gray-300'
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <FaCheckCircle className="text-green-600 text-4xl" />
      case 'cancelled':
        return <FaTimesCircle className="text-red-600 text-4xl" />
      case 'confirmed':
        return <FaCheckCircle className="text-blue-600 text-4xl" />
      case 'pending':
        return <FaClock className="text-yellow-600 text-4xl" />
      default:
        return <FaClock className="text-gray-600 text-4xl" />
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

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount || 0)
  }

  const handlePrint = () => {
    window.print()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="text-center">
          <FaSpinner className="animate-spin mx-auto text-primary-600 text-4xl mb-4" />
          <p className="text-gray-600">Loading appointment details...</p>
        </div>
      </div>
    )
  }

  if (!appointment) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center max-w-md">
          <FaTimesCircle className="mx-auto text-red-500 text-4xl mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Appointment Not Found</h2>
          <p className="text-gray-600 mb-6">The appointment with this confirmation code could not be found.</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            Go Home
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <FaCalendarAlt className="text-primary-600" />
                Appointment Status
              </h1>
              <p className="text-gray-600 mt-1">Confirmation Code: <span className="font-mono font-semibold">{confirmationCode}</span></p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrint}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <FaPrint />
                Print
              </button>
            </div>
          </div>
        </div>

        {/* Status Card */}
        <div className="bg-white rounded-xl shadow-sm border-2 border-gray-200 p-8 text-center">
          <div className="flex justify-center mb-4">
            {getStatusIcon(appointment.status)}
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Appointment {appointment.status?.replace('_', ' ').toUpperCase()}</h2>
          <span className={`inline-block px-4 py-2 rounded-full text-sm font-medium border-2 ${getStatusBadge(appointment.status)}`}>
            {appointment.status?.replace('_', ' ') || 'Pending'}
          </span>
        </div>

        {/* Appointment Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Date & Time */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FaClock className="text-primary-600" />
              Date & Time
            </h3>
            <div className="space-y-2">
              <p className="text-gray-900 font-medium">
                {formatDateTime(appointment.appointmentDate, appointment.startTime)}
              </p>
              {appointment.endTime && (
                <p className="text-sm text-gray-600">Ends at {appointment.endTime}</p>
              )}
              {appointment.duration && (
                <p className="text-sm text-gray-600">Duration: {appointment.duration} minutes</p>
              )}
            </div>
          </div>

          {/* Business Information */}
          {appointment.business && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FaMapMarkerAlt className="text-primary-600" />
                Business
              </h3>
              <div className="space-y-2">
                <p className="text-gray-900 font-medium">{appointment.business.name}</p>
                {appointment.business.branch && (
                  <p className="text-sm text-gray-600">{appointment.business.branch}</p>
                )}
                {appointment.business.address && (
                  <p className="text-sm text-gray-600">{appointment.business.address}</p>
                )}
                {appointment.business.phone && (
                  <p className="text-sm text-gray-600 flex items-center gap-2">
                    <FaPhone className="text-gray-400" />
                    {appointment.business.phone}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Services */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Services</h3>
            <div className="space-y-2">
              {Array.isArray(appointment.services) && appointment.services.length > 0
                ? appointment.services.map((service, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="text-gray-900">{service?.serviceName || service}</span>
                      {service?.price && (
                        <span className="text-gray-600">{formatCurrency(service.price)}</span>
                      )}
                    </div>
                  ))
                : appointment.serviceName && (
                    <div className="p-2 bg-gray-50 rounded">
                      <span className="text-gray-900">{appointment.serviceName}</span>
                    </div>
                  )}
            </div>
          </div>

          {/* Pricing */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FaDollarSign className="text-green-600" />
              Pricing
            </h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Total Amount</span>
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
        </div>

        {/* Staff Information */}
        {appointment.staff && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FaUserTie className="text-primary-600" />
              Assigned Staff
            </h3>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                <FaUser className="text-primary-600" />
              </div>
              <div>
                <p className="text-gray-900 font-medium">{appointment.staff.name}</p>
                {appointment.staff.role && (
                  <p className="text-sm text-gray-600">{appointment.staff.role}</p>
                )}
                {appointment.staff.specialization && (
                  <p className="text-sm text-gray-500">Specialization: {appointment.staff.specialization}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Customer Information */}
        {appointment.customer && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FaUser className="text-primary-600" />
              Your Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Name</p>
                <p className="text-gray-900 font-medium">{appointment.customer.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Phone</p>
                <p className="text-gray-900 font-medium">{appointment.customer.phone}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="text-gray-900 font-medium">{appointment.customer.email}</p>
              </div>
            </div>
          </div>
        )}

        {/* Notes */}
        {(appointment.customerNotes || appointment.specialRequests) && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Notes</h3>
            <div className="space-y-3">
              {appointment.customerNotes && (
                <div>
                  <p className="text-sm font-medium text-gray-700">Your Notes</p>
                  <p className="text-gray-900">{appointment.customerNotes}</p>
                </div>
              )}
              {appointment.specialRequests && (
                <div>
                  <p className="text-sm font-medium text-gray-700">Special Requests</p>
                  <p className="text-gray-900">{appointment.specialRequests}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Cancellation Section */}
        {appointment.status !== 'cancelled' && appointment.status !== 'completed' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Need to Cancel?</h3>
                <p className="text-sm text-gray-600">You can cancel this appointment if your plans have changed.</p>
              </div>
              <button
                onClick={() => setShowCancelModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <FaTimesCircle />
                Cancel Appointment
              </button>
            </div>
          </div>
        )}

        {/* Cancellation Info */}
        {appointment.status === 'cancelled' && (
          <div className="bg-red-50 rounded-xl border border-red-200 p-6">
            <div className="flex items-start gap-3">
              <FaTimesCircle className="text-red-600 text-2xl mt-1" />
              <div>
                <h3 className="text-lg font-semibold text-red-900 mb-2">Appointment Cancelled</h3>
                {appointment.cancelledAt && (
                  <p className="text-sm text-red-700">
                    Cancelled on {new Date(appointment.cancelledAt).toLocaleString('en-US')}
                  </p>
                )}
                {appointment.cancellationReason && (
                  <p className="text-sm text-red-700 mt-2">
                    <strong>Reason:</strong> {appointment.cancellationReason}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <FaArrowLeft />
              Back to Home
            </button>
          </div>
        </div>
      </div>

      {/* Cancel Appointment Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg p-6 max-w-md w-full">
            <div className="flex items-center gap-3 mb-4">
              <FaExclamationTriangle className="text-red-600 text-2xl" />
              <h2 className="text-lg font-semibold text-gray-900">Cancel Appointment</h2>
            </div>
            
            <p className="text-gray-600 mb-4">
              Are you sure you want to cancel this appointment? This action cannot be undone.
            </p>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason for Cancellation
              </label>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="Please provide a reason for cancellation..."
              />
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleCancelAppointment}
                disabled={cancelling || !cancelReason.trim()}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {cancelling ? (
                  <>
                    <FaSpinner className="animate-spin inline mr-2" />
                    Cancelling...
                  </>
                ) : (
                  'Cancel Appointment'
                )}
              </button>
              <button
                onClick={() => {
                  setShowCancelModal(false)
                  setCancelReason('')
                }}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Keep Appointment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AppointmentStatus
