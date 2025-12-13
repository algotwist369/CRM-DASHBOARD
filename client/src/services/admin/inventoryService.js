import apiClient from '../api/client'

/**
 * Admin Inventory Service
 * Handles all inventory/product-related API calls for admin panel
 */
class AdminInventoryService {
    /**
     * Create new product
     * @param {Object} productData - Product data
     * @returns {Promise} Response with created product
     */
    async createProduct(productData) {
        try {
            const response = await apiClient.post('/api/inventory/products', productData)
            return response.data
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || 'Failed to create product'
            }
        }
    }

    /**
     * Get all products with filters
     * @param {Object} params - Query parameters (businessId, category, isLowStock, search, etc.)
     * @returns {Promise} Response with product list and pagination
     */
    async getProducts(params = {}) {
        try {
            const response = await apiClient.get('/api/inventory/products', { params })
            return response.data
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || 'Failed to fetch products'
            }
        }
    }

    /**
     * Get product by ID
     * @param {string} id - Product ID
     * @returns {Promise} Response with product details and recent transactions
     */
    async getProductById(id) {
        try {
            const response = await apiClient.get(`/api/inventory/products/${id}`)
            return response.data
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || 'Failed to fetch product'
            }
        }
    }

    /**
     * Update product
     * @param {string} id - Product ID
     * @param {Object} productData - Updated product data
     * @returns {Promise} Response with updated product
     */
    async updateProduct(id, productData) {
        try {
            const response = await apiClient.put(`/api/inventory/products/${id}`, productData)
            return response.data
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || 'Failed to update product'
            }
        }
    }

    /**
     * Delete product (soft delete)
     * @param {string} id - Product ID
     * @returns {Promise} Response
     */
    async deleteProduct(id) {
        try {
            const response = await apiClient.delete(`/api/inventory/products/${id}`)
            return response.data
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || 'Failed to delete product'
            }
        }
    }

    /**
     * Adjust product stock
     * @param {string} productId - Product ID
     * @param {Object} adjustmentData - {type, quantity, reason, notes, costPerUnit}
     * @returns {Promise} Response with updated product and transaction
     */
    async adjustStock(productId, adjustmentData) {
        try {
            const response = await apiClient.post(`/api/inventory/products/${productId}/adjust-stock`, adjustmentData)
            return response.data
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || 'Failed to adjust stock'
            }
        }
    }

    /**
     * Get low stock products
     * @param {string} businessId - Business ID
     * @returns {Promise} Response with low stock products
     */
    async getLowStockProducts(businessId) {
        try {
            const response = await apiClient.get('/api/inventory/low-stock', {
                params: { businessId }
            })
            return response.data
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || 'Failed to fetch low stock products'
            }
        }
    }

    /**
     * Get products expiring soon
     * @param {string} businessId - Business ID
     * @param {number} days - Number of days (default 30)
     * @returns {Promise} Response with expiring products
     */
    async getExpiringSoon(businessId, days = 30) {
        try {
            const response = await apiClient.get('/api/inventory/expiring-soon', {
                params: { businessId, days }
            })
            return response.data
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || 'Failed to fetch expiring products'
            }
        }
    }

    /**
     * Get stock valuation by category
     * @param {string} businessId - Business ID
     * @returns {Promise} Response with valuation data
     */
    async getStockValuation(businessId) {
        try {
            const response = await apiClient.get('/api/inventory/valuation', {
                params: { businessId }
            })
            return response.data
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || 'Failed to fetch stock valuation'
            }
        }
    }

    /**
     * Get inventory summary statistics
     * @param {string} businessId - Business ID
     * @returns {Promise} Response with inventory stats
     */
    async getInventoryStats(businessId) {
        try {
            const [products, lowStock, valuation] = await Promise.all([
                this.getProducts({ businessId }),
                this.getLowStockProducts(businessId),
                this.getStockValuation(businessId)
            ])

            return {
                success: true,
                data: {
                    totalProducts: products.data?.pagination?.total || 0,
                    lowStockCount: lowStock.data?.count || 0,
                    totalValue: valuation.data?.data?.totalValue || 0
                }
            }
        } catch (error) {
            return {
                success: false,
                error: 'Failed to fetch inventory stats'
            }
        }
    }

    /**
     * Search products by name or SKU
     * @param {string} query - Search query
     * @param {string} businessId - Business ID
     * @returns {Promise} Response with search results
     */
    async searchProducts(query, businessId) {
        try {
            const response = await apiClient.get('/api/inventory/products', {
                params: { businessId, search: query }
            })
            return response.data
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || 'Failed to search products'
            }
        }
    }
}

export default new AdminInventoryService()
