import apiClient from '../api/client'

/**
 * Manager Inventory Service
 * Handles inventory operations for manager panel (limited permissions)
 */
class ManagerInventoryService {
    /**
     * Get all products
     * @param {Object} params - Query parameters
     * @returns {Promise} Response with product list
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
     * @returns {Promise} Response with product details
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
     * Adjust product stock (usage, wastage)
     * @param {string} productId - Product ID
     * @param {Object} adjustmentData - {type: 'usage'|'wastage', quantity, notes}
     * @returns {Promise} Response with updated product
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
     * Record product usage
     * @param {string} productId - Product ID
     * @param {number} quantity - Quantity used
     * @param {string} notes - Usage notes
     * @returns {Promise} Response
     */
    async recordUsage(productId, quantity, notes = '') {
        return this.adjustStock(productId, {
            type: 'usage',
            quantity,
            notes
        })
    }

    /**
     * Record product wastage
     * @param {string} productId - Product ID
     * @param {number} quantity - Quantity wasted
     * @param {string} reason - Wastage reason
     * @returns {Promise} Response
     */
    async recordWastage(productId, quantity, reason) {
        return this.adjustStock(productId, {
            type: 'wastage',
            quantity,
            notes: reason,
            reason
        })
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

    /**
     * Get inventory summary for manager
     * @param {string} businessId - Business ID
     * @returns {Promise} Response with summary
     */
    async getInventorySummary(businessId) {
        try {
            const [products, lowStock] = await Promise.all([
                this.getProducts({ businessId }),
                this.getLowStockProducts(businessId)
            ])

            return {
                success: true,
                data: {
                    totalProducts: products.data?.pagination?.total || 0,
                    lowStockCount: lowStock.data?.count || 0,
                    alerts: lowStock.data?.data || []
                }
            }
        } catch (error) {
            return {
                success: false,
                error: 'Failed to fetch inventory summary'
            }
        }
    }
}

export default new ManagerInventoryService()
