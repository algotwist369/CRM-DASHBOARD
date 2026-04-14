/**
 * File utility functions
 */

/**
 * Check if value is a File object
 * @param {any} value - Value to check
 * @returns {boolean} Is File
 */
export const isFile = (value) => {
  return value instanceof File
}

/**
 * Check if value is a FileList
 * @param {any} value - Value to check
 * @returns {boolean} Is FileList
 */
export const isFileList = (value) => {
  return value instanceof FileList
}

/**
 * Get file extension
 * @param {string|File} file - File name or File object
 * @returns {string} File extension
 */
export const getFileExtension = (file) => {
  if (!file) return ''
  
  const fileName = typeof file === 'string' ? file : file.name
  const lastDot = fileName.lastIndexOf('.')
  
  return lastDot > 0 ? fileName.slice(lastDot + 1).toLowerCase() : ''
}

/**
 * Get file name without extension
 * @param {string|File} file - File name or File object
 * @returns {string} File name without extension
 */
export const getFileNameWithoutExtension = (file) => {
  if (!file) return ''
  
  const fileName = typeof file === 'string' ? file : file.name
  const lastDot = fileName.lastIndexOf('.')
  
  return lastDot > 0 ? fileName.slice(0, lastDot) : fileName
}

/**
 * Get file size in bytes
 * @param {File} file - File object
 * @returns {number} File size in bytes
 */
export const getFileSize = (file) => {
  if (!file || !isFile(file)) return 0
  return file.size
}

/**
 * Format file size
 * @param {number} bytes - File size in bytes
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted file size
 */
export const formatFileSize = (bytes, decimals = 2) => {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + ' ' + sizes[i]
}

/**
 * Get file MIME type
 * @param {File} file - File object
 * @returns {string} MIME type
 */
export const getFileMimeType = (file) => {
  if (!file || !isFile(file)) return ''
  return file.type
}

/**
 * Check if file is image
 * @param {File|string} file - File object or MIME type
 * @returns {boolean} Is image
 */
export const isImageFile = (file) => {
  if (!file) return false
  
  const mimeType = typeof file === 'string' ? file : file.type
  return mimeType.startsWith('image/')
}

/**
 * Check if file is video
 * @param {File|string} file - File object or MIME type
 * @returns {boolean} Is video
 */
export const isVideoFile = (file) => {
  if (!file) return false
  
  const mimeType = typeof file === 'string' ? file : file.type
  return mimeType.startsWith('video/')
}

/**
 * Check if file is audio
 * @param {File|string} file - File object or MIME type
 * @returns {boolean} Is audio
 */
export const isAudioFile = (file) => {
  if (!file) return false
  
  const mimeType = typeof file === 'string' ? file : file.type
  return mimeType.startsWith('audio/')
}

/**
 * Check if file is document
 * @param {File|string} file - File object or MIME type
 * @returns {boolean} Is document
 */
export const isDocumentFile = (file) => {
  if (!file) return false
  
  const mimeType = typeof file === 'string' ? file : file.type
  const documentTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain',
    'text/csv'
  ]
  
  return documentTypes.includes(mimeType)
}

/**
 * Check if file is archive
 * @param {File|string} file - File object or MIME type
 * @returns {boolean} Is archive
 */
export const isArchiveFile = (file) => {
  if (!file) return false
  
  const mimeType = typeof file === 'string' ? file : file.type
  const archiveTypes = [
    'application/zip',
    'application/x-rar-compressed',
    'application/x-7z-compressed',
    'application/gzip',
    'application/x-tar'
  ]
  
  return archiveTypes.includes(mimeType)
}

/**
 * Validate file size
 * @param {File} file - File object
 * @param {number} maxSize - Maximum size in bytes
 * @returns {boolean} Is valid size
 */
export const validateFileSize = (file, maxSize) => {
  if (!file || !isFile(file) || !maxSize) return false
  return file.size <= maxSize
}

