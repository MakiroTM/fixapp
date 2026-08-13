import React, { useState, useEffect } from 'react';
import { 
  Home, Map, AlertTriangle, Heart, MessageCircle, User as UserIcon, 
  Crown, X, Star, Phone, Navigation, Store, ExternalLink, ShieldCheck, 
  Sparkles, ChevronRight, Wrench, Car, Bike, Truck, Zap, Info, MapPin, Search
} from 'lucide-react';
import { User, Coordinates, GroundingChunk } from '../types';
import { VerifiedBadge } from './VerifiedBadge';
import { RouteModal } from './RouteModal';

interface DesktopSidebarProps {
  user: User;
  currentView: string;
  onNavigate: (view: string) => void;
  selectedWorkshop: GroundingChunk | null;
  onClearSelectedWorkshop: () => void;
  onSelectWorkshop: (chunk: GroundingChunk) => void;
  onContactWorkshop?: (name: string) => void;
  location: Coordinates | null;
  isDetectingLocation: boolean;
  locationError: string | null;
}

const getWorkshopStatus = (name: string = '') => {
  const hash = name.length;
  if (hash % 5 === 0) return { label: 'Fechado', color: 'text-red-500', bg: 'bg-red-500/10 border-red-500/20' };
  if (hash % 3 === 0) return { label: 'Ocupado', color: 'text-amber-500', bg: 'bg-amber-500/10 border-amber-500/20' };
  return { label: 'Aberto Agora', color: 'text-emerald-500', bg: 'bg-emerald-500/10 border-emerald-500/20' };
};

