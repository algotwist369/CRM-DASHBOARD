import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Circle, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icon issue with Leaflet in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Component to handle map clicks
const MapClickHandler = ({ onLocationSelect }) => {
    useMapEvents({
        click: (e) => {
            onLocationSelect(e.latlng);
        },
    });
    return null;
};

const MapLocationPicker = ({
    initialLat = 20.5937,
    initialLng = 78.9629,
    radius = 20000,
    onLocationChange,
    className = "",
    style = {}
}) => {
    const [position, setPosition] = useState([initialLat, initialLng]);

    useEffect(() => {
        if (initialLat && initialLng) {
            setPosition([initialLat, initialLng]);
        }
    }, [initialLat, initialLng]);

    const handleLocationSelect = (latlng) => {
        const newPosition = [latlng.lat, latlng.lng];
        setPosition(newPosition);
        if (onLocationChange) {
            onLocationChange({ lat: latlng.lat, lng: latlng.lng });
        }
    };

    return (
        <div
            className={`w-full rounded-lg overflow-hidden border border-gray-300 relative ${className || 'h-[100%]'}`}
            style={style}
        >
            <MapContainer
                center={position}
                zoom={12}
                scrollWheelZoom={true}
                style={{ height: '100%', width: '100%' }}
                key={`${position[0]}-${position[1]}`} // Force re-render on position change
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.google.com/maps">Google Maps</a>'
                    url="https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
                />
                <MapClickHandler onLocationSelect={handleLocationSelect} />
                {position && <Marker position={position} />}
                {position && radius && (
                    <Circle
                        center={position}
                        radius={radius}
                        pathOptions={{
                            color: '#B20000',
                            fillColor: '#B20000',
                            fillOpacity: 0.1,
                            weight: 2
                        }}
                    />
                )}
            </MapContainer>
            <div className="absolute bottom-2 left-2 bg-white px-2 py-1 rounded shadow-sm text-xs text-gray-600 z-[1000]">
                Click anywhere to set location
            </div>
        </div>
    );
};

export default MapLocationPicker;
