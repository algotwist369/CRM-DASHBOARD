/**
 * Validation schemas for different data types
 */

import {
  isRequired,
  isValidEmail,
  isValidPhone,
  isValidUrl,
  isValidDate,
  isValidNumber,
  isValidPositiveNumber,
  isValidInteger,
  hasMinLength,
  hasMaxLength,
  isValidPassword,
  isValidUuid,
  isValidTime,
  isValidTimeRange,
  isValidBusinessHours,
  isValidAppointmentDuration,
  isValidRating,
  isValidPercentage,
  isValidCurrencyAmount,
  isValidFileSize,
  isValidFileType,
  isValidArray,
  isValidObject,
  isValidBoolean,
  isValidString,
  isValidJson,
  isValidHexColor
} from './validators'

/**
 * User validation schema
 */
export const userSchema = {
  id: {
    validator: isValidUuid,
    required: false,
    message: 'Invalid user ID format'
  },
  email: {
    validator: isValidEmail,
    required: true,
    message: 'Please enter a valid email address'
  },
  password: {
    validator: (value) => isValidPassword(value, { minLength: 8 }),
    required: true,
    message: 'Password must be at least 8 characters long with uppercase, lowercase, numbers, and special characters'
  },
  firstName: {
    validator: (value) => hasMinLength(value, 2) && hasMaxLength(value, 50),
    required: true,
    message: 'First name must be between 2 and 50 characters'
  },
  lastName: {
    validator: (value) => hasMinLength(value, 2) && hasMaxLength(value, 50),
    required: true,
    message: 'Last name must be between 2 and 50 characters'
  },
  phone: {
    validator: isValidPhone,
    required: false,
    message: 'Please enter a valid phone number'
  },
  role: {
    validator: (value) => ['admin', 'manager', 'staff', 'customer'].includes(value),
    required: true,
    message: 'Please select a valid role'
  },
  status: {
    validator: (value) => ['active', 'inactive', 'pending', 'suspended'].includes(value),
    required: false,
    message: 'Please select a valid status'
  }
}

/**
 * Business validation schema
 */
export const businessSchema = {
  id: {
    validator: isValidUuid,
    required: false,
    message: 'Invalid business ID format'
  },
  name: {
    validator: (value) => hasMinLength(value, 2) && hasMaxLength(value, 100),
    required: true,
    message: 'Business name must be between 2 and 100 characters'
  },
  description: {
    validator: (value) => hasMaxLength(value, 500),
    required: false,
    message: 'Description must be less than 500 characters'
  },
  email: {
    validator: isValidEmail,
    required: true,
    message: 'Please enter a valid email address'
  },
  phone: {
    validator: isValidPhone,
    required: true,
    message: 'Please enter a valid phone number'
  },
  website: {
    validator: (value) => !value || isValidUrl(value),
    required: false,
    message: 'Please enter a valid website URL'
  },
  address: {
    validator: (value) => hasMinLength(value, 10) && hasMaxLength(value, 200),
    required: true,
    message: 'Address must be between 10 and 200 characters'
  },
  city: {
    validator: (value) => hasMinLength(value, 2) && hasMaxLength(value, 50),
    required: true,
    message: 'City must be between 2 and 50 characters'
  },
  state: {
    validator: (value) => hasMinLength(value, 2) && hasMaxLength(value, 50),
    required: true,
    message: 'State must be between 2 and 50 characters'
  },
  zipCode: {
    validator: (value) => hasMinLength(value, 5) && hasMaxLength(value, 10),
    required: true,
    message: 'Zip code must be between 5 and 10 characters'
  },
  country: {
    validator: (value) => hasMinLength(value, 2) && hasMaxLength(value, 50),
    required: true,
    message: 'Country must be between 2 and 50 characters'
  },
  category: {
    validator: (value) => hasMinLength(value, 2) && hasMaxLength(value, 50),
    required: true,
    message: 'Category must be between 2 and 50 characters'
  },
  status: {
    validator: (value) => ['active', 'inactive', 'pending', 'suspended'].includes(value),
    required: false,
    message: 'Please select a valid status'
  }
}

/**
 * Staff validation schema
 */
