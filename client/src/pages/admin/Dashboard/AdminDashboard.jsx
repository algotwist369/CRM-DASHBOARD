import React, { useState, useEffect, useCallback, useMemo, memo } from "react";
import { useNavigate } from "react-router-dom";
import { 
  FaBuilding, 
  FaUserTie, 
  FaUsers, 
  FaChartLine, 
  FaMoneyBillWave, 
  FaExchangeAlt,
  FaArrowUp,
  FaArrowLeft,
  FaChartPie,
  FaCalendarAlt
} from "react-icons/fa";
import { HiRefresh } from "react-icons/hi";
import adminService from "../../../services/admin/adminService";

// Simple Stat Card Component
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

// Simple Business Type Card
const BusinessTypeCard = memo(({ emoji, label, count, bgColor, borderColor, textColor }) => (
  <div className={`p-2 rounded-lg ${bgColor} ${borderColor} border flex items-center justify-between hover:shadow-sm transition-all`}>
    <div className="flex items-center gap-2">
      <span className="text-xl">{emoji}</span>
      <span className={`text-xs font-medium ${textColor}`}>{label}</span>
    </div>
    <span className="text-sm font-bold text-gray-800">{count}</span>
  </div>
));

// Simple Performance Metric Row
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

// Memoized Business Row (Desktop)
const BusinessRow = memo(({ business }) => (
  <tr className="hover:bg-gray-50 transition-colors">
    <td className="px-6 py-4 whitespace-nowrap">
      <div className="text-sm font-semibold text-gray-900">{business.name}</div>
    </td>
    <td className="px-6 py-4 whitespace-nowrap">
      <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 capitalize">
        {business.type}
      </span>
    </td>
    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{business.branch || '—'}</td>
    <td className="px-6 py-4 whitespace-nowrap">
      <code className="text-xs bg-gray-100 px-3 py-1.5 rounded-md font-mono text-gray-700 border border-gray-200">
        {business.businessLink}
      </code>
    </td>
    <td className="px-6 py-4 whitespace-nowrap text-center">
      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-purple-100 text-purple-700 text-sm font-semibold">
        {business.managersCount}
      </span>
    </td>
    <td className="px-6 py-4 whitespace-nowrap text-center">
      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-green-100 text-green-700 text-sm font-semibold">
        {business.staffCount}
      </span>
    </td>
  </tr>
));

// Memoized Business Card (Mobile)
const BusinessCard = memo(({ business }) => (
  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow">
    <div className="flex items-center justify-between mb-3">
      <h3 className="font-semibold text-gray-900">{business.name}</h3>
      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 capitalize">
        {business.type}
      </span>
    </div>
    <div className="space-y-2 text-sm">
      <div className="flex justify-between">
        <span className="text-gray-600">Branch:</span>
        <span className="text-gray-900 font-medium">{business.branch || '—'}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-gray-600">Link:</span>
        <code className="text-xs bg-white px-2 py-1 rounded border border-gray-200 text-gray-700">
          {business.businessLink}
        </code>
      </div>
      <div className="flex justify-between pt-2 border-t border-gray-200">
        <div className="flex items-center gap-2">
          <span className="text-gray-600">Managers:</span>
          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-purple-100 text-purple-700 text-xs font-semibold">
            {business.managersCount}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-gray-600">Staff:</span>
          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-green-100 text-green-700 text-xs font-semibold">
            {business.staffCount}
          </span>
        </div>
      </div>
    </div>
  </div>
));

