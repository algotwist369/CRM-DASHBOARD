import React, { useState, useEffect } from 'react'
import { Card, Button, Table, SearchBar, Dropdown, Badge, Modal, Alert } from '../../../../components'
import { DonutChart, BarChart } from '../../../../components'
import customerService from '../../../../services/customer/customerService'
import { toast } from 'react-hot-toast'

const CustomerSegments = () => {
  const [segments, setSegments] = useState([])
  const [filteredSegments, setFilteredSegments] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSegment, setSelectedSegment] = useState(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    fetchSegments()
  }, [])

  useEffect(() => {
    filterSegments()
  }, [segments, searchTerm])

  const fetchSegments = async () => {
    try {
      setLoading(true)
      
      const result = await customerService.getCustomerSegments()
      
      if (result.success) {
        setSegments(result.data)
        toast.success('Customer segments loaded successfully!')
      } else {
        toast.error(result.error || 'Failed to load customer segments')
        console.error('Customer segments error:', result.error)
      }
    } catch (error) {
      console.error('Error fetching customer segments:', error)
      toast.error('An unexpected error occurred while loading customer segments')
    } finally {
      setLoading(false)
    }
  }
      
      ]
      
    } catch (error) {
      console.error('Error fetching segments:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterSegments = () => {
    let filtered = segments

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(segment =>
        segment.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        segment.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    setFilteredSegments(filtered)
  }

  const handleDelete = async () => {
    if (!selectedSegment) return

    try {
      setDeleting(true)
      // Simulate API call
      
      setSegments(prev => prev.filter(s => s.id !== selectedSegment.id))
      setShowDeleteModal(false)
      setSelectedSegment(null)
    } catch (error) {
      console.error('Error deleting segment:', error)
    } finally {
      setDeleting(false)
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

  const getColorClass = (color) => {
    switch (color) {
      case 'purple': return 'bg-purple-100 text-purple-800'
      case 'blue': return 'bg-blue-100 text-blue-800'
      case 'green': return 'bg-green-100 text-green-800'
      case 'orange': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getColorVariant = (color) => {
    switch (color) {
      case 'purple': return 'purple'
      case 'blue': return 'blue'
      case 'green': return 'green'
      case 'orange': return 'orange'
      default: return 'default'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Customer Segments</h1>
              <p className="mt-2 text-gray-600">
                Manage customer segments and their criteria
              </p>
            </div>
            <Button variant="primary">Create New Segment</Button>
          </div>
        </div>

        {/* Search */}
        <Card className="mb-6">
          <div className="p-6">
            <div className="max-w-md">
              <SearchBar
                onSearch={(term) => setSearchTerm(term)}
                placeholder="Search segments..."
                debounceTime={300}
              />
            </div>
          </div>
        </Card>

        {/* Results Summary */}
        <div className="mb-4">
          <p className="text-sm text-gray-600">
            Showing {filteredSegments.length} of {segments.length} segments
          </p>
        </div>

        {/* Segments Table */}
        <Card>
          <div className="p-6">
            <Table
              data={filteredSegments}
              columns={[
                {
                  key: 'name',
                  label: 'Segment',
                  sortable: true,
                  render: (segment) => (
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${
                        segment.color === 'purple' ? 'bg-purple-500' :
                        segment.color === 'blue' ? 'bg-blue-500' :
                        segment.color === 'green' ? 'bg-green-500' :
                        segment.color === 'orange' ? 'bg-orange-500' :
                        'bg-gray-500'
                      }`} />
                      <div>
                        <p className="font-medium text-gray-900">{segment.name}</p>
                        <p className="text-sm text-gray-500">{segment.description}</p>
                      </div>
                    </div>
                  )
                },
                {
                  key: 'customerCount',
                  label: 'Customers',
                  sortable: true,
                  render: (segment) => (
                    <div className="text-center">
                      <p className="text-lg font-semibold text-gray-900">{segment.customerCount}</p>
                      <p className="text-sm text-gray-500">customers</p>
                    </div>
                  )
                },
                {
                  key: 'totalValue',
                  label: 'Total Value',
                  sortable: true,
                  render: (segment) => (
                    <div>
                      <p className="font-medium text-gray-900">{formatCurrency(segment.totalValue)}</p>
                      <p className="text-sm text-gray-500">avg: {formatCurrency(segment.averageValue)}</p>
                    </div>
                  )
                },
                {
                  key: 'criteria',
                  label: 'Criteria',
                  render: (segment) => (
                    <div className="text-sm">
                      <p className="text-gray-900">Spent: {formatCurrency(segment.criteria.totalSpent.min)}+</p>
                      <p className="text-gray-500">Visits: {segment.criteria.totalVisits.min}+</p>
                      <p className="text-gray-500">Last visit: {segment.criteria.lastVisit.days} days</p>
                    </div>
                  )
                },
                {
                  key: 'benefits',
                  label: 'Benefits',
                  render: (segment) => (
                    <div className="flex flex-wrap gap-1">
                      {segment.benefits.slice(0, 2).map((benefit, index) => (
                        <Badge key={index} variant="info" size="sm">
                          {benefit}
                        </Badge>
                      ))}
                      {segment.benefits.length > 2 && (
                        <Badge variant="default" size="sm">
                          +{segment.benefits.length - 2}
                        </Badge>
                      )}
                    </div>
                  )
                },
                {
                  key: 'lastUpdated',
                  label: 'Last Updated',
                  sortable: true,
                  render: (segment) => formatDate(segment.lastUpdated)
                },
                {
                  key: 'actions',
                  label: 'Actions',
                  render: (segment) => (
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">View</Button>
                      <Button variant="outline" size="sm">Edit</Button>
                      <Button variant="outline" size="sm">Customers</Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => {
                          setSelectedSegment(segment)
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
              emptyMessage="No segments found matching your criteria."
            />
          </div>
        </Card>

        {/* Segment Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Segment Distribution</h3>
              <DonutChart
                data={segments.map(segment => ({
                  name: segment.name,
                  count: segment.customerCount,
                  percentage: Math.round((segment.customerCount / segments.reduce((sum, s) => sum + s.customerCount, 0)) * 100)
                }))}
                centerText="Customers"
                centerValue={segments.reduce((sum, s) => sum + s.customerCount, 0).toString()}
                showLegend={true}
                width="300px"
                height="300px"
              />
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Segment Value</h3>
              <BarChart
                data={segments.map(segment => ({
                  label: segment.name,
                  value: segment.totalValue
                }))}
                height="300px"
                showLegend={true}
              />
            </div>
          </Card>
        </div>

        {/* Delete Confirmation Modal */}
        <Modal
          isOpen={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false)
            setSelectedSegment(null)
          }}
          title="Delete Segment"
          size="md"
        >
          <div className="space-y-4">
            <Alert
              type="error"
              title="Are you sure you want to delete this segment?"
              message={`This action cannot be undone. The segment "${selectedSegment?.name}" and all its data will be permanently removed.`}
            />
            
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setShowDeleteModal(false)
                  setSelectedSegment(null)
                }}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                loading={deleting}
                onClick={handleDelete}
              >
                {deleting ? 'Deleting...' : 'Delete Segment'}
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  )
}

export default CustomerSegments
