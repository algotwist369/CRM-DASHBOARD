import React, { useState, useEffect } from 'react'
import { Card, Button, Dropdown, DatePicker, Alert } from '../../../components'
import { LineChart, BarChart, PieChart } from '../../../components'
import { ReportCard, ReportFilters, ExportOptions } from '../../../components'
import reportService from '../../../services/report/reportService'
import { toast } from 'react-hot-toast'

const ManagerReports = () => {
  const [loading, setLoading] = useState(true)
  const [selectedReport, setSelectedReport] = useState('overview')
  const [dateRange, setDateRange] = useState({ start: null, end: null })
  const [filters, setFilters] = useState({
    staff: 'all',
    service: 'all',
    customer: 'all'
  })
  const [reportData, setReportData] = useState(null)

  useEffect(() => {
    fetchReportData()
  }, [selectedReport, dateRange, filters])

  const fetchReportData = async () => {
    try {
      setLoading(true)
      
      const result = await reportService.getAnalytics()
      
      if (result.success) {
        setReportData(result.data)
        toast.success('Report data loaded successfully!')
      } else {
        toast.error(result.error || 'Failed to load report data')
        console.error('Report data error:', result.error)
      }
    } catch (error) {
      console.error('Error fetching report data:', error)
      toast.error('An unexpected error occurred while loading report data')
    } finally {
      setLoading(false)
    }
  }
      
  }

    const baseData = {
      overview: {
        title: 'Business Overview',
        description: 'Comprehensive overview of business performance',
        metrics: [
          { label: 'Total Revenue', value: 125000, change: 12.5, changeType: 'positive', format: 'currency' },
          { label: 'Total Customers', value: 1250, change: 8.3, changeType: 'positive', format: 'number' },
          { label: 'Total Appointments', value: 2500, change: 15.2, changeType: 'positive', format: 'number' },
          { label: 'Average Rating', value: 4.8, change: 0.2, changeType: 'positive', format: 'rating' }
        ],
        charts: [
          {
            type: 'line',
            title: 'Revenue Trends',
            data: [
              {
                label: 'Revenue',
                data: [8000, 9500, 11000, 12500, 9800, 7500, 11000],
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul']
              }
            ]
          },
          {
            type: 'bar',
            title: 'Monthly Performance',
            data: [
              { label: 'Appointments', value: 2500 },
              { label: 'Customers', value: 1250 },
              { label: 'Revenue', value: 125000 }
            ]
          }
        ]
      },
      staff: {
        title: 'Staff Performance',
        description: 'Detailed analysis of staff performance and productivity',
        metrics: [
          { label: 'Total Staff', value: 8, change: 0, changeType: 'neutral', format: 'number' },
          { label: 'Average Appointments/Staff', value: 312, change: 5.2, changeType: 'positive', format: 'number' },
          { label: 'Average Revenue/Staff', value: 15625, change: 8.7, changeType: 'positive', format: 'currency' },
          { label: 'Staff Satisfaction', value: 4.6, change: 0.1, changeType: 'positive', format: 'rating' }
        ],
        charts: [
          {
            type: 'bar',
            title: 'Staff Revenue Comparison',
            data: [
              { label: 'Emma Wilson', value: 25000 },
              { label: 'Michael Brown', value: 22000 },
              { label: 'Lisa Garcia', value: 20000 },
              { label: 'David Lee', value: 18000 }
            ]
          },
          {
            type: 'pie',
            title: 'Staff Appointment Distribution',
            data: [
              { label: 'Emma Wilson', value: 35 },
              { label: 'Michael Brown', value: 30 },
              { label: 'Lisa Garcia', value: 20 },
              { label: 'David Lee', value: 15 }
            ]
          }
        ]
      },
      customers: {
        title: 'Customer Analytics',
        description: 'Customer behavior and satisfaction analysis',
        metrics: [
          { label: 'Total Customers', value: 1250, change: 12.5, changeType: 'positive', format: 'number' },
          { label: 'New Customers', value: 150, change: 8.3, changeType: 'positive', format: 'number' },
          { label: 'Customer Retention', value: 85, change: 2.1, changeType: 'positive', format: 'percentage' },
          { label: 'Average LTV', value: 1250, change: 15.2, changeType: 'positive', format: 'currency' }
        ],
        charts: [
          {
            type: 'line',
            title: 'Customer Growth',
            data: [
              {
                label: 'New Customers',
                data: [120, 135, 150, 140, 160, 155, 150],
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul']
              }
            ]
          },
          {
            type: 'bar',
            title: 'Customer Segments',
            data: [
              { label: 'VIP', value: 125 },
              { label: 'Regular', value: 750 },
              { label: 'New', value: 150 },
              { label: 'Inactive', value: 225 }
            ]
          }
        ]
      },
      appointments: {
        title: 'Appointment Analysis',
        description: 'Appointment trends and scheduling efficiency',
        metrics: [
          { label: 'Total Appointments', value: 2500, change: 15.2, changeType: 'positive', format: 'number' },
          { label: 'Completed', value: 2400, change: 14.8, changeType: 'positive', format: 'number' },
          { label: 'No Shows', value: 50, change: -5.2, changeType: 'negative', format: 'number' },
          { label: 'Cancellations', value: 50, change: -2.1, changeType: 'negative', format: 'number' }
        ],
        charts: [
          {
            type: 'line',
            title: 'Appointment Trends',
            data: [
              {
                label: 'Appointments',
                data: [200, 250, 300, 350, 400, 380, 420],
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul']
              }
            ]
          },
          {
            type: 'pie',
            title: 'Appointment Status',
            data: [
              { label: 'Completed', value: 96 },
              { label: 'No Show', value: 2 },
              { label: 'Cancelled', value: 2 }
            ]
          }
        ]
      },
      revenue: {
        title: 'Revenue Analysis',
        description: 'Revenue breakdown and financial performance',
        metrics: [
          { label: 'Total Revenue', value: 125000, change: 12.5, changeType: 'positive', format: 'currency' },
          { label: 'Average Transaction', value: 125, change: 3.2, changeType: 'positive', format: 'currency' },
          { label: 'Revenue Growth', value: 15.2, change: 2.1, changeType: 'positive', format: 'percentage' },
          { label: 'Profit Margin', value: 35, change: 1.5, changeType: 'positive', format: 'percentage' }
        ],
        charts: [
          {
            type: 'line',
            title: 'Revenue Trends',
            data: [
              {
                label: 'Revenue',
                data: [8000, 9500, 11000, 12500, 9800, 7500, 11000],
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul']
              }
            ]
          },
          {
            type: 'bar',
            title: 'Revenue by Service',
            data: [
              { label: 'Haircut', value: 50000 },
              { label: 'Coloring', value: 40000 },
              { label: 'Styling', value: 25000 },
              { label: 'Other', value: 10000 }
            ]
          }
        ]
      }
    }

    return baseData[reportType] || baseData.overview
  }

  const formatValue = (value, format) => {
    switch (format) {
      case 'currency':
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD'
        }).format(value)
      case 'percentage':
        return `${value}%`
      case 'rating':
        return value.toFixed(1)
      default:
        return value.toLocaleString()
    }
  }

  const renderChart = (chart) => {
    switch (chart.type) {
      case 'line':
        return (
          <LineChart
            data={chart.data}
            height="300px"
            showLegend={true}
          />
        )
      case 'bar':
        return (
          <BarChart
            data={chart.data}
            height="300px"
            showLegend={true}
          />
        )
      case 'pie':
        return (
          <PieChart
            data={chart.data}
            height="300px"
            showLegend={true}
          />
        )
      default:
        return null
    }
  }

  const reportTypes = [
    { value: 'overview', label: 'Business Overview' },
    { value: 'staff', label: 'Staff Performance' },
    { value: 'customers', label: 'Customer Analytics' },
    { value: 'appointments', label: 'Appointment Analysis' },
    { value: 'revenue', label: 'Revenue Analysis' }
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading report data...</p>
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
              <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
              <p className="text-gray-600 mt-1">Comprehensive business insights and performance metrics</p>
            </div>
            <div className="flex items-center gap-3">
              <ExportOptions
                onExport={(format) => console.log('Export as:', format)}
                formats={['PDF', 'Excel', 'CSV']}
              />
            </div>
          </div>
        </div>

        {/* Report Selection */}
        <Card className="mb-8">
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Report Type</label>
                <Dropdown
                  value={selectedReport}
                  onChange={setSelectedReport}
                  options={reportTypes}
                  placeholder="Select report type"
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Staff</label>
                <Dropdown
                  value={filters.staff}
                  onChange={(value) => setFilters(prev => ({ ...prev, staff: value }))}
                  options={[
                    { value: 'all', label: 'All Staff' },
                    { value: 'emma', label: 'Emma Wilson' },
                    { value: 'michael', label: 'Michael Brown' },
                    { value: 'lisa', label: 'Lisa Garcia' },
                    { value: 'david', label: 'David Lee' }
                  ]}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Service</label>
                <Dropdown
                  value={filters.service}
                  onChange={(value) => setFilters(prev => ({ ...prev, service: value }))}
                  options={[
                    { value: 'all', label: 'All Services' },
                    { value: 'haircut', label: 'Haircut' },
                    { value: 'coloring', label: 'Coloring' },
                    { value: 'styling', label: 'Styling' },
                    { value: 'other', label: 'Other' }
                  ]}
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Report Content */}
        {reportData && (
          <div className="space-y-8">
            {/* Report Header */}
            <Card>
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{reportData.title}</h2>
                    <p className="text-gray-600 mt-1">{reportData.description}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline">Refresh</Button>
                    <Button variant="primary">Export</Button>
                  </div>
                </div>
              </div>
            </Card>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {reportData.metrics.map((metric, index) => (
                <ReportCard
                  key={index}
                  title={metric.label}
                  value={formatValue(metric.value, metric.format)}
                  change={metric.change}
                  changeType={metric.changeType}
                  color={['blue', 'green', 'yellow', 'purple'][index % 4]}
                />
              ))}
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {reportData.charts.map((chart, index) => (
                <Card key={index}>
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">{chart.title}</h3>
                    {renderChart(chart)}
                  </div>
                </Card>
              ))}
            </div>

            {/* Additional Insights */}
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Insights</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Positive Trends</h4>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Revenue has increased by 12.5% compared to last month
                      </li>
                      <li className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Customer satisfaction rating improved to 4.8/5
                      </li>
                      <li className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Staff productivity increased by 8.7%
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Areas for Improvement</h4>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                        No-show rate increased to 2% - consider reminder system
                      </li>
                      <li className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                        Customer acquisition cost could be optimized
                      </li>
                      <li className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                        Peak hours scheduling could be better optimized
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </Card>

            {/* Recommendations */}
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recommendations</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">Marketing</h4>
                    <p className="text-sm text-blue-700">Focus on social media marketing to attract younger demographics and increase brand awareness.</p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <h4 className="font-medium text-green-900 mb-2">Operations</h4>
                    <p className="text-sm text-green-700">Implement automated appointment reminders to reduce no-show rates and improve efficiency.</p>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <h4 className="font-medium text-purple-900 mb-2">Staff Development</h4>
                    <p className="text-sm text-purple-700">Provide additional training for new services to increase revenue per customer.</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}

export default ManagerReports
