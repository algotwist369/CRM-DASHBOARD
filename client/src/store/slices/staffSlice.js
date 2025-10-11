import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { staffService } from '../../services/manager'

// Async thunks
export const getStaff = createAsyncThunk(
  'staff/getStaff',
  async (params, { rejectWithValue }) => {
    try {
      const result = await staffService.getStaff(params)
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

export const getStaffMember = createAsyncThunk(
  'staff/getStaffMember',
  async (staffId, { rejectWithValue }) => {
    try {
      const result = await staffService.getStaffMember(staffId)
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

export const createStaff = createAsyncThunk(
  'staff/createStaff',
  async (staffData, { rejectWithValue }) => {
    try {
      const result = await staffService.createStaff(staffData)
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

export const updateStaff = createAsyncThunk(
  'staff/updateStaff',
  async ({ staffId, staffData }, { rejectWithValue }) => {
    try {
      const result = await staffService.updateStaff(staffId, staffData)
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

export const deleteStaff = createAsyncThunk(
  'staff/deleteStaff',
  async (staffId, { rejectWithValue }) => {
    try {
      const result = await staffService.deleteStaff(staffId)
      if (result.success) {
        return staffId
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
  staff: {
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
  }
}

// Staff slice
const staffSlice = createSlice({
  name: 'staff',
  initialState,
  reducers: {
    clearStaffError: (state) => {
      state.staff.error = null
      state.stats.error = null
    },
    setCurrentStaff: (state, action) => {
      state.staff.current = action.payload
    },
    clearCurrentStaff: (state) => {
      state.staff.current = null
    },
    updateStaffInList: (state, action) => {
      const index = state.staff.list.findIndex(s => s.id === action.payload.id)
      if (index !== -1) {
        state.staff.list[index] = action.payload
      }
    },
    removeStaffFromList: (state, action) => {
      state.staff.list = state.staff.list.filter(s => s.id !== action.payload)
    }
  },
  extraReducers: (builder) => {
    builder
      // Staff
      .addCase(getStaff.pending, (state) => {
        state.staff.isLoading = true
        state.staff.error = null
      })
      .addCase(getStaff.fulfilled, (state, action) => {
        state.staff.isLoading = false
        state.staff.list = action.payload.staff || action.payload
        if (action.payload.pagination) {
          state.staff.pagination = action.payload.pagination
        }
        state.staff.error = null
      })
      .addCase(getStaff.rejected, (state, action) => {
        state.staff.isLoading = false
        state.staff.error = action.payload
      })
      
      .addCase(getStaffMember.pending, (state) => {
        state.staff.isLoading = true
        state.staff.error = null
      })
      .addCase(getStaffMember.fulfilled, (state, action) => {
        state.staff.isLoading = false
        state.staff.current = action.payload
        state.staff.error = null
      })
      .addCase(getStaffMember.rejected, (state, action) => {
        state.staff.isLoading = false
        state.staff.error = action.payload
      })
      
      .addCase(createStaff.pending, (state) => {
        state.staff.isLoading = true
        state.staff.error = null
      })
      .addCase(createStaff.fulfilled, (state, action) => {
        state.staff.isLoading = false
        state.staff.list.unshift(action.payload)
        state.staff.error = null
      })
      .addCase(createStaff.rejected, (state, action) => {
        state.staff.isLoading = false
        state.staff.error = action.payload
      })
      
      .addCase(updateStaff.pending, (state) => {
        state.staff.isLoading = true
        state.staff.error = null
      })
      .addCase(updateStaff.fulfilled, (state, action) => {
        state.staff.isLoading = false
        const index = state.staff.list.findIndex(s => s.id === action.payload.id)
        if (index !== -1) {
          state.staff.list[index] = action.payload
        }
        if (state.staff.current?.id === action.payload.id) {
          state.staff.current = action.payload
        }
        state.staff.error = null
      })
      .addCase(updateStaff.rejected, (state, action) => {
        state.staff.isLoading = false
        state.staff.error = action.payload
      })
      
      .addCase(deleteStaff.pending, (state) => {
        state.staff.isLoading = true
        state.staff.error = null
      })
      .addCase(deleteStaff.fulfilled, (state, action) => {
        state.staff.isLoading = false
        state.staff.list = state.staff.list.filter(s => s.id !== action.payload)
        if (state.staff.current?.id === action.payload) {
          state.staff.current = null
        }
        state.staff.error = null
      })
      .addCase(deleteStaff.rejected, (state, action) => {
        state.staff.isLoading = false
        state.staff.error = action.payload
      })
  }
})

export const {
  clearStaffError,
  setCurrentStaff,
  clearCurrentStaff,
  updateStaffInList,
  removeStaffFromList
} = staffSlice.actions

export default staffSlice.reducer