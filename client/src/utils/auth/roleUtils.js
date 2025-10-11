/**
 * Role utility functions for user role management
 */

// Role hierarchy and permissions
const ROLE_HIERARCHY = {
  admin: 4,
  manager: 3,
  staff: 2,
  customer: 1
}

const ROLE_PERMISSIONS = {
  admin: [
    'admin.dashboard',
    'admin.businesses',
    'admin.managers',
    'admin.reports',
    'admin.settings',
    'admin.users',
    'business.create',
    'business.read',
    'business.update',
    'business.delete',
    'manager.create',
    'manager.read',
    'manager.update',
    'manager.delete',
    'staff.create',
    'staff.read',
    'staff.update',
    'staff.delete',
    'customer.create',
    'customer.read',
    'customer.update',
    'customer.delete',
    'appointment.create',
    'appointment.read',
    'appointment.update',
    'appointment.delete',
    'transaction.create',
    'transaction.read',
    'transaction.update',
    'transaction.delete',
    'notification.create',
    'notification.read',
    'notification.update',
    'notification.delete',
    'report.create',
    'report.read',
    'report.update',
    'report.delete'
  ],
  manager: [
    'manager.dashboard',
    'manager.business',
    'manager.staff',
    'manager.customers',
    'manager.appointments',
    'manager.transactions',
    'manager.reports',
    'manager.settings',
    'staff.create',
    'staff.read',
    'staff.update',
    'staff.delete',
    'customer.create',
    'customer.read',
    'customer.update',
    'customer.delete',
    'appointment.create',
    'appointment.read',
    'appointment.update',
    'appointment.delete',
    'transaction.create',
    'transaction.read',
    'transaction.update',
    'transaction.delete',
    'notification.create',
    'notification.read',
    'notification.update',
    'notification.delete',
    'report.create',
    'report.read',
    'report.update',
    'report.delete'
  ],
  staff: [
    'staff.dashboard',
    'staff.profile',
    'staff.business',
    'staff.customers',
    'staff.appointments',
    'staff.transactions',
    'customer.read',
    'appointment.create',
    'appointment.read',
    'appointment.update',
    'transaction.create',
    'transaction.read',
    'notification.read'
  ],
  customer: [
    'customer.dashboard',
    'customer.profile',
    'customer.appointments',
    'customer.transactions',
    'appointment.create',
    'appointment.read',
    'transaction.read'
  ]
}

/**
 * Get role hierarchy level
 * @param {string} role - User role
 * @returns {number} Hierarchy level (higher number = higher privilege)
 */
export const getRoleLevel = (role) => {
  return ROLE_HIERARCHY[role] || 0
}

/**
 * Check if user has higher or equal role level
 * @param {string} userRole - User's role
 * @param {string} requiredRole - Required role
 * @returns {boolean} True if user has sufficient role level
 */
export const hasRoleLevel = (userRole, requiredRole) => {
  const userLevel = getRoleLevel(userRole)
  const requiredLevel = getRoleLevel(requiredRole)
  return userLevel >= requiredLevel
}

/**
 * Check if user has specific role
 * @param {string} userRole - User's role
 * @param {string} role - Role to check
 * @returns {boolean} True if user has the role
 */
export const hasRole = (userRole, role) => {
  return userRole === role
}

/**
 * Check if user has any of the specified roles
 * @param {string} userRole - User's role
 * @param {string[]} roles - Roles to check
 * @returns {boolean} True if user has any of the roles
 */
export const hasAnyRole = (userRole, roles) => {
  return roles.includes(userRole)
}

/**
 * Check if user has all of the specified roles
 * @param {string} userRole - User's role
 * @param {string[]} roles - Roles to check
 * @returns {boolean} True if user has all roles
 */
export const hasAllRoles = (userRole, roles) => {
  return roles.every(role => userRole === role)
}

/**
 * Get permissions for a role
 * @param {string} role - User role
 * @returns {string[]} Array of permissions
 */
