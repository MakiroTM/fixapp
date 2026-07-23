import React, { useState, useEffect } from 'react';
import { MapPin, Navigation, MessageCircle, Star, Send } from 'lucide-react';
import { GroundingChunk } from '../types';
import { VerifiedBadge } from './VerifiedBadge';

interface ResultCardProps {
  chunk: GroundingChunk;
  onContact?: (name: string) => void;
}

export const ResultCard: React.FC<ResultCardProps> = ({ chunk, onContact }) => {
  // Only render if it's a map chunk
  if (!chunk.maps) return null;

  const { title, uri, placeAnswerSources } = chunk.maps;
  
  // Extract a snippet if available
  const snippet = placeAnswerSources?.reviewSnippets?.[0]?.snippet;

  const [ratingInfo, setRatingInfo] = useState<{average: number, count: number} | null>(null);
  
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
    <div className={`bg-white dark:bg-zinc-800 rounded-xl p-3 sm:p-4 shadow-sm border border-zinc-200 dark:border-zinc-700 hover:shadow-md hover:border-indigo-200 dark:hover:border-indigo-700 transition-all flex flex-col gap-2.5 sm:gap-3 group ${isChatting ? 'col-span-1 md:col-span-2 lg:col-span-3' : ''}`}>
      <div className="flex justify-between items-start">
        <div className="flex gap-2.5 sm:gap-3">
          <div className="mt-0.5 sm:mt-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 p-1.5 sm:p-2 rounded-lg h-fit group-hover:bg-indigo-600 group-hover:text-white transition-colors">
            <MapPin size={18} className="sm:w-5 sm:h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-bold text-zinc-800 dark:text-zinc-100 text-base sm:text-lg group-hover:text-indigo-700 dark:group-hover:text-indigo-400 transition-colors leading-tight">{title}</h3>
              <VerifiedBadge rating={ratingInfo ? ratingInfo.average : 4.8} size="sm" />
            </div>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-[10px] sm:text-xs text-zinc-500 dark:text-zinc-400">Estabelecimento credenciado</p>
              {ratingInfo && (
                <>
                  <span className="text-zinc-300 dark:text-zinc-600 text-[10px]">•</span>
                  <div className="flex items-center gap-0.5 text-amber-500" title={`${ratingInfo.count} avaliações`}>
                    <Star size={12} className="fill-amber-500" />
                    <span className="text-[10px] sm:text-xs font-bold">{ratingInfo.average.toFixed(1)}</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {!isChatting && snippet && (
        <div className="bg-zinc-50 dark:bg-zinc-900 p-2.5 sm:p-3 rounded-lg text-[11px] sm:text-xs text-zinc-600 dark:text-zinc-300 italic border-l-4 border-indigo-400 dark:border-indigo-600 line-clamp-3">
          "{snippet}"
        </div>
      )}

      {isChatting && (
        <div className="mt-2 bg-zinc-50 dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-700 overflow-hidden flex flex-col h-64">
           <div className="bg-indigo-100 dark:bg-indigo-900/40 p-2 sm:p-3 text-xs sm:text-sm font-bold text-indigo-800 dark:text-indigo-300 border-b border-indigo-100 dark:border-indigo-800 flex justify-between items-center">
             <span>Chat com {title}</span>
             <div className="flex gap-2">
               <button onClick={() => { if (onContact) onContact(title); }} className="text-indigo-600 hover:underline text-xs">Abrir Chat Completo</button>
               <button onClick={() => setIsChatting(false)} className="text-zinc-500 hover:text-zinc-700 text-xs">Fechar</button>
             </div>
           </div>
           <div className="flex-1 overflow-y-auto p-3 space-y-3 flex flex-col">
             {messages.map((msg, i) => (
               <div key={i} className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`px-3 py-2 rounded-xl text-xs sm:text-sm max-w-[85%] ${msg.sender === 'me' ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-white dark:bg-zinc-700 text-zinc-800 dark:text-zinc-100 rounded-bl-none shadow-sm'}`}>
                    {msg.text}
                  </div>
               </div>
             ))}
           </div>
           <div className="p-2 border-t border-zinc-200 dark:border-zinc-700 flex gap-2 bg-white dark:bg-zinc-800">
             <input 
               type="text" 
               value={inputMsg}
               onChange={(e) => setInputMsg(e.target.value)}
               onKeyDown={(e) => e.key === 'Enter' && handleSend()}
               placeholder="Mensagem sobre o veículo..."
               className="flex-1 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-1.5 text-xs sm:text-sm focus:outline-none focus:border-indigo-500 text-zinc-800 dark:text-zinc-100"
             />
             <button onClick={handleSend} className="bg-indigo-600 hover:bg-indigo-700 text-white p-2 rounded-lg transition-colors">
               <Send size={16} />
             </button>
           </div>
        </div>
      )}

      {!isChatting && (
        <div className="mt-auto flex gap-2 pt-1 sm:pt-2">
          {onContact && (
            <button 
              onClick={handleStartChat}
              className="flex-1 flex items-center justify-center gap-1.5 sm:gap-2 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 py-2 sm:py-2.5 rounded-lg font-bold text-xs sm:text-sm hover:bg-indigo-200 dark:hover:bg-indigo-900/60 transition-colors"
            >
              <MessageCircle size={14} className="sm:w-4 sm:h-4" />
              Negociar
            </button>
          )}
          <a 
            href={uri} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-1.5 sm:gap-2 bg-zinc-900 dark:bg-zinc-700 text-white py-2 sm:py-2.5 rounded-lg font-bold text-xs sm:text-sm hover:bg-zinc-800 dark:hover:bg-zinc-600 transition-colors"
          >
            <Navigation size={14} className="sm:w-4 sm:h-4" />
            Rota
          </a>
        </div>
      )}
    </div>
  );
};