import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { notificationService } from '../../services/manager'

// Async thunks
export const getNotifications = createAsyncThunk(
  'notification/getNotifications',
  async (params, { rejectWithValue }) => {
    try {
      const result = await notificationService.getNotifications(params)
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

export const getNotification = createAsyncThunk(
  'notification/getNotification',
  async (notificationId, { rejectWithValue }) => {
    try {
      const result = await notificationService.getNotification(notificationId)
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

export const createNotification = createAsyncThunk(
  'notification/createNotification',
  async (notificationData, { rejectWithValue }) => {
    try {
      const result = await notificationService.createNotification(notificationData)
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

export const updateNotification = createAsyncThunk(
  'notification/updateNotification',
  async ({ notificationId, notificationData }, { rejectWithValue }) => {
    try {
      const result = await notificationService.updateNotification(notificationId, notificationData)
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

export const deleteNotification = createAsyncThunk(
  'notification/deleteNotification',
  async (notificationId, { rejectWithValue }) => {
    try {
      const result = await notificationService.deleteNotification(notificationId)
      if (result.success) {
        return notificationId
      } else {
        return rejectWithValue(result.error)
      }
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const markNotificationAsRead = createAsyncThunk(
  'notification/markAsRead',
  async (notificationId, { rejectWithValue }) => {
    try {
      const result = await notificationService.markNotificationAsRead(notificationId)
      if (result.success) {
        return notificationId
      } else {
        return rejectWithValue(result.error)
      }
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const getUnreadCount = createAsyncThunk(
  'notification/getUnreadCount',
  async (_, { rejectWithValue }) => {
    try {
      const result = await notificationService.getUnreadCount()
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
  notifications: {
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
  unreadCount: {
    count: 0,
    isLoading: false,
    error: null
  },
  stats: {
    data: null,
    isLoading: false,
    error: null
  }
}

// Notification slice
const notificationSlice = createSlice({
  name: 'notification',
  initialState,
  reducers: {
    clearNotificationError: (state) => {
      state.notifications.error = null
      state.unreadCount.error = null
      state.stats.error = null
    },
    setCurrentNotification: (state, action) => {
      state.notifications.current = action.payload
    },
    clearCurrentNotification: (state) => {
      state.notifications.current = null
    },
    updateNotificationInList: (state, action) => {
      const index = state.notifications.list.findIndex(n => n.id === action.payload.id)
      if (index !== -1) {
        state.notifications.list[index] = action.payload
      }
    },
    removeNotificationFromList: (state, action) => {
      state.notifications.list = state.notifications.list.filter(n => n.id !== action.payload)
    },
    markAsReadInList: (state, action) => {
      const notification = state.notifications.list.find(n => n.id === action.payload)
      if (notification) {
        notification.isRead = true
      }
      if (state.unreadCount.count > 0) {
        state.unreadCount.count -= 1
      }
    },
    decrementUnreadCount: (state) => {
      if (state.unreadCount.count > 0) {
        state.unreadCount.count -= 1
      }
    },
    incrementUnreadCount: (state) => {
      state.unreadCount.count += 1
    }
  },
  extraReducers: (builder) => {
    builder
      // Notifications
      .addCase(getNotifications.pending, (state) => {
        state.notifications.isLoading = true
        state.notifications.error = null
      })
      .addCase(getNotifications.fulfilled, (state, action) => {
        state.notifications.isLoading = false
        state.notifications.list = action.payload.notifications || action.payload
        if (action.payload.pagination) {
          state.notifications.pagination = action.payload.pagination
        }
        state.notifications.error = null
      })
      .addCase(getNotifications.rejected, (state, action) => {
        state.notifications.isLoading = false
        state.notifications.error = action.payload
      })
      
      .addCase(getNotification.pending, (state) => {
        state.notifications.isLoading = true
        state.notifications.error = null
      })
      .addCase(getNotification.fulfilled, (state, action) => {
        state.notifications.isLoading = false
        state.notifications.current = action.payload
        state.notifications.error = null
      })
      .addCase(getNotification.rejected, (state, action) => {
        state.notifications.isLoading = false
        state.notifications.error = action.payload
      })
      
      .addCase(createNotification.pending, (state) => {
        state.notifications.isLoading = true
        state.notifications.error = null
      })
      .addCase(createNotification.fulfilled, (state, action) => {
        state.notifications.isLoading = false
        state.notifications.list.unshift(action.payload)
        state.notifications.error = null
      })
      .addCase(createNotification.rejected, (state, action) => {
        state.notifications.isLoading = false
        state.notifications.error = action.payload
      })
      
      .addCase(updateNotification.pending, (state) => {
        state.notifications.isLoading = true
        state.notifications.error = null
      })
      .addCase(updateNotification.fulfilled, (state, action) => {
        state.notifications.isLoading = false
        const index = state.notifications.list.findIndex(n => n.id === action.payload.id)
        if (index !== -1) {
          state.notifications.list[index] = action.payload
        }
        if (state.notifications.current?.id === action.payload.id) {
          state.notifications.current = action.payload
        }
        state.notifications.error = null
      })
      .addCase(updateNotification.rejected, (state, action) => {
        state.notifications.isLoading = false
        state.notifications.error = action.payload
      })
      
      .addCase(deleteNotification.pending, (state) => {
        state.notifications.isLoading = true
        state.notifications.error = null
      })
      .addCase(deleteNotification.fulfilled, (state, action) => {
        state.notifications.isLoading = false
        state.notifications.list = state.notifications.list.filter(n => n.id !== action.payload)
        if (state.notifications.current?.id === action.payload) {
          state.notifications.current = null
        }
        state.notifications.error = null
      })
      .addCase(deleteNotification.rejected, (state, action) => {
        state.notifications.isLoading = false
        state.notifications.error = action.payload
      })
      
      // Mark as Read
      .addCase(markNotificationAsRead.pending, (state) => {
        state.notifications.isLoading = true
        state.notifications.error = null
      })
      .addCase(markNotificationAsRead.fulfilled, (state, action) => {
        state.notifications.isLoading = false
        const notification = state.notifications.list.find(n => n.id === action.payload)
        if (notification) {
          notification.isRead = true
        }
        if (state.unreadCount.count > 0) {
          state.unreadCount.count -= 1
        }
        state.notifications.error = null
      })
      .addCase(markNotificationAsRead.rejected, (state, action) => {
        state.notifications.isLoading = false
        state.notifications.error = action.payload
      })
      
      // Unread Count
      .addCase(getUnreadCount.pending, (state) => {
        state.unreadCount.isLoading = true
        state.unreadCount.error = null
      })
      .addCase(getUnreadCount.fulfilled, (state, action) => {
        state.unreadCount.isLoading = false
        state.unreadCount.count = action.payload.count || action.payload
        state.unreadCount.error = null
      })
      .addCase(getUnreadCount.rejected, (state, action) => {
        state.unreadCount.isLoading = false
        state.unreadCount.error = action.payload
      })
  }
})

export const {
  clearNotificationError,
  setCurrentNotification,
  clearCurrentNotification,
  updateNotificationInList,
  removeNotificationFromList,
  markAsReadInList,
  decrementUnreadCount,
  incrementUnreadCount
} = notificationSlice.actions

export default notificationSlice.reducer