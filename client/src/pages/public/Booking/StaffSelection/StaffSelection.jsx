import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Card, Button, Badge, Alert } from '../../../../components'
import appointmentService from '../../../../services/appointment/appointmentService'
import { toast } from 'react-hot-toast'

const StaffSelection = () => {
  const navigate = useNavigate()
  const { businessLink } = useParams()
  const [loading, setLoading] = useState(true)
  const [staff, setStaff] = useState([])
  const [selectedStaff, setSelectedStaff] = useState(null)
  const [selectedService, setSelectedService] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    // Get selected service from session storage
    const service = sessionStorage.getItem('selectedService')
    if (service && businessLink) {
      setSelectedService(JSON.parse(service))
      fetchStaff()
    }
  }, [])

  const fetchStaff = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const result = await appointmentService.getBusinessInfo(businessLink)
      
      if (result.success) {
        setStaff(result.data.staff || [])
        toast.success('Staff members loaded successfully!')
      } else {
        setError(result.error || 'Failed to load staff members')
        toast.error(result.error || 'Failed to load staff members')
      }
    } catch (error) {
      console.error('Error fetching staff:', error)
      setError('An unexpected error occurred')
      toast.error('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }
      
      ]
      
    } catch (error) {
      console.error('Error fetching staff:', error)
      setError('Failed to load staff information')
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

  const handleStaffSelect = (staffMember) => {
    setSelectedStaff(staffMember)
  }

  const handleContinue = () => {
    if (selectedStaff) {
      // Store selected staff in session storage
      sessionStorage.setItem('selectedStaff', JSON.stringify(selectedStaff))
      navigate('/booking/time-selection')
    }
  }

  const handleBack = () => {
    navigate('/booking/service-selection')
  }

  const getRoleColor = (role) => {
    switch (role) {
      case 'Senior Stylist': return 'purple'
      case 'Stylist': return 'blue'
      case 'Colorist': return 'pink'
      case 'Barber': return 'green'
      default: return 'gray'
    }
  }

  const isStaffAvailableForService = (staffMember) => {
    if (!selectedService) return true
    return staffMember.services.includes(selectedService.name)
  }

  const getAdjustedPrice = (staffMember) => {
    if (!selectedService) return 0
    return selectedService.price * staffMember.priceModifier
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading staff information...</p>
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Choose Your Stylist</h1>
          <p className="text-lg text-gray-600">Select from our talented team of professionals</p>
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
              <div className="w-16 h-1 bg-primary-600"></div>
              <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">3</span>
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
            <span className="text-sm text-gray-500">Staff Selection</span>
          </div>
        </div>

        {/* Selected Service Info */}
        {selectedService && (
          <div className="mb-8">
            <Card>
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">Selected Service</h3>
                    <p className="text-sm text-gray-600">{selectedService.name} - {formatCurrency(selectedService.price)}</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => navigate('/booking/service-selection')}>
                    Change Service
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Staff Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {staff.map((staffMember) => {
            const isAvailable = isStaffAvailableForService(staffMember)
            const adjustedPrice = getAdjustedPrice(staffMember)
            
            return (
              <Card
                key={staffMember.id}
                className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                  selectedStaff?.id === staffMember.id
                    ? 'ring-2 ring-primary-500 bg-primary-50'
                    : 'hover:shadow-md'
                } ${!isAvailable ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={() => isAvailable && handleStaffSelect(staffMember)}
              >
                <div className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
                      <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{staffMember.name}</h3>
                          <Badge variant={getRoleColor(staffMember.role)} size="sm">
                            {staffMember.role}
                          </Badge>
                        </div>
                        {selectedService && (
                          <div className="text-right">
                            <p className="text-lg font-bold text-gray-900">
                              {formatCurrency(adjustedPrice)}
                            </p>
                            {staffMember.priceModifier !== 1.0 && (
                              <p className="text-xs text-gray-500">
                                {staffMember.priceModifier > 1 ? '+' : ''}
                                {((staffMember.priceModifier - 1) * 100).toFixed(0)}%
                              </p>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-4 mb-3">
                        <div className="flex items-center gap-1">
                          <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                          <span className="text-sm font-medium text-gray-900">{staffMember.rating}/5.0</span>
                          <span className="text-sm text-gray-500">({staffMember.reviewCount} reviews)</span>
                        </div>
                        <span className="text-sm text-gray-500">{staffMember.experience}</span>
                      </div>

                      <p className="text-gray-600 text-sm mb-3">{staffMember.bio}</p>

                      <div className="mb-3">
                        <h4 className="text-sm font-medium text-gray-900 mb-1">Specialties:</h4>
                        <div className="flex flex-wrap gap-1">
                          {staffMember.specialties.map((specialty, index) => (
                            <Badge key={index} variant="info" size="sm">
                              {specialty}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {!isAvailable && (
                        <div className="p-2 bg-yellow-50 rounded-lg">
                          <p className="text-sm text-yellow-800">
                            This stylist doesn't offer {selectedService?.name}
                          </p>
                        </div>
                      )}

                      {selectedStaff?.id === staffMember.id && (
                        <div className="mt-3 p-3 bg-primary-100 rounded-lg">
                          <div className="flex items-center gap-2">
                            <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span className="text-sm font-medium text-primary-800">Selected</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={handleBack}>
            ← Back
          </Button>
          <Button
            variant="primary"
            onClick={handleContinue}
            disabled={!selectedStaff}
          >
            Continue to Time Selection →
          </Button>
        </div>

        {/* Selected Staff Summary */}
        {selectedStaff && (
          <div className="mt-8">
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Selected Stylist</h3>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{selectedStaff.name}</h4>
                      <p className="text-sm text-gray-600">{selectedStaff.role} • {selectedStaff.rating}/5.0 rating</p>
                    </div>
                  </div>
                  {selectedService && (
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900">
                        {formatCurrency(getAdjustedPrice(selectedStaff))}
                      </p>
                      <p className="text-sm text-gray-500">for {selectedService.name}</p>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}

export default StaffSelection
