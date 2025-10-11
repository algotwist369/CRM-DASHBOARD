import { apiClient, API_ENDPOINTS } from '../api'

class UploadService {
  // Upload image
  async uploadImage(file, onProgress = null) {
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await apiClient.post(API_ENDPOINTS.UPLOAD.IMAGE, formData, {
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

      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to upload image' 
      }
    }
  }

  // Upload document
  async uploadDocument(file, onProgress = null) {
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await apiClient.post(API_ENDPOINTS.UPLOAD.DOCUMENT, formData, {
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

      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to upload document' 
      }
    }
  }

  // Upload avatar
  async uploadAvatar(file, onProgress = null) {
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await apiClient.post(API_ENDPOINTS.UPLOAD.AVATAR, formData, {
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

      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to upload avatar' 
      }
    }
  }

  // Upload business logo
  async uploadBusinessLogo(file, onProgress = null) {
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await apiClient.post(API_ENDPOINTS.UPLOAD.BUSINESS_LOGO, formData, {
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

      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to upload business logo' 
      }
    }
  }

  // Upload service image
  async uploadServiceImage(file, onProgress = null) {
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await apiClient.post(API_ENDPOINTS.UPLOAD.SERVICE_IMAGE, formData, {
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

      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to upload service image' 
      }
    }
  }

  // Upload multiple files
  async uploadMultipleFiles(files, type = 'image', onProgress = null) {
    try {
      const formData = new FormData()
      files.forEach(file => {
        formData.append('files', file)
      })

      const response = await apiClient.post(`/upload/multiple/${type}`, formData, {
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

      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to upload multiple files' 
      }
    }
  }

  // Delete uploaded file
  async deleteFile(fileId) {
    try {
      const response = await apiClient.delete(`/upload/delete/${fileId}`)
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to delete file' 
      }
    }
  }

  // Get file info
  async getFileInfo(fileId) {
    try {
      const response = await apiClient.get(`/upload/info/${fileId}`)
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch file info' 
      }
    }
  }

  // Get uploaded files
  async getUploadedFiles(params = {}) {
    try {
      const queryParams = new URLSearchParams(params).toString()
      const response = await apiClient.get(`/upload/files?${queryParams}`)
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch uploaded files' 
      }
    }
  }

  // Get file URL
  async getFileUrl(fileId) {
    try {
      const response = await apiClient.get(`/upload/url/${fileId}`)
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch file URL' 
      }
    }
  }

  // Download file
  async downloadFile(fileId) {
    try {
      const response = await apiClient.get(`/upload/download/${fileId}`, {
        responseType: 'blob'
      })
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to download file' 
      }
    }
  }

  // Get upload statistics
  async getUploadStats() {
    try {
      const response = await apiClient.get('/upload/stats')
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch upload statistics' 
      }
    }
  }

  // Get upload limits
  async getUploadLimits() {
    try {
      const response = await apiClient.get('/upload/limits')
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch upload limits' 
      }
    }
  }

  // Validate file
  async validateFile(file, type = 'image') {
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await apiClient.post(`/upload/validate/${type}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to validate file' 
      }
    }
  }

  // Get supported file types
  async getSupportedFileTypes() {
    try {
      const response = await apiClient.get('/upload/supported-types')
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch supported file types' 
      }
    }
  }

  // Get upload history
  async getUploadHistory(params = {}) {
    try {
      const queryParams = new URLSearchParams(params).toString()
      const response = await apiClient.get(`/upload/history?${queryParams}`)
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch upload history' 
      }
    }
  }

  // Clean up old files
  async cleanupOldFiles() {
    try {
      const response = await apiClient.post('/upload/cleanup')
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to cleanup old files' 
      }
    }
  }
}

export default new UploadService()
