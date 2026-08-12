import React from 'react';
import { Wrench, LogOut, User as UserIcon, Store, Moon, Sun, Crown, Map as MapIcon } from 'lucide-react';
import { User } from '../types';

interface HeaderProps {
  user?: User | null;
  onLogout?: () => void;
  onProfileClick?: () => void;
  onPlanClick?: () => void;
  onHomeClick?: () => void;
  onSosClick?: () => void;
  onMapClick?: () => void;
  isDarkMode: boolean;
  toggleTheme: () => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  user, 
  onLogout, 
  onProfileClick, 
  onPlanClick, 
  onHomeClick,
  onSosClick,
  onMapClick,
  isDarkMode, 
  toggleTheme 
}) => {
  const isPremium = user?.plan === 'PRO' || user?.plan === 'PRIME';

  return (
    <header className="bg-zinc-950 border-b border-zinc-900 sticky top-0 z-50 transition-colors duration-300 pt-[env(safe-area-inset-top)]">
      <div className="max-w-5xl mx-auto px-3 sm:px-4 h-14 sm:h-16 flex items-center justify-between">
        <div className="flex items-center gap-1.5 sm:gap-2 cursor-pointer" onClick={onHomeClick ? onHomeClick : () => window.location.href = "/"}>
          <div className="bg-blue-600 p-1.5 sm:p-2 rounded-lg text-white shadow-md shadow-blue-900/30">
            <Wrench size={18} className="sm:w-6 sm:h-6" />
          </div>
          <div>
            <h1 className="text-base sm:text-xl font-bold text-white leading-tight">FIX</h1>
            <p className="text-[9px] sm:text-xs text-zinc-400 hidden sm:block">
              {user?.role === 'MECHANIC' ? 'Área do Parceiro' : 'Socorro em Cidades e Rodovias'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-3">
          {user && user.role === 'CLIENT' && onMapClick && (
            <button
              onClick={onMapClick}
              className="p-1.5 sm:p-2 bg-blue-900/20 text-blue-400 hover:bg-blue-900/40 rounded-full transition-colors flex items-center gap-1.5"
              title="Oficinas Próximas"
            >
              <MapIcon size={16} className="sm:w-5 sm:h-5" />
              <span className="hidden sm:inline text-xs font-bold">Oficinas</span>
            </button>
          )}

          {user && user.role === 'CLIENT' && onSosClick && (
            <button
              onClick={onSosClick}
              className="relative group flex items-center gap-1.5 bg-gradient-to-r from-rose-600 via-red-600 to-rose-700 hover:from-rose-500 hover:to-red-500 text-white px-3 py-1.5 rounded-full text-xs font-black transition-all duration-300 shadow-md shadow-rose-600/40 hover:scale-105 active:scale-95 border border-rose-400/30 overflow-hidden"
              title="Abrir Central SOS Emergência"
            >
              <span className="absolute -inset-1 bg-gradient-to-r from-rose-500 via-red-500 to-amber-500 opacity-60 blur-xs animate-pulse rounded-full pointer-events-none"></span>
              <span className="relative z-10 flex items-center gap-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-300 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-zinc-950"></span>
                </span>
                <span className="tracking-wider">SOS</span>
              </span>
            </button>
          )}

          

          {user ? (
            <div className="flex items-center gap-1.5 sm:gap-3">
              {/* Botão de Plano */}
              <button 
                id="plan-badge"
                onClick={onPlanClick}
                className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-[9px] sm:text-xs font-bold transition-all shadow-sm ${
                  isPremium 
                    ? 'bg-gradient-to-r from-amber-400 to-amber-600 text-white hover:shadow-amber-500/30' 
                    : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800'
                }`}
              >
                {isPremium ? <Crown size={9} className="sm:w-3 sm:h-3" fill="currentColor" /> : <Crown size={9} className="sm:w-3 sm:h-3" />}
                <span className="hidden xs:inline">{isPremium ? (user.role === 'MECHANIC' ? 'PRO' : 'PRIME') : 'Assinar'}</span>
                <span className="xs:hidden">{isPremium ? (user.role === 'MECHANIC' ? 'PRO' : 'PRIME') : '+'}</span>
              </button>

              <button 
                onClick={onProfileClick}
                className="hidden sm:flex flex-col items-end mr-2 hover:bg-zinc-900 dark:hover:bg-zinc-800 px-2 py-1 rounded-lg transition-colors text-right"
              >
                <span className="text-sm font-semibold text-zinc-200">
                  {user.role === 'MECHANIC' ? user.shopName : user.name}
                </span>
                <span className="text-[10px] uppercase tracking-wider text-blue-400 font-bold bg-blue-900/20 px-2 rounded-full mt-0.5">
                  {user.role === 'MECHANIC' ? 'Parceiro' : 'Cliente'}
                </span>
              </button>
              
              <button 
                onClick={onProfileClick}
                className="w-7 h-7 sm:w-9 sm:h-9 bg-zinc-900 rounded-full flex items-center justify-center text-zinc-400 border border-zinc-800 hover:border-blue-700 hover:text-blue-400 dark:hover:text-indigo-400 transition-all cursor-pointer"
                title="Meu Perfil"
              >
                {user.role === 'MECHANIC' ? <Store size={14} className="sm:w-4.5 sm:h-4.5" /> : <UserIcon size={14} className="sm:w-4.5 sm:h-4.5" />}
              </button>

              <div className="w-px h-5 sm:h-8 bg-zinc-800 mx-0.5 sm:mx-1"></div>

              <button 
                onClick={onLogout}
                className="p-1 sm:p-2 text-zinc-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-full transition-colors"
                title="Sair"
              >
                <LogOut size={14} className="sm:w-4.5 sm:h-4.5" />
              </button>
            </div>
          ) : (
            <div className="text-xs sm:text-sm text-zinc-400 font-medium">
              Bem-vindo
            </div>
          )}
        </div>
      </div>
    </header>
  );
};