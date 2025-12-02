import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  HiOutlinePlay, HiOutlinePlus, HiOutlineSearch, HiOutlineRefresh,
  HiOutlinePencil, HiOutlineTrash, HiOutlineLightningBolt
} from 'react-icons/hi';
import adminService from '../../../services/admin/adminService';
import { toast } from 'react-hot-toast';
import BackButton from '../../../components/common/Button/BackButton';

const AutomatedCampaigns = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [campaigns, setCampaigns] = useState([]);
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBusiness, setSelectedBusiness] = useState(searchParams.get('businessId') || '');
  const [filterTriggerType, setFilterTriggerType] = useState('');
  const [filterActive, setFilterActive] = useState('');

  // Fetch businesses on mount
  useEffect(() => {
    const fetchBusinesses = async () => {
      const response = await adminService.getBusinesses();
      if (response.success) {
        setBusinesses(response.data || []);
        if (!selectedBusiness && response.data?.length === 1) {
          setSelectedBusiness(response.data[0]._id);
        }
      }
    };
    fetchBusinesses();
  }, []);

  const fetchCampaigns = useCallback(async () => {
    if (!selectedBusiness) {
      setCampaigns([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const params = {
        businessId: selectedBusiness,
        search: searchTerm || undefined,
        triggerType: filterTriggerType || undefined,
        isActive: filterActive || undefined
      };

      const response = await adminService.getAutomatedCampaigns(params);

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
  }, [selectedBusiness, searchTerm, filterTriggerType, filterActive]);

  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  const handleTrigger = async (id) => {
    try {
      const response = await adminService.triggerAutomatedCampaign(id);
      if (response.success) {
        toast.success(`Campaign triggered! ${response.data.campaignsSent} campaigns sent to ${response.data.customersTargeted} customers`);
        fetchCampaigns(); // Refresh to update stats
      } else {
        toast.error(response.error || 'Failed to trigger campaign');
      }
    } catch (error) {
      console.error('Failed to trigger campaign:', error);
      toast.error('Failed to trigger campaign');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this automated campaign?')) return;

    try {
      const response = await adminService.deleteAutomatedCampaign(id);
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

  const getTriggerBadge = (triggerType) => {
    const badges = {
      customer_birthday: 'bg-pink-100 text-pink-800',
      customer_anniversary: 'bg-purple-100 text-purple-800',
      days_since_last_visit: 'bg-yellow-100 text-yellow-800',
      days_of_inactivity: 'bg-orange-100 text-orange-800',
      new_customer_signup: 'bg-blue-100 text-blue-800',
      first_purchase: 'bg-green-100 text-green-800',
      after_appointment: 'bg-teal-100 text-teal-800',
      after_purchase: 'bg-emerald-100 text-emerald-800',
      loyalty_tier_upgrade: 'bg-amber-100 text-amber-800',
      points_expiring: 'bg-rose-100 text-rose-800',
      subscription_expiring: 'bg-indigo-100 text-indigo-800',
      abandoned_cart: 'bg-red-100 text-red-800',
      review_request: 'bg-cyan-100 text-cyan-800'
    };
    return badges[triggerType] || 'bg-gray-100 text-gray-800';
  };

  const formatTriggerType = (type) => {
    return type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  };

  return (
    <div className="space-y-6">
      <BackButton />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <HiOutlineLightningBolt className="text-primary-600" />
            Automated Campaigns
          </h1>
          <p className="text-gray-600 mt-1">Trigger-based automated marketing campaigns</p>
        </div>
        {selectedBusiness && (
          <button
            onClick={() => navigate(`/admin/campaigns/automated/create?businessId=${selectedBusiness}`)}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white hover:bg-primary-700"
          >
            <HiOutlinePlus className="w-5 h-5" />
            Create Automated Campaign
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white border border-gray-200 p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Business Selection */}
          <select
            value={selectedBusiness}
            onChange={(e) => setSelectedBusiness(e.target.value)}
            className="px-4 py-2 border border-gray-300"
          >
            <option value="">Select Business</option>
            {businesses.map(business => (
              <option key={business._id} value={business._id}>{business.name}</option>
            ))}
          </select>

          {/* Trigger Type Filter */}
          <select
            value={filterTriggerType}
            onChange={(e) => setFilterTriggerType(e.target.value)}
            className="px-4 py-2 border border-gray-300"
          >
            <option value="">All Trigger Types</option>
            <option value="customer_birthday">Birthday</option>
            <option value="customer_anniversary">Anniversary</option>
            <option value="days_since_last_visit">Days Since Visit</option>
            <option value="days_of_inactivity">Inactivity</option>
            <option value="new_customer_signup">New Signup</option>
            <option value="first_purchase">First Purchase</option>
            <option value="after_appointment">After Appointment</option>
            <option value="after_purchase">After Purchase</option>
            <option value="loyalty_tier_upgrade">Tier Upgrade</option>
            <option value="points_expiring">Points Expiring</option>
            <option value="subscription_expiring">Subscription Expiring</option>
            <option value="abandoned_cart">Abandoned Cart</option>
            <option value="review_request">Review Request</option>
          </select>

          {/* Active Filter */}
          <select
            value={filterActive}
            onChange={(e) => setFilterActive(e.target.value)}
            className="px-4 py-2 border border-gray-300"
          >
            <option value="">All Status</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>

          {/* Refresh */}
          <button
            onClick={fetchCampaigns}
            className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300"
          >
            <HiOutlineRefresh className="w-5 h-5" />
            Refresh
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search automated campaigns..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300"
          />
        </div>
      </div>

      {/* Campaigns List */}
      {!selectedBusiness ? (
        <div className="bg-white border border-gray-200 p-12 text-center">
          <HiOutlineLightningBolt className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Business</h3>
          <p className="text-gray-600">Please select a business to view its automated campaigns</p>
        </div>
      ) : loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      ) : campaigns.length === 0 ? (
        <div className="bg-white border border-gray-200 p-12 text-center">
          <HiOutlineLightningBolt className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Automated Campaigns</h3>
          <p className="text-gray-600 mb-6">Create your first automated campaign to get started</p>
          <button
            onClick={() => navigate(`/admin/campaigns/automated/create?businessId=${selectedBusiness}`)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white   hover:bg-primary-700"
          >
            <HiOutlinePlus className="w-5 h-5" />
            Create Automated Campaign
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {campaigns.map((campaign) => (
            <div key={campaign._id} className="bg-white border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">{campaign.name}</h3>
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">{campaign.description}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ml-2 ${campaign.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                  {campaign.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>

              <div className="mb-4">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTriggerBadge(campaign.triggerType)}`}>
                  {formatTriggerType(campaign.triggerType)}
                </span>
              </div>

              <div className="space-y-2 mb-4 py-4 border-t border-b border-gray-200">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Total Triggered:</span>
                  <span className="font-medium text-gray-900">{campaign.stats?.totalTriggered || 0}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Total Sent:</span>
                  <span className="font-medium text-gray-900">{campaign.stats?.totalSent || 0}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Success Rate:</span>
                  <span className="font-medium text-gray-900">{campaign.successRate || 0}%</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleTrigger(campaign._id)}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-primary-600 text-white rounded hover:bg-primary-700"
                  title="Trigger Now"
                >
                  <HiOutlinePlay className="w-4 h-4" />
                  Trigger
                </button>
                <button
                  onClick={() => navigate(`/admin/campaigns/automated/${campaign._id}/edit`)}
                  className="px-3 py-2 border border-gray-300 rounded hover:bg-gray-50"
                  title="Edit"
                >
                  <HiOutlinePencil className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleDelete(campaign._id)}
                  className="px-3 py-2 border border-red-300 text-red-600 rounded hover:bg-red-50"
                  title="Delete"
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
