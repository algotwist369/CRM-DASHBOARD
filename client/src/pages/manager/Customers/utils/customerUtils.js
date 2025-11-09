const toNumber = (value, fallback = 0) => {
  const numeric = Number(value)
  return Number.isFinite(numeric) ? numeric : fallback
}

export const formatCurrency = (amount = 0, fallback = '₹0') => {
  const numeric = toNumber(amount, null)
  if (numeric === null) return fallback

  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(numeric)
}

export const formatNumber = (value = 0, options = {}) => {
  if (value === null || value === undefined) return '0'
  return toNumber(value, 0).toLocaleString('en-IN', options)
}

export const formatDate = (dateInput, fallback = '—', options = {}) => {
  if (!dateInput) return fallback
  const date = new Date(dateInput)
  if (Number.isNaN(date.getTime())) return fallback

  return date.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    ...options
  })
}

export const formatDateTime = (dateInput, fallback = '—', options = {}) => {
  if (!dateInput) return fallback
  const date = new Date(dateInput)
  if (Number.isNaN(date.getTime())) return fallback

  return date.toLocaleString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    ...options
  })
}

const SEGMENT_META = {
  new: {
    label: 'New Customers',
    description: 'First visit customers',
    color: 'bg-blue-100 text-blue-800'
  },
  returning: {
    label: 'Returning Customers',
    description: 'Multiple visits recorded',
    color: 'bg-green-100 text-green-800'
  },
  loyal: {
    label: 'Loyal Customers',
    description: 'Frequent high-value customers',
    color: 'bg-purple-100 text-purple-800'
  },
  vip: {
    label: 'VIP Customers',
    description: 'Premium membership customers',
    color: 'bg-yellow-100 text-yellow-800'
  },
  highValue: {
    label: 'High Value Customers',
    description: 'Spent ₹5,000 or more',
    color: 'bg-amber-100 text-amber-800'
  },
  recent: {
    label: 'Recent Customers',
    description: 'Visited in the last 30 days',
    color: 'bg-indigo-100 text-indigo-800'
  },
  inactive: {
    label: 'Inactive Customers',
    description: 'No visit in last 90 days',
    color: 'bg-red-100 text-red-800'
  },
  regular: {
    label: 'Regular Customers',
    description: 'Consistent visit frequency',
    color: 'bg-gray-100 text-gray-800'
  },
  at_risk: {
    label: 'At Risk',
    description: 'Haven’t visited recently',
    color: 'bg-orange-100 text-orange-800'
  }
}

const SEGMENT_ORDER = ['new', 'returning', 'loyal', 'vip', 'highValue', 'recent', 'inactive', 'regular', 'at_risk']

export const formatPercentage = (value, digits = 1, fallback = '0%') => {
  const numeric = toNumber(value, null)
  if (numeric === null) return fallback
  return `${numeric.toFixed(digits)}%`
}

export const deriveSegmentDetails = ({ customerType, totalVisits = 0, totalSpent = 0, lastVisit = null, isActive = true }) => {
  const key = (customerType || '').toLowerCase()
  if (SEGMENT_META[key]) {
    const { label, color, description } = SEGMENT_META[key]
    return { key, label, color, description }
  }

  if (!isActive) {
    const meta = SEGMENT_META.inactive
    return { key: 'inactive', ...meta }
  }

  if (totalVisits <= 1) {
    const meta = SEGMENT_META.new
    return { key: 'new', ...meta }
  }

  if (totalVisits >= 5 || totalSpent >= 50000) {
    const meta = SEGMENT_META.loyal
    return { key: 'loyal', ...meta }
  }

  if (lastVisit) {
    const daysSince = Math.floor((Date.now() - new Date(lastVisit).getTime()) / (1000 * 60 * 60 * 24))
    if (Number.isFinite(daysSince) && daysSince > 90) {
      const meta = SEGMENT_META.at_risk
      return { key: 'at_risk', ...meta }
    }
  }

  const meta = SEGMENT_META.regular
  return { key: 'regular', ...meta }
}

