import { createSelector } from '@reduxjs/toolkit'

// Base selectors
const getTransactionState = (state) => state.transaction

// Transaction selectors
export const selectTransactions = createSelector(
  [getTransactionState],
  (transaction) => transaction.transactions
)

export const selectTransactionsList = createSelector(
  [selectTransactions],
  (transactions) => transactions.list
)

export const selectCurrentTransaction = createSelector(
  [selectTransactions],
  (transactions) => transactions.current
)

export const selectTransactionsLoading = createSelector(
  [selectTransactions],
  (transactions) => transactions.isLoading
)

export const selectTransactionsError = createSelector(
  [selectTransactions],
  (transactions) => transactions.error
)

export const selectTransactionsPagination = createSelector(
  [selectTransactions],
  (transactions) => transactions.pagination
)

// Stats selectors
export const selectTransactionStats = createSelector(
  [getTransactionState],
  (transaction) => transaction.stats
)

export const selectTransactionStatsData = createSelector(
  [selectTransactionStats],
  (stats) => stats.data
)

export const selectTransactionStatsLoading = createSelector(
  [selectTransactionStats],
  (stats) => stats.isLoading
)

export const selectTransactionStatsError = createSelector(
  [selectTransactionStats],
  (stats) => stats.error
)

// Transaction filtering selectors
export const selectTransactionById = createSelector(
  [selectTransactionsList],
  (transactions) => (id) => transactions.find(transaction => transaction.id === id)
)

export const selectTransactionsByStatus = createSelector(
  [selectTransactionsList],
  (transactions) => (status) => transactions.filter(transaction => transaction.status === status)
)

export const selectTransactionsByDate = createSelector(
  [selectTransactionsList],
  (transactions) => (date) => transactions.filter(transaction => 
    new Date(transaction.date).toDateString() === new Date(date).toDateString()
  )
)

export const selectTransactionsByCustomer = createSelector(
  [selectTransactionsList],
  (transactions) => (customerId) => transactions.filter(transaction => transaction.customerId === customerId)
)

export const selectTransactionsByStaff = createSelector(
  [selectTransactionsList],
  (transactions) => (staffId) => transactions.filter(transaction => transaction.staffId === staffId)
)

export const selectTransactionsByPaymentMethod = createSelector(
  [selectTransactionsList],
  (transactions) => (paymentMethod) => transactions.filter(transaction => transaction.paymentMethod === paymentMethod)
)

// Status-based selectors
export const selectPendingTransactions = createSelector(
  [selectTransactionsList],
  (transactions) => transactions.filter(transaction => transaction.status === 'pending')
)

export const selectCompletedTransactions = createSelector(
  [selectTransactionsList],
  (transactions) => transactions.filter(transaction => transaction.status === 'completed')
)

export const selectFailedTransactions = createSelector(
  [selectTransactionsList],
  (transactions) => transactions.filter(transaction => transaction.status === 'failed')
)

export const selectRefundedTransactions = createSelector(
  [selectTransactionsList],
  (transactions) => transactions.filter(transaction => transaction.status === 'refunded')
)

// Today's transactions
export const selectTodayTransactions = createSelector(
  [selectTransactionsList],
  (transactions) => {
    const today = new Date().toDateString()
    return transactions.filter(transaction => 
      new Date(transaction.date).toDateString() === today
    )
  }
)

// Recent transactions
export const selectRecentTransactions = createSelector(
  [selectTransactionsList],
  (transactions) => (limit = 5) => {
    return transactions
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, limit)
  }
)

// High-value transactions
export const selectHighValueTransactions = createSelector(
  [selectTransactionsList],
  (transactions) => (threshold = 1000) => {
    return transactions.filter(transaction => transaction.amount >= threshold)
  }
)

// Search selectors
export const selectTransactionsBySearch = createSelector(
  [selectTransactionsList],
  (transactions) => (searchTerm) => {
    if (!searchTerm) return transactions
    const term = searchTerm.toLowerCase()
    return transactions.filter(transaction => 
      transaction.customerName?.toLowerCase().includes(term) ||
      transaction.staffName?.toLowerCase().includes(term) ||
      transaction.paymentMethod?.toLowerCase().includes(term) ||
      transaction.reference?.toLowerCase().includes(term)
    )
  }
)

// Statistics selectors
export const selectTotalTransactions = createSelector(
  [selectTransactionsList],
  (transactions) => transactions.length
)

