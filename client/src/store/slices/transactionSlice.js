import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { transactionService } from '../../services/manager'

// Async thunks
export const getTransactions = createAsyncThunk(
  'transaction/getTransactions',
  async (params, { rejectWithValue }) => {
    try {
      const result = await transactionService.getTransactions(params)
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

export const getTransaction = createAsyncThunk(
  'transaction/getTransaction',
  async (transactionId, { rejectWithValue }) => {
    try {
      const result = await transactionService.getTransaction(transactionId)
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

export const createTransaction = createAsyncThunk(
  'transaction/createTransaction',
  async (transactionData, { rejectWithValue }) => {
    try {
      const result = await transactionService.createTransaction(transactionData)
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

export const updateTransaction = createAsyncThunk(
  'transaction/updateTransaction',
  async ({ transactionId, transactionData }, { rejectWithValue }) => {
    try {
      const result = await transactionService.updateTransaction(transactionId, transactionData)
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

export const deleteTransaction = createAsyncThunk(
  'transaction/deleteTransaction',
  async (transactionId, { rejectWithValue }) => {
    try {
      const result = await transactionService.deleteTransaction(transactionId)
      if (result.success) {
        return transactionId
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
  transactions: {
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

// Transaction slice
const transactionSlice = createSlice({
  name: 'transaction',
  initialState,
  reducers: {
    clearTransactionError: (state) => {
      state.transactions.error = null
      state.stats.error = null
    },
    setCurrentTransaction: (state, action) => {
      state.transactions.current = action.payload
    },
    clearCurrentTransaction: (state) => {
      state.transactions.current = null
    },
    updateTransactionInList: (state, action) => {
      const index = state.transactions.list.findIndex(t => t.id === action.payload.id)
      if (index !== -1) {
        state.transactions.list[index] = action.payload
      }
    },
    removeTransactionFromList: (state, action) => {
      state.transactions.list = state.transactions.list.filter(t => t.id !== action.payload)
    }
  },
  extraReducers: (builder) => {
    builder
      // Transactions
      .addCase(getTransactions.pending, (state) => {
        state.transactions.isLoading = true
        state.transactions.error = null
      })
      .addCase(getTransactions.fulfilled, (state, action) => {
        state.transactions.isLoading = false
        state.transactions.list = action.payload.transactions || action.payload
        if (action.payload.pagination) {
          state.transactions.pagination = action.payload.pagination
        }
        state.transactions.error = null
      })
      .addCase(getTransactions.rejected, (state, action) => {
        state.transactions.isLoading = false
        state.transactions.error = action.payload
      })
      
      .addCase(getTransaction.pending, (state) => {
        state.transactions.isLoading = true
        state.transactions.error = null
      })
      .addCase(getTransaction.fulfilled, (state, action) => {
        state.transactions.isLoading = false
        state.transactions.current = action.payload
        state.transactions.error = null
      })
      .addCase(getTransaction.rejected, (state, action) => {
        state.transactions.isLoading = false
        state.transactions.error = action.payload
      })
      
      .addCase(createTransaction.pending, (state) => {
        state.transactions.isLoading = true
        state.transactions.error = null
      })
      .addCase(createTransaction.fulfilled, (state, action) => {
        state.transactions.isLoading = false
        state.transactions.list.unshift(action.payload)
        state.transactions.error = null
      })
      .addCase(createTransaction.rejected, (state, action) => {
        state.transactions.isLoading = false
        state.transactions.error = action.payload
      })
      
      .addCase(updateTransaction.pending, (state) => {
        state.transactions.isLoading = true
        state.transactions.error = null
      })
      .addCase(updateTransaction.fulfilled, (state, action) => {
        state.transactions.isLoading = false
        const index = state.transactions.list.findIndex(t => t.id === action.payload.id)
        if (index !== -1) {
          state.transactions.list[index] = action.payload
        }
        if (state.transactions.current?.id === action.payload.id) {
          state.transactions.current = action.payload
        }
        state.transactions.error = null
      })
      .addCase(updateTransaction.rejected, (state, action) => {
        state.transactions.isLoading = false
        state.transactions.error = action.payload
      })
      
      .addCase(deleteTransaction.pending, (state) => {
        state.transactions.isLoading = true
        state.transactions.error = null
      })
      .addCase(deleteTransaction.fulfilled, (state, action) => {
        state.transactions.isLoading = false
        state.transactions.list = state.transactions.list.filter(t => t.id !== action.payload)
        if (state.transactions.current?.id === action.payload) {
          state.transactions.current = null
        }
        state.transactions.error = null
      })
      .addCase(deleteTransaction.rejected, (state, action) => {
        state.transactions.isLoading = false
        state.transactions.error = action.payload
      })
  }
})

export const {
  clearTransactionError,
  setCurrentTransaction,
  clearCurrentTransaction,
  updateTransactionInList,
  removeTransactionFromList
} = transactionSlice.actions

export default transactionSlice.reducer