import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Heart, Star, MapPin, Navigation, Phone, MessageCircle, 
  Trash2, ArrowLeft, ExternalLink, Search, Clock, ShieldCheck, Wrench 
} from 'lucide-react';
import { Coordinates, GroundingChunk } from '../types';
import { RouteModal } from './RouteModal';

interface FavoritesScreenProps {
  userLocation: Coordinates | null;
  onBack: () => void;
  onSelectWorkshop: (chunk: GroundingChunk) => void;
  onContact?: (name: string) => void;
}

const MOCK_FAVORITE_WORKSHOPS: GroundingChunk[] = [
  {
    maps: {
      title: 'AutoTech Centro Automotivo Master',
      uri: 'https://maps.google.com/?cid=1001',
      placeAnswerSources: {
        reviewSnippets: [
          { snippet: 'Especialistas em injeção eletrônica, freios ABS e mecânica geral com diagnóstico computadorizado.' }
        ]
      }
    }
  },
  {
    maps: {
      title: 'Guincho 24h & Socorro Reboque Brasil',
      uri: 'https://maps.google.com/?cid=1002',
      placeAnswerSources: {
        reviewSnippets: [
          { snippet: 'Atendimento emergencial de guincho rápido na cidade e rodovias. Chegada em até 20 minutos.' }
        ]
      }
    }
  },
  {
    maps: {
      title: 'Borracharia Express & Pneus Rápido',
      uri: 'https://maps.google.com/?cid=1003',
      placeAnswerSources: {
        reviewSnippets: [
          { snippet: 'Conserto de pneus, vulcanização e alinhamento 3D. Atendimento no local.' }
        ]
      }
    }
  }
];

const WORKSHOP_IMAGES = [
  'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=800&q=80'
];

