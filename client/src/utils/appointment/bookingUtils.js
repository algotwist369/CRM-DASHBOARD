/**
 * Appointment booking utility functions
 */

/**
 * Validate booking data
 * @param {object} bookingData - Booking data
 * @returns {object} Validation result
 */
export const validateBookingData = (bookingData) => {
  if (!bookingData || typeof bookingData !== 'object') {
    return { isValid: false, error: 'Booking data is required' }
  }
  
  const { customerId, serviceId, staffId, date, time, duration } = bookingData
  
  if (!customerId) {
    return { isValid: false, error: 'Customer ID is required' }
  }
  
  if (!serviceId) {
    return { isValid: false, error: 'Service ID is required' }
  }
  
  if (!staffId) {
    return { isValid: false, error: 'Staff ID is required' }
  }
  
  if (!date) {
    return { isValid: false, error: 'Date is required' }
  }
  
  if (!time) {
    return { isValid: false, error: 'Time is required' }
  }
  
  if (!duration) {
    return { isValid: false, error: 'Duration is required' }
  }
  
  // Validate date format
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/
  if (!dateRegex.test(date)) {
    return { isValid: false, error: 'Invalid date format' }
  }
  
  // Validate time format
  const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
  if (!timeRegex.test(time)) {
    return { isValid: false, error: 'Invalid time format' }
  }
  
  // Validate duration
  if (typeof duration !== 'number' || duration < 15 || duration > 480) {
    return { isValid: false, error: 'Invalid duration' }
  }
  
  return { isValid: true, error: null }
}

/**
 * Check booking availability
 * @param {object} bookingData - Booking data
 * @param {array} existingAppointments - Existing appointments
 * @param {object} businessHours - Business hours
 * @returns {object} Availability result
 */
export const checkBookingAvailability = (bookingData, existingAppointments, businessHours) => {
  if (!bookingData || !existingAppointments || !businessHours) {
    return { isAvailable: false, error: 'Invalid booking data' }
  }
  
  const { date, time, duration, staffId } = bookingData
  
  // Check if date is in the past
  const appointmentDate = new Date(date)
  const now = new Date()
  if (appointmentDate < now) {
    return { isAvailable: false, error: 'Cannot book appointments in the past' }
  }
  
  // Check if date is too far in the future
  const oneYearFromNow = new Date(now.getTime() + (365 * 24 * 60 * 60 * 1000))
  if (appointmentDate > oneYearFromNow) {
    return { isAvailable: false, error: 'Cannot book appointments more than 1 year in advance' }
  }
  
  // Check business hours
  const dayOfWeek = appointmentDate.toLocaleDateString('en-US', { weekday: 'lowercase' })
  const dayHours = businessHours[dayOfWeek]
  
  if (!dayHours || !dayHours.open) {
    return { isAvailable: false, error: 'Business is closed on this day' }
  }
  
  if (time < dayHours.open || time > dayHours.close) {
    return { isAvailable: false, error: 'Time is outside business hours' }
  }
  
  // Check for conflicts
  const slotStart = new Date(`${date}T${time}`)
  const slotEnd = new Date(slotStart.getTime() + (duration * 60 * 1000))
  
  const hasConflict = existingAppointments.some(appointment => {
    if (appointment.date !== date) return false
    if (appointment.staffId !== staffId) return false
    
    const aptStart = new Date(`${appointment.date}T${appointment.time}`)
    const aptEnd = new Date(aptStart.getTime() + ((appointment.duration || 60) * 60 * 1000))
    
    return (slotStart < aptEnd && slotEnd > aptStart)
  })
  
  if (hasConflict) {
    return { isAvailable: false, error: 'Time slot is not available' }
  }
  
  return { isAvailable: true, error: null }
}

 
export const createBookingConfirmation = (bookingData, customer, service, staff) => {
  if (!bookingData || !customer || !service || !staff) {
    throw new Error('All booking data is required')
  }
  
  const { date, time, duration } = bookingData
  
  return {
    id: generateBookingId(),
    customer: {
      id: customer.id,
      name: `${customer.firstName} ${customer.lastName}`,
      email: customer.email,
      phone: customer.phone
    },
    service: {
      id: service.id,
      name: service.name,
      price: service.price,
      duration: service.duration
    },
    staff: {
      id: staff.id,
      name: `${staff.firstName} ${staff.lastName}`,
      email: staff.email,
      phone: staff.phone
    },
    appointment: {
      date,
      time,
      duration,
      endTime: calculateAppointmentEndTime(time, duration)
    },
    status: 'confirmed',
    createdAt: new Date().toISOString(),
    confirmationCode: generateConfirmationCode()
  }
}

