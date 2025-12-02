import React, { useState, useRef, useEffect } from 'react'

const Dropdown = ({ 
  options = [],
  value,
  onChange,
  placeholder = 'Select an option',
  searchable = false,
  multiple = false,
  disabled = false,
  className = '',
  optionLabel = 'label',
  optionValue = 'value',
  renderOption,
  clearable, // Extract this prop to prevent it from going to DOM
  buttonClassName, // Extract this prop to apply it to button className
  ...props 
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const dropdownRef = useRef(null)

  const filteredOptions = searchable 
    ? options.filter(option => 
        option[optionLabel].toLowerCase().includes(searchTerm.toLowerCase())
      )
    : options

  const selectedOption = options.find(option => option[optionValue] === value)
  const selectedOptions = multiple 
    ? options.filter(option => value?.includes(option[optionValue]))
    : []

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
        setSearchTerm('')
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelect = (option) => {
    if (multiple) {
      const newValue = value || []
      const isSelected = newValue.includes(option[optionValue])
      const updatedValue = isSelected
        ? newValue.filter(v => v !== option[optionValue])
        : [...newValue, option[optionValue]]
      onChange(updatedValue)
    } else {
      onChange(option[optionValue])
      setIsOpen(false)
      setSearchTerm('')
    }
  }

  const handleRemove = (optionValue) => {
    const newValue = value.filter(v => v !== optionValue)
    onChange(newValue)
  }

  const displayValue = () => {
    if (multiple) {
      if (selectedOptions.length === 0) return placeholder
      if (selectedOptions.length === 1) return selectedOptions[0][optionLabel]
      return `${selectedOptions.length} selected`
    }
    return selectedOption ? selectedOption[optionLabel] : placeholder
  }

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Trigger */}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`relative w-full bg-white border border-gray-300   pl-3 pr-10 py-2 text-left cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 ${
          disabled ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : 'hover:border-gray-400'
        } ${buttonClassName || ''}`}
        {...props}
      >
        <span className="block truncate">
          {displayValue()}
        </span>
        <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
          <svg
            className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </span>
      </button>

      {/* Selected items for multiple */}
      {multiple && selectedOptions.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {selectedOptions.map((option) => (
            <span
              key={option[optionValue]}
              className="inline-flex items-center px-2 py-1  text-xs font-medium bg-primary-100 text-primary-800"
            >
              {option[optionLabel]}
              <button
                type="button"
                onClick={() => handleRemove(option[optionValue])}
                className="ml-1 inline-flex items-center justify-center w-4 h-4 rounded-full hover:bg-primary-200"
              >
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60  py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none">
          {/* Search Input */}
          {searchable && (
            <div className="px-3 py-2 border-b border-gray-200">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search..."
                className="w-full px-3 py-2 text-sm border border-gray-300  focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          )}

          {/* Options */}
          {filteredOptions.length === 0 ? (
            <div className="px-3 py-2 text-sm text-gray-500">No options found</div>
          ) : (
            filteredOptions.map((option, index) => {
              const isSelected = multiple 
                ? value?.includes(option[optionValue])
                : value === option[optionValue]

              return (
                <div
                  key={index}
                  onClick={() => handleSelect(option)}
                  className={`cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-gray-100 ${
                    isSelected ? 'bg-primary-50 text-primary-900' : 'text-gray-900'
                  }`}
                >
                  <span className="block truncate">
                    {renderOption ? renderOption(option) : option[optionLabel]}
                  </span>
                  {isSelected && (
                    <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-primary-600">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </span>
                  )}
                </div>
              )
            })
          )}
        </div>
      )}
    </div>
  )
}

export default Dropdown
