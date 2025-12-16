import React, { useState, useEffect, useCallback } from 'react'
import { FaExpand, FaChevronLeft, FaChevronRight, FaMapMarkerAlt, FaCalendarAlt } from 'react-icons/fa'
import MediaRenderer from './MediaRenderer'

const HeroSection = ({
    business,
    allImages,
    openImageModal,
    fullAddress
}) => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0)

    // Auto-slide effect
    useEffect(() => {
        if (allImages.length <= 1) return

        const interval = setInterval(() => {
            setCurrentImageIndex((prev) => (prev === allImages.length - 1 ? 0 : prev + 1))
        }, 5000)

        // Preload next image logic could go here
        const nextIndex = (currentImageIndex + 1) % allImages.length
        const nextImg = new Image()
        if (allImages[nextIndex]?.src && !allImages[nextIndex].src.includes('google.com')) {
            nextImg.src = allImages[nextIndex].src
        }

        return () => clearInterval(interval)
    }, [allImages, currentImageIndex])

    const nextImage = useCallback(() => {
        if (allImages.length === 0) return
        setCurrentImageIndex((prev) => (prev + 1) % allImages.length)
    }, [allImages.length])

    const prevImage = useCallback(() => {
        if (allImages.length === 0) return
        setCurrentImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length)
    }, [allImages.length])

    // ---------------------------------------------------------
    // Mobile/Tablet View (Slider)
    // ---------------------------------------------------------
    const renderMobileSlider = () => (
        <div className="relative h-[40vh] sm:h-[50vh] w-full bg-gray-100 group lg:hidden">
            {allImages.length > 0 ? (
                <>
                    <div
                        className="relative w-full h-full cursor-pointer"
                        onClick={() => openImageModal(currentImageIndex)}
                    >
                        {allImages.map((image, index) => (
                            <div
                                key={`${image.src}-${index}`}
                                className={`absolute inset-0 w-full h-full transition-opacity duration-700 ease-in-out ${index === currentImageIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
                                    }`}
                            >
                                <MediaRenderer
                                    item={image}
                                    className="w-full h-full object-cover"
                                    isActive={index === currentImageIndex}
                                    alt={`${business?.name} - ${image.type}`}
                                />
                            </div>
                        ))}

                        {/* Subtle bottom gradient for text readability */}
                        <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/80 via-black/40 to-transparent z-10 pointer-events-none" />

                        <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <div className="bg-black/30 backdrop-blur-md p-3 rounded-full text-white">
                                <FaExpand className="text-2xl" />
                            </div>
                        </div>
                    </div>

                    {allImages.length > 1 && (
                        <>
                            <button
                                onClick={(e) => { e.stopPropagation(); prevImage(); }}
                                className="absolute left-4 top-1/2 -translate-y-1/2 z-30 p-2 sm:p-3 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md transition-all duration-300 opacity-0 group-hover:opacity-100 hover:scale-110"
                                aria-label="Previous image"
                            >
                                <FaChevronLeft className="text-lg sm:text-xl" />
                            </button>
                            <button
                                onClick={(e) => { e.stopPropagation(); nextImage(); }}
                                className="absolute right-4 top-1/2 -translate-y-1/2 z-30 p-2 sm:p-3 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md transition-all duration-300 opacity-0 group-hover:opacity-100 hover:scale-110"
                                aria-label="Next image"
                            >
                                <FaChevronRight className="text-lg sm:text-xl" />
                            </button>

                            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex gap-2">
                                {allImages.map((_, index) => (
                                    <button
                                        key={index}
                                        onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(index); }}
                                        className={`h-1.5 rounded-full transition-all duration-300 ${index === currentImageIndex ? 'w-6 bg-white' : 'w-1.5 bg-white/50 hover:bg-white/80'
                                            }`}
                                        aria-label={`Go to image ${index + 1}`}
                                    />
                                ))}
                            </div>
                        </>
                    )}

                    <div className="absolute top-4 right-4 z-30 px-3 py-1 bg-black/40 backdrop-blur-md rounded-full text-white text-xs font-medium border border-white/10">
                        {currentImageIndex + 1} / {allImages.length}
                    </div>

                    <div className="absolute bottom-0 left-0 right-0 p-6 z-20 pointer-events-none">
                        <div className="flex flex-col items-start space-y-2 pointer-events-auto">
                            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight drop-shadow-md line-clamp-2">
                                {business?.name}
                            </h1>

                            <div className="flex flex-wrap items-center gap-2 text-white drop-shadow-md text-sm">
                                {business?.branch && (
                                    <div className="px-2 py-0.5 bg-black/20 backdrop-blur-sm border border-white/10 rounded-none">
                                        {business.branch}
                                    </div>
                                )}
                                {fullAddress && (
                                    <div className="flex items-center gap-1 opacity-100 truncate max-w-[200px]">
                                        <FaMapMarkerAlt className="text-white text-xs" />
                                        <span className="truncate">{fullAddress}</span>
                                    </div>
                                )}
                            </div>

                            {business?.ratings && (
                                <div className="flex items-center gap-1 bg-black/20 backdrop-blur-sm px-2 py-0.5 text-xs font-semibold drop-shadow-md text-white">
                                    <span className="text-yellow-400">★</span>
                                    {business.ratings.average.toFixed(1)}
                                    <span className="text-white/80 font-normal ml-1">
                                        ({business.ratings.totalReviews})
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                </>
            ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-gray-50 text-gray-400">
                    <FaCalendarAlt className="text-5xl mb-3 opacity-30" />
                    <p className="text-sm font-medium">No images available</p>
                </div>
            )}
        </div>
    )

    // ---------------------------------------------------------
    // Desktop View (Grid)
    // ---------------------------------------------------------
    const renderDesktopGrid = () => {
        const mainImage = allImages[currentImageIndex] || allImages[0]
        const sideImages = allImages.slice(1, 4)
        const remainingCount = Math.max(0, allImages.length - 4)

        if (!mainImage) {
            return (
                <div className="hidden lg:flex w-full h-[50vh] items-center justify-center bg-gray-100 border border-gray-200">
                    <div className="text-center text-gray-400">
                        <FaCalendarAlt className="text-6xl mb-4 opacity-30 mx-auto" />
                        <p className="text-lg font-medium">No images available</p>
                    </div>
                </div>
            )
        }

        return (
            <div className="hidden lg:grid grid-cols-4 gap-2 h-[50vh] w-full">
                {/* Main Large Image */}
                <div
                    className="col-span-3 max-h-[50vh] relative group cursor-pointer overflow-hidden"
                    onClick={() => openImageModal(currentImageIndex)}
                >
                    <MediaRenderer
                        item={mainImage}
                        className="w-full h-full object-cover"
                        alt={`${business?.name} - Main`}
                    />

                    <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/80 via-black/40 to-transparent z-10 pointer-events-none" />

                    <div className="absolute bottom-0 left-0 right-0 p-8 z-20 pointer-events-none">
                        <div className="space-y-3 pointer-events-auto">
                            <h1 className="text-4xl lg:text-5xl font-bold text-white tracking-tight drop-shadow-lg">
                                {business?.name}
                            </h1>
                            <div className="flex flex-col items-start gap-1 text-white text-lg font-medium drop-shadow-md">
                                {business?.branch && (
                                    <span className="py-1 bg-black/20 backdrop-blur-sm">
                                        {business.branch}
                                    </span>
                                )}
                                {fullAddress && (
                                    <div className="flex items-center gap-2">
                                        <FaMapMarkerAlt className="text-white" />
                                        <span className="truncate max-w-md">{fullAddress}</span>
                                    </div>
                                )}
                            </div>
                            {business?.ratings && (
                                <div className="flex items-center gap-1 mt-2 ">
                                    <div className="flex items-center gap-1.5 bg-black/20 backdrop-blur-sm py-1 text-base text-white font-semibold">
                                        <span className="text-yellow-400">★</span>
                                        {business.ratings.average.toFixed(1)}
                                    </div>
                                    <span className="text-white text-xs">
                                        Based on {business.ratings.totalReviews} reviews
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Side Images Column */}
                <div className="col-span-1 flex flex-col gap-2 h-full max-h-[50vh]">
                    {sideImages.map((img, idx) => {
                        const isLast = idx === sideImages.length - 1
                        return (
                            <div
                                key={idx}
                                className="relative flex-1 overflow-hidden cursor-pointer group/side"
                                onClick={() => openImageModal(idx + 1)}
                            >
                                <MediaRenderer
                                    item={img}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover/side:scale-110"
                                    isActive={false}
                                    alt={`${business?.name} - Side ${idx}`}
                                />

                                {isLast && remainingCount > 0 && (
                                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-10 hover:bg-black/70 transition-colors">
                                        <div className="text-center">
                                            <span className="block text-white font-bold text-2xl tracking-wider">
                                                +{remainingCount}
                                            </span>
                                            <span className="text-white/80 text-xs uppercase font-semibold tracking-widest">Photos</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>
            </div>
        )
    }

    return (
        <>
            {renderMobileSlider()}
            {allImages.length === 1 ? (
                <div className="hidden lg:block relative w-full h-[55vh] overflow-hidden group cursor-pointer" onClick={() => openImageModal(0)}>
                    <MediaRenderer
                        item={allImages[0]}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover/scale-105"
                        alt={`${business?.name} - Main`}
                    />

                    <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/80 via-black/40 to-transparent z-10 pointer-events-none" />

                    <div className="absolute bottom-0 left-0 right-0 p-8 z-20">
                        <h1 className="text-5xl font-bold text-white drop-shadow-lg">{business?.name}</h1>
                        <div className="flex items-center gap-4 text-white text-lg font-medium mt-2 drop-shadow-md">
                            {fullAddress && <div className="flex items-center gap-2"><FaMapMarkerAlt className="text-white" /><span>{fullAddress}</span></div>}
                        </div>
                    </div>
                </div>
            ) : (
                renderDesktopGrid()
            )}
        </>
    )
}

export default React.memo(HeroSection)
