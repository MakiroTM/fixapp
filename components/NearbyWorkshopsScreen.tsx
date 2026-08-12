import React, { useState, useEffect, useRef } from 'react';
import { Search, Filter, MapPin, Navigation, Phone, MessageCircle, Heart, Handshake, Star, X, Info, Store } from 'lucide-react';
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
}

const getWorkshopStatus = (name: string = '') => {
  const hash = name.length;
  if (hash % 5 === 0) return { label: 'Fechado', color: 'text-red-500' };
  if (hash % 3 === 0) return { label: 'Ocupado', color: 'text-amber-500' };
  return { label: 'Aberto', color: 'text-emerald-500' };
};

export const NearbyWorkshopsScreen: React.FC<NearbyWorkshopsScreenProps> = ({ user, location, onBack, onContact, onSelectWorkshop }) => {
  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [vehicleFilter, setVehicleFilter] = useState('CARROS');
  const [mechanics, setMechanics] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedWorkshop, setSelectedWorkshop] = useState<GroundingChunk | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(true);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Layer[]>([]);

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
    
    // Append vehicle type for better grounding context
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

  // Map initialization and updates
  useEffect(() => {
    if (!mapContainerRef.current) return;
    
    if (!mapInstanceRef.current) {
      const centerLat = location?.latitude || -23.5505;
      const centerLng = location?.longitude || -46.6333;
      
      const map = L.map(mapContainerRef.current, {
        center: [centerLat, centerLng],
        zoom: 13,
        zoomControl: false, // hide default to place custom
      });
      L.control.zoom({ position: 'bottomright' }).addTo(map);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap',
      }).addTo(map);

      mapInstanceRef.current = map;

      if (location) {
        const userIcon = L.divIcon({
          className: 'custom-user-marker',
          html: `<div class="w-8 h-8 bg-blue-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center"><div class="w-3 h-3 bg-zinc-950 rounded-full"></div></div>`,
          iconSize: [32, 32],
          iconAnchor: [16, 16],
        });
        L.marker([location.latitude, location.longitude], { icon: userIcon }).addTo(map).bindPopup('Você está aqui');
      }
    }

    const map = mapInstanceRef.current;
    
    // Clear old markers
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    // We don't have lat/lng directly on chunk.maps, we only have URIs.
    // For visual simulation on the map, since we can't extract coordinates from the Google Maps URI easily here,
    // we will generate approximate coordinates around the user's location based on index.
    
    const baseLat = location?.latitude || -23.5505;
    const baseLng = location?.longitude || -46.6333;

    filteredChunks.forEach((chunk, index) => {
      // Simulate slightly different coordinates for each
      const radius = 0.015; // roughly 1.5km
      const angle = (index / filteredChunks.length) * Math.PI * 2;
      const lat = baseLat + Math.cos(angle) * radius * (Math.random() * 0.5 + 0.5);
      const lng = baseLng + Math.sin(angle) * radius * (Math.random() * 0.5 + 0.5);
      
      const isSelected = selectedWorkshop?.maps?.title === chunk.maps?.title;
      // Simulate open status (currently all are treated as open)
      const isOpen = true;
      
      const mechHtml = `
        <div class="relative w-8 h-8">
          ${isOpen ? '<div class="absolute inset-0 bg-rose-500 rounded-full animate-ping opacity-75"></div>' : ''}
          <div class="relative w-8 h-8 bg-rose-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center text-white"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg></div>
        </div>
      `;
      
      const activeHtml = `
        <div class="relative w-10 h-10 animate-bounce">
          ${isOpen ? '<div class="absolute inset-0 bg-blue-600 rounded-full animate-ping opacity-75"></div>' : ''}
          <div class="relative w-10 h-10 bg-blue-600 rounded-full border-2 border-white shadow-xl flex items-center justify-center text-white"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg></div>
        </div>
      `;

      const mechIcon = L.divIcon({
        className: 'custom-mech-marker',
        html: mechHtml,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const activeIcon = L.divIcon({
        className: 'custom-active-marker',
        html: activeHtml,
        iconSize: [40, 40],
        iconAnchor: [20, 40],
      });
      
      const marker = L.marker([lat, lng], { icon: isSelected ? activeIcon : mechIcon }).addTo(map);
      marker.on('click', () => {
        setSelectedWorkshop(chunk);
        setIsSheetOpen(true);
        map.setView([lat, lng], 15, { animate: true });
      });
      markersRef.current.push(marker);
    });

    setTimeout(() => {
      map.invalidateSize();
    }, 300);

  }, [filteredChunks, location, selectedWorkshop]);

  return (
    <div className="flex-1 flex flex-col relative w-full h-full overflow-hidden bg-zinc-950">
      {/* Top Search Bar & Filters (Floating over map) */}
      <div className="absolute top-0 left-0 right-0 z-[1000] p-4 bg-gradient-to-b from-zinc-950/90 to-transparent pt-[env(safe-area-inset-top,1rem)]">
        <div className="max-w-md mx-auto space-y-3">
          <div className="flex items-center gap-2">
            <button 
              onClick={onBack}
              className="p-2.5 bg-zinc-900 rounded-xl shadow-lg border border-zinc-800 text-zinc-300 hover:bg-zinc-800 transition-colors"
            >
              <X size={20} />
            </button>
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Buscar oficinas, borracharias..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch(query, activeFilter, vehicleFilter)}
                className="w-full bg-zinc-900 rounded-xl shadow-lg border border-zinc-800 py-2.5 pl-10 pr-4 text-sm text-white outline-none focus:border-blue-500 transition-colors placeholder:text-zinc-500"
              />
              <Search className="absolute left-3 top-3 text-zinc-400" size={16} />
            </div>
          </div>
          
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            {['ALL', 'MECANICA', 'GUINCHO', 'ELETRICA', 'PNEU'].map((filter) => (
              <button
                key={filter}
                onClick={() => handleSearch(query, filter, vehicleFilter)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap shadow-md transition-colors ${
                  activeFilter === filter
                    ? 'bg-blue-600 text-white border border-blue-500'
                    : 'bg-zinc-900 text-zinc-400 border border-zinc-800 hover:bg-zinc-800'
                }`}
              >
                {filter === 'ALL' ? 'Todos os Serviços' : filter === 'MECANICA' ? 'Mecânica' : filter === 'GUINCHO' ? 'Guincho' : filter === 'ELETRICA' ? 'Elétrica' : 'Borracharia'}
              </button>
            ))}
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
            {['CARROS', 'MOTOS', 'CAMINHÕES', 'ELÉTRICOS'].map((vehicle) => (
              <button
                key={vehicle}
                onClick={() => handleSearch(query, activeFilter, vehicle)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap shadow-md transition-colors ${
                  vehicleFilter === vehicle
                    ? 'bg-blue-600 text-white border border-blue-500'
                    : 'bg-zinc-900 text-zinc-400 border border-zinc-800 hover:bg-zinc-800'
                }`}
              >
                {vehicle === 'CARROS' ? 'Carros' : vehicle === 'MOTOS' ? 'Motos' : vehicle === 'CAMINHÕES' ? 'Caminhões' : 'Elétricos'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Map Container - 60% height visually, but it takes 100% and bottom sheet covers it */}
      <div className="flex-1 relative z-0">
        <div ref={mapContainerRef} className="w-full h-full" />
      </div>

      {/* Bottom Sheet */}
      <div 
        className={`absolute bottom-[env(safe-area-inset-bottom,4rem)] left-0 right-0 z-[1000] bg-zinc-950 rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.5)] transition-all duration-300 ease-in-out border-t border-zinc-800 flex flex-col pb-20 ${
          isSheetOpen ? (selectedWorkshop ? 'h-[65vh]' : 'h-[45vh]') : 'h-24'
        }`}
      >
        {/* Drag Handle */}
        <div 
          className="w-full flex items-center justify-center p-3 cursor-pointer"
          onClick={() => setIsSheetOpen(!isSheetOpen)}
        >
          <div className="w-12 h-1.5 bg-zinc-700 rounded-full" />
        </div>

        <div className="flex-1 overflow-y-auto px-4 sm:px-6 pb-6 scrollbar-none">
          {loading ? (
            <ServiceSkeleton title="Buscando locais..." subtitle="" count={2} />
          ) : selectedWorkshop ? (
            <div className="space-y-5 animate-fade-in">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-bold text-white leading-tight">
                    {selectedWorkshop.maps?.title}
                  </h2>
                  <div className="flex items-center gap-3 mt-1.5">
                    <div className="flex items-center gap-1 text-amber-500 text-sm font-bold">
                      <Star size={14} className="fill-amber-500" />
                      4.8
                    </div>
                    <span className="text-xs text-zinc-400 flex items-center gap-1">
                      <MapPin size={12} /> 1.2 km
                    </span>
                    <span className={`text-xs font-medium ${getWorkshopStatus(selectedWorkshop.maps?.title).color}`}>{getWorkshopStatus(selectedWorkshop.maps?.title).label}</span>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedWorkshop(null)}
                  className="bg-zinc-800 p-2 rounded-full text-zinc-500 hover:text-white"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="flex gap-2">
                {onSelectWorkshop && (
                  <button 
                    onClick={() => onSelectWorkshop(selectedWorkshop)}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-colors shadow-md"
                  >
                    <Store size={16} /> Ver Página
                  </button>
                )}
                <button 
                  onClick={() => onContact(selectedWorkshop.maps?.title || 'Oficina')}
                  className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-colors border border-zinc-700"
                >
                  <MessageCircle size={16} /> Negociar
                </button>
              </div>

              <div className="flex justify-around py-4 border-y border-zinc-800/60">
                <button className="flex flex-col items-center gap-1.5 text-zinc-400 hover:text-blue-500 transition-colors">
                  <div className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                    <Phone size={18} />
                  </div>
                  <span className="text-[10px] font-medium">Ligar</span>
                </button>
                <button className="flex flex-col items-center gap-1.5 text-zinc-400 hover:text-emerald-500 transition-colors">
                  <div className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                    <MessageCircle size={18} />
                  </div>
                  <span className="text-[10px] font-medium">WhatsApp</span>
                </button>
                <button className="flex flex-col items-center gap-1.5 text-zinc-400 hover:text-rose-500 transition-colors">
                  <div className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                    <Heart size={18} />
                  </div>
                  <span className="text-[10px] font-medium">Favoritar</span>
                </button>
                <button className="flex flex-col items-center gap-1.5 text-zinc-400 hover:text-amber-500 transition-colors">
                  <div className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                    <Handshake size={18} />
                  </div>
                  <span className="text-[10px] font-medium">Parceiro</span>
                </button>
              </div>

              <div>
                <h3 className="text-sm font-bold text-white mb-2">Sobre</h3>
                <p className="text-sm text-zinc-400 leading-relaxed">
                  {selectedWorkshop.maps?.placeAnswerSources?.reviewSnippets?.[0]?.snippet || 
                   'Oficina especializada com anos de experiência no mercado. Atendimento rápido e garantido.'}
                </p>
              </div>
              
              <div className="bg-zinc-900 p-3 rounded-xl border border-zinc-800">
                <div className="flex items-start gap-2 text-sm text-zinc-400">
                  <Info size={16} className="mt-0.5 text-blue-500" />
                  <p>Aceita pagamentos pelo app via Pix e Cartão. Possui scanner automotivo e ferramentas modernas.</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-white px-1">
                {filteredChunks.length} locais encontrados
              </h3>
              {filteredChunks.length === 0 && !loading && (
                <div className="text-center py-8 text-zinc-500 text-sm">
                  Nenhum local encontrado para esta categoria.
                </div>
              )}
              {filteredChunks.map((chunk, idx) => (
                <div 
                  key={idx}
                  onClick={() => setSelectedWorkshop(chunk)}
                  className="flex items-start gap-3 p-3 bg-zinc-900 hover:bg-zinc-800 rounded-2xl cursor-pointer transition-colors border border-transparent hover:border-zinc-700 relative group"
                >
                  <div className="w-16 h-16 bg-zinc-800 rounded-xl flex-shrink-0 flex items-center justify-center text-zinc-400">
                    <Store size={24} />
                  </div>
                  <div className="flex-1 min-w-0 pr-12">
                    <h4 className="font-bold text-white text-sm truncate">
                      {chunk.maps?.title}
                    </h4>
                    <p className="text-xs text-zinc-400 line-clamp-1 mt-0.5">
                      {chunk.maps?.placeAnswerSources?.reviewSnippets?.[0]?.snippet}
                    </p>
                    <div className="flex items-center gap-2 mt-1.5 text-[10px] font-medium">
                      <span className="flex items-center gap-0.5 text-amber-500"><Star size={10} className="fill-amber-500"/> 4.8</span>
                      <span className="text-zinc-400">•</span>
                      <span className="text-zinc-400 flex items-center gap-0.5"><MapPin size={10}/> 1.2 km</span>
                      <span className="text-zinc-400">•</span>
                      <span className={getWorkshopStatus(chunk.maps?.title).color}>{getWorkshopStatus(chunk.maps?.title).label}</span>
                    </div>
                  </div>
                  <a
                    href="tel:0800000000"
                    onClick={(e) => e.stopPropagation()}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center hover:bg-emerald-200 dark:hover:bg-emerald-500/30 transition-colors shadow-sm"
                    title="Ligar agora"
                  >
                    <Phone size={18} fill="currentColor" />
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
