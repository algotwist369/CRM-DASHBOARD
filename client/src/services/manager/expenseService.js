import apiClient from '../api/client'

/**
 * Manager Expense Service
 * Handles expense-related API calls for manager panel
 */
class ManagerExpenseService {
    /**
     * Create new expense (creates with pending status)
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
     * Get my expenses (manager's expenses)
     * @param {Object} params - Query parameters
     * @returns {Promise} Response with expense list
     */
    async getMyExpenses(params = {}) {
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
     * Update expense (only if status is pending)
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
     * Get expense statistics for manager's dashboard
     * @param {Object} params - Query parameters
     * @returns {Promise} Response with stats
     */
    async getExpenseStats(params = {}) {
        try {
            const response = await apiClient.get('/api/expenses', { params })
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

    /**
     * Get expense category breakdown
     * @param {string} businessId - Business ID
     * @param {string} startDate - Start date
     * @param {string} endDate - End date
     * @returns {Promise} Response with category data
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
}

export default new ManagerExpenseService()
