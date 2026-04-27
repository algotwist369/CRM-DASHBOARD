import { useState, useEffect, useCallback } from 'react'

// Base API configuration
const API_BASE_URL = process.env.VITE_API_BASE_URL || 'https://api.sa.ramaai.cloud/api'

// Default headers
const getDefaultHeaders = () => {
  const token = localStorage.getItem('authToken')
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  }
}

// API client class
class ApiClient {
  constructor(baseURL = API_BASE_URL) {
    this.baseURL = baseURL
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`
    const config = {
      headers: getDefaultHeaders(),
      ...options
    }

    try {
      const response = await fetch(url, config)
      
      // Handle different response types
      const contentType = response.headers.get('content-type')
      let data
      
      if (contentType && contentType.includes('application/json')) {
        data = await response.json()
      } else {
        data = await response.text()
      }

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`)
      }

      return { data, status: response.status, headers: response.headers }
    } catch (error) {
      console.error('API request failed:', error)
      throw error
    }
  }

  get(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'GET' })
  }

  post(endpoint, data, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  put(endpoint, data, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(data)
    })
  }

  patch(endpoint, data, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'PATCH',
      body: JSON.stringify(data)
    })
  }

  delete(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'DELETE' })
  }
}

// Create API client instance
const apiClient = new ApiClient()

// Custom hook for API calls
export const useApi = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const makeRequest = useCallback(async (requestFn) => {
    try {
      setLoading(true)
      setError(null)
      const result = await requestFn()
      return result
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const get = useCallback((endpoint, options) => {
    return makeRequest(() => apiClient.get(endpoint, options))
  }, [makeRequest])

  const post = useCallback((endpoint, data, options) => {
    return makeRequest(() => apiClient.post(endpoint, data, options))
  }, [makeRequest])

  const put = useCallback((endpoint, data, options) => {
    return makeRequest(() => apiClient.put(endpoint, data, options))
  }, [makeRequest])

  const patch = useCallback((endpoint, data, options) => {
    return makeRequest(() => apiClient.patch(endpoint, data, options))
  }, [makeRequest])

  const del = useCallback((endpoint, options) => {
    return makeRequest(() => apiClient.delete(endpoint, options))
  }, [makeRequest])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return {
    loading,
    error,
    get,
    post,
    put,
    patch,
    delete: del,
    clearError
  }
}

// Hook for handling file uploads
export const useFileUpload = () => {
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState(null)

  const uploadFile = useCallback(async (endpoint, file, onProgress) => {
    try {
      setUploading(true)
      setError(null)
      setUploadProgress(0)

      const formData = new FormData()
      formData.append('file', file)

      const token = localStorage.getItem('authToken')
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: formData
      })

      if (!response.ok) {
        throw new Error('Upload failed')
      }

      const result = await response.json()
      setUploadProgress(100)
      return result
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setUploading(false)
    }
  }, [])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return {
    uploading,
    uploadProgress,
    error,
    uploadFile,
    clearError
  }
}

export default useApi
