import React, { useState } from 'react'
import { Button, Card, Input, FormSelect, FormTextArea } from '../../../components'
import { toast } from 'react-hot-toast'
import staffService from '../../../services/staff/staffService'

const StaffSettings = () => {
  const [loading, setLoading] = useState(false)
  const [settings, setSettings] = useState({
    // Personal Settings
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@elitehair.com',
    phone: '+1 (555) 123-4567',
    bio: 'Experienced hair stylist with 5+ years of experience',
    
    // Work Settings
    workDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
    startTime: '09:00',
    endTime: '18:00',
    breakDuration: 30,
    maxAppointmentsPerDay: 8,
    
    // Service Settings
    services: ['haircut', 'coloring', 'styling'],
    serviceDuration: 60,
    allowWalkIns: true,
    requireAdvanceBooking: false,
    
    // Notification Settings
    emailNotifications: true,
    smsNotifications: false,
    appointmentReminders: true,
    reminderTime: 24,
    
    // Privacy Settings
    showProfileToCustomers: true,
    allowCustomerReviews: true,
    showAvailability: true,
    
    // Commission Settings
    commissionRate: 0.6,
    trackCommission: true,
    
    // Availability Settings
    autoAcceptBookings: false,
    requireManagerApproval: false,
    maxAdvanceBookingDays: 30
  })

  const [isLoading, setIsLoading] = useState(false)

  const handleInputChange = (field, value) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleWorkDayChange = (day, checked) => {
    setSettings(prev => ({
      ...prev,
      workDays: checked 
        ? [...prev.workDays, day]
        : prev.workDays.filter(d => d !== day)
    }))
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      const result = await staffService.updateSettings(settings)
      
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

  const daysOfWeek = [
    { value: 'monday', label: 'Monday' },
    { value: 'tuesday', label: 'Tuesday' },
    { value: 'wednesday', label: 'Wednesday' },
    { value: 'thursday', label: 'Thursday' },
    { value: 'friday', label: 'Friday' },
    { value: 'saturday', label: 'Saturday' },
    { value: 'sunday', label: 'Sunday' }
  ]

  const serviceOptions = [
    { value: 'haircut', label: 'Haircut' },
    { value: 'coloring', label: 'Hair Coloring' },
    { value: 'styling', label: 'Hair Styling' },
    { value: 'treatment', label: 'Hair Treatment' },
    { value: 'blowout', label: 'Blowout' },
    { value: 'updo', label: 'Updo' }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Staff Settings</h1>
          <p className="text-gray-600">Manage your personal and work settings</p>
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

      {/* Personal Information */}
      <Card>
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                First Name
              </label>
              <Input
                value={settings.firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                placeholder="Enter first name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Last Name
              </label>
              <Input
                value={settings.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                placeholder="Enter last name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <Input
                type="email"
                value={settings.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="Enter email address"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone
              </label>
              <Input
                value={settings.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="+1 (555) 123-4567"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bio
              </label>
              <FormTextArea
                value={settings.bio}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                placeholder="Tell customers about yourself and your experience"
                rows={3}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Work Schedule */}
      <Card>
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Work Schedule</h2>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Work Days
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {daysOfWeek.map((day) => (
                  <div key={day.value} className="flex items-center">
                    <input
                      type="checkbox"
                      id={day.value}
                      checked={settings.workDays.includes(day.value)}
                      onChange={(e) => handleWorkDayChange(day.value, e.target.checked)}
                      className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                    />
                    <label htmlFor={day.value} className="ml-2 text-sm text-gray-700">
                      {day.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Time
                </label>
                <Input
                  type="time"
                  value={settings.startTime}
                  onChange={(e) => handleInputChange('startTime', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Time
                </label>
                <Input
                  type="time"
                  value={settings.endTime}
                  onChange={(e) => handleInputChange('endTime', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Break Duration (minutes)
                </label>
                <Input
                  type="number"
                  value={settings.breakDuration}
                  onChange={(e) => handleInputChange('breakDuration', parseInt(e.target.value))}
                  min="0"
                  max="120"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Appointments Per Day
              </label>
              <Input
                type="number"
                value={settings.maxAppointmentsPerDay}
                onChange={(e) => handleInputChange('maxAppointmentsPerDay', parseInt(e.target.value))}
                min="1"
                max="20"
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Service Settings */}
      <Card>
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Service Settings</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Services Offered
              </label>
              <FormSelect
                value={settings.services}
                onChange={(value) => handleInputChange('services', value)}
                options={serviceOptions}
                multiple
                placeholder="Select services"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Default Service Duration (minutes)
              </label>
              <Input
                type="number"
                value={settings.serviceDuration}
                onChange={(e) => handleInputChange('serviceDuration', parseInt(e.target.value))}
                min="15"
                max="480"
              />
            </div>
            <div className="flex items-center">
              <input type="checkbox"
                checked={settings.allowWalkIns}
                onChange={(checked) => handleInputChange('allowWalkIns', checked)}
              />
              <label className="ml-3 text-sm font-medium text-gray-700">
                Allow walk-in appointments
              </label>
            </div>
            <div className="flex items-center">
              <input type="checkbox"
                checked={settings.requireAdvanceBooking}
                onChange={(checked) => handleInputChange('requireAdvanceBooking', checked)}
              />
              <label className="ml-3 text-sm font-medium text-gray-700">
                Require advance booking
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

      {/* Privacy Settings */}
      <Card>
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Privacy Settings</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-700">Show Profile to Customers</h3>
                <p className="text-sm text-gray-500">Display your profile on the booking page</p>
              </div>
              <input type="checkbox"
                checked={settings.showProfileToCustomers}
                onChange={(checked) => handleInputChange('showProfileToCustomers', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-700">Allow Customer Reviews</h3>
                <p className="text-sm text-gray-500">Customers can leave reviews for your services</p>
              </div>
              <input type="checkbox"
                checked={settings.allowCustomerReviews}
                onChange={(checked) => handleInputChange('allowCustomerReviews', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-700">Show Availability</h3>
                <p className="text-sm text-gray-500">Show your availability to customers</p>
              </div>
              <input type="checkbox"
                checked={settings.showAvailability}
                onChange={(checked) => handleInputChange('showAvailability', checked)}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Commission Settings */}
      <Card>
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Commission Settings</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Commission Rate (%)
              </label>
              <Input
                type="number"
                step="0.01"
                value={settings.commissionRate * 100}
                onChange={(e) => handleInputChange('commissionRate', parseFloat(e.target.value) / 100)}
                min="0"
                max="100"
              />
            </div>
            <div className="flex items-center">
              <input type="checkbox"
                checked={settings.trackCommission}
                onChange={(checked) => handleInputChange('trackCommission', checked)}
              />
              <label className="ml-3 text-sm font-medium text-gray-700">
                Track commission earnings
              </label>
            </div>
          </div>
        </div>
      </Card>

      {/* Availability Settings */}
      <Card>
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Availability Settings</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Advance Booking Days
              </label>
              <Input
                type="number"
                value={settings.maxAdvanceBookingDays}
                onChange={(e) => handleInputChange('maxAdvanceBookingDays', parseInt(e.target.value))}
                min="1"
                max="365"
              />
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-700">Auto-accept Bookings</h3>
                  <p className="text-sm text-gray-500">Automatically accept new bookings</p>
                </div>
                <input type="checkbox"
                  checked={settings.autoAcceptBookings}
                  onChange={(checked) => handleInputChange('autoAcceptBookings', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-700">Require Manager Approval</h3>
                  <p className="text-sm text-gray-500">Manager must approve your bookings</p>
                </div>
                <input type="checkbox"
                  checked={settings.requireManagerApproval}
                  onChange={(checked) => handleInputChange('requireManagerApproval', checked)}
                />
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}

export default StaffSettings
