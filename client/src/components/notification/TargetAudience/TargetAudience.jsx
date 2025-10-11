import React, { useState } from 'react'
import { Card, Button, Input, Dropdown, Badge, Table, SearchBar } from '../../common'

const TargetAudience = ({ 
  recipientType,
  recipients = [],
  onRecipientTypeChange,
  onRecipientsChange,
  customers = [],
  customerSegments = [],
  businessStaff = [],
  error,
  className = ''
}) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSegment, setSelectedSegment] = useState('')
  const [showCustomerList, setShowCustomerList] = useState(false)

  const recipientTypeOptions = [
    { value: 'all', label: 'All Customers', description: 'Send to all customers in the system' },
    { value: 'specific', label: 'Specific Customers', description: 'Select individual customers' },
    { value: 'segment', label: 'Customer Segment', description: 'Send to a specific customer segment' },
    { value: 'business', label: 'Business Staff', description: 'Send to business staff members' }
  ]

  const handleRecipientTypeChange = (type) => {
    onRecipientTypeChange(type)
    // Clear recipients when changing type
    onRecipientsChange([])
  }

  const handleCustomerSelect = (customer) => {
    const isSelected = recipients.some(r => r.id === customer.id)
    if (isSelected) {
      onRecipientsChange(recipients.filter(r => r.id !== customer.id))
    } else {
      onRecipientsChange([...recipients, customer])
    }
  }

  const handleSegmentSelect = (segment) => {
    setSelectedSegment(segment.id)
    onRecipientsChange(segment.customers || [])
  }

  const handleStaffSelect = (staff) => {
    const isSelected = recipients.some(r => r.id === staff.id)
    if (isSelected) {
      onRecipientsChange(recipients.filter(r => r.id !== staff.id))
    } else {
      onRecipientsChange([...recipients, staff])
    }
  }

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone?.includes(searchTerm)
  )

  const filteredStaff = businessStaff.filter(staff =>
    staff.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    staff.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    staff.role?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const renderAllCustomers = () => (
    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
      <div className="flex items-center gap-2">
        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div>
          <p className="font-medium text-blue-900">All Customers</p>
          <p className="text-sm text-blue-700">
            This notification will be sent to all {customers.length} customers in the system.
          </p>
        </div>
      </div>
    </div>
  )

  const renderSpecificCustomers = () => (
    <div className="space-y-4">
      {/* Search and Selection Controls */}
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <SearchBar
            onSearch={(term) => setSearchTerm(term)}
            placeholder="Search customers..."
            debounceTime={300}
          />
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowCustomerList(!showCustomerList)}
        >
          {showCustomerList ? 'Hide' : 'Show'} Customer List
        </Button>
      </div>

      {/* Selected Recipients */}
      {recipients.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">
            Selected Recipients ({recipients.length})
          </h4>
          <div className="flex flex-wrap gap-2">
            {recipients.map((recipient) => (
              <Badge
                key={recipient.id}
                variant="primary"
                className="flex items-center gap-1"
              >
                {recipient.name}
                <button
                  onClick={() => handleCustomerSelect(recipient)}
                  className="ml-1 hover:bg-primary-200 rounded-full p-0.5"
                >
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Customer List */}
      {showCustomerList && (
        <Card>
          <div className="p-4">
            <h4 className="text-sm font-medium text-gray-700 mb-4">Select Customers</h4>
            <div className="max-h-60 overflow-y-auto">
              <Table
                data={filteredCustomers}
                columns={[
                  {
                    key: 'select',
                    label: '',
                    render: (customer) => (
                      <input
                        type="checkbox"
                        checked={recipients.some(r => r.id === customer.id)}
                        onChange={() => handleCustomerSelect(customer)}
                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                    )
                  },
                  {
                    key: 'name',
                    label: 'Name',
                    render: (customer) => (
                      <div>
                        <p className="font-medium text-gray-900">{customer.name}</p>
                        <p className="text-sm text-gray-500">{customer.email}</p>
                      </div>
                    )
                  },
                  {
                    key: 'phone',
                    label: 'Phone',
                    render: (customer) => customer.phone || 'N/A'
                  },
                  {
                    key: 'lastVisit',
                    label: 'Last Visit',
                    render: (customer) => customer.lastVisit ? 
                      new Date(customer.lastVisit).toLocaleDateString() : 'Never'
                  }
                ]}
                onRowClick={(customer) => handleCustomerSelect(customer)}
                className="text-sm"
              />
            </div>
          </div>
        </Card>
      )}
    </div>
  )

  const renderCustomerSegment = () => (
    <div className="space-y-4">
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-2">Select Customer Segment</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {customerSegments.map((segment) => (
            <Card
              key={segment.id}
              className={`cursor-pointer transition-all duration-200 ${
                selectedSegment === segment.id
                  ? 'ring-2 ring-primary-500 border-primary-500'
                  : 'hover:shadow-md'
              }`}
              onClick={() => handleSegmentSelect(segment)}
            >
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h5 className="font-medium text-gray-900">{segment.name}</h5>
                  <Badge variant="outline" size="sm">{segment.customers?.length || 0} customers</Badge>
                </div>
                <p className="text-sm text-gray-600 mb-2">{segment.description}</p>
                <div className="flex flex-wrap gap-1">
                  {segment.criteria?.map((criterion, index) => (
                    <Badge key={index} variant="default" size="sm">
                      {criterion}
                    </Badge>
                  ))}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Selected Segment Recipients */}
      {selectedSegment && recipients.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">
            Segment Recipients ({recipients.length})
          </h4>
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">
              This segment contains {recipients.length} customers who match the selected criteria.
            </p>
          </div>
        </div>
      )}
    </div>
  )

  const renderBusinessStaff = () => (
    <div className="space-y-4">
      {/* Search Controls */}
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <SearchBar
            onSearch={(term) => setSearchTerm(term)}
            placeholder="Search staff members..."
            debounceTime={300}
          />
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowCustomerList(!showCustomerList)}
        >
          {showCustomerList ? 'Hide' : 'Show'} Staff List
        </Button>
      </div>

      {/* Selected Staff */}
      {recipients.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">
            Selected Staff ({recipients.length})
          </h4>
          <div className="flex flex-wrap gap-2">
            {recipients.map((staff) => (
              <Badge
                key={staff.id}
                variant="primary"
                className="flex items-center gap-1"
              >
                {staff.name} ({staff.role})
                <button
                  onClick={() => handleStaffSelect(staff)}
                  className="ml-1 hover:bg-primary-200 rounded-full p-0.5"
                >
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Staff List */}
      {showCustomerList && (
        <Card>
          <div className="p-4">
            <h4 className="text-sm font-medium text-gray-700 mb-4">Select Staff Members</h4>
            <div className="max-h-60 overflow-y-auto">
              <Table
                data={filteredStaff}
                columns={[
                  {
                    key: 'select',
                    label: '',
                    render: (staff) => (
                      <input
                        type="checkbox"
                        checked={recipients.some(r => r.id === staff.id)}
                        onChange={() => handleStaffSelect(staff)}
                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                    )
                  },
                  {
                    key: 'name',
                    label: 'Name',
                    render: (staff) => (
                      <div>
                        <p className="font-medium text-gray-900">{staff.name}</p>
                        <p className="text-sm text-gray-500">{staff.email}</p>
                      </div>
                    )
                  },
                  {
                    key: 'role',
                    label: 'Role',
                    render: (staff) => (
                      <Badge variant="outline" size="sm">{staff.role}</Badge>
                    )
                  },
                  {
                    key: 'phone',
                    label: 'Phone',
                    render: (staff) => staff.phone || 'N/A'
                  }
                ]}
                onRowClick={(staff) => handleStaffSelect(staff)}
                className="text-sm"
              />
            </div>
          </div>
        </Card>
      )}
    </div>
  )

  return (
    <div className={className}>
      <div className="space-y-6">
        {/* Recipient Type Selection */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Target Audience</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recipientTypeOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => handleRecipientTypeChange(option.value)}
                className={`p-4 text-left border rounded-lg transition-all duration-200 ${
                  recipientType === option.value
                    ? 'bg-primary-50 border-primary-300 ring-2 ring-primary-200'
                    : 'bg-white border-gray-200 hover:border-primary-300 hover:bg-primary-50'
                }`}
              >
                <div>
                  <p className="font-medium text-gray-900">{option.label}</p>
                  <p className="text-sm text-gray-500 mt-1">{option.description}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Recipient Selection Based on Type */}
        {recipientType === 'all' && renderAllCustomers()}
        {recipientType === 'specific' && renderSpecificCustomers()}
        {recipientType === 'segment' && renderCustomerSegment()}
        {recipientType === 'business' && renderBusinessStaff()}

        {/* Summary */}
        {recipients.length > 0 && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="font-medium text-green-900">
                  {recipients.length} recipient{recipients.length !== 1 ? 's' : ''} selected
                </p>
                <p className="text-sm text-green-700">
                  {recipientType === 'all' && 'All customers will receive this notification'}
                  {recipientType === 'specific' && 'Selected customers will receive this notification'}
                  {recipientType === 'segment' && 'Customers in the selected segment will receive this notification'}
                  {recipientType === 'business' && 'Selected staff members will receive this notification'}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default TargetAudience
