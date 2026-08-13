import React, { useState, useEffect, useRef } from 'react';
import { X, Navigation, MapPin } from 'lucide-react';
import { Loader } from '@googlemaps/js-api-loader';

interface MapComponentProps {
  latitude: number;
  longitude: number;
  title?: string;
  onClose?: () => void;
  userLatitude?: number;
  userLongitude?: number;
}

const GOOGLE_MAPS_KEY =
  process.env.GOOGLE_MAPS_PLATFORM_KEY ||
  (import.meta as any).env?.VITE_GOOGLE_MAPS_PLATFORM_KEY ||
  (globalThis as any).GOOGLE_MAPS_PLATFORM_KEY ||
  '';

let globalLoader: Loader | null = null;

function getMapsLoader(key: string) {
  if (!globalLoader) {
    globalLoader = new Loader({
      apiKey: key || 'YOUR_API_KEY',
      version: 'weekly',
      libraries: ['places', 'geometry', 'marker']
    });
  }
  return globalLoader;
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
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const polylineRef = useRef<google.maps.Polyline | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Initialize map once
  useEffect(() => {
    if (!mapContainerRef.current) return;
    let isMounted = true;

    const loader = getMapsLoader(GOOGLE_MAPS_KEY);

    (loader as any).load().then(() => {
      if (!isMounted || !mapContainerRef.current) return;

      if (!mapInstanceRef.current) {
        let initialLat = latitude;
        let initialLng = longitude;
        let initialZoom = 15;

        if (viewMode === 'ROUTE' && userLatitude && userLongitude) {
          initialLat = (userLatitude + latitude) / 2;
          initialLng = (userLongitude + longitude) / 2;
          initialZoom = 13;
        }

        const map = new google.maps.Map(mapContainerRef.current, {
          center: { lat: initialLat, lng: initialLng },
          zoom: initialZoom,
          mapId: 'DEMO_MAP_ID',
          zoomControl: true,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
          gestureHandling: 'greedy',
          clickableIcons: false,
        });

        mapInstanceRef.current = map;
        setMapLoaded(true);
      }
    }).catch(err => {
      console.error("Error loading Google Maps in MapComponent:", err);
    });

    return () => {
      isMounted = false;
    };
  }, []);

  // Update markers and route when props or viewMode change
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !mapLoaded) return;

    // Clear old markers & polyline
    markersRef.current.forEach(m => m.setMap(null));
    markersRef.current = [];
    if (polylineRef.current) {
      polylineRef.current.setMap(null);
      polylineRef.current = null;
    }

    // Destination Marker
    const destMarker = new google.maps.Marker({
      position: { lat: latitude, lng: longitude },
      map,
      title: title || 'Localização',
      icon: {
        path: google.maps.SymbolPath.BACKWARD_CLOSED_ARROW,
        scale: 7,
        fillColor: '#ef4444',
        fillOpacity: 1,
        strokeColor: '#ffffff',
        strokeWeight: 2,
      }
    });

    const infoWindow = new google.maps.InfoWindow({
      content: `<div style="font-weight:bold;font-family:sans-serif;padding:2px;font-size:12px;">${title || 'Localização'}</div>`
    });

    destMarker.addListener('click', () => infoWindow.open(map, destMarker));
    infoWindow.open(map, destMarker);
    markersRef.current.push(destMarker);

    if (viewMode === 'ROUTE' && userLatitude && userLongitude) {
      // User Marker
      const userMarker = new google.maps.Marker({
        position: { lat: userLatitude, lng: userLongitude },
        map,
        title: 'Você está aqui',
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: '#3b82f6',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 2,
        }
      });
      markersRef.current.push(userMarker);

      // Polyline route
      const polyline = new google.maps.Polyline({
        path: [
          { lat: userLatitude, lng: userLongitude },
          { lat: latitude, lng: longitude }
        ],
        geodesic: true,
        strokeColor: '#4f46e5',
        strokeOpacity: 0.8,
        strokeWeight: 5
      });
      polyline.setMap(map);
      polylineRef.current = polyline;

      const bounds = new google.maps.LatLngBounds();
      bounds.extend({ lat: userLatitude, lng: userLongitude });
      bounds.extend({ lat: latitude, lng: longitude });
      map.fitBounds(bounds, 50);
    } else {
      map.setCenter({ lat: latitude, lng: longitude });
      map.setZoom(15);
    }
  }, [latitude, longitude, viewMode, userLatitude, userLongitude, title, mapLoaded]);

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
          🌍 Google Maps Integrado
        </span>
      </div>
    </div>
  );
};
