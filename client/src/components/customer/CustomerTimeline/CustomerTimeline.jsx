import React, { useState, useMemo } from 'react'
import { Card, Button, Badge, Input, Dropdown, Pagination, LoadingSpinner } from '../../common'

const CustomerTimeline = ({ 
  customer,
  activities = [],
  loading = false,
  onActivityClick,
  className = ''
}) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [dateFilter, setDateFilter] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(20)

  const activityTypes = [
    { value: '', label: 'All Activities', color: 'default' },
    { value: 'appointment', label: 'Appointments', color: 'blue' },
    { value: 'transaction', label: 'Transactions', color: 'green' },
    { value: 'note', label: 'Notes', color: 'purple' },
    { value: 'status_change', label: 'Status Changes', color: 'yellow' },
    { value: 'profile_update', label: 'Profile Updates', color: 'gray' },
    { value: 'communication', label: 'Communications', color: 'pink' }
  ]

  const dateOptions = [
    { label: 'All Time', value: '' },
    { label: 'Today', value: 'today' },
    { label: 'This Week', value: 'this_week' },
    { label: 'This Month', value: 'this_month' },
    { label: 'Last 3 Months', value: 'last_3_months' },
    { label: 'Last 6 Months', value: 'last_6_months' },
    { label: 'This Year', value: 'this_year' }
  ]

  // Filter and sort activities
  const filteredActivities = useMemo(() => {
    let filtered = activities.filter(activity => {
      const matchesSearch = activity.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           activity.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           activity.type?.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesType = !typeFilter || activity.type === typeFilter
      
      const matchesDate = !dateFilter || isDateInRange(activity.timestamp, dateFilter)
      
      return matchesSearch && matchesType && matchesDate
    })

    // Sort by timestamp (newest first)
    filtered.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))

    return filtered
  }, [activities, searchTerm, typeFilter, dateFilter])

  // Helper function to check if date is in range
  const isDateInRange = (dateString, range) => {
    const date = new Date(dateString)
    const now = new Date()
    
    switch (range) {
      case 'today':
        return date.toDateString() === now.toDateString()
      case 'this_week':
        const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()))
        const endOfWeek = new Date(now.setDate(now.getDate() - now.getDay() + 6))
        return date >= startOfWeek && date <= endOfWeek
      case 'this_month':
        return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()
      case 'last_3_months':
        const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, 1)
        return date >= threeMonthsAgo
      case 'last_6_months':
        const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 6, 1)
        return date >= sixMonthsAgo
      case 'this_year':
        return date.getFullYear() === now.getFullYear()
      default:
        return true
    }
  }

  // Pagination
  const totalPages = Math.ceil(filteredActivities.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedActivities = filteredActivities.slice(startIndex, startIndex + itemsPerPage)

  const formatDateTime = (timestamp) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60))
    
    if (diffInHours < 1) {
      return 'Just now'
    } else if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`
    } else if (diffInHours < 48) {
      return 'Yesterday'
    } else if (diffInHours < 168) { // 7 days
      return `${Math.floor(diffInHours / 24)} days ago`
    } else {
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }
  }

  const getActivityIcon = (type) => {
    switch (type) {
      case 'appointment':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        )
      case 'transaction':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
          </svg>
        )
      case 'note':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        )
      case 'status_change':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
      case 'profile_update':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        )
      case 'communication':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        )
      default:
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
    }
  }

  const getActivityColor = (type) => {
    const activityType = activityTypes.find(t => t.value === type)
    return activityType ? activityType.color : 'default'
  }

  const renderActivityItem = (activity, index) => {
    const isLast = index === paginatedActivities.length - 1
    
    return (
      <div key={activity.id} className="relative flex gap-4 pb-6">
        {/* Timeline line */}
        {!isLast && (
          <div className="absolute left-6 top-12 w-0.5 h-full bg-gray-200"></div>
        )}
        
        {/* Icon */}
        <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${
          getActivityColor(activity.type) === 'blue' ? 'bg-blue-100 text-blue-600' :
          getActivityColor(activity.type) === 'green' ? 'bg-green-100 text-green-600' :
          getActivityColor(activity.type) === 'purple' ? 'bg-purple-100 text-purple-600' :
          getActivityColor(activity.type) === 'yellow' ? 'bg-yellow-100 text-yellow-600' :
          getActivityColor(activity.type) === 'pink' ? 'bg-pink-100 text-pink-600' :
          'bg-gray-100 text-gray-600'
        }`}>
          {getActivityIcon(activity.type)}
        </div>
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          <Card className="hover:shadow-md transition-shadow">
            <div className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 mb-1">{activity.title}</h4>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant={getActivityColor(activity.type)} size="sm">
                      {activityTypes.find(t => t.value === activity.type)?.label || activity.type}
                    </Badge>
                    <span className="text-sm text-gray-500">
                      {formatDateTime(activity.timestamp)}
                    </span>
                  </div>
                </div>
                {onActivityClick && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onActivityClick(activity)}
                  >
                    View
                  </Button>
                )}
              </div>
              
              {activity.description && (
                <p className="text-sm text-gray-600 mb-3">
                  {activity.description}
                </p>
              )}
              
              {/* Activity-specific details */}
              {activity.type === 'appointment' && (
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {activity.service && (
                    <div>
                      <span className="text-gray-500">Service:</span>
                      <span className="ml-1 font-medium">{activity.service}</span>
                    </div>
                  )}
                  {activity.staff && (
                    <div>
                      <span className="text-gray-500">Staff:</span>
                      <span className="ml-1 font-medium">{activity.staff}</span>
                    </div>
                  )}
                  {activity.amount && (
                    <div>
                      <span className="text-gray-500">Amount:</span>
                      <span className="ml-1 font-medium">
                        {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(activity.amount)}
                      </span>
                    </div>
                  )}
                  {activity.status && (
                    <div>
                      <span className="text-gray-500">Status:</span>
                      <Badge 
                        variant={activity.status === 'completed' ? 'success' : 'warning'} 
                        size="sm"
                        className="ml-1"
                      >
                        {activity.status}
                      </Badge>
                    </div>
                  )}
                </div>
              )}
              
              {activity.type === 'transaction' && (
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {activity.amount && (
                    <div>
                      <span className="text-gray-500">Amount:</span>
                      <span className="ml-1 font-medium">
                        {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(activity.amount)}
                      </span>
                    </div>
                  )}
                  {activity.paymentMethod && (
                    <div>
                      <span className="text-gray-500">Payment:</span>
                      <span className="ml-1 font-medium">{activity.paymentMethod}</span>
                    </div>
                  )}
                  {activity.status && (
                    <div>
                      <span className="text-gray-500">Status:</span>
                      <Badge 
                        variant={activity.status === 'paid' ? 'success' : 'warning'} 
                        size="sm"
                        className="ml-1"
                      >
                        {activity.status}
                      </Badge>
                    </div>
                  )}
                </div>
              )}
              
              {activity.type === 'note' && activity.noteType && (
                <div className="text-sm">
                  <span className="text-gray-500">Type:</span>
                  <Badge variant="outline" size="sm" className="ml-1">
                    {activity.noteType}
                  </Badge>
                </div>
              )}
              
              {activity.type === 'status_change' && (
                <div className="text-sm">
                  <span className="text-gray-500">Changed from:</span>
                  <Badge variant="outline" size="sm" className="ml-1 mr-2">
                    {activity.oldStatus}
                  </Badge>
                  <span className="text-gray-500">to:</span>
                  <Badge variant="primary" size="sm" className="ml-1">
                    {activity.newStatus}
                  </Badge>
                </div>
              )}
              
              {activity.author && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span>By {activity.author}</span>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className={className}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Activity Timeline</h2>
          <p className="text-gray-600">
            {customer ? `${customer.name}'s complete activity history` : 'Customer activity timeline'}
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <div className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <Input
                type="text"
                placeholder="Search activities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="w-full lg:w-48">
              <Dropdown
                options={activityTypes}
                value={typeFilter}
                onChange={setTypeFilter}
                placeholder="Filter by type"
                optionLabel="label"
                optionValue="value"
              />
            </div>
            
            <div className="w-full lg:w-48">
              <Dropdown
                options={dateOptions}
                value={dateFilter}
                onChange={setDateFilter}
                placeholder="Filter by date"
                optionLabel="label"
                optionValue="value"
              />
            </div>
            
            <div className="w-full lg:w-32">
              <Dropdown
                options={[
                  { label: '20 per page', value: '20' },
                  { label: '50 per page', value: '50' },
                  { label: '100 per page', value: '100' }
                ]}
                value={itemsPerPage.toString()}
                onChange={(value) => setItemsPerPage(parseInt(value))}
                placeholder="Per page"
                optionLabel="label"
                optionValue="value"
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Timeline */}
      {paginatedActivities.length > 0 ? (
        <>
          <div className="mb-4">
            <p className="text-sm text-gray-600">
              Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredActivities.length)} of {filteredActivities.length} activities
            </p>
          </div>
          
          <div className="space-y-0">
            {paginatedActivities.map((activity, index) => renderActivityItem(activity, index))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-6">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                showFirstLast
                showPrevNext
              />
            </div>
          )}
        </>
      ) : (
        <Card>
          <div className="p-12 text-center">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No activities found</h3>
            <p className="text-gray-600">
              {searchTerm || typeFilter || dateFilter
                ? 'Try adjusting your search criteria or filters.'
                : 'No activities recorded yet.'
              }
            </p>
          </div>
        </Card>
      )}
    </div>
  )
}

export default CustomerTimeline
