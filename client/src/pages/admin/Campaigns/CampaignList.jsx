import React, { useState, useEffect, useCallback, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  HiOutlineMail, HiOutlinePlus, HiOutlineSearch, HiOutlineRefresh, HiOutlineEye,
  HiOutlineOfficeBuilding, HiOutlineChartBar, HiOutlineCursorClick,
  HiOutlineCheckCircle, HiOutlineCurrencyDollar, HiOutlineTrendingUp
} from 'react-icons/hi';
import adminService from '../../../services/admin/adminService';
import { toast } from 'react-hot-toast';
import BackButton from '../../../components/common/Button/BackButton';

const StatsCard = memo(({ title, value, icon, color }) => (
  <div className="bg-white border border-gray-200 p-4">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-xs font-medium text-gray-600 uppercase tracking-wider">{title}</p>
        <p className={`text-xl font-bold mt-1 ${color}`}>{value}</p>
      </div>
      <div className={`p-2 rounded-full ${color.replace('text', 'bg').replace('600', '100')}`}>
        {React.cloneElement(icon, { className: `w-5 h-5 ${color}` })}
      </div>
    </div>
  </div>
));

const CampaignRow = memo(({ campaign, onView }) => {
  const statusColors = { draft: 'bg-gray-100 text-gray-800', scheduled: 'bg-blue-100 text-blue-800', active: 'bg-green-100 text-green-800', completed: 'bg-purple-100 text-purple-800', cancelled: 'bg-red-100 text-red-800' };

  return (
    <tr className="hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap"><div className="text-sm font-medium text-gray-900">{campaign.name}</div><div className="text-sm text-gray-500">{campaign.type}</div></td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{campaign.targetAudience}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{campaign.sent}/{campaign.total}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{campaign.openRate}%</td>
      <td className="px-6 py-4 whitespace-nowrap"><span className={`px-2 py-1 text-xs rounded-full ${statusColors[campaign.status]}`}>{campaign.status}</span></td>
      <td className="px-6 py-4 whitespace-nowrap text-right"><button onClick={() => onView(campaign._id)} className="text-blue-600 hover:text-blue-900"><HiOutlineEye className="w-5 h-5" /></button></td>
    </tr>
  );
});

