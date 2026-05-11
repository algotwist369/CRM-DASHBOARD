import React, { useState } from 'react';
import { FaImage, FaVrCardboard, FaVideo, FaExternalLinkAlt, FaExpand, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import MediaRenderer from './MediaRenderer';

const MediaGallery = ({
    business,
    allImages,
    openImageModal,
    isModal = false,
    modalImageIndex = 0,
    nextModalImage,
    prevModalImage,
}) => {
    const [activeTab, setActiveTab] = useState('photos');
    const [currentTourIndex, setCurrentTourIndex] = useState(0);
    const [currentVideoIndex, setCurrentVideoIndex] = useState(0);

    const galleryImages = business?.images?.gallery || [];
    const tours = business?.google360ImageUrl || [];
    const videos = business?.videos || [];

    const hasPhotos = allImages?.length > 0 || galleryImages.length > 0;
    const hasTours = tours.length > 0;
    const hasVideos = videos.length > 0;

    if (!hasPhotos && !hasTours && !hasVideos) return null;

    const tabs = [
        { id: 'photos', label: 'Photos', icon: FaImage, show: hasPhotos },
        { id: 'tours', label: '360° Tours', icon: FaVrCardboard, show: hasTours },
        { id: 'videos', label: 'Videos', icon: FaVideo, show: hasVideos },
    ].filter(tab => tab.show);

    // Initial active tab logic
    React.useEffect(() => {
        if (!tabs.find(t => t.id === activeTab)) {
            setActiveTab(tabs[0]?.id || 'photos');
        }
    }, [tabs]);

    const getVideoEmbedUrl = (url) => {
        if (!url) return null;
        if (url.includes('youtube.com/watch?v=')) {
            return url.replace('watch?v=', 'embed/');
        }
        if (url.includes('youtu.be/')) {
            return url.replace('youtu.be/', 'youtube.com/embed/');
        }
        if (url.includes('vimeo.com/')) {
            return `https://player.vimeo.com/video/${url.split('/').pop()}`;
        }
        return url;
    };

    const handleImageClick = (src) => {
        if (isModal) return;
        if (!allImages) return;
        const index = allImages.findIndex(img => img.src === src);
        if (index !== -1) {
            openImageModal(index);
        }
    };

    const nextTour = () => setCurrentTourIndex((prev) => (prev + 1) % tours.length);
    const prevTour = () => setCurrentTourIndex((prev) => (prev - 1 + tours.length) % tours.length);

    const nextVideo = () => setCurrentVideoIndex((prev) => (prev + 1) % videos.length);
    const prevVideo = () => setCurrentVideoIndex((prev) => (prev - 1 + videos.length) % videos.length);

    const containerClasses = isModal
        ? "w-full h-full flex flex-col bg-black/95 backdrop-blur-md"
        : "bg-white border border-gray-200 overflow-hidden";

    const tabListClasses = isModal
        ? "flex overflow-x-auto no-scrollbar justify-center border-b border-white/10"
        : "flex overflow-x-auto no-scrollbar border-b border-gray-100";

    const tabItemClasses = (id) => {
        const isActive = activeTab === id;
        if (isModal) {
            return `flex items-center gap-2 px-6 py-4 text-sm font-bold transition-all border-b-2 whitespace-nowrap ${isActive
                ? 'border-primary-500 text-primary-500 bg-white/5'
                : 'border-transparent text-gray-400 hover:text-white hover:bg-white/5'
                }`;
        }
        return `flex items-center gap-2 px-6 py-4 text-sm font-bold transition-all border-b-2 whitespace-nowrap ${isActive
            ? 'border-primary-600 text-primary-600 bg-primary-50/30'
            : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`;
    };

    return (
        <div className={containerClasses}>
            <div className={isModal ? "" : "border-b border-gray-100"}>
                <div className={tabListClasses}>
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={tabItemClasses(tab.id)}
                        >
                            <tab.icon className={activeTab === tab.id ? (isModal ? 'text-primary-500' : 'text-primary-600') : (isModal ? 'text-gray-500' : 'text-gray-400')} />
                            {tab.label}
                            <span className={`ml-1 text-[10px] px-1.5 py-0.5 rounded-full ${activeTab === tab.id
                                ? (isModal ? 'bg-primary-500/20 text-primary-400' : 'bg-primary-100 text-primary-700')
                                : (isModal ? 'bg-white/10 text-gray-500' : 'bg-gray-100 text-gray-500')
                                }`}>
                                {tab.id === 'photos' ? (isModal ? allImages.length : galleryImages.length) : tab.id === 'tours' ? tours.length : videos.length}
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            <div className={`flex-1 overflow-y-auto ${isModal ? "p-0" : "p-4 sm:p-6 bg-gray-50/50"}`}>
                {activeTab === 'photos' && (
                    isModal ? (
                        <div className="relative w-full h-full flex flex-col items-center justify-center min-h-[60vh] md:min-h-[80vh]">
                            {/* Navigation Buttons */}
                            {allImages.length > 1 && (
                                <>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); prevModalImage(); }}
                                        className="absolute left-4 z-50 p-4 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md transition-all sm:flex hidden"
                                    >
                                        <FaChevronLeft className="text-2xl" />
                                    </button>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); nextModalImage(); }}
                                        className="absolute right-4 z-50 p-4 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md transition-all sm:flex hidden"
                                    >
                                        <FaChevronRight className="text-2xl" />
                                    </button>
                                </>
                            )}

                            {/* Main Image */}
                            <div className="w-full h-full flex items-center justify-center p-4">
                                <MediaRenderer
                                    item={allImages[modalImageIndex]}
                                    className="max-w-full max-h-[85vh] w-auto h-auto object-contain select-none"
                                    alt={`${business?.category || 'Spa'} ${business?.name} - Gallery Photo ${modalImageIndex + 1} in ${business?.city || ''}`}
                                />
                            </div>

                            {/* Counter */}
                            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 px-4 py-2 bg-black/60 backdrop-blur-md rounded-full text-white text-sm font-medium">
                                {modalImageIndex + 1} / {allImages.length}
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                            {galleryImages.map((src, idx) => (
                                <div
                                    key={idx}
                                    className="aspect-square relative group cursor-pointer overflow-hidden border border-gray-200"
                                    onClick={() => handleImageClick(src)}
                                >
                                    <img
                                        src={src}
                                        alt={`${business?.category || 'Spa'} ${business?.name} - Gallery Photo ${idx + 1} in ${business?.city || ''}`}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                        loading="lazy"
                                    />
                                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <div className="bg-white/90 p-2 rounded-full transform translate-y-2 group-hover:translate-y-0 transition-transform">
                                            <FaExpand className="text-primary-600 text-sm" />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )
                )}

                {activeTab === 'tours' && (
                    isModal ? (
                        <div className="relative w-full h-full flex flex-col items-center justify-center min-h-[60vh] md:min-h-[80vh] p-4">
                            {/* Navigation Buttons */}
                            {tours.length > 1 && (
                                <>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); prevTour(); }}
                                        className="absolute left-4 z-50 p-4 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md transition-all sm:flex hidden"
                                    >
                                        <FaChevronLeft className="text-2xl" />
                                    </button>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); nextTour(); }}
                                        className="absolute right-4 z-50 p-4 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md transition-all sm:flex hidden"
                                    >
                                        <FaChevronRight className="text-2xl" />
                                    </button>
                                </>
                            )}

                            {/* Tour View */}
                            <div className="w-full max-w-6xl max-h-[80vh] space-y-2">
                                <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider px-1 text-gray-400">
                                    <span>Virtual Tour {currentTourIndex + 1}</span>
                                    <a href={tours[currentTourIndex]} target="_blank" rel="noopener noreferrer" className="text-primary-500 hover:underline flex items-center gap-1">
                                        Open Full View <FaExternalLinkAlt className="text-[10px]" />
                                    </a>
                                </div>
                                <div className="aspect-video w-full max-h-[75vh] bg-black rounded-lg overflow-hidden shadow-lg border border-white/10">
                                    <iframe
                                        src={tours[currentTourIndex]}
                                        className="w-full h-full border-0"
                                        allowFullScreen
                                        loading="lazy"
                                        title={`360 Tour ${currentTourIndex + 1}`}
                                    />
                                </div>
                            </div>

                            {/* Counter */}
                            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 px-4 py-2 bg-black/60 backdrop-blur-md rounded-full text-white text-sm font-medium">
                                {currentTourIndex + 1} / {tours.length}
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {tours.map((url, idx) => (
                                <div key={idx} className="space-y-2">
                                    <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider px-1 text-gray-500">
                                        <span>Virtual Tour {idx + 1}</span>
                                        <a href={url} target="_blank" rel="noopener noreferrer" className="text-primary-500 hover:underline flex items-center gap-1">
                                            Open Full View <FaExternalLinkAlt className="text-[10px]" />
                                        </a>
                                    </div>
                                    <div className="aspect-video w-full max-h-[500px] bg-black rounded-lg overflow-hidden shadow-lg border border-gray-200">
                                        <iframe
                                            src={url}
                                            className="w-full h-full border-0"
                                            allowFullScreen
                                            loading="lazy"
                                            title={`360 Tour ${idx + 1}`}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )
                )}

                {activeTab === 'videos' && (
                    isModal ? (
                        <div className="relative w-full h-full flex flex-col items-center justify-center min-h-[60vh] md:min-h-[80vh] p-4">
                            {/* Navigation Buttons */}
                            {videos.length > 1 && (
                                <>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); prevVideo(); }}
                                        className="absolute left-4 z-50 p-4 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md transition-all sm:flex hidden"
                                    >
                                        <FaChevronLeft className="text-2xl" />
                                    </button>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); nextVideo(); }}
                                        className="absolute right-4 z-50 p-4 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md transition-all sm:flex hidden"
                                    >
                                        <FaChevronRight className="text-2xl" />
                                    </button>
                                </>
                            )}

                            {/* Video View */}
                            <div className="w-full max-w-6xl max-h-[80vh] space-y-2">
                                <div className="text-xs font-bold uppercase tracking-wider px-1 text-gray-400">
                                    Video {currentVideoIndex + 1}
                                </div>
                                <div className="aspect-video w-full max-h-[75vh] bg-black rounded-lg overflow-hidden shadow-lg border border-white/10">
                                    <iframe
                                        src={getVideoEmbedUrl(videos[currentVideoIndex])}
                                        className="w-full h-full border-0"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                        title={`Video ${currentVideoIndex + 1}`}
                                    />
                                </div>
                            </div>

                            {/* Counter */}
                            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 px-4 py-2 bg-black/60 backdrop-blur-md rounded-full text-white text-sm font-medium">
                                {currentVideoIndex + 1} / {videos.length}
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {videos.map((url, idx) => (
                                <div key={idx} className="space-y-2">
                                    <div className="text-xs font-bold uppercase tracking-wider px-1 text-gray-500">
                                        Video {idx + 1}
                                    </div>
                                    <div className="aspect-video w-full max-h-[400px] bg-black rounded-lg overflow-hidden shadow-lg border border-gray-200">
                                        <iframe
                                            src={getVideoEmbedUrl(url)}
                                            className="w-full h-full border-0"
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                            allowFullScreen
                                            title={`Video ${idx + 1}`}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )
                )}
            </div>
        </div>
    );
};

export default MediaGallery;
