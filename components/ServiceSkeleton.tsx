import React from 'react';

interface ServiceSkeletonProps {
  count?: number;
  title?: string;
  subtitle?: string;
}

export const ServiceSkeleton: React.FC<ServiceSkeletonProps> = ({
  count = 3,
  title = "Buscando mecânicos e oficinas próximas...",
  subtitle = "Analisando dados de localização, raio de proximidade e disponibilidade em tempo real."
}) => {
  return (
    <div className="mt-8 sm:mt-12 space-y-6 animate-fade-in">
      
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1 sm:px-2">
        <div className="flex items-center gap-3">
          <div className="h-7 w-1.5 bg-indigo-500/50 rounded-full animate-pulse" />
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <h3 className="text-lg sm:text-2xl font-bold text-zinc-700 dark:text-zinc-200">
                {title}
              </h3>
              <div className="px-2.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 text-xs font-semibold animate-pulse border border-indigo-200 dark:border-indigo-800">
                Localizando
              </div>
            </div>
            <p className="text-xs text-zinc-400 dark:text-zinc-500">
              {subtitle}
            </p>
          </div>
        </div>
      </div>

      {/* Text block Skeleton (Simulating AI tips / overview) */}
      <div className="bg-white dark:bg-zinc-800 p-5 sm:p-7 rounded-2xl border border-zinc-200 dark:border-zinc-700 shadow-sm space-y-3">
        <div className="h-4 bg-zinc-200 dark:bg-zinc-700/80 rounded-md w-3/4 animate-pulse" />
        <div className="h-3.5 bg-zinc-200/70 dark:bg-zinc-700/50 rounded-md w-full animate-pulse" />
        <div className="h-3.5 bg-zinc-200/70 dark:bg-zinc-700/50 rounded-md w-5/6 animate-pulse" />
      </div>

      {/* Category filter skeleton bar */}
      <div className="p-3 bg-zinc-100/80 dark:bg-zinc-850/80 rounded-2xl border border-zinc-200/60 dark:border-zinc-700/50 flex items-center gap-2 overflow-x-auto">
        <div className="h-7 w-28 bg-zinc-200 dark:bg-zinc-700/70 rounded-xl animate-pulse shrink-0" />
        <div className="h-7 w-32 bg-zinc-200 dark:bg-zinc-700/70 rounded-xl animate-pulse shrink-0" />
        <div className="h-7 w-36 bg-zinc-200 dark:bg-zinc-700/70 rounded-xl animate-pulse shrink-0" />
        <div className="h-7 w-28 bg-zinc-200 dark:bg-zinc-700/70 rounded-xl animate-pulse shrink-0" />
      </div>

      {/* Grid of Skeleton Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {Array.from({ length: count }).map((_, index) => (
          <div
            key={index}
            className="bg-white dark:bg-zinc-800 rounded-2xl p-4 sm:p-5 border border-zinc-200 dark:border-zinc-700/80 shadow-sm space-y-4 animate-pulse relative overflow-hidden"
            style={{ animationDelay: `${index * 150}ms` }}
          >
            {/* Shimmer gradient overlay effect */}
            <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-zinc-100/40 dark:via-zinc-700/20 to-transparent animate-[shimmer_2s_infinite]" />

            {/* Header / Title block */}
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-zinc-200 dark:bg-zinc-700 shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-zinc-200 dark:bg-zinc-700 rounded-md w-4/5" />
                <div className="flex items-center gap-2">
                  <div className="h-3 bg-zinc-200 dark:bg-zinc-700 rounded-md w-24" />
                  <div className="h-3 bg-amber-200 dark:bg-amber-900/40 rounded-md w-10" />
                </div>
              </div>
            </div>

            {/* Review Snippet Box Placeholder */}
            <div className="bg-zinc-50 dark:bg-zinc-900/60 p-3 rounded-xl border border-zinc-100 dark:border-zinc-800 space-y-1.5">
              <div className="h-3 bg-zinc-200 dark:bg-zinc-700/80 rounded w-full" />
              <div className="h-3 bg-zinc-200 dark:bg-zinc-700/80 rounded w-2/3" />
            </div>

            {/* Footer Buttons Placeholder */}
            <div className="pt-2 flex items-center justify-between gap-2 border-t border-zinc-100 dark:border-zinc-700/50">
              <div className="h-8 bg-zinc-200 dark:bg-zinc-700/70 rounded-xl w-24" />
              <div className="h-8 bg-indigo-200 dark:bg-indigo-900/50 rounded-xl w-28" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
