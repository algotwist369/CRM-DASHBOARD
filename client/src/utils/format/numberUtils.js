/**
 * Number utility functions
 */

/**
 * Format number with commas
 * @param {number} number - Number to format
 * @param {number} decimals - Number of decimal places
 * @param {string} locale - Locale (default: 'en-US')
 * @returns {string} Formatted number
 */
export const formatNumber = (number, decimals = 0, locale = 'en-US') => {
  if (number === null || number === undefined || isNaN(number)) return '0'
  
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(number)
}

/**
 * Format number with thousands separator
 * @param {number} number - Number to format
 * @param {string} separator - Thousands separator (default: ',')
 * @returns {string} Formatted number
 */
export const formatNumberWithSeparator = (number, separator = ',') => {
  if (number === null || number === undefined || isNaN(number)) return '0'
  
  return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, separator)
}

/**
 * Format number with K, M, B suffixes
 * @param {number} number - Number to format
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted number with suffix
 */
export const formatNumberWithSuffix = (number, decimals = 1) => {
  if (number === null || number === undefined || isNaN(number)) return '0'
  
  const absNumber = Math.abs(number)
  const sign = number < 0 ? '-' : ''
  
  if (absNumber >= 1e12) {
    return `${sign}${(absNumber / 1e12).toFixed(decimals)}T`
  } else if (absNumber >= 1e9) {
    return `${sign}${(absNumber / 1e9).toFixed(decimals)}B`
  } else if (absNumber >= 1e6) {
    return `${sign}${(absNumber / 1e6).toFixed(decimals)}M`
  } else if (absNumber >= 1e3) {
    return `${sign}${(absNumber / 1e3).toFixed(decimals)}K`
  } else {
    return `${sign}${absNumber.toFixed(decimals)}`
  }
}

/**
 * Format number as percentage
 * @param {number} number - Number to format
 * @param {number} decimals - Number of decimal places
 * @param {string} locale - Locale (default: 'en-US')
 * @returns {string} Formatted percentage
 */
