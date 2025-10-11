import React, { useState, useEffect } from 'react'
import { Card, Button, Input, Dropdown, Alert } from '../../../components'
import staffService from '../../../services/staff/staffService'
import { toast } from 'react-hot-toast'

const StaffProfile = () => {
  const [loading, setLoading] = useState(false)
  const [profile, setProfile] = useState(null)
  const [editing, setEditing] = useState(false)
  const [formData, setFormData] = useState({})
  const [errors, setErrors] = useState({})

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      setLoading(true)
      
      const result = await staffService.getProfile()
      
      if (result.success) {
        setProfile(result.data)
        setFormData(result.data)
        toast.success('Profile loaded successfully!')
      } else {
        toast.error(result.error || 'Failed to load profile')
        console.error('Profile error:', result.error)
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
      toast.error('An unexpected error occurred while loading profile')
    } finally {
      setLoading(false)
    }
  }
      
        id: '1',
        name: 'Emma Wilson',
        email: 'emma@elitehair.com',
        phone: '+1 (555) 123-4568',
        role: 'Senior Stylist',
        department: 'Hair Services',
        joinDate: '2022-01-15',
        bio: 'Passionate hairstylist with 5+ years of experience in cutting, coloring, and styling. Specializing in modern cuts and color techniques.',
        skills: ['Hair Cutting', 'Hair Coloring', 'Hair Styling', 'Highlights', 'Balayage'],
        certifications: [
          { name: 'Advanced Hair Cutting', issuer: 'Beauty Academy', date: '2021-06-15' },
          { name: 'Color Specialist', issuer: 'Color Masters', date: '2021-09-20' },
          { name: 'Balayage Expert', issuer: 'Style Institute', date: '2022-03-10' }
        ],
        availability: {
          monday: { start: '09:00', end: '18:00', available: true },
          tuesday: { start: '09:00', end: '18:00', available: true },
          wednesday: { start: '09:00', end: '18:00', available: true },
          thursday: { start: '09:00', end: '18:00', available: true },
          friday: { start: '09:00', end: '18:00', available: true },
          saturday: { start: '10:00', end: '16:00', available: true },
          sunday: { start: '10:00', end: '16:00', available: false }
        },
        socialMedia: {
          instagram: '@emmawilson_hair',
          facebook: 'Emma Wilson Hair',
          website: 'www.emmawilsonhair.com'
        },
        emergencyContact: {
          name: 'John Wilson',
          relationship: 'Spouse',
          phone: '+1 (555) 987-6543'
        },
        address: {
          street: '123 Main Street',
          city: 'New York',
          state: 'NY',
          zipCode: '10001',
          country: 'USA'
        },
        performance: {
          rating: 4.9,
          totalAppointments: 1250,
          totalCustomers: 450,
          averageRating: 4.8,
          customerRetention: 85
        }
      }
      
    } catch (error) {
      console.error('Error fetching profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }))
    }
  }

  const handleNestedInputChange = (parent, field, value) => {
    setFormData(prev => ({
      ...prev,
      [parent]: { ...prev[parent], [field]: value }
    }))
  }

  const handleSkillAdd = (skill) => {
    if (skill && !formData.skills.includes(skill)) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, skill]
      }))
    }
  }

  const handleSkillRemove = (skillToRemove) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }))
  }

  const handleAvailabilityChange = (day, field, value) => {
    setFormData(prev => ({
      ...prev,
      availability: {
        ...prev.availability,
        [day]: { ...prev.availability[day], [field]: value }
      }
    }))
  }

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.name) newErrors.name = 'Name is required'
    if (!formData.email) newErrors.email = 'Email is required'
    if (!formData.phone) newErrors.phone = 'Phone is required'
    if (!formData.role) newErrors.role = 'Role is required'
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = async () => {
    if (!validateForm()) return
    
    try {
      setLoading(true)
      setErrors({})
      
      const result = await staffService.updateProfile(formData)
      
      if (result.success) {
        setProfile(result.data)
        setEditing(false)
        toast.success('Profile updated successfully!')
      } else {
        setErrors({ general: result.error || 'Failed to update profile' })
        toast.error(result.error || 'Failed to update profile')
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      setErrors({ general: 'An unexpected error occurred' })
      toast.error('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    setFormData(profile)
    setEditing(false)
    setErrors({})
  }

  if (loading && !profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
              <p className="text-gray-600 mt-1">Manage your personal information and professional details</p>
            </div>
            <div className="flex items-center gap-3">
              {editing ? (
                <>
                  <Button variant="outline" onClick={handleCancel} disabled={loading}>
                    Cancel
                  </Button>
                  <Button variant="primary" onClick={handleSave} loading={loading}>
                    Save Changes
                  </Button>
                </>
              ) : (
                <Button variant="primary" onClick={() => setEditing(true)}>
                  Edit Profile
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Overview */}
          <div className="lg:col-span-1">
            <Card>
              <div className="p-6">
                <div className="text-center">
                  <div className="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-12 h-12 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">{profile.name}</h2>
                  <p className="text-gray-600">{profile.role}</p>
                  <p className="text-sm text-gray-500 mt-1">{profile.department}</p>
                  
                  <div className="mt-4 flex items-center justify-center gap-1">
                    <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span className="font-medium text-gray-900">{profile.performance.rating}/5.0</span>
                  </div>
                </div>

                <div className="mt-6 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Total Appointments:</span>
                    <span className="text-sm font-medium text-gray-900">{profile.performance.totalAppointments}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Total Customers:</span>
                    <span className="text-sm font-medium text-gray-900">{profile.performance.totalCustomers}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Customer Retention:</span>
                    <span className="text-sm font-medium text-gray-900">{profile.performance.customerRetention}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Member Since:</span>
                    <span className="text-sm font-medium text-gray-900">
                      {new Date(profile.joinDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Profile Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                    <Input
                      value={formData.name || ''}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="Enter full name"
                      disabled={!editing}
                      error={errors.name}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <Input
                      type="email"
                      value={formData.email || ''}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="Enter email"
                      disabled={!editing}
                      error={errors.email}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                    <Input
                      value={formData.phone || ''}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="Enter phone number"
                      disabled={!editing}
                      error={errors.phone}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                    <Dropdown
                      value={formData.role || ''}
                      onChange={(value) => handleInputChange('role', value)}
                      options={[
                        { value: 'Senior Stylist', label: 'Senior Stylist' },
                        { value: 'Stylist', label: 'Stylist' },
                        { value: 'Junior Stylist', label: 'Junior Stylist' },
                        { value: 'Colorist', label: 'Colorist' },
                        { value: 'Barber', label: 'Barber' }
                      ]}
                      disabled={!editing}
                      placeholder="Select role"
                    />
                  </div>
                </div>
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                  <textarea
                    value={formData.bio || ''}
                    onChange={(e) => handleInputChange('bio', e.target.value)}
                    placeholder="Tell us about yourself..."
                    rows={3}
                    disabled={!editing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-50 disabled:text-gray-500"
                  />
                </div>
              </div>
            </Card>

            {/* Skills */}
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Skills & Specializations</h3>
                <div className="flex flex-wrap gap-2 mb-4">
                  {formData.skills?.map((skill, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-primary-100 text-primary-800 text-sm rounded-full"
                    >
                      {skill}
                      {editing && (
                        <button
                          type="button"
                          onClick={() => handleSkillRemove(skill)}
                          className="text-primary-600 hover:text-primary-800"
                        >
                          ×
                        </button>
                      )}
                    </span>
                  ))}
                </div>
                {editing && (
                  <Input
                    placeholder="Add a skill and press Enter"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        handleSkillAdd(e.target.value)
                        e.target.value = ''
                      }
                    }}
                  />
                )}
              </div>
            </Card>

            {/* Availability */}
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Availability</h3>
                <div className="space-y-3">
                  {Object.entries(formData.availability || {}).map(([day, schedule]) => (
                    <div key={day} className="flex items-center gap-4">
                      <div className="w-20">
                        <span className="text-sm font-medium text-gray-700 capitalize">{day}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={schedule.available}
                          onChange={(e) => handleAvailabilityChange(day, 'available', e.target.checked)}
                          disabled={!editing}
                          className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        />
                        <span className="text-sm text-gray-500">Available</span>
                      </div>
                      {schedule.available && (
                        <div className="flex items-center gap-2">
                          <Input
                            type="time"
                            value={schedule.start}
                            onChange={(e) => handleAvailabilityChange(day, 'start', e.target.value)}
                            disabled={!editing}
                            className="w-32"
                          />
                          <span className="text-sm text-gray-500">to</span>
                          <Input
                            type="time"
                            value={schedule.end}
                            onChange={(e) => handleAvailabilityChange(day, 'end', e.target.value)}
                            disabled={!editing}
                            className="w-32"
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            {/* Contact Information */}
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Street Address</label>
                    <Input
                      value={formData.address?.street || ''}
                      onChange={(e) => handleNestedInputChange('address', 'street', e.target.value)}
                      placeholder="Enter street address"
                      disabled={!editing}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                    <Input
                      value={formData.address?.city || ''}
                      onChange={(e) => handleNestedInputChange('address', 'city', e.target.value)}
                      placeholder="Enter city"
                      disabled={!editing}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                    <Input
                      value={formData.address?.state || ''}
                      onChange={(e) => handleNestedInputChange('address', 'state', e.target.value)}
                      placeholder="Enter state"
                      disabled={!editing}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">ZIP Code</label>
                    <Input
                      value={formData.address?.zipCode || ''}
                      onChange={(e) => handleNestedInputChange('address', 'zipCode', e.target.value)}
                      placeholder="Enter ZIP code"
                      disabled={!editing}
                    />
                  </div>
                </div>
              </div>
            </Card>

            {/* Emergency Contact */}
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Emergency Contact</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                    <Input
                      value={formData.emergencyContact?.name || ''}
                      onChange={(e) => handleNestedInputChange('emergencyContact', 'name', e.target.value)}
                      placeholder="Enter contact name"
                      disabled={!editing}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Relationship</label>
                    <Input
                      value={formData.emergencyContact?.relationship || ''}
                      onChange={(e) => handleNestedInputChange('emergencyContact', 'relationship', e.target.value)}
                      placeholder="Enter relationship"
                      disabled={!editing}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                    <Input
                      value={formData.emergencyContact?.phone || ''}
                      onChange={(e) => handleNestedInputChange('emergencyContact', 'phone', e.target.value)}
                      placeholder="Enter phone number"
                      disabled={!editing}
                    />
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default StaffProfile
