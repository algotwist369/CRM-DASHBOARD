import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Card, Button, Badge, Table, StatCard, StatCardGrid, SearchBar, Dropdown, DatePicker, Alert } from '../../../../components'
import { LineChart, BarChart } from '../../../../components'
import dailyBusinessService from '../../../../services/dailyBusiness/dailyBusinessService'
import { toast } from 'react-hot-toast'

const DailyBusinessList = () => {
  const [dailyBusiness, setDailyBusiness] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [dateRange, setDateRange] = useState({ start: null, end: null })
  const [sortBy, setSortBy] = useState('date')
  const [sortDirection, setSortDirection] = useState('desc')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  const [selectedItems, setSelectedItems] = useState([])
  const [viewMode, setViewMode] = useState('table') // 'table' or 'card'

  useEffect(() => {
    fetchDailyBusiness()
  }, [])

  const fetchDailyBusiness = async () => {
    try {
      setLoading(true)
      
      const result = await dailyBusinessService.getDailyBusinessRecords()
      
      if (result.success) {
        setDailyBusiness(result.data)
        toast.success('Daily business records loaded successfully!')
      } else {
        toast.error(result.error || 'Failed to load daily business records')
        console.error('Daily business error:', result.error)
      }
    } catch (error) {
      console.error('Error fetching daily business records:', error)
      toast.error('An unexpected error occurred while loading daily business records')
    } finally {
      setLoading(false)
    }
  }
      
      ]
      
    } catch (error) {
      console.error('Error fetching daily business:', error)
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'success'
      case 'in_progress': return 'warning'
      case 'closed': return 'danger'
      case 'pending': return 'info'
      default: return 'default'
    }
  }

  const filteredDailyBusiness = dailyBusiness.filter(item => {
    const matchesSearch = item.date.includes(searchTerm) ||
                         item.notes.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter
    
    const matchesDateRange = !dateRange.start || !dateRange.end || 
                           (new Date(item.date) >= dateRange.start && new Date(item.date) <= dateRange.end)
    
    return matchesSearch && matchesStatus && matchesDateRange
  })

  const sortedDailyBusiness = [...filteredDailyBusiness].sort((a, b) => {
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

  const paginatedDailyBusiness = sortedDailyBusiness.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const totalPages = Math.ceil(sortedDailyBusiness.length / itemsPerPage)

  const handleSelectItem = (itemId) => {
    setSelectedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    )
  }

  const handleSelectAll = () => {
    if (selectedItems.length === paginatedDailyBusiness.length) {
      setSelectedItems([])
    } else {
      setSelectedItems(paginatedDailyBusiness.map(item => item.id))
    }
  }

  const handleBulkAction = (action) => {
    console.log('Bulk action:', action, selectedItems)
    // Implement bulk actions
  }

  const calculateStats = () => {
    const completed = dailyBusiness.filter(item => item.status === 'completed')
    const totalRevenue = completed.reduce((sum, item) => sum + item.totalRevenue, 0)
    const totalCustomers = completed.reduce((sum, item) => sum + item.totalCustomers, 0)
    const totalAppointments = completed.reduce((sum, item) => sum + item.totalAppointments, 0)
    const averageDailyRevenue = completed.length > 0 ? totalRevenue / completed.length : 0
    
    return {
      total: dailyBusiness.length,
      completed: completed.length,
      totalRevenue,
      totalCustomers,
      totalAppointments,
      averageDailyRevenue
    }
  }

  const stats = calculateStats()

  const renderDailyBusinessCard = (item) => (
    <Card key={item.id} className="hover:shadow-lg transition-shadow">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{formatDate(item.date)}</h3>
            <Badge variant={getStatusColor(item.status)} size="sm" className="mt-1">
              {item.status}
            </Badge>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(item.totalRevenue)}</p>
            <p className="text-sm text-gray-500">Revenue</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-sm text-gray-500">Customers</p>
            <p className="text-lg font-semibold text-gray-900">{item.totalCustomers}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Appointments</p>
            <p className="text-lg font-semibold text-gray-900">{item.totalAppointments}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Profit</p>
            <p className="text-lg font-semibold text-gray-900">{formatCurrency(item.profit)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Staff Hours</p>
            <p className="text-lg font-semibold text-gray-900">{item.staffHours}h</p>
          </div>
        </div>

        {item.notes && (
          <p className="text-sm text-gray-600 mb-4">{item.notes}</p>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={selectedItems.includes(item.id)}
              onChange={() => handleSelectItem(item.id)}
              className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <span className="text-sm text-gray-500">Select</span>
          </div>
          <div className="flex items-center gap-2">
            <Link to={`/manager/daily-business/${item.id}`}>
              <Button variant="outline" size="sm">View</Button>
            </Link>
            <Button variant="outline" size="sm">Edit</Button>
            <Button variant="outline" size="sm" className="text-red-600 hover:text-red-800">
              Delete
            </Button>
          </div>
        </div>
      </div>
    </Card>
  )

  const renderDailyBusinessTable = () => (
    <Table
      data={paginatedDailyBusiness}
      columns={[
        {
          key: 'select',
          label: (
            <input
              type="checkbox"
              checked={selectedItems.length === paginatedDailyBusiness.length && paginatedDailyBusiness.length > 0}
              onChange={handleSelectAll}
              className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
          ),
          render: (item) => (
            <input
              type="checkbox"
              checked={selectedItems.includes(item.id)}
              onChange={() => handleSelectItem(item.id)}
              className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
          )
        },
        {
          key: 'date',
          label: 'Date',
          sortable: true,
          render: (item) => (
            <Link 
              to={`/manager/daily-business/${item.id}`}
              className="text-primary-600 hover:text-primary-800 font-medium"
            >
              {formatDate(item.date)}
            </Link>
          )
        },
        {
          key: 'totalRevenue',
          label: 'Revenue',
          sortable: true,
          render: (item) => (
            <div className="text-right">
              <p className="font-medium text-gray-900">{formatCurrency(item.totalRevenue)}</p>
              <p className="text-sm text-gray-500">{item.totalTransactions} transactions</p>
            </div>
          )
        },
        {
          key: 'totalCustomers',
          label: 'Customers',
          sortable: true,
          render: (item) => (
            <div className="text-center">
              <p className="font-medium text-gray-900">{item.totalCustomers}</p>
              <p className="text-sm text-gray-500">{item.totalAppointments} appointments</p>
            </div>
          )
        },
        {
          key: 'profit',
          label: 'Profit',
          sortable: true,
          render: (item) => (
            <div className="text-right">
              <p className="font-medium text-gray-900">{formatCurrency(item.profit)}</p>
              <p className="text-sm text-gray-500">Expenses: {formatCurrency(item.expenses)}</p>
            </div>
          )
        },
        {
          key: 'staffHours',
          label: 'Staff Hours',
          sortable: true,
          render: (item) => (
            <div className="text-center">
              <p className="font-medium text-gray-900">{item.staffHours}h</p>
              <p className="text-sm text-gray-500">Avg: {item.totalCustomers > 0 ? (item.staffHours / item.totalCustomers).toFixed(1) : 0}h/customer</p>
            </div>
          )
        },
        {
          key: 'status',
          label: 'Status',
          sortable: true,
          render: (item) => (
            <Badge variant={getStatusColor(item.status)} size="sm">
              {item.status}
            </Badge>
          )
        },
        {
          key: 'actions',
          label: 'Actions',
          render: (item) => (
            <div className="flex items-center gap-2">
              <Link to={`/manager/daily-business/${item.id}`}>
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
          <p className="text-gray-600">Loading daily business data...</p>
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
              <h1 className="text-3xl font-bold text-gray-900">Daily Business</h1>
              <p className="text-gray-600 mt-1">Track and manage daily business operations and performance</p>
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
              <Link to="/manager/daily-business/add">
                <Button variant="primary">Add Daily Business</Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Stats */}
        <StatCardGrid
          stats={[
            {
              title: 'Total Days',
              value: stats.total,
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
              title: 'Total Revenue',
              value: stats.totalRevenue,
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
              title: 'Total Customers',
              value: stats.totalCustomers,
              change: 15.2,
              changeType: 'positive',
              format: 'number',
              color: 'yellow',
              icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              )
            },
            {
              title: 'Avg Daily Revenue',
              value: stats.averageDailyRevenue,
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

        {/* Filters */}
        <Card className="mt-8">
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                <SearchBar
                  value={searchTerm}
                  onChange={setSearchTerm}
                  placeholder="Search daily business..."
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
                    { value: 'in_progress', label: 'In Progress' },
                    { value: 'closed', label: 'Closed' },
                    { value: 'pending', label: 'Pending' }
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
        {selectedItems.length > 0 && (
          <Card className="mt-6">
            <div className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">
                  {selectedItems.length} item(s) selected
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
                {filteredDailyBusiness.length} day(s) found
              </h3>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Sort by:</span>
                <Dropdown
                  value={sortBy}
                  onChange={setSortBy}
                  options={[
                    { value: 'date', label: 'Date' },
                    { value: 'totalRevenue', label: 'Revenue' },
                    { value: 'totalCustomers', label: 'Customers' },
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

            {viewMode === 'table' ? renderDailyBusinessTable() : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {paginatedDailyBusiness.map(renderDailyBusinessCard)}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-6 flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, sortedDailyBusiness.length)} of {sortedDailyBusiness.length} results
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

export default DailyBusinessList
