import { apiClient } from '../api';
import API_ENDPOINTS from '../../constants/api/endpoints';

/**
 * Inquiry Service
 * Handles public inquiry submissions and OTP verification
 */
const inquiryService = {
    /**
     * Send OTP for inquiry
     * @param {string} phone - Customer phone number
     * @returns {Promise<Object>} Response from API
     */
    sendOTP: async (phone) => {
        try {
            const response = await apiClient.post(API_ENDPOINTS.inquiries.sendOtp, { phone });
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to send OTP' };
        }
    },

    /**
     * Create a new inquiry
     * @param {Object} data - Inquiry data
     * @param {string} data.business_id - ID of the business
     * @param {string} data.user_name - Customer name
     * @param {string} data.phone - Customer phone number
     * @param {string} data.otp - Verification OTP
     * @param {string} [data.inquiry_type] - Type of inquiry
     * @returns {Promise<Object>} Response from API
     */
    createInquiry: async (data) => {
        try {
            const response = await apiClient.post(API_ENDPOINTS.inquiries.create, data);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to submit inquiry' };
        }
    }
};

export default inquiryService;
