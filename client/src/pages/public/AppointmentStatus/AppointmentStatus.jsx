import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, Button, Badge, Alert } from '../../../components'
import appointmentService from '../../../services/appointment/appointmentService'
import { toast } from 'react-hot-toast'

const AppointmentStatus = () => {
  const { confirmationNumber } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [appointment, setAppointment] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (confirmationNumber) {
      fetchAppointmentStatus()
    } else {
      setError('No confirmation number provided')
      setLoading(false)
    }
  }, [confirmationNumber])

  const fetchAppointmentStatus = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const result = await appointmentService.getAppointmentByCode(confirmationNumber)
      
      if (result.success) {
        setAppointment(result.data)
        toast.success('Appointment status loaded successfully!')
      } else {
        setError(result.error || 'Failed to load appointment status')
        toast.error(result.error || 'Failed to load appointment status')
      }
    } catch (error) {
      console.error('Error fetching appointment status:', error)
      setError('An unexpected error occurred')
      toast.error('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }
      
        ],
        history: [
          {
            action: 'Appointment Booked',
            timestamp: '2024-01-20T10:30:00Z',
            description: 'Appointment confirmed and payment processed'
          },
          {
            action: 'Reminder Sent',
            timestamp: '2024-01-20T10:35:00Z',
            description: 'Email confirmation sent to customer'
          },
          {
            action: 'SMS Reminder',
            timestamp: '2024-01-20T10:36:00Z',
            description: 'SMS reminder sent to customer'
          }
        ]
      }
      
    } catch (error) {
      console.error('Error fetching appointment status:', error)
      setError('Failed to load appointment details')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatTime = (timeString) => {
    const [hours, minutes] = timeString.split(':')
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour % 12 || 12
    return `${displayHour}:${minutes} ${ampm}`
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'success'
      case 'pending': return 'warning'
      case 'cancelled': return 'danger'
      case 'completed': return 'info'
      default: return 'default'
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'confirmed': return 'Confirmed'
      case 'pending': return 'Pending'
      case 'cancelled': return 'Cancelled'
      case 'completed': return 'Completed'
      default: return 'Unknown'
    }
  }

  const handleReschedule = () => {
    // In a real app, this would navigate to rescheduling flow
    alert('Rescheduling functionality would be implemented here')
  }

  const handleCancel = () => {
    // In a real app, this would show cancellation confirmation
    if (window.confirm('Are you sure you want to cancel this appointment?')) {
      alert('Cancellation functionality would be implemented here')
    }
  }

  const handleContactBusiness = () => {
    window.open(`tel:${appointment.business.phone}`)
  }

  const handleBookAnother = () => {
    navigate('/booking/business-info')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading appointment details...</p>
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

  if (!appointment) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Alert
            type="error"
            title="Appointment Not Found"
            message="No appointment found with the provided confirmation number."
          />
          <Button variant="primary" className="mt-4" onClick={() => navigate('/booking/business-info')}>
            Book New Appointment
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Appointment Status</h1>
          <p className="text-lg text-gray-600">Track your appointment details and status</p>
          <div className="mt-4">
            <Badge variant={getStatusColor(appointment.status)} size="lg">
              {getStatusText(appointment.status)}
            </Badge>
          </div>
        </div>

        {/* Confirmation Number */}
        <Card className="mb-8">
          <div className="p-6 text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Confirmation Number</h2>
            <p className="text-2xl font-mono font-bold text-primary-600">{appointment.confirmationNumber}</p>
            <p className="text-sm text-gray-500 mt-2">
              Booked on {formatDate(appointment.createdAt)}
            </p>
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Appointment Details */}
          <div className="space-y-6">
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Appointment Details</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900">Service</h4>
                    <p className="text-gray-600">{appointment.service.name}</p>
                    <p className="text-sm text-gray-500">{appointment.service.duration} minutes</p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900">Stylist</h4>
                    <p className="text-gray-600">{appointment.staff.name}</p>
                    <p className="text-sm text-gray-500">{appointment.staff.role}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900">Date & Time</h4>
                    <p className="text-gray-600">{formatDate(appointment.dateTime.date)}</p>
                    <p className="text-sm text-gray-500">
                      {formatTime(appointment.dateTime.time)} - {formatTime(appointment.estimatedEndTime)}
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900">Total Amount</h4>
                    <p className="text-xl font-bold text-gray-900">
                      {formatCurrency(appointment.service.price)}
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            <Card>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Business Information</h3>
                <div className="space-y-3">
                  <div>
                    <h4 className="font-medium text-gray-900">{appointment.business.name}</h4>
                    <p className="text-sm text-gray-600">{appointment.business.address}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <a href={`tel:${appointment.business.phone}`} className="text-sm text-primary-600 hover:text-primary-800">
                      {appointment.business.phone}
                    </a>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <a href={`mailto:${appointment.business.email}`} className="text-sm text-primary-600 hover:text-primary-800">
                      {appointment.business.email}
                    </a>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Customer Info & Actions */}
          <div className="space-y-6">
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Information</h3>
                <div className="space-y-3">
                  <div>
                    <h4 className="font-medium text-gray-900">Name</h4>
                    <p className="text-gray-600">
                      {appointment.customer.firstName} {appointment.customer.lastName}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Email</h4>
                    <p className="text-gray-600">{appointment.customer.email}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Phone</h4>
                    <p className="text-gray-600">{appointment.customer.phone}</p>
                  </div>
                  {appointment.notes && (
                    <div>
                      <h4 className="font-medium text-gray-900">Notes</h4>
                      <p className="text-gray-600">{appointment.notes}</p>
                    </div>
                  )}
                </div>
              </div>
            </Card>

            <Card>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions</h3>
                <div className="space-y-3">
                  <Button variant="outline" className="w-full" onClick={handleContactBusiness}>
                    Contact Business
                  </Button>
                  <Button variant="outline" className="w-full" onClick={handleReschedule}>
                    Reschedule Appointment
                  </Button>
                  <Button variant="outline" className="w-full" onClick={handleBookAnother}>
                    Book Another Appointment
                  </Button>
                  <Button variant="danger" className="w-full" onClick={handleCancel}>
                    Cancel Appointment
                  </Button>
                </div>
              </div>
            </Card>

            <Card>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Reminders</h3>
                <div className="space-y-2">
                  {appointment.reminders.map((reminder, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-sm text-gray-700 capitalize">{reminder.type} reminder</span>
                      </div>
                      <span className="text-xs text-gray-500">
                        {formatDate(reminder.sentAt)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Appointment History */}
        <Card className="mt-8">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Appointment History</h3>
            <div className="space-y-3">
              {appointment.history.map((event, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary-600 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{event.action}</h4>
                    <p className="text-sm text-gray-600">{event.description}</p>
                    <p className="text-xs text-gray-500">{formatDate(event.timestamp)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}

export default AppointmentStatus
