import React, { useState, useMemo, useCallback, memo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  FaCalendarAlt,
  FaCheckCircle,
  FaTimesCircle,
  FaSpinner,
  FaClock,
  FaUser,
  FaPhoneAlt,
  FaEnvelope,
  FaMapMarkerAlt,
  FaUserTie,
  FaPrint,
  FaArrowLeft,
  FaExclamationTriangle
} from 'react-icons/fa'
import apiClient from '../../../services/api/client'
import { endpoints } from '../../../constants/api/endpoints'
import { usePageTitle } from '../../../hooks/usePageTitle'

// Helper functions outside component for better performance
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
  const iconClass = "text-3xl"
  switch (status) {
    case 'completed':
      return <FaCheckCircle className={`${iconClass} text-green-600`} />
    case 'cancelled':
      return <FaTimesCircle className={`${iconClass} text-red-600`} />
    case 'confirmed':
      return <FaCheckCircle className={`${iconClass} text-blue-600`} />
    case 'pending':
      return <FaClock className={`${iconClass} text-yellow-600`} />
    default:
      return <FaClock className={`${iconClass} text-gray-600`} />
  }
}

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR'
  }).format(amount || 0)
}

const formatAddress = (address) => {
  if (!address) return ''
  if (typeof address === 'string') return address
  const parts = [
    address.street,
    address.city,
    address.state,
    address.zipCode
  ].filter(Boolean)
  return parts.join(', ')
}

