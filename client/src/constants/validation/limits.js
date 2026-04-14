// Validation limits
export const VALIDATION_LIMITS = {
  // Text length limits
  TEXT: {
    MIN_LENGTH: 1,
    MAX_LENGTH: 255,
    SHORT_MAX: 50,
    MEDIUM_MAX: 100,
    LONG_MAX: 500,
    VERY_LONG_MAX: 1000,
    EXTRA_LONG_MAX: 5000,
  },

  // Name limits
  NAME: {
    FIRST_NAME_MIN: 2,
    FIRST_NAME_MAX: 50,
    LAST_NAME_MIN: 2,
    LAST_NAME_MAX: 50,
    FULL_NAME_MIN: 2,
    FULL_NAME_MAX: 100,
    BUSINESS_NAME_MIN: 2,
    BUSINESS_NAME_MAX: 100,
    DISPLAY_NAME_MIN: 2,
    DISPLAY_NAME_MAX: 50,
  },

  // Email limits
  EMAIL: {
    MIN_LENGTH: 5,
    MAX_LENGTH: 254,
    LOCAL_PART_MAX: 64,
    DOMAIN_MAX: 253,
  },

  // Password limits
  PASSWORD: {
    MIN_LENGTH: 8,
    MAX_LENGTH: 128,
    WEAK_MIN: 6,
    MEDIUM_MIN: 8,
    STRONG_MIN: 12,
    VERY_STRONG_MIN: 16,
  },

  // Phone limits
  PHONE: {
    MIN_LENGTH: 10,
    MAX_LENGTH: 15,
    US_LENGTH: 10,
    INTERNATIONAL_MIN: 7,
    INTERNATIONAL_MAX: 15,
  },

  // Address limits
  ADDRESS: {
    STREET_MIN: 5,
    STREET_MAX: 100,
    CITY_MIN: 2,
    CITY_MAX: 50,
    STATE_MIN: 2,
    STATE_MAX: 50,
    ZIP_MIN: 5,
    ZIP_MAX: 10,
    COUNTRY_MIN: 2,
    COUNTRY_MAX: 50,
  },

  // URL limits
  URL: {
    MIN_LENGTH: 10,
    MAX_LENGTH: 2048,
    DOMAIN_MIN: 3,
    DOMAIN_MAX: 253,
    PATH_MAX: 2000,
  },

  // Username limits
  USERNAME: {
    MIN_LENGTH: 3,
    MAX_LENGTH: 20,
    ALLOWED_CHARS: /^[a-zA-Z0-9_-]+$/,
  },

  // File limits
  FILE: {
    SIZE_MAX: 10 * 1024 * 1024, // 10MB
    SIZE_MAX_LARGE: 100 * 1024 * 1024, // 100MB
    SIZE_MAX_IMAGE: 15 * 1024 * 1024, // 5MB
    SIZE_MAX_DOCUMENT: 215 * 1024 * 1024, // 25MB
    COUNT_MAX: 10,
    COUNT_MAX_LARGE: 50,
  },

  // Image limits
  IMAGE: {
    WIDTH_MAX: 4096,
    HEIGHT_MAX: 4096,
    WIDTH_MIN: 1,
    HEIGHT_MIN: 1,
    ASPECT_RATIO_MAX: 10,
    ASPECT_RATIO_MIN: 0.1,
  },

  // Number limits
  NUMBER: {
    INTEGER_MIN: -2147483648,
    INTEGER_MAX: 2147483647,
    LONG_MIN: -9223372036854775808,
    LONG_MAX: 9223372036854775807,
    DECIMAL_PLACES_MAX: 10,
    PERCENTAGE_MIN: 0,
    PERCENTAGE_MAX: 100,
  },

  // Currency limits
  CURRENCY: {
    MIN: 0,
    MAX: 999999999.99,
    DECIMAL_PLACES: 2,
    NEGATIVE_ALLOWED: false,
  },

  // Date limits
  DATE: {
    MIN_YEAR: 1900,
    MAX_YEAR: 2100,
    MIN_AGE: 13,
    MAX_AGE: 120,
    FUTURE_DAYS_MAX: 365,
    PAST_DAYS_MAX: 365,
  },

  // Time limits
  TIME: {
    MIN_HOUR: 0,
    MAX_HOUR: 23,
    MIN_MINUTE: 0,
    MAX_MINUTE: 59,
    MIN_SECOND: 0,
    MAX_SECOND: 59,
  },

  // Appointment limits
  APPOINTMENT: {
    DURATION_MIN: 15, // minutes
    DURATION_MAX: 480, // 8 hours
    ADVANCE_BOOKING_DAYS: 90,
    CANCELLATION_HOURS: 24,
    RESCHEDULE_HOURS: 2,
  },

  // Business limits
  BUSINESS: {
    STAFF_MAX: 100,
    SERVICES_MAX: 50,
    CUSTOMERS_MAX: 10000,
    APPOINTMENTS_PER_DAY_MAX: 200,
    HOURS_PER_DAY_MAX: 24,
  },

  // Customer limits
  CUSTOMER: {
    APPOINTMENTS_PER_DAY_MAX: 5,
    APPOINTMENTS_PER_WEEK_MAX: 20,
    APPOINTMENTS_PER_MONTH_MAX: 80,
    NOTES_MAX_LENGTH: 1000,
  },

  // Staff limits
  STAFF: {
    APPOINTMENTS_PER_DAY_MAX: 50,
    APPOINTMENTS_PER_WEEK_MAX: 200,
    HOURS_PER_DAY_MAX: 12,
    HOURS_PER_WEEK_MAX: 60,
  },

  // Notification limits
  NOTIFICATION: {
    TITLE_MAX: 100,
    MESSAGE_MAX: 500,
    CAMPAIGN_RECIPIENTS_MAX: 10000,
    DAILY_NOTIFICATIONS_MAX: 100,
  },

  // Search limits
  SEARCH: {
    QUERY_MIN: 2,
    QUERY_MAX: 100,
    RESULTS_MAX: 100,
    RESULTS_DEFAULT: 20,
    SUGGESTIONS_MAX: 10,
  },

  // Pagination limits
  PAGINATION: {
    PAGE_SIZE_MIN: 1,
    PAGE_SIZE_MAX: 100,
    PAGE_SIZE_DEFAULT: 20,
    PAGE_NUMBER_MIN: 1,
    PAGE_NUMBER_MAX: 10000,
  },

  // Rate limiting
  RATE_LIMIT: {
    REQUESTS_PER_MINUTE: 60,
    REQUESTS_PER_HOUR: 1000,
    REQUESTS_PER_DAY: 10000,
    LOGIN_ATTEMPTS_MAX: 5,
    PASSWORD_RESET_ATTEMPTS_MAX: 3,
  },

  // Session limits
  SESSION: {
    TIMEOUT_MINUTES: 30,
    TIMEOUT_HOURS: 24,
    MAX_CONCURRENT_SESSIONS: 5,
    INACTIVITY_TIMEOUT_MINUTES: 15,
  },

  // Cache limits
  CACHE: {
    TTL_SECONDS: 300, // 5 minutes
    TTL_MINUTES: 60, // 1 hour
    TTL_HOURS: 24, // 1 day
    MAX_ENTRIES: 1000,
    MAX_SIZE_MB: 100,
  },

  // Database limits
  DATABASE: {
    QUERY_TIMEOUT_SECONDS: 30,
    CONNECTION_TIMEOUT_SECONDS: 10,
    MAX_CONNECTIONS: 100,
    BATCH_SIZE_MAX: 1000,
  },

  // API limits
  API: {
    REQUEST_SIZE_MAX: 10 * 1024 * 1024, // 10MB
    RESPONSE_SIZE_MAX: 50 * 1024 * 1024, // 50MB
    TIMEOUT_SECONDS: 30,
    RETRY_ATTEMPTS_MAX: 3,
  },

  // Form limits
  FORM: {
    FIELDS_MAX: 50,
    FILES_MAX: 10,
    SUBMISSIONS_PER_HOUR_MAX: 10,
    VALIDATION_TIMEOUT_SECONDS: 5,
  },

  // Content limits
  CONTENT: {
    TITLE_MAX: 200,
    DESCRIPTION_MAX: 1000,
    CONTENT_MAX: 10000,
    TAGS_MAX: 10,
    CATEGORIES_MAX: 5,
  },

  // Social media limits
  SOCIAL: {
    POST_LENGTH_MAX: 280,
    BIO_LENGTH_MAX: 160,
    HASHTAGS_MAX: 30,
    MENTIONS_MAX: 10,
  },

  // Security limits
  SECURITY: {
    PASSWORD_HISTORY_MAX: 5,
    ACCOUNT_LOCKOUT_ATTEMPTS: 5,
    ACCOUNT_LOCKOUT_DURATION_MINUTES: 30,
    TOKEN_EXPIRY_HOURS: 24,
    REFRESH_TOKEN_EXPIRY_DAYS: 30,
  },
}

