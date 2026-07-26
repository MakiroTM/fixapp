import React, { useState, useEffect } from 'react';
import { MaintenanceRecord } from '../types';
import { VerifiedBadge } from './VerifiedBadge';
import { 
  Wrench, 
  Calendar, 
  DollarSign, 
  Search, 
  Filter, 
  CheckCircle2, 
  Star, 
  FileText, 
  Car, 
  ShieldCheck, 
  Plus, 
  ChevronDown, 
  ChevronUp, 
  Receipt, 
  X, 
  Sparkles,
  AlertTriangle,
  Clock,
  Printer
} from 'lucide-react';

const MOCK_INITIAL_HISTORY: MaintenanceRecord[] = [
  {
    id: 'FIX-8921',
    serviceType: 'Troca de Óleo e Filtro Sintético 5W30',
    mechanicName: 'Auto Elétrica & Mecânica Silva',
    vehicleInfo: 'Fiat Uno Way 2013 • ABC-1234',
    date: '18/07/2026',
    price: 220.00,
    paymentMethod: 'PIX',
    status: 'COMPLETED',
    rating: 5,
    notes: 'Substituição de 4 litros de óleo Havoline 5W30 + filtro de óleo e filtro de combustível. Verificação de nível de fluidos e pressão de pneus inclusa.',
    receiptId: 'REC-20260718-992',
    tags: ['⚡ Chegou super rápido', '💰 Preço transparente']
  },
  {
    id: 'FIX-7410',
    serviceType: 'Alinhamento 3D e Balanceamento',
    mechanicName: 'Centro Automotivo PneuCerto',
    vehicleInfo: 'Fiat Uno Way 2013 • ABC-1234',
    date: '02/06/2026',
    price: 150.00,
    paymentMethod: 'CREDIT_CARD',
    status: 'COMPLETED',
    rating: 5,
    notes: 'Alinhamento computadorizado a laser do eixo dianteiro e balanceamento dinâmico das 4 rodas.',
    receiptId: 'REC-20260602-411',
    tags: ['✨ Cuidadoso com o veículo', '⭐ Recomendo fortemente']
  },
  {
    id: 'FIX-5102',
    serviceType: 'Substituição do Kit Correia Dentada',
    mechanicName: 'Oficina Especializada FIX',
    vehicleInfo: 'Fiat Uno Way 2013 • ABC-1234',
    date: '15/03/2026',
    price: 480.00,
    paymentMethod: 'CREDIT_CARD',
    status: 'COMPLETED',
    rating: 4,
    notes: 'Troca preventiva do kit de correia dentada, rolamento tensor e bomba d\'água. Teste de rodagem e sangria do sistema de arrefecimento.',
    receiptId: 'REC-20260315-102',
    tags: ['🔧 Diagnóstico preciso']
  },
  {
    id: 'FIX-3390',
    serviceType: 'Atendimento de Emergência - Troca de Bateria 60Ah',
    mechanicName: 'Auto Socorro 24h Express',
    vehicleInfo: 'Fiat Uno Way 2013 • ABC-1234',
    date: '10/01/2026',
    price: 390.00,
    paymentMethod: 'PIX',
    status: 'COMPLETED',
    rating: 5,
    notes: 'Atendimento emergencial em via pública. Bateria Moura 60Ah selada instalada com teste do alternador e garantia nacional de 24 meses.',
    receiptId: 'REC-20260110-881',
    tags: ['⚡ Chegou super rápido', '👨‍🔧 Atendimento educado']
  }
];

