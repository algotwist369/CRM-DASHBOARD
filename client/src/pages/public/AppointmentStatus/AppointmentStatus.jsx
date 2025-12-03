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
  FaRupeeSign,
  FaUserTie,
  FaPrint,
  FaShare,
  FaArrowLeft,
  FaExclamationTriangle
} from 'react-icons/fa'
import apiClient from '../../../services/api/client'
import { endpoints } from '../../../constants/api/endpoints'
import { usePageTitle } from '../../../hooks/usePageTitle'

const AppointmentStatus = () => {
  const navigate = useNavigate()
  const { confirmationCode } = useParams()
  const [loading, setLoading] = useState(true)
  const [appointment, setAppointment] = useState(null)
  const [cancelling, setCancelling] = useState(false)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [cancelReason, setCancelReason] = useState('')

  // Update page title
  usePageTitle()

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
        <div className="bg-white   border border-gray-200 p-8 text-center max-w-md">
          <FaTimesCircle className="mx-auto text-red-500 text-4xl mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Appointment Not Found</h2>
          <p className="text-gray-600 mb-6">The appointment with this confirmation code could not be found.</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-2 bg-primary-600 text-white  hover:bg-primary-700 transition-colors"
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
        <div className="bg-white   border border-gray-200 p-6">
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
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700  hover:bg-gray-50 transition-colors"
              >
                <FaPrint />
                Print
              </button>
            </div>
          </div>
        </div>

        {/* Status Card */}
        <div className="bg-white   border border-gray-200 p-8 text-center">
          <div className="flex justify-center mb-4">
            {getStatusIcon(appointment.status)}
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Appointment {appointment.status?.replace('_', ' ').toUpperCase()}</h2>
          <span className={`inline-block px-4 py-2 rounded-full text-sm font-medium border ${getStatusBadge(appointment.status)}`}>
            {appointment.status?.replace('_', ' ') || 'Pending'}
          </span>
        </div>

        {/* Appointment Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Date & Time */}
          <div className="bg-white   border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FaClock className="text-primary-600" />
              Date & Time
            </h3>
            <div className="space-y-2">
              <p className="text-gray-900 font-medium">
                {appointment.appointmentDate 
                  ? new Date(appointment.appointmentDate).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })
                  : 'N/A'}
              </p>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                {appointment.startTime && (
                  <div className="flex items-center gap-1">
                    <FaClock className="text-primary-500" />
                    <span className="font-medium">Start: {appointment.startTime}</span>
                  </div>
                )}
                {appointment.endTime && (
                  <div className="flex items-center gap-1">
                    <span className="font-medium">End: {appointment.endTime}</span>
                  </div>
                )}
              </div>
              {appointment.duration && (
                <p className="text-sm text-gray-600">Duration: {appointment.duration} minutes</p>
              )}
              {appointment.bookingSource && (
                <p className="text-sm text-gray-500">Booking Source: <span className="capitalize">{appointment.bookingSource.replace('_', ' ')}</span></p>
              )}
            </div>
          </div>

          {/* Business Information */}
          {appointment.business && (
            <div className="bg-white   border border-gray-200 p-6">
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
                  <p className="text-sm text-gray-600">
                    {typeof appointment.business.address === 'object' 
                      ? `${appointment.business.address.street || ''}${appointment.business.address.city ? ', ' + appointment.business.address.city : ''}${appointment.business.address.state ? ', ' + appointment.business.address.state : ''}${appointment.business.address.zipCode ? ' - ' + appointment.business.address.zipCode : ''}`.trim() || appointment.business.address.street
                      : appointment.business.address}
                    {appointment.business.city && typeof appointment.business.address !== 'object' && `, ${appointment.business.city}`}
                    {appointment.business.state && typeof appointment.business.address !== 'object' && `, ${appointment.business.state}`}
                  </p>
                )}
                {appointment.business.phone && (
                  <p className="text-sm text-gray-600 flex items-center gap-2">
                    <FaPhone className="text-gray-400" />
                    {appointment.business.phone}
                  </p>
                )}
                {appointment.business.email && (
                  <p className="text-sm text-gray-600 flex items-center gap-2">
                    <FaEnvelope className="text-gray-400" />
                    {appointment.business.email}
                  </p>
                )}
                {appointment.business.website && (
                  <p className="text-sm text-gray-600">
                    <a href={appointment.business.website} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">
                      {appointment.business.website}
                    </a>
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Services */}
          <div className="bg-white   border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Service</h3>
            <div className="space-y-2">
              {appointment.service ? (
                <div className="p-3 bg-gray-50 ">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-gray-900 font-medium">
                      {appointment.service.name || appointment.service.serviceName || 'Service'}
                    </span>
                    {appointment.service.price && (
                      <span className="text-gray-700 font-semibold">
                        {formatCurrency(appointment.service.price)}
                      </span>
                    )}
                  </div>
                  {appointment.service.duration && (
                    <p className="text-sm text-gray-600">Duration: {appointment.service.duration} minutes</p>
                  )}
                  {appointment.service.category && (
                    <p className="text-sm text-gray-600">Category: {appointment.service.category}</p>
                  )}
                  {appointment.service.description && (
                    <p className="text-sm text-gray-600 mt-2">{appointment.service.description}</p>
                  )}
                </div>
              ) : appointment.serviceName ? (
                <div className="p-2 bg-gray-50 rounded">
                  <span className="text-gray-900">{appointment.serviceName}</span>
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No service information available</p>
              )}
            </div>
          </div>

          {/* Pricing */}
          <div className="bg-white   border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FaRupeeSign className="text-green-600" />
              Pricing
            </h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Total Amount</span>
                <span className="text-lg font-bold text-green-600">
                  {formatCurrency(appointment.finalPrice || appointment.totalAmount || appointment.servicePrice || 0)}
                </span>
              </div>
              {appointment.servicePrice && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Service Price</span>
                  <span className="text-gray-900">{formatCurrency(appointment.servicePrice)}</span>
                </div>
              )}
              {appointment.additionalCharges > 0 && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Additional Charges</span>
                  <span className="text-gray-900">+{formatCurrency(appointment.additionalCharges)}</span>
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
                  <span className="text-gray-900">+{formatCurrency(appointment.tax)}</span>
                </div>
              )}
              {appointment.paymentStatus && (
                <div className="pt-2 mt-2 border-t border-gray-200">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Payment Status</span>
                    <span className={`font-semibold ${
                      appointment.paymentStatus === 'paid' ? 'text-green-600' :
                      appointment.paymentStatus === 'partial' ? 'text-yellow-600' :
                      appointment.paymentStatus === 'refunded' ? 'text-blue-600' :
                      'text-gray-600'
                    }`}>
                      {appointment.paymentStatus.charAt(0).toUpperCase() + appointment.paymentStatus.slice(1)}
                    </span>
                  </div>
                  {appointment.paymentMethod && (
                    <div className="flex items-center justify-between text-sm mt-1">
                      <span className="text-gray-600">Payment Method</span>
                      <span className="text-gray-900 capitalize">{appointment.paymentMethod}</span>
                    </div>
                  )}
                  {appointment.paidAmount > 0 && (
                    <div className="flex items-center justify-between text-sm mt-1">
                      <span className="text-gray-600">Paid Amount</span>
                      <span className="text-gray-900 font-semibold">{formatCurrency(appointment.paidAmount)}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Staff Information */}
        {appointment.staff && (
          <div className="bg-white   border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FaUserTie className="text-primary-600" />
              Assigned Staff
            </h3>
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                <FaUser className="text-primary-600" />
              </div>
              <div className="flex-1">
                <p className="text-gray-900 font-medium text-lg">{appointment.staff.name}</p>
                {appointment.staff.role && (
                  <p className="text-sm text-gray-600 mt-1">{appointment.staff.role}</p>
                )}
                {appointment.staff.specialization && (
                  <p className="text-sm text-gray-500 mt-1">Specialization: {appointment.staff.specialization}</p>
                )}
                <div className="mt-2 space-y-1">
                  {appointment.staff.phone && (
                    <p className="text-sm text-gray-600 flex items-center gap-2">
                      <FaPhone className="text-gray-400" />
                      {appointment.staff.phone}
                    </p>
                  )}
                  {appointment.staff.email && (
                    <p className="text-sm text-gray-600 flex items-center gap-2">
                      <FaEnvelope className="text-gray-400" />
                      {appointment.staff.email}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Customer Information */}
        {appointment.customer && (
          <div className="bg-white   border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FaUser className="text-primary-600" />
              Your Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Name</p>
                <p className="text-gray-900 font-medium">
                  {appointment.customer.firstName || appointment.customer.name || ''} 
                  {appointment.customer.lastName ? ` ${appointment.customer.lastName}` : ''}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Phone</p>
                <p className="text-gray-900 font-medium">{appointment.customer.phone || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="text-gray-900 font-medium">{appointment.customer.email || 'N/A'}</p>
              </div>
              {appointment.customer.address && (
                <div>
                  <p className="text-sm text-gray-600">Address</p>
                  <p className="text-gray-900 font-medium">
                    {typeof appointment.customer.address === 'object'
                      ? `${appointment.customer.address.street || ''}${appointment.customer.address.city ? ', ' + appointment.customer.address.city : ''}${appointment.customer.address.state ? ', ' + appointment.customer.address.state : ''}${appointment.customer.address.zipCode ? ' - ' + appointment.customer.address.zipCode : ''}`.trim() || appointment.customer.address.street
                      : appointment.customer.address}
                  </p>
                </div>
              )}
              {appointment.customer.dateOfBirth && (
                <div>
                  <p className="text-sm text-gray-600">Date of Birth</p>
                  <p className="text-gray-900 font-medium">
                    {new Date(appointment.customer.dateOfBirth).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              )}
              {appointment.customer.gender && (
                <div>
                  <p className="text-sm text-gray-600">Gender</p>
                  <p className="text-gray-900 font-medium capitalize">{appointment.customer.gender}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Notes */}
        {(appointment.customerNotes || appointment.specialRequests) && (
          <div className="bg-white   border border-gray-200 p-6">
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
          <div className="bg-white   border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Need to Cancel?</h3>
                <p className="text-sm text-gray-600">You can cancel this appointment if your plans have changed.</p>
              </div>
              <button
                onClick={() => setShowCancelModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white  hover:bg-red-700 transition-colors"
              >
                <FaTimesCircle />
                Cancel Appointment
              </button>
            </div>
          </div>
        )}

        {/* Cancellation Info */}
        {appointment.status === 'cancelled' && (
          <div className="bg-red-50  border border-red-200 p-6">
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
        <div className="bg-white   border border-gray-200 p-6">
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 px-6 py-2 border border-gray-300 text-gray-700  hover:bg-gray-50 transition-colors"
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
          <div className="bg-white   p-6 max-w-md w-full">
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
                className="w-full px-3 py-2 border border-gray-300  focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="Please provide a reason for cancellation..."
              />
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleCancelAppointment}
                disabled={cancelling || !cancelReason.trim()}
                className="flex-1 px-4 py-2 bg-red-600 text-white  hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
                className="px-4 py-2 border border-gray-300 text-gray-700  hover:bg-gray-50 transition-colors"
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
