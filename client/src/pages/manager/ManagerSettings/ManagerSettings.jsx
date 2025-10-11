import React, { useState } from 'react'
import { Button, Card, Input, FormSelect, FormTextArea } from '../../../components'
import { toast } from 'react-hot-toast'
import managerService from '../../../services/manager/managerService'

const ManagerSettings = () => {
  const [loading, setLoading] = useState(false)
  const [settings, setSettings] = useState({
    // Business Settings
    businessName: 'Elite Hair Studio',
    businessType: 'salon',
    businessDescription: 'Professional hair salon services',
    businessAddress: '123 Main Street, City, State 12345',
    businessPhone: '+1 (555) 123-4567',
    businessEmail: 'info@elitehair.com',
    businessWebsite: 'https://elitehair.com',
    
    // Operating Hours
    mondayOpen: '09:00',
    mondayClose: '18:00',
    tuesdayOpen: '09:00',
    tuesdayClose: '18:00',
    wednesdayOpen: '09:00',
    wednesdayClose: '18:00',
    thursdayOpen: '09:00',
    thursdayClose: '18:00',
    fridayOpen: '09:00',
    fridayClose: '18:00',
    saturdayOpen: '10:00',
    saturdayClose: '16:00',
    sundayOpen: '10:00',
    sundayClose: '16:00',
    
    // Booking Settings
    bookingAdvanceDays: 30,
    bookingTimeSlot: 30,
    autoApproveBookings: false,
    allowOnlinePayments: true,
    requireDeposit: false,
    depositAmount: 0,
    
    // Notification Settings
    emailNotifications: true,
    smsNotifications: false,
    appointmentReminders: true,
    reminderTime: 24,
    
    // Staff Settings
    allowStaffSelfBooking: true,
    staffCommissionRate: 0.6,
    staffCanViewAllAppointments: false,
    
    // Customer Settings
    allowCustomerSelfBooking: true,
    requireCustomerRegistration: true,
    customerLoyaltyProgram: true,
    
    // Service Settings
    defaultServiceDuration: 60,
    allowServiceAddons: true,
    serviceTaxRate: 0.08
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
      const result = await managerService.updateSettings(settings)
      
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
          <h1 className="text-2xl font-bold text-gray-900">Manager Settings</h1>
          <p className="text-gray-600">Manage your business settings and preferences</p>
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

      {/* Business Information */}
      <Card>
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Business Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Business Name
              </label>
              <Input
                value={settings.businessName}
                onChange={(e) => handleInputChange('businessName', e.target.value)}
                placeholder="Enter business name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Business Type
              </label>
              <FormSelect
                value={settings.businessType}
                onChange={(value) => handleInputChange('businessType', value)}
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
                Business Phone
              </label>
              <Input
                value={settings.businessPhone}
                onChange={(e) => handleInputChange('businessPhone', e.target.value)}
                placeholder="+1 (555) 123-4567"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Business Email
              </label>
              <Input
                type="email"
                value={settings.businessEmail}
                onChange={(e) => handleInputChange('businessEmail', e.target.value)}
                placeholder="info@elitehair.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Business Website
              </label>
              <Input
                value={settings.businessWebsite}
                onChange={(e) => handleInputChange('businessWebsite', e.target.value)}
                placeholder="https://elitehair.com"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Business Address
              </label>
              <FormTextArea
                value={settings.businessAddress}
                onChange={(e) => handleInputChange('businessAddress', e.target.value)}
                placeholder="Enter business address"
                rows={2}
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Business Description
              </label>
              <FormTextArea
                value={settings.businessDescription}
                onChange={(e) => handleInputChange('businessDescription', e.target.value)}
                placeholder="Enter business description"
                rows={3}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Operating Hours */}
      <Card>
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Operating Hours</h2>
          <div className="space-y-4">
            {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => (
              <div key={day} className="flex items-center space-x-4">
                <div className="w-24">
                  <label className="block text-sm font-medium text-gray-700 capitalize">
                    {day}
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Input
                    type="time"
                    value={settings[`${day}Open`]}
                    onChange={(e) => handleInputChange(`${day}Open`, e.target.value)}
                    className="w-32"
                  />
                  <span className="text-gray-500">to</span>
                  <Input
                    type="time"
                    value={settings[`${day}Close`]}
                    onChange={(e) => handleInputChange(`${day}Close`, e.target.value)}
                    className="w-32"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Booking Settings */}
      <Card>
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Booking Settings</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Time Slot Duration (minutes)
              </label>
              <FormSelect
                value={settings.bookingTimeSlot}
                onChange={(value) => handleInputChange('bookingTimeSlot', parseInt(value))}
                options={[
                  { value: '15', label: '15 minutes' },
                  { value: '30', label: '30 minutes' },
                  { value: '45', label: '45 minutes' },
                  { value: '60', label: '60 minutes' }
                ]}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Default Service Duration (minutes)
              </label>
              <Input
                type="number"
                value={settings.defaultServiceDuration}
                onChange={(e) => handleInputChange('defaultServiceDuration', parseInt(e.target.value))}
                min="15"
                max="480"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Service Tax Rate (%)
              </label>
              <Input
                type="number"
                step="0.01"
                value={settings.serviceTaxRate * 100}
                onChange={(e) => handleInputChange('serviceTaxRate', parseFloat(e.target.value) / 100)}
                min="0"
                max="50"
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
            <div className="flex items-center">
              <input type="checkbox"
                checked={settings.requireDeposit}
                onChange={(checked) => handleInputChange('requireDeposit', checked)}
              />
              <label className="ml-3 text-sm font-medium text-gray-700">
                Require deposit
              </label>
            </div>
            <div className="flex items-center">
              <input type="checkbox"
                checked={settings.allowServiceAddons}
                onChange={(checked) => handleInputChange('allowServiceAddons', checked)}
              />
              <label className="ml-3 text-sm font-medium text-gray-700">
                Allow service add-ons
              </label>
            </div>
          </div>
        </div>
      </Card>

      {/* Notification Settings */}
      <Card>
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Notification Settings</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Appointment Reminder Time (hours before)
              </label>
              <FormSelect
                value={settings.reminderTime}
                onChange={(value) => handleInputChange('reminderTime', parseInt(value))}
                options={[
                  { value: '1', label: '1 hour' },
                  { value: '2', label: '2 hours' },
                  { value: '24', label: '24 hours' },
                  { value: '48', label: '48 hours' }
                ]}
              />
            </div>
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
                  <h3 className="text-sm font-medium text-gray-700">Appointment Reminders</h3>
                  <p className="text-sm text-gray-500">Send appointment reminders</p>
                </div>
                <input type="checkbox"
                  checked={settings.appointmentReminders}
                  onChange={(checked) => handleInputChange('appointmentReminders', checked)}
                />
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Staff Settings */}
      <Card>
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Staff Settings</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Staff Commission Rate (%)
              </label>
              <Input
                type="number"
                step="0.01"
                value={settings.staffCommissionRate * 100}
                onChange={(e) => handleInputChange('staffCommissionRate', parseFloat(e.target.value) / 100)}
                min="0"
                max="100"
              />
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-700">Allow Staff Self-Booking</h3>
                  <p className="text-sm text-gray-500">Staff can book their own appointments</p>
                </div>
                <input type="checkbox"
                  checked={settings.allowStaffSelfBooking}
                  onChange={(checked) => handleInputChange('allowStaffSelfBooking', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-700">Staff Can View All Appointments</h3>
                  <p className="text-sm text-gray-500">Staff can see all business appointments</p>
                </div>
                <input type="checkbox"
                  checked={settings.staffCanViewAllAppointments}
                  onChange={(checked) => handleInputChange('staffCanViewAllAppointments', checked)}
                />
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Customer Settings */}
      <Card>
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Customer Settings</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-700">Allow Customer Self-Booking</h3>
                <p className="text-sm text-gray-500">Customers can book appointments online</p>
              </div>
              <input type="checkbox"
                checked={settings.allowCustomerSelfBooking}
                onChange={(checked) => handleInputChange('allowCustomerSelfBooking', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-700">Require Customer Registration</h3>
                <p className="text-sm text-gray-500">Customers must register to book</p>
              </div>
              <input type="checkbox"
                checked={settings.requireCustomerRegistration}
                onChange={(checked) => handleInputChange('requireCustomerRegistration', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-700">Customer Loyalty Program</h3>
                <p className="text-sm text-gray-500">Enable loyalty points and rewards</p>
              </div>
              <input type="checkbox"
                checked={settings.customerLoyaltyProgram}
                onChange={(checked) => handleInputChange('customerLoyaltyProgram', checked)}
              />
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}

export default ManagerSettings
