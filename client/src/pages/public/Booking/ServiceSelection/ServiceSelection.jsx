import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { useQuery } from '@tanstack/react-query'
import {
  FaSpinner,
  FaArrowLeft,
  FaArrowRight,
  FaCheckCircle,
  FaChevronDown
} from 'react-icons/fa'
import { FiCheck } from 'react-icons/fi'
import { usePageTitle } from '../../../../hooks/usePageTitle'
import { useLeadTracking } from '../../../../hooks/useLeadTracking';
import appointmentService from '../../../../services/public/appointmentService'

const currencySymbols = {
  INR: '₹',
  USD: '$',
  EUR: '€',
  GBP: '£',
  AED: 'د.إ'
}

const formatPrice = (value = 0, currency = 'INR') => {
  if (!value && value !== 0) return '--'
  const symbol = currencySymbols[currency] || ''
  const roundedValue = Math.round(Number(value))
  return symbol ? `${symbol}${roundedValue.toLocaleString('en-IN')}` : `${currency} ${roundedValue.toLocaleString('en-IN')}`
}

const getServiceId = (service) => {
  if (!service) return null
  return service._id || service.id || service.serviceId || service.name || service.title || null
}

const getRawServiceName = (service) => {
  if (!service) return 'Service'
  return service.name || service.serviceName || service.title || 'Service'
}

const getServiceOptions = (service) => {
  if (!service) return []
  const currency = service.currency || 'INR'
  const pricingOptions = Array.isArray(service.pricingOptions) ? service.pricingOptions : []

  if (pricingOptions.length > 0) {
    return pricingOptions
      .filter(option => option && option.isActive !== false)
      .map(option => ({
        id: option._id || `${option.duration || 0}-${option.price || 0}`,
        label: option.name || (option.duration ? `${option.duration} min` : 'Option'),
        price: Number(option.price) || 0,
        duration: Number(option.duration) || 0,
        currency,
        name: option.name || null
      }))
  }

  const price = Number(service.price) || 0
  const duration = Number(service.duration) || 0

  return [{
    id: `${getServiceId(service)}-default`,
    label: duration ? `${duration} min` : 'Standard',
    price,
    duration,
    currency,
    name: 'Standard'
  }]
}

const buildSelectionPayload = (service, option) => {
  if (!service || !option) return null
  const identifier = getServiceId(service)
  return {
    serviceId: identifier,
    _id: service._id || service.id || service.serviceId || undefined,
    id: service._id || service.id || service.serviceId || undefined,
    name: getRawServiceName(service),
    serviceName: getRawServiceName(service),
    optionId: option.id,
    optionLabel: option.name || option.label,
    price: option.price,
    duration: option.duration,
    currency: option.currency,
    pricingOptionId: option.id
  }
}

