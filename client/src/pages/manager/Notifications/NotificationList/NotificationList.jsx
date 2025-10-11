import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Card, Button, Badge, Table, StatCard, StatCardGrid, SearchBar, Dropdown, DatePicker, Alert } from '../../../../components'
import { NotificationCard, CampaignCard } from '../../../../components'
import notificationService from '../../../../services/notification/notificationService'
import { toast } from 'react-hot-toast'

const NotificationList = () => {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [dateRange, setDateRange] = useState({ start: null, end: null })
  const [sortBy, setSortBy] = useState('createdAt')
  const [sortDirection, setSortDirection] = useState('desc')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  const [selectedNotifications, setSelectedNotifications] = useState([])
  const [viewMode, setViewMode] = useState('table') // 'table' or 'card'

  useEffect(() => {
    fetchNotifications()
  }, [])

  const fetchNotifications = async () => {
    try {
      setLoading(true)
      
      const result = await notificationService.getNotifications()
      
      if (result.success) {
        setNotifications(result.data)
        toast.success('Notifications loaded successfully!')
      } else {
        toast.error(result.error || 'Failed to load notifications')
        console.error('Notifications error:', result.error)
      }
    } catch (error) {
      console.error('Error fetching notifications:', error)
      toast.error('An unexpected error occurred while loading notifications')
    } finally {
      setLoading(false)
    }
  }
      
      ]
      
    } catch (error) {
      console.error('Error fetching notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'sent': return 'success'
      case 'scheduled': return 'warning'
      case 'draft': return 'info'
      case 'failed': return 'danger'
      default: return 'default'
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'danger'
      case 'medium': return 'warning'
      case 'low': return 'info'
      default: return 'default'
    }
  }

  const getTypeIcon = (type) => {
    switch (type) {
      case 'appointment_reminder':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        )
      case 'promotional':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
          </svg>
        )
      case 'staff_notification':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        )
      case 'announcement':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
          </svg>
        )
      case 'feedback_request':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        )
      default:
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4.828 7l2.586 2.586a2 2 0 002.828 0L12.828 7H4.828z" />
          </svg>
        )
    }
  }

  const filteredNotifications = notifications.filter(notification => {
    const matchesSearch = notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notification.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notification.type.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesType = typeFilter === 'all' || notification.type === typeFilter
    const matchesStatus = statusFilter === 'all' || notification.status === statusFilter
    
    const matchesDateRange = !dateRange.start || !dateRange.end || 
                           (new Date(notification.createdAt) >= dateRange.start && new Date(notification.createdAt) <= dateRange.end)
    
    return matchesSearch && matchesType && matchesStatus && matchesDateRange
  })

  const sortedNotifications = [...filteredNotifications].sort((a, b) => {
    let aValue = a[sortBy]
    let bValue = b[sortBy]
    
    if (sortBy === 'createdAt' || sortBy === 'scheduledAt' || sortBy === 'sentAt') {
      aValue = new Date(aValue)
      bValue = new Date(bValue)
    }
    
    if (sortDirection === 'asc') {
      return aValue > bValue ? 1 : -1
    } else {
      return aValue < bValue ? 1 : -1
    }
  })

  const paginatedNotifications = sortedNotifications.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const totalPages = Math.ceil(sortedNotifications.length / itemsPerPage)

  const handleSelectNotification = (notificationId) => {
    setSelectedNotifications(prev => 
      prev.includes(notificationId) 
        ? prev.filter(id => id !== notificationId)
        : [...prev, notificationId]
    )
  }

  const handleSelectAll = () => {
    if (selectedNotifications.length === paginatedNotifications.length) {
      setSelectedNotifications([])
    } else {
      setSelectedNotifications(paginatedNotifications.map(n => n.id))
    }
  }

  const handleBulkAction = (action) => {
    console.log('Bulk action:', action, selectedNotifications)
    // Implement bulk actions
  }

  const calculateStats = () => {
    const sent = notifications.filter(n => n.status === 'sent')
    const scheduled = notifications.filter(n => n.status === 'scheduled')
    const totalRecipients = notifications.reduce((sum, n) => sum + n.recipients, 0)
    const totalDelivered = notifications.reduce((sum, n) => sum + n.delivered, 0)
    const totalOpened = notifications.reduce((sum, n) => sum + n.opened, 0)
    const totalClicked = notifications.reduce((sum, n) => sum + n.clicked, 0)
    
    return {
      total: notifications.length,
      sent: sent.length,
      scheduled: scheduled.length,
      totalRecipients,
      totalDelivered,
      totalOpened,
      totalClicked,
      openRate: totalDelivered > 0 ? (totalOpened / totalDelivered) * 100 : 0,
      clickRate: totalOpened > 0 ? (totalClicked / totalOpened) * 100 : 0
    }
  }

  const stats = calculateStats()

  const renderNotificationCard = (notification) => (
    <NotificationCard
      key={notification.id}
      notification={notification}
      onSelect={() => handleSelectNotification(notification.id)}
      selected={selectedNotifications.includes(notification.id)}
      onView={() => console.log('View notification:', notification.id)}
      onEdit={() => console.log('Edit notification:', notification.id)}
      onDelete={() => console.log('Delete notification:', notification.id)}
    />
  )

  const renderNotificationTable = () => (
    <Table
      data={paginatedNotifications}
      columns={[
        {
          key: 'select',
          label: (
            <input
              type="checkbox"
              checked={selectedNotifications.length === paginatedNotifications.length && paginatedNotifications.length > 0}
              onChange={handleSelectAll}
              className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
          ),
          render: (notification) => (
            <input
              type="checkbox"
              checked={selectedNotifications.includes(notification.id)}
              onChange={() => handleSelectNotification(notification.id)}
              className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
          )
        },
        {
          key: 'title',
          label: 'Title',
          sortable: true,
          render: (notification) => (
            <div className="flex items-center gap-2">
              {getTypeIcon(notification.type)}
              <span className="font-medium text-gray-900">{notification.title}</span>
            </div>
          )
        },
        {
          key: 'type',
          label: 'Type',
          sortable: true,
          render: (notification) => (
            <Badge variant="info" size="sm">
              {notification.type.replace('_', ' ')}
            </Badge>
          )
        },
        {
          key: 'status',
          label: 'Status',
          sortable: true,
          render: (notification) => (
            <Badge variant={getStatusColor(notification.status)} size="sm">
              {notification.status}
            </Badge>
          )
        },
        {
          key: 'priority',
          label: 'Priority',
          sortable: true,
          render: (notification) => (
            <Badge variant={getPriorityColor(notification.priority)} size="sm">
              {notification.priority}
            </Badge>
          )
        },
        {
          key: 'recipients',
          label: 'Recipients',
          sortable: true,
          render: (notification) => (
            <div className="text-center">
              <p className="font-medium text-gray-900">{notification.recipients}</p>
              <p className="text-sm text-gray-500">{notification.delivered} delivered</p>
            </div>
          )
        },
        {
          key: 'engagement',
          label: 'Engagement',
          sortable: true,
          render: (notification) => (
            <div className="text-center">
              <p className="text-sm text-gray-900">{notification.opened} opened</p>
              <p className="text-sm text-gray-500">{notification.clicked} clicked</p>
            </div>
          )
        },
        {
          key: 'createdAt',
          label: 'Created',
          sortable: true,
          render: (notification) => formatDate(notification.createdAt)
        },
        {
          key: 'actions',
          label: 'Actions',
          render: (notification) => (
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
          <p className="text-gray-600">Loading notifications...</p>
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
              <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
              <p className="text-gray-600 mt-1">Manage and track all business notifications</p>
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
              <Link to="/manager/notifications/create">
                <Button variant="primary">Create Notification</Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Stats */}
        <StatCardGrid
          stats={[
            {
              title: 'Total Notifications',
              value: stats.total,
              change: 12.5,
              changeType: 'positive',
              format: 'number',
              color: 'blue',
              icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4.828 7l2.586 2.586a2 2 0 002.828 0L12.828 7H4.828z" />
                </svg>
              )
            },
            {
              title: 'Sent',
              value: stats.sent,
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
              title: 'Scheduled',
              value: stats.scheduled,
              change: -2.1,
              changeType: 'negative',
              format: 'number',
              color: 'yellow',
              icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )
            },
            {
              title: 'Open Rate',
              value: stats.openRate,
              change: 5.2,
              changeType: 'positive',
              format: 'percentage',
              color: 'purple',
              icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
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
                  placeholder="Search notifications..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                <Dropdown
                  value={typeFilter}
                  onChange={setTypeFilter}
                  options={[
                    { value: 'all', label: 'All Types' },
                    { value: 'appointment_reminder', label: 'Appointment Reminder' },
                    { value: 'promotional', label: 'Promotional' },
                    { value: 'staff_notification', label: 'Staff Notification' },
                    { value: 'announcement', label: 'Announcement' },
                    { value: 'feedback_request', label: 'Feedback Request' }
                  ]}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <Dropdown
                  value={statusFilter}
                  onChange={setStatusFilter}
                  options={[
                    { value: 'all', label: 'All Statuses' },
                    { value: 'sent', label: 'Sent' },
                    { value: 'scheduled', label: 'Scheduled' },
                    { value: 'draft', label: 'Draft' },
                    { value: 'failed', label: 'Failed' }
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
        {selectedNotifications.length > 0 && (
          <Card className="mt-6">
            <div className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">
                  {selectedNotifications.length} notification(s) selected
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
                    onClick={() => handleBulkAction('mark_sent')}
                  >
                    Mark as Sent
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
                {filteredNotifications.length} notification(s) found
              </h3>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Sort by:</span>
                <Dropdown
                  value={sortBy}
                  onChange={setSortBy}
                  options={[
                    { value: 'createdAt', label: 'Created Date' },
                    { value: 'scheduledAt', label: 'Scheduled Date' },
                    { value: 'title', label: 'Title' },
                    { value: 'status', label: 'Status' }
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

            {viewMode === 'table' ? renderNotificationTable() : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {paginatedNotifications.map(renderNotificationCard)}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-6 flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, sortedNotifications.length)} of {sortedNotifications.length} results
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

export default NotificationList
