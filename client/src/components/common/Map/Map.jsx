import React, { useMemo, useEffect, useRef } from 'react'
import { FaMapMarkerAlt } from 'react-icons/fa'
import { MapContainer, TileLayer, Marker } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png'
})

const Map = ({
  coordinates = null,
  googleMapsUrl = null,
  zoom = 15,
  height = '400px',
  className = '',
  showLink = true
}) => {
  const apiKey = import.meta.env.VITE_GMAPS_EMBED_KEY
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

  const embedUrl = useMemo(() => {
    if (apiKey) {
      // Use modern Google Maps Embed API v1 with latest parameters
      if (mapData.lat && mapData.lng) {
        return `https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${mapData.lat},${mapData.lng}&zoom=${mapData.zoom || zoom}&maptype=roadmap&language=en`
      }
      if (mapData.query) {
        const q = mapData.query.replace(/\+/g, ' ')
        return `https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${encodeURIComponent(q)}&zoom=${mapData.zoom || zoom}&maptype=roadmap&language=en`
      }
      if (mapData.cid) {
        return `https://www.google.com/maps/embed/v1/place?key=${apiKey}&cid=${mapData.cid}&zoom=${mapData.zoom || zoom}&maptype=roadmap&language=en`
      }
      if (googleMapsUrl) {
        return `https://www.google.com/maps/embed/v1/search?key=${apiKey}&q=${encodeURIComponent(googleMapsUrl)}&maptype=roadmap&language=en`
      }
      return null
    }

    // Use the latest Google Maps embed format - this automatically shows the newest interface
    // Google Maps automatically serves the latest version when using this format
    if (mapData.cid) {
      // Use CID with modern embed format
      return `https://www.google.com/maps?cid=${mapData.cid}&output=embed&hl=en&z=${mapData.zoom || zoom}`
    }

    if (mapData.query) {
      // Use query with modern embed format
      const query = encodeURIComponent(mapData.query.replace(/\+/g, ' '))
      return `https://www.google.com/maps?q=${query}&output=embed&hl=en&z=${mapData.zoom || zoom}`
    }

    if (mapData.lat && mapData.lng) {
      // Use coordinates with modern embed format - this shows the latest Google Maps interface
      return `https://www.google.com/maps?q=${mapData.lat},${mapData.lng}&output=embed&hl=en&z=${mapData.zoom || zoom}`
    }

    return null
  }, [apiKey, mapData, googleMapsUrl, zoom])

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

  if (!embedUrl && !googleMapsUrl && !mapData.lat && !mapData.lng) {
    return (
      <div className={`overflow-hidden border border-gray-200 bg-gray-100 rounded flex items-center justify-center ${className}`} style={{ height }}>
        <div className="text-center p-4">
          <FaMapMarkerAlt className="text-gray-400 text-4xl mx-auto mb-2" />
          <p className="text-gray-500 text-sm">Map location unavailable</p>
        </div>
      </div>
    )
  }

  const hasCoordinates = Boolean(mapData.lat && mapData.lng)
  const hasApiKey = Boolean(apiKey)

  return (
    <div className={`overflow-hidden border border-gray-200 rounded-lg shadow-sm z-0 ${className}`} style={{ zIndex: 0, position: 'relative' }}>
      {hasApiKey && embedUrl ? (
        <>
          <div className="relative w-full" style={{ height }}>
            <iframe
              ref={iframeRef}
              width="100%"
              height="100%"
              style={{ 
                border: 0,
                borderRadius: '0.5rem',
                filter: 'brightness(0.98) contrast(1.02)'
              }}
              loading="lazy"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
              src={embedUrl}
              title="Location Map"
              className="w-full h-full"
              allow="geolocation *; microphone *; camera *"
            />
            <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm rounded-lg shadow-md px-2 py-1 text-xs text-gray-600">
              Google Maps
            </div>
          </div>
          {showLink && googleMapsUrl && (
            <div className="mt-3 px-1">
              <a
                href={googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-primary-600 font-medium text-sm hover:text-primary-700 transition-colors group"
              >
                <FaMapMarkerAlt className="text-xs group-hover:scale-110 transition-transform" />
                <span>Open in Google Maps</span>
                <svg className="w-3 h-3 opacity-70 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </a>
            </div>
          )}
        </>
      ) : hasCoordinates ? (
        <>
          <div className="relative w-full" style={{ height }}>
            <MapContainer
              center={[mapData.lat, mapData.lng]}
              zoom={mapData.zoom || zoom}
              scrollWheelZoom={false}
              style={{ height: '100%', width: '100%', borderRadius: '0.5rem' }}
              className="rounded-lg"
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution="&copy; OpenStreetMap contributors"
              />
              <Marker position={[mapData.lat, mapData.lng]} />
            </MapContainer>
            <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm rounded-lg shadow-md px-2 py-1 text-xs text-gray-600">
              OpenStreetMap
            </div>
          </div>
          {showLink && googleMapsUrl && (
            <div className="mt-3 px-1">
              <a
                href={googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-primary-600 font-medium text-sm hover:text-primary-700 transition-colors group"
              >
                <FaMapMarkerAlt className="text-xs group-hover:scale-110 transition-transform" />
                <span>Open in Google Maps</span>
                <svg className="w-3 h-3 opacity-70 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </a>
            </div>
          )}
        </>
      ) : embedUrl ? (
        <>
          <div className="relative w-full" style={{ height }}>
            <iframe
              ref={iframeRef}
              width="100%"
              height="100%"
              style={{ 
                border: 0,
                borderRadius: '0.5rem',
              }}
              loading="lazy"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
              src={embedUrl}
              title="Location Map"
              allow="geolocation *; microphone *; camera *"
              className="w-full h-full"
              sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-forms"
            />
            <div className="absolute top-2 right-2 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg px-3 py-1.5 text-xs font-medium text-gray-700 border border-gray-200">
              <span className="inline-flex items-center gap-1.5">
                <svg className="w-3 h-3 text-red-500" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                </svg>
                Google Maps
              </span>
            </div>
          </div>
          {showLink && googleMapsUrl && (
            <div className="mt-3 px-1">
              <a
                href={googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-primary-600 font-medium text-sm hover:text-primary-700 transition-colors group"
              >
                <FaMapMarkerAlt className="text-xs group-hover:scale-110 transition-transform" />
                <span>Open in Google Maps</span>
                <svg className="w-3 h-3 opacity-70 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </a>
            </div>
          )}
        </>
      ) : (
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center rounded-lg" style={{ height }}>
          <div className="text-center p-4">
            <div className="w-16 h-16 mx-auto mb-3 bg-gray-200 rounded-full flex items-center justify-center">
              <FaMapMarkerAlt className="text-gray-400 text-2xl" />
            </div>
            <p className="text-gray-600 font-medium mb-1">Map unavailable</p>
            <p className="text-gray-400 text-xs mb-3">Location information not available</p>
            {googleMapsUrl && showLink && (
              <a
                href={googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 mt-2 px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors"
              >
                <FaMapMarkerAlt className="text-xs" />
                <span>Open in Google Maps</span>
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default Map
