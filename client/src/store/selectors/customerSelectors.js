import { createSelector } from '@reduxjs/toolkit'

// Base selectors
const getCustomerState = (state) => state.customer

// Customer selectors
export const selectCustomers = createSelector(
  [getCustomerState],
  (customer) => customer.customers
)

export const selectCustomersList = createSelector(
  [selectCustomers],
  (customers) => customers.list
)

export const selectCurrentCustomer = createSelector(
  [selectCustomers],
  (customers) => customers.current
)

export const selectCustomersLoading = createSelector(
  [selectCustomers],
  (customers) => customers.isLoading
)

export const selectCustomersError = createSelector(
  [selectCustomers],
  (customers) => customers.error
)

export const selectCustomersPagination = createSelector(
  [selectCustomers],
  (customers) => customers.pagination
)

// Stats selectors
export const selectCustomerStats = createSelector(
  [getCustomerState],
  (customer) => customer.stats
)

export const selectCustomerStatsData = createSelector(
  [selectCustomerStats],
  (stats) => stats.data
)

export const selectCustomerStatsLoading = createSelector(
  [selectCustomerStats],
  (stats) => stats.isLoading
)

export const selectCustomerStatsError = createSelector(
  [selectCustomerStats],
  (stats) => stats.error
)

// Customer filtering selectors
export const selectCustomerById = createSelector(
  [selectCustomersList],
  (customers) => (id) => customers.find(customer => customer.id === id)
)

export const selectCustomersByStatus = createSelector(
  [selectCustomersList],
  (customers) => (status) => customers.filter(customer => customer.status === status)
)

export const selectActiveCustomers = createSelector(
  [selectCustomersList],
  (customers) => customers.filter(customer => customer.status === 'active')
)

export const selectInactiveCustomers = createSelector(
  [selectCustomersList],
  (customers) => customers.filter(customer => customer.status === 'inactive')
)

export const selectCustomersBySegment = createSelector(
  [selectCustomersList],
  (customers) => (segment) => customers.filter(customer => customer.segment === segment)
)

export const selectCustomersByBusiness = createSelector(
  [selectCustomersList],
  (customers) => (businessId) => customers.filter(customer => customer.businessId === businessId)
)

export const selectCustomersByLocation = createSelector(
  [selectCustomersList],
  (customers) => (location) => customers.filter(customer => customer.location === location)
)

// Search selectors
export const selectCustomersBySearch = createSelector(
  [selectCustomersList],
  (customers) => (searchTerm) => {
    if (!searchTerm) return customers
    const term = searchTerm.toLowerCase()
    return customers.filter(customer => 
      customer.name?.toLowerCase().includes(term) ||
      customer.email?.toLowerCase().includes(term) ||
      customer.phone?.toLowerCase().includes(term) ||
      customer.location?.toLowerCase().includes(term)
    )
  }
)

// Statistics selectors
export const selectTotalCustomers = createSelector(
  [selectCustomersList],
  (customers) => customers.length
)

export const selectCustomersCountByStatus = createSelector(
  [selectCustomersList],
  (customers) => {
    return customers.reduce((acc, customer) => {
      acc[customer.status] = (acc[customer.status] || 0) + 1
      return acc
    }, {})
  }
)

export const selectCustomersCountBySegment = createSelector(
  [selectCustomersList],
  (customers) => {
    return customers.reduce((acc, customer) => {
      acc[customer.segment] = (acc[customer.segment] || 0) + 1
      return acc
    }, {})
  }
)

export const selectCustomersCountByLocation = createSelector(
  [selectCustomersList],
  (customers) => {
    return customers.reduce((acc, customer) => {
      acc[customer.location] = (acc[customer.location] || 0) + 1
      return acc
    }, {})
  }
)

// Recent customers
export const selectRecentCustomers = createSelector(
  [selectCustomersList],
  (customers) => (limit = 5) => {
    return customers
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, limit)
  }
)

// Top customers by value
export const selectTopCustomersByValue = createSelector(
  [selectCustomersList],
  (customers) => (limit = 5) => {
    return customers
      .sort((a, b) => (b.totalValue || 0) - (a.totalValue || 0))
      .slice(0, limit)
  }
)

// Customer details selectors
export const selectCustomerName = createSelector(
  [selectCurrentCustomer],
  (customer) => customer?.name
)

export const selectCustomerEmail = createSelector(
  [selectCurrentCustomer],
  (customer) => customer?.email
)

export const selectCustomerPhone = createSelector(
  [selectCurrentCustomer],
  (customer) => customer?.phone
)

export const selectCustomerLocation = createSelector(
  [selectCurrentCustomer],
  (customer) => customer?.location
)

export const selectCustomerStatus = createSelector(
  [selectCurrentCustomer],
  (customer) => customer?.status
)

export const selectCustomerSegment = createSelector(
  [selectCurrentCustomer],
  (customer) => customer?.segment
)

export const selectCustomerTotalValue = createSelector(
  [selectCurrentCustomer],
  (customer) => customer?.totalValue
)

export const selectCustomerCreatedAt = createSelector(
  [selectCurrentCustomer],
  (customer) => customer?.createdAt
)

export const selectCustomerUpdatedAt = createSelector(
  [selectCurrentCustomer],
  (customer) => customer?.updatedAt
)

// Loading states
export const selectCustomerLoading = createSelector(
  [selectCustomersLoading, selectCustomerStatsLoading],
  (customersLoading, statsLoading) => customersLoading || statsLoading
)

// Error states
export const selectCustomerError = createSelector(
  [selectCustomersError, selectCustomerStatsError],
  (customersError, statsError) => customersError || statsError
)

// Combined selectors
export const selectCustomerState = createSelector(
  [selectCustomers, selectCustomerStats],
  (customers, stats) => ({
    customers,
    stats
  })
)

export const selectCustomerOverview = createSelector(
  [selectTotalCustomers, selectActiveCustomers, selectInactiveCustomers, selectCustomersCountByStatus, selectCustomersCountBySegment, selectCustomersCountByLocation],
  (totalCustomers, activeCustomers, inactiveCustomers, countByStatus, countBySegment, countByLocation) => ({
    totalCustomers,
    activeCustomers: activeCustomers.length,
    inactiveCustomers: inactiveCustomers.length,
    countByStatus,
    countBySegment,
    countByLocation
  })
)
