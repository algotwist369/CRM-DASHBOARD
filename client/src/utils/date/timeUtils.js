/**
 * Time utility functions
 */

/**
 * Get current time
 * @returns {Date} Current time
 */
export const getCurrentTime = () => {
  return new Date()
}

/**
 * Get current time as string
 * @param {string} format - Time format ('12h', '24h')
 * @returns {string} Current time string
 */
export const getCurrentTimeString = (format = '12h') => {
  const time = getCurrentTime()
  return formatTime(time, format)
}

/**
 * Format time to string
 * @param {Date|string} time - Time to format
 * @param {string} format - Format type ('12h', '24h', 'custom')
 * @param {string} customFormat - Custom format string
 * @returns {string} Formatted time string
 */
export const formatTime = (time, format = '12h', customFormat = '') => {
  if (!time) return ''
  
  const timeObj = new Date(time)
  if (isNaN(timeObj.getTime())) return ''
  
  switch (format) {
    case '12h':
      return timeObj.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      })
    case '24h':
      return timeObj.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      })
    case 'custom':
      return formatCustomTime(timeObj, customFormat)
    default:
      return timeObj.toLocaleTimeString()
  }
}

/**
 * Get time from string
 * @param {string} timeString - Time string (HH:MM or HH:MM:SS)
 * @returns {Date|null} Time object or null if invalid
 */
export const getTimeFromString = (timeString) => {
  if (!timeString) return null
  
  const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/
  if (!timeRegex.test(timeString)) return null
  
  const [hours, minutes, seconds = '00'] = timeString.split(':')
  const time = new Date()
  time.setHours(parseInt(hours), parseInt(minutes), parseInt(seconds), 0)
  
  return time
}

/**
 * Add hours to time
 * @param {Date|string} time - Base time
 * @param {number} hours - Number of hours to add
 * @returns {Date} New time
 */
export const addHours = (time, hours) => {
  const timeObj = new Date(time)
  timeObj.setHours(timeObj.getHours() + hours)
  return timeObj
}

/**
 * Subtract hours from time
 * @param {Date|string} time - Base time
 * @param {number} hours - Number of hours to subtract
 * @returns {Date} New time
 */
export const subtractHours = (time, hours) => {
  return addHours(time, -hours)
}

/**
 * Add minutes to time
 * @param {Date|string} time - Base time
 * @param {number} minutes - Number of minutes to add
 * @returns {Date} New time
 */
export const addMinutes = (time, minutes) => {
  const timeObj = new Date(time)
  timeObj.setMinutes(timeObj.getMinutes() + minutes)
  return timeObj
}

/**
 * Subtract minutes from time
 * @param {Date|string} time - Base time
 * @param {number} minutes - Number of minutes to subtract
 * @returns {Date} New time
 */
export const subtractMinutes = (time, minutes) => {
  return addMinutes(time, -minutes)
}

/**
 * Add seconds to time
 * @param {Date|string} time - Base time
 * @param {number} seconds - Number of seconds to add
 * @returns {Date} New time
 */
export const addSeconds = (time, seconds) => {
  const timeObj = new Date(time)
  timeObj.setSeconds(timeObj.getSeconds() + seconds)
  return timeObj
}

/**
 * Subtract seconds from time
 * @param {Date|string} time - Base time
 * @param {number} seconds - Number of seconds to subtract
 * @returns {Date} New time
 */
export const subtractSeconds = (time, seconds) => {
  return addSeconds(time, -seconds)
}

/**
 * Get hours from time
 * @param {Date|string} time - Time
 * @returns {number} Hours
 */
export const getHours = (time) => {
  const timeObj = new Date(time)
  return timeObj.getHours()
}

/**
 * Get minutes from time
 * @param {Date|string} time - Time
 * @returns {number} Minutes
 */
export const getMinutes = (time) => {
  const timeObj = new Date(time)
  return timeObj.getMinutes()
}

/**
 * Get seconds from time
 * @param {Date|string} time - Time
 * @returns {number} Seconds
 */
export const getSeconds = (time) => {
  const timeObj = new Date(time)
  return timeObj.getSeconds()
}

