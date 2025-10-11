import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Card, Button, Badge, Tabs, Table, StatCard, StatCardGrid, Alert } from '../../../../components'
import { LineChart, BarChart } from '../../../../components'
import { TransactionCard, PaymentMethod, TransactionSummary } from '../../../../components'
import managerService from '../../../../services/manager/managerService'
import { toast } from 'react-hot-toast'

const TransactionDetails = () => {
  const { id } = useParams()
  const [transaction, setTransaction] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState(0)

  useEffect(() => {
    fetchTransactionDetails()
  }, [id])

  const fetchTransactionDetails = async () => {
    try {
      setLoading(true)
      
      const result = await managerService.getTransactionById(id)
      
      if (result.success) {
        setTransaction(result.data)
        toast.success('Transaction details loaded successfully!')
      } else {
        toast.error(result.error || 'Failed to load transaction details')
        console.error('Transaction details error:', result.error)
      }
    } catch (error) {
      console.error('Error fetching transaction details:', error)
      toast.error('An unexpected error occurred while loading transaction details')
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
            amount: 85,
            tip: 15,
            total: 106.8,
            status: 'completed',
            transactionId: 'TXN-001'
          },
          {
            id: '2',
            service: 'Haircut',
            date: '2023-12-20',
            amount: 65,
            tip: 10,
            total: 75,
            status: 'completed',
            transactionId: 'TXN-002'
          },
          {
            id: '3',
            service: 'Color Treatment',
            date: '2023-11-15',
            amount: 120,
            tip: 20,
            total: 140,
            status: 'completed',
            transactionId: 'TXN-003'
          }
        ],
        staffTransactions: [
          {
            id: '1',
            customerName: 'John Doe',
            service: 'Haircut & Styling',
            date: '2024-01-21',
            amount: 85,
            tip: 15,
            total: 106.8,
            status: 'completed'
          },
          {
            id: '2',
            customerName: 'Alice Johnson',
            service: 'Color Treatment',
            date: '2024-01-21',
            amount: 120,
            tip: 20,
            total: 140,
            status: 'completed'
          },
          {
            id: '3',
            customerName: 'Bob Wilson',
            service: 'Beard Trim',
            date: '2024-01-21',
            amount: 25,
            tip: 5,
            total: 30,
            status: 'completed'
          }
        ],
        analytics: {
          totalTransactions: 15,
          totalRevenue: 1250,
          averageTransaction: 83.33,
          customerLifetimeValue: 1250
        }
      }
      
    } catch (error) {
      console.error('Error fetching transaction details:', error)
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
      case 'pending': return 'warning'
      case 'cancelled': return 'danger'
      case 'refunded': return 'info'
      default: return 'default'
    }
  }

  const getPaymentMethodIcon = (method) => {
    switch (method) {
      case 'credit_card':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
        )
      case 'debit_card':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
        )
      case 'cash':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
          </svg>
        )
      default:
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
        )
    }
  }

  const tabs = [
    { label: 'Overview', content: 'overview' },
    { label: 'Customer History', content: 'customerHistory' },
    { label: 'Staff Transactions', content: 'staffTransactions' },
    { label: 'Analytics', content: 'analytics' }
  ]

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Transaction Information */}
      <Card>
        <div className="p-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{transaction.transactionId}</h2>
                <div className="flex items-center gap-3 mt-1">
                  <Badge variant={getStatusColor(transaction.status)} size="sm">
                    {transaction.status}
                  </Badge>
                  <span className="text-sm text-gray-500">
                    {formatDateTime(transaction.date)}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline">Edit Transaction</Button>
              <Button variant="primary">Print Receipt</Button>
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
                  <span className="text-gray-700">{transaction.customerName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span className="text-gray-700">{transaction.customerEmail}</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span className="text-gray-700">{transaction.customerPhone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="text-gray-700">{transaction.customerAddress}</span>
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
                  <span className="text-gray-700">{transaction.staffName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span className="text-gray-700">{transaction.staffEmail}</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span className="text-gray-700">{transaction.staffPhone}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Transaction Details */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Transaction Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <span className="text-sm font-medium text-gray-700">Service:</span>
                <p className="text-gray-900">{transaction.service}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-700">Amount:</span>
                <p className="text-gray-900">{formatCurrency(transaction.amount)}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-700">Payment Method:</span>
                <div className="flex items-center gap-2">
                  {getPaymentMethodIcon(transaction.paymentMethod)}
                  <span className="capitalize">{transaction.paymentMethod.replace('_', ' ')}</span>
                </div>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-700">Status:</span>
                <Badge variant={getStatusColor(transaction.status)} size="sm">
                  {transaction.status}
                </Badge>
              </div>
            </div>
          </div>

          {/* Payment Breakdown */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Payment Breakdown</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Service Amount:</span>
                  <span className="font-medium">{formatCurrency(transaction.amount)}</span>
                </div>
                {transaction.tip > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tip:</span>
                    <span className="font-medium">{formatCurrency(transaction.tip)}</span>
                  </div>
                )}
                {transaction.discount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Discount:</span>
                    <span className="font-medium text-green-600">-{formatCurrency(transaction.discount)}</span>
                  </div>
                )}
                {transaction.tax > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax:</span>
                    <span className="font-medium">{formatCurrency(transaction.tax)}</span>
                  </div>
                )}
                <div className="border-t border-gray-200 pt-2">
                  <div className="flex justify-between">
                    <span className="text-lg font-semibold text-gray-900">Total:</span>
                    <span className="text-lg font-semibold text-gray-900">{formatCurrency(transaction.total)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          {transaction.notes && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Notes</h3>
              <p className="text-gray-700">{transaction.notes}</p>
            </div>
          )}

          {/* History */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Transaction History</h3>
            <div className="space-y-3">
              {transaction.history.map((entry) => (
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
            title: 'Total Transactions',
            value: transaction.analytics.totalTransactions,
            change: 12.5,
            changeType: 'positive',
            format: 'number',
            color: 'blue',
            icon: (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            )
          },
          {
            title: 'Total Revenue',
            value: transaction.analytics.totalRevenue,
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
            title: 'Average Transaction',
            value: transaction.analytics.averageTransaction,
            change: 0.2,
            changeType: 'positive',
            format: 'currency',
            color: 'yellow',
            icon: (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            )
          },
          {
            title: 'Customer LTV',
            value: transaction.analytics.customerLifetimeValue,
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
        <h3 className="text-lg font-semibold text-gray-900">Customer Transaction History</h3>
        <Button variant="outline">View All</Button>
      </div>

      <Table
        data={transaction.customerHistory}
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
            key: 'amount',
            label: 'Amount',
            sortable: true,
            render: (history) => formatCurrency(history.amount)
          },
          {
            key: 'tip',
            label: 'Tip',
            sortable: true,
            render: (history) => formatCurrency(history.tip)
          },
          {
            key: 'total',
            label: 'Total',
            sortable: true,
            render: (history) => formatCurrency(history.total)
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

  const renderStaffTransactions = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Staff Transactions for {formatDate(transaction.date)}</h3>
        <Button variant="outline">View Full Schedule</Button>
      </div>

      <Table
        data={transaction.staffTransactions}
        columns={[
          {
            key: 'customerName',
            label: 'Customer',
            sortable: true,
            render: (staff) => staff.customerName
          },
          {
            key: 'service',
            label: 'Service',
            sortable: true,
            render: (staff) => staff.service
          },
          {
            key: 'amount',
            label: 'Amount',
            sortable: true,
            render: (staff) => formatCurrency(staff.amount)
          },
          {
            key: 'tip',
            label: 'Tip',
            sortable: true,
            render: (staff) => formatCurrency(staff.tip)
          },
          {
            key: 'total',
            label: 'Total',
            sortable: true,
            render: (staff) => formatCurrency(staff.total)
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
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Transaction Trends</h3>
            <LineChart
              data={[
                {
                  label: 'Transactions',
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
          <p className="text-gray-600">Loading transaction details...</p>
        </div>
      </div>
    )
  }

  if (!transaction) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Alert
            type="error"
            title="Transaction Not Found"
            message="The transaction you're looking for doesn't exist or has been removed."
          />
          <Link to="/manager/transactions">
            <Button variant="primary" className="mt-4">
              Back to Transactions
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
            <Link to="/manager/transactions">
              <Button variant="outline" size="sm">
                ← Back to Transactions
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
          {renderStaffTransactions()}
          {renderAnalytics()}
        </Tabs>
      </div>
    </div>
  )
}

export default TransactionDetails
