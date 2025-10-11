/**
 * Appointment slot utility functions
 */

/**
 * Generate time slots
 * @param {string} startTime - Start time (HH:MM)
 * @param {string} endTime - End time (HH:MM)
 * @param {number} intervalMinutes - Interval in minutes
 * @returns {array} Array of time slots
 */
export const generateTimeSlots = (startTime, endTime, intervalMinutes = 30) => {
  if (!startTime || !endTime || !intervalMinutes) return []
  
  const slots = []
  const [startHour, startMinute] = startTime.split(':').map(Number)
  const [endHour, endMinute] = endTime.split(':').map(Number)
  
  const startMinutes = startHour * 60 + startMinute
  const endMinutes = endHour * 60 + endMinute
  
  for (let minutes = startMinutes; minutes < endMinutes; minutes += intervalMinutes) {
    const hour = Math.floor(minutes / 60)
    const minute = minutes % 60
    const timeString = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
    
    slots.push({
      time: timeString,
      available: true,
      booked: false
    })
  }
  
  return slots
}

/**
 * Check if time slot is available
 * @param {string} date - Date (YYYY-MM-DD)
 * @param {string} time - Time (HH:MM)
 * @param {array} existingAppointments - Existing appointments
 * @param {number} serviceDuration - Service duration in minutes
 * @returns {boolean} Is slot available
 */
export const isTimeSlotAvailable = (date, time, existingAppointments, serviceDuration = 60) => {
  if (!date || !time || !existingAppointments) return false
  
  const slotStart = new Date(`${date}T${time}`)
  const slotEnd = new Date(slotStart.getTime() + (serviceDuration * 60 * 1000))
  
  return !existingAppointments.some(appointment => {
    if (appointment.date !== date) return false
    
    const aptStart = new Date(`${appointment.date}T${appointment.time}`)
    const aptEnd = new Date(aptStart.getTime() + ((appointment.duration || 60) * 60 * 1000))
    
    // Check for overlap
    return (slotStart < aptEnd && slotEnd > aptStart)
  })
}

/**
 * Get available time slots for date
 * @param {string} date - Date (YYYY-MM-DD)
 * @param {object} businessHours - Business hours
 * @param {array} existingAppointments - Existing appointments
 * @param {number} serviceDuration - Service duration in minutes
 * @param {number} intervalMinutes - Interval in minutes
 * @returns {array} Available time slots
 */
export const getAvailableTimeSlots = (date, businessHours, existingAppointments, serviceDuration = 60, intervalMinutes = 30) => {
  if (!date || !businessHours) return []
  
  const dayOfWeek = new Date(date).toLocaleDateString('en-US', { weekday: 'lowercase' })
  const dayHours = businessHours[dayOfWeek]
  
  if (!dayHours || !dayHours.open) return []
  
  const allSlots = generateTimeSlots(dayHours.open, dayHours.close, intervalMinutes)
  
  return allSlots.map(slot => ({
    ...slot,
    available: isTimeSlotAvailable(date, slot.time, existingAppointments, serviceDuration),
    booked: !isTimeSlotAvailable(date, slot.time, existingAppointments, serviceDuration)
  }))
}

/**
 * Check if time slot conflicts with existing appointment
 * @param {string} date - Date (YYYY-MM-DD)
 * @param {string} time - Time (HH:MM)
 * @param {number} duration - Duration in minutes
 * @param {array} existingAppointments - Existing appointments
 * @param {string} excludeAppointmentId - Appointment ID to exclude from conflict check
 * @returns {boolean} Has conflict
 */
export const hasTimeSlotConflict = (date, time, duration, existingAppointments, excludeAppointmentId = null) => {
  if (!date || !time || !duration || !existingAppointments) return false
  
  const slotStart = new Date(`${date}T${time}`)
  const slotEnd = new Date(slotStart.getTime() + (duration * 60 * 1000))
  
  return existingAppointments.some(appointment => {
    if (excludeAppointmentId && appointment.id === excludeAppointmentId) return false
    if (appointment.date !== date) return false
    
    const aptStart = new Date(`${appointment.date}T${appointment.time}`)
    const aptEnd = new Date(aptStart.getTime() + ((appointment.duration || 60) * 60 * 1000))
    
    // Check for overlap
    return (slotStart < aptEnd && slotEnd > aptStart)
  })
}

