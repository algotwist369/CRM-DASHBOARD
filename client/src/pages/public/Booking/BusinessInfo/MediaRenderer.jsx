import React, { useState } from 'react'
import { FaImage } from 'react-icons/fa'

const MediaRenderer = ({ item, className = '', isActive = true, alt }) => {
    const [hasError, setHasError] = useState(false)
    const [isLoaded, setIsLoaded] = useState(false)

    if (!item || !item.src) return null

    const isEmbed = item.src.includes('google.com/maps/embed')

    if (isEmbed) {
        return (
            <iframe
                src={item.src}
                className={`${className} border-0`.trim()}
                width="100%"
                height="100%"
                allowFullScreen
                loading="lazy"
                title={`Embed ${item.type || 'content'}`}
                style={{ pointerEvents: isActive ? 'auto' : 'none' }}
            />
        )
    }

    if (hasError) {
        return (
            <div className={`w-full h-full flex items-center justify-center bg-gray-100 text-gray-400 ${className}`.trim()}>
                <FaImage className="text-xl opacity-50" />
            </div>
        )
    }

    return (
        <div className={`relative ${className}`.trim()}>
            <img
                src={item.src}
                alt={alt || item.type || 'Media'}
                className={`w-full h-full object-cover`}
                loading={isActive ? 'eager' : 'lazy'}
                onError={() => setHasError(true)}
            />
        </div>
    )
}

export default React.memo(MediaRenderer)
