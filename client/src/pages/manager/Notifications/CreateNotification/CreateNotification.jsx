import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import {
  FaArrowLeft,
  FaSave,
  FaPaperPlane,
  FaUsers,
  FaImage,
  FaLink,
  FaTag,
  FaCalendarAlt,
  FaEnvelope,
  FaSms,
  FaWhatsapp,
  FaMobileAlt,
  FaSpinner
} from 'react-icons/fa'
import managerService from '../../../../services/manager/managerService'

const CreateNotification = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [targetCount, setTargetCount] = useState(0)
  const [estimatedCost, setEstimatedCost] = useState(0)
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    type: 'general',
    targetAudience: {
      type: 'all'
    },
    content: {
      imageUrl: '',
      actionUrl: '',
      actionText: '',
      discountCode: '',
      discountPercentage: 0,
      discountAmount: 0
    },
    delivery: {
      channels: ['email'],
      scheduledAt: new Date().toISOString().slice(0, 16),
      timezone: 'Asia/Kolkata',
      priority: 'normal'
    },
    campaign: {
      name: '',
      description: '',
      tags: []
    }
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    if (name.includes('.')) {
      const [parent, child] = name.split('.')
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }))
    }
  }

  const handleChannelToggle = (channel) => {
    setFormData(prev => {
      const channels = prev.delivery.channels || []
      const newChannels = channels.includes(channel)
        ? channels.filter(c => c !== channel)
        : [...channels, channel]
      
      return {
        ...prev,
        delivery: {
          ...prev.delivery,
          channels: newChannels
        }
      }
    })
  }

  const calculateTargetCount = async () => {
    try {
      const result = await managerService.createNotification({
        ...formData,
        _skipCreation: true // Flag to just calculate, not create
      })
      
      if (result.success) {
        setTargetCount(result.data.targetCount || 0)
        setEstimatedCost(result.data.estimatedCost || 0)
      }
    } catch (error) {
      console.error('Failed to calculate target count:', error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.title || !formData.message) {
      toast.error('Please fill in title and message')
      return
    }

    if (!formData.delivery.channels || formData.delivery.channels.length === 0) {
      toast.error('Please select at least one delivery channel')
      return
    }

    try {
      setLoading(true)
      const result = await managerService.createNotification(formData)
      
      if (result.success) {
        toast.success('Notification created successfully!')
        navigate('/manager/notifications')
      } else {
        toast.error(result.error || 'Failed to create notification')
      }
    } catch (error) {
      toast.error('Failed to create notification')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const notificationTypes = [
    { value: 'promotion', label: 'Promotion' },
    { value: 'reminder', label: 'Reminder' },
    { value: 'announcement', label: 'Announcement' },
    { value: 'offer', label: 'Offer' },
    { value: 'event', label: 'Event' },
    { value: 'appointment', label: 'Appointment' },
    { value: 'general', label: 'General' }
  ]

  const targetAudienceTypes = [
    { value: 'all', label: 'All Customers' },
    { value: 'new', label: 'New Customers' },
    { value: 'loyalty', label: 'Loyalty Members' },
    { value: 'inactive', label: 'Inactive Customers' },
    { value: 'segment', label: 'Custom Segment' },
    { value: 'individual', label: 'Individual Customers' }
  ]

  const channels = [
    { value: 'email', label: 'Email', icon: <FaEnvelope /> },
    { value: 'sms', label: 'SMS', icon: <FaSms /> },
    { value: 'whatsapp', label: 'WhatsApp', icon: <FaWhatsapp /> },
    { value: 'push', label: 'Push', icon: <FaMobileAlt /> }
  ]

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/manager/notifications')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <FaArrowLeft className="text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Create Notification</h1>
            <p className="text-gray-600 mt-1">Send messages to your customers</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notification Type *
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
              >
                {notificationTypes.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Enter notification title"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Message *
              </label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Enter notification message"
                required
              />
            </div>
          </div>
        </div>

        {/* Target Audience */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <FaUsers />
            Target Audience
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Audience Type *
              </label>
              <select
                name="targetAudience.type"
                value={formData.targetAudience.type}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
              >
                {targetAudienceTypes.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>

            {formData.targetAudience.type === 'segment' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Segment Criteria
                </label>
                <div className="space-y-2">
                  <input
                    type="number"
                    placeholder="Min Visits"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      targetAudience: {
                        ...prev.targetAudience,
                        segments: [{
                          name: 'Custom Segment',
                          criteria: {
                            ...prev.targetAudience.segments?.[0]?.criteria,
                            minVisits: parseInt(e.target.value) || undefined
                          }
                        }]
                      }
                    }))}
                  />
                  <input
                    type="number"
                    placeholder="Min Spent"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      targetAudience: {
                        ...prev.targetAudience,
                        segments: [{
                          name: 'Custom Segment',
                          criteria: {
                            ...prev.targetAudience.segments?.[0]?.criteria,
                            minSpent: parseInt(e.target.value) || undefined
                          }
                        }]
                      }
                    }))}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Content</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <FaImage />
                Image URL (Optional)
              </label>
              <input
                type="url"
                name="content.imageUrl"
                value={formData.content.imageUrl}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="https://example.com/image.jpg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <FaLink />
                Action URL (Optional)
              </label>
              <input
                type="url"
                name="content.actionUrl"
                value={formData.content.actionUrl}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="https://example.com/action"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Action Text (Optional)
              </label>
              <input
                type="text"
                name="content.actionText"
                value={formData.content.actionText}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Book Now, Claim Offer, etc."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Discount Code (Optional)
                </label>
                <input
                  type="text"
                  name="content.discountCode"
                  value={formData.content.discountCode}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="SAVE20"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Discount % (Optional)
                </label>
                <input
                  type="number"
                  name="content.discountPercentage"
                  value={formData.content.discountPercentage}
                  onChange={handleChange}
                  min="0"
                  max="100"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="20"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Delivery Settings */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <FaCalendarAlt />
            Delivery Settings
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Delivery Channels *
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {channels.map(channel => (
                  <label
                    key={channel.value}
                    className={`flex items-center gap-2 p-3 border-2 rounded-lg cursor-pointer transition-colors ${
                      formData.delivery.channels.includes(channel.value)
                        ? 'border-primary-600 bg-primary-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={formData.delivery.channels.includes(channel.value)}
                      onChange={() => handleChannelToggle(channel.value)}
                      className="sr-only"
                    />
                    {channel.icon}
                    <span className="text-sm font-medium">{channel.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Scheduled Date & Time
              </label>
              <input
                type="datetime-local"
                name="delivery.scheduledAt"
                value={formData.delivery.scheduledAt}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Priority
              </label>
              <select
                name="delivery.priority"
                value={formData.delivery.priority}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="low">Low</option>
                <option value="normal">Normal</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>
        </div>

        {/* Campaign Info (Optional) */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <FaTag />
            Campaign Information (Optional)
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Campaign Name
              </label>
              <input
                type="text"
                name="campaign.name"
                value={formData.campaign.name}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Summer Sale 2024"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Campaign Description
              </label>
              <textarea
                name="campaign.description"
                value={formData.campaign.description}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Campaign description..."
              />
            </div>
          </div>
        </div>

        {/* Estimated Cost */}
        {(targetCount > 0 || estimatedCost > 0) && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-900">Target Audience</p>
                <p className="text-2xl font-bold text-blue-600">{targetCount} customers</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-blue-900">Estimated Cost</p>
                <p className="text-2xl font-bold text-blue-600">${estimatedCost.toFixed(2)}</p>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-4">
          <button
            type="button"
            onClick={() => navigate('/manager/notifications')}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <>
                <FaSpinner className="animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <FaSave />
                Save as Draft
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

export default CreateNotification
