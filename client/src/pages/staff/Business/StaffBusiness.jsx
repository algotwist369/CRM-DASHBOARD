import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  FaBuilding,
  FaMapMarkerAlt,
  FaPhone,
  FaEnvelope,
  FaGlobe,
  FaIdCard,
  FaCalendarAlt,
  FaUsers,
  FaUserTie,
  FaChartLine
} from 'react-icons/fa'
import { HiRefresh } from 'react-icons/hi'
import { toast } from 'react-hot-toast'
import staffService from '../../../services/staff/staffService'

const StaffBusiness = () => {
  const navigate = useNavigate()
  const [businessData, setBusinessData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const fetchBusiness = useCallback(async () => {
    try {
      setLoading(true)
      setRefreshing(true)
      const res = await staffService.getBusiness()
      if (res.success) {
        const data = res.data.data || res.data
        setBusinessData(data)
      } else {
        toast.error(res.error || 'Failed to load business information')
      }
    } catch (e) {
      toast.error('Failed to load business information')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    fetchBusiness()
  }, [fetchBusiness])

  const formatDate = (dateString) => {
    if (!dateString) return '—'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  }

  const formatBusinessType = (type) => {
    if (!type) return '—'
    return type.charAt(0).toUpperCase() + type.slice(1)
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-gray-600">
        Loading business information...
      </div>
    )
  }

  if (!businessData || !businessData.business) {
    return (
      <div className="p-6 text-red-600">
        Failed to load business information
      </div>
    )
  }

  const { business, staff } = businessData

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen">
      {/* Header Section */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-1">My Business</h1>
            <p className="text-sm text-gray-600">
              View your business information and details
            </p>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={fetchBusiness}
              disabled={refreshing}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-primary-600 text-white  hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
              title="Refresh"
            >
              <HiRefresh className={`text-lg ${refreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Left Column - Business Overview */}
        <div className="lg:col-span-1">
          <div className="bg-white  border border-gray-200 p-5">
            <div className="text-center mb-5">
              <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <FaBuilding className="text-primary-600 text-3xl" />
              </div>
              <h2 className="text-lg font-semibold text-gray-800 mb-2">{business.name}</h2>
              <span className="inline-block px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                {formatBusinessType(business.type)}
              </span>
            </div>

            <div className="space-y-3 pt-4 border-t border-gray-200">
              {business.branch && (
                <InfoItem
                  icon={FaBuilding}
                  label="Branch"
                  value={business.branch}
                />
              )}
              {business.phone && (
                <InfoItem
                  icon={FaPhone}
                  label="Phone"
                  value={business.phone}
                />
              )}
              {business.email && (
                <InfoItem
                  icon={FaEnvelope}
                  label="Email"
                  value={business.email}
                />
              )}
              {business.website && (
                <InfoItem
                  icon={FaGlobe}
                  label="Website"
                  value={business.website}
                />
              )}
            </div>

            {/* Staff Info */}
            {staff && (
              <div className="mt-5 pt-5 border-t border-gray-200">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Your Role</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Role</span>
                    <span className="font-medium text-gray-800 capitalize">
                      {staff.role || '—'}
                    </span>
                  </div>
                  {staff.specialization && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Specialization</span>
                      <span className="font-medium text-gray-800">{staff.specialization}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Business Details */}
        <div className="lg:col-span-2 space-y-4 sm:gap-6">
          {/* Business Information */}
          <div className="bg-white  border border-gray-200 p-5 sm:p-6">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-8 h-8 bg-primary-600  flex items-center justify-center">
                <FaBuilding className="text-white text-sm" />
              </div>
              <h2 className="text-lg font-semibold text-gray-800">Business Information</h2>
            </div>

            <div className="space-y-2">
              <InfoRow
                icon={FaBuilding}
                label="Business Name"
                value={business.name || '—'}
              />
              <InfoRow
                icon={FaIdCard}
                label="Business Type"
                value={formatBusinessType(business.type)}
              />
              {business.branch && (
                <InfoRow
                  icon={FaBuilding}
                  label="Branch"
                  value={business.branch}
                />
              )}
              {business.address && (
                <InfoRow
                  icon={FaMapMarkerAlt}
                  label="Address"
                  value={business.address}
                />
              )}
              {business.city && (
                <InfoRow
                  icon={FaMapMarkerAlt}
                  label="City"
                  value={business.city}
                />
              )}
              {business.state && (
                <InfoRow
                  icon={FaMapMarkerAlt}
                  label="State"
                  value={business.state}
                />
              )}
              {business.pincode && (
                <InfoRow
                  icon={FaMapMarkerAlt}
                  label="Pincode"
                  value={business.pincode}
                />
              )}
              {business.country && (
                <InfoRow
                  icon={FaMapMarkerAlt}
                  label="Country"
                  value={business.country}
                />
              )}
              {business.phone && (
                <InfoRow
                  icon={FaPhone}
                  label="Phone"
                  value={business.phone}
                />
              )}
              {business.email && (
                <InfoRow
                  icon={FaEnvelope}
                  label="Email"
                  value={business.email}
                />
              )}
              {business.website && (
                <InfoRow
                  icon={FaGlobe}
                  label="Website"
                  value={business.website}
                />
              )}
              {business.gstNumber && (
                <InfoRow
                  icon={FaIdCard}
                  label="GST Number"
                  value={business.gstNumber}
                />
              )}
              {business.panNumber && (
                <InfoRow
                  icon={FaIdCard}
                  label="PAN Number"
                  value={business.panNumber}
                />
              )}
              {business.registrationNumber && (
                <InfoRow
                  icon={FaIdCard}
                  label="Registration Number"
                  value={business.registrationNumber}
                />
              )}
              {business.establishedDate && (
                <InfoRow
                  icon={FaCalendarAlt}
                  label="Established Date"
                  value={formatDate(business.establishedDate)}
                />
              )}
            </div>
          </div>

          {/* Additional Information */}
          {(business.description || business.services || business.workingHours) && (
            <div className="bg-white  border border-gray-200 p-5 sm:p-6">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-8 h-8 bg-primary-600  flex items-center justify-center">
                  <FaIdCard className="text-white text-sm" />
                </div>
                <h2 className="text-lg font-semibold text-gray-800">Additional Information</h2>
              </div>

              <div className="space-y-4">
                {business.description && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                    <p className="text-sm text-gray-800 bg-gray-50 p-4  border border-gray-200">
                      {business.description}
                    </p>
                  </div>
                )}

                {business.workingHours && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Working Hours</label>
                    <div className="bg-gray-50 p-4  border border-gray-200">
                      <p className="text-sm font-medium text-gray-800 mb-2">
                        {business.workingHours.start || '09:00'} - {business.workingHours.end || '18:00'}
                      </p>
                      {business.workingHours.days && business.workingHours.days.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {business.workingHours.days.map((day, index) => (
                            <span
                              key={index}
                              className="px-3 py-1 text-xs font-medium bg-blue-100 text-blue-800 "
                            >
                              {day.charAt(0).toUpperCase() + day.slice(1)}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {business.services && business.services.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Services Offered</label>
                    <div className="flex flex-wrap gap-2">
                      {business.services.map((service, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 text-xs font-medium bg-blue-100 text-blue-800 "
                        >
                          {service}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Business Statistics */}
          {(business.totalStaff || business.totalCustomers || business.totalRevenue) && (
            <div className="bg-white  border border-gray-200 p-5 sm:p-6">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-8 h-8 bg-primary-600  flex items-center justify-center">
                  <FaChartLine className="text-white text-sm" />
                </div>
                <h2 className="text-lg font-semibold text-gray-800">Business Statistics</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {business.totalStaff !== undefined && (
                  <div className="text-center p-4 bg-gray-50  border border-gray-200">
                    <p className="text-2xl sm:text-3xl font-bold text-gray-900">{business.totalStaff || 0}</p>
                    <p className="text-xs sm:text-sm text-gray-600 mt-2 font-medium">Total Staff</p>
                  </div>
                )}
                {business.totalCustomers !== undefined && (
                  <div className="text-center p-4 bg-gray-50  border border-gray-200">
                    <p className="text-2xl sm:text-3xl font-bold text-gray-900">{business.totalCustomers || 0}</p>
                    <p className="text-xs sm:text-sm text-gray-600 mt-2 font-medium">Total Customers</p>
                  </div>
                )}
                {business.totalRevenue !== undefined && (
                  <div className="text-center p-4 bg-gray-50  border border-gray-200">
                    <p className="text-2xl sm:text-3xl font-bold text-gray-900">
                      ₹{business.totalRevenue?.toLocaleString('en-IN') || 0}
                    </p>
                    <p className="text-xs sm:text-sm text-gray-600 mt-2 font-medium">Total Revenue</p>
                  </div>
                )}
              </div>
            </div>
          )}
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
  <div className="flex items-start gap-3 py-2 border-b border-gray-100 last:border-0">
    <Icon className="text-gray-400 text-sm mt-1 flex-shrink-0" />
    <div className="flex-1 min-w-0">
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className="text-sm font-medium text-gray-800 break-words">{value}</p>
    </div>
  </div>
)

export default StaffBusiness
