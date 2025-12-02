import React, { useState, memo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import {
  HiOutlineCalendar,
  HiOutlinePlus,
  HiOutlineSearch,
  HiOutlineRefresh,
  HiOutlineEye,
  HiOutlineCheck,
  HiOutlineX,
  HiOutlineCurrencyRupee,
  HiOutlineClock,
  HiOutlineUserRemove,
  HiOutlineFilter,
  HiOutlineDuplicate
} from 'react-icons/hi';
import adminService from '../../../services/admin/adminService';
import { toast } from 'react-hot-toast';
import BackButton from '../../../components/common/Button/BackButton';

const StatsCard = memo(({ title, value, icon, color, subValue }) => (
  <div className="bg-white border border-gray-200 px-4 py-2 max-w-[230px]">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-[14px] font-medium text-gray-600">{title}</p>
        <p className={`text-md font-bold mt-2 ${color}`}>{value}</p>
        {subValue && <p className="text-xs text-gray-400 mt-1">{subValue}</p>}
      </div>
      <div className={`p-1 rounded-full ${color.replace('text', 'bg').replace('600', '100').replace('700', '100')}`}>
        {icon}
      </div>
    </div>
  </div>
));

const AppointmentRow = memo(({ appointment, onView }) => {
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

  const customerName = appointment.customer
    ? `${appointment.customer.firstName || ''} ${appointment.customer.lastName || ''}`.trim() || 'N/A'
    : 'N/A';
  const customerPhone = appointment.customer?.phone || 'N/A';
  const customerEmail = appointment.customer?.email || '';

  const serviceName = appointment.service?.name || 'N/A';
  const serviceDuration = appointment.service?.duration || appointment.duration || 0;

  const staffName = appointment.staff?.name || 'N/A';
  const staffRole = appointment.staff?.role || '';

  const appointmentDate = appointment.appointmentDate ? new Date(appointment.appointmentDate) : null;
  const startTime = appointment.startTime || '';
  const createdAt = appointment.createdAt ? new Date(appointment.createdAt) : null;

  const status = appointment.status || 'pending';
  const paymentStatus = appointment.paymentStatus || 'pending';
  const price = appointment.totalAmount || appointment.servicePrice || 0;

  return (
    <tr className="hover:bg-gray-50 transition-colors">
      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
        <div className="flex items-center gap-2">
          <span>
            #{appointment.bookingNumber
              ? appointment.bookingNumber.toString().slice(0, 6)
              : 'N/A'}
          </span>
          {appointment.bookingNumber && (
            <button
              onClick={() => {
                navigator.clipboard.writeText(appointment.bookingNumber);
                toast.success('Booking ID copied!');
              }}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              title="Copy Booking ID"
            >
              <HiOutlineDuplicate className="w-4 h-4" />
            </button>
          )}
          {appointment.new && (
            <span className="px-2 py-0.5 text-[10px] font-medium bg-green-100 text-green-800 rounded-full border border-green-200">
              New
            </span>
          )}
        </div>
      </td>

      <td className="px-4 py-4 whitespace-nowrap">
        <div className="text-sm font-medium text-gray-900">{appointment.business?.name || 'N/A'}</div>
        <div className="text-xs text-gray-500"><span className="font-bold">Branch: </span>{appointment.business?.branch || ''}</div>
      </td>
      <td className="px-4 py-4 whitespace-nowrap">
        <div className="text-sm font-medium text-gray-900">{customerName}</div>
        <div className="text-sm text-gray-500">{customerPhone}</div>
        {customerEmail && <div className="text-xs text-gray-400">{customerEmail}</div>}
      </td>
      <td className="px-4 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900">{serviceName}</div>
        <div className="text-xs text-gray-500">{serviceDuration} mins</div>
      </td>
      <td className="px-4 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900">{staffName}</div>
        <div className="text-xs text-gray-500 capitalize">{staffRole}</div>
      </td>
      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
        {appointmentDate ? appointmentDate.toLocaleDateString() : 'N/A'}
        <div className="text-gray-500">{startTime}</div>
      </td>
      <td className="px-4 py-4 whitespace-nowrap">
        <span className={`px-2 py-1 text-xs rounded-full font-medium ${statusColors[status] || 'bg-gray-100 text-gray-800'}`}>
          {status.replace('-', ' ')}
        </span>
      </td>
      <td className="px-4 py-4 flex flex-col items-center justify-center whitespace-nowrap">
        <span className={`px-4 py-1 text-xs rounded-full font-medium ${paymentStatusColors[paymentStatus] || 'bg-gray-100 text-gray-800'}`}>
          {paymentStatus}
        </span>
        <div className="text-xs text-gray-500 mt-1 capitalize">{appointment.paymentMethod || 'N/A'}</div>
      </td>
      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
        ₹{price.toLocaleString()}
        <div className="text-xs text-gray-500 mt-1 capitalize">{appointment.bookingSource?.replace('_', ' ') || 'N/A'}</div>
      </td>
      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
        {createdAt ? createdAt.toLocaleDateString() : 'N/A'}
      </td>
      <td className="px-4 py-4 whitespace-nowrap text-right">
        <button onClick={() => onView(appointment._id)} className="text-blue-600 hover:text-blue-900 p-2 rounded-full hover:bg-blue-50 transition-colors">
          <HiOutlineEye className="w-5 h-5" />
        </button>
      </td>
    </tr>
  );
});

