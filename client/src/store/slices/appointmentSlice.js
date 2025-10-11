import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { appointmentService } from '../../services/manager'

// Async thunks
export const getAppointments = createAsyncThunk(
  'appointment/getAppointments',
  async (params, { rejectWithValue }) => {
    try {
      const result = await appointmentService.getAppointments(params)
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

export const getAppointment = createAsyncThunk(
  'appointment/getAppointment',
  async (appointmentId, { rejectWithValue }) => {
    try {
      const result = await appointmentService.getAppointment(appointmentId)
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

export const createAppointment = createAsyncThunk(
  'appointment/createAppointment',
  async (appointmentData, { rejectWithValue }) => {
    try {
      const result = await appointmentService.createAppointment(appointmentData)
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

export const updateAppointment = createAsyncThunk(
  'appointment/updateAppointment',
  async ({ appointmentId, appointmentData }, { rejectWithValue }) => {
    try {
      const result = await appointmentService.updateAppointment(appointmentId, appointmentData)
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

export const deleteAppointment = createAsyncThunk(
  'appointment/deleteAppointment',
  async (appointmentId, { rejectWithValue }) => {
    try {
      const result = await appointmentService.deleteAppointment(appointmentId)
      if (result.success) {
        return appointmentId
      } else {
        return rejectWithValue(result.error)
      }
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const getAvailableSlots = createAsyncThunk(
  'appointment/getAvailableSlots',
  async (params, { rejectWithValue }) => {
    try {
      const result = await appointmentService.getAvailableSlots(params)
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
  appointments: {
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
  availableSlots: {
    data: [],
    isLoading: false,
    error: null
  },
  stats: {
    data: null,
    isLoading: false,
    error: null
  }
}

// Appointment slice
const appointmentSlice = createSlice({
  name: 'appointment',
  initialState,
  reducers: {
    clearAppointmentError: (state) => {
      state.appointments.error = null
      state.availableSlots.error = null
      state.stats.error = null
    },
    setCurrentAppointment: (state, action) => {
      state.appointments.current = action.payload
    },
    clearCurrentAppointment: (state) => {
      state.appointments.current = null
    },
    updateAppointmentInList: (state, action) => {
      const index = state.appointments.list.findIndex(a => a.id === action.payload.id)
      if (index !== -1) {
        state.appointments.list[index] = action.payload
      }
    },
    removeAppointmentFromList: (state, action) => {
      state.appointments.list = state.appointments.list.filter(a => a.id !== action.payload)
    }
  },
  extraReducers: (builder) => {
    builder
      // Appointments
      .addCase(getAppointments.pending, (state) => {
        state.appointments.isLoading = true
        state.appointments.error = null
      })
      .addCase(getAppointments.fulfilled, (state, action) => {
        state.appointments.isLoading = false
        state.appointments.list = action.payload.appointments || action.payload
        if (action.payload.pagination) {
          state.appointments.pagination = action.payload.pagination
        }
        state.appointments.error = null
      })
      .addCase(getAppointments.rejected, (state, action) => {
        state.appointments.isLoading = false
        state.appointments.error = action.payload
      })
      
      .addCase(getAppointment.pending, (state) => {
        state.appointments.isLoading = true
        state.appointments.error = null
      })
      .addCase(getAppointment.fulfilled, (state, action) => {
        state.appointments.isLoading = false
        state.appointments.current = action.payload
        state.appointments.error = null
      })
      .addCase(getAppointment.rejected, (state, action) => {
        state.appointments.isLoading = false
        state.appointments.error = action.payload
      })
      
      .addCase(createAppointment.pending, (state) => {
        state.appointments.isLoading = true
        state.appointments.error = null
      })
      .addCase(createAppointment.fulfilled, (state, action) => {
        state.appointments.isLoading = false
        state.appointments.list.unshift(action.payload)
        state.appointments.error = null
      })
      .addCase(createAppointment.rejected, (state, action) => {
        state.appointments.isLoading = false
        state.appointments.error = action.payload
      })
      
      .addCase(updateAppointment.pending, (state) => {
        state.appointments.isLoading = true
        state.appointments.error = null
      })
      .addCase(updateAppointment.fulfilled, (state, action) => {
        state.appointments.isLoading = false
        const index = state.appointments.list.findIndex(a => a.id === action.payload.id)
        if (index !== -1) {
          state.appointments.list[index] = action.payload
        }
        if (state.appointments.current?.id === action.payload.id) {
          state.appointments.current = action.payload
        }
        state.appointments.error = null
      })
      .addCase(updateAppointment.rejected, (state, action) => {
        state.appointments.isLoading = false
        state.appointments.error = action.payload
      })
      
      .addCase(deleteAppointment.pending, (state) => {
        state.appointments.isLoading = true
        state.appointments.error = null
      })
      .addCase(deleteAppointment.fulfilled, (state, action) => {
        state.appointments.isLoading = false
        state.appointments.list = state.appointments.list.filter(a => a.id !== action.payload)
        if (state.appointments.current?.id === action.payload) {
          state.appointments.current = null
        }
        state.appointments.error = null
      })
      .addCase(deleteAppointment.rejected, (state, action) => {
        state.appointments.isLoading = false
        state.appointments.error = action.payload
      })
      
      // Available Slots
      .addCase(getAvailableSlots.pending, (state) => {
        state.availableSlots.isLoading = true
        state.availableSlots.error = null
      })
      .addCase(getAvailableSlots.fulfilled, (state, action) => {
        state.availableSlots.isLoading = false
        state.availableSlots.data = action.payload
        state.availableSlots.error = null
      })
      .addCase(getAvailableSlots.rejected, (state, action) => {
        state.availableSlots.isLoading = false
        state.availableSlots.error = action.payload
      })
  }
})

export const {
  clearAppointmentError,
  setCurrentAppointment,
  clearCurrentAppointment,
  updateAppointmentInList,
  removeAppointmentFromList
} = appointmentSlice.actions

export default appointmentSlice.reducer