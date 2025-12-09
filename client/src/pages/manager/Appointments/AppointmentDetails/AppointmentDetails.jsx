import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import {
  FaArrowLeft,
  FaCalendarAlt,
  FaUser,
  FaPhoneAlt,
  FaEnvelope,
  FaSpinner,
  FaEdit,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaMapMarkerAlt,
  FaUserTie,
  FaStickyNote,
  FaExclamationCircle,
  FaBuilding,
  FaMoneyBillWave,
  FaCreditCard,
  FaGift,
  FaFileInvoice,
  FaBell
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

  // Prevent duplicate API calls
  const fetchingRef = useRef(false)
  const mountedRef = useRef(false)

  const fetchAppointmentDetails = useCallback(async () => {
    if (!appointmentId || appointmentId === 'undefined' || fetchingRef.current) {
      return
    }

    try {
      fetchingRef.current = true
      setLoading(true)
      const result = await managerService.getAppointmentById(appointmentId)

      if (result.success) {
        const appointmentData = result.data?.data || result.data
        setAppointment(appointmentData)
        setStatusUpdate({
          status: appointmentData.status || '',
          notes: appointmentData.staffNotes || ''
        })
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
      fetchingRef.current = false
    }
  }, [appointmentId, navigate])

  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true
      if (appointmentId && appointmentId !== 'undefined') {
        fetchAppointmentDetails()
      } else {
        toast.error('Invalid appointment ID')
        navigate('/manager/appointments')
      }
    }
  }, [appointmentId, fetchAppointmentDetails, navigate])

  const handleStatusUpdate = useCallback(async () => {
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
  }, [appointmentId, statusUpdate, fetchAppointmentDetails])

  // Memoized helper functions
  const getStatusBadge = useCallback((status) => {
    const badges = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      confirmed: 'bg-blue-100 text-blue-800 border-blue-200',
      in_progress: 'bg-purple-100 text-purple-800 border-purple-200',
      completed: 'bg-green-100 text-green-800 border-green-200',
      cancelled: 'bg-red-100 text-red-800 border-red-200',
      no_show: 'bg-gray-100 text-gray-800 border-gray-200'
    }
    return badges[status] || 'bg-gray-100 text-gray-800 border-gray-200'
  }, [])

  const getStatusIcon = useCallback((status) => {
    switch (status) {
      case 'completed':
        return <FaCheckCircle className="text-green-600" />
      case 'cancelled':
        return <FaTimesCircle className="text-red-600" />
      case 'confirmed':
        return <FaCheckCircle className="text-blue-600" />
      case 'pending':
        return <FaExclamationCircle className="text-yellow-600" />
      case 'in_progress':
        return <FaClock className="text-purple-600" />
      default:
        return <FaClock className="text-gray-600" />
    }
  }, [])

  const getPaymentStatusBadge = useCallback((status) => {
    const badges = {
      pending: 'bg-yellow-100 text-yellow-800',
      partial: 'bg-orange-100 text-orange-800',
      paid: 'bg-green-100 text-green-800',
      refunded: 'bg-purple-100 text-purple-800',
      failed: 'bg-red-100 text-red-800'
    }
    return badges[status] || 'bg-gray-100 text-gray-800'
  }, [])

  const formatDateTime = useCallback((dateString, timeString) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    const formattedDate = date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
    if (timeString) {
      const [hours, minutes] = timeString.split(':')
      const hour = parseInt(hours)
      const ampm = hour >= 12 ? 'PM' : 'AM'
      const hour12 = hour % 12 || 12
      return `${formattedDate} at ${hour12}:${minutes} ${ampm}`
    }
    return formattedDate
  }, [])

  const formatDate = useCallback((dateString) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }, [])

  const formatCurrency = useCallback((amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount || 0)
  }, [])

  const handleCloseModal = useCallback(() => {
    setShowStatusModal(false)
    if (appointment) {
      setStatusUpdate({
        status: appointment.status || '',
        notes: appointment.staffNotes || ''
      })
    }
  }, [appointment])

  const handleNavigateBack = useCallback(() => {
    navigate('/manager/appointments')
  }, [navigate])

  const handleNavigateToCustomer = useCallback(() => {
    if (appointment?.customer?._id) {
      navigate(`/manager/customers/${appointment.customer._id}`)
    }
  }, [navigate, appointment])

  // Memoized computed values
  const statusBannerClass = useMemo(() => {
    if (!appointment) return 'border-blue-500 bg-blue-50'
    if (appointment.status === 'cancelled') return 'border-red-500 bg-red-50'
    if (appointment.status === 'completed') return 'border-green-500 bg-green-50'
    return 'border-blue-500 bg-blue-50'
  }, [appointment?.status])

  const hasNotes = useMemo(() => {
    if (!appointment) return false
    return (appointment.customerNotes && appointment.customerNotes !== 'NA') ||
      appointment.specialRequests ||
      appointment.staffNotes
  }, [appointment])

  const hasLoyaltyPoints = useMemo(() => {
    if (!appointment) return false
    return appointment.loyaltyPointsEarned > 0 || appointment.loyaltyPointsRedeemed > 0
  }, [appointment])

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
          onClick={handleNavigateBack}
          className="mt-4 text-primary-600 hover:underline"
        >
          Go back to Appointments
        </button>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between bg-white p-4 border border-gray-200 shadow-sm">
        <div className="flex items-center gap-4">
          <button
            onClick={handleNavigateBack}
            className="p-2 hover:bg-gray-100 transition-colors"
            title="Back to appointments"
          >
            <FaArrowLeft className="text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <FaCalendarAlt className="text-primary-600" />
              Appointment Details
            </h1>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-sm text-gray-500">
                Booking: <span className="font-mono font-semibold text-gray-700">{appointment.formattedBookingNumber || appointment.bookingNumber}</span>
              </span>
              <span className="text-gray-300">•</span>
              <span className="text-sm text-gray-500">
                {appointment.appointmentDay}
              </span>
            </div>
          </div>
        </div>
        <button
          onClick={() => setShowStatusModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white hover:bg-primary-700 transition-colors shadow-sm"
        >
          <FaEdit />
          Update Status
        </button>
      </div>

      {/* Status Banner */}
      <div className={`p-4 border-l-4 ${statusBannerClass}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {getStatusIcon(appointment.status)}
            <div>
              <p className="font-semibold text-gray-900 capitalize">
                {appointment.status?.replace('_', ' ')} Appointment
              </p>
              <p className="text-sm text-gray-600">
                {formatDateTime(appointment.appointmentDate, appointment.startTime)}
              </p>
            </div>
          </div>
          <span className={`px-4 py-2 border font-medium capitalize ${getStatusBadge(appointment.status)}`}>
            {appointment.status?.replace('_', ' ')}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left Column - Main Details */}
        <div className="lg:col-span-2 space-y-4">
          {/* Business Information */}
          {appointment.business && (
            <div className="bg-white border border-gray-200 shadow-sm">
              <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <FaBuilding className="text-primary-600" />
                  Business Information
                </h2>
              </div>
              <div className="p-4 grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Business Name</label>
                  <p className="text-gray-900 font-medium">{appointment.business.name}</p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Branch</label>
                  <p className="text-gray-900">{appointment.business.branch}</p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Type</label>
                  <p className="text-gray-900 capitalize">{appointment.business.type}</p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Phone</label>
                  <p className="text-gray-900">{appointment.business.phone}</p>
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-gray-500 mb-1">Email</label>
                  <p className="text-gray-900">{appointment.business.email}</p>
                </div>
              </div>
            </div>
          )}

          {/* Customer Information */}
          <div className="bg-white border border-gray-200 shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <FaUser className="text-primary-600" />
                Customer Information
              </h2>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Full Name</label>
                  <p className="text-gray-900 font-medium">
                    {appointment.customer
                      ? `${appointment.customer.firstName || ''} ${appointment.customer.lastName || ''}`.trim() || appointment.customer.fullName
                      : 'N/A'}
                  </p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Phone</label>
                  <p className="text-gray-900 flex items-center gap-2">
                    <FaPhoneAlt className="text-gray-400 text-sm" />
                    {appointment.customer?.phone || 'N/A'}
                  </p>
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-gray-500 mb-1">Email</label>
                  <p className="text-gray-900 flex items-center gap-2">
                    <FaEnvelope className="text-gray-400 text-sm" />
                    {appointment.customer?.email || 'N/A'}
                  </p>
                </div>
                {appointment.customer?.address?.country && (
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-gray-500 mb-1">Country</label>
                    <p className="text-gray-900 flex items-center gap-2">
                      <FaMapMarkerAlt className="text-gray-400 text-sm" />
                      {appointment.customer.address.country}
                    </p>
                  </div>
                )}
              </div>
              {appointment.customer?._id && (
                <button
                  onClick={handleNavigateToCustomer}
                  className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                >
                  View Customer Profile →
                </button>
              )}
            </div>
          </div>

          {/* Service Information */}
          {appointment.service && (
            <div className="bg-white border border-gray-200 shadow-sm">
              <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  Service Details
                </h2>
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">{appointment.service.name}</h3>
                    <p className="text-sm text-gray-500 mt-1">Category: {appointment.service.category}</p>
                  </div>
                  <span className="px-3 py-1 bg-primary-100 text-primary-800 font-semibold">
                    {formatCurrency(appointment.servicePrice)}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-3 pt-3 border-t border-gray-200">
                  <div className="text-center p-2 bg-gray-50">
                    <FaClock className="text-green-600 text-xl mx-auto mb-2" />
                    <p className="text-xs text-gray-500">Duration</p>
                    <p className="font-semibold text-green-600">{appointment.service.duration} min</p>
                  </div>
                  <div className="text-center p-2 bg-gray-50">
                    <FaClock className="text-blue-600 text-xl mx-auto mb-2" />
                    <p className="text-xs text-gray-500">Start Time</p>
                    <p className="font-semibold text-blue-600">{appointment.startTime}</p>
                  </div>
                  <div className="text-center p-2 bg-gray-50">
                    <FaClock className="text-purple-600 text-xl mx-auto mb-2" />
                    <p className="text-xs text-gray-500">End Time</p>
                    <p className="font-semibold text-purple-600">{appointment.endTime}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Staff Information */}
          {appointment.staff && (
            <div className="bg-white border border-gray-200 shadow-sm">
              <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <FaUserTie className="text-primary-600" />
                  Assigned Staff
                </h2>
              </div>
              <div className="p-4 grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Staff Name</label>
                  <p className="text-gray-900 font-medium">{appointment.staff.name}</p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Role</label>
                  <p className="text-gray-900 capitalize">{appointment.staff.role}</p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Phone</label>
                  <p className="text-gray-900">{appointment.staff.phone}</p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Email</label>
                  <p className="text-gray-900">{appointment.staff.email}</p>
                </div>
              </div>
            </div>
          )}

          {/* Notes Section */}
          {hasNotes && (
            <div className="bg-white border border-gray-200 shadow-sm">
              <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <FaStickyNote className="text-primary-600" />
                  Notes & Comments
                </h2>
              </div>
              <div className="p-4 space-y-3">
                {appointment.customerNotes && appointment.customerNotes !== 'NA' && (
                  <div className="p-3 bg-blue-50 border-l-4 border-blue-500">
                    <p className="text-xs font-semibold text-blue-700 mb-1">Customer Notes</p>
                    <p className="text-gray-900">{appointment.customerNotes}</p>
                  </div>
                )}
                {appointment.specialRequests && (
                  <div className="p-4 bg-purple-50 border-l-4 border-purple-500">
                    <p className="text-xs font-semibold text-purple-700 mb-1">Special Requests</p>
                    <p className="text-gray-900">{appointment.specialRequests}</p>
                  </div>
                )}
                {appointment.staffNotes && (
                  <div className="p-4 bg-green-50 border-l-4 border-green-500">
                    <p className="text-xs font-semibold text-green-700 mb-1">Staff Notes</p>
                    <p className="text-gray-900">{appointment.staffNotes}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-4">
          {/* Payment Summary */}
          <div className="bg-white border border-gray-200 shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <FaMoneyBillWave className="text-primary-600" />
                Payment Summary
              </h2>
            </div>
            <div className="p-4 space-y-2">
              <div className="flex items-center justify-between pb-2 border-b border-gray-200">
                <span className="text-sm text-gray-600">Service Price</span>
                <span className="font-semibold text-gray-900">{formatCurrency(appointment.servicePrice)}</span>
              </div>
              {appointment.additionalCharges > 0 && (
                <div className="flex items-center justify-between pb-2 border-b border-gray-200">
                  <span className="text-sm text-gray-600">Additional Charges</span>
                  <span className="font-semibold text-gray-900">{formatCurrency(appointment.additionalCharges)}</span>
                </div>
              )}
              {appointment.discount > 0 && (
                <div className="flex items-center justify-between pb-2 border-b border-gray-200">
                  <span className="text-sm text-green-600">Discount</span>
                  <span className="font-semibold text-green-600">-{formatCurrency(appointment.discount)}</span>
                </div>
              )}
              {appointment.tax > 0 && (
                <div className="flex items-center justify-between pb-2 border-b border-gray-200">
                  <span className="text-sm text-gray-600">Tax</span>
                  <span className="font-semibold text-gray-900">{formatCurrency(appointment.tax)}</span>
                </div>
              )}
              <div className="flex items-center justify-between pt-2 border-t-2 border-gray-300">
                <span className="font-semibold text-gray-900">Total Amount</span>
                <span className="text-xl font-bold text-primary-600">{formatCurrency(appointment.totalAmount)}</span>
              </div>
              {appointment.advanceAmount > 0 && (
                <div className="flex items-center justify-between pt-2">
                  <span className="text-sm text-gray-600">Advance Paid</span>
                  <span className="font-semibold text-blue-600">{formatCurrency(appointment.advanceAmount)}</span>
                </div>
              )}
              {appointment.paidAmount > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Paid Amount</span>
                  <span className="font-semibold text-green-600">{formatCurrency(appointment.paidAmount)}</span>
                </div>
              )}
              {appointment.remainingAmount > 0 && (
                <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                  <span className="font-medium text-gray-900">Remaining</span>
                  <span className="font-bold text-red-600">{formatCurrency(appointment.remainingAmount)}</span>
                </div>
              )}
              <div className="pt-2 border-t border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-gray-500">Payment Status</span>
                  <span className={`px-2 py-1 text-xs font-semibold capitalize ${getPaymentStatusBadge(appointment.paymentStatus)}`}>
                    {appointment.paymentStatus}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <FaCreditCard className="text-gray-400" />
                  <span className="text-sm text-gray-600 capitalize">{appointment.paymentMethod}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Loyalty & Rewards */}
          {hasLoyaltyPoints && (
            <div className="bg-white border border-gray-200 shadow-sm">
              <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <FaGift className="text-primary-600" />
                  Loyalty Points
                </h2>
              </div>
              <div className="p-4 space-y-2">
                {appointment.loyaltyPointsEarned > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Points Earned</span>
                    <span className="font-semibold text-green-600">+{appointment.loyaltyPointsEarned}</span>
                  </div>
                )}
                {appointment.loyaltyPointsRedeemed > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Points Redeemed</span>
                    <span className="font-semibold text-red-600">-{appointment.loyaltyPointsRedeemed}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Booking Information */}
          <div className="bg-white border border-gray-200 shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <FaFileInvoice className="text-primary-600" />
                Booking Information
              </h2>
            </div>
            <div className="p-4 space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Source</span>
                <span className="font-medium text-gray-900 capitalize">{appointment.bookingSource}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Type</span>
                <span className="font-medium text-gray-900 capitalize">{appointment.bookingType}</span>
              </div>
              {appointment.cancellationFee > 0 && (
                <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                  <span className="text-gray-600">Cancellation Fee</span>
                  <span className="font-semibold text-red-600">{formatCurrency(appointment.cancellationFee)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Notifications & Follow-up */}
          <div className="bg-white border border-gray-200 shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <FaBell className="text-primary-600" />
                Notifications & Follow-up
              </h2>
            </div>
            <div className="p-4 space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Confirmation Sent</span>
                <span className={`font-medium ${appointment.confirmationSent ? 'text-green-600' : 'text-gray-400'}`}>
                  {appointment.confirmationSent ? '✓ Yes' : '✗ No'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Reminder Sent</span>
                <span className={`font-medium ${appointment.reminderSent ? 'text-green-600' : 'text-gray-400'}`}>
                  {appointment.reminderSent ? '✓ Yes' : '✗ No'}
                </span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                <span className="text-gray-600">Follow-up Required</span>
                <span className={`font-medium ${appointment.followUpRequired ? 'text-orange-600' : 'text-gray-400'}`}>
                  {appointment.followUpRequired ? '⚠ Yes' : '✗ No'}
                </span>
              </div>
              {appointment.followUpRequired && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Follow-up Completed</span>
                  <span className={`font-medium ${appointment.followUpCompleted ? 'text-green-600' : 'text-red-600'}`}>
                    {appointment.followUpCompleted ? '✓ Done' : '✗ Pending'}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-white border border-gray-200 shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <FaClock className="text-primary-600" />
                Timeline
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <p className="text-xs font-semibold text-gray-500 mb-1">Created</p>
                <p className="text-sm text-gray-900">{formatDate(appointment.createdAt)}</p>
                {appointment.createdBy && (
                  <p className="text-xs text-gray-500 mt-1">
                    by {appointment.createdBy.firstName} {appointment.createdBy.lastName} ({appointment.createdByModel})
                  </p>
                )}
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 mb-1">Last Updated</p>
                <p className="text-sm text-gray-900">{formatDate(appointment.updatedAt)}</p>
                {appointment.updatedBy && (
                  <p className="text-xs text-gray-500 mt-1">
                    by {appointment.updatedByModel}
                  </p>
                )}
              </div>
              {appointment.confirmedAt && (
                <div className="pt-2 border-t border-gray-200">
                  <p className="text-xs font-semibold text-blue-600 mb-1">Confirmed</p>
                  <p className="text-sm text-gray-900">{formatDate(appointment.confirmedAt)}</p>
                </div>
              )}
              {appointment.completedAt && (
                <div className="pt-2 border-t border-gray-200">
                  <p className="text-xs font-semibold text-green-600 mb-1">Completed</p>
                  <p className="text-sm text-gray-900">{formatDate(appointment.completedAt)}</p>
                </div>
              )}
              {appointment.cancelledAt && (
                <div className="pt-2 border-t border-gray-200">
                  <p className="text-xs font-semibold text-red-600 mb-1">Cancelled</p>
                  <p className="text-sm text-gray-900">{formatDate(appointment.cancelledAt)}</p>
                  {appointment.cancelledBy && (
                    <p className="text-xs text-gray-500 mt-1">
                      by {appointment.cancelledBy.name} ({appointment.cancelledByModel})
                    </p>
                  )}
                  {appointment.cancellationReason && (
                    <p className="text-xs text-red-600 mt-2 italic">Reason: {appointment.cancellationReason}</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Status Update Modal */}
      {showStatusModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white shadow-lg max-w-md w-full">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Update Appointment Status</h2>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={statusUpdate.status}
                  onChange={(e) => setStatusUpdate(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
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
                  className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Add notes about this status update..."
                />
              </div>
            </div>

            <div className="px-6 py-4 bg-gray-50 flex items-center gap-3">
              <button
                onClick={handleStatusUpdate}
                disabled={updating || !statusUpdate.status}
                className="flex-1 px-4 py-2 bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
                onClick={handleCloseModal}
                className="px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors"
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
