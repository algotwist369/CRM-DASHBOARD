import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Card, Button, Badge, Table, StatCard, StatCardGrid, SearchBar, Dropdown, DatePicker, Alert } from '../../../../components'
import { CampaignCard } from '../../../../components'
import notificationService from '../../../../services/notification/notificationService'
import { toast } from 'react-hot-toast'

const CampaignList = () => {
  const [campaigns, setCampaigns] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [dateRange, setDateRange] = useState({ start: null, end: null })
  const [sortBy, setSortBy] = useState('createdAt')
  const [sortDirection, setSortDirection] = useState('desc')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  const [selectedCampaigns, setSelectedCampaigns] = useState([])
  const [viewMode, setViewMode] = useState('table') // 'table' or 'card'

  useEffect(() => {
    fetchCampaigns()
  }, [])

  const fetchCampaigns = async () => {
    try {
      setLoading(true)
      
      const result = await notificationService.getCampaigns()
      
      if (result.success) {
        setCampaigns(result.data)
        toast.success('Campaigns loaded successfully!')
      } else {
        toast.error(result.error || 'Failed to load campaigns')
        console.error('Campaigns error:', result.error)
      }
    } catch (error) {
      console.error('Error fetching campaigns:', error)
      toast.error('An unexpected error occurred while loading campaigns')
    } finally {
      setLoading(false)
    }
  }
      
      ]
      
    } catch (error) {
      console.error('Error fetching campaigns:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'success'
      case 'draft': return 'warning'
      case 'completed': return 'info'
      case 'paused': return 'danger'
      default: return 'default'
    }
  }

  const getTypeColor = (type) => {
    switch (type) {
      case 'promotional': return 'primary'
      case 'onboarding': return 'info'
      case 'seasonal': return 'warning'
      case 'automated': return 'success'
      case 'feedback': return 'secondary'
      default: return 'default'
    }
  }

  const filteredCampaigns = campaigns.filter(campaign => {
    const matchesSearch = campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         campaign.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         campaign.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesStatus = statusFilter === 'all' || campaign.status === statusFilter
    const matchesType = typeFilter === 'all' || campaign.type === typeFilter
    
    const matchesDateRange = !dateRange.start || !dateRange.end || 
                           (new Date(campaign.startDate) >= dateRange.start && new Date(campaign.startDate) <= dateRange.end)
    
    return matchesSearch && matchesStatus && matchesType && matchesDateRange
  })

  const sortedCampaigns = [...filteredCampaigns].sort((a, b) => {
    let aValue = a[sortBy]
    let bValue = b[sortBy]
    
    if (sortBy === 'createdAt' || sortBy === 'startDate' || sortBy === 'endDate') {
      aValue = new Date(aValue)
      bValue = new Date(bValue)
    }
    
    if (sortDirection === 'asc') {
      return aValue > bValue ? 1 : -1
    } else {
      return aValue < bValue ? 1 : -1
    }
  })

  const paginatedCampaigns = sortedCampaigns.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const totalPages = Math.ceil(sortedCampaigns.length / itemsPerPage)

  const handleSelectCampaign = (campaignId) => {
    setSelectedCampaigns(prev => 
      prev.includes(campaignId) 
        ? prev.filter(id => id !== campaignId)
        : [...prev, campaignId]
    )
  }

  const handleSelectAll = () => {
    if (selectedCampaigns.length === paginatedCampaigns.length) {
      setSelectedCampaigns([])
    } else {
      setSelectedCampaigns(paginatedCampaigns.map(c => c.id))
    }
  }

  const handleBulkAction = (action) => {
    console.log('Bulk action:', action, selectedCampaigns)
    // Implement bulk actions
  }

  const calculateStats = () => {
    const active = campaigns.filter(c => c.status === 'active')
    const completed = campaigns.filter(c => c.status === 'completed')
    const totalBudget = campaigns.reduce((sum, c) => sum + c.budget, 0)
    const totalSpent = campaigns.reduce((sum, c) => sum + c.spent, 0)
    const totalRevenue = campaigns.reduce((sum, c) => sum + c.revenue, 0)
    const totalNotifications = campaigns.reduce((sum, c) => sum + c.notifications, 0)
    
    return {
      total: campaigns.length,
      active: active.length,
      completed: completed.length,
      totalBudget,
      totalSpent,
      totalRevenue,
      totalNotifications,
      roi: totalSpent > 0 ? ((totalRevenue - totalSpent) / totalSpent) * 100 : 0
    }
  }

  const stats = calculateStats()

  const renderCampaignCard = (campaign) => (
    <CampaignCard
      key={campaign.id}
      campaign={campaign}
      onSelect={() => handleSelectCampaign(campaign.id)}
      selected={selectedCampaigns.includes(campaign.id)}
      onView={() => console.log('View campaign:', campaign.id)}
      onEdit={() => console.log('Edit campaign:', campaign.id)}
      onDelete={() => console.log('Delete campaign:', campaign.id)}
    />
  )

  const renderCampaignTable = () => (
    <Table
      data={paginatedCampaigns}
      columns={[
        {
          key: 'select',
          label: (
            <input
              type="checkbox"
              checked={selectedCampaigns.length === paginatedCampaigns.length && paginatedCampaigns.length > 0}
              onChange={handleSelectAll}
              className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
          ),
          render: (campaign) => (
            <input
              type="checkbox"
              checked={selectedCampaigns.includes(campaign.id)}
              onChange={() => handleSelectCampaign(campaign.id)}
              className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
          )
        },
        {
          key: 'name',
          label: 'Campaign',
          sortable: true,
          render: (campaign) => (
            <div>
              <p className="font-medium text-gray-900">{campaign.name}</p>
              <p className="text-sm text-gray-500">{campaign.description}</p>
            </div>
          )
        },
        {
          key: 'type',
          label: 'Type',
          sortable: true,
          render: (campaign) => (
            <Badge variant={getTypeColor(campaign.type)} size="sm">
              {campaign.type}
            </Badge>
          )
        },
        {
          key: 'status',
          label: 'Status',
          sortable: true,
          render: (campaign) => (
            <Badge variant={getStatusColor(campaign.status)} size="sm">
              {campaign.status}
            </Badge>
          )
        },
        {
          key: 'budget',
          label: 'Budget',
          sortable: true,
          render: (campaign) => (
            <div className="text-right">
              <p className="font-medium text-gray-900">{formatCurrency(campaign.budget)}</p>
              <p className="text-sm text-gray-500">Spent: {formatCurrency(campaign.spent)}</p>
            </div>
          )
        },
        {
          key: 'performance',
          label: 'Performance',
          sortable: true,
          render: (campaign) => (
            <div className="text-center">
              <p className="text-sm text-gray-900">{campaign.notifications} notifications</p>
              <p className="text-sm text-gray-500">{campaign.totalRecipients} recipients</p>
            </div>
          )
        },
        {
          key: 'engagement',
          label: 'Engagement',
          sortable: true,
          render: (campaign) => (
            <div className="text-center">
              <p className="text-sm text-gray-900">{campaign.opened} opened</p>
              <p className="text-sm text-gray-500">{campaign.clicked} clicked</p>
            </div>
          )
        },
        {
          key: 'revenue',
          label: 'Revenue',
          sortable: true,
          render: (campaign) => (
            <div className="text-right">
              <p className="font-medium text-gray-900">{formatCurrency(campaign.revenue)}</p>
              <p className="text-sm text-gray-500">{campaign.conversions} conversions</p>
            </div>
          )
        },
        {
          key: 'startDate',
          label: 'Start Date',
          sortable: true,
          render: (campaign) => formatDate(campaign.startDate)
        },
        {
          key: 'actions',
          label: 'Actions',
          render: (campaign) => (
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">View</Button>
              <Button variant="outline" size="sm">Edit</Button>
              <Button variant="outline" size="sm" className="text-red-600 hover:text-red-800">
                Delete
              </Button>
            </div>
          )
        }
      ]}
      onSort={(key, direction) => {
        setSortBy(key)
        setSortDirection(direction)
      }}
      sortable={true}
      currentSort={{ key: sortBy, direction: sortDirection }}
    />
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading campaigns...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Campaigns</h1>
              <p className="text-gray-600 mt-1">Manage and track all marketing campaigns</p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant={viewMode === 'table' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setViewMode('table')}
              >
                Table View
              </Button>
              <Button
                variant={viewMode === 'card' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setViewMode('card')}
              >
                Card View
              </Button>
              <Link to="/manager/notifications/campaigns/create">
                <Button variant="primary">Create Campaign</Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Stats */}
        <StatCardGrid
          stats={[
            {
              title: 'Total Campaigns',
              value: stats.total,
              change: 12.5,
              changeType: 'positive',
              format: 'number',
              color: 'blue',
              icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
              )
            },
            {
              title: 'Active Campaigns',
              value: stats.active,
              change: 8.3,
              changeType: 'positive',
              format: 'number',
              color: 'green',
              icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )
            },
            {
              title: 'Total Budget',
              value: stats.totalBudget,
              change: 15.2,
              changeType: 'positive',
              format: 'currency',
              color: 'yellow',
              icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              )
            },
            {
              title: 'ROI',
              value: stats.roi,
              change: 5.7,
              changeType: 'positive',
              format: 'percentage',
              color: 'purple',
              icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              )
            }
          ]}
          columns={4}
        />

        {/* Filters */}
        <Card className="mt-8">
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                <SearchBar
                  value={searchTerm}
                  onChange={setSearchTerm}
                  placeholder="Search campaigns..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <Dropdown
                  value={statusFilter}
                  onChange={setStatusFilter}
                  options={[
                    { value: 'all', label: 'All Statuses' },
                    { value: 'active', label: 'Active' },
                    { value: 'draft', label: 'Draft' },
                    { value: 'completed', label: 'Completed' },
                    { value: 'paused', label: 'Paused' }
                  ]}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                <Dropdown
                  value={typeFilter}
                  onChange={setTypeFilter}
                  options={[
                    { value: 'all', label: 'All Types' },
                    { value: 'promotional', label: 'Promotional' },
                    { value: 'onboarding', label: 'Onboarding' },
                    { value: 'seasonal', label: 'Seasonal' },
                    { value: 'automated', label: 'Automated' },
                    { value: 'feedback', label: 'Feedback' }
                  ]}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
                <DatePicker
                  value={dateRange}
                  onChange={setDateRange}
                  placeholder="Select date range"
                  range={true}
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Bulk Actions */}
        {selectedCampaigns.length > 0 && (
          <Card className="mt-6">
            <div className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">
                  {selectedCampaigns.length} campaign(s) selected
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleBulkAction('export')}
                  >
                    Export
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleBulkAction('activate')}
                  >
                    Activate
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleBulkAction('pause')}
                  >
                    Pause
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleBulkAction('delete')}
                    className="text-red-600 hover:text-red-800"
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Results */}
        <Card className="mt-6">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                {filteredCampaigns.length} campaign(s) found
              </h3>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Sort by:</span>
                <Dropdown
                  value={sortBy}
                  onChange={setSortBy}
                  options={[
                    { value: 'createdAt', label: 'Created Date' },
                    { value: 'startDate', label: 'Start Date' },
                    { value: 'name', label: 'Name' },
                    { value: 'status', label: 'Status' },
                    { value: 'budget', label: 'Budget' }
                  ]}
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')}
                >
                  {sortDirection === 'asc' ? '↑' : '↓'}
                </Button>
              </div>
            </div>

            {viewMode === 'table' ? renderCampaignTable() : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {paginatedCampaigns.map(renderCampaignCard)}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-6 flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, sortedCampaigns.length)} of {sortedCampaigns.length} results
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-gray-500">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}

export default CampaignList
