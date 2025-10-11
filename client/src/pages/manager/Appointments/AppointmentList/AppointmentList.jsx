import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Card, Button, Table, SearchBar, Dropdown, Badge, Modal, Alert } from '../../../../components'
import appointmentService from '../../../../services/appointment/appointmentService'
import { toast } from 'react-hot-toast'

const AppointmentList = () => {
  const [appointments, setAppointments] = useState([])
  const [filteredAppointments, setFilteredAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [staffFilter, setStaffFilter] = useState('')
  const [selectedAppointment, setSelectedAppointment] = useState(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    fetchAppointments()
  }, [])

  useEffect(() => {
    filterAppointments()
  }, [appointments, searchTerm, statusFilter, staffFilter])

  const fetchAppointments = async () => {
    try {
      setLoading(true)
      
      const result = await appointmentService.getAppointments()
      
      if (result.success) {
        setAppointments(result.data)
        toast.success('Appointments loaded successfully!')
      } else {
        toast.error(result.error || 'Failed to load appointments')
        console.error('Appointments error:', result.error)
      }
    } catch (error) {
      console.error('Error fetching appointments:', error)
      toast.error('An unexpected error occurred while loading appointments')
    } finally {
      setLoading(false)
    }
  }
      
      ]
      
    } catch (error) {
      console.error('Error fetching appointments:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterAppointments = () => {
    let filtered = appointments

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(appointment =>
        appointment.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        appointment.customerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        appointment.service.toLowerCase().includes(searchTerm.toLowerCase()) ||
        appointment.staffName.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Status filter
    if (statusFilter) {
      filtered = filtered.filter(appointment => appointment.status === statusFilter)
    }

    // Staff filter
    if (staffFilter) {
      filtered = filtered.filter(appointment => appointment.staffName === staffFilter)
    }

    setFilteredAppointments(filtered)
  }

  const handleDelete = async () => {
    if (!selectedAppointment) return

    try {
      setDeleting(true)
      // Simulate API call
      
      setAppointments(prev => prev.filter(a => a.id !== selectedAppointment.id))
      setShowDeleteModal(false)
      setSelectedAppointment(null)
    } catch (error) {
      console.error('Error deleting appointment:', error)
    } finally {
      setDeleting(false)
    }
  }

  const handleStatusChange = async (appointmentId, newStatus) => {
    try {
      // Simulate API call
      
      setAppointments(prev => prev.map(appointment =>
        appointment.id === appointmentId
          ? { ...appointment, status: newStatus }
          : appointment
      ))
    } catch (error) {
      console.error('Error updating appointment status:', error)
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
      case 'scheduled': return 'info'
      case 'completed': return 'success'
      case 'cancelled': return 'danger'
      case 'in_progress': return 'warning'
      case 'no_show': return 'danger'
      default: return 'default'
    }
  }

  const statusOptions = [
    { label: 'All Statuses', value: '' },
    { label: 'Scheduled', value: 'scheduled' },
    { label: 'Completed', value: 'completed' },
    { label: 'Cancelled', value: 'cancelled' },
    { label: 'In Progress', value: 'in_progress' },
    { label: 'No Show', value: 'no_show' }
  ]

  const staffOptions = [
    { label: 'All Staff', value: '' },
    { label: 'Emma Wilson', value: 'Emma Wilson' },
    { label: 'David Brown', value: 'David Brown' },
    { label: 'Lisa Garcia', value: 'Lisa Garcia' }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Appointment Management</h1>
              <p className="mt-2 text-gray-600">
                Manage all appointments and bookings
              </p>
            </div>
            <div className="flex gap-2">
              <Link to="/manager/appointments/calendar">
                <Button variant="outline">Calendar View</Button>
              </Link>
              <Button variant="primary">Book Appointment</Button>
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
                  placeholder="Search appointments..."
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
                  options={staffOptions}
                  value={staffFilter}
                  onChange={setStaffFilter}
                  placeholder="Filter by staff"
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
            Showing {filteredAppointments.length} of {appointments.length} appointments
          </p>
        </div>

        {/* Appointments Table */}
        <Card>
          <div className="p-6">
            <Table
              data={filteredAppointments}
              columns={[
                {
                  key: 'customerName',
                  label: 'Customer',
                  sortable: true,
                  render: (appointment) => (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                        <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{appointment.customerName}</p>
                        <p className="text-sm text-gray-500">{appointment.customerEmail}</p>
                      </div>
                    </div>
                  )
                },
                {
                  key: 'service',
                  label: 'Service',
                  sortable: true,
                  render: (appointment) => appointment.service
                },
                {
                  key: 'staffName',
                  label: 'Staff',
                  sortable: true,
                  render: (appointment) => (
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center">
                        <svg className="w-3 h-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <span className="text-sm text-gray-900">{appointment.staffName}</span>
                    </div>
                  )
                },
                {
                  key: 'date',
                  label: 'Date',
                  sortable: true,
                  render: (appointment) => formatDate(appointment.date)
                },
                {
                  key: 'time',
                  label: 'Time',
                  sortable: true,
                  render: (appointment) => appointment.time
                },
                {
                  key: 'duration',
                  label: 'Duration',
                  sortable: true,
                  render: (appointment) => `${appointment.duration} min`
                },
                {
                  key: 'price',
                  label: 'Price',
                  sortable: true,
                  render: (appointment) => formatCurrency(appointment.price)
                },
                {
                  key: 'status',
                  label: 'Status',
                  sortable: true,
                  render: (appointment) => (
                    <Badge variant={getStatusColor(appointment.status)} size="sm">
                      {appointment.status.replace('_', ' ')}
                    </Badge>
                  )
                },
                {
                  key: 'actions',
                  label: 'Actions',
                  render: (appointment) => (
                    <div className="flex gap-2">
                      <Link to={`/manager/appointments/${appointment.id}`}>
                        <Button variant="outline" size="sm">View</Button>
                      </Link>
                      <Button variant="outline" size="sm">Edit</Button>
                      <Dropdown
                        options={[
                          { label: 'Mark Completed', value: 'completed' },
                          { label: 'Mark In Progress', value: 'in_progress' },
                          { label: 'Cancel', value: 'cancelled' },
                          { label: 'No Show', value: 'no_show' }
                        ]}
                        value=""
                        onChange={(value) => handleStatusChange(appointment.id, value)}
                        placeholder="Actions"
                        optionLabel="label"
                        optionValue="value"
                        buttonClassName="text-sm"
                      />
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => {
                          setSelectedAppointment(appointment)
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
              emptyMessage="No appointments found matching your criteria."
            />
          </div>
        </Card>

        {/* Delete Confirmation Modal */}
        <Modal
          isOpen={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false)
            setSelectedAppointment(null)
          }}
          title="Delete Appointment"
          size="md"
        >
          <div className="space-y-4">
            <Alert
              type="error"
              title="Are you sure you want to delete this appointment?"
              message={`This action cannot be undone. The appointment for "${selectedAppointment?.customerName}" will be permanently removed.`}
            />
            
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setShowDeleteModal(false)
                  setSelectedAppointment(null)
                }}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                loading={deleting}
                onClick={handleDelete}
              >
                {deleting ? 'Deleting...' : 'Delete Appointment'}
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  )
}

export default AppointmentList
