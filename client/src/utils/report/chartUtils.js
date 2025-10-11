/**
 * Chart utility functions
 */

/**
 * Create chart configuration
 * @param {string} type - Chart type
 * @param {array} data - Chart data
 * @param {object} options - Chart options
 * @returns {object} Chart configuration
 */
export const createChartConfig = (type, data, options = {}) => {
  if (!type || !data) {
    throw new Error('Chart type and data are required')
  }
  
  const baseConfig = {
    type,
    data,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      ...options
    }
  }
  
  // Add type-specific configurations
  switch (type) {
    case 'line':
      return createLineChartConfig(baseConfig, options)
    case 'bar':
      return createBarChartConfig(baseConfig, options)
    case 'pie':
      return createPieChartConfig(baseConfig, options)
    case 'doughnut':
      return createDoughnutChartConfig(baseConfig, options)
    case 'area':
      return createAreaChartConfig(baseConfig, options)
    case 'scatter':
      return createScatterChartConfig(baseConfig, options)
    case 'radar':
      return createRadarChartConfig(baseConfig, options)
    default:
      return baseConfig
  }
}

/**
 * Create line chart configuration
 * @param {object} baseConfig - Base configuration
 * @param {object} options - Chart options
 * @returns {object} Line chart configuration
 */
export const createLineChartConfig = (baseConfig, options = {}) => {
  return {
    ...baseConfig,
    options: {
      ...baseConfig.options,
      scales: {
        x: {
          type: 'category',
          title: {
            display: true,
            text: options.xAxisLabel || 'X Axis'
          }
        },
        y: {
          type: 'linear',
          title: {
            display: true,
            text: options.yAxisLabel || 'Y Axis'
          }
        }
      },
      plugins: {
        legend: {
          display: options.showLegend !== false
        },
        title: {
          display: !!options.title,
          text: options.title
        }
      }
    }
  }
}

/**
 * Create bar chart configuration
 * @param {object} baseConfig - Base configuration
 * @param {object} options - Chart options
 * @returns {object} Bar chart configuration
 */
export const createBarChartConfig = (baseConfig, options = {}) => {
  return {
    ...baseConfig,
    options: {
      ...baseConfig.options,
      scales: {
        x: {
          type: 'category',
          title: {
            display: true,
            text: options.xAxisLabel || 'Categories'
          }
        },
        y: {
          type: 'linear',
          title: {
            display: true,
            text: options.yAxisLabel || 'Values'
          }
        }
      },
      plugins: {
        legend: {
          display: options.showLegend !== false
        },
        title: {
          display: !!options.title,
          text: options.title
        }
      }
    }
  }
}

/**
 * Create pie chart configuration
 * @param {object} baseConfig - Base configuration
 * @param {object} options - Chart options
 * @returns {object} Pie chart configuration
 */
export const createPieChartConfig = (baseConfig, options = {}) => {
  return {
    ...baseConfig,
    options: {
      ...baseConfig.options,
      plugins: {
        legend: {
          display: options.showLegend !== false,
          position: options.legendPosition || 'right'
        },
        title: {
          display: !!options.title,
          text: options.title
        }
      }
    }
  }
}

/**
 * Create doughnut chart configuration
 * @param {object} baseConfig - Base configuration
 * @param {object} options - Chart options
 * @returns {object} Doughnut chart configuration
 */
export const createDoughnutChartConfig = (baseConfig, options = {}) => {
  return {
    ...baseConfig,
    options: {
      ...baseConfig.options,
      cutout: options.cutout || '50%',
      plugins: {
        legend: {
          display: options.showLegend !== false,
          position: options.legendPosition || 'right'
        },
        title: {
          display: !!options.title,
          text: options.title
        }
      }
    }
  }
}

/**
 * Create area chart configuration
 * @param {object} baseConfig - Base configuration
 * @param {object} options - Chart options
 * @returns {object} Area chart configuration
 */
