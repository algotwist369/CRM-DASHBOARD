// Application configuration
export const APP_CONFIG = {
  // Application info
  APP_NAME: 'SpaAdvisor',
  APP_VERSION: '1.0.0',
  APP_DESCRIPTION: 'Comprehensive Spa & Wellness Management Dashboard',
  APP_AUTHOR: 'SpaAdvisor Team',
  APP_URL: 'https://spaadvisor.in',
  
  // Environment
  ENVIRONMENT: import.meta.env.MODE || 'development',
  IS_DEVELOPMENT: import.meta.env.MODE === 'development',
  IS_PRODUCTION: import.meta.env.MODE === 'production',
  IS_TEST: import.meta.env.MODE === 'test',
  
  // API configuration
  API: {
    BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
    TIMEOUT: 30000, // 30 seconds
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 1000, // 1 second
  },
  
  // Authentication configuration
  AUTH: {
    TOKEN_EXPIRY: 7 * 24 * 60 * 60 * 1000, // 7 days for better UX
    REFRESH_TOKEN_EXPIRY: 7 * 24 * 60 * 60 * 1000, // 7 days
    REMEMBER_ME_EXPIRY: 30 * 24 * 60 * 60 * 1000, // 30 days
    SESSION_TIMEOUT: 7 * 24 * 60 * 60 * 1000, // 7 days
    MAX_LOGIN_ATTEMPTS: 5,
    LOCKOUT_DURATION: 30 * 60 * 1000, // 30 minutes
  },
  
  // UI configuration
  UI: {
    THEME: 'light', // 'light' | 'dark' | 'auto'
    LANGUAGE: 'en', // 'en' | 'es' | 'fr' | 'de' | etc.
    TIMEZONE: 'UTC',
    DATE_FORMAT: 'MM/DD/YYYY',
    TIME_FORMAT: '12h', // '12h' | '24h'
    CURRENCY: 'USD',
    CURRENCY_SYMBOL: '$',
    DECIMAL_PLACES: 2,
    THOUSAND_SEPARATOR: ',',
    DECIMAL_SEPARATOR: '.',
  },
  
  // Pagination configuration
  PAGINATION: {
    DEFAULT_PAGE_SIZE: 20,
    PAGE_SIZE_OPTIONS: [10, 20, 50, 100],
    MAX_PAGE_SIZE: 100,
    SHOW_SIZE_CHANGER: true,
    SHOW_QUICK_JUMPER: true,
  },
  
  // File upload configuration
  UPLOAD: {
    MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
    MAX_FILES: 10,
    ALLOWED_TYPES: [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'text/csv',
    ],
    ALLOWED_EXTENSIONS: [
      '.jpg', '.jpeg', '.png', '.gif', '.webp',
      '.pdf', '.doc', '.docx', '.txt', '.csv'
    ],
  },
  
  // Notification configuration
  NOTIFICATION: {
    POSITION: 'top-right', // 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
    DURATION: 5000, // 5 seconds
    MAX_NOTIFICATIONS: 5,
    ENABLE_SOUND: true,
    ENABLE_DESKTOP: true,
  },
  
  // Cache configuration
  CACHE: {
    ENABLED: true,
    TTL: 5 * 60 * 1000, // 5 minutes
    MAX_SIZE: 100, // MB
    MAX_ENTRIES: 1000,
  },
  
  // Analytics configuration
  ANALYTICS: {
    ENABLED: true,
    GOOGLE_ANALYTICS_ID: import.meta.env.VITE_GA_ID || '',
    MIXPANEL_TOKEN: import.meta.env.VITE_MIXPANEL_TOKEN || '',
    HOTJAR_ID: import.meta.env.VITE_HOTJAR_ID || '',
  },
  
  // Error tracking configuration
  ERROR_TRACKING: {
    ENABLED: true,
    SENTRY_DSN: import.meta.env.VITE_SENTRY_DSN || '',
    LOG_LEVEL: 'error', // 'debug' | 'info' | 'warn' | 'error'
    CAPTURE_UNHANDLED: true,
    CAPTURE_CONSOLE: false,
  },
  
  // Performance configuration
  PERFORMANCE: {
    ENABLE_LAZY_LOADING: true,
    ENABLE_CODE_SPLITTING: true,
    ENABLE_PREFETCHING: true,
    ENABLE_COMPRESSION: true,
    ENABLE_CACHING: true,
  },
  
  // Security configuration
  SECURITY: {
    ENABLE_CSRF_PROTECTION: true,
    ENABLE_XSS_PROTECTION: true,
    ENABLE_CONTENT_SECURITY_POLICY: true,
    ENABLE_HTTPS_REDIRECT: true,
    ENABLE_SECURE_COOKIES: true,
  },
  
  // Feature flags
  FEATURES: {
    ENABLE_DARK_MODE: true,
    ENABLE_MULTI_LANGUAGE: true,
    ENABLE_REAL_TIME_UPDATES: true,
    ENABLE_OFFLINE_MODE: false,
    ENABLE_PWA: false,
    ENABLE_BIOMETRIC_AUTH: false,
    ENABLE_TWO_FACTOR_AUTH: true,
    ENABLE_SOCIAL_LOGIN: false,
    ENABLE_ANALYTICS: true,
    ENABLE_NOTIFICATIONS: true,
    ENABLE_CHAT: false,
    ENABLE_VIDEO_CALLS: false,
    ENABLE_FILE_SHARING: true,
    ENABLE_COLLABORATION: false,
  },
  
  // Business configuration
  BUSINESS: {
    DEFAULT_TIMEZONE: 'UTC',
    DEFAULT_CURRENCY: 'USD',
    DEFAULT_LANGUAGE: 'en',
    DEFAULT_DATE_FORMAT: 'MM/DD/YYYY',
    DEFAULT_TIME_FORMAT: '12h',
    BUSINESS_HOURS: {
      START: '09:00',
      END: '17:00',
      DAYS: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
    },
    APPOINTMENT: {
      DEFAULT_DURATION: 60, // minutes
      MIN_DURATION: 15,
      MAX_DURATION: 480,
      ADVANCE_BOOKING_DAYS: 90,
      CANCELLATION_HOURS: 24,
      RESCHEDULE_HOURS: 2,
    },
  },
  
  // Integration configuration
  INTEGRATIONS: {
    PAYMENT: {
      STRIPE_PUBLIC_KEY: import.meta.env.VITE_STRIPE_PUBLIC_KEY || '',
      PAYPAL_CLIENT_ID: import.meta.env.VITE_PAYPAL_CLIENT_ID || '',
      SQUARE_APPLICATION_ID: import.meta.env.VITE_SQUARE_APPLICATION_ID || '',
    },
    EMAIL: {
      SENDGRID_API_KEY: import.meta.env.VITE_SENDGRID_API_KEY || '',
      MAILGUN_API_KEY: import.meta.env.VITE_MAILGUN_API_KEY || '',
      SMTP_HOST: import.meta.env.VITE_SMTP_HOST || '',
      SMTP_PORT: import.meta.env.VITE_SMTP_PORT || 587,
    },
    SMS: {
      TWILIO_ACCOUNT_SID: import.meta.env.VITE_TWILIO_ACCOUNT_SID || '',
      TWILIO_AUTH_TOKEN: import.meta.env.VITE_TWILIO_AUTH_TOKEN || '',
      TWILIO_PHONE_NUMBER: import.meta.env.VITE_TWILIO_PHONE_NUMBER || '',
    },
    STORAGE: {
      AWS_ACCESS_KEY_ID: import.meta.env.VITE_AWS_ACCESS_KEY_ID || '',
      AWS_SECRET_ACCESS_KEY: import.meta.env.VITE_AWS_SECRET_ACCESS_KEY || '',
      AWS_REGION: import.meta.env.VITE_AWS_REGION || 'us-east-1',
      AWS_S3_BUCKET: import.meta.env.VITE_AWS_S3_BUCKET || '',
    },
  },
  
  // Development configuration
  DEVELOPMENT: {
    ENABLE_DEVTOOLS: true,
    ENABLE_HOT_RELOAD: true,
    ENABLE_SOURCE_MAPS: true,
    ENABLE_ESLINT: true,
    ENABLE_PRETTIER: true,
    ENABLE_TYPE_CHECKING: true,
  },
  
  // Testing configuration
  TESTING: {
    ENABLE_MOCK_DATA: true,
    ENABLE_TEST_UTILS: true,
    ENABLE_COVERAGE: true,
    ENABLE_E2E_TESTS: false,
    MOCK_API_DELAY: 1000, // 1 second
  },
}

