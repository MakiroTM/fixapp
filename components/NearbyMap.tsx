import React, { useEffect, useState, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Coordinates } from '../types';
import { MapPin, Navigation, Clock, Activity, Map as MapIcon, X } from 'lucide-react';

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

const destinationIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
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

// Component to handle map clicks
const MapClickHandler = ({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) => {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
};

export const NearbyMap: React.FC<NearbyMapProps> = ({ userLocation, mechanics = [] }) => {
  // Default to somewhere in SP if no location
  const centerLat = userLocation?.latitude || -23.5505;
  const centerLng = userLocation?.longitude || -46.6333;

  const [manualOrigin, setManualOrigin] = useState<Coordinates | null>(null);
  const [destination, setDestination] = useState<Coordinates | null>(null);
  const [routeCoords, setRouteCoords] = useState<[number, number][]>([]);
  const [routeParams, setRouteParams] = useState<{ distance: number; duration: number } | null>(null);
  const [isRouting, setIsRouting] = useState(false);
  const [selectionMode, setSelectionMode] = useState<'origin' | 'destination' | null>(null);

  const activeOrigin = manualOrigin || userLocation;

  const displayMechanics = mechanics.length > 0 ? mechanics : [
    { id: '1', name: 'Auto Center Express', lat: centerLat + 0.01, lng: centerLng + 0.015, type: 'Mecânica Geral' },
    { id: '2', name: 'Guincho Rápido 24h', lat: centerLat - 0.015, lng: centerLng + 0.005, type: 'Guincho' },
    { id: '3', name: 'Borracharia do Zé', lat: centerLat + 0.005, lng: centerLng - 0.012, type: 'Borracharia' },
    { id: '4', name: 'EletroAuto Silva', lat: centerLat - 0.008, lng: centerLng - 0.01, type: 'Elétrica' },
  ];

  const fetchRoute = async (start: Coordinates, end: Coordinates) => {
    setIsRouting(true);
    try {
      const url = `https://router.project-osrm.org/route/v1/driving/${start.longitude},${start.latitude};${end.longitude},${end.latitude}?overview=full&geometries=geojson`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        // OSRM returns [lon, lat], leaflet expects [lat, lon]
        const coords = route.geometry.coordinates.map((c: number[]) => [c[1], c[0]] as [number, number]);
        setRouteCoords(coords);
        setRouteParams({
          distance: route.distance, // in meters
          duration: route.duration  // in seconds
        });
      } else {
        setRouteCoords([]);
        setRouteParams(null);
      }
    } catch (e) {
      console.error("Error fetching route from OSRM", e);
      setRouteCoords([]);
      setRouteParams(null);
    } finally {
      setIsRouting(false);
    }
  };

  useEffect(() => {
    if (activeOrigin && destination) {
      fetchRoute(activeOrigin, destination);
    } else {
      setRouteCoords([]);
      setRouteParams(null);
    }
  }, [activeOrigin?.latitude, activeOrigin?.longitude, destination?.latitude, destination?.longitude]);

  const handleMapClick = useCallback((lat: number, lng: number) => {
    if (selectionMode === 'origin') {
      setManualOrigin({ latitude: lat, longitude: lng });
      setSelectionMode(null);
    } else if (selectionMode === 'destination') {
      setDestination({ latitude: lat, longitude: lng });
      setSelectionMode(null);
    }
  }, [selectionMode]);

  const handleMechanicRoute = (mech: MechanicMarker) => {
    setDestination({ latitude: mech.lat, longitude: mech.lng });
  };

  const clearRoute = () => {
    setDestination(null);
    setManualOrigin(null);
    setRouteCoords([]);
    setRouteParams(null);
    setSelectionMode(null);
  };

  const formatDistance = (meters: number) => {
    if (meters < 1000) return `${Math.round(meters)}m`;
    return `${(meters / 1000).toFixed(1)}km`;
  };

  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${Math.round(seconds)}s`;
    const mins = Math.round(seconds / 60);
    if (mins < 60) return `${mins} min`;
    const hrs = Math.floor(mins / 60);
    const remMins = mins % 60;
    return `${hrs}h ${remMins}m`;
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Route Controls */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 shadow-sm flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <button 
            onClick={() => setSelectionMode(selectionMode === 'origin' ? null : 'origin')}
            className={`flex-1 py-2 px-3 rounded-lg border text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
              selectionMode === 'origin' 
                ? 'bg-blue-50 border-blue-500 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300' 
                : 'bg-zinc-50 border-zinc-200 text-zinc-700 hover:bg-zinc-100 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-300'
            }`}
          >
            <MapPin size={16} />
            {selectionMode === 'origin' ? 'Clique no mapa...' : 'Alterar Origem'}
          </button>

          <button 
            onClick={() => setSelectionMode(selectionMode === 'destination' ? null : 'destination')}
            className={`flex-1 py-2 px-3 rounded-lg border text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
              selectionMode === 'destination' 
                ? 'bg-green-50 border-green-500 text-green-700 dark:bg-green-500/20 dark:text-green-300' 
                : 'bg-zinc-50 border-zinc-200 text-zinc-700 hover:bg-zinc-100 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-300'
            }`}
          >
            <Navigation size={16} />
            {selectionMode === 'destination' ? 'Clique no mapa...' : 'Escolher Destino'}
          </button>

          {(destination || manualOrigin) && (
            <button 
              onClick={clearRoute}
              className="py-2 px-3 rounded-lg border border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100 dark:bg-rose-500/10 dark:border-rose-500/30 dark:text-rose-400 text-sm font-medium flex items-center justify-center gap-2"
            >
              <X size={16} />
              Limpar
            </button>
          )}
        </div>

        {routeParams && (
          <div className="flex items-center gap-4 pt-2 border-t border-zinc-100 dark:border-zinc-800">
            <div className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400">
              <Activity size={16} />
              <span className="text-sm font-semibold">{formatDistance(routeParams.distance)}</span>
            </div>
            <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
              <Clock size={16} />
              <span className="text-sm font-semibold">{formatDuration(routeParams.duration)}</span>
            </div>
            {isRouting && <span className="text-xs text-zinc-500 ml-auto animate-pulse">Calculando...</span>}
          </div>
        )}
      </div>

      {/* Map Container */}
      <div className="w-full h-[350px] sm:h-[450px] rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 shadow-lg relative z-0">
        <MapContainer 
          center={[centerLat, centerLng]} 
          zoom={13} 
          style={{ height: '100%', width: '100%', zIndex: 1, cursor: selectionMode ? 'crosshair' : 'grab' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          <MapClickHandler onMapClick={handleMapClick} />
          
          {/* Active Origin Marker */}
          {activeOrigin && (
            <>
              <Marker position={[activeOrigin.latitude, activeOrigin.longitude]} icon={userIcon}>
                <Popup>
                  <div className="text-center font-bold">Origem ({manualOrigin ? 'Manual' : 'Sua Localização'})</div>
                </Popup>
              </Marker>
              {!manualOrigin && !destination && <RecenterAutomatically lat={activeOrigin.latitude} lng={activeOrigin.longitude} />}
            </>
          )}

          {/* User's true location ghost marker if manual origin is set */}
          {manualOrigin && userLocation && (
            <Marker position={[userLocation.latitude, userLocation.longitude]} icon={userIcon} opacity={0.5}>
              <Popup>Sua localização real</Popup>
            </Marker>
          )}

          {/* Active Destination Marker */}
          {destination && (
            <Marker position={[destination.latitude, destination.longitude]} icon={destinationIcon}>
              <Popup>
                <div className="text-center font-bold">Destino Selecionado</div>
              </Popup>
            </Marker>
          )}

          {/* Mechanics Markers */}
          {displayMechanics.map((mech) => (
            <Marker key={mech.id} position={[mech.lat, mech.lng]} icon={mechanicIcon}>
              <Popup>
                <div className="font-sans min-w-[150px]">
                  <strong className="block text-sm text-zinc-900">{mech.name}</strong>
                  <span className="text-xs text-zinc-500 block mb-2">{mech.type}</span>
                  <button 
                    onClick={() => handleMechanicRoute(mech)}
                    className="w-full py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium rounded-md transition-colors"
                  >
                    Traçar Rota
                  </button>
                </div>
              </Popup>
            </Marker>
          ))}

          {/* Route Polyline */}
          {routeCoords.length > 0 && (
            <Polyline 
              positions={routeCoords} 
              color="#4f46e5" 
              weight={5} 
              opacity={0.8}
              dashArray="10, 10" 
            />
          )}
        </MapContainer>
        
        {/* Legend Overlay */}
        <div className="absolute bottom-4 right-4 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-sm p-2 rounded-lg border border-zinc-200 dark:border-zinc-700 shadow-md text-[10px] sm:text-xs z-[1000] flex flex-col gap-1.5 pointer-events-none">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500 shadow-sm border border-white"></div>
            <span className="text-zinc-700 dark:text-zinc-300 font-medium">Você / Origem</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500 shadow-sm border border-white"></div>
            <span className="text-zinc-700 dark:text-zinc-300 font-medium">Destino</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-rose-500 shadow-sm border border-white"></div>
            <span className="text-zinc-700 dark:text-zinc-300 font-medium">Oficinas</span>
          </div>
        </div>
      </div>
    </div>
  );
};
