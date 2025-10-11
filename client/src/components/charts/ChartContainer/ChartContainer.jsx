import React from 'react'
import { Card, LoadingSpinner } from '../../common'

const ChartContainer = ({ 
  title,
  subtitle,
  children,
  loading = false,
  error = null,
  className = '',
  headerActions = null,
  height = '400px',
  showBorder = true
}) => {
  if (loading) {
    return (
      <Card className={`${className}`}>
        <div className="p-6">
          {title && (
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
              {subtitle && (
                <p className="text-sm text-gray-600 mt-1">{subtitle}</p>
              )}
            </div>
          )}
          <div className="flex items-center justify-center" style={{ height }}>
            <LoadingSpinner size="lg" />
          </div>
        </div>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className={`${className}`}>
        <div className="p-6">
          {title && (
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
              {subtitle && (
                <p className="text-sm text-gray-600 mt-1">{subtitle}</p>
              )}
            </div>
          )}
          <div className="flex items-center justify-center" style={{ height }}>
            <div className="text-center">
              <svg className="w-12 h-12 text-red-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <p className="text-red-600 font-medium">Error loading chart</p>
              <p className="text-red-500 text-sm mt-1">{error}</p>
            </div>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <Card className={`${showBorder ? '' : 'border-0 shadow-none'} ${className}`}>
      <div className="p-6">
        {(title || headerActions) && (
          <div className="flex items-center justify-between mb-4">
            <div>
              {title && (
                <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
              )}
              {subtitle && (
                <p className="text-sm text-gray-600 mt-1">{subtitle}</p>
              )}
            </div>
            {headerActions && (
              <div className="flex items-center gap-2">
                {headerActions}
              </div>
            )}
          </div>
        )}
        <div style={{ height }}>
          {children}
        </div>
      </div>
    </Card>
  )
}

export default ChartContainer