export const formatPercentage = (number, decimals = 1, locale = 'en-US') => {
  if (number === null || number === undefined || isNaN(number)) return '0%'
  
  return new Intl.NumberFormat(locale, {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(number / 100)
}

/**
 * Format number as ratio
 * @param {number} number - Number to format
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted ratio
 */
export const formatRatio = (number, decimals = 2) => {
  if (number === null || number === undefined || isNaN(number)) return '0:0'
  
  const ratio = number.toFixed(decimals)
  return `${ratio}:1`
}

/**
 * Format number as fraction
 * @param {number} number - Number to format
 * @param {number} maxDenominator - Maximum denominator
 * @returns {string} Formatted fraction
 */
export const formatFraction = (number, maxDenominator = 100) => {
  if (number === null || number === undefined || isNaN(number)) return '0/1'
  
  const absNumber = Math.abs(number)
  const sign = number < 0 ? '-' : ''
  
  if (absNumber === 0) return '0/1'
  if (absNumber === 1) return `${sign}1/1`
  if (absNumber > 1) return `${sign}${Math.floor(absNumber)} ${formatFraction(absNumber - Math.floor(absNumber), maxDenominator)}`
  
  for (let denominator = 2; denominator <= maxDenominator; denominator++) {
    const numerator = Math.round(absNumber * denominator)
    if (Math.abs(numerator / denominator - absNumber) < 1e-10) {
      return `${sign}${numerator}/${denominator}`
    }
  }
  
  return `${sign}${absNumber.toFixed(3)}`
}

/**
 * Format number as ordinal
 * @param {number} number - Number to format
 * @returns {string} Formatted ordinal
 */
export const formatOrdinal = (number) => {
  if (number === null || number === undefined || isNaN(number)) return '0th'
  
  const absNumber = Math.abs(number)
  const sign = number < 0 ? '-' : ''
  
  if (absNumber === 0) return '0th'
  
  const lastDigit = absNumber % 10
  const lastTwoDigits = absNumber % 100
  
  let suffix = 'th'
  if (lastTwoDigits < 10 || lastTwoDigits > 20) {
    if (lastDigit === 1) suffix = 'st'
    else if (lastDigit === 2) suffix = 'nd'
    else if (lastDigit === 3) suffix = 'rd'
  }
  
  return `${sign}${absNumber}${suffix}`
}

/**
 * Format number as scientific notation
 * @param {number} number - Number to format
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted scientific notation
 */
export const formatScientific = (number, decimals = 2) => {
  if (number === null || number === undefined || isNaN(number)) return '0e+0'
  
  return number.toExponential(decimals)
}

/**
 * Format number as engineering notation
 * @param {number} number - Number to format
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted engineering notation
 */
export const formatEngineering = (number, decimals = 2) => {
  if (number === null || number === undefined || isNaN(number)) return '0e+0'
  
  const absNumber = Math.abs(number)
  const sign = number < 0 ? '-' : ''
  
  if (absNumber === 0) return '0e+0'
  
  const exponent = Math.floor(Math.log10(absNumber) / 3) * 3
  const mantissa = absNumber / Math.pow(10, exponent)
  
  return `${sign}${mantissa.toFixed(decimals)}e${exponent >= 0 ? '+' : ''}${exponent}`
}

/**
 * Format number as binary
 * @param {number} number - Number to format
 * @returns {string} Formatted binary
 */
export const formatBinary = (number) => {
  if (number === null || number === undefined || isNaN(number)) return '0'
  
  const absNumber = Math.abs(number)
  const sign = number < 0 ? '-' : ''
  
  return `${sign}${absNumber.toString(2)}`
}

/**
 * Format number as octal
 * @param {number} number - Number to format
 * @returns {string} Formatted octal
 */
export const formatOctal = (number) => {
  if (number === null || number === undefined || isNaN(number)) return '0'
  
  const absNumber = Math.abs(number)
  const sign = number < 0 ? '-' : ''
  
  return `${sign}${absNumber.toString(8)}`
}

/**
 * Format number as hexadecimal
 * @param {number} number - Number to format
 * @param {boolean} uppercase - Use uppercase letters
 * @returns {string} Formatted hexadecimal
 */
export const formatHexadecimal = (number, uppercase = false) => {
  if (number === null || number === undefined || isNaN(number)) return '0'
  
  const absNumber = Math.abs(number)
  const sign = number < 0 ? '-' : ''
  
  return `${sign}${absNumber.toString(16)}${uppercase ? '' : ''}`
}

/**
 * Format number as Roman numeral
 * @param {number} number - Number to format
 * @returns {string} Formatted Roman numeral
 */
export const formatRoman = (number) => {
  if (number === null || number === undefined || isNaN(number)) return '0'
  
  const absNumber = Math.abs(number)
  const sign = number < 0 ? '-' : ''
  
  if (absNumber === 0) return '0'
  if (absNumber > 3999) return `${sign}${absNumber}` // Roman numerals only go up to 3999
  
  const romanNumerals = [
    { value: 1000, symbol: 'M' },
    { value: 900, symbol: 'CM' },
    { value: 500, symbol: 'D' },
    { value: 400, symbol: 'CD' },
    { value: 100, symbol: 'C' },
    { value: 90, symbol: 'XC' },
    { value: 50, symbol: 'L' },
    { value: 40, symbol: 'XL' },
    { value: 10, symbol: 'X' },
    { value: 9, symbol: 'IX' },
    { value: 5, symbol: 'V' },
    { value: 4, symbol: 'IV' },
    { value: 1, symbol: 'I' }
  ]
  
  let result = ''
  let remaining = absNumber
  
  for (const numeral of romanNumerals) {
    while (remaining >= numeral.value) {
      result += numeral.symbol
      remaining -= numeral.value
    }
  }
  
  return `${sign}${result}`
}

/**
 * Format number as words
 * @param {number} number - Number to format
 * @returns {string} Formatted number as words
 */
export const formatNumberAsWords = (number) => {
  if (number === null || number === undefined || isNaN(number)) return 'zero'
  
  const absNumber = Math.abs(number)
  const sign = number < 0 ? 'negative ' : ''
  
  if (absNumber === 0) return 'zero'
  if (absNumber > 999999999) return `${sign}${absNumber}` // Too large for words
  
  const ones = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine']
  const teens = ['ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen']
  const tens = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety']
  const thousands = ['', 'thousand', 'million', 'billion']
  
  const convertHundreds = (num) => {
    let result = ''
    
    if (num >= 100) {
      result += ones[Math.floor(num / 100)] + ' hundred'
      num %= 100
      if (num > 0) result += ' '
    }
    
    if (num >= 20) {
      result += tens[Math.floor(num / 10)]
      num %= 10
      if (num > 0) result += '-' + ones[num]
    } else if (num >= 10) {
      result += teens[num - 10]
    } else if (num > 0) {
      result += ones[num]
    }
    
    return result
  }
  
  let result = ''
  let thousandIndex = 0
  
  while (absNumber > 0) {
    const chunk = absNumber % 1000
    if (chunk > 0) {
      const chunkWords = convertHundreds(chunk)
      if (thousandIndex > 0) {
        result = chunkWords + ' ' + thousands[thousandIndex] + (result ? ' ' + result : '')
      } else {
        result = chunkWords
      }
    }
    absNumber = Math.floor(absNumber / 1000)
    thousandIndex++
  }
  
  return `${sign}${result}`
}

/**
 * Format number as time duration
 * @param {number} seconds - Number of seconds
 * @param {string} format - Format type ('short', 'long', 'compact')
 * @returns {string} Formatted time duration
 */
export const formatDuration = (seconds, format = 'short') => {
  if (seconds === null || seconds === undefined || isNaN(seconds)) return '0s'
  
  const absSeconds = Math.abs(seconds)
  const sign = seconds < 0 ? '-' : ''
  
  const days = Math.floor(absSeconds / 86400)
  const hours = Math.floor((absSeconds % 86400) / 3600)
  const minutes = Math.floor((absSeconds % 3600) / 60)
  const secs = Math.floor(absSeconds % 60)
  
  const parts = []
  
  if (days > 0) {
    if (format === 'short') {
      parts.push(`${days}d`)
    } else if (format === 'long') {
      parts.push(`${days} day${days !== 1 ? 's' : ''}`)
    } else {
      parts.push(`${days}d`)
    }
  }
  
  if (hours > 0) {
    if (format === 'short') {
      parts.push(`${hours}h`)
    } else if (format === 'long') {
      parts.push(`${hours} hour${hours !== 1 ? 's' : ''}`)
    } else {
      parts.push(`${hours}h`)
    }
  }
  
  if (minutes > 0) {
    if (format === 'short') {
      parts.push(`${minutes}m`)
    } else if (format === 'long') {
      parts.push(`${minutes} minute${minutes !== 1 ? 's' : ''}`)
    } else {
      parts.push(`${minutes}m`)
    }
  }
  
  if (secs > 0 || parts.length === 0) {
    if (format === 'short') {
      parts.push(`${secs}s`)
    } else if (format === 'long') {
      parts.push(`${secs} second${secs !== 1 ? 's' : ''}`)
    } else {
      parts.push(`${secs}s`)
    }
  }
  
  return `${sign}${parts.join(' ')}`
}

/**
 * Format number as file size
 * @param {number} bytes - Number of bytes
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted file size
 */
export const formatFileSize = (bytes, decimals = 2) => {
  if (bytes === null || bytes === undefined || isNaN(bytes)) return '0 Bytes'
  
  const absBytes = Math.abs(bytes)
  const sign = bytes < 0 ? '-' : ''
  
  if (absBytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
  const i = Math.floor(Math.log(absBytes) / Math.log(k))
  
  return `${sign}${parseFloat((absBytes / Math.pow(k, i)).toFixed(decimals))} ${sizes[i]}`
}

/**
 * Format number as distance
 * @param {number} meters - Number of meters
 * @param {string} unit - Unit system ('metric', 'imperial')
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted distance
 */
export const formatDistance = (meters, unit = 'metric', decimals = 2) => {
  if (meters === null || meters === undefined || isNaN(meters)) return '0 m'
  
  const absMeters = Math.abs(meters)
  const sign = meters < 0 ? '-' : ''
  
  if (unit === 'imperial') {
    const feet = absMeters * 3.28084
    const miles = feet / 5280
    
    if (miles >= 1) {
      return `${sign}${miles.toFixed(decimals)} mi`
    } else {
      return `${sign}${feet.toFixed(decimals)} ft`
    }
  } else {
    if (absMeters >= 1000) {
      return `${sign}${(absMeters / 1000).toFixed(decimals)} km`
    } else {
      return `${sign}${absMeters.toFixed(decimals)} m`
    }
  }
}

/**
 * Format number as weight
 * @param {number} grams - Number of grams
 * @param {string} unit - Unit system ('metric', 'imperial')
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted weight
 */
export const formatWeight = (grams, unit = 'metric', decimals = 2) => {
  if (grams === null || grams === undefined || isNaN(grams)) return '0 g'
  
  const absGrams = Math.abs(grams)
  const sign = grams < 0 ? '-' : ''
  
  if (unit === 'imperial') {
    const pounds = absGrams * 0.00220462
    const ounces = pounds * 16
    
    if (pounds >= 1) {
      return `${sign}${pounds.toFixed(decimals)} lbs`
    } else {
      return `${sign}${ounces.toFixed(decimals)} oz`
    }
  } else {
    if (absGrams >= 1000) {
      return `${sign}${(absGrams / 1000).toFixed(decimals)} kg`
    } else {
      return `${sign}${absGrams.toFixed(decimals)} g`
    }
  }
}

/**
 * Format number as temperature
 * @param {number} celsius - Temperature in Celsius
 * @param {string} unit - Temperature unit ('celsius', 'fahrenheit', 'kelvin')
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted temperature
 */
export const formatTemperature = (celsius, unit = 'celsius', decimals = 1) => {
  if (celsius === null || celsius === undefined || isNaN(celsius)) return '0°C'
  
  let temperature = celsius
  let symbol = '°C'
  
  if (unit === 'fahrenheit') {
    temperature = (celsius * 9/5) + 32
    symbol = '°F'
  } else if (unit === 'kelvin') {
    temperature = celsius + 273.15
    symbol = 'K'
  }
  
  return `${temperature.toFixed(decimals)}${symbol}`
}

/**
 * Parse number from string
 * @param {string} string - String to parse
 * @returns {number} Parsed number
 */
export const parseNumber = (string) => {
  if (!string || typeof string !== 'string') return 0
  
  // Remove common formatting characters
  const cleaned = string.replace(/[^\d.-]/g, '')
  const parsed = parseFloat(cleaned)
  
  return isNaN(parsed) ? 0 : parsed
}

/**
 * Check if number is integer
 * @param {number} number - Number to check
 * @returns {boolean} True if number is integer
 */
export const isInteger = (number) => {
  return Number.isInteger(number)
}

/**
 * Check if number is even
 * @param {number} number - Number to check
 * @returns {boolean} True if number is even
 */
export const isEven = (number) => {
  return isInteger(number) && number % 2 === 0
}

/**
 * Check if number is odd
 * @param {number} number - Number to check
 * @returns {boolean} True if number is odd
 */
export const isOdd = (number) => {
  return isInteger(number) && number % 2 !== 0
}

/**
 * Check if number is prime
 * @param {number} number - Number to check
 * @returns {boolean} True if number is prime
 */
export const isPrime = (number) => {
  if (!isInteger(number) || number < 2) return false
  if (number === 2) return true
  if (number % 2 === 0) return false
  
  for (let i = 3; i <= Math.sqrt(number); i += 2) {
    if (number % i === 0) return false
  }
  
  return true
}

/**
 * Get number constants
 */
export const NUMBER_CONSTANTS = {
  FORMATS: {
    STANDARD: 'standard',
    SCIENTIFIC: 'scientific',
    ENGINEERING: 'engineering',
    BINARY: 'binary',
    OCTAL: 'octal',
    HEXADECIMAL: 'hexadecimal',
    ROMAN: 'roman',
    WORDS: 'words'
  },
  UNITS: {
    METRIC: 'metric',
    IMPERIAL: 'imperial'
  },
  TEMPERATURE: {
    CELSIUS: 'celsius',
    FAHRENHEIT: 'fahrenheit',
    KELVIN: 'kelvin'
  },
  PRECISION: {
    ZERO: 0,
    ONE: 1,
    TWO: 2,
    THREE: 3
  }
}

export default {
  formatNumber,
  formatNumberWithSeparator,
  formatNumberWithSuffix,
  formatPercentage,
  formatRatio,
  formatFraction,
  formatOrdinal,
  formatScientific,
  formatEngineering,
  formatBinary,
  formatOctal,
  formatHexadecimal,
  formatRoman,
  formatNumberAsWords,
  formatDuration,
  formatFileSize,
  formatDistance,
  formatWeight,
  formatTemperature,
  parseNumber,
  isInteger,
  isEven,
  isOdd,
  isPrime,
  NUMBER_CONSTANTS
}
