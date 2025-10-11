// Token storage keys
export const TOKEN_KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  USER_DATA: 'user_data',
  REMEMBER_ME: 'remember_me',
  THEME: 'theme',
  LANGUAGE: 'language',
}

// Session storage keys
export const SESSION_KEYS = {
  CURRENT_USER: 'current_user',
  USER_ROLE: 'user_role',
  USER_PERMISSIONS: 'user_permissions',
  BUSINESS_ID: 'business_id',
  LAST_ACTIVITY: 'last_activity',
  TEMP_DATA: 'temp_data',
}

// Local storage keys
export const LOCAL_STORAGE_KEYS = {
  SETTINGS: 'app_settings',
  PREFERENCES: 'user_preferences',
  CACHE: 'app_cache',
  OFFLINE_DATA: 'offline_data',
  BACKUP_DATA: 'backup_data',
}

// Cookie keys
export const COOKIE_KEYS = {
  SESSION_ID: 'session_id',
  CSRF_TOKEN: 'csrf_token',
  CONSENT: 'consent',
  ANALYTICS: 'analytics',
}

// Token expiration times (in seconds)
export const TOKEN_EXPIRATION = {
  ACCESS_TOKEN: 15 * 60, // 15 minutes
  REFRESH_TOKEN: 7 * 24 * 60 * 60, // 7 days
  REMEMBER_ME: 30 * 24 * 60 * 60, // 30 days
}

// Storage types
export const STORAGE_TYPES = {
  LOCAL: 'localStorage',
  SESSION: 'sessionStorage',
  COOKIE: 'cookie',
  MEMORY: 'memory',
}

// Token prefixes
export const TOKEN_PREFIXES = {
  BEARER: 'Bearer ',
  BASIC: 'Basic ',
}

export default {
  TOKEN_KEYS,
  SESSION_KEYS,
  LOCAL_STORAGE_KEYS,
  COOKIE_KEYS,
  TOKEN_EXPIRATION,
  STORAGE_TYPES,
  TOKEN_PREFIXES,
}
