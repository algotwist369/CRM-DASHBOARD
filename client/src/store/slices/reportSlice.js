import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { reportService } from '../../services/manager'

// Async thunks
export const getReports = createAsyncThunk(
  'report/getReports',
  async (params, { rejectWithValue }) => {
    try {
      const result = await reportService.getReports(params)
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

export const getReport = createAsyncThunk(
  'report/getReport',
  async (reportId, { rejectWithValue }) => {
    try {
      const result = await reportService.getReport(reportId)
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

export const generateReport = createAsyncThunk(
  'report/generateReport',
  async (reportData, { rejectWithValue }) => {
    try {
      const result = await reportService.generateReport(reportData)
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

export const updateReport = createAsyncThunk(
  'report/updateReport',
  async ({ reportId, reportData }, { rejectWithValue }) => {
    try {
      const result = await reportService.updateReport(reportId, reportData)
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

export const deleteReport = createAsyncThunk(
  'report/deleteReport',
  async (reportId, { rejectWithValue }) => {
    try {
      const result = await reportService.deleteReport(reportId)
      if (result.success) {
        return reportId
      } else {
        return rejectWithValue(result.error)
      }
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const downloadReport = createAsyncThunk(
  'report/downloadReport',
  async ({ reportId, format }, { rejectWithValue }) => {
    try {
      const result = await reportService.downloadReport(reportId, format)
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
  reports: {
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
  stats: {
    data: null,
    isLoading: false,
    error: null
  },
  download: {
    isLoading: false,
    error: null
  }
}

// Report slice
const reportSlice = createSlice({
  name: 'report',
  initialState,
  reducers: {
    clearReportError: (state) => {
      state.reports.error = null
      state.stats.error = null
      state.download.error = null
    },
    setCurrentReport: (state, action) => {
      state.reports.current = action.payload
    },
    clearCurrentReport: (state) => {
      state.reports.current = null
    },
    updateReportInList: (state, action) => {
      const index = state.reports.list.findIndex(r => r.id === action.payload.id)
      if (index !== -1) {
        state.reports.list[index] = action.payload
      }
    },
    removeReportFromList: (state, action) => {
      state.reports.list = state.reports.list.filter(r => r.id !== action.payload)
    }
  },
  extraReducers: (builder) => {
    builder
      // Reports
      .addCase(getReports.pending, (state) => {
        state.reports.isLoading = true
        state.reports.error = null
      })
      .addCase(getReports.fulfilled, (state, action) => {
        state.reports.isLoading = false
        state.reports.list = action.payload.reports || action.payload
        if (action.payload.pagination) {
          state.reports.pagination = action.payload.pagination
        }
        state.reports.error = null
      })
      .addCase(getReports.rejected, (state, action) => {
        state.reports.isLoading = false
        state.reports.error = action.payload
      })
      
      .addCase(getReport.pending, (state) => {
        state.reports.isLoading = true
        state.reports.error = null
      })
      .addCase(getReport.fulfilled, (state, action) => {
        state.reports.isLoading = false
        state.reports.current = action.payload
        state.reports.error = null
      })
      .addCase(getReport.rejected, (state, action) => {
        state.reports.isLoading = false
        state.reports.error = action.payload
      })
      
      .addCase(generateReport.pending, (state) => {
        state.reports.isLoading = true
        state.reports.error = null
      })
      .addCase(generateReport.fulfilled, (state, action) => {
        state.reports.isLoading = false
        state.reports.list.unshift(action.payload)
        state.reports.error = null
      })
      .addCase(generateReport.rejected, (state, action) => {
        state.reports.isLoading = false
        state.reports.error = action.payload
      })
      
      .addCase(updateReport.pending, (state) => {
        state.reports.isLoading = true
        state.reports.error = null
      })
      .addCase(updateReport.fulfilled, (state, action) => {
        state.reports.isLoading = false
        const index = state.reports.list.findIndex(r => r.id === action.payload.id)
        if (index !== -1) {
          state.reports.list[index] = action.payload
        }
        if (state.reports.current?.id === action.payload.id) {
          state.reports.current = action.payload
        }
        state.reports.error = null
      })
      .addCase(updateReport.rejected, (state, action) => {
        state.reports.isLoading = false
        state.reports.error = action.payload
      })
      
      .addCase(deleteReport.pending, (state) => {
        state.reports.isLoading = true
        state.reports.error = null
      })
      .addCase(deleteReport.fulfilled, (state, action) => {
        state.reports.isLoading = false
        state.reports.list = state.reports.list.filter(r => r.id !== action.payload)
        if (state.reports.current?.id === action.payload) {
          state.reports.current = null
        }
        state.reports.error = null
      })
      .addCase(deleteReport.rejected, (state, action) => {
        state.reports.isLoading = false
        state.reports.error = action.payload
      })
      
      // Download
      .addCase(downloadReport.pending, (state) => {
        state.download.isLoading = true
        state.download.error = null
      })
      .addCase(downloadReport.fulfilled, (state, action) => {
        state.download.isLoading = false
        state.download.error = null
      })
      .addCase(downloadReport.rejected, (state, action) => {
        state.download.isLoading = false
        state.download.error = action.payload
      })
  }
})

export const {
  clearReportError,
  setCurrentReport,
  clearCurrentReport,
  updateReportInList,
  removeReportFromList
} = reportSlice.actions

export default reportSlice.reducer