const AppointmentStatus = () => {
  const navigate = useNavigate()
  const { confirmationCode } = useParams()
  const queryClient = useQueryClient()
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [cancelReason, setCancelReason] = useState('')

  usePageTitle()

  // Fetch appointment using React Query
  const {
    data: appointment,
    isLoading: loading,
    error
  } = useQuery({
    queryKey: ['appointment', confirmationCode],
    queryFn: async () => {
      if (!confirmationCode) throw new Error('Invalid confirmation code')
      const response = await apiClient.get(endpoints.appointments.appointmentByCode(confirmationCode))
      if (!response.data.success) {
        throw new Error(response.data.message || 'Appointment not found')
      }
      return response.data.data
    },
    enabled: !!confirmationCode,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1
  })

  // Cancel appointment mutation
  const cancelMutation = useMutation({
    mutationFn: async (reason) => {
      const response = await apiClient.post(
        endpoints.appointments.cancelAppointment(confirmationCode),
        { reason }
      )
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to cancel appointment')
      }
      return response.data
    },
    onSuccess: () => {
      toast.success('Appointment cancelled successfully')
      setShowCancelModal(false)
      setCancelReason('')
      queryClient.invalidateQueries({ queryKey: ['appointment', confirmationCode] })
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to cancel appointment')
    }
  })

  // Memoized computed values
  const formattedDate = useMemo(() => {
    if (!appointment?.appointmentDate) return 'N/A'
    return new Date(appointment.appointmentDate).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }, [appointment?.appointmentDate])

  const totalAmount = useMemo(() => {
    return appointment?.finalPrice || appointment?.totalAmount || appointment?.servicePrice || 0
  }, [appointment?.finalPrice, appointment?.totalAmount, appointment?.servicePrice])

  const customerName = useMemo(() => {
    if (!appointment?.customer) return ''
    const firstName = appointment.customer.firstName || appointment.customer.name || ''
    const lastName = appointment.customer.lastName || ''
    return `${firstName}${lastName ? ' ' + lastName : ''}`.trim()
  }, [appointment?.customer])

  // Handlers
  const handleCancelAppointment = useCallback(() => {
    if (!cancelReason.trim()) {
      toast.error('Please provide a cancellation reason')
      return
    }
    cancelMutation.mutate(cancelReason)
  }, [cancelReason, cancelMutation])

  const handlePrint = useCallback(() => {
    window.print()
  }, [])

  const handleCloseModal = useCallback(() => {
    setShowCancelModal(false)
    setCancelReason('')
  }, [])

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <FaSpinner className="animate-spin mx-auto text-primary-600 text-3xl mb-3" />
          <p className="text-gray-600 text-sm">Loading appointment details...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error || !appointment) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white border border-gray-200 p-6 text-center max-w-md">
          <FaTimesCircle className="mx-auto text-red-500 text-3xl mb-3" />
          <h2 className="text-lg font-bold text-gray-900 mb-2">Appointment Not Found</h2>
          <p className="text-gray-600 text-sm mb-4">The appointment with this confirmation code could not be found.</p>
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-primary-600 text-white hover:bg-primary-700 text-sm"
          >
            Go Home
          </button>
        </div>
      </div>
    )
  }

  const statusText = appointment.status?.replace('_', ' ') || 'Pending'

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto space-y-4">
        {/* Header */}
        <div className="bg-white border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <FaCalendarAlt className="text-primary-600 text-base" />
                Appointment Status
              </h1>
              <p className="text-gray-600 text-xs mt-1">
                Code: <span className="font-mono font-semibold">{confirmationCode}</span>
              </p>
            </div>
            <button
              onClick={handlePrint}
              className="flex items-center gap-1 px-3 py-1.5 border border-gray-300 text-gray-700 hover:bg-gray-50 text-xs"
            >
              <FaPrint className="text-xs" />
              Print
            </button>
          </div>
        </div>

        {/* Status Card */}
        <div className="bg-white border border-gray-200 p-6 text-center">
          <div className="flex justify-center mb-3">
            {getStatusIcon(appointment.status)}
          </div>
          <h2 className="text-lg font-bold text-gray-900 mb-2">Appointment {statusText.toUpperCase()}</h2>
          <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium border ${getStatusBadge(appointment.status)}`}>
            {statusText}
          </span>
        </div>

        {/* Appointment Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Date & Time */}
          <div className="bg-white border border-gray-200 p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <FaClock className="text-primary-600 text-xs" />
              Date & Time
            </h3>
            <div className="space-y-1.5 text-xs">
              <p className="text-gray-900 font-medium">{formattedDate}</p>
              <div className="flex items-center gap-3 text-gray-600">
                {appointment.startTime && (
                  <div className="flex items-center gap-1">
                    <FaClock className="text-primary-500 text-xs" />
                    <span className="font-medium">Start: {appointment.startTime}</span>
                  </div>
                )}
                {appointment.endTime && (
                  <span className="font-medium">End: {appointment.endTime}</span>
                )}
              </div>
              {appointment.duration && (
                <p className="text-gray-600">Duration: {appointment.duration} minutes</p>
              )}
            </div>
          </div>

          {/* Business Information */}
          {appointment.business && (
            <div className="bg-white border border-gray-200 p-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <FaMapMarkerAlt className="text-primary-600 text-xs" />
                Business
              </h3>
              <div className="space-y-1.5 text-xs">
                <p className="text-gray-900 font-medium">{appointment.business.name}</p>
                {appointment.business.branch && (
                  <p className="text-gray-600">{appointment.business.branch}</p>
                )}
                {appointment.business.address && (
                  <p className="text-gray-600">{formatAddress(appointment.business.address)}</p>
                )}
                {appointment.business.phone && (
                  <p className="text-gray-600 flex items-center gap-1.5">
                    <FaPhoneAlt className="text-gray-400 text-xs" />
                    {appointment.business.phone}
                  </p>
                )}
                {appointment.business.email && (
                  <p className="text-gray-600 flex items-center gap-1.5">
                    <FaEnvelope className="text-gray-400 text-xs" />
                    {appointment.business.email}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Services */}
          <div className="bg-white border border-gray-200 p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              {appointment.services && appointment.services.length > 1 ? 'Services' : 'Service'}
            </h3>
            <div className="space-y-2 text-xs">
              {appointment.services && Array.isArray(appointment.services) && appointment.services.length > 0 ? (
                appointment.services.map((service, index) => (
                  <div key={index} className="p-2 bg-gray-50">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-gray-900 font-medium">
                        {service.name || service.serviceName || `Service ${index + 1}`}
                      </span>
                      {service.price !== undefined && (
                        <span className="text-gray-700 font-semibold">
                          {formatCurrency(service.price)}
                        </span>
                      )}
                    </div>
                    {service.optionLabel && (
                      <p className="text-gray-600 text-xs">{service.optionLabel}</p>
                    )}
                    {service.duration && (
                      <p className="text-gray-600">Duration: {service.duration} minutes</p>
                    )}
                    {service.category && (
                      <p className="text-gray-600">Category: {service.category}</p>
                    )}
                    {service.description && (
                      <p className="text-gray-600 mt-1">{service.description}</p>
                    )}
                  </div>
                ))
              ) : appointment.service ? (
                <div className="p-2 bg-gray-50">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-gray-900 font-medium">
                      {appointment.service.name || appointment.service.serviceName || 'Service'}
                    </span>
                    {appointment.service.price !== undefined && (
                      <span className="text-gray-700 font-semibold">
                        {formatCurrency(appointment.service.price)}
                      </span>
                    )}
                  </div>
                  {appointment.service.optionLabel && (
                    <p className="text-gray-600 text-xs">{appointment.service.optionLabel}</p>
                  )}
                  {appointment.service.duration && (
                    <p className="text-gray-600">Duration: {appointment.service.duration} minutes</p>
                  )}
                  {appointment.service.category && (
                    <p className="text-gray-600">Category: {appointment.service.category}</p>
                  )}
                  {appointment.service.description && (
                    <p className="text-gray-600 mt-1">{appointment.service.description}</p>
                  )}
                </div>
              ) : appointment.serviceName ? (
                <div className="p-2 bg-gray-50">
                  <span className="text-gray-900">{appointment.serviceName}</span>
                </div>
              ) : (
                <p className="text-gray-500">No service information available</p>
              )}
            </div>
          </div>

          {/* Pricing */}
          <div className="bg-white border border-gray-200 p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Pricing</h3>
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Total Amount</span>
                <span className="text-base font-bold text-green-600">
                  {formatCurrency(totalAmount)}
                </span>
              </div>
              {appointment.servicePrice && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Service Price</span>
                  <span className="text-gray-900">{formatCurrency(appointment.servicePrice)}</span>
                </div>
              )}
              {appointment.additionalCharges > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Additional Charges</span>
                  <span className="text-gray-900">+{formatCurrency(appointment.additionalCharges)}</span>
                </div>
              )}
              {appointment.discount > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Discount</span>
                  <span className="text-green-600">-{formatCurrency(appointment.discount)}</span>
                </div>
              )}
              {appointment.tax > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Tax</span>
                  <span className="text-gray-900">+{formatCurrency(appointment.tax)}</span>
                </div>
              )}
              {appointment.paymentStatus && (
                <div className="pt-2 mt-2 border-t border-gray-200">
                  <div className="flex items-center justify-between">
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
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-gray-600">Payment Method</span>
                      <span className="text-gray-900 capitalize">{appointment.paymentMethod}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Staff Information */}
        {appointment.staff && (
          <div className="bg-white border border-gray-200 p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <FaUserTie className="text-primary-600 text-xs" />
              Assigned Staff
            </h3>
            <div className="flex items-start gap-2">
              <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                <FaUser className="text-primary-600 text-xs" />
              </div>
              <div className="flex-1 text-xs">
                <p className="text-gray-900 font-medium">{appointment.staff.name}</p>
                {appointment.staff.role && (
                  <p className="text-gray-600 mt-0.5">{appointment.staff.role}</p>
                )}
                {appointment.staff.phone && (
                  <p className="text-gray-600 flex items-center gap-1.5 mt-1">
                    <FaPhoneAlt className="text-gray-400 text-xs" />
                    {appointment.staff.phone}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Customer Information */}
        {appointment.customer && (
          <div className="bg-white border border-gray-200 p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <FaUser className="text-primary-600 text-xs" />
              Your Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div>
                <p className="text-gray-600">Name</p>
                <p className="text-gray-900 font-medium">{customerName || 'N/A'}</p>
              </div>
              <div>
                <p className="text-gray-600">Phone</p>
                <p className="text-gray-900 font-medium">{appointment.customer.phone || 'N/A'}</p>
              </div>
              <div>
                <p className="text-gray-600">Email</p>
                <p className="text-gray-900 font-medium">{appointment.customer.email || 'N/A'}</p>
              </div>
              {appointment.customer.address && (
                <div>
                  <p className="text-gray-600">Address</p>
                  <p className="text-gray-900 font-medium">{formatAddress(appointment.customer.address)}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Notes */}
        {(appointment.customerNotes || appointment.specialRequests) && (
          <div className="bg-white border border-gray-200 p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Notes</h3>
            <div className="space-y-2 text-xs">
              {appointment.customerNotes && (
                <div>
                  <p className="text-gray-700 font-medium">Your Notes</p>
                  <p className="text-gray-900">{appointment.customerNotes}</p>
                </div>
              )}
              {appointment.specialRequests && (
                <div>
                  <p className="text-gray-700 font-medium">Special Requests</p>
                  <p className="text-gray-900">{appointment.specialRequests}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Cancellation Section */}
        {appointment.status !== 'cancelled' && appointment.status !== 'completed' && (
          <div className="bg-white border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-1">Need to Cancel?</h3>
                <p className="text-xs text-gray-600">You can cancel this appointment if your plans have changed.</p>
              </div>
              <button
                onClick={() => setShowCancelModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 text-white hover:bg-red-700 text-xs"
              >
                <FaTimesCircle className="text-xs" />
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Cancellation Info */}
        {appointment.status === 'cancelled' && (
          <div className="bg-red-50 border border-red-200 p-4">
            <div className="flex items-start gap-2">
              <FaTimesCircle className="text-red-600 text-lg mt-0.5" />
              <div className="text-xs">
                <h3 className="text-sm font-semibold text-red-900 mb-1">Appointment Cancelled</h3>
                {appointment.cancelledAt && (
                  <p className="text-red-700">
                    Cancelled on {new Date(appointment.cancelledAt).toLocaleString('en-US')}
                  </p>
                )}
                {appointment.cancellationReason && (
                  <p className="text-red-700 mt-1">
                    <strong>Reason:</strong> {appointment.cancellationReason}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="bg-white border border-gray-200 p-4">
          <div className="flex items-center justify-center">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-1.5 px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 text-xs"
            >
              <FaArrowLeft className="text-xs" />
              Back to Home
            </button>
          </div>
        </div>
      </div>

      {/* Cancel Appointment Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-5 max-w-md w-full">
            <div className="flex items-center gap-2 mb-3">
              <FaExclamationTriangle className="text-red-600 text-lg" />
              <h2 className="text-base font-semibold text-gray-900">Cancel Appointment</h2>
            </div>

            <p className="text-gray-600 text-xs mb-3">
              Are you sure you want to cancel this appointment? This action cannot be undone.
            </p>

            <div className="mb-3">
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                Reason for Cancellation
              </label>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                rows={3}
                className="w-full px-2 py-1.5 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-red-500 text-xs"
                placeholder="Please provide a reason for cancellation..."
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCancelAppointment}
                disabled={cancelMutation.isPending || !cancelReason.trim()}
                className="flex-1 px-3 py-1.5 bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-xs"
              >
                {cancelMutation.isPending ? (
                  <>
                    <FaSpinner className="animate-spin inline mr-1" />
                    Cancelling...
                  </>
                ) : (
                  'Cancel Appointment'
                )}
              </button>
              <button
                onClick={handleCloseModal}
                className="px-3 py-1.5 border border-gray-300 text-gray-700 hover:bg-gray-50 text-xs"
              >
                Keep
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default memo(AppointmentStatus)
