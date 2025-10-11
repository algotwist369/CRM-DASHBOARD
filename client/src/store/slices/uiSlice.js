import { createSlice } from '@reduxjs/toolkit'

// Initial state
const initialState = {
  sidebar: {
    isOpen: true,
    isCollapsed: false
  },
  theme: {
    mode: 'light', // 'light' or 'dark'
    primaryColor: '#3B82F6',
    secondaryColor: '#6B7280'
  },
  layout: {
    headerHeight: 64,
    sidebarWidth: 256,
    collapsedSidebarWidth: 64
  },
  modals: {
    isOpen: false,
    type: null,
    data: null
  },
  notifications: {
    toast: {
      isVisible: false,
      type: 'info', // 'success', 'error', 'warning', 'info'
      message: '',
      duration: 5000
    }
  },
  loading: {
    global: false,
    page: false,
    component: false
  },
  search: {
    query: '',
    isActive: false,
    results: []
  },
  filters: {
    active: {},
    applied: {}
  },
  pagination: {
    currentPage: 1,
    pageSize: 10,
    totalItems: 0,
    totalPages: 0
  },
  sort: {
    field: null,
    direction: 'asc' // 'asc' or 'desc'
  }
}

// UI slice
const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    // Sidebar actions
    toggleSidebar: (state) => {
      state.sidebar.isOpen = !state.sidebar.isOpen
    },
    openSidebar: (state) => {
      state.sidebar.isOpen = true
    },
    closeSidebar: (state) => {
      state.sidebar.isOpen = false
    },
    toggleSidebarCollapse: (state) => {
      state.sidebar.isCollapsed = !state.sidebar.isCollapsed
    },
    collapseSidebar: (state) => {
      state.sidebar.isCollapsed = true
    },
    expandSidebar: (state) => {
      state.sidebar.isCollapsed = false
    },
    
    // Theme actions
    setThemeMode: (state, action) => {
      state.theme.mode = action.payload
    },
    setPrimaryColor: (state, action) => {
      state.theme.primaryColor = action.payload
    },
    setSecondaryColor: (state, action) => {
      state.theme.secondaryColor = action.payload
    },
    toggleTheme: (state) => {
      state.theme.mode = state.theme.mode === 'light' ? 'dark' : 'light'
    },
    
    // Layout actions
    setHeaderHeight: (state, action) => {
      state.layout.headerHeight = action.payload
    },
    setSidebarWidth: (state, action) => {
      state.layout.sidebarWidth = action.payload
    },
    setCollapsedSidebarWidth: (state, action) => {
      state.layout.collapsedSidebarWidth = action.payload
    },
    
    // Modal actions
    openModal: (state, action) => {
      state.modals.isOpen = true
      state.modals.type = action.payload.type
      state.modals.data = action.payload.data || null
    },
    closeModal: (state) => {
      state.modals.isOpen = false
      state.modals.type = null
      state.modals.data = null
    },
    
    // Toast notification actions
    showToast: (state, action) => {
      state.notifications.toast.isVisible = true
      state.notifications.toast.type = action.payload.type || 'info'
      state.notifications.toast.message = action.payload.message
      state.notifications.toast.duration = action.payload.duration || 5000
    },
    hideToast: (state) => {
      state.notifications.toast.isVisible = false
      state.notifications.toast.message = ''
    },
    
    // Loading actions
    setGlobalLoading: (state, action) => {
      state.loading.global = action.payload
    },
    setPageLoading: (state, action) => {
      state.loading.page = action.payload
    },
    setComponentLoading: (state, action) => {
      state.loading.component = action.payload
    },
    
    // Search actions
    setSearchQuery: (state, action) => {
      state.search.query = action.payload
    },
    setSearchActive: (state, action) => {
      state.search.isActive = action.payload
    },
    setSearchResults: (state, action) => {
      state.search.results = action.payload
    },
    clearSearch: (state) => {
      state.search.query = ''
      state.search.isActive = false
      state.search.results = []
    },
    
    // Filter actions
    setActiveFilter: (state, action) => {
      const { key, value } = action.payload
      state.filters.active[key] = value
    },
    removeActiveFilter: (state, action) => {
      delete state.filters.active[action.payload]
    },
    clearActiveFilters: (state) => {
      state.filters.active = {}
    },
    applyFilters: (state) => {
      state.filters.applied = { ...state.filters.active }
    },
    clearAppliedFilters: (state) => {
      state.filters.applied = {}
      state.filters.active = {}
    },
    
    // Pagination actions
    setCurrentPage: (state, action) => {
      state.pagination.currentPage = action.payload
    },
    setPageSize: (state, action) => {
      state.pagination.pageSize = action.payload
    },
    setTotalItems: (state, action) => {
      state.pagination.totalItems = action.payload
      state.pagination.totalPages = Math.ceil(action.payload / state.pagination.pageSize)
    },
    setPagination: (state, action) => {
      state.pagination = { ...state.pagination, ...action.payload }
    },
    resetPagination: (state) => {
      state.pagination.currentPage = 1
    },
    
    // Sort actions
    setSortField: (state, action) => {
      state.sort.field = action.payload
    },
    setSortDirection: (state, action) => {
      state.sort.direction = action.payload
    },
    setSort: (state, action) => {
      state.sort.field = action.payload.field
      state.sort.direction = action.payload.direction
    },
    toggleSort: (state, action) => {
      if (state.sort.field === action.payload) {
        state.sort.direction = state.sort.direction === 'asc' ? 'desc' : 'asc'
      } else {
        state.sort.field = action.payload
        state.sort.direction = 'asc'
      }
    },
    clearSort: (state) => {
      state.sort.field = null
      state.sort.direction = 'asc'
    },
    
    // Reset all UI state
    resetUI: (state) => {
      return { ...initialState }
    }
  }
})

export const {
  // Sidebar
  toggleSidebar,
  openSidebar,
  closeSidebar,
  toggleSidebarCollapse,
  collapseSidebar,
  expandSidebar,
  
  // Theme
  setThemeMode,
  setPrimaryColor,
  setSecondaryColor,
  toggleTheme,
  
  // Layout
  setHeaderHeight,
  setSidebarWidth,
  setCollapsedSidebarWidth,
  
  // Modal
  openModal,
  closeModal,
  
  // Toast
  showToast,
  hideToast,
  
  // Loading
  setGlobalLoading,
  setPageLoading,
  setComponentLoading,
  
  // Search
  setSearchQuery,
  setSearchActive,
  setSearchResults,
  clearSearch,
  
  // Filters
  setActiveFilter,
  removeActiveFilter,
  clearActiveFilters,
  applyFilters,
  clearAppliedFilters,
  
  // Pagination
  setCurrentPage,
  setPageSize,
  setTotalItems,
  setPagination,
  resetPagination,
  
  // Sort
  setSortField,
  setSortDirection,
  setSort,
  toggleSort,
  clearSort,
  
  // Reset
  resetUI
} = uiSlice.actions

export default uiSlice.reducer