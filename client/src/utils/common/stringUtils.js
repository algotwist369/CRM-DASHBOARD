/**
 * String utility functions
 */

/**
 * Check if value is a string
 * @param {any} value - Value to check
 * @returns {boolean} Is string
 */
export const isString = (value) => {
  return typeof value === 'string'
}

/**
 * Check if string is empty
 * @param {string} str - String to check
 * @returns {boolean} Is empty
 */
export const isEmpty = (str) => {
  return !str || typeof str !== 'string' || str.length === 0
}

/**
 * Check if string is not empty
 * @param {string} str - String to check
 * @returns {boolean} Is not empty
 */
export const isNotEmpty = (str) => {
  return str && typeof str === 'string' && str.length > 0
}

/**
 * Check if string is blank (empty or only whitespace)
 * @param {string} str - String to check
 * @returns {boolean} Is blank
 */
export const isBlank = (str) => {
  return !str || typeof str !== 'string' || str.trim().length === 0
}

/**
 * Check if string is not blank
 * @param {string} str - String to check
 * @returns {boolean} Is not blank
 */
export const isNotBlank = (str) => {
  return str && typeof str === 'string' && str.trim().length > 0
}

/**
 * Get string length safely
 * @param {string} str - String to get length from
 * @returns {number} String length
 */
export const getLength = (str) => {
  return str && typeof str === 'string' ? str.length : 0
}

/**
 * Capitalize first letter
 * @param {string} str - String to capitalize
 * @returns {string} Capitalized string
 */
