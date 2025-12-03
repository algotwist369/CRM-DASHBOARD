import React, { useState, useEffect } from 'react'
import { Button, Badge, Card } from '../../common'

const AppointmentCalendar = ({ 
  appointments = [],
  onDateSelect,
  onAppointmentClick,
  selectedDate,
  view = 'month', // month, week, day
  businessHours = { start: '09:00', end: '18:00' },
  className = ''
}) => {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [viewMode, setViewMode] = useState(view)

  useEffect(() => {
    setViewMode(view)
  }, [view])

  const today = new Date()
  const currentMonth = currentDate.getMonth()
  const currentYear = currentDate.getFullYear()

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }

  const getAppointmentsForDate = (date) => {
    const dateString = date.toISOString().split('T')[0]
    return appointments.filter(apt => 
      apt.appointmentDate === dateString
    )
  }

  const getAppointmentStatusColor = (status) => {
    const colors = {
      scheduled: 'bg-blue-100 text-blue-800',
      confirmed: 'bg-green-100 text-green-800',
      in_progress: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-gray-100 text-gray-800',
      cancelled: 'bg-red-100 text-red-800',
      no_show: 'bg-gray-100 text-gray-600'
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  const navigateMonth = (direction) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev)
      newDate.setMonth(prev.getMonth() + direction)
      return newDate
    })
  }

  const goToToday = () => {
    setCurrentDate(new Date())
  }

  const isToday = (date) => {
    return date.toDateString() === today.toDateString()
  }

  const isSelected = (date) => {
    return selectedDate && date.toDateString() === new Date(selectedDate).toDateString()
  }

  const renderMonthView = () => {
    const daysInMonth = getDaysInMonth(currentDate)
    const firstDay = getFirstDayOfMonth(currentDate)
    const days = []

    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-24 border border-gray-200"></div>)
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentYear, currentMonth, day)
      const dayAppointments = getAppointmentsForDate(date)
      const isCurrentDay = isToday(date)
      const isSelectedDay = isSelected(date)

      days.push(
        <div
          key={day}
          className={`h-24 border border-gray-200 p-1 cursor-pointer hover:bg-gray-50 ${
            isCurrentDay ? 'bg-blue-50' : ''
          } ${isSelectedDay ? 'bg-primary-50 border-primary-300' : ''}`}
          onClick={() => onDateSelect && onDateSelect(date)}
        >
          <div className="flex items-center justify-between mb-1">
            <span className={`text-sm font-medium ${
              isCurrentDay ? 'text-blue-600' : 
              isSelectedDay ? 'text-primary-600' : 
              'text-gray-900'
            }`}>
              {day}
            </span>
            {dayAppointments.length > 0 && (
              <Badge variant="primary" size="sm">
                {dayAppointments.length}
              </Badge>
            )}
          </div>
          
          {/* Appointments for this day */}
          <div className="space-y-1">
            {dayAppointments.slice(0, 2).map((appointment, index) => (
              <div
                key={index}
                className={`text-xs p-1 rounded truncate cursor-pointer ${getAppointmentStatusColor(appointment.status)}`}
                onClick={(e) => {
                  e.stopPropagation()
                  onAppointmentClick && onAppointmentClick(appointment)
                }}
                title={`${appointment.serviceName} - ${appointment.customerName}`}
              >
                {appointment.appointmentTime} - {appointment.serviceName}
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
    }

    return days
  }

  const renderWeekView = () => {
    const startOfWeek = new Date(currentDate)
    const day = startOfWeek.getDay()
    startOfWeek.setDate(startOfWeek.getDate() - day)

    const weekDays = []
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek)
      date.setDate(startOfWeek.getDate() + i)
      const dayAppointments = getAppointmentsForDate(date)
      const isCurrentDay = isToday(date)
      const isSelectedDay = isSelected(date)

      weekDays.push(
        <div
          key={i}
          className={`flex-1 border border-gray-200 p-2 min-h-32 ${
            isCurrentDay ? 'bg-blue-50' : ''
          } ${isSelectedDay ? 'bg-primary-50 border-primary-300' : ''}`}
          onClick={() => onDateSelect && onDateSelect(date)}
        >
          <div className="flex items-center justify-between mb-2">
            <div>
              <div className="text-sm font-medium text-gray-900">
                {dayNames[i]}
              </div>
              <div className={`text-lg font-semibold ${
                isCurrentDay ? 'text-blue-600' : 
                isSelectedDay ? 'text-primary-600' : 
                'text-gray-900'
              }`}>
                {date.getDate()}
              </div>
            </div>
            {dayAppointments.length > 0 && (
              <Badge variant="primary" size="sm">
                {dayAppointments.length}
              </Badge>
            )}
          </div>
          
          <div className="space-y-1">
            {dayAppointments.map((appointment, index) => (
              <div
                key={index}
                className={`text-xs p-1 rounded cursor-pointer ${getAppointmentStatusColor(appointment.status)}`}
                onClick={(e) => {
                  e.stopPropagation()
                  onAppointmentClick && onAppointmentClick(appointment)
                }}
                title={`${appointment.serviceName} - ${appointment.customerName}`}
              >
                {appointment.appointmentTime} - {appointment.serviceName}
              </div>
            ))}
          </div>
        </div>
      )
    }

    return weekDays
  }

  const renderDayView = () => {
    const dayAppointments = getAppointmentsForDate(currentDate)
    const isCurrentDay = isToday(currentDate)

    return (
      <div className="space-y-4">
        {/* Day Header */}
        <div className={`p-4  ${
          isCurrentDay ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50 border border-gray-200'
        }`}>
          <h3 className="text-lg font-semibold text-gray-900">
            {currentDate.toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </h3>
          <p className="text-sm text-gray-600">
            {dayAppointments.length} appointment{dayAppointments.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Appointments List */}
        <div className="space-y-3">
          {dayAppointments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p>No appointments scheduled</p>
            </div>
          ) : (
            dayAppointments
              .sort((a, b) => a.appointmentTime.localeCompare(b.appointmentTime))
              .map((appointment) => (
                <div
                  key={appointment.id}
                  className="p-4 bg-white border border-gray-200  hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => onAppointmentClick && onAppointmentClick(appointment)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-gray-900">
                          {appointment.serviceName}
                        </h4>
                        <Badge variant={appointment.status === 'completed' ? 'success' : 'primary'}>
                          {appointment.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-1">
                        {appointment.customerName} • {appointment.customerPhone}
                      </p>
                      <p className="text-sm text-gray-500">
                        {appointment.appointmentTime} • {appointment.duration} min
                      </p>
                    </div>
                    {appointment.staffName && (
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">
                          {appointment.staffName}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))
          )}
        </div>
      </div>
    )
  }

  return (
    <Card className={`shadow ${className}`}>
      {/* Calendar Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-semibold text-gray-900">
              {monthNames[currentMonth]} {currentYear}
            </h2>
            <div className="flex gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setViewMode('month')}
                className={viewMode === 'month' ? 'bg-primary-50 text-primary-600' : ''}
              >
                Month
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setViewMode('week')}
                className={viewMode === 'week' ? 'bg-primary-50 text-primary-600' : ''}
              >
                Week
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setViewMode('day')}
                className={viewMode === 'day' ? 'bg-primary-50 text-primary-600' : ''}
              >
                Day
              </Button>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateMonth(-1)}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={goToToday}
            >
              Today
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateMonth(1)}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Button>
          </div>
        </div>
      </div>

      {/* Calendar Body */}
      <div className="p-4">
        {viewMode === 'month' && (
          <>
            {/* Day Headers */}
            <div className="grid grid-cols-7 gap-0 mb-2">
              {dayNames.map(day => (
                <div key={day} className="h-8 flex items-center justify-center text-sm font-medium text-gray-500">
                  {day}
                </div>
              ))}
            </div>
            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-0">
              {renderMonthView()}
            </div>
          </>
        )}

        {viewMode === 'week' && (
          <div className="flex gap-0">
            {renderWeekView()}
          </div>
        )}

        {viewMode === 'day' && renderDayView()}
      </div>
    </Card>
  )
}

export default AppointmentCalendar
