import React from 'react'
import { Card } from '../../common'

const StatCard = ({ 
  title,
  value,
  change,
  changeType = 'neutral', // 'positive', 'negative', 'neutral'
  icon,
  color = 'blue',
  format = 'number', // 'number', 'currency', 'percentage'
  loading = false,
  onClick,
  className = ''
}) => {
  const colorClasses = {
    blue: {
      bg: 'bg-blue-50',
      text: 'text-blue-600',
      icon: 'text-blue-500',
      border: 'border-blue-200'
    },
    green: {
      bg: 'bg-green-50',
      text: 'text-green-600',
      icon: 'text-green-500',
      border: 'border-green-200'
    },
    red: {
      bg: 'bg-red-50',
      text: 'text-red-600',
      icon: 'text-red-500',
      border: 'border-red-200'
    },
    yellow: {
      bg: 'bg-yellow-50',
      text: 'text-yellow-600',
      icon: 'text-yellow-500',
      border: 'border-yellow-200'
    },
    purple: {
      bg: 'bg-purple-50',
      text: 'text-purple-600',
      icon: 'text-purple-500',
      border: 'border-purple-200'
    },
    indigo: {
      bg: 'bg-indigo-50',
      text: 'text-indigo-600',
      icon: 'text-indigo-500',
      border: 'border-indigo-200'
    }
  }

  const changeClasses = {
    positive: 'text-green-600 bg-green-100',
    negative: 'text-red-600 bg-red-100',
    neutral: 'text-gray-600 bg-gray-100'
  }

  const formatValue = (val) => {
    if (val === null || val === undefined) return 'N/A'
    
    switch (format) {
      case 'currency':
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD'
        }).format(val)
      case 'percentage':
        return `${val}%`
      case 'number':
      default:
        return new Intl.NumberFormat('en-US').format(val)
    }
  }

  const getChangeIcon = () => {
    if (changeType === 'positive') {
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17l9.2-9.2M17 17V7H7" />
        </svg>
      )
    } else if (changeType === 'negative') {
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 7l-9.2 9.2M7 7v10h10" />
        </svg>
      )
    }
    return null
  }

  const colors = colorClasses[color] || colorClasses.blue

  if (loading) {
    return (
      <Card className={`${className} ${onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}`}>
        <div className="p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-gray-200 rounded-lg animate-pulse" />
            </div>
            <div className="ml-4 w-full">
              <div className="h-4 bg-gray-200 rounded animate-pulse mb-2" />
              <div className="h-6 bg-gray-200 rounded animate-pulse w-1/2" />
            </div>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <Card 
      className={`${className} ${onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}`}
      onClick={onClick}
    >
      <div className="p-6">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className={`w-8 h-8 ${colors.bg} ${colors.icon} rounded-lg flex items-center justify-center`}>
              {icon || (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              )}
            </div>
          </div>
          <div className="ml-4 w-full">
            <p className="text-sm font-medium text-gray-600 truncate">
              {title}
            </p>
            <div className="flex items-baseline">
              <p className="text-2xl font-semibold text-gray-900">
                {formatValue(value)}
              </p>
              {change !== undefined && change !== null && (
                <div className={`ml-2 flex items-center px-2 py-1 rounded-full text-xs font-medium ${changeClasses[changeType]}`}>
                  {getChangeIcon()}
                  <span className="ml-1">
                    {Math.abs(change)}%
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}

// StatCard Grid Component
export const StatCardGrid = ({ 
  stats = [],
  columns = 4,
  className = ''
}) => {
  const gridClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
    5: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5',
    6: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6'
  }

  return (
    <div className={`grid ${gridClasses[columns] || gridClasses[4]} gap-6 ${className}`}>
      {stats.map((stat, index) => (
        <StatCard
          key={index}
          title={stat.title}
          value={stat.value}
          change={stat.change}
          changeType={stat.changeType}
          icon={stat.icon}
          color={stat.color}
          format={stat.format}
          loading={stat.loading}
          onClick={stat.onClick}
        />
      ))}
    </div>
  )
}

// StatCard with Chart Component
export const StatCardWithChart = ({ 
  title,
  value,
  change,
  changeType = 'neutral',
  icon,
  color = 'blue',
  format = 'number',
  chartData = [],
  chartType = 'line', // 'line', 'bar', 'area'
  loading = false,
  onClick,
  className = ''
}) => {
  const colors = {
    blue: '#3B82F6',
    green: '#10B981',
    red: '#EF4444',
    yellow: '#F59E0B',
    purple: '#8B5CF6',
    indigo: '#6366F1'
  }

  return (
    <Card className={`${className} ${onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}`}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className={`w-8 h-8 bg-${color}-50 text-${color}-500 rounded-lg flex items-center justify-center`}>
                {icon || (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                )}
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                {title}
              </p>
              <div className="flex items-baseline">
                <p className="text-2xl font-semibold text-gray-900">
                  {format === 'currency' ? 
                    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value) :
                    new Intl.NumberFormat('en-US').format(value)
                  }
                </p>
                {change !== undefined && change !== null && (
                  <div className={`ml-2 flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    changeType === 'positive' ? 'text-green-600 bg-green-100' :
                    changeType === 'negative' ? 'text-red-600 bg-red-100' :
                    'text-gray-600 bg-gray-100'
                  }`}>
                    {changeType === 'positive' ? '↗' : changeType === 'negative' ? '↘' : '→'}
                    <span className="ml-1">{Math.abs(change)}%</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {chartData.length > 0 && (
          <div className="h-16">
            <svg width="100%" height="100%" className="overflow-visible">
              {chartType === 'line' && (
                <polyline
                  fill="none"
                  stroke={colors[color]}
                  strokeWidth="2"
                  points={chartData.map((point, index) => 
                    `${(index / (chartData.length - 1)) * 100},${100 - (point / Math.max(...chartData)) * 80}`
                  ).join(' ')}
                />
              )}
              {chartType === 'area' && (
                <polygon
                  fill={colors[color] + '20'}
                  stroke={colors[color]}
                  strokeWidth="1"
                  points={`0,100 ${chartData.map((point, index) => 
                    `${(index / (chartData.length - 1)) * 100},${100 - (point / Math.max(...chartData)) * 80}`
                  ).join(' ')} 100,100`}
                />
              )}
            </svg>
          </div>
        )}
      </div>
    </Card>
  )
}

export default StatCard
