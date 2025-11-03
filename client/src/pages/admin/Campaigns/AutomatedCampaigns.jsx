import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  HiOutlinePlay, HiOutlinePlus, HiOutlineSearch, HiOutlineRefresh,
  HiOutlinePencil, HiOutlineTrash, HiOutlineLightningBolt
} from 'react-icons/hi';
import adminService from '../../../services/admin/adminService';
import { toast } from 'react-hot-toast';

const AutomatedCampaigns = () => {
  const navigate = useNavigate();
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchCampaigns = useCallback(async () => {
    try {
      setLoading(true);
      // TODO: Use proper endpoint when backend is ready
      const response = await adminService.getCampaigns({ 
        search: searchTerm,
        type: 'automated' 
      });

      if (response.success) {
        setCampaigns(response.data || []);
      } else {
        toast.error(response.error || 'Failed to fetch automated campaigns');
      }
    } catch (error) {
      console.error('Failed to fetch automated campaigns:', error);
      toast.error('Failed to fetch automated campaigns');
    } finally {
      setLoading(false);
    }
  }, [searchTerm]);

  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  const handleTrigger = async (id) => {
    try {
      // TODO: Implement trigger API call
      toast.success('Campaign triggered successfully!');
    } catch (error) {
      console.error('Failed to trigger campaign:', error);
      toast.error('Failed to trigger campaign');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this automated campaign?')) return;
    
    try {
      const response = await adminService.deleteCampaign(id);
      if (response.success) {
        toast.success('Automated campaign deleted successfully!');
        fetchCampaigns();
      } else {
        toast.error(response.error || 'Failed to delete campaign');
      }
    } catch (error) {
      console.error('Failed to delete campaign:', error);
      toast.error('Failed to delete campaign');
    }
  };

  const getTriggerBadge = (trigger) => {
    const badges = {
      birthday: 'bg-pink-100 text-pink-800',
      signup: 'bg-blue-100 text-blue-800',
      purchase: 'bg-green-100 text-green-800',
      inactive: 'bg-yellow-100 text-yellow-800',
      anniversary: 'bg-purple-100 text-purple-800'
    };
    return badges[trigger] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <HiOutlineLightningBolt className="text-primary-600" />
            Automated Campaigns
          </h1>
          <p className="text-gray-600 mt-1">Trigger-based automated marketing campaigns</p>
        </div>
        <button
          onClick={() => navigate('/admin/campaigns/automated/create')}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
        >
          <HiOutlinePlus className="w-5 h-5" />
          Create Automated Campaign
        </button>
      </div>

      {/* Search & Actions */}
      <div className="flex items-center gap-4">
        <div className="flex-1 relative">
          <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search automated campaigns..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
        <button
          onClick={fetchCampaigns}
          className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          <HiOutlineRefresh className="w-5 h-5" />
          Refresh
        </button>
      </div>

      {/* Campaigns List */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      ) : campaigns.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <HiOutlineLightningBolt className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Automated Campaigns</h3>
          <p className="text-gray-600 mb-6">Create your first automated campaign to get started</p>
          <button
            onClick={() => navigate('/admin/campaigns/automated/create')}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            <HiOutlinePlus className="w-5 h-5" />
            Create Automated Campaign
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {campaigns.map((campaign) => (
            <div key={campaign._id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{campaign.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">{campaign.description}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTriggerBadge(campaign.trigger)}`}>
                  {campaign.trigger}
                </span>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Trigger Count:</span>
                  <span className="font-medium text-gray-900">{campaign.triggerCount || 0}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Success Rate:</span>
                  <span className="font-medium text-gray-900">{campaign.successRate || 0}%</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleTrigger(campaign._id)}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                >
                  <HiOutlinePlay className="w-4 h-4" />
                  Trigger
                </button>
                <button
                  onClick={() => navigate(`/admin/campaigns/automated/${campaign._id}/edit`)}
                  className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  <HiOutlinePencil className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleDelete(campaign._id)}
                  className="px-3 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50"
                >
                  <HiOutlineTrash className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AutomatedCampaigns;