/**
 * Generate booking ID
 * @returns {string} Booking ID
 */
export const generateBookingId = () => {
  return `book_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Generate confirmation code
 * @returns {string} Confirmation code
 */
export const generateConfirmationCode = () => {
  return Math.random().toString(36).substr(2, 8).toUpperCase()
}

/**
 * Calculate appointment end time
 * @param {string} startTime - Start time (HH:MM)
 * @param {number} duration - Duration in minutes
 * @returns {string} End time (HH:MM)
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
 * Format booking confirmation for display
 * @param {object} confirmation - Booking confirmation
 * @returns {string} Formatted confirmation
 */
export const formatBookingConfirmation = (confirmation) => {
  if (!confirmation || typeof confirmation !== 'object') return ''
  
  const { customer, service, staff, appointment, confirmationCode } = confirmation
  
  return `
Booking Confirmation #${confirmationCode}

Customer: ${customer.name}
Email: ${customer.email}
Phone: ${customer.phone}

Service: ${service.name}
Price: $${service.price}
Duration: ${service.duration} minutes

Staff: ${staff.name}

Appointment Details:
Date: ${formatAppointmentDate(appointment.date, 'full')}
Time: ${formatAppointmentTime(appointment.time, '12hour')}
End Time: ${formatAppointmentTime(appointment.endTime, '12hour')}

Status: Confirmed
  `.trim()
}

/**
 * Send booking confirmation email
 * @param {object} confirmation - Booking confirmation
 * @param {string} emailTemplate - Email template
 * @returns {object} Email data
 */
export const sendBookingConfirmationEmail = (confirmation, emailTemplate = 'default') => {
  if (!confirmation || typeof confirmation !== 'object') {
    throw new Error('Confirmation data is required')
  }
  
  const { customer, service, staff, appointment, confirmationCode } = confirmation
  
  const emailData = {
    to: customer.email,
    subject: `Booking Confirmation #${confirmationCode}`,
    template: emailTemplate,
    data: {
      customer,
      service,
      staff,
      appointment,
      confirmationCode,
      formattedDate: formatAppointmentDate(appointment.date, 'full'),
      formattedTime: formatAppointmentTime(appointment.time, '12hour'),
      formattedEndTime: formatAppointmentTime(appointment.endTime, '12hour')
    }
  }
  
  return emailData
}

/**
 * Send booking reminder
 * @param {object} appointment - Appointment data
 * @param {string} reminderType - Type of reminder (24h, 2h, 1h)
 * @returns {object} Reminder data
 */
export const sendBookingReminder = (appointment, reminderType = '24h') => {
  if (!appointment || typeof appointment !== 'object') {
    throw new Error('Appointment data is required')
  }
  
  const { customer, service, staff, date, time } = appointment
  
  const reminderData = {
    to: customer.email,
    subject: `Appointment Reminder - ${service.name}`,
    template: `reminder_${reminderType}`,
    data: {
      customer,
      service,
      staff,
      date,
      time,
      formattedDate: formatAppointmentDate(date, 'full'),
      formattedTime: formatAppointmentTime(time, '12hour'),
      reminderType
    }
  }
  
  return reminderData
}

