/**
 * Appointment utility functions
 */

/**
 * Validate appointment data
 * @param {object} appointment - Appointment data
 * @returns {boolean} Is valid appointment
 */
export const isValidAppointment = (appointment) => {
  if (!appointment || typeof appointment !== 'object') return false
  
  const required = ['customerId', 'serviceId', 'staffId', 'date', 'time']
  return required.every(field => appointment[field] !== undefined && appointment[field] !== null)
}

/**
 * Validate appointment date
 * @param {string|Date} date - Appointment date
 * @returns {boolean} Is valid date
 */
export const isValidAppointmentDate = (date) => {
  if (!date) return false
  
  const appointmentDate = new Date(date)
  const now = new Date()
  
  // Check if date is valid
  if (isNaN(appointmentDate.getTime())) return false
  
  // Check if date is not in the past
  if (appointmentDate < now) return false
  
  // Check if date is not too far in the future (e.g., 1 year)
  const oneYearFromNow = new Date(now.getTime() + (365 * 24 * 60 * 60 * 1000))
  if (appointmentDate > oneYearFromNow) return false
  
  return true
}

/**
 * Validate appointment time
 * @param {string} time - Appointment time
 * @returns {boolean} Is valid time
 */
export const isValidAppointmentTime = (time) => {
  if (!time || typeof time !== 'string') return false
  
  const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
  return timeRegex.test(time)
}

/**
 * Validate appointment duration
 * @param {number} duration - Appointment duration in minutes
 * @returns {boolean} Is valid duration
 */
export const isValidAppointmentDuration = (duration) => {
  if (typeof duration !== 'number') return false
  return duration >= 15 && duration <= 480 // 15 minutes to 8 hours
}

/**
 * Validate appointment status
 * @param {string} status - Appointment status
 * @returns {boolean} Is valid status
 */
export const isValidAppointmentStatus = (status) => {
  if (!status || typeof status !== 'string') return false
  
  const validStatuses = ['scheduled', 'confirmed', 'in-progress', 'completed', 'cancelled', 'no-show', 'rescheduled']
  return validStatuses.includes(status.toLowerCase())
}

/**
 * Get appointment status display name
 * @param {string} status - Appointment status
 * @returns {string} Display name
 */
export const getAppointmentStatusDisplayName = (status) => {
  const statusMap = {
    scheduled: 'Scheduled',
    confirmed: 'Confirmed',
    'in-progress': 'In Progress',
    completed: 'Completed',
    cancelled: 'Cancelled',
    'no-show': 'No Show',
    rescheduled: 'Rescheduled'
  }
  
  return statusMap[status] || 'Unknown'
}

/**
 * Get appointment status color
 * @param {string} status - Appointment status
 * @returns {string} Color class
 */
export const getAppointmentStatusColor = (status) => {
  const colorMap = {
    scheduled: 'blue',
    confirmed: 'green',
    'in-progress': 'yellow',
    completed: 'green',
    cancelled: 'red',
    'no-show': 'red',
    rescheduled: 'orange'
  }
  
  return colorMap[status] || 'gray'
}

/**
 * Calculate appointment end time
 * @param {string} startTime - Start time
 * @param {number} duration - Duration in minutes
 * @returns {string} End time
 */
export const calculateAppointmentEndTime = (startTime, duration) => {
  if (!startTime || !duration) return ''
  
  const [hours, minutes] = startTime.split(':').map(Number)
  const startMinutes = hours * 60 + minutes
  const endMinutes = startMinutes + duration
  
  const endHours = Math.floor(endMinutes / 60)
  const endMins = endMinutes % 60
  
  return `${String(endHours).padStart(2, '0')}:${String(endMins).padStart(2, '0')}`
}

/**
 * Check if appointment is in the past
 * @param {object} appointment - Appointment data
 * @returns {boolean} Is in the past
 */
export const isAppointmentInPast = (appointment) => {
  if (!appointment || !appointment.date || !appointment.time) return false
  
  const appointmentDateTime = new Date(`${appointment.date}T${appointment.time}`)
  const now = new Date()
  
  return appointmentDateTime < now
}

/**
 * Check if appointment is today
 * @param {object} appointment - Appointment data
 * @returns {boolean} Is today
 */