export const DesktopSidebar: React.FC<DesktopSidebarProps> = ({
  user,
  currentView,
  onNavigate,
  selectedWorkshop,
  onClearSelectedWorkshop,
  onSelectWorkshop,
  onContactWorkshop,
  location,
  isDetectingLocation,
  locationError
}) => {
  const [isRouteOpen, setIsRouteOpen] = useState(false);
  const [favoriteNames, setFavoriteNames] = useState<string[]>([]);
  const [isFavorite, setIsFavorite] = useState(false);

  const maps = selectedWorkshop?.maps;
  const workshopTitle = maps?.title || '';
  const snippet = maps?.placeAnswerSources?.reviewSnippets?.[0]?.snippet || 
    'Oficina credenciada no ecossistema FIX com diagnóstico ágil, peças originais e garantia de atendimento.';

  // Sync favorites state
  useEffect(() => {
    const savedFavs = JSON.parse(localStorage.getItem('favoriteWorkshops') || '[]');
    setFavoriteNames(savedFavs);
    if (workshopTitle) {
      setIsFavorite(savedFavs.includes(workshopTitle));
    }
  }, [workshopTitle, selectedWorkshop]);

  const toggleFavorite = () => {
    if (!workshopTitle) return;
    const savedFavs: string[] = JSON.parse(localStorage.getItem('favoriteWorkshops') || '[]');
    let updated: string[];
    if (savedFavs.includes(workshopTitle)) {
      updated = savedFavs.filter(t => t !== workshopTitle);
      setIsFavorite(false);
    } else {
      updated = [...savedFavs, workshopTitle];
      setIsFavorite(true);
    }
    localStorage.setItem('favoriteWorkshops', JSON.stringify(updated));
    setFavoriteNames(updated);
  };

  const navItems = [
    { id: 'dashboard', label: 'Início', icon: Home },
    { id: 'nearby', label: 'Buscar Oficinas', icon: Map, badge: 'Mapa Live' },
    { id: 'sos', label: 'Emergência SOS', icon: AlertTriangle, color: 'text-rose-500 dark:text-rose-400' },
    { id: 'favorites', label: 'Favoritos', icon: Heart, count: favoriteNames.length },
    { id: 'chat', label: 'Mensagens', icon: MessageCircle },
    { id: 'profile', label: 'Meu Perfil', icon: UserIcon },
    { id: 'subscription', label: 'Assinatura & Planos', icon: Crown, highlight: true },
  ];

  return (
    <aside className="hidden lg:flex flex-col w-80 xl:w-88 bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 shrink-0 select-none overflow-y-auto h-[calc(100vh-4rem)] sticky top-16 z-30 transition-all duration-300 shadow-xs">
      
      {/* Route Modal Triggered from Sidebar */}
      {selectedWorkshop && (
        <RouteModal
          isOpen={isRouteOpen}
          onClose={() => setIsRouteOpen(false)}
          destinationTitle={workshopTitle}
          destinationLat={location?.latitude ? location.latitude + 0.01 : -23.5505}
          destinationLng={location?.longitude ? location.longitude + 0.01 : -46.6333}
          userLat={location?.latitude}
          userLng={location?.longitude}
        />
      )}

      {/* Sidebar Header & User Card */}
      <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="text-[11px] font-black tracking-wider uppercase text-zinc-400 dark:text-zinc-500">
              Navegação Desktop
            </span>
          </div>
          <span className="px-2 py-0.5 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 text-[10px] font-extrabold rounded-full">
            FIX PC
          </span>
        </div>

        <div className="mt-3 flex items-center gap-3 p-2.5 rounded-2xl bg-white dark:bg-zinc-800/80 border border-zinc-200/80 dark:border-zinc-700/60 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black text-sm shadow-sm">
            {user.role === 'MECHANIC' ? <Store size={20} /> : <UserIcon size={20} />}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-zinc-900 dark:text-white text-xs truncate">
              {user.role === 'MECHANIC' ? user.shopName : user.name}
            </h4>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                {user.role === 'MECHANIC' ? 'Mecânico' : 'Motorista'}
              </span>
              <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                user.plan === 'PRIME' || user.plan === 'PRO'
                  ? 'bg-amber-500 text-zinc-950 font-black'
                  : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300'
              }`}>
                {user.plan || 'FREE'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Desktop Navigation Items */}
      <div className="p-3 border-b border-zinc-100 dark:border-zinc-800 space-y-1">
        <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
          Menu Principal
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : item.id === 'sos'
                  ? 'bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/50 border border-rose-200/50 dark:border-rose-800/40'
                  : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon size={17} className={item.color || (isActive ? 'text-white' : 'text-zinc-500 dark:text-zinc-400')} />
                <span>{item.label}</span>
              </div>

              {item.badge && (
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                  isActive ? 'bg-white/20 text-white' : 'bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400'
                }`}>
                  {item.badge}
                </span>
              )}

              {item.count !== undefined && item.count > 0 && (
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                  isActive ? 'bg-white/20 text-white' : 'bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400'
                }`}>
                  {item.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* SELECTED WORKSHOP DETAILS SECTION */}
      <div className="flex-1 p-3 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between px-2 py-1 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 flex items-center gap-1.5">
              <Store size={12} className="text-indigo-500" />
              Oficina Selecionada
            </span>
            {selectedWorkshop && (
              <button
                onClick={onClearSelectedWorkshop}
                className="p-1 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors cursor-pointer"
                title="Limpar Seleção"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {selectedWorkshop ? (
            /* ACTIVE SELECTED WORKSHOP CARD */
            <div className="bg-gradient-to-b from-indigo-50/50 to-white dark:from-zinc-800/60 dark:to-zinc-850 p-3.5 rounded-2xl border border-indigo-200/80 dark:border-zinc-700 shadow-sm space-y-3 animate-fade-in">
              
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-1">
                    <VerifiedBadge rating={4.8} size="sm" />
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getWorkshopStatus(workshopTitle).bg} ${getWorkshopStatus(workshopTitle).color}`}>
                      {getWorkshopStatus(workshopTitle).label}
                    </span>
                  </div>
                  <h3 className="font-extrabold text-zinc-900 dark:text-white text-sm leading-snug truncate">
                    {workshopTitle}
                  </h3>
                </div>
              </div>

              <div className="flex items-center gap-3 text-xs text-zinc-600 dark:text-zinc-300 font-medium pt-1 border-t border-zinc-200/60 dark:border-zinc-700/60">
                <div className="flex items-center gap-1 text-amber-500 font-bold">
                  <Star size={13} className="fill-amber-500" />
                  4.8
                </div>
                <span className="text-zinc-300 dark:text-zinc-600">•</span>
                <div className="flex items-center gap-1 text-zinc-500">
                  <MapPin size={12} />
                  1.2 km de você
                </div>
              </div>

              <p className="text-[11px] text-zinc-600 dark:text-zinc-400 line-clamp-2 leading-relaxed bg-white/80 dark:bg-zinc-900/60 p-2 rounded-xl border border-zinc-100 dark:border-zinc-800">
                {snippet}
              </p>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsRouteOpen(true)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-xs cursor-pointer"
                >
                  <Navigation size={13} />
                  <span>Ver Rota</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (onContactWorkshop) onContactWorkshop(workshopTitle);
                    onNavigate('chat');
                  }}
                  className="bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-900 dark:text-white py-2 px-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <MessageCircle size={13} className="text-indigo-500" />
                  <span>Negociar</span>
                </button>
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-zinc-200/60 dark:border-zinc-700/60 text-[11px]">
                <button
                  type="button"
                  onClick={toggleFavorite}
                  className={`flex items-center gap-1 font-bold transition-colors cursor-pointer ${
                    isFavorite ? 'text-rose-500' : 'text-zinc-500 dark:text-zinc-400 hover:text-rose-500'
                  }`}
                >
                  <Heart size={13} className={isFavorite ? 'fill-rose-500' : ''} />
                  <span>{isFavorite ? 'Favoritada' : 'Favoritar'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => onSelectWorkshop(selectedWorkshop)}
                  className="text-indigo-600 dark:text-indigo-400 hover:underline font-bold flex items-center gap-0.5 cursor-pointer"
                >
                  <span>Página Completa</span>
                  <ChevronRight size={13} />
                </button>
              </div>

            </div>
          ) : (
            /* EMPTY STATE CARD WHEN NO WORKSHOP IS SELECTED */
            <div className="bg-zinc-50/80 dark:bg-zinc-800/40 p-4 rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-700/80 text-center space-y-3">
              <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center mx-auto">
                <MapPin size={20} />
              </div>
              <div>
                <h4 className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                  Nenhuma Oficina Selecionada
                </h4>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1 leading-relaxed">
                  Clique em qualquer marcador no mapa ou lista para visualizar os detalhes, rotas e negociar direto aqui no painel.
                </p>
              </div>

              <button
                onClick={() => onNavigate('nearby')}
                className="w-full bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/80 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/60 py-2 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Search size={13} />
                <span>Explorar Mapa Interativo</span>
              </button>
            </div>
          )}
        </div>

        {/* Live GPS & App Info Footer */}
        <div className="pt-3 mt-3 border-t border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center justify-between text-[11px] text-zinc-500 dark:text-zinc-400 px-1">
            <span className="font-semibold">GPS no PC:</span>
            {isDetectingLocation ? (
              <span className="text-blue-500 font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-ping"></span>
                Detectando...
              </span>
            ) : locationError ? (
              <span className="text-amber-500 font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-amber-500 rounded-full"></span>
                Sinal Limitado
              </span>
            ) : location ? (
              <span className="text-emerald-500 font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                Localização Real Ativa
              </span>
            ) : (
              <span className="text-zinc-400">Desativado</span>
            )}
          </div>
        </div>

      </div>

    </aside>
  );
};
