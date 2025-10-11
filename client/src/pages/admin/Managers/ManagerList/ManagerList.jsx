import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Card, Button, Table, SearchBar, Dropdown, Badge, Modal, Alert } from '../../../../components'
import adminService from '../../../../services/admin/adminService'
import { toast } from 'react-hot-toast'

const ManagerList = () => {
  const [managers, setManagers] = useState([])
  const [filteredManagers, setFilteredManagers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [businessFilter, setBusinessFilter] = useState('')
  const [selectedManager, setSelectedManager] = useState(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    fetchManagers()
  }, [])

  useEffect(() => {
    filterManagers()
  }, [managers, searchTerm, statusFilter, businessFilter])

  const fetchManagers = async () => {
    try {
      setLoading(true)
      const result = await adminService.getManagers()
      
      if (result.success) {
        setManagers(result.data)
        toast.success('Managers loaded successfully!')
      } else {
        toast.error(result.error || 'Failed to load managers')
        console.error('Managers error:', result.error)
      }
    } catch (error) {
      console.error('Error fetching managers:', error)
      toast.error('An unexpected error occurred while loading managers')
    } finally {
      setLoading(false)
    }
  }


  const filterManagers = () => {
    let filtered = managers

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(manager =>
        manager?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        manager?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        manager?.businessName?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Status filter
    if (statusFilter) {
      filtered = filtered.filter(manager => manager?.status === statusFilter)
    }

    // Business filter
    if (businessFilter) {
      filtered = filtered.filter(manager => manager?.businessId === businessFilter)
    }

    setFilteredManagers(filtered)
  }

  const handleDelete = async () => {
    if (!selectedManager) return

    try {
      setDeleting(true)
      // Simulate API call
      
      setManagers(prev => prev.filter(m => m.id !== selectedManager.id))
      setShowDeleteModal(false)
      setSelectedManager(null)
    } catch (error) {
      console.error('Error deleting manager:', error)
    } finally {
      setDeleting(false)
    }
  }

  const handleStatusChange = async (managerId, newStatus) => {
    try {
      // Simulate API call
      
      setManagers(prev => prev.map(manager =>
        manager?.id === managerId
          ? { ...manager, status: newStatus }
          : manager
      ))
    } catch (error) {
      console.error('Error updating manager status:', error)
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'Never'
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

  const businessOptions = [
    { label: 'All Businesses', value: '' },
    ...Array.from(new Set(managers.map(m => m.businessId))).map(businessId => {
      const business = managers.find(m => m.businessId === businessId)
      return {
        label: business.businessName,
        value: business.businessId
      }
    })
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Managers</h1>
              <p className="mt-2 text-gray-600">
                Manage all business managers in your system
              </p>
            </div>
            <Link to="/admin/managers/create">
              <Button variant="primary">
                Add New Manager
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
                  placeholder="Search managers..."
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
                  options={businessOptions}
                  value={businessFilter}
                  onChange={setBusinessFilter}
                  placeholder="Filter by business"
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
            Showing {filteredManagers.length} of {managers.length} managers
          </p>
        </div>

        {/* Manager Table */}
        <Card>
          <div className="p-6">
            <Table
              data={filteredManagers}
              columns={[
                {
                  key: 'name',
                  label: 'Manager',
                  sortable: true,
                  render: (manager) => (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                        <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{manager?.name || 'N/A'}</p>
                        <p className="text-sm text-gray-500">{manager?.role || 'N/A'}</p>
                      </div>
                    </div>
                  )
                },
                {
                  key: 'business',
                  label: 'Business',
                  sortable: true,
                  render: (manager) => (
                    <div className="flex items-center gap-2">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                        getTypeColor(manager?.businessType) === 'blue' ? 'bg-blue-100 text-blue-600' :
                        getTypeColor(manager?.businessType) === 'green' ? 'bg-green-100 text-green-600' :
                        getTypeColor(manager?.businessType) === 'purple' ? 'bg-purple-100 text-purple-600' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{manager?.businessName || 'N/A'}</p>
                        <p className="text-sm text-gray-500">{manager?.businessType || 'N/A'}</p>
                      </div>
                    </div>
                  )
                },
                {
                  key: 'contact',
                  label: 'Contact',
                  render: (manager) => (
                    <div>
                      <p className="text-sm text-gray-900">{manager?.email || 'N/A'}</p>
                      <p className="text-sm text-gray-500">{manager?.phone || 'N/A'}</p>
                    </div>
                  )
                },
                {
                  key: 'status',
                  label: 'Status',
                  sortable: true,
                  render: (manager) => (
                    <Badge variant={getStatusColor(manager?.status)} size="sm">
                      {manager?.status || 'N/A'}
                    </Badge>
                  )
                },
                {
                  key: 'stats',
                  label: 'Stats',
                  render: (manager) => (
                    <div className="text-sm">
                      <p className="text-gray-900">{manager?.totalStaff || 0} staff</p>
                      <p className="text-gray-500">{manager?.totalCustomers || 0} customers</p>
                    </div>
                  )
                },
                {
                  key: 'joinDate',
                  label: 'Join Date',
                  sortable: true,
                  render: (manager) => formatDate(manager?.joinDate)
                },
                {
                  key: 'lastLogin',
                  label: 'Last Login',
                  sortable: true,
                  render: (manager) => formatDate(manager?.lastLogin)
                },
                {
                  key: 'actions',
                  label: 'Actions',
                  render: (manager) => (
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">View</Button>
                      <Button variant="outline" size="sm">Edit</Button>
                      <Dropdown
                        options={[
                          { label: 'Activate', value: 'active' },
                          { label: 'Deactivate', value: 'inactive' },
                          { label: 'Mark Pending', value: 'pending' }
                        ]}
                        value=""
                        onChange={(value) => handleStatusChange(manager?.id, value)}
                        placeholder="Actions"
                        optionLabel="label"
                        optionValue="value"
                        buttonClassName="text-sm"
                      />
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => {
                          setSelectedManager(manager)
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
              emptyMessage="No managers found matching your criteria."
            />
          </div>
        </Card>

        {/* Delete Confirmation Modal */}
        <Modal
          isOpen={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false)
            setSelectedManager(null)
          }}
          title="Delete Manager"
          size="md"
        >
          <div className="space-y-4">
            <Alert
              type="error"
              title="Are you sure you want to delete this manager?"
              message={`This action cannot be undone. All data associated with "${selectedManager?.name}" will be permanently removed.`}
            />
            
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setShowDeleteModal(false)
                  setSelectedManager(null)
                }}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                loading={deleting}
                onClick={handleDelete}
              >
                {deleting ? 'Deleting...' : 'Delete Manager'}
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  )
}

export default ManagerList
