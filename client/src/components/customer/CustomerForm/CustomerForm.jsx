import React, { useState, useEffect } from 'react'
import { Card, Button, Input, Tabs, Alert, Modal } from '../../common'

const CustomerForm = ({ 
  customer = null,
  onSave,
  onCancel,
  loading = false,
  className = ''
}) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    dateOfBirth: '',
    gender: '',
    status: 'active',
    preferredServices: [],
    notes: '',
    emergencyContact: {
      name: '',
      phone: '',
      relationship: ''
    },
    allergies: [],
    medicalConditions: []
  })

  const [errors, setErrors] = useState({})
  const [activeTab, setActiveTab] = useState(0)

  useEffect(() => {
    if (customer) {
      setFormData({
        name: customer.name || '',
        email: customer.email || '',
        phone: customer.phone || '',
        address: customer.address || '',
        dateOfBirth: customer.dateOfBirth || '',
        gender: customer.gender || '',
        status: customer.status || 'active',
        preferredServices: customer.preferredServices || [],
        notes: customer.notes || '',
        emergencyContact: customer.emergencyContact || {
          name: '',
          phone: '',
          relationship: ''
        },
        allergies: customer.allergies || [],
        medicalConditions: customer.medicalConditions || []
      })
    }
  }, [customer])

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }))
    }
  }

  const handleEmergencyContactChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      emergencyContact: {
        ...prev.emergencyContact,
        [field]: value
      }
    }))
  }

  const handleArrayFieldChange = (field, value) => {
    const items = value.split(',').map(item => item.trim()).filter(item => item)
    setFormData(prev => ({
      ...prev,
      [field]: items
    }))
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid'
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = () => {
    if (validateForm()) {
      onSave(formData)
    }
  }

  const tabs = [
    { label: 'Basic Info', content: 'basic' },
    { label: 'Contact & Address', content: 'contact' },
    { label: 'Medical Info', content: 'medical' },
    { label: 'Additional Info', content: 'additional' }
  ]

  const genderOptions = [
    { label: 'Male', value: 'male' },
    { label: 'Female', value: 'female' },
    { label: 'Other', value: 'other' },
    { label: 'Prefer not to say', value: 'prefer_not_to_say' }
  ]

  const statusOptions = [
    { label: 'Active', value: 'active' },
    { label: 'Inactive', value: 'inactive' },
    { label: 'VIP', value: 'vip' },
    { label: 'New', value: 'new' }
  ]

  const relationshipOptions = [
    { label: 'Spouse', value: 'spouse' },
    { label: 'Parent', value: 'parent' },
    { label: 'Child', value: 'child' },
    { label: 'Sibling', value: 'sibling' },
    { label: 'Friend', value: 'friend' },
    { label: 'Other', value: 'other' }
  ]

  const renderBasicInfo = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Full Name"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            error={errors.name}
            required
          />
          
          <Input
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            error={errors.email}
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <Input
            label="Phone Number"
            type="tel"
            value={formData.phone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            error={errors.phone}
            required
          />
          
          <Input
            label="Date of Birth"
            type="date"
            value={formData.dateOfBirth}
            onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
            <select
              value={formData.gender}
              onChange={(e) => handleInputChange('gender', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300  focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">Select gender</option>
              {genderOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={formData.status}
              onChange={(e) => handleInputChange('status', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300  focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
            >
              {statusOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  )

  const renderContactInfo = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Contact & Address</h3>
        
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
          <textarea
            value={formData.address}
            onChange={(e) => handleInputChange('address', e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300  focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
            placeholder="Enter full address"
          />
        </div>
      </div>

      {/* Emergency Contact */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Emergency Contact</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Emergency Contact Name"
            value={formData.emergencyContact.name}
            onChange={(e) => handleEmergencyContactChange('name', e.target.value)}
          />
          
          <Input
            label="Emergency Contact Phone"
            type="tel"
            value={formData.emergencyContact.phone}
            onChange={(e) => handleEmergencyContactChange('phone', e.target.value)}
          />
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Relationship</label>
          <select
            value={formData.emergencyContact.relationship}
            onChange={(e) => handleEmergencyContactChange('relationship', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300  focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="">Select relationship</option>
            {relationshipOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  )

  const renderMedicalInfo = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Medical Information</h3>
        
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Allergies</label>
          <Input
            value={formData.allergies.join(', ')}
            onChange={(e) => handleArrayFieldChange('allergies', e.target.value)}
            placeholder="Enter allergies separated by commas (e.g., peanuts, shellfish)"
          />
          <p className="text-sm text-gray-500 mt-1">
            Separate multiple allergies with commas
          </p>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Medical Conditions</label>
          <Input
            value={formData.medicalConditions.join(', ')}
            onChange={(e) => handleArrayFieldChange('medicalConditions', e.target.value)}
            placeholder="Enter medical conditions separated by commas"
          />
          <p className="text-sm text-gray-500 mt-1">
            Separate multiple conditions with commas
          </p>
        </div>
      </div>
    </div>
  )

  const renderAdditionalInfo = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Additional Information</h3>
        
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Services</label>
          <Input
            value={formData.preferredServices.join(', ')}
            onChange={(e) => handleArrayFieldChange('preferredServices', e.target.value)}
            placeholder="Enter preferred services separated by commas"
          />
          <p className="text-sm text-gray-500 mt-1">
            Separate multiple services with commas
          </p>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
          <textarea
            value={formData.notes}
            onChange={(e) => handleInputChange('notes', e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300  focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
            placeholder="Add any additional notes about the customer"
          />
        </div>
      </div>
    </div>
  )

  return (
    <div className={className}>
      <Card>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-gray-900">
              {customer ? 'Edit Customer' : 'Add New Customer'}
            </h2>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={onCancel}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleSave}
                loading={loading}
              >
                {customer ? 'Update Customer' : 'Create Customer'}
              </Button>
            </div>
          </div>

          <Tabs
            tabs={tabs}
            defaultActiveTab={0}
            onTabChange={(index) => setActiveTab(index)}
          >
            {renderBasicInfo()}
            {renderContactInfo()}
            {renderMedicalInfo()}
            {renderAdditionalInfo()}
          </Tabs>
        </div>
      </Card>
    </div>
  )
}

export default CustomerForm
