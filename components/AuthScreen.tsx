import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { 
  Car, 
  Wrench, 
  Mail, 
  KeyRound,
  Eye,
  EyeOff,
  UserPlus, 
  LogIn
} from 'lucide-react';

interface AuthScreenProps {
  onLogin: (user: User) => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onLogin }) => {
  const [authMode, setAuthMode] = useState<'LOGIN' | 'REGISTER'>('LOGIN');
  const [selectedRole, setSelectedRole] = useState<UserRole>('CLIENT');
  
  // Form States
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [shopName, setShopName] = useState(''); 
  const [showPassword, setShowPassword] = useState<boolean>(false);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const mockUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      name: name || (email ? email.split('@')[0] : (selectedRole === 'CLIENT' ? 'Motorista FIX' : 'Mecânico Socorrista')),
      email: email || 'usuario@fixapp.com',
      role: selectedRole,
      plan: 'FREE',
      shopName: selectedRole === 'MECHANIC' ? (shopName || 'Oficina Mecânica Especializada') : undefined,
      rating: 4.9
    };
    onLogin(mockUser);
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center p-4 transition-colors duration-300">
      <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-3xl shadow-xl shadow-indigo-500/5 dark:shadow-none border border-zinc-200 dark:border-zinc-800 overflow-hidden flex flex-col transition-all duration-300">
        
        {/* Role Tabs */}
        <div className="flex border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/50">
          <button 
            type="button"
            onClick={() => setSelectedRole('CLIENT')}
            className={`flex-1 py-4 px-4 text-sm font-bold flex items-center justify-center gap-2 transition-all ${
              selectedRole === 'CLIENT' 
                ? 'bg-white dark:bg-zinc-900 text-indigo-600 border-b-2 border-indigo-600' 
                : 'text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300 border-b-2 border-transparent'
            }`}
          >
            <Car size={18} />
            Sou Motorista
          </button>

          <button 
            type="button"
            onClick={() => setSelectedRole('MECHANIC')}
            className={`flex-1 py-4 px-4 text-sm font-bold flex items-center justify-center gap-2 transition-all ${
              selectedRole === 'MECHANIC' 
                ? 'bg-white dark:bg-zinc-900 text-rose-600 border-b-2 border-rose-600' 
                : 'text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300 border-b-2 border-transparent'
            }`}
          >
            <Wrench size={18} />
            Sou Mecânico
          </button>
        </div>

        <div className="p-6 sm:p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-black text-zinc-900 dark:text-white">
              {authMode === 'LOGIN' ? 'Acesse sua conta' : 'Crie sua conta'}
            </h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2">
              {selectedRole === 'CLIENT' 
                ? 'Encontre socorro automotivo rápido e seguro.'
                : 'Conecte-se a motoristas e receba chamados.'}
            </p>
          </div>

          {/* Auth Mode Tabs */}
          <div className="flex bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl mb-6">
            <button
              type="button"
              onClick={() => setAuthMode('LOGIN')}
              className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${
                authMode === 'LOGIN'
                  ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm'
                  : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300'
              }`}
            >
              Entrar
            </button>
            <button
              type="button"
              onClick={() => setAuthMode('REGISTER')}
              className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${
                authMode === 'REGISTER'
                  ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm'
                  : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300'
              }`}
            >
              Cadastrar
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {authMode === 'REGISTER' && (
              <div className="animate-fade-in">
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                  Nome Completo
                </label>
                <input 
                  type="text" 
                  required 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  placeholder="Seu nome"
                />
              </div>
            )}

            {authMode === 'REGISTER' && selectedRole === 'MECHANIC' && (
              <div className="animate-fade-in">
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                  Nome da Oficina (Opcional)
                </label>
                <input 
                  type="text" 
                  value={shopName}
                  onChange={(e) => setShopName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all"
                  placeholder="Ex: Auto Center SP"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                E-mail
              </label>
              <div className="relative">
                <input 
                  type="email" 
                  required 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  placeholder="seu@email.com"
                />
                <Mail size={18} className="absolute left-3 top-3.5 text-zinc-400" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                Senha
              </label>
              <div className="relative">
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  required 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  placeholder="••••••••"
                />
                <KeyRound size={18} className="absolute left-3 top-3.5 text-zinc-400" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className={`w-full font-bold py-3.5 px-6 rounded-xl shadow-md flex items-center justify-center gap-2 transition-all mt-6 ${
                selectedRole === 'CLIENT'
                  ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/30'
                  : 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/30'
              }`}
            >
              {authMode === 'LOGIN' ? (
                <>
                  <LogIn size={18} />
                  Entrar
                </>
              ) : (
                <>
                  <UserPlus size={18} />
                  Criar Conta
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
