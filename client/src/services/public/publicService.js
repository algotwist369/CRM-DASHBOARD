import { apiClient, API_ENDPOINTS, buildEndpoint } from '../api'
import { decryptPayload } from '../../utils/encryption'

class PublicService {
  // Get business info
  async getBusinessInfo(businessId) {
    try {
      const response = await apiClient.get(`${API_ENDPOINTS.PUBLIC.BUSINESS_INFO}/${businessId}`)
      return { success: true, data: response.data }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch business info'
      }
    }
  }

  // Get public services
  async getServices(businessId) {
    try {
      const response = await apiClient.get(`${API_ENDPOINTS.PUBLIC.SERVICES}?businessId=${businessId}`)
      return { success: true, data: response.data }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch services'
      }
    }
  }

  // Get public staff
  async getStaff(businessId) {
    try {
      const response = await apiClient.get(`${API_ENDPOINTS.PUBLIC.STAFF}?businessId=${businessId}`)
      return { success: true, data: response.data }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch staff'
      }
    }
  }

  // Get available slots
  async getAvailableSlots(params) {
    try {
      const endpoint = buildEndpoint(API_ENDPOINTS.PUBLIC.AVAILABLE_SLOTS, params)
      const response = await apiClient.get(endpoint)
      return { success: true, data: response.data }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch available slots'
      }
    }
  }

  // Get appointment status
  async getAppointmentStatus(confirmationNumber) {
    try {
      const response = await apiClient.get(`${API_ENDPOINTS.PUBLIC.APPOINTMENT_STATUS}?confirmationNumber=${confirmationNumber}`)
      return { success: true, data: response.data }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch appointment status'
      }
    }
  }

  // Get business hours
  async getBusinessHours(businessId) {
    try {
      const response = await apiClient.get(`/public/business-hours?businessId=${businessId}`)
      return { success: true, data: response.data }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch business hours'
      }
    }
  }

  // Get business reviews
  async getBusinessReviews(businessId, params = {}) {
    try {
      const endpoint = buildEndpoint(`/public/business-reviews?businessId=${businessId}`, params)
      const response = await apiClient.get(endpoint)
      return { success: true, data: response.data }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch business reviews'
      }
    }
  }

  // Get business gallery
  async getBusinessGallery(businessId) {
    try {
      const response = await apiClient.get(`/public/business-gallery?businessId=${businessId}`)
      return { success: true, data: response.data }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch business gallery'
      }
    }
  }

  // Get business location
  async getBusinessLocation(businessId) {
    try {
      const response = await apiClient.get(`/public/business-location?businessId=${businessId}`)
      return { success: true, data: response.data }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch business location'
      }
    }
  }

  // Get business contact info
  async getBusinessContactInfo(businessId) {
    try {
      const response = await apiClient.get(`/public/business-contact?businessId=${businessId}`)
      return { success: true, data: response.data }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch business contact info'
      }
    }
  }

  // Get business policies
  async getBusinessPolicies(businessId) {
    try {
      const response = await apiClient.get(`/public/business-policies?businessId=${businessId}`)
      return { success: true, data: response.data }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch business policies'
      }
    }
  }

  // Get business FAQ
  async getBusinessFAQ(businessId) {
    try {
      const response = await apiClient.get(`/public/business-faq?businessId=${businessId}`)
      return { success: true, data: response.data }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch business FAQ'
      }
    }
  }

  // Get business testimonials
  async getBusinessTestimonials(businessId) {
    try {
      const response = await apiClient.get(`/public/business-testimonials?businessId=${businessId}`)
      return { success: true, data: response.data }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch business testimonials'
      }
    }
  }

  // Get business promotions
  async getBusinessPromotions(businessId) {
    try {
      const response = await apiClient.get(`/public/business-promotions?businessId=${businessId}`)
      return { success: true, data: response.data }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch business promotions'
      }
    }
  }

  // Get business news
  async getBusinessNews(businessId) {
    try {
      const response = await apiClient.get(`/public/business-news?businessId=${businessId}`)
      return { success: true, data: response.data }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch business news'
      }
    }
  }

  // Get business events
  async getBusinessEvents(businessId) {
    try {
      const response = await apiClient.get(`/public/business-events?businessId=${businessId}`)
      return { success: true, data: response.data }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch business events'
      }
    }
  }

  // Get business social media
  async getBusinessSocialMedia(businessId) {
    try {
      const response = await apiClient.get(`/public/business-social-media?businessId=${businessId}`)
      return { success: true, data: response.data }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch business social media'
      }
    }
  }

  // Get business newsletter
  async getBusinessNewsletter(businessId) {
    try {
      const response = await apiClient.get(`/public/business-newsletter?businessId=${businessId}`)
      return { success: true, data: response.data }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch business newsletter'
      }
    }
  }

  // Subscribe to newsletter
  async subscribeToNewsletter(businessId, email) {
    try {
      const response = await apiClient.post('/public/newsletter-subscribe', {
        businessId,
        email
      })
      return { success: true, data: response.data }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to subscribe to newsletter'
      }
    }
  }

  // Unsubscribe from newsletter
  async unsubscribeFromNewsletter(businessId, email) {
    try {
      const response = await apiClient.post('/public/newsletter-unsubscribe', {
        businessId,
        email
      })
      return { success: true, data: response.data }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to unsubscribe from newsletter'
      }
    }
  }

  // Contact business
  async contactBusiness(businessId, contactData) {
    try {
      const response = await apiClient.post('/public/contact-business', {
        businessId,
        ...contactData
      })
      return { success: true, data: response.data }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to send contact message'
      }
    }
  }

  // Submit feedback
  async submitFeedback(businessId, feedbackData) {
    try {
      const response = await apiClient.post('/public/submit-feedback', {
        businessId,
        ...feedbackData
      })
      return { success: true, data: response.data }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to submit feedback'
      }
    }
  }

  // Submit review
  async submitReview(businessId, reviewData) {
    try {
      const response = await apiClient.post('/public/submit-review', {
        businessId,
        ...reviewData
      })
      return { success: true, data: response.data }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to submit review'
      }
    }
  }

  // Get business search results
  // Get business search results
  async searchBusinesses(searchParams) {
    try {
      const endpoint = buildEndpoint(API_ENDPOINTS.PUBLIC.SEARCH, searchParams)
      console.log('Searching:', endpoint);
      const response = await apiClient.get(endpoint)

      // Decrypt payload if present
      if (response.data?.payload) {
        console.log('Received payload length:', response.data.payload.length);
        const decryptedData = decryptPayload(response.data.payload);
        console.log('Decrypted data:', decryptedData);

        if (decryptedData) {
          return { success: true, data: { ...decryptedData, success: true } }
        } else {
          console.error('Decryption failed');
          return { success: false, error: 'Security verification failed' };
        }
      }

      return { success: true, data: response.data }
    } catch (error) {
      console.error('Search error:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to search businesses'
      }
    }
  }

  // Get featured businesses
  async getFeaturedBusinesses() {
    try {
      const response = await apiClient.get('/public/featured-businesses')
      return { success: true, data: response.data }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch featured businesses'
      }
    }
  }

  // Get popular businesses
  async getPopularBusinesses() {
    try {
      const response = await apiClient.get('/public/popular-businesses')
      return { success: true, data: response.data }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch popular businesses'
      }
    }
  }

  // Get nearby businesses
  async getNearbyBusinesses(latitude, longitude, radius = 10) {
    try {
      const response = await apiClient.get(`/public/nearby-businesses?latitude=${latitude}&longitude=${longitude}&radius=${radius}`)
      return { success: true, data: response.data }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch nearby businesses'
      }
    }
  }

  // Get business categories
  async getBusinessCategories() {
    try {
      const response = await apiClient.get('/public/business-categories')
      return { success: true, data: response.data }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch business categories'
      }
    }
  }

  // Get business by category
  async getBusinessesByCategory(categoryId) {
    try {
      const response = await apiClient.get(`/public/businesses-by-category?categoryId=${categoryId}`)
      return { success: true, data: response.data }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch businesses by category'
      }
    }
  }
}

export default new PublicService()
