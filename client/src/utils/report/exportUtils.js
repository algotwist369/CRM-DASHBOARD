/**
 * Report export utility functions
 */

/**
 * Export data to CSV
 * @param {array} data - Data to export
 * @param {object} options - Export options
 * @returns {string} CSV data
 */
export const exportToCSV = (data, options = {}) => {
  if (!data || !Array.isArray(data) || data.length === 0) {
    return ''
  }
  
  const { 
    headers = null, 
    delimiter = ',', 
    includeHeaders = true,
    dateFormat = 'ISO'
  } = options
  
  // Get headers from first object if not provided
  const csvHeaders = headers || Object.keys(data[0])
  
  // Create CSV rows
  const rows = []
  
  // Add headers if requested
  if (includeHeaders) {
    rows.push(csvHeaders.map(header => `"${header}"`).join(delimiter))
  }
  
  // Add data rows
  data.forEach(item => {
    const row = csvHeaders.map(header => {
      let value = item[header]
      
      // Format dates
      if (value instanceof Date) {
        switch (dateFormat) {
          case 'ISO':
            value = value.toISOString()
            break
          case 'LOCALE':
            value = value.toLocaleDateString()
            break
          case 'CUSTOM':
            value = value.toLocaleDateString('en-US')
            break
          default:
            value = value.toISOString()
        }
      }
      
      // Handle null/undefined values
      if (value === null || value === undefined) {
        value = ''
      }
      
      // Escape quotes and wrap in quotes
      return `"${String(value).replace(/"/g, '""')}"`
    })
    
    rows.push(row.join(delimiter))
  })
  
  return rows.join('\n')
}

/**
 * Export data to Excel
 * @param {array} data - Data to export
 * @param {object} options - Export options
 * @returns {string} Excel data (simplified)
 */
export const exportToExcel = (data, options = {}) => {
  if (!data || !Array.isArray(data) || data.length === 0) {
    return ''
  }
  
  const { 
    sheetName = 'Sheet1',
    headers = null,
    dateFormat = 'ISO'
  } = options
  
  // Get headers from first object if not provided
  const excelHeaders = headers || Object.keys(data[0])
  
  // Create Excel-like structure (simplified)
  const excelData = {
    sheetName,
    headers: excelHeaders,
    data: data.map(item => {
      const row = {}
      excelHeaders.forEach(header => {
        let value = item[header]
        
        // Format dates
        if (value instanceof Date) {
          switch (dateFormat) {
            case 'ISO':
              value = value.toISOString()
              break
            case 'LOCALE':
              value = value.toLocaleDateString()
              break
            case 'CUSTOM':
              value = value.toLocaleDateString('en-US')
              break
            default:
              value = value.toISOString()
          }
        }
        
        row[header] = value
      })
      return row
    })
  }
  
  // In a real implementation, you would use a library like xlsx
  // For now, return JSON representation
  return JSON.stringify(excelData, null, 2)
}

/**
 * Export data to JSON
 * @param {array} data - Data to export
 * @param {object} options - Export options
 * @returns {string} JSON data
 */
export const exportToJSON = (data, options = {}) => {
  if (!data) {
    return '{}'
  }
  
  const { 
    pretty = true,
    includeMetadata = false,
    metadata = {}
  } = options
  
  const exportData = {
    ...(includeMetadata && {
      metadata: {
        exportedAt: new Date().toISOString(),
        totalRecords: Array.isArray(data) ? data.length : 1,
        ...metadata
      }
    }),
    data
  }
  
  return pretty ? JSON.stringify(exportData, null, 2) : JSON.stringify(exportData)
}

/**
 * Export data to PDF
 * @param {array} data - Data to export
 * @param {object} options - Export options
 * @returns {string} PDF data (simplified)
 */
export const exportToPDF = (data, options = {}) => {
  if (!data || !Array.isArray(data) || data.length === 0) {
    return ''
  }
  
  const { 
    title = 'Report',
    headers = null,
    includeSummary = true
  } = options
  
  // Get headers from first object if not provided
  const pdfHeaders = headers || Object.keys(data[0])
  
  // Create PDF-like structure (simplified)
  const pdfData = {
    title,
    headers: pdfHeaders,
    data: data.map(item => {
      const row = {}
      pdfHeaders.forEach(header => {
        row[header] = item[header]
      })
      return row
    }),
    summary: includeSummary ? {
      totalRecords: data.length,
      generatedAt: new Date().toISOString()
    } : null
  }
  
  // In a real implementation, you would use a library like jsPDF
  // For now, return JSON representation
  return JSON.stringify(pdfData, null, 2)
}

