import apiClient from '../api/client'
import { endpoints } from '../../constants/api/endpoints'

class LeadAnalyticsService {
    /**
     * Get today's analytics summary
     */
    async getSummary(params = {}) {
        try {
            const response = await apiClient.get(endpoints.leads.analytics.summary, { params })
            return { success: true, data: response.data.data }
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || 'Failed to fetch analytics summary'
            }
        }
    }

    /**
     * Get breakdown by business
     * @param {object} params - { date, page, limit, sortBy, order }
     */
    async getBusinessBreakdown(params = {}) {
        try {
            const response = await apiClient.get(endpoints.leads.analytics.businessBreakdown, { params })
            return { success: true, data: response.data }
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || 'Failed to fetch business breakdown'
            }
        }
    }

    /**
     * Get IP journeys
     * @param {object} params - { page, limit }
     */
    async getIpJourneys(params = {}) {
        try {
            const response = await apiClient.get(endpoints.leads.analytics.ipJourneys, { params })
            return { success: true, data: response.data }
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || 'Failed to fetch IP journeys'
            }
        }
    }

    /**
     * Get source breakdown
     * @param {object} params - { date, startDate, endDate, businessId }
     */
    async getSourceBreakdown(params = {}) {
        try {
            const response = await apiClient.get(endpoints.leads.analytics.sourceBreakdown, { params })
            // Backend returns {success: true, data: [...]}
            // Axios wraps this in response.data
            // So we need response.data.data to get the actual array
            return response.data
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || 'Failed to fetch source breakdown'
            }
        }
    }

    /**
     * Get available sources/platforms
     */
    async getAvailableSources() {
        try {
            const response = await apiClient.get(endpoints.leads.analytics.availableSources)
            return response.data
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || 'Failed to fetch available sources'
            }
        }
    }
}

export default new LeadAnalyticsService()
