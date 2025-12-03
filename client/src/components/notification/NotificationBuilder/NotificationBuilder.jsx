import React, { useState } from 'react'
import { Card, Button, Input, Dropdown, Tabs, Badge, Alert } from '../../common'
import TargetAudience from '../TargetAudience/TargetAudience'

const NotificationBuilder = ({ 
  onSave,
  onSend,
  onPreview,
  onCancel,
  initialData = {},
  templates = [],
  className = ''
}) => {
  const [formData, setFormData] = useState({
    title: initialData.title || '',
    message: initialData.message || '',
    type: initialData.type || 'appointment',
    priority: initialData.priority || 'medium',
    recipientType: initialData.recipientType || 'all',
    recipients: initialData.recipients || [],
    scheduledAt: initialData.scheduledAt || '',
    template: initialData.template || '',
    metadata: initialData.metadata || {},
    ...initialData
  })

  const [errors, setErrors] = useState({})
  const [activeTab, setActiveTab] = useState(0)

  const notificationTypes = [
    { value: 'appointment', label: 'Appointment', icon: '📅', description: 'Appointment-related notifications' },
    { value: 'payment', label: 'Payment', icon: '💳', description: 'Payment and billing notifications' },
    { value: 'reminder', label: 'Reminder', icon: '⏰', description: 'Service reminders and follow-ups' },
    { value: 'promotion', label: 'Promotion', icon: '🎁', description: 'Promotional offers and discounts' },
    { value: 'system', label: 'System', icon: '⚙️', description: 'System updates and maintenance' },
    { value: 'alert', label: 'Alert', icon: '🚨', description: 'Important alerts and warnings' }
  ]

  const priorityLevels = [
    { value: 'low', label: 'Low', color: 'info', description: 'Non-urgent notifications' },
    { value: 'medium', label: 'Medium', color: 'warning', description: 'Standard priority notifications' },
    { value: 'high', label: 'High', color: 'danger', description: 'Urgent notifications' }
  ]

  const recipientTypes = [
    { value: 'all', label: 'All Customers', description: 'Send to all customers' },
    { value: 'specific', label: 'Specific Customers', description: 'Send to selected customers' },
    { value: 'segment', label: 'Customer Segment', description: 'Send to customer segment' },
    { value: 'business', label: 'Business Staff', description: 'Send to business staff' }
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

  const handleMetadataChange = (key, value) => {
    setFormData(prev => ({
      ...prev,
      metadata: {
        ...prev.metadata,
        [key]: value
      }
    }))
  }

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required'
    }
    
    if (!formData.message.trim()) {
      newErrors.message = 'Message is required'
    }
    
    if (formData.recipientType === 'specific' && (!formData.recipients || formData.recipients.length === 0)) {
      newErrors.recipients = 'Please select at least one recipient'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = () => {
    if (validateForm()) {
      onSave(formData)
    }
  }

  const handleSend = () => {
    if (validateForm()) {
      onSend(formData)
    }
  }

  const handlePreview = () => {
    if (validateForm()) {
      onPreview(formData)
    }
  }

  const handleTemplateSelect = (template) => {
    setFormData(prev => ({
      ...prev,
      title: template.title || prev.title,
      message: template.message || prev.message,
      type: template.type || prev.type,
      template: template.id
    }))
  }

  const tabs = [
    { label: 'Content', content: 'content' },
    { label: 'Audience', content: 'audience' },
    { label: 'Schedule', content: 'schedule' },
    { label: 'Settings', content: 'settings' }
  ]

  const renderContentTab = () => (
    <div className="space-y-6">
      {/* Template Selection */}
      {templates.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Choose Template</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map((template) => (
              <Card
                key={template.id}
                className={`cursor-pointer transition-all duration-200 ${
                  formData.template === template.id
                    ? 'ring-2 ring-primary-500 border-primary-500'
                    : 'hover:shadow-md'
                }`}
                onClick={() => handleTemplateSelect(template)}
              >
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">{template.icon}</span>
                    <h4 className="font-medium text-gray-900">{template.name}</h4>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{template.description}</p>
                  <Badge variant="outline" size="sm">{template.type}</Badge>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Notification Type */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Notification Type</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {notificationTypes.map((type) => (
            <button
              key={type.value}
              onClick={() => handleInputChange('type', type.value)}
              className={`p-4 text-left border  transition-all duration-200 ${
                formData.type === type.value
                  ? 'bg-primary-50 border-primary-300 ring-2 ring-primary-200'
                  : 'bg-white border-gray-200 hover:border-primary-300 hover:bg-primary-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{type.icon}</span>
                <div>
                  <p className="font-medium text-gray-900">{type.label}</p>
                  <p className="text-sm text-gray-500">{type.description}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Priority Level */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Priority Level</h3>
        <div className="flex gap-3">
          {priorityLevels.map((priority) => (
            <button
              key={priority.value}
              onClick={() => handleInputChange('priority', priority.value)}
              className={`flex-1 p-4 text-left border  transition-all duration-200 ${
                formData.priority === priority.value
                  ? 'bg-primary-50 border-primary-300 ring-2 ring-primary-200'
                  : 'bg-white border-gray-200 hover:border-primary-300 hover:bg-primary-50'
              }`}
            >
              <div className="flex items-center gap-2">
                <Badge variant={priority.color} size="sm">{priority.label}</Badge>
                <p className="text-sm text-gray-600">{priority.description}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Title and Message */}
      <div className="space-y-4">
        <Input
          label="Notification Title"
          name="title"
          value={formData.title}
          onChange={(e) => handleInputChange('title', e.target.value)}
          placeholder="Enter notification title"
          required
          error={errors.title}
        />
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Message <span className="text-red-500">*</span>
          </label>
          <textarea
            className="block w-full  border-gray-300  focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
            rows={6}
            value={formData.message}
            onChange={(e) => handleInputChange('message', e.target.value)}
            placeholder="Enter notification message"
          />
          {errors.message && <p className="mt-1 text-sm text-red-600">{errors.message}</p>}
        </div>
      </div>
    </div>
  )

  const renderAudienceTab = () => (
    <div className="space-y-6">
      <TargetAudience
        recipientType={formData.recipientType}
        recipients={formData.recipients}
        onRecipientTypeChange={(type) => handleInputChange('recipientType', type)}
        onRecipientsChange={(recipients) => handleInputChange('recipients', recipients)}
        error={errors.recipients}
      />
    </div>
  )

  const renderScheduleTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Send Schedule</h3>
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <label className="flex items-center">
              <input
                type="radio"
                name="schedule"
                value="now"
                checked={!formData.scheduledAt}
                onChange={() => handleInputChange('scheduledAt', '')}
                className="mr-2"
              />
              <span className="text-sm font-medium text-gray-700">Send Now</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="schedule"
                value="scheduled"
                checked={!!formData.scheduledAt}
                onChange={() => {
                  if (!formData.scheduledAt) {
                    const now = new Date()
                    now.setMinutes(now.getMinutes() + 30) // Default to 30 minutes from now
                    handleInputChange('scheduledAt', now.toISOString().slice(0, 16))
                  }
                }}
                className="mr-2"
              />
              <span className="text-sm font-medium text-gray-700">Schedule for Later</span>
            </label>
          </div>
          
          {formData.scheduledAt && (
            <Input
              type="datetime-local"
              label="Scheduled Date & Time"
              name="scheduledAt"
              value={formData.scheduledAt}
              onChange={(e) => handleInputChange('scheduledAt', e.target.value)}
            />
          )}
        </div>
      </div>
    </div>
  )

  const renderSettingsTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Settings</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Custom Metadata (Optional)
            </label>
            <div className="space-y-2">
              {Object.entries(formData.metadata).map(([key, value]) => (
                <div key={key} className="flex gap-2">
                  <Input
                    placeholder="Key"
                    value={key}
                    onChange={(e) => {
                      const newMetadata = { ...formData.metadata }
                      delete newMetadata[key]
                      newMetadata[e.target.value] = value
                      setFormData(prev => ({ ...prev, metadata: newMetadata }))
                    }}
                    className="flex-1"
                  />
                  <Input
                    placeholder="Value"
                    value={value}
                    onChange={(e) => handleMetadataChange(key, e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => {
                      const newMetadata = { ...formData.metadata }
                      delete newMetadata[key]
                      setFormData(prev => ({ ...prev, metadata: newMetadata }))
                    }}
                  >
                    Remove
                  </Button>
                </div>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleMetadataChange('', '')}
              >
                Add Metadata
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className={className}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Notification Builder</h2>
          <p className="text-gray-600">
            Create and send notifications to your customers
          </p>
        </div>
        <div className="flex gap-2">
          {onCancel && (
            <Button
              variant="outline"
              onClick={onCancel}
            >
              Cancel
            </Button>
          )}
          {onPreview && (
            <Button
              variant="outline"
              onClick={handlePreview}
            >
              Preview
            </Button>
          )}
          {onSave && (
            <Button
              variant="secondary"
              onClick={handleSave}
            >
              Save Draft
            </Button>
          )}
          {onSend && (
            <Button
              variant="primary"
              onClick={handleSend}
            >
              Send Notification
            </Button>
          )}
        </div>
      </div>

      {/* Error Display */}
      {Object.keys(errors).length > 0 && (
        <Alert
          type="error"
          title="Please fix the following errors:"
          className="mb-6"
        >
          <ul className="list-disc list-inside space-y-1">
            {Object.entries(errors).map(([field, error]) => (
              <li key={field}>{error}</li>
            ))}
          </ul>
        </Alert>
      )}

      {/* Tabs */}
      <Tabs
        tabs={tabs}
        defaultActiveTab={0}
        onTabChange={(index) => setActiveTab(index)}
      >
        {renderContentTab()}
        {renderAudienceTab()}
        {renderScheduleTab()}
        {renderSettingsTab()}
      </Tabs>
    </div>
  )
}

export default NotificationBuilder
