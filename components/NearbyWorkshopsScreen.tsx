import React, { useState, useEffect, useRef } from 'react';
import { Search, Filter, MapPin, Navigation, Phone, MessageCircle, Heart, Handshake, Star, X, Info, Store, Key, AlertCircle } from 'lucide-react';
import { Loader } from '@googlemaps/js-api-loader';
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

const GOOGLE_MAPS_KEY =
  process.env.GOOGLE_MAPS_PLATFORM_KEY ||
  (import.meta as any).env?.VITE_GOOGLE_MAPS_PLATFORM_KEY ||
  (globalThis as any).GOOGLE_MAPS_PLATFORM_KEY ||
  '';

let globalLoader: Loader | null = null;

function getMapsLoader(key: string) {
  if (!globalLoader) {
    globalLoader = new Loader({
      apiKey: key || 'YOUR_API_KEY',
      version: 'weekly',
      libraries: ['places', 'geometry', 'marker']
    });
  }
  return globalLoader;
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
  const [mapLoaded, setMapLoaded] = useState(false);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);

  const hasValidKey = Boolean(GOOGLE_MAPS_KEY) && GOOGLE_MAPS_KEY !== 'YOUR_API_KEY';

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

  // Google Maps Initialization via @googlemaps/js-api-loader
  useEffect(() => {
    if (!mapContainerRef.current) return;
    let isMounted = true;

    const loader = getMapsLoader(GOOGLE_MAPS_KEY);

    (loader as any).load().then(() => {
      if (!isMounted || !mapContainerRef.current) return;

      if (!mapInstanceRef.current) {
        const centerLat = location?.latitude || -23.5505;
        const centerLng = location?.longitude || -46.6333;

        const map = new google.maps.Map(mapContainerRef.current, {
          center: { lat: centerLat, lng: centerLng },
          zoom: 13,
          mapId: 'DEMO_MAP_ID',
          zoomControl: true,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
          gestureHandling: 'greedy', // Seamless touch drag and pinch-zoom on Android / mobile
          clickableIcons: false,
        });

        mapInstanceRef.current = map;
        setMapLoaded(true);
      }
    }).catch(err => {
      console.error("Falha ao carregar Google Maps API:", err);
    });

    return () => {
      isMounted = false;
    };
  }, []);

  // Center map on user location ONCE when location becomes available, without constantly resetting camera while user explores
  const hasCenteredUserRef = useRef(false);
  useEffect(() => {
    if (location && mapInstanceRef.current && !hasCenteredUserRef.current) {
      mapInstanceRef.current.panTo({ lat: location.latitude, lng: location.longitude });
      mapInstanceRef.current.setZoom(14);
      hasCenteredUserRef.current = true;
    }
  }, [location, mapLoaded]);

  // Update Markers on Map
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !mapLoaded) return;

    // Clear old markers
    markersRef.current.forEach(m => m.setMap(null));
    markersRef.current = [];

    const baseLat = location?.latitude || -23.5505;
    const baseLng = location?.longitude || -46.6333;

    // Add User Marker
    if (location) {
      const userMarker = new google.maps.Marker({
        position: { lat: location.latitude, lng: location.longitude },
        map,
        title: 'Você está aqui',
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 9,
          fillColor: '#3b82f6',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 3,
        }
      });
      const userInfoWindow = new google.maps.InfoWindow({
        content: '<div style="font-weight:bold;font-family:sans-serif;padding:2px;font-size:12px;">Você está aqui</div>'
      });
      userMarker.addListener('click', () => {
        userInfoWindow.open(map, userMarker);
      });
      markersRef.current.push(userMarker);
    }

    filteredChunks.forEach((chunk, index) => {
      const radius = 0.015;
      const angle = (index / Math.max(filteredChunks.length, 1)) * Math.PI * 2;
      const lat = baseLat + Math.cos(angle) * radius * (Math.random() * 0.4 + 0.6);
      const lng = baseLng + Math.sin(angle) * radius * (Math.random() * 0.4 + 0.6);

      const isSelected = selectedWorkshop?.maps?.title === chunk.maps?.title;

      const marker = new google.maps.Marker({
        position: { lat, lng },
        map,
        title: chunk.maps?.title || 'Oficina',
        icon: {
          path: google.maps.SymbolPath.BACKWARD_CLOSED_ARROW,
          scale: isSelected ? 8 : 6,
          fillColor: isSelected ? '#4f46e5' : '#f43f5e',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 2,
        },
        animation: isSelected ? google.maps.Animation.BOUNCE : undefined
      });

      marker.addListener('click', () => {
        setSelectedWorkshop(chunk);
        setIsSheetOpen(true);
        map.panTo({ lat, lng });
        map.setZoom(15);
      });

      markersRef.current.push(marker);
    });

  }, [filteredChunks, location, selectedWorkshop, mapLoaded]);

  return (
    <div className="relative flex-1 flex flex-col w-full h-[calc(100vh-3.5rem)] sm:h-[calc(100vh-4rem)] overflow-hidden bg-white dark:bg-zinc-950 z-0">
      
      {/* API Key Missing Notice Header if no GOOGLE_MAPS_PLATFORM_KEY */}
      {!hasValidKey && (
        <div className="bg-amber-500/10 border-b border-amber-500/30 p-2 z-20 text-xs text-amber-700 dark:text-amber-300 flex items-center justify-between gap-2 px-4 shrink-0">
          <div className="flex items-center gap-2">
            <AlertCircle size={16} className="text-amber-500 flex-shrink-0" />
            <span>Chave do Google Maps não configurada (<code>GOOGLE_MAPS_PLATFORM_KEY</code>).</span>
          </div>
          <span className="text-[11px] font-semibold bg-amber-500/20 px-2 py-0.5 rounded text-amber-800 dark:text-amber-200">
            Configurar em Secrets ⚙️
          </span>
        </div>
      )}

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

      {/* Top Search Bar & Filters */}
      <div className="relative z-20 p-3 sm:p-4 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 shadow-sm shrink-0">
        <div className="max-w-md mx-auto space-y-2.5">
          <div className="flex items-center gap-2">
            <button 
              onClick={onBack}
              className="p-2.5 bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-300 transition-colors cursor-pointer"
              title="Voltar ao início"
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
                className="w-full bg-zinc-50 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 py-2 pl-9 pr-4 text-xs sm:text-sm outline-none focus:border-indigo-500 text-zinc-900 dark:text-white transition-colors"
              />
              <Search className="absolute left-3 top-2.5 text-zinc-400" size={16} />
            </div>
          </div>
          
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            {['ALL', 'MECANICA', 'GUINCHO', 'ELETRICA', 'PNEU'].map((filter) => (
              <button
                key={filter}
                onClick={() => handleSearch(query, filter, vehicleFilter)}
                className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap shadow-xs transition-colors cursor-pointer ${
                  activeFilter === filter
                    ? 'bg-indigo-600 text-white border border-indigo-500'
                    : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-800'
                }`}
              >
                {filter === 'ALL' ? 'Todos os Serviços' : filter === 'MECANICA' ? 'Mecânica' : filter === 'GUINCHO' ? 'Guincho' : filter === 'ELETRICA' ? 'Elétrica' : 'Borracharia'}
              </button>
            ))}
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            {['CARROS', 'MOTOS', 'CAMINHÕES', 'ELÉTRICOS'].map((vehicle) => (
              <button
                key={vehicle}
                onClick={() => handleSearch(query, activeFilter, vehicle)}
                className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap shadow-xs transition-colors cursor-pointer ${
                  vehicleFilter === vehicle
                    ? 'bg-emerald-600 text-white border border-emerald-500'
                    : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-800'
                }`}
              >
                {vehicle === 'CARROS' ? 'Carros' : vehicle === 'MOTOS' ? 'Motos' : vehicle === 'CAMINHÕES' ? 'Caminhões' : 'Elétricos'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Map Canvas Area */}
      <div className="flex-1 relative z-0 overflow-hidden min-h-[320px]">
        <div ref={mapContainerRef} className="absolute inset-0 w-full h-full z-0" />

        {/* Floating Manual Re-Center on GPS Button */}
        {location && (
          <button
            type="button"
            onClick={() => {
              if (mapInstanceRef.current && location) {
                mapInstanceRef.current.panTo({ lat: location.latitude, lng: location.longitude });
                mapInstanceRef.current.setZoom(15);
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

      {/* Bottom Sheet */}
      <div 
        className={`relative z-30 bg-white dark:bg-zinc-900 rounded-t-3xl shadow-[0_-10px_30px_rgba(0,0,0,0.15)] dark:shadow-[0_-10px_30px_rgba(0,0,0,0.5)] transition-all duration-300 ease-in-out border-t border-zinc-200 dark:border-zinc-800 flex flex-col shrink-0 ${
          isSheetOpen ? (selectedWorkshop ? 'h-[50vh] sm:h-[45vh]' : 'h-[35vh] sm:h-[30vh]') : 'h-12'
        }`}
      >
        {/* Drag Handle */}
        <div 
          className="w-full flex items-center justify-center p-3 cursor-pointer"
          onClick={() => setIsSheetOpen(!isSheetOpen)}
        >
          <div className="w-12 h-1.5 bg-zinc-300 dark:bg-zinc-700 rounded-full" />
        </div>

        <div className="flex-1 overflow-y-auto px-4 sm:px-6 pb-6 scrollbar-none">
          {loading ? (
            <ServiceSkeleton title="Buscando locais..." subtitle="" count={2} />
          ) : selectedWorkshop ? (
            <div className="space-y-5 animate-fade-in">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-bold text-zinc-900 dark:text-white leading-tight">
                    {selectedWorkshop.maps?.title}
                  </h2>
                  <div className="flex items-center gap-3 mt-1.5">
                    <div className="flex items-center gap-1 text-amber-500 text-sm font-bold">
                      <Star size={14} className="fill-amber-500" />
                      4.8
                    </div>
                    <span className="text-xs text-zinc-500 flex items-center gap-1">
                      <MapPin size={12} /> 1.2 km
                    </span>
                    <span className={`text-xs font-medium ${getWorkshopStatus(selectedWorkshop.maps?.title).color}`}>{getWorkshopStatus(selectedWorkshop.maps?.title).label}</span>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedWorkshop(null)}
                  className="bg-zinc-100 dark:bg-zinc-800 p-2 rounded-full text-zinc-500 hover:text-zinc-800 dark:hover:text-white"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="flex gap-2">
                {onSelectWorkshop && (
                  <button 
                    onClick={() => onSelectWorkshop(selectedWorkshop)}
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-colors shadow-md"
                  >
                    <Store size={16} /> Ver Página
                  </button>
                )}
                <button 
                  onClick={() => onContact(selectedWorkshop.maps?.title || 'Oficina')}
                  className="flex-1 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-900 dark:text-white py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-colors"
                >
                  <MessageCircle size={16} /> Negociar
                </button>
              </div>

              <div className="flex justify-around py-2 border-y border-zinc-100 dark:border-zinc-800">
                <button className="flex flex-col items-center gap-1 text-zinc-500 hover:text-indigo-600 transition-colors">
                  <Phone size={20} />
                  <span className="text-[10px] font-medium">Ligar</span>
                </button>
                <button className="flex flex-col items-center gap-1 text-zinc-500 hover:text-emerald-500 transition-colors">
                  <MessageCircle size={20} />
                  <span className="text-[10px] font-medium">WhatsApp</span>
                </button>
                <button className="flex flex-col items-center gap-1 text-zinc-500 hover:text-rose-500 transition-colors">
                  <Heart size={20} />
                  <span className="text-[10px] font-medium">Favoritar</span>
                </button>
                <button className="flex flex-col items-center gap-1 text-zinc-500 hover:text-amber-500 transition-colors">
                  <Handshake size={20} />
                  <span className="text-[10px] font-medium">Parceiro FIX</span>
                </button>
              </div>

              <div>
                <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-200 mb-2">Sobre</h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  {selectedWorkshop.maps?.placeAnswerSources?.reviewSnippets?.[0]?.snippet || 
                   'Oficina especializada com anos de experiência no mercado. Atendimento rápido e garantido.'}
                </p>
              </div>
              
              <div className="bg-zinc-50 dark:bg-zinc-800/50 p-3 rounded-xl border border-zinc-100 dark:border-zinc-800">
                <div className="flex items-start gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                  <Info size={16} className="mt-0.5 text-indigo-500" />
                  <p>Aceita pagamentos pelo app via Pix e Cartão. Possui scanner automotivo e ferramentas modernas.</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-200 px-1">
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
                  className="flex items-start gap-3 p-3 bg-zinc-50 dark:bg-zinc-800/40 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-2xl cursor-pointer transition-colors border border-transparent hover:border-zinc-200 dark:hover:border-zinc-700 relative group"
                >
                  <div className="w-16 h-16 bg-zinc-200 dark:bg-zinc-700 rounded-xl flex-shrink-0 flex items-center justify-center text-zinc-400">
                    <Store size={24} />
                  </div>
                  <div className="flex-1 min-w-0 pr-12">
                    <h4 className="font-bold text-zinc-900 dark:text-white text-sm truncate">
                      {chunk.maps?.title}
                    </h4>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-1 mt-0.5">
                      {chunk.maps?.placeAnswerSources?.reviewSnippets?.[0]?.snippet}
                    </p>
                    <div className="flex items-center gap-2 mt-1.5 text-[10px] font-medium">
                      <span className="flex items-center gap-0.5 text-amber-500"><Star size={10} className="fill-amber-500"/> 4.8</span>
                      <span className="text-zinc-300 dark:text-zinc-600">•</span>
                      <span className="text-zinc-500 flex items-center gap-0.5"><MapPin size={10}/> 1.2 km</span>
                      <span className="text-zinc-300 dark:text-zinc-600">•</span>
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
