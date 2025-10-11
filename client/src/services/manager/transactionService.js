import { apiClient, API_ENDPOINTS, buildEndpoint } from '../api'

class TransactionService {
  // Get all transactions
  async getTransactions(params = {}) {
    try {
      const endpoint = buildEndpoint(API_ENDPOINTS.MANAGER.TRANSACTIONS, params)
      const response = await apiClient.get(endpoint)
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch transactions' 
      }
    }
  }

  // Get single transaction
  async getTransaction(transactionId) {
    try {
      const response = await apiClient.get(API_ENDPOINTS.MANAGER.TRANSACTION(transactionId))
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch transaction' 
      }
    }
  }

  // Create transaction
  async createTransaction(transactionData) {
    try {
      const response = await apiClient.post(API_ENDPOINTS.MANAGER.TRANSACTIONS, transactionData)
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to create transaction' 
      }
    }
  }

  // Update transaction
  async updateTransaction(transactionId, transactionData) {
    try {
      const response = await apiClient.put(API_ENDPOINTS.MANAGER.TRANSACTION(transactionId), transactionData)
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to update transaction' 
      }
    }
  }

  // Delete transaction
  async deleteTransaction(transactionId) {
    try {
      const response = await apiClient.delete(API_ENDPOINTS.MANAGER.TRANSACTION(transactionId))
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to delete transaction' 
      }
    }
  }

  // Get transaction statistics
  async getTransactionStats() {
    try {
      const response = await apiClient.get('/transactions/stats')
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch transaction statistics' 
      }
    }
  }

  // Get transaction receipt
  async getTransactionReceipt(transactionId) {
    try {
      const response = await apiClient.get(`/transactions/${transactionId}/receipt`)
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch transaction receipt' 
      }
    }
  }

  // Send receipt
  async sendReceipt(transactionId, email) {
    try {
      const response = await apiClient.post(`/transactions/${transactionId}/send-receipt`, { email })
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to send receipt' 
      }
    }
  }

  // Get transaction history
  async getTransactionHistory(transactionId) {
    try {
      const response = await apiClient.get(`/transactions/${transactionId}/history`)
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch transaction history' 
      }
    }
  }

  // Get transaction items
  async getTransactionItems(transactionId) {
    try {
      const response = await apiClient.get(`/transactions/${transactionId}/items`)
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch transaction items' 
      }
    }
  }

  // Add transaction item
  async addTransactionItem(transactionId, item) {
    try {
      const response = await apiClient.post(`/transactions/${transactionId}/items`, { item })
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to add transaction item' 
      }
    }
  }

  // Remove transaction item
  async removeTransactionItem(transactionId, itemId) {
    try {
      const response = await apiClient.delete(`/transactions/${transactionId}/items/${itemId}`)
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to remove transaction item' 
      }
    }
  }

  // Apply discount
  async applyDiscount(transactionId, discountCode) {
    try {
      const response = await apiClient.post(`/transactions/${transactionId}/discount`, { discountCode })
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to apply discount' 
      }
    }
  }

  // Remove discount
  async removeDiscount(transactionId) {
    try {
      const response = await apiClient.delete(`/transactions/${transactionId}/discount`)
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to remove discount' 
      }
    }
  }

  // Calculate tax
  async calculateTax(transactionId) {
    try {
      const response = await apiClient.get(`/transactions/${transactionId}/calculate-tax`)
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to calculate tax' 
      }
    }
  }

  // Update transaction status
  async updateTransactionStatus(transactionId, status) {
    try {
      const response = await apiClient.patch(`/transactions/${transactionId}/status`, { status })
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to update transaction status' 
      }
    }
  }

  // Process refund
  async processRefund(transactionId, amount, reason = '') {
    try {
      const response = await apiClient.post(`/transactions/${transactionId}/refund`, {
        amount,
        reason
      })
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to process refund' 
      }
    }
  }

  // Add transaction note
  async addTransactionNote(transactionId, note) {
    try {
      const response = await apiClient.patch(`/transactions/${transactionId}/note`, { note })
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to add transaction note' 
      }
    }
  }

  // Update payment method
  async updatePaymentMethod(transactionId, paymentMethod) {
    try {
      const response = await apiClient.patch(`/transactions/${transactionId}/payment-method`, { paymentMethod })
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to update payment method' 
      }
    }
  }

  // Get today's transactions
  async getTodayTransactions(params = {}) {
    try {
      const endpoint = buildEndpoint('/transactions/today', params)
      const response = await apiClient.get(endpoint)
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch today\'s transactions' 
      }
    }
  }

  // Get transactions by date
  async getTransactionsByDate(date, params = {}) {
    try {
      const endpoint = buildEndpoint('/transactions/by-date', { date, ...params })
      const response = await apiClient.get(endpoint)
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch transactions by date' 
      }
    }
  }

  // Get transactions by status
  async getTransactionsByStatus(status, params = {}) {
    try {
      const endpoint = buildEndpoint('/transactions/by-status', { status, ...params })
      const response = await apiClient.get(endpoint)
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch transactions by status' 
      }
    }
  }

  // Get transactions by payment method
  async getTransactionsByPaymentMethod(paymentMethod, params = {}) {
    try {
      const endpoint = buildEndpoint('/transactions/by-payment-method', { paymentMethod, ...params })
      const response = await apiClient.get(endpoint)
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch transactions by payment method' 
      }
    }
  }

  // Get revenue by period
  async getRevenueByPeriod(period, params = {}) {
    try {
      const endpoint = buildEndpoint('/transactions/revenue', { period, ...params })
      const response = await apiClient.get(endpoint)
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch revenue by period' 
      }
    }
  }

  // Get top customers
  async getTopCustomers(params = {}) {
    try {
      const endpoint = buildEndpoint('/transactions/top-customers', params)
      const response = await apiClient.get(endpoint)
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch top customers' 
      }
    }
  }

  // Get top services
  async getTopServices(params = {}) {
    try {
      const endpoint = buildEndpoint('/transactions/top-services', params)
      const response = await apiClient.get(endpoint)
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch top services' 
      }
    }
  }

  // Export transaction data
  async exportTransactionData(format = 'csv', filters = {}) {
    try {
      const params = { format, ...filters }
      const endpoint = buildEndpoint('/transactions/export', params)
      const response = await apiClient.get(endpoint, { responseType: 'blob' })
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to export transaction data' 
      }
    }
  }

  // Bulk update transactions
  async bulkUpdateTransactions(transactionIds, updateData) {
    try {
      const response = await apiClient.patch('/transactions/bulk-update', {
        transactionIds,
        updateData
      })
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to bulk update transactions' 
      }
    }
  }

  // Bulk delete transactions
  async bulkDeleteTransactions(transactionIds) {
    try {
      const response = await apiClient.delete('/transactions/bulk-delete', {
        data: { transactionIds }
      })
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to bulk delete transactions' 
      }
    }
  }
}

export default new TransactionService()
