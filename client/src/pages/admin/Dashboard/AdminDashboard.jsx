import React, { useState, useEffect } from 'react'
import { Card, Button, StatCard, StatCardGrid, Tabs, Table, Badge, Alert } from '../../../components'
import { LineChart, BarChart, DonutChart } from '../../../components'
import adminService from '../../../services/admin/adminService'
import { toast } from 'react-hot-toast'

const AdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    stats: {
      totalBusinesses: 0,
      totalManagers: 0,
      totalStaff: 0,
      totalRevenue: 0,
      activeBusinesses: 0,
      pendingApprovals: 0
    },
    recentBusinesses: [],
    recentTransactions: [],
    businessGrowth: [],
    revenueData: [],
    businessTypes: [],
    monthlyStats: []
  })
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState(0)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      
      const result = await adminService.getDashboard()
      
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
    { label: 'Businesses', content: 'businesses' },
    { label: 'Analytics', content: 'analytics' }
  ]

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Key Metrics */}
      <StatCardGrid
        stats={[
          {
            title: 'Total Businesses',
            value: dashboardData.stats.totalBusinesses,
            change: 12.5,
            changeType: 'positive',
            format: 'number',
            color: 'blue',
            icon: (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            )
          },
          {
            title: 'Active Businesses',
            value: dashboardData.stats.activeBusinesses,
            change: 8.3,
            changeType: 'positive',
            format: 'number',
            color: 'green',
            icon: (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )
          },
          {
            title: 'Total Managers',
            value: dashboardData.stats.totalManagers,
            change: 15.2,
            changeType: 'positive',
            format: 'number',
            color: 'purple',
            icon: (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            )
          },
          {
            title: 'Total Staff',
            value: dashboardData.stats.totalStaff,
            change: 22.1,
            changeType: 'positive',
            format: 'number',
            color: 'orange',
            icon: (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            )
          },
          {
            title: 'Total Revenue',
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
            title: 'Pending Approvals',
            value: dashboardData.stats.pendingApprovals,
            change: -5.2,
            changeType: 'positive',
            format: 'number',
            color: 'yellow',
            icon: (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
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
              <h3 className="text-lg font-semibold text-gray-900">Recent Businesses</h3>
              <Button variant="outline" size="sm">View All</Button>
            </div>
            <div className="space-y-4">
              {dashboardData.recentBusinesses.map((business) => (
                <div key={business.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      getTypeColor(business.type) === 'blue' ? 'bg-blue-100 text-blue-600' :
                      getTypeColor(business.type) === 'green' ? 'bg-green-100 text-green-600' :
                      getTypeColor(business.type) === 'purple' ? 'bg-purple-100 text-purple-600' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{business.name}</p>
                      <p className="text-sm text-gray-500">{business.type} • {business.managers} managers</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant={getStatusColor(business.status)} size="sm">
                      {business.status}
                    </Badge>
                    <p className="text-sm text-gray-500 mt-1">{formatDate(business.createdAt)}</p>
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
                    <p className="text-sm text-gray-500">{transaction.businessName}</p>
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
    </div>
  )

  const renderBusinesses = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">All Businesses</h3>
        <Button variant="primary">Add New Business</Button>
      </div>

      <Table
        data={dashboardData.recentBusinesses}
        columns={[
          {
            key: 'name',
            label: 'Business Name',
            sortable: true,
            render: (business) => (
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  getTypeColor(business.type) === 'blue' ? 'bg-blue-100 text-blue-600' :
                  getTypeColor(business.type) === 'green' ? 'bg-green-100 text-green-600' :
                  getTypeColor(business.type) === 'purple' ? 'bg-purple-100 text-purple-600' :
                  'bg-gray-100 text-gray-600'
                }`}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-gray-900">{business.name}</p>
                  <p className="text-sm text-gray-500">{business.type}</p>
                </div>
              </div>
            )
          },
          {
            key: 'status',
            label: 'Status',
            sortable: true,
            render: (business) => (
              <Badge variant={getStatusColor(business.status)} size="sm">
                {business.status}
              </Badge>
            )
          },
          {
            key: 'managers',
            label: 'Managers',
            sortable: true,
            render: (business) => business.managers
          },
          {
            key: 'staff',
            label: 'Staff',
            sortable: true,
            render: (business) => business.staff
          },
          {
            key: 'revenue',
            label: 'Revenue',
            sortable: true,
            render: (business) => formatCurrency(business.revenue)
          },
          {
            key: 'createdAt',
            label: 'Created',
            sortable: true,
            render: (business) => formatDate(business.createdAt)
          },
          {
            key: 'actions',
            label: 'Actions',
            render: (business) => (
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
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Business Growth</h3>
            <LineChart
              data={[
                {
                  label: 'New Businesses',
                  data: dashboardData.businessGrowth.map(item => item.count),
                  labels: dashboardData.businessGrowth.map(item => item.month)
                }
              ]}
              height="300px"
              showLegend={true}
            />
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Trend</h3>
            <BarChart
              data={dashboardData.revenueData.map(item => ({
                label: item.month,
                value: item.revenue
              }))}
              height="300px"
              showLegend={true}
            />
          </div>
        </Card>
      </div>

      {/* Business Types Distribution */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Business Types Distribution</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <DonutChart
                data={dashboardData.businessTypes}
                centerText="Types"
                centerValue={dashboardData.businessTypes.length.toString()}
                showLegend={true}
                width="250px"
                height="250px"
              />
            </div>
            <div className="space-y-4">
              {dashboardData.businessTypes.map((type, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-full ${
                      index === 0 ? 'bg-blue-500' :
                      index === 1 ? 'bg-green-500' :
                      'bg-purple-500'
                    }`} />
                    <span className="font-medium text-gray-900">{type.name}</span>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">{type.count} businesses</p>
                    <p className="text-sm text-gray-500">{type.percentage}%</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
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
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="mt-2 text-gray-600">
            Welcome back! Here's what's happening with your businesses today.
          </p>
        </div>

        {/* Tabs */}
        <Tabs
          tabs={tabs}
          defaultActiveTab={0}
          onTabChange={(index) => setActiveTab(index)}
        >
          {renderOverview()}
          {renderBusinesses()}
          {renderAnalytics()}
        </Tabs>
      </div>
    </div>
  )
}

export default AdminDashboard
