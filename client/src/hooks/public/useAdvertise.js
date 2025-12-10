import { useState, useCallback } from 'react'
import advertiseService from '../../services/public/advertiseService'

export const useAdvertise = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [data, setData] = useState(null)

  const sendOtp = useCallback(async (phoneNumber, name) => {
    try {
      setLoading(true)
      setError(null)
      const result = await advertiseService.sendOtp(phoneNumber, name)
      
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
      const result = await advertiseService.verifyOtp(phoneNumber, otp)
      
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

  const createAdvertise = useCallback(async (formData) => {
    try {
      setLoading(true)
      setError(null)
      const result = await advertiseService.createAdvertise(formData)
      
      if (result.success) {
        setData(result.data)
        return result
      } else {
        setError(result.error)
        throw new Error(result.error)
      }
    } catch (err) {
      const errorMessage = err.message || 'Failed to submit advertising request'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const getAllAdvertise = useCallback(async (params = {}) => {
    try {
      setLoading(true)
      setError(null)
      const result = await advertiseService.getAllAdvertise(params)
      
      if (result.success) {
        setData(result.data)
        return result
      } else {
        setError(result.error)
        throw new Error(result.error)
      }
    } catch (err) {
      const errorMessage = err.message || 'Failed to fetch advertising requests'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const getAdvertiseById = useCallback(async (id) => {
    try {
      setLoading(true)
      setError(null)
      const result = await advertiseService.getAdvertiseById(id)
      
      if (result.success) {
        setData(result.data)
        return result
      } else {
        setError(result.error)
        throw new Error(result.error)
      }
    } catch (err) {
      const errorMessage = err.message || 'Failed to fetch advertising request'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const updateAdvertise = useCallback(async (id, data) => {
    try {
      setLoading(true)
      setError(null)
      const result = await advertiseService.updateAdvertise(id, data)
      
      if (result.success) {
        setData(result.data)
        return result
      } else {
        setError(result.error)
        throw new Error(result.error)
      }
    } catch (err) {
      const errorMessage = err.message || 'Failed to update advertising request'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const deleteAdvertise = useCallback(async (id) => {
    try {
      setLoading(true)
      setError(null)
      const result = await advertiseService.deleteAdvertise(id)
      
      if (result.success) {
        setData(result.data)
        return result
      } else {
        setError(result.error)
        throw new Error(result.error)
      }
    } catch (err) {
      const errorMessage = err.message || 'Failed to delete advertising request'
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
    createAdvertise,
    getAllAdvertise,
    getAdvertiseById,
    updateAdvertise,
    deleteAdvertise,
    clearError,
    reset
  }
}

export default useAdvertise

