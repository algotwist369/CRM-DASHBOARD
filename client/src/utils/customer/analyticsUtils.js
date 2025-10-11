/**
 * Customer analytics utility functions
 */

/**
 * Calculate customer acquisition metrics
 * @param {array} customers - All customers
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @returns {object} Acquisition metrics
 */
export const calculateCustomerAcquisitionMetrics = (customers, startDate, endDate) => {
  if (!customers || !Array.isArray(customers) || !startDate || !endDate) return {}
  
  const newCustomers = customers.filter(customer => {
    const createdAt = new Date(customer.createdAt)
    return createdAt >= startDate && createdAt <= endDate
  })
  
  const totalCustomers = customers.length
  const acquisitionRate = totalCustomers > 0 ? (newCustomers.length / totalCustomers) * 100 : 0
  
  return {
    newCustomers: newCustomers.length,
    totalCustomers,
    acquisitionRate,
    averageAcquisitionPerDay: newCustomers.length / Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24))
  }
}

/**
 * Calculate customer retention metrics
 * @param {array} customers - All customers
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @returns {object} Retention metrics
 */
export const calculateCustomerRetentionMetrics = (customers, startDate, endDate) => {
  if (!customers || !Array.isArray(customers) || !startDate || !endDate) return {}
  
  const activeCustomers = customers.filter(customer => {
    const lastVisit = getCustomerLastVisit(customer)
    if (!lastVisit) return false
    
    return lastVisit >= startDate && lastVisit <= endDate
  })
  
  const totalCustomers = customers.length
  const retentionRate = totalCustomers > 0 ? (activeCustomers.length / totalCustomers) * 100 : 0
  
  return {
    activeCustomers: activeCustomers.length,
    totalCustomers,
    retentionRate,
    inactiveCustomers: totalCustomers - activeCustomers.length
  }
}

/**
 * Calculate customer churn metrics
 * @param {array} customers - All customers
 * @param {number} daysThreshold - Days threshold for churn
 * @returns {object} Churn metrics
 */
export const calculateCustomerChurnMetrics = (customers, daysThreshold = 90) => {
  if (!customers || !Array.isArray(customers)) return {}
  
  const now = new Date()
  const thresholdDate = new Date(now.getTime() - (daysThreshold * 24 * 60 * 60 * 1000))
  
  const churnedCustomers = customers.filter(customer => {
    const lastVisit = getCustomerLastVisit(customer)
    if (!lastVisit) return true // No visits = churned
    
    return lastVisit < thresholdDate
  })
  
  const totalCustomers = customers.length
  const churnRate = totalCustomers > 0 ? (churnedCustomers.length / totalCustomers) * 100 : 0
  
  return {
    churnedCustomers: churnedCustomers.length,
    totalCustomers,
    churnRate,
    activeCustomers: totalCustomers - churnedCustomers.length
  }
}

/**
 * Calculate customer lifetime value distribution
 * @param {array} customers - All customers
 * @returns {object} LTV distribution
 */
export const calculateCustomerLTVDistribution = (customers) => {
  if (!customers || !Array.isArray(customers)) return {}
  
  const ltvValues = customers.map(customer => calculateCustomerLifetimeValue(customer))
  const sortedLTV = ltvValues.sort((a, b) => a - b)
  
  const distribution = {
    low: 0,      // 0-100
    medium: 0,   // 100-500
    high: 0,     // 500-1000
    premium: 0   // 1000+
  }
  
  ltvValues.forEach(ltv => {
    if (ltv < 100) distribution.low++
    else if (ltv < 500) distribution.medium++
    else if (ltv < 1000) distribution.high++
    else distribution.premium++
  })
  
  return {
    distribution,
    average: ltvValues.reduce((sum, ltv) => sum + ltv, 0) / ltvValues.length,
    median: sortedLTV[Math.floor(sortedLTV.length / 2)],
    min: Math.min(...ltvValues),
    max: Math.max(...ltvValues)
  }
}

/**
 * Calculate customer visit frequency distribution
 * @param {array} customers - All customers
 * @returns {object} Visit frequency distribution
 */
