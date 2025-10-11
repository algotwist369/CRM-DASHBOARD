import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, Button, Input, Dropdown, DatePicker, TimePicker, Alert, Badge } from '../../../../components'
import { PaymentMethod, TransactionSummary } from '../../../../components'
import managerService from '../../../../services/manager/managerService'
import { toast } from 'react-hot-toast'

const AddTransaction = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    service: '',
    staffName: '',
    amount: '',
    paymentMethod: 'credit_card',
    date: new Date(),
    time: '',
    notes: '',
    tip: '',
    discount: '',
    tax: '',
    total: ''
  })
  const [errors, setErrors] = useState({})
  const [customers, setCustomers] = useState([])
  const [services, setServices] = useState([])
  const [staff, setStaff] = useState([])

  useEffect(() => {
    fetchInitialData()
  }, [])

  useEffect(() => {
    calculateTotal()
  }, [formData.amount, formData.tip, formData.discount, formData.tax])

  const fetchInitialData = async () => {
    try {
      // Simulate API calls
      await Promise.all([
        fetchCustomers(),
        fetchServices(),
        fetchStaff()
      ])
    } catch (error) {
      console.error('Error fetching initial data:', error)
    }
  }

  const fetchCustomers = async () => {

  const fetchServices = async () => {

  const fetchStaff = async () => {

  const calculateTotal = () => {
    const amount = parseFloat(formData.amount) || 0
    const tip = parseFloat(formData.tip) || 0
    const discount = parseFloat(formData.discount) || 0
    const tax = parseFloat(formData.tax) || 0
    
    const total = amount + tip - discount + tax
    setFormData(prev => ({ ...prev, total: total.toFixed(2) }))
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }))
    }
  }

  const handleServiceSelect = (serviceId) => {
    const service = services.find(s => s.id === serviceId)
    if (service) {
      setFormData(prev => ({
        ...prev,
        service: service.name,
        amount: service.price.toString()
      }))
    }
  }

  const handleCustomerSelect = (customerId) => {
    const customer = customers.find(c => c.id === customerId)
    if (customer) {
      setFormData(prev => ({
        ...prev,
        customerName: customer.name,
        customerEmail: customer.email,
        customerPhone: customer.phone
      }))
    }
  }

  const validateStep = (stepNumber) => {
    const newErrors = {}
    
    switch (stepNumber) {
      case 1:
        if (!formData.customerName) newErrors.customerName = 'Customer name is required'
        if (!formData.customerEmail) newErrors.customerEmail = 'Customer email is required'
        if (!formData.service) newErrors.service = 'Service is required'
        if (!formData.staffName) newErrors.staffName = 'Staff member is required'
        break
      case 2:
        if (!formData.amount) newErrors.amount = 'Amount is required'
        if (!formData.paymentMethod) newErrors.paymentMethod = 'Payment method is required'
        if (!formData.date) newErrors.date = 'Date is required'
        if (!formData.time) newErrors.time = 'Time is required'
        break
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(prev => prev + 1)
    }
  }

  const handlePrevious = () => {
    setStep(prev => prev - 1)
  }

  const handleSubmit = async () => {
    if (!validateStep(2)) return
    
    try {
      setLoading(true)
      setErrors({})
      
      const result = await managerService.addTransaction(formData)
      
      if (result.success) {
        toast.success('Transaction created successfully!')
        navigate('/manager/transactions', {
          state: { message: 'Transaction created successfully!' }
        })
      } else {
        setErrors({ general: result.error || 'Failed to create transaction' })
        toast.error(result.error || 'Failed to create transaction')
      }
    } catch (error) {
      console.error('Error creating transaction:', error)
      setErrors({ general: 'An unexpected error occurred' })
      toast.error('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const renderStep1 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer & Service Information</h3>
        <p className="text-gray-600">Select the customer and service for this transaction.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Customer</label>
          <Dropdown
            value={formData.customerName}
            onChange={handleCustomerSelect}
            options={customers.map(customer => ({
              value: customer.id,
              label: `${customer.name} (${customer.email})`
            }))}
            placeholder="Select customer"
            searchable={true}
          />
          {errors.customerName && (
            <p className="mt-1 text-sm text-red-600">{errors.customerName}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Service</label>
          <Dropdown
            value={formData.service}
            onChange={handleServiceSelect}
            options={services.map(service => ({
              value: service.id,
              label: `${service.name} - $${service.price}`
            }))}
            placeholder="Select service"
            searchable={true}
          />
          {errors.service && (
            <p className="mt-1 text-sm text-red-600">{errors.service}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Customer Name</label>
          <Input
            value={formData.customerName}
            onChange={(e) => handleInputChange('customerName', e.target.value)}
            placeholder="Enter customer name"
            error={errors.customerName}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Customer Email</label>
          <Input
            type="email"
            value={formData.customerEmail}
            onChange={(e) => handleInputChange('customerEmail', e.target.value)}
            placeholder="Enter customer email"
            error={errors.customerEmail}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Customer Phone</label>
          <Input
            value={formData.customerPhone}
            onChange={(e) => handleInputChange('customerPhone', e.target.value)}
            placeholder="Enter customer phone"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Staff Member</label>
          <Dropdown
            value={formData.staffName}
            onChange={(value) => handleInputChange('staffName', value)}
            options={staff.map(member => ({
              value: member.name,
              label: `${member.name} (${member.role})`
            }))}
            placeholder="Select staff member"
          />
          {errors.staffName && (
            <p className="mt-1 text-sm text-red-600">{errors.staffName}</p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
        <textarea
          value={formData.notes}
          onChange={(e) => handleInputChange('notes', e.target.value)}
          placeholder="Add any notes about this transaction..."
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
        />
      </div>
    </div>
  )

  const renderStep2 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment & Scheduling</h3>
        <p className="text-gray-600">Set the payment details and schedule for this transaction.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Amount</label>
          <Input
            type="number"
            value={formData.amount}
            onChange={(e) => handleInputChange('amount', e.target.value)}
            placeholder="0.00"
            error={errors.amount}
            prefix="$"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
          <Dropdown
            value={formData.paymentMethod}
            onChange={(value) => handleInputChange('paymentMethod', value)}
            options={[
              { value: 'credit_card', label: 'Credit Card' },
              { value: 'debit_card', label: 'Debit Card' },
              { value: 'cash', label: 'Cash' },
              { value: 'check', label: 'Check' }
            ]}
            placeholder="Select payment method"
          />
          {errors.paymentMethod && (
            <p className="mt-1 text-sm text-red-600">{errors.paymentMethod}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
          <DatePicker
            value={formData.date}
            onChange={(date) => handleInputChange('date', date)}
            placeholder="Select date"
            error={errors.date}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Time</label>
          <TimePicker
            value={formData.time}
            onChange={(time) => handleInputChange('time', time)}
            placeholder="Select time"
            error={errors.time}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Tip</label>
          <Input
            type="number"
            value={formData.tip}
            onChange={(e) => handleInputChange('tip', e.target.value)}
            placeholder="0.00"
            prefix="$"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Discount</label>
          <Input
            type="number"
            value={formData.discount}
            onChange={(e) => handleInputChange('discount', e.target.value)}
            placeholder="0.00"
            prefix="$"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Tax</label>
          <Input
            type="number"
            value={formData.tax}
            onChange={(e) => handleInputChange('tax', e.target.value)}
            placeholder="0.00"
            prefix="$"
          />
        </div>
      </div>

      {/* Transaction Summary */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Transaction Summary</h4>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-600">Service Amount:</span>
            <span className="font-medium">${formData.amount || '0.00'}</span>
          </div>
          {formData.tip && (
            <div className="flex justify-between">
              <span className="text-gray-600">Tip:</span>
              <span className="font-medium">+${formData.tip}</span>
            </div>
          )}
          {formData.discount && (
            <div className="flex justify-between">
              <span className="text-gray-600">Discount:</span>
              <span className="font-medium text-green-600">-${formData.discount}</span>
            </div>
          )}
          {formData.tax && (
            <div className="flex justify-between">
              <span className="text-gray-600">Tax:</span>
              <span className="font-medium">+${formData.tax}</span>
            </div>
          )}
          <div className="border-t border-gray-200 pt-3">
            <div className="flex justify-between">
              <span className="text-lg font-semibold text-gray-900">Total:</span>
              <span className="text-lg font-semibold text-gray-900">${formData.total || '0.00'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const renderStep3 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Review & Confirm</h3>
        <p className="text-gray-600">Review the transaction details before creating.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <div className="p-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Customer Information</h4>
            <div className="space-y-2">
              <div>
                <span className="text-sm font-medium text-gray-700">Name:</span>
                <p className="text-gray-900">{formData.customerName}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-700">Email:</span>
                <p className="text-gray-900">{formData.customerEmail}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-700">Phone:</span>
                <p className="text-gray-900">{formData.customerPhone}</p>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Service Information</h4>
            <div className="space-y-2">
              <div>
                <span className="text-sm font-medium text-gray-700">Service:</span>
                <p className="text-gray-900">{formData.service}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-700">Staff:</span>
                <p className="text-gray-900">{formData.staffName}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-700">Date & Time:</span>
                <p className="text-gray-900">
                  {formData.date?.toLocaleDateString()} at {formData.time}
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <div className="p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Payment Details</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <div>
                <span className="text-sm font-medium text-gray-700">Payment Method:</span>
                <p className="text-gray-900 capitalize">{formData.paymentMethod.replace('_', ' ')}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-700">Amount:</span>
                <p className="text-gray-900">${formData.amount}</p>
              </div>
            </div>
            <div className="space-y-2">
              <div>
                <span className="text-sm font-medium text-gray-700">Total:</span>
                <p className="text-2xl font-bold text-gray-900">${formData.total}</p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {formData.notes && (
        <Card>
          <div className="p-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Notes</h4>
            <p className="text-gray-700">{formData.notes}</p>
          </div>
        </Card>
      )}
    </div>
  )

  const steps = [
    { number: 1, title: 'Customer & Service', description: 'Select customer and service' },
    { number: 2, title: 'Payment & Schedule', description: 'Set payment and timing' },
    { number: 3, title: 'Review & Confirm', description: 'Review and create transaction' }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/manager/transactions')}
            >
              ← Back to Transactions
            </Button>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Add New Transaction</h1>
          <p className="text-gray-600 mt-1">Create a new transaction for a customer</p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((stepItem, index) => (
              <div key={stepItem.number} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                  step >= stepItem.number
                    ? 'bg-primary-600 border-primary-600 text-white'
                    : 'bg-white border-gray-300 text-gray-500'
                }`}>
                  {step > stepItem.number ? (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <span className="text-sm font-medium">{stepItem.number}</span>
                  )}
                </div>
                <div className="ml-3">
                  <p className={`text-sm font-medium ${
                    step >= stepItem.number ? 'text-primary-600' : 'text-gray-500'
                  }`}>
                    {stepItem.title}
                  </p>
                  <p className="text-xs text-gray-500">{stepItem.description}</p>
                </div>
                {index < steps.length - 1 && (
                  <div className={`ml-8 w-16 h-0.5 ${
                    step > stepItem.number ? 'bg-primary-600' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Form Content */}
        <Card>
          <div className="p-8">
            {step === 1 && renderStep1()}
            {step === 2 && renderStep2()}
            {step === 3 && renderStep3()}

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
              <div>
                {step > 1 && (
                  <Button
                    variant="outline"
                    onClick={handlePrevious}
                    disabled={loading}
                  >
                    Previous
                  </Button>
                )}
              </div>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  onClick={() => navigate('/manager/transactions')}
                  disabled={loading}
                >
                  Cancel
                </Button>
                {step < 3 ? (
                  <Button
                    variant="primary"
                    onClick={handleNext}
                    disabled={loading}
                  >
                    Next
                  </Button>
                ) : (
                  <Button
                    variant="primary"
                    onClick={handleSubmit}
                    loading={loading}
                  >
                    Create Transaction
                  </Button>
                )}
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}

export default AddTransaction
