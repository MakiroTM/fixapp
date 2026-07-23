import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, Send, ChevronDown, ChevronUp, Sparkles, CheckCheck, User, Wrench } from 'lucide-react';
import { ChatMessage } from '../types';

interface QuickChatCardProps {
  recipientName: string;
  recipientRole?: 'Mecânico' | 'Motorista' | string;
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  serviceTitle?: string;
  defaultExpanded?: boolean;
}

export const QuickChatCard: React.FC<QuickChatCardProps> = ({
  recipientName,
  recipientRole = 'Mecânico',
  messages,
  onSendMessage,
  serviceTitle,
  defaultExpanded = true
}) => {
  const [inputText, setInputText] = useState('');
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Quick message presets depending on sender/recipient
  const quickPresets = [
    'Estou a caminho! 🚗',
    'Estou no local 📍',
    'Chego em 5 minutos! ⏱️',
    'Qual o modelo exato do veículo? 🚘',
    'Tudo certo, obrigado! 👍'
  ];

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;
    onSendMessage(inputText.trim());
    setInputText('');
  };

  const handlePresetClick = (preset: string) => {
    onSendMessage(preset);
  };

  useEffect(() => {
    if (isExpanded) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isExpanded]);

  return (
    <div className="bg-zinc-950/80 dark:bg-zinc-900/90 border border-indigo-500/30 rounded-2xl overflow-hidden shadow-xl transition-all">
      {/* Header bar */}
      <div 
        onClick={() => setIsExpanded(!isExpanded)}
        className="px-4 py-3 bg-gradient-to-r from-indigo-950/80 via-zinc-900 to-indigo-950/80 border-b border-indigo-500/20 flex items-center justify-between cursor-pointer hover:bg-zinc-800/50 transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <div className="p-1.5 bg-indigo-600/30 border border-indigo-400/30 rounded-lg text-indigo-300">
              <MessageCircle size={16} />
            </div>
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-zinc-950 animate-pulse" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-white">{recipientName}</span>
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                {recipientRole}
              </span>
            </div>
            <p className="text-[10px] text-zinc-400">
              {serviceTitle ? `Chat direto do chamado: ${serviceTitle}` : 'Mensagens rápidas do atendimento'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {messages.length > 0 && (
            <span className="text-[10px] font-extrabold bg-indigo-600 text-white px-2 py-0.5 rounded-full">
              {messages.length} msg{messages.length > 1 ? 's' : ''}
            </span>
          )}
          <button 
            type="button" 
            className="p-1 text-zinc-400 hover:text-white transition-colors"
          >
            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>
      </div>

      {/* Expanded Chat Content */}
      {isExpanded && (
        <div className="p-3 sm:p-4 space-y-3">
          {/* Quick Presets Carousel */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-[11px]">
            <span className="text-[10px] uppercase tracking-wider font-extrabold text-zinc-400 shrink-0 flex items-center gap-1 mr-1">
              <Sparkles size={11} className="text-indigo-400" /> Rápido:
            </span>
            {quickPresets.map((preset, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handlePresetClick(preset)}
                className="shrink-0 px-2.5 py-1 bg-zinc-800/90 hover:bg-indigo-600/30 hover:border-indigo-400/40 border border-zinc-700/60 rounded-full text-zinc-200 hover:text-white transition-all cursor-pointer whitespace-nowrap active:scale-95"
              >
                {preset}
              </button>
            ))}
          </div>

          {/* Messages Container */}
          <div className="max-h-48 min-h-[110px] overflow-y-auto space-y-2 pr-1.5 scrollbar-thin scrollbar-thumb-zinc-700">
            {messages.length === 0 ? (
              <div className="text-center py-6 text-zinc-400 space-y-1">
                <p className="text-xs font-semibold">Nenhuma mensagem ainda.</p>
                <p className="text-[11px] text-zinc-400">Envie uma mensagem ou use os atalhos acima para conversar em tempo real.</p>
              </div>
            ) : (
              messages.map((msg) => {
                const isMe = msg.sender === 'me';
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-3 py-2 text-xs leading-relaxed shadow-sm ${
                        isMe
                          ? 'bg-indigo-600 text-white rounded-br-none'
                          : 'bg-zinc-800 text-zinc-100 border border-zinc-700/50 rounded-bl-none'
                      }`}
                    >
                      <p className="whitespace-pre-wrap font-medium">{msg.text}</p>
                      <div className={`flex items-center justify-end gap-1 mt-1 text-[9px] ${isMe ? 'text-indigo-200' : 'text-zinc-400'}`}>
                        <span>
                          {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        {isMe && <CheckCheck size={11} className="text-indigo-200" />}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Form */}
          <form onSubmit={handleSend} className="flex items-center gap-2 pt-1 border-t border-zinc-800">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={`Enviar mensagem para ${recipientName}...`}
              className="flex-1 bg-zinc-900 border border-zinc-700/80 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />
            <button
              type="submit"
              disabled={!inputText.trim()}
              className="p-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:hover:bg-indigo-600 text-white rounded-xl transition-all cursor-pointer shadow-md shadow-indigo-600/30 flex items-center justify-center shrink-0"
              title="Enviar mensagem"
            >
              <Send size={15} />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
