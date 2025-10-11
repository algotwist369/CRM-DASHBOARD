import { useState, useEffect, useCallback } from 'react'
import { useApi } from '../api/useApi'

export const useTransactions = (options = {}) => {
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [pagination, setPagination] = useState(null)
  const { get, post } = useApi()

  const {
    page = 1,
    limit = 20,
    search = '',
    status = '',
    paymentMethod = '',
    customerId = '',
    staffId = '',
    businessId = '',
    startDate = '',
    endDate = '',
    minAmount = '',
    maxAmount = '',
    sortBy = 'createdAt',
    sortOrder = 'desc',
    enabled = true,
    onSuccess,
    onError
  } = options

  const fetchTransactions = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        sortBy,
        sortOrder,
        ...(search && { search }),
        ...(status && { status }),
        ...(paymentMethod && { paymentMethod }),
        ...(customerId && { customerId }),
        ...(staffId && { staffId }),
        ...(businessId && { businessId }),
        ...(startDate && { startDate }),
        ...(endDate && { endDate }),
        ...(minAmount && { minAmount }),
        ...(maxAmount && { maxAmount })
      })

      const result = await get(`/transactions?${params}`)
      const { data, pagination: paginationData } = result.data

      setTransactions(data)
      setPagination(paginationData)

      if (onSuccess) {
        onSuccess(data, paginationData)
      }
    } catch (err) {
      setError(err.message)
      if (onError) {
        onError(err)
      }
    } finally {
      setLoading(false)
    }
  }, [page, limit, search, status, paymentMethod, customerId, staffId, businessId, startDate, endDate, minAmount, maxAmount, sortBy, sortOrder, get, onSuccess, onError])

  const createTransaction = useCallback(async (transactionData) => {
    try {
      setLoading(true)
      setError(null)
      const result = await post('/transactions', transactionData)
      
      // Add new transaction to the list
      setTransactions(prev => [result.data, ...prev])
      
      return result.data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [post])

  const updateTransaction = useCallback(async (transactionId, updateData) => {
    try {
      setLoading(true)
      setError(null)
      const result = await post(`/transactions/${transactionId}`, updateData)
      
      // Update transaction in the list
      setTransactions(prev => 
        prev.map(transaction => 
          transaction.id === transactionId ? result.data : transaction
        )
      )
      
      return result.data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [post])

  const deleteTransaction = useCallback(async (transactionId) => {
    try {
      setLoading(true)
      setError(null)
      await post(`/transactions/${transactionId}/delete`)
      
      // Remove transaction from the list
      setTransactions(prev => prev.filter(transaction => transaction.id !== transactionId))
      
      return true
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [post])

  const bulkUpdateTransactions = useCallback(async (transactionIds, updateData) => {
    try {
      setLoading(true)
      setError(null)
      const result = await post('/transactions/bulk-update', {
        transactionIds,
        updateData
      })
      
      // Update transactions in the list
      setTransactions(prev => 
        prev.map(transaction => 
          transactionIds.includes(transaction.id) 
            ? { ...transaction, ...updateData }
            : transaction
        )
      )
      
      return result.data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [post])

  const bulkDeleteTransactions = useCallback(async (transactionIds) => {
    try {
      setLoading(true)
      setError(null)
      await post('/transactions/bulk-delete', { transactionIds })
      
      // Remove transactions from the list
      setTransactions(prev => 
        prev.filter(transaction => !transactionIds.includes(transaction.id))
      )
      
      return true
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [post])

  const getTransactionStats = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const result = await get('/transactions/stats')
      return result.data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [get])

  const getTodayTransactions = useCallback(async (params = {}) => {
    try {
      setLoading(true)
      setError(null)
      const queryParams = new URLSearchParams(params).toString()
      const result = await get(`/transactions/today?${queryParams}`)
      return result.data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [get])

  const getTransactionsByDate = useCallback(async (date, params = {}) => {
    try {
      setLoading(true)
      setError(null)
      const queryParams = new URLSearchParams({ date, ...params }).toString()
      const result = await get(`/transactions/by-date?${queryParams}`)
      return result.data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [get])

  const getTransactionsByStatus = useCallback(async (status, params = {}) => {
    try {
      setLoading(true)
      setError(null)
      const queryParams = new URLSearchParams({ status, ...params }).toString()
      const result = await get(`/transactions/by-status?${queryParams}`)
      return result.data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [get])

  const getTransactionsByPaymentMethod = useCallback(async (paymentMethod, params = {}) => {
    try {
      setLoading(true)
      setError(null)
      const queryParams = new URLSearchParams({ paymentMethod, ...params }).toString()
      const result = await get(`/transactions/by-payment-method?${queryParams}`)
      return result.data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [get])

  const getRevenueByPeriod = useCallback(async (period, params = {}) => {
    try {
      setLoading(true)
      setError(null)
      const queryParams = new URLSearchParams({ period, ...params }).toString()
      const result = await get(`/transactions/revenue?${queryParams}`)
      return result.data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [get])

  const getTopCustomers = useCallback(async (params = {}) => {
    try {
      setLoading(true)
      setError(null)
      const queryParams = new URLSearchParams(params).toString()
      const result = await get(`/transactions/top-customers?${queryParams}`)
      return result.data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [get])

  const getTopServices = useCallback(async (params = {}) => {
    try {
      setLoading(true)
      setError(null)
      const queryParams = new URLSearchParams(params).toString()
      const result = await get(`/transactions/top-services?${queryParams}`)
      return result.data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [get])

  const exportTransactions = useCallback(async (format = 'csv', filters = {}) => {
    try {
      setLoading(true)
      setError(null)
      
      const params = new URLSearchParams({
        format,
        ...filters
      })
      
      const result = await get(`/transactions/export?${params}`)
      return result.data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [get])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const reset = useCallback(() => {
    setTransactions([])
    setError(null)
    setPagination(null)
    setLoading(false)
  }, [])

  useEffect(() => {
    if (enabled) {
      fetchTransactions()
    }
  }, [enabled, fetchTransactions])

  return {
    transactions,
    loading,
    error,
    pagination,
    fetchTransactions,
    createTransaction,
    updateTransaction,
    deleteTransaction,
    bulkUpdateTransactions,
    bulkDeleteTransactions,
    getTransactionStats,
    getTodayTransactions,
    getTransactionsByDate,
    getTransactionsByStatus,
    getTransactionsByPaymentMethod,
    getRevenueByPeriod,
    getTopCustomers,
    getTopServices,
    exportTransactions,
    clearError,
    reset
  }
}

export default useTransactions
