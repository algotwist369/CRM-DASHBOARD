import React, { useState, useEffect, useCallback, useMemo, useRef, memo } from 'react'
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
  FaFilter,
  FaChevronRight
} from 'react-icons/fa'
import { IoMdCall } from 'react-icons/io'
import apiClient from '../../../services/api/client'
import { useDebounce } from '../../../hooks/common/useDebounce'
import BusinessCard from './BusinessCard'
import LocationPromptModal from './LocationPromptModal'


import {
  FiSearch,
  FiStar,
  FiUsers,
} from "react-icons/fi";
import {
  GiLotus,
  GiMuscleUp,
  GiHeartInside,
} from "react-icons/gi";
import { MdSpa, MdFaceRetouchingNatural } from "react-icons/md";

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
  'Search by business',
  'Search by location',
  'Search by area',
  'Search by city',
  'Search by state',
  'Search by service type',
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
    title: 'Online Booking System',
    description: 'Appointment Scheduling System - Book appointments instantly with our location-based CRM platform for spas, salons, hotels & gyms'
  },
  {
    icon: FaClock,
    title: 'Nearby Search & Business Finder',
    description: 'Location-Based Service with real-time availability. Find local businesses near you and schedule visits in seconds'
  },
  {
    icon: FaUsers,
    title: 'Business Management CRM',
    description: 'Comprehensive CRM Dashboard for Spa Management, Salon Management, Hotel Management & Gym Management Software'
  }
]

const SERVICES_DATA = [
  { id: 1, title: "Full Body Massage", icon: <MdSpa /> },
  { id: 2, title: "Aromatherapy", icon: <GiLotus /> },
  { id: 3, title: "Deep Tissue", icon: <GiMuscleUp /> },
  { id: 4, title: "Facial Care", icon: <MdFaceRetouchingNatural /> },
  { id: 5, title: "Couple Spa", icon: <GiHeartInside /> },
]