/**
 * Get milliseconds from time
 * @param {Date|string} time - Time
 * @returns {number} Milliseconds
 */
export const getMilliseconds = (time) => {
  const timeObj = new Date(time)
  return timeObj.getMilliseconds()
}

/**
 * Set hours in time
 * @param {Date|string} time - Base time
 * @param {number} hours - Hours to set
 * @returns {Date} New time
 */
export const setHours = (time, hours) => {
  const timeObj = new Date(time)
  timeObj.setHours(hours)
  return timeObj
}

/**
 * Set minutes in time
 * @param {Date|string} time - Base time
 * @param {number} minutes - Minutes to set
 * @returns {Date} New time
 */
export const setMinutes = (time, minutes) => {
  const timeObj = new Date(time)
  timeObj.setMinutes(minutes)
  return timeObj
}

/**
 * Set seconds in time
 * @param {Date|string} time - Base time
 * @param {number} seconds - Seconds to set
 * @returns {Date} New time
 */
export const setSeconds = (time, seconds) => {
  const timeObj = new Date(time)
  timeObj.setSeconds(seconds)
  return timeObj
}

/**
 * Set milliseconds in time
 * @param {Date|string} time - Base time
 * @param {number} milliseconds - Milliseconds to set
 * @returns {Date} New time
 */
export const setMilliseconds = (time, milliseconds) => {
  const timeObj = new Date(time)
  timeObj.setMilliseconds(milliseconds)
  return timeObj
}

/**
 * Get time difference in milliseconds
 * @param {Date|string} startTime - Start time
 * @param {Date|string} endTime - End time
 * @returns {number} Time difference in milliseconds
 */
export const getTimeDifference = (startTime, endTime) => {
  const start = new Date(startTime)
  const end = new Date(endTime)
  
  return end.getTime() - start.getTime()
}

/**
 * Get time difference in minutes
 * @param {Date|string} startTime - Start time
 * @param {Date|string} endTime - End time
 * @returns {number} Time difference in minutes
 */
export const getTimeDifferenceInMinutes = (startTime, endTime) => {
  const diffMs = getTimeDifference(startTime, endTime)
  return Math.floor(diffMs / (1000 * 60))
}

/**
 * Get time difference in hours
 * @param {Date|string} startTime - Start time
 * @param {Date|string} endTime - End time
 * @returns {number} Time difference in hours
 */
export const getTimeDifferenceInHours = (startTime, endTime) => {
  const diffMs = getTimeDifference(startTime, endTime)
  return Math.floor(diffMs / (1000 * 60 * 60))
}

/**
 * Get time difference in days
 * @param {Date|string} startTime - Start time
 * @param {Date|string} endTime - End time
 * @returns {number} Time difference in days
 */
export const getTimeDifferenceInDays = (startTime, endTime) => {
  const diffMs = getTimeDifference(startTime, endTime)
  return Math.floor(diffMs / (1000 * 60 * 60 * 24))
}

/**
 * Check if time is before another time
 * @param {Date|string} time1 - First time
 * @param {Date|string} time2 - Second time
 * @returns {boolean} True if time1 is before time2
 */
export const isTimeBefore = (time1, time2) => {
  const t1 = new Date(time1)
  const t2 = new Date(time2)
  
  return t1 < t2
}

/**
 * Check if time is after another time
 * @param {Date|string} time1 - First time
 * @param {Date|string} time2 - Second time
 * @returns {boolean} True if time1 is after time2
 */
export const isTimeAfter = (time1, time2) => {
  const t1 = new Date(time1)
  const t2 = new Date(time2)
  
  return t1 > t2
}

/**
 * Check if time is between two times
 * @param {Date|string} time - Time to check
 * @param {Date|string} startTime - Start time
 * @param {Date|string} endTime - End time
 * @returns {boolean} True if time is between start and end
 */
export const isTimeBetween = (time, startTime, endTime) => {
  const t = new Date(time)
  const start = new Date(startTime)
  const end = new Date(endTime)
  
  return t >= start && t <= end
}

/**
 * Check if time is same as another time
 * @param {Date|string} time1 - First time
 * @param {Date|string} time2 - Second time
 * @returns {boolean} True if times are the same
 */
