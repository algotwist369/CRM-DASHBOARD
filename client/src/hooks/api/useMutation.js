import { useState, useCallback } from 'react'
import { useApi } from './useApi'

export const useMutation = (mutationFn, options = {}) => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [isSuccess, setIsSuccess] = useState(false)
  
  const { post, put, patch, delete: del } = useApi()

  const {
    onSuccess,
    onError,
    onSettled
  } = options

  const mutate = useCallback(async (variables, mutationOptions = {}) => {
    try {
      setLoading(true)
      setError(null)
      setIsSuccess(false)

      let result
      
      if (typeof mutationFn === 'function') {
        // Custom mutation function
        result = await mutationFn(variables)
      } else if (typeof mutationFn === 'string') {
        // API endpoint string
        const { method = 'POST', endpoint = mutationFn, data: mutationData } = mutationOptions
        
        switch (method.toUpperCase()) {
          case 'POST':
            result = await post(endpoint, mutationData || variables)
            break
          case 'PUT':
            result = await put(endpoint, mutationData || variables)
            break
          case 'PATCH':
            result = await patch(endpoint, mutationData || variables)
            break
          case 'DELETE':
            result = await del(endpoint, mutationOptions)
            break
          default:
            throw new Error(`Unsupported HTTP method: ${method}`)
        }
      } else {
        throw new Error('Invalid mutation function')
      }

      setData(result.data)
      setIsSuccess(true)

      if (onSuccess) {
        onSuccess(result.data, variables)
      }

      return result
    } catch (err) {
      setError(err.message)
      setIsSuccess(false)

      if (onError) {
        onError(err, variables)
      }

      throw err
    } finally {
      setLoading(false)
      
      if (onSettled) {
        onSettled(data, error, variables)
      }
    }
  }, [mutationFn, post, put, patch, del, onSuccess, onError, onSettled, data, error])

  const reset = useCallback(() => {
    setData(null)
    setError(null)
    setIsSuccess(false)
    setLoading(false)
  }, [])

  return {
    mutate,
    data,
    loading,
    error,
    isSuccess,
    reset
  }
}

// Specific mutation hooks for common operations
export const useCreateMutation = (endpoint, options = {}) => {
  return useMutation(endpoint, {
    ...options,
    method: 'POST'
  })
}

export const useUpdateMutation = (endpoint, options = {}) => {
  return useMutation(endpoint, {
    ...options,
    method: 'PUT'
  })
}

export const usePatchMutation = (endpoint, options = {}) => {
  return useMutation(endpoint, {
    ...options,
    method: 'PATCH'
  })
}

export const useDeleteMutation = (endpoint, options = {}) => {
  return useMutation(endpoint, {
    ...options,
    method: 'DELETE'
  })
}

export default useMutation
