import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import {
  FaSearch,
  FaSpinner,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaClock,
  FaUsers,
  FaStar,
  FaCheckCircle,
  FaWhatsapp,
  FaLocationArrow,
  FaSync,
  FaChevronLeft,
  FaChevronRight
} from 'react-icons/fa'
import { IoMdCall } from 'react-icons/io'
import apiClient from '../../../services/api/client'
import { FaLocationCrosshairs } from "react-icons/fa6"
import { useDebounce } from '../../../hooks/common/useDebounce'

// Constants
const CACHE_KEYS = {
  LOCATION: 'business_location_cache',
  NEARBY_BUSINESSES: 'nearby_businesses_cache',
  ALL_BUSINESSES: 'all_businesses_cache',
  LOCATION_PROMPT_SHOWN: 'location_prompt_shown'
}

const CACHE_DURATION = {
  LOCATION: 24 * 60 * 60 * 1000, // 24 hours
  BUSINESSES: 5 * 60 * 1000 // 5 minutes
}

const PLACEHOLDERS = [
  'Search by business name...',
  'Search by location...',
  'Search by area...',
  'Search by city...',
  'Search by state...',
  'Search by service type...',
  'Search by business link...'
]

const BUSINESS_TYPES = [
  { value: 'salon', label: 'Salon' },
  { value: 'spa', label: 'Spa' },
  { value: 'hotel', label: 'Hotel' },
  { value: 'restaurant', label: 'Restaurant' },
  { value: 'retail', label: 'Retail' },
  { value: 'gym', label: 'Gym' },
  { value: 'clinic', label: 'Clinic' },
  { value: 'cafe', label: 'Cafe' },
  { value: 'studio', label: 'Studio' },
  { value: 'education', label: 'Education' },
  { value: 'automotive', label: 'Automotive' },
  { value: 'others', label: 'Others' }
]

const DISTANCE_OPTIONS = [
  { value: 2000, label: '2 km' },
  { value: 5000, label: '5 km' },
  { value: 10000, label: '10 km' },
  { value: 20000, label: '20 km' },
  { value: 50000, label: '50 km' }
]

const FEATURES_DATA = [
  {
    icon: FaCalendarAlt,
    title: 'Easy Booking',
    description: 'Book appointments in just a few clicks with our simple and intuitive interface'
  },
  {
    icon: FaClock,
    title: 'Real-Time Availability',
    description: 'See available time slots in real-time and book instantly'
  },
  {
    icon: FaUsers,
    title: 'Verified Businesses',
    description: 'Connect with trusted and verified businesses in your area'
  }
]

const getCachedData = (key) => {
  try {
    const cached = localStorage.getItem(key)
    if (!cached) return null

    const { data, timestamp } = JSON.parse(cached)
    const now = Date.now()

    // Check if cache is still valid
    if (now - timestamp < CACHE_DURATION[key.includes('location') ? 'LOCATION' : 'BUSINESSES']) {
      return data
    }

    // Cache expired, remove it
    localStorage.removeItem(key)
    return null
  } catch (error) {
    console.error('Error reading cache:', error)
    return null
  }
}

const setCachedData = (key, data) => {
  try {
    const cacheData = {
      data,
      timestamp: Date.now()
    }
    localStorage.setItem(key, JSON.stringify(cacheData))
  } catch (error) {
    console.error('Error setting cache:', error)
  }
}