export const isTimeSame = (time1, time2) => {
  const t1 = new Date(time1)
  const t2 = new Date(time2)
  
  return t1.getTime() === t2.getTime()
}

/**
 * Check if time is in the past
 * @param {Date|string} time - Time to check
 * @returns {boolean} True if time is in the past
 */
export const isTimePast = (time) => {
  const timeObj = new Date(time)
  const now = getCurrentTime()
  
  return timeObj < now
}

/**
 * Check if time is in the future
 * @param {Date|string} time - Time to check
 * @returns {boolean} True if time is in the future
 */
export const isTimeFuture = (time) => {
  const timeObj = new Date(time)
  const now = getCurrentTime()
  
  return timeObj > now
}

/**
 * Get time zone offset
 * @param {Date|string} time - Time
 * @returns {number} Time zone offset in minutes
 */
export const getTimeZoneOffset = (time) => {
  const timeObj = new Date(time)
  return timeObj.getTimezoneOffset()
}

/**
 * Convert time to different time zone
 * @param {Date|string} time - Time to convert
 * @param {string} timeZone - Target time zone
 * @returns {Date} Converted time
 */
export const convertToTimeZone = (time, timeZone) => {
  const timeObj = new Date(time)
  return new Date(timeObj.toLocaleString('en-US', { timeZone }))
}

/**
 * Get time in different time zone
 * @param {Date|string} time - Time
 * @param {string} timeZone - Time zone
 * @returns {string} Time in specified time zone
 */
export const getTimeInTimeZone = (time, timeZone) => {
  const timeObj = new Date(time)
  return timeObj.toLocaleTimeString('en-US', { timeZone })
}

/**
 * Get time zone name
 * @param {Date|string} time - Time
 * @returns {string} Time zone name
 */
export const getTimeZoneName = (time) => {
  const timeObj = new Date(time)
  return timeObj.toLocaleTimeString('en-US', { timeZoneName: 'long' })
}

/**
 * Get time zone abbreviation
 * @param {Date|string} time - Time
 * @returns {string} Time zone abbreviation
 */
export const getTimeZoneAbbreviation = (time) => {
  const timeObj = new Date(time)
  return timeObj.toLocaleTimeString('en-US', { timeZoneName: 'short' })
}

/**
 * Get time zone offset string
 * @param {Date|string} time - Time
 * @returns {string} Time zone offset string (e.g., "+05:30")
 */
