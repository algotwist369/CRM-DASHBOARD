import { apiClient, API_ENDPOINTS, buildEndpoint } from '../api'

class StaffService {
  // Get all staff
  async getStaff(params = {}) {
    try {
      const endpoint = buildEndpoint(API_ENDPOINTS.MANAGER.STAFF, params)
      const response = await apiClient.get(endpoint)
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch staff' 
      }
    }
  }

  // Get single staff member
  async getStaffMember(staffId) {
    try {
      const response = await apiClient.get(API_ENDPOINTS.MANAGER.STAFF_MEMBER(staffId))
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch staff member' 
      }
    }
  }

  // Create staff member
  async createStaff(staffData) {
    try {
      const response = await apiClient.post(API_ENDPOINTS.MANAGER.STAFF, staffData)
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to create staff member' 
      }
    }
  }

  // Update staff member
  async updateStaff(staffId, staffData) {
    try {
      const response = await apiClient.put(API_ENDPOINTS.MANAGER.STAFF_MEMBER(staffId), staffData)
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to update staff member' 
      }
    }
  }

  // Delete staff member
  async deleteStaff(staffId) {
    try {
      const response = await apiClient.delete(API_ENDPOINTS.MANAGER.STAFF_MEMBER(staffId))
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to delete staff member' 
      }
    }
  }

  // Get staff statistics
  async getStaffStats() {
    try {
      const response = await apiClient.get('/staff/stats')
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch staff statistics' 
      }
    }
  }

  // Get staff performance
  async getStaffPerformance(staffId, period = '30d') {
    try {
      const response = await apiClient.get(`/staff/${staffId}/performance?period=${period}`)
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch staff performance' 
      }
    }
  }

  // Get staff appointments
  async getStaffAppointments(staffId, params = {}) {
    try {
      const endpoint = buildEndpoint(`/staff/${staffId}/appointments`, params)
      const response = await apiClient.get(endpoint)
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch staff appointments' 
      }
    }
  }

  // Get staff schedule
  async getStaffSchedule(staffId, params = {}) {
    try {
      const endpoint = buildEndpoint(`/staff/${staffId}/schedule`, params)
      const response = await apiClient.get(endpoint)
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch staff schedule' 
      }
    }
  }

  // Update staff schedule
  async updateStaffSchedule(staffId, schedule) {
    try {
      const response = await apiClient.patch(`/staff/${staffId}/schedule`, { schedule })
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to update staff schedule' 
      }
    }
  }

  // Get staff availability
  async getStaffAvailability(staffId, date) {
    try {
      const response = await apiClient.get(`/staff/${staffId}/availability?date=${date}`)
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch staff availability' 
      }
    }
  }

  // Update staff availability
  async updateStaffAvailability(staffId, availability) {
    try {
      const response = await apiClient.patch(`/staff/${staffId}/availability`, { availability })
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to update staff availability' 
      }
    }
  }

  // Get staff services
  async getStaffServices(staffId) {
    try {
      const response = await apiClient.get(`/staff/${staffId}/services`)
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch staff services' 
      }
    }
  }

  // Update staff services
  async updateStaffServices(staffId, services) {
    try {
      const response = await apiClient.patch(`/staff/${staffId}/services`, { services })
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to update staff services' 
      }
    }
  }

  // Update staff status
  async updateStaffStatus(staffId, status) {
    try {
      const response = await apiClient.patch(`/staff/${staffId}/status`, { status })
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to update staff status' 
      }
    }
  }

  // Update staff role
  async updateStaffRole(staffId, role) {
    try {
      const response = await apiClient.patch(`/staff/${staffId}/role`, { role })
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to update staff role' 
      }
    }
  }

  // Get staff roles
  async getStaffRoles() {
    try {
      const response = await apiClient.get('/staff/roles')
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch staff roles' 
      }
    }
  }

  // Get staff by role
  async getStaffByRole(role) {
    try {
      const response = await apiClient.get(`/staff/role/${role}`)
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch staff by role' 
      }
    }
  }

  // Get available staff
  async getAvailableStaff(date, time, serviceId) {
    try {
      const params = { date, time, serviceId }
      const endpoint = buildEndpoint('/staff/available', params)
      const response = await apiClient.get(endpoint)
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch available staff' 
      }
    }
  }

  // Get staff customers
  async getStaffCustomers(staffId, params = {}) {
    try {
      const endpoint = buildEndpoint(`/staff/${staffId}/customers`, params)
      const response = await apiClient.get(endpoint)
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch staff customers' 
      }
    }
  }

  // Get staff notes
  async getStaffNotes(staffId) {
    try {
      const response = await apiClient.get(`/staff/${staffId}/notes`)
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch staff notes' 
      }
    }
  }

  // Add staff note
  async addStaffNote(staffId, note) {
    try {
      const response = await apiClient.post(`/staff/${staffId}/notes`, { note })
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to add staff note' 
      }
    }
  }

  // Export staff data
  async exportStaffData(format = 'csv', filters = {}) {
    try {
      const params = { format, ...filters }
      const endpoint = buildEndpoint('/staff/export', params)
      const response = await apiClient.get(endpoint, { responseType: 'blob' })
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to export staff data' 
      }
    }
  }

  // Bulk update staff
  async bulkUpdateStaff(staffIds, updateData) {
    try {
      const response = await apiClient.patch('/staff/bulk-update', {
        staffIds,
        updateData
      })
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to bulk update staff' 
      }
    }
  }

  // Bulk delete staff
  async bulkDeleteStaff(staffIds) {
    try {
      const response = await apiClient.delete('/staff/bulk-delete', {
        data: { staffIds }
      })
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to bulk delete staff' 
      }
    }
  }
}

export default new StaffService()
