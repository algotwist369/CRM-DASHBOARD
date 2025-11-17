import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import {
  FaSpinner,
  FaArrowLeft,
  FaArrowRight,
  FaCheckCircle,
  FaClock,
  FaDollarSign
} from 'react-icons/fa'
import { usePageTitle } from '../../../../hooks/usePageTitle'
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
  return symbol ? `${symbol}${Number(value).toLocaleString('en-IN')}` : `${currency} ${Number(value).toLocaleString('en-IN')}`
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
  const [loading, setLoading] = useState(true)
  const [business, setBusiness] = useState(null)
  const [selectedServices, setSelectedServices] = useState([])
  const [selectedOptions, setSelectedOptions] = useState({})
  const [expandedServiceId, setExpandedServiceId] = useState(null)
  const [servicesLoading, setServicesLoading] = useState(false)
  const [error, setError] = useState(null)

  // Update page title
  usePageTitle();

  const fetchBusinessServices = useCallback(async (initialLoad = false) => {
    if (!businessLink) return
    try {
      if (initialLoad) setLoading(true)
      setServicesLoading(true)
      const result = await appointmentService.getBusinessServices(businessLink)
      if (result.success && result.data?.success) {
        const payload = result.data.data
        setBusiness(prev => {
          const nextBusiness = {
            ...(prev || {}),
            ...(payload.business || {}),
            services: payload.services || []
          }
          sessionStorage.setItem('bookingBusiness', JSON.stringify(nextBusiness))
          return nextBusiness
        })
        setError(null)
      } else {
        const message = result.error || result.data?.message || 'Failed to load services'
        if (initialLoad) setError(message)
        toast.error(message)
      }
    } catch (error) {
      console.error('Failed to load business services', error)
      if (initialLoad) setError('Failed to load services')
      toast.error('Failed to load services')
    } finally {
      if (initialLoad) setLoading(false)
      setServicesLoading(false)
    }
  }, [businessLink])

  const loadBusinessData = useCallback(() => {
    const businessData = sessionStorage.getItem('bookingBusiness')
    if (businessData) {
      try {
        const parsed = JSON.parse(businessData)
        setBusiness(parsed)
      } catch (error) {
        console.error('Failed to parse stored business data', error)
        sessionStorage.removeItem('bookingBusiness')
      } finally {
        setLoading(false)
      }
      fetchBusinessServices(false)
    } else {
      fetchBusinessServices(true)
    }
  }, [fetchBusinessServices])

  useEffect(() => {
    loadBusinessData()
  }, [loadBusinessData])

