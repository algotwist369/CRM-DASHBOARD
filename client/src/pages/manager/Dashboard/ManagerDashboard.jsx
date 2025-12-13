import React, { useState, useEffect, useCallback, useMemo, memo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
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

// Memoized Stat Card
const StatCard = memo(({ icon: Icon, title, value, iconBg, iconColor }) => (
  <div className="bg-white border border-gray-200 p-3">
    <div className="flex items-center gap-3">
      <div className={`${iconBg} p-2 flex-shrink-0`}>
        <Icon className={`${iconColor} text-lg`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-gray-500 truncate">{title}</p>
        <p className="text-lg font-semibold text-gray-900 truncate">{value}</p>
      </div>
    </div>
  </div>
));

// Memoized Info Row
const InfoRow = memo(({ label, value, isBorder }) => (
  <div className={`flex justify-between items-center py-1.5 ${isBorder ? 'border-t border-gray-100 pt-2 mt-1' : ''}`}>
    <span className="text-sm text-gray-500">{label}</span>
    <span className="text-sm font-medium text-gray-900">{value}</span>
  </div>
));

// Memoized Transaction Row
const TransactionRow = memo(({ transaction, formatCurrency, formatDate, formatTime }) => (
  <tr className="border-b border-gray-100 hover:bg-gray-50">
    <td className="px-3 py-2 text-sm text-gray-900">{transaction.customerName || '—'}</td>
    <td className="px-3 py-2 text-sm text-gray-600">{transaction.serviceName || '—'}</td>
    <td className="px-3 py-2 text-sm font-medium text-gray-900">{formatCurrency(transaction.finalPrice)}</td>
    <td className="px-3 py-2 text-sm text-gray-500">{formatDate(transaction.transactionDate)}</td>
    <td className="px-3 py-2 text-sm text-gray-500 hidden sm:table-cell">{formatTime(transaction.transactionDate)}</td>
  </tr>
));

// Memoized Pagination
const Pagination = memo(({ currentPage, totalPages, totalItems, itemsPerPage, onPageChange }) => {
  if (totalItems <= itemsPerPage) return null;

  const start = (currentPage - 1) * itemsPerPage + 1;
  const end = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="flex items-center justify-between gap-3 mt-3 pt-3 border-t border-gray-200 text-sm">
      <span className="text-gray-500 hidden sm:inline">
        {start}-{end} of {totalItems}
      </span>
      <div className="flex gap-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3 py-1 border border-gray-300 hover:bg-gray-50 disabled:opacity-50"
        >
          Prev
        </button>
        <span className="px-3 py-1 bg-gray-100 border border-gray-200">
          {currentPage}/{totalPages}
        </span>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="px-3 py-1 border border-gray-300 hover:bg-gray-50 disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
});

const ManagerDashboard = () => {
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState(null);
  const [apptStats, setApptStats] = useState(null);
  const [managerStats, setManagerStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Filter State
  const [apptFilter, setApptFilter] = useState('today');
  const [customRange, setCustomRange] = useState({ start: '', end: '' });

  // Fetch Appointment Stats Effect
  useEffect(() => {
    const fetchApptStats = async () => {
      let params = { filter: apptFilter };

      if (apptFilter === 'custom') {
        if (!customRange.start || !customRange.end) return;
        params.startDate = customRange.start;
        params.endDate = customRange.end;
      }

      const res = await managerService.getManagerAppointmentStats(params);

      if (res?.success) {
        const finalData = res.data?.data || res.data;
        setApptStats(finalData);
      }
    };

    fetchApptStats();
  }, [apptFilter, customRange]);

  // Refs for preventing duplicate calls
  const fetchingRef = useRef(false);
  const lastFetchRef = useRef(0);

  const fetchDashboard = useCallback(async (force = false) => {
    // Prevent duplicate calls within 3 seconds
    const now = Date.now();
    if (!force && now - lastFetchRef.current < 3000) return;
    if (fetchingRef.current && !force) return;

    try {
      fetchingRef.current = true;
      lastFetchRef.current = now;
      if (!refreshing) setLoading(true);
      setError(null);

      // Fetch dashboard and appointment stats in parallel
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const [res, managerStatsRes] = await Promise.all([
        managerService.getDashboard(),
        managerService.getStats({ refresh: force })
      ]);

      if (res.success) {
        setDashboard(res.data.data || res.data);
      } else {
        setError(res.error || "Failed to load dashboard");
      }

      if (managerStatsRes.success) {
        setManagerStats(managerStatsRes.data.data || managerStatsRes.data);
      }



    } catch (e) {
      setError("Failed to load dashboard");
    } finally {
      setLoading(false);
      setRefreshing(false);
      fetchingRef.current = false;
    }
  }, [refreshing]);

  useEffect(() => {
    fetchDashboard(true);
  }, []);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    fetchDashboard(true);
  }, [fetchDashboard]);

  // Format helpers
  const formatCurrency = useCallback((amount) => {
    if (!amount) return "₹0";
    return `₹${parseInt(amount).toLocaleString('en-IN')}`;
  }, []);

  const formatDate = useCallback((dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short'
    });
  }, []);

  const formatTime = useCallback((dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }, []);

  // Memoized analytics
  const analytics = useMemo(() => {
    if (!managerStats) return null;
    const stats = managerStats;
    const daysInMonth = Math.max(new Date().getDate(), 1);

    return {
      avgDailyRevenue: stats.monthlyRevenue / daysInMonth,
      avgDailyCustomers: (stats.monthlyCustomers / daysInMonth).toFixed(1),
    };
  }, [managerStats]);

  // Memoized paginated transactions
  const paginatedTransactions = useMemo(() => {
    if (!dashboard?.recentTransactions) return [];
    const start = (currentPage - 1) * itemsPerPage;
    return dashboard.recentTransactions.slice(start, start + itemsPerPage);
  }, [dashboard?.recentTransactions, currentPage, itemsPerPage]);

  const totalTransactions = dashboard?.recentTransactions?.length || 0;
  const totalPages = Math.ceil(totalTransactions / itemsPerPage);

  // Memoized stat cards
  const statCards = useMemo(() => [
    { icon: FaUsers, title: "Total Customers", value: managerStats?.totalCustomers ?? 0, iconBg: "bg-indigo-100", iconColor: "text-indigo-600" },
    { icon: FaUsers, title: "Total Staff", value: managerStats?.totalStaff ?? 0, iconBg: "bg-blue-100", iconColor: "text-blue-600" },
    { icon: FaMoneyBillWave, title: "Total Revenue", value: formatCurrency(managerStats?.totalRevenue), iconBg: "bg-green-100", iconColor: "text-green-600" },
    { icon: FaExchangeAlt, title: "Total Transactions", value: managerStats?.totalTransactions ?? 0, iconBg: "bg-purple-100", iconColor: "text-purple-600" },
    { icon: FaCalendarDay, title: "Today Revenue", value: formatCurrency(managerStats?.todayRevenue), iconBg: "bg-yellow-100", iconColor: "text-yellow-600" },
    { icon: FaCalendarAlt, title: "Monthly Revenue", value: formatCurrency(managerStats?.monthlyRevenue), iconBg: "bg-emerald-100", iconColor: "text-emerald-600" },
    { icon: FaChartLine, title: "Monthly Customers", value: managerStats?.monthlyCustomers ?? 0, iconBg: "bg-pink-100", iconColor: "text-pink-600" }
  ], [managerStats, formatCurrency]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-8 h-8 border-3 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="bg-red-50 border border-red-200 p-4 text-red-600 text-sm">{error}</div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-600">
            {dashboard?.manager?.name} • {dashboard?.business?.name}
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="p-2 bg-white border border-gray-200 hover:bg-gray-50 disabled:opacity-50"
        >
          <HiRefresh className={`text-gray-600 text-lg ${refreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
        {statCards.map((stat, i) => <StatCard key={i} {...stat} />)}
      </div>

      {/* Appointment Status with Filters */}
      <div className="bg-white border border-gray-200 p-4 mb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-indigo-600 flex items-center justify-center">
              <FaCalendarDay className="text-white text-sm" />
            </div>
            <h2 className="font-semibold text-gray-900">Appointment Status</h2>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setApptFilter('today')}
                className={`px-3 py-1 text-xs font-medium rounded ${apptFilter === 'today' ? 'bg-white  text-indigo-600' : 'text-gray-600 hover:bg-gray-200'}`}
              >Today</button>
              <button
                onClick={() => setApptFilter('tomorrow')}
                className={`px-3 py-1 text-xs font-medium rounded ${apptFilter === 'tomorrow' ? 'bg-white  text-indigo-600' : 'text-gray-600 hover:bg-gray-200'}`}
              >Tomorrow</button>
              <button
                onClick={() => setApptFilter('custom')}
                className={`px-3 py-1 text-xs font-medium rounded ${apptFilter === 'custom' ? 'bg-white  text-indigo-600' : 'text-gray-600 hover:bg-gray-200'}`}
              >Custom</button>
            </div>
            {apptFilter === 'custom' && (
              <div className="flex gap-2 items-center">
                <input
                  type="date"
                  className="px-2 py-1 border border-gray-300 rounded text-xs"
                  value={customRange.start}
                  onChange={e => setCustomRange(p => ({ ...p, start: e.target.value }))}
                />
                <span className="text-gray-400">-</span>
                <input
                  type="date"
                  className="px-2 py-1 border border-gray-300 rounded text-xs"
                  value={customRange.end}
                  onChange={e => setCustomRange(p => ({ ...p, end: e.target.value }))}
                />
              </div>
            )}
          </div>
        </div>

        {apptStats && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            <div className="text-center p-2 bg-indigo-50 rounded">
              <p className="text-xs text-gray-500 font-medium uppercase">Total</p>
              <p className="text-lg font-bold text-indigo-700">{apptStats.total || 0}</p>
            </div>
            <div className="text-center p-2 bg-yellow-50 rounded">
              <p className="text-xs text-gray-500 font-medium uppercase">Pending</p>
              <p className="text-lg font-bold text-yellow-700">{apptStats.pending || 0}</p>
            </div>
            <div className="text-center p-2 bg-blue-50 rounded">
              <p className="text-xs text-gray-500 font-medium uppercase">Confirmed</p>
              <p className="text-lg font-bold text-blue-700">{apptStats.confirmed || 0}</p>
            </div>
            <div className="text-center p-2 bg-green-50 rounded">
              <p className="text-xs text-gray-500 font-medium uppercase">Completed</p>
              <p className="text-lg font-bold text-green-700">{apptStats.completed || 0}</p>
            </div>
            <div className="text-center p-2 bg-red-50 rounded">
              <p className="text-xs text-gray-500 font-medium uppercase">Cancelled</p>
              <p className="text-lg font-bold text-red-700">{(apptStats.cancelled || 0) + (apptStats.noShow || 0)}</p>
            </div>
          </div>
        )}
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        {/* Business Info */}
        <div className="bg-white border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 bg-primary-600 flex items-center justify-center">
              <FaBuilding className="text-white text-sm" />
            </div>
            <h2 className="font-semibold text-gray-900">Business</h2>
          </div>
          <div>
            <InfoRow label="Name" value={dashboard?.business?.name || '—'} />
            <InfoRow label="Type" value={dashboard?.business?.type || '—'} />
            <InfoRow label="Branch" value={dashboard?.business?.branch || '—'} />
          </div>
        </div>

        {/* Performance */}
        <div className="bg-white border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 bg-primary-600 flex items-center justify-center">
              <FaChartLine className="text-white text-sm" />
            </div>
            <h2 className="font-semibold text-gray-900">Performance</h2>
          </div>
          <div>
            <InfoRow label="Avg Daily Revenue" value={formatCurrency(analytics?.avgDailyRevenue)} />
            <InfoRow label="Avg Daily Customers" value={analytics?.avgDailyCustomers ?? "0"} />
            <InfoRow label="Total Revenue" value={formatCurrency(managerStats?.monthlyRevenue)} isBorder />
          </div>
        </div>
      </div>

      {/* Transactions */}
      <div className="bg-white border border-gray-200 p-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-7 h-7 bg-primary-600 flex items-center justify-center">
            <FaExchangeAlt className="text-white text-sm" />
          </div>
          <h2 className="font-semibold text-gray-900">Recent Transactions</h2>
        </div>

        {paginatedTransactions.length > 0 ? (
          <>
            <div className="overflow-x-auto -mx-4 px-4">
              <table className="min-w-full">
                <thead className="bg-gray-50 border-y border-gray-200">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Customer</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Service</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Amount</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Date</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 hidden sm:table-cell">Time</th>
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
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalTransactions}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
            />
          </>
        ) : (
          <div className="text-center py-8 text-gray-500 text-sm">No transactions found</div>
        )}
      </div>
    </div >
  );
};

export default memo(ManagerDashboard);
