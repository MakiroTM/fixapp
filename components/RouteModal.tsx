import React, { useState, useEffect, useRef } from 'react';
import { X, Navigation, Car, Bike, Footprints, MapPin, Compass, ShieldCheck, ExternalLink } from 'lucide-react';
import L from 'leaflet';

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
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layersRef = useRef<L.Layer[]>([]);

  // Fallback destination lat/lng if not provided directly
  const destLat = destinationLat || -23.5505;
  const destLng = destinationLng || -46.6333;

  // Fallback user lat/lng if not provided
  const origLat = userLat || destLat - 0.02;
  const origLng = userLng || destLng - 0.02;

  // Initialize Map Once
  useEffect(() => {
    if (!isOpen || !mapContainerRef.current || mapInstanceRef.current) return;

    const midpointLat = (origLat + destLat) / 2;
    const midpointLng = (origLng + destLng) / 2;

    const map = L.map(mapContainerRef.current, {
      center: [midpointLat, midpointLng],
      zoom: 13,
      zoomControl: true,
    });

    mapInstanceRef.current = map;

    // OpenStreetMap Tile Layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    setTimeout(() => {
      map.invalidateSize();
    }, 200);

  }, [isOpen]);

  // Clean up on unmount or close
  useEffect(() => {
    if (!isOpen && mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }
    return () => {
      if (!isOpen && mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [isOpen]);

  // Update Markers and Polyline
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !isOpen) return;

    // Clear old layers
    layersRef.current.forEach(layer => layer.remove());
    layersRef.current = [];

    // Custom Icon for Destination
    const destIcon = L.divIcon({
      className: 'custom-leaflet-dest-marker',
      html: `
        <div style="background-color: #ef4444; width: 34px; height: 34px; border-radius: 50%; border: 3px solid #ffffff; box-shadow: 0 4px 12px rgba(239, 68, 68, 0.5); display: flex; align-items: center; justify-content: center; color: white;">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
        </div>
      `,
      iconSize: [34, 34],
      iconAnchor: [17, 34],
      popupAnchor: [0, -34]
    });

    // Custom Icon for User Origin
    const userIcon = L.divIcon({
      className: 'custom-leaflet-user-route-marker',
      html: `
        <div style="background-color: #3b82f6; width: 34px; height: 34px; border-radius: 50%; border: 3px solid #ffffff; box-shadow: 0 4px 12px rgba(59, 130, 246, 0.5); display: flex; align-items: center; justify-content: center; color: white;">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg>
        </div>
      `,
      iconSize: [34, 34],
      iconAnchor: [17, 34],
      popupAnchor: [0, -34]
    });

    // Add Markers
    const dMarker = L.marker([destLat, destLng], { icon: destIcon }).addTo(map);
    dMarker.bindPopup(`<strong>Destino: ${destinationTitle}</strong>`).openPopup();
    layersRef.current.push(dMarker);

    const uMarker = L.marker([origLat, origLng], { icon: userIcon }).addTo(map);
    uMarker.bindPopup('<strong>Origem: Ponto de Partida</strong>');
    layersRef.current.push(uMarker);

    // Draw Polyline Route
    const polylineColor = travelMode === 'car' ? '#4f46e5' : travelMode === 'foot' ? '#10b981' : '#f59e0b';
    const polyline = L.polyline([
      [origLat, origLng],
      [destLat, destLng]
    ], {
      color: polylineColor,
      weight: 6,
      opacity: 0.85,
      dashArray: travelMode === 'foot' ? '6, 8' : '10, 8'
    }).addTo(map);
    layersRef.current.push(polyline);

    // Fit Bounds
    map.fitBounds(polyline.getBounds(), { padding: [50, 50] });

  }, [isOpen, origLat, origLng, destLat, destLng, destinationTitle, travelMode]);

  if (!isOpen) return null;

  const osmExternalUrl = `https://www.openstreetmap.org/directions?engine=osrm_${travelMode === 'foot' ? 'foot' : travelMode === 'bike' ? 'bicycle' : 'car'}&route=${origLat}%2C${origLng}%3B${destLat}%2C${destLng}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/65 backdrop-blur-sm animate-fade-in">
      <div className="bg-zinc-950 dark:bg-zinc-900 w-full max-w-3xl h-[85vh] sm:h-[80vh] rounded-3xl shadow-2xl border border-zinc-800 dark:border-zinc-800 flex flex-col overflow-hidden animate-pop-in relative">
        
        {/* Header */}
        <div className="p-4 sm:p-5 bg-zinc-900 text-white flex items-center justify-between border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-600/30 text-indigo-400 rounded-2xl border border-indigo-500/30">
              <Navigation size={20} className="animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">
                  Rota OpenStreetMap Integrada
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
        <div className="p-3 bg-zinc-900 dark:bg-zinc-850 border-b border-zinc-800 dark:border-zinc-800 flex items-center justify-between gap-2 overflow-x-auto">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setTravelMode('car')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                travelMode === 'car'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-zinc-200/70 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-400 hover:bg-zinc-300 dark:hover:bg-zinc-700'
              }`}
            >
              <Car size={14} /> Carro / Moto
            </button>
            <button
              type="button"
              onClick={() => setTravelMode('foot')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                travelMode === 'foot'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-zinc-200/70 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-400 hover:bg-zinc-300 dark:hover:bg-zinc-700'
              }`}
            >
              <Footprints size={14} /> A Pé
            </button>
            <button
              type="button"
              onClick={() => setTravelMode('bike')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                travelMode === 'bike'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-zinc-200/70 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-400 hover:bg-zinc-300 dark:hover:bg-zinc-700'
              }`}
            >
              <Bike size={14} /> Bicicleta
            </button>
          </div>

          <a
            href={osmExternalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex items-center gap-1.5 text-xs text-blue-400 dark:text-indigo-400 hover:underline font-semibold bg-blue-900/20 dark:bg-indigo-950/60 px-3 py-1 rounded-xl border border-blue-800 dark:border-indigo-800/50"
          >
            <ExternalLink size={13} />
            <span>Abrir no OpenStreetMap</span>
          </a>
        </div>

        {/* Leaflet OpenStreetMap Container */}
        <div className="flex-1 relative w-full h-full bg-zinc-800 dark:bg-zinc-950 z-0">
          <div ref={mapContainerRef} className="absolute inset-0 w-full h-full z-0" />
        </div>

        {/* Footer info bar */}
        <div className="p-3 bg-zinc-900 dark:bg-zinc-900 border-t border-zinc-800 dark:border-zinc-800 flex items-center justify-between text-xs text-zinc-400 dark:text-zinc-400">
          <div className="flex items-center gap-2">
            <MapPin size={14} className="text-rose-500" />
            <span className="font-semibold text-zinc-200 dark:text-zinc-200 truncate max-w-xs sm:max-w-md">
              Destino: {destinationTitle}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-zinc-200 dark:text-zinc-200 font-bold rounded-xl text-xs transition-colors cursor-pointer"
          >
            Voltar ao App
          </button>
        </div>

      </div>
    </div>
  );
};
