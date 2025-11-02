import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaSync } from "react-icons/fa";
import managerService from "../../../services/manager/managerService";

const ManagerDashboard = () => {
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  
  // Initialize page from URL params
  const getInitialPage = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const pageParam = urlParams.get('page');
    if (pageParam) {
      const pageNum = parseInt(pageParam);
      if (pageNum > 0) return pageNum;
    }
    return 1;
  };
  
  const [currentPage, setCurrentPage] = useState(getInitialPage);
  const [itemsPerPage] = useState(5);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await managerService.getDashboard();
      console.log(res);
      if (res.success) {
        const dashboardData = res.data.data || res.data;
        setDashboard(dashboardData);
      } else {
        setError(res.error || "Failed to load dashboard");
      }
    } catch (e) {
      setError("Failed to load dashboard");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    // Update URL without causing navigation
    window.history.pushState({ page: newPage }, '', `?page=${newPage}`);
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchDashboard();
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  // Format currency
  const formatCurrency = (amount) => {
    if (!amount) return "₹0";
    return `₹${parseInt(amount).toLocaleString('en-IN')}`;
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  // Format time
  const formatTime = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Calculate analytics from stats
  const calculateAnalytics = () => {
    if (!dashboard?.stats) return null;

    const stats = dashboard.stats;
    const daysInMonth = new Date().getDate(); // Current day of month

    return {
      averageDailyRevenue: stats.monthlyRevenue / Math.max(daysInMonth, 1),
      averageDailyCustomers: stats.monthlyCustomers / Math.max(daysInMonth, 1),
      // Simple growth calculation (could be improved with historical data)
      growthRate: 0, // Placeholder - would need historical data
      netProfit: stats.monthlyRevenue // Simplified - would need expense data
    };
  };

  const analytics = calculateAnalytics();

  // Paginate recent transactions
  const paginatedTransactions = () => {
    if (!dashboard?.recentTransactions) return [];
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return dashboard.recentTransactions.slice(startIndex, endIndex);
  };

  const totalTransactions = dashboard?.recentTransactions?.length || 0;
  const totalPages = Math.ceil(totalTransactions / itemsPerPage);

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen text-gray-600">
        Loading dashboard...
      </div>
    );
  if (error) {
    return (
      <div className="p-6 text-red-600">{error}</div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen text-gray-800">
      {/* Welcome Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={handleGoBack}
              className="p-2 rounded-lg hover:bg-gray-200 transition-colors"
              title="Go Back"
            >
              <FaArrowLeft className="text-gray-700 text-xl" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600 mt-2">
                Welcome back, {dashboard?.manager?.name}! 
                <span className="text-gray-500 underline"> • {dashboard?.business?.name}</span>
              </p>
            </div>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Refresh Dashboard"
          >
            <FaSync className={`text-gray-700 ${refreshing ? 'animate-spin' : ''}`} />
            <span className="text-sm font-medium text-gray-700">Refresh</span>
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <StatCard title="Total Staff" value={dashboard?.stats?.staffCount ?? 0} />
        <StatCard title="Today's Revenue" value={formatCurrency(dashboard?.stats?.todayRevenue)} />
        <StatCard title="Today's Customers" value={dashboard?.stats?.todayCustomers ?? 0} />
        <StatCard title="Monthly Revenue" value={formatCurrency(dashboard?.stats?.monthlyRevenue)} />
        <StatCard title="Monthly Customers" value={dashboard?.stats?.monthlyCustomers ?? 0} />
        <StatCard title="Today's Transactions" value={dashboard?.stats?.totalTransactions ?? 0} />
      </div>

      {/* Business Info and Analytics Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Business Information */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">
            Business Information
          </h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Business Name</span>
              <span className="font-semibold text-gray-800">
                {dashboard?.business?.name || '-'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Type</span>
              <span className="font-semibold text-gray-800 capitalize">
                {dashboard?.business?.type || '-'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Branch</span>
              <span className="font-semibold text-gray-800">
                {dashboard?.business?.branch || '-'}
              </span>
            </div>
            <div className="flex justify-between items-start border-t pt-3">
              <span className="text-gray-600">Address</span>
              <span className="font-semibold text-gray-800 text-right">
                {dashboard?.business?.address || '-'}
              </span>
            </div>
          </div>
        </div>

        {/* Analytics Summary */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">
            Performance Summary (This Month)
          </h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Average Daily Revenue</span>
              <span className="font-semibold text-gray-800">
                {analytics?.averageDailyRevenue ? formatCurrency(analytics.averageDailyRevenue) : "₹0"}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Average Daily Customers</span>
              <span className="font-semibold text-gray-800">
                {analytics?.averageDailyCustomers?.toFixed(1) ?? "0"}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Growth Rate</span>
              <span className={`font-semibold ${analytics?.growthRate > 0 ? 'text-green-600' : analytics?.growthRate < 0 ? 'text-red-600' : 'text-gray-800'}`}>
                {analytics?.growthRate?.toFixed(1) ?? "0"}%
              </span>
            </div>
            <div className="flex justify-between items-center border-t pt-3">
              <span className="text-gray-600">Total Monthly Revenue</span>
              <span className="font-semibold text-gray-800">
                {formatCurrency(dashboard?.stats?.monthlyRevenue)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">
          Recent Transactions
        </h2>
        {dashboard?.recentTransactions && dashboard.recentTransactions.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full border-t border-gray-100">
                <thead>
                  <tr className="text-left text-gray-600 text-sm border-b">
                    <th className="py-2">Customer</th>
                    <th className="py-2">Service</th>
                    <th className="py-2">Amount</th>
                    <th className="py-2">Date</th>
                    <th className="py-2">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedTransactions().map((t) => (
                    <tr key={t.id} className="border-b hover:bg-gray-50">
                      <td className="py-2 font-medium text-gray-800">{t.customerName || '-'}</td>
                      <td className="py-2 text-gray-700">{t.serviceName || '-'}</td>
                      <td className="py-2 font-semibold text-gray-800">
                        {formatCurrency(t.finalPrice)}
                      </td>
                      <td className="py-2 text-gray-600">{formatDate(t.transactionDate)}</td>
                      <td className="py-2 text-gray-600">{formatTime(t.transactionDate)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Pagination Controls */}
            {totalTransactions > itemsPerPage && (
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
                <div className="text-sm text-gray-600">
                  Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalTransactions)} of {totalTransactions} transactions
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handlePageChange(Math.max(currentPage - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <span className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-50 border border-gray-300 rounded-md">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage >= totalPages}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-8 text-gray-500">
            No transactions found for today
          </div>
        )}
      </div>
    </div>
  );
};

// Small Reusable Stat Card
const StatCard = ({ title, value }) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 text-center hover:shadow-md transition">
    <h3 className="text-gray-500 text-sm">{title}</h3>
    <p className="text-2xl font-semibold text-gray-800 mt-2">{value}</p>
  </div>
);

export default ManagerDashboard;