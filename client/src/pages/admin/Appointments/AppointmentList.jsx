import React, { useState, memo, useEffect, useCallback, useMemo } from 'react';
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
  HiOutlineDuplicate,
  HiChevronDown,
  HiChevronUp,
  HiOutlineDownload
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

const CollapsibleSection = memo(({ title, isExpanded, onToggle, badge, children }) => (
  <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
    <button
      onClick={onToggle}
      className="w-full px-5 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
    >
      <div className="flex items-center gap-3">
        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">{title}</h3>
        {badge && (
          <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">
            {badge}
          </span>
        )}
      </div>
      {isExpanded ? (
        <HiChevronUp className="w-5 h-5 text-gray-500" />
      ) : (
        <HiChevronDown className="w-5 h-5 text-gray-500" />
      )}
    </button>
    {isExpanded && (
      <div className="px-5 py-4 border-t border-gray-200 bg-gray-50">
        {children}
      </div>
    )}
  </div>
));

const AppointmentRow = memo(({ appointment, onView, onDownloadInvoice }) => {
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
      <td className="px-3 py-2 whitespace-nowrap text-xs font-medium text-gray-900">
        <div className="flex items-center gap-1.5">
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
              <HiOutlineDuplicate className="w-3.5 h-3.5" />
            </button>
          )}
          {appointment.new && (
            <span className="px-1.5 py-0.5 text-[9px] font-medium bg-green-100 text-green-800 rounded-full border border-green-200">
              New
            </span>
          )}
        </div>
      </td>

      <td className="px-3 py-2 whitespace-nowrap">
        <div className="text-xs font-medium text-gray-900">{appointment.business?.name || 'N/A'}</div>
        <div className="text-[10px] text-gray-500"><span className="font-bold">Branch: </span>{appointment.business?.branch || ''}</div>
      </td>
      <td className="px-3 py-2 whitespace-nowrap">
        <div className="text-xs font-medium text-gray-900">{customerName}</div>
        <div className="text-xs text-gray-500">{customerPhone}</div>
        {customerEmail && <div className="text-[10px] text-gray-400">{customerEmail}</div>}
      </td>
      <td className="px-3 py-2 whitespace-nowrap">
        <div className="text-xs text-gray-900">{serviceName}</div>
        <div className="text-[10px] text-gray-500">{serviceDuration} mins</div>
      </td>
      <td className="px-3 py-2 whitespace-nowrap">
        <div className="text-xs text-gray-900">{staffName}</div>
        <div className="text-[10px] text-gray-500 capitalize">{staffRole}</div>
      </td>
      <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900">
        {appointmentDate ? appointmentDate.toLocaleDateString() : 'N/A'}
        <div className="text-gray-500 text-[10px]">{startTime}</div>
      </td>
      <td className="px-3 py-2 whitespace-nowrap">
        <span className={`px-2 py-0.5 text-[10px] rounded-full font-medium ${statusColors[status] || 'bg-gray-100 text-gray-800'}`}>
          {status.replace('-', ' ')}
        </span>
      </td>
      <td className="px-3 py-2 flex flex-col items-center justify-center whitespace-nowrap">
        <span className={`px-3 py-0.5 text-[10px] rounded-full font-medium ${paymentStatusColors[paymentStatus] || 'bg-gray-100 text-gray-800'}`}>
          {paymentStatus}
        </span>
        <div className="text-[10px] text-gray-500 mt-0.5 capitalize">{appointment.paymentMethod || 'N/A'}</div>
      </td>
      <td className="px-3 py-2 whitespace-nowrap text-xs font-medium text-gray-900">
        ₹{price.toLocaleString()}
        <div className="text-[10px] text-gray-500 mt-0.5 capitalize">{appointment.bookingSource?.replace('_', ' ') || 'N/A'}</div>
      </td>
      <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-500">
        {createdAt ? createdAt.toLocaleDateString() : 'N/A'}
      </td>
      <td className="px-3 py-2 whitespace-nowrap text-right flex items-center justify-end gap-1">
        {paymentStatus === 'paid' && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDownloadInvoice(appointment._id, appointment.bookingNumber);
            }}
            className="text-green-600 hover:text-green-900 p-1.5 rounded-full hover:bg-green-50 transition-colors"
            title="Download Invoice"
          >
            <HiOutlineDownload className="w-4 h-4" />
          </button>
        )}
        <button onClick={() => onView(appointment._id)} className="text-blue-600 hover:text-blue-900 p-1.5 rounded-full hover:bg-blue-50 transition-colors">
          <HiOutlineEye className="w-4 h-4" />
        </button>
      </td>
    </tr>
  );
});

