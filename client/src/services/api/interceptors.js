import { apiClient } from './client'

// Request interceptors
export const addRequestInterceptor = (onFulfilled, onRejected) => {
  return apiClient.interceptors.request.use(onFulfilled, onRejected)
}

export const removeRequestInterceptor = (interceptorId) => {
  apiClient.interceptors.request.eject(interceptorId)
}

// Response interceptors
export const addResponseInterceptor = (onFulfilled, onRejected) => {
  return apiClient.interceptors.response.use(onFulfilled, onRejected)
}

export const removeResponseInterceptor = (interceptorId) => {
  apiClient.interceptors.response.eject(interceptorId)
}

// Common request interceptor for loading states
export const addLoadingInterceptor = (setLoading) => {
  const requestInterceptor = apiClient.interceptors.request.use(
    (config) => {
      setLoading(true)
      return config
    },
    (error) => {
      setLoading(false)
      return Promise.reject(error)
    }
  )

  const responseInterceptor = apiClient.interceptors.response.use(
    (response) => {
      setLoading(false)
      return response
    },
    (error) => {
      setLoading(false)
      return Promise.reject(error)
    }
  )

  return {
    request: requestInterceptor,
    response: responseInterceptor
  }
}

// Error handling interceptor
export const addErrorInterceptor = (errorHandler) => {
  return apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
      errorHandler(error)
      return Promise.reject(error)
    }
  )
}

// Retry interceptor for failed requests
export const addRetryInterceptor = (maxRetries = 3, retryDelay = 1000) => {
  return apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
      const config = error.config

      if (!config || !config.retry) {
        config.retry = 0
      }

      if (config.retry >= maxRetries) {
        return Promise.reject(error)
      }

      config.retry += 1

      // Only retry on network errors or 5xx status codes
      if (!error.response || error.response.status >= 500) {
        await new Promise(resolve => setTimeout(resolve, retryDelay * config.retry))
        return apiClient(config)
      }

      return Promise.reject(error)
    }
  )
}

// Cache interceptor for GET requests
export const addCacheInterceptor = (cacheDuration = 5 * 60 * 1000) => { // 5 minutes
  const cache = new Map()

  return apiClient.interceptors.request.use(
    (config) => {
      if (config.method === 'get' && !config.skipCache) {
        const cacheKey = `${config.url}${JSON.stringify(config.params)}`
        const cached = cache.get(cacheKey)

        if (cached && Date.now() - cached.timestamp < cacheDuration) {
          return Promise.resolve({
            ...cached.response,
            fromCache: true
          })
        }
      }
      return config
    }
  )

  // Response interceptor to cache successful GET requests
  apiClient.interceptors.response.use(
    (response) => {
      if (response.config.method === 'get' && !response.config.skipCache && !response.fromCache) {
        const cacheKey = `${response.config.url}${JSON.stringify(response.config.params)}`
        cache.set(cacheKey, {
          response,
          timestamp: Date.now()
        })
      }
      return response
    }
  )
}

// Request logging interceptor
export const addLoggingInterceptor = () => {
  const requestInterceptor = apiClient.interceptors.request.use(
    (config) => {
      console.group(`🚀 ${config.method?.toUpperCase()} ${config.url}`)
      console.log('Request config:', config)
      console.log('Request data:', config.data)
      console.log('Request params:', config.params)
      return config
    }
  )

  const responseInterceptor = apiClient.interceptors.response.use(
    (response) => {
      console.log('Response data:', response.data)
      console.log('Response status:', response.status)
      console.groupEnd()
      return response
    },
    (error) => {
      console.error('Response error:', error.response?.data || error.message)
      console.groupEnd()
      return Promise.reject(error)
    }
  )

  return {
    request: requestInterceptor,
    response: responseInterceptor
  }
}

// Performance monitoring interceptor
export const addPerformanceInterceptor = () => {
  return apiClient.interceptors.request.use(
    (config) => {
      config.metadata = { startTime: Date.now() }
      return config
    }
  )

  apiClient.interceptors.response.use(
    (response) => {
      const duration = Date.now() - response.config.metadata.startTime
      console.log(`⏱️ ${response.config.method?.toUpperCase()} ${response.config.url} took ${duration}ms`)
      return response
    }
  )
}

// Offline detection interceptor
export const addOfflineInterceptor = () => {
  return apiClient.interceptors.request.use(
    (config) => {
      if (!navigator.onLine) {
        return Promise.reject(new Error('No internet connection'))
      }
      return config
    }
  )
}

export default {
  addRequestInterceptor,
  removeRequestInterceptor,
  addResponseInterceptor,
  removeResponseInterceptor,
  addLoadingInterceptor,
  addErrorInterceptor,
  addRetryInterceptor,
  addCacheInterceptor,
  addLoggingInterceptor,
  addPerformanceInterceptor,
  addOfflineInterceptor
}
