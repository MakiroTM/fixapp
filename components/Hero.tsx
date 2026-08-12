import React from 'react';
import { AlertTriangle, ShieldCheck, Crown } from 'lucide-react';

interface HeroProps {
  onEmergencyClick: () => void;
  onPrimeClick?: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onEmergencyClick, onPrimeClick }) => {
  return (
    <div className="bg-zinc-950 text-white pt-6 pb-12 sm:pt-10 sm:pb-16 px-4 rounded-b-[2rem] border-b border-zinc-900 shadow-md relative overflow-hidden">
      {/* Subtle background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-48 bg-blue-600/15 blur-3xl pointer-events-none" />
      <div className="max-w-2xl mx-auto text-center relative z-10 space-y-4">
        {/* Prime Tag */}
        {onPrimeClick && (
          <button 
            onClick={onPrimeClick}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-blue-400 hover:bg-zinc-800 hover:text-blue-300 text-[11px] font-bold uppercase tracking-widest cursor-pointer transition-colors shadow-sm"
          >
            <Crown size={12} className="text-amber-400 fill-amber-400" />
            <span>FIX Prime</span>
          </button>
        )}
        
        {/* Heading */}
        <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
          Pesquisa e Serviços Automotivos
        </h2>
        
        {/* Subtitle */}
        <p className="text-zinc-400 text-sm sm:text-base max-w-md mx-auto leading-relaxed">
          Busque por guinchos, mecânicos e oficinas com inteligência artificial e localização em tempo real.
        </p>
        
        {/* CTA Actions */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button 
            onClick={onEmergencyClick}
            className="flex items-center justify-center gap-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border border-rose-500/20 px-6 py-2.5 rounded-xl font-bold text-sm transition-all shadow-sm w-full sm:w-auto cursor-pointer"
          >
            <AlertTriangle size={16} />
            <span>SOS Emergência</span>
          </button>
          <div className="flex items-center gap-1.5 text-zinc-500 text-xs px-3 py-2 bg-zinc-900/50 rounded-lg border border-zinc-800/50">
            <ShieldCheck size={14} className="text-blue-500" />
            <span>Rede Verificada</span>
          </div>
        </div>
      </div>
    </div>
  );
};