import React, { useState, useEffect, useRef } from 'react';
import { X, Navigation, MapPin } from 'lucide-react';
import L from 'leaflet';

interface MapComponentProps {
  latitude: number;
  longitude: number;
  title?: string;
  onClose?: () => void;
  userLatitude?: number;
  userLongitude?: number;
}

export const MapComponent: React.FC<MapComponentProps> = ({ 
  latitude, 
  longitude, 
  title, 
  onClose,
  userLatitude,
  userLongitude
}) => {
  const [viewMode, setViewMode] = useState<'PIN' | 'ROUTE'>('PIN');
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Clean up existing map instance if re-initializing
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const centerLat = latitude;
    const centerLng = longitude;

    // Initialize Leaflet Map centered on target or midpoint if route
    let initialLat = centerLat;
    let initialLng = centerLng;
    let initialZoom = 15;

    if (viewMode === 'ROUTE' && userLatitude && userLongitude) {
      initialLat = (userLatitude + latitude) / 2;
      initialLng = (userLongitude + longitude) / 2;
      initialZoom = 13;
    }

    const map = L.map(mapContainerRef.current, {
      center: [initialLat, initialLng],
      zoom: initialZoom,
      zoomControl: true,
    });

    mapInstanceRef.current = map;

    // OpenStreetMap Tile Layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);

    // Custom Red Pin Icon for Destination
    const destIcon = L.divIcon({
      className: 'custom-leaflet-marker',
      html: `
        <div style="background-color: #ef4444; width: 32px; height: 32px; border-radius: 50%; border: 3px solid #ffffff; box-shadow: 0 4px 10px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: white;">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 32],
      popupAnchor: [0, -32]
    });

    // Custom Blue Pin Icon for User
    const userIcon = L.divIcon({
      className: 'custom-leaflet-user-marker',
      html: `
        <div style="background-color: #3b82f6; width: 32px; height: 32px; border-radius: 50%; border: 3px solid #ffffff; box-shadow: 0 4px 10px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: white;">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg>
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 32],
      popupAnchor: [0, -32]
    });

    // Add Destination Marker
    const destMarker = L.marker([latitude, longitude], { icon: destIcon }).addTo(map);
    destMarker.bindPopup(`<strong>${title || 'Localização'}</strong>`).openPopup();

    if (viewMode === 'ROUTE' && userLatitude && userLongitude) {
      // Add User Marker
      const uMarker = L.marker([userLatitude, userLongitude], { icon: userIcon }).addTo(map);
      uMarker.bindPopup('<strong>Você está aqui</strong>');

      // Draw polyline connecting user to destination
      const polyline = L.polyline([
        [userLatitude, userLongitude],
        [latitude, longitude]
      ], {
        color: '#4f46e5',
        weight: 5,
        opacity: 0.8,
        dashArray: '10, 10'
      }).addTo(map);

      // Fit map bounds to show both points
      map.fitBounds(polyline.getBounds(), { padding: [40, 40] });
    }

    // Force map size update after render
    setTimeout(() => {
      map.invalidateSize();
    }, 200);

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [latitude, longitude, viewMode, userLatitude, userLongitude, title]);

  return (
    <div className="flex flex-col h-full w-full bg-white dark:bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-700 shadow-2xl">
      <div className="p-3.5 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center bg-zinc-50 dark:bg-zinc-900/50">
        <h3 className="font-bold text-zinc-800 dark:text-zinc-100 text-sm sm:text-base flex items-center gap-2">
          <div className="w-2.5 h-2.5 bg-rose-500 rounded-full animate-pulse"></div>
          {title || 'Localização no Mapa'}
        </h3>
        {onClose && (
          <button 
            type="button"
            onClick={onClose}
            className="p-1.5 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-full transition-colors text-zinc-500 cursor-pointer"
            title="Fechar"
          >
            <X size={18} />
          </button>
        )}
      </div>

      <div className="flex-1 relative min-h-[320px] z-0">
        <div ref={mapContainerRef} className="absolute inset-0 w-full h-full z-0" />
      </div>

      <div className="p-3 bg-zinc-50 dark:bg-zinc-900/90 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setViewMode('PIN')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
              viewMode === 'PIN' 
                ? 'bg-indigo-600 text-white shadow-sm' 
                : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
            }`}
          >
            <MapPin size={13} />
            Localização
          </button>
          <button
            type="button"
            onClick={() => setViewMode('ROUTE')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
              viewMode === 'ROUTE' 
                ? 'bg-indigo-600 text-white shadow-sm' 
                : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
            }`}
          >
            <Navigation size={13} />
            Rota no App
          </button>
        </div>

        <span className="text-[11px] text-zinc-400 font-medium hidden sm:inline flex items-center gap-1">
          🌍 OpenStreetMap Integrado
        </span>
      </div>
    </div>
  );
};
