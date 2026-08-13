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
  const markersGroupRef = useRef<L.LayerGroup | null>(null);

  const centerLat = userLocation?.latitude || -23.5505;
  const centerLng = userLocation?.longitude || -46.6333;

  const displayMechanics: MechanicMarker[] = mechanics.length > 0 ? mechanics : [
    { id: '1', name: 'Auto Center Express', lat: centerLat + 0.008, lng: centerLng + 0.012, type: 'Mecânica Geral' },
    { id: '2', name: 'Guincho Rápido 24h', lat: centerLat - 0.012, lng: centerLng + 0.006, type: 'Guincho' },
    { id: '3', name: 'Borracharia do Zé', lat: centerLat + 0.005, lng: centerLng - 0.010, type: 'Borracharia' },
    { id: '4', name: 'EletroAuto Silva', lat: centerLat - 0.007, lng: centerLng - 0.008, type: 'Elétrica' },
  ];

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [centerLat, centerLng],
        zoom: 13,
        zoomControl: true,
        attributionControl: false,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
      }).addTo(map);

      markersGroupRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;

      // Ensure dimensions recalculate on resize
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

  // Invalidate map size on window resize
  useEffect(() => {
    const handleResize = () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Update Markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    const group = markersGroupRef.current;
    if (!map || !group) return;

    group.clearLayers();

    // User Marker
    if (userLocation) {
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

      const userMarker = L.marker([userLocation.latitude, userLocation.longitude], { icon: userIcon });
      userMarker.bindPopup('<strong style="font-family:sans-serif;font-size:12px;">Sua Localização</strong>');
      group.addLayer(userMarker);
    }

    // Mechanics Markers
    displayMechanics.forEach((mech) => {
      const mechIcon = L.divIcon({
        className: 'custom-mech-pin',
        html: `<div class="relative flex items-center justify-center w-8 h-8 cursor-pointer">
          <div class="bg-rose-600 text-white p-1.5 rounded-full shadow-lg border-2 border-white flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
          </div>
        </div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const mechMarker = L.marker([mech.lat, mech.lng], { icon: mechIcon });
      mechMarker.bindPopup(`
        <div style="font-family: sans-serif; padding: 2px;">
          <strong style="display: block; font-size: 13px; color: #18181b;">${mech.name}</strong>
          <span style="font-size: 11px; color: #61616b;">${mech.type}</span>
        </div>
      `);
      group.addLayer(mechMarker);
    });

  }, [userLocation?.latitude, userLocation?.longitude, displayMechanics]);

  return (
    <div className="w-full h-[300px] sm:h-[400px] rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 shadow-lg relative fix-map-container isolate z-0">
      <div ref={mapContainerRef} className="w-full h-full z-0 overflow-hidden" />
      
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
