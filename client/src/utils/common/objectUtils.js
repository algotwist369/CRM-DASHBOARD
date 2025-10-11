/**
 * Object utility functions
 */

/**
 * Check if value is an object
 * @param {any} value - Value to check
 * @returns {boolean} Is object
 */
export const isObject = (value) => {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

/**
 * Check if object is empty
 * @param {object} obj - Object to check
 * @returns {boolean} Is empty
 */
export const isEmpty = (obj) => {
  return !obj || !isObject(obj) || Object.keys(obj).length === 0
}

/**
 * Check if object has properties
 * @param {object} obj - Object to check
 * @returns {boolean} Has properties
 */
export const hasProperties = (obj) => {
  return obj && isObject(obj) && Object.keys(obj).length > 0
}

/**
 * Get object keys safely
 * @param {object} obj - Object to get keys from
 * @returns {array} Object keys
 */
export const getKeys = (obj) => {
  return obj && isObject(obj) ? Object.keys(obj) : []
}

/**
 * Get object values safely
 * @param {object} obj - Object to get values from
 * @returns {array} Object values
 */
export const getValues = (obj) => {
  return obj && isObject(obj) ? Object.values(obj) : []
}

/**
 * Get object entries safely
 * @param {object} obj - Object to get entries from
 * @returns {array} Object entries
 */
export const getEntries = (obj) => {
  return obj && isObject(obj) ? Object.entries(obj) : []
}

/**
 * Get object size
 * @param {object} obj - Object to get size from
 * @returns {number} Object size
 */
export const getSize = (obj) => {
  return obj && isObject(obj) ? Object.keys(obj).length : 0
}

/**
 * Get nested property value
 * @param {object} obj - Object to get property from
 * @param {string} path - Property path
 * @param {any} defaultValue - Default value
 * @returns {any} Property value
 */
export const getNested = (obj, path, defaultValue = undefined) => {
  if (!obj || !isObject(obj) || !path) return defaultValue
  
  const keys = path.split('.')
  let current = obj
  
  for (const key of keys) {
    if (current === null || current === undefined || !isObject(current)) {
      return defaultValue
    }
    current = current[key]
  }
  
  return current !== undefined ? current : defaultValue
}

/**
 * Set nested property value
 * @param {object} obj - Object to set property on
 * @param {string} path - Property path
 * @param {any} value - Value to set
 * @returns {object} New object with property set
 */
export const setNested = (obj, path, value) => {
  if (!obj || !isObject(obj) || !path) return obj
  
  const keys = path.split('.')
  const result = { ...obj }
  let current = result
  
  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i]
    if (!current[key] || !isObject(current[key])) {
      current[key] = {}
    }
    current = current[key]
  }
  
  current[keys[keys.length - 1]] = value
  return result
}

/**
 * Remove property from object
 * @param {object} obj - Object to remove property from
 * @param {string} property - Property to remove
 * @returns {object} New object without property
 */
export const removeProperty = (obj, property) => {
  if (!obj || !isObject(obj)) return obj
  
  const { [property]: removed, ...rest } = obj
  return rest
}

/**
 * Remove properties from object
 * @param {object} obj - Object to remove properties from
 * @param {array} properties - Properties to remove
 * @returns {object} New object without properties
 */
export const removeProperties = (obj, properties) => {
  if (!obj || !isObject(obj) || !Array.isArray(properties)) return obj
  
  const result = { ...obj }
  properties.forEach(property => {
    delete result[property]
  })
  return result
}

/**
 * Pick properties from object
 * @param {object} obj - Object to pick properties from
 * @param {array} properties - Properties to pick
 * @returns {object} New object with only picked properties
 */
export const pick = (obj, properties) => {
  if (!obj || !isObject(obj) || !Array.isArray(properties)) return {}
  
  const result = {}
  properties.forEach(property => {
    if (property in obj) {
      result[property] = obj[property]
    }
  })
  return result
}

