import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import {
  FaChartLine,
  FaUsers,
  FaRupeeSign,
  FaArrowLeft,
  FaSpinner,
  FaCalendarAlt,
  FaArrowUp,
  FaArrowDown,
  FaStar,
  FaChartBar,
  FaChartPie
} from 'react-icons/fa'
import managerService from '../../../../services/manager/managerService'
import {
  formatCurrency,
  formatNumber,
  normalizeCustomerAnalyticsResponse,
  SEGMENT_META
} from '../utils/customerUtils'

const CustomerAnalytics = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [analytics, setAnalytics] = useState(null)
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  })
  const [groupBy, setGroupBy] = useState('daily')

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true)
      const params = {}
      if (dateRange.startDate) params.startDate = dateRange.startDate
      if (dateRange.endDate) params.endDate = dateRange.endDate
      if (groupBy) params.groupBy = groupBy

      const result = await managerService.getCustomerAnalyticsOverview(params)
      
      if (result.success) {
        const raw = result.data?.data || result.data
        const normalized = raw ? normalizeCustomerAnalyticsResponse(raw) : null

        if (normalized) {
          setAnalytics(normalized)
        } else {
          setAnalytics(null)
          toast.error('No analytics data available')
        }
      } else {
        toast.error(result.error || 'Failed to fetch analytics')
        setAnalytics(null)
      }
    } catch (error) {
      toast.error('Failed to fetch analytics')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }, [dateRange, groupBy])

  useEffect(() => {
    fetchAnalytics()
  }, [fetchAnalytics])

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <FaSpinner className="animate-spin mx-auto text-primary-600 text-4xl mb-4" />
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    )
  }

  if (!analytics) {
    return (
      <div className="p-6">
        <p className="text-gray-600">No analytics data available</p>
      </div>
    )
  }

  const { overview, segments, lifecycle, value, retention, preferences, growth } = analytics

  const segmentSummary = [
    { key: 'new', icon: <FaUsers className="text-green-500" /> },
    { key: 'returning', icon: <FaUsers className="text-purple-500" /> },
    { key: 'loyal', icon: <FaUsers className="text-yellow-500" /> },
    { key: 'inactive', icon: <FaUsers className="text-red-500" /> }
  ]

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/manager/customers')}
            className="p-2 hover:bg-gray-100  transition-colors"
          >
            <FaArrowLeft className="text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <FaChartLine className="text-primary-600" />
              Customer Analytics
            </h1>
            <p className="text-gray-600 mt-1">Comprehensive customer insights and trends</p>
          </div>
        </div>
      </div>

      {/* Date Range Filter */}
      <div className="bg-white   border border-gray-200 p-4">
        <div className="flex items-center gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
              className="px-3 py-2 border border-gray-300  focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
              className="px-3 py-2 border border-gray-300  focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Group By</label>
            <select
              value={groupBy}
              onChange={(e) => setGroupBy(e.target.value)}
              className="px-3 py-2 border border-gray-300  focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white   border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Total Customers</span>
            <FaUsers className="text-blue-500" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{formatNumber(overview.totalCustomers)}</p>
          {overview.newCustomers > 0 && (
            <p className="text-sm text-blue-600 mt-1">+{formatNumber(overview.newCustomers)} new in period</p>
          )}
        </div>

        {segmentSummary.map(({ key, icon }) => (
          <div key={key} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">{SEGMENT_META[key]?.label || key}</span>
              {icon}
            </div>
            <p className="text-3xl font-bold text-gray-900">{formatNumber(segments[key])}</p>
            <p className="text-xs text-gray-500 mt-1">{SEGMENT_META[key]?.description || ''}</p>
          </div>
        ))}
      </div>

      {/* Value Analysis */}
      {value && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white   border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FaChartBar />
              Customer Value
            </h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">Average First Visit</p>
                <p className="text-2xl font-bold text-gray-900">{formatNumber(value.avgFirstVisit || 0, { maximumFractionDigits: 1 })}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Average Total Spent</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(value.avgTotalSpent)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-blue-600">
                  {formatCurrency(value.totalRevenue)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white   border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FaStar />
              Customer Satisfaction
            </h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">Average Rating</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {(value.avgRating || 0).toFixed(1)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Average Loyalty Points</p>
                <p className="text-2xl font-bold text-purple-600">
                  {formatNumber(value.avgLoyaltyPoints || 0, { maximumFractionDigits: 0 })}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Growth Data */}
      {growth && growth.length > 0 && (
        <div className="bg-white   border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <FaChartLine />
            Customer Growth
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Period</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">New Customers</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {growth.map((item, index) => (
                  <tr key={index}>
                    <td className="px-4 py-3 text-sm text-gray-900">{item._id || item.period || 'N/A'}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{formatNumber(item.count || 0)}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-gray-900">{formatNumber(item.total || 0)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

export default CustomerAnalytics
