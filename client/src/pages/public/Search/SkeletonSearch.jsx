import React from 'react'
import { FiMapPin, FiSearch } from 'react-icons/fi'

const SkeletonSearchCard = () => (
    <div className="bg-white border border-gray-200 mb-3 overflow-hidden animate-pulse">
        <div className="flex flex-row gap-3 p-3">
            {/* Image Placeholder */}
            <div className="bg-gray-200 w-28 h-28 md:w-56 md:h-40 flex-shrink-0"></div>

            {/* Content Placeholder */}
            <div className="flex-1 flex flex-col justify-between">
                <div className="space-y-2">
                    <div className="flex justify-between items-start">
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-4 bg-gray-200 rounded w-12"></div>
                    </div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>

                    {/* Tags */}
                    <div className="flex gap-1 mt-2">
                        <div className="h-5 w-16 bg-gray-200 rounded"></div>
                        <div className="h-5 w-16 bg-gray-200 rounded"></div>
                        <div className="h-5 w-16 bg-gray-200 rounded"></div>
                    </div>
                </div>

                {/* Desktop Actions */}
                <div className="hidden md:flex gap-2 mt-2">
                    <div className="h-8 w-24 bg-gray-200 rounded-full"></div>
                    <div className="h-8 w-24 bg-gray-200 rounded-full"></div>
                    <div className="flex-1"></div>
                    <div className="h-8 w-24 bg-gray-200 rounded"></div>
                </div>
            </div>
        </div>

        {/* Mobile Actions Footer */}
        <div className="md:hidden flex gap-2 px-3 pb-3">
            <div className="flex-1 h-9 bg-gray-200 rounded-lg"></div>
            <div className="flex-1 h-9 bg-gray-200 rounded-lg"></div>
        </div>
    </div>
)

const SkeletonSearch = () => {
    return (
        <div className="space-y-4">
            {[1, 2, 3, 4].map(i => (
                <SkeletonSearchCard key={i} />
            ))}
        </div>
    )
}

export default SkeletonSearch
