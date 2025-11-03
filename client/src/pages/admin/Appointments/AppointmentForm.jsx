import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiOutlineArrowLeft, HiOutlineSave } from 'react-icons/hi';

const AppointmentForm = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ customerName: '', phone: '', service: '', date: '', time: '', notes: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => { alert('Appointment created!'); navigate('/admin/appointments'); }, 1000);
  };

  return (
    <div className="space-y-6">
      <div><button onClick={() => navigate('/admin/appointments')} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-2"><HiOutlineArrowLeft className="w-5 h-5" />Back</button><h1 className="text-2xl font-bold">Book Appointment</h1></div>
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div><label className="block text-sm font-medium mb-2">Customer Name *</label><input type="text" value={formData.customerName} onChange={(e) => setFormData({...formData, customerName: e.target.value})} required className="w-full px-4 py-2 border rounded-lg" /></div>
          <div><label className="block text-sm font-medium mb-2">Phone *</label><input type="tel" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} required className="w-full px-4 py-2 border rounded-lg" /></div>
          <div><label className="block text-sm font-medium mb-2">Service *</label><input type="text" value={formData.service} onChange={(e) => setFormData({...formData, service: e.target.value})} required className="w-full px-4 py-2 border rounded-lg" /></div>
          <div><label className="block text-sm font-medium mb-2">Date *</label><input type="date" value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} required className="w-full px-4 py-2 border rounded-lg" /></div>
          <div><label className="block text-sm font-medium mb-2">Time *</label><input type="time" value={formData.time} onChange={(e) => setFormData({...formData, time: e.target.value})} required className="w-full px-4 py-2 border rounded-lg" /></div>
        </div>
        <div><label className="block text-sm font-medium mb-2">Notes</label><textarea value={formData.notes} onChange={(e) => setFormData({...formData, notes: e.target.value})} rows="3" className="w-full px-4 py-2 border rounded-lg" /></div>
        <div className="flex justify-end gap-4"><button type="button" onClick={() => navigate('/admin/appointments')} className="px-6 py-2 border rounded-lg">Cancel</button><button type="submit" disabled={loading} className="px-6 py-2 bg-primary-600 text-white rounded-lg flex items-center gap-2"><HiOutlineSave />{loading ? 'Saving...' : 'Book Appointment'}</button></div>
      </form>
    </div>
  );
};

export default AppointmentForm;

