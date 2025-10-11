/**
 * Calendar utility functions
 */

import { getStartOfMonth, getEndOfMonth, getStartOfWeek, getEndOfWeek, addDays, subtractDays, getDaysBetween, isSameDay, isSameMonth, isSameYear, getDayOfWeek, getMonthName, getDayName } from './dateUtils'

/**
 * Get calendar month data
 * @param {Date|string} date - Date in the month
 * @param {number} startDay - Start day of week (0 = Sunday, 1 = Monday)
 * @returns {object} Calendar month data
 */
export const getCalendarMonth = (date, startDay = 1) => {
  const dateObj = new Date(date)
  const year = dateObj.getFullYear()
  const month = dateObj.getMonth()
  
  const startOfMonth = getStartOfMonth(dateObj)
  const endOfMonth = getEndOfMonth(dateObj)
  const startOfCalendar = getStartOfWeek(startOfMonth, startDay)
  const endOfCalendar = getEndOfWeek(endOfMonth, startDay)
  
  const weeks = []
  let currentWeek = []
  let currentDate = new Date(startOfCalendar)
  
  while (currentDate <= endOfCalendar) {
    currentWeek.push({
      date: new Date(currentDate),
      isCurrentMonth: isSameMonth(currentDate, dateObj),
      isToday: isSameDay(currentDate, new Date()),
      dayOfWeek: getDayOfWeek(currentDate),
      dayName: getDayName(currentDate, 'short'),
      dayNumber: currentDate.getDate()
    })
    
    if (currentWeek.length === 7) {
      weeks.push(currentWeek)
      currentWeek = []
    }
    
    currentDate = addDays(currentDate, 1)
  }
  
  return {
    year,
    month,
    monthName: getMonthName(dateObj, 'long'),
    monthNameShort: getMonthName(dateObj, 'short'),
    weeks,
    startOfMonth,
    endOfMonth,
    startOfCalendar,
    endOfCalendar
  }
}

/**
 * Get calendar week data
 * @param {Date|string} date - Date in the week
 * @param {number} startDay - Start day of week (0 = Sunday, 1 = Monday)
 * @returns {object} Calendar week data
 */
export const getCalendarWeek = (date, startDay = 1) => {
  const dateObj = new Date(date)
  const startOfWeek = getStartOfWeek(dateObj, startDay)
  const endOfWeek = getEndOfWeek(dateObj, startDay)
  
  const days = []
  let currentDate = new Date(startOfWeek)
  
  while (currentDate <= endOfWeek) {
    days.push({
      date: new Date(currentDate),
      isToday: isSameDay(currentDate, new Date()),
      dayOfWeek: getDayOfWeek(currentDate),
      dayName: getDayName(currentDate, 'short'),
      dayNameFull: getDayName(currentDate, 'long'),
      dayNumber: currentDate.getDate()
    })
    
    currentDate = addDays(currentDate, 1)
  }
  
  return {
    startOfWeek,
    endOfWeek,
    days
  }
}

/**
 * Get calendar year data
 * @param {Date|string} date - Date in the year
 * @returns {object} Calendar year data
 */
export const getCalendarYear = (date) => {
  const dateObj = new Date(date)
  const year = dateObj.getFullYear()
  
  const months = []
  for (let month = 0; month < 12; month++) {
    const monthDate = new Date(year, month, 1)
    months.push({
      month,
      monthName: getMonthName(monthDate, 'long'),
      monthNameShort: getMonthName(monthDate, 'short'),
      startOfMonth: getStartOfMonth(monthDate),
      endOfMonth: getEndOfMonth(monthDate),
      daysInMonth: getEndOfMonth(monthDate).getDate()
    })
  }
  
  return {
    year,
    months
  }
}

/**
 * Get calendar day data
 * @param {Date|string} date - Date
 * @returns {object} Calendar day data
 */
export const getCalendarDay = (date) => {
  const dateObj = new Date(date)
  
  return {
    date: dateObj,
    year: dateObj.getFullYear(),
    month: dateObj.getMonth(),
    day: dateObj.getDate(),
    dayOfWeek: getDayOfWeek(dateObj),
    dayName: getDayName(dateObj, 'long'),
    dayNameShort: getDayName(dateObj, 'short'),
    monthName: getMonthName(dateObj, 'long'),
    monthNameShort: getMonthName(dateObj, 'short'),
    isToday: isSameDay(dateObj, new Date()),
    isWeekend: getDayOfWeek(dateObj) === 0 || getDayOfWeek(dateObj) === 6,
    isWeekday: getDayOfWeek(dateObj) !== 0 && getDayOfWeek(dateObj) !== 6
  }
}

/**
 * Get calendar navigation data
 * @param {Date|string} date - Current date
 * @returns {object} Navigation data
 */
