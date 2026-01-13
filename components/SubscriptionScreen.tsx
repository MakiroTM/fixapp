import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { Check, Star, Shield, Zap, TrendingUp, X, Crown } from 'lucide-react';

interface SubscriptionScreenProps {
  user: User;
  onSubscribe: () => void;
  onBack: () => void;
}

export const SubscriptionScreen: React.FC<SubscriptionScreenProps> = ({ user, onSubscribe, onBack }) => {
  const [loading, setLoading] = useState(false);

  const handleSubscribe = () => {
    setLoading(true);
    // Simula processamento de pagamento
    setTimeout(() => {
      onSubscribe();
      setLoading(false);
    }, 2000);
  };

  const isMechanic = user.role === 'MECHANIC';

  // Configuração B2C (Motorista)
  const clientFeatures = [
    "Guincho Grátis (até 100km)",
    "Isenção de taxa de serviço (10%)",
    "Atendimento Prioritário (Fura-fila)",
    "Desconto de 5% em peças parceiras",
    "Carro reserva por 2 dias"
  ];

  // Configuração B2B (Mecânico)
  const mechanicFeatures = [
    "Selo de Verificado (Mais confiança)",
    "Destaque no Topo das Buscas (3x mais leads)",
    "Dashboard Financeiro Completo",
    "Gestão de Estoque Básica",
    "Suporte Dedicado 24h"
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-page-enter relative z-20">
      <button 
        onClick={onBack}
        className="absolute top-8 left-4 md:left-0 p-2 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors"
      >
        <X size={24} />
      </button>

      <div className="text-center mb-10 pt-8">
        <div className="inline-flex items-center justify-center p-3 bg-amber-100 dark:bg-amber-900/30 rounded-full text-amber-600 dark:text-amber-400 mb-4">
          <Crown size={32} strokeWidth={2.5} />
        </div>
        <h2 className="text-3xl md:text-4xl font-extrabold text-zinc-900 dark:text-zinc-100 mb-2">
          {isMechanic ? 'Acelere seu Negócio' : 'Viaje com Tranquilidade'}
        </h2>
        <p className="text-zinc-500 dark:text-zinc-400 text-lg max-w-lg mx-auto">
          {isMechanic 
            ? 'Destaque sua oficina e conquiste mais clientes com o plano Profissional.' 
            : 'Tenha proteção total contra imprevistos na estrada por menos de R$ 1,00 por dia.'}
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 items-center">
        
        {/* Plano Grátis */}
        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-8 border border-zinc-200 dark:border-zinc-800 opacity-80 scale-95 hover:opacity-100 hover:scale-[0.97] transition-all">
          <h3 className="text-xl font-bold text-zinc-700 dark:text-zinc-300 mb-2">Básico</h3>
          <div className="text-4xl font-bold text-zinc-900 dark:text-zinc-100 mb-6">R$ 0<span className="text-lg font-medium text-zinc-400">/mês</span></div>
          
          <ul className="space-y-4 mb-8">
            <li className="flex items-center gap-3 text-zinc-600 dark:text-zinc-400">
              <Check size={18} className="text-zinc-400" />
              {isMechanic ? 'Cadastro na plataforma' : 'Busca de mecânicos'}
            </li>
            <li className="flex items-center gap-3 text-zinc-600 dark:text-zinc-400">
              <Check size={18} className="text-zinc-400" />
              {isMechanic ? 'Recebimento de chamados' : 'Chat com prestadores'}
            </li>
            <li className="flex items-center gap-3 text-zinc-400 dark:text-zinc-600 line-through">
              <Check size={18} />
              {isMechanic ? 'Destaque nas buscas' : 'Guincho Grátis'}
            </li>
          </ul>
          
          <button 
            onClick={onBack}
            className="w-full py-3 rounded-xl border border-zinc-300 dark:border-zinc-700 font-semibold text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
          >
            Continuar Grátis
          </button>
        </div>

        {/* Plano Premium */}
        <div className="bg-white dark:bg-zinc-800 rounded-3xl p-8 border-2 border-indigo-500 dark:border-indigo-500 shadow-2xl shadow-indigo-500/20 relative transform md:-translate-y-4">
          <div className="absolute top-0 right-0 bg-indigo-500 text-white text-xs font-bold px-3 py-1 rounded-bl-xl rounded-tr-xl uppercase tracking-wider">
            Recomendado
          </div>

          <h3 className="text-xl font-bold text-indigo-600 dark:text-indigo-400 mb-2 flex items-center gap-2">
            {isMechanic ? 'Parceiro PRO' : 'FIX Prime'}
            <Star size={18} className="fill-indigo-500 text-indigo-500" />
          </h3>
          <div className="text-5xl font-extrabold text-zinc-900 dark:text-zinc-100 mb-1">
            {isMechanic ? 'R$ 89' : 'R$ 29'}
            <span className="text-2xl">,90</span>
          </div>
          <span className="text-zinc-400 block mb-6">por mês, cancele quando quiser.</span>
          
          <ul className="space-y-4 mb-8">
            {(isMechanic ? mechanicFeatures : clientFeatures).map((feature, idx) => (
              <li key={idx} className="flex items-center gap-3 text-zinc-700 dark:text-zinc-200 font-medium">
                <div className="bg-indigo-100 dark:bg-indigo-900/50 p-1 rounded-full text-indigo-600 dark:text-indigo-400">
                  <Check size={14} strokeWidth={3} />
                </div>
                {feature}
              </li>
            ))}
          </ul>
          
          <button 
            onClick={handleSubscribe}
            disabled={loading}
            className="w-full py-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-lg shadow-lg shadow-indigo-500/30 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            {loading ? (
              <>Processando...</>
            ) : (
              <>
                Assinar Agora <Zap size={20} className="fill-white" />
              </>
            )}
          </button>
          <p className="text-xs text-center text-zinc-400 mt-4">
            Pagamento seguro via App Store / Google Play
          </p>
        </div>

      </div>

      <div className="mt-12 text-center bg-zinc-100 dark:bg-zinc-900 p-6 rounded-2xl">
        <div className="flex flex-col md:flex-row items-center justify-center gap-6 text-sm text-zinc-500 dark:text-zinc-400">
           <div className="flex items-center gap-2">
             <Shield size={18} className="text-emerald-500" />
             Garantia de Satisfação de 7 dias
           </div>
           <div className="flex items-center gap-2">
             <TrendingUp size={18} className="text-emerald-500" />
             {isMechanic ? 'ROI médio de 300%' : 'Economia média de R$ 400/ano'}
           </div>
        </div>
      </div>
    </div>
  );
};