const extractNameParts = (raw) => {
  const firstName = raw.firstName || ''
  const lastName = raw.lastName || ''

  if (firstName || lastName) {
    return {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      fullName: `${firstName} ${lastName}`.trim()
    }
  }

  const fullName = raw.fullName || raw.name || ''
  const [first = '', ...rest] = fullName.split(' ')
  return {
    firstName: first.trim(),
    lastName: rest.join(' ').trim(),
    fullName: fullName.trim() || 'Unnamed Customer'
  }
}

export const normalizeCustomerRecord = (raw = {}) => {
  if (!raw) return null

  const { firstName, lastName, fullName } = extractNameParts(raw)
  const totalVisits = toNumber(raw.totalVisits ?? raw.stats?.totalVisits ?? 0)
  const totalSpent = toNumber(raw.totalSpent ?? raw.stats?.totalSpent ?? 0)
  const averageSpent = toNumber(raw.averageSpent ?? raw.stats?.averageSpent ?? (totalVisits ? totalSpent / Math.max(totalVisits, 1) : 0))
  const lastVisit = raw.lastVisit ?? raw.stats?.lastVisit ?? null
  const loyaltyPoints = toNumber(raw.loyaltyPoints ?? raw.stats?.loyaltyPoints ?? 0)
  const averageRating = toNumber(raw.averageRating ?? raw.ratings?.average ?? raw.stats?.averageRating ?? 0)

  const segment = deriveSegmentDetails({
    customerType: raw.customerType,
    totalVisits,
    totalSpent,
    lastVisit,
    isActive: raw.isActive ?? true
  })

  return {
    id: raw.id || raw._id || null,
    firstName,
    lastName,
    name: fullName,
    email: raw.email || raw.contactEmail || '',
    phone: raw.phone || raw.contactPhone || '',
    customerType: raw.customerType || segment.key,
    loyaltyPoints,
    membershipTier: raw.membershipTier || 'none',
    tags: raw.tags || [],
    isActive: raw.isActive !== undefined ? raw.isActive : true,
    isBlacklisted: raw.isBlacklisted || false,
    blacklistReason: raw.blacklistReason || '',
    totalVisits,
    totalSpent,
    averageSpent,
    averageRating,
    lastVisit,
    firstVisit: raw.firstVisit || null,
    createdAt: raw.createdAt || null,
    updatedAt: raw.updatedAt || null,
    segmentKey: segment.key,
    segmentLabel: segment.label,
    segmentDescription: segment.description,
    segmentColor: segment.color
  }
}

export const normalizeCustomerCollection = (customers = []) =>
  customers
    .map(normalizeCustomerRecord)
    .filter(Boolean)

const mapPreferredServices = (services = []) =>
  services
    .map((service) => {
      if (!service) return null
      if (typeof service === 'string') return service
      return service.name || service.serviceName || service.title || null
    })
    .filter(Boolean)

const mapPreferredStaff = (staffMembers = []) =>
  staffMembers
    .map((staff) => {
      if (!staff) return null
      if (typeof staff === 'string') {
        return { id: staff, name: staff }
      }

      return {
        id: staff._id || staff.id || null,
        name: staff.name || '',
        role: staff.role || '',
        phone: staff.phone || ''
      }
    })
    .filter(Boolean)

export const normalizeTargetCustomerRecords = (customers = []) =>
  customers.map((customer) => {
    const base = normalizeCustomerRecord(customer)
    if (!base) return null

    return {
      ...base,
      preferences: {
        preferredServices: mapPreferredServices(customer.preferences?.preferredServices),
        preferredTimeSlots: customer.preferences?.preferredTimeSlots || []
      },
      address: {
        street: customer.address?.street || '',
        city: customer.address?.city || '',
        state: customer.address?.state || '',
        pincode: customer.address?.pincode || customer.address?.zipCode || ''
      }
    }
  }).filter(Boolean)