// Validation limit categories
export const LIMIT_CATEGORIES = {
  TEXT: 'text',
  NAME: 'name',
  EMAIL: 'email',
  PASSWORD: 'password',
  PHONE: 'phone',
  ADDRESS: 'address',
  URL: 'url',
  USERNAME: 'username',
  FILE: 'file',
  IMAGE: 'image',
  NUMBER: 'number',
  CURRENCY: 'currency',
  DATE: 'date',
  TIME: 'time',
  APPOINTMENT: 'appointment',
  BUSINESS: 'business',
  CUSTOMER: 'customer',
  STAFF: 'staff',
  NOTIFICATION: 'notification',
  SEARCH: 'search',
  PAGINATION: 'pagination',
  RATE_LIMIT: 'rate_limit',
  SESSION: 'session',
  CACHE: 'cache',
  DATABASE: 'database',
  API: 'api',
  FORM: 'form',
  CONTENT: 'content',
  SOCIAL: 'social',
  SECURITY: 'security',
}

// Limit validation functions
export const LIMIT_VALIDATORS = {
  // Text length validation
  validateTextLength: (text, min = VALIDATION_LIMITS.TEXT.MIN_LENGTH, max = VALIDATION_LIMITS.TEXT.MAX_LENGTH) => {
    if (!text) return false;
    const length = text.length;
    return length >= min && length <= max;
  },

  // Name validation
  validateName: (name, type = 'full') => {
    if (!name) return false;
    const limits = VALIDATION_LIMITS.NAME;
    switch (type) {
      case 'first':
        return name.length >= limits.FIRST_NAME_MIN && name.length <= limits.FIRST_NAME_MAX;
      case 'last':
        return name.length >= limits.LAST_NAME_MIN && name.length <= limits.LAST_NAME_MAX;
      case 'business':
        return name.length >= limits.BUSINESS_NAME_MIN && name.length <= limits.BUSINESS_NAME_MAX;
      default:
        return name.length >= limits.FULL_NAME_MIN && name.length <= limits.FULL_NAME_MAX;
    }
  },

  // Email validation
  validateEmail: (email) => {
    if (!email) return false;
    const limits = VALIDATION_LIMITS.EMAIL;
    return email.length >= limits.MIN_LENGTH && email.length <= limits.MAX_LENGTH;
  },

  // Password validation
  validatePassword: (password, strength = 'medium') => {
    if (!password) return false;
    const limits = VALIDATION_LIMITS.PASSWORD;
    switch (strength) {
      case 'weak':
        return password.length >= limits.WEAK_MIN;
      case 'strong':
        return password.length >= limits.STRONG_MIN;
      case 'very_strong':
        return password.length >= limits.VERY_STRONG_MIN;
      default:
        return password.length >= limits.MEDIUM_MIN;
    }
  },

  // Phone validation
  validatePhone: (phone, type = 'general') => {
    if (!phone) return false;
    const limits = VALIDATION_LIMITS.PHONE;
    switch (type) {
      case 'us':
        return phone.length === limits.US_LENGTH;
      case 'international':
        return phone.length >= limits.INTERNATIONAL_MIN && phone.length <= limits.INTERNATIONAL_MAX;
      default:
        return phone.length >= limits.MIN_LENGTH && phone.length <= limits.MAX_LENGTH;
    }
  },

  // File size validation
  validateFileSize: (size, type = 'general') => {
    if (!size) return false;
    const limits = VALIDATION_LIMITS.FILE;
    switch (type) {
      case 'image':
        return size <= limits.SIZE_MAX_IMAGE;
      case 'document':
        return size <= limits.SIZE_MAX_DOCUMENT;
      case 'large':
        return size <= limits.SIZE_MAX_LARGE;
      default:
        return size <= limits.SIZE_MAX;
    }
  },

  // Number validation
  validateNumber: (number, type = 'integer') => {
    if (number === null || number === undefined) return false;
    const limits = VALIDATION_LIMITS.NUMBER;
    switch (type) {
      case 'integer':
        return number >= limits.INTEGER_MIN && number <= limits.INTEGER_MAX;
      case 'long':
        return number >= limits.LONG_MIN && number <= limits.LONG_MAX;
      case 'percentage':
        return number >= limits.PERCENTAGE_MIN && number <= limits.PERCENTAGE_MAX;
      default:
        return true;
    }
  },

  // Currency validation
  validateCurrency: (amount) => {
    if (amount === null || amount === undefined) return false;
    const limits = VALIDATION_LIMITS.CURRENCY;
    return amount >= limits.MIN && amount <= limits.MAX;
  },

  // Date validation
  validateDate: (date, type = 'general') => {
    if (!date) return false;
    const limits = VALIDATION_LIMITS.DATE;
    const year = date.getFullYear();
    switch (type) {
      case 'year':
        return year >= limits.MIN_YEAR && year <= limits.MAX_YEAR;
      case 'age':
        const age = new Date().getFullYear() - year;
        return age >= limits.MIN_AGE && age <= limits.MAX_AGE;
      default:
        return year >= limits.MIN_YEAR && year <= limits.MAX_YEAR;
    }
  },

  // Username validation
  validateUsername: (username) => {
    if (!username) return false;
    const limits = VALIDATION_LIMITS.USERNAME;
    return username.length >= limits.MIN_LENGTH && 
           username.length <= limits.MAX_LENGTH && 
           limits.ALLOWED_CHARS.test(username);
  },
}

