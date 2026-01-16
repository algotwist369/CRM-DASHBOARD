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
      if (mapData.lat && mapData.lng) {
        return `https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${mapData.lat},${mapData.lng}&zoom=${mapData.zoom || zoom}`
      }
      if (mapData.query) {
        const q = mapData.query.replace(/\+/g, ' ')
        return `https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${encodeURIComponent(q)}&zoom=${mapData.zoom || zoom}`
      }
      if (googleMapsUrl) {
        return `https://www.google.com/maps/embed/v1/search?key=${apiKey}&q=${encodeURIComponent(googleMapsUrl)}`
      }
      return null
    }

    if (mapData.cid) {
      return `https://maps.google.com/maps?cid=${mapData.cid}&output=embed`
    }

    if (mapData.query) {
      return `https://maps.google.com/maps?q=${mapData.query}&t=m&z=${mapData.zoom}&output=embed&iwloc=near`
    }

    if (mapData.lat && mapData.lng) {
      return `https://maps.google.com/maps?q=${mapData.lat},${mapData.lng}&t=m&z=${mapData.zoom}&output=embed&iwloc=near`
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
    <div className={`overflow-hidden border border-gray-200 rounded z-0 ${className}`}>
      {hasApiKey && embedUrl ? (
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
            className="w-full"
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
      ) : hasCoordinates ? (
        <>
          <MapContainer
            center={[mapData.lat, mapData.lng]}
            zoom={mapData.zoom || zoom}
            scrollWheelZoom={false}
            style={{ height, width: '100%' }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution="&copy; OpenStreetMap contributors"
            />
            <Marker position={[mapData.lat, mapData.lng]} />
          </MapContainer>
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
      ) : embedUrl ? (
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
