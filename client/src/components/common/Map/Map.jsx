import React, { useMemo, useEffect, useRef } from 'react'
import { FaMapMarkerAlt } from 'react-icons/fa'

/**
 * Map Component - Displays Google Maps embed
 * @param {Object} props
 * @param {Array<number>} props.coordinates - [lng, lat] or [lat, lng] format
 * @param {string} props.googleMapsUrl - Google Maps URL (optional)
 * @param {number} props.zoom - Zoom level (default: 15)
 * @param {string} props.height - Map height (default: '400px')
 * @param {string} props.className - Additional CSS classes
 * @param {boolean} props.showLink - Show "Open in Google Maps" link (default: true)
 */
const Map = ({
  coordinates = null,
  googleMapsUrl = null,
  zoom = 15,
  height = '400px',
  className = '',
  showLink = true
}) => {
  const iframeRef = useRef(null)

  // Extract coordinates from various sources
  const mapData = useMemo(() => {
    let lat = null
    let lng = null
    let finalZoom = zoom

    // Priority 1: Use provided coordinates
    if (coordinates && Array.isArray(coordinates) && coordinates.length >= 2) {
      // Handle both [lng, lat] and [lat, lng] formats
      // Check if first value is likely longitude (usually larger absolute value)
      const [first, second] = coordinates
      if (Math.abs(first) > Math.abs(second)) {
        // Likely [lng, lat] format
        lng = first
        lat = second
      } else {
        // Likely [lat, lng] format
        lat = first
        lng = second
      }
    }

    // Priority 2: Parse from googleMapsUrl
    if ((lat === null || lng === null) && googleMapsUrl) {
      try {
        const decodedUrl = decodeURIComponent(googleMapsUrl)

        // Extract coordinates from ll= parameter (lat,lng format)
        const llMatch = decodedUrl.match(/[?&]ll=(-?\d+\.?\d*),(-?\d+\.?\d*)/)
        if (llMatch) {
          lat = parseFloat(llMatch[1])
          lng = parseFloat(llMatch[2])
          // Extract zoom level if available
          const zMatch = decodedUrl.match(/[?&]z=(\d+)/)
          if (zMatch) {
            finalZoom = parseInt(zMatch[1], 10)
          }
        } else {
          // Extract coordinates from @lat,lng format
          const coordsMatch = decodedUrl.match(/@(-?\d+\.?\d*),(-?\d+\.?\d*)/)
          if (coordsMatch) {
            lat = parseFloat(coordsMatch[1])
            lng = parseFloat(coordsMatch[2])
            // Extract zoom if available (format: @lat,lng,z)
            const zoomMatch = decodedUrl.match(/@-?\d+\.?\d*,-?\d+\.?\d*,(\d+)/)
            if (zoomMatch) {
              finalZoom = parseInt(zoomMatch[1], 10)
            }
          }
        }
      } catch (e) {
        console.error('Error parsing Google Maps URL:', e)
      }
    }

    return { lat, lng, zoom: finalZoom }
  }, [coordinates, googleMapsUrl, zoom])

  // Generate embed URL
  const embedUrl = useMemo(() => {
    if (!mapData.lat || !mapData.lng) return null

    // Use the standard Google Maps embed format
    return `https://maps.google.com/maps?q=${mapData.lat},${mapData.lng}&hl=en&z=${mapData.zoom}&output=embed`
  }, [mapData])

  // Suppress Google Maps console warnings when iframe loads
  useEffect(() => {
    if (!embedUrl || !iframeRef.current) return

    const originalWarn = console.warn
    const originalError = console.error
    
    // Create a filter to suppress Google Maps API warnings
    const suppressGoogleMapsWarnings = (...args) => {
      const message = String(args[0] || '')
      // Suppress specific Google Maps warnings
      if (
        message.includes('Permissions policy violation') ||
        message.includes('accelerometer') ||
        message.includes('deviceorientation') ||
        message.includes('deviceorientation events are blocked') ||
        message.includes('apple-mobile-web-app-capable') ||
        message.includes('Violation')
      ) {
        return // Suppress these warnings
      }
      // Allow other warnings/errors through
      originalWarn.apply(console, args)
    }

    // Temporarily override console methods when iframe loads
    const handleIframeLoad = () => {
      console.warn = suppressGoogleMapsWarnings
      console.error = suppressGoogleMapsWarnings
      
      // Restore after a short delay
      setTimeout(() => {
        console.warn = originalWarn
        console.error = originalError
      }, 2000)
    }

    const iframe = iframeRef.current
    if (iframe) {
      iframe.addEventListener('load', handleIframeLoad)
      // Also set up immediately if already loaded
      if (iframe.complete) {
        handleIframeLoad()
      }
    }

    return () => {
      if (iframe) {
        iframe.removeEventListener('load', handleIframeLoad)
      }
      console.warn = originalWarn
      console.error = originalError
    }
  }, [embedUrl])

  // If no coordinates available, return placeholder
  if (!embedUrl && !googleMapsUrl) {
    return (
      <div className={`overflow-hidden border border-gray-200 bg-gray-100 rounded flex items-center justify-center ${className}`} style={{ height }}>
        <div className="text-center p-4">
          <FaMapMarkerAlt className="text-gray-400 text-4xl mx-auto mb-2" />
          <p className="text-gray-500 text-sm">Map location unavailable</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`overflow-hidden border border-gray-200 rounded ${className}`}>
      {embedUrl ? (
        <>
          <iframe
            ref={iframeRef}
            width="100%"
            height={height}
            style={{ border: 0 }}
            loading="lazy"
            allowFullScreen
            referrerPolicy="no-referrer-when-downgrade"
            src={embedUrl}
            title="Location Map"
            allow="geolocation"
            className="w-full"
            sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
          />
          {showLink && googleMapsUrl && (
            <div className="mt-3">
              <a
                href={googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-primary-600 font-medium text-sm hover:text-primary-700 transition-colors"
              >
                <FaMapMarkerAlt className="text-xs" />
                <span>Open in Google Maps</span>
              </a>
            </div>
          )}
        </>
      ) : (
        <div className="bg-gray-100 flex items-center justify-center rounded" style={{ height }}>
          <div className="text-center p-4">
            <FaMapMarkerAlt className="text-gray-400 text-4xl mx-auto mb-2" />
            <p className="text-gray-500 text-sm">Map unavailable</p>
            {googleMapsUrl && showLink && (
              <a
                href={googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-block text-primary-600 text-sm hover:text-primary-700"
              >
                Open in Google Maps
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default Map

