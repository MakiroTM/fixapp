import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { User as UserIcon, MapPin, Phone, Mail, Car, Store, Save, ArrowLeft, Building } from 'lucide-react';

interface UserProfileProps {
  user: User;
  onSave: (updatedUser: User) => void;
  onBack: () => void;
}

export const UserProfile: React.FC<UserProfileProps> = ({ user, onSave, onBack }) => {
  const [formData, setFormData] = useState<User>(user);
  const [isSaved, setIsSaved] = useState(false);

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
    <div className="max-w-4xl mx-auto px-4 py-8 animate-fade-in-up">
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium mb-6 transition-colors"
      >
        <ArrowLeft size={20} />
        Voltar para o Início
      </button>

      <div className="bg-white dark:bg-zinc-800 rounded-3xl shadow-xl shadow-zinc-200/50 dark:shadow-none border border-zinc-100 dark:border-zinc-700 overflow-hidden transition-colors duration-300">
        
        {/* Profile Header */}
        <div className="bg-slate-800 dark:bg-zinc-900 p-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500 opacity-20 rounded-full -mr-16 -mt-16 blur-3xl"></div>
          
          <div className="relative z-10 flex items-center gap-6">
            <div className="w-24 h-24 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border-4 border-white/20 text-white shadow-lg">
              {formData.role === 'MECHANIC' ? <Store size={40} /> : <UserIcon size={40} />}
            </div>
            <div>
              <h2 className="text-3xl font-bold mb-1">{formData.name}</h2>
              <p className="text-slate-300 dark:text-zinc-400 flex items-center gap-2">
                {formData.role === 'MECHANIC' ? 'Parceiro FIX' : 'Cliente FIX'}
                <span className="bg-white/20 px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider">
                  {formData.role === 'MECHANIC' ? 'Oficina' : 'Motorista'}
                </span>
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Seção 1: Dados Pessoais */}
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-zinc-800 dark:text-zinc-100 border-b border-zinc-100 dark:border-zinc-700 pb-2 flex items-center gap-2">
                <UserIcon size={18} className="text-indigo-600 dark:text-indigo-400" />
                Informações Pessoais
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Nome Completo</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-600 bg-zinc-50 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-100 focus:bg-white dark:focus:bg-zinc-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">E-mail</label>
                  <div className="relative">
                    <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-600 bg-zinc-50 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-100 focus:bg-white dark:focus:bg-zinc-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Telefone / WhatsApp</label>
                  <div className="relative">
                    <Phone size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                    <input
                      type="tel"
                      placeholder="(00) 00000-0000"
                      value={formData.phone || ''}
                      onChange={(e) => handleChange('phone', e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-600 bg-zinc-50 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-100 focus:bg-white dark:focus:bg-zinc-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Seção 2: Localização */}
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-zinc-800 dark:text-zinc-100 border-b border-zinc-100 dark:border-zinc-700 pb-2 flex items-center gap-2">
                <MapPin size={18} className="text-indigo-600 dark:text-indigo-400" />
                Endereço
              </h3>

              <div className="space-y-4">
                 <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Endereço Completo</label>
                  <input
                    type="text"
                    placeholder="Rua, Número, Bairro"
                    value={formData.address || ''}
                    onChange={(e) => handleChange('address', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-600 bg-zinc-50 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-100 focus:bg-white dark:focus:bg-zinc-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Cidade</label>
                    <input
                      type="text"
                      value={formData.city || ''}
                      onChange={(e) => handleChange('city', e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-600 bg-zinc-50 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-100 focus:bg-white dark:focus:bg-zinc-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Estado</label>
                    <input
                      type="text"
                      placeholder="UF"
                      value={formData.state || ''}
                      onChange={(e) => handleChange('state', e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-600 bg-zinc-50 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-100 focus:bg-white dark:focus:bg-zinc-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Seção 3: Específica por Role */}
            <div className="md:col-span-2 space-y-6 pt-4 border-t border-zinc-100 dark:border-zinc-700">
              <h3 className="text-lg font-bold text-zinc-800 dark:text-zinc-100 border-b border-zinc-100 dark:border-zinc-700 pb-2 flex items-center gap-2">
                {formData.role === 'MECHANIC' ? <Building size={18} className="text-indigo-600 dark:text-indigo-400" /> : <Car size={18} className="text-indigo-600 dark:text-indigo-400" />}
                {formData.role === 'MECHANIC' ? 'Dados da Oficina' : 'Meu Veículo Principal'}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {formData.role === 'MECHANIC' ? (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Nome da Oficina</label>
                      <input
                        type="text"
                        value={formData.shopName || ''}
                        onChange={(e) => handleChange('shopName', e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-600 bg-zinc-50 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-100 focus:bg-white dark:focus:bg-zinc-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Descrição Curta</label>
                      <input
                        type="text"
                        placeholder="Ex: Especializado em injeção eletrônica"
                        value={formData.description || ''}
                        onChange={(e) => handleChange('description', e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-600 bg-zinc-50 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-100 focus:bg-white dark:focus:bg-zinc-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
                      />
                    </div>
                  </>
                ) : (
                   <>
                    <div>
                      <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Modelo do Veículo</label>
                      <input
                        type="text"
                        placeholder="Ex: Fiat Uno Way 2013"
                        value={formData.vehicleModel || ''}
                        onChange={(e) => handleChange('vehicleModel', e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-600 bg-zinc-50 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-100 focus:bg-white dark:focus:bg-zinc-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Placa (Opcional)</label>
                      <input
                        type="text"
                        placeholder="ABC-1234"
                        value={formData.vehiclePlate || ''}
                        onChange={(e) => handleChange('vehiclePlate', e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-600 bg-zinc-50 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-100 focus:bg-white dark:focus:bg-zinc-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
                      />
                    </div>
                  </>
                )}
              </div>
            </div>

          </div>

          <div className="mt-10 flex items-center justify-end gap-4">
             {isSaved && (
               <span className="text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1 animate-fade-in">
                 <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                 Alterações salvas com sucesso!
               </span>
             )}
            <button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-xl flex items-center gap-2 transition-all hover:shadow-lg shadow-indigo-500/30"
            >
              <Save size={20} />
              Salvar Perfil
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};