const Home = () => {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const debouncedSearchTerm = useDebounce(searchTerm, 500)
  const [businesses, setBusinesses] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterType, setFilterType] = useState('')
  const [viewMode, setViewMode] = useState('all') // 'all' or 'nearby'
  const [userLocation, setUserLocation] = useState(null)
  const [locationLoading, setLocationLoading] = useState(false)
  const [locationError, setLocationError] = useState(null)
  const [maxDistance, setMaxDistance] = useState(5000) // Default 5km
  const [nearbyLoading, setNearbyLoading] = useState(false)
  const [cardImageIndexes, setCardImageIndexes] = useState({})
  const [animatedPlaceholder, setAnimatedPlaceholder] = useState('')
  const [showLocationPrompt, setShowLocationPrompt] = useState(false)
  
  // Refs to prevent duplicate API calls
  const locationRequestRef = useRef(false)
  const abortControllerRef = useRef(null)
  const fetchingRef = useRef(false)
  const lastFetchParamsRef = useRef('')

  // Check if location prompt should be shown on first visit
  useEffect(() => {
    const checkLocationPermission = async () => {
      // Check if prompt was already shown
      const promptShown = localStorage.getItem(CACHE_KEYS.LOCATION_PROMPT_SHOWN)
      
      // Check if user already has location cached (means they've granted permission before)
      const hasCachedLocation = getCachedData(CACHE_KEYS.LOCATION)
      
      // If prompt was shown or location is cached, don't show again
      if (promptShown || hasCachedLocation) {
        return
      }
      
      // Check if browser supports geolocation
      if (!navigator.geolocation) {
        return
      }
      
      // Check if permission was already granted (using Permissions API if available)
      try {
        if ('permissions' in navigator) {
          const permission = await navigator.permissions.query({ name: 'geolocation' })
          if (permission.state === 'granted') {
            // Permission already granted, get location silently
            return
          }
        }
      } catch (err) {
        // Permissions API not supported or failed, continue with prompt
        console.log('Permissions API not available:', err)
      }
      
      // Small delay to let page load first
      const timer = setTimeout(() => {
        setShowLocationPrompt(true)
      }, 1000)
      
      return () => clearTimeout(timer)
    }
    
    checkLocationPermission()
  }, [])

  // Animated placeholder
  useEffect(() => {
    if (searchTerm) {
      setAnimatedPlaceholder('')
      return
    }

    let currentIndex = 0
    let charIndex = 0
    let isDeleting = false
    let timeoutId = null

    const typePlaceholder = () => {
      const currentPlaceholder = PLACEHOLDERS[currentIndex]
      let typingSpeed = 100

      if (isDeleting) {
        setAnimatedPlaceholder(currentPlaceholder.substring(0, charIndex - 1))
        charIndex--
        typingSpeed = 50
        if (charIndex === 0) {
          isDeleting = false
          currentIndex = (currentIndex + 1) % PLACEHOLDERS.length
          typingSpeed = 500
        }
      } else {
        setAnimatedPlaceholder(currentPlaceholder.substring(0, charIndex + 1))
        charIndex++
        typingSpeed = 100
        if (charIndex === currentPlaceholder.length) {
          typingSpeed = 2000
          isDeleting = true
        }
      }

      timeoutId = setTimeout(typePlaceholder, typingSpeed)
    }

    timeoutId = setTimeout(typePlaceholder, 1000)
    return () => timeoutId && clearTimeout(timeoutId)
  }, [searchTerm])

  // Get user location with retry mechanism and IP fallback
  const getUserLocation = useCallback((options = { enableHighAccuracy: true, timeout: 15000, maximumAge: 300000 }, isRetry = false) => {
    // Prevent duplicate requests
    if (locationRequestRef.current && !isRetry) {
      console.log('Location request already in progress, skipping...')
      return Promise.reject(new Error('Location request already in progress'))
    }

    if (!isRetry) {
      locationRequestRef.current = true
    }

    return new Promise((resolve, reject) => {
      const finish = (result, isSuccess) => {
        locationRequestRef.current = false
        if (isSuccess) resolve(result)
        else reject(result)
      }
      // Check cache first (only on initial attempt)
      if (!isRetry) {
        const cachedLocation = getCachedData(CACHE_KEYS.LOCATION)
        if (cachedLocation) {
          finish(cachedLocation, true)
          return
        }
      }

      // IP Location Fallback
      const getIpLocation = async () => {
        try {
          console.log('Fetching IP-based location...')
          const response = await fetch('https://ipapi.co/json/')
          const data = await response.json()

          if (data.latitude && data.longitude) {
            const location = {
              lat: data.latitude,
              lng: data.longitude,
              accuracy: 5000, // IP location is less accurate
              source: 'IP'
            }
            setCachedData(CACHE_KEYS.LOCATION, location)
            setLocationLoading(false)
            return location
          }
          return null
        } catch (err) {
          console.error('IP location failed:', err)
          return false
        }
      }

      if (!navigator.geolocation) {
        // Try IP location if geolocation is not supported
        getIpLocation().then(location => {
          if (location) finish(location, true)
          else finish(new Error('Geolocation is not supported and IP location failed'), false)
        })
        return
      }

      setLocationLoading(true)
      setLocationError(null)

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy
          }
          setCachedData(CACHE_KEYS.LOCATION, location)
          setLocationLoading(false)
          finish(location, true)
        },
        async (error) => {
          // If high accuracy failed and we haven't retried yet, try again with low accuracy
          if (options.enableHighAccuracy && !isRetry && (error.code === error.TIMEOUT || error.code === error.POSITION_UNAVAILABLE)) {
            console.log('High accuracy location failed, retrying with low accuracy and cached positions...')
            getUserLocation({ ...options, enableHighAccuracy: false, timeout: 30000, maximumAge: Infinity }, true)
              .then(res => finish(res, true))
              .catch(err => finish(err, false))
            return
          }

          // Final fallback: IP Location
          console.log('Native geolocation failed, attempting IP fallback...')
          const ipLocation = await getIpLocation()
          if (ipLocation) {
            finish(ipLocation, true)
            return
          }

          setLocationLoading(false)
          let errorMessage = 'Unable to get your location'
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Location permission denied. Please allow location access in your browser settings.'
              break
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Location information unavailable. Please check your device location settings.'
              break
            case error.TIMEOUT:
              errorMessage = 'Location request timed out. Please check your network connection.'
              break
            default:
              errorMessage = error.message || 'An unknown error occurred while getting location.'
          }
          setLocationError(errorMessage)
          finish(new Error(errorMessage), false)
        },
        options
      )
    })
  }, [])

  // Fetch all businesses
  const fetchBusinesses = useCallback(async () => {
    try {
      // Check cache first (cache key doesn't include searchTerm since filtering is client-side)
      const cacheKey = `${CACHE_KEYS.ALL_BUSINESSES}_${filterType}`
      const cached = getCachedData(cacheKey)
      if (cached) {
        setBusinesses(cached)
        setLoading(false)
        setNearbyLoading(false)
        fetchingRef.current = false
        return
      }

      // Cancel previous request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }

      // Create new abort controller
      abortControllerRef.current = new AbortController()
      fetchingRef.current = true
      setLoading(true)
      setNearbyLoading(false)

      const params = {
        page: 1,
        limit: 20,
        ...(filterType && { type: filterType })
      }

      // Create params key for duplicate prevention
      const paramsKey = JSON.stringify(params)
      if (paramsKey === lastFetchParamsRef.current) {
        fetchingRef.current = false
        setLoading(false)
        return
      }
      lastFetchParamsRef.current = paramsKey

      const response = await apiClient.get('/business/public/list', { 
        params,
        signal: abortControllerRef.current.signal
      })

      if (response.data.success) {
        const businessList = response.data.data || []
        setBusinesses(businessList)
        setCachedData(cacheKey, businessList)
      } else {
        setBusinesses([])
      }
    } catch (error) {
      // Ignore abort errors
      if (error.name === 'AbortError') {
        return
      }
      console.error('Failed to fetch businesses:', error)
      setBusinesses([])
    } finally {
      setLoading(false)
      fetchingRef.current = false
    }
  }, [filterType])

  // Fetch nearby businesses
  const fetchNearbyBusinesses = useCallback(async (location, distance = maxDistance) => {
    if (!location || !location.lat || !location.lng) {
      return
    }

    try {
      // Check cache first
      const cacheKey = `${CACHE_KEYS.NEARBY_BUSINESSES}_${location.lat}_${location.lng}_${distance}_${filterType}`
      const cached = getCachedData(cacheKey)
      if (cached) {
        setBusinesses(cached)
        setLoading(false)
        setNearbyLoading(false)
        fetchingRef.current = false
        return
      }

      // Cancel previous request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }

      // Create new abort controller
      abortControllerRef.current = new AbortController()
      fetchingRef.current = true
      setLoading(false)
      setNearbyLoading(true)

      const params = {
        lat: location.lat,
        lng: location.lng,
        maxDistance: distance,
        page: 1,
        limit: 20,
        ...(filterType && { type: filterType })
      }

      // Create params key for duplicate prevention
      const paramsKey = JSON.stringify(params)
      if (paramsKey === lastFetchParamsRef.current) {
        fetchingRef.current = false
        setNearbyLoading(false)
        return
      }
      lastFetchParamsRef.current = paramsKey

      const response = await apiClient.get('/business/public/nearby', { 
        params,
        signal: abortControllerRef.current.signal
      })

      if (response.data.success) {
        const businessList = response.data.data || []
        // Results are already sorted by distance from backend, but ensure consistency
        businessList.sort((a, b) => (a.distance || 0) - (b.distance || 0))
        setBusinesses(businessList)
        setCachedData(cacheKey, businessList)

        // Show info if no results found
        if (businessList.length === 0) {
          toast(`No businesses found within ${distance / 1000}km. Try increasing the search radius.`, {
            icon: 'ℹ️',
            duration: 4000
          })
        }
      } else {
        setBusinesses([])
        const errorMessage = response.data.message || 'Failed to fetch nearby businesses'
        const errorCode = response.data.code || 'UNKNOWN_ERROR'

        // Handle specific error codes
        if (errorCode === 'MISSING_COORDINATES' || errorCode === 'INVALID_COORDINATES') {
          toast.error('Invalid location. Please allow location access and try again.')
        } else if (errorCode === 'GEOSPATIAL_ERROR' || errorCode === 'GEOSPATIAL_SERVICE_UNAVAILABLE') {
          toast.error('Location search is temporarily unavailable. Showing all businesses instead.')
          setViewMode('all')
        } else {
          toast.error(errorMessage)
        }
      }
    } catch (error) {
      // Ignore abort errors
      if (error.name === 'AbortError') {
        return
      }
      
      console.error('Failed to fetch nearby businesses:', error)
      setBusinesses([])

      // Handle specific error responses
      if (error.response?.data) {
        const errorData = error.response.data
        const errorCode = errorData.code || 'UNKNOWN_ERROR'

        if (errorCode === 'GEOSPATIAL_ERROR' || errorCode === 'GEOSPATIAL_SERVICE_UNAVAILABLE') {
          toast.error('Location search is temporarily unavailable. Showing all businesses instead.')
          setViewMode('all')
        } else {
          toast.error(errorData.message || 'Failed to fetch nearby businesses')
        }
      } else {
        toast.error('Network error. Please check your connection and try again.')
      }
    } finally {
      setNearbyLoading(false)
      fetchingRef.current = false
    }
  }, [maxDistance, filterType])

  // Filter businesses by search term (client-side filtering)
  const filteredBusinesses = useMemo(() => {
    if (!debouncedSearchTerm.trim()) return businesses

    const searchLower = debouncedSearchTerm.toLowerCase().trim()
    const searchFields = ['name', 'branch', 'city', 'address', 'category']
    
    return businesses.filter(business => {
      // Check string fields
      const stringMatch = searchFields.some(field => 
        business[field]?.toLowerCase().includes(searchLower)
      )
      
      // Check tags array
      const tagsMatch = business.tags?.some(tag => 
        tag.toLowerCase().includes(searchLower)
      )

      return stringMatch || tagsMatch
    })
  }, [businesses, debouncedSearchTerm])

  // Initialize location when switching to nearby mode
  useEffect(() => {
    const initializeLocation = async () => {
      if (viewMode === 'nearby' && !userLocation && !locationLoading) {
        try {
          setLocationLoading(true)
          const location = await getUserLocation()
          setUserLocation(location)
        } catch (err) {
          console.error('Location error:', err)
          setLocationError(err.message || 'Unable to get location')
          // If location fails, fall back to all businesses
          setViewMode('all')
          toast.error('Unable to get location. Showing all businesses instead.')
        } finally {
          setLocationLoading(false)
        }
      }
    }

    initializeLocation()
  }, [viewMode, userLocation, locationLoading, getUserLocation])

  // Main effect to fetch businesses based on view mode and filters
  useEffect(() => {
    // Cleanup function to cancel pending requests
    const abortController = abortControllerRef.current
    
    return () => {
      if (abortController) {
        abortController.abort()
      }
    }
  }, [])

  // Main effect to fetch businesses based on view mode and filters
  useEffect(() => {
    // Skip if still loading location for nearby mode
    if (viewMode === 'nearby' && locationLoading) {
      return
    }

    // Cancel previous request and reset fetching state when switching modes
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    fetchingRef.current = false
    lastFetchParamsRef.current = ''

    if (viewMode === 'all') {
      fetchBusinesses()
    } else if (viewMode === 'nearby' && userLocation) {
      fetchNearbyBusinesses(userLocation, maxDistance)
    }
  }, [viewMode, filterType, userLocation, maxDistance, locationLoading, fetchBusinesses, fetchNearbyBusinesses])

  // Handle view mode change
  const handleViewModeChange = useCallback(async (mode) => {
    setViewMode(mode)
    // The useEffect will handle fetching based on viewMode change
  }, [])

  // Handle location prompt - Allow
  const handleAllowLocation = useCallback(async () => {
    setShowLocationPrompt(false)
    localStorage.setItem(CACHE_KEYS.LOCATION_PROMPT_SHOWN, 'true')
    
    try {
      setLocationLoading(true)
      const location = await getUserLocation()
      setUserLocation(location)
      toast.success('Location enabled! You can now see nearby businesses.')
      
      // Optionally switch to nearby mode
      setViewMode('nearby')
    } catch (err) {
      console.error('Location error:', err)
      setLocationError(err.message || 'Unable to get location')
      toast.error('Unable to get location. You can still browse all businesses.')
    } finally {
      setLocationLoading(false)
    }
  }, [getUserLocation])

  // Handle location prompt - Deny/Later
  const handleDenyLocation = useCallback(() => {
    setShowLocationPrompt(false)
    localStorage.setItem(CACHE_KEYS.LOCATION_PROMPT_SHOWN, 'true')
    // User can still use the app, just won't see nearby businesses by default
  }, [])

  // Handle refresh location
  const handleRefreshLocation = useCallback(async () => {
    try {
      // Clear location cache
      localStorage.removeItem(CACHE_KEYS.LOCATION)
      // Clear nearby businesses cache to force refresh
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith(CACHE_KEYS.NEARBY_BUSINESSES)) {
          localStorage.removeItem(key)
        }
      })
      
      setLocationLoading(true)
      setLocationError(null)
      const location = await getUserLocation()
      setUserLocation(location)
      
      if (viewMode === 'nearby' && location) {
        await fetchNearbyBusinesses(location, maxDistance)
      }
      toast.success('Location updated')
    } catch (err) {
      console.error('Location refresh error:', err)
      toast.error('Failed to refresh location')
      setLocationError(err.message || 'Failed to refresh location')
    } finally {
      setLocationLoading(false)
    }
  }, [viewMode, getUserLocation, fetchNearbyBusinesses, maxDistance])

  const handleDirectBooking = (e) => {
    e.preventDefault()
    const link = searchTerm.trim()
    if (link) {
      navigate(`/${link}`)
    } else {
      toast.error('Please enter a business link')
    }
  }

  const handleBookAppointment = useCallback((businessLink) => {
    if (businessLink) {
      navigate(`/book/${businessLink}/services`)
    } else {
      toast.error('Business link not available')
    }
  }, [navigate])

  const collectBusinessImages = useCallback((business) => {
    if (!business?.images) return []
    
    const imageFields = ['banner', 'thumbnail', 'logo']
    const images = imageFields
      .map(field => business.images[field])
      .filter(Boolean)
    
    const galleryImages = Array.isArray(business.images.gallery)
      ? business.images.gallery.filter(Boolean)
      : []
    
    return [...images, ...galleryImages]
  }, [])

  const handleCardImageChange = useCallback((businessKey, directionOrIndex, total) => {
    if (total <= 1) return
    setCardImageIndexes((prev) => {
      const current = prev[businessKey] ?? 0
      let nextIndex
      
      // If directionOrIndex is a number, use it directly; otherwise treat as direction
      if (typeof directionOrIndex === 'number') {
        nextIndex = directionOrIndex
      } else {
        nextIndex =
          directionOrIndex === 'prev'
            ? (current - 1 + total) % total
            : (current + 1) % total
      }
      
      // Ensure index is within bounds
      nextIndex = Math.max(0, Math.min(nextIndex, total - 1))
      
      return {
        ...prev,
        [businessKey]: nextIndex
      }
    })
  }, [])

  // Memoize formatLocation function
  const formatLocation = useCallback((business) => {
    if (business.address) {
      const addressParts = business.address.split(',').map(part => part.trim()).filter(part => part.length > 0)
      if (addressParts.length >= 2) {
        const area = addressParts.length > 2 ? addressParts[addressParts.length - 2] : addressParts[0]
        const city = addressParts[addressParts.length - 1]
        return `${area}, ${city}`
      }
      if (business.city) {
        return `${business.address}, ${business.city}`
      }
      return business.address
    }
    if (business.area && business.city) {
      return `${business.area}, ${business.city}`
    }
    if (business.city && business.state) {
      return `${business.city}, ${business.state}`
    }
    if (business.city) {
      return business.city
    }
    return ''
  }, [])

  // Generate action buttons for mobile layout
  const getMobileActionButtons = useCallback((business, whatsappUrl) => {
    const buttons = [
      {
        type: 'button',
        onClick: (e) => {
          e.stopPropagation()
          handleBookAppointment(business.businessLink)
        },
        className: 'flex-1 min-w-0 flex items-center justify-center gap-1 px-2 py-2 bg-primary-600 text-white font-semibold border text-xs transition-colors duration-200 hover:bg-primary-700',
        icon: FaCalendarAlt,
        label: 'Book',
        iconSize: 'text-xs'
      }
    ]

    if (business.phone) {
      buttons.push({
        type: 'link',
        href: `tel:${business.phone}`,
        className: 'flex-1 min-w-0 flex items-center justify-center gap-0.5 px-1.5 py-2 bg-blue-50 text-blue-700 border border-blue-200 font-medium text-[10px] transition-colors duration-200 hover:bg-blue-100 hover:border-blue-300',
        icon: IoMdCall,
        label: 'Call',
        iconSize: 'text-[10px]',
        title: 'Call'
      })
    }

    if (whatsappUrl) {
      buttons.push({
        type: 'link',
        href: whatsappUrl,
        target: '_blank',
        rel: 'noopener noreferrer',
        className: 'flex-1 min-w-0 flex items-center justify-center gap-0.5 px-1.5 py-2 bg-green-50 text-green-700 border border-green-200 font-medium text-[10px] transition-colors duration-200 hover:bg-green-100 hover:border-green-300',
        icon: FaWhatsapp,
        label: 'WA',
        iconSize: 'text-[10px]'
      })
    }

    return buttons
  }, [handleBookAppointment])

  // Generate action buttons for desktop layout
  const getDesktopActionButtons = useCallback((business, whatsappUrl) => {
    const buttons = []

    if (business.phone) {
      buttons.push({
        type: 'link',
        href: `tel:${business.phone}`,
        className: 'flex items-center justify-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-700 border border-blue-200 font-medium text-xs transition-colors duration-200 hover:bg-blue-100 hover:border-blue-300',
        icon: IoMdCall,
        label: 'Call',
        iconSize: 'text-xs'
      })
    }

    if (whatsappUrl) {
      buttons.push({
        type: 'link',
        href: whatsappUrl,
        target: '_blank',
        rel: 'noopener noreferrer',
        className: 'flex items-center justify-center gap-1 px-3 py-1.5 bg-green-50 text-green-700 border border-green-200 font-medium text-xs transition-colors duration-200 hover:bg-green-100 hover:border-green-300',
        icon: FaWhatsapp,
        label: 'WhatsApp',
        iconSize: 'text-xs'
      })
    }

    return buttons
  }, [])

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Hero Section */}
      <div className="h-[600px] bg-[url('/hero.png')] bg-cover bg-center bg-no-repeat text-white">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-10 sm:py-16 lg:py-24">
          <div className="text-center">
            <h1 className="text-2xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold mb-3 sm:mb-4 px-2">
              Book Your Appointment
            </h1>

            <p className="text-base sm:text-xl lg:text-2xl text-primary-100 mb-6 sm:mb-8 max-w-2xl mx-auto px-2">
              Find and book appointments with your favorite businesses instantly
            </p>

            {/* Direct Booking Input */}
            <form onSubmit={handleDirectBooking} className="max-w-2xl mx-auto px-2">
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <div className="flex-1 relative">
                  <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-base" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder={searchTerm ? '' : animatedPlaceholder || PLACEHOLDERS[0]}
                    className="w-full pl-12 pr-4 py-3.5 border text-gray-900 bg-white border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-base placeholder:text-gray-400"
                  />
                </div>

                <button
                  type="submit"
                  className="px-4 py-3 bg-primary-600"
                >
                  <FaLocationCrosshairs className="text-2xl" />
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Businesses Section */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-8 sm:py-12">
        <div className="mb-6 sm:mb-8">
          {/* View Mode Toggle */}
          <div className="flex flex-col gap-4 mb-4 sm:mb-6">
            <div className="flex-1">
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">
                {viewMode === 'nearby' ? 'Nearby Businesses' : 'All Businesses'}
              </h2>
              <p className="text-sm sm:text-base text-gray-600">
                {viewMode === 'nearby'
                  ? userLocation
                    ? `Businesses within ${(maxDistance / 1000).toFixed(0)}km of your location`
                    : 'Enable location to see nearby businesses'
                  : 'Browse and book appointments with available businesses'}
              </p>
            </div>

            {/* View Mode Buttons */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <div className="flex items-center gap-1 sm:gap-2 bg-gray-100 border p-0.5 sm:p-1">
                <button
                  onClick={() => handleViewModeChange('all')}
                  className={`px-3 sm:px-4 py-1.5 sm:py-2 border text-xs sm:text-sm font-medium transition-colors ${viewMode === 'all'
                    ? 'bg-white text-primary-600 border'
                    : 'text-gray-600 hover:text-gray-900'
                    }`}
                >
                  All
                </button>
                <button
                  onClick={() => handleViewModeChange('nearby')}
                  disabled={locationLoading}
                  className={`px-3 sm:px-4 py-1.5 sm:py-2 border text-xs sm:text-sm font-medium transition-colors flex items-center gap-1 sm:gap-2 ${viewMode === 'nearby'
                    ? 'bg-white text-primary-600 border'
                    : 'text-gray-600 hover:text-gray-900'
                    } ${locationLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <FaMapMarkerAlt className="text-xs sm:text-sm" />
                  <span className="hidden sm:inline">Nearby</span>
                  <span className="sm:hidden">Near</span>
                  {locationLoading && <FaSpinner className="animate-spin text-xs" />}
                </button>
              </div>

              {/* Distance Selector (for nearby mode) */}
              {viewMode === 'nearby' && userLocation && (
                <select
                  value={maxDistance}
                  onChange={(e) => {
                    setMaxDistance(Number(e.target.value))
                    // The useEffect will handle fetching when maxDistance changes
                  }}
                  className="px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white text-xs sm:text-sm"
                >
                  {DISTANCE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              )}

              {/* Refresh Location Button */}
              {viewMode === 'nearby' && userLocation && (
                <button
                  onClick={handleRefreshLocation}
                  className="p-1.5 sm:p-2 border border-gray-300 hover:bg-gray-50 transition-colors"
                  title="Refresh location"
                >
                  <FaSync className="text-gray-600 text-sm sm:text-base" />
                </button>
              )}
            </div>
          </div>

          {/* Filter and Search */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
            <div className="flex-1 w-full sm:w-auto">
              {locationError && viewMode === 'nearby' && (
                <div className="mb-3 p-2 sm:p-3 bg-yellow-50   border-yellow-200 border text-xs sm:text-sm text-yellow-800">
                  <FaMapMarkerAlt className="inline mr-2" />
                  {locationError}
                </div>
              )}
            </div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full sm:w-auto px-3 sm:px-4 py-2   border-gray-300 border focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white text-sm"
            >
              <option value="">All Types</option>
              {BUSINESS_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {(loading || nearbyLoading) ? (
          <div className="flex items-center justify-center py-8 sm:py-12">
            <div className="text-center">
              <FaSpinner className="animate-spin text-primary-600 text-3xl sm:text-4xl mx-auto mb-3 sm:mb-4" />
              <p className="text-gray-600 text-sm sm:text-base">
                {viewMode === 'nearby' && locationLoading
                  ? 'Getting your location...'
                  : 'Loading businesses...'}
              </p>
            </div>
          </div>
        ) : filteredBusinesses.length === 0 ? (
          <div className="text-center py-8 sm:py-12 bg-white   border border-gray-200 px-4">
            <FaSearch className="mx-auto text-gray-400 text-3xl sm:text-4xl mb-3 sm:mb-4" />
            <p className="text-gray-600 text-base sm:text-lg mb-2">No businesses found</p>
            <p className="text-gray-500 text-xs sm:text-sm">
              {searchTerm
                ? `No businesses match "${searchTerm}". Try a different search term or clear filters.`
                : viewMode === 'nearby'
                  ? `No businesses found within ${(maxDistance / 1000).toFixed(0)}km. Try increasing the distance or switch to "All Businesses".`
                  : 'No businesses are currently available for online booking'}
            </p>
            {(searchTerm || (viewMode === 'nearby' && businesses.length === 0)) && (
              <div className="mt-4 flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3">
                {searchTerm && (
                  <button
                    onClick={() => {
                      setSearchTerm('')
                      setFilterType('')
                    }}
                    className="w-full sm:w-auto px-4 py-2 text-primary-600 hover:text-primary-700 border-primary-200 border hover:bg-primary-50 text-sm sm:text-base"
                  >
                    Clear Search
                  </button>
                )}
                {viewMode === 'nearby' && businesses.length === 0 && (
                  <button
                    onClick={() => handleViewModeChange('all')}
                    className="w-full sm:w-auto px-4 py-2 bg-primary-600 text-white border hover:bg-primary-700 text-sm sm:text-base"
                  >
                    View All Businesses
                  </button>
                )}
              </div>
            )}
          </div>
        ) : (
          <>
            {/* Results Count */}
            {searchTerm && (
              <div className="mb-3 sm:mb-4 text-xs sm:text-sm text-gray-600 px-1">
                Found {filteredBusinesses.length} {filteredBusinesses.length === 1 ? 'business' : 'businesses'}
                {businesses.length !== filteredBusinesses.length && ` (filtered from ${businesses.length} total)`}
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4 lg:gap-6">
              {filteredBusinesses.map((business) => {
                // Format phone number for WhatsApp
                const whatsappNumber = business.phone?.replace(/[^0-9]/g, '') || business.socialMedia?.whatsapp?.replace(/[^0-9]/g, '') || ''
                const whatsappUrl = whatsappNumber ? `https://wa.me/${whatsappNumber}` : null

                // Format location address (e.g., "Rajouri Garden, Delhi")
                const locationText = formatLocation(business)

                const businessKey = business.id || business._id || business.businessLink
                const cardImages = collectBusinessImages(business)
                const totalImages = cardImages.length
                const currentImageIndex = cardImageIndexes[businessKey] ?? 0
                const currentImage = cardImages[currentImageIndex] || null
                const desktopImage = cardImages[0] || null

                return (
                  <div
                    key={business.id || business._id}
                    className="bg-white border sm:border border-gray-100 overflow-hidden cursor-pointer"
                    style={{ minHeight: 'auto', maxHeight: 'none' }}
                    onClick={() => navigate(`/${business.businessLink}`)}
                  >
                    {/* Mobile Layout */}
                    <div className="flex sm:hidden">
                      {/* Business Image */}
                      <div className="relative w-[40%] aspect-square bg-gradient-to-br from-primary-50 via-primary-100 to-primary-200 overflow-hidden">
                        {currentImage ? (
                          <img
                            src={currentImage}
                            alt={business.name}
                            className="w-full h-full object-cover"
                            loading="lazy"
                            onError={(e) => {
                              e.target.style.display = 'none'
                              e.target.nextSibling.style.display = 'flex'
                            }}
                          />
                        ) : null}
                        <div
                          className={`w-full h-full flex items-center justify-center ${currentImage ? 'hidden' : 'flex'}`}
                        >
                          {business.images?.logo ? (
                            <img
                              src={business.images.logo}
                              alt={business.name}
                              className="max-w-[65%] max-h-[65%] object-contain"
                            />
                          ) : (
                            <FaCalendarAlt className="text-primary-400 text-3xl" />
                          )}
                        </div>

                        {business.type && (
                          <div className="absolute top-1.5 left-1.5">
                            <span className="inline-block px-1.5 py-0.5 bg-primary-600/95 text-white rounded text-[10px] font-semibold capitalize border">
                              {business.type}
                            </span>
                          </div>
                        )}

                        {viewMode === 'nearby' && business.distanceKm && (
                          <div className="absolute bottom-1.5 right-1.5">
                            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-white/95 text-gray-900 rounded text-[10px] font-semibold   border border-gray-200">
                              <FaLocationArrow className="text-primary-600 text-[10px]" />
                              {business.distanceKm} km
                            </span>
                          </div>
                        )}

                        {cardImages.length > 1 && (
                          <div className="absolute inset-0 flex items-center justify-between px-2">
                            <button
                              type="button"
                              className="text-white"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleCardImageChange(businessKey, 'prev', cardImages.length)
                              }}
                            >
                              <FaChevronLeft className="text-base drop-shadow" />
                            </button>
                            <button
                              type="button"
                              className="text-white"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleCardImageChange(businessKey, 'next', cardImages.length)
                              }}
                            >
                              <FaChevronRight className="text-base drop-shadow" />
                            </button>
                          </div>
                        )}
                        {totalImages > 1 && (
                          <div className="absolute bottom-2 inset-x-0 flex justify-center gap-1.5">
                            {cardImages.map((_, idx) => (
                              <button
                                key={idx}
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleCardImageChange(businessKey, idx, cardImages.length)
                                }}
                                className={`h-1.5 w-1.5 rounded-full ${idx === currentImageIndex ? 'bg-white' : 'bg-white/50'}`}
                              />
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Business Info */}
                      <div className="flex-1 min-w-0 p-3 flex flex-col justify-between">
                        <div className="space-y-1.5">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0 flex-1">
                              <h3 className="text-sm font-bold text-gray-900">
                                {business.name}
                              </h3>
                              {business.ratings?.average > 0 && (
                                <div className="flex items-center gap-1 mt-0.5">
                                  <FaStar className="text-yellow-500 text-xs" />
                                  <span className="text-gray-900 font-semibold text-xs">
                                    {business.ratings.average.toFixed(1)}
                                  </span>
                                  {business.ratings.totalReviews > 0 && (
                                    <span className="text-gray-500 text-[10px]">
                                      ({business.ratings.totalReviews} reviews)
                                    </span>
                                  )}
                                  {business.ratings.average >= 4.5 && (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-semibold rounded-full whitespace-nowrap ml-auto">
                                      <FaStar className="text-amber-500 text-[10px]" />
                                      Top Rated
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>

                          {locationText && (
                            <div className="flex items-center gap-1 text-gray-600">
                              <FaMapMarkerAlt className="text-primary-500 text-[10px] flex-shrink-0" />
                              <span className="text-xs line-clamp-1">
                                {locationText}
                              </span>
                              {viewMode === 'nearby' && business.distanceKm && (
                                <span className="text-[10px] text-gray-400 ml-0.5">• {business.distanceKm} km</span>
                              )}
                            </div>
                          )}

                          {business.services?.length > 0 && (
                            <div className="mt-1.5">
                              <div className="text-[11px] font-semibold text-gray-700 mb-1">
                                Popular Services
                              </div>
                              <div className="flex flex-wrap gap-1.5">
                                {business.services.slice(0, 3).map((service, idx) => (
                                  <span
                                    key={idx}
                                    className="inline-flex items-center px-2 py-1 bg-primary-50 text-primary-700 text-[10px] rounded-full border border-primary-100"
                                  >
                                    {service.name || service}
                                  </span>
                                ))}
                                {business.services.length > 3 && (
                                  <span className="text-[10px] text-gray-500">
                                    +{business.services.length - 3} more
                                  </span>
                                )}
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="pt-2 border-t border-gray-100">
                          <div className="flex gap-1.5">
                            {getMobileActionButtons(business, whatsappUrl).map((btn, idx) => {
                              const Icon = btn.icon
                              const commonProps = {
                                key: idx,
                                className: btn.className,
                                onClick: (e) => {
                                  e.stopPropagation()
                                  if (btn.onClick) btn.onClick(e)
                                },
                                ...(btn.title && { title: btn.title })
                              }

                              return btn.type === 'link' ? (
                                <a
                                  {...commonProps}
                                  href={btn.href}
                                  {...(btn.target && { target: btn.target })}
                                  {...(btn.rel && { rel: btn.rel })}
                                >
                                  <Icon className={`${btn.iconSize} flex-shrink-0`} />
                                  <span className="truncate">{btn.label}</span>
                                </a>
                              ) : (
                                <button {...commonProps}>
                                  <Icon className={`${btn.iconSize} flex-shrink-0`} />
                                  <span className="truncate">{btn.label}</span>
                                </button>
                              )
                            })}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Desktop & Tablet Layout */}
                    <div className="hidden sm:flex sm:flex-col h-full border">
                      <div className="relative h-32 md:h-36 lg:h-40 bg-gradient-to-br from-primary-50 via-primary-100 to-primary-200 overflow-hidden">
                        {desktopImage ? (
                          <img
                            src={desktopImage}
                            alt={business.name}
                            className="w-full h-full object-cover"
                            loading="lazy"
                            onError={(e) => {
                              e.target.style.display = 'none'
                              e.target.nextSibling.style.display = 'flex'
                            }}
                          />
                        ) : null}
                        <div
                          className={`w-full h-full flex items-center justify-center ${desktopImage ? 'hidden' : 'flex'}`}
                        >
                          {business.images?.logo ? (
                            <img
                              src={business.images.logo}
                              alt={business.name}
                              className="max-w-[65%] max-h-[65%] object-contain"
                            />
                          ) : (
                            <FaCalendarAlt className="text-primary-400 text-4xl lg:text-6xl" />
                          )}
                        </div>

                        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent"></div>

                        {business.type && (
                          <div className="absolute top-2 left-2">
                            <span className="inline-block px-2 py-1 bg-primary-600/95 text-white rounded text-xs font-semibold capitalize border">
                              {business.type}
                            </span>
                          </div>
                        )}

                        {viewMode === 'nearby' && business.distanceKm && (
                          <div className="absolute bottom-2 right-2">
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-white/95 text-gray-900 rounded text-xs font-semibold   border border-gray-200">
                              <FaLocationArrow className="text-primary-600 text-xs" />
                              {business.distanceKm} km
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="p-2.5 md:p-3 flex-1 flex flex-col">
                        <div className="mb-1.5">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-base md:text-lg font-bold text-gray-900 flex-1">
                              {business.name}
                            </h3>
                            {business.ratings?.average > 0 && (
                              <div className="flex items-center gap-0.5 flex-shrink-0">
                                <FaStar className="text-yellow-500 text-sm" />
                                <span className="text-gray-900 font-bold text-sm">{business.ratings.average.toFixed(1)}</span>
                                {business.ratings.totalReviews > 0 && (
                                  <span className="text-gray-500 text-xs ml-0.5">({business.ratings.totalReviews})</span>
                                )}
                                {business.ratings.average >= 4.5 && (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-700 text-[11px] font-semibold rounded-full whitespace-nowrap ml-auto">
                                    <FaStar className="text-amber-500 text-xs" />
                                    Top Rated
                                  </span>
                                )}
                              </div>
                            )}
                          </div>

                          {business.description && (
                            <p className="text-sm text-gray-600 mb-1 line-clamp-2">
                              {business.description}
                            </p>
                          )}

                          {locationText && (
                            <div className="flex items-center gap-1 text-gray-600 mb-1.5">
                              <FaMapMarkerAlt className="text-primary-500 text-xs flex-shrink-0" />
                              <span className="text-sm line-clamp-1">
                                {locationText}
                              </span>
                              {viewMode === 'nearby' && business.distanceKm && (
                                <span className="text-xs text-gray-400 ml-0.5">• {business.distanceKm} km</span>
                              )}
                            </div>
                          )}
                        </div>

                        {(() => {
                          const services = business.services || []
                          const features = business.features || []
                          const hasServices = services.length > 0
                          const hasFeatures = features.length > 0
                          
                          // Don't show section if neither has data
                          if (!hasServices && !hasFeatures) return null

                          const sections = [
                            {
                              title: 'Services',
                              items: services.slice(0, 3),
                              icon: '•',
                              iconClass: 'text-primary-500',
                              emptyText: 'No services listed',
                              hasData: hasServices
                            },
                            {
                              title: 'Features',
                              items: features.slice(0, 3),
                              icon: FaCheckCircle,
                              iconClass: 'text-green-500',
                              emptyText: 'No features listed',
                              isComponent: true,
                              hasData: hasFeatures
                            }
                          ].filter(section => section.hasData) // Only show sections with data

                          if (sections.length === 0) return null

                          return (
                            <div className={`grid ${sections.length === 2 ? 'grid-cols-2' : 'grid-cols-1'} gap-3 md:gap-4 mb-2`}>
                              {sections.map((section, sectionIdx) => (
                                <div key={sectionIdx} className="flex flex-col min-w-0">
                                  <div className="text-xs font-semibold text-gray-700 mb-1">{section.title}:</div>
                                  {section.items.length > 0 ? (
                                    <ul className="space-y-1">
                                      {section.items.map((item, idx) => (
                                        <li key={idx} className="flex items-start gap-1.5 text-xs text-gray-600 leading-tight">
                                          {section.isComponent ? (
                                            <section.icon className={`${section.iconClass} text-[11px] mt-0.5 flex-shrink-0`} />
                                          ) : (
                                            <span className={`${section.iconClass} mt-0.5 flex-shrink-0 text-xs`}>{section.icon}</span>
                                          )}
                                          <span className="break-words flex-1">{item.name || item}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  ) : (
                                    <p className="text-xs text-gray-400 italic">{section.emptyText}</p>
                                  )}
                                </div>
                              ))}
                            </div>
                          )
                        })()}

                        <div className="mt-auto space-y-1.5 pt-2 border-t border-gray-100">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleBookAppointment(business.businessLink)
                            }}
                            className="w-full flex items-center justify-center gap-1.5 px-4 py-2 bg-primary-600 text-white   font-semibold border text-sm transition-colors duration-200 hover:bg-primary-700"
                          >
                            <FaCalendarAlt className="text-sm" />
                            <span>Book Appointment</span>
                          </button>

                          <div className="grid grid-cols-2 gap-1.5">
                            {getDesktopActionButtons(business, whatsappUrl).map((btn, idx) => {
                              const Icon = btn.icon
                              return (
                                <a
                                  key={idx}
                                  href={btn.href}
                                  onClick={(e) => e.stopPropagation()}
                                  className={btn.className}
                                  {...(btn.target && { target: btn.target })}
                                  {...(btn.rel && { rel: btn.rel })}
                                >
                                  <Icon className={btn.iconSize} />
                                  <span>{btn.label}</span>
                                </a>
                              )
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </div>

      {/* Features Section */}
      <div className="bg-white border-t border-gray-200 py-8 sm:py-10 lg:py-12">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 text-center">
            {FEATURES_DATA.map((feature, idx) => {
              const Icon = feature.icon
              return (
                <div key={idx} className="px-2">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                    <Icon className="text-primary-600 text-xl sm:text-2xl" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-1 sm:mb-2">{feature.title}</h3>
                  <p className="text-sm sm:text-base text-gray-600">{feature.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Location Permission Prompt Modal */}
      {showLocationPrompt && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={handleDenyLocation}
        >
          <div 
            className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 sm:p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaMapMarkerAlt className="text-primary-600 text-2xl" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                Enable Location Access
              </h3>
              <p className="text-sm sm:text-base text-gray-600">
                Allow us to access your location to show nearby businesses and help you find the best services in your area.
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={handleAllowLocation}
                disabled={locationLoading}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary-600 text-white font-semibold rounded-lg transition-colors duration-200 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {locationLoading ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    <span>Getting location...</span>
                  </>
                ) : (
                  <>
                    <FaMapMarkerAlt />
                    <span>Allow Location Access</span>
                  </>
                )}
              </button>
              
              <button
                onClick={handleDenyLocation}
                disabled={locationLoading}
                className="w-full px-4 py-3 text-gray-700 font-medium border border-gray-300 rounded-lg transition-colors duration-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Not Now
              </button>
            </div>

            <p className="text-xs text-gray-500 text-center mt-4">
              You can enable this later from your browser settings
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export default Home