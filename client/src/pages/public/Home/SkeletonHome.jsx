import React from 'react'

const SkeletonBusinessCard = () => (
    <div className="bg-white border border-gray-100 rounded-lg overflow-hidden h-auto flex sm:flex-col mx-auto w-full animate-pulse">
        {/* Mobile Layout */}
        <div className="flex sm:hidden w-full h-[120px]">
            {/* Image Skeleton */}
            <div className="w-[35%] xs:w-[40%] bg-gray-200 flex-shrink-0" />

            {/* Content Skeleton */}
            <div className="flex-1 p-2.5 xs:p-3 flex flex-col justify-between">
                <div className="space-y-2">
                    <div className="h-3.5 bg-gray-200 rounded w-3/4" />
                    <div className="flex gap-1">
                        <div className="h-3 bg-gray-200 rounded w-3" />
                        <div className="h-3 bg-gray-200 rounded w-8" />
                    </div>
                    <div className="flex gap-1.5 mt-2">
                        <div className="h-5 w-12 bg-gray-200 rounded-full" />
                        <div className="h-5 w-16 bg-gray-200 rounded-full" />
                    </div>
                </div>
                <div className="flex gap-2 mt-2">
                    <div className="h-8 flex-1 bg-gray-200 rounded" />
                    <div className="h-8 flex-1 bg-gray-200 rounded" />
                </div>
            </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden sm:flex sm:flex-col h-full">
            {/* Search Result Image Skeleton */}
            <div className="h-32 md:h-36 lg:h-40 bg-gray-200" />

            {/* Content Skeleton */}
            <div className="p-2.5 md:p-3 flex-1 flex flex-col">
                <div className="mb-3 space-y-2">
                    <div className="flex justify-between items-start">
                        <div className="h-5 bg-gray-200 rounded w-2/3" />
                        <div className="h-4 bg-gray-200 rounded w-10" />
                    </div>
                    <div className="h-3 bg-gray-200 rounded w-full" />
                    <div className="h-3 bg-gray-200 rounded w-4/5" />

                    {/* Location Skeleton */}
                    <div className="flex items-center gap-1 mt-2">
                        <div className="h-3 w-3 bg-gray-200 rounded-full" />
                        <div className="h-3 bg-gray-200 rounded w-1/2" />
                    </div>
                </div>

                <div className="mt-auto space-y-2 pt-2 border-t border-gray-100">
                    <div className="h-10 bg-gray-200 rounded" />
                    <div className="flex gap-2">
                        <div className="h-10 flex-1 bg-gray-200 rounded" />
                        <div className="h-10 flex-1 bg-gray-200 rounded" />
                    </div>
                </div>
            </div>
        </div>
    </div>
)

const SkeletonHome = () => {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 xs:gap-4 sm:gap-4 lg:gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
                <SkeletonBusinessCard key={i} />
            ))}
        </div>
    )
}

export default SkeletonHome
