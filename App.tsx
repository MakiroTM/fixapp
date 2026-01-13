import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { AuthScreen } from './components/AuthScreen';
import { ClientDashboard } from './components/ClientDashboard';
import { MechanicDashboard } from './components/MechanicDashboard';
import { UserProfile } from './components/UserProfile';
import { SubscriptionScreen } from './components/SubscriptionScreen';
import { SplashScreen } from './components/SplashScreen';
import { User } from './types';

type ViewState = 'dashboard' | 'profile' | 'subscription';

const App: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<ViewState>('dashboard');
  const [showConfetti, setShowConfetti] = useState(false);
  
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

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      // Only update automatically if user hasn't set a preference manually (no localStorage key)
      if (!localStorage.getItem('theme')) {
        setIsDarkMode(e.matches);
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Apply theme class to html element without persisting automatically
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode(prev => {
      const newValue = !prev;
      // When toggled manually, save preference
      localStorage.setItem('theme', newValue ? 'dark' : 'light');
      return newValue;
    });
  };

  const handleLogin = (newUser: User) => {
    // Garantir que o user tenha o campo plan se vier do mock antigo
    const userWithPlan = { ...newUser, plan: newUser.plan || 'FREE' };
    setUser(userWithPlan);
    setCurrentView('dashboard');
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentView('dashboard');
  };

  const handleUpdateUser = (updatedUser: User) => {
    setUser(updatedUser);
  };

  const handleSubscribe = () => {
    if (user) {
      const newPlan = user.role === 'MECHANIC' ? 'PRO' : 'PRIME';
      setUser({ ...user, plan: newPlan });
      setCurrentView('dashboard');
      // Trigger success animation visually
      const button = document.getElementById('plan-badge');
      if (button) button.classList.add('animate-bounce');
    }
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
        onPlanClick={() => setCurrentView('subscription')}
        isDarkMode={isDarkMode}
        toggleTheme={toggleTheme}
      />
      
      <main className="flex-grow">
        {!user ? (
          <div className="animate-page-enter">
            <AuthScreen onLogin={handleLogin} />
          </div>
        ) : (
          <div key={currentView} className="animate-page-enter">
            {currentView === 'profile' ? (
              <UserProfile 
                user={user} 
                onSave={handleUpdateUser} 
                onBack={() => setCurrentView('dashboard')} 
              />
            ) : currentView === 'subscription' ? (
              <SubscriptionScreen 
                user={user}
                onSubscribe={handleSubscribe}
                onBack={() => setCurrentView('dashboard')}
              />
            ) : (
              <>
                {user.role === 'CLIENT' ? (
                  <ClientDashboard user={user} onUpgrade={() => setCurrentView('subscription')} />
                ) : (
                  <MechanicDashboard user={user} onUpgrade={() => setCurrentView('subscription')} />
                )}
              </>
            )}
          </div>
        )}
      </main>
      
      {/* Footer com ajuste para Safe Area do iPhone (pb-safe ou padding-bottom via env) */}
      <footer className="mt-auto py-8 text-center text-zinc-400 dark:text-zinc-600 text-sm border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 transition-colors duration-300 pb-[env(safe-area-inset-bottom)]">
        <div className="pb-4">
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