/**
 * Validate file type
 * @param {File} file - File object
 * @param {array} allowedTypes - Allowed MIME types
 * @returns {boolean} Is valid type
 */
export const validateFileType = (file, allowedTypes) => {
  if (!file || !isFile(file) || !Array.isArray(allowedTypes)) return false
  return allowedTypes.includes(file.type)
}

/**
 * Validate file extension
 * @param {File|string} file - File object or file name
 * @param {array} allowedExtensions - Allowed extensions
 * @returns {boolean} Is valid extension
 */
export const validateFileExtension = (file, allowedExtensions) => {
  if (!file || !Array.isArray(allowedExtensions)) return false
  
  const extension = getFileExtension(file)
  return allowedExtensions.includes(extension.toLowerCase())
}

/**
 * Read file as text
 * @param {File} file - File object
 * @returns {Promise<string>} File content as text
 */
export const readFileAsText = (file) => {
  if (!file || !isFile(file)) {
    return Promise.reject(new Error('Invalid file'))
  }
  
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = (event) => {
      resolve(event.target.result)
    }
    
    reader.onerror = (error) => {
      reject(error)
    }
    
    reader.readAsText(file)
  })
}

/**
 * Read file as data URL
 * @param {File} file - File object
 * @returns {Promise<string>} File content as data URL
 */
export const readFileAsDataURL = (file) => {
  if (!file || !isFile(file)) {
    return Promise.reject(new Error('Invalid file'))
  }
  
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = (event) => {
      resolve(event.target.result)
    }
    
    reader.onerror = (error) => {
      reject(error)
    }
    
    reader.readAsDataURL(file)
  })
}

/**
 * Read file as array buffer
 * @param {File} file - File object
 * @returns {Promise<ArrayBuffer>} File content as array buffer
 */
export const readFileAsArrayBuffer = (file) => {
  if (!file || !isFile(file)) {
    return Promise.reject(new Error('Invalid file'))
  }
  
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = (event) => {
      resolve(event.target.result)
    }
    
    reader.onerror = (error) => {
      reject(error)
    }
    
    reader.readAsArrayBuffer(file)
  })
}

/**
 * Convert FileList to array
 * @param {FileList} fileList - FileList object
 * @returns {array} Array of File objects
 */
export const fileListToArray = (fileList) => {
  if (!fileList || !isFileList(fileList)) return []
  return Array.from(fileList)
}

/**
 * Create file from data URL
 * @param {string} dataURL - Data URL
 * @param {string} filename - File name
 * @returns {File} File object
 */
export const createFileFromDataURL = (dataURL, filename) => {
  if (!dataURL || !filename) {
    throw new Error('Data URL and filename are required')
  }
  
  const arr = dataURL.split(',')
  const mime = arr[0].match(/:(.*?);/)[1]
  const bstr = atob(arr[1])
  let n = bstr.length
  const u8arr = new Uint8Array(n)
  
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n)
  }
  
  return new File([u8arr], filename, { type: mime })
}

/**
 * Download file
 * @param {string} data - File data
 * @param {string} filename - File name
 * @param {string} mimeType - MIME type
 * @returns {void}
 */
export const downloadFile = (data, filename, mimeType = 'application/octet-stream') => {
  if (!data || !filename) {
    throw new Error('Data and filename are required')
  }
  
  const blob = new Blob([data], { type: mimeType })
  const url = URL.createObjectURL(blob)
  
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  
  URL.revokeObjectURL(url)
}

/**
 * Get file icon
 * @param {File|string} file - File object or extension
 * @returns {string} Icon name
 */
