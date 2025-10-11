import React, { useState, useEffect } from 'react'
import { Button, Input } from '../../common'

const TimeSlotPicker = ({ 
  selectedDate,
  selectedTime,
  onTimeSelect,
  availableSlots = [],
  duration = 30, // minutes
  startTime = '09:00',
  endTime = '18:00',
  disabled = false,
  className = ''
}) => {
  const [selectedSlot, setSelectedSlot] = useState(selectedTime)

  useEffect(() => {
    setSelectedSlot(selectedTime)
  }, [selectedTime])

  const generateTimeSlots = () => {
    const slots = []
    const [startHour, startMin] = startTime.split(':').map(Number)
    const [endHour, endMin] = endTime.split(':').map(Number)
    
    const startMinutes = startHour * 60 + startMin
    const endMinutes = endHour * 60 + endMin
    
    for (let minutes = startMinutes; minutes < endMinutes; minutes += duration) {
      const hour = Math.floor(minutes / 60)
      const min = minutes % 60
      const timeString = `${String(hour).padStart(2, '0')}:${String(min).padStart(2, '0')}`
      
      const isAvailable = availableSlots.length === 0 || 
        availableSlots.some(slot => slot.time === timeString && slot.available)
      
      const isBooked = availableSlots.some(slot => 
        slot.time === timeString && !slot.available
      )
      
      slots.push({
        time: timeString,
        displayTime: formatTime(timeString),
        available: isAvailable,
        booked: isBooked
      })
    }
    
    return slots
  }

  const formatTime = (timeString) => {
    const [hours, minutes] = timeString.split(':').map(Number)
    const date = new Date()
    date.setHours(hours, minutes, 0, 0)
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

  const handleSlotSelect = (slot) => {
    if (slot.available && !disabled) {
      setSelectedSlot(slot.time)
      onTimeSelect(slot.time)
    }
  }

  const timeSlots = generateTimeSlots()

  const getSlotStatus = (slot) => {
    if (slot.booked) return 'booked'
    if (!slot.available) return 'unavailable'
    if (selectedSlot === slot.time) return 'selected'
    return 'available'
  }

  const getSlotClasses = (slot) => {
    const status = getSlotStatus(slot)
    const baseClasses = 'px-3 py-2 text-sm font-medium rounded-md border transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2'
    
    switch (status) {
      case 'selected':
        return `${baseClasses} bg-primary-600 text-white border-primary-600 focus:ring-primary-500`
      case 'available':
        return `${baseClasses} bg-white text-gray-700 border-gray-300 hover:bg-gray-50 focus:ring-primary-500`
      case 'booked':
        return `${baseClasses} bg-red-50 text-red-700 border-red-200 cursor-not-allowed`
      case 'unavailable':
        return `${baseClasses} bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed`
      default:
        return baseClasses
    }
  }

  return (
    <div className={className}>
      <div className="mb-4">
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Select Time Slot
        </h3>
        {selectedDate && (
          <p className="text-sm text-gray-600">
            {new Date(selectedDate).toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </p>
        )}
      </div>

      {/* Time Slots Grid */}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
        {timeSlots.map((slot) => (
          <button
            key={slot.time}
            onClick={() => handleSlotSelect(slot)}
            disabled={!slot.available || slot.booked || disabled}
            className={getSlotClasses(slot)}
            title={
              slot.booked ? 'Already booked' :
              !slot.available ? 'Not available' :
              'Click to select'
            }
          >
            {slot.displayTime}
          </button>
        ))}
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap items-center gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-primary-600 rounded"></div>
          <span className="text-gray-600">Selected</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-white border border-gray-300 rounded"></div>
          <span className="text-gray-600">Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-red-50 border border-red-200 rounded"></div>
          <span className="text-gray-600">Booked</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-gray-50 border border-gray-200 rounded"></div>
          <span className="text-gray-600">Unavailable</span>
        </div>
      </div>

      {/* Selected Time Display */}
      {selectedSlot && (
        <div className="mt-4 p-3 bg-primary-50 border border-primary-200 rounded-md">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm font-medium text-primary-800">
              Selected time: {formatTime(selectedSlot)}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

// Time Slot Display Component
export const TimeSlotDisplay = ({ 
  time, 
  duration, 
  className = '' 
}) => {
  const formatTime = (timeString) => {
    const [hours, minutes] = timeString.split(':').map(Number)
    const startTime = new Date()
    startTime.setHours(hours, minutes, 0, 0)
    
    const endTime = new Date(startTime.getTime() + duration * 60000)
    
    const formatTimeString = (date) => {
      return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      })
    }
    
    return `${formatTimeString(startTime)} - ${formatTimeString(endTime)}`
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <span className="text-sm text-gray-600">
        {formatTime(time)}
      </span>
    </div>
  )
}

export default TimeSlotPicker
