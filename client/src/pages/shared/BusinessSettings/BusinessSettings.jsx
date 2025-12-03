import React, { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import businessSettingsService from '../../../services/businessSettingsService'
import authService from '../../../services/auth/authService'
import {
  FaClock,
  FaCalendarAlt,
  FaBell,
  FaCreditCard,
  FaReceipt,
  FaCog,
  FaGift,
  FaCalendarCheck,
  FaTimes,
  FaPlus,
  FaSave,
  FaSpinner,
} from 'react-icons/fa'
import BackButton from '../../../components/common/Button/BackButton'

const BusinessSettings = () => {
  const navigate = useNavigate()
  const { id: urlBusinessId } = useParams() // Route uses :id, not :businessId
  const [activeTab, setActiveTab] = useState('business-hours')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [settings, setSettings] = useState({
    settings: {},
    businessHours: {},
    holidays: [],
    notifications: {}
  })

  // Get businessId based on role
  const getBusinessId = useCallback(() => {
    const role = authService.getUserRole()
    if (role === 'admin') {
      if (!urlBusinessId) {
        toast.error('Business ID is required. Please select a business first.')
        navigate('/admin/businesses')
        return null
      }
      return urlBusinessId
    }
    // For manager, businessId is not needed in URL - backend auto-detects from manager profile
    return null
  }, [urlBusinessId, navigate])

  // Fetch business settings
  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true)
      const businessId = getBusinessId()

      // For admin, if no businessId, return early (getBusinessId will handle navigation)
      const role = authService.getUserRole()
      if (role === 'admin' && !businessId) {
        setLoading(false)
        return
      }

      const res = await businessSettingsService.getBusinessSettings(businessId)
      if (res.success) {
        setSettings(res.data?.data || res.data || {
          settings: {},
          businessHours: {},
          holidays: [],
          notifications: {}
        })
      } else {
        toast.error(res.error || 'Failed to load settings')
        if (res.error?.includes('Business ID is required')) {
          // Redirect admin to businesses list if businessId is missing
          if (role === 'admin') {
            navigate('/admin/businesses')
          }
        }
      }
    } catch (error) {
      toast.error('Failed to load settings')
    } finally {
      setLoading(false)
    }
  }, [getBusinessId, navigate])

  useEffect(() => {
    fetchSettings()
  }, [fetchSettings])

  // Form states for each tab
  const [businessHours, setBusinessHours] = useState({})
  const [appointmentSettings, setAppointmentSettings] = useState({})
  const [notificationPreferences, setNotificationPreferences] = useState({})
  const [paymentMethods, setPaymentMethods] = useState({})
  const [bankDetails, setBankDetails] = useState({})
  const [taxSettings, setTaxSettings] = useState({})
  const [generalSettings, setGeneralSettings] = useState({})
  const [loyaltySettings, setLoyaltySettings] = useState({})
  const [newHoliday, setNewHoliday] = useState({ date: '', reason: '' })

  const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']

  // Initialize form data when settings are loaded
  useEffect(() => {
    console.log('Settings loaded:', settings)

    if (settings.businessHours && Object.keys(settings.businessHours).length > 0) {
      setBusinessHours(settings.businessHours)
    } else {
      // Initialize with default hours for all days
      const defaultHours = {}
      daysOfWeek.forEach(day => {
        defaultHours[day] = {
          isOpen: true,
          openTime: '09:00',
          closeTime: '18:00'
        }
      })
      setBusinessHours(defaultHours)
    }

    if (settings.settings?.appointmentSettings) {
      setAppointmentSettings(settings.settings.appointmentSettings)
    }

    if (settings.notifications) {
      setNotificationPreferences(settings.notifications)
    }

    if (settings.settings?.taxSettings) {
      setTaxSettings(settings.settings.taxSettings)
    }

    if (settings.settings) {
      setGeneralSettings(settings.settings)
    }

    if (settings.settings?.loyaltySettings) {
      setLoyaltySettings(settings.settings.loyaltySettings)
    }
  }, [settings])

  // Save functions
  const saveBusinessHours = async () => {
    const businessId = getBusinessId()
    const role = authService.getUserRole()
    if (role === 'admin' && !businessId) {
      toast.error('Business ID is required')
      return
    }

    // Validate business hours before sending
    const validBusinessHours = {}
    daysOfWeek.forEach(day => {
      if (businessHours[day]) {
        if (businessHours[day].isOpen) {
          validBusinessHours[day] = {
            isOpen: true,
            openTime: businessHours[day].openTime || '09:00',
            closeTime: businessHours[day].closeTime || '18:00'
          }
        } else {
          validBusinessHours[day] = {
            isOpen: false
          }
        }
      }
    })

    try {
      setSaving(true)
      console.log('Saving business hours:', validBusinessHours)
      const res = await businessSettingsService.updateBusinessHours(businessId, validBusinessHours)
      console.log('Save response:', res)

      if (res.success) {
        toast.success('Business hours updated successfully')
        // Refresh settings after save
        fetchSettings()
      } else {
        console.error('Failed to update:', res.error)
        toast.error(res.error || 'Failed to update business hours')
      }
    } catch (error) {
      console.error('Error saving business hours:', error)
      toast.error('Failed to update business hours')
    } finally {
      setSaving(false)
    }
  }

  const saveAppointmentSettings = async () => {
    const businessId = getBusinessId()
    const role = authService.getUserRole()
    if (role === 'admin' && !businessId) {
      toast.error('Business ID is required')
      return
    }

    try {
      setSaving(true)
      const res = await businessSettingsService.updateAppointmentSettings(businessId, appointmentSettings)
      if (res.success) {
        toast.success('Appointment settings updated successfully')
      } else {
        toast.error(res.error || 'Failed to update appointment settings')
      }
    } catch (error) {
      toast.error('Failed to update appointment settings')
    } finally {
      setSaving(false)
    }
  }

  const saveNotificationPreferences = async () => {
    const businessId = getBusinessId()
    const role = authService.getUserRole()
    if (role === 'admin' && !businessId) {
      toast.error('Business ID is required')
      return
    }

    try {
      setSaving(true)
      const res = await businessSettingsService.updateNotificationPreferences(businessId, notificationPreferences)
      if (res.success) {
        toast.success('Notification preferences updated successfully')
      } else {
        toast.error(res.error || 'Failed to update notification preferences')
      }
    } catch (error) {
      toast.error('Failed to update notification preferences')
    } finally {
      setSaving(false)
    }
  }

  const savePaymentSettings = async () => {
    const businessId = getBusinessId()
    const role = authService.getUserRole()
    if (role === 'admin' && !businessId) {
      toast.error('Business ID is required')
      return
    }

    try {
      setSaving(true)
      const res = await businessSettingsService.updatePaymentSettings(businessId, paymentMethods, bankDetails)
      if (res.success) {
        toast.success('Payment settings updated successfully')
      } else {
        toast.error(res.error || 'Failed to update payment settings')
      }
    } catch (error) {
      toast.error('Failed to update payment settings')
    } finally {
      setSaving(false)
    }
  }

  const saveTaxSettings = async () => {
    const businessId = getBusinessId()
    const role = authService.getUserRole()
    if (role === 'admin' && !businessId) {
      toast.error('Business ID is required')
      return
    }

    try {
      setSaving(true)
      const res = await businessSettingsService.updateTaxSettings(businessId, taxSettings)
      if (res.success) {
        toast.success('Tax settings updated successfully')
      } else {
        toast.error(res.error || 'Failed to update tax settings')
      }
    } catch (error) {
      toast.error('Failed to update tax settings')
    } finally {
      setSaving(false)
    }
  }

  const saveGeneralSettings = async () => {
    const businessId = getBusinessId()
    const role = authService.getUserRole()
    if (role === 'admin' && !businessId) {
      toast.error('Business ID is required')
      return
    }

    try {
      setSaving(true)
      const res = await businessSettingsService.updateGeneralSettings(businessId, generalSettings)
      if (res.success) {
        toast.success('General settings updated successfully')
      } else {
        toast.error(res.error || 'Failed to update general settings')
      }
    } catch (error) {
      toast.error('Failed to update general settings')
    } finally {
      setSaving(false)
    }
  }

  const saveLoyaltySettings = async () => {
    const businessId = getBusinessId()
    const role = authService.getUserRole()
    if (role === 'admin' && !businessId) {
      toast.error('Business ID is required')
      return
    }

    try {
      setSaving(true)
      const res = await businessSettingsService.updateLoyaltySettings(businessId, loyaltySettings)
      if (res.success) {
        toast.success('Loyalty settings updated successfully')
      } else {
        toast.error(res.error || 'Failed to update loyalty settings')
      }
    } catch (error) {
      toast.error('Failed to update loyalty settings')
    } finally {
      setSaving(false)
    }
  }

  const handleAddHoliday = async () => {
    if (!newHoliday.date) {
      toast.error('Please select a date')
      return
    }

    const businessId = getBusinessId()
    const role = authService.getUserRole()
    if (role === 'admin' && !businessId) {
      toast.error('Business ID is required')
      return
    }

    try {
      setSaving(true)
      const res = await businessSettingsService.addHoliday(businessId, newHoliday.date, newHoliday.reason || 'Holiday')
      if (res.success) {
        toast.success('Holiday added successfully')
        setSettings(prev => ({ ...prev, holidays: res.data?.data?.holidays || res.data?.holidays || [] }))
        setNewHoliday({ date: '', reason: '' })
        fetchSettings()
      } else {
        toast.error(res.error || 'Failed to add holiday')
      }
    } catch (error) {
      toast.error('Failed to add holiday')
    } finally {
      setSaving(false)
    }
  }

  const handleRemoveHoliday = async (date) => {
    const businessId = getBusinessId()
    const role = authService.getUserRole()
    if (role === 'admin' && !businessId) {
      toast.error('Business ID is required')
      return
    }

    try {
      setSaving(true)
      const res = await businessSettingsService.removeHoliday(businessId, date)
      if (res.success) {
        toast.success('Holiday removed successfully')
        setSettings(prev => ({ ...prev, holidays: res.data?.data?.holidays || res.data?.holidays || [] }))
        fetchSettings()
      } else {
        toast.error(res.error || 'Failed to remove holiday')
      }
    } catch (error) {
      toast.error('Failed to remove holiday')
    } finally {
      setSaving(false)
    }
  }

  const tabs = [
    { id: 'business-hours', label: 'Business Hours', icon: FaClock },
    { id: 'appointments', label: 'Appointments', icon: FaCalendarAlt },
    { id: 'notifications', label: 'Notifications', icon: FaBell },
    { id: 'payments', label: 'Payments', icon: FaCreditCard },
    { id: 'tax', label: 'Tax', icon: FaReceipt },
    { id: 'general', label: 'General', icon: FaCog },
    { id: 'loyalty', label: 'Loyalty', icon: FaGift },
    { id: 'holidays', label: 'Holidays', icon: FaCalendarCheck },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <FaSpinner className="animate-spin text-4xl text-primary-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading settings...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <BackButton />
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Business Settings</h1>
          <p className="text-gray-600">Manage your business configuration and preferences</p>
        </div>

        {/* Tabs */}
        <div className="bg-white  border border-gray-200  mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex overflow-x-auto">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 sm:px-6 py-3 sm:py-4 border-b-2 transition-colors whitespace-nowrap ${activeTab === tab.id
                        ? 'border-primary-600 text-primary-600 font-medium'
                        : 'border-transparent text-gray-600 hover:text-gray-900'
                      }`}
                  >
                    <Icon className="text-sm sm:text-base" />
                    <span className="text-sm sm:text-base">{tab.label}</span>
                  </button>
                )
              })}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-4 sm:p-6">
            {/* Business Hours Tab */}
            {activeTab === 'business-hours' && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Business Hours</h2>
                <div className="space-y-3">
                  {daysOfWeek.map((day) => (
                    <div key={day} className="flex items-center gap-4 p-4 border border-gray-200 ">
                      <div className="w-24 font-medium text-gray-700 capitalize">{day}</div>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={businessHours[day]?.isOpen ?? true}
                          onChange={(e) => {
                            setBusinessHours(prev => ({
                              ...prev,
                              [day]: {
                                ...prev[day],
                                isOpen: e.target.checked,
                                openTime: prev[day]?.openTime || '09:00',
                                closeTime: prev[day]?.closeTime || '18:00'
                              }
                            }))
                          }}
                          className="rounded"
                        />
                        <span className="text-sm text-gray-600">Open</span>
                      </label>
                      {businessHours[day]?.isOpen && (
                        <div className="flex items-center gap-2 flex-1">
                          <input
                            type="time"
                            value={businessHours[day]?.openTime || '09:00'}
                            onChange={(e) => {
                              setBusinessHours(prev => ({
                                ...prev,
                                [day]: { ...prev[day], openTime: e.target.value }
                              }))
                            }}
                            className="border border-gray-300 rounded px-3 py-2"
                          />
                          <span className="text-gray-500">to</span>
                          <input
                            type="time"
                            value={businessHours[day]?.closeTime || '18:00'}
                            onChange={(e) => {
                              setBusinessHours(prev => ({
                                ...prev,
                                [day]: { ...prev[day], closeTime: e.target.value }
                              }))
                            }}
                            className="border border-gray-300 rounded px-3 py-2"
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <button
                  onClick={saveBusinessHours}
                  disabled={saving}
                  className="flex items-center gap-2 px-6 py-2 bg-primary-600 text-white  hover:bg-primary-700 disabled:opacity-50"
                >
                  {saving ? <FaSpinner className="animate-spin" /> : <FaSave />}
                  Save Business Hours
                </button>
              </div>
            )}

            {/* Appointment Settings Tab */}
            {activeTab === 'appointments' && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Appointment Settings</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Advance Booking Days
                    </label>
                    <input
                      type="number"
                      value={appointmentSettings?.advanceBookingDays || 30}
                      onChange={(e) => setAppointmentSettings(prev => ({
                        ...prev,
                        advanceBookingDays: parseInt(e.target.value)
                      }))}
                      className="w-full border border-gray-300  px-4 py-2"
                      min="1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Slot Duration (minutes)
                    </label>
                    <input
                      type="number"
                      value={appointmentSettings?.slotDuration || 30}
                      onChange={(e) => setAppointmentSettings(prev => ({
                        ...prev,
                        slotDuration: parseInt(e.target.value)
                      }))}
                      className="w-full border border-gray-300  px-4 py-2"
                      min="5"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Buffer Time (minutes)
                    </label>
                    <input
                      type="number"
                      value={appointmentSettings?.bufferTime || 15}
                      onChange={(e) => setAppointmentSettings(prev => ({
                        ...prev,
                        bufferTime: parseInt(e.target.value)
                      }))}
                      className="w-full border border-gray-300  px-4 py-2"
                      min="0"
                    />
                  </div>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={appointmentSettings?.allowOnlineBooking ?? true}
                      onChange={(e) => setAppointmentSettings(prev => ({
                        ...prev,
                        allowOnlineBooking: e.target.checked
                      }))}
                      className="rounded"
                    />
                    <span className="text-sm text-gray-700">Allow Online Booking</span>
                  </label>
                </div>
                <button
                  onClick={saveAppointmentSettings}
                  disabled={saving}
                  className="flex items-center gap-2 px-6 py-2 bg-primary-600 text-white  hover:bg-primary-700 disabled:opacity-50"
                >
                  {saving ? <FaSpinner className="animate-spin" /> : <FaSave />}
                  Save Appointment Settings
                </button>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Notification Preferences</h2>
                <div className="space-y-3">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={notificationPreferences?.email ?? true}
                      onChange={(e) => setNotificationPreferences(prev => ({
                        ...prev,
                        email: e.target.checked
                      }))}
                      className="rounded"
                    />
                    <span className="text-sm text-gray-700">Email Notifications</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={notificationPreferences?.sms ?? true}
                      onChange={(e) => setNotificationPreferences(prev => ({
                        ...prev,
                        sms: e.target.checked
                      }))}
                      className="rounded"
                    />
                    <span className="text-sm text-gray-700">SMS Notifications</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={notificationPreferences?.whatsapp ?? false}
                      onChange={(e) => setNotificationPreferences(prev => ({
                        ...prev,
                        whatsapp: e.target.checked
                      }))}
                      className="rounded"
                    />
                    <span className="text-sm text-gray-700">WhatsApp Notifications</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={notificationPreferences?.push ?? false}
                      onChange={(e) => setNotificationPreferences(prev => ({
                        ...prev,
                        push: e.target.checked
                      }))}
                      className="rounded"
                    />
                    <span className="text-sm text-gray-700">Push Notifications</span>
                  </label>
                </div>
                <button
                  onClick={saveNotificationPreferences}
                  disabled={saving}
                  className="flex items-center gap-2 px-6 py-2 bg-primary-600 text-white  hover:bg-primary-700 disabled:opacity-50"
                >
                  {saving ? <FaSpinner className="animate-spin" /> : <FaSave />}
                  Save Notification Preferences
                </button>
              </div>
            )}

            {/* Payments Tab */}
            {activeTab === 'payments' && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Payment Settings</h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium text-gray-800 mb-3">Payment Methods</h3>
                    <div className="space-y-2">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={paymentMethods?.cash ?? true}
                          onChange={(e) => setPaymentMethods(prev => ({ ...prev, cash: e.target.checked }))}
                          className="rounded"
                        />
                        <span className="text-sm text-gray-700">Cash</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={paymentMethods?.card ?? true}
                          onChange={(e) => setPaymentMethods(prev => ({ ...prev, card: e.target.checked }))}
                          className="rounded"
                        />
                        <span className="text-sm text-gray-700">Card</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={paymentMethods?.upi ?? true}
                          onChange={(e) => setPaymentMethods(prev => ({ ...prev, upi: e.target.checked }))}
                          className="rounded"
                        />
                        <span className="text-sm text-gray-700">UPI</span>
                      </label>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-800 mb-3">Bank Details</h3>
                    <div className="space-y-3">
                      <input
                        type="text"
                        placeholder="Account Name"
                        value={bankDetails?.accountName || ''}
                        onChange={(e) => setBankDetails(prev => ({ ...prev, accountName: e.target.value }))}
                        className="w-full border border-gray-300  px-4 py-2"
                      />
                      <input
                        type="text"
                        placeholder="Account Number"
                        value={bankDetails?.accountNumber || ''}
                        onChange={(e) => setBankDetails(prev => ({ ...prev, accountNumber: e.target.value }))}
                        className="w-full border border-gray-300  px-4 py-2"
                      />
                      <input
                        type="text"
                        placeholder="Bank Name"
                        value={bankDetails?.bankName || ''}
                        onChange={(e) => setBankDetails(prev => ({ ...prev, bankName: e.target.value }))}
                        className="w-full border border-gray-300  px-4 py-2"
                      />
                      <input
                        type="text"
                        placeholder="IFSC Code"
                        value={bankDetails?.ifscCode || ''}
                        onChange={(e) => setBankDetails(prev => ({ ...prev, ifscCode: e.target.value }))}
                        className="w-full border border-gray-300  px-4 py-2"
                      />
                    </div>
                  </div>
                </div>
                <button
                  onClick={savePaymentSettings}
                  disabled={saving}
                  className="flex items-center gap-2 px-6 py-2 bg-primary-600 text-white  hover:bg-primary-700 disabled:opacity-50"
                >
                  {saving ? <FaSpinner className="animate-spin" /> : <FaSave />}
                  Save Payment Settings
                </button>
              </div>
            )}

            {/* Tax Settings Tab */}
            {activeTab === 'tax' && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Tax Settings</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">GST Number</label>
                    <input
                      type="text"
                      value={taxSettings?.gstNumber || ''}
                      onChange={(e) => setTaxSettings(prev => ({ ...prev, gstNumber: e.target.value }))}
                      className="w-full border border-gray-300  px-4 py-2"
                      placeholder="GST Number"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tax Rate (%)</label>
                    <input
                      type="number"
                      value={taxSettings?.taxRate || 0}
                      onChange={(e) => setTaxSettings(prev => ({ ...prev, taxRate: parseFloat(e.target.value) }))}
                      className="w-full border border-gray-300  px-4 py-2"
                      min="0"
                      max="100"
                      step="0.01"
                    />
                  </div>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={taxSettings?.taxInclusive ?? false}
                      onChange={(e) => setTaxSettings(prev => ({ ...prev, taxInclusive: e.target.checked }))}
                      className="rounded"
                    />
                    <span className="text-sm text-gray-700">Tax Inclusive Pricing</span>
                  </label>
                </div>
                <button
                  onClick={saveTaxSettings}
                  disabled={saving}
                  className="flex items-center gap-2 px-6 py-2 bg-primary-600 text-white  hover:bg-primary-700 disabled:opacity-50"
                >
                  {saving ? <FaSpinner className="animate-spin" /> : <FaSave />}
                  Save Tax Settings
                </button>
              </div>
            )}

            {/* General Settings Tab */}
            {activeTab === 'general' && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">General Settings</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
                    <select
                      value={generalSettings?.currency || 'INR'}
                      onChange={(e) => setGeneralSettings(prev => ({ ...prev, currency: e.target.value }))}
                      className="w-full border border-gray-300  px-4 py-2"
                    >
                      <option value="INR">INR - Indian Rupee</option>
                      <option value="USD">USD - US Dollar</option>
                      <option value="EUR">EUR - Euro</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Timezone</label>
                    <select
                      value={generalSettings?.timezone || 'Asia/Kolkata'}
                      onChange={(e) => setGeneralSettings(prev => ({ ...prev, timezone: e.target.value }))}
                      className="w-full border border-gray-300  px-4 py-2"
                    >
                      <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                      <option value="America/New_York">America/New_York (EST)</option>
                      <option value="Europe/London">Europe/London (GMT)</option>
                    </select>
                  </div>
                </div>
                <button
                  onClick={saveGeneralSettings}
                  disabled={saving}
                  className="flex items-center gap-2 px-6 py-2 bg-primary-600 text-white  hover:bg-primary-700 disabled:opacity-50"
                >
                  {saving ? <FaSpinner className="animate-spin" /> : <FaSave />}
                  Save General Settings
                </button>
              </div>
            )}

            {/* Loyalty Settings Tab */}
            {activeTab === 'loyalty' && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Loyalty Settings</h2>
                <div className="space-y-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={loyaltySettings?.enabled ?? false}
                      onChange={(e) => setLoyaltySettings(prev => ({ ...prev, enabled: e.target.checked }))}
                      className="rounded"
                    />
                    <span className="text-sm text-gray-700">Enable Loyalty Program</span>
                  </label>
                  {loyaltySettings?.enabled && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Points Per Rupee
                        </label>
                        <input
                          type="number"
                          value={loyaltySettings?.pointsPerRupee || 1}
                          onChange={(e) => setLoyaltySettings(prev => ({
                            ...prev,
                            pointsPerRupee: parseInt(e.target.value)
                          }))}
                          className="w-full border border-gray-300  px-4 py-2"
                          min="1"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Minimum Points to Redeem
                        </label>
                        <input
                          type="number"
                          value={loyaltySettings?.minPointsToRedeem || 100}
                          onChange={(e) => setLoyaltySettings(prev => ({
                            ...prev,
                            minPointsToRedeem: parseInt(e.target.value)
                          }))}
                          className="w-full border border-gray-300  px-4 py-2"
                          min="1"
                        />
                      </div>
                    </>
                  )}
                </div>
                <button
                  onClick={saveLoyaltySettings}
                  disabled={saving}
                  className="flex items-center gap-2 px-6 py-2 bg-primary-600 text-white  hover:bg-primary-700 disabled:opacity-50"
                >
                  {saving ? <FaSpinner className="animate-spin" /> : <FaSave />}
                  Save Loyalty Settings
                </button>
              </div>
            )}

            {/* Holidays Tab */}
            {activeTab === 'holidays' && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Holidays</h2>
                <div className="border border-gray-200  p-4 mb-4">
                  <h3 className="text-lg font-medium text-gray-800 mb-3">Add Holiday</h3>
                  <div className="flex gap-3">
                    <input
                      type="date"
                      value={newHoliday.date}
                      onChange={(e) => setNewHoliday(prev => ({ ...prev, date: e.target.value }))}
                      className="flex-1 border border-gray-300  px-4 py-2"
                    />
                    <input
                      type="text"
                      placeholder="Reason (optional)"
                      value={newHoliday.reason}
                      onChange={(e) => setNewHoliday(prev => ({ ...prev, reason: e.target.value }))}
                      className="flex-1 border border-gray-300  px-4 py-2"
                    />
                    <button
                      onClick={handleAddHoliday}
                      disabled={saving || !newHoliday.date}
                      className="flex items-center gap-2 px-6 py-2 bg-primary-600 text-white  hover:bg-primary-700 disabled:opacity-50"
                    >
                      {saving ? <FaSpinner className="animate-spin" /> : <FaPlus />}
                      Add
                    </button>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-800 mb-3">Existing Holidays</h3>
                  {settings.holidays && settings.holidays.length > 0 ? (
                    <div className="space-y-2">
                      {settings.holidays.map((holiday, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 border border-gray-200 "
                        >
                          <div>
                            <p className="font-medium text-gray-800">
                              {new Date(holiday.date).toLocaleDateString('en-IN', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </p>
                            <p className="text-sm text-gray-600">{holiday.reason || 'Holiday'}</p>
                          </div>
                          <button
                            onClick={() => handleRemoveHoliday(holiday.date)}
                            disabled={saving}
                            className="p-2 text-red-600 hover:bg-red-50  disabled:opacity-50"
                          >
                            <FaTimes />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-8">No holidays added yet</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default BusinessSettings