export const createAreaChartConfig = (baseConfig, options = {}) => {
  return {
    ...baseConfig,
    options: {
      ...baseConfig.options,
      scales: {
        x: {
          type: 'category',
          title: {
            display: true,
            text: options.xAxisLabel || 'X Axis'
          }
        },
        y: {
          type: 'linear',
          title: {
            display: true,
            text: options.yAxisLabel || 'Y Axis'
          }
        }
      },
      plugins: {
        legend: {
          display: options.showLegend !== false
        },
        title: {
          display: !!options.title,
          text: options.title
        }
      }
    }
  }
}

/**
 * Create scatter chart configuration
 * @param {object} baseConfig - Base configuration
 * @param {object} options - Chart options
 * @returns {object} Scatter chart configuration
 */
export const createScatterChartConfig = (baseConfig, options = {}) => {
  return {
    ...baseConfig,
    options: {
      ...baseConfig.options,
      scales: {
        x: {
          type: 'linear',
          title: {
            display: true,
            text: options.xAxisLabel || 'X Axis'
          }
        },
        y: {
          type: 'linear',
          title: {
            display: true,
            text: options.yAxisLabel || 'Y Axis'
          }
        }
      },
      plugins: {
        legend: {
          display: options.showLegend !== false
        },
        title: {
          display: !!options.title,
          text: options.title
        }
      }
    }
  }
}

/**
 * Create radar chart configuration
 * @param {object} baseConfig - Base configuration
 * @param {object} options - Chart options
 * @returns {object} Radar chart configuration
 */
export const createRadarChartConfig = (baseConfig, options = {}) => {
  return {
    ...baseConfig,
    options: {
      ...baseConfig.options,
      scales: {
        r: {
          beginAtZero: true,
          title: {
            display: true,
            text: options.radarLabel || 'Values'
          }
        }
      },
      plugins: {
        legend: {
          display: options.showLegend !== false
        },
        title: {
          display: !!options.title,
          text: options.title
        }
      }
    }
  }
}

/**
 * Generate chart data from array
 * @param {array} data - Data array
 * @param {object} mapping - Data mapping
 * @returns {object} Chart data
 */
export const generateChartData = (data, mapping) => {
  if (!data || !Array.isArray(data) || !mapping) {
    throw new Error('Data array and mapping are required')
  }
  
  const { labels, datasets } = mapping
  
  if (!labels || !datasets) {
    throw new Error('Labels and datasets mapping are required')
  }
  
  const chartData = {
    labels: data.map(item => item[labels.field]),
    datasets: datasets.map(dataset => ({
      label: dataset.label,
      data: data.map(item => item[dataset.field]),
      backgroundColor: dataset.backgroundColor || getDefaultColors(datasets.length),
      borderColor: dataset.borderColor || getDefaultColors(datasets.length),
      borderWidth: dataset.borderWidth || 1
    }))
  }
  
  return chartData
}

/**
 * Get default colors for charts
 * @param {number} count - Number of colors needed
 * @returns {array} Color array
 */
export const getDefaultColors = (count) => {
  const colors = [
    '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
    '#FF9F40', '#FF6384', '#C9CBCF', '#4BC0C0', '#FF6384'
  ]
  
  if (count <= colors.length) {
    return colors.slice(0, count)
  }
  
  // Generate additional colors if needed
  const additionalColors = []
  for (let i = colors.length; i < count; i++) {
    additionalColors.push(generateRandomColor())
  }
  
  return [...colors, ...additionalColors]
}

/**
 * Generate random color
 * @returns {string} Random color
 */
export const generateRandomColor = () => {
  const letters = '0123456789ABCDEF'
  let color = '#'
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)]
  }
  return color
}

/**
 * Create appointment chart data
 * @param {array} appointments - Appointment data
 * @param {string} groupBy - Group by field
 * @returns {object} Chart data
 */