export const staffSchema = {
  id: {
    validator: isValidUuid,
    required: false,
    message: 'Invalid staff ID format'
  },
  businessId: {
    validator: isValidUuid,
    required: true,
    message: 'Invalid business ID format'
  },
  email: {
    validator: isValidEmail,
    required: true,
    message: 'Please enter a valid email address'
  },
  password: {
    validator: (value) => isValidPassword(value, { minLength: 8 }),
    required: true,
    message: 'Password must be at least 8 characters long with uppercase, lowercase, numbers, and special characters'
  },
  firstName: {
    validator: (value) => hasMinLength(value, 2) && hasMaxLength(value, 50),
    required: true,
    message: 'First name must be between 2 and 50 characters'
  },
  lastName: {
    validator: (value) => hasMinLength(value, 2) && hasMaxLength(value, 50),
    required: true,
    message: 'Last name must be between 2 and 50 characters'
  },
  phone: {
    validator: isValidPhone,
    required: true,
    message: 'Please enter a valid phone number'
  },
  role: {
    validator: (value) => ['manager', 'staff', 'receptionist', 'technician'].includes(value),
    required: true,
    message: 'Please select a valid role'
  },
  department: {
    validator: (value) => hasMinLength(value, 2) && hasMaxLength(value, 50),
    required: false,
    message: 'Department must be between 2 and 50 characters'
  },
  hireDate: {
    validator: isValidDate,
    required: false,
    message: 'Please enter a valid hire date'
  },
  salary: {
    validator: isValidPositiveNumber,
    required: false,
    message: 'Salary must be a positive number'
  },
  status: {
    validator: (value) => ['active', 'inactive', 'pending', 'terminated'].includes(value),
    required: false,
    message: 'Please select a valid status'
  }
}

/**
 * Customer validation schema
 */
export const customerSchema = {
  id: {
    validator: isValidUuid,
    required: false,
    message: 'Invalid customer ID format'
  },
  businessId: {
    validator: isValidUuid,
    required: true,
    message: 'Invalid business ID format'
  },
  email: {
    validator: isValidEmail,
    required: true,
    message: 'Please enter a valid email address'
  },
  firstName: {
    validator: (value) => hasMinLength(value, 2) && hasMaxLength(value, 50),
    required: true,
    message: 'First name must be between 2 and 50 characters'
  },
  lastName: {
    validator: (value) => hasMinLength(value, 2) && hasMaxLength(value, 50),
    required: true,
    message: 'Last name must be between 2 and 50 characters'
  },
  phone: {
    validator: isValidPhone,
    required: true,
    message: 'Please enter a valid phone number'
  },
  dateOfBirth: {
    validator: isValidDate,
    required: false,
    message: 'Please enter a valid date of birth'
  },
  address: {
    validator: (value) => hasMinLength(value, 10) && hasMaxLength(value, 200),
    required: false,
    message: 'Address must be between 10 and 200 characters'
  },
  city: {
    validator: (value) => hasMinLength(value, 2) && hasMaxLength(value, 50),
    required: false,
    message: 'City must be between 2 and 50 characters'
  },
  state: {
    validator: (value) => hasMinLength(value, 2) && hasMaxLength(value, 50),
    required: false,
    message: 'State must be between 2 and 50 characters'
  },
  zipCode: {
    validator: (value) => hasMinLength(value, 5) && hasMaxLength(value, 10),
    required: false,
    message: 'Zip code must be between 5 and 10 characters'
  },
  country: {
    validator: (value) => hasMinLength(value, 2) && hasMaxLength(value, 50),
    required: false,
    message: 'Country must be between 2 and 50 characters'
  },
  segment: {
    validator: (value) => ['vip', 'regular', 'new', 'at_risk'].includes(value),
    required: false,
    message: 'Please select a valid segment'
  },
  status: {
    validator: (value) => ['active', 'inactive', 'pending', 'blocked'].includes(value),
    required: false,
    message: 'Please select a valid status'
  }
}

/**
 * Appointment validation schema
 */
