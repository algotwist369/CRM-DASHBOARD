import { createSelector } from '@reduxjs/toolkit'

// Base selectors
const getAuthState = (state) => state.auth

// Auth selectors
export const selectUser = createSelector(
  [getAuthState],
  (auth) => auth.user
)

export const selectToken = createSelector(
  [getAuthState],
  (auth) => auth.token
)

export const selectIsAuthenticated = createSelector(
  [getAuthState],
  (auth) => auth.isAuthenticated
)

export const selectIsLoading = createSelector(
  [getAuthState],
  (auth) => auth.isLoading
)

export const selectError = createSelector(
  [getAuthState],
  (auth) => auth.error
)

export const selectUserRole = createSelector(
  [selectUser],
  (user) => user?.role
)

export const selectUserId = createSelector(
  [selectUser],
  (user) => user?.id
)

export const selectUserEmail = createSelector(
  [selectUser],
  (user) => user?.email
)

export const selectUserName = createSelector(
  [selectUser],
  (user) => user?.name || user?.firstName + ' ' + user?.lastName
)

export const selectUserAvatar = createSelector(
  [selectUser],
  (user) => user?.avatar
)

export const selectUserPermissions = createSelector(
  [selectUser],
  (user) => user?.permissions || []
)

// OTP selectors
export const selectOTP = createSelector(
  [getAuthState],
  (auth) => auth.otp
)

export const selectOTPIsSent = createSelector(
  [selectOTP],
  (otp) => otp.isSent
)

export const selectOTPIsVerified = createSelector(
  [selectOTP],
  (otp) => otp.isVerified
)

export const selectOTPAttempts = createSelector(
  [selectOTP],
  (otp) => otp.attempts
)

export const selectOTPMaxAttempts = createSelector(
  [selectOTP],
  (otp) => otp.maxAttempts
)

export const selectOTPExceeded = createSelector(
  [selectOTPAttempts, selectOTPMaxAttempts],
  (attempts, maxAttempts) => attempts >= maxAttempts
)

// Password reset selectors
export const selectPasswordReset = createSelector(
  [getAuthState],
  (auth) => auth.passwordReset
)

export const selectPasswordResetRequested = createSelector(
  [selectPasswordReset],
  (passwordReset) => passwordReset.isRequested
)

export const selectPasswordResetCompleted = createSelector(
  [selectPasswordReset],
  (passwordReset) => passwordReset.isReset
)

// Registration selectors
export const selectRegistration = createSelector(
  [getAuthState],
  (auth) => auth.registration
)

export const selectRegistrationCompleted = createSelector(
  [selectRegistration],
  (registration) => registration.isCompleted
)

export const selectEmailVerified = createSelector(
  [selectRegistration],
  (registration) => registration.emailVerified
)

// Role-based selectors
export const selectIsAdmin = createSelector(
  [selectUserRole],
  (role) => role === 'admin'
)

export const selectIsManager = createSelector(
  [selectUserRole],
  (role) => role === 'manager'
)

export const selectIsStaff = createSelector(
  [selectUserRole],
  (role) => role === 'staff'
)

export const selectIsCustomer = createSelector(
  [selectUserRole],
  (role) => role === 'customer'
)

export const selectHasRole = createSelector(
  [selectUserRole],
  (role) => (requiredRole) => role === requiredRole
)

export const selectHasAnyRole = createSelector(
  [selectUserRole],
  (role) => (roles) => roles.includes(role)
)

export const selectHasPermission = createSelector(
  [selectUserPermissions],
  (permissions) => (permission) => permissions.includes(permission)
)

export const selectHasAnyPermission = createSelector(
  [selectUserPermissions],
  (permissions) => (requiredPermissions) => 
    requiredPermissions.some(permission => permissions.includes(permission))
)

// Auth status selectors
export const selectAuthStatus = createSelector(
  [selectIsAuthenticated, selectIsLoading, selectError],
  (isAuthenticated, isLoading, error) => ({
    isAuthenticated,
    isLoading,
    error,
    isReady: !isLoading && (isAuthenticated || error)
  })
)

export const selectLoginStatus = createSelector(
  [selectIsLoading, selectError],
  (isLoading, error) => ({
    isLoading,
    error,
    isSuccess: !isLoading && !error
  })
)

export const selectLogoutStatus = createSelector(
  [selectIsLoading, selectError],
  (isLoading, error) => ({
    isLoading,
    error,
    isSuccess: !isLoading && !error
  })
)

// Combined selectors
export const selectAuthUser = createSelector(
  [selectUser, selectUserRole, selectUserPermissions],
  (user, role, permissions) => ({
    ...user,
    role,
    permissions
  })
)

export const selectAuthState = createSelector(
  [selectIsAuthenticated, selectUser, selectToken, selectIsLoading, selectError],
  (isAuthenticated, user, token, isLoading, error) => ({
    isAuthenticated,
    user,
    token,
    isLoading,
    error
  })
)
