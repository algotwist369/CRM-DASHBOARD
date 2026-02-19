import React, { useState, useEffect, useCallback, useMemo, lazy, Suspense, useRef } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import SEO from '../../../../components/common/SEO'
import {
  FaMapMarkerAlt,
  FaPhoneAlt,
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
  FaLinkedin,
  FaYoutube,
  FaTelegram,
  FaTag,
  FaChevronLeft,
  FaChevronRight,
  FaChevronDown,
  FaChevronUp,
  FaTimes
} from 'react-icons/fa';
import BackButton from '../../../../components/common/Button/BackButton'
import appointmentService from '../../../../services/public/appointmentService'
import { usePageTitle } from '../../../../hooks/usePageTitle'
import { useLeadTracking } from '../../../../hooks/useLeadTracking';
import SkeletonBusinessInfo from './SkeletonBusinessInfo'
import LazySection from '../../../../components/common/LazySection/LazySection'

// Lazy load heavy components
const Map = lazy(() => import('../../../../components/common/Map/Map'))
const BusinessInfoReviews = lazy(() => import('./BusinessInfoReviews'))
import HeroSection from './HeroSection'
import MediaRenderer from './MediaRenderer'
import MediaGallery from './MediaGallery'
import { trackLeadClick } from '../../../../utils/analytics'
import InquiryModal from '../../../../components/public/Inquiry/InquiryModal'
import SpecialOfferModal from '../../../../components/public/Offer/SpecialOfferModal'


import { useQuery } from '@tanstack/react-query'

const ShakeZoomStyles = React.memo(() => (
  <style>
    {`
      @keyframes shakeZoom {
        0%, 100% { transform: scale(1) rotate(0deg); }
        10%, 20% { transform: scale(1.2) rotate(-10deg); }
        30%, 50%, 70%, 90% { transform: scale(1.2) rotate(10deg); }
        40%, 60%, 80% { transform: scale(1.2) rotate(-10deg); }
      }
    `}
  </style>
))

const shakeZoomAnimation = { animation: 'shakeZoom 2s ease-in-out infinite' }

