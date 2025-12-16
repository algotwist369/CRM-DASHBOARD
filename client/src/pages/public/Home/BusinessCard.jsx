import React, { memo, useState, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    FaCalendarAlt,
    FaMapMarkerAlt,
    FaStar,
    FaLocationArrow,
    FaChevronLeft,
    FaChevronRight
} from 'react-icons/fa'
import { IoMdCall } from 'react-icons/io'

/**
 * Memoized BusinessCard Component
 * Handles its own image gallery state to prevent parent re-renders
 */
const BusinessCard = memo(({
    business,
    viewMode,
    formatLocation,
    getMobileActionButtons,
    getDesktopActionButtons,
    onBookAppointment
}) => {
    const navigate = useNavigate()
    const [currentImageIndex, setCurrentImageIndex] = useState(0)

    // Memoize image collection
    const cardImages = useMemo(() => {
        if (!business?.images) return []
        const imageFields = ['banner', 'thumbnail', 'logo']
        const images = imageFields
            .map(field => business.images[field])
            .filter(Boolean)

        const galleryImages = Array.isArray(business.images.gallery)
            ? business.images.gallery.filter(Boolean)
            : []

        return [...images, ...galleryImages]
    }, [business?.images])

    // Reset index if business changes (though component key usually handles this)
    // We rely on the parent using a proper key (business.id) to remount the component if the business changes completely

    // Format phone number for WhatsApp
    const whatsappNumber = business.phone?.replace(/[^0-9]/g, '') || business.socialMedia?.whatsapp?.replace(/[^0-9]/g, '') || ''
    const whatsappUrl = whatsappNumber ? `https://wa.me/${whatsappNumber}` : null

    // Format location address
    const locationText = formatLocation(business)

    const totalImages = cardImages.length
    const currentImage = cardImages[currentImageIndex] || null
    const desktopImage = cardImages[0] || null

    const handleCardClick = useCallback(() => {
        navigate(`/${business.businessLink}`)
    }, [navigate, business.businessLink])

    const handleImageNavClick = useCallback((e, direction) => {
        e.stopPropagation()
        setCurrentImageIndex(prev => {
            if (direction === 'prev') {
                return (prev - 1 + totalImages) % totalImages
            }
            return (prev + 1) % totalImages
        })
    }, [totalImages])

    const handleDotClick = useCallback((e, idx) => {
        e.stopPropagation()
        setCurrentImageIndex(idx)
    }, [])

    return (
        <div
            className="bg-white border border-gray-100 rounded-lg overflow-hidden cursor-pointer hover:shadow-md transition-shadow duration-200 active:scale-[0.98]"
            style={{ minHeight: 'auto', maxHeight: 'none' }}
            onClick={handleCardClick}
        >
            {/* Mobile Layout */}
            <div className="flex sm:hidden">
                {/* Business Image */}
                <div className="relative w-[35%] xs:w-[40%] aspect-square overflow-hidden flex-shrink-0">
                    {currentImage ? (
                        <img
                            src={currentImage}
                            alt={business.name}
                            className="w-full h-full object-cover object-center"
                            loading="lazy"
                            decoding="async"
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
                                className="max-w-[65%] max-h-[65%] object-cover object-center"
                                loading="lazy"
                                decoding="async"
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
                            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-white/95 text-gray-900 rounded text-[10px] font-semibold border border-gray-200">
                                <FaLocationArrow className="text-primary-600 text-[10px]" />
                                {business.distanceKm} km
                            </span>
                        </div>
                    )}

                    {cardImages.length > 1 && (
                        <div className="absolute inset-0 flex items-center justify-between px-1.5 xs:px-2 pointer-events-none">
                            <button
                                type="button"
                                className="text-white bg-black/30 hover:bg-black/50 rounded-full p-1.5 min-w-[36px] min-h-[36px] flex items-center justify-center touch-manipulation pointer-events-auto transition-all duration-200"
                                onClick={(e) => handleImageNavClick(e, 'prev')}
                                aria-label="Previous image"
                            >
                                <FaChevronLeft className="text-sm xs:text-base drop-shadow-lg" />
                            </button>
                            <button
                                type="button"
                                className="text-white bg-black/30 hover:bg-black/50 rounded-full p-1.5 min-w-[36px] min-h-[36px] flex items-center justify-center touch-manipulation pointer-events-auto transition-all duration-200"
                                onClick={(e) => handleImageNavClick(e, 'next')}
                                aria-label="Next image"
                            >
                                <FaChevronRight className="text-sm xs:text-base drop-shadow-lg" />
                            </button>
                        </div>
                    )}
                    {totalImages > 1 && (
                        <div className="absolute bottom-2 inset-x-0 flex justify-center gap-1.5 xs:gap-2 px-2">
                            {cardImages.map((_, idx) => (
                                <button
                                    key={idx}
                                    type="button"
                                    onClick={(e) => handleDotClick(e, idx)}
                                    className={`h-2 w-2 xs:h-2.5 xs:w-2.5 rounded-full transition-all duration-200 touch-manipulation min-w-[8px] min-h-[8px] ${idx === currentImageIndex ? 'bg-white shadow-md scale-110' : 'bg-white/50 hover:bg-white/70'}`}
                                    aria-label={`Go to image ${idx + 1}`}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* Business Info */}
                <div className="flex-1 min-w-0 p-2.5 xs:p-3 flex flex-col justify-between">
                    <div className="space-y-1.5 xs:space-y-2">
                        <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0 flex-1">
                                <h3 className="text-sm xs:text-sm font-bold text-gray-900 leading-tight line-clamp-2">
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
                                            <span className="inline-flex items-center gap-0.5 xs:gap-1 px-1.5 xs:px-2 py-0.5 bg-amber-100 text-amber-700 text-[9px] xs:text-[10px] font-semibold rounded-full whitespace-nowrap ml-auto">
                                                <FaStar className="text-amber-500 text-[9px] xs:text-[10px] flex-shrink-0" />
                                                <span className="hidden xs:inline">Top Rated</span>
                                                <span className="xs:hidden">Top</span>
                                            </span>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {locationText && (
                            <div className="flex items-center gap-1 xs:gap-1.5 text-gray-600 min-w-0">
                                <FaMapMarkerAlt className="text-primary-500 text-[10px] xs:text-xs flex-shrink-0" />
                                <span className="text-xs xs:text-xs line-clamp-1 truncate min-w-0 flex-1">
                                    {locationText}
                                </span>
                                {viewMode === 'nearby' && business.distanceKm && (
                                    <span className="text-[9px] xs:text-[10px] text-gray-400 ml-0.5 flex-shrink-0">• {business.distanceKm} km</span>
                                )}
                            </div>
                        )}

                        {business.services?.length > 0 && (
                            <div className="mt-1.5 xs:mt-2">
                                <div className="text-[10px] xs:text-[11px] font-semibold text-gray-700 mb-1">
                                    Popular Services
                                </div>
                                <div className="flex flex-wrap gap-1 xs:gap-1.5">
                                    {business.services.slice(0, 3).map((service, idx) => (
                                        <span
                                            key={idx}
                                            className="inline-flex items-center px-1.5 xs:px-2 py-0.5 xs:py-1 bg-primary-50 text-primary-700 text-[9px] xs:text-[10px] rounded-full border border-primary-100 line-clamp-1 max-w-full"
                                        >
                                            {service.name || service}
                                        </span>
                                    ))}
                                    {business.services.length > 3 && (
                                        <span className="text-[9px] xs:text-[10px] text-gray-500 self-center">
                                            +{business.services.length - 3} more
                                        </span>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="pt-2 xs:pt-2.5 border-t border-gray-100 mt-auto">
                        <div className="flex gap-1.5 xs:gap-2">
                            {getMobileActionButtons(business, whatsappUrl).map((btn, idx) => {
                                const Icon = btn.icon
                                const commonProps = {
                                    className: btn.className,
                                    onClick: (e) => {
                                        e.stopPropagation()
                                        if (btn.onClick) btn.onClick(e)
                                    },
                                    ...(btn.title && { title: btn.title })
                                }

                                return btn.type === 'link' ? (
                                    <a
                                        key={idx}
                                        {...commonProps}
                                        href={btn.href}
                                        {...(btn.target && { target: btn.target })}
                                        {...(btn.rel && { rel: btn.rel })}
                                    >
                                        <Icon className={`${btn.iconSize} flex-shrink-0`} />
                                        <span className="truncate">{btn.label}</span>
                                    </a>
                                ) : (
                                    <button key={idx} {...commonProps}>
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
                            className="w-full h-full object-cover object-center"
                            loading="lazy"
                            decoding="async"
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
                                loading="lazy"
                                decoding="async"
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
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-white/95 text-gray-900 rounded text-xs font-semibold border border-gray-200">
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
                                    <span className="text-gray-900 font-bold text-sm">
                                        {business.ratings.average.toFixed(1)}
                                    </span>
                                    {business.ratings.totalReviews > 0 && (
                                        <span className="text-gray-500 text-xs ml-0.5">
                                            ({business.ratings.totalReviews})
                                        </span>
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
                                <span className="text-sm line-clamp-1">{locationText}</span>
                                {viewMode === 'nearby' && business.distanceKm && (
                                    <span className="text-xs text-gray-400 ml-0.5">
                                        • {business.distanceKm} km
                                    </span>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="mt-auto space-y-2 xs:space-y-2 pt-2 xs:pt-2.5 border-t border-gray-100">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onBookAppointment(business.businessLink);
                            }}
                            className="w-full flex items-center justify-center gap-1.5 xs:gap-2 px-4 xs:px-4 py-2.5 xs:py-2.5 bg-primary-600 text-white font-semibold border-0 rounded-lg text-sm xs:text-sm transition-all duration-200 hover:bg-primary-700 active:bg-primary-800 active:scale-[0.98] min-h-[44px] touch-manipulation"
                        >
                            <FaCalendarAlt className="text-sm xs:text-sm flex-shrink-0" />
                            <span>Book Appointment</span>
                        </button>

                        <div className="grid grid-cols-2 gap-2 xs:gap-2">
                            {getDesktopActionButtons(business, whatsappUrl).map((btn, idx) => {
                                const Icon = btn.icon;
                                return (
                                    <a
                                        key={idx}
                                        href={btn.href}
                                        onClick={(e) => e.stopPropagation()}
                                        className={`${btn.className} min-h-[40px] touch-manipulation active:scale-95 transition-transform duration-150`}
                                        {...(btn.target && { target: btn.target })}
                                        {...(btn.rel && { rel: btn.rel })}
                                    >
                                        <Icon className={btn.iconSize} />
                                        <span className="truncate">{btn.label}</span>
                                    </a>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}, (prevProps, nextProps) => {
    // Custom comparison function for better performance
    return (
        prevProps.business.id === nextProps.business.id &&
        prevProps.viewMode === nextProps.viewMode &&
        prevProps.business.distanceKm === nextProps.business.distanceKm
    )
})

BusinessCard.displayName = 'BusinessCard'

export default BusinessCard

