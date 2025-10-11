/**
 * Staff utility functions
 */

/**
 * Format staff name
 * @param {string} firstName - First name
 * @param {string} lastName - Last name
 * @param {string} format - Format to use
 * @returns {string} Formatted name
 */
export const formatStaffName = (firstName, lastName, format = 'full') => {
  if (!firstName || !lastName) return ''
  
  const first = firstName.trim()
  const last = lastName.trim()
  
  switch (format) {
    case 'full':
      return `${first} ${last}`
    case 'last-first':
      return `${last}, ${first}`
    case 'first':
      return first
    case 'last':
      return last
    case 'initials':
      return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase()
    default:
      return `${first} ${last}`
  }
}

/**
 * Validate staff name
 * @param {string} firstName - First name
 * @param {string} lastName - Last name
 * @returns {boolean} Is valid staff name
 */
export const isValidStaffName = (firstName, lastName) => {
  if (!firstName || !lastName) return false
  return firstName.trim().length >= 2 && lastName.trim().length >= 2
}

/**
 * Validate staff email
 * @param {string} email - Staff email
 * @returns {boolean} Is valid staff email
 */
export const isValidStaffEmail = (email) => {
  if (!email || typeof email !== 'string') return false
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Validate staff phone
 * @param {string} phone - Staff phone
 * @returns {boolean} Is valid staff phone
 */
export const isValidStaffPhone = (phone) => {
  if (!phone || typeof phone !== 'string') return false
  
  const digits = phone.replace(/\D/g, '')
  return digits.length === 10 || (digits.length === 11 && digits[0] === '1')
}

/**
 * Validate staff role
 * @param {string} role - Staff role
 * @returns {boolean} Is valid staff role
 */
export const isValidStaffRole = (role) => {
  if (!role || typeof role !== 'string') return false
  
  const validRoles = ['manager', 'staff', 'admin', 'supervisor', 'assistant']
  return validRoles.includes(role.toLowerCase())
}

/**
 * Get staff role display name
 * @param {string} role - Staff role
 * @returns {string} Display name
 */
export const getStaffRoleDisplayName = (role) => {
  const roleMap = {
    manager: 'Manager',
    staff: 'Staff Member',
    admin: 'Administrator',
    supervisor: 'Supervisor',
    assistant: 'Assistant'
  }
  
  return roleMap[role] || 'Staff Member'
}

/**
 * Validate staff status
 * @param {string} status - Staff status
 * @returns {boolean} Is valid staff status
 */
export const isValidStaffStatus = (status) => {
  if (!status || typeof status !== 'string') return false
  
  const validStatuses = ['active', 'inactive', 'suspended', 'terminated']
  return validStatuses.includes(status.toLowerCase())
}

/**
 * Get staff status display name
 * @param {string} status - Staff status
 * @returns {string} Display name
 */
export const getStaffStatusDisplayName = (status) => {
  const statusMap = {
    active: 'Active',
    inactive: 'Inactive',
    suspended: 'Suspended',
    terminated: 'Terminated'
  }
  
  return statusMap[status] || 'Unknown'
}

/**
 * Calculate staff performance
 * @param {object} staff - Staff data
 * @returns {object} Performance metrics
 */
export const calculateStaffPerformance = (staff) => {
  if (!staff || typeof staff !== 'object') return {}
  
  const { appointments, reviews, services } = staff
  
  const totalAppointments = appointments?.length || 0
  const completedAppointments = appointments?.filter(apt => apt.status === 'completed').length || 0
  const cancelledAppointments = appointments?.filter(apt => apt.status === 'cancelled').length || 0
  const noShowAppointments = appointments?.filter(apt => apt.status === 'no-show').length || 0
  
  const totalReviews = reviews?.length || 0
  const averageRating = totalReviews > 0 ? 
    reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews : 0
  
  const totalServices = services?.length || 0
  
  return {
    totalAppointments,
    completedAppointments,
    cancelledAppointments,
    noShowAppointments,
    completionRate: totalAppointments > 0 ? (completedAppointments / totalAppointments) * 100 : 0,
    cancellationRate: totalAppointments > 0 ? (cancelledAppointments / totalAppointments) * 100 : 0,
    noShowRate: totalAppointments > 0 ? (noShowAppointments / totalAppointments) * 100 : 0,
    totalReviews,
    averageRating: Math.round(averageRating * 10) / 10,
    totalServices,
    productivity: totalAppointments > 0 ? completedAppointments / totalAppointments : 0
  }
}

/**
 * Calculate staff availability
 * @param {object} staff - Staff data
 * @param {Date} date - Date to check
 * @returns {boolean} Is staff available
 */
export const isStaffAvailable = (staff, date = new Date()) => {
  if (!staff || typeof staff !== 'object') return false
  
  const { schedule, status } = staff
  
  if (status !== 'active') return false
  
  if (!schedule || typeof schedule !== 'object') return true
  
  const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
  const currentDay = dayNames[date.getDay()]
  const currentTime = date.toTimeString().slice(0, 5)
  
  const daySchedule = schedule[currentDay]
  if (!daySchedule || !daySchedule.open) return false
  
  return currentTime >= daySchedule.open && currentTime <= daySchedule.close
}

/**
 * Get staff working hours
 * @param {object} staff - Staff data
 * @param {string} day - Day of week
 * @returns {object} Working hours
 */
export const getStaffWorkingHours = (staff, day) => {
  if (!staff || !day) return null
  
  const { schedule } = staff
  if (!schedule || typeof schedule !== 'object') return null
  
  return schedule[day.toLowerCase()] || null
}

/**
 * Calculate staff workload
 * @param {object} staff - Staff data
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @returns {object} Workload metrics
 */
export const calculateStaffWorkload = (staff, startDate, endDate) => {
  if (!staff || !startDate || !endDate) return {}
  
  const { appointments } = staff
  if (!appointments || !Array.isArray(appointments)) return {}
  
  const filteredAppointments = appointments.filter(apt => {
    const aptDate = new Date(apt.date)
    return aptDate >= startDate && aptDate <= endDate
  })
  
  const totalAppointments = filteredAppointments.length
  const totalHours = filteredAppointments.reduce((sum, apt) => {
    const service = apt.service
    return sum + (service?.duration || 0)
  }, 0) / 60 // Convert minutes to hours
  
  return {
    totalAppointments,
    totalHours,
    averageAppointmentsPerDay: totalAppointments / Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)),
    averageHoursPerDay: totalHours / Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24))
  }
}

