import React, { useState, useEffect, useCallback, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiOutlineGift, HiOutlinePlus, HiOutlineSearch, HiOutlineRefresh, HiOutlineEye, HiOutlinePencil, HiOutlineTrash } from 'react-icons/hi';

const StatsCard = memo(({ title, value, icon, color }) => (
  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
    <div className="flex items-center justify-between">
      <div><p className="text-sm font-medium text-gray-600">{title}</p><p className={`text-2xl font-bold mt-2 ${color}`}>{value}</p></div>
      <div className={`p-3 rounded-full ${color.replace('text', 'bg').replace('600', '100')}`}>{icon}</div>
    </div>
  </div>
));

const RewardRow = memo(({ reward, onView, onEdit, onDelete }) => (
  <tr className="hover:bg-gray-50">
    <td className="px-6 py-4 whitespace-nowrap"><div className="text-sm font-medium text-gray-900">{reward.name}</div><div className="text-sm text-gray-500">{reward.description}</div></td>
    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{reward.pointsRequired} pts</td>
    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">₹{reward.value}</td>
    <td className="px-6 py-4 whitespace-nowrap"><span className={`px-2 py-1 text-xs rounded-full ${reward.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{reward.isActive ? 'Active' : 'Inactive'}</span></td>
    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{reward.redeemedCount}</td>
    <td className="px-6 py-4 whitespace-nowrap text-right">
      <button onClick={() => onView(reward._id)} className="text-blue-600 hover:text-blue-900 mr-2"><HiOutlineEye className="w-5 h-5" /></button>
      <button onClick={() => onEdit(reward._id)} className="text-green-600 hover:text-green-900 mr-2"><HiOutlinePencil className="w-5 h-5" /></button>
      <button onClick={() => onDelete(reward._id)} className="text-red-600 hover:text-red-900"><HiOutlineTrash className="w-5 h-5" /></button>
    </td>
  </tr>
));

const LoyaltyRewards = () => {
  const navigate = useNavigate();
  const [rewards, setRewards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, active: 0, redeemed: 0, totalValue: 0 });

  const fetchRewards = useCallback(async () => {
    setLoading(true);
    setTimeout(() => {
      setRewards([
        { _id: '1', name: '10% Discount', description: 'Get 10% off on next visit', pointsRequired: 500, value: 200, isActive: true, redeemedCount: 45 },
        { _id: '2', name: 'Free Service', description: 'One free haircut', pointsRequired: 1000, value: 500, isActive: true, redeemedCount: 28 },
      ]);
      setStats({ total: 12, active: 10, redeemed: 145, totalValue: 52000 });
      setLoading(false);
    }, 500);
  }, []);

  useEffect(() => {
    fetchRewards();
  }, [fetchRewards]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2"><HiOutlineGift className="text-primary-600" />Loyalty Rewards</h1><p className="text-gray-600 mt-1">Manage your loyalty rewards catalog</p></div>
        <button onClick={() => navigate('/admin/loyalty/rewards/create')} className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"><HiOutlinePlus className="w-5 h-5" />Add Reward</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatsCard title="Total Rewards" value={stats.total} icon={<HiOutlineGift className="w-6 h-6 text-blue-600" />} color="text-blue-600" />
        <StatsCard title="Active" value={stats.active} icon={<HiOutlineGift className="w-6 h-6 text-green-600" />} color="text-green-600" />
        <StatsCard title="Redeemed" value={stats.redeemed} icon={<HiOutlineGift className="w-6 h-6 text-purple-600" />} color="text-purple-600" />
        <StatsCard title="Total Value" value={`₹${(stats.totalValue/1000).toFixed(1)}K`} icon={<HiOutlineGift className="w-6 h-6 text-yellow-600" />} color="text-yellow-600" />
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reward</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Points</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Value</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Redeemed</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr><td colSpan="6" className="px-6 py-12 text-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div></td></tr>
              ) : (
                rewards.map((reward) => <RewardRow key={reward._id} reward={reward} onView={(id) => navigate(`/admin/loyalty/rewards/${id}`)} onEdit={(id) => navigate(`/admin/loyalty/rewards/${id}/edit`)} onDelete={(id) => console.log('Delete:', id)} />)
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default LoyaltyRewards;

