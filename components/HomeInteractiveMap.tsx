import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import { Coordinates, GroundingChunk } from '../types';
import { 
  MapPin, Star, Navigation, Phone, MessageCircle, Heart, 
  Clock, ShieldCheck, ChevronUp, ChevronDown, Wrench, X, Share2, Copy, Check
} from 'lucide-react';
import { RouteModal } from './RouteModal';

interface HomeInteractiveMapProps {
  userLocation: Coordinates | null;
  groundingChunks: GroundingChunk[];
  activeCategory: string;
  activeVehicle: string;
  selectedWorkshop: GroundingChunk | null;
  onSelectWorkshop: (chunk: GroundingChunk | null) => void;
  onContact: (name: string) => void;
  onOpenRoute?: (title: string, lat?: number, lng?: number) => void;
}

const DEFAULT_WORKSHOP_IMAGES = [
  'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=800&q=80',
];

export const HomeInteractiveMap: React.FC<HomeInteractiveMapProps> = ({
  userLocation,
  groundingChunks,
  activeCategory,
  activeVehicle,
  selectedWorkshop,
  onSelectWorkshop,
  onContact,
  onOpenRoute
}) => {
  const [sheetState, setSheetState] = useState<'minimized' | 'expanded'>('minimized');
  const [isRouteModalOpen, setIsRouteModalOpen] = useState(false);
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);

  // Dragging interaction state
  const dragStartYRef = useRef<number | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersGroupRef = useRef<L.LayerGroup | null>(null);

  // Load favorites from localStorage
  useEffect(() => {
    try {
      const savedFavs = JSON.parse(localStorage.getItem('favoriteWorkshops') || '[]');
      setFavorites(savedFavs);
    } catch (e) {
      console.error('Failed to parse favorites:', e);
    }
  }, []);

  const title = selectedWorkshop?.maps?.title || '';
  const isFavorite = favorites.includes(title);

  const toggleFavorite = (workshopTitle: string) => {
    if (!workshopTitle) return;
    let updated: string[];
    if (favorites.includes(workshopTitle)) {
      updated = favorites.filter(t => t !== workshopTitle);
    } else {
      updated = [...favorites, workshopTitle];
    }
    setFavorites(updated);
    localStorage.setItem('favoriteWorkshops', JSON.stringify(updated));
  };

  const centerLat = userLocation?.latitude || -23.5505;
  const centerLng = userLocation?.longitude || -46.6333;

  // Filter chunks based on category and vehicle
  const filteredChunks = groundingChunks.filter((chunk) => {
    const chunkTitle = (chunk.maps?.title || '').toLowerCase();
    const snippet = (chunk.maps?.placeAnswerSources?.reviewSnippets?.[0]?.snippet || '').toLowerCase();
    const text = `${chunkTitle} ${snippet}`;

    if (activeCategory === 'GUINCHO' && !(text.includes('guincho') || text.includes('socorro') || text.includes('reboque'))) return false;
    if (activeCategory === 'PNEU' && !(text.includes('pneu') || text.includes('borracharia'))) return false;
    if (activeCategory === 'ELETRICA' && !(text.includes('elétric') || text.includes('bateria'))) return false;
    if (activeCategory === 'MECANICA' && !(text.includes('mecânic') || text.includes('oficina') || text.includes('auto'))) return false;

    return true;
  });

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [centerLat, centerLng],
        zoom: 14,
        zoomControl: false,
        attributionControl: false,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
      }).addTo(map);

      markersGroupRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;

      setTimeout(() => {
        map.invalidateSize();
      }, 250);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Window resize & sheet resize recalculation
  useEffect(() => {
    const handleResize = () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    // Invalidate map size when bottom sheet expands or minimizes
    const timer = setTimeout(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    }, 320);
    return () => clearTimeout(timer);
  }, [sheetState]);

  // Center once user GPS is acquired
  const hasCenteredRef = useRef(false);
  useEffect(() => {
    if (userLocation && mapInstanceRef.current && !hasCenteredRef.current) {
      mapInstanceRef.current.setView([userLocation.latitude, userLocation.longitude], 14);
      hasCenteredRef.current = true;
    }
  }, [userLocation]);

  // Update Markers on Map
  useEffect(() => {
    const map = mapInstanceRef.current;
    const group = markersGroupRef.current;
    if (!map || !group) return;

    group.clearLayers();

    const baseLat = userLocation?.latitude || -23.5505;
    const baseLng = userLocation?.longitude || -46.6333;

    // User Marker
    if (userLocation) {
      const userIcon = L.divIcon({
        className: 'custom-user-pin',
        html: `<div class="relative flex items-center justify-center w-9 h-9">
          <div class="absolute inset-0 bg-indigo-500/40 rounded-full animate-ping"></div>
          <div class="w-7 h-7 bg-indigo-600 border-2 border-white rounded-full shadow-xl flex items-center justify-center text-white">
            <div class="w-2.5 h-2.5 bg-white rounded-full"></div>
          </div>
        </div>`,
        iconSize: [36, 36],
        iconAnchor: [18, 18],
      });

      const userMarker = L.marker([userLocation.latitude, userLocation.longitude], { icon: userIcon });
      userMarker.bindPopup('<strong style="font-family:sans-serif;font-size:12px;">Sua Localização GPS</strong>');
      group.addLayer(userMarker);
    }

    // Workshop Pins
    const chunksToRender = filteredChunks.length > 0 ? filteredChunks : groundingChunks;

    chunksToRender.forEach((chunk, index) => {
      const radius = 0.012;
      const angle = (index / Math.max(chunksToRender.length, 1)) * Math.PI * 2;
      const lat = baseLat + Math.cos(angle) * radius * 0.85;
      const lng = baseLng + Math.sin(angle) * radius * 0.85;

      const isSelected = selectedWorkshop?.maps?.title === chunk.maps?.title;

      const shopIcon = L.divIcon({
        className: 'custom-shop-pin',
        html: `<div class="relative flex items-center justify-center transition-all ${
          isSelected ? 'scale-125 z-50' : 'hover:scale-110'
        } cursor-pointer">
          ${isSelected ? '<div class="absolute -inset-2 bg-indigo-500/30 rounded-full animate-ping"></div>' : ''}
          <div class="${
            isSelected 
              ? 'bg-indigo-600 ring-4 ring-indigo-400 dark:ring-indigo-900 shadow-2xl' 
              : 'bg-rose-600 border-2 border-white'
          } text-white p-2 rounded-full shadow-lg flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
          </div>
        </div>`,
        iconSize: [36, 36],
        iconAnchor: [18, 18],
      });

      const shopMarker = L.marker([lat, lng], { icon: shopIcon });
      
      shopMarker.on('click', () => {
        onSelectWorkshop(chunk);
        setSheetState('minimized'); // Open bottom sheet minimized when marker clicked
        map.panTo([lat, lng], { animate: true, duration: 0.5 });
      });

      group.addLayer(shopMarker);
    });

  }, [filteredChunks, userLocation?.latitude, userLocation?.longitude, selectedWorkshop]);

  // Recenter GPS button handler
  const handleRecenterGps = () => {
    if (mapInstanceRef.current && userLocation) {
      mapInstanceRef.current.setView([userLocation.latitude, userLocation.longitude], 15, {
        animate: true,
        duration: 0.6
      });
    }
  };

  // Drag Gesture Handlers for Bottom Sheet
  const handleTouchStart = (e: React.TouchEvent | React.MouseEvent) => {
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    dragStartYRef.current = clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent | React.MouseEvent) => {
    if (dragStartYRef.current === null) return;
    const clientY = 'changedTouches' in e ? e.changedTouches[0].clientY : e.clientY;
    const deltaY = clientY - dragStartYRef.current;

    // Drag up -> expand
    if (deltaY < -40) {
      setSheetState('expanded');
    } 
    // Drag down -> minimize
    else if (deltaY > 40) {
      setSheetState('minimized');
    }
    dragStartYRef.current = null;
  };

  const toggleSheetState = () => {
    setSheetState(prev => (prev === 'minimized' ? 'expanded' : 'minimized'));
  };

  // Derived metadata for selected workshop
  const selectedIndex = groundingChunks.findIndex(c => c.maps?.title === title);
  const bgPhoto = DEFAULT_WORKSHOP_IMAGES[Math.max(0, selectedIndex) % DEFAULT_WORKSHOP_IMAGES.length];
  const snippet = selectedWorkshop?.maps?.placeAnswerSources?.reviewSnippets?.[0]?.snippet || 
    'Oficina mecânica especializada e credenciada pelo ecossistema FIX. Atendimento ágil, peças originais e garantia.';
  const fakeAddress = `Av. Paulista, ${1000 + (selectedIndex > -1 ? selectedIndex * 120 : 250)} - São Paulo, SP`;

  return (
    <div className="relative w-full h-[calc(100vh-210px)] sm:h-[calc(100vh-230px)] min-h-[480px] max-h-[850px] rounded-3xl overflow-hidden border border-zinc-800 shadow-2xl bg-zinc-950 flex flex-col justify-between fix-map-container isolate z-0">
      
      {/* MAP CANVAS */}
      <div className="absolute inset-0 w-full h-full z-0 overflow-hidden">
        <div ref={mapContainerRef} className="w-full h-full z-0" />
      </div>

      {/* FLOATING TOP BAR OVERLAY: Floating GPS Button & Status */}
      <div className="relative z-20 p-3 sm:p-4 flex items-center justify-between pointer-events-none">
        <div className="bg-zinc-900/90 dark:bg-zinc-950/90 backdrop-blur-md px-3 py-1.5 rounded-full border border-zinc-800 shadow-lg text-[11px] font-bold text-zinc-300 pointer-events-auto flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>{filteredChunks.length || groundingChunks.length} oficinas no mapa</span>
        </div>

        {/* Floating "Minha Localização" GPS Button */}
        <button
          type="button"
          onClick={handleRecenterGps}
          className="bg-indigo-600 hover:bg-indigo-500 text-white px-3.5 py-2 rounded-full shadow-xl border border-indigo-400/40 font-bold text-xs flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer pointer-events-auto backdrop-blur-md"
          title="Centralizar no Meu GPS"
        >
          <Navigation size={14} className="fill-white" />
          <span className="hidden sm:inline">Minha Localização</span>
          <span className="sm:hidden">GPS</span>
        </button>
      </div>

      {/* ROUTE MODAL */}
      {selectedWorkshop && (
        <RouteModal
          isOpen={isRouteModalOpen}
          onClose={() => setIsRouteModalOpen(false)}
          destinationTitle={title}
          destinationLat={userLocation?.latitude ? userLocation.latitude + 0.01 : -23.5505}
          destinationLng={userLocation?.longitude ? userLocation.longitude + 0.01 : -46.6333}
          userLat={userLocation?.latitude}
          userLng={userLocation?.longitude}
        />
      )}

      {/* INTERACTIVE DRAGGABLE BOTTOM SHEET OVER MAP */}
      <div 
        className={`relative z-[60] z-bottom-sheet bg-zinc-900/95 dark:bg-zinc-950/95 backdrop-blur-2xl border-t border-zinc-800/80 rounded-t-3xl shadow-[0_-12px_40px_rgba(0,0,0,0.6)] transition-all duration-300 ease-in-out flex flex-col ${
          sheetState === 'expanded' 
            ? 'h-[60%] sm:h-[55%] max-h-[520px]' 
            : 'h-36 sm:h-40'
        }`}
      >
        {/* DRAG HANDLE & HEADER BAR */}
        <div 
          className="w-full flex flex-col items-center pt-2.5 pb-1 px-4 cursor-grab active:cursor-grabbing select-none shrink-0"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleTouchStart}
          onMouseUp={handleTouchEnd}
          onClick={toggleSheetState}
        >
          {/* Handle bar */}
          <div className="w-12 h-1.5 bg-zinc-600/80 dark:bg-zinc-700 rounded-full hover:bg-indigo-500 transition-colors mb-1" />
          
          <div className="w-full flex items-center justify-between text-[11px] text-zinc-400 font-bold px-1">
            <span className="flex items-center gap-1 text-indigo-400">
              <ShieldCheck size={13} />
              {selectedWorkshop ? 'Oficina Credenciada FIX' : 'Selecione uma Oficina'}
            </span>
            <span className="flex items-center gap-1 text-zinc-500 hover:text-white transition-colors">
              {sheetState === 'expanded' ? (
                <>Minimizar <ChevronDown size={14} /></>
              ) : (
                <>Ver Detalhes <ChevronUp size={14} /></>
              )}
            </span>
          </div>
        </div>

        {/* BOTTOM SHEET CONTENT */}
        <div className="flex-1 overflow-y-auto px-4 pb-4 pt-1 scrollbar-none">
          {selectedWorkshop ? (
            <div className="space-y-3">
              
              {/* MINIMIZED STATE VIEW */}
              {sheetState === 'minimized' && (
                <div className="flex items-center justify-between gap-3 animate-fade-in pt-1">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                        Aberto Agora
                      </span>
                      <div className="flex items-center gap-1 text-amber-400 text-xs font-bold">
                        <Star size={12} className="fill-amber-400" />
                        4.8
                      </div>
                      <span className="text-zinc-600">•</span>
                      <span className="text-xs text-zinc-400 flex items-center gap-0.5">
                        <MapPin size={11} /> 1.2 km
                      </span>
                    </div>

                    <h3 className="font-extrabold text-white text-base sm:text-lg truncate leading-tight">
                      {title}
                    </h3>
                  </div>

                  {/* Minimized Quick Action Button: ROTA */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsRouteModalOpen(true);
                      }}
                      className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-md shadow-indigo-600/30 transition-all cursor-pointer active:scale-95"
                    >
                      <Navigation size={14} />
                      <span>Rota</span>
                    </button>
                  </div>
                </div>
              )}

              {/* EXPANDED STATE VIEW */}
              {sheetState === 'expanded' && (
                <div className="space-y-4 animate-fade-in pt-1">
                  
                  {/* Photo Header Card */}
                  <div className="relative h-32 sm:h-36 rounded-2xl overflow-hidden border border-zinc-800 shadow-md">
                    <img 
                      src={bgPhoto} 
                      alt={title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent" />
                    
                    <button
                      onClick={() => onSelectWorkshop(null)}
                      className="absolute top-2 right-2 bg-zinc-900/80 text-zinc-300 hover:text-white p-1.5 rounded-full backdrop-blur-md cursor-pointer"
                      title="Fechar Seleção"
                    >
                      <X size={16} />
                    </button>

                    <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-wider text-indigo-400 bg-indigo-950/80 backdrop-blur-md px-2 py-0.5 rounded border border-indigo-800/60">
                          Credenciada
                        </span>
                        <h2 className="text-lg font-black text-white leading-tight mt-1 drop-shadow-md">
                          {title}
                        </h2>
                      </div>
                    </div>
                  </div>

                  {/* Rating, Hours & Distance */}
                  <div className="flex items-center justify-between text-xs text-zinc-300 bg-zinc-900/80 p-2.5 rounded-xl border border-zinc-800">
                    <div className="flex items-center gap-1 text-amber-400 font-bold">
                      <Star size={14} className="fill-amber-400" />
                      4.8 <span className="text-zinc-500 font-normal">(128 avaliações)</span>
                    </div>

                    <div className="flex items-center gap-1 text-emerald-400 font-bold">
                      <Clock size={13} />
                      Aberto hoje até 18:00
                    </div>

                    <div className="flex items-center gap-1 text-zinc-400">
                      <MapPin size={13} className="text-indigo-400" />
                      1.2 km
                    </div>
                  </div>

                  {/* Address Box */}
                  <div className="bg-zinc-900/60 p-3 rounded-xl border border-zinc-800/80 flex items-center justify-between gap-2">
                    <div className="text-xs text-zinc-300 min-w-0">
                      <p className="font-semibold truncate">{fakeAddress}</p>
                      <p className="text-[11px] text-zinc-500 mt-0.5">Clique para copiar o endereço</p>
                    </div>

                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(fakeAddress);
                        setCopiedAddress(true);
                        setTimeout(() => setCopiedAddress(false), 2000);
                      }}
                      className="p-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-xs font-bold transition-colors cursor-pointer shrink-0 flex items-center gap-1"
                    >
                      {copiedAddress ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                      <span>{copiedAddress ? 'Copiado!' : 'Copiar'}</span>
                    </button>
                  </div>

                  {/* Snippet / Description */}
                  <p className="text-xs text-zinc-400 leading-relaxed bg-zinc-900/40 p-3 rounded-xl border border-zinc-800/50">
                    {snippet}
                  </p>

                  {/* Offered Services Tags */}
                  <div>
                    <h4 className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-2">
                      Serviços Oferecidos
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {['Mecânica Geral', 'Diagnóstico Computadorizado', 'Guincho 24h', 'Troca de Óleo', 'Freios e Suspensão'].map((srv, idx) => (
                        <span key={idx} className="text-[11px] bg-zinc-800 text-zinc-300 px-2.5 py-1 rounded-lg border border-zinc-700/60">
                          {srv}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* ACTION BUTTONS GRID: Rota, WhatsApp, Ligar, Favoritar */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-zinc-800">
                    
                    <button
                      type="button"
                      onClick={() => setIsRouteModalOpen(true)}
                      className="bg-indigo-600 hover:bg-indigo-500 text-white py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-indigo-600/30 transition-all cursor-pointer"
                    >
                      <Navigation size={15} />
                      <span>Rota</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onContact(title)}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/30 transition-all cursor-pointer"
                    >
                      <MessageCircle size={15} />
                      <span>WhatsApp</span>
                    </button>

                    <a
                      href="tel:11987654321"
                      className="bg-zinc-800 hover:bg-zinc-700 text-white py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 border border-zinc-700 transition-all cursor-pointer"
                    >
                      <Phone size={15} className="text-indigo-400" />
                      <span>Ligar</span>
                    </a>

                    <button
                      type="button"
                      onClick={() => toggleFavorite(title)}
                      className={`py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                        isFavorite
                          ? 'bg-rose-950/60 text-rose-400 border-rose-800'
                          : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border-zinc-700'
                      }`}
                    >
                      <Heart size={15} className={isFavorite ? 'fill-rose-500 text-rose-500' : ''} />
                      <span>{isFavorite ? 'Salvo' : 'Favoritar'}</span>
                    </button>

                  </div>

                </div>
              )}

            </div>
          ) : (
            /* DEFAULT VIEW WHEN NO SPECIFIC WORKSHOP IS CLICKED */
            <div className="space-y-3 animate-fade-in pt-1">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                  <MapPin size={14} className="text-rose-500" />
                  Oficinas Próximas ({filteredChunks.length || groundingChunks.length})
                </h4>
                <span className="text-[10px] text-zinc-500">Toque em um local para ver mais</span>
              </div>

              {/* List of nearby cards */}
              <div className="space-y-2">
                {(filteredChunks.length > 0 ? filteredChunks : groundingChunks).slice(0, 4).map((chunk, idx) => (
                  <div
                    key={idx}
                    onClick={() => {
                      onSelectWorkshop(chunk);
                      setSheetState('minimized');
                    }}
                    className="flex items-center justify-between p-2.5 bg-zinc-900/80 hover:bg-zinc-800 rounded-xl border border-zinc-800/80 cursor-pointer transition-all"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-indigo-950 text-indigo-400 flex items-center justify-center font-bold text-xs shrink-0">
                        <Wrench size={16} />
                      </div>
                      <div className="min-w-0">
                        <h5 className="font-bold text-white text-xs truncate">
                          {chunk.maps?.title || 'Oficina Mecânica'}
                        </h5>
                        <p className="text-[10px] text-zinc-400 flex items-center gap-1 mt-0.5">
                          <Star size={10} className="fill-amber-400 text-amber-400" /> 4.8 • 1.2 km
                        </p>
                      </div>
                    </div>

                    <button 
                      className="text-xs text-indigo-400 font-bold hover:underline px-2 py-1 bg-indigo-950/60 rounded-lg border border-indigo-900/60 shrink-0"
                    >
                      Ver
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
