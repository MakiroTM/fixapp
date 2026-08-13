import React, { useEffect, useRef, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import { Coordinates } from '../types';

interface MechanicMarker {
  id: string;
  name: string;
  lat: number;
  lng: number;
  type: string;
  distance?: string;
}

interface NearbyMapProps {
  userLocation: Coordinates | null;
  mechanics?: MechanicMarker[];
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

export const NearbyMap: React.FC<NearbyMapProps> = ({ userLocation, mechanics = [] }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const [mapLoaded, setMapLoaded] = useState(false);

  const centerLat = userLocation?.latitude || -23.5505;
  const centerLng = userLocation?.longitude || -46.6333;

  const displayMechanics: MechanicMarker[] = mechanics.length > 0 ? mechanics : [
    { id: '1', name: 'Auto Center Express', lat: centerLat + 0.008, lng: centerLng + 0.012, type: 'Mecânica Geral' },
    { id: '2', name: 'Guincho Rápido 24h', lat: centerLat - 0.012, lng: centerLng + 0.006, type: 'Guincho' },
    { id: '3', name: 'Borracharia do Zé', lat: centerLat + 0.005, lng: centerLng - 0.010, type: 'Borracharia' },
    { id: '4', name: 'EletroAuto Silva', lat: centerLat - 0.007, lng: centerLng - 0.008, type: 'Elétrica' },
  ];

  // Initialize Google Maps
  useEffect(() => {
    if (!mapContainerRef.current) return;
    let isMounted = true;

    const loader = getMapsLoader(GOOGLE_MAPS_KEY);

    (loader as any).load().then(() => {
      if (!isMounted || !mapContainerRef.current) return;

      if (!mapInstanceRef.current) {
        const map = new google.maps.Map(mapContainerRef.current, {
          center: { lat: centerLat, lng: centerLng },
          zoom: 13,
          mapId: 'DEMO_MAP_ID',
          zoomControl: true,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
          gestureHandling: 'greedy', // Single-finger touch drag and pinch-zoom for Android / touch
          clickableIcons: false,
        });

        mapInstanceRef.current = map;
        setMapLoaded(true);
      }
    }).catch(err => {
      console.error("Error loading Google Maps in NearbyMap:", err);
    });

    return () => {
      isMounted = false;
    };
  }, []);

  // Center user location ONCE when gps coordinates become available
  const hasCenteredUserRef = useRef(false);
  useEffect(() => {
    if (userLocation && mapInstanceRef.current && !hasCenteredUserRef.current) {
      mapInstanceRef.current.panTo({ lat: userLocation.latitude, lng: userLocation.longitude });
      mapInstanceRef.current.setZoom(14);
      hasCenteredUserRef.current = true;
    }
  }, [userLocation, mapLoaded]);

  // Update Markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !mapLoaded) return;

    markersRef.current.forEach(m => m.setMap(null));
    markersRef.current = [];

    // User Marker
    if (userLocation) {
      const uMarker = new google.maps.Marker({
        position: { lat: userLocation.latitude, lng: userLocation.longitude },
        map,
        title: 'Sua Localização',
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 9,
          fillColor: '#3b82f6',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 3,
        }
      });
      const userInfoWindow = new google.maps.InfoWindow({
        content: '<div style="font-weight:bold;font-family:sans-serif;padding:2px;font-size:12px;">Você está aqui</div>'
      });
      uMarker.addListener('click', () => userInfoWindow.open(map, uMarker));
      markersRef.current.push(uMarker);
    }

    // Mechanics Markers
    displayMechanics.forEach((mech) => {
      const mMarker = new google.maps.Marker({
        position: { lat: mech.lat, lng: mech.lng },
        map,
        title: mech.name,
        icon: {
          path: google.maps.SymbolPath.BACKWARD_CLOSED_ARROW,
          scale: 6,
          fillColor: '#ef4444',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 2,
        }
      });

      const infoWindow = new google.maps.InfoWindow({
        content: `
          <div style="font-family: sans-serif; padding: 2px;">
            <strong style="display: block; font-size: 13px; color: #18181b;">${mech.name}</strong>
            <span style="font-size: 11px; color: #61616b;">${mech.type}</span>
          </div>
        `
      });

      mMarker.addListener('click', () => infoWindow.open(map, mMarker));
      markersRef.current.push(mMarker);
    });

  }, [userLocation?.latitude, userLocation?.longitude, displayMechanics, mapLoaded]);

  return (
    <div className="w-full h-[300px] sm:h-[400px] rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 shadow-lg relative z-0">
      <div ref={mapContainerRef} className="w-full h-full z-0" />
      
      {!userLocation && (
        <div className="absolute top-3 left-3 right-3 bg-amber-500/90 backdrop-blur-md text-zinc-950 font-bold p-2 rounded-xl text-xs z-20 flex items-center justify-between shadow-md">
          <span>⚠️ Localização GPS indisponível — Ative o GPS para ver sua posição real</span>
        </div>
      )}

      {/* Legend Overlay */}
      <div className="absolute bottom-4 right-4 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-sm p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 shadow-md text-[10px] sm:text-xs z-20 flex flex-col gap-1.5 pointer-events-none">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-blue-500 shadow-sm border border-white"></div>
          <span className="text-zinc-700 dark:text-zinc-300 font-medium">Sua Localização</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-rose-500 shadow-sm border border-white"></div>
          <span className="text-zinc-700 dark:text-zinc-300 font-medium">Oficinas / Guinchos</span>
        </div>
      </div>
    </div>
  );
};
