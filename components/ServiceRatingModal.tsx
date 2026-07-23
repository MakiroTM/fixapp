import React, { useState } from 'react';
import { Star, X, CheckCircle2, MessageSquare, ThumbsUp, ShieldCheck, Sparkles } from 'lucide-react';
import { VerifiedBadge } from './VerifiedBadge';

interface ServiceRatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  mechanicName: string;
  serviceType?: string;
  onSubmitRating?: (rating: number, comment: string, tags: string[]) => void;
}

const PRESET_TAGS = [
  "⚡ Chegou super rápido",
  "👨‍🔧 Atendimento educado",
  "💰 Preço transparente",
  "🔧 Diagnóstico preciso",
  "✨ Cuidadoso com o veículo",
  "⭐ Recomendo fortemente"
];

const RATING_LABELS: { [key: number]: string } = {
  1: "Péssimo — Experiência insatisfatória",
  2: "Ruim — Deixou a desejar em alguns aspectos",
  3: "Razoável — Atendimento básico, dentro do esperado",
  4: "Muito Bom — Eficiente e seguro",
  5: "Excelente — Atendimento impecável!"
};

export const ServiceRatingModal: React.FC<ServiceRatingModalProps> = ({
  isOpen,
  onClose,
  mechanicName,
  serviceType = 'Serviço Automotivo',
  onSubmitRating
}) => {
  const [selectedStars, setSelectedStars] = useState<number>(0);
  const [hoverStars, setHoverStars] = useState<number>(0);
  const [comment, setComment] = useState<string>('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  if (!isOpen) return null;

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedStars === 0) return;

    // Save to localStorage so ratings persist across mechanic profiles
    try {
      const currentRatings = JSON.parse(localStorage.getItem('mechanicRatings') || '{}');
      const mechanicData = currentRatings[mechanicName] || { total: 0, count: 0, reviews: [] };
      
      mechanicData.total += selectedStars;
      mechanicData.count += 1;
      mechanicData.reviews = mechanicData.reviews || [];
      mechanicData.reviews.unshift({
        id: Date.now().toString(),
        rating: selectedStars,
        comment: comment.trim(),
        tags: selectedTags,
        date: new Date().toISOString()
      });

      currentRatings[mechanicName] = mechanicData;
      localStorage.setItem('mechanicRatings', JSON.stringify(currentRatings));
      
      // Dispatch custom event for real-time rating sync
      window.dispatchEvent(new Event('ratingsUpdated'));
    } catch (err) {
      console.error('[ServiceRatingModal] Error saving review:', err);
    }

    setIsSubmitted(true);

    if (onSubmitRating) {
      onSubmitRating(selectedStars, comment, selectedTags);
    }
  };

  const activeRating = hoverStars || selectedStars;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-zinc-900 w-full max-w-lg rounded-3xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden animate-pop-in relative">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-indigo-800 text-white p-6 relative overflow-hidden">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer"
            title="Fechar"
          >
            <X size={20} />
          </button>

          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 bg-white/20 backdrop-blur-md rounded-2xl text-white">
              <Star className="fill-amber-300 text-amber-300" size={24} />
            </div>
            <div>
              <span className="text-xs font-bold text-indigo-200 uppercase tracking-widest flex items-center gap-1">
                <Sparkles size={12} /> Avaliação de Atendimento
              </span>
              <h2 className="text-xl font-black text-white">Como foi seu serviço?</h2>
            </div>
          </div>
          <p className="text-xs text-indigo-100/90 leading-relaxed">
            Sua nota ajuda outros motoristas e reconhece o bom trabalho dos profissionais cadastrados no aplicativo FIX.
          </p>
        </div>

        {!isSubmitted ? (
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            
            {/* Mechanic Profile Banner */}
            <div className="flex items-center gap-3.5 p-3.5 bg-zinc-50 dark:bg-zinc-800/60 rounded-2xl border border-zinc-200/80 dark:border-zinc-700/60">
              <div className="w-12 h-12 bg-indigo-600 text-white font-bold text-lg rounded-2xl flex items-center justify-center shadow-md shadow-indigo-500/20">
                {mechanicName.charAt(0)}
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-bold text-zinc-900 dark:text-zinc-100 text-base">{mechanicName}</h3>
                  <VerifiedBadge rating={4.9} size="sm" />
                </div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">{serviceType}</p>
              </div>
            </div>

            {/* Interactive Star Rating */}
            <div className="text-center space-y-2">
              <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block">
                Selecione sua nota de 1 a 5 estrelas
              </label>

              <div className="flex items-center justify-center gap-2 py-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onMouseEnter={() => setHoverStars(star)}
                    onMouseLeave={() => setHoverStars(0)}
                    onClick={() => setSelectedStars(star)}
                    className="p-1.5 transition-all transform hover:scale-125 focus:outline-none cursor-pointer"
                    title={`${star} estrela(s)`}
                  >
                    <Star
                      size={36}
                      className={`transition-colors duration-200 ${
                        activeRating >= star
                          ? 'fill-amber-400 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]'
                          : 'text-zinc-300 dark:text-zinc-700'
                      }`}
                    />
                  </button>
                ))}
              </div>

              {/* Dynamic Rating Label */}
              <div className="h-6">
                {activeRating > 0 ? (
                  <span className="text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 px-3 py-1 rounded-full border border-amber-200 dark:border-amber-800/40 animate-fade-in inline-block">
                    {RATING_LABELS[activeRating]}
                  </span>
                ) : (
                  <span className="text-xs text-zinc-400 italic">Clique nas estrelas para avaliar</span>
                )}
              </div>
            </div>

            {/* Quick Tag Chips */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block">
                Pontos de Destaque (Opcional)
              </label>
              <div className="flex flex-wrap gap-2">
                {PRESET_TAGS.map((tag) => {
                  const isSelected = selectedTags.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleTag(tag)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer select-none ${
                        isSelected
                          ? 'bg-indigo-600 text-white shadow-sm ring-2 ring-indigo-400/50 scale-105'
                          : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                      }`}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Comment Textarea */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                  <MessageSquare size={14} className="text-indigo-500" /> Comentário
                </label>
                <span className="text-[10px] text-zinc-400">{comment.length}/300</span>
              </div>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value.slice(0, 300))}
                rows={3}
                placeholder="Descreva detalhes sobre a agilidade, comunicação e qualidade do serviço executado..."
                className="w-full p-3.5 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 rounded-2xl border border-zinc-200 dark:border-zinc-700 focus:ring-2 focus:ring-indigo-500 focus:outline-none text-xs leading-relaxed resize-none"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 px-4 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 font-bold rounded-2xl text-xs transition-colors cursor-pointer"
              >
                Agora não
              </button>
              <button
                type="submit"
                disabled={selectedStars === 0}
                className="flex-1 py-3 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-2xl text-xs transition-all shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 cursor-pointer"
              >
                <ThumbsUp size={16} /> Enviar Avaliação
              </button>
            </div>
          </form>
        ) : (
          /* Confirmation / Thank You Screen */
          <div className="p-8 text-center space-y-4 animate-fade-in">
            <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto shadow-xl shadow-emerald-500/20">
              <CheckCircle2 size={36} />
            </div>

            <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
              Obrigado pela sua avaliação!
            </h3>

            <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-xs mx-auto leading-relaxed">
              Sua nota de <strong className="text-amber-500">{selectedStars} ★</strong> foi registrada com sucesso para <strong>{mechanicName}</strong>.
            </p>

            <div className="pt-4">
              <button
                onClick={onClose}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl text-xs transition-all shadow-lg shadow-emerald-600/30 cursor-pointer"
              >
                Concluir
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