useEffect(() => {
  if (business) {
    console.log('[Booking] Business data loaded:', business)
    console.log('[Booking] Available services:', business.services || [])
  }
}, [business])

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

  useEffect(() => {
    // Load selected services after business data is loaded
    if (business) {
      loadSelectedServices()
    }
  }, [business])

  const loadSelectedServices = () => {
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
  }

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

  const calculateTotal = () => {
    return selectedServices.reduce((total, service) => {
      return total + getServicePrice(service)
    }, 0)
  }

  const calculateTotalDuration = () => {
    return selectedServices.reduce((total, service) => {
      return total + getServiceDuration(service)
    }, 0)
  }

  const handleContinue = () => {
    if (selectedServices.length === 0) {
      toast.error('Please select at least one service')
      return
    }

    sessionStorage.setItem('selectedServices', JSON.stringify(selectedServices))
    navigate(`/book/${businessLink}/staff`) // Go to staff selection page
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
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center max-w-md">
          <p className="text-gray-600 mb-6">{error || 'Business not found'}</p>
          <button
            onClick={handleBack}
            className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }

  const services = business?.services || []

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
          <h1 className="text-3xl font-bold text-gray-900">Select Services</h1>
          <p className="text-gray-600 mt-2">Choose the services you'd like to book</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Services List */}
          <div className="lg:col-span-2">
            {servicesLoading && (
              <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
                <FaSpinner className="animate-spin" />
                Updating services...
              </div>
            )}
            {services.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                <p className="text-gray-600">No services available</p>
              </div>
            ) : (
              <div className="space-y-4">
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
                  const maxPrice = priceValues.length ? Math.max(...priceValues) : 0
                  const currency = selectedOption?.currency || service?.currency || business?.currency || 'INR'
                  const priceSummary = hasOptions
                    ? (minPrice === maxPrice
                      ? formatPrice(minPrice, currency)
                      : `${formatPrice(minPrice, currency)} - ${formatPrice(maxPrice, currency)}`)
                    : 'Price unavailable'
                  const durationValues = options.map(option => option.duration).filter(Boolean)
                  const minDuration = durationValues.length ? Math.min(...durationValues) : null
                  const maxDuration = durationValues.length ? Math.max(...durationValues) : null
                  const durationSummary = durationValues.length
                    ? (minDuration === maxDuration ? `${minDuration} min` : `${minDuration}-${maxDuration} min`)
                    : null

                  return (
                    <div
                      key={serviceId}
                      className={`bg-white rounded-xl border ${isSelected ? 'border-gray-900' : 'border-gray-200'} p-5`}
                    >
                      <button
                        type="button"
                        className="w-full text-left flex items-start justify-between gap-4"
                        onClick={() => setExpandedServiceId(isExpanded ? null : serviceId)}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={`w-4 h-4 rounded-full border mt-1.5 flex items-center justify-center ${isSelected ? 'border-gray-900 bg-gray-900' : 'border-gray-300'
                              }`}
                          >
                            {isSelected && <span className="w-1.5 h-1.5 bg-white rounded-full"></span>}
                          </div>
                          <div>
                            <p className="text-base font-semibold text-gray-900">{getRawServiceName(service)}</p>
                            {service?.category && (
                              <p className="text-xs text-gray-500 mt-0.5">{service.category}</p>
                            )}
                            <div className="flex items-center gap-4 text-sm text-gray-600 mt-2 flex-wrap">
                              {durationSummary && (
                                <span className="flex items-center gap-1">
                                  <FaClock />
                                  {durationSummary}
                                </span>
                              )}
                              <span className="flex items-center gap-1">
                                <FaDollarSign />
                                {priceSummary}
                              </span>
                            </div>
                          </div>
                        </div>
                        <span className="text-sm text-gray-500">
                          {isExpanded ? 'Hide' : 'View options'}
                        </span>
                      </button>

                      {isExpanded && (
                        <div className="mt-4 border-t border-gray-100 pt-4 space-y-2">
                          {hasOptions ? (
                            options.map(option => {
                              const optionSelected = selectedOptionId === option.id && isSelected
                              return (
                                <button
                                  key={option.id}
                                  type="button"
                                  onClick={() => handleOptionChange(service, option.id, true)}
                                  className={`w-full text-left px-4 py-3 rounded-lg border flex items-center justify-between ${optionSelected
                                    ? 'border-gray-900 bg-gray-50 text-gray-900'
                                    : 'border-gray-200 text-gray-700 hover:border-gray-400'
                                    }`}
                                >
                                  <div>
                                    <p className="text-sm font-medium">
                                      {option.label}
                                      {option.name && option.name !== option.label && ` • ${option.name}`}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                      {option.duration ? `${option.duration} min` : 'Custom duration'}
                                    </p>
                                  </div>
                                  <p className="text-sm font-semibold">
                                    {formatPrice(option.price, option.currency)}
                                  </p>
                                </button>
                              )
                            })
                          ) : (
                            <p className="text-sm text-red-600">
                              This service is currently unavailable.
                            </p>
                          )}
                          <div className="flex items-center justify-between pt-2">
                            <button
                              type="button"
                              onClick={() => toggleService(service)}
                              disabled={!hasOptions}
                              className={`text-sm px-4 py-2 rounded-lg border font-medium ${isSelected
                                ? 'border-gray-900 text-gray-900'
                                : 'border-gray-300 text-gray-600'
                                } ${!hasOptions ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                              {isSelected ? 'Remove service' : 'Add service'}
                            </button>
                          </div>
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
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-6">
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
                    {calculateTotalDuration() ? `${calculateTotalDuration()} min` : '--'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Estimated Price</span>
                  <span className="text-gray-900 font-semibold text-lg">
                    {formatPrice(
                      calculateTotal(),
                      business?.currency || selectedServices[0]?.currency || 'INR'
                    )}
                  </span>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4 space-y-3">
                {selectedServices.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-gray-700">Selected Services:</p>
                    {selectedServices.map((service, index) => (
                      <div key={index} className="text-xs text-gray-700 flex items-center gap-2">
                        <FaCheckCircle className="text-gray-500" />
                        {getServiceName(service)}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button
                onClick={handleContinue}
                disabled={selectedServices.length === 0}
                className="w-full mt-6 flex items-center justify-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
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
