import { createSelector } from '@reduxjs/toolkit'

// Base selectors
const getUIState = (state) => state.ui

// Sidebar selectors
export const selectSidebar = createSelector(
  [getUIState],
  (ui) => ui.sidebar
)

export const selectSidebarIsOpen = createSelector(
  [selectSidebar],
  (sidebar) => sidebar.isOpen
)

export const selectSidebarIsCollapsed = createSelector(
  [selectSidebar],
  (sidebar) => sidebar.isCollapsed
)

// Theme selectors
export const selectTheme = createSelector(
  [getUIState],
  (ui) => ui.theme
)

export const selectThemeMode = createSelector(
  [selectTheme],
  (theme) => theme.mode
)

export const selectPrimaryColor = createSelector(
  [selectTheme],
  (theme) => theme.primaryColor
)

export const selectSecondaryColor = createSelector(
  [selectTheme],
  (theme) => theme.secondaryColor
)

export const selectIsDarkMode = createSelector(
  [selectThemeMode],
  (mode) => mode === 'dark'
)

export const selectIsLightMode = createSelector(
  [selectThemeMode],
  (mode) => mode === 'light'
)

// Layout selectors
export const selectLayout = createSelector(
  [getUIState],
  (ui) => ui.layout
)

export const selectHeaderHeight = createSelector(
  [selectLayout],
  (layout) => layout.headerHeight
)

export const selectSidebarWidth = createSelector(
  [selectLayout],
  (layout) => layout.sidebarWidth
)

export const selectCollapsedSidebarWidth = createSelector(
  [selectLayout],
  (layout) => layout.collapsedSidebarWidth
)

// Modal selectors
export const selectModals = createSelector(
  [getUIState],
  (ui) => ui.modals
)

export const selectModalIsOpen = createSelector(
  [selectModals],
  (modals) => modals.isOpen
)

export const selectModalType = createSelector(
  [selectModals],
  (modals) => modals.type
)

export const selectModalData = createSelector(
  [selectModals],
  (modals) => modals.data
)

// Toast notification selectors
export const selectNotifications = createSelector(
  [getUIState],
  (ui) => ui.notifications
)

export const selectToast = createSelector(
  [selectNotifications],
  (notifications) => notifications.toast
)

export const selectToastIsVisible = createSelector(
  [selectToast],
  (toast) => toast.isVisible
)

export const selectToastType = createSelector(
  [selectToast],
  (toast) => toast.type
)

export const selectToastMessage = createSelector(
  [selectToast],
  (toast) => toast.message
)

export const selectToastDuration = createSelector(
  [selectToast],
  (toast) => toast.duration
)

// Loading selectors
export const selectLoading = createSelector(
  [getUIState],
  (ui) => ui.loading
)

export const selectGlobalLoading = createSelector(
  [selectLoading],
  (loading) => loading.global
)

export const selectPageLoading = createSelector(
  [selectLoading],
  (loading) => loading.page
)

export const selectComponentLoading = createSelector(
  [selectLoading],
  (loading) => loading.component
)

export const selectAnyLoading = createSelector(
  [selectGlobalLoading, selectPageLoading, selectComponentLoading],
  (globalLoading, pageLoading, componentLoading) => 
    globalLoading || pageLoading || componentLoading
)

// Search selectors
export const selectSearch = createSelector(
  [getUIState],
  (ui) => ui.search
)

export const selectSearchQuery = createSelector(
  [selectSearch],
  (search) => search.query
)

export const selectSearchIsActive = createSelector(
  [selectSearch],
  (search) => search.isActive
)

export const selectSearchResults = createSelector(
  [selectSearch],
  (search) => search.results
)

// Filter selectors
export const selectFilters = createSelector(
  [getUIState],
  (ui) => ui.filters
)

export const selectActiveFilters = createSelector(
  [selectFilters],
  (filters) => filters.active
)

export const selectAppliedFilters = createSelector(
  [selectFilters],
  (filters) => filters.applied
)

export const selectFilterByKey = createSelector(
  [selectActiveFilters],
  (activeFilters) => (key) => activeFilters[key]
)

export const selectHasActiveFilters = createSelector(
  [selectActiveFilters],
  (activeFilters) => Object.keys(activeFilters).length > 0
)

export const selectHasAppliedFilters = createSelector(
  [selectAppliedFilters],
  (appliedFilters) => Object.keys(appliedFilters).length > 0
)

// Pagination selectors
export const selectPagination = createSelector(
  [getUIState],
  (ui) => ui.pagination
)

