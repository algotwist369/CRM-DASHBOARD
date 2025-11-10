import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  FaCalendarAlt,
  FaRupeeSign,
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

const EditDailyBusiness = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [record, setRecord] = useState(null)
  const [formData, setFormData] = useState({
    notes: '',
    weather: '',
    totalExpenses: '',
    specialEvents: [],
  })
  const [newEvent, setNewEvent] = useState('')
  const [errors, setErrors] = useState({})

  useEffect(() => {
    const fetchRecord = async () => {
      try {
        setLoading(true)
        const res = await managerService.getDailyBusinessRecords({ limit: 1000 })
        if (res.success) {
          const records = res.data?.data || []
          const foundRecord = records.find(r => r._id === id || r.id === id)
          if (foundRecord) {
            setRecord(foundRecord)
            setFormData({
              notes: foundRecord.notes || '',
              weather: foundRecord.weather || '',
              totalExpenses: foundRecord.totalExpenses || '',
              specialEvents: foundRecord.specialEvents || [],
            })
          } else {
            toast.error('Daily business record not found')
            navigate('/manager/daily-business')
          }
        } else {
          toast.error('Failed to load daily business record')
          navigate('/manager/daily-business')
        }
      } catch (error) {
        toast.error('Failed to load daily business record')
        navigate('/manager/daily-business')
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchRecord()
    }
  }, [id, navigate])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
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

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    setSaving(true)
    try {
      const submitData = {
        notes: formData.notes || undefined,
        weather: formData.weather || undefined,
        totalExpenses: formData.totalExpenses ? parseFloat(formData.totalExpenses) : undefined,
        specialEvents: formData.specialEvents.length > 0 ? formData.specialEvents : undefined,
      }

      // Recalculate net profit if expenses changed
      if (submitData.totalExpenses !== undefined && record) {
        submitData.netProfit = (record.totalIncome || 0) - submitData.totalExpenses
      }

      const res = await managerService.updateDailyBusiness(id, submitData)
      if (res.success) {
        toast.success('Daily business record updated successfully!')
        navigate(`/manager/daily-business/${id}`)
      } else {
        toast.error(res.error || 'Failed to update daily business record')
      }
    } catch (error) {
      toast.error('Failed to update daily business record')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <FaSpinner className="animate-spin text-4xl text-primary-600" />
      </div>
    )
  }

  if (!record) {
    return null
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
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Edit Daily Business Record</h1>
        <p className="text-gray-600 mt-1">Update daily business information for {new Date(record.date).toLocaleDateString('en-IN')}</p>
      </div>

      {/* Form */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Read-only Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="text-sm text-gray-500">Date</p>
              <p className="font-semibold text-gray-900">
                {new Date(record.date).toLocaleDateString('en-IN', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric'
                })}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Income</p>
              <p className="font-semibold text-green-600">
                ₹{parseInt(record.totalIncome || 0).toLocaleString('en-IN')}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Customers</p>
              <p className="font-semibold text-gray-900">
                {record.totalCustomers || 0}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Current Expenses</p>
              <p className="font-semibold text-red-600">
                ₹{parseInt(record.totalExpenses || 0).toLocaleString('en-IN')}
              </p>
            </div>
          </div>

          {/* Expenses */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Total Expenses (₹)
            </label>
            <div className="relative">
              <FaRupeeSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="number"
                name="totalExpenses"
                value={formData.totalExpenses}
                onChange={handleChange}
                min="0"
                step="0.01"
                className={`w-full pl-10 pr-4 py-2 border ${
                  errors.totalExpenses ? 'border-red-500' : 'border-gray-300'
                } rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500`}
                placeholder="Enter total expenses for the day"
              />
            </div>
            {errors.totalExpenses && <p className="text-red-500 text-xs mt-1">{errors.totalExpenses}</p>}
            <p className="text-xs text-gray-500 mt-1">
              Net Profit will be automatically calculated: Income - Expenses
            </p>
          </div>

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
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
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
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="e.g., Sunny, Rainy, Cloudy (optional)"
              />
            </div>
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
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="e.g., Festival, Holiday, Special Promotion"
              />
              <button
                type="button"
                onClick={handleAddEvent}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
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
          </div>

          {/* Submit Button */}
          <div className="flex gap-4 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <FaSpinner className="animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <FaSave />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EditDailyBusiness

