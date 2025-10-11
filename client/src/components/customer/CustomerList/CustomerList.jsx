import React, { useState, useMemo } from 'react'
import { Card, Button, Input, Dropdown, Pagination, LoadingSpinner, Badge } from '../../common'
import CustomerCard from '../CustomerCard/CustomerCard'

const CustomerList = ({ 
  customers = [],
  loading = false,
  onCustomerSelect,
  onEdit,
  onDelete,
  onViewProfile,
  onViewHistory,
  onBookAppointment,
  onSendMessage,
  className = ''
}) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [sortBy, setSortBy] = useState('name')
  const [sortOrder, setSortOrder] = useState('asc')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(12)
  const [viewMode, setViewMode] = useState('grid') // 'grid' or 'list'

  // Filter and sort customers
  const filteredAndSortedCustomers = useMemo(() => {
    let filtered = customers.filter(customer => {
      const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           customer.phone?.includes(searchTerm)
      
      const matchesStatus = !statusFilter || customer.status === statusFilter
      
      return matchesSearch && matchesStatus
    })

    // Sort customers
    filtered.sort((a, b) => {
      let aValue, bValue
      
      switch (sortBy) {
        case 'name':
          aValue = a.name.toLowerCase()
          bValue = b.name.toLowerCase()
          break
        case 'totalSpent':
          aValue = a.totalSpent || 0
          bValue = b.totalSpent || 0
          break
        case 'totalAppointments':
          aValue = a.totalAppointments || 0
          bValue = b.totalAppointments || 0
          break
        case 'lastVisit':
          aValue = new Date(a.lastVisit || 0)
          bValue = new Date(b.lastVisit || 0)
          break
        case 'createdAt':
          aValue = new Date(a.createdAt || 0)
          bValue = new Date(b.createdAt || 0)
          break
        default:
          aValue = a.name.toLowerCase()
          bValue = b.name.toLowerCase()
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

    return filtered
  }, [customers, searchTerm, statusFilter, sortBy, sortOrder])

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedCustomers.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedCustomers = filteredAndSortedCustomers.slice(startIndex, startIndex + itemsPerPage)

  const statusOptions = [
    { label: 'All Statuses', value: '' },
    { label: 'Active', value: 'active' },
    { label: 'Inactive', value: 'inactive' },
    { label: 'VIP', value: 'vip' },
    { label: 'New', value: 'new' }
  ]

  const sortOptions = [
    { label: 'Name (A-Z)', value: 'name-asc' },
    { label: 'Name (Z-A)', value: 'name-desc' },
    { label: 'Total Spent (High to Low)', value: 'totalSpent-desc' },
    { label: 'Total Spent (Low to High)', value: 'totalSpent-asc' },
    { label: 'Appointments (High to Low)', value: 'totalAppointments-desc' },
    { label: 'Appointments (Low to High)', value: 'totalAppointments-asc' },
    { label: 'Last Visit (Recent)', value: 'lastVisit-desc' },
    { label: 'Last Visit (Oldest)', value: 'lastVisit-asc' },
    { label: 'Newest Customers', value: 'createdAt-desc' },
    { label: 'Oldest Customers', value: 'createdAt-asc' }
  ]

  const handleSortChange = (value) => {
    const [field, order] = value.split('-')
    setSortBy(field)
    setSortOrder(order)
  }

  const handleItemsPerPageChange = (value) => {
    setItemsPerPage(parseInt(value))
    setCurrentPage(1)
  }

  if (loading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    )
  }

  return (
    <div className={className}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Customers</h2>
          <p className="text-gray-600">
            {filteredAndSortedCustomers.length} customer{filteredAndSortedCustomers.length !== 1 ? 's' : ''} found
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="primary"
            onClick={() => onCustomerSelect && onCustomerSelect(null)}
          >
            Add Customer
          </Button>
        </div>
      </div>

      {/* Filters and Search */}
      <Card className="mb-6">
        <div className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <Input
                type="text"
                placeholder="Search customers by name, email, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>

            {/* Status Filter */}
            <div className="w-full lg:w-48">
              <Dropdown
                options={statusOptions}
                value={statusFilter}
                onChange={setStatusFilter}
                placeholder="Filter by status"
                optionLabel="label"
                optionValue="value"
              />
            </div>

            {/* Sort */}
            <div className="w-full lg:w-56">
              <Dropdown
                options={sortOptions}
                value={`${sortBy}-${sortOrder}`}
                onChange={handleSortChange}
                placeholder="Sort by"
                optionLabel="label"
                optionValue="value"
              />
            </div>

            {/* Items per page */}
            <div className="w-full lg:w-32">
              <Dropdown
                options={[
                  { label: '12 per page', value: '12' },
                  { label: '24 per page', value: '24' },
                  { label: '48 per page', value: '48' }
                ]}
                value={itemsPerPage.toString()}
                onChange={handleItemsPerPageChange}
                placeholder="Per page"
                optionLabel="label"
                optionValue="value"
              />
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-1 border border-gray-300 rounded-md">
              <Button
                variant={viewMode === 'grid' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="rounded-r-none"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </Button>
              <Button
                variant={viewMode === 'list' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="rounded-l-none"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Results */}
      {paginatedCustomers.length > 0 ? (
        <>
          {/* Grid View */}
          {viewMode === 'grid' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-6">
              {paginatedCustomers.map((customer) => (
                <CustomerCard
                  key={customer.id}
                  customer={customer}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onViewProfile={onViewProfile}
                  onViewHistory={onViewHistory}
                  onBookAppointment={onBookAppointment}
                  onSendMessage={onSendMessage}
                />
              ))}
            </div>
          )}

          {/* List View */}
          {viewMode === 'list' && (
            <div className="space-y-4 mb-6">
              {paginatedCustomers.map((customer) => (
                <Card key={customer.id} className="hover:shadow-md transition-shadow">
                  <div className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        {/* Avatar */}
                        {customer.avatar ? (
                          <img
                            src={customer.avatar}
                            alt={customer.name}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center font-semibold">
                            {customer.name.split(' ').map(word => word.charAt(0)).join('').toUpperCase().slice(0, 2)}
                          </div>
                        )}

                        {/* Customer Info */}
                        <div>
                          <h3 className="font-semibold text-gray-900">{customer.name}</h3>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span>{customer.email}</span>
                            <span>{customer.phone}</span>
                            <Badge variant={customer.status === 'active' ? 'success' : customer.status === 'vip' ? 'warning' : 'default'}>
                              {customer.status?.toUpperCase() || 'ACTIVE'}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="flex items-center gap-6 text-sm">
                        <div className="text-center">
                          <p className="font-semibold text-gray-900">{customer.totalAppointments || 0}</p>
                          <p className="text-gray-600">Appointments</p>
                        </div>
                        <div className="text-center">
                          <p className="font-semibold text-gray-900">
                            {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(customer.totalSpent || 0)}
                          </p>
                          <p className="text-gray-600">Total Spent</p>
                        </div>
                        <div className="text-center">
                          <p className="font-semibold text-gray-900">
                            {customer.lastVisit ? new Date(customer.lastVisit).toLocaleDateString() : 'Never'}
                          </p>
                          <p className="text-gray-600">Last Visit</p>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        {onViewProfile && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onViewProfile(customer)}
                          >
                            View
                          </Button>
                        )}
                        {onEdit && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onEdit(customer)}
                          >
                            Edit
                          </Button>
                        )}
                        {onBookAppointment && (
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => onBookAppointment(customer)}
                          >
                            Book
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredAndSortedCustomers.length)} of {filteredAndSortedCustomers.length} customers
              </div>
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
            <p className="text-gray-600 mb-4">
              {searchTerm || statusFilter 
                ? 'Try adjusting your search criteria or filters.'
                : 'Get started by adding your first customer.'
              }
            </p>
            <Button
              variant="primary"
              onClick={() => onCustomerSelect && onCustomerSelect(null)}
            >
              Add Customer
            </Button>
          </div>
        </Card>
      )}
    </div>
  )
}

export default CustomerList
