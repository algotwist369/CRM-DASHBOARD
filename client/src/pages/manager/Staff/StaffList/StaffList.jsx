import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Card, Button, Table, SearchBar, Dropdown, Badge, Modal, Alert } from '../../../../components'
import managerService from '../../../../services/manager/managerService'
import { toast } from 'react-hot-toast'

const StaffList = () => {
  const [staff, setStaff] = useState([])
  const [filteredStaff, setFilteredStaff] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [selectedStaff, setSelectedStaff] = useState(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    fetchStaff()
  }, [])

  useEffect(() => {
    filterStaff()
  }, [staff, searchTerm, statusFilter, roleFilter])

  const fetchStaff = async () => {
    try {
      setLoading(true)
      
      const result = await managerService.getStaff()
      
      if (result.success) {
        setStaff(result.data)
        toast.success('Staff loaded successfully!')
      } else {
        toast.error(result.error || 'Failed to load staff')
        console.error('Staff error:', result.error)
      }
    } catch (error) {
      console.error('Error fetching staff:', error)
      toast.error('An unexpected error occurred while loading staff')
    } finally {
      setLoading(false)
    }
  }

  const fetchStaffOld = async () => {
    try {
      setLoading(true)
      
      ]
      
    } catch (error) {
      console.error('Error fetching staff:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterStaff = () => {
    let filtered = staff

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(member =>
        member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.role.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Status filter
    if (statusFilter) {
      filtered = filtered.filter(member => member.status === statusFilter)
    }

    // Role filter
    if (roleFilter) {
      filtered = filtered.filter(member => member.role === roleFilter)
    }

    setFilteredStaff(filtered)
  }

  const handleDelete = async () => {
    if (!selectedStaff) return

    try {
      setDeleting(true)
      // Simulate API call
      
      setStaff(prev => prev.filter(s => s.id !== selectedStaff.id))
      setShowDeleteModal(false)
      setSelectedStaff(null)
    } catch (error) {
      console.error('Error deleting staff:', error)
    } finally {
      setDeleting(false)
    }
  }

  const handleStatusChange = async (staffId, newStatus) => {
    try {
      // Simulate API call
      
      setStaff(prev => prev.map(member =>
        member.id === staffId
          ? { ...member, status: newStatus }
          : member
      ))
    } catch (error) {
      console.error('Error updating staff status:', error)
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

  const getRoleColor = (role) => {
    switch (role.toLowerCase()) {
      case 'senior stylist': return 'blue'
      case 'stylist': return 'green'
      case 'color specialist': return 'purple'
      case 'junior stylist': return 'orange'
      case 'receptionist': return 'gray'
      default: return 'default'
    }
  }

  const statusOptions = [
    { label: 'All Statuses', value: '' },
    { label: 'Active', value: 'active' },
    { label: 'Inactive', value: 'inactive' },
    { label: 'Pending', value: 'pending' }
  ]

  const roleOptions = [
    { label: 'All Roles', value: '' },
    { label: 'Senior Stylist', value: 'Senior Stylist' },
    { label: 'Stylist', value: 'Stylist' },
    { label: 'Color Specialist', value: 'Color Specialist' },
    { label: 'Junior Stylist', value: 'Junior Stylist' },
    { label: 'Receptionist', value: 'Receptionist' }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Staff Management</h1>
              <p className="mt-2 text-gray-600">
                Manage your staff members and their performance
              </p>
            </div>
            <Link to="/manager/staff/add">
              <Button variant="primary">
                Add New Staff
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
                  placeholder="Search staff members..."
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
                  options={roleOptions}
                  value={roleFilter}
                  onChange={setRoleFilter}
                  placeholder="Filter by role"
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
            Showing {filteredStaff.length} of {staff.length} staff members
          </p>
        </div>

        {/* Staff Table */}
        <Card>
          <div className="p-6">
            <Table
              data={filteredStaff}
              columns={[
                {
                  key: 'name',
                  label: 'Staff Member',
                  sortable: true,
                  render: (member) => (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                        <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{member.name}</p>
                        <p className="text-sm text-gray-500">{member.email}</p>
                      </div>
                    </div>
                  )
                },
                {
                  key: 'role',
                  label: 'Role',
                  sortable: true,
                  render: (member) => (
                    <Badge variant={getRoleColor(member.role)} size="sm">
                      {member.role}
                    </Badge>
                  )
                },
                {
                  key: 'status',
                  label: 'Status',
                  sortable: true,
                  render: (member) => (
                    <Badge variant={getStatusColor(member.status)} size="sm">
                      {member.status}
                    </Badge>
                  )
                },
                {
                  key: 'performance',
                  label: 'Performance',
                  render: (member) => (
                    <div className="text-sm">
                      <p className="text-gray-900">{member.totalAppointments} appointments</p>
                      <p className="text-gray-500">{formatCurrency(member.totalRevenue)} revenue</p>
                    </div>
                  )
                },
                {
                  key: 'rating',
                  label: 'Rating',
                  sortable: true,
                  render: (member) => (
                    <div className="flex items-center gap-1">
                      <span className="text-sm font-medium text-gray-900">{member.averageRating}</span>
                      <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    </div>
                  )
                },
                {
                  key: 'hireDate',
                  label: 'Hire Date',
                  sortable: true,
                  render: (member) => formatDate(member.hireDate)
                },
                {
                  key: 'actions',
                  label: 'Actions',
                  render: (member) => (
                    <div className="flex gap-2">
                      <Link to={`/manager/staff/${member.id}`}>
                        <Button variant="outline" size="sm">View</Button>
                      </Link>
                      <Link to={`/manager/staff/${member.id}/edit`}>
                        <Button variant="outline" size="sm">Edit</Button>
                      </Link>
                      <Dropdown
                        options={[
                          { label: 'Activate', value: 'active' },
                          { label: 'Deactivate', value: 'inactive' },
                          { label: 'Mark Pending', value: 'pending' }
                        ]}
                        value=""
                        onChange={(value) => handleStatusChange(member.id, value)}
                        placeholder="Actions"
                        optionLabel="label"
                        optionValue="value"
                        buttonClassName="text-sm"
                      />
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => {
                          setSelectedStaff(member)
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
              emptyMessage="No staff members found matching your criteria."
            />
          </div>
        </Card>

        {/* Delete Confirmation Modal */}
        <Modal
          isOpen={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false)
            setSelectedStaff(null)
          }}
          title="Delete Staff Member"
          size="md"
        >
          <div className="space-y-4">
            <Alert
              type="error"
              title="Are you sure you want to delete this staff member?"
              message={`This action cannot be undone. All data associated with "${selectedStaff?.name}" will be permanently removed.`}
            />
            
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setShowDeleteModal(false)
                  setSelectedStaff(null)
                }}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                loading={deleting}
                onClick={handleDelete}
              >
                {deleting ? 'Deleting...' : 'Delete Staff Member'}
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  )
}

export default StaffList
