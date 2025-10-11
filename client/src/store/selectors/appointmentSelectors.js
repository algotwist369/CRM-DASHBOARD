import { createSelector } from '@reduxjs/toolkit'

// Base selectors
const getAppointmentState = (state) => state.appointment

// Appointment selectors
export const selectAppointments = createSelector(
  [getAppointmentState],
  (appointment) => appointment.appointments
)

export const selectAppointmentsList = createSelector(
  [selectAppointments],
  (appointments) => appointments.list
)

export const selectCurrentAppointment = createSelector(
  [selectAppointments],
  (appointments) => appointments.current
)

export const selectAppointmentsLoading = createSelector(
  [selectAppointments],
  (appointments) => appointments.isLoading
)

export const selectAppointmentsError = createSelector(
  [selectAppointments],
  (appointments) => appointments.error
)

export const selectAppointmentsPagination = createSelector(
  [selectAppointments],
  (appointments) => appointments.pagination
)

// Available slots selectors
export const selectAvailableSlots = createSelector(
  [getAppointmentState],
  (appointment) => appointment.availableSlots
)

export const selectAvailableSlotsData = createSelector(
  [selectAvailableSlots],
  (slots) => slots.data
)

export const selectAvailableSlotsLoading = createSelector(
  [selectAvailableSlots],
  (slots) => slots.isLoading
)

export const selectAvailableSlotsError = createSelector(
  [selectAvailableSlots],
  (slots) => slots.error
)

// Stats selectors
export const selectAppointmentStats = createSelector(
  [getAppointmentState],
  (appointment) => appointment.stats
)

export const selectAppointmentStatsData = createSelector(
  [selectAppointmentStats],
  (stats) => stats.data
)

export const selectAppointmentStatsLoading = createSelector(
  [selectAppointmentStats],
  (stats) => stats.isLoading
)

export const selectAppointmentStatsError = createSelector(
  [selectAppointmentStats],
  (stats) => stats.error
)

// Appointment filtering selectors
export const selectAppointmentById = createSelector(
  [selectAppointmentsList],
  (appointments) => (id) => appointments.find(appointment => appointment.id === id)
)

export const selectAppointmentsByStatus = createSelector(
  [selectAppointmentsList],
  (appointments) => (status) => appointments.filter(appointment => appointment.status === status)
)

export const selectAppointmentsByDate = createSelector(
  [selectAppointmentsList],
  (appointments) => (date) => appointments.filter(appointment => 
    new Date(appointment.date).toDateString() === new Date(date).toDateString()
  )
)

export const selectAppointmentsByStaff = createSelector(
  [selectAppointmentsList],
  (appointments) => (staffId) => appointments.filter(appointment => appointment.staffId === staffId)
)

export const selectAppointmentsByCustomer = createSelector(
  [selectAppointmentsList],
  (appointments) => (customerId) => appointments.filter(appointment => appointment.customerId === customerId)
)

export const selectAppointmentsByService = createSelector(
  [selectAppointmentsList],
  (appointments) => (serviceId) => appointments.filter(appointment => appointment.serviceId === serviceId)
)

// Status-based selectors
export const selectScheduledAppointments = createSelector(
  [selectAppointmentsList],
  (appointments) => appointments.filter(appointment => appointment.status === 'scheduled')
)

export const selectConfirmedAppointments = createSelector(
  [selectAppointmentsList],
  (appointments) => appointments.filter(appointment => appointment.status === 'confirmed')
)

export const selectCompletedAppointments = createSelector(
  [selectAppointmentsList],
  (appointments) => appointments.filter(appointment => appointment.status === 'completed')
)

export const selectCancelledAppointments = createSelector(
  [selectAppointmentsList],
  (appointments) => appointments.filter(appointment => appointment.status === 'cancelled')
)

export const selectNoShowAppointments = createSelector(
  [selectAppointmentsList],
  (appointments) => appointments.filter(appointment => appointment.status === 'no_show')
)

// Today's appointments
export const selectTodayAppointments = createSelector(
  [selectAppointmentsList],
  (appointments) => {
    const today = new Date().toDateString()
    return appointments.filter(appointment => 
      new Date(appointment.date).toDateString() === today
    )
  }
)

// Upcoming appointments
export const selectUpcomingAppointments = createSelector(
  [selectAppointmentsList],
  (appointments) => {
    const now = new Date()
    return appointments.filter(appointment => 
      new Date(appointment.date) > now && 
      appointment.status === 'scheduled' || appointment.status === 'confirmed'
    )
  }
)