export const isAppointmentToday = (appointment) => {
  if (!appointment || !appointment.date) return false
  
  const appointmentDate = new Date(appointment.date)
  const today = new Date()
  
  return appointmentDate.toDateString() === today.toDateString()
}

/**
 * Check if appointment is tomorrow
 * @param {object} appointment - Appointment data
 * @returns {boolean} Is tomorrow
 */
export const isAppointmentTomorrow = (appointment) => {
  if (!appointment || !appointment.date) return false
  
  const appointmentDate = new Date(appointment.date)
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  
  return appointmentDate.toDateString() === tomorrow.toDateString()
}

/**
 * Check if appointment is this week
 * @param {object} appointment - Appointment data
 * @returns {boolean} Is this week
 */
export const isAppointmentThisWeek = (appointment) => {
  if (!appointment || !appointment.date) return false
  
  const appointmentDate = new Date(appointment.date)
  const now = new Date()
  
  const startOfWeek = new Date(now)
  startOfWeek.setDate(now.getDate() - now.getDay())
  startOfWeek.setHours(0, 0, 0, 0)
  
  const endOfWeek = new Date(startOfWeek)
  endOfWeek.setDate(startOfWeek.getDate() + 6)
  endOfWeek.setHours(23, 59, 59, 999)
  
  return appointmentDate >= startOfWeek && appointmentDate <= endOfWeek
}

/**
 * Check if appointment is this month
 * @param {object} appointment - Appointment data
 * @returns {boolean} Is this month
 */
export const isAppointmentThisMonth = (appointment) => {
  if (!appointment || !appointment.date) return false
  
  const appointmentDate = new Date(appointment.date)
  const now = new Date()
  
  return appointmentDate.getMonth() === now.getMonth() && 
         appointmentDate.getFullYear() === now.getFullYear()
}

/**
 * Get appointment relative time
 * @param {object} appointment - Appointment data
 * @returns {string} Relative time description
 */
export const getAppointmentRelativeTime = (appointment) => {
  if (!appointment || !appointment.date) return ''
  
  if (isAppointmentToday(appointment)) return 'Today'
  if (isAppointmentTomorrow(appointment)) return 'Tomorrow'
  if (isAppointmentThisWeek(appointment)) return 'This Week'
  if (isAppointmentThisMonth(appointment)) return 'This Month'
  
  const appointmentDate = new Date(appointment.date)
  const now = new Date()
  const diffTime = appointmentDate - now
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays > 0) {
    return `In ${diffDays} day${diffDays > 1 ? 's' : ''}`
  } else {
    return `${Math.abs(diffDays)} day${Math.abs(diffDays) > 1 ? 's' : ''} ago`
  }
}

/**
 * Format appointment date
 * @param {string|Date} date - Appointment date
 * @param {string} format - Format to use
 * @returns {string} Formatted date
 */
export const formatAppointmentDate = (date, format = 'full') => {
  if (!date) return ''
  
  const appointmentDate = new Date(date)
  
  switch (format) {
    case 'full':
      return appointmentDate.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    case 'short':
      return appointmentDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      })
    case 'date':
      return appointmentDate.toLocaleDateString('en-US')
    case 'time':
      return appointmentDate.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      })
    case 'datetime':
      return appointmentDate.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    default:
      return appointmentDate.toLocaleDateString('en-US')
  }
}

/**
 * Format appointment time
 * @param {string} time - Appointment time
 * @param {string} format - Format to use
 * @returns {string} Formatted time
 */
