/**
 * Storage utility functions
 */

/**
 * Check if localStorage is available
 * @returns {boolean} Is localStorage available
 */
export const isLocalStorageAvailable = () => {
  try {
    const test = '__localStorage_test__'
    localStorage.setItem(test, test)
    localStorage.removeItem(test)
    return true
  } catch {
    return false
  }
}

/**
 * Check if sessionStorage is available
 * @returns {boolean} Is sessionStorage available
 */
export const isSessionStorageAvailable = () => {
  try {
    const test = '__sessionStorage_test__'
    sessionStorage.setItem(test, test)
    sessionStorage.removeItem(test)
    return true
  } catch {
    return false
  }
}

/**
 * Set item in localStorage
 * @param {string} key - Storage key
 * @param {any} value - Value to store
 * @returns {boolean} Success status
 */
export const setLocalStorageItem = (key, value) => {
  if (!isLocalStorageAvailable() || !key) return false
  
  try {
    const serializedValue = JSON.stringify(value)
    localStorage.setItem(key, serializedValue)
    return true
  } catch {
    return false
  }
}

/**
 * Get item from localStorage
 * @param {string} key - Storage key
 * @param {any} defaultValue - Default value
 * @returns {any} Stored value or default
 */
export const getLocalStorageItem = (key, defaultValue = null) => {
  if (!isLocalStorageAvailable() || !key) return defaultValue
  
  try {
    const item = localStorage.getItem(key)
    return item ? JSON.parse(item) : defaultValue
  } catch {
    return defaultValue
  }
}

/**
 * Remove item from localStorage
 * @param {string} key - Storage key
 * @returns {boolean} Success status
 */
export const removeLocalStorageItem = (key) => {
  if (!isLocalStorageAvailable() || !key) return false
  
  try {
    localStorage.removeItem(key)
    return true
  } catch {
    return false
  }
}

/**
 * Clear all items from localStorage
 * @returns {boolean} Success status
 */
export const clearLocalStorage = () => {
  if (!isLocalStorageAvailable()) return false
  
  try {
    localStorage.clear()
    return true
  } catch {
    return false
  }
}

/**
 * Get all keys from localStorage
 * @returns {array} Array of keys
 */
export const getLocalStorageKeys = () => {
  if (!isLocalStorageAvailable()) return []
  
  try {
    return Object.keys(localStorage)
  } catch {
    return []
  }
}

/**
 * Get localStorage size
 * @returns {number} Storage size in bytes
 */
export const getLocalStorageSize = () => {
  if (!isLocalStorageAvailable()) return 0
  
  try {
    let total = 0
    for (const key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        total += localStorage[key].length + key.length
      }
    }
    return total
  } catch {
    return 0
  }
}

/**
 * Set item in sessionStorage
 * @param {string} key - Storage key
 * @param {any} value - Value to store
 * @returns {boolean} Success status
 */
export const setSessionStorageItem = (key, value) => {
  if (!isSessionStorageAvailable() || !key) return false
  
  try {
    const serializedValue = JSON.stringify(value)
    sessionStorage.setItem(key, serializedValue)
    return true
  } catch {
    return false
  }
}

/**
 * Get item from sessionStorage
 * @param {string} key - Storage key
 * @param {any} defaultValue - Default value
 * @returns {any} Stored value or default
 */
export const getSessionStorageItem = (key, defaultValue = null) => {
  if (!isSessionStorageAvailable() || !key) return defaultValue
  
  try {
    const item = sessionStorage.getItem(key)
    return item ? JSON.parse(item) : defaultValue
  } catch {
    return defaultValue
  }
}

/**
 * Remove item from sessionStorage
 * @param {string} key - Storage key
 * @returns {boolean} Success status
 */
export const removeSessionStorageItem = (key) => {
  if (!isSessionStorageAvailable() || !key) return false
  
  try {
    sessionStorage.removeItem(key)
    return true
  } catch {
    return false
  }
}

/**
 * Clear all items from sessionStorage
 * @returns {boolean} Success status
 */
export const clearSessionStorage = () => {
  if (!isSessionStorageAvailable()) return false
  
  try {
    sessionStorage.clear()
    return true
  } catch {
    return false
  }
}

/**
 * Get all keys from sessionStorage
 * @returns {array} Array of keys
 */
export const getSessionStorageKeys = () => {
  if (!isSessionStorageAvailable()) return []
  
  try {
    return Object.keys(sessionStorage)
  } catch {
    return []
  }
}

/**
 * Get sessionStorage size
 * @returns {number} Storage size in bytes
 */
export const getSessionStorageSize = () => {
  if (!isSessionStorageAvailable()) return 0
  
  try {
    let total = 0
    for (const key in sessionStorage) {
      if (sessionStorage.hasOwnProperty(key)) {
        total += sessionStorage[key].length + key.length
      }
    }
    return total
  } catch {
    return 0
  }
}

/**
 * Set item in storage with expiration
 * @param {string} key - Storage key
 * @param {any} value - Value to store
 * @param {number} expirationMinutes - Expiration time in minutes
 * @param {string} storageType - Storage type ('local' or 'session')
 * @returns {boolean} Success status
 */
export const setStorageItemWithExpiration = (key, value, expirationMinutes, storageType = 'local') => {
  if (!key || !value || !expirationMinutes) return false
  
  const expirationTime = Date.now() + (expirationMinutes * 60 * 1000)
  const item = {
    value,
    expiration: expirationTime
  }
  
  if (storageType === 'session') {
    return setSessionStorageItem(key, item)
  } else {
    return setLocalStorageItem(key, item)
  }
}

