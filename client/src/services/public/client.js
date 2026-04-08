import axios from 'axios'
import authService from '../auth/authService'

// Base configuration
const API_BASE_URL = 'https://public.sa.api.ramaai.cloud/api'
const API_TIMEOUT = 30000 // 30 seconds

// Create axios instance
const apiClient = axios.create({
    baseURL: API_BASE_URL,
    timeout: API_TIMEOUT,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
})

// Track if we're already refreshing to prevent multiple refresh attempts
let isRefreshing = false
let failedQueue = []

const processQueue = (error, token = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error)
        } else {
            prom.resolve(token)
        }
    })

    failedQueue = []
}

// Request interceptor
apiClient.interceptors.request.use(
    (config) => {
        // Add auth token to requests
        const token = localStorage.getItem('authToken')
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }

        // Remove Content-Type header for FormData - axios will set it automatically with boundary
        if (config.data instanceof FormData) {
            delete config.headers['Content-Type']
        }

        // Add request timestamp for debugging
        config.metadata = { startTime: new Date() }

        // Log request in development
        if (import.meta.env.MODE === 'development') {
            console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`, {
                data: config.data,
                params: config.params,
                headers: config.headers
            })
        }

        return config
    },
    (error) => {
        console.error('Request interceptor error:', error)
        return Promise.reject(error)
    }
)

// Response interceptor
apiClient.interceptors.response.use(
    (response) => {
        // Calculate request duration
        const duration = new Date() - response.config.metadata.startTime

        // Log response in development
        if (import.meta.env.MODE === 'development') {
            console.log(`✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`, {
                status: response.status,
                duration: `${duration}ms`,
                data: response.data
            })
        }

        return response
    },
    (error) => {
        const duration = error.config?.metadata ? new Date() - error.config.metadata.startTime : 0

        // Log error in development
        if (import.meta.env.MODE === 'development') {
            console.error(`❌ API Error: ${error.config?.method?.toUpperCase()} ${error.config?.url}`, {
                status: error.response?.status,
                duration: `${duration}ms`,
                error: error.response?.data || error.message
            })
        }

        // Handle specific error cases
        if (error.response) {
            const { status, data } = error.response

            switch (status) {
                case 401:
                    // Unauthorized - try to refresh token
                    const originalRequest = error.config

                    // Don't retry logout requests
                    if (originalRequest.url.includes('/auth/logout')) {
                        return Promise.reject(error)
                    }

                    // If we're already refreshing, queue this request
                    if (isRefreshing) {
                        return new Promise((resolve, reject) => {
                            failedQueue.push({ resolve, reject })
                        })
                            .then(token => {
                                originalRequest.headers.Authorization = `Bearer ${token}`
                                return apiClient(originalRequest)
                            })
                            .catch(err => {
                                return Promise.reject(err)
                            })
                    }

                    // Start refresh process
                    isRefreshing = true

                    return authService.refreshToken()
                        .then(result => {
                            if (result.success) {
                                processQueue(null, result.token)
                                originalRequest.headers.Authorization = `Bearer ${result.token}`
                                isRefreshing = false
                                return apiClient(originalRequest)
                            } else {
                                throw result
                            }
                        })
                        .catch(refreshError => {
                            processQueue(refreshError, null)
                            isRefreshing = false
                            // If refresh failed, clear auth and redirect to login
                            localStorage.removeItem('authToken')
                            localStorage.removeItem('refreshToken')
                            localStorage.removeItem('userRole')
                            localStorage.removeItem('userId')
                            window.location.href = '/auth/login'
                            return Promise.reject(refreshError)
                        })
                    break

                case 403:
                    // Forbidden - show access denied message
                    console.error('Access denied:', data.message)
                    break

                case 404:
                    // Not found
                    console.error('Resource not found:', data.message)
                    break

                case 422:
                    // Validation error
                    console.error('Validation error:', data.errors)
                    break

                case 429:
                    // Rate limit exceeded
                    console.error('Rate limit exceeded:', data.message)
                    break

                case 500:
                    // Server error
                    console.error('Server error:', data.message)
                    break

                default:
                    console.error('API error:', data.message || 'Unknown error')
            }
        } else if (error.request) {
            // Network error
            console.error('Network error:', error.message)
        } else {
            // Other error
            console.error('Error:', error.message)
        }

        return Promise.reject(error)
    }
)

// Helper methods
export const setAuthToken = (token) => {
    if (token) {
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`
    } else {
        delete apiClient.defaults.headers.common['Authorization']
    }
}

export const removeAuthToken = () => {
    delete apiClient.defaults.headers.common['Authorization']
}

export const updateBaseURL = (newBaseURL) => {
    apiClient.defaults.baseURL = newBaseURL
}

export const updateTimeout = (newTimeout) => {
    apiClient.defaults.timeout = newTimeout
}

// Request methods
export const get = (url, config = {}) => apiClient.get(url, config)
export const post = (url, data = {}, config = {}) => apiClient.post(url, data, config)
export const put = (url, data = {}, config = {}) => apiClient.put(url, data, config)
export const patch = (url, data = {}, config = {}) => apiClient.patch(url, data, config)
export const del = (url, config = {}) => apiClient.delete(url, config)

// File upload method
export const uploadFile = (url, file, onProgress = null) => {
    const formData = new FormData()
    formData.append('file', file)

    return apiClient.post(url, formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
            if (onProgress) {
                const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)
                onProgress(percentCompleted)
            }
        }
    })
}

// Download file method
export const downloadFile = (url, filename) => {
    return apiClient.get(url, {
        responseType: 'blob'
    }).then(response => {
        const blob = new Blob([response.data])
        const downloadUrl = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = downloadUrl
        link.download = filename
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(downloadUrl)
    })
}

export { apiClient }
export default apiClient