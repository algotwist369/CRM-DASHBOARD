import React, { useState, useEffect } from 'react'
import { Card, Button, StatCard, StatCardGrid, Tabs, Table, Badge, Alert } from '../../../components'
import { LineChart, BarChart, DonutChart } from '../../../components'
import managerService from '../../../services/manager/managerService'
import { toast } from 'react-hot-toast'

const ManagerDashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    stats: {
      totalStaff: 0,
      totalCustomers: 0,
      totalAppointments: 0,
      totalRevenue: 0,
      todayAppointments: 0,
      pendingTasks: 0
    },
    recentAppointments: [],
    recentTransactions: [],
    staffPerformance: [],
    revenueData: [],
    appointmentData: [],
    customerGrowth: []
  })
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState(0)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      
      const result = await managerService.getDashboard()
      
      if (result.success) {
        setDashboardData(result.data)
        toast.success('Dashboard data loaded successfully!')
      } else {
        toast.error(result.error || 'Failed to load dashboard data')
        console.error('Dashboard error:', result.error)
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      toast.error('An unexpected error occurred while loading dashboard data')
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
      case 'scheduled': return 'info'
      case 'completed': return 'success'
      case 'cancelled': return 'danger'
      case 'in_progress': return 'warning'
      default: return 'default'
    }
  }

  const tabs = [
    { label: 'Overview', content: 'overview' },
    { label: 'Appointments', content: 'appointments' },
    { label: 'Analytics', content: 'analytics' }
  ]

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Key Metrics */}
      <StatCardGrid
        stats={[
          {
            title: 'Total Staff',
            value: dashboardData.stats.totalStaff,
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
            value: dashboardData.stats.totalCustomers,
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
            title: 'Today\'s Appointments',
            value: dashboardData.stats.todayAppointments,
            change: 15.2,
            changeType: 'positive',
            format: 'number',
            color: 'purple',
            icon: (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            )
          },
          {
            title: 'Monthly Revenue',
            value: dashboardData.stats.totalRevenue,
            change: 18.7,
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
            title: 'Total Appointments',
            value: dashboardData.stats.totalAppointments,
            change: 22.1,
            changeType: 'positive',
            format: 'number',
            color: 'orange',
            icon: (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            )
          },
          {
            title: 'Pending Tasks',
            value: dashboardData.stats.pendingTasks,
            change: -5.2,
            changeType: 'positive',
            format: 'number',
            color: 'yellow',
            icon: (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            )
          }
        ]}
        columns={3}
      />

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Today's Appointments</h3>
              <Button variant="outline" size="sm">View All</Button>
            </div>
            <div className="space-y-4">
              {dashboardData.recentAppointments.map((appointment) => (
                <div key={appointment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{appointment.customerName}</p>
                      <p className="text-sm text-gray-500">{appointment.service}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant={getStatusColor(appointment.status)} size="sm">
                      {appointment.status}
                    </Badge>
                    <p className="text-sm text-gray-500 mt-1">{appointment.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Recent Transactions</h3>
              <Button variant="outline" size="sm">View All</Button>
            </div>
            <div className="space-y-4">
              {dashboardData.recentTransactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{transaction.customerName}</p>
                    <p className="text-sm text-gray-500">{transaction.service}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">{formatCurrency(transaction.amount)}</p>
                    <p className="text-sm text-gray-500">{formatDate(transaction.date)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* Staff Performance */}
      <Card>
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Staff Performance</h3>
            <Button variant="outline" size="sm">View Details</Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {dashboardData.staffPerformance.map((staff, index) => (
              <div key={index} className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{staff.name}</p>
                    <p className="text-sm text-gray-500">{staff.appointments} appointments</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Revenue:</span>
                    <span className="font-medium">{formatCurrency(staff.revenue)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Rating:</span>
                    <span className="font-medium">{staff.rating}/5.0</span>
                  </div>
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
        <h3 className="text-lg font-semibold text-gray-900">All Appointments</h3>
        <Button variant="primary">Add Appointment</Button>
      </div>

      <Table
        data={dashboardData.recentAppointments}
        columns={[
          {
            key: 'customerName',
            label: 'Customer',
            sortable: true,
            render: (appointment) => (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <span className="font-medium text-gray-900">{appointment.customerName}</span>
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
          },
          {
            key: 'price',
            label: 'Price',
            sortable: true,
            render: (appointment) => formatCurrency(appointment.price)
          },
          {
            key: 'actions',
            label: 'Actions',
            render: (appointment) => (
              <div className="flex gap-2">
                <Button variant="outline" size="sm">View</Button>
                <Button variant="outline" size="sm">Edit</Button>
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

  const renderAnalytics = () => (
    <div className="space-y-6">
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Trend</h3>
            <LineChart
              data={[
                {
                  label: 'Revenue',
                  data: dashboardData.revenueData.map(item => item.revenue),
                  labels: dashboardData.revenueData.map(item => item.month)
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
              data={dashboardData.appointmentData.map(item => ({
                label: item.month,
                value: item.appointments
              }))}
              height="300px"
              showLegend={true}
            />
          </div>
        </Card>
      </div>

      {/* Customer Growth */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Growth</h3>
          <LineChart
            data={[
              {
                label: 'New Customers',
                data: dashboardData.customerGrowth.map(item => item.customers),
                labels: dashboardData.customerGrowth.map(item => item.month)
              }
            ]}
            height="300px"
            showLegend={true}
          />
        </div>
      </Card>
    </div>
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Manager Dashboard</h1>
          <p className="mt-2 text-gray-600">
            Welcome back! Here's what's happening with your business today.
          </p>
        </div>

        {/* Tabs */}
        <Tabs
          tabs={tabs}
          defaultActiveTab={0}
          onTabChange={(index) => setActiveTab(index)}
        >
          {renderOverview()}
          {renderAppointments()}
          {renderAnalytics()}
        </Tabs>
      </div>
    </div>
  )
}

export default ManagerDashboard
