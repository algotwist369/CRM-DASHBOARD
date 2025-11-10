import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  FaChartLine,
  FaChartBar,
  FaUsers,
  FaRupeeSign,
  FaArrowLeft,
  FaSpinner,
  FaArrowUp,
  FaArrowDown,
  FaTrophy,
  FaUserTie,
  FaLightbulb,
  FaCalendarAlt,
  FaMedal
} from 'react-icons/fa'
import { toast } from 'react-hot-toast'
import adminService from '../../../../services/admin/adminService'

const AdminDailyBusinessAnalytics = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [analytics, setAnalytics] = useState(null)
  const [period, setPeriod] = useState('monthly')
  const [businessFilter, setBusinessFilter] = useState('')

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const params = { period }
      if (businessFilter) params.businessId = businessFilter
      const res = await adminService.getBusinessAnalytics(params)
      if (res.success) {
        setAnalytics(res.data?.data || res.data)
      } else {
        setError(res.error || 'Failed to fetch analytics')
        toast.error(res.error || 'Failed to fetch analytics')
      }
    } catch (e) {
      setError('Failed to fetch analytics')
      toast.error('Failed to fetch analytics')
    } finally {
      setLoading(false)
    }
  }, [period, businessFilter])

  useEffect(() => {
    fetchAnalytics()
  }, [fetchAnalytics])

  const formatCurrency = (amount) => {
    if (!amount) return '₹0'
    return `₹${parseInt(amount).toLocaleString('en-IN')}`
  }

  const formatPercent = (value) => {
    if (!value) return '0%'
    return `${parseFloat(value).toFixed(1)}%`
  }

  const formatDate = (dateString) => {
    if (!dateString) return '-'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <FaSpinner className="animate-spin text-4xl text-primary-600" />
      </div>
    )
  }

  if (error && !analytics) {
    return (
      <div className="p-3 sm:p-6 bg-gray-50 min-h-screen">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-600">
          {error}
        </div>
      </div>
    )
  }

  return (
    <div className="p-3 sm:p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <FaArrowLeft />
          <span>Back</span>
        </button>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Daily Business Analytics</h1>
            <p className="text-gray-600 mt-1">Comprehensive business performance insights</p>
          </div>
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="daily">Last 24 Hours</option>
            <option value="weekly">Last 7 Days</option>
            <option value="monthly">Last 30 Days</option>
            <option value="yearly">Last 12 Months</option>
          </select>
        </div>
      </div>

      {analytics && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {analytics.totalRevenue !== undefined && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-2">
                  <FaRupeeSign className="text-green-600 text-2xl" />
                  {analytics.revenueGrowth !== undefined && (
                    <span className={`flex items-center gap-1 text-sm ${
                      analytics.revenueGrowth >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {analytics.revenueGrowth >= 0 ? <FaArrowUp /> : <FaArrowDown />}
                      {formatPercent(Math.abs(analytics.revenueGrowth))}
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500 mb-1">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(analytics.totalRevenue)}
                </p>
                {analytics.averageDailyRevenue && (
                  <p className="text-xs text-gray-500 mt-1">
                    Avg: {formatCurrency(analytics.averageDailyRevenue)}/day
                  </p>
                )}
              </div>
            )}

            {analytics.totalCustomers !== undefined && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-2">
                  <FaUsers className="text-blue-600 text-2xl" />
                  {analytics.customerGrowth !== undefined && (
                    <span className={`flex items-center gap-1 text-sm ${
                      analytics.customerGrowth >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {analytics.customerGrowth >= 0 ? <FaArrowUp /> : <FaArrowDown />}
                      {formatPercent(Math.abs(analytics.customerGrowth))}
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500 mb-1">Total Customers</p>
                <p className="text-2xl font-bold text-gray-900">
                  {analytics.totalCustomers}
                </p>
                {analytics.averageDailyCustomers && (
                  <p className="text-xs text-gray-500 mt-1">
                    Avg: {analytics.averageDailyCustomers.toFixed(1)}/day
                  </p>
                )}
              </div>
            )}

            {analytics.totalExpenses !== undefined && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <FaRupeeSign className="text-red-600 text-2xl mb-2" />
                <p className="text-sm text-gray-500 mb-1">Total Expenses</p>
                <p className="text-2xl font-bold text-red-600">
                  {formatCurrency(analytics.totalExpenses)}
                </p>
                {analytics.efficiencyMetrics?.expenseRatio !== undefined && (
                  <p className="text-xs text-gray-500 mt-1">
                    {formatPercent(analytics.efficiencyMetrics.expenseRatio)} of revenue
                  </p>
                )}
              </div>
            )}

            {analytics.netProfit !== undefined && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-2">
                  <FaChartLine className="text-purple-600 text-2xl" />
                  {analytics.profitMargin !== undefined && (
                    <span className="text-sm text-gray-500">
                      {formatPercent(analytics.profitMargin)} margin
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500 mb-1">Net Profit</p>
                <p className={`text-2xl font-bold ${
                  analytics.netProfit >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {formatCurrency(analytics.netProfit)}
                </p>
              </div>
            )}
          </div>

          {/* Peak Performance */}
          {analytics.peakPerformance && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FaTrophy className="text-yellow-500" />
                Peak Performance
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {analytics.peakPerformance.bestDay && (
                  <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200">
                    <div className="flex items-center gap-2 mb-2">
                      <FaCalendarAlt className="text-green-600" />
                      <span className="font-semibold text-gray-900">Best Day</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">{formatDate(analytics.peakPerformance.bestDay.date)}</p>
                    <p className="text-lg font-bold text-green-700">
                      {formatCurrency(analytics.peakPerformance.bestDay.revenue)}
                    </p>
                    <p className="text-xs text-gray-600">
                      {analytics.peakPerformance.bestDay.customers} customers
                    </p>
                  </div>
                )}
                {analytics.peakPerformance.bestService && (
                  <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                    <div className="flex items-center gap-2 mb-2">
                      <FaChartBar className="text-blue-600" />
                      <span className="font-semibold text-gray-900">Top Service</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-1 capitalize">{analytics.peakPerformance.bestService.name}</p>
                    <p className="text-lg font-bold text-blue-700">
                      {formatCurrency(analytics.peakPerformance.bestService.revenue)}
                    </p>
                    <p className="text-xs text-gray-600">
                      {formatPercent(analytics.peakPerformance.bestService.percentage)} of revenue
                    </p>
                  </div>
                )}
                {analytics.peakPerformance.bestStaff && (
                  <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200">
                    <div className="flex items-center gap-2 mb-2">
                      <FaUserTie className="text-purple-600" />
                      <span className="font-semibold text-gray-900">Top Staff</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">
                      {analytics.peakPerformance.bestStaff.staffName || 
                       (typeof analytics.peakPerformance.bestStaff.staff === 'object' && analytics.peakPerformance.bestStaff.staff 
                        ? analytics.peakPerformance.bestStaff.staff.name 
                        : 'Staff Member')}
                    </p>
                    <p className="text-lg font-bold text-purple-700">
                      {formatCurrency(analytics.peakPerformance.bestStaff.revenue)}
                    </p>
                    <p className="text-xs text-gray-600">
                      {analytics.peakPerformance.bestStaff.customersServed} customers served
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Customer Metrics */}
          {analytics.customerMetrics && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Customer Insights</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500 mb-1">Avg. Revenue/Customer</p>
                  <p className="text-xl font-bold text-gray-900">
                    {formatCurrency(analytics.customerMetrics.averageRevenuePerCustomer)}
                  </p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500 mb-1">Repeat Customer Rate</p>
                  <p className="text-xl font-bold text-blue-600">
                    {formatPercent(analytics.customerMetrics.repeatCustomerRate)}
                  </p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500 mb-1">New Customer Rate</p>
                  <p className="text-xl font-bold text-green-600">
                    {formatPercent(analytics.customerMetrics.newCustomerRate)}
                  </p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500 mb-1">Avg. Transaction Value</p>
                  <p className="text-xl font-bold text-gray-900">
                    {formatCurrency(analytics.customerMetrics.averageTransactionValue)}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Efficiency Metrics */}
          {analytics.efficiencyMetrics && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Operational Efficiency</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500 mb-1">Revenue per Staff</p>
                  <p className="text-xl font-bold text-gray-900">
                    {formatCurrency(analytics.efficiencyMetrics.revenuePerStaff)}
                  </p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500 mb-1">Customers per Staff</p>
                  <p className="text-xl font-bold text-gray-900">
                    {analytics.efficiencyMetrics.customersPerStaff.toFixed(1)}
                  </p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500 mb-1">Expense Ratio</p>
                  <p className={`text-xl font-bold ${
                    analytics.efficiencyMetrics.expenseRatio > 70 ? 'text-red-600' : 'text-gray-900'
                  }`}>
                    {formatPercent(analytics.efficiencyMetrics.expenseRatio)}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Insights */}
          {analytics.insights && analytics.insights.length > 0 && (
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FaLightbulb className="text-yellow-600" />
                Business Insights & Recommendations
              </h2>
              <ul className="space-y-2">
                {analytics.insights.map((insight, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                    <span className="text-yellow-600 mt-1">•</span>
                    <span>{insight}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Top Services */}
          {analytics.topServices && analytics.topServices.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Top Services Performance</h2>
              <div className="space-y-3">
                {analytics.topServices.map((service, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary-100 text-primary-700 font-bold">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 capitalize">{service.name}</p>
                        <p className="text-sm text-gray-500">
                          {service.customers} customers • {formatCurrency(service.averagePrice)} avg
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">
                        {formatCurrency(service.revenue)}
                      </p>
                      {service.percentage !== undefined && (
                        <p className="text-sm text-primary-600 font-medium">
                          {formatPercent(service.percentage)}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Service Breakdown */}
          {analytics.serviceBreakdown && Object.keys(analytics.serviceBreakdown).length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Service Breakdown</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(analytics.serviceBreakdown).map(([service, data]) => (
                  <div key={service} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium text-gray-900 capitalize">{service}</p>
                      <span className="text-sm font-semibold text-primary-600">
                        {formatPercent(data.percentage)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">{data.customers} customers</span>
                      <span className="font-semibold text-gray-900">
                        {formatCurrency(data.revenue)}
                      </span>
                    </div>
                    <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-primary-600 h-2 rounded-full" 
                        style={{ width: `${Math.min(data.percentage || 0, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Staff Performance */}
          {analytics.staffPerformance && analytics.staffPerformance.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FaMedal className="text-yellow-500" />
                Top Performing Staff
              </h2>
              <div className="space-y-3">
                {analytics.staffPerformance.map((perf, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3 flex-1">
                      <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold ${
                        index === 0 ? 'bg-yellow-100 text-yellow-700' :
                        index === 1 ? 'bg-gray-100 text-gray-700' :
                        index === 2 ? 'bg-orange-100 text-orange-700' :
                        'bg-primary-100 text-primary-700'
                      }`}>
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {perf.staffName || (typeof perf.staff === 'object' && perf.staff ? perf.staff.name : null) || `Staff #${index + 1}`}
                        </p>
                        <p className="text-sm text-gray-500">
                          {perf.customersServed || 0} customers served
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">
                        {formatCurrency(perf.revenue)}
                      </p>
                      {perf.commission > 0 && (
                        <p className="text-sm text-green-600">
                          Commission: {formatCurrency(perf.commission)}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Trends */}
          {analytics.trends && analytics.trends.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Daily Trends</h2>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {analytics.trends.map((trend, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                    <div className="flex items-center gap-3">
                      <FaCalendarAlt className="text-gray-400" />
                      <div>
                        <p className="font-medium text-gray-900">
                          {formatDate(trend.date)}
                        </p>
                        <p className="text-xs text-gray-500">
                          {trend.customers || 0} customers
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">
                        {formatCurrency(trend.revenue)}
                      </p>
                      <p className={`text-xs ${
                        trend.profit >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        Profit: {formatCurrency(trend.profit)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default AdminDailyBusinessAnalytics
