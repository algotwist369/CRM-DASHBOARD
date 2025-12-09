import apiClient from '../api/client'

/**
 * Admin Expense Service
 * Handles all expense-related API calls for admin panel
 */
class AdminExpenseService {
    /**
     * Create new expense
     * @param {Object} expenseData - Expense data
     * @returns {Promise} Response with created expense
     */
    async createExpense(expenseData) {
        try {
            const response = await apiClient.post('/api/expenses', expenseData)
            return response.data
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || 'Failed to create expense'
            }
        }
    }

    /**
     * Get all expenses with filters
     * @param {Object} params - Query parameters (businessId, startDate, endDate, category, status, etc.)
     * @returns {Promise} Response with expense list and pagination
     */
    async getExpenses(params = {}) {
        try {
            const response = await apiClient.get('/api/expenses', { params })
            return response.data
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || 'Failed to fetch expenses'
            }
        }
    }

    /**
     * Get expense by ID
     * @param {string} id - Expense ID
     * @returns {Promise} Response with expense details
     */
    async getExpenseById(id) {
        try {
            const response = await apiClient.get(`/api/expenses/${id}`)
            return response.data
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || 'Failed to fetch expense'
            }
        }
    }

    /**
     * Update expense
     * @param {string} id - Expense ID
     * @param {Object} expenseData - Updated expense data
     * @returns {Promise} Response with updated expense
     */
    async updateExpense(id, expenseData) {
        try {
            const response = await apiClient.put(`/api/expenses/${id}`, expenseData)
            return response.data
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || 'Failed to update expense'
            }
        }
    }

    /**
     * Delete expense (pending only)
     * @param {string} id - Expense ID
     * @returns {Promise} Response
     */
    async deleteExpense(id) {
        try {
            const response = await apiClient.delete(`/api/expenses/${id}`)
            return response.data
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || 'Failed to delete expense'
            }
        }
    }

    /**
     * Approve expense
     * @param {string} id - Expense ID
     * @returns {Promise} Response with approved expense
     */
    async approveExpense(id) {
        try {
            const response = await apiClient.post(`/api/expenses/${id}/approve`)
            return response.data
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || 'Failed to approve expense'
            }
        }
    }

    /**
     * Reject expense
     * @param {string} id - Expense ID
     * @param {string} reason - Rejection reason
     * @returns {Promise} Response with rejected expense
     */
    async rejectExpense(id, reason) {
        try {
            const response = await apiClient.post(`/api/expenses/${id}/reject`, { reason })
            return response.data
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || 'Failed to reject expense'
            }
        }
    }

    /**
     * Mark expense as paid
     * @param {string} id - Expense ID
     * @returns {Promise} Response with updated expense
     */
    async markExpensePaid(id) {
        try {
            const response = await apiClient.post(`/api/expenses/${id}/mark-paid`)
            return response.data
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || 'Failed to mark expense as paid'
            }
        }
    }

    /**
     * Get expenses grouped by category
     * @param {string} businessId - Business ID
     * @param {string} startDate - Start date (ISO format)
     * @param {string} endDate - End date (ISO format)
     * @returns {Promise} Response with categorized expenses
     */
    async getExpensesByCategory(businessId, startDate, endDate) {
        try {
            const response = await apiClient.get('/api/expenses/reports/by-category', {
                params: { businessId, startDate, endDate }
            })
            return response.data
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || 'Failed to fetch expense report'
            }
        }
    }

    /**
     * Get pending expense approvals
     * @param {string} businessId - Business ID
     * @returns {Promise} Response with pending expenses
     */
    async getPendingApprovals(businessId) {
        try {
            const response = await apiClient.get('/api/expenses/pending-approvals', {
                params: { businessId }
            })
            return response.data
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || 'Failed to fetch pending approvals'
            }
        }
    }

    /**
     * Process recurring expenses (manual trigger)
     * @returns {Promise} Response with created expenses
     */
    async processRecurringExpenses() {
        try {
            const response = await apiClient.post('/api/expenses/process-recurring')
            return response.data
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || 'Failed to process recurring expenses'
            }
        }
    }

    /**
     * Get expense summary statistics
     * @param {Object} params - Query parameters
     * @returns {Promise} Response with expense stats
     */
    async getExpenseStats(params = {}) {
        try {
            const response = await apiClient.get('/api/expenses', { params: { ...params, summary: true } })
            return {
                success: true,
                data: response.data.summary || {}
            }
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || 'Failed to fetch expense stats'
            }
        }
    }
}

export default new AdminExpenseService()
