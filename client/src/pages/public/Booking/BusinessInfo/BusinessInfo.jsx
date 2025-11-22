import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import {
  FaSpinner,
  FaMapMarkerAlt,
  FaPhone,
  FaEnvelope,
  FaGlobe,
  FaClock,
  FaArrowRight,
  FaCheckCircle,
  FaExclamationCircle,
  FaStar,
  FaCalendarAlt,
  FaWhatsapp,
  FaFacebook,
  FaInstagram,
  FaTwitter,
  FaUsers,
  FaTag,
  FaArrowLeft,
  FaChevronLeft,
  FaChevronRight
} from 'react-icons/fa'
import appointmentService from '../../../../services/public/appointmentService'
import { usePageTitle } from '../../../../hooks/usePageTitle'

const DEFAULT_STAFF_MEMBERS = [
  { name: 'Aditya Sinha', role: 'Stylist', specialization: 'Threading' },
  { name: 'Pooja Agarwal', role: 'Stylist', specialization: 'Makeup' },
  { name: 'Yash Chopra', role: 'Stylist', specialization: 'Hair Treatment' },
  { name: 'Vedant Singh', role: 'Therapist', specialization: 'Hair Coloring' },
  { name: 'Anjali Reddy', role: 'Receptionist', specialization: 'Hair Styling' }
]

