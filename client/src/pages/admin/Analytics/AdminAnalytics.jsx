import React, { useState, useEffect, useCallback } from 'react';
import { HiOutlineChartBar, HiOutlineTrendingUp, HiOutlineTrendingDown, HiOutlineRefresh } from 'react-icons/hi';
import adminService from '../../../services/admin/adminService';
import { toast } from 'react-hot-toast';

const StatsCard = ({ title, value, icon, color, trend, trendValue }) => (
  <div className="bg-white   border border-gray-200 p-6">
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
  const [businesses, setBusinesses] = useState([]);
  const [selectedBusinessId, setSelectedBusinessId] = useState(localStorage.getItem('selectedBusinessId') || '');
  const [overview, setOverview] = useState(null);
  const [revenueAnalytics, setRevenueAnalytics] = useState(null);
  const [customerAnalytics, setCustomerAnalytics] = useState(null);
  const [appointmentAnalytics, setAppointmentAnalytics] = useState(null);
  const [servicePerformance, setServicePerformance] = useState(null);

  // Fetch businesses
  useEffect(() => {
    const fetchBusinesses = async () => {
      try {
        const response = await adminService.getBusinesses();
        if (response.success) {
          setBusinesses(response.data || []);
          if (!selectedBusinessId && response.data && response.data.length > 0) {
            const firstBusinessId = response.data[0]._id;
            setSelectedBusinessId(firstBusinessId);
            localStorage.setItem('selectedBusinessId', firstBusinessId);
          }
        }
      } catch (error) {
        console.error('Failed to fetch businesses:', error);
      }
    };
    fetchBusinesses();
  }, []);

  const fetchAnalytics = useCallback(async () => {
    if (!selectedBusinessId || selectedBusinessId === 'undefined' || selectedBusinessId === 'null' || selectedBusinessId.trim() === '') {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const params = { businessId: selectedBusinessId };

      const [
        overviewRes,
        revenueRes,
        customerRes,
        appointmentRes,
        serviceRes
      ] = await Promise.all([
        adminService.getDashboardOverview(params),
        adminService.getRevenueAnalytics(params),
        adminService.getCustomerAnalytics(params),
        adminService.getAppointmentAnalytics(params),
        adminService.getServicePerformance(params)
      ]);

      if (overviewRes.success) {
        setOverview(overviewRes.data);
      }

      if (revenueRes.success) {
        setRevenueAnalytics(revenueRes.data);
      }

      if (customerRes.success) {
        setCustomerAnalytics(customerRes.data);
      }

      if (appointmentRes.success) {
        setAppointmentAnalytics(appointmentRes.data);
      }

      if (serviceRes.success) {
        setServicePerformance(serviceRes.data);
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
      toast.error('Failed to fetch analytics data');
    } finally {
      setLoading(false);
    }
  }, [selectedBusinessId]);

  useEffect(() => {
    if (selectedBusinessId) {
      fetchAnalytics();
    }
  }, [fetchAnalytics, selectedBusinessId]);

  const formatCurrency = (amount) => {
    if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(1)}L`;
    } else if (amount >= 1000) {
      return `₹${(amount / 1000).toFixed(1)}K`;
    }
    return `₹${amount.toLocaleString()}`;
  };

  const calculateTrend = (current, previous) => {
    if (!previous || previous === 0) return { trend: 'up', value: 100 };
    const change = ((current - previous) / previous) * 100;
    return {
      trend: change >= 0 ? 'up' : 'down',
      value: Math.abs(Math.round(change))
    };
  };

  // Calculate stats from overview data
  const stats = overview ? {
    revenue: {
      value: formatCurrency(overview.revenue?.total || 0),
      trend: overview.revenue?.last30Days > 0 ? 'up' : 'down',
      trendValue: calculateTrend(overview.revenue?.last30Days || 0, overview.revenue?.total - overview.revenue?.last30Days || 0).value
    },
    customers: {
      value: (overview.customers?.total || 0).toLocaleString(),
      trend: overview.customers?.new > 0 ? 'up' : 'down',
      trendValue: overview.customers?.growthRate || 0
    },
    appointments: {
      value: (overview.appointments?.total || 0).toLocaleString(),
      trend: overview.appointments?.completedLast30Days > 0 ? 'up' : 'down',
      trendValue: calculateTrend(overview.appointments?.completedLast30Days || 0, 0).value
    },
    reviews: {
      value: (overview.reviews?.averageRating || 0).toFixed(1),
      trend: 'up',
      trendValue: 0
    }
  } : {
    revenue: { value: '₹0', trend: 'up', trendValue: 0 },
    customers: { value: '0', trend: 'up', trendValue: 0 },
    appointments: { value: '0', trend: 'up', trendValue: 0 },
    reviews: { value: '0.0', trend: 'up', trendValue: 0 }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

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
        <button 
          onClick={fetchAnalytics}
          className="flex items-center gap-2 px-4 py-2 border border-gray-300  hover:bg-gray-50"
        >
          <HiOutlineRefresh className="w-5 h-5" />
          Refresh
        </button>
      </div>

      {/* Business Selector */}
      {businesses.length > 0 && (
        <div className="bg-blue-50 border border-blue-200  p-4">
          <div className="flex items-center gap-3">
            <HiOutlineChartBar className="w-5 h-5 text-blue-600" />
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Select Business</label>
              <select
                value={selectedBusinessId}
                onChange={(e) => {
                  setSelectedBusinessId(e.target.value);
                  localStorage.setItem('selectedBusinessId', e.target.value);
                }}
                className="w-full px-4 py-2 border border-gray-300  focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white"
              >
                {businesses.map((business) => (
                  <option key={business._id} value={business._id}>
                    {business.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard 
          key="revenue"
          title="Total Revenue" 
          value={stats.revenue.value} 
          icon={<HiOutlineChartBar className="w-6 h-6 text-blue-600" />} 
          color="text-blue-600" 
          trend={stats.revenue.trend}
          trendValue={stats.revenue.trendValue}
        />
        <StatsCard 
          key="customers"
          title="Total Customers" 
          value={stats.customers.value} 
          icon={<HiOutlineChartBar className="w-6 h-6 text-green-600" />} 
          color="text-green-600" 
          trend={stats.customers.trend}
          trendValue={stats.customers.trendValue}
        />
        <StatsCard 
          key="appointments"
          title="Total Appointments" 
          value={stats.appointments.value} 
          icon={<HiOutlineChartBar className="w-6 h-6 text-purple-600" />} 
          color="text-purple-600" 
          trend={stats.appointments.trend}
          trendValue={stats.appointments.trendValue}
        />
        <StatsCard 
          key="reviews"
          title="Avg Rating" 
          value={stats.reviews.value} 
          icon={<HiOutlineChartBar className="w-6 h-6 text-yellow-600" />} 
          color="text-yellow-600" 
          trend={stats.reviews.trend}
          trendValue={stats.reviews.trendValue}
        />
      </div>

      {/* Revenue Analytics */}
      {revenueAnalytics && revenueAnalytics.summary && (
        <div className="bg-white   border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Revenue Analytics</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <p className="text-sm text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-blue-600 mt-2">
                {formatCurrency(revenueAnalytics.summary.totalRevenue || 0)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Paid Revenue</p>
              <p className="text-2xl font-bold text-green-600 mt-2">
                {formatCurrency(revenueAnalytics.summary.paidRevenue || 0)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Pending Revenue</p>
              <p className="text-2xl font-bold text-yellow-600 mt-2">
                {formatCurrency(revenueAnalytics.summary.pendingRevenue || 0)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Avg Invoice Value</p>
              <p className="text-2xl font-bold text-purple-600 mt-2">
                {formatCurrency(revenueAnalytics.summary.averageInvoiceValue || 0)}
              </p>
            </div>
          </div>
          {revenueAnalytics.timeline && revenueAnalytics.timeline.length > 0 && (
            <div className="mt-6">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Revenue Timeline</h3>
              <div className="h-64 flex items-center justify-center bg-gray-50 rounded">
                <p className="text-gray-500">Chart visualization coming soon</p>
                <div className="ml-4 text-xs text-gray-400">
                  {revenueAnalytics.timeline.length} data points available
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Customer Analytics */}
      {customerAnalytics && (
        <div className="bg-white   border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Customer Analytics</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {customerAnalytics.totalCustomers !== undefined && (
              <div>
                <p className="text-sm text-gray-600">Total Customers</p>
                <p className="text-2xl font-bold text-blue-600 mt-2">
                  {customerAnalytics.totalCustomers?.toLocaleString() || 0}
                </p>
              </div>
            )}
            {customerAnalytics.newCustomers !== undefined && (
              <div>
                <p className="text-sm text-gray-600">New Customers (30 days)</p>
                <p className="text-2xl font-bold text-green-600 mt-2">
                  {customerAnalytics.newCustomers?.toLocaleString() || 0}
                </p>
              </div>
            )}
            {customerAnalytics.growthRate !== undefined && (
              <div>
                <p className="text-sm text-gray-600">Growth Rate</p>
                <p className="text-2xl font-bold text-purple-600 mt-2">
                  {customerAnalytics.growthRate?.toFixed(1) || 0}%
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Appointment Analytics */}
      {appointmentAnalytics && (
        <div className="bg-white   border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Appointment Analytics</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {overview?.appointments && (
              <>
                <div>
                  <p className="text-sm text-gray-600">Upcoming Appointments</p>
                  <p className="text-2xl font-bold text-blue-600 mt-2">
                    {overview.appointments.upcoming?.toLocaleString() || 0}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Completed (30 days)</p>
                  <p className="text-2xl font-bold text-green-600 mt-2">
                    {overview.appointments.completedLast30Days?.toLocaleString() || 0}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Completion Rate</p>
                  <p className="text-2xl font-bold text-purple-600 mt-2">
                    {overview.appointments.total > 0
                      ? Math.round((overview.appointments.completedLast30Days / overview.appointments.total) * 100)
                      : 0}%
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Service Performance */}
      {servicePerformance && servicePerformance.topServices && servicePerformance.topServices.length > 0 && (
        <div className="bg-white   border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Top Performing Services</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Service</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bookings</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Revenue</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Avg Rating</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {servicePerformance.topServices.slice(0, 5).map((service, index) => (
                  <tr key={service.id || service._id || `service-${index}`} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {service.name || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {service.bookings || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(service.revenue || 0)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {(service.rating || 0).toFixed(1)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Performance Overview */}
      {overview && (
        <div className="bg-white   border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Performance Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-gray-600">Appointment Completion Rate</p>
              <p className="text-2xl font-bold text-green-600 mt-2">
                {overview.appointments?.total > 0
                  ? Math.round((overview.appointments.completedLast30Days / overview.appointments.total) * 100)
                  : 0}%
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Customer Growth Rate</p>
              <p className="text-2xl font-bold text-blue-600 mt-2">
                {overview.customers?.growthRate || 0}%
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Average Invoice Value</p>
              <p className="text-2xl font-bold text-purple-600 mt-2">
                {revenueAnalytics?.summary?.averageInvoiceValue
                  ? formatCurrency(revenueAnalytics.summary.averageInvoiceValue)
                  : '₹0'}
              </p>
            </div>
            {overview.revenue?.pendingInvoices !== undefined && (
              <div>
                <p className="text-sm text-gray-600">Pending Invoices</p>
                <p className="text-2xl font-bold text-yellow-600 mt-2">
                  {overview.revenue.pendingInvoices?.toLocaleString() || 0}
                </p>
              </div>
            )}
            {overview.reviews?.totalReviews !== undefined && (
              <div>
                <p className="text-sm text-gray-600">Total Reviews</p>
                <p className="text-2xl font-bold text-indigo-600 mt-2">
                  {overview.reviews.totalReviews?.toLocaleString() || 0}
                </p>
              </div>
            )}
            {overview.reviews?.averageRating !== undefined && (
              <div>
                <p className="text-sm text-gray-600">Average Rating</p>
                <p className="text-2xl font-bold text-yellow-600 mt-2">
                  {overview.reviews.averageRating?.toFixed(1) || '0.0'}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAnalytics;

