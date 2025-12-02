import React, { useState, useEffect, useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import {
  FaSpinner,
  FaArrowLeft,
  FaArrowRight,
  FaUser,
  FaUserTie
} from 'react-icons/fa'
import { FiCheck } from 'react-icons/fi'
import { usePageTitle } from '../../../../hooks/usePageTitle'

const currencySymbols = {
  INR: '₹',
  USD: '$',
  EUR: '€',
  GBP: '£',
  AED: 'د.إ'
}

const formatPrice = (value = 0, currency = 'INR') => {
  if (value === undefined || value === null) return '--'
  const symbol = currencySymbols[currency] || ''
  return symbol
    ? `${symbol}${Number(value).toLocaleString('en-IN')}`
    : `${currency} ${Number(value).toLocaleString('en-IN')}`
}

const formatDuration = (minutes) => {
  if (!minutes) return null
  if (minutes < 60) return `${minutes} min`
  const hrs = Math.floor(minutes / 60)
  const mins = minutes % 60
  if (!mins) return `${hrs} hr${hrs > 1 ? 's' : ''}`
  return `${hrs} hr${hrs > 1 ? 's' : ''} ${mins} min`
}

const StaffSelection = () => {
  const navigate = useNavigate()
  const { businessLink } = useParams()
  const [business, setBusiness] = useState(null)
  const [selectedStaff, setSelectedStaff] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedServices, setSelectedServices] = useState([])
  const [customerInfo, setCustomerInfo] = useState(null)
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')

  // Update page title
  usePageTitle()

  useEffect(() => {
    const businessData = sessionStorage.getItem('bookingBusiness')
    const savedStaff = sessionStorage.getItem('selectedStaff')
    const savedServices = sessionStorage.getItem('selectedServices')
    const savedCustomer = sessionStorage.getItem('customerInfo')
    const savedDate = sessionStorage.getItem('selectedDate')
    const savedTime = sessionStorage.getItem('selectedTime')

    if (!businessData) {
      toast.error('Business information missing. Please start again.')
      navigate(`/${businessLink}`)
      return
    }

    try {
      setBusiness(JSON.parse(businessData))
    } catch {
      toast.error('Failed to read business info. Please try again.')
      navigate(`/${businessLink}`)
      return
    } finally {
      setLoading(false)
    }

    if (savedStaff) {
      try {
        setSelectedStaff(JSON.parse(savedStaff))
      } catch {
        sessionStorage.removeItem('selectedStaff')
      }
    }

    if (savedServices) {
      try {
        const parsed = JSON.parse(savedServices)
        setSelectedServices(Array.isArray(parsed) ? parsed : [])
      } catch {
        sessionStorage.removeItem('selectedServices')
      }
    }

    if (savedCustomer) {
      try {
        setCustomerInfo(JSON.parse(savedCustomer))
      } catch {
        sessionStorage.removeItem('customerInfo')
      }
    }

    if (savedDate) setSelectedDate(savedDate)
    if (savedTime) setSelectedTime(savedTime)
  }, [businessLink, navigate])

  const selectStaff = (staff) => {
    setSelectedStaff(staff)
    sessionStorage.setItem('selectedStaff', JSON.stringify(staff))
  }

  const handleContinue = () => {
    // Staff can be null (any available) or an object
    // Ensure data is saved before navigation
    if (selectedStaff) {
      sessionStorage.setItem('selectedStaff', JSON.stringify(selectedStaff))
    } else {
      sessionStorage.setItem('selectedStaff', JSON.stringify(null))
    }
    navigate(`/book/${businessLink}/time`) // Go to time selection page
  }

  const handleBack = () => {
    navigate(`/book/${businessLink}/services`) // Go back to service selection page
  }

  const handleAnyAvailable = () => {
    setSelectedStaff(null)
    // Save null explicitly to indicate "any available" was selected
    sessionStorage.setItem('selectedStaff', JSON.stringify(null))
    navigate(`/book/${businessLink}/time`) // Go to time selection page
  }

  const staffList = useMemo(() => business?.staff || [], [business])
  const getStaffId = (staff) => staff?._id || staff?.id || staff?.staffId || staff?.email || staff?.name || ''
  const selectedServiceDetails = useMemo(() => {
    return selectedServices.map((item, index) => {
      const serviceName = item?.serviceName || item?.name || item?.label || `Service ${index + 1}`
      const optionLabel = item?.optionLabel || item?.pricingOptionLabel || null
      const duration = Number(item?.duration) || 0
      const price = item?.price
      const currency = item?.currency || business?.currency || 'INR'
      return {
        id: `${item?.serviceId || serviceName}-${item?.optionId || index}`,
        name: serviceName,
        optionLabel,
        durationLabel: formatDuration(duration),
        priceLabel: price !== undefined && price !== null ? formatPrice(price, currency) : null
      }
    })
  }, [selectedServices, business?.currency])

  const totals = useMemo(() => {
    const totalPrice = selectedServices.reduce((sum, item) => sum + (Number(item?.price) || 0), 0)
    const totalDuration = selectedServices.reduce((sum, item) => sum + (Number(item?.duration) || 0), 0)
    return {
      priceLabel: selectedServices.length ? formatPrice(totalPrice, selectedServices[0]?.currency || business?.currency || 'INR') : null,
      durationLabel: formatDuration(totalDuration)
    }
  }, [selectedServices, business?.currency])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="text-center">
          <FaSpinner className="animate-spin mx-auto text-primary-600 text-4xl mb-4" />
          <p className="text-gray-600">Loading staff...</p>
        </div>
      </div>
    )
  }

  if (!business) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="    border border-gray-200 p-8 text-center max-w-md">
          <p className="text-gray-600 mb-6">Business not found</p>
          <button
            onClick={handleBack}
            className="px-6 py-2 bg-primary-600 text-white  hover:bg-primary-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center sm:text-left space-y-3">
          <button
            onClick={handleBack}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <FaArrowLeft />
            Back
          </button>
          <div>
            <h1 className="text-3xl font-semibold text-gray-900">Select a Staff Member</h1>
            <p className="text-gray-600">
              Choose the person you prefer or let our team assign the best available professional. Clean cards keep the
              focus on key details.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Staff List */}
          <div className="lg:col-span-2 space-y-4">
            {/* Any Available Option */}
            <button
              type="button"
              onClick={handleAnyAvailable}
              className={`w-full  border p-5 text-left transition ${
                !selectedStaff ? 'border-gray-900 bg-gray-50 ' : '  border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-9 h-9 rounded-full border flex items-center justify-center ${
                    !selectedStaff ? 'border-gray-900 bg-gray-900 text-white' : 'border-gray-200 text-gray-500'
                  }`}
                >
                  {!selectedStaff ? <FiCheck /> : <FaUser />}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Any Available Staff</h3>
                  <p className="text-sm text-gray-600">We’ll assign the best available team member for you</p>
                </div>
              </div>
            </button>

            {/* Staff Members */}
            {staffList.length === 0 ? (
              <div className="    border border-gray-200 p-12 text-center">
                <FaUserTie className="mx-auto text-gray-400 text-4xl mb-4" />
                <p className="text-gray-600">No staff members available</p>
              </div>
            ) : (
              staffList.map((staff, index) => {
                const staffId = getStaffId(staff)
                const isSelected = getStaffId(selectedStaff) === staffId

                return (
                  <button
                    type="button"
                    key={staffId || index}
                    onClick={() => selectStaff(staff)}
                    className={`w-full  border p-5 text-left transition ${
                      isSelected ? 'border-gray-900 bg-gray-50 ' : '  border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-9 h-9 rounded-full border flex items-center justify-center ${
                            isSelected ? 'border-gray-900 bg-gray-900 text-white' : 'border-gray-200 text-gray-500'
                          }`}
                        >
                          {isSelected ? <FiCheck /> : <FaUser />}
                        </div>
                        <div>
                          <p className="text-xs uppercase tracking-wide text-gray-500">
                            {staff.role || staff.department || 'Team member'}
                          </p>
                          <h3 className="text-lg font-semibold text-gray-900">{staff.name}</h3>
                          {staff.specialization && (
                            <p className="text-sm text-gray-600">Specializes in {staff.specialization}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <div
                          className={`w-14 h-14 rounded-full flex items-center justify-center ${
                            isSelected ? 'bg-gray-900 text-white' : 'bg-gray-100'
                          }`}
                        >
                          <FaUserTie className="text-lg" />
                        </div>
                      </div>
                    </div>
                  </button>
                )
              })
            )}
          </div>

          {/* Summary Sidebar */}
          <div className="space-y-6">
            <div className="   border border-gray-200 p-6 lg:sticky lg:top-[4rem]">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Booking Summary</h2>
              
              <div className="space-y-4 mb-4 text-sm text-gray-700">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Business</span>
                  <span className="text-gray-900 font-medium">{business.name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Staff</span>
                  <span className="text-gray-900 font-medium">
                    {selectedStaff ? selectedStaff.name : 'Any Available'}
                  </span>
                </div>
                {customerInfo && (
                  <div className="space-y-1">
                    <p className="text-xs uppercase tracking-wide text-gray-500">Contact</p>
                    <p className="text-gray-900 font-medium">{customerInfo.name}</p>
                    {customerInfo.phone && <p>{customerInfo.phone}</p>}
                    {customerInfo.email && <p className="text-gray-500">{customerInfo.email}</p>}
                  </div>
                )}
                {(selectedDate || selectedTime) && (
                  <div className="space-y-1">
                    <p className="text-xs uppercase tracking-wide text-gray-500">Appointment</p>
                    {selectedDate && (
                      <p>
                        Date:{' '}
                        <span className="text-gray-900 font-medium">
                          {new Date(selectedDate).toLocaleDateString()}
                        </span>
                      </p>
                    )}
                    {selectedTime && (
                      <p>
                        Time:{' '}
                        <span className="text-gray-900 font-medium">{selectedTime}</span>
                      </p>
                    )}
                  </div>
                )}
                <div>
                  <p className="text-xs uppercase tracking-wide text-gray-500 mb-2">Services</p>
                  {selectedServiceDetails.length ? (
                    <div className="space-y-3">
                      {selectedServiceDetails.map((service) => (
                        <div key={service.id} className="flex items-start justify-between text-sm text-gray-900">
                          <div>
                            <p className="font-medium text-gray-900">{service.name}</p>
                            {service.optionLabel && <p className="text-gray-500">{service.optionLabel}</p>}
                            {service.durationLabel && <p className="text-gray-500">{service.durationLabel}</p>}
                          </div>
                          {service.priceLabel && <p className="font-semibold text-gray-900">{service.priceLabel}</p>}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">No services selected</p>
                  )}
                </div>

                {(totals.durationLabel || totals.priceLabel) && (
                  <div className="flex items-center justify-between text-sm font-semibold text-gray-900 border-t border-gray-100 pt-3">
                    <span>Total</span>
                    <div className="text-right">
                      {totals.durationLabel && <p>{totals.durationLabel}</p>}
                      {totals.priceLabel && <p>{totals.priceLabel}</p>}
                    </div>
                  </div>
                )}
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

export default StaffSelection
