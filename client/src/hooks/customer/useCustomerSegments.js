import { useState, useEffect, useCallback } from 'react'
import { useApi } from '../api/useApi'

export const useCustomerSegments = (options = {}) => {
  const [segments, setSegments] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [pagination, setPagination] = useState(null)
  const { get, post, put, patch, delete: del } = useApi()

  const {
    page = 1,
    limit = 20,
    search = '',
    businessId = '',
    enabled = true,
    onSuccess,
    onError
  } = options

  const fetchSegments = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(search && { search }),
        ...(businessId && { businessId })
      })

      const result = await get(`/customer-segments?${params}`)
      const { data, pagination: paginationData } = result.data

      setSegments(data)
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
  }, [page, limit, search, businessId, get, onSuccess, onError])

  const createSegment = useCallback(async (segmentData) => {
    try {
      setLoading(true)
      setError(null)
      const result = await post('/customer-segments', segmentData)
      
      // Add new segment to the list
      setSegments(prev => [result.data, ...prev])
      
      return result.data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [post])

  const updateSegment = useCallback(async (segmentId, updateData) => {
    try {
      setLoading(true)
      setError(null)
      const result = await put(`/customer-segments/${segmentId}`, updateData)
      
      // Update segment in the list
      setSegments(prev => 
        prev.map(segment => 
          segment.id === segmentId ? result.data : segment
        )
      )
      
      return result.data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [put])

  const patchSegment = useCallback(async (segmentId, patchData) => {
    try {
      setLoading(true)
      setError(null)
      const result = await patch(`/customer-segments/${segmentId}`, patchData)
      
      // Update segment in the list
      setSegments(prev => 
        prev.map(segment => 
          segment.id === segmentId ? result.data : segment
        )
      )
      
      return result.data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [patch])

  const deleteSegment = useCallback(async (segmentId) => {
    try {
      setLoading(true)
      setError(null)
      await del(`/customer-segments/${segmentId}`)
      
      // Remove segment from the list
      setSegments(prev => prev.filter(segment => segment.id !== segmentId))
      
      return true
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [del])

  const getSegmentCustomers = useCallback(async (segmentId, params = {}) => {
    try {
      setLoading(true)
      setError(null)
      const queryParams = new URLSearchParams(params).toString()
      const result = await get(`/customer-segments/${segmentId}/customers?${queryParams}`)
      return result.data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [get])

  const addCustomersToSegment = useCallback(async (segmentId, customerIds) => {
    try {
      setLoading(true)
      setError(null)
      const result = await post(`/customer-segments/${segmentId}/customers`, { customerIds })
      return result.data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [post])

  const removeCustomersFromSegment = useCallback(async (segmentId, customerIds) => {
    try {
      setLoading(true)
      setError(null)
      const result = await post(`/customer-segments/${segmentId}/customers/remove`, { customerIds })
      return result.data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [post])

  const getSegmentAnalytics = useCallback(async (segmentId) => {
    try {
      setLoading(true)
      setError(null)
      const result = await get(`/customer-segments/${segmentId}/analytics`)
      return result.data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [get])

  const getSegmentStats = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const result = await get('/customer-segments/stats')
      return result.data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [get])

  const getSegmentTemplates = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const result = await get('/customer-segments/templates')
      return result.data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [get])

  const createSegmentFromTemplate = useCallback(async (templateId, customizations = {}) => {
    try {
      setLoading(true)
      setError(null)
      const result = await post('/customer-segments/from-template', {
        templateId,
        customizations
      })
      
      // Add new segment to the list
      setSegments(prev => [result.data, ...prev])
      
      return result.data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [post])

  const exportSegment = useCallback(async (segmentId, format = 'csv') => {
    try {
      setLoading(true)
      setError(null)
      
      const params = new URLSearchParams({ format })
      const result = await get(`/customer-segments/${segmentId}/export?${params}`)
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
    setSegments([])
    setError(null)
    setPagination(null)
    setLoading(false)
  }, [])

  useEffect(() => {
    if (enabled) {
      fetchSegments()
    }
  }, [enabled, fetchSegments])

  return {
    segments,
    loading,
    error,
    pagination,
    fetchSegments,
    createSegment,
    updateSegment,
    patchSegment,
    deleteSegment,
    getSegmentCustomers,
    addCustomersToSegment,
    removeCustomersFromSegment,
    getSegmentAnalytics,
    getSegmentStats,
    getSegmentTemplates,
    createSegmentFromTemplate,
    exportSegment,
    clearError,
    reset
  }
}

export default useCustomerSegments