export const MaintenanceHistory: React.FC = () => {
  const [history, setHistory] = useState<MaintenanceRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selectedReceipt, setSelectedReceipt] = useState<MaintenanceRecord | null>(null);

  // New manual entry modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newServiceType, setNewServiceType] = useState('');
  const [newMechanicName, setNewMechanicName] = useState('');
  const [newVehicleInfo, setNewVehicleInfo] = useState('Fiat Uno Way 2013');
  const [newPrice, setNewPrice] = useState('');
  const [newNotes, setNewNotes] = useState('');

  // Load history from localStorage
  const loadHistory = () => {
    try {
      const saved = localStorage.getItem('maintenanceHistory');
      if (saved) {
        const parsed = JSON.parse(saved);
        setHistory(parsed);
      } else {
        localStorage.setItem('maintenanceHistory', JSON.stringify(MOCK_INITIAL_HISTORY));
        setHistory(MOCK_INITIAL_HISTORY);
      }
    } catch (e) {
      console.error('[MaintenanceHistory] Error loading history:', e);
      setHistory(MOCK_INITIAL_HISTORY);
    }
  };

  useEffect(() => {
    loadHistory();

    // Listen for custom maintenance update events
    const handleUpdate = () => loadHistory();
    window.addEventListener('maintenanceHistoryUpdated', handleUpdate);
    return () => window.removeEventListener('maintenanceHistoryUpdated', handleUpdate);
  }, []);

  const toggleExpand = (id: string) => {
    setExpandedId(prev => (prev === id ? null : id));
  };

  const handleAddManualRecord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newServiceType || !newMechanicName) return;

    const newRecord: MaintenanceRecord = {
      id: `FIX-${Math.floor(1000 + Math.random() * 9000)}`,
      serviceType: newServiceType,
      mechanicName: newMechanicName,
      vehicleInfo: newVehicleInfo || 'Veículo Registrado',
      date: new Date().toLocaleDateString('pt-BR'),
      price: parseFloat(newPrice) || 0,
      paymentMethod: 'PIX',
      status: 'COMPLETED',
      rating: 5,
      notes: newNotes || 'Manutenção registrada manualmente pelo motorista no perfil.',
      receiptId: `REC-${Date.now().toString().slice(-8)}`
    };

    const updated = [newRecord, ...history];
    setHistory(updated);
    localStorage.setItem('maintenanceHistory', JSON.stringify(updated));

    // Reset form
    setNewServiceType('');
    setNewMechanicName('');
    setNewPrice('');
    setNewNotes('');
    setIsAddModalOpen(false);
  };

  // Filtered History List
  const filteredHistory = history.filter(item => {
    const matchesQuery = 
      item.serviceType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.mechanicName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.vehicleInfo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.receiptId && item.receiptId.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesQuery) return false;

    if (selectedCategory === 'EMERGENCY') {
      return item.serviceType.toLowerCase().includes('emergência') || item.serviceType.toLowerCase().includes('socorro') || item.serviceType.toLowerCase().includes('guincho');
    }
    if (selectedCategory === 'MAINTENANCE') {
      return item.serviceType.toLowerCase().includes('manutenção') || item.serviceType.toLowerCase().includes('óleo') || item.serviceType.toLowerCase().includes('correia') || item.serviceType.toLowerCase().includes('filtro');
    }
    if (selectedCategory === 'TIRE') {
      return item.serviceType.toLowerCase().includes('alinhamento') || item.serviceType.toLowerCase().includes('pneu') || item.serviceType.toLowerCase().includes('borracharia');
    }

    return true;
  });

  // Totals calculations
  const totalSpent = history.reduce((acc, curr) => acc + (curr.price || 0), 0);
  const totalServices = history.length;

  return (
    <div className="space-y-6">
      
      {/* Header Banner & Stats Grid */}
      <div className="bg-gradient-to-br from-indigo-900 via-zinc-900 to-slate-900 text-white rounded-3xl p-6 sm:p-7 shadow-xl border border-indigo-500/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold border border-indigo-400/30 mb-2">
              <Wrench size={14} className="text-indigo-400" />
              <span>Prontuário Digital do Veículo</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Histórico de Manutenções
            </h2>
            <p className="text-xs sm:text-sm text-zinc-300 max-w-xl mt-1 leading-relaxed">
              Registro completo e organizado de todos os serviços realizados. Acompanhe custos, comprovantes e garantia das oficinas parceiras.
            </p>
          </div>

          {/* Action Button */}
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="self-start md:self-auto px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl text-xs sm:text-sm flex items-center gap-2 transition-all shadow-lg shadow-indigo-600/30 cursor-pointer"
          >
            <Plus size={16} />
            <span>Registrar Manutenção</span>
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 mt-6 pt-6 border-t border-zinc-800 relative z-10">
          <div className="p-3.5 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10">
            <span className="text-[10px] sm:text-xs font-semibold text-zinc-400 uppercase tracking-wider block">
              Serviços Concluídos
            </span>
            <span className="text-xl sm:text-2xl font-black text-white flex items-center gap-1.5 mt-0.5">
              <CheckCircle2 size={20} className="text-emerald-400" />
              {totalServices} <span className="text-xs text-zinc-400 font-normal">atendimentos</span>
            </span>
          </div>

          <div className="p-3.5 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10">
            <span className="text-[10px] sm:text-xs font-semibold text-zinc-400 uppercase tracking-wider block">
              Total Investido
            </span>
            <span className="text-xl sm:text-2xl font-black text-emerald-400 mt-0.5 block">
              R$ {totalSpent.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>

          <div className="col-span-2 sm:col-span-1 p-3.5 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10">
            <span className="text-[10px] sm:text-xs font-semibold text-zinc-400 uppercase tracking-wider block">
              Garantia do Veículo
            </span>
            <span className="text-xs sm:text-sm font-bold text-indigo-300 flex items-center gap-1.5 mt-1">
              <ShieldCheck size={16} className="text-indigo-400" />
              Ativa via App FIX
            </span>
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white dark:bg-zinc-850 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search Field */}
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por serviço, oficina ou número do comprovante..."
              className="w-full pl-10 pr-4 py-2.5 bg-zinc-50 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-100 rounded-xl border border-zinc-200 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-xs sm:text-sm font-medium"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 text-xs"
              >
                Limpar
              </button>
            )}
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {[
              { id: 'ALL', label: 'Todos' },
              { id: 'MAINTENANCE', label: 'Manutenção' },
              { id: 'EMERGENCY', label: 'Emergência' },
              { id: 'TIRE', label: 'Pneus/Alinhamento' }
            ].map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* History Cards List */}
      {filteredHistory.length > 0 ? (
        <div className="space-y-3.5">
          {filteredHistory.map((record) => {
            const isExpanded = expandedId === record.id;
            const isEmergency = record.serviceType.toLowerCase().includes('emergência') || record.serviceType.toLowerCase().includes('socorro');

            return (
              <div 
                key={record.id}
                className="bg-white dark:bg-zinc-850 rounded-2xl border border-zinc-200/80 dark:border-zinc-700/80 shadow-sm hover:shadow-md transition-all overflow-hidden"
              >
                {/* Main Card Summary Header */}
                <div 
                  onClick={() => toggleExpand(record.id)}
                  className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer hover:bg-zinc-50/60 dark:hover:bg-zinc-800/40 transition-colors"
                >
                  <div className="flex items-start gap-3.5">
                    <div className={`p-3 rounded-2xl flex-shrink-0 ${
                      isEmergency 
                        ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800/50' 
                        : 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-800/50'
                    }`}>
                      <Wrench size={22} />
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[11px] font-extrabold text-zinc-400 dark:text-zinc-500 font-mono">
                          #{record.id}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 flex items-center gap-1">
                          <CheckCircle2 size={10} /> Concluído
                        </span>
                        <span className="text-xs text-zinc-400 dark:text-zinc-500 flex items-center gap-1 ml-auto sm:ml-0">
                          <Calendar size={12} /> {record.date}
                        </span>
                      </div>

                      <h3 className="font-bold text-zinc-900 dark:text-zinc-100 text-sm sm:text-base leading-snug">
                        {record.serviceType}
                      </h3>

                      <div className="flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-400 flex-wrap">
                        <span className="font-semibold text-zinc-800 dark:text-zinc-200 flex items-center gap-1">
                          {record.mechanicName}
                        </span>
                        <VerifiedBadge rating={4.9} size="sm" />
                        <span className="text-zinc-300 dark:text-zinc-700">•</span>
                        <span className="text-zinc-500 dark:text-zinc-400 flex items-center gap-1">
                          <Car size={13} /> {record.vehicleInfo}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Price & Toggle Arrow */}
                  <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 pt-3 sm:pt-0 border-zinc-100 dark:border-zinc-800">
                    <div className="text-left sm:text-right">
                      <span className="text-[10px] uppercase font-bold text-zinc-400 block">Valor Pago</span>
                      <span className="text-base sm:text-lg font-black text-zinc-900 dark:text-zinc-100">
                        R$ {record.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                      <span className="text-[10px] font-medium text-zinc-500 dark:text-zinc-400 block">
                        via {record.paymentMethod}
                      </span>
                    </div>

                    <button 
                      type="button"
                      className="p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 bg-zinc-100 dark:bg-zinc-800 rounded-xl transition-colors cursor-pointer"
                    >
                      {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </button>
                  </div>
                </div>

                {/* Expanded Details Panel */}
                {isExpanded && (
                  <div className="px-4 pb-5 pt-2 sm:px-5 bg-zinc-50/80 dark:bg-zinc-900/50 border-t border-zinc-100 dark:border-zinc-800 animate-fade-in space-y-4">
                    
                    {/* Notes Box */}
                    {record.notes && (
                      <div className="p-3.5 bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200/60 dark:border-zinc-700/60 space-y-1">
                        <span className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block">
                          Detalhamento do Serviço Executado
                        </span>
                        <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed font-normal">
                          {record.notes}
                        </p>
                      </div>
                    )}

                    {/* Tags & Rating */}
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {record.rating && (
                          <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 px-2.5 py-1 rounded-lg text-xs font-bold border border-amber-200 dark:border-amber-800/40">
                            <Star size={13} className="fill-amber-400 text-amber-400" />
                            <span>Avaliado com {record.rating}.0 ★</span>
                          </div>
                        )}

                        {record.tags?.map((tag) => (
                          <span 
                            key={tag} 
                            className="px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-[11px] font-semibold border border-indigo-100 dark:border-indigo-800/40"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>

                      {/* Receipt Action Button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedReceipt(record);
                        }}
                        className="px-3.5 py-1.5 bg-zinc-900 dark:bg-zinc-700 hover:bg-zinc-800 dark:hover:bg-zinc-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Receipt size={14} />
                        <span>Ver Comprovante Digital</span>
                      </button>
                    </div>

                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <div className="text-center py-12 px-4 bg-white dark:bg-zinc-850 rounded-3xl border border-zinc-200/80 dark:border-zinc-800 space-y-3">
          <div className="w-14 h-14 bg-zinc-100 dark:bg-zinc-800 text-zinc-400 rounded-full flex items-center justify-center mx-auto">
            <Wrench size={28} />
          </div>
          <h3 className="text-base font-bold text-zinc-800 dark:text-zinc-200">
            Nenhuma manutenção encontrada
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto">
            Tente mudar o termo de busca ou escolha outra categoria de filtro acima.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('ALL');
            }}
            className="px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl hover:bg-indigo-700 transition-colors cursor-pointer"
          >
            Limpar Filtros
          </button>
        </div>
      )}

      {/* MODAL 1: Digital Receipt Modal */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-zinc-900 w-full max-w-md rounded-3xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden animate-pop-in relative">
            
            {/* Header */}
            <div className="bg-zinc-900 text-white p-5 flex items-center justify-between border-b border-zinc-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-indigo-600 rounded-xl text-white">
                  <Receipt size={20} />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-white">Comprovante Digital FIX</h3>
                  <p className="text-[10px] text-zinc-400">ID: {selectedReceipt.receiptId || selectedReceipt.id}</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedReceipt(null)}
                className="p-1.5 text-zinc-400 hover:text-white rounded-full transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Receipt Body */}
            <div className="p-6 space-y-4 text-xs">
              <div className="border-b border-dashed border-zinc-200 dark:border-zinc-800 pb-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-zinc-500 font-semibold">Oficina Prestadora:</span>
                  <span className="font-bold text-zinc-800 dark:text-zinc-100">{selectedReceipt.mechanicName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500 font-semibold">Veículo Atendido:</span>
                  <span className="font-bold text-zinc-800 dark:text-zinc-100">{selectedReceipt.vehicleInfo}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500 font-semibold">Data da Conclusão:</span>
                  <span className="font-bold text-zinc-800 dark:text-zinc-100">{selectedReceipt.date}</span>
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-zinc-500 font-semibold uppercase text-[10px] tracking-wider block">
                  Descrição dos Serviços / Peças
                </span>
                <p className="p-3 bg-zinc-50 dark:bg-zinc-800/60 rounded-xl text-zinc-700 dark:text-zinc-300 font-medium leading-relaxed">
                  {selectedReceipt.serviceType}
                </p>
              </div>

              <div className="bg-emerald-50 dark:bg-emerald-950/40 p-3.5 rounded-2xl border border-emerald-200 dark:border-emerald-800/40 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase text-emerald-800 dark:text-emerald-300 block">
                    Pagamento Aprovado
                  </span>
                  <span className="text-xs text-emerald-600 dark:text-emerald-400">
                    Forma: {selectedReceipt.paymentMethod}
                  </span>
                </div>
                <span className="text-lg font-black text-emerald-700 dark:text-emerald-300">
                  R$ {selectedReceipt.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>

              <div className="text-[11px] text-zinc-400 text-center pt-2">
                <ShieldCheck size={16} className="inline text-indigo-500 mr-1" />
                Documento verificado e autenticado pela Plataforma FIX.
              </div>
            </div>

            {/* Modal Actions */}
            <div className="p-4 bg-zinc-50 dark:bg-zinc-850 border-t border-zinc-200 dark:border-zinc-800 flex gap-2">
              <button
                onClick={() => {
                  window.print();
                }}
                className="flex-1 py-2.5 bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Printer size={14} /> Imprimir / PDF
              </button>
              <button
                onClick={() => setSelectedReceipt(null)}
                className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer"
              >
                Fechar
              </button>
            </div>

          </div>
        </div>
      )}

      {/* MODAL 2: Manual Registration Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-zinc-900 w-full max-w-lg rounded-3xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden animate-pop-in relative">
            
            <div className="bg-indigo-600 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Wrench size={20} />
                <h3 className="font-extrabold text-base">Registrar Manutenção Externa</h3>
              </div>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 text-white/80 hover:text-white rounded-full transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddManualRecord} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  Tipo de Serviço / Peça *
                </label>
                <input
                  type="text"
                  required
                  value={newServiceType}
                  onChange={(e) => setNewServiceType(e.target.value)}
                  placeholder="Ex: Troca de pastilhas de freio dianteiras"
                  className="w-full p-3 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 rounded-xl border border-zinc-200 dark:border-zinc-700 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  Nome da Oficina ou Mecânico *
                </label>
                <input
                  type="text"
                  required
                  value={newMechanicName}
                  onChange={(e) => setNewMechanicName(e.target.value)}
                  placeholder="Ex: Auto Center Express"
                  className="w-full p-3 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 rounded-xl border border-zinc-200 dark:border-zinc-700 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                    Veículo
                  </label>
                  <input
                    type="text"
                    value={newVehicleInfo}
                    onChange={(e) => setNewVehicleInfo(e.target.value)}
                    placeholder="Ex: Fiat Uno 2013"
                    className="w-full p-3 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 rounded-xl border border-zinc-200 dark:border-zinc-700 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                    Valor Total (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    placeholder="180.00"
                    className="w-full p-3 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 rounded-xl border border-zinc-200 dark:border-zinc-700 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  Observações / Peças Utilizadas
                </label>
                <textarea
                  rows={2}
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="Ex: Marca das pastilhas Cobreq. KM do carro: 85.000"
                  className="w-full p-3 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 rounded-xl border border-zinc-200 dark:border-zinc-700 focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none"
                />
              </div>

              <div className="pt-3 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 py-3 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 text-zinc-700 dark:text-zinc-300 font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-colors shadow-lg shadow-indigo-600/30 cursor-pointer"
                >
                  Salvar Registro
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};
