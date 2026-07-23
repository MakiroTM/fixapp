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
    console.log('[DEBUG SearchForm] Submitting search parameters', {
      activeTab,
      vehicle,
      effectiveService,
      query,
      carModel,
      problemCategory
    });
    onSearch(vehicle, effectiveService, query, carModel, problemCategory);
  };

  const handleChipSelect = (text: string) => {
    console.log('[DEBUG SearchForm] Selected chip/problem option:', text);
    if (activeTab === 'parts') {
       // For parts, we populate the query directly
       setQuery(text);
    } else {
       // For services, we set the problem category
       const isDeselecting = text === problemCategory;
       const nextProblem = isDeselecting ? '' : text;
       setProblemCategory(nextProblem);
       
       // Automatically sync service type based on problem category selected
       if (!isDeselecting) {
         if (text.includes("Pneu")) setService(ServiceType.TIRE);
         else if (text.includes("Bateria") || text.includes("Elétrica")) setService(ServiceType.ELECTRICAL);
         else if (text.includes("Pane") || text.includes("Acidente")) setService(ServiceType.EMERGENCY);
         else setService(ServiceType.MAINTENANCE);
       }

       // Se estiver selecionando e o campo de texto estiver vazio, preenchemos ele também
       if (!isDeselecting && (!query || query === problemCategory)) {
         setQuery(text);
       }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-zinc-850 rounded-3xl p-5 sm:p-7 shadow-xl shadow-zinc-200/40 dark:shadow-none border border-zinc-200/80 dark:border-zinc-700/80 relative z-20 max-w-4xl mx-auto transition-all">
      
      {/* Segmented Pill Tabs */}
      <div className="flex p-1 bg-zinc-100 dark:bg-zinc-800 rounded-2xl mb-5 sm:mb-6 border border-zinc-200/60 dark:border-zinc-700/60">
        <button
          type="button"
          onClick={() => setActiveTab('services')}
          className={`flex-1 py-2 sm:py-2.5 text-center font-bold text-xs sm:text-sm flex items-center justify-center gap-2 rounded-xl transition-all cursor-pointer ${
            activeTab === 'services' 
              ? 'bg-white dark:bg-zinc-700 text-indigo-600 dark:text-indigo-300 shadow-sm' 
              : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200'
          }`}
        >
          <Wrench size={15} />
          <span>Serviços & Mecânicos</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('parts')}
          className={`flex-1 py-2 sm:py-2.5 text-center font-bold text-xs sm:text-sm flex items-center justify-center gap-2 rounded-xl transition-all cursor-pointer ${
            activeTab === 'parts' 
              ? 'bg-white dark:bg-zinc-700 text-indigo-600 dark:text-indigo-300 shadow-sm' 
              : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200'
          }`}
        >
          <ShoppingBag size={15} />
          <span>Comprar Peças</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 mb-5">
        {/* Veículo (Comum a ambos) */}
        <div className="space-y-3.5">
          <div>
            <label className="block text-xs font-bold text-zinc-600 dark:text-zinc-300 mb-1.5 uppercase tracking-wider">
              Para qual veículo?
            </label>
            <div className="relative">
              <select 
                value={vehicle}
                onChange={(e) => setVehicle(e.target.value as VehicleType)}
                className="w-full p-3 pl-3.5 rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all appearance-none text-zinc-800 dark:text-zinc-100 font-semibold text-sm cursor-pointer"
              >
                {Object.values(VehicleType).map((v) => (
                  <option key={v} value={v}>{v}</option>
                ))}
              </select>
              <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
              </div>
            </div>
          </div>

          <div>
             <label className="block text-xs font-bold text-zinc-600 dark:text-zinc-300 mb-1.5 uppercase tracking-wider">
               Modelo (Opcional)
             </label>
             <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400">
                  <Car size={16} />
                </div>
                <input 
                  type="text" 
                  value={carModel}
                  onChange={(e) => setCarModel(e.target.value)}
                  placeholder="Ex: Fiat Uno, Honda Civic..." 
                  className="w-full p-3 pl-10 rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all placeholder:text-zinc-400 text-zinc-800 dark:text-zinc-100 text-sm font-medium"
                />
             </div>
          </div>
        </div>

        {/* Campos Específicos por Aba */}
        <div className="space-y-3.5">
          {activeTab === 'services' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-zinc-600 dark:text-zinc-300 mb-1.5 uppercase tracking-wider">
                  Tipo de Serviço
                </label>
                <div className="relative">
                  <select 
                    value={service}
                    onChange={(e) => setService(e.target.value as ServiceType)}
                    className="w-full p-3 pl-3.5 rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all appearance-none text-zinc-800 dark:text-zinc-100 font-semibold text-sm cursor-pointer"
                  >
                    {Object.values(ServiceType)
                      .filter(s => s !== ServiceType.PARTS)
                      .map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-600 dark:text-zinc-300 mb-1.5 uppercase tracking-wider">
                  Problema Comum
                </label>
                <div className="relative">
                  <select 
                    value={problemCategory}
                    onChange={(e) => handleChipSelect(e.target.value)}
                    className="w-full p-3 pl-3.5 rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all appearance-none text-zinc-800 dark:text-zinc-100 font-semibold text-sm cursor-pointer"
                  >
                    <option value="">Selecione um problema...</option>
                    {COMMON_PROBLEMS.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div>
               <label className="block text-xs font-bold text-zinc-600 dark:text-zinc-300 mb-1.5 uppercase tracking-wider">
                 Categoria da Peça
               </label>
               <div className="bg-zinc-50 dark:bg-zinc-900 p-3 rounded-2xl text-zinc-500 dark:text-zinc-400 text-xs border border-zinc-200 dark:border-zinc-700 flex items-center gap-2 font-medium">
                 <ShoppingBag size={15} className="text-indigo-500" />
                 <span>Buscando em lojas e fornecedores de autopeças</span>
               </div>
            </div>
          )}
          
           <div>
             <label className="block text-xs font-bold text-zinc-600 dark:text-zinc-300 mb-1.5 uppercase tracking-wider">
               {activeTab === 'services' ? 'Detalhar problema (Opcional)' : 'Qual peça você precisa?'}
             </label>
             <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400">
                  {activeTab === 'services' ? <PenTool size={16} /> : <Package size={16} />}
                </div>
                <input 
                  type="text" 
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={activeTab === 'services' ? "Ex: Barulho ao frear, fumaça escura..." : "Ex: Pneu 175/70 R13, Bateria Moura 60Ah..."}
                  className="w-full p-3 pl-10 rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all placeholder:text-zinc-400 text-zinc-800 dark:text-zinc-100 text-sm font-medium"
                />
             </div>
          </div>
        </div>
      </div>

      {/* Chip Quick Options */}
      <div className="mb-5">
        <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 mb-2 uppercase tracking-wider">
          {activeTab === 'services' ? 'Atalhos Rápidos de Diagnóstico' : 'Peças Mais Procuradas'}
        </label>
        <div className="flex flex-wrap gap-1.5">
          {(activeTab === 'services' ? COMMON_PROBLEMS : COMMON_PARTS).map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => handleChipSelect(item)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                (activeTab === 'services' ? problemCategory === item : query === item)
                  ? 'bg-indigo-600 text-white shadow-sm ring-2 ring-indigo-400/50'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
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
        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 px-5 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-600/25 disabled:opacity-70 disabled:cursor-not-allowed text-sm cursor-pointer"
      >
        {isLoading ? (
          <>
            <Loader2 size={18} className="animate-spin" />
            <span>{activeTab === 'services' ? 'Localizando Serviços...' : 'Buscando Peças...'}</span>
          </>
        ) : (
          <>
            <Search size={18} />
            <span>{activeTab === 'services' ? 'Buscar Mecânicos Próximos' : 'Buscar Lojas de Peças'}</span>
          </>
        )}
      </button>
    </form>
  );
};