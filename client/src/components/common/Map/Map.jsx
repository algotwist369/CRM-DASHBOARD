import React, { useMemo, useEffect, useRef } from 'react'
import { FaMapMarkerAlt } from 'react-icons/fa'


const Map = ({
  coordinates = null,
  googleMapsUrl = null,
  zoom = 15,
  height = '400px',
  className = '',
  showLink = true
}) => {
  const iframeRef = useRef(null)

  // Extract map data including CID, query, and coordinates
  const mapData = useMemo(() => {
    let lat = null
    let lng = null
    let query = null
    let cid = null
    let finalZoom = zoom

    // Priority 1: Use provided coordinates
    if (coordinates && Array.isArray(coordinates) && coordinates.length >= 2) {
      const [first, second] = coordinates
      if (Math.abs(first) > Math.abs(second)) {
        lng = first
        lat = second
      } else {
        lat = first
        lng = second
      }
    }

    // Priority 2: Parse from googleMapsUrl
    if (googleMapsUrl) {
      try {
        const decodedUrl = decodeURIComponent(googleMapsUrl)

        // 1. Extract CID (Customer ID) - Highest Prority for reliability
        // Looks for pattern: !1s0x...:0x(HEX_CID)
        const cidMatch = decodedUrl.match(/!1s0x[0-9a-f]+:(0x[0-9a-f]+)/i)
        if (cidMatch && cidMatch[1]) {
          try {
            // Convert Hex CID to Decimal String using BigInt
            cid = BigInt(cidMatch[1]).toString()
          } catch (e) {
            console.error('Failed to convert CID:', e)
          }
        }

        // 2. Extract Place Name (Query)
        // Matches /place/Some+Place+Name/
        if (!cid) {
          const placeMatch = decodedUrl.match(/\/place\/([^/]+)/)
          if (placeMatch) {
            query = placeMatch[1]
          }
        }

        // 3. Extract Coordinates if not already found
        if (lat === null || lng === null) {
          const llMatch = decodedUrl.match(/[?&]ll=(-?\d+\.?\d*),(-?\d+\.?\d*)/)
          if (llMatch) {
            lat = parseFloat(llMatch[1])
            lng = parseFloat(llMatch[2])
          } else {
            const coordsMatch = decodedUrl.match(/@(-?\d+\.?\d*),(-?\d+\.?\d*)/)
            if (coordsMatch) {
              lat = parseFloat(coordsMatch[1])
              lng = parseFloat(coordsMatch[2])
            }
          }
        }

        // Extract zoom
        const zMatch = decodedUrl.match(/[?&]z=(\d+)/) || decodedUrl.match(/,(\d+)m\/data=/) || decodedUrl.match(/,(\d+)z/)
        if (zMatch) {
          finalZoom = parseInt(zMatch[1], 10)
        }
      } catch (e) {
        console.error('Error parsing Google Maps URL:', e)
      }
    }

    return { lat, lng, query, cid, zoom: finalZoom }
  }, [coordinates, googleMapsUrl, zoom])

  // Generate embed URL
  const embedUrl = useMemo(() => {
    // Strategy 1: CID Embed (Most Reliable for Businesses)
    if (mapData.cid) {
      return `https://maps.google.com/maps?cid=${mapData.cid}&output=embed`
    }

    // Strategy 2: Place Name Query (Reliable)
    if (mapData.query) {
      return `https://maps.google.com/maps?q=${mapData.query}&t=m&z=${mapData.zoom}&output=embed&iwloc=near`
    }

    // Strategy 3: Coordinates (Least Reliable without API Key)
    if (mapData.lat && mapData.lng) {
      return `https://maps.google.com/maps?q=${mapData.lat},${mapData.lng}&t=m&z=${mapData.zoom}&output=embed&iwloc=near`
    }

    return null
  }, [mapData])

  // Suppress Google Maps console warnings
  useEffect(() => {
    if (!embedUrl || !iframeRef.current) return

    const originalWarn = console.warn
    const originalError = console.error

    // Create a filter to suppress Google Maps API warnings
    const suppressGoogleMapsWarnings = (...args) => {
      const message = String(args[0] || '')
      if (
        message.includes('Permissions policy violation') ||
        message.includes('accelerometer') ||
        message.includes('deviceorientation') ||
        message.includes('apple-mobile-web-app-capable') ||
        message.includes('Violation')
      ) {
        return
      }
      originalWarn.apply(console, args)
    }

    const handleIframeLoad = () => {
      console.warn = suppressGoogleMapsWarnings
      console.error = suppressGoogleMapsWarnings
      setTimeout(() => {
        console.warn = originalWarn
        console.error = originalError
      }, 2000)
    }

    const iframe = iframeRef.current
    if (iframe) {
      iframe.addEventListener('load', handleIframeLoad)
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
