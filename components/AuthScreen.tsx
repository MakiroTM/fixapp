import React, { useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { 
  Wrench, 
  Car, 
  Store, 
  ArrowRight, 
  Check, 
  Lock, 
  Mail, 
  ShieldCheck, 
  Sparkles, 
  UserPlus, 
  LogIn, 
  ArrowLeft, 
  Clock, 
  CheckCircle2, 
  HelpCircle,
  KeyRound,
  Eye,
  EyeOff
} from 'lucide-react';

interface AuthScreenProps {
  onLogin: (user: User) => void;
}

type AuthMode = 'WELCOME' | 'LOGIN' | 'REGISTER';

export const AuthScreen: React.FC<AuthScreenProps> = ({ onLogin }) => {
  const [authMode, setAuthMode] = useState<AuthMode>('WELCOME');
  const [selectedRole, setSelectedRole] = useState<UserRole>('CLIENT');
  
  // Form States
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [shopName, setShopName] = useState(''); // Only for mechanic
  const [rememberMe, setRememberMe] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  
  // Forgot Password Modal state
  const [showForgotModal, setShowForgotModal] = useState<boolean>(false);
  const [forgotEmail, setForgotEmail] = useState<string>('');
  const [forgotSent, setForgotSent] = useState<boolean>(false);

  // Load saved 'Remember Me' preferences on component mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedEmail = localStorage.getItem('fix_saved_email');
      const savedRemember = localStorage.getItem('fix_remember_me') === 'true';
      if (savedRemember && savedEmail) {
        setEmail(savedEmail);
        setRememberMe(true);
      }
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Handle 'Lembrar senha' persistence
    if (typeof window !== 'undefined') {
      if (rememberMe) {
        localStorage.setItem('fix_saved_email', email);
        localStorage.setItem('fix_remember_me', 'true');
      } else {
        localStorage.removeItem('fix_saved_email');
        localStorage.setItem('fix_remember_me', 'false');
      }
    }

    // Simulating authentication
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

  const handleSendForgotPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) return;
    setForgotSent(true);
    setTimeout(() => {
      setShowForgotModal(false);
      setForgotSent(false);
      setForgotEmail('');
    }, 2500);
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center p-3 sm:p-6 transition-colors duration-300">
      <div className="w-full max-w-4xl bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl shadow-indigo-500/10 dark:shadow-none overflow-hidden border border-zinc-200 dark:border-zinc-800 flex flex-col md:flex-row transition-all duration-300">
        
        {/* Left Side - Visual Hero & Profile Selector */}
        <div className={`md:w-1/2 p-6 sm:p-10 text-white flex flex-col justify-between relative overflow-hidden transition-all duration-500 ${
          selectedRole === 'CLIENT' 
            ? 'bg-gradient-to-br from-indigo-600 via-indigo-700 to-indigo-900' 
            : 'bg-gradient-to-br from-zinc-800 via-slate-900 to-zinc-950'
        }`}>
           <div className="absolute top-0 right-0 w-80 h-80 bg-white opacity-10 rounded-full -mr-32 -mt-32 blur-3xl pointer-events-none"></div>
           <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-500 opacity-20 rounded-full -ml-32 -mb-32 blur-3xl pointer-events-none"></div>
           
           <div className="relative z-10 space-y-4 sm:space-y-6">
             <div className="flex items-center gap-3">
               <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/20 shadow-inner">
                 <Wrench size={22} className="text-white" />
               </div>
               <div>
                 <span className="text-[11px] font-black tracking-widest text-indigo-200 uppercase">FIX Auto & Socorro</span>
                 <h1 className="text-lg font-black text-white leading-none">Assistência 24h</h1>
               </div>
             </div>

             <div>
               <h2 className="text-2xl sm:text-3xl font-extrabold mb-3 leading-tight tracking-tight">
                 {selectedRole === 'CLIENT' ? 'Problemas na estrada ou manutenção?' : 'Sua oficina na palma da mão.'}
               </h2>
               <p className="text-white/80 text-xs sm:text-sm leading-relaxed">
                 {selectedRole === 'CLIENT' 
                   ? 'Conecte-se com guinchos, borracharias e mecânicos credenciados em tempo real com rastreamento GPS.' 
                   : 'Atenda chamados de emergência, receba pagamentos instantâneos via Pix e conquiste novos clientes.'}
               </p>
             </div>

             {/* Highlight badges */}
             <div className="space-y-2 pt-2">
               <div className="flex items-center gap-2 text-xs font-semibold text-white/90">
                 <CheckCircle2 size={16} className="text-emerald-400" />
                 <span>Atendimento ágil com ETA dinâmico em tempo real</span>
               </div>
               <div className="flex items-center gap-2 text-xs font-semibold text-white/90">
                 <ShieldCheck size={16} className="text-emerald-400" />
                 <span>Profissionais avaliados e pagamentos seguros</span>
               </div>
             </div>
           </div>

           {/* Profile Role Selector */}
           <div className="relative z-10 mt-8 pt-6 border-t border-white/10">
             <p className="text-[10px] sm:text-xs uppercase tracking-widest font-black text-white/70 mb-3">
               Como você deseja usar o FIX?
             </p>
             <div className="grid grid-cols-2 gap-3">
               <button 
                 type="button"
                 onClick={() => setSelectedRole('CLIENT')}
                 className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                   selectedRole === 'CLIENT' 
                     ? 'bg-white text-indigo-900 border-white shadow-xl scale-[1.02]' 
                     : 'border-white/20 text-white hover:bg-white/10'
                 }`}
               >
                 <Car size={20} className={selectedRole === 'CLIENT' ? 'text-indigo-600' : 'text-white'} />
                 <div className="mt-2">
                   <span className="block font-black text-xs sm:text-sm">Motorista</span>
                   <span className="text-[10px] opacity-75">Quero socorro & serviços</span>
                 </div>
               </button>

               <button 
                 type="button"
                 onClick={() => setSelectedRole('MECHANIC')}
                 className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                   selectedRole === 'MECHANIC' 
                     ? 'bg-white text-zinc-900 border-white shadow-xl scale-[1.02]' 
                     : 'border-white/20 text-white hover:bg-white/10'
                 }`}
               >
                 <Store size={20} className={selectedRole === 'MECHANIC' ? 'text-zinc-900' : 'text-white'} />
                 <div className="mt-2">
                   <span className="block font-black text-xs sm:text-sm">Mecânico</span>
                   <span className="text-[10px] opacity-75">Quero receber chamados</span>
                 </div>
               </button>
             </div>
           </div>
        </div>

        {/* Right Side - Interactive View Container */}
        <div className="md:w-1/2 p-6 sm:p-10 flex flex-col justify-center bg-white dark:bg-zinc-900 transition-colors duration-300">
          
          {/* VIEW 1: WELCOME SCREEN */}
          {authMode === 'WELCOME' && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-bold mb-3 border border-indigo-500/20">
                  <Sparkles size={14} /> Bem-vindo ao FIX
                </span>
                <h3 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white leading-tight">
                  Sua jornada com tranquilidade na estrada.
                </h3>
                <p className="text-zinc-500 dark:text-zinc-400 text-xs sm:text-sm mt-2 leading-relaxed">
                  Escolha uma das opções abaixo para começar. Acesse sua conta existente ou crie um cadastro em menos de 1 minuto.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 pt-2">
                <button
                  type="button"
                  onClick={() => setAuthMode('REGISTER')}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold py-3.5 px-6 rounded-2xl shadow-lg shadow-indigo-600/30 flex items-center justify-between group transition-all transform hover:-translate-y-0.5"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-xl">
                      <UserPlus size={20} />
                    </div>
                    <div className="text-left">
                      <span className="block text-sm">Criar nova conta</span>
                      <span className="block text-[11px] font-normal opacity-90">Cadastro rápido e 100% gratuito</span>
                    </div>
                  </div>
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </button>

                <button
                  type="button"
                  onClick={() => setAuthMode('LOGIN')}
                  className="w-full bg-zinc-100 dark:bg-zinc-800/80 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-100 font-extrabold py-3.5 px-6 rounded-2xl border border-zinc-200 dark:border-zinc-700 flex items-center justify-between group transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-zinc-200 dark:bg-zinc-700 text-indigo-600 dark:text-indigo-400 rounded-xl">
                      <LogIn size={20} />
                    </div>
                    <div className="text-left">
                      <span className="block text-sm">Já tenho uma conta (Login)</span>
                      <span className="block text-[11px] font-normal text-zinc-500 dark:text-zinc-400">Entre com seu e-mail e senha</span>
                    </div>
                  </div>
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform text-zinc-400" />
                </button>
              </div>

              {/* Informational Footer note */}
              <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800/60 text-center text-[11px] text-zinc-400 flex items-center justify-center gap-1.5">
                <Lock size={12} className="text-emerald-500" />
                <span>Ambiente seguro com criptografia de ponta a ponta</span>
              </div>
            </div>
          )}

          {/* VIEW 2: LOGIN SCREEN (with Lembrar Senha) */}
          {authMode === 'LOGIN' && (
            <div className="space-y-5 animate-fade-in">
              <button
                type="button"
                onClick={() => setAuthMode('WELCOME')}
                className="inline-flex items-center gap-1 text-xs font-bold text-zinc-500 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors mb-1"
              >
                <ArrowLeft size={16} />
                <span>Voltar ao início</span>
              </button>

              <div>
                <h3 className="text-2xl font-black text-zinc-900 dark:text-white">
                  Bem-vindo de volta!
                </h3>
                <p className="text-zinc-500 dark:text-zinc-400 text-xs mt-1">
                  Entre na sua conta para acessar os serviços e histórico.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                    Endereço de E-mail
                  </label>
                  <div className="relative">
                    <input 
                      type="email" 
                      required 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                      placeholder="seu.email@exemplo.com"
                    />
                    <Mail size={18} className="absolute left-3 top-3.5 text-zinc-400" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                    Sua Senha
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
                      title={showPassword ? 'Ocultar senha' : 'Exibir senha'}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                {/* Lembrar Senha & Esqueceu Senha options */}
                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input 
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded border-zinc-300 dark:border-zinc-700 text-indigo-600 focus:ring-indigo-500 cursor-pointer accent-indigo-600"
                    />
                    <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      Lembrar senha neste aparelho
                    </span>
                  </label>

                  <button
                    type="button"
                    onClick={() => setShowForgotModal(true)}
                    className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline transition-all"
                  >
                    Esqueceu a senha?
                  </button>
                </div>

                <button 
                  type="submit"
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold py-3.5 rounded-2xl shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99] transition-all text-sm mt-2"
                >
                  <span>ENTRAR NA CONTA</span>
                  <ArrowRight size={18} />
                </button>
              </form>

              <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 text-center">
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Ainda não tem uma conta?{' '}
                  <button 
                    type="button"
                    onClick={() => setAuthMode('REGISTER')}
                    className="font-extrabold text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    Criar conta grátis
                  </button>
                </p>
              </div>
            </div>
          )}

          {/* VIEW 3: REGISTER SCREEN */}
          {authMode === 'REGISTER' && (
            <div className="space-y-5 animate-fade-in">
              <button
                type="button"
                onClick={() => setAuthMode('WELCOME')}
                className="inline-flex items-center gap-1 text-xs font-bold text-zinc-500 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors mb-1"
              >
                <ArrowLeft size={16} />
                <span>Voltar ao início</span>
              </button>

              <div>
                <h3 className="text-2xl font-black text-zinc-900 dark:text-white">
                  Crie sua conta no FIX
                </h3>
                <p className="text-zinc-500 dark:text-zinc-400 text-xs mt-1">
                  Cadastro rápido para {selectedRole === 'CLIENT' ? 'Motoristas' : 'Mecânicos e Oficinas'}.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                    Nome Completo
                  </label>
                  <input 
                    type="text" 
                    required 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    placeholder="Seu nome e sobrenome"
                  />
                </div>

                {selectedRole === 'MECHANIC' && (
                  <div>
                    <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                      Nome da Oficina / Guincho
                    </label>
                    <input 
                      type="text" 
                      required 
                      value={shopName}
                      onChange={(e) => setShopName(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                      placeholder="Ex: Auto Center Express"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                    Endereço de E-mail
                  </label>
                  <input 
                    type="email" 
                    required 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    placeholder="seu.email@exemplo.com"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                    Crie uma Senha Segura
                  </label>
                  <input 
                    type="password" 
                    required 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    placeholder="Mínimo de 6 caracteres"
                  />
                </div>

                <label className="flex items-start gap-2 cursor-pointer pt-1">
                  <input 
                    type="checkbox" 
                    required 
                    defaultChecked
                    className="w-4 h-4 mt-0.5 rounded border-zinc-300 text-indigo-600 focus:ring-indigo-500 accent-indigo-600"
                  />
                  <span className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-tight">
                    Li e concordo com os <a href="#" className="text-indigo-600 underline">Termos de Uso</a> e a <a href="#" className="text-indigo-600 underline">Política de Privacidade</a> do FIX App.
                  </span>
                </label>

                <button 
                  type="submit"
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold py-3.5 rounded-2xl shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99] transition-all text-sm mt-2"
                >
                  <span>CRIAR CONTA GRATUITA</span>
                  <ArrowRight size={18} />
                </button>
              </form>

              <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 text-center">
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Já possui uma conta criada?{' '}
                  <button 
                    type="button"
                    onClick={() => setAuthMode('LOGIN')}
                    className="font-extrabold text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    Fazer Login
                  </button>
                </p>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-2xl">
                <HelpCircle size={24} />
              </div>
              <div>
                <h3 className="text-lg font-black text-zinc-900 dark:text-white">Recuperar Senha</h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">Enviaremos um link de redefinição para o seu e-mail.</p>
              </div>
            </div>

            {forgotSent ? (
              <div className="bg-emerald-500/10 border border-emerald-500/30 p-4 rounded-2xl text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 size={18} />
                <span>E-mail de recuperação enviado com sucesso! Verifique sua caixa de entrada.</span>
              </div>
            ) : (
              <form onSubmit={handleSendForgotPassword} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">E-mail Cadastrado</label>
                  <input 
                    type="email"
                    required
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="seu.email@exemplo.com"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(false)}
                    className="px-4 py-2.5 text-xs font-bold text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-md transition-all"
                  >
                    Enviar Link
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
