import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, Button, Input, Dropdown, DatePicker, TimePicker, Alert } from '../../../../components'
import { NotificationBuilder, TargetAudience } from '../../../../components'
import notificationService from '../../../../services/notification/notificationService'
import { toast } from 'react-hot-toast'

const CreateNotification = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    type: 'appointment_reminder',
    priority: 'medium',
    targetAudience: 'customers',
    scheduledAt: null,
    scheduledTime: '',
    status: 'draft',
    campaignId: null,
    customAudience: [],
    template: null
  })
  const [errors, setErrors] = useState({})
  const [templates, setTemplates] = useState([])
  const [campaigns, setCampaigns] = useState([])

  useEffect(() => {
    fetchInitialData()
  }, [])

  const fetchInitialData = async () => {
    try {
      // Simulate API calls
      await Promise.all([
        fetchTemplates(),
        fetchCampaigns()
      ])
    } catch (error) {
      console.error('Error fetching initial data:', error)
    }
  }

  const fetchTemplates = async () => {

  const fetchCampaigns = async () => {

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }))
    }
  }

  const handleTemplateSelect = (templateId) => {
    const template = templates.find(t => t.id === templateId)
    if (template) {
      setFormData(prev => ({
        ...prev,
        template: template,
        type: template.type,
        message: template.content
      }))
    }
  }

  const handleAudienceChange = (audience) => {
    setFormData(prev => ({ ...prev, targetAudience: audience }))
  }

  const handleCustomAudienceChange = (customAudience) => {
    setFormData(prev => ({ ...prev, customAudience }))
  }

  const validateStep = (stepNumber) => {
    const newErrors = {}
    
    switch (stepNumber) {
      case 1:
        if (!formData.title) newErrors.title = 'Title is required'
        if (!formData.message) newErrors.message = 'Message is required'
        if (!formData.type) newErrors.type = 'Type is required'
        if (!formData.priority) newErrors.priority = 'Priority is required'
        break
      case 2:
        if (!formData.targetAudience) newErrors.targetAudience = 'Target audience is required'
        break
      case 3:
        if (formData.status === 'scheduled' && !formData.scheduledAt) {
          newErrors.scheduledAt = 'Scheduled date is required'
        }
        if (formData.status === 'scheduled' && !formData.scheduledTime) {
          newErrors.scheduledTime = 'Scheduled time is required'
        }
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
    if (!validateStep(3)) return
    
    try {
      setLoading(true)
      setErrors({})
      
      const result = await notificationService.createNotification(formData)
      
      if (result.success) {
        toast.success('Notification created successfully!')
        navigate('/manager/notifications', {
          state: { message: 'Notification created successfully!' }
        })
      } else {
        setErrors({ general: result.error || 'Failed to create notification' })
        toast.error(result.error || 'Failed to create notification')
      }
    } catch (error) {
      console.error('Error creating notification:', error)
      setErrors({ general: 'An unexpected error occurred' })
      toast.error('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const renderStep1 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Notification Content</h3>
        <p className="text-gray-600">Create the content for your notification.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Template</label>
          <Dropdown
            value={formData.template?.id || ''}
            onChange={handleTemplateSelect}
            options={templates.map(template => ({
              value: template.id,
              label: template.name
            }))}
            placeholder="Select a template (optional)"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
          <Dropdown
            value={formData.type}
            onChange={(value) => handleInputChange('type', value)}
            options={[
              { value: 'appointment_reminder', label: 'Appointment Reminder' },
              { value: 'promotional', label: 'Promotional' },
              { value: 'staff_notification', label: 'Staff Notification' },
              { value: 'announcement', label: 'Announcement' },
              { value: 'feedback_request', label: 'Feedback Request' }
            ]}
            placeholder="Select type"
          />
          {errors.type && (
            <p className="mt-1 text-sm text-red-600">{errors.type}</p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
        <Input
          value={formData.title}
          onChange={(e) => handleInputChange('title', e.target.value)}
          placeholder="Enter notification title"
          error={errors.title}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
        <textarea
          value={formData.message}
          onChange={(e) => handleInputChange('message', e.target.value)}
          placeholder="Enter notification message"
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
        />
        {errors.message && (
          <p className="mt-1 text-sm text-red-600">{errors.message}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
          <Dropdown
            value={formData.priority}
            onChange={(value) => handleInputChange('priority', value)}
            options={[
              { value: 'low', label: 'Low' },
              { value: 'medium', label: 'Medium' },
              { value: 'high', label: 'High' }
            ]}
            placeholder="Select priority"
          />
          {errors.priority && (
            <p className="mt-1 text-sm text-red-600">{errors.priority}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Campaign (Optional)</label>
          <Dropdown
            value={formData.campaignId || ''}
            onChange={(value) => handleInputChange('campaignId', value)}
            options={campaigns.map(campaign => ({
              value: campaign.id,
              label: campaign.name
            }))}
            placeholder="Select campaign"
          />
        </div>
      </div>
    </div>
  )

  const renderStep2 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Target Audience</h3>
        <p className="text-gray-600">Select who should receive this notification.</p>
      </div>

      <TargetAudience
        value={formData.targetAudience}
        onChange={handleAudienceChange}
        customAudience={formData.customAudience}
        onCustomAudienceChange={handleCustomAudienceChange}
        error={errors.targetAudience}
      />
    </div>
  )

  const renderStep3 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Schedule & Send</h3>
        <p className="text-gray-600">Choose when to send this notification.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Send Status</label>
          <Dropdown
            value={formData.status}
            onChange={(value) => handleInputChange('status', value)}
            options={[
              { value: 'draft', label: 'Save as Draft' },
              { value: 'scheduled', label: 'Schedule for Later' },
              { value: 'send_now', label: 'Send Now' }
            ]}
            placeholder="Select send status"
          />
        </div>

        {formData.status === 'scheduled' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Scheduled Date</label>
            <DatePicker
              value={formData.scheduledAt}
              onChange={(date) => handleInputChange('scheduledAt', date)}
              placeholder="Select date"
              error={errors.scheduledAt}
            />
          </div>
        )}
      </div>

      {formData.status === 'scheduled' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Scheduled Time</label>
          <TimePicker
            value={formData.scheduledTime}
            onChange={(time) => handleInputChange('scheduledTime', time)}
            placeholder="Select time"
            error={errors.scheduledTime}
          />
        </div>
      )}

      {/* Preview */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Preview</h4>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4.828 7l2.586 2.586a2 2 0 002.828 0L12.828 7H4.828z" />
              </svg>
            </div>
            <div className="flex-1">
              <h5 className="font-medium text-gray-900">{formData.title || 'Notification Title'}</h5>
              <p className="text-sm text-gray-600 mt-1">{formData.message || 'Notification message will appear here...'}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs text-gray-500">Type: {formData.type.replace('_', ' ')}</span>
                <span className="text-xs text-gray-500">Priority: {formData.priority}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const renderStep4 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Review & Confirm</h3>
        <p className="text-gray-600">Review the notification details before creating.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <div className="p-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Notification Details</h4>
            <div className="space-y-2">
              <div>
                <span className="text-sm font-medium text-gray-700">Title:</span>
                <p className="text-gray-900">{formData.title}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-700">Type:</span>
                <p className="text-gray-900 capitalize">{formData.type.replace('_', ' ')}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-700">Priority:</span>
                <p className="text-gray-900 capitalize">{formData.priority}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-700">Status:</span>
                <p className="text-gray-900 capitalize">{formData.status.replace('_', ' ')}</p>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Target Audience</h4>
            <div className="space-y-2">
              <div>
                <span className="text-sm font-medium text-gray-700">Audience:</span>
                <p className="text-gray-900 capitalize">{formData.targetAudience.replace('_', ' ')}</p>
              </div>
              {formData.customAudience.length > 0 && (
                <div>
                  <span className="text-sm font-medium text-gray-700">Custom Audience:</span>
                  <p className="text-gray-900">{formData.customAudience.length} recipients</p>
                </div>
              )}
              {formData.campaignId && (
                <div>
                  <span className="text-sm font-medium text-gray-700">Campaign:</span>
                  <p className="text-gray-900">{campaigns.find(c => c.id === formData.campaignId)?.name}</p>
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <div className="p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Message Content</h4>
          <div className="bg-gray-50 p-4 rounded-lg">
            <h5 className="font-medium text-gray-900 mb-2">{formData.title}</h5>
            <p className="text-gray-700">{formData.message}</p>
          </div>
        </div>
      </Card>

      {formData.status === 'scheduled' && (
        <Card>
          <div className="p-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Schedule</h4>
            <div className="space-y-2">
              <div>
                <span className="text-sm font-medium text-gray-700">Scheduled Date:</span>
                <p className="text-gray-900">{formData.scheduledAt?.toLocaleDateString()}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-700">Scheduled Time:</span>
                <p className="text-gray-900">{formData.scheduledTime}</p>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  )

  const steps = [
    { number: 1, title: 'Content', description: 'Create notification content' },
    { number: 2, title: 'Audience', description: 'Select target audience' },
    { number: 3, title: 'Schedule', description: 'Set schedule and preview' },
    { number: 4, title: 'Review', description: 'Review and create notification' }
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
              onClick={() => navigate('/manager/notifications')}
            >
              ← Back to Notifications
            </Button>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Create Notification</h1>
          <p className="text-gray-600 mt-1">Create a new notification for your business</p>
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
                  onClick={() => navigate('/manager/notifications')}
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
                    Create Notification
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

export default CreateNotification
