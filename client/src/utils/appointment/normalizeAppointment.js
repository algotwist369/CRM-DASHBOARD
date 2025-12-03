  const appointmentDateObj = raw.appointmentDate ? new Date(raw.appointmentDate) : null
  const appointmentDateISO = appointmentDateObj ? appointmentDateObj.toISOString().split('T')[0] : null
const buildCustomerName = (customer = {}) => {
  const nameFromParts = [customer.firstName, customer.lastName]
    .filter(Boolean)
    .join(' ')
    .trim()

  return nameFromParts || customer.name || 'Guest Customer'
}

const normalizeServices = (raw) => {
  if (Array.isArray(raw?.services) && raw.services.length > 0) {
    return raw.services.map((service) => {
      if (typeof service === 'string') {
        return { serviceName: service }
      }

      return {
        ...service,
        serviceId: service?.serviceId || service?._id,
        serviceName: service?.serviceName || service?.name || 'Service',
        duration: service?.duration,
        price: service?.price
      }
    })
  }

  if (raw?.service) {
    const service = raw.service
    return [
      {
        serviceId: service._id,
        serviceName: service.name,
        duration: service.duration,
        price: service.price
      }
    ]
  }

  return []
}

const normalizeStaff = (staff) => {
  if (!staff) return null

  const staffName = [staff.firstName, staff.lastName].filter(Boolean).join(' ').trim()

  return {
    ...staff,
    name: staff.name || staffName || 'TBD'
  }
}

const normalizeAppointment = (raw) => {
  if (!raw || typeof raw !== 'object') return raw

  const services = normalizeServices(raw)
  const customer = raw.customer
    ? {
        ...raw.customer,
        name: buildCustomerName(raw.customer)
      }
    : { name: 'Guest Customer', phone: '', email: '' }

  const totalAmount =
    raw.totalAmount ??
    raw.totalPrice ??
    raw.finalPrice ??
    raw.servicePrice ??
    (services[0]?.price || 0)

  const appointmentDateObj = raw.appointmentDate ? new Date(raw.appointmentDate) : null
  const appointmentDateISO = appointmentDateObj ? appointmentDateObj.toISOString().split('T')[0] : null

  return {
    ...raw,
    customer,
    staff: normalizeStaff(raw.staff),
    services,
    serviceName:
      raw.serviceName ||
      services.map((service) => service.serviceName).join(', ') ||
      raw.service?.name ||
      'N/A',
    confirmationCode: raw.confirmationCode || raw.bookingNumber || null,
    bookingNumber: raw.bookingNumber || raw.confirmationCode || null,
    totalAmount,
    totalPrice:
      raw.totalPrice ??
      raw.finalPrice ??
      raw.totalAmount ??
      raw.servicePrice ??
      totalAmount,
    finalPrice:
      raw.finalPrice ??
      raw.totalAmount ??
      raw.totalPrice ??
      raw.servicePrice ??
      totalAmount,
    discount: raw.discount || 0,
    tax: raw.tax || 0,
    paymentStatus: raw.paymentStatus || 'pending',
    completionNotes: raw.completionNotes || raw.staffNotes || raw.internalNotes || '',
    appointmentDateISO,
    appointmentDateString: appointmentDateISO,
    appointmentDateObj,
    appointmentTime: raw.startTime || null,
    customerName: customer.name,
    customerPhone: customer.phone,
    staffName: raw.staff?.name || raw.staffName || null,
    duration: raw.duration || services?.[0]?.duration || null,
    status: raw.status || 'pending'
  }
}

export default normalizeAppointment

