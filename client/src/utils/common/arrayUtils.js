/**
 * Array utility functions
 */

/**
 * Check if value is an array
 * @param {any} value - Value to check
 * @returns {boolean} Is array
 */
export const isArray = (value) => {
  return Array.isArray(value)
}

/**
 * Check if array is empty
 * @param {array} arr - Array to check
 * @returns {boolean} Is empty
 */
export const isEmpty = (arr) => {
  return !arr || !Array.isArray(arr) || arr.length === 0
}

/**
 * Check if array has items
 * @param {array} arr - Array to check
 * @returns {boolean} Has items
 */
export const hasItems = (arr) => {
  return arr && Array.isArray(arr) && arr.length > 0
}

/**
 * Get array length safely
 * @param {array} arr - Array to get length from
 * @returns {number} Array length
 */
export const getLength = (arr) => {
  return arr && Array.isArray(arr) ? arr.length : 0
}

/**
 * Get first item from array
 * @param {array} arr - Array to get first item from
 * @returns {any} First item
 */
export const getFirst = (arr) => {
  return arr && Array.isArray(arr) && arr.length > 0 ? arr[0] : undefined
}

/**
 * Get last item from array
 * @param {array} arr - Array to get last item from
 * @returns {any} Last item
 */
export const getLast = (arr) => {
  return arr && Array.isArray(arr) && arr.length > 0 ? arr[arr.length - 1] : undefined
}

/**
 * Get item at index safely
 * @param {array} arr - Array to get item from
 * @param {number} index - Index to get item at
 * @returns {any} Item at index
 */
export const getAt = (arr, index) => {
  if (!arr || !Array.isArray(arr) || index < 0 || index >= arr.length) {
    return undefined
  }
  return arr[index]
}

/**
 * Remove item from array
 * @param {array} arr - Array to remove item from
 * @param {any} item - Item to remove
 * @returns {array} New array without item
 */
export const removeItem = (arr, item) => {
  if (!arr || !Array.isArray(arr)) return []
  return arr.filter(i => i !== item)
}

/**
 * Remove item at index
 * @param {array} arr - Array to remove item from
 * @param {number} index - Index to remove item at
 * @returns {array} New array without item
 */
export const removeAt = (arr, index) => {
  if (!arr || !Array.isArray(arr) || index < 0 || index >= arr.length) {
    return arr || []
  }
  return arr.filter((_, i) => i !== index)
}

/**
 * Add item to array if not exists
 * @param {array} arr - Array to add item to
 * @param {any} item - Item to add
 * @returns {array} New array with item
 */
export const addUnique = (arr, item) => {
  if (!arr || !Array.isArray(arr)) return [item]
  if (arr.includes(item)) return arr
  return [...arr, item]
}

/**
 * Remove duplicates from array
 * @param {array} arr - Array to remove duplicates from
 * @returns {array} Array without duplicates
 */
export const removeDuplicates = (arr) => {
  if (!arr || !Array.isArray(arr)) return []
  return [...new Set(arr)]
}

/**
 * Remove duplicates by property
 * @param {array} arr - Array to remove duplicates from
 * @param {string} property - Property to check for duplicates
 * @returns {array} Array without duplicates
 */
export const removeDuplicatesBy = (arr, property) => {
  if (!arr || !Array.isArray(arr)) return []
  
  const seen = new Set()
  return arr.filter(item => {
    const value = item[property]
    if (seen.has(value)) {
      return false
    }
    seen.add(value)
    return true
  })
}

/**
 * Group array by property
 * @param {array} arr - Array to group
 * @param {string} property - Property to group by
 * @returns {object} Grouped object
 */
export const groupBy = (arr, property) => {
  if (!arr || !Array.isArray(arr)) return {}
  
  return arr.reduce((groups, item) => {
    const key = item[property]
    if (!groups[key]) {
      groups[key] = []
    }
    groups[key].push(item)
    return groups
  }, {})
}

/**
 * Group array by function
 * @param {array} arr - Array to group
 * @param {function} fn - Function to group by
 * @returns {object} Grouped object
 */
export const groupByFunction = (arr, fn) => {
  if (!arr || !Array.isArray(arr) || typeof fn !== 'function') return {}
  
  return arr.reduce((groups, item) => {
    const key = fn(item)
    if (!groups[key]) {
      groups[key] = []
    }
    groups[key].push(item)
    return groups
  }, {})
}

/**
 * Sort array by property
 * @param {array} arr - Array to sort
 * @param {string} property - Property to sort by
 * @param {string} direction - Sort direction
 * @returns {array} Sorted array
 */
export const sortBy = (arr, property, direction = 'asc') => {
  if (!arr || !Array.isArray(arr)) return []
  
  return [...arr].sort((a, b) => {
    const aValue = a[property]
    const bValue = b[property]
    
    if (aValue < bValue) return direction === 'asc' ? -1 : 1
    if (aValue > bValue) return direction === 'asc' ? 1 : -1
    return 0
  })
}