export const getRolePermissions = (role) => {
  return ROLE_PERMISSIONS[role] || []
}

/**
 * Check if user has specific permission
 * @param {string} userRole - User's role
 * @param {string} permission - Permission to check
 * @returns {boolean} True if user has the permission
 */
export const hasPermission = (userRole, permission) => {
  const permissions = getRolePermissions(userRole)
  return permissions.includes(permission)
}

/**
 * Check if user has any of the specified permissions
 * @param {string} userRole - User's role
 * @param {string[]} permissions - Permissions to check
 * @returns {boolean} True if user has any of the permissions
 */
export const hasAnyPermission = (userRole, permissions) => {
  const userPermissions = getRolePermissions(userRole)
  return permissions.some(permission => userPermissions.includes(permission))
}

/**
 * Check if user has all of the specified permissions
 * @param {string} userRole - User's role
 * @param {string[]} permissions - Permissions to check
 * @returns {boolean} True if user has all permissions
 */
export const hasAllPermissions = (userRole, permissions) => {
  const userPermissions = getRolePermissions(userRole)
  return permissions.every(permission => userPermissions.includes(permission))
}

/**
 * Get all available roles
 * @returns {string[]} Array of all roles
 */
export const getAllRoles = () => {
  return Object.keys(ROLE_HIERARCHY)
}

/**
 * Get roles with higher privilege than specified role
 * @param {string} role - Base role
 * @returns {string[]} Array of higher privilege roles
 */
export const getHigherRoles = (role) => {
  const userLevel = getRoleLevel(role)
  return Object.keys(ROLE_HIERARCHY).filter(r => getRoleLevel(r) > userLevel)
}

/**
 * Get roles with lower privilege than specified role
 * @param {string} role - Base role
 * @returns {string[]} Array of lower privilege roles
 */
export const getLowerRoles = (role) => {
  const userLevel = getRoleLevel(role)
  return Object.keys(ROLE_HIERARCHY).filter(r => getRoleLevel(r) < userLevel)
}

/**
 * Get roles with equal or lower privilege than specified role
 * @param {string} role - Base role
 * @returns {string[]} Array of equal or lower privilege roles
 */
export const getEqualOrLowerRoles = (role) => {
  const userLevel = getRoleLevel(role)
  return Object.keys(ROLE_HIERARCHY).filter(r => getRoleLevel(r) <= userLevel)
}

/**
 * Get roles with equal or higher privilege than specified role
 * @param {string} role - Base role
 * @returns {string[]} Array of equal or higher privilege roles
 */
export const getEqualOrHigherRoles = (role) => {
  const userLevel = getRoleLevel(role)
  return Object.keys(ROLE_HIERARCHY).filter(r => getRoleLevel(r) >= userLevel)
}

/**
 * Check if role can manage another role
 * @param {string} managerRole - Manager's role
 * @param {string} targetRole - Target role to manage
 * @returns {boolean} True if manager can manage target
 */
export const canManageRole = (managerRole, targetRole) => {
  return getRoleLevel(managerRole) > getRoleLevel(targetRole)
}

/**
 * Get role display name
 * @param {string} role - Role key
 * @returns {string} Display name for the role
 */
export const getRoleDisplayName = (role) => {
  const displayNames = {
    admin: 'Administrator',
    manager: 'Manager',
    staff: 'Staff',
    customer: 'Customer'
  }
  return displayNames[role] || role
}

/**
 * Get role description
 * @param {string} role - Role key
 * @returns {string} Description for the role
 */
export const getRoleDescription = (role) => {
  const descriptions = {
    admin: 'Full system access with all permissions',
    manager: 'Business management with staff and customer oversight',
    staff: 'Limited access for daily operations',
    customer: 'Customer portal access for appointments and transactions'
  }
  return descriptions[role] || 'No description available'
}

/**
 * Get role color for UI
 * @param {string} role - Role key
 * @returns {string} Color code for the role
 */
