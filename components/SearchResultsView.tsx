import React, { useState } from 'react';
import { ArrowLeft, Phone, Navigation, MessageCircle, MapPin, Star, ShieldCheck, X } from 'lucide-react';
import { SearchResult, Coordinates } from '../types';

interface SearchResultsViewProps {
  result: SearchResult;
  userLocation: Coordinates | null;
  onBack: () => void;
  onContact: (name: string) => void;
}

export const SearchResultsView: React.FC<SearchResultsViewProps> = ({ result, userLocation, onBack, onContact }) => {
  const mapChunks = result.groundingChunks?.filter(c => c.maps) || [];
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [isSheetOpen, setIsSheetOpen] = useState(true);

  if (mapChunks.length === 0) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-950 p-6">
        <button 
          onClick={onBack}
          className="absolute top-4 left-4 p-2 bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 shadow-md rounded-full hover:bg-zinc-100 transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
        <div className="text-center space-y-4">
          <MapPin size={48} className="mx-auto text-zinc-400" />
          <h2 className="text-xl font-bold text-zinc-800 dark:text-zinc-100">Nenhum local encontrado</h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            A busca não retornou locais específicos no mapa. Verifique as sugestões em texto.
          </p>
          <button onClick={onBack} className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-full font-semibold">
            Voltar
          </button>
        </div>
      </div>
    );
  }

  const selectedChunk = mapChunks[selectedIndex];
  const title = selectedChunk?.maps?.title || 'Localização';
  const snippet = selectedChunk?.maps?.placeAnswerSources?.reviewSnippets?.[0]?.snippet;

  const originParam = (userLocation?.latitude && userLocation?.longitude) 
    ? `${userLocation.latitude},${userLocation.longitude}` 
    : 'Minha+Localizacao';
  
  // Use directions mode to show route from user to destination
  const mapUrl = `https://maps.google.com/maps?saddr=${originParam}&daddr=${encodeURIComponent(title)}&dirflg=d&output=embed`;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-zinc-100 dark:bg-zinc-950 animate-fade-in">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 p-4 z-10 flex items-center justify-between bg-gradient-to-b from-black/60 to-transparent pb-8 pt-[env(safe-area-inset-top,1rem)]">
        <button 
          onClick={onBack}
          className="p-2.5 bg-white/20 backdrop-blur-md text-white rounded-full hover:bg-white/30 transition-colors shadow-sm"
        >
          <ArrowLeft size={22} />
        </button>
        
        <div className="bg-white/90 dark:bg-black/60 backdrop-blur-md px-4 py-2 rounded-full shadow-lg">
          <span className="text-zinc-800 dark:text-white font-bold text-sm">
            {mapChunks.length} resultados
          </span>
        </div>
      </div>

      {/* Map Background */}
      <div className="flex-1 w-full relative">
        <iframe
          title="Mapa"
          width="100%"
          height="100%"
          frameBorder="0"
          src={mapUrl}
          allowFullScreen
          className="absolute inset-0"
        />
      </div>

      {/* Bottom Sheet */}
      <div 
        className={`absolute bottom-0 left-0 right-0 bg-white dark:bg-zinc-900 rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.15)] transition-transform duration-300 ease-in-out z-20 pb-[env(safe-area-inset-bottom,1rem)] ${isSheetOpen ? 'translate-y-0' : 'translate-y-[calc(100%-80px)]'}`}
      >
        <div className="p-5 flex flex-col gap-4">
          {/* Handle for drag / toggle */}
          <div 
            className="w-12 h-1.5 bg-zinc-300 dark:bg-zinc-700 rounded-full mx-auto cursor-pointer mb-2"
            onClick={() => setIsSheetOpen(!isSheetOpen)}
          />

          {/* List of tabs or quick selection */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none -mx-2 px-2">
            {mapChunks.map((chunk, idx) => (
              <button
                key={idx}
                onClick={() => { setSelectedIndex(idx); setIsSheetOpen(true); }}
                className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                  selectedIndex === idx 
                    ? 'bg-indigo-600 text-white shadow-md' 
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700'
                }`}
              >
                {chunk.maps?.title.substring(0, 20)}{chunk.maps?.title && chunk.maps.title.length > 20 ? '...' : ''}
              </button>
            ))}
          </div>

          {/* Details */}
          {selectedChunk && (
            <div className={`flex flex-col gap-4 transition-opacity duration-300 ${isSheetOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
              <div>
                <div className="flex justify-between items-start">
                  <h2 className="text-xl font-bold text-zinc-900 dark:text-white leading-tight pr-4">{title}</h2>
                </div>
                
                <div className="flex items-center gap-3 mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                  <div className="flex items-center gap-1 text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-1 rounded text-xs font-bold border border-emerald-200 dark:border-emerald-800">
                    <ShieldCheck size={14} />
                    Credenciado
                  </div>
                  <div className="flex items-center gap-1 text-amber-500 font-bold bg-amber-50 dark:bg-amber-900/30 px-2 py-1 rounded border border-amber-200 dark:border-amber-800">
                    <Star size={14} className="fill-amber-500" />
                    4.8 (120+)
                  </div>
                </div>
              </div>

              {snippet && (
                <div className="bg-zinc-50 dark:bg-zinc-800/50 p-3 rounded-xl border border-zinc-100 dark:border-zinc-700">
                  <p className="text-sm text-zinc-600 dark:text-zinc-300 italic line-clamp-3">"{snippet}"</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="grid grid-cols-3 gap-3 mt-2">
                <button 
                  onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(title)}`, '_blank')}
                  className="flex flex-col items-center justify-center gap-2 bg-indigo-600 text-white py-3 sm:py-4 rounded-2xl hover:bg-indigo-700 transition-colors shadow-sm"
                >
                  <Navigation size={24} />
                  <span className="text-[11px] sm:text-xs font-bold">Rotas</span>
                </button>
                <button 
                  onClick={() => console.log('Simulação: Ligando para o estabelecimento...')}
                  className="flex flex-col items-center justify-center gap-2 bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 py-3 sm:py-4 rounded-2xl hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors border border-zinc-200 dark:border-zinc-700 shadow-sm"
                >
                  <Phone size={24} />
                  <span className="text-[11px] sm:text-xs font-bold">Ligar</span>
                </button>
                <button 
                  onClick={() => onContact(title)}
                  className="flex flex-col items-center justify-center gap-2 bg-[#25D366] text-white py-3 sm:py-4 rounded-2xl hover:bg-[#20bd5a] transition-colors shadow-sm"
                >
                  <MessageCircle size={24} />
                  <span className="text-[11px] sm:text-xs font-bold">WhatsApp</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
