import React, { useState, useEffect } from 'react';
import { MapPin, Navigation, MessageCircle, Star, Send, X, ExternalLink, Store } from 'lucide-react';
import { GroundingChunk } from '../types';
import { VerifiedBadge } from './VerifiedBadge';
import { RouteModal } from './RouteModal';

interface ResultCardProps {
  chunk: GroundingChunk;
  onContact?: (name: string) => void;
  onSelectWorkshop?: (chunk: GroundingChunk) => void;
}

export const ResultCard: React.FC<ResultCardProps> = ({ chunk, onContact, onSelectWorkshop }) => {
  // Only render if it's a map chunk
  if (!chunk.maps) return null;

  const { title, uri, placeAnswerSources } = chunk.maps;
  
  // Extract a snippet if available
  const snippet = placeAnswerSources?.reviewSnippets?.[0]?.snippet;

  const [ratingInfo, setRatingInfo] = useState<{average: number, count: number} | null>(null);
  const [isRouteOpen, setIsRouteOpen] = useState(false);
  
  // Inline Chat State
  const [isChatting, setIsChatting] = useState(false);
  const [messages, setMessages] = useState<{text: string, sender: 'me'|'them'}[]>([]);
  const [inputMsg, setInputMsg] = useState('');

  useEffect(() => {
    const updateRating = () => {
      const currentRatings = JSON.parse(localStorage.getItem('mechanicRatings') || '{}');
      const mechanicData = currentRatings[title];
      if (mechanicData && mechanicData.count > 0) {
         setRatingInfo({
            average: mechanicData.total / mechanicData.count,
            count: mechanicData.count
         });
      }
    };
    
    updateRating();
    window.addEventListener('ratingsUpdated', updateRating);
    return () => window.removeEventListener('ratingsUpdated', updateRating);
  }, [title]);

  const handleStartChat = () => {
    setIsChatting(true);
    setMessages([
      { text: `Olá, encontrei o ${title} pelo aplicativo FIX. Gostaria de saber mais sobre os serviços e disponibilidade.`, sender: 'me' },
      { text: `Olá! Recebemos seu chamado. Como podemos ajudar com seu veículo?`, sender: 'them' }
    ]);
  };

  const handleSend = () => {
    if (inputMsg.trim()) {
      setMessages([...messages, { text: inputMsg, sender: 'me' }]);
      setInputMsg('');
      
      // Simulate reply
      setTimeout(() => {
        setMessages(prev => [...prev, { text: `Entendido. Vamos analisar e retornamos em breve.`, sender: 'them' }]);
      }, 1500);
    }
  };

  return (
    <div className={`bg-zinc-950 dark:bg-zinc-900 rounded-2xl p-4 sm:p-5 shadow-sm border border-zinc-800/80 dark:border-zinc-800 hover:shadow-xl hover:border-indigo-500/30 dark:hover:border-indigo-500/40 transition-all duration-300 flex flex-col gap-3.5 group relative overflow-hidden ${isChatting ? 'col-span-1 md:col-span-2 lg:col-span-3' : ''}`}>
      {/* Top Header Row */}
      <div className="flex justify-between items-start gap-3">
        <div className="flex gap-3 flex-1 items-start">
          <div className="w-10 h-10 rounded-xl bg-blue-900/20 dark:bg-indigo-950/60 text-blue-400 border border-blue-800/50 flex items-center justify-center shrink-0 group-hover:scale-105 group-hover:bg-blue-600 group-hover:text-white transition-all duration-200 shadow-sm">
            <MapPin size={20} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap justify-between">
              <button 
                type="button"
                onClick={() => onSelectWorkshop && onSelectWorkshop(chunk)}
                className="text-left font-extrabold text-white text-base sm:text-lg hover:text-blue-400 dark:hover:text-indigo-400 transition-colors leading-snug flex items-center gap-1.5 cursor-pointer group/title"
              >
                <span className="truncate">{title}</span>
                <ExternalLink size={14} className="opacity-0 group-hover/title:opacity-100 transition-opacity text-blue-500 shrink-0" />
              </button>
              <VerifiedBadge rating={ratingInfo ? ratingInfo.average : 4.8} size="sm" />
            </div>
            
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[11px] text-zinc-400 font-medium">Oficina Credenciada</span>
              {ratingInfo && (
                <>
                  <span className="text-zinc-300 dark:text-zinc-300 text-[10px]">•</span>
                  <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded-md border border-amber-200/50 dark:border-amber-800/30 text-[11px] font-bold" title={`${ratingInfo.count} avaliações`}>
                    <Star size={12} className="fill-amber-400 text-amber-400" />
                    <span>{ratingInfo.average.toFixed(1)}</span>
                    <span className="text-zinc-400 dark:text-zinc-500 font-normal">({ratingInfo.count})</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Snippet / Review Excerpt */}
      {!isChatting && snippet && (
        <div className="bg-zinc-900/80 dark:bg-zinc-800/50 p-3 rounded-xl text-xs text-zinc-400 dark:text-zinc-300 leading-relaxed italic border-l-2 border-indigo-500 dark:border-indigo-400 line-clamp-3">
          "{snippet}"
        </div>
      )}

      {/* Embedded Chat State */}
      {isChatting && (
        <div className="mt-2 bg-zinc-900 dark:bg-zinc-950 rounded-xl border border-zinc-800 dark:border-zinc-800 overflow-hidden flex flex-col h-72 shadow-inner">
           <div className="bg-blue-600 text-white p-3 text-xs sm:text-sm font-bold flex justify-between items-center shadow-sm">
             <div className="flex items-center gap-2">
               <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
               <span>Chat ao vivo com {title}</span>
             </div>
             <div className="flex items-center gap-3">
               <button onClick={() => { if (onContact) onContact(title); }} className="text-indigo-100 hover:text-white underline text-xs font-medium">
                 Chat Completo
               </button>
               <button onClick={() => setIsChatting(false)} className="text-white/80 hover:text-white p-1 rounded-md transition-colors" title="Fechar" aria-label="Fechar">
                 <X size={16} />
               </button>
             </div>
           </div>

           <div className="flex-1 overflow-y-auto p-3 space-y-3 flex flex-col">
             {messages.map((msg, i) => (
               <div key={i} className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm max-w-[85%] shadow-sm ${msg.sender === 'me' ? 'bg-blue-600 text-white rounded-br-xs' : 'bg-zinc-900 text-white rounded-bl-xs border border-zinc-800/60 dark:border-zinc-700/60'}`}>
                    {msg.text}
                  </div>
               </div>
             ))}
           </div>

           <div className="p-2.5 border-t border-zinc-800 dark:border-zinc-800 flex gap-2 bg-zinc-950 dark:bg-zinc-900">
             <input 
               type="text" 
               value={inputMsg}
               onChange={(e) => setInputMsg(e.target.value)}
               onKeyDown={(e) => e.key === 'Enter' && handleSend()}
               placeholder="Digite sua dúvida ou orçamento..."
               className="flex-1 bg-zinc-900 dark:bg-zinc-800 border border-zinc-800 dark:border-zinc-700 rounded-xl px-3.5 py-2 text-xs sm:text-sm focus:outline-none focus:border-indigo-500 text-white"
             />
             <button onClick={handleSend} className="bg-blue-600 hover:bg-blue-500 active:scale-95 text-white px-3.5 py-2 rounded-xl transition-all font-bold flex items-center justify-center">
               <Send size={15} />
             </button>
           </div>
        </div>
      )}

      {/* Action Buttons */}
      {!isChatting && (
        <div className="mt-auto flex gap-2 pt-1">
          {onSelectWorkshop && (
            <button
              type="button"
              onClick={() => onSelectWorkshop(chunk)}
              className="flex-1 flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-500 active:scale-[0.98] text-white py-2.5 rounded-xl font-bold text-xs sm:text-sm shadow-sm shadow-blue-900/20 transition-all cursor-pointer"
            >
              <Store size={15} />
              <span>Ver Página</span>
            </button>
          )}
          {onContact && (
            <button 
              onClick={handleStartChat}
              className="flex-1 flex items-center justify-center gap-1.5 bg-blue-900/20 dark:bg-indigo-950/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/80 active:scale-[0.98] text-indigo-700 dark:text-indigo-300 py-2.5 rounded-xl font-bold text-xs sm:text-sm border border-blue-800/60 dark:border-indigo-800/50 transition-all cursor-pointer"
            >
              <MessageCircle size={15} />
              <span>Negociar</span>
            </button>
          )}
          <button 
            type="button"
            onClick={() => setIsRouteOpen(true)}
            className="flex-1 flex items-center justify-center gap-1.5 bg-zinc-900 dark:bg-zinc-800 hover:bg-zinc-800 dark:hover:bg-zinc-700 active:scale-[0.98] text-white py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer"
          >
            <Navigation size={15} />
            <span>Rota</span>
          </button>
        </div>
      )}

      {/* In-App OpenStreetMap Route Modal */}
      <RouteModal
        isOpen={isRouteOpen}
        onClose={() => setIsRouteOpen(false)}
        destinationTitle={title}
        destinationAddress={title}
      />
    </div>
  );
};