/**
 * Get staff skills
 * @param {object} staff - Staff data
 * @returns {array} Staff skills
 */
export const getStaffSkills = (staff) => {
  if (!staff || typeof staff !== 'object') return []
  
  const { services, certifications, specializations } = staff
  
  const skills = []
  
  if (services && Array.isArray(services)) {
    skills.push(...services.map(service => service.name))
  }
  
  if (certifications && Array.isArray(certifications)) {
    skills.push(...certifications.map(cert => cert.name))
  }
  
  if (specializations && Array.isArray(specializations)) {
    skills.push(...specializations)
  }
  
  return [...new Set(skills)] // Remove duplicates
}

/**
 * Sort staff by criteria
 * @param {array} staff - Staff to sort
 * @param {string} criteria - Sort criteria
 * @param {string} direction - Sort direction
 * @returns {array} Sorted staff
 */
export const sortStaff = (staff, criteria = 'name', direction = 'asc') => {
  if (!staff || !Array.isArray(staff)) return []
  
  return [...staff].sort((a, b) => {
    let aValue, bValue
    
    switch (criteria) {
      case 'name':
        aValue = formatStaffName(a.firstName, a.lastName).toLowerCase()
        bValue = formatStaffName(b.firstName, b.lastName).toLowerCase()
        break
      case 'role':
        aValue = a.role?.toLowerCase() || ''
        bValue = b.role?.toLowerCase() || ''
        break
      case 'status':
        aValue = a.status?.toLowerCase() || ''
        bValue = b.status?.toLowerCase() || ''
        break
      case 'performance':
        aValue = calculateStaffPerformance(a).completionRate || 0
        bValue = calculateStaffPerformance(b).completionRate || 0
        break
      case 'rating':
        aValue = calculateStaffPerformance(a).averageRating || 0
        bValue = calculateStaffPerformance(b).averageRating || 0
        break
      case 'appointments':
        aValue = calculateStaffPerformance(a).totalAppointments || 0
        bValue = calculateStaffPerformance(b).totalAppointments || 0
        break
      default:
        aValue = formatStaffName(a.firstName, a.lastName).toLowerCase()
        bValue = formatStaffName(b.firstName, b.lastName).toLowerCase()
    }
    
    if (direction === 'desc') {
      return bValue > aValue ? 1 : bValue < aValue ? -1 : 0
    }
    
    return aValue > bValue ? 1 : aValue < bValue ? -1 : 0
  })
}

/**
 * Filter staff by criteria
 * @param {array} staff - Staff to filter
 * @param {object} filters - Filter criteria
 * @returns {array} Filtered staff
 */
