import React, { forwardRef } from 'react'

const FormRadio = forwardRef(({ 
  name,
  label,
  value,
  checked = false,
  onChange,
  onBlur,
  required = false,
  disabled = false,
  error,
  helperText,
  className = '',
  size = 'md',
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

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'h-4 w-4'
      case 'lg':
        return 'h-6 w-6'
      default:
        return 'h-5 w-5'
    }
  }

  const getLabelSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'text-sm'
      case 'lg':
        return 'text-lg'
      default:
        return 'text-base'
    }
  }

  return (
    <div className={`form-radio ${className}`}>
      <div className="flex items-start">
        <div className="flex items-center h-5">
          <input
            ref={ref}
            id={`${name}_${value}`}
            name={name}
            type="radio"
            value={value}
            checked={checked}
            onChange={handleChange}
            onBlur={handleBlur}
            disabled={disabled}
            className={`
              ${getSizeClasses()} 
              text-primary-600 border-gray-300 
              focus:ring-primary-500 focus:ring-2
              disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed
              ${error ? 'border-red-300 focus:ring-red-500' : ''}
            `}
            {...props}
          />
        </div>
        
        {label && (
          <div className="ml-3">
            <label 
              htmlFor={`${name}_${value}`}
              className={`
                ${getLabelSizeClasses()} font-medium text-gray-700 cursor-pointer
                ${disabled ? 'text-gray-400 cursor-not-allowed' : ''}
                ${required ? 'after:content-["*"] after:ml-0.5 after:text-red-500' : ''}
              `}
            >
              {label}
            </label>
            
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
        )}
      </div>
    </div>
  )
})

FormRadio.displayName = 'FormRadio'

// Radio Group Component
export const FormRadioGroup = ({ 
  name,
  label,
  options = [],
  value,
  onChange,
  onBlur,
  required = false,
  disabled = false,
  error,
  helperText,
  className = '',
  size = 'md',
  direction = 'vertical', // 'vertical' or 'horizontal'
  ...props
}) => {
  const handleChange = (optionValue) => {
    if (onChange) {
      onChange(optionValue)
    }
  }

  const handleBlur = (e) => {
    if (onBlur) {
      onBlur(e)
    }
  }

  const getDirectionClasses = () => {
    return direction === 'horizontal' 
      ? 'flex flex-wrap gap-4' 
      : 'space-y-2'
  }

  return (
    <div className={`form-radio-group ${className}`}>
      {label && (
        <label 
          className={`block text-sm font-medium text-gray-700 mb-3 ${
            required ? 'after:content-["*"] after:ml-0.5 after:text-red-500' : ''
          }`}
        >
          {label}
        </label>
      )}
      
      <div className={getDirectionClasses()}>
        {options.map((option, index) => {
          const optionValue = typeof option === 'string' ? option : option.value
          const optionLabel = typeof option === 'string' ? option : option.label
          const optionDisabled = typeof option === 'object' ? option.disabled : false
          
          return (
            <FormRadio
              key={index}
              name={name}
              label={optionLabel}
              value={optionValue}
              checked={value === optionValue}
              onChange={handleChange}
              onBlur={handleBlur}
              disabled={disabled || optionDisabled}
              size={size}
              {...props}
            />
          )
        })}
      </div>
      
      {helperText && !error && (
        <p className="mt-2 text-sm text-gray-500">
          {helperText}
        </p>
      )}
      
      {error && (
        <p className="mt-2 text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  )
}

export default FormRadio
