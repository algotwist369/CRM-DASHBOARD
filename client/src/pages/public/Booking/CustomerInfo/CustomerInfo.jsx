import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import {
  FaSpinner,
  FaArrowLeft,
  FaArrowRight,
  FaUser,
  FaEnvelope,
  FaPhoneAlt,
  FaCalendarAlt,
} from 'react-icons/fa'
import { usePageTitle } from '../../../../hooks/usePageTitle'

const CustomerInfo = () => {
  const navigate = useNavigate()
  const { businessLink } = useParams()
  const [business, setBusiness] = useState(null)
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    address: '',
    notes: '' || 'NA',
    specialRequests: '' || 'NA',
  })
  const [errors, setErrors] = useState({})

  // Update page title
  usePageTitle()

  useEffect(() => {
    loadBusinessData()
    loadCustomerData()
  }, [businessLink])

  const loadBusinessData = () => {
    const businessData = sessionStorage.getItem('bookingBusiness')
    if (businessData) {
      try {
        const parsed = JSON.parse(businessData)
        setBusiness(parsed)
        setLoading(false)
      } catch (error) {
        navigate(`/${businessLink}`)
      }
    } else {
      navigate(`/${businessLink}`)
    }
  }

  const loadCustomerData = () => {
    const saved = sessionStorage.getItem('customerInfo')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        setFormData(prev => ({ ...prev, ...parsed }))
      } catch (error) {
        console.error('Failed to load customer data')
      }
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validate = () => {
    const newErrors = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required'
    } else if (!/^[0-9]{10}$/.test(formData.phone.replace(/\D/g, ''))) {
      newErrors.phone = 'Please enter a valid 10-digit phone number'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleContinue = () => {
    if (!validate()) {
      toast.error('Please fill in all required fields correctly')
      return
    }

    sessionStorage.setItem('customerInfo', JSON.stringify(formData))
    navigate(`/book/${businessLink}/confirmation`) // Go to booking confirmation page
  }

  const handleBack = () => {
    navigate(`/book/${businessLink}/time`) // Go back to time selection page
  }

  if (loading || !business) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="text-center">
          <FaSpinner className="animate-spin mx-auto text-primary-600 text-4xl mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <FaArrowLeft />
            Back
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Your Information</h1>
          <p className="text-gray-600 mt-2">Please provide your details to complete the booking</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form */}
          <div className="lg:col-span-2">
            <div className="bg-white   border border-gray-200 p-6 space-y-6">

              {/* Required Fields */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Required Information</h2>

                {/* FIX: Changed from flex/justify-center to a responsive grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                  {/* Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <FaUser className="inline mr-2" />
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className={`w-full px-4 py-2 border  focus:outline-none focus:ring-2 focus:ring-primary-500 ${errors.name ? 'border-red-500' : 'border-gray-300'
                        }`}
                      placeholder="Full name"
                    />
                    {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <FaEnvelope className="inline mr-2" />
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={`w-full px-4 py-2 border  focus:outline-none focus:ring-2 focus:ring-primary-500 ${errors.email ? 'border-red-500' : 'border-gray-300'
                        }`}
                      placeholder="your.email@example.com"
                    />
                    {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <FaPhoneAlt className="inline mr-2" />
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className={`w-full px-4 py-2 border  focus:outline-none focus:ring-2 focus:ring-primary-500 ${errors.phone ? 'border-red-500' : 'border-gray-300'
                        }`}
                      placeholder="10-digit phone number"
                      maxLength={10}
                    />
                    {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
                  </div>
                </div>
              </div>

              {/* Optional Fields */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Optional Information</h2>
                <div className="space-y-4">

                  {/* DOB and Gender Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Date of Birth */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <FaCalendarAlt className="inline mr-2" />
                        Date of Birth
                      </label>
                      <input
                        type="date"
                        name="dateOfBirth"
                        value={formData.dateOfBirth}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300  focus:outline-none focus:ring-2 focus:ring-primary-500"
                        max={new Date().toISOString().split('T')[0]}
                      />
                    </div>

                    {/* Gender */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                      <select
                        name="gender"
                        value={formData.gender}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300  focus:outline-none focus:ring-2 focus:ring-primary-500"
                      >
                        <option value="">Select gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                        <option value="prefer_not_to_say">Prefer not to say</option>
                      </select>
                    </div>
                  </div>

                  {/* Address */}
                  {/* <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <FaMapMarkerAlt className="inline mr-2" />
            Address
          </label>
          <textarea
            name="address"
            value={formData.address}
            onChange={handleChange}
            rows={3}
            className="w-full px-4 py-2 border border-gray-300  focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="Enter your address (optional)"
          />
        </div> */}

                  {/* Notes */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Additional Notes</label>
                    <textarea
                      name="notes"
                      value={formData.notes}
                      onChange={handleChange}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300  focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="Any additional information..."
                    />
                  </div>

                  {/* Special Requests */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Special Requests</label>
                    <textarea
                      name="specialRequests"
                      value={formData.specialRequests}
                      onChange={handleChange}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300  focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="Any special requests or preferences..."
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Summary Sidebar */}
          <div className="space-y-6">
            <div className="bg-white   border border-gray-200 p-6 sticky top-[4.1rem]">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Booking Summary</h2>

              <div className="space-y-3 mb-4 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Business</span>
                  <span className="text-gray-900 font-medium">{business.name}</span>
                </div>
                {(() => {
                  const selectedServices = JSON.parse(sessionStorage.getItem('selectedServices') || '[]')
                  return (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Services</span>
                      <span className="text-gray-900 font-medium">{selectedServices.length}</span>
                    </div>
                  )
                })()}
                {(() => {
                  const selectedDate = sessionStorage.getItem('selectedDate')
                  const selectedTime = sessionStorage.getItem('selectedTime')
                  return (
                    <>
                      {selectedDate && (
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Date</span>
                          <span className="text-gray-900 font-medium">
                            {new Date(selectedDate).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric'
                            })}
                          </span>
                        </div>
                      )}
                      {selectedTime && (
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Time</span>
                          <span className="text-gray-900 font-medium">
                            {selectedTime.includes('AM') || selectedTime.includes('PM')
                              ? selectedTime
                              : (() => {
                                const [hours, minutes] = selectedTime.split(':')
                                const hour = parseInt(hours)
                                const ampm = hour >= 12 ? 'PM' : 'AM'
                                const hour12 = hour % 12 || 12
                                return `${hour12}:${minutes} ${ampm}`
                              })()}
                          </span>
                        </div>
                      )}
                    </>
                  )
                })()}
              </div>

              <button
                onClick={handleContinue}
                className="w-full mt-6 flex items-center justify-center gap-2 px-6 py-3 bg-primary-600 text-white  hover:bg-primary-700 transition-colors font-medium"
              >
                Continue
                <FaArrowRight />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CustomerInfo
