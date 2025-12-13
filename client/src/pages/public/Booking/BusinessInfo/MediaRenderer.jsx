import React, { useState } from 'react'
import { FaImage } from 'react-icons/fa'

const MediaRenderer = ({ item, className, isActive = true, alt }) => {
    const [hasError, setHasError] = useState(false)
    const [isLoaded, setIsLoaded] = useState(false)

    if (!item || !item.src) return null

    const isEmbed = item.src.includes('google.com/maps/embed')

    if (isEmbed) {
        return (
            <iframe
                src={item.src}
                className={`${className} border-0`}
                width="100%"
                height="100%"
                allowFullScreen=""
                loading="lazy"
                title={`Embed ${item.type}`}
                style={{ pointerEvents: isActive ? 'auto' : 'none' }}
            />
        )
    }

    if (hasError) {
        return (
            <div className={`w-full h-full flex items-center justify-center bg-gray-100 text-gray-400 ${className}`}>
                <FaImage className="text-2xl opacity-50" />
            </div>
        )
    }

    return (
        <>
            {!isLoaded && !hasError && (
                <div className={`absolute inset-0 bg-gray-200 animate-pulse ${className}`} />
            )}
            <img
                src={item.src}
                alt={alt || item.type}
                className={`${className} ${isLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}
                loading={isActive ? 'eager' : 'lazy'}
                onLoad={() => setIsLoaded(true)}
                onError={() => setHasError(true)}
            />
        </>
    )
}

export default React.memo(MediaRenderer)
