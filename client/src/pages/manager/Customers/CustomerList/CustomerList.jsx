import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Card, Button, Table, SearchBar, Dropdown, Badge, Modal, Alert } from '../../../../components'
import customerService from '../../../../services/customer/customerService'
import { toast } from 'react-hot-toast'

const CustomerList = () => {
  const [customers, setCustomers] = useState([])
  const [filteredCustomers, setFilteredCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [segmentFilter, setSegmentFilter] = useState('')
  const [selectedCustomer, setSelectedCustomer] = useState(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    fetchCustomers()
  }, [])

  useEffect(() => {
    filterCustomers()
  }, [customers, searchTerm, statusFilter, segmentFilter])

  const fetchCustomers = async () => {
    try {
      setLoading(true)
      
      const result = await customerService.getCustomers()
      
      if (result.success) {
        setCustomers(result.data)
        toast.success('Customers loaded successfully!')
      } else {
        toast.error(result.error || 'Failed to load customers')
        console.error('Customers error:', result.error)
      }
    } catch (error) {
      console.error('Error fetching customers:', error)
      toast.error('An unexpected error occurred while loading customers')
    } finally {
      setLoading(false)
    }
  }

  const fetchCustomersOld = async () => {
    try {
      setLoading(true)
      
      ]
      
    } catch (error) {
      console.error('Error fetching customers:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterCustomers = () => {
    let filtered = customers

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(customer =>
        customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.phone.includes(searchTerm)
      )
    }

    // Status filter
    if (statusFilter) {
      filtered = filtered.filter(customer => customer.status === statusFilter)
    }

    // Segment filter
    if (segmentFilter) {
      filtered = filtered.filter(customer => customer.segment === segmentFilter)
    }

    setFilteredCustomers(filtered)
  }

  const handleDelete = async () => {
    if (!selectedCustomer) return

    try {
      setDeleting(true)
      // Simulate API call
      
      setCustomers(prev => prev.filter(c => c.id !== selectedCustomer.id))
      setShowDeleteModal(false)
      setSelectedCustomer(null)
    } catch (error) {
      console.error('Error deleting customer:', error)
    } finally {
      setDeleting(false)
    }
  }

  const handleStatusChange = async (customerId, newStatus) => {
    try {
      // Simulate API call
      
      setCustomers(prev => prev.map(customer =>
        customer.id === customerId
          ? { ...customer, status: newStatus }
          : customer
      ))
    } catch (error) {
      console.error('Error updating customer status:', error)
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
      case 'inactive': return 'danger'
      case 'pending': return 'warning'
      default: return 'default'
    }
  }

  const getSegmentColor = (segment) => {
    switch (segment) {
      case 'vip': return 'purple'
      case 'regular': return 'blue'
      case 'new': return 'green'
      case 'at_risk': return 'orange'
      default: return 'default'
    }
  }

  const statusOptions = [
    { label: 'All Statuses', value: '' },
    { label: 'Active', value: 'active' },
    { label: 'Inactive', value: 'inactive' },
    { label: 'Pending', value: 'pending' }
  ]

  const segmentOptions = [
    { label: 'All Segments', value: '' },
    { label: 'VIP', value: 'vip' },
    { label: 'Regular', value: 'regular' },
    { label: 'New', value: 'new' },
    { label: 'At Risk', value: 'at_risk' }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Customer Management</h1>
              <p className="mt-2 text-gray-600">
                Manage your customers and their information
              </p>
            </div>
            <div className="flex gap-2">
              <Link to="/manager/customers/analytics">
                <Button variant="outline">Analytics</Button>
              </Link>
              <Link to="/manager/customers/segments">
                <Button variant="outline">Segments</Button>
              </Link>
              <Button variant="primary">Add Customer</Button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <SearchBar
                  onSearch={(term) => setSearchTerm(term)}
                  placeholder="Search customers..."
                  debounceTime={300}
                />
              </div>
              <div>
                <Dropdown
                  options={statusOptions}
                  value={statusFilter}
                  onChange={setStatusFilter}
                  placeholder="Filter by status"
                  optionLabel="label"
                  optionValue="value"
                  clearable
                />
              </div>
              <div>
                <Dropdown
                  options={segmentOptions}
                  value={segmentFilter}
                  onChange={setSegmentFilter}
                  placeholder="Filter by segment"
                  optionLabel="label"
                  optionValue="value"
                  clearable
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Results Summary */}
        <div className="mb-4">
          <p className="text-sm text-gray-600">
            Showing {filteredCustomers.length} of {customers.length} customers
          </p>
        </div>

        {/* Customer Table */}
        <Card>
          <div className="p-6">
            <Table
              data={filteredCustomers}
              columns={[
                {
                  key: 'name',
                  label: 'Customer',
                  sortable: true,
                  render: (customer) => (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                        <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{customer.name}</p>
                        <p className="text-sm text-gray-500">{customer.email}</p>
                      </div>
                    </div>
                  )
                },
                {
                  key: 'contact',
                  label: 'Contact',
                  render: (customer) => (
                    <div>
                      <p className="text-sm text-gray-900">{customer.phone}</p>
                      <p className="text-sm text-gray-500">{customer.email}</p>
                    </div>
                  )
                },
                {
                  key: 'segment',
                  label: 'Segment',
                  sortable: true,
                  render: (customer) => (
                    <Badge variant={getSegmentColor(customer.segment)} size="sm">
                      {customer.segment.toUpperCase()}
                    </Badge>
                  )
                },
                {
                  key: 'status',
                  label: 'Status',
                  sortable: true,
                  render: (customer) => (
                    <Badge variant={getStatusColor(customer.status)} size="sm">
                      {customer.status}
                    </Badge>
                  )
                },
                {
                  key: 'spending',
                  label: 'Spending',
                  sortable: true,
                  render: (customer) => (
                    <div className="text-sm">
                      <p className="font-medium text-gray-900">{formatCurrency(customer.totalSpent)}</p>
                      <p className="text-gray-500">{customer.totalVisits} visits</p>
                    </div>
                  )
                },
                {
                  key: 'lastVisit',
                  label: 'Last Visit',
                  sortable: true,
                  render: (customer) => formatDate(customer.lastVisit)
                },
                {
                  key: 'preferredStaff',
                  label: 'Preferred Staff',
                  render: (customer) => (
                    <span className="text-sm text-gray-900">{customer.preferredStaff}</span>
                  )
                },
                {
                  key: 'actions',
                  label: 'Actions',
                  render: (customer) => (
                    <div className="flex gap-2">
                      <Link to={`/manager/customers/${customer.id}`}>
                        <Button variant="outline" size="sm">View</Button>
                      </Link>
                      <Button variant="outline" size="sm">Edit</Button>
                      <Dropdown
                        options={[
                          { label: 'Activate', value: 'active' },
                          { label: 'Deactivate', value: 'inactive' },
                          { label: 'Mark Pending', value: 'pending' }
                        ]}
                        value=""
                        onChange={(value) => handleStatusChange(customer.id, value)}
                        placeholder="Actions"
                        optionLabel="label"
                        optionValue="value"
                        buttonClassName="text-sm"
                      />
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => {
                          setSelectedCustomer(customer)
                          setShowDeleteModal(true)
                        }}
                      >
                        Delete
                      </Button>
                    </div>
                  )
                }
              ]}
              onSort={(key, direction) => {
                console.log('Sort by:', key, direction)
              }}
              sortable={true}
              loading={loading}
              emptyMessage="No customers found matching your criteria."
            />
          </div>
        </Card>

        {/* Delete Confirmation Modal */}
        <Modal
          isOpen={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false)
            setSelectedCustomer(null)
          }}
          title="Delete Customer"
          size="md"
        >
          <div className="space-y-4">
            <Alert
              type="error"
              title="Are you sure you want to delete this customer?"
              message={`This action cannot be undone. All data associated with "${selectedCustomer?.name}" will be permanently removed.`}
            />
            
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setShowDeleteModal(false)
                  setSelectedCustomer(null)
                }}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                loading={deleting}
                onClick={handleDelete}
              >
                {deleting ? 'Deleting...' : 'Delete Customer'}
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  )
}

export default CustomerList