export const appointmentSchema = {
  id: {
    validator: isValidUuid,
    required: false,
    message: 'Invalid appointment ID format'
  },
  businessId: {
    validator: isValidUuid,
    required: true,
    message: 'Invalid business ID format'
  },
  customerId: {
    validator: isValidUuid,
    required: true,
    message: 'Invalid customer ID format'
  },
  staffId: {
    validator: isValidUuid,
    required: true,
    message: 'Invalid staff ID format'
  },
  serviceId: {
    validator: isValidUuid,
    required: true,
    message: 'Invalid service ID format'
  },
  date: {
    validator: isValidDate,
    required: true,
    message: 'Please enter a valid appointment date'
  },
  startTime: {
    validator: isValidTime,
    required: true,
    message: 'Please enter a valid start time'
  },
  endTime: {
    validator: isValidTime,
    required: true,
    message: 'Please enter a valid end time'
  },
  duration: {
    validator: isValidAppointmentDuration,
    required: false,
    message: 'Duration must be between 15 and 480 minutes'
  },
  status: {
    validator: (value) => ['scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show'].includes(value),
    required: false,
    message: 'Please select a valid status'
  },
  notes: {
    validator: (value) => hasMaxLength(value, 500),
    required: false,
    message: 'Notes must be less than 500 characters'
  }
}

/**
 * Transaction validation schema
 */
export const transactionSchema = {
  id: {
    validator: isValidUuid,
    required: false,
    message: 'Invalid transaction ID format'
  },
  businessId: {
    validator: isValidUuid,
    required: true,
    message: 'Invalid business ID format'
  },
  customerId: {
    validator: isValidUuid,
    required: true,
    message: 'Invalid customer ID format'
  },
  staffId: {
    validator: isValidUuid,
    required: false,
    message: 'Invalid staff ID format'
  },
  appointmentId: {
    validator: isValidUuid,
    required: false,
    message: 'Invalid appointment ID format'
  },
  amount: {
    validator: isValidCurrencyAmount,
    required: true,
    message: 'Amount must be a positive number'
  },
  currency: {
    validator: (value) => ['USD', 'EUR', 'GBP', 'CAD', 'AUD'].includes(value),
    required: false,
    message: 'Please select a valid currency'
  },
  paymentMethod: {
    validator: (value) => ['cash', 'credit_card', 'debit_card', 'bank_transfer', 'check', 'other'].includes(value),
    required: true,
    message: 'Please select a valid payment method'
  },
  status: {
    validator: (value) => ['pending', 'completed', 'failed', 'refunded', 'cancelled'].includes(value),
    required: false,
    message: 'Please select a valid status'
  },
  notes: {
    validator: (value) => hasMaxLength(value, 500),
    required: false,
    message: 'Notes must be less than 500 characters'
  }
}

/**
 * Service validation schema
 */
export const serviceSchema = {
  id: {
    validator: isValidUuid,
    required: false,
    message: 'Invalid service ID format'
  },
  businessId: {
    validator: isValidUuid,
    required: true,
    message: 'Invalid business ID format'
  },
  name: {
    validator: (value) => hasMinLength(value, 2) && hasMaxLength(value, 100),
    required: true,
    message: 'Service name must be between 2 and 100 characters'
  },
  description: {
    validator: (value) => hasMaxLength(value, 500),
    required: false,
    message: 'Description must be less than 500 characters'
  },
  price: {
    validator: isValidPositiveNumber,
    required: true,
    message: 'Price must be a positive number'
  },
  duration: {
    validator: isValidAppointmentDuration,
    required: true,
    message: 'Duration must be between 15 and 480 minutes'
  },
  category: {
    validator: (value) => hasMinLength(value, 2) && hasMaxLength(value, 50),
    required: false,
    message: 'Category must be between 2 and 50 characters'
  },
  status: {
    validator: (value) => ['active', 'inactive', 'discontinued'].includes(value),
    required: false,
    message: 'Please select a valid status'
  }
}

/**
 * Notification validation schema
 */
