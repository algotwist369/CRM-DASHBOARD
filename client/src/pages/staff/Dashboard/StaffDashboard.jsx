import React, { useState, useEffect, useCallback, useMemo, memo } from "react";
import { useNavigate } from "react-router-dom";
import { 
  FaUsers,
  FaMoneyBillWave,
  FaChartLine,
  FaExchangeAlt,
  FaBuilding,
  FaCalendarDay,
  FaCalendarAlt,
  FaArrowUp,
} from "react-icons/fa";
import { HiRefresh } from "react-icons/hi";
import staffService from "../../../services/staff/staffService";

// Simple Stat Card Component - matching admin dashboard
const StatCard = memo(({ icon: Icon, title, value, iconBg, iconColor }) => (
  <div className="bg-white rounded-lg border border-gray-200 p-5">
    <div className="flex items-center justify-between">
      <div className="flex-1">
        <p className="text-xs sm:text-sm font-medium text-gray-500 mb-2">{title}</p>
        <p className="text-2xl sm:text-3xl font-bold text-gray-900">{value}</p>
      </div>
      <div className={`${iconBg} ${iconColor} p-3 sm:p-4 rounded-lg`}>
        <Icon className="text-xl sm:text-2xl" />
      </div>
    </div>
  </div>
));

// Simple Performance Metric Row - matching admin dashboard
const PerformanceRow = memo(({ label, value, isHighlight, showTrend }) => (
  <div className={`flex justify-between items-center p-3 rounded-lg ${
    isHighlight 
      ? 'bg-primary-50 border border-primary-200' 
      : 'bg-gray-50 border border-gray-200'
  }`}>
    <span className={`text-sm font-medium ${isHighlight ? 'text-primary-700' : 'text-gray-700'}`}>
      {label}
    </span>
    <span className={`text-base font-bold flex items-center gap-2 ${
      isHighlight ? 'text-primary-900' : 
      showTrend && parseFloat(value) > 0 ? 'text-green-600' : 
      showTrend && parseFloat(value) < 0 ? 'text-red-600' : 'text-gray-900'
    }`}>
      {showTrend && parseFloat(value) > 0 && <FaArrowUp className="text-xs" />}
      {value}
    </span>
  </div>
));

// Simple Info Row Component
const InfoRow = memo(({ label, value, isBorder }) => (
  <div className={`flex justify-between items-center py-2.5 ${isBorder ? 'border-t border-gray-100 pt-4 mt-1' : ''}`}>
    <span className="text-sm font-medium text-gray-600">{label}</span>
    <span className="text-sm font-semibold text-gray-900">{value}</span>
  </div>
));

// Simple Transaction Row Component
const TransactionRow = memo(({ transaction, formatCurrency, formatDate, formatTime }) => (
  <tr className="hover:bg-gray-50 transition-colors">
    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">{transaction.customerName || '—'}</td>
    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{transaction.serviceName || '—'}</td>
    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-emerald-600">{formatCurrency(transaction.finalPrice)}</td>
    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{formatDate(transaction.transactionDate)}</td>
    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatTime(transaction.transactionDate)}</td>
  </tr>
));

