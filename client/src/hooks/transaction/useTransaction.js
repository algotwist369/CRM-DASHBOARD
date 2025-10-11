import { useState, useEffect, useCallback } from 'react'
import { useApi } from '../api/useApi'

export const useTransaction = (transactionId) => {
  const [transaction, setTransaction] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const { get, put, patch, delete: del } = useApi()

  const fetchTransaction = useCallback(async () => {
    if (!transactionId) return

    try {
      setLoading(true)
      setError(null)
      const result = await get(`/transactions/${transactionId}`)
      setTransaction(result.data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [transactionId, get])

  const updateTransaction = useCallback(async (updateData) => {
    try {
      setLoading(true)
      setError(null)
      const result = await put(`/transactions/${transactionId}`, updateData)
      setTransaction(result.data)
      return result.data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [transactionId, put])

  const patchTransaction = useCallback(async (patchData) => {
    try {
      setLoading(true)
      setError(null)
      const result = await patch(`/transactions/${transactionId}`, patchData)
      setTransaction(result.data)
      return result.data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [transactionId, patch])

  const deleteTransaction = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      await del(`/transactions/${transactionId}`)
      setTransaction(null)
      return true
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [transactionId, del])

  const updateTransactionStatus = useCallback(async (status) => {
    return patchTransaction({ status })
  }, [patchTransaction])

  const processRefund = useCallback(async (amount, reason = '') => {
    return patchTransaction({ 
      status: 'refunded', 
      refundAmount: amount,
      refundReason: reason,
      refundedAt: new Date().toISOString()
    })
  }, [patchTransaction])

  const addTransactionNote = useCallback(async (note) => {
    return patchTransaction({ note })
  }, [patchTransaction])

  const updatePaymentMethod = useCallback(async (paymentMethod) => {
    return patchTransaction({ paymentMethod })
  }, [patchTransaction])

  const getTransactionReceipt = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const result = await get(`/transactions/${transactionId}/receipt`)
      return result.data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [transactionId, get])

  const sendReceipt = useCallback(async (email) => {
    try {
      setLoading(true)
      setError(null)
      const result = await patch(`/transactions/${transactionId}/send-receipt`, { email })
      return result.data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [transactionId, patch])

  const getTransactionHistory = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const result = await get(`/transactions/${transactionId}/history`)
      return result.data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [transactionId, get])

  const getTransactionItems = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const result = await get(`/transactions/${transactionId}/items`)
      return result.data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [transactionId, get])

  const addTransactionItem = useCallback(async (item) => {
    try {
      setLoading(true)
      setError(null)
      const result = await patch(`/transactions/${transactionId}/items`, { item })
      return result.data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [transactionId, patch])

  const removeTransactionItem = useCallback(async (itemId) => {
    try {
      setLoading(true)
      setError(null)
      const result = await del(`/transactions/${transactionId}/items/${itemId}`)
      return result.data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [transactionId, del])

  const applyDiscount = useCallback(async (discountCode) => {
    try {
      setLoading(true)
      setError(null)
      const result = await patch(`/transactions/${transactionId}/discount`, { discountCode })
      return result.data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [transactionId, patch])

  const removeDiscount = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const result = await del(`/transactions/${transactionId}/discount`)
      return result.data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [transactionId, del])

  const calculateTax = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const result = await get(`/transactions/${transactionId}/calculate-tax`)
      return result.data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [transactionId, get])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const reset = useCallback(() => {
    setTransaction(null)
    setError(null)
    setLoading(false)
  }, [])

  useEffect(() => {
    if (transactionId) {
      fetchTransaction()
    }
  }, [transactionId, fetchTransaction])

  return {
    transaction,
    loading,
    error,
    fetchTransaction,
    updateTransaction,
    patchTransaction,
    deleteTransaction,
    updateTransactionStatus,
    processRefund,
    addTransactionNote,
    updatePaymentMethod,
    getTransactionReceipt,
    sendReceipt,
    getTransactionHistory,
    getTransactionItems,
    addTransactionItem,
    removeTransactionItem,
    applyDiscount,
    removeDiscount,
    calculateTax,
    clearError,
    reset
  }
}

export default useTransaction
