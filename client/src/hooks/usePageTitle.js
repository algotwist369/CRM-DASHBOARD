import { useEffect, useMemo } from 'react'
import { useLocation } from 'react-router-dom'

// Constants
const APP_NAME = 'Booking App'
const DEFAULT_TITLE = APP_NAME

// Route to title mapping configuration
const ROUTE_TITLES = {
  // Exact path matches
  exact: {
    '/': `Home - ${APP_NAME}`,
    '/features': `Features - ${APP_NAME}`,
    '/pricing': `Pricing - ${APP_NAME}`,
    '/how-it-works': `How It Works - ${APP_NAME}`,
    '/for-businesses': `For Businesses - ${APP_NAME}`,
    '/advertise': `Advertise - ${APP_NAME}`,
    '/careers': `Careers - ${APP_NAME}`,
    '/notifications': `Notifications - ${APP_NAME}`,
    '/contact': `Contact - ${APP_NAME}`,
    '/free-listing': `Free Listing - ${APP_NAME}`,
    '/book-demo': `Book a Demo - ${APP_NAME}`,
    '/google-my-business-reviews': `Google My Business Reviews - ${APP_NAME}`,
    '/facebook-reviews': `Facebook Reviews - ${APP_NAME}`,
    '/yelp-reviews': `Yelp Reviews - ${APP_NAME}`,
    '/tripadvisor-reviews': `TripAdvisor Reviews - ${APP_NAME}`,
    '/reviews-management': `Reviews Management - ${APP_NAME}`,
    '/resources/yelp-playbook': `Yelp Playbook - ${APP_NAME}`,
    '/check-appointment': `Check Appointment Status - ${APP_NAME}`
  },
  // Path prefix matches
  prefix: {
    '/book/': {
      services: `Select Services - ${APP_NAME}`,
      staff: `Select Staff - ${APP_NAME}`,
      time: `Select Time - ${APP_NAME}`,
      customer: `Customer Information - ${APP_NAME}`,
      confirmation: `Booking Confirmation - ${APP_NAME}`,
      default: `Book Appointment - ${APP_NAME}`
    },
    '/appointment/': `Appointment Status - ${APP_NAME}`
  },
  // Regex pattern matches
  patterns: [
    {
      pattern: /^\/[^/]+$/, // Business info page (/:businessLink)
      title: `Business Information - ${APP_NAME}`
    }
  ]
}

/**
 * Determines the page title based on the current route path
 * @param {string} pathname - Current route pathname
 * @returns {string} The determined page title
 */
const getTitleFromPath = (pathname) => {
  // Check exact matches first
  if (ROUTE_TITLES.exact[pathname]) {
    return ROUTE_TITLES.exact[pathname]
  }

  // Check prefix matches
  for (const [prefix, config] of Object.entries(ROUTE_TITLES.prefix)) {
    if (pathname.startsWith(prefix)) {
      // If config is a string, return it directly
      if (typeof config === 'string') {
        return config
      }
      
      // If config is an object, check for specific step
      if (typeof config === 'object') {
        const pathParts = pathname.split('/').filter(Boolean)
        const step = pathParts[pathParts.length - 1]
        return config[step] || config.default || DEFAULT_TITLE
      }
    }
  }

  // Check pattern matches
  for (const { pattern, title } of ROUTE_TITLES.patterns) {
    if (pattern.test(pathname)) {
      return title
    }
  }

  // Default fallback
  return DEFAULT_TITLE
}

/**
 * Safely updates the document title
 * @param {string} title - The title to set
 */
const updateDocumentTitle = (title) => {
  try {
    if (typeof title === 'string' && title.trim()) {
      document.title = title.trim()
    } else {
      console.warn('Invalid title provided, using default:', title)
      document.title = DEFAULT_TITLE
    }
  } catch (error) {
    console.error('Error updating document title:', error)
    document.title = DEFAULT_TITLE
  }
}

/**
 * Custom hook to dynamically update page title based on current route
 * 
 * @param {string|null} customTitle - Optional custom title to override automatic title detection.
 *                                    If provided, this will be used instead of route-based title.
 *                                    Format: "Page Name - Booking App" or just "Page Name"
 * 
 * @example
 * // Automatic title based on route
 * usePageTitle()
 * 
 * // Custom title
 * usePageTitle('My Custom Page - Booking App')
 * 
 * // Custom title without app name (will be added automatically if not present)
 * usePageTitle('My Custom Page')
 * 
 * @returns {void}
 */
export const usePageTitle = (customTitle = null) => {
  const location = useLocation()

  // Memoize the title to avoid unnecessary recalculations
  const title = useMemo(() => {
    // If custom title is provided, use it (with app name if not present)
    if (customTitle) {
      const trimmedTitle = customTitle.trim()
      // If title already includes app name, use as is; otherwise append it
      return trimmedTitle.includes(APP_NAME) 
        ? trimmedTitle 
        : `${trimmedTitle} - ${APP_NAME}`
    }

    // Otherwise, determine title from route
    return getTitleFromPath(location.pathname)
  }, [location.pathname, customTitle])

  // Update document title when route or custom title changes
  useEffect(() => {
    updateDocumentTitle(title)
  }, [title])
}

export default usePageTitle

