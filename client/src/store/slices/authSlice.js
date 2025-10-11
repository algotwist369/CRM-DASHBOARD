import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { authService } from '../../services/auth'

// Async thunks
export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (credentials, { rejectWithValue }) => {
    try {
      const result = await authService.login(credentials)
      if (result.success) {
        return result
      } else {
        return rejectWithValue(result.error)
      }
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const registerUser = createAsyncThunk(
  'auth/registerUser',
  async (userData, { rejectWithValue }) => {
    try {
      const result = await authService.register(userData)
      if (result.success) {
        return result
      } else {
        return rejectWithValue(result.error)
      }
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const logoutUser = createAsyncThunk(
  'auth/logoutUser',
  async (_, { rejectWithValue }) => {
    try {
      await authService.logout()
      return { success: true }
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const verifyToken = createAsyncThunk(
  'auth/verifyToken',
  async (_, { rejectWithValue }) => {
    try {
      const result = await authService.verifyToken()
      if (result.success) {
        return result
      } else {
        return rejectWithValue(result.error)
      }
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const refreshToken = createAsyncThunk(
  'auth/refreshToken',
  async (_, { rejectWithValue }) => {
    try {
      const result = await authService.refreshToken()
      if (result.success) {
        return result
      } else {
        return rejectWithValue(result.error)
      }
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const verifyOTP = createAsyncThunk(
  'auth/verifyOTP',
  async (otpData, { rejectWithValue }) => {
    try {
      const result = await authService.verifyOTP(otpData.otp, otpData.type)
      if (result.success) {
        return result
      } else {
        return rejectWithValue(result.error)
      }
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const resendOTP = createAsyncThunk(
  'auth/resendOTP',
  async (type, { rejectWithValue }) => {
    try {
      const result = await authService.resendOTP(type)
      if (result.success) {
        return result
      } else {
        return rejectWithValue(result.error)
      }
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const forgotPassword = createAsyncThunk(
  'auth/forgotPassword',
  async (email, { rejectWithValue }) => {
    try {
      const result = await authService.forgotPassword(email)
      if (result.success) {
        return result
      } else {
        return rejectWithValue(result.error)
      }
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const resetPassword = createAsyncThunk(
  'auth/resetPassword',
  async (resetData, { rejectWithValue }) => {
    try {
      const result = await authService.resetPassword(resetData.token, resetData.password)
      if (result.success) {
        return result
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
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  otp: {
    isSent: false,
    isVerified: false,
    attempts: 0,
    maxAttempts: 3
  },
  passwordReset: {
    isRequested: false,
    isReset: false
  },
  registration: {
    isCompleted: false,
    emailVerified: false
  }
}

// Auth slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    clearAuth: (state) => {
      state.user = null
      state.token = null
      state.isAuthenticated = false
      state.error = null
      state.otp = {
        isSent: false,
        isVerified: false,
        attempts: 0,
        maxAttempts: 3
      }
      state.passwordReset = {
        isRequested: false,
        isReset: false
      }
      state.registration = {
        isCompleted: false,
        emailVerified: false
      }
    },
    setUser: (state, action) => {
      state.user = action.payload
      state.isAuthenticated = true
    },
    setToken: (state, action) => {
      state.token = action.payload
    },
    incrementOTPAttempts: (state) => {
      state.otp.attempts += 1
    },
    resetOTPAttempts: (state) => {
      state.otp.attempts = 0
    },
    setOTPSent: (state, action) => {
      state.otp.isSent = action.payload
    },
    setOTPVerified: (state, action) => {
      state.otp.isVerified = action.payload
    },
    setPasswordResetRequested: (state, action) => {
      state.passwordReset.isRequested = action.payload
    },
    setPasswordReset: (state, action) => {
      state.passwordReset.isReset = action.payload
    },
    setRegistrationCompleted: (state, action) => {
      state.registration.isCompleted = action.payload
    },
    setEmailVerified: (state, action) => {
      state.registration.emailVerified = action.payload
    }
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false
        state.user = action.payload.user
        state.token = action.payload.token
        state.isAuthenticated = true
        state.error = null
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
        state.isAuthenticated = false
      })
      
      // Register
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false
        state.registration.isCompleted = true
        state.error = null
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      
      // Logout
      .addCase(logoutUser.pending, (state) => {
        state.isLoading = true
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.isLoading = false
        state.user = null
        state.token = null
        state.isAuthenticated = false
        state.error = null
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      
      // Verify Token
      .addCase(verifyToken.pending, (state) => {
        state.isLoading = true
      })
      .addCase(verifyToken.fulfilled, (state, action) => {
        state.isLoading = false
        state.user = action.payload.user
        state.isAuthenticated = true
        state.error = null
      })
      .addCase(verifyToken.rejected, (state, action) => {
        state.isLoading = false
        state.user = null
        state.token = null
        state.isAuthenticated = false
        state.error = action.payload
      })
      
      // Refresh Token
      .addCase(refreshToken.pending, (state) => {
        state.isLoading = true
      })
      .addCase(refreshToken.fulfilled, (state, action) => {
        state.isLoading = false
        state.token = action.payload.token
        state.error = null
      })
      .addCase(refreshToken.rejected, (state, action) => {
        state.isLoading = false
        state.user = null
        state.token = null
        state.isAuthenticated = false
        state.error = action.payload
      })
      
      // Verify OTP
      .addCase(verifyOTP.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(verifyOTP.fulfilled, (state, action) => {
        state.isLoading = false
        state.otp.isVerified = true
        state.error = null
      })
      .addCase(verifyOTP.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
        state.otp.attempts += 1
      })
      
      // Resend OTP
      .addCase(resendOTP.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(resendOTP.fulfilled, (state, action) => {
        state.isLoading = false
        state.otp.isSent = true
        state.error = null
      })
      .addCase(resendOTP.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      
      // Forgot Password
      .addCase(forgotPassword.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(forgotPassword.fulfilled, (state, action) => {
        state.isLoading = false
        state.passwordReset.isRequested = true
        state.error = null
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      
      // Reset Password
      .addCase(resetPassword.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(resetPassword.fulfilled, (state, action) => {
        state.isLoading = false
        state.passwordReset.isReset = true
        state.error = null
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
  }
})

export const {
  clearError,
  clearAuth,
  setUser,
  setToken,
  incrementOTPAttempts,
  resetOTPAttempts,
  setOTPSent,
  setOTPVerified,
  setPasswordResetRequested,
  setPasswordReset,
  setRegistrationCompleted,
  setEmailVerified
} = authSlice.actions

export default authSlice.reducer