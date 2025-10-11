import { useState, useCallback } from 'react'
import { useApi } from './useApi'

export const useApiCall = () => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const { get, post, put, patch, delete: del } = useApi()

  const execute = useCallback(async (apiCall) => {
    try {
      setLoading(true)
      setError(null)
      const result = await apiCall()
      setData(result.data)
      return result
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const callGet = useCallback((endpoint, options) => {
    return execute(() => get(endpoint, options))
  }, [execute, get])

  const callPost = useCallback((endpoint, data, options) => {
    return execute(() => post(endpoint, data, options))
  }, [execute, post])

  const callPut = useCallback((endpoint, data, options) => {
    return execute(() => put(endpoint, data, options))
  }, [execute, put])

  const callPatch = useCallback((endpoint, data, options) => {
    return execute(() => patch(endpoint, data, options))
  }, [execute, patch])

  const callDelete = useCallback((endpoint, options) => {
    return execute(() => del(endpoint, options))
  }, [execute, del])

  const clearData = useCallback(() => {
    setData(null)
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
    data,
    loading,
    error,
    callGet,
    callPost,
    callPut,
    callPatch,
    callDelete,
    clearData,
    clearError,
    reset
  }
}

export default useApiCall
