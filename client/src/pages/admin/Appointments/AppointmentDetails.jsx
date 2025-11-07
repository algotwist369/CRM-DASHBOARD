import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { HiOutlineArrowLeft, HiOutlineCheck, HiOutlineX, HiOutlineClock, HiOutlineCalendar } from 'react-icons/hi';
import adminService from '../../../services/admin/adminService';
import { toast } from 'react-hot-toast';

const AppointmentDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState('');

  useEffect(() => {
    const fetchAppointment = async () => {
      try {
        setLoading(true);
        const response = await adminService.getAppointment(id);
        if (response.success) {
          setAppointment(response.data);
        } else {
          toast.error(response.error || 'Failed to fetch appointment');
          navigate('/admin/appointments');
        }
      } catch (error) {
        console.error('Failed to fetch appointment:', error);
        toast.error('Failed to fetch appointment');
        navigate('/admin/appointments');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchAppointment();
    }
  }, [id, navigate]);

  const handleAction = async (action, data = {}) => {
    if (!window.confirm(`Are you sure you want to ${action} this appointment?`)) return;
    
    try {
      setActionLoading(action);
      let response;
      
      switch (action) {
        case 'confirm':
          response = await adminService.confirmAppointment(id);
          break;
        case 'start':
          response = await adminService.startAppointment(id);
          break;
        case 'complete':
          response = await adminService.completeAppointment(id, data);
          break;
        case 'cancel':
          response = await adminService.cancelAppointment(id, data);
          break;
        case 'no-show':
          response = await adminService.markNoShow(id);
          break;
        default:
          return;
      }

      if (response.success) {
        toast.success(`Appointment ${action}ed successfully`);
        // Refresh appointment data
        const refreshResponse = await adminService.getAppointment(id);
        if (refreshResponse.success) {
          setAppointment(refreshResponse.data);
        }
      } else {
        toast.error(response.error || `Failed to ${action} appointment`);
      }
    } catch (error) {
      toast.error(`Failed to ${action} appointment`);
    } finally {
      setActionLoading('');
    }
  };

  if (loading) return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div></div>;
  if (!appointment) return <div className="text-center py-12">Appointment not found</div>;

  const customerName = appointment.customer
    ? `${appointment.customer.firstName || ''} ${appointment.customer.lastName || ''}`.trim() || 'N/A'
    : 'N/A';
  const customerPhone = appointment.customer?.phone || 'N/A';
  const customerEmail = appointment.customer?.email || 'N/A';
  const serviceName = appointment.service?.name || 'N/A';
  const servicePrice = appointment.servicePrice || 0;
  const totalAmount = appointment.totalAmount || servicePrice;
  const appointmentDate = appointment.appointmentDate ? new Date(appointment.appointmentDate) : null;
  const status = appointment.status || 'pending';
  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-blue-100 text-blue-800',
    'in-progress': 'bg-purple-100 text-purple-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
    'no-show': 'bg-gray-100 text-gray-800'
  };

  const canConfirm = status === 'pending';
  const canStart = status === 'confirmed';
  const canComplete = status === 'in-progress';
  const canCancel = ['pending', 'confirmed'].includes(status);
  const canMarkNoShow = ['pending', 'confirmed'].includes(status);

  return (
    <div className="space-y-6">
      <div>
        <button onClick={() => navigate('/admin/appointments')} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-2">
          <HiOutlineArrowLeft className="w-5 h-5" />Back
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Appointment Details</h1>
        <p className="text-gray-600 mt-1">Booking Number: {appointment.bookingNumber || appointment._id}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Appointment Information */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Appointment Information</h3>
          <dl className="space-y-3">
            <div>
              <dt className="text-sm text-gray-600">Customer</dt>
              <dd className="text-sm font-medium text-gray-900 mt-1">{customerName}</dd>
            </div>
            <div>
              <dt className="text-sm text-gray-600">Phone</dt>
              <dd className="text-sm font-medium text-gray-900 mt-1">{customerPhone}</dd>
            </div>
            {customerEmail && (
              <div>
                <dt className="text-sm text-gray-600">Email</dt>
                <dd className="text-sm font-medium text-gray-900 mt-1">{customerEmail}</dd>
              </div>
            )}
            <div>
              <dt className="text-sm text-gray-600">Service</dt>
              <dd className="text-sm font-medium text-gray-900 mt-1">{serviceName}</dd>
            </div>
            <div>
              <dt className="text-sm text-gray-600">Date</dt>
              <dd className="text-sm font-medium text-gray-900 mt-1 flex items-center gap-2">
                <HiOutlineCalendar className="w-4 h-4" />
                {appointmentDate ? appointmentDate.toLocaleDateString() : 'N/A'}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-gray-600">Time</dt>
              <dd className="text-sm font-medium text-gray-900 mt-1 flex items-center gap-2">
                <HiOutlineClock className="w-4 h-4" />
                {appointment.startTime || 'N/A'} - {appointment.endTime || 'N/A'}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-gray-600">Duration</dt>
              <dd className="text-sm font-medium text-gray-900 mt-1">{appointment.duration || appointment.service?.duration || 0} minutes</dd>
            </div>
            <div>
              <dt className="text-sm text-gray-600">Status</dt>
              <dd className="mt-1">
                <span className={`px-2 py-1 text-xs rounded-full ${statusColors[status] || 'bg-gray-100 text-gray-800'}`}>
                  {status}
                </span>
              </dd>
            </div>
            <div>
              <dt className="text-sm text-gray-600">Service Price</dt>
              <dd className="text-sm font-medium text-gray-900 mt-1">₹{servicePrice.toLocaleString()}</dd>
            </div>
            <div>
              <dt className="text-sm text-gray-600">Tax</dt>
              <dd className="text-sm font-medium text-gray-900 mt-1">₹{(appointment.tax || 0).toLocaleString()}</dd>
            </div>
            <div>
              <dt className="text-sm text-gray-600">Total Amount</dt>
              <dd className="text-sm font-bold text-gray-900 mt-1">₹{totalAmount.toLocaleString()}</dd>
            </div>
            {appointment.customerNotes && (
              <div>
                <dt className="text-sm text-gray-600">Customer Notes</dt>
                <dd className="text-sm font-medium text-gray-900 mt-1">{appointment.customerNotes}</dd>
              </div>
            )}
            {appointment.specialRequests && (
              <div>
                <dt className="text-sm text-gray-600">Special Requests</dt>
                <dd className="text-sm font-medium text-gray-900 mt-1">{appointment.specialRequests}</dd>
              </div>
            )}
          </dl>
        </div>

        {/* Actions */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions</h3>
          <div className="space-y-3">
            {canConfirm && (
              <button
                onClick={() => handleAction('confirm')}
                disabled={actionLoading === 'confirm'}
                className="w-full px-4 py-2 border border-green-300 rounded-lg text-green-600 hover:bg-green-50 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <HiOutlineCheck className="w-5 h-5" />
                {actionLoading === 'confirm' ? 'Confirming...' : 'Confirm Appointment'}
              </button>
            )}
            {canStart && (
              <button
                onClick={() => handleAction('start')}
                disabled={actionLoading === 'start'}
                className="w-full px-4 py-2 border border-purple-300 rounded-lg text-purple-600 hover:bg-purple-50 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <HiOutlineClock className="w-5 h-5" />
                {actionLoading === 'start' ? 'Starting...' : 'Start Appointment'}
              </button>
            )}
            {canComplete && (
              <button
                onClick={() => handleAction('complete')}
                disabled={actionLoading === 'complete'}
                className="w-full px-4 py-2 border border-green-300 rounded-lg text-green-600 hover:bg-green-50 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <HiOutlineCheck className="w-5 h-5" />
                {actionLoading === 'complete' ? 'Completing...' : 'Complete Appointment'}
              </button>
            )}
            {canCancel && (
              <button
                onClick={() => {
                  const reason = window.prompt('Cancellation reason:');
                  if (reason) {
                    handleAction('cancel', { reason });
                  }
                }}
                disabled={actionLoading === 'cancel'}
                className="w-full px-4 py-2 border border-red-300 rounded-lg text-red-600 hover:bg-red-50 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <HiOutlineX className="w-5 h-5" />
                {actionLoading === 'cancel' ? 'Cancelling...' : 'Cancel Appointment'}
              </button>
            )}
            {canMarkNoShow && (
              <button
                onClick={() => handleAction('no-show')}
                disabled={actionLoading === 'no-show'}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <HiOutlineX className="w-5 h-5" />
                {actionLoading === 'no-show' ? 'Marking...' : 'Mark as No-Show'}
              </button>
            )}
            {status === 'completed' && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-800">This appointment has been completed.</p>
                {appointment.completedAt && (
                  <p className="text-xs text-green-600 mt-1">
                    Completed at: {new Date(appointment.completedAt).toLocaleString()}
                  </p>
                )}
              </div>
            )}
            {status === 'cancelled' && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-800">This appointment has been cancelled.</p>
                {appointment.cancellationReason && (
                  <p className="text-xs text-red-600 mt-1">Reason: {appointment.cancellationReason}</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppointmentDetails;

