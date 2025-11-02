import React, { useState, useEffect } from 'react'
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
  FaSearch
} from 'react-icons/fa'
import managerService from '../../../../services/manager/managerService'

const CustomerSegments = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [segments, setSegments] = useState(null)
  const [selectedSegment, setSelectedSegment] = useState(null)

  useEffect(() => {
    fetchSegments()
  }, [])

  const fetchSegments = async () => {
    try {
      setLoading(true)
      const result = await managerService.getCustomerSegments()
      
      if (result.success) {
        // Handle both response structures: result.data.data or result.data
        const segmentsData = result.data?.data || result.data
        if (segmentsData) {
          setSegments(segmentsData)
        } else {
          setSegments(null)
          toast.error('No segment data available')
        }
      } else {
        toast.error(result.error || 'Failed to fetch segments')
        setSegments(null)
      }
    } catch (error) {
      toast.error('Failed to fetch segments')
      console.error(error)
      setSegments(null)
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
    const colors = {
      new: 'bg-blue-100 text-blue-800 border-blue-300',
      returning: 'bg-green-100 text-green-800 border-green-300',
      loyal: 'bg-purple-100 text-purple-800 border-purple-300',
      inactive: 'bg-red-100 text-red-800 border-red-300',
      highValue: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      recent: 'bg-indigo-100 text-indigo-800 border-indigo-300'
    }
    return colors[segmentType] || 'bg-gray-100 text-gray-800 border-gray-300'
  }

  const formatNumber = (num) => {
    return (num || 0).toLocaleString()
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

  if (!segments) {
    return (
      <div className="p-6">
        <p className="text-gray-600">No segment data available</p>
      </div>
    )
  }

  const segmentList = [
    { key: 'new', label: 'New Customers', description: 'Customers with 1 visit' },
    { key: 'returning', label: 'Returning Customers', description: 'Customers with 2-4 visits' },
    { key: 'loyal', label: 'Loyal Customers', description: 'Customers with 5+ visits' },
    { key: 'inactive', label: 'Inactive Customers', description: 'No visit in last 90 days' },
    { key: 'highValue', label: 'High Value Customers', description: 'Spent ₹5,000 or more' },
    { key: 'recent', label: 'Recent Customers', description: 'Visited in last 30 days' }
  ]

  const totalCustomers = segmentList.reduce((sum, seg) => sum + (segments[seg.key] || 0), 0)

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
              <FaChartPie className="text-primary-600" />
              Customer Segments
            </h1>
            <p className="text-gray-600 mt-1">Analyze your customer base by segments</p>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Segment Overview</h2>
          <div className="text-right">
            <p className="text-sm text-gray-600">Total Customers</p>
            <p className="text-2xl font-bold text-primary-600">{formatNumber(totalCustomers)}</p>
          </div>
        </div>
      </div>

      {/* Segments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {segmentList.map((segment) => {
          const count = segments[segment.key] || 0
          const percentage = totalCustomers > 0 ? (count / totalCustomers * 100).toFixed(1) : 0
          
          return (
            <div
              key={segment.key}
              className={`bg-white rounded-xl shadow-sm border-2 ${getSegmentColor(segment.key)} p-6 hover:shadow-lg transition-all cursor-pointer`}
              onClick={() => navigate(`/manager/customers?segment=${segment.key}`)}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white rounded-lg">
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
                  <p className="text-lg font-semibold text-gray-600 mb-1">{percentage}%</p>
                </div>
                <div className="w-full bg-white/50 rounded-full h-2">
                  <div
                    className="bg-current h-2 rounded-full transition-all"
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
              </div>

              <button className="w-full flex items-center justify-center gap-2 py-2 bg-white/80 hover:bg-white rounded-lg transition-colors text-sm font-medium">
                <FaEye />
                View Customers
              </button>
            </div>
          )
        })}
      </div>

      {/* Segment Insights */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Segment Insights</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium text-gray-900 mb-2">Top Segments</h3>
            <div className="space-y-2">
              {segmentList
                .sort((a, b) => (segments[b.key] || 0) - (segments[a.key] || 0))
                .slice(0, 3)
                .map((segment) => (
                  <div key={segment.key} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="text-sm text-gray-700">{segment.label}</span>
                    <span className="text-sm font-semibold text-gray-900">
                      {formatNumber(segments[segment.key] || 0)}
                    </span>
                  </div>
                ))}
            </div>
          </div>
          <div>
            <h3 className="font-medium text-gray-900 mb-2">Segment Distribution</h3>
            <div className="space-y-3">
              {segmentList.map((segment) => {
                const count = segments[segment.key] || 0
                const percentage = totalCustomers > 0 ? (count / totalCustomers * 100) : 0
                return (
                  <div key={segment.key}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-gray-600">{segment.label}</span>
                      <span className="text-sm font-medium text-gray-900">
                        {percentage.toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-primary-600 h-2 rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
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