export const getRoleColor = (role) => {
  const colors = {
    admin: '#dc2626', // Red
    manager: '#2563eb', // Blue
    staff: '#059669', // Green
    customer: '#7c3aed' // Purple
  }
  return colors[role] || '#6b7280' // Gray
}

/**
 * Get role icon for UI
 * @param {string} role - Role key
 * @returns {string} Icon name for the role
 */
export const getRoleIcon = (role) => {
  const icons = {
    admin: 'shield-check',
    manager: 'user-tie',
    staff: 'user',
    customer: 'user-circle'
  }
  return icons[role] || 'user'
}

/**
 * Validate role
 * @param {string} role - Role to validate
 * @returns {boolean} True if valid role
 */
export const isValidRole = (role) => {
  return Object.keys(ROLE_HIERARCHY).includes(role)
}

/**
 * Get role statistics
 * @param {object[]} users - Array of user objects with role property
 * @returns {object} Role statistics
 */
export const getRoleStatistics = (users) => {
  const stats = {}
  
  Object.keys(ROLE_HIERARCHY).forEach(role => {
    stats[role] = 0
  })
  
  users.forEach(user => {
    if (user.role && stats.hasOwnProperty(user.role)) {
      stats[user.role]++
    }
  })
  
  return stats
}

/**
 * Get role distribution percentage
 * @param {object[]} users - Array of user objects with role property
 * @returns {object} Role distribution percentages
 */
export const getRoleDistribution = (users) => {
  const stats = getRoleStatistics(users)
  const total = users.length
  
  if (total === 0) return {}
  
  const distribution = {}
  Object.keys(stats).forEach(role => {
    distribution[role] = Math.round((stats[role] / total) * 100)
  })
  
  return distribution
}

/**
 * Filter users by role
 * @param {object[]} users - Array of user objects
 * @param {string|string[]} roles - Role(s) to filter by
 * @returns {object[]} Filtered users
 */
export const filterUsersByRole = (users, roles) => {
  const roleArray = Array.isArray(roles) ? roles : [roles]
  return users.filter(user => roleArray.includes(user.role))
}

/**
 * Sort users by role hierarchy
 * @param {object[]} users - Array of user objects with role property
 * @param {string} order - Sort order ('asc' or 'desc')
 * @returns {object[]} Sorted users
 */
export const sortUsersByRole = (users, order = 'desc') => {
  return users.sort((a, b) => {
    const aLevel = getRoleLevel(a.role)
    const bLevel = getRoleLevel(b.role)
    
    if (order === 'asc') {
      return aLevel - bLevel
    } else {
      return bLevel - aLevel
    }
  })
}

/**
 * Role utility constants
 */
export const ROLE_CONSTANTS = {
  HIERARCHY: ROLE_HIERARCHY,
  PERMISSIONS: ROLE_PERMISSIONS,
  ROLES: {
    ADMIN: 'admin',
    MANAGER: 'manager',
    STAFF: 'staff',
    CUSTOMER: 'customer'
  },
  DISPLAY_NAMES: {
    admin: 'Administrator',
    manager: 'Manager',
    staff: 'Staff',
    customer: 'Customer'
  },
  COLORS: {
    admin: '#dc2626',
    manager: '#2563eb',
    staff: '#059669',
    customer: '#7c3aed'
  },
  ICONS: {
    admin: 'shield-check',
    manager: 'user-tie',
    staff: 'user',
    customer: 'user-circle'
  }
}

export default {
  getRoleLevel,
  hasRoleLevel,
  hasRole,
  hasAnyRole,
  hasAllRoles,
  getRolePermissions,
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  getAllRoles,
  getHigherRoles,
  getLowerRoles,
  getEqualOrLowerRoles,
  getEqualOrHigherRoles,
  canManageRole,
  getRoleDisplayName,
  getRoleDescription,
  getRoleColor,
  getRoleIcon,
  isValidRole,
  getRoleStatistics,
  getRoleDistribution,
  filterUsersByRole,
  sortUsersByRole,
  ROLE_CONSTANTS
}
