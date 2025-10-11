/**
 * Notification template utility functions
 */

/**
 * Create notification template
 * @param {string} name - Template name
 * @param {string} type - Template type
 * @param {object} content - Template content
 * @param {object} variables - Template variables
 * @returns {object} Template object
 */
export const createNotificationTemplate = (name, type, content, variables = {}) => {
  if (!name || !type || !content) {
    throw new Error('Name, type, and content are required')
  }
  
  return {
    id: generateTemplateId(),
    name: name.trim(),
    type,
    content,
    variables,
    isActive: true,
    isDefault: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    usage: {
      totalUsed: 0,
      lastUsed: null
    }
  }
}

/**
 * Generate template ID
 * @returns {string} Template ID
 */
export const generateTemplateId = () => {
  return `template_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Validate template data
 * @param {object} template - Template data
 * @returns {object} Validation result
 */
export const validateTemplateData = (template) => {
  if (!template || typeof template !== 'object') {
    return { isValid: false, error: 'Template data is required' }
  }
  
  const { name, type, content } = template
  
  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    return { isValid: false, error: 'Template name must be at least 2 characters' }
  }
  
  if (!type || typeof type !== 'string') {
    return { isValid: false, error: 'Template type is required' }
  }
  
  if (!content || typeof content !== 'object') {
    return { isValid: false, error: 'Template content is required' }
  }
  
  if (!content.title || !content.message) {
    return { isValid: false, error: 'Template title and message are required' }
  }
  
  return { isValid: true, error: null }
}

/**
 * Get template type display name
 * @param {string} type - Template type
 * @returns {string} Display name
 */
export const getTemplateTypeDisplayName = (type) => {
  const typeMap = {
    email: 'Email Template',
    sms: 'SMS Template',
    push: 'Push Notification Template',
    in_app: 'In-App Template',
    appointment: 'Appointment Template',
    payment: 'Payment Template',
    reminder: 'Reminder Template',
    promotion: 'Promotion Template',
    system: 'System Template',
    marketing: 'Marketing Template'
  }
  
  return typeMap[type] || 'Template'
}

/**
 * Get template type color
 * @param {string} type - Template type
 * @returns {string} Color class
 */
export const getTemplateTypeColor = (type) => {
  const colorMap = {
    email: 'blue',
    sms: 'green',
    push: 'purple',
    in_app: 'orange',
    appointment: 'purple',
    payment: 'green',
    reminder: 'yellow',
    promotion: 'pink',
    system: 'gray',
    marketing: 'blue'
  }
  
  return colorMap[type] || 'gray'
}

/**
 * Get template type icon
 * @param {string} type - Template type
 * @returns {string} Icon name
 */
export const getTemplateTypeIcon = (type) => {
  const iconMap = {
    email: 'envelope',
    sms: 'comment',
    push: 'bell',
    in_app: 'mobile',
    appointment: 'calendar',
    payment: 'credit-card',
    reminder: 'clock',
    promotion: 'gift',
    system: 'cog',
    marketing: 'bullhorn'
  }
  
  return iconMap[type] || 'file'
}

/**
 * Process template with variables
 * @param {object} template - Template data
 * @param {object} variables - Variables to replace
 * @returns {object} Processed template
 */
export const processTemplate = (template, variables = {}) => {
  if (!template || typeof template !== 'object') {
    throw new Error('Template is required')
  }
  
  const { content } = template
  
  return {
    ...template,
    processedContent: {
      title: replaceTemplateVariables(content.title, variables),
      message: replaceTemplateVariables(content.message, variables),
      subject: content.subject ? replaceTemplateVariables(content.subject, variables) : null,
      body: content.body ? replaceTemplateVariables(content.body, variables) : null
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
 * Extract template variables
 * @param {string} template - Template string
 * @returns {array} Array of variable names
 */
export const extractTemplateVariables = (template) => {
  if (!template || typeof template !== 'string') return []
  
  const matches = template.match(/\{\{(\w+)\}\}/g)
  if (!matches) return []
  
  return [...new Set(matches.map(match => match.replace(/\{\{|\}\}/g, '')))]
}

/**
 * Validate template variables
 * @param {object} template - Template data
 * @param {object} variables - Variables to validate
 * @returns {object} Validation result
 */
export const validateTemplateVariables = (template, variables) => {
  if (!template || !variables) {
    return { isValid: false, error: 'Template and variables are required' }
  }
  
  const { content } = template
  const requiredVariables = []
  
  // Extract variables from all content fields
  if (content.title) {
    requiredVariables.push(...extractTemplateVariables(content.title))
  }
  if (content.message) {
    requiredVariables.push(...extractTemplateVariables(content.message))
  }
  if (content.subject) {
    requiredVariables.push(...extractTemplateVariables(content.subject))
  }
  if (content.body) {
    requiredVariables.push(...extractTemplateVariables(content.body))
  }
  
  const uniqueVariables = [...new Set(requiredVariables)]
  const missingVariables = uniqueVariables.filter(variable => !(variable in variables))
  
  if (missingVariables.length > 0) {
    return { 
      isValid: false, 
      error: `Missing required variables: ${missingVariables.join(', ')}` 
    }
  }
  
  return { isValid: true, error: null }
}

/**
 * Get template preview
 * @param {object} template - Template data
 * @param {object} variables - Variables to use
 * @returns {object} Template preview
 */
export const getTemplatePreview = (template, variables = {}) => {
  if (!template || typeof template !== 'object') {
    throw new Error('Template is required')
  }
  
  const processed = processTemplate(template, variables)
  
  return {
    id: template.id,
    name: template.name,
    type: template.type,
    preview: {
      title: processed.processedContent.title,
      message: processed.processedContent.message,
      subject: processed.processedContent.subject,
      body: processed.processedContent.body
    },
    variables: extractTemplateVariables(JSON.stringify(template.content)),
    usedVariables: Object.keys(variables)
  }
}

/**
 * Sort templates by criteria
 * @param {array} templates - Templates to sort
 * @param {string} criteria - Sort criteria
 * @param {string} direction - Sort direction
 * @returns {array} Sorted templates
 */
export const sortTemplates = (templates, criteria = 'name', direction = 'asc') => {
  if (!templates || !Array.isArray(templates)) return []
  
  return [...templates].sort((a, b) => {
    let aValue, bValue
    
    switch (criteria) {
      case 'name':
        aValue = a.name?.toLowerCase() || ''
        bValue = b.name?.toLowerCase() || ''
        break
      case 'type':
        aValue = a.type?.toLowerCase() || ''
        bValue = b.type?.toLowerCase() || ''
        break
      case 'createdAt':
        aValue = new Date(a.createdAt || 0)
        bValue = new Date(b.createdAt || 0)
        break
      case 'updatedAt':
        aValue = new Date(a.updatedAt || 0)
        bValue = new Date(b.updatedAt || 0)
        break
      case 'usage':
        aValue = a.usage?.totalUsed || 0
        bValue = b.usage?.totalUsed || 0
        break
      case 'lastUsed':
        aValue = new Date(a.usage?.lastUsed || 0)
        bValue = new Date(b.usage?.lastUsed || 0)
        break
      default:
        aValue = a.name?.toLowerCase() || ''
        bValue = b.name?.toLowerCase() || ''
    }
    
    if (direction === 'desc') {
      return bValue > aValue ? 1 : bValue < aValue ? -1 : 0
    }
    
    return aValue > bValue ? 1 : aValue < bValue ? -1 : 0
  })
}

/**
 * Filter templates by criteria
 * @param {array} templates - Templates to filter
 * @param {object} filters - Filter criteria
 * @returns {array} Filtered templates
 */
export const filterTemplates = (templates, filters = {}) => {
  if (!templates || !Array.isArray(templates)) return []
  
  return templates.filter(template => {
    if (filters.type && template.type !== filters.type) return false
    if (filters.isActive !== undefined && template.isActive !== filters.isActive) return false
    if (filters.isDefault !== undefined && template.isDefault !== filters.isDefault) return false
    if (filters.search && !template.name?.toLowerCase().includes(filters.search.toLowerCase())) return false
    if (filters.startDate && new Date(template.createdAt) < new Date(filters.startDate)) return false
    if (filters.endDate && new Date(template.createdAt) > new Date(filters.endDate)) return false
    
    return true
  })
}

/**
 * Group templates by criteria
 * @param {array} templates - Templates to group
 * @param {string} criteria - Group criteria
 * @returns {object} Grouped templates
 */
export const groupTemplates = (templates, criteria = 'type') => {
  if (!templates || !Array.isArray(templates)) return {}
  
  return templates.reduce((groups, template) => {
    let key
    
    switch (criteria) {
      case 'type':
        key = template.type
        break
      case 'isActive':
        key = template.isActive ? 'active' : 'inactive'
        break
      case 'isDefault':
        key = template.isDefault ? 'default' : 'custom'
        break
      default:
        key = template.type
    }
    
    if (!groups[key]) {
      groups[key] = []
    }
    groups[key].push(template)
    
    return groups
  }, {})
}

/**
 * Update template usage
 * @param {object} template - Template data
 * @returns {object} Updated template
 */
export const updateTemplateUsage = (template) => {
  if (!template || typeof template !== 'object') {
    throw new Error('Template is required')
  }
  
  return {
    ...template,
    usage: {
      totalUsed: (template.usage?.totalUsed || 0) + 1,
      lastUsed: new Date().toISOString()
    },
    updatedAt: new Date().toISOString()
  }
}

/**
 * Duplicate template
 * @param {object} template - Template to duplicate
 * @param {string} newName - New template name
 * @returns {object} Duplicated template
 */
export const duplicateTemplate = (template, newName) => {
  if (!template || typeof template !== 'object') {
    throw new Error('Template is required')
  }
  
  if (!newName || typeof newName !== 'string') {
    throw new Error('New name is required')
  }
  
  return {
    ...template,
    id: generateTemplateId(),
    name: newName.trim(),
    isDefault: false,
    usage: {
      totalUsed: 0,
      lastUsed: null
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
}

/**
 * Get default templates
 * @returns {object} Default templates
 */
export const getDefaultTemplates = () => {
  return {
    appointment_confirmed: {
      name: 'Appointment Confirmed',
      type: 'email',
      content: {
        title: 'Appointment Confirmed',
        message: 'Your appointment for {{service}} on {{date}} at {{time}} has been confirmed.',
        subject: 'Appointment Confirmed - {{service}}'
      },
      variables: ['service', 'date', 'time'],
      isDefault: true
    },
    appointment_reminder: {
      name: 'Appointment Reminder',
      type: 'email',
      content: {
        title: 'Appointment Reminder',
        message: 'Reminder: You have an appointment for {{service}} tomorrow at {{time}}.',
        subject: 'Appointment Reminder - {{service}}'
      },
      variables: ['service', 'time'],
      isDefault: true
    },
    appointment_cancelled: {
      name: 'Appointment Cancelled',
      type: 'email',
      content: {
        title: 'Appointment Cancelled',
        message: 'Your appointment for {{service}} on {{date}} has been cancelled.',
        subject: 'Appointment Cancelled - {{service}}'
      },
      variables: ['service', 'date'],
      isDefault: true
    },
    payment_success: {
      name: 'Payment Successful',
      type: 'email',
      content: {
        title: 'Payment Successful',
        message: 'Your payment of ${{amount}} has been processed successfully.',
        subject: 'Payment Confirmation - ${{amount}}'
      },
      variables: ['amount'],
      isDefault: true
    },
    payment_failed: {
      name: 'Payment Failed',
      type: 'email',
      content: {
        title: 'Payment Failed',
        message: 'Your payment of ${{amount}} could not be processed. Please try again.',
        subject: 'Payment Failed - ${{amount}}'
      },
      variables: ['amount'],
      isDefault: true
    },
    welcome: {
      name: 'Welcome Email',
      type: 'email',
      content: {
        title: 'Welcome to {{businessName}}!',
        message: 'Thank you for joining us. We\'re excited to have you as a customer.',
        subject: 'Welcome to {{businessName}}'
      },
      variables: ['businessName'],
      isDefault: true
    }
  }
}

/**
 * Get template statistics
 * @param {array} templates - Templates to analyze
 * @returns {object} Template statistics
 */
export const getTemplateStatistics = (templates) => {
  if (!templates || !Array.isArray(templates)) return {}
  
  const total = templates.length
  const active = templates.filter(t => t.isActive).length
  const defaultTemplates = templates.filter(t => t.isDefault).length
  const customTemplates = total - defaultTemplates
  
  const typeCounts = {}
  templates.forEach(template => {
    typeCounts[template.type] = (typeCounts[template.type] || 0) + 1
  })
  
  const totalUsage = templates.reduce((sum, t) => sum + (t.usage?.totalUsed || 0), 0)
  
  return {
    total,
    active,
    inactive: total - active,
    defaultTemplates,
    customTemplates,
    typeCounts,
    totalUsage,
    averageUsage: total > 0 ? totalUsage / total : 0
  }
}

/**
 * Template constants
 */
export const TEMPLATE_CONSTANTS = {
  TYPES: {
    EMAIL: 'email',
    SMS: 'sms',
    PUSH: 'push',
    IN_APP: 'in_app',
    APPOINTMENT: 'appointment',
    PAYMENT: 'payment',
    REMINDER: 'reminder',
    PROMOTION: 'promotion',
    SYSTEM: 'system',
    MARKETING: 'marketing'
  },
  SORT_CRITERIA: {
    NAME: 'name',
    TYPE: 'type',
    CREATED_AT: 'createdAt',
    UPDATED_AT: 'updatedAt',
    USAGE: 'usage',
    LAST_USED: 'lastUsed'
  },
  SORT_DIRECTIONS: {
    ASC: 'asc',
    DESC: 'desc'
  },
  GROUP_CRITERIA: {
    TYPE: 'type',
    IS_ACTIVE: 'isActive',
    IS_DEFAULT: 'isDefault'
  }
}

export default {
  createNotificationTemplate,
  generateTemplateId,
  validateTemplateData,
  getTemplateTypeDisplayName,
  getTemplateTypeColor,
  getTemplateTypeIcon,
  processTemplate,
  replaceTemplateVariables,
  extractTemplateVariables,
  validateTemplateVariables,
  getTemplatePreview,
  sortTemplates,
  filterTemplates,
  groupTemplates,
  updateTemplateUsage,
  duplicateTemplate,
  getDefaultTemplates,
  getTemplateStatistics,
  TEMPLATE_CONSTANTS
}
