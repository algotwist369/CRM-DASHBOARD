// API Error Messages
export const API_ERROR_MESSAGES = {
  // Network errors
  NETWORK_ERROR: 'Network error. Please check your internet connection.',
  TIMEOUT_ERROR: 'Request timeout. Please try again.',
  CONNECTION_ERROR: 'Unable to connect to server. Please try again later.',

  // Authentication errors
  UNAUTHORIZED: 'You are not authorized to access this resource.',
  FORBIDDEN: 'Access denied. You do not have permission to perform this action.',
  TOKEN_EXPIRED: 'Your session has expired. Please log in again.',
  INVALID_CREDENTIALS: 'Invalid email or password.',
  ACCOUNT_LOCKED: 'Your account has been locked. Please contact support.',

  // Validation errors
  VALIDATION_ERROR: 'Please check your input and try again.',
  REQUIRED_FIELD: 'This field is required.',
  INVALID_EMAIL: 'Please enter a valid email address.',
  INVALID_PHONE: 'Please enter a valid phone number.',
  PASSWORD_TOO_SHORT: 'Password must be at least 8 characters long.',
  PASSWORD_MISMATCH: 'Passwords do not match.',

  // Business logic errors
  BUSINESS_NOT_FOUND: 'Business not found.',
  STAFF_NOT_FOUND: 'Staff member not found.',
  CUSTOMER_NOT_FOUND: 'Customer not found.',
  APPOINTMENT_NOT_FOUND: 'Appointment not found.',
  SERVICE_NOT_FOUND: 'Service not found.',
  SLOT_NOT_AVAILABLE: 'This time slot is no longer available.',
  APPOINTMENT_CONFLICT: 'You already have an appointment at this time.',

  // Server errors
  INTERNAL_ERROR: 'An internal server error occurred. Please try again later.',
  SERVICE_UNAVAILABLE: 'Service is temporarily unavailable. Please try again later.',
  DATABASE_ERROR: 'Database error occurred. Please try again later.',

  // File upload errors
  FILE_TOO_LARGE: 'File size is too large. Please choose a smaller file.',
  INVALID_FILE_TYPE: 'Invalid file type. Please choose a supported file format.',
  UPLOAD_FAILED: 'File upload failed. Please try again.',

  // Rate limiting
  RATE_LIMIT_EXCEEDED: 'Too many requests. Please wait before trying again.',

  // Generic errors
  UNKNOWN_ERROR: 'An unexpected error occurred. Please try again.',
  OPERATION_FAILED: 'Operation failed. Please try again.',
}

// Form validation error messages
export const VALIDATION_ERROR_MESSAGES = {
  REQUIRED: 'This field is required',
  EMAIL: 'Please enter a valid email address',
  PHONE: 'Please enter a valid phone number',
  MIN_LENGTH: (min) => `Must be at least ${min} characters`,
  MAX_LENGTH: (max) => `Must be no more than ${max} characters`,
  MIN_VALUE: (min) => `Must be at least ${min}`,
  MAX_VALUE: (max) => `Must be no more than ${max}`,
  PATTERN: 'Invalid format',
  UNIQUE: 'This value already exists',
  CONFIRM_PASSWORD: 'Passwords do not match',
}

// User-friendly error messages
export const USER_ERROR_MESSAGES = {
  LOGIN_FAILED: 'Login failed. Please check your credentials.',
  REGISTRATION_FAILED: 'Registration failed. Please try again.',
  UPDATE_FAILED: 'Update failed. Please try again.',
  DELETE_FAILED: 'Delete failed. Please try again.',
  SAVE_FAILED: 'Save failed. Please try again.',
  LOAD_FAILED: 'Failed to load data. Please refresh the page.',
  BOOKING_FAILED: 'Booking failed. Please try again.',
  PAYMENT_FAILED: 'Payment failed. Please try again.',
}

export default {
  API_ERROR_MESSAGES,
  VALIDATION_ERROR_MESSAGES,
  USER_ERROR_MESSAGES,
}
