/**
 * Permission utility functions for access control
 */

// Permission categories and definitions
const PERMISSION_CATEGORIES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  STAFF: 'staff',
  CUSTOMER: 'customer',
  BUSINESS: 'business',
  USER: 'user',
  APPOINTMENT: 'appointment',
  TRANSACTION: 'transaction',
  NOTIFICATION: 'notification',
  REPORT: 'report',
  SETTINGS: 'settings'
}

const PERMISSION_ACTIONS = {
  CREATE: 'create',
  READ: 'read',
  UPDATE: 'update',
  DELETE: 'delete',
  MANAGE: 'manage',
  VIEW: 'view',
  EDIT: 'edit',
  EXPORT: 'export',
  IMPORT: 'import'
}

// Permission definitions with descriptions
const PERMISSION_DEFINITIONS = {
  // Admin permissions
  'admin.dashboard': {
    category: PERMISSION_CATEGORIES.ADMIN,
    action: PERMISSION_ACTIONS.VIEW,
    description: 'View admin dashboard',
    level: 'admin'
  },
  'admin.businesses': {
    category: PERMISSION_CATEGORIES.ADMIN,
    action: PERMISSION_ACTIONS.MANAGE,
    description: 'Manage all businesses',
    level: 'admin'
  },
  'admin.managers': {
    category: PERMISSION_CATEGORIES.ADMIN,
    action: PERMISSION_ACTIONS.MANAGE,
    description: 'Manage all managers',
    level: 'admin'
  },
  'admin.reports': {
    category: PERMISSION_CATEGORIES.ADMIN,
    action: PERMISSION_ACTIONS.VIEW,
    description: 'View admin reports',
    level: 'admin'
  },
  'admin.settings': {
    category: PERMISSION_CATEGORIES.ADMIN,
    action: PERMISSION_ACTIONS.MANAGE,
    description: 'Manage system settings',
    level: 'admin'
  },
  'admin.users': {
    category: PERMISSION_CATEGORIES.ADMIN,
    action: PERMISSION_ACTIONS.MANAGE,
    description: 'Manage all users',
    level: 'admin'
  },

  // Manager permissions
  'manager.dashboard': {
    category: PERMISSION_CATEGORIES.MANAGER,
    action: PERMISSION_ACTIONS.VIEW,
    description: 'View manager dashboard',
    level: 'manager'
  },
  'manager.business': {
    category: PERMISSION_CATEGORIES.MANAGER,
    action: PERMISSION_ACTIONS.MANAGE,
    description: 'Manage assigned business',
    level: 'manager'
  },
  'manager.staff': {
    category: PERMISSION_CATEGORIES.MANAGER,
    action: PERMISSION_ACTIONS.MANAGE,
    description: 'Manage staff members',
    level: 'manager'
  },
  'manager.customers': {
    category: PERMISSION_CATEGORIES.MANAGER,
    action: PERMISSION_ACTIONS.MANAGE,
    description: 'Manage customers',
    level: 'manager'
  },
  'manager.appointments': {
    category: PERMISSION_CATEGORIES.MANAGER,
    action: PERMISSION_ACTIONS.MANAGE,
    description: 'Manage appointments',
    level: 'manager'
  },
  'manager.transactions': {
    category: PERMISSION_CATEGORIES.MANAGER,
    action: PERMISSION_ACTIONS.MANAGE,
    description: 'Manage transactions',
    level: 'manager'
  },
  'manager.reports': {
    category: PERMISSION_CATEGORIES.MANAGER,
    action: PERMISSION_ACTIONS.VIEW,
    description: 'View manager reports',
    level: 'manager'
  },
  'manager.settings': {
    category: PERMISSION_CATEGORIES.MANAGER,
    action: PERMISSION_ACTIONS.MANAGE,
    description: 'Manage business settings',
    level: 'manager'
  },

  // Staff permissions
  'staff.dashboard': {
    category: PERMISSION_CATEGORIES.STAFF,
    action: PERMISSION_ACTIONS.VIEW,
    description: 'View staff dashboard',
    level: 'staff'
  },
  'staff.profile': {
    category: PERMISSION_CATEGORIES.STAFF,
    action: PERMISSION_ACTIONS.MANAGE,
    description: 'Manage own profile',
    level: 'staff'
  },
  'staff.business': {
    category: PERMISSION_CATEGORIES.STAFF,
    action: PERMISSION_ACTIONS.VIEW,
    description: 'View business information',
    level: 'staff'
  },
  'staff.customers': {
    category: PERMISSION_CATEGORIES.STAFF,
    action: PERMISSION_ACTIONS.VIEW,
    description: 'View customer information',
    level: 'staff'
  },
  'staff.appointments': {
    category: PERMISSION_CATEGORIES.STAFF,
    action: PERMISSION_ACTIONS.MANAGE,
    description: 'Manage appointments',
    level: 'staff'
  },
  'staff.transactions': {
    category: PERMISSION_CATEGORIES.STAFF,
    action: PERMISSION_ACTIONS.MANAGE,
    description: 'Manage transactions',
    level: 'staff'
  },

  // Customer permissions
  'customer.dashboard': {
    category: PERMISSION_CATEGORIES.CUSTOMER,
    action: PERMISSION_ACTIONS.VIEW,
    description: 'View customer dashboard',
    level: 'customer'
  },
  'customer.profile': {
    category: PERMISSION_CATEGORIES.CUSTOMER,
    action: PERMISSION_ACTIONS.MANAGE,
    description: 'Manage own profile',
    level: 'customer'
  },
  'customer.appointments': {
    category: PERMISSION_CATEGORIES.CUSTOMER,
    action: PERMISSION_ACTIONS.MANAGE,
    description: 'Manage own appointments',
    level: 'customer'
  },
  'customer.transactions': {
    category: PERMISSION_CATEGORIES.CUSTOMER,
    action: PERMISSION_ACTIONS.VIEW,
    description: 'View own transactions',
    level: 'customer'
  },

  // Business permissions
  'business.create': {
    category: PERMISSION_CATEGORIES.BUSINESS,
    action: PERMISSION_ACTIONS.CREATE,
    description: 'Create businesses',
    level: 'admin'
  },
  'business.read': {
    category: PERMISSION_CATEGORIES.BUSINESS,
    action: PERMISSION_ACTIONS.READ,
    description: 'Read business information',
    level: 'staff'
  },
  'business.update': {
    category: PERMISSION_CATEGORIES.BUSINESS,
    action: PERMISSION_ACTIONS.UPDATE,
    description: 'Update business information',
    level: 'manager'
  },
  'business.delete': {
    category: PERMISSION_CATEGORIES.BUSINESS,
    action: PERMISSION_ACTIONS.DELETE,
    description: 'Delete businesses',
    level: 'admin'
  },

  // User permissions
  'user.create': {
    category: PERMISSION_CATEGORIES.USER,
    action: PERMISSION_ACTIONS.CREATE,
    description: 'Create users',
    level: 'admin'
  },
  'user.read': {
    category: PERMISSION_CATEGORIES.USER,
    action: PERMISSION_ACTIONS.READ,
    description: 'Read user information',
    level: 'staff'
  },
  'user.update': {
    category: PERMISSION_CATEGORIES.USER,
    action: PERMISSION_ACTIONS.UPDATE,
    description: 'Update user information',
    level: 'manager'
  },
  'user.delete': {
    category: PERMISSION_CATEGORIES.USER,
    action: PERMISSION_ACTIONS.DELETE,
    description: 'Delete users',
    level: 'admin'
  },

  // Appointment permissions
  'appointment.create': {
    category: PERMISSION_CATEGORIES.APPOINTMENT,
    action: PERMISSION_ACTIONS.CREATE,
    description: 'Create appointments',
    level: 'staff'
  },
  'appointment.read': {
    category: PERMISSION_CATEGORIES.APPOINTMENT,
    action: PERMISSION_ACTIONS.READ,
    description: 'Read appointment information',
    level: 'staff'
  },
  'appointment.update': {
    category: PERMISSION_CATEGORIES.APPOINTMENT,
    action: PERMISSION_ACTIONS.UPDATE,
    description: 'Update appointments',
    level: 'staff'
  },
  'appointment.delete': {
    category: PERMISSION_CATEGORIES.APPOINTMENT,
    action: PERMISSION_ACTIONS.DELETE,
    description: 'Delete appointments',
    level: 'manager'
  },

  // Transaction permissions
  'transaction.create': {
    category: PERMISSION_CATEGORIES.TRANSACTION,
    action: PERMISSION_ACTIONS.CREATE,
    description: 'Create transactions',
    level: 'staff'
  },
  'transaction.read': {
    category: PERMISSION_CATEGORIES.TRANSACTION,
    action: PERMISSION_ACTIONS.READ,
    description: 'Read transaction information',
    level: 'staff'
  },
  'transaction.update': {
    category: PERMISSION_CATEGORIES.TRANSACTION,
    action: PERMISSION_ACTIONS.UPDATE,
    description: 'Update transactions',
    level: 'manager'
  },
  'transaction.delete': {
    category: PERMISSION_CATEGORIES.TRANSACTION,
    action: PERMISSION_ACTIONS.DELETE,
    description: 'Delete transactions',
    level: 'admin'
  },

  // Notification permissions
  'notification.create': {
    category: PERMISSION_CATEGORIES.NOTIFICATION,
    action: PERMISSION_ACTIONS.CREATE,
    description: 'Create notifications',
    level: 'manager'
  },
  'notification.read': {
    category: PERMISSION_CATEGORIES.NOTIFICATION,
    action: PERMISSION_ACTIONS.READ,
    description: 'Read notifications',
    level: 'staff'
  },
  'notification.update': {
    category: PERMISSION_CATEGORIES.NOTIFICATION,
    action: PERMISSION_ACTIONS.UPDATE,
    description: 'Update notifications',
    level: 'manager'
  },
  'notification.delete': {
    category: PERMISSION_CATEGORIES.NOTIFICATION,
    action: PERMISSION_ACTIONS.DELETE,
    description: 'Delete notifications',
    level: 'admin'
  },

  // Report permissions
  'report.create': {
    category: PERMISSION_CATEGORIES.REPORT,
    action: PERMISSION_ACTIONS.CREATE,
    description: 'Create reports',
    level: 'manager'
  },
  'report.read': {
    category: PERMISSION_CATEGORIES.REPORT,
    action: PERMISSION_ACTIONS.READ,
    description: 'Read reports',
    level: 'staff'
  },
  'report.update': {
    category: PERMISSION_CATEGORIES.REPORT,
    action: PERMISSION_ACTIONS.UPDATE,
    description: 'Update reports',
    level: 'manager'
  },
  'report.delete': {
    category: PERMISSION_CATEGORIES.REPORT,
    action: PERMISSION_ACTIONS.DELETE,
    description: 'Delete reports',
    level: 'admin'
  },
  'report.export': {
    category: PERMISSION_CATEGORIES.REPORT,
    action: PERMISSION_ACTIONS.EXPORT,
    description: 'Export reports',
    level: 'manager'
  }
}