/**
 * Export data to XML
 * @param {array} data - Data to export
 * @param {object} options - Export options
 * @returns {string} XML data
 */
export const exportToXML = (data, options = {}) => {
  if (!data || !Array.isArray(data) || data.length === 0) {
    return '<?xml version="1.0" encoding="UTF-8"?><root></root>'
  }
  
  const { 
    rootElement = 'root',
    itemElement = 'item',
    includeAttributes = false
  } = options
  
  let xml = '<?xml version="1.0" encoding="UTF-8"?>'
  xml += `\n<${rootElement}>`
  
  data.forEach((item, index) => {
    xml += `\n  <${itemElement}${includeAttributes ? ` id="${index}"` : ''}>`
    
    Object.entries(item).forEach(([key, value]) => {
      const cleanKey = key.replace(/[^a-zA-Z0-9_]/g, '_')
      const cleanValue = String(value || '').replace(/[<>&"']/g, (match) => {
        switch (match) {
          case '<': return '&lt;'
          case '>': return '&gt;'
          case '&': return '&amp;'
          case '"': return '&quot;'
          case "'": return '&#39;'
          default: return match
        }
      })
      
      xml += `\n    <${cleanKey}>${cleanValue}</${cleanKey}>`
    })
    
    xml += `\n  </${itemElement}>`
  })
  
  xml += `\n</${rootElement}>`
  
  return xml
}

/**
 * Export data to HTML table
 * @param {array} data - Data to export
 * @param {object} options - Export options
 * @returns {string} HTML data
 */
export const exportToHTML = (data, options = {}) => {
  if (!data || !Array.isArray(data) || data.length === 0) {
    return '<table></table>'
  }
  
  const { 
    title = 'Report',
    headers = null,
    includeStyles = true,
    className = 'export-table'
  } = options
  
  // Get headers from first object if not provided
  const htmlHeaders = headers || Object.keys(data[0])
  
  let html = '<!DOCTYPE html>\n<html>\n<head>\n'
  html += `<title>${title}</title>\n`
  
  if (includeStyles) {
    html += `<style>
      .${className} { border-collapse: collapse; width: 100%; }
      .${className} th, .${className} td { border: 1px solid #ddd; padding: 8px; text-align: left; }
      .${className} th { background-color: #f2f2f2; font-weight: bold; }
      .${className} tr:nth-child(even) { background-color: #f9f9f9; }
    </style>\n`
  }
  
  html += '</head>\n<body>\n'
  html += `<h1>${title}</h1>\n`
  html += `<table class="${className}">\n`
  
  // Add headers
  html += '  <thead>\n    <tr>\n'
  htmlHeaders.forEach(header => {
    html += `      <th>${header}</th>\n`
  })
  html += '    </tr>\n  </thead>\n'
  
  // Add data rows
  html += '  <tbody>\n'
  data.forEach(item => {
    html += '    <tr>\n'
    htmlHeaders.forEach(header => {
      const value = item[header] || ''
      html += `      <td>${String(value)}</td>\n`
    })
    html += '    </tr>\n'
  })
  html += '  </tbody>\n'
  
  html += '</table>\n'
  html += '</body>\n</html>'
  
  return html
}

/**
 * Get export format options
 * @param {string} format - Export format
 * @returns {object} Format options
 */
export const getExportFormatOptions = (format) => {
  const formatOptions = {
    csv: {
      mimeType: 'text/csv',
      extension: 'csv',
      description: 'Comma Separated Values'
    },
    excel: {
      mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      extension: 'xlsx',
      description: 'Excel Spreadsheet'
    },
    json: {
      mimeType: 'application/json',
      extension: 'json',
      description: 'JSON Data'
    },
    pdf: {
      mimeType: 'application/pdf',
      extension: 'pdf',
      description: 'PDF Document'
    },
    xml: {
      mimeType: 'application/xml',
      extension: 'xml',
      description: 'XML Data'
    },
    html: {
      mimeType: 'text/html',
      extension: 'html',
      description: 'HTML Table'
    }
  }
  
  return formatOptions[format] || formatOptions.json
}

/**
 * Download exported data
 * @param {string} data - Data to download
 * @param {string} filename - File name
 * @param {string} format - File format
 * @returns {void}
 */
