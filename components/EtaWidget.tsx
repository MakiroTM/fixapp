import React, { useState, useEffect } from 'react';
import { Clock, Navigation, MapPin, Gauge, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { ServiceStatus, Coordinates } from '../types';
import { calculateDynamicETA, ETACalculationResult } from '../services/locationUtils';

interface EtaWidgetProps {
  status: ServiceStatus;
  userCoords?: Coordinates | null;
  mechanicCoords?: Coordinates | null;
  initialEtaMinutes?: number;
  initialDistanceKm?: number;
  trafficCondition?: 'LIVRE' | 'MODERADO' | 'INTENSO';
  compact?: boolean;
}

export const EtaWidget: React.FC<EtaWidgetProps> = ({
  status,
  userCoords,
  mechanicCoords,
  initialEtaMinutes,
  initialDistanceKm,
  trafficCondition: customTraffic,
  compact = false
}) => {
  const [etaData, setEtaData] = useState<ETACalculationResult | null>(null);
  const [remainingSeconds, setRemainingSeconds] = useState<number>(0);
  const [lastGpsSync, setLastGpsSync] = useState<string>('agora');

  // Compute ETA on mount or when coordinates/status change
  useEffect(() => {
    const calculated = calculateDynamicETA(userCoords, mechanicCoords);
    
    // Override with custom initial values if provided
    if (initialEtaMinutes) {
      calculated.etaMinutes = initialEtaMinutes;
      calculated.formattedEta = `${initialEtaMinutes} min`;
    }
    if (initialDistanceKm) {
      calculated.distanceKm = initialDistanceKm;
    }
    if (customTraffic) {
      calculated.trafficCondition = customTraffic;
    }

    setEtaData(calculated);
    setRemainingSeconds(calculated.etaMinutes * 60);
  }, [userCoords?.latitude, userCoords?.longitude, mechanicCoords?.latitude, mechanicCoords?.longitude, initialEtaMinutes, initialDistanceKm, customTraffic]);

  // Live countdown timer when mechanic is EN_ROUTE
  useEffect(() => {
    if (status !== 'EN_ROUTE' && status !== 'PENDING') return;

    const timer = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) return 0;
        return prev - 1;
      });
    }, 1000);

    // Update GPS sync label every few seconds
    const gpsTimer = setInterval(() => {
      const secs = Math.floor(Math.random() * 15) + 5;
      setLastGpsSync(`há ${secs}s`);
    }, 12000);

    return () => {
      clearInterval(timer);
      clearInterval(gpsTimer);
    };
  }, [status]);

  if (!etaData) return null;

  // Format countdown text (mm:ss or mm min)
  const displayMinutes = Math.floor(remainingSeconds / 60);
  const displaySeconds = remainingSeconds % 60;
  const formattedCountdown = displayMinutes > 0 
    ? `${displayMinutes} min ${displaySeconds < 10 ? '0' : ''}${displaySeconds}s`
    : `${displaySeconds}s`;

  // Traffic badge styling
  const trafficStyles = {
    LIVRE: { label: 'Trânsito Livre', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' },
    MODERADO: { label: 'Trânsito Moderado', color: 'bg-amber-500/20 text-amber-400 border-amber-500/40' },
    INTENSO: { label: 'Trânsito Intenso', color: 'bg-rose-500/20 text-rose-400 border-rose-500/40' }
  }[etaData.trafficCondition];

  // If compact view (for headers or chat)
  if (compact) {
    return (
      <div className="inline-flex items-center gap-2 bg-indigo-950/80 border border-indigo-500/40 px-2.5 py-1 rounded-full text-xs font-semibold text-indigo-200">
        <Navigation size={12} className="text-indigo-400 animate-pulse" />
        <span>{etaData.distanceKm} km</span>
        <span className="text-indigo-500">•</span>
        <Clock size={12} className="text-amber-400" />
        <span className="font-bold text-amber-300">
          {status === 'EN_ROUTE' ? `${displayMinutes} min` : etaData.formattedEta}
        </span>
      </div>
    );
  }

  // Full detailed ETA widget card
  return (
    <div className="bg-gradient-to-r from-zinc-950 via-zinc-900 to-indigo-950/60 border border-indigo-500/30 rounded-xl p-4 sm:p-5 shadow-xl space-y-3">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-indigo-600/30 border border-indigo-500/50 rounded-lg text-indigo-300">
            <Clock size={18} className={status === 'EN_ROUTE' ? 'animate-spin' : ''} />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-indigo-400">
              Previsão de Chegada (ETA)
            </span>
            <p className="text-xs text-zinc-300 font-medium">Cálculo dinâmico via GPS & Tráfego</p>
          </div>
        </div>

        {/* Traffic Badge */}
        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${trafficStyles.color}`}>
          {trafficStyles.label}
        </span>
      </div>

      {/* Main Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1">
        {/* Metric 1: ETA Time */}
        <div className="bg-zinc-900/90 border border-zinc-800 p-3 rounded-xl flex flex-col justify-center">
          <div className="flex items-center gap-1.5 text-zinc-400 text-[11px] font-medium mb-1">
            <Clock size={14} className="text-amber-400" />
            <span>Tempo Estimado</span>
          </div>
          {status === 'EN_ROUTE' ? (
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-amber-400 tracking-tight">
                {displayMinutes > 0 ? displayMinutes : '<1'}
              </span>
              <span className="text-xs font-bold text-amber-300">min contagem</span>
            </div>
          ) : status === 'IN_PROGRESS' ? (
            <span className="text-lg font-black text-indigo-400">No local</span>
          ) : status === 'COMPLETED' ? (
            <span className="text-lg font-black text-emerald-400">Atendido</span>
          ) : (
            <span className="text-xl font-black text-amber-400">{etaData.formattedEta}</span>
          )}
        </div>

        {/* Metric 2: Distance */}
        <div className="bg-zinc-900/90 border border-zinc-800 p-3 rounded-xl flex flex-col justify-center">
          <div className="flex items-center gap-1.5 text-zinc-400 text-[11px] font-medium mb-1">
            <MapPin size={14} className="text-blue-400" />
            <span>Distância Atual</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-black text-blue-400 tracking-tight">{etaData.distanceKm}</span>
            <span className="text-xs font-bold text-blue-300">km de você</span>
          </div>
        </div>

        {/* Metric 3: Live GPS Sync status */}
        <div className="col-span-2 sm:col-span-1 bg-zinc-900/90 border border-zinc-800 p-3 rounded-xl flex flex-col justify-center">
          <div className="flex items-center gap-1.5 text-zinc-400 text-[11px] font-medium mb-1">
            <Navigation size={14} className="text-emerald-400" />
            <span>Sinal GPS Socorrista</span>
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-bold text-emerald-400">Ativo ({lastGpsSync})</span>
          </div>
        </div>
      </div>

      {/* Detailed Status Bar Text */}
      <div className="text-xs text-zinc-400 bg-zinc-900/60 p-2.5 rounded-lg border border-zinc-800 flex items-center justify-between">
        <span className="flex items-center gap-1.5">
          <Gauge size={14} className="text-indigo-400" />
          Velocidade média estimada: <strong className="text-zinc-200">32 km/h</strong>
        </span>
        {status === 'EN_ROUTE' && (
          <span className="text-[11px] font-mono text-amber-300 font-semibold animate-pulse">
            ⏱️ {formattedCountdown}
          </span>
        )}
      </div>
    </div>
  );
};
