/**
 * Date utility functions
 */

/**
 * Get current date
 * @returns {Date} Current date
 */
export const getCurrentDate = () => {
  return new Date()
}

/**
 * Get current date as string
 * @param {string} format - Date format ('ISO', 'US', 'EU')
 * @returns {string} Current date string
 */
export const getCurrentDateString = (format = 'ISO') => {
  const date = getCurrentDate()
  
  switch (format) {
    case 'ISO':
      return date.toISOString().split('T')[0]
    case 'US':
      return date.toLocaleDateString('en-US')
    case 'EU':
      return date.toLocaleDateString('en-GB')
    default:
      return date.toISOString().split('T')[0]
  }
}

/**
 * Get date from string
 * @param {string} dateString - Date string
 * @returns {Date|null} Date object or null if invalid
 */
export const getDateFromString = (dateString) => {
  if (!dateString) return null
  
  const date = new Date(dateString)
  return isNaN(date.getTime()) ? null : date
}

/**
 * Format date to string
 * @param {Date|string} date - Date to format
 * @param {string} format - Format type ('ISO', 'US', 'EU', 'custom')
 * @param {string} customFormat - Custom format string
 * @returns {string} Formatted date string
 */
export const formatDateToString = (date, format = 'ISO', customFormat = '') => {
  if (!date) return ''
  
  const dateObj = new Date(date)
  if (isNaN(dateObj.getTime())) return ''
  
  switch (format) {
    case 'ISO':
      return dateObj.toISOString().split('T')[0]
    case 'US':
      return dateObj.toLocaleDateString('en-US')
    case 'EU':
      return dateObj.toLocaleDateString('en-GB')
    case 'custom':
      return formatCustomDate(dateObj, customFormat)
    default:
      return dateObj.toISOString().split('T')[0]
  }
}

/**
 * Add days to date
 * @param {Date|string} date - Base date
 * @param {number} days - Number of days to add
 * @returns {Date} New date
 */
export const addDays = (date, days) => {
  const dateObj = new Date(date)
  dateObj.setDate(dateObj.getDate() + days)
  return dateObj
}

/**
 * Subtract days from date
 * @param {Date|string} date - Base date
 * @param {number} days - Number of days to subtract
 * @returns {Date} New date
 */
export const subtractDays = (date, days) => {
  return addDays(date, -days)
}

/**
 * Add months to date
 * @param {Date|string} date - Base date
 * @param {number} months - Number of months to add
 * @returns {Date} New date
 */
export const addMonths = (date, months) => {
  const dateObj = new Date(date)
  dateObj.setMonth(dateObj.getMonth() + months)
  return dateObj
}

/**
 * Subtract months from date
 * @param {Date|string} date - Base date
 * @param {number} months - Number of months to subtract
 * @returns {Date} New date
 */
export const subtractMonths = (date, months) => {
  return addMonths(date, -months)
}

/**
 * Add years to date
 * @param {Date|string} date - Base date
 * @param {number} years - Number of years to add
 * @returns {Date} New date
 */
export const addYears = (date, years) => {
  const dateObj = new Date(date)
  dateObj.setFullYear(dateObj.getFullYear() + years)
  return dateObj
}

/**
 * Subtract years from date
 * @param {Date|string} date - Base date
 * @param {number} years - Number of years to subtract
 * @returns {Date} New date
 */
export const subtractYears = (date, years) => {
  return addYears(date, -years)
}

/**
 * Get start of day
 * @param {Date|string} date - Date
 * @returns {Date} Start of day
 */
export const getStartOfDay = (date) => {
  const dateObj = new Date(date)
  dateObj.setHours(0, 0, 0, 0)
  return dateObj
}

/**
 * Get end of day
 * @param {Date|string} date - Date
 * @returns {Date} End of day
 */
export const getEndOfDay = (date) => {
  const dateObj = new Date(date)
  dateObj.setHours(23, 59, 59, 999)
  return dateObj
}

/**
 * Get start of week
 * @param {Date|string} date - Date
 * @param {number} startDay - Start day of week (0 = Sunday, 1 = Monday)
 * @returns {Date} Start of week
 */
