import React, { useState, useMemo } from 'react'
import { Card, Button, Badge, Input, Dropdown, Pagination, LoadingSpinner } from '../../common'

const CustomerSegment = ({ 
  customers = [],
  segments = [],
  onSegmentSelect,
  onCustomerSelect,
  loading = false,
  className = ''
}) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSegment, setSelectedSegment] = useState('')
  const [sortBy, setSortBy] = useState('name')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(12)

  // Default segments if none provided
  const defaultSegments = [
    {
      id: 'vip',
      name: 'VIP Customers',
      description: 'High-value customers with premium status',
      criteria: { totalSpent: { min: 1000 }, status: 'vip' },
      color: 'purple',
      icon: '👑'
    },
    {
      id: 'frequent',
      name: 'Frequent Visitors',
      description: 'Customers with many appointments',
      criteria: { totalAppointments: { min: 10 } },
      color: 'blue',
      icon: '⭐'
    },
    {
      id: 'new',
      name: 'New Customers',
      description: 'Recently registered customers',
      criteria: { createdAt: { days: 30 } },
      color: 'green',
      icon: '🆕'
    },
    {
      id: 'inactive',
      name: 'Inactive Customers',
      description: 'Customers who haven\'t visited recently',
      criteria: { lastVisit: { days: 90 } },
      color: 'red',
      icon: '😴'
    },
    {
      id: 'high_value',
      name: 'High Value',
      description: 'Customers with high spending',
      criteria: { totalSpent: { min: 500 } },
      color: 'yellow',
      icon: '💰'
    },
    {
      id: 'at_risk',
      name: 'At Risk',
      description: 'Customers showing signs of churn',
      criteria: { lastVisit: { days: 60 }, totalAppointments: { min: 3 } },
      color: 'orange',
      icon: '⚠️'
    }
  ]

  const allSegments = segments.length > 0 ? segments : defaultSegments

  // Filter customers based on selected segment
  const filteredCustomers = useMemo(() => {
    let filtered = customers

    // Apply segment filter
    if (selectedSegment) {
      const segment = allSegments.find(s => s.id === selectedSegment)
      if (segment) {
        filtered = customers.filter(customer => {
          const criteria = segment.criteria
          
          // Check total spent criteria
          if (criteria.totalSpent?.min && (customer.totalSpent || 0) < criteria.totalSpent.min) {
            return false
          }
          
          // Check total appointments criteria
          if (criteria.totalAppointments?.min && (customer.totalAppointments || 0) < criteria.totalAppointments.min) {
            return false
          }
          
          // Check status criteria
          if (criteria.status && customer.status !== criteria.status) {
            return false
          }
          
          // Check creation date criteria
          if (criteria.createdAt?.days) {
            const daysSinceCreation = Math.floor((new Date() - new Date(customer.createdAt)) / (1000 * 60 * 60 * 24))
            if (daysSinceCreation > criteria.createdAt.days) {
              return false
            }
          }
          
          // Check last visit criteria
          if (criteria.lastVisit?.days) {
            if (!customer.lastVisit) return true // No visit = inactive
            const daysSinceLastVisit = Math.floor((new Date() - new Date(customer.lastVisit)) / (1000 * 60 * 60 * 24))
            if (daysSinceLastVisit < criteria.lastVisit.days) {
              return false
            }
          }
          
          return true
        })
      }
    }

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(customer =>
        customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.phone?.includes(searchTerm)
      )
    }

    // Sort customers
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name)
        case 'totalSpent':
          return (b.totalSpent || 0) - (a.totalSpent || 0)
        case 'totalAppointments':
          return (b.totalAppointments || 0) - (a.totalAppointments || 0)
        case 'lastVisit':
          return new Date(b.lastVisit || 0) - new Date(a.lastVisit || 0)
        default:
          return a.name.localeCompare(b.name)
      }
    })

    return filtered
  }, [customers, selectedSegment, searchTerm, sortBy, allSegments])

  // Pagination
  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedCustomers = filteredCustomers.slice(startIndex, startIndex + itemsPerPage)

  const formatDate = (dateString) => {
    if (!dateString) return 'Never'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0)
  }

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'success'
      case 'inactive': return 'danger'
      case 'vip': return 'warning'
      case 'new': return 'info'
      default: return 'default'
    }
  }

  const sortOptions = [
    { label: 'Name (A-Z)', value: 'name' },
    { label: 'Total Spent (High to Low)', value: 'totalSpent' },
    { label: 'Total Appointments (High to Low)', value: 'totalAppointments' },
    { label: 'Last Visit (Recent)', value: 'lastVisit' }
  ]

  const segmentOptions = [
    { label: 'All Customers', value: '' },
    ...allSegments.map(segment => ({
      label: `${segment.icon} ${segment.name}`,
      value: segment.id
    }))
  ]

  const renderSegmentCard = (segment) => {
    const segmentCustomers = customers.filter(customer => {
      const criteria = segment.criteria
      
      if (criteria.totalSpent?.min && (customer.totalSpent || 0) < criteria.totalSpent.min) return false
      if (criteria.totalAppointments?.min && (customer.totalAppointments || 0) < criteria.totalAppointments.min) return false
      if (criteria.status && customer.status !== criteria.status) return false
      
      if (criteria.createdAt?.days) {
        const daysSinceCreation = Math.floor((new Date() - new Date(customer.createdAt)) / (1000 * 60 * 60 * 24))
        if (daysSinceCreation > criteria.createdAt.days) return false
      }
      
      if (criteria.lastVisit?.days) {
        if (!customer.lastVisit) return true
        const daysSinceLastVisit = Math.floor((new Date() - new Date(customer.lastVisit)) / (1000 * 60 * 60 * 24))
        if (daysSinceLastVisit < criteria.lastVisit.days) return false
      }
      
      return true
    })

    return (
      <Card 
        key={segment.id} 
        className={`cursor-pointer hover:shadow-md transition-shadow ${
          selectedSegment === segment.id ? 'ring-2 ring-primary-500' : ''
        }`}
        onClick={() => {
          setSelectedSegment(selectedSegment === segment.id ? '' : segment.id)
          setCurrentPage(1)
        }}
      >
        <div className="p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="text-2xl">{segment.icon}</div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">{segment.name}</h3>
              <p className="text-sm text-gray-600">{segment.description}</p>
            </div>
            <Badge variant={segment.color}>
              {segmentCustomers.length}
            </Badge>
          </div>
          
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-gray-500">Avg. Spent:</span>
              <span className="ml-1 font-medium">
                {formatCurrency(
                  segmentCustomers.reduce((sum, c) => sum + (c.totalSpent || 0), 0) / 
                  (segmentCustomers.length || 1)
                )}
              </span>
            </div>
            <div>
              <span className="text-gray-500">Avg. Visits:</span>
              <span className="ml-1 font-medium">
                {Math.round(
                  segmentCustomers.reduce((sum, c) => sum + (c.totalAppointments || 0), 0) / 
                  (segmentCustomers.length || 1)
                )}
              </span>
            </div>
          </div>
        </div>
      </Card>
    )
  }

  const renderCustomerCard = (customer) => (
    <Card 
      key={customer.id} 
      className="hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => onCustomerSelect && onCustomerSelect(customer)}
    >
      <div className="p-4">
        <div className="flex items-center gap-3 mb-3">
          {customer.avatar ? (
            <img
              src={customer.avatar}
              alt={customer.name}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center font-semibold text-sm">
              {getInitials(customer.name)}
            </div>
          )}
          <div className="flex-1">
            <h4 className="font-medium text-gray-900">{customer.name}</h4>
            <p className="text-sm text-gray-600">{customer.email}</p>
          </div>
          <Badge variant={getStatusColor(customer.status)} size="sm">
            {customer.status?.toUpperCase() || 'ACTIVE'}
          </Badge>
        </div>
        
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <span className="text-gray-500">Spent:</span>
            <span className="ml-1 font-medium">{formatCurrency(customer.totalSpent)}</span>
          </div>
          <div>
            <span className="text-gray-500">Visits:</span>
            <span className="ml-1 font-medium">{customer.totalAppointments || 0}</span>
          </div>
          <div>
            <span className="text-gray-500">Last Visit:</span>
            <span className="ml-1 font-medium">{formatDate(customer.lastVisit)}</span>
          </div>
          <div>
            <span className="text-gray-500">Member Since:</span>
            <span className="ml-1 font-medium">{formatDate(customer.createdAt)}</span>
          </div>
        </div>
      </div>
    </Card>
  )

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
          <h2 className="text-2xl font-bold text-gray-900">Customer Segmentation</h2>
          <p className="text-gray-600">
            Analyze and segment your customers based on behavior and value
          </p>
        </div>
      </div>

      {/* Segments Overview */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Segments</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {allSegments.map(renderSegmentCard)}
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <div className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <Input
                type="text"
                placeholder="Search customers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="w-full lg:w-48">
              <Dropdown
                options={segmentOptions}
                value={selectedSegment}
                onChange={setSelectedSegment}
                placeholder="Select segment"
                optionLabel="label"
                optionValue="value"
              />
            </div>
            
            <div className="w-full lg:w-48">
              <Dropdown
                options={sortOptions}
                value={sortBy}
                onChange={setSortBy}
                placeholder="Sort by"
                optionLabel="label"
                optionValue="value"
              />
            </div>
            
            <div className="w-full lg:w-32">
              <Dropdown
                options={[
                  { label: '12 per page', value: '12' },
                  { label: '24 per page', value: '24' },
                  { label: '48 per page', value: '48' }
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

      {/* Results */}
      {paginatedCustomers.length > 0 ? (
        <>
          <div className="mb-4">
            <p className="text-sm text-gray-600">
              Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredCustomers.length)} of {filteredCustomers.length} customers
              {selectedSegment && (
                <span className="ml-2">
                  in segment: <strong>{allSegments.find(s => s.id === selectedSegment)?.name}</strong>
                </span>
              )}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
            {paginatedCustomers.map(renderCustomerCard)}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center">
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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No customers found</h3>
            <p className="text-gray-600">
              {searchTerm || selectedSegment
                ? 'Try adjusting your search criteria or segment filter.'
                : 'No customers available for segmentation.'
              }
            </p>
          </div>
        </Card>
      )}
    </div>
  )
}

export default CustomerSegment
