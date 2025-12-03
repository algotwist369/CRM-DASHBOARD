import React, { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import {
  FaUsers,
  FaChartPie,
  FaArrowLeft,
  FaSpinner,
  FaEye,
  FaUser,
  FaUserPlus,
  FaUserCheck,
  FaUserClock,
  FaCrown,
  FaSearch,
  FaRupeeSign,
  FaChartLine
} from 'react-icons/fa'
import managerService from '../../../../services/manager/managerService'
import {
  formatCurrency,
  formatNumber,
  formatPercentage,
  normalizeCustomerAnalyticsResponse,
  SEGMENT_META,
  SEGMENT_ORDER
} from '../utils/customerUtils'

const CustomerSegments = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [analytics, setAnalytics] = useState(null)
  const [selectedSegmentKey, setSelectedSegmentKey] = useState('')

  useEffect(() => {
    fetchSegments()
  }, [])

  const fetchSegments = async () => {
    try {
      setLoading(true)
      const result = await managerService.getCustomerSegments()
      
      if (result.success) {
        const raw = result.data?.data || result.data
        const normalized = raw ? normalizeCustomerAnalyticsResponse(raw) : null

        if (normalized) {
          setAnalytics(normalized)
        } else {
          setAnalytics(null)
          toast.error('No segment data available')
        }
      } else {
        toast.error(result.error || 'Failed to fetch segments')
        setAnalytics(null)
      }
    } catch (error) {
      toast.error('Failed to fetch segments')
      console.error(error)
      setAnalytics(null)
    } finally {
      setLoading(false)
    }
  }

  const getSegmentIcon = (segmentType) => {
    const icons = {
      new: <FaUserPlus className="text-blue-500" />,
      returning: <FaUserCheck className="text-green-500" />,
      loyal: <FaCrown className="text-purple-500" />,
      inactive: <FaUserClock className="text-red-500" />,
      highValue: <FaCrown className="text-yellow-500" />,
      recent: <FaUser className="text-indigo-500" />
    }
    return icons[segmentType] || <FaUser className="text-gray-500" />
  }

  const getSegmentColor = (segmentType) => {
    const metaColor = SEGMENT_META[segmentType]?.color || 'bg-gray-100 text-gray-800'
    return `${metaColor} border border-gray-200`
  }

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <FaSpinner className="animate-spin mx-auto text-primary-600 text-4xl mb-4" />
          <p className="text-gray-600">Loading customer segments...</p>
        </div>
      </div>
    )
  }

  if (!analytics) {
    return (
      <div className="p-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <p className="text-gray-600">No segment data available</p>
        </div>
      </div>
    )
  }

  const segmentCounts = analytics.segments || {}
  const totalCustomers = Object.values(segmentCounts).reduce((sum, count) => sum + (count || 0), 0)
  const visibleSegments = SEGMENT_ORDER.filter((key) => ['new', 'returning', 'loyal', 'inactive', 'highValue', 'recent'].includes(key))
  const segmentList = visibleSegments.map((key) => ({
    key,
    label: SEGMENT_META[key]?.label || key,
    description: SEGMENT_META[key]?.description || ''
  }))

  const activeSegmentation = analytics.segmentationDetails || []
  const displayedSegments = activeSegmentation.length > 0
    ? activeSegmentation
    : segmentList.map(({ key, label, description }) => ({
        key,
        label,
        description,
        count: segmentCounts[key] || 0,
        totalSpent: 0,
        averageSpent: 0,
        totalVisits: 0
      }))

  const selectedSegment = displayedSegments.find((segment) => segment.key === selectedSegmentKey) || null

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/manager/customers')}
            className=" p-2 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-2 border border-gray-300"
          >
            <FaArrowLeft className="text-gray-600" /> <span className="text-gray-600">Back</span>
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <FaChartPie className="text-primary-600" />
              Customer Segments
            </h1>
            <p className="text-gray-600 mt-1">Analyze your customer base by segments</p>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="bg-white   border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Segment Overview</h2>
          <div className="text-right">
            <p className="text-sm text-gray-600">Total Customers</p>
            <p className="text-2xl font-bold text-primary-600">{formatNumber(totalCustomers)}</p>
          </div>
        </div>
        {analytics.value && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
              <p className="text-sm text-gray-600">Average Customer Value</p>
              <p className="text-xl font-semibold text-gray-900">{formatCurrency(analytics.value.averageValue)}</p>
            </div>
            <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
              <p className="text-sm text-gray-600">Total Revenue</p>
              <p className="text-xl font-semibold text-blue-600">{formatCurrency(analytics.value.totalRevenue)}</p>
            </div>
            <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
              <p className="text-sm text-gray-600">Average Loyalty Points</p>
              <p className="text-xl font-semibold text-purple-600">{formatNumber(analytics.value.avgLoyaltyPoints || 0)}</p>
            </div>
          </div>
        )}
      </div>

      {/* Segments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {segmentList.map((segment) => {
          const count = segmentCounts[segment.key] || 0
          const percentage = totalCustomers > 0 ? (count / totalCustomers) * 100 : 0
          
          return (
            <div
              key={segment.key}
              className={`bg-white rounded-xl shadow-sm ${getSegmentColor(segment.key)} p-6 hover:shadow-lg transition-all cursor-pointer`}
              onClick={() => setSelectedSegmentKey(segment.key === selectedSegmentKey ? '' : segment.key)}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white ">
                    {getSegmentIcon(segment.key)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{segment.label}</h3>
                    <p className="text-xs text-gray-600">{segment.description}</p>
                  </div>
                </div>
              </div>
              
              <div className="mb-4">
                <div className="flex items-end gap-2 mb-2">
                  <p className="text-4xl font-bold text-gray-900">{formatNumber(count)}</p>
                  <p className="text-lg font-semibold text-gray-600 mb-1">{formatPercentage(percentage)}</p>
                </div>
                <div className="w-full bg-white/50 rounded-full h-2">
                  <div
                    className="bg-current h-2 rounded-full transition-all"
                    style={{ width: `${Math.min(percentage, 100)}%` }}
                  ></div>
                </div>
              </div>

              <button className="w-full flex items-center justify-center gap-2 py-2 bg-white/80 hover:bg-white  transition-colors text-sm font-medium">
                <FaEye />
                {selectedSegmentKey === segment.key ? 'Collapse Details' : 'View Customers'}
              </button>
            </div>
          )
        })}
      </div>

      {/* Segment Details */}
      {selectedSegment && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                {getSegmentIcon(selectedSegment.key)}
                <span>{selectedSegment.label}</span>
              </h2>
              <p className="text-gray-600 mt-1">{selectedSegment.description || 'Segment insights'}</p>
            </div>
            <button
              onClick={() => navigate(`/manager/customers?segment=${selectedSegment.key}`)}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              Manage Customers
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <p className="text-sm text-gray-600">Customers</p>
              <p className="text-2xl font-semibold text-gray-900">{formatNumber(selectedSegment.count)}</p>
            </div>
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-gray-600">Total Revenue</p>
              <p className="text-2xl font-semibold text-green-600">{formatCurrency(selectedSegment.totalSpent)}</p>
            </div>
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-gray-600">Average Spend</p>
              <p className="text-2xl font-semibold text-blue-600">{formatCurrency(selectedSegment.averageSpent)}</p>
            </div>
            <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
              <p className="text-sm text-gray-600">Total Visits</p>
              <p className="text-2xl font-semibold text-purple-600">{formatNumber(selectedSegment.totalVisits || 0)}</p>
            </div>
          </div>

          {analytics.value?.valueDistribution && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                <FaChartPie />
                Value Distribution
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Object.entries(analytics.value.valueDistribution).map(([range, count]) => (
                  <div key={range} className="p-3 rounded-lg bg-white border border-gray-200">
                    <p className="text-xs uppercase text-gray-500">{range}</p>
                    <p className="text-lg font-semibold text-gray-900">{formatNumber(count || 0)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Segment Insights */}
      <div className="bg-white   border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Segment Insights</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium text-gray-900 mb-2">Top Segments</h3>
            <div className="space-y-2">
              {segmentList
                .sort((a, b) => (segmentCounts[b.key] || 0) - (segmentCounts[a.key] || 0))
                .slice(0, 3)
                .map((segment) => (
                  <div key={segment.key} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="text-sm text-gray-700">{segment.label}</span>
                    <span className="text-sm font-semibold text-gray-900">
                      {formatNumber(segmentCounts[segment.key] || 0)}
                    </span>
                  </div>
                ))}
            </div>
          </div>
          <div>
            <h3 className="font-medium text-gray-900 mb-2">Segment Distribution</h3>
            <div className="space-y-3">
              {segmentList.map((segment) => {
                const count = segmentCounts[segment.key] || 0
                const percentage = totalCustomers > 0 ? (count / totalCustomers) * 100 : 0
                return (
                  <div key={segment.key}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-gray-600">{segment.label}</span>
                      <span className="text-sm font-medium text-gray-900">
                        {formatPercentage(percentage)}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-primary-600 h-2 rounded-full transition-all"
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CustomerSegments