export const getStartOfWeek = (date, startDay = 1) => {
  const dateObj = new Date(date)
  const day = dateObj.getDay()
  const diff = day - startDay
  const startOfWeek = new Date(dateObj)
  startOfWeek.setDate(dateObj.getDate() - diff)
  return getStartOfDay(startOfWeek)
}

/**
 * Get end of week
 * @param {Date|string} date - Date
 * @param {number} startDay - Start day of week (0 = Sunday, 1 = Monday)
 * @returns {Date} End of week
 */
export const getEndOfWeek = (date, startDay = 1) => {
  const startOfWeek = getStartOfWeek(date, startDay)
  return getEndOfDay(addDays(startOfWeek, 6))
}

/**
 * Get start of month
 * @param {Date|string} date - Date
 * @returns {Date} Start of month
 */
export const getStartOfMonth = (date) => {
  const dateObj = new Date(date)
  dateObj.setDate(1)
  return getStartOfDay(dateObj)
}

/**
 * Get end of month
 * @param {Date|string} date - Date
 * @returns {Date} End of month
 */
export const getEndOfMonth = (date) => {
  const dateObj = new Date(date)
  dateObj.setMonth(dateObj.getMonth() + 1, 0)
  return getEndOfDay(dateObj)
}

/**
 * Get start of year
 * @param {Date|string} date - Date
 * @returns {Date} Start of year
 */
export const getStartOfYear = (date) => {
  const dateObj = new Date(date)
  dateObj.setMonth(0, 1)
  return getStartOfDay(dateObj)
}

/**
 * Get end of year
 * @param {Date|string} date - Date
 * @returns {Date} End of year
 */
export const getEndOfYear = (date) => {
  const dateObj = new Date(date)
  dateObj.setMonth(11, 31)
  return getEndOfDay(dateObj)
}

/**
 * Check if date is today
 * @param {Date|string} date - Date to check
 * @returns {boolean} True if date is today
 */
export const isToday = (date) => {
  const dateObj = new Date(date)
  const today = getCurrentDate()
  
  return dateObj.toDateString() === today.toDateString()
}

/**
 * Check if date is yesterday
 * @param {Date|string} date - Date to check
 * @returns {boolean} True if date is yesterday
 */
export const isYesterday = (date) => {
  const dateObj = new Date(date)
  const yesterday = subtractDays(getCurrentDate(), 1)
  
  return dateObj.toDateString() === yesterday.toDateString()
}

/**
 * Check if date is tomorrow
 * @param {Date|string} date - Date to check
 * @returns {boolean} True if date is tomorrow
 */
export const isTomorrow = (date) => {
  const dateObj = new Date(date)
  const tomorrow = addDays(getCurrentDate(), 1)
  
  return dateObj.toDateString() === tomorrow.toDateString()
}

/**
 * Check if date is in the past
 * @param {Date|string} date - Date to check
 * @returns {boolean} True if date is in the past
 */
export const isPast = (date) => {
  const dateObj = new Date(date)
  const today = getCurrentDate()
  
  return dateObj < today
}

/**
 * Check if date is in the future
 * @param {Date|string} date - Date to check
 * @returns {boolean} True if date is in the future
 */
export const isFuture = (date) => {
  const dateObj = new Date(date)
  const today = getCurrentDate()
  
  return dateObj > today
}

/**
 * Check if date is weekend
 * @param {Date|string} date - Date to check
 * @returns {boolean} True if date is weekend
 */
export const isWeekend = (date) => {
  const dateObj = new Date(date)
  const day = dateObj.getDay()
  
  return day === 0 || day === 6 // Sunday or Saturday
}

/**
 * Check if date is weekday
 * @param {Date|string} date - Date to check
 * @returns {boolean} True if date is weekday
 */
export const isWeekday = (date) => {
  return !isWeekend(date)
}

/**
 * Get day of week
 * @param {Date|string} date - Date
 * @returns {number} Day of week (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
 */
