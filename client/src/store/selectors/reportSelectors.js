import { createSelector } from '@reduxjs/toolkit'

// Base selectors
const getReportState = (state) => state.report

// Report selectors
export const selectReports = createSelector(
  [getReportState],
  (report) => report.reports
)

export const selectReportsList = createSelector(
  [selectReports],
  (reports) => reports.list
)

export const selectCurrentReport = createSelector(
  [selectReports],
  (reports) => reports.current
)

export const selectReportsLoading = createSelector(
  [selectReports],
  (reports) => reports.isLoading
)

export const selectReportsError = createSelector(
  [selectReports],
  (reports) => reports.error
)

export const selectReportsPagination = createSelector(
  [selectReports],
  (reports) => reports.pagination
)

// Stats selectors
export const selectReportStats = createSelector(
  [getReportState],
  (report) => report.stats
)

export const selectReportStatsData = createSelector(
  [selectReportStats],
  (stats) => stats.data
)

export const selectReportStatsLoading = createSelector(
  [selectReportStats],
  (stats) => stats.isLoading
)

export const selectReportStatsError = createSelector(
  [selectReportStats],
  (stats) => stats.error
)

// Download selectors
export const selectReportDownload = createSelector(
  [getReportState],
  (report) => report.download
)

export const selectReportDownloadLoading = createSelector(
  [selectReportDownload],
  (download) => download.isLoading
)

export const selectReportDownloadError = createSelector(
  [selectReportDownload],
  (download) => download.error
)

// Report filtering selectors
export const selectReportById = createSelector(
  [selectReportsList],
  (reports) => (id) => reports.find(report => report.id === id)
)

export const selectReportsByType = createSelector(
  [selectReportsList],
  (reports) => (type) => reports.filter(report => report.type === type)
)

export const selectReportsByStatus = createSelector(
  [selectReportsList],
  (reports) => (status) => reports.filter(report => report.status === status)
)

export const selectReportsByDate = createSelector(
  [selectReportsList],
  (reports) => (date) => reports.filter(report => 
    new Date(report.date).toDateString() === new Date(date).toDateString()
  )
)

export const selectReportsByUser = createSelector(
  [selectReportsList],
  (reports) => (userId) => reports.filter(report => report.userId === userId)
)

// Status-based selectors
export const selectGeneratedReports = createSelector(
  [selectReportsList],
  (reports) => reports.filter(report => report.status === 'generated')
)

export const selectGeneratingReports = createSelector(
  [selectReportsList],
  (reports) => reports.filter(report => report.status === 'generating')
)

export const selectFailedReports = createSelector(
  [selectReportsList],
  (reports) => reports.filter(report => report.status === 'failed')
)

export const selectScheduledReports = createSelector(
  [selectReportsList],
  (reports) => reports.filter(report => report.status === 'scheduled')
)

// Type-based selectors
export const selectBusinessReports = createSelector(
  [selectReportsList],
  (reports) => reports.filter(report => report.type === 'business')
)

export const selectStaffReports = createSelector(
  [selectReportsList],
  (reports) => reports.filter(report => report.type === 'staff')
)

export const selectCustomerReports = createSelector(
  [selectReportsList],
  (reports) => reports.filter(report => report.type === 'customer')
)

export const selectAppointmentReports = createSelector(
  [selectReportsList],
  (reports) => reports.filter(report => report.type === 'appointment')
)

export const selectTransactionReports = createSelector(
  [selectReportsList],
  (reports) => reports.filter(report => report.type === 'transaction')
)

export const selectNotificationReports = createSelector(
  [selectReportsList],
  (reports) => reports.filter(report => report.type === 'notification')
)

export const selectRevenueReports = createSelector(
  [selectReportsList],
  (reports) => reports.filter(report => report.type === 'revenue')
)

export const selectAnalyticsReports = createSelector(
  [selectReportsList],
  (reports) => reports.filter(report => report.type === 'analytics')
)

