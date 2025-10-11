// Validation patterns
export const VALIDATION_PATTERNS = {
  // Email patterns
  EMAIL: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  EMAIL_STRICT: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  EMAIL_SIMPLE: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,

  // Phone patterns
  PHONE_US: /^\+?1?[-.\s]?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})$/,
  PHONE_INTERNATIONAL: /^\+?[1-9]\d{1,14}$/,
  PHONE_GENERAL: /^[\+]?[1-9][\d]{0,15}$/,
  PHONE_WITH_EXTENSION: /^[\+]?[1-9][\d]{0,15}(\s?ext\s?\d{1,6})?$/,

  // Password patterns
  PASSWORD_WEAK: /^.{6,}$/,
  PASSWORD_MEDIUM: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/,
  PASSWORD_STRONG: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/,
  PASSWORD_VERY_STRONG: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])(?=.*[^a-zA-Z\d@$!%*?&]).{12,}$/,

  // Name patterns
  NAME_FIRST: /^[a-zA-Z\s'-]{2,50}$/,
  NAME_LAST: /^[a-zA-Z\s'-]{2,50}$/,
  NAME_FULL: /^[a-zA-Z\s'-]{2,100}$/,
  NAME_BUSINESS: /^[a-zA-Z0-9\s&.,'-]{2,100}$/,

  // Address patterns
  ADDRESS_STREET: /^[a-zA-Z0-9\s#.,-]{5,100}$/,
  ADDRESS_CITY: /^[a-zA-Z\s'-]{2,50}$/,
  ADDRESS_STATE: /^[a-zA-Z\s]{2,50}$/,
  ADDRESS_ZIP_US: /^\d{5}(-\d{4})?$/,
  ADDRESS_ZIP_CANADA: /^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/,
  ADDRESS_POSTAL_GENERAL: /^[a-zA-Z0-9\s-]{3,10}$/,

  // URL patterns
  URL_HTTP: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
  URL_HTTPS: /^https:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
  URL_DOMAIN: /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/,

  // Date patterns
  DATE_ISO: /^\d{4}-\d{2}-\d{2}$/,
  DATE_US: /^\d{2}\/\d{2}\/\d{4}$/,
  DATE_EU: /^\d{2}\/\d{2}\/\d{4}$/,
  DATE_TIME_ISO: /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/,

  // Time patterns
  TIME_12: /^(0?[1-9]|1[0-2]):[0-5]\d\s?(AM|PM)$/i,
  TIME_24: /^([01]?[0-9]|2[0-3]):[0-5]\d$/,
  TIME_WITH_SECONDS: /^([01]?[0-9]|2[0-3]):[0-5]\d:[0-5]\d$/,

  // Credit card patterns
  CREDIT_CARD_VISA: /^4[0-9]{12}(?:[0-9]{3})?$/,
  CREDIT_CARD_MASTERCARD: /^5[1-5][0-9]{14}$/,
  CREDIT_CARD_AMEX: /^3[47][0-9]{13}$/,
  CREDIT_CARD_DISCOVER: /^6(?:011|5[0-9]{2})[0-9]{12}$/,
  CREDIT_CARD_GENERAL: /^[0-9]{13,19}$/,

  // Social Security patterns
  SSN_US: /^\d{3}-\d{2}-\d{4}$/,
  SSN_US_NO_DASHES: /^\d{9}$/,

  // Business patterns
  EIN_US: /^\d{2}-\d{7}$/,
  EIN_US_NO_DASHES: /^\d{9}$/,
  BUSINESS_LICENSE: /^[A-Z0-9]{6,20}$/,

  // Currency patterns
  CURRENCY_USD: /^\$?(\d{1,3}(,\d{3})*|(\d+))(\.\d{2})?$/,
  CURRENCY_GENERAL: /^\d+(\.\d{1,2})?$/,
  CURRENCY_WITH_SYMBOL: /^[$\u20AC\u00A3\u00A5]\s?\d+(\.\d{1,2})?$/,

  // Number patterns
  NUMBER_INTEGER: /^-?\d+$/,
  NUMBER_POSITIVE: /^\d+$/,
  NUMBER_DECIMAL: /^-?\d+(\.\d+)?$/,
  NUMBER_PERCENTAGE: /^\d+(\.\d+)?%?$/,

  // Text patterns
  TEXT_ALPHANUMERIC: /^[a-zA-Z0-9]+$/,
  TEXT_ALPHA: /^[a-zA-Z]+$/,
  TEXT_NUMERIC: /^[0-9]+$/,
  TEXT_NO_SPECIAL: /^[a-zA-Z0-9\s]+$/,
  TEXT_WITH_SPACES: /^[a-zA-Z0-9\s-_.]+$/,

  // Special patterns
  SLUG: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
  USERNAME: /^[a-zA-Z0-9_-]{3,20}$/,
  HASHTAG: /^#[a-zA-Z0-9_]+$/,
  MENTION: /^@[a-zA-Z0-9_]+$/,

  // File patterns
  FILE_IMAGE: /\.(jpg|jpeg|png|gif|bmp|webp|svg)$/i,
  FILE_DOCUMENT: /\.(pdf|doc|docx|txt|rtf)$/i,
  FILE_SPREADSHEET: /\.(xls|xlsx|csv)$/i,
  FILE_PRESENTATION: /\.(ppt|pptx)$/i,
  FILE_ARCHIVE: /\.(zip|rar|7z|tar|gz)$/i,

  // Color patterns
  COLOR_HEX: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,
  COLOR_RGB: /^rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)$/,
  COLOR_RGBA: /^rgba\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(0|1|0\.\d+)\s*\)$/,

  // IP address patterns
  IP_V4: /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/,
  IP_V6: /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/,

  // MAC address patterns
  MAC_ADDRESS: /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/,

  // UUID patterns
  UUID_V4: /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
  UUID_GENERAL: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,

  // Base64 patterns
  BASE64: /^[A-Za-z0-9+/]*={0,2}$/,

  // JSON patterns
  JSON_STRING: /^[\s\S]*$/,

  // HTML patterns
  HTML_TAG: /^<[^>]+>$/,
  HTML_ATTRIBUTE: /^[a-zA-Z][a-zA-Z0-9-]*$/,

  // CSS patterns
  CSS_COLOR: /^#[0-9a-fA-F]{3,6}$|^rgb\(|^rgba\(|^hsl\(|^hsla\(/,
  CSS_UNIT: /^\d+(\.\d+)?(px|em|rem|%|vh|vw|pt|pc|in|cm|mm)$/,

  // Regular expression patterns
  REGEX_PATTERN: /^\/(.*)\/([gimuy]*)$/,
}

// Pattern descriptions
export const PATTERN_DESCRIPTIONS = {
  EMAIL: 'Valid email address',
  PHONE_US: 'US phone number',
  PHONE_INTERNATIONAL: 'International phone number',
  PASSWORD_WEAK: 'At least 6 characters',
  PASSWORD_MEDIUM: 'At least 8 characters with uppercase, lowercase, and number',
  PASSWORD_STRONG: 'At least 8 characters with uppercase, lowercase, number, and special character',
  NAME_FIRST: 'First name (2-50 characters, letters, spaces, hyphens, apostrophes)',
  NAME_LAST: 'Last name (2-50 characters, letters, spaces, hyphens, apostrophes)',
  ADDRESS_STREET: 'Street address (5-100 characters)',
  ADDRESS_CITY: 'City name (2-50 characters, letters, spaces, hyphens, apostrophes)',
  ADDRESS_ZIP_US: 'US ZIP code (5 digits or 5+4 format)',
  URL_HTTP: 'HTTP or HTTPS URL',
  DATE_ISO: 'ISO date format (YYYY-MM-DD)',
  TIME_12: '12-hour time format (HH:MM AM/PM)',
  TIME_24: '24-hour time format (HH:MM)',
  CREDIT_CARD_VISA: 'Visa credit card number',
  CREDIT_CARD_MASTERCARD: 'Mastercard credit card number',
  CREDIT_CARD_AMEX: 'American Express credit card number',
  SSN_US: 'US Social Security Number (XXX-XX-XXXX)',
  CURRENCY_USD: 'US Dollar amount',
  NUMBER_INTEGER: 'Integer number',
  NUMBER_DECIMAL: 'Decimal number',
  TEXT_ALPHANUMERIC: 'Alphanumeric characters only',
  TEXT_ALPHA: 'Letters only',
  TEXT_NUMERIC: 'Numbers only',
  SLUG: 'URL-friendly slug',
  USERNAME: 'Username (3-20 characters, letters, numbers, underscores, hyphens)',
  FILE_IMAGE: 'Image file (jpg, jpeg, png, gif, bmp, webp, svg)',
  COLOR_HEX: 'Hex color code (#RRGGBB or #RGB)',
  IP_V4: 'IPv4 address',
  UUID_V4: 'UUID v4',
}

// Pattern categories
export const PATTERN_CATEGORIES = {
  EMAIL: 'email',
  PHONE: 'phone',
  PASSWORD: 'password',
  NAME: 'name',
  ADDRESS: 'address',
  URL: 'url',
  DATE: 'date',
  TIME: 'time',
  CREDIT_CARD: 'credit_card',
  IDENTIFICATION: 'identification',
  BUSINESS: 'business',
  CURRENCY: 'currency',
  NUMBER: 'number',
  TEXT: 'text',
  SPECIAL: 'special',
  FILE: 'file',
  COLOR: 'color',
  NETWORK: 'network',
  IDENTIFIER: 'identifier',
  FORMAT: 'format',
}

// Pattern to category mapping
export const PATTERN_CATEGORY_MAPPING = {
  EMAIL: PATTERN_CATEGORIES.EMAIL,
  EMAIL_STRICT: PATTERN_CATEGORIES.EMAIL,
  EMAIL_SIMPLE: PATTERN_CATEGORIES.EMAIL,
  PHONE_US: PATTERN_CATEGORIES.PHONE,
  PHONE_INTERNATIONAL: PATTERN_CATEGORIES.PHONE,
  PHONE_GENERAL: PATTERN_CATEGORIES.PHONE,
  PHONE_WITH_EXTENSION: PATTERN_CATEGORIES.PHONE,
  PASSWORD_WEAK: PATTERN_CATEGORIES.PASSWORD,
  PASSWORD_MEDIUM: PATTERN_CATEGORIES.PASSWORD,
  PASSWORD_STRONG: PATTERN_CATEGORIES.PASSWORD,
  PASSWORD_VERY_STRONG: PATTERN_CATEGORIES.PASSWORD,
  NAME_FIRST: PATTERN_CATEGORIES.NAME,
  NAME_LAST: PATTERN_CATEGORIES.NAME,
  NAME_FULL: PATTERN_CATEGORIES.NAME,
  NAME_BUSINESS: PATTERN_CATEGORIES.NAME,
  ADDRESS_STREET: PATTERN_CATEGORIES.ADDRESS,
  ADDRESS_CITY: PATTERN_CATEGORIES.ADDRESS,
  ADDRESS_STATE: PATTERN_CATEGORIES.ADDRESS,
  ADDRESS_ZIP_US: PATTERN_CATEGORIES.ADDRESS,
  ADDRESS_ZIP_CANADA: PATTERN_CATEGORIES.ADDRESS,
  ADDRESS_POSTAL_GENERAL: PATTERN_CATEGORIES.ADDRESS,
  URL_HTTP: PATTERN_CATEGORIES.URL,
  URL_HTTPS: PATTERN_CATEGORIES.URL,
  URL_DOMAIN: PATTERN_CATEGORIES.URL,
  DATE_ISO: PATTERN_CATEGORIES.DATE,
  DATE_US: PATTERN_CATEGORIES.DATE,
  DATE_EU: PATTERN_CATEGORIES.DATE,
  DATE_TIME_ISO: PATTERN_CATEGORIES.DATE,
  TIME_12: PATTERN_CATEGORIES.TIME,
  TIME_24: PATTERN_CATEGORIES.TIME,
  TIME_WITH_SECONDS: PATTERN_CATEGORIES.TIME,
  CREDIT_CARD_VISA: PATTERN_CATEGORIES.CREDIT_CARD,
  CREDIT_CARD_MASTERCARD: PATTERN_CATEGORIES.CREDIT_CARD,
  CREDIT_CARD_AMEX: PATTERN_CATEGORIES.CREDIT_CARD,
  CREDIT_CARD_DISCOVER: PATTERN_CATEGORIES.CREDIT_CARD,
  CREDIT_CARD_GENERAL: PATTERN_CATEGORIES.CREDIT_CARD,
  SSN_US: PATTERN_CATEGORIES.IDENTIFICATION,
  SSN_US_NO_DASHES: PATTERN_CATEGORIES.IDENTIFICATION,
  EIN_US: PATTERN_CATEGORIES.BUSINESS,
  EIN_US_NO_DASHES: PATTERN_CATEGORIES.BUSINESS,
  BUSINESS_LICENSE: PATTERN_CATEGORIES.BUSINESS,
  CURRENCY_USD: PATTERN_CATEGORIES.CURRENCY,
  CURRENCY_GENERAL: PATTERN_CATEGORIES.CURRENCY,
  CURRENCY_WITH_SYMBOL: PATTERN_CATEGORIES.CURRENCY,
  NUMBER_INTEGER: PATTERN_CATEGORIES.NUMBER,
  NUMBER_POSITIVE: PATTERN_CATEGORIES.NUMBER,
  NUMBER_DECIMAL: PATTERN_CATEGORIES.NUMBER,
  NUMBER_PERCENTAGE: PATTERN_CATEGORIES.NUMBER,
  TEXT_ALPHANUMERIC: PATTERN_CATEGORIES.TEXT,
  TEXT_ALPHA: PATTERN_CATEGORIES.TEXT,
  TEXT_NUMERIC: PATTERN_CATEGORIES.TEXT,
  TEXT_NO_SPECIAL: PATTERN_CATEGORIES.TEXT,
  TEXT_WITH_SPACES: PATTERN_CATEGORIES.TEXT,
  SLUG: PATTERN_CATEGORIES.SPECIAL,
  USERNAME: PATTERN_CATEGORIES.SPECIAL,
  HASHTAG: PATTERN_CATEGORIES.SPECIAL,
  MENTION: PATTERN_CATEGORIES.SPECIAL,
  FILE_IMAGE: PATTERN_CATEGORIES.FILE,
  FILE_DOCUMENT: PATTERN_CATEGORIES.FILE,
  FILE_SPREADSHEET: PATTERN_CATEGORIES.FILE,
  FILE_PRESENTATION: PATTERN_CATEGORIES.FILE,
  FILE_ARCHIVE: PATTERN_CATEGORIES.FILE,
  COLOR_HEX: PATTERN_CATEGORIES.COLOR,
  COLOR_RGB: PATTERN_CATEGORIES.COLOR,
  COLOR_RGBA: PATTERN_CATEGORIES.COLOR,
  IP_V4: PATTERN_CATEGORIES.NETWORK,
  IP_V6: PATTERN_CATEGORIES.NETWORK,
  MAC_ADDRESS: PATTERN_CATEGORIES.NETWORK,
  UUID_V4: PATTERN_CATEGORIES.IDENTIFIER,
  UUID_GENERAL: PATTERN_CATEGORIES.IDENTIFIER,
  BASE64: PATTERN_CATEGORIES.FORMAT,
  JSON_STRING: PATTERN_CATEGORIES.FORMAT,
  HTML_TAG: PATTERN_CATEGORIES.FORMAT,
  HTML_ATTRIBUTE: PATTERN_CATEGORIES.FORMAT,
  CSS_COLOR: PATTERN_CATEGORIES.COLOR,
  CSS_UNIT: PATTERN_CATEGORIES.FORMAT,
  REGEX_PATTERN: PATTERN_CATEGORIES.FORMAT,
}

export default {
  VALIDATION_PATTERNS,
  PATTERN_DESCRIPTIONS,
  PATTERN_CATEGORIES,
  PATTERN_CATEGORY_MAPPING,
}