// Overdue appointments
export const selectOverdueAppointments = createSelector(
  [selectAppointmentsList],
  (appointments) => {
    const now = new Date()
    return appointments.filter(appointment => 
      new Date(appointment.date) < now && 
      appointment.status === 'scheduled' || appointment.status === 'confirmed'
    )
  }
)

// Search selectors
export const selectAppointmentsBySearch = createSelector(
  [selectAppointmentsList],
  (appointments) => (searchTerm) => {
    if (!searchTerm) return appointments
    const term = searchTerm.toLowerCase()
    return appointments.filter(appointment => 
      appointment.customerName?.toLowerCase().includes(term) ||
      appointment.staffName?.toLowerCase().includes(term) ||
      appointment.serviceName?.toLowerCase().includes(term) ||
      appointment.notes?.toLowerCase().includes(term)
    )
  }
)

// Statistics selectors
export const selectTotalAppointments = createSelector(
  [selectAppointmentsList],
  (appointments) => appointments.length
)

export const selectAppointmentsCountByStatus = createSelector(
  [selectAppointmentsList],
  (appointments) => {
    return appointments.reduce((acc, appointment) => {
      acc[appointment.status] = (acc[appointment.status] || 0) + 1
      return acc
    }, {})
  }
)

export const selectAppointmentsCountByDate = createSelector(
  [selectAppointmentsList],
  (appointments) => {
    return appointments.reduce((acc, appointment) => {
      const date = new Date(appointment.date).toDateString()
      acc[date] = (acc[date] || 0) + 1
      return acc
    }, {})
  }
)

// Recent appointments
export const selectRecentAppointments = createSelector(
  [selectAppointmentsList],
  (appointments) => (limit = 5) => {
    return appointments
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, limit)
  }
)

// Appointment details selectors
export const selectAppointmentDate = createSelector(
  [selectCurrentAppointment],
  (appointment) => appointment?.date
)

export const selectAppointmentTime = createSelector(
  [selectCurrentAppointment],
  (appointment) => appointment?.time
)

export const selectAppointmentStatus = createSelector(
  [selectCurrentAppointment],
  (appointment) => appointment?.status
)

export const selectAppointmentCustomer = createSelector(
  [selectCurrentAppointment],
  (appointment) => appointment?.customer
)

export const selectAppointmentStaff = createSelector(
  [selectCurrentAppointment],
  (appointment) => appointment?.staff
)

export const selectAppointmentService = createSelector(
  [selectCurrentAppointment],
  (appointment) => appointment?.service
)

export const selectAppointmentNotes = createSelector(
  [selectCurrentAppointment],
  (appointment) => appointment?.notes
)

export const selectAppointmentCreatedAt = createSelector(
  [selectCurrentAppointment],
  (appointment) => appointment?.createdAt
)

export const selectAppointmentUpdatedAt = createSelector(
  [selectCurrentAppointment],
  (appointment) => appointment?.updatedAt
)

// Loading states
export const selectAppointmentLoading = createSelector(
  [selectAppointmentsLoading, selectAvailableSlotsLoading, selectAppointmentStatsLoading],
  (appointmentsLoading, slotsLoading, statsLoading) => 
    appointmentsLoading || slotsLoading || statsLoading
)

// Error states
export const selectAppointmentError = createSelector(
  [selectAppointmentsError, selectAvailableSlotsError, selectAppointmentStatsError],
  (appointmentsError, slotsError, statsError) => 
    appointmentsError || slotsError || statsError
)

// Combined selectors
export const selectAppointmentState = createSelector(
  [selectAppointments, selectAvailableSlots, selectAppointmentStats],
  (appointments, availableSlots, stats) => ({
    appointments,
    availableSlots,
    stats
  })
)

export const selectAppointmentOverview = createSelector(
  [selectTotalAppointments, selectScheduledAppointments, selectConfirmedAppointments, selectCompletedAppointments, selectCancelledAppointments, selectAppointmentsCountByStatus],
  (totalAppointments, scheduledAppointments, confirmedAppointments, completedAppointments, cancelledAppointments, countByStatus) => ({
    totalAppointments,
    scheduledAppointments: scheduledAppointments.length,
    confirmedAppointments: confirmedAppointments.length,
    completedAppointments: completedAppointments.length,
    cancelledAppointments: cancelledAppointments.length,
    countByStatus
  })
)
