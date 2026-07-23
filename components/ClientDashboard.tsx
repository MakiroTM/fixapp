import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Hero } from './Hero';
import { SearchForm } from './SearchForm';
import { ResultCard } from './ResultCard';
import { ChatInterface } from './ChatInterface';
import { StatusIndicator } from './StatusIndicator';
import { EtaWidget } from './EtaWidget';
import { PaymentSimulation } from './PaymentSimulation';
import { findMechanics } from '../services/geminiService';
import { calculateDynamicETA } from '../services/locationUtils';
import { VehicleType, ServiceType, Coordinates, SearchResult, User, ChatMessage, ActiveServiceRequest, ServiceStatus } from '../types';
import { AlertCircle, Compass, MapPin, MessageCircle, Clock, CheckCircle2, ChevronRight, X } from 'lucide-react';

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

  // Fetch nearby mechanics automatically once location is found
  useEffect(() => {
    if (location && !nearbyMechanics && !loadingNearby) {
      setLoadingNearby(true);
      findMechanics(
        "Listar todas as oficinas mecânicas disponíveis na região",
        VehicleType.CAR,
        ServiceType.MAINTENANCE,
        location
      )
      .then((result) => {
        setNearbyMechanics(result);
      })
      .catch((e) => console.error("Auto fetch failed", e))
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
    setIsLoading(true);
    setError(null);
    setSearchResult(null);
    try {
      let effectiveQuery = query.trim();
      if (!effectiveQuery && problemCategory) {
        effectiveQuery = `Problema reportado: ${problemCategory}`;
      } else if (!effectiveQuery && !problemCategory) {
         effectiveQuery = `Preciso de serviço de ${service}`;
      }
      
      const result = await findMechanics(effectiveQuery, vehicle, service, location, carModel, problemCategory);
      setSearchResult(result);
    } catch (err) {
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
      
      <main className="w-full max-w-5xl mx-auto px-4 relative z-10 pb-20 -mt-8 sm:-mt-14">
        
        {/* GPS Status Badge */}
        <div className="flex justify-center mb-4 relative z-30">
          {isDetectingLocation ? (
            <div className="inline-flex items-center gap-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-3 py-1 rounded-full text-[10px] sm:text-xs font-semibold border border-blue-200 dark:border-blue-800 shadow-sm animate-pulse">
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-ping"></div>
              Detectando GPS...
            </div>
          ) : location ? (
            <div className="inline-flex items-center gap-1.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300 px-3 py-1 rounded-full text-[10px] sm:text-xs font-semibold border border-emerald-200 dark:border-emerald-800 shadow-sm">
              <Compass size={10} className="text-emerald-500 sm:w-3 sm:h-3" />
              GPS Ativo • Localização precisa
            </div>
          ) : (
            <div className="inline-flex items-center gap-1.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 px-3 py-1 rounded-full text-[10px] sm:text-xs font-semibold border border-zinc-200 dark:border-zinc-700 shadow-sm">
              <div className="w-1.5 h-1.5 bg-zinc-400 rounded-full"></div>
              GPS Desativado
            </div>
          )}
        </div>

        {/* Prominent Geolocation Error Alert */}
        {locationError && (
          <div className="mb-6 p-4 bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-300 rounded-2xl border border-rose-100 dark:border-rose-800 shadow-lg flex items-center gap-3 animate-fade-in relative z-30 mx-2 sm:mx-4 max-w-4xl lg:mx-auto">
            <AlertCircle className="flex-shrink-0 text-rose-500" size={24} />
            <div className="text-sm">
              <p className="font-bold">Aviso de Localização</p>
              <p>{locationError}. Por favor, ative o GPS para encontrar mecânicos próximos com precisão.</p>
            </div>
          </div>
        )}

        {/* Search Error Alert */}
        {error && (
          <div className="mb-6 p-4 bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-300 rounded-2xl border border-rose-100 dark:border-rose-800 shadow-lg flex items-center gap-3 animate-fade-in relative z-30 mx-2 sm:mx-4 max-w-4xl lg:mx-auto">
            <AlertCircle className="flex-shrink-0 text-rose-500" size={24} />
            <div className="text-sm">
              <p className="font-bold">Ops, algo deu errado.</p>
              <p>{error}</p>
            </div>
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
              onStatusChange={(newStatus) => setActiveRequest(prev => prev ? { ...prev, status: newStatus } : null)}
            />

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

              <button
                onClick={() => {
                  setChatRecipient(activeRequest.mechanicName);
                  setIsChatOpen(true);
                }}
                className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-md shadow-indigo-600/30"
              >
                <MessageCircle size={16} />
                <span>Abrir Chat & Detalhes</span>
              </button>
            </div>
          </div>
        )}

        <SearchForm 
          onSearch={handleSearch} 
          isLoading={isLoading} 
          initialService={initialService}
        />

        {/* RESULTS SECTION: Shows either Manual Search OR Nearby Mechanics (Default) */}
        
        {(searchResult || nearbyMechanics) && (
          <div className="mt-8 sm:mt-12 animate-fade-in-up">
            
            {/* Header Title Switch */}
            <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6 px-1 sm:px-2">
               <div className={`h-6 sm:h-8 w-1 rounded-full ${searchResult ? 'bg-indigo-500' : 'bg-emerald-500'}`}></div>
               <h3 className="text-lg sm:text-2xl font-bold text-zinc-800 dark:text-zinc-100">
                 {searchResult ? 'Recomendações da IA' : 'Oficinas em Destaque na Sua Região'}
               </h3>
               {!searchResult && loadingNearby && (
                 <span className="text-[10px] sm:text-sm text-zinc-400 animate-pulse">Carregando locais...</span>
               )}
            </div>
            
            {/* Display Text Content (Tips) */}
            <div className="bg-white dark:bg-zinc-800 p-5 sm:p-8 rounded-2xl shadow-lg shadow-zinc-200/50 dark:shadow-none border border-zinc-100 dark:border-zinc-700 mb-6 sm:mb-8 prose prose-sm sm:prose-base prose-zinc dark:prose-invert max-w-none prose-a:text-indigo-600 dark:prose-a:text-indigo-400 prose-headings:text-zinc-800 dark:prose-headings:text-zinc-100 prose-strong:text-indigo-700 dark:prose-strong:text-indigo-400">
               <ReactMarkdown>
                 {(searchResult || nearbyMechanics)?.text || ''}
               </ReactMarkdown>
            </div>

            {/* Display Cards */}
            {((searchResult || nearbyMechanics)?.groundingChunks?.length ?? 0) > 0 && (
              <div className="space-y-4 sm:space-y-6">
                <div className="flex items-center justify-between px-1 sm:px-2">
                   <h4 className="text-[10px] sm:text-sm font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">
                     {searchResult ? 'Locais Encontrados' : 'Perto de Você'}
                   </h4>
                   <span className="text-[8px] sm:text-xs text-zinc-400 dark:text-zinc-500 bg-zinc-100 dark:bg-zinc-800 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded">Google Maps Platform</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {(searchResult || nearbyMechanics)?.groundingChunks.map((chunk, index) => (
                     <ResultCard key={index} chunk={chunk} onContact={handleContact} />
                  ))}
                </div>
              </div>
            )}
            
            {/* Empty State */}
            {((searchResult || nearbyMechanics)?.groundingChunks?.length ?? 0) === 0 && !loadingNearby && (
              <p className="text-zinc-500 dark:text-zinc-400 text-center italic mt-4 bg-zinc-100 dark:bg-zinc-800 p-4 rounded-lg text-xs sm:text-sm">
                Nenhum local específico foi retornado pelo mapa, mas verifique as sugestões no texto acima.
              </p>
            )}
          </div>
        )}
      </main>

      <ChatInterface 
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        recipientName={chatRecipient}
        initialMessages={chatMessages}
        userRole="CLIENT"
        initialStatus={activeRequest?.status || 'PENDING'}
        onStatusChange={(newStatus) => {
          setActiveRequest(prev => prev ? { ...prev, status: newStatus } : null);
        }}
      />
    </>
  );
};