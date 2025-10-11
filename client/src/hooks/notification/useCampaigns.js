import { useState, useEffect, useCallback } from 'react'
import { useApi } from '../api/useApi'

export const useCampaigns = (options = {}) => {
  const [campaigns, setCampaigns] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [pagination, setPagination] = useState(null)
  const { get, post } = useApi()

  const {
    page = 1,
    limit = 20,
    search = '',
    status = '',
    type = '',
    businessId = '',
    startDate = '',
    endDate = '',
    sortBy = 'createdAt',
    sortOrder = 'desc',
    enabled = true,
    onSuccess,
    onError
  } = options

  const fetchCampaigns = useCallback(async () => {
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
        ...(type && { type }),
        ...(businessId && { businessId }),
        ...(startDate && { startDate }),
        ...(endDate && { endDate })
      })

      const result = await get(`/campaigns?${params}`)
      const { data, pagination: paginationData } = result.data

      setCampaigns(data)
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
  }, [page, limit, search, status, type, businessId, startDate, endDate, sortBy, sortOrder, get, onSuccess, onError])

  const createCampaign = useCallback(async (campaignData) => {
    try {
      setLoading(true)
      setError(null)
      const result = await post('/campaigns', campaignData)
      
      // Add new campaign to the list
      setCampaigns(prev => [result.data, ...prev])
      
      return result.data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [post])

  const updateCampaign = useCallback(async (campaignId, updateData) => {
    try {
      setLoading(true)
      setError(null)
      const result = await post(`/campaigns/${campaignId}`, updateData)
      
      // Update campaign in the list
      setCampaigns(prev => 
        prev.map(campaign => 
          campaign.id === campaignId ? result.data : campaign
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

  const deleteCampaign = useCallback(async (campaignId) => {
    try {
      setLoading(true)
      setError(null)
      await post(`/campaigns/${campaignId}/delete`)
      
      // Remove campaign from the list
      setCampaigns(prev => prev.filter(campaign => campaign.id !== campaignId))
      
      return true
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [post])

  const launchCampaign = useCallback(async (campaignId) => {
    try {
      setLoading(true)
      setError(null)
      const result = await post(`/campaigns/${campaignId}/launch`)
      
      // Update campaign status in the list
      setCampaigns(prev => 
        prev.map(campaign => 
          campaign.id === campaignId 
            ? { ...campaign, status: 'active', launchedAt: new Date().toISOString() }
            : campaign
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

  const pauseCampaign = useCallback(async (campaignId) => {
    try {
      setLoading(true)
      setError(null)
      const result = await post(`/campaigns/${campaignId}/pause`)
      
      // Update campaign status in the list
      setCampaigns(prev => 
        prev.map(campaign => 
          campaign.id === campaignId 
            ? { ...campaign, status: 'paused', pausedAt: new Date().toISOString() }
            : campaign
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

  const stopCampaign = useCallback(async (campaignId) => {
    try {
      setLoading(true)
      setError(null)
      const result = await post(`/campaigns/${campaignId}/stop`)
      
      // Update campaign status in the list
      setCampaigns(prev => 
        prev.map(campaign => 
          campaign.id === campaignId 
            ? { ...campaign, status: 'stopped', stoppedAt: new Date().toISOString() }
            : campaign
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

  const duplicateCampaign = useCallback(async (campaignId) => {
    try {
      setLoading(true)
      setError(null)
      const result = await post(`/campaigns/${campaignId}/duplicate`)
      
      // Add duplicated campaign to the list
      setCampaigns(prev => [result.data, ...prev])
      
      return result.data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [post])

  const getCampaignStats = useCallback(async (campaignId) => {
    try {
      setLoading(true)
      setError(null)
      const result = await get(`/campaigns/${campaignId}/stats`)
      return result.data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [get])

  const getCampaignAnalytics = useCallback(async (campaignId) => {
    try {
      setLoading(true)
      setError(null)
      const result = await get(`/campaigns/${campaignId}/analytics`)
      return result.data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [get])

  const getCampaignRecipients = useCallback(async (campaignId) => {
    try {
      setLoading(true)
      setError(null)
      const result = await get(`/campaigns/${campaignId}/recipients`)
      return result.data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [get])

  const getCampaignTemplates = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const result = await get('/campaigns/templates')
      return result.data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [get])

  const createCampaignFromTemplate = useCallback(async (templateId, customizations = {}) => {
    try {
      setLoading(true)
      setError(null)
      const result = await post('/campaigns/from-template', {
        templateId,
        customizations
      })
      
      // Add new campaign to the list
      setCampaigns(prev => [result.data, ...prev])
      
      return result.data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [post])

  const getActiveCampaigns = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const result = await get('/campaigns/active')
      return result.data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [get])

  const getScheduledCampaigns = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const result = await get('/campaigns/scheduled')
      return result.data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [get])

  const exportCampaigns = useCallback(async (format = 'csv', filters = {}) => {
    try {
      setLoading(true)
      setError(null)
      
      const params = new URLSearchParams({
        format,
        ...filters
      })
      
      const result = await get(`/campaigns/export?${params}`)
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
    setCampaigns([])
    setError(null)
    setPagination(null)
    setLoading(false)
  }, [])

  useEffect(() => {
    if (enabled) {
      fetchCampaigns()
    }
  }, [enabled, fetchCampaigns])

  return {
    campaigns,
    loading,
    error,
    pagination,
    fetchCampaigns,
    createCampaign,
    updateCampaign,
    deleteCampaign,
    launchCampaign,
    pauseCampaign,
    stopCampaign,
    duplicateCampaign,
    getCampaignStats,
    getCampaignAnalytics,
    getCampaignRecipients,
    getCampaignTemplates,
    createCampaignFromTemplate,
    getActiveCampaigns,
    getScheduledCampaigns,
    exportCampaigns,
    clearError,
    reset
  }
}

export default useCampaigns
