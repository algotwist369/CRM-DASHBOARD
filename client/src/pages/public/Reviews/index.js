import React from 'react'
import ReviewsPage from './ReviewsPage'

const createVariantComponent = (variant) => {
  const VariantComponent = () => React.createElement(ReviewsPage, { variant })
  VariantComponent.displayName = `ReviewsPage(${variant})`
  return VariantComponent
}

export const GoogleMyBusinessReviews = createVariantComponent('google-my-business-reviews')
export const FacebookReviews = createVariantComponent('facebook-reviews')
export const YelpReviews = createVariantComponent('yelp-reviews')
export const TripAdvisorReviews = createVariantComponent('tripadvisor-reviews')
export const ReviewsManagement = createVariantComponent('reviews-management')

export default ReviewsPage


