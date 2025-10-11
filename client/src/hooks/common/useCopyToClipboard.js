import { useState, useCallback } from 'react'

export const useCopyToClipboard = () => {
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState(null)

  const copyToClipboard = useCallback(async (text) => {
    try {
      setError(null)
      setCopied(false)

      if (!navigator.clipboard) {
        throw new Error('Clipboard API not supported')
      }

      await navigator.clipboard.writeText(text)
      setCopied(true)

      // Reset copied state after 2 seconds
      setTimeout(() => {
        setCopied(false)
      }, 2000)
    } catch (err) {
      setError(err.message)
      setCopied(false)
    }
  }, [])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const reset = useCallback(() => {
    setCopied(false)
    setError(null)
  }, [])

  return {
    copied,
    error,
    copyToClipboard,
    clearError,
    reset
  }
}

export default useCopyToClipboard
