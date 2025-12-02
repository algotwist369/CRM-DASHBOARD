import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import {
  FaArrowLeft,
  FaSave,
  FaBullhorn,
  FaUsers,
  FaCalendarAlt,
  FaSpinner,
  FaTag
} from 'react-icons/fa'
import managerService from '../../../../services/manager/managerService'

const CreateCampaign = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'promotional',
    settings: {
      startDate: new Date().toISOString().slice(0, 16),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
      isActive: true,
      autoSend: false,
      frequency: 'once',
      maxSends: 1
    },
    targetAudience: {
      segments: [{
        name: 'Default Segment',
        criteria: {
          customerType: 'all'
        }
      }]
    },
    content: {
      templates: [{
        channel: 'email',
        message: '',
        title: ''
      }]
    },
    abTesting: {
      enabled: false
    }
  })

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    if (name.includes('.')) {
      const [parent, child] = name.split('.')
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: type === 'checkbox' ? checked : value
        }
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.name) {
      toast.error('Please enter campaign name')
      return
    }

    try {
      setLoading(true)
      const result = await managerService.createCampaign(formData)
      
      if (result.success) {
        toast.success('Campaign created successfully!')
        navigate('/manager/notifications/campaigns')
      } else {
        toast.error(result.error || 'Failed to create campaign')
      }
    } catch (error) {
      toast.error('Failed to create campaign')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/manager/notifications/campaigns')}
            className="p-2 hover:bg-gray-100  transition-colors"
          >
            <FaArrowLeft className="text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <FaBullhorn className="text-primary-600" />
              Create Campaign
            </h1>
            <p className="text-gray-600 mt-1">Create a new marketing campaign</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="bg-white   border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Campaign Details</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Campaign Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300  focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Summer Sale 2024"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300  focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Campaign description..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Campaign Type *
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300  focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
              >
                <option value="promotional">Promotional</option>
                <option value="seasonal">Seasonal</option>
                <option value="loyalty">Loyalty</option>
                <option value="win_back">Win Back</option>
                <option value="announcement">Announcement</option>
                <option value="event">Event</option>
              </select>
            </div>
          </div>
        </div>

        {/* Settings */}
        <div className="bg-white   border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <FaCalendarAlt />
            Campaign Settings
          </h2>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date *
                </label>
                <input
                  type="datetime-local"
                  name="settings.startDate"
                  value={formData.settings.startDate}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300  focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Date *
                </label>
                <input
                  type="datetime-local"
                  name="settings.endDate"
                  value={formData.settings.endDate}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300  focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                name="settings.isActive"
                checked={formData.settings.isActive}
                onChange={handleChange}
                className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
              />
              <label className="text-sm font-medium text-gray-700">Active Campaign</label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Frequency
              </label>
              <select
                name="settings.frequency"
                value={formData.settings.frequency}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300  focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="once">Once</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
          </div>
        </div>

        {/* Target Audience */}
        <div className="bg-white   border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <FaUsers />
            Target Audience
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Customer Type
              </label>
              <select
                name="targetAudience.segments.0.criteria.customerType"
                value={formData.targetAudience.segments[0]?.criteria?.customerType || 'all'}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  targetAudience: {
                    ...prev.targetAudience,
                    segments: [{
                      name: 'Default Segment',
                      criteria: {
                        ...prev.targetAudience.segments[0]?.criteria,
                        customerType: e.target.value
                      }
                    }]
                  }
                }))}
                className="w-full px-4 py-2 border border-gray-300  focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="all">All Customers</option>
                <option value="new">New Customers</option>
                <option value="returning">Returning Customers</option>
                <option value="loyalty">Loyalty Members</option>
                <option value="inactive">Inactive Customers</option>
                <option value="high_value">High Value Customers</option>
              </select>
            </div>
          </div>
        </div>

        {/* Content Template */}
        <div className="bg-white   border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Message Template</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Message Title
              </label>
              <input
                type="text"
                value={formData.content.templates[0]?.title || ''}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  content: {
                    ...prev.content,
                    templates: [{
                      ...prev.content.templates[0],
                      title: e.target.value
                    }]
                  }
                }))}
                className="w-full px-4 py-2 border border-gray-300  focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Campaign Title"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Message *
              </label>
              <textarea
                value={formData.content.templates[0]?.message || ''}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  content: {
                    ...prev.content,
                    templates: [{
                      ...prev.content.templates[0],
                      message: e.target.value
                    }]
                  }
                }))}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300  focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Campaign message..."
                required
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-4">
          <button
            type="button"
            onClick={() => navigate('/manager/notifications/campaigns')}
            className="px-6 py-2 border border-gray-300 text-gray-700  hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2 bg-primary-600 text-white  hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <>
                <FaSpinner className="animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <FaSave />
                Create Campaign
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

export default CreateCampaign
