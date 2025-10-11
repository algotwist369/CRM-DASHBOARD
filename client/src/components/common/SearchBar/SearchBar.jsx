import React, { useState, useRef, useEffect } from 'react'

const SearchBar = ({ 
  onSearch,
  onFilterChange,
  placeholder = 'Search...',
  filters = [],
  showFilters = false,
  className = '',
  debounceMs = 300,
  debounceTime, // Extract this prop to prevent it from going to DOM
  ...props 
}) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [activeFilters, setActiveFilters] = useState({})
  const [showFilterDropdown, setShowFilterDropdown] = useState(false)
  const searchRef = useRef(null)
  const filterRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setShowFilterDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (onSearch) {
        onSearch(searchTerm, activeFilters)
      }
    }, debounceMs)

    return () => clearTimeout(timer)
  }, [searchTerm, activeFilters, onSearch, debounceMs])

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value)
  }

  const handleFilterChange = (filterKey, value) => {
    const newFilters = { ...activeFilters, [filterKey]: value }
    setActiveFilters(newFilters)
    
    if (onFilterChange) {
      onFilterChange(newFilters)
    }
  }

  const clearFilter = (filterKey) => {
    const newFilters = { ...activeFilters }
    delete newFilters[filterKey]
    setActiveFilters(newFilters)
    
    if (onFilterChange) {
      onFilterChange(newFilters)
    }
  }

  const clearAllFilters = () => {
    setActiveFilters({})
    if (onFilterChange) {
      onFilterChange({})
    }
  }

  const getActiveFiltersCount = () => {
    return Object.keys(activeFilters).filter(key => activeFilters[key] !== '' && activeFilters[key] !== null).length
  }

  const renderFilter = (filter) => {
    switch (filter.type) {
      case 'select':
        return (
          <div key={filter.key} className="mb-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {filter.label}
            </label>
            <select
              value={activeFilters[filter.key] || ''}
              onChange={(e) => handleFilterChange(filter.key, e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">All {filter.label}</option>
              {filter.options.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        )
      
      case 'date':
        return (
          <div key={filter.key} className="mb-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {filter.label}
            </label>
            <input
              type="date"
              value={activeFilters[filter.key] || ''}
              onChange={(e) => handleFilterChange(filter.key, e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
        )
      
      case 'range':
        return (
          <div key={filter.key} className="mb-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {filter.label}
            </label>
            <div className="flex space-x-2">
              <input
                type="number"
                placeholder="Min"
                value={activeFilters[`${filter.key}_min`] || ''}
                onChange={(e) => handleFilterChange(`${filter.key}_min`, e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
              />
              <input
                type="number"
                placeholder="Max"
                value={activeFilters[`${filter.key}_max`] || ''}
                onChange={(e) => handleFilterChange(`${filter.key}_max`, e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>
        )
      
      default:
        return null
    }
  }

  return (
    <div className={`relative ${className}`}>
      {/* Search Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          ref={searchRef}
          type="text"
          value={searchTerm}
          onChange={handleSearchChange}
          placeholder={placeholder}
          className="block w-full pl-10 pr-12 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
          {...props}
        />
        
        {/* Filter Button */}
        {showFilters && filters.length > 0 && (
          <div className="absolute inset-y-0 right-0 flex items-center" ref={filterRef}>
            <button
              type="button"
              onClick={() => setShowFilterDropdown(!showFilterDropdown)}
              className={`px-3 py-2 text-sm font-medium rounded-r-md border-l border-gray-300 focus:outline-none focus:ring-1 focus:ring-primary-500 ${
                getActiveFiltersCount() > 0 
                  ? 'bg-primary-50 text-primary-700 border-primary-300' 
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              {getActiveFiltersCount() > 0 && (
                <span className="ml-1 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-primary-600 rounded-full">
                  {getActiveFiltersCount()}
                </span>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Filter Dropdown */}
      {showFilterDropdown && showFilters && filters.length > 0 && (
        <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-900">Filters</h3>
            {getActiveFiltersCount() > 0 && (
              <button
                onClick={clearAllFilters}
                className="text-sm text-primary-600 hover:text-primary-700"
              >
                Clear all
              </button>
            )}
          </div>
          
          <div className="space-y-3">
            {filters.map(renderFilter)}
          </div>
          
          {/* Active Filters */}
          {getActiveFiltersCount() > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex flex-wrap gap-2">
                {Object.entries(activeFilters).map(([key, value]) => {
                  if (!value || value === '') return null
                  
                  const filter = filters.find(f => f.key === key)
                  const displayValue = filter?.options?.find(opt => opt.value === value)?.label || value
                  
                  return (
                    <span
                      key={key}
                      className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-primary-100 text-primary-800"
                    >
                      {filter?.label}: {displayValue}
                      <button
                        onClick={() => clearFilter(key)}
                        className="ml-1 inline-flex items-center justify-center w-4 h-4 rounded-full hover:bg-primary-200"
                      >
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </span>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default SearchBar
