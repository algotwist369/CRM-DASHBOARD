import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { adminService, businessService, managerService } from '../../services/admin'

// Async thunks
export const getAdminDashboard = createAsyncThunk(
  'admin/getDashboard',
  async (_, { rejectWithValue }) => {
    try {
      const result = await adminService.getDashboard()
      if (result.success) {
        return result.data
      } else {
        return rejectWithValue(result.error)
      }
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const getAdminStats = createAsyncThunk(
  'admin/getStats',
  async (_, { rejectWithValue }) => {
    try {
      const result = await adminService.getStats()
      if (result.success) {
        return result.data
      } else {
        return rejectWithValue(result.error)
      }
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const getBusinesses = createAsyncThunk(
  'admin/getBusinesses',
  async (params, { rejectWithValue }) => {
    try {
      const result = await businessService.getBusinesses(params)
      if (result.success) {
        return result.data
      } else {
        return rejectWithValue(result.error)
      }
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const getBusiness = createAsyncThunk(
  'admin/getBusiness',
  async (businessId, { rejectWithValue }) => {
    try {
      const result = await businessService.getBusiness(businessId)
      if (result.success) {
        return result.data
      } else {
        return rejectWithValue(result.error)
      }
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const createBusiness = createAsyncThunk(
  'admin/createBusiness',
  async (businessData, { rejectWithValue }) => {
    try {
      const result = await businessService.createBusiness(businessData)
      if (result.success) {
        return result.data
      } else {
        return rejectWithValue(result.error)
      }
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const updateBusiness = createAsyncThunk(
  'admin/updateBusiness',
  async ({ businessId, businessData }, { rejectWithValue }) => {
    try {
      const result = await businessService.updateBusiness(businessId, businessData)
      if (result.success) {
        return result.data
      } else {
        return rejectWithValue(result.error)
      }
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const deleteBusiness = createAsyncThunk(
  'admin/deleteBusiness',
  async (businessId, { rejectWithValue }) => {
    try {
      const result = await businessService.deleteBusiness(businessId)
      if (result.success) {
        return businessId
      } else {
        return rejectWithValue(result.error)
      }
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const getManagers = createAsyncThunk(
  'admin/getManagers',
  async (params, { rejectWithValue }) => {
    try {
      const result = await managerService.getManagers(params)
      if (result.success) {
        return result.data
      } else {
        return rejectWithValue(result.error)
      }
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const getManager = createAsyncThunk(
  'admin/getManager',
  async (managerId, { rejectWithValue }) => {
    try {
      const result = await managerService.getManager(managerId)
      if (result.success) {
        return result.data
      } else {
        return rejectWithValue(result.error)
      }
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const createManager = createAsyncThunk(
  'admin/createManager',
  async (managerData, { rejectWithValue }) => {
    try {
      const result = await managerService.createManager(managerData)
      if (result.success) {
        return result.data
      } else {
        return rejectWithValue(result.error)
      }
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const updateManager = createAsyncThunk(
  'admin/updateManager',
  async ({ managerId, managerData }, { rejectWithValue }) => {
    try {
      const result = await managerService.updateManager(managerId, managerData)
      if (result.success) {
        return result.data
      } else {
        return rejectWithValue(result.error)
      }
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const deleteManager = createAsyncThunk(
  'admin/deleteManager',
  async (managerId, { rejectWithValue }) => {
    try {
      const result = await managerService.deleteManager(managerId)
      if (result.success) {
        return managerId
      } else {
        return rejectWithValue(result.error)
      }
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const getAdminReports = createAsyncThunk(
  'admin/getReports',
  async (params, { rejectWithValue }) => {
    try {
      const result = await adminService.getReports(params)
      if (result.success) {
        return result.data
      } else {
        return rejectWithValue(result.error)
      }
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const exportAdminData = createAsyncThunk(
  'admin/exportData',
  async ({ format, filters }, { rejectWithValue }) => {
    try {
      const result = await adminService.exportData(format, filters)
      if (result.success) {
        return result.data
      } else {
        return rejectWithValue(result.error)
      }
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

// Initial state
const initialState = {
  dashboard: {
    data: null,
    isLoading: false,
    error: null
  },
  stats: {
    data: null,
    isLoading: false,
    error: null
  },
  businesses: {
    list: [],
    current: null,
    isLoading: false,
    error: null,
    pagination: {
      page: 1,
      limit: 10,
      total: 0,
      totalPages: 0
    }
  },
  managers: {
    list: [],
    current: null,
    isLoading: false,
    error: null,
    pagination: {
      page: 1,
      limit: 10,
      total: 0,
      totalPages: 0
    }
  },
  reports: {
    list: [],
    isLoading: false,
    error: null
  },
  export: {
    isLoading: false,
    error: null
  }
}

// Admin slice
const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    clearAdminError: (state) => {
      state.dashboard.error = null
      state.stats.error = null
      state.businesses.error = null
      state.managers.error = null
      state.reports.error = null
      state.export.error = null
    },
    setCurrentBusiness: (state, action) => {
      state.businesses.current = action.payload
    },
    setCurrentManager: (state, action) => {
      state.managers.current = action.payload
    },
    clearCurrentBusiness: (state) => {
      state.businesses.current = null
    },
    clearCurrentManager: (state) => {
      state.managers.current = null
    },
    updateBusinessInList: (state, action) => {
      const index = state.businesses.list.findIndex(b => b.id === action.payload.id)
      if (index !== -1) {
        state.businesses.list[index] = action.payload
      }
    },
    updateManagerInList: (state, action) => {
      const index = state.managers.list.findIndex(m => m.id === action.payload.id)
      if (index !== -1) {
        state.managers.list[index] = action.payload
      }
    },
    removeBusinessFromList: (state, action) => {
      state.businesses.list = state.businesses.list.filter(b => b.id !== action.payload)
    },
    removeManagerFromList: (state, action) => {
      state.managers.list = state.managers.list.filter(m => m.id !== action.payload)
    }
  },
  extraReducers: (builder) => {
    builder
      // Dashboard
      .addCase(getAdminDashboard.pending, (state) => {
        state.dashboard.isLoading = true
        state.dashboard.error = null
      })
      .addCase(getAdminDashboard.fulfilled, (state, action) => {
        state.dashboard.isLoading = false
        state.dashboard.data = action.payload
        state.dashboard.error = null
      })
      .addCase(getAdminDashboard.rejected, (state, action) => {
        state.dashboard.isLoading = false
        state.dashboard.error = action.payload
      })
      
      // Stats
      .addCase(getAdminStats.pending, (state) => {
        state.stats.isLoading = true
        state.stats.error = null
      })
      .addCase(getAdminStats.fulfilled, (state, action) => {
        state.stats.isLoading = false
        state.stats.data = action.payload
        state.stats.error = null
      })
      .addCase(getAdminStats.rejected, (state, action) => {
        state.stats.isLoading = false
        state.stats.error = action.payload
      })
      
      // Businesses
      .addCase(getBusinesses.pending, (state) => {
        state.businesses.isLoading = true
        state.businesses.error = null
      })
      .addCase(getBusinesses.fulfilled, (state, action) => {
        state.businesses.isLoading = false
        state.businesses.list = action.payload.businesses || action.payload
        if (action.payload.pagination) {
          state.businesses.pagination = action.payload.pagination
        }
        state.businesses.error = null
      })
      .addCase(getBusinesses.rejected, (state, action) => {
        state.businesses.isLoading = false
        state.businesses.error = action.payload
      })
      
      .addCase(getBusiness.pending, (state) => {
        state.businesses.isLoading = true
        state.businesses.error = null
      })
      .addCase(getBusiness.fulfilled, (state, action) => {
        state.businesses.isLoading = false
        state.businesses.current = action.payload
        state.businesses.error = null
      })
      .addCase(getBusiness.rejected, (state, action) => {
        state.businesses.isLoading = false
        state.businesses.error = action.payload
      })
      
      .addCase(createBusiness.pending, (state) => {
        state.businesses.isLoading = true
        state.businesses.error = null
      })
      .addCase(createBusiness.fulfilled, (state, action) => {
        state.businesses.isLoading = false
        state.businesses.list.unshift(action.payload)
        state.businesses.error = null
      })
      .addCase(createBusiness.rejected, (state, action) => {
        state.businesses.isLoading = false
        state.businesses.error = action.payload
      })
      
      .addCase(updateBusiness.pending, (state) => {
        state.businesses.isLoading = true
        state.businesses.error = null
      })
      .addCase(updateBusiness.fulfilled, (state, action) => {
        state.businesses.isLoading = false
        const index = state.businesses.list.findIndex(b => b.id === action.payload.id)
        if (index !== -1) {
          state.businesses.list[index] = action.payload
        }
        if (state.businesses.current?.id === action.payload.id) {
          state.businesses.current = action.payload
        }
        state.businesses.error = null
      })
      .addCase(updateBusiness.rejected, (state, action) => {
        state.businesses.isLoading = false
        state.businesses.error = action.payload
      })
      
      .addCase(deleteBusiness.pending, (state) => {
        state.businesses.isLoading = true
        state.businesses.error = null
      })
      .addCase(deleteBusiness.fulfilled, (state, action) => {
        state.businesses.isLoading = false
        state.businesses.list = state.businesses.list.filter(b => b.id !== action.payload)
        if (state.businesses.current?.id === action.payload) {
          state.businesses.current = null
        }
        state.businesses.error = null
      })
      .addCase(deleteBusiness.rejected, (state, action) => {
        state.businesses.isLoading = false
        state.businesses.error = action.payload
      })
      
      // Managers
      .addCase(getManagers.pending, (state) => {
        state.managers.isLoading = true
        state.managers.error = null
      })
      .addCase(getManagers.fulfilled, (state, action) => {
        state.managers.isLoading = false
        state.managers.list = action.payload.managers || action.payload
        if (action.payload.pagination) {
          state.managers.pagination = action.payload.pagination
        }
        state.managers.error = null
      })
      .addCase(getManagers.rejected, (state, action) => {
        state.managers.isLoading = false
        state.managers.error = action.payload
      })
      
      .addCase(getManager.pending, (state) => {
        state.managers.isLoading = true
        state.managers.error = null
      })
      .addCase(getManager.fulfilled, (state, action) => {
        state.managers.isLoading = false
        state.managers.current = action.payload
        state.managers.error = null
      })
      .addCase(getManager.rejected, (state, action) => {
        state.managers.isLoading = false
        state.managers.error = action.payload
      })
      
      .addCase(createManager.pending, (state) => {
        state.managers.isLoading = true
        state.managers.error = null
      })
      .addCase(createManager.fulfilled, (state, action) => {
        state.managers.isLoading = false
        state.managers.list.unshift(action.payload)
        state.managers.error = null
      })
      .addCase(createManager.rejected, (state, action) => {
        state.managers.isLoading = false
        state.managers.error = action.payload
      })
      
      .addCase(updateManager.pending, (state) => {
        state.managers.isLoading = true
        state.managers.error = null
      })
      .addCase(updateManager.fulfilled, (state, action) => {
        state.managers.isLoading = false
        const index = state.managers.list.findIndex(m => m.id === action.payload.id)
        if (index !== -1) {
          state.managers.list[index] = action.payload
        }
        if (state.managers.current?.id === action.payload.id) {
          state.managers.current = action.payload
        }
        state.managers.error = null
      })
      .addCase(updateManager.rejected, (state, action) => {
        state.managers.isLoading = false
        state.managers.error = action.payload
      })
      
      .addCase(deleteManager.pending, (state) => {
        state.managers.isLoading = true
        state.managers.error = null
      })
      .addCase(deleteManager.fulfilled, (state, action) => {
        state.managers.isLoading = false
        state.managers.list = state.managers.list.filter(m => m.id !== action.payload)
        if (state.managers.current?.id === action.payload) {
          state.managers.current = null
        }
        state.managers.error = null
      })
      .addCase(deleteManager.rejected, (state, action) => {
        state.managers.isLoading = false
        state.managers.error = action.payload
      })
      
      // Reports
      .addCase(getAdminReports.pending, (state) => {
        state.reports.isLoading = true
        state.reports.error = null
      })
      .addCase(getAdminReports.fulfilled, (state, action) => {
        state.reports.isLoading = false
        state.reports.list = action.payload
        state.reports.error = null
      })
      .addCase(getAdminReports.rejected, (state, action) => {
        state.reports.isLoading = false
        state.reports.error = action.payload
      })
      
      // Export
      .addCase(exportAdminData.pending, (state) => {
        state.export.isLoading = true
        state.export.error = null
      })
      .addCase(exportAdminData.fulfilled, (state, action) => {
        state.export.isLoading = false
        state.export.error = null
      })
      .addCase(exportAdminData.rejected, (state, action) => {
        state.export.isLoading = false
        state.export.error = action.payload
      })
  }
})

export const {
  clearAdminError,
  setCurrentBusiness,
  setCurrentManager,
  clearCurrentBusiness,
  clearCurrentManager,
  updateBusinessInList,
  updateManagerInList,
  removeBusinessFromList,
  removeManagerFromList
} = adminSlice.actions

export default adminSlice.reducer