/**
 * Get permission definition
 * @param {string} permission - Permission key
 * @returns {object|null} Permission definition or null if not found
 */
export const getPermissionDefinition = (permission) => {
  return PERMISSION_DEFINITIONS[permission] || null
}

/**
 * Get permission category
 * @param {string} permission - Permission key
 * @returns {string|null} Permission category or null if not found
 */
export const getPermissionCategory = (permission) => {
  const definition = getPermissionDefinition(permission)
  return definition?.category || null
}

/**
 * Get permission action
 * @param {string} permission - Permission key
 * @returns {string|null} Permission action or null if not found
 */
export const getPermissionAction = (permission) => {
  const definition = getPermissionDefinition(permission)
  return definition?.action || null
}

/**
 * Get permission description
 * @param {string} permission - Permission key
 * @returns {string|null} Permission description or null if not found
 */
export const getPermissionDescription = (permission) => {
  const definition = getPermissionDefinition(permission)
  return definition?.description || null
}

/**
 * Get permission level
 * @param {string} permission - Permission key
 * @returns {string|null} Permission level or null if not found
 */
export const getPermissionLevel = (permission) => {
  const definition = getPermissionDefinition(permission)
  return definition?.level || null
}

/**
 * Get all permissions for a category
 * @param {string} category - Permission category
 * @returns {string[]} Array of permission keys
 */
