import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { customerService } from '../../services/manager'

// Async thunks
export const getCustomers = createAsyncThunk(
  'customer/getCustomers',
  async (params, { rejectWithValue }) => {
    try {
      const result = await customerService.getCustomers(params)
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

export const getCustomer = createAsyncThunk(
  'customer/getCustomer',
  async (customerId, { rejectWithValue }) => {
    try {
      const result = await customerService.getCustomer(customerId)
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

export const createCustomer = createAsyncThunk(
  'customer/createCustomer',
  async (customerData, { rejectWithValue }) => {
    try {
      const result = await customerService.createCustomer(customerData)
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

export const updateCustomer = createAsyncThunk(
  'customer/updateCustomer',
  async ({ customerId, customerData }, { rejectWithValue }) => {
    try {
      const result = await customerService.updateCustomer(customerId, customerData)
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

export const deleteCustomer = createAsyncThunk(
  'customer/deleteCustomer',
  async (customerId, { rejectWithValue }) => {
    try {
      const result = await customerService.deleteCustomer(customerId)
      if (result.success) {
        return customerId
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
  customers: {
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

// Customer slice
const customerSlice = createSlice({
  name: 'customer',
  initialState,
  reducers: {
    clearCustomerError: (state) => {
      state.customers.error = null
      state.stats.error = null
    },
    setCurrentCustomer: (state, action) => {
      state.customers.current = action.payload
    },
    clearCurrentCustomer: (state) => {
      state.customers.current = null
    },
    updateCustomerInList: (state, action) => {
      const index = state.customers.list.findIndex(c => c.id === action.payload.id)
      if (index !== -1) {
        state.customers.list[index] = action.payload
      }
    },
    removeCustomerFromList: (state, action) => {
      state.customers.list = state.customers.list.filter(c => c.id !== action.payload)
    }
  },
  extraReducers: (builder) => {
    builder
      // Customers
      .addCase(getCustomers.pending, (state) => {
        state.customers.isLoading = true
        state.customers.error = null
      })
      .addCase(getCustomers.fulfilled, (state, action) => {
        state.customers.isLoading = false
        state.customers.list = action.payload.customers || action.payload
        if (action.payload.pagination) {
          state.customers.pagination = action.payload.pagination
        }
        state.customers.error = null
      })
      .addCase(getCustomers.rejected, (state, action) => {
        state.customers.isLoading = false
        state.customers.error = action.payload
      })
      
      .addCase(getCustomer.pending, (state) => {
        state.customers.isLoading = true
        state.customers.error = null
      })
      .addCase(getCustomer.fulfilled, (state, action) => {
        state.customers.isLoading = false
        state.customers.current = action.payload
        state.customers.error = null
      })
      .addCase(getCustomer.rejected, (state, action) => {
        state.customers.isLoading = false
        state.customers.error = action.payload
      })
      
      .addCase(createCustomer.pending, (state) => {
        state.customers.isLoading = true
        state.customers.error = null
      })
      .addCase(createCustomer.fulfilled, (state, action) => {
        state.customers.isLoading = false
        state.customers.list.unshift(action.payload)
        state.customers.error = null
      })
      .addCase(createCustomer.rejected, (state, action) => {
        state.customers.isLoading = false
        state.customers.error = action.payload
      })
      
      .addCase(updateCustomer.pending, (state) => {
        state.customers.isLoading = true
        state.customers.error = null
      })
      .addCase(updateCustomer.fulfilled, (state, action) => {
        state.customers.isLoading = false
        const index = state.customers.list.findIndex(c => c.id === action.payload.id)
        if (index !== -1) {
          state.customers.list[index] = action.payload
        }
        if (state.customers.current?.id === action.payload.id) {
          state.customers.current = action.payload
        }
        state.customers.error = null
      })
      .addCase(updateCustomer.rejected, (state, action) => {
        state.customers.isLoading = false
        state.customers.error = action.payload
      })
      
      .addCase(deleteCustomer.pending, (state) => {
        state.customers.isLoading = true
        state.customers.error = null
      })
      .addCase(deleteCustomer.fulfilled, (state, action) => {
        state.customers.isLoading = false
        state.customers.list = state.customers.list.filter(c => c.id !== action.payload)
        if (state.customers.current?.id === action.payload) {
          state.customers.current = null
        }
        state.customers.error = null
      })
      .addCase(deleteCustomer.rejected, (state, action) => {
        state.customers.isLoading = false
        state.customers.error = action.payload
      })
  }
})

export const {
  clearCustomerError,
  setCurrentCustomer,
  clearCurrentCustomer,
  updateCustomerInList,
  removeCustomerFromList
} = customerSlice.actions

export default customerSlice.reducer