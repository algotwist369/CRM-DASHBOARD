import React, { forwardRef } from 'react'
import { Input } from '../../common'

const FormField = forwardRef(({ 
  name,
  label,
  type = 'text',
  value,
  onChange,
  onBlur,
  placeholder,
  required = false,
  disabled = false,
  error,
  helperText,
  className = '',
  size = 'md',
  variant = 'default',
  icon,
  iconPosition = 'left',
  ...props
}, ref) => {
  const handleChange = (e) => {
    if (onChange) {
      onChange(e.target.value, e)
    }
  }

  const handleBlur = (e) => {
    if (onBlur) {
      onBlur(e)
    }
  }

  return (
    <div className={`form-field ${className}`}>
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
      
      <Input
        ref={ref}
        id={name}
        name={name}
        type={type}
        value={value || ''}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder={placeholder}
        disabled={disabled}
        error={error}
        size={size}
        variant={variant}
        icon={icon}
        iconPosition={iconPosition}
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

FormField.displayName = 'FormField'

export default FormField