/**
 * Sort array by function
 * @param {array} arr - Array to sort
 * @param {function} fn - Function to sort by
 * @param {string} direction - Sort direction
 * @returns {array} Sorted array
 */
export const sortByFunction = (arr, fn, direction = 'asc') => {
  if (!arr || !Array.isArray(arr) || typeof fn !== 'function') return []
  
  return [...arr].sort((a, b) => {
    const aValue = fn(a)
    const bValue = fn(b)
    
    if (aValue < bValue) return direction === 'asc' ? -1 : 1
    if (aValue > bValue) return direction === 'asc' ? 1 : -1
    return 0
  })
}

/**
 * Filter array by property
 * @param {array} arr - Array to filter
 * @param {string} property - Property to filter by
 * @param {any} value - Value to filter by
 * @returns {array} Filtered array
 */
export const filterBy = (arr, property, value) => {
  if (!arr || !Array.isArray(arr)) return []
  return arr.filter(item => item[property] === value)
}

/**
 * Filter array by function
 * @param {array} arr - Array to filter
 * @param {function} fn - Function to filter by
 * @returns {array} Filtered array
 */
export const filterByFunction = (arr, fn) => {
  if (!arr || !Array.isArray(arr) || typeof fn !== 'function') return []
  return arr.filter(fn)
}

/**
 * Find item by property
 * @param {array} arr - Array to search
 * @param {string} property - Property to search by
 * @param {any} value - Value to search for
 * @returns {any} Found item
 */
export const findBy = (arr, property, value) => {
  if (!arr || !Array.isArray(arr)) return undefined
  return arr.find(item => item[property] === value)
}

/**
 * Find item by function
 * @param {array} arr - Array to search
 * @param {function} fn - Function to search by
 * @returns {any} Found item
 */
export const findByFunction = (arr, fn) => {
  if (!arr || !Array.isArray(arr) || typeof fn !== 'function') return undefined
  return arr.find(fn)
}

/**
 * Find index by property
 * @param {array} arr - Array to search
 * @param {string} property - Property to search by
 * @param {any} value - Value to search for
 * @returns {number} Found index
 */
export const findIndexBy = (arr, property, value) => {
  if (!arr || !Array.isArray(arr)) return -1
  return arr.findIndex(item => item[property] === value)
}

/**
 * Find index by function
 * @param {array} arr - Array to search
 * @param {function} fn - Function to search by
 * @returns {number} Found index
 */
export const findIndexByFunction = (arr, fn) => {
  if (!arr || !Array.isArray(arr) || typeof fn !== 'function') return -1
  return arr.findIndex(fn)
}

/**
 * Map array by property
 * @param {array} arr - Array to map
 * @param {string} property - Property to map
 * @returns {array} Mapped array
 */
export const mapBy = (arr, property) => {
  if (!arr || !Array.isArray(arr)) return []
  return arr.map(item => item[property])
}

/**
 * Map array by function
 * @param {array} arr - Array to map
 * @param {function} fn - Function to map
 * @returns {array} Mapped array
 */
export const mapByFunction = (arr, fn) => {
  if (!arr || !Array.isArray(arr) || typeof fn !== 'function') return []
  return arr.map(fn)
}

/**
 * Reduce array by function
 * @param {array} arr - Array to reduce
 * @param {function} fn - Function to reduce
 * @param {any} initial - Initial value
 * @returns {any} Reduced value
 */
export const reduceByFunction = (arr, fn, initial) => {
  if (!arr || !Array.isArray(arr) || typeof fn !== 'function') return initial
  return arr.reduce(fn, initial)
}

/**
 * Sum array by property
 * @param {array} arr - Array to sum
 * @param {string} property - Property to sum
 * @returns {number} Sum
 */
export const sumBy = (arr, property) => {
  if (!arr || !Array.isArray(arr)) return 0
  return arr.reduce((sum, item) => sum + (item[property] || 0), 0)
}

/**
 * Average array by property
 * @param {array} arr - Array to average
 * @param {string} property - Property to average
 * @returns {number} Average
 */
export const averageBy = (arr, property) => {
  if (!arr || !Array.isArray(arr) || arr.length === 0) return 0
  const sum = sumBy(arr, property)
  return sum / arr.length
}

/**
 * Min array by property
 * @param {array} arr - Array to find min
 * @param {string} property - Property to find min
 * @returns {number} Min value
 */
export const minBy = (arr, property) => {
  if (!arr || !Array.isArray(arr) || arr.length === 0) return 0
  return Math.min(...arr.map(item => item[property] || 0))
}

