/**
 * Customer segment utility functions
 */

/**
 * Create customer segment
 * @param {string} name - Segment name
 * @param {string} description - Segment description
 * @param {array} criteria - Segment criteria
 * @returns {object} Customer segment
 */
export const createCustomerSegment = (name, description, criteria) => {
  if (!name || !criteria || !Array.isArray(criteria)) {
    throw new Error('Name and criteria are required')
  }
  
  return {
    id: generateSegmentId(),
    name: name.trim(),
    description: description?.trim() || '',
    criteria,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isActive: true
  }
}

/**
 * Generate segment ID
 * @returns {string} Segment ID
 */
export const generateSegmentId = () => {
  return `seg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Validate segment criteria
 * @param {array} criteria - Segment criteria
 * @returns {boolean} Is valid criteria
 */
export const isValidSegmentCriteria = (criteria) => {
  if (!criteria || !Array.isArray(criteria)) return false
  
  return criteria.every(criterion => {
    if (!criterion || typeof criterion !== 'object') return false
    
    const { field, operator, value } = criterion
    return field && operator && value !== undefined
  })
}

/**
 * Apply segment criteria to customer
 * @param {object} customer - Customer data
 * @param {array} criteria - Segment criteria
 * @returns {boolean} Customer matches criteria
 */
export const applySegmentCriteria = (customer, criteria) => {
  if (!customer || !criteria || !Array.isArray(criteria)) return false
  
  return criteria.every(criterion => {
    const { field, operator, value } = criterion
    
    let customerValue = getCustomerFieldValue(customer, field)
    
    switch (operator) {
      case 'equals':
        return customerValue === value
      case 'not_equals':
        return customerValue !== value
      case 'contains':
        return String(customerValue).toLowerCase().includes(String(value).toLowerCase())
      case 'not_contains':
        return !String(customerValue).toLowerCase().includes(String(value).toLowerCase())
      case 'greater_than':
        return Number(customerValue) > Number(value)
      case 'less_than':
        return Number(customerValue) < Number(value)
      case 'greater_than_or_equal':
        return Number(customerValue) >= Number(value)
      case 'less_than_or_equal':
        return Number(customerValue) <= Number(value)
      case 'in':
        return Array.isArray(value) && value.includes(customerValue)
      case 'not_in':
        return Array.isArray(value) && !value.includes(customerValue)
      case 'is_empty':
        return !customerValue || customerValue === ''
      case 'is_not_empty':
        return customerValue && customerValue !== ''
      case 'starts_with':
        return String(customerValue).toLowerCase().startsWith(String(value).toLowerCase())
      case 'ends_with':
        return String(customerValue).toLowerCase().endsWith(String(value).toLowerCase())
      default:
        return false
    }
  })
}

/**
 * Get customer field value
 * @param {object} customer - Customer data
 * @param {string} field - Field path
 * @returns {any} Field value
 */
export const getCustomerFieldValue = (customer, field) => {
  if (!customer || !field) return null
  
  const fieldParts = field.split('.')
  let value = customer
  
  for (const part of fieldParts) {
    if (value && typeof value === 'object' && part in value) {
      value = value[part]
    } else {
      return null
    }
  }
  
  return value
}

/**
 * Segment customers
 * @param {array} customers - Customers to segment
 * @param {object} segment - Customer segment
 * @returns {array} Segmented customers
 */
export const segmentCustomers = (customers, segment) => {
  if (!customers || !Array.isArray(customers) || !segment) return []
  
  const { criteria } = segment
  if (!isValidSegmentCriteria(criteria)) return []
  
  return customers.filter(customer => applySegmentCriteria(customer, criteria))
}

/**
 * Get segment statistics
 * @param {array} customers - All customers
 * @param {object} segment - Customer segment
 * @returns {object} Segment statistics
 */
export const getSegmentStatistics = (customers, segment) => {
  if (!customers || !Array.isArray(customers) || !segment) return {}
  
  const segmentedCustomers = segmentCustomers(customers, segment)
  const totalCustomers = customers.length
  
  return {
    totalCustomers,
    segmentSize: segmentedCustomers.length,
    percentage: totalCustomers > 0 ? (segmentedCustomers.length / totalCustomers) * 100 : 0,
    averageLifetimeValue: calculateAverageLifetimeValue(segmentedCustomers),
    averageVisitFrequency: calculateAverageVisitFrequency(segmentedCustomers),
    averageSatisfactionScore: calculateAverageSatisfactionScore(segmentedCustomers),
    ageDistribution: calculateAgeDistribution(segmentedCustomers),
    statusDistribution: calculateStatusDistribution(segmentedCustomers)
  }
}

/**
 * Calculate average lifetime value for segment
 * @param {array} customers - Customers in segment
 * @returns {number} Average lifetime value
 */
export const calculateAverageLifetimeValue = (customers) => {
  if (!customers || !Array.isArray(customers) || customers.length === 0) return 0
  
  const totalValue = customers.reduce((sum, customer) => {
    return sum + calculateCustomerLifetimeValue(customer)
  }, 0)
  
  return totalValue / customers.length
}

/**
 * Calculate average visit frequency for segment
 * @param {array} customers - Customers in segment
 * @returns {number} Average visit frequency
 */
export const calculateAverageVisitFrequency = (customers) => {
  if (!customers || !Array.isArray(customers) || customers.length === 0) return 0
  
  const totalFrequency = customers.reduce((sum, customer) => {
    return sum + calculateCustomerVisitFrequency(customer)
  }, 0)
  
  return totalFrequency / customers.length
}

/**
 * Calculate average satisfaction score for segment
 * @param {array} customers - Customers in segment
 * @returns {number} Average satisfaction score
 */
export const calculateAverageSatisfactionScore = (customers) => {
  if (!customers || !Array.isArray(customers) || customers.length === 0) return 0
  
  const totalScore = customers.reduce((sum, customer) => {
    return sum + calculateCustomerSatisfactionScore(customer)
  }, 0)
  
  return totalScore / customers.length
}

/**
 * Calculate age distribution for segment
 * @param {array} customers - Customers in segment
 * @returns {object} Age distribution
 */
export const calculateAgeDistribution = (customers) => {
  if (!customers || !Array.isArray(customers)) return {}
  
  const distribution = {
    minor: 0,
    'young-adult': 0,
    adult: 0,
    'middle-aged': 0,
    mature: 0,
    senior: 0
  }
  
  customers.forEach(customer => {
    const ageGroup = getCustomerAgeGroup(customer.dateOfBirth)
    if (distribution[ageGroup] !== undefined) {
      distribution[ageGroup]++
    }
  })
  
  return distribution
}

/**
 * Calculate status distribution for segment
 * @param {array} customers - Customers in segment
 * @returns {object} Status distribution
 */
export const calculateStatusDistribution = (customers) => {
  if (!customers || !Array.isArray(customers)) return {}
  
  const distribution = {
    active: 0,
    inactive: 0,
    blocked: 0,
    unverified: 0
  }
  
  customers.forEach(customer => {
    const status = getCustomerStatus(customer)
    if (distribution[status] !== undefined) {
      distribution[status]++
    }
  })
  
  return distribution
}

/**
 * Create predefined segments
 * @returns {array} Predefined segments
 */
export const createPredefinedSegments = () => {
  return [
    {
      name: 'High Value Customers',
      description: 'Customers with high lifetime value',
      criteria: [
        { field: 'lifetimeValue', operator: 'greater_than', value: 1000 }
      ]
    },
    {
      name: 'Frequent Visitors',
      description: 'Customers who visit frequently',
      criteria: [
        { field: 'visitFrequency', operator: 'greater_than', value: 10 }
      ]
    },
    {
      name: 'New Customers',
      description: 'Customers who joined in the last 30 days',
      criteria: [
        { field: 'createdAt', operator: 'greater_than', value: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString() }
      ]
    },
    {
      name: 'At Risk Customers',
      description: 'Customers who haven\'t visited in 90 days',
      criteria: [
        { field: 'lastVisit', operator: 'less_than', value: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString() }
      ]
    },
    {
      name: 'Satisfied Customers',
      description: 'Customers with high satisfaction scores',
      criteria: [
        { field: 'satisfactionScore', operator: 'greater_than', value: 4.0 }
      ]
    },
    {
      name: 'Young Adults',
      description: 'Customers aged 18-25',
      criteria: [
        { field: 'ageGroup', operator: 'equals', value: 'young-adult' }
      ]
    },
    {
      name: 'Active Customers',
      description: 'Currently active customers',
      criteria: [
        { field: 'status', operator: 'equals', value: 'active' }
      ]
    }
  ]
}

/**
 * Validate segment name
 * @param {string} name - Segment name
 * @returns {boolean} Is valid name
 */
export const isValidSegmentName = (name) => {
  if (!name || typeof name !== 'string') return false
  return name.trim().length >= 2 && name.trim().length <= 100
}

/**
 * Validate segment description
 * @param {string} description - Segment description
 * @returns {boolean} Is valid description
 */
export const isValidSegmentDescription = (description) => {
  if (!description || typeof description !== 'string') return true // Optional field
  return description.trim().length <= 500
}

/**
 * Sort segments by criteria
 * @param {array} segments - Segments to sort
 * @param {string} criteria - Sort criteria
 * @param {string} direction - Sort direction
 * @returns {array} Sorted segments
 */
export const sortSegments = (segments, criteria = 'name', direction = 'asc') => {
  if (!segments || !Array.isArray(segments)) return []
  
  return [...segments].sort((a, b) => {
    let aValue, bValue
    
    switch (criteria) {
      case 'name':
        aValue = a.name?.toLowerCase() || ''
        bValue = b.name?.toLowerCase() || ''
        break
      case 'createdAt':
        aValue = new Date(a.createdAt || 0)
        bValue = new Date(b.createdAt || 0)
        break
      case 'updatedAt':
        aValue = new Date(a.updatedAt || 0)
        bValue = new Date(b.updatedAt || 0)
        break
      case 'size':
        aValue = a.size || 0
        bValue = b.size || 0
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
 * Filter segments by criteria
 * @param {array} segments - Segments to filter
 * @param {object} filters - Filter criteria
 * @returns {array} Filtered segments
 */
export const filterSegments = (segments, filters = {}) => {
  if (!segments || !Array.isArray(segments)) return []
  
  return segments.filter(segment => {
    if (filters.isActive !== undefined && segment.isActive !== filters.isActive) return false
    if (filters.search && !segment.name?.toLowerCase().includes(filters.search.toLowerCase())) return false
    if (filters.minSize && (segment.size || 0) < filters.minSize) return false
    if (filters.maxSize && (segment.size || 0) > filters.maxSize) return false
    
    return true
  })
}

/**
 * Export segment data
 * @param {array} customers - Customers in segment
 * @param {string} format - Export format
 * @returns {string} Exported data
 */
export const exportSegmentData = (customers, format = 'json') => {
  if (!customers || !Array.isArray(customers)) return ''
  
  switch (format) {
    case 'json':
      return JSON.stringify(customers, null, 2)
    case 'csv':
      return convertToCSV(customers)
    case 'excel':
      return convertToExcel(customers)
    default:
      return JSON.stringify(customers, null, 2)
  }
}

/**
 * Convert customers to CSV
 * @param {array} customers - Customers to convert
 * @returns {string} CSV data
 */
export const convertToCSV = (customers) => {
  if (!customers || !Array.isArray(customers) || customers.length === 0) return ''
  
  const headers = ['Name', 'Email', 'Phone', 'Age', 'Status', 'Lifetime Value', 'Visit Frequency', 'Last Visit']
  const rows = customers.map(customer => [
    formatCustomerName(customer.firstName, customer.lastName),
    customer.email || '',
    customer.phone || '',
    calculateCustomerAge(customer.dateOfBirth),
    getCustomerStatus(customer),
    calculateCustomerLifetimeValue(customer),
    calculateCustomerVisitFrequency(customer),
    getCustomerLastVisit(customer)?.toISOString() || ''
  ])
  
  return [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n')
}

/**
 * Convert customers to Excel format (simplified)
 * @param {array} customers - Customers to convert
 * @returns {string} Excel data
 */
export const convertToExcel = (customers) => {
  // This is a simplified version - in a real app, you'd use a library like xlsx
  return convertToCSV(customers)
}

/**
 * Segment constants
 */
export const SEGMENT_CONSTANTS = {
  OPERATORS: {
    EQUALS: 'equals',
    NOT_EQUALS: 'not_equals',
    CONTAINS: 'contains',
    NOT_CONTAINS: 'not_contains',
    GREATER_THAN: 'greater_than',
    LESS_THAN: 'less_than',
    GREATER_THAN_OR_EQUAL: 'greater_than_or_equal',
    LESS_THAN_OR_EQUAL: 'less_than_or_equal',
    IN: 'in',
    NOT_IN: 'not_in',
    IS_EMPTY: 'is_empty',
    IS_NOT_EMPTY: 'is_not_empty',
    STARTS_WITH: 'starts_with',
    ENDS_WITH: 'ends_with'
  },
  FIELDS: {
    NAME: 'name',
    EMAIL: 'email',
    PHONE: 'phone',
    AGE: 'age',
    AGE_GROUP: 'ageGroup',
    STATUS: 'status',
    LIFETIME_VALUE: 'lifetimeValue',
    VISIT_FREQUENCY: 'visitFrequency',
    AVERAGE_SPEND: 'averageSpend',
    LAST_VISIT: 'lastVisit',
    SATISFACTION_SCORE: 'satisfactionScore',
    CREATED_AT: 'createdAt',
    UPDATED_AT: 'updatedAt'
  },
  EXPORT_FORMATS: {
    JSON: 'json',
    CSV: 'csv',
    EXCEL: 'excel'
  },
  SORT_CRITERIA: {
    NAME: 'name',
    CREATED_AT: 'createdAt',
    UPDATED_AT: 'updatedAt',
    SIZE: 'size'
  },
  SORT_DIRECTIONS: {
    ASC: 'asc',
    DESC: 'desc'
  }
}

// Import customer utilities for calculations
import { 
  calculateCustomerLifetimeValue, 
  calculateCustomerVisitFrequency, 
  calculateCustomerSatisfactionScore,
  getCustomerAgeGroup,
  getCustomerStatus,
  formatCustomerName,
  calculateCustomerAge,
  getCustomerLastVisit
} from './customerUtils'

export default {
  createCustomerSegment,
  generateSegmentId,
  isValidSegmentCriteria,
  applySegmentCriteria,
  getCustomerFieldValue,
  segmentCustomers,
  getSegmentStatistics,
  calculateAverageLifetimeValue,
  calculateAverageVisitFrequency,
  calculateAverageSatisfactionScore,
  calculateAgeDistribution,
  calculateStatusDistribution,
  createPredefinedSegments,
  isValidSegmentName,
  isValidSegmentDescription,
  sortSegments,
  filterSegments,
  exportSegmentData,
  convertToCSV,
  convertToExcel,
  SEGMENT_CONSTANTS
}