/**
 * Find next available time slot
 * @param {string} date - Date (YYYY-MM-DD)
 * @param {string} preferredTime - Preferred time (HH:MM)
 * @param {object} businessHours - Business hours
 * @param {array} existingAppointments - Existing appointments
 * @param {number} serviceDuration - Service duration in minutes
 * @param {number} intervalMinutes - Interval in minutes
 * @returns {string|null} Next available time slot
 */
export const findNextAvailableTimeSlot = (date, preferredTime, businessHours, existingAppointments, serviceDuration = 60, intervalMinutes = 30) => {
  if (!date || !businessHours) return null
  
  const dayOfWeek = new Date(date).toLocaleDateString('en-US', { weekday: 'lowercase' })
  const dayHours = businessHours[dayOfWeek]
  
  if (!dayHours || !dayHours.open) return null
  
  const availableSlots = getAvailableTimeSlots(date, businessHours, existingAppointments, serviceDuration, intervalMinutes)
  
  if (preferredTime) {
    // Try to find preferred time first
    const preferredSlot = availableSlots.find(slot => slot.time === preferredTime && slot.available)
    if (preferredSlot) return preferredSlot.time
    
    // Find closest available time to preferred time
    const [preferredHour, preferredMinute] = preferredTime.split(':').map(Number)
    const preferredMinutes = preferredHour * 60 + preferredMinute
    
    const closestSlot = availableSlots
      .filter(slot => slot.available)
      .reduce((closest, slot) => {
        const [slotHour, slotMinute] = slot.time.split(':').map(Number)
        const slotMinutes = slotHour * 60 + slotMinute
        const closestMinutes = closest ? closest.time.split(':').map(Number).reduce((h, m) => h * 60 + m) : Infinity
        
        return Math.abs(slotMinutes - preferredMinutes) < Math.abs(closestMinutes - preferredMinutes) ? slot : closest
      }, null)
    
    if (closestSlot) return closestSlot.time
  }
  
  // Return first available slot
  const firstAvailable = availableSlots.find(slot => slot.available)
  return firstAvailable ? firstAvailable.time : null
}

/**
 * Get time slot recommendations
 * @param {string} date - Date (YYYY-MM-DD)
 * @param {object} businessHours - Business hours
 * @param {array} existingAppointments - Existing appointments
 * @param {number} serviceDuration - Service duration in minutes
 * @param {number} intervalMinutes - Interval in minutes
 * @param {number} maxRecommendations - Maximum number of recommendations
 * @returns {array} Recommended time slots
 */
export const getTimeSlotRecommendations = (date, businessHours, existingAppointments, serviceDuration = 60, intervalMinutes = 30, maxRecommendations = 5) => {
  if (!date || !businessHours) return []
  
  const availableSlots = getAvailableTimeSlots(date, businessHours, existingAppointments, serviceDuration, intervalMinutes)
  const availableOnly = availableSlots.filter(slot => slot.available)
  
  // Sort by time and return top recommendations
  return availableOnly
    .sort((a, b) => a.time.localeCompare(b.time))
    .slice(0, maxRecommendations)
    .map(slot => slot.time)
}

/**
 * Check if time slot is in business hours
 * @param {string} time - Time (HH:MM)
 * @param {object} businessHours - Business hours
 * @param {string} dayOfWeek - Day of week
 * @returns {boolean} Is in business hours
 */
export const isTimeSlotInBusinessHours = (time, businessHours, dayOfWeek) => {
  if (!time || !businessHours || !dayOfWeek) return false
  
  const dayHours = businessHours[dayOfWeek]
  if (!dayHours || !dayHours.open || !dayHours.close) return false
  
  return time >= dayHours.open && time <= dayHours.close
}

/**
 * Get time slot duration
 * @param {string} startTime - Start time (HH:MM)
 * @param {string} endTime - End time (HH:MM)
 * @returns {number} Duration in minutes
 */
export const getTimeSlotDuration = (startTime, endTime) => {
  if (!startTime || !endTime) return 0
  
  const [startHour, startMinute] = startTime.split(':').map(Number)
  const [endHour, endMinute] = endTime.split(':').map(Number)
  
  const startMinutes = startHour * 60 + startMinute
  const endMinutes = endHour * 60 + endMinute
  
  return endMinutes - startMinutes
}

/**
 * Format time slot for display
 * @param {string} time - Time (HH:MM)
 * @param {string} format - Format to use
 * @returns {string} Formatted time slot
 */
