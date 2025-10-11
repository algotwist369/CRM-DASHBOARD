import React, { useState, useEffect } from 'react'
import { Card, Button, Tabs, Table, SearchBar, Dropdown, Badge, Alert } from '../../../../components'
import { LineChart, BarChart, DonutChart } from '../../../../components'
import customerService from '../../../../services/customer/customerService'
import { toast } from 'react-hot-toast'

const CustomerAnalytics = () => {
  const [analyticsData, setAnalyticsData] = useState({
    stats: {
      totalCustomers: 0,
      newCustomers: 0,
      activeCustomers: 0,
      averageSpending: 0,
      customerRetention: 0,
      averageRating: 0
    },
    customerGrowth: [],
    spendingTrends: [],
    segmentDistribution: [],
    topCustomers: [],
    customerLifetimeValue: [],
    retentionData: []
  })
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState(0)

  useEffect(() => {
    fetchAnalyticsData()
  }, [])

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true)
      
      const result = await customerService.getCustomerAnalytics()
      
      if (result.success) {
        setAnalyticsData(result.data)
        toast.success('Customer analytics loaded successfully!')
      } else {
        toast.error(result.error || 'Failed to load customer analytics')
        console.error('Customer analytics error:', result.error)
      }
    } catch (error) {
      console.error('Error fetching customer analytics:', error)
      toast.error('An unexpected error occurred while loading customer analytics')
    } finally {
      setLoading(false)
    }
  }
      
        ],
        customerLifetimeValue: [
          { segment: 'VIP', avgValue: 1850, count: 45 },
          { segment: 'Regular', avgValue: 650, count: 120 },
          { segment: 'New', avgValue: 320, count: 65 },
          { segment: 'At Risk', avgValue: 180, count: 15 }
        ],
        retentionData: [
          { month: 'Jan', retention: 85 },
          { month: 'Feb', retention: 87 },
          { month: 'Mar', retention: 84 },
          { month: 'Apr', retention: 86 },
          { month: 'May', retention: 88 },
          { month: 'Jun', retention: 85 }
        ]
      })
    } catch (error) {
      console.error('Error fetching analytics data:', error)
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

  const getSegmentColor = (segment) => {
    switch (segment) {
      case 'vip': return 'purple'
      case 'regular': return 'blue'
      case 'new': return 'green'
      case 'at_risk': return 'orange'
      default: return 'default'
    }
  }

  const tabs = [
    { label: 'Overview', content: 'overview' },
    { label: 'Segments', content: 'segments' },
    { label: 'Top Customers', content: 'topCustomers' },
    { label: 'Trends', content: 'trends' }
  ]

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Key Metrics */}
      <StatCardGrid
        stats={[
          {
            title: 'Total Customers',
            value: analyticsData.stats.totalCustomers,
            change: 12.5,
            changeType: 'positive',
            format: 'number',
            color: 'blue',
            icon: (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            )
          },
          {
            title: 'New Customers',
            value: analyticsData.stats.newCustomers,
            change: 8.3,
            changeType: 'positive',
            format: 'number',
            color: 'green',
            icon: (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            )
          },
          {
            title: 'Active Customers',
            value: analyticsData.stats.activeCustomers,
            change: 15.2,
            changeType: 'positive',
            format: 'number',
            color: 'purple',
            icon: (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )
          },
          {
            title: 'Average Spending',
            value: analyticsData.stats.averageSpending,
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
            title: 'Customer Retention',
            value: analyticsData.stats.customerRetention,
            change: 2.1,
            changeType: 'positive',
            format: 'percentage',
            color: 'blue',
            icon: (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            )
          },
          {
            title: 'Average Rating',
            value: analyticsData.stats.averageRating,
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
        columns={3}
      />

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Growth</h3>
            <LineChart
              data={[
                {
                  label: 'New Customers',
                  data: analyticsData.customerGrowth.map(item => item.customers),
                  labels: analyticsData.customerGrowth.map(item => item.month)
                }
              ]}
              height="300px"
              showLegend={true}
            />
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Segments</h3>
            <DonutChart
              data={analyticsData.segmentDistribution}
              centerText="Customers"
              centerValue={analyticsData.stats.totalCustomers.toString()}
              showLegend={true}
              width="300px"
              height="300px"
            />
          </div>
        </Card>
      </div>
    </div>
  )

  const renderSegments = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Segment Distribution</h3>
            <DonutChart
              data={analyticsData.segmentDistribution}
              centerText="Segments"
              centerValue={analyticsData.segmentDistribution.length.toString()}
              showLegend={true}
              width="300px"
              height="300px"
            />
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Lifetime Value</h3>
            <BarChart
              data={analyticsData.customerLifetimeValue.map(item => ({
                label: item.segment,
                value: item.avgValue
              }))}
              height="300px"
              showLegend={true}
            />
          </div>
        </Card>
      </div>

      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Segment Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {analyticsData.segmentDistribution.map((segment, index) => (
              <div key={index} className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900">{segment.name}</h4>
                  <Badge variant={getSegmentColor(segment.name.toLowerCase())} size="sm">
                    {segment.percentage}%
                  </Badge>
                </div>
                <p className="text-2xl font-bold text-gray-900">{segment.count}</p>
                <p className="text-sm text-gray-500">customers</p>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  )

  const renderTopCustomers = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Top Customers by Spending</h3>
        <Button variant="outline">Export Data</Button>
      </div>

      <Table
        data={analyticsData.topCustomers}
        columns={[
          {
            key: 'name',
            label: 'Customer',
            sortable: true,
            render: (customer) => (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <span className="font-medium text-gray-900">{customer.name}</span>
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
            key: 'totalSpent',
            label: 'Total Spent',
            sortable: true,
            render: (customer) => formatCurrency(customer.totalSpent)
          },
          {
            key: 'totalVisits',
            label: 'Total Visits',
            sortable: true,
            render: (customer) => customer.totalVisits
          },
          {
            key: 'lastVisit',
            label: 'Last Visit',
            sortable: true,
            render: (customer) => formatDate(customer.lastVisit)
          },
          {
            key: 'actions',
            label: 'Actions',
            render: (customer) => (
              <div className="flex gap-2">
                <Button variant="outline" size="sm">View</Button>
                <Button variant="outline" size="sm">Contact</Button>
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

  const renderTrends = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Spending Trends</h3>
            <LineChart
              data={[
                {
                  label: 'Total Spending',
                  data: analyticsData.spendingTrends.map(item => item.amount),
                  labels: analyticsData.spendingTrends.map(item => item.month)
                }
              ]}
              height="300px"
              showLegend={true}
            />
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Retention</h3>
            <LineChart
              data={[
                {
                  label: 'Retention Rate',
                  data: analyticsData.retentionData.map(item => item.retention),
                  labels: analyticsData.retentionData.map(item => item.month)
                }
              ]}
              height="300px"
              showLegend={true}
            />
          </div>
        </Card>
      </div>

      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Growth vs Spending</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Customer Growth</h4>
              <LineChart
                data={[
                  {
                    label: 'New Customers',
                    data: analyticsData.customerGrowth.map(item => item.customers),
                    labels: analyticsData.customerGrowth.map(item => item.month)
                  }
                ]}
                height="200px"
                showLegend={true}
              />
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Total Spending</h4>
              <LineChart
                data={[
                  {
                    label: 'Spending',
                    data: analyticsData.spendingTrends.map(item => item.amount),
                    labels: analyticsData.spendingTrends.map(item => item.month)
                  }
                ]}
                height="200px"
                showLegend={true}
              />
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
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Customer Analytics</h1>
          <p className="mt-2 text-gray-600">
            Analyze customer behavior, segments, and trends
          </p>
        </div>

        {/* Tabs */}
        <Tabs
          tabs={tabs}
          defaultActiveTab={0}
          onTabChange={(index) => setActiveTab(index)}
        >
          {renderOverview()}
          {renderSegments()}
          {renderTopCustomers()}
          {renderTrends()}
        </Tabs>
      </div>
    </div>
  )
}

export default CustomerAnalytics