const HERO_IMAGES = [
  { src: "home/full_body.png", title: "Full Body" },
  { src: "home/aroma.png", title: "Aromatherapy" },
  { src: "home/deep_tissue.png", title: "Deep Tissue" },
  { src: "home/spa_and_relaxatiion.png", title: "Spa & Relaxation" },
  { src: "home/Facial_&_Skin_Care.png", title: "Facial & Skin Care" },
  { src: "home/cople.png", title: "Couple Spa" },
  { src: "home/wellness_theropy.png", title: "Wellness Therapy" },
  { src: "home/luxary_spa.png", title: "Luxury Spa" },
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
    window.scrollTo(0, 0);
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
        className: 'flex-1 min-w-0 flex items-center justify-center gap-1 px-2 xs:px-2.5 py-2.5 xs:py-2.5 bg-primary-600 text-white font-semibold border-0 rounded-md text-xs xs:text-xs transition-all duration-200 hover:bg-primary-700 active:bg-primary-800 active:scale-95 min-h-[40px] touch-manipulation',
        icon: FaCalendarAlt,
        label: 'Book',
        iconSize: 'text-xs'
      }
    ]

    if (business.phone) {
      buttons.push({
        type: 'link',
        href: `tel:${business.phone}`,
        className: 'flex-1 min-w-0 flex items-center justify-center gap-0.5 px-1.5 xs:px-2 py-2.5 xs:py-2.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-md font-medium text-[10px] xs:text-xs transition-all duration-200 hover:bg-blue-100 hover:border-blue-300 active:bg-blue-200 active:scale-95 min-h-[40px] touch-manipulation',
        icon: IoMdCall,
        label: 'Call',
        iconSize: 'text-[10px] xs:text-xs',
        title: 'Call'
      })
    }

    if (whatsappUrl) {
      buttons.push({
        type: 'link',
        href: whatsappUrl,
        target: '_blank',
        rel: 'noopener noreferrer',
        className: 'flex-1 min-w-0 flex items-center justify-center gap-0.5 px-1.5 xs:px-2 py-2.5 xs:py-2.5 bg-green-50 text-green-700 border border-green-200 rounded-md font-medium text-[10px] xs:text-xs transition-all duration-200 hover:bg-green-100 hover:border-green-300 active:bg-green-200 active:scale-95 min-h-[40px] touch-manipulation',
        icon: FaWhatsapp,
        label: 'WA',
        iconSize: 'text-[10px] xs:text-xs'
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
        className: 'flex items-center justify-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-700 border border-blue-200 font-medium text-md transition-colors duration-200 hover:bg-blue-100 hover:border-blue-300',
        icon: IoMdCall,
        label: 'Call',
        iconSize: 'text-lg'
      })
    }

    if (whatsappUrl) {
      buttons.push({
        type: 'link',
        href: whatsappUrl,
        target: '_blank',
        rel: 'noopener noreferrer',
        className: 'flex items-center justify-center gap-1 px-3 py-1.5 bg-green-50 text-green-700 border border-green-200 font-medium text-md transition-colors duration-200 hover:bg-green-100 hover:border-green-300',
        icon: FaWhatsapp,
        label: 'WhatsApp',
        iconSize: 'text-lg'
      })
    }

    return buttons
  }, [])



  const [isFilterOpen, setIsFilterOpen] = useState(false);


  return (
    <>
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-12 items-start lg:items-center">

          {/* LEFT */}
          <div className="space-y-5 sm:space-y-6">

            {/* Heading */}
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-gray-900 leading-tight">
                Professional spa services
              </h1>
              <p className="mt-2 text-sm sm:text-base text-gray-500">
                Top spa and massage therapists near you
              </p>
            </div>

            {/* Search */}
            <div className="w-full max-w-xl">
              <button
                type='button'
                onClick={() => navigate('/search')}
                className="
                          relative w-full
                          flex items-center
                          pl-11 pr-4
                          py-3 sm:py-3.5
                          bg-white
                          border border-gray-300
                          rounded-md
                          text-sm sm:text-base
                          text-gray-500
                          hover:border-gray-400
                          focus:outline-none
                          transition
                          min-h-[44px]
                          text-left
                        "
              >
                <FaSearch className="absolute left-4 text-gray-400 text-sm sm:text-base" />

                <span className="truncate">
                  {searchTerm || animatedPlaceholder || PLACEHOLDERS[0]}
                </span>
              </button>
            </div>

            {/* Services (desktop only) */}
            <div className="hidden md:block bg-white rounded-xl border divide-y">
              {SERVICES_DATA.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition"
                >
                  <div className="text-xl text-gray-700">
                    {item.icon}
                  </div>
                  <span className="text-gray-800 font-medium">
                    {item.title}
                  </span>
                </div>
              ))}
            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-6 sm:gap-8 pt-2">
              <div className="flex items-center gap-3">
                <FiStar className="text-gray-800 text-lg" />
                <div>
                  <p className="font-semibold text-sm">4.8 / 5</p>
                  <p className="text-xs text-gray-500">Avg rating</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <FiUsers className="text-gray-800 text-lg" />
                <div>
                  <p className="font-semibold text-sm">12M+</p>
                  <p className="text-xs text-gray-500">Happy users</p>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT */}
          <div className="relative">
            <div
              className="
          grid grid-cols-12 gap-2
          sm:grid-cols-3 sm:gap-3
          lg:gap-4
        "
            >
              {HERO_IMAGES.map((item, index) => {
                const mobileColSpan =
                  index < 3 ? "col-span-4" : index < 5 ? "col-span-6" : "col-span-4";

                return (
                  <div
                    key={index}
                    className={`
                relative overflow-hidden rounded-lg border bg-white
                ${mobileColSpan}
                sm:col-span-1
              `}
                    style={{ height: 120 }}
                  >
                    <img
                      src={item.src}
                      alt={item.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      decoding="async"
                    />

                    {/* Mobile text always visible */}
                    <div className="absolute inset-0 bg-black/40 flex items-end p-2">
                      <span
                        className="text-white text-xs font-semibold truncate whitespace-nowrap w-full"
                        title={item.title}
                      >
                        {item.title}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Badge */}
            <div className="absolute -bottom-6 left-4 bg-white px-3 py-2 rounded-md shadow flex items-center gap-2">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M12 2l2.4 7.4H22l-6 4.3 2.3 7.3L12 16.6 5.7 21l2.3-7.3-6-4.3h7.6L12 2z" />
              </svg>
              <span className="text-xs font-medium">
                Trusted Professionals
              </span>
            </div>
          </div>

        </div>
      </section>

      <div className="min-h-screen bg-gray-100 overflow-x-hidden">
        {/* Businesses Section */}
        <div className="max-w-7xl mx-auto px-3 xs:px-4 sm:px-6 lg:px-8 py-6 xs:py-8 sm:py-12">
          <div className="mb-5 xs:mb-6 sm:mb-8">
            {/* View Mode Toggle */}
            <div className="mb-4 sm:mb-6">
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">

                {/* Toggle Buttons */}
                <div className="flex items-center bg-gray-50 border border-gray-200 rounded-lg p-0.5">
                  <button
                    onClick={() => handleViewModeChange('all')}
                    className={`px-3 py-2 text-xs sm:text-sm font-medium rounded-md min-h-[40px]
          ${viewMode === 'all'
                        ? 'bg-white text-primary-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                      }`}
                  >
                    All
                  </button>

                  <button
                    onClick={() => handleViewModeChange('nearby')}
                    disabled={locationLoading}
                    className={`px-3 py-2 text-xs sm:text-sm font-medium rounded-md flex items-center gap-1.5 min-h-[40px]
          ${viewMode === 'nearby'
                        ? 'bg-white text-primary-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                      }
          ${locationLoading ? 'opacity-50 cursor-not-allowed' : ''}
        `}
                  >
                    <FaMapMarkerAlt className="text-xs sm:text-sm" />
                    Nearby
                    {locationLoading && <FaSpinner className="animate-spin text-xs" />}
                  </button>
                </div>

                {/* Distance */}
                {viewMode === 'nearby' && userLocation && (
                  <select
                    value={maxDistance}
                    onChange={(e) => setMaxDistance(Number(e.target.value))}
                    className="px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg min-h-[40px]"
                  >
                    {DISTANCE_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                )}

                {/* Refresh */}
                {viewMode === 'nearby' && userLocation && (
                  <button
                    onClick={handleRefreshLocation}
                    className="p-2 border border-gray-300 rounded-lg min-h-[40px] min-w-[40px] flex items-center justify-center hover:bg-gray-50"
                    aria-label="Refresh location"
                  >
                    <FaSync className="text-gray-600 text-sm" />
                  </button>
                )}

                {/* FILTER ICON */}
                <button
                  onClick={() => setIsFilterOpen((prev) => !prev)}
                  className="ml-auto p-2 border border-gray-300 rounded-lg min-h-[40px] min-w-[40px]
                 flex items-center justify-center hover:bg-gray-50 transition"
                  aria-label="Filter"
                >
                  <FaFilter className="text-gray-700 text-sm" />
                </button>
              </div>

              {/* EXPANDABLE FILTER */}
              {isFilterOpen && (
                <div className="mt-3 bg-white border border-gray-200 rounded-lg p-3 max-w-xs">
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="w-full px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-md
                   focus:outline-none focus:ring-2 focus:ring-primary-500 min-h-[40px]"
                  >
                    <option value="">All Types</option>
                    {BUSINESS_TYPES.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>

          {(loading || nearbyLoading) ? (
            <div className="flex items-center justify-center py-8 xs:py-10 sm:py-12">
              <div className="text-center px-4">
                <FaSpinner className="animate-spin text-primary-600 text-3xl xs:text-3xl sm:text-4xl mx-auto mb-3 xs:mb-3 sm:mb-4" />
                <p className="text-gray-600 text-sm xs:text-sm sm:text-base">
                  {viewMode === 'nearby' && locationLoading
                    ? 'Getting your location...'
                    : 'Loading businesses...'}
                </p>
              </div>
            </div>
          ) : filteredBusinesses.length === 0 ? (
            <div className="text-center py-8 xs:py-10 sm:py-12 bg-white border border-gray-200 rounded-lg px-4 xs:px-6">
              <FaSearch className="mx-auto text-gray-400 text-3xl xs:text-3xl sm:text-4xl mb-3 xs:mb-3 sm:mb-4" />
              <p className="text-gray-600 text-base xs:text-base sm:text-lg mb-2 font-semibold">No businesses found</p>
              <p className="text-gray-500 text-xs xs:text-sm sm:text-sm leading-relaxed max-w-md mx-auto">
                {searchTerm
                  ? `No businesses match "${searchTerm}". Try a different search term or clear filters.`
                  : viewMode === 'nearby'
                    ? `No businesses found within ${(maxDistance / 1000).toFixed(0)}km. Try increasing the distance or switch to "All Businesses".`
                    : 'No businesses are currently available for online booking'}
              </p>
              {(searchTerm || (viewMode === 'nearby' && businesses.length === 0)) && (
                <div className="mt-5 xs:mt-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-2.5 xs:gap-3 sm:gap-3 max-w-md mx-auto">
                  {searchTerm && (
                    <button
                      onClick={() => {
                        setSearchTerm('')
                        setFilterType('')
                      }}
                      className="w-full sm:w-auto px-4 xs:px-5 py-2.5 xs:py-3 text-primary-600 hover:text-primary-700 border-primary-200 border rounded-lg hover:bg-primary-50 active:bg-primary-100 text-sm xs:text-sm sm:text-base font-medium min-h-[44px] touch-manipulation transition-all duration-200"
                    >
                      Clear Search
                    </button>
                  )}
                  {viewMode === 'nearby' && businesses.length === 0 && (
                    <button
                      onClick={() => handleViewModeChange('all')}
                      className="w-full sm:w-auto px-4 xs:px-5 py-2.5 xs:py-3 bg-primary-600 text-white border-0 rounded-lg hover:bg-primary-700 active:bg-primary-800 text-sm xs:text-sm sm:text-base font-medium min-h-[44px] touch-manipulation transition-all duration-200"
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
                <div className="mb-3 xs:mb-4 sm:mb-4 text-xs xs:text-sm sm:text-sm text-gray-600 px-1">
                  Found {filteredBusinesses.length} {filteredBusinesses.length === 1 ? 'business' : 'businesses'}
                  {businesses.length !== filteredBusinesses.length && ` (filtered from ${businesses.length} total)`}
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 xs:gap-4 sm:gap-4 lg:gap-6">
                {filteredBusinesses.map((business) => {
                  const businessKey = business.id || business._id || business.businessLink
                  const cardImages = collectBusinessImages(business)
                  const currentImageIndex = cardImageIndexes[businessKey] ?? 0

                  return (
                    <BusinessCard
                      key={business.id || business._id}
                      business={business}
                      viewMode={viewMode}
                      currentImageIndex={currentImageIndex}
                      cardImages={cardImages}
                      onImageChange={handleCardImageChange}
                      onBookAppointment={handleBookAppointment}
                      formatLocation={formatLocation}
                      getMobileActionButtons={getMobileActionButtons}
                      getDesktopActionButtons={getDesktopActionButtons}
                    />
                  )
                })}
              </div>
            </>
          )}
        </div>

        {/* Features Section */}
        <div className="bg-white border-t border-gray-200 py-8 xs:py-10 sm:py-10 lg:py-12">
          <div className="max-w-7xl mx-auto px-3 xs:px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 xs:gap-6 sm:gap-8 text-center">
              {FEATURES_DATA.map((feature, idx) => {
                const Icon = feature.icon
                return (
                  <div key={idx} className="px-2 xs:px-3">
                    <div className="w-14 h-14 xs:w-16 xs:h-16 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-3 xs:mb-4 sm:mb-4">
                      <Icon className="text-primary-600 text-xl xs:text-2xl sm:text-2xl" />
                    </div>
                    <h3 className="text-base xs:text-lg sm:text-xl font-semibold text-gray-900 mb-1.5 xs:mb-2 sm:mb-2 leading-tight">{feature.title}</h3>
                    <p className="text-xs xs:text-sm sm:text-base text-gray-600 leading-relaxed px-2">{feature.description}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Location Permission Prompt Modal */}
        {showLocationPrompt && (
          <LocationPromptModal
            onAllow={handleAllowLocation}
            onDeny={handleDenyLocation}
            loading={locationLoading}
          />
        )}
      </div>
    </>
  )
}

export default Home