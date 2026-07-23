import React, { useState } from 'react';
import { ShieldCheck, CheckCircle2, Star, Info, Award } from 'lucide-react';

interface VerifiedBadgeProps {
  rating?: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
  minRatingThreshold?: number;
}

export const VerifiedBadge: React.FC<VerifiedBadgeProps> = ({
  rating = 4.8,
  size = 'md',
  showLabel = true,
  className = '',
  minRatingThreshold = 4.5
}) => {
  const [showTooltip, setShowTooltip] = useState(false);

  // Verification is granted if rating meets threshold (or default high rating)
  const isVerified = rating >= minRatingThreshold;

  if (!isVerified) return null;

  // Size configurations
  const sizeClasses = {
    sm: {
      container: 'px-1.5 py-0.5 text-[10px] gap-1',
      iconSize: 12,
      starSize: 10
    },
    md: {
      container: 'px-2.5 py-1 text-xs gap-1.5',
      iconSize: 14,
      starSize: 12
    },
    lg: {
      container: 'px-3.5 py-1.5 text-sm gap-2',
      iconSize: 18,
      starSize: 15
    }
  }[size];

  return (
    <div className="relative inline-block">
      <button
        type="button"
        onClick={() => setShowTooltip(!showTooltip)}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className={`inline-flex items-center font-bold rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 dark:from-emerald-600 dark:to-teal-700 text-white shadow-sm shadow-emerald-500/20 hover:shadow-emerald-500/30 hover:scale-105 active:scale-95 transition-all cursor-pointer select-none border border-emerald-400/30 ${sizeClasses.container} ${className}`}
        title="Verificado FIX • Alta Avaliação"
      >
        <ShieldCheck size={sizeClasses.iconSize} className="text-emerald-100 fill-emerald-400/30 shrink-0" />
        {showLabel && (
          <span className="tracking-tight flex items-center gap-1">
            <span>Verificado</span>
            {rating && (
              <span className="flex items-center text-amber-200 bg-emerald-900/30 px-1 rounded text-[0.85em] font-black">
                <Star size={sizeClasses.starSize} className="fill-amber-300 text-amber-300 mr-0.5" />
                {rating.toFixed(1)}
              </span>
            )}
          </span>
        )}
      </button>

      {/* Popover Tooltip for Trust Info */}
      {showTooltip && (
        <div className="absolute left-0 bottom-full mb-2 z-50 w-64 p-3 bg-zinc-900 dark:bg-zinc-950 text-white rounded-xl shadow-xl border border-emerald-500/30 text-xs animate-fade-in-up">
          <div className="flex items-center gap-2 mb-1.5 text-emerald-400 font-bold border-b border-zinc-800 pb-1.5">
            <Award size={16} />
            <span>Selo de Qualidade & Confiança</span>
          </div>
          <p className="text-zinc-300 leading-relaxed mb-2">
            Este prestador possui nota de avaliação excelente (<strong className="text-amber-300">{rating.toFixed(1)} ★</strong>) e verificação cadastral confirmada pela plataforma FIX.
          </p>
          <div className="flex items-center gap-1.5 text-[10px] text-emerald-300 font-semibold bg-emerald-950/60 p-1.5 rounded-lg border border-emerald-800/40">
            <CheckCircle2 size={12} className="shrink-0" />
            <span>Garantia de atendimento e satisfação</span>
          </div>
        </div>
      )}
    </div>
  );
};
