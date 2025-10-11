import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Card, Button, Badge, Tabs, Table, StatCard, StatCardGrid, Alert } from '../../../../components'
import { LineChart, BarChart } from '../../../../components'
import customerService from '../../../../services/customer/customerService'
import { toast } from 'react-hot-toast'

const CustomerDetails = () => {
  const { id } = useParams()
  const [customer, setCustomer] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState(0)

  useEffect(() => {
    fetchCustomerDetails()
  }, [id])

  const fetchCustomerDetails = async () => {
    try {
      setLoading(true)
      
      const result = await customerService.getCustomerById(id)
      
      if (result.success) {
        setCustomer(result.data)
        toast.success('Customer details loaded successfully!')
      } else {
        toast.error(result.error || 'Failed to load customer details')
        console.error('Customer details error:', result.error)
      }
    } catch (error) {
      console.error('Error fetching customer details:', error)
      toast.error('An unexpected error occurred while loading customer details')
    } finally {
      setLoading(false)
    }
  }
      
        ],
        recentTransactions: [
          {
            id: '1',
            service: 'Haircut & Styling',
            amount: 85,
            date: '2024-01-20',
            status: 'completed',
            paymentMethod: 'card'
          },
          {
            id: '2',
            service: 'Color Treatment',
            amount: 120,
            date: '2024-01-06',
            status: 'completed',
            paymentMethod: 'card'
          },
          {
            id: '3',
            service: 'Haircut',
            amount: 65,
            date: '2023-12-23',
            status: 'completed',
            paymentMethod: 'cash'
          }
        ],
        spendingData: [
          { month: 'Jan', amount: 85 },
          { month: 'Feb', amount: 120 },
          { month: 'Mar', amount: 95 },
          { month: 'Apr', amount: 110 },
          { month: 'May', amount: 75 },
          { month: 'Jun', amount: 125 }
        ],
        visitData: [
          { month: 'Jan', visits: 1 },
          { month: 'Feb', visits: 1 },
          { month: 'Mar', visits: 1 },
          { month: 'Apr', visits: 1 },
          { month: 'May', visits: 1 },
          { month: 'Jun', visits: 1 }
        ],
        notes: 'VIP customer, prefers morning appointments. Always satisfied with Emma\'s work. Loyal customer for over 6 months.'
      }
      
    } catch (error) {
      console.error('Error fetching customer details:', error)
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
    { label: 'Appointments', content: 'appointments' },
    { label: 'Transactions', content: 'transactions' },
    { label: 'Analytics', content: 'analytics' }
  ]

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Customer Information */}
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
                <h2 className="text-2xl font-bold text-gray-900">{customer.name}</h2>
                <div className="flex items-center gap-3 mt-1">
                  <Badge variant={getSegmentColor(customer.segment)} size="sm">
                    {customer.segment.toUpperCase()}
                  </Badge>
                  <Badge variant={getStatusColor(customer.status)} size="sm">
                    {customer.status}
                  </Badge>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline">Edit Customer</Button>
              <Button variant="primary">Book Appointment</Button>
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
                  <span className="text-gray-700">{customer.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span className="text-gray-700">{customer.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="text-gray-700">{customer.address}</span>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Customer Details</h3>
              <div className="space-y-2">
                <div>
                  <span className="text-sm font-medium text-gray-700">Join Date:</span>
                  <p className="text-gray-900">{formatDate(customer.joinDate)}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700">Last Visit:</span>
                  <p className="text-gray-900">{formatDate(customer.lastVisit)}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700">Date of Birth:</span>
                  <p className="text-gray-900">{formatDate(customer.dateOfBirth)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Preferences */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Preferences</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="text-sm font-medium text-gray-700">Preferred Staff:</span>
                <p className="text-gray-900">{customer.preferences.preferredStaff}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-700">Preferred Time:</span>
                <p className="text-gray-900">{customer.preferences.preferredTime}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-700">Preferred Day:</span>
                <p className="text-gray-900">{customer.preferences.preferredDay}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-700">Preferred Services:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {customer.preferences.preferredServices.map((service, index) => (
                    <Badge key={index} variant="info" size="sm">
                      {service}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          {customer.notes && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Notes</h3>
              <p className="text-gray-700">{customer.notes}</p>
            </div>
          )}
        </div>
      </Card>

      {/* Key Metrics */}
      <StatCardGrid
        stats={[
          {
            title: 'Total Spent',
            value: customer.stats.totalSpent,
            change: 12.5,
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
            title: 'Total Visits',
            value: customer.stats.totalVisits,
            change: 8.3,
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
            title: 'Average Spent',
            value: customer.stats.averageSpent,
            change: 15.2,
            changeType: 'positive',
            format: 'currency',
            color: 'purple',
            icon: (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            )
          },
          {
            title: 'Average Rating',
            value: customer.stats.averageRating,
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

  const renderAppointments = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Recent Appointments</h3>
        <Button variant="outline">View All</Button>
      </div>

      <Table
        data={customer.recentAppointments}
        columns={[
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

  const renderTransactions = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Recent Transactions</h3>
        <Button variant="outline">View All</Button>
      </div>

      <Table
        data={customer.recentTransactions}
        columns={[
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
            key: 'paymentMethod',
            label: 'Payment Method',
            sortable: true,
            render: (transaction) => (
              <Badge variant="info" size="sm">
                {transaction.paymentMethod}
              </Badge>
            )
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

  const renderAnalytics = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Spending Trend</h3>
            <LineChart
              data={[
                {
                  label: 'Amount Spent',
                  data: customer.spendingData.map(item => item.amount),
                  labels: customer.spendingData.map(item => item.month)
                }
              ]}
              height="300px"
              showLegend={true}
            />
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Visit Frequency</h3>
            <BarChart
              data={customer.visitData.map(item => ({
                label: item.month,
                value: item.visits
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
          <p className="text-gray-600">Loading customer details...</p>
        </div>
      </div>
    )
  }

  if (!customer) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Alert
            type="error"
            title="Customer Not Found"
            message="The customer you're looking for doesn't exist or has been removed."
          />
          <Link to="/manager/customers">
            <Button variant="primary" className="mt-4">
              Back to Customer List
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
            <Link to="/manager/customers">
              <Button variant="outline" size="sm">
                ← Back to Customer List
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
          {renderAppointments()}
          {renderTransactions()}
          {renderAnalytics()}
        </Tabs>
      </div>
    </div>
  )
}

export default CustomerDetails
