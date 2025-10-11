import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Card, Button, Table, SearchBar, Dropdown, Badge, Modal, Alert } from '../../../../components'
import businessService from '../../../../services/admin/businessService'
import { toast } from 'react-hot-toast'

const BusinessList = () => {
  const [businesses, setBusinesses] = useState([])
  const [filteredBusinesses, setFilteredBusinesses] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [selectedBusiness, setSelectedBusiness] = useState(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    fetchBusinesses()
  }, [])

  useEffect(() => {
    filterBusinesses()
  }, [businesses, searchTerm, statusFilter, typeFilter])

  const fetchBusinesses = async () => {
    try {
      setLoading(true)
      const result = await businessService.getBusinesses()
      
      if (result.success) {
        setBusinesses(result.data)
        toast.success('Businesses loaded successfully!')
      } else {
        toast.error(result.error || 'Failed to load businesses')
        console.error('Businesses error:', result.error)
      }
    } catch (error) {
      console.error('Error fetching businesses:', error)
      toast.error('An unexpected error occurred while loading businesses')
    } finally {
      setLoading(false)
    }
  }


  const filterBusinesses = () => {
    let filtered = businesses

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(business =>
        business?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        business?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        business?.address?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Status filter
    if (statusFilter) {
      filtered = filtered.filter(business => business?.status === statusFilter)
    }

    // Type filter
    if (typeFilter) {
      filtered = filtered.filter(business => business?.type === typeFilter)
    }

    setFilteredBusinesses(filtered)
  }

  const handleDelete = async () => {
    if (!selectedBusiness) return

    try {
      setDeleting(true)
      
      const result = await businessService.deleteBusiness(selectedBusiness.id)
      
      if (result.success) {
        setBusinesses(prev => prev.filter(b => b.id !== selectedBusiness.id))
        setShowDeleteModal(false)
        setSelectedBusiness(null)
        toast.success('Business deleted successfully!')
      } else {
        toast.error(result.error || 'Failed to delete business')
        console.error('Delete business error:', result.error)
      }
    } catch (error) {
      console.error('Error deleting business:', error)
      toast.error('An unexpected error occurred while deleting business')
    } finally {
      setDeleting(false)
    }
  }

  const handleStatusChange = async (businessId, newStatus) => {
    try {
      // Simulate API call
      
      setBusinesses(prev => prev.map(business =>
        business?.id === businessId
          ? { ...business, status: newStatus }
          : business
      ))
    } catch (error) {
      console.error('Error updating business status:', error)
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
      case 'pending': return 'warning'
      case 'inactive': return 'danger'
      default: return 'default'
    }
  }

  const getTypeColor = (type) => {
    switch (type) {
      case 'salon': return 'blue'
      case 'spa': return 'green'
      case 'hotel': return 'purple'
      default: return 'default'
    }
  }

  const statusOptions = [
    { label: 'All Statuses', value: '' },
    { label: 'Active', value: 'active' },
    { label: 'Pending', value: 'pending' },
    { label: 'Inactive', value: 'inactive' }
  ]

  const typeOptions = [
    { label: 'All Types', value: '' },
    { label: 'Salon', value: 'salon' },
    { label: 'Spa', value: 'spa' },
    { label: 'Hotel', value: 'hotel' }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Businesses</h1>
              <p className="mt-2 text-gray-600">
                Manage all businesses in your system
              </p>
            </div>
            <Link to="/admin/businesses/create">
              <Button variant="primary">
                Add New Business
              </Button>
            </Link>
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <SearchBar
                  onSearch={(term) => setSearchTerm(term)}
                  placeholder="Search businesses..."
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
                  options={typeOptions}
                  value={typeFilter}
                  onChange={setTypeFilter}
                  placeholder="Filter by type"
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
            Showing {filteredBusinesses.length} of {businesses.length} businesses
          </p>
        </div>

        {/* Business Table */}
        <Card>
          <div className="p-6">
            <Table
              data={filteredBusinesses}
              columns={[
                {
                  key: 'name',
                  label: 'Business',
                  sortable: true,
                  render: (business) => (
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        getTypeColor(business?.type) === 'blue' ? 'bg-blue-100 text-blue-600' :
                        getTypeColor(business?.type) === 'green' ? 'bg-green-100 text-green-600' :
                        getTypeColor(business?.type) === 'purple' ? 'bg-purple-100 text-purple-600' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{business?.name || 'N/A'}</p>
                        <p className="text-sm text-gray-500">{business?.type || 'N/A'}</p>
                      </div>
                    </div>
                  )
                },
                {
                  key: 'contact',
                  label: 'Contact',
                  render: (business) => (
                    <div>
                      <p className="text-sm text-gray-900">{business?.email || 'N/A'}</p>
                      <p className="text-sm text-gray-500">{business?.phone || 'N/A'}</p>
                    </div>
                  )
                },
                {
                  key: 'address',
                  label: 'Address',
                  render: (business) => (
                    <p className="text-sm text-gray-900 max-w-xs truncate">
                      {business?.address || 'N/A'}
                    </p>
                  )
                },
                {
                  key: 'status',
                  label: 'Status',
                  sortable: true,
                  render: (business) => (
                    <Badge variant={getStatusColor(business?.status)} size="sm">
                      {business?.status || 'N/A'}
                    </Badge>
                  )
                },
                {
                  key: 'staff',
                  label: 'Staff',
                  sortable: true,
                  render: (business) => (
                    <div className="text-sm">
                      <p className="text-gray-900">{business?.managers || 0} managers</p>
                      <p className="text-gray-500">{business?.staff || 0} staff</p>
                    </div>
                  )
                },
                {
                  key: 'revenue',
                  label: 'Revenue',
                  sortable: true,
                  render: (business) => (
                    <p className="font-medium text-gray-900">
                      {formatCurrency(business?.revenue || 0)}
                    </p>
                  )
                },
                {
                  key: 'createdAt',
                  label: 'Created',
                  sortable: true,
                  render: (business) => formatDate(business?.createdAt)
                },
                {
                  key: 'actions',
                  label: 'Actions',
                  render: (business) => (
                    <div className="flex gap-2">
                      <Link to={`/admin/businesses/${business?.id}`}>
                        <Button variant="outline" size="sm">View</Button>
                      </Link>
                      <Link to={`/admin/businesses/${business?.id}/edit`}>
                        <Button variant="outline" size="sm">Edit</Button>
                      </Link>
                      <Dropdown
                        options={[
                          { label: 'Activate', value: 'active' },
                          { label: 'Deactivate', value: 'inactive' },
                          { label: 'Mark Pending', value: 'pending' }
                        ]}
                        value=""
                        onChange={(value) => handleStatusChange(business?.id, value)}
                        placeholder="Actions"
                        optionLabel="label"
                        optionValue="value"
                        buttonClassName="text-sm"
                      />
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => {
                          setSelectedBusiness(business)
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
              emptyMessage="No businesses found matching your criteria."
            />
          </div>
        </Card>

        {/* Delete Confirmation Modal */}
        <Modal
          isOpen={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false)
            setSelectedBusiness(null)
          }}
          title="Delete Business"
          size="md"
        >
          <div className="space-y-4">
            <Alert
              type="error"
              title="Are you sure you want to delete this business?"
              message={`This action cannot be undone. All data associated with "${selectedBusiness?.name}" will be permanently removed.`}
            />
            
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setShowDeleteModal(false)
                  setSelectedBusiness(null)
                }}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                loading={deleting}
                onClick={handleDelete}
              >
                {deleting ? 'Deleting...' : 'Delete Business'}
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  )
}

export default BusinessList
