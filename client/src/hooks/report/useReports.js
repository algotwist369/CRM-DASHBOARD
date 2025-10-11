import { useState, useEffect, useCallback } from 'react'
import { useApi } from '../api/useApi'

export const useReports = (options = {}) => {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [pagination, setPagination] = useState(null)
  const { get, post } = useApi()

  const {
    page = 1,
    limit = 20,
    search = '',
    type = '',
    status = '',
    businessId = '',
    startDate = '',
    endDate = '',
    sortBy = 'createdAt',
    sortOrder = 'desc',
    enabled = true,
    onSuccess,
    onError
  } = options

  const fetchReports = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        sortBy,
        sortOrder,
        ...(search && { search }),
        ...(type && { type }),
        ...(status && { status }),
        ...(businessId && { businessId }),
        ...(startDate && { startDate }),
        ...(endDate && { endDate })
      })

      const result = await get(`/reports?${params}`)
      const { data, pagination: paginationData } = result.data

      setReports(data)
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
  }, [page, limit, search, type, status, businessId, startDate, endDate, sortBy, sortOrder, get, onSuccess, onError])

  const generateReport = useCallback(async (reportData) => {
    try {
      setLoading(true)
      setError(null)
      const result = await post('/reports/generate', reportData)
      
      // Add new report to the list
      setReports(prev => [result.data, ...prev])
      
      return result.data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [post])

  const updateReport = useCallback(async (reportId, updateData) => {
    try {
      setLoading(true)
      setError(null)
      const result = await post(`/reports/${reportId}`, updateData)
      
      // Update report in the list
      setReports(prev => 
        prev.map(report => 
          report.id === reportId ? result.data : report
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

  const deleteReport = useCallback(async (reportId) => {
    try {
      setLoading(true)
      setError(null)
      await post(`/reports/${reportId}/delete`)
      
      // Remove report from the list
      setReports(prev => prev.filter(report => report.id !== reportId))
      
      return true
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [post])

  const getReportData = useCallback(async (reportId) => {
    try {
      setLoading(true)
      setError(null)
      const result = await get(`/reports/${reportId}/data`)
      return result.data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [get])

  const downloadReport = useCallback(async (reportId, format = 'pdf') => {
    try {
      setLoading(true)
      setError(null)
      const result = await get(`/reports/${reportId}/download?format=${format}`)
      return result.data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [get])

  const scheduleReport = useCallback(async (reportId, schedule) => {
    try {
      setLoading(true)
      setError(null)
      const result = await post(`/reports/${reportId}/schedule`, schedule)
      return result.data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [post])

  const getReportTemplates = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const result = await get('/reports/templates')
      return result.data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [get])

  const createReportFromTemplate = useCallback(async (templateId, customizations = {}) => {
    try {
      setLoading(true)
      setError(null)
      const result = await post('/reports/from-template', {
        templateId,
        customizations
      })
      
      // Add new report to the list
      setReports(prev => [result.data, ...prev])
      
      return result.data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [post])

  const getReportTypes = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const result = await get('/reports/types')
      return result.data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [get])

  const getReportStats = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const result = await get('/reports/stats')
      return result.data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [get])

  const getScheduledReports = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const result = await get('/reports/scheduled')
      return result.data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [get])

  const getRecentReports = useCallback(async (limit = 10) => {
    try {
      setLoading(true)
      setError(null)
      const result = await get(`/reports/recent?limit=${limit}`)
      return result.data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [get])

  const exportReports = useCallback(async (format = 'csv', filters = {}) => {
    try {
      setLoading(true)
      setError(null)
      
      const params = new URLSearchParams({
        format,
        ...filters
      })
      
      const result = await get(`/reports/export?${params}`)
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
    setReports([])
    setError(null)
    setPagination(null)
    setLoading(false)
  }, [])

  useEffect(() => {
    if (enabled) {
      fetchReports()
    }
  }, [enabled, fetchReports])

  return {
    reports,
    loading,
    error,
    pagination,
    fetchReports,
    generateReport,
    updateReport,
    deleteReport,
    getReportData,
    downloadReport,
    scheduleReport,
    getReportTemplates,
    createReportFromTemplate,
    getReportTypes,
    getReportStats,
    getScheduledReports,
    getRecentReports,
    exportReports,
    clearError,
    reset
  }
}

export default useReports
