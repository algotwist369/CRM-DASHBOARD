import { createSelector } from '@reduxjs/toolkit'

// Base selectors
const getAdminState = (state) => state.admin

// Dashboard selectors
export const selectAdminDashboard = createSelector(
  [getAdminState],
  (admin) => admin.dashboard
)

export const selectAdminDashboardData = createSelector(
  [selectAdminDashboard],
  (dashboard) => dashboard.data
)

export const selectAdminDashboardLoading = createSelector(
  [selectAdminDashboard],
  (dashboard) => dashboard.isLoading
)

export const selectAdminDashboardError = createSelector(
  [selectAdminDashboard],
  (dashboard) => dashboard.error
)

// Stats selectors
export const selectAdminStats = createSelector(
  [getAdminState],
  (admin) => admin.stats
)

export const selectAdminStatsData = createSelector(
  [selectAdminStats],
  (stats) => stats.data
)

export const selectAdminStatsLoading = createSelector(
  [selectAdminStats],
  (stats) => stats.isLoading
)

export const selectAdminStatsError = createSelector(
  [selectAdminStats],
  (stats) => stats.error
)

// Business selectors
export const selectAdminBusinesses = createSelector(
  [getAdminState],
  (admin) => admin.businesses
)

export const selectAdminBusinessesList = createSelector(
  [selectAdminBusinesses],
  (businesses) => businesses.list
)

export const selectAdminCurrentBusiness = createSelector(
  [selectAdminBusinesses],
  (businesses) => businesses.current
)

export const selectAdminBusinessesLoading = createSelector(
  [selectAdminBusinesses],
  (businesses) => businesses.isLoading
)

export const selectAdminBusinessesError = createSelector(
  [selectAdminBusinesses],
  (businesses) => businesses.error
)

export const selectAdminBusinessesPagination = createSelector(
  [selectAdminBusinesses],
  (businesses) => businesses.pagination
)

// Manager selectors
export const selectAdminManagers = createSelector(
  [getAdminState],
  (admin) => admin.managers
)

export const selectAdminManagersList = createSelector(
  [selectAdminManagers],
  (managers) => managers.list
)

export const selectAdminCurrentManager = createSelector(
  [selectAdminManagers],
  (managers) => managers.current
)

export const selectAdminManagersLoading = createSelector(
  [selectAdminManagers],
  (managers) => managers.isLoading
)

export const selectAdminManagersError = createSelector(
  [selectAdminManagers],
  (managers) => managers.error
)

export const selectAdminManagersPagination = createSelector(
  [selectAdminManagers],
  (managers) => managers.pagination
)

// Report selectors
export const selectAdminReports = createSelector(
  [getAdminState],
  (admin) => admin.reports
)

export const selectAdminReportsList = createSelector(
  [selectAdminReports],
  (reports) => reports.list
)

export const selectAdminReportsLoading = createSelector(
  [selectAdminReports],
  (reports) => reports.isLoading
)

export const selectAdminReportsError = createSelector(
  [selectAdminReports],
  (reports) => reports.error
)

// Export selectors
export const selectAdminExport = createSelector(
  [getAdminState],
  (admin) => admin.export
)

export const selectAdminExportLoading = createSelector(
  [selectAdminExport],
  (exportState) => exportState.isLoading
)

export const selectAdminExportError = createSelector(
  [selectAdminExport],
  (exportState) => exportState.error
)

// Business filtering selectors
export const selectBusinessById = createSelector(
  [selectAdminBusinessesList],
  (businesses) => (id) => businesses.find(business => business.id === id)
)

export const selectBusinessesByStatus = createSelector(
  [selectAdminBusinessesList],
  (businesses) => (status) => businesses.filter(business => business.status === status)
)

export const selectActiveBusinesses = createSelector(
  [selectAdminBusinessesList],
  (businesses) => businesses.filter(business => business.status === 'active')
)

export const selectInactiveBusinesses = createSelector(
  [selectAdminBusinessesList],
  (businesses) => businesses.filter(business => business.status === 'inactive')
)

export const selectBusinessesByCategory = createSelector(
  [selectAdminBusinessesList],
  (businesses) => (category) => businesses.filter(business => business.category === category)
)

// Manager filtering selectors
export const selectManagerById = createSelector(
  [selectAdminManagersList],
  (managers) => (id) => managers.find(manager => manager.id === id)
)

export const selectManagersByStatus = createSelector(
  [selectAdminManagersList],
  (managers) => (status) => managers.filter(manager => manager.status === status)
)

export const selectActiveManagers = createSelector(
  [selectAdminManagersList],
  (managers) => managers.filter(manager => manager.status === 'active')
)

export const selectInactiveManagers = createSelector(
  [selectAdminManagersList],
  (managers) => managers.filter(manager => manager.status === 'inactive')
)

// Statistics selectors
export const selectTotalBusinesses = createSelector(
  [selectAdminBusinessesList],
  (businesses) => businesses.length
)

export const selectTotalManagers = createSelector(
  [selectAdminManagersList],
  (managers) => managers.length
)

export const selectTotalReports = createSelector(
  [selectAdminReportsList],
  (reports) => reports.length
)

// Loading states
export const selectAdminLoading = createSelector(
  [selectAdminDashboardLoading, selectAdminStatsLoading, selectAdminBusinessesLoading, selectAdminManagersLoading, selectAdminReportsLoading],
  (dashboardLoading, statsLoading, businessesLoading, managersLoading, reportsLoading) => 
    dashboardLoading || statsLoading || businessesLoading || managersLoading || reportsLoading
)

// Error states
export const selectAdminError = createSelector(
  [selectAdminDashboardError, selectAdminStatsError, selectAdminBusinessesError, selectAdminManagersError, selectAdminReportsError],
  (dashboardError, statsError, businessesError, managersError, reportsError) => 
    dashboardError || statsError || businessesError || managersError || reportsError
)

// Combined selectors
export const selectAdminState = createSelector(
  [selectAdminDashboard, selectAdminStats, selectAdminBusinesses, selectAdminManagers, selectAdminReports],
  (dashboard, stats, businesses, managers, reports) => ({
    dashboard,
    stats,
    businesses,
    managers,
    reports
  })
)

export const selectAdminOverview = createSelector(
  [selectTotalBusinesses, selectTotalManagers, selectTotalReports, selectActiveBusinesses, selectActiveManagers],
  (totalBusinesses, totalManagers, totalReports, activeBusinesses, activeManagers) => ({
    totalBusinesses,
    totalManagers,
    totalReports,
    activeBusinesses: activeBusinesses.length,
    activeManagers: activeManagers.length,
    inactiveBusinesses: totalBusinesses - activeBusinesses.length,
    inactiveManagers: totalManagers - activeManagers.length
  })
)
