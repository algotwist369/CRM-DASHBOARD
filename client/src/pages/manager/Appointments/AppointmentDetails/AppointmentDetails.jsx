import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Card, Button, Badge, Tabs, Table, StatCard, StatCardGrid, Alert } from '../../../../components'
import { LineChart, BarChart } from '../../../../components'
import appointmentService from '../../../../services/appointment/appointmentService'
import { toast } from 'react-hot-toast'

const AppointmentDetails = () => {
  const { id } = useParams()
  const [appointment, setAppointment] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState(0)

  useEffect(() => {
    fetchAppointmentDetails()
  }, [id])

  const fetchAppointmentDetails = async () => {
    try {
      setLoading(true)
      
      const result = await appointmentService.getAppointmentById(id)
      
      if (result.success) {
        setAppointment(result.data)
        toast.success('Appointment details loaded successfully!')
      } else {
        toast.error(result.error || 'Failed to load appointment details')
        console.error('Appointment details error:', result.error)
      }
    } catch (error) {
      console.error('Error fetching appointment details:', error)
      toast.error('An unexpected error occurred while loading appointment details')
    } finally {
      setLoading(false)
    }
  }
      
        ],
        customerHistory: [
          {
            id: '1',
            service: 'Haircut & Styling',
            date: '2024-01-21',
            time: '10:00',
            staffName: 'Emma Wilson',
            status: 'scheduled',
            price: 85
          },
          {
            id: '2',
            service: 'Haircut',
            date: '2023-12-20',
            time: '11:00',
            staffName: 'Emma Wilson',
            status: 'completed',
            price: 65
          },
          {
            id: '3',
            service: 'Color Treatment',
            date: '2023-11-15',
            time: '14:00',
            staffName: 'Emma Wilson',
            status: 'completed',
            price: 120
          }
        ],
        staffSchedule: [
          {
            date: '2024-01-21',
            appointments: [
              { time: '09:00', customer: 'Alice Johnson', service: 'Haircut', status: 'completed' },
              { time: '10:00', customer: 'John Doe', service: 'Haircut & Styling', status: 'scheduled' },
              { time: '11:30', customer: 'Bob Wilson', service: 'Beard Trim', status: 'scheduled' },
              { time: '14:00', customer: 'Sarah Davis', service: 'Highlights', status: 'scheduled' }
            ]
          }
        ],
        analytics: {
          totalAppointments: 15,
          totalRevenue: 1250,
          averageRating: 4.8,
          customerLifetimeValue: 1250
        }
      }
      
    } catch (error) {
      console.error('Error fetching appointment details:', error)
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

  const formatTime = (timeString) => {
    const [hours, minutes] = timeString.split(':')
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour % 12 || 12
    return `${displayHour}:${minutes} ${ampm}`
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

  const tabs = [
    { label: 'Overview', content: 'overview' },
    { label: 'Customer History', content: 'customerHistory' },
    { label: 'Staff Schedule', content: 'staffSchedule' },
    { label: 'Analytics', content: 'analytics' }
  ]

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Appointment Information */}
      <Card>
        <div className="p-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{appointment.service}</h2>
                <div className="flex items-center gap-3 mt-1">
                  <Badge variant={getStatusColor(appointment.status)} size="sm">
                    {appointment.status}
                  </Badge>
                  <span className="text-sm text-gray-500">
                    {formatDate(appointment.date)} at {formatTime(appointment.time)}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline">Edit Appointment</Button>
              <Button variant="primary">Reschedule</Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Customer Information</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span className="text-gray-700">{appointment.customerName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span className="text-gray-700">{appointment.customerEmail}</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span className="text-gray-700">{appointment.customerPhone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="text-gray-700">{appointment.customerAddress}</span>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Staff Information</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span className="text-gray-700">{appointment.staffName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span className="text-gray-700">{appointment.staffEmail}</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span className="text-gray-700">{appointment.staffPhone}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Appointment Details */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Appointment Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <span className="text-sm font-medium text-gray-700">Service:</span>
                <p className="text-gray-900">{appointment.service}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-700">Duration:</span>
                <p className="text-gray-900">{appointment.duration} minutes</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-700">Price:</span>
                <p className="text-gray-900">{formatCurrency(appointment.price)}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-700">Status:</span>
                <Badge variant={getStatusColor(appointment.status)} size="sm">
                  {appointment.status}
                </Badge>
              </div>
            </div>
          </div>

          {/* Notes */}
          {appointment.notes && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Notes</h3>
              <p className="text-gray-700">{appointment.notes}</p>
            </div>
          )}

          {/* History */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Appointment History</h3>
            <div className="space-y-3">
              {appointment.history.map((entry) => (
                <div key={entry.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-2 h-2 bg-primary-500 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-gray-900">{entry.action}</p>
                      <span className="text-sm text-gray-500">
                        {new Date(entry.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{entry.details}</p>
                    <p className="text-xs text-gray-500">by {entry.user}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Key Metrics */}
      <StatCardGrid
        stats={[
          {
            title: 'Total Appointments',
            value: appointment.analytics.totalAppointments,
            change: 12.5,
            changeType: 'positive',
            format: 'number',
            color: 'blue',
            icon: (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            )
          },
          {
            title: 'Total Revenue',
            value: appointment.analytics.totalRevenue,
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
            value: appointment.analytics.averageRating,
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
            title: 'Customer LTV',
            value: appointment.analytics.customerLifetimeValue,
            change: 15.2,
            changeType: 'positive',
            format: 'currency',
            color: 'purple',
            icon: (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            )
          }
        ]}
        columns={4}
      />
    </div>
  )

  const renderCustomerHistory = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Customer Appointment History</h3>
        <Button variant="outline">View All</Button>
      </div>

      <Table
        data={appointment.customerHistory}
        columns={[
          {
            key: 'service',
            label: 'Service',
            sortable: true,
            render: (history) => history.service
          },
          {
            key: 'date',
            label: 'Date',
            sortable: true,
            render: (history) => formatDate(history.date)
          },
          {
            key: 'time',
            label: 'Time',
            sortable: true,
            render: (history) => formatTime(history.time)
          },
          {
            key: 'staffName',
            label: 'Staff',
            sortable: true,
            render: (history) => history.staffName
          },
          {
            key: 'price',
            label: 'Price',
            sortable: true,
            render: (history) => formatCurrency(history.price)
          },
          {
            key: 'status',
            label: 'Status',
            sortable: true,
            render: (history) => (
              <Badge variant={getStatusColor(history.status)} size="sm">
                {history.status}
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

  const renderStaffSchedule = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Staff Schedule for {formatDate(appointment.date)}</h3>
        <Button variant="outline">View Full Schedule</Button>
      </div>

      <Table
        data={appointment.staffSchedule[0].appointments}
        columns={[
          {
            key: 'time',
            label: 'Time',
            sortable: true,
            render: (schedule) => formatTime(schedule.time)
          },
          {
            key: 'customer',
            label: 'Customer',
            sortable: true,
            render: (schedule) => schedule.customer
          },
          {
            key: 'service',
            label: 'Service',
            sortable: true,
            render: (schedule) => schedule.service
          },
          {
            key: 'status',
            label: 'Status',
            sortable: true,
            render: (schedule) => (
              <Badge variant={getStatusColor(schedule.status)} size="sm">
                {schedule.status}
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

  const renderAnalytics = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Appointment Trends</h3>
            <LineChart
              data={[
                {
                  label: 'Appointments',
                  data: [5, 8, 12, 15, 18, 22, 25],
                  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul']
                }
              ]}
              height="300px"
              showLegend={true}
            />
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue by Service</h3>
            <BarChart
              data={[
                { label: 'Haircut', value: 650 },
                { label: 'Coloring', value: 1200 },
                { label: 'Styling', value: 800 },
                { label: 'Highlights', value: 950 }
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
          <p className="text-gray-600">Loading appointment details...</p>
        </div>
      </div>
    )
  }

  if (!appointment) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Alert
            type="error"
            title="Appointment Not Found"
            message="The appointment you're looking for doesn't exist or has been removed."
          />
          <Link to="/manager/appointments">
            <Button variant="primary" className="mt-4">
              Back to Appointments
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
            <Link to="/manager/appointments">
              <Button variant="outline" size="sm">
                ← Back to Appointments
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
          {renderCustomerHistory()}
          {renderStaffSchedule()}
          {renderAnalytics()}
        </Tabs>
      </div>
    </div>
  )
}

export default AppointmentDetails