export const getDayOfWeek = (date) => {
  const dateObj = new Date(date)
  return dateObj.getDay()
}

/**
 * Get day name
 * @param {Date|string} date - Date
 * @param {string} format - Format ('short', 'long')
 * @returns {string} Day name
 */
export const getDayName = (date, format = 'long') => {
  const dateObj = new Date(date)
  
  if (format === 'short') {
    return dateObj.toLocaleDateString('en-US', { weekday: 'short' })
  } else {
    return dateObj.toLocaleDateString('en-US', { weekday: 'long' })
  }
}

/**
 * Get month name
 * @param {Date|string} date - Date
 * @param {string} format - Format ('short', 'long')
 * @returns {string} Month name
 */
export const getMonthName = (date, format = 'long') => {
  const dateObj = new Date(date)
  
  if (format === 'short') {
    return dateObj.toLocaleDateString('en-US', { month: 'short' })
  } else {
    return dateObj.toLocaleDateString('en-US', { month: 'long' })
  }
}

/**
 * Get days between two dates
 * @param {Date|string} startDate - Start date
 * @param {Date|string} endDate - End date
 * @returns {number} Number of days between dates
 */
export const getDaysBetween = (startDate, endDate) => {
  const start = new Date(startDate)
  const end = new Date(endDate)
  
  const diffTime = Math.abs(end - start)
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

/**
 * Get months between two dates
 * @param {Date|string} startDate - Start date
 * @param {Date|string} endDate - End date
 * @returns {number} Number of months between dates
 */
export const getMonthsBetween = (startDate, endDate) => {
  const start = new Date(startDate)
  const end = new Date(endDate)
  
  const yearDiff = end.getFullYear() - start.getFullYear()
  const monthDiff = end.getMonth() - start.getMonth()
  
  return yearDiff * 12 + monthDiff
}

/**
 * Get years between two dates
 * @param {Date|string} startDate - Start date
 * @param {Date|string} endDate - End date
 * @returns {number} Number of years between dates
 */
export const getYearsBetween = (startDate, endDate) => {
  const start = new Date(startDate)
  const end = new Date(endDate)
  
  return end.getFullYear() - start.getFullYear()
}

/**
 * Check if two dates are the same day
 * @param {Date|string} date1 - First date
 * @param {Date|string} date2 - Second date
 * @returns {boolean} True if dates are the same day
 */
export const isSameDay = (date1, date2) => {
  const d1 = new Date(date1)
  const d2 = new Date(date2)
  
  return d1.toDateString() === d2.toDateString()
}

/**
 * Check if two dates are the same month
 * @param {Date|string} date1 - First date
 * @param {Date|string} date2 - Second date
 * @returns {boolean} True if dates are the same month
 */
export const isSameMonth = (date1, date2) => {
  const d1 = new Date(date1)
  const d2 = new Date(date2)
  
  return d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth()
}

/**
 * Check if two dates are the same year
 * @param {Date|string} date1 - First date
 * @param {Date|string} date2 - Second date
 * @returns {boolean} True if dates are the same year
 */
export const isSameYear = (date1, date2) => {
  const d1 = new Date(date1)
  const d2 = new Date(date2)
  
  return d1.getFullYear() === d2.getFullYear()
}

/**
 * Get age from birth date
 * @param {Date|string} birthDate - Birth date
 * @returns {number} Age in years
 */
export const getAge = (birthDate) => {
  const birth = new Date(birthDate)
  const today = getCurrentDate()
  
  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--
  }
  
  return age
}

/**
 * Get quarter from date
 * @param {Date|string} date - Date
 * @returns {number} Quarter (1-4)
 */
export const getQuarter = (date) => {
  const dateObj = new Date(date)
  const month = dateObj.getMonth()
  
  return Math.floor(month / 3) + 1
}

/**
 * Get week number from date
 * @param {Date|string} date - Date
 * @returns {number} Week number
 */
export const getWeekNumber = (date) => {
  const dateObj = new Date(date)
  const startOfYear = new Date(dateObj.getFullYear(), 0, 1)
  const days = Math.floor((dateObj - startOfYear) / (24 * 60 * 60 * 1000))
  
  return Math.ceil((days + startOfYear.getDay() + 1) / 7)
}