// Configuration utilities
export const CONFIG_UTILITIES = {
  // Get configuration value
  get: (path, defaultValue = null) => {
    const keys = path.split('.');
    let value = APP_CONFIG;
    
    for (const key of keys) {
      if (value && typeof value === 'object' && key in value) {
        value = value[key];
      } else {
        return defaultValue;
      }
    }
    
    return value;
  },
  
  // Set configuration value
  set: (path, value) => {
    const keys = path.split('.');
    const lastKey = keys.pop();
    let target = APP_CONFIG;
    
    for (const key of keys) {
      if (!target[key] || typeof target[key] !== 'object') {
        target[key] = {};
      }
      target = target[key];
    }
    
    target[lastKey] = value;
  },
  
  // Check if feature is enabled
  isFeatureEnabled: (feature) => {
    return APP_CONFIG.FEATURES[feature] === true;
  },
  
  // Get environment variable
  getEnvVar: (name, defaultValue = '') => {
    return import.meta.env[name] || defaultValue;
  },
  
  // Check if in development mode
  isDevelopment: () => APP_CONFIG.IS_DEVELOPMENT,
  
  // Check if in production mode
  isProduction: () => APP_CONFIG.IS_PRODUCTION,
  
  // Check if in test mode
  isTest: () => APP_CONFIG.IS_TEST,
  
  // Get API URL
  getApiUrl: (endpoint = '') => {
    const baseUrl = APP_CONFIG.API.BASE_URL;
    return endpoint ? `${baseUrl}/${endpoint.replace(/^\//, '')}` : baseUrl;
  },
  
  // Get upload URL
  getUploadUrl: () => {
    return `${APP_CONFIG.API.BASE_URL}/upload`;
  },
  
  // Get asset URL
  getAssetUrl: (path) => {
    const baseUrl = import.meta.env.BASE_URL || '/';
    return `${baseUrl}${path.replace(/^\//, '')}`;
  },
  
  // Get public URL
  getPublicUrl: (path) => {
    const baseUrl = import.meta.env.VITE_PUBLIC_URL || '';
    return `${baseUrl}${path.replace(/^\//, '')}`;
  },
}

// Export default configuration
export default APP_CONFIG