export const filterStaff = (staff, filters = {}) => {
  if (!staff || !Array.isArray(staff)) return []
  
  return staff.filter(member => {
    if (filters.role && member.role !== filters.role) return false
    if (filters.status && member.status !== filters.status) return false
    if (filters.search && !formatStaffName(member.firstName, member.lastName).toLowerCase().includes(filters.search.toLowerCase())) return false
    if (filters.skill && !getStaffSkills(member).some(skill => skill.toLowerCase().includes(filters.skill.toLowerCase()))) return false
    if (filters.available && !isStaffAvailable(member)) return false
    
    return true
  })
}

/**
 * Get staff recommendations
 * @param {array} staff - Available staff
 * @param {object} service - Service data
 * @param {number} limit - Maximum recommendations
 * @returns {array} Recommended staff
 */
export const getStaffRecommendations = (staff, service, limit = 5) => {
  if (!staff || !Array.isArray(staff) || !service) return []
  
  const recommendations = staff
    .filter(member => {
      if (member.status !== 'active') return false
      if (!member.services || !Array.isArray(member.services)) return false
      return member.services.some(s => s.id === service.id)
    })
    .map(member => ({
      ...member,
      score: calculateStaffPerformance(member).completionRate
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
  
  return recommendations
}

/**
 * Validate staff schedule
 * @param {object} schedule - Staff schedule
 * @returns {boolean} Is valid schedule
 */
export const isValidStaffSchedule = (schedule) => {
  if (!schedule || typeof schedule !== 'object') return false
  
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
  
  return days.every(day => {
    const daySchedule = schedule[day]
    if (!daySchedule) return true // No schedule is valid
    
    return daySchedule.open && daySchedule.close && 
           typeof daySchedule.open === 'string' && 
           typeof daySchedule.close === 'string'
  })
}

/**
 * Format staff schedule
 * @param {object} schedule - Staff schedule
 * @param {string} format - Format to use
 * @returns {string} Formatted schedule
 */
export const formatStaffSchedule = (schedule, format = 'full') => {
  if (!schedule || typeof schedule !== 'object') return ''
  
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
  const dayNames = {
    monday: 'Monday',
    tuesday: 'Tuesday',
    wednesday: 'Wednesday',
    thursday: 'Thursday',
    friday: 'Friday',
    saturday: 'Saturday',
    sunday: 'Sunday'
  }
  
  if (format === 'summary') {
    const workingDays = days.filter(day => schedule[day] && schedule[day].open)
    const offDays = days.filter(day => !schedule[day] || !schedule[day].open)
    
    if (workingDays.length === 7) return '7 days a week'
    if (workingDays.length === 5 && !workingDays.includes('saturday') && !workingDays.includes('sunday')) {
      return 'Monday - Friday'
    }
    if (offDays.length === 1) {
      return `Off ${dayNames[offDays[0]]}`
    }
    
    return `${workingDays.length} days a week`
  }
  
  return days.map(day => {
    const daySchedule = schedule[day]
    const dayName = dayNames[day]
    
    if (!daySchedule || !daySchedule.open) {
      return `${dayName}: Off`
    }
    
    return `${dayName}: ${daySchedule.open} - ${daySchedule.close}`
  }).join('\n')
}

/**
 * Staff constants
 */
export const STAFF_CONSTANTS = {
  ROLES: {
    MANAGER: 'manager',
    STAFF: 'staff',
    ADMIN: 'admin',
    SUPERVISOR: 'supervisor',
    ASSISTANT: 'assistant'
  },
  STATUSES: {
    ACTIVE: 'active',
    INACTIVE: 'inactive',
    SUSPENDED: 'suspended',
    TERMINATED: 'terminated'
  },
  NAME_FORMATS: {
    FULL: 'full',
    LAST_FIRST: 'last-first',
    FIRST: 'first',
    LAST: 'last',
    INITIALS: 'initials'
  },
  SORT_CRITERIA: {
    NAME: 'name',
    ROLE: 'role',
    STATUS: 'status',
    PERFORMANCE: 'performance',
    RATING: 'rating',
    APPOINTMENTS: 'appointments'
  },
  SORT_DIRECTIONS: {
    ASC: 'asc',
    DESC: 'desc'
  },
  SCHEDULE_FORMATS: {
    FULL: 'full',
    SUMMARY: 'summary'
  }
}

export default {
  formatStaffName,
  isValidStaffName,
  isValidStaffEmail,
  isValidStaffPhone,
  isValidStaffRole,
  getStaffRoleDisplayName,
  isValidStaffStatus,
  getStaffStatusDisplayName,
  calculateStaffPerformance,
  isStaffAvailable,
  getStaffWorkingHours,
  calculateStaffWorkload,
  getStaffSkills,
  sortStaff,
  filterStaff,
  getStaffRecommendations,
  isValidStaffSchedule,
  formatStaffSchedule,
  STAFF_CONSTANTS
}
