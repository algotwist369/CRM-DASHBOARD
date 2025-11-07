import React, { useState, useEffect, useCallback, useMemo, memo } from "react";
import { useNavigate } from "react-router-dom";
import { 
  FaArrowLeft,
  FaUsers,
  FaMoneyBillWave,
  FaChartLine,
  FaExchangeAlt,
  FaBuilding,
  FaCalendarDay,
  FaCalendarAlt
} from "react-icons/fa";
import { HiRefresh } from "react-icons/hi";
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

  const fetchDashboard = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    fetchDashboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePageChange = useCallback((newPage) => {
    setCurrentPage(newPage);
    // Update URL without causing navigation
    window.history.pushState({ page: newPage }, '', `?page=${newPage}`);
  }, []);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    fetchDashboard();
  }, [fetchDashboard]);

  const handleGoBack = useCallback(() => {
    navigate(-1);
  }, [navigate]);

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

  // Memoized analytics calculation
  const analytics = useMemo(() => {
    if (!dashboard?.stats) return null;

    const stats = dashboard.stats;
    const daysInMonth = new Date().getDate(); // Current day of month

    return {
      averageDailyRevenue: stats.monthlyRevenue / Math.max(daysInMonth, 1),
      averageDailyCustomers: stats.monthlyCustomers / Math.max(daysInMonth, 1),
      growthRate: 0, // Placeholder - would need historical data
      netProfit: stats.monthlyRevenue // Simplified - would need expense data
    };
  }, [dashboard?.stats]);

  // Memoized paginated transactions
  const paginatedTransactions = useMemo(() => {
    if (!dashboard?.recentTransactions) return [];
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return dashboard.recentTransactions.slice(startIndex, endIndex);
  }, [dashboard?.recentTransactions, currentPage, itemsPerPage]);

  const totalTransactions = dashboard?.recentTransactions?.length || 0;
  const totalPages = Math.ceil(totalTransactions / itemsPerPage);

  // Memoized stat cards data
  const statCards = useMemo(() => [
    { icon: FaUsers, title: "Total Staff", value: dashboard?.stats?.staffCount ?? 0, iconBg: "bg-blue-100", iconColor: "text-blue-600" },
    { icon: FaMoneyBillWave, title: "Today's Revenue", value: formatCurrency(dashboard?.stats?.todayRevenue), iconBg: "bg-green-100", iconColor: "text-green-600" },
    { icon: FaChartLine, title: "Today's Customers", value: dashboard?.stats?.todayCustomers ?? 0, iconBg: "bg-purple-100", iconColor: "text-purple-600" },
    { icon: FaCalendarAlt, title: "Monthly Revenue", value: formatCurrency(dashboard?.stats?.monthlyRevenue), iconBg: "bg-emerald-100", iconColor: "text-emerald-600" },
    { icon: FaCalendarDay, title: "Monthly Customers", value: dashboard?.stats?.monthlyCustomers ?? 0, iconBg: "bg-orange-100", iconColor: "text-orange-600" },
    { icon: FaExchangeAlt, title: "Today's Transactions", value: dashboard?.stats?.totalTransactions ?? 0, iconBg: "bg-pink-100", iconColor: "text-pink-600" }
  ], [dashboard?.stats]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-4 sm:mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <button
              onClick={handleGoBack}
              className="p-2 rounded-lg bg-white border border-gray-200 hover:bg-gray-100 transition-colors"
              title="Go Back"
            >
              <FaArrowLeft className="text-gray-700" />
            </button>
            <div>
              <h1 className="text-xl sm:text-2xl font-semibold text-gray-800">Manager Dashboard</h1>
              <p className="text-xs sm:text-sm text-gray-600 mt-0.5">
                Welcome, <span className="font-medium">{dashboard?.manager?.name}</span> • {dashboard?.business?.name}
              </p>
            </div>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50 text-sm font-medium"
            title="Refresh Dashboard"
          >
            <HiRefresh className={`text-gray-700 ${refreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
        {statCards.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      {/* Business Info and Analytics Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
        {/* Business Information */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <FaBuilding className="text-white text-sm" />
            </div>
            <h2 className="text-base sm:text-lg font-semibold text-gray-800">Business Information</h2>
          </div>
          <div className="space-y-2">
            <InfoRow label="Business Name" value={dashboard?.business?.name || '—'} />
            <InfoRow label="Type" value={dashboard?.business?.type ? dashboard.business.type.charAt(0).toUpperCase() + dashboard.business.type.slice(1) : '—'} />
            <InfoRow label="Branch" value={dashboard?.business?.branch || '—'} />
            <InfoRow label="Address" value={dashboard?.business?.address || '—'} isBorder />
          </div>
        </div>

        {/* Analytics Summary */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <FaChartLine className="text-white text-sm" />
            </div>
            <h2 className="text-base sm:text-lg font-semibold text-gray-800">Performance Summary</h2>
          </div>
          <div className="space-y-2">
            <InfoRow 
              label="Avg Daily Revenue" 
              value={analytics?.averageDailyRevenue ? formatCurrency(analytics.averageDailyRevenue) : "₹0"} 
            />
            <InfoRow 
              label="Avg Daily Customers" 
              value={analytics?.averageDailyCustomers?.toFixed(1) ?? "0"} 
            />
            <InfoRow 
              label="Growth Rate" 
              value={`${analytics?.growthRate?.toFixed(1) ?? "0"}%`} 
            />
            <InfoRow 
              label="Total Monthly Revenue" 
              value={formatCurrency(dashboard?.stats?.monthlyRevenue)} 
              isBorder 
            />
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
            <FaExchangeAlt className="text-white text-sm" />
          </div>
          <h2 className="text-base sm:text-lg font-semibold text-gray-800">Recent Transactions</h2>
        </div>
        
        {dashboard?.recentTransactions && dashboard.recentTransactions.length > 0 ? (
          <>
            <div className="overflow-x-auto -mx-4 sm:mx-0">
              <table className="min-w-full">
                <thead className="bg-gray-50 border-y border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Customer</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Service</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Amount</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedTransactions.map((t) => (
                    <TransactionRow
                      key={t.id}
                      transaction={t}
                      formatCurrency={formatCurrency}
                      formatDate={formatDate}
                      formatTime={formatTime}
                    />
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Pagination Controls */}
            {totalTransactions > itemsPerPage && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-4 pt-4 border-t border-gray-200">
                <div className="text-xs sm:text-sm text-gray-600">
                  Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalTransactions)} of {totalTransactions} transactions
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handlePageChange(Math.max(currentPage - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Previous
                  </button>
                  <span className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-gray-700 bg-gray-100 border border-gray-200 rounded-lg">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage >= totalPages}
                    className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-4xl mb-3">📊</p>
            <p className="text-sm text-gray-500">No transactions found</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Simple Stat Card Component
const StatCard = memo(({ icon: Icon, title, value, iconBg, iconColor }) => (
  <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-5">
    <div className="flex items-center gap-3 sm:gap-4">
      <div className={`${iconBg} p-2 sm:p-3 rounded-lg flex-shrink-0`}>
        <Icon className={`${iconColor} text-xl sm:text-2xl`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs sm:text-sm text-gray-600 mb-0.5 truncate">{title}</p>
        <p className="text-lg sm:text-xl font-semibold text-gray-800 truncate">{value}</p>
      </div>
    </div>
  </div>
));

// Simple Info Row Component
const InfoRow = memo(({ label, value, isBorder }) => (
  <div className={`flex justify-between items-center py-2 ${isBorder ? 'border-t border-gray-100 pt-3' : ''}`}>
    <span className="text-sm text-gray-600">{label}</span>
    <span className="text-sm font-medium text-gray-800">{value}</span>
  </div>
));

// Simple Transaction Row Component
const TransactionRow = memo(({ transaction, formatCurrency, formatDate, formatTime }) => (
  <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
    <td className="px-4 py-3 text-sm font-medium text-gray-800">{transaction.customerName || '—'}</td>
    <td className="px-4 py-3 text-sm text-gray-600">{transaction.serviceName || '—'}</td>
    <td className="px-4 py-3 text-sm font-semibold text-gray-800">{formatCurrency(transaction.finalPrice)}</td>
    <td className="px-4 py-3 text-sm text-gray-600">{formatDate(transaction.transactionDate)}</td>
    <td className="px-4 py-3 text-sm text-gray-600">{formatTime(transaction.transactionDate)}</td>
  </tr>
));

export default ManagerDashboard;