const ServiceSelection = () => {
  const navigate = useNavigate()
  const { businessLink } = useParams()

  // Fetch business services using React Query
  const {
    data: business,
    isLoading: loading,
    isFetching: servicesLoading,
    error: queryError
  } = useQuery({
    queryKey: ['businessServices', businessLink],
    queryFn: async () => {
      if (!businessLink) throw new Error('Invalid business link')

      const result = await appointmentService.getBusinessServices(businessLink)
      if (result.success && result.data?.success) {
        const payload = result.data.data

        // Merge with existing data if possible
        const currentStored = sessionStorage.getItem('bookingBusiness')
        const prev = currentStored ? JSON.parse(currentStored) : {}

        const nextBusiness = {
          ...prev,
          ...(payload.business || {}),
          services: payload.services || []
        }

        sessionStorage.setItem('bookingBusiness', JSON.stringify(nextBusiness))
        return nextBusiness
      } else {
        throw new Error(result.error || result.data?.message || 'Failed to load services')
      }
    },
    enabled: !!businessLink,
    initialData: () => {
      const stored = sessionStorage.getItem('bookingBusiness')
      return stored ? JSON.parse(stored) : undefined
    },
    staleTime: 5 * 60 * 1000 // 5 minutes
  })

  // Local State
  const [selectedServices, setSelectedServices] = useState([])
  const [selectedOptions, setSelectedOptions] = useState({})
  const [expandedServiceId, setExpandedServiceId] = useState(null)
  const [customerInfo, setCustomerInfo] = useState(null)
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [selectedStaffSummary, setSelectedStaffSummary] = useState(null)

  // Derived error
  const error = queryError?.message || null

  const services = useMemo(() => business?.services || [], [business])

  // Update page title
  usePageTitle();

  // Track page view
  useLeadTracking(business?._id, !!business);

  useEffect(() => {
    window.scrollTo(0, 0)

    // Restore other booking state
    const storedCustomer = sessionStorage.getItem('customerInfo')
    const storedDate = sessionStorage.getItem('selectedDate')
    const storedTime = sessionStorage.getItem('selectedTime')
    const storedStaff = sessionStorage.getItem('selectedStaff')

    if (storedCustomer) {
      try {
        setCustomerInfo(JSON.parse(storedCustomer))
      } catch {
        sessionStorage.removeItem('customerInfo')
      }
    }

    if (storedDate) setSelectedDate(storedDate)
    if (storedTime) setSelectedTime(storedTime)

    if (storedStaff) {
      try {
        const parsedStaff = JSON.parse(storedStaff)
        setSelectedStaffSummary({
          name: parsedStaff.name,
          title: parsedStaff.title,
          avatar: parsedStaff.avatar
        })
      } catch {
        sessionStorage.removeItem('selectedStaff')
      }
    }
  }, [])

  useEffect(() => {
    if (error) toast.error(error)
  }, [error])

  useEffect(() => {

    if (!business?.services) return
    setSelectedOptions(prev => {
      const next = { ...prev }
      business.services.forEach(service => {
        const serviceId = getServiceId(service)
        if (!serviceId) return
        if (!next[serviceId]) {
          const options = getServiceOptions(service)
          if (options.length > 0) {
            next[serviceId] = options[0].id
          }
        }
      })
      return next
    })
  }, [business])

  const loadSelectedServices = useCallback(() => {
    const saved = sessionStorage.getItem('selectedServices')
    if (!saved) {
      setSelectedServices([])
      return
    }

    try {
      const parsedData = JSON.parse(saved)
      const parsed = Array.isArray(parsedData) ? parsedData : []
      if (!business?.services) {
        setSelectedServices(parsed)
        return
      }

      const restoredSelections = parsed
        .map(savedService => {
          const savedId = typeof savedService === 'object'
            ? savedService.serviceId || savedService.id || savedService._id || savedService.name
            : savedService
          const service = business.services.find(item => getServiceId(item) === savedId)
          if (!service) return null
          const options = getServiceOptions(service)
          if (!options.length) return null
          const savedOptionId = typeof savedService === 'object' ? (savedService.optionId || savedService.pricingOptionId) : null
          const option = options.find(opt => opt.id === savedOptionId) || options[0]
          return buildSelectionPayload(service, option)
        })
        .filter(Boolean)

      setSelectedServices(restoredSelections)
      if (restoredSelections.length) {
        setSelectedOptions(prev => {
          const next = { ...prev }
          restoredSelections.forEach(selection => {
            next[selection.serviceId] = selection.optionId
          })
          return next
        })
      }
      sessionStorage.setItem('selectedServices', JSON.stringify(restoredSelections))
    } catch (error) {
      console.error('Failed to load selected services', error)
      sessionStorage.removeItem('selectedServices')
      setSelectedServices([])
    }
  }, [business])

  useEffect(() => {
    if (business) {
      loadSelectedServices()
    }
  }, [business, loadSelectedServices])

  const toggleService = (service) => {
    const serviceId = getServiceId(service)
    const options = getServiceOptions(service)
    if (!serviceId || !options.length) {
      toast.error('Service not available')
      return
    }

    const optionId = selectedOptions[serviceId] || options[0].id
    const option = options.find(opt => opt.id === optionId) || options[0]
    const selectionPayload = buildSelectionPayload(service, option)

    if (!selectionPayload) {
      toast.error('Unable to select service right now')
      return
    }

    setSelectedServices(prev => {
      const exists = prev.some(item => item.serviceId === serviceId)
      const updated = exists
        ? prev.filter(item => item.serviceId !== serviceId)
        : [...prev, selectionPayload]

      sessionStorage.setItem('selectedServices', JSON.stringify(updated))
      return updated
    })
  }

  const handleOptionChange = (service, optionId, autoSelect = false) => {
    const serviceId = getServiceId(service)
    setSelectedOptions(prev => ({ ...prev, [serviceId]: optionId }))

    setSelectedServices(prev => {
      const exists = prev.some(item => item.serviceId === serviceId)
      const options = getServiceOptions(service)
      const option = options.find(opt => opt.id === optionId) || options[0]
      const updatedSelection = buildSelectionPayload(service, option)
      if (!updatedSelection) return prev

      let updated
      if (exists) {
        updated = prev.map(item => item.serviceId === serviceId ? updatedSelection : item)
      } else if (autoSelect) {
        updated = [...prev, updatedSelection]
      } else {
        return prev
      }

      sessionStorage.setItem('selectedServices', JSON.stringify(updated))
      return updated
    })
  }

  const isServiceSelected = (service) => {
    const serviceId = getServiceId(service)
    return selectedServices.some(item => item.serviceId === serviceId)
  }

  const getServiceName = (service) => {
    if (!service) return 'Service'
    if (service.serviceName) {
      return service.optionLabel ? `${service.serviceName} • ${service.optionLabel}` : service.serviceName
    }
    if (typeof service === 'object') {
      return getRawServiceName(service)
    }
    return service
  }

  const getServicePrice = (service) => {
    if (!service) return 0
    if (typeof service === 'object' && typeof service.price === 'number') {
      return Number(service.price) || 0
    }
    if (typeof service === 'object') {
      return Number(service.price || service.cost || 0) || 0
    }
    return Number(service) || 0
  }

  const getServiceDuration = (service) => {
    if (!service) return 0
    if (typeof service === 'object' && typeof service.duration === 'number') {
      return Number(service.duration) || 0
    }
    if (typeof service === 'object') {
      return Number(service.duration || service.time || 0) || 0
    }
    return Number(service) || 0
  }

  const totalPrice = useMemo(
    () => selectedServices.reduce((total, service) => total + getServicePrice(service), 0),
    [selectedServices]
  )

  const totalDuration = useMemo(
    () => selectedServices.reduce((total, service) => total + getServiceDuration(service), 0),
    [selectedServices]
  )

  const serviceCount = services.length

  const handleContinue = () => {
    if (selectedServices.length === 0) {
      toast.error('Please select at least one service')
      return
    }

    sessionStorage.setItem('selectedServices', JSON.stringify(selectedServices))
    // Automatically select "any available staff" and skip staff selection page
    sessionStorage.setItem('selectedStaff', JSON.stringify(null))
    navigate(`/book/${businessLink}/time`) // Go directly to time selection page
  }

  const handleBack = () => {
    navigate(`/${businessLink}`) // Go back to business info page
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="text-center">
          <FaSpinner className="animate-spin mx-auto text-gray-900 text-4xl mb-4" />
          <p className="text-gray-600">Loading services...</p>
        </div>
      </div>
    )
  }

  if (error || !business) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white   border border-gray-200 p-8 text-center max-w-md">
          <p className="text-gray-600 mb-6">{error || 'Business not found'}</p>
          <button
            onClick={handleBack}
            className="px-6 py-2 bg-gray-900 text-white  hover:bg-gray-800 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-gray-600"
          >
            <FaArrowLeft />
            <span>Back</span>
          </button>
          <div className="text-right">
            <h1 className="text-xl font-bold text-gray-900">Select Services</h1>
            <p className="text-sm text-gray-500">{business.name}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Services List */}
          <div className="lg:col-span-2 space-y-2">
            {servicesLoading && (
              <div className="bg-white rounded-lg p-3 border border-gray-200 flex items-center gap-2 text-sm text-gray-500">
                <FaSpinner className="animate-spin" />
                <span>Loading services...</span>
              </div>
            )}

            {services.length === 0 ? (
              <div className="bg-white rounded-lg p-12 text-center border border-gray-200">
                <p className="text-gray-500">This business has not published any bookable services yet.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {services.map((service, index) => {
                  const serviceId = getServiceId(service) || `service-${index}`
                  const options = getServiceOptions(service)
                  const hasOptions = options.length > 0
                  const selectedOptionId = selectedOptions[serviceId] || options[0]?.id
                  const selectedOption = options.find(option => option.id === selectedOptionId) || options[0]
                  const isSelected = isServiceSelected(service)
                  const isExpanded = expandedServiceId === serviceId
                  const priceValues = options.map(option => option.price)
                  const minPrice = priceValues.length ? Math.min(...priceValues) : 0
                  const currency = selectedOption?.currency || service?.currency || business?.currency || 'INR'
                  // Backend price is already after 40% discount, calculate original price
                  const originalMinPrice = minPrice / 0.6
                  const startingPrice = hasOptions ? formatPrice(minPrice, currency) : 'Price unavailable'
                  const actualStartingPrice = hasOptions ? formatPrice(originalMinPrice, currency) : 'Price unavailable'

                  return (
                    <div
                      key={serviceId}
                      className={`bg-white rounded-lg border ${isSelected ? 'border-gray-300' : 'border-gray-200'
                        }`}
                    >
                      {/* Service Card Header - Clickable */}
                      <div
                        onClick={() => setExpandedServiceId(isExpanded ? null : serviceId)}
                        className="w-full p-4 flex items-center justify-between cursor-pointer"
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            setExpandedServiceId(isExpanded ? null : serviceId)
                          }
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              toggleService(service)
                            }}
                            disabled={!hasOptions}
                            className={`w-6 h-6 rounded border flex items-center justify-center flex-shrink-0 ${isSelected
                              ? 'border-gray-500 bg-gray-900 text-white'
                              : 'border-gray-300'
                              } ${!hasOptions ? 'opacity-40 cursor-not-allowed' : ''}`}
                          >
                            {isSelected && <FiCheck className="text-xs" />}
                          </button>
                          <span className="text-base font-medium text-gray-900 text-left">
                            {getRawServiceName(service)}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <p className="text-xs text-green-500 font-medium mb-1">Starting at</p>
                            <div className="flex items-center gap-2 justify-end mb-1">
                              <span className="text-sm text-gray-500 line-through">
                                {actualStartingPrice}
                              </span>
                              <span className="text-base font-semibold text-gray-900">
                                {startingPrice}
                              </span>
                            </div>
                            <p className="text-xs text-red-500 font-medium">40% OFF</p>
                          </div>
                          <FaChevronDown
                            className={`text-gray-400 flex-shrink-0 ${isExpanded ? 'rotate-180' : ''}`}
                          />
                        </div>
                      </div>

                      {/* Dropdown Options */}
                      {isExpanded && hasOptions && (
                        <div className="border-t border-gray-100 p-4 space-y-2">
                          {options.map(option => {
                            const optionSelected = selectedOptionId === option.id && isSelected
                            return (
                              <button
                                key={option.id}
                                type="button"
                                onClick={() => handleOptionChange(service, option.id, true)}
                                className={`w-full p-3 rounded border text-left ${optionSelected
                                  ? 'border-gray-900 bg-gray-50'
                                  : 'border-gray-200 bg-white'
                                  }`}
                              >
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="text-sm font-medium text-gray-900">
                                      {option.label || option.name || 'Option'}
                                    </p>
                                    {option.duration && (
                                      <p className="text-xs text-gray-500 mt-1">
                                        {option.duration} min
                                      </p>
                                    )}
                                  </div>
                                  <div className="text-right">
                                    <div className="flex items-center gap-2">
                                      <span className="text-sm text-gray-500 line-through">
                                        {formatPrice(option.price / 0.6, option.currency)}
                                      </span>
                                      <span className="text-sm font-semibold text-gray-900">
                                        {formatPrice(option.price, option.currency)}
                                      </span>
                                    </div>
                                    <p className="text-xs text-red-500 font-medium mt-0.5">40% OFF</p>
                                  </div>
                                </div>
                              </button>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Summary Sidebar */}
          <div className="space-y-6">
            <div className="bg-white   border border-gray-200 p-6 lg:sticky lg:top-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Booking Summary</h2>

              <div className="space-y-3 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Business</span>
                  <span className="text-gray-900 font-medium">{business.name}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Services Selected</span>
                  <span className="text-gray-900 font-medium">{selectedServices.length}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Estimated Duration</span>
                  <span className="text-gray-900 font-medium">
                    {totalDuration ? `${totalDuration} min` : '--'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Estimated Price</span>
                  <span className="text-gray-900 font-semibold text-lg">
                    {formatPrice(
                      totalPrice,
                      business?.currency || selectedServices[0]?.currency || 'INR'
                    )}
                  </span>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4 space-y-4 text-sm text-gray-700">
                {customerInfo && (
                  <div className="space-y-1">
                    <p className="text-xs uppercase tracking-wide text-gray-500">Contact</p>
                    <p className="font-medium text-gray-900">{customerInfo.name}</p>
                    {customerInfo.phone && <p>{customerInfo.phone}</p>}
                    {customerInfo.email && <p className="text-gray-500">{customerInfo.email}</p>}
                  </div>
                )}

                {(selectedDate || selectedTime || selectedStaffSummary) && (
                  <div className="space-y-2">
                    <p className="text-xs uppercase tracking-wide text-gray-500">Appointment</p>
                    {selectedDate && (
                      <div className="flex items-center justify-between">
                        <span>Date</span>
                        <span className="font-medium text-gray-900">
                          {new Date(selectedDate).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                    {selectedTime && (
                      <div className="flex items-center justify-between">
                        <span>Time</span>
                        <span className="font-medium text-gray-900">{selectedTime}</span>
                      </div>
                    )}
                    {selectedStaffSummary && (
                      <div className="flex items-center justify-between">
                        <span>Staff</span>
                        <span className="flex items-center gap-2 font-medium text-gray-900">
                          {selectedStaffSummary.avatar ? (
                            <img
                              src={selectedStaffSummary.avatar}
                              alt={selectedStaffSummary.name}
                              className="w-6 h-6 rounded-full object-cover"
                            />
                          ) : (
                            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 text-gray-600">
                              <FiCheck />
                            </span>
                          )}
                          {selectedStaffSummary.name}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                <div className="space-y-2">
                  <p className="text-xs font-medium text-gray-700">Selected Services:</p>
                  {selectedServices.length === 0 ? (
                    <p className="text-xs text-gray-500">No services selected yet.</p>
                  ) : (
                    selectedServices.map((service, index) => (
                      <div key={index} className="text-xs text-gray-700 flex items-center gap-2">
                        <FaCheckCircle className="text-gray-500" />
                        {getServiceName(service)}
                      </div>
                    ))
                  )}
                </div>
              </div>

              <button
                onClick={handleContinue}
                disabled={selectedServices.length === 0}
                className="w-full mt-6 flex items-center justify-center gap-2 px-6 py-3 bg-primary-600 text-white  hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
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

export default ServiceSelection
