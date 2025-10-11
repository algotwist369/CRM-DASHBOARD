// Permission constants
export const PERMISSIONS = {
  // Admin permissions
  ADMIN_DASHBOARD: 'admin:dashboard',
  MANAGE_BUSINESSES: 'admin:businesses:manage',
  MANAGE_MANAGERS: 'admin:managers:manage',
  VIEW_ALL_DATA: 'admin:data:view',
  SYSTEM_SETTINGS: 'admin:settings:manage',

  // Manager permissions
  MANAGER_DASHBOARD: 'manager:dashboard',
  MANAGE_STAFF: 'manager:staff:manage',
  MANAGE_CUSTOMERS: 'manager:customers:manage',
  MANAGE_APPOINTMENTS: 'manager:appointments:manage',
  MANAGE_TRANSACTIONS: 'manager:transactions:manage',
  VIEW_REPORTS: 'manager:reports:view',
  MANAGE_NOTIFICATIONS: 'manager:notifications:manage',
  BUSINESS_SETTINGS: 'manager:settings:manage',

  // Staff permissions
  STAFF_DASHBOARD: 'staff:dashboard',
  VIEW_CUSTOMERS: 'staff:customers:view',
  MANAGE_OWN_APPOINTMENTS: 'staff:appointments:own',
  VIEW_OWN_PROFILE: 'staff:profile:view',
  UPDATE_OWN_PROFILE: 'staff:profile:update',

  // Customer permissions
  BOOK_APPOINTMENTS: 'customer:appointments:book',
  VIEW_OWN_APPOINTMENTS: 'customer:appointments:view',
  CANCEL_OWN_APPOINTMENTS: 'customer:appointments:cancel',
  VIEW_OWN_PROFILE: 'customer:profile:view',
  UPDATE_OWN_PROFILE: 'customer:profile:update',
}

// Role-based permissions mapping
export const ROLE_PERMISSIONS = {
  admin: [
    PERMISSIONS.ADMIN_DASHBOARD,
    PERMISSIONS.MANAGE_BUSINESSES,
    PERMISSIONS.MANAGE_MANAGERS,
    PERMISSIONS.VIEW_ALL_DATA,
    PERMISSIONS.SYSTEM_SETTINGS,
    PERMISSIONS.MANAGER_DASHBOARD,
    PERMISSIONS.MANAGE_STAFF,
    PERMISSIONS.MANAGE_CUSTOMERS,
    PERMISSIONS.MANAGE_APPOINTMENTS,
    PERMISSIONS.MANAGE_TRANSACTIONS,
    PERMISSIONS.VIEW_REPORTS,
    PERMISSIONS.MANAGE_NOTIFICATIONS,
    PERMISSIONS.BUSINESS_SETTINGS,
    PERMISSIONS.STAFF_DASHBOARD,
    PERMISSIONS.VIEW_CUSTOMERS,
    PERMISSIONS.MANAGE_OWN_APPOINTMENTS,
    PERMISSIONS.VIEW_OWN_PROFILE,
    PERMISSIONS.UPDATE_OWN_PROFILE,
  ],
  manager: [
    PERMISSIONS.MANAGER_DASHBOARD,
    PERMISSIONS.MANAGE_STAFF,
    PERMISSIONS.MANAGE_CUSTOMERS,
    PERMISSIONS.MANAGE_APPOINTMENTS,
    PERMISSIONS.MANAGE_TRANSACTIONS,
    PERMISSIONS.VIEW_REPORTS,
    PERMISSIONS.MANAGE_NOTIFICATIONS,
    PERMISSIONS.BUSINESS_SETTINGS,
    PERMISSIONS.STAFF_DASHBOARD,
    PERMISSIONS.VIEW_CUSTOMERS,
    PERMISSIONS.MANAGE_OWN_APPOINTMENTS,
    PERMISSIONS.VIEW_OWN_PROFILE,
    PERMISSIONS.UPDATE_OWN_PROFILE,
  ],
  staff: [
    PERMISSIONS.STAFF_DASHBOARD,
    PERMISSIONS.VIEW_CUSTOMERS,
    PERMISSIONS.MANAGE_OWN_APPOINTMENTS,
    PERMISSIONS.VIEW_OWN_PROFILE,
    PERMISSIONS.UPDATE_OWN_PROFILE,
  ],
  customer: [
    PERMISSIONS.BOOK_APPOINTMENTS,
    PERMISSIONS.VIEW_OWN_APPOINTMENTS,
    PERMISSIONS.CANCEL_OWN_APPOINTMENTS,
    PERMISSIONS.VIEW_OWN_PROFILE,
    PERMISSIONS.UPDATE_OWN_PROFILE,
  ],
}

// Permission categories
export const PERMISSION_CATEGORIES = {
  DASHBOARD: 'dashboard',
  MANAGEMENT: 'management',
  VIEW: 'view',
  SETTINGS: 'settings',
  PROFILE: 'profile',
}

// Permission descriptions
export const PERMISSION_DESCRIPTIONS = {
  [PERMISSIONS.ADMIN_DASHBOARD]: 'Access to admin dashboard',
  [PERMISSIONS.MANAGE_BUSINESSES]: 'Create, update, and delete businesses',
  [PERMISSIONS.MANAGE_MANAGERS]: 'Create, update, and delete managers',
  [PERMISSIONS.VIEW_ALL_DATA]: 'View all system data',
  [PERMISSIONS.SYSTEM_SETTINGS]: 'Manage system-wide settings',
  [PERMISSIONS.MANAGER_DASHBOARD]: 'Access to manager dashboard',
  [PERMISSIONS.MANAGE_STAFF]: 'Create, update, and delete staff members',
  [PERMISSIONS.MANAGE_CUSTOMERS]: 'Create, update, and delete customers',
  [PERMISSIONS.MANAGE_APPOINTMENTS]: 'Create, update, and delete appointments',
  [PERMISSIONS.MANAGE_TRANSACTIONS]: 'Create, update, and delete transactions',
  [PERMISSIONS.VIEW_REPORTS]: 'View business reports and analytics',
  [PERMISSIONS.MANAGE_NOTIFICATIONS]: 'Create and manage notifications',
  [PERMISSIONS.BUSINESS_SETTINGS]: 'Manage business settings',
  [PERMISSIONS.STAFF_DASHBOARD]: 'Access to staff dashboard',
  [PERMISSIONS.VIEW_CUSTOMERS]: 'View customer information',
  [PERMISSIONS.MANAGE_OWN_APPOINTMENTS]: 'Manage own appointments',
  [PERMISSIONS.VIEW_OWN_PROFILE]: 'View own profile',
  [PERMISSIONS.UPDATE_OWN_PROFILE]: 'Update own profile',
  [PERMISSIONS.BOOK_APPOINTMENTS]: 'Book new appointments',
  [PERMISSIONS.VIEW_OWN_APPOINTMENTS]: 'View own appointments',
  [PERMISSIONS.CANCEL_OWN_APPOINTMENTS]: 'Cancel own appointments',
}

export default {
  PERMISSIONS,
  ROLE_PERMISSIONS,
  PERMISSION_CATEGORIES,
  PERMISSION_DESCRIPTIONS,
}
