import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Card, Button, Badge, Tabs, Table, StatCard, StatCardGrid, Alert } from '../../../../components'
import { LineChart, BarChart } from '../../../../components'
import managerService from '../../../../services/manager/managerService'
import { toast } from 'react-hot-toast'

const StaffDetails = () => {
  const { id } = useParams()
  const [staff, setStaff] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState(0)

  useEffect(() => {
    fetchStaffDetails()
  }, [id])

  const fetchStaffDetails = async () => {
    try {
      setLoading(true)
      
      const result = await managerService.getStaffMember(id)
      
      if (result.success) {
        setStaff(result.data)
        toast.success('Staff details loaded successfully!')
      } else {
        toast.error(result.error || 'Failed to load staff details')
        console.error('Staff details error:', result.error)
      }
    } catch (error) {
      console.error('Error fetching staff details:', error)
      toast.error('An unexpected error occurred while loading staff details')
    } finally {
      setLoading(false)
    }
  }
      
        ],
        performanceData: [
          { month: 'Jan', appointments: 20, revenue: 1600 },
          { month: 'Feb', appointments: 22, revenue: 1750 },
          { month: 'Mar', appointments: 25, revenue: 2000 },
          { month: 'Apr', appointments: 23, revenue: 1850 },
          { month: 'May', appointments: 26, revenue: 2100 },
          { month: 'Jun', appointments: 25, revenue: 2100 }
        ],
        ratingData: [
          { month: 'Jan', rating: 4.7 },
          { month: 'Feb', rating: 4.8 },
          { month: 'Mar', rating: 4.8 },
          { month: 'Apr', rating: 4.9 },
          { month: 'May', rating: 4.8 },
          { month: 'Jun', rating: 4.8 }
        ],
        notes: 'Excellent stylist with great customer service skills. Specializes in color treatments and modern cuts.'
      }
      
    } catch (error) {
      console.error('Error fetching staff details:', error)
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

  const tabs = [
    { label: 'Overview', content: 'overview' },
    { label: 'Schedule', content: 'schedule' },
    { label: 'Appointments', content: 'appointments' },
    { label: 'Performance', content: 'performance' }
  ]

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Staff Information */}
      <Card>
        <div className="p-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{staff.name}</h2>
                <div className="flex items-center gap-3 mt-1">
                  <Badge variant={getRoleColor(staff.role)} size="sm">
                    {staff.role}
                  </Badge>
                  <Badge variant={getStatusColor(staff.status)} size="sm">
                    {staff.status}
                  </Badge>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Link to={`/manager/staff/${staff.id}/edit`}>
                <Button variant="outline">Edit Staff</Button>
              </Link>
              <Button variant="primary">View Schedule</Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Contact Information</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span className="text-gray-700">{staff.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span className="text-gray-700">{staff.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="text-gray-700">{staff.address}</span>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Staff Details</h3>
              <div className="space-y-2">
                <div>
                  <span className="text-sm font-medium text-gray-700">Hire Date:</span>
                  <p className="text-gray-900">{formatDate(staff.hireDate)}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700">Last Login:</span>
                  <p className="text-gray-900">{formatDate(staff.lastLogin)}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700">Hourly Rate:</span>
                  <p className="text-gray-900">{formatCurrency(staff.stats.hourlyRate)}/hour</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700">Total Hours:</span>
                  <p className="text-gray-900">{staff.stats.totalHours} hours</p>
                </div>
              </div>
            </div>
          </div>

          {/* Emergency Contact */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Emergency Contact</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <span className="text-sm font-medium text-gray-700">Name:</span>
                <p className="text-gray-900">{staff.emergencyContact.name}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-700">Phone:</span>
                <p className="text-gray-900">{staff.emergencyContact.phone}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-700">Relationship:</span>
                <p className="text-gray-900">{staff.emergencyContact.relationship}</p>
              </div>
            </div>
          </div>

          {/* Specialties */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Specialties</h3>
            <div className="flex flex-wrap gap-2">
              {staff.specialties.map((specialty, index) => (
                <Badge key={index} variant="info" size="sm">
                  {specialty}
                </Badge>
              ))}
            </div>
          </div>

          {/* Notes */}
          {staff.notes && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Notes</h3>
              <p className="text-gray-700">{staff.notes}</p>
            </div>
          )}
        </div>
      </Card>

      {/* Key Metrics */}
      <StatCardGrid
        stats={[
          {
            title: 'Total Appointments',
            value: staff.stats.totalAppointments,
            change: 12.5,
            changeType: 'positive',
            format: 'number',
            color: 'blue',
            icon: (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            )
          },
          {
            title: 'Total Revenue',
            value: staff.stats.totalRevenue,
            change: 8.3,
            changeType: 'positive',
            format: 'currency',
            color: 'green',
            icon: (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            )
          },
          {
            title: 'Average Rating',
            value: staff.stats.averageRating,
            change: 0.2,
            changeType: 'positive',
            format: 'rating',
            color: 'yellow',
            icon: (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            )
          },
          {
            title: 'Total Hours',
            value: staff.stats.totalHours,
            change: 15.2,
            changeType: 'positive',
            format: 'number',
            color: 'purple',
            icon: (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )
          }
        ]}
        columns={4}
      />
    </div>
  )

  const renderSchedule = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Weekly Schedule</h3>
        <Button variant="primary">Edit Schedule</Button>
      </div>

      <Card>
        <div className="p-6">
          <div className="space-y-4">
            {Object.entries(staff.schedule).map(([day, schedule]) => (
              <div key={day} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="w-20">
                  <label className="block text-sm font-medium text-gray-700 capitalize">
                    {day}
                  </label>
                </div>
                
                <div className="flex items-center gap-4">
                  {schedule.working ? (
                    <>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span className="text-sm text-gray-700">Working</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-900">{schedule.start}</span>
                        <span className="text-gray-500">to</span>
                        <span className="text-sm text-gray-900">{schedule.end}</span>
                      </div>
                    </>
                  ) : (
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
                      <span className="text-sm text-gray-500">Off</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  )

  const renderAppointments = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Recent Appointments</h3>
        <Button variant="outline">View All</Button>
      </div>

      <Table
        data={staff.recentAppointments}
        columns={[
          {
            key: 'customerName',
            label: 'Customer',
            sortable: true,
            render: (appointment) => appointment.customerName
          },
          {
            key: 'service',
            label: 'Service',
            sortable: true,
            render: (appointment) => appointment.service
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
                {appointment.status}
              </Badge>
            )
          }
        ]}
        onSort={(key, direction) => {
          console.log('Sort by:', key, direction)
        }}
        sortable={true}
      />
    </div>
  )

  const renderPerformance = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Appointments & Revenue</h3>
            <LineChart
              data={[
                {
                  label: 'Appointments',
                  data: staff.performanceData.map(item => item.appointments),
                  labels: staff.performanceData.map(item => item.month)
                },
                {
                  label: 'Revenue',
                  data: staff.performanceData.map(item => item.revenue),
                  labels: staff.performanceData.map(item => item.month)
                }
              ]}
              height="300px"
              showLegend={true}
            />
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Rating Trend</h3>
            <LineChart
              data={[
                {
                  label: 'Rating',
                  data: staff.ratingData.map(item => item.rating),
                  labels: staff.ratingData.map(item => item.month)
                }
              ]}
              height="300px"
              showLegend={true}
            />
          </div>
        </Card>
      </div>
    </div>
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading staff details...</p>
        </div>
      </div>
    )
  }

  if (!staff) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Alert
            type="error"
            title="Staff Member Not Found"
            message="The staff member you're looking for doesn't exist or has been removed."
          />
          <Link to="/manager/staff">
            <Button variant="primary" className="mt-4">
              Back to Staff List
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link to="/manager/staff">
              <Button variant="outline" size="sm">
                ← Back to Staff List
              </Button>
            </Link>
          </div>
        </div>

        {/* Tabs */}
        <Tabs
          tabs={tabs}
          defaultActiveTab={0}
          onTabChange={(index) => setActiveTab(index)}
        >
          {renderOverview()}
          {renderSchedule()}
          {renderAppointments()}
          {renderPerformance()}
        </Tabs>
      </div>
    </div>
  )
}

export default StaffDetails
