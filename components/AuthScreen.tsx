import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { Wrench, Car, Store, ArrowRight, Check } from 'lucide-react';

interface AuthScreenProps {
  onLogin: (user: User) => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [selectedRole, setSelectedRole] = useState<UserRole>('CLIENT');
  
  // Form States
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [shopName, setShopName] = useState(''); // Only for mechanic

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulating authentication
    const mockUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      name: name || (selectedRole === 'CLIENT' ? 'Cliente Exemplo' : 'Mecânico Exemplo'),
      email: email || 'user@example.com',
      role: selectedRole,
      plan: 'FREE', // Padrão Grátis
      shopName: selectedRole === 'MECHANIC' ? (shopName || 'Oficina Mecânica Top') : undefined,
      rating: 4.8
    };
    onLogin(mockUser);
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center p-4 transition-colors duration-300">
      <div className="w-full max-w-4xl bg-white dark:bg-zinc-800 rounded-3xl shadow-xl shadow-zinc-200/50 dark:shadow-none overflow-hidden flex flex-col md:flex-row min-h-[600px] border border-zinc-100 dark:border-zinc-700">
        
        {/* Left Side - Hero / Image */}
        <div className={`md:w-1/2 p-8 text-white flex flex-col justify-between relative overflow-hidden transition-colors duration-500 ${selectedRole === 'CLIENT' ? 'bg-indigo-600' : 'bg-slate-800 dark:bg-zinc-900'}`}>
           <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full -mr-20 -mt-20 blur-3xl"></div>
           <div className="absolute bottom-0 left-0 w-64 h-64 bg-black opacity-10 rounded-full -ml-20 -mb-20 blur-3xl"></div>
           
           <div className="relative z-10">
             <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm mb-6">
               <Wrench size={24} className="text-white" />
             </div>
             <h2 className="text-3xl font-bold mb-4">
               {selectedRole === 'CLIENT' ? 'Problemas com seu carro?' : 'Expanda sua oficina.'}
             </h2>
             <p className="text-white/80 leading-relaxed">
               {selectedRole === 'CLIENT' 
                 ? 'Conecte-se com os melhores mecânicos e serviços de socorro da sua região em segundos.' 
                 : 'Cadastre sua oficina, receba chamados de emergência e gerencie seus clientes em um só lugar.'}
             </p>
           </div>

           <div className="relative z-10 mt-8">
             <p className="text-xs uppercase tracking-widest font-semibold opacity-70 mb-4">Escolha seu perfil</p>
             <div className="grid grid-cols-2 gap-3">
               <button 
                 onClick={() => setSelectedRole('CLIENT')}
                 className={`p-4 rounded-xl border text-left transition-all ${selectedRole === 'CLIENT' ? 'bg-white text-indigo-600 border-white shadow-lg' : 'border-white/30 text-white hover:bg-white/10'}`}
               >
                 <Car size={24} className="mb-2" />
                 <span className="block font-bold text-sm">Sou Motorista</span>
               </button>
               <button 
                 onClick={() => setSelectedRole('MECHANIC')}
                 className={`p-4 rounded-xl border text-left transition-all ${selectedRole === 'MECHANIC' ? 'bg-white text-slate-800 border-white shadow-lg' : 'border-white/30 text-white hover:bg-white/10'}`}
               >
                 <Store size={24} className="mb-2" />
                 <span className="block font-bold text-sm">Sou Mecânico</span>
               </button>
             </div>
           </div>
        </div>

        {/* Right Side - Form */}
        <div className="md:w-1/2 p-8 md:p-12 flex flex-col justify-center bg-white dark:bg-zinc-800 transition-colors duration-300">
          <div className="mb-8">
             <h3 className="text-2xl font-bold text-zinc-800 dark:text-zinc-100 mb-1">
               {isLogin ? 'Bem-vindo de volta' : 'Crie sua conta'}
             </h3>
             <p className="text-zinc-500 dark:text-zinc-400 text-sm">
               {isLogin ? 'Entre para acessar sua conta' : `Cadastro gratuito para ${selectedRole === 'CLIENT' ? 'motoristas' : 'parceiros'}`}
             </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Nome Completo</label>
                  <input 
                    type="text" 
                    required 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-600 bg-zinc-50 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    placeholder="Seu nome"
                  />
                </div>
                {selectedRole === 'MECHANIC' && (
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Nome da Oficina</label>
                    <input 
                      type="text" 
                      required 
                      value={shopName}
                      onChange={(e) => setShopName(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-600 bg-zinc-50 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                      placeholder="Ex: Auto Center Silva"
                    />
                  </div>
                )}
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">E-mail</label>
              <input 
                type="email" 
                required 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-600 bg-zinc-50 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                placeholder="seu@email.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Senha</label>
              <input 
                type="password" 
                required 
                className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-600 bg-zinc-50 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                placeholder="••••••••"
              />
            </div>

            <button 
              type="submit"
              className={`w-full py-4 rounded-xl font-bold text-white shadow-lg flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all mt-4 ${selectedRole === 'CLIENT' ? 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200 dark:shadow-none' : 'bg-slate-800 dark:bg-zinc-900 hover:bg-slate-900 dark:hover:bg-black shadow-slate-200 dark:shadow-none'}`}
            >
              {isLogin ? 'Entrar' : 'Cadastrar Grátis'}
              <ArrowRight size={18} />
            </button>
          </form>

          <div className="mt-8 text-center">
            <button 
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm font-medium text-zinc-500 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
              {isLogin ? 'Não tem uma conta? Cadastre-se' : 'Já tem uma conta? Fazer login'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};