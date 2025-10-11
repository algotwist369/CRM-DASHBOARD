import React, { useState } from 'react'

const Tabs = ({ 
  tabs = [],
  defaultActiveTab = 0,
  onTabChange,
  variant = 'default',
  size = 'md',
  className = '',
  children
}) => {
  const [activeTab, setActiveTab] = useState(defaultActiveTab)

  const handleTabClick = (index, tab) => {
    setActiveTab(index)
    if (onTabChange) {
      onTabChange(index, tab)
    }
  }

  const variantClasses = {
    default: {
      tab: 'text-gray-500 hover:text-gray-700 hover:border-gray-300',
      activeTab: 'text-primary-600 border-primary-600',
      container: 'border-b border-gray-200'
    },
    pills: {
      tab: 'text-gray-500 hover:text-gray-700 hover:bg-gray-100',
      activeTab: 'text-white bg-primary-600',
      container: 'bg-gray-100 rounded-lg p-1'
    },
    underline: {
      tab: 'text-gray-500 hover:text-gray-700 border-b-2 border-transparent',
      activeTab: 'text-primary-600 border-primary-600',
      container: 'border-b border-gray-200'
    }
  }

  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  }

  const currentVariant = variantClasses[variant] || variantClasses.default

  return (
    <div className={className}>
      {/* Tab Headers */}
      <div className={currentVariant.container}>
        <nav className="flex space-x-8" aria-label="Tabs">
          {tabs.map((tab, index) => (
            <button
              key={index}
              onClick={() => handleTabClick(index, tab)}
              className={`${sizeClasses[size]} font-medium transition-colors ${
                activeTab === index ? currentVariant.activeTab : currentVariant.tab
              } ${variant === 'pills' ? 'rounded-md' : ''}`}
              aria-current={activeTab === index ? 'page' : undefined}
            >
              {tab.icon && (
                <span className="mr-2">
                  {tab.icon}
                </span>
              )}
              {tab.label}
              {tab.badge && (
                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-4">
        {children ? (
          React.Children.map(children, (child, index) => (
            <div
              key={index}
              className={activeTab === index ? 'block' : 'hidden'}
            >
              {child}
            </div>
          ))
        ) : (
          tabs[activeTab]?.content && (
            <div>
              {tabs[activeTab].content}
            </div>
          )
        )}
      </div>
    </div>
  )
}

// Tab Panel Component
export const TabPanel = ({ children, isActive, className = '' }) => {
  if (!isActive) return null

  return (
    <div className={className}>
      {children}
    </div>
  )
}

// Tab List Component
export const TabList = ({ children, variant = 'default', size = 'md', className = '' }) => {
  const variantClasses = {
    default: 'border-b border-gray-200',
    pills: 'bg-gray-100 rounded-lg p-1',
    underline: 'border-b border-gray-200'
  }

  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  }

  return (
    <div className={`${variantClasses[variant]} ${className}`}>
      <nav className="flex space-x-8" aria-label="Tabs">
        {children}
      </nav>
    </div>
  )
}

// Tab Component
export const Tab = ({ 
  children, 
  isActive, 
  onClick, 
  variant = 'default',
  size = 'md',
  icon,
  badge,
  className = ''
}) => {
  const variantClasses = {
    default: {
      tab: 'text-gray-500 hover:text-gray-700 hover:border-gray-300',
      activeTab: 'text-primary-600 border-primary-600'
    },
    pills: {
      tab: 'text-gray-500 hover:text-gray-700 hover:bg-gray-100',
      activeTab: 'text-white bg-primary-600'
    },
    underline: {
      tab: 'text-gray-500 hover:text-gray-700 border-b-2 border-transparent',
      activeTab: 'text-primary-600 border-primary-600'
    }
  }

  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  }

  const currentVariant = variantClasses[variant] || variantClasses.default

  return (
    <button
      onClick={onClick}
      className={`${sizeClasses[size]} font-medium transition-colors ${
        isActive ? currentVariant.activeTab : currentVariant.tab
      } ${variant === 'pills' ? 'rounded-md' : ''} ${className}`}
      aria-current={isActive ? 'page' : undefined}
    >
      {icon && (
        <span className="mr-2">
          {icon}
        </span>
      )}
      {children}
      {badge && (
        <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          {badge}
        </span>
      )}
    </button>
  )
}

export default Tabs
