import React, { useState, useEffect, useCallback } from 'react'
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
  FaDollarSign,
  FaCalendarAlt,
  FaBullseye
} from 'react-icons/fa'
import managerService from '../../../../services/manager/managerService'

const CustomerInsights = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [insightsData, setInsightsData] = useState(null)

  const fetchInsights = useCallback(async () => {
    try {
      setLoading(true)
      const result = await managerService.getCustomerInsights()

      if (result.success) {
        setInsightsData(result.data?.data || result.data)
      } else {
        toast.error(result.error || 'Failed to fetch insights')
      }
    } catch (error) {
      toast.error('Failed to fetch insights')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchInsights()
  }, [fetchInsights])

  const formatCurrency = useCallback((amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount || 0)
  }, [])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <FaSpinner className="animate-spin text-primary-600 text-4xl mb-4" />
        <p className="text-gray-600 font-medium">Loading insights...</p>
      </div>
    )
  }

  if (!insightsData) {
    return (
      <div className="p-6">
        <div className="flex flex-col items-center justify-center bg-white border border-gray-200  p-12 ">
          <FaExclamationTriangle className="text-gray-400 text-5xl mb-4" />
          <h3 className="text-lg font-semibold text-gray-900">No Data Available</h3>
          <p className="text-gray-600 mt-2">Could not retrieve customer insights.</p>
          <button
            onClick={fetchInsights}
            className="mt-6 px-4 py-2 bg-primary-600 text-white  hover:bg-primary-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  const { insights = [], recommendations = [], analytics } = insightsData
  const segments = analytics?.segments || {}

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      {/* Simple Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/manager/customers')}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <FaArrowLeft className="text-gray-600" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FaLightbulb className="text-yellow-500" />
            Insights & Analytics
          </h1>
        </div>
        <button
          onClick={fetchInsights}
          className="text-primary-600 hover:text-primary-700 font-medium text-sm"
        >
          Refresh
        </button>
      </div>

      {/* Top Cards: Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Value */}
        <div className="bg-white p-5  border border-gray-200 ">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-50  text-green-600">
              <FaDollarSign />
            </div>
            <span className="text-sm text-gray-500 font-medium">Avg. Value</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(analytics?.value?.averageValue)}</p>
          <p className="text-xs text-gray-500 mt-1">Total: {formatCurrency(analytics?.value?.totalRevenue)}</p>
        </div>

        {/* Retention */}
        <div className="bg-white p-5  border border-gray-200 ">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-50  text-blue-600">
              <FaCalendarAlt />
            </div>
            <span className="text-sm text-gray-500 font-medium">30-Day Retention</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{analytics?.retention?.last30Days || 0}</p>
          <p className="text-xs text-gray-500 mt-1">Active customers</p>
        </div>

        {/* Growth */}
        <div className="bg-white p-5  border border-gray-200 ">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-50  text-purple-600">
              <FaChartLine />
            </div>
            <span className="text-sm text-gray-500 font-medium">Growth</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            +{analytics?.growth?.length > 0 ? analytics.growth[analytics.growth.length - 1].count : 0}
          </p>
          <p className="text-xs text-gray-500 mt-1">New customers this month</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: AI Insights */}
        <div className="space-y-6">
          <div className="bg-white border border-gray-200  p-5 ">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FaExclamationTriangle className="text-yellow-500" />
              Key Findings
            </h3>
            {insights.length > 0 ? (
              <ul className="space-y-3">
                {insights.map((item, idx) => (
                  <li key={idx} className="flex gap-3 text-sm text-gray-700">
                    <span className="text-yellow-500 mt-1">•</span>
                    {item}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500 italic">No significant insights found.</p>
            )}
          </div>

          <div className="bg-white border border-gray-200  p-5 ">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FaCheckCircle className="text-green-500" />
              Recommendations
            </h3>
            {recommendations.length > 0 ? (
              <div className="space-y-3">
                {recommendations.map((rec, idx) => (
                  <div key={idx} className="flex items-start justify-between gap-4 p-3 bg-gray-50 rounded border border-gray-100">
                    <p className="text-xs text-gray-700">{rec}</p>
                    <button
                      onClick={() => navigate('/manager/campaigns/create')}
                      className="text-xs font-medium text-primary-600 hover:text-primary-700 whitespace-nowrap bg-blue-200 px-2 py-1 rounded"
                    >
                      Action
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 italic">No recommendations.</p>
            )}
          </div>
        </div>

        {/* Right: Segments Overview */}
        <div className="bg-white border border-gray-200  p-5  h-fit">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <FaUsers className="text-blue-500" />
            Customer Segments
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded">
              <span className="text-sm text-blue-900 font-medium">New</span>
              <span className="text-lg font-bold text-blue-700">{segments.new || 0}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50 rounded">
              <span className="text-sm text-green-900 font-medium">Returning</span>
              <span className="text-lg font-bold text-green-700">{segments.returning || 0}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded">
              <span className="text-sm text-yellow-900 font-medium">Loyal (VIP)</span>
              <span className="text-lg font-bold text-yellow-700">{segments.loyal || 0}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
              <span className="text-sm text-gray-700 font-medium">Inactive</span>
              <span className="text-lg font-bold text-gray-600">{segments.inactive || 0}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CustomerInsights
