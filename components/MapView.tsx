import React, { useEffect, useState, useCallback, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Coordinates, TechnicalCall } from '../types';
import { MapPin, Navigation, Clock, Activity, X, LocateFixed, Layers, Plus, Minus, User, Map, Image as ImageIcon, CheckCircle, Edit, Play } from 'lucide-react';
import { ConfirmationModal } from './ConfirmationModal';

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

const callPendingIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const callInProgressIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-orange.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const callCompletedIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const destinationIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-violet.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

interface MapViewProps {
  userLocation: Coordinates | null;
  initialCalls?: TechnicalCall[];
}

// Component to handle map clicks
const MapClickHandler = ({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) => {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
};

// Component to recenter map with smooth animation
const RecenterAutomatically = ({ lat, lng, trigger }: { lat: number; lng: number, trigger: number }) => {
  const map = useMap();
  useEffect(() => {
    if (lat && lng && trigger > 0) {
      map.flyTo([lat, lng], map.getZoom(), { animate: true, duration: 1.5 });
    }
  }, [lat, lng, trigger, map]);
  return null;
};

export const MapView: React.FC<MapViewProps> = ({ userLocation, initialCalls }) => {
  // Default to somewhere in SP if no location
  const centerLat = userLocation?.latitude || -23.5505;
  const centerLng = userLocation?.longitude || -46.6333;

  const [mapInstance, setMapInstance] = useState<L.Map | null>(null);
  const [mapStyle, setMapStyle] = useState<'standard' | 'satellite'>('standard');
  const [manualOrigin, setManualOrigin] = useState<Coordinates | null>(null);
  const [destination, setDestination] = useState<Coordinates | null>(null);
  const [routeCoords, setRouteCoords] = useState<[number, number][]>([]);
  const [routeParams, setRouteParams] = useState<{ distance: number; duration: number } | null>(null);
  const [isRouting, setIsRouting] = useState(false);
  const [selectionMode, setSelectionMode] = useState<'origin' | 'destination' | null>(null);
  const [calls, setCalls] = useState<TechnicalCall[]>(initialCalls || []);
  const [recenterTrigger, setRecenterTrigger] = useState(0);
  const [callToComplete, setCallToComplete] = useState<string | null>(null);

  const activeOrigin = manualOrigin || userLocation;

  // Initialize with some mock calls if none provided
  useEffect(() => {
    if (!initialCalls || initialCalls.length === 0) {
      setCalls([
        { id: '1', clientName: 'João Silva', address: 'Av. Paulista, 1000', status: 'PENDING', createdAt: new Date(Date.now() - 3600000), coords: { latitude: centerLat + 0.01, longitude: centerLng + 0.015 } },
        { id: '2', clientName: 'Maria Souza', address: 'Rua Augusta, 500', status: 'IN_PROGRESS', technicianName: 'Carlos Mecânico', createdAt: new Date(Date.now() - 7200000), coords: { latitude: centerLat - 0.015, longitude: centerLng + 0.005 } },
        { id: '3', clientName: 'Pedro Santos', address: 'Av. Brigadeiro Faria Lima, 2000', status: 'COMPLETED', technicianName: 'Roberto Silva', createdAt: new Date(Date.now() - 86400000), coords: { latitude: centerLat + 0.005, longitude: centerLng - 0.012 } },
      ]);
    } else {
      setCalls(initialCalls);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialCalls]);

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
    } else {
      // Create a new pending call where clicked
      setCalls(prev => [
        ...prev,
        { 
          id: Date.now().toString(), 
          clientName: 'Novo Cliente', 
          address: 'Endereço a definir', 
          status: 'PENDING', 
          createdAt: new Date(), 
          coords: { latitude: lat, longitude: lng } 
        }
      ]);
    }
  }, [selectionMode]);

  const handleCallRoute = (call: TechnicalCall) => {
    setDestination({ latitude: call.coords.latitude, longitude: call.coords.longitude });
  };

  const handleUpdateCallStatus = (id: string, newStatus: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED') => {
    setCalls(prev => prev.map(call => call.id === id ? { ...call, status: newStatus } : call));
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

  const handleRecenter = () => {
    setRecenterTrigger(prev => prev + 1);
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
      <div className={`w-full h-[400px] sm:h-[500px] rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 shadow-lg relative z-0 group ${mapStyle === 'standard' ? 'dark-tiles-container' : ''}`}>
        
        {/* CSS for dark mode standard tiles */}
        <style>{`
          .dark .dark-tiles-container .leaflet-tile-pane {
            filter: invert(100%) hue-rotate(180deg) brightness(95%) contrast(90%);
          }
        `}</style>
        
        {/* Coordinates Overlay */}
        {userLocation && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md px-4 py-2 rounded-full shadow-md border border-zinc-200/50 dark:border-zinc-700/50 flex items-center gap-3 text-xs font-medium text-zinc-700 dark:text-zinc-300 pointer-events-none">
            <span className="flex items-center gap-1"><MapPin size={14} className="text-indigo-500" /> {userLocation.latitude.toFixed(5)}, {userLocation.longitude.toFixed(5)}</span>
            {userLocation.accuracy && (
              <span className="flex items-center gap-1 border-l border-zinc-300 dark:border-zinc-600 pl-3">
                <Activity size={14} className={userLocation.accuracy < 20 ? "text-emerald-500" : "text-amber-500"} /> 
                ± {Math.round(userLocation.accuracy)}m
              </span>
            )}
          </div>
        )}

        {/* Map Style Toggle */}
        <button 
          onClick={() => setMapStyle(prev => prev === 'standard' ? 'satellite' : 'standard')}
          className="absolute top-4 right-4 z-[1000] bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 p-2.5 rounded-xl shadow-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors flex items-center justify-center"
          title="Alternar estilo do mapa"
        >
          <Layers size={20} />
        </button>

        <MapContainer 
          center={[centerLat, centerLng]} 
          zoom={15} 
          zoomControl={false}
          ref={setMapInstance}
          style={{ height: '100%', width: '100%', zIndex: 1, cursor: selectionMode ? 'crosshair' : 'crosshair' }}
        >
          {mapStyle === 'standard' ? (
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
          ) : (
            <TileLayer
              attribution='Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            />
          )}
          
          <MapClickHandler onMapClick={handleMapClick} />
          
          {/* Active Origin Marker */}
          {activeOrigin && (
            <>
              <Marker position={[activeOrigin.latitude, activeOrigin.longitude]} icon={userIcon}>
                <Popup>
                  <div className="text-center font-bold">Origem ({manualOrigin ? 'Manual' : 'Sua Localização'})</div>
                </Popup>
              </Marker>
              <RecenterAutomatically lat={centerLat} lng={centerLng} trigger={recenterTrigger} />
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

          {/* Technical Calls Markers */}
          {calls.map((call) => {
            let iconToUse = callPendingIcon;
            if (call.status === 'IN_PROGRESS') iconToUse = callInProgressIcon;
            if (call.status === 'COMPLETED') iconToUse = callCompletedIcon;

            return (
              <Marker key={call.id} position={[call.coords.latitude, call.coords.longitude]} icon={iconToUse}>
                <Popup>
                  <div className="font-sans min-w-[200px]">
                    <strong className="block text-sm text-zinc-900 border-b pb-1 mb-2">Chamado: {call.clientName}</strong>
                    
                    <div className="text-xs text-zinc-600 space-y-1.5 mb-3">
                      <p><strong className="text-zinc-800">Endereço:</strong> {call.address}</p>
                      <p>
                        <strong className="text-zinc-800">Status:</strong>{' '}
                        <span className={`font-semibold ${call.status === 'PENDING' ? 'text-rose-600' : call.status === 'IN_PROGRESS' ? 'text-amber-600' : 'text-emerald-600'}`}>
                          {call.status === 'PENDING' ? 'Pendente' : call.status === 'IN_PROGRESS' ? 'Em andamento' : 'Concluído'}
                        </span>
                      </p>
                      {call.technicianName && <p><strong className="text-zinc-800">Técnico:</strong> {call.technicianName}</p>}
                      <p><strong className="text-zinc-800">Abertura:</strong> {new Date(call.createdAt).toLocaleString()}</p>
                      {call.photoUrls && call.photoUrls.length > 0 && (
                        <p className="flex items-center gap-1 text-indigo-600"><ImageIcon size={12}/> {call.photoUrls.length} foto(s) anexada(s)</p>
                      )}
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <button 
                        onClick={() => handleCallRoute(call)}
                        className="w-full py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium rounded-md transition-colors flex items-center justify-center gap-1.5"
                      >
                        <Navigation size={14} /> Iniciar navegação
                      </button>
                      
                      {call.status !== 'COMPLETED' && (
                        <button 
                          onClick={() => setCallToComplete(call.id)}
                          className="w-full py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium rounded-md transition-colors flex items-center justify-center gap-1.5"
                        >
                          <CheckCircle size={14} /> Concluir chamado
                        </button>
                      )}
                      
                      <button 
                        onClick={() => { /* Edit functionality mock */ }}
                        className="w-full py-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-medium rounded-md transition-colors flex items-center justify-center gap-1.5 border border-zinc-200"
                      >
                        <Edit size={14} /> Editar
                      </button>
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}

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
        
        {/* Custom Zoom Controls */}
        {mapInstance && (
          <div className="absolute right-4 bottom-24 flex flex-col gap-2 z-[1000] pointer-events-auto">
            <button 
              onClick={() => mapInstance.zoomIn()}
              className="bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 p-2 rounded-xl shadow-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors"
              title="Mais zoom"
            >
              <Plus size={20} />
            </button>
            <button 
              onClick={() => mapInstance.zoomOut()}
              className="bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 p-2 rounded-xl shadow-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors"
              title="Menos zoom"
            >
              <Minus size={20} />
            </button>
          </div>
        )}

        {/* Recenter Button */}
        {userLocation && (
          <button 
            onClick={handleRecenter}
            className="absolute bottom-6 left-4 bg-white dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 p-3 rounded-full shadow-lg border border-zinc-200 dark:border-zinc-700 z-[1000] hover:scale-110 hover:bg-indigo-50 transition-all cursor-pointer focus:outline-none"
            title="Minha localização"
          >
            <LocateFixed size={22} />
          </button>
        )}

        {/* Legend Overlay */}
        <div className="absolute bottom-6 right-4 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-sm p-2 rounded-lg border border-zinc-200 dark:border-zinc-700 shadow-md text-[10px] sm:text-xs z-[1000] flex flex-col gap-1.5 pointer-events-none">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500 shadow-sm border border-white"></div>
            <span className="text-zinc-700 dark:text-zinc-300 font-medium">Você / Origem</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-violet-500 shadow-sm border border-white"></div>
            <span className="text-zinc-700 dark:text-zinc-300 font-medium">Destino</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-rose-500 shadow-sm border border-white"></div>
            <span className="text-zinc-700 dark:text-zinc-300 font-medium">Pendente</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-orange-500 shadow-sm border border-white"></div>
            <span className="text-zinc-700 dark:text-zinc-300 font-medium">Em Andamento</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-sm border border-white"></div>
            <span className="text-zinc-700 dark:text-zinc-300 font-medium">Concluído</span>
          </div>
        </div>
      </div>

      <ConfirmationModal
        isOpen={!!callToComplete}
        title="Concluir Chamado"
        message="Tem certeza que deseja marcar este chamado como concluído? Esta ação não pode ser desfeita."
        confirmText="Sim, concluir"
        onConfirm={() => {
          if (callToComplete) {
            handleUpdateCallStatus(callToComplete, 'COMPLETED');
            setCallToComplete(null);
          }
        }}
        onCancel={() => setCallToComplete(null)}
      />
    </div>
  );
};
