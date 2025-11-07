import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  HiOutlineUserGroup, HiOutlineSearch, HiOutlineRefresh,
  HiOutlineEye, HiOutlineBan, HiOutlineCheckCircle
} from 'react-icons/hi';
import { toast } from 'react-hot-toast';

const LoyaltySubscriptions = () => {
  const navigate = useNavigate();
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const fetchSubscriptions = useCallback(async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual API call
      // const response = await adminService.getLoyaltySubscriptions({ search: searchTerm, status: filterStatus });
      
      // Temporary mock data
      setTimeout(() => {
        setSubscriptions([
          {
            _id: '1',
            customer: { name: 'John Doe', email: 'john@example.com' },
            plan: { name: 'Gold', tier: 'gold' },
            status: 'active',
            startDate: '2024-01-15',
            expiryDate: '2025-01-15',
            pointsEarned: 1250,
            lastActivity: '2024-11-01'
          },
          {
            _id: '2',
            customer: { name: 'Jane Smith', email: 'jane@example.com' },
            plan: { name: 'Silver', tier: 'silver' },
            status: 'active',
            startDate: '2024-02-20',
            expiryDate: '2025-02-20',
            pointsEarned: 750,
            lastActivity: '2024-11-02'
          },
          {
            _id: '3',
            customer: { name: 'Mike Johnson', email: 'mike@example.com' },
            plan: { name: 'Platinum', tier: 'platinum' },
            status: 'active',
            startDate: '2024-03-10',
            expiryDate: '2025-03-10',
            pointsEarned: 2100,
            lastActivity: '2024-11-03'
          },
          {
            _id: '4',
            customer: { name: 'Sarah Williams', email: 'sarah@example.com' },
            plan: { name: 'Bronze', tier: 'bronze' },
            status: 'expired',
            startDate: '2023-06-01',
            expiryDate: '2024-06-01',
            pointsEarned: 350,
            lastActivity: '2024-05-28'
          }
        ]);
        setLoading(false);
      }, 500);
    } catch (error) {
      console.error('Failed to fetch subscriptions:', error);
      toast.error('Failed to fetch subscriptions');
      setLoading(false);
    }
  }, [searchTerm, filterStatus]);

  useEffect(() => {
    fetchSubscriptions();
  }, [fetchSubscriptions]);

  const handleCancelSubscription = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this subscription?')) return;
    
    try {
      // TODO: Implement cancel API call
      toast.success('Subscription cancelled successfully!');
      fetchSubscriptions();
    } catch (error) {
      console.error('Failed to cancel subscription:', error);
      toast.error('Failed to cancel subscription');
    }
  };

  const handleRenewSubscription = async (id) => {
    try {
      // TODO: Implement renew API call
      toast.success('Subscription renewed successfully!');
      fetchSubscriptions();
    } catch (error) {
      console.error('Failed to renew subscription:', error);
      toast.error('Failed to renew subscription');
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      active: 'bg-green-100 text-green-800',
      expired: 'bg-red-100 text-red-800',
      cancelled: 'bg-gray-100 text-gray-800',
      pending: 'bg-yellow-100 text-yellow-800'
    };
    return badges[status] || 'bg-gray-100 text-gray-800';
  };

  const getTierBadge = (tier) => {
    const badges = {
      bronze: 'bg-orange-100 text-orange-800',
      silver: 'bg-gray-100 text-gray-800',
      gold: 'bg-yellow-100 text-yellow-800',
      platinum: 'bg-purple-100 text-purple-800'
    };
    return badges[tier] || 'bg-gray-100 text-gray-800';
  };

  const filteredSubscriptions = subscriptions.filter(sub => 
    filterStatus === 'all' || sub.status === filterStatus
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <HiOutlineUserGroup className="text-primary-600" />
            Loyalty Subscriptions
          </h1>
          <p className="text-gray-600 mt-1">Manage customer loyalty memberships</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="flex-1 relative">
          <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by customer name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="expired">Expired</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <button
          onClick={fetchSubscriptions}
          className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          <HiOutlineRefresh className="w-5 h-5" />
          Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <p className="text-sm text-gray-600">Total Subscriptions</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">{subscriptions.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <p className="text-sm text-gray-600">Active</p>
          <p className="text-2xl font-bold text-green-600 mt-2">
            {subscriptions.filter(s => s.status === 'active').length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <p className="text-sm text-gray-600">Expired</p>
          <p className="text-2xl font-bold text-red-600 mt-2">
            {subscriptions.filter(s => s.status === 'expired').length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <p className="text-sm text-gray-600">Total Points</p>
          <p className="text-2xl font-bold text-primary-600 mt-2">
            {subscriptions.reduce((sum, s) => sum + s.pointsEarned, 0)}
          </p>
        </div>
      </div>

      {/* Subscriptions Table */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      ) : filteredSubscriptions.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <HiOutlineUserGroup className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Subscriptions Found</h3>
          <p className="text-gray-600">No subscriptions match your current filters</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Plan
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Points
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Expiry Date
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredSubscriptions.map((subscription) => (
                  <tr key={subscription._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="font-medium text-gray-900">{subscription.customer.name}</div>
                        <div className="text-sm text-gray-500">{subscription.customer.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTierBadge(subscription.plan.tier)}`}>
                        {subscription.plan.name}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(subscription.status)}`}>
                        {subscription.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {subscription.pointsEarned}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(subscription.expiryDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => navigate(`/admin/customers/${subscription.customer._id}`)}
                          className="text-blue-600 hover:text-blue-900"
                          title="View Customer"
                        >
                          <HiOutlineEye className="w-5 h-5" />
                        </button>
                        {subscription.status === 'expired' && (
                          <button
                            onClick={() => handleRenewSubscription(subscription._id)}
                            className="text-green-600 hover:text-green-900"
                            title="Renew"
                          >
                            <HiOutlineCheckCircle className="w-5 h-5" />
                          </button>
                        )}
                        {subscription.status === 'active' && (
                          <button
                            onClick={() => handleCancelSubscription(subscription._id)}
                            className="text-red-600 hover:text-red-900"
                            title="Cancel"
                          >
                            <HiOutlineBan className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoyaltySubscriptions;

