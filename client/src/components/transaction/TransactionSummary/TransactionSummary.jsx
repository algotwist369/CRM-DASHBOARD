import React, { useState } from 'react'
import { Card, Button, Badge, Tabs, Table } from '../../common'
import { StatCard, StatCardGrid } from '../../charts'
import PaymentMethod from '../PaymentMethod/PaymentMethod'
import { LineChart, BarChart, DonutChart } from '../../charts'

const TransactionSummary = ({ 
  transactions = [],
  summaryData = {},
  onViewTransaction,
  onExport,
  onFilter,
  className = ''
}) => {
  const [activeTab, setActiveTab] = useState(0)

  const {
    totalTransactions,
    totalRevenue,
    averageTransactionValue,
    totalRefunds,
    refundRate,
    paymentMethodBreakdown = [],
    dailyStats = [],
    monthlyStats = [],
    topServices = [],
    topCustomers = [],
    recentTransactions = []
  } = summaryData

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0)
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatPercentage = (value) => {
    return `${(value || 0).toFixed(1)}%`
  }

  const tabs = [
    { label: 'Overview', content: 'overview' },
    { label: 'Analytics', content: 'analytics' },
    { label: 'Recent Transactions', content: 'recent' }
  ]

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Metrics</h3>
        <StatCardGrid
          stats={[
            {
              title: 'Total Transactions',
              value: totalTransactions || 0,
              change: 15.2,
              changeType: 'positive',
              format: 'number',
              color: 'blue',
              icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
              )
            },
            {
              title: 'Total Revenue',
              value: totalRevenue || 0,
              change: 8.7,
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
              value: averageTransactionValue || 0,
              change: -2.1,
              changeType: 'negative',
              format: 'currency',
              color: 'purple',
              icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              )
            },
            {
              title: 'Refund Rate',
              value: refundRate || 0,
              change: -0.5,
              changeType: 'positive',
              format: 'percentage',
              color: 'orange',
              icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                </svg>
              )
            }
          ]}
          columns={4}
        />
      </div>

      {/* Payment Method Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <div className="p-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Payment Methods</h4>
            {paymentMethodBreakdown.length > 0 ? (
              <DonutChart
                data={paymentMethodBreakdown}
                centerText="Methods"
                centerValue={paymentMethodBreakdown.length.toString()}
                showLegend={true}
                width="250px"
                height="250px"
              />
            ) : (
              <div className="text-center text-gray-500 py-8">
                <p>No payment method data available</p>
              </div>
            )}
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Top Services</h4>
            {topServices.length > 0 ? (
              <div className="space-y-3">
                {topServices.slice(0, 5).map((service, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-sm font-semibold">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{service.name}</p>
                        <p className="text-sm text-gray-500">{service.count} transactions</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">{formatCurrency(service.revenue)}</p>
                      <p className="text-sm text-gray-500">{formatPercentage(service.percentage)}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">
                <p>No service data available</p>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Top Customers */}
      <Card>
        <div className="p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Top Customers</h4>
          {topCustomers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {topCustomers.slice(0, 6).map((customer, index) => (
                <div key={index} className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-sm font-semibold">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{customer.name}</p>
                      <p className="text-sm text-gray-500">{customer.phone}</p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">{customer.transactions} transactions</span>
                    <span className="font-medium text-gray-900">{formatCurrency(customer.totalSpent)}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500 py-8">
              <p>No customer data available</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  )

  const renderAnalytics = () => (
    <div className="space-y-6">
      {/* Daily Transaction Trend */}
      <Card>
        <div className="p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Daily Transaction Trend</h4>
          {dailyStats.length > 0 ? (
            <LineChart
              data={[
                {
                  label: 'Transactions',
                  data: dailyStats.map(stat => stat.count),
                  labels: dailyStats.map(stat => stat.date)
                },
                {
                  label: 'Revenue',
                  data: dailyStats.map(stat => stat.revenue),
                  labels: dailyStats.map(stat => stat.date)
                }
              ]}
              height="300px"
              showLegend={true}
            />
          ) : (
            <div className="text-center text-gray-500 py-8">
              <p>No daily trend data available</p>
            </div>
          )}
        </div>
      </Card>

      {/* Monthly Revenue */}
      <Card>
        <div className="p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Monthly Revenue</h4>
          {monthlyStats.length > 0 ? (
            <BarChart
              data={monthlyStats.map(stat => ({
                label: stat.month,
                value: stat.revenue
              }))}
              height="300px"
              showLegend={true}
            />
          ) : (
            <div className="text-center text-gray-500 py-8">
              <p>No monthly data available</p>
            </div>
          )}
        </div>
      </Card>

      {/* Payment Method Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <div className="p-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Payment Method Usage</h4>
            {paymentMethodBreakdown.length > 0 ? (
              <div className="space-y-3">
                {paymentMethodBreakdown.map((method, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <PaymentMethod method={method.name} showStatus={false} size="sm" />
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">{method.count} transactions</p>
                      <p className="text-sm text-gray-500">{formatPercentage(method.percentage)}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">
                <p>No payment method data available</p>
              </div>
            )}
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Refund Summary</h4>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                <span className="text-red-700 font-medium">Total Refunds</span>
                <span className="text-red-900 font-bold text-lg">{formatCurrency(totalRefunds)}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                <span className="text-orange-700 font-medium">Refund Rate</span>
                <span className="text-orange-900 font-bold text-lg">{formatPercentage(refundRate)}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                <span className="text-green-700 font-medium">Net Revenue</span>
                <span className="text-green-900 font-bold text-lg">{formatCurrency((totalRevenue || 0) - (totalRefunds || 0))}</span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )

  const renderRecentTransactions = () => (
    <div className="space-y-6">
      <Card>
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold text-gray-900">Recent Transactions</h4>
            {onExport && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onExport(transactions)}
              >
                Export All
              </Button>
            )}
          </div>
          
          {recentTransactions.length > 0 ? (
            <Table
              data={recentTransactions}
              columns={[
                {
                  key: 'receiptNumber',
                  label: 'Receipt #',
                  sortable: true,
                  render: (transaction) => (
                    <span className="font-medium text-primary-600">
                      #{transaction.receiptNumber || transaction.id}
                    </span>
                  )
                },
                {
                  key: 'customerName',
                  label: 'Customer',
                  sortable: true,
                  render: (transaction) => (
                    <div>
                      <p className="font-medium text-gray-900">{transaction.customerName}</p>
                      <p className="text-sm text-gray-500">{transaction.customerPhone}</p>
                    </div>
                  )
                },
                {
                  key: 'services',
                  label: 'Services',
                  render: (transaction) => (
                    <div className="max-w-xs">
                      <p className="text-sm text-gray-900 truncate">
                        {transaction.services?.map(s => s.name).join(', ') || 'N/A'}
                      </p>
                    </div>
                  )
                },
                {
                  key: 'finalPrice',
                  label: 'Amount',
                  sortable: true,
                  render: (transaction) => (
                    <span className="font-medium text-gray-900">
                      {formatCurrency(transaction.finalPrice)}
                    </span>
                  )
                },
                {
                  key: 'paymentMethod',
                  label: 'Payment',
                  render: (transaction) => (
                    <PaymentMethod 
                      method={transaction.paymentMethod} 
                      status={transaction.paymentStatus}
                      showStatus={true}
                      size="sm"
                    />
                  )
                },
                {
                  key: 'transactionDate',
                  label: 'Date',
                  sortable: true,
                  render: (transaction) => (
                    <div>
                      <p className="text-sm text-gray-900">{formatDate(transaction.transactionDate)}</p>
                      <p className="text-xs text-gray-500">{transaction.transactionTime}</p>
                    </div>
                  )
                },
                {
                  key: 'actions',
                  label: 'Actions',
                  render: (transaction) => (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onViewTransaction && onViewTransaction(transaction)}
                    >
                      View
                    </Button>
                  )
                }
              ]}
              onSort={(key, direction) => {
                // Handle sorting logic here
                console.log('Sort by:', key, direction)
              }}
              sortable={true}
            />
          ) : (
            <div className="text-center text-gray-500 py-8">
              <p>No recent transactions found</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  )

  return (
    <div className={className}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Transaction Summary</h2>
          <p className="text-gray-600">
            Overview of all transaction activities and analytics
          </p>
        </div>
        <div className="flex gap-2">
          {onFilter && (
            <Button
              variant="outline"
              onClick={() => onFilter()}
            >
              Filter
            </Button>
          )}
          {onExport && (
            <Button
              variant="primary"
              onClick={() => onExport(transactions)}
            >
              Export
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <Tabs
        tabs={tabs}
        defaultActiveTab={0}
        onTabChange={(index) => setActiveTab(index)}
      >
        {renderOverview()}
        {renderAnalytics()}
        {renderRecentTransactions()}
      </Tabs>
    </div>
  )
}

export default TransactionSummary