export const calculateCustomerVisitFrequencyDistribution = (customers) => {
  if (!customers || !Array.isArray(customers)) return {}
  
  const frequencies = customers.map(customer => calculateCustomerVisitFrequency(customer))
  const sortedFrequencies = frequencies.sort((a, b) => a - b)
  
  const distribution = {
    low: 0,      // 0-5 visits
    medium: 0,   // 5-15 visits
    high: 0,     // 15-30 visits
    premium: 0   // 30+ visits
  }
  
  frequencies.forEach(freq => {
    if (freq < 5) distribution.low++
    else if (freq < 15) distribution.medium++
    else if (freq < 30) distribution.high++
    else distribution.premium++
  })
  
  return {
    distribution,
    average: frequencies.reduce((sum, freq) => sum + freq, 0) / frequencies.length,
    median: sortedFrequencies[Math.floor(sortedFrequencies.length / 2)],
    min: Math.min(...frequencies),
    max: Math.max(...frequencies)
  }
}

/**
 * Calculate customer satisfaction distribution
 * @param {array} customers - All customers
 * @returns {object} Satisfaction distribution
 */
export const calculateCustomerSatisfactionDistribution = (customers) => {
  if (!customers || !Array.isArray(customers)) return {}
  
  const satisfactionScores = customers.map(customer => calculateCustomerSatisfactionScore(customer))
  const validScores = satisfactionScores.filter(score => score > 0)
  
  const distribution = {
    veryLow: 0,  // 1-2
    low: 0,      // 2-3
    medium: 0,   // 3-4
    high: 0,     // 4-5
    veryHigh: 0  // 5
  }
  
  validScores.forEach(score => {
    if (score < 2) distribution.veryLow++
    else if (score < 3) distribution.low++
    else if (score < 4) distribution.medium++
    else if (score < 5) distribution.high++
    else distribution.veryHigh++
  })
  
  return {
    distribution,
    average: validScores.length > 0 ? validScores.reduce((sum, score) => sum + score, 0) / validScores.length : 0,
    totalWithScores: validScores.length,
    totalWithoutScores: customers.length - validScores.length
  }
}

/**
 * Calculate customer age distribution
 * @param {array} customers - All customers
 * @returns {object} Age distribution
 */
export const calculateCustomerAgeDistribution = (customers) => {
  if (!customers || !Array.isArray(customers)) return {}
  
  const ageGroups = {
    minor: 0,
    'young-adult': 0,
    adult: 0,
    'middle-aged': 0,
    mature: 0,
    senior: 0
  }
  
  customers.forEach(customer => {
    const ageGroup = getCustomerAgeGroup(customer.dateOfBirth)
    if (ageGroups[ageGroup] !== undefined) {
      ageGroups[ageGroup]++
    }
  })
  
  return ageGroups
}

/**
 * Calculate customer status distribution
 * @param {array} customers - All customers
 * @returns {object} Status distribution
 */
export const calculateCustomerStatusDistribution = (customers) => {
  if (!customers || !Array.isArray(customers)) return {}
  
  const statuses = {
    active: 0,
    inactive: 0,
    blocked: 0,
    unverified: 0
  }
  
  customers.forEach(customer => {
    const status = getCustomerStatus(customer)
    if (statuses[status] !== undefined) {
      statuses[status]++
    }
  })
  
  return statuses
}

/**
 * Calculate customer growth rate
 * @param {array} customers - All customers
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @returns {number} Growth rate percentage
 */
export const calculateCustomerGrowthRate = (customers, startDate, endDate) => {
  if (!customers || !Array.isArray(customers) || !startDate || !endDate) return 0
  
  const periodStart = new Date(startDate.getTime() - (endDate - startDate))
  const periodEnd = startDate
  
  const previousPeriodCustomers = customers.filter(customer => {
    const createdAt = new Date(customer.createdAt)
    return createdAt >= periodStart && createdAt < periodEnd
  })
  
  const currentPeriodCustomers = customers.filter(customer => {
    const createdAt = new Date(customer.createdAt)
    return createdAt >= startDate && createdAt <= endDate
  })
  
  if (previousPeriodCustomers.length === 0) return currentPeriodCustomers.length > 0 ? 100 : 0
  
  return ((currentPeriodCustomers.length - previousPeriodCustomers.length) / previousPeriodCustomers.length) * 100
}

/**
 * Calculate customer cohort analysis
 * @param {array} customers - All customers
 * @param {string} cohortType - Cohort type (month, quarter, year)
 * @returns {object} Cohort analysis
 */
