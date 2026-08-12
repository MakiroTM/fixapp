import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { User as UserIcon, MapPin, Phone, Mail, Car, Store, Save, ArrowLeft, Building, Wrench, ShieldCheck, History } from 'lucide-react';
import { VerifiedBadge } from './VerifiedBadge';
import { MaintenanceHistory } from './MaintenanceHistory';

interface UserProfileProps {
  user: User;
  onSave: (updatedUser: User) => void;
  onBack: () => void;
}

export const UserProfile: React.FC<UserProfileProps> = ({ user, onSave, onBack }) => {
  const [formData, setFormData] = useState<User>(user);
  const [isSaved, setIsSaved] = useState(false);
  const [activeTab, setActiveTab] = useState<'HISTORY' | 'DATA'>('HISTORY');

  const handleChange = (field: keyof User, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setIsSaved(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-4 py-6 sm:py-8 animate-fade-in-up space-y-6">
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium transition-colors text-sm sm:text-base cursor-pointer"
      >
        <ArrowLeft size={18} className="sm:w-5 sm:h-5" />
        Voltar para o Início
      </button>

      <div className="bg-white dark:bg-zinc-800 rounded-2xl sm:rounded-3xl shadow-xl shadow-zinc-200/50 dark:shadow-none border border-zinc-100 dark:border-zinc-700 overflow-hidden transition-colors duration-300">
        
        {/* Profile Header */}
        <div className="bg-slate-800 dark:bg-zinc-900 p-6 sm:p-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500 opacity-20 rounded-full -mr-16 -mt-16 blur-3xl"></div>
          
          <div className="relative z-10 flex flex-col sm:flex-row items-center gap-4 sm:gap-6 text-center sm:text-left">
            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border-4 border-white/20 text-white shadow-lg">
              {formData.role === 'MECHANIC' ? <Store size={32} className="sm:w-10 sm:h-10" /> : <UserIcon size={32} className="sm:w-10 sm:h-10" />}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap justify-center sm:justify-start mb-1">
                <h2 className="text-2xl sm:text-3xl font-bold">{formData.name}</h2>
                {formData.role === 'MECHANIC' && (
                  <VerifiedBadge rating={formData.rating || 4.8} size="md" />
                )}
              </div>
              <p className="text-slate-300 dark:text-zinc-400 flex items-center justify-center sm:justify-start gap-2 text-sm sm:text-base">
                {formData.role === 'MECHANIC' ? 'Parceiro FIX' : 'Cliente FIX'}
                <span className="bg-white/20 px-2 py-0.5 rounded text-[10px] sm:text-xs font-bold uppercase tracking-wider">
                  {formData.role === 'MECHANIC' ? 'Oficina' : 'Motorista'}
                </span>
              </p>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="mt-6 pt-4 border-t border-white/10 flex items-center gap-2 overflow-x-auto relative z-10">
            <button
              type="button"
              onClick={() => setActiveTab('HISTORY')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === 'HISTORY'
                  ? 'bg-white text-zinc-900 shadow-md'
                  : 'bg-white/10 text-white/80 hover:bg-white/20'
              }`}
            >
              <History size={16} />
              Histórico de Manutenções
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('DATA')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === 'DATA'
                  ? 'bg-white text-zinc-900 shadow-md'
                  : 'bg-white/10 text-white/80 hover:bg-white/20'
              }`}
            >
              <UserIcon size={16} />
              Dados da Conta & Veículo
            </button>
          </div>
        </div>

        {activeTab === 'HISTORY' ? (
          <div className="p-5 sm:p-8">
            <MaintenanceHistory />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 sm:p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
              
              {/* Seção 1: Dados Pessoais */}
              <div className="space-y-4 sm:space-y-6">
                <h3 className="text-base sm:text-lg font-bold text-zinc-800 dark:text-zinc-100 border-b border-zinc-100 dark:border-zinc-700 pb-2 flex items-center gap-2">
                  <UserIcon size={16} className="text-indigo-600 dark:text-indigo-400 sm:w-[18px] sm:h-[18px]" />
                  Informações Pessoais
                </h3>

                <div className="space-y-3 sm:space-y-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Nome Completo</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => handleChange('name', e.target.value)}
                      className="w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-600 bg-zinc-50 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-100 focus:bg-white dark:focus:bg-zinc-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">E-mail</label>
                    <div className="relative">
                      <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 sm:w-[18px] sm:h-[18px]" />
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => handleChange('email', e.target.value)}
                        className="w-full pl-9 sm:pl-10 pr-4 py-2 sm:py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-600 bg-zinc-50 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-100 focus:bg-white dark:focus:bg-zinc-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Telefone / WhatsApp</label>
                    <div className="relative">
                      <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 sm:w-[18px] sm:h-[18px]" />
                      <input
                        type="tel"
                        placeholder="(00) 00000-0000"
                        value={formData.phone || ''}
                        onChange={(e) => handleChange('phone', e.target.value)}
                        className="w-full pl-9 sm:pl-10 pr-4 py-2 sm:py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-600 bg-zinc-50 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-100 focus:bg-white dark:focus:bg-zinc-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all text-sm"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Seção 2: Localização */}
              <div className="space-y-4 sm:space-y-6">
                <h3 className="text-base sm:text-lg font-bold text-zinc-800 dark:text-zinc-100 border-b border-zinc-100 dark:border-zinc-700 pb-2 flex items-center gap-2">
                  <MapPin size={16} className="text-indigo-600 dark:text-indigo-400 sm:w-[18px] sm:h-[18px]" />
                  Endereço
                </h3>

                <div className="space-y-3 sm:space-y-4">
                   <div>
                    <label className="block text-xs sm:text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Endereço Completo</label>
                    <input
                      type="text"
                      placeholder="Rua, Número, Bairro"
                      value={formData.address || ''}
                      onChange={(e) => handleChange('address', e.target.value)}
                      className="w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-600 bg-zinc-50 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-100 focus:bg-white dark:focus:bg-zinc-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all text-sm"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Cidade</label>
                      <input
                        type="text"
                        value={formData.city || ''}
                        onChange={(e) => handleChange('city', e.target.value)}
                        className="w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-600 bg-zinc-50 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-100 focus:bg-white dark:focus:bg-zinc-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Estado</label>
                      <input
                        type="text"
                        placeholder="UF"
                        value={formData.state || ''}
                        onChange={(e) => handleChange('state', e.target.value)}
                        className="w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-600 bg-zinc-50 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-100 focus:bg-white dark:focus:bg-zinc-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all text-sm"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Seção 3: Específica por Role */}
              <div className="md:col-span-2 space-y-4 sm:space-y-6 pt-4 border-t border-zinc-100 dark:border-zinc-700">
                <h3 className="text-base sm:text-lg font-bold text-zinc-800 dark:text-zinc-100 border-b border-zinc-100 dark:border-zinc-700 pb-2 flex items-center gap-2">
                  {formData.role === 'MECHANIC' ? <Building size={16} className="text-indigo-600 dark:text-indigo-400 sm:w-[18px] sm:h-[18px]" /> : <Car size={16} className="text-indigo-600 dark:text-indigo-400 sm:w-[18px] sm:h-[18px]" />}
                  {formData.role === 'MECHANIC' ? 'Dados da Oficina' : 'Meu Veículo Principal'}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8">
                  {formData.role === 'MECHANIC' ? (
                    <>
                      <div>
                        <label className="block text-xs sm:text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Nome da Oficina</label>
                        <input
                          type="text"
                          value={formData.shopName || ''}
                          onChange={(e) => handleChange('shopName', e.target.value)}
                          className="w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-600 bg-zinc-50 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-100 focus:bg-white dark:focus:bg-zinc-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs sm:text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Descrição Curta</label>
                        <input
                          type="text"
                          placeholder="Ex: Especializado em injeção eletrônica"
                          value={formData.description || ''}
                          onChange={(e) => handleChange('description', e.target.value)}
                          className="w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-600 bg-zinc-50 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-100 focus:bg-white dark:focus:bg-zinc-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all text-sm"
                        />
                      </div>
                    </>
                  ) : (
                     <>
                      <div>
                        <label className="block text-xs sm:text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Modelo do Veículo</label>
                        <input
                          type="text"
                          placeholder="Ex: Fiat Uno Way 2013"
                          value={formData.vehicleModel || ''}
                          onChange={(e) => handleChange('vehicleModel', e.target.value)}
                          className="w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-600 bg-zinc-50 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-100 focus:bg-white dark:focus:bg-zinc-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs sm:text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Placa (Opcional)</label>
                        <input
                          type="text"
                          placeholder="ABC-1234"
                          value={formData.vehiclePlate || ''}
                          onChange={(e) => handleChange('vehiclePlate', e.target.value)}
                          className="w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-600 bg-zinc-50 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-100 focus:bg-white dark:focus:bg-zinc-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all text-sm"
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>

            </div>

            <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-end gap-3 sm:gap-4">
               {isSaved && (
                 <span className="text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1 animate-fade-in text-sm">
                   <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                   Alterações salvas com sucesso!
                 </span>
               )}
              <button
                type="submit"
                className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-xl flex items-center justify-center gap-2 transition-all hover:shadow-lg shadow-indigo-500/30 text-sm sm:text-base cursor-pointer"
              >
                <Save size={18} className="sm:w-5 sm:h-5" />
                Salvar Perfil
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
