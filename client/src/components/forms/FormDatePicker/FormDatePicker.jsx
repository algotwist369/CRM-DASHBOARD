import React, { forwardRef } from 'react'
import { DatePicker } from '../../common'

const FormDatePicker = forwardRef(({ 
  name,
  label,
  value,
  onChange,
  onBlur,
  placeholder = 'Select date',
  required = false,
  disabled = false,
  error,
  helperText,
  className = '',
  size = 'md',
  minDate,
  maxDate,
  format = 'MM/dd/yyyy',
  showTime = false,
  timeFormat = '12h',
  ...props
}, ref) => {
  const handleChange = (selectedDate) => {
    if (onChange) {
      onChange(selectedDate)
    }
  }

  const handleBlur = () => {
    if (onBlur) {
      onBlur({ target: { name, value } })
    }
  }

  return (
    <div className={`form-datepicker ${className}`}>
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
      
      <DatePicker
        ref={ref}
        id={name}
        name={name}
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder={placeholder}
        disabled={disabled}
        minDate={minDate}
        maxDate={maxDate}
        format={format}
        showTime={showTime}
        timeFormat={timeFormat}
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

FormDatePicker.displayName = 'FormDatePicker'

export default FormDatePicker
