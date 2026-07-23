import React, { useState } from 'react';
import { X, Navigation, MapPin } from 'lucide-react';

interface MapComponentProps {
  latitude: number;
  longitude: number;
  title?: string;
  onClose?: () => void;
  userLatitude?: number;
  userLongitude?: number;
}

export const MapComponent: React.FC<MapComponentProps> = ({ 
  latitude, 
  longitude, 
  title, 
  onClose,
  userLatitude,
  userLongitude
}) => {
  const [viewMode, setViewMode] = useState<'PIN' | 'ROUTE'>('PIN');

  // Single location pin URL
  const pinMapUrl = `https://maps.google.com/maps?q=${latitude},${longitude}&z=15&output=embed`;

  // Embedded directions route URL
  const originParam = (userLatitude && userLongitude) ? `${userLatitude},${userLongitude}` : 'Minha+Localizacao';
  const routeMapUrl = `https://maps.google.com/maps?saddr=${originParam}&daddr=${latitude},${longitude}&dirflg=d&output=embed`;

  const activeMapUrl = viewMode === 'ROUTE' ? routeMapUrl : pinMapUrl;

  return (
    <div className="flex flex-col h-full w-full bg-white dark:bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-700 shadow-2xl">
      <div className="p-3.5 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center bg-zinc-50 dark:bg-zinc-900/50">
        <h3 className="font-bold text-zinc-800 dark:text-zinc-100 text-sm sm:text-base flex items-center gap-2">
          <div className="w-2.5 h-2.5 bg-rose-500 rounded-full animate-pulse"></div>
          {title || 'Localização no Mapa'}
        </h3>
        {onClose && (
          <button 
            type="button"
            onClick={onClose}
            className="p-1.5 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-full transition-colors text-zinc-500 cursor-pointer"
            title="Fechar"
          >
            <X size={18} />
          </button>
        )}
      </div>

      <div className="flex-1 relative min-h-[320px]">
        <iframe
          title="Google Maps"
          width="100%"
          height="100%"
          frameBorder="0"
          style={{ border: 0 }}
          src={activeMapUrl}
          allowFullScreen
          className="absolute inset-0 w-full h-full"
        ></iframe>
      </div>

      <div className="p-3 bg-zinc-50 dark:bg-zinc-900/90 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setViewMode('PIN')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
              viewMode === 'PIN' 
                ? 'bg-indigo-600 text-white shadow-sm' 
                : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
            }`}
          >
            <MapPin size={13} />
            Localização
          </button>
          <button
            type="button"
            onClick={() => setViewMode('ROUTE')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
              viewMode === 'ROUTE' 
                ? 'bg-indigo-600 text-white shadow-sm' 
                : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
            }`}
          >
            <Navigation size={13} />
            Rota no App
          </button>
        </div>

        <span className="text-[11px] text-zinc-400 font-medium hidden sm:inline">
          Google Maps Integrado
        </span>
      </div>
    </div>
  );
};
