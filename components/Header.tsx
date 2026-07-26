import React from 'react';
import { Wrench, LogOut, User as UserIcon, Store, Moon, Sun, Crown } from 'lucide-react';
import { User } from '../types';

interface HeaderProps {
  user?: User | null;
  onLogout?: () => void;
  onProfileClick?: () => void;
  onPlanClick?: () => void;
  isDarkMode: boolean;
  toggleTheme: () => void;
}

export const Header: React.FC<HeaderProps> = ({ user, onLogout, onProfileClick, onPlanClick, isDarkMode, toggleTheme }) => {
  const isPremium = user?.plan === 'PRO' || user?.plan === 'PRIME';

  return (
    <header className="bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 sticky top-0 z-50 transition-colors duration-300 pt-[env(safe-area-inset-top)]">
      <div className="max-w-5xl mx-auto px-3 sm:px-4 h-14 sm:h-16 flex items-center justify-between">
        <div className="flex items-center gap-1.5 sm:gap-2 cursor-pointer" onClick={() => window.location.href = "/"}>
          <div className="bg-indigo-600 p-1.5 sm:p-2 rounded-lg text-white shadow-md shadow-indigo-200 dark:shadow-none">
            <Wrench size={18} className="sm:w-6 sm:h-6" />
          </div>
          <div>
            <h1 className="text-base sm:text-xl font-bold text-zinc-800 dark:text-zinc-100 leading-tight">FIX</h1>
            <p className="text-[9px] sm:text-xs text-zinc-500 dark:text-zinc-400 hidden sm:block">
              {user?.role === 'MECHANIC' ? 'Área do Parceiro' : 'Socorro em Cidades e Rodovias'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-4">
          <button
            onClick={toggleTheme}
            className="p-1.5 sm:p-2 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors"
            title={isDarkMode ? "Modo Claro" : "Modo Escuro"}
          >
            {isDarkMode ? <Sun size={16} className="sm:w-5 sm:h-5" /> : <Moon size={16} className="sm:w-5 sm:h-5" />}
          </button>

          {user ? (
            <div className="flex items-center gap-1.5 sm:gap-3">
              {/* Botão de Plano */}
              <button 
                id="plan-badge"
                onClick={onPlanClick}
                className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-[9px] sm:text-xs font-bold transition-all shadow-sm ${
                  isPremium 
                    ? 'bg-gradient-to-r from-amber-400 to-amber-600 text-white hover:shadow-amber-500/30' 
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                }`}
              >
                {isPremium ? <Crown size={9} className="sm:w-3 sm:h-3" fill="currentColor" /> : <Crown size={9} className="sm:w-3 sm:h-3" />}
                <span className="hidden xs:inline">{isPremium ? (user.role === 'MECHANIC' ? 'PRO' : 'PRIME') : 'Assinar'}</span>
                <span className="xs:hidden">{isPremium ? (user.role === 'MECHANIC' ? 'PRO' : 'PRIME') : '+'}</span>
              </button>

              <button 
                onClick={onProfileClick}
                className="hidden sm:flex flex-col items-end mr-2 hover:bg-zinc-50 dark:hover:bg-zinc-800 px-2 py-1 rounded-lg transition-colors text-right"
              >
                <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-200">
                  {user.role === 'MECHANIC' ? user.shopName : user.name}
                </span>
                <span className="text-[10px] uppercase tracking-wider text-indigo-600 dark:text-indigo-400 font-bold bg-indigo-50 dark:bg-indigo-900/30 px-2 rounded-full mt-0.5">
                  {user.role === 'MECHANIC' ? 'Parceiro' : 'Cliente'}
                </span>
              </button>
              
              <button 
                onClick={onProfileClick}
                className="w-7 h-7 sm:w-9 sm:h-9 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center text-zinc-500 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700 hover:border-indigo-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all cursor-pointer"
                title="Meu Perfil"
              >
                {user.role === 'MECHANIC' ? <Store size={14} className="sm:w-4.5 sm:h-4.5" /> : <UserIcon size={14} className="sm:w-4.5 sm:h-4.5" />}
              </button>

              <div className="w-px h-5 sm:h-8 bg-zinc-200 dark:bg-zinc-700 mx-0.5 sm:mx-1"></div>

              <button 
                onClick={onLogout}
                className="p-1 sm:p-2 text-zinc-400 dark:text-zinc-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-full transition-colors"
                title="Sair"
              >
                <LogOut size={14} className="sm:w-4.5 sm:h-4.5" />
              </button>
            </div>
          ) : (
            <div className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 font-medium">
              Bem-vindo
            </div>
          )}
        </div>
      </div>
    </header>
  );
};