export const FavoritesScreen: React.FC<FavoritesScreenProps> = ({
  userLocation,
  onBack,
  onSelectWorkshop,
  onContact
}) => {
  const [favoriteTitles, setFavoriteTitles] = useState<string[]>([]);
  const [favoriteList, setFavoriteList] = useState<GroundingChunk[]>([]);
  const [selectedRouteWorkshop, setSelectedRouteWorkshop] = useState<{title: string, lat?: number, lng?: number} | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Load favorite titles from localStorage
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('favoriteWorkshops') || '[]');
      if (Array.isArray(saved) && saved.length > 0) {
        setFavoriteTitles(saved);
        // Map saved titles to grounding chunks or mock list
        const list = saved.map((t: string) => ({
          maps: {
            title: t,
            uri: `https://maps.google.com/?q=${encodeURIComponent(t)}`,
            placeAnswerSources: {
              reviewSnippets: [{ snippet: 'Oficina salva em seus favoritos para rápido acesso e contato imediato.' }]
            }
          }
        }));
        setFavoriteList(list);
      } else {
        // Fallback default list if no custom favorites saved yet
        setFavoriteTitles(MOCK_FAVORITE_WORKSHOPS.map(w => w.maps?.title || ''));
        setFavoriteList(MOCK_FAVORITE_WORKSHOPS);
      }
    } catch (e) {
      console.error('Error loading favorites:', e);
      setFavoriteList(MOCK_FAVORITE_WORKSHOPS);
    }
  }, []);

  const removeFavorite = (title: string) => {
    const updated = favoriteTitles.filter(t => t !== title);
    setFavoriteTitles(updated);
    setFavoriteList(prev => prev.filter(item => item.maps?.title !== title));
    localStorage.setItem('favoriteWorkshops', JSON.stringify(updated));
  };

  const filteredList = favoriteList.filter(item => 
    (item.maps?.title || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex-1 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col min-h-screen transition-colors duration-300">
      {/* Header Bar */}
      <div className="sticky top-0 z-20 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl border-b border-zinc-200 dark:border-zinc-800/80 p-4 sm:p-5 flex items-center justify-between transition-colors">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2.5 bg-zinc-100 dark:bg-zinc-800/80 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-2xl transition-all cursor-pointer border border-zinc-200 dark:border-zinc-700/50"
            title="Voltar"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <Heart size={20} className="text-rose-500 fill-rose-500" />
              <span>Oficinas Favoritas</span>
            </h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              {filteredList.length} {filteredList.length === 1 ? 'oficina salva' : 'oficinas salvas'}
            </p>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-4xl mx-auto w-full p-4 sm:p-6 flex-1 flex flex-col gap-5">
        
        {/* Search filter if items exist */}
        {favoriteList.length > 0 && (
          <div className="relative">
            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar entre seus favoritos..."
              className="w-full bg-white dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-800/90 rounded-2xl pl-10 pr-4 py-3 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:border-indigo-500/80 focus:ring-1 focus:ring-indigo-500/50 shadow-xs transition-all"
            />
          </div>
        )}

        {/* Favorite Items List */}
        {filteredList.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AnimatePresence>
              {filteredList.map((item, idx) => {
                const title = item.maps?.title || 'Oficina Especializada';
                const snippet = item.maps?.placeAnswerSources?.reviewSnippets?.[0]?.snippet || 'Atendimento rápido e qualificado.';
                const image = WORKSHOP_IMAGES[idx % WORKSHOP_IMAGES.length];
                const rating = (4.7 + (idx % 3) * 0.1).toFixed(1);
                const distance = (1.2 + idx * 0.8).toFixed(1);

                return (
                  <motion.div
                    key={title}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="bg-white dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800/80 hover:border-indigo-500/40 rounded-3xl overflow-hidden shadow-lg shadow-zinc-200/50 dark:shadow-xl dark:shadow-black/40 flex flex-col justify-between group transition-all"
                  >
                    {/* Card Header Image */}
                    <div className="relative h-36 sm:h-40 w-full overflow-hidden bg-zinc-100 dark:bg-zinc-950">
                      <img
                        src={image}
                        alt={title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-zinc-950/20 to-transparent"></div>

                      {/* Top Badges */}
                      <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                        <span className="bg-emerald-500/90 backdrop-blur-md text-zinc-950 text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider shadow-md">
                          Aberto Agora
                        </span>

                        <button
                          onClick={() => removeFavorite(title)}
                          className="p-2 bg-zinc-950/80 backdrop-blur-md text-rose-400 hover:text-rose-300 hover:bg-rose-500/20 rounded-full transition-all border border-rose-500/30 cursor-pointer"
                          title="Remover dos favoritos"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>

                      {/* Bottom Info Overlay */}
                      <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between text-white">
                        <div className="flex items-center gap-1.5 bg-zinc-900/90 backdrop-blur-md px-2.5 py-1 rounded-xl border border-zinc-800 text-xs font-bold text-amber-400">
                          <Star size={14} className="fill-amber-400" />
                          <span>{rating}</span>
                        </div>
                        <div className="flex items-center gap-1 bg-zinc-900/90 backdrop-blur-md px-2.5 py-1 rounded-xl border border-zinc-800 text-xs font-medium text-zinc-300">
                          <MapPin size={13} className="text-indigo-400" />
                          <span>{distance} km</span>
                        </div>
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="p-4 flex-1 flex flex-col justify-between gap-3">
                      <div>
                        <h3 className="font-bold text-base text-zinc-900 dark:text-white line-clamp-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                          {title}
                        </h3>
                        <p className="text-xs text-zinc-600 dark:text-zinc-400 line-clamp-2 mt-1 leading-relaxed">
                          {snippet}
                        </p>
                      </div>

                      {/* Quick Action Buttons */}
                      <div className="grid grid-cols-3 gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800/60">
                        <button
                          onClick={() => setSelectedRouteWorkshop({ title })}
                          className="bg-indigo-50 dark:bg-indigo-600/20 hover:bg-indigo-100 dark:hover:bg-indigo-600/30 border border-indigo-200 dark:border-indigo-500/30 text-indigo-700 dark:text-indigo-300 rounded-xl py-2 text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                        >
                          <Navigation size={13} />
                          <span>Rota</span>
                        </button>

                        <button
                          onClick={() => onContact ? onContact(title) : window.open(`https://wa.me/5511999998888?text=Olá, vi a ${encodeURIComponent(title)} no FIX App.`, '_blank')}
                          className="bg-emerald-50 dark:bg-emerald-600/20 hover:bg-emerald-100 dark:hover:bg-emerald-600/30 border border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-300 rounded-xl py-2 text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                        >
                          <MessageCircle size={13} />
                          <span>Whats</span>
                        </button>

                        <button
                          onClick={() => onSelectWorkshop(item)}
                          className="bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700/80 rounded-xl py-2 text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                        >
                          <ExternalLink size={13} />
                          <span>Detalhes</span>
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        ) : (
          /* Empty Favorites State */
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800/80 rounded-3xl my-auto min-h-[50vh] shadow-xs">
            <div className="w-20 h-20 bg-rose-500/10 border border-rose-500/20 rounded-3xl flex items-center justify-center text-rose-500 mb-4 shadow-xl shadow-rose-500/5">
              <Heart size={40} className="fill-rose-500/20" />
            </div>
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">Sua lista está vazia</h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-sm mb-6 leading-relaxed">
              Você ainda não salvou nenhuma oficina ou guincho nos favoritos. Toque no ícone de coração em qualquer estabelecimento para salvá-lo aqui.
            </p>
            <button
              onClick={onBack}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-6 py-3 rounded-2xl shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all cursor-pointer"
            >
              <Wrench size={18} />
              <span>Explorar Oficinas no Mapa</span>
            </button>
          </div>
        )}
      </div>

      {/* Route Modal */}
      {selectedRouteWorkshop && (
        <RouteModal
          isOpen={!!selectedRouteWorkshop}
          onClose={() => setSelectedRouteWorkshop(null)}
          destinationTitle={selectedRouteWorkshop.title}
          userLat={userLocation?.latitude}
          userLng={userLocation?.longitude}
        />
      )}
    </div>
  );
};