export const capitalize = (str) => {
  if (!str || typeof str !== 'string') return ''
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

/**
 * Capitalize first letter of each word
 * @param {string} str - String to capitalize
 * @returns {string} Title case string
 */
export const titleCase = (str) => {
  if (!str || typeof str !== 'string') return ''
  return str
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

/**
 * Convert to camel case
 * @param {string} str - String to convert
 * @returns {string} Camel case string
 */
export const camelCase = (str) => {
  if (!str || typeof str !== 'string') return ''
  return str
    .toLowerCase()
    .replace(/[^a-zA-Z0-9]+(.)/g, (match, chr) => chr.toUpperCase())
}

/**
 * Convert to kebab case
 * @param {string} str - String to convert
 * @returns {string} Kebab case string
 */
export const kebabCase = (str) => {
  if (!str || typeof str !== 'string') return ''
  return str
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/**
 * Convert to snake case
 * @param {string} str - String to convert
 * @returns {string} Snake case string
 */
export const snakeCase = (str) => {
  if (!str || typeof str !== 'string') return ''
  return str
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .replace(/[\s-]+/g, '_')
    .replace(/^_+|_+$/g, '')
}

/**
 * Convert to pascal case
 * @param {string} str - String to convert
 * @returns {string} Pascal case string
 */
export const pascalCase = (str) => {
  if (!str || typeof str !== 'string') return ''
  const camel = camelCase(str)
  return camel.charAt(0).toUpperCase() + camel.slice(1)
}

/**
 * Convert to constant case
 * @param {string} str - String to convert
 * @returns {string} Constant case string
 */
export const constantCase = (str) => {
  if (!str || typeof str !== 'string') return ''
  return str
    .toUpperCase()
    .replace(/[^\w\s]/g, '')
    .replace(/[\s-]+/g, '_')
    .replace(/^_+|_+$/g, '')
}

/**
 * Convert to sentence case
 * @param {string} str - String to convert
 * @returns {string} Sentence case string
 */
export const sentenceCase = (str) => {
  if (!str || typeof str !== 'string') return ''
  return str
    .toLowerCase()
    .replace(/(^\w|\.\s+\w)/g, match => match.toUpperCase())
}

/**
 * Truncate string
 * @param {string} str - String to truncate
 * @param {number} length - Maximum length
 * @param {string} suffix - Suffix to add
 * @returns {string} Truncated string
 */
export const truncate = (str, length, suffix = '...') => {
  if (!str || typeof str !== 'string') return ''
  if (str.length <= length) return str
  return str.slice(0, length - suffix.length) + suffix
}

/**
 * Truncate string at word boundary
 * @param {string} str - String to truncate
 * @param {number} length - Maximum length
 * @param {string} suffix - Suffix to add
 * @returns {string} Truncated string
 */
export const truncateWords = (str, length, suffix = '...') => {
  if (!str || typeof str !== 'string') return ''
  if (str.length <= length) return str
  
  const truncated = str.slice(0, length)
  const lastSpace = truncated.lastIndexOf(' ')
  
  if (lastSpace > 0) {
    return truncated.slice(0, lastSpace) + suffix
  }
  
  return truncated + suffix
}

 
export const pad = (str, length, padChar = ' ', direction = 'right') => {
  if (!str || typeof str !== 'string') return ''
  if (str.length >= length) return str
  
  const padding = padChar.repeat(length - str.length)
  
  switch (direction) {
    case 'left':
      return padding + str
    case 'both':
      const leftPad = Math.floor(padding.length / 2)
      const rightPad = padding.length - leftPad
      return padChar.repeat(leftPad) + str + padChar.repeat(rightPad)
    default:
      return str + padding
  }
}

 
export const center = (str, width, padChar = ' ') => {
  return pad(str, width, padChar, 'both')
}

 
export const leftAlign = (str, width, padChar = ' ') => {
  return pad(str, width, padChar, 'right')
}

 
export const rightAlign = (str, width, padChar = ' ') => {
  return pad(str, width, padChar, 'left')
}

 
export const stripHtml = (str) => {
  if (!str || typeof str !== 'string') return ''
  return str.replace(/<[^>]*>/g, '')
}
 
export const escapeHtml = (str) => {
  if (!str || typeof str !== 'string') return ''
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}
 
export const unescapeHtml = (str) => {
  if (!str || typeof str !== 'string') return ''
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
}
 
export const normalizeWhitespace = (str) => {
  if (!str || typeof str !== 'string') return ''
  return str.replace(/\s+/g, ' ').trim()
}

export const removeLineBreaks = (str) => {
  if (!str || typeof str !== 'string') return ''
  return str.replace(/[\r\n]+/g, ' ')
}

 
export const addLineBreaks = (str, maxLength = 80) => {
  if (!str || typeof str !== 'string') return ''
  
  const words = str.split(' ')
  const lines = []
  let currentLine = ''
  
  words.forEach(word => {
    if ((currentLine + word).length <= maxLength) {
      currentLine += (currentLine ? ' ' : '') + word
    } else {
      if (currentLine) lines.push(currentLine)
      currentLine = word
    }
  })
  
  if (currentLine) lines.push(currentLine)
  
  return lines.join('\n')
}

 
export const reverse = (str) => {
  if (!str || typeof str !== 'string') return ''
  return str.split('').reverse().join('')
}

 
export const reverseWords = (str) => {
  if (!str || typeof str !== 'string') return ''
  return str.split(' ').reverse().join(' ')
}
 
export const shuffle = (str) => {
  if (!str || typeof str !== 'string') return ''
  
  const chars = str.split('')
  for (let i = chars.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[chars[i], chars[j]] = [chars[j], chars[i]]
  }
  
  return chars.join('')
}

 
export const randomString = (length, charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789') => {
  let result = ''
  for (let i = 0; i < length; i++) {
    result += charset.charAt(Math.floor(Math.random() * charset.length))
  }
  return result
}
 
export const slugify = (str) => {
  if (!str || typeof str !== 'string') return ''
  return str
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}
 
export const initials = (str, maxLength = 2) => {
  if (!str || typeof str !== 'string') return ''
  
  return str
    .split(' ')
    .map(word => word.charAt(0).toUpperCase())
    .join('')
    .slice(0, maxLength)
}
 
export const wordCount = (str) => {
  if (!str || typeof str !== 'string') return 0
  return str.trim().split(/\s+/).filter(word => word.length > 0).length
}
 
export const charCount = (str, includeSpaces = true) => {
  if (!str || typeof str !== 'string') return 0
  return includeSpaces ? str.length : str.replace(/\s/g, '').length
}

/**
 * Count sentences
 * @param {string} str - String to count sentences
 * @returns {number} Number of sentences
 */
export const sentenceCount = (str) => {
  if (!str || typeof str !== 'string') return 0
  return str.split(/[.!?]+/).filter(sentence => sentence.trim().length > 0).length
}

/**
 * Count paragraphs
 * @param {string} str - String to count paragraphs
 * @returns {number} Number of paragraphs
 */
export const paragraphCount = (str) => {
  if (!str || typeof str !== 'string') return 0
  return str.split(/\n\s*\n/).filter(paragraph => paragraph.trim().length > 0).length
}

/**
 * Get reading time
 * @param {string} str - String to calculate reading time for
 * @param {number} wordsPerMinute - Average reading speed
 * @returns {number} Reading time in minutes
 */
export const readingTime = (str, wordsPerMinute = 200) => {
  if (!str || typeof str !== 'string') return 0
  const words = wordCount(str)
  return Math.ceil(words / wordsPerMinute)
}

 
export const highlight = (str, searchTerm, className = 'highlight') => {
  if (!str || typeof str !== 'string' || !searchTerm) return str
  
  const regex = new RegExp(`(${searchTerm})`, 'gi')
  return str.replace(regex, `<span class="${className}">$1</span>`)
}
 
export const mask = (str, visibleStart = 2, visibleEnd = 2, maskChar = '*') => {
  if (!str || typeof str !== 'string') return ''
  if (str.length <= visibleStart + visibleEnd) return str
  
  const start = str.slice(0, visibleStart)
  const end = str.slice(-visibleEnd)
  const middle = maskChar.repeat(str.length - visibleStart - visibleEnd)
  
  return start + middle + end
}

/**
 * Unmask string
 * @param {string} str - String to unmask
 * @param {string} maskChar - Character used for masking
 * @returns {string} Unmasked string
 */
export const unmask = (str, maskChar = '*') => {
  if (!str || typeof str !== 'string') return ''
  return str.replace(new RegExp(`\\${maskChar}`, 'g'), '')
}

/**
 * Wrap string in quotes
 * @param {string} str - String to wrap
 * @param {string} quoteChar - Quote character to use
 * @returns {string} String wrapped in quotes
 */
export const quote = (str, quoteChar = '"') => {
  if (!str || typeof str !== 'string') return ''
  return `${quoteChar}${str}${quoteChar}`
}

/**
 * Unwrap string from quotes
 * @param {string} str - String to unwrap
 * @returns {string} String without quotes
 */
export const unquote = (str) => {
  if (!str || typeof str !== 'string') return ''
  return str.replace(/^["']|["']$/g, '')
}

/**
 * String constants
 */
export const STRING_CONSTANTS = {
  CASES: {
    UPPER: 'upper',
    LOWER: 'lower',
    TITLE: 'title',
    CAMEL: 'camel',
    KEBAB: 'kebab',
    SNAKE: 'snake',
    PASCAL: 'pascal',
    CONSTANT: 'constant',
    SENTENCE: 'sentence'
  },
  ALIGNMENTS: {
    LEFT: 'left',
    RIGHT: 'right',
    CENTER: 'center',
    BOTH: 'both'
  },
  CHARSETS: {
    ALPHA: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
    NUMERIC: '0123456789',
    ALPHANUMERIC: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
    HEX: '0123456789ABCDEF',
    BASE64: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/',
    SYMBOLS: '!@#$%^&*()_+-=[]{}|;:,.<>?'
  }
}

export default {
  isString,
  isEmpty,
  isNotEmpty,
  isBlank,
  isNotBlank,
  getLength,
  capitalize,
  titleCase,
  camelCase,
  kebabCase,
  snakeCase,
  pascalCase,
  constantCase,
  sentenceCase,
  truncate,
  truncateWords,
  pad,
  center,
  leftAlign,
  rightAlign,
  stripHtml,
  escapeHtml,
  unescapeHtml,
  normalizeWhitespace,
  removeLineBreaks,
  addLineBreaks,
  reverse,
  reverseWords,
  shuffle,
  randomString,
  slugify,
  initials,
  wordCount,
  charCount,
  sentenceCount,
  paragraphCount,
  readingTime,
  highlight,
  mask,
  unmask,
  quote,
  unquote,
  STRING_CONSTANTS
}
