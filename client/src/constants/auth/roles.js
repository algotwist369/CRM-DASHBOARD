// User Roles
export const USER_ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  STAFF: 'staff',
  CUSTOMER: 'customer',
}

// Role hierarchy (higher number = higher privilege)
export const ROLE_HIERARCHY = {
  [USER_ROLES.ADMIN]: 4,
  [USER_ROLES.MANAGER]: 3,
  [USER_ROLES.STAFF]: 2,
  [USER_ROLES.CUSTOMER]: 1,
}

// Role display names
export const ROLE_DISPLAY_NAMES = {
  [USER_ROLES.ADMIN]: 'Administrator',
  [USER_ROLES.MANAGER]: 'Manager',
  [USER_ROLES.STAFF]: 'Staff Member',
  [USER_ROLES.CUSTOMER]: 'Customer',
}

// Role descriptions
export const ROLE_DESCRIPTIONS = {
  [USER_ROLES.ADMIN]: 'Full system access and management capabilities',
  [USER_ROLES.MANAGER]: 'Business management and staff oversight',
  [USER_ROLES.STAFF]: 'Service delivery and customer interaction',
  [USER_ROLES.CUSTOMER]: 'Appointment booking and service access',
}

// Role colors for UI
export const ROLE_COLORS = {
  [USER_ROLES.ADMIN]: 'red',
  [USER_ROLES.MANAGER]: 'blue',
  [USER_ROLES.STAFF]: 'green',
  [USER_ROLES.CUSTOMER]: 'gray',
}

// Available roles for selection
export const AVAILABLE_ROLES = [
  { value: USER_ROLES.ADMIN, label: ROLE_DISPLAY_NAMES[USER_ROLES.ADMIN] },
  { value: USER_ROLES.MANAGER, label: ROLE_DISPLAY_NAMES[USER_ROLES.MANAGER] },
  { value: USER_ROLES.STAFF, label: ROLE_DISPLAY_NAMES[USER_ROLES.STAFF] },
  { value: USER_ROLES.CUSTOMER, label: ROLE_DISPLAY_NAMES[USER_ROLES.CUSTOMER] },
]

export default {
  USER_ROLES,
  ROLE_HIERARCHY,
  ROLE_DISPLAY_NAMES,
  ROLE_DESCRIPTIONS,
  ROLE_COLORS,
  AVAILABLE_ROLES,
}