// Recent reports
export const selectRecentReports = createSelector(
  [selectReportsList],
  (reports) => (limit = 5) => {
    return reports
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, limit)
  }
)

// Today's reports
export const selectTodayReports = createSelector(
  [selectReportsList],
  (reports) => {
    const today = new Date().toDateString()
    return reports.filter(report => 
      new Date(report.date).toDateString() === today
    )
  }
)

// Search selectors
export const selectReportsBySearch = createSelector(
  [selectReportsList],
  (reports) => (searchTerm) => {
    if (!searchTerm) return reports
    const term = searchTerm.toLowerCase()
    return reports.filter(report => 
      report.name?.toLowerCase().includes(term) ||
      report.type?.toLowerCase().includes(term) ||
      report.description?.toLowerCase().includes(term) ||
      report.status?.toLowerCase().includes(term)
    )
  }
)

// Statistics selectors
export const selectTotalReports = createSelector(
  [selectReportsList],
  (reports) => reports.length
)

export const selectReportsCountByType = createSelector(
  [selectReportsList],
  (reports) => {
    return reports.reduce((acc, report) => {
      acc[report.type] = (acc[report.type] || 0) + 1
      return acc
    }, {})
  }
)

export const selectReportsCountByStatus = createSelector(
  [selectReportsList],
  (reports) => {
    return reports.reduce((acc, report) => {
      acc[report.status] = (acc[report.status] || 0) + 1
      return acc
    }, {})
  }
)

export const selectReportsCountByDate = createSelector(
  [selectReportsList],
  (reports) => {
    return reports.reduce((acc, report) => {
      const date = new Date(report.date).toDateString()
      acc[date] = (acc[date] || 0) + 1
      return acc
    }, {})
  }
)

// Report details selectors
export const selectReportName = createSelector(
  [selectCurrentReport],
  (report) => report?.name
)

export const selectReportType = createSelector(
  [selectCurrentReport],
  (report) => report?.type
)

export const selectReportStatus = createSelector(
  [selectCurrentReport],
  (report) => report?.status
)

export const selectReportDescription = createSelector(
  [selectCurrentReport],
  (report) => report?.description
)

export const selectReportData = createSelector(
  [selectCurrentReport],
  (report) => report?.data
)

export const selectReportFormat = createSelector(
  [selectCurrentReport],
  (report) => report?.format
)

export const selectReportSize = createSelector(
  [selectCurrentReport],
  (report) => report?.size
)

export const selectReportDate = createSelector(
  [selectCurrentReport],
  (report) => report?.date
)

export const selectReportCreatedAt = createSelector(
  [selectCurrentReport],
  (report) => report?.createdAt
)

export const selectReportUpdatedAt = createSelector(
  [selectCurrentReport],
  (report) => report?.updatedAt
)

// Loading states
export const selectReportLoading = createSelector(
  [selectReportsLoading, selectReportStatsLoading, selectReportDownloadLoading],
  (reportsLoading, statsLoading, downloadLoading) => 
    reportsLoading || statsLoading || downloadLoading
)

// Error states
export const selectReportError = createSelector(
  [selectReportsError, selectReportStatsError, selectReportDownloadError],
  (reportsError, statsError, downloadError) => 
    reportsError || statsError || downloadError
)

// Combined selectors
export const selectReportState = createSelector(
  [selectReports, selectReportStats, selectReportDownload],
  (reports, stats, download) => ({
    reports,
    stats,
    download
  })
)

export const selectReportOverview = createSelector(
  [selectTotalReports, selectGeneratedReports, selectGeneratingReports, selectFailedReports, selectScheduledReports, selectReportsCountByType, selectReportsCountByStatus],
  (totalReports, generatedReports, generatingReports, failedReports, scheduledReports, countByType, countByStatus) => ({
    totalReports,
    generatedReports: generatedReports.length,
    generatingReports: generatingReports.length,
    failedReports: failedReports.length,
    scheduledReports: scheduledReports.length,
    countByType,
    countByStatus
  })
)