/**
 * Get date range
 * @param {Date|string} startDate - Start date
 * @param {Date|string} endDate - End date
 * @returns {Date[]} Array of dates in range
 */
export const getDateRange = (startDate, endDate) => {
  const start = new Date(startDate)
  const end = new Date(endDate)
  const dates = []
  
  for (let date = new Date(start); date <= end; date = addDays(date, 1)) {
    dates.push(new Date(date))
  }
  
  return dates
}

/**
 * Get business days between two dates
 * @param {Date|string} startDate - Start date
 * @param {Date|string} endDate - End date
 * @returns {number} Number of business days
 */
export const getBusinessDaysBetween = (startDate, endDate) => {
  const dates = getDateRange(startDate, endDate)
  return dates.filter(date => isWeekday(date)).length
}

/**
 * Get next business day
 * @param {Date|string} date - Date
 * @returns {Date} Next business day
 */
export const getNextBusinessDay = (date) => {
  let nextDay = addDays(date, 1)
  
  while (isWeekend(nextDay)) {
    nextDay = addDays(nextDay, 1)
  }
  
  return nextDay
}

/**
 * Get previous business day
 * @param {Date|string} date - Date
 * @returns {Date} Previous business day
 */
export const getPreviousBusinessDay = (date) => {
  let prevDay = subtractDays(date, 1)
  
  while (isWeekend(prevDay)) {
    prevDay = subtractDays(prevDay, 1)
  }
  
  return prevDay
}

/**
 * Format custom date
 * @param {Date} date - Date object
 * @param {string} format - Custom format string
 * @returns {string} Formatted date
 */
const formatCustomDate = (date, format) => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hours = date.getHours()
  const minutes = date.getMinutes()
  const seconds = date.getSeconds()
  
  return format
    .replace('YYYY', year)
    .replace('MM', month.toString().padStart(2, '0'))
    .replace('DD', day.toString().padStart(2, '0'))
    .replace('HH', hours.toString().padStart(2, '0'))
    .replace('mm', minutes.toString().padStart(2, '0'))
    .replace('ss', seconds.toString().padStart(2, '0'))
}

/**
 * Get date constants
 */
export const DATE_CONSTANTS = {
  DAYS_OF_WEEK: {
    SUNDAY: 0,
    MONDAY: 1,
    TUESDAY: 2,
    WEDNESDAY: 3,
    THURSDAY: 4,
    FRIDAY: 5,
    SATURDAY: 6
  },
  MONTHS: {
    JANUARY: 0,
    FEBRUARY: 1,
    MARCH: 2,
    APRIL: 3,
    MAY: 4,
    JUNE: 5,
    JULY: 6,
    AUGUST: 7,
    SEPTEMBER: 8,
    OCTOBER: 9,
    NOVEMBER: 10,
    DECEMBER: 11
  },
  QUARTERS: {
    Q1: 1,
    Q2: 2,
    Q3: 3,
    Q4: 4
  }
}

export default {
  getCurrentDate,
  getCurrentDateString,
  getDateFromString,
  formatDateToString,
  addDays,
  subtractDays,
  addMonths,
  subtractMonths,
  addYears,
  subtractYears,
  getStartOfDay,
  getEndOfDay,
  getStartOfWeek,
  getEndOfWeek,
  getStartOfMonth,
  getEndOfMonth,
  getStartOfYear,
  getEndOfYear,
  isToday,
  isYesterday,
  isTomorrow,
  isPast,
  isFuture,
  isWeekend,
  isWeekday,
  getDayOfWeek,
  getDayName,
  getMonthName,
  getDaysBetween,
  getMonthsBetween,
  getYearsBetween,
  isSameDay,
  isSameMonth,
  isSameYear,
  getAge,
  getQuarter,
  getWeekNumber,
  getDateRange,
  getBusinessDaysBetween,
  getNextBusinessDay,
  getPreviousBusinessDay,
  DATE_CONSTANTS
}
