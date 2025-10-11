import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Card, Button, Badge, Alert } from '../../../../components'
import appointmentService from '../../../../services/appointment/appointmentService'
import { toast } from 'react-hot-toast'

const ServiceSelection = () => {
  const navigate = useNavigate()
  const { businessLink } = useParams()
  const [loading, setLoading] = useState(true)
  const [services, setServices] = useState([])
  const [selectedService, setSelectedService] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (businessLink) {
      fetchServices()
    }
  }, [businessLink])

  const fetchServices = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const result = await appointmentService.getBusinessInfo(businessLink)
      
      if (result.success) {
        setServices(result.data.services || [])
        toast.success('Services loaded successfully!')
      } else {
        setError(result.error || 'Failed to load services')
        toast.error(result.error || 'Failed to load services')
      }
    } catch (error) {
      console.error('Error fetching services:', error)
      setError('An unexpected error occurred')
      toast.error('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }
      
      ]
      
    } catch (error) {
      console.error('Error fetching services:', error)
      setError('Failed to load services')
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const handleServiceSelect = (service) => {
    setSelectedService(service)
  }

  const handleContinue = () => {
    if (selectedService) {
      // Store selected service in session/local storage or context
      sessionStorage.setItem('selectedService', JSON.stringify(selectedService))
      navigate('/booking/staff-selection')
    }
  }

  const handleBack = () => {
    navigate('/booking/business-info')
  }

  const getCategoryColor = (category) => {
    switch (category) {
      case 'Cutting': return 'blue'
      case 'Coloring': return 'purple'
      case 'Grooming': return 'green'
      case 'Treatment': return 'yellow'
      case 'Special': return 'pink'
      default: return 'gray'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading services...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Alert
            type="error"
            title="Error"
            message={error}
          />
          <Button variant="primary" className="mt-4" onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Select Your Service</h1>
          <p className="text-lg text-gray-600">Choose from our range of professional hair services</p>
        </div>

        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-center">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">1</span>
              </div>
              <div className="w-16 h-1 bg-primary-600"></div>
              <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">2</span>
              </div>
              <div className="w-16 h-1 bg-gray-300"></div>
              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                <span className="text-gray-500 text-sm font-medium">3</span>
              </div>
              <div className="w-16 h-1 bg-gray-300"></div>
              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                <span className="text-gray-500 text-sm font-medium">4</span>
              </div>
              <div className="w-16 h-1 bg-gray-300"></div>
              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                <span className="text-gray-500 text-sm font-medium">5</span>
              </div>
            </div>
          </div>
          <div className="flex justify-center mt-2">
            <span className="text-sm text-gray-500">Service Selection</span>
          </div>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {services.map((service) => (
            <Card
              key={service.id}
              className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                selectedService?.id === service.id
                  ? 'ring-2 ring-primary-500 bg-primary-50'
                  : 'hover:shadow-md'
              }`}
              onClick={() => handleServiceSelect(service)}
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{service.name}</h3>
                      {service.popular && (
                        <Badge variant="warning" size="sm">Popular</Badge>
                      )}
                    </div>
                    <Badge variant={getCategoryColor(service.category)} size="sm">
                      {service.category}
                    </Badge>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gray-900">{formatCurrency(service.price)}</p>
                    <p className="text-sm text-gray-500">{service.duration} min</p>
                  </div>
                </div>

                <p className="text-gray-600 mb-4">{service.description}</p>

                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Includes:</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {service.includes.map((item, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <svg className="w-3 h-3 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                {service.addOns && service.addOns.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Add-ons Available:</h4>
                    <div className="space-y-1">
                      {service.addOns.slice(0, 2).map((addOn, index) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span className="text-gray-600">{addOn.name}</span>
                          <span className="text-gray-900">+{formatCurrency(addOn.price)}</span>
                        </div>
                      ))}
                      {service.addOns.length > 2 && (
                        <p className="text-xs text-gray-500">+{service.addOns.length - 2} more add-ons</p>
                      )}
                    </div>
                  </div>
                )}

                {selectedService?.id === service.id && (
                  <div className="mt-4 p-3 bg-primary-100 rounded-lg">
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-sm font-medium text-primary-800">Selected</span>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={handleBack}>
            ← Back
          </Button>
          <Button
            variant="primary"
            onClick={handleContinue}
            disabled={!selectedService}
          >
            Continue to Staff Selection →
          </Button>
        </div>

        {/* Selected Service Summary */}
        {selectedService && (
          <div className="mt-8">
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Selected Service</h3>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">{selectedService.name}</h4>
                    <p className="text-sm text-gray-600">{selectedService.description}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-gray-900">{formatCurrency(selectedService.price)}</p>
                    <p className="text-sm text-gray-500">{selectedService.duration} minutes</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}

export default ServiceSelection
