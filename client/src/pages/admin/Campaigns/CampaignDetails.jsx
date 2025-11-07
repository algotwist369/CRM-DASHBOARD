import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  HiOutlineArrowLeft, HiOutlinePencil, HiOutlineTrash, HiOutlineMail,
  HiOutlineUsers, HiOutlineEye, HiOutlineCheckCircle, HiOutlineXCircle,
  HiOutlinePlay, HiOutlinePause, HiOutlineChartBar, HiOutlineDuplicate
} from 'react-icons/hi';
import adminService from '../../../services/admin/adminService';
import { toast } from 'react-hot-toast';

const CampaignDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [campaign, setCampaign] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const fetchCampaign = async () => {
      try {
        setLoading(true);
        const response = await adminService.getCampaign(id);
        
        if (response.success) {
          setCampaign(response.data);
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
    };

    fetchCampaign();
  }, [id, navigate]);

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this campaign?')) {
      try {
        const response = await adminService.deleteCampaign(id);
        if (response.success) {
          toast.success('Campaign deleted successfully!');
          navigate('/admin/campaigns');
        } else {
          toast.error(response.error || 'Failed to delete campaign');
        }
      } catch (error) {
        console.error('Failed to delete campaign:', error);
        toast.error('Failed to delete campaign');
      }
    }
  };

  const handlePause = async () => {
    try {
      const response = await adminService.cancelCampaign(id);
      if (response.success) {
        toast.success('Campaign paused successfully!');
        setCampaign(response.data);
      } else {
        toast.error(response.error || 'Failed to pause campaign');
      }
    } catch (error) {
      console.error('Failed to pause campaign:', error);
      toast.error('Failed to pause campaign');
    }
  };

  const handleResume = async () => {
    try {
      const response = await adminService.launchCampaign(id);
      if (response.success) {
        toast.success('Campaign resumed successfully!');
        setCampaign(response.data);
      } else {
        toast.error(response.error || 'Failed to resume campaign');
      }
    } catch (error) {
      console.error('Failed to resume campaign:', error);
      toast.error('Failed to resume campaign');
    }
  };

  const handleClone = async () => {
    try {
      const response = await adminService.cloneCampaign(id);
      if (response.success) {
        toast.success('Campaign cloned successfully!');
        navigate(`/admin/campaigns/${response.data._id}`);
      } else {
        toast.error(response.error || 'Failed to clone campaign');
      }
    } catch (error) {
      console.error('Failed to clone campaign:', error);
      toast.error('Failed to clone campaign');
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      draft: 'bg-gray-100 text-gray-800',
      scheduled: 'bg-blue-100 text-blue-800',
      active: 'bg-green-100 text-green-800',
      paused: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-purple-100 text-purple-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return badges[status] || badges.draft;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Campaign not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <button
            onClick={() => navigate('/admin/campaigns')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-2"
          >
            <HiOutlineArrowLeft className="w-5 h-5" />
            Back to Campaigns
          </button>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">{campaign.name}</h1>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadge(campaign.status)}`}>
              {campaign.status}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {campaign.status === 'active' && (
            <button
              onClick={handlePause}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <HiOutlinePause className="w-5 h-5" />
              Pause
            </button>
          )}
          {campaign.status === 'paused' && (
            <button
              onClick={handleResume}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <HiOutlinePlay className="w-5 h-5" />
              Resume
            </button>
          )}
          <button
            onClick={handleClone}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <HiOutlineDuplicate className="w-5 h-5" />
            Clone
          </button>
          <button
            onClick={() => navigate(`/admin/campaigns/${id}/edit`)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <HiOutlinePencil className="w-5 h-5" />
            Edit
          </button>
          <button
            onClick={handleDelete}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            <HiOutlineTrash className="w-5 h-5" />
            Delete
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {['overview', 'analytics', 'audience'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-4 px-1 border-b-2 font-medium text-sm capitalize ${
                activeTab === tab
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {activeTab === 'overview' && (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Recipients</p>
                    <p className="text-2xl font-bold text-gray-900">{campaign.totalRecipients || 0}</p>
                  </div>
                  <HiOutlineUsers className="w-8 h-8 text-blue-600" />
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Sent</p>
                    <p className="text-2xl font-bold text-gray-900">{campaign.sent || 0}</p>
                  </div>
                  <HiOutlineMail className="w-8 h-8 text-green-600" />
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Opened</p>
                    <p className="text-2xl font-bold text-gray-900">{campaign.opened || 0}</p>
                  </div>
                  <HiOutlineEye className="w-8 h-8 text-purple-600" />
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Open Rate</p>
                    <p className="text-2xl font-bold text-gray-900">{campaign.openRate || 0}%</p>
                  </div>
                  <HiOutlineChartBar className="w-8 h-8 text-yellow-600" />
                </div>
              </div>
            </div>

            {/* Campaign Details */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold mb-4">Campaign Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium text-gray-500">Type</label>
                  <p className="mt-1 text-gray-900">{campaign.type}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Target Audience</label>
                  <p className="mt-1 text-gray-900">{campaign.targetAudience}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Subject</label>
                  <p className="mt-1 text-gray-900">{campaign.subject}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Scheduled Date</label>
                  <p className="mt-1 text-gray-900">
                    {campaign.scheduledDate ? new Date(campaign.scheduledDate).toLocaleDateString() : 'Not scheduled'}
                  </p>
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-gray-500">Message</label>
                  <p className="mt-1 text-gray-900 whitespace-pre-wrap">{campaign.message}</p>
                </div>
              </div>
            </div>
          </>
        )}

        {activeTab === 'analytics' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold mb-4">Campaign Analytics</h3>
            <p className="text-gray-600">Analytics data will be available here.</p>
          </div>
        )}

        {activeTab === 'audience' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold mb-4">Target Audience</h3>
            <p className="text-gray-600">Audience details will be available here.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CampaignDetails;
