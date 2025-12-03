import React, { useState, useEffect, useCallback, useMemo, memo, useRef } from "react";
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
  FaCalendarAlt,
  FaClipboardList,
  FaFileInvoiceDollar,
  FaBullhorn,
  FaCheckCircle,
  FaTimesCircle
} from "react-icons/fa";
import { HiRefresh } from "react-icons/hi";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import adminService from "../../../services/admin/adminService";
import AdminDailyBusinessList from "../DailyBusiness/AdminDailyBusinessList/AdminDailyBusinessList";

// Optimized Stat Card Component
const StatCard = memo(({ icon: Icon, title, value, iconBg, iconColor }) => (
  <div className="bg-white  border border-gray-200 p-4">
    <div className="flex items-center justify-between">
      <div className="flex-1">
        <p className="text-xs font-medium text-gray-500 mb-1">{title}</p>
        <p className="text-xl font-bold text-gray-900">{value}</p>
      </div>
      <div className={`${iconBg} ${iconColor} p-3 `}>
        <Icon className="text-lg" />
      </div>
    </div>
  </div>
));

// Business Type Card
const BusinessTypeCard = memo(({ emoji, label, count, bgColor, borderColor, textColor }) => (
  <div className={`p-2  ${bgColor} ${borderColor} border flex items-center justify-between`}>
    <div className="flex items-center gap-2">
      <span className="text-base">{emoji}</span>
      <span className={`text-xs font-medium ${textColor}`}>{label}</span>
    </div>
    <span className="text-sm font-bold text-gray-800">{count}</span>
  </div>
));

// Performance Metric Row
const PerformanceRow = memo(({ label, value, isHighlight, showTrend }) => (
  <div className={`flex justify-between items-center p-2.5  ${isHighlight ? 'bg-primary-50 border border-primary-200' : 'bg-gray-50'}`}>
    <span className={`text-sm font-medium ${isHighlight ? 'text-primary-700' : 'text-gray-700'}`}>
      {label}
    </span>
    <span className={`text-sm font-bold flex items-center gap-1.5 ${isHighlight ? 'text-primary-900' :
      showTrend && parseFloat(value) > 0 ? 'text-green-600' :
        showTrend && parseFloat(value) < 0 ? 'text-red-600' : 'text-gray-900'
      }`}>
      {showTrend && parseFloat(value) > 0 && <FaArrowUp className="text-xs" />}
      {value}
    </span>
  </div>
));

// Business Row (Desktop)
const BusinessRow = memo(({ business }) => (
  <tr className="hover:bg-gray-50">
    <td className="px-4 py-3">
      <div className="text-sm font-semibold text-gray-900">{business.name}</div>
    </td>
    <td className="px-4 py-3">
      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 capitalize">
        {business.type}
      </span>
    </td>
    <td className="px-4 py-3 text-sm text-gray-600">{business.branch || '—'}</td>
    <td className="px-4 py-3">
      <code className="text-xs bg-gray-100 px-2 py-1 rounded font-mono text-gray-700">
        {business.businessLink}
      </code>
    </td>
    <td className="px-4 py-3 text-center">
      <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-purple-100 text-purple-700 text-xs font-semibold">
        {business.managersCount}
      </span>
    </td>
    <td className="px-4 py-3 text-center">
      <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-green-100 text-green-700 text-xs font-semibold">
        {business.staffCount}
      </span>
    </td>
  </tr>
));