// Limit utilities
export const LIMIT_UTILITIES = {
  // Get limit value
  getLimit: (category, field) => VALIDATION_LIMITS[category]?.[field] || null,
  
  // Get all limits for category
  getCategoryLimits: (category) => VALIDATION_LIMITS[category] || {},
  
  // Check if value is within limits
  isWithinLimits: (value, category, field, type = 'min') => {
    const limit = VALIDATION_LIMITS[category]?.[field];
    if (!limit) return true;
    
    if (type === 'min') {
      return value >= limit;
    } else if (type === 'max') {
      return value <= limit;
    } else if (type === 'range') {
      const minField = field.replace('_MAX', '_MIN');
      const minLimit = VALIDATION_LIMITS[category]?.[minField];
      return value >= minLimit && value <= limit;
    }
    
    return true;
  },
  
  // Get limit description
  getLimitDescription: (category, field) => {
    const limit = VALIDATION_LIMITS[category]?.[field];
    if (!limit) return null;
    
    if (typeof limit === 'number') {
      return `Must be ${limit}`;
    } else if (typeof limit === 'object') {
      return `Must be between ${limit.MIN || limit.MIN_LENGTH} and ${limit.MAX || limit.MAX_LENGTH}`;
    }
    
    return null;
  },
}

export default {
  VALIDATION_LIMITS,
  LIMIT_CATEGORIES,
  LIMIT_VALIDATORS,
  LIMIT_UTILITIES,
}
