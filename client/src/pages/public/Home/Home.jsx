import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import {
  FaSearch,
  FaSpinner,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaPhone,
  FaClock,
  FaUsers,
  FaStar,
  FaCheckCircle,
  FaWhatsapp,
  FaLocationArrow,
  FaSync,
  FaTimes
} from 'react-icons/fa'
import apiClient from '../../../services/api/client'
import { usePageTitle } from '../../../hooks/usePageTitle'

const LOCATION_PREFERENCE_KEY = 'home_view_mode_preference'

const getInitialViewMode = () => {
  if (typeof window === 'undefined') return 'nearby'
  const stored = window.localStorage.getItem(LOCATION_PREFERENCE_KEY)
  if (stored === 'all' || stored === 'nearby') return stored
  return 'nearby'
}

const getInitialLocationPromptState = () => {
  if (typeof window === 'undefined') return false
  return !window.localStorage.getItem(LOCATION_PREFERENCE_KEY)
}

// Constants
const CACHE_KEYS = {
  LOCATION: 'business_location_cache',
  NEARBY_BUSINESSES: 'nearby_businesses_cache',
  ALL_BUSINESSES: 'all_businesses_cache'
}

const CACHE_DURATION = {
  LOCATION: 24 * 60 * 60 * 1000,
  BUSINESSES: 5 * 60 * 1000
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
  { value: '', label: 'All Types' },
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

const FEATURES = [
  { icon: FaCalendarAlt, title: 'Easy Booking', description: 'Book appointments in just a few clicks with our simple and intuitive interface' },
  { icon: FaClock, title: 'Real-Time Availability', description: 'See available time slots in real-time and book instantly' },
  { icon: FaUsers, title: 'Verified Businesses', description: 'Connect with trusted and verified businesses in your area' }
]

const AREA_KEYWORDS = ['area', 'locality', 'sector', 'block', 'street', 'road', 'lane', 'colony']

// Cache utilities
const getCachedData = (key) => {
  try {
    const cached = localStorage.getItem(key)
    if (!cached) return null
    const { data, timestamp } = JSON.parse(cached)
    const now = Date.now()
    const duration = CACHE_DURATION[key.includes('location') ? 'LOCATION' : 'BUSINESSES']
    if (now - timestamp < duration) return data
    localStorage.removeItem(key)
    return null
  } catch (error) {
    console.error('Error reading cache:', error)
    return null
  }
}

const setCachedData = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify({ data, timestamp: Date.now() }))
  } catch (error) {
    console.error('Error setting cache:', error)
  }
}

// Escape regex special characters
const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

// Memoized highlight function
const createHighlightKeywords = () => {
  const cache = new Map()
  return (text, keywords) => {
    if (!text || !keywords?.length) return text
    const cacheKey = `${text}_${keywords.join('_')}`
    if (cache.has(cacheKey)) return cache.get(cacheKey)

    let highlightedText = text
    const sortedKeywords = [...keywords].sort((a, b) => b.length - a.length)

    sortedKeywords.forEach(keyword => {
      const escaped = escapeRegex(keyword.toLowerCase())
      const regex = new RegExp(`(${escaped})`, 'gi')
      const matches = [...text.matchAll(regex)]

      for (let i = matches.length - 1; i >= 0; i--) {
        const match = matches[i]
        const start = match.index
        const end = start + match[0].length
        const originalText = highlightedText.substring(start, end)
        highlightedText =
          highlightedText.substring(0, start) +
          `<mark class="bg-yellow-200 text-yellow-900 font-semibold px-0.5 rounded">${originalText}</mark>` +
          highlightedText.substring(end)
      }
    })

    cache.set(cacheKey, highlightedText)
    if (cache.size > 100) cache.clear() // Prevent memory leak
    return highlightedText
  }
}

const highlightKeywords = createHighlightKeywords()

