import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  HiOutlineGift, HiOutlinePlus, HiOutlineSearch, HiOutlineRefresh,
  HiOutlinePencil, HiOutlineTrash, HiOutlineStar
} from 'react-icons/hi';
import { toast } from 'react-hot-toast';

const LoyaltyPlans = () => {
  const navigate = useNavigate();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchPlans = useCallback(async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual API call
      // const response = await adminService.getLoyaltyPlans({ search: searchTerm });
      
      // Temporary mock data
      setTimeout(() => {
        setPlans([
          {
            _id: '1',
            name: 'Bronze',
            tier: 'bronze',
            pointsRequired: 0,
            benefits: ['5% discount', 'Birthday rewards'],
            isActive: true,
            memberCount: 150
          },
          {
            _id: '2',
            name: 'Silver',
            tier: 'silver',
            pointsRequired: 500,
            benefits: ['10% discount', 'Priority booking', 'Birthday rewards'],
            isActive: true,
            memberCount: 85
          },
          {
            _id: '3',
            name: 'Gold',
            tier: 'gold',
            pointsRequired: 1000,
            benefits: ['15% discount', 'Priority booking', 'Free consultation'],
            isActive: true,
            memberCount: 42
          },
          {
            _id: '4',
            name: 'Platinum',
            tier: 'platinum',
            pointsRequired: 2000,
            benefits: ['20% discount', 'VIP treatment', 'Free upgrades'],
            isActive: true,
            memberCount: 18
          }
        ]);
        setLoading(false);
      }, 500);
    } catch (error) {
      console.error('Failed to fetch loyalty plans:', error);
      toast.error('Failed to fetch loyalty plans');
      setLoading(false);
    }
  }, [searchTerm]);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this loyalty plan?')) return;
    
    try {
      // TODO: Implement delete API call
      toast.success('Loyalty plan deleted successfully!');
      fetchPlans();
    } catch (error) {
      console.error('Failed to delete plan:', error);
      toast.error('Failed to delete plan');
    }
  };

  const getTierColor = (tier) => {
    const colors = {
      bronze: 'bg-orange-100 text-orange-800',
      silver: 'bg-gray-100 text-gray-800',
      gold: 'bg-yellow-100 text-yellow-800',
      platinum: 'bg-purple-100 text-purple-800'
    };
    return colors[tier] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <HiOutlineStar className="text-primary-600" />
            Membership Plans
          </h1>
          <p className="text-gray-600 mt-1">Manage loyalty membership tiers and benefits</p>
        </div>
        <button
          onClick={() => navigate('/admin/loyalty/plans/create')}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
        >
          <HiOutlinePlus className="w-5 h-5" />
          Create Plan
        </button>
      </div>

      {/* Search & Actions */}
      <div className="flex items-center gap-4">
        <div className="flex-1 relative">
          <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search plans..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
        <button
          onClick={fetchPlans}
          className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          <HiOutlineRefresh className="w-5 h-5" />
          Refresh
        </button>
      </div>

      {/* Plans Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      ) : plans.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <HiOutlineStar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Membership Plans</h3>
          <p className="text-gray-600 mb-6">Create your first membership plan to get started</p>
          <button
            onClick={() => navigate('/admin/loyalty/plans/create')}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            <HiOutlinePlus className="w-5 h-5" />
            Create Plan
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan) => (
            <div 
              key={plan._id} 
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                  <span className={`inline-block mt-2 px-2 py-1 rounded-full text-xs font-medium ${getTierColor(plan.tier)}`}>
                    {plan.tier}
                  </span>
                </div>
                <HiOutlineStar className="w-6 h-6 text-yellow-500" />
              </div>

              <div className="space-y-3 mb-4">
                <div>
                  <p className="text-sm text-gray-600">Points Required</p>
                  <p className="text-lg font-semibold text-gray-900">{plan.pointsRequired}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Members</p>
                  <p className="text-lg font-semibold text-gray-900">{plan.memberCount}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-2">Benefits</p>
                  <ul className="space-y-1">
                    {plan.benefits.slice(0, 3).map((benefit, index) => (
                      <li key={index} className="text-xs text-gray-700 flex items-center gap-1">
                        <span className="text-green-500">✓</span>
                        {benefit}
                      </li>
                    ))}
                    {plan.benefits.length > 3 && (
                      <li className="text-xs text-gray-500">+{plan.benefits.length - 3} more</li>
                    )}
                  </ul>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-4 border-t border-gray-200">
                <button
                  onClick={() => navigate(`/admin/loyalty/plans/${plan._id}/edit`)}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  <HiOutlinePencil className="w-4 h-4" />
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(plan._id)}
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

export default LoyaltyPlans;

