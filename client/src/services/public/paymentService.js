import apiClient from '../api/client';

export const paymentService = {
    createOrder: async (amount, currency = 'INR', receipt, businessId) => {
        try {
            const response = await apiClient.post('/payments/create-order', {
                amount,
                currency,
                receipt,
                businessId
            });
            return response.data;
        } catch (error) {
            throw error.response?.data?.message || 'Failed to create payment order';
        }
    },

    verifyPayment: async (paymentData) => {
        try {
            const response = await apiClient.post('/payments/verify-payment', paymentData);
            return response.data;
        } catch (error) {
            throw error.response?.data?.message || 'Payment verification failed';
        }
    },

    getRazorpayKey: async () => {
        try {
            const response = await apiClient.get('/payments/get-key');
            return response.data.key;
        } catch (error) {
            console.error('Failed to fetch Razorpay key:', error);
            return null;
        }
    }
};