export const getPermissionsByCategory = (category) => {
  return Object.keys(PERMISSION_DEFINITIONS).filter(
    permission => getPermissionCategory(permission) === category
  )
}

/**
 * Get all permissions for an action
 * @param {string} action - Permission action
 * @returns {string[]} Array of permission keys
 */
export const getPermissionsByAction = (action) => {
  return Object.keys(PERMISSION_DEFINITIONS).filter(
    permission => getPermissionAction(permission) === action
  )
}

/**
 * Get all permissions for a level
 * @param {string} level - Permission level
 * @returns {string[]} Array of permission keys
 */
export const getPermissionsByLevel = (level) => {
  return Object.keys(PERMISSION_DEFINITIONS).filter(
    permission => getPermissionLevel(permission) === level
  )
}

/**
 * Get all available permissions
 * @returns {string[]} Array of all permission keys
 */
export const getAllPermissions = () => {
  return Object.keys(PERMISSION_DEFINITIONS)
}

/**
 * Get all available categories
 * @returns {string[]} Array of all category keys
 */
export const getAllCategories = () => {
  return Object.values(PERMISSION_CATEGORIES)
}

/**
 * Get all available actions
 * @returns {string[]} Array of all action keys
 */
export const getAllActions = () => {
  return Object.values(PERMISSION_ACTIONS)
}

/**
 * Check if permission exists
 * @param {string} permission - Permission key
 * @returns {boolean} True if permission exists
 */
export const isValidPermission = (permission) => {
  return Object.keys(PERMISSION_DEFINITIONS).includes(permission)
}

/**
 * Check if category exists
 * @param {string} category - Category key
 * @returns {boolean} True if category exists
 */
