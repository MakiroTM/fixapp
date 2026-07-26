import React, { useState } from 'react';
import { X, Navigation, Car, Bike, Footprints, MapPin, Compass, ShieldCheck } from 'lucide-react';

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
  const [travelMode, setTravelMode] = useState<'d' | 'w' | 'r'>('d');

  if (!isOpen) return null;

  // Build origin parameter
  const originParam = (userLat && userLng) 
    ? `${userLat},${userLng}` 
    : 'Minha+Localizacao';

  // Build destination parameter
  const destinationParam = (destinationLat && destinationLng)
    ? `${destinationLat},${destinationLng}`
    : encodeURIComponent(destinationAddress || destinationTitle);

  // Embedded Google Maps Directions URL
  const embedRouteUrl = `https://maps.google.com/maps?saddr=${originParam}&daddr=${destinationParam}&dirflg=${travelMode}&output=embed`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/65 backdrop-blur-sm animate-fade-in">
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
                  Rota Integrada Google Maps
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
              onClick={() => setTravelMode('d')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                travelMode === 'd'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-zinc-200/70 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-300 dark:hover:bg-zinc-700'
              }`}
            >
              <Car size={14} /> Carro / Moto
            </button>
            <button
              type="button"
              onClick={() => setTravelMode('w')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                travelMode === 'w'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-zinc-200/70 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-300 dark:hover:bg-zinc-700'
              }`}
            >
              <Footprints size={14} /> A Pé
            </button>
            <button
              type="button"
              onClick={() => setTravelMode('r')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                travelMode === 'r'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-zinc-200/70 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-300 dark:hover:bg-zinc-700'
              }`}
            >
              <Bike size={14} /> Transporte
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-3 py-1 rounded-xl">
            <Compass size={14} className="text-indigo-500" />
            <span>Navegação sem sair do app</span>
          </div>
        </div>

        {/* Embedded Google Maps Container */}
        <div className="flex-1 relative w-full h-full bg-zinc-100 dark:bg-zinc-950">
          <iframe
            title={`Rota para ${destinationTitle}`}
            width="100%"
            height="100%"
            frameBorder="0"
            style={{ border: 0 }}
            src={embedRouteUrl}
            allowFullScreen
            className="absolute inset-0 w-full h-full"
          />
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
