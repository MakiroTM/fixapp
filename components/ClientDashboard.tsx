import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Hero } from './Hero';
import { SearchForm } from './SearchForm';
import { ResultCard } from './ResultCard';
import { ChatInterface } from './ChatInterface';
import { StatusIndicator } from './StatusIndicator';
import { EtaWidget } from './EtaWidget';
import { PaymentSimulation } from './PaymentSimulation';
import { ServiceRatingModal } from './ServiceRatingModal';
import { ServiceSkeleton } from './ServiceSkeleton';
import { RouteModal } from './RouteModal';
import { findMechanics } from '../services/geminiService';
import { calculateDynamicETA } from '../services/locationUtils';
import { VehicleType, ServiceType, Coordinates, SearchResult, User, ChatMessage, ActiveServiceRequest, ServiceStatus } from '../types';
import { AlertCircle, Compass, MapPin, MessageCircle, Navigation, Clock, CheckCircle2, ChevronRight, X, Filter, Layers, Sparkles, SlidersHorizontal, Star } from 'lucide-react';

interface ClientDashboardProps {
  user: User;
  onUpgrade: () => void;
  onSosClick?: () => void;
  location: Coordinates | null;
  locationError: string | null;
  isDetectingLocation: boolean;
}

export const ClientDashboard: React.FC<ClientDashboardProps> = ({ 
  user, 
  onUpgrade,
  onSosClick,
  location,
  locationError,
  isDetectingLocation
}) => {
  // State for manual search
  const [isLoading, setIsLoading] = useState(false);
  const [searchResult, setSearchResult] = useState<SearchResult | null>(null);
  const [initialService, setInitialService] = useState<ServiceType | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);

  // State for nearby mechanics (auto-load)
  const [nearbyMechanics, setNearbyMechanics] = useState<SearchResult | null>(null);
  const [loadingNearby, setLoadingNearby] = useState(false);

  // Active Service Request State
  const [activeRequest, setActiveRequest] = useState<ActiveServiceRequest | null>(null);

  // Chat State
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatRecipient, setChatRecipient] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);

  // Service Rating Modal State
  const [isRatingModalOpen, setIsRatingModalOpen] = useState<boolean>(false);
  const [ratingMechanicName, setRatingMechanicName] = useState<string>('Mecânico Parceiro FIX');
  const [ratingServiceType, setRatingServiceType] = useState<string>('Atendimento Automotivo');

  // Active Request Route Modal
  const [isActiveRouteOpen, setIsActiveRouteOpen] = useState<boolean>(false);

  // Category filter state for service list with layout transitions
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [isFilterAnimating, setIsFilterAnimating] = useState<boolean>(false);

  // Trigger smooth layout transition when category or location filters change
  const handleCategoryFilterChange = (filterKey: string) => {
    if (categoryFilter === filterKey) return;
    setIsFilterAnimating(true);
    setCategoryFilter(filterKey);
    setTimeout(() => {
      setIsFilterAnimating(false);
    }, 180);
  };

  // Fetch nearby mechanics automatically once location is found
  useEffect(() => {
    if (location && !nearbyMechanics && !loadingNearby) {
      console.log('[DEBUG ClientDashboard] Auto-fetching nearby mechanics with location:', {
        lat: location.latitude,
        lng: location.longitude
      });
      setLoadingNearby(true);
      findMechanics(
        "Listar todas as oficinas mecânicas disponíveis na região",
        VehicleType.CAR,
        ServiceType.MAINTENANCE,
        location
      )
      .then((result) => {
        console.log('[DEBUG ClientDashboard] Auto-fetch nearby mechanics succeeded:', {
          chunksCount: result.groundingChunks?.length || 0,
          hasText: !!result.text
        });
        setNearbyMechanics(result);
      })
      .catch((e) => console.error("[DEBUG ClientDashboard] Auto fetch failed:", e))
      .finally(() => setLoadingNearby(false));
    }
  }, [location]);

  const handleSearch = async (
    vehicle: VehicleType, 
    service: ServiceType, 
    query: string,
    carModel: string,
    problemCategory: string
  ) => {
    console.log('[DEBUG ClientDashboard] handleSearch initiated', {
      vehicle,
      service,
      query,
      carModel,
      problemCategory,
      location: location ? `${location.latitude}, ${location.longitude}` : 'GPS unavailable',
      timestamp: new Date().toISOString()
    });

    setIsLoading(true);
    setError(null);
    setSearchResult(null);
    setCategoryFilter('ALL');
    try {
      let effectiveQuery = query.trim();
      if (!effectiveQuery && problemCategory) {
        effectiveQuery = `Problema reportado: ${problemCategory}`;
      } else if (!effectiveQuery && !problemCategory) {
        effectiveQuery = `Preciso de serviço de ${service}`;
      }

      console.log('[DEBUG ClientDashboard] Executing findMechanics with effective query:', effectiveQuery);
      
      const result = await findMechanics(effectiveQuery, vehicle, service, location, carModel, problemCategory);
      
      console.log('[DEBUG ClientDashboard] Search completed successfully', {
        textSnippet: result.text ? result.text.substring(0, 100) + '...' : 'empty',
        groundingChunksCount: result.groundingChunks?.length || 0,
        mapTitles: result.groundingChunks?.map(c => c.maps?.title)
      });

      setSearchResult(result);
      
      // Auto-scroll to search results section
      setTimeout(() => {
        const resultsElement = document.getElementById('search-results-section');
        if (resultsElement) {
          resultsElement.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } catch (err: any) {
      console.error("[DEBUG ClientDashboard Error] Exception caught during search:", {
        message: err?.message,
        stack: err?.stack,
        errorObj: err
      });
      setError("Ocorreu um erro ao buscar as informações. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmergencyClick = () => {
    if (onSosClick) {
      onSosClick();
      return;
    }
    setInitialService(ServiceType.EMERGENCY);
    const formElement = document.querySelector('form');
    if (formElement) {
      formElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleContact = (name: string) => {
    setChatRecipient(name);
    setChatMessages([
      {
        id: '1',
        text: `Olá, encontrei o ${name} pelo aplicativo FIX. Gostaria de solicitar atendimento para o meu veículo.`,
        sender: 'me',
        timestamp: new Date()
      }
    ]);
    
    // Calculate dynamic ETA based on location
    const etaCalc = calculateDynamicETA(location, null);

    // Create active service request for tracking
    setActiveRequest({
      id: 'req-' + Date.now(),
      clientName: user.name,
      mechanicName: name,
      vehicleInfo: user.vehicleModel || 'Veículo Registrado',
      serviceType: 'Solicitação de Atendimento',
      status: 'PENDING',
      updatedAt: new Date(),
      estimatedArrival: etaCalc.formattedEta,
      distanceKm: etaCalc.distanceKm,
      etaMinutes: etaCalc.etaMinutes,
      trafficCondition: etaCalc.trafficCondition,
      mechanicCoords: etaCalc.mechanicCoords,
      clientCoords: location || undefined,
      paymentStatus: 'UNPAID',
      servicePrice: 180.00
    });

    setIsChatOpen(true);
  };

  return (
    <>
      <Hero onEmergencyClick={handleEmergencyClick} onPrimeClick={onUpgrade} />
      
      <main className="w-full max-w-4xl mx-auto px-3 sm:px-4 relative z-10 pb-20 -mt-6 sm:-mt-8">
        
        {/* Subtle GPS Status Pill */}
        <div className="flex justify-center mb-3 relative z-30">
          {isDetectingLocation ? (
            <div className="inline-flex items-center gap-1.5 bg-zinc-800/90 text-zinc-300 px-3 py-0.5 rounded-full text-[11px] font-medium border border-zinc-700/60 backdrop-blur-md shadow-sm">
              <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-ping" />
              <span>Buscando GPS...</span>
            </div>
          ) : location ? (
            <div className="inline-flex items-center gap-1.5 bg-emerald-950/80 text-emerald-300 px-3 py-0.5 rounded-full text-[11px] font-medium border border-emerald-800/60 backdrop-blur-md shadow-sm">
              <Compass size={11} className="text-emerald-400" />
              <span>GPS Ativo</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-1.5 bg-zinc-800/90 text-zinc-400 px-3 py-0.5 rounded-full text-[11px] font-medium border border-zinc-700/60 backdrop-blur-md shadow-sm">
              <div className="w-1.5 h-1.5 bg-zinc-500 rounded-full" />
              <span>GPS Desativado</span>
            </div>
          )}
        </div>

        {/* Geolocation Error Alert */}
        {locationError && (
          <div className="mb-4 p-3 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 rounded-xl border border-rose-200 dark:border-rose-800/50 flex items-center gap-2.5 text-xs animate-fade-in relative z-30 max-w-3xl mx-auto">
            <AlertCircle className="flex-shrink-0 text-rose-500" size={18} />
            <p className="leading-tight">{locationError}. Ative o GPS para resultados mais precisos.</p>
          </div>
        )}

        {/* Search Error Alert */}
        {error && (
          <div className="mb-4 p-3 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 rounded-xl border border-rose-200 dark:border-rose-800/50 flex items-center gap-2.5 text-xs animate-fade-in relative z-30 max-w-3xl mx-auto">
            <AlertCircle className="flex-shrink-0 text-rose-500" size={18} />
            <p className="leading-tight">{error}</p>
          </div>
        )}

        {/* Active Service Request Tracking Card */}
        {activeRequest && (
          <div className="mb-8 bg-zinc-900 text-white rounded-2xl p-5 sm:p-6 border border-indigo-500/40 shadow-2xl shadow-indigo-900/30 animate-pop-in space-y-4 relative z-30">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-indigo-600 rounded-xl text-white">
                  <Clock size={20} className="animate-spin" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Acompanhamento em Tempo Real</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                  </div>
                  <h3 className="text-lg font-black text-white">{activeRequest.mechanicName}</h3>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <StatusIndicator status={activeRequest.status} variant="badge" />
                <button
                  onClick={() => setActiveRequest(null)}
                  className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
                  title="Ocultar do Dashboard"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Stepper Progress Visual Indicator */}
            <StatusIndicator 
              status={activeRequest.status} 
              variant="full" 
              isEditable={true}
              onStatusChange={(newStatus) => {
                setActiveRequest(prev => prev ? { ...prev, status: newStatus } : null);
                if (newStatus === 'COMPLETED') {
                  setRatingMechanicName(activeRequest.mechanicName);
                  setRatingServiceType(activeRequest.serviceType);
                  setIsRatingModalOpen(true);

                  // Record completed service in maintenanceHistory localStorage
                  try {
                    const currentHistory = JSON.parse(localStorage.getItem('maintenanceHistory') || '[]');
                    const exists = currentHistory.some((item: any) => item.id === activeRequest.id || item.receiptId === activeRequest.receiptId);
                    if (!exists) {
                      const newRecord = {
                        id: activeRequest.id || `FIX-${Math.floor(1000 + Math.random() * 9000)}`,
                        serviceType: activeRequest.serviceType,
                        mechanicName: activeRequest.mechanicName,
                        vehicleInfo: activeRequest.vehicleInfo || 'Veículo do Cliente',
                        date: new Date().toLocaleDateString('pt-BR'),
                        price: activeRequest.servicePrice || 180.00,
                        paymentMethod: activeRequest.paymentMethod || 'PIX',
                        status: 'COMPLETED',
                        rating: 5,
                        notes: `Atendimento concluído via aplicativo FIX em ${activeRequest.locationInfo || 'Localização enviada'}.`,
                        receiptId: activeRequest.receiptId || `REC-${Date.now().toString().slice(-8)}`
                      };
                      localStorage.setItem('maintenanceHistory', JSON.stringify([newRecord, ...currentHistory]));
                      window.dispatchEvent(new Event('maintenanceHistoryUpdated'));
                    }
                  } catch (e) {
                    console.error('Error saving completed service to history:', e);
                  }
                }
              }}
            />

            {/* Rate Mechanic Button if service is completed */}
            {activeRequest.status === 'COMPLETED' && (
              <button
                onClick={() => {
                  setRatingMechanicName(activeRequest.mechanicName);
                  setRatingServiceType(activeRequest.serviceType);
                  setIsRatingModalOpen(true);
                }}
                className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold rounded-2xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/25 cursor-pointer transition-all animate-pulse"
              >
                <Star className="fill-white" size={18} />
                Avaliar Atendimento de {activeRequest.mechanicName}
              </button>
            )}

            {/* Dynamic Estimated Time of Arrival (ETA) Display */}
            <EtaWidget 
              status={activeRequest.status}
              userCoords={location}
              mechanicCoords={activeRequest.mechanicCoords}
              initialEtaMinutes={activeRequest.etaMinutes}
              initialDistanceKm={activeRequest.distanceKm}
              trafficCondition={activeRequest.trafficCondition}
            />

            {/* Simplified Payment Simulation Flow */}
            <PaymentSimulation 
              servicePrice={activeRequest.servicePrice || 180.00}
              paymentStatus={activeRequest.paymentStatus || 'UNPAID'}
              paymentMethod={activeRequest.paymentMethod || 'PIX'}
              receiptId={activeRequest.receiptId}
              mechanicName={activeRequest.mechanicName}
              serviceType={activeRequest.serviceType}
              onPaymentSuccess={(method, receiptId) => {
                setActiveRequest(prev => prev ? {
                  ...prev,
                  paymentStatus: 'PAID',
                  paymentMethod: method,
                  receiptId: receiptId
                } : null);

                // Send payment confirmation message into chat
                setChatMessages(prev => [
                  ...prev,
                  {
                    id: Date.now().toString(),
                    text: `✅ **Pagamento Confirmado!**\nComprovante: \`${receiptId}\`\nForma de Pagamento: ${method}\n\n*O valor de R$ ${(activeRequest.servicePrice || 180.00).toFixed(2)} foi processado com sucesso.*`,
                    sender: 'me',
                    timestamp: new Date()
                  }
                ]);
              }}
            />

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <div className="text-xs text-zinc-400 flex items-center gap-4">
                <span>Veículo: <strong className="text-zinc-200">{activeRequest.vehicleInfo}</strong></span>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setIsActiveRouteOpen(true)}
                  className="flex-1 sm:flex-initial bg-zinc-800 hover:bg-zinc-700 text-indigo-300 border border-indigo-500/30 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Navigation size={16} />
                  <span>Ver Rota In-App</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setChatRecipient(activeRequest.mechanicName);
                    setIsChatOpen(true);
                  }}
                  className="flex-1 sm:flex-initial bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-md shadow-indigo-600/30 cursor-pointer"
                >
                  <MessageCircle size={16} />
                  <span>Abrir Chat & Detalhes</span>
                </button>
              </div>
            </div>

            {/* In-App Route Modal for Active Request */}
            <RouteModal
              isOpen={isActiveRouteOpen}
              onClose={() => setIsActiveRouteOpen(false)}
              destinationTitle={activeRequest.mechanicName}
              destinationLat={activeRequest.mechanicCoords?.latitude}
              destinationLng={activeRequest.mechanicCoords?.longitude}
              userLat={location?.latitude}
              userLng={location?.longitude}
            />
          </div>
        )}

        <SearchForm 
          onSearch={handleSearch} 
          isLoading={isLoading} 
          initialService={initialService}
        />

        {/* RESULTS SECTION: Shows either Manual Search OR Nearby Mechanics (Default) */}
        
        {(() => {
          if (isLoading) {
            return (
              <ServiceSkeleton 
                title="Buscando e comparando melhores opções com IA..." 
                subtitle="Consultando geolocalização, rotas, especialidades e prestadores credenciados..." 
                count={3} 
              />
            );
          }

          const currentResult = searchResult || nearbyMechanics;

          if (!currentResult) {
            if (loadingNearby) {
              return (
                <ServiceSkeleton 
                  title="Localizando mecânicos e guinchos próximos..." 
                  subtitle="Mapeando estabelecimentos e oficinas no seu raio de atendimento..." 
                  count={3} 
                />
              );
            }
            return null;
          }

          const rawChunks = currentResult.groundingChunks || [];

          // Filter grounding chunks based on category filter
          const filteredChunks = rawChunks.filter(chunk => {
            if (categoryFilter === 'ALL') return true;
            const title = (chunk.maps?.title || '').toLowerCase();
            const snippet = (chunk.maps?.placeAnswerSources?.reviewSnippets?.[0]?.snippet || '').toLowerCase();
            const text = `${title} ${snippet}`;

            if (categoryFilter === 'GUINCHO') {
              return text.includes('guincho') || text.includes('socorro') || text.includes('reboque') || text.includes('resgate');
            }
            if (categoryFilter === 'PNEU') {
              return text.includes('pneu') || text.includes('borracharia') || text.includes('vulcaniza');
            }
            if (categoryFilter === 'ELETRICA') {
              return text.includes('elétric') || text.includes('eletro') || text.includes('bateria') || text.includes('moura') || text.includes('heliar');
            }
            if (categoryFilter === 'PECAS') {
              return text.includes('peça') || text.includes('autopeça') || text.includes('distribuidora');
            }
            if (categoryFilter === 'MECANICA') {
              return text.includes('mecânic') || text.includes('oficina') || text.includes('centro automotivo') || text.includes('diagnóstico') || text.includes('freio') || text.includes('suspensão');
            }
            return true;
          });

          const filterOptions = [
            { id: 'ALL', label: 'Todos os Locais', icon: '📍' },
            { id: 'MECANICA', label: 'Mecânica Geral', icon: '🔧' },
            { id: 'GUINCHO', label: 'Socorro / Guincho', icon: '🚨' },
            { id: 'ELETRICA', label: 'Auto Elétrica', icon: '⚡' },
            { id: 'PNEU', label: 'Borracharia', icon: '🛞' },
            { id: 'PECAS', label: 'Auto Peças', icon: '📦' },
          ];

          return (
            <div id="search-results-section" className="mt-8 sm:mt-12 animate-fade-in-up">
              
              {/* Header Title Switch */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 sm:mb-6 px-1 sm:px-2">
                 <div className="flex items-center gap-2 sm:gap-3">
                   <div className={`h-6 sm:h-8 w-1.5 rounded-full ${searchResult ? 'bg-indigo-500' : 'bg-emerald-500'}`}></div>
                   <div>
                     <h3 className="text-lg sm:text-2xl font-bold text-zinc-800 dark:text-zinc-100 flex items-center gap-2">
                       {searchResult ? 'Recomendações da IA' : 'Oficinas em Destaque na Sua Região'}
                       {location && (
                         <span className="text-[10px] sm:text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-300/40 inline-flex items-center gap-1">
                           <MapPin size={12} className="text-emerald-500 animate-pulse" /> GPS Ativo
                         </span>
                       )}
                     </h3>
                     <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                       {location ? 'Resultados ordenados por proximidade e dados geográficos em tempo real' : 'Listagem de prestadores credenciados'}
                     </p>
                   </div>
                 </div>

                 {!searchResult && loadingNearby && (
                   <span className="text-[10px] sm:text-sm text-zinc-400 animate-pulse flex items-center gap-1.5">
                     <Clock size={14} className="animate-spin" /> Atualizando localização...
                   </span>
                 )}
              </div>
              
              {/* Interactive Category Filter Toolbar with layout animations */}
              {rawChunks.length > 0 && (
                <div className="mb-6 p-2 sm:p-3 bg-zinc-100/80 dark:bg-zinc-850/80 backdrop-blur-md rounded-2xl border border-zinc-200/80 dark:border-zinc-700/60 shadow-inner">
                  <div className="flex items-center justify-between mb-2 px-1">
                    <span className="text-xs font-bold text-zinc-600 dark:text-zinc-300 flex items-center gap-1.5 uppercase tracking-wider">
                      <SlidersHorizontal size={14} className="text-indigo-500" />
                      Filtrar Serviços por Categoria
                    </span>
                    <span className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 bg-white dark:bg-zinc-800 px-2 py-0.5 rounded-full border border-zinc-200 dark:border-zinc-700">
                      {filteredChunks.length} de {rawChunks.length} exibidos
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 scrollbar-none pt-0.5">
                    {filterOptions.map((opt) => {
                      const isActive = categoryFilter === opt.id;
                      return (
                        <button
                          key={opt.id}
                          onClick={() => handleCategoryFilterChange(opt.id)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 flex items-center gap-1.5 cursor-pointer select-none ${
                            isActive
                              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 scale-105 ring-2 ring-indigo-400/50'
                              : 'bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-750 border border-zinc-200/60 dark:border-zinc-700/60 hover:scale-[1.02]'
                          }`}
                        >
                          <span>{opt.icon}</span>
                          <span>{opt.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Display Text Content (Tips) */}
              <div className="bg-white dark:bg-zinc-800 p-5 sm:p-8 rounded-2xl shadow-lg shadow-zinc-200/50 dark:shadow-none border border-zinc-100 dark:border-zinc-700 mb-6 sm:mb-8 prose prose-sm sm:prose-base prose-zinc dark:prose-invert max-w-none prose-a:text-indigo-600 dark:prose-a:text-indigo-400 prose-headings:text-zinc-800 dark:prose-headings:text-zinc-100 prose-strong:text-indigo-700 dark:prose-strong:text-indigo-400">
                 <ReactMarkdown>
                   {currentResult.text || ''}
                 </ReactMarkdown>
              </div>

              {/* Display Animated Grid Cards */}
              {rawChunks.length > 0 && (
                <div className="space-y-4 sm:space-y-6">
                  <div className="flex items-center justify-between px-1 sm:px-2">
                     <h4 className="text-[10px] sm:text-sm font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                       <span>{searchResult ? 'Locais Encontrados' : 'Perto de Você'}</span>
                       {categoryFilter !== 'ALL' && (
                         <span className="normal-case text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-md text-xs font-semibold border border-indigo-200 dark:border-indigo-800/40">
                           Filtro ativo
                         </span>
                       )}
                     </h4>
                     <span className="text-[8px] sm:text-xs text-zinc-400 dark:text-zinc-500 bg-zinc-100 dark:bg-zinc-800 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded">Google Maps Platform</span>
                  </div>

                  {filteredChunks.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                      {filteredChunks.map((chunk, index) => (
                         <div
                           key={`${categoryFilter}-${chunk.maps?.title || index}`}
                           className={`transition-all duration-300 ease-out transform ${
                             isFilterAnimating 
                               ? 'opacity-0 translate-y-3 scale-95' 
                               : 'animate-fade-in-up opacity-100 translate-y-0 scale-100'
                           }`}
                           style={{ 
                             animationDelay: `${index * 60}ms`,
                             animationFillMode: 'backwards' 
                           }}
                         >
                           <ResultCard chunk={chunk} onContact={handleContact} />
                         </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 text-center bg-zinc-50 dark:bg-zinc-850 rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-700 animate-fade-in">
                      <p className="text-zinc-600 dark:text-zinc-300 font-semibold text-sm mb-2">
                        Nenhum estabelecimento encontrado nesta categoria específica.
                      </p>
                      <button
                        onClick={() => handleCategoryFilterChange('ALL')}
                        className="text-xs text-indigo-600 dark:text-indigo-400 font-bold hover:underline inline-flex items-center gap-1 cursor-pointer"
                      >
                        <X size={14} /> Limpar filtro de categoria
                      </button>
                    </div>
                  )}
                </div>
              )}
              
              {/* Empty State */}
              {rawChunks.length === 0 && !loadingNearby && (
                <p className="text-zinc-500 dark:text-zinc-400 text-center italic mt-4 bg-zinc-100 dark:bg-zinc-800 p-4 rounded-lg text-xs sm:text-sm animate-fade-in">
                  Nenhum local específico foi retornado pelo mapa, mas verifique as sugestões no texto acima.
                </p>
              )}
            </div>
          );
        })()}
      </main>

      <ServiceRatingModal
        isOpen={isRatingModalOpen}
        onClose={() => setIsRatingModalOpen(false)}
        mechanicName={ratingMechanicName}
        serviceType={ratingServiceType}
        onSubmitRating={(rating, comment, tags) => {
          // Add review summary message into chat history if active
          if (activeRequest) {
            setChatMessages(prev => [
              ...prev,
              {
                id: Date.now().toString(),
                text: `⭐ **Avaliação Enviada!**\nNota: **${rating}/5 estrelas**` + (tags.length ? `\n\n🏷️ ${tags.join(' • ')}` : '') + (comment ? `\n\n💬 *"${comment}"*` : ''),
                sender: 'me',
                timestamp: new Date()
              }
            ]);
          }
          setIsRatingModalOpen(false);
        }}
      />

      <ChatInterface 
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        recipientName={chatRecipient}
        initialMessages={chatMessages}
        userRole="CLIENT"
        initialStatus={activeRequest?.status || 'PENDING'}
        onStatusChange={(newStatus) => {
          setActiveRequest(prev => prev ? { ...prev, status: newStatus } : null);
          if (newStatus === 'COMPLETED') {
            setRatingMechanicName(activeRequest?.mechanicName || 'Mecânico Parceiro FIX');
            setRatingServiceType(activeRequest?.serviceType || 'Atendimento Automotivo');
            setIsRatingModalOpen(true);
          }
        }}
      />
    </>
  );
};