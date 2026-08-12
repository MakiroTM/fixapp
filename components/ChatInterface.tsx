import React, { useState, useEffect, useRef } from 'react';
import { Send, X, Phone, MoreVertical, Paperclip, MapPin, Map as MapIcon, CheckCircle, Star, ChevronDown, ChevronUp } from 'lucide-react';
import Markdown from 'react-markdown';
import { ChatMessage, ServiceStatus } from '../types';
import { MapComponent } from './MapComponent';
import { StatusIndicator, STATUS_CONFIG } from './StatusIndicator';
import { EtaWidget } from './EtaWidget';
import { VerifiedBadge } from './VerifiedBadge';
import { ServiceRatingModal } from './ServiceRatingModal';

interface ChatInterfaceProps {
  recipientName: string;
  initialMessages?: ChatMessage[];
  onClose: () => void;
  isOpen: boolean;
  userRole: 'CLIENT' | 'MECHANIC';
  initialStatus?: ServiceStatus;
  onStatusChange?: (status: ServiceStatus) => void;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ 
  recipientName, 
  initialMessages = [], 
  onClose, 
  isOpen,
  userRole,
  initialStatus = 'PENDING',
  onStatusChange
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [newMessage, setNewMessage] = useState('');
  const [isLocating, setIsLocating] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<{lat: number, lng: number} | null>(null);
  const [showRating, setShowRating] = useState(false);
  const [selectedStars, setSelectedStars] = useState(0);
  const [hoverStars, setHoverStars] = useState(0);
  
  // Service Status State
  const [status, setStatus] = useState<ServiceStatus>(initialStatus);
  const [showStatusDetails, setShowStatusDetails] = useState(true);

