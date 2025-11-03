import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { HiOutlineArrowLeft, HiOutlineCheck, HiOutlineX } from 'react-icons/hi';

const AppointmentDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [appointment, setAppointment] = useState(null);

  useEffect(() => {
    setTimeout(() => setAppointment({ _id: id, customerName: 'John Doe', phone: '+91 98765 43210', service: 'Haircut', date: '2024-01-15', time: '10:00 AM', status: 'confirmed', price: 500, notes: 'Regular customer' }), 500);
  }, [id]);

  if (!appointment) return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div></div>;

  return (
    <div className="space-y-6">
      <div><button onClick={() => navigate('/admin/appointments')} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-2"><HiOutlineArrowLeft className="w-5 h-5" />Back</button><h1 className="text-2xl font-bold">Appointment Details</h1></div>
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="grid grid-cols-2 gap-6">
          <div><h3 className="text-sm font-medium text-gray-500 mb-4">Appointment Information</h3><dl className="space-y-3">{[['Customer', appointment.customerName], ['Phone', appointment.phone], ['Service', appointment.service], ['Date', new Date(appointment.date).toLocaleDateString()], ['Time', appointment.time], ['Price', `₹${appointment.price}`], ['Status', appointment.status]].map(([label, value], i) => <div key={i}><dt className="text-sm text-gray-600">{label}</dt><dd className="text-sm font-medium text-gray-900 mt-1">{value}</dd></div>)}</dl></div>
          <div><h3 className="text-sm font-medium text-gray-500 mb-4">Actions</h3><div className="space-y-3">{[{label: 'Confirm', color: 'green', icon: HiOutlineCheck}, {label: 'Cancel', color: 'red', icon: HiOutlineX}].map((action, i) => {const Icon = action.icon; return <button key={i} className={`w-full px-4 py-2 border border-${action.color}-300 rounded-lg text-${action.color}-600 hover:bg-${action.color}-50 flex items-center justify-center gap-2`}><Icon className="w-5 h-5" />{action.label}</button>})}</div></div>
        </div>
      </div>
    </div>
  );
};

export default AppointmentDetails;

