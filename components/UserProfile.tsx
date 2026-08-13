import React, { useState } from 'react';
import { User } from '../types';
import { User as UserIcon, MapPin, Phone, Mail, Car, Store, Save, ArrowLeft, Building, ShieldCheck, History, CheckCircle2, Wrench, Sparkles, CreditCard, Award } from 'lucide-react';
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
    <div className="max-w-6xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 pb-28 sm:pb-12 animate-fade-in space-y-4 sm:space-y-6">
      
      {/* Top Navigation Back Header */}
      <div className="flex items-center justify-between">
        <button 
          onClick={onBack}
          className="inline-flex items-center gap-2 px-3.5 py-2 bg-white dark:bg-zinc-850 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-semibold rounded-2xl border border-zinc-200 dark:border-zinc-700/80 shadow-xs transition-all text-xs sm:text-sm cursor-pointer"
        >
          <ArrowLeft size={16} />
          <span>Voltar ao Início</span>
        </button>

        <span className="text-xs font-semibold px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/60 hidden sm:inline-flex items-center gap-1.5">
          <ShieldCheck size={14} />
          Conta Verificada
        </span>
      </div>

      {/* Main Profile Shell */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl shadow-xl shadow-zinc-200/50 dark:shadow-black/40 border border-zinc-200 dark:border-zinc-800 overflow-hidden transition-colors duration-300">
        
        {/* Profile Header Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-zinc-900 p-5 sm:p-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/3 w-60 h-60 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

          {/* User Info Container */}
          <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start justify-between gap-6 text-center md:text-left">
            
            <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
              {/* Avatar Box */}
              <div className="relative shrink-0">
                <div className="w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28 bg-zinc-800/80 border-4 border-white/20 rounded-3xl flex items-center justify-center text-white shadow-2xl shadow-indigo-950/50 overflow-hidden">
                  {formData.role === 'MECHANIC' ? (
                    <Store size={36} className="text-indigo-400 sm:w-12 sm:h-12" />
                  ) : (
                    <UserIcon size={36} className="text-indigo-400 sm:w-12 sm:h-12" />
                  )}
                </div>
                <span className="absolute -bottom-1 -right-1 w-7 h-7 bg-emerald-500 border-2 border-zinc-900 rounded-2xl flex items-center justify-center text-white shadow-md" title="Conta Ativa">
                  <CheckCircle2 size={16} />
                </span>
              </div>

              {/* Name & Role Details */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 flex-wrap justify-center sm:justify-start">
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-white tracking-tight">
                    {formData.name}
                  </h1>
                  {formData.role === 'MECHANIC' && (
                    <VerifiedBadge rating={formData.rating || 4.8} size="md" />
                  )}
                </div>

                <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap text-xs sm:text-sm text-zinc-300">
                  <span className="flex items-center gap-1 font-medium text-indigo-300">
                    <Mail size={14} />
                    {formData.email}
                  </span>
                  <span className="text-zinc-600 hidden sm:inline">•</span>
                  <span className="bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider">
                    {formData.role === 'MECHANIC' ? 'Parceiro Credenciado' : 'Motorista FIX'}
                  </span>
                </div>

                <p className="text-xs text-zinc-400 flex items-center justify-center sm:justify-start gap-1 pt-0.5">
                  <MapPin size={13} className="text-indigo-400 shrink-0" />
                  <span>{formData.city ? `${formData.city}, ${formData.state || 'BR'}` : 'São Paulo, SP'}</span>
                </p>
              </div>
            </div>

            {/* Quick Stats Cards for PC / Desktop */}
            <div className="w-full md:w-auto grid grid-cols-2 sm:grid-cols-3 md:flex items-center gap-2.5 sm:gap-3 pt-2 md:pt-0">
              <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-3 text-center md:min-w-[120px]">
                <span className="text-[10px] uppercase font-bold text-zinc-300 block">Veículo</span>
                <span className="text-xs sm:text-sm font-extrabold text-white truncate block mt-0.5">
                  {formData.vehicleModel ? formData.vehicleModel.split(' ')[0] : 'Cadastrado'}
                </span>
              </div>

              <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-3 text-center md:min-w-[120px]">
                <span className="text-[10px] uppercase font-bold text-zinc-300 block">Plano</span>
                <span className="text-xs sm:text-sm font-extrabold text-emerald-400 block mt-0.5 flex items-center justify-center gap-1">
                  <Award size={14} />
                  Gratuito
                </span>
              </div>

              <div className="col-span-2 sm:col-span-1 bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-3 text-center md:min-w-[120px]">
                <span className="text-[10px] uppercase font-bold text-zinc-300 block">Status</span>
                <span className="text-xs sm:text-sm font-extrabold text-indigo-300 block mt-0.5">
                  100% Protegido
                </span>
              </div>
            </div>

          </div>

          {/* Navigation Tabs Header */}
          <div className="mt-6 pt-4 border-t border-white/10 flex items-center gap-2 overflow-x-auto no-scrollbar relative z-10">
            <button
              type="button"
              onClick={() => setActiveTab('HISTORY')}
              className={`flex-1 sm:flex-none px-4 sm:px-6 py-2.5 rounded-2xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'HISTORY'
                  ? 'bg-white text-zinc-900 shadow-lg shadow-white/10 scale-[1.02]'
                  : 'bg-white/10 text-white/80 hover:bg-white/20 hover:text-white'
              }`}
            >
              <History size={16} />
              <span>Histórico de Manutenções</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('DATA')}
              className={`flex-1 sm:flex-none px-4 sm:px-6 py-2.5 rounded-2xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'DATA'
                  ? 'bg-white text-zinc-900 shadow-lg shadow-white/10 scale-[1.02]'
                  : 'bg-white/10 text-white/80 hover:bg-white/20 hover:text-white'
              }`}
            >
              <UserIcon size={16} />
              <span>Dados da Conta e Veículo</span>
            </button>
          </div>

        </div>

        {/* Tab Content Rendering */}
        {activeTab === 'HISTORY' ? (
          <div className="p-4 sm:p-6 lg:p-8">
            <MaintenanceHistory />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8">
            
            {/* Form Sections Grid (Responsive 1-col mobile, 2-col tablet, 3-col PC) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8">
              
              {/* Card 1: Informações Pessoais */}
              <div className="bg-zinc-50 dark:bg-zinc-850/60 p-5 sm:p-6 rounded-3xl border border-zinc-200/80 dark:border-zinc-800 space-y-4 shadow-xs">
                <h2 className="text-sm sm:text-base font-extrabold text-zinc-900 dark:text-zinc-100 pb-2 border-b border-zinc-200 dark:border-zinc-700/80 flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                    <UserIcon size={18} />
                  </div>
                  <span>Dados Pessoais</span>
                </h2>

                <div className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">Nome Completo</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => handleChange('name', e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all text-xs sm:text-sm font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">E-mail de Acesso</label>
                    <div className="relative">
                      <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => handleChange('email', e.target.value)}
                        className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all text-xs sm:text-sm font-medium"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">Telefone / WhatsApp</label>
                    <div className="relative">
                      <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                      <input
                        type="tel"
                        placeholder="(11) 99999-8888"
                        value={formData.phone || ''}
                        onChange={(e) => handleChange('phone', e.target.value)}
                        className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all text-xs sm:text-sm font-medium"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 2: Endereço & Localização */}
              <div className="bg-zinc-50 dark:bg-zinc-850/60 p-5 sm:p-6 rounded-3xl border border-zinc-200/80 dark:border-zinc-800 space-y-4 shadow-xs">
                <h2 className="text-sm sm:text-base font-extrabold text-zinc-900 dark:text-zinc-100 pb-2 border-b border-zinc-200 dark:border-zinc-700/80 flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                    <MapPin size={18} />
                  </div>
                  <span>Endereço Principal</span>
                </h2>

                <div className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">Rua, Número e Bairro</label>
                    <input
                      type="text"
                      placeholder="Ex: Av. Paulista, 1000 - Bela Vista"
                      value={formData.address || ''}
                      onChange={(e) => handleChange('address', e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all text-xs sm:text-sm font-medium"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">Cidade</label>
                      <input
                        type="text"
                        placeholder="Ex: São Paulo"
                        value={formData.city || ''}
                        onChange={(e) => handleChange('city', e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all text-xs sm:text-sm font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">Estado (UF)</label>
                      <input
                        type="text"
                        placeholder="SP"
                        maxLength={2}
                        value={formData.state || ''}
                        onChange={(e) => handleChange('state', e.target.value.toUpperCase())}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all text-xs sm:text-sm font-medium uppercase"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 3: Dados do Veículo / Oficina */}
              <div className="bg-zinc-50 dark:bg-zinc-850/60 p-5 sm:p-6 rounded-3xl border border-zinc-200/80 dark:border-zinc-800 space-y-4 shadow-xs lg:col-span-2 xl:col-span-1">
                <h2 className="text-sm sm:text-base font-extrabold text-zinc-900 dark:text-zinc-100 pb-2 border-b border-zinc-200 dark:border-zinc-700/80 flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                    {formData.role === 'MECHANIC' ? <Building size={18} /> : <Car size={18} />}
                  </div>
                  <span>{formData.role === 'MECHANIC' ? 'Dados da Oficina' : 'Veículo Cadastrado'}</span>
                </h2>

                <div className="space-y-3.5">
                  {formData.role === 'MECHANIC' ? (
                    <>
                      <div>
                        <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">Nome Comercial da Oficina</label>
                        <input
                          type="text"
                          value={formData.shopName || ''}
                          onChange={(e) => handleChange('shopName', e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all text-xs sm:text-sm font-medium"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">Especialidades & Serviços</label>
                        <input
                          type="text"
                          placeholder="Ex: Mecânica geral, freios e suspensão"
                          value={formData.description || ''}
                          onChange={(e) => handleChange('description', e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all text-xs sm:text-sm font-medium"
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">Modelo do Veículo</label>
                        <input
                          type="text"
                          placeholder="Ex: Fiat Uno Way 1.0 2013"
                          value={formData.vehicleModel || ''}
                          onChange={(e) => handleChange('vehicleModel', e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all text-xs sm:text-sm font-medium"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">Placa (Opcional)</label>
                        <input
                          type="text"
                          placeholder="ABC-1234 ou ABC1D23"
                          value={formData.vehiclePlate || ''}
                          onChange={(e) => handleChange('vehiclePlate', e.target.value.toUpperCase())}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all text-xs sm:text-sm font-medium uppercase"
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>

            </div>

            {/* Submit Action Bar */}
            <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
                <ShieldCheck size={16} className="text-emerald-500 shrink-0" />
                <span>Seus dados estão protegidos com criptografia no app FIX.</span>
              </div>

              <div className="w-full sm:w-auto flex flex-col sm:flex-row items-center gap-3">
                {isSaved && (
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1.5 animate-fade-in text-xs sm:text-sm">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping"></span>
                    Alterações salvas com sucesso!
                  </span>
                )}

                <button
                  type="submit"
                  className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold py-3 px-8 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-600/30 text-xs sm:text-sm cursor-pointer"
                >
                  <Save size={18} />
                  <span>Salvar Alterações</span>
                </button>
              </div>
            </div>

          </form>
        )}

      </div>
    </div>
  );
};

