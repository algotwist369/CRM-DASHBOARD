/**
 * Report utility functions
 */

/**
 * Create report
 * @param {string} name - Report name
 * @param {string} type - Report type
 * @param {object} parameters - Report parameters
 * @param {object} data - Report data
 * @returns {object} Report object
 */
export const createReport = (name, type, parameters, data = {}) => {
  if (!name || !type || !parameters) {
    throw new Error('Name, type, and parameters are required')
  }
  
  return {
    id: generateReportId(),
    name: name.trim(),
    type,
    parameters,
    data,
    status: 'generating',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    generatedAt: null,
    expiresAt: null,
    metadata: {
      totalRecords: 0,
      fileSize: 0,
      format: 'json'
    }
  }
}

/**
 * Generate report ID
 * @returns {string} Report ID
 */
export const generateReportId = () => {
  return `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Validate report data
 * @param {object} report - Report data
 * @returns {object} Validation result
 */
export const validateReportData = (report) => {
  if (!report || typeof report !== 'object') {
    return { isValid: false, error: 'Report data is required' }
  }
  
  const { name, type, parameters } = report
  
  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    return { isValid: false, error: 'Report name must be at least 2 characters' }
  }
  
  if (!type || typeof type !== 'string') {
    return { isValid: false, error: 'Report type is required' }
  }
  
  if (!parameters || typeof parameters !== 'object') {
    return { isValid: false, error: 'Report parameters are required' }
  }
  
  return { isValid: true, error: null }
}

/**
 * Get report type display name
 * @param {string} type - Report type
 * @returns {string} Display name
 */
export const getReportTypeDisplayName = (type) => {
  const typeMap = {
    appointment: 'Appointment Report',
    customer: 'Customer Report',
    staff: 'Staff Report',
    service: 'Service Report',
    payment: 'Payment Report',
    revenue: 'Revenue Report',
    analytics: 'Analytics Report',
    performance: 'Performance Report',
    inventory: 'Inventory Report',
    marketing: 'Marketing Report',
    custom: 'Custom Report'
  }
  
  return typeMap[type] || 'Report'
}

/**
 * Get report status display name
 * @param {string} status - Report status
 * @returns {string} Display name
 */
export const getReportStatusDisplayName = (status) => {
  const statusMap = {
    generating: 'Generating',
    completed: 'Completed',
    failed: 'Failed',
    expired: 'Expired',
    cancelled: 'Cancelled'
  }
  
  return statusMap[status] || 'Unknown'
}

/**
 * Get report status color
 * @param {string} status - Report status
 * @returns {string} Color class
 */
export const getReportStatusColor = (status) => {
  const colorMap = {
    generating: 'yellow',
    completed: 'green',
    failed: 'red',
    expired: 'gray',
    cancelled: 'orange'
  }
  
  return colorMap[status] || 'gray'
}

/**
 * Get report status icon
 * @param {string} status - Report status
 * @returns {string} Icon name
 */
export const getReportStatusIcon = (status) => {
  const iconMap = {
    generating: 'spinner',
    completed: 'check-circle',
    failed: 'times-circle',
    expired: 'clock',
    cancelled: 'ban'
  }
  
  return iconMap[status] || 'file'
}

/**
 * Update report status
 * @param {object} report - Report data
 * @param {string} status - New status
 * @param {object} metadata - Additional metadata
 * @returns {object} Updated report
 */
export const updateReportStatus = (report, status, metadata = {}) => {
  if (!report || !status) {
    throw new Error('Report and status are required')
  }
  
  const updatedReport = {
    ...report,
    status,
    updatedAt: new Date().toISOString()
  }
  
  if (status === 'completed') {
    updatedReport.generatedAt = new Date().toISOString()
    updatedReport.metadata = {
      ...report.metadata,
      ...metadata
    }
  }
  
  return updatedReport
}

/**
 * Calculate report statistics
 * @param {object} report - Report data
 * @returns {object} Report statistics
 */
export const calculateReportStatistics = (report) => {
  if (!report || !report.data) return {}
  
  const { data, metadata } = report
  
  return {
    totalRecords: metadata?.totalRecords || 0,
    fileSize: metadata?.fileSize || 0,
    format: metadata?.format || 'json',
    generationTime: report.generatedAt ? 
      new Date(report.generatedAt) - new Date(report.createdAt) : 0,
    age: new Date() - new Date(report.createdAt)
  }
}

/**
 * Sort reports by criteria
 * @param {array} reports - Reports to sort
 * @param {string} criteria - Sort criteria
 * @param {string} direction - Sort direction
 * @returns {array} Sorted reports
 */
export const sortReports = (reports, criteria = 'createdAt', direction = 'desc') => {
  if (!reports || !Array.isArray(reports)) return []
  
  return [...reports].sort((a, b) => {
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
      case 'generatedAt':
        aValue = new Date(a.generatedAt || 0)
        bValue = new Date(b.generatedAt || 0)
        break
      case 'totalRecords':
        aValue = a.metadata?.totalRecords || 0
        bValue = b.metadata?.totalRecords || 0
        break
      case 'fileSize':
        aValue = a.metadata?.fileSize || 0
        bValue = b.metadata?.fileSize || 0
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
 * Filter reports by criteria
 * @param {array} reports - Reports to filter
 * @param {object} filters - Filter criteria
 * @returns {array} Filtered reports
 */
export const filterReports = (reports, filters = {}) => {
  if (!reports || !Array.isArray(reports)) return []
  
  return reports.filter(report => {
    if (filters.type && report.type !== filters.type) return false
    if (filters.status && report.status !== filters.status) return false
    if (filters.search && !report.name?.toLowerCase().includes(filters.search.toLowerCase())) return false
    if (filters.startDate && new Date(report.createdAt) < new Date(filters.startDate)) return false
    if (filters.endDate && new Date(report.createdAt) > new Date(filters.endDate)) return false
    if (filters.minRecords && (report.metadata?.totalRecords || 0) < filters.minRecords) return false
    if (filters.maxRecords && (report.metadata?.totalRecords || 0) > filters.maxRecords) return false
    
    return true
  })
}

/**
 * Group reports by criteria
 * @param {array} reports - Reports to group
 * @param {string} criteria - Group criteria
 * @returns {object} Grouped reports
 */
export const groupReports = (reports, criteria = 'type') => {
  if (!reports || !Array.isArray(reports)) return {}
  
  return reports.reduce((groups, report) => {
    let key
    
    switch (criteria) {
      case 'type':
        key = report.type
        break
      case 'status':
        key = report.status
        break
      case 'date':
        key = new Date(report.createdAt).toDateString()
        break
      case 'month':
        const date = new Date(report.createdAt)
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
        break
      default:
        key = report.type
    }
    
    if (!groups[key]) {
      groups[key] = []
    }
    groups[key].push(report)
    
    return groups
  }, {})
}

/**
 * Get report templates
 * @returns {object} Report templates
 */
export const getReportTemplates = () => {
  return {
    appointment_summary: {
      name: 'Appointment Summary',
      type: 'appointment',
      description: 'Summary of appointments for a specific period',
      parameters: {
        startDate: { type: 'date', required: true },
        endDate: { type: 'date', required: true },
        status: { type: 'select', options: ['all', 'completed', 'cancelled', 'no-show'] },
        staffId: { type: 'select', options: [] },
        serviceId: { type: 'select', options: [] }
      }
    },
    customer_analytics: {
      name: 'Customer Analytics',
      type: 'customer',
      description: 'Customer analytics and insights',
      parameters: {
        startDate: { type: 'date', required: true },
        endDate: { type: 'date', required: true },
        segment: { type: 'select', options: ['all', 'new', 'returning', 'vip'] },
        ageGroup: { type: 'select', options: ['all', '18-25', '26-35', '36-50', '50+'] }
      }
    },
    staff_performance: {
      name: 'Staff Performance',
      type: 'staff',
      description: 'Staff performance metrics and statistics',
      parameters: {
        startDate: { type: 'date', required: true },
        endDate: { type: 'date', required: true },
        staffId: { type: 'select', options: [] },
        metrics: { type: 'multiselect', options: ['appointments', 'revenue', 'rating', 'hours'] }
      }
    },
    revenue_report: {
      name: 'Revenue Report',
      type: 'revenue',
      description: 'Revenue analysis and trends',
      parameters: {
        startDate: { type: 'date', required: true },
        endDate: { type: 'date', required: true },
        groupBy: { type: 'select', options: ['day', 'week', 'month', 'service', 'staff'] },
        includeTaxes: { type: 'boolean', default: true }
      }
    },
    service_analytics: {
      name: 'Service Analytics',
      type: 'service',
      description: 'Service performance and popularity analysis',
      parameters: {
        startDate: { type: 'date', required: true },
        endDate: { type: 'date', required: true },
        serviceId: { type: 'select', options: [] },
        metrics: { type: 'multiselect', options: ['bookings', 'revenue', 'rating', 'duration'] }
      }
    }
  }
}

/**
 * Create report from template
 * @param {string} templateId - Template ID
 * @param {object} parameters - Report parameters
 * @returns {object} Report
 */
export const createReportFromTemplate = (templateId, parameters) => {
  if (!templateId || !parameters) {
    throw new Error('Template ID and parameters are required')
  }
  
  const templates = getReportTemplates()
  const template = templates[templateId]
  
  if (!template) {
    throw new Error(`Template ${templateId} not found`)
  }
  
  return createReport(template.name, template.type, parameters)
}

/**
 * Validate report parameters
 * @param {object} template - Report template
 * @param {object} parameters - Parameters to validate
 * @returns {object} Validation result
 */
export const validateReportParameters = (template, parameters) => {
  if (!template || !parameters) {
    return { isValid: false, error: 'Template and parameters are required' }
  }
  
  const { parameters: templateParams } = template
  
  for (const [key, param] of Object.entries(templateParams)) {
    if (param.required && !parameters[key]) {
      return { isValid: false, error: `Parameter ${key} is required` }
    }
    
    if (parameters[key] && param.type === 'date') {
      const date = new Date(parameters[key])
      if (isNaN(date.getTime())) {
        return { isValid: false, error: `Parameter ${key} must be a valid date` }
      }
    }
    
    if (parameters[key] && param.options && !param.options.includes(parameters[key])) {
      return { isValid: false, error: `Parameter ${key} must be one of: ${param.options.join(', ')}` }
    }
  }
  
  return { isValid: true, error: null }
}

/**
 * Get report data summary
 * @param {object} report - Report data
 * @returns {object} Data summary
 */
export const getReportDataSummary = (report) => {
  if (!report || !report.data) return {}
  
  const { data } = report
  
  if (Array.isArray(data)) {
    return {
      type: 'array',
      count: data.length,
      sample: data.slice(0, 5)
    }
  }
  
  if (typeof data === 'object') {
    return {
      type: 'object',
      keys: Object.keys(data),
      count: Object.keys(data).length
    }
  }
  
  return {
    type: typeof data,
    value: data
  }
}

/**
 * Check if report is expired
 * @param {object} report - Report data
 * @returns {boolean} Is expired
 */
export const isReportExpired = (report) => {
  if (!report || !report.expiresAt) return false
  
  const now = new Date()
  const expiresAt = new Date(report.expiresAt)
  
  return now > expiresAt
}

/**
 * Set report expiration
 * @param {object} report - Report data
 * @param {number} hours - Hours until expiration
 * @returns {object} Updated report
 */
export const setReportExpiration = (report, hours = 24) => {
  if (!report) {
    throw new Error('Report is required')
  }
  
  const expiresAt = new Date()
  expiresAt.setHours(expiresAt.getHours() + hours)
  
  return {
    ...report,
    expiresAt: expiresAt.toISOString(),
    updatedAt: new Date().toISOString()
  }
}

/**
 * Get report file name
 * @param {object} report - Report data
 * @param {string} format - File format
 * @returns {string} File name
 */
export const getReportFileName = (report, format = 'json') => {
  if (!report) return 'report'
  
  const name = report.name.toLowerCase().replace(/[^a-z0-9]/g, '_')
  const date = new Date(report.createdAt).toISOString().split('T')[0]
  
  return `${name}_${date}.${format}`
}

/**
 * Report constants
 */
export const REPORT_CONSTANTS = {
  TYPES: {
    APPOINTMENT: 'appointment',
    CUSTOMER: 'customer',
    STAFF: 'staff',
    SERVICE: 'service',
    PAYMENT: 'payment',
    REVENUE: 'revenue',
    ANALYTICS: 'analytics',
    PERFORMANCE: 'performance',
    INVENTORY: 'inventory',
    MARKETING: 'marketing',
    CUSTOM: 'custom'
  },
  STATUSES: {
    GENERATING: 'generating',
    COMPLETED: 'completed',
    FAILED: 'failed',
    EXPIRED: 'expired',
    CANCELLED: 'cancelled'
  },
  FORMATS: {
    JSON: 'json',
    CSV: 'csv',
    EXCEL: 'xlsx',
    PDF: 'pdf'
  },
  SORT_CRITERIA: {
    NAME: 'name',
    TYPE: 'type',
    STATUS: 'status',
    CREATED_AT: 'createdAt',
    GENERATED_AT: 'generatedAt',
    TOTAL_RECORDS: 'totalRecords',
    FILE_SIZE: 'fileSize'
  },
  SORT_DIRECTIONS: {
    ASC: 'asc',
    DESC: 'desc'
  },
  GROUP_CRITERIA: {
    TYPE: 'type',
    STATUS: 'status',
    DATE: 'date',
    MONTH: 'month'
  }
}

export default {
  createReport,
  generateReportId,
  validateReportData,
  getReportTypeDisplayName,
  getReportStatusDisplayName,
  getReportStatusColor,
  getReportStatusIcon,
  updateReportStatus,
  calculateReportStatistics,
  sortReports,
  filterReports,
  groupReports,
  getReportTemplates,
  createReportFromTemplate,
  validateReportParameters,
  getReportDataSummary,
  isReportExpired,
  setReportExpiration,
  getReportFileName,
  REPORT_CONSTANTS
}
