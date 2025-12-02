import React, { useState, useRef, useEffect } from 'react'

const DatePicker = ({ 
  value,
  onChange,
  placeholder = 'Select date',
  minDate,
  maxDate,
  disabled = false,
  className = '',
  format = 'YYYY-MM-DD',
  ...props 
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState(value ? new Date(value) : null)
  const [currentMonth, setCurrentMonth] = useState(selectedDate || new Date())
  const datePickerRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (datePickerRef.current && !datePickerRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const formatDate = (date) => {
    if (!date) return ''
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  const formatDisplayDate = (date) => {
    if (!date) return placeholder
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }

  const isDateDisabled = (date) => {
    if (minDate && date < new Date(minDate)) return true
    if (maxDate && date > new Date(maxDate)) return true
    return false
  }

  const handleDateSelect = (day) => {
    const newDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
    if (!isDateDisabled(newDate)) {
      setSelectedDate(newDate)
      onChange(formatDate(newDate))
      setIsOpen(false)
    }
  }

  const navigateMonth = (direction) => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev)
      newMonth.setMonth(prev.getMonth() + direction)
      return newMonth
    })
  }

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentMonth)
    const firstDay = getFirstDayOfMonth(currentMonth)
    const days = []

    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-8"></div>)
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
      const isSelected = selectedDate && 
        selectedDate.getDate() === day && 
        selectedDate.getMonth() === currentMonth.getMonth() &&
        selectedDate.getFullYear() === currentMonth.getFullYear()
      const isDisabled = isDateDisabled(date)
      const isToday = date.toDateString() === new Date().toDateString()

      days.push(
        <button
          key={day}
          onClick={() => handleDateSelect(day)}
          disabled={isDisabled}
          className={`h-8 w-8 text-sm rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 ${
            isSelected 
              ? 'bg-primary-600 text-white hover:bg-primary-700' 
              : isToday 
                ? 'bg-gray-200 text-gray-900' 
                : isDisabled 
                  ? 'text-gray-400 cursor-not-allowed' 
                  : 'text-gray-700'
          }`}
        >
          {day}
        </button>
      )
    }

    return days
  }

  return (
    <div className={`relative ${className}`} ref={datePickerRef}>
      {/* Input */}
      <input
        type="text"
        value={formatDisplayDate(selectedDate)}
        readOnly
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`w-full px-3 py-2 border border-gray-300   focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 cursor-pointer ${
          disabled ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : 'hover:border-gray-400'
        }`}
        {...props}
      />

      {/* Calendar Dropdown */}
      {isOpen && (
        <div className="absolute z-10 mt-1 bg-white border border-gray-300  shadow-lg p-4 min-w-[280px]">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => navigateMonth(-1)}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h3 className="text-lg font-semibold">
              {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </h3>
            <button
              onClick={() => navigateMonth(1)}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Day Headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {dayNames.map(day => (
              <div key={day} className="h-8 flex items-center justify-center text-sm font-medium text-gray-500">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {renderCalendar()}
          </div>

          {/* Today Button */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <button
              onClick={() => {
                const today = new Date()
                setSelectedDate(today)
                onChange(formatDate(today))
                setIsOpen(false)
              }}
              className="w-full px-3 py-2 text-sm text-primary-600 hover:bg-primary-50 "
            >
              Today
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default DatePicker
