import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, Button, Input, Alert, Tabs } from '../../../../components'
import adminService from '../../../../services/admin/adminService'
import businessService from '../../../../services/admin/businessService'
import { toast } from 'react-hot-toast'

const CreateManager = () => {
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState({
    // Personal Information
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    
    // Business Assignment
    businessId: '',
    role: 'manager',
    status: 'pending',
    
    // Permissions
    permissions: {
      appointments: true,
      staff: true,
      customers: true,
      reports: false,
      inventory: false,
      marketing: false,
      settings: false
    },
    
    // Additional Information
    department: '',
    hireDate: new Date().toISOString().split('T')[0],
    notes: ''
  })
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [businesses, setBusinesses] = useState([])

  useEffect(() => {
    fetchBusinesses()
  }, [])

  const fetchBusinesses = async () => {
    try {
      // Simulate API call
      
  }

  const steps = [
    { title: 'Personal Info', description: 'Manager details' },
    { title: 'Business Assignment', description: 'Assign to business' },
    { title: 'Permissions', description: 'Set access rights' },
    { title: 'Review', description: 'Review and confirm' }
  ]

  const roleOptions = [
    { value: 'manager', label: 'General Manager' },
    { value: 'operations_manager', label: 'Operations Manager' },
    { value: 'spa_manager', label: 'Spa Manager' },
    { value: 'salon_manager', label: 'Salon Manager' },
    { value: 'assistant_manager', label: 'Assistant Manager' }
  ]

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }))
    }
  }

  const handlePermissionToggle = (permission) => {
    setFormData(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [permission]: !prev.permissions[permission]
      }
    }))
  }

  const validateStep = (step) => {
    const newErrors = {}
    
    if (step === 0) {
      // Personal Information Validation
      if (!formData.firstName.trim()) {
        newErrors.firstName = 'First name is required'
      }
      if (!formData.lastName.trim()) {
        newErrors.lastName = 'Last name is required'
      }
      if (!formData.email.trim()) {
        newErrors.email = 'Email is required'
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = 'Please enter a valid email address'
      }
      if (!formData.phone.trim()) {
        newErrors.phone = 'Phone number is required'
      }
      if (!formData.password.trim()) {
        newErrors.password = 'Password is required'
      } else if (formData.password.length < 8) {
        newErrors.password = 'Password must be at least 8 characters'
      }
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match'
      }
    } else if (step === 1) {
      // Business Assignment Validation
      if (!formData.businessId) {
        newErrors.businessId = 'Please select a business'
      }
      if (!formData.role) {
        newErrors.role = 'Please select a role'
      }
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1)
    }
  }

  const handlePrevious = () => {
    setCurrentStep(prev => prev - 1)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateStep(currentStep)) return
    
    setIsLoading(true)
    setErrors({})
    
    try {
      const result = await adminService.createManager(formData)
      
      if (result.success) {
        toast.success('Manager created successfully!')
        navigate(`/admin/managers`, {
          state: { message: 'Manager created successfully!' }
        })
      } else {
        setErrors({ general: result.error || 'Failed to create manager. Please try again.' })
        toast.error(result.error || 'Failed to create manager')
      }
    } catch (error) {
      console.error('Create manager error:', error)
      setErrors({ general: 'An unexpected error occurred. Please try again.' })
      toast.error('An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const renderPersonalInfo = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="First Name"
          name="firstName"
          value={formData.firstName}
          onChange={(e) => handleInputChange('firstName', e.target.value)}
          placeholder="Enter first name"
          required
          error={errors.firstName}
        />
        <Input
          label="Last Name"
          name="lastName"
          value={formData.lastName}
          onChange={(e) => handleInputChange('lastName', e.target.value)}
          placeholder="Enter last name"
          required
          error={errors.lastName}
        />
      </div>

      <Input
        label="Email Address"
        name="email"
        type="email"
        value={formData.email}
        onChange={(e) => handleInputChange('email', e.target.value)}
        placeholder="manager@example.com"
        required
        error={errors.email}
        icon={
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        }
      />

      <Input
        label="Phone Number"
        name="phone"
        type="tel"
        value={formData.phone}
        onChange={(e) => handleInputChange('phone', e.target.value)}
        placeholder="+1 (555) 123-4567"
        required
        error={errors.phone}
        icon={
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
          </svg>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="Password"
          name="password"
          type="password"
          value={formData.password}
          onChange={(e) => handleInputChange('password', e.target.value)}
          placeholder="Create a password"
          required
          error={errors.password}
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          }
        />
        <Input
          label="Confirm Password"
          name="confirmPassword"
          type="password"
          value={formData.confirmPassword}
          onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
          placeholder="Confirm password"
          required
          error={errors.confirmPassword}
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
      </div>
    </div>
  )

  const renderBusinessAssignment = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Assign to Business <span className="text-red-500">*</span>
        </label>
        <select
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
          value={formData.businessId}
          onChange={(e) => handleInputChange('businessId', e.target.value)}
        >
          <option value="">Select a business</option>
          {businesses.map((business) => (
            <option key={business.id} value={business.id}>
              {business.name} ({business.type}) - {business.status}
            </option>
          ))}
        </select>
        {errors.businessId && <p className="mt-1 text-sm text-red-600">{errors.businessId}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Role <span className="text-red-500">*</span>
        </label>
        <select
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
          value={formData.role}
          onChange={(e) => handleInputChange('role', e.target.value)}
        >
          <option value="">Select a role</option>
          {roleOptions.map((role) => (
            <option key={role.value} value={role.value}>
              {role.label}
            </option>
          ))}
        </select>
        {errors.role && <p className="mt-1 text-sm text-red-600">{errors.role}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Initial Status
        </label>
        <select
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
          value={formData.status}
          onChange={(e) => handleInputChange('status', e.target.value)}
        >
          <option value="pending">Pending Approval</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
        <p className="mt-1 text-sm text-gray-500">
          Set the initial status for this manager
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="Department (Optional)"
          name="department"
          value={formData.department}
          onChange={(e) => handleInputChange('department', e.target.value)}
          placeholder="e.g., Operations, Sales"
        />
        <Input
          label="Hire Date"
          name="hireDate"
          type="date"
          value={formData.hireDate}
          onChange={(e) => handleInputChange('hireDate', e.target.value)}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Notes (Optional)
        </label>
        <textarea
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
          rows={3}
          value={formData.notes}
          onChange={(e) => handleInputChange('notes', e.target.value)}
          placeholder="Additional notes about this manager..."
        />
      </div>
    </div>
  )

  const renderPermissions = () => (
    <div className="space-y-6">
      <div className="text-sm text-gray-600 mb-4">
        Select the permissions this manager should have. You can modify these later.
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries(formData.permissions).map(([permission, enabled]) => (
          <div key={permission} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div>
              <h4 className="font-medium text-gray-900 capitalize">
                {permission.replace(/([A-Z])/g, ' $1').trim()}
              </h4>
              <p className="text-sm text-gray-500">
                {permission === 'appointments' && 'Manage appointments and bookings'}
                {permission === 'staff' && 'Manage staff members and schedules'}
                {permission === 'customers' && 'View and manage customer information'}
                {permission === 'reports' && 'Access reports and analytics'}
                {permission === 'inventory' && 'Manage inventory and products'}
                {permission === 'marketing' && 'Access marketing tools and campaigns'}
                {permission === 'settings' && 'Modify business settings and configuration'}
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={enabled}
                onChange={() => handlePermissionToggle(permission)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
            </label>
          </div>
        ))}
      </div>

      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start">
          <svg className="w-5 h-5 text-blue-600 mt-0.5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h4 className="text-sm font-medium text-blue-900">Permission Guidelines</h4>
            <p className="text-sm text-blue-700 mt-1">
              Start with basic permissions (appointments, staff, customers) and add more as needed. 
              You can always modify these permissions later from the manager's profile.
            </p>
          </div>
        </div>
      </div>
    </div>
  )

  const renderReview = () => {
    const selectedBusiness = businesses.find(b => b.id === formData.businessId)
    const selectedRole = roleOptions.find(r => r.value === formData.role)

    return (
      <div className="space-y-6">
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-700">Name:</span>
              <p className="text-gray-900">{formData.firstName} {formData.lastName}</p>
            </div>
            <div>
              <span className="font-medium text-gray-700">Email:</span>
              <p className="text-gray-900">{formData.email}</p>
            </div>
            <div>
              <span className="font-medium text-gray-700">Phone:</span>
              <p className="text-gray-900">{formData.phone}</p>
            </div>
            <div>
              <span className="font-medium text-gray-700">Hire Date:</span>
              <p className="text-gray-900">{new Date(formData.hireDate).toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Business Assignment</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-700">Business:</span>
              <p className="text-gray-900">{selectedBusiness?.name || 'Not selected'}</p>
            </div>
            <div>
              <span className="font-medium text-gray-700">Role:</span>
              <p className="text-gray-900">{selectedRole?.label || 'Not selected'}</p>
            </div>
            <div>
              <span className="font-medium text-gray-700">Status:</span>
              <p className="text-gray-900 capitalize">{formData.status}</p>
            </div>
            <div>
              <span className="font-medium text-gray-700">Department:</span>
              <p className="text-gray-900">{formData.department || 'Not specified'}</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Permissions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
            {Object.entries(formData.permissions).map(([permission, enabled]) => (
              <div key={permission} className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${enabled ? 'bg-green-500' : 'bg-gray-300'}`} />
                <span className={enabled ? 'text-gray-900' : 'text-gray-500'}>
                  {permission.replace(/([A-Z])/g, ' $1').trim()}
                </span>
              </div>
            ))}
          </div>
        </div>

        {formData.notes && (
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Notes</h3>
            <p className="text-sm text-gray-700">{formData.notes}</p>
          </div>
        )}
      </div>
    )
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return renderPersonalInfo()
      case 1:
        return renderBusinessAssignment()
      case 2:
        return renderPermissions()
      case 3:
        return renderReview()
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Create New Manager</h1>
          <p className="mt-2 text-gray-600">
            Add a new manager to your system
          </p>
        </div>

        <Card className="py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              {steps.map((step, index) => (
                <div key={index} className="flex items-center">
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                    index <= currentStep
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}>
                    {index + 1}
                  </div>
                  <div className="ml-2 hidden sm:block">
                    <p className={`text-sm font-medium ${
                      index <= currentStep ? 'text-primary-600' : 'text-gray-500'
                    }`}>
                      {step.title}
                    </p>
                    <p className="text-xs text-gray-500">{step.description}</p>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`hidden sm:block w-16 h-0.5 ml-4 ${
                      index < currentStep ? 'bg-primary-600' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Error Alert */}
            {errors.general && (
              <Alert type="error" message={errors.general} className="mb-6" />
            )}

            {/* Step Content */}
            {renderStepContent()}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8">
              <Button
                type="button"
                variant="outline"
                onClick={handlePrevious}
                disabled={currentStep === 0}
              >
                Previous
              </Button>
              
              {currentStep < steps.length - 1 ? (
                <Button
                  type="button"
                  variant="primary"
                  onClick={handleNext}
                >
                  Next
                </Button>
              ) : (
                <Button
                  type="submit"
                  variant="primary"
                  loading={isLoading}
                >
                  {isLoading ? 'Creating Manager...' : 'Create Manager'}
                </Button>
              )}
            </div>
          </form>
        </Card>
      </div>
    </div>
  )
}

export default CreateManager
