import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  FaChartLine,
  FaUsers,
  FaDollarSign,
  FaArrowLeft,
  FaSpinner,
  FaArrowUp,
  FaArrowDown,
  FaTrophy,
  FaCalendarAlt,
  FaMedal
} from 'react-icons/fa'
import { toast } from 'react-hot-toast'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import adminService from '../../../../services/admin/adminService'

const AdminDailyBusinessAnalytics = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [analytics, setAnalytics] = useState(null)
  const [period, setPeriod] = useState('monthly')
  const [businessFilter, setBusinessFilter] = useState('')
  const [viewMode, setViewMode] = useState({
    trends: 'graph',
    services: 'graph',
    staff: 'graph'
  })

  // Ref to prevent duplicate API calls
  const fetchingRef = useRef(false)

  const fetchAnalytics = useCallback(async () => {
    // Prevent duplicate calls
    if (fetchingRef.current) {
      return
    }

    try {
      fetchingRef.current = true
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
      fetchingRef.current = false
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

  // Memoized summary cards configuration
  const summaryCards = useMemo(() => {
    if (!analytics) return []
    return [
      {
        icon: FaDollarSign,
        iconColor: 'text-green-600',
        label: 'Total Revenue',
        value: formatCurrency(analytics.totalRevenue),
        growth: analytics.revenueGrowth,
        subText: analytics.averageDailyRevenue ? `Avg: ${formatCurrency(analytics.averageDailyRevenue)}/day` : null
      },
      {
        icon: FaUsers,
        iconColor: 'text-blue-600',
        label: 'Total Customers',
        value: analytics.totalCustomers,
        growth: analytics.customerGrowth,
        subText: analytics.averageDailyCustomers ? `Avg: ${analytics.averageDailyCustomers.toFixed(1)}/day` : null
      },
      {
        icon: FaDollarSign,
        iconColor: 'text-red-600',
        label: 'Total Expenses',
        value: formatCurrency(analytics.totalExpenses),
        valueColor: 'text-red-600',
        subText: analytics.efficiencyMetrics?.expenseRatio !== undefined
          ? `${formatPercent(analytics.efficiencyMetrics.expenseRatio)} of revenue`
          : null
      },
      {
        icon: FaChartLine,
        iconColor: 'text-purple-600',
        label: 'Net Profit',
        value: formatCurrency(analytics.netProfit),
        valueColor: analytics.netProfit >= 0 ? 'text-green-600' : 'text-red-600',
        badge: analytics.profitMargin !== undefined ? `${formatPercent(analytics.profitMargin)} margin` : null
      }
    ]
  }, [analytics])

  // Memoized peak performance cards
  const peakCards = useMemo(() => {
    if (!analytics?.peakPerformance) return []
    const cards = []

    if (analytics.peakPerformance.bestDay) {
      cards.push({
        icon: FaCalendarAlt,
        iconColor: 'text-green-600',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        label: 'Best Day',
        title: formatDate(analytics.peakPerformance.bestDay.date),
        value: formatCurrency(analytics.peakPerformance.bestDay.revenue),
        valueColor: 'text-green-700',
        subText: `${analytics.peakPerformance.bestDay.customers} customers`
      })
    }

    if (analytics.peakPerformance.bestService) {
      cards.push({
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
        label: 'Top Service',
        title: analytics.peakPerformance.bestService.name,
        value: formatCurrency(analytics.peakPerformance.bestService.revenue),
        valueColor: 'text-blue-700',
        subText: `${formatPercent(analytics.peakPerformance.bestService.percentage)} of revenue`
      })
    }

    if (analytics.peakPerformance.bestStaff) {
      cards.push({
        bgColor: 'bg-purple-50',
        borderColor: 'border-purple-200',
        label: 'Top Staff',
        title: analytics.peakPerformance.bestStaff.staffName ||
          analytics.peakPerformance.bestStaff.staff?.name ||
          'Staff Member',
        value: formatCurrency(analytics.peakPerformance.bestStaff.revenue),
        valueColor: 'text-purple-700',
        subText: `${analytics.peakPerformance.bestStaff.customersServed} customers`
      })
    }

    return cards
  }, [analytics])

  // Memoized customer metrics
  const customerMetrics = useMemo(() => {
    if (!analytics?.customerMetrics) return []
    return [
      { label: 'Avg Revenue/Customer', value: formatCurrency(analytics.customerMetrics.averageRevenuePerCustomer), color: 'text-gray-900' },
      { label: 'Repeat Customer Rate', value: formatPercent(analytics.customerMetrics.repeatCustomerRate), color: 'text-blue-600' },
      { label: 'New Customer Rate', value: formatPercent(analytics.customerMetrics.newCustomerRate), color: 'text-green-600' },
      { label: 'Avg Transaction Value', value: formatCurrency(analytics.customerMetrics.averageTransactionValue), color: 'text-gray-900' }
    ]
  }, [analytics])

  // Memoized efficiency metrics
  const efficiencyMetrics = useMemo(() => {
    if (!analytics?.efficiencyMetrics) return []
    return [
      { label: 'Revenue per Staff', value: formatCurrency(analytics.efficiencyMetrics.revenuePerStaff), color: 'text-gray-900' },
      { label: 'Customers per Staff', value: analytics.efficiencyMetrics.customersPerStaff.toFixed(1), color: 'text-gray-900' },
      {
        label: 'Expense Ratio',
        value: formatPercent(analytics.efficiencyMetrics.expenseRatio),
        color: analytics.efficiencyMetrics.expenseRatio > 70 ? 'text-red-600' : 'text-gray-900'
      }
    ]
  }, [analytics])

  // Memoized chart data for trends
  const chartData = useMemo(() => {
    if (!analytics?.trends) return []
    return analytics.trends.map(trend => ({
      date: formatDate(trend.date),
      revenue: trend.revenue || 0,
      profit: trend.profit || 0,
      customers: trend.customers || 0
    }))
  }, [analytics])

  // Memoized chart data for top services
  const servicesChartData = useMemo(() => {
    if (!analytics?.topServices) return []
    return analytics.topServices.slice(0, 5).map(service => ({
      name: service.name,
      revenue: service.revenue || 0,
      customers: service.customers || 0
    }))
  }, [analytics])

  // Memoized chart data for staff performance
  const staffChartData = useMemo(() => {
    if (!analytics?.staffPerformance) return []
    return analytics.staffPerformance.slice(0, 5).map(perf => ({
      name: perf.staffName || perf.staff?.name || 'Staff',
      revenue: perf.revenue || 0,
      customers: perf.customersServed || 0
    }))
  }, [analytics])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <FaSpinner className="animate-spin text-4xl text-primary-600" />
      </div>
    )
  }

  if (error && !analytics) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="bg-red-50 border border-red-200  p-4 text-red-600">
          {error}
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 text-sm"
        >
          <FaArrowLeft />
          <span>Back</span>
        </button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Business Analytics</h1>
            <p className="text-sm text-gray-600 mt-1">Performance insights and metrics</p>
          </div>
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="px-4 py-2 border border-gray-300  focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
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
            {summaryCards.map((card, index) => (
              <div key={index} className="bg-white  border border-gray-200 p-5">
                <div className="flex items-center justify-between mb-2">
                  {/* <card.icon className={`${card.iconColor} text-xl`} /> */}
                  {card.growth !== undefined && (
                    <span className={`flex items-center gap-1 text-xs ${card.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {card.growth >= 0 ? <FaArrowUp /> : <FaArrowDown />}
                      {formatPercent(Math.abs(card.growth))}
                    </span>
                  )}
                  {card.badge && (
                    <span className="text-xs text-gray-500">{card.badge}</span>
                  )}
                </div>
                <p className="text-xs text-gray-500 mb-1">{card.label}</p>
                <p className={`text-xl font-bold ${card.valueColor || 'text-gray-900'}`}>{card.value}</p>
                {card.subText && (
                  <p className="text-xs text-gray-500 mt-1">{card.subText}</p>
                )}
              </div>
            ))}
          </div>

          {/* Peak Performance */}
          {peakCards.length > 0 && (
            <div className="bg-white  border border-gray-200 p-5 mb-6">
              <h2 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FaTrophy className="text-yellow-500 text-sm" />
                Peak Performance
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {peakCards.map((card, index) => (
                  <div key={index} className={`p-4 ${card.bgColor}  border ${card.borderColor}`}>
                    {card.icon && (
                      <div className="flex items-center gap-2 mb-2">
                        <card.icon className={`${card.iconColor} text-sm`} />
                        <span className="font-medium text-sm text-gray-900">{card.label}</span>
                      </div>
                    )}
                    {!card.icon && (
                      <span className="font-medium text-sm text-gray-900 block mb-2">{card.label}</span>
                    )}
                    <p className="text-xs text-gray-600 mb-1 capitalize">{card.title}</p>
                    <p className={`text-base font-bold ${card.valueColor}`}>{card.value}</p>
                    <p className="text-xs text-gray-600">{card.subText}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Customer & Efficiency Metrics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {customerMetrics.length > 0 && (
              <div className="bg-white  border border-gray-200 p-5">
                <h2 className="text-base font-semibold text-gray-900 mb-4">Customer Insights</h2>
                <div className="space-y-3">
                  {customerMetrics.map((metric, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">{metric.label}</span>
                      <span className={`text-sm font-semibold ${metric.color}`}>{metric.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {efficiencyMetrics.length > 0 && (
              <div className="bg-white  border border-gray-200 p-5">
                <h2 className="text-base font-semibold text-gray-900 mb-4">Operational Efficiency</h2>
                <div className="space-y-3">
                  {efficiencyMetrics.map((metric, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">{metric.label}</span>
                      <span className={`text-sm font-semibold ${metric.color}`}>{metric.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Insights */}
          {analytics.insights && analytics.insights.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200  p-5 mb-6">
              <h2 className="text-base font-semibold text-gray-900 mb-3">Business Insights</h2>
              <ul className="space-y-2">
                {analytics.insights.map((insight, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                    <span className="text-yellow-600 mt-0.5">•</span>
                    <span>{insight}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Top Services */}
          {analytics.topServices && analytics.topServices.length > 0 && (
            <div className="bg-white  border border-gray-200 p-5 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-semibold text-gray-900">Top Services</h2>

                {/* View Toggle Tabs */}
                <div className="flex gap-2">
                  <button
                    onClick={() => setViewMode(prev => ({ ...prev, services: 'graph' }))}
                    className={`px-3 py-1.5 text-sm font-medium  transition-colors ${viewMode.services === 'graph'
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                  >
                    Graph
                  </button>
                  <button
                    onClick={() => setViewMode(prev => ({ ...prev, services: 'list' }))}
                    className={`px-3 py-1.5 text-sm font-medium  transition-colors ${viewMode.services === 'list'
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                  >
                    List
                  </button>
                </div>
              </div>

              {/* Graph View */}
              {viewMode.services === 'graph' && (
                <div>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={servicesChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis
                        dataKey="name"
                        tick={{ fontSize: 11 }}
                        stroke="#9ca3af"
                        angle={-45}
                        textAnchor="end"
                        height={80}
                      />
                      <YAxis
                        tick={{ fontSize: 12 }}
                        stroke="#9ca3af"
                        tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#fff',
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          fontSize: '12px'
                        }}
                        formatter={(value, name) => {
                          if (name === 'revenue') return [formatCurrency(value), 'Revenue']
                          return [value, 'Customers']
                        }}
                      />
                      <Legend wrapperStyle={{ fontSize: '12px' }} />
                      <Bar dataKey="revenue" fill="#10b981" name="Revenue" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* List View */}
              {viewMode.services === 'list' && (
                <div className="space-y-2">
                  {analytics.topServices.slice(0, 5).map((service, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 ">
                      <div className="flex items-center gap-3 flex-1">
                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary-100 text-primary-700 text-xs font-bold">
                          {index + 1}
                        </span>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900 capitalize">{service.name}</p>
                          <p className="text-xs text-gray-500">{service.customers} customers</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-gray-900">{formatCurrency(service.revenue)}</p>
                        <p className="text-xs text-primary-600">{formatPercent(service.percentage)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Staff Performance */}
          {analytics.staffPerformance && analytics.staffPerformance.length > 0 && (
            <div className="bg-white  border border-gray-200 p-5 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                  <FaMedal className="text-yellow-500 text-sm" />
                  Top Staff
                </h2>

                {/* View Toggle Tabs */}
                <div className="flex gap-2">
                  <button
                    onClick={() => setViewMode(prev => ({ ...prev, staff: 'graph' }))}
                    className={`px-3 py-1.5 text-sm font-medium  transition-colors ${viewMode.staff === 'graph'
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                  >
                    Graph
                  </button>
                  <button
                    onClick={() => setViewMode(prev => ({ ...prev, staff: 'list' }))}
                    className={`px-3 py-1.5 text-sm font-medium  transition-colors ${viewMode.staff === 'list'
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                  >
                    List
                  </button>
                </div>
              </div>

              {/* Graph View */}
              {viewMode.staff === 'graph' && (
                <div>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={staffChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis
                        dataKey="name"
                        tick={{ fontSize: 11 }}
                        stroke="#9ca3af"
                        angle={-45}
                        textAnchor="end"
                        height={80}
                      />
                      <YAxis
                        tick={{ fontSize: 12 }}
                        stroke="#9ca3af"
                        tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#fff',
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          fontSize: '12px'
                        }}
                        formatter={(value, name) => {
                          if (name === 'revenue') return [formatCurrency(value), 'Revenue']
                          return [value, 'Customers']
                        }}
                      />
                      <Legend wrapperStyle={{ fontSize: '12px' }} />
                      <Bar dataKey="revenue" fill="#3b82f6" name="Revenue" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* List View */}
              {viewMode.staff === 'list' && (
                <div className="space-y-2">
                  {analytics.staffPerformance.slice(0, 5).map((perf, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 ">
                      <div className="flex items-center gap-3 flex-1">
                        <span className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${index === 0 ? 'bg-yellow-100 text-yellow-700' :
                          index === 1 ? 'bg-gray-200 text-gray-700' :
                            index === 2 ? 'bg-orange-100 text-orange-700' :
                              'bg-primary-100 text-primary-700'
                          }`}>
                          {index + 1}
                        </span>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{perf.staffName || perf.staff?.name || `Staff #${index + 1}`}</p>
                          <p className="text-xs text-gray-500">{perf.customersServed || 0} customers</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-gray-900">{formatCurrency(perf.revenue)}</p>
                        {perf.commission > 0 && (
                          <p className="text-xs text-green-600">+{formatCurrency(perf.commission)}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Trends */}
          {analytics.trends && analytics.trends.length > 0 && (
            <div className="bg-white  border border-gray-200 p-5 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-semibold text-gray-900">Daily Trends</h2>

                {/* View Toggle Tabs */}
                <div className="flex gap-2">
                  <button
                    onClick={() => setViewMode(prev => ({ ...prev, trends: 'graph' }))}
                    className={`px-3 py-1.5 text-sm font-medium  transition-colors ${viewMode.trends === 'graph'
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                  >
                    Graph
                  </button>
                  <button
                    onClick={() => setViewMode(prev => ({ ...prev, trends: 'list' }))}
                    className={`px-3 py-1.5 text-sm font-medium  transition-colors ${viewMode.trends === 'list'
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                  >
                    List
                  </button>
                </div>
              </div>

              {/* Graph View */}
              {viewMode.trends === 'graph' && (
                <div>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis
                        dataKey="date"
                        tick={{ fontSize: 12 }}
                        stroke="#9ca3af"
                      />
                      <YAxis
                        tick={{ fontSize: 12 }}
                        stroke="#9ca3af"
                        tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#fff',
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          fontSize: '12px'
                        }}
                        formatter={(value, name) => {
                          if (name === 'revenue' || name === 'profit') {
                            return [formatCurrency(value), name.charAt(0).toUpperCase() + name.slice(1)]
                          }
                          return [value, name.charAt(0).toUpperCase() + name.slice(1)]
                        }}
                      />
                      <Legend
                        wrapperStyle={{ fontSize: '12px' }}
                        iconType="line"
                      />
                      <Line
                        type="monotone"
                        dataKey="revenue"
                        stroke="#10b981"
                        strokeWidth={2}
                        dot={{ fill: '#10b981', r: 4 }}
                        activeDot={{ r: 6 }}
                        name="Revenue"
                      />
                      <Line
                        type="monotone"
                        dataKey="profit"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        dot={{ fill: '#3b82f6', r: 4 }}
                        activeDot={{ r: 6 }}
                        name="Profit"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* List View */}
              {viewMode.trends === 'list' && (
                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {analytics.trends.map((trend, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border border-gray-200  hover:bg-gray-50">
                      <div className="flex items-center gap-3">
                        <FaCalendarAlt className="text-gray-400 text-sm" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">{formatDate(trend.date)}</p>
                          <p className="text-xs text-gray-500">{trend.customers || 0} customers</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-gray-900">{formatCurrency(trend.revenue)}</p>
                        <p className={`text-xs ${trend.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {formatCurrency(trend.profit)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default AdminDailyBusinessAnalytics
