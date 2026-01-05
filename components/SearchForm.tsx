import React, { useState } from 'react';
import { VehicleType, ServiceType } from '../types';
import { Search, Loader2, Car, PenTool, ShoppingBag, Wrench, Package } from 'lucide-react';

interface SearchFormProps {
  onSearch: (vehicle: VehicleType, service: ServiceType, query: string, carModel: string, problemCategory: string) => void;
  isLoading: boolean;
  initialService?: ServiceType;
}

const COMMON_PROBLEMS = [
  "Pneu Furado",
  "Bateria/Elétrica",
  "Superaquecimento",
  "Pane Seca",
  "Acidente/Batida",
  "Freios",
  "Suspensão",
  "Luz no Painel"
];

const COMMON_PARTS = [
  "Bateria 60Ah",
  "Pneu Aro 14",
  "Óleo 5w30",
  "Pastilha de Freio",
  "Lâmpada Farol",
  "Amortecedor",
  "Kit Embreagem",
  "Limpador Parabrisa"
];

export const SearchForm: React.FC<SearchFormProps> = ({ onSearch, isLoading, initialService }) => {
  const [activeTab, setActiveTab] = useState<'services' | 'parts'>('services');
  const [vehicle, setVehicle] = useState<VehicleType>(VehicleType.CAR);
  const [service, setService] = useState<ServiceType>(initialService || ServiceType.MAINTENANCE);
  const [carModel, setCarModel] = useState('');
  const [problemCategory, setProblemCategory] = useState('');
  const [query, setQuery] = useState('');

  // Update local state if initialService prop changes
  React.useEffect(() => {
    if (initialService) {
      if (initialService === ServiceType.PARTS) {
        setActiveTab('parts');
      } else {
        setService(initialService);
        setActiveTab('services');
      }
    }
  }, [initialService]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const effectiveService = activeTab === 'parts' ? ServiceType.PARTS : service;
    onSearch(vehicle, effectiveService, query, carModel, problemCategory);
  };

  const handleChipSelect = (text: string) => {
    if (activeTab === 'parts') {
       // For parts, we populate the query directly
       setQuery(text);
    } else {
       // For services, we set the problem category
       setProblemCategory(text === problemCategory ? '' : text);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-zinc-800 rounded-2xl p-6 shadow-xl shadow-zinc-200/50 dark:shadow-none border border-zinc-100 dark:border-zinc-700 -mt-10 relative z-20 mx-4 max-w-4xl lg:mx-auto transition-colors duration-300">
      
      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-zinc-100 dark:border-zinc-700 pb-1">
        <button
          type="button"
          onClick={() => setActiveTab('services')}
          className={`flex-1 pb-3 text-center font-bold text-sm flex items-center justify-center gap-2 transition-all relative ${
            activeTab === 'services' ? 'text-indigo-600 dark:text-indigo-400' : 'text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300'
          }`}
        >
          <Wrench size={18} />
          Serviços e Mecânicos
          {activeTab === 'services' && <div className="absolute bottom-[-5px] left-0 w-full h-1 bg-indigo-600 dark:bg-indigo-500 rounded-full"></div>}
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('parts')}
          className={`flex-1 pb-3 text-center font-bold text-sm flex items-center justify-center gap-2 transition-all relative ${
            activeTab === 'parts' ? 'text-indigo-600 dark:text-indigo-400' : 'text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300'
          }`}
        >
          <ShoppingBag size={18} />
          Comprar Peças
          {activeTab === 'parts' && <div className="absolute bottom-[-5px] left-0 w-full h-1 bg-indigo-600 dark:bg-indigo-500 rounded-full"></div>}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Veículo (Comum a ambos) */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">Para qual veículo?</label>
            <div className="relative">
              <select 
                value={vehicle}
                onChange={(e) => setVehicle(e.target.value as VehicleType)}
                className="w-full p-3 pl-4 rounded-xl border border-zinc-200 dark:border-zinc-600 bg-zinc-50 dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all appearance-none text-zinc-700 dark:text-zinc-200 font-medium"
              >
                {Object.values(VehicleType).map((v) => (
                  <option key={v} value={v}>{v}</option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
              </div>
            </div>
          </div>

          <div>
             <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">Modelo (Opcional)</label>
             <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400">
                  <Car size={18} />
                </div>
                <input 
                  type="text" 
                  value={carModel}
                  onChange={(e) => setCarModel(e.target.value)}
                  placeholder="Ex: Fiat Uno, Honda Civic..." 
                  className="w-full p-3 pl-10 rounded-xl border border-zinc-200 dark:border-zinc-600 bg-zinc-50 dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all placeholder:text-zinc-400 text-zinc-800 dark:text-zinc-100"
                />
             </div>
          </div>
        </div>

        {/* Campos Específicos por Aba */}
        <div className="space-y-4">
          {activeTab === 'services' ? (
            <div>
              <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">Tipo de Serviço</label>
              <div className="relative">
                <select 
                  value={service}
                  onChange={(e) => setService(e.target.value as ServiceType)}
                  className="w-full p-3 pl-4 rounded-xl border border-zinc-200 dark:border-zinc-600 bg-zinc-50 dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all appearance-none text-zinc-700 dark:text-zinc-200 font-medium"
                >
                  {Object.values(ServiceType)
                    .filter(s => s !== ServiceType.PARTS)
                    .map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
              </div>
            </div>
          ) : (
            <div>
               <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">Categoria da Peça</label>
               <div className="bg-zinc-100 dark:bg-zinc-700/50 p-3 rounded-xl text-zinc-500 dark:text-zinc-400 text-sm border border-zinc-200 dark:border-zinc-700 flex items-center gap-2">
                 <ShoppingBag size={16} />
                 <span>Buscando em lojas de autopeças</span>
               </div>
            </div>
          )}
          
           <div>
             <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
               {activeTab === 'services' ? 'O que está acontecendo? (Extra)' : 'Qual peça você precisa?'}
             </label>
             <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400">
                  {activeTab === 'services' ? <PenTool size={18} /> : <Package size={18} />}
                </div>
                <input 
                  type="text" 
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={activeTab === 'services' ? "Ex: Barulho ao frear..." : "Ex: Pneu 175/70 R13, Bateria Moura..."}
                  className="w-full p-3 pl-10 rounded-xl border border-zinc-200 dark:border-zinc-600 bg-zinc-50 dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all placeholder:text-zinc-400 text-zinc-800 dark:text-zinc-100"
                />
             </div>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-3">
          {activeTab === 'services' ? 'Problemas Comuns' : 'Peças Populares'}
        </label>
        <div className="flex flex-wrap gap-2">
          {(activeTab === 'services' ? COMMON_PROBLEMS : COMMON_PARTS).map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => handleChipSelect(item)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border ${
                (activeTab === 'services' ? problemCategory === item : query === item)
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-200 dark:shadow-none transform scale-105'
                  : 'bg-white dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300 border-zinc-200 dark:border-zinc-600 hover:border-indigo-300 hover:bg-indigo-50 dark:hover:bg-zinc-600'
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      <button 
        type="submit" 
        disabled={isLoading}
        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 px-6 rounded-xl flex items-center justify-center gap-2 transition-all hover:shadow-lg hover:shadow-indigo-500/30 disabled:opacity-70 disabled:cursor-not-allowed transform active:scale-[0.99]"
      >
        {isLoading ? (
          <>
            <Loader2 className="animate-spin" size={20} />
            {activeTab === 'services' ? 'Localizando Serviços...' : 'Buscando Peças...'}
          </>
        ) : (
          <>
            <Search size={20} />
            {activeTab === 'services' ? 'Encontrar Mecânicos Próximos' : 'Encontrar Lojas de Peças'}
          </>
        )}
      </button>
    </form>
  );
};