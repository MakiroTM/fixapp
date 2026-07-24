import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Coordinates } from '../types';

// Fix for default marker icons in Leaflet with Webpack/Vite
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom icons
const userIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const mechanicIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

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

// Component to recenter map when location changes
const RecenterAutomatically = ({ lat, lng }: { lat: number; lng: number }) => {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng]);
  }, [lat, lng, map]);
  return null;
};

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

  return (
    <div className="w-full h-[300px] sm:h-[400px] rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 shadow-lg relative z-0">
      <MapContainer 
        center={[centerLat, centerLng]} 
        zoom={13} 
        style={{ height: '100%', width: '100%', zIndex: 1 }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {userLocation && (
          <>
            <Marker position={[userLocation.latitude, userLocation.longitude]} icon={userIcon}>
              <Popup>
                <div className="text-center font-bold">Você está aqui</div>
              </Popup>
            </Marker>
            <RecenterAutomatically lat={userLocation.latitude} lng={userLocation.longitude} />
          </>
        )}

        {displayMechanics.map((mech) => (
          <Marker key={mech.id} position={[mech.lat, mech.lng]} icon={mechanicIcon}>
            <Popup>
              <div className="font-sans">
                <strong className="block text-sm text-zinc-900">{mech.name}</strong>
                <span className="text-xs text-zinc-500">{mech.type}</span>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      
      {/* Legend Overlay */}
      <div className="absolute bottom-4 right-4 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-sm p-2 rounded-lg border border-zinc-200 dark:border-zinc-700 shadow-md text-[10px] sm:text-xs z-[1000] flex flex-col gap-1.5">
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