const AppointmentList = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  // Collapsible sections state
  const [expandedSections, setExpandedSections] = useState({
    revenue: true,
    today: false,
    month: false,
    overall: false,
    alerts: false
  });

  // Debounce search input (500ms delay)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1); // Reset to first page on search
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Memoized toggle function
  const toggleSection = useCallback((section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  }, []);

  // Fetch Appointments with optimized settings
  const {
    data: appointmentsData,
    isLoading: loadingAppointments,
    refetch: refetchAppointments
  } = useQuery({
    queryKey: ['appointments', currentPage, statusFilter, debouncedSearch],
    queryFn: async () => {
      const params = {
        page: currentPage,
        limit: 20,
        status: statusFilter || undefined,
        search: debouncedSearch || undefined
      };

      const response = await adminService.getAppointments(params);
      if (response.success) {
        return response;
      }
      throw new Error(response.error || 'Failed to fetch appointments');
    },
    placeholderData: keepPreviousData,
    staleTime: 30000, // Cache data for 30 seconds
    cacheTime: 300000, // Keep in cache for 5 minutes
    onError: (error) => toast.error(error.message)
  });

  const appointments = appointmentsData?.data || [];
  const totalPages = appointmentsData?.pagination?.pages || 1;

  // Fetch Stats with cache metadata and optimized settings
  const {
    data: statsResponse,
    refetch: refetchStats
  } = useQuery({
    queryKey: ['appointmentStats'],
    queryFn: async () => {
      const response = await adminService.getAppointmentStats({});
      if (response.success) {
        return response; // Return full response with source, cacheAge, lastUpdated
      }
      return { data: {} };
    },
    refetchInterval: 60000, // Auto-refresh every minute
    refetchOnWindowFocus: true,
    staleTime: 30000, // Consider fresh for 30 seconds
    cacheTime: 300000 // Keep in cache for 5 minutes
  });

  const stats = statsResponse?.data || {};
  const isFromCache = statsResponse?.source === 'cache';
  const cacheAge = statsResponse?.cacheAge;
  const lastUpdated = statsResponse?.lastUpdated;

  const formatCurrency = useCallback((amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount || 0);
  }, []);

  const formatTimeElapsed = useCallback((seconds) => {
    if (seconds < 60) return `${seconds} seconds`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''}`;
    const hours = Math.floor(minutes / 60);
    return `${hours} hour${hours > 1 ? 's' : ''}`;
  }, []);

  const handleRefresh = useCallback(() => {
    refetchAppointments();
    refetchStats();
  }, [refetchAppointments, refetchStats]);

  const handleViewAppointment = useCallback((id) => {
    navigate(`/admin/appointments/${id}`);
  }, [navigate]);

  const handleStatusFilterChange = useCallback((e) => {
    setStatusFilter(e.target.value);
    setCurrentPage(1);
  }, []);

  const handlePageChange = useCallback((newPage) => {
    setCurrentPage(newPage);
  }, []);

  const handleDownloadInvoice = useCallback(async (id, bookingNumber) => {
    const toastId = toast.loading('Generating invoice...');
    try {
      const response = await adminService.downloadInvoice(id);
      if (response.success) {
        // Create blob link to download
        const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `invoice-${bookingNumber}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        toast.success('Invoice downloaded', { id: toastId });
      } else {
        toast.error(response.error || 'Failed to download', { id: toastId });
      }
    } catch (err) {
      console.error(err);
      toast.error('Error downloading invoice', { id: toastId });
    }
  }, []);

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

      {/* Cache Status Indicator */}
      {isFromCache && cacheAge !== null && (
        <div className="bg-blue-50 border border-blue-200 px-4 py-2 rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HiOutlineClock className="w-5 h-5 text-blue-600" />
            <span className="text-sm text-blue-800">
              Stats cached - Last updated {formatTimeElapsed(cacheAge)} ago
            </span>
          </div>
          <button
            onClick={() => refetchStats()}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
          >
            <HiOutlineRefresh className="w-4 h-4" />
            Refresh Now
          </button>
        </div>
      )}

      {/* Collapsible Stats Sections */}
      <div className="space-y-4">
        {/* Revenue Overview - Expanded by default */}
        <CollapsibleSection
          title="Revenue Overview"
          isExpanded={expandedSections.revenue}
          onToggle={() => toggleSection('revenue')}
          badge={formatCurrency(stats.totalRevenue)}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatsCard
              title="Paid Revenue"
              value={formatCurrency(stats.paidRevenue)}
              subValue="Fully paid appointments"
              icon={<HiOutlineCheck className="w-6 h-6 text-green-600" />}
              color="text-green-600"
            />
            <StatsCard
              title="Pending Revenue"
              value={formatCurrency(stats.pendingRevenue)}
              subValue="Awaiting payment"
              icon={<HiOutlineClock className="w-6 h-6 text-yellow-600" />}
              color="text-yellow-600"
            />
            <StatsCard
              title="Total Revenue"
              value={formatCurrency(stats.totalRevenue)}
              subValue={`${stats.paymentCollectionRate}% collected`}
              icon={<HiOutlineCurrencyRupee className="w-6 h-6 text-blue-600" />}
              color="text-blue-600"
            />
            <StatsCard
              title="Average Value"
              value={formatCurrency(stats.averageAppointmentValue)}
              subValue="Per appointment"
              icon={<HiOutlineCurrencyRupee className="w-6 h-6 text-indigo-600" />}
              color="text-indigo-600"
            />
          </div>
        </CollapsibleSection>

        {/* Today's Performance */}
        <CollapsibleSection
          title="Today's Performance"
          isExpanded={expandedSections.today}
          onToggle={() => toggleSection('today')}
          badge={`${stats.todayAppointments || 0} appointments`}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <StatsCard
              title="Today's Appointments"
              value={stats.todayAppointments || 0}
              subValue={`${stats.todayCompleted || 0} completed`}
              icon={<HiOutlineCalendar className="w-6 h-6 text-purple-600" />}
              color="text-purple-600"
            />
            <StatsCard
              title="Today's Revenue"
              value={formatCurrency(stats.todayRevenue)}
              subValue="Total bookings"
              icon={<HiOutlineCurrencyRupee className="w-6 h-6 text-green-600" />}
              color="text-green-600"
            />
            <StatsCard
              title="Today Paid"
              value={formatCurrency(stats.todayPaidRevenue)}
              subValue="Collected today"
              icon={<HiOutlineCheck className="w-6 h-6 text-emerald-600" />}
              color="text-emerald-600"
            />
            <StatsCard
              title="Today Pending"
              value={formatCurrency(stats.todayPendingRevenue)}
              subValue="Due today"
              icon={<HiOutlineClock className="w-6 h-6 text-orange-600" />}
              color="text-orange-600"
            />
            <StatsCard
              title="Today Cancelled"
              value={stats.todayCancelled || 0}
              subValue="Cancellations"
              icon={<HiOutlineX className="w-6 h-6 text-red-600" />}
              color="text-red-600"
            />
          </div>
        </CollapsibleSection>

        {/* This Month's Performance */}
        <CollapsibleSection
          title="This Month's Performance"
          isExpanded={expandedSections.month}
          onToggle={() => toggleSection('month')}
          badge={`${stats.thisMonthAppointments || 0} appointments`}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <StatsCard
              title="Month Appointments"
              value={stats.thisMonthAppointments || 0}
              subValue={`${stats.thisMonthCompleted || 0} completed`}
              icon={<HiOutlineCalendar className="w-6 h-6 text-blue-600" />}
              color="text-blue-600"
            />
            <StatsCard
              title="Month Revenue"
              value={formatCurrency(stats.thisMonthRevenue)}
              subValue="Total bookings"
              icon={<HiOutlineCurrencyRupee className="w-6 h-6 text-green-600" />}
              color="text-green-600"
            />
            <StatsCard
              title="Month Paid"
              value={formatCurrency(stats.thisMonthPaidRevenue)}
              subValue="Collected"
              icon={<HiOutlineCheck className="w-6 h-6 text-emerald-600" />}
              color="text-emerald-600"
            />
            <StatsCard
              title="Month Pending"
              value={formatCurrency(stats.thisMonthPendingRevenue)}
              subValue="Due"
              icon={<HiOutlineClock className="w-6 h-6 text-orange-600" />}
              color="text-orange-600"
            />
            <StatsCard
              title="Completion Rate"
              value={`${stats.completionRate || 0}%`}
              subValue="Success rate"
              icon={<HiOutlineCheck className="w-6 h-6 text-teal-600" />}
              color="text-teal-600"
            />
          </div>
        </CollapsibleSection>

        {/* Overall Status */}
        <CollapsibleSection
          title="Overall Status"
          isExpanded={expandedSections.overall}
          onToggle={() => toggleSection('overall')}
          badge={`${stats.totalAppointments || 0} total`}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            <StatsCard
              title="Total Appointments"
              value={stats.totalAppointments || 0}
              icon={<HiOutlineCalendar className="w-6 h-6 text-indigo-600" />}
              color="text-indigo-600"
            />
            <StatsCard
              title="Pending"
              value={stats.pending || 0}
              icon={<HiOutlineClock className="w-6 h-6 text-yellow-600" />}
              color="text-yellow-600"
            />
            <StatsCard
              title="Confirmed"
              value={stats.confirmed || 0}
              icon={<HiOutlineCheck className="w-6 h-6 text-blue-600" />}
              color="text-blue-600"
            />
            <StatsCard
              title="Completed"
              value={stats.completed || 0}
              icon={<HiOutlineCheck className="w-6 h-6 text-green-600" />}
              color="text-green-600"
            />
            <StatsCard
              title="Cancelled"
              value={stats.cancelled || 0}
              subValue={`${stats.cancellationRate || 0}% rate`}
              icon={<HiOutlineX className="w-6 h-6 text-red-600" />}
              color="text-red-600"
            />
            <StatsCard
              title="No Shows"
              value={stats.noShows || 0}
              subValue={`${stats.noShowRate || 0}% rate`}
              icon={<HiOutlineUserRemove className="w-6 h-6 text-gray-600" />}
              color="text-gray-600"
            />
          </div>
        </CollapsibleSection>

        {/* Alerts & Upcoming - Only show if there's data */}
        {(stats.upcomingAppointments > 0 || stats.overdueAppointments > 0 || stats.inProgress > 0) && (
          <CollapsibleSection
            title="Alerts & Upcoming"
            isExpanded={expandedSections.alerts}
            onToggle={() => toggleSection('alerts')}
            badge={stats.overdueAppointments > 0 ? `${stats.overdueAppointments} overdue` : null}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {stats.upcomingAppointments > 0 && (
                <StatsCard
                  title="Upcoming"
                  value={stats.upcomingAppointments || 0}
                  subValue="Future bookings"
                  icon={<HiOutlineCalendar className="w-6 h-6 text-blue-600" />}
                  color="text-blue-600"
                />
              )}
              {stats.overdueAppointments > 0 && (
                <StatsCard
                  title="Overdue"
                  value={stats.overdueAppointments || 0}
                  subValue="Needs attention"
                  icon={<HiOutlineClock className="w-6 h-6 text-red-600" />}
                  color="text-red-600"
                />
              )}
              {stats.inProgress > 0 && (
                <StatsCard
                  title="In Progress"
                  value={stats.inProgress || 0}
                  subValue="Currently active"
                  icon={<HiOutlineClock className="w-6 h-6 text-purple-600" />}
                  color="text-purple-600"
                />
              )}
            </div>
          </CollapsibleSection>
        )}
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
                  className="w-full pl-10 pr-4 py-2 border border-gray-300  focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-shadow"
                />
              </div>
            </div>



            {/* Status Filter */}
            <div className="min-w-[150px] flex-1">
              <select
                value={statusFilter}
                onChange={handleStatusFilterChange}
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
                    className={`px-3 py-2 text-left text-[10px] font-semibold text-gray-600 uppercase tracking-wider ${header === 'Actions' ? 'text-right' : ''}`}
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loadingAppointments ? (
                <tr>
                  <td colSpan="6" className="px-4 py-12 text-center">
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
                    onView={handleViewAppointment}
                    onDownloadInvoice={handleDownloadInvoice}
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
                onClick={() => handlePageChange(Math.max(currentPage - 1, 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => handlePageChange(Math.min(currentPage + 1, totalPages))}
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
                  onClick={() => handlePageChange(Math.max(currentPage - 1, 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => handlePageChange(Math.min(currentPage + 1, totalPages))}
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
