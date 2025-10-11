// Staff Roles
export const STAFF_ROLES = {
  MANAGER: 'manager',
  SENIOR_STYLIST: 'senior_stylist',
  STYLIST: 'stylist',
  JUNIOR_STYLIST: 'junior_stylist',
  BARBER: 'barber',
  MASSAGE_THERAPIST: 'massage_therapist',
  ESTHETICIAN: 'esthetician',
  NAIL_TECHNICIAN: 'nail_technician',
  TRAINER: 'trainer',
  RECEPTIONIST: 'receptionist',
  CLEANER: 'cleaner',
  OTHER: 'other',
}

// Staff role display names
export const STAFF_ROLE_DISPLAY_NAMES = {
  [STAFF_ROLES.MANAGER]: 'Manager',
  [STAFF_ROLES.SENIOR_STYLIST]: 'Senior Stylist',
  [STAFF_ROLES.STYLIST]: 'Stylist',
  [STAFF_ROLES.JUNIOR_STYLIST]: 'Junior Stylist',
  [STAFF_ROLES.BARBER]: 'Barber',
  [STAFF_ROLES.MASSAGE_THERAPIST]: 'Massage Therapist',
  [STAFF_ROLES.ESTHETICIAN]: 'Esthetician',
  [STAFF_ROLES.NAIL_TECHNICIAN]: 'Nail Technician',
  [STAFF_ROLES.TRAINER]: 'Fitness Trainer',
  [STAFF_ROLES.RECEPTIONIST]: 'Receptionist',
  [STAFF_ROLES.CLEANER]: 'Cleaner',
  [STAFF_ROLES.OTHER]: 'Other',
}

// Staff role hierarchy (higher number = higher level)
export const STAFF_ROLE_HIERARCHY = {
  [STAFF_ROLES.MANAGER]: 5,
  [STAFF_ROLES.SENIOR_STYLIST]: 4,
  [STAFF_ROLES.STYLIST]: 3,
  [STAFF_ROLES.BARBER]: 3,
  [STAFF_ROLES.MASSAGE_THERAPIST]: 3,
  [STAFF_ROLES.ESTHETICIAN]: 3,
  [STAFF_ROLES.NAIL_TECHNICIAN]: 3,
  [STAFF_ROLES.TRAINER]: 3,
  [STAFF_ROLES.JUNIOR_STYLIST]: 2,
  [STAFF_ROLES.RECEPTIONIST]: 2,
  [STAFF_ROLES.CLEANER]: 1,
  [STAFF_ROLES.OTHER]: 1,
}

// Staff role descriptions
export const STAFF_ROLE_DESCRIPTIONS = {
  [STAFF_ROLES.MANAGER]: 'Oversees business operations and staff management',
  [STAFF_ROLES.SENIOR_STYLIST]: 'Experienced stylist with advanced skills',
  [STAFF_ROLES.STYLIST]: 'Professional hair styling and cutting services',
  [STAFF_ROLES.JUNIOR_STYLIST]: 'Entry-level stylist learning the craft',
  [STAFF_ROLES.BARBER]: 'Specialized in men\'s grooming and haircuts',
  [STAFF_ROLES.MASSAGE_THERAPIST]: 'Therapeutic massage and wellness services',
  [STAFF_ROLES.ESTHETICIAN]: 'Skin care and beauty treatments',
  [STAFF_ROLES.NAIL_TECHNICIAN]: 'Manicure, pedicure, and nail art services',
  [STAFF_ROLES.TRAINER]: 'Fitness training and exercise guidance',
  [STAFF_ROLES.RECEPTIONIST]: 'Front desk and customer service',
  [STAFF_ROLES.CLEANER]: 'Maintenance and cleaning services',
  [STAFF_ROLES.OTHER]: 'Other specialized roles',
}

// Staff role categories
export const STAFF_ROLE_CATEGORIES = {
  MANAGEMENT: 'management',
  SERVICE_PROVIDER: 'service_provider',
  SUPPORT: 'support',
  OTHER: 'other',
}

