import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, Button, Input, Dropdown, DatePicker, Alert } from '../../../../components'
import { LineChart, BarChart } from '../../../../components'
import dailyBusinessService from '../../../../services/dailyBusiness/dailyBusinessService'
import { toast } from 'react-hot-toast'

const AddDailyBusiness = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    date: new Date(),
    totalRevenue: '',
    totalCustomers: '',
    totalAppointments: '',
    totalTransactions: '',
    expenses: '',
    staffHours: '',
    status: 'completed',
    notes: '',
    services: [],
    staffPerformance: []
  })
  const [errors, setErrors] = useState({})
  const [services, setServices] = useState([])
  const [staff, setStaff] = useState([])

  useEffect(() => {
    fetchInitialData()
  }, [])

  useEffect(() => {
    calculateProfit()
  }, [formData.totalRevenue, formData.expenses])

  const fetchInitialData = async () => {
    try {
      // Simulate API calls
      await Promise.all([
        fetchServices(),
        fetchStaff()
      ])
    } catch (error) {
      console.error('Error fetching initial data:', error)
    }
  }

  const fetchServices = async () => {

  const fetchStaff = async () => {

  const calculateProfit = () => {
    const revenue = parseFloat(formData.totalRevenue) || 0
    const expenses = parseFloat(formData.expenses) || 0
    const profit = revenue - expenses
    setFormData(prev => ({ ...prev, profit: profit.toFixed(2) }))
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }))
    }
  }

  const handleServiceAdd = () => {
    const newService = {
      id: Date.now().toString(),
      name: '',
      count: '',
      revenue: ''
    }
    setFormData(prev => ({
      ...prev,
      services: [...prev.services, newService]
    }))
  }

  const handleServiceChange = (index, field, value) => {
    const updatedServices = [...formData.services]
    updatedServices[index] = { ...updatedServices[index], [field]: value }
    setFormData(prev => ({ ...prev, services: updatedServices }))
  }

  const handleServiceRemove = (index) => {
    const updatedServices = formData.services.filter((_, i) => i !== index)
    setFormData(prev => ({ ...prev, services: updatedServices }))
  }

  const handleStaffAdd = () => {
    const newStaff = {
      id: Date.now().toString(),
      name: '',
      appointments: '',
      revenue: ''
    }
    setFormData(prev => ({
      ...prev,
      staffPerformance: [...prev.staffPerformance, newStaff]
    }))
  }

  const handleStaffChange = (index, field, value) => {
    const updatedStaff = [...formData.staffPerformance]
    updatedStaff[index] = { ...updatedStaff[index], [field]: value }
    setFormData(prev => ({ ...prev, staffPerformance: updatedStaff }))
  }

  const handleStaffRemove = (index) => {
    const updatedStaff = formData.staffPerformance.filter((_, i) => i !== index)
    setFormData(prev => ({ ...prev, staffPerformance: updatedStaff }))
  }

  const validateStep = (stepNumber) => {
    const newErrors = {}
    
    switch (stepNumber) {
      case 1:
        if (!formData.date) newErrors.date = 'Date is required'
        if (!formData.totalRevenue) newErrors.totalRevenue = 'Total revenue is required'
        if (!formData.totalCustomers) newErrors.totalCustomers = 'Total customers is required'
        if (!formData.totalAppointments) newErrors.totalAppointments = 'Total appointments is required'
        if (!formData.totalTransactions) newErrors.totalTransactions = 'Total transactions is required'
        break
      case 2:
        if (!formData.expenses) newErrors.expenses = 'Expenses is required'
        if (!formData.staffHours) newErrors.staffHours = 'Staff hours is required'
        if (!formData.status) newErrors.status = 'Status is required'
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
      
      const result = await dailyBusinessService.addDailyBusiness(formData)
      
      if (result.success) {
        toast.success('Daily business record created successfully!')
        navigate('/manager/daily-business', {
          state: { message: 'Daily business record created successfully!' }
        })
      } else {
        setErrors({ general: result.error || 'Failed to create daily business record' })
        toast.error(result.error || 'Failed to create daily business record')
      }
    } catch (error) {
      console.error('Error creating daily business:', error)
      setErrors({ general: 'An unexpected error occurred' })
      toast.error('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const renderStep1 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
        <p className="text-gray-600">Enter the basic daily business information.</p>
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
          <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
          <Dropdown
            value={formData.status}
            onChange={(value) => handleInputChange('status', value)}
            options={[
              { value: 'completed', label: 'Completed' },
              { value: 'in_progress', label: 'In Progress' },
              { value: 'closed', label: 'Closed' },
              { value: 'pending', label: 'Pending' }
            ]}
            placeholder="Select status"
          />
          {errors.status && (
            <p className="mt-1 text-sm text-red-600">{errors.status}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Total Revenue</label>
          <Input
            type="number"
            value={formData.totalRevenue}
            onChange={(e) => handleInputChange('totalRevenue', e.target.value)}
            placeholder="0.00"
            error={errors.totalRevenue}
            prefix="$"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Total Customers</label>
          <Input
            type="number"
            value={formData.totalCustomers}
            onChange={(e) => handleInputChange('totalCustomers', e.target.value)}
            placeholder="0"
            error={errors.totalCustomers}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Total Appointments</label>
          <Input
            type="number"
            value={formData.totalAppointments}
            onChange={(e) => handleInputChange('totalAppointments', e.target.value)}
            placeholder="0"
            error={errors.totalAppointments}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Total Transactions</label>
          <Input
            type="number"
            value={formData.totalTransactions}
            onChange={(e) => handleInputChange('totalTransactions', e.target.value)}
            placeholder="0"
            error={errors.totalTransactions}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
        <textarea
          value={formData.notes}
          onChange={(e) => handleInputChange('notes', e.target.value)}
          placeholder="Add any notes about this day..."
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
        />
      </div>
    </div>
  )

  const renderStep2 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Financial Details</h3>
        <p className="text-gray-600">Enter the financial details for this day.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Expenses</label>
          <Input
            type="number"
            value={formData.expenses}
            onChange={(e) => handleInputChange('expenses', e.target.value)}
            placeholder="0.00"
            error={errors.expenses}
            prefix="$"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Staff Hours</label>
          <Input
            type="number"
            value={formData.staffHours}
            onChange={(e) => handleInputChange('staffHours', e.target.value)}
            placeholder="0"
            error={errors.staffHours}
            suffix="hours"
          />
        </div>
      </div>

      {/* Financial Summary */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Financial Summary</h4>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-600">Total Revenue:</span>
            <span className="font-medium">${formData.totalRevenue || '0.00'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Expenses:</span>
            <span className="font-medium">${formData.expenses || '0.00'}</span>
          </div>
          <div className="border-t border-gray-200 pt-3">
            <div className="flex justify-between">
              <span className="text-lg font-semibold text-gray-900">Profit:</span>
              <span className="text-lg font-semibold text-gray-900">${formData.profit || '0.00'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const renderStep3 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Services & Staff Performance</h3>
        <p className="text-gray-600">Add details about services provided and staff performance.</p>
      </div>

      {/* Services */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-semibold text-gray-900">Services</h4>
          <Button variant="outline" size="sm" onClick={handleServiceAdd}>
            Add Service
          </Button>
        </div>
        <div className="space-y-4">
          {formData.services.map((service, index) => (
            <div key={service.id} className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">Service</label>
                <Dropdown
                  value={service.name}
                  onChange={(value) => handleServiceChange(index, 'name', value)}
                  options={services.map(s => ({
                    value: s.name,
                    label: s.name
                  }))}
                  placeholder="Select service"
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">Count</label>
                <Input
                  type="number"
                  value={service.count}
                  onChange={(e) => handleServiceChange(index, 'count', e.target.value)}
                  placeholder="0"
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">Revenue</label>
                <Input
                  type="number"
                  value={service.revenue}
                  onChange={(e) => handleServiceChange(index, 'revenue', e.target.value)}
                  placeholder="0.00"
                  prefix="$"
                />
              </div>
              <div className="flex items-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleServiceRemove(index)}
                  className="text-red-600 hover:text-red-800"
                >
                  Remove
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Staff Performance */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-semibold text-gray-900">Staff Performance</h4>
          <Button variant="outline" size="sm" onClick={handleStaffAdd}>
            Add Staff
          </Button>
        </div>
        <div className="space-y-4">
          {formData.staffPerformance.map((staffMember, index) => (
            <div key={staffMember.id} className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">Staff Member</label>
                <Dropdown
                  value={staffMember.name}
                  onChange={(value) => handleStaffChange(index, 'name', value)}
                  options={staff.map(s => ({
                    value: s.name,
                    label: s.name
                  }))}
                  placeholder="Select staff member"
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">Appointments</label>
                <Input
                  type="number"
                  value={staffMember.appointments}
                  onChange={(e) => handleStaffChange(index, 'appointments', e.target.value)}
                  placeholder="0"
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">Revenue</label>
                <Input
                  type="number"
                  value={staffMember.revenue}
                  onChange={(e) => handleStaffChange(index, 'revenue', e.target.value)}
                  placeholder="0.00"
                  prefix="$"
                />
              </div>
              <div className="flex items-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleStaffRemove(index)}
                  className="text-red-600 hover:text-red-800"
                >
                  Remove
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const renderStep4 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Review & Confirm</h3>
        <p className="text-gray-600">Review the daily business details before creating.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <div className="p-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h4>
            <div className="space-y-2">
              <div>
                <span className="text-sm font-medium text-gray-700">Date:</span>
                <p className="text-gray-900">{formData.date?.toLocaleDateString()}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-700">Status:</span>
                <p className="text-gray-900 capitalize">{formData.status}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-700">Total Customers:</span>
                <p className="text-gray-900">{formData.totalCustomers}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-700">Total Appointments:</span>
                <p className="text-gray-900">{formData.totalAppointments}</p>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Financial Summary</h4>
            <div className="space-y-2">
              <div>
                <span className="text-sm font-medium text-gray-700">Total Revenue:</span>
                <p className="text-gray-900">${formData.totalRevenue}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-700">Expenses:</span>
                <p className="text-gray-900">${formData.expenses}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-700">Staff Hours:</span>
                <p className="text-gray-900">{formData.staffHours} hours</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-700">Profit:</span>
                <p className="text-2xl font-bold text-gray-900">${formData.profit}</p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {formData.notes && (
        <Card>
          <div className="p-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Notes</h4>
            <p className="text-gray-700">{formData.notes}</p>
          </div>
        </Card>
      )}

      {formData.services.length > 0 && (
        <Card>
          <div className="p-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Services</h4>
            <div className="space-y-2">
              {formData.services.map((service, index) => (
                <div key={index} className="flex justify-between">
                  <span className="text-gray-700">{service.name}</span>
                  <span className="text-gray-900">{service.count} services - ${service.revenue}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      {formData.staffPerformance.length > 0 && (
        <Card>
          <div className="p-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Staff Performance</h4>
            <div className="space-y-2">
              {formData.staffPerformance.map((staffMember, index) => (
                <div key={index} className="flex justify-between">
                  <span className="text-gray-700">{staffMember.name}</span>
                  <span className="text-gray-900">{staffMember.appointments} appointments - ${staffMember.revenue}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}
    </div>
  )

  const steps = [
    { number: 1, title: 'Basic Information', description: 'Enter basic daily business info' },
    { number: 2, title: 'Financial Details', description: 'Set financial information' },
    { number: 3, title: 'Services & Staff', description: 'Add services and staff performance' },
    { number: 4, title: 'Review & Confirm', description: 'Review and create daily business' }
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
              onClick={() => navigate('/manager/daily-business')}
            >
              ← Back to Daily Business
            </Button>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Add Daily Business</h1>
          <p className="text-gray-600 mt-1">Create a new daily business record</p>
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
            {step === 4 && renderStep4()}

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
                  onClick={() => navigate('/manager/daily-business')}
                  disabled={loading}
                >
                  Cancel
                </Button>
                {step < 4 ? (
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
                    Create Daily Business
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

export default AddDailyBusiness
