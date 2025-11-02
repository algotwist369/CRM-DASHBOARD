import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaSync } from "react-icons/fa";
import adminService from "../../../services/admin/adminService";

const AdminDashboard = () => {
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
      const res = await adminService.getDashboard(currentPage, itemsPerPage);
      console.log(res);
      if (res.success) {
        setDashboard(res.data.data || res.data);  
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
  }, [currentPage, itemsPerPage]);

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
                Welcome back, {dashboard?.admin?.name}! 
                <span className="text-gray-500 underline"> • {dashboard?.admin?.companyName}</span>
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
        <StatCard title="Total Businesses" value={dashboard?.stats?.businesses?.total ?? 0} />
        <StatCard title="Managers" value={dashboard?.stats?.managers ?? 0} />
        <StatCard title="Staff" value={dashboard?.stats?.staff ?? 0} />
        <StatCard title="Revenue (30 days)" value={dashboard?.stats?.totalRevenue ?? "₹0"} />
        <StatCard title="Customers (30 days)" value={dashboard?.stats?.totalCustomers ?? 0} />
        <StatCard title="Recent Transactions" value={dashboard?.stats?.recentTransactions ?? 0} />
      </div>

      {/* Analytics and Business Type Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Business Type Breakdown */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">
            Businesses by Type
          </h2>
          <div className="grid grid-cols-3 text-center">
            <div>
              <p className="text-2xl font-bold text-gray-800">
                {dashboard?.stats?.businesses?.salon ?? 0}
              </p>
              <p className="text-gray-500">Salons</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">
                {dashboard?.stats?.businesses?.spa ?? 0}
              </p>
              <p className="text-gray-500">Spas</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">
                {dashboard?.stats?.businesses?.hotel ?? 0}
              </p>
              <p className="text-gray-500">Hotels</p>
            </div>
          </div>
        </div>

        {/* Analytics Summary */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">
            Performance Summary (30 Days)
          </h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Average Daily Revenue</span>
              <span className="font-semibold text-gray-800">
                {dashboard?.analytics?.averageDailyRevenue ? `₹${dashboard.analytics.averageDailyRevenue.toLocaleString()}` : "₹0"}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Average Daily Customers</span>
              <span className="font-semibold text-gray-800">
                {dashboard?.analytics?.averageDailyCustomers?.toFixed(1) ?? "0"}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Growth Rate</span>
              <span className={`font-semibold ${dashboard?.analytics?.growthRate > 0 ? 'text-green-600' : dashboard?.analytics?.growthRate < 0 ? 'text-red-600' : 'text-gray-800'}`}>
                {dashboard?.analytics?.growthRate?.toFixed(1) ?? "0"}%
              </span>
            </div>
            <div className="flex justify-between items-center border-t pt-3">
              <span className="text-gray-600">Net Profit</span>
              <span className="font-semibold text-gray-800">
                {dashboard?.analytics?.netProfit ? `₹${dashboard.analytics.netProfit.toLocaleString()}` : "₹0"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Businesses */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">
          Recent Businesses
        </h2>
        <div className="overflow-x-auto">
          <table className="min-w-full border-t border-gray-100">
            <thead>
              <tr className="text-left text-gray-600 text-sm border-b">
                <th className="py-2">Name</th>
                <th className="py-2">Type</th>
                <th className="py-2">Branch</th>
                <th className="py-2">Business Link</th>
                <th className="py-2 text-center">Managers</th>
                <th className="py-2 text-center">Staff</th>
              </tr>
            </thead>
            <tbody>
              {(dashboard?.recentBusinesses || []).map((b) => (
                <tr key={b.id} className="border-b hover:bg-gray-50">
                  <td className="py-2 font-medium text-gray-800">{b.name}</td>
                  <td className="py-2 capitalize">{b.type}</td>
                  <td className="py-2">{b.branch}</td>
                  <td className="py-2">
                    <code className="text-xs bg-gray-100 px-2 py-1 rounded font-mono text-gray-700">
                      {b.businessLink}
                    </code>
                  </td>
                  <td className="py-2 text-center">{b.managersCount}</td>
                  <td className="py-2 text-center">{b.staffCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Controls */}
        {dashboard?.pagination && (
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
            <div className="text-sm text-gray-600">
              Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, dashboard.pagination.total)} of {dashboard.pagination.total} businesses
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
                Page {currentPage} of {dashboard.pagination.totalPages}
              </span>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= dashboard.pagination.totalPages}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
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

export default AdminDashboard;
