import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Card, Button, Badge, Tabs, Table, StatCard, StatCardGrid, Alert } from '../../../../components'
import { LineChart, BarChart } from '../../../../components'

const BusinessDetails = () => {
  const { id } = useParams()
  const [business, setBusiness] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState(0)

  useEffect(() => {
    fetchBusinessDetails()
  }, [id])

  const fetchBusinessDetails = async () => {
    try {
      setLoading(true)
      // Simulate API call
      
        ],
        staff: [
          {
            id: '1',
            name: 'Emma Wilson',
            role: 'Senior Stylist',
            status: 'active',
            hireDate: '2023-06-15'
          },
          {
            id: '2',
            name: 'David Brown',
            role: 'Stylist',
            status: 'active',
            hireDate: '2023-08-20'
          },
          {
            id: '3',
            name: 'Lisa Garcia',
            role: 'Color Specialist',
            status: 'active',
            hireDate: '2023-09-10'
          }
        ],
        stats: {
          totalStaff: 8,
          totalManagers: 2,
          totalCustomers: 245,
          monthlyRevenue: 15000,
          totalAppointments: 89,
          averageRating: 4.8
        },
        recentTransactions: [
          {
            id: '1',
            customerName: 'John Doe',
            service: 'Haircut & Styling',
            amount: 85,
            date: '2024-01-20',
            status: 'completed'
          },
          {
            id: '2',
            customerName: 'Jane Smith',
            service: 'Color Treatment',
            amount: 120,
            date: '2024-01-19',
            status: 'completed'
          }
        ],
        recentAppointments: [
          {
            id: '1',
            customerName: 'Alice Johnson',
            service: 'Haircut',
            staffName: 'Emma Wilson',
            date: '2024-01-21',
            time: '10:00 AM',
            status: 'scheduled'
          },
          {
            id: '2',
            customerName: 'Bob Wilson',
            service: 'Beard Trim',
            staffName: 'David Brown',
            date: '2024-01-21',
            time: '2:00 PM',
            status: 'scheduled'
          }
        ],
        revenueData: [
          { month: 'Jan', revenue: 12000 },
          { month: 'Feb', revenue: 13500 },
          { month: 'Mar', revenue: 14200 },
          { month: 'Apr', revenue: 14800 },
          { month: 'May', revenue: 15200 },
          { month: 'Jun', revenue: 15000 }
        ],
        appointmentData: [
          { month: 'Jan', appointments: 75 },
          { month: 'Feb', appointments: 82 },
          { month: 'Mar', appointments: 88 },
          { month: 'Apr', appointments: 91 },
          { month: 'May', appointments: 87 },
          { month: 'Jun', appointments: 89 }
        ],
        createdAt: '2024-01-15',
        lastActivity: '2024-01-20'
      }
      
    } catch (error) {
      console.error('Error fetching business details:', error)
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

  const tabs = [
    { label: 'Overview', content: 'overview' },
    { label: 'Managers', content: 'managers' },
    { label: 'Staff', content: 'staff' },
    { label: 'Transactions', content: 'transactions' },
    { label: 'Appointments', content: 'appointments' },
    { label: 'Analytics', content: 'analytics' }
  ]

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Business Information */}
      <Card>
        <div className="p-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                getTypeColor(business.type) === 'blue' ? 'bg-blue-100 text-blue-600' :
                getTypeColor(business.type) === 'green' ? 'bg-green-100 text-green-600' :
                getTypeColor(business.type) === 'purple' ? 'bg-purple-100 text-purple-600' :
                'bg-gray-100 text-gray-600'
              }`}>
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{business.name}</h2>
                <div className="flex items-center gap-3 mt-1">
                  <Badge variant={getTypeColor(business.type)} size="sm">
                    {business.type}
                  </Badge>
                  <Badge variant={getStatusColor(business.status)} size="sm">
                    {business.status}
                  </Badge>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Link to={`/admin/businesses/${business.id}/edit`}>
                <Button variant="outline">Edit Business</Button>
              </Link>
              <Button variant="primary">View Live Site</Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Contact Information</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="text-gray-700">{business.address}</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span className="text-gray-700">{business.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span className="text-gray-700">{business.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9" />
                  </svg>
                  <a href={business.website} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:text-primary-500">
                    {business.website}
                  </a>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Business Details</h3>
              <div className="space-y-2">
                <div>
                  <span className="text-sm font-medium text-gray-700">Created:</span>
                  <p className="text-gray-900">{formatDate(business.createdAt)}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700">Last Activity:</span>
                  <p className="text-gray-900">{formatDate(business.lastActivity)}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700">Description:</span>
                  <p className="text-gray-900">{business.description}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Key Metrics */}
      <StatCardGrid
        stats={[
          {
            title: 'Total Staff',
            value: business.stats.totalStaff,
            change: 12.5,
            changeType: 'positive',
            format: 'number',
            color: 'blue',
            icon: (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            )
          },
          {
            title: 'Total Customers',
            value: business.stats.totalCustomers,
            change: 8.3,
            changeType: 'positive',
            format: 'number',
            color: 'green',
            icon: (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            )
          },
          {
            title: 'Monthly Revenue',
            value: business.stats.monthlyRevenue,
            change: 15.2,
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
            value: business.stats.averageRating,
            change: 0.2,
            changeType: 'positive',
            format: 'rating',
            color: 'yellow',
            icon: (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            )
          }
        ]}
        columns={4}
      />
    </div>
  )

  const renderManagers = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Managers</h3>
        <Button variant="primary">Add Manager</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {business.managers.map((manager) => (
          <Card key={manager.id}>
            <div className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">{manager.name}</h4>
                  <p className="text-sm text-gray-500">{manager.role}</p>
                </div>
              </div>
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span className="text-sm text-gray-700">{manager.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span className="text-sm text-gray-700">{manager.phone}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">Edit</Button>
                <Button variant="outline" size="sm">View Profile</Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )

  const renderStaff = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Staff Members</h3>
        <Button variant="primary">Add Staff</Button>
      </div>

      <Table
        data={business.staff}
        columns={[
          {
            key: 'name',
            label: 'Name',
            sortable: true,
            render: (staff) => (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <span className="font-medium text-gray-900">{staff.name}</span>
              </div>
            )
          },
          {
            key: 'role',
            label: 'Role',
            sortable: true,
            render: (staff) => staff.role
          },
          {
            key: 'status',
            label: 'Status',
            sortable: true,
            render: (staff) => (
              <Badge variant={getStatusColor(staff.status)} size="sm">
                {staff.status}
              </Badge>
            )
          },
          {
            key: 'hireDate',
            label: 'Hire Date',
            sortable: true,
            render: (staff) => formatDate(staff.hireDate)
          },
          {
            key: 'actions',
            label: 'Actions',
            render: (staff) => (
              <div className="flex gap-2">
                <Button variant="outline" size="sm">Edit</Button>
                <Button variant="outline" size="sm">View Profile</Button>
              </div>
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

  const renderTransactions = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Recent Transactions</h3>
        <Button variant="outline">View All</Button>
      </div>

      <Table
        data={business.recentTransactions}
        columns={[
          {
            key: 'customerName',
            label: 'Customer',
            sortable: true,
            render: (transaction) => transaction.customerName
          },
          {
            key: 'service',
            label: 'Service',
            sortable: true,
            render: (transaction) => transaction.service
          },
          {
            key: 'amount',
            label: 'Amount',
            sortable: true,
            render: (transaction) => formatCurrency(transaction.amount)
          },
          {
            key: 'date',
            label: 'Date',
            sortable: true,
            render: (transaction) => formatDate(transaction.date)
          },
          {
            key: 'status',
            label: 'Status',
            sortable: true,
            render: (transaction) => (
              <Badge variant={getStatusColor(transaction.status)} size="sm">
                {transaction.status}
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

  const renderAppointments = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Upcoming Appointments</h3>
        <Button variant="outline">View All</Button>
      </div>

      <Table
        data={business.recentAppointments}
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
            key: 'staffName',
            label: 'Staff',
            sortable: true,
            render: (appointment) => appointment.staffName
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

  const renderAnalytics = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Trend</h3>
            <LineChart
              data={[
                {
                  label: 'Revenue',
                  data: business.revenueData.map(item => item.revenue),
                  labels: business.revenueData.map(item => item.month)
                }
              ]}
              height="300px"
              showLegend={true}
            />
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Appointments</h3>
            <BarChart
              data={business.appointmentData.map(item => ({
                label: item.month,
                value: item.appointments
              }))}
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
          <p className="text-gray-600">Loading business details...</p>
        </div>
      </div>
    )
  }

  if (!business) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Alert
            type="error"
            title="Business Not Found"
            message="The business you're looking for doesn't exist or has been removed."
          />
          <Link to="/admin/businesses">
            <Button variant="primary" className="mt-4">
              Back to Businesses
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
            <Link to="/admin/businesses">
              <Button variant="outline" size="sm">
                ← Back to Businesses
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
          {renderManagers()}
          {renderStaff()}
          {renderTransactions()}
          {renderAppointments()}
          {renderAnalytics()}
        </Tabs>
      </div>
    </div>
  )
}

export default BusinessDetails
