import { useState, useCallback } from 'react'
import bookDemoService from '../../services/public/bookDemoService'

export const useBookDemo = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [data, setData] = useState(null)

  const sendOtp = useCallback(async (phoneNumber, fullName) => {
    try {
      setLoading(true)
      setError(null)
      const result = await bookDemoService.sendOtp(phoneNumber, fullName)
      
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
      const result = await bookDemoService.verifyOtp(phoneNumber, otp)
      
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

  const createBookDemo = useCallback(async (formData) => {
    try {
      setLoading(true)
      setError(null)
      const result = await bookDemoService.createBookDemo(formData)
      
      if (result.success) {
        setData(result.data)
        return result
      } else {
        setError(result.error)
        throw new Error(result.error)
      }
    } catch (err) {
      const errorMessage = err.message || 'Failed to submit demo request'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const getAllBookDemos = useCallback(async (params = {}) => {
    try {
      setLoading(true)
      setError(null)
      const result = await bookDemoService.getAllBookDemos(params)
      
      if (result.success) {
        setData(result.data)
        return result
      } else {
        setError(result.error)
        throw new Error(result.error)
      }
    } catch (err) {
      const errorMessage = err.message || 'Failed to fetch demo requests'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const getBookDemoById = useCallback(async (id) => {
    try {
      setLoading(true)
      setError(null)
      const result = await bookDemoService.getBookDemoById(id)
      
      if (result.success) {
        setData(result.data)
        return result
      } else {
        setError(result.error)
        throw new Error(result.error)
      }
    } catch (err) {
      const errorMessage = err.message || 'Failed to fetch demo request'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const updateBookDemoStatus = useCallback(async (id, isCompleted) => {
    try {
      setLoading(true)
      setError(null)
      const result = await bookDemoService.updateBookDemoStatus(id, isCompleted)
      
      if (result.success) {
        setData(result.data)
        return result
      } else {
        setError(result.error)
        throw new Error(result.error)
      }
    } catch (err) {
      const errorMessage = err.message || 'Failed to update status'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const deleteBookDemo = useCallback(async (id) => {
    try {
      setLoading(true)
      setError(null)
      const result = await bookDemoService.deleteBookDemo(id)
      
      if (result.success) {
        setData(result.data)
        return result
      } else {
        setError(result.error)
        throw new Error(result.error)
      }
    } catch (err) {
      const errorMessage = err.message || 'Failed to delete demo request'
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
    createBookDemo,
    getAllBookDemos,
    getBookDemoById,
    updateBookDemoStatus,
    deleteBookDemo,
    clearError,
    reset
  }
}

export default useBookDemo

