import React from 'react';
import { AlertTriangle, ShieldCheck, Crown } from 'lucide-react';

interface HeroProps {
  onEmergencyClick: () => void;
  onPrimeClick?: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onEmergencyClick, onPrimeClick }) => {
  return (
    <div className="bg-zinc-900 text-white pt-8 pb-12 sm:pt-12 sm:pb-16 px-4 rounded-b-3xl shadow-lg relative overflow-hidden">
      {/* Subtle background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-48 bg-indigo-600/15 blur-3xl pointer-events-none" />

      <div className="max-w-2xl mx-auto text-center relative z-10 space-y-4">
        {/* Prime Tag */}
        {onPrimeClick && (
          <button 
            onClick={onPrimeClick}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-800/80 hover:bg-zinc-800 border border-zinc-700/60 text-zinc-300 text-xs font-semibold tracking-wide cursor-pointer transition-colors"
          >
            <Crown size={12} className="text-amber-400 fill-amber-400" />
            <span>FIX Prime</span>
          </button>
        )}

        {/* Heading */}
        <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
          Socorro e Serviços Automotivos
        </h2>

        {/* Subtitle */}
        <p className="text-zinc-400 text-sm sm:text-base max-w-md mx-auto leading-relaxed">
          Encontre mecânicos, guinchos e peças próximas com busca geolocalizada em tempo real.
        </p>

        {/* CTA Actions */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button 
            onClick={onEmergencyClick}
            className="flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-500 text-white px-6 py-2.5 rounded-xl font-bold text-sm transition-all shadow-md shadow-rose-950/40 w-full sm:w-auto cursor-pointer"
          >
            <AlertTriangle size={16} />
            <span>SOS Emergência</span>
          </button>

          <div className="flex items-center gap-1.5 text-zinc-400 text-xs px-3 py-2">
            <ShieldCheck size={14} className="text-emerald-400" />
            <span>Parceiros Verificados</span>
          </div>
        </div>
      </div>
    </div>
  );
};