const CampaignList = () => {
  const navigate = useNavigate();
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState({
    totalSent: 0,
    totalDelivered: 0,
    totalOpened: 0,
    totalClicked: 0,
    totalConverted: 0,
    totalRevenue: 0,
    totalCost: 0,
    deliveryRate: 0,
    openRate: 0,
    clickRate: 0,
    conversionRate: 0,
    roi: 0
  });
  const [businesses, setBusinesses] = useState([]);
  // Helper to validate ObjectId
  const isValidObjectId = (id) => /^[0-9a-fA-F]{24}$/.test(id);

  // Helper to clean businessId from localStorage
  const getCleanBusinessId = () => {
    const stored = localStorage.getItem('selectedBusinessId')
    // Allow empty string for "All Businesses"
    if (!stored || (!isValidObjectId(stored) && stored !== '')) {
      return ''
    }
    return stored
  }

  const [selectedBusinessId, setSelectedBusinessId] = useState(getCleanBusinessId());
  const [loadingBusinesses, setLoadingBusinesses] = useState(true);

  // Fetch businesses
  const fetchBusinesses = useCallback(async () => {
    try {
      setLoadingBusinesses(true);
      const response = await adminService.getBusinesses();
      if (response.success) {
        const businessesData = response.data || [];
        // Deduplicate businesses
        const uniqueBusinesses = Array.from(new Map(businessesData.map(item => [item._id, item])).values());
        setBusinesses(uniqueBusinesses);
      } else {
        toast.error(response.error || 'Failed to fetch businesses');
      }
    } catch (error) {
      console.error('Failed to fetch businesses:', error);
      toast.error('Failed to fetch businesses');
    } finally {
      setLoadingBusinesses(false);
    }
  }, []);

  const fetchCampaigns = useCallback(async () => {
    // Allow empty businessId for "All Businesses"
    if (selectedBusinessId && !isValidObjectId(selectedBusinessId)) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const [campaignsRes, statsRes] = await Promise.all([
        adminService.getCampaigns({ search: searchTerm, businessId: selectedBusinessId }),
        adminService.getCampaignStats({ businessId: selectedBusinessId })
      ]);

      if (campaignsRes.success) {
        // Deduplicate campaigns
        const uniqueCampaigns = Array.from(new Map((campaignsRes.data || []).map(item => [item._id, item])).values());
        setCampaigns(uniqueCampaigns);
      } else {
        toast.error(campaignsRes.error || 'Failed to fetch campaigns');
      }

      if (statsRes.success) {
        setStats(statsRes.data || {
          totalSent: 0,
          totalDelivered: 0,
          totalOpened: 0,
          totalClicked: 0,
          totalConverted: 0,
          totalRevenue: 0,
          totalCost: 0,
          deliveryRate: 0,
          openRate: 0,
          clickRate: 0,
          conversionRate: 0,
          roi: 0
        });
      }
    } catch (error) {
      console.error('Failed to fetch campaigns:', error);
      toast.error('Failed to fetch campaigns');
    } finally {
      setLoading(false);
    }
  }, [searchTerm, selectedBusinessId]);

  useEffect(() => {
    fetchBusinesses();
  }, [fetchBusinesses]);

  useEffect(() => {
    // Always fetch campaigns, even if selectedBusinessId is empty (All Businesses)
    fetchCampaigns();
  }, [fetchCampaigns, selectedBusinessId]);

  const handleBusinessChange = (businessId) => {
    setSelectedBusinessId(businessId);
    if (businessId) {
      localStorage.setItem('selectedBusinessId', businessId);
    } else {
      localStorage.removeItem('selectedBusinessId');
    }
  };

  if (loadingBusinesses) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (businesses.length === 0) {
    return (
      <div className="bg-white   border border-gray-200 p-12 text-center">
        <HiOutlineOfficeBuilding className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Businesses Found</h3>
        <p className="text-gray-600 mb-6">Create a business first to manage campaigns</p>
        <button
          onClick={() => navigate('/admin/businesses')}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white  hover:bg-primary-700"
        >
          <HiOutlinePlus className="w-5 h-5" />
          Go to Businesses
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <BackButton />
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2"><HiOutlineMail className="text-primary-600" />Marketing Campaigns</h1><p className="text-gray-600 mt-1">Manage your marketing campaigns</p></div>
        <button onClick={() => navigate('/admin/campaigns/create')} className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white  hover:bg-primary-700"><HiOutlinePlus className="w-5 h-5" />Create Campaign</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Row 1: Delivery Stats */}
        <StatsCard title="Total Sent" value={stats.totalSent} icon={<HiOutlineMail />} color="text-blue-600" />
        <StatsCard title="Delivered" value={stats.totalDelivered} icon={<HiOutlineCheckCircle />} color="text-green-600" />
        <StatsCard title="Delivery Rate" value={`${stats.deliveryRate}%`} icon={<HiOutlineChartBar />} color="text-indigo-600" />
        <StatsCard title="Open Rate" value={`${stats.openRate}%`} icon={<HiOutlineEye />} color="text-yellow-600" />

        {/* Row 2: Engagement Stats */}
        <StatsCard title="Opened" value={stats.totalOpened} icon={<HiOutlineEye />} color="text-yellow-600" />
        <StatsCard title="Clicked" value={stats.totalClicked} icon={<HiOutlineCursorClick />} color="text-purple-600" />
        <StatsCard title="Click Rate" value={`${stats.clickRate}%`} icon={<HiOutlineCursorClick />} color="text-purple-600" />
        <StatsCard title="Converted" value={stats.totalConverted} icon={<HiOutlineCheckCircle />} color="text-teal-600" />

        {/* Row 3: Financial Stats */}
        <StatsCard title="Conversion Rate" value={`${stats.conversionRate}%`} icon={<HiOutlineCheckCircle />} color="text-teal-600" />
        <StatsCard title="Revenue" value={`₹${stats.totalRevenue}`} icon={<HiOutlineCurrencyDollar />} color="text-green-600" />
        <StatsCard title="Cost" value={`₹${stats.totalCost}`} icon={<HiOutlineCurrencyDollar />} color="text-red-600" />
        <StatsCard title="ROI" value={`${stats.roi}%`} icon={<HiOutlineTrendingUp />} color="text-blue-600" />
      </div>

      {/* Business Selector */}
      <div className="bg-blue-50 border border-blue-200  p-4">
        <div className="flex items-center gap-3">
          <HiOutlineOfficeBuilding className="w-5 h-5 text-blue-600" />
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Business</label>
            <select
              value={selectedBusinessId}
              onChange={(e) => handleBusinessChange(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300  focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white"
            >
              <option value="">All Businesses</option>
              {businesses.map((business) => (
                <option key={business._id} value={business._id}>
                  {business.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex-1 relative">
          <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search campaigns..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300  focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
        <button
          onClick={fetchCampaigns}
          className="flex items-center gap-2 px-4 py-2 border border-gray-300  hover:bg-gray-50"
        >
          <HiOutlineRefresh className="w-5 h-5" />
          Refresh
        </button>
      </div>

      <div className="bg-white   border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Campaign</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Audience</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sent</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Open Rate</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr><td colSpan="6" className="px-6 py-12 text-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div></td></tr>
              ) : campaigns.length === 0 ? (
                <tr><td colSpan="6" className="px-6 py-12 text-center text-gray-500">No campaigns found</td></tr>
              ) : (
                campaigns.map((campaign, index) => (
                  <CampaignRow
                    key={campaign._id || campaign.id || `campaign-${index}`}
                    campaign={campaign}
                    onView={(id) => navigate(`/admin/campaigns/${id}`)}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CampaignList;
