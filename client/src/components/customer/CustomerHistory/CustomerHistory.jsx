import React, { useState, useMemo } from 'react'
import { Card, Button, Badge, Tabs, Input, Dropdown, Pagination, LoadingSpinner } from '../../common'

const CustomerHistory = ({ 
  customer,
  appointments = [],
  transactions = [],
  loading = false,
  onAppointmentClick,
  onTransactionClick,
  onBookAppointment,
  className = ''
}) => {
  const [activeTab, setActiveTab] = useState(0)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [dateFilter, setDateFilter] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatDateTime = (dateString, timeString) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    const time = timeString ? timeString : ''
    return `${formatDate(dateString)} ${time}`
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0)
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'success'
      case 'cancelled': return 'danger'
      case 'no-show': return 'warning'
      case 'pending': return 'info'
      case 'paid': return 'success'
      case 'pending_payment': return 'warning'
      case 'refunded': return 'default'
      default: return 'default'
    }
  }

  // Filter and sort appointments
  const filteredAppointments = useMemo(() => {
    let filtered = appointments.filter(appointment => {
      const matchesSearch = appointment.service?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           appointment.staff?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           appointment.notes?.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesStatus = !statusFilter || appointment.status === statusFilter
      
      const matchesDate = !dateFilter || 
        (dateFilter === 'today' && new Date(appointment.date).toDateString() === new Date().toDateString()) ||
        (dateFilter === 'this_week' && isThisWeek(new Date(appointment.date))) ||
        (dateFilter === 'this_month' && isThisMonth(new Date(appointment.date))) ||
        (dateFilter === 'last_month' && isLastMonth(new Date(appointment.date)))
      
      return matchesSearch && matchesStatus && matchesDate
    })

    // Sort by date (newest first)
    filtered.sort((a, b) => new Date(b.date) - new Date(a.date))

    return filtered
  }, [appointments, searchTerm, statusFilter, dateFilter])

  // Filter and sort transactions
  const filteredTransactions = useMemo(() => {
    let filtered = transactions.filter(transaction => {
      const matchesSearch = transaction.service?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           transaction.description?.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesStatus = !statusFilter || transaction.status === statusFilter
      
      const matchesDate = !dateFilter || 
        (dateFilter === 'today' && new Date(transaction.date).toDateString() === new Date().toDateString()) ||
        (dateFilter === 'this_week' && isThisWeek(new Date(transaction.date))) ||
        (dateFilter === 'this_month' && isThisMonth(new Date(transaction.date))) ||
        (dateFilter === 'last_month' && isLastMonth(new Date(transaction.date)))
      
      return matchesSearch && matchesStatus && matchesDate
    })

    // Sort by date (newest first)
    filtered.sort((a, b) => new Date(b.date) - new Date(a.date))

    return filtered
  }, [transactions, searchTerm, statusFilter, dateFilter])

  // Helper functions for date filtering
  const isThisWeek = (date) => {
    const now = new Date()
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()))
    const endOfWeek = new Date(now.setDate(now.getDate() - now.getDay() + 6))
    return date >= startOfWeek && date <= endOfWeek
  }

  const isThisMonth = (date) => {
    const now = new Date()
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()
  }

  const isLastMonth = (date) => {
    const now = new Date()
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0)
    return date >= lastMonth && date <= endOfLastMonth
  }

  // Pagination
  const currentData = activeTab === 0 ? filteredAppointments : filteredTransactions
  const totalPages = Math.ceil(currentData.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedData = currentData.slice(startIndex, startIndex + itemsPerPage)

  const statusOptions = [
    { label: 'All Statuses', value: '' },
    { label: 'Completed', value: 'completed' },
    { label: 'Cancelled', value: 'cancelled' },
    { label: 'No Show', value: 'no-show' },
    { label: 'Pending', value: 'pending' },
    { label: 'Paid', value: 'paid' },
    { label: 'Pending Payment', value: 'pending_payment' },
    { label: 'Refunded', value: 'refunded' }
  ]

  const dateOptions = [
    { label: 'All Dates', value: '' },
    { label: 'Today', value: 'today' },
    { label: 'This Week', value: 'this_week' },
    { label: 'This Month', value: 'this_month' },
    { label: 'Last Month', value: 'last_month' }
  ]

  const tabs = [
    { 
      label: `Appointments (${filteredAppointments.length})`, 
      content: 'appointments' 
    },
    { 
      label: `Transactions (${filteredTransactions.length})`, 
      content: 'transactions' 
    }
  ]

  const renderAppointmentCard = (appointment, index) => (
    <Card key={index} className="hover:shadow-md transition-shadow">
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h4 className="font-medium text-gray-900">{appointment.service}</h4>
              <Badge variant={getStatusColor(appointment.status)}>
                {appointment.status?.replace('_', ' ').toUpperCase()}
              </Badge>
            </div>
            
            <div className="space-y-1 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>{formatDateTime(appointment.date, appointment.time)}</span>
              </div>
              
              {appointment.staff && (
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span>with {appointment.staff}</span>
                </div>
              )}
              
              {appointment.duration && (
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{appointment.duration} minutes</span>
                </div>
              )}
              
              {appointment.amount && (
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                  <span>{formatCurrency(appointment.amount)}</span>
                </div>
              )}
            </div>
            
            {appointment.notes && (
              <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                {appointment.notes}
              </p>
            )}
          </div>
          
          {onAppointmentClick && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onAppointmentClick(appointment)}
            >
              View Details
            </Button>
          )}
        </div>
      </div>
    </Card>
  )

  const renderTransactionCard = (transaction, index) => (
    <Card key={index} className="hover:shadow-md transition-shadow">
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h4 className="font-medium text-gray-900">{transaction.service}</h4>
              <Badge variant={getStatusColor(transaction.status)}>
                {transaction.status?.replace('_', ' ').toUpperCase()}
              </Badge>
            </div>
            
            <div className="space-y-1 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>{formatDate(transaction.date)}</span>
              </div>
              
              {transaction.description && (
                <p className="text-sm text-gray-600 mt-1">
                  {transaction.description}
                </p>
              )}
            </div>
          </div>
          
          <div className="text-right">
            <p className="text-lg font-semibold text-gray-900">
              {formatCurrency(transaction.amount)}
            </p>
            {onTransactionClick && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onTransactionClick(transaction)}
                className="mt-2"
              >
                View Details
              </Button>
            )}
          </div>
        </div>
      </div>
    </Card>
  )

  if (loading) {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className={className}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Customer History</h2>
          <p className="text-gray-600">
            {customer ? `${customer.name}'s appointment and transaction history` : 'Customer history'}
          </p>
        </div>
        {onBookAppointment && customer && (
          <Button
            variant="primary"
            onClick={() => onBookAppointment(customer)}
          >
            Book New Appointment
          </Button>
        )}
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <div className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <Input
                type="text"
                placeholder="Search appointments and transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="w-full lg:w-48">
              <Dropdown
                options={statusOptions}
                value={statusFilter}
                onChange={setStatusFilter}
                placeholder="Filter by status"
                optionLabel="label"
                optionValue="value"
              />
            </div>
            
            <div className="w-full lg:w-48">
              <Dropdown
                options={dateOptions}
                value={dateFilter}
                onChange={setDateFilter}
                placeholder="Filter by date"
                optionLabel="label"
                optionValue="value"
              />
            </div>
            
            <div className="w-full lg:w-32">
              <Dropdown
                options={[
                  { label: '10 per page', value: '10' },
                  { label: '20 per page', value: '20' },
                  { label: '50 per page', value: '50' }
                ]}
                value={itemsPerPage.toString()}
                onChange={(value) => setItemsPerPage(parseInt(value))}
                placeholder="Per page"
                optionLabel="label"
                optionValue="value"
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Tabs */}
      <Tabs
        tabs={tabs}
        defaultActiveTab={0}
        onTabChange={(index) => {
          setActiveTab(index)
          setCurrentPage(1)
        }}
      >
        {/* Appointments Tab */}
        <div className="space-y-4">
          {paginatedData.length > 0 ? (
            paginatedData.map((item, index) => 
              activeTab === 0 ? renderAppointmentCard(item, index) : renderTransactionCard(item, index)
            )
          ) : (
            <Card>
              <div className="p-12 text-center">
                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No {activeTab === 0 ? 'appointments' : 'transactions'} found
                </h3>
                <p className="text-gray-600 mb-4">
                  {searchTerm || statusFilter || dateFilter
                    ? 'Try adjusting your search criteria or filters.'
                    : `No ${activeTab === 0 ? 'appointments' : 'transactions'} recorded yet.`
                  }
                </p>
                {onBookAppointment && customer && activeTab === 0 && (
                  <Button
                    variant="primary"
                    onClick={() => onBookAppointment(customer)}
                  >
                    Book First Appointment
                  </Button>
                )}
              </div>
            </Card>
          )}
        </div>

        {/* Transactions Tab */}
        <div className="space-y-4">
          {paginatedData.length > 0 ? (
            paginatedData.map((item, index) => 
              activeTab === 0 ? renderAppointmentCard(item, index) : renderTransactionCard(item, index)
            )
          ) : (
            <Card>
              <div className="p-12 text-center">
                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No transactions found</h3>
                <p className="text-gray-600">
                  {searchTerm || statusFilter || dateFilter
                    ? 'Try adjusting your search criteria or filters.'
                    : 'No transactions recorded yet.'
                  }
                </p>
              </div>
            </Card>
          )}
        </div>
      </Tabs>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6">
          <div className="text-sm text-gray-600">
            Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, currentData.length)} of {currentData.length} {activeTab === 0 ? 'appointments' : 'transactions'}
          </div>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            showFirstLast
            showPrevNext
          />
        </div>
      )}
    </div>
  )
}

export default CustomerHistory
