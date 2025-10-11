import { useState, useEffect, useCallback, useRef } from 'react'
import { useApi } from './useApi'

export const useInfiniteQuery = (endpoint, options = {}) => {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState(null)
  const [hasNextPage, setHasNextPage] = useState(true)
  const [page, setPage] = useState(1)
  
  const { get } = useApi()
  const abortControllerRef = useRef(null)

  const {
    pageSize = 20,
    enabled = true,
    onSuccess,
    onError,
    ...queryOptions
  } = options

  const fetchData = useCallback(async (pageNum = 1, isLoadMore = false) => {
    if (!enabled) return

    try {
      if (isLoadMore) {
        setLoadingMore(true)
      } else {
        setLoading(true)
      }
      setError(null)

      // Cancel previous request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }

      // Create new abort controller
      abortControllerRef.current = new AbortController()

      const params = new URLSearchParams({
        page: pageNum.toString(),
        limit: pageSize.toString(),
        ...queryOptions
      })

      const result = await get(`${endpoint}?${params}`, {
        signal: abortControllerRef.current.signal
      })

      const { data: newData, pagination } = result.data

      if (isLoadMore) {
        setData(prev => [...prev, ...newData])
      } else {
        setData(newData)
      }

      setHasNextPage(pagination?.hasNextPage || false)
      setPage(pageNum)

      if (onSuccess) {
        onSuccess(newData, pagination)
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        setError(err.message)
        if (onError) {
          onError(err)
        }
      }
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }, [endpoint, pageSize, enabled, get, queryOptions, onSuccess, onError])

  const loadMore = useCallback(() => {
    if (hasNextPage && !loadingMore && !loading) {
      fetchData(page + 1, true)
    }
  }, [hasNextPage, loadingMore, loading, page, fetchData])

  const refetch = useCallback(() => {
    setPage(1)
    setData([])
    setHasNextPage(true)
    fetchData(1, false)
  }, [fetchData])

  const reset = useCallback(() => {
    setData([])
    setPage(1)
    setHasNextPage(true)
    setError(null)
    setLoading(false)
    setLoadingMore(false)
  }, [])

  // Initial fetch
  useEffect(() => {
    if (enabled) {
      fetchData(1, false)
    }

    // Cleanup on unmount
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [enabled, fetchData])

  return {
    data,
    loading,
    loadingMore,
    error,
    hasNextPage,
    page,
    loadMore,
    refetch,
    reset
  }
}

export default useInfiniteQuery