/**
 * Cancel booking
 * @param {string} bookingId - Booking ID
 * @param {string} reason - Cancellation reason
 * @returns {object} Cancellation result
 */
export const cancelBooking = (bookingId, reason = 'Customer request') => {
  if (!bookingId) {
    throw new Error('Booking ID is required')
  }
  
  return {
    id: bookingId,
    status: 'cancelled',
    cancelledAt: new Date().toISOString(),
    reason,
    refundEligible: true
  }
}

/**
 * Reschedule booking
 * @param {string} bookingId - Booking ID
 * @param {string} newDate - New date
 * @param {string} newTime - New time
 * @param {string} reason - Reschedule reason
 * @returns {object} Reschedule result
 */
export const rescheduleBooking = (bookingId, newDate, newTime, reason = 'Customer request') => {
  if (!bookingId || !newDate || !newTime) {
    throw new Error('Booking ID, new date, and new time are required')
  }
  
  return {
    id: bookingId,
    status: 'rescheduled',
    rescheduledAt: new Date().toISOString(),
    newDate,
    newTime,
    reason,
    confirmationCode: generateConfirmationCode()
  }
}

/**
 * Get booking status
 * @param {object} booking - Booking data
 * @returns {string} Booking status
 */
export const getBookingStatus = (booking) => {
  if (!booking || typeof booking !== 'object') return 'unknown'
  
  const { status, date, time } = booking
  
  if (status === 'cancelled') return 'cancelled'
  if (status === 'completed') return 'completed'
  if (status === 'no-show') return 'no-show'
  
  const appointmentDateTime = new Date(`${date}T${time}`)
  const now = new Date()
  
  if (appointmentDateTime < now) {
    return 'past'
  }
  
  return status || 'scheduled'
}

/**
 * Format booking status
 * @param {string} status - Booking status
 * @returns {string} Formatted status
 */
export const formatBookingStatus = (status) => {
  const statusMap = {
    scheduled: 'Scheduled',
    confirmed: 'Confirmed',
    'in-progress': 'In Progress',
    completed: 'Completed',
    cancelled: 'Cancelled',
    'no-show': 'No Show',
    rescheduled: 'Rescheduled',
    past: 'Past',
    unknown: 'Unknown'
  }
  
  return statusMap[status] || 'Unknown'
}

/**
 * Get booking status color
 * @param {string} status - Booking status
 * @returns {string} Color class
 */
export const getBookingStatusColor = (status) => {
  const colorMap = {
    scheduled: 'blue',
    confirmed: 'green',
    'in-progress': 'yellow',
    completed: 'green',
    cancelled: 'red',
    'no-show': 'red',
    rescheduled: 'orange',
    past: 'gray',
    unknown: 'gray'
  }
  
  return colorMap[status] || 'gray'
}

/**
 * Calculate booking total
 * @param {object} booking - Booking data
 * @param {object} service - Service data
 * @param {array} addons - Addon services
 * @param {number} discount - Discount amount
 * @returns {object} Booking total
 */
export const calculateBookingTotal = (booking, service, addons = [], discount = 0) => {
  if (!booking || !service) return { subtotal: 0, total: 0, discount: 0 }
  
  const servicePrice = service.price || 0
  const addonTotal = addons.reduce((sum, addon) => sum + (addon.price || 0), 0)
  const subtotal = servicePrice + addonTotal
  const total = Math.max(0, subtotal - discount)
  
  return {
    subtotal,
    total,
    discount,
    servicePrice,
    addonTotal
  }
}

/**
 * Validate booking payment
 * @param {object} paymentData - Payment data
 * @returns {object} Validation result
 */
