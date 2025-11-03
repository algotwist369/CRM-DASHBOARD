import React, { useState, useEffect, useCallback, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiOutlineCalendar, HiOutlinePlus, HiOutlineSearch, HiOutlineRefresh, HiOutlineEye, HiOutlineCheck, HiOutlineX } from 'react-icons/hi';

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

  return (
    <tr className="hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm font-medium text-gray-900">{appointment.customerName}</div>
        <div className="text-sm text-gray-500">{appointment.phone}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{appointment.service}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{new Date(appointment.date).toLocaleDateString()}<div className="text-gray-500">{appointment.time}</div></td>
      <td className="px-6 py-4 whitespace-nowrap"><span className={`px-2 py-1 text-xs rounded-full ${statusColors[appointment.status]}`}>{appointment.status}</span></td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">₹{appointment.price}</td>
      <td className="px-6 py-4 whitespace-nowrap text-right"><button onClick={() => onView(appointment._id)} className="text-blue-600 hover:text-blue-900"><HiOutlineEye className="w-5 h-5" /></button></td>
    </tr>
  );
});

const AppointmentList = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, today: 0, pending: 0, completed: 0 });

  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    setTimeout(() => {
      setAppointments([
        { _id: '1', customerName: 'John Doe', phone: '+91 98765 43210', service: 'Haircut', date: new Date(), time: '10:00 AM', status: 'confirmed', price: 500 },
        { _id: '2', customerName: 'Jane Smith', phone: '+91 98765 43211', service: 'Hair Color', date: new Date(), time: '2:00 PM', status: 'pending', price: 2000 },
      ]);
      setStats({ total: 245, today: 12, pending: 8, completed: 180 });
      setLoading(false);
    }, 500);
  }, []);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2"><HiOutlineCalendar className="text-primary-600" />Appointments</h1><p className="text-gray-600 mt-1">Manage your appointments</p></div>
        <button onClick={() => navigate('/admin/appointments/create')} className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"><HiOutlinePlus className="w-5 h-5" />Book Appointment</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatsCard title="Total Appointments" value={stats.total} icon={<HiOutlineCalendar className="w-6 h-6 text-blue-600" />} color="text-blue-600" />
        <StatsCard title="Today" value={stats.today} icon={<HiOutlineCalendar className="w-6 h-6 text-green-600" />} color="text-green-600" />
        <StatsCard title="Pending" value={stats.pending} icon={<HiOutlineCalendar className="w-6 h-6 text-yellow-600" />} color="text-yellow-600" />
        <StatsCard title="Completed" value={stats.completed} icon={<HiOutlineCheck className="w-6 h-6 text-purple-600" />} color="text-purple-600" />
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
              ) : (
                appointments.map((appointment) => <AppointmentRow key={appointment._id} appointment={appointment} onView={(id) => navigate(`/admin/appointments/${id}`)} />)
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AppointmentList;

