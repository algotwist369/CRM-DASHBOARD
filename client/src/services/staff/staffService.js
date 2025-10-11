import apiClient from '../api/client'
import { endpoints } from '../../../constants/api/endpoints'

class StaffService {
  // Get staff profile
  async getProfile() {
    try {
      const response = await apiClient.get(endpoints.staff.profile)
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch profile' 
      }
    }
  }

  // Update staff profile
  async updateProfile(profileData) {
    try {
      const response = await apiClient.put(endpoints.staff.updateProfile, profileData)
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to update profile' 
      }
    }
  }

  // Get business information
  async getBusiness() {
    try {
      const response = await apiClient.get(endpoints.staff.business)
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch business information' 
      }
    }
  }
}

export default new StaffService()