// Staff role to category mapping
export const STAFF_ROLE_CATEGORY_MAPPING = {
  [STAFF_ROLES.MANAGER]: STAFF_ROLE_CATEGORIES.MANAGEMENT,
  [STAFF_ROLES.SENIOR_STYLIST]: STAFF_ROLE_CATEGORIES.SERVICE_PROVIDER,
  [STAFF_ROLES.STYLIST]: STAFF_ROLE_CATEGORIES.SERVICE_PROVIDER,
  [STAFF_ROLES.JUNIOR_STYLIST]: STAFF_ROLE_CATEGORIES.SERVICE_PROVIDER,
  [STAFF_ROLES.BARBER]: STAFF_ROLE_CATEGORIES.SERVICE_PROVIDER,
  [STAFF_ROLES.MASSAGE_THERAPIST]: STAFF_ROLE_CATEGORIES.SERVICE_PROVIDER,
  [STAFF_ROLES.ESTHETICIAN]: STAFF_ROLE_CATEGORIES.SERVICE_PROVIDER,
  [STAFF_ROLES.NAIL_TECHNICIAN]: STAFF_ROLE_CATEGORIES.SERVICE_PROVIDER,
  [STAFF_ROLES.TRAINER]: STAFF_ROLE_CATEGORIES.SERVICE_PROVIDER,
  [STAFF_ROLES.RECEPTIONIST]: STAFF_ROLE_CATEGORIES.SUPPORT,
  [STAFF_ROLES.CLEANER]: STAFF_ROLE_CATEGORIES.SUPPORT,
  [STAFF_ROLES.OTHER]: STAFF_ROLE_CATEGORIES.OTHER,
}

// Staff role icons
export const STAFF_ROLE_ICONS = {
  [STAFF_ROLES.MANAGER]: 'user-tie',
  [STAFF_ROLES.SENIOR_STYLIST]: 'crown',
  [STAFF_ROLES.STYLIST]: 'scissors',
  [STAFF_ROLES.JUNIOR_STYLIST]: 'user-graduate',
  [STAFF_ROLES.BARBER]: 'cut',
  [STAFF_ROLES.MASSAGE_THERAPIST]: 'hands',
  [STAFF_ROLES.ESTHETICIAN]: 'spa',
  [STAFF_ROLES.NAIL_TECHNICIAN]: 'hand-paper',
  [STAFF_ROLES.TRAINER]: 'dumbbell',
  [STAFF_ROLES.RECEPTIONIST]: 'headset',
  [STAFF_ROLES.CLEANER]: 'broom',
  [STAFF_ROLES.OTHER]: 'user',
}

// Staff role colors
export const STAFF_ROLE_COLORS = {
  [STAFF_ROLES.MANAGER]: 'red',
  [STAFF_ROLES.SENIOR_STYLIST]: 'purple',
  [STAFF_ROLES.STYLIST]: 'blue',
  [STAFF_ROLES.JUNIOR_STYLIST]: 'green',
  [STAFF_ROLES.BARBER]: 'orange',
  [STAFF_ROLES.MASSAGE_THERAPIST]: 'teal',
  [STAFF_ROLES.ESTHETICIAN]: 'pink',
  [STAFF_ROLES.NAIL_TECHNICIAN]: 'yellow',
  [STAFF_ROLES.TRAINER]: 'indigo',
  [STAFF_ROLES.RECEPTIONIST]: 'cyan',
  [STAFF_ROLES.CLEANER]: 'gray',
  [STAFF_ROLES.OTHER]: 'gray',
}

// Available staff roles for selection
export const AVAILABLE_STAFF_ROLES = Object.values(STAFF_ROLES).map(role => ({
  value: role,
  label: STAFF_ROLE_DISPLAY_NAMES[role],
  description: STAFF_ROLE_DESCRIPTIONS[role],
  category: STAFF_ROLE_CATEGORY_MAPPING[role],
  icon: STAFF_ROLE_ICONS[role],
  color: STAFF_ROLE_COLORS[role],
  hierarchy: STAFF_ROLE_HIERARCHY[role],
}))

export default {
  STAFF_ROLES,
  STAFF_ROLE_DISPLAY_NAMES,
  STAFF_ROLE_HIERARCHY,
  STAFF_ROLE_DESCRIPTIONS,
  STAFF_ROLE_CATEGORIES,
  STAFF_ROLE_CATEGORY_MAPPING,
  STAFF_ROLE_ICONS,
  STAFF_ROLE_COLORS,
  AVAILABLE_STAFF_ROLES,
}
