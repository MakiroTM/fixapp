import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import { Coordinates, GroundingChunk } from '../types';
import { 
  MapPin, Star, Navigation, Phone, MessageCircle, Heart, 
  Clock, ShieldCheck, ChevronUp, ChevronDown, Wrench, X, Share2, Copy, Check
} from 'lucide-react';
import { RouteModal } from './RouteModal';
import { useNavigation } from '../hooks/useNavigation';
import { NavigationPanel } from './NavigationPanel';

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

  // Navigation Hook
  const navState = useNavigation();
  const { startNavigation, stopNavigation, forceRecalculate } = navState;

  // Dragging interaction state
  const dragStartYRef = useRef<number | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersGroupRef = useRef<L.LayerGroup | null>(null);
  const routePolylineGroupRef = useRef<L.LayerGroup | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);

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

  // Calculate workshop coordinates relative to userLocation or map center
  const getWorkshopCoords = (chunk: GroundingChunk, index: number): Coordinates | null => {
    if (!userLocation) return null;
    const radius = 0.012;
    const chunksCount = filteredChunks.length > 0 ? filteredChunks.length : groundingChunks.length;
    const angle = (index / Math.max(chunksCount, 1)) * Math.PI * 2;
    return {
      latitude: userLocation.latitude + Math.cos(angle) * radius * 0.85,
      longitude: userLocation.longitude + Math.sin(angle) * radius * 0.85,
    };
  };

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const initialLat = userLocation?.latitude || -15.7801; // Neutral Brazil center if no GPS
      const initialLng = userLocation?.longitude || -47.9292;
      const initialZoom = userLocation ? 14 : 4;

      const map = L.map(mapContainerRef.current, {
        center: [initialLat, initialLng],
        zoom: initialZoom,
        zoomControl: false,
        attributionControl: false,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
      }).addTo(map);

      routePolylineGroupRef.current = L.layerGroup().addTo(map);
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

  // Update User & Workshop Markers on Map
  useEffect(() => {
    const map = mapInstanceRef.current;
    const group = markersGroupRef.current;
    if (!map || !group) return;

    group.clearLayers();

    // User Marker
    if (userLocation) {
      const userIcon = L.divIcon({
        className: 'custom-user-pin',
        html: `<div class="relative flex items-center justify-center w-10 h-10">
          <div class="absolute inset-0 bg-indigo-500/40 rounded-full animate-ping"></div>
          <div class="w-8 h-8 bg-indigo-600 border-2 border-white rounded-full shadow-2xl flex items-center justify-center text-white">
            <div class="w-3 h-3 bg-white rounded-full"></div>
          </div>
        </div>`,
        iconSize: [40, 40],
        iconAnchor: [20, 20],
      });

      const userMarker = L.marker([userLocation.latitude, userLocation.longitude], { icon: userIcon });
      userMarker.bindPopup('<strong style="font-family:sans-serif;font-size:12px;">Sua Localização GPS Real</strong>');
      group.addLayer(userMarker);
      userMarkerRef.current = userMarker;
    }

    // Workshop Pins
    const chunksToRender = filteredChunks.length > 0 ? filteredChunks : groundingChunks;

    chunksToRender.forEach((chunk, index) => {
      const shopCoords = getWorkshopCoords(chunk, index);
      if (!shopCoords) return;

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

      const shopMarker = L.marker([shopCoords.latitude, shopCoords.longitude], { icon: shopIcon });
      
      shopMarker.on('click', () => {
        onSelectWorkshop(chunk);
        setSheetState('minimized');
        map.panTo([shopCoords.latitude, shopCoords.longitude], { animate: true, duration: 0.5 });
      });

      group.addLayer(shopMarker);
    });

  }, [filteredChunks, userLocation?.latitude, userLocation?.longitude, selectedWorkshop]);

  // Update Route Polyline when Navigation is Active
  useEffect(() => {
    const routeGroup = routePolylineGroupRef.current;
    const map = mapInstanceRef.current;
    if (!routeGroup || !map) return;

    routeGroup.clearLayers();

    if (navState.route && navState.route.geometry.length > 0 && navState.status !== 'idle') {
      // Outline shadow
      const polylineOutline = L.polyline(navState.route.geometry, {
        color: '#1e1b4b',
        weight: 10,
        opacity: 0.5,
      });
      routeGroup.addLayer(polylineOutline);

      // Main Route Polyline
      const polyline = L.polyline(navState.route.geometry, {
        color: '#4f46e5',
        weight: 6,
        opacity: 0.9,
      });
      routeGroup.addLayer(polyline);

      // Fit map bounds to show full route initially
      if (navState.status === 'calculating' || navState.status === 'navigating') {
        const bounds = polyline.getBounds();
        if (bounds.isValid()) {
          map.fitBounds(bounds, { padding: [60, 60] });
        }
      }
    }
  }, [navState.route, navState.status]);

  // Handler for starting live route navigation
  const handleStartRoute = (chunk?: GroundingChunk | null) => {
    const targetChunk = chunk || selectedWorkshop;
    if (!targetChunk) return;

    if (!userLocation) {
      alert("Não foi possível obter sua localização real do GPS.");
      return;
    }

    const index = groundingChunks.findIndex(c => c.maps?.title === targetChunk.maps?.title);
    const destCoords = getWorkshopCoords(targetChunk, Math.max(0, index));

    if (!destCoords) {
      alert("Este destino não possui localização válida.");
      return;
    }

    const shopTitle = targetChunk.maps?.title || 'Oficina Selecionada';
    startNavigation(destCoords, shopTitle);
    setSheetState('minimized');
  };

  // Recenter GPS button handler
  const handleRecenterGps = () => {
    if (mapInstanceRef.current && userLocation) {
      mapInstanceRef.current.setView([userLocation.latitude, userLocation.longitude], 16, {
        animate: true,
        duration: 0.6
      });
    } else {
      alert("Localização GPS indisponível no momento.");
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

    if (deltaY < -40) {
      setSheetState('expanded');
    } else if (deltaY > 40) {
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
  const fakeAddress = `Av. Principal - Atendimento via GPS FIX`;

  return (
    <div className="relative w-full h-[calc(100vh-210px)] sm:h-[calc(100vh-230px)] min-h-[480px] max-h-[850px] rounded-3xl overflow-hidden border border-zinc-800 shadow-2xl bg-zinc-950 flex flex-col justify-between fix-map-container isolate z-0">
      
      {/* MAP CANVAS */}
      <div className="absolute inset-0 w-full h-full z-0 overflow-hidden">
        <div ref={mapContainerRef} className="w-full h-full z-0" />
      </div>

      {/* FLOATING REAL-TIME NAVIGATION PANEL */}
      <NavigationPanel
        navState={navState}
        onCenterMap={handleRecenterGps}
        onStopNavigation={stopNavigation}
        onRecalculate={forceRecalculate}
      />

      {/* FLOATING TOP BAR OVERLAY: Status & Recenter */}
      {navState.status === 'idle' && (
        <div className="relative z-20 p-3 sm:p-4 flex items-center justify-between pointer-events-none">
          <div className="bg-white/90 dark:bg-zinc-950/90 backdrop-blur-md px-3 py-1.5 rounded-full border border-zinc-200 dark:border-zinc-800 shadow-lg text-[11px] font-bold text-zinc-800 dark:text-zinc-300 pointer-events-auto flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>{filteredChunks.length || groundingChunks.length} oficinas no mapa</span>
          </div>

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
      )}

      {/* ROUTE MODAL */}
      {selectedWorkshop && (
        <RouteModal
          isOpen={isRouteModalOpen}
          onClose={() => setIsRouteModalOpen(false)}
          destinationTitle={title}
          destinationLat={userLocation?.latitude ? userLocation.latitude + 0.01 : undefined}
          destinationLng={userLocation?.longitude ? userLocation.longitude + 0.01 : undefined}
          userLat={userLocation?.latitude}
          userLng={userLocation?.longitude}
          onStartLiveNavigation={() => {
            setIsRouteModalOpen(false);
            handleStartRoute(selectedWorkshop);
          }}
        />
      )}

      {/* INTERACTIVE DRAGGABLE BOTTOM SHEET OVER MAP */}
      <div 
        className={`relative z-[60] z-bottom-sheet bg-white/95 dark:bg-zinc-950/95 backdrop-blur-2xl border-t border-zinc-200 dark:border-zinc-800/80 rounded-t-3xl shadow-[0_-12px_40px_rgba(0,0,0,0.15)] dark:shadow-[0_-12px_40px_rgba(0,0,0,0.6)] transition-all duration-300 ease-in-out flex flex-col ${
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
          <div className="w-12 h-1.5 bg-zinc-300 dark:bg-zinc-700 rounded-full hover:bg-indigo-500 transition-colors mb-1" />
          
          <div className="w-full flex items-center justify-between text-[11px] text-zinc-500 dark:text-zinc-400 font-bold px-1">
            <span className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400">
              <ShieldCheck size={13} />
              {selectedWorkshop ? 'Oficina Credenciada FIX' : 'Selecione uma Oficina'}
            </span>
            <span className="flex items-center gap-1 text-zinc-500 hover:text-zinc-800 dark:hover:text-white transition-colors">
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
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                        Aberto Agora
                      </span>
                      <div className="flex items-center gap-1 text-amber-500 text-xs font-bold">
                        <Star size={12} className="fill-amber-500" />
                        4.8
                      </div>
                    </div>

                    <h3 className="font-extrabold text-zinc-900 dark:text-white text-base sm:text-lg truncate leading-tight">
                      {title}
                    </h3>
                  </div>

                  {/* Minimized Action Button: TRAÇAR ROTA */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStartRoute(selectedWorkshop);
                      }}
                      className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-md shadow-indigo-600/30 transition-all cursor-pointer active:scale-95"
                    >
                      <Navigation size={14} />
                      <span>Traçar Rota</span>
                    </button>
                  </div>
                </div>
              )}

              {/* EXPANDED STATE VIEW */}
              {sheetState === 'expanded' && (
                <div className="space-y-4 animate-fade-in pt-1">
                  
                  {/* Photo Header Card */}
                  <div className="relative h-32 sm:h-36 rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 shadow-md">
                    <img 
                      src={bgPhoto} 
                      alt={title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-zinc-950/40 to-transparent" />
                    
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

                  {/* Rating & Hours */}
                  <div className="flex items-center justify-between text-xs text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-900/80 p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800">
                    <div className="flex items-center gap-1 text-amber-500 font-bold">
                      <Star size={14} className="fill-amber-500" />
                      4.8 <span className="text-zinc-500 font-normal">(128 avaliações)</span>
                    </div>

                    <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold">
                      <Clock size={13} />
                      Aberto hoje
                    </div>
                  </div>

                  {/* Address Box */}
                  <div className="bg-zinc-50 dark:bg-zinc-900/60 p-3 rounded-xl border border-zinc-200 dark:border-zinc-800/80 flex items-center justify-between gap-2">
                    <div className="text-xs text-zinc-700 dark:text-zinc-300 min-w-0">
                      <p className="font-semibold truncate">{fakeAddress}</p>
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

                  {/* ACTION BUTTONS GRID: Traçar Rota, WhatsApp, Ligar, Favoritar */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-zinc-800">
                    
                    <button
                      type="button"
                      onClick={() => handleStartRoute(selectedWorkshop)}
                      className="bg-indigo-600 hover:bg-indigo-500 text-white py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-indigo-600/30 transition-all cursor-pointer"
                    >
                      <Navigation size={15} />
                      <span>Traçar Rota</span>
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
                          <Star size={10} className="fill-amber-400 text-amber-400" /> 4.8
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
