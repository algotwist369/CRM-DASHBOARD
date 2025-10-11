import { useState, useEffect, useCallback } from 'react'
import { useApi } from '../api/useApi'

export const useCustomers = (options = {}) => {
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [pagination, setPagination] = useState(null)
  const { get, post } = useApi()

  const {
    page = 1,
    limit = 20,
    search = '',
    status = '',
    segment = '',
    businessId = '',
    sortBy = 'createdAt',
    sortOrder = 'desc',
    enabled = true,
    onSuccess,
    onError
  } = options

  const fetchCustomers = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        sortBy,
        sortOrder,
        ...(search && { search }),
        ...(status && { status }),
        ...(segment && { segment }),
        ...(businessId && { businessId })
      })

      const result = await get(`/customers?${params}`)
      const { data, pagination: paginationData } = result.data

      setCustomers(data)
      setPagination(paginationData)

      if (onSuccess) {
        onSuccess(data, paginationData)
      }
    } catch (err) {
      setError(err.message)
      if (onError) {
        onError(err)
      }
    } finally {
      setLoading(false)
    }
  }, [page, limit, search, status, segment, businessId, sortBy, sortOrder, get, onSuccess, onError])

  const createCustomer = useCallback(async (customerData) => {
    try {
      setLoading(true)
      setError(null)
      const result = await post('/customers', customerData)
      
      // Add new customer to the list
      setCustomers(prev => [result.data, ...prev])
      
      return result.data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [post])

  const updateCustomer = useCallback(async (customerId, updateData) => {
    try {
      setLoading(true)
      setError(null)
      const result = await post(`/customers/${customerId}`, updateData)
      
      // Update customer in the list
      setCustomers(prev => 
        prev.map(customer => 
          customer.id === customerId ? result.data : customer
        )
      )
      
      return result.data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [post])

  const deleteCustomer = useCallback(async (customerId) => {
    try {
      setLoading(true)
      setError(null)
      await post(`/customers/${customerId}/delete`)
      
      // Remove customer from the list
      setCustomers(prev => prev.filter(customer => customer.id !== customerId))
      
      return true
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [post])

  const bulkUpdateCustomers = useCallback(async (customerIds, updateData) => {
    try {
      setLoading(true)
      setError(null)
      const result = await post('/customers/bulk-update', {
        customerIds,
        updateData
      })
      
      // Update customers in the list
      setCustomers(prev => 
        prev.map(customer => 
          customerIds.includes(customer.id) 
            ? { ...customer, ...updateData }
            : customer
        )
      )
      
      return result.data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [post])

  const bulkDeleteCustomers = useCallback(async (customerIds) => {
    try {
      setLoading(true)
      setError(null)
      await post('/customers/bulk-delete', { customerIds })
      
      // Remove customers from the list
      setCustomers(prev => 
        prev.filter(customer => !customerIds.includes(customer.id))
      )
      
      return true
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [post])

  const getCustomerStats = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const result = await get('/customers/stats')
      return result.data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [get])

  const getCustomerSegments = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const result = await get('/customers/segments')
      return result.data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [get])

  const getCustomersBySegment = useCallback(async (segmentId) => {
    try {
      setLoading(true)
      setError(null)
      const result = await get(`/customers/segment/${segmentId}`)
      return result.data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [get])

  const getTopCustomers = useCallback(async (params = {}) => {
    try {
      setLoading(true)
      setError(null)
      const queryParams = new URLSearchParams(params).toString()
      const result = await get(`/customers/top?${queryParams}`)
      return result.data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [get])

  const getNewCustomers = useCallback(async (params = {}) => {
    try {
      setLoading(true)
      setError(null)
      const queryParams = new URLSearchParams(params).toString()
      const result = await get(`/customers/new?${queryParams}`)
      return result.data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [get])

  const getInactiveCustomers = useCallback(async (params = {}) => {
    try {
      setLoading(true)
      setError(null)
      const queryParams = new URLSearchParams(params).toString()
      const result = await get(`/customers/inactive?${queryParams}`)
      return result.data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [get])

  const exportCustomers = useCallback(async (format = 'csv', filters = {}) => {
    try {
      setLoading(true)
      setError(null)
      
      const params = new URLSearchParams({
        format,
        ...filters
      })
      
      const result = await get(`/customers/export?${params}`)
      return result.data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [get])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const reset = useCallback(() => {
    setCustomers([])
    setError(null)
    setPagination(null)
    setLoading(false)
  }, [])

  useEffect(() => {
    if (enabled) {
      fetchCustomers()
    }
  }, [enabled, fetchCustomers])

  return {
    customers,
    loading,
    error,
    pagination,
    fetchCustomers,
    createCustomer,
    updateCustomer,
    deleteCustomer,
    bulkUpdateCustomers,
    bulkDeleteCustomers,
    getCustomerStats,
    getCustomerSegments,
    getCustomersBySegment,
    getTopCustomers,
    getNewCustomers,
    getInactiveCustomers,
    exportCustomers,
    clearError,
    reset
  }
}

export default useCustomers
