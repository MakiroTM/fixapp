import React from 'react';
import { AlertTriangle, ShieldCheck, Crown } from 'lucide-react';

interface HeroProps {
  onEmergencyClick: () => void;
  onPrimeClick?: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onEmergencyClick, onPrimeClick }) => {
  return (
    <div className="bg-zinc-900 text-white py-10 sm:py-14 px-4 rounded-b-3xl sm:rounded-b-[3rem] shadow-2xl relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-600 rounded-full blur-[120px] opacity-30 -mr-40 -mt-40 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-rose-600 rounded-full blur-[100px] opacity-10 -ml-32 -mb-32 pointer-events-none"></div>
      
      <div className="max-w-3xl mx-auto text-center relative z-10">
        <div className="inline-flex items-center gap-2 mb-3 px-3 py-1 rounded-full bg-indigo-900/50 border border-indigo-700 text-indigo-300 text-xs font-semibold tracking-wide uppercase cursor-pointer hover:bg-indigo-900 transition-colors" onClick={onPrimeClick}>
          <Crown size={12} className="text-amber-400 fill-amber-400" />
          Conheça o FIX Prime
        </div>
        <h2 className="text-3xl sm:text-5xl font-bold mb-6 tracking-tight text-white">
          Tudo para o seu veículo em um só lugar
        </h2>
        <p className="text-zinc-300 mb-10 max-w-lg mx-auto text-lg leading-relaxed">
          Encontre mecânicos qualificados ou compre peças automotivas nas melhores lojas da região.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button 
            onClick={onEmergencyClick}
            className="group flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-700 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all hover:scale-105 shadow-xl shadow-rose-900/30 w-full sm:w-auto border border-rose-500"
          >
            <AlertTriangle size={24} className="group-hover:animate-pulse" />
            SOS Emergência
          </button>
          <div className="flex items-center justify-center gap-2 text-zinc-400 text-sm mt-2 sm:mt-0 px-4 py-2 rounded-lg bg-zinc-800/50 border border-zinc-700/50">
             <ShieldCheck size={16} className="text-emerald-400" />
             <span>Busca verificada via Google Maps</span>
          </div>
        </div>
      </div>
    </div>
  );
};