import React, { useState, useEffect } from 'react'
import { Card, Button, Tabs, Table, SearchBar, Dropdown, Badge, Modal, Alert } from '../../../components'
import { LineChart, BarChart, DonutChart } from '../../../components'
import reportService from '../../../services/report/reportService'
import { toast } from 'react-hot-toast'

const AdminReports = () => {
  const [reports, setReports] = useState([])
  const [filteredReports, setFilteredReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState(0)
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [selectedReport, setSelectedReport] = useState(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    fetchReports()
  }, [])

  useEffect(() => {
    filterReports()
  }, [reports, searchTerm, typeFilter, statusFilter])

  const fetchReports = async () => {
    try {
      setLoading(true)
      
      const result = await reportService.getReports()
      
      if (result.success) {
        setReports(result.data)
        toast.success('Reports loaded successfully!')
      } else {
        toast.error(result.error || 'Failed to load reports')
        console.error('Reports error:', result.error)
      }
    } catch (error) {
      console.error('Error fetching reports:', error)
      toast.error('An unexpected error occurred while loading reports')
    } finally {
      setLoading(false)
    }
  }
      
        },
        {
          id: '2',
          name: 'Revenue Summary Report',
          type: 'financial',
          category: 'financial',
          status: 'completed',
          createdBy: 'Admin User',
          createdAt: '2024-01-19',
          lastRun: '2024-01-19',
          nextRun: '2024-01-26',
          schedule: 'weekly',
          fileSize: '1.8 MB',
          recordCount: 890,
          parameters: {
            dateRange: '2024-01-15 to 2024-01-19',
            currency: 'USD',
            includeTaxes: true
          }
        },
        {
          id: '3',
          name: 'Staff Performance Analysis',
          type: 'staff_analytics',
          category: 'hr',
          status: 'running',
          createdBy: 'HR Manager',
          createdAt: '2024-01-21',
          lastRun: null,
          nextRun: '2024-01-28',
          schedule: 'weekly',
          fileSize: null,
          recordCount: null,
          parameters: {
            dateRange: '2024-01-01 to 2024-01-21',
            departments: 'all',
            includePartTime: true
          }
        },
        {
          id: '4',
          name: 'Customer Satisfaction Survey',
          type: 'customer_feedback',
          category: 'customer',
          status: 'failed',
          createdBy: 'Customer Service',
          createdAt: '2024-01-18',
          lastRun: '2024-01-18',
          nextRun: '2024-01-25',
          schedule: 'weekly',
          fileSize: null,
          recordCount: null,
          parameters: {
            dateRange: '2024-01-10 to 2024-01-18',
            surveyType: 'satisfaction',
            minResponses: 10
          }
        },
        {
          id: '5',
          name: 'Appointment Booking Trends',
          type: 'appointment_analytics',
          category: 'analytics',
          status: 'completed',
          createdBy: 'System',
          createdAt: '2024-01-17',
          lastRun: '2024-01-17',
          nextRun: '2024-01-24',
          schedule: 'weekly',
          fileSize: '3.2 MB',
          recordCount: 2100,
          parameters: {
            dateRange: '2024-01-10 to 2024-01-17',
            businessType: 'salon,spa',
            includeCancelled: false
          }
        }
      ]
      
    } catch (error) {
      console.error('Error fetching reports:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterReports = () => {
    let filtered = reports

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(report =>
        report?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report?.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report?.createdBy?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Type filter
    if (typeFilter) {
      filtered = filtered.filter(report => report?.category === typeFilter)
    }

    // Status filter
    if (statusFilter) {
      filtered = filtered.filter(report => report?.status === statusFilter)
    }

    setFilteredReports(filtered)
  }

  const handleDelete = async () => {
    if (!selectedReport) return

    try {
      setDeleting(true)
      // Simulate API call
      
      setReports(prev => prev.filter(r => r.id !== selectedReport.id))
      setShowDeleteModal(false)
      setSelectedReport(null)
    } catch (error) {
      console.error('Error deleting report:', error)
    } finally {
      setDeleting(false)
    }
  }

  const handleRunReport = async (reportId) => {
    try {
      // Simulate API call
      
      setReports(prev => prev.map(report =>
        report?.id === reportId
          ? { ...report, status: 'completed', lastRun: new Date().toISOString().split('T')[0] }
          : report
      ))
    } catch (error) {
      console.error('Error running report:', error)
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'Never'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'success'
      case 'running': return 'warning'
      case 'failed': return 'danger'
      case 'scheduled': return 'info'
      default: return 'default'
    }
  }

  const getTypeColor = (type) => {
    switch (type) {
      case 'analytics': return 'blue'
      case 'financial': return 'green'
      case 'hr': return 'purple'
      case 'customer': return 'orange'
      default: return 'default'
    }
  }

  const typeOptions = [
    { label: 'All Types', value: '' },
    { label: 'Analytics', value: 'analytics' },
    { label: 'Financial', value: 'financial' },
    { label: 'HR', value: 'hr' },
    { label: 'Customer', value: 'customer' }
  ]

  const statusOptions = [
    { label: 'All Statuses', value: '' },
    { label: 'Completed', value: 'completed' },
    { label: 'Running', value: 'running' },
    { label: 'Failed', value: 'failed' },
    { label: 'Scheduled', value: 'scheduled' }
  ]

  const tabs = [
    { label: 'All Reports', content: 'reports' },
    { label: 'Analytics', content: 'analytics' },
    { label: 'Financial', content: 'financial' },
    { label: 'HR', content: 'hr' }
  ]

  const renderReports = () => (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <SearchBar
                onSearch={(term) => setSearchTerm(term)}
                placeholder="Search reports..."
                debounceTime={300}
              />
            </div>
            <div>
              <Dropdown
                options={typeOptions}
                value={typeFilter}
                onChange={setTypeFilter}
                placeholder="Filter by type"
                optionLabel="label"
                optionValue="value"
                clearable
              />
            </div>
            <div>
              <Dropdown
                options={statusOptions}
                value={statusFilter}
                onChange={setStatusFilter}
                placeholder="Filter by status"
                optionLabel="label"
                optionValue="value"
                clearable
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Results Summary */}
      <div className="mb-4">
        <p className="text-sm text-gray-600">
          Showing {filteredReports.length} of {reports.length} reports
        </p>
      </div>

      {/* Reports Table */}
      <Card>
        <div className="p-6">
          <Table
            data={filteredReports}
            columns={[
              {
                key: 'name',
                label: 'Report Name',
                sortable: true,
                render: (report) => (
                  <div>
                    <p className="font-medium text-gray-900">{report?.name || 'N/A'}</p>
                    <p className="text-sm text-gray-500">{report?.type?.replace(/_/g, ' ') || 'N/A'}</p>
                  </div>
                )
              },
              {
                key: 'category',
                label: 'Category',
                sortable: true,
                render: (report) => (
                  <Badge variant={getTypeColor(report?.category)} size="sm">
                    {report?.category || 'N/A'}
                  </Badge>
                )
              },
              {
                key: 'status',
                label: 'Status',
                sortable: true,
                render: (report) => (
                  <Badge variant={getStatusColor(report?.status)} size="sm">
                    {report?.status || 'N/A'}
                  </Badge>
                )
              },
              {
                key: 'createdBy',
                label: 'Created By',
                sortable: true,
                render: (report) => report?.createdBy || 'N/A'
              },
              {
                key: 'lastRun',
                label: 'Last Run',
                sortable: true,
                render: (report) => formatDate(report?.lastRun)
              },
              {
                key: 'schedule',
                label: 'Schedule',
                sortable: true,
                render: (report) => (
                  <span className="text-sm text-gray-600 capitalize">
                    {report?.schedule || 'N/A'}
                  </span>
                )
              },
              {
                key: 'fileSize',
                label: 'Size',
                sortable: true,
                render: (report) => report?.fileSize || '-'
              },
              {
                key: 'actions',
                label: 'Actions',
                render: (report) => (
                  <div className="flex gap-2">
                    {report?.status === 'completed' && (
                      <Button variant="outline" size="sm">Download</Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRunReport(report?.id)}
                      disabled={report?.status === 'running'}
                    >
                      {report?.status === 'running' ? 'Running...' : 'Run'}
                    </Button>
                    <Button variant="outline" size="sm">Edit</Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => {
                        setSelectedReport(report)
                        setShowDeleteModal(true)
                      }}
                    >
                      Delete
                    </Button>
                  </div>
                )
              }
            ]}
            onSort={(key, direction) => {
              console.log('Sort by:', key, direction)
            }}
            sortable={true}
            loading={loading}
            emptyMessage="No reports found matching your criteria."
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
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Report Types Distribution</h3>
            <DonutChart
              data={[
                { name: 'Analytics', count: 15, percentage: 40 },
                { name: 'Financial', count: 8, percentage: 21 },
                { name: 'HR', count: 7, percentage: 18 },
                { name: 'Customer', count: 8, percentage: 21 }
              ]}
              centerText="Reports"
              centerValue="38"
              showLegend={true}
              width="300px"
              height="300px"
            />
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Report Status Overview</h3>
            <BarChart
              data={[
                { label: 'Completed', value: 25 },
                { label: 'Running', value: 3 },
                { label: 'Failed', value: 2 },
                { label: 'Scheduled', value: 8 }
              ]}
              height="300px"
              showLegend={true}
            />
          </div>
        </Card>
      </div>

      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Report Generation Trends</h3>
          <LineChart
            data={[
              {
                label: 'Reports Generated',
                data: [12, 15, 18, 22, 19, 25, 28],
                labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6', 'Week 7']
              }
            ]}
            height="300px"
            showLegend={true}
          />
        </div>
      </Card>
    </div>
  )

  const renderFinancial = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <div className="p-6 text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Total Revenue</h3>
            <p className="text-3xl font-bold text-green-600 mt-2">$125,000</p>
            <p className="text-sm text-gray-500 mt-1">+12.5% from last month</p>
          </div>
        </Card>

        <Card>
          <div className="p-6 text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Total Transactions</h3>
            <p className="text-3xl font-bold text-blue-600 mt-2">2,450</p>
            <p className="text-sm text-gray-500 mt-1">+8.3% from last month</p>
          </div>
        </Card>

        <Card>
          <div className="p-6 text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Average Transaction</h3>
            <p className="text-3xl font-bold text-purple-600 mt-2">$51.02</p>
            <p className="text-sm text-gray-500 mt-1">+2.1% from last month</p>
          </div>
        </Card>
      </div>

      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue by Business Type</h3>
          <BarChart
            data={[
              { label: 'Salon', value: 45000 },
              { label: 'Spa', value: 38000 },
              { label: 'Hotel', value: 32000 },
              { label: 'Clinic', value: 10000 }
            ]}
            height="300px"
            showLegend={true}
          />
        </div>
      </Card>
    </div>
  )

  const renderHR = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <div className="p-6 text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Total Managers</h3>
            <p className="text-3xl font-bold text-blue-600 mt-2">89</p>
            <p className="text-sm text-gray-500 mt-1">+5 from last month</p>
          </div>
        </Card>

        <Card>
          <div className="p-6 text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Total Staff</h3>
            <p className="text-3xl font-bold text-green-600 mt-2">234</p>
            <p className="text-sm text-gray-500 mt-1">+12 from last month</p>
          </div>
        </Card>

        <Card>
          <div className="p-6 text-center">
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Avg Rating</h3>
            <p className="text-3xl font-bold text-yellow-600 mt-2">4.7</p>
            <p className="text-sm text-gray-500 mt-1">+0.2 from last month</p>
          </div>
        </Card>

        <Card>
          <div className="p-6 text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Turnover Rate</h3>
            <p className="text-3xl font-bold text-red-600 mt-2">8.5%</p>
            <p className="text-sm text-gray-500 mt-1">-2.1% from last month</p>
          </div>
        </Card>
      </div>

      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Staff Distribution by Role</h3>
          <DonutChart
            data={[
              { name: 'Managers', count: 89, percentage: 27 },
              { name: 'Stylists', count: 78, percentage: 24 },
              { name: 'Therapists', count: 45, percentage: 14 },
              { name: 'Receptionists', count: 22, percentage: 7 }
            ]}
            centerText="Staff"
            centerValue="234"
            showLegend={true}
            width="300px"
            height="300px"
          />
        </div>
      </Card>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
              <p className="mt-2 text-gray-600">
                Generate and manage system reports
              </p>
            </div>
            <Button variant="primary">
              Create New Report
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs
          tabs={tabs}
          defaultActiveTab={0}
          onTabChange={(index) => setActiveTab(index)}
        >
          {renderReports()}
          {renderAnalytics()}
          {renderFinancial()}
          {renderHR()}
        </Tabs>

        {/* Delete Confirmation Modal */}
        <Modal
          isOpen={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false)
            setSelectedReport(null)
          }}
          title="Delete Report"
          size="md"
        >
          <div className="space-y-4">
            <Alert
              type="error"
              title="Are you sure you want to delete this report?"
              message={`This action cannot be undone. The report "${selectedReport?.name}" and all its data will be permanently removed.`}
            />
            
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setShowDeleteModal(false)
                  setSelectedReport(null)
                }}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                loading={deleting}
                onClick={handleDelete}
              >
                {deleting ? 'Deleting...' : 'Delete Report'}
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  )
}

export default AdminReports
