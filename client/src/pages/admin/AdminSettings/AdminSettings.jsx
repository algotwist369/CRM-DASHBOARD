import React, { useState, useEffect } from 'react'
import { HiOutlineUser, HiOutlineOfficeBuilding, HiOutlineMail, HiOutlinePhone, HiOutlineLockClosed, HiOutlineSave, HiOutlineRefresh } from 'react-icons/hi'
import adminService from '../../../services/admin/adminService'
import { toast } from 'react-hot-toast'

const AdminSettings = () => {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('profile')
  const [profile, setProfile] = useState({
    name: '',
    companyName: '',
    email: '',
    phone: ''
  })
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [errors, setErrors] = useState({})

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      setLoading(true)
      const response = await adminService.getAdminProfile()
      if (response.success) {
        setProfile({
          name: response.data.name || '',
          companyName: response.data.companyName || '',
          email: response.data.email || '',
          phone: response.data.phone || ''
        })
      } else {
        toast.error(response.error || 'Failed to load profile')
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error)
      toast.error('Failed to load profile')
    } finally {
      setLoading(false)
    }
  }

  const validateProfile = () => {
    const newErrors = {}
    
    if (!profile.name || profile.name.trim() === '') {
      newErrors.name = 'Name is required'
    }
    
    if (!profile.companyName || profile.companyName.trim() === '') {
      newErrors.companyName = 'Company name is required'
    }
    
    if (!profile.email || profile.email.trim() === '') {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email)) {
      newErrors.email = 'Invalid email format'
    }
    
    if (!profile.phone || profile.phone.trim() === '') {
      newErrors.phone = 'Phone is required'
    } else if (!/^[0-9]{10}$/.test(profile.phone.replace(/\D/g, ''))) {
      newErrors.phone = 'Phone must be 10 digits'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validatePassword = () => {
    const newErrors = {}
    
    if (!passwordData.currentPassword) {
      newErrors.currentPassword = 'Current password is required'
    }
    
    if (!passwordData.newPassword) {
      newErrors.newPassword = 'New password is required'
    } else if (passwordData.newPassword.length < 6) {
      newErrors.newPassword = 'Password must be at least 6 characters'
    }
    
    if (!passwordData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password'
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleProfileSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateProfile()) {
      toast.error('Please fix the errors in the form')
      return
    }

    try {
      setSaving(true)
      const response = await adminService.updateAdminProfile(profile)
      if (response.success) {
        toast.success('Profile updated successfully')
        fetchProfile()
      } else {
        toast.error(response.error || 'Failed to update profile')
      }
    } catch (error) {
      console.error('Failed to update profile:', error)
      toast.error('Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  const handlePasswordSubmit = async (e) => {
    e.preventDefault()
    
    if (!validatePassword()) {
      toast.error('Please fix the errors in the form')
      return
    }

    try {
      setSaving(true)
      const response = await adminService.updateAdminPassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      })
      if (response.success) {
        toast.success('Password updated successfully')
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        })
      } else {
        toast.error(response.error || 'Failed to update password')
      }
    } catch (error) {
      console.error('Failed to update password:', error)
      toast.error('Failed to update password')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <HiOutlineUser className="text-primary-600" />
            Admin Settings
          </h1>
          <p className="text-gray-600 mt-1">Manage your profile and account settings</p>
        </div>
        <button
          onClick={fetchProfile}
          className="flex items-center gap-2 px-4 py-2 border border-gray-300  hover:bg-gray-50"
        >
          <HiOutlineRefresh className="w-5 h-5" />
          Refresh
        </button>
      </div>

      {/* Tabs */}
      <div className="bg-white   border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('profile')}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'profile'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Profile Information
            </button>
            <button
              onClick={() => setActiveTab('password')}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'password'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Change Password
            </button>
          </nav>
        </div>

        <div className="p-6">
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <form onSubmit={handleProfileSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <HiOutlineUser className="inline w-4 h-4 mr-1" />
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    className={`w-full px-4 py-2 border  focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                      errors.name ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Enter your full name"
                  />
                  {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <HiOutlineOfficeBuilding className="inline w-4 h-4 mr-1" />
                    Company Name
                  </label>
                  <input
                    type="text"
                    value={profile.companyName}
                    onChange={(e) => setProfile({ ...profile, companyName: e.target.value })}
                    className={`w-full px-4 py-2 border  focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                      errors.companyName ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Enter company name"
                  />
                  {errors.companyName && <p className="mt-1 text-sm text-red-600">{errors.companyName}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <HiOutlineMail className="inline w-4 h-4 mr-1" />
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    className={`w-full px-4 py-2 border  focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                      errors.email ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Enter email address"
                  />
                  {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <HiOutlinePhone className="inline w-4 h-4 mr-1" />
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={profile.phone}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value.replace(/\D/g, '') })}
                    className={`w-full px-4 py-2 border  focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                      errors.phone ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Enter phone number"
                    maxLength={10}
                  />
                  {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={fetchProfile}
                  className="px-6 py-2 border border-gray-300  text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 px-6 py-2 bg-primary-600 text-white  hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <HiOutlineSave className="w-5 h-5" />
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          )}

          {/* Password Tab */}
          {activeTab === 'password' && (
            <form onSubmit={handlePasswordSubmit} className="space-y-6 max-w-2xl">
              <div className="bg-yellow-50 border border-yellow-200  p-4">
                <p className="text-sm text-yellow-800">
                  <strong>Security Tip:</strong> Use a strong password with at least 6 characters, including letters and numbers.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <HiOutlineLockClosed className="inline w-4 h-4 mr-1" />
                    Current Password
                  </label>
                  <input
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                    className={`w-full px-4 py-2 border  focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                      errors.currentPassword ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Enter current password"
                  />
                  {errors.currentPassword && <p className="mt-1 text-sm text-red-600">{errors.currentPassword}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <HiOutlineLockClosed className="inline w-4 h-4 mr-1" />
                    New Password
                  </label>
                  <input
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    className={`w-full px-4 py-2 border  focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                      errors.newPassword ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Enter new password"
                  />
                  {errors.newPassword && <p className="mt-1 text-sm text-red-600">{errors.newPassword}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <HiOutlineLockClosed className="inline w-4 h-4 mr-1" />
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    className={`w-full px-4 py-2 border  focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                      errors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Confirm new password"
                  />
                  {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })}
                  className="px-6 py-2 border border-gray-300  text-gray-700 hover:bg-gray-50"
                >
                  Clear
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 px-6 py-2 bg-primary-600 text-white  hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <HiOutlineLockClosed className="w-5 h-5" />
                  {saving ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

export default AdminSettings
