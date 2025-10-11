import React, { forwardRef } from 'react'
import { Dropdown } from '../../common'

const FormSelect = forwardRef(({ 
  name,
  label,
  value,
  onChange,
  onBlur,
  options = [],
  placeholder = 'Select an option',
  required = false,
  disabled = false,
  error,
  helperText,
  className = '',
  size = 'md',
  searchable = false,
  clearable = false,
  optionLabel = 'label',
  optionValue = 'value',
  loading = false,
  ...props
}, ref) => {
  const handleChange = (selectedValue) => {
    if (onChange) {
      onChange(selectedValue)
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

  return (
    <div className={`form-select ${className}`}>
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
        placeholder={placeholder}
        disabled={disabled}
        searchable={searchable}
        clearable={clearable}
        loading={loading}
        size={size}
        className={error ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}
        {...props}
      />
      
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

FormSelect.displayName = 'FormSelect'

export default FormSelect
