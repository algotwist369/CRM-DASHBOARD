import React, { forwardRef } from 'react'

const FormTextArea = forwardRef(({ 
  name,
  label,
  value,
  onChange,
  onBlur,
  placeholder,
  required = false,
  disabled = false,
  error,
  helperText,
  className = '',
  rows = 4,
  maxLength,
  showCharCount = false,
  resize = 'vertical',
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

  const getResizeClass = () => {
    switch (resize) {
      case 'none':
        return 'resize-none'
      case 'horizontal':
        return 'resize-x'
      case 'vertical':
        return 'resize-y'
      case 'both':
        return 'resize'
      default:
        return 'resize-y'
    }
  }

  const currentLength = value ? value.length : 0

  return (
    <div className={`form-textarea ${className}`}>
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
      
      <div className="relative">
        <textarea
          ref={ref}
          id={name}
          name={name}
          value={value || ''}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder={placeholder}
          disabled={disabled}
          rows={rows}
          maxLength={maxLength}
          className={`
            w-full px-3 py-2 border   placeholder-gray-400
            focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500
            disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
            ${getResizeClass()}
            ${error 
              ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
              : 'border-gray-300'
            }
          `}
          {...props}
        />
        
        {showCharCount && maxLength && (
          <div className="absolute bottom-2 right-2 text-xs text-gray-500">
            {currentLength}/{maxLength}
          </div>
        )}
      </div>
      
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

FormTextArea.displayName = 'FormTextArea'

export default FormTextArea
