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

/**
 * Pad string
 * @param {string} str - String to pad
 * @param {number} length - Target length
 * @param {string} padChar - Character to use for padding
 * @param {string} direction - Direction to pad
 * @returns {string} Padded string
 */
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

/**
 * Center string
 * @param {string} str - String to center
 * @param {number} width - Width to center in
 * @param {string} padChar - Character to use for padding
 * @returns {string} Centered string
 */
export const center = (str, width, padChar = ' ') => {
  return pad(str, width, padChar, 'both')
}

/**
 * Left align string
 * @param {string} str - String to align
 * @param {number} width - Width to align in
 * @param {string} padChar - Character to use for padding
 * @returns {string} Left aligned string
 */
export const leftAlign = (str, width, padChar = ' ') => {
  return pad(str, width, padChar, 'right')
}

/**
 * Right align string
 * @param {string} str - String to align
 * @param {number} width - Width to align in
 * @param {string} padChar - Character to use for padding
 * @returns {string} Right aligned string
 */
export const rightAlign = (str, width, padChar = ' ') => {
  return pad(str, width, padChar, 'left')
}

/**
 * Remove HTML tags
 * @param {string} str - String with HTML tags
 * @returns {string} String without HTML tags
 */
export const stripHtml = (str) => {
  if (!str || typeof str !== 'string') return ''
  return str.replace(/<[^>]*>/g, '')
}

/**
 * Escape HTML
 * @param {string} str - String to escape
 * @returns {string} Escaped string
 */
export const escapeHtml = (str) => {
  if (!str || typeof str !== 'string') return ''
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

/**
 * Unescape HTML
 * @param {string} str - String to unescape
 * @returns {string} Unescaped string
 */
export const unescapeHtml = (str) => {
  if (!str || typeof str !== 'string') return ''
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
}

/**
 * Normalize whitespace
 * @param {string} str - String to normalize
 * @returns {string} Normalized string
 */
export const normalizeWhitespace = (str) => {
  if (!str || typeof str !== 'string') return ''
  return str.replace(/\s+/g, ' ').trim()
}

/**
 * Remove line breaks
 * @param {string} str - String to remove line breaks from
 * @returns {string} String without line breaks
 */
export const removeLineBreaks = (str) => {
  if (!str || typeof str !== 'string') return ''
  return str.replace(/[\r\n]+/g, ' ')
}

/**
 * Add line breaks
 * @param {string} str - String to add line breaks to
 * @param {number} maxLength - Maximum length per line
 * @returns {string} String with line breaks
 */
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

/**
 * Reverse string
 * @param {string} str - String to reverse
 * @returns {string} Reversed string
 */
export const reverse = (str) => {
  if (!str || typeof str !== 'string') return ''
  return str.split('').reverse().join('')
}

/**
 * Reverse words
 * @param {string} str - String to reverse words
 * @returns {string} String with reversed words
 */
export const reverseWords = (str) => {
  if (!str || typeof str !== 'string') return ''
  return str.split(' ').reverse().join(' ')
}

/**
 * Shuffle string
 * @param {string} str - String to shuffle
 * @returns {string} Shuffled string
 */
export const shuffle = (str) => {
  if (!str || typeof str !== 'string') return ''
  
  const chars = str.split('')
  for (let i = chars.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[chars[i], chars[j]] = [chars[j], chars[i]]
  }
  
  return chars.join('')
}

/**
 * Generate random string
 * @param {number} length - Length of random string
 * @param {string} charset - Character set to use
 * @returns {string} Random string
 */
export const randomString = (length, charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789') => {
  let result = ''
  for (let i = 0; i < length; i++) {
    result += charset.charAt(Math.floor(Math.random() * charset.length))
  }
  return result
}

/**
 * Generate slug
 * @param {string} str - String to convert to slug
 * @returns {string} Slug
 */
export const slugify = (str) => {
  if (!str || typeof str !== 'string') return ''
  return str
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/**
 * Generate initials
 * @param {string} str - String to generate initials from
 * @param {number} maxLength - Maximum length of initials
 * @returns {string} Initials
 */
export const initials = (str, maxLength = 2) => {
  if (!str || typeof str !== 'string') return ''
  
  return str
    .split(' ')
    .map(word => word.charAt(0).toUpperCase())
    .join('')
    .slice(0, maxLength)
}

/**
 * Count words
 * @param {string} str - String to count words
 * @returns {number} Number of words
 */
export const wordCount = (str) => {
  if (!str || typeof str !== 'string') return 0
  return str.trim().split(/\s+/).filter(word => word.length > 0).length
}

/**
 * Count characters
 * @param {string} str - String to count characters
 * @param {boolean} includeSpaces - Include spaces in count
 * @returns {number} Number of characters
 */
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

/**
 * Highlight text
 * @param {string} str - String to highlight
 * @param {string} searchTerm - Term to highlight
 * @param {string} className - CSS class for highlighting
 * @returns {string} String with highlighted terms
 */
export const highlight = (str, searchTerm, className = 'highlight') => {
  if (!str || typeof str !== 'string' || !searchTerm) return str
  
  const regex = new RegExp(`(${searchTerm})`, 'gi')
  return str.replace(regex, `<span class="${className}">$1</span>`)
}

/**
 * Mask string
 * @param {string} str - String to mask
 * @param {number} visibleStart - Number of characters to show at start
 * @param {number} visibleEnd - Number of characters to show at end
 * @param {string} maskChar - Character to use for masking
 * @returns {string} Masked string
 */
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