const StaffDashboard = () => {
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  
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
      const res = await staffService.getDashboard();
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
  }, [fetchDashboard]);

  const handlePageChange = useCallback((newPage) => {
    setCurrentPage(newPage);
    window.history.pushState({ page: newPage }, '', `?page=${newPage}`);
  }, []);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    fetchDashboard();
  }, [fetchDashboard]);

  const formatCurrency = (amount) => {
    if (!amount) return "₹0";
    return `₹${parseInt(amount).toLocaleString('en-IN')}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const analytics = useMemo(() => {
    if (!dashboard?.stats) return null;
    const stats = dashboard.stats;
    const daysInMonth = new Date().getDate();
    return {
      averageDailyRevenue: stats.monthlyRevenue / Math.max(daysInMonth, 1),
      averageDailyCustomers: stats.monthlyCustomers / Math.max(daysInMonth, 1),
      growthRate: 0,
      netProfit: stats.monthlyRevenue
    };
  }, [dashboard?.stats]);

  const paginatedTransactions = useMemo(() => {
    if (!dashboard?.recentTransactions) return [];
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return dashboard.recentTransactions.slice(startIndex, endIndex);
  }, [dashboard?.recentTransactions, currentPage, itemsPerPage]);

  const totalTransactions = dashboard?.recentTransactions?.length || 0;
  const totalPages = Math.ceil(totalTransactions / itemsPerPage);

  // Stat cards matching admin dashboard style
  const statCards = useMemo(() => [
    { 
      icon: FaCalendarDay, 
      title: "Today's Appointments", 
      value: dashboard?.stats?.todayAppointments ?? 0, 
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600"
    },
    { 
      icon: FaMoneyBillWave, 
      title: "Today's Revenue", 
      value: formatCurrency(dashboard?.stats?.todayRevenue), 
      iconBg: "bg-emerald-100",
      iconColor: "text-emerald-600"
    },
    { 
      icon: FaUsers, 
      title: "Today's Customers", 
      value: dashboard?.stats?.todayCustomers ?? 0, 
      iconBg: "bg-purple-100",
      iconColor: "text-purple-600"
    },
    { 
      icon: FaCalendarAlt, 
      title: "Monthly Appointments", 
      value: dashboard?.stats?.monthlyAppointments ?? 0, 
      iconBg: "bg-orange-100",
      iconColor: "text-orange-600"
    },
    { 
      icon: FaChartLine, 
      title: "Monthly Revenue", 
      value: formatCurrency(dashboard?.stats?.monthlyRevenue), 
      iconBg: "bg-pink-100",
      iconColor: "text-pink-600"
    },
    { 
      icon: FaExchangeAlt, 
      title: "Today's Transactions", 
      value: dashboard?.stats?.totalTransactions ?? 0, 
      iconBg: "bg-cyan-100",
      iconColor: "text-cyan-600"
    }
  ], [dashboard?.stats]);

  // Performance metrics matching admin dashboard
  const performanceMetrics = useMemo(() => [
    { 
      label: "Avg Daily Revenue", 
      value: analytics?.averageDailyRevenue ? formatCurrency(analytics.averageDailyRevenue) : "₹0" 
    },
    { 
      label: "Avg Daily Customers", 
      value: analytics?.averageDailyCustomers?.toFixed(1) ?? "0" 
    },
    { 
      label: "Growth Rate", 
      value: `${analytics?.growthRate?.toFixed(1) ?? "0"}%`, 
      showTrend: true 
    },
    { 
      label: "Total Monthly Revenue", 
      value: formatCurrency(dashboard?.stats?.monthlyRevenue), 
      isHighlight: true 
    }
  ], [analytics, dashboard?.stats?.monthlyRevenue]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-gray-600">
        Loading dashboard...
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="p-6 text-red-600">{error}</div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen">
      {/* Header Section */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-1">Staff Dashboard</h1>
            <p className="text-sm text-gray-600">
              Welcome, <span className="font-medium">{dashboard?.staff?.name}</span> • {dashboard?.business?.name}
            </p>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
              title="Refresh Dashboard"
            >
              <HiRefresh className={`text-lg ${refreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
        {statCards.map((card, index) => (
          <StatCard key={index} {...card} />
        ))}
      </div>

      {/* Business Info and Analytics Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
        {/* Business Information */}
        <div className="bg-white rounded-lg border border-gray-200 p-5 sm:p-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <FaBuilding className="text-white text-sm" />
            </div>
            <h2 className="text-lg font-semibold text-gray-800">Business Information</h2>
          </div>
          <div className="space-y-2">
            <InfoRow label="Business Name" value={dashboard?.business?.name || '—'} />
            <InfoRow label="Type" value={dashboard?.business?.type ? dashboard.business.type.charAt(0).toUpperCase() + dashboard.business.type.slice(1) : '—'} />
            <InfoRow label="Branch" value={dashboard?.business?.branch || '—'} />
            <InfoRow label="Address" value={dashboard?.business?.address || '—'} isBorder />
          </div>
        </div>

        {/* Analytics Summary */}
        <div className="bg-white rounded-lg border border-gray-200 p-5 sm:p-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <FaChartLine className="text-white text-sm" />
            </div>
            <h2 className="text-lg font-semibold text-gray-800">Performance Summary</h2>
          </div>
          <div className="space-y-3">
            {performanceMetrics.map((metric) => (
              <PerformanceRow key={metric.label} {...metric} />
            ))}
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <FaExchangeAlt className="text-white text-sm" />
              </div>
              <h2 className="text-lg font-semibold text-gray-800">Recent Transactions</h2>
            </div>
          </div>
        </div>
        
        {dashboard?.recentTransactions && dashboard.recentTransactions.length > 0 ? (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Customer</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Service</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Time</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
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

            {/* Mobile Card View */}
            <div className="md:hidden p-4 space-y-4">
              {paginatedTransactions.map((t) => (
                <div key={t.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-gray-900">{t.customerName || '—'}</h3>
                    <span className="text-sm font-bold text-emerald-600">{formatCurrency(t.finalPrice)}</span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Service:</span>
                      <span className="text-gray-900 font-medium">{t.serviceName || '—'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Date:</span>
                      <span className="text-gray-900 font-medium">{formatDate(t.transactionDate)}</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-gray-200">
                      <span className="text-gray-600">Time:</span>
                      <span className="text-gray-900 font-medium">{formatTime(t.transactionDate)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Pagination Controls */}
            {totalTransactions > itemsPerPage && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 sm:px-6 py-4 bg-gray-50 border-t border-gray-200">
                <div className="text-xs sm:text-sm text-gray-600">
                  Showing <span className="font-semibold text-gray-900">{((currentPage - 1) * itemsPerPage) + 1}</span> to <span className="font-semibold text-gray-900">{Math.min(currentPage * itemsPerPage, totalTransactions)}</span> of <span className="font-semibold text-gray-900">{totalTransactions}</span> transactions
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePageChange(Math.max(currentPage - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
                  >
                    Previous
                  </button>
                  <span className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage >= totalPages}
                    className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
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

export default StaffDashboard;
