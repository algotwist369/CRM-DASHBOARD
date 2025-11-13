import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import {
  FaSearch,
  FaSpinner,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaPhone,
  FaArrowRight,
  FaClock,
  FaUsers,
  FaStar,
  FaEnvelope,
  FaGlobe,
  FaCheckCircle,
  FaTag,
  FaFacebook,
  FaInstagram,
  FaTwitter,
  FaWhatsapp,
  FaExternalLinkAlt,
  FaLocationArrow,
  FaMapPin,
  FaSync,
  FaChevronLeft,
  FaChevronRight
} from 'react-icons/fa'
import apiClient from '../../../services/api/client'

// Cache utility functions
const CACHE_KEYS = {
  LOCATION: 'business_location_cache',
  NEARBY_BUSINESSES: 'nearby_businesses_cache',
  ALL_BUSINESSES: 'all_businesses_cache'
}

const CACHE_DURATION = {
  LOCATION: 24 * 60 * 60 * 1000, // 24 hours
  BUSINESSES: 5 * 60 * 1000 // 5 minutes
}

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

  // Get user location
  const getUserLocation = useCallback(() => {
    return new Promise((resolve, reject) => {
      // Check cache first
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
          let errorMessage = 'Unable to get your location'
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Location permission denied. Please enable location access.'
              break
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Location information unavailable.'
              break
            case error.TIMEOUT:
              errorMessage = 'Location request timed out.'
              break
          }
          setLocationError(errorMessage)
          reject(new Error(errorMessage))
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        }
      )
    })
  }, [])

  // Fetch all businesses
  const fetchBusinesses = useCallback(async () => {
    try {
      setLoading(true)
      
      // Check cache first
      const cacheKey = `${CACHE_KEYS.ALL_BUSINESSES}_${filterType}_${searchTerm}`
      const cached = getCachedData(cacheKey)
      if (cached) {
        setBusinesses(cached)
        setLoading(false)
        return
      }

      const params = {
        page: 1,
        limit: 20,
        ...(filterType && { type: filterType }),
        ...(searchTerm.trim() && { search: searchTerm.trim() })
      }
      
      const response = await apiClient.get('/business/public/list', { params })
      
      if (response.data.success) {
        const businessList = response.data.data || []
        setBusinesses(businessList)
        setCachedData(cacheKey, businessList)
      } else {
        setBusinesses([])
      }
    } catch (error) {
      console.error('Failed to fetch businesses:', error)
      setBusinesses([])
    } finally {
      setLoading(false)
    }
  }, [filterType, searchTerm])

  // Fetch nearby businesses
  const fetchNearbyBusinesses = useCallback(async (location, distance = maxDistance) => {
    try {
      setNearbyLoading(true)
      
      // Check cache first
      const cacheKey = `${CACHE_KEYS.NEARBY_BUSINESSES}_${location.lat}_${location.lng}_${distance}_${filterType}`
      const cached = getCachedData(cacheKey)
      if (cached) {
        setBusinesses(cached)
        setNearbyLoading(false)
        return
      }

      const params = {
        lat: location.lat,
        lng: location.lng,
        maxDistance: distance,
        page: 1,
        limit: 20,
        ...(filterType && { type: filterType })
      }
      
      const response = await apiClient.get('/business/public/nearby', { params })
      
      if (response.data.success) {
        const businessList = response.data.data || []
        // Results are already sorted by distance from backend, but ensure consistency
        businessList.sort((a, b) => (a.distance || 0) - (b.distance || 0))
        setBusinesses(businessList)
        setCachedData(cacheKey, businessList)
        
        // Show info if no results found
        if (businessList.length === 0) {
          toast(`No businesses found within ${maxDistance / 1000}km. Try increasing the search radius.`, {
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
          fetchBusinesses()
        } else {
          toast.error(errorMessage)
        }
      }
    } catch (error) {
      console.error('Failed to fetch nearby businesses:', error)
      setBusinesses([])
      
      // Handle specific error responses
      if (error.response?.data) {
        const errorData = error.response.data
        const errorCode = errorData.code || 'UNKNOWN_ERROR'
        
        if (errorCode === 'GEOSPATIAL_ERROR' || errorCode === 'GEOSPATIAL_SERVICE_UNAVAILABLE') {
          toast.error('Location search is temporarily unavailable. Showing all businesses instead.')
          setViewMode('all')
          fetchBusinesses()
        } else {
          toast.error(errorData.message || 'Failed to fetch nearby businesses')
        }
      } else {
        toast.error('Network error. Please check your connection and try again.')
      }
    } finally {
      setNearbyLoading(false)
    }
  }, [maxDistance, filterType, fetchBusinesses])

  // Initial load - fetch all businesses on mount
  useEffect(() => {
    if (viewMode === 'all') {
      fetchBusinesses()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Initialize location and fetch businesses
  useEffect(() => {
    const initializeLocation = async () => {
      try {
        const location = await getUserLocation()
        setUserLocation(location)
        if (viewMode === 'nearby') {
          await fetchNearbyBusinesses(location)
        }
      } catch (err) {
        console.error('Location error:', err)
        // If location fails, fall back to all businesses
        if (viewMode === 'nearby') {
          setViewMode('all')
          toast.error('Unable to get location. Showing all businesses instead.')
        }
      }
    }

    if (viewMode === 'nearby' && !userLocation) {
      initializeLocation()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewMode])

  // Filter businesses by search term (client-side for nearby mode)
  const filteredBusinesses = React.useMemo(() => {
    if (!searchTerm.trim()) return businesses
    
    const searchLower = searchTerm.toLowerCase().trim()
    return businesses.filter(business => {
      const nameMatch = business.name?.toLowerCase().includes(searchLower)
      const branchMatch = business.branch?.toLowerCase().includes(searchLower)
      const cityMatch = business.city?.toLowerCase().includes(searchLower)
      const addressMatch = business.address?.toLowerCase().includes(searchLower)
      const categoryMatch = business.category?.toLowerCase().includes(searchLower)
      const tagsMatch = business.tags?.some(tag => tag.toLowerCase().includes(searchLower))
      
      return nameMatch || branchMatch || cityMatch || addressMatch || categoryMatch || tagsMatch
    })
  }, [businesses, searchTerm])

  // Fetch businesses when view mode, search, or filter changes
  useEffect(() => {
    const timer = setTimeout(() => {
      if (viewMode === 'all') {
        fetchBusinesses()
      } else if (viewMode === 'nearby' && userLocation) {
        fetchNearbyBusinesses(userLocation)
      }
    }, 500) // 500ms debounce

    return () => clearTimeout(timer)
  }, [filterType, viewMode, userLocation, fetchBusinesses, fetchNearbyBusinesses])

  // Handle view mode change
  const handleViewModeChange = async (mode) => {
    setViewMode(mode)
    if (mode === 'nearby') {
      if (!userLocation) {
        try {
          const location = await getUserLocation()
          setUserLocation(location)
          await fetchNearbyBusinesses(location)
        } catch (err) {
          console.error('Location access error:', err)
          toast.error('Unable to get location. Please enable location access.')
          setViewMode('all')
          fetchBusinesses()
        }
      } else {
        await fetchNearbyBusinesses(userLocation)
      }
    } else {
      fetchBusinesses()
    }
  }

  // Handle refresh location
  const handleRefreshLocation = async () => {
    try {
      // Clear location cache
      localStorage.removeItem(CACHE_KEYS.LOCATION)
      const location = await getUserLocation()
      setUserLocation(location)
      if (viewMode === 'nearby') {
        await fetchNearbyBusinesses(location)
      }
      toast.success('Location updated')
    } catch (err) {
      console.error('Location refresh error:', err)
      toast.error('Failed to refresh location')
    }
  }

  const handleDirectBooking = (e) => {
    e.preventDefault()
    const link = searchTerm.trim()
    if (link) {
      navigate(`/${link}`)
    } else {
      toast.error('Please enter a business link')
    }
  }

  const handleBookAppointment = (businessLink) => {
    if (businessLink) {
      navigate(`/book/${businessLink}/services`)
    } else {
      toast.error('Business link not available')
    }
  }

  const collectBusinessImages = useCallback((business) => {
    if (!business?.images) return []
    const images = []
    if (business.images.banner) images.push(business.images.banner)
    if (business.images.thumbnail) images.push(business.images.thumbnail)
    if (business.images.logo) images.push(business.images.logo)
    if (Array.isArray(business.images.gallery)) {
      business.images.gallery.forEach((img) => {
        if (img) images.push(img)
      })
    }
    return images
  }, [])

  const handleCardImageChange = useCallback((businessKey, direction, total) => {
    if (total <= 1) return
    setCardImageIndexes((prev) => {
      const current = prev[businessKey] ?? 0
      const nextIndex =
        direction === 'prev'
          ? (current - 1 + total) % total
          : (current + 1) % total
      return {
        ...prev,
        [businessKey]: nextIndex
      }
    })
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
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
            
            {/* Direct Booking Input */}
            <form onSubmit={handleDirectBooking} className="max-w-2xl mx-auto px-2">
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <div className="flex-1 relative">
                  <FaSearch className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm sm:text-base" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search businesses or enter business link..."
                    className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-3 sm:py-4 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-white text-sm sm:text-base lg:text-lg"
                  />
                </div>
                <button
                  type="submit"
                  className="px-6 sm:px-8 py-3 sm:py-4 bg-white text-primary-600 rounded-lg font-semibold hover:bg-primary-50 transition-colors flex items-center justify-center gap-2 text-sm sm:text-base lg:text-lg whitespace-nowrap"
                >
                  <FaCalendarAlt />
                  <span className="hidden sm:inline">Book Now</span>
                  <span className="sm:hidden">Book</span>
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
              <div className="flex items-center gap-1 sm:gap-2 bg-gray-100 rounded-lg p-0.5 sm:p-1">
                <button
                  onClick={() => handleViewModeChange('all')}
                  className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-md text-xs sm:text-sm font-medium transition-colors ${
                    viewMode === 'all'
                      ? 'bg-white text-primary-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => handleViewModeChange('nearby')}
                  disabled={locationLoading}
                  className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-md text-xs sm:text-sm font-medium transition-colors flex items-center gap-1 sm:gap-2 ${
                    viewMode === 'nearby'
                      ? 'bg-white text-primary-600 shadow-sm'
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
                    fetchNearbyBusinesses(userLocation, Number(e.target.value))
                  }}
                  className="px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white text-xs sm:text-sm"
                >
                  <option value={2000}>2 km</option>
                  <option value={5000}>5 km</option>
                  <option value={10000}>10 km</option>
                  <option value={20000}>20 km</option>
                  <option value={50000}>50 km</option>
                </select>
              )}

              {/* Refresh Location Button */}
              {viewMode === 'nearby' && userLocation && (
                <button
                  onClick={handleRefreshLocation}
                  className="p-1.5 sm:p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
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
                <div className="mb-3 p-2 sm:p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-xs sm:text-sm text-yellow-800">
                  <FaMapMarkerAlt className="inline mr-2" />
                  {locationError}
                </div>
              )}
            </div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full sm:w-auto px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white text-sm"
            >
              <option value="">All Types</option>
              <option value="salon">Salon</option>
              <option value="spa">Spa</option>
              <option value="hotel">Hotel</option>
              <option value="restaurant">Restaurant</option>
              <option value="retail">Retail</option>
              <option value="gym">Gym</option>
              <option value="clinic">Clinic</option>
              <option value="cafe">Cafe</option>
              <option value="studio">Studio</option>
              <option value="education">Education</option>
              <option value="automotive">Automotive</option>
              <option value="others">Others</option>
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
              
               const businessKey = business.id || business._id || business.businessLink
               const cardImages = collectBusinessImages(business)
               const totalImages = cardImages.length
               const currentImageIndex = cardImageIndexes[businessKey] ?? 0
               const currentImage = cardImages[currentImageIndex] || null
               const desktopImage = cardImages[0] || null

              return (
              <div
                key={business.id || business._id}
                className="bg-white rounded-xl sm:rounded-2xl shadow-md sm:shadow-lg border border-gray-100 overflow-hidden cursor-pointer"
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
                        <span className="inline-block px-1.5 py-0.5 bg-primary-600/95 text-white rounded text-[10px] font-semibold capitalize shadow-md">
                          {business.type}
                        </span>
                      </div>
                    )}

                    {viewMode === 'nearby' && business.distanceKm && (
                      <div className="absolute bottom-1.5 right-1.5">
                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-white/95 text-gray-900 rounded text-[10px] font-semibold shadow-md border border-gray-200">
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
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleBookAppointment(business.businessLink)
                          }}
                          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-primary-600 text-white rounded-lg font-semibold shadow-md text-xs transition-colors duration-200 hover:bg-primary-700"
                        >
                          <FaCalendarAlt className="text-xs" />
                          <span>Book</span>
                        </button>

                        {business.phone && (
                          <a
                            href={`tel:${business.phone}`}
                            onClick={(e) => e.stopPropagation()}
                            className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 bg-blue-50 text-blue-700 rounded-lg border border-blue-200 font-medium text-[10px] transition-colors duration-200 hover:bg-blue-100 hover:border-blue-300"
                          >
                            <FaPhone className="text-[10px]" />
                            <span>Phone</span>
                          </a>
                        )}

                        {whatsappUrl && (
                          <a
                            href={whatsappUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 bg-green-50 text-green-700 rounded-lg border border-green-200 font-medium text-[10px] transition-colors duration-200 hover:bg-green-100 hover:border-green-300"
                          >
                            <FaWhatsapp className="text-[10px]" />
                            <span>WhatsApp</span>
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Desktop & Tablet Layout */}
                <div className="hidden sm:flex sm:flex-col h-full">
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
                        <span className="inline-block px-2 py-1 bg-primary-600/95 text-white rounded text-xs font-semibold capitalize shadow-lg">
                          {business.type}
                        </span>
                      </div>
                    )}

                    {viewMode === 'nearby' && business.distanceKm && (
                      <div className="absolute bottom-2 right-2">
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-white/95 text-gray-900 rounded text-xs font-semibold shadow-lg border border-gray-200">
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
                      const servicesCount = business.services?.length || 0
                      const featuresCount = business.features?.length || 0
                      const displayCount = servicesCount > 0 && featuresCount > 0
                        ? Math.min(servicesCount, featuresCount)
                        : 0

                      return (
                        <div className="grid grid-cols-2 gap-3 md:gap-4 mb-2">
                          <div className="flex flex-col min-w-0">
                            <div className="text-xs font-semibold text-gray-700 mb-1">Services:</div>
                            {displayCount > 0 ? (
                              <ul className="space-y-1">
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

                          <div className="flex flex-col min-w-0">
                            <div className="text-xs font-semibold text-gray-700 mb-1">Features:</div>
                            {displayCount > 0 ? (
                              <ul className="space-y-1">
                                {business.features.slice(0, displayCount).map((feature, idx) => (
                                  <li key={idx} className="flex items-start gap-1.5 text-xs text-gray-600 leading-tight">
                                    <FaCheckCircle className="text-green-500 text-[11px] mt-0.5 flex-shrink-0" />
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

                    <div className="mt-auto space-y-1.5 pt-2 border-t border-gray-100">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleBookAppointment(business.businessLink)
                        }}
                        className="w-full flex items-center justify-center gap-1.5 px-4 py-2 bg-primary-600 text-white rounded-lg font-semibold shadow-md text-sm transition-colors duration-200 hover:bg-primary-700"
                      >
                        <FaCalendarAlt className="text-sm" />
                        <span>Book Appointment</span>
                      </button>

                      <div className="grid grid-cols-2 gap-1.5">
                        {business.phone && (
                          <a
                            href={`tel:${business.phone}`}
                            onClick={(e) => e.stopPropagation()}
                            className="flex items-center justify-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg border border-blue-200 font-medium text-xs transition-colors duration-200 hover:bg-blue-100 hover:border-blue-300"
                          >
                            <FaPhone className="text-xs" />
                            <span>Call</span>
                          </a>
                        )}

                        {whatsappUrl && (
                          <a
                            href={whatsappUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="flex items-center justify-center gap-1 px-3 py-1.5 bg-green-50 text-green-700 rounded-lg border border-green-200 font-medium text-xs transition-colors duration-200 hover:bg-green-100 hover:border-green-300"
                          >
                            <FaWhatsapp className="text-xs" />
                            <span>WhatsApp</span>
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )})}
            </div>
          </>
        )}
      </div>

      {/* Features Section */}
      <div className="bg-white border-t border-gray-200 py-8 sm:py-10 lg:py-12">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 text-center">
            <div className="px-2">
              <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <FaCalendarAlt className="text-primary-600 text-xl sm:text-2xl" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-1 sm:mb-2">Easy Booking</h3>
              <p className="text-sm sm:text-base text-gray-600">
                Book appointments in just a few clicks with our simple and intuitive interface
              </p>
            </div>
            <div className="px-2">
              <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <FaClock className="text-primary-600 text-xl sm:text-2xl" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-1 sm:mb-2">Real-Time Availability</h3>
              <p className="text-sm sm:text-base text-gray-600">
                See available time slots in real-time and book instantly
              </p>
            </div>
            <div className="px-2">
              <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <FaUsers className="text-primary-600 text-xl sm:text-2xl" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-1 sm:mb-2">Verified Businesses</h3>
              <p className="text-sm sm:text-base text-gray-600">
                Connect with trusted and verified businesses in your area
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home
