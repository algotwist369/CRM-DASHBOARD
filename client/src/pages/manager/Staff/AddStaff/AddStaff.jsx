import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, Button, Input, Alert, Tabs } from '../../../../components'
import managerService from '../../../../services/manager/managerService'
import { toast } from 'react-hot-toast'

const AddStaff = () => {
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState({
    // Personal Information
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    dateOfBirth: '',
    
    // Employment Information
    role: '',
    status: 'active',
    hireDate: new Date().toISOString().split('T')[0],
    hourlyRate: '',
    schedule: 'full-time',
    
    // Emergency Contact
    emergencyContactName: '',
    emergencyContactPhone: '',
    emergencyContactRelationship: '',
    
    // Skills and Specialties
    specialties: [],
    experience: '',
    certifications: '',
    
    // Schedule
    monday: { start: '09:00', end: '17:00', working: true },
    tuesday: { start: '09:00', end: '17:00', working: true },
    wednesday: { start: '09:00', end: '17:00', working: true },
    thursday: { start: '09:00', end: '17:00', working: true },
    friday: { start: '09:00', end: '17:00', working: true },
    saturday: { start: '10:00', end: '16:00', working: true },
    sunday: { start: '', end: '', working: false },
    
    // Additional Information
    notes: ''
  })
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)

  const steps = [
    { title: 'Personal Info', description: 'Basic information' },
    { title: 'Employment', description: 'Job details' },
    { title: 'Schedule', description: 'Working hours' },
    { title: 'Review', description: 'Review and confirm' }
  ]

  const roleOptions = [
    { value: 'senior_stylist', label: 'Senior Stylist' },
    { value: 'stylist', label: 'Stylist' },
    { value: 'color_specialist', label: 'Color Specialist' },
    { value: 'junior_stylist', label: 'Junior Stylist' },
    { value: 'receptionist', label: 'Receptionist' },
    { value: 'assistant', label: 'Assistant' }
  ]

  const specialtyOptions = [
    'Haircut', 'Coloring', 'Styling', 'Highlights', 'Balayage', 'Perms',
    'Extensions', 'Beard Trim', 'Facial', 'Massage', 'Manicure', 'Pedicure',
    'Customer Service', 'Scheduling', 'Inventory Management'
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

  const handleNestedInputChange = (parent, field, value) => {
    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [field]: value
      }
    }))
  }

  const handleSpecialtyToggle = (specialty) => {
    setFormData(prev => ({
      ...prev,
      specialties: prev.specialties.includes(specialty)
        ? prev.specialties.filter(s => s !== specialty)
        : [...prev.specialties, specialty]
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
      if (!formData.address.trim()) {
        newErrors.address = 'Address is required'
      }
    } else if (step === 1) {
      // Employment Information Validation
      if (!formData.role) {
        newErrors.role = 'Role is required'
      }
      if (!formData.hourlyRate.trim()) {
        newErrors.hourlyRate = 'Hourly rate is required'
      } else if (isNaN(formData.hourlyRate) || parseFloat(formData.hourlyRate) <= 0) {
        newErrors.hourlyRate = 'Please enter a valid hourly rate'
      }
      if (!formData.emergencyContactName.trim()) {
        newErrors.emergencyContactName = 'Emergency contact name is required'
      }
      if (!formData.emergencyContactPhone.trim()) {
        newErrors.emergencyContactPhone = 'Emergency contact phone is required'
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
      const result = await managerService.addStaff(formData)
      
      if (result.success) {
        toast.success('Staff member added successfully!')
        navigate(`/manager/staff/${result.data.id}`, {
          state: { message: 'Staff member added successfully!' }
        })
      } else {
        setErrors({ general: result.error || 'Failed to add staff member. Please try again.' })
        toast.error(result.error || 'Failed to add staff member')
      }
    } catch (error) {
      console.error('Add staff error:', error)
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
        placeholder="staff@example.com"
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

      <Input
        label="Address"
        name="address"
        value={formData.address}
        onChange={(e) => handleInputChange('address', e.target.value)}
        placeholder="123 Main Street, City, State 12345"
        required
        error={errors.address}
        icon={
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        }
      />

      <Input
        label="Date of Birth (Optional)"
        name="dateOfBirth"
        type="date"
        value={formData.dateOfBirth}
        onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
      />
    </div>
  )

  const renderEmployment = () => (
    <div className="space-y-6">
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Status
          </label>
          <select
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
            value={formData.status}
            onChange={(e) => handleInputChange('status', e.target.value)}
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="pending">Pending</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Schedule Type
          </label>
          <select
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
            value={formData.schedule}
            onChange={(e) => handleInputChange('schedule', e.target.value)}
          >
            <option value="full-time">Full-time</option>
            <option value="part-time">Part-time</option>
            <option value="contract">Contract</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="Hire Date"
          name="hireDate"
          type="date"
          value={formData.hireDate}
          onChange={(e) => handleInputChange('hireDate', e.target.value)}
          required
        />
        <Input
          label="Hourly Rate"
          name="hourlyRate"
          type="number"
          step="0.01"
          value={formData.hourlyRate}
          onChange={(e) => handleInputChange('hourlyRate', e.target.value)}
          placeholder="25.00"
          required
          error={errors.hourlyRate}
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
          }
        />
      </div>

      {/* Emergency Contact */}
      <div className="pt-6 border-t border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Emergency Contact</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Input
            label="Contact Name"
            name="emergencyContactName"
            value={formData.emergencyContactName}
            onChange={(e) => handleInputChange('emergencyContactName', e.target.value)}
            placeholder="John Doe"
            required
            error={errors.emergencyContactName}
          />
          <Input
            label="Contact Phone"
            name="emergencyContactPhone"
            type="tel"
            value={formData.emergencyContactPhone}
            onChange={(e) => handleInputChange('emergencyContactPhone', e.target.value)}
            placeholder="+1 (555) 987-6543"
            required
            error={errors.emergencyContactPhone}
          />
          <Input
            label="Relationship"
            name="emergencyContactRelationship"
            value={formData.emergencyContactRelationship}
            onChange={(e) => handleInputChange('emergencyContactRelationship', e.target.value)}
            placeholder="Spouse, Parent, etc."
          />
        </div>
      </div>

      {/* Specialties */}
      <div className="pt-6 border-t border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Specialties & Skills</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {specialtyOptions.map((specialty) => (
            <label key={specialty} className="flex items-center p-2 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
              <input
                type="checkbox"
                checked={formData.specialties.includes(specialty)}
                onChange={() => handleSpecialtyToggle(specialty)}
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="ml-2 text-sm text-gray-700">{specialty}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Experience (Optional)
          </label>
          <textarea
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
            rows={3}
            value={formData.experience}
            onChange={(e) => handleInputChange('experience', e.target.value)}
            placeholder="Describe relevant experience..."
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Certifications (Optional)
          </label>
          <textarea
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
            rows={3}
            value={formData.certifications}
            onChange={(e) => handleInputChange('certifications', e.target.value)}
            placeholder="List any relevant certifications..."
          />
        </div>
      </div>
    </div>
  )

  const renderSchedule = () => (
    <div className="space-y-6">
      <div className="text-sm text-gray-600 mb-4">
        Set the working hours for each day of the week. You can mark days as off.
      </div>

      {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => (
        <div key={day} className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg">
          <div className="w-20">
            <label className="block text-sm font-medium text-gray-700 capitalize">
              {day}
            </label>
          </div>
          
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData[day].working}
              onChange={(e) => handleNestedInputChange(day, 'working', e.target.checked)}
              className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <span className="text-sm text-gray-700">Working</span>
          </div>

          {formData[day].working && (
            <div className="flex items-center gap-2">
              <Input
                type="time"
                value={formData[day].start}
                onChange={(e) => handleNestedInputChange(day, 'start', e.target.value)}
                className="w-32"
              />
              <span className="text-gray-500">to</span>
              <Input
                type="time"
                value={formData[day].end}
                onChange={(e) => handleNestedInputChange(day, 'end', e.target.value)}
                className="w-32"
              />
            </div>
          )}

          {!formData[day].working && (
            <span className="text-sm text-gray-500">Off</span>
          )}
        </div>
      ))}
    </div>
  )

  const renderReview = () => {
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
              <span className="font-medium text-gray-700">Address:</span>
              <p className="text-gray-900">{formData.address}</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Employment Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-700">Role:</span>
              <p className="text-gray-900">{selectedRole?.label || 'Not selected'}</p>
            </div>
            <div>
              <span className="font-medium text-gray-700">Status:</span>
              <p className="text-gray-900 capitalize">{formData.status}</p>
            </div>
            <div>
              <span className="font-medium text-gray-700">Schedule:</span>
              <p className="text-gray-900 capitalize">{formData.schedule}</p>
            </div>
            <div>
              <span className="font-medium text-gray-700">Hourly Rate:</span>
              <p className="text-gray-900">${formData.hourlyRate}/hour</p>
            </div>
            <div>
              <span className="font-medium text-gray-700">Hire Date:</span>
              <p className="text-gray-900">{new Date(formData.hireDate).toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Emergency Contact</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-700">Name:</span>
              <p className="text-gray-900">{formData.emergencyContactName}</p>
            </div>
            <div>
              <span className="font-medium text-gray-700">Phone:</span>
              <p className="text-gray-900">{formData.emergencyContactPhone}</p>
            </div>
            <div>
              <span className="font-medium text-gray-700">Relationship:</span>
              <p className="text-gray-900">{formData.emergencyContactRelationship}</p>
            </div>
          </div>
        </div>

        {formData.specialties.length > 0 && (
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Specialties</h3>
            <div className="flex flex-wrap gap-2">
              {formData.specialties.map((specialty, index) => (
                <span key={index} className="px-3 py-1 bg-primary-100 text-primary-800 text-sm rounded-full">
                  {specialty}
                </span>
              ))}
            </div>
          </div>
        )}

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
        return renderEmployment()
      case 2:
        return renderSchedule()
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
          <h1 className="text-3xl font-bold text-gray-900">Add New Staff Member</h1>
          <p className="mt-2 text-gray-600">
            Add a new staff member to your team
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
                  {isLoading ? 'Adding Staff Member...' : 'Add Staff Member'}
                </Button>
              )}
            </div>
          </form>
        </Card>
      </div>
    </div>
  )
}

export default AddStaff
