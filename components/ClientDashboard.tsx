import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Hero } from './Hero';
import { SearchForm } from './SearchForm';
import { ResultCard } from './ResultCard';
import { ChatInterface } from './ChatInterface';
import { findMechanics } from '../services/geminiService';
import { VehicleType, ServiceType, Coordinates, SearchResult, User, ChatMessage } from '../types';
import { AlertCircle, Compass, MapPin } from 'lucide-react';

interface ClientDashboardProps {
  user: User;
  onUpgrade: () => void;
  location: Coordinates | null;
  locationError: string | null;
  isDetectingLocation: boolean;
}

export const ClientDashboard: React.FC<ClientDashboardProps> = ({ 
  user, 
  onUpgrade,
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
        text: `Olá, encontrei o ${name} pelo aplicativo FIX. Gostaria de saber mais sobre os serviços e disponibilidade.`,
        sender: 'me',
        timestamp: new Date()
      }
    ]);
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
      />
    </>
  );
};