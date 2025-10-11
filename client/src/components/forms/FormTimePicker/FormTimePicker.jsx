import React, { forwardRef } from 'react'
import { TimePicker } from '../../common'

const FormTimePicker = forwardRef(({ 
  name,
  label,
  value,
  onChange,
  onBlur,
  placeholder = 'Select time',
  required = false,
  disabled = false,
  error,
  helperText,
  className = '',
  size = 'md',
  format = '12h', // '12h' or '24h'
  interval = 30, // minutes
  minTime,
  maxTime,
  ...props
}, ref) => {
  const handleChange = (selectedTime) => {
    if (onChange) {
      onChange(selectedTime)
    }
  }

  const handleBlur = () => {
    if (onBlur) {
      onBlur({ target: { name, value } })
    }
  }

  return (
    <div className={`form-timepicker ${className}`}>
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
      
      <TimePicker
        ref={ref}
        id={name}
        name={name}
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder={placeholder}
        disabled={disabled}
        format={format}
        interval={interval}
        minTime={minTime}
        maxTime={maxTime}
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

FormTimePicker.displayName = 'FormTimePicker'

export default FormTimePicker
