import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  FaUser,
  FaLock,
  FaKey,
  FaShieldAlt,
  FaEye,
  FaEyeSlash
} from 'react-icons/fa'
import { HiRefresh } from 'react-icons/hi'
import { toast } from 'react-hot-toast'
import staffService from '../../../services/staff/staffService'

const StaffSettings = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('credentials')
  const [profile, setProfile] = useState(null)

  const [credentialsData, setCredentialsData] = useState({
    username: '',
    currentPin: '',
    newPin: '',
    confirmPin: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  const [showCurrentPin, setShowCurrentPin] = useState(false)
  const [showNewPin, setShowNewPin] = useState(false)
  const [showConfirmPin, setShowConfirmPin] = useState(false)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const [errors, setErrors] = useState({})

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true)
      const res = await staffService.getProfile()
      if (res.success) {
        const profileData = res.data.data || res.data
        setProfile(profileData)
        setCredentialsData(prev => ({
          ...prev,
          username: profileData.username || ''
        }))
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

  const handleCredentialsChange = (field, value) => {
    setCredentialsData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const validateCredentials = () => {
    const newErrors = {}

    if (credentialsData.username && credentialsData.username.trim().length < 3) {
      newErrors.username = 'Username must be at least 3 characters'
    }

    if (credentialsData.newPin) {
      if (credentialsData.newPin.length !== 4) {
        newErrors.newPin = 'PIN must be exactly 4 digits'
      } else if (!/^\d+$/.test(credentialsData.newPin)) {
        newErrors.newPin = 'PIN must contain only numbers'
      }
      if (credentialsData.newPin !== credentialsData.confirmPin) {
        newErrors.confirmPin = 'PINs do not match'
      }
      if (!credentialsData.currentPin) {
        newErrors.currentPin = 'Current PIN is required to change PIN'
      }
    }

    if (credentialsData.newPassword) {
      if (credentialsData.newPassword.length < 6) {
        newErrors.newPassword = 'Password must be at least 6 characters'
      }
      if (credentialsData.newPassword !== credentialsData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match'
      }
      if (!credentialsData.currentPassword) {
        newErrors.currentPassword = 'Current password is required to change password'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleCredentialsSubmit = async (e) => {
    e.preventDefault()
    if (!validateCredentials()) return

    setSaving(true)
    try {
      const updateData = {}

      if (credentialsData.username && credentialsData.username !== profile.username) {
        updateData.username = credentialsData.username.trim()
      }

      if (credentialsData.newPin) {
        updateData.pin = credentialsData.newPin
      }

      if (credentialsData.newPassword) {
        updateData.password = credentialsData.newPassword
      }

      if (Object.keys(updateData).length === 0) {
        toast.error('No changes to save')
        setSaving(false)
        return
      }

      const res = await staffService.updateProfile(updateData)
      if (res.success) {
        toast.success('Credentials updated successfully')
        setCredentialsData({
          username: res.data.data?.username || credentialsData.username,
          currentPin: '',
          newPin: '',
          confirmPin: '',
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        })
        fetchProfile()
      } else {
        toast.error(res.error || 'Failed to update credentials')
      }
    } catch (e) {
      toast.error('Failed to update credentials')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-gray-600">
        Loading settings...
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen">
      {/* Header Section */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-1">Settings</h1>
            <p className="text-sm text-gray-600">
              Manage your account settings and security
            </p>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={fetchProfile}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm font-medium"
              title="Refresh"
            >
              <HiRefresh className="text-white" />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex gap-4 sm:gap-8">
            <button
              onClick={() => setActiveTab('credentials')}
              className={`pb-3 px-1 border-b-2 font-medium text-sm transition-colors flex items-center gap-2 ${
                activeTab === 'credentials'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <FaKey className="text-base" />
              <span>Credentials</span>
            </button>
            <button
              onClick={() => setActiveTab('security')}
              className={`pb-3 px-1 border-b-2 font-medium text-sm transition-colors flex items-center gap-2 ${
                activeTab === 'security'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <FaShieldAlt className="text-base" />
              <span>Security</span>
            </button>
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="bg-white rounded-lg border border-gray-200 p-5 sm:p-6">
        {/* Credentials Tab */}
        {activeTab === 'credentials' && (
          <form onSubmit={handleCredentialsSubmit} className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-800 mb-2">Login Credentials</h2>
              <p className="text-sm text-gray-600">Update your username, PIN, or password</p>
            </div>

            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Username
              </label>
              <div className="relative">
                <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={credentialsData.username}
                  onChange={(e) => handleCredentialsChange('username', e.target.value)}
                  className={`w-full pl-10 pr-4 py-2 text-base border ${
                    errors.username ? 'border-red-500' : 'border-gray-300'
                  } rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500`}
                  placeholder="Enter username"
                />
              </div>
              {errors.username && <p className="mt-1 text-sm text-red-600">{errors.username}</p>}
              <p className="mt-1 text-xs text-gray-500">Minimum 3 characters</p>
            </div>

            {/* PIN Section */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-base font-semibold text-gray-800 mb-4">Change PIN</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Current PIN
                  </label>
                  <div className="relative">
                    <FaKey className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type={showCurrentPin ? 'text' : 'password'}
                      value={credentialsData.currentPin}
                      onChange={(e) => handleCredentialsChange('currentPin', e.target.value)}
                      maxLength={4}
                      className={`w-full pl-10 pr-12 py-2 text-base border ${
                        errors.currentPin ? 'border-red-500' : 'border-gray-300'
                      } rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500`}
                      placeholder="Enter current PIN"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPin(!showCurrentPin)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showCurrentPin ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                  {errors.currentPin && <p className="mt-1 text-sm text-red-600">{errors.currentPin}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    New PIN
                  </label>
                  <div className="relative">
                    <FaKey className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type={showNewPin ? 'text' : 'password'}
                      value={credentialsData.newPin}
                      onChange={(e) => handleCredentialsChange('newPin', e.target.value.replace(/\D/g, ''))}
                      maxLength={4}
                      className={`w-full pl-10 pr-12 py-2 text-base border ${
                        errors.newPin ? 'border-red-500' : 'border-gray-300'
                      } rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500`}
                      placeholder="Enter new 4-digit PIN"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPin(!showNewPin)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showNewPin ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                  {errors.newPin && <p className="mt-1 text-sm text-red-600">{errors.newPin}</p>}
                  <p className="mt-1 text-xs text-gray-500">Must be exactly 4 digits</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm New PIN
                  </label>
                  <div className="relative">
                    <FaKey className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type={showConfirmPin ? 'text' : 'password'}
                      value={credentialsData.confirmPin}
                      onChange={(e) => handleCredentialsChange('confirmPin', e.target.value.replace(/\D/g, ''))}
                      maxLength={4}
                      className={`w-full pl-10 pr-12 py-2 text-base border ${
                        errors.confirmPin ? 'border-red-500' : 'border-gray-300'
                      } rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500`}
                      placeholder="Confirm new PIN"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPin(!showConfirmPin)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPin ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                  {errors.confirmPin && <p className="mt-1 text-sm text-red-600">{errors.confirmPin}</p>}
                </div>
              </div>
            </div>

            {/* Password Section */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-base font-semibold text-gray-800 mb-4">Change Password</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Current Password
                  </label>
                  <div className="relative">
                    <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type={showCurrentPassword ? 'text' : 'password'}
                      value={credentialsData.currentPassword}
                      onChange={(e) => handleCredentialsChange('currentPassword', e.target.value)}
                      className={`w-full pl-10 pr-12 py-2 text-base border ${
                        errors.currentPassword ? 'border-red-500' : 'border-gray-300'
                      } rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500`}
                      placeholder="Enter current password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showCurrentPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                  {errors.currentPassword && <p className="mt-1 text-sm text-red-600">{errors.currentPassword}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    New Password
                  </label>
                  <div className="relative">
                    <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      value={credentialsData.newPassword}
                      onChange={(e) => handleCredentialsChange('newPassword', e.target.value)}
                      className={`w-full pl-10 pr-12 py-2 text-base border ${
                        errors.newPassword ? 'border-red-500' : 'border-gray-300'
                      } rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500`}
                      placeholder="Enter new password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showNewPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                  {errors.newPassword && <p className="mt-1 text-sm text-red-600">{errors.newPassword}</p>}
                  <p className="mt-1 text-xs text-gray-500">Minimum 6 characters</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={credentialsData.confirmPassword}
                      onChange={(e) => handleCredentialsChange('confirmPassword', e.target.value)}
                      className={`w-full pl-10 pr-12 py-2 text-base border ${
                        errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                      } rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500`}
                      placeholder="Confirm new password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                  {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>}
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end pt-4 border-t border-gray-200">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        )}

        {/* Security Tab */}
        {activeTab === 'security' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-800 mb-2">Security Settings</h2>
              <p className="text-sm text-gray-600">Manage your account security preferences</p>
            </div>

            <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <FaShieldAlt className="text-primary-600 text-lg mt-0.5" />
                <div>
                  <h3 className="text-sm font-semibold text-primary-900 mb-1">Security Information</h3>
                  <p className="text-sm text-primary-700">
                    Your account security is managed through your login credentials. 
                    Make sure to use a strong password and keep your PIN confidential.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div>
                  <p className="text-sm font-semibold text-gray-900">Two-Factor Authentication</p>
                  <p className="text-xs text-gray-600 mt-1">Add an extra layer of security to your account</p>
                </div>
                <span className="px-3 py-1 text-xs font-semibold bg-gray-100 text-gray-700 rounded-full">Coming soon</span>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div>
                  <p className="text-sm font-semibold text-gray-900">Login History</p>
                  <p className="text-xs text-gray-600 mt-1">View your recent login activity</p>
                </div>
                <span className="px-3 py-1 text-xs font-semibold bg-gray-100 text-gray-700 rounded-full">Coming soon</span>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div>
                  <p className="text-sm font-semibold text-gray-900">Active Sessions</p>
                  <p className="text-xs text-gray-600 mt-1">Manage your active login sessions</p>
                </div>
                <span className="px-3 py-1 text-xs font-semibold bg-gray-100 text-gray-700 rounded-full">Coming soon</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default StaffSettings
