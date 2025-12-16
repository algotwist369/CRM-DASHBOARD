import React from 'react'

const SkeletonBusinessInfo = () => {
    return (
        <div className="min-h-screen bg-gray-50 animate-pulse">
            {/* Back Button Skeleton */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 py-3">
                    <div className="h-9 w-20 bg-gray-200 rounded"></div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
                <div className="grid grid-cols-1 lg:grid-cols-[7fr_3fr] gap-6 lg:gap-10 lg:items-start">
                    <div className="space-y-6">
                        {/* Hero Section Skeleton */}
                        <div className="space-y-4">
                            {/* Main Image */}
                            <div className="w-full h-48 sm:h-64 md:h-80 lg:h-96 bg-gray-200 rounded-lg"></div>
                            {/* Gallery Strip */}
                            <div className="flex gap-2 overflow-hidden">
                                {[1, 2, 3, 4].map((i) => (
                                    <div key={i} className="h-20 w-20 bg-gray-200 rounded-lg flex-shrink-0"></div>
                                ))}
                            </div>
                            {/* Title & Address */}
                            <div className="space-y-2 mt-4">
                                <div className="h-8 w-3/4 bg-gray-200 rounded"></div>
                                <div className="h-4 w-1/2 bg-gray-200 rounded"></div>
                            </div>
                        </div>

                        {/* Mobile Ratings Skeleton */}
                        <div className="lg:hidden h-40 bg-white border border-gray-200 rounded-lg"></div>

                        {/* About Section Skeleton */}
                        <div className="bg-white border border-gray-200 p-4 sm:p-6 rounded-lg space-y-4">
                            <div className="h-6 w-24 bg-gray-200 rounded"></div>
                            <div className="space-y-2">
                                <div className="h-4 w-full bg-gray-200 rounded"></div>
                                <div className="h-4 w-5/6 bg-gray-200 rounded"></div>
                                <div className="h-4 w-4/6 bg-gray-200 rounded"></div>
                            </div>
                        </div>

                        {/* Services Section Skeleton */}
                        <div className="bg-white border border-gray-200 p-4 sm:p-6 rounded-lg space-y-4">
                            <div className="h-6 w-24 bg-gray-200 rounded"></div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {[1, 2, 3, 4].map((i) => (
                                    <div key={i} className="bg-gray-50 p-3 rounded border border-gray-100 flex items-start gap-3">
                                        <div className="h-4 w-4 bg-gray-200 rounded-full mt-1"></div>
                                        <div className="flex-1 space-y-2">
                                            <div className="h-4 w-3/4 bg-gray-200 rounded"></div>
                                            <div className="h-3 w-1/2 bg-gray-200 rounded"></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Features Skeleton */}
                        <div className="bg-white border border-gray-200 p-4 sm:p-6 rounded-lg space-y-4">
                            <div className="h-6 w-24 bg-gray-200 rounded"></div>
                            <div className="flex gap-2">
                                <div className="h-8 w-24 bg-gray-200 rounded"></div>
                                <div className="h-8 w-24 bg-gray-200 rounded"></div>
                                <div className="h-8 w-24 bg-gray-200 rounded"></div>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar Skeleton */}
                    <div className="hidden lg:flex flex-col gap-4">
                        {/* Booking Card */}
                        <div className="h-64 bg-white border border-gray-200 rounded-lg"></div>
                        {/* Ratings */}
                        <div className="h-48 bg-white border border-gray-200 rounded-lg"></div>
                        {/* Info Cards */}
                        <div className="h-32 bg-white border border-gray-200 rounded-lg"></div>
                        <div className="h-40 bg-white border border-gray-200 rounded-lg"></div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default SkeletonBusinessInfo
