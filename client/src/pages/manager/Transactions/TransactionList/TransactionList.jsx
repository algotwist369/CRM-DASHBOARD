import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Card, Button, Badge, Table, StatCard, StatCardGrid, SearchBar, Dropdown, DatePicker, Alert } from '../../../../components'
import { TransactionCard, PaymentMethod, TransactionSummary } from '../../../../components'
import managerService from '../../../../services/manager/managerService'
import { toast } from 'react-hot-toast'

const TransactionList = () => {
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [paymentMethodFilter, setPaymentMethodFilter] = useState('all')
  const [dateRange, setDateRange] = useState({ start: null, end: null })
  const [sortBy, setSortBy] = useState('date')
  const [sortDirection, setSortDirection] = useState('desc')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  const [selectedTransactions, setSelectedTransactions] = useState([])
  const [viewMode, setViewMode] = useState('table') // 'table' or 'card'

  useEffect(() => {
    fetchTransactions()
  }, [])

  const fetchTransactions = async () => {
    try {
      setLoading(true)
      
      const result = await managerService.getTransactions()
      
      if (result.success) {
        setTransactions(result.data)
        toast.success('Transactions loaded successfully!')
      } else {
        toast.error(result.error || 'Failed to load transactions')
        console.error('Transactions error:', result.error)
      }
    } catch (error) {
      console.error('Error fetching transactions:', error)
      toast.error('An unexpected error occurred while loading transactions')
    } finally {
      setLoading(false)
    }
  }
      
      ]
      
    } catch (error) {
      console.error('Error fetching transactions:', error)
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

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.customerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.service.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.transactionId.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || transaction.status === statusFilter
    const matchesPaymentMethod = paymentMethodFilter === 'all' || transaction.paymentMethod === paymentMethodFilter
    
    const matchesDateRange = !dateRange.start || !dateRange.end || 
                           (new Date(transaction.date) >= dateRange.start && new Date(transaction.date) <= dateRange.end)
    
    return matchesSearch && matchesStatus && matchesPaymentMethod && matchesDateRange
  })

  const sortedTransactions = [...filteredTransactions].sort((a, b) => {
    let aValue = a[sortBy]
    let bValue = b[sortBy]
    
    if (sortBy === 'date') {
      aValue = new Date(aValue)
      bValue = new Date(bValue)
    }
    
    if (sortDirection === 'asc') {
      return aValue > bValue ? 1 : -1
    } else {
      return aValue < bValue ? 1 : -1
    }
  })

  const paginatedTransactions = sortedTransactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const totalPages = Math.ceil(sortedTransactions.length / itemsPerPage)

  const handleSelectTransaction = (transactionId) => {
    setSelectedTransactions(prev => 
      prev.includes(transactionId) 
        ? prev.filter(id => id !== transactionId)
        : [...prev, transactionId]
    )
  }

  const handleSelectAll = () => {
    if (selectedTransactions.length === paginatedTransactions.length) {
      setSelectedTransactions([])
    } else {
      setSelectedTransactions(paginatedTransactions.map(t => t.id))
    }
  }

  const handleBulkAction = (action) => {
    console.log('Bulk action:', action, selectedTransactions)
    // Implement bulk actions
  }

  const calculateStats = () => {
    const completed = transactions.filter(t => t.status === 'completed')
    const pending = transactions.filter(t => t.status === 'pending')
    const totalRevenue = completed.reduce((sum, t) => sum + t.total, 0)
    const averageTransaction = completed.length > 0 ? totalRevenue / completed.length : 0
    
    return {
      total: transactions.length,
      completed: completed.length,
      pending: pending.length,
      totalRevenue,
      averageTransaction
    }
  }

  const stats = calculateStats()

  const renderTransactionCard = (transaction) => (
    <TransactionCard
      key={transaction.id}
      transaction={transaction}
      onSelect={() => handleSelectTransaction(transaction.id)}
      selected={selectedTransactions.includes(transaction.id)}
      onView={() => console.log('View transaction:', transaction.id)}
      onEdit={() => console.log('Edit transaction:', transaction.id)}
      onDelete={() => console.log('Delete transaction:', transaction.id)}
    />
  )

  const renderTransactionTable = () => (
    <Table
      data={paginatedTransactions}
      columns={[
        {
          key: 'select',
          label: (
            <input
              type="checkbox"
              checked={selectedTransactions.length === paginatedTransactions.length && paginatedTransactions.length > 0}
              onChange={handleSelectAll}
              className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
          ),
          render: (transaction) => (
            <input
              type="checkbox"
              checked={selectedTransactions.includes(transaction.id)}
              onChange={() => handleSelectTransaction(transaction.id)}
              className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
          )
        },
        {
          key: 'transactionId',
          label: 'Transaction ID',
          sortable: true,
          render: (transaction) => (
            <Link 
              to={`/manager/transactions/${transaction.id}`}
              className="text-primary-600 hover:text-primary-800 font-medium"
            >
              {transaction.transactionId}
            </Link>
          )
        },
        {
          key: 'customerName',
          label: 'Customer',
          sortable: true,
          render: (transaction) => (
            <div>
              <p className="font-medium text-gray-900">{transaction.customerName}</p>
              <p className="text-sm text-gray-500">{transaction.customerEmail}</p>
            </div>
          )
        },
        {
          key: 'service',
          label: 'Service',
          sortable: true,
          render: (transaction) => (
            <div>
              <p className="font-medium text-gray-900">{transaction.service}</p>
              <p className="text-sm text-gray-500">by {transaction.staffName}</p>
            </div>
          )
        },
        {
          key: 'amount',
          label: 'Amount',
          sortable: true,
          render: (transaction) => (
            <div className="text-right">
              <p className="font-medium text-gray-900">{formatCurrency(transaction.amount)}</p>
              {transaction.tip > 0 && (
                <p className="text-sm text-gray-500">+{formatCurrency(transaction.tip)} tip</p>
              )}
            </div>
          )
        },
        {
          key: 'total',
          label: 'Total',
          sortable: true,
          render: (transaction) => (
            <div className="text-right">
              <p className="font-medium text-gray-900">{formatCurrency(transaction.total)}</p>
              {transaction.discount > 0 && (
                <p className="text-sm text-green-600">-{formatCurrency(transaction.discount)}</p>
              )}
            </div>
          )
        },
        {
          key: 'paymentMethod',
          label: 'Payment',
          sortable: true,
          render: (transaction) => (
            <div className="flex items-center gap-2">
              {getPaymentMethodIcon(transaction.paymentMethod)}
              <span className="capitalize">{transaction.paymentMethod.replace('_', ' ')}</span>
            </div>
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
        },
        {
          key: 'date',
          label: 'Date',
          sortable: true,
          render: (transaction) => formatDate(transaction.date)
        },
        {
          key: 'actions',
          label: 'Actions',
          render: (transaction) => (
            <div className="flex items-center gap-2">
              <Link to={`/manager/transactions/${transaction.id}`}>
                <Button variant="outline" size="sm">View</Button>
              </Link>
              <Button variant="outline" size="sm">Edit</Button>
              <Button variant="outline" size="sm" className="text-red-600 hover:text-red-800">
                Delete
              </Button>
            </div>
          )
        }
      ]}
      onSort={(key, direction) => {
        setSortBy(key)
        setSortDirection(direction)
      }}
      sortable={true}
      currentSort={{ key: sortBy, direction: sortDirection }}
    />
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading transactions...</p>
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
              <h1 className="text-3xl font-bold text-gray-900">Transactions</h1>
              <p className="text-gray-600 mt-1">Manage and track all business transactions</p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant={viewMode === 'table' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setViewMode('table')}
              >
                Table View
              </Button>
              <Button
                variant={viewMode === 'card' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setViewMode('card')}
              >
                Card View
              </Button>
              <Link to="/manager/transactions/add">
                <Button variant="primary">Add Transaction</Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Stats */}
        <StatCardGrid
          stats={[
            {
              title: 'Total Transactions',
              value: stats.total,
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
              title: 'Completed',
              value: stats.completed,
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
              title: 'Pending',
              value: stats.pending,
              change: -2.1,
              changeType: 'negative',
              format: 'number',
              color: 'yellow',
              icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )
            },
            {
              title: 'Total Revenue',
              value: stats.totalRevenue,
              change: 15.2,
              changeType: 'positive',
              format: 'currency',
              color: 'purple',
              icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              )
            }
          ]}
          columns={4}
        />

        {/* Filters */}
        <Card className="mt-8">
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                <SearchBar
                  value={searchTerm}
                  onChange={setSearchTerm}
                  placeholder="Search transactions..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <Dropdown
                  value={statusFilter}
                  onChange={setStatusFilter}
                  options={[
                    { value: 'all', label: 'All Statuses' },
                    { value: 'completed', label: 'Completed' },
                    { value: 'pending', label: 'Pending' },
                    { value: 'cancelled', label: 'Cancelled' },
                    { value: 'refunded', label: 'Refunded' }
                  ]}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
                <Dropdown
                  value={paymentMethodFilter}
                  onChange={setPaymentMethodFilter}
                  options={[
                    { value: 'all', label: 'All Methods' },
                    { value: 'credit_card', label: 'Credit Card' },
                    { value: 'debit_card', label: 'Debit Card' },
                    { value: 'cash', label: 'Cash' }
                  ]}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
                <DatePicker
                  value={dateRange}
                  onChange={setDateRange}
                  placeholder="Select date range"
                  range={true}
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Bulk Actions */}
        {selectedTransactions.length > 0 && (
          <Card className="mt-6">
            <div className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">
                  {selectedTransactions.length} transaction(s) selected
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleBulkAction('export')}
                  >
                    Export
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleBulkAction('mark_completed')}
                  >
                    Mark Completed
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleBulkAction('delete')}
                    className="text-red-600 hover:text-red-800"
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Results */}
        <Card className="mt-6">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                {filteredTransactions.length} transaction(s) found
              </h3>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Sort by:</span>
                <Dropdown
                  value={sortBy}
                  onChange={setSortBy}
                  options={[
                    { value: 'date', label: 'Date' },
                    { value: 'amount', label: 'Amount' },
                    { value: 'customerName', label: 'Customer' },
                    { value: 'status', label: 'Status' }
                  ]}
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')}
                >
                  {sortDirection === 'asc' ? '↑' : '↓'}
                </Button>
              </div>
            </div>

            {viewMode === 'table' ? renderTransactionTable() : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {paginatedTransactions.map(renderTransactionCard)}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-6 flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, sortedTransactions.length)} of {sortedTransactions.length} results
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-gray-500">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}

export default TransactionList