export const downloadExportedData = (data, filename, format) => {
  if (!data || !filename || !format) {
    throw new Error('Data, filename, and format are required')
  }
  
  const formatOptions = getExportFormatOptions(format)
  const blob = new Blob([data], { type: formatOptions.mimeType })
  const url = URL.createObjectURL(blob)
  
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  
  URL.revokeObjectURL(url)
}

/**
 * Export data with format
 * @param {array} data - Data to export
 * @param {string} format - Export format
 * @param {object} options - Export options
 * @returns {string} Exported data
 */
export const exportData = (data, format, options = {}) => {
  if (!data || !format) {
    throw new Error('Data and format are required')
  }
  
  switch (format.toLowerCase()) {
    case 'csv':
      return exportToCSV(data, options)
    case 'excel':
    case 'xlsx':
      return exportToExcel(data, options)
    case 'json':
      return exportToJSON(data, options)
    case 'pdf':
      return exportToPDF(data, options)
    case 'xml':
      return exportToXML(data, options)
    case 'html':
      return exportToHTML(data, options)
    default:
      throw new Error(`Unsupported export format: ${format}`)
  }
}

/**
 * Get supported export formats
 * @returns {array} Supported formats
 */
export const getSupportedExportFormats = () => {
  return [
    { id: 'csv', name: 'CSV', description: 'Comma Separated Values' },
    { id: 'excel', name: 'Excel', description: 'Excel Spreadsheet' },
    { id: 'json', name: 'JSON', description: 'JSON Data' },
    { id: 'pdf', name: 'PDF', description: 'PDF Document' },
    { id: 'xml', name: 'XML', description: 'XML Data' },
    { id: 'html', name: 'HTML', description: 'HTML Table' }
  ]
}

/**
 * Validate export data
 * @param {array} data - Data to validate
 * @returns {object} Validation result
 */
export const validateExportData = (data) => {
  if (!data) {
    return { isValid: false, error: 'Data is required' }
  }
  
  if (!Array.isArray(data)) {
    return { isValid: false, error: 'Data must be an array' }
  }
  
  if (data.length === 0) {
    return { isValid: false, error: 'Data array is empty' }
  }
  
  // Check if all items have the same structure
  const firstItemKeys = Object.keys(data[0])
  const hasConsistentStructure = data.every(item => {
    const itemKeys = Object.keys(item)
    return itemKeys.length === firstItemKeys.length && 
           itemKeys.every(key => firstItemKeys.includes(key))
  })
  
  if (!hasConsistentStructure) {
    return { isValid: false, error: 'Data items have inconsistent structure' }
  }
  
  return { isValid: true, error: null }
}

/**
 * Get export data summary
 * @param {array} data - Data to summarize
 * @returns {object} Data summary
 */
export const getExportDataSummary = (data) => {
  if (!data || !Array.isArray(data) || data.length === 0) {
    return { totalRecords: 0, columns: [], size: 0 }
  }
  
  const columns = Object.keys(data[0])
  const totalRecords = data.length
  const size = JSON.stringify(data).length
  
  return {
    totalRecords,
    columns,
    size,
    estimatedFileSize: {
      csv: Math.round(size * 0.8),
      json: size,
      xml: Math.round(size * 1.2),
      html: Math.round(size * 1.5)
    }
  }
}

/**
 * Export constants
 */
export const EXPORT_CONSTANTS = {
  FORMATS: {
    CSV: 'csv',
    EXCEL: 'excel',
    JSON: 'json',
    PDF: 'pdf',
    XML: 'xml',
    HTML: 'html'
  },
  MIME_TYPES: {
    CSV: 'text/csv',
    EXCEL: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    JSON: 'application/json',
    PDF: 'application/pdf',
    XML: 'application/xml',
    HTML: 'text/html'
  },
  EXTENSIONS: {
    CSV: 'csv',
    EXCEL: 'xlsx',
    JSON: 'json',
    PDF: 'pdf',
    XML: 'xml',
    HTML: 'html'
  },
  DATE_FORMATS: {
    ISO: 'ISO',
    LOCALE: 'LOCALE',
    CUSTOM: 'CUSTOM'
  }
}

export default {
  exportToCSV,
  exportToExcel,
  exportToJSON,
  exportToPDF,
  exportToXML,
  exportToHTML,
  getExportFormatOptions,
  downloadExportedData,
  exportData,
  getSupportedExportFormats,
  validateExportData,
  getExportDataSummary,
  EXPORT_CONSTANTS
}
