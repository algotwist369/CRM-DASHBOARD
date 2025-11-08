import apiClient from '../api/client'
import { endpoints } from '../../constants/api/endpoints'
import { decodeToken } from '../../utils/auth/tokenUtils'

class AuthService {
  // Remember Me - Store credentials (encrypted in production)
  saveRememberMe(credentials, type = 'admin') {
    if (type === 'admin') {
      localStorage.setItem('rememberedEmail', credentials.email || '');
    } else {
      localStorage.setItem('rememberedUsername', credentials.username || '');
    }
    localStorage.setItem('rememberMeEnabled', 'true');
  }

  // Remember Me - Retrieve credentials
  getRememberedCredentials(type = 'admin') {
    const enabled = localStorage.getItem('rememberMeEnabled') === 'true';
    if (!enabled) return null;

    if (type === 'admin') {
      return {
        email: localStorage.getItem('rememberedEmail') || '',
        rememberMe: true
      };
    } else {
      // For manager and staff, use the same username storage
      return {
        username: localStorage.getItem('rememberedUsername') || '',
        rememberMe: true
      };
    }
  }

  // Remember Me - Clear saved credentials
  clearRememberMe() {
    localStorage.removeItem('rememberedEmail');
    localStorage.removeItem('rememberedUsername');
    localStorage.removeItem('rememberMeEnabled');
  }

  // Login user
  async login(credentials) {
    try {
      const response = await apiClient.post(endpoints.auth.login, credentials);
      const { accessToken, refreshToken, user } = response.data;

      if (!accessToken) {
        return { success: false, error: 'Invalid response from server' };
      }

      // Handle Remember Me
      if (credentials.rememberMe) {
        this.saveRememberMe(credentials, 'admin');
      } else {
        this.clearRememberMe();
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

  // Login manager with username and PIN
  async loginManager(credentials) {
    try {
      const response = await apiClient.post(endpoints.auth.login, credentials);
      const { accessToken, refreshToken, business } = response.data;

      if (!accessToken) {
        return { success: false, error: 'Invalid response from server' };
      }

      // Handle Remember Me for manager
      if (credentials.rememberMe) {
        this.saveRememberMe(credentials, 'manager');
      } else {
        this.clearRememberMe();
      }

      // Decode token to get user ID and role
      const decoded = decodeToken(accessToken);
      const userId = decoded?.id || null;
      const role = decoded?.role || 'manager';

      // Store auth data
      localStorage.setItem('authToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken || '');
      localStorage.setItem('userRole', role);
      if (userId) {
        localStorage.setItem('userId', userId);
      }
      
      // Create user object with business info
      const user = {
        id: userId,
        role: role,
        business: business || null
      };

      return { 
        success: true, 
        user, 
        token: accessToken,
        business: business 
      };
    } catch (error) {
      console.error('Manager login error in authService:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Login failed',
      };
    }
  }

  // Login staff with username and PIN
  async loginStaff(credentials) {
    try {
      const response = await apiClient.post(endpoints.auth.login, credentials);
      const { accessToken, refreshToken, business, manager } = response.data;

      if (!accessToken) {
        return { success: false, error: 'Invalid response from server' };
      }

      // Decode token to get user ID and role
      const decoded = decodeToken(accessToken);
      const userId = decoded?.id || null;
      const role = decoded?.role || 'staff';

      // Verify it's actually a staff role
      if (role !== 'staff') {
        return { success: false, error: 'Invalid credentials for staff login' };
      }

      // Handle Remember Me for staff
      if (credentials.rememberMe) {
        this.saveRememberMe(credentials, 'staff');
      } else {
        this.clearRememberMe();
      }

      // Store auth data
      localStorage.setItem('authToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken || '');
      localStorage.setItem('userRole', role);
      if (userId) {
        localStorage.setItem('userId', userId);
      }
      
      // Create user object with business and manager info
      const user = {
        id: userId,
        role: role,
        business: business || null,
        manager: manager || null
      };

      return { 
        success: true, 
        user, 
        token: accessToken,
        business: business,
        manager: manager
      };
    } catch (error) {
      console.error('Staff login error in authService:', error);
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
      const refreshToken = localStorage.getItem('refreshToken')
      if (!refreshToken) {
        throw new Error('No refresh token available')
      }
      
      const response = await apiClient.post(endpoints.auth.refresh, { token: refreshToken })
      const { accessToken, refreshToken: newRefreshToken } = response.data

      localStorage.setItem('authToken', accessToken)
      if (newRefreshToken) {
        localStorage.setItem('refreshToken', newRefreshToken)
      }
      return { success: true, token: accessToken }
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