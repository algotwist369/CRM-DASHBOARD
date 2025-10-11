/**
 * Notification campaign utility functions
 */

/**
 * Create notification campaign
 * @param {string} name - Campaign name
 * @param {string} type - Campaign type
 * @param {object} content - Campaign content
 * @param {array} recipients - Recipient list
 * @returns {object} Campaign object
 */
export const createNotificationCampaign = (name, type, content, recipients = []) => {
  if (!name || !type || !content) {
    throw new Error('Name, type, and content are required')
  }
  
  return {
    id: generateCampaignId(),
    name: name.trim(),
    type,
    content,
    recipients,
    status: 'draft',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    scheduledAt: null,
    sentAt: null,
    statistics: {
      totalRecipients: recipients.length,
      sent: 0,
      delivered: 0,
      opened: 0,
      clicked: 0,
      bounced: 0,
      unsubscribed: 0
    }
  }
}

/**
 * Generate campaign ID
 * @returns {string} Campaign ID
 */
export const generateCampaignId = () => {
  return `campaign_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Validate campaign data
 * @param {object} campaign - Campaign data
 * @returns {object} Validation result
 */
export const validateCampaignData = (campaign) => {
  if (!campaign || typeof campaign !== 'object') {
    return { isValid: false, error: 'Campaign data is required' }
  }
  
  const { name, type, content, recipients } = campaign
  
  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    return { isValid: false, error: 'Campaign name must be at least 2 characters' }
  }
  
  if (!type || typeof type !== 'string') {
    return { isValid: false, error: 'Campaign type is required' }
  }
  
  if (!content || typeof content !== 'object') {
    return { isValid: false, error: 'Campaign content is required' }
  }
  
  if (!content.title || !content.message) {
    return { isValid: false, error: 'Campaign title and message are required' }
  }
  
  if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
    return { isValid: false, error: 'At least one recipient is required' }
  }
  
  return { isValid: true, error: null }
}

/**
 * Get campaign type display name
 * @param {string} type - Campaign type
 * @returns {string} Display name
 */
export const getCampaignTypeDisplayName = (type) => {
  const typeMap = {
    email: 'Email Campaign',
    sms: 'SMS Campaign',
    push: 'Push Notification',
    in_app: 'In-App Notification',
    marketing: 'Marketing Campaign',
    promotional: 'Promotional Campaign',
    transactional: 'Transactional Campaign',
    reminder: 'Reminder Campaign',
    announcement: 'Announcement Campaign'
  }
  
  return typeMap[type] || 'Campaign'
}

/**
 * Get campaign status display name
 * @param {string} status - Campaign status
 * @returns {string} Display name
 */
export const getCampaignStatusDisplayName = (status) => {
  const statusMap = {
    draft: 'Draft',
    scheduled: 'Scheduled',
    sending: 'Sending',
    sent: 'Sent',
    paused: 'Paused',
    cancelled: 'Cancelled',
    failed: 'Failed'
  }
  
  return statusMap[status] || 'Unknown'
}

/**
 * Get campaign status color
 * @param {string} status - Campaign status
 * @returns {string} Color class
 */
export const getCampaignStatusColor = (status) => {
  const colorMap = {
    draft: 'gray',
    scheduled: 'blue',
    sending: 'yellow',
    sent: 'green',
    paused: 'orange',
    cancelled: 'red',
    failed: 'red'
  }
  
  return colorMap[status] || 'gray'
}

/**
 * Schedule campaign
 * @param {object} campaign - Campaign data
 * @param {Date} scheduleTime - Time to schedule
 * @returns {object} Updated campaign
 */
export const scheduleCampaign = (campaign, scheduleTime) => {
  if (!campaign || !scheduleTime) {
    throw new Error('Campaign and schedule time are required')
  }
  
  if (campaign.status !== 'draft') {
    throw new Error('Only draft campaigns can be scheduled')
  }
  
  return {
    ...campaign,
    status: 'scheduled',
    scheduledAt: scheduleTime.toISOString(),
    updatedAt: new Date().toISOString()
  }
}

/**
 * Start campaign
 * @param {object} campaign - Campaign data
 * @returns {object} Updated campaign
 */
export const startCampaign = (campaign) => {
  if (!campaign) {
    throw new Error('Campaign is required')
  }
  
  if (campaign.status !== 'scheduled' && campaign.status !== 'draft') {
    throw new Error('Campaign must be scheduled or draft to start')
  }
  
  return {
    ...campaign,
    status: 'sending',
    sentAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
}

/**
 * Pause campaign
 * @param {object} campaign - Campaign data
 * @returns {object} Updated campaign
 */
export const pauseCampaign = (campaign) => {
  if (!campaign) {
    throw new Error('Campaign is required')
  }
  
  if (campaign.status !== 'sending') {
    throw new Error('Only sending campaigns can be paused')
  }
  
  return {
    ...campaign,
    status: 'paused',
    updatedAt: new Date().toISOString()
  }
}

/**
 * Resume campaign
 * @param {object} campaign - Campaign data
 * @returns {object} Updated campaign
 */
export const resumeCampaign = (campaign) => {
  if (!campaign) {
    throw new Error('Campaign is required')
  }
  
  if (campaign.status !== 'paused') {
    throw new Error('Only paused campaigns can be resumed')
  }
  
  return {
    ...campaign,
    status: 'sending',
    updatedAt: new Date().toISOString()
  }
}

/**
 * Cancel campaign
 * @param {object} campaign - Campaign data
 * @returns {object} Updated campaign
 */
export const cancelCampaign = (campaign) => {
  if (!campaign) {
    throw new Error('Campaign is required')
  }
  
  if (campaign.status === 'sent') {
    throw new Error('Sent campaigns cannot be cancelled')
  }
  
  return {
    ...campaign,
    status: 'cancelled',
    updatedAt: new Date().toISOString()
  }
}

/**
 * Complete campaign
 * @param {object} campaign - Campaign data
 * @returns {object} Updated campaign
 */
export const completeCampaign = (campaign) => {
  if (!campaign) {
    throw new Error('Campaign is required')
  }
  
  if (campaign.status !== 'sending') {
    throw new Error('Only sending campaigns can be completed')
  }
  
  return {
    ...campaign,
    status: 'sent',
    updatedAt: new Date().toISOString()
  }
}

/**
 * Update campaign statistics
 * @param {object} campaign - Campaign data
 * @param {object} stats - Statistics to update
 * @returns {object} Updated campaign
 */
export const updateCampaignStatistics = (campaign, stats) => {
  if (!campaign || !stats) {
    throw new Error('Campaign and statistics are required')
  }
  
  return {
    ...campaign,
    statistics: {
      ...campaign.statistics,
      ...stats,
      updatedAt: new Date().toISOString()
    },
    updatedAt: new Date().toISOString()
  }
}

/**
 * Calculate campaign performance
 * @param {object} campaign - Campaign data
 * @returns {object} Performance metrics
 */
export const calculateCampaignPerformance = (campaign) => {
  if (!campaign || !campaign.statistics) return {}
  
  const { totalRecipients, sent, delivered, opened, clicked, bounced, unsubscribed } = campaign.statistics
  
  return {
    deliveryRate: totalRecipients > 0 ? (delivered / totalRecipients) * 100 : 0,
    openRate: delivered > 0 ? (opened / delivered) * 100 : 0,
    clickRate: delivered > 0 ? (clicked / delivered) * 100 : 0,
    bounceRate: totalRecipients > 0 ? (bounced / totalRecipients) * 100 : 0,
    unsubscribeRate: totalRecipients > 0 ? (unsubscribed / totalRecipients) * 100 : 0,
    engagementRate: delivered > 0 ? ((opened + clicked) / delivered) * 100 : 0
  }
}

/**
 * Get campaign recipients
 * @param {object} campaign - Campaign data
 * @param {string} status - Recipient status filter
 * @returns {array} Filtered recipients
 */
export const getCampaignRecipients = (campaign, status = null) => {
  if (!campaign || !campaign.recipients) return []
  
  if (!status) return campaign.recipients
  
  return campaign.recipients.filter(recipient => recipient.status === status)
}

/**
 * Add recipient to campaign
 * @param {object} campaign - Campaign data
 * @param {object} recipient - Recipient data
 * @returns {object} Updated campaign
 */
export const addCampaignRecipient = (campaign, recipient) => {
  if (!campaign || !recipient) {
    throw new Error('Campaign and recipient are required')
  }
  
  if (campaign.status !== 'draft') {
    throw new Error('Recipients can only be added to draft campaigns')
  }
  
  const updatedRecipients = [...(campaign.recipients || []), recipient]
  
  return {
    ...campaign,
    recipients: updatedRecipients,
    statistics: {
      ...campaign.statistics,
      totalRecipients: updatedRecipients.length
    },
    updatedAt: new Date().toISOString()
  }
}

/**
 * Remove recipient from campaign
 * @param {object} campaign - Campaign data
 * @param {string} recipientId - Recipient ID
 * @returns {object} Updated campaign
 */
export const removeCampaignRecipient = (campaign, recipientId) => {
  if (!campaign || !recipientId) {
    throw new Error('Campaign and recipient ID are required')
  }
  
  if (campaign.status !== 'draft') {
    throw new Error('Recipients can only be removed from draft campaigns')
  }
  
  const updatedRecipients = (campaign.recipients || []).filter(r => r.id !== recipientId)
  
  return {
    ...campaign,
    recipients: updatedRecipients,
    statistics: {
      ...campaign.statistics,
      totalRecipients: updatedRecipients.length
    },
    updatedAt: new Date().toISOString()
  }
}

/**
 * Sort campaigns by criteria
 * @param {array} campaigns - Campaigns to sort
 * @param {string} criteria - Sort criteria
 * @param {string} direction - Sort direction
 * @returns {array} Sorted campaigns
 */
export const sortCampaigns = (campaigns, criteria = 'createdAt', direction = 'desc') => {
  if (!campaigns || !Array.isArray(campaigns)) return []
  
  return [...campaigns].sort((a, b) => {
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
      case 'status':
        aValue = a.status?.toLowerCase() || ''
        bValue = b.status?.toLowerCase() || ''
        break
      case 'createdAt':
        aValue = new Date(a.createdAt || 0)
        bValue = new Date(b.createdAt || 0)
        break
      case 'scheduledAt':
        aValue = new Date(a.scheduledAt || 0)
        bValue = new Date(b.scheduledAt || 0)
        break
      case 'sentAt':
        aValue = new Date(a.sentAt || 0)
        bValue = new Date(b.sentAt || 0)
        break
      case 'totalRecipients':
        aValue = a.statistics?.totalRecipients || 0
        bValue = b.statistics?.totalRecipients || 0
        break
      case 'deliveryRate':
        aValue = calculateCampaignPerformance(a).deliveryRate || 0
        bValue = calculateCampaignPerformance(b).deliveryRate || 0
        break
      case 'openRate':
        aValue = calculateCampaignPerformance(a).openRate || 0
        bValue = calculateCampaignPerformance(b).openRate || 0
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
 * Filter campaigns by criteria
 * @param {array} campaigns - Campaigns to filter
 * @param {object} filters - Filter criteria
 * @returns {array} Filtered campaigns
 */
export const filterCampaigns = (campaigns, filters = {}) => {
  if (!campaigns || !Array.isArray(campaigns)) return []
  
  return campaigns.filter(campaign => {
    if (filters.type && campaign.type !== filters.type) return false
    if (filters.status && campaign.status !== filters.status) return false
    if (filters.search && !campaign.name?.toLowerCase().includes(filters.search.toLowerCase())) return false
    if (filters.startDate && new Date(campaign.createdAt) < new Date(filters.startDate)) return false
    if (filters.endDate && new Date(campaign.createdAt) > new Date(filters.endDate)) return false
    if (filters.minRecipients && (campaign.statistics?.totalRecipients || 0) < filters.minRecipients) return false
    if (filters.maxRecipients && (campaign.statistics?.totalRecipients || 0) > filters.maxRecipients) return false
    
    return true
  })
}

/**
 * Get campaign templates
 * @returns {object} Campaign templates
 */
export const getCampaignTemplates = () => {
  return {
    welcome_email: {
      name: 'Welcome Email',
      type: 'email',
      content: {
        title: 'Welcome to {{businessName}}!',
        message: 'Thank you for joining us. We\'re excited to have you as a customer.',
        subject: 'Welcome to {{businessName}}'
      }
    },
    appointment_reminder: {
      name: 'Appointment Reminder',
      type: 'email',
      content: {
        title: 'Appointment Reminder',
        message: 'Reminder: You have an appointment for {{service}} on {{date}} at {{time}}.',
        subject: 'Appointment Reminder - {{service}}'
      }
    },
    promotion: {
      name: 'Promotional Campaign',
      type: 'email',
      content: {
        title: 'Special Offer',
        message: '{{message}}',
        subject: 'Special Offer - {{businessName}}'
      }
    },
    newsletter: {
      name: 'Newsletter',
      type: 'email',
      content: {
        title: 'Monthly Newsletter',
        message: '{{content}}',
        subject: '{{businessName}} Newsletter - {{month}}'
      }
    }
  }
}

/**
 * Create campaign from template
 * @param {string} templateId - Template ID
 * @param {object} variables - Template variables
 * @param {array} recipients - Recipient list
 * @returns {object} Campaign
 */
export const createCampaignFromTemplate = (templateId, variables = {}, recipients = []) => {
  if (!templateId) {
    throw new Error('Template ID is required')
  }
  
  const templates = getCampaignTemplates()
  const template = templates[templateId]
  
  if (!template) {
    throw new Error(`Template ${templateId} not found`)
  }
  
  const content = {
    ...template.content,
    title: replaceTemplateVariables(template.content.title, variables),
    message: replaceTemplateVariables(template.content.message, variables),
    subject: replaceTemplateVariables(template.content.subject, variables)
  }
  
  return createNotificationCampaign(
    replaceTemplateVariables(template.name, variables),
    template.type,
    content,
    recipients
  )
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
 * Campaign constants
 */
export const CAMPAIGN_CONSTANTS = {
  TYPES: {
    EMAIL: 'email',
    SMS: 'sms',
    PUSH: 'push',
    IN_APP: 'in_app',
    MARKETING: 'marketing',
    PROMOTIONAL: 'promotional',
    TRANSACTIONAL: 'transactional',
    REMINDER: 'reminder',
    ANNOUNCEMENT: 'announcement'
  },
  STATUSES: {
    DRAFT: 'draft',
    SCHEDULED: 'scheduled',
    SENDING: 'sending',
    SENT: 'sent',
    PAUSED: 'paused',
    CANCELLED: 'cancelled',
    FAILED: 'failed'
  },
  SORT_CRITERIA: {
    NAME: 'name',
    TYPE: 'type',
    STATUS: 'status',
    CREATED_AT: 'createdAt',
    SCHEDULED_AT: 'scheduledAt',
    SENT_AT: 'sentAt',
    TOTAL_RECIPIENTS: 'totalRecipients',
    DELIVERY_RATE: 'deliveryRate',
    OPEN_RATE: 'openRate'
  },
  SORT_DIRECTIONS: {
    ASC: 'asc',
    DESC: 'desc'
  }
}

export default {
  createNotificationCampaign,
  generateCampaignId,
  validateCampaignData,
  getCampaignTypeDisplayName,
  getCampaignStatusDisplayName,
  getCampaignStatusColor,
  scheduleCampaign,
  startCampaign,
  pauseCampaign,
  resumeCampaign,
  cancelCampaign,
  completeCampaign,
  updateCampaignStatistics,
  calculateCampaignPerformance,
  getCampaignRecipients,
  addCampaignRecipient,
  removeCampaignRecipient,
  sortCampaigns,
  filterCampaigns,
  getCampaignTemplates,
  createCampaignFromTemplate,
  replaceTemplateVariables,
  CAMPAIGN_CONSTANTS
}
