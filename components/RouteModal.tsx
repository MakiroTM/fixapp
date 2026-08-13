import React, { useState, useEffect, useRef } from 'react';
import { X, Navigation, Car, Bike, Footprints, MapPin, Compass, ShieldCheck, ExternalLink } from 'lucide-react';
import { Loader } from '@googlemaps/js-api-loader';

interface RouteModalProps {
  isOpen: boolean;
  onClose: () => void;
  destinationTitle: string;
  destinationLat?: number;
  destinationLng?: number;
  destinationAddress?: string;
  userLat?: number;
  userLng?: number;
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
      libraries: ['places', 'geometry', 'marker', 'routes']
    });
  }
  return globalLoader;
}

export const RouteModal: React.FC<RouteModalProps> = ({
  isOpen,
  onClose,
  destinationTitle,
  destinationLat,
  destinationLng,
  destinationAddress,
  userLat,
  userLng
}) => {
  const [travelMode, setTravelMode] = useState<'car' | 'foot' | 'bike'>('car');
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const polylineRef = useRef<google.maps.Polyline | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  const destLat = destinationLat || -23.5505;
  const destLng = destinationLng || -46.6333;
  const origLat = userLat || destLat - 0.02;
  const origLng = userLng || destLng - 0.02;

  // Initialize Map
  useEffect(() => {
    if (!isOpen || !mapContainerRef.current) return;
    let isMounted = true;

    const loader = getMapsLoader(GOOGLE_MAPS_KEY);

    (loader as any).load().then(() => {
      if (!isMounted || !mapContainerRef.current) return;

      if (!mapInstanceRef.current) {
        const midpointLat = (origLat + destLat) / 2;
        const midpointLng = (origLng + destLng) / 2;

        const map = new google.maps.Map(mapContainerRef.current, {
          center: { lat: midpointLat, lng: midpointLng },
          zoom: 13,
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
      console.error("Error loading Google Maps in RouteModal:", err);
    });

    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  // Clean up on close
  useEffect(() => {
    if (!isOpen && mapInstanceRef.current) {
      mapInstanceRef.current = null;
      setMapLoaded(false);
    }
  }, [isOpen]);

  // Update Markers & Polyline Route
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !isOpen || !mapLoaded) return;

    // Clear old markers & polyline
    markersRef.current.forEach(m => m.setMap(null));
    markersRef.current = [];
    if (polylineRef.current) {
      polylineRef.current.setMap(null);
      polylineRef.current = null;
    }

    // Destination Marker
    const dMarker = new google.maps.Marker({
      position: { lat: destLat, lng: destLng },
      map,
      title: `Destino: ${destinationTitle}`,
      icon: {
        path: google.maps.SymbolPath.BACKWARD_CLOSED_ARROW,
        scale: 7,
        fillColor: '#ef4444',
        fillOpacity: 1,
        strokeColor: '#ffffff',
        strokeWeight: 2,
      }
    });

    const dInfoWindow = new google.maps.InfoWindow({
      content: `<div style="font-weight:bold;font-family:sans-serif;padding:2px;font-size:12px;">Destino: ${destinationTitle}</div>`
    });
    dMarker.addListener('click', () => dInfoWindow.open(map, dMarker));
    dInfoWindow.open(map, dMarker);
    markersRef.current.push(dMarker);

    // User Origin Marker
    const uMarker = new google.maps.Marker({
      position: { lat: origLat, lng: origLng },
      map,
      title: 'Origem: Ponto de Partida',
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 8,
        fillColor: '#3b82f6',
        fillOpacity: 1,
        strokeColor: '#ffffff',
        strokeWeight: 2,
      }
    });
    markersRef.current.push(uMarker);

    // Polyline
    const polylineColor = travelMode === 'car' ? '#4f46e5' : travelMode === 'foot' ? '#10b981' : '#f59e0b';
    const polyline = new google.maps.Polyline({
      path: [
        { lat: origLat, lng: origLng },
        { lat: destLat, lng: destLng }
      ],
      geodesic: true,
      strokeColor: polylineColor,
      strokeOpacity: 0.85,
      strokeWeight: 6
    });
    polyline.setMap(map);
    polylineRef.current = polyline;

    const bounds = new google.maps.LatLngBounds();
    bounds.extend({ lat: origLat, lng: origLng });
    bounds.extend({ lat: destLat, lng: destLng });
    map.fitBounds(bounds, 50);

  }, [isOpen, origLat, origLng, destLat, destLng, destinationTitle, travelMode, mapLoaded]);

  if (!isOpen) return null;

  const gmapsExternalUrl = `https://www.google.com/maps/dir/?api=1&origin=${origLat},${origLng}&destination=${destLat},${destLng}&travelmode=${travelMode === 'foot' ? 'walking' : travelMode === 'bike' ? 'bicycling' : 'driving'}`;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-black/65 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-zinc-900 w-full max-w-3xl h-[85vh] sm:h-[80vh] rounded-3xl shadow-2xl border border-zinc-200 dark:border-zinc-800 flex flex-col overflow-hidden animate-pop-in relative">
        
        {/* Header */}
        <div className="p-4 sm:p-5 bg-zinc-900 text-white flex items-center justify-between border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-600/30 text-indigo-400 rounded-2xl border border-indigo-500/30">
              <Navigation size={20} className="animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">
                  Rota Google Maps Integrada
                </span>
                <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-[10px] font-semibold rounded-full border border-emerald-500/30 flex items-center gap-1">
                  <ShieldCheck size={10} /> No aplicativo FIX
                </span>
              </div>
              <h3 className="font-extrabold text-base sm:text-lg text-white truncate max-w-xs sm:max-w-md">
                {destinationTitle}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-full transition-colors cursor-pointer"
            title="Fechar"
          >
            <X size={20} />
          </button>
        </div>

        {/* Travel Mode Selector Controls */}
        <div className="p-3 bg-zinc-50 dark:bg-zinc-850 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between gap-2 overflow-x-auto">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setTravelMode('car')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                travelMode === 'car'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-zinc-200/70 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-300 dark:hover:bg-zinc-700'
              }`}
            >
              <Car size={14} /> Carro / Moto
            </button>
            <button
              type="button"
              onClick={() => setTravelMode('foot')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                travelMode === 'foot'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-zinc-200/70 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-300 dark:hover:bg-zinc-700'
              }`}
            >
              <Footprints size={14} /> A Pé
            </button>
            <button
              type="button"
              onClick={() => setTravelMode('bike')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                travelMode === 'bike'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-zinc-200/70 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-300 dark:hover:bg-zinc-700'
              }`}
            >
              <Bike size={14} /> Bicicleta
            </button>
          </div>

          <a
            href={gmapsExternalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex items-center gap-1.5 text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-semibold bg-indigo-50 dark:bg-indigo-950/60 px-3 py-1 rounded-xl border border-indigo-200 dark:border-indigo-800/50"
          >
            <ExternalLink size={13} />
            <span>Abrir no Google Maps</span>
          </a>
        </div>

        {/* Google Maps Container */}
        <div className="flex-1 relative w-full h-full bg-zinc-100 dark:bg-zinc-950 z-0">
          <div ref={mapContainerRef} className="absolute inset-0 w-full h-full z-0" />
        </div>

        {/* Footer info bar */}
        <div className="p-3 bg-zinc-50 dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-xs text-zinc-600 dark:text-zinc-400">
          <div className="flex items-center gap-2">
            <MapPin size={14} className="text-rose-500" />
            <span className="font-semibold text-zinc-800 dark:text-zinc-200 truncate max-w-xs sm:max-w-md">
              Destino: {destinationTitle}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 font-bold rounded-xl text-xs transition-colors cursor-pointer"
          >
            Voltar ao App
          </button>
        </div>

      </div>
    </div>
  );
};
