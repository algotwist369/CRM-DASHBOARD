import React, { forwardRef } from 'react'
import { Dropdown } from '../../common'

const FormMultiSelect = forwardRef(({ 
  name,
  label,
  value = [],
  onChange,
  onBlur,
  options = [],
  placeholder = 'Select options',
  required = false,
  disabled = false,
  error,
  helperText,
  className = '',
  size = 'md',
  searchable = true,
  clearable = true,
  optionLabel = 'label',
  optionValue = 'value',
  loading = false,
  maxSelected = null,
  showSelectedCount = true,
  ...props
}, ref) => {
  const handleChange = (selectedValues) => {
    if (onChange) {
      onChange(selectedValues)
    }
  }

  const handleBlur = () => {
    if (onBlur) {
      onBlur({ target: { name, value } })
    }
  }

  // Convert options to the format expected by Dropdown
  const formattedOptions = options.map(option => {
    if (typeof option === 'string') {
      return { label: option, value: option }
    }
    return {
      label: option[optionLabel],
      value: option[optionValue],
      ...option
    }
  })

  const getPlaceholder = () => {
    if (value.length === 0) {
      return placeholder
    }
    if (showSelectedCount) {
      return `${value.length} selected`
    }
    return placeholder
  }

  return (
    <div className={`form-multiselect ${className}`}>
      {label && (
        <label 
          htmlFor={name}
          className={`block text-sm font-medium text-gray-700 mb-2 ${
            required ? 'after:content-["*"] after:ml-0.5 after:text-red-500' : ''
          }`}
        >
          {label}
        </label>
      )}
      
      <Dropdown
        ref={ref}
        id={name}
        name={name}
        options={formattedOptions}
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder={getPlaceholder()}
        disabled={disabled}
        searchable={searchable}
        clearable={clearable}
        loading={loading}
        size={size}
        multiple={true}
        maxSelected={maxSelected}
        className={error ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}
        {...props}
      />
      
      {value.length > 0 && showSelectedCount && (
        <div className="mt-2">
          <div className="flex flex-wrap gap-1">
            {value.slice(0, 3).map((selectedValue, index) => {
              const option = formattedOptions.find(opt => opt.value === selectedValue)
              return (
                <span
                  key={index}
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800"
                >
                  {option?.label || selectedValue}
                </span>
              )
            })}
            {value.length > 3 && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                +{value.length - 3} more
              </span>
            )}
          </div>
        </div>
      )}
      
      {helperText && !error && (
        <p className="mt-1 text-sm text-gray-500">
          {helperText}
        </p>
      )}
      
      {error && (
        <p className="mt-1 text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  )
})

FormMultiSelect.displayName = 'FormMultiSelect'

export default FormMultiSelect
