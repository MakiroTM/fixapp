import React, { useState } from 'react';
import { User, ChatMessage, ServiceStatus } from '../types';
import { Wrench, Star, Clock, MapPin, DollarSign, Settings, Bell, ChevronRight, Lock, Crown, MessageCircle, CheckCircle, Map as MapIcon, Wifi, WifiOff, Power, ShieldAlert } from 'lucide-react';
import { ChatInterface } from './ChatInterface';
import { MapComponent } from './MapComponent';
import { StatusIndicator } from './StatusIndicator';
import { EtaWidget } from './EtaWidget';

interface MechanicDashboardProps {
  user: User;
  onUpgrade: () => void;
}

export const MechanicDashboard: React.FC<MechanicDashboardProps> = ({ user, onUpgrade }) => {
  const isPro = user.plan === 'PRO';
  
  // Real-time Availability State
  const [isOnline, setIsOnline] = useState<boolean>(true);

  // States to simulate job acceptance and chat
  const [activeJob, setActiveJob] = useState<{
    clientName: string;
    carInfo: string;
    distanceInfo: string;
  } | null>(null);
  const [activeJobStatus, setActiveJobStatus] = useState<ServiceStatus>('EN_ROUTE');
  const [isAccepting, setIsAccepting] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [chatRecipient, setChatRecipient] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);

  // Coordenadas simuladas para o exemplo
  const activeJobCoords = { lat: -23.5505, lng: -46.6333 };

  const handleAcceptJob = (clientName: string, carInfo: string, distanceInfo: string) => {
    setIsAccepting(true);
    
    // Simular delay de rede para aceitação
    setTimeout(() => {
      setActiveJob({ clientName, carInfo, distanceInfo });
      setActiveJobStatus('EN_ROUTE');
      setChatRecipient(clientName);
      setChatMessages([
        {
          id: '1',
          text: `Olá ${clientName}, aceitei seu chamado para o ${carInfo}. Estou a caminho da sua localização!`,
          sender: 'me',
          timestamp: new Date()
        }
      ]);
      setIsChatOpen(true);
      setIsAccepting(false);
    }, 1500);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-4 sm:py-8 animate-fade-in-up pb-24">
      {/* Welcome Section */}
      <div className="bg-slate-800 dark:bg-zinc-900 text-white rounded-2xl sm:rounded-3xl p-5 sm:p-8 mb-6 sm:mb-8 relative overflow-hidden shadow-xl shadow-slate-200 dark:shadow-none">
        <div className="absolute top-0 right-0 w-48 sm:w-64 h-48 sm:h-64 bg-indigo-500 opacity-20 rounded-full -mr-12 sm:-mr-16 -mt-12 sm:-mt-16 blur-3xl"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 sm:gap-6">
          <div className="w-full md:w-auto">
            <div className="flex flex-wrap items-center gap-2 mb-2 sm:mb-3">
               <button
                 onClick={() => setIsOnline(!isOnline)}
                 className={`text-[10px] sm:text-xs font-extrabold px-3 py-1 rounded-full flex items-center gap-1.5 transition-all shadow-md cursor-pointer ${
                   isOnline 
                     ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/20 ring-2 ring-emerald-400/30' 
                     : 'bg-zinc-700 hover:bg-zinc-600 text-zinc-200 border border-zinc-600'
                 }`}
                 title={isOnline ? 'Clique para mudar para Offline' : 'Clique para mudar para Online'}
               >
                 {isOnline ? (
                   <>
                     <span className="w-2 h-2 bg-white rounded-full animate-ping"></span>
                     <Wifi size={13} />
                     <span>ONLINE • Recebendo Chamados</span>
                   </>
                 ) : (
                   <>
                     <span className="w-2 h-2 bg-zinc-400 rounded-full"></span>
                     <WifiOff size={13} />
                     <span>OFFLINE • Indisponível</span>
                   </>
                 )}
               </button>

               {isPro ? (
                 <span className="bg-amber-500 text-white text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                   <Crown size={10} fill="white" />
                   PARCEIRO PRO
                 </span>
               ) : (
                 <span className="bg-zinc-600 text-white/80 text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                   GRÁTIS
                 </span>
               )}
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold mb-1 truncate">{user.shopName}</h2>
            <p className="text-slate-300 dark:text-zinc-400 text-xs sm:text-sm">Gerencie seus chamados e performance.</p>
          </div>
          
          <div className="flex gap-2 sm:gap-3 w-full md:w-auto">
             <div className="flex-1 md:flex-none bg-white/10 backdrop-blur-md p-2.5 sm:p-3 rounded-xl text-center min-w-[80px] sm:min-w-[100px]">
                <div className="text-xl sm:text-2xl font-bold text-white">4.8</div>
                <div className="text-[10px] sm:text-xs text-slate-300 dark:text-zinc-400 flex items-center justify-center gap-1">
                   <Star size={10} className="fill-yellow-400 text-yellow-400" /> Avaliação
                </div>
             </div>
             <div className="flex-1 md:flex-none bg-white/10 backdrop-blur-md p-2.5 sm:p-3 rounded-xl text-center min-w-[80px] sm:min-w-[100px]">
                <div className="text-xl sm:text-2xl font-bold text-white">12</div>
                <div className="text-[10px] sm:text-xs text-slate-300 dark:text-zinc-400">Chamados Hoje</div>
             </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        
        {/* Main Feed - Incoming Requests */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          {!isPro && (
             <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl sm:rounded-2xl p-4 sm:p-6 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg shadow-indigo-500/20">
               <div>
                 <h3 className="font-bold text-base sm:text-lg flex items-center gap-2">
                   <Crown size={18} className="fill-white sm:w-5 sm:h-5" />
                   Seja Parceiro PRO
                 </h3>
                 <p className="text-indigo-100 text-xs sm:text-sm mt-1">Receba 3x mais chamados e desbloqueie o financeiro.</p>
               </div>
               <button 
                 onClick={onUpgrade}
                 className="w-full sm:w-auto bg-white text-indigo-600 px-4 py-2 rounded-lg font-bold text-xs sm:text-sm hover:bg-indigo-50 transition-colors whitespace-nowrap"
               >
                 Ver Planos
               </button>
             </div>
          )}

          <div className="flex justify-between items-center px-1">
             <h3 className="text-base sm:text-lg font-bold text-zinc-800 dark:text-zinc-100 flex items-center gap-2">
               {!isOnline ? (
                 <>
                   <WifiOff size={18} className="text-zinc-400" />
                   <span>Status: Offline</span>
                 </>
               ) : activeJob ? (
                 'Serviço em Andamento'
               ) : (
                 'Solicitações Próximas'
               )}
             </h3>
             <button className="text-xs sm:text-sm text-indigo-600 dark:text-indigo-400 font-medium hover:underline">Ver mapa</button>
          </div>

          {!isOnline ? (
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 sm:p-8 text-center space-y-4 shadow-xl animate-fade-in">
              <div className="w-16 h-16 bg-zinc-800 text-zinc-400 border border-zinc-700 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <WifiOff size={32} />
              </div>
              <div className="space-y-1.5 max-w-md mx-auto">
                <h3 className="text-lg font-bold text-white">Você está Offline no Momento</h3>
                <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                  Sua oficina/guincho está oculta no aplicativo. Alterne seu status para <strong className="text-emerald-400">Online</strong> para receber novos chamados e socorros em tempo real.
                </p>
              </div>
              <button
                onClick={() => setIsOnline(true)}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-black px-6 py-3 rounded-xl text-sm shadow-lg shadow-emerald-900/40 inline-flex items-center gap-2 transition-all hover:scale-105"
              >
                <Power size={18} />
                <span>MUDAR PARA ONLINE E RECEBER CHAMADOS</span>
              </button>
            </div>
          ) : activeJob ? (
             <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 sm:p-6 rounded-xl sm:rounded-2xl border-2 border-indigo-500 dark:border-indigo-500/50 shadow-lg relative overflow-hidden animate-pop-in space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-lg sm:text-xl font-bold text-zinc-800 dark:text-zinc-100">{activeJob.clientName}</h4>
                  <StatusIndicator status={activeJobStatus} variant="badge" />
                </div>

                <div className="space-y-1">
                  <p className="text-zinc-700 dark:text-zinc-300 text-xs sm:text-sm font-medium">{activeJob.carInfo}</p>
                  <p className="text-zinc-500 dark:text-zinc-400 text-[10px] sm:text-xs flex items-center gap-1">
                    <MapPin size={12} /> {activeJob.distanceInfo}
                  </p>
                </div>

                {/* Status Stepper Progress Control */}
                <StatusIndicator 
                  status={activeJobStatus} 
                  variant="full" 
                  isEditable={true} 
                  onStatusChange={setActiveJobStatus} 
                />

                {/* Dynamic ETA display for Mechanic */}
                <EtaWidget 
                  status={activeJobStatus}
                />

                {/* Service Payment Status Summary for Mechanic */}
                <div className="bg-white/80 dark:bg-zinc-900/80 p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-zinc-500 text-[10px] uppercase font-extrabold tracking-wider block">Valor do Atendimento</span>
                    <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">R$ 180,00</span>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                    Pagamento via App
                  </span>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                   <button 
                     onClick={() => {
                        setChatRecipient(activeJob.clientName);
                        setIsChatOpen(true);
                     }}
                     className="flex-1 bg-indigo-600 text-white py-2.5 sm:py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-500/20 text-sm sm:text-base"
                   >
                     <MessageCircle size={18} className="sm:w-5 sm:h-5" />
                     Abrir Chat
                   </button>
                   <button 
                     onClick={() => setShowMap(!showMap)}
                     className="flex-1 bg-white dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 py-2.5 sm:py-3 rounded-xl font-bold border border-indigo-100 dark:border-indigo-800 flex items-center justify-center gap-2 hover:bg-indigo-50 dark:hover:bg-zinc-700 transition-colors text-sm sm:text-base"
                   >
                     <MapIcon size={18} className="sm:w-5 sm:h-5" />
                     {showMap ? 'Ocultar Mapa' : 'Ver Mapa'}
                   </button>
                   <button 
                     onClick={() => {
                       setActiveJobStatus('COMPLETED');
                       setTimeout(() => setActiveJob(null), 1000);
                     }}
                     className="bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 py-2.5 sm:py-3 px-4 sm:px-6 rounded-xl font-bold border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors text-sm sm:text-base"
                   >
                     Finalizar
                   </button>
                </div>

                {showMap && (
                  <div className="mt-4 sm:mt-6 h-[250px] sm:h-[300px] animate-fade-in rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-700">
                    <MapComponent 
                      latitude={activeJobCoords.lat} 
                      longitude={activeJobCoords.lng} 
                      title={`Localização de ${activeJob.clientName}`}
                    />
                  </div>
                )}
             </div>
          ) : (
            <>
              {/* Request Card 1 */}
              <div className="bg-white dark:bg-zinc-800 p-4 sm:p-5 rounded-xl sm:rounded-2xl border border-zinc-100 dark:border-zinc-700 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-3 sm:mb-4">
                  <div className="flex gap-2.5 sm:gap-3">
                    <div className="w-9 h-9 sm:w-10 sm:h-10 bg-rose-100 dark:bg-rose-900/30 rounded-full flex items-center justify-center text-rose-600 dark:text-rose-400 flex-shrink-0">
                      <Wrench size={18} className="sm:w-5 sm:h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm sm:text-base text-zinc-800 dark:text-zinc-100 leading-tight">Honda Civic - Pneu Furado</h4>
                      <p className="text-[10px] sm:text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">Rodovia BR-116, Km 45 (A 5km de distância)</p>
                    </div>
                  </div>
                  <span className="bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 text-[9px] sm:text-xs font-bold px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-lg flex-shrink-0">
                    EMERGÊNCIA
                  </span>
                </div>
                <div className="flex items-center gap-2 sm:gap-4 border-t border-zinc-100 dark:border-zinc-700 pt-3 sm:pt-4 mt-1 sm:mt-2">
                    <button 
                      onClick={() => handleAcceptJob('João da Silva', 'Honda Civic - Pneu Furado', 'Rodovia BR-116, Km 45 (A 5km de distância)')}
                      disabled={isAccepting}
                      className="flex-1 bg-zinc-900 dark:bg-zinc-700 text-white py-2 rounded-lg font-medium text-xs sm:text-sm hover:bg-zinc-800 dark:hover:bg-zinc-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
                    >
                      {isAccepting ? (
                        <>
                          <Clock size={14} className="animate-spin sm:w-4 sm:h-4" />
                          Aceitando...
                        </>
                      ) : (
                        'Aceitar Chamado'
                      )}
                    </button>
                    <button 
                      disabled={isAccepting}
                      className="px-3 sm:px-4 py-2 text-zinc-500 dark:text-zinc-400 font-medium text-xs sm:text-sm hover:bg-zinc-50 dark:hover:bg-zinc-700 rounded-lg disabled:opacity-50"
                    >
                      Ignorar
                    </button>
                </div>
              </div>

              {/* Request Card 2 */}
              <div className="bg-white dark:bg-zinc-800 p-4 sm:p-5 rounded-xl sm:rounded-2xl border border-zinc-100 dark:border-zinc-700 shadow-sm hover:shadow-md transition-shadow opacity-70">
                <div className="flex justify-between items-start mb-3 sm:mb-4">
                  <div className="flex gap-2.5 sm:gap-3">
                    <div className="w-9 h-9 sm:w-10 sm:h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center text-indigo-600 dark:text-indigo-400 flex-shrink-0">
                      <Settings size={18} className="sm:w-5 sm:h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm sm:text-base text-zinc-800 dark:text-zinc-100 leading-tight">Revisão Geral - Fiat Toro</h4>
                      <p className="text-[10px] sm:text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">Centro da Cidade (Agendamento)</p>
                    </div>
                  </div>
                  <span className="bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 text-[9px] sm:text-xs font-bold px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-lg flex-shrink-0">
                    MANUTENÇÃO
                  </span>
                </div>
                <div className="flex items-center gap-4 border-t border-zinc-100 dark:border-zinc-700 pt-3 sm:pt-4 mt-1 sm:mt-2">
                    <button disabled className="flex-1 bg-zinc-200 dark:bg-zinc-700 text-zinc-400 dark:text-zinc-500 py-2 rounded-lg font-medium text-xs sm:text-sm cursor-not-allowed">
                      Aguardando Cliente
                    </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Sidebar - Performance & Tools */}
        <div className="space-y-4 sm:space-y-6">
           
           {/* Financial Card - LOCKED STATE */}
           <div className={`bg-white dark:bg-zinc-800 p-4 sm:p-5 rounded-xl sm:rounded-2xl border border-zinc-100 dark:border-zinc-700 shadow-sm relative overflow-hidden ${!isPro ? 'min-h-[140px] sm:min-h-[160px]' : ''}`}>
             <h3 className="text-[10px] sm:text-sm font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-3 sm:mb-4">Financeiro</h3>
             
             {isPro ? (
               // Content for PRO users
               <>
                <div className="flex items-center gap-3 mb-4 sm:mb-6">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                    <DollarSign size={20} className="sm:w-6 sm:h-6" />
                    </div>
                    <div>
                    <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">Ganhos da Semana</p>
                    <p className="text-xl sm:text-2xl font-bold text-zinc-800 dark:text-zinc-100">R$ 1.250,00</p>
                    </div>
                </div>
                <button className="w-full text-indigo-600 dark:text-indigo-400 font-medium text-xs sm:text-sm border border-indigo-100 dark:border-indigo-800 py-2 rounded-lg hover:bg-indigo-50 dark:hover:bg-zinc-700 transition-colors">
                Ver Extrato Completo
                </button>
               </>
             ) : (
               // Content for FREE users (Locked)
               <div className="absolute inset-0 bg-white/60 dark:bg-zinc-900/60 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center text-center p-4">
                 <div className="bg-zinc-100 dark:bg-zinc-800 p-2 sm:p-3 rounded-full mb-2">
                   <Lock size={20} className="text-zinc-400 sm:w-6 sm:h-6" />
                 </div>
                 <p className="text-xs sm:text-sm font-bold text-zinc-800 dark:text-zinc-200 mb-2">Recurso Premium</p>
                 <button 
                  onClick={onUpgrade}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] sm:text-xs font-bold py-1.5 sm:py-2 px-3 sm:px-4 rounded-lg transition-colors"
                 >
                   Desbloquear Financeiro
                 </button>
               </div>
             )}
           </div>

           <div className="bg-white dark:bg-zinc-800 p-4 sm:p-5 rounded-xl sm:rounded-2xl border border-zinc-100 dark:border-zinc-700 shadow-sm">
             <h3 className="text-[10px] sm:text-sm font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-2">Acesso Rápido</h3>
             <ul className="space-y-0.5 sm:space-y-1">
               <li>
                 <button className="w-full flex items-center justify-between p-2.5 sm:p-3 hover:bg-zinc-50 dark:hover:bg-zinc-700 rounded-lg transition-colors group">
                    <span className="flex items-center gap-2 text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                      <Settings size={16} className="sm:w-4.5 sm:h-4.5" /> Configurar Serviços
                    </span>
                    <ChevronRight size={14} className="text-zinc-300 dark:text-zinc-600 sm:w-4 sm:h-4" />
                 </button>
               </li>
               <li>
                 <button className="w-full flex items-center justify-between p-2.5 sm:p-3 hover:bg-zinc-50 dark:hover:bg-zinc-700 rounded-lg transition-colors group">
                    <span className="flex items-center gap-2 text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                      <Clock size={16} className="sm:w-4.5 sm:h-4.5" /> Horário de Funcionamento
                    </span>
                    <ChevronRight size={14} className="text-zinc-300 dark:text-zinc-600 sm:w-4 sm:h-4" />
                 </button>
               </li>
               <li>
                 <button className="w-full flex items-center justify-between p-2.5 sm:p-3 hover:bg-zinc-50 dark:hover:bg-zinc-700 rounded-lg transition-colors group">
                    <span className="flex items-center gap-2 text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                      <Bell size={16} className="sm:w-4.5 sm:h-4.5" /> Notificações
                    </span>
                    <div className="bg-rose-500 text-white text-[9px] sm:text-[10px] font-bold px-1 sm:px-1.5 rounded-full">2</div>
                 </button>
               </li>
             </ul>
           </div>
        </div>
      </div>

      <ChatInterface 
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        recipientName={chatRecipient}
        initialMessages={chatMessages}
        userRole="MECHANIC"
        initialStatus={activeJobStatus}
        onStatusChange={setActiveJobStatus}
      />
    </div>
  );
};