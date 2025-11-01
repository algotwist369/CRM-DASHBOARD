import apiClient from '../api/client'
import { endpoints } from '../../constants/api/endpoints'

class AuthService {
  // Login user
  async login(credentials) {
    try {
      const response = await apiClient.post(endpoints.auth.login, credentials);
      const { accessToken, refreshToken, user } = response.data;

      if (!accessToken) {
        return { success: false, error: 'Invalid response from server' };
      }

      // Store auth data
      localStorage.setItem('authToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken || '');
      // Ensure role is set for admin email/password logins even if server doesn't return user
      const roleToStore = user?.role || 'admin';
      localStorage.setItem('userRole', roleToStore);
      if (user?.id) {
        localStorage.setItem('userId', user.id);
      }

      return { success: true, user: user || { role: 'admin' }, token: accessToken };
    } catch (error) {
      console.error('Login error in authService:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Login failed',
      };
    }
  }


  // Register user
  async register(userData) {
    try {
      const response = await apiClient.post(endpoints.auth.register, userData)
      return { success: true, data: response.data }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Registration failed'
      }
    }
  }

  // Logout user
  async logout() {
    try {
      const token = localStorage.getItem('authToken')
      if (token) {
        await apiClient.post(endpoints.auth.logout, {}, {
          headers: { Authorization: `Bearer ${token}` }
        })
      }
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      // Clear local storage regardless of API call success
      localStorage.removeItem('authToken')
      localStorage.removeItem('userRole')
      localStorage.removeItem('userId')
    }
  }

  // Refresh token
  async refreshToken() {
    try {
      const response = await apiClient.post(endpoints.auth.refresh)
      const { token } = response.data

      localStorage.setItem('authToken', token)
      return { success: true, token }
    } catch (error) {
      // If refresh fails, logout user
      this.logout()
      return {
        success: false,
        error: error.response?.data?.message || 'Token refresh failed'
      }
    }
  }

  // Verify email
  async verifyEmail(token) {
    try {
      const response = await apiClient.post(API_ENDPOINTS.AUTH.VERIFY_EMAIL, { token })
      return { success: true, data: response.data }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Email verification failed'
      }
    }
  }

  // Resend verification email
  async resendVerification(email) {
    try {
      const response = await apiClient.post(API_ENDPOINTS.AUTH.RESEND_VERIFICATION, { email })
      return { success: true, data: response.data }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to resend verification email'
      }
    }
  }

  // Forgot password
  async forgotPassword(email) {
    try {
      const response = await apiClient.post(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, { email })
      return { success: true, data: response.data }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to send reset email'
      }
    }
  }

  // Reset password
  async resetPassword(token, newPassword) {
    try {
      const response = await apiClient.post(API_ENDPOINTS.AUTH.RESET_PASSWORD, {
        token,
        password: newPassword
      })
      return { success: true, data: response.data }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Password reset failed'
      }
    }
  }

  // Send OTP
  async sendOTP(email, type = 'email') {
    try {
      const response = await apiClient.post(endpoints.auth.sendOTP, { email, type })
      return { success: true, data: response.data }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to send OTP'
      }
    }
  }

  // Verify OTP
  async verifyOTP(otp, type = 'email') {
    try {
      const response = await apiClient.post(endpoints.auth.verifyOTP, { otp, type })
      return { success: true, data: response.data }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'OTP verification failed'
      }
    }
  }

  // Resend OTP
  async resendOTP(type = 'email') {
    try {
      const response = await apiClient.post(API_ENDPOINTS.AUTH.RESEND_OTP, { type })
      return { success: true, data: response.data }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to resend OTP'
      }
    }
  }

  // Verify token
  async verifyToken() {
    try {
      const token = localStorage.getItem('authToken')
      if (!token) {
        return { success: false, error: 'No token found' }
      }

      const response = await apiClient.get(API_ENDPOINTS.AUTH.VERIFY_TOKEN)

      return { success: true, user: response.data.user }
    } catch (error) {
      // Clear invalid token
      localStorage.removeItem('authToken')
      localStorage.removeItem('userRole')
      localStorage.removeItem('userId')

      return {
        success: false,
        error: error.response?.data?.message || 'Token verification failed'
      }
    }
  }

  // Get current user
  getCurrentUser() {
    const token = localStorage.getItem('authToken')
    const role = localStorage.getItem('userRole')
    const userId = localStorage.getItem('userId')

    if (!token || !role || !userId) {
      return null
    }

    return {
      id: userId,
      role,
      token
    }
  }

  // Check if user is authenticated
  isAuthenticated() {
    const token = localStorage.getItem('authToken')
    return !!token
  }

  // Get user role
  getUserRole() {
    return localStorage.getItem('userRole')
  }

  // Check if user has specific role
  hasRole(role) {
    const userRole = this.getUserRole()
    return userRole === role
  }

  // Check if user has any of the specified roles
  hasAnyRole(roles) {
    const userRole = this.getUserRole()
    return roles.includes(userRole)
  }

  // Get auth token
  getToken() {
    return localStorage.getItem('authToken')
  }

  // Set auth token
  setToken(token) {
    localStorage.setItem('authToken', token)
  }

  // Clear auth data
  clearAuth() {
    localStorage.removeItem('authToken')
    localStorage.removeItem('userRole')
    localStorage.removeItem('userId')
  }

  // Remove auth token from API client
  removeAuthToken() {
    delete apiClient.defaults.headers.common['Authorization']
  }

  // Update user profile
  async updateProfile(userData) {
    try {
      const response = await apiClient.put('/auth/profile', userData)
      return { success: true, data: response.data }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Profile update failed'
      }
    }
  }

  // Change password
  async changePassword(currentPassword, newPassword) {
    try {
      const response = await apiClient.put('/auth/change-password', {
        currentPassword,
        newPassword
      })
      return { success: true, data: response.data }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Password change failed'
      }
    }
  }

  // Delete account
  async deleteAccount(password) {
    try {
      const response = await apiClient.delete('/auth/account', {
        data: { password }
      })

      // Clear auth data after successful deletion
      this.clearAuth()

      return { success: true, data: response.data }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Account deletion failed'
      }
    }
  }
}

export default new AuthService()