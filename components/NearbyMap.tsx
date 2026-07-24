import React, { useState } from 'react';
import { APIProvider, Map, AdvancedMarker, Pin, InfoWindow, useAdvancedMarkerRef } from '@vis.gl/react-google-maps';
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

const API_KEY =
  process.env.GOOGLE_MAPS_PLATFORM_KEY ||
  (import.meta as any).env?.VITE_GOOGLE_MAPS_PLATFORM_KEY ||
  (globalThis as any).GOOGLE_MAPS_PLATFORM_KEY ||
  '';
const hasValidKey = Boolean(API_KEY) && API_KEY !== 'YOUR_API_KEY';

function MechanicMarkerComponent({ mech }: { mech: MechanicMarker }) {
  const [markerRef, marker] = useAdvancedMarkerRef();
  const [open, setOpen] = useState(false);

  return (
    <>
      <AdvancedMarker ref={markerRef} position={{ lat: mech.lat, lng: mech.lng }} onClick={() => setOpen(true)}>
        <Pin background="#ef4444" glyphColor="#fff" borderColor="#b91c1c" />
      </AdvancedMarker>
      {open && (
        <InfoWindow anchor={marker} onCloseClick={() => setOpen(false)}>
          <div className="font-sans p-1">
            <strong className="block text-sm text-zinc-900">{mech.name}</strong>
            <span className="text-xs text-zinc-500">{mech.type}</span>
          </div>
        </InfoWindow>
      )}
    </>
  );
}

function UserMarkerComponent({ lat, lng }: { lat: number; lng: number }) {
  const [markerRef, marker] = useAdvancedMarkerRef();
  const [open, setOpen] = useState(false);

  return (
    <>
      <AdvancedMarker ref={markerRef} position={{ lat, lng }} onClick={() => setOpen(true)}>
        <Pin background="#3b82f6" glyphColor="#fff" borderColor="#1d4ed8" />
      </AdvancedMarker>
      {open && (
        <InfoWindow anchor={marker} onCloseClick={() => setOpen(false)}>
          <div className="text-center font-bold text-zinc-900 p-1">Você está aqui</div>
        </InfoWindow>
      )}
    </>
  );
}

export const NearbyMap: React.FC<NearbyMapProps> = ({ userLocation, mechanics = [] }) => {
  // Default to somewhere in SP if no location
  const centerLat = userLocation?.latitude || -23.5505;
  const centerLng = userLocation?.longitude || -46.6333;

  // Generate some simulated nearby mechanics if none provided
  const displayMechanics = mechanics.length > 0 ? mechanics : [
    { id: '1', name: 'Auto Center Express', lat: centerLat + 0.01, lng: centerLng + 0.015, type: 'Mecânica Geral' },
    { id: '2', name: 'Guincho Rápido 24h', lat: centerLat - 0.015, lng: centerLng + 0.005, type: 'Guincho' },
    { id: '3', name: 'Borracharia do Zé', lat: centerLat + 0.005, lng: centerLng - 0.012, type: 'Borracharia' },
    { id: '4', name: 'EletroAuto Silva', lat: centerLat - 0.008, lng: centerLng - 0.01, type: 'Elétrica' },
  ];

  if (!hasValidKey) {
    return (
      <div className="w-full h-[300px] sm:h-[400px] rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 shadow-lg relative z-0 flex items-center justify-center bg-zinc-100 dark:bg-zinc-900">
        <div className="text-center max-w-sm px-4">
          <h2 className="font-bold mb-2 text-zinc-900 dark:text-zinc-100">Google Maps API Key Required</h2>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 mb-4">
            Por favor, adicione sua chave de API do Google Maps nas configurações do projeto para visualizar o mapa.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-[300px] sm:h-[400px] rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 shadow-lg relative z-0">
      <APIProvider apiKey={API_KEY} version="weekly">
        <Map
          defaultCenter={{ lat: centerLat, lng: centerLng }}
          defaultZoom={13}
          mapId="DEMO_MAP_ID"
          internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
          style={{ width: '100%', height: '100%' }}
        >
          {userLocation && (
            <UserMarkerComponent lat={userLocation.latitude} lng={userLocation.longitude} />
          )}

          {displayMechanics.map((mech) => (
            <MechanicMarkerComponent key={mech.id} mech={mech} />
          ))}
        </Map>
      </APIProvider>
      
      {/* Legend Overlay */}
      <div className="absolute bottom-4 right-4 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-sm p-2 rounded-lg border border-zinc-200 dark:border-zinc-700 shadow-md text-[10px] sm:text-xs z-[1000] flex flex-col gap-1.5 pointer-events-none">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-blue-500 shadow-sm border border-white"></div>
          <span className="text-zinc-700 dark:text-zinc-300 font-medium">Você</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-rose-500 shadow-sm border border-white"></div>
          <span className="text-zinc-700 dark:text-zinc-300 font-medium">Oficinas / Guinchos</span>
        </div>
      </div>
    </div>
  );
};