const BusinessInfo = () => {
  const navigate = useNavigate()
  const { businessLink } = useParams()
  // currentImageIndex state moved to HeroSection to optimize re-renders
  const [isImageModalOpen, setIsImageModalOpen] = useState(false)
  const [modalImageIndex, setModalImageIndex] = useState(0)
  const [isInquiryOpen, setIsInquiryOpen] = useState(false)
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false)

  // Popup queue system
  const currentModalRef = useRef(null) // Track which modal is currently open
  // Track which popups have been shown to prevent duplicates
  const hasShownInquiryRef = useRef(false)
  const hasShownOfferRef = useRef(false)

  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false)
  const [showAllServices, setShowAllServices] = useState(false)
  const [showAllFeatures, setShowAllFeatures] = useState(false)
  const [showAllAmenities, setShowAllAmenities] = useState(false)


  // Fetch business info using React Query
  const {
    data: business,
    isLoading: loading,
    error: queryError
  } = useQuery({
    queryKey: ['businessInfo', businessLink],
    queryFn: async () => {
      if (!businessLink) throw new Error('Invalid business link')

      const result = await appointmentService.getBusinessInfo(businessLink)
      if (!result.success) {
        throw new Error(result.error || result.data?.message || result.message || 'Failed to fetch business information')
      }

      const businessData = result.data.data || result.data
      sessionStorage.setItem('bookingBusiness', JSON.stringify(businessData))
      return businessData
    },
    enabled: !!businessLink,
    initialData: () => {
      const stored = sessionStorage.getItem('bookingBusiness')
      if (!stored) return undefined

      try {
        const parsed = JSON.parse(stored)
        // Only use stored data if it matches current business
        if (parsed.businessLink === businessLink || parsed.slug === businessLink) {
          return parsed
        }
      } catch (e) {
        console.error("Failed to parse stored business data", e);
      }
      return undefined
    },
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    retry: 1
  })

  // Handle errors
  const error = queryError?.message

  useEffect(() => {
    if (error) {
      toast.error(error)
    }
  }, [error])

  // Update page title based on business name
  const pageTitle = useMemo(() => {
    return business ? `${business.name}${business.branch ? ` - ${business.branch}` : ''} - Spa Advisor` : null
  }, [business])
  usePageTitle(pageTitle)

  // Track page view
  useLeadTracking(business?._id, !!business);

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [businessLink])

  const handleBookNow = useCallback(() => {
    if (business && business.services && business.services.length > 0) {
      // Track the click
      trackLeadClick(business._id, 'booking')

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
  }, [business, businessLink, navigate])

  // Memoize formatWorkingHours function
  const formatWorkingHours = useCallback((workingHours) => {
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
  }, [])

  // Memoize WhatsApp URL
  const whatsappUrl = useMemo(() => {
    if (!business) return null

    // Check if socialMedia.whatsapp is already a URL
    const socialWhatsapp = business.socialMedia?.whatsapp
    if (socialWhatsapp) {
      // If it's already a WhatsApp URL (wa.me or api.whatsapp.com), use it directly
      if (socialWhatsapp.includes('wa.me') || socialWhatsapp.includes('api.whatsapp.com') || socialWhatsapp.includes('whatsapp.com')) {
        return socialWhatsapp
      }
      // If it's a phone number string, extract digits and convert to wa.me URL
      const phoneFromSocial = socialWhatsapp.replace(/[^0-9]/g, '')
      if (phoneFromSocial) {
        return `https://wa.me/${phoneFromSocial}`
      }
    }

    // Fallback to business phone number
    const phoneNumber = business.phone?.replace(/[^0-9]/g, '')
    const baseUrl = phoneNumber ? `https://wa.me/${phoneNumber}` : null

    if (baseUrl) {
      return `${baseUrl}?text=${encodeURIComponent(`Hi ${business.name || 'Business'}, I found your business on SpaAdvisor and would like to inquire about your services.`)}`
    }
    return null
  }, [business])

  // Popup queue management
  // Show InquiryModal after 7 seconds
  useEffect(() => {
    if (!business) return

    const timer = setTimeout(() => {
      if (!hasShownInquiryRef.current && !currentModalRef.current) {
        hasShownInquiryRef.current = true
        setIsInquiryOpen(true)
        currentModalRef.current = 'inquiry'
      }
    }, 7000)

    return () => clearTimeout(timer)
  }, [business])

  const closeCurrentModal = useCallback((modalType) => {
    // Clear current modal reference only if this is the currently open modal
    if (currentModalRef.current === modalType) {
      currentModalRef.current = null

      // Mark as shown when closing
      if (modalType === 'inquiry') {
        hasShownInquiryRef.current = true

        // Show Special Offer Modal after Inquiry Modal closes
        setTimeout(() => {
          if (!hasShownOfferRef.current && business?.services?.length > 0) {
            hasShownOfferRef.current = true
            setIsOfferModalOpen(true)
            currentModalRef.current = 'offer'
          }
        }, 500)
      } else if (modalType === 'offer') {
        hasShownOfferRef.current = true
      }
    }
  }, [business])

  // Memoize all images collection
  const allImages = useMemo(() => {
    if (!business?.images) return []
    const images = []
    const getImageUrl = (url) => {
      if (!url) return null
      // Check for Google 360/Photosphere URLs
      if (url.includes('google.com/local/place') && url.includes('photosphere')) {
        try {
          const urlObj = new URL(url)
          let iuParams = urlObj.searchParams.get('iu')
          if (iuParams) {
            // Try to upgrade quality from thumbnail to larger size
            return iuParams.replace(/=w\d+-h\d+/, '=w800-h600')
          }
          return null // Return null if we can't extract an image URL
        } catch (e) {
          console.warn('Failed to parse 360 image URL:', e)
          return null
        }
      }
      return url
    }

    const bannerUrl = getImageUrl(business.images.banner)
    if (bannerUrl) images.push({ src: bannerUrl, type: 'Banner' })

    const thumbnailUrl = getImageUrl(business.images.thumbnail)
    if (thumbnailUrl) images.push({ src: thumbnailUrl, type: 'Thumbnail' })

    const logoUrl = getImageUrl(business.images.logo)
    if (logoUrl) images.push({ src: logoUrl, type: 'Logo' })

    if (Array.isArray(business.images.gallery)) {
      business.images.gallery.forEach(img => {
        const galleryUrl = getImageUrl(img)
        if (galleryUrl) images.push({ src: galleryUrl, type: 'Gallery' })
      })
    }
    return images
  }, [business?.images])

  const nextImage = useCallback(() => {
    if (allImages.length === 0) return
    setCurrentImageIndex((prev) => (prev + 1) % allImages.length)
  }, [allImages.length])

  const prevImage = useCallback(() => {
    if (allImages.length === 0) return
    setCurrentImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length)
  }, [allImages.length])

  const openImageModal = useCallback((index) => {
    setModalImageIndex(index)
    setIsImageModalOpen(true)
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden'
  }, [])

  const closeImageModal = useCallback(() => {
    setIsImageModalOpen(false)
    document.body.style.overflow = 'unset'
  }, [])

  const nextModalImage = useCallback(() => {
    if (allImages.length === 0) return
    setModalImageIndex((prev) => (prev + 1) % allImages.length)
  }, [allImages.length])

  const prevModalImage = useCallback(() => {
    if (allImages.length === 0) return
    setModalImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length)
  }, [allImages.length])

  // Handle keyboard navigation in modal
  useEffect(() => {
    if (!isImageModalOpen) return

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        closeImageModal()
      } else if (e.key === 'ArrowLeft') {
        prevModalImage()
      } else if (e.key === 'ArrowRight') {
        nextModalImage()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isImageModalOpen, closeImageModal, prevModalImage, nextModalImage])

  // Function to determine if we should render hero
  const shouldRenderHero = allImages.length > 0

  // Clean nextImage/prevImage as they are now internal to HeroSection or Modal specific
  // The logic for Modal navigation remains here as BusinessInfo controls the modal state
  // ... (keeping modal logic if needed or relying on simple state updates)dinates and zoom
  const mapCoordinates = useMemo(() => {
    if (business?.location?.coordinates) {
      return business.location.coordinates // [lng, lat] format
    }
    return null
  }, [business?.location])

  const mapZoom = useMemo(() => {
    if (business?.googleMapsUrl) {
      const zMatch = business.googleMapsUrl.match(/[?&]z=(\d+)/)
      if (zMatch) {
        return parseInt(zMatch[1], 10)
      }
    }
    return 15 // Default zoom
  }, [business?.googleMapsUrl])

  // Memoize working hours list
  const workingHoursList = useMemo(() => {
    return formatWorkingHours(business?.workingHours)
  }, [business?.workingHours, formatWorkingHours])

  // Memoize full address
  const fullAddress = useMemo(() => {
    if (!business) return ''
    // Clean address by removing newlines and extra whitespace
    const cleanAddress = business.address?.replace(/\n/g, ', ').replace(/\s+/g, ' ').trim() || ''
    return [
      cleanAddress,
      business.city,
      business.state,
      business.country
    ]
      .filter(Boolean)
      .join(', ')
  }, [business])

  const renderBookingCard = useCallback(() => (
    <div className="bg-white hidden md:block border border-gray-200 p-6">
      {business.appointmentSettings?.allowOnlineBooking ? (
        <>
          <div className="flex items-center gap-2 text-green-600 mb-4">
            <FaCheckCircle />
            <span className="text-sm font-medium">Online Booking Available</span>
          </div>
          <button
            onClick={handleBookNow}
            disabled={!business.services || business.services.length === 0}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-primary-600 text-white  font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed mb-4"
          >
            <FaCalendarAlt />
            Book Appointment
            <FaArrowRight />
          </button>
          {(!business.services || business.services.length === 0) && (
            <p className="text-xs text-gray-500 text-center">No services available</p>
          )}

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-200"></span>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-gray-400">Or</span>
            </div>
          </div>

          <button
            onClick={() => {
              trackLeadClick(business._id, 'inquiry');
              hasShownInquiryRef.current = true
              currentModalRef.current = 'inquiry'
              setIsInquiryOpen(true);
            }}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-white text-primary-600 border-2 border-primary-600 font-semibold text-lg hover:bg-primary-50 transition-colors"
          >
            <FaEnvelope />
            Send Enquiry
          </button>
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
            onClick={() => trackLeadClick(business._id, 'call')}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-50 text-blue-700  border border-blue-200 font-medium text-sm"
          >
            <FaPhoneAlt className="text-lg" />
            Call Now
          </a>
        )}
        {whatsappUrl && (
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackLeadClick(business._id, 'whatsapp')}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-green-50 text-green-700  border border-green-200 font-medium text-sm"
          >
            <FaWhatsapp className="text-lg" />
            WhatsApp
          </a>
        )}
      </div>
    </div>
  ), [business, handleBookNow, whatsappUrl])

  const renderFollowUsCard = useCallback(() => {
    if (!business?.socialMedia || !Object.values(business.socialMedia).some(Boolean)) {
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
        key: 'linkedin',
        icon: <FaLinkedin />,
        label: 'LinkedIn',
        bg: 'bg-blue-700'
      },
      {
        key: 'youtube',
        icon: <FaYoutube />,
        label: 'YouTube',
        bg: 'bg-red-600'
      },
      {
        key: 'whatsapp',
        icon: <FaWhatsapp />,
        label: 'WhatsApp',
        bg: 'bg-green-600',
        href: whatsappUrl
      },
      {
        key: 'telegram',
        icon: <FaTelegram />,
        label: 'Telegram',
        bg: 'bg-blue-500'
      }
    ]

    return (
      <div className="p-4 border border-gray-200  bg-gray-50 space-y-4">
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
                onClick={() => {
                  if (key === 'whatsapp') trackLeadClick(business._id, 'whatsapp')
                }}
                className={`w-12 h-12 flex items-center justify-center ${bg} text-white   hover:opacity-90 transition`}
                aria-label={label}
              >
                {icon}
              </a>
            )
          })}
        </div>
      </div>
    )
  }, [business?.socialMedia, whatsappUrl])

  const renderBookingInfoCard = useCallback(() => {
    if (!business?.appointmentSettings) return null

    const { slotDuration, advanceBookingDays, cancellationPolicy } = business.appointmentSettings
    const cancellationHours = cancellationPolicy?.minCancellationHours

    if (!slotDuration && !advanceBookingDays && !cancellationHours) return null

    const infoItems = [
      slotDuration && { label: 'Slot Duration', value: `${slotDuration} min` },
      advanceBookingDays && { label: 'Advance Booking', value: `Up to ${advanceBookingDays} days` },
      cancellationHours && { label: 'Cancellation Notice', value: `${cancellationHours} hours` }
    ].filter(Boolean)

    if (infoItems.length === 0) return null

    return (
      <div className="p-4 border border-gray-200  bg-gray-50 space-y-4">
        <div className="space-y-1">
          <h2 className="text-lg font-bold text-gray-900">Booking Info</h2>
          <p className="text-sm text-gray-500">Plan your appointments with ease</p>
        </div>
        <div className="space-y-3">
          {infoItems.map((item, index) => (
            <div key={index} className="flex items-center justify-between bg-white border border-gray-100  px-4 py-3 ">
              <span className="text-sm text-gray-600">{item.label}</span>
              <span className="text-sm font-semibold text-gray-900">{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    )
  }, [business?.appointmentSettings])

  const renderRatingsCard = useCallback(() => {
    if (!business?.ratings) return null

    const { average, totalReviews, fiveStars, fourStars, threeStars, twoStars, oneStar } = business.ratings
    const totalStars = fiveStars + fourStars + threeStars + twoStars + oneStar

    // Calculate percentage for each star rating
    const getPercentage = (count) => totalStars > 0 ? (count / totalStars) * 100 : 0

    const starBreakdown = [
      { stars: 5, count: fiveStars, label: '5 stars' },
      { stars: 4, count: fourStars, label: '4 stars' },
      { stars: 3, count: threeStars, label: '3 stars' },
      { stars: 2, count: twoStars, label: '2 stars' },
      { stars: 1, count: oneStar, label: '1 star' }
    ]

    return (
      <div className="hidden md:block p-4 sm:p-5 border border-gray-200 bg-gray-50 rounded-lg space-y-5">
        {/* Header */}
        <div className="space-y-1">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900">Ratings & Reviews</h2>
          <p className="text-xs sm:text-sm text-gray-500">What customers are saying</p>
        </div>

        {/* Average Rating Card */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 bg-white border border-gray-200 rounded-xl p-5 sm:p-6 shadow-sm">
          {/* Rating Display */}
          <div className="flex flex-col items-center sm:items-start">
            <div className="text-4xl sm:text-5xl font-extrabold text-gray-900 leading-none">
              {average.toFixed(1)}
            </div>
            <div className="flex items-center gap-1 mt-2 sm:mt-3">
              {[1, 2, 3, 4, 5].map((star) => {
                const isFilled = star <= Math.floor(average)
                const isHalf = star === Math.ceil(average) && average % 1 >= 0.5
                return (
                  <FaStar
                    key={star}
                    className={
                      isFilled
                        ? 'text-yellow-400'
                        : isHalf
                          ? 'text-yellow-400 opacity-50'
                          : 'text-gray-300'
                    }
                    size={18}
                  />
                )
              })}
            </div>
          </div>

          {/* Review Count */}
          <div className="flex-1 text-center sm:text-left">
            <div className="text-sm sm:text-base text-gray-700">
              Based on{' '}
              <span className="font-bold text-gray-900 text-lg sm:text-xl">
                {totalReviews}
              </span>{' '}
              {totalReviews === 1 ? 'review' : 'reviews'}
            </div>
            {totalReviews === 0 && (
              <div className="text-xs sm:text-sm text-gray-500 mt-2">
                Be the first to review!
              </div>
            )}
          </div>
        </div>

        {/* Star Breakdown */}
        {totalStars > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm sm:text-base font-semibold text-gray-800">
              Rating Distribution
            </h3>
            <div className="space-y-2.5 sm:space-y-3">
              {starBreakdown.map(({ stars, count, label }) => {
                const percentage = getPercentage(count)
                return (
                  <div
                    key={stars}
                    className="flex items-center gap-2 sm:gap-3 w-full"
                  >
                    {/* Star Label */}
                    <div className="flex items-center gap-1.5 min-w-[3.5rem] sm:min-w-[4rem]">
                      <span className="text-xs sm:text-sm font-semibold text-gray-700 w-4 text-right">
                        {stars}
                      </span>
                      <FaStar className="text-yellow-400 flex-shrink-0" size={14} />
                    </div>

                    {/* Progress Bar */}
                    <div className="flex-1 bg-gray-200 rounded-full h-2.5 sm:h-3 overflow-hidden shadow-inner">
                      <div
                        className="bg-gradient-to-r from-yellow-400 to-yellow-500 h-full transition-all duration-500 ease-out rounded-full"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>

                    {/* Count */}
                    <div className="text-xs sm:text-sm text-gray-600 font-medium min-w-[3rem] sm:min-w-[3.5rem] text-right">
                      {count > 0 ? (
                        <>
                          {count} {count === 1 ? 'review' : 'reviews'}
                        </>
                      ) : (
                        <span className="text-gray-400">0</span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    )
  }, [business?.ratings])

  const renderContactInfoCard = useCallback(() => {
    if (!business) return null

    const hasContactInfo = business.address || business.phone || business.email || business.website
    if (!hasContactInfo) return null

    return (
      <div className="p-4 border border-gray-200 bg-gray-50 space-y-3">
        <h2 className="text-lg font-bold text-gray-900">Contact Information</h2>
        <div className="space-y-2">
          {business.address && (
            <div className="flex items-start gap-2 text-sm text-gray-600">
              <FaMapMarkerAlt className="text-primary-600 mt-0.5 flex-shrink-0" />
              <span>
                {business.address?.replace(/\n/g, ', ').replace(/\s+/g, ' ').trim()}
                {business.city && `, ${business.city}`}
                {business.state && `, ${business.state}`}
                {business.country && `, ${business.country}`}
              </span>
            </div>
          )}
          {business.phone && (
            <a
              href={`tel:${business.phone}`}
              className="flex items-center gap-2 px-3 py-2 bg-white border border-primary-200 rounded text-sm text-primary-600 hover:bg-primary-50 hover:border-primary-300 hover:text-primary-700 transition-colors"
            >
              <FaPhoneAlt className="flex-shrink-0" />
              <span className="font-medium">{business.phone}</span>
            </a>
          )}
          {business.email && (
            <a
              href={`mailto:${business.email}`}
              className="flex items-center gap-2 px-3 py-2 bg-white border border-primary-200 rounded text-sm text-primary-600 hover:bg-primary-50 hover:border-primary-300 hover:text-primary-700 transition-colors break-all"
            >
              <FaEnvelope className="flex-shrink-0" />
              <span className="font-medium">{business.email}</span>
            </a>
          )}
          {business.website && (
            <a
              href={business.website.startsWith('http') ? business.website : `https://${business.website}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-2 bg-white border border-primary-200 rounded text-sm text-primary-600 hover:bg-primary-50 hover:border-primary-300 hover:text-primary-700 transition-colors break-all"
            >
              <FaGlobe className="flex-shrink-0" />
              <span className="font-medium">{business.website}</span>
            </a>
          )}
        </div>
      </div>
    )
  }, [business])

  // Swipe handlers for modal
  const modalTouchStart = useRef(null)
  const modalTouchEnd = useRef(null)
  const minSwipeDistance = 50

  const onModalTouchStart = (e) => {
    modalTouchEnd.current = null
    modalTouchStart.current = e.targetTouches[0].clientX
  }

  const onModalTouchMove = (e) => {
    modalTouchEnd.current = e.targetTouches[0].clientX
  }

  const onModalTouchEnd = () => {
    if (!modalTouchStart.current || !modalTouchEnd.current) return
    const distance = modalTouchStart.current - modalTouchEnd.current
    const isLeftSwipe = distance > minSwipeDistance
    const isRightSwipe = distance < -minSwipeDistance

    if (isLeftSwipe) {
      nextModalImage()
    } else if (isRightSwipe) {
      prevModalImage()
    }
  }

  // Image Modal/Lightbox Component
  const renderImageModal = useCallback(() => {
    if (!isImageModalOpen) return null

    return (
      <div
        className="fixed inset-0 z-[100] bg-black flex items-center justify-center transition-opacity duration-300"
        onClick={closeImageModal}
      >
        {/* Close Button */}
        <button
          onClick={closeImageModal}
          className="absolute top-4 right-4 z-[110] bg-white/10 hover:bg-white/20 backdrop-blur-md p-3 rounded-full text-white transition-all duration-300 hover:scale-110 active:scale-95"
          aria-label="Close media viewer"
        >
          <FaTimes className="text-xl sm:text-2xl" />
        </button>

        <div
          className="w-full h-full relative"
          onClick={(e) => e.stopPropagation()}
        >
          <MediaGallery
            business={business}
            allImages={allImages}
            isModal={true}
            modalImageIndex={modalImageIndex}
            nextModalImage={nextModalImage}
            prevModalImage={prevModalImage}
            onClose={closeImageModal}
          />
        </div>
      </div>
    )
  }, [isImageModalOpen, business, allImages, modalImageIndex, nextModalImage, prevModalImage, closeImageModal])

  // SEO Configuration
  const seoConfig = useMemo(() => {
    if (!business) return null;

    return {
      title: business.seo?.metaTitle || `${business.name} | ${business.category || 'Business'} in ${business.city}`,
      description: business.seo?.metaDescription || business.description?.substring(0, 160) || `Book appointments at ${business.name} in ${business.city}. Check reviews, services, and working hours.`,
      keywords: business.seo?.keywords?.join(', ') || [business.name, business.category, business.city, business.services?.map(s => s.name)].flat().filter(Boolean).join(', '),
      ogImage: business.seo?.ogImage || business.images?.banner || business.images?.logo,
      ogUrl: window.location.href,
      canonical: window.location.href
    };
  }, [business]);

  // Structured Data (JSON-LD)
  const structuredData = useMemo(() => {
    if (!business) return null;

    const schema = {
      "@context": "https://schema.org",
      "@type": "LocalBusiness",
      "name": business.name,
      "image": business.images?.banner || business.images?.logo,
      "telephone": business.phone,
      "email": business.email,
      "address": {
        "@type": "PostalAddress",
        "streetAddress": business.address,
        "addressLocality": business.city,
        "addressRegion": business.state,
        "addressCountry": business.country
      },
      "geo": business.location?.coordinates ? {
        "@type": "GeoCoordinates",
        "latitude": business.location.coordinates[1],
        "longitude": business.location.coordinates[0]
      } : undefined,
      "url": window.location.href,
      "priceRange": "$$", // Dynamic if available
      "openingHoursSpecification": business.workingHours?.days?.map((day, index) => ({
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": day.charAt(0).toUpperCase() + day.slice(1),
        "opens": business.workingHours.open,
        "closes": business.workingHours.close
      }))
    };

    return JSON.stringify(schema);
  }, [business]);

  if (loading) {
    return <SkeletonBusinessInfo />
  }

  if (error || !business) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white  shadow-lg border border-gray-200 p-6 text-center max-w-md w-full">
          <FaExclamationCircle className="mx-auto text-red-500 text-4xl mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Business Not Found</h2>
          <p className="text-gray-600 mb-6 text-sm">{error || 'The business you are looking for could not be found.'}</p>
          <Link
            to="/"
            className="inline-block px-6 py-3 bg-primary-600 text-white  font-medium"
          >
            Go Home
          </Link>
        </div>
      </div>
    )
  }



  return (
    <div className="min-h-screen bg-gray-50 pb-20 lg:pb-0 overflow-x-hidden">
      {/* SEO Meta Tags */}
      {seoConfig && (
        <SEO
          title={seoConfig.title}
          description={seoConfig.description}
          keywords={seoConfig.keywords}
          ogImage={seoConfig.ogImage}
          ogUrl={seoConfig.ogUrl}
          canonical={seoConfig.canonical}
        />
      )}
      {/* Structured Data */}
      {structuredData && (
        <script type="application/ld+json">
          {structuredData}
        </script>
      )}
      <ShakeZoomStyles />
      {/* Image Modal */}
      {renderImageModal()}

      {/* Inquiry Modal */}
      <InquiryModal
        isOpen={isInquiryOpen}
        onClose={() => {
          setIsInquiryOpen(false)
          closeCurrentModal('inquiry')
        }}
        businessId={business?._id}
        businessName={business?.name}
        businessLink={businessLink}
      />

      {/* Special Offer Modal */}
      <SpecialOfferModal
        isOpen={isOfferModalOpen}
        onClose={() => {
          setIsOfferModalOpen(false)
          closeCurrentModal('offer')
        }}
        onBookNow={handleBookNow}
      />


      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <BackButton />
        <div className="grid grid-cols-1 lg:grid-cols-[7fr_3fr] gap-6 lg:gap-10 lg:items-start">
          <div className="space-y-6">
            {/* Hero Section */}
            {shouldRenderHero && (
              <HeroSection
                business={business}
                allImages={allImages}
                openImageModal={openImageModal}
                fullAddress={fullAddress}
              />
            )}

            <div className="lg:hidden space-y-4 sm:space-y-6">
              {/* Ratings Section */}
              {renderRatingsCard()}

              {/* About Section */}
              {business.description && (
                <div className="bg-white border border-gray-200 p-4 sm:p-6">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4">About</h2>
                  <div className={`relative transition-all duration-300 ${!isDescriptionExpanded ? 'max-h-24 overflow-hidden' : ''}`}>
                    <p className={`text-sm sm:text-base text-gray-700 leading-relaxed ${!isDescriptionExpanded ? 'line-clamp-3' : ''}`}>
                      {business.description}
                    </p>
                  </div>
                  {business.description.length > 150 && (
                    <button
                      onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                      className="mt-2 text-primary-600 font-medium text-sm hover:underline focus:outline-none"
                    >
                      {isDescriptionExpanded ? 'Read Less' : 'Read More'}
                    </button>
                  )}
                </div>
              )}

              {/* Services Section */}
              {business.services && business.services.length > 0 && (
                <div className="bg-white   border border-gray-200 p-4 sm:p-6">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4">Services</h2>

                  {/* Initial 12 Services */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                    {business.services.slice(0, 12).map((service, index) => {
                      const serviceKey = typeof service === 'object' && service?._id ? service._id : `service-${index}`
                      return (
                        <div key={serviceKey} className="flex items-start gap-2 sm:gap-3 p-2 sm:p-3 bg-gray-50  border border-gray-100">
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
                      )
                    })}
                  </div>

                  {/* Hidden Services with Grid Transition */}
                  {business.services.length > 12 && (
                    <div className={`grid transition-[grid-template-rows] duration-300 ease-out ${showAllServices ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
                      <div className="overflow-hidden">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 pt-2 sm:pt-3">
                          {business.services.slice(12).map((service, index) => {
                            const serviceKey = typeof service === 'object' && service?._id ? service._id : `extra-service-${index}`
                            return (
                              <div key={serviceKey} className="flex items-start gap-2 sm:gap-3 p-2 sm:p-3 bg-gray-50  border border-gray-100">
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
                            )
                          })}
                        </div>
                      </div>
                    </div>
                  )}

                  {business.services.length > 12 && (
                    <div className={`relative z-10 bg-white pt-2 ${!showAllServices ? '-mt-12 pt-6 bg-gradient-to-t from-white via-white/90 to-transparent' : ''}`}>
                      <button
                        onClick={() => setShowAllServices(!showAllServices)}
                        className="w-full flex items-center justify-center gap-2 py-2 text-sm font-medium text-primary-600 bg-primary-50 hover:bg-primary-100 rounded transition-colors"
                      >
                        {showAllServices ? (
                          <>
                            Show Less <FaChevronUp className="text-xs" />
                          </>
                        ) : (
                          <>
                            Show more + {business.services.length - 12} services <FaChevronDown className="text-xs" />
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Features Section */}
              {business.features && business.features.length > 0 && (
                <div className="bg-white border border-gray-200 p-4 sm:p-6">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4">Features</h2>

                  {/* Initial 8 Features */}
                  <div className="grid grid-cols-2 gap-2">
                    {business.features.slice(0, 8).map((feature, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-1 px-2.5 sm:px-3 py-1 sm:py-1.5 bg-purple-50 text-purple-700 text-xs sm:text-sm border border-purple-100"
                      >
                        <FaCheckCircle className="text-xs" />
                        {feature}
                      </span>
                    ))}
                  </div>

                  {/* Hidden Features with Grid Transition */}
                  {business.features.length > 8 && (
                    <div className={`grid transition-[grid-template-rows] duration-300 ease-out ${showAllFeatures ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
                      <div className="overflow-hidden">
                        <div className="grid grid-cols-2 gap-2 pt-2">
                          {business.features.slice(8).map((feature, index) => (
                            <span
                              key={`extra-feature-${index}`}
                              className="inline-flex items-center gap-1 px-2.5 sm:px-3 py-1 sm:py-1.5 bg-purple-50 text-purple-700 text-xs sm:text-sm border border-purple-100"
                            >
                              <FaCheckCircle className="text-xs" />
                              {feature}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {business.features.length > 8 && (
                    <div className={`relative z-10 bg-white pt-2 ${!showAllFeatures ? '-mt-8 pt-8 bg-gradient-to-t from-white via-white/90 to-transparent' : ''}`}>
                      <button
                        onClick={() => setShowAllFeatures(!showAllFeatures)}
                        className="w-full flex items-center justify-center gap-2 py-2 text-sm font-medium text-primary-600 bg-primary-50 hover:bg-primary-100 rounded transition-colors"
                      >
                        {showAllFeatures ? (
                          <>
                            Show Less <FaChevronUp className="text-xs" />
                          </>
                        ) : (
                          <>
                            Show more + {business.features.length - 8} features <FaChevronDown className="text-xs" />
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Amenities Section */}
              {business.amenities && business.amenities.length > 0 && (
                <div className="bg-white border border-gray-200 p-4 sm:p-6">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4">Amenities</h2>

                  {/* Initial 8 Amenities */}
                  <div className="grid grid-cols-2 gap-2">
                    {business.amenities.slice(0, 8).map((amenity, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-1 px-2.5 sm:px-3 py-1 sm:py-1.5 bg-indigo-50 text-indigo-700 text-xs sm:text-sm border border-indigo-100"
                      >
                        <FaCheckCircle className="text-xs" />
                        {amenity}
                      </span>
                    ))}
                  </div>

                  {/* Hidden Amenities with Grid Transition */}
                  {business.amenities.length > 8 && (
                    <div className={`grid transition-[grid-template-rows] duration-300 ease-out ${showAllAmenities ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
                      <div className="overflow-hidden">
                        <div className="grid grid-cols-2 gap-2 pt-2">
                          {business.amenities.slice(8).map((amenity, index) => (
                            <span
                              key={`extra-amenity-${index}`}
                              className="inline-flex items-center gap-1 px-2.5 sm:px-3 py-1 sm:py-1.5 bg-indigo-50 text-indigo-700 text-xs sm:text-sm border border-indigo-100"
                            >
                              <FaCheckCircle className="text-xs" />
                              {amenity}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {business.amenities.length > 8 && (
                    <div className={`relative z-10 bg-white pt-2 ${!showAllAmenities ? '-mt-8 pt-8 bg-gradient-to-t from-white via-white/90 to-transparent' : ''}`}>
                      <button
                        onClick={() => setShowAllAmenities(!showAllAmenities)}
                        className="w-full flex items-center justify-center gap-2 py-2 text-sm font-medium text-primary-600 bg-primary-50 hover:bg-primary-100 rounded transition-colors"
                      >
                        {showAllAmenities ? (
                          <>
                            Show Less <FaChevronUp className="text-xs" />
                          </>
                        ) : (
                          <>
                            Show more + {business.amenities.length - 8} amenities <FaChevronDown className="text-xs" />
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Contact Information */}
              <div className="bg-white   border border-gray-200 p-4 sm:p-6">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4">Contact Information</h2>
                <div className="space-y-3 sm:space-y-4">
                  {business.address && (
                    <div className="flex items-start gap-2 sm:gap-3">
                      <FaMapMarkerAlt className="text-primary-600 mt-1 flex-shrink-0 text-sm sm:text-base" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs sm:text-sm font-medium text-gray-700 mb-0.5 sm:mb-1">Address</p>
                        <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                          {business.address?.replace(/\n/g, ', ').replace(/\s+/g, ' ').trim()}
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
                      className="flex items-center gap-2 sm:gap-3 p-3 bg-gray-50  active:bg-gray-100"
                    >
                      <FaPhoneAlt
                        className="text-primary-600 flex-shrink-0 text-base sm:text-lg"
                        style={shakeZoomAnimation}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs sm:text-sm font-medium text-gray-700 mb-0.5 sm:mb-1">Phone</p>
                        <p className="text-sm sm:text-base text-primary-600 font-medium">{business.phone}</p>
                      </div>
                    </a>
                  )}
                  {business.email && (
                    <a
                      href={`mailto:${business.email}`}
                      className="flex items-center gap-2 sm:gap-3 p-3 bg-gray-50  active:bg-gray-100"
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
                      className="flex items-center gap-2 sm:gap-3 p-3 bg-gray-50  active:bg-gray-100"
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
                <div className="bg-white   border border-gray-200 p-4 sm:p-6">
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
                <div className="bg-white   border border-gray-200 p-4 sm:p-6">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4">Categories & Tags</h2>
                  <div className="flex flex-wrap gap-2">
                    {business.category && (
                      <span className="inline-flex items-center gap-1 px-2.5 sm:px-3 py-1 sm:py-1.5 bg-blue-50 text-blue-700  text-xs sm:text-sm border border-blue-100">
                        <FaTag className="text-xs" />
                        {business.category}
                      </span>
                    )}
                    {business.tags && business.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-2.5 sm:px-3 py-1 sm:py-1.5 bg-gray-100 text-gray-700  text-xs sm:text-sm border border-gray-200"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Location - Mobile */}
              {(mapCoordinates || business.googleMapsUrl) && (
                <div className="bg-white border border-gray-200 p-4 sm:p-6">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
                    <FaMapMarkerAlt className="text-primary-600 text-base sm:text-lg" />
                    <span>Location</span>
                  </h2>
                  <Suspense fallback={<div className="h-[300px] bg-gray-100 animate-pulse rounded"></div>}>
                    <Map
                      coordinates={mapCoordinates}
                      googleMapsUrl={business.googleMapsUrl}
                      zoom={mapZoom}
                      height="300px"
                      className="sm:h-[400px]"
                      showLink={true}
                    />
                  </Suspense>
                </div>
              )}

              {/* Booking CTA */}
              {renderBookingCard()}
            </div>

            <div className="hidden lg:block space-y-4 sm:space-y-6">
              {/* About Section */}
              {business.description && (
                <div className="bg-white   border border-gray-200 p-4 sm:p-6">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4">About</h2>
                  <p className="text-sm sm:text-base text-gray-700 leading-relaxed">{business.description}</p>
                </div>
              )}

              {/* Media Gallery Section */}
              <MediaGallery
                business={business}
                allImages={allImages}
                openImageModal={openImageModal}
              />

              {/* Services Section */}
              {business.services && business.services.length > 0 && (
                <div className="bg-white   border border-gray-200 p-4 sm:p-6">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4">Services</h2>

                  {/* Initial 12 Services */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                    {business.services.slice(0, 12).map((service, index) => {
                      const isObject = typeof service === 'object' && service !== null
                      const serviceKey = isObject && service?._id ? service._id : `service-${index}`
                      const name =
                        (isObject && (service.name || service.serviceName || service.title)) ||
                        (typeof service === 'string' ? service : `Service ${index + 1}`)
                      const duration = isObject && service.duration ? `${service.duration} min` : ''
                      const category = isObject && service.category ? service.category : ''
                      const serviceImages = isObject && Array.isArray(service.images) ? service.images.filter(Boolean) : []
                      const hasImage = serviceImages.length > 0
                      const mainImage = hasImage ? serviceImages[0] : null

                      return (
                        <div
                          key={serviceKey}
                          className="bg-white border border-gray-200 overflow-hidden"
                        >
                          {hasImage && (
                            <div className="w-full h-24 sm:h-28 bg-gray-100 overflow-hidden">
                              <img
                                src={mainImage}
                                alt={name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.target.style.display = 'none'
                                }}
                              />
                            </div>
                          )}
                          <div className="p-2 sm:p-2.5">
                            <div className="flex items-start gap-1.5">
                              <FaCheckCircle className="text-green-600 text-xs mt-0.5 flex-shrink-0" />
                              <div className="flex flex-col flex-1 min-w-0">
                                <h3 className="font-semibold text-xs sm:text-sm text-gray-900 mb-0.5">{name}</h3>
                                <div className="flex flex-wrap gap-1.5 text-[10px] text-gray-600">
                                  {duration && (
                                    <span className="flex items-center gap-0.5">
                                      <FaClock className="text-[9px]" />
                                      {duration}-120 min
                                    </span>
                                  )}
                                  {category && (
                                    <span className="flex items-center gap-0.5">
                                      <FaTag className="text-[9px]" />
                                      {category}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  {/* Hidden Services with Grid Transition */}
                  {business.services.length > 12 && (
                    <div className={`grid transition-[grid-template-rows] duration-300 ease-out ${showAllServices ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
                      <div className="overflow-hidden">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 pt-2 sm:pt-3">
                          {business.services.slice(12).map((service, index) => {
                            const isObject = typeof service === 'object' && service !== null
                            const serviceKey = isObject && service?._id ? service._id : `extra-service-${index}`
                            const name =
                              (isObject && (service.name || service.serviceName || service.title)) ||
                              (typeof service === 'string' ? service : `Service ${index + 1}`)
                            const duration = isObject && service.duration ? `${service.duration} min` : ''
                            const category = isObject && service.category ? service.category : ''
                            const serviceImages = isObject && Array.isArray(service.images) ? service.images.filter(Boolean) : []
                            const hasImage = serviceImages.length > 0
                            const mainImage = hasImage ? serviceImages[0] : null

                            return (
                              <div
                                key={serviceKey}
                                className="bg-white border border-gray-200 overflow-hidden"
                              >
                                {hasImage && (
                                  <div className="w-full h-24 sm:h-28 bg-gray-100 overflow-hidden">
                                    <img
                                      src={mainImage}
                                      alt={name}
                                      className="w-full h-full object-cover"
                                      onError={(e) => {
                                        e.target.style.display = 'none'
                                      }}
                                    />
                                  </div>
                                )}
                                <div className="p-2 sm:p-2.5">
                                  <div className="flex items-start gap-1.5">
                                    <FaCheckCircle className="text-green-600 text-xs mt-0.5 flex-shrink-0" />
                                    <div className="flex flex-col flex-1 min-w-0">
                                      <h3 className="font-semibold text-xs sm:text-sm text-gray-900 mb-0.5">{name}</h3>
                                      <div className="flex flex-wrap gap-1.5 text-[10px] text-gray-600">
                                        {duration && (
                                          <span className="flex items-center gap-0.5">
                                            <FaClock className="text-[9px]" />
                                            {duration}-120 min
                                          </span>
                                        )}
                                        {category && (
                                          <span className="flex items-center gap-0.5">
                                            <FaTag className="text-[9px]" />
                                            {category}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    </div>
                  )}

                  {business.services.length > 12 && (
                    <div className={`relative z-10 bg-white pt-2 ${!showAllServices ? '-mt-12 pt-6 bg-gradient-to-t from-white via-white/90 to-transparent' : ''}`}>
                      <button
                        onClick={() => setShowAllServices(!showAllServices)}
                        className="w-full flex items-center justify-center gap-2 py-2 text-sm font-medium text-primary-600 bg-primary-50 hover:bg-primary-100 rounded transition-colors"
                      >
                        {showAllServices ? (
                          <>
                            Show Less <FaChevronUp className="text-xs" />
                          </>
                        ) : (
                          <>
                            Show more + {business.services.length - 12} services <FaChevronDown className="text-xs" />
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Features Section */}
              {business.features && business.features.length > 0 && (
                <div className="bg-white  border border-gray-200 p-4 sm:p-6">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4">Features</h2>

                  {/* Initial 8 Features */}
                  <div className="grid grid-cols-2 gap-2">
                    {business.features.slice(0, 8).map((feature, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-1 px-2.5 sm:px-3 py-1 sm:py-1.5 bg-purple-50 text-purple-700 text-xs sm:text-sm border border-purple-100"
                      >
                        <FaCheckCircle className="text-xs" />
                        {feature}
                      </span>
                    ))}
                  </div>

                  {/* Hidden Features with Grid Transition */}
                  {business.features.length > 8 && (
                    <div className={`grid transition-[grid-template-rows] duration-300 ease-out ${showAllFeatures ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
                      <div className="overflow-hidden">
                        <div className="grid grid-cols-2 gap-2 pt-2">
                          {business.features.slice(8).map((feature, index) => (
                            <span
                              key={`extra-feature-${index}`}
                              className="inline-flex items-center gap-1 px-2.5 sm:px-3 py-1 sm:py-1.5 bg-purple-50 text-purple-700 text-xs sm:text-sm border border-purple-100"
                            >
                              <FaCheckCircle className="text-xs" />
                              {feature}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {business.features.length > 8 && (
                    <div className={`relative z-10 bg-white pt-2 ${!showAllFeatures ? '-mt-8 pt-8 bg-gradient-to-t from-white via-white/90 to-transparent' : ''}`}>
                      <button
                        onClick={() => setShowAllFeatures(!showAllFeatures)}
                        className="w-full flex items-center justify-center gap-2 py-2 text-sm font-medium text-primary-600 bg-primary-50 hover:bg-primary-100 rounded transition-colors"
                      >
                        {showAllFeatures ? (
                          <>
                            Show Less <FaChevronUp className="text-xs" />
                          </>
                        ) : (
                          <>
                            Show more + {business.features.length - 8} features <FaChevronDown className="text-xs" />
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Amenities Section */}
              {business.amenities && business.amenities.length > 0 && (
                <div className="bg-white border border-gray-200 p-4 sm:p-6">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4">Amenities</h2>

                  {/* Initial 8 Amenities */}
                  <div className="grid grid-cols-2 gap-2">
                    {business.amenities.slice(0, 8).map((amenity, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-1 px-2.5 sm:px-3 py-1 sm:py-1.5 bg-indigo-50 text-indigo-700 text-xs sm:text-sm border border-indigo-100"
                      >
                        <FaCheckCircle className="text-xs" />
                        {amenity}
                      </span>
                    ))}
                  </div>

                  {/* Hidden Amenities with Grid Transition */}
                  {business.amenities.length > 8 && (
                    <div className={`grid transition-[grid-template-rows] duration-300 ease-out ${showAllAmenities ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
                      <div className="overflow-hidden">
                        <div className="grid grid-cols-2 gap-2 pt-2">
                          {business.amenities.slice(8).map((amenity, index) => (
                            <span
                              key={`extra-amenity-${index}`}
                              className="inline-flex items-center gap-1 px-2.5 sm:px-3 py-1 sm:py-1.5 bg-indigo-50 text-indigo-700 text-xs sm:text-sm border border-indigo-100"
                            >
                              <FaCheckCircle className="text-xs" />
                              {amenity}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {business.amenities.length > 8 && (
                    <div className={`relative z-10 bg-white pt-2 ${!showAllAmenities ? '-mt-8 pt-8 bg-gradient-to-t from-white via-white/90 to-transparent' : ''}`}>
                      <button
                        onClick={() => setShowAllAmenities(!showAllAmenities)}
                        className="w-full flex items-center justify-center gap-2 py-2 text-sm font-medium text-primary-600 bg-primary-50 hover:bg-primary-100 rounded transition-colors"
                      >
                        {showAllAmenities ? (
                          <>
                            Show Less <FaChevronUp className="text-xs" />
                          </>
                        ) : (
                          <>
                            Show more + {business.amenities.length - 8} amenities <FaChevronDown className="text-xs" />
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              )}


              {(mapCoordinates || business.googleMapsUrl) && (
                <div className="mt-6 sm:mt-8">
                  <div className="bg-white border border-gray-200 p-4 sm:p-6">
                    <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
                      <FaMapMarkerAlt className="text-primary-600 text-base sm:text-lg" />
                      <span>Location</span>
                    </h2>
                    <Suspense fallback={<div className="h-[400px] bg-gray-100 animate-pulse rounded"></div>}>
                      <Map
                        coordinates={mapCoordinates}
                        googleMapsUrl={business.googleMapsUrl}
                        zoom={mapZoom}
                        height="400px"
                        showLink={true}
                      />
                    </Suspense>
                  </div>
                </div>
              )}

              {/* Category & Tags */}
              {(business.category || (business.tags && business.tags.length > 0)) && (
                <div className="bg-white   border border-gray-200 p-4 sm:p-6">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4">Categories & Tags</h2>
                  <div className="flex flex-wrap gap-2">
                    {business.category && (
                      <span className="inline-flex items-center gap-1 px-2.5 sm:px-3 py-1 sm:py-1.5 bg-blue-50 text-blue-700  text-xs sm:text-sm border border-blue-100">
                        <FaTag className="text-xs" />
                        {business.category}
                      </span>
                    )}
                    {business.tags && business.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-2.5 sm:px-3 py-1 sm:py-1.5 bg-gray-100 text-gray-700  text-xs sm:text-sm border border-gray-200"
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
              {renderRatingsCard()}
              {renderFollowUsCard()}
              {renderBookingInfoCard()}
              {renderContactInfoCard()}

              {/* Working Hours */}
              {workingHoursList.length > 0 && (
                <div className="bg-white   border border-gray-200 p-4 sm:p-6">
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
            </div>
          </div>
        </div>

        {/* Ratings and reviews */}
        <LazySection fallback={<div className="h-64 bg-gray-100 animate-pulse rounded mt-10"></div>}>
          <Suspense fallback={<div className="h-64 bg-gray-100 animate-pulse rounded mt-10"></div>}>
            <BusinessInfoReviews business={business} />
          </Suspense>
        </LazySection>

        {/* Quick Actions - Mobile Sticky Bottom */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-40 p-4">
          <div className="flex gap-2">
            {business.phone && (
              <a
                href={`tel:${business.phone}`}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white  font-medium text-sm active:bg-blue-700"
              >
                <FaPhoneAlt style={shakeZoomAnimation} />
                <span>Call</span>
              </a>
            )}
            {whatsappUrl && (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white  font-medium text-sm active:bg-green-700"
              >
                <FaWhatsapp />
                <span>WhatsApp</span>
              </a>
            )}
            {business.appointmentSettings?.allowOnlineBooking && business.services && business.services.length > 0 && (
              <button
                onClick={handleBookNow}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-primary-600 text-white  font-semibold text-sm active:bg-primary-700"
              >
                <FaCalendarAlt />
                <span>Book</span>
              </button>
            )}
          </div>
        </div>

        {/* Floating Inquiry Button - Mobile only */}
        <button
          onClick={() => {
            trackLeadClick(business._id, 'inquiry');
            hasShownInquiryRef.current = true
            currentModalRef.current = 'inquiry'
            setIsInquiryOpen(true);
          }}
          className="lg:hidden fixed right-0 top-[60%] z-50 flex items-center justify-center gap-2 px-6 py-2 bg-primary-600 text-white rounded-t-xl shadow-xl border-x-2 border-t-2 border-white hover:bg-primary-700 active:bg-primary-800 transition-all duration-300 font-bold -rotate-90 origin-bottom-right"
          title="Send Enquiry"
        >
          <FaEnvelope className="text-sm" />
          <span className="text-xs uppercase tracking-widest">Enquiry</span>
          {/* Notification Dot Animation */}
          <span className="absolute -top-1 -left-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-primary-500 border-2 border-white"></span>
          </span>
        </button>
      </div>
    </div>
  )
}

export default BusinessInfo