export const getTimeZoneOffsetString = (time) => {
  const timeObj = new Date(time)
  const offset = timeObj.getTimezoneOffset()
  const sign = offset > 0 ? '-' : '+'
  const hours = Math.floor(Math.abs(offset) / 60)
  const minutes = Math.abs(offset) % 60
  
  return `${sign}${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
}

/**
 * Get time zone info
 * @param {Date|string} time - Time
 * @returns {object} Time zone information
 */
export const getTimeZoneInfo = (time) => {
  const timeObj = new Date(time)
  
  return {
    offset: timeObj.getTimezoneOffset(),
    offsetString: getTimeZoneOffsetString(time),
    name: getTimeZoneName(time),
    abbreviation: getTimeZoneAbbreviation(time)
  }
}

/**
 * Get time range
 * @param {Date|string} startTime - Start time
 * @param {Date|string} endTime - End time
 * @param {number} intervalMinutes - Interval in minutes
 * @returns {Date[]} Array of times in range
 */
export const getTimeRange = (startTime, endTime, intervalMinutes = 30) => {
  const start = new Date(startTime)
  const end = new Date(endTime)
  const times = []
  
  for (let time = new Date(start); time <= end; time = addMinutes(time, intervalMinutes)) {
    times.push(new Date(time))
  }
  
  return times
}

/**
 * Get time slots
 * @param {Date|string} startTime - Start time
 * @param {Date|string} endTime - End time
 * @param {number} durationMinutes - Duration of each slot in minutes
 * @param {number} intervalMinutes - Interval between slots in minutes
 * @returns {Date[]} Array of time slots
 */
export const getTimeSlots = (startTime, endTime, durationMinutes = 60, intervalMinutes = 30) => {
  const start = new Date(startTime)
  const end = new Date(endTime)
  const slots = []
  
  for (let time = new Date(start); time <= end; time = addMinutes(time, intervalMinutes)) {
    const slotEnd = addMinutes(time, durationMinutes)
    if (slotEnd <= end) {
      slots.push({
        start: new Date(time),
        end: slotEnd
      })
    }
  }
  
  return slots
}

/**
 * Check if time slot is available
 * @param {Date|string} startTime - Start time
 * @param {Date|string} endTime - End time
 * @param {Date[]} bookedSlots - Array of booked time slots
 * @returns {boolean} True if slot is available
 */
export const isTimeSlotAvailable = (startTime, endTime, bookedSlots) => {
  const start = new Date(startTime)
  const end = new Date(endTime)
  
  return !bookedSlots.some(slot => {
    const slotStart = new Date(slot.start)
    const slotEnd = new Date(slot.end)
    
    return (start < slotEnd && end > slotStart)
  })
}

/**
 * Get available time slots
 * @param {Date|string} startTime - Start time
 * @param {Date|string} endTime - End time
 * @param {number} durationMinutes - Duration of each slot in minutes
 * @param {number} intervalMinutes - Interval between slots in minutes
 * @param {Date[]} bookedSlots - Array of booked time slots
 * @returns {Date[]} Array of available time slots
 */
export const getAvailableTimeSlots = (startTime, endTime, durationMinutes = 60, intervalMinutes = 30, bookedSlots = []) => {
  const allSlots = getTimeSlots(startTime, endTime, durationMinutes, intervalMinutes)
  
  return allSlots.filter(slot => isTimeSlotAvailable(slot.start, slot.end, bookedSlots))
}

/**
 * Format custom time
 * @param {Date} time - Time object
 * @param {string} format - Custom format string
 * @returns {string} Formatted time
 */
const formatCustomTime = (time, format) => {
  const hours = time.getHours()
  const minutes = time.getMinutes()
  const seconds = time.getSeconds()
  const milliseconds = time.getMilliseconds()
  
  return format
    .replace('HH', hours.toString().padStart(2, '0'))
    .replace('H', hours.toString())
    .replace('mm', minutes.toString().padStart(2, '0'))
    .replace('m', minutes.toString())
    .replace('ss', seconds.toString().padStart(2, '0'))
    .replace('s', seconds.toString())
    .replace('SSS', milliseconds.toString().padStart(3, '0'))
    .replace('S', milliseconds.toString())
}

/**
 * Get time constants
 */
export const TIME_CONSTANTS = {
  HOURS_IN_DAY: 24,
  MINUTES_IN_HOUR: 60,
  SECONDS_IN_MINUTE: 60,
  MILLISECONDS_IN_SECOND: 1000,
  MILLISECONDS_IN_MINUTE: 60 * 1000,
  MILLISECONDS_IN_HOUR: 60 * 60 * 1000,
  MILLISECONDS_IN_DAY: 24 * 60 * 60 * 1000,
  TIME_FORMATS: {
    TWELVE_HOUR: '12h',
    TWENTY_FOUR_HOUR: '24h',
    CUSTOM: 'custom'
  }
}

export default {
  getCurrentTime,
  getCurrentTimeString,
  formatTime,
  getTimeFromString,
  addHours,
  subtractHours,
  addMinutes,
  subtractMinutes,
  addSeconds,
  subtractSeconds,
  getHours,
  getMinutes,
  getSeconds,
  getMilliseconds,
  setHours,
  setMinutes,
  setSeconds,
  setMilliseconds,
  getTimeDifference,
  getTimeDifferenceInMinutes,
  getTimeDifferenceInHours,
  getTimeDifferenceInDays,
  isTimeBefore,
  isTimeAfter,
  isTimeBetween,
  isTimeSame,
  isTimePast,
  isTimeFuture,
  getTimeZoneOffset,
  convertToTimeZone,
  getTimeInTimeZone,
  getTimeZoneName,
  getTimeZoneAbbreviation,
  getTimeZoneOffsetString,
  getTimeZoneInfo,
  getTimeRange,
  getTimeSlots,
  isTimeSlotAvailable,
  getAvailableTimeSlots,
  TIME_CONSTANTS
}
