import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import {
  FaArrowLeft,
  FaUser,
  FaPhoneAlt,
  FaEnvelope,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaRupeeSign,
  FaStar,
  FaEdit,
  FaPlus,
  FaSpinner,
  FaClock,
  FaUsers,
  FaHistory,
  FaStickyNote,
  FaChartLine,
  FaBirthdayCake,
} from 'react-icons/fa'
import managerService from '../../../../services/manager/managerService'
import {
  normalizeCustomerDetails,
  formatCurrency,
  formatDate,
  formatDateTime,
  mapTimeline
} from '../utils/customerUtils'

const CustomerDetails = () => {
  const navigate = useNavigate()
  const { id: customerId } = useParams()
  const [loading, setLoading] = useState(true)
  const [customer, setCustomer] = useState(null)
  const [appointments, setAppointments] = useState([])
  const [transactions, setTransactions] = useState([])
  const [analytics, setAnalytics] = useState(null)
  const [timeline, setTimeline] = useState([])
  const [activeTab, setActiveTab] = useState('overview')
  const [noteText, setNoteText] = useState('')
  const [addingNote, setAddingNote] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({})

  useEffect(() => {
    if (customerId && customerId !== 'undefined') {
      fetchCustomerDetails()
      fetchTimeline()
    } else {
      toast.error('Invalid customer ID')
      navigate('/manager/customers')
    }
  }, [customerId])

  const fetchCustomerDetails = async () => {
    if (!customerId || customerId === 'undefined') {
      toast.error('Invalid customer ID')
      navigate('/manager/customers')
      return
    }
    
    try {
      setLoading(true)
      const result = await managerService.getCustomerDetails(customerId)
      
      if (result.success) {
        // Handle both response structures: result.data.data or result.data
        const responseData = result.data?.data || result.data
        const customerData = responseData?.customer || responseData
        
        if (!customerData) {
          toast.error('Customer data not found')
          navigate('/manager/customers')
          return
        }
        const normalizedCustomer = normalizeCustomerDetails(customerData)

        setCustomer(normalizedCustomer)
        setAppointments(responseData?.appointments || [])
        setTransactions(responseData?.transactions || [])
        setAnalytics(responseData?.analytics)
        setEditForm({
          firstName: normalizedCustomer.firstName || '',
          lastName: normalizedCustomer.lastName || '',
          email: normalizedCustomer.email || '',
          phone: normalizedCustomer.phone || '',
          dateOfBirth: normalizedCustomer.dateOfBirth ? new Date(normalizedCustomer.dateOfBirth).toISOString().split('T')[0] : '',
          gender: normalizedCustomer.gender || '',
          address: {
            street: normalizedCustomer.address.street || '',
            city: normalizedCustomer.address.city || '',
            state: normalizedCustomer.address.state || '',
            pincode: normalizedCustomer.address.pincode || '',
          }
        })
      } else {
        toast.error(result.error || 'Failed to fetch customer details')
        navigate('/manager/customers')
      }
    } catch (error) {
      toast.error('Failed to fetch customer details')
      console.error(error)
      navigate('/manager/customers')
    } finally {
      setLoading(false)
    }
  }

  const fetchTimeline = async () => {
    if (!customerId || customerId === 'undefined') {
      return
    }
    
    try {
      const result = await managerService.getCustomerTimeline(customerId)
      if (result.success) {
        // Handle both response structures: result.data.data.timeline or result.data.timeline
        const responseData = result.data?.data || result.data
        const timelineData = responseData?.timeline || responseData?.data?.timeline || []
        setTimeline(mapTimeline(timelineData))
      } else {
        setTimeline([])
      }
    } catch (error) {
      console.error('Failed to fetch timeline:', error)
      setTimeline([])
    }
  }

  const handleAddNote = async () => {
    if (!noteText.trim()) {
      toast.error('Please enter a note')
      return
    }

    try {
      setAddingNote(true)
      const result = await managerService.addCustomerNote(customerId, {
        note: noteText,
        type: 'general'
      })
      
      if (result.success) {
        toast.success('Note added successfully')
        setNoteText('')
        fetchCustomerDetails() // Refresh to get updated notes
      } else {
        toast.error(result.error || 'Failed to add note')
      }
    } catch (error) {
      toast.error('Failed to add note')
      console.error(error)
    } finally {
      setAddingNote(false)
    }
  }

  const handleUpdateCustomer = async () => {
    if (!editForm.firstName?.trim()) {
      toast.error('First name is required')
      return
    }

    try {
      const payload = {
        firstName: editForm.firstName.trim(),
        lastName: editForm.lastName?.trim() || '',
        email: editForm.email?.trim() || undefined,
        phone: editForm.phone?.trim() || undefined,
        gender: editForm.gender || undefined,
        dateOfBirth: editForm.dateOfBirth || undefined,
        address: {
          street: editForm.address?.street?.trim() || '',
          city: editForm.address?.city?.trim() || '',
          state: editForm.address?.state?.trim() || '',
          zipCode: editForm.address?.pincode?.trim() || ''
        }
      }

      if (!payload.address.street && !payload.address.city && !payload.address.state && !payload.address.zipCode) {
        delete payload.address
      } else if (!payload.address.zipCode) {
        delete payload.address.zipCode
      }

      if (!payload.dateOfBirth) delete payload.dateOfBirth

      const result = await managerService.updateCustomer(customerId, payload)
      if (result.success) {
        toast.success('Customer updated successfully')
        setIsEditing(false)
        fetchCustomerDetails()
      } else {
        toast.error(result.error || 'Failed to update customer')
      }
    } catch (error) {
      toast.error('Failed to update customer')
      console.error(error)
    }
  }

  const getStatusBadge = (status) => {
    if (!status) return 'bg-gray-100 text-gray-800'
    
    const badges = {
      // Appointment statuses
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      in_progress: 'bg-purple-100 text-purple-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      no_show: 'bg-gray-100 text-gray-800',
      // Transaction statuses
      paid: 'bg-green-100 text-green-800',
      unpaid: 'bg-red-100 text-red-800',
      refunded: 'bg-red-100 text-red-800'
    }
    return badges[status.toLowerCase()] || 'bg-gray-100 text-gray-800'
  }

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <FaSpinner className="animate-spin mx-auto text-primary-600 text-4xl mb-4" />
          <p className="text-gray-600">Loading customer details...</p>
        </div>
      </div>
    )
  }

  if (!customer) return null

  const metrics = customer.metrics || {}

  const getStatusInfo = () => {
    if (customer.isBlacklisted) {
      return {
        label: 'Blacklisted',
        className: 'bg-red-100 text-red-800'
      }
    }

    if (customer.isActive === false) {
      return {
        label: 'Inactive',
        className: 'bg-yellow-100 text-yellow-800'
      }
    }

    return {
      label: 'Active',
      className: 'bg-green-100 text-green-800'
    }
  }

  const { label: statusLabel, className: statusClass } = getStatusInfo()

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/manager/customers')}
            className=" p-2 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-2 border border-gray-300"
          >
            <FaArrowLeft className="text-gray-600" /> <span className="text-gray-600">Back</span>
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <FaUser className="text-primary-600" />
                <span>{customer.name}</span>
              </h1>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusClass}`}>
                {statusLabel}
              </span>
            </div>
            <p className="text-gray-600 mt-1">Customer ID: {customer.id ? customer.id.toString().slice(-8) : 'N/A'}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <FaEdit />
            {isEditing ? 'Cancel Edit' : 'Edit'}
          </button>
          {isEditing && (
            <button
              onClick={handleUpdateCustomer}
              className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              Save Changes
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {['overview', 'timeline', 'appointments', 'transactions', 'notes'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-4 px-1 border-b-2 font-medium text-sm capitalize ${
                activeTab === tab
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Customer Info */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Customer Information</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editForm.firstName}
                        onChange={(e) => setEditForm(prev => ({ ...prev, firstName: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    ) : (
                      <p className="text-gray-900 flex items-center gap-2">
                        <FaUser className="text-gray-400" />
                        {customer.firstName}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editForm.lastName}
                        onChange={(e) => setEditForm(prev => ({ ...prev, lastName: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    ) : (
                      <p className="text-gray-900">{customer.lastName || '—'}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    {isEditing ? (
                      <input
                        type="email"
                        value={editForm.email}
                        onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    ) : (
                      <p className="text-gray-900 flex items-center gap-2">
                        <FaEnvelope className="text-gray-400" />
                        {customer.email || 'Not set'}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    {isEditing ? (
                      <input
                        type="tel"
                        value={editForm.phone}
                        onChange={(e) => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    ) : (
                      <p className="text-gray-900 flex items-center gap-2">
                        <FaPhoneAlt className="text-gray-400" />
                        {customer.phone || 'Not set'}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                    {isEditing ? (
                      <input
                        type="date"
                        value={editForm.dateOfBirth}
                        onChange={(e) => setEditForm(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    ) : (
                      <p className="text-gray-900 flex items-center gap-2">
                        <FaBirthdayCake className="text-gray-400" />
                        {customer.dateOfBirth ? formatDate(customer.dateOfBirth) : 'Not set'}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                    {isEditing ? (
                      <select
                        value={editForm.gender}
                        onChange={(e) => setEditForm(prev => ({ ...prev, gender: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      >
                        <option value="">Select</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    ) : (
                      <p className="text-gray-900 capitalize">{customer.gender || 'Not set'}</p>
                    )}
                  </div>
                </div>

                {customer.address && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                    {isEditing ? (
                      <div className="grid grid-cols-2 gap-4">
                        <input
                          type="text"
                          placeholder="Street"
                          value={editForm.address.street}
                          onChange={(e) => setEditForm(prev => ({
                            ...prev,
                            address: { ...prev.address, street: e.target.value }
                          }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                        <input
                          type="text"
                          placeholder="City"
                          value={editForm.address.city}
                          onChange={(e) => setEditForm(prev => ({
                            ...prev,
                            address: { ...prev.address, city: e.target.value }
                          }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                        <input
                          type="text"
                          placeholder="State"
                          value={editForm.address.state}
                          onChange={(e) => setEditForm(prev => ({
                            ...prev,
                            address: { ...prev.address, state: e.target.value }
                          }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                        <input
                          type="text"
                          placeholder="Pincode"
                          value={editForm.address.pincode}
                          onChange={(e) => setEditForm(prev => ({
                            ...prev,
                            address: { ...prev.address, pincode: e.target.value }
                          }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                      </div>
                    ) : (
                      <p className="text-gray-900 flex items-start gap-2">
                        <FaMapMarkerAlt className="text-gray-400 mt-1" />
                        {customer.address.street}, {customer.address.city}, {customer.address.state} - {customer.address.pincode}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Preferences */}
            {customer.preferences && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Preferences</h2>
                <div className="space-y-2">
                  {customer.preferences.preferredServices?.length > 0 && (
                    <div>
                      <span className="text-sm font-medium text-gray-700">Preferred Services: </span>
                      <span className="text-sm text-gray-600">
                        {customer.preferences.preferredServices.join(', ')}
                      </span>
                    </div>
                  )}
                  {customer.preferences.preferredTimeSlots?.length > 0 && (
                    <div>
                      <span className="text-sm font-medium text-gray-700">Preferred Time: </span>
                      <span className="text-sm text-gray-600">
                        {customer.preferences.preferredTimeSlots.join(', ')}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Stats Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Statistics</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 flex items-center gap-2">
                    <FaUsers />
                    Total Visits
                  </span>
                  <span className="text-lg font-bold text-gray-900">
                    {metrics.totalVisits || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 flex items-center gap-2">
                    <FaRupeeSign />
                    Total Spent
                  </span>
                  <span className="text-lg font-bold text-green-600">
                    {formatCurrency(metrics.totalSpent || 0)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 flex items-center gap-2">
                    <FaStar />
                    Average Rating
                  </span>
                  <span className="text-lg font-bold text-yellow-600">
                    {(metrics.averageRating || 0).toFixed(1)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 flex items-center gap-2">
                    <FaCalendarAlt />
                    Last Visit
                  </span>
                  <span className="text-sm font-medium text-gray-900">
                    {formatDate(metrics.lastVisit)}
                  </span>
                </div>
              </div>
            </div>

            {/* Analytics */}
            {analytics && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <FaChartLine />
                  Analytics
                </h2>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600">Total Appointments</p>
                    <p className="text-xl font-bold text-gray-900">{analytics.totalAppointments || 0}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Transactions</p>
                    <p className="text-xl font-bold text-gray-900">{analytics.totalTransactions || 0}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Average Spending</p>
                    <p className="text-xl font-bold text-green-600">
                      {formatCurrency(analytics.averageSpending || 0)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Loyalty Points</p>
                    <p className="text-xl font-bold text-purple-600">{analytics.loyaltyPoints || 0}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Timeline Tab */}
      {activeTab === 'timeline' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <FaHistory />
            Customer Timeline
          </h2>
          <div className="space-y-4">
            {!Array.isArray(timeline) || timeline.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No timeline events found</p>
            ) : (
              timeline.map((event, index) => (
                <div key={index} className="flex gap-4 pb-4 border-b border-gray-200 last:border-0">
                  <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                    event.type === 'appointment' ? 'bg-blue-100' : 'bg-green-100'
                  }`}>
                    {event.type === 'appointment' ? (
                      <FaCalendarAlt className={event.type === 'appointment' ? 'text-blue-600' : 'text-green-600'} />
                    ) : (
                      <FaRupeeSign className="text-green-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold text-gray-900">{event.title}</h3>
                      <span className="text-sm text-gray-500">{formatDateTime(event.date)}</span>
                    </div>
                    <p className="text-gray-600">{event.description}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Appointments Tab */}
      {activeTab === 'appointments' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <FaCalendarAlt className="text-primary-600" />
              Appointments ({appointments.length})
            </h2>
            <button
              onClick={() => navigate(`/manager/appointments?customer=${customerId}`)}
              className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm"
            >
              <FaPlus />
              New Appointment
            </button>
          </div>
          {!Array.isArray(appointments) || appointments.length === 0 ? (
            <div className="text-center py-12">
              <FaCalendarAlt className="mx-auto text-gray-400 text-4xl mb-4" />
              <p className="text-gray-500 mb-4">No appointments found</p>
              <button
                onClick={() => navigate(`/manager/appointments?customer=${customerId}`)}
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                Create new appointment →
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {appointments.map((appointment) => {
                const services = Array.isArray(appointment.services)
                  ? appointment.services.map(s => s?.serviceName || s).join(', ')
                  : appointment.serviceName || 'N/A'
                const totalPrice = appointment.finalPrice || appointment.totalPrice || 0
                
                return (
                  <div key={appointment._id} className="border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <FaCalendarAlt className="text-primary-600 text-lg" />
                          <div>
                            <p className="font-semibold text-gray-900">
                              {formatDateTime(appointment.appointmentDate)}
                            </p>
                            {appointment.startTime && appointment.endTime && (
                              <p className="text-sm text-gray-600">
                                {appointment.startTime} - {appointment.endTime}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="ml-8 space-y-2">
                          <div className="flex items-center gap-4 text-sm">
                            <span className="text-gray-600">
                              <strong>Services:</strong> {services}
                            </span>
                          </div>
                          {appointment.staff && (
                            <div className="flex items-center gap-4 text-sm">
                              <span className="text-gray-600">
                                <strong>Staff:</strong> {appointment.staff?.name || 'TBD'}
                              </span>
                              {appointment.staff?.role && (
                                <span className="text-gray-500">({appointment.staff.role})</span>
                              )}
                            </div>
                          )}
                          {totalPrice > 0 && (
                            <div className="flex items-center gap-4 text-sm">
                              <span className="text-gray-600">
                                <strong>Amount:</strong> {formatCurrency(totalPrice)}
                              </span>
                            </div>
                          )}
                          {appointment.bookingSource && (
                            <div className="flex items-center gap-4 text-sm">
                              <span className="text-gray-600">
                                <strong>Source:</strong> {appointment.bookingSource.replace('_', ' ')}
                              </span>
                            </div>
                          )}
                          {appointment.bookingNotes && (
                            <div className="text-sm text-gray-600 mt-2">
                              <strong>Notes:</strong> {appointment.bookingNotes}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getStatusBadge(appointment.status)}`}>
                          {appointment.status?.replace('_', ' ') || 'Pending'}
                        </span>
                        {appointment.confirmationCode && (
                          <span className="text-xs text-gray-500">
                            Code: {appointment.confirmationCode}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* Transactions Tab */}
      {activeTab === 'transactions' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <FaRupeeSign className="text-green-600" />
              Transactions ({transactions.length})
            </h2>
            <button
              onClick={() => navigate(`/manager/transactions/add?customer=${customerId}`)}
              className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm"
            >
              <FaPlus />
              New Transaction
            </button>
          </div>
          {!Array.isArray(transactions) || transactions.length === 0 ? (
            <div className="text-center py-12">
              <FaRupeeSign className="mx-auto text-gray-400 text-4xl mb-4" />
              <p className="text-gray-500 mb-4">No transactions found</p>
              <button
                onClick={() => navigate(`/manager/transactions/add?customer=${customerId}`)}
                className="text-primary-600 hover:text-primary-700 font-medium" title='click to create new transaction'
              >
                Create new transaction →
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Service</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment Method</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Staff</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {transactions.map((transaction) => {
                    const serviceName = transaction.serviceName || 
                      (Array.isArray(transaction.services) 
                        ? transaction.services.map(s => s?.serviceName || s).join(', ')
                        : 'N/A')
                    const finalPrice = transaction.finalPrice || transaction.basePrice || 0
                    
                    return (
                      <tr key={transaction._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {formatDateTime(transaction.transactionDate)}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          <div>
                            <div className="font-medium">{serviceName}</div>
                            {transaction.serviceType && (
                              <div className="text-xs text-gray-500 capitalize">{transaction.serviceType}</div>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-sm font-semibold text-gray-900">
                            {formatCurrency(finalPrice)}
                          </div>
                          {(transaction.discount > 0 || transaction.tax > 0) && (
                            <div className="text-xs text-gray-500">
                              Base: {formatCurrency(transaction.basePrice || finalPrice)}
                              {transaction.discount > 0 && ` | Discount: ${formatCurrency(transaction.discount)}`}
                              {transaction.tax > 0 && ` | Tax: ${formatCurrency(transaction.tax)}`}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600 capitalize">
                          {transaction.paymentMethod || 'N/A'}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getStatusBadge(transaction.paymentStatus)}`}>
                            {transaction.paymentStatus || 'Completed'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {transaction.staff?.name || 'N/A'}
                          {transaction.staff?.role && (
                            <div className="text-xs text-gray-500">{transaction.staff.role}</div>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
              {analytics && (
                <div className="mt-6 pt-6 border-t border-gray-200 grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Total Transactions</p>
                    <p className="text-xl font-bold text-gray-900">{analytics.totalTransactions || transactions.length}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Total Amount</p>
                    <p className="text-xl font-bold text-green-600">
                      {formatCurrency(transactions.reduce((sum, t) => sum + (t.finalPrice || t.basePrice || 0), 0))}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Average Spending</p>
                    <p className="text-xl font-bold text-blue-600">
                      {formatCurrency(analytics.averageSpending || (transactions.length > 0 ? transactions.reduce((sum, t) => sum + (t.finalPrice || t.basePrice || 0), 0) / transactions.length : 0))}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Notes Tab */}
      {activeTab === 'notes' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <FaStickyNote className="text-yellow-600" />
            Customer Notes
          </h2>
          
          {/* Add Note */}
          <div className="mb-6 pb-6 border-b border-gray-200">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Add New Note
            </label>
            <textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Add a note about this customer (e.g., preferences, special requests, feedback)..."
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 mb-3 resize-none"
            />
            <div className="flex items-center justify-between">
              <p className="text-xs text-gray-500">
                Notes are saved to customer preferences and can be viewed in the timeline
              </p>
              <button
                onClick={handleAddNote}
                disabled={addingNote || !noteText.trim()}
                className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {addingNote ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    <FaPlus />
                    Add Note
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Existing Notes */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-4">Previous Notes</h3>
            {customer.preferences?.notes ? (
              <div className="space-y-3">
                {customer.preferences.notes.split('\n').filter(n => n.trim()).map((note, index) => (
                  <div key={index} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <FaStickyNote className="text-yellow-500 text-sm" />
                        <span className="text-xs text-gray-500">Note #{index + 1}</span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{note}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <FaStickyNote className="mx-auto text-gray-400 text-4xl mb-4" />
                <p className="text-gray-500">No notes added yet</p>
                <p className="text-sm text-gray-400 mt-2">Add your first note above</p>
              </div>
            )}
          </div>

          {/* Timeline Notes (from timeline events) */}
          {timeline && Array.isArray(timeline) && timeline.length > 0 && (
            <div className="mt-8 pt-6 border-t border-gray-200">
              <h3 className="text-sm font-medium text-gray-700 mb-4">Activity Timeline</h3>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {timeline.slice(0, 10).map((event, index) => (
                  <div key={index} className="flex gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                      event.type === 'appointment' ? 'bg-blue-100' : 'bg-green-100'
                    }`}>
                      {event.type === 'appointment' ? (
                        <FaCalendarAlt className={event.type === 'appointment' ? 'text-blue-600 text-xs' : 'text-green-600 text-xs'} />
                      ) : (
                        <FaRupeeSign className="text-green-600 text-xs" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="text-sm font-medium text-gray-900">{event.title}</h4>
                        <span className="text-xs text-gray-500">{formatDate(event.date)}</span>
                      </div>
                      <p className="text-xs text-gray-600">{event.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default CustomerDetails
