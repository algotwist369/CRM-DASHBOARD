import React, { useState, useEffect, useCallback, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiOutlineCalendar, HiOutlinePlus, HiOutlineSearch, HiOutlineRefresh, HiOutlineEye, HiOutlineCheck, HiOutlineX } from 'react-icons/hi';
import adminService from '../../../services/admin/adminService';
import { toast } from 'react-hot-toast';

const StatsCard = memo(({ title, value, icon, color }) => (
  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
    <div className="flex items-center justify-between">
      <div><p className="text-sm font-medium text-gray-600">{title}</p><p className={`text-2xl font-bold mt-2 ${color}`}>{value}</p></div>
      <div className={`p-3 rounded-full ${color.replace('text', 'bg').replace('600', '100')}`}>{icon}</div>
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

  const customerName = appointment.customer 
    ? `${appointment.customer.firstName || ''} ${appointment.customer.lastName || ''}`.trim() || 'N/A'
    : 'N/A';
  const customerPhone = appointment.customer?.phone || 'N/A';
  const serviceName = appointment.service?.name || 'N/A';
  const appointmentDate = appointment.appointmentDate ? new Date(appointment.appointmentDate) : null;
  const startTime = appointment.startTime || '';
  const status = appointment.status || 'pending';
  const price = appointment.totalAmount || appointment.servicePrice || 0;

  return (
    <tr className="hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm font-medium text-gray-900">{customerName}</div>
        <div className="text-sm text-gray-500">{customerPhone}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{serviceName}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        {appointmentDate ? appointmentDate.toLocaleDateString() : 'N/A'}
        <div className="text-gray-500">{startTime}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`px-2 py-1 text-xs rounded-full ${statusColors[status] || 'bg-gray-100 text-gray-800'}`}>
          {status}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">₹{price.toLocaleString()}</td>
      <td className="px-6 py-4 whitespace-nowrap text-right">
        <button onClick={() => onView(appointment._id)} className="text-blue-600 hover:text-blue-900">
          <HiOutlineEye className="w-5 h-5" />
        </button>
      </td>
    </tr>
  );
});

const AppointmentList = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, today: 0, pending: 0, completed: 0 });
  const [businesses, setBusinesses] = useState([]);
  const [selectedBusinessId, setSelectedBusinessId] = useState(localStorage.getItem('selectedBusinessId') || '');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Fetch businesses
  const fetchBusinesses = useCallback(async () => {
    try {
      const response = await adminService.getBusinesses();
      if (response.success) {
        setBusinesses(response.data || []);
        if (!selectedBusinessId && response.data && response.data.length > 0) {
          const firstBusinessId = response.data[0]._id;
          setSelectedBusinessId(firstBusinessId);
          localStorage.setItem('selectedBusinessId', firstBusinessId);
        }
      }
    } catch (error) {
      console.error('Failed to fetch businesses:', error);
    }
  }, [selectedBusinessId]);

  const fetchAppointments = useCallback(async () => {
    if (!selectedBusinessId || selectedBusinessId === 'undefined' || selectedBusinessId === 'null' || selectedBusinessId.trim() === '') {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const params = {
        businessId: selectedBusinessId,
        page: currentPage,
        limit: 20,
        status: statusFilter || undefined,
        search: searchTerm || undefined
      };

      const [appointmentsRes, statsRes] = await Promise.all([
        adminService.getAppointments(params),
        adminService.getAppointmentStats({ businessId: selectedBusinessId })
      ]);

      if (appointmentsRes.success) {
        setAppointments(appointmentsRes.data || []);
        setTotalPages(appointmentsRes.pagination?.pages || 1);
      } else {
        toast.error(appointmentsRes.error || 'Failed to fetch appointments');
        setAppointments([]);
      }

      if (statsRes.success) {
        const statsData = statsRes.data || {};
        setStats({
          total: statsData.total || 0,
          today: statsData.today || 0,
          pending: statsData.pending || 0,
          completed: statsData.completed || 0
        });
      }
    } catch (error) {
      console.error('Failed to fetch appointments:', error);
      toast.error('Failed to fetch appointments');
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  }, [selectedBusinessId, currentPage, statusFilter, searchTerm]);

  useEffect(() => {
    fetchBusinesses();
  }, [fetchBusinesses]);

  useEffect(() => {
    if (selectedBusinessId) {
      fetchAppointments();
    }
  }, [fetchAppointments, selectedBusinessId]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2"><HiOutlineCalendar className="text-primary-600" />Appointments</h1><p className="text-gray-600 mt-1">Manage your appointments</p></div>
        <button onClick={() => navigate('/admin/appointments/create')} className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"><HiOutlinePlus className="w-5 h-5" />Book Appointment</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatsCard key="total" title="Total Appointments" value={stats.total} icon={<HiOutlineCalendar className="w-6 h-6 text-blue-600" />} color="text-blue-600" />
        <StatsCard key="today" title="Today" value={stats.today} icon={<HiOutlineCalendar className="w-6 h-6 text-green-600" />} color="text-green-600" />
        <StatsCard key="pending" title="Pending" value={stats.pending} icon={<HiOutlineCalendar className="w-6 h-6 text-yellow-600" />} color="text-yellow-600" />
        <StatsCard key="completed" title="Completed" value={stats.completed} icon={<HiOutlineCheck className="w-6 h-6 text-purple-600" />} color="text-purple-600" />
      </div>

      {/* Business Selector */}
      {businesses.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <HiOutlineCalendar className="w-5 h-5 text-blue-600" />
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Select Business</label>
              <select
                value={selectedBusinessId}
                onChange={(e) => {
                  setSelectedBusinessId(e.target.value);
                  localStorage.setItem('selectedBusinessId', e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white"
              >
                {businesses.map((business) => (
                  <option key={business._id} value={business._id}>
                    {business.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <HiOutlineSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by booking number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    setCurrentPage(1);
                    fetchAppointments();
                  }
                }}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
          <div className="min-w-[150px]">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
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
          <button onClick={fetchAppointments} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2">
            <HiOutlineRefresh className="w-5 h-5" />
            Refresh
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Service</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date & Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr><td colSpan="6" className="px-6 py-12 text-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div></td></tr>
              ) : appointments.length === 0 ? (
                <tr><td colSpan="6" className="px-6 py-12 text-center"><HiOutlineCalendar className="mx-auto h-12 w-12 text-gray-400" /><p className="mt-2 text-sm text-gray-500">No appointments found</p></td></tr>
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

