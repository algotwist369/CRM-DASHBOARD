import React, { useState, useEffect } from 'react'
import { Card, Button, Badge, Table, StatCard, StatCardGrid, SearchBar, Dropdown, DatePicker, Alert } from '../../../components'
import { LineChart, BarChart } from '../../../components'
import staffService from '../../../services/staff/staffService'
import { toast } from 'react-hot-toast'

const StaffBusiness = () => {
  const [loading, setLoading] = useState(true)
  const [businessData, setBusinessData] = useState(null)
  const [selectedPeriod, setSelectedPeriod] = useState('week')
  const [dateRange, setDateRange] = useState({ start: null, end: null })

  useEffect(() => {
    fetchBusinessData()
  }, [selectedPeriod, dateRange])

  const fetchBusinessData = async () => {
    try {
      setLoading(true)
      
      const result = await staffService.getBusiness()
      
      if (result.success) {
        setBusinessData(result.data)
        toast.success('Business data loaded successfully!')
      } else {
        toast.error(result.error || 'Failed to load business data')
        console.error('Business data error:', result.error)
      }
    } catch (error) {
      console.error('Error fetching business data:', error)
      toast.error('An unexpected error occurred while loading business data')
    } finally {
      setLoading(false)
    }
  }
      
        ],
        topCustomers: [
          { name: 'Sarah Davis', visits: 12, totalSpent: 1800, lastVisit: '2024-01-20' },
          { name: 'John Doe', visits: 10, totalSpent: 1200, lastVisit: '2024-01-21' },
          { name: 'Alice Johnson', visits: 8, totalSpent: 960, lastVisit: '2024-01-21' },
          { name: 'Mike Brown', visits: 7, totalSpent: 455, lastVisit: '2024-01-20' },
          { name: 'Lisa Garcia', visits: 6, totalSpent: 720, lastVisit: '2024-01-19' }
        ],
        goals: {
          monthlyRevenue: 20000,
          monthlyAppointments: 200,
          customerSatisfaction: 4.8,
          repeatCustomerRate: 80
        }
      }
      
    } catch (error) {
      console.error('Error fetching business data:', error)
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
      case 'completed': return 'success'
      case 'pending': return 'warning'
      case 'cancelled': return 'danger'
      default: return 'default'
    }
  }

  const calculateGoalProgress = (current, goal) => {
    return Math.min((current / goal) * 100, 100)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading business data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Business Performance</h1>
              <p className="text-gray-600 mt-1">Track your performance metrics and business insights</p>
            </div>
            <div className="flex items-center gap-3">
              <Dropdown
                value={selectedPeriod}
                onChange={setSelectedPeriod}
                options={[
                  { value: 'week', label: 'This Week' },
                  { value: 'month', label: 'This Month' },
                  { value: 'quarter', label: 'This Quarter' },
                  { value: 'year', label: 'This Year' }
                ]}
              />
              <DatePicker
                value={dateRange}
                onChange={setDateRange}
                placeholder="Custom range"
                range={true}
              />
            </div>
          </div>
        </div>

        {/* Summary Stats */}
        <StatCardGrid
          stats={[
            {
              title: 'Total Revenue',
              value: businessData.summary.totalRevenue,
              change: 12.5,
              changeType: 'positive',
              format: 'currency',
              color: 'blue',
              icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              )
            },
            {
              title: 'Total Appointments',
              value: businessData.summary.totalAppointments,
              change: 8.3,
              changeType: 'positive',
              format: 'number',
              color: 'green',
              icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              )
            },
            {
              title: 'Total Tips',
              value: businessData.summary.totalTips,
              change: 15.2,
              changeType: 'positive',
              format: 'currency',
              color: 'yellow',
              icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              )
            },
            {
              title: 'Average Rating',
              value: businessData.summary.averageRating,
              change: 0.2,
              changeType: 'positive',
              format: 'rating',
              color: 'purple',
              icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              )
            }
          ]}
          columns={4}
        />

        {/* Goals Progress */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Goals Progress</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <div className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium text-gray-700">Revenue Goal</h4>
                  <span className="text-sm text-gray-500">
                    {formatCurrency(businessData.summary.totalRevenue)} / {formatCurrency(businessData.goals.monthlyRevenue)}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${calculateGoalProgress(businessData.summary.totalRevenue, businessData.goals.monthlyRevenue)}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {calculateGoalProgress(businessData.summary.totalRevenue, businessData.goals.monthlyRevenue).toFixed(1)}% complete
                </p>
              </div>
            </Card>
            <Card>
              <div className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium text-gray-700">Appointments Goal</h4>
                  <span className="text-sm text-gray-500">
                    {businessData.summary.totalAppointments} / {businessData.goals.monthlyAppointments}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full"
                    style={{ width: `${calculateGoalProgress(businessData.summary.totalAppointments, businessData.goals.monthlyAppointments)}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {calculateGoalProgress(businessData.summary.totalAppointments, businessData.goals.monthlyAppointments).toFixed(1)}% complete
                </p>
              </div>
            </Card>
            <Card>
              <div className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium text-gray-700">Satisfaction Goal</h4>
                  <span className="text-sm text-gray-500">
                    {businessData.summary.averageRating} / {businessData.goals.customerSatisfaction}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-yellow-600 h-2 rounded-full"
                    style={{ width: `${calculateGoalProgress(businessData.summary.averageRating, businessData.goals.customerSatisfaction)}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {calculateGoalProgress(businessData.summary.averageRating, businessData.goals.customerSatisfaction).toFixed(1)}% complete
                </p>
              </div>
            </Card>
            <Card>
              <div className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium text-gray-700">Repeat Customer Goal</h4>
                  <span className="text-sm text-gray-500">
                    {businessData.summary.repeatCustomers}% / {businessData.goals.repeatCustomerRate}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-purple-600 h-2 rounded-full"
                    style={{ width: `${calculateGoalProgress(businessData.summary.repeatCustomers, businessData.goals.repeatCustomerRate)}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {calculateGoalProgress(businessData.summary.repeatCustomers, businessData.goals.repeatCustomerRate).toFixed(1)}% complete
                </p>
              </div>
            </Card>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
          {/* Daily Performance Chart */}
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Daily Performance</h3>
              <LineChart
                data={[
                  {
                    label: 'Revenue',
                    data: businessData.dailyPerformance.map(day => day.revenue),
                    labels: businessData.dailyPerformance.map(day => new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' }))
                  }
                ]}
                height="300px"
                showLegend={true}
              />
            </div>
          </Card>

          {/* Service Breakdown */}
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Service Breakdown</h3>
              <BarChart
                data={businessData.serviceBreakdown.map(service => ({
                  label: service.service,
                  value: service.revenue
                }))}
                height="300px"
                showLegend={true}
              />
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
          {/* Recent Appointments */}
          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Recent Appointments</h3>
                <Button variant="outline" size="sm">View All</Button>
              </div>
              <div className="space-y-3">
                {businessData.recentAppointments.map((appointment) => (
                  <div key={appointment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{appointment.customerName}</h4>
                      <p className="text-sm text-gray-600">{appointment.service}</p>
                      <p className="text-xs text-gray-500">{formatDate(appointment.date)} at {appointment.time}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">{formatCurrency(appointment.revenue)}</p>
                      <p className="text-sm text-gray-500">+{formatCurrency(appointment.tip)} tip</p>
                      <div className="flex items-center gap-1 mt-1">
                        <svg className="w-3 h-3 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <span className="text-xs text-gray-500">{appointment.rating}/5</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* Top Customers */}
          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Top Customers</h3>
                <Button variant="outline" size="sm">View All</Button>
              </div>
              <div className="space-y-3">
                {businessData.topCustomers.map((customer, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-primary-600">#{index + 1}</span>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{customer.name}</h4>
                        <p className="text-sm text-gray-600">{customer.visits} visits</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">{formatCurrency(customer.totalSpent)}</p>
                      <p className="text-xs text-gray-500">Last: {formatDate(customer.lastVisit)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default StaffBusiness