export const validateBookingPayment = (paymentData) => {
  if (!paymentData || typeof paymentData !== 'object') {
    return { isValid: false, error: 'Payment data is required' }
  }
  
  const { amount, method, cardNumber, expiryDate, cvv } = paymentData
  
  if (!amount || typeof amount !== 'number' || amount <= 0) {
    return { isValid: false, error: 'Invalid payment amount' }
  }
  
  if (!method) {
    return { isValid: false, error: 'Payment method is required' }
  }
  
  if (method === 'card') {
    if (!cardNumber || !expiryDate || !cvv) {
      return { isValid: false, error: 'Card details are required' }
    }
    
    // Basic card validation
    const cardRegex = /^\d{13,19}$/
    if (!cardRegex.test(cardNumber.replace(/\s/g, ''))) {
      return { isValid: false, error: 'Invalid card number' }
    }
    
    const expiryRegex = /^(0[1-9]|1[0-2])\/\d{2}$/
    if (!expiryRegex.test(expiryDate)) {
      return { isValid: false, error: 'Invalid expiry date' }
    }
    
    const cvvRegex = /^\d{3,4}$/
    if (!cvvRegex.test(cvv)) {
      return { isValid: false, error: 'Invalid CVV' }
    }
  }
  
  return { isValid: true, error: null }
}

/**
 * Process booking payment
 * @param {object} paymentData - Payment data
 * @param {object} booking - Booking data
 * @returns {object} Payment result
 */
export const processBookingPayment = (paymentData, booking) => {
  if (!paymentData || !booking) {
    throw new Error('Payment data and booking are required')
  }
  
  const validation = validateBookingPayment(paymentData)
  if (!validation.isValid) {
    throw new Error(validation.error)
  }
  
  // Simulate payment processing
  const paymentResult = {
    id: generatePaymentId(),
    bookingId: booking.id,
    amount: paymentData.amount,
    method: paymentData.method,
    status: 'completed',
    processedAt: new Date().toISOString(),
    transactionId: generateTransactionId()
  }
  
  return paymentResult
}

/**
 * Generate payment ID
 * @returns {string} Payment ID
 */
export const generatePaymentId = () => {
  return `pay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Generate transaction ID
 * @returns {string} Transaction ID
 */
export const generateTransactionId = () => {
  return `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Booking constants
 */
export const BOOKING_CONSTANTS = {
  STATUSES: {
    SCHEDULED: 'scheduled',
    CONFIRMED: 'confirmed',
    IN_PROGRESS: 'in-progress',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled',
    NO_SHOW: 'no-show',
    RESCHEDULED: 'rescheduled',
    PAST: 'past',
    UNKNOWN: 'unknown'
  },
  PAYMENT_METHODS: {
    CARD: 'card',
    CASH: 'cash',
    CHECK: 'check',
    BANK_TRANSFER: 'bank_transfer',
    PAYPAL: 'paypal',
    STRIPE: 'stripe'
  },
  REMINDER_TYPES: {
    TWENTY_FOUR_HOURS: '24h',
    TWO_HOURS: '2h',
    ONE_HOUR: '1h'
  },
  EMAIL_TEMPLATES: {
    DEFAULT: 'default',
    REMINDER_24H: 'reminder_24h',
    REMINDER_2H: 'reminder_2h',
    REMINDER_1H: 'reminder_1h'
  }
}

// Import utility functions
import { formatAppointmentDate, formatAppointmentTime } from './appointmentUtils'

export default {
  validateBookingData,
  checkBookingAvailability,
  createBookingConfirmation,
  generateBookingId,
  generateConfirmationCode,
  calculateAppointmentEndTime,
  formatBookingConfirmation,
  sendBookingConfirmationEmail,
  sendBookingReminder,
  cancelBooking,
  rescheduleBooking,
  getBookingStatus,
  formatBookingStatus,
  getBookingStatusColor,
  calculateBookingTotal,
  validateBookingPayment,
  processBookingPayment,
  generatePaymentId,
  generateTransactionId,
  BOOKING_CONSTANTS
}
