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
} from "react-icons/fa";
import { HiRefresh } from "react-icons/hi";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import adminService from "../../../services/admin/adminService";
import AdminDailyBusinessList from "../DailyBusiness/AdminDailyBusinessList/AdminDailyBusinessList";

// Optimized Stat Card Component
const StatCard = memo(({ icon: Icon, title, value, iconBg, iconColor, rawValue }) => {
  // Format the tooltip to show full amount with decimals
  const getTooltip = () => {
    if (!rawValue && rawValue !== 0) return value;
    const num = parseFloat(rawValue.toString().replace(/[₹,]/g, ''));
    if (isNaN(num)) return value;
    return `₹${num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 4 })}`;
  };

  return (
    <div className="bg-white border border-gray-200 p-4">
      <div className="flex items-center justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-gray-500 mb-1 truncate">{title}</p>
          <p
            className="text-xl font-bold text-gray-900 truncate cursor-help"
            title={getTooltip()}
          >
            {value}
          </p>
        </div>
        <div className={`${iconBg} ${iconColor} p-3 flex-shrink-0`}>
          <Icon className="text-lg" />
        </div>
      </div>
    </div>
  );
});

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
  const [businessesList, setBusinessesList] = useState([]);
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    businessId: ""
  });
  const [txPage, setTxPage] = useState(1);
  const txPerPage = 10;

  // Ref to prevent duplicate API calls
  const fetchingRef = useRef(false);
  const itemsPerPage = 5;

  // Load businesses for filter dropdown
  useEffect(() => {
    const loadBusinesses = async () => {
      try {
        const res = await adminService.getBusinesses({ limit: 100 });
        if (res.success) {
          const businesses = res.data.businesses || res.data || [];
          console.log('Businesses loaded for filter:', businesses);
          setBusinessesList(businesses);
        }
      } catch (err) {
        console.error("Failed to load businesses list", err);
      }
    };
    loadBusinesses();
  }, []);

  // Format large numbers compactly (₹1K, ₹1L, ₹1Cr, etc.)
  const formatCompactNumber = useCallback((value) => {
    if (!value || isNaN(value)) return value;
    const num = parseFloat(value.toString().replace(/[₹,]/g, ''));

    if (num >= 10000000) { // 1 Crore+
      return `₹${(num / 10000000).toFixed(1)}Cr`;
    } else if (num >= 100000) { // 1 Lakh+
      return `₹${(num / 100000).toFixed(1)}L`;
    } else if (num >= 1000) { // 1 Thousand+
      return `₹${(num / 1000).toFixed(1)}K`;
    }
    return `₹${num.toLocaleString('en-IN')}`;
  }, []);

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
        adminService.getStats(filters)
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
  }, [currentPage, filters]);

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
    { icon: FaMoneyBillWave, title: "Revenue", value: formatCompactNumber(stats?.transactions?.totalRevenueRaw ?? dashboard?.stats?.totalRevenueRaw ?? 0), rawValue: stats?.transactions?.totalRevenueRaw ?? dashboard?.stats?.totalRevenueRaw ?? 0, iconBg: "bg-emerald-100", iconColor: "text-emerald-600" },
    { icon: FaExchangeAlt, title: "Transactions", value: stats?.transactions?.total ?? dashboard?.stats?.recentTransactions ?? 0, iconBg: "bg-pink-100", iconColor: "text-pink-600" },
    { icon: FaFileInvoiceDollar, title: "Invoices", value: stats?.invoices?.total ?? 0, iconBg: "bg-yellow-100", iconColor: "text-yellow-600" },
    { icon: FaBullhorn, title: "Campaigns", value: stats?.campaigns?.total ?? 0, iconBg: "bg-red-100", iconColor: "text-red-600" }
  ], [dashboard?.stats, stats, formatCompactNumber]);

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
      {
        label: "Total Revenue (30d)",
        value: analytics.totalRevenue ? `₹${analytics.totalRevenue.toLocaleString('en-IN')}` : "₹0",
        numValue: analytics.totalRevenue || 0
      },
      {
        label: "Total Customers (30d)",
        value: analytics.totalCustomers?.toString() ?? "0",
        numValue: analytics.totalCustomers || 0
      },
      {
        label: "Avg Revenue/Customer",
        value: analytics.averageRevenuePerCustomer ? `₹${Math.round(analytics.averageRevenuePerCustomer).toLocaleString('en-IN')}` : "₹0",
        isHighlight: true,
        numValue: analytics.averageRevenuePerCustomer || 0
      },
      {
        label: "Total Transactions",
        value: analytics.recentTransactions?.toString() ?? "0",
        numValue: analytics.recentTransactions || 0
      }
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
            {/* <button
              onClick={() => setActiveTab('daily-business')}
              className={`pb-3 border-b-2 font-medium text-sm flex items-center gap-2 ${activeTab === 'daily-business'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
            >
              <FaCalendarAlt />
              <span>Daily Business</span>
            </button> */}
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
                    <LineChart data={performanceChartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
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
                      <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} dot={{ fill: '#3b82f6', r: 4 }} activeDot={{ r: 6 }} />
                    </LineChart>
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
        </>
      )}

      {/* Comprehensive Stats Tab */}
      {activeTab === 'stats' && stats && (
        <>
          {/* Filters */}
          <div className="bg-white border border-gray-200 p-3 mb-4">
            <div className="flex flex-wrap gap-3 items-end">
              <div className="flex-1 min-w-[180px]">
                <label className="block text-xs font-medium text-gray-600 mb-1">Business</label>
                <select
                  className="w-full border border-gray-300 rounded text-sm p-1.5"
                  value={filters.businessId}
                  onChange={(e) => setFilters(prev => ({ ...prev, businessId: e.target.value }))}
                >
                  <option value="">All Businesses</option>
                  {businessesList.map(b => (
                    <option key={b._id || b.id} value={b._id || b.id}>
                      {b.name || b.businessName || 'Unknown Business'}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Start Date</label>
                <input
                  type="date"
                  className="border border-gray-300 rounded text-sm p-1.5"
                  value={filters.startDate}
                  onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">End Date</label>
                <input
                  type="date"
                  className="border border-gray-300 rounded text-sm p-1.5"
                  value={filters.endDate}
                  onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
                />
              </div>
              {(filters.startDate || filters.endDate || filters.businessId) && (
                <button
                  onClick={() => setFilters({ startDate: "", endDate: "", businessId: "" })}
                  className="px-3 py-1.5 text-xs text-red-600 border border-red-300 rounded hover:bg-red-50"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-4">
            {/* Businesses */}
            <div className="bg-white border border-gray-200 p-3">
              <div className="text-xs text-gray-500 mb-2">Businesses</div>
              <div className="text-2xl font-bold text-gray-900 mb-1">{stats.businesses.total}</div>
              <div className="flex gap-2 text-xs">
                <span className="text-green-600">{stats.businesses.active} active</span>
                <span className="text-gray-400">•</span>
                <span className="text-red-600">{stats.businesses.inactive} inactive</span>
              </div>
            </div>

            {/* Managers */}
            <div className="bg-white border border-gray-200 p-3">
              <div className="text-xs text-gray-500 mb-2">Managers</div>
              <div className="text-2xl font-bold text-gray-900 mb-1">{stats.managers.total}</div>
              <div className="flex gap-2 text-xs">
                <span className="text-green-600">{stats.managers.active} active</span>
              </div>
            </div>

            {/* Staff */}
            <div className="bg-white border border-gray-200 p-3">
              <div className="text-xs text-gray-500 mb-2">Staff</div>
              <div className="text-2xl font-bold text-gray-900 mb-1">{stats.staff.total}</div>
              <div className="flex gap-2 text-xs">
                <span className="text-green-600">{stats.staff.active} active</span>
              </div>
            </div>

            {/* Customers */}
            <div className="bg-white border border-gray-200 p-3">
              <div className="text-xs text-gray-500 mb-2">Customers</div>
              <div className="text-2xl font-bold text-gray-900 mb-1">{stats.customers.total}</div>
              <div className="flex gap-2 text-xs">
                <span className="text-blue-600">{stats.customers.online} online</span>
                <span className="text-gray-400">•</span>
                <span className="text-purple-600">{stats.customers.walkIn} walk-in</span>
              </div>
            </div>

            {/* Services */}
            <div className="bg-white border border-gray-200 p-3">
              <div className="text-xs text-gray-500 mb-2">Services</div>
              <div className="text-2xl font-bold text-gray-900 mb-1">{stats.services.total}</div>
              <div className="flex gap-2 text-xs">
                <span className="text-green-600">{stats.services.active} active</span>
              </div>
            </div>

            {/* Appointments */}
            <div className="bg-white border border-gray-200 p-3">
              <div className="text-xs text-gray-500 mb-2">Appointments</div>
              <div className="text-2xl font-bold text-gray-900 mb-1">{stats.appointments.total}</div>
              <div className="flex gap-2 text-xs">
                <span className="text-green-600">{stats.appointments.completed} done</span>
                <span className="text-gray-400">•</span>
                <span className="text-yellow-600">{stats.appointments.pending} pending</span>
              </div>
            </div>

            {/* Transactions */}
            <div className="bg-white border border-gray-200 p-3">
              <div className="text-xs text-gray-500 mb-2">Transactions</div>
              <div className="text-2xl font-bold text-gray-900 mb-1">{stats.transactions.total}</div>
              <div className="text-xs text-gray-600">Total count</div>
            </div>

            {/* Revenue */}
            <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 border border-emerald-700 p-3">
              <div className="text-xs text-emerald-100 mb-2">Revenue</div>
              <div className="text-2xl font-bold text-white mb-1">{stats.transactions.totalRevenue}</div>
              <div className="text-xs text-emerald-100">Total earned</div>
            </div>

            {/* Invoices */}
            <div className="bg-white border border-gray-200 p-3">
              <div className="text-xs text-gray-500 mb-2">Invoices</div>
              <div className="text-2xl font-bold text-gray-900 mb-1">{stats.invoices.total}</div>
              <div className="flex gap-2 text-xs">
                <span className="text-green-600">{stats.invoices.paid} paid</span>
              </div>
            </div>

            {/* Campaigns */}
            <div className="bg-white border border-gray-200 p-3">
              <div className="text-xs text-gray-500 mb-2">Campaigns</div>
              <div className="text-2xl font-bold text-gray-900 mb-1">{stats.campaigns.total}</div>
              <div className="text-xs text-gray-600">Active campaigns</div>
            </div>
          </div>


          {/* Transactions Table */}
          <div className="bg-white border border-gray-200">
            <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-800">Recent Transactions</h3>
              <span className="text-xs text-gray-500">{stats.transactions.completed?.length || 0} total</span>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Business</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Customer</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Amount</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Payment</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Date</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {(() => {
                    const transactions = stats.transactions.completed || [];
                    const startIdx = (txPage - 1) * txPerPage;
                    const endIdx = startIdx + txPerPage;
                    const paginatedTxs = transactions.slice(startIdx, endIdx);

                    return paginatedTxs.length > 0 ? (
                      paginatedTxs.map((tx, index) => (
                        <tr key={tx._id || index} className="hover:bg-gray-50">
                          <td className="px-4 py-2 text-sm text-gray-900">{tx.businessName}</td>
                          <td className="px-4 py-2 text-sm text-gray-600">{tx.customerName}</td>
                          <td className="px-4 py-2 text-sm font-semibold text-gray-900">₹{tx.finalPrice}</td>
                          <td className="px-4 py-2 text-sm text-gray-600 capitalize">{tx.paymentMethod}</td>
                          <td className="px-4 py-2 text-sm text-gray-500">{new Date(tx.transactionDate).toLocaleDateString()}</td>
                          <td className="px-4 py-2">
                            <span className={`px-2 py-1 text-xs rounded-full ${tx.paymentStatus === 'completed' ? 'bg-green-100 text-green-700' :
                              tx.paymentStatus === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                'bg-gray-100 text-gray-700'
                              }`}>
                              {tx.paymentStatus || 'completed'}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="px-4 py-8 text-center text-sm text-gray-500">No transactions found</td>
                      </tr>
                    );
                  })()}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {stats.transactions.completed && stats.transactions.completed.length > txPerPage && (
              <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
                <div className="text-xs text-gray-600">
                  Showing {((txPage - 1) * txPerPage) + 1} to {Math.min(txPage * txPerPage, stats.transactions.completed.length)} of {stats.transactions.completed.length}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setTxPage(p => Math.max(1, p - 1))}
                    disabled={txPage === 1}
                    className="px-3 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <span className="px-3 py-1 text-xs border border-gray-300 rounded bg-gray-50">
                    {txPage} / {Math.ceil(stats.transactions.completed.length / txPerPage)}
                  </span>
                  <button
                    onClick={() => setTxPage(p => Math.min(Math.ceil(stats.transactions.completed.length / txPerPage), p + 1))}
                    disabled={txPage >= Math.ceil(stats.transactions.completed.length / txPerPage)}
                    className="px-3 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}


      {/* Daily Business Tab */}
      {activeTab === 'daily-business' && (
        <AdminDailyBusinessList />
      )}
    </div>
  );
};

export default AdminDashboard;
