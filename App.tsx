import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { AuthScreen } from './components/AuthScreen';
import { ClientDashboard } from './components/ClientDashboard';
import { MechanicDashboard } from './components/MechanicDashboard';
import { UserProfile } from './components/UserProfile';
import { SubscriptionScreen } from './components/SubscriptionScreen';
import { SosEmergencyScreen } from './components/SosEmergencyScreen';
import { SplashScreen } from './components/SplashScreen';
import { User, Coordinates } from './types';

type ViewState = 'dashboard' | 'profile' | 'subscription' | 'sos';

const App: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<ViewState>('dashboard');
  const [showConfetti, setShowConfetti] = useState(false);
  
  // Geolocation State
  const [location, setLocation] = useState<Coordinates | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  
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

  // Geolocation Logic
  useEffect(() => {
    if (typeof window !== 'undefined' && navigator.geolocation) {
      console.log('[DEBUG Geolocation] Requesting current position via navigator.geolocation...');
      setIsDetectingLocation(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };
          console.log('[DEBUG Geolocation] Position acquired successfully:', coords);
          setLocation(coords);
          setLocationError(null);
          setIsDetectingLocation(false);
        },
        (err: any) => {
          console.error("[DEBUG Geolocation Error]", {
            code: err.code,
            message: err.message
          });
          let msg = "Erro de localização.";
          if (err.code === 1) msg = "Permissão negada.";
          else if (err.code === 2) msg = "Sinal indisponível.";
          else if (err.code === 3) msg = "Tempo esgotado.";
          setLocationError(msg);
          setIsDetectingLocation(false);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      console.warn('[DEBUG Geolocation] Geolocation API is not supported in this environment.');
      setLocationError("Não suportado.");
    }
  }, []);

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
        onHomeClick={() => setCurrentView('dashboard')}
        onSosClick={() => setCurrentView('sos')}
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
            ) : currentView === 'sos' ? (
              <SosEmergencyScreen
                user={user}
                location={location}
                locationError={locationError}
                isDetectingLocation={isDetectingLocation}
                onBack={() => setCurrentView('dashboard')}
              />
            ) : (
              <>
                {user.role === 'CLIENT' ? (
                  <ClientDashboard 
                    user={user} 
                    onUpgrade={() => setCurrentView('subscription')} 
                    onSosClick={() => setCurrentView('sos')}
                    location={location}
                    locationError={locationError}
                    isDetectingLocation={isDetectingLocation}
                  />
                ) : (
                  <MechanicDashboard user={user} onUpgrade={() => setCurrentView('subscription')} />
                )}
              </>
            )}
          </div>
        )}
      </main>
      
      {/* Footer com ajuste para Safe Area do iPhone */}
      <footer className="mt-auto py-6 sm:py-8 text-center text-zinc-400 dark:text-zinc-600 text-sm border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 transition-colors duration-300 pb-[env(safe-area-inset-bottom)]">
        <div className="max-w-5xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-6 md:gap-4">
          <div className="text-center md:text-left">
            <p className="font-bold text-zinc-800 dark:text-zinc-200">© 2026 FIX App</p>
            <p className="text-xs">Conectando motoristas e mecânicos com inteligência.</p>
          </div>

          {/* Location Status in Footer */}
          <div className="flex items-center gap-2 bg-zinc-50 dark:bg-zinc-800/50 px-3 py-1.5 rounded-full border border-zinc-100 dark:border-zinc-800">
            {isDetectingLocation ? (
              <div className="flex items-center gap-1.5 text-blue-500 animate-pulse text-[10px] sm:text-xs font-medium">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-ping"></div>
                Detectando GPS...
              </div>
            ) : locationError ? (
              <div className="flex items-center gap-1.5 text-amber-500 text-[10px] sm:text-xs font-medium">
                <div className="w-1.5 h-1.5 bg-amber-500 rounded-full"></div>
                GPS: {locationError}
              </div>
            ) : location ? (
              <div className="flex items-center gap-1.5 text-emerald-500 text-[10px] sm:text-xs font-medium">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                GPS Ativo
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-zinc-400 text-[10px] sm:text-xs font-medium">
                <div className="w-1.5 h-1.5 bg-zinc-400 rounded-full"></div>
                GPS Desativado
              </div>
            )}
          </div>

          <div className="flex gap-6 md:gap-4 text-xs font-medium">
            <a href="#" className="hover:text-indigo-500 transition-colors">Privacidade</a>
            <a href="#" className="hover:text-indigo-500 transition-colors">Termos</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;