import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import {
  FaBullhorn,
  FaPlus,
  FaSearch,
  FaChartLine,
  FaCalendarAlt,
  FaUsers,
  FaSpinner,
  FaEye,
  FaPlay,
  FaPause,
  FaStop,
  FaEdit,
  FaTrash,
  FaFilter,
  FaArrowUp,
  FaArrowDown,
  FaTrophy,
  FaDollarSign,
  FaPercentage,
  FaMousePointer,
  FaEnvelopeOpen,
  FaCopy
} from 'react-icons/fa'
import managerService from '../../../../services/manager/managerService'

const CampaignList = () => {
  const navigate = useNavigate()
  const [campaigns, setCampaigns] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [sortBy, setSortBy] = useState('createdAt')
  const [sortOrder, setSortOrder] = useState('desc')
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 0 })
  const [viewMode, setViewMode] = useState('grid') // grid or list

  const fetchCampaigns = useCallback(async () => {
    try {
      setLoading(true)
      const params = {
        page: pagination.page,
        limit: pagination.limit
      }
      
      if (statusFilter) params.status = statusFilter
      if (typeFilter) params.type = typeFilter

      const result = await managerService.getCampaigns(params)
      
      if (result.success) {
        let campaignsData = result.data.data || []
        
        // Client-side sorting
        campaignsData.sort((a, b) => {
          let aVal, bVal
          switch(sortBy) {
            case 'name':
              aVal = a.name?.toLowerCase() || ''
              bVal = b.name?.toLowerCase() || ''
              break
            case 'status':
              aVal = a.status || ''
              bVal = b.status || ''
              break
            case 'performance':
              aVal = a.performance?.totalRevenue || 0
              bVal = b.performance?.totalRevenue || 0
              break
            case 'createdAt':
            default:
              aVal = new Date(a.createdAt || 0).getTime()
              bVal = new Date(b.createdAt || 0).getTime()
          }
          
          if (sortOrder === 'asc') {
            return aVal > bVal ? 1 : aVal < bVal ? -1 : 0
          } else {
            return aVal < bVal ? 1 : aVal > bVal ? -1 : 0
          }
        })
        
        setCampaigns(campaignsData)
        setPagination(prev => ({
          ...prev,
          total: result.data.pagination?.total || 0,
          pages: result.data.pagination?.pages || 0
        }))
      } else {
        toast.error(result.error || 'Failed to fetch campaigns')
      }
    } catch (error) {
      toast.error('Failed to fetch campaigns')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }, [pagination.page, pagination.limit, statusFilter, typeFilter, sortBy, sortOrder])

  useEffect(() => {
    fetchCampaigns()
  }, [fetchCampaigns])

  // Real-time updates - refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (!loading) {
        fetchCampaigns()
      }
    }, 30000)

    return () => clearInterval(interval)
  }, [fetchCampaigns, loading])

  const getStatusBadge = (status) => {
    const badges = {
      draft: 'bg-gray-100 text-gray-800 border border-gray-300',
      scheduled: 'bg-blue-100 text-blue-800 border border-blue-300',
      running: 'bg-green-100 text-green-800 border border-green-300',
      paused: 'bg-yellow-100 text-yellow-800 border border-yellow-300',
      completed: 'bg-purple-100 text-purple-800 border border-purple-300',
      cancelled: 'bg-red-100 text-red-800 border border-red-300'
    }
    return badges[status] || badges.draft
  }

  const getTypeColor = (type) => {
    const colors = {
      promotional: 'text-blue-600 bg-blue-50',
      seasonal: 'text-orange-600 bg-orange-50',
      loyalty: 'text-purple-600 bg-purple-50',
      win_back: 'text-red-600 bg-red-50',
      announcement: 'text-green-600 bg-green-50',
      event: 'text-pink-600 bg-pink-50'
    }
    return colors[type] || 'text-gray-600 bg-gray-50'
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0)
  }

  const formatDate = (dateString) => {
    if (!dateString) return '-'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const calculateROI = (campaign) => {
    const cost = campaign.performance?.cost || 0
    const revenue = campaign.performance?.totalRevenue || 0
    if (cost === 0) return 0
    return ((revenue - cost) / cost) * 100
  }

  const calculateEngagementRate = (campaign) => {
    const delivered = campaign.performance?.totalDelivered || 0
    const opened = campaign.performance?.totalOpened || 0
    const clicked = campaign.performance?.totalClicked || 0
    if (delivered === 0) return 0
    return ((opened + clicked) / delivered) * 100
  }

  const filteredCampaigns = campaigns.filter(campaign => {
    if (searchTerm) {
      const search = searchTerm.toLowerCase()
      return (
        campaign.name?.toLowerCase().includes(search) ||
        campaign.description?.toLowerCase().includes(search) ||
        campaign.type?.toLowerCase().includes(search)
      )
    }
    return true
  })

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      setSortOrder('desc')
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg">
              <FaBullhorn className="text-white text-xl" />
            </div>
            Marketing Campaigns
          </h1>
          <p className="text-gray-600 mt-2">Create, manage, and track your marketing campaigns</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            {viewMode === 'grid' ? 'List View' : 'Grid View'}
          </button>
          <button
            onClick={() => navigate('/manager/campaigns/create')}
            className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl"
          >
            <FaPlus />
            Create Campaign
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Total Campaigns</span>
            <FaBullhorn className="text-purple-500" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{pagination.total}</p>
          <p className="text-xs text-gray-500 mt-1">{campaigns.filter(c => c.status === 'running').length} active</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Total Revenue</span>
            <FaDollarSign className="text-green-500" />
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {formatCurrency(campaigns.reduce((sum, c) => sum + (c.performance?.totalRevenue || 0), 0))}
          </p>
          <p className="text-xs text-green-600 mt-1">From all campaigns</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Total Sent</span>
            <FaEnvelopeOpen className="text-blue-500" />
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {campaigns.reduce((sum, c) => sum + (c.performance?.totalSent || 0), 0).toLocaleString()}
          </p>
          <p className="text-xs text-gray-500 mt-1">Messages delivered</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Avg. Engagement</span>
            <FaPercentage className="text-orange-500" />
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {campaigns.length > 0 
              ? (campaigns.reduce((sum, c) => sum + calculateEngagementRate(c), 0) / campaigns.length).toFixed(1)
              : 0}%
          </p>
          <p className="text-xs text-gray-500 mt-1">Average rate</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="relative md:col-span-2">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search campaigns..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">All Status</option>
            <option value="draft">Draft</option>
            <option value="scheduled">Scheduled</option>
            <option value="running">Running</option>
            <option value="paused">Paused</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">All Types</option>
            <option value="promotional">Promotional</option>
            <option value="seasonal">Seasonal</option>
            <option value="loyalty">Loyalty</option>
            <option value="win_back">Win Back</option>
            <option value="announcement">Announcement</option>
            <option value="event">Event</option>
          </select>

          <select
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [field, order] = e.target.value.split('-')
              setSortBy(field)
              setSortOrder(order)
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="createdAt-desc">Newest First</option>
            <option value="createdAt-asc">Oldest First</option>
            <option value="name-asc">Name (A-Z)</option>
            <option value="name-desc">Name (Z-A)</option>
            <option value="performance-desc">Highest Revenue</option>
            <option value="performance-asc">Lowest Revenue</option>
          </select>
        </div>
      </div>

      {/* Campaigns Grid/List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        {loading ? (
          <div className="p-12 text-center">
            <FaSpinner className="animate-spin mx-auto text-primary-600 text-3xl mb-4" />
            <p className="text-gray-600">Loading campaigns...</p>
          </div>
        ) : filteredCampaigns.length === 0 ? (
          <div className="p-12 text-center">
            <FaBullhorn className="mx-auto text-gray-400 text-5xl mb-4" />
            <p className="text-gray-600 text-lg mb-2">No campaigns found</p>
            <button
              onClick={() => navigate('/manager/campaigns/create')}
              className="mt-4 text-primary-600 hover:text-primary-700 font-medium"
            >
              Create your first campaign →
            </button>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCampaigns.map((campaign) => (
              <div
                key={campaign._id}
                className="bg-gradient-to-br from-white to-gray-50 rounded-xl border border-gray-200 hover:shadow-lg transition-all duration-300 overflow-hidden"
              >
                {/* Campaign Header */}
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900 mb-1">{campaign.name}</h3>
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(campaign.type)}`}>
                        {campaign.type?.replace('_', ' ')}
                      </span>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(campaign.status)}`}>
                      {campaign.status}
                    </span>
                  </div>
                  {campaign.description && (
                    <p className="text-sm text-gray-600 line-clamp-2">{campaign.description}</p>
                  )}
                </div>

                {/* Performance Metrics */}
                <div className="p-6 space-y-4">
                  {/* Revenue & ROI */}
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-500">Revenue</p>
                      <p className="text-lg font-bold text-green-600">
                        {formatCurrency(campaign.performance?.totalRevenue || 0)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">ROI</p>
                      <p className={`text-lg font-bold ${calculateROI(campaign) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {calculateROI(campaign).toFixed(1)}%
                      </p>
                    </div>
                  </div>

                  {/* Engagement Stats */}
                  <div className="grid grid-cols-3 gap-2 pt-3 border-t border-gray-200">
                    <div className="text-center">
                      <p className="text-xs text-gray-500">Sent</p>
                      <p className="text-sm font-semibold text-gray-900">{campaign.performance?.totalSent || 0}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-500">Opened</p>
                      <p className="text-sm font-semibold text-blue-600">{campaign.performance?.totalOpened || 0}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-500">Clicked</p>
                      <p className="text-sm font-semibold text-purple-600">{campaign.performance?.totalClicked || 0}</p>
                    </div>
                  </div>

                  {/* Engagement Rate */}
                  <div className="pt-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-500">Engagement Rate</span>
                      <span className="text-xs font-semibold text-gray-900">
                        {calculateEngagementRate(campaign).toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all"
                        style={{ width: `${Math.min(calculateEngagementRate(campaign), 100)}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Date Range */}
                  <div className="flex items-center gap-2 text-xs text-gray-500 pt-2 border-t border-gray-200">
                    <FaCalendarAlt />
                    <span>
                      {formatDate(campaign.settings?.startDate)} - {formatDate(campaign.settings?.endDate)}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
                    <button
                      onClick={() => navigate(`/manager/campaigns/${campaign._id}/analytics`)}
                      className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                    >
                      View Analytics
                    </button>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => navigate(`/manager/campaigns/${campaign._id}`)}
                        className="p-2 text-gray-600 hover:bg-white rounded-lg transition-colors"
                        title="View Details"
                      >
                        <FaEye />
                      </button>
                    </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredCampaigns.map((campaign) => (
              <div
                key={campaign._id}
                className="p-6 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-lg font-semibold text-gray-900">{campaign.name}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(campaign.status)}`}>
                        {campaign.status}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(campaign.type)}`}>
                        {campaign.type}
                      </span>
                    </div>
                    
                    {campaign.description && (
                      <p className="text-gray-600 mb-4">{campaign.description}</p>
                    )}
                    
                    {/* Performance Metrics Row */}
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Revenue</p>
                        <p className="text-lg font-bold text-green-600">
                          {formatCurrency(campaign.performance?.totalRevenue || 0)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">ROI</p>
                        <p className={`text-lg font-bold ${calculateROI(campaign) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {calculateROI(campaign).toFixed(1)}%
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Sent</p>
                        <p className="text-lg font-bold text-gray-900">{campaign.performance?.totalSent || 0}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Engagement</p>
                        <p className="text-lg font-bold text-purple-600">
                          {calculateEngagementRate(campaign).toFixed(1)}%
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Date Range</p>
                        <p className="text-sm font-medium text-gray-900">
                          {formatDate(campaign.settings?.startDate)} - {formatDate(campaign.settings?.endDate)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => navigate(`/manager/campaigns/${campaign._id}/analytics`)}
                      className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                    >
                      <FaChartLine />
                      Analytics
                    </button>
                    <button
                      onClick={() => navigate(`/manager/campaigns/${campaign._id}`)}
                      className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <FaEye />
                      View
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {!loading && pagination.pages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
              {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
              {pagination.total} campaigns
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                disabled={pagination.page === 1}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="px-4 py-2 text-sm text-gray-700">
                Page {pagination.page} of {pagination.pages}
              </span>
              <button
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                disabled={pagination.page >= pagination.pages}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default CampaignList
