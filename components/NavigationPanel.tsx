import React from 'react';
import { 
  Navigation, 
  CornerUpRight, 
  CornerUpLeft, 
  ArrowUp, 
  RotateCw, 
  X, 
  LocateFixed, 
  WifiOff, 
  AlertTriangle,
  CheckCircle2,
  Clock,
  MapPin,
  Compass
} from 'lucide-react';
import { NavigationSessionState } from '../services/navigationService';

interface NavigationPanelProps {
  navState: NavigationSessionState;
  onCenterMap: () => void;
  onStopNavigation: () => void;
  onRecalculate?: () => void;
}

export const NavigationPanel: React.FC<NavigationPanelProps> = ({
  navState,
  onCenterMap,
  onStopNavigation,
  onRecalculate
}) => {
  const {
    status,
    destinationTitle,
    currentInstruction,
    distanceToNextManeuver,
    formattedRemainingDistance,
    formattedRemainingDuration,
    errorMessage,
    isOffline,
  } = navState;

  if (status === 'idle') return null;

  // Determine direction icon
  const getInstructionIcon = () => {
    if (!currentInstruction) return <ArrowUp size={28} className="text-indigo-400" />;
    const lower = currentInstruction.toLowerCase();
    if (lower.includes('direita')) return <CornerUpRight size={28} className="text-indigo-400" />;
    if (lower.includes('esquerda')) return <CornerUpLeft size={28} className="text-indigo-400" />;
    if (lower.includes('retorno') || lower.includes('voltar')) return <RotateCw size={28} className="text-indigo-400" />;
    if (lower.includes('chegou') || lower.includes('chegará')) return <CheckCircle2 size={28} className="text-emerald-400" />;
    return <ArrowUp size={28} className="text-indigo-400" />;
  };

  return (
    <div className="absolute inset-x-0 top-3 z-30 px-3 sm:px-6 pointer-events-none flex flex-col items-center gap-2 max-w-xl mx-auto">
      
      {/* Top Banner: Next Maneuver & Direction */}
      <div className="w-full bg-zinc-900/95 dark:bg-zinc-950/95 text-white backdrop-blur-md rounded-2xl p-3.5 sm:p-4 shadow-2xl border border-zinc-700/60 pointer-events-auto flex items-center justify-between gap-3 animate-fade-in">
        <div className="flex items-center gap-3 min-w-0">
          <div className="p-3 bg-indigo-600/30 text-indigo-400 rounded-xl border border-indigo-500/40 flex-shrink-0 flex items-center justify-center">
            {getInstructionIcon()}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400 flex items-center gap-1">
                <Navigation size={10} className="animate-pulse" />
                Navegação FIX
              </span>
              {status === 'rerouting' && (
                <span className="px-2 py-0.5 text-[9px] font-bold bg-amber-500/20 text-amber-400 rounded-full border border-amber-500/30 animate-pulse">
                  Recalculando...
                </span>
              )}
              {status === 'arrived' && (
                <span className="px-2 py-0.5 text-[9px] font-bold bg-emerald-500/20 text-emerald-400 rounded-full border border-emerald-500/30">
                  Chegou!
                </span>
              )}
            </div>
            <h4 className="font-extrabold text-sm sm:text-base text-white leading-tight truncate">
              {currentInstruction || 'Calculando rota...'}
            </h4>
            {distanceToNextManeuver !== null && distanceToNextManeuver > 0 && status === 'navigating' && (
              <p className="text-xs text-indigo-200 font-semibold mt-0.5">
                em aproximadamente {distanceToNextManeuver}m
              </p>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={onStopNavigation}
          className="p-2 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-full transition-colors cursor-pointer pointer-events-auto"
          title="Encerrar rota"
        >
          <X size={20} />
        </button>
      </div>

      {/* Warnings & Banners (Recalculating / GPS Error / Offline) */}
      {status === 'calculating' && (
        <div className="w-full bg-indigo-600 text-white rounded-xl px-4 py-2 text-xs font-bold flex items-center justify-center gap-2 shadow-lg animate-pulse pointer-events-auto">
          <Navigation size={14} className="animate-spin" />
          <span>Traçando a melhor rota no mapa...</span>
        </div>
      )}

      {status === 'rerouting' && (
        <div className="w-full bg-amber-600 text-white rounded-xl px-4 py-2 text-xs font-bold flex items-center justify-center gap-2 shadow-lg animate-pulse pointer-events-auto">
          <RotateCw size={14} className="animate-spin" />
          <span>Usuário saiu da rota. Recalculando percurso...</span>
        </div>
      )}

      {status === 'gps_error' && (
        <div className="w-full bg-rose-600 text-white rounded-xl px-4 py-2 text-xs font-bold flex items-center justify-between gap-2 shadow-lg pointer-events-auto">
          <div className="flex items-center gap-2">
            <AlertTriangle size={15} />
            <span>{errorMessage || 'Sinal GPS indisponível ou fraco.'}</span>
          </div>
        </div>
      )}

      {isOffline && (
        <div className="w-full bg-zinc-800 text-amber-300 rounded-xl px-3.5 py-1.5 text-xs font-semibold flex items-center justify-center gap-2 border border-amber-500/30 shadow-md pointer-events-auto">
          <WifiOff size={13} />
          <span>Conexão offline - acompanhando via GPS local</span>
        </div>
      )}

      {/* Bottom Floating Bar: Distance, Time, Destination & Recenter */}
      <div className="w-full bg-zinc-900/90 dark:bg-zinc-900/95 text-white backdrop-blur-md rounded-2xl p-3 shadow-2xl border border-zinc-800 pointer-events-auto flex items-center justify-between gap-2 animate-pop-in">
        <div className="flex items-center gap-4 min-w-0">
          <div className="flex flex-col">
            <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">
              Distância Restante
            </span>
            <span className="text-base sm:text-lg font-black text-indigo-400 flex items-center gap-1">
              <Compass size={16} className="text-indigo-400" />
              {formattedRemainingDistance || '--'}
            </span>
          </div>

          <div className="h-7 w-[1px] bg-zinc-800" />

          <div className="flex flex-col">
            <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">
              Tempo Estimado
            </span>
            <span className="text-base sm:text-lg font-black text-emerald-400 flex items-center gap-1">
              <Clock size={16} className="text-emerald-400" />
              {formattedRemainingDuration || '--'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onCenterMap}
            className="px-3 py-2 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white rounded-xl text-xs font-extrabold flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
            title="Centralizar câmera na sua posição"
          >
            <LocateFixed size={15} />
            <span className="hidden sm:inline">Centralizar</span>
          </button>

          <button
            type="button"
            onClick={onStopNavigation}
            className="px-3 py-2 bg-rose-600/80 hover:bg-rose-600 text-white rounded-xl text-xs font-extrabold flex items-center gap-1 transition-all cursor-pointer"
            title="Encerrar navegação"
          >
            <X size={15} />
            <span className="hidden sm:inline">Encerrar</span>
          </button>
        </div>
      </div>

    </div>
  );
};