export const calculateCustomerCohortAnalysis = (customers, cohortType = 'month') => {
  if (!customers || !Array.isArray(customers)) return {}
  
  const cohorts = {}
  
  customers.forEach(customer => {
    const createdAt = new Date(customer.createdAt)
    let cohortKey
    
    switch (cohortType) {
      case 'month':
        cohortKey = `${createdAt.getFullYear()}-${String(createdAt.getMonth() + 1).padStart(2, '0')}`
        break
      case 'quarter':
        const quarter = Math.floor(createdAt.getMonth() / 3) + 1
        cohortKey = `${createdAt.getFullYear()}-Q${quarter}`
        break
      case 'year':
        cohortKey = createdAt.getFullYear().toString()
        break
      default:
        cohortKey = `${createdAt.getFullYear()}-${String(createdAt.getMonth() + 1).padStart(2, '0')}`
    }
    
    if (!cohorts[cohortKey]) {
      cohorts[cohortKey] = {
        customers: [],
        totalCustomers: 0,
        activeCustomers: 0,
        retentionRate: 0
      }
    }
    
    cohorts[cohortKey].customers.push(customer)
    cohorts[cohortKey].totalCustomers++
    
    const lastVisit = getCustomerLastVisit(customer)
    if (lastVisit) {
      const daysSinceLastVisit = Math.floor((new Date() - lastVisit) / (1000 * 60 * 60 * 24))
      if (daysSinceLastVisit <= 90) { // Active within 90 days
        cohorts[cohortKey].activeCustomers++
      }
    }
  })
  
  // Calculate retention rates
  Object.keys(cohorts).forEach(cohortKey => {
    const cohort = cohorts[cohortKey]
    cohort.retentionRate = cohort.totalCustomers > 0 ? 
      (cohort.activeCustomers / cohort.totalCustomers) * 100 : 0
  })
  
  return cohorts
}

/**
 * Calculate customer segmentation analysis
 * @param {array} customers - All customers
 * @returns {object} Segmentation analysis
 */
export const calculateCustomerSegmentationAnalysis = (customers) => {
  if (!customers || !Array.isArray(customers)) return {}
  
  const segments = {
    champions: [],      // High LTV, High Frequency
    loyalists: [],      // High Frequency, Medium LTV
    potentialLoyalists: [], // Medium LTV, Medium Frequency
    newCustomers: [],   // Low LTV, Low Frequency, Recent
    atRisk: [],         // High LTV, Low Frequency, Old
    cannotLoseThem: [], // High LTV, High Frequency, Old
    hibernating: [],    // Low LTV, Low Frequency, Old
    needAttention: []   // Medium LTV, Low Frequency
  }
  
  customers.forEach(customer => {
    const ltv = calculateCustomerLifetimeValue(customer)
    const frequency = calculateCustomerVisitFrequency(customer)
    const lastVisit = getCustomerLastVisit(customer)
    const daysSinceLastVisit = lastVisit ? Math.floor((new Date() - lastVisit) / (1000 * 60 * 60 * 24)) : 999
    
    if (ltv >= 1000 && frequency >= 15) {
      segments.champions.push(customer)
    } else if (frequency >= 15 && ltv >= 500) {
      segments.loyalists.push(customer)
    } else if (ltv >= 500 && frequency >= 5) {
      segments.potentialLoyalists.push(customer)
    } else if (ltv < 100 && frequency < 5 && daysSinceLastVisit <= 30) {
      segments.newCustomers.push(customer)
    } else if (ltv >= 1000 && frequency < 5 && daysSinceLastVisit > 90) {
      segments.atRisk.push(customer)
    } else if (ltv >= 1000 && frequency >= 15 && daysSinceLastVisit > 90) {
      segments.cannotLoseThem.push(customer)
    } else if (ltv < 100 && frequency < 5 && daysSinceLastVisit > 90) {
      segments.hibernating.push(customer)
    } else if (ltv >= 500 && frequency < 5) {
      segments.needAttention.push(customer)
    }
  })
  
  return segments
}

/**
 * Generate customer analytics report
 * @param {array} customers - All customers
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @returns {object} Analytics report
 */
