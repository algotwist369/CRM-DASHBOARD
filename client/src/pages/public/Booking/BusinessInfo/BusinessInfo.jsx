import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import {
  FaSpinner,
  FaMapMarkerAlt,
  FaPhone,
  FaEnvelope,
  FaGlobe,
  FaClock,
  FaUserTie,
  FaArrowRight,
  FaCheckCircle,
  FaExclamationCircle
} from 'react-icons/fa'
import appointmentService from '../../../../services/public/appointmentService'

const BusinessInfo = () => {
  const navigate = useNavigate()
  const { businessLink } = useParams()
  const [loading, setLoading] = useState(true)
  const [business, setBusiness] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (businessLink) {
      fetchBusinessInfo()
    } else {
      setError('Invalid business link')
      setLoading(false)
    }
  }, [businessLink])

  const fetchBusinessInfo = async () => {
    try {
      setLoading(true)
      setError(null)
      const result = await appointmentService.getBusinessInfo(businessLink)

      if (result.success && result.data?.success) {
        const businessData = result.data.data
        setBusiness(businessData)
        // Store business info in sessionStorage for booking flow
        sessionStorage.setItem('bookingBusiness', JSON.stringify(businessData))
      } else {
        setError(result.error || result.data?.message || 'Failed to fetch business information')
        toast.error(result.error || result.data?.message || 'Business not found')
      }
    } catch (error) {
      setError('Failed to load business information')
      toast.error('Failed to load business information')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleContinue = () => {
    if (business && business.services && business.services.length > 0) {
      navigate(`/book/${businessLink}/services`)
    } else {
      toast.error('No services available for this business')
    }
  }

  const formatWorkingHours = (workingHours) => {
    if (!workingHours) return 'Not specified'
    
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    return days.map((day, index) => {
      const dayKey = day.toLowerCase()
      const hours = workingHours[dayKey]
      if (!hours || (!hours.open && !hours.close)) {
        return { day, hours: 'Closed' }
      }
      return {
        day,
        hours: hours.open && hours.close ? `${hours.open} - ${hours.close}` : 'Closed'
      }
    })
  }

  const formatTime = (time) => {
    if (!time) return 'N/A'
    // If time is in HH:MM format, return as is
    if (typeof time === 'string' && time.includes(':')) {
      return time
    }
    return time
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="text-center">
          <FaSpinner className="animate-spin mx-auto text-primary-600 text-4xl mb-4" />
          <p className="text-gray-600">Loading business information...</p>
        </div>
      </div>
    )
  }

  if (error || !business) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center max-w-md">
          <FaExclamationCircle className="mx-auto text-red-500 text-4xl mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Business Not Found</h2>
          <p className="text-gray-600 mb-6">{error || 'The business you are looking for could not be found.'}</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            Go Home
          </button>
        </div>
      </div>
    )
  }

  const workingHoursList = formatWorkingHours(business.workingHours)

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{business.name}</h1>
              {business.branch && (
                <p className="text-lg text-gray-600 mb-2">{business.branch}</p>
              )}
              {business.type && (
                <span className="inline-block px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-sm font-medium">
                  {business.type}
                </span>
              )}
            </div>
            {business.appointmentSettings?.allowOnlineBooking && (
              <div className="flex items-center gap-2 text-green-600">
                <FaCheckCircle />
                <span className="text-sm font-medium">Online Booking Available</span>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            {business.description && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">About</h2>
                <p className="text-gray-700 leading-relaxed">{business.description}</p>
              </div>
            )}

            {/* Contact Information */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Contact Information</h2>
              <div className="space-y-3">
                {business.address && (
                  <div className="flex items-start gap-3">
                    <FaMapMarkerAlt className="text-primary-600 mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-gray-700">Address</p>
                      <p className="text-gray-600">{business.address}</p>
                    </div>
                  </div>
                )}
                {business.phone && (
                  <div className="flex items-center gap-3">
                    <FaPhone className="text-primary-600 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-gray-700">Phone</p>
                      <a href={`tel:${business.phone}`} className="text-primary-600 hover:underline">
                        {business.phone}
                      </a>
                    </div>
                  </div>
                )}
                {business.email && (
                  <div className="flex items-center gap-3">
                    <FaEnvelope className="text-primary-600 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-gray-700">Email</p>
                      <a href={`mailto:${business.email}`} className="text-primary-600 hover:underline">
                        {business.email}
                      </a>
                    </div>
                  </div>
                )}
                {business.website && (
                  <div className="flex items-center gap-3">
                    <FaGlobe className="text-primary-600 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-gray-700">Website</p>
                      <a 
                        href={business.website.startsWith('http') ? business.website : `https://${business.website}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary-600 hover:underline"
                      >
                        {business.website}
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Working Hours */}
            {business.workingHours && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <FaClock className="text-primary-600" />
                  Working Hours
                </h2>
                <div className="space-y-2">
                  {workingHoursList.map((item, index) => (
                    <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                      <span className="text-sm font-medium text-gray-700">{item.day}</span>
                      <span className="text-sm text-gray-600">{item.hours}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Available Services */}
            {business.services && business.services.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Available Services</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {business.services.map((service, index) => (
                    <div key={index} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                      <FaCheckCircle className="text-green-600 flex-shrink-0" />
                      <span className="text-gray-700">{typeof service === 'object' ? service.name || service.serviceName : service}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Staff Information */}
            {business.staff && business.staff.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <FaUserTie className="text-primary-600" />
                  Our Team
                </h2>
                <div className="space-y-3">
                  {business.staff.slice(0, 5).map((staff, index) => (
                    <div key={index} className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm font-medium text-gray-900">{staff.name}</p>
                      {staff.role && (
                        <p className="text-xs text-gray-600">{staff.role}</p>
                      )}
                      {staff.specialization && (
                        <p className="text-xs text-gray-500 mt-1">Specializes in: {staff.specialization}</p>
                      )}
                    </div>
                  ))}
                  {business.staff.length > 5 && (
                    <p className="text-xs text-gray-500 text-center">
                      +{business.staff.length - 5} more staff members
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Booking Information */}
            {business.appointmentSettings && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Booking Information</h2>
                <div className="space-y-2 text-sm">
                  {business.appointmentSettings.slotDuration && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Slot Duration</span>
                      <span className="text-gray-900 font-medium">{business.appointmentSettings.slotDuration} minutes</span>
                    </div>
                  )}
                  {business.appointmentSettings.advanceBookingDays && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Advance Booking</span>
                      <span className="text-gray-900 font-medium">Up to {business.appointmentSettings.advanceBookingDays} days</span>
                    </div>
                  )}
                  {business.appointmentSettings.cancellationHours && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Cancellation Notice</span>
                      <span className="text-gray-900 font-medium">{business.appointmentSettings.cancellationHours} hours</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Continue Button */}
            <button
              onClick={handleContinue}
              disabled={!business.services || business.services.length === 0}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium text-lg"
            >
              Continue Booking
              <FaArrowRight />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BusinessInfo
