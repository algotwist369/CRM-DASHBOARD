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
  FaStop
} from 'react-icons/fa'
import managerService from '../../../../services/manager/managerService'

const CampaignList = () => {
  const navigate = useNavigate()
  const [campaigns, setCampaigns] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 0 })

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
        setCampaigns(result.data.data || [])
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
  }, [pagination.page, pagination.limit, statusFilter, typeFilter])

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
      draft: 'bg-gray-100 text-gray-800',
      scheduled: 'bg-blue-100 text-blue-800',
      running: 'bg-green-100 text-green-800',
      paused: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-purple-100 text-purple-800',
      cancelled: 'bg-red-100 text-red-800'
    }
    return badges[status] || badges.draft
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

  const filteredCampaigns = campaigns.filter(campaign => {
    if (searchTerm) {
      const search = searchTerm.toLowerCase()
      return (
        campaign.name?.toLowerCase().includes(search) ||
        campaign.description?.toLowerCase().includes(search)
      )
    }
    return true
  })

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FaBullhorn className="text-primary-600" />
            Campaigns
          </h1>
          <p className="text-gray-600 mt-1">Manage your marketing campaigns</p>
        </div>
        <button
          onClick={() => navigate('/manager/notifications/campaigns/create')}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white  hover:bg-primary-700 transition-colors"
        >
          <FaPlus />
          Create Campaign
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white   border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search campaigns..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300  focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300  focus:outline-none focus:ring-2 focus:ring-primary-500"
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
            className="px-4 py-2 border border-gray-300  focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">All Types</option>
            <option value="promotional">Promotional</option>
            <option value="seasonal">Seasonal</option>
            <option value="loyalty">Loyalty</option>
            <option value="win_back">Win Back</option>
            <option value="announcement">Announcement</option>
            <option value="event">Event</option>
          </select>
        </div>
      </div>

      {/* Campaigns List */}
      <div className="bg-white   border border-gray-200">
        {loading ? (
          <div className="p-12 text-center">
            <FaSpinner className="animate-spin mx-auto text-primary-600 text-3xl mb-4" />
            <p className="text-gray-600">Loading campaigns...</p>
          </div>
        ) : filteredCampaigns.length === 0 ? (
          <div className="p-12 text-center">
            <FaBullhorn className="mx-auto text-gray-400 text-4xl mb-4" />
            <p className="text-gray-600">No campaigns found</p>
            <button
              onClick={() => navigate('/manager/notifications/campaigns/create')}
              className="mt-4 text-primary-600 hover:text-primary-700"
            >
              Create your first campaign
            </button>
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
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {campaign.name}
                      </h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(campaign.status)}`}>
                        {campaign.status}
                      </span>
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 capitalize">
                        {campaign.type}
                      </span>
                    </div>
                    
                    {campaign.description && (
                      <p className="text-gray-600 mb-3">{campaign.description}</p>
                    )}
                    
                    <div className="flex items-center gap-6 text-sm text-gray-500">
                      {/* Performance Stats */}
                      <div className="flex items-center gap-2">
                        <FaUsers className="text-gray-400" />
                        <span>
                          <strong>{campaign.performance?.totalSent || 0}</strong> sent
                        </span>
                      </div>

                      {campaign.performance?.totalDelivered > 0 && (
                        <div className="flex items-center gap-2">
                          <FaChartLine className="text-green-500" />
                          <span className="text-green-600">
                            <strong>{campaign.performance.totalDelivered}</strong> delivered
                          </span>
                        </div>
                      )}

                      {campaign.performance?.totalRevenue > 0 && (
                        <div className="flex items-center gap-2">
                          <span className="text-blue-600">
                            <strong>${campaign.performance.totalRevenue.toFixed(2)}</strong> revenue
                          </span>
                        </div>
                      )}

                      {/* Date Range */}
                      <div className="flex items-center gap-2">
                        <FaCalendarAlt className="text-gray-400" />
                        <span>
                          {formatDate(campaign.settings?.startDate)} - {formatDate(campaign.settings?.endDate)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => navigate(`/manager/notifications/campaigns/${campaign._id}`)}
                      className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700  hover:bg-gray-50 transition-colors"
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
                className="px-4 py-2 border border-gray-300  hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="px-4 py-2 text-sm text-gray-700">
                Page {pagination.page} of {pagination.pages}
              </span>
              <button
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                disabled={pagination.page >= pagination.pages}
                className="px-4 py-2 border border-gray-300  hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
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
