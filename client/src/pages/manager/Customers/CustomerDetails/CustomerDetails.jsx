import React, { useState, useEffect, useCallback, memo, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import {
  FaArrowLeft,
  FaUser,
  FaPhoneAlt,
  FaEnvelope,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaStar,
  FaEdit,
  FaPlus,
  FaSpinner,
  FaUsers,
  FaHistory,
  FaStickyNote,
  FaBirthdayCake,
  FaTags,
  FaGift
} from 'react-icons/fa'
import managerService from '../../../../services/manager/managerService'

// Memoized Stat Item
const StatItem = memo(({ icon: Icon, label, value, color = "text-gray-900" }) => (
  <div className="flex items-center justify-between py-2">
    <span className="text-sm text-gray-600 flex items-center gap-2">
      <Icon size={14} />
      {label}
    </span>
    <span className={`text-sm font-semibold ${color}`}>{value}</span>
  </div>
))

const CustomerDetails = () => {
  const navigate = useNavigate()
  const { id: customerId } = useParams()
  const [loading, setLoading] = useState(true)
  const [customer, setCustomer] = useState(null)
  const [timeline, setTimeline] = useState([])
  const [activeTab, setActiveTab] = useState('overview')
  const [noteText, setNoteText] = useState('')
  const [addingNote, setAddingNote] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({})

  // Refs for preventing duplicate API calls
  const fetchingCustomerRef = useRef(false)
  const fetchingTimelineRef = useRef(false)
  const lastCustomerIdRef = useRef(null)
  const mountedRef = useRef(true)

  // Cleanup on unmount
  useEffect(() => {
    mountedRef.current = true
    return () => { mountedRef.current = false }
  }, [])

  const fetchCustomerDetails = useCallback(async () => {
    if (!customerId || customerId === 'undefined') return
    if (fetchingCustomerRef.current) return
    if (lastCustomerIdRef.current === customerId && customer) return // Already fetched

    try {
      fetchingCustomerRef.current = true
      setLoading(true)
      const result = await managerService.getCustomerDetails(customerId)

      if (!mountedRef.current) return

      if (result.success) {
        const customerData = result.data?.data || result.data

        if (!customerData) {
          toast.error('Customer not found')
          navigate('/manager/customers')
          return
        }

        const fullName = customerData.firstName
          ? `${customerData.firstName} ${customerData.lastName || ''}`.trim()
          : customerData.name || 'Unknown'

        setCustomer({
          ...customerData,
          fullName,
          name: fullName,
        })

        setEditForm({
          firstName: customerData.firstName || '',
          lastName: customerData.lastName || '',
          email: customerData.email || '',
          phone: customerData.phone || '',
          dateOfBirth: customerData.dateOfBirth ? new Date(customerData.dateOfBirth).toISOString().split('T')[0] : '',
          gender: customerData.gender || '',
          address: {
            street: customerData.address?.street || '',
            city: customerData.address?.city || '',
            state: customerData.address?.state || '',
            pincode: customerData.address?.pincode || '',
          }
        })

        lastCustomerIdRef.current = customerId
      } else {
        toast.error(result.error || 'Failed to fetch customer')
        navigate('/manager/customers')
      }
    } catch (error) {
      if (mountedRef.current) {
        toast.error('Failed to fetch customer')
        navigate('/manager/customers')
      }
    } finally {
      if (mountedRef.current) setLoading(false)
      fetchingCustomerRef.current = false
    }
  }, [customerId, customer, navigate])

  const fetchTimeline = useCallback(async () => {
    if (!customerId || customerId === 'undefined') return
    if (fetchingTimelineRef.current) return

    try {
      fetchingTimelineRef.current = true
      const result = await managerService.getCustomerTimeline(customerId)
      if (!mountedRef.current) return

      if (result.success) {
        const data = result.data?.data || result.data
        setTimeline(Array.isArray(data?.timeline) ? data.timeline : [])
      }
    } catch (error) {
      console.error('Failed to fetch timeline:', error)
    } finally {
      fetchingTimelineRef.current = false
    }
  }, [customerId])

  useEffect(() => {
    if (customerId && customerId !== 'undefined') {
      fetchCustomerDetails()
      fetchTimeline()
    } else {
      toast.error('Invalid customer ID')
      navigate('/manager/customers')
    }
  }, [customerId]) // Only depend on customerId, not the functions

  const handleAddNote = useCallback(async () => {
    if (!noteText.trim() || addingNote) return
    try {
      setAddingNote(true)
      const result = await managerService.addCustomerNote(customerId, { note: noteText, type: 'general' })
      if (!mountedRef.current) return

      if (result.success) {
        toast.success('Note added')
        setNoteText('')
        lastCustomerIdRef.current = null // Force refresh
        fetchCustomerDetails()
      } else {
        toast.error(result.error || 'Failed to add note')
      }
    } catch (error) {
      if (mountedRef.current) toast.error('Failed to add note')
    } finally {
      if (mountedRef.current) setAddingNote(false)
    }
  }, [noteText, addingNote, customerId, fetchCustomerDetails])

  const handleUpdateCustomer = useCallback(async () => {
    try {
      const result = await managerService.updateCustomer(customerId, editForm)
      if (!mountedRef.current) return

      if (result.success) {
        toast.success('Customer updated')
        setIsEditing(false)
        lastCustomerIdRef.current = null // Force refresh
        fetchCustomerDetails()
      } else {
        toast.error(result.error || 'Failed to update')
      }
    } catch (error) {
      if (mountedRef.current) toast.error('Failed to update')
    }
  }, [customerId, editForm, fetchCustomerDetails])

  const formatCurrency = useCallback((amount) => `₹${(amount || 0).toLocaleString('en-IN')}`, [])
  const formatDate = useCallback((dateString) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
  }, [])

  if (loading) {
    return (
      <div className="p-4 flex items-center justify-center min-h-64">
        <FaSpinner className="animate-spin text-primary-600 text-2xl" />
      </div>
    )
  }

  if (!customer) return null

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/manager/customers')} className="p-2 hover:bg-gray-100">
            <FaArrowLeft className="text-gray-600" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              {customer.fullName}
              <span className={`px-2 py-0.5 text-xs rounded-full ${customer.isActive !== false ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                {customer.isActive !== false ? 'Active' : 'Inactive'}
              </span>
            </h1>
            <p className="text-sm text-gray-500">ID: {customer._id?.slice(-8)}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="flex items-center gap-2 px-3 py-2 border border-gray-300 text-sm hover:bg-gray-50"
          >
            <FaEdit size={14} />
            {isEditing ? 'Cancel' : 'Edit'}
          </button>
          {isEditing && (
            <button onClick={handleUpdateCustomer} className="px-3 py-2 bg-primary-600 text-white text-sm hover:bg-primary-700">
              Save
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-4">
        <nav className="flex gap-4 overflow-x-auto">
          {['overview', 'timeline', 'notes'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-2 px-1 border-b-2 text-sm capitalize whitespace-nowrap ${activeTab === tab ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500'
                }`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Customer Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white border border-gray-200 p-4">
              <h2 className="font-semibold text-gray-900 mb-3">Customer Information</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-500">First Name</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editForm.firstName}
                      onChange={(e) => setEditForm(prev => ({ ...prev, firstName: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 text-sm focus:outline-none focus:border-primary-500"
                    />
                  ) : (
                    <p className="text-sm text-gray-900 flex items-center gap-2">
                      <FaUser className="text-gray-400" size={12} />
                      {customer.firstName || '-'}
                    </p>
                  )}
                </div>
                <div>
                  <label className="text-xs text-gray-500">Last Name</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editForm.lastName}
                      onChange={(e) => setEditForm(prev => ({ ...prev, lastName: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 text-sm focus:outline-none focus:border-primary-500"
                    />
                  ) : (
                    <p className="text-sm text-gray-900">{customer.lastName || '-'}</p>
                  )}
                </div>
                <div>
                  <label className="text-xs text-gray-500">Email</label>
                  {isEditing ? (
                    <input
                      type="email"
                      value={editForm.email}
                      onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 text-sm focus:outline-none focus:border-primary-500"
                    />
                  ) : (
                    <p className="text-sm text-gray-900 flex items-center gap-2">
                      <FaEnvelope className="text-gray-400" size={12} />
                      {customer.email || '-'}
                    </p>
                  )}
                </div>
                <div>
                  <label className="text-xs text-gray-500">Phone</label>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={editForm.phone}
                      onChange={(e) => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 text-sm focus:outline-none focus:border-primary-500"
                    />
                  ) : (
                    <p className="text-sm text-gray-900 flex items-center gap-2">
                      <FaPhoneAlt className="text-gray-400" size={12} />
                      {customer.phone || '-'}
                    </p>
                  )}
                </div>
                <div>
                  <label className="text-xs text-gray-500">Date of Birth</label>
                  {isEditing ? (
                    <input
                      type="date"
                      value={editForm.dateOfBirth}
                      onChange={(e) => setEditForm(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 text-sm focus:outline-none focus:border-primary-500"
                    />
                  ) : (
                    <p className="text-sm text-gray-900 flex items-center gap-2">
                      <FaBirthdayCake className="text-gray-400" size={12} />
                      {customer.dateOfBirth ? formatDate(customer.dateOfBirth) : '-'}
                    </p>
                  )}
                </div>
                <div>
                  <label className="text-xs text-gray-500">Gender</label>
                  {isEditing ? (
                    <select
                      value={editForm.gender}
                      onChange={(e) => setEditForm(prev => ({ ...prev, gender: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 text-sm focus:outline-none focus:border-primary-500 bg-white"
                    >
                      <option value="">Select</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  ) : (
                    <p className="text-sm text-gray-900 capitalize">{customer.gender || '-'}</p>
                  )}
                </div>
              </div>

              {/* Address */}
              {(customer.address?.street || isEditing) && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <label className="text-xs text-gray-500">Address</label>
                  {isEditing ? (
                    <div className="grid grid-cols-2 gap-2 mt-1">
                      <input placeholder="Street" value={editForm.address.street}
                        onChange={(e) => setEditForm(prev => ({ ...prev, address: { ...prev.address, street: e.target.value } }))}
                        className="px-3 py-2 border border-gray-300 text-sm" />
                      <input placeholder="City" value={editForm.address.city}
                        onChange={(e) => setEditForm(prev => ({ ...prev, address: { ...prev.address, city: e.target.value } }))}
                        className="px-3 py-2 border border-gray-300 text-sm" />
                      <input placeholder="State" value={editForm.address.state}
                        onChange={(e) => setEditForm(prev => ({ ...prev, address: { ...prev.address, state: e.target.value } }))}
                        className="px-3 py-2 border border-gray-300 text-sm" />
                      <input placeholder="Pincode" value={editForm.address.pincode}
                        onChange={(e) => setEditForm(prev => ({ ...prev, address: { ...prev.address, pincode: e.target.value } }))}
                        className="px-3 py-2 border border-gray-300 text-sm" />
                    </div>
                  ) : (
                    <p className="text-sm text-gray-900 flex items-center gap-2">
                      <FaMapMarkerAlt className="text-gray-400" size={12} />
                      {[customer.address?.street, customer.address?.city, customer.address?.state, customer.address?.pincode]
                        .filter(Boolean).join(', ') || '-'}
                    </p>
                  )}
                </div>
              )}

              {/* Tags */}
              {customer.tags?.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <label className="text-xs text-gray-500 flex items-center gap-1 mb-2">
                    <FaTags size={10} /> Tags
                  </label>
                  <div className="flex flex-wrap gap-1">
                    {customer.tags.map((tag, i) => (
                      <span key={i} className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded-full">{tag}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Preferences */}
            {customer.preferences?.preferredStaff?.length > 0 || customer.preferences?.preferredServices?.length > 0 ? (
              <div className="bg-white border border-gray-200 p-4">
                <h2 className="font-semibold text-gray-900 mb-3">Preferences</h2>
                {customer.preferences.preferredStaff?.length > 0 && (
                  <div className="mb-2">
                    <span className="text-xs text-gray-500">Preferred Staff:</span>
                    <span className="text-sm text-gray-900 ml-2">
                      {customer.preferences.preferredStaff.map(s => s.name || s).join(', ')}
                    </span>
                  </div>
                )}
                {customer.preferences.preferredServices?.length > 0 && (
                  <div>
                    <span className="text-xs text-gray-500">Preferred Services:</span>
                    <span className="text-sm text-gray-900 ml-2">
                      {customer.preferences.preferredServices.map(s => s.name || s).join(', ')}
                    </span>
                  </div>
                )}
              </div>
            ) : null}

            {/* Referred By */}
            {customer.referredBy && (
              <div className="bg-white border border-gray-200 p-4">
                <h2 className="font-semibold text-gray-900 mb-2">Referred By</h2>
                <p className="text-sm text-gray-700">
                  {customer.referredBy.firstName} {customer.referredBy.lastName} - {customer.referredBy.phone}
                </p>
              </div>
            )}
          </div>

          {/* Stats Sidebar */}
          <div className="space-y-4">
            <div className="bg-white border border-gray-200 p-4">
              <h2 className="font-semibold text-gray-900 mb-3">Statistics</h2>
              <div className="divide-y divide-gray-100">
                <StatItem icon={FaUsers} label="Total Visits" value={customer.totalVisits || 0} />
                <StatItem icon={FaCalendarAlt} label="Total Spent" value={formatCurrency(customer.totalSpent || 0)} color="text-green-600" />
                <StatItem icon={FaCalendarAlt} label="Avg Spent" value={formatCurrency(customer.averageSpent || 0)} color="text-blue-600" />
                <StatItem icon={FaCalendarAlt} label="Last Visit" value={formatDate(customer.lastVisit)} />
                <StatItem icon={FaGift} label="Loyalty Points" value={customer.loyaltyPoints || 0} color="text-purple-600" />
                <StatItem icon={FaStar} label="Membership" value={customer.membershipTier || 'None'} />
              </div>
            </div>

            {/* Business Info */}
            {customer.business && (
              <div className="bg-white border border-gray-200 p-4">
                <h2 className="font-semibold text-gray-900 mb-2">Business</h2>
                <p className="text-sm text-gray-700">{customer.business.name}</p>
                {customer.business.branch && (
                  <p className="text-xs text-gray-500">{customer.business.branch}</p>
                )}
              </div>
            )}

            {/* Customer Type */}
            <div className="bg-white border border-gray-200 p-4">
              <h2 className="font-semibold text-gray-900 mb-2">Customer Type</h2>
              <span className={`px-2 py-1 rounded-full text-xs ${customer.customerType === 'vip' ? 'bg-yellow-100 text-yellow-700' :
                customer.customerType === 'regular' ? 'bg-blue-100 text-blue-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                {customer.customerType || 'Regular'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Timeline Tab */}
      {activeTab === 'timeline' && (
        <div className="bg-white border border-gray-200 p-4">
          <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <FaHistory /> Customer Timeline
          </h2>
          {timeline.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-8">No timeline events</p>
          ) : (
            <div className="space-y-3">
              {timeline.map((event, i) => (
                <div key={i} className="flex gap-3 pb-3 border-b border-gray-100 last:border-0">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${event.type === 'appointment' ? 'bg-blue-100' : 'bg-green-100'
                    }`}>
                    <FaCalendarAlt className={event.type === 'appointment' ? 'text-blue-600' : 'text-green-600'} size={12} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-medium text-gray-900">{event.title}</h3>
                      <span className="text-xs text-gray-500">{formatDate(event.date)}</span>
                    </div>
                    <p className="text-xs text-gray-600">{event.description}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Notes Tab */}
      {activeTab === 'notes' && (
        <div className="bg-white border border-gray-200 p-4">
          <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <FaStickyNote className="text-yellow-600" /> Notes
          </h2>

          {/* Add Note */}
          <div className="mb-4 pb-4 border-b border-gray-200">
            <textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Add a note..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 text-sm focus:outline-none focus:border-primary-500 resize-none mb-2"
            />
            <button
              onClick={handleAddNote}
              disabled={addingNote || !noteText.trim()}
              className="flex items-center gap-2 px-3 py-2 bg-primary-600 text-white text-sm hover:bg-primary-700 disabled:opacity-50"
            >
              {addingNote ? <FaSpinner className="animate-spin" /> : <FaPlus />}
              Add Note
            </button>
          </div>

          {/* Existing Notes */}
          {customer.notes ? (
            <div className="space-y-2">
              {customer.notes.split('\n').filter(n => n.trim()).map((note, i) => (
                <div key={i} className="p-3 bg-gray-50 border border-gray-200">
                  <p className="text-sm text-gray-700">{note}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 text-center py-6">No notes yet</p>
          )}
        </div>
      )}
    </div>
  )
}

export default memo(CustomerDetails)
