import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import {
    FaSearch,
    FaMapMarkerAlt,
    FaSync,
    FaFilter,
    FaSpinner,
    FaCalendarAlt,
    FaWhatsapp
} from 'react-icons/fa'
import { IoMdCall } from 'react-icons/io'
import { apiClient } from '../../../services/api'
import leadService from '../../../services/public/leadService'
import { decryptPayload } from '../../../utils/encryption'
import BusinessCard from './BusinessCard'
import LocationPromptModal from './LocationPromptModal'
import SkeletonHome from './SkeletonHome'
import LazySection from '../../../components/common/LazySection/LazySection'

// Constants
const CACHE_KEYS = {
    LOCATION: 'business_location_cache_v2',
    NEARBY_BUSINESSES: 'nearby_businesses_cache_v2',
    ALL_BUSINESSES: 'all_businesses_cache_v2',
    LOCATION_PROMPT_SHOWN: 'location_prompt_shown'
}

const CACHE_DURATION = {
    LOCATION: 24 * 60 * 60 * 1000, // 24 hours
    BUSINESSES: 5 * 60 * 1000 // 5 minutes
}

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

const BusinessExplorer = () => {
    const navigate = useNavigate()
    const [businesses, setBusinesses] = useState([])
    const [loading, setLoading] = useState(true)
    const [filterType, setFilterType] = useState('')
    const [viewMode, setViewMode] = useState('all') // 'all' or 'nearby'
    const [userLocation, setUserLocation] = useState(null)
    const [locationLoading, setLocationLoading] = useState(false)
    const [locationError, setLocationError] = useState(null)
    const [maxDistance, setMaxDistance] = useState(5000) // Default 5km
    const [nearbyLoading, setNearbyLoading] = useState(false)
    const [showLocationPrompt, setShowLocationPrompt] = useState(false)
    const [isFilterOpen, setIsFilterOpen] = useState(false)

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

            // Check if user already has location cached
            const hasCachedLocation = getCachedData(CACHE_KEYS.LOCATION)

            // If prompt was shown or location is cached, don't show again
            if (promptShown || hasCachedLocation) {
                return
            }

            // Check if browser supports geolocation
            if (!navigator.geolocation) {
                return
            }

            // Check if permission was already granted
            try {
                if ('permissions' in navigator) {
                    const permission = await navigator.permissions.query({ name: 'geolocation' })
                    if (permission.state === 'granted') {
                        return
                    }
                }
            } catch (err) {
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

    // Get user location with retry mechanism and IP fallback
    const getUserLocation = useCallback((options = { enableHighAccuracy: true, timeout: 15000, maximumAge: 300000 }, isRetry = false) => {
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
                    if (options.enableHighAccuracy && !isRetry && (error.code === error.TIMEOUT || error.code === error.POSITION_UNAVAILABLE)) {
                        console.log('High accuracy location failed, retrying with low accuracy and cached positions...')
                        getUserLocation({ ...options, enableHighAccuracy: false, timeout: 30000, maximumAge: Infinity }, true)
                            .then(res => finish(res, true))
                            .catch(err => finish(err, false))
                        return
                    }

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
            const cacheKey = `${CACHE_KEYS.ALL_BUSINESSES}_${filterType}`
            const cached = getCachedData(cacheKey)
            if (cached) {
                setBusinesses(cached)
                setLoading(false)
                setNearbyLoading(false)
                fetchingRef.current = false
                return
            }

            if (abortControllerRef.current) {
                abortControllerRef.current.abort()
            }

            abortControllerRef.current = new AbortController()
            fetchingRef.current = true
            setLoading(true)
            setNearbyLoading(false)

            const params = {
                page: 1,
                limit: 20,
                ...(filterType && { type: filterType })
            }

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
                let businessList = [];

                // Decrypt payload if present
                if (response.data.payload) {
                    try {
                        const decryptedData = decryptPayload(response.data.payload) || {};
                        businessList = decryptedData.businesses || [];
                    } catch (e) {
                        console.error("Failed to decrypt businesses:", e);
                        toast.error("Security check failed");
                        businessList = [];
                    }
                } else {
                    businessList = response.data.data || [];
                }

                setBusinesses(businessList)
                setCachedData(cacheKey, businessList)
            } else {
                setBusinesses([])
            }
        } catch (error) {
            if (error.name === 'AbortError') return
            console.error('Failed to fetch businesses:', error)
            setBusinesses([])
        } finally {
            setLoading(false)
            fetchingRef.current = false
        }
    }, [filterType])

    // Fetch nearby businesses
    const fetchNearbyBusinesses = useCallback(async (location, distance = maxDistance) => {
        if (!location || !location.lat || !location.lng) return

        try {
            const cacheKey = `${CACHE_KEYS.NEARBY_BUSINESSES}_${location.lat}_${location.lng}_${distance}_${filterType}`
            const cached = getCachedData(cacheKey)
            if (cached) {
                setBusinesses(cached)
                setLoading(false)
                setNearbyLoading(false)
                fetchingRef.current = false
                return
            }

            if (abortControllerRef.current) {
                abortControllerRef.current.abort()
            }

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
                businessList.sort((a, b) => (a.distance || 0) - (b.distance || 0))
                setBusinesses(businessList)
                setCachedData(cacheKey, businessList)

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
            if (error.name === 'AbortError') return

            console.error('Failed to fetch nearby businesses:', error)
            setBusinesses([])

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

    // Initialize location for nearby mode
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
                    setViewMode('all')
                    toast.error('Unable to get location. Showing all businesses instead.')
                } finally {
                    setLocationLoading(false)
                }
            }
        }

        initializeLocation()
    }, [viewMode, userLocation, locationLoading, getUserLocation])

    // Fetch businesses effect
    useEffect(() => {
        const abortController = abortControllerRef.current
        return () => {
            if (abortController) abortController.abort()
        }
    }, [])

    useEffect(() => {
        if (viewMode === 'nearby' && locationLoading) return

        if (abortControllerRef.current) abortControllerRef.current.abort()
        fetchingRef.current = false
        lastFetchParamsRef.current = ''

        if (viewMode === 'all') {
            fetchBusinesses()
        } else if (viewMode === 'nearby' && userLocation) {
            fetchNearbyBusinesses(userLocation, maxDistance)
        }
    }, [viewMode, filterType, userLocation, maxDistance, locationLoading, fetchBusinesses, fetchNearbyBusinesses])

    const handleViewModeChange = useCallback(async (mode) => {
        setViewMode(mode)
    }, [])

    const handleAllowLocation = useCallback(async () => {
        setShowLocationPrompt(false)
        localStorage.setItem(CACHE_KEYS.LOCATION_PROMPT_SHOWN, 'true')

        try {
            setLocationLoading(true)
            const location = await getUserLocation()
            setUserLocation(location)
            toast.success('Location enabled! You can now see nearby businesses.')
            setViewMode('nearby')
        } catch (err) {
            console.error('Location error:', err)
            setLocationError(err.message || 'Unable to get location')
            toast.error('Unable to get location. You can still browse all businesses.')
        } finally {
            setLocationLoading(false)
        }
    }, [getUserLocation])

    const handleDenyLocation = useCallback(() => {
        setShowLocationPrompt(false)
        localStorage.setItem(CACHE_KEYS.LOCATION_PROMPT_SHOWN, 'true')
    }, [])

    const handleRefreshLocation = useCallback(async () => {
        try {
            localStorage.removeItem(CACHE_KEYS.LOCATION)
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

    const handleBookAppointment = useCallback((businessLink) => {
        if (businessLink) {
            navigate(`/book/${businessLink}/services`)
        } else {
            toast.error('Business link not available')
        }
    }, [navigate])

    const formatLocation = useCallback((business) => {
        if (business.address) {
            const addressParts = business.address.split(',').map(part => part.trim()).filter(part => part.length > 0)
            if (addressParts.length >= 2) {
                const area = addressParts.length > 2 ? addressParts[addressParts.length - 2] : addressParts[0]
                const city = addressParts[addressParts.length - 1]
                return `${area}, ${city}`
            }
            if (business.city) return `${business.address}, ${business.city}`
            return business.address
        }
        if (business.area && business.city) return `${business.area}, ${business.city}`
        if (business.city && business.state) return `${business.city}, ${business.state}`
        if (business.city) return business.city
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
                onClick: () => leadService.trackClick(business._id, 'call', 'home_page'),
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
                onClick: () => leadService.trackClick(business._id, 'whatsapp', 'home_page'),
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
                onClick: () => leadService.trackClick(business._id, 'call', 'home_page'),
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
                onClick: () => leadService.trackClick(business._id, 'whatsapp', 'home_page'),
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


    return (
        <div className="max-w-7xl mx-auto px-3 xs:px-4 sm:px-6 lg:px-8 py-6 xs:py-8 sm:py-12">
            <div className="mb-5 xs:mb-6 sm:mb-8">
                {/* View Mode Toggle */}
                <div className="mb-4 sm:mb-6">
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
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

                        {viewMode === 'nearby' && userLocation && (
                            <button
                                onClick={handleRefreshLocation}
                                className="p-2 border border-gray-300 rounded-lg min-h-[40px] min-w-[40px] flex items-center justify-center hover:bg-gray-50"
                                aria-label="Refresh location"
                            >
                                <FaSync className="text-gray-600 text-sm" />
                            </button>
                        )}

                        <button
                            onClick={() => setIsFilterOpen((prev) => !prev)}
                            className="ml-auto p-2 border border-gray-300 rounded-lg min-h-[40px] min-w-[40px]
                flex items-center justify-center hover:bg-gray-50 transition"
                            aria-label="Filter"
                        >
                            <FaFilter className="text-gray-700 text-sm" />
                        </button>
                    </div>

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
                <SkeletonHome />
            ) : businesses.length === 0 ? (
                <div className="text-center py-8 xs:py-10 sm:py-12 bg-white border border-gray-200 rounded-lg px-4 xs:px-6">
                    <FaSearch className="mx-auto text-gray-400 text-3xl xs:text-3xl sm:text-4xl mb-3 xs:mb-3 sm:mb-4" />
                    <p className="text-gray-600 text-base xs:text-base sm:text-lg mb-2 font-semibold">No businesses found</p>
                    <p className="text-gray-500 text-xs xs:text-sm sm:text-sm leading-relaxed max-w-md mx-auto">
                        {viewMode === 'nearby' && businesses.length === 0 ? `No businesses found within ${(maxDistance / 1000).toFixed(0)}km. Try increasing the distance or switch to "All Businesses".`
                            : 'No businesses are currently available for online booking'}
                    </p>
                    {(viewMode === 'nearby' && businesses.length === 0) && (
                        <div className="mt-5 xs:mt-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-2.5 xs:gap-3 sm:gap-3 max-w-md mx-auto">
                            <button
                                onClick={() => handleViewModeChange('all')}
                                className="w-full sm:w-auto px-4 xs:px-5 py-2.5 xs:py-3 bg-primary-600 text-white border-0 rounded-lg hover:bg-primary-700 active:bg-primary-800 text-sm xs:text-sm sm:text-base font-medium min-h-[44px] touch-manipulation transition-all duration-200"
                            >
                                View All Businesses
                            </button>
                        </div>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 xs:gap-4 sm:gap-4 lg:gap-6">
                    {businesses.map((business) => (
                        <LazySection
                            key={business.id || business._id}
                            fallback={
                                <div className="bg-white border border-gray-100 rounded-lg overflow-hidden animate-pulse">
                                    <div className="aspect-square bg-gray-200"></div>
                                    <div className="p-3 space-y-2">
                                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                                        <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                                    </div>
                                </div>
                            }
                            threshold={0.1}
                        >
                            <BusinessCard
                                business={business}
                                viewMode={viewMode}
                                formatLocation={formatLocation}
                                onBookAppointment={handleBookAppointment}
                                getMobileActionButtons={getMobileActionButtons}
                                getDesktopActionButtons={getDesktopActionButtons}
                            />
                        </LazySection>
                    ))}
                </div>
            )}

            {showLocationPrompt && (
                <LocationPromptModal
                    onAllow={handleAllowLocation}
                    onDeny={handleDenyLocation}
                    loading={locationLoading}
                />
            )}
        </div>
    )
}

export default BusinessExplorer
