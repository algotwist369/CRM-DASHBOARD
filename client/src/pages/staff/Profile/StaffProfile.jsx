import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaBriefcase,
  FaStar,
  FaCalendarAlt,
  FaClock,
  FaUserTie,
  FaBuilding
} from 'react-icons/fa'
import { HiRefresh } from 'react-icons/hi'
import { toast } from 'react-hot-toast'
import staffService from '../../../services/staff/staffService'

const StaffProfile = () => {
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editing, setEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    specialization: '',
    experience: 0,
    workingHours: {
      start: '09:00',
      end: '18:00',
      days: []
    }
  })
  const [errors, setErrors] = useState({})

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true)
      const res = await staffService.getProfile()
      if (res.success) {
        const profileData = res.data.data || res.data
        setProfile(profileData)
        setFormData({
          name: profileData.name || '',
          email: profileData.email || '',
          phone: profileData.phone || '',
          address: profileData.address || '',
          specialization: profileData.specialization || '',
          experience: profileData.experience || 0,
          workingHours: profileData.workingHours || {
            start: '09:00',
            end: '18:00',
            days: []
          }
        })
      } else {
        toast.error(res.error || 'Failed to load profile')
      }
    } catch (e) {
      toast.error('Failed to load profile')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchProfile()
  }, [fetchProfile])

  const handleInputChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.')
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }))
    } else {
      setFormData(prev => ({ ...prev, [field]: value }))
    }
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleDayToggle = (day) => {
    setFormData(prev => ({
      ...prev,
      workingHours: {
        ...prev.workingHours,
        days: prev.workingHours.days.includes(day)
          ? prev.workingHours.days.filter(d => d !== day)
          : [...prev.workingHours.days, day]
      }
    }))
  }

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required'
    }
    
    if (formData.email && !/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format'
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone is required'
    }
    
    if (formData.experience < 0) {
      newErrors.experience = 'Experience cannot be negative'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) return

    setSaving(true)
    try {
      const res = await staffService.updateProfile(formData)
      if (res.success) {
        toast.success('Profile updated successfully')
        setEditing(false)
        fetchProfile()
      } else {
        toast.error(res.error || 'Failed to update profile')
      }
    } catch (e) {
      toast.error('Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return '—'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  }

  const formatRole = (role) => {
    if (!role) return '—'
    return role.charAt(0).toUpperCase() + role.slice(1)
  }

  const weekDays = [
    { value: 'monday', label: 'Monday' },
    { value: 'tuesday', label: 'Tuesday' },
    { value: 'wednesday', label: 'Wednesday' },
    { value: 'thursday', label: 'Thursday' },
    { value: 'friday', label: 'Friday' },
    { value: 'saturday', label: 'Saturday' },
    { value: 'sunday', label: 'Sunday' }
  ]

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-gray-600">
        Loading profile...
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="p-6 text-red-600">
        Failed to load profile
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen">
      {/* Header Section */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-1">My Profile</h1>
            <p className="text-sm text-gray-600">
              View and manage your profile information
            </p>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={fetchProfile}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-white border border-gray-300  hover:bg-gray-50 text-sm font-medium text-gray-700"
              title="Refresh"
            >
              <HiRefresh className="text-gray-600" />
              <span className="hidden sm:inline">Refresh</span>
            </button>
            {!editing && (
              <button
                onClick={() => setEditing(true)}
                className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-primary-600 text-white  hover:bg-primary-700 text-sm font-medium"
              >
                Edit Profile
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Left Column - Profile Overview */}
        <div className="lg:col-span-1">
          <div className="bg-white  border border-gray-200 p-5">
            <div className="text-center mb-5">
              <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <FaUser className="text-primary-600 text-3xl" />
              </div>
              <h2 className="text-lg font-semibold text-gray-800 mb-1">{profile.name}</h2>
              <p className="text-sm text-gray-600 mb-2">@{profile.username || 'N/A'}</p>
              <span className="inline-block px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                {formatRole(profile.role)}
              </span>
            </div>

            <div className="space-y-3 pt-4 border-t border-gray-200">
              <InfoItem
                icon={FaBuilding}
                label="Business"
                value={profile.business?.name || '—'}
              />
              <InfoItem
                icon={FaUserTie}
                label="Manager"
                value={profile.manager?.name || '—'}
              />
              <InfoItem
                icon={FaCalendarAlt}
                label="Joined"
                value={formatDate(profile.joiningDate)}
              />
              <InfoItem
                icon={FaStar}
                label="Rating"
                value={profile.performance?.rating ? `${profile.performance.rating.toFixed(1)}/5` : '—'}
              />
            </div>

            {/* Performance Stats */}
            {profile.performance && (
              <div className="mt-5 pt-5 border-t border-gray-200">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Performance</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Total Customers</span>
                    <span className="font-medium text-gray-800">{profile.performance.totalCustomers || 0}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Total Revenue</span>
                    <span className="font-medium text-gray-800">
                      ₹{profile.performance.totalRevenue?.toLocaleString('en-IN') || 0}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Reviews</span>
                    <span className="font-medium text-gray-800">{profile.performance.reviews || 0}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Profile Details */}
        <div className="lg:col-span-2">
          <div className="bg-white  border border-gray-200 p-5 sm:p-6">
            {editing ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5 pb-5 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-800">Edit Profile</h2>
                  <div className="flex gap-2 flex-wrap">
                    <button
                      type="button"
                      onClick={() => {
                        setEditing(false)
                        fetchProfile()
                      }}
                      className="flex-1 sm:flex-none px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300  hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={saving}
                      className="flex-1 sm:flex-none px-4 py-2 text-sm font-medium text-white bg-primary-600  hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </div>

                {/* Personal Information */}
                <div>
                  <h3 className="text-base font-semibold text-gray-800 mb-4">Personal Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) => handleInputChange('name', e.target.value)}
                          className={`w-full pl-10 pr-4 py-2 text-base border ${
                            errors.name ? 'border-red-500' : 'border-gray-300'
                          }  focus:outline-none focus:ring-2 focus:ring-primary-500`}
                          placeholder="Enter full name"
                        />
                      </div>
                      {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <div className="relative">
                        <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          className={`w-full pl-10 pr-4 py-2 text-base border ${
                            errors.email ? 'border-red-500' : 'border-gray-300'
                          }  focus:outline-none focus:ring-2 focus:ring-primary-500`}
                          placeholder="Enter email"
                        />
                      </div>
                      {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <FaPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => handleInputChange('phone', e.target.value)}
                          className={`w-full pl-10 pr-4 py-2 text-base border ${
                            errors.phone ? 'border-red-500' : 'border-gray-300'
                          }  focus:outline-none focus:ring-2 focus:ring-primary-500`}
                          placeholder="Enter phone number"
                        />
                      </div>
                      {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                      <div className="relative">
                        <FaMapMarkerAlt className="absolute left-3 top-3 text-gray-400" />
                        <input
                          type="text"
                          value={formData.address}
                          onChange={(e) => handleInputChange('address', e.target.value)}
                          className="w-full pl-10 pr-4 py-2 text-base border border-gray-300  focus:outline-none focus:ring-2 focus:ring-primary-500"
                          placeholder="Enter address"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Professional Information */}
                <div>
                  <h3 className="text-base font-semibold text-gray-800 mb-4">Professional Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Specialization</label>
                      <div className="relative">
                        <FaBriefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          value={formData.specialization}
                          onChange={(e) => handleInputChange('specialization', e.target.value)}
                          className="w-full pl-10 pr-4 py-2 text-base border border-gray-300  focus:outline-none focus:ring-2 focus:ring-primary-500"
                          placeholder="e.g., Hair cutting, Facial treatment"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Experience (years)</label>
                      <input
                        type="number"
                        min="0"
                        value={formData.experience}
                        onChange={(e) => handleInputChange('experience', parseInt(e.target.value) || 0)}
                        className={`w-full px-4 py-2 text-base border ${
                          errors.experience ? 'border-red-500' : 'border-gray-300'
                        }  focus:outline-none focus:ring-2 focus:ring-primary-500`}
                        placeholder="Years of experience"
                      />
                      {errors.experience && <p className="text-red-500 text-xs mt-1">{errors.experience}</p>}
                    </div>
                  </div>
                </div>

                {/* Working Hours */}
                <div>
                  <h3 className="text-base font-semibold text-gray-800 mb-4">Working Hours</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                      <div className="relative">
                        <FaClock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                          type="time"
                          value={formData.workingHours.start}
                          onChange={(e) => handleInputChange('workingHours.start', e.target.value)}
                          className="w-full pl-10 pr-4 py-2 text-base border border-gray-300  focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                      <div className="relative">
                        <FaClock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                          type="time"
                          value={formData.workingHours.end}
                          onChange={(e) => handleInputChange('workingHours.end', e.target.value)}
                          className="w-full pl-10 pr-4 py-2 text-base border border-gray-300  focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Working Days</label>
                    <div className="flex flex-wrap gap-2">
                      {weekDays.map((day) => (
                        <button
                          key={day.value}
                          type="button"
                          onClick={() => handleDayToggle(day.value)}
                          className={`px-3 sm:px-4 py-2 text-sm font-medium  transition-colors min-w-[80px] ${
                            formData.workingHours.days.includes(day.value)
                              ? 'bg-primary-600 text-white hover:bg-primary-700'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
                          }`}
                        >
                          {day.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </form>
            ) : (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-gray-800">Profile Information</h2>

                {/* Personal Information */}
                <div>
                  <h3 className="text-base font-semibold text-gray-800 mb-4">Personal Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InfoRow icon={FaUser} label="Full Name" value={profile.name || '—'} />
                    <InfoRow icon={FaEnvelope} label="Email" value={profile.email || '—'} />
                    <InfoRow icon={FaPhone} label="Phone" value={profile.phone || '—'} />
                    <InfoRow icon={FaMapMarkerAlt} label="Address" value={profile.address || '—'} />
                  </div>
                </div>

                {/* Professional Information */}
                <div>
                  <h3 className="text-base font-semibold text-gray-800 mb-4">Professional Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InfoRow icon={FaBriefcase} label="Role" value={formatRole(profile.role)} />
                    <InfoRow icon={FaBriefcase} label="Specialization" value={profile.specialization || '—'} />
                    <InfoRow 
                      icon={FaBriefcase} 
                      label="Experience" 
                      value={profile.experience ? `${profile.experience} years` : '—'} 
                    />
                    {profile.commission && (
                      <InfoRow 
                        icon={FaBriefcase} 
                        label="Commission" 
                        value={`${profile.commission}%`} 
                      />
                    )}
                  </div>
                </div>

                {/* Working Hours */}
                {profile.workingHours && (
                  <div>
                    <h3 className="text-base font-semibold text-gray-800 mb-4">Working Hours</h3>
                    <div className="space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                        <span className="text-sm text-gray-600 sm:w-24 flex-shrink-0">Time:</span>
                        <span className="text-sm font-medium text-gray-800">
                          {profile.workingHours.start || '09:00'} - {profile.workingHours.end || '18:00'}
                        </span>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-4">
                        <span className="text-sm text-gray-600 sm:w-24 flex-shrink-0">Days:</span>
                        <div className="flex flex-wrap gap-2">
                          {profile.workingHours.days && profile.workingHours.days.length > 0 ? (
                            profile.workingHours.days.map((day) => (
                              <span
                                key={day}
                                className="px-3 py-1 text-xs font-medium bg-blue-100 text-blue-800 "
                              >
                                {day.charAt(0).toUpperCase() + day.slice(1)}
                              </span>
                            ))
                          ) : (
                            <span className="text-sm text-gray-500">No working days set</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// Simple Info Item Component
const InfoItem = ({ icon: Icon, label, value }) => (
  <div className="flex items-center gap-3">
    <Icon className="text-gray-400 text-sm" />
    <div className="flex-1 min-w-0">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-sm font-medium text-gray-800 truncate">{value}</p>
    </div>
  </div>
)

// Simple Info Row Component
const InfoRow = ({ icon: Icon, label, value }) => (
  <div className="flex items-start gap-3">
    <Icon className="text-gray-400 text-sm mt-1 flex-shrink-0" />
    <div className="flex-1 min-w-0">
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className="text-sm font-medium text-gray-800">{value}</p>
    </div>
  </div>
)

export default StaffProfile
