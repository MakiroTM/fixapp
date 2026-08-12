import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, MapPin, Navigation, Phone, MessageCircle, Star, Heart, 
  Share2, Clock, ShieldCheck, CheckCircle2, Wrench, Award, DollarSign,
  AlertCircle, ThumbsUp, ChevronRight
} from 'lucide-react';
import { GroundingChunk, Coordinates } from '../types';
import { VerifiedBadge } from './VerifiedBadge';
import { RouteModal } from './RouteModal';
import { MapComponent } from './MapComponent';

interface WorkshopDetailScreenProps {
  chunk: GroundingChunk;
  userLocation: Coordinates | null;
  onBack: () => void;
  onContact: (name: string) => void;
}

export const WorkshopDetailScreen: React.FC<WorkshopDetailScreenProps> = ({
  chunk,
  userLocation,
  onBack,
  onContact
}) => {
  const maps = chunk.maps;
  const title = maps?.title || 'Oficina Mecânica Especializada';
  const snippet = maps?.placeAnswerSources?.reviewSnippets?.[0]?.snippet || 
    'Oficina altamente qualificada com suporte especializado para revisão, diagnóstico computadorizado, freios, suspensão e socorro ágil.';

  const [isFavorite, setIsFavorite] = useState(false);
  const [isRouteOpen, setIsRouteOpen] = useState(false);
  const [rating, setRating] = useState(4.8);
  const [ratingCount, setRatingCount] = useState(24);
  const [userRatingInput, setUserRatingInput] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'services' | 'reviews' | 'map'>('overview');
  const [copiedShare, setCopiedShare] = useState(false);

  // Load existing rating data from localStorage
  useEffect(() => {
    const currentRatings = JSON.parse(localStorage.getItem('mechanicRatings') || '{}');
    const mechanicData = currentRatings[title];
    if (mechanicData && mechanicData.count > 0) {
      setRating(mechanicData.total / mechanicData.count);
      setRatingCount(mechanicData.count);
    }
    // Check saved favorites
    const favs = JSON.parse(localStorage.getItem('favoriteWorkshops') || '[]');
    if (favs.includes(title)) {
      setIsFavorite(true);
    }
  }, [title]);

  const toggleFavorite = () => {
    const favs: string[] = JSON.parse(localStorage.getItem('favoriteWorkshops') || '[]');
    let updated: string[];
    if (favs.includes(title)) {
      updated = favs.filter(t => t !== title);
      setIsFavorite(false);
    } else {
      updated = [...favs, title];
      setIsFavorite(true);
    }
    localStorage.setItem('favoriteWorkshops', JSON.stringify(updated));
  };

  const handleUserRate = (stars: number) => {
    setUserRatingInput(stars);
    const currentRatings = JSON.parse(localStorage.getItem('mechanicRatings') || '{}');
    const mechanicData = currentRatings[title] || { total: 4.8 * 23, count: 23 };
    const newTotal = mechanicData.total + stars;
    const newCount = mechanicData.count + 1;
    currentRatings[title] = { total: newTotal, count: newCount };
    localStorage.setItem('mechanicRatings', JSON.stringify(currentRatings));

    setRating(newTotal / newCount);
    setRatingCount(newCount);

    // Dispatch event so other components know
    window.dispatchEvent(new Event('ratingsUpdated'));
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: title,
        text: `Confira ${title} no aplicativo FIX!`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2000);
    }
  };

  // Mock services list
  const servicesList = [
    { name: 'Diagnóstico Eletrônico com Scanner', price: 'A partir de R$ 90,00', duration: '~30 min' },
    { name: 'Troca de Óleo e Filtros', price: 'A partir de R$ 150,00', duration: '~40 min' },
    { name: 'Manutenção e Troca de Pastilhas de Freio', price: 'A partir de R$ 180,00', duration: '~1 hora' },
    { name: 'Revisão Geral e Suspensão', price: 'A partir de R$ 250,00', duration: '~2 horas' },
    { name: 'Carga de Gás e Limpeza do Ar Condicionado', price: 'A partir de R$ 140,00', duration: '~45 min' },
    { name: 'Bateria e Socorro Elétrico 24h', price: 'A partir de R$ 120,00', duration: '~20 min' },
  ];

  // Mock customer reviews
  const reviewsList = [
    { name: 'Carlos Eduardo M.', rating: 5, date: 'Há 3 dias', comment: 'Atendimento nota 10! Chegaram rápido com o guincho e resolveram o problema elétrico no mesmo dia.' },
    { name: 'Fernanda Lima', rating: 5, date: 'Há 1 semana', comment: 'Preço justo e total transparência no orçamento antes de realizar o serviço. Recomendo muito.' },
    { name: 'Roberto Santos', rating: 4, date: 'Há 2 semanas', comment: 'Excelente trabalho na troca de freios e suspensão. Carro ficou silencioso e seguro.' },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 24, scale: 0.99 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 24, scale: 0.99 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col pb-16"
    >
      {/* Top Navigation Bar */}
      <div className="sticky top-0 z-40 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 px-4 py-3 flex items-center justify-between">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={onBack}
          className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors font-medium text-sm"
        >
          <ArrowLeft size={20} />
          <span>Voltar</span>
        </motion.button>

        <span className="font-bold text-sm sm:text-base line-clamp-1 max-w-[200px] sm:max-w-md">
          {title}
        </span>

        <div className="flex items-center gap-2">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={handleShare}
            className="p-2 text-zinc-600 dark:text-zinc-400 hover:text-indigo-600 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            title="Compartilhar"
          >
            <Share2 size={18} />
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.85 }}
            onClick={toggleFavorite}
            className={`p-2 rounded-full transition-colors ${
              isFavorite 
                ? 'text-rose-500 bg-rose-50 dark:bg-rose-950/40' 
                : 'text-zinc-600 dark:text-zinc-400 hover:text-rose-500 hover:bg-zinc-100 dark:hover:bg-zinc-800'
            }`}
            title={isFavorite ? 'Remover dos Favoritos' : 'Favoritar'}
          >
            <Heart size={18} className={isFavorite ? 'fill-rose-500' : ''} />
          </motion.button>
        </div>
      </div>

      {copiedShare && (
        <div className="bg-indigo-600 text-white text-xs text-center py-1.5 font-bold animate-fade-in">
          Link copiado para a área de transferência!
        </div>
      )}

      {/* Hero Banner / Cover Photo */}
      <div className="relative w-full h-48 sm:h-64 bg-gradient-to-r from-indigo-900 via-indigo-800 to-zinc-900 overflow-hidden flex items-end">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:16px_16px]"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/90 via-zinc-950/40 to-transparent"></div>
        
        <div className="relative z-10 p-4 sm:p-6 w-full max-w-5xl mx-auto flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="bg-emerald-500/20 text-emerald-400 text-xs font-bold px-2.5 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                Aberto Agora
              </span>
              <VerifiedBadge rating={rating} size="sm" />
            </div>

            <h1 className="text-xl sm:text-3xl font-extrabold text-white tracking-tight">
              {title}
            </h1>

            <p className="text-xs sm:text-sm text-zinc-300 flex items-center gap-1.5">
              <MapPin size={14} className="text-indigo-400 flex-shrink-0" />
              <span>Estabelecimento credenciado no ecossistema FIX</span>
            </p>
          </div>

          <div className="flex items-center gap-3 bg-zinc-900/80 backdrop-blur-md p-3 rounded-2xl border border-zinc-700/50">
            <div className="text-center px-2">
              <div className="flex items-center justify-center gap-1 text-amber-400 font-bold text-lg">
                <Star size={18} className="fill-amber-400" />
                {rating.toFixed(1)}
              </div>
              <p className="text-[10px] text-zinc-400">{ratingCount} avaliações</p>
            </div>
            <div className="h-8 w-px bg-zinc-700"></div>
            <div className="text-center px-2">
              <div className="text-indigo-400 font-bold text-sm">~1.5 km</div>
              <p className="text-[10px] text-zinc-400">Distância aproximada</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content Container */}
      <div className="max-w-5xl mx-auto w-full px-4 sm:px-6 pt-6 space-y-6">

        {/* Primary Action Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onContact(title)}
            className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-xl shadow-md transition-all text-sm"
          >
            <MessageCircle size={18} />
            <span>Iniciar Chat</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setIsRouteOpen(true)}
            className="flex items-center justify-center gap-2 bg-zinc-900 dark:bg-zinc-800 hover:bg-zinc-800 text-white font-bold py-3 px-4 rounded-xl border border-zinc-700 transition-all text-sm"
          >
            <Navigation size={18} />
            <span>Ver Rota</span>
          </motion.button>

          <motion.a
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            href="tel:08001234567"
            className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-4 rounded-xl shadow-md transition-all text-sm"
          >
            <Phone size={18} />
            <span>Ligar</span>
          </motion.a>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={toggleFavorite}
            className={`flex items-center justify-center gap-2 font-bold py-3 px-4 rounded-xl border transition-all text-sm ${
              isFavorite
                ? 'bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-900'
                : 'bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50'
            }`}
          >
            <Heart size={18} className={isFavorite ? 'fill-rose-500 text-rose-500' : ''} />
            <span>{isFavorite ? 'Favoritado' : 'Favoritar'}</span>
          </motion.button>
        </div>

        {/* Tab Selection Navigation */}
        <div className="flex border-b border-zinc-200 dark:border-zinc-800 gap-6 text-sm font-bold">
          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-3 relative transition-colors ${
              activeTab === 'overview'
                ? 'text-indigo-600 dark:text-indigo-400'
                : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
            }`}
          >
            Visão Geral
            {activeTab === 'overview' && (
              <motion.div layoutId="activeTabUnderline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 dark:bg-indigo-400 rounded-full" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('services')}
            className={`pb-3 relative transition-colors ${
              activeTab === 'services'
                ? 'text-indigo-600 dark:text-indigo-400'
                : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
            }`}
          >
            Serviços & Preços
            {activeTab === 'services' && (
              <motion.div layoutId="activeTabUnderline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 dark:bg-indigo-400 rounded-full" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('reviews')}
            className={`pb-3 relative transition-colors ${
              activeTab === 'reviews'
                ? 'text-indigo-600 dark:text-indigo-400'
                : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
            }`}
          >
            Avaliações ({ratingCount})
            {activeTab === 'reviews' && (
              <motion.div layoutId="activeTabUnderline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 dark:bg-indigo-400 rounded-full" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('map')}
            className={`pb-3 relative transition-colors ${
              activeTab === 'map'
                ? 'text-indigo-600 dark:text-indigo-400'
                : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
            }`}
          >
            Localização
            {activeTab === 'map' && (
              <motion.div layoutId="activeTabUnderline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 dark:bg-indigo-400 rounded-full" />
            )}
          </button>
        </div>

        {/* Tab Contents with AnimatePresence */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            {/* TAB 1: OVERVIEW */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Description Card */}
                <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-3">
                  <h2 className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                    <ShieldCheck size={18} className="text-indigo-600 dark:text-indigo-400" />
                    Sobre este Estabelecimento
                  </h2>
                  <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed italic border-l-4 border-indigo-500 pl-3 py-1 bg-zinc-50 dark:bg-zinc-850/50 rounded-r-lg">
                    "{snippet}"
                  </p>
                </div>

                {/* Features & Badges Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex items-start gap-3">
                    <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 rounded-xl">
                      <Award size={20} />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-zinc-900 dark:text-white">Profissionais Certificados</h3>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">Equipe qualificada com garantia do serviço realizado.</p>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex items-start gap-3">
                    <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 rounded-xl">
                      <DollarSign size={20} />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-zinc-900 dark:text-white">Pagamento Seguro no App</h3>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">Pix com desconto ou cartão parcelado via plataforma FIX.</p>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex items-start gap-3">
                    <div className="p-2.5 bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 rounded-xl">
                      <Clock size={20} />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-zinc-900 dark:text-white">Atendimento Rápido</h3>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">Resposta em minutos pelo chat direto da plataforma.</p>
                    </div>
                  </div>
                </div>

                {/* Opening Hours & Location Info */}
                <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
                  <h3 className="font-bold text-base text-zinc-900 dark:text-white flex items-center gap-2">
                    <Clock size={18} className="text-indigo-600 dark:text-indigo-400" />
                    Horário de Funcionamento
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    <div className="flex justify-between p-2.5 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl">
                      <span className="text-zinc-600 dark:text-zinc-400 font-medium">Segunda a Sexta</span>
                      <span className="font-bold text-zinc-900 dark:text-white">08:00 - 18:00</span>
                    </div>
                    <div className="flex justify-between p-2.5 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl">
                      <span className="text-zinc-600 dark:text-zinc-400 font-medium">Sábado</span>
                      <span className="font-bold text-zinc-900 dark:text-white">08:00 - 13:00</span>
                    </div>
                    <div className="flex justify-between p-2.5 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl">
                      <span className="text-zinc-600 dark:text-zinc-400 font-medium">Domingo</span>
                      <span className="font-bold text-rose-500">Fechado (Atendimento Socorro 24h)</span>
                    </div>
                    <div className="flex justify-between p-2.5 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl">
                      <span className="text-zinc-600 dark:text-zinc-400 font-medium">Feriados</span>
                      <span className="font-bold text-zinc-900 dark:text-white">Sob consulta</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: SERVICES */}
            {activeTab === 'services' && (
              <div className="space-y-4">
                <h2 className="text-base font-bold text-zinc-900 dark:text-white">
                  Serviços Mais Solicitados
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {servicesList.map((service, i) => (
                    <div key={i} className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex justify-between items-center hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors">
                      <div className="space-y-1">
                        <h3 className="font-bold text-sm text-zinc-900 dark:text-white flex items-center gap-1.5">
                          <Wrench size={14} className="text-indigo-600 dark:text-indigo-400" />
                          {service.name}
                        </h3>
                        <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">{service.price}</p>
                        <p className="text-[10px] text-zinc-400">Tempo estimado: {service.duration}</p>
                      </div>
                      <button
                        onClick={() => onContact(title)}
                        className="p-2 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-600 hover:text-white rounded-xl transition-colors"
                        title="Orçamento no Chat"
                      >
                        <ChevronRight size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 3: REVIEWS */}
            {activeTab === 'reviews' && (
              <div className="space-y-6">
                {/* Rating Interactive Section */}
                <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div>
                    <h3 className="font-bold text-base text-zinc-900 dark:text-white">Sua Avaliação</h3>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">Já utilizou os serviços desta oficina? Deixe sua nota abaixo!</p>
                  </div>

                  <div className="flex items-center gap-1.5 bg-zinc-50 dark:bg-zinc-800 p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => handleUserRate(star)}
                        className="p-1 hover:scale-125 transition-transform"
                      >
                        <Star
                          size={24}
                          className={
                            (userRatingInput && userRatingInput >= star)
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-zinc-300 dark:text-zinc-600 hover:text-amber-400'
                          }
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* List of customer reviews */}
                <div className="space-y-3">
                  {reviewsList.map((rev, idx) => (
                    <div key={idx} className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-2">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-bold text-xs flex items-center justify-center">
                            {rev.name[0]}
                          </div>
                          <div>
                            <h4 className="font-bold text-xs sm:text-sm text-zinc-900 dark:text-white">{rev.name}</h4>
                            <p className="text-[10px] text-zinc-400">{rev.date}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-0.5 text-amber-400">
                          {[...Array(rev.rating)].map((_, i) => (
                            <Star key={i} size={12} className="fill-amber-400" />
                          ))}
                        </div>
                      </div>
                      <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
                        {rev.comment}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 4: MAP */}
            {activeTab === 'map' && (
              <div className="space-y-4">
                <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-3">
                  <h3 className="font-bold text-base text-zinc-900 dark:text-white flex items-center gap-2">
                    <MapPin size={18} className="text-indigo-600 dark:text-indigo-400" />
                    Localização e Rotas
                  </h3>
                  
                  <div className="h-72 w-full rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-700">
                    <MapComponent
                      latitude={userLocation?.latitude || -23.5505}
                      longitude={userLocation?.longitude || -46.6333}
                      userLatitude={userLocation?.latitude}
                      userLongitude={userLocation?.longitude}
                      title={title}
                    />
                  </div>

                  <div className="flex justify-between items-center pt-2">
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      {title} • Atendimento na região
                    </p>
                    <button
                      onClick={() => setIsRouteOpen(true)}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-2 px-3 rounded-lg flex items-center gap-1.5"
                    >
                      <Navigation size={14} />
                      Navegar no Mapa
                    </button>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

      </div>

      {/* In-App OpenStreetMap Route Modal */}
      <RouteModal
        isOpen={isRouteOpen}
        onClose={() => setIsRouteOpen(false)}
        destinationTitle={title}
        destinationAddress={title}
      />
    </motion.div>
  );
};
