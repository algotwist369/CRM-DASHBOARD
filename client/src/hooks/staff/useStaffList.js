import { useState, useEffect, useCallback } from 'react'
import { useApi } from '../api/useApi'

export const useStaffList = (options = {}) => {
  const [staff, setStaff] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [pagination, setPagination] = useState(null)
  const { get, post } = useApi()

  const {
    page = 1,
    limit = 20,
    search = '',
    role = '',
    status = '',
    businessId = '',
    sortBy = 'createdAt',
    sortOrder = 'desc',
    enabled = true,
    onSuccess,
    onError
  } = options

  const fetchStaff = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        sortBy,
        sortOrder,
        ...(search && { search }),
        ...(role && { role }),
        ...(status && { status }),
        ...(businessId && { businessId })
      })

      const result = await get(`/staff?${params}`)
      const { data, pagination: paginationData } = result.data

      setStaff(data)
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
  }, [page, limit, search, role, status, businessId, sortBy, sortOrder, get, onSuccess, onError])

  const createStaff = useCallback(async (staffData) => {
    try {
      setLoading(true)
      setError(null)
      const result = await post('/staff', staffData)
      
      // Add new staff to the list
      setStaff(prev => [result.data, ...prev])
      
      return result.data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [post])

  const updateStaff = useCallback(async (staffId, updateData) => {
    try {
      setLoading(true)
      setError(null)
      const result = await post(`/staff/${staffId}`, updateData)
      
      // Update staff in the list
      setStaff(prev => 
        prev.map(member => 
          member.id === staffId ? result.data : member
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

  const deleteStaff = useCallback(async (staffId) => {
    try {
      setLoading(true)
      setError(null)
      await post(`/staff/${staffId}/delete`)
      
      // Remove staff from the list
      setStaff(prev => prev.filter(member => member.id !== staffId))
      
      return true
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [post])

  const bulkUpdateStaff = useCallback(async (staffIds, updateData) => {
    try {
      setLoading(true)
      setError(null)
      const result = await post('/staff/bulk-update', {
        staffIds,
        updateData
      })
      
      // Update staff in the list
      setStaff(prev => 
        prev.map(member => 
          staffIds.includes(member.id) 
            ? { ...member, ...updateData }
            : member
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

  const bulkDeleteStaff = useCallback(async (staffIds) => {
    try {
      setLoading(true)
      setError(null)
      await post('/staff/bulk-delete', { staffIds })
      
      // Remove staff from the list
      setStaff(prev => 
        prev.filter(member => !staffIds.includes(member.id))
      )
      
      return true
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [post])

  const getStaffStats = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const result = await get('/staff/stats')
      return result.data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [get])

  const getStaffRoles = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const result = await get('/staff/roles')
      return result.data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [get])

  const getStaffByRole = useCallback(async (role) => {
    try {
      setLoading(true)
      setError(null)
      const result = await get(`/staff/role/${role}`)
      return result.data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [get])

  const getAvailableStaff = useCallback(async (date, time, serviceId) => {
    try {
      setLoading(true)
      setError(null)
      const params = new URLSearchParams({
        date,
        time,
        serviceId
      })
      const result = await get(`/staff/available?${params}`)
      return result.data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [get])

  const exportStaff = useCallback(async (format = 'csv', filters = {}) => {
    try {
      setLoading(true)
      setError(null)
      
      const params = new URLSearchParams({
        format,
        ...filters
      })
      
      const result = await get(`/staff/export?${params}`)
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
    setStaff([])
    setError(null)
    setPagination(null)
    setLoading(false)
  }, [])

  useEffect(() => {
    if (enabled) {
      fetchStaff()
    }
  }, [enabled, fetchStaff])

  return {
    staff,
    loading,
    error,
    pagination,
    fetchStaff,
    createStaff,
    updateStaff,
    deleteStaff,
    bulkUpdateStaff,
    bulkDeleteStaff,
    getStaffStats,
    getStaffRoles,
    getStaffByRole,
    getAvailableStaff,
    exportStaff,
    clearError,
    reset
  }
}

export default useStaffList
