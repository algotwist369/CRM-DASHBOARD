import React, { useState, useEffect } from 'react';
import { HiOutlineChartBar, HiOutlineTrendingUp, HiOutlineTrendingDown, HiOutlineRefresh } from 'react-icons/hi';

const StatsCard = ({ title, value, icon, color, trend, trendValue }) => (
  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className={`text-2xl font-bold mt-2 ${color}`}>{value}</p>
        {trend && (
          <div className={`flex items-center gap-1 mt-2 text-sm ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
            {trend === 'up' ? <HiOutlineTrendingUp /> : <HiOutlineTrendingDown />}
            <span>{trendValue}% from last month</span>
          </div>
        )}
      </div>
      <div className={`p-3 rounded-full ${color.replace('text', 'bg').replace('600', '100')}`}>
        {icon}
      </div>
    </div>
  </div>
);

const AdminAnalytics = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    revenue: { value: '₹4.2L', trend: 'up', trendValue: 12 },
    customers: { value: '245', trend: 'up', trendValue: 8 },
    appointments: { value: '1,234', trend: 'up', trendValue: 15 },
    reviews: { value: '4.5', trend: 'up', trendValue: 5 }
  });

  useEffect(() => {
    // TODO: Fetch analytics data
    setTimeout(() => setLoading(false), 500);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <HiOutlineChartBar className="text-primary-600" />
            Analytics Dashboard
          </h1>
          <p className="text-gray-600 mt-1">Track your business performance</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
          <HiOutlineRefresh className="w-5 h-5" />
          Refresh
        </button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard 
          title="Total Revenue" 
          value={stats.revenue.value} 
          icon={<HiOutlineChartBar className="w-6 h-6 text-blue-600" />} 
          color="text-blue-600" 
          trend={stats.revenue.trend}
          trendValue={stats.revenue.trendValue}
        />
        <StatsCard 
          title="Total Customers" 
          value={stats.customers.value} 
          icon={<HiOutlineChartBar className="w-6 h-6 text-green-600" />} 
          color="text-green-600" 
          trend={stats.customers.trend}
          trendValue={stats.customers.trendValue}
        />
        <StatsCard 
          title="Total Appointments" 
          value={stats.appointments.value} 
          icon={<HiOutlineChartBar className="w-6 h-6 text-purple-600" />} 
          color="text-purple-600" 
          trend={stats.appointments.trend}
          trendValue={stats.appointments.trendValue}
        />
        <StatsCard 
          title="Avg Rating" 
          value={stats.reviews.value} 
          icon={<HiOutlineChartBar className="w-6 h-6 text-yellow-600" />} 
          color="text-yellow-600" 
          trend={stats.reviews.trend}
          trendValue={stats.reviews.trendValue}
        />
      </div>

      {/* Charts Placeholder */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Revenue Trends</h2>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded">
            <p className="text-gray-500">Revenue Chart (Coming Soon)</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Customer Growth</h2>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded">
            <p className="text-gray-500">Customer Chart (Coming Soon)</p>
          </div>
        </div>
      </div>

      {/* Additional Stats */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Performance Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p className="text-sm text-gray-600">Appointment Completion Rate</p>
            <p className="text-2xl font-bold text-green-600 mt-2">94%</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Customer Retention Rate</p>
            <p className="text-2xl font-bold text-blue-600 mt-2">87%</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Average Order Value</p>
            <p className="text-2xl font-bold text-purple-600 mt-2">₹1,250</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;

