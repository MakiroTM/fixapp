import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
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

export const NearbyMap: React.FC<NearbyMapProps> = ({ userLocation, mechanics = [] }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  // Default center (São Paulo) if no user location
  const centerLat = userLocation?.latitude || -23.5505;
  const centerLng = userLocation?.longitude || -46.6333;

  // Generate simulated nearby mechanics if none provided
  const displayMechanics: MechanicMarker[] = mechanics.length > 0 ? mechanics : [
    { id: '1', name: 'Auto Center Express', lat: centerLat + 0.008, lng: centerLng + 0.012, type: 'Mecânica Geral' },
    { id: '2', name: 'Guincho Rápido 24h', lat: centerLat - 0.012, lng: centerLng + 0.006, type: 'Guincho' },
    { id: '3', name: 'Borracharia do Zé', lat: centerLat + 0.005, lng: centerLng - 0.010, type: 'Borracharia' },
    { id: '4', name: 'EletroAuto Silva', lat: centerLat - 0.007, lng: centerLng - 0.008, type: 'Elétrica' },
  ];

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const map = L.map(mapContainerRef.current, {
      center: [centerLat, centerLng],
      zoom: 13,
      zoomControl: true,
    });

    mapInstanceRef.current = map;

    // OpenStreetMap Tiles Layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // Custom Icon for Mechanics
    const mechanicIcon = L.divIcon({
      className: 'custom-leaflet-mech-marker',
      html: `
        <div style="background-color: #ef4444; width: 30px; height: 30px; border-radius: 50%; border: 3px solid #ffffff; box-shadow: 0 4px 10px rgba(239, 68, 68, 0.4); display: flex; align-items: center; justify-content: center; color: white;">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
        </div>
      `,
      iconSize: [30, 30],
      iconAnchor: [15, 15],
      popupAnchor: [0, -15]
    });

    // Custom Icon for User
    const userIcon = L.divIcon({
      className: 'custom-leaflet-user-marker',
      html: `
        <div style="position: relative; width: 32px; height: 32px;">
          <div style="position: absolute; inset: -4px; background-color: rgba(59, 130, 246, 0.4); border-radius: 50%; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
          <div style="position: relative; background-color: #3b82f6; width: 32px; height: 32px; border-radius: 50%; border: 3px solid #ffffff; box-shadow: 0 4px 12px rgba(59, 130, 246, 0.5); display: flex; align-items: center; justify-content: center; color: white;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg>
          </div>
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
      popupAnchor: [0, -16]
    });

    // Add user marker if available
    if (userLocation) {
      const uMarker = L.marker([userLocation.latitude, userLocation.longitude], { icon: userIcon }).addTo(map);
      uMarker.bindPopup('<div style="text-align: center; font-weight: bold; font-family: sans-serif;">Você está aqui</div>');
    }

    // Add mechanic markers
    displayMechanics.forEach((mech) => {
      const mMarker = L.marker([mech.lat, mech.lng], { icon: mechanicIcon }).addTo(map);
      mMarker.bindPopup(`
        <div style="font-family: sans-serif; padding: 2px;">
          <strong style="display: block; font-size: 14px; color: #18181b;">${mech.name}</strong>
          <span style="font-size: 12px; color: #61616b;">${mech.type}</span>
        </div>
      `);
    });

    // Recalculate size after component mount
    setTimeout(() => {
      map.invalidateSize();
    }, 200);

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [userLocation?.latitude, userLocation?.longitude, mechanics]);

  return (
    <div className="w-full h-[300px] sm:h-[400px] rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 shadow-lg relative z-0">
      <div ref={mapContainerRef} className="w-full h-full z-0" />
      
      {/* Legend Overlay */}
      <div className="absolute bottom-4 right-4 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-sm p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 shadow-md text-[10px] sm:text-xs z-[1000] flex flex-col gap-1.5 pointer-events-none">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-blue-500 shadow-sm border border-white"></div>
          <span className="text-zinc-700 dark:text-zinc-300 font-medium">Sua Localização</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-rose-500 shadow-sm border border-white"></div>
          <span className="text-zinc-700 dark:text-zinc-300 font-medium">Oficinas / Guinchos (OpenStreetMap)</span>
        </div>
      </div>
    </div>
  );
};
