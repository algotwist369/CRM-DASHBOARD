import { useState, useCallback } from 'react'

export const useDownload = () => {
  const [downloading, setDownloading] = useState(false)
  const [error, setError] = useState(null)

  const downloadFile = useCallback(async (url, filename) => {
    try {
      setDownloading(true)
      setError(null)

      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const blob = await response.blob()
      const downloadUrl = window.URL.createObjectURL(blob)
      
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = filename || 'download'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      window.URL.revokeObjectURL(downloadUrl)
    } catch (err) {
      setError(err.message)
    } finally {
      setDownloading(false)
    }
  }, [])

  const downloadText = useCallback((text, filename, mimeType = 'text/plain') => {
    try {
      setError(null)
      
      const blob = new Blob([text], { type: mimeType })
      const downloadUrl = window.URL.createObjectURL(blob)
      
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = filename || 'download.txt'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      window.URL.revokeObjectURL(downloadUrl)
    } catch (err) {
      setError(err.message)
    }
  }, [])

  const downloadJSON = useCallback((data, filename) => {
    const jsonString = JSON.stringify(data, null, 2)
    downloadText(jsonString, filename || 'data.json', 'application/json')
  }, [downloadText])

  const downloadCSV = useCallback((data, filename) => {
    if (!Array.isArray(data) || data.length === 0) {
      setError('Data must be a non-empty array')
      return
    }

    const headers = Object.keys(data[0])
    const csvContent = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => 
          typeof row[header] === 'string' && row[header].includes(',')
            ? `"${row[header]}"`
            : row[header]
        ).join(',')
      )
    ].join('\n')

    downloadText(csvContent, filename || 'data.csv', 'text/csv')
  }, [downloadText])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return {
    downloading,
    error,
    downloadFile,
    downloadText,
    downloadJSON,
    downloadCSV,
    clearError
  }
}

export default useDownload
