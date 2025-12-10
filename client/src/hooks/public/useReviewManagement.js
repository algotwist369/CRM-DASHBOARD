import { useState, useCallback } from 'react'
import reviewManagementService from '../../services/public/reviewManagementService'

export const useReviewManagement = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [data, setData] = useState(null)

  const sendOtp = useCallback(async (phoneNumber, fullName) => {
    try {
      setLoading(true)
      setError(null)
      const result = await reviewManagementService.sendOtp(phoneNumber, fullName)
      
      if (result.success) {
        setData(result.data)
        return result
      } else {
        setError(result.error)
        throw new Error(result.error)
      }
    } catch (err) {
      const errorMessage = err.message || 'Failed to send OTP'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const verifyOtp = useCallback(async (phoneNumber, otp) => {
    try {
      setLoading(true)
      setError(null)
      const result = await reviewManagementService.verifyOtp(phoneNumber, otp)
      
      if (result.success) {
        setData(result.data)
        return result
      } else {
        setError(result.error)
        throw new Error(result.error)
      }
    } catch (err) {
      const errorMessage = err.message || 'Failed to verify OTP'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const createReviewRequest = useCallback(async (formData) => {
    try {
      setLoading(true)
      setError(null)
      const result = await reviewManagementService.createReviewRequest(formData)
      
      if (result.success) {
        setData(result.data)
        return result
      } else {
        setError(result.error)
        throw new Error(result.error)
      }
    } catch (err) {
      const errorMessage = err.message || 'Failed to submit review request'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const getAllReviewRequests = useCallback(async (params = {}) => {
    try {
      setLoading(true)
      setError(null)
      const result = await reviewManagementService.getAllReviewRequests(params)
      
      if (result.success) {
        setData(result.data)
        return result
      } else {
        setError(result.error)
        throw new Error(result.error)
      }
    } catch (err) {
      const errorMessage = err.message || 'Failed to fetch review requests'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const getReviewRequestById = useCallback(async (id) => {
    try {
      setLoading(true)
      setError(null)
      const result = await reviewManagementService.getReviewRequestById(id)
      
      if (result.success) {
        setData(result.data)
        return result
      } else {
        setError(result.error)
        throw new Error(result.error)
      }
    } catch (err) {
      const errorMessage = err.message || 'Failed to fetch review request'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const updateReviewRequest = useCallback(async (id, data) => {
    try {
      setLoading(true)
      setError(null)
      const result = await reviewManagementService.updateReviewRequest(id, data)
      
      if (result.success) {
        setData(result.data)
        return result
      } else {
        setError(result.error)
        throw new Error(result.error)
      }
    } catch (err) {
      const errorMessage = err.message || 'Failed to update review request'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const deleteReviewRequest = useCallback(async (id) => {
    try {
      setLoading(true)
      setError(null)
      const result = await reviewManagementService.deleteReviewRequest(id)
      
      if (result.success) {
        setData(result.data)
        return result
      } else {
        setError(result.error)
        throw new Error(result.error)
      }
    } catch (err) {
      const errorMessage = err.message || 'Failed to delete review request'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const reset = useCallback(() => {
    setData(null)
    setError(null)
    setLoading(false)
  }, [])

  return {
    loading,
    error,
    data,
    sendOtp,
    verifyOtp,
    createReviewRequest,
    getAllReviewRequests,
    getReviewRequestById,
    updateReviewRequest,
    deleteReviewRequest,
    clearError,
    reset
  }
}

export default useReviewManagement

