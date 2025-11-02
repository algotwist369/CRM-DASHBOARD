import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import {
  FaSearch,
  FaSpinner,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaPhone,
  FaEnvelope,
  FaArrowRight,
  FaClock,
  FaUsers
} from 'react-icons/fa'
import apiClient from '../../../services/api/client'

const Home = () => {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [businesses, setBusinesses] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterType, setFilterType] = useState('')

  const fetchBusinesses = async () => {
    try {
      setLoading(true)
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
      } else {
        setBusinesses([])
      }
    } catch (error) {
      console.error('Failed to fetch businesses:', error)
      setBusinesses([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Debounce search and filter changes
    const timer = setTimeout(() => {
      fetchBusinesses()
    }, 500) // 500ms debounce

    return () => clearTimeout(timer)
  }, [searchTerm, filterType])

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
      navigate(`/${businessLink}`)
    } else {
      toast.error('Business link not available')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary-600 to-primary-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4">
              Book Your Appointment
            </h1>
            <p className="text-xl sm:text-2xl text-primary-100 mb-8 max-w-2xl mx-auto">
              Find and book appointments with your favorite businesses instantly
            </p>
            
            {/* Direct Booking Input */}
            <form onSubmit={handleDirectBooking} className="max-w-2xl mx-auto">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search businesses or enter business link..."
                    className="w-full pl-12 pr-4 py-4 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-white text-lg"
                  />
                </div>
                <button
                  type="submit"
                  className="px-8 py-4 bg-white text-primary-600 rounded-lg font-semibold hover:bg-primary-50 transition-colors flex items-center justify-center gap-2 text-lg"
                >
                  <FaCalendarAlt />
                  Book Now
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Businesses Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">All Businesses</h2>
            <p className="text-gray-600">Browse and book appointments with available businesses</p>
          </div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">All Types</option>
            <option value="salon">Salon</option>
            <option value="spa">Spa</option>
            <option value="hotel">Hotel</option>
            <option value="restaurant">Restaurant</option>
            <option value="clinic">Clinic</option>
          </select>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <FaSpinner className="animate-spin text-primary-600 text-4xl" />
          </div>
        ) : businesses.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-200">
            <FaSearch className="mx-auto text-gray-400 text-4xl mb-4" />
            <p className="text-gray-600 text-lg mb-2">No businesses found</p>
            <p className="text-gray-500 text-sm">
              {searchTerm ? 'Try a different search term or clear filters' : 'No businesses are currently available for online booking'}
            </p>
            {searchTerm && (
              <button
                onClick={() => {
                  setSearchTerm('')
                  setFilterType('')
                  fetchBusinesses()
                }}
                className="mt-4 px-4 py-2 text-primary-600 hover:text-primary-700"
              >
                Clear Search
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {businesses.map((business) => (
              <div
                key={business.id || business._id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
              >
                {/* Business Image Placeholder */}
                <div className="h-48 bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
                  <FaCalendarAlt className="text-primary-600 text-5xl" />
                </div>

                {/* Business Info */}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-1">
                        {business.name}
                      </h3>
                      {business.branch && (
                        <p className="text-sm text-gray-600">{business.branch}</p>
                      )}
                      <div className="flex items-center gap-2 mt-2">
                        {business.type && (
                          <span className="inline-block px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-xs font-medium">
                            {business.type}
                          </span>
                        )}
                        {business.appointmentSettings?.allowOnlineBooking && (
                          <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                            Available
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Business Details */}
                  <div className="space-y-2 mb-4 text-sm text-gray-600">
                    {business.address && (
                      <div className="flex items-start gap-2">
                        <FaMapMarkerAlt className="text-gray-400 mt-1 flex-shrink-0" />
                        <span className="line-clamp-2">
                          {business.address}
                          {business.city && `, ${business.city}`}
                        </span>
                      </div>
                    )}
                    {business.phone && (
                      <div className="flex items-center gap-2">
                        <FaPhone className="text-gray-400 flex-shrink-0" />
                        <span>{business.phone}</span>
                      </div>
                    )}
                  </div>

                  {/* Description */}
                  {business.description && (
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                      {business.description}
                    </p>
                  )}

                  {/* Book Button */}
                  <button
                    onClick={() => handleBookAppointment(business.businessLink)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
                  >
                    Book Appointment
                    <FaArrowRight />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Features Section */}
      <div className="bg-white border-t border-gray-200 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaCalendarAlt className="text-primary-600 text-2xl" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Easy Booking</h3>
              <p className="text-gray-600">
                Book appointments in just a few clicks with our simple and intuitive interface
              </p>
            </div>
            <div>
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaClock className="text-primary-600 text-2xl" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Real-Time Availability</h3>
              <p className="text-gray-600">
                See available time slots in real-time and book instantly
              </p>
            </div>
            <div>
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaUsers className="text-primary-600 text-2xl" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Verified Businesses</h3>
              <p className="text-gray-600">
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
