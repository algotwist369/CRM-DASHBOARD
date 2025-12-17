import { useState, useEffect, useCallback } from 'react'
import { useApi } from '../api/useApi'

/**
 * Custom hook for fetching available appointment time slots
 * 
 * @param {Object} options - Configuration options
 * @param {string} options.date - Date in YYYY-MM-DD format
 * @param {string} options.businessId - Business ID to fetch slots for
 * @param {string} [options.staffId] - Optional staff ID to filter slots
 * @param {string} [options.serviceId] - Optional service ID (currently not used by backend)
 * @param {boolean} [options.enabled=true] - Whether to auto-fetch on mount
 * @param {Function} [options.onSuccess] - Success callback
 * @param {Function} [options.onError] - Error callback
 * 
 * @returns {Object} Hook state and methods
 * @returns {Array} slots - Array of available time slots
 * @returns {boolean} loading - Loading state
 * @returns {string|null} error - Error message if any
 * @returns {Function} refetch - Manually refetch slots
 * @returns {Function} clearError - Clear error state
 * @returns {Function} reset - Reset all state
 * 
 * @example
 * const { slots, loading, error, refetch } = useAvailableSlots({
 *   date: '2025-12-17',
 *   businessId: '507f1f77bcf86cd799439011',
 *   staffId: '507f1f77bcf86cd799439012', // optional
 *   enabled: true
 * })
 */
export const useAvailableSlots = (options = {}) => {
  const [slots, setSlots] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const { get } = useApi()

  const {
    date,
    staffId,
    serviceId, // Keep for future compatibility, but not sent to backend
    businessId,
    enabled = true,
    onSuccess,
    onError
  } = options

  /**
   * Fetch available time slots from the backend
   * Aligned with backend GET /api/appointments/available-slots
   */
  const fetchAvailableSlots = useCallback(async () => {
    if (!date || !businessId) {
      console.warn('[useAvailableSlots] Missing required parameters: date and businessId')
      return
    }

    try {
      setLoading(true)
      setError(null)

      // Build query parameters matching backend expectations
      const params = new URLSearchParams({
        date,
        businessId,
        // Only include optional params if provided
        ...(staffId && { staffId })
        // Note: serviceId and duration removed - backend uses business settings
      })

      const result = await get(`/appointments/available-slots?${params}`)

      // Backend returns: { success: true, data: [...slots] }
      const slotsData = result.data || []
      setSlots(slotsData)

      if (onSuccess) {
        onSuccess(slotsData)
      }
    } catch (err) {
      const errorMessage = err.message || 'Failed to fetch available slots'
      setError(errorMessage)

      if (onError) {
        onError(err)
      }
    } finally {
      setLoading(false)
    }
  }, [date, staffId, businessId, get, onSuccess, onError])

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  /**
   * Reset hook to initial state
   */
  const reset = useCallback(() => {
    setSlots([])
    setError(null)
    setLoading(false)
  }, [])

  /**
   * Auto-fetch slots when dependencies change
   */
  useEffect(() => {
    if (enabled && date && businessId) {
      fetchAvailableSlots()
    }
  }, [enabled, date, businessId, fetchAvailableSlots])

  return {
    // State
    slots,
    loading,
    error,

    // Methods
    refetch: fetchAvailableSlots, // Alias for better semantics
    fetchAvailableSlots, // Keep for backward compatibility
    clearError,
    reset
  }
}

export default useAvailableSlots
