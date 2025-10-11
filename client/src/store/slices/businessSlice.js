import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { businessService } from '../../services/admin'

// Async thunks
export const getBusinesses = createAsyncThunk(
  'business/getBusinesses',
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
  'business/getBusiness',
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
  'business/createBusiness',
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
  'business/updateBusiness',
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
  'business/deleteBusiness',
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

// Initial state
const initialState = {
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
  stats: {
    data: null,
    isLoading: false,
    error: null
  }
}

// Business slice
const businessSlice = createSlice({
  name: 'business',
  initialState,
  reducers: {
    clearBusinessError: (state) => {
      state.businesses.error = null
      state.stats.error = null
    },
    setCurrentBusiness: (state, action) => {
      state.businesses.current = action.payload
    },
    clearCurrentBusiness: (state) => {
      state.businesses.current = null
    },
    updateBusinessInList: (state, action) => {
      const index = state.businesses.list.findIndex(b => b.id === action.payload.id)
      if (index !== -1) {
        state.businesses.list[index] = action.payload
      }
    },
    removeBusinessFromList: (state, action) => {
      state.businesses.list = state.businesses.list.filter(b => b.id !== action.payload)
    }
  },
  extraReducers: (builder) => {
    builder
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
  }
})

export const {
  clearBusinessError,
  setCurrentBusiness,
  clearCurrentBusiness,
  updateBusinessInList,
  removeBusinessFromList
} = businessSlice.actions

export default businessSlice.reducer