/**
 * Max array by property
 * @param {array} arr - Array to find max
 * @param {string} property - Property to find max
 * @returns {number} Max value
 */
export const maxBy = (arr, property) => {
  if (!arr || !Array.isArray(arr) || arr.length === 0) return 0
  return Math.max(...arr.map(item => item[property] || 0))
}

/**
 * Count array by property
 * @param {array} arr - Array to count
 * @param {string} property - Property to count
 * @param {any} value - Value to count
 * @returns {number} Count
 */
export const countBy = (arr, property, value) => {
  if (!arr || !Array.isArray(arr)) return 0
  return arr.filter(item => item[property] === value).length
}

/**
 * Count array by function
 * @param {array} arr - Array to count
 * @param {function} fn - Function to count by
 * @returns {number} Count
 */
export const countByFunction = (arr, fn) => {
  if (!arr || !Array.isArray(arr) || typeof fn !== 'function') return 0
  return arr.filter(fn).length
}

/**
 * Chunk array into smaller arrays
 * @param {array} arr - Array to chunk
 * @param {number} size - Chunk size
 * @returns {array} Chunked arrays
 */
export const chunk = (arr, size) => {
  if (!arr || !Array.isArray(arr) || size <= 0) return []
  
  const chunks = []
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size))
  }
  return chunks
}

/**
 * Flatten nested arrays
 * @param {array} arr - Array to flatten
 * @param {number} depth - Flatten depth
 * @returns {array} Flattened array
 */
export const flatten = (arr, depth = 1) => {
  if (!arr || !Array.isArray(arr)) return []
  return arr.flat(depth)
}

/**
 * Deep flatten nested arrays
 * @param {array} arr - Array to flatten
 * @returns {array} Deep flattened array
 */
export const deepFlatten = (arr) => {
  if (!arr || !Array.isArray(arr)) return []
  return arr.flat(Infinity)
}

/**
 * Intersection of two arrays
 * @param {array} arr1 - First array
 * @param {array} arr2 - Second array
 * @returns {array} Intersection
 */
export const intersection = (arr1, arr2) => {
  if (!arr1 || !arr2 || !Array.isArray(arr1) || !Array.isArray(arr2)) return []
  return arr1.filter(item => arr2.includes(item))
}

/**
 * Union of two arrays
 * @param {array} arr1 - First array
 * @param {array} arr2 - Second array
 * @returns {array} Union
 */
export const union = (arr1, arr2) => {
  if (!arr1 || !arr2 || !Array.isArray(arr1) || !Array.isArray(arr2)) return []
  return [...new Set([...arr1, ...arr2])]
}

/**
 * Difference of two arrays
 * @param {array} arr1 - First array
 * @param {array} arr2 - Second array
 * @returns {array} Difference
 */
export const difference = (arr1, arr2) => {
  if (!arr1 || !arr2 || !Array.isArray(arr1) || !Array.isArray(arr2)) return []
  return arr1.filter(item => !arr2.includes(item))
}

/**
 * Shuffle array
 * @param {array} arr - Array to shuffle
 * @returns {array} Shuffled array
 */
export const shuffle = (arr) => {
  if (!arr || !Array.isArray(arr)) return []
  
  const shuffled = [...arr]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

/**
 * Sample random items from array
 * @param {array} arr - Array to sample from
 * @param {number} count - Number of items to sample
 * @returns {array} Sampled items
 */
export const sample = (arr, count = 1) => {
  if (!arr || !Array.isArray(arr) || count <= 0) return []
  
  const shuffled = shuffle(arr)
  return shuffled.slice(0, Math.min(count, arr.length))
}

/**
 * Array constants
 */
export const ARRAY_CONSTANTS = {
  SORT_DIRECTIONS: {
    ASC: 'asc',
    DESC: 'desc'
  },
  COMPARISON_OPERATORS: {
    EQUALS: '===',
    NOT_EQUALS: '!==',
    GREATER_THAN: '>',
    LESS_THAN: '<',
    GREATER_THAN_OR_EQUAL: '>=',
    LESS_THAN_OR_EQUAL: '<='
  }
}

export default {
  isArray,
  isEmpty,
  hasItems,
  getLength,
  getFirst,
  getLast,
  getAt,
  removeItem,
  removeAt,
  addUnique,
  removeDuplicates,
  removeDuplicatesBy,
  groupBy,
  groupByFunction,
  sortBy,
  sortByFunction,
  filterBy,
  filterByFunction,
  findBy,
  findByFunction,
  findIndexBy,
  findIndexByFunction,
  mapBy,
  mapByFunction,
  reduceByFunction,
  sumBy,
  averageBy,
  minBy,
  maxBy,
  countBy,
  countByFunction,
  chunk,
  flatten,
  deepFlatten,
  intersection,
  union,
  difference,
  shuffle,
  sample,
  ARRAY_CONSTANTS
}
