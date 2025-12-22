import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useInfiniteQuery } from '@tanstack/react-query';
import publicService from '../../../services/public/publicService';
import { Button } from '../../../components/common';
import SkeletonSearch from './SkeletonSearch';
import LazySection from '../../../components/common/LazySection/LazySection';
import { FiMapPin, FiSearch, FiX, FiAlertCircle, FiFilter } from 'react-icons/fi';
import { FaWhatsapp, FaStar, FaPhoneAlt } from 'react-icons/fa';
import SEO from '../../../components/common/SEO';

// Static Constants - Outside component to prevent recreation
const FILTER_CATEGORIES = ['Hotel', 'Spa', 'Salon', 'Gym', 'Restaurant'];
const RATING_OPTIONS = [4, 3, 2];
const SORT_OPTIONS = [
    { value: 'recommended', label: 'Recommended' },
    { value: 'distance', label: 'Distance' },
    { value: 'rating', label: 'Rating' }
];

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
                <div className="absolute top-2 left-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded z-10">
                    {distanceText} from center
                </div>
            )}

            {/* Slider Indicators */}
            {hasMultiple && (
                <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1 z-10">
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

const SearchBusinessCard = React.memo(({ business }) => {
    const navigate = useNavigate();

    // Collect all valid images: Main image + Gallery
    const allImages = React.useMemo(() =>
        [business.image, ...(business.gallery || [])].filter(Boolean),
        [business.image, business.gallery]
    );

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
        }
    ], [business.name, business.phone, business.socialMedia?.whatsapp]);

    return (
        <div
            onClick={() => {
                console.log("Card clicked!", business.businessLink);
                if (business.businessLink) {
                    navigate(`/${business.businessLink}`);
                } else {
                    console.warn("No businessLink found for:", business.name);
                }
            }}
            className="bg-white cursor-pointer border border-gray-200 mb-3 hover:shadow-md transition-shadow relative overflow-hidden"
        >
            {/* Top Section: Image + Content */}
            <div className="flex flex-row gap-3 p-3">
                {/* Image Slider Section */}
                <ImageSlider
                    images={displayImages}
                    name={business.name}
                    distanceText={business.distanceText}
                />

                {/* Content Section */}
                <div className="flex-1 flex flex-col justify-between">
                    <div>
                        <div className="flex justify-between items-start">
                            <div className="min-w-0 flex-1 mr-2">
                                <h3 className="text-sm md:w-full w-[160px] md:text-lg font-bold text-gray-900 mb-1 truncate">{business.name}</h3>
                                <p className="hidden md:block text-sm text-primary-600 mb-1.5 font-medium truncate">{business.address}</p>
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

                        <div className="hidden md:flex flex-wrap gap-2 text-[10px] text-green-600">
                            {business.features?.slice(0, 4).map((feature, i) => (
                                <span key={i} className="flex items-center whitespace-nowrap max-w-full">
                                    <span className="mr-1">✓</span> <span className="truncate">{feature}</span>
                                </span>
                            ))}
                        </div>
                    </div>

                    <div className="hidden md:flex items-center justify-between mt-2 pt-2 border-t border-gray-100 gap-2">
                        <div className="flex gap-2 flex-1 overflow-x-auto md:overflow-visible pb-1 md:pb-0 scrollbar-hide">
                            {actions.map((action, index) => (
                                action.condition && (
                                    <a
                                        key={index}
                                        href={action.href}
                                        target={action.target}
                                        rel={action.rel}
                                        onClick={action.onClick}
                                        className={`flex items-center gap-1.5 px-4 py-2 rounded-full border text-sm font-medium transition-colors whitespace-nowrap ${action.className}`}
                                        title={action.title}
                                    >
                                        {action.icon}
                                        <span>{action.text}</span>
                                    </a>
                                )
                            ))}
                        </div>

                        {business.businessLink && (
                            <Button
                                variant="primary"
                                className="hidden md:block bg-primary-500 hover:bg-primary-600 text-white px-3 py-1.5 rounded text-xs font-semibold whitespace-nowrap"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    navigate(`/${business.businessLink}`);
                                }}
                            >
                                View Details
                            </Button>
                        )}
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
    const navigate = useNavigate(); // Added for safety if needed, though useSearchParams handles updates

    // Local UI State
    const [localQuery, setLocalQuery] = useState(searchParams.get('q') || '');

    // Removed local results/loading state - handled by Query
    const [isLocationInitialized, setIsLocationInitialized] = useState(false);
    const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

    // Initial Geolocation Logic - Simplified to just setup
    useEffect(() => {
        window.scrollTo(0, 0);
        if (isLocationInitialized) return;

        const hasLat = searchParams.get('lat');
        const hasLng = searchParams.get('lng');
        const hasQuery = searchParams.get('q');
        const hasCategory = searchParams.get('category');

        if ((hasLat && hasLng) || hasQuery || hasCategory) {
            setIsLocationInitialized(true);
            return;
        }

        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const current = Object.fromEntries(searchParams.entries());
                    setSearchParams({
                        ...current,
                        lat: position.coords.latitude.toString(),
                        lng: position.coords.longitude.toString()
                    });
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isLocationInitialized]);

    // Helper now needed again for handlers
    const updateParams = useCallback((newParams) => {
        const current = Object.fromEntries(searchParams.entries());
        setSearchParams({ ...current, ...newParams });
    }, [searchParams, setSearchParams]);

    // Pagination State
    // 2. React Query for Infinite Search
    const getSearchParamsObj = () => ({
        q: searchParams.get('q') || '',
        lat: searchParams.get('lat') || '',
        lng: searchParams.get('lng') || '',
        category: searchParams.get('category') || '',
        rating: searchParams.get('rating') || 0,
        sort: searchParams.get('sort') || 'recommended',
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
    const handleSearchSubmit = () => {
        updateParams({ q: localQuery });
    };

    const handleClearAll = () => {
        setLocalQuery('');
        setSearchParams({}); // Clears all params
        // Note: clearing params triggers main effect -> fetches global 'all'
    };
    // Derived state for UI inputs from URL
    const currentCategory = searchParams.get('category') || '';
    const currentRating = parseInt(searchParams.get('rating') || '0');
    const currentSort = searchParams.get('sort') || 'recommended';
    const currentLat = searchParams.get('lat');

    // Dynamic SEO Metadata
    const seoTitle = localQuery ? `Search Results for "${localQuery}"` :
        currentCategory ? `Best ${currentCategory}s Near Me` :
            "Search for Spa, Salon, and Wellness Centers";

    const seoDesc = `Find the best ${localQuery || currentCategory || "Spa and Salons"} in your area. Read reviews, check prices, and book appointments online at SpaAdvisor.`;


    return (
        <div className="bg-gray-50 min-h-screen">
            <SEO
                title={seoTitle}
                description={seoDesc}
                canonical={`/search?q=${localQuery || ''}&category=${currentCategory || ''}`}
            />
            <WiggleStyles />
            {/* Simple White Header - Fixed (Desktop Only) */}
            <div className="hidden md:block bg-white border-b border-gray-200 fixed top-14 left-0 right-0 z-20 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <div className="flex flex-col md:flex-row gap-4 items-center">
                        <div className="flex-1 w-full flex flex-col md:flex-row items-center gap-4">
                            {/* Location Display (Read-Only/Reset) */}
                            <div className="relative w-full md:w-1/3">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <FiMapPin className="h-5 w-5 text-gray-400" />
                                </div>
                                <div
                                    className="w-full pl-10 pr-3 py-2 border border-gray-300  leading-5 bg-white placeholder-gray-500 focus:outline-none focus:border-primary-500 sm:text-sm truncate cursor-pointer hover:bg-gray-50 flex items-center justify-between"
                                    onClick={() => {
                                        // Toggle: If has location, clear it. If not, maybe re-trigger geo?
                                        // For now, simpler to just allow clearing to "All Locations"
                                        if (currentLat) {
                                            updateParams({ lat: '', lng: '' });
                                        } else {
                                            // Resetting initialization to force re-geo could be an option, but explicit is better for users.
                                            setIsLocationInitialized(false); // This effectively triggers the mount logic again
                                        }
                                    }}
                                >
                                    <span>{currentLat ? "Near Me" : "All Locations"}</span>
                                    {currentLat && <FiX className="text-gray-400" />}
                                </div>
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

            <div className="max-w-7xl mx-auto px-4 py-6 flex flex-col lg:flex-row gap-8 pt-20 md:pt-40">
                {/* Sidebar Filters */}
                <div className={`
                    fixed inset-0 z-50 bg-white p-4 overflow-y-auto transition-transform duration-300 ease-in-out transform
                    lg:relative lg:inset-auto lg:z-auto lg:bg-transparent lg:p-0 lg:overflow-visible lg:transform-none lg:w-64 lg:flex-shrink-0 lg:block
                    ${isMobileFiltersOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
                `}>
                    <div className="bg-white border-0 lg:border border-gray-200 lg:p-4 lg:sticky lg:top-24 h-full lg:h-auto">
                        <div className="flex justify-between items-center mb-6 lg:mb-4 pb-4 border-b border-gray-100">
                            <h3 className="font-semibold text-gray-900 text-lg lg:text-base">Filters</h3>
                            <button
                                onClick={() => setIsMobileFiltersOpen(false)}
                                className="lg:hidden p-2 text-gray-500 hover:text-gray-700"
                            >
                                <FiX className="w-6 h-6" />
                            </button>
                            <button
                                onClick={handleClearAll}
                                className="hidden lg:block text-xs text-primary-600 hover:text-primary-800 font-medium"
                            >
                                Clear All
                            </button>
                        </div>


                        {/* Mobile Search Inputs */}
                        <div className="lg:hidden mb-6 space-y-4 border-b border-gray-100 pb-6">
                            <div className="flex flex-col gap-3">
                                <div className="relative w-full">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <FiMapPin className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <div
                                        className="w-full pl-10 pr-3 py-2 border border-gray-300  leading-5 bg-white placeholder-gray-500 focus:outline-none focus:border-primary-500 sm:text-sm truncate cursor-pointer hover:bg-gray-50 flex items-center justify-between rounded-md"
                                        onClick={() => {
                                            if (currentLat) {
                                                updateParams({ lat: '', lng: '' });
                                            } else {
                                                setIsLocationInitialized(false);
                                                setIsMobileFiltersOpen(false); // Close drawer to trigger location
                                            }
                                        }}
                                    >
                                        <span>{currentLat ? "Near Me" : "All Locations"}</span>
                                        {currentLat && <FiX className="text-gray-400" />}
                                    </div>
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

                        <FilterSection title="Categories">
                            <div className="space-y-2">
                                {FILTER_CATEGORIES.map(cat => (
                                    <label key={cat} className="flex items-center gap-3 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                                            checked={currentCategory === cat.toLowerCase()}
                                            onChange={() => {
                                                const newCat = currentCategory === cat.toLowerCase() ? '' : cat.toLowerCase();
                                                updateParams({ category: newCat });
                                            }}
                                        />
                                        <span className="text-sm text-gray-700">{cat}</span>
                                    </label>
                                ))}
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
                                                <SearchBusinessCard business={business} />
                                            </LazySection>
                                        </div>
                                    );
                                } else {
                                    return (
                                        <LazySection key={business._id || business.id || index} fallback={placeholder}>
                                            <SearchBusinessCard business={business} />
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
        </div >
    );
};

export default Search;