export const notificationSchema = {
  id: {
    validator: isValidUuid,
    required: false,
    message: 'Invalid notification ID format'
  },
  businessId: {
    validator: isValidUuid,
    required: true,
    message: 'Invalid business ID format'
  },
  title: {
    validator: (value) => hasMinLength(value, 2) && hasMaxLength(value, 100),
    required: true,
    message: 'Title must be between 2 and 100 characters'
  },
  message: {
    validator: (value) => hasMinLength(value, 10) && hasMaxLength(value, 500),
    required: true,
    message: 'Message must be between 10 and 500 characters'
  },
  type: {
    validator: (value) => ['email', 'sms', 'push', 'in_app'].includes(value),
    required: true,
    message: 'Please select a valid notification type'
  },
  priority: {
    validator: (value) => ['low', 'medium', 'high', 'urgent'].includes(value),
    required: false,
    message: 'Please select a valid priority'
  },
  status: {
    validator: (value) => ['draft', 'scheduled', 'sent', 'failed', 'cancelled'].includes(value),
    required: false,
    message: 'Please select a valid status'
  },
  scheduledAt: {
    validator: isValidDate,
    required: false,
    message: 'Please enter a valid scheduled date'
  }
}

/**
 * Report validation schema
 */
export const reportSchema = {
  id: {
    validator: isValidUuid,
    required: false,
    message: 'Invalid report ID format'
  },
  businessId: {
    validator: isValidUuid,
    required: true,
    message: 'Invalid business ID format'
  },
  name: {
    validator: (value) => hasMinLength(value, 2) && hasMaxLength(value, 100),
    required: true,
    message: 'Report name must be between 2 and 100 characters'
  },
  type: {
    validator: (value) => ['business', 'staff', 'customer', 'appointment', 'transaction', 'revenue', 'analytics'].includes(value),
    required: true,
    message: 'Please select a valid report type'
  },
  format: {
    validator: (value) => ['pdf', 'excel', 'csv', 'json'].includes(value),
    required: false,
    message: 'Please select a valid format'
  },
  status: {
    validator: (value) => ['draft', 'generating', 'generated', 'failed'].includes(value),
    required: false,
    message: 'Please select a valid status'
  },
  startDate: {
    validator: isValidDate,
    required: false,
    message: 'Please enter a valid start date'
  },
  endDate: {
    validator: isValidDate,
    required: false,
    message: 'Please enter a valid end date'
  }
}

/**
 * Business hours validation schema
 */
export const businessHoursSchema = {
  monday: {
    validator: (value) => !value || isValidBusinessHours({ monday: value }),
    required: false,
    message: 'Invalid Monday hours format'
  },
  tuesday: {
    validator: (value) => !value || isValidBusinessHours({ tuesday: value }),
    required: false,
    message: 'Invalid Tuesday hours format'
  },
  wednesday: {
    validator: (value) => !value || isValidBusinessHours({ wednesday: value }),
    required: false,
    message: 'Invalid Wednesday hours format'
  },
  thursday: {
    validator: (value) => !value || isValidBusinessHours({ thursday: value }),
    required: false,
    message: 'Invalid Thursday hours format'
  },
  friday: {
    validator: (value) => !value || isValidBusinessHours({ friday: value }),
    required: false,
    message: 'Invalid Friday hours format'
  },
  saturday: {
    validator: (value) => !value || isValidBusinessHours({ saturday: value }),
    required: false,
    message: 'Invalid Saturday hours format'
  },
  sunday: {
    validator: (value) => !value || isValidBusinessHours({ sunday: value }),
    required: false,
    message: 'Invalid Sunday hours format'
  }
}

/**
 * Settings validation schema
 */
export const settingsSchema = {
  theme: {
    validator: (value) => ['light', 'dark', 'auto'].includes(value),
    required: false,
    message: 'Please select a valid theme'
  },
  language: {
    validator: (value) => ['en', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'zh', 'ja', 'ko'].includes(value),
    required: false,
    message: 'Please select a valid language'
  },
  timezone: {
    validator: (value) => hasMinLength(value, 3) && hasMaxLength(value, 50),
    required: false,
    message: 'Timezone must be between 3 and 50 characters'
  },
  dateFormat: {
    validator: (value) => ['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD'].includes(value),
    required: false,
    message: 'Please select a valid date format'
  },
  timeFormat: {
    validator: (value) => ['12h', '24h'].includes(value),
    required: false,
    message: 'Please select a valid time format'
  },
  currency: {
    validator: (value) => ['USD', 'EUR', 'GBP', 'CAD', 'AUD'].includes(value),
    required: false,
    message: 'Please select a valid currency'
  },
  notifications: {
    validator: isValidBoolean,
    required: false,
    message: 'Notifications must be a boolean value'
  },
  emailNotifications: {
    validator: isValidBoolean,
    required: false,
    message: 'Email notifications must be a boolean value'
  },
  smsNotifications: {
    validator: isValidBoolean,
    required: false,
    message: 'SMS notifications must be a boolean value'
  }
}