export const formatAppointmentTime = (time, format = '12hour') => {
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
 * Calculate appointment duration in hours
 * @param {number} durationMinutes - Duration in minutes
 * @returns {number} Duration in hours
 */
export const calculateAppointmentDurationInHours = (durationMinutes) => {
  if (typeof durationMinutes !== 'number') return 0
  return durationMinutes / 60
}

/**
 * Format appointment duration
 * @param {number} durationMinutes - Duration in minutes
 * @param {string} format - Format to use
 * @returns {string} Formatted duration
 */
export const formatAppointmentDuration = (durationMinutes, format = 'readable') => {
  if (typeof durationMinutes !== 'number') return '0 minutes'
  
  const hours = Math.floor(durationMinutes / 60)
  const minutes = durationMinutes % 60
  
  switch (format) {
    case 'readable':
      if (hours === 0) return `${minutes} minutes`
      if (minutes === 0) return `${hours} hour${hours > 1 ? 's' : ''}`
      return `${hours} hour${hours > 1 ? 's' : ''} ${minutes} minutes`
    case 'short':
      if (hours === 0) return `${minutes}m`
      if (minutes === 0) return `${hours}h`
      return `${hours}h ${minutes}m`
    case 'minutes':
      return `${durationMinutes} minutes`
    case 'hours':
      return `${(durationMinutes / 60).toFixed(1)} hours`
    default:
      if (hours === 0) return `${minutes} minutes`
      if (minutes === 0) return `${hours} hour${hours > 1 ? 's' : ''}`
      return `${hours} hour${hours > 1 ? 's' : ''} ${minutes} minutes`
  }
}

/**
 * Sort appointments by criteria
 * @param {array} appointments - Appointments to sort
 * @param {string} criteria - Sort criteria
 * @param {string} direction - Sort direction
 * @returns {array} Sorted appointments
 */
export const sortAppointments = (appointments, criteria = 'date', direction = 'asc') => {
  if (!appointments || !Array.isArray(appointments)) return []
  
  return [...appointments].sort((a, b) => {
    let aValue, bValue
    
    switch (criteria) {
      case 'date':
        aValue = new Date(a.date)
        bValue = new Date(b.date)
        break
      case 'time':
        aValue = a.time || '00:00'
        bValue = b.time || '00:00'
        break
      case 'status':
        aValue = a.status?.toLowerCase() || ''
        bValue = b.status?.toLowerCase() || ''
        break
      case 'customer':
        aValue = a.customer?.name?.toLowerCase() || ''
        bValue = b.customer?.name?.toLowerCase() || ''
        break
      case 'service':
        aValue = a.service?.name?.toLowerCase() || ''
        bValue = b.service?.name?.toLowerCase() || ''
        break
      case 'staff':
        aValue = a.staff?.name?.toLowerCase() || ''
        bValue = b.staff?.name?.toLowerCase() || ''
        break
      case 'duration':
        aValue = a.duration || 0
        bValue = b.duration || 0
        break
      case 'price':
        aValue = a.price || 0
        bValue = b.price || 0
        break
      default:
        aValue = new Date(a.date)
        bValue = new Date(b.date)
    }
    
    if (direction === 'desc') {
      return bValue > aValue ? 1 : bValue < aValue ? -1 : 0
    }
    
    return aValue > bValue ? 1 : aValue < bValue ? -1 : 0
  })
}

/**
 * Filter appointments by criteria
 * @param {array} appointments - Appointments to filter
 * @param {object} filters - Filter criteria
 * @returns {array} Filtered appointments
 */
export const filterAppointments = (appointments, filters = {}) => {
  if (!appointments || !Array.isArray(appointments)) return []
  
  return appointments.filter(appointment => {
    if (filters.status && appointment.status !== filters.status) return false
    if (filters.customerId && appointment.customerId !== filters.customerId) return false
    if (filters.staffId && appointment.staffId !== filters.staffId) return false
    if (filters.serviceId && appointment.serviceId !== filters.serviceId) return false
    if (filters.date && appointment.date !== filters.date) return false
    if (filters.startDate && new Date(appointment.date) < new Date(filters.startDate)) return false
    if (filters.endDate && new Date(appointment.date) > new Date(filters.endDate)) return false
    if (filters.search && !appointment.customer?.name?.toLowerCase().includes(filters.search.toLowerCase())) return false
    
    return true
  })
}

/**
 * Group appointments by criteria
 * @param {array} appointments - Appointments to group
 * @param {string} criteria - Group criteria
 * @returns {object} Grouped appointments
 */
export const groupAppointments = (appointments, criteria = 'date') => {
  if (!appointments || !Array.isArray(appointments)) return {}
  
  return appointments.reduce((groups, appointment) => {
    let key
    
    switch (criteria) {
      case 'date':
        key = appointment.date
        break
      case 'status':
        key = appointment.status
        break
      case 'customer':
        key = appointment.customerId
        break
      case 'staff':
        key = appointment.staffId
        break
      case 'service':
        key = appointment.serviceId
        break
      case 'week':
        const date = new Date(appointment.date)
        const startOfWeek = new Date(date)
        startOfWeek.setDate(date.getDate() - date.getDay())
        key = startOfWeek.toISOString().split('T')[0]
        break
      case 'month':
        const monthDate = new Date(appointment.date)
        key = `${monthDate.getFullYear()}-${String(monthDate.getMonth() + 1).padStart(2, '0')}`
        break
      default:
        key = appointment.date
    }
    
    if (!groups[key]) {
      groups[key] = []
    }
    groups[key].push(appointment)
    
    return groups
  }, {})
}

/**
 * Get appointment statistics
 * @param {array} appointments - Appointments to analyze
 * @returns {object} Appointment statistics
 */
export const getAppointmentStatistics = (appointments) => {
  if (!appointments || !Array.isArray(appointments)) return {}
  
  const total = appointments.length
  const completed = appointments.filter(apt => apt.status === 'completed').length
  const cancelled = appointments.filter(apt => apt.status === 'cancelled').length
  const noShow = appointments.filter(apt => apt.status === 'no-show').length
  const scheduled = appointments.filter(apt => apt.status === 'scheduled').length
  const confirmed = appointments.filter(apt => apt.status === 'confirmed').length
  
  const totalRevenue = appointments
    .filter(apt => apt.status === 'completed')
    .reduce((sum, apt) => sum + (apt.price || 0), 0)
  
  const averageDuration = appointments.length > 0 ?
    appointments.reduce((sum, apt) => sum + (apt.duration || 0), 0) / appointments.length : 0
  
  return {
    total,
    completed,
    cancelled,
    noShow,
    scheduled,
    confirmed,
    completionRate: total > 0 ? (completed / total) * 100 : 0,
    cancellationRate: total > 0 ? (cancelled / total) * 100 : 0,
    noShowRate: total > 0 ? (noShow / total) * 100 : 0,
    totalRevenue,
    averageDuration,
    averageRevenue: completed > 0 ? totalRevenue / completed : 0
  }
}

/**
 * Appointment constants
 */
export const APPOINTMENT_CONSTANTS = {
  STATUSES: {
    SCHEDULED: 'scheduled',
    CONFIRMED: 'confirmed',
    IN_PROGRESS: 'in-progress',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled',
    NO_SHOW: 'no-show',
    RESCHEDULED: 'rescheduled'
  },
  DATE_FORMATS: {
    FULL: 'full',
    SHORT: 'short',
    DATE: 'date',
    TIME: 'time',
    DATETIME: 'datetime'
  },
  TIME_FORMATS: {
    TWELVE_HOUR: '12hour',
    TWENTY_FOUR_HOUR: '24hour',
    READABLE: 'readable'
  },
  DURATION_FORMATS: {
    READABLE: 'readable',
    SHORT: 'short',
    MINUTES: 'minutes',
    HOURS: 'hours'
  },
  SORT_CRITERIA: {
    DATE: 'date',
    TIME: 'time',
    STATUS: 'status',
    CUSTOMER: 'customer',
    SERVICE: 'service',
    STAFF: 'staff',
    DURATION: 'duration',
    PRICE: 'price'
  },
  SORT_DIRECTIONS: {
    ASC: 'asc',
    DESC: 'desc'
  },
  GROUP_CRITERIA: {
    DATE: 'date',
    STATUS: 'status',
    CUSTOMER: 'customer',
    STAFF: 'staff',
    SERVICE: 'service',
    WEEK: 'week',
    MONTH: 'month'
  }
}

export default {
  isValidAppointment,
  isValidAppointmentDate,
  isValidAppointmentTime,
  isValidAppointmentDuration,
  isValidAppointmentStatus,
  getAppointmentStatusDisplayName,
  getAppointmentStatusColor,
  calculateAppointmentEndTime,
  isAppointmentInPast,
  isAppointmentToday,
  isAppointmentTomorrow,
  isAppointmentThisWeek,
  isAppointmentThisMonth,
  getAppointmentRelativeTime,
  formatAppointmentDate,
  formatAppointmentTime,
  calculateAppointmentDurationInHours,
  formatAppointmentDuration,
  sortAppointments,
  filterAppointments,
  groupAppointments,
  getAppointmentStatistics,
  APPOINTMENT_CONSTANTS
}