export const selectTransactionsCountByStatus = createSelector(
  [selectTransactionsList],
  (transactions) => {
    return transactions.reduce((acc, transaction) => {
      acc[transaction.status] = (acc[transaction.status] || 0) + 1
      return acc
    }, {})
  }
)

export const selectTransactionsCountByPaymentMethod = createSelector(
  [selectTransactionsList],
  (transactions) => {
    return transactions.reduce((acc, transaction) => {
      acc[transaction.paymentMethod] = (acc[transaction.paymentMethod] || 0) + 1
      return acc
    }, {})
  }
)

export const selectTransactionsCountByDate = createSelector(
  [selectTransactionsList],
  (transactions) => {
    return transactions.reduce((acc, transaction) => {
      const date = new Date(transaction.date).toDateString()
      acc[date] = (acc[date] || 0) + 1
      return acc
    }, {})
  }
)

// Revenue selectors
export const selectTotalRevenue = createSelector(
  [selectTransactionsList],
  (transactions) => {
    return transactions
      .filter(transaction => transaction.status === 'completed')
      .reduce((total, transaction) => total + (transaction.amount || 0), 0)
  }
)

export const selectTodayRevenue = createSelector(
  [selectTodayTransactions],
  (transactions) => {
    return transactions
      .filter(transaction => transaction.status === 'completed')
      .reduce((total, transaction) => total + (transaction.amount || 0), 0)
  }
)

export const selectRevenueByDate = createSelector(
  [selectTransactionsList],
  (transactions) => {
    return transactions
      .filter(transaction => transaction.status === 'completed')
      .reduce((acc, transaction) => {
        const date = new Date(transaction.date).toDateString()
        acc[date] = (acc[date] || 0) + (transaction.amount || 0)
        return acc
      }, {})
  }
)

export const selectRevenueByPaymentMethod = createSelector(
  [selectTransactionsList],
  (transactions) => {
    return transactions
      .filter(transaction => transaction.status === 'completed')
      .reduce((acc, transaction) => {
        acc[transaction.paymentMethod] = (acc[transaction.paymentMethod] || 0) + (transaction.amount || 0)
        return acc
      }, {})
  }
)

// Transaction details selectors
export const selectTransactionAmount = createSelector(
  [selectCurrentTransaction],
  (transaction) => transaction?.amount
)

export const selectTransactionStatus = createSelector(
  [selectCurrentTransaction],
  (transaction) => transaction?.status
)

export const selectTransactionPaymentMethod = createSelector(
  [selectCurrentTransaction],
  (transaction) => transaction?.paymentMethod
)

export const selectTransactionCustomer = createSelector(
  [selectCurrentTransaction],
  (transaction) => transaction?.customer
)

export const selectTransactionStaff = createSelector(
  [selectCurrentTransaction],
  (transaction) => transaction?.staff
)

export const selectTransactionDate = createSelector(
  [selectCurrentTransaction],
  (transaction) => transaction?.date
)

export const selectTransactionReference = createSelector(
  [selectCurrentTransaction],
  (transaction) => transaction?.reference
)

export const selectTransactionCreatedAt = createSelector(
  [selectCurrentTransaction],
  (transaction) => transaction?.createdAt
)

export const selectTransactionUpdatedAt = createSelector(
  [selectCurrentTransaction],
  (transaction) => transaction?.updatedAt
)

// Loading states
export const selectTransactionLoading = createSelector(
  [selectTransactionsLoading, selectTransactionStatsLoading],
  (transactionsLoading, statsLoading) => transactionsLoading || statsLoading
)

// Error states
export const selectTransactionError = createSelector(
  [selectTransactionsError, selectTransactionStatsError],
  (transactionsError, statsError) => transactionsError || statsError
)

// Combined selectors
export const selectTransactionState = createSelector(
  [selectTransactions, selectTransactionStats],
  (transactions, stats) => ({
    transactions,
    stats
  })
)

export const selectTransactionOverview = createSelector(
  [selectTotalTransactions, selectTotalRevenue, selectTodayRevenue, selectPendingTransactions, selectCompletedTransactions, selectFailedTransactions, selectTransactionsCountByStatus, selectTransactionsCountByPaymentMethod],
  (totalTransactions, totalRevenue, todayRevenue, pendingTransactions, completedTransactions, failedTransactions, countByStatus, countByPaymentMethod) => ({
    totalTransactions,
    totalRevenue,
    todayRevenue,
    pendingTransactions: pendingTransactions.length,
    completedTransactions: completedTransactions.length,
    failedTransactions: failedTransactions.length,
    countByStatus,
    countByPaymentMethod
  })
)
