import apiClient from '../api/client'
import { endpoints } from '../../constants/api/endpoints'

class AdminService {
  // Get admin dashboard
  async getDashboard(page = 1, limit = 5) {
    try {
      const response = await apiClient.get(endpoints.admin.dashboard, {
        params: { page, limit }
      })
      return { success: true, data: response.data }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch dashboard'
      }
    }
  }

  // Get managers
  async getManagers(params = {}) {
    try {
      const response = await apiClient.get(endpoints.admin.managers, { params })
      // Backend returns { success: true, data: [...], pagination: {...} }
      // Return it directly to maintain structure
      return response.data
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch managers'
      }
    }
  }

  // Get manager by ID
  async getManager(managerId) {
    try {
      const response = await apiClient.get(endpoints.admin.manager(managerId))
      return response.data
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch manager'
      }
    }
  }

  // Create manager
  async createManager(managerData) {
    try {
      const response = await apiClient.post(endpoints.admin.createManager, managerData)
      return response.data
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to create manager'
      }
    }
  }

  // Update manager
  async updateManager(managerId, managerData) {
    try {
      const response = await apiClient.put(endpoints.admin.updateManager(managerId), managerData)
      return response.data
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to update manager'
      }
    }
  }

  // Delete manager
  async deleteManager(managerId) {
    try {
      const response = await apiClient.delete(endpoints.admin.deleteManager(managerId))
      return response.data
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to delete manager'
      }
    }
  }

  // Get daily business records (Admin access)
  async getDailyBusinessRecords(params = {}) {
    try {
      const response = await apiClient.get(endpoints.dailyBusiness.list, { params })
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch daily business records' 
      }
    }
  }

  // Get daily summary (Admin access)
  async getDailySummary(params = {}) {
    try {
      const response = await apiClient.get(endpoints.dailyBusiness.getSummary, { params })
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch daily summary' 
      }
    }
  }

  // Get business analytics (Admin access)
  async getBusinessAnalytics(params = {}) {
    try {
      const response = await apiClient.get(endpoints.dailyBusiness.getAnalytics, { params })
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch business analytics' 
      }
    }
  }

  // Get daily business list (Admin access)
  async getDailyBusinessList(params = {}) {
    try {
      const response = await apiClient.get(endpoints.dailyBusiness.list, { params })
      return { success: true, ...response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch daily business list' 
      }
    }
  }

  // ================== ADMIN NOTIFICATIONS ==================

  // Get admin notifications
  async getNotifications(params = {}) {
    try {
      const response = await apiClient.get(endpoints.admin.notifications, { params })
      return { success: true, ...response.data }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch notifications'
      }
    }
  }

  // Get unread notification count
  async getUnreadNotificationCount() {
    try {
      const response = await apiClient.get(endpoints.admin.unreadCount)
      return { success: true, ...response.data }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch unread count'
      }
    }
  }

  // Get recent notifications
  async getRecentNotifications(limit = 5) {
    try {
      const response = await apiClient.get(endpoints.admin.recentNotifications, {
        params: { limit }
      })
      return { success: true, ...response.data }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch recent notifications'
      }
    }
  }

  // Mark notification as read
  async markNotificationAsRead(notificationId) {
    try {
      const response = await apiClient.put(endpoints.admin.markNotificationRead(notificationId))
      return { success: true, ...response.data }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to mark notification as read'
      }
    }
  }

  // Mark all notifications as read
  async markAllNotificationsAsRead() {
    try {
      const response = await apiClient.put(endpoints.admin.markAllNotificationsRead)
      return { success: true, ...response.data }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to mark all notifications as read'
      }
    }
  }

  // Delete notification
  async deleteNotification(notificationId) {
    try {
      const response = await apiClient.delete(endpoints.admin.deleteNotification(notificationId))
      return { success: true, ...response.data }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to delete notification'
      }
    }
  }

  // Delete all notifications
  async deleteAllNotifications() {
    try {
      const response = await apiClient.delete(endpoints.admin.deleteAllNotifications)
      return { success: true, ...response.data }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to delete all notifications'
      }
    }
  }

  // ================== BUSINESS MANAGEMENT ==================

  // Create business
  async createBusiness(businessData) {
    try {
      const response = await apiClient.post(endpoints.admin.createBusiness, businessData)
      return { success: true, ...response.data }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to create business'
      }
    }
  }

  // Get all businesses
  async getBusinesses(params = {}) {
    try {
      const response = await apiClient.get(endpoints.admin.businesses, { params })
      return { success: true, ...response.data }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch businesses'
      }
    }
  }

  // Get business link
  async getBusinessLink(businessId) {
    try {
      const response = await apiClient.get(endpoints.admin.businessLink(businessId))
      return { success: true, ...response.data }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch business link'
      }
    }
  }

  // Get business by ID
  async getBusinessById(businessId) {
    try {
      const response = await apiClient.get(endpoints.admin.business(businessId))
      return { success: true, ...response.data }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch business'
      }
    }
  }

  // Update business
  async updateBusiness(businessId, businessData) {
    try {
      const response = await apiClient.put(endpoints.admin.updateBusiness(businessId), businessData)
      return { success: true, ...response.data }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to update business'
      }
    }
  }

  // Delete business
  async deleteBusiness(businessId) {
    try {
      const response = await apiClient.delete(endpoints.admin.deleteBusiness(businessId))
      return { success: true, ...response.data }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to delete business'
      }
    }
  }

  // ============ CAMPAIGN MANAGEMENT ============
  
  // Get all campaigns
  async getCampaigns(params = {}) {
    try {
      const response = await apiClient.get(endpoints.campaigns.list, { params })
      return response.data
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch campaigns'
      }
    }
  }

  // Get campaign stats
  async getCampaignStats(params = {}) {
    try {
      const response = await apiClient.get(endpoints.campaigns.stats, { params })
      return response.data
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch campaign stats'
      }
    }
  }

  // Get campaign by ID
  async getCampaign(id) {
    try {
      const response = await apiClient.get(endpoints.campaigns.getById(id))
      return response.data
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch campaign'
      }
    }
  }

  // Create campaign
  async createCampaign(campaignData) {
    try {
      const response = await apiClient.post(endpoints.campaigns.create, campaignData)
      return response.data
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to create campaign'
      }
    }
  }

  // Update campaign
  async updateCampaign(id, campaignData) {
    try {
      const response = await apiClient.put(endpoints.campaigns.update(id), campaignData)
      return response.data
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to update campaign'
      }
    }
  }

  // Delete campaign
  async deleteCampaign(id) {
    try {
      const response = await apiClient.delete(endpoints.campaigns.delete(id))
      return response.data
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to delete campaign'
      }
    }
  }

  // Launch campaign
  async launchCampaign(id) {
    try {
      const response = await apiClient.post(endpoints.campaigns.launch(id))
      return response.data
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to launch campaign'
      }
    }
  }

  // Cancel campaign
  async cancelCampaign(id) {
    try {
      const response = await apiClient.post(endpoints.campaigns.cancel(id))
      return response.data
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to cancel campaign'
      }
    }
  }

  // Clone campaign
  async cloneCampaign(id) {
    try {
      const response = await apiClient.post(endpoints.campaigns.clone(id))
      return response.data
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to clone campaign'
      }
    }
  }

  // ============ CAMPAIGN TEMPLATES ============

  // Get campaign templates
  async getCampaignTemplates(params = {}) {
    try {
      const response = await apiClient.get(endpoints.campaigns.templates, { params })
      return response.data
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch templates'
      }
    }
  }

  // Get popular templates
  async getPopularTemplates() {
    try {
      const response = await apiClient.get(endpoints.campaigns.popularTemplates)
      return response.data
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch popular templates'
      }
    }
  }

  // Get template by ID
  async getCampaignTemplate(id) {
    try {
      const response = await apiClient.get(endpoints.campaigns.getTemplate(id))
      return response.data
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch template'
      }
    }
  }

  // Create campaign template
  async createCampaignTemplate(templateData) {
    try {
      const response = await apiClient.post(endpoints.campaigns.createTemplate, templateData)
      return response.data
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to create template'
      }
    }
  }

  // Update campaign template
  async updateCampaignTemplate(id, templateData) {
    try {
      const response = await apiClient.put(endpoints.campaigns.updateTemplate(id), templateData)
      return response.data
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to update template'
      }
    }
  }

  // Delete campaign template
  async deleteCampaignTemplate(id) {
    try {
      const response = await apiClient.delete(endpoints.campaigns.deleteTemplate(id))
      return response.data
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to delete template'
      }
    }
  }

  // ============ CAMPAIGN ANALYTICS ============

  // Get campaign insights
  async getCampaignInsights() {
    try {
      const response = await apiClient.get(endpoints.campaigns.insights)
      return response.data
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch insights'
      }
    }
  }

  // Compare campaigns
  async compareCampaigns(campaignIds) {
    try {
      const response = await apiClient.post(endpoints.campaigns.compareCampaigns, { campaignIds })
      return response.data
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to compare campaigns'
      }
    }
  }

  // Get best time to send
  async getBestTimeToSend() {
    try {
      const response = await apiClient.get(endpoints.campaigns.bestTimeToSend)
      return response.data
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch best time'
      }
    }
  }
}

export default new AdminService()