export const createAppointmentChartData = (appointments, groupBy = 'date') => {
  if (!appointments || !Array.isArray(appointments)) {
    throw new Error('Appointments array is required')
  }
  
  const groupedData = groupAppointmentsByField(appointments, groupBy)
  
  return {
    labels: Object.keys(groupedData),
    datasets: [{
      label: 'Appointments',
      data: Object.values(groupedData).map(group => group.length),
      backgroundColor: getDefaultColors(1)[0],
      borderColor: getDefaultColors(1)[0],
      borderWidth: 1
    }]
  }
}

/**
 * Create revenue chart data
 * @param {array} transactions - Transaction data
 * @param {string} groupBy - Group by field
 * @returns {object} Chart data
 */
export const createRevenueChartData = (transactions, groupBy = 'date') => {
  if (!transactions || !Array.isArray(transactions)) {
    throw new Error('Transactions array is required')
  }
  
  const groupedData = groupTransactionsByField(transactions, groupBy)
  
  return {
    labels: Object.keys(groupedData),
    datasets: [{
      label: 'Revenue',
      data: Object.values(groupedData).map(group => 
        group.reduce((sum, transaction) => sum + (transaction.amount || 0), 0)
      ),
      backgroundColor: getDefaultColors(1)[0],
      borderColor: getDefaultColors(1)[0],
      borderWidth: 1
    }]
  }
}

/**
 * Create customer analytics chart data
 * @param {array} customers - Customer data
 * @param {string} groupBy - Group by field
 * @returns {object} Chart data
 */
export const createCustomerAnalyticsChartData = (customers, groupBy = 'ageGroup') => {
  if (!customers || !Array.isArray(customers)) {
    throw new Error('Customers array is required')
  }
  
  const groupedData = groupCustomersByField(customers, groupBy)
  
  return {
    labels: Object.keys(groupedData),
    datasets: [{
      label: 'Customers',
      data: Object.values(groupedData).map(group => group.length),
      backgroundColor: getDefaultColors(Object.keys(groupedData).length),
      borderColor: getDefaultColors(Object.keys(groupedData).length),
      borderWidth: 1
    }]
  }
}

/**
 * Group appointments by field
 * @param {array} appointments - Appointment data
 * @param {string} field - Field to group by
 * @returns {object} Grouped data
 */
export const groupAppointmentsByField = (appointments, field) => {
  return appointments.reduce((groups, appointment) => {
    const key = appointment[field] || 'Unknown'
    if (!groups[key]) {
      groups[key] = []
    }
    groups[key].push(appointment)
    return groups
  }, {})
}

/**
 * Group transactions by field
 * @param {array} transactions - Transaction data
 * @param {string} field - Field to group by
 * @returns {object} Grouped data
 */
export const groupTransactionsByField = (transactions, field) => {
  return transactions.reduce((groups, transaction) => {
    const key = transaction[field] || 'Unknown'
    if (!groups[key]) {
      groups[key] = []
    }
    groups[key].push(transaction)
    return groups
  }, {})
}

/**
 * Group customers by field
 * @param {array} customers - Customer data
 * @param {string} field - Field to group by
 * @returns {object} Grouped data
 */
export const groupCustomersByField = (customers, field) => {
  return customers.reduce((groups, customer) => {
    const key = customer[field] || 'Unknown'
    if (!groups[key]) {
      groups[key] = []
    }
    groups[key].push(customer)
    return groups
  }, {})
}

/**
 * Get chart type display name
 * @param {string} type - Chart type
 * @returns {string} Display name
 */
export const getChartTypeDisplayName = (type) => {
  const typeMap = {
    line: 'Line Chart',
    bar: 'Bar Chart',
    pie: 'Pie Chart',
    doughnut: 'Doughnut Chart',
    area: 'Area Chart',
    scatter: 'Scatter Chart',
    radar: 'Radar Chart'
  }
  
  return typeMap[type] || 'Chart'
}

