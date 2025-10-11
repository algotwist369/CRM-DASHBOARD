import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Card, Button, Badge, Tabs, Table, StatCard, StatCardGrid, Alert } from '../../../../components'
import { LineChart, BarChart } from '../../../../components'
import dailyBusinessService from '../../../../services/dailyBusiness/dailyBusinessService'
import { toast } from 'react-hot-toast'

const DailyBusinessDetails = () => {
  const { id } = useParams()
  const [dailyBusiness, setDailyBusiness] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState(0)

  useEffect(() => {
    fetchDailyBusinessDetails()
  }, [id])

  const fetchDailyBusinessDetails = async () => {
    try {
      setLoading(true)
      
      const result = await dailyBusinessService.getDailyBusinessById(id)
      
      if (result.success) {
        setDailyBusiness(result.data)
        toast.success('Daily business details loaded successfully!')
      } else {
        toast.error(result.error || 'Failed to load daily business details')
        console.error('Daily business details error:', result.error)
      }
    } catch (error) {
      console.error('Error fetching daily business details:', error)
      toast.error('An unexpected error occurred while loading daily business details')
    } finally {
      setLoading(false)
    }
  }
      
        ],
        analytics: {
          totalDays: 30,
          averageDailyRevenue: 950,
          bestDay: '2024-01-21',
          worstDay: '2024-01-18',
          totalProfit: 28500,
          averageProfit: 950
        }
      }
      
    } catch (error) {
      console.error('Error fetching daily business details:', error)
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
      day: 'numeric',
      weekday: 'short'
    })
  }

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'success'
      case 'in_progress': return 'warning'
      case 'closed': return 'danger'
      case 'pending': return 'info'
      default: return 'default'
    }
  }

  const tabs = [
    { label: 'Overview', content: 'overview' },
    { label: 'Services', content: 'services' },
    { label: 'Staff Performance', content: 'staffPerformance' },
    { label: 'Analytics', content: 'analytics' }
  ]

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Daily Business Information */}
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
                <h2 className="text-2xl font-bold text-gray-900">{formatDate(dailyBusiness.date)}</h2>
                <div className="flex items-center gap-3 mt-1">
                  <Badge variant={getStatusColor(dailyBusiness.status)} size="sm">
                    {dailyBusiness.status}
                  </Badge>
                  <span className="text-sm text-gray-500">
                    {formatDateTime(dailyBusiness.createdAt)}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline">Edit</Button>
              <Button variant="primary">Export Report</Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Business Metrics</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Revenue:</span>
                  <span className="font-medium text-gray-900">{formatCurrency(dailyBusiness.totalRevenue)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Customers:</span>
                  <span className="font-medium text-gray-900">{dailyBusiness.totalCustomers}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Appointments:</span>
                  <span className="font-medium text-gray-900">{dailyBusiness.totalAppointments}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Transactions:</span>
                  <span className="font-medium text-gray-900">{dailyBusiness.totalTransactions}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Average Transaction Value:</span>
                  <span className="font-medium text-gray-900">{formatCurrency(dailyBusiness.averageTransactionValue)}</span>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Financial Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Revenue:</span>
                  <span className="font-medium text-gray-900">{formatCurrency(dailyBusiness.totalRevenue)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Expenses:</span>
                  <span className="font-medium text-gray-900">{formatCurrency(dailyBusiness.expenses)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Staff Hours:</span>
                  <span className="font-medium text-gray-900">{dailyBusiness.staffHours} hours</span>
                </div>
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between">
                    <span className="text-lg font-semibold text-gray-900">Profit:</span>
                    <span className="text-lg font-semibold text-gray-900">{formatCurrency(dailyBusiness.profit)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          {dailyBusiness.notes && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Notes</h3>
              <p className="text-gray-700">{dailyBusiness.notes}</p>
            </div>
          )}

          {/* History */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Daily Business History</h3>
            <div className="space-y-3">
              {dailyBusiness.history.map((entry) => (
                <div key={entry.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-2 h-2 bg-primary-500 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-gray-900">{entry.action}</p>
                      <span className="text-sm text-gray-500">
                        {formatDateTime(entry.timestamp)}
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
            title: 'Total Days',
            value: dailyBusiness.analytics.totalDays,
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
            title: 'Average Daily Revenue',
            value: dailyBusiness.analytics.averageDailyRevenue,
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
            title: 'Total Profit',
            value: dailyBusiness.analytics.totalProfit,
            change: 15.2,
            changeType: 'positive',
            format: 'currency',
            color: 'yellow',
            icon: (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            )
          },
          {
            title: 'Average Profit',
            value: dailyBusiness.analytics.averageProfit,
            change: 5.7,
            changeType: 'positive',
            format: 'currency',
            color: 'purple',
            icon: (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            )
          }
        ]}
        columns={4}
      />
    </div>
  )

  const renderServices = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Services Provided</h3>
        <Button variant="outline">Add Service</Button>
      </div>

      <Table
        data={dailyBusiness.services}
        columns={[
          {
            key: 'name',
            label: 'Service',
            sortable: true,
            render: (service) => service.name
          },
          {
            key: 'count',
            label: 'Count',
            sortable: true,
            render: (service) => service.count
          },
          {
            key: 'revenue',
            label: 'Revenue',
            sortable: true,
            render: (service) => formatCurrency(service.revenue)
          },
          {
            key: 'average',
            label: 'Average Price',
            sortable: true,
            render: (service) => formatCurrency(service.revenue / service.count)
          }
        ]}
        onSort={(key, direction) => {
          console.log('Sort by:', key, direction)
        }}
        sortable={true}
      />

      {/* Services Chart */}
      <Card>
        <div className="p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Revenue by Service</h4>
          <BarChart
            data={dailyBusiness.services.map(service => ({
              label: service.name,
              value: service.revenue
            }))}
            height="300px"
            showLegend={true}
          />
        </div>
      </Card>
    </div>
  )

  const renderStaffPerformance = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Staff Performance</h3>
        <Button variant="outline">Add Staff</Button>
      </div>

      <Table
        data={dailyBusiness.staffPerformance}
        columns={[
          {
            key: 'name',
            label: 'Staff Member',
            sortable: true,
            render: (staff) => staff.name
          },
          {
            key: 'appointments',
            label: 'Appointments',
            sortable: true,
            render: (staff) => staff.appointments
          },
          {
            key: 'revenue',
            label: 'Revenue',
            sortable: true,
            render: (staff) => formatCurrency(staff.revenue)
          },
          {
            key: 'hours',
            label: 'Hours',
            sortable: true,
            render: (staff) => `${staff.hours}h`
          },
          {
            key: 'revenuePerHour',
            label: 'Revenue/Hour',
            sortable: true,
            render: (staff) => formatCurrency(staff.revenue / staff.hours)
          }
        ]}
        onSort={(key, direction) => {
          console.log('Sort by:', key, direction)
        }}
        sortable={true}
      />

      {/* Staff Performance Chart */}
      <Card>
        <div className="p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Staff Revenue Comparison</h4>
          <BarChart
            data={dailyBusiness.staffPerformance.map(staff => ({
              label: staff.name,
              value: staff.revenue
            }))}
            height="300px"
            showLegend={true}
          />
        </div>
      </Card>
    </div>
  )

  const renderAnalytics = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Daily Revenue Trends</h3>
            <LineChart
              data={[
                {
                  label: 'Revenue',
                  data: [800, 950, 1100, 1250, 980, 750, 1100],
                  labels: ['Jan 15', 'Jan 16', 'Jan 17', 'Jan 18', 'Jan 19', 'Jan 20', 'Jan 21']
                }
              ]}
              height="300px"
              showLegend={true}
            />
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Trends</h3>
            <LineChart
              data={[
                {
                  label: 'Customers',
                  data: [10, 12, 13, 0, 9, 12, 15],
                  labels: ['Jan 15', 'Jan 16', 'Jan 17', 'Jan 18', 'Jan 19', 'Jan 20', 'Jan 21']
                }
              ]}
              height="300px"
              showLegend={true}
            />
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Profit vs Expenses</h3>
            <BarChart
              data={[
                { label: 'Revenue', value: dailyBusiness.totalRevenue },
                { label: 'Expenses', value: dailyBusiness.expenses },
                { label: 'Profit', value: dailyBusiness.profit }
              ]}
              height="300px"
              showLegend={true}
            />
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Efficiency Metrics</h3>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Revenue per Customer:</span>
                <span className="font-medium">{formatCurrency(dailyBusiness.totalRevenue / dailyBusiness.totalCustomers)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Revenue per Hour:</span>
                <span className="font-medium">{formatCurrency(dailyBusiness.totalRevenue / dailyBusiness.staffHours)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Appointments per Hour:</span>
                <span className="font-medium">{(dailyBusiness.totalAppointments / dailyBusiness.staffHours).toFixed(1)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Profit Margin:</span>
                <span className="font-medium">{((dailyBusiness.profit / dailyBusiness.totalRevenue) * 100).toFixed(1)}%</span>
              </div>
            </div>
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
          <p className="text-gray-600">Loading daily business details...</p>
        </div>
      </div>
    )
  }

  if (!dailyBusiness) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Alert
            type="error"
            title="Daily Business Not Found"
            message="The daily business record you're looking for doesn't exist or has been removed."
          />
          <Link to="/manager/daily-business">
            <Button variant="primary" className="mt-4">
              Back to Daily Business
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
            <Link to="/manager/daily-business">
              <Button variant="outline" size="sm">
                ← Back to Daily Business
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
          {renderServices()}
          {renderStaffPerformance()}
          {renderAnalytics()}
        </Tabs>
      </div>
    </div>
  )
}

export default DailyBusinessDetails
