import React from 'react';
import { MapPin, Navigation, MessageCircle } from 'lucide-react';
import { GroundingChunk } from '../types';

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

  return (
    <div className="bg-white dark:bg-zinc-800 rounded-xl p-4 shadow-sm border border-zinc-200 dark:border-zinc-700 hover:shadow-md hover:border-indigo-200 dark:hover:border-indigo-700 transition-all flex flex-col gap-3 group">
      <div className="flex justify-between items-start">
        <div className="flex gap-3">
          <div className="mt-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 p-2 rounded-lg h-fit group-hover:bg-indigo-600 group-hover:text-white transition-colors">
            <MapPin size={20} />
          </div>
          <div>
            <h3 className="font-bold text-zinc-800 dark:text-zinc-100 text-lg group-hover:text-indigo-700 dark:group-hover:text-indigo-400 transition-colors leading-tight">{title}</h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Local verificado</p>
          </div>
        </div>
      </div>

      {snippet && (
        <div className="bg-zinc-50 dark:bg-zinc-900 p-3 rounded-lg text-xs text-zinc-600 dark:text-zinc-300 italic border-l-4 border-indigo-400 dark:border-indigo-600 line-clamp-3">
          "{snippet}"
        </div>
      )}

      <div className="mt-auto flex gap-2 pt-2">
        {onContact && (
          <button 
            onClick={() => onContact(title)}
            className="flex-1 flex items-center justify-center gap-2 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 py-2.5 rounded-lg font-bold text-sm hover:bg-indigo-200 dark:hover:bg-indigo-900/60 transition-colors"
          >
            <MessageCircle size={16} />
            Negociar
          </button>
        )}
        <a 
          href={uri} 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex-1 flex items-center justify-center gap-2 bg-zinc-900 dark:bg-zinc-700 text-white py-2.5 rounded-lg font-bold text-sm hover:bg-zinc-800 dark:hover:bg-zinc-600 transition-colors"
        >
          <Navigation size={16} />
          Rota
        </a>
      </div>
    </div>
  );
};