const Home = () => {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [businesses, setBusinesses] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterType, setFilterType] = useState('')
  const [viewMode, setViewMode] = useState(() => getInitialViewMode())
  const [userLocation, setUserLocation] = useState(null)
  const [locationLoading, setLocationLoading] = useState(false)
  const [locationError, setLocationError] = useState(null)
  const [maxDistance, setMaxDistance] = useState(5000)
  const [nearbyLoading, setNearbyLoading] = useState(false)
  const [animatedPlaceholder, setAnimatedPlaceholder] = useState('')
  const [manualLocation, setManualLocation] = useState(null)
  const [showLocationPrompt, setShowLocationPrompt] = useState(() => getInitialLocationPromptState())
  const [showLocationFallbackModal, setShowLocationFallbackModal] = useState(false)
  const [manualLocationModalOpen, setManualLocationModalOpen] = useState(false)
  const [manualLocationOptions, setManualLocationOptions] = useState([])
  const [manualLocationSuggestions, setManualLocationSuggestions] = useState([])
  const [manualLocationSearch, setManualLocationSearch] = useState('')
  const [manualLocationLoading, setManualLocationLoading] = useState(false)
  const [manualLocationSuggestionsLoading, setManualLocationSuggestionsLoading] = useState(false)
  const [manualLocationSearchError, setManualLocationSearchError] = useState(null)
  const [manualLocationCoords, setManualLocationCoords] = useState(null)
  const [hasShownFallback, setHasShownFallback] = useState(false)
  const [lastNoBusinessMessage, setLastNoBusinessMessage] = useState('')
  const geocodeCacheRef = useRef(new Map())
  const requestLocksRef = useRef(new Set())

  usePageTitle()

  useEffect(() => {
    if (typeof window === 'undefined') return
    window.localStorage.setItem(LOCATION_PREFERENCE_KEY, viewMode)
  }, [viewMode])

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

  // Get user location
  const getUserLocation = useCallback(() => {
    return new Promise((resolve, reject) => {
      const cachedLocation = getCachedData(CACHE_KEYS.LOCATION)
      if (cachedLocation) {
        resolve(cachedLocation)
        return
      }

      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by your browser'))
        return
      }

      setLocationLoading(true)
      setLocationError(null)

      const errorMessages = {
        [1]: 'Location permission denied. Please enable location access.',
        [2]: 'Location information unavailable.',
        [3]: 'Location request timed out.'
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy
          }
          setCachedData(CACHE_KEYS.LOCATION, location)
          setLocationLoading(false)
          resolve(location)
        },
        (error) => {
          setLocationLoading(false)
          const errorMessage = errorMessages[error.code] || 'Unable to get your location'
          setLocationError(errorMessage)
          reject(new Error(errorMessage))
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
      )
    })
  }, [])

  // Fetch all businesses
  const fetchBusinesses = useCallback(async () => {
    const requestKey = `list:${filterType || 'all'}:${searchTerm.trim() || 'all'}:${CACHE_KEYS.ALL_BUSINESSES}`
    const cacheKey = `${CACHE_KEYS.ALL_BUSINESSES}_${filterType}_${searchTerm}`
    const cached = getCachedData(cacheKey)
    if (cached) {
      setBusinesses(cached)
      setLoading(false)
      return
    }

    if (requestLocksRef.current.has(requestKey)) {
      return
    }

    requestLocksRef.current.add(requestKey)
    setLoading(true)

    try {
      const params = {
        page: 1,
        limit: 20,
        ...(filterType && { type: filterType }),
        ...(searchTerm.trim() && { search: searchTerm.trim() })
      }

      const response = await apiClient.get('/business/public/list', { params })

      if (response.data?.success) {
        const businessList = response.data.data || []
        setBusinesses(businessList)
        setCachedData(cacheKey, businessList)
      } else {
        setBusinesses([])
      }
    } catch (error) {
      console.error('Failed to fetch businesses:', error)
      setBusinesses([])
      toast.error('Failed to load businesses. Please try again.')
    } finally {
      requestLocksRef.current.delete(requestKey)
      setLoading(false)
    }
  }, [filterType, searchTerm])

  // Fetch nearby businesses
  const fetchNearbyBusinesses = useCallback(async (location, distance = maxDistance) => {
    const requestKey = `nearby:${location.lat}:${location.lng}:${distance}:${filterType || 'all'}`
    const cacheKey = `${CACHE_KEYS.NEARBY_BUSINESSES}_${location.lat}_${location.lng}_${distance}_${filterType}`
    const cached = getCachedData(cacheKey)
    if (cached) {
      setBusinesses(cached)
      setNearbyLoading(false)
      if (cached.length === 0 && viewMode === 'nearby' && !hasShownFallback) {
        setShowLocationFallbackModal(true)
        setHasShownFallback(true)
      }
      const message = `No businesses found within ${(distance / 1000).toFixed(0)}km. Try increasing the search radius.`
      if (cached.length > 0 && lastNoBusinessMessage) {
        setLastNoBusinessMessage('')
      } else if (cached.length === 0 && lastNoBusinessMessage !== message) {
        toast(message, {
          icon: 'ℹ️',
          duration: 4000
        })
        setLastNoBusinessMessage(message)
      }
      return
    }

    if (requestLocksRef.current.has(requestKey)) {
      return
    }
    requestLocksRef.current.add(requestKey)
    setNearbyLoading(true)

    try {
      const params = {
        lat: location.lat,
        lng: location.lng,
        maxDistance: distance,
        page: 1,
        limit: 20,
        ...(filterType && { type: filterType })
      }

      const response = await apiClient.get('/business/public/nearby', { params })

      if (response.data?.success) {
        const businessList = (response.data.data || []).sort((a, b) => (a.distance || 0) - (b.distance || 0))
        setBusinesses(businessList)
        setCachedData(cacheKey, businessList)

        if (businessList.length === 0) {
          const message = `No businesses found within ${(distance / 1000).toFixed(0)}km. Try increasing the search radius.`
          if (lastNoBusinessMessage !== message) {
            toast(message, {
              icon: 'ℹ️',
              duration: 4000
            })
            setLastNoBusinessMessage(message)
          }
          if (viewMode === 'nearby' && !hasShownFallback) {
            setShowLocationFallbackModal(true)
            setHasShownFallback(true)
          }
        } else if (hasShownFallback) {
          setHasShownFallback(false)
          if (lastNoBusinessMessage) {
            setLastNoBusinessMessage('')
          }
        } else if (businessList.length > 0 && lastNoBusinessMessage) {
          setLastNoBusinessMessage('')
        }
      } else {
        setBusinesses([])
        const errorCode = response.data?.code || 'UNKNOWN_ERROR'
        const errorMessage = response.data?.message || 'Failed to fetch nearby businesses'

        if (['MISSING_COORDINATES', 'INVALID_COORDINATES'].includes(errorCode)) {
          toast.error('Invalid location. Please allow location access and try again.')
        } else if (['GEOSPATIAL_ERROR', 'GEOSPATIAL_SERVICE_UNAVAILABLE'].includes(errorCode)) {
          toast.error('Location search is temporarily unavailable. Showing all businesses instead.')
          setViewMode('all')
          fetchBusinesses()
        } else {
          toast.error(errorMessage)
        }
        if (lastNoBusinessMessage) {
          setLastNoBusinessMessage('')
        }
        if (viewMode === 'nearby' && !hasShownFallback) {
          setShowLocationFallbackModal(true)
          setHasShownFallback(true)
        }
      }
    } catch (error) {
      console.error('Failed to fetch nearby businesses:', error)
      setBusinesses([])

      const errorCode = error.response?.data?.code
      if (['GEOSPATIAL_ERROR', 'GEOSPATIAL_SERVICE_UNAVAILABLE'].includes(errorCode)) {
        toast.error('Location search is temporarily unavailable. Showing all businesses instead.')
        setViewMode('all')
        fetchBusinesses()
      } else {
        toast.error(error.response?.data?.message || 'Network error. Please check your connection and try again.')
      }
      if (lastNoBusinessMessage) {
        setLastNoBusinessMessage('')
      }
      if (viewMode === 'nearby' && !hasShownFallback) {
        setShowLocationFallbackModal(true)
        setHasShownFallback(true)
      }
    } finally {
      requestLocksRef.current.delete(requestKey)
      setNearbyLoading(false)
    }
  }, [maxDistance, filterType, fetchBusinesses, viewMode, hasShownFallback, lastNoBusinessMessage])

  // Initial load
  useEffect(() => {
    if (viewMode === 'all') fetchBusinesses()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Initialize location
  useEffect(() => {
    const initializeLocation = async () => {
      setShowLocationPrompt(true)
      try {
        const location = await getUserLocation()
        setUserLocation(location)
        if (viewMode === 'nearby') await fetchNearbyBusinesses(location)
      } catch (err) {
        console.error('Location error:', err)
        if (viewMode === 'nearby') {
          toast.error('Unable to get location automatically. Choose a location manually or view all businesses.')
        }
        setShowLocationFallbackModal(true)
        setHasShownFallback(true)
      } finally {
        setShowLocationPrompt(false)
      }
    }

    if (viewMode === 'nearby' && !userLocation) initializeLocation()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewMode])

  // Optimized filtering with memoization
  const filteredBusinesses = useMemo(() => {
    const dataset = businesses

    if (!searchTerm.trim()) return dataset

    const searchLower = searchTerm.toLowerCase().trim()
    const searchTerms = searchLower.split(/\s+/).filter(Boolean)

    return dataset.reduce((acc, business) => {
      // Build searchable text once
      const searchableText = [
        business.name,
        business.branch,
        business.city,
        business.state,
        business.address,
        business.category,
        business.businessLink,
        ...(business.tags || []),
        ...(business.services || []).map(s => typeof s === 'object' ? s.name : s),
        ...(business.features || [])
      ].filter(Boolean).join(' ').toLowerCase()

      // Check matches
      const matches = {
        name: business.name?.toLowerCase().includes(searchLower),
        branch: business.branch?.toLowerCase().includes(searchLower),
        city: business.city?.toLowerCase().includes(searchLower),
        state: business.state?.toLowerCase().includes(searchLower),
        address: business.address?.toLowerCase().includes(searchLower),
        category: business.category?.toLowerCase().includes(searchLower),
        businessLink: business.businessLink?.toLowerCase().includes(searchLower),
        tags: business.tags?.some(tag => tag.toLowerCase().includes(searchLower)),
        services: business.services?.some(s => {
          const name = typeof s === 'object' ? s.name : s
          return name?.toLowerCase().includes(searchLower)
        }),
        features: business.features?.some(f => f.toLowerCase().includes(searchLower)),
        area: AREA_KEYWORDS.some(kw =>
          business.address?.toLowerCase().includes(`${kw} ${searchLower}`) ||
          business.address?.toLowerCase().includes(`${searchLower} ${kw}`)
        )
      }

      const hasMatch = Object.values(matches).some(Boolean)
      const multiWordMatch = searchTerms.length > 1
        ? searchTerms.every(term => searchableText.includes(term))
        : true

      if (hasMatch && multiWordMatch) {
        const matchedFields = Object.entries(matches)
          .filter(([, matched]) => matched)
          .map(([field]) => field)

        acc.push({
          ...business,
          _highlighted: {
            name: highlightKeywords(business.name, searchTerms),
            branch: business.branch ? highlightKeywords(business.branch, searchTerms) : null,
            city: business.city ? highlightKeywords(business.city, searchTerms) : null,
            state: business.state ? highlightKeywords(business.state, searchTerms) : null,
            address: business.address ? highlightKeywords(business.address, searchTerms) : null,
            category: business.category ? highlightKeywords(business.category, searchTerms) : null,
            matchedFields
          }
        })
      }

      return acc
    }, [])
  }, [businesses, searchTerm])

  // Debounced fetch
  useEffect(() => {
    const timer = setTimeout(() => {
      if (viewMode === 'all') {
        fetchBusinesses()
      } else if (viewMode === 'nearby' && userLocation) {
        fetchNearbyBusinesses(userLocation)
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [filterType, viewMode, userLocation, fetchBusinesses, fetchNearbyBusinesses])

  // Handlers
  const handleViewModeChange = useCallback(async (mode) => {
    setViewMode(mode)
    if (mode === 'nearby') {
      setShowLocationPrompt(true)
      const existingLocation = manualLocationCoords || userLocation
      if (existingLocation) {
        setUserLocation(existingLocation)
        await fetchNearbyBusinesses(existingLocation)
        setShowLocationPrompt(false)
        return
      }

      try {
        const location = await getUserLocation()
        setUserLocation(location)
        await fetchNearbyBusinesses(location)
      } catch (err) {
        console.error('Location access error:', err)
        toast.error('Unable to get location automatically. Please choose a location manually or view all businesses.')
        setViewMode('all')
        setShowLocationFallbackModal(true)
        setHasShownFallback(true)
        fetchBusinesses()
      } finally {
        setShowLocationPrompt(false)
      }
    } else {
      setShowLocationFallbackModal(false)
      setHasShownFallback(false)
      fetchBusinesses()
    }
  }, [userLocation, manualLocationCoords, getUserLocation, fetchNearbyBusinesses, fetchBusinesses])
  const handleRefreshLocation = useCallback(async () => {
    try {
      localStorage.removeItem(CACHE_KEYS.LOCATION)
      const location = await getUserLocation()
      setUserLocation(location)
      if (viewMode === 'nearby') await fetchNearbyBusinesses(location)
      toast.success('Location updated')
    } catch (err) {
      console.error('Location refresh error:', err)
      toast.error('Failed to refresh location')
    }
  }, [getUserLocation, viewMode, fetchNearbyBusinesses])

  const handleOpenManualLocationModal = useCallback(async () => {
    setManualLocationModalOpen(true)
    setShowLocationFallbackModal(false)
    setHasShownFallback(false)
    setManualLocationSearch('')
    if (manualLocationOptions.length > 0 || manualLocationLoading) return

    try {
      setManualLocationLoading(true)
      const response = await apiClient.get('/business/public/locations/india')

      if (response.data?.success) {
        const locations = response.data.data?.locations || []
        const seen = new Set()
        const options = locations.reduce((acc, location) => {
          const city = location.city?.trim()
          const state = location.state?.trim()
          if (!city || !state) return acc
          const key = `${city.toLowerCase()}|${state.toLowerCase()}`
          if (seen.has(key)) return acc
          seen.add(key)
          acc.push({
            city,
            state,
            stateCode: location.stateCode || '',
            label: `${city}, ${state}`
          })
          return acc
        }, [])

        options.sort((a, b) => a.label.localeCompare(b.label))
        setManualLocationOptions(options)

        if (options.length === 0) {
          toast('No locations available yet. Try again later or view all businesses.', { icon: 'ℹ️', duration: 3500 })
        }
      } else {
        toast.error('Unable to load locations right now.')
      }
    } catch (error) {
      console.error('Failed to load manual locations:', error)
      toast.error('Unable to load locations right now.')
    } finally {
      setManualLocationLoading(false)
    }
  }, [manualLocationOptions.length, manualLocationLoading])

  useEffect(() => {
    if (!manualLocationModalOpen) return
    const trimmed = manualLocationSearch.trim()
    if (trimmed.length < 2) {
      setManualLocationSuggestions([])
      setManualLocationSearchError(null)
      setManualLocationSuggestionsLoading(false)
      return
    }

    const controller = new AbortController()
    const timer = setTimeout(async () => {
      try {
        setManualLocationSuggestionsLoading(true)
        setManualLocationSearchError(null)
        const response = await fetch(
          `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(trimmed)}&count=8&language=en&format=json&country=IN`,
          { signal: controller.signal }
        )

        if (!response.ok) {
          throw new Error('Location search failed')
        }

        const data = await response.json()
        const suggestions = (data.results || []).map((result) => ({
          city: result.name,
          state: result.admin1 || result.admin2 || '',
          country: result.country || '',
          latitude: result.latitude,
          longitude: result.longitude,
          label: result.admin1 ? `${result.name}, ${result.admin1}` : result.name
        }))

        setManualLocationSuggestions(suggestions)
        if (suggestions.length === 0) {
          setManualLocationSearchError('No matching locations found. Try another name.')
        }
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('Location suggestion error:', error)
          setManualLocationSearchError('Unable to search location right now. Please try again.')
        }
      } finally {
        setManualLocationSuggestionsLoading(false)
      }
    }, 400)

    return () => {
      clearTimeout(timer)
      controller.abort()
    }
  }, [manualLocationSearch, manualLocationModalOpen])

  useEffect(() => {
    if (!manualLocationModalOpen) {
      setManualLocationSuggestions([])
      setManualLocationSearchError(null)
      setManualLocationSuggestionsLoading(false)
    }
  }, [manualLocationModalOpen])

  const resolveLocationCoordinates = useCallback(async (city, state) => {
    if (!city) return null
    const cacheKey = `${city.toLowerCase()}|${state ? state.toLowerCase() : ''}`
    if (geocodeCacheRef.current.has(cacheKey)) {
      return geocodeCacheRef.current.get(cacheKey)
    }

    const queries = []
    if (state) {
      queries.push(`${city}, ${state}, India`)
      queries.push(`${city}, ${state}`)
    }
    queries.push(`${city}, India`)
    queries.push(city)

    const attemptOpenMeteo = async (query) => {
      try {
        const response = await fetch(
          `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=1&language=en&format=json&country=IN`
        )
        if (!response.ok) return null
        const data = await response.json()
        const result = data.results?.[0]
        if (!result || !result.latitude || !result.longitude) return null
        return { lat: result.latitude, lng: result.longitude }
      } catch {
        return null
      }
    }

    const attemptMapsCo = async (query) => {
      try {
        const response = await fetch(
          `https://geocode.maps.co/search?q=${encodeURIComponent(query)}&countrycodes=in`
        )
        if (!response.ok) return null
        const data = await response.json()
        const result = Array.isArray(data) ? data[0] : null
        if (!result || !result.lat || !result.lon) return null
        return { lat: parseFloat(result.lat), lng: parseFloat(result.lon) }
      } catch {
        return null
      }
    }

    for (const query of queries) {
      const coordinates = await attemptOpenMeteo(query)
      if (coordinates) {
        geocodeCacheRef.current.set(cacheKey, coordinates)
        return coordinates
      }
    }

    for (const query of queries) {
      const coordinates = await attemptMapsCo(query)
      if (coordinates) {
        geocodeCacheRef.current.set(cacheKey, coordinates)
        return coordinates
      }
    }

    geocodeCacheRef.current.set(cacheKey, null)
    return null
  }, [])

  const handleManualLocationSelect = useCallback(
    async (option) => {
      setManualLocationLoading(true)
      setManualLocationSearchError(null)

      try {
        const normalized = {
          city: option.city,
          state: option.state,
          label: option.label || (option.state ? `${option.city}, ${option.state}` : option.city)
        }
        let coordinates =
          option.latitude && option.longitude
            ? { lat: option.latitude, lng: option.longitude }
            : await resolveLocationCoordinates(option.city, option.state)

        if (!coordinates) {
          setManualLocationSearchError('We could not locate that city. Try typing a nearby area or landmark.')
          return
        }

        setManualLocation(normalized)
        setManualLocationCoords(coordinates)
        setUserLocation(coordinates)
        setViewMode('nearby')
        setManualLocationModalOpen(false)
        setShowLocationFallbackModal(false)
        setHasShownFallback(false)
        setLastNoBusinessMessage('')
        await fetchNearbyBusinesses(coordinates)
        setManualLocationSearch('')
        setManualLocationSuggestions([])
        toast.success(`Showing businesses near ${normalized.label}`)
      } catch (error) {
        console.error('Manual location selection error:', error)
        setManualLocationSearchError('Unable to load businesses for that location. Please try again.')
      } finally {
        setManualLocationLoading(false)
      }
    },
    [fetchNearbyBusinesses, resolveLocationCoordinates]
  )

  const clearManualLocation = useCallback(() => {
    setManualLocation(null)
    setManualLocationCoords(null)
    setUserLocation(null)
    setManualLocationModalOpen(false)
    setManualLocationSearch('')
    setManualLocationSuggestions([])
    setManualLocationSearchError(null)
    setLastNoBusinessMessage('')
    toast.success('Showing all businesses')
    setViewMode('all')
  }, [])

  const handleViewAllFromFallback = useCallback(() => {
    setShowLocationFallbackModal(false)
    setManualLocation(null)
    setManualLocationCoords(null)
    setUserLocation(null)
    setHasShownFallback(false)
    setViewMode('all')
    setLastNoBusinessMessage('')
  }, [])

  const handleDirectBooking = useCallback((e) => {
    e.preventDefault()
    const link = searchTerm.trim()
    if (link) {
      navigate(`/${link}`)
    } else {
      toast.error('Please enter a business link')
    }
  }, [searchTerm, navigate])

  const handleBookAppointment = useCallback((businessLink) => {
    if (businessLink) {
      navigate(`/book/${businessLink}/services`)
    } else {
      toast.error('Business link not available')
    }
  }, [navigate])

  const filteredManualLocationOptions = useMemo(() => {
    if (!manualLocationSearch.trim()) return manualLocationOptions
    const searchLower = manualLocationSearch.toLowerCase()
    return manualLocationOptions.filter((option) => option.label.toLowerCase().includes(searchLower))
  }, [manualLocationOptions, manualLocationSearch])

  const isLoading = loading || nearbyLoading
  const hasResults = filteredBusinesses.length > 0

  return (
    <div className="min-h-screen bg-gray-50">
      {showLocationPrompt && locationLoading && (
        <div className="fixed inset-x-0 top-20 z-40 flex justify-center px-4">
          <div className="max-w-sm w-full bg-white border border-primary-100 shadow-lg rounded-xl p-4 flex items-center gap-3">
            <div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary-50 text-primary-600">
              <FaMapMarkerAlt className="text-base" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-900">Locating nearby businesses</p>
              <p className="text-xs text-gray-500">Allow location access to see recommendations around you.</p>
            </div>
            <FaSpinner className="text-primary-600 animate-spin text-lg" />
          </div>
        </div>
      )}

      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary-600 to-primary-800 text-white">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-10 sm:py-16 lg:py-24">
          <div className="text-center">
            <h1 className="text-2xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold mb-3 sm:mb-4 px-2">
              Book Your Appointment
            </h1>
            <p className="text-base sm:text-xl lg:text-2xl text-primary-100 mb-6 sm:mb-8 max-w-2xl mx-auto px-2">
              Find and book appointments with your favorite businesses instantly
            </p>

            <form onSubmit={handleDirectBooking} className="max-w-2xl mx-auto px-2">
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <div className="flex-1 relative">
                  <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-base" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder={searchTerm ? '' : animatedPlaceholder || PLACEHOLDERS[0]}
                    className="w-full pl-12 pr-4 py-3.5 rounded-lg text-gray-900 bg-white border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-base placeholder:text-gray-400"
                  />
                </div>
                <button
                  type="submit"
                  className="hidden px-6 py-3.5 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 flex items-center justify-center gap-2 text-base whitespace-nowrap transition-colors"
                >
                  <FaSearch className="text-sm" />
                  <span>Search</span>
                </button>

              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Businesses Section */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-8 sm:py-12">
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col gap-4 mb-4 sm:mb-6">
            <div className="flex-1">
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">
                {viewMode === 'nearby' ? 'Nearby Businesses' : 'All Businesses'}
              </h2>
              <p className="text-sm sm:text-base text-gray-600">
                {viewMode === 'nearby'
                  ? userLocation
                    ? manualLocation
                      ? `Businesses near ${manualLocation.label} within ${(maxDistance / 1000).toFixed(0)}km`
                      : `Businesses within ${(maxDistance / 1000).toFixed(0)}km of your location`
                    : 'Enable location to see nearby businesses'
                  : 'Browse and book appointments with available businesses'}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <div className="flex items-center gap-1 sm:gap-2 bg-gray-100 rounded-lg p-0.5 sm:p-1">
                {['all', 'nearby'].map(mode => (
                  <button
                    key={mode}
                    onClick={() => handleViewModeChange(mode)}
                    disabled={mode === 'nearby' && locationLoading}
                    className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-md text-xs sm:text-sm font-medium transition-colors flex items-center gap-1 sm:gap-2 ${viewMode === mode
                        ? 'bg-white text-primary-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                      } ${locationLoading && mode === 'nearby' ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {mode === 'nearby' && <FaMapMarkerAlt className="text-xs sm:text-sm" />}
                    <span className="hidden sm:inline">{mode === 'all' ? 'All' : 'Nearby'}</span>
                    <span className="sm:hidden">{mode === 'all' ? 'All' : 'Near'}</span>
                    {locationLoading && mode === 'nearby' && <FaSpinner className="animate-spin text-xs" />}
                  </button>
                ))}
              </div>

              {viewMode === 'nearby' && userLocation && (
                <>
                  <select
                    value={maxDistance}
                    onChange={(e) => {
                      const distance = Number(e.target.value)
                      setMaxDistance(distance)
                      fetchNearbyBusinesses(userLocation, distance)
                    }}
                    className="px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white text-xs sm:text-sm"
                  >
                    {DISTANCE_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                  <button
                    onClick={handleRefreshLocation}
                    className="p-1.5 sm:p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    title="Refresh location"
                  >
                    <FaSync className="text-gray-600 text-sm sm:text-base" />
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
            {locationError && viewMode === 'nearby' && (
              <div className="mb-3 p-2 sm:p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-xs sm:text-sm text-yellow-800">
                <FaMapMarkerAlt className="inline mr-2" />
                {locationError}
              </div>
            )}
            {manualLocation && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-lg text-xs sm:text-sm text-blue-700">
                <FaMapMarkerAlt className="text-blue-500" />
                <span>{manualLocation.label}</span>
                <button
                  onClick={clearManualLocation}
                  className="text-blue-600 hover:text-blue-700 font-medium text-xs sm:text-sm"
                >
                  Clear
                </button>
              </div>
            )}
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full sm:w-auto px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white text-sm"
            >
              {BUSINESS_TYPES.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>
        </div>

        {isLoading ? (
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
        ) : !hasResults ? (
          <div className="text-center py-8 sm:py-12 bg-white rounded-xl shadow-sm border border-gray-200 px-4">
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
                    className="w-full sm:w-auto px-4 py-2 text-primary-600 hover:text-primary-700 border border-primary-200 rounded-lg hover:bg-primary-50 text-sm sm:text-base"
                  >
                    Clear Search
                  </button>
                )}
                {viewMode === 'nearby' && businesses.length === 0 && (
                  <button
                    onClick={() => handleViewModeChange('all')}
                    className="w-full sm:w-auto px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm sm:text-base"
                  >
                    View All Businesses
                  </button>
                )}
              </div>
            )}
          </div>
        ) : (
          <>
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
                const formatLocation = () => {
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
                }

                const locationText = formatLocation()

                return (
                  <div
                    key={business.id || business._id}
                    className="bg-white rounded-xl sm:rounded-2xl shadow-md sm:shadow-lg border border-gray-100 overflow-hidden flex flex-col cursor-pointer"
                    style={{ minHeight: 'auto', maxHeight: 'none' }}
                    onClick={() => navigate(`/${business.businessLink}`)}
                  >
                    {/* Business Image - Hero Section */}
                    <div className="relative h-28 sm:h-32 md:h-36 lg:h-40 bg-gradient-to-br from-primary-50 via-primary-100 to-primary-200 overflow-hidden">
                      {business.images?.banner || business.images?.thumbnail ? (
                        <img
                          src={business.images.banner || business.images.thumbnail}
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
                        className={`w-full h-full flex items-center justify-center ${business.images?.banner || business.images?.thumbnail ? 'hidden' : 'flex'}`}
                      >
                        {business.images?.logo ? (
                          <img
                            src={business.images.logo}
                            alt={business.name}
                            className="max-w-[65%] max-h-[65%] object-contain"
                          />
                        ) : (
                          <FaCalendarAlt className="text-primary-400 text-3xl sm:text-4xl lg:text-6xl" />
                        )}
                      </div>

                      {/* Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent"></div>

                      {/* Type Badge - Top Left */}
                      {business.type && (
                        <div className="absolute top-1.5 left-1.5 sm:top-2 sm:left-2">
                          <span className="inline-block px-1.5 sm:px-2 py-0.5 sm:py-1 bg-primary-600/95 backdrop-blur-sm text-white rounded text-[10px] sm:text-xs font-semibold capitalize shadow-lg">
                            {business.type}
                          </span>
                        </div>
                      )}

                      {/* Distance Badge - Bottom Right (for nearby mode) */}
                      {viewMode === 'nearby' && business.distanceKm && (
                        <div className="absolute bottom-1.5 right-1.5 sm:bottom-2 sm:right-2">
                          <span className="inline-flex items-center gap-0.5 sm:gap-1 px-1.5 sm:px-2 py-0.5 sm:py-1 bg-white/95 backdrop-blur-sm text-gray-900 rounded text-[10px] sm:text-xs font-semibold shadow-lg border border-gray-200">
                            <FaLocationArrow className="text-primary-600 text-[10px] sm:text-xs" />
                            {business.distanceKm} km
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Business Info */}
                    <div className="p-2 sm:p-2.5 md:p-3 flex-1 flex flex-col">
                      {/* Title and Rating - Inline */}
                      <div className="mb-1.5">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-sm sm:text-base md:text-lg font-bold text-gray-900 line-clamp-1 flex-1">
                            {business.name}
                          </h3>
                          {business.ratings?.average > 0 && (
                            <div className="flex items-center gap-0.5 flex-shrink-0">
                              <FaStar className="text-yellow-500 text-xs sm:text-sm" />
                              <span className="text-gray-900 font-bold text-xs sm:text-sm">{business.ratings.average.toFixed(1)}</span>
                              {business.ratings.totalReviews > 0 && (
                                <span className="text-gray-500 text-[10px] sm:text-xs ml-0.5">({business.ratings.totalReviews})</span>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Description */}
                        {business.description && (
                          <p className="text-xs sm:text-sm text-gray-600 mb-1 line-clamp-2">
                            {business.description}
                          </p>
                        )}

                        {/* Location with icon */}
                        {locationText && (
                          <div className="flex items-center gap-1 text-gray-600 mb-1.5">
                            <FaMapMarkerAlt className="text-primary-500 text-[10px] sm:text-xs flex-shrink-0" />
                            <span className="text-xs sm:text-sm line-clamp-1">
                              {locationText}
                            </span>
                            {viewMode === 'nearby' && business.distanceKm && (
                              <span className="text-[10px] sm:text-xs text-gray-400 ml-0.5">• {business.distanceKm} km</span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Services and Features - Same Style for Mobile and Desktop */}
                      {(() => {
                        const servicesCount = business.services?.length || 0
                        const featuresCount = business.features?.length || 0
                        // Show the same number of items based on minimum count
                        const displayCount = servicesCount > 0 && featuresCount > 0
                          ? Math.min(servicesCount, featuresCount)
                          : 0

                        return (
                          <div className="grid grid-cols-2 gap-2 sm:gap-3 md:gap-4 mb-2 sm:mb-1.5">
                            {/* Services Section */}
                            <div className="flex flex-col min-w-0">
                              <div className="text-xs font-semibold text-gray-700 mb-1">Services:</div>
                              {displayCount > 0 ? (
                                <ul className="space-y-0.5">
                                  {business.services.slice(0, displayCount).map((service, idx) => (
                                    <li key={idx} className="flex items-start gap-1.5 text-xs text-gray-600 leading-tight">
                                      <span className="text-primary-500 mt-0.5 flex-shrink-0 text-xs">•</span>
                                      <span className="break-words flex-1">{service.name || service}</span>
                                    </li>
                                  ))}
                                </ul>
                              ) : (
                                <p className="text-xs text-gray-400 italic">No services listed</p>
                              )}
                            </div>

                            {/* Features Section */}
                            <div className="flex flex-col min-w-0">
                              <div className="text-xs font-semibold text-gray-700 mb-1">Features:</div>
                              {displayCount > 0 ? (
                                <ul className="space-y-0.5">
                                  {business.features.slice(0, displayCount).map((feature, idx) => (
                                    <li key={idx} className="flex items-start gap-1.5 text-xs text-gray-600 leading-tight">
                                      <FaCheckCircle className="text-green-500 text-[10px] mt-0.5 flex-shrink-0" />
                                      <span className="break-words flex-1">{feature}</span>
                                    </li>
                                  ))}
                                </ul>
                              ) : (
                                <p className="text-xs text-gray-400 italic">No features listed</p>
                              )}
                            </div>
                          </div>
                        )
                      })()}

                      {/* Action Buttons */}
                      <div className="space-y-1.5 pt-1.5 border-t border-gray-100">
                        {/* Primary Book Button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleBookAppointment(business.businessLink)
                          }}
                          className="w-full flex items-center justify-center gap-1.5 px-3 sm:px-4 py-2 bg-primary-600 text-white rounded-lg font-semibold shadow-md text-xs sm:text-sm transition-colors duration-200 hover:bg-primary-700"
                        >
                          <FaCalendarAlt className="text-xs" />
                          <span className="hidden sm:inline">Book Appointment</span>
                          <span className="sm:hidden">Book</span>
                        </button>

                        {/* Call and WhatsApp Buttons */}
                        <div className="grid grid-cols-2 gap-1.5">
                          {/* Call Button */}
                          {business.phone && (
                            <a
                              href={`tel:${business.phone}`}
                              onClick={(e) => e.stopPropagation()}
                              className="flex items-center justify-center gap-1 px-2 sm:px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg border border-blue-200 font-medium text-[10px] sm:text-xs transition-colors duration-200 hover:bg-blue-100 hover:border-blue-300"
                            >
                              <FaPhone className="text-[10px]" />
                              <span>Call</span>
                            </a>
                          )}

                          {/* WhatsApp Button */}
                          {whatsappUrl && (
                            <a
                              href={whatsappUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="flex items-center justify-center gap-1 px-2 sm:px-3 py-1.5 bg-green-50 text-green-700 rounded-lg border border-green-200 font-medium text-[10px] sm:text-xs transition-colors duration-200 hover:bg-green-100 hover:border-green-300"
                            >
                              <FaWhatsapp className="text-[10px]" />
                              <span className="hidden sm:inline">WhatsApp</span>
                              <span className="sm:hidden">WA</span>
                            </a>
                          )}
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
            {FEATURES.map((feature, idx) => {
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

      {showLocationFallbackModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-gray-900/60">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-6 sm:p-7">
            <div className="flex items-start gap-3 sm:gap-4 mb-4">
              <div className="flex items-center justify-center h-11 w-11 rounded-full bg-primary-50 text-primary-600">
                <FaMapMarkerAlt className="text-lg" />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900">No nearby businesses found</h3>
                <p className="text-sm sm:text-base text-gray-600 mt-1">
                  Choose a location manually or view all available businesses across the platform.
                </p>
              </div>
            </div>
            <div className="space-y-3">
              <button
                onClick={handleOpenManualLocationModal}
                className="w-full px-4 py-3 rounded-xl border border-primary-200 bg-primary-50 text-primary-700 font-semibold hover:bg-primary-100 transition-colors flex items-center justify-center gap-2"
              >
                <FaMapMarkerAlt className="text-sm" />
                Choose location manually
              </button>
              <button
                onClick={handleViewAllFromFallback}
                className="w-full px-4 py-3 rounded-xl bg-primary-600 text-white font-semibold hover:bg-primary-700 transition-colors flex items-center justify-center gap-2"
              >
                <FaSearch className="text-sm" />
                See all businesses
              </button>
              <button
                onClick={() => {
                  setShowLocationFallbackModal(false)
                  setHasShownFallback(false)
                }}
                className="w-full px-4 py-2 rounded-xl text-sm text-gray-500 hover:text-gray-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {manualLocationModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-gray-900/60">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl p-6 sm:p-7">
            <div className="flex items-start justify-between gap-3 mb-4">
              <div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900">Select a location</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Pick a city to explore businesses available for online booking.
                </p>
              </div>
              <button
                onClick={() => setManualLocationModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Close"
              >
                <FaTimes className="text-base" />
              </button>
            </div>
            <div className="mb-4">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                <input
                  type="text"
                  value={manualLocationSearch}
                  onChange={(e) => setManualLocationSearch(e.target.value)}
                  placeholder="Search city or state"
                  className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                />
              </div>
            </div>
            <div className="max-h-64 overflow-y-auto pr-1">
              {manualLocationSearch.trim().length >= 2 ? (
                manualLocationSuggestionsLoading ? (
                  <div className="flex items-center justify-center py-8 text-primary-600">
                    <FaSpinner className="animate-spin text-xl" />
                  </div>
                ) : manualLocationSuggestions.length > 0 ? (
                  <div className="space-y-2">
                    {manualLocationSuggestions.map((suggestion) => (
                      <button
                        key={`${suggestion.city}-${suggestion.state}-${suggestion.latitude}-${suggestion.longitude}`}
                        onClick={() => handleManualLocationSelect(suggestion)}
                        className="w-full px-3 py-3 rounded-xl border border-gray-200 hover:border-primary-300 hover:bg-primary-50 text-left transition-colors flex items-center gap-3"
                      >
                        <div className="h-10 w-10 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center">
                          <FaMapMarkerAlt className="text-base" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{suggestion.city}</p>
                          {(suggestion.state || suggestion.country) && (
                            <p className="text-xs text-gray-500">
                              {[suggestion.state, suggestion.country].filter(Boolean).join(', ')}
                            </p>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center text-gray-500 text-sm">
                    {manualLocationSearchError || 'No matching locations found. Try a different search.'}
                  </div>
                )
              ) : manualLocationLoading ? (
                <div className="flex items-center justify-center py-8 text-primary-600">
                  <FaSpinner className="animate-spin text-xl" />
                </div>
              ) : filteredManualLocationOptions.length === 0 ? (
                <div className="py-8 text-center text-gray-500 text-sm">
                  No saved locations available yet. Start typing to search any Indian city.
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredManualLocationOptions.slice(0, 20).map((option) => (
                    <button
                      key={option.label}
                      onClick={() => handleManualLocationSelect(option)}
                      className="w-full px-3 py-3 rounded-xl border border-gray-200 hover:border-primary-300 hover:bg-primary-50 text-left transition-colors flex items-center gap-3"
                    >
                      <div className="h-10 w-10 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center">
                        <FaMapMarkerAlt className="text-base" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{option.city}</p>
                        {option.state && <p className="text-xs text-gray-500">{option.state}</p>}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="mt-5 flex justify-end">
              <button
                onClick={() => setManualLocationModalOpen(false)}
                className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Home