export const selectCurrentPage = createSelector(
  [selectPagination],
  (pagination) => pagination.currentPage
)

export const selectPageSize = createSelector(
  [selectPagination],
  (pagination) => pagination.pageSize
)

export const selectTotalItems = createSelector(
  [selectPagination],
  (pagination) => pagination.totalItems
)

export const selectTotalPages = createSelector(
  [selectPagination],
  (pagination) => pagination.totalPages
)

export const selectHasNextPage = createSelector(
  [selectCurrentPage, selectTotalPages],
  (currentPage, totalPages) => currentPage < totalPages
)

export const selectHasPreviousPage = createSelector(
  [selectCurrentPage],
  (currentPage) => currentPage > 1
)

export const selectIsFirstPage = createSelector(
  [selectCurrentPage],
  (currentPage) => currentPage === 1
)

export const selectIsLastPage = createSelector(
  [selectCurrentPage, selectTotalPages],
  (currentPage, totalPages) => currentPage === totalPages
)

// Sort selectors
export const selectSort = createSelector(
  [getUIState],
  (ui) => ui.sort
)

export const selectSortField = createSelector(
  [selectSort],
  (sort) => sort.field
)

export const selectSortDirection = createSelector(
  [selectSort],
  (sort) => sort.direction
)

export const selectIsAscending = createSelector(
  [selectSortDirection],
  (direction) => direction === 'asc'
)

export const selectIsDescending = createSelector(
  [selectSortDirection],
  (direction) => direction === 'desc'
)

export const selectIsSortedBy = createSelector(
  [selectSortField],
  (field) => (sortField) => field === sortField
)

// Combined selectors
export const selectUIState = createSelector(
  [selectSidebar, selectTheme, selectLayout, selectModals, selectNotifications, selectLoading, selectSearch, selectFilters, selectPagination, selectSort],
  (sidebar, theme, layout, modals, notifications, loading, search, filters, pagination, sort) => ({
    sidebar,
    theme,
    layout,
    modals,
    notifications,
    loading,
    search,
    filters,
    pagination,
    sort
  })
)

export const selectUIOverview = createSelector(
  [selectSidebarIsOpen, selectThemeMode, selectModalIsOpen, selectToastIsVisible, selectAnyLoading, selectSearchIsActive, selectHasActiveFilters, selectHasAppliedFilters],
  (sidebarIsOpen, themeMode, modalIsOpen, toastIsVisible, anyLoading, searchIsActive, hasActiveFilters, hasAppliedFilters) => ({
    sidebarIsOpen,
    themeMode,
    modalIsOpen,
    toastIsVisible,
    anyLoading,
    searchIsActive,
    hasActiveFilters,
    hasAppliedFilters
  })
)

// Computed selectors
export const selectEffectiveSidebarWidth = createSelector(
  [selectSidebarIsOpen, selectSidebarIsCollapsed, selectSidebarWidth, selectCollapsedSidebarWidth],
  (isOpen, isCollapsed, sidebarWidth, collapsedSidebarWidth) => {
    if (!isOpen) return 0
    return isCollapsed ? collapsedSidebarWidth : sidebarWidth
  }
)

export const selectContentWidth = createSelector(
  [selectEffectiveSidebarWidth],
  (sidebarWidth) => `calc(100% - ${sidebarWidth}px)`
)

export const selectThemeColors = createSelector(
  [selectPrimaryColor, selectSecondaryColor, selectThemeMode],
  (primaryColor, secondaryColor, mode) => ({
    primary: primaryColor,
    secondary: secondaryColor,
    mode,
    isDark: mode === 'dark',
    isLight: mode === 'light'
  })
)

export const selectPaginationInfo = createSelector(
  [selectCurrentPage, selectPageSize, selectTotalItems, selectTotalPages, selectHasNextPage, selectHasPreviousPage],
  (currentPage, pageSize, totalItems, totalPages, hasNextPage, hasPreviousPage) => ({
    currentPage,
    pageSize,
    totalItems,
    totalPages,
    hasNextPage,
    hasPreviousPage,
    startItem: (currentPage - 1) * pageSize + 1,
    endItem: Math.min(currentPage * pageSize, totalItems)
  })
)

export const selectSortInfo = createSelector(
  [selectSortField, selectSortDirection, selectIsAscending, selectIsDescending],
  (field, direction, isAscending, isDescending) => ({
    field,
    direction,
    isAscending,
    isDescending,
    isSorted: !!field
  })
)
