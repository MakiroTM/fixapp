import React from 'react';
import { Home, Search, Heart, MessageCircle, User } from 'lucide-react';
import { motion } from 'motion/react';

interface BottomNavProps {
  currentView: string;
  onNavigate: (view: string) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentView, onNavigate }) => {
  const navItems = [
    { id: 'dashboard', icon: Home, label: 'Início' },
    { id: 'nearby', icon: Search, label: 'Buscar' },
    { id: 'favorites', icon: Heart, label: 'Favoritos' },
    { id: 'chat', icon: MessageCircle, label: 'Chat' },
    { id: 'profile', icon: User, label: 'Perfil' },
  ];

  return (
    <div 
      className="fixed bottom-0 left-0 right-0 z-50 z-bottom-nav pointer-events-none px-4 lg:hidden"
      style={{ paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom))' }}
    >
      <div className="bg-zinc-900/90 dark:bg-zinc-950/90 backdrop-blur-xl border border-zinc-800/60 shadow-[0_8px_32px_rgba(59,130,246,0.15)] rounded-3xl mx-auto max-w-md pointer-events-auto flex items-center justify-between px-3 py-2">
        {navItems.map((item) => {
          const isActive = currentView === item.id || 
                           (item.id === 'nearby' && currentView === 'workshop-detail');
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className="relative flex flex-col items-center justify-center w-[4.5rem] h-14 rounded-2xl transition-all duration-200"
            >
              {isActive && (
                <motion.div
                  layoutId="bottom-nav-active"
                  className="absolute inset-0 bg-blue-500/15 dark:bg-blue-500/20 rounded-2xl"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <Icon 
                size={20} 
                className={`relative z-10 transition-colors duration-200 ${
                  isActive ? 'text-blue-600 dark:text-blue-400' : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300'
                }`}
                strokeWidth={isActive ? 2.5 : 2}
              />
              <span 
                className={`relative z-10 text-[10px] mt-1 font-medium transition-colors duration-200 tracking-tight ${
                  isActive ? 'text-blue-600 dark:text-blue-400' : 'text-zinc-500 dark:text-zinc-400'
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
