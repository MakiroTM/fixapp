import React, { useState } from 'react';
import { 
  AlertTriangle, 
  PhoneCall, 
  MapPin, 
  ShieldAlert, 
  Truck, 
  Wrench, 
  Zap, 
  KeyRound, 
  Fuel, 
  ArrowLeft, 
  CheckCircle2, 
  MessageCircle, 
  Navigation,
  Flame,
  Info
} from 'lucide-react';
import { Coordinates, SearchResult, User } from '../types';
import { findMechanics } from '../services/geminiService';
import { VehicleType, ServiceType } from '../types';
import { ResultCard } from './ResultCard';

interface SosEmergencyScreenProps {
  user: User;
  location: Coordinates | null;
  locationError: string | null;
  isDetectingLocation: boolean;
  onBack: () => void;
  onContactMechanic?: (name: string) => void;
}

export const SosEmergencyScreen: React.FC<SosEmergencyScreenProps> = ({
  user,
  location,
  locationError,
  isDetectingLocation,
  onBack,
  onContactMechanic
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('acidente');
  const [customNote, setCustomNote] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [searchResult, setSearchResult] = useState<SearchResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const emergencyCategories = [
    {
      id: 'acidente',
      title: 'Acidente de Trânsito',
      subtitle: 'Colisão, capotamento, veículo preso na pista',
      icon: ShieldAlert,
      color: 'bg-rose-600 border-rose-500 text-white',
      badge: 'URGÊNCIA MÁXIMA',
      prompt: 'Socorro de emergência para acidente de trânsito. Preciso de guincho 24h, remoção de veículo e socorro mecânico no local.'
    },
    {
      id: 'pane_mecanica',
      title: 'Pane Mecânica na Rodovia',
      subtitle: 'Motor desligou, barulho forte, fumaça ou vazamento',
      icon: Wrench,
      color: 'bg-amber-600 border-amber-500 text-white',
      badge: 'URGENTE',
      prompt: 'Pane mecânica com veículo parado na pista/rodovia. Preciso de guincho 24h ou mecânico socorrista urgente.'
    },
    {
      id: 'guincho',
      title: 'Guincho / Reboque 24h',
      subtitle: 'Transporte de veículo impossibilitado de rodar',
      icon: Truck,
      color: 'bg-blue-600 border-blue-500 text-white',
      badge: '24 HORAS',
      prompt: 'Preciso de serviço de guincho/reboque 24h para transporte imediato do veículo.'
    },
    {
      id: 'pneu',
      title: 'Pneu Furado / Sem Estepe',
      subtitle: 'Borracharia móvel ou troca de pneu no local',
      icon: AlertTriangle,
      color: 'bg-zinc-800 border-zinc-700 text-white',
      badge: 'SOCORRO RÁPIDO',
      prompt: 'Pneu furado na pista/rua. Preciso de borracharia 24h móvel ou auxílio para troca de pneu.'
    },
    {
      id: 'bateria',
      title: 'Pane Elétrica / Bateria',
      subtitle: 'Carro não liga, bateria descarregada, chupeta',
      icon: Zap,
      color: 'bg-yellow-600 border-yellow-500 text-white',
      badge: 'ELÉTRICA 24H',
      prompt: 'Carro não liga por bateria descarregada ou pane elétrica. Preciso de auto elétrico ou auxílio de partida (chupeta).'
    },
    {
      id: 'chaveiro',
      title: 'Chaveiro Automotivo',
      subtitle: 'Chave trancada dentro do carro ou perdida',
      icon: KeyRound,
      color: 'bg-indigo-600 border-indigo-500 text-white',
      badge: 'CHAVEIRO 24H',
      prompt: 'Chave trancada dentro do veículo ou perdida na rua. Preciso de chaveiro automotivo 24h.'
    },
    {
      id: 'combustivel',
      title: 'Pane Seca (Combustível)',
      subtitle: 'Combustível acabou na rodovia ou via urbana',
      icon: Fuel,
      color: 'bg-emerald-600 border-emerald-500 text-white',
      badge: 'ENTREGA RÁPIDA',
      prompt: 'Pane seca por falta de combustível. Preciso de entrega de combustível de emergência ou reboque curto.'
    }
  ];

  const handleDispatchEmergency = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    setSearchResult(null);

    const activeCategory = emergencyCategories.find(c => c.id === selectedCategory);
    let fullPrompt = activeCategory ? activeCategory.prompt : 'Socorro mecânico urgente 24h';
    if (customNote.trim()) {
      fullPrompt += ` Detalhes adicionais: ${customNote.trim()}`;
    }

    try {
      const result = await findMechanics(
        fullPrompt,
        VehicleType.CAR,
        ServiceType.EMERGENCY,
        location
      );

      if (result && result.groundingChunks && result.groundingChunks.length > 0) {
        setSearchResult(result);
      } else {
        setErrorMsg('Não foi possível localizar unidades 24h imediatamente próximas. Recomendamos ligar para os serviços públicos abaixo.');
      }
    } catch (err) {
      setErrorMsg('Falha ao conectar com o serviço de emergência. Verifique sua conexão e tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 pb-20 animate-fade-in">
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-rose-950 via-rose-900 to-zinc-900 border-b border-rose-800/40 py-6 px-4 sm:px-8 shadow-2xl relative overflow-hidden">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="p-2.5 bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 rounded-xl border border-zinc-700 transition-all flex items-center gap-2 font-semibold text-sm"
            >
              <ArrowLeft size={18} />
              Voltar
            </button>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-500/20 border border-rose-500/50 text-rose-300 text-xs font-bold uppercase tracking-wider mb-1">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
                Central SOS Emergência 24h
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Atendimento Urgente na Via
              </h1>
            </div>
          </div>

          {/* Location Badge */}
          <div className="bg-zinc-900/90 border border-zinc-700/80 px-4 py-2.5 rounded-2xl flex items-center gap-3">
            <MapPin className={location ? "text-emerald-400" : "text-amber-400"} size={22} />
            <div className="text-xs">
              <p className="text-zinc-400 font-medium">Sua Localização GPS:</p>
              {isDetectingLocation ? (
                <p className="text-blue-400 font-bold animate-pulse">Obtendo coordenadas...</p>
              ) : location ? (
                <p className="text-emerald-400 font-bold">GPS Ativo ({location.latitude.toFixed(4)}, {location.longitude.toFixed(4)})</p>
              ) : (
                <p className="text-amber-400 font-bold">{locationError || "GPS Desativado (Ative para busca exata)"}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 mt-8 space-y-8">
        
        {/* Quick Public Emergency Numbers */}
        <div className="bg-rose-950/40 border border-rose-800/50 rounded-2xl p-4 sm:p-6 shadow-xl">
          <div className="flex items-center gap-2 text-rose-400 font-bold text-sm uppercase tracking-wider mb-3">
            <PhoneCall size={18} />
            <span>Telefones Públicos de Emergência Gratuita</span>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <a 
              href="tel:192" 
              className="flex items-center justify-between bg-zinc-900/90 hover:bg-rose-900/50 border border-rose-800/60 p-3 rounded-xl transition-all group"
            >
              <div>
                <p className="text-xs text-zinc-400 font-medium">SAMU (Médico)</p>
                <p className="text-xl font-black text-rose-400">192</p>
              </div>
              <PhoneCall size={20} className="text-rose-400 group-hover:scale-110 transition-transform" />
            </a>

            <a 
              href="tel:190" 
              className="flex items-center justify-between bg-zinc-900/90 hover:bg-blue-900/50 border border-blue-800/60 p-3 rounded-xl transition-all group"
            >
              <div>
                <p className="text-xs text-zinc-400 font-medium">Polícia Militar</p>
                <p className="text-xl font-black text-blue-400">190</p>
              </div>
              <PhoneCall size={20} className="text-blue-400 group-hover:scale-110 transition-transform" />
            </a>

            <a 
              href="tel:193" 
              className="flex items-center justify-between bg-zinc-900/90 hover:bg-amber-900/50 border border-amber-800/60 p-3 rounded-xl transition-all group"
            >
              <div>
                <p className="text-xs text-zinc-400 font-medium">Bombeiros</p>
                <p className="text-xl font-black text-amber-400">193</p>
              </div>
              <PhoneCall size={20} className="text-amber-400 group-hover:scale-110 transition-transform" />
            </a>

            <a 
              href="tel:191" 
              className="flex items-center justify-between bg-zinc-900/90 hover:bg-emerald-900/50 border border-emerald-800/60 p-3 rounded-xl transition-all group"
            >
              <div>
                <p className="text-xs text-zinc-400 font-medium">Polícia Rodoviária</p>
                <p className="text-xl font-black text-emerald-400">191</p>
              </div>
              <PhoneCall size={20} className="text-emerald-400 group-hover:scale-110 transition-transform" />
            </a>
          </div>
        </div>

        {/* Step 1: Select Emergency Type */}
        <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-5 sm:p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
              <ShieldAlert className="text-rose-500" size={24} />
              Selecione o Tipo de Ocorrência
            </h2>
            <span className="text-xs text-zinc-400 font-medium">Selecione uma opção abaixo</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {emergencyCategories.map((cat) => {
              const Icon = cat.icon;
              const isSelected = selectedCategory === cat.id;

              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`p-4 rounded-xl text-left border transition-all flex flex-col justify-between gap-3 relative ${
                    isSelected
                      ? 'bg-rose-950/60 border-rose-500 ring-2 ring-rose-500/50 shadow-lg shadow-rose-900/30'
                      : 'bg-zinc-900/60 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800/50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className={`p-2.5 rounded-lg ${isSelected ? 'bg-rose-600 text-white' : 'bg-zinc-800 text-rose-400'}`}>
                      <Icon size={22} />
                    </div>
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700">
                      {cat.badge}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-bold text-white text-base leading-tight mb-1">{cat.title}</h3>
                    <p className="text-xs text-zinc-400 leading-relaxed">{cat.subtitle}</p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Optional Notes */}
          <div className="pt-2">
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
              Observações Adicionais (opcional):
            </label>
            <input 
              type="text" 
              value={customNote}
              onChange={(e) => setCustomNote(e.target.value)}
              placeholder="Ex: Estou na Rodovia BR-116 KM 42 próximo ao posto de gasolina, carro branco modelo Sedan..."
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-rose-500 transition-colors"
            />
          </div>

          {/* Main Action Dispatch Button */}
          <div className="pt-2">
            <button
              onClick={handleDispatchEmergency}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white py-4 rounded-xl font-black text-lg sm:text-xl shadow-xl shadow-rose-900/50 flex items-center justify-center gap-3 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed border border-rose-500"
            >
              {isLoading ? (
                <>
                  <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Localizando Unidades de Socorro...</span>
                </>
              ) : (
                <>
                  <ShieldAlert size={26} className="animate-pulse" />
                  <span>ACIONAR SOCORRO IMEDIATO 24H</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Safety Protocol Instructions */}
        <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-5 sm:p-6 space-y-3">
          <h3 className="font-bold text-amber-400 text-sm sm:text-base flex items-center gap-2">
            <Info size={18} />
            Procedimento de Segurança na Via Pública / Rodovia:
          </h3>
          <ul className="text-xs sm:text-sm text-zinc-300 space-y-2 list-disc list-inside leading-relaxed">
            <li>Ligue o <strong>pisca-alerta</strong> imediatamente para alertar os outros motoristas.</li>
            <li>Coloque o <strong>triângulo de sinalização</strong> a pelo menos 30 passos (30 metros) atrás do veículo.</li>
            <li>Se o carro estiver na rodovia ou em local perigoso, <strong>saia do veículo</strong> e aguarde atrás da mureta ou barranco seguro.</li>
            <li>Em caso de feridos, não movimente as vítimas e ligue para o <strong>SAMU (192)</strong>.</li>
          </ul>
        </div>

        {/* Error Display */}
        {errorMsg && (
          <div className="bg-rose-900/50 border border-rose-700 text-rose-200 p-4 rounded-xl text-sm font-medium text-center">
            {errorMsg}
          </div>
        )}

        {/* Results Section */}
        {searchResult && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 sm:p-6 space-y-4 animate-fade-in">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                  <CheckCircle2 size={24} className="text-emerald-500" />
                  Socorristas e Guinchos 24h Encontrados Próximos
                </h2>
                <p className="text-xs text-zinc-400 mt-0.5">Atendimento ordenado por proximidade e disponibilidade</p>
              </div>
            </div>

            {/* AI Summary */}
            {searchResult.text && (
              <div className="bg-zinc-950 p-4 rounded-xl text-xs sm:text-sm text-zinc-300 leading-relaxed border border-zinc-800/80">
                {searchResult.text}
              </div>
            )}

            {/* Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {searchResult.groundingChunks?.map((chunk, index) => {
                if (!chunk.maps) return null;
                return (
                  <ResultCard 
                    key={index} 
                    chunk={chunk} 
                    onContact={(name) => {
                      if (onContactMechanic) {
                        onContactMechanic(name);
                      }
                    }} 
                  />
                );
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