export const normalizeCustomerDetails = (raw = {}) => {
  const base = normalizeCustomerRecord(raw) || {}
  const address = {
    street: raw.address?.street || '',
    city: raw.address?.city || '',
    state: raw.address?.state || '',
    country: raw.address?.country || '',
    pincode: raw.address?.zipCode || raw.address?.pincode || ''
  }

  const preferences = {
    preferredServices: mapPreferredServices(raw.preferences?.preferredServices),
    preferredTimeSlots: raw.preferences?.preferredTimeSlots || [],
    preferredStaff: mapPreferredStaff(raw.preferences?.preferredStaff),
    specialRequests: raw.preferences?.specialRequests || ''
  }

  return {
    ...base,
    firstName: base.firstName || raw.firstName || '',
    lastName: base.lastName || raw.lastName || '',
    email: base.email,
    phone: base.phone,
    dateOfBirth: raw.dateOfBirth || null,
    gender: raw.gender || '',
    anniversary: raw.anniversary || null,
    source: raw.source || '',
    notes: raw.notes || '',
    marketingConsent: raw.marketingConsent || {},
    emergencyContact: raw.emergencyContact || null,
    address,
    preferences,
    membershipStartDate: raw.membershipStartDate || null,
    membershipExpiryDate: raw.membershipExpiryDate || null,
    metrics: {
      totalVisits: base.totalVisits || 0,
      totalSpent: base.totalSpent || 0,
      averageSpent: base.averageSpent || 0,
      loyaltyPoints: base.loyaltyPoints || 0,
      averageRating: base.averageRating || 0,
      lastVisit: base.lastVisit || null,
      firstVisit: base.firstVisit || null
    }
  }
}

export const buildCustomerTypeFilterOptions = (customers = []) => {
  const options = new Map()
  customers.forEach((customer) => {
    if (!customer?.segmentKey) return
    if (!options.has(customer.segmentKey)) {
      options.set(customer.segmentKey, {
        value: customer.segmentKey,
        label: customer.segmentLabel
      })
    }
  })

  if (options.size === 0) {
    return [
      { value: '', label: 'All Customer Types' },
      { value: 'new', label: SEGMENT_META.new.label },
      { value: 'returning', label: SEGMENT_META.returning.label },
      { value: 'loyal', label: SEGMENT_META.loyal.label },
      { value: 'vip', label: SEGMENT_META.vip.label },
      { value: 'inactive', label: SEGMENT_META.inactive.label }
    ]
  }

  return [{ value: '', label: 'All Customer Types' }, ...Array.from(options.values())]
}

export const normalizeSegmentCounts = (segments = []) => {
  const counts = {}
  const addCount = (key, value) => {
    if (!key) return
    const normalizedKey = key.toLowerCase()
    counts[normalizedKey] = (counts[normalizedKey] || 0) + toNumber(value, 0)
  }

  if (Array.isArray(segments)) {
    segments.forEach((item) => addCount(item?._id || item?.segment || item?.type, item?.count))
  } else if (Array.isArray(segments.segmentation)) {
    segments.segmentation.forEach((item) => addCount(item?._id || item?.segment || item?.type, item?.count))
  } else if (segments.data && Array.isArray(segments.data.segmentation)) {
    segments.data.segmentation.forEach((item) => addCount(item?._id || item?.segment || item?.type, item?.count))
  } else {
    Object.entries(segments || {}).forEach(([key, value]) => {
      if (typeof value === 'number') {
        addCount(key, value)
      }
    })
  }

  const normalized = {}
  SEGMENT_ORDER.forEach((key) => {
    normalized[key] = toNumber(counts[key], 0)
  })

  return normalized
}

