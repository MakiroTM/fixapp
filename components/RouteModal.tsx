import React, { useState, useEffect, useRef } from 'react';
import { X, Navigation, Car, Bike, Footprints, MapPin, ShieldCheck, ExternalLink } from 'lucide-react';
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
  const markersGroupRef = useRef<L.LayerGroup | null>(null);

  const destLat = destinationLat || -23.5505;
  const destLng = destinationLng || -46.6333;
  const origLat = userLat || destLat - 0.02;
  const origLng = userLng || destLng - 0.02;

  // Initialize Map
  useEffect(() => {
    if (!isOpen || !mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [(origLat + destLat) / 2, (origLng + destLng) / 2],
        zoom: 13,
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
  }, [isOpen]);

  // Update Markers & Polyline Route
  useEffect(() => {
    const map = mapInstanceRef.current;
    const group = markersGroupRef.current;
    if (!map || !isOpen || !group) return;

    group.clearLayers();

    // Destination Marker
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

    const dMarker = L.marker([destLat, destLng], { icon: destIcon });
    dMarker.bindPopup(`<strong style="font-family:sans-serif;font-size:12px;">Destino: ${destinationTitle}</strong>`).openPopup();
    group.addLayer(dMarker);

    // User Origin Marker
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

    const uMarker = L.marker([origLat, origLng], { icon: userIcon });
    uMarker.bindPopup('<strong style="font-family:sans-serif;font-size:12px;">Origem: Você está aqui</strong>');
    group.addLayer(uMarker);

    // Polyline
    const polylineColor = travelMode === 'car' ? '#4f46e5' : travelMode === 'foot' ? '#10b981' : '#f59e0b';
    const polyline = L.polyline([
      [origLat, origLng],
      [destLat, destLng]
    ], {
      color: polylineColor,
      weight: 5,
      opacity: 0.85,
      dashArray: travelMode === 'foot' ? '5, 10' : undefined
    });
    group.addLayer(polyline);

    const bounds = L.latLngBounds([
      [origLat, origLng],
      [destLat, destLng]
    ]);
    map.fitBounds(bounds, { padding: [50, 50] });

  }, [isOpen, origLat, origLng, destLat, destLng, destinationTitle, travelMode]);

  if (!isOpen) return null;

  const externalMapUrl = `https://www.google.com/maps/dir/?api=1&origin=${origLat},${origLng}&destination=${destLat},${destLng}&travelmode=${travelMode === 'foot' ? 'walking' : travelMode === 'bike' ? 'bicycling' : 'driving'}`;

  return (
    <div className="fixed inset-0 z-[100] z-app-modal flex items-center justify-center p-3 sm:p-4 bg-black/65 backdrop-blur-sm animate-fade-in">
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
                  Rota Interativa de Atendimento
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
            href={externalMapUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex items-center gap-1.5 text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-semibold bg-indigo-50 dark:bg-indigo-950/60 px-3 py-1 rounded-xl border border-indigo-200 dark:border-indigo-800/50"
          >
            <ExternalLink size={13} />
            <span>Navegação Externa</span>
          </a>
        </div>

        {/* Map Container */}
        <div className="flex-1 relative w-full h-full bg-zinc-100 dark:bg-zinc-950 fix-map-container isolate z-0 overflow-hidden">
          <div ref={mapContainerRef} className="absolute inset-0 w-full h-full z-0 overflow-hidden" />
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
