import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { AuthScreen } from './components/AuthScreen';
import { ClientDashboard } from './components/ClientDashboard';
import { MechanicDashboard } from './components/MechanicDashboard';
import { UserProfile } from './components/UserProfile';
import { SplashScreen } from './components/SplashScreen';
import { User } from './types';

type ViewState = 'dashboard' | 'profile';

const App: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<ViewState>('dashboard');
  
  // Theme State
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme) {
        return savedTheme === 'dark';
      }
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  // Apply theme class to html element
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const handleLogin = (newUser: User) => {
    setUser(newUser);
    setCurrentView('dashboard');
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentView('dashboard');
  };

  const handleUpdateUser = (updatedUser: User) => {
    setUser(updatedUser);
  };

  if (loading) {
    return <SplashScreen onFinish={() => setLoading(false)} />;
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col font-sans transition-colors duration-300">
      <Header 
        user={user} 
        onLogout={handleLogout} 
        onProfileClick={() => setCurrentView('profile')}
        isDarkMode={isDarkMode}
        toggleTheme={toggleTheme}
      />
      
      <main className="flex-grow">
        {!user ? (
          <div className="animate-page-enter">
            <AuthScreen onLogin={handleLogin} />
          </div>
        ) : (
          /* 
             A prop 'key' aqui é fundamental. Quando 'currentView' muda, 
             o React desmonta o componente antigo e monta o novo, 
             disparando a animação CSS 'animate-page-enter' definida no index.html.
          */
          <div key={currentView} className="animate-page-enter">
            {currentView === 'profile' ? (
              <UserProfile 
                user={user} 
                onSave={handleUpdateUser} 
                onBack={() => setCurrentView('dashboard')} 
              />
            ) : (
              <>
                {user.role === 'CLIENT' ? (
                  <ClientDashboard user={user} />
                ) : (
                  <MechanicDashboard user={user} />
                )}
              </>
            )}
          </div>
        )}
      </main>
      
      {/* Footer com ajuste para Safe Area do iPhone (pb-safe ou padding-bottom via env) */}
      <footer className="mt-auto py-8 text-center text-zinc-400 dark:text-zinc-600 text-sm border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 transition-colors duration-300 pb-[env(safe-area-inset-bottom)]">
        <div className="pb-4"> {/* Container interno para garantir espaçamento antes da safe area */}
          <p className="font-medium">© 2024 FIX.</p>
          <p className="mt-1 text-xs">
            {user ? 'Conectando motoristas e mecânicos.' : 'Plataforma para Motoristas e Oficinas.'}
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;