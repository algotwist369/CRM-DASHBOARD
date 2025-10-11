import React, { useState, useEffect } from 'react'
import { Card, Button, Badge, StatCard, StatCardGrid, Alert } from '../../../components'
import { LineChart, BarChart } from '../../../components'
import staffService from '../../../services/staff/staffService'
import { toast } from 'react-hot-toast'

const StaffDashboard = () => {
  const [loading, setLoading] = useState(true)
  const [dashboardData, setDashboardData] = useState(null)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      
      const result = await staffService.getDashboard()
      
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
        staffInfo: {
          name: 'Emma Wilson',
          role: 'Senior Stylist',
          email: 'emma@elitehair.com',
          phone: '+1 (555) 123-4568',
          joinDate: '2022-01-15',
          rating: 4.9,
          totalAppointments: 1250,
          totalCustomers: 450
        },
        todayStats: {
          appointments: 8,
          completed: 6,
          pending: 2,
          revenue: 680,
          tips: 120
        },
        weeklyStats: {
          appointments: 45,
          completed: 42,
          revenue: 3800,
          tips: 650,
          averageRating: 4.8
        },
        monthlyStats: {
          appointments: 180,
          completed: 175,
          revenue: 15200,
          tips: 2800,
          newCustomers: 25
        },
        upcomingAppointments: [
          {
            id: '1',
            customerName: 'John Doe',
            service: 'Haircut & Styling',
            time: '10:00 AM',
            duration: 60,
            status: 'upcoming',
            notes: 'Regular customer, prefers short cut'
          },
          {
            id: '2',
            customerName: 'Alice Johnson',
            service: 'Color Treatment',
            time: '11:30 AM',
            duration: 90,
            status: 'upcoming',
            notes: 'First time color treatment'
          },
          {
            id: '3',
            customerName: 'Bob Wilson',
            service: 'Beard Trim',
            time: '2:00 PM',
            duration: 30,
            status: 'upcoming',
            notes: 'Quick beard trim'
          }
        ],
        recentCustomers: [
          {
            id: '1',
            name: 'Sarah Davis',
            lastVisit: '2024-01-20',
            service: 'Highlights',
            rating: 5,
            nextAppointment: '2024-02-15'
          },
          {
            id: '2',
            name: 'Mike Brown',
            lastVisit: '2024-01-19',
            service: 'Haircut',
            rating: 4,
            nextAppointment: null
          },
          {
            id: '3',
            name: 'Lisa Garcia',
            lastVisit: '2024-01-18',
            service: 'Styling',
            rating: 5,
            nextAppointment: '2024-01-25'
          }
        ],
        performanceMetrics: {
          averageAppointmentTime: 45,
          customerSatisfaction: 4.8,
          repeatCustomerRate: 78,
          tipPercentage: 18.5
        }
      }
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
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
      case 'upcoming': return 'info'
      case 'completed': return 'success'
      case 'cancelled': return 'danger'
      default: return 'default'
    }
  }

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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Welcome back, {dashboardData.staffInfo.name}!</h1>
              <p className="text-gray-600 mt-1">Here's your daily overview and performance metrics</p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline">View Schedule</Button>
              <Button variant="primary">Add Appointment</Button>
            </div>
          </div>
        </div>

        {/* Staff Info Card */}
        <Card className="mb-8">
          <div className="p-6">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center">
                <svg className="w-10 h-10 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900">{dashboardData.staffInfo.name}</h2>
                <p className="text-lg text-gray-600">{dashboardData.staffInfo.role}</p>
                <div className="flex items-center gap-4 mt-2">
                  <div className="flex items-center gap-1">
                    <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span className="text-sm font-medium text-gray-700">{dashboardData.staffInfo.rating}/5.0</span>
                  </div>
                  <span className="text-sm text-gray-500">
                    {dashboardData.staffInfo.totalAppointments} appointments
                  </span>
                  <span className="text-sm text-gray-500">
                    {dashboardData.staffInfo.totalCustomers} customers
                  </span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Member since</p>
                <p className="font-medium text-gray-900">{formatDate(dashboardData.staffInfo.joinDate)}</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Today's Stats */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Today's Performance</h3>
          <StatCardGrid
            stats={[
              {
                title: 'Appointments',
                value: dashboardData.todayStats.appointments,
                change: 0,
                changeType: 'neutral',
                format: 'number',
                color: 'blue',
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                )
              },
              {
                title: 'Completed',
                value: dashboardData.todayStats.completed,
                change: 0,
                changeType: 'neutral',
                format: 'number',
                color: 'green',
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )
              },
              {
                title: 'Revenue',
                value: dashboardData.todayStats.revenue,
                change: 0,
                changeType: 'neutral',
                format: 'currency',
                color: 'yellow',
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                )
              },
              {
                title: 'Tips',
                value: dashboardData.todayStats.tips,
                change: 0,
                changeType: 'neutral',
                format: 'currency',
                color: 'purple',
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                )
              }
            ]}
            columns={4}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upcoming Appointments */}
          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Upcoming Appointments</h3>
                <Button variant="outline" size="sm">View All</Button>
              </div>
              <div className="space-y-4">
                {dashboardData.upcomingAppointments.map((appointment) => (
                  <div key={appointment.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{appointment.customerName}</h4>
                      <p className="text-sm text-gray-600">{appointment.service}</p>
                      <p className="text-xs text-gray-500">{appointment.notes}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">{appointment.time}</p>
                      <p className="text-sm text-gray-500">{appointment.duration} min</p>
                      <Badge variant={getStatusColor(appointment.status)} size="sm">
                        {appointment.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* Recent Customers */}
          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Recent Customers</h3>
                <Button variant="outline" size="sm">View All</Button>
              </div>
              <div className="space-y-4">
                {dashboardData.recentCustomers.map((customer) => (
                  <div key={customer.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{customer.name}</h4>
                      <p className="text-sm text-gray-600">Last visit: {formatDate(customer.lastVisit)}</p>
                      <p className="text-xs text-gray-500">{customer.service}</p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1 mb-1">
                        <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <span className="text-sm font-medium text-gray-700">{customer.rating}/5</span>
                      </div>
                      {customer.nextAppointment && (
                        <p className="text-xs text-gray-500">Next: {formatDate(customer.nextAppointment)}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>

        {/* Performance Metrics */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Metrics</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <div className="p-6 text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h4 className="font-semibold text-gray-900">Avg. Appointment Time</h4>
                <p className="text-2xl font-bold text-blue-600">{dashboardData.performanceMetrics.averageAppointmentTime} min</p>
              </div>
            </Card>
            <Card>
              <div className="p-6 text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <h4 className="font-semibold text-gray-900">Customer Satisfaction</h4>
                <p className="text-2xl font-bold text-green-600">{dashboardData.performanceMetrics.customerSatisfaction}/5.0</p>
              </div>
            </Card>
            <Card>
              <div className="p-6 text-center">
                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h4 className="font-semibold text-gray-900">Repeat Customer Rate</h4>
                <p className="text-2xl font-bold text-yellow-600">{dashboardData.performanceMetrics.repeatCustomerRate}%</p>
              </div>
            </Card>
            <Card>
              <div className="p-6 text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <h4 className="font-semibold text-gray-900">Tip Percentage</h4>
                <p className="text-2xl font-bold text-purple-600">{dashboardData.performanceMetrics.tipPercentage}%</p>
              </div>
            </Card>
          </div>
        </div>

        {/* Weekly Performance Chart */}
        <div className="mt-8">
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Weekly Performance</h3>
              <LineChart
                data={[
                  {
                    label: 'Appointments',
                    data: [8, 7, 9, 6, 8, 5, 7],
                    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
                  }
                ]}
                height="300px"
                showLegend={true}
              />
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default StaffDashboard
