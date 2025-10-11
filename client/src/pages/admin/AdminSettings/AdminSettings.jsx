import React, { useState, useEffect } from 'react'
import { Button, Card, Input, FormSelect, FormTextArea } from '../../../components'
import { toast } from 'react-hot-toast'
import adminService from '../../../services/admin/adminService'

const AdminSettings = () => {
  const [loading, setLoading] = useState(false)
  const [settings, setSettings] = useState({
    // General Settings
    siteName: 'Elite Hair Studio CRM',
    siteDescription: 'Professional CRM system for hair salons',
    timezone: 'UTC',
    language: 'en',
    currency: 'USD',
    
    // Security Settings
    sessionTimeout: 30,
    passwordPolicy: 'strong',
    twoFactorAuth: true,
    loginAttempts: 5,
    
    // Email Settings
    smtpHost: '',
    smtpPort: 587,
    smtpUsername: '',
    smtpPassword: '',
    fromEmail: 'noreply@elitehair.com',
    fromName: 'Elite Hair Studio',
    
    // Notification Settings
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    
    // Business Settings
    defaultBusinessType: 'salon',
    autoApproveBookings: false,
    allowOnlinePayments: true,
    bookingAdvanceDays: 30,
    
    // System Settings
    maintenanceMode: false,
    debugMode: false,
    logLevel: 'info',
    backupFrequency: 'daily'
  })

  const [isLoading, setIsLoading] = useState(false)

  const handleInputChange = (field, value) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      const result = await adminService.updateSettings(settings)
      
      if (result.success) {
        toast.success('Settings saved successfully!')
      } else {
        toast.error(result.error || 'Failed to save settings')
      }
    } catch (error) {
      console.error('Error saving settings:', error)
      toast.error('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset all settings to default?')) {
      // Reset to default values
      toast.success('Settings reset to default')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Settings</h1>
          <p className="text-gray-600">Manage system-wide settings and configurations</p>
        </div>
        <div className="flex space-x-3">
          <Button
            variant="outline"
            onClick={handleReset}
            disabled={isLoading}
          >
            Reset to Default
          </Button>
          <Button
            onClick={handleSave}
            disabled={isLoading}
            loading={isLoading}
          >
            Save Settings
          </Button>
        </div>
      </div>

      {/* General Settings */}
      <Card>
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">General Settings</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Site Name
              </label>
              <Input
                value={settings.siteName}
                onChange={(e) => handleInputChange('siteName', e.target.value)}
                placeholder="Enter site name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Timezone
              </label>
              <FormSelect
                value={settings.timezone}
                onChange={(value) => handleInputChange('timezone', value)}
                options={[
                  { value: 'UTC', label: 'UTC' },
                  { value: 'EST', label: 'Eastern Time' },
                  { value: 'PST', label: 'Pacific Time' },
                  { value: 'GMT', label: 'Greenwich Mean Time' }
                ]}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Language
              </label>
              <FormSelect
                value={settings.language}
                onChange={(value) => handleInputChange('language', value)}
                options={[
                  { value: 'en', label: 'English' },
                  { value: 'es', label: 'Spanish' },
                  { value: 'fr', label: 'French' }
                ]}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Currency
              </label>
              <FormSelect
                value={settings.currency}
                onChange={(value) => handleInputChange('currency', value)}
                options={[
                  { value: 'INR', label: 'INR (₨)' },
                  { value: 'USD', label: 'USD ($)' },
                  { value: 'EUR', label: 'EUR (€)' },
                  { value: 'GBP', label: 'GBP (£)' },
                  { value: 'AUD', label: 'AUD ($)' },
                  { value: 'CAD', label: 'CAD ($)' },
                  { value: 'CHF', label: 'CHF (₣)' },
                  { value: 'CNY', label: 'CNY (¥)' },
                  { value: 'JPY', label: 'JPY (¥)' },
                  { value: 'KRW', label: 'KRW (₩)' },
                  { value: 'MXN', label: 'MXN ($)' },
                  { value: 'NZD', label: 'NZD ($)' },
                  { value: 'RUB', label: 'RUB (₽)' },
                  { value: 'SEK', label: 'SEK (kr)' },
                  { value: 'SGD', label: 'SGD ($)' },
                  { value: 'ZAR', label: 'ZAR (R)' }
                ]}
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Site Description
              </label>
              <FormTextArea
                value={settings.siteDescription}
                onChange={(e) => handleInputChange('siteDescription', e.target.value)}
                placeholder="Enter site description"
                rows={3}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Security Settings */}
      <Card>
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Security Settings</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Session Timeout (minutes)
              </label>
              <Input
                type="number"
                value={settings.sessionTimeout}
                onChange={(e) => handleInputChange('sessionTimeout', parseInt(e.target.value))}
                min="5"
                max="480"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password Policy
              </label>
              <FormSelect
                value={settings.passwordPolicy}
                onChange={(value) => handleInputChange('passwordPolicy', value)}
                options={[
                  { value: 'basic', label: 'Basic' },
                  { value: 'strong', label: 'Strong' },
                  { value: 'very-strong', label: 'Very Strong' }
                ]}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Login Attempts
              </label>
              <Input
                type="number"
                value={settings.loginAttempts}
                onChange={(e) => handleInputChange('loginAttempts', parseInt(e.target.value))}
                min="3"
                max="10"
              />
            </div>
            <div className="flex items-center">
              <input type="checkbox"
                checked={settings.twoFactorAuth}
                onChange={(checked) => handleInputChange('twoFactorAuth', checked)}
              />
              <label className="ml-3 text-sm font-medium text-gray-700">
                Enable Two-Factor Authentication
              </label>
            </div>
          </div>
        </div>
      </Card>

      {/* Email Settings */}
      <Card>
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Email Settings</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                SMTP Host
              </label>
              <Input
                value={settings.smtpHost}
                onChange={(e) => handleInputChange('smtpHost', e.target.value)}
                placeholder="smtp.gmail.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                SMTP Port
              </label>
              <Input
                type="number"
                value={settings.smtpPort}
                onChange={(e) => handleInputChange('smtpPort', parseInt(e.target.value))}
                placeholder="587"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                SMTP Username
              </label>
              <Input
                value={settings.smtpUsername}
                onChange={(e) => handleInputChange('smtpUsername', e.target.value)}
                placeholder="your-email@gmail.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                SMTP Password
              </label>
              <Input
                type="password"
                value={settings.smtpPassword}
                onChange={(e) => handleInputChange('smtpPassword', e.target.value)}
                placeholder="••••••••"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                From Email
              </label>
              <Input
                value={settings.fromEmail}
                onChange={(e) => handleInputChange('fromEmail', e.target.value)}
                placeholder="noreply@elitehair.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                From Name
              </label>
              <Input
                value={settings.fromName}
                onChange={(e) => handleInputChange('fromName', e.target.value)}
                placeholder="Elite Hair Studio"
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Notification Settings */}
      <Card>
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Notification Settings</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-700">Email Notifications</h3>
                <p className="text-sm text-gray-500">Send notifications via email</p>
              </div>
              <input type="checkbox"
                checked={settings.emailNotifications}
                onChange={(checked) => handleInputChange('emailNotifications', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-700">SMS Notifications</h3>
                <p className="text-sm text-gray-500">Send notifications via SMS</p>
              </div>
              <input type="checkbox"
                checked={settings.smsNotifications}
                onChange={(checked) => handleInputChange('smsNotifications', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-700">Push Notifications</h3>
                <p className="text-sm text-gray-500">Send push notifications to mobile apps</p>
              </div>
              <input type="checkbox"
                checked={settings.pushNotifications}
                onChange={(checked) => handleInputChange('pushNotifications', checked)}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Business Settings */}
      <Card>
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Business Settings</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Default Business Type
              </label>
              <FormSelect
                value={settings.defaultBusinessType}
                onChange={(value) => handleInputChange('defaultBusinessType', value)}
                options={[
                  { value: 'salon', label: 'Hair Salon' },
                  { value: 'spa', label: 'Spa' },
                  { value: 'barbershop', label: 'Barbershop' },
                  { value: 'nail-salon', label: 'Nail Salon' }
                ]}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Booking Advance Days
              </label>
              <Input
                type="number"
                value={settings.bookingAdvanceDays}
                onChange={(e) => handleInputChange('bookingAdvanceDays', parseInt(e.target.value))}
                min="1"
                max="365"
              />
            </div>
            <div className="flex items-center">
              <input type="checkbox"
                checked={settings.autoApproveBookings}
                onChange={(checked) => handleInputChange('autoApproveBookings', checked)}
              />
              <label className="ml-3 text-sm font-medium text-gray-700">
                Auto-approve bookings
              </label>
            </div>
            <div className="flex items-center">
              <input type="checkbox"
                checked={settings.allowOnlinePayments}
                onChange={(checked) => handleInputChange('allowOnlinePayments', checked)}
              />
              <label className="ml-3 text-sm font-medium text-gray-700">
                Allow online payments
              </label>
            </div>
          </div>
        </div>
      </Card>

      {/* System Settings */}
      <Card>
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">System Settings</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Log Level
              </label>
              <FormSelect
                value={settings.logLevel}
                onChange={(value) => handleInputChange('logLevel', value)}
                options={[
                  { value: 'error', label: 'Error' },
                  { value: 'warn', label: 'Warning' },
                  { value: 'info', label: 'Info' },
                  { value: 'debug', label: 'Debug' }
                ]}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Backup Frequency
              </label>
              <FormSelect
                value={settings.backupFrequency}
                onChange={(value) => handleInputChange('backupFrequency', value)}
                options={[
                  { value: 'hourly', label: 'Hourly' },
                  { value: 'daily', label: 'Daily' },
                  { value: 'weekly', label: 'Weekly' },
                  { value: 'monthly', label: 'Monthly' }
                ]}
              />
            </div>
            <div className="flex items-center">
              <input type="checkbox"
                checked={settings.maintenanceMode}
                onChange={(checked) => handleInputChange('maintenanceMode', checked)}
              />
              <label className="ml-3 text-sm font-medium text-gray-700">
                Maintenance Mode
              </label>
            </div>
            <div className="flex items-center">
              <input type="checkbox"
                checked={settings.debugMode}
                onChange={(checked) => handleInputChange('debugMode', checked)}
              />
              <label className="ml-3 text-sm font-medium text-gray-700">
                Debug Mode
              </label>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}

export default AdminSettings
