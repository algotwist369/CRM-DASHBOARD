import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import {
  FaArrowLeft,
  FaLightbulb,
  FaChartLine,
  FaUsers,
  FaExclamationTriangle,
  FaCheckCircle,
  FaSpinner,
  FaArrowUp,
  FaArrowDown,
  FaDollarSign,
  FaStar,
  FaCalendarAlt,
  FaBullseye
} from 'react-icons/fa'
import managerService from '../../../../services/manager/managerService'
import {
  formatCurrency,
  formatNumber,
  formatPercentage,
  normalizeCustomerInsightsPayload,
  SEGMENT_META
} from '../utils/customerUtils'

const CustomerInsights = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [insightsData, setInsightsData] = useState(null)

  useEffect(() => {
    fetchInsights()
  }, [])

  const fetchInsights = async () => {
    try {
      setLoading(true)
      const result = await managerService.getCustomerInsights()
      
      if (result.success) {
        const raw = result.data?.data || result.data
        const normalized = raw ? normalizeCustomerInsightsPayload(raw) : null

        if (normalized) {
          setInsightsData(normalized)
        } else {
          toast.error('No insights data available')
          setInsightsData(null)
        }
      } else {
        toast.error(result.error || 'Failed to fetch insights')
        setInsightsData(null)
      }
    } catch (error) {
      toast.error('Failed to fetch insights')
      console.error(error)
      setInsightsData(null)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <FaSpinner className="animate-spin mx-auto text-primary-600 text-4xl mb-4" />
          <p className="text-gray-600">Loading customer insights...</p>
        </div>
      </div>
    )
  }

  if (!insightsData) {
    return (
      <div className="p-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <p className="text-gray-600 text-center">No insights data available</p>
        </div>
      </div>
    )
  }

  const { insights: insightList = [], recommendations = [], analytics } = insightsData
  const totalSegments = Object.values(analytics.segments || {}).reduce((sum, count) => sum + (count || 0), 0)

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/manager/customers')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <FaArrowLeft className="text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <FaLightbulb className="text-yellow-500" />
              Customer Insights
            </h1>
            <p className="text-gray-600 mt-1">AI-powered insights and actionable recommendations</p>
          </div>
        </div>
        <button
          onClick={fetchInsights}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          <FaChartLine />
          Refresh Insights
        </button>
      </div>

      {/* Key Insights */}
      <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl shadow-sm border border-yellow-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <FaExclamationTriangle className="text-yellow-600" />
          Key Insights
        </h2>
        {insightList.length === 0 ? (
          <p className="text-gray-600">No insights detected at this time.</p>
        ) : (
          <div className="space-y-3">
            {insightList.map((insight, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-white rounded-lg border border-yellow-200">
                <FaExclamationTriangle className="text-yellow-600 mt-1 flex-shrink-0" />
                <p className="text-gray-800 flex-1">{insight}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recommendations */}
      <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-xl shadow-sm border border-green-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <FaCheckCircle className="text-green-600" />
          Recommended Actions
        </h2>
        {recommendations.length === 0 ? (
          <p className="text-gray-600">No recommendations at this time.</p>
        ) : (
          <div className="space-y-3">
            {recommendations.map((recommendation, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-white rounded-lg border border-green-200">
                <FaBullseye className="text-green-600 mt-1 flex-shrink-0" />
                <p className="text-gray-800 flex-1">{recommendation}</p>
                <button
                  onClick={() => navigate('/manager/campaigns/create', { state: { campaignType: recommendation.toLowerCase().includes('campaign') ? 'win_back' : 'loyalty' } })}
                  className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                >
                  Take Action
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Analytics Summary */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Customer Segments */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-700">Customer Segments</h3>
              <FaUsers className="text-blue-500" />
            </div>
            <div className="space-y-2 text-sm">
              {['new', 'returning', 'loyal', 'inactive'].map((key) => (
                <div key={key} className="flex justify-between">
                  <span className="text-gray-600">{SEGMENT_META[key]?.label || key}</span>
                  <span className={`font-semibold ${key === 'inactive' ? 'text-red-600' : 'text-gray-900'}`}>
                    {formatNumber(analytics.segments[key] || 0)}
                  </span>
                </div>
              ))}
              {totalSegments > 0 && (
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Active Customers</span>
                  <span>
                    {formatPercentage(((analytics.segments.new + analytics.segments.returning + analytics.segments.loyal) / totalSegments) * 100 || 0)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Customer Value */}
          {analytics.value && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-700">Customer Value</h3>
                <FaDollarSign className="text-green-500" />
              </div>
              <div className="space-y-2 text-sm">
                <div>
                  <p className="text-gray-600">Average Value</p>
                  <p className="text-lg font-bold text-green-600">
                    {formatCurrency(analytics.value.averageValue)}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Total Revenue</p>
                  <p className="text-lg font-bold text-blue-600">
                    {formatCurrency(analytics.value.totalRevenue)}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Retention Metrics */}
          {analytics.retention && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-700">Retention</h3>
                <FaCalendarAlt className="text-purple-500" />
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Last 30 Days</span>
                  <span className="font-semibold text-gray-900">{formatNumber(analytics.retention.last30Days || 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Last 60 Days</span>
                  <span className="font-semibold text-gray-900">{formatNumber(analytics.retention.last60Days || 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Last 90 Days</span>
                  <span className="font-semibold text-gray-900">{formatNumber(analytics.retention.last90Days || 0)}</span>
                </div>
              </div>
            </div>
          )}

          {/* Growth Trend */}
          {analytics.growth && analytics.growth.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-700">Growth Trend</h3>
                <FaChartLine className="text-orange-500" />
              </div>
              <div className="space-y-2 text-sm">
                <div>
                  <p className="text-gray-600">Recent Growth</p>
                  <div className="flex items-center gap-2">
                    <FaArrowUp className="text-green-500" />
                    <p className="text-lg font-bold text-green-600">
                      {formatNumber(analytics.growth.length > 0 ? analytics.growth[analytics.growth.length - 1].count : 0)}
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-500">
                    {analytics.growth.length > 0 
                      ? `Last period: ${analytics.growth[analytics.growth.length - 1].period || 'N/A'}`
                      : 'No growth data'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => navigate('/manager/customers/targeting')}
            className="flex items-center gap-3 p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-left"
          >
            <FaBullseye className="text-primary-600 text-xl" />
            <div>
              <p className="font-medium text-gray-900">Find Target Customers</p>
              <p className="text-sm text-gray-500">Search and filter customers</p>
            </div>
          </button>
          <button
            onClick={() => navigate('/manager/campaigns/create')}
            className="flex items-center gap-3 p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-left"
          >
            <FaChartLine className="text-primary-600 text-xl" />
            <div>
              <p className="font-medium text-gray-900">Create Campaign</p>
              <p className="text-sm text-gray-500">Launch marketing campaign</p>
            </div>
          </button>
          <button
            onClick={() => navigate('/manager/customers/analytics')}
            className="flex items-center gap-3 p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-left"
          >
            <FaUsers className="text-primary-600 text-xl" />
            <div>
              <p className="font-medium text-gray-900">View Analytics</p>
              <p className="text-sm text-gray-500">Detailed analytics dashboard</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  )
}

export default CustomerInsights