  useEffect(() => {
    if (initialStatus) {
      setStatus(initialStatus);
    }
  }, [initialStatus]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleUpdateStatus = (newStatus: ServiceStatus) => {
    setStatus(newStatus);
    if (onStatusChange) {
      onStatusChange(newStatus);
    }

    if (newStatus === 'COMPLETED' && userRole === 'CLIENT') {
      setShowRating(true);
    }

    const conf = STATUS_CONFIG[newStatus];
    const systemMsg: ChatMessage = {
      id: Date.now().toString(),
      text: `🔄 **Status do chamado alterado para:** ${conf.label}\n\n*${conf.description}*`,
      sender: 'them',
      timestamp: new Date()
    };
    setMessages(prev => [...prev, systemMsg]);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  useEffect(() => {
    setMessages(initialMessages);
  }, [initialMessages]);

  const handleSend = (e?: React.FormEvent, textOverride?: string) => {
    e?.preventDefault();
    const textToSend = textOverride || newMessage;
    if (!textToSend.trim()) return;

    const msg: ChatMessage = {
      id: Date.now().toString(),
      text: textToSend,
      sender: 'me',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, msg]);
    if (!textOverride) setNewMessage('');

    // Simular resposta automática após 2 segundos
    setTimeout(() => {
      const responses = userRole === 'CLIENT' 
        ? ["Olá! Recebi seu pedido. Qual o modelo exato do carro?", "Posso fazer um orçamento sim. Poderia trazer o carro aqui?", "Estou disponível agora."]
        : ["Ok, estou aguardando.", "Obrigado por aceitar rápido!", "Estou no acostamento, km 45."];
      
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];

      const reply: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: randomResponse,
        sender: 'them',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, reply]);
    }, 2000);
  };

  const shareLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocalização não é suportada pelo seu navegador.");
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const mapsUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;
        // Adicionamos metadados de localização na mensagem para facilitar a detecção
        const locationMessage = `📍 **Minha localização atual**\n\n[Ver no Google Maps](${mapsUrl})\n\n<!-- location:${latitude},${longitude} -->`;
        handleSend(undefined, locationMessage);
        setIsLocating(false);
      },
      (error) => {
        console.error("Erro ao obter localização:", error);
        alert("Não foi possível obter sua localização. Verifique as permissões do navegador.");
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const extractCoords = (text: string) => {
    const match = text.match(/<!-- location:(-?\d+\.\d+),(-?\d+\.\d+) -->/);
    if (match) {
      return { lat: parseFloat(match[1]), lng: parseFloat(match[2]) };
    }
    return null;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center pointer-events-none">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm pointer-events-auto transition-opacity" onClick={onClose}></div>
      
      <div className="bg-white dark:bg-zinc-900 w-full sm:w-[400px] sm:h-[600px] h-[90vh] rounded-t-3xl sm:rounded-2xl shadow-2xl flex flex-col pointer-events-auto animate-fly-in-top overflow-hidden border border-zinc-200 dark:border-zinc-800">
        
        {/* Header */}
        <div className="p-4 bg-indigo-600 dark:bg-zinc-950 text-white flex items-center justify-between shadow-md z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center font-bold text-lg">
              {recipientName.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <h3 className="font-bold text-sm">{recipientName}</h3>
                {userRole === 'CLIENT' && <VerifiedBadge size="sm" rating={4.8} />}
              </div>
              <p className="text-xs text-indigo-200 flex items-center gap-1 mt-0.5">
                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
                Online agora
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
             <EtaWidget compact={true} status={status} />
             <button 
               onClick={() => setShowStatusDetails(!showStatusDetails)} 
               className="px-2 py-1 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-bold transition-colors flex items-center gap-1"
               title="Alternar Detalhes do Status"
             >
               <StatusIndicator status={status} variant="badge" />
               {showStatusDetails ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
             </button>
             {userRole === 'CLIENT' && (
               <button onClick={() => setShowRating(true)} className="p-2 hover:bg-white/10 rounded-full transition-colors flex items-center gap-1 text-xs" title="Concluir Serviço e Avaliar">
                 <CheckCircle size={18} />
                 <span className="hidden sm:inline font-medium">Concluir</span>
               </button>
             )}
             <button className="p-2 hover:bg-white/10 rounded-full transition-colors"><Phone size={18} /></button>
             <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X size={20} /></button>
          </div>
        </div>

        {/* Live Service Status Stepper Tracker */}
        {showStatusDetails && (
          <div className="p-3 bg-zinc-100 dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800 animate-fade-in">
            <StatusIndicator 
              status={status} 
              variant="full" 
              isEditable={userRole === 'MECHANIC' || userRole === 'CLIENT'}
              onStatusChange={handleUpdateStatus} 
            />
          </div>
        )}

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-zinc-50 dark:bg-zinc-900/50 scrollbar-thin relative">
          {messages.map((msg) => {
            const coords = extractCoords(msg.text);
            return (
              <div 
                key={msg.id} 
                className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`max-w-[80%] p-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
                    msg.sender === 'me' 
                      ? 'bg-indigo-600 text-white rounded-br-none' 
                      : 'bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 rounded-bl-none border border-zinc-100 dark:border-zinc-700'
                  }`}
                >
                  <div className={`max-w-none break-words ${
                    msg.sender === 'me' 
                      ? '[&_a]:text-white [&_a]:underline [&_a]:font-medium' 
                      : '[&_a]:text-indigo-600 dark:[&_a]:text-indigo-400 [&_a]:underline'
                  }`}>
                    <Markdown>{msg.text.replace(/<!-- location:.* -->/, '')}</Markdown>
                  </div>
                  
                  {coords && (
                    <button 
                      onClick={() => setSelectedLocation(coords)}
                      className={`mt-3 w-full py-2 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
                        msg.sender === 'me'
                          ? 'bg-white/20 hover:bg-white/30 text-white'
                          : 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100'
                      }`}
                    >
                      <MapIcon size={16} />
                      Ver no Mapa Interno
                    </button>
                  )}

                  <div className={`text-[10px] mt-1 text-right ${msg.sender === 'me' ? 'text-indigo-200' : 'text-zinc-400'}`}>
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />

          {/* Map Overlay inside Chat */}
          {selectedLocation && (
            <div className="absolute inset-0 z-20 p-2 animate-fade-in">
              <MapComponent 
                latitude={selectedLocation.lat} 
                longitude={selectedLocation.lng} 
                title="Localização do Cliente"
                onClose={() => setSelectedLocation(null)}
              />
            </div>
          )}
        </div>

        {/* Input Area */}
        <form onSubmit={handleSend} className="p-3 bg-white dark:bg-zinc-900 border-t border-zinc-100 dark:border-zinc-800 flex items-center gap-2">
          <div className="flex items-center">
            <button type="button" className="p-2 text-zinc-400 hover:text-indigo-600 transition-colors" title="Anexar arquivo">
              <Paperclip size={20} />
            </button>
            {userRole === 'CLIENT' && (
              <button 
                type="button" 
                onClick={shareLocation}
                disabled={isLocating}
                className={`p-2 transition-colors ${isLocating ? 'text-indigo-400 animate-pulse' : 'text-zinc-400 hover:text-indigo-600'}`}
                title="Compartilhar localização"
              >
                <MapPin size={20} />
              </button>
            )}
          </div>
          <input 
            type="text" 
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Digite uma mensagem..."
            className="flex-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-100 rounded-full px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-sm"
          />
          <button 
            type="submit" 
            disabled={!newMessage.trim()}
            className="p-3 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-indigo-500/20"
          >
            <Send size={18} />
          </button>
        </form>
      </div>

      {/* Service Rating Modal */}
      <ServiceRatingModal
        isOpen={showRating}
        onClose={() => setShowRating(false)}
        mechanicName={recipientName}
        serviceType="Atendimento via Chat FIX"
        onSubmitRating={(rating, comment, tags) => {
          let msgText = `✅ **Serviço Concluído & Avaliado!**\n\n★ Avaliação: **${rating}/5 estrelas**`;
          if (tags && tags.length > 0) {
            msgText += `\n\n🏷️ Destaques: ${tags.join(' • ')}`;
          }
          if (comment && comment.trim()) {
            msgText += `\n\n💬 *"${comment.trim()}"*`;
          }
          handleSend(undefined, msgText);
          setShowRating(false);
        }}
      />
    </div>
  );
};