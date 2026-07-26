import React from 'react';
import { X } from 'lucide-react';

interface MapComponentProps {
  latitude: number;
  longitude: number;
  title?: string;
  onClose?: () => void;
}

export const MapComponent: React.FC<MapComponentProps> = ({ latitude, longitude, title, onClose }) => {
  const mapUrl = `https://maps.google.com/maps?q=${latitude},${longitude}&z=15&output=embed`;

  return (
    <div className="flex flex-col h-full w-full bg-white dark:bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-700 shadow-2xl">
      <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center bg-zinc-50 dark:bg-zinc-900/50">
        <h3 className="font-bold text-zinc-800 dark:text-zinc-100 flex items-center gap-2">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
          {title || 'Localização no Mapa'}
        </h3>
        {onClose && (
          <button 
            onClick={onClose}
            className="p-2 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-full transition-colors text-zinc-500"
          >
            <X size={20} />
          </button>
        )}
      </div>
      <div className="flex-1 relative min-h-[300px]">
        <iframe
          title="Google Maps"
          width="100%"
          height="100%"
          frameBorder="0"
          style={{ border: 0 }}
          src={mapUrl}
          allowFullScreen
          className="absolute inset-0"
        ></iframe>
      </div>
      <div className="p-3 bg-zinc-50 dark:bg-zinc-900/50 border-t border-zinc-100 dark:border-zinc-800 text-center">
        <a 
          href={`https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
        >
          Abrir Rota no Google Maps Externo
        </a>
      </div>
    </div>
  );
};
