import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Hero } from './Hero';
import { SearchForm } from './SearchForm';
import { ResultCard } from './ResultCard';
import { findMechanics } from '../services/geminiService';
import { VehicleType, ServiceType, Coordinates, SearchResult, User } from '../types';
import { AlertCircle, Compass } from 'lucide-react';

interface ClientDashboardProps {
  user: User;
}

export const ClientDashboard: React.FC<ClientDashboardProps> = ({ user }) => {
  const [location, setLocation] = useState<Coordinates | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchResult, setSearchResult] = useState<SearchResult | null>(null);
  const [initialService, setInitialService] = useState<ServiceType | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Attempt to get location on mount
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
          setLocationError(null);
        },
        (err) => {
          console.error("Geolocation error:", err);
          setLocationError("Ative o GPS para encontrar serviços mais próximos de você.");
        }
      );
    } else {
      setLocationError("Seu navegador não suporta geolocalização.");
    }
  }, []);

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

  return (
    <>
      <Hero onEmergencyClick={handleEmergencyClick} />
      
      <main className="w-full max-w-5xl mx-auto px-4 relative z-10 pb-20">
        
        {locationError && (
          <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 text-sm rounded-xl flex items-center gap-3 border border-amber-200 dark:border-amber-800 max-w-3xl mx-auto shadow-sm">
            <AlertCircle size={20} className="shrink-0" />
            <span className="font-medium">{locationError}</span>
          </div>
        )}

        {location && !locationError && (
          <div className="mt-4 flex justify-center">
            <div className="inline-flex items-center gap-1.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300 px-3 py-1 rounded-full text-xs font-semibold border border-emerald-200 dark:border-emerald-800 shadow-sm">
              <Compass size={12} />
              GPS Ativo • Localização precisa
            </div>
          </div>
        )}

        <SearchForm 
          onSearch={handleSearch} 
          isLoading={isLoading} 
          initialService={initialService}
        />

        {error && (
          <div className="mt-8 p-6 bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-300 rounded-2xl text-center border border-rose-100 dark:border-rose-800 shadow-sm">
            <p className="font-bold mb-1">Ops, algo deu errado.</p>
            <p>{error}</p>
          </div>
        )}

        {searchResult && (
          <div className="mt-12 animate-fade-in-up">
            <div className="flex items-center gap-3 mb-6 px-2">
               <div className="h-8 w-1 bg-indigo-500 rounded-full"></div>
               <h3 className="text-2xl font-bold text-zinc-800 dark:text-zinc-100">Recomendações da IA</h3>
            </div>
            
            <div className="bg-white dark:bg-zinc-800 p-8 rounded-2xl shadow-lg shadow-zinc-200/50 dark:shadow-none border border-zinc-100 dark:border-zinc-700 mb-8 prose prose-zinc dark:prose-invert max-w-none prose-a:text-indigo-600 dark:prose-a:text-indigo-400 prose-headings:text-zinc-800 dark:prose-headings:text-zinc-100 prose-strong:text-indigo-700 dark:prose-strong:text-indigo-400">
               <ReactMarkdown>{searchResult.text}</ReactMarkdown>
            </div>

            {searchResult.groundingChunks && searchResult.groundingChunks.length > 0 && (
              <div className="space-y-6">
                <div className="flex items-center justify-between px-2">
                   <h4 className="text-sm font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">Locais no Mapa</h4>
                   <span className="text-xs text-zinc-400 dark:text-zinc-500 bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded">Google Maps Platform</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {searchResult.groundingChunks.map((chunk, index) => (
                     <ResultCard key={index} chunk={chunk} />
                  ))}
                </div>
              </div>
            )}
            
            {searchResult.groundingChunks.length === 0 && (
              <p className="text-zinc-500 dark:text-zinc-400 text-center italic mt-4 bg-zinc-100 dark:bg-zinc-800 p-4 rounded-lg">
                Nenhum link direto de mapa foi retornado, mas verifique as sugestões no texto acima.
              </p>
            )}
          </div>
        )}
      </main>
    </>
  );
};