export const getFileIcon = (file) => {
  if (!file) return 'file'
  
  const extension = typeof file === 'string' ? file : getFileExtension(file)
  
  const iconMap = {
    // Images
    jpg: 'image',
    jpeg: 'image',
    png: 'image',
    gif: 'image',
    bmp: 'image',
    svg: 'image',
    webp: 'image',
    
    // Videos
    mp4: 'video',
    avi: 'video',
    mov: 'video',
    wmv: 'video',
    flv: 'video',
    webm: 'video',
    
    // Audio
    mp3: 'music',
    wav: 'music',
    ogg: 'music',
    aac: 'music',
    flac: 'music',
    
    // Documents
    pdf: 'file-pdf',
    doc: 'file-word',
    docx: 'file-word',
    xls: 'file-excel',
    xlsx: 'file-excel',
    ppt: 'file-powerpoint',
    pptx: 'file-powerpoint',
    txt: 'file-text',
    csv: 'file-csv',
    
    // Archives
    zip: 'file-archive',
    rar: 'file-archive',
    '7z': 'file-archive',
    tar: 'file-archive',
    gz: 'file-archive',
    
    // Code
    js: 'file-code',
    ts: 'file-code',
    html: 'file-code',
    css: 'file-code',
    json: 'file-code',
    xml: 'file-code',
    py: 'file-code',
    java: 'file-code',
    cpp: 'file-code',
    c: 'file-code'
  }
  
  return iconMap[extension.toLowerCase()] || 'file'
}

/**
 * Get file type category
 * @param {File|string} file - File object or MIME type
 * @returns {string} File type category
 */
export const getFileTypeCategory = (file) => {
  if (!file) return 'unknown'
  
  const mimeType = typeof file === 'string' ? file : file.type
  
  if (mimeType.startsWith('image/')) return 'image'
  if (mimeType.startsWith('video/')) return 'video'
  if (mimeType.startsWith('audio/')) return 'audio'
  if (mimeType.startsWith('text/')) return 'text'
  if (mimeType.includes('pdf')) return 'document'
  if (mimeType.includes('word') || mimeType.includes('excel') || mimeType.includes('powerpoint')) return 'document'
  if (mimeType.includes('zip') || mimeType.includes('rar') || mimeType.includes('7z')) return 'archive'
  
  return 'unknown'
}

/**
 * File constants
 */
export const FILE_CONSTANTS = {
  MIME_TYPES: {
    IMAGE: 'image/*',
    VIDEO: 'video/*',
    AUDIO: 'audio/*',
    PDF: 'application/pdf',
    WORD: 'application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    EXCEL: 'application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    POWERPOINT: 'application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation',
    TEXT: 'text/plain',
    CSV: 'text/csv',
    JSON: 'application/json',
    XML: 'application/xml',
    ZIP: 'application/zip',
    RAR: 'application/x-rar-compressed'
  },
  EXTENSIONS: {
    IMAGE: ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp'],
    VIDEO: ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm'],
    AUDIO: ['mp3', 'wav', 'ogg', 'aac', 'flac'],
    DOCUMENT: ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'csv'],
    ARCHIVE: ['zip', 'rar', '7z', 'tar', 'gz'],
    CODE: ['js', 'ts', 'html', 'css', 'json', 'xml', 'py', 'java', 'cpp', 'c']
  },
  SIZE_LIMITS: {
    IMAGE: 15 * 1024 * 1024, // 5MB
    VIDEO: 100 * 1024 * 1024, // 100MB
    AUDIO: 20 * 1024 * 1024, // 20MB
    DOCUMENT: 10 * 1024 * 1024, // 10MB
    ARCHIVE: 50 * 1024 * 1024, // 50MB
    DEFAULT: 15 * 1024 * 1024 // 5MB
  }
}

export default {
  isFile,
  isFileList,
  getFileExtension,
  getFileNameWithoutExtension,
  getFileSize,
  formatFileSize,
  getFileMimeType,
  isImageFile,
  isVideoFile,
  isAudioFile,
  isDocumentFile,
  isArchiveFile,
  validateFileSize,
  validateFileType,
  validateFileExtension,
  readFileAsText,
  readFileAsDataURL,
  readFileAsArrayBuffer,
  fileListToArray,
  createFileFromDataURL,
  downloadFile,
  getFileIcon,
  getFileTypeCategory,
  FILE_CONSTANTS
}
