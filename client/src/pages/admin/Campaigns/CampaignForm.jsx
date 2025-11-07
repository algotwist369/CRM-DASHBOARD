import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { HiOutlineArrowLeft, HiOutlineSave } from 'react-icons/hi';
import adminService from '../../../services/admin/adminService';
import { toast } from 'react-hot-toast';

const CampaignForm = ({ mode = 'create' }) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ name: '', type: 'email', targetAudience: 'all', subject: '', message: '', scheduledDate: '', scheduledTime: '' });

  useEffect(() => {
    const fetchCampaign = async () => {
      if (mode === 'edit' && id) {
        try {
          setLoading(true);
          const response = await adminService.getCampaign(id);
          if (response.success) {
            setFormData(response.data);
          } else {
            toast.error(response.error || 'Failed to fetch campaign');
            navigate('/admin/campaigns');
          }
        } catch (error) {
          console.error('Failed to fetch campaign:', error);
          toast.error('Failed to fetch campaign');
          navigate('/admin/campaigns');
        } finally {
          setLoading(false);
        }
      }
    };
    fetchCampaign();
  }, [mode, id, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = mode === 'create'
        ? await adminService.createCampaign(formData)
        : await adminService.updateCampaign(id, formData);
      
      if (response.success) {
        toast.success(`Campaign ${mode === 'create' ? 'created' : 'updated'} successfully!`);
        navigate('/admin/campaigns');
      } else {
        toast.error(response.error || `Failed to ${mode} campaign`);
      }
    } catch (error) {
      console.error(`Failed to ${mode} campaign:`, error);
      toast.error(`Failed to ${mode} campaign`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div><button onClick={() => navigate('/admin/campaigns')} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-2"><HiOutlineArrowLeft />Back</button><h1 className="text-2xl font-bold">{mode === 'create' ? 'Create Campaign' : 'Edit Campaign'}</h1></div>
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div><label className="block text-sm font-medium mb-2">Campaign Name *</label><input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required className="w-full px-4 py-2 border rounded-lg" /></div>
          <div><label className="block text-sm font-medium mb-2">Type *</label><select value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})} className="w-full px-4 py-2 border rounded-lg"><option value="email">Email</option><option value="sms">SMS</option><option value="whatsapp">WhatsApp</option></select></div>
          <div><label className="block text-sm font-medium mb-2">Target Audience *</label><select value={formData.targetAudience} onChange={(e) => setFormData({...formData, targetAudience: e.target.value})} className="w-full px-4 py-2 border rounded-lg"><option value="all">All Customers</option><option value="vip">VIP Customers</option><option value="inactive">Inactive Customers</option></select></div>
          <div><label className="block text-sm font-medium mb-2">Subject</label><input type="text" value={formData.subject} onChange={(e) => setFormData({...formData, subject: e.target.value})} className="w-full px-4 py-2 border rounded-lg" /></div>
          <div><label className="block text-sm font-medium mb-2">Schedule Date</label><input type="date" value={formData.scheduledDate} onChange={(e) => setFormData({...formData, scheduledDate: e.target.value})} className="w-full px-4 py-2 border rounded-lg" /></div>
          <div><label className="block text-sm font-medium mb-2">Schedule Time</label><input type="time" value={formData.scheduledTime} onChange={(e) => setFormData({...formData, scheduledTime: e.target.value})} className="w-full px-4 py-2 border rounded-lg" /></div>
        </div>
        <div><label className="block text-sm font-medium mb-2">Message *</label><textarea value={formData.message} onChange={(e) => setFormData({...formData, message: e.target.value})} required rows="5" className="w-full px-4 py-2 border rounded-lg" /></div>
        <div className="flex justify-end gap-4"><button type="button" onClick={() => navigate('/admin/campaigns')} className="px-6 py-2 border rounded-lg">Cancel</button><button type="submit" disabled={loading} className="px-6 py-2 bg-primary-600 text-white rounded-lg flex items-center gap-2"><HiOutlineSave />{loading ? 'Saving...' : mode === 'create' ? 'Create Campaign' : 'Update Campaign'}</button></div>
      </form>
    </div>
  );
};

export default CampaignForm;