/**
 * Omit properties from object
 * @param {object} obj - Object to omit properties from
 * @param {array} properties - Properties to omit
 * @returns {object} New object without omitted properties
 */
export const omit = (obj, properties) => {
  if (!obj || !isObject(obj) || !Array.isArray(properties)) return obj
  
  const result = { ...obj }
  properties.forEach(property => {
    delete result[property]
  })
  return result
}

/**
 * Merge objects
 * @param {object} target - Target object
 * @param {...object} sources - Source objects
 * @returns {object} Merged object
 */
export const merge = (target, ...sources) => {
  if (!target || !isObject(target)) return {}
  
  const result = { ...target }
  
  sources.forEach(source => {
    if (source && isObject(source)) {
      Object.keys(source).forEach(key => {
        if (isObject(source[key]) && isObject(result[key])) {
          result[key] = merge(result[key], source[key])
        } else {
          result[key] = source[key]
        }
      })
    }
  })
  
  return result
}

/**
 * Deep merge objects
 * @param {object} target - Target object
 * @param {...object} sources - Source objects
 * @returns {object} Deep merged object
 */
export const deepMerge = (target, ...sources) => {
  if (!target || !isObject(target)) return {}
  
  const result = { ...target }
  
  sources.forEach(source => {
    if (source && isObject(source)) {
      Object.keys(source).forEach(key => {
        if (isObject(source[key]) && isObject(result[key])) {
          result[key] = deepMerge(result[key], source[key])
        } else {
          result[key] = source[key]
        }
      })
    }
  })
  
  return result
}

/**
 * Clone object
 * @param {object} obj - Object to clone
 * @returns {object} Cloned object
 */
export const clone = (obj) => {
  if (!obj || !isObject(obj)) return obj
  return { ...obj }
}

/**
 * Deep clone object
 * @param {object} obj - Object to deep clone
 * @returns {object} Deep cloned object
 */
export const deepClone = (obj) => {
  if (!obj || !isObject(obj)) return obj
  
  if (obj instanceof Date) return new Date(obj.getTime())
  if (obj instanceof Array) return obj.map(item => deepClone(item))
  if (isObject(obj)) {
    const cloned = {}
    Object.keys(obj).forEach(key => {
      cloned[key] = deepClone(obj[key])
    })
    return cloned
  }
  
  return obj
}

/**
 * Transform object keys
 * @param {object} obj - Object to transform
 * @param {function} fn - Transform function
 * @returns {object} Object with transformed keys
 */
export const transformKeys = (obj, fn) => {
  if (!obj || !isObject(obj) || typeof fn !== 'function') return obj
  
  const result = {}
  Object.keys(obj).forEach(key => {
    const newKey = fn(key)
    result[newKey] = obj[key]
  })
  return result
}

/**
 * Transform object values
 * @param {object} obj - Object to transform
 * @param {function} fn - Transform function
 * @returns {object} Object with transformed values
 */
export const transformValues = (obj, fn) => {
  if (!obj || !isObject(obj) || typeof fn !== 'function') return obj
  
  const result = {}
  Object.keys(obj).forEach(key => {
    result[key] = fn(obj[key], key)
  })
  return result
}

/**
 * Filter object by function
 * @param {object} obj - Object to filter
 * @param {function} fn - Filter function
 * @returns {object} Filtered object
 */
export const filterByFunction = (obj, fn) => {
  if (!obj || !isObject(obj) || typeof fn !== 'function') return obj
  
  const result = {}
  Object.keys(obj).forEach(key => {
    if (fn(obj[key], key)) {
      result[key] = obj[key]
    }
  })
  return result
}

/**
 * Map object by function
 * @param {object} obj - Object to map
 * @param {function} fn - Map function
 * @returns {object} Mapped object
 */
export const mapByFunction = (obj, fn) => {
  if (!obj || !isObject(obj) || typeof fn !== 'function') return obj
  
  const result = {}
  Object.keys(obj).forEach(key => {
    result[key] = fn(obj[key], key)
  })
  return result
}

