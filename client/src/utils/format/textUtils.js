/**
 * Text utility functions
 */

/**
 * Capitalize first letter of string
 * @param {string} text - Text to capitalize
 * @returns {string} Capitalized text
 */
export const capitalize = (text) => {
  if (!text || typeof text !== 'string') return ''
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase()
}

/**
 * Capitalize first letter of each word
 * @param {string} text - Text to capitalize
 * @returns {string} Title case text
 */
export const titleCase = (text) => {
  if (!text || typeof text !== 'string') return ''
  return text
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

/**
 * Convert to camel case
 * @param {string} text - Text to convert
 * @returns {string} Camel case text
 */
export const camelCase = (text) => {
  if (!text || typeof text !== 'string') return ''
  return text
    .toLowerCase()
    .replace(/[^a-zA-Z0-9]+(.)/g, (match, chr) => chr.toUpperCase())
}

/**
 * Convert to kebab case
 * @param {string} text - Text to convert
 * @returns {string} Kebab case text
 */
export const kebabCase = (text) => {
  if (!text || typeof text !== 'string') return ''
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/**
 * Convert to snake case
 * @param {string} text - Text to convert
 * @returns {string} Snake case text
 */
export const snakeCase = (text) => {
  if (!text || typeof text !== 'string') return ''
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .replace(/[\s-]+/g, '_')
    .replace(/^_+|_+$/g, '')
}

/**
 * Convert to pascal case
 * @param {string} text - Text to convert
 * @returns {string} Pascal case text
 */
export const pascalCase = (text) => {
  if (!text || typeof text !== 'string') return ''
  const camel = camelCase(text)
  return camel.charAt(0).toUpperCase() + camel.slice(1)
}

/**
 * Convert to constant case
 * @param {string} text - Text to convert
 * @returns {string} Constant case text
 */
export const constantCase = (text) => {
  if (!text || typeof text !== 'string') return ''
  return text
    .toUpperCase()
    .replace(/[^\w\s]/g, '')
    .replace(/[\s-]+/g, '_')
    .replace(/^_+|_+$/g, '')
}

/**
 * Convert to sentence case
 * @param {string} text - Text to convert
 * @returns {string} Sentence case text
 */
export const sentenceCase = (text) => {
  if (!text || typeof text !== 'string') return ''
  return text
    .toLowerCase()
    .replace(/(^\w|\.\s+\w)/g, match => match.toUpperCase())
}

/**
 * Convert to dot case
 * @param {string} text - Text to convert
 * @returns {string} Dot case text
 */
export const dotCase = (text) => {
  if (!text || typeof text !== 'string') return ''
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .replace(/[\s_-]+/g, '.')
    .replace(/^\.+|\.+$/g, '')
}

/**
 * Convert to path case
 * @param {string} text - Text to convert
 * @returns {string} Path case text
 */
export const pathCase = (text) => {
  if (!text || typeof text !== 'string') return ''
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .replace(/[\s_-]+/g, '/')
    .replace(/^\/+|\/+$/g, '')
}

/**
 * Truncate text to specified length
 * @param {string} text - Text to truncate
 * @param {number} length - Maximum length
 * @param {string} suffix - Suffix to add (default: '...')
 * @returns {string} Truncated text
 */
export const truncate = (text, length, suffix = '...') => {
  if (!text || typeof text !== 'string') return ''
  if (text.length <= length) return text
  return text.slice(0, length - suffix.length) + suffix
}

/**
 * Truncate text to specified length at word boundary
 * @param {string} text - Text to truncate
 * @param {number} length - Maximum length
 * @param {string} suffix - Suffix to add (default: '...')
 * @returns {string} Truncated text
 */
export const truncateWords = (text, length, suffix = '...') => {
  if (!text || typeof text !== 'string') return ''
  if (text.length <= length) return text
  
  const truncated = text.slice(0, length)
  const lastSpace = truncated.lastIndexOf(' ')
  
  if (lastSpace > 0) {
    return truncated.slice(0, lastSpace) + suffix
  }
  
  return truncated + suffix
}

/**
 * Remove HTML tags from text
 * @param {string} text - Text with HTML tags
 * @returns {string} Text without HTML tags
 */
export const stripHtml = (text) => {
  if (!text || typeof text !== 'string') return ''
  return text.replace(/<[^>]*>/g, '')
}

/**
 * Remove extra whitespace from text
 * @param {string} text - Text with extra whitespace
 * @returns {string} Text with normalized whitespace
 */
export const normalizeWhitespace = (text) => {
  if (!text || typeof text !== 'string') return ''
  return text.replace(/\s+/g, ' ').trim()
}

/**
 * Remove line breaks from text
 * @param {string} text - Text with line breaks
 * @returns {string} Text without line breaks
 */
export const removeLineBreaks = (text) => {
  if (!text || typeof text !== 'string') return ''
  return text.replace(/[\r\n]+/g, ' ')
}

/**
 * Add line breaks to text
 * @param {string} text - Text to add line breaks to
 * @param {number} maxLength - Maximum length per line
 * @returns {string} Text with line breaks
 */
export const addLineBreaks = (text, maxLength = 80) => {
  if (!text || typeof text !== 'string') return ''
  
  const words = text.split(' ')
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
 * Reverse text
 * @param {string} text - Text to reverse
 * @returns {string} Reversed text
 */
export const reverse = (text) => {
  if (!text || typeof text !== 'string') return ''
  return text.split('').reverse().join('')
}

/**
 * Reverse words in text
 * @param {string} text - Text to reverse words
 * @returns {string} Text with reversed words
 */
export const reverseWords = (text) => {
  if (!text || typeof text !== 'string') return ''
  return text.split(' ').reverse().join(' ')
}

/**
 * Shuffle text characters
 * @param {string} text - Text to shuffle
 * @returns {string} Shuffled text
 */
export const shuffle = (text) => {
  if (!text || typeof text !== 'string') return ''
  
  const chars = text.split('')
  for (let i = chars.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[chars[i], chars[j]] = [chars[j], chars[i]]
  }
  
  return chars.join('')
}

/**
 * Generate random text
 * @param {number} length - Length of random text
 * @param {string} charset - Character set to use
 * @returns {string} Random text
 */
export const randomText = (length, charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789') => {
  let result = ''
  for (let i = 0; i < length; i++) {
    result += charset.charAt(Math.floor(Math.random() * charset.length))
  }
  return result
}

/**
 * Generate slug from text
 * @param {string} text - Text to convert to slug
 * @returns {string} Slug
 */
export const slugify = (text) => {
  if (!text || typeof text !== 'string') return ''
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/**
 * Generate initials from text
 * @param {string} text - Text to generate initials from
 * @param {number} maxLength - Maximum length of initials
 * @returns {string} Initials
 */
export const initials = (text, maxLength = 2) => {
  if (!text || typeof text !== 'string') return ''
  
  return text
    .split(' ')
    .map(word => word.charAt(0).toUpperCase())
    .join('')
    .slice(0, maxLength)
}

/**
 * Count words in text
 * @param {string} text - Text to count words
 * @returns {number} Number of words
 */
export const wordCount = (text) => {
  if (!text || typeof text !== 'string') return 0
  return text.trim().split(/\s+/).filter(word => word.length > 0).length
}

/**
 * Count characters in text
 * @param {string} text - Text to count characters
 * @param {boolean} includeSpaces - Include spaces in count
 * @returns {number} Number of characters
 */
export const charCount = (text, includeSpaces = true) => {
  if (!text || typeof text !== 'string') return 0
  return includeSpaces ? text.length : text.replace(/\s/g, '').length
}

/**
 * Count sentences in text
 * @param {string} text - Text to count sentences
 * @returns {number} Number of sentences
 */
export const sentenceCount = (text) => {
  if (!text || typeof text !== 'string') return 0
  return text.split(/[.!?]+/).filter(sentence => sentence.trim().length > 0).length
}

/**
 * Count paragraphs in text
 * @param {string} text - Text to count paragraphs
 * @returns {number} Number of paragraphs
 */
export const paragraphCount = (text) => {
  if (!text || typeof text !== 'string') return 0
  return text.split(/\n\s*\n/).filter(paragraph => paragraph.trim().length > 0).length
}

/**
 * Get reading time for text
 * @param {string} text - Text to calculate reading time for
 * @param {number} wordsPerMinute - Average reading speed
 * @returns {number} Reading time in minutes
 */
export const readingTime = (text, wordsPerMinute = 200) => {
  if (!text || typeof text !== 'string') return 0
  const words = wordCount(text)
  return Math.ceil(words / wordsPerMinute)
}

/**
 * Highlight text with search term
 * @param {string} text - Text to highlight
 * @param {string} searchTerm - Term to highlight
 * @param {string} className - CSS class for highlighting
 * @returns {string} Text with highlighted terms
 */
export const highlight = (text, searchTerm, className = 'highlight') => {
  if (!text || typeof text !== 'string' || !searchTerm) return text
  
  const regex = new RegExp(`(${searchTerm})`, 'gi')
  return text.replace(regex, `<span class="${className}">$1</span>`)
}

/**
 * Mask text (hide characters)
 * @param {string} text - Text to mask
 * @param {number} visibleStart - Number of characters to show at start
 * @param {number} visibleEnd - Number of characters to show at end
 * @param {string} maskChar - Character to use for masking
 * @returns {string} Masked text
 */
export const mask = (text, visibleStart = 2, visibleEnd = 2, maskChar = '*') => {
  if (!text || typeof text !== 'string') return ''
  if (text.length <= visibleStart + visibleEnd) return text
  
  const start = text.slice(0, visibleStart)
  const end = text.slice(-visibleEnd)
  const middle = maskChar.repeat(text.length - visibleStart - visibleEnd)
  
  return start + middle + end
}

/**
 * Unmask text (remove masking)
 * @param {string} text - Text to unmask
 * @param {string} maskChar - Character used for masking
 * @returns {string} Unmasked text
 */
export const unmask = (text, maskChar = '*') => {
  if (!text || typeof text !== 'string') return ''
  return text.replace(new RegExp(`\\${maskChar}`, 'g'), '')
}

/**
 * Wrap text in quotes
 * @param {string} text - Text to wrap
 * @param {string} quoteChar - Quote character to use
 * @returns {string} Text wrapped in quotes
 */
export const quote = (text, quoteChar = '"') => {
  if (!text || typeof text !== 'string') return ''
  return `${quoteChar}${text}${quoteChar}`
}

/**
 * Unwrap text from quotes
 * @param {string} text - Text to unwrap
 * @returns {string} Text without quotes
 */
export const unquote = (text) => {
  if (!text || typeof text !== 'string') return ''
  return text.replace(/^["']|["']$/g, '')
}

/**
 * Pad text to specified length
 * @param {string} text - Text to pad
 * @param {number} length - Target length
 * @param {string} padChar - Character to use for padding
 * @param {string} direction - Direction to pad ('left', 'right', 'both')
 * @returns {string} Padded text
 */
export const pad = (text, length, padChar = ' ', direction = 'right') => {
  if (!text || typeof text !== 'string') return ''
  if (text.length >= length) return text
  
  const padding = padChar.repeat(length - text.length)
  
  switch (direction) {
    case 'left':
      return padding + text
    case 'both':
      const leftPad = Math.floor(padding.length / 2)
      const rightPad = padding.length - leftPad
      return padChar.repeat(leftPad) + text + padChar.repeat(rightPad)
    default:
      return text + padding
  }
}

/**
 * Center text
 * @param {string} text - Text to center
 * @param {number} width - Width to center in
 * @param {string} padChar - Character to use for padding
 * @returns {string} Centered text
 */
export const center = (text, width, padChar = ' ') => {
  return pad(text, width, padChar, 'both')
}

/**
 * Left align text
 * @param {string} text - Text to align
 * @param {number} width - Width to align in
 * @param {string} padChar - Character to use for padding
 * @returns {string} Left aligned text
 */
export const leftAlign = (text, width, padChar = ' ') => {
  return pad(text, width, padChar, 'right')
}

/**
 * Right align text
 * @param {string} text - Text to align
 * @param {number} width - Width to align in
 * @param {string} padChar - Character to use for padding
 * @returns {string} Right aligned text
 */
export const rightAlign = (text, width, padChar = ' ') => {
  return pad(text, width, padChar, 'left')
}

/**
 * Justify text
 * @param {string} text - Text to justify
 * @param {number} width - Width to justify in
 * @returns {string} Justified text
 */
export const justify = (text, width) => {
  if (!text || typeof text !== 'string') return ''
  if (text.length >= width) return text
  
  const words = text.split(' ')
  if (words.length <= 1) return text
  
  const totalSpaces = width - text.length + (words.length - 1)
  const spacesPerGap = Math.floor(totalSpaces / (words.length - 1))
  const extraSpaces = totalSpaces % (words.length - 1)
  
  let result = words[0]
  for (let i = 1; i < words.length; i++) {
    const spaces = spacesPerGap + (i <= extraSpaces ? 1 : 0)
    result += ' '.repeat(spaces) + words[i]
  }
  
  return result
}

/**
 * Get text constants
 */
export const TEXT_CONSTANTS = {
  CASES: {
    UPPER: 'upper',
    LOWER: 'lower',
    TITLE: 'title',
    CAMEL: 'camel',
    KEBAB: 'kebab',
    SNAKE: 'snake',
    PASCAL: 'pascal',
    CONSTANT: 'constant',
    SENTENCE: 'sentence',
    DOT: 'dot',
    PATH: 'path'
  },
  ALIGNMENTS: {
    LEFT: 'left',
    RIGHT: 'right',
    CENTER: 'center',
    JUSTIFY: 'justify'
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
  capitalize,
  titleCase,
  camelCase,
  kebabCase,
  snakeCase,
  pascalCase,
  constantCase,
  sentenceCase,
  dotCase,
  pathCase,
  truncate,
  truncateWords,
  stripHtml,
  normalizeWhitespace,
  removeLineBreaks,
  addLineBreaks,
  reverse,
  reverseWords,
  shuffle,
  randomText,
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
  pad,
  center,
  leftAlign,
  rightAlign,
  justify,
  TEXT_CONSTANTS
}
