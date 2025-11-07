import React, { useState, useEffect } from 'react'
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

const ServiceSelection = () => {
  const navigate = useNavigate()
  const { businessLink } = useParams()
  const [loading, setLoading] = useState(true)
  const [business, setBusiness] = useState(null)
  const [selectedServices, setSelectedServices] = useState([])
  const [error, setError] = useState(null)

  // Update page title
  usePageTitle()

  useEffect(() => {
    loadBusinessData()
    loadSelectedServices()
  }, [businessLink])

  const loadBusinessData = () => {
    const businessData = sessionStorage.getItem('bookingBusiness')
    if (businessData) {
      try {
        const parsed = JSON.parse(businessData)
        setBusiness(parsed)
        setLoading(false)
      } catch (error) {
        setError('Failed to load business data')
        setLoading(false)
      }
    } else {
      // Redirect to business info if no business data
      navigate(`/${businessLink}`)
    }
  }

  const loadSelectedServices = () => {
    const saved = sessionStorage.getItem('selectedServices')
    if (saved) {
      try {
        setSelectedServices(JSON.parse(saved))
      } catch (error) {
        console.error('Failed to load selected services')
      }
    }
  }

  const toggleService = (service) => {
    setSelectedServices(prev => {
      const serviceId = typeof service === 'object' ? service.id || service._id || service.name : service
      const isSelected = prev.some(s => {
        const sId = typeof s === 'object' ? s.id || s._id || s.name : s
        return sId === serviceId
      })

      let updated
      if (isSelected) {
        updated = prev.filter(s => {
          const sId = typeof s === 'object' ? s.id || s._id || s.name : s
          return sId !== serviceId
        })
      } else {
        updated = [...prev, service]
      }

      sessionStorage.setItem('selectedServices', JSON.stringify(updated))
      return updated
    })
  }

  const isServiceSelected = (service) => {
    const serviceId = typeof service === 'object' ? service.id || service._id || service.name : service
    return selectedServices.some(s => {
      const sId = typeof s === 'object' ? s.id || s._id || s.name : s
      return sId === serviceId
    })
  }

  const getServiceName = (service) => {
    if (typeof service === 'object') {
      return service.name || service.serviceName || service.title || 'Service'
    }
    return service
  }

  const getServicePrice = (service) => {
    if (typeof service === 'object') {
      return service.price || service.cost || 0
    }
    return 0
  }

  const getServiceDuration = (service) => {
    if (typeof service === 'object') {
      return service.duration || service.time || 60
    }
    return 60
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
          <FaSpinner className="animate-spin mx-auto text-primary-600 text-4xl mb-4" />
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
            className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }

  const services = business.services || []

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
            {services.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                <p className="text-gray-600">No services available</p>
              </div>
            ) : (
              <div className="space-y-4">
                {services.map((service, index) => {
                  const isSelected = isServiceSelected(service)
                  const serviceName = getServiceName(service)
                  const servicePrice = getServicePrice(service)
                  const serviceDuration = getServiceDuration(service)

                  return (
                    <div
                      key={index}
                      onClick={() => toggleService(service)}
                      className={`bg-white rounded-xl shadow-sm border-2 p-6 cursor-pointer transition-all ${
                        isSelected
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-gray-200 hover:border-primary-300 hover:shadow-md'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4 flex-1">
                          <div
                            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mt-1 flex-shrink-0 ${
                              isSelected
                                ? 'border-primary-600 bg-primary-600'
                                : 'border-gray-300'
                            }`}
                          >
                            {isSelected && <FaCheckCircle className="text-white text-xs" />}
                          </div>
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                              {serviceName}
                            </h3>
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              {serviceDuration > 0 && (
                                <div className="flex items-center gap-1">
                                  <FaClock />
                                  <span>{serviceDuration} min</span>
                                </div>
                              )}
                              {servicePrice > 0 && (
                                <div className="flex items-center gap-1">
                                  <FaDollarSign />
                                  <span className="font-semibold">
                                    ₹{servicePrice.toLocaleString()}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
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
                  <span className="text-gray-900 font-medium">{calculateTotalDuration()} min</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Estimated Price</span>
                  <span className="text-gray-900 font-semibold text-lg">
                    ₹{calculateTotal().toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4 space-y-3">
                {selectedServices.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-gray-700">Selected Services:</p>
                    {selectedServices.map((service, index) => (
                      <div key={index} className="text-xs text-gray-600 flex items-center gap-2">
                        <FaCheckCircle className="text-green-600" />
                        {getServiceName(service)}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button
                onClick={handleContinue}
                disabled={selectedServices.length === 0}
                className="w-full mt-6 flex items-center justify-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
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