/**
 * Reduce object by function
 * @param {object} obj - Object to reduce
 * @param {function} fn - Reduce function
 * @param {any} initial - Initial value
 * @returns {any} Reduced value
 */
export const reduceByFunction = (obj, fn, initial) => {
  if (!obj || !isObject(obj) || typeof fn !== 'function') return initial
  
  return Object.keys(obj).reduce((acc, key) => {
    return fn(acc, obj[key], key)
  }, initial)
}

/**
 * Check if object has property
 * @param {object} obj - Object to check
 * @param {string} property - Property to check
 * @returns {boolean} Has property
 */
export const hasProperty = (obj, property) => {
  return obj && isObject(obj) && property in obj
}

/**
 * Check if object has nested property
 * @param {object} obj - Object to check
 * @param {string} path - Property path to check
 * @returns {boolean} Has nested property
 */
export const hasNestedProperty = (obj, path) => {
  if (!obj || !isObject(obj) || !path) return false
  
  const keys = path.split('.')
  let current = obj
  
  for (const key of keys) {
    if (!current || !isObject(current) || !(key in current)) {
      return false
    }
    current = current[key]
  }
  
  return true
}

/**
 * Get object property count
 * @param {object} obj - Object to count properties
 * @returns {number} Property count
 */
export const getPropertyCount = (obj) => {
  return obj && isObject(obj) ? Object.keys(obj).length : 0
}

/**
 * Get object property names
 * @param {object} obj - Object to get property names from
 * @returns {array} Property names
 */
export const getPropertyNames = (obj) => {
  return obj && isObject(obj) ? Object.getOwnPropertyNames(obj) : []
}

/**
 * Get object property descriptors
 * @param {object} obj - Object to get property descriptors from
 * @returns {object} Property descriptors
 */
export const getPropertyDescriptors = (obj) => {
  return obj && isObject(obj) ? Object.getOwnPropertyDescriptors(obj) : {}
}

/**
 * Freeze object
 * @param {object} obj - Object to freeze
 * @returns {object} Frozen object
 */
export const freeze = (obj) => {
  if (!obj || !isObject(obj)) return obj
  return Object.freeze(obj)
}

/**
 * Deep freeze object
 * @param {object} obj - Object to deep freeze
 * @returns {object} Deep frozen object
 */
export const deepFreeze = (obj) => {
  if (!obj || !isObject(obj)) return obj
  
  Object.getOwnPropertyNames(obj).forEach(prop => {
    if (obj[prop] !== null && (typeof obj[prop] === 'object' || typeof obj[prop] === 'function')) {
      deepFreeze(obj[prop])
    }
  })
  
  return Object.freeze(obj)
}

/**
 * Object constants
 */
export const OBJECT_CONSTANTS = {
  TYPES: {
    OBJECT: 'object',
    ARRAY: 'array',
    FUNCTION: 'function',
    STRING: 'string',
    NUMBER: 'number',
    BOOLEAN: 'boolean',
    UNDEFINED: 'undefined',
    NULL: 'null'
  },
  PROPERTY_DESCRIPTORS: {
    CONFIGURABLE: 'configurable',
    ENUMERABLE: 'enumerable',
    WRITABLE: 'writable',
    VALUE: 'value',
    GET: 'get',
    SET: 'set'
  }
}

export default {
  isObject,
  isEmpty,
  hasProperties,
  getKeys,
  getValues,
  getEntries,
  getSize,
  getNested,
  setNested,
  removeProperty,
  removeProperties,
  pick,
  omit,
  merge,
  deepMerge,
  clone,
  deepClone,
  transformKeys,
  transformValues,
  filterByFunction,
  mapByFunction,
  reduceByFunction,
  hasProperty,
  hasNestedProperty,
  getPropertyCount,
  getPropertyNames,
  getPropertyDescriptors,
  freeze,
  deepFreeze,
  OBJECT_CONSTANTS
}
