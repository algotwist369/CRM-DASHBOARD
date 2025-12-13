import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  FaUser,
  FaPhoneAlt,
  FaEnvelope,
  FaIdBadge,
  FaDollarSign,
  FaPercent,
  FaBriefcase,
  FaUserTag,
  FaLock,
  FaArrowLeft,
  FaSave,
  FaSpinner
} from 'react-icons/fa'
import { toast } from 'react-hot-toast'
import managerService from '../../../../services/manager/managerService'

const EditStaff = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'stylist',
    specialization: '',
    experience: 0,
    salary: '',
    commission: 0,
    username: '',
    pin: '',
  })
  const [errors, setErrors] = useState({})

  useEffect(() => {
    const fetchStaff = async () => {
      try {
        setLoading(true)
        // Fetch staff details - we'll use getStaff and find the one with matching id
        const res = await managerService.getStaff({ limit: 1000 })
        if (res.success) {
          const staffList = res.data?.data || []
          const staff = staffList.find(s => s._id === id || s.id === id)
          if (staff) {
            setFormData({
              name: staff.name || '',
              email: staff.email || '',
              phone: staff.phone || '',
              role: staff.role || 'stylist',
              specialization: staff.specialization || '',
              experience: staff.experience || 0,
              salary: staff.salary || '',
              commission: staff.commission || 0,
              username: staff.username || '',
              pin: staff.pin || '',
            })
          } else {
            toast.error('Staff member not found')
            navigate('/manager/staff')
          }
        } else {
          toast.error('Failed to load staff details')
          navigate('/manager/staff')
        }
      } catch (error) {
        toast.error('Failed to load staff details')
        navigate('/manager/staff')
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchStaff()
    }
  }, [id, navigate])

  const validateField = (name, value) => {
    let error = ''
    switch (name) {
      case 'name':
        if (!value.trim()) error = 'Name is required'
        break
      case 'phone':
        if (!value.trim()) error = 'Phone is required'
        else if (!/^[6-9]\d{9}$/.test(value.replace(/\D/g, ''))) {
          error = 'Enter a valid 10-digit phone number'
        }
        break
      case 'email':
        if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          error = 'Enter a valid email address'
        }
        break
      case 'username':
        if (value && value.length < 3) {
          error = 'Username must be at least 3 characters'
        }
        break
      case 'pin':
        if (value && !/^\d{4}$/.test(value)) {
          error = 'PIN must be exactly 4 digits'
        }
        break
      case 'salary':
        if (value && (isNaN(value) || parseFloat(value) < 0)) {
          error = 'Enter a valid salary amount'
        }
        break
      case 'commission':
        if (value && (isNaN(value) || parseFloat(value) < 0 || parseFloat(value) > 100)) {
          error = 'Commission must be between 0 and 100'
        }
        break
      case 'experience':
        if (isNaN(value) || parseFloat(value) < 0) {
          error = 'Experience must be a valid number'
        }
        break
      default:
        break
    }
    setErrors(prev => ({ ...prev, [name]: error }))
    return !error
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    let processedValue = value

    if (name === 'phone') {
      processedValue = value.replace(/\D/g, '').slice(0, 10)
    } else if (name === 'pin') {
      processedValue = value.replace(/\D/g, '').slice(0, 4)
    } else if (name === 'salary' || name === 'commission' || name === 'experience') {
      processedValue = value === '' ? '' : parseFloat(value) || 0
    }

    setFormData(prev => ({ ...prev, [name]: processedValue }))
    validateField(name, processedValue)
  }

  const validateForm = () => {
    const fields = ['name', 'phone']
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

    setSaving(true)
    try {
      const submitData = {
        ...formData,
        salary: formData.salary ? parseFloat(formData.salary) : undefined,
        commission: formData.commission ? parseFloat(formData.commission) : 0,
        experience: parseFloat(formData.experience) || 0,
        username: formData.username || undefined,
        pin: formData.pin || undefined,
      }

      const res = await managerService.updateStaff(id, submitData)
      if (res.success) {
        toast.success('Staff updated successfully!')
        navigate('/manager/staff')
      } else {
        toast.error(res.error || 'Failed to update staff')
      }
    } catch (error) {
      toast.error('Failed to update staff')
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
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Edit Staff</h1>
        <p className="text-gray-600 mt-1">Update staff member information</p>
      </div>

      {/* Form */}
      <div className="bg-white   border border-gray-200 p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-4 py-2 border ${errors.name ? 'border-red-500' : 'border-gray-300'
                      }  focus:outline-none focus:ring-2 focus:ring-primary-500`}
                    placeholder="Enter full name"
                  />
                </div>
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <FaPhoneAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    maxLength={10}
                    className={`w-full pl-10 pr-4 py-2 border ${errors.phone ? 'border-red-500' : 'border-gray-300'
                      }  focus:outline-none focus:ring-2 focus:ring-primary-500`}
                    placeholder="Enter phone number"
                  />
                </div>
                {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <div className="relative">
                  <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-4 py-2 border ${errors.email ? 'border-red-500' : 'border-gray-300'
                      }  focus:outline-none focus:ring-2 focus:ring-primary-500`}
                    placeholder="Enter email (optional)"
                  />
                </div>
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
              </div>

              {/* Role */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <FaUserTag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300  focus:outline-none focus:ring-2 focus:ring-primary-500 appearance-none"
                  >
                    <option value="stylist">Stylist</option>
                    <option value="therapist">Therapist</option>
                    <option value="receptionist">Receptionist</option>
                    <option value="cleaner">Cleaner</option>
                    <option value="assistant">Assistant</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Professional Information */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Professional Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Specialization */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Specialization
                </label>
                <div className="relative">
                  <FaIdBadge className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    name="specialization"
                    value={formData.specialization}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300  focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="e.g., Hair cutting, Facial treatment"
                  />
                </div>
              </div>

              {/* Experience */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Experience (years)
                </label>
                <div className="relative">
                  <FaBriefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="number"
                    name="experience"
                    value={formData.experience}
                    onChange={handleChange}
                    min="0"
                    step="0.5"
                    className={`w-full pl-10 pr-4 py-2 border ${errors.experience ? 'border-red-500' : 'border-gray-300'
                      }  focus:outline-none focus:ring-2 focus:ring-primary-500`}
                    placeholder="0"
                  />
                </div>
                {errors.experience && <p className="text-red-500 text-xs mt-1">{errors.experience}</p>}
              </div>

              {/* Salary */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Salary</label>
                <div className="relative">
                  <FaDollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="number"
                    name="salary"
                    value={formData.salary}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    className={`w-full pl-10 pr-4 py-2 border ${errors.salary ? 'border-red-500' : 'border-gray-300'
                      }  focus:outline-none focus:ring-2 focus:ring-primary-500`}
                    placeholder="Enter salary (optional)"
                  />
                </div>
                {errors.salary && <p className="text-red-500 text-xs mt-1">{errors.salary}</p>}
              </div>

              {/* Commission */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Commission (%)</label>
                <div className="relative">
                  <FaPercent className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="number"
                    name="commission"
                    value={formData.commission}
                    onChange={handleChange}
                    min="0"
                    max="100"
                    step="0.1"
                    className={`w-full pl-10 pr-4 py-2 border ${errors.commission ? 'border-red-500' : 'border-gray-300'
                      }  focus:outline-none focus:ring-2 focus:ring-primary-500`}
                    placeholder="0"
                  />
                </div>
                {errors.commission && <p className="text-red-500 text-xs mt-1">{errors.commission}</p>}
              </div>
            </div>
          </div>

          {/* Login Credentials (Optional) */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Login Credentials (Optional)</h2>
            <p className="text-sm text-gray-500 mb-4">
              Update username and PIN to allow staff to log in to the system
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Username */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                <div className="relative">
                  <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-4 py-2 border ${errors.username ? 'border-red-500' : 'border-gray-300'
                      }  focus:outline-none focus:ring-2 focus:ring-primary-500`}
                    placeholder="Enter username (optional)"
                  />
                </div>
                {errors.username && <p className="text-red-500 text-xs mt-1">{errors.username}</p>}
              </div>

              {/* PIN */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">PIN (4 digits)</label>
                <div className="relative">
                  <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="password"
                    name="pin"
                    value={formData.pin}
                    onChange={handleChange}
                    maxLength={4}
                    inputMode="numeric"
                    className={`w-full pl-10 pr-4 py-2 border ${errors.pin ? 'border-red-500' : 'border-gray-300'
                      }  focus:outline-none focus:ring-2 focus:ring-primary-500`}
                    placeholder="Enter 4-digit PIN (optional)"
                  />
                </div>
                {errors.pin && <p className="text-red-500 text-xs mt-1">{errors.pin}</p>}
              </div>
            </div>
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
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2 bg-primary-600 text-white  hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <FaSpinner className="animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <FaSave />
                  <span>Update Staff</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EditStaff