export const generateCustomerAnalyticsReport = (customers, startDate, endDate) => {
  if (!customers || !Array.isArray(customers) || !startDate || !endDate) return {}
  
  return {
    overview: {
      totalCustomers: customers.length,
      acquisitionMetrics: calculateCustomerAcquisitionMetrics(customers, startDate, endDate),
      retentionMetrics: calculateCustomerRetentionMetrics(customers, startDate, endDate),
      churnMetrics: calculateCustomerChurnMetrics(customers),
      growthRate: calculateCustomerGrowthRate(customers, startDate, endDate)
    },
    distributions: {
      ltv: calculateCustomerLTVDistribution(customers),
      visitFrequency: calculateCustomerVisitFrequencyDistribution(customers),
      satisfaction: calculateCustomerSatisfactionDistribution(customers),
      age: calculateCustomerAgeDistribution(customers),
      status: calculateCustomerStatusDistribution(customers)
    },
    cohortAnalysis: calculateCustomerCohortAnalysis(customers),
    segmentation: calculateCustomerSegmentationAnalysis(customers),
    generatedAt: new Date().toISOString(),
    period: {
      start: startDate.toISOString(),
      end: endDate.toISOString()
    }
  }
}

/**
 * Export analytics data
 * @param {object} analyticsData - Analytics data
 * @param {string} format - Export format
 * @returns {string} Exported data
 */
export const exportAnalyticsData = (analyticsData, format = 'json') => {
  if (!analyticsData) return ''
  
  switch (format) {
    case 'json':
      return JSON.stringify(analyticsData, null, 2)
    case 'csv':
      return convertAnalyticsToCSV(analyticsData)
    default:
      return JSON.stringify(analyticsData, null, 2)
  }
}

/**
 * Convert analytics data to CSV
 * @param {object} analyticsData - Analytics data
 * @returns {string} CSV data
 */
export const convertAnalyticsToCSV = (analyticsData) => {
  if (!analyticsData) return ''
  
  const rows = []
  
  // Overview metrics
  if (analyticsData.overview) {
    rows.push(['Metric', 'Value'])
    rows.push(['Total Customers', analyticsData.overview.totalCustomers])
    rows.push(['New Customers', analyticsData.overview.acquisitionMetrics.newCustomers])
    rows.push(['Acquisition Rate', analyticsData.overview.acquisitionMetrics.acquisitionRate])
    rows.push(['Retention Rate', analyticsData.overview.retentionMetrics.retentionRate])
    rows.push(['Churn Rate', analyticsData.overview.churnMetrics.churnRate])
    rows.push(['Growth Rate', analyticsData.overview.growthRate])
  }
  
  return rows.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n')
}

/**
 * Customer analytics constants
 */
export const CUSTOMER_ANALYTICS_CONSTANTS = {
  COHORT_TYPES: {
    MONTH: 'month',
    QUARTER: 'quarter',
    YEAR: 'year'
  },
  SEGMENTS: {
    CHAMPIONS: 'champions',
    LOYALISTS: 'loyalists',
    POTENTIAL_LOYALISTS: 'potentialLoyalists',
    NEW_CUSTOMERS: 'newCustomers',
    AT_RISK: 'atRisk',
    CANNOT_LOSE_THEM: 'cannotLoseThem',
    HIBERNATING: 'hibernating',
    NEED_ATTENTION: 'needAttention'
  },
  LTV_THRESHOLDS: {
    LOW: 100,
    MEDIUM: 500,
    HIGH: 1000
  },
  FREQUENCY_THRESHOLDS: {
    LOW: 5,
    MEDIUM: 15,
    HIGH: 30
  },
  CHURN_THRESHOLDS: {
    DAYS: 90
  },
  EXPORT_FORMATS: {
    JSON: 'json',
    CSV: 'csv'
  }
}

// Import customer utilities for calculations
import { 
  getCustomerLastVisit,
  calculateCustomerLifetimeValue,
  calculateCustomerVisitFrequency,
  calculateCustomerSatisfactionScore,
  getCustomerAgeGroup,
  getCustomerStatus
} from './customerUtils'

export default {
  calculateCustomerAcquisitionMetrics,
  calculateCustomerRetentionMetrics,
  calculateCustomerChurnMetrics,
  calculateCustomerLTVDistribution,
  calculateCustomerVisitFrequencyDistribution,
  calculateCustomerSatisfactionDistribution,
  calculateCustomerAgeDistribution,
  calculateCustomerStatusDistribution,
  calculateCustomerGrowthRate,
  calculateCustomerCohortAnalysis,
  calculateCustomerSegmentationAnalysis,
  generateCustomerAnalyticsReport,
  exportAnalyticsData,
  convertAnalyticsToCSV,
  CUSTOMER_ANALYTICS_CONSTANTS
}