// Business Card (Mobile)
const BusinessCard = memo(({ business }) => (
  <div className="bg-gray-50  p-3 border border-gray-200">
    <div className="flex items-center justify-between mb-2">
      <h3 className="font-semibold text-sm text-gray-900">{business.name}</h3>
      <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 capitalize">
        {business.type}
      </span>
    </div>
    <div className="space-y-1.5 text-sm">
      <div className="flex justify-between">
        <span className="text-gray-600">Branch:</span>
        <span className="text-gray-900 font-medium">{business.branch || '—'}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-gray-600">Link:</span>
        <code className="text-xs bg-white px-1.5 py-0.5 rounded text-gray-700">
          {business.businessLink}
        </code>
      </div>
      <div className="flex justify-between pt-1.5 border-t border-gray-200">
        <div className="flex items-center gap-1.5">
          <span className="text-gray-600 text-xs">Managers:</span>
          <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-purple-100 text-purple-700 text-xs font-semibold">
            {business.managersCount}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-gray-600 text-xs">Staff:</span>
          <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-green-100 text-green-700 text-xs font-semibold">
            {business.staffCount}
          </span>
        </div>
      </div>
    </div>
  </div>
));

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [performanceView, setPerformanceView] = useState('graph'); // 'graph' or 'list'
  const [currentPage, setCurrentPage] = useState(1);

  // Ref to prevent duplicate API calls
  const fetchingRef = useRef(false);
  const itemsPerPage = 5;

  const fetchDashboard = useCallback(async () => {
    // Prevent duplicate calls
    if (fetchingRef.current) return;

    try {
      fetchingRef.current = true;
      setLoading(true);
      setError(null);

      // Fetch both dashboard and stats
      const [dashboardRes, statsRes] = await Promise.all([
        adminService.getDashboard(currentPage, itemsPerPage),
        adminService.getStats()
      ]);

      if (dashboardRes.success) {
        setDashboard(dashboardRes.data.data || dashboardRes.data);
      } else {
        setError(dashboardRes.error || "Failed to load dashboard");
      }

      if (statsRes.success) {
        setStats(statsRes.data.data || statsRes.data);
      }
    } catch (e) {
      setError("Failed to load dashboard");
    } finally {
      setLoading(false);
      setRefreshing(false);
      fetchingRef.current = false;
    }
  }, [currentPage]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const handlePageChange = useCallback((newPage) => {
    setCurrentPage(newPage);
  }, []);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    fetchDashboard();
  }, [fetchDashboard]);

  const handleGoBack = useCallback(() => navigate(-1), [navigate]);

  // Memoized stat cards data
  const statCards = useMemo(() => [
    { icon: FaBuilding, title: "Businesses", value: stats?.businesses?.total ?? dashboard?.stats?.businesses?.total ?? 0, iconBg: "bg-blue-100", iconColor: "text-blue-600" },
    { icon: FaUserTie, title: "Managers", value: stats?.managers?.total ?? dashboard?.stats?.managers ?? 0, iconBg: "bg-purple-100", iconColor: "text-purple-600" },
    { icon: FaUsers, title: "Staff", value: stats?.staff?.total ?? dashboard?.stats?.staff ?? 0, iconBg: "bg-green-100", iconColor: "text-green-600" },
    { icon: FaChartLine, title: "Customers", value: stats?.customers?.total ?? dashboard?.stats?.totalCustomers ?? 0, iconBg: "bg-orange-100", iconColor: "text-orange-600" },
    { icon: FaClipboardList, title: "Services", value: stats?.services?.total ?? 0, iconBg: "bg-teal-100", iconColor: "text-teal-600" },
    { icon: FaCalendarAlt, title: "Appointments", value: stats?.appointments?.total ?? 0, iconBg: "bg-indigo-100", iconColor: "text-indigo-600" },
    { icon: FaMoneyBillWave, title: "Revenue", value: stats?.transactions?.totalRevenue ?? dashboard?.stats?.totalRevenue ?? "₹0", iconBg: "bg-emerald-100", iconColor: "text-emerald-600" },
    { icon: FaExchangeAlt, title: "Transactions", value: stats?.transactions?.total ?? dashboard?.stats?.recentTransactions ?? 0, iconBg: "bg-pink-100", iconColor: "text-pink-600" },
    { icon: FaFileInvoiceDollar, title: "Invoices", value: stats?.invoices?.total ?? 0, iconBg: "bg-yellow-100", iconColor: "text-yellow-600" },
    { icon: FaBullhorn, title: "Campaigns", value: stats?.campaigns?.total ?? 0, iconBg: "bg-red-100", iconColor: "text-red-600" }
  ], [dashboard?.stats, stats]);

  // Memoized business types
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
    return types.filter(type => type.count > 0);
  }, [dashboard?.stats?.businesses]);

  // Memoized performance metrics
  const performanceMetrics = useMemo(() => {
    const analytics = dashboard?.analytics || {};
    return [
      { label: "Avg Daily Revenue", value: analytics.averageDailyRevenue ? `₹${analytics.averageDailyRevenue.toLocaleString()}` : "₹0", numValue: analytics.averageDailyRevenue || 0 },
      { label: "Avg Daily Customers", value: analytics.averageDailyCustomers?.toFixed(1) ?? "0", numValue: analytics.averageDailyCustomers || 0 },
      { label: "Growth Rate", value: `${analytics.growthRate?.toFixed(1) ?? "0"}%`, showTrend: true, numValue: analytics.growthRate || 0 },
      { label: "Net Profit", value: analytics.netProfit ? `₹${analytics.netProfit.toLocaleString()}` : "₹0", isHighlight: true, numValue: analytics.netProfit || 0 }
    ];
  }, [dashboard?.analytics]);

  // Memoized performance chart data
  const performanceChartData = useMemo(() => {
    return performanceMetrics.map(metric => ({
      name: metric.label.replace('Avg Daily ', '').replace(' (30 Days)', ''),
      value: metric.numValue
    }));
  }, [performanceMetrics]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-sm text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200  p-4 text-red-600">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div></div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleGoBack}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300  hover:bg-gray-50 text-sm font-medium text-gray-700"
            >
              <FaArrowLeft />
              <span>Back</span>
            </button>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white  hover:bg-primary-700 disabled:opacity-50 text-sm font-medium"
            >
              <HiRefresh className={refreshing ? 'animate-spin' : ''} />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex gap-6">
            <button
              onClick={() => setActiveTab('overview')}
              className={`pb-3 border-b-2 font-medium text-sm flex items-center gap-2 ${activeTab === 'overview'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
            >
              <FaChartPie />
              <span>Overview</span>
            </button>
            <button
              onClick={() => setActiveTab('stats')}
              className={`pb-3 border-b-2 font-medium text-sm flex items-center gap-2 ${activeTab === 'stats'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
            >
              <FaChartLine />
              <span>Comprehensive Stats</span>
            </button>
            <button
              onClick={() => setActiveTab('daily-business')}
              className={`pb-3 border-b-2 font-medium text-sm flex items-center gap-2 ${activeTab === 'daily-business'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
            >
              <FaCalendarAlt />
              <span>Daily Business</span>
            </button>
          </nav>
        </div>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-6">
            {statCards.map((card) => (
              <StatCard key={card.title} {...card} />
            ))}
          </div>

          {/* Analytics and Business Types */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Business Types */}
            <div className="bg-white  border border-gray-200 p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-semibold text-gray-800">Businesses by Type</h2>
                <span className="text-xs text-gray-500">{businessTypes.length} Types</span>
              </div>
              {businessTypes.length > 0 ? (
                <div className="grid grid-cols-2 gap-2">
                  {businessTypes.map((type) => (
                    <BusinessTypeCard key={type.label} {...type} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p className="text-3xl mb-2">🏢</p>
                  <p className="text-sm">No businesses yet</p>
                </div>
              )}
            </div>

            {/* Performance */}
            <div className="bg-white  border border-gray-200 p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-semibold text-gray-800">Performance (30 Days)</h2>
                {/* View Toggle Tabs */}
                <div className="flex gap-2">
                  <button
                    onClick={() => setPerformanceView('graph')}
                    className={`px-3 py-1.5 text-sm font-medium  transition-colors ${performanceView === 'graph'
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                  >
                    Graph
                  </button>
                  <button
                    onClick={() => setPerformanceView('list')}
                    className={`px-3 py-1.5 text-sm font-medium  transition-colors ${performanceView === 'list'
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                  >
                    List
                  </button>
                </div>
              </div>

              {/* Graph View */}
              {performanceView === 'graph' && (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={performanceChartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="#9ca3af" />
                      <YAxis tick={{ fontSize: 11 }} stroke="#9ca3af" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#fff',
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          fontSize: '12px'
                        }}
                      />
                      <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* List View */}
              {performanceView === 'list' && (
                <div className="space-y-2">
                  {performanceMetrics.map((metric) => (
                    <PerformanceRow key={metric.label} {...metric} />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Recent Businesses */}
          <div className="bg-white  border border-gray-200">
            <div className="p-5 border-b border-gray-200">
              <h2 className="text-base font-semibold text-gray-800">Recent Businesses</h2>
            </div>

            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Name</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Type</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Branch</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Link</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase">Managers</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase">Staff</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {(dashboard?.recentBusinesses || []).map((business) => (
                    <BusinessRow key={business.id} business={business} />
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden p-4 space-y-3">
              {(dashboard?.recentBusinesses || []).map((business) => (
                <BusinessCard key={business.id} business={business} />
              ))}
            </div>

            {/* Pagination */}
            {dashboard?.pagination && (
              <div className="flex items-center justify-between px-5 py-4 bg-gray-50 border-t border-gray-200">
                <div className="text-sm text-gray-600">
                  Showing <span className="font-semibold">{((currentPage - 1) * itemsPerPage) + 1}</span> to{' '}
                  <span className="font-semibold">{Math.min(currentPage * itemsPerPage, dashboard.pagination.total)}</span> of{' '}
                  <span className="font-semibold">{dashboard.pagination.total}</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handlePageChange(Math.max(currentPage - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300  hover:bg-gray-50 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <span className="px-3 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-300 ">
                    {currentPage} / {dashboard.pagination.totalPages}
                  </span>
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage >= dashboard.pagination.totalPages}
                    className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300  hover:bg-gray-50 disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* Comprehensive Stats Tab */}
      {activeTab === 'stats' && stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Businesses Stats */}
          <div className="bg-white border border-gray-200 p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-blue-100 text-blue-600 p-3">
                <FaBuilding className="text-xl" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800">Businesses</h3>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center p-2 bg-gray-50">
                <span className="text-sm text-gray-600">Total</span>
                <span className="text-sm font-bold text-gray-900">{stats.businesses.total}</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-green-50">
                <span className="text-sm text-green-700 flex items-center gap-1">
                  <FaCheckCircle className="text-xs" /> Active
                </span>
                <span className="text-sm font-bold text-green-800">{stats.businesses.active}</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-red-50">
                <span className="text-sm text-red-700 flex items-center gap-1">
                  <FaTimesCircle className="text-xs" /> Inactive
                </span>
                <span className="text-sm font-bold text-red-800">{stats.businesses.inactive}</span>
              </div>
            </div>
          </div>

          {/* Managers Stats */}
          <div className="bg-white border border-gray-200 p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-purple-100 text-purple-600 p-3">
                <FaUserTie className="text-xl" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800">Managers</h3>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center p-2 bg-gray-50">
                <span className="text-sm text-gray-600">Total</span>
                <span className="text-sm font-bold text-gray-900">{stats.managers.total}</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-green-50">
                <span className="text-sm text-green-700 flex items-center gap-1">
                  <FaCheckCircle className="text-xs" /> Active
                </span>
                <span className="text-sm font-bold text-green-800">{stats.managers.active}</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-red-50">
                <span className="text-sm text-red-700 flex items-center gap-1">
                  <FaTimesCircle className="text-xs" /> Inactive
                </span>
                <span className="text-sm font-bold text-red-800">{stats.managers.inactive}</span>
              </div>
            </div>
          </div>

          {/* Staff Stats */}
          <div className="bg-white border border-gray-200 p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-green-100 text-green-600 p-3">
                <FaUsers className="text-xl" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800">Staff</h3>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center p-2 bg-gray-50">
                <span className="text-sm text-gray-600">Total</span>
                <span className="text-sm font-bold text-gray-900">{stats.staff.total}</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-green-50">
                <span className="text-sm text-green-700 flex items-center gap-1">
                  <FaCheckCircle className="text-xs" /> Active
                </span>
                <span className="text-sm font-bold text-green-800">{stats.staff.active}</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-red-50">
                <span className="text-sm text-red-700 flex items-center gap-1">
                  <FaTimesCircle className="text-xs" /> Inactive
                </span>
                <span className="text-sm font-bold text-red-800">{stats.staff.inactive}</span>
              </div>
            </div>
          </div>

          {/* Customers Stats */}
          <div className="bg-white border border-gray-200 p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-orange-100 text-orange-600 p-3">
                <FaChartLine className="text-xl" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800">Customers</h3>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center p-2 bg-gray-50">
                <span className="text-sm text-gray-600">Total</span>
                <span className="text-sm font-bold text-gray-900">{stats.customers.total}</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-green-50">
                <span className="text-sm text-green-700 flex items-center gap-1">
                  <FaCheckCircle className="text-xs" /> Active
                </span>
                <span className="text-sm font-bold text-green-800">{stats.customers.active}</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-red-50">
                <span className="text-sm text-red-700 flex items-center gap-1">
                  <FaTimesCircle className="text-xs" /> Inactive
                </span>
                <span className="text-sm font-bold text-red-800">{stats.customers.inactive}</span>
              </div>
            </div>
          </div>

          {/* Services Stats */}
          <div className="bg-white border border-gray-200 p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-teal-100 text-teal-600 p-3">
                <FaClipboardList className="text-xl" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800">Services</h3>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center p-2 bg-gray-50">
                <span className="text-sm text-gray-600">Total</span>
                <span className="text-sm font-bold text-gray-900">{stats.services.total}</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-green-50">
                <span className="text-sm text-green-700 flex items-center gap-1">
                  <FaCheckCircle className="text-xs" /> Active
                </span>
                <span className="text-sm font-bold text-green-800">{stats.services.active}</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-red-50">
                <span className="text-sm text-red-700 flex items-center gap-1">
                  <FaTimesCircle className="text-xs" /> Inactive
                </span>
                <span className="text-sm font-bold text-red-800">{stats.services.inactive}</span>
              </div>
            </div>
          </div>

          {/* Appointments Stats */}
          <div className="bg-white border border-gray-200 p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-indigo-100 text-indigo-600 p-3">
                <FaCalendarAlt className="text-xl" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800">Appointments</h3>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center p-2 bg-gray-50">
                <span className="text-sm text-gray-600">Total</span>
                <span className="text-sm font-bold text-gray-900">{stats.appointments.total}</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-green-50">
                <span className="text-sm text-green-700">Completed</span>
                <span className="text-sm font-bold text-green-800">{stats.appointments.completed}</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-yellow-50">
                <span className="text-sm text-yellow-700">Pending</span>
                <span className="text-sm font-bold text-yellow-800">{stats.appointments.pending}</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-red-50">
                <span className="text-sm text-red-700">Cancelled</span>
                <span className="text-sm font-bold text-red-800">{stats.appointments.cancelled}</span>
              </div>
            </div>
          </div>

          {/* Transactions Stats */}
          <div className="bg-white border border-gray-200 p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-pink-100 text-pink-600 p-3">
                <FaExchangeAlt className="text-xl" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800">Transactions</h3>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center p-2 bg-gray-50">
                <span className="text-sm text-gray-600">Total</span>
                <span className="text-sm font-bold text-gray-900">{stats.transactions.total}</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-emerald-50 border-l-4 border-emerald-500">
                <span className="text-sm text-emerald-700 font-medium">Revenue</span>
                <span className="text-base font-bold text-emerald-800">{stats.transactions.totalRevenue}</span>
              </div>
            </div>
          </div>

          {/* Invoices Stats */}
          <div className="bg-white border border-gray-200 p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-yellow-100 text-yellow-600 p-3">
                <FaFileInvoiceDollar className="text-xl" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800">Invoices</h3>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center p-2 bg-gray-50">
                <span className="text-sm text-gray-600">Total</span>
                <span className="text-sm font-bold text-gray-900">{stats.invoices.total}</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-green-50">
                <span className="text-sm text-green-700">Paid</span>
                <span className="text-sm font-bold text-green-800">{stats.invoices.paid}</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-red-50">
                <span className="text-sm text-red-700">Unpaid</span>
                <span className="text-sm font-bold text-red-800">{stats.invoices.unpaid}</span>
              </div>
            </div>
          </div>

          {/* Campaigns Stats */}
          <div className="bg-white border border-gray-200 p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-red-100 text-red-600 p-3">
                <FaBullhorn className="text-xl" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800">Campaigns</h3>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center p-2 bg-gray-50">
                <span className="text-sm text-gray-600">Total</span>
                <span className="text-sm font-bold text-gray-900">{stats.campaigns.total}</span>
              </div>
            </div>
          </div>

          {/* Grand Totals */}
          <div className="bg-gradient-to-br from-primary-500 to-primary-700 border border-primary-800 p-5 md:col-span-2 lg:col-span-3">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-white/20 text-white p-3">
                <FaChartPie className="text-xl" />
              </div>
              <h3 className="text-lg font-semibold text-white">Grand Totals</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex justify-between items-center p-3 bg-white/10 backdrop-blur-sm">
                <span className="text-sm text-white/90">All Entities (Total)</span>
                <span className="text-xl font-bold text-white">{stats.grandTotals.allEntities.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-white/10 backdrop-blur-sm">
                <span className="text-sm text-white/90">Active Entities</span>
                <span className="text-xl font-bold text-white">{stats.grandTotals.allActiveEntities.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Daily Business Tab */}
      {activeTab === 'daily-business' && (
        <AdminDailyBusinessList />
      )}
    </div>
  );
};

export default AdminDashboard;