const AppointmentList = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  // Fetch Appointments
  const {
    data: appointmentsData,
    isLoading: loadingAppointments,
    refetch: refetchAppointments
  } = useQuery({
    queryKey: ['appointments', currentPage, statusFilter, searchTerm],
    queryFn: async () => {
      const params = {
        page: currentPage,
        limit: 20,
        status: statusFilter || undefined,
        search: searchTerm || undefined
      };

      const response = await adminService.getAppointments(params);
      if (response.success) {
        return response;
      }
      throw new Error(response.error || 'Failed to fetch appointments');
    },
    placeholderData: keepPreviousData,
    onError: (error) => toast.error(error.message)
  });

  const appointments = appointmentsData?.data || [];
  const totalPages = appointmentsData?.pagination?.pages || 1;

  // Fetch Stats
  const { data: stats = {} } = useQuery({
    queryKey: ['appointmentStats'],
    queryFn: async () => {
      const response = await adminService.getAppointmentStats({});
      if (response.success) {
        return response.data || {};
      }
      return {};
    },
    refetchOnWindowFocus: false
  });

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount || 0);
  };

  const handleRefresh = () => {
    refetchAppointments();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <BackButton />
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <HiOutlineCalendar className="text-primary-600" />
            Appointments
          </h1>
          <p className="text-gray-600 mt-1">Manage your appointments and track performance</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <HiOutlineFilter className="w-5 h-5" />
            Filter
          </button>
          <button
            onClick={() => navigate('/admin/appointments/create')}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white  hover:bg-primary-700 transition-colors "
          >
            <HiOutlinePlus className="w-5 h-5" />
            Book Appointment
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        {[
          {
            title: "Total Revenue",
            value: formatCurrency(stats.totalRevenue),
            icon: <HiOutlineCurrencyRupee className="w-6 h-6 text-green-600" />,
            color: "text-green-600"
          },
          {
            title: "Total Paid",
            value: formatCurrency(stats.totalPaid),
            icon: <HiOutlineCheck className="w-6 h-6 text-emerald-600" />,
            color: "text-emerald-600"
          },
          {
            title: "Average Revenue",
            value: formatCurrency(stats.averageRevenue),
            icon: <HiOutlineCurrencyRupee className="w-6 h-6 text-blue-600" />,
            color: "text-blue-600"
          },
          {
            title: "Total Appointments",
            value: stats.totalAppointments || 0,
            icon: <HiOutlineCalendar className="w-6 h-6 text-indigo-600" />,
            color: "text-indigo-600"
          },
          {
            title: "Pending",
            value: stats.pending || 0,
            icon: <HiOutlineClock className="w-6 h-6 text-yellow-600" />,
            color: "text-yellow-600"
          },
          {
            title: "Confirmed",
            value: stats.confirmed || 0,
            icon: <HiOutlineCheck className="w-6 h-6 text-blue-600" />,
            color: "text-blue-600"
          },
          {
            title: "Cancelled",
            value: stats.cancelled || 0,
            icon: <HiOutlineX className="w-6 h-6 text-red-600" />,
            color: "text-red-600"
          },
          {
            title: "No Shows",
            value: stats.noShows || 0,
            icon: <HiOutlineUserRemove className="w-6 h-6 text-gray-600" />,
            color: "text-gray-600"
          }
        ].map((stat, index) => (
          <StatsCard
            key={index}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            color={stat.color}
          />
        ))}
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-white border border-gray-200 p-4  ">
          <div className="flex items-center gap-4 flex-wrap">
            {/* Search */}
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <HiOutlineSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by customer or booking ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      setCurrentPage(1);
                    }
                  }}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300  focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-shadow"
                />
              </div>
            </div>



            {/* Status Filter */}
            <div className="min-w-[150px] flex-1">
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-4 py-2 border border-gray-300  focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-shadow"
              >
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
                <option value="no-show">No Show</option>
              </select>
            </div>

            {/* Refresh Button */}
            <button
              onClick={handleRefresh}
              className="px-4 py-2 border border-gray-300  hover:bg-gray-50 flex items-center gap-2 transition-colors"
            >
              <HiOutlineRefresh className="w-5 h-5 text-gray-600" />
              <span className="text-gray-700">Refresh</span>
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white border border-gray-200  overflow-hidden ">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {[
                  "Booking #",
                  "Business",
                  "Customer",
                  "Service",
                  "Staff",
                  "Date & Time",
                  "Status",
                  "Payment",
                  "Price & Source",
                  "Created At",
                  "Actions"
                ].map((header, index) => (
                  <th
                    key={index}
                    className={`px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${header === 'Actions' ? 'text-right' : ''}`}
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loadingAppointments ? (
                <tr>
                  <td colSpan="6" className="px-4 bg-red-400 py-12 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                  </td>
                </tr>
              ) : appointments.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-4 py-12 text-center">
                    <HiOutlineCalendar className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-2 text-sm text-gray-500">No appointments found</p>
                  </td>
                </tr>
              ) : (
                appointments.map((appointment, index) => (
                  <AppointmentRow
                    key={appointment._id || appointment.id || `appointment-${index}`}
                    appointment={appointment}
                    onView={(id) => navigate(`/admin/appointments/${id}`)}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-gray-50 px-4 py-3 flex items-center justify-between border-t border-gray-200">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing page <span className="font-medium">{currentPage}</span> of{' '}
                  <span className="font-medium">{totalPages}</span>
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AppointmentList;
