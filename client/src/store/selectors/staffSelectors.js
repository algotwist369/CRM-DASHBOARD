import { createSelector } from '@reduxjs/toolkit'

// Base selectors
const getStaffState = (state) => state.staff

// Staff selectors
export const selectStaff = createSelector(
  [getStaffState],
  (staff) => staff.staff
)

export const selectStaffList = createSelector(
  [selectStaff],
  (staff) => staff.list
)

export const selectCurrentStaff = createSelector(
  [selectStaff],
  (staff) => staff.current
)

export const selectStaffLoading = createSelector(
  [selectStaff],
  (staff) => staff.isLoading
)

export const selectStaffError = createSelector(
  [selectStaff],
  (staff) => staff.error
)

export const selectStaffPagination = createSelector(
  [selectStaff],
  (staff) => staff.pagination
)

// Stats selectors
export const selectStaffStats = createSelector(
  [getStaffState],
  (staff) => staff.stats
)

export const selectStaffStatsData = createSelector(
  [selectStaffStats],
  (stats) => stats.data
)

export const selectStaffStatsLoading = createSelector(
  [selectStaffStats],
  (stats) => stats.isLoading
)

export const selectStaffStatsError = createSelector(
  [selectStaffStats],
  (stats) => stats.error
)

// Staff filtering selectors
export const selectStaffById = createSelector(
  [selectStaffList],
  (staff) => (id) => staff.find(member => member.id === id)
)

export const selectStaffByRole = createSelector(
  [selectStaffList],
  (staff) => (role) => staff.filter(member => member.role === role)
)

export const selectStaffByStatus = createSelector(
  [selectStaffList],
  (staff) => (status) => staff.filter(member => member.status === status)
)

export const selectActiveStaff = createSelector(
  [selectStaffList],
  (staff) => staff.filter(member => member.status === 'active')
)

export const selectInactiveStaff = createSelector(
  [selectStaffList],
  (staff) => staff.filter(member => member.status === 'inactive')
)

export const selectStaffByDepartment = createSelector(
  [selectStaffList],
  (staff) => (department) => staff.filter(member => member.department === department)
)

export const selectStaffByBusiness = createSelector(
  [selectStaffList],
  (staff) => (businessId) => staff.filter(member => member.businessId === businessId)
)

// Search selectors
export const selectStaffBySearch = createSelector(
  [selectStaffList],
  (staff) => (searchTerm) => {
    if (!searchTerm) return staff
    const term = searchTerm.toLowerCase()
    return staff.filter(member => 
      member.name?.toLowerCase().includes(term) ||
      member.email?.toLowerCase().includes(term) ||
      member.role?.toLowerCase().includes(term) ||
      member.department?.toLowerCase().includes(term)
    )
  }
)

// Statistics selectors
export const selectTotalStaff = createSelector(
  [selectStaffList],
  (staff) => staff.length
)

export const selectStaffCountByRole = createSelector(
  [selectStaffList],
  (staff) => {
    return staff.reduce((acc, member) => {
      acc[member.role] = (acc[member.role] || 0) + 1
      return acc
    }, {})
  }
)

export const selectStaffCountByStatus = createSelector(
  [selectStaffList],
  (staff) => {
    return staff.reduce((acc, member) => {
      acc[member.status] = (acc[member.status] || 0) + 1
      return acc
    }, {})
  }
)

export const selectStaffCountByDepartment = createSelector(
  [selectStaffList],
  (staff) => {
    return staff.reduce((acc, member) => {
      acc[member.department] = (acc[member.department] || 0) + 1
      return acc
    }, {})
  }
)

// Recent staff
export const selectRecentStaff = createSelector(
  [selectStaffList],
  (staff) => (limit = 5) => {
    return staff
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, limit)
  }
)

// Top performing staff
export const selectTopPerformingStaff = createSelector(
  [selectStaffList],
  (staff) => (limit = 5) => {
    return staff
      .sort((a, b) => (b.performance || 0) - (a.performance || 0))
      .slice(0, limit)
  }
)

// Staff details selectors
export const selectStaffName = createSelector(
  [selectCurrentStaff],
  (staff) => staff?.name
)

export const selectStaffEmail = createSelector(
  [selectCurrentStaff],
  (staff) => staff?.email
)

export const selectStaffRole = createSelector(
  [selectCurrentStaff],
  (staff) => staff?.role
)

export const selectStaffDepartment = createSelector(
  [selectCurrentStaff],
  (staff) => staff?.department
)

export const selectStaffStatus = createSelector(
  [selectCurrentStaff],
  (staff) => staff?.status
)

export const selectStaffPerformance = createSelector(
  [selectCurrentStaff],
  (staff) => staff?.performance
)

export const selectStaffCreatedAt = createSelector(
  [selectCurrentStaff],
  (staff) => staff?.createdAt
)

export const selectStaffUpdatedAt = createSelector(
  [selectCurrentStaff],
  (staff) => staff?.updatedAt
)

// Combined loading states
export const selectStaffCombinedLoading = createSelector(
  [selectStaffLoading, selectStaffStatsLoading],
  (staffLoading, statsLoading) => staffLoading || statsLoading
)

// Combined error states
export const selectStaffCombinedError = createSelector(
  [selectStaffError, selectStaffStatsError],
  (staffError, statsError) => staffError || statsError
)

// Combined selectors
export const selectStaffState = createSelector(
  [selectStaff, selectStaffStats],
  (staff, stats) => ({
    staff,
    stats
  })
)

export const selectStaffOverview = createSelector(
  [selectTotalStaff, selectActiveStaff, selectInactiveStaff, selectStaffCountByRole, selectStaffCountByStatus, selectStaffCountByDepartment],
  (totalStaff, activeStaff, inactiveStaff, countByRole, countByStatus, countByDepartment) => ({
    totalStaff,
    activeStaff: activeStaff.length,
    inactiveStaff: inactiveStaff.length,
    countByRole,
    countByStatus,
    countByDepartment
  })
)
