import { useState, useEffect, useCallback } from 'react'
import { useApi } from '../api/useApi'

export const useBusinesses = (options = {}) => {
  const [businesses, setBusinesses] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [pagination, setPagination] = useState(null)
  const { get, post } = useApi()

  const {
    page = 1,
    limit = 20,
    search = '',
    status = '',
    sortBy = 'createdAt',
    sortOrder = 'desc',
    enabled = true,
    onSuccess,
    onError
  } = options

  const fetchBusinesses = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        sortBy,
        sortOrder,
        ...(search && { search }),
        ...(status && { status })
      })

      const result = await get(`/businesses?${params}`)
      const { data, pagination: paginationData } = result.data

      setBusinesses(data)
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
  }, [page, limit, search, status, sortBy, sortOrder, get, onSuccess, onError])

  const createBusiness = useCallback(async (businessData) => {
    try {
      setLoading(true)
      setError(null)
      const result = await post('/businesses', businessData)
      
      // Add new business to the list
      setBusinesses(prev => [result.data, ...prev])
      
      return result.data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [post])

  const updateBusiness = useCallback(async (businessId, updateData) => {
    try {
      setLoading(true)
      setError(null)
      const result = await post(`/businesses/${businessId}`, updateData)
      
      // Update business in the list
      setBusinesses(prev => 
        prev.map(business => 
          business.id === businessId ? result.data : business
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

  const deleteBusiness = useCallback(async (businessId) => {
    try {
      setLoading(true)
      setError(null)
      await post(`/businesses/${businessId}/delete`)
      
      // Remove business from the list
      setBusinesses(prev => prev.filter(business => business.id !== businessId))
      
      return true
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [post])

  const bulkUpdateBusinesses = useCallback(async (businessIds, updateData) => {
    try {
      setLoading(true)
      setError(null)
      const result = await post('/businesses/bulk-update', {
        businessIds,
        updateData
      })
      
      // Update businesses in the list
      setBusinesses(prev => 
        prev.map(business => 
          businessIds.includes(business.id) 
            ? { ...business, ...updateData }
            : business
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

  const bulkDeleteBusinesses = useCallback(async (businessIds) => {
    try {
      setLoading(true)
      setError(null)
      await post('/businesses/bulk-delete', { businessIds })
      
      // Remove businesses from the list
      setBusinesses(prev => 
        prev.filter(business => !businessIds.includes(business.id))
      )
      
      return true
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [post])

  const getBusinessStats = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const result = await get('/businesses/stats')
      return result.data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [get])

  const exportBusinesses = useCallback(async (format = 'csv', filters = {}) => {
    try {
      setLoading(true)
      setError(null)
      
      const params = new URLSearchParams({
        format,
        ...filters
      })
      
      const result = await get(`/businesses/export?${params}`)
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
    setBusinesses([])
    setError(null)
    setPagination(null)
    setLoading(false)
  }, [])

  useEffect(() => {
    if (enabled) {
      fetchBusinesses()
    }
  }, [enabled, fetchBusinesses])

  return {
    businesses,
    loading,
    error,
    pagination,
    fetchBusinesses,
    createBusiness,
    updateBusiness,
    deleteBusiness,
    bulkUpdateBusinesses,
    bulkDeleteBusinesses,
    getBusinessStats,
    exportBusinesses,
    clearError,
    reset
  }
}

export default useBusinesses