export const formatTimeSlot = (time, format = '12hour') => {
  if (!time || typeof time !== 'string') return ''
  
  const [hours, minutes] = time.split(':').map(Number)
  
  switch (format) {
    case '12hour':
      const period = hours >= 12 ? 'PM' : 'AM'
      const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours
      return `${displayHours}:${String(minutes).padStart(2, '0')} ${period}`
    case '24hour':
      return time
    case 'readable':
      const periodReadable = hours >= 12 ? 'PM' : 'AM'
      const displayHoursReadable = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours
      return `${displayHoursReadable}:${String(minutes).padStart(2, '0')} ${periodReadable}`
    default:
      return time
  }
}

/**
 * Get time slot status
 * @param {string} date - Date (YYYY-MM-DD)
 * @param {string} time - Time (HH:MM)
 * @param {array} existingAppointments - Existing appointments
 * @param {number} serviceDuration - Service duration in minutes
 * @returns {string} Slot status
 */
export const getTimeSlotStatus = (date, time, existingAppointments, serviceDuration = 60) => {
  if (!date || !time || !existingAppointments) return 'unknown'
  
  if (isTimeSlotAvailable(date, time, existingAppointments, serviceDuration)) {
    return 'available'
  }
  
  return 'booked'
}

/**
 * Get time slot color
 * @param {string} status - Slot status
 * @returns {string} Color class
 */
export const getTimeSlotColor = (status) => {
  const colorMap = {
    available: 'green',
    booked: 'red',
    unavailable: 'gray',
    selected: 'blue',
    unknown: 'gray'
  }
  
  return colorMap[status] || 'gray'
}

/**
 * Validate time slot
 * @param {string} time - Time (HH:MM)
 * @returns {boolean} Is valid time slot
 */
export const isValidTimeSlot = (time) => {
  if (!time || typeof time !== 'string') return false
  
  const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
  return timeRegex.test(time)
}

/**
 * Get time slot intervals
 * @param {number} intervalMinutes - Interval in minutes
 * @returns {array} Available intervals
 */
export const getTimeSlotIntervals = (intervalMinutes = 30) => {
  const intervals = [15, 30, 45, 60, 90, 120]
  return intervals.filter(interval => interval >= intervalMinutes)
}

/**
 * Calculate time slot capacity
 * @param {string} startTime - Start time (HH:MM)
 * @param {string} endTime - End time (HH:MM)
 * @param {number} serviceDuration - Service duration in minutes
 * @param {number} intervalMinutes - Interval in minutes
 * @returns {number} Number of slots that can fit
 */
export const calculateTimeSlotCapacity = (startTime, endTime, serviceDuration, intervalMinutes = 30) => {
  if (!startTime || !endTime || !serviceDuration) return 0
  
  const totalDuration = getTimeSlotDuration(startTime, endTime)
  return Math.floor(totalDuration / serviceDuration)
}

/**
 * Time slot constants
 */
export const TIME_SLOT_CONSTANTS = {
  INTERVALS: {
    FIFTEEN_MINUTES: 15,
    THIRTY_MINUTES: 30,
    FORTY_FIVE_MINUTES: 45,
    ONE_HOUR: 60,
    NINETY_MINUTES: 90,
    TWO_HOURS: 120
  },
  STATUSES: {
    AVAILABLE: 'available',
    BOOKED: 'booked',
    UNAVAILABLE: 'unavailable',
    SELECTED: 'selected',
    UNKNOWN: 'unknown'
  },
  FORMATS: {
    TWELVE_HOUR: '12hour',
    TWENTY_FOUR_HOUR: '24hour',
    READABLE: 'readable'
  },
  COLORS: {
    GREEN: 'green',
    RED: 'red',
    GRAY: 'gray',
    BLUE: 'blue'
  }
}

export default {
  generateTimeSlots,
  isTimeSlotAvailable,
  getAvailableTimeSlots,
  hasTimeSlotConflict,
  findNextAvailableTimeSlot,
  getTimeSlotRecommendations,
  isTimeSlotInBusinessHours,
  getTimeSlotDuration,
  formatTimeSlot,
  getTimeSlotStatus,
  getTimeSlotColor,
  isValidTimeSlot,
  getTimeSlotIntervals,
  calculateTimeSlotCapacity,
  TIME_SLOT_CONSTANTS
}