const BusinessInfo = () => {
  const navigate = useNavigate()
  const { businessLink } = useParams()
  const [loading, setLoading] = useState(true)
  const [business, setBusiness] = useState(null)
  const [error, setError] = useState(null)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  // Update page title based on business name
  usePageTitle(business ? `${business.name}${business.branch ? ` - ${business.branch}` : ''} - Booking App` : null)

  const fetchBusinessInfo = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const result = await appointmentService.getBusinessInfo(businessLink)

      if (result.success && result.data?.success) {
        const businessData = result.data.data
        setBusiness(businessData)
        sessionStorage.setItem('bookingBusiness', JSON.stringify(businessData))
      } else {
        setError(result.error || result.data?.message || 'Failed to fetch business information')
        toast.error(result.error || result.data?.message || 'Business not found')
      }
    } catch (error) {
      setError('Failed to load business information')
      toast.error('Failed to load business information')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }, [businessLink])

  useEffect(() => {
    if (businessLink) {
      fetchBusinessInfo()
    } else {
      setError('Invalid business link')
      setLoading(false)
    }
  }, [businessLink, fetchBusinessInfo])

  const handleBookNow = () => {
    if (business && business.services && business.services.length > 0) {
      // Clear previous booking data when starting a new booking
      sessionStorage.removeItem('selectedServices')
      sessionStorage.removeItem('selectedStaff')
      sessionStorage.removeItem('selectedDate')
      sessionStorage.removeItem('selectedTime')
      sessionStorage.removeItem('customerInfo')
      navigate(`/book/${businessLink}/services`)
    } else {
      toast.error('No services available for this business')
    }
  }

  const formatWorkingHours = (workingHours) => {
    if (!workingHours) return []

    // Backend structure: { open: "09:00", close: "18:00", days: ["monday", "tuesday", ...] }
    const { open, close, days } = workingHours

    // If no days array or no open/close times, return empty
    if (!days || !Array.isArray(days) || days.length === 0 || !open || !close) {
      return []
    }

    const allDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

    return allDays.map((dayKey, index) => {
      const isOpen = days.includes(dayKey)
      return {
        day: dayNames[index],
        hours: isOpen ? `${open} - ${close}` : 'Closed'
      }
    })
  }

  const whatsappNumber = business?.phone?.replace(/[^0-9]/g, '') || business?.socialMedia?.whatsapp?.replace(/[^0-9]/g, '') || ''
  const whatsappUrl = whatsappNumber ? `https://wa.me/${whatsappNumber}` : null

  // Collect all images for slider
  const getAllImages = () => {
    if (!business?.images) return []
    const images = []
    if (business.images.banner) images.push({ src: business.images.banner, type: 'Banner' })
    if (business.images.thumbnail) images.push({ src: business.images.thumbnail, type: 'Thumbnail' })
    if (business.images.logo) images.push({ src: business.images.logo, type: 'Logo' })
    if (Array.isArray(business.images.gallery)) {
      business.images.gallery.forEach(img => {
        if (img) images.push({ src: img, type: 'Gallery' })
      })
    }
    return images
  }

  const allImages = business ? getAllImages() : []

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % allImages.length)
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length)
  }

  // Get Google Maps embed URL
  const getGoogleMapsEmbedUrl = () => {
    if (!business?.googleMapsUrl && !business?.location) return null

    if (business.googleMapsUrl && business.googleMapsUrl.includes('embed')) {
      return business.googleMapsUrl
    }

    if (business.location?.coordinates) {
      const [lng, lat] = business.location.coordinates
      return `https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d12093.599315348!2d${lng}!3d${lat}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1sen!2sus!4v${Date.now()}!5m2!1sen!2sus`
    }

    if (business.googleMapsUrl) {
      const placeIdMatch = business.googleMapsUrl.match(/place\/([^/]+)/)
      const coordsMatch = business.googleMapsUrl.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/)

      if (placeIdMatch) {
        return `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3022!2d0!3d0!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s${placeIdMatch[1]}!2s!5e0!3m2!1sen!2sus!4v${Date.now()}!5m2!1sen!2sus`
      } else if (coordsMatch) {
        const lat = coordsMatch[1]
        const lng = coordsMatch[2]
        return `https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d12093.599315348!2d${lng}!3d${lat}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1sen!2sus!4v${Date.now()}!5m2!1sen!2sus`
      }
    }

    return null
  }

  const mapsEmbedUrl = business ? getGoogleMapsEmbedUrl() : null

  const renderBookingCard = () => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      {business.appointmentSettings?.allowOnlineBooking ? (
        <>
          <div className="flex items-center gap-2 text-green-600 mb-4">
            <FaCheckCircle />
            <span className="text-sm font-medium">Online Booking Available</span>
          </div>
          <button
            onClick={handleBookNow}
            disabled={!business.services || business.services.length === 0}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-xl font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed mb-4"
          >
            <FaCalendarAlt />
            Book Appointment
            <FaArrowRight />
          </button>
          {(!business.services || business.services.length === 0) && (
            <p className="text-xs text-gray-500 text-center">No services available</p>
          )}
        </>
      ) : (
        <div className="text-center py-4">
          <p className="text-sm text-gray-600 mb-4">Online booking is not available for this business.</p>
          <p className="text-xs text-gray-500">Please contact them directly.</p>
        </div>
      )}

      <div className="space-y-2 pt-4 border-t border-gray-200">
        {business.phone && (
          <a
            href={`tel:${business.phone}`}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-50 text-blue-700 rounded-xl border border-blue-200 font-medium text-sm"
          >
            <FaPhone className="text-sm" />
            Call Now
          </a>
        )}
        {whatsappUrl && (
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-green-50 text-green-700 rounded-xl border border-green-200 font-medium text-sm"
          >
            <FaWhatsapp className="text-sm" />
            WhatsApp
          </a>
        )}
      </div>
    </div>
  )

  const renderStaffCard = () => {
    const staffMembers = [
      { name: 'Aditya Sinha', role: 'Stylist', specialization: 'Threading' },
      { name: 'Pooja Agarwal', role: 'Stylist', specialization: 'Makeup' },
      { name: 'Yash Chopra', role: 'Stylist', specialization: 'Hair Treatment' },
      { name: 'Vedant Singh', role: 'Therapist', specialization: 'Hair Coloring' },
      { name: 'Anjali Reddy', role: 'Receptionist', specialization: 'Hair Styling' }
    ]

    return (
      <div className="p-4 border border-gray-200 rounded-lg bg-gray-50 space-y-4">
        <div className="space-y-1">
          <h2 className="text-lg font-bold text-gray-900">Our Team</h2>
          <p className="text-sm text-gray-500">Meet the experts ready to serve you</p>
        </div>
        <div className="space-y-3">
          {staffMembers.map((member, index) => (
            <div key={index} className="p-3 bg-white rounded-lg border border-gray-100 shadow-sm">
              <p className="text-sm font-semibold text-gray-900">{member.name}</p>
              <p className="text-[11px] text-primary-600 uppercase tracking-wide mt-1">{member.role}</p>
              <p className="text-xs text-gray-600 mt-1">
                Specializes in: <span className="font-medium text-gray-800">{member.specialization}</span>
              </p>
            </div>
          ))}
          <p className="text-xs text-gray-500 text-center">+3 more staff members</p>
        </div>
      </div>
    )
  }

  const renderFollowUsCard = () => {
    if (!business.socialMedia || !Object.values(business.socialMedia).some(Boolean)) {
      return null
    }

    const socialItems = [
      {
        key: 'facebook',
        icon: <FaFacebook />,
        label: 'Facebook',
        bg: 'bg-blue-600'
      },
      {
        key: 'instagram',
        icon: <FaInstagram />,
        label: 'Instagram',
        bg: 'bg-pink-600'
      },
      {
        key: 'twitter',
        icon: <FaTwitter />,
        label: 'Twitter',
        bg: 'bg-blue-400'
      },
      {
        key: 'whatsapp',
        icon: <FaWhatsapp />,
        label: 'WhatsApp',
        bg: 'bg-green-600',
        href: whatsappUrl
      }
    ]

    return (
      <div className="p-4 border border-gray-200 rounded-lg bg-gray-50 space-y-4">
        <div className="space-y-1">
          <h2 className="text-lg font-bold text-gray-900">Follow Us</h2>
          <p className="text-sm text-gray-500">Stay connected on social media</p>
        </div>
        <div className="flex items-center flex-wrap gap-3">
          {socialItems.map(({ key, icon, label, bg, href }) => {
            const link = href ?? business.socialMedia?.[key]
            if (!link) return null
            return (
              <a
                key={key}
                href={link}
                target="_blank"
                rel="noopener noreferrer"
                className={`w-12 h-12 flex items-center justify-center ${bg} text-white rounded-lg shadow-sm hover:opacity-90 transition`}
                aria-label={label}
              >
                {icon}
              </a>
            )
          })}
        </div>
      </div>
    )
  }

  const renderBookingInfoCard = () => {
    if (!business.appointmentSettings) return null

    const { slotDuration, advanceBookingDays, cancellationHours } = business.appointmentSettings

    if (!slotDuration && !advanceBookingDays && !cancellationHours) return null

    const infoItems = [
      slotDuration && { label: 'Slot Duration', value: `${slotDuration} min` },
      advanceBookingDays && { label: 'Advance Booking', value: `Up to ${advanceBookingDays} days` },
      cancellationHours && { label: 'Cancellation Notice', value: `${cancellationHours} hours` }
    ].filter(Boolean)

    return (
      <div className="p-4 border border-gray-200 rounded-lg bg-gray-50 space-y-4">
        <div className="space-y-1">
          <h2 className="text-lg font-bold text-gray-900">Booking Info</h2>
          <p className="text-sm text-gray-500">Plan your appointments with ease</p>
        </div>
        <div className="space-y-3">
          {infoItems.map((item, index) => (
            <div key={index} className="flex items-center justify-between bg-white border border-gray-100 rounded-lg px-4 py-3 shadow-sm">
              <span className="text-sm text-gray-600">{item.label}</span>
              <span className="text-sm font-semibold text-gray-900">{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    )
  }

  const renderCombinedSidebarCard = () => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6">
      {renderStaffCard()}
      {renderFollowUsCard()}
      {renderBookingInfoCard()}
    </div>
  )

  const renderHeroSidebarContent = () => (
    <div className="space-y-4">
      {renderBookingCard()}
      {renderCombinedSidebarCard()}
    </div>
  )

  const renderHeroSlider = () => (
    <div className="relative h-[40vh] sm:h-[45vh] lg:h-[50vh] rounded-3xl overflow-hidden bg-gray-200">
      {allImages.length > 0 ? (
        <>
          <img
            src={allImages[currentImageIndex].src}
            alt={`${business.name} - ${allImages[currentImageIndex].type}`}
            className="w-full h-full object-cover"
          />
          {allImages.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 bg-white/95 backdrop-blur-md p-3 sm:p-4 rounded-full shadow-xl text-gray-800 border border-gray-200 active:scale-95"
                aria-label="Previous image"
              >
                <FaChevronLeft className="text-base sm:text-lg" />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 bg-white/95 backdrop-blur-md p-3 sm:p-4 rounded-full shadow-xl text-gray-800 border border-gray-200 active:scale-95"
                aria-label="Next image"
              >
                <FaChevronRight className="text-base sm:text-lg" />
              </button>
            </>
          )}
        </>
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <FaCalendarAlt className="text-primary-400 text-6xl sm:text-8xl opacity-30" />
        </div>
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent pointer-events-none"></div>
      <div className="absolute inset-0 px-4 sm:px-6 lg:px-8 pb-6 sm:pb-8 flex items-end pointer-events-none">
        <div className="max-w-3xl w-full mx-auto text-center space-y-3 pointer-events-auto">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight">
            {business.name}
          </h1>
          {(fullAddress || business.ratings?.average > 0) && (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6 text-white">
              {fullAddress && (
                <div className="flex items-center gap-2 text-sm sm:text-base text-white/90">
                  <FaMapMarkerAlt className="text-lg" />
                  <span className="max-w-xl">{fullAddress}</span>
                </div>
              )}
              {business.ratings?.average > 0 && (
                <div className="flex items-center gap-2 text-sm sm:text-base">
                  <FaStar className="text-yellow-400 text-base sm:text-lg" />
                  <span className="font-semibold">{business.ratings.average.toFixed(1)}</span>
                  {business.ratings.totalReviews > 0 && (
                    <span className="text-white/80">({business.ratings.totalReviews})</span>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <FaSpinner className="animate-spin mx-auto text-primary-600 text-4xl mb-4" />
          <p className="text-gray-600 text-sm">Loading business information...</p>
        </div>
      </div>
    )
  }

  if (error || !business) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 text-center max-w-md w-full">
          <FaExclamationCircle className="mx-auto text-red-500 text-4xl mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Business Not Found</h2>
          <p className="text-gray-600 mb-6 text-sm">{error || 'The business you are looking for could not be found.'}</p>
          <Link
            to="/"
            className="inline-block px-6 py-3 bg-primary-600 text-white rounded-lg font-medium"
          >
            Go Home
          </Link>
        </div>
      </div>
    )
  }

  const workingHoursList = formatWorkingHours(business.workingHours)
  const fullAddress = [
    business.address,
    business.city,
    business.state,
    business.country
  ]
    .filter(Boolean)
    .join(', ')

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Back Button - Mobile Optimized */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-3 py-2 text-gray-700 bg-gray-50 rounded-lg border border-gray-200 font-medium text-sm active:bg-gray-100"
          >
            <FaArrowLeft className="text-sm" />
            <span>Back</span>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[7fr_3fr] gap-6 lg:gap-10 lg:items-start">
          <div className="space-y-6">
            {renderHeroSlider()}

            <div className="lg:hidden space-y-4 sm:space-y-6">
              {/* About Section */}
              {business.description && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4">About</h2>
                  <p className="text-sm sm:text-base text-gray-700 leading-relaxed">{business.description}</p>
                </div>
              )}

              {/* Services Section */}
              {business.services && business.services.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4">Services</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                    {business.services.map((service, index) => (
                      <div key={index} className="flex items-start gap-2 sm:gap-3 p-2 sm:p-3 bg-gray-50 rounded-lg border border-gray-100">
                        <FaCheckCircle className="text-green-600 mt-0.5 flex-shrink-0 text-sm" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs sm:text-sm font-medium text-gray-900">
                            {typeof service === 'object' ? service.name || service.serviceName : service}
                          </p>
                          {typeof service === 'object' && (service.price || service.duration) && (
                            <p className="text-xs text-gray-600 mt-0.5 sm:mt-1">
                              {service.price ? `₹${service.price}` : ''}
                              {service.price && service.duration ? ' • ' : ''}
                              {service.duration ? `${service.duration} min` : ''}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Features Section */}
              {business.features && business.features.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4">Features</h2>
                  <div className="flex flex-wrap gap-2">
                    {business.features.map((feature, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-1 px-2.5 sm:px-3 py-1 sm:py-1.5 bg-purple-50 text-purple-700 rounded-lg text-xs sm:text-sm border border-purple-100"
                      >
                        <FaCheckCircle className="text-xs" />
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Amenities Section */}
              {business.amenities && business.amenities.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4">Amenities</h2>
                  <div className="flex flex-wrap gap-2">
                    {business.amenities.map((amenity, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-1 px-2.5 sm:px-3 py-1 sm:py-1.5 bg-indigo-50 text-indigo-700 rounded-lg text-xs sm:text-sm border border-indigo-100"
                      >
                        <FaCheckCircle className="text-xs" />
                        {amenity}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Contact Information */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4">Contact Information</h2>
                <div className="space-y-3 sm:space-y-4">
                  {business.address && (
                    <div className="flex items-start gap-2 sm:gap-3">
                      <FaMapMarkerAlt className="text-primary-600 mt-1 flex-shrink-0 text-sm sm:text-base" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs sm:text-sm font-medium text-gray-700 mb-0.5 sm:mb-1">Address</p>
                        <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                          {business.address}
                          {business.city && `, ${business.city}`}
                          {business.state && `, ${business.state}`}
                          {business.country && `, ${business.country}`}
                        </p>
                      </div>
                    </div>
                  )}
                  {business.phone && (
                    <a
                      href={`tel:${business.phone}`}
                      className="flex items-center gap-2 sm:gap-3 p-3 bg-gray-50 rounded-lg active:bg-gray-100"
                    >
                      <FaPhone className="text-primary-600 flex-shrink-0 text-base sm:text-lg" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs sm:text-sm font-medium text-gray-700 mb-0.5 sm:mb-1">Phone</p>
                        <p className="text-sm sm:text-base text-primary-600 font-medium">{business.phone}</p>
                      </div>
                    </a>
                  )}
                  {business.email && (
                    <a
                      href={`mailto:${business.email}`}
                      className="flex items-center gap-2 sm:gap-3 p-3 bg-gray-50 rounded-lg active:bg-gray-100"
                    >
                      <FaEnvelope className="text-primary-600 flex-shrink-0 text-base sm:text-lg" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs sm:text-sm font-medium text-gray-700 mb-0.5 sm:mb-1">Email</p>
                        <p className="text-sm sm:text-base text-primary-600 font-medium break-all">{business.email}</p>
                      </div>
                    </a>
                  )}
                  {business.website && (
                    <a
                      href={business.website.startsWith('http') ? business.website : `https://${business.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 sm:gap-3 p-3 bg-gray-50 rounded-lg active:bg-gray-100"
                    >
                      <FaGlobe className="text-primary-600 flex-shrink-0 text-base sm:text-lg" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs sm:text-sm font-medium text-gray-700 mb-0.5 sm:mb-1">Website</p>
                        <p className="text-sm sm:text-base text-primary-600 font-medium break-all">{business.website}</p>
                      </div>
                    </a>
                  )}
                </div>
              </div>

              {/* Working Hours */}
              {workingHoursList.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
                    <FaClock className="text-primary-600 text-base sm:text-lg" />
                    <span>Working Hours</span>
                  </h2>
                  <div className="space-y-1.5 sm:space-y-2">
                    {workingHoursList.map((item, index) => (
                      <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                        <span className="text-xs sm:text-sm font-medium text-gray-700">{item.day}</span>
                        <span className="text-xs sm:text-sm text-gray-600">{item.hours}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Category & Tags */}
              {(business.category || (business.tags && business.tags.length > 0)) && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4">Categories & Tags</h2>
                  <div className="flex flex-wrap gap-2">
                    {business.category && (
                      <span className="inline-flex items-center gap-1 px-2.5 sm:px-3 py-1 sm:py-1.5 bg-blue-50 text-blue-700 rounded-lg text-xs sm:text-sm border border-blue-100">
                        <FaTag className="text-xs" />
                        {business.category}
                      </span>
                    )}
                    {business.tags && business.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-2.5 sm:px-3 py-1 sm:py-1.5 bg-gray-100 text-gray-700 rounded-lg text-xs sm:text-sm border border-gray-200"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Location - Mobile */}
              {(mapsEmbedUrl || business.googleMapsUrl) && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
                    <FaMapMarkerAlt className="text-primary-600 text-base sm:text-lg" />
                    <span>Location</span>
                  </h2>
                  {mapsEmbedUrl ? (
                    <div className="rounded-lg overflow-hidden border border-gray-200">
                      <iframe
                        width="100%"
                        height="300"
                        className="sm:h-[400px]"
                        style={{ border: 0 }}
                        loading="lazy"
                        allowFullScreen
                        referrerPolicy="no-referrer-when-downgrade"
                        src={mapsEmbedUrl}
                        title="Business Location"
                      ></iframe>
                    </div>
                  ) : (
                    <div className="rounded-lg overflow-hidden border border-gray-200 bg-gray-100 h-64 sm:h-96 flex items-center justify-center">
                      <p className="text-gray-500 text-sm">Map unavailable</p>
                    </div>
                  )}
                  {business.googleMapsUrl && (
                    <a
                      href={business.googleMapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 sm:mt-4 inline-flex items-center gap-2 text-primary-600 font-medium text-sm sm:text-base"
                    >
                      Open in Google Maps
                      <FaArrowRight className="text-xs sm:text-sm" />
                    </a>
                  )}
                </div>
              )}

              {/* Booking CTA */}
              {renderBookingCard()}
            </div>

            <div className="hidden lg:block space-y-4 sm:space-y-6">
              {/* About Section */}
              {business.description && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4">About</h2>
                  <p className="text-sm sm:text-base text-gray-700 leading-relaxed">{business.description}</p>
                </div>
              )}

              {/* Services Section */}
              {business.services && business.services.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4">Services</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                    {business.services.map((service, index) => {
                      const isObject = typeof service === 'object' && service !== null
                      const name =
                        (isObject && (service.name || service.serviceName || service.title)) ||
                        (typeof service === 'string' ? service : `Service ${index + 1}`)
                      const price = isObject && service.price ? `₹${service.price}` : ''
                      const duration = isObject && service.duration ? `${service.duration} min` : ''
                      const meta = [price, duration].filter(Boolean).join(' • ')

                      return (
                        <div
                          key={index}
                          className="flex items-start gap-2 px-2.5 py-1.5 bg-green-50 text-green-700 rounded-lg text-xs border border-green-100"
                        >
                          <FaCheckCircle className="text-[10px] mt-0.5" />
                          <div className="flex flex-col leading-tight">
                            <span className="font-medium text-green-700">{name}</span>
                            {meta && <span className="text-[10px] text-gray-500">{meta}</span>}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Features Section */}
              {business.features && business.features.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4">Features</h2>
                  <div className="flex flex-wrap gap-2">
                    {business.features.map((feature, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-1 px-2.5 sm:px-3 py-1 sm:py-1.5 bg-purple-50 text-purple-700 rounded-lg text-xs sm:text-sm border border-purple-100"
                      >
                        <FaCheckCircle className="text-xs" />
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Amenities Section */}
              {business.amenities && business.amenities.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4">Amenities</h2>
                  <div className="flex flex-wrap gap-2">
                    {business.amenities.map((amenity, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-1 px-2.5 sm:px-3 py-1 sm:py-1.5 bg-indigo-50 text-indigo-700 rounded-lg text-xs sm:text-sm border border-indigo-100"
                      >
                        <FaCheckCircle className="text-xs" />
                        {amenity}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Contact Information */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4">Contact Information</h2>
                <div className="space-y-3 sm:space-y-4">
                  {business.address && (
                    <div className="flex items-start gap-2 sm:gap-3">
                      <FaMapMarkerAlt className="text-primary-600 mt-1 flex-shrink-0 text-sm sm:text-base" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs sm:text-sm font-medium text-gray-700 mb-0.5 sm:mb-1">Address</p>
                        <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                          {business.address}
                          {business.city && `, ${business.city}`}
                          {business.state && `, ${business.state}`}
                          {business.country && `, ${business.country}`}
                        </p>
                      </div>
                    </div>
                  )}
                  {business.phone && (
                    <a
                      href={`tel:${business.phone}`}
                      className="flex items-center gap-2 sm:gap-3 p-3 bg-gray-50 rounded-lg active:bg-gray-100"
                    >
                      <FaPhone className="text-primary-600 flex-shrink-0 text-base sm:text-lg" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs sm:text-sm font-medium text-gray-700 mb-0.5 sm:mb-1">Phone</p>
                        <p className="text-sm sm:text-base text-primary-600 font-medium">{business.phone}</p>
                      </div>
                    </a>
                  )}
                  {business.email && (
                    <a
                      href={`mailto:${business.email}`}
                      className="flex items-center gap-2 sm:gap-3 p-3 bg-gray-50 rounded-lg active:bg-gray-100"
                    >
                      <FaEnvelope className="text-primary-600 flex-shrink-0 text-base sm:text-lg" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs sm:text-sm font-medium text-gray-700 mb-0.5 sm:mb-1">Email</p>
                        <p className="text-sm sm:text-base text-primary-600 font-medium break-all">{business.email}</p>
                      </div>
                    </a>
                  )}
                  {business.website && (
                    <a
                      href={business.website.startsWith('http') ? business.website : `https://${business.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 sm:gap-3 p-3 bg-gray-50 rounded-lg active:bg-gray-100"
                    >
                      <FaGlobe className="text-primary-600 flex-shrink-0 text-base sm:text-lg" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs sm:text-sm font-medium text-gray-700 mb-0.5 sm:mb-1">Website</p>
                        <p className="text-sm sm:text-base text-primary-600 font-medium break-all">{business.website}</p>
                      </div>
                    </a>
                  )}
                </div>
              </div>

              {/* Working Hours */}
              {workingHoursList.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
                    <FaClock className="text-primary-600 text-base sm:text-lg" />
                    <span>Working Hours</span>
                  </h2>
                  <div className="space-y-1.5 sm:space-y-2">
                    {workingHoursList.map((item, index) => (
                      <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                        <span className="text-xs sm:text-sm font-medium text-gray-700">{item.day}</span>
                        <span className="text-xs sm:text-sm text-gray-600">{item.hours}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Team Section */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-3 sm:mb-4">
                  <div>
                    <h2 className="text-lg sm:text-xl font-bold text-gray-900">Meet the Team</h2>
                    <p className="text-xs sm:text-sm text-gray-600 mt-1">
                      Experienced professionals dedicated to delivering great service.
                    </p>
                  </div>
                  <div className="hidden sm:flex items-center gap-2 text-primary-600 text-sm font-medium">
                    <FaUsers />
                    <span>Trusted Experts</span>
                  </div>
                </div>
                <div className="grid gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {DEFAULT_STAFF_MEMBERS.map((member, index) => (
                    <div key={index} className="p-3 sm:p-4 border border-gray-100 rounded-lg bg-gray-50 shadow-sm">
                      <p className="text-sm sm:text-base font-semibold text-gray-900">{member.name}</p>
                      <p className="text-[11px] sm:text-xs uppercase tracking-wide text-primary-600 mt-1">{member.role}</p>
                      <p className="text-xs sm:text-sm text-gray-600 mt-1">
                        Specializes in <span className="font-medium text-gray-800">{member.specialization}</span>
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Category & Tags */}
              {(business.category || (business.tags && business.tags.length > 0)) && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4">Categories & Tags</h2>
                  <div className="flex flex-wrap gap-2">
                    {business.category && (
                      <span className="inline-flex items-center gap-1 px-2.5 sm:px-3 py-1 sm:py-1.5 bg-blue-50 text-blue-700 rounded-lg text-xs sm:text-sm border border-blue-100">
                        <FaTag className="text-xs" />
                        {business.category}
                      </span>
                    )}
                    {business.tags && business.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-2.5 sm:px-3 py-1 sm:py-1.5 bg-gray-100 text-gray-700 rounded-lg text-xs sm:text-sm border border-gray-200"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="hidden lg:flex flex-col gap-4">
            <div className="sticky top-[4rem] z-20">{renderBookingCard()}</div>
            <div className="space-y-4">
              {renderStaffCard()}
              {renderFollowUsCard()}
              {renderBookingInfoCard()}
            </div>
          </div>
        </div>

        {/* Location - Full Width */}
        {(mapsEmbedUrl || business.googleMapsUrl) && (
          <div className="hidden lg:block mt-6 sm:mt-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
                <FaMapMarkerAlt className="text-primary-600 text-base sm:text-lg" />
                <span>Location</span>
              </h2>
              {mapsEmbedUrl ? (
                <div className="rounded-lg overflow-hidden border border-gray-200">
                  <iframe
                    width="100%"
                    height="300"
                    className="sm:h-[400px]"
                    style={{ border: 0 }}
                    loading="lazy"
                    allowFullScreen
                    referrerPolicy="no-referrer-when-downgrade"
                    src={mapsEmbedUrl}
                    title="Business Location"
                  ></iframe>
                </div>
              ) : (
                <div className="rounded-lg overflow-hidden border border-gray-200 bg-gray-100 h-64 sm:h-96 flex items-center justify-center">
                  <p className="text-gray-500 text-sm">Map unavailable</p>
                </div>
              )}
              {business.googleMapsUrl && (
                <a
                  href={business.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 sm:mt-4 inline-flex items-center gap-2 text-primary-600 font-medium text-sm sm:text-base"
                >
                  Open in Google Maps
                  <FaArrowRight className="text-xs sm:text-sm" />
                </a>
              )}
            </div>
          </div>
        )}

        {/* Quick Actions - Mobile Sticky Bottom */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-40 p-4">
          <div className="flex gap-2">
            {business.phone && (
              <a
                href={`tel:${business.phone}`}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-xl font-medium text-sm active:bg-blue-700"
              >
                <FaPhone />
                <span>Call</span>
              </a>
            )}
            {whatsappUrl && (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-xl font-medium text-sm active:bg-green-700"
              >
                <FaWhatsapp />
                <span>WhatsApp</span>
              </a>
            )}
            {business.appointmentSettings?.allowOnlineBooking && business.services && business.services.length > 0 && (
              <button
                onClick={handleBookNow}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-primary-600 text-white rounded-xl font-semibold text-sm active:bg-primary-700"
              >
                <FaCalendarAlt />
                <span>Book</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default BusinessInfo
