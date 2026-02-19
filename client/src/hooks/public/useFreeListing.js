import { useState, useCallback } from 'react'
import freeListingService from '../../services/public/freeListingService'

/**
 * Custom hook for managing free listing operations
 * @returns {Object} Hook methods and state
 */
export const useFreeListing = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [data, setData] = useState(null)



  /**
   * Create free listing
   */
  const createFreeListing = useCallback(async (formData) => {
    try {
      setLoading(true)
      setError(null)
      const result = await freeListingService.createFreeListing(formData)

      if (result.success) {
        setData(result.data)
        return result
      } else {
        setError(result.error)
        throw new Error(result.error)
      }
    } catch (err) {
      const errorMessage = err.message || 'Failed to create listing'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  /**
   * Get all free listings
   */
  const getAllFreeListings = useCallback(async (params = {}) => {
    try {
      setLoading(true)
      setError(null)
      const result = await freeListingService.getAllFreeListings(params)

      if (result.success) {
        setData(result.data)
        return result
      } else {
        setError(result.error)
        throw new Error(result.error)
      }
    } catch (err) {
      const errorMessage = err.message || 'Failed to fetch listings'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  /**
   * Get free listing by ID
   */
  const getFreeListingById = useCallback(async (id) => {
    try {
      setLoading(true)
      setError(null)
      const result = await freeListingService.getFreeListingById(id)

      if (result.success) {
        setData(result.data)
        return result
      } else {
        setError(result.error)
        throw new Error(result.error)
      }
    } catch (err) {
      const errorMessage = err.message || 'Failed to fetch listing'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  /**
   * Update free listing
   */
  const updateFreeListing = useCallback(async (id, formData) => {
    try {
      setLoading(true)
      setError(null)
      const result = await freeListingService.updateFreeListing(id, formData)

      if (result.success) {
        setData(result.data)
        return result
      } else {
        setError(result.error)
        throw new Error(result.error)
      }
    } catch (err) {
      const errorMessage = err.message || 'Failed to update listing'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  /**
   * Delete free listing
   */
  const deleteFreeListing = useCallback(async (id) => {
    try {
      setLoading(true)
      setError(null)
      const result = await freeListingService.deleteFreeListing(id)

      if (result.success) {
        setData(result.data)
        return result
      } else {
        setError(result.error)
        throw new Error(result.error)
      }
    } catch (err) {
      const errorMessage = err.message || 'Failed to delete listing'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  /**
   * Reset hook state
   */
  const reset = useCallback(() => {
    setData(null)
    setError(null)
    setLoading(false)
  }, [])

  return {
    // State
    loading,
    error,
    data,

    // Methods
    createFreeListing,
    getAllFreeListings,
    getFreeListingById,
    updateFreeListing,
    deleteFreeListing,
    clearError,
    reset
  }
}

export default useFreeListing

