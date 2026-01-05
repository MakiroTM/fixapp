import React from 'react';
import { User } from '../types';
import { Wrench, Star, Clock, MapPin, DollarSign, Settings, Bell, ChevronRight } from 'lucide-react';

interface MechanicDashboardProps {
  user: User;
}

export const MechanicDashboard: React.FC<MechanicDashboardProps> = ({ user }) => {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8 animate-fade-in-up">
      {/* Welcome Section */}
      <div className="bg-slate-800 dark:bg-zinc-900 text-white rounded-3xl p-8 mb-8 relative overflow-hidden shadow-xl shadow-slate-200 dark:shadow-none">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500 opacity-20 rounded-full -mr-16 -mt-16 blur-3xl"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
               <span className="bg-emerald-500 text-white text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                 <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
                 ABERTO AGORA
               </span>
            </div>
            <h2 className="text-3xl font-bold mb-1">{user.shopName}</h2>
            <p className="text-slate-300 dark:text-zinc-400">Gerencie seus chamados e performance.</p>
          </div>
          
          <div className="flex gap-3">
             <div className="bg-white/10 backdrop-blur-md p-3 rounded-xl text-center min-w-[100px]">
                <div className="text-2xl font-bold text-white">4.8</div>
                <div className="text-xs text-slate-300 dark:text-zinc-400 flex items-center justify-center gap-1">
                   <Star size={10} className="fill-yellow-400 text-yellow-400" /> Avaliação
                </div>
             </div>
             <div className="bg-white/10 backdrop-blur-md p-3 rounded-xl text-center min-w-[100px]">
                <div className="text-2xl font-bold text-white">12</div>
                <div className="text-xs text-slate-300 dark:text-zinc-400">Chamados Hoje</div>
             </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Feed - Incoming Requests */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex justify-between items-center">
             <h3 className="text-lg font-bold text-zinc-800 dark:text-zinc-100">Solicitações Próximas</h3>
             <button className="text-sm text-indigo-600 dark:text-indigo-400 font-medium hover:underline">Ver mapa</button>
          </div>

          {/* Request Card 1 */}
          <div className="bg-white dark:bg-zinc-800 p-5 rounded-2xl border border-zinc-100 dark:border-zinc-700 shadow-sm hover:shadow-md transition-shadow">
             <div className="flex justify-between items-start mb-4">
               <div className="flex gap-3">
                 <div className="w-10 h-10 bg-rose-100 dark:bg-rose-900/30 rounded-full flex items-center justify-center text-rose-600 dark:text-rose-400">
                   <Wrench size={20} />
                 </div>
                 <div>
                   <h4 className="font-bold text-zinc-800 dark:text-zinc-100">Honda Civic - Pneu Furado</h4>
                   <p className="text-sm text-zinc-500 dark:text-zinc-400">Rodovia BR-116, Km 45 (A 5km de distância)</p>
                 </div>
               </div>
               <span className="bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 text-xs font-bold px-2 py-1 rounded-lg">
                 EMERGÊNCIA
               </span>
             </div>
             <div className="flex items-center gap-4 border-t border-zinc-100 dark:border-zinc-700 pt-4 mt-2">
                <button className="flex-1 bg-zinc-900 dark:bg-zinc-700 text-white py-2 rounded-lg font-medium text-sm hover:bg-zinc-800 dark:hover:bg-zinc-600 transition-colors">
                  Aceitar Chamado
                </button>
                <button className="px-4 py-2 text-zinc-500 dark:text-zinc-400 font-medium text-sm hover:bg-zinc-50 dark:hover:bg-zinc-700 rounded-lg">
                  Ignorar
                </button>
             </div>
          </div>

          {/* Request Card 2 */}
          <div className="bg-white dark:bg-zinc-800 p-5 rounded-2xl border border-zinc-100 dark:border-zinc-700 shadow-sm hover:shadow-md transition-shadow opacity-70">
             <div className="flex justify-between items-start mb-4">
               <div className="flex gap-3">
                 <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                   <Settings size={20} />
                 </div>
                 <div>
                   <h4 className="font-bold text-zinc-800 dark:text-zinc-100">Revisão Geral - Fiat Toro</h4>
                   <p className="text-sm text-zinc-500 dark:text-zinc-400">Centro da Cidade (Agendamento)</p>
                 </div>
               </div>
               <span className="bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 text-xs font-bold px-2 py-1 rounded-lg">
                 MANUTENÇÃO
               </span>
             </div>
             <div className="flex items-center gap-4 border-t border-zinc-100 dark:border-zinc-700 pt-4 mt-2">
                <button disabled className="flex-1 bg-zinc-200 dark:bg-zinc-700 text-zinc-400 dark:text-zinc-500 py-2 rounded-lg font-medium text-sm cursor-not-allowed">
                  Aguardando Cliente
                </button>
             </div>
          </div>
        </div>

        {/* Sidebar - Performance & Tools */}
        <div className="space-y-6">
           
           <div className="bg-white dark:bg-zinc-800 p-5 rounded-2xl border border-zinc-100 dark:border-zinc-700 shadow-sm">
             <h3 className="text-sm font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-4">Financeiro</h3>
             <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                  <DollarSign size={24} />
                </div>
                <div>
                   <p className="text-sm text-zinc-500 dark:text-zinc-400">Ganhos da Semana</p>
                   <p className="text-2xl font-bold text-zinc-800 dark:text-zinc-100">R$ 1.250,00</p>
                </div>
             </div>
             <button className="w-full text-indigo-600 dark:text-indigo-400 font-medium text-sm border border-indigo-100 dark:border-indigo-800 py-2 rounded-lg hover:bg-indigo-50 dark:hover:bg-zinc-700 transition-colors">
               Ver Extrato Completo
             </button>
           </div>

           <div className="bg-white dark:bg-zinc-800 p-5 rounded-2xl border border-zinc-100 dark:border-zinc-700 shadow-sm">
             <h3 className="text-sm font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-2">Acesso Rápido</h3>
             <ul className="space-y-1">
               <li>
                 <button className="w-full flex items-center justify-between p-3 hover:bg-zinc-50 dark:hover:bg-zinc-700 rounded-lg transition-colors group">
                    <span className="flex items-center gap-2 text-zinc-600 dark:text-zinc-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                      <Settings size={18} /> Configurar Serviços
                    </span>
                    <ChevronRight size={16} className="text-zinc-300 dark:text-zinc-600" />
                 </button>
               </li>
               <li>
                 <button className="w-full flex items-center justify-between p-3 hover:bg-zinc-50 dark:hover:bg-zinc-700 rounded-lg transition-colors group">
                    <span className="flex items-center gap-2 text-zinc-600 dark:text-zinc-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                      <Clock size={18} /> Horário de Funcionamento
                    </span>
                    <ChevronRight size={16} className="text-zinc-300 dark:text-zinc-600" />
                 </button>
               </li>
               <li>
                 <button className="w-full flex items-center justify-between p-3 hover:bg-zinc-50 dark:hover:bg-zinc-700 rounded-lg transition-colors group">
                    <span className="flex items-center gap-2 text-zinc-600 dark:text-zinc-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                      <Bell size={18} /> Notificações
                    </span>
                    <div className="bg-rose-500 text-white text-[10px] font-bold px-1.5 rounded-full">2</div>
                 </button>
               </li>
             </ul>
           </div>
        </div>
      </div>
    </div>
  );
};