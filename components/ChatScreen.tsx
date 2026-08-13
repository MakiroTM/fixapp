import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MessageCircle, Send, Phone, Search, ArrowLeft, Bot, ShieldCheck, 
  MapPin, CheckCheck, Sparkles, Paperclip, Wrench, Clock, Image as ImageIcon, ExternalLink
} from 'lucide-react';
import { User, Coordinates } from '../types';

interface ChatConversation {
  id: string;
  name: string;
  avatar: string;
  roleTag: string;
  isOnline: boolean;
  isAi?: boolean;
  lastMessage: string;
  time: string;
  unreadCount?: number;
  messages: Array<{
    id: string;
    sender: 'me' | 'them';
    text: string;
    timestamp: string;
    isLocation?: boolean;
  }>;
}

const INITIAL_CONVERSATIONS: ChatConversation[] = [
  {
    id: 'ai-assistant',
    name: 'Assistente Especialista FIX (IA)',
    avatar: '🤖',
    roleTag: 'Inteligência Artificial',
    isOnline: true,
    isAi: true,
    lastMessage: 'Posso analisar o barulho do seu freio ou orientar sobre custos de manutenção!',
    time: 'Agora',
    unreadCount: 1,
    messages: [
      {
        id: '1',
        sender: 'them',
        text: 'Olá! Sou o assistente técnico inteligente do FIX App. Diga qual barulho, luz no painel ou problema seu carro/moto apresenta e eu te dou um pré-diagnóstico com média de preços!',
        timestamp: '10:00'
      }
    ]
  },
  {
    id: 'autotech',
    name: 'AutoTech Centro Automotivo',
    avatar: '🔧',
    roleTag: 'Oficina Parceira',
    isOnline: true,
    lastMessage: 'Confirmado! Seu orçamento de troca de óleo ficou em R$ 220,00.',
    time: '10:42',
    messages: [
      {
        id: '1',
        sender: 'them',
        text: 'Bom dia! Recebemos sua solicitação de revisão pelo FIX App.',
        timestamp: '10:30'
      },
      {
        id: '2',
        sender: 'me',
        text: 'Bom dia! Qual o valor para substituição do filtro e óleo sintético 5w30?',
        timestamp: '10:35'
      },
      {
        id: '3',
        sender: 'them',
        text: 'Confirmado! Seu orçamento de troca de óleo ficou em R$ 220,00. Pode trazer o veículo até às 17h.',
        timestamp: '10:42'
      }
    ]
  },
  {
    id: 'guincho24h',
    name: 'Guincho & Reboque Rápido Silva',
    avatar: '🚨',
    roleTag: 'Socorro Rodoviário',
    isOnline: true,
    lastMessage: 'Estou a 3.5km da sua posição. Chego em aproximadamente 12 minutos!',
    time: 'Ontem',
    messages: [
      {
        id: '1',
        sender: 'me',
        text: 'Preciso de reboque no acostamento da rodovia km 42!',
        timestamp: '18:15',
        isLocation: true
      },
      {
        id: '2',
        sender: 'them',
        text: 'Estou a 3.5km da sua posição. Chego em aproximadamente 12 minutos!',
        timestamp: '18:17'
      }
    ]
  }
];

interface ChatScreenProps {
  user: User;
  userLocation: Coordinates | null;
  onBack: () => void;
}

export const ChatScreen: React.FC<ChatScreenProps> = ({
  user,
  userLocation,
  onBack
}) => {
  const [conversations, setConversations] = useState<ChatConversation[]>(INITIAL_CONVERSATIONS);
  const [activeChatId, setActiveChatId] = useState<string>('ai-assistant');
  const [inputMessage, setInputMessage] = useState('');
  const [searchFilter, setSearchFilter] = useState('');

  const activeChat = conversations.find(c => c.id === activeChatId) || conversations[0];

  const handleSendMessage = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputMessage.trim()) return;

    const newMsgText = inputMessage.trim();
    setInputMessage('');

    // Append to active conversation
    setConversations(prev => prev.map(chat => {
      if (chat.id === activeChatId) {
        const updatedMsgs = [
          ...chat.messages,
          {
            id: Date.now().toString(),
            sender: 'me' as const,
            text: newMsgText,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ];
        return {
          ...chat,
          lastMessage: newMsgText,
          time: 'Agora',
          messages: updatedMsgs
        };
      }
      return chat;
    }));

    // Auto Response Simulation for AI or Workshop
    setTimeout(() => {
      setConversations(prev => prev.map(chat => {
        if (chat.id === activeChatId) {
          let replyText = 'Entendido! Estamos analisando sua solicitação e já retornamos.';
          if (chat.isAi) {
            replyText = `💡 **Análise da IA FIX**:\n\nCom base em "${newMsgText}", recomendamos checar o nível de óleo/fluido de freio. O custo estimado de reparo varia entre R$ 150 e R$ 450 em oficinas parceiras próximas.`;
          }

          const updatedMsgs = [
            ...chat.messages,
            {
              id: (Date.now() + 1).toString(),
              sender: 'them' as const,
              text: replyText,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }
          ];
          return {
            ...chat,
            lastMessage: replyText,
            time: 'Agora',
            messages: updatedMsgs
          };
        }
        return chat;
      }));
    }, 1200);
  };

  const filteredConversations = conversations.filter(c =>
    c.name.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div className="flex-1 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col h-[calc(100vh-4rem)] overflow-hidden transition-colors duration-300">
      
      {/* Top Header */}
      <div className="bg-white/90 dark:bg-zinc-900/90 border-b border-zinc-200 dark:border-zinc-800/80 p-3 sm:p-4 flex items-center justify-between shrink-0 transition-colors">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-2xl transition-all cursor-pointer border border-zinc-200 dark:border-zinc-700/50"
            title="Voltar"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <MessageCircle size={20} className="text-indigo-600 dark:text-indigo-400" />
              <span>Central de Mensagens</span>
            </h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Comunicação direta com oficinas e guinchos</p>
          </div>
        </div>
      </div>

      {/* Main Grid: Sidebar list + Active Chat area */}
      <div className="flex-1 flex flex-col md:flex-row min-h-0 overflow-hidden">
        
        {/* Left List of Conversations */}
        <div className={`w-full md:w-80 lg:w-96 bg-white/60 dark:bg-zinc-900/60 border-r border-zinc-200 dark:border-zinc-800/80 flex flex-col shrink-0 ${activeChatId ? 'hidden md:flex' : 'flex'}`}>
          
          {/* Search Box */}
          <div className="p-3 border-b border-zinc-200 dark:border-zinc-800/80">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500" />
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="Buscar conversa..."
                className="w-full bg-zinc-100 dark:bg-zinc-950/80 border border-zinc-200 dark:border-zinc-800 rounded-xl pl-9 pr-3 py-2 text-xs text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Conversations List */}
          <div className="flex-1 overflow-y-auto divide-y divide-zinc-100 dark:divide-zinc-800/40 p-2 space-y-1 scrollbar-none">
            {filteredConversations.map((chat) => {
              const isActive = chat.id === activeChatId;

              return (
                <button
                  key={chat.id}
                  onClick={() => setActiveChatId(chat.id)}
                  className={`w-full text-left p-3 rounded-2xl transition-all flex items-start gap-3 cursor-pointer ${
                    isActive 
                      ? 'bg-indigo-50 dark:bg-indigo-600/20 border border-indigo-200 dark:border-indigo-500/40 text-zinc-900 dark:text-white shadow-xs' 
                      : 'hover:bg-zinc-100 dark:hover:bg-zinc-800/60 text-zinc-700 dark:text-zinc-300 border border-transparent'
                  }`}
                >
                  <div className="relative shrink-0">
                    <div className="w-11 h-11 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700/80 rounded-2xl flex items-center justify-center text-xl shadow-md">
                      {chat.avatar}
                    </div>
                    {chat.isOnline && (
                      <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 border-2 border-white dark:border-zinc-950 rounded-full"></span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <h4 className="font-bold text-xs sm:text-sm text-zinc-900 dark:text-white truncate flex items-center gap-1.5">
                        <span>{chat.name}</span>
                        {chat.isAi && <Sparkles size={13} className="text-amber-500 shrink-0" />}
                      </h4>
                      <span className="text-[10px] text-zinc-400 dark:text-zinc-500 shrink-0">{chat.time}</span>
                    </div>

                    <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate line-clamp-1 font-normal">
                      {chat.lastMessage}
                    </p>

                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 border border-zinc-200 dark:border-zinc-700/50">
                        {chat.roleTag}
                      </span>
                      {chat.unreadCount && chat.unreadCount > 0 ? (
                        <span className="ml-auto text-[10px] bg-indigo-600 text-white font-bold px-1.5 py-0.2 rounded-full">
                          {chat.unreadCount}
                        </span>
                      ) : null}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Active Chat View */}
        <div className={`flex-1 bg-zinc-50 dark:bg-zinc-950 flex flex-col min-w-0 ${!activeChatId ? 'hidden md:flex' : 'flex'}`}>
          
          {/* Active Chat Header */}
          <div className="bg-white/80 dark:bg-zinc-900/80 border-b border-zinc-200 dark:border-zinc-800/80 px-4 py-3 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setActiveChatId('')}
                className="md:hidden p-1.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-xl cursor-pointer"
              >
                <ArrowLeft size={16} />
              </button>
              <div className="w-10 h-10 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700/80 rounded-2xl flex items-center justify-center text-lg shrink-0">
                {activeChat.avatar}
              </div>
              <div>
                <h3 className="font-bold text-sm text-zinc-900 dark:text-white flex items-center gap-1.5">
                  <span>{activeChat.name}</span>
                  {activeChat.isAi && <Sparkles size={14} className="text-amber-500" />}
                </h3>
                <p className="text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>Online agora • {activeChat.roleTag}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => window.open('tel:08009998888')}
                className="p-2 bg-emerald-50 dark:bg-emerald-600/20 hover:bg-emerald-100 dark:hover:bg-emerald-600/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Phone size={14} />
                <span className="hidden sm:inline">Ligar</span>
              </button>
            </div>
          </div>

          {/* Messages Stream Container */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-zinc-100/50 dark:bg-zinc-950 bg-[radial-gradient(#e4e4e7_1px,transparent_1px)] dark:bg-[radial-gradient(#27272a_1px,transparent_1px)] [background-size:16px_16px]">
            {activeChat.messages.map((msg) => {
              const isMe = msg.sender === 'me';

              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[85%] sm:max-w-[70%] p-3.5 rounded-2xl shadow-md text-xs sm:text-sm leading-relaxed ${
                      isMe 
                        ? 'bg-indigo-600 text-white rounded-br-xs shadow-indigo-600/20' 
                        : 'bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 rounded-bl-xs'
                    }`}
                  >
                    {msg.isLocation && (
                      <div className="flex items-center gap-2 mb-2 p-2 bg-indigo-50 dark:bg-black/20 rounded-xl text-xs font-bold text-indigo-700 dark:text-indigo-200">
                        <MapPin size={16} className="text-rose-500" />
                        <span>Localização compartilhada</span>
                      </div>
                    )}
                    <p className="whitespace-pre-line">{msg.text}</p>
                    <div className={`mt-1.5 text-[10px] flex items-center gap-1 justify-end ${isMe ? 'text-indigo-200' : 'text-zinc-400 dark:text-zinc-500'}`}>
                      <span>{msg.timestamp}</span>
                      {isMe && <CheckCheck size={12} className="text-indigo-200" />}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Message Input Box */}
          <form onSubmit={handleSendMessage} className="p-3 bg-white/90 dark:bg-zinc-900/90 border-t border-zinc-200 dark:border-zinc-800/80 flex items-center gap-2 shrink-0">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder={`Enviar mensagem para ${activeChat.name}...`}
              className="flex-1 bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800/90 rounded-2xl px-4 py-3 text-xs sm:text-sm text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
            />

            <button
              type="submit"
              disabled={!inputMessage.trim()}
              className="p-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-2xl shadow-lg shadow-indigo-600/30 transition-all cursor-pointer shrink-0"
            >
              <Send size={18} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