/**
 * File upload validation schema
 */
export const fileUploadSchema = {
  file: {
    validator: (value) => value instanceof File,
    required: true,
    message: 'Please select a file'
  },
  maxSize: {
    validator: (value) => isValidFileSize(value, 10 * 1024 * 1024), // 10MB
    required: false,
    message: 'File size must be less than 10MB'
  },
  allowedTypes: {
    validator: (value) => isValidFileType(value.name, ['jpg', 'jpeg', 'png', 'gif', 'pdf', 'doc', 'docx']),
    required: false,
    message: 'File type not allowed'
  }
}

/**
 * Login validation schema
 */
export const loginSchema = {
  email: {
    validator: isValidEmail,
    required: true,
    message: 'Please enter a valid email address'
  },
  password: {
    validator: isRequired,
    required: true,
    message: 'Password is required'
  },
  rememberMe: {
    validator: isValidBoolean,
    required: false,
    message: 'Remember me must be a boolean value'
  }
}

/**
 * Register validation schema
 */
export const registerSchema = {
  email: {
    validator: isValidEmail,
    required: true,
    message: 'Please enter a valid email address'
  },
  password: {
    validator: (value) => isValidPassword(value, { minLength: 8 }),
    required: true,
    message: 'Password must be at least 8 characters long with uppercase, lowercase, numbers, and special characters'
  },
  confirmPassword: {
    validator: isRequired,
    required: true,
    message: 'Please confirm your password'
  },
  firstName: {
    validator: (value) => hasMinLength(value, 2) && hasMaxLength(value, 50),
    required: true,
    message: 'First name must be between 2 and 50 characters'
  },
  lastName: {
    validator: (value) => hasMinLength(value, 2) && hasMaxLength(value, 50),
    required: true,
    message: 'Last name must be between 2 and 50 characters'
  },
  phone: {
    validator: isValidPhone,
    required: false,
    message: 'Please enter a valid phone number'
  },
  agreeToTerms: {
    validator: (value) => value === true,
    required: true,
    message: 'You must agree to the terms and conditions'
  }
}

/**
 * Password reset validation schema
 */
export const passwordResetSchema = {
  email: {
    validator: isValidEmail,
    required: true,
    message: 'Please enter a valid email address'
  }
}

/**
 * Password change validation schema
 */
export const passwordChangeSchema = {
  currentPassword: {
    validator: isRequired,
    required: true,
    message: 'Current password is required'
  },
  newPassword: {
    validator: (value) => isValidPassword(value, { minLength: 8 }),
    required: true,
    message: 'New password must be at least 8 characters long with uppercase, lowercase, numbers, and special characters'
  },
  confirmPassword: {
    validator: isRequired,
    required: true,
    message: 'Please confirm your new password'
  }
}

/**
 * OTP validation schema
 */
export const otpSchema = {
  otp: {
    validator: (value) => hasExactLength(value, 6) && isValidInteger(value),
    required: true,
    message: 'OTP must be a 6-digit number'
  },
  type: {
    validator: (value) => ['email', 'sms', 'phone'].includes(value),
    required: true,
    message: 'Please select a valid OTP type'
  }
}

export default {
  userSchema,
  businessSchema,
  staffSchema,
  customerSchema,
  appointmentSchema,
  transactionSchema,
  serviceSchema,
  notificationSchema,
  reportSchema,
  businessHoursSchema,
  settingsSchema,
  fileUploadSchema,
  loginSchema,
  registerSchema,
  passwordResetSchema,
  passwordChangeSchema,
  otpSchema
}