// Daily Business Row Component
const DailyBusinessRow = memo(({ dailyBusiness, formatCurrency, formatDate }) => (
  <tr className="hover:bg-gray-50 transition-colors border-b border-gray-100">
    <td className="px-4 py-3 text-sm font-medium text-gray-800">{dailyBusiness.businessName}</td>
    <td className="px-4 py-3 text-sm text-gray-600 capitalize">{dailyBusiness.businessType}</td>
    <td className="px-4 py-3 text-sm text-gray-600">{formatDate(dailyBusiness.date)}</td>
    <td className="px-4 py-3 text-sm font-semibold text-gray-800">{formatCurrency(dailyBusiness.totalRevenue)}</td>
    <td className="px-4 py-3 text-center">
      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-700 text-sm font-semibold">
        {dailyBusiness.totalCustomers}
      </span>
    </td>
    <td className="px-4 py-3 text-center">
      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-purple-100 text-purple-700 text-sm font-semibold">
        {dailyBusiness.totalTransactions}
      </span>
    </td>
    <td className="px-4 py-3">
      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
        dailyBusiness.status === 'completed' ? 'bg-green-100 text-green-800' :
        dailyBusiness.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
        'bg-gray-100 text-gray-800'
      }`}>
        {dailyBusiness.status || 'N/A'}
      </span>
    </td>
  </tr>
));

// Daily Business Card (Mobile)
const DailyBusinessCard = memo(({ dailyBusiness, formatCurrency, formatDate }) => (
  <div className="bg-white rounded-lg p-4 border border-gray-200">
    <div className="flex items-center justify-between mb-3">
      <h3 className="font-semibold text-gray-900">{dailyBusiness.businessName}</h3>
      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
        dailyBusiness.status === 'completed' ? 'bg-green-100 text-green-800' :
        dailyBusiness.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
        'bg-gray-100 text-gray-800'
      }`}>
        {dailyBusiness.status || 'N/A'}
      </span>
    </div>
    <div className="space-y-2 text-sm">
      <div className="flex justify-between">
        <span className="text-gray-600">Type:</span>
        <span className="text-gray-900 font-medium capitalize">{dailyBusiness.businessType}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-gray-600">Date:</span>
        <span className="text-gray-900 font-medium">{formatDate(dailyBusiness.date)}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-gray-600">Revenue:</span>
        <span className="text-gray-900 font-semibold">{formatCurrency(dailyBusiness.totalRevenue)}</span>
      </div>
      <div className="flex justify-between pt-2 border-t border-gray-200">
        <div className="flex items-center gap-2">
          <span className="text-gray-600">Customers:</span>
          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold">
            {dailyBusiness.totalCustomers}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-gray-600">Transactions:</span>
          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-purple-100 text-purple-700 text-xs font-semibold">
            {dailyBusiness.totalTransactions}
          </span>
        </div>
      </div>
    </div>
  </div>
));

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [dailyBusinessData, setDailyBusinessData] = useState(null);
  const [dailyBusinessLoading, setDailyBusinessLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const pageParam = urlParams.get('page');
    return pageParam && parseInt(pageParam) > 0 ? parseInt(pageParam) : 1;
  });
  
  const itemsPerPage = 5;

  const fetchDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await adminService.getDashboard(currentPage, itemsPerPage);
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
  }, [currentPage, itemsPerPage]);

  const fetchDailyBusinessData = useCallback(async () => {
    try {
      setDailyBusinessLoading(true);
      const res = await adminService.getDailyBusinessList({ page: 1, limit: 50 });
      if (res.success) {
        setDailyBusinessData(res.data || res);
      }
    } catch (e) {
      console.error("Failed to fetch daily business data", e);
    } finally {
      setDailyBusinessLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  useEffect(() => {
    if (activeTab === 'daily-business') {
      fetchDailyBusinessData();
    }
  }, [activeTab, fetchDailyBusinessData]);

  const handlePageChange = useCallback((newPage) => {
    setCurrentPage(newPage);
    window.history.pushState({ page: newPage }, '', `?page=${newPage}`);
  }, []);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    if (activeTab === 'overview') {
      fetchDashboard();
    } else {
      fetchDailyBusinessData();
      setRefreshing(false);
    }
  }, [activeTab, fetchDashboard, fetchDailyBusinessData]);

  const handleGoBack = useCallback(() => navigate(-1), [navigate]);

  const handleTabChange = useCallback((tab) => {
    setActiveTab(tab);
  }, []);

  // Format currency
  const formatCurrency = (amount) => {
    if (!amount) return "₹0";
    return `₹${parseInt(amount).toLocaleString('en-IN')}`;
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return '—';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  // Memoized stat cards data
  const statCards = useMemo(() => [
    { icon: FaBuilding, title: "Total Businesses", value: dashboard?.stats?.businesses?.total ?? 0, iconBg: "bg-blue-100", iconColor: "text-blue-600" },
    { icon: FaUserTie, title: "Total Managers", value: dashboard?.stats?.managers ?? 0, iconBg: "bg-purple-100", iconColor: "text-purple-600" },
    { icon: FaUsers, title: "Total Staff", value: dashboard?.stats?.staff ?? 0, iconBg: "bg-green-100", iconColor: "text-green-600" },
    { icon: FaMoneyBillWave, title: "Revenue (30 days)", value: dashboard?.stats?.totalRevenue ?? "₹0", iconBg: "bg-emerald-100", iconColor: "text-emerald-600" },
    { icon: FaChartLine, title: "Customers (30 days)", value: dashboard?.stats?.totalCustomers ?? 0, iconBg: "bg-orange-100", iconColor: "text-orange-600" },
    { icon: FaExchangeAlt, title: "Transactions", value: dashboard?.stats?.recentTransactions ?? 0, iconBg: "bg-pink-100", iconColor: "text-pink-600" }
  ], [dashboard?.stats]);

  // Memoized business types - comprehensive list
  const businessTypes = useMemo(() => {
    const stats = dashboard?.stats?.businesses || {};
    const types = [
      { emoji: "💇", label: "Salons", count: stats.salon ?? 0, bgColor: "bg-blue-50", borderColor: "border-blue-200", textColor: "text-blue-700" },
      { emoji: "💆", label: "Spas", count: stats.spa ?? 0, bgColor: "bg-purple-50", borderColor: "border-purple-200", textColor: "text-purple-700" },
      { emoji: "🏨", label: "Hotels", count: stats.hotel ?? 0, bgColor: "bg-orange-50", borderColor: "border-orange-200", textColor: "text-orange-700" },
      { emoji: "🍽️", label: "Restaurants", count: stats.restaurant ?? 0, bgColor: "bg-red-50", borderColor: "border-red-200", textColor: "text-red-700" },
      { emoji: "🛍️", label: "Retail", count: stats.retail ?? 0, bgColor: "bg-green-50", borderColor: "border-green-200", textColor: "text-green-700" },
      { emoji: "💪", label: "Gym", count: stats.gym ?? 0, bgColor: "bg-teal-50", borderColor: "border-teal-200", textColor: "text-teal-700" },
      { emoji: "🏥", label: "Clinic", count: stats.clinic ?? 0, bgColor: "bg-cyan-50", borderColor: "border-cyan-200", textColor: "text-cyan-700" },
      { emoji: "☕", label: "Cafe", count: stats.cafe ?? 0, bgColor: "bg-amber-50", borderColor: "border-amber-200", textColor: "text-amber-700" },
      { emoji: "📸", label: "Studio", count: stats.studio ?? 0, bgColor: "bg-pink-50", borderColor: "border-pink-200", textColor: "text-pink-700" },
      { emoji: "🎓", label: "Education", count: stats.education ?? 0, bgColor: "bg-indigo-50", borderColor: "border-indigo-200", textColor: "text-indigo-700" },
      { emoji: "🚗", label: "Automotive", count: stats.automotive ?? 0, bgColor: "bg-slate-50", borderColor: "border-slate-200", textColor: "text-slate-700" },
      { emoji: "🏪", label: "Others", count: stats.others ?? 0, bgColor: "bg-gray-50", borderColor: "border-gray-200", textColor: "text-gray-700" }
    ];
    
    // Filter out types with count 0 to show only active business types
    return types.filter(type => type.count > 0);
  }, [dashboard?.stats?.businesses]);

  // Memoized performance metrics
  const performanceMetrics = useMemo(() => [
    { label: "Avg Daily Revenue", value: dashboard?.analytics?.averageDailyRevenue ? `₹${dashboard.analytics.averageDailyRevenue.toLocaleString()}` : "₹0" },
    { label: "Avg Daily Customers", value: dashboard?.analytics?.averageDailyCustomers?.toFixed(1) ?? "0" },
    { label: "Growth Rate", value: `${dashboard?.analytics?.growthRate?.toFixed(1) ?? "0"}%`, showTrend: true },
    { label: "Net Profit", value: dashboard?.analytics?.netProfit ? `₹${dashboard.analytics.netProfit.toLocaleString()}` : "₹0", isHighlight: true }
  ], [dashboard?.analytics]);

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
    <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen">
      {/* Header Section */}
      <div className="mb-6 sm:mb-8">
        <div className="bg-white rounded-lg p-5 sm:p-6 border border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
                  <FaChartLine className="text-white text-lg" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                    Admin Dashboard
                  </h1>
                  <p className="text-xs sm:text-sm text-gray-500">
                    Real-time business insights
                  </p>
                </div>
              </div>
              <p className="text-sm sm:text-base text-gray-600">
                Welcome back, <span className="font-semibold text-primary-600">{dashboard?.admin?.name || 'Admin'}</span>
                {dashboard?.admin?.companyName && (
                  <span className="text-gray-500"> • {dashboard.admin.companyName}</span>
                )}
              </p>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={handleGoBack}
                className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium text-gray-700"
                title="Go Back"
              >
                <FaArrowLeft className="text-gray-600" />
                <span className="hidden sm:inline">Back</span>
              </button>
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
      </div>

      {/* Tab Navigation */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex gap-4 sm:gap-8">
            <button
              onClick={() => handleTabChange('overview')}
              className={`pb-3 px-1 border-b-2 font-medium text-sm transition-colors flex items-center gap-2 ${
                activeTab === 'overview'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <FaChartPie className="text-base" />
              <span>Overview</span>
            </button>
            <button
              onClick={() => handleTabChange('daily-business')}
              className={`pb-3 px-1 border-b-2 font-medium text-sm transition-colors flex items-center gap-2 ${
                activeTab === 'daily-business'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <FaCalendarAlt className="text-base" />
              <span>Daily Business</span>
            </button>
          </nav>
        </div>
      </div>

      {/* Overview Tab Content */}
      {activeTab === 'overview' && (
        <>
          {/* Stats Overview */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
            {statCards.map((card) => (
              <StatCard key={card.title} {...card} />
            ))}
          </div>

      {/* Analytics and Business Type Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
        {/* Business Type Breakdown */}
        <div className="bg-white rounded-lg border border-gray-200 p-5 sm:p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <FaBuilding className="text-white text-sm" />
              </div>
              <h2 className="text-lg font-semibold text-gray-800">Businesses by Type</h2>
            </div>
            <span className="text-xs font-medium text-gray-500">
              {businessTypes.length} Active Type{businessTypes.length !== 1 ? 's' : ''}
            </span>
          </div>
          {businessTypes.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {businessTypes.map((type) => (
                <BusinessTypeCard key={type.label} {...type} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p className="text-4xl mb-2">🏢</p>
              <p className="text-sm">No businesses added yet</p>
            </div>
          )}
        </div>

        {/* Analytics Summary */}
        <div className="bg-white rounded-lg border border-gray-200 p-5 sm:p-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <FaChartLine className="text-white text-sm" />
            </div>
            <h2 className="text-lg font-semibold text-gray-800">Performance Summary (30 Days)</h2>
          </div>
          <div className="space-y-3">
            {performanceMetrics.map((metric) => (
              <PerformanceRow key={metric.label} {...metric} />
            ))}
          </div>
        </div>
      </div>

      {/* Recent Businesses */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <FaBuilding className="text-white text-sm" />
              </div>
              <h2 className="text-lg font-semibold text-gray-800">Recent Businesses</h2>
            </div>
          </div>
        </div>
        
        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Branch</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Link</th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">Managers</th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">Staff</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {(dashboard?.recentBusinesses || []).map((business) => (
                <BusinessRow key={business.id} business={business} />
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden p-4 space-y-4">
          {(dashboard?.recentBusinesses || []).map((business) => (
            <BusinessCard key={business.id} business={business} />
          ))}
        </div>
        
        {/* Pagination Controls */}
        {dashboard?.pagination && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 sm:px-6 py-4 bg-gray-50 border-t border-gray-200">
            <div className="text-xs sm:text-sm text-gray-600">
              Showing <span className="font-semibold text-gray-900">{((currentPage - 1) * itemsPerPage) + 1}</span> to <span className="font-semibold text-gray-900">{Math.min(currentPage * itemsPerPage, dashboard.pagination.total)}</span> of <span className="font-semibold text-gray-900">{dashboard.pagination.total}</span> businesses
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
                Page {currentPage} of {dashboard.pagination.totalPages}
              </span>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= dashboard.pagination.totalPages}
                className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
        </>
      )}

      {/* Daily Business Tab Content */}
      {activeTab === 'daily-business' && (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="p-5 sm:p-6 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                  <FaChartLine className="text-white text-sm" />
                </div>
                <h2 className="text-lg font-semibold text-gray-800">Daily Business Records</h2>
              </div>
              <span className="text-xs font-medium text-gray-500">
                {dailyBusinessData?.data?.length || 0} Records
              </span>
            </div>
          </div>

          {dailyBusinessLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="text-center">
                <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600">Loading daily business data...</p>
              </div>
            </div>
          ) : dailyBusinessData?.data && dailyBusinessData.data.length > 0 ? (
            <>
              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Business</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Type</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Date</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Revenue</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase">Customers</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase">Transactions</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dailyBusinessData.data.map((dailyBusiness) => (
                      <DailyBusinessRow
                        key={dailyBusiness.id || dailyBusiness._id}
                        dailyBusiness={dailyBusiness}
                        formatCurrency={formatCurrency}
                        formatDate={formatDate}
                      />
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="md:hidden p-4 space-y-4">
                {dailyBusinessData.data.map((dailyBusiness) => (
                  <DailyBusinessCard
                    key={dailyBusiness.id || dailyBusiness._id}
                    dailyBusiness={dailyBusiness}
                    formatCurrency={formatCurrency}
                    formatDate={formatDate}
                  />
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-4xl mb-3">📊</p>
              <p className="text-sm text-gray-500">No daily business records found</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
