import { createSelector } from '@reduxjs/toolkit'

// Base selectors
const getBusinessState = (state) => state.business

// Business selectors
export const selectBusinesses = createSelector(
  [getBusinessState],
  (business) => business.businesses
)

export const selectBusinessesList = createSelector(
  [selectBusinesses],
  (businesses) => businesses.list
)

export const selectCurrentBusiness = createSelector(
  [selectBusinesses],
  (businesses) => businesses.current
)

export const selectBusinessesLoading = createSelector(
  [selectBusinesses],
  (businesses) => businesses.isLoading
)

export const selectBusinessesError = createSelector(
  [selectBusinesses],
  (businesses) => businesses.error
)

export const selectBusinessesPagination = createSelector(
  [selectBusinesses],
  (businesses) => businesses.pagination
)

// Stats selectors
export const selectBusinessStats = createSelector(
  [getBusinessState],
  (business) => business.stats
)

export const selectBusinessStatsData = createSelector(
  [selectBusinessStats],
  (stats) => stats.data
)

export const selectBusinessStatsLoading = createSelector(
  [selectBusinessStats],
  (stats) => stats.isLoading
)

export const selectBusinessStatsError = createSelector(
  [selectBusinessStats],
  (stats) => stats.error
)

// Business filtering selectors
export const selectBusinessById = createSelector(
  [selectBusinessesList],
  (businesses) => (id) => businesses.find(business => business.id === id)
)

export const selectBusinessesByStatus = createSelector(
  [selectBusinessesList],
  (businesses) => (status) => businesses.filter(business => business.status === status)
)

export const selectActiveBusinesses = createSelector(
  [selectBusinessesList],
  (businesses) => businesses.filter(business => business.status === 'active')
)

export const selectInactiveBusinesses = createSelector(
  [selectBusinessesList],
  (businesses) => businesses.filter(business => business.status === 'inactive')
)

export const selectBusinessesByCategory = createSelector(
  [selectBusinessesList],
  (businesses) => (category) => businesses.filter(business => business.category === category)
)

export const selectBusinessesByLocation = createSelector(
  [selectBusinessesList],
  (businesses) => (location) => businesses.filter(business => business.location === location)
)

export const selectBusinessesByOwner = createSelector(
  [selectBusinessesList],
  (businesses) => (ownerId) => businesses.filter(business => business.ownerId === ownerId)
)

// Search selectors
export const selectBusinessesBySearch = createSelector(
  [selectBusinessesList],
  (businesses) => (searchTerm) => {
    if (!searchTerm) return businesses
    const term = searchTerm.toLowerCase()
    return businesses.filter(business => 
      business.name?.toLowerCase().includes(term) ||
      business.description?.toLowerCase().includes(term) ||
      business.category?.toLowerCase().includes(term) ||
      business.location?.toLowerCase().includes(term)
    )
  }
)

// Statistics selectors
export const selectTotalBusinesses = createSelector(
  [selectBusinessesList],
  (businesses) => businesses.length
)

export const selectBusinessesCountByStatus = createSelector(
  [selectBusinessesList],
  (businesses) => {
    return businesses.reduce((acc, business) => {
      acc[business.status] = (acc[business.status] || 0) + 1
      return acc
    }, {})
  }
)

export const selectBusinessesCountByCategory = createSelector(
  [selectBusinessesList],
  (businesses) => {
    return businesses.reduce((acc, business) => {
      acc[business.category] = (acc[business.category] || 0) + 1
      return acc
    }, {})
  }
)

// Recent businesses
export const selectRecentBusinesses = createSelector(
  [selectBusinessesList],
  (businesses) => (limit = 5) => {
    return businesses
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, limit)
  }
)

// Top performing businesses
export const selectTopPerformingBusinesses = createSelector(
  [selectBusinessesList],
  (businesses) => (limit = 5) => {
    return businesses
      .sort((a, b) => (b.rating || 0) - (a.rating || 0))
      .slice(0, limit)
  }
)

// Business details selectors
export const selectBusinessName = createSelector(
  [selectCurrentBusiness],
  (business) => business?.name
)

export const selectBusinessDescription = createSelector(
  [selectCurrentBusiness],
  (business) => business?.description
)

export const selectBusinessCategory = createSelector(
  [selectCurrentBusiness],
  (business) => business?.category
)

export const selectBusinessLocation = createSelector(
  [selectCurrentBusiness],
  (business) => business?.location
)

export const selectBusinessStatus = createSelector(
  [selectCurrentBusiness],
  (business) => business?.status
)

export const selectBusinessRating = createSelector(
  [selectCurrentBusiness],
  (business) => business?.rating
)

export const selectBusinessCreatedAt = createSelector(
  [selectCurrentBusiness],
  (business) => business?.createdAt
)

export const selectBusinessUpdatedAt = createSelector(
  [selectCurrentBusiness],
  (business) => business?.updatedAt
)

// Loading states
export const selectBusinessLoading = createSelector(
  [selectBusinessesLoading, selectBusinessStatsLoading],
  (businessesLoading, statsLoading) => businessesLoading || statsLoading
)

// Error states
export const selectBusinessError = createSelector(
  [selectBusinessesError, selectBusinessStatsError],
  (businessesError, statsError) => businessesError || statsError
)

// Combined selectors
export const selectBusinessState = createSelector(
  [selectBusinesses, selectBusinessStats],
  (businesses, stats) => ({
    businesses,
    stats
  })
)

export const selectBusinessOverview = createSelector(
  [selectTotalBusinesses, selectActiveBusinesses, selectInactiveBusinesses, selectBusinessesCountByStatus, selectBusinessesCountByCategory],
  (totalBusinesses, activeBusinesses, inactiveBusinesses, countByStatus, countByCategory) => ({
    totalBusinesses,
    activeBusinesses: activeBusinesses.length,
    inactiveBusinesses: inactiveBusinesses.length,
    countByStatus,
    countByCategory
  })
)
