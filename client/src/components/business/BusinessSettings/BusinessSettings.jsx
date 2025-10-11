import React, { useState } from 'react'
import { Card, Button, Input, Tabs, Alert, Modal } from '../../common'
import { BusinessTypeSelector } from '../BusinessTypeBadge/BusinessTypeBadge'

const BusinessSettings = ({ 
  business,
  onSave,
  onCancel,
  loading = false,
  className = ''
}) => {
  const [activeTab, setActiveTab] = useState(0)
  const [formData, setFormData] = useState({
    name: business?.name || '',
    type: business?.type || '',
    branch: business?.branch || '',
    address: business?.address || '',
    phone: business?.phone || '',
    email: business?.email || '',
    description: business?.description || '',
    website: business?.website || '',
    businessHours: business?.businessHours || {
      monday: { open: '09:00', close: '18:00', closed: false },
      tuesday: { open: '09:00', close: '18:00', closed: false },
      wednesday: { open: '09:00', close: '18:00', closed: false },
      thursday: { open: '09:00', close: '18:00', closed: false },
      friday: { open: '09:00', close: '18:00', closed: false },
      saturday: { open: '09:00', close: '18:00', closed: false },
      sunday: { open: '09:00', close: '18:00', closed: false }
    },
    settings: business?.settings || {
      allowOnlineBooking: true,
      requireDeposit: false,
      depositAmount: 0,
      cancellationPolicy: '',
      maxAdvanceBooking: 30,
      minAdvanceBooking: 1
    }
  })

  const [errors, setErrors] = useState({})
  const [showDeleteModal, setShowDeleteModal] = useState(false)

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

  const handleBusinessHoursChange = (day, field, value) => {
    setFormData(prev => ({
      ...prev,
      businessHours: {
        ...prev.businessHours,
        [day]: {
          ...prev.businessHours[day],
          [field]: value
        }
      }
    }))
  }

  const handleSettingsChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      settings: {
        ...prev.settings,
        [field]: value
      }
    }))
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Business name is required'
    }

    if (!formData.type) {
      newErrors.type = 'Business type is required'
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = () => {
    if (validateForm()) {
      onSave(formData)
    }
  }

  const handleDelete = () => {
    // Handle delete logic
    setShowDeleteModal(false)
  }

  const tabs = [
    { label: 'Basic Info', content: 'basic' },
    { label: 'Business Hours', content: 'hours' },
    { label: 'Settings', content: 'settings' }
  ]

  const days = [
    { key: 'monday', label: 'Monday' },
    { key: 'tuesday', label: 'Tuesday' },
    { key: 'wednesday', label: 'Wednesday' },
    { key: 'thursday', label: 'Thursday' },
    { key: 'friday', label: 'Friday' },
    { key: 'saturday', label: 'Saturday' },
    { key: 'sunday', label: 'Sunday' }
  ]

  const renderBasicInfo = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Business Name"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            error={errors.name}
            required
          />
          
          <Input
            label="Branch/Location"
            value={formData.branch}
            onChange={(e) => handleInputChange('branch', e.target.value)}
            placeholder="e.g., Downtown Branch"
          />
        </div>

        <div className="mt-4">
          <BusinessTypeSelector
            selectedType={formData.type}
            onTypeSelect={(type) => handleInputChange('type', type)}
          />
          {errors.type && (
            <p className="mt-1 text-sm text-red-600">{errors.type}</p>
          )}
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
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            error={errors.email}
            required
          />
        </div>

        <div className="mt-4">
          <Input
            label="Address"
            value={formData.address}
            onChange={(e) => handleInputChange('address', e.target.value)}
            placeholder="Full business address"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <Input
            label="Website"
            type="url"
            value={formData.website}
            onChange={(e) => handleInputChange('website', e.target.value)}
            placeholder="https://example.com"
          />
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
            placeholder="Brief description of your business"
          />
        </div>
      </div>
    </div>
  )

  const renderBusinessHours = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Business Hours</h3>
        
        <div className="space-y-4">
          {days.map((day) => (
            <div key={day.key} className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg">
              <div className="w-24">
                <label className="text-sm font-medium text-gray-700">
                  {day.label}
                </label>
              </div>
              
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={!formData.businessHours[day.key].closed}
                  onChange={(e) => handleBusinessHoursChange(day.key, 'closed', !e.target.checked)}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-600">Open</span>
              </div>
              
              {!formData.businessHours[day.key].closed && (
                <div className="flex items-center gap-2">
                  <Input
                    type="time"
                    value={formData.businessHours[day.key].open}
                    onChange={(e) => handleBusinessHoursChange(day.key, 'open', e.target.value)}
                    className="w-32"
                  />
                  <span className="text-gray-500">to</span>
                  <Input
                    type="time"
                    value={formData.businessHours[day.key].close}
                    onChange={(e) => handleBusinessHoursChange(day.key, 'close', e.target.value)}
                    className="w-32"
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const renderSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Booking Settings</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div>
              <h4 className="font-medium text-gray-900">Allow Online Booking</h4>
              <p className="text-sm text-gray-600">Enable customers to book appointments online</p>
            </div>
            <input
              type="checkbox"
              checked={formData.settings.allowOnlineBooking}
              onChange={(e) => handleSettingsChange('allowOnlineBooking', e.target.checked)}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
          </div>

          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div>
              <h4 className="font-medium text-gray-900">Require Deposit</h4>
              <p className="text-sm text-gray-600">Require a deposit for appointments</p>
            </div>
            <input
              type="checkbox"
              checked={formData.settings.requireDeposit}
              onChange={(e) => handleSettingsChange('requireDeposit', e.target.checked)}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
          </div>

          {formData.settings.requireDeposit && (
            <div className="p-4 border border-gray-200 rounded-lg">
              <Input
                label="Deposit Amount ($)"
                type="number"
                value={formData.settings.depositAmount}
                onChange={(e) => handleSettingsChange('depositAmount', parseFloat(e.target.value) || 0)}
                min="0"
                step="0.01"
              />
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Max Advance Booking (days)"
              type="number"
              value={formData.settings.maxAdvanceBooking}
              onChange={(e) => handleSettingsChange('maxAdvanceBooking', parseInt(e.target.value) || 30)}
              min="1"
            />
            
            <Input
              label="Min Advance Booking (hours)"
              type="number"
              value={formData.settings.minAdvanceBooking}
              onChange={(e) => handleSettingsChange('minAdvanceBooking', parseInt(e.target.value) || 1)}
              min="1"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cancellation Policy
            </label>
            <textarea
              value={formData.settings.cancellationPolicy}
              onChange={(e) => handleSettingsChange('cancellationPolicy', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
              placeholder="Describe your cancellation policy"
            />
          </div>
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
              {business ? 'Edit Business' : 'Create Business'}
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
                Save Changes
              </Button>
            </div>
          </div>

          <Tabs
            tabs={tabs}
            defaultActiveTab={0}
            onTabChange={(index) => setActiveTab(index)}
          >
            {renderBasicInfo()}
            {renderBusinessHours()}
            {renderSettings()}
          </Tabs>

          {business && (
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium text-red-900">Danger Zone</h3>
                  <p className="text-sm text-red-600">
                    Once you delete a business, there is no going back. Please be certain.
                  </p>
                </div>
                <Button
                  variant="danger"
                  onClick={() => setShowDeleteModal(true)}
                >
                  Delete Business
                </Button>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Business"
        size="md"
      >
        <div className="space-y-4">
          <Alert type="error">
            This action cannot be undone. This will permanently delete the business
            and all associated data including appointments, customers, and staff records.
          </Alert>
          
          <p className="text-sm text-gray-600">
            Please type <strong>{business?.name}</strong> to confirm deletion.
          </p>
          
          <div className="flex gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => setShowDeleteModal(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDelete}
              className="flex-1"
            >
              Delete Business
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default BusinessSettings