export const getCalendarNavigation = (date) => {
  const dateObj = new Date(date)
  
  return {
    current: dateObj,
    previous: subtractDays(dateObj, 1),
    next: addDays(dateObj, 1),
    previousWeek: subtractDays(dateObj, 7),
    nextWeek: addDays(dateObj, 7),
    previousMonth: new Date(dateObj.getFullYear(), dateObj.getMonth() - 1, dateObj.getDate()),
    nextMonth: new Date(dateObj.getFullYear(), dateObj.getMonth() + 1, dateObj.getDate()),
    previousYear: new Date(dateObj.getFullYear() - 1, dateObj.getMonth(), dateObj.getDate()),
    nextYear: new Date(dateObj.getFullYear() + 1, dateObj.getMonth(), dateObj.getDate())
  }
}

/**
 * Get calendar events for a date
 * @param {Date|string} date - Date
 * @param {Array} events - Array of events
 * @returns {Array} Events for the date
 */
export const getCalendarEventsForDate = (date, events) => {
  if (!events || !Array.isArray(events)) return []
  
  const dateObj = new Date(date)
  
  return events.filter(event => {
    const eventDate = new Date(event.date)
    return isSameDay(eventDate, dateObj)
  })
}

/**
 * Get calendar events for a month
 * @param {Date|string} date - Date in the month
 * @param {Array} events - Array of events
 * @returns {Array} Events for the month
 */
export const getCalendarEventsForMonth = (date, events) => {
  if (!events || !Array.isArray(events)) return []
  
  const dateObj = new Date(date)
  const startOfMonth = getStartOfMonth(dateObj)
  const endOfMonth = getEndOfMonth(dateObj)
  
  return events.filter(event => {
    const eventDate = new Date(event.date)
    return eventDate >= startOfMonth && eventDate <= endOfMonth
  })
}

/**
 * Get calendar events for a week
 * @param {Date|string} date - Date in the week
 * @param {Array} events - Array of events
 * @param {number} startDay - Start day of week (0 = Sunday, 1 = Monday)
 * @returns {Array} Events for the week
 */
export const getCalendarEventsForWeek = (date, events, startDay = 1) => {
  if (!events || !Array.isArray(events)) return []
  
  const dateObj = new Date(date)
  const startOfWeek = getStartOfWeek(dateObj, startDay)
  const endOfWeek = getEndOfWeek(dateObj, startDay)
  
  return events.filter(event => {
    const eventDate = new Date(event.date)
    return eventDate >= startOfWeek && eventDate <= endOfWeek
  })
}

/**
 * Get calendar events for a year
 * @param {Date|string} date - Date in the year
 * @param {Array} events - Array of events
 * @returns {Array} Events for the year
 */
export const getCalendarEventsForYear = (date, events) => {
  if (!events || !Array.isArray(events)) return []
  
  const dateObj = new Date(date)
  const year = dateObj.getFullYear()
  
  return events.filter(event => {
    const eventDate = new Date(event.date)
    return isSameYear(eventDate, dateObj)
  })
}

/**
 * Get calendar with events
 * @param {Date|string} date - Date
 * @param {Array} events - Array of events
 * @param {number} startDay - Start day of week (0 = Sunday, 1 = Monday)
 * @returns {object} Calendar with events
 */
export const getCalendarWithEvents = (date, events = [], startDay = 1) => {
  const calendar = getCalendarMonth(date, startDay)
  
  calendar.weeks.forEach(week => {
    week.forEach(day => {
      day.events = getCalendarEventsForDate(day.date, events)
    })
  })
  
  return calendar
}

/**
 * Get calendar view type
 * @param {string} viewType - View type ('month', 'week', 'day', 'year')
 * @param {Date|string} date - Date
 * @param {Array} events - Array of events
 * @param {number} startDay - Start day of week (0 = Sunday, 1 = Monday)
 * @returns {object} Calendar view data
 */
export const getCalendarView = (viewType, date, events = [], startDay = 1) => {
  switch (viewType) {
    case 'month':
      return getCalendarWithEvents(date, events, startDay)
    case 'week':
      return {
        ...getCalendarWeek(date, startDay),
        events: getCalendarEventsForWeek(date, events, startDay)
      }
    case 'day':
      return {
        ...getCalendarDay(date),
        events: getCalendarEventsForDate(date, events)
      }
    case 'year':
      return {
        ...getCalendarYear(date),
        events: getCalendarEventsForYear(date, events)
      }
    default:
      return getCalendarWithEvents(date, events, startDay)
  }
}

/**
 * Get calendar date range
 * @param {Date|string} startDate - Start date
 * @param {Date|string} endDate - End date
 * @returns {Array} Array of dates in range
 */
export const getCalendarDateRange = (startDate, endDate) => {
  const start = new Date(startDate)
  const end = new Date(endDate)
  const dates = []
  
  let currentDate = new Date(start)
  while (currentDate <= end) {
    dates.push({
      date: new Date(currentDate),
      ...getCalendarDay(currentDate)
    })
    currentDate = addDays(currentDate, 1)
  }
  
  return dates
}

/**
 * Get calendar holidays
 * @param {Date|string} date - Date
 * @param {string} country - Country code
 * @returns {Array} Array of holidays
 */