/**
 * Get item from storage with expiration check
 * @param {string} key - Storage key
 * @param {any} defaultValue - Default value
 * @param {string} storageType - Storage type ('local' or 'session')
 * @returns {any} Stored value or default
 */
export const getStorageItemWithExpiration = (key, defaultValue = null, storageType = 'local') => {
  if (!key) return defaultValue
  
  let item
  if (storageType === 'session') {
    item = getSessionStorageItem(key)
  } else {
    item = getLocalStorageItem(key)
  }
  
  if (!item || typeof item !== 'object' || !item.hasOwnProperty('value') || !item.hasOwnProperty('expiration')) {
    return defaultValue
  }
  
  if (Date.now() > item.expiration) {
    // Item has expired, remove it
    if (storageType === 'session') {
      removeSessionStorageItem(key)
    } else {
      removeLocalStorageItem(key)
    }
    return defaultValue
  }
  
  return item.value
}

/**
 * Check if storage item has expired
 * @param {string} key - Storage key
 * @param {string} storageType - Storage type ('local' or 'session')
 * @returns {boolean} Is expired
 */
export const isStorageItemExpired = (key, storageType = 'local') => {
  if (!key) return true
  
  let item
  if (storageType === 'session') {
    item = getSessionStorageItem(key)
  } else {
    item = getLocalStorageItem(key)
  }
  
  if (!item || typeof item !== 'object' || !item.hasOwnProperty('expiration')) {
    return true
  }
  
  return Date.now() > item.expiration
}

/**
 * Clean expired items from storage
 * @param {string} storageType - Storage type ('local' or 'session')
 * @returns {number} Number of items cleaned
 */
export const cleanExpiredStorageItems = (storageType = 'local') => {
  let keys
  if (storageType === 'session') {
    keys = getSessionStorageKeys()
  } else {
    keys = getLocalStorageKeys()
  }
  
  let cleanedCount = 0
  
  keys.forEach(key => {
    if (isStorageItemExpired(key, storageType)) {
      if (storageType === 'session') {
        removeSessionStorageItem(key)
      } else {
        removeLocalStorageItem(key)
      }
      cleanedCount++
    }
  })
  
  return cleanedCount
}

/**
 * Get storage statistics
 * @param {string} storageType - Storage type ('local' or 'session')
 * @returns {object} Storage statistics
 */
export const getStorageStatistics = (storageType = 'local') => {
  let keys, size
  
  if (storageType === 'session') {
    keys = getSessionStorageKeys()
    size = getSessionStorageSize()
  } else {
    keys = getLocalStorageKeys()
    size = getLocalStorageSize()
  }
  
  return {
    type: storageType,
    totalKeys: keys.length,
    totalSize: size,
    available: storageType === 'session' ? isSessionStorageAvailable() : isLocalStorageAvailable()
  }
}

/**
 * Export storage data
 * @param {string} storageType - Storage type ('local' or 'session')
 * @returns {object} Exported data
 */
export const exportStorageData = (storageType = 'local') => {
  let keys
  
  if (storageType === 'session') {
    keys = getSessionStorageKeys()
  } else {
    keys = getLocalStorageKeys()
  }
  
  const data = {}
  
  keys.forEach(key => {
    if (storageType === 'session') {
      data[key] = getSessionStorageItem(key)
    } else {
      data[key] = getLocalStorageItem(key)
    }
  })
  
  return {
    type: storageType,
    exportedAt: new Date().toISOString(),
    data
  }
}

/**
 * Import storage data
 * @param {object} data - Data to import
 * @param {boolean} overwrite - Whether to overwrite existing keys
 * @returns {number} Number of items imported
 */
export const importStorageData = (data, overwrite = false) => {
  if (!data || typeof data !== 'object' || !data.data) return 0
  
  const { type, data: storageData } = data
  let importedCount = 0
  
  Object.entries(storageData).forEach(([key, value]) => {
    if (type === 'session') {
      if (overwrite || !getSessionStorageItem(key)) {
        if (setSessionStorageItem(key, value)) {
          importedCount++
        }
      }
    } else {
      if (overwrite || !getLocalStorageItem(key)) {
        if (setLocalStorageItem(key, value)) {
          importedCount++
        }
      }
    }
  })
  
  return importedCount
}

/**
 * Storage constants
 */
export const STORAGE_CONSTANTS = {
  TYPES: {
    LOCAL: 'local',
    SESSION: 'session'
  },
  LIMITS: {
    LOCAL_STORAGE: 15 * 1024 * 1024, // 5MB
    SESSION_STORAGE: 15 * 1024 * 1024 // 5MB
  },
  EVENTS: {
    STORAGE: 'storage',
    BEFORE_UNLOAD: 'beforeunload'
  }
}

export default {
  isLocalStorageAvailable,
  isSessionStorageAvailable,
  setLocalStorageItem,
  getLocalStorageItem,
  removeLocalStorageItem,
  clearLocalStorage,
  getLocalStorageKeys,
  getLocalStorageSize,
  setSessionStorageItem,
  getSessionStorageItem,
  removeSessionStorageItem,
  clearSessionStorage,
  getSessionStorageKeys,
  getSessionStorageSize,
  setStorageItemWithExpiration,
  getStorageItemWithExpiration,
  isStorageItemExpired,
  cleanExpiredStorageItems,
  getStorageStatistics,
  exportStorageData,
  importStorageData,
  STORAGE_CONSTANTS
}
