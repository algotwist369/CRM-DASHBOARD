import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  HiOutlineArrowLeft,
  HiOutlineCheck,
  HiOutlineX,
  HiOutlineClock,
  HiOutlineCalendar,
  HiOutlineOfficeBuilding,
  HiOutlineUser,
  HiOutlineCurrencyRupee,
  HiOutlineTag,
  HiOutlineInformationCircle,
  HiOutlineMail,
  HiOutlinePhone,
  HiOutlineLocationMarker
} from 'react-icons/hi';
import adminService from '../../../services/admin/adminService';
import { toast } from 'react-hot-toast';
import BackButton from '../../../components/common/Button/BackButton';

const Section = ({ title, icon: Icon, children }) => (
  <div className="bg-white border border-gray-200 p-6 h-full">
    <div className="flex items-center gap-2 mb-4 border-b border-gray-100 pb-2">
      {Icon && <Icon className="w-5 h-5 text-gray-500" />}
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
    </div>
    <dl className="space-y-3">
      {children}
    </dl>
  </div>
);

const DetailItem = ({ label, value, className = "" }) => (
  <div className={className}>
    <dt className="text-sm text-gray-500">{label}</dt>
    <dd className="text-sm font-medium text-gray-900 mt-1">{value || 'N/A'}</dd>
  </div>
);

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

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-blue-100 text-blue-800',
    'in-progress': 'bg-purple-100 text-purple-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
    'no-show': 'bg-gray-100 text-gray-800'
  };

  const paymentStatusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    paid: 'bg-green-100 text-green-800',
    partial: 'bg-blue-100 text-blue-800',
    refunded: 'bg-red-100 text-red-800',
    failed: 'bg-red-100 text-red-800'
  };

  const canConfirm = appointment.status === 'pending';
  const canStart = appointment.status === 'confirmed';
  const canComplete = appointment.status === 'in-progress';
  const canCancel = ['pending', 'confirmed'].includes(appointment.status);
  const canMarkNoShow = ['pending', 'confirmed'].includes(appointment.status);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <BackButton />
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            Appointment Details
            <span className={`px-3 py-1 text-sm rounded-full ${statusColors[appointment.status]}`}>
              {appointment.status?.replace('-', ' ')}
            </span>
          </h1>
          <p className="text-gray-600 mt-1">
            Booking #: <span className="font-mono font-medium">{appointment.formattedBookingNumber || appointment.bookingNumber}</span>
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-2">
          {canConfirm && (
            <button
              onClick={() => handleAction('confirm')}
              disabled={actionLoading === 'confirm'}
              className="px-4 py-2 bg-green-600 text-white hover:bg-green-700 rounded-md flex items-center gap-2 disabled:opacity-50"
            >
              <HiOutlineCheck className="w-4 h-4" /> Confirm
            </button>
          )}
          {canStart && (
            <button
              onClick={() => handleAction('start')}
              disabled={actionLoading === 'start'}
              className="px-4 py-2 bg-purple-600 text-white hover:bg-purple-700 rounded-md flex items-center gap-2 disabled:opacity-50"
            >
              <HiOutlineClock className="w-4 h-4" /> Start
            </button>
          )}
          {canComplete && (
            <button
              onClick={() => handleAction('complete')}
              disabled={actionLoading === 'complete'}
              className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-md flex items-center gap-2 disabled:opacity-50"
            >
              <HiOutlineCheck className="w-4 h-4" /> Complete
            </button>
          )}
          {canCancel && (
            <button
              onClick={() => {
                const reason = window.prompt('Cancellation reason:');
                if (reason) handleAction('cancel', { reason });
              }}
              disabled={actionLoading === 'cancel'}
              className="px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded-md flex items-center gap-2 disabled:opacity-50"
            >
              <HiOutlineX className="w-4 h-4" /> Cancel
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

        {/* Business Info */}
        <Section title="Business Information" icon={HiOutlineOfficeBuilding}>
          <DetailItem label="Name" value={appointment.business?.name} />
          <DetailItem label="Branch" value={appointment.business?.branch} />
          <DetailItem label="Type" value={appointment.business?.type} className="capitalize" />
          <div className="flex gap-4">
            <DetailItem label="Phone" value={appointment.business?.phone} />
            <DetailItem label="Email" value={appointment.business?.email} />
          </div>
        </Section>

        {/* Customer Info */}
        <Section title="Customer Information" icon={HiOutlineUser}>
          <DetailItem label="Full Name" value={appointment.customer?.fullName} />
          <div className="flex gap-4">
            <DetailItem label="Phone" value={appointment.customer?.phone} />
            <DetailItem label="Email" value={appointment.customer?.email} />
          </div>
          <DetailItem label="Address" value={appointment.customer?.address?.country} />
          <div className="flex gap-4">
            <DetailItem label="Age" value={appointment.customer?.age} />
            <DetailItem label="Last Visit" value={appointment.customer?.daysSinceLastVisit ? `${appointment.customer.daysSinceLastVisit} days ago` : 'Never'} />
          </div>
        </Section>

        {/* Service Info */}
        <Section title="Service Details" icon={HiOutlineTag}>
          <DetailItem label="Service Name" value={appointment.service?.name} />
          <DetailItem label="Category" value={appointment.service?.category} className="capitalize" />
          <div className="flex gap-4">
            <DetailItem label="Duration" value={`${appointment.service?.duration || 0} mins`} />
            <DetailItem label="Price" value={`₹${(appointment.servicePrice || 0).toLocaleString()}`} />
          </div>
        </Section>

        {/* Appointment Details */}
        <Section title="Appointment Details" icon={HiOutlineCalendar}>
          <div className="flex gap-4">
            <DetailItem label="Date" value={appointment.appointmentDate ? new Date(appointment.appointmentDate).toLocaleDateString() : 'N/A'} />
            <DetailItem label="Day" value={appointment.appointmentDay} />
          </div>
          <div className="flex gap-4">
            <DetailItem label="Time" value={`${appointment.startTime} - ${appointment.endTime}`} />
            <DetailItem label="Duration" value={`${appointment.duration} mins`} />
          </div>
          <div className="flex gap-4">
            <DetailItem label="Type" value={appointment.bookingType} className="capitalize" />
            <DetailItem label="Source" value={appointment.bookingSource} className="capitalize" />
          </div>
          <DetailItem label="Staff" value={appointment.staff?.name} />
          <DetailItem label="Staff Role" value={appointment.staff?.role} className="capitalize" />
        </Section>

        {/* Financials */}
        <Section title="Financials" icon={HiOutlineCurrencyRupee}>
          <div className="grid grid-cols-2 gap-4">
            <DetailItem label="Service Price" value={`₹${(appointment.servicePrice || 0).toLocaleString()}`} />
            <DetailItem label="Additional" value={`₹${(appointment.additionalCharges || 0).toLocaleString()}`} />
            <DetailItem label="Discount" value={`₹${(appointment.discount || 0).toLocaleString()}`} />
            <DetailItem label="Tax" value={`₹${(appointment.tax || 0).toLocaleString()}`} />
          </div>
          <div className="border-t border-gray-100 pt-2 mt-2">
            <div className="flex justify-between items-center">
              <dt className="text-sm font-bold text-gray-900">Total Amount</dt>
              <dd className="text-lg font-bold text-primary-600">₹{(appointment.totalAmount || 0).toLocaleString()}</dd>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div>
              <dt className="text-sm text-gray-500">Payment Status</dt>
              <dd className="mt-1">
                <span className={`px-2 py-1 text-xs rounded-full ${paymentStatusColors[appointment.paymentStatus] || 'bg-gray-100'}`}>
                  {appointment.paymentStatus}
                </span>
              </dd>
            </div>
            <DetailItem label="Method" value={appointment.paymentMethod} className="capitalize" />
          </div>
          <div className="grid grid-cols-2 gap-4 mt-2">
            <DetailItem label="Paid" value={`₹${(appointment.paidAmount || 0).toLocaleString()}`} />
            <DetailItem label="Remaining" value={`₹${(appointment.remainingAmount || 0).toLocaleString()}`} />
          </div>
        </Section>

        {/* Meta & Notes */}
        <Section title="Additional Information" icon={HiOutlineInformationCircle}>
          <DetailItem label="Customer Notes" value={appointment.customerNotes} />
          <DetailItem label="Special Requests" value={appointment.specialRequests} />
          <div className="grid grid-cols-2 gap-4 mt-2">
            <DetailItem label="Reminder Sent" value={appointment.reminderSent ? 'Yes' : 'No'} />
            <DetailItem label="Confirmation Sent" value={appointment.confirmationSent ? 'Yes' : 'No'} />
            <DetailItem label="Loyalty Earned" value={appointment.loyaltyPointsEarned} />
            <DetailItem label="Created At" value={new Date(appointment.createdAt).toLocaleString()} />
          </div>
          {appointment.status === 'cancelled' && (
            <div className="mt-2 p-2 bg-red-50 rounded text-xs text-red-700">
              Cancellation Fee: ₹{appointment.cancellationFee}
            </div>
          )}
        </Section>

      </div>
    </div>
  );
};

export default AppointmentDetails;