export const isValidCategory = (category) => {
  return Object.values(PERMISSION_CATEGORIES).includes(category)
}

/**
 * Check if action exists
 * @param {string} action - Action key
 * @returns {boolean} True if action exists
 */
export const isValidAction = (action) => {
  return Object.values(PERMISSION_ACTIONS).includes(action)
}

/**
 * Get permissions grouped by category
 * @returns {object} Permissions grouped by category
 */
export const getPermissionsGroupedByCategory = () => {
  const grouped = {}
  
  Object.keys(PERMISSION_DEFINITIONS).forEach(permission => {
    const category = getPermissionCategory(permission)
    if (!grouped[category]) {
      grouped[category] = []
    }
    grouped[category].push(permission)
  })
  
  return grouped
}

/**
 * Get permissions grouped by action
 * @returns {object} Permissions grouped by action
 */
export const getPermissionsGroupedByAction = () => {
  const grouped = {}
  
  Object.keys(PERMISSION_DEFINITIONS).forEach(permission => {
    const action = getPermissionAction(permission)
    if (!grouped[action]) {
      grouped[action] = []
    }
    grouped[action].push(permission)
  })
  
  return grouped
}

/**
 * Get permissions grouped by level
 * @returns {object} Permissions grouped by level
 */
export const getPermissionsGroupedByLevel = () => {
  const grouped = {}
  
  Object.keys(PERMISSION_DEFINITIONS).forEach(permission => {
    const level = getPermissionLevel(permission)
    if (!grouped[level]) {
      grouped[level] = []
    }
    grouped[level].push(permission)
  })
  
  return grouped
}

/**
 * Filter permissions by multiple criteria
 * @param {object} criteria - Filter criteria
 * @returns {string[]} Filtered permission keys
 */
export const filterPermissions = (criteria) => {
  let permissions = Object.keys(PERMISSION_DEFINITIONS)
  
  if (criteria.category) {
    permissions = permissions.filter(p => getPermissionCategory(p) === criteria.category)
  }
  
  if (criteria.action) {
    permissions = permissions.filter(p => getPermissionAction(p) === criteria.action)
  }
  
  if (criteria.level) {
    permissions = permissions.filter(p => getPermissionLevel(p) === criteria.level)
  }
  
  if (criteria.search) {
    const searchTerm = criteria.search.toLowerCase()
    permissions = permissions.filter(p => 
      p.toLowerCase().includes(searchTerm) ||
      getPermissionDescription(p)?.toLowerCase().includes(searchTerm)
    )
  }
  
  return permissions
}

/**
 * Get permission statistics
 * @returns {object} Permission statistics
 */
export const getPermissionStatistics = () => {
  const total = Object.keys(PERMISSION_DEFINITIONS).length
  const byCategory = {}
  const byAction = {}
  const byLevel = {}
  
  Object.keys(PERMISSION_DEFINITIONS).forEach(permission => {
    const category = getPermissionCategory(permission)
    const action = getPermissionAction(permission)
    const level = getPermissionLevel(permission)
    
    byCategory[category] = (byCategory[category] || 0) + 1
    byAction[action] = (byAction[action] || 0) + 1
    byLevel[level] = (byLevel[level] || 0) + 1
  })
  
  return {
    total,
    byCategory,
    byAction,
    byLevel
  }
}

/**
 * Create permission key
 * @param {string} category - Permission category
 * @param {string} action - Permission action
 * @returns {string} Permission key
 */
export const createPermissionKey = (category, action) => {
  return `${category}.${action}`
}

/**
 * Parse permission key
 * @param {string} permission - Permission key
 * @returns {object|null} Parsed permission or null if invalid
 */
export const parsePermissionKey = (permission) => {
  if (!permission || typeof permission !== 'string') return null
  
  const parts = permission.split('.')
  if (parts.length !== 2) return null
  
  return {
    category: parts[0],
    action: parts[1]
  }
}

/**
 * Permission utility constants
 */
export const PERMISSION_CONSTANTS = {
  CATEGORIES: PERMISSION_CATEGORIES,
  ACTIONS: PERMISSION_ACTIONS,
  DEFINITIONS: PERMISSION_DEFINITIONS
}

export default {
  getPermissionDefinition,
  getPermissionCategory,
  getPermissionAction,
  getPermissionDescription,
  getPermissionLevel,
  getPermissionsByCategory,
  getPermissionsByAction,
  getPermissionsByLevel,
  getAllPermissions,
  getAllCategories,
  getAllActions,
  isValidPermission,
  isValidCategory,
  isValidAction,
  getPermissionsGroupedByCategory,
  getPermissionsGroupedByAction,
  getPermissionsGroupedByLevel,
  filterPermissions,
  getPermissionStatistics,
  createPermissionKey,
  parsePermissionKey,
  PERMISSION_CONSTANTS
}
