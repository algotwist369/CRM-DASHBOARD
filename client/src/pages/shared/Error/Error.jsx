import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Button, Card, Alert } from '../../../components'

const Error = ({ error, resetError }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const [errorDetails, setErrorDetails] = useState(null)
  const [showDetails, setShowDetails] = useState(false)

  useEffect(() => {
    // Extract error information
    const errorInfo = {
      message: error?.message || 'An unexpected error occurred',
      stack: error?.stack || 'No stack trace available',
      timestamp: new Date().toISOString(),
      path: location.pathname,
      userAgent: navigator.userAgent,
      url: window.location.href
    }
    setErrorDetails(errorInfo)
  }, [error, location])

  const handleRetry = () => {
    if (resetError) {
      resetError()
    } else {
      window.location.reload()
    }
  }

  const handleGoHome = () => {
    navigate('/')
  }

  const handleGoBack = () => {
    navigate(-1)
  }

  const handleReportError = () => {
    // In a real app, this would send error details to a logging service
    const errorReport = {
      ...errorDetails,
      userReport: true
    }
    
    // Simulate sending error report
    console.log('Error Report:', errorReport)
    
    // Open email client with error details
    const subject = encodeURIComponent('Error Report - SpaAdvisor')
    const body = encodeURIComponent(`
Error Details:
- Message: ${errorDetails.message}
- Path: ${errorDetails.path}
- Timestamp: ${errorDetails.timestamp}
- User Agent: ${errorDetails.userAgent}

Please describe what you were doing when this error occurred:
[Your description here]
    `)
    
    window.open(`mailto:support@spaadvisor.in?subject=${subject}&body=${body}`)
  }

  const getErrorType = () => {
    if (error?.name === 'ChunkLoadError') return 'Loading Error'
    if (error?.name === 'NetworkError') return 'Network Error'
    if (error?.name === 'TypeError') return 'Type Error'
    if (error?.name === 'ReferenceError') return 'Reference Error'
    if (error?.name === 'SyntaxError') return 'Syntax Error'
    return 'Application Error'
  }

  const getErrorIcon = () => {
    const errorType = getErrorType()
    switch (errorType) {
      case 'Loading Error':
        return (
          <svg className="w-16 h-16 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        )
      case 'Network Error':
        return (
          <svg className="w-16 h-16 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 2.25a9.75 9.75 0 100 19.5 9.75 9.75 0 000-19.5z" />
          </svg>
        )
      default:
        return (
          <svg className="w-16 h-16 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        )
    }
  }

  const getErrorColor = () => {
    const errorType = getErrorType()
    switch (errorType) {
      case 'Loading Error':
        return 'orange'
      case 'Network Error':
        return 'red'
      default:
        return 'red'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <div className="p-8 text-center">
            {/* Error Illustration */}
            <div className="mb-8">
              <div className={`w-32 h-32 mx-auto mb-6 bg-gradient-to-br from-${getErrorColor()}-100 to-${getErrorColor()}-200 rounded-full flex items-center justify-center`}>
                {getErrorIcon()}
              </div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Oops!</h1>
              <h2 className="text-2xl font-semibold text-gray-700 mb-4">{getErrorType()}</h2>
              <p className="text-lg text-gray-600 mb-6">
                Something went wrong. We're sorry for the inconvenience. Our team has been notified and is working to fix this issue.
              </p>
            </div>

            {/* Error Message */}
            <div className="mb-8">
              <Alert
                type="error"
                title="Error Details"
                message={errorDetails?.message || 'An unexpected error occurred'}
              />
            </div>

            {/* Current Path Info */}
            <div className="mb-8 p-4 bg-gray-100 ">
              <p className="text-sm text-gray-600 mb-2">Error occurred on:</p>
              <code className="text-sm font-mono text-gray-800 bg-white px-2 py-1 rounded border">
                {errorDetails?.path}
              </code>
              <p className="text-xs text-gray-500 mt-2">
                {errorDetails?.timestamp}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="primary" onClick={handleRetry}>
                Try Again
              </Button>
              <Button variant="outline" onClick={handleGoBack}>
                Go Back
              </Button>
              <Button variant="outline" onClick={handleGoHome}>
                Go to Homepage
              </Button>
            </div>

            {/* Error Details Toggle */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDetails(!showDetails)}
                className="mb-4"
              >
                {showDetails ? 'Hide' : 'Show'} Technical Details
              </Button>
              
              {showDetails && (
                <div className="text-left">
                  <div className="bg-gray-900 text-gray-100 p-4  overflow-auto max-h-64">
                    <pre className="text-xs whitespace-pre-wrap">
                      {JSON.stringify(errorDetails, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </div>

            {/* Report Error */}
            <div className="mt-6">
              <Button variant="outline" onClick={handleReportError}>
                Report This Error
              </Button>
            </div>

            {/* Help Section */}
            <div className="mt-8 p-4 bg-blue-50 ">
              <h4 className="text-sm font-medium text-blue-900 mb-2">Need Immediate Help?</h4>
              <p className="text-sm text-blue-700 mb-3">
                If this error is preventing you from completing an important task, please contact our support team.
              </p>
              <div className="flex flex-col sm:flex-row gap-2 justify-center text-sm">
                <span className="text-blue-600">Email: support@elitehair.com</span>
                <span className="text-blue-600">Phone: (555) 123-4567</span>
              </div>
            </div>

            {/* Common Solutions */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="text-sm font-medium text-gray-900 mb-4">Common Solutions</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-left">
                <div className="p-3 bg-gray-50 ">
                  <h4 className="font-medium text-gray-900 mb-1">Refresh the Page</h4>
                  <p className="text-gray-600">Try refreshing your browser to reload the application.</p>
                </div>
                <div className="p-3 bg-gray-50 ">
                  <h4 className="font-medium text-gray-900 mb-1">Clear Browser Cache</h4>
                  <p className="text-gray-600">Clear your browser's cache and cookies, then try again.</p>
                </div>
                <div className="p-3 bg-gray-50 ">
                  <h4 className="font-medium text-gray-900 mb-1">Check Internet Connection</h4>
                  <p className="text-gray-600">Ensure you have a stable internet connection.</p>
                </div>
                <div className="p-3 bg-gray-50 ">
                  <h4 className="font-medium text-gray-900 mb-1">Try Different Browser</h4>
                  <p className="text-gray-600">Switch to a different browser or update your current one.</p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}

export default Error
