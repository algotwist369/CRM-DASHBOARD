import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, Button, Input, Dropdown, DatePicker, Alert } from '../../../../components'
import { TargetAudience } from '../../../../components'
import notificationService from '../../../../services/notification/notificationService'
import { toast } from 'react-hot-toast'

const CreateCampaign = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'promotional',
    status: 'draft',
    startDate: new Date(),
    endDate: null,
    budget: '',
    targetAudience: 'all_customers',
    customAudience: [],
    tags: [],
    goals: {
      targetRecipients: '',
      targetOpenRate: '',
      targetClickRate: '',
      targetConversions: '',
      targetRevenue: ''
    }
  })
  const [errors, setErrors] = useState({})
  const [templates, setTemplates] = useState([])

  useEffect(() => {
    fetchTemplates()
  }, [])

  const fetchTemplates = async () => {

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }))
    }
  }

  const handleGoalChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      goals: { ...prev.goals, [field]: value }
    }))
  }

  const handleAudienceChange = (audience) => {
    setFormData(prev => ({ ...prev, targetAudience: audience }))
  }

  const handleCustomAudienceChange = (customAudience) => {
    setFormData(prev => ({ ...prev, customAudience }))
  }

  const handleTagAdd = (tag) => {
    if (tag && !formData.tags.includes(tag)) {
      setFormData(prev => ({ ...prev, tags: [...prev.tags, tag] }))
    }
  }

  const handleTagRemove = (tagToRemove) => {
    setFormData(prev => ({ ...prev, tags: prev.tags.filter(tag => tag !== tagToRemove) }))
  }

  const validateStep = (stepNumber) => {
    const newErrors = {}
    
    switch (stepNumber) {
      case 1:
        if (!formData.name) newErrors.name = 'Campaign name is required'
        if (!formData.description) newErrors.description = 'Description is required'
        if (!formData.type) newErrors.type = 'Type is required'
        break
      case 2:
        if (!formData.startDate) newErrors.startDate = 'Start date is required'
        if (!formData.endDate) newErrors.endDate = 'End date is required'
        if (!formData.budget) newErrors.budget = 'Budget is required'
        break
      case 3:
        if (!formData.targetAudience) newErrors.targetAudience = 'Target audience is required'
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
      
      const result = await notificationService.createCampaign(formData)
      
      if (result.success) {
        toast.success('Campaign created successfully!')
        navigate('/manager/notifications/campaigns', {
          state: { message: 'Campaign created successfully!' }
        })
      } else {
        setErrors({ general: result.error || 'Failed to create campaign' })
        toast.error(result.error || 'Failed to create campaign')
      }
    } catch (error) {
      console.error('Error creating campaign:', error)
      setErrors({ general: 'An unexpected error occurred' })
      toast.error('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const renderStep1 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Campaign Information</h3>
        <p className="text-gray-600">Set up the basic information for your campaign.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Campaign Name</label>
          <Input
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            placeholder="Enter campaign name"
            error={errors.name}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
          <Dropdown
            value={formData.type}
            onChange={(value) => handleInputChange('type', value)}
            options={[
              { value: 'promotional', label: 'Promotional' },
              { value: 'onboarding', label: 'Onboarding' },
              { value: 'seasonal', label: 'Seasonal' },
              { value: 'automated', label: 'Automated' },
              { value: 'feedback', label: 'Feedback' }
            ]}
            placeholder="Select type"
          />
          {errors.type && (
            <p className="mt-1 text-sm text-red-600">{errors.type}</p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
        <textarea
          value={formData.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          placeholder="Describe your campaign goals and strategy"
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-600">{errors.description}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
        <div className="flex flex-wrap gap-2 mb-2">
          {formData.tags.map((tag, index) => (
            <span
              key={index}
              className="inline-flex items-center gap-1 px-2 py-1 bg-primary-100 text-primary-800 text-sm rounded-md"
            >
              {tag}
              <button
                type="button"
                onClick={() => handleTagRemove(tag)}
                className="text-primary-600 hover:text-primary-800"
              >
                ×
              </button>
            </span>
          ))}
        </div>
        <Input
          placeholder="Add a tag and press Enter"
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              handleTagAdd(e.target.value)
              e.target.value = ''
            }
          }}
        />
      </div>
    </div>
  )

  const renderStep2 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Campaign Schedule & Budget</h3>
        <p className="text-gray-600">Set the campaign timeline and budget.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
          <DatePicker
            value={formData.startDate}
            onChange={(date) => handleInputChange('startDate', date)}
            placeholder="Select start date"
            error={errors.startDate}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
          <DatePicker
            value={formData.endDate}
            onChange={(date) => handleInputChange('endDate', date)}
            placeholder="Select end date"
            error={errors.endDate}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Budget</label>
        <Input
          type="number"
          value={formData.budget}
          onChange={(e) => handleInputChange('budget', e.target.value)}
          placeholder="0.00"
          error={errors.budget}
          prefix="$"
        />
      </div>

      <div>
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Campaign Goals</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Target Recipients</label>
            <Input
              type="number"
              value={formData.goals.targetRecipients}
              onChange={(e) => handleGoalChange('targetRecipients', e.target.value)}
              placeholder="0"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Target Open Rate (%)</label>
            <Input
              type="number"
              value={formData.goals.targetOpenRate}
              onChange={(e) => handleGoalChange('targetOpenRate', e.target.value)}
              placeholder="0"
              suffix="%"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Target Click Rate (%)</label>
            <Input
              type="number"
              value={formData.goals.targetClickRate}
              onChange={(e) => handleGoalChange('targetClickRate', e.target.value)}
              placeholder="0"
              suffix="%"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Target Conversions</label>
            <Input
              type="number"
              value={formData.goals.targetConversions}
              onChange={(e) => handleGoalChange('targetConversions', e.target.value)}
              placeholder="0"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Target Revenue</label>
            <Input
              type="number"
              value={formData.goals.targetRevenue}
              onChange={(e) => handleGoalChange('targetRevenue', e.target.value)}
              placeholder="0.00"
              prefix="$"
            />
          </div>
        </div>
      </div>
    </div>
  )

  const renderStep3 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Target Audience</h3>
        <p className="text-gray-600">Select who should receive this campaign.</p>
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

  const renderStep4 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Review & Confirm</h3>
        <p className="text-gray-600">Review the campaign details before creating.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <div className="p-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Campaign Details</h4>
            <div className="space-y-2">
              <div>
                <span className="text-sm font-medium text-gray-700">Name:</span>
                <p className="text-gray-900">{formData.name}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-700">Type:</span>
                <p className="text-gray-900 capitalize">{formData.type}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-700">Status:</span>
                <p className="text-gray-900 capitalize">{formData.status}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-700">Budget:</span>
                <p className="text-gray-900">${formData.budget}</p>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Schedule</h4>
            <div className="space-y-2">
              <div>
                <span className="text-sm font-medium text-gray-700">Start Date:</span>
                <p className="text-gray-900">{formData.startDate?.toLocaleDateString()}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-700">End Date:</span>
                <p className="text-gray-900">{formData.endDate?.toLocaleDateString()}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-700">Duration:</span>
                <p className="text-gray-900">
                  {formData.startDate && formData.endDate 
                    ? Math.ceil((formData.endDate - formData.startDate) / (1000 * 60 * 60 * 24)) + 1
                    : 0} days
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <div className="p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Description</h4>
          <p className="text-gray-700">{formData.description}</p>
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
          </div>
        </div>
      </Card>

      <Card>
        <div className="p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Campaign Goals</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span className="text-sm font-medium text-gray-700">Target Recipients:</span>
              <p className="text-gray-900">{formData.goals.targetRecipients || 'Not set'}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-700">Target Open Rate:</span>
              <p className="text-gray-900">{formData.goals.targetOpenRate || 'Not set'}%</p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-700">Target Click Rate:</span>
              <p className="text-gray-900">{formData.goals.targetClickRate || 'Not set'}%</p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-700">Target Conversions:</span>
              <p className="text-gray-900">{formData.goals.targetConversions || 'Not set'}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-700">Target Revenue:</span>
              <p className="text-gray-900">${formData.goals.targetRevenue || 'Not set'}</p>
            </div>
          </div>
        </div>
      </Card>

      {formData.tags.length > 0 && (
        <Card>
          <div className="p-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Tags</h4>
            <div className="flex flex-wrap gap-2">
              {formData.tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2 py-1 bg-primary-100 text-primary-800 text-sm rounded-md"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </Card>
      )}
    </div>
  )

  const steps = [
    { number: 1, title: 'Information', description: 'Set campaign details' },
    { number: 2, title: 'Schedule & Budget', description: 'Set timeline and budget' },
    { number: 3, title: 'Audience', description: 'Select target audience' },
    { number: 4, title: 'Review', description: 'Review and create campaign' }
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
              onClick={() => navigate('/manager/notifications/campaigns')}
            >
              ← Back to Campaigns
            </Button>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Create Campaign</h1>
          <p className="text-gray-600 mt-1">Create a new marketing campaign</p>
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
                  onClick={() => navigate('/manager/notifications/campaigns')}
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
                    Create Campaign
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

export default CreateCampaign
