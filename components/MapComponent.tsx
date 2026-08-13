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
  const markersGroupRef = useRef<L.LayerGroup | null>(null);

  // Initialize Leaflet map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [latitude, longitude],
        zoom: 15,
        zoomControl: true,
        attributionControl: false,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
      }).addTo(map);

      markersGroupRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;

      setTimeout(() => {
        map.invalidateSize();
      }, 200);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update map markers & routes
  useEffect(() => {
    const map = mapInstanceRef.current;
    const group = markersGroupRef.current;
    if (!map || !group) return;

    group.clearLayers();

    // Destination Pin
    const destIcon = L.divIcon({
      className: 'custom-dest-pin',
      html: `<div class="relative flex items-center justify-center w-8 h-8 cursor-pointer">
        <div class="bg-rose-600 text-white p-1.5 rounded-full shadow-lg border-2 border-white flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
        </div>
      </div>`,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });

    const destMarker = L.marker([latitude, longitude], { icon: destIcon });
    destMarker.bindPopup(`<strong style="font-family:sans-serif;font-size:12px;">${title || 'Localização'}</strong>`).openPopup();
    group.addLayer(destMarker);

    if (viewMode === 'ROUTE' && userLatitude && userLongitude) {
      const userIcon = L.divIcon({
        className: 'custom-user-pin',
        html: `<div class="relative flex items-center justify-center w-8 h-8">
          <div class="absolute inset-0 bg-blue-500/40 rounded-full animate-ping"></div>
          <div class="w-6 h-6 bg-blue-600 border-2 border-white rounded-full shadow-lg flex items-center justify-center text-white">
            <div class="w-2 h-2 bg-white rounded-full"></div>
          </div>
        </div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const userMarker = L.marker([userLatitude, userLongitude], { icon: userIcon });
      userMarker.bindPopup('<strong style="font-family:sans-serif;font-size:12px;">Sua Posição</strong>');
      group.addLayer(userMarker);

      const polyline = L.polyline([
        [userLatitude, userLongitude],
        [latitude, longitude]
      ], {
        color: '#4f46e5',
        weight: 5,
        opacity: 0.8,
        dashArray: '10, 10'
      });
      group.addLayer(polyline);

      const bounds = L.latLngBounds([
        [userLatitude, userLongitude],
        [latitude, longitude]
      ]);
      map.fitBounds(bounds, { padding: [40, 40] });
    } else {
      map.setView([latitude, longitude], 15);
    }
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
          🌍 Mapa Interativo
        </span>
      </div>
    </div>
  );
};
