import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  FaCalendarAlt,
  FaDollarSign,
  FaUsers,
  FaStickyNote,
  FaCloudSun,
  FaArrowLeft,
  FaSave,
  FaSpinner,
  FaInfoCircle
} from 'react-icons/fa'
import { toast } from 'react-hot-toast'
import managerService from '../../../../services/manager/managerService'

const AddDailyBusiness = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [businessInfo, setBusinessInfo] = useState(null)
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    notes: '',
    weather: '',
    specialEvents: [],
  })
  const [newEvent, setNewEvent] = useState('')
  const [errors, setErrors] = useState({})

  useEffect(() => {
    // Fetch business info from dashboard
    const fetchBusinessInfo = async () => {
      try {
        const res = await managerService.getDashboard()
        if (res.success && res.data.data) {
          const dashboard = res.data.data
          if (dashboard.business) {
            setBusinessInfo(dashboard.business)
          }
        }
      } catch (error) {
        console.error('Failed to fetch business info:', error)
      }
    }
    fetchBusinessInfo()
  }, [])

  const validateField = (name, value) => {
    let error = ''
    switch (name) {
      case 'date':
        if (!value) error = 'Date is required'
        break
      default:
        break
    }
    setErrors(prev => ({ ...prev, [name]: error }))
    return !error
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    validateField(name, value)
  }

  const handleAddEvent = () => {
    if (newEvent.trim()) {
      setFormData(prev => ({
        ...prev,
        specialEvents: [...prev.specialEvents, newEvent.trim()]
      }))
      setNewEvent('')
    }
  }

  const handleRemoveEvent = (index) => {
    setFormData(prev => ({
      ...prev,
      specialEvents: prev.specialEvents.filter((_, i) => i !== index)
    }))
  }

  const validateForm = () => {
    const fields = ['date']
    let isValid = true
    fields.forEach(field => {
      if (!validateField(field, formData[field])) {
        isValid = false
      }
    })
    return isValid
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      toast.error('Please fix the errors in the form')
      return
    }

    if (!businessInfo) {
      toast.error('Business information not found')
      return
    }

    setLoading(true)
    try {
      const submitData = {
        businessId: businessInfo.id,
        date: formData.date,
        notes: formData.notes || undefined,
        weather: formData.weather || undefined,
        specialEvents: formData.specialEvents.length > 0 ? formData.specialEvents : undefined,
      }

      const res = await managerService.addDailyBusiness(submitData)
      if (res.success) {
        toast.success('Daily business record added successfully!')
        navigate('/manager/daily-business')
      } else {
        toast.error(res.error || 'Failed to add daily business record')
      }
    } catch (error) {
      toast.error('Failed to add daily business record')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-3 sm:p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <FaArrowLeft />
          <span>Back</span>
        </button>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Add Daily Business Record</h1>
        <p className="text-gray-600 mt-1">
          Record your daily business summary. Metrics will be calculated from transactions.
        </p>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200  p-4 mb-6">
        <div className="flex items-start gap-3">
          <FaInfoCircle className="text-blue-600 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> This will automatically calculate metrics from all transactions for the selected date. 
              You can add notes, weather, and special events for context.
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white   border border-gray-200 p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Date Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <FaCalendarAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                max={new Date().toISOString().split('T')[0]}
                className={`w-full pl-10 pr-4 py-2 border ${
                  errors.date ? 'border-red-500' : 'border-gray-300'
                }  focus:outline-none focus:ring-2 focus:ring-primary-500`}
              />
            </div>
            {errors.date && <p className="text-red-500 text-xs mt-1">{errors.date}</p>}
          </div>

          {/* Business Info */}
          {businessInfo && (
            <div className="bg-gray-50  p-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Business</h3>
              <p className="text-gray-900 font-semibold">{businessInfo.name}</p>
              {businessInfo.type && (
                <p className="text-sm text-gray-500 capitalize mt-1">{businessInfo.type}</p>
              )}
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <div className="relative">
              <FaStickyNote className="absolute left-3 top-3 text-gray-400" />
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={4}
                className="w-full pl-10 pr-4 py-2 border border-gray-300  focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Add any notes or observations about the day (optional)"
              />
            </div>
          </div>

          {/* Weather */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Weather
            </label>
            <div className="relative">
              <FaCloudSun className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                name="weather"
                value={formData.weather}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-2 border border-gray-300  focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="e.g., Sunny, Rainy, Cloudy (optional)"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">Weather can help correlate with business performance</p>
          </div>

          {/* Special Events */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Special Events
            </label>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={newEvent}
                onChange={(e) => setNewEvent(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleAddEvent()
                  }
                }}
                className="flex-1 px-4 py-2 border border-gray-300  focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="e.g., Festival, Holiday, Special Promotion"
              />
              <button
                type="button"
                onClick={handleAddEvent}
                className="px-4 py-2 bg-gray-200 text-gray-700  hover:bg-gray-300 transition-colors"
              >
                Add
              </button>
            </div>
            
            {formData.specialEvents.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.specialEvents.map((event, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm"
                  >
                    {event}
                    <button
                      type="button"
                      onClick={() => handleRemoveEvent(index)}
                      className="text-primary-700 hover:text-primary-900"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
            <p className="text-xs text-gray-500 mt-2">
              Add special events that may have affected business (optional)
            </p>
          </div>

          {/* Submit Button */}
          <div className="flex gap-4 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-6 py-2 border border-gray-300  text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !businessInfo}
              className="flex items-center gap-2 px-6 py-2 bg-primary-600 text-white  hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <FaSpinner className="animate-spin" />
                  <span>Adding...</span>
                </>
              ) : (
                <>
                  <FaSave />
                  <span>Add Daily Business Record</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AddDailyBusiness