/**
 * Get chart type icon
 * @param {string} type - Chart type
 * @returns {string} Icon name
 */
export const getChartTypeIcon = (type) => {
  const iconMap = {
    line: 'chart-line',
    bar: 'chart-bar',
    pie: 'chart-pie',
    doughnut: 'chart-pie',
    area: 'chart-area',
    scatter: 'chart-scatter',
    radar: 'chart-radar'
  }
  
  return iconMap[type] || 'chart-bar'
}

/**
 * Validate chart data
 * @param {object} chartData - Chart data
 * @returns {object} Validation result
 */
export const validateChartData = (chartData) => {
  if (!chartData || typeof chartData !== 'object') {
    return { isValid: false, error: 'Chart data is required' }
  }
  
  if (!chartData.labels || !Array.isArray(chartData.labels)) {
    return { isValid: false, error: 'Chart labels are required' }
  }
  
  if (!chartData.datasets || !Array.isArray(chartData.datasets)) {
    return { isValid: false, error: 'Chart datasets are required' }
  }
  
  if (chartData.datasets.length === 0) {
    return { isValid: false, error: 'At least one dataset is required' }
  }
  
  return { isValid: true, error: null }
}

/**
 * Get chart statistics
 * @param {object} chartData - Chart data
 * @returns {object} Chart statistics
 */
export const getChartStatistics = (chartData) => {
  if (!chartData || !chartData.datasets) return {}
  
  const statistics = {
    totalLabels: chartData.labels.length,
    totalDatasets: chartData.datasets.length,
    totalDataPoints: 0,
    minValue: Infinity,
    maxValue: -Infinity,
    averageValue: 0
  }
  
  let totalSum = 0
  let totalCount = 0
  
  chartData.datasets.forEach(dataset => {
    if (dataset.data && Array.isArray(dataset.data)) {
      statistics.totalDataPoints += dataset.data.length
      
      dataset.data.forEach(value => {
        if (typeof value === 'number') {
          statistics.minValue = Math.min(statistics.minValue, value)
          statistics.maxValue = Math.max(statistics.maxValue, value)
          totalSum += value
          totalCount++
        }
      })
    }
  })
  
  if (totalCount > 0) {
    statistics.averageValue = totalSum / totalCount
  }
  
  if (statistics.minValue === Infinity) {
    statistics.minValue = 0
  }
  if (statistics.maxValue === -Infinity) {
    statistics.maxValue = 0
  }
  
  return statistics
}

/**
 * Chart constants
 */
export const CHART_CONSTANTS = {
  TYPES: {
    LINE: 'line',
    BAR: 'bar',
    PIE: 'pie',
    DOUGHNUT: 'doughnut',
    AREA: 'area',
    SCATTER: 'scatter',
    RADAR: 'radar'
  },
  LEGEND_POSITIONS: {
    TOP: 'top',
    BOTTOM: 'bottom',
    LEFT: 'left',
    RIGHT: 'right'
  },
  SCALE_TYPES: {
    CATEGORY: 'category',
    LINEAR: 'linear',
    LOGARITHMIC: 'logarithmic',
    TIME: 'time'
  },
  DEFAULT_COLORS: [
    '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
    '#FF9F40', '#FF6384', '#C9CBCF', '#4BC0C0', '#FF6384'
  ]
}

export default {
  createChartConfig,
  createLineChartConfig,
  createBarChartConfig,
  createPieChartConfig,
  createDoughnutChartConfig,
  createAreaChartConfig,
  createScatterChartConfig,
  createRadarChartConfig,
  generateChartData,
  getDefaultColors,
  generateRandomColor,
  createAppointmentChartData,
  createRevenueChartData,
  createCustomerAnalyticsChartData,
  groupAppointmentsByField,
  groupTransactionsByField,
  groupCustomersByField,
  getChartTypeDisplayName,
  getChartTypeIcon,
  validateChartData,
  getChartStatistics,
  CHART_CONSTANTS
}