export const getCalendarHolidays = (date, country = 'US') => {
  const dateObj = new Date(date)
  const year = dateObj.getFullYear()
  const month = dateObj.getMonth()
  const day = dateObj.getDate()
  
  const holidays = []
  
  // US Holidays
  if (country === 'US') {
    // New Year's Day
    if (month === 0 && day === 1) {
      holidays.push({ name: "New Year's Day", type: 'federal' })
    }
    
    // Martin Luther King Jr. Day (third Monday in January)
    if (month === 0 && day === getThirdMondayInMonth(year, 0)) {
      holidays.push({ name: 'Martin Luther King Jr. Day', type: 'federal' })
    }
    
    // Presidents' Day (third Monday in February)
    if (month === 1 && day === getThirdMondayInMonth(year, 1)) {
      holidays.push({ name: "Presidents' Day", type: 'federal' })
    }
    
    // Memorial Day (last Monday in May)
    if (month === 4 && day === getLastMondayInMonth(year, 4)) {
      holidays.push({ name: 'Memorial Day', type: 'federal' })
    }
    
    // Independence Day
    if (month === 6 && day === 4) {
      holidays.push({ name: 'Independence Day', type: 'federal' })
    }
    
    // Labor Day (first Monday in September)
    if (month === 8 && day === getFirstMondayInMonth(year, 8)) {
      holidays.push({ name: 'Labor Day', type: 'federal' })
    }
    
    // Columbus Day (second Monday in October)
    if (month === 9 && day === getSecondMondayInMonth(year, 9)) {
      holidays.push({ name: 'Columbus Day', type: 'federal' })
    }
    
    // Veterans Day
    if (month === 10 && day === 11) {
      holidays.push({ name: 'Veterans Day', type: 'federal' })
    }
    
    // Thanksgiving (fourth Thursday in November)
    if (month === 10 && day === getFourthThursdayInMonth(year, 10)) {
      holidays.push({ name: 'Thanksgiving', type: 'federal' })
    }
    
    // Christmas Day
    if (month === 11 && day === 25) {
      holidays.push({ name: 'Christmas Day', type: 'federal' })
    }
  }
  
  return holidays
}

/**
 * Get third Monday in month
 * @param {number} year - Year
 * @param {number} month - Month (0-11)
 * @returns {number} Day of month
 */
const getThirdMondayInMonth = (year, month) => {
  const firstDay = new Date(year, month, 1)
  const firstMonday = 1 + (8 - firstDay.getDay()) % 7
  return firstMonday + 14
}

/**
 * Get last Monday in month
 * @param {number} year - Year
 * @param {number} month - Month (0-11)
 * @returns {number} Day of month
 */
const getLastMondayInMonth = (year, month) => {
  const lastDay = new Date(year, month + 1, 0)
  const lastMonday = lastDay.getDate() - (lastDay.getDay() + 6) % 7
  return lastMonday
}

/**
 * Get first Monday in month
 * @param {number} year - Year
 * @param {number} month - Month (0-11)
 * @returns {number} Day of month
 */
const getFirstMondayInMonth = (year, month) => {
  const firstDay = new Date(year, month, 1)
  const firstMonday = 1 + (8 - firstDay.getDay()) % 7
  return firstMonday
}

/**
 * Get second Monday in month
 * @param {number} year - Year
 * @param {number} month - Month (0-11)
 * @returns {number} Day of month
 */
const getSecondMondayInMonth = (year, month) => {
  const firstDay = new Date(year, month, 1)
  const firstMonday = 1 + (8 - firstDay.getDay()) % 7
  return firstMonday + 7
}

/**
 * Get fourth Thursday in month
 * @param {number} year - Year
 * @param {number} month - Month (0-11)
 * @returns {number} Day of month
 */
const getFourthThursdayInMonth = (year, month) => {
  const firstDay = new Date(year, month, 1)
  const firstThursday = 1 + (4 - firstDay.getDay() + 7) % 7
  return firstThursday + 21
}

/**
 * Get calendar constants
 */
export const CALENDAR_CONSTANTS = {
  VIEW_TYPES: {
    MONTH: 'month',
    WEEK: 'week',
    DAY: 'day',
    YEAR: 'year'
  },
  START_DAYS: {
    SUNDAY: 0,
    MONDAY: 1
  },
  COUNTRIES: {
    US: 'US',
    CA: 'CA',
    GB: 'GB',
    AU: 'AU',
    DE: 'DE',
    FR: 'FR',
    IT: 'IT',
    ES: 'ES',
    JP: 'JP',
    CN: 'CN'
  }
}

export default {
  getCalendarMonth,
  getCalendarWeek,
  getCalendarYear,
  getCalendarDay,
  getCalendarNavigation,
  getCalendarEventsForDate,
  getCalendarEventsForMonth,
  getCalendarEventsForWeek,
  getCalendarEventsForYear,
  getCalendarWithEvents,
  getCalendarView,
  getCalendarDateRange,
  getCalendarHolidays,
  CALENDAR_CONSTANTS
}