export const normalizeCustomerAnalyticsResponse = (raw = {}) => {
  const segments = normalizeSegmentCounts(raw.segments || raw)
  const segmentationArray = Array.isArray(raw.segmentation)
    ? raw.segmentation
    : Array.isArray(raw.data?.segmentation)
      ? raw.data.segmentation
      : []

  const segmentationDetails = segmentationArray.map((segment) => {
    const key = (segment._id || segment.segment || segment.type || '').toLowerCase()
    const meta = SEGMENT_META[key] || { label: key }

    return {
      key,
      label: meta.label || key,
      description: meta.description || '',
      count: toNumber(segment.count, 0),
      totalSpent: toNumber(segment.totalSpent, segment.revenue || 0),
      averageSpent: toNumber(segment.averageSpent, 0),
      totalVisits: toNumber(segment.totalVisits, 0)
    }
  })

  return {
    overview: {
      totalCustomers: toNumber(raw.overview?.totalCustomers, 0),
      newCustomers: toNumber(raw.overview?.newCustomers, segments.new),
      returningCustomers: toNumber(raw.overview?.returningCustomers, segments.returning),
      loyalCustomers: toNumber(raw.overview?.loyalCustomers, segments.loyal),
      inactiveCustomers: toNumber(raw.overview?.inactiveCustomers, segments.inactive)
    },
    segments,
    lifecycle: {
      avgFirstVisit: toNumber(raw.lifecycle?.avgFirstVisit, 0),
      avgTotalSpent: toNumber(raw.lifecycle?.avgTotalSpent, 0),
      avgLoyaltyPoints: toNumber(raw.lifecycle?.avgLoyaltyPoints, 0),
      avgRating: toNumber(raw.lifecycle?.avgRating, 0),
      totalRevenue: toNumber(raw.lifecycle?.totalRevenue, 0)
    },
    value: {
      avgFirstVisit: toNumber(raw.value?.avgFirstVisit, 0),
      avgTotalSpent: toNumber(raw.value?.avgTotalSpent, 0),
      totalRevenue: toNumber(raw.value?.totalRevenue, 0),
      avgRating: toNumber(raw.value?.avgRating, 0),
      avgLoyaltyPoints: toNumber(raw.value?.avgLoyaltyPoints, 0),
      topCustomers: Array.isArray(raw.value?.topCustomers) ? raw.value.topCustomers : [],
      valueDistribution: raw.value?.valueDistribution || {},
      averageValue: toNumber(raw.value?.averageValue, 0)
    },
    retention: {
      last30Days: toNumber(raw.retention?.last30Days, 0),
      last60Days: toNumber(raw.retention?.last60Days, 0),
      last90Days: toNumber(raw.retention?.last90Days, 0),
      over90Days: toNumber(raw.retention?.over90Days, 0)
    },
    preferences: {
      preferredServices: Array.isArray(raw.preferences?.preferredServices) ? raw.preferences.preferredServices : [],
      genderDistribution: Array.isArray(raw.preferences?.genderDistribution) ? raw.preferences.genderDistribution : []
    },
    growth: Array.isArray(raw.growth) ? raw.growth : [],
    segmentationDetails
  }
}

export const normalizeCustomerInsightsPayload = (raw = {}) => {
  const analytics = normalizeCustomerAnalyticsResponse(raw.analytics || {})
  const insights = Array.isArray(raw.insights) ? raw.insights : []
  const recommendations = Array.isArray(raw.recommendations) ? raw.recommendations : []

  return {
    insights,
    recommendations,
    analytics
  }
}

export const mapTimeline = (timeline = []) =>
  Array.isArray(timeline)
    ? timeline.map((item) => ({
        ...item,
        date: item.date || item.createdAt || null,
        type: item.type || (item.category === 'transaction' ? 'transaction' : 'appointment'),
        title: item.title || item.name || 'Timeline Event',
        description: item.description || item.details || ''
      }))
    : []

export { SEGMENT_META, SEGMENT_ORDER }
