import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './MapPicker.css';

// Fix default icon paths for webpack
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const MapPicker = ({ onLocationSelect, initialPosition = [40.7128, -74.0060] }) => {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markerRef = useRef(null);
  const [address, setAddress] = useState('');
  const initDone = useRef(false);

  const reverseGeocode = async (lat, lng) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
      );
      const data = await response.json();
      return data.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    } catch {
      return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    }
  };

  const updateLocation = async (lat, lng) => {
    const addr = await reverseGeocode(lat, lng);
    setAddress(addr);
    if (onLocationSelect) {
      onLocationSelect([lat, lng], addr);
    }
  };

  useEffect(() => {
    if (!mapRef.current || initDone.current) return;
    initDone.current = true;

    const map = L.map(mapRef.current, {
      center: initialPosition,
      zoom: 13,
      zoomControl: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    const marker = L.marker(initialPosition, { draggable: true }).addTo(map);

    marker.on('dragend', async (e) => {
      const { lat, lng } = e.target.getLatLng();
      await updateLocation(lat, lng);
    });

    map.on('click', async (e) => {
      const { lat, lng } = e.latlng;
      marker.setLatLng([lat, lng]);
      await updateLocation(lat, lng);
    });

    mapInstance.current = map;
    markerRef.current = marker;

    // Don't set default address - user must click map to select

    return () => {
      map.remove();
      initDone.current = false;
    };
  }, []);

  return (
    <div className="map-picker">
      <div ref={mapRef} className="map-container"></div>
      {address && (
        <div className="selected-address">
          <strong>Selected Address:</strong> {address}
        </div>
      )}
    </div>
  );
};

export default MapPicker;
