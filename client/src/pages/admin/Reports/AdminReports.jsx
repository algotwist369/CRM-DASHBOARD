import React, { useEffect, useState, useCallback } from 'react'
import { useSelector } from 'react-redux'
import apiClient from '../../../services/api/client'
import { endpoints } from '../../../constants/api/endpoints'
import { startOfMonth, endOfMonth, subDays, format } from 'date-fns'
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell
} from 'recharts'
import {
  FaDownload, FaFileCsv, FaFilePdf, FaCalendarAlt, FaSpinner, FaChartLine,
  FaRupeeSign, FaUsers, FaMoneyBillWave, FaChartBar, FaChartPie, FaFilter,
  FaTimes, FaCheckCircle, FaClock, FaBriefcase
} from 'react-icons/fa'

const PAGE_LIMIT = 20
const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']

const AdminReports = () => {
  const user = useSelector(state => state.auth?.user)
  const userRole = user?.role

  // State
  const [activeTab, setActiveTab] = useState('dashboard') // dashboard | reports
  const [reports, setReports] = useState([])
  const [analytics, setAnalytics] = useState(null)
  const [summary, setSummary] = useState(null)
  const [trends, setTrends] = useState([])
  const [businesses, setBusinesses] = useState([])

  // Pagination
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  // Loading states
  const [loading, setLoading] = useState(true)
  const [analyticsLoading, setAnalyticsLoading] = useState(false)
  const [trendsLoading, setTrendsLoading] = useState(false)
  const [exporting, setExporting] = useState(null)

  // Filters
  const [selectedBusiness, setSelectedBusiness] = useState('all')
  const [dateRange, setDateRange] = useState({
    start: '',
    end: ''
  })
  const [trendType, setTrendType] = useState('revenue') // revenue | customers | appointments

  const [error, setError] = useState(null)

  // Fetch businesses (for admin)
  useEffect(() => {
    window.scrollTo(0, 0)
    const fetchBusinesses = async () => {
      if (userRole === 'admin') {
        try {
          const res = await apiClient.get(endpoints.admin.businesses)
          if (res.data.success) {
            setBusinesses(res.data.data || [])
          }
        } catch (e) {
          console.error('Failed to fetch businesses:', e)
        }
      }
    }
    fetchBusinesses()
  }, [userRole])

  // Fetch reports
  const fetchReports = useCallback(async (pageNum = 1) => {
    try {
      setLoading(true)
      setError(null)
      const res = await apiClient.get(endpoints.reports.list, {
        params: { page: pageNum, limit: PAGE_LIMIT }
      })
      const payload = res.data
      setReports(payload?.data || [])
      setTotalPages(payload?.pagination?.pages || 1)
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to load reports')
    } finally {
      setLoading(false)
    }
  }, [])

  // Fetch analytics
  const fetchAnalytics = useCallback(async () => {
    try {
      setAnalyticsLoading(true)
      const params = {
        startDate: dateRange.start,
        endDate: dateRange.end
      }
      if (selectedBusiness !== 'all') {
        params.businessId = selectedBusiness
      }

      const res = await apiClient.get(endpoints.reports.analytics, { params })
      if (res.data.success) {
        setAnalytics(res.data.data)
      }
    } catch (e) {
      console.error('Failed to load analytics:', e)
    } finally {
      setAnalyticsLoading(false)
    }
  }, [dateRange, selectedBusiness])

  // Fetch summary
  const fetchSummary = useCallback(async () => {
    try {
      const params = {}
      if (selectedBusiness !== 'all') {
        params.businessId = selectedBusiness
      }

      const res = await apiClient.get(endpoints.reports.summary, { params })
      if (res.data.success) {
        setSummary(res.data.data)
      }
    } catch (e) {
      console.error('Failed to load summary:', e)
    }
  }, [selectedBusiness])

  // Fetch trends
  const fetchTrends = useCallback(async () => {
    try {
      setTrendsLoading(true)
      const params = {
        type: trendType,
        limit: 30
      }
      if (selectedBusiness !== 'all') {
        params.businessId = selectedBusiness
      }

      const res = await apiClient.get(endpoints.reports.trends, { params })
      if (res.data.success) {
        setTrends(res.data.data || [])
      }
    } catch (e) {
      console.error('Failed to load trends:', e)
    } finally {
      setTrendsLoading(false)
    }
  }, [trendType, selectedBusiness])

  // Initial load
  useEffect(() => {
    fetchReports(page)
    fetchSummary()
  }, [page, fetchReports, fetchSummary])

  // Load analytics when filters change
  useEffect(() => {
    if (activeTab === 'dashboard') {
      fetchAnalytics()
      fetchTrends()
    }
  }, [activeTab, dateRange, selectedBusiness, fetchAnalytics, fetchTrends])

  // Export reports
  const exportReports = async (format = 'csv') => {
    try {
      setExporting(format)
      const res = await apiClient.get(endpoints.reports.export, {
        params: { format, scope: userRole === 'admin' ? 'admin' : 'manager' },
        responseType: format === 'csv' ? 'blob' : 'arraybuffer'
      })
      const blob = new Blob([res.data], {
        type: format === 'csv' ? 'text/csv' : 'application/pdf'
      })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `reports-${format}-${new Date().toISOString().split('T')[0]}.${format}`
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)
    } catch (e) {
      alert(e.response?.data?.message || 'Failed to export reports')
    } finally {
      setExporting(null)
    }
  }

  // Utility functions
  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return '—'
    return `₹${amount.toLocaleString('en-IN')}`
  }

  const formatNumber = (num) => {
    if (!num && num !== 0) return '0'
    return num.toLocaleString('en-IN')
  }

  // Quick date presets
  const setQuickDate = (preset) => {
    const today = new Date()
    let start, end

    switch (preset) {
      case 'today':
        start = end = format(today, 'yyyy-MM-dd')
        break
      case 'week':
        start = format(subDays(today, 7), 'yyyy-MM-dd')
        end = format(today, 'yyyy-MM-dd')
        break
      case 'month':
        start = format(startOfMonth(today), 'yyyy-MM-dd')
        end = format(endOfMonth(today), 'yyyy-MM-dd')
        break
      case 'lastMonth':
        const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1)
        start = format(startOfMonth(lastMonth), 'yyyy-MM-dd')
        end = format(endOfMonth(lastMonth), 'yyyy-MM-dd')
        break
      default:
        return
    }

    setDateRange({ start, end })
  }

  return (
    <div className="p-3 sm:p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800 flex items-center gap-2">
            <FaChartLine className="text-primary-600" />
            Business Reports & Analytics
          </h1>
          <p className="text-sm text-gray-600">
            {userRole === 'admin' ? 'Comprehensive analytics across all businesses' : 'Your business performance insights'}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => exportReports('csv')}
            disabled={exporting}
            className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 transition-colors text-sm font-medium"
          >
            {exporting === 'csv' ? <FaSpinner className="animate-spin" /> : <FaFileCsv />}
            <span className="hidden sm:inline">{exporting === 'csv' ? 'Exporting...' : 'CSV'}</span>
          </button>
          <button
            onClick={() => exportReports('pdf')}
            disabled={exporting}
            className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 transition-colors text-sm font-medium"
          >
            {exporting === 'pdf' ? <FaSpinner className="animate-spin" /> : <FaFilePdf />}
            <span className="hidden sm:inline">{exporting === 'pdf' ? 'Exporting...' : 'PDF'}</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white   border border-gray-200 mb-6">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex-1 sm:flex-none px-6 py-3 font-medium text-sm transition-colors ${activeTab === 'dashboard'
              ? 'text-primary-600 border-b-2 border-primary-600 bg-primary-50'
              : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
              }`}
          >
            <span className="flex items-center justify-center gap-2">
              <FaChartBar />
              Dashboard
            </span>
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className={`flex-1 sm:flex-none px-6 py-3 font-medium text-sm transition-colors ${activeTab === 'reports'
              ? 'text-primary-600 border-b-2 border-primary-600 bg-primary-50'
              : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
              }`}
          >
            <span className="flex items-center justify-center gap-2">
              <FaBriefcase />
              Reports List
            </span>
          </button>
        </div>
      </div>

      {/* Dashboard Tab */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          {/* Filters */}
          <div className="bg-white   border border-gray-200 p-4">
            <div className="flex flex-col lg:flex-row lg:items-center gap-4">
              <div className="flex items-center gap-2">
                <FaFilter className="text-gray-600" />
                <span className="text-sm font-semibold text-gray-700">Filters</span>
              </div>

              <div className="flex flex-col sm:flex-row flex-wrap gap-3 flex-1">
                {/* Business Filter (Admin only) */}
                {userRole === 'admin' && (
                  <select
                    value={selectedBusiness}
                    onChange={(e) => setSelectedBusiness(e.target.value)}
                    className="px-4 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm bg-white"
                  >
                    <option value="all">All Businesses</option>
                    {businesses.map(b => (
                      <option key={b._id} value={b._id}>{b.name}</option>
                    ))}
                  </select>
                )}

                {/* Date Range */}
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                  className="px-4 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                />
                <span className="flex items-center text-gray-500">to</span>
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                  className="px-4 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                />

                {/* Quick Dates */}
                <div className="flex gap-2">
                  <button onClick={() => setQuickDate('today')} className="px-3 py-2 text-xs border border-gray-300 hover:bg-gray-50">Today</button>
                  <button onClick={() => setQuickDate('week')} className="px-3 py-2 text-xs border border-gray-300 hover:bg-gray-50">7 Days</button>
                  <button onClick={() => setQuickDate('month')} className="px-3 py-2 text-xs border border-gray-300 hover:bg-gray-50">This Month</button>
                </div>
              </div>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200  p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-blue-700 font-medium mb-1">Total Revenue</p>
                  <p className="text-xl font-bold text-blue-900">
                    {formatCurrency(analytics?.summary?.totalRevenue || summary?.revenue || 0)}
                  </p>
                </div>
                <FaRupeeSign className="w-8 h-8 text-blue-600 opacity-50" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200  p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-green-700 font-medium mb-1">Net Profit</p>
                  <p className="text-xl font-bold text-green-900">
                    {formatCurrency(analytics?.summary?.netProfit || summary?.profit || 0)}
                  </p>
                </div>
                <FaMoneyBillWave className="w-8 h-8 text-green-600 opacity-50" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200  p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-purple-700 font-medium mb-1">Customers</p>
                  <p className="text-xl font-bold text-purple-900">
                    {formatNumber(analytics?.summary?.totalCustomers || summary?.customers || 0)}
                  </p>
                </div>
                <FaUsers className="w-8 h-8 text-purple-600 opacity-50" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200  p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-orange-700 font-medium mb-1">Appointments</p>
                  <p className="text-xl font-bold text-orange-900">
                    {formatNumber(analytics?.summary?.totalAppointments || summary?.appointments || 0)}
                  </p>
                </div>
                <FaCalendarAlt className="w-8 h-8 text-orange-600 opacity-50" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-teal-50 to-teal-100 border border-teal-200  p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-teal-700 font-medium mb-1">Completion Rate</p>
                  <p className="text-xl font-bold text-teal-900">
                    {analytics?.summary?.appointmentCompletionRate || 0}%
                  </p>
                </div>
                <FaCheckCircle className="w-8 h-8 text-teal-600 opacity-50" />
              </div>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue Trend Chart */}
            <div className="bg-white   border border-gray-200 p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">
                  {trendType === 'revenue' ? 'Revenue Trends' :
                    trendType === 'customers' ? 'Customer Growth' : 'Appointment Trends'}
                </h3>
                <select
                  value={trendType}
                  onChange={(e) => setTrendType(e.target.value)}
                  className="px-3 py-1 border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="revenue">Revenue</option>
                  <option value="customers">Customers</option>
                  <option value="appointments">Appointments</option>
                </select>
              </div>

              {trendsLoading ? (
                <div className="h-64 flex items-center justify-center">
                  <FaSpinner className="w-8 h-8 text-primary-600 animate-spin" />
                </div>
              ) : trends.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  {trendType === 'revenue' ? (
                    <LineChart data={trends}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="value" stroke="#3b82f6" name="Revenue" strokeWidth={2} />
                      <Line type="monotone" dataKey="expenses" stroke="#ef4444" name="Expenses" strokeWidth={2} />
                      <Line type="monotone" dataKey="profit" stroke="#10b981" name="Profit" strokeWidth={2} />
                    </LineChart>
                  ) : (
                    <AreaChart data={trends}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Area type="monotone" dataKey="value" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.6} />
                    </AreaChart>
                  )}
                </ResponsiveContainer>
              ) : (
                <div className="h-64 flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <FaChartLine className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                    <p>No trend data available</p>
                  </div>
                </div>
              )}
            </div>

            {/* Customer Tier Distribution */}
            <div className="bg-white   border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Customer Distribution by Tier</h3>
              {analyticsLoading ? (
                <div className="h-64 flex items-center justify-center">
                  <FaSpinner className="w-8 h-8 text-primary-600 animate-spin" />
                </div>
              ) : analytics?.customers?.byTier?.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={analytics.customers.byTier}
                      dataKey="count"
                      nameKey="_id"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label={(entry) => `${entry._id || 'None'} (${entry.count})`}
                    >
                      {analytics.customers.byTier.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-64 flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <FaChartPie className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                    <p>No customer data available</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Top Spenders & Recent Signups */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Spenders */}
            <div className="bg-white border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Top 50 Spenders</h3>
              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                {analytics?.customers?.topSpenders?.slice(0, 50).map((customer, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <div>
                      <p className="font-medium text-gray-800">{customer.fullName}</p>
                      <p className="text-xs text-gray-500">{customer.email}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-green-600">{formatCurrency(customer.totalSpent)}</p>
                      <p className="text-xs text-gray-500">{customer.visits} visits</p>
                    </div>
                  </div>
                )) || <p className="text-gray-500 text-center py-4">No data available</p>}
              </div>
            </div>

            {/* Appointment Status */}
            <div className="bg-white   border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Appointment Status</h3>
              {analytics?.appointments?.byStatus?.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={analytics.appointments.byStatus}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="_id" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-64 flex items-center justify-center text-gray-500">
                  <p>No appointment data available</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Reports List Tab */}
      {activeTab === 'reports' && (
        <div className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 p-3 text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Reports Table */}
          <div className="bg-white  border  overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <FaSpinner className="w-8 h-8 text-primary-600 animate-spin" />
              </div>
            ) : reports.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                <FaCalendarAlt className="w-12 h-12 mb-3 text-gray-400" />
                <p className="text-lg font-medium">No reports found</p>
                <p className="text-sm">No daily business records have been created yet.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">Date</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">Manager</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">Customers</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">Income</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">Expenses</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">Profit</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {reports.map((r, index) => (
                      <tr key={r._id || r.id || `report-${index}`} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 text-gray-700">
                          {r.date ? new Date(r.date).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          }) : '—'}
                        </td>
                        <td className="px-4 py-3 text-gray-700">
                          {r.manager?.username || r.manager?.name || '—'}
                        </td>
                        <td className="px-4 py-3 text-gray-700">{r.totalCustomers || 0}</td>
                        <td className="px-4 py-3 text-green-700 font-medium">{formatCurrency(r.totalIncome || 0)}</td>
                        <td className="px-4 py-3 text-red-600">{formatCurrency(r.totalExpenses || 0)}</td>
                        <td className="px-4 py-3 text-blue-700 font-semibold">
                          {formatCurrency((r.totalIncome || 0) - (r.totalExpenses || 0))}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${r.isCompleted !== false
                            ? 'bg-green-100 text-green-700'
                            : 'bg-yellow-100 text-yellow-700'
                            }`}>
                            {r.isCompleted !== false ? 'Completed' : 'In Progress'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white  p-4 border">
              <div className="text-sm text-gray-600">
                Page {page} of {totalPages}
              </div>
              <div className="flex items-center gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-colors"
                >
                  Previous
                </button>
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default AdminReports