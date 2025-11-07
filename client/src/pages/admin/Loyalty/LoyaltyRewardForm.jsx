import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { HiOutlineArrowLeft, HiOutlineSave } from 'react-icons/hi';

const LoyaltyRewardForm = ({ mode = 'create' }) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ name: '', description: '', pointsRequired: '', value: '', isActive: true, expiryDays: '' });

  useEffect(() => { if (mode === 'edit' && id) setFormData({ name: '10% Discount', description: 'Get 10% off on next visit', pointsRequired: '500', value: '200', isActive: true, expiryDays: '90' }); }, [mode, id]);

  const handleSubmit = async (e) => { e.preventDefault(); setLoading(true); setTimeout(() => { alert(`Reward ${mode === 'create' ? 'created' : 'updated'}!`); navigate('/admin/loyalty/rewards'); }, 1000); };

  return (
    <div className="space-y-6">
      <div><button onClick={() => navigate('/admin/loyalty/rewards')} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-2"><HiOutlineArrowLeft />Back</button><h1 className="text-2xl font-bold">{mode === 'create' ? 'Add Reward' : 'Edit Reward'}</h1></div>
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div><label className="block text-sm font-medium mb-2">Reward Name *</label><input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required className="w-full px-4 py-2 border rounded-lg" /></div>
          <div><label className="block text-sm font-medium mb-2">Points Required *</label><input type="number" value={formData.pointsRequired} onChange={(e) => setFormData({...formData, pointsRequired: e.target.value})} required className="w-full px-4 py-2 border rounded-lg" /></div>
          <div><label className="block text-sm font-medium mb-2">Value (₹) *</label><input type="number" value={formData.value} onChange={(e) => setFormData({...formData, value: e.target.value})} required className="w-full px-4 py-2 border rounded-lg" /></div>
          <div><label className="block text-sm font-medium mb-2">Expiry Days</label><input type="number" value={formData.expiryDays} onChange={(e) => setFormData({...formData, expiryDays: e.target.value})} className="w-full px-4 py-2 border rounded-lg" placeholder="Leave empty for no expiry" /></div>
        </div>
        <div><label className="block text-sm font-medium mb-2">Description *</label><textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} required rows="3" className="w-full px-4 py-2 border rounded-lg" /></div>
        <div><label className="flex items-center gap-2"><input type="checkbox" checked={formData.isActive} onChange={(e) => setFormData({...formData, isActive: e.target.checked})} className="rounded" /><span className="text-sm font-medium">Active</span></label></div>
        <div className="flex justify-end gap-4"><button type="button" onClick={() => navigate('/admin/loyalty/rewards')} className="px-6 py-2 border rounded-lg">Cancel</button><button type="submit" disabled={loading} className="px-6 py-2 bg-primary-600 text-white rounded-lg flex items-center gap-2"><HiOutlineSave />{loading ? 'Saving...' : mode === 'create' ? 'Create Reward' : 'Update Reward'}</button></div>
      </form>
    </div>
  );
};

export default LoyaltyRewardForm;

