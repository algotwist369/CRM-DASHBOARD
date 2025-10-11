import React, { useState, useEffect } from 'react'
import { Card, Button, Badge, Modal, Alert } from '../../../../components'
import appointmentService from '../../../../services/appointment/appointmentService'
import { toast } from 'react-hot-toast'

const AppointmentCalendar = () => {
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedAppointment, setSelectedAppointment] = useState(null)
  const [showAppointmentModal, setShowAppointmentModal] = useState(false)
  const [viewMode, setViewMode] = useState('week') // 'day', 'week', 'month'

  useEffect(() => {
    fetchAppointments()
  }, [currentDate])

  const fetchAppointments = async () => {
    try {
      setLoading(true)
      
      const result = await appointmentService.getAppointments()
      
      if (result.success) {
        setAppointments(result.data)
        toast.success('Appointments loaded successfully!')
      } else {
        toast.error(result.error || 'Failed to load appointments')
        console.error('Appointments error:', result.error)
      }
    } catch (error) {
      console.error('Error fetching appointments:', error)
      toast.error('An unexpected error occurred while loading appointments')
    } finally {
      setLoading(false)
    }
  }
      
      ]
      
    } catch (error) {
      console.error('Error fetching appointments:', error)
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

  const formatTime = (timeString) => {
    const [hours, minutes] = timeString.split(':')
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour % 12 || 12
    return `${displayHour}:${minutes} ${ampm}`
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled': return 'info'
      case 'completed': return 'success'
      case 'cancelled': return 'danger'
      case 'in_progress': return 'warning'
      case 'no_show': return 'danger'
      default: return 'default'
    }
  }

  const getStaffColor = (staffName) => {
    const colors = {
      'Emma Wilson': 'bg-blue-100 text-blue-800',
      'David Brown': 'bg-green-100 text-green-800',
      'Lisa Garcia': 'bg-purple-100 text-purple-800'
    }
    return colors[staffName] || 'bg-gray-100 text-gray-800'
  }

  const getWeekDays = () => {
    const startOfWeek = new Date(currentDate)
    const day = startOfWeek.getDay()
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1)
    startOfWeek.setDate(diff)
    
    const days = []
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek)
      day.setDate(startOfWeek.getDate() + i)
      days.push(day)
    }
    return days
  }

  const getAppointmentsForDate = (date) => {
    const dateString = date.toISOString().split('T')[0]
    return appointments.filter(appointment => appointment.date === dateString)
  }

  const getAppointmentsForTimeSlot = (date, hour) => {
    const dateString = date.toISOString().split('T')[0]
    return appointments.filter(appointment => {
      if (appointment.date !== dateString) return false
      const appointmentHour = parseInt(appointment.time.split(':')[0])
      return appointmentHour === hour
    })
  }

  const renderDayView = () => {
    const dayAppointments = getAppointmentsForDate(currentDate)
    
    return (
      <div className="space-y-4">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {currentDate.toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </h2>
        </div>
        
        <div className="grid grid-cols-1 gap-4">
          {Array.from({ length: 12 }, (_, i) => i + 8).map(hour => {
            const timeSlotAppointments = getAppointmentsForTimeSlot(currentDate, hour)
            
            return (
              <div key={hour} className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg">
                <div className="w-20 text-sm font-medium text-gray-600">
                  {formatTime(`${hour}:00`)}
                </div>
                <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-2">
                  {timeSlotAppointments.length > 0 ? (
                    timeSlotAppointments.map(appointment => (
                      <div
                        key={appointment.id}
                        className={`p-3 rounded-lg cursor-pointer hover:shadow-md transition-shadow ${getStaffColor(appointment.staffName)}`}
                        onClick={() => {
                          setSelectedAppointment(appointment)
                          setShowAppointmentModal(true)
                        }}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-sm">{appointment.customerName}</span>
                          <Badge variant={getStatusColor(appointment.status)} size="sm">
                            {appointment.status}
                          </Badge>
                        </div>
                        <p className="text-xs opacity-75">{appointment.service}</p>
                        <p className="text-xs opacity-75">{appointment.staffName}</p>
                      </div>
                    ))
                  ) : (
                    <div className="p-3 text-gray-400 text-sm">
                      No appointments
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  const renderWeekView = () => {
    const weekDays = getWeekDays()
    
    return (
      <div className="space-y-4">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            Week of {weekDays[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {weekDays[6].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </h2>
        </div>
        
        <div className="grid grid-cols-7 gap-4">
          {weekDays.map((day, index) => {
            const dayAppointments = getAppointmentsForDate(day)
            
            return (
              <div key={index} className="space-y-2">
                <div className="text-center">
                  <div className="text-sm font-medium text-gray-600">
                    {day.toLocaleDateString('en-US', { weekday: 'short' })}
                  </div>
                  <div className={`text-lg font-bold ${
                    day.toDateString() === new Date().toDateString() 
                      ? 'text-primary-600' 
                      : 'text-gray-900'
                  }`}>
                    {day.getDate()}
                  </div>
                </div>
                
                <div className="space-y-1">
                  {dayAppointments.slice(0, 3).map(appointment => (
                    <div
                      key={appointment.id}
                      className={`p-2 rounded text-xs cursor-pointer hover:shadow-md transition-shadow ${getStaffColor(appointment.staffName)}`}
                      onClick={() => {
                        setSelectedAppointment(appointment)
                        setShowAppointmentModal(true)
                      }}
                    >
                      <div className="font-medium">{appointment.customerName}</div>
                      <div className="opacity-75">{appointment.service}</div>
                      <div className="opacity-75">{formatTime(appointment.time)}</div>
                    </div>
                  ))}
                  {dayAppointments.length > 3 && (
                    <div className="text-xs text-gray-500 text-center">
                      +{dayAppointments.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  const renderMonthView = () => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const startDate = new Date(firstDay)
    startDate.setDate(startDate.getDate() - firstDay.getDay())
    
    const days = []
    for (let i = 0; i < 42; i++) {
      const day = new Date(startDate)
      day.setDate(startDate.getDate() + i)
      days.push(day)
    }
    
    return (
      <div className="space-y-4">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {currentDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}
          </h2>
        </div>
        
        <div className="grid grid-cols-7 gap-1">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="p-2 text-center text-sm font-medium text-gray-600">
              {day}
            </div>
          ))}
          
          {days.map((day, index) => {
            const dayAppointments = getAppointmentsForDate(day)
            const isCurrentMonth = day.getMonth() === month
            const isToday = day.toDateString() === new Date().toDateString()
            
            return (
              <div
                key={index}
                className={`min-h-[100px] p-2 border border-gray-200 ${
                  isCurrentMonth ? 'bg-white' : 'bg-gray-50'
                } ${isToday ? 'ring-2 ring-primary-500' : ''}`}
              >
                <div className={`text-sm font-medium mb-1 ${
                  isCurrentMonth ? 'text-gray-900' : 'text-gray-400'
                } ${isToday ? 'text-primary-600' : ''}`}>
                  {day.getDate()}
                </div>
                
                <div className="space-y-1">
                  {dayAppointments.slice(0, 2).map(appointment => (
                    <div
                      key={appointment.id}
                      className={`p-1 rounded text-xs cursor-pointer hover:shadow-md transition-shadow ${getStaffColor(appointment.staffName)}`}
                      onClick={() => {
                        setSelectedAppointment(appointment)
                        setShowAppointmentModal(true)
                      }}
                    >
                      <div className="font-medium truncate">{appointment.customerName}</div>
                      <div className="opacity-75 truncate">{appointment.service}</div>
                    </div>
                  ))}
                  {dayAppointments.length > 2 && (
                    <div className="text-xs text-gray-500">
                      +{dayAppointments.length - 2} more
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  const renderAppointmentModal = () => (
    <Modal
      isOpen={showAppointmentModal}
      onClose={() => {
        setShowAppointmentModal(false)
        setSelectedAppointment(null)
      }}
      title="Appointment Details"
      size="md"
    >
      {selectedAppointment && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Customer</label>
              <p className="text-gray-900">{selectedAppointment.customerName}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Service</label>
              <p className="text-gray-900">{selectedAppointment.service}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Staff</label>
              <p className="text-gray-900">{selectedAppointment.staffName}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Date & Time</label>
              <p className="text-gray-900">
                {new Date(selectedAppointment.date).toLocaleDateString()} at {formatTime(selectedAppointment.time)}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Duration</label>
              <p className="text-gray-900">{selectedAppointment.duration} minutes</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Price</label>
              <p className="text-gray-900">{formatCurrency(selectedAppointment.price)}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Status</label>
              <Badge variant={getStatusColor(selectedAppointment.status)} size="sm">
                {selectedAppointment.status}
              </Badge>
            </div>
          </div>
          
          {selectedAppointment.notes && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Notes</label>
              <p className="text-gray-900">{selectedAppointment.notes}</p>
            </div>
          )}
          
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setShowAppointmentModal(false)
                setSelectedAppointment(null)
              }}
            >
              Close
            </Button>
            <Button variant="primary">Edit Appointment</Button>
          </div>
        </div>
      )}
    </Modal>
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading calendar...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Appointment Calendar</h1>
              <p className="mt-2 text-gray-600">
                View and manage appointments in calendar format
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline">Export</Button>
              <Button variant="primary">Book Appointment</Button>
            </div>
          </div>
        </div>

        {/* Calendar Controls */}
        <Card className="mb-6">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    const newDate = new Date(currentDate)
                    if (viewMode === 'day') {
                      newDate.setDate(newDate.getDate() - 1)
                    } else if (viewMode === 'week') {
                      newDate.setDate(newDate.getDate() - 7)
                    } else {
                      newDate.setMonth(newDate.getMonth() - 1)
                    }
                    setCurrentDate(newDate)
                  }}
                >
                  ← Previous
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setCurrentDate(new Date())}
                >
                  Today
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    const newDate = new Date(currentDate)
                    if (viewMode === 'day') {
                      newDate.setDate(newDate.getDate() + 1)
                    } else if (viewMode === 'week') {
                      newDate.setDate(newDate.getDate() + 7)
                    } else {
                      newDate.setMonth(newDate.getMonth() + 1)
                    }
                    setCurrentDate(newDate)
                  }}
                >
                  Next →
                </Button>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant={viewMode === 'day' ? 'primary' : 'outline'}
                  onClick={() => setViewMode('day')}
                >
                  Day
                </Button>
                <Button
                  variant={viewMode === 'week' ? 'primary' : 'outline'}
                  onClick={() => setViewMode('week')}
                >
                  Week
                </Button>
                <Button
                  variant={viewMode === 'month' ? 'primary' : 'outline'}
                  onClick={() => setViewMode('month')}
                >
                  Month
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Calendar View */}
        <Card>
          <div className="p-6">
            {viewMode === 'day' && renderDayView()}
            {viewMode === 'week' && renderWeekView()}
            {viewMode === 'month' && renderMonthView()}
          </div>
        </Card>

        {/* Appointment Modal */}
        {renderAppointmentModal()}
      </div>
    </div>
  )
}

export default AppointmentCalendar
