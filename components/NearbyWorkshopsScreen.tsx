import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Navigation, Phone, MessageCircle, Heart, Handshake, Star, X, Info, Store, AlertCircle, ArrowLeft, ExternalLink } from 'lucide-react';
import L from 'leaflet';
import { Coordinates, SearchResult, GroundingChunk } from '../types';
import { findMechanics } from '../services/geminiService';
import { ServiceSkeleton } from './ServiceSkeleton';

interface NearbyWorkshopsScreenProps {
  user: any;
  location: Coordinates | null;
  onBack: () => void;
  onContact: (name: string) => void;
  onSelectWorkshop?: (chunk: GroundingChunk) => void;
  selectedWorkshop?: GroundingChunk | null;
}

const getWorkshopStatus = (name: string = '') => {
  const hash = name.length;
  if (hash % 5 === 0) return { label: 'Fechado', color: 'text-red-500' };
  if (hash % 3 === 0) return { label: 'Ocupado', color: 'text-amber-500' };
  return { label: 'Aberto', color: 'text-emerald-500' };
};

export const NearbyWorkshopsScreen: React.FC<NearbyWorkshopsScreenProps> = ({ 
  user, 
  location, 
  onBack, 
  onContact, 
  onSelectWorkshop,
  selectedWorkshop: externalSelectedWorkshop 
}) => {
  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [vehicleFilter, setVehicleFilter] = useState('CARROS');
  const [mechanics, setMechanics] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedWorkshop, setSelectedWorkshop] = useState<GroundingChunk | null>(externalSelectedWorkshop || null);
  const [isSheetOpen, setIsSheetOpen] = useState(true);

  // Sync externalSelectedWorkshop when prop changes
  useEffect(() => {
    if (externalSelectedWorkshop !== undefined) {
      setSelectedWorkshop(externalSelectedWorkshop);
    }
  }, [externalSelectedWorkshop]);

  const handleSelectWorkshopInternal = (chunk: GroundingChunk | null) => {
    setSelectedWorkshop(chunk);
    if (chunk && onSelectWorkshop) {
      onSelectWorkshop(chunk);
    }
  };

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersGroupRef = useRef<L.LayerGroup | null>(null);

  // Fetch initial data
  useEffect(() => {
    if (location) {
      handleSearch('Oficinas mecânicas próximas', 'ALL', 'CARROS');
    }
  }, [location]);

  const handleSearch = async (searchQuery: string, filter: string, vehicle: string) => {
    if (!location) return;
    setLoading(true);
    setActiveFilter(filter);
    setVehicleFilter(vehicle);
    
    let effectiveQuery = searchQuery;
    if (vehicle !== 'CARROS' && vehicle !== 'TODOS') {
      effectiveQuery += ` para ${vehicle.toLowerCase()}`;
    }
    if (filter !== 'ALL') {
      effectiveQuery += ` ${filter}`;
    }

    try {
      let vType = 'CAR';
      if (vehicle === 'MOTOS') vType = 'MOTORCYCLE';
      if (vehicle === 'CAMINHÕES') vType = 'TRUCK';
      
      const result = await findMechanics(effectiveQuery, vType as any, 'MAINTENANCE' as any, location);
      setMechanics(result);
      setSelectedWorkshop(null);
      setIsSheetOpen(true);
    } catch (e) {
      console.error("Search failed:", e);
    } finally {
      setLoading(false);
    }
  };

  const rawChunks = mechanics?.groundingChunks || [];
  const filteredChunks = rawChunks.filter(chunk => {
    if (activeFilter === 'ALL') return true;
    const title = (chunk.maps?.title || '').toLowerCase();
    const snippet = (chunk.maps?.placeAnswerSources?.reviewSnippets?.[0]?.snippet || '').toLowerCase();
    const text = `${title} ${snippet}`;

    if (activeFilter === 'GUINCHO') return text.includes('guincho') || text.includes('socorro') || text.includes('reboque');
    if (activeFilter === 'PNEU') return text.includes('pneu') || text.includes('borracharia');
    if (activeFilter === 'ELETRICA') return text.includes('elétric') || text.includes('bateria');
    return true;
  });

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const centerLat = location?.latitude || -15.7801;
      const centerLng = location?.longitude || -47.9292;

      const map = L.map(mapContainerRef.current, {
        center: [centerLat, centerLng],
        zoom: 14,
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
      }, 250);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Re-calculate map size on browser window resize
  useEffect(() => {
    const handleResize = () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Center once when GPS location is acquired
  const hasCenteredUserRef = useRef(false);
  useEffect(() => {
    if (location && mapInstanceRef.current && !hasCenteredUserRef.current) {
      mapInstanceRef.current.setView([location.latitude, location.longitude], 14);
      hasCenteredUserRef.current = true;
    }
  }, [location]);

  // Update Markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    const group = markersGroupRef.current;
    if (!map || !group) return;

    group.clearLayers();

    const baseLat = location?.latitude || -23.5505;
    const baseLng = location?.longitude || -46.6333;

    // User Marker
    if (location) {
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

      const userMarker = L.marker([location.latitude, location.longitude], { icon: userIcon });
      userMarker.bindPopup('<strong style="font-family:sans-serif;font-size:12px;">Sua Localização GPS</strong>');
      group.addLayer(userMarker);
    }

    // Workshop Pins
    filteredChunks.forEach((chunk, index) => {
      const radius = 0.015;
      const angle = (index / Math.max(filteredChunks.length, 1)) * Math.PI * 2;
      const lat = baseLat + Math.cos(angle) * radius * 0.8;
      const lng = baseLng + Math.sin(angle) * radius * 0.8;

      const isSelected = selectedWorkshop?.maps?.title === chunk.maps?.title;

      const shopIcon = L.divIcon({
        className: 'custom-shop-pin',
        html: `<div class="relative flex items-center justify-center transition-transform ${isSelected ? 'scale-125 z-50' : 'hover:scale-110'} cursor-pointer">
          <div class="${isSelected ? 'bg-indigo-600 ring-4 ring-indigo-300 dark:ring-indigo-900' : 'bg-rose-600'} text-white p-2 rounded-full shadow-xl border-2 border-white flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
          </div>
        </div>`,
        iconSize: [36, 36],
        iconAnchor: [18, 18],
      });

      const shopMarker = L.marker([lat, lng], { icon: shopIcon });
      shopMarker.on('click', () => {
        handleSelectWorkshopInternal(chunk);
        setIsSheetOpen(true);
        map.panTo([lat, lng]);
      });
      group.addLayer(shopMarker);
    });

  }, [filteredChunks, location, selectedWorkshop]);

  return (
    <div className="relative flex-1 flex flex-col w-full min-h-[calc(100vh-3.5rem)] sm:min-h-[calc(100vh-4rem)] overflow-hidden bg-white dark:bg-zinc-950 z-0">
      
      {/* Geolocation Warning Banner if GPS unavailable */}
      {!location && (
        <div className="bg-amber-500/15 border-b border-amber-500/30 p-2.5 z-20 text-xs text-amber-800 dark:text-amber-200 flex items-center justify-between gap-2 px-4 shrink-0 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <AlertCircle size={18} className="text-amber-500 flex-shrink-0" />
            <span>
              <strong>Localização Indisponível:</strong> Ative o GPS do dispositivo para visualizar sua posição real e oficinas ao seu redor.
            </span>
          </div>
        </div>
      )}

      {/* Responsive Top Search & Navigation Bar */}
      <div className="relative z-20 p-3 sm:p-4 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 shadow-xs shrink-0">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          
          {/* Back button and Search input */}
          <div className="flex items-center gap-2 flex-1 max-w-xl">
            <button 
              onClick={onBack}
              className="p-2.5 bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-300 transition-colors cursor-pointer shrink-0"
              title="Voltar ao início"
            >
              <X size={20} />
            </button>
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Buscar oficinas, guinchos, borracharias..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch(query, activeFilter, vehicleFilter)}
                className="w-full bg-zinc-50 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 py-2 pl-9 pr-4 text-xs sm:text-sm outline-none focus:border-indigo-500 text-zinc-900 dark:text-white transition-colors"
              />
              <Search className="absolute left-3 top-2.5 text-zinc-400" size={16} />
            </div>
          </div>
          
          {/* Horizontal Filters (Responsive on tablet/desktop) */}
          <div className="flex flex-wrap items-center gap-2 overflow-x-auto scrollbar-none py-0.5">
            <div className="flex items-center gap-1.5 border-r border-zinc-200 dark:border-zinc-800 pr-2">
              {['ALL', 'MECANICA', 'GUINCHO', 'ELETRICA', 'PNEU'].map((filter) => (
                <button
                  key={filter}
                  onClick={() => handleSearch(query, filter, vehicleFilter)}
                  className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                    activeFilter === filter
                      ? 'bg-indigo-600 text-white border border-indigo-500 shadow-xs'
                      : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-800'
                  }`}
                >
                  {filter === 'ALL' ? 'Todos Serviços' : filter === 'MECANICA' ? 'Mecânica' : filter === 'GUINCHO' ? 'Guincho' : filter === 'ELETRICA' ? 'Elétrica' : 'Borracharia'}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1.5">
              {['CARROS', 'MOTOS', 'CAMINHÕES', 'ELÉTRICOS'].map((vehicle) => (
                <button
                  key={vehicle}
                  onClick={() => handleSearch(query, activeFilter, vehicle)}
                  className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                    vehicleFilter === vehicle
                      ? 'bg-emerald-600 text-white border border-emerald-500 shadow-xs'
                      : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-800'
                  }`}
                >
                  {vehicle === 'CARROS' ? 'Carros' : vehicle === 'MOTOS' ? 'Motos' : vehicle === 'CAMINHÕES' ? 'Caminhões' : 'Elétricos'}
                </button>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* Main Content Area: Responsive Layout (Side panel on tablet/desktop, Full Map + Bottom Sheet on Mobile) */}
      <div className="flex-1 flex flex-col md:flex-row relative overflow-hidden h-full z-0">
        
        {/* DESKTOP & TABLET SIDEBAR PANEL (768px+) */}
        <div className="hidden md:flex flex-col w-80 md:w-96 lg:w-[420px] xl:w-[450px] bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 shrink-0 h-full overflow-y-auto p-4 z-10 shadow-lg">
          {loading ? (
            <ServiceSkeleton title="Buscando oficinas próximas..." subtitle="" count={3} />
          ) : selectedWorkshop ? (
            /* Selected Workshop Desktop Details View */
            <div className="space-y-5 animate-fade-in">
              <button 
                onClick={() => handleSelectWorkshopInternal(null)}
                className="flex items-center gap-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
              >
                <ArrowLeft size={16} /> Voltar à Lista de Oficinas
              </button>

              <div>
                <h2 className="text-xl font-bold text-zinc-900 dark:text-white leading-tight">
                  {selectedWorkshop.maps?.title}
                </h2>
                <div className="flex items-center gap-3 mt-2">
                  <div className="flex items-center gap-1 text-amber-500 text-sm font-bold">
                    <Star size={14} className="fill-amber-500" />
                    4.8
                  </div>
                  <span className="text-xs text-zinc-500 flex items-center gap-1">
                    <MapPin size={12} /> 1.2 km de distância
                  </span>
                  <span className={`text-xs font-semibold ${getWorkshopStatus(selectedWorkshop.maps?.title).color}`}>
                    {getWorkshopStatus(selectedWorkshop.maps?.title).label}
                  </span>
                </div>
              </div>

              <div className="flex gap-2">
                {onSelectWorkshop && (
                  <button 
                    onClick={() => onSelectWorkshop(selectedWorkshop)}
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-colors shadow-sm cursor-pointer"
                  >
                    <Store size={16} /> Ver Página
                  </button>
                )}
                <button 
                  onClick={() => onContact(selectedWorkshop.maps?.title || 'Oficina')}
                  className="flex-1 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-900 dark:text-white py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <MessageCircle size={16} /> Negociar
                </button>
              </div>

              <div className="grid grid-cols-4 gap-2 py-3 border-y border-zinc-100 dark:border-zinc-800 text-center">
                <button className="flex flex-col items-center gap-1 text-zinc-500 hover:text-indigo-600 transition-colors p-1 cursor-pointer">
                  <Phone size={18} />
                  <span className="text-[10px] font-medium">Ligar</span>
                </button>
                <button className="flex flex-col items-center gap-1 text-zinc-500 hover:text-emerald-500 transition-colors p-1 cursor-pointer">
                  <MessageCircle size={18} />
                  <span className="text-[10px] font-medium">WhatsApp</span>
                </button>
                <button className="flex flex-col items-center gap-1 text-zinc-500 hover:text-rose-500 transition-colors p-1 cursor-pointer">
                  <Heart size={18} />
                  <span className="text-[10px] font-medium">Favoritar</span>
                </button>
                <button className="flex flex-col items-center gap-1 text-zinc-500 hover:text-amber-500 transition-colors p-1 cursor-pointer">
                  <Handshake size={18} />
                  <span className="text-[10px] font-medium">Parceiro</span>
                </button>
              </div>

              <div>
                <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-200 mb-1.5">Sobre a Oficina</h3>
                <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  {selectedWorkshop.maps?.placeAnswerSources?.reviewSnippets?.[0]?.snippet || 
                   'Oficina credenciada no ecossistema FIX com diagnóstico rápido, peças originais e garantia de atendimento.'}
                </p>
              </div>
              
              <div className="bg-zinc-50 dark:bg-zinc-800/50 p-3 rounded-xl border border-zinc-100 dark:border-zinc-800">
                <div className="flex items-start gap-2 text-xs text-zinc-600 dark:text-zinc-400">
                  <Info size={16} className="mt-0.5 text-indigo-500 shrink-0" />
                  <p>Aceita pagamentos pelo app via Pix e Cartão. Atendimento garantido pelo suporte FIX.</p>
                </div>
              </div>
            </div>
          ) : (
            /* Desktop List View */
            <div className="space-y-3">
              <div className="flex items-center justify-between px-1 pb-1">
                <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">
                  Oficinas Próximas ({filteredChunks.length})
                </h3>
              </div>

              {filteredChunks.length === 0 && !loading && (
                <div className="text-center py-12 text-zinc-500 text-sm">
                  Nenhuma oficina encontrada para este filtro.
                </div>
              )}

              {filteredChunks.map((chunk, idx) => (
                <div 
                  key={idx}
                  onClick={() => handleSelectWorkshopInternal(chunk)}
                  className={`flex items-start gap-3 p-3 rounded-2xl cursor-pointer transition-all border ${
                    selectedWorkshop?.maps?.title === chunk.maps?.title
                      ? 'bg-indigo-50/80 dark:bg-indigo-950/40 border-indigo-300 dark:border-indigo-700 shadow-sm'
                      : 'bg-zinc-50 dark:bg-zinc-800/40 hover:bg-zinc-100 dark:hover:bg-zinc-800 border-zinc-200/60 dark:border-zinc-800'
                  }`}
                >
                  <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 rounded-xl flex-shrink-0 flex items-center justify-center font-bold">
                    <Store size={22} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-zinc-900 dark:text-white text-sm truncate">
                      {chunk.maps?.title}
                    </h4>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-1 mt-0.5">
                      {chunk.maps?.placeAnswerSources?.reviewSnippets?.[0]?.snippet || 'Serviço automotivo credenciado'}
                    </p>
                    <div className="flex items-center gap-2 mt-1.5 text-[10px] font-medium">
                      <span className="flex items-center gap-0.5 text-amber-500"><Star size={10} className="fill-amber-500"/> 4.8</span>
                      <span className="text-zinc-300 dark:text-zinc-600">•</span>
                      <span className="text-zinc-500 flex items-center gap-0.5"><MapPin size={10}/> 1.2 km</span>
                      <span className="text-zinc-300 dark:text-zinc-600">•</span>
                      <span className={getWorkshopStatus(chunk.maps?.title).color}>{getWorkshopStatus(chunk.maps?.title).label}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* MAP CANVAS AREA (Occupies remaining screen on Tablet/Desktop, Full Screen on Mobile) */}
        <div className="flex-1 relative z-0 overflow-hidden min-h-[350px] fix-map-container isolate">
          <div ref={mapContainerRef} className="absolute inset-0 w-full h-full z-0 overflow-hidden" />

          {/* Floating Re-Center GPS Button */}
          {location && (
            <button
              type="button"
              onClick={() => {
                if (mapInstanceRef.current && location) {
                  mapInstanceRef.current.setView([location.latitude, location.longitude], 15);
                }
              }}
              className="absolute top-3 right-3 z-20 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md text-zinc-800 dark:text-zinc-100 px-3 py-2 rounded-2xl shadow-lg border border-zinc-200 dark:border-zinc-700 hover:bg-indigo-50 dark:hover:bg-zinc-800 transition-all flex items-center gap-1.5 text-xs font-bold cursor-pointer"
              title="Centralizar no meu GPS"
            >
              <Navigation size={14} className="text-indigo-600 dark:text-indigo-400" />
              <span>Meu GPS</span>
            </button>
          )}
        </div>

        {/* MOBILE BOTTOM SHEET (ONLY ON MOBILE < 768px) */}
        <div 
          className={`md:hidden relative z-[60] z-bottom-sheet bg-white dark:bg-zinc-900 rounded-t-3xl shadow-[0_-10px_30px_rgba(0,0,0,0.15)] dark:shadow-[0_-10px_30px_rgba(0,0,0,0.5)] transition-all duration-300 ease-in-out border-t border-zinc-200 dark:border-zinc-800 flex flex-col shrink-0 ${
            isSheetOpen ? (selectedWorkshop ? 'h-[50vh]' : 'h-[35vh]') : 'h-12'
          }`}
        >
          {/* Drag Handle */}
          <div 
            className="w-full flex items-center justify-center p-3 cursor-pointer"
            onClick={() => setIsSheetOpen(!isSheetOpen)}
          >
            <div className="w-12 h-1.5 bg-zinc-300 dark:bg-zinc-700 rounded-full" />
          </div>

          <div className="flex-1 overflow-y-auto px-4 pb-6 scrollbar-none">
            {loading ? (
              <ServiceSkeleton title="Buscando locais..." subtitle="" count={2} />
            ) : selectedWorkshop ? (
              <div className="space-y-4 animate-fade-in">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-lg font-bold text-zinc-900 dark:text-white leading-tight">
                      {selectedWorkshop.maps?.title}
                    </h2>
                    <div className="flex items-center gap-3 mt-1">
                      <div className="flex items-center gap-1 text-amber-500 text-xs font-bold">
                        <Star size={12} className="fill-amber-500" />
                        4.8
                      </div>
                      <span className="text-xs text-zinc-500 flex items-center gap-1">
                        <MapPin size={12} /> 1.2 km
                      </span>
                      <span className={`text-xs font-medium ${getWorkshopStatus(selectedWorkshop.maps?.title).color}`}>{getWorkshopStatus(selectedWorkshop.maps?.title).label}</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleSelectWorkshopInternal(null)}
                    className="bg-zinc-100 dark:bg-zinc-800 p-1.5 rounded-full text-zinc-500"
                  >
                    <X size={16} />
                  </button>
                </div>

                <div className="flex gap-2">
                  {onSelectWorkshop && (
                    <button 
                      onClick={() => onSelectWorkshop(selectedWorkshop)}
                      className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                    >
                      <Store size={14} /> Ver Página
                    </button>
                  )}
                  <button 
                    onClick={() => onContact(selectedWorkshop.maps?.title || 'Oficina')}
                    className="flex-1 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 text-zinc-900 dark:text-white py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <MessageCircle size={14} /> Negociar
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-zinc-800 dark:text-zinc-200 px-1">
                  {filteredChunks.length} locais encontrados
                </h3>
                {filteredChunks.map((chunk, idx) => (
                  <div 
                    key={idx}
                    onClick={() => handleSelectWorkshopInternal(chunk)}
                    className="flex items-start gap-3 p-2.5 bg-zinc-50 dark:bg-zinc-800/40 rounded-xl cursor-pointer border border-zinc-200/50 dark:border-zinc-800"
                  >
                    <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 rounded-lg flex-shrink-0 flex items-center justify-center font-bold">
                      <Store size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-zinc-900 dark:text-white text-xs truncate">
                        {chunk.maps?.title}
                      </h4>
                      <p className="text-[11px] text-zinc-500 line-clamp-1">
                        {chunk.maps?.placeAnswerSources?.reviewSnippets?.[0]?.snippet || 'Oficina credenciada'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
