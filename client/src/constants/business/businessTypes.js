// Business Types
export const BUSINESS_TYPES = {
  SALON: 'salon',
  BARBERSHOP: 'barbershop',
  SPA: 'spa',
  MASSAGE: 'massage',
  NAIL_SALON: 'nail_salon',
  FITNESS: 'fitness',
  MEDICAL: 'medical',
  DENTAL: 'dental',
  VETERINARY: 'veterinary',
  CONSULTING: 'consulting',
  EDUCATION: 'education',
  OTHER: 'other',
}

// Business type display names
export const BUSINESS_TYPE_DISPLAY_NAMES = {
  [BUSINESS_TYPES.SALON]: 'Hair Salon',
  [BUSINESS_TYPES.BARBERSHOP]: 'Barbershop',
  [BUSINESS_TYPES.SPA]: 'Spa & Wellness',
  [BUSINESS_TYPES.MASSAGE]: 'Massage Therapy',
  [BUSINESS_TYPES.NAIL_SALON]: 'Nail Salon',
  [BUSINESS_TYPES.FITNESS]: 'Fitness Center',
  [BUSINESS_TYPES.MEDICAL]: 'Medical Clinic',
  [BUSINESS_TYPES.DENTAL]: 'Dental Clinic',
  [BUSINESS_TYPES.VETERINARY]: 'Veterinary Clinic',
  [BUSINESS_TYPES.CONSULTING]: 'Consulting Services',
  [BUSINESS_TYPES.EDUCATION]: 'Educational Services',
  [BUSINESS_TYPES.OTHER]: 'Other',
}

// Business type descriptions
export const BUSINESS_TYPE_DESCRIPTIONS = {
  [BUSINESS_TYPES.SALON]: 'Hair styling, coloring, and beauty services',
  [BUSINESS_TYPES.BARBERSHOP]: 'Men\'s grooming and hair services',
  [BUSINESS_TYPES.SPA]: 'Relaxation and wellness treatments',
  [BUSINESS_TYPES.MASSAGE]: 'Therapeutic massage services',
  [BUSINESS_TYPES.NAIL_SALON]: 'Manicure, pedicure, and nail art services',
  [BUSINESS_TYPES.FITNESS]: 'Exercise and fitness training services',
  [BUSINESS_TYPES.MEDICAL]: 'General medical and health services',
  [BUSINESS_TYPES.DENTAL]: 'Dental care and oral health services',
  [BUSINESS_TYPES.VETERINARY]: 'Animal health and care services',
  [BUSINESS_TYPES.CONSULTING]: 'Professional consulting and advisory services',
  [BUSINESS_TYPES.EDUCATION]: 'Educational and training services',
  [BUSINESS_TYPES.OTHER]: 'Other types of service businesses',
}

// Business type icons
export const BUSINESS_TYPE_ICONS = {
  [BUSINESS_TYPES.SALON]: 'scissors',
  [BUSINESS_TYPES.BARBERSHOP]: 'user-tie',
  [BUSINESS_TYPES.SPA]: 'leaf',
  [BUSINESS_TYPES.MASSAGE]: 'hands',
  [BUSINESS_TYPES.NAIL_SALON]: 'hand-paper',
  [BUSINESS_TYPES.FITNESS]: 'dumbbell',
  [BUSINESS_TYPES.MEDICAL]: 'stethoscope',
  [BUSINESS_TYPES.DENTAL]: 'tooth',
  [BUSINESS_TYPES.VETERINARY]: 'paw',
  [BUSINESS_TYPES.CONSULTING]: 'briefcase',
  [BUSINESS_TYPES.EDUCATION]: 'graduation-cap',
  [BUSINESS_TYPES.OTHER]: 'building',
}

// Business type colors
export const BUSINESS_TYPE_COLORS = {
  [BUSINESS_TYPES.SALON]: 'pink',
  [BUSINESS_TYPES.BARBERSHOP]: 'blue',
  [BUSINESS_TYPES.SPA]: 'green',
  [BUSINESS_TYPES.MASSAGE]: 'purple',
  [BUSINESS_TYPES.NAIL_SALON]: 'red',
  [BUSINESS_TYPES.FITNESS]: 'orange',
  [BUSINESS_TYPES.MEDICAL]: 'teal',
  [BUSINESS_TYPES.DENTAL]: 'cyan',
  [BUSINESS_TYPES.VETERINARY]: 'brown',
  [BUSINESS_TYPES.CONSULTING]: 'indigo',
  [BUSINESS_TYPES.EDUCATION]: 'yellow',
  [BUSINESS_TYPES.OTHER]: 'gray',
}

// Available business types for selection
export const AVAILABLE_BUSINESS_TYPES = Object.values(BUSINESS_TYPES).map(type => ({
  value: type,
  label: BUSINESS_TYPE_DISPLAY_NAMES[type],
  description: BUSINESS_TYPE_DESCRIPTIONS[type],
  icon: BUSINESS_TYPE_ICONS[type],
  color: BUSINESS_TYPE_COLORS[type],
}))

export default {
  BUSINESS_TYPES,
  BUSINESS_TYPE_DISPLAY_NAMES,
  BUSINESS_TYPE_DESCRIPTIONS,
  BUSINESS_TYPE_ICONS,
  BUSINESS_TYPE_COLORS,
  AVAILABLE_BUSINESS_TYPES,
}