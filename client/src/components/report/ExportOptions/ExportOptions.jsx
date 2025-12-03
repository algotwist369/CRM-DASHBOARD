import React, { useState } from 'react'
import { Card, Button, Input, Dropdown, DatePicker, Badge, Alert } from '../../common'

const ExportOptions = ({ 
  onExport,
  onCancel,
  reportData = [],
  defaultFormat = 'pdf',
  defaultFileName = '',
  className = ''
}) => {
  const [exportOptions, setExportOptions] = useState({
    format: defaultFormat,
    fileName: defaultFileName,
    includeCharts: true,
    includeSummary: true,
    includeDetails: true,
    dateRange: {
      start: null,
      end: null
    },
    filters: {},
    customFields: [],
    emailOptions: {
      enabled: false,
      recipients: [],
      subject: '',
      message: ''
    },
    scheduleOptions: {
      enabled: false,
      frequency: 'once',
      nextRun: null
    }
  })

  const [errors, setErrors] = useState({})

  const formatOptions = [
    { 
      value: 'pdf', 
      label: 'PDF', 
      description: 'Portable Document Format',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      )
    },
    { 
      value: 'excel', 
      label: 'Excel', 
      description: 'Microsoft Excel Spreadsheet',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )
    },
    { 
      value: 'csv', 
      label: 'CSV', 
      description: 'Comma Separated Values',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )
    },
    { 
      value: 'json', 
      label: 'JSON', 
      description: 'JavaScript Object Notation',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
        </svg>
      )
    }
  ]

  const frequencyOptions = [
    { value: 'once', label: 'Once', description: 'Export once only' },
    { value: 'daily', label: 'Daily', description: 'Export every day' },
    { value: 'weekly', label: 'Weekly', description: 'Export every week' },
    { value: 'monthly', label: 'Monthly', description: 'Export every month' }
  ]

  const handleOptionChange = (key, value) => {
    setExportOptions(prev => ({
      ...prev,
      [key]: value
    }))
    
    // Clear error when user makes changes
    if (errors[key]) {
      setErrors(prev => ({
        ...prev,
        [key]: ''
      }))
    }
  }

  const handleNestedOptionChange = (parentKey, childKey, value) => {
    setExportOptions(prev => ({
      ...prev,
      [parentKey]: {
        ...prev[parentKey],
        [childKey]: value
      }
    }))
  }

  const validateForm = () => {
    const newErrors = {}
    
    if (!exportOptions.fileName.trim()) {
      newErrors.fileName = 'File name is required'
    }
    
    if (exportOptions.emailOptions.enabled) {
      if (!exportOptions.emailOptions.recipients.length) {
        newErrors.emailRecipients = 'At least one email recipient is required'
      }
      if (!exportOptions.emailOptions.subject.trim()) {
        newErrors.emailSubject = 'Email subject is required'
      }
    }
    
    if (exportOptions.scheduleOptions.enabled) {
      if (exportOptions.scheduleOptions.frequency !== 'once' && !exportOptions.scheduleOptions.nextRun) {
        newErrors.scheduleDate = 'Schedule date is required for recurring exports'
      }
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleExport = () => {
    if (validateForm()) {
      onExport(exportOptions)
    }
  }

  const getEstimatedFileSize = () => {
    const baseSize = reportData.length * 0.5 // KB per record
    const formatMultiplier = {
      pdf: 2,
      excel: 1.5,
      csv: 0.8,
      json: 1.2
    }
    return Math.round(baseSize * (formatMultiplier[exportOptions.format] || 1))
  }

  const renderFormatSelection = () => (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Export Format</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {formatOptions.map((format) => (
          <button
            key={format.value}
            onClick={() => handleOptionChange('format', format.value)}
            className={`p-4 text-left border  transition-all duration-200 ${
              exportOptions.format === format.value
                ? 'bg-primary-50 border-primary-300 ring-2 ring-primary-200'
                : 'bg-white border-gray-200 hover:border-primary-300 hover:bg-primary-50'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                exportOptions.format === format.value ? 'bg-primary-100 text-primary-600' : 'bg-gray-100 text-gray-600'
              }`}>
                {format.icon}
              </div>
              <div>
                <p className="font-medium text-gray-900">{format.label}</p>
                <p className="text-sm text-gray-500">{format.description}</p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )

  const renderBasicOptions = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Basic Options</h3>
      
      <Input
        label="File Name"
        name="fileName"
        value={exportOptions.fileName}
        onChange={(e) => handleOptionChange('fileName', e.target.value)}
        placeholder="Enter file name"
        required
        error={errors.fileName}
      />

      <div className="space-y-3">
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={exportOptions.includeCharts}
            onChange={(e) => handleOptionChange('includeCharts', e.target.checked)}
            className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
          />
          <span className="ml-2 text-sm text-gray-700">Include Charts and Graphs</span>
        </label>
        
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={exportOptions.includeSummary}
            onChange={(e) => handleOptionChange('includeSummary', e.target.checked)}
            className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
          />
          <span className="ml-2 text-sm text-gray-700">Include Executive Summary</span>
        </label>
        
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={exportOptions.includeDetails}
            onChange={(e) => handleOptionChange('includeDetails', e.target.checked)}
            className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
          />
          <span className="ml-2 text-sm text-gray-700">Include Detailed Data</span>
        </label>
      </div>
    </div>
  )

  const renderEmailOptions = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Email Options</h3>
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={exportOptions.emailOptions.enabled}
            onChange={(e) => handleNestedOptionChange('emailOptions', 'enabled', e.target.checked)}
            className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
          />
          <span className="ml-2 text-sm text-gray-700">Email Export</span>
        </label>
      </div>

      {exportOptions.emailOptions.enabled && (
        <div className="space-y-4 p-4 bg-gray-50 ">
          <Input
            label="Email Recipients"
            name="emailRecipients"
            value={exportOptions.emailOptions.recipients.join(', ')}
            onChange={(e) => handleNestedOptionChange('emailOptions', 'recipients', e.target.value.split(',').map(email => email.trim()).filter(email => email))}
            placeholder="Enter email addresses separated by commas"
            error={errors.emailRecipients}
          />
          
          <Input
            label="Email Subject"
            name="emailSubject"
            value={exportOptions.emailOptions.subject}
            onChange={(e) => handleNestedOptionChange('emailOptions', 'subject', e.target.value)}
            placeholder="Enter email subject"
            error={errors.emailSubject}
          />
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Message
            </label>
            <textarea
              className="block w-full  border-gray-300  focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              rows={3}
              value={exportOptions.emailOptions.message}
              onChange={(e) => handleNestedOptionChange('emailOptions', 'message', e.target.value)}
              placeholder="Enter email message (optional)"
            />
          </div>
        </div>
      )}
    </div>
  )

  const renderScheduleOptions = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Schedule Options</h3>
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={exportOptions.scheduleOptions.enabled}
            onChange={(e) => handleNestedOptionChange('scheduleOptions', 'enabled', e.target.checked)}
            className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
          />
          <span className="ml-2 text-sm text-gray-700">Schedule Export</span>
        </label>
      </div>

      {exportOptions.scheduleOptions.enabled && (
        <div className="space-y-4 p-4 bg-gray-50 ">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Frequency
            </label>
            <Dropdown
              options={frequencyOptions}
              value={exportOptions.scheduleOptions.frequency}
              onChange={(value) => handleNestedOptionChange('scheduleOptions', 'frequency', value)}
              placeholder="Select frequency"
              optionLabel="label"
              optionValue="value"
            />
          </div>
          
          {exportOptions.scheduleOptions.frequency !== 'once' && (
            <DatePicker
              label="Next Run Date"
              selectedDate={exportOptions.scheduleOptions.nextRun}
              onDateChange={(date) => handleNestedOptionChange('scheduleOptions', 'nextRun', date)}
              placeholder="Select next run date"
              error={errors.scheduleDate}
            />
          )}
        </div>
      )}
    </div>
  )

  const renderExportSummary = () => (
    <div className="p-4 bg-blue-50 border border-blue-200 ">
      <h4 className="text-sm font-medium text-blue-900 mb-2">Export Summary</h4>
      <div className="space-y-1 text-sm text-blue-700">
        <p><span className="font-medium">Format:</span> {exportOptions.format.toUpperCase()}</p>
        <p><span className="font-medium">Records:</span> {reportData.length.toLocaleString()}</p>
        <p><span className="font-medium">Estimated Size:</span> ~{getEstimatedFileSize()} KB</p>
        {exportOptions.emailOptions.enabled && (
          <p><span className="font-medium">Email:</span> {exportOptions.emailOptions.recipients.length} recipient(s)</p>
        )}
        {exportOptions.scheduleOptions.enabled && (
          <p><span className="font-medium">Schedule:</span> {exportOptions.scheduleOptions.frequency}</p>
        )}
      </div>
    </div>
  )

  return (
    <Card className={className}>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Export Options</h2>
            <p className="text-sm text-gray-600">
              Configure your export settings and delivery options
            </p>
          </div>
          <div className="flex gap-2">
            {onCancel && (
              <Button
                variant="outline"
                onClick={onCancel}
              >
                Cancel
              </Button>
            )}
            <Button
              variant="primary"
              onClick={handleExport}
            >
              Export Report
            </Button>
          </div>
        </div>

        {/* Error Display */}
        {Object.keys(errors).length > 0 && (
          <Alert
            type="error"
            title="Please fix the following errors:"
            className="mb-6"
          >
            <ul className="list-disc list-inside space-y-1">
              {Object.entries(errors).map(([field, error]) => (
                <li key={field}>{error}</li>
              ))}
            </ul>
          </Alert>
        )}

        <div className="space-y-8">
          {/* Format Selection */}
          {renderFormatSelection()}

          {/* Basic Options */}
          {renderBasicOptions()}

          {/* Email Options */}
          {renderEmailOptions()}

          {/* Schedule Options */}
          {renderScheduleOptions()}

          {/* Export Summary */}
          {renderExportSummary()}
        </div>
      </div>
    </Card>
  )
}

export default ExportOptions
