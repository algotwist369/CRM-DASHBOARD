/**
 * Notification utility functions
 */

/**
 * Create notification
 * @param {string} type - Notification type
 * @param {string} title - Notification title
 * @param {string} message - Notification message
 * @param {object} data - Additional data
 * @returns {object} Notification object
 */
export const createNotification = (type, title, message, data = {}) => {
  if (!type || !title || !message) {
    throw new Error('Type, title, and message are required')
  }
  
  return {
    id: generateNotificationId(),
    type,
    title,
    message,
    data,
    isRead: false,
    createdAt: new Date().toISOString(),
    expiresAt: data.expiresAt || null
  }
}

/**
 * Generate notification ID
 * @returns {string} Notification ID
 */
export const generateNotificationId = () => {
  return `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Validate notification
 * @param {object} notification - Notification data
 * @returns {boolean} Is valid notification
 */
export const isValidNotification = (notification) => {
  if (!notification || typeof notification !== 'object') return false
  
  const required = ['type', 'title', 'message']
  return required.every(field => notification[field] && typeof notification[field] === 'string')
}

/**
 * Get notification type display name
 * @param {string} type - Notification type
 * @returns {string} Display name
 */
export const getNotificationTypeDisplayName = (type) => {
  const typeMap = {
    info: 'Information',
    success: 'Success',
    warning: 'Warning',
    error: 'Error',
    appointment: 'Appointment',
    payment: 'Payment',
    reminder: 'Reminder',
    promotion: 'Promotion',
    system: 'System'
  }
  
  return typeMap[type] || 'Notification'
}

/**
 * Get notification type color
 * @param {string} type - Notification type
 * @returns {string} Color class
 */
export const getNotificationTypeColor = (type) => {
  const colorMap = {
    info: 'blue',
    success: 'green',
    warning: 'yellow',
    error: 'red',
    appointment: 'purple',
    payment: 'green',
    reminder: 'orange',
    promotion: 'pink',
    system: 'gray'
  }
  
  return colorMap[type] || 'gray'
}

/**
 * Get notification type icon
 * @param {string} type - Notification type
 * @returns {string} Icon name
 */
export const getNotificationTypeIcon = (type) => {
  const iconMap = {
    info: 'info-circle',
    success: 'check-circle',
    warning: 'exclamation-triangle',
    error: 'times-circle',
    appointment: 'calendar',
    payment: 'credit-card',
    reminder: 'bell',
    promotion: 'gift',
    system: 'cog'
  }
  
  return iconMap[type] || 'bell'
}

/**
 * Format notification message
 * @param {object} notification - Notification data
 * @param {string} format - Format to use
 * @returns {string} Formatted message
 */
export const formatNotificationMessage = (notification, format = 'full') => {
  if (!notification || typeof notification !== 'object') return ''
  
  const { title, message, type, createdAt } = notification
  
  switch (format) {
    case 'full':
      return `${title}: ${message}`
    case 'short':
      return message.length > 100 ? `${message.substring(0, 100)}...` : message
    case 'title':
      return title
    case 'message':
      return message
    case 'with-time':
      const time = new Date(createdAt).toLocaleTimeString()
      return `${title}: ${message} (${time})`
    default:
      return `${title}: ${message}`
  }
}

/**
 * Check if notification is expired
 * @param {object} notification - Notification data
 * @returns {boolean} Is expired
 */
export const isNotificationExpired = (notification) => {
  if (!notification || !notification.expiresAt) return false
  
  const now = new Date()
  const expiresAt = new Date(notification.expiresAt)
  
  return now > expiresAt
}

/**
 * Check if notification is read
 * @param {object} notification - Notification data
 * @returns {boolean} Is read
 */
export const isNotificationRead = (notification) => {
  if (!notification || typeof notification !== 'object') return false
  
  return notification.isRead === true
}

/**
 * Mark notification as read
 * @param {object} notification - Notification data
 * @returns {object} Updated notification
 */
export const markNotificationAsRead = (notification) => {
  if (!notification || typeof notification !== 'object') {
    throw new Error('Notification data is required')
  }
  
  return {
    ...notification,
    isRead: true,
    readAt: new Date().toISOString()
  }
}

/**
 * Mark notification as unread
 * @param {object} notification - Notification data
 * @returns {object} Updated notification
 */
export const markNotificationAsUnread = (notification) => {
  if (!notification || typeof notification !== 'object') {
    throw new Error('Notification data is required')
  }
  
  return {
    ...notification,
    isRead: false,
    readAt: null
  }
}

/**
 * Sort notifications by criteria
 * @param {array} notifications - Notifications to sort
 * @param {string} criteria - Sort criteria
 * @param {string} direction - Sort direction
 * @returns {array} Sorted notifications
 */
export const sortNotifications = (notifications, criteria = 'createdAt', direction = 'desc') => {
  if (!notifications || !Array.isArray(notifications)) return []
  
  return [...notifications].sort((a, b) => {
    let aValue, bValue
    
    switch (criteria) {
      case 'createdAt':
        aValue = new Date(a.createdAt || 0)
        bValue = new Date(b.createdAt || 0)
        break
      case 'type':
        aValue = a.type?.toLowerCase() || ''
        bValue = b.type?.toLowerCase() || ''
        break
      case 'title':
        aValue = a.title?.toLowerCase() || ''
        bValue = b.title?.toLowerCase() || ''
        break
      case 'isRead':
        aValue = a.isRead ? 1 : 0
        bValue = b.isRead ? 1 : 0
        break
      case 'priority':
        aValue = a.priority || 0
        bValue = b.priority || 0
        break
      default:
        aValue = new Date(a.createdAt || 0)
        bValue = new Date(b.createdAt || 0)
    }
    
    if (direction === 'desc') {
      return bValue > aValue ? 1 : bValue < aValue ? -1 : 0
    }
    
    return aValue > bValue ? 1 : aValue < bValue ? -1 : 0
  })
}

/**
 * Filter notifications by criteria
 * @param {array} notifications - Notifications to filter
 * @param {object} filters - Filter criteria
 * @returns {array} Filtered notifications
 */
export const filterNotifications = (notifications, filters = {}) => {
  if (!notifications || !Array.isArray(notifications)) return []
  
  return notifications.filter(notification => {
    if (filters.type && notification.type !== filters.type) return false
    if (filters.isRead !== undefined && notification.isRead !== filters.isRead) return false
    if (filters.priority && notification.priority !== filters.priority) return false
    if (filters.search && !notification.title?.toLowerCase().includes(filters.search.toLowerCase()) && 
        !notification.message?.toLowerCase().includes(filters.search.toLowerCase())) return false
    if (filters.startDate && new Date(notification.createdAt) < new Date(filters.startDate)) return false
    if (filters.endDate && new Date(notification.createdAt) > new Date(filters.endDate)) return false
    
    return true
  })
}

/**
 * Group notifications by criteria
 * @param {array} notifications - Notifications to group
 * @param {string} criteria - Group criteria
 * @returns {object} Grouped notifications
 */
export const groupNotifications = (notifications, criteria = 'type') => {
  if (!notifications || !Array.isArray(notifications)) return {}
  
  return notifications.reduce((groups, notification) => {
    let key
    
    switch (criteria) {
      case 'type':
        key = notification.type
        break
      case 'isRead':
        key = notification.isRead ? 'read' : 'unread'
        break
      case 'date':
        key = new Date(notification.createdAt).toDateString()
        break
      case 'priority':
        key = notification.priority || 'normal'
        break
      default:
        key = notification.type
    }
    
    if (!groups[key]) {
      groups[key] = []
    }
    groups[key].push(notification)
    
    return groups
  }, {})
}

/**
 * Get notification statistics
 * @param {array} notifications - Notifications to analyze
 * @returns {object} Notification statistics
 */
export const getNotificationStatistics = (notifications) => {
  if (!notifications || !Array.isArray(notifications)) return {}
  
  const total = notifications.length
  const read = notifications.filter(notif => notif.isRead).length
  const unread = total - read
  const expired = notifications.filter(notif => isNotificationExpired(notif)).length
  
  const typeCounts = {}
  notifications.forEach(notif => {
    typeCounts[notif.type] = (typeCounts[notif.type] || 0) + 1
  })
  
  return {
    total,
    read,
    unread,
    expired,
    readRate: total > 0 ? (read / total) * 100 : 0,
    typeCounts
  }
}

/**
 * Create notification from template
 * @param {string} templateId - Template ID
 * @param {object} variables - Template variables
 * @returns {object} Notification
 */
export const createNotificationFromTemplate = (templateId, variables = {}) => {
  if (!templateId) {
    throw new Error('Template ID is required')
  }
  
  const template = getNotificationTemplate(templateId)
  if (!template) {
    throw new Error(`Template ${templateId} not found`)
  }
  
  const title = replaceTemplateVariables(template.title, variables)
  const message = replaceTemplateVariables(template.message, variables)
  
  return createNotification(template.type, title, message, {
    ...template.data,
    templateId,
    variables
  })
}

/**
 * Get notification template
 * @param {string} templateId - Template ID
 * @returns {object|null} Template data
 */
export const getNotificationTemplate = (templateId) => {
  const templates = getNotificationTemplates()
  return templates[templateId] || null
}

/**
 * Get notification templates
 * @returns {object} Template data
 */
export const getNotificationTemplates = () => {
  return {
    appointment_confirmed: {
      type: 'appointment',
      title: 'Appointment Confirmed',
      message: 'Your appointment for {{service}} on {{date}} at {{time}} has been confirmed.',
      data: { priority: 'high' }
    },
    appointment_reminder: {
      type: 'reminder',
      title: 'Appointment Reminder',
      message: 'Reminder: You have an appointment for {{service}} tomorrow at {{time}}.',
      data: { priority: 'high' }
    },
    appointment_cancelled: {
      type: 'appointment',
      title: 'Appointment Cancelled',
      message: 'Your appointment for {{service}} on {{date}} has been cancelled.',
      data: { priority: 'medium' }
    },
    payment_success: {
      type: 'payment',
      title: 'Payment Successful',
      message: 'Your payment of ${{amount}} has been processed successfully.',
      data: { priority: 'high' }
    },
    payment_failed: {
      type: 'error',
      title: 'Payment Failed',
      message: 'Your payment of ${{amount}} could not be processed. Please try again.',
      data: { priority: 'high' }
    },
    promotion: {
      type: 'promotion',
      title: 'Special Offer',
      message: '{{message}}',
      data: { priority: 'low' }
    },
    system_maintenance: {
      type: 'system',
      title: 'System Maintenance',
      message: 'The system will be under maintenance from {{startTime}} to {{endTime}}.',
      data: { priority: 'medium' }
    }
  }
}

/**
 * Replace template variables
 * @param {string} template - Template string
 * @param {object} variables - Variables to replace
 * @returns {string} Processed template
 */
export const replaceTemplateVariables = (template, variables) => {
  if (!template || typeof template !== 'string') return ''
  
  return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    return variables[key] || match
  })
}

/**
 * Schedule notification
 * @param {object} notification - Notification data
 * @param {Date} scheduleTime - Time to schedule
 * @returns {object} Scheduled notification
 */
export const scheduleNotification = (notification, scheduleTime) => {
  if (!notification || !scheduleTime) {
    throw new Error('Notification and schedule time are required')
  }
  
  return {
    ...notification,
    scheduledAt: scheduleTime.toISOString(),
    isScheduled: true
  }
}

/**
 * Get notification priority
 * @param {string} type - Notification type
 * @returns {string} Priority level
 */
export const getNotificationPriority = (type) => {
  const priorityMap = {
    error: 'high',
    payment: 'high',
    appointment: 'high',
    reminder: 'high',
    warning: 'medium',
    info: 'medium',
    promotion: 'low',
    system: 'medium'
  }
  
  return priorityMap[type] || 'medium'
}

/**
 * Notification constants
 */
export const NOTIFICATION_CONSTANTS = {
  TYPES: {
    INFO: 'info',
    SUCCESS: 'success',
    WARNING: 'warning',
    ERROR: 'error',
    APPOINTMENT: 'appointment',
    PAYMENT: 'payment',
    REMINDER: 'reminder',
    PROMOTION: 'promotion',
    SYSTEM: 'system'
  },
  PRIORITIES: {
    LOW: 'low',
    MEDIUM: 'medium',
    HIGH: 'high'
  },
  SORT_CRITERIA: {
    CREATED_AT: 'createdAt',
    TYPE: 'type',
    TITLE: 'title',
    IS_READ: 'isRead',
    PRIORITY: 'priority'
  },
  SORT_DIRECTIONS: {
    ASC: 'asc',
    DESC: 'desc'
  },
  GROUP_CRITERIA: {
    TYPE: 'type',
    IS_READ: 'isRead',
    DATE: 'date',
    PRIORITY: 'priority'
  },
  FORMATS: {
    FULL: 'full',
    SHORT: 'short',
    TITLE: 'title',
    MESSAGE: 'message',
    WITH_TIME: 'with-time'
  }
}

export default {
  createNotification,
  generateNotificationId,
  isValidNotification,
  getNotificationTypeDisplayName,
  getNotificationTypeColor,
  getNotificationTypeIcon,
  formatNotificationMessage,
  isNotificationExpired,
  isNotificationRead,
  markNotificationAsRead,
  markNotificationAsUnread,
  sortNotifications,
  filterNotifications,
  groupNotifications,
  getNotificationStatistics,
  createNotificationFromTemplate,
  getNotificationTemplate,
  getNotificationTemplates,
  replaceTemplateVariables,
  scheduleNotification,
  getNotificationPriority,
  NOTIFICATION_CONSTANTS
}
