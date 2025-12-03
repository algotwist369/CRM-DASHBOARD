import React, { useState, useRef, useEffect } from 'react'

const TimePicker = ({ 
  value,
  onChange,
  placeholder = 'Select time',
  format = '24h', // 12h or 24h
  interval = 30, // minutes interval
  disabled = false,
  className = '',
  ...props 
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedTime, setSelectedTime] = useState(value || '')
  const timePickerRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (timePickerRef.current && !timePickerRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const generateTimeOptions = () => {
    const options = []
    const totalMinutes = 24 * 60

    for (let minutes = 0; minutes < totalMinutes; minutes += interval) {
      const hours = Math.floor(minutes / 60)
      const mins = minutes % 60
      
      let timeString = ''
      let displayString = ''
      
      if (format === '12h') {
        const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours
        const ampm = hours < 12 ? 'AM' : 'PM'
        timeString = `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`
        displayString = `${displayHours}:${String(mins).padStart(2, '0')} ${ampm}`
      } else {
        timeString = `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`
        displayString = timeString
      }
      
      options.push({ value: timeString, label: displayString })
    }
    
    return options
  }

  const timeOptions = generateTimeOptions()

  const handleTimeSelect = (timeValue) => {
    setSelectedTime(timeValue)
    onChange(timeValue)
    setIsOpen(false)
  }

  const formatDisplayTime = (timeValue) => {
    if (!timeValue) return placeholder
    
    const [hours, minutes] = timeValue.split(':')
    const hour = parseInt(hours)
    const min = parseInt(minutes)
    
    if (format === '12h') {
      const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour
      const ampm = hour < 12 ? 'AM' : 'PM'
      return `${displayHour}:${String(min).padStart(2, '0')} ${ampm}`
    }
    
    return timeValue
  }

  return (
    <div className={`relative ${className}`} ref={timePickerRef}>
      {/* Input */}
      <input
        type="text"
        value={formatDisplayTime(selectedTime)}
        readOnly
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`w-full px-3 py-2 border border-gray-300   focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 cursor-pointer ${
          disabled ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : 'hover:border-gray-400'
        }`}
        {...props}
      />

      {/* Time Dropdown */}
      {isOpen && (
        <div className="absolute z-10 mt-1 bg-white border border-gray-300  shadow-lg max-h-60 overflow-auto min-w-[120px]">
          {timeOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => handleTimeSelect(option.value)}
              className={`w-full px-3 py-2 text-left hover:bg-gray-100 focus:outline-none focus:bg-gray-100 ${
                selectedTime === option.value ? 'bg-primary-50 text-primary-600' : 'text-gray-900'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default TimePicker
