import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useSearchParams, useNavigate, useParams } from 'react-router-dom';
import { useInfiniteQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import publicService from '../../../services/public/publicService';
import { Button } from '../../../components/common';
import SkeletonSearch from './SkeletonSearch';
import LazySection from '../../../components/common/LazySection/LazySection';
import { FiMapPin, FiSearch, FiX, FiAlertCircle, FiFilter, FiMaximize2 } from 'react-icons/fi';
import { BiSolidNavigation } from "react-icons/bi";
import { FaWhatsapp, FaStar, FaPhoneAlt, FaEnvelope } from 'react-icons/fa';
import SEO from '../../../components/common/SEO';
import InquiryModal from '../../../components/public/Inquiry/InquiryModal';
import MapLocationPicker from '../../../components/common/MapLocationPicker';

// Static Constants - Outside component to prevent recreation
// Spa-specific service categories aligned with backend API
const FILTER_CATEGORIES = ['Spa', 'Massage', 'Salon', 'Ayurvedic', 'Wellness'];
const RATING_OPTIONS = [4, 3, 2];
const SORT_OPTIONS = [
    { value: 'recommended', label: 'Recommended' },
    { value: 'distance', label: 'Distance' },
    { value: 'rating', label: 'Rating' },
    { value: 'price', label: 'Price (Low to High)' }
];

// Helper to parse natural language queries
const parseSearchQuery = (input) => {
    if (!input) return { q: '', location: '', params: {} };

    let q = input.trim();
    let location = '';
    const params = {};

    // 1. "Near Me" / "Nearby" - Strip these as they imply default geo-search
    // Use regex to remove them from query so strict text match doesn't fail
    const nearMeRegex = /\b(?:near\s*me|nearby|close\s*to\s*me|around\s*me|closest|nearest)\b/gi;
    if (nearMeRegex.test(q)) {
        q = q.replace(nearMeRegex, '').trim();
        // No specific params needed, just relying on geo lat/lng or default sort
    }

    // 2. Extract Location ("in [Location]", "at [Location]", "near [Location]")
    // Matches "Spa in Vashi", "Best gym near Andheri"
    // We prioritize "in/at" for explicit location. "Near" logic might overlap with near me, but "near Vashi" is valid.
    const locationMatch = q.match(/\s+(?:in|at|near)\s+([a-zA-Z0-9\s,]+?)(?:\s+(?:with|for|under|above|$)|$)/i);
    if (locationMatch) {
        // Verify captured group isn't just a keyword like "me"
        const captured = locationMatch[1].trim();
        if (!/^(me|us|here)$/i.test(captured)) {
            location = captured;
            q = q.replace(locationMatch[0], '').trim();
        }
    }

    // 3. Price Intelligence
    // "under 500", "below 1000"
    const priceMatch = q.match(/\s+(?:under|below|less than)\s+(\d+)/i);
    if (priceMatch) {
        params.maxPrice = priceMatch[1];
        q = q.replace(priceMatch[0], '').trim();
    }

    // "cheap", "affordable", "budget" -> Sort by price, maybe set explicit max cap?
    const cheapMatch = q.match(/\b(?:cheap|affordable|budget|low cost|economical)\b/i);
    if (cheapMatch) {
        params.sort = 'price';
        if (!params.maxPrice) params.maxPrice = '2500'; // Default budget cap?
        q = q.replace(cheapMatch[0], '').trim();
    }

    // 4. Rating / Quality / Luxury
    // "luxury", "5 star", "premium" -> High rating, maybe High price?
    const luxuryMatch = q.match(/\b(?:luxury|premium|5\s*star|high\s*end)\b/i);
    if (luxuryMatch) {
        params.minRating = 4.5;
        params.sort = 'rating';
        // params.minPrice = '2000'; // Optional: valid for luxury?
        q = q.replace(luxuryMatch[0], '').trim();
    }

    // "best", "top rated"
    const ratingMatch = q.match(/\b(?:best|top\s*rated|top|good|famous|trusted)\b/i);
    if (ratingMatch) {
        params.minRating = 4;
        params.sort = 'rating';
        q = q.replace(ratingMatch[0], '').trim();
    }

    // 5. Offers
    const offerMatch = q.match(/\b(?:offer|offers|deal|deals|discount|sale)\b/i);
    if (offerMatch) {
        params.offers = true;
        q = q.replace(offerMatch[0], '').trim();
    }

    // 6. Explicit Sorting Keywords
    if (/\b(?:cheapest|lowest\s*price)\b/i.test(q)) {
        params.sort = 'price';
        q = q.replace(/\b(?:cheapest|lowest\s*price)\b/i, '').trim();
    }

    // 7. Time/Availability (Strip for now as backend doesn't fully support "open now" filtering yet)
    // "open now", "open today", "24 hour"
    // Keeping "24 hour" might be useful if it's in the name/tags?
    const timeMatch = q.match(/\b(?:open\s*now|open\s*today)\b/i);
    if (timeMatch) {
        // params.isOpen = true; // TODO: Implement backend support
        q = q.replace(timeMatch[0], '').trim();
    }

    // 8. Cleanup connectors (with, for) if they are dangling or at start
    // "Spa for men" -> "Spa men" (preserving "men" is good, "for" is noise)
    // But be careful: "Spa for" -> ""
    q = q.replace(/\s+\b(?:for|with)\b\s+/gi, ' ').trim(); // Replace inline "for" with space
    q = q.replace(/\s+\b(?:for|with)\b$/gi, '').trim();    // Remove trailing "for"
    q = q.replace(/^\b(?:for|with)\b\s+/gi, '').trim();    // Remove leading "for"

    // 9. Gender/Type/Service preservation
    // We strictly KEEP words like: men, women, couple, male, female, unisex, steam, sauna, ayurvedic, thai
    // The query 'q' sent to backend will be "Spa men" or "Couple Massage"

    // Final check: if q became empty but had params (e.g. "Best near me" -> q=""), 
    // we might want to default q to "Spa" or "Salon" or just empty (shows all)?
    // "Best near me" -> q="", sort=rating. Result: All high-rated businesses. Correct.

    return { q, location, params };
};

const WiggleStyles = React.memo(() => (
    <style>
        {`
            @keyframes wiggle {
                0%, 20% { transform: rotate(0deg) scale(1); }
                5%, 15% { transform: rotate(15deg) scale(1.4); color: #fb2424ff; }
                10% { transform: rotate(-15deg) scale(1.4); color: #fb2424ff; }
                100% { transform: rotate(0deg) scale(1); }
            }
        `}
    </style>
));

const wiggleAnimation = { animation: 'wiggle 2s linear infinite' };

// Image Slider Component
const ImageSlider = React.memo(({ images, name, distanceText }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const timeoutRef = useRef(null);

    const hasMultiple = images.length > 1;

    const resetTimeout = () => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
    };

    useEffect(() => {
        if (hasMultiple) {
            resetTimeout();
            timeoutRef.current = setTimeout(() => {
                setCurrentIndex((prevIndex) =>
                    prevIndex === images.length - 1 ? 0 : prevIndex + 1
                );
            }, 3000); // Change image every 3 seconds

            return () => {
                resetTimeout();
            };
        }
    }, [currentIndex, hasMultiple, images.length]);

    return (
        <div className="w-28 h-28 md:w-56 md:h-auto md:min-h-[12rem] bg-gray-100 overflow-hidden flex-shrink-0 relative group">
            <div
                className="w-full h-full flex transition-transform duration-500 ease-in-out"
                style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
                {images.map((img, idx) => (
                    <img
                        key={idx}
                        src={img || "/placeholder-business.jpg"}
                        alt={`${name} - View ${idx + 1}`}
                        className="w-full h-full object-cover flex-shrink-0"
                        loading="lazy"
                        decoding="async"
                    />
                ))}
            </div>

            {distanceText && (
                <div className="absolute top-2 left-2 bg-black bg-opacity-70 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-md z-10 flex items-center gap-1 shadow-sm">
                    <BiSolidNavigation className="w-4 h-4 text-primary-400" />
                    <span className="font-medium">{distanceText}</span>
                </div>
            )}

            {/* Slider Indicators */}
            {hasMultiple && (
                <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1 z-10 transition-opacity duration-300 opacity-0 group-hover:opacity-100">
                    {images.map((_, idx) => (
                        <div
                            key={idx}
                            className={`w-1.5 h-1.5 rounded-full transition-colors ${currentIndex === idx ? "bg-white" : "bg-white/50"
                                }`}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}, (prevProps, nextProps) => {
    // Only re-render if images array reference or distanceText changes
    return prevProps.images === nextProps.images &&
        prevProps.distanceText === nextProps.distanceText;
});

const SearchBusinessCard = React.memo(({ business, onInquiry }) => {
    const navigate = useNavigate();

    // Collect all valid images: Main image + Gallery (excluding 360 embeds and iframes)
    const allImages = React.useMemo(() => {
        const gallery = (business.gallery || []).filter(img => {
            // Skip if not a string
            if (typeof img !== 'string') return false;

            // Skip embedded content (iframes, 360 viewers)
            if (img.includes('<iframe') || img.includes('iframe.') || img.includes('embed/')) {
                return false;
            }

            // Keep all other images (regular URLs, relative paths, etc.)
            return true;
        });
        return [business.image, ...gallery].filter(Boolean);
    }, [business.image, business.gallery]);

    const displayImages = allImages.length > 0 ? allImages : ["/placeholder-business.jpg"];

    const actions = React.useMemo(() => [
        {
            condition: !!business.phone,
            href: `tel:${business.phone}`,
            onClick: (e) => e.stopPropagation(),
            icon: <FaPhoneAlt className="w-5 h-5" style={wiggleAnimation} />,
            text: <><span className="md:hidden">Call</span><span className="hidden md:inline">Call Now</span></>,
            title: "Call Now",
            className: "bg-primary-500 text-white hover:bg-primary-600 shadow-md border-transparent flex-1 justify-center"
        },
        {
            condition: !!business.socialMedia?.whatsapp,
            href: `https://wa.me/${business.socialMedia?.whatsapp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hi ${business.name || 'Business'}, I found your business on SpaAdvisor and would like to inquire about your services.`)}`,
            target: "_blank",
            rel: "noopener noreferrer",
            onClick: (e) => e.stopPropagation(),
            icon: <FaWhatsapp className="w-5 h-5" />,
            text: <><span className="md:hidden">WA</span><span className="hidden md:inline">WhatsApp</span></>,
            title: "Chat on WhatsApp",
            className: "bg-green-500 text-white hover:bg-green-600 shadow-md border-transparent flex-1 justify-center"
        },
        {
            condition: true,
            onClick: (e) => {
                e.stopPropagation();
                onInquiry(business);
            },
            icon: <FaEnvelope className="w-5 h-5" />,
            text: <><span className="md:hidden">Inq</span><span className="hidden md:inline">Inquiry</span></>,
            title: "Send Inquiry",
            className: "bg-white text-primary-600 border-primary-600 hover:bg-primary-50 flex-1 justify-center"
        }
    ], [business, onInquiry]);

    return (
        <div
            onClick={() => {
                if (business.businessLink) {
                    navigate(`/${business.businessLink}`);
                } else {
                    console.warn("No businessLink found for:", business.name);
                }
            }}
            className="bg-white cursor-pointer border border-gray-200 mb-3 hover:shadow-md transition-shadow relative overflow-hidden max-w-7xl mx-auto"
        >
            {/* Top Section: Image + Content */}
            <div className="flex flex-row gap-3 p-3">
                {/* Image Slider Section */}
                <ImageSlider
                    images={displayImages}
                    name={business.name}
                    distanceText={
                        business.distanceText ||
                        (business.distance ? `${(business.distance / 1000).toFixed(1)} km` : null)
                    }
                />

                {/* Content Section */}
                <div className="flex-1 flex flex-col justify-between">
                    <div>
                        <div className="flex justify-between items-start">
                            <div className="min-w-0 flex-1 mr-2">
                                <h3 className="text-sm md:w-full w-[160px] md:text-lg font-bold text-gray-900 mb-1 truncate">{business.name}</h3>
                                <p className="hidden md:block text-sm text-primary-600 mb-1.5 font-medium max-w-[900px] truncate overflow-hidden">{business.address}</p>
                                <p className="md:hidden text-xs text-primary-600 mb-1.5 font-medium truncate">{business.branch || business.address}</p>
                            </div>
                            <div className="flex flex-col items-end flex-shrink-0">
                                <div className="flex items-center gap-1 bg-primary-500 text-white px-1.5 py-0.5 rounded text-[10px] md:text-sm font-bold">
                                    <span>{business.ratings?.average ? Number(business.ratings.average).toFixed(1) : "New"}</span>
                                    <FaStar className="w-2.5 h-2.5 md:w-3 md:h-3 text-yellow-400" />
                                </div>
                                <span className="text-[8px] md:text-[10px] text-gray-500 mt-0.5 text-right">{business.ratings?.totalReviews || 0} Ratings</span>
                            </div>

                        </div>

                        {/* Services */}
                        {business.services && business.services.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-1.5 overflow-hidden h-auto">
                                {business.services.slice(0, 3).map((service, idx) => (
                                    <span key={idx} className="text-[10px] bg-purple-50 text-purple-700 px-1.5 py-0.5 rounded border border-purple-100 font-medium whitespace-nowrap max-w-[70px] md:max-w-[80px] truncate">
                                        {service.name}
                                    </span>
                                ))}
                                {business.services.length > 3 && (
                                    <span className="text-[10px] bg-gray-50 text-gray-600 px-1.5 py-0.5 rounded border border-gray-200 font-medium whitespace-nowrap">
                                        +{business.services.length - 3} more
                                    </span>
                                )}
                            </div>
                        )}

                        <div className="hidden md:flex items-center gap-1.5 mb-1.5 flex-wrap">
                            {/* Tags/Categories */}
                            <span className="text-[10px] border border-gray-300 px-1.5 py-0.5 rounded text-gray-600 capitalize whitespace-nowrap max-w-full truncate">
                                {business.category}
                            </span>
                            {business.tags?.slice(0, 3).map((tag, idx) => (
                                <span key={idx} className="text-[10px] bg-gray-100 px-1.5 py-0.5 rounded text-gray-500 whitespace-nowrap max-w-full truncate">
                                    {tag}
                                </span>
                            ))}
                        </div>

                        <p className="text-xs text-gray-600 line-clamp-2 mb-1.5 max-w-[220px] md:max-w-full">
                            {business.snippet || business.description}
                        </p>

                        {/* Offers/Features - Updated to use offers from controller */}
                        <div className="hidden md:flex flex-wrap gap-2 text-[10px] text-green-600">
                            {business.offers?.slice(0, 4).map((offer, i) => (
                                <span key={i} className="flex items-center whitespace-nowrap max-w-full">
                                    <span className="mr-1">✓</span>
                                    <span className="truncate">
                                        {typeof offer === 'string' ? offer : offer.name || offer.title || "Special Offer"}
                                    </span>
                                </span>
                            ))}
                        </div>
                    </div>

                    <div className="hidden md:flex items-center justify-between mt-2 pt-2 border-t border-gray-100 gap-2">
                        <div className="flex gap-2 flex-1 overflow-x-auto md:overflow-visible pb-1 md:pb-0 scrollbar-hide">
                            {actions.map((action, index) => {
                                if (!action.condition && !action.onClick) return null;

                                return action.href ? (
                                    <a
                                        key={index}
                                        href={action.href}
                                        target={action.target}
                                        rel={action.rel}
                                        onClick={action.onClick}
                                        title={action.title}
                                        className={`flex items-center gap-1.5 px-4 py-2 rounded-full border text-sm font-medium transition-colors whitespace-nowrap ${action.className}`}
                                    >
                                        {action.icon}
                                        <span>{action.text}</span>
                                    </a>
                                ) : (
                                    <button
                                        key={index}
                                        onClick={action.onClick}
                                        className={`flex items-center gap-1.5 px-4 py-2 rounded-full border text-sm font-medium transition-colors whitespace-nowrap ${action.className}`}
                                        title={action.title}
                                    >
                                        {action.icon}
                                        <span>{action.text}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Actions Footer (Rounded Buttons) */}
            <div className="md:hidden flex gap-2 px-3 pb-3">
                {!!business.phone && (
                    <a
                        href={`tel:${business.phone}`}
                        onClick={(e) => e.stopPropagation()}
                        className="flex-1 flex items-center justify-center gap-2 bg-primary-500 text-white font-semibold text-sm hover:bg-primary-600 transition-colors rounded-lg py-2.5 shadow-sm"
                    >
                        <FaPhoneAlt className="w-4 h-4" style={wiggleAnimation} />
                        <span>Call</span>
                    </a>
                )}
                {!!business.socialMedia?.whatsapp && (
                    <a
                        href={`https://wa.me/${business.socialMedia?.whatsapp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hi ${business.name || 'Business'}, I found your business on SpaAdvisor and would like to inquire about your services.`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="flex-1 flex items-center justify-center gap-2 bg-green-500 text-white font-semibold text-sm hover:bg-green-600 transition-colors rounded-lg py-2.5 shadow-sm"
                    >
                        <FaWhatsapp className="w-5 h-5" />
                        <span>WA</span>
                    </a>
                )}
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onInquiry(business);
                    }}
                    className="flex-1 flex items-center justify-center gap-2 bg-white text-primary-600 border border-primary-600 font-semibold text-sm hover:bg-primary-50 transition-colors rounded-lg py-2.5 shadow-sm"
                >
                    <FaEnvelope className="w-4 h-4" />
                    <span>Inquiry</span>
                </button>
            </div>
        </div>
    );
}, (prevProps, nextProps) => {
    // Only re-render if business ID or distanceText changes
    return prevProps.business.id === nextProps.business.id &&
        prevProps.business.distanceText === nextProps.business.distanceText;
});

const FilterSection = ({ title, children }) => (
    <div className="mb-6 border-b border-gray-100 pb-4">
        <h4 className="font-semibold text-gray-900 mb-3">{title}</h4>
        {children}
    </div>
);

const Search = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const { location: routeLocation, query: routeQuery } = useParams();
    const navigate = useNavigate();

    // Derived state for UI inputs from URL - Move Up for initialization
    const currentLocation = searchParams.get('location') || routeLocation;
    const currentLat = searchParams.get('lat');

    // Local UI State
    const [localQuery, setLocalQuery] = useState(searchParams.get('q') || routeQuery || '');
    const [localLocation, setLocalLocation] = useState(currentLocation || '');
    const [inquiryBusiness, setInquiryBusiness] = useState(null);

    // Sync local location with URL param changes
    useEffect(() => {
        if (currentLocation !== localLocation) {
            // Only update if not currently focused? For simplicity, sync if URL changes externally
            // But if user is typing, we shouldn't overwrite. 
            // Ideally valid location from URL overrides only on mount or navigation.
            setLocalLocation(currentLocation || '');
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentLocation]);


    // Removed local results/loading state - handled by Query
    const [isLocationInitialized, setIsLocationInitialized] = useState(false);
    const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
    const [isMapModalOpen, setIsMapModalOpen] = useState(false);

    // Sync Route Params to Search Params (for /spa/:location/:query)
    useEffect(() => {
        if (routeLocation || routeQuery) {
            const newParams = { ...Object.fromEntries(searchParams.entries()) };
            let hasChanges = false;

            // If route has location, prioritize it over 'lat/lng' or 'location' param
            if (routeLocation && routeLocation !== 'all') {
                if (newParams.location !== routeLocation) {
                    newParams.location = routeLocation;
                    // Clear coords if text location is provided strictly via route?
                    // actually if we have coords, we might keep them if they match? 
                    // simpler to clear to ensure we search by name if name provided.
                    delete newParams.lat;
                    delete newParams.lng;
                    hasChanges = true;
                }
            }

            if (routeQuery) {
                if (newParams.q !== routeQuery) {
                    newParams.q = routeQuery;
                    hasChanges = true;
                    setLocalQuery(routeQuery);
                }
            }

            if (hasChanges) {
                setSearchParams(newParams);
            }
        }
    }, [routeLocation, routeQuery, searchParams, setSearchParams]);

    // Initial Geolocation Logic - Simplified to just setup
    useEffect(() => {
        window.scrollTo(0, 0);
        if (isLocationInitialized) return;

        const hasLat = searchParams.get('lat');
        const hasLng = searchParams.get('lng');
        const hasQuery = searchParams.get('q');
        const hasCategory = searchParams.get('category');
        const hasLocation = searchParams.get('location');

        if ((hasLat && hasLng) || hasQuery || hasCategory || hasLocation || routeLocation) {
            setIsLocationInitialized(true);
            return;
        }

        // Trigger Geo
        triggerGeolocation();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isLocationInitialized]);


    const triggerGeolocation = () => {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const lat = position.coords.latitude;
                    const lng = position.coords.longitude;

                    const current = Object.fromEntries(searchParams.entries());
                    const updates = {
                        ...current,
                        lat: lat.toString(),
                        lng: lng.toString()
                    };

                    // Reverse Geocoding to get name
                    try {
                        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
                        const data = await response.json();
                        const address = data.address || {};

                        // Construct a more descriptive name: "Locality, City"
                        const locality = address.suburb || address.neighbourhood || address.city_district || address.village || address.area;
                        const city = address.city || address.town || address.municipality;
                        const state = address.state;

                        let locationName = "Current Location";
                        if (locality && city) {
                            locationName = `${locality}, ${city}`;
                        } else if (locality) {
                            locationName = `${locality}${state ? `, ${state}` : ''}`;
                        } else if (city) {
                            locationName = `${city}${state ? `, ${state}` : ''}`;
                        }

                        updates.location = locationName;
                        setLocalLocation(locationName);
                    } catch (error) {
                        console.error("Reverse geocoding failed:", error);
                        setLocalLocation("Near Me");
                    }

                    setSearchParams(updates);
                    setIsLocationInitialized(true);
                },
                (error) => {
                    console.log("Location auto-detection failed/denied:", error);
                    setIsLocationInitialized(true);
                },
                { timeout: 8000 }
            );
        } else {
            setIsLocationInitialized(true);
        }
    };

    // Helper now needed again for handlers
    const updateParams = useCallback((newParams) => {
        const current = Object.fromEntries(searchParams.entries());
        const updated = { ...current, ...newParams };

        // Remove undefined/null/empty values
        Object.keys(updated).forEach(key => {
            if (updated[key] === undefined || updated[key] === null || updated[key] === '') {
                delete updated[key];
            }
        });

        setSearchParams(updated);
    }, [searchParams, setSearchParams]);

    // Pagination State
    // 2. React Query for Infinite Search
    const getSearchParamsObj = () => ({
        q: searchParams.get('q') || routeQuery || '',
        lat: searchParams.get('lat') || '',
        lng: searchParams.get('lng') || '',
        location: searchParams.get('location') || routeLocation || '',
        category: searchParams.get('category') || '',
        rating: searchParams.get('rating') || 0,
        sort: searchParams.get('sort') || 'recommended',
        radius: searchParams.get('radius') || 5000,
        // Add other filters
        offers: searchParams.get('offers'),
        service: searchParams.get('service'),
        minRating: searchParams.get('minRating'),
    });

    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading,
        isError,
        error
    } = useInfiniteQuery({
        queryKey: ['searchResults', getSearchParamsObj()],
        queryFn: async ({ pageParam = 1 }) => {
            const params = {
                ...getSearchParamsObj(),
                minRating: searchParams.get('rating') || 0, // mapping rating -> minRating
                page: pageParam,
                limit: 10
            };
            const response = await publicService.searchBusinesses(params);
            if (!response.success) {
                throw new Error(response.error || "Failed to fetch results");
            }
            return response.data; // Expected { results: [], totalResults: X }
        },
        getNextPageParam: (lastPage, allPages) => {
            const currentCount = allPages.flatMap(p => p.results).length;
            if (currentCount < lastPage.totalResults) {
                return allPages.length + 1;
            }
            return undefined;
        },
        enabled: isLocationInitialized,
        staleTime: 5 * 60 * 1000, // 5 minutes
        keepPreviousData: true
    });

    // Flatten results from all pages
    const results = useMemo(() => {
        return data?.pages.flatMap(page => page.results) || [];
    }, [data]);

    const totalResults = data?.pages[0]?.totalResults || 0;

    // Structure Data for SEO
    const structuredData = useMemo(() => {
        if (!results.length) return null;

        return {
            "@context": "https://schema.org",
            "@type": "ItemList",
            "itemListElement": results.map((business, index) => ({
                "@type": "ListItem",
                "position": index + 1,
                "item": {
                    "@type": "LocalBusiness",
                    "name": business.name,
                    "image": business.image,
                    "telephone": business.phone,
                    "address": {
                        "@type": "PostalAddress",
                        "streetAddress": business.address
                    },
                    "aggregateRating": business.ratings?.average ? {
                        "@type": "AggregateRating",
                        "ratingValue": business.ratings.average,
                        "reviewCount": business.ratings.totalReviews
                    } : undefined,
                    "url": `${window.location.origin}/${business.businessLink}`
                }
            }))
        };
    }, [results]);

    // Infinite Scroll Observer
    const observer = useRef();
    const lastBusinessElementRef = useCallback(node => {
        if (isLoading || isFetchingNextPage) return;
        if (observer.current) observer.current.disconnect();
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasNextPage) {
                fetchNextPage();
            }
        });
        if (node) observer.current.observe(node);
    }, [isLoading, isFetchingNextPage, hasNextPage, fetchNextPage]);

    // Handlers
    // Helper to get coordinates for a location string
    const getCoordinatesForLocation = useCallback(async (locationStr) => {
        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(locationStr)}`);
            const data = await response.json();
            if (data && data.length > 0) {
                return { lat: data[0].lat, lng: data[0].lon };
            }
        } catch (error) {
            console.error("Forward geocoding failed:", error);
        }
        return null;
    }, []);

    // Handlers
    const handleLocationSubmit = async () => {
        if (!localLocation.trim()) {
            updateParams({ lat: '', lng: '', location: '' });
            if (routeLocation && routeLocation !== 'all') navigate('/spa');
            return;
        }

        // Navigate to new location path
        const q = localQuery || '';
        const loc = localLocation.trim();
        const nextPath = q ? `/spa/${encodeURIComponent(loc)}/${encodeURIComponent(q)}` : `/spa/${encodeURIComponent(loc)}`;

        // Clear existing coords first
        const currentParams = new URLSearchParams(searchParams);
        currentParams.delete('lat');
        currentParams.delete('lng');
        currentParams.delete('location');
        if (q) currentParams.delete('q');

        // Geocode the new location to get coords for distance
        const coords = await getCoordinatesForLocation(loc);
        if (coords) {
            currentParams.set('lat', coords.lat);
            currentParams.set('lng', coords.lng);
        }

        navigate(`${nextPath}?${currentParams.toString()}`);
    };

    const handleSearchSubmit = async () => {
        const { q, location, params } = parseSearchQuery(localQuery);

        // If location found in query (e.g. "in Vashi"), use that
        // OR if localLocation is set, use that
        // BUT if extracted 'location' is empty, do NOT fallback to 'localLocation' instantly if we want strict text?
        // Actually, if I type "Spa" in box while input says "Vashi", I expect "Spa in Vashi".
        const targetLocation = location || (localLocation !== "Near Me" && localLocation !== "Current Location" ? localLocation : '');

        if (targetLocation) {
            // Navigate to clean URL /spa/[location]/[query]
            const nextPath = q ? `/spa/${encodeURIComponent(targetLocation)}/${encodeURIComponent(q)}` : `/spa/${encodeURIComponent(targetLocation)}`;

            // Preserve existing filters + add extracted ones
            const currentParams = new URLSearchParams(searchParams);

            // Add extracted params (offers, price, etc.)
            Object.entries(params).forEach(([key, value]) => {
                if (value) currentParams.set(key, value);
            });

            // Remove q/location params as they are in path
            currentParams.delete('q');
            currentParams.delete('location');

            // Geocode target location
            const coords = await getCoordinatesForLocation(targetLocation);
            if (coords) {
                currentParams.set('lat', coords.lat);
                currentParams.set('lng', coords.lng);
            } else {
                // If geocoding fails, maybe should we clear old lat/lng to avoid "Near Me" confusion?
                // Yes, clear them if we are moving to a new explicitly named location that we couldn't geocode
                currentParams.delete('lat');
                currentParams.delete('lng');
            }

            navigate(`${nextPath}?${currentParams.toString()}`);
        } else {

            const updates = { q };
            Object.assign(updates, params);

            updateParams(updates);
        }
    };

    const handleClearAll = () => {
        setLocalQuery('');
        setLocalLocation('');
        setSearchParams({}); // Clears all params
        navigate('/spa'); // Reset to base route
    };

    // Derived state for UI inputs from URL
    const currentCategory = searchParams.get('category') || '';
    const currentRating = parseInt(searchParams.get('rating') || '0');
    const currentSort = searchParams.get('sort') || 'recommended';

    // Dynamic SEO Metadata
    const locationName = localLocation && localLocation !== "Near Me" && localLocation !== "Current Location"
        ? localLocation
        : "Near You";

    const searchTerm = localQuery || currentCategory || "Spa & Wellness";

    const seoTitle = localQuery && localLocation && localLocation !== "Near Me" && localLocation !== "Current Location"
        ? `${localQuery} in ${localLocation} - Find Best ${searchTerm} | SpaAdvisor`
        : localQuery
            ? `${localQuery} Near Me - Top Rated ${searchTerm} Centers | SpaAdvisor`
            : currentCategory
                ? `Best ${currentCategory}s ${locationName} - Reviews & Prices | SpaAdvisor`
                : `Find Best Spa, Salon & Wellness Centers ${locationName} | SpaAdvisor`;

    const seoDesc = `Find the best ${searchTerm} in ${locationName}. Read verified reviews, compare prices, and book appointments online. Pan-India coverage with 20km radius search. ⭐ Top rated services.`;

    const seoKeywords = [
        searchTerm.toLowerCase(),
        `${searchTerm.toLowerCase()} near me`,
        `best ${searchTerm.toLowerCase()} in ${locationName.toLowerCase()}`,
        `${searchTerm.toLowerCase()} ${locationName.toLowerCase()}`,
        "spa booking",
        "salon near me",
        "wellness center",
        currentCategory ? `${currentCategory.toLowerCase()} near me` : "",
        "affordable spa",
        "luxury spa"
    ].filter(Boolean).join(", ");


    return (
        <div className="bg-gray-50 min-h-screen">
            <SEO
                title={seoTitle}
                description={seoDesc}
                keywords={seoKeywords}
                canonical={`/spa?q=${localQuery || ''}&category=${currentCategory || ''}`}
            />
            {structuredData && (
                <Helmet>
                    <script type="application/ld+json">
                        {JSON.stringify(structuredData)}
                    </script>
                </Helmet>
            )}
            <WiggleStyles />

            {/* Simple White Header - Fixed (Desktop Only) */}
            <div className="hidden md:block bg-white border-b border-gray-200 fixed top-14 left-0 right-0 z-20 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <div className="flex flex-col md:flex-row gap-4 items-center">
                        <div className="flex-1 w-full flex flex-col md:flex-row items-center gap-4">
                            {/* Location Display (Editable Input) */}
                            <div className="relative w-full md:w-1/3">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <FiMapPin className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    className="block w-full pl-10 pr-10 py-2 border border-gray-300  leading-5 bg-white placeholder-gray-500 focus:outline-none focus:border-primary-500 sm:text-sm"
                                    placeholder="Location (e.g. Vashi)"
                                    value={localLocation}
                                    onChange={(e) => setLocalLocation(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleLocationSubmit()}
                                />
                                {localLocation ? (
                                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer" onClick={() => {
                                        setLocalLocation('');
                                    }}>
                                        <FiX className="text-gray-400 hover:text-gray-600" />
                                    </div>
                                ) : (
                                    <div
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer group"
                                        onClick={triggerGeolocation}
                                        title="Use my location"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 group-hover:text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                    </div>
                                )}
                            </div>

                            {/* Search Input */}
                            <div className="relative w-full md:w-2/3">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <FiSearch className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    className="block w-full pl-10 pr-3 py-2 border border-gray-300  leading-5 bg-white placeholder-gray-500 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 sm:text-sm"
                                    placeholder="Search by name, category, service..."
                                    value={localQuery}
                                    onChange={(e) => setLocalQuery(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSearchSubmit()}
                                />
                            </div>
                        </div>

                        <button
                            onClick={handleSearchSubmit}
                            className="w-full md:w-auto px-6 py-2 border border-transparent text-sm font-medium  text-white bg-primary-500 hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                        >
                            Search
                        </button>
                    </div>
                </div>
            </div>

            {/* Sidebar Filters */}
            <div className="max-w-[99rem] mx-auto px-4 py-6 flex flex-col lg:flex-row gap-8 pt-0 md:pt-32">

                {/* Desktop Sidebar (New Professional Design) */}
                <div className="hidden lg:block w-80 flex-shrink-0">
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm sticky top-24 overflow-hidden">
                        {/* Header */}
                        <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <h3 className="font-bold text-gray-900">Filters</h3>
                            {(currentRating > 0 || searchParams.get('radius') || searchParams.get('lat')) && (
                                <button
                                    onClick={handleClearAll}
                                    className="text-xs font-semibold text-primary-600 hover:text-primary-700 hover:underline"
                                >
                                    Clear All
                                </button>
                            )}
                        </div>

                        <div className="p-5 space-y-6">
                            {/* Location Section */}
                            <div>
                                <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center justify-between">
                                    <span className="flex items-center gap-2"><FiMapPin className="text-gray-400" /> Select Location</span>
                                    <button
                                        onClick={() => setIsMapModalOpen(true)}
                                        className="text-primary-600 hover:text-primary-700 p-1.5 hover:bg-primary-50 rounded-md transition-colors"
                                        title="View Full Map"
                                    >
                                        <FiMaximize2 className="w-4 h-4" />
                                    </button>
                                </h4>
                                <div className="rounded-lg overflow-hidden border border-gray-200 shadow-sm mb-3 h-48">
                                    <MapLocationPicker
                                        initialLat={parseFloat(searchParams.get('lat')) || 20.5937}
                                        initialLng={parseFloat(searchParams.get('lng')) || 78.9629}
                                        radius={parseInt(searchParams.get('radius')) || 5000}
                                        className="h-full border-none rounded-none"
                                        onLocationChange={async (coords) => {
                                            updateParams({ lat: coords.lat, lng: coords.lng });
                                            // Reverse geocode handled same as mobile
                                            try {
                                                const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords.lat}&lon=${coords.lng}`);
                                                const data = await response.json();
                                                const address = data.address || {};
                                                const locality = address.suburb || address.neighbourhood || address.city_district || address.village || address.area;
                                                const city = address.city || address.town || address.municipality;
                                                const state = address.state;
                                                let locationName = "Selected Location";
                                                if (locality && city) locationName = `${locality}, ${city}`;
                                                else if (locality) locationName = `${locality}${state ? `, ${state}` : ''}`;
                                                else if (city) locationName = `${city}${state ? `, ${state}` : ''}`;
                                                updateParams({ location: locationName });
                                                setLocalLocation(locationName);
                                            } catch (error) {
                                                console.error("Reverse geocoding failed:", error);
                                            }
                                        }}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <button
                                        onClick={async () => {
                                            if ("geolocation" in navigator) {
                                                navigator.geolocation.getCurrentPosition(
                                                    async (position) => {
                                                        const lat = position.coords.latitude;
                                                        const lng = position.coords.longitude;
                                                        updateParams({ lat, lng });
                                                        try {
                                                            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
                                                            const data = await response.json();
                                                            const address = data.address || {};
                                                            const locality = address.suburb || address.neighbourhood || address.city_district || address.village || address.area;
                                                            const city = address.city || address.town || address.municipality;
                                                            const state = address.state;
                                                            let locationName = "Current Location";
                                                            if (locality && city) locationName = `${locality}, ${city}`;
                                                            else if (locality) locationName = `${locality}${state ? `, ${state}` : ''}`;
                                                            else if (city) locationName = `${city}${state ? `, ${state}` : ''}`;
                                                            updateParams({ location: locationName });
                                                            setLocalLocation(locationName);
                                                        } catch (error) {
                                                            setLocalLocation("Current Location");
                                                        }
                                                    },
                                                    (error) => console.error("Geolocation error:", error)
                                                );
                                            }
                                        }}
                                        className="py-1.5 px-3 text-xs font-medium text-primary-700 bg-primary-50 hover:bg-primary-100 border border-primary-100 rounded-md transition-colors text-center"
                                    >
                                        Use Current
                                    </button>
                                    <button
                                        onClick={() => updateParams({ lat: undefined, lng: undefined })}
                                        className="py-1.5 px-3 text-xs font-medium text-gray-600 bg-white hover:bg-gray-50 border border-gray-200 rounded-md transition-colors text-center"
                                    >
                                        Reset Map
                                    </button>
                                </div>
                            </div>

                            <hr className="border-gray-100" />

                            {/* Distance Section */}
                            <div>
                                <div className="flex items-center justify-between mb-3">
                                    <h4 className="text-sm font-semibold text-gray-900">Distance</h4>
                                    <span className="text-xs font-medium text-primary-600 bg-primary-50 px-2 py-0.5 rounded-full">
                                        {Math.round((searchParams.get('radius') || 5000) / 1000)} km
                                    </span>
                                </div>
                                <input
                                    type="range"
                                    min="1000"
                                    max="50000"
                                    step="1000"
                                    value={searchParams.get('radius') || 5000}
                                    onChange={(e) => updateParams({ radius: e.target.value })}
                                    className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-500 hover:accent-primary-600"
                                />
                                <div className="flex justify-between text-[10px] text-gray-400 mt-1 font-medium">
                                    <span>5 km</span>
                                    <span>50 km</span>
                                </div>
                            </div>

                            <hr className="border-gray-100" />

                            {/* Rating Section */}
                            <div>
                                <h4 className="text-sm font-semibold text-gray-900 mb-3">Rating</h4>
                                <div className="space-y-1.5">
                                    {RATING_OPTIONS.map(rating => (
                                        <label key={rating} className="flex items-center gap-3 cursor-pointer group p-2 rounded-lg hover:bg-gray-50 -mx-2 transition-colors">
                                            <div className="relative flex items-center">
                                                <input
                                                    type="checkbox"
                                                    className="peer h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded cursor-pointer"
                                                    checked={currentRating === rating}
                                                    onChange={() => {
                                                        const newRating = currentRating === rating ? 0 : rating;
                                                        updateParams({ rating: newRating });
                                                    }}
                                                />
                                            </div>
                                            <span className="text-sm text-gray-600 group-hover:text-gray-900 flex items-center gap-1.5">
                                                <div className="flex gap-0.5">
                                                    {[...Array(5)].map((_, i) => (
                                                        <FaStar
                                                            key={i}
                                                            className={`w-3.5 h-3.5 ${i < rating ? 'text-yellow-400' : 'text-gray-200'}`}
                                                        />
                                                    ))}
                                                </div>
                                                <span className="text-xs font-medium text-gray-500">& Up</span>
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Mobile Sidebar (Preserved Logic) */}
                <div className={`
                    fixed inset-0 z-50 bg-white p-4 overflow-y-auto transition-transform duration-300 ease-in-out transform
                    lg:hidden
                    ${isMobileFiltersOpen ? 'translate-x-0' : '-translate-x-full'}
                `}>
                    <div className="bg-white border-0 h-full">
                        <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100">
                            <h3 className="font-semibold text-gray-900 text-lg">Filters</h3>
                            <button
                                onClick={() => setIsMobileFiltersOpen(false)}
                                className="p-2 text-gray-500 hover:text-gray-700"
                            >
                                <FiX className="w-6 h-6" />
                            </button>
                        </div>


                        {/* Mobile Search Inputs */}
                        <div className="mb-6 space-y-4 border-b border-gray-100 pb-6">
                            <div className="flex flex-col gap-3">
                                <div className="relative w-full">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <FiMapPin className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="text"
                                        className="w-full pl-10 pr-10 py-2 border border-gray-300 leading-5 bg-white placeholder-gray-500 focus:outline-none focus:border-primary-500 sm:text-sm rounded-md"
                                        placeholder="Location (e.g. Vashi)"
                                        value={localLocation}
                                        onChange={(e) => setLocalLocation(e.target.value)}
                                        onKeyPress={(e) => {
                                            if (e.key === 'Enter') {
                                                handleLocationSubmit();
                                                setIsMobileFiltersOpen(false);
                                            }
                                        }}
                                    />
                                    {localLocation ? (
                                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer" onClick={() => {
                                            setLocalLocation('');
                                        }}>
                                            <FiX className="text-gray-400 hover:text-gray-600" />
                                        </div>
                                    ) : (
                                        <div
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer group"
                                            onClick={() => {
                                                triggerGeolocation();
                                                setIsMobileFiltersOpen(false);
                                            }}
                                            title="Use my location"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 group-hover:text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                        </div>
                                    )}
                                </div>

                                <div className="relative w-full">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <FiSearch className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="text"
                                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 sm:text-sm"
                                        placeholder="Search by name, category, service..."
                                        value={localQuery}
                                        onChange={(e) => setLocalQuery(e.target.value)}
                                        onKeyPress={(e) => {
                                            if (e.key === 'Enter') {
                                                handleSearchSubmit();
                                                setIsMobileFiltersOpen(false);
                                            }
                                        }}
                                    />
                                </div>

                                <button
                                    onClick={() => {
                                        handleSearchSubmit();
                                        setIsMobileFiltersOpen(false);
                                    }}
                                    className="w-full px-6 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-500 hover:bg-primary-600 focus:outline-none"
                                >
                                    Search
                                </button>
                            </div>
                        </div>

                        {/* Mobile specific clear all */}
                        <div className="lg:hidden mb-6">
                            <button
                                onClick={() => {
                                    handleClearAll();
                                    setIsMobileFiltersOpen(false);
                                }}
                                className="w-full py-2 border border-primary-500 text-primary-600 rounded-lg text-sm font-medium hover:bg-primary-50"
                            >
                                Clear All Filters
                            </button>
                        </div>


                        <FilterSection title="Location Map">
                            <div className="space-y-3">
                                <MapLocationPicker
                                    initialLat={parseFloat(searchParams.get('lat')) || 20.5937}
                                    initialLng={parseFloat(searchParams.get('lng')) || 78.9629}
                                    radius={parseInt(searchParams.get('radius')) || 20000}
                                    onLocationChange={async (coords) => {
                                        // Update coordinates
                                        updateParams({ lat: coords.lat, lng: coords.lng });

                                        // Reverse geocode to get location name
                                        try {
                                            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords.lat}&lon=${coords.lng}`);
                                            const data = await response.json();
                                            const address = data.address || {};

                                            // Construct location name
                                            const locality = address.suburb || address.neighbourhood || address.city_district || address.village || address.area;
                                            const city = address.city || address.town || address.municipality;
                                            const state = address.state;

                                            let locationName = "Selected Location";
                                            if (locality && city) {
                                                locationName = `${locality}, ${city}`;
                                            } else if (locality) {
                                                locationName = `${locality}${state ? `, ${state}` : ''}`;
                                            } else if (city) {
                                                locationName = `${city}${state ? `, ${state}` : ''}`;
                                            }

                                            // Update location in search params and local state
                                            updateParams({ location: locationName });
                                            setLocalLocation(locationName);
                                        } catch (error) {
                                            console.error("Reverse geocoding failed:", error);
                                        }
                                    }}
                                />
                                <div className="flex gap-2">
                                    <button
                                        onClick={async () => {
                                            if ("geolocation" in navigator) {
                                                navigator.geolocation.getCurrentPosition(
                                                    async (position) => {
                                                        const lat = position.coords.latitude;
                                                        const lng = position.coords.longitude;

                                                        updateParams({ lat, lng });

                                                        // Reverse geocode to get location name
                                                        try {
                                                            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
                                                            const data = await response.json();
                                                            const address = data.address || {};

                                                            const locality = address.suburb || address.neighbourhood || address.city_district || address.village || address.area;
                                                            const city = address.city || address.town || address.municipality;
                                                            const state = address.state;

                                                            let locationName = "Current Location";
                                                            if (locality && city) {
                                                                locationName = `${locality}, ${city}`;
                                                            } else if (locality) {
                                                                locationName = `${locality}${state ? `, ${state}` : ''}`;
                                                            } else if (city) {
                                                                locationName = `${city}${state ? `, ${state}` : ''}`;
                                                            }

                                                            updateParams({ location: locationName });
                                                            setLocalLocation(locationName);
                                                        } catch (error) {
                                                            console.error("Reverse geocoding failed:", error);
                                                            setLocalLocation("Current Location");
                                                        }
                                                    },
                                                    (error) => console.error("Geolocation error:", error)
                                                );
                                            }
                                        }}
                                        className="flex-1 px-3 py-2 text-xs border border-primary-500 text-primary-600 rounded hover:bg-primary-50 font-medium"
                                    >
                                        📍 Use Current Location
                                    </button>
                                    <button
                                        onClick={() => updateParams({ lat: undefined, lng: undefined })}
                                        className="px-3 py-2 text-xs border border-gray-300 text-gray-600 rounded hover:bg-gray-50"
                                    >
                                        Clear
                                    </button>
                                </div>
                            </div>
                        </FilterSection>

                        <FilterSection title="Rating">
                            <div className="space-y-2">
                                {RATING_OPTIONS.map(rating => (
                                    <label key={rating} className="flex items-center gap-3 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                                            checked={currentRating === rating}
                                            onChange={() => {
                                                const newRating = currentRating === rating ? 0 : rating;
                                                updateParams({ rating: newRating });
                                            }}
                                        />
                                        <span className="text-sm text-gray-700 flex items-center gap-1">
                                            <span>{rating}+ Stars</span>
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </FilterSection>

                        <FilterSection title="Distance">
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">Within {Math.round((searchParams.get('radius') || 20000) / 1000)} km</span>
                                </div>
                                <input
                                    type="range"
                                    min="5000"
                                    max="50000"
                                    step="5000"
                                    value={searchParams.get('radius') || 20000}
                                    onChange={(e) => updateParams({ radius: e.target.value })}
                                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-500"
                                />
                                <div className="flex justify-between text-xs text-gray-500">
                                    <span>5 km</span>
                                    <span>50 km</span>
                                </div>
                            </div>
                        </FilterSection>

                    </div>
                </div>

                {/* Results List */}
                <div className="flex-1">
                    <div className="flex flex-row flex-wrap items-center justify-between mb-3 gap-2">
                        <div className="flex items-center gap-2">
                            {/* Mobile Filter Toggle */}
                            <button
                                onClick={() => setIsMobileFiltersOpen(true)}
                                className="lg:hidden flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-gray-700 text-xs font-medium hover:bg-gray-50 justify-center"
                            >
                                <FiFilter className="w-3.5 h-3.5" />
                                <span className="hidden xs:inline">Filters</span>
                            </button>
                            <h2 className="text-sm font-semibold text-gray-900 whitespace-nowrap">
                                {totalResults} Results
                            </h2>
                        </div>
                        <div className="flex items-center gap-2">
                            <label className="text-xs text-gray-500 hidden sm:block">Sort by:</label>
                            <select
                                value={currentSort}
                                onChange={(e) => updateParams({ sort: e.target.value })}
                                className="text-xs py-1.5 pl-2 pr-6 border-gray-300 focus:ring-primary-500 focus:border-primary-500 rounded-md bg-white"
                            >
                                {SORT_OPTIONS.map(option => (
                                    <option key={option.value} value={option.value}>{option.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {isLoading ? (
                        <SkeletonSearch />
                    ) : isError ? (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-12 text-center">
                            <div className="flex justify-center mb-4">
                                <FiAlertCircle className="w-12 h-12 text-red-500" />
                            </div>
                            <h3 className="text-lg font-medium text-red-800 mb-2">Oops! Something went wrong</h3>
                            <p className="text-red-600 mb-6">{error?.message || "Error fetching data"}</p>
                            <button
                                onClick={() => window.location.reload()}
                                className="px-4 py-2 bg-white border border-red-200 text-red-700 rounded-md hover:bg-red-50 font-medium transition-colors"
                            >
                                Try Again
                            </button>
                        </div>
                    ) : results.length > 0 ? (
                        <div className="space-y-4">
                            {results.map((business, index) => {
                                // Create a placeholder that matches roughly the card height to minimize layout shift
                                const placeholder = <div className="h-48 w-full bg-gray-100 rounded-lg animate-pulse" />;

                                if (results.length === index + 1) {
                                    return (
                                        <div ref={lastBusinessElementRef} key={business._id || business.id || index}>
                                            <LazySection fallback={placeholder}>
                                                <SearchBusinessCard
                                                    business={business}
                                                    onInquiry={(biz) => setInquiryBusiness(biz)}
                                                />
                                            </LazySection>
                                        </div>
                                    );
                                } else {
                                    return (
                                        <LazySection key={business._id || business.id || index} fallback={placeholder}>
                                            <SearchBusinessCard
                                                business={business}
                                                onInquiry={(biz) => setInquiryBusiness(biz)}
                                            />
                                        </LazySection>
                                    );
                                }
                            })}
                            {isFetchingNextPage && <SkeletonSearch />}
                        </div>
                    ) : (
                        <div className="bg-white border border-gray-200 p-12 text-center">
                            <p className="text-gray-500 text-lg">No businesses found matching your criteria.</p>
                            <button
                                onClick={handleClearAll}
                                className="mt-4 text-primary-600 hover:text-primary-800 font-medium"
                            >
                                Clear all filters
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Map Selection Modal */}
            {isMapModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fadeIn">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden animate-scaleIn">
                        {/* Modal Header */}
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                <FiMapPin className="text-primary-500" /> Select Search Location
                            </h3>
                            <button
                                onClick={() => setIsMapModalOpen(false)}
                                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <FiX className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Map Container */}
                        <div className="flex-1 relative w-full bg-gray-100 flex flex-col">
                            <MapLocationPicker
                                initialLat={parseFloat(searchParams.get('lat')) || 20.5937}
                                initialLng={parseFloat(searchParams.get('lng')) || 78.9629}
                                radius={parseInt(searchParams.get('radius')) || 5000}
                                className="h-full w-full border-none rounded-none"
                                onLocationChange={async (coords) => {
                                    updateParams({ lat: coords.lat, lng: coords.lng });
                                    try {
                                        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords.lat}&lon=${coords.lng}`);
                                        const data = await response.json();
                                        const address = data.address || {};
                                        const locality = address.suburb || address.neighbourhood || address.city_district || address.village || address.area;
                                        const city = address.city || address.town || address.municipality;
                                        const state = address.state;
                                        let locationName = "Selected Location";
                                        if (locality && city) locationName = `${locality}, ${city}`;
                                        else if (locality) locationName = `${locality}${state ? `, ${state}` : ''}`;
                                        else if (city) locationName = `${city}${state ? `, ${state}` : ''}`;
                                        updateParams({ location: locationName });
                                        setLocalLocation(locationName);
                                    } catch (error) {
                                        console.error("Reverse geocoding failed:", error);
                                    }
                                }}
                            />
                        </div>

                        {/* Modal Footer */}
                        <div className="px-6 py-4 border-t border-gray-100 flex justify-between items-center bg-white">
                            <p className="text-sm text-gray-500">
                                Drag the map to pinpoint your search area
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setIsMapModalOpen(false)}
                                    className="px-5 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => setIsMapModalOpen(false)}
                                    className="px-6 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 shadow-sm"
                                >
                                    Confirm Location
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Inquiry Modal */}
            <InquiryModal
                isOpen={!!inquiryBusiness}
                onClose={() => setInquiryBusiness(null)}
                businessId={inquiryBusiness?._id || inquiryBusiness?.id}
                businessName={inquiryBusiness?.name}
            />
        </div >
    );
};

export default Search;
