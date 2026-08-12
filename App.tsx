import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Header } from './components/Header';
import { AuthScreen } from './components/AuthScreen';
import { ClientDashboard } from './components/ClientDashboard';
import { MechanicDashboard } from './components/MechanicDashboard';
import { UserProfile } from './components/UserProfile';
import { SubscriptionScreen } from './components/SubscriptionScreen';
import { SosEmergencyScreen } from './components/SosEmergencyScreen';
import { SplashScreen } from './components/SplashScreen';
import { NearbyWorkshopsScreen } from './components/NearbyWorkshopsScreen';
import { WorkshopDetailScreen } from './components/WorkshopDetailScreen';
import { BottomNav } from './components/BottomNav';
import { Heart, MessageCircle } from 'lucide-react';
import { User, Coordinates, GroundingChunk } from './types';

type ViewState = 'dashboard' | 'profile' | 'subscription' | 'sos' | 'nearby' | 'workshop-detail' | 'favorites' | 'chat';

const App: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<ViewState>('dashboard');
  const [selectedWorkshop, setSelectedWorkshop] = useState<GroundingChunk | null>(null);
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
    const requestLocation = async () => {
      if (typeof window !== 'undefined') {
        try {
          setIsDetectingLocation(true);
          
          // First, check permission natively if using Capacitor
          const { Geolocation } = await import('@capacitor/geolocation');
          
          try {
            const permStatus = await Geolocation.checkPermissions();
            if (permStatus.location !== 'granted' && permStatus.location !== 'prompt') {
               const reqStatus = await Geolocation.requestPermissions();
               if (reqStatus.location !== 'granted') {
                 setLocationError("Permissão de localização negada pelo usuário.");
                 setIsDetectingLocation(false);
                 return;
               }
            } else if (permStatus.location === 'prompt') {
               const reqStatus = await Geolocation.requestPermissions();
               if (reqStatus.location !== 'granted') {
                 setLocationError("Permissão de localização negada pelo usuário.");
                 setIsDetectingLocation(false);
                 return;
               }
            }
          } catch (capacitorError) {
             console.log('[DEBUG Geolocation] Not running in capacitor natively, fallback to web geolocation.', capacitorError);
          }

          if (navigator.geolocation) {
            console.log('[DEBUG Geolocation] Requesting current position via navigator.geolocation...');
            
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
                
                // Alert se negou ou falhou na web e o usuario precisa saber
                if (err.code === 1) {
                  alert("Por favor, ative a localização do seu aparelho para encontrar socorristas próximos.");
                }
              },
              { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
            );
          } else {
            console.warn('[DEBUG Geolocation] Geolocation API is not supported in this environment.');
            setLocationError("Não suportado.");
            setIsDetectingLocation(false);
          }
        } catch (error) {
          console.error("Geolocation global error:", error);
          setLocationError("Erro interno.");
          setIsDetectingLocation(false);
        }
      }
    };

    requestLocation();
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

  const handleSelectWorkshop = (chunk: GroundingChunk) => {
    setSelectedWorkshop(chunk);
    setCurrentView('workshop-detail');
  };

  if (loading) {
    return <SplashScreen onFinish={() => setLoading(false)} />;
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col font-sans transition-colors duration-300">
      <Header 
        user={user} 
        onLogout={handleLogout} 
        onProfileClick={() => setCurrentView('profile')}
        onPlanClick={() => setCurrentView('subscription')}
        onHomeClick={() => setCurrentView('dashboard')}
        onSosClick={() => setCurrentView('sos')}
        onMapClick={() => setCurrentView('nearby')}
        isDarkMode={isDarkMode}
        toggleTheme={toggleTheme}
      />
      
      <main className="flex-grow flex flex-col relative overflow-hidden pb-24">
        <AnimatePresence mode="wait">
          {!user ? (
            <motion.div
              key="auth"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.25 }}
            >
              <AuthScreen onLogin={handleLogin} />
            </motion.div>
          ) : (
            <motion.div 
              key={currentView} 
              initial={{ opacity: 0, y: 18, scale: 0.99 }} 
              animate={{ opacity: 1, y: 0, scale: 1 }} 
              exit={{ opacity: 0, y: -18, scale: 0.99 }} 
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              className="flex-1 flex flex-col"
            >
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
              ) : currentView === 'nearby' ? (
                <>
                  {user.role === 'CLIENT' ? (
                    <ClientDashboard 
                      user={user} 
                      onUpgrade={() => setCurrentView('subscription')} 
                      onSosClick={() => setCurrentView('sos')}
                      onSelectWorkshop={handleSelectWorkshop}
                      location={location}
                      locationError={locationError}
                      isDetectingLocation={isDetectingLocation}
                    />
                  ) : (
                    <MechanicDashboard user={user} onUpgrade={() => setCurrentView('subscription')} />
                  )}
                </>
              ) : currentView === 'workshop-detail' && selectedWorkshop ? (
                <WorkshopDetailScreen
                  chunk={selectedWorkshop}
                  userLocation={location}
                  onBack={() => setCurrentView('dashboard')}
                  onContact={(name) => {
                    // Direct to dashboard chat or handle contact
                    setCurrentView('dashboard');
                  }}
                />
              ) : currentView === 'favorites' ? (
                <div className="flex-1 flex flex-col items-center justify-center p-6 text-center h-full min-h-[60vh]">
                  <div className="w-16 h-16 bg-blue-900/20 rounded-full flex items-center justify-center text-blue-500 mb-4 border border-blue-900/30">
                    <Heart size={32} />
                  </div>
                  <h2 className="text-xl font-bold text-white mb-2">Oficinas Salvas</h2>
                  <p className="text-zinc-400 text-sm max-w-xs">Suas oficinas e prestadores favoritos aparecerão aqui para acesso rápido.</p>
                </div>
              ) : currentView === 'chat' ? (
                <div className="flex-1 flex flex-col items-center justify-center p-6 text-center h-full min-h-[60vh]">
                  <div className="w-16 h-16 bg-blue-900/20 rounded-full flex items-center justify-center text-blue-500 mb-4 border border-blue-900/30">
                    <MessageCircle size={32} />
                  </div>
                  <h2 className="text-xl font-bold text-white mb-2">Mensagens</h2>
                  <p className="text-zinc-400 text-sm max-w-xs">Seu histórico de conversas com mecânicos e suporte será listado aqui.</p>
                </div>
              ) : (
                <>
                  {user.role === 'CLIENT' ? (
                    <NearbyWorkshopsScreen
                      user={user}
                      location={location}
                      onBack={() => setCurrentView('dashboard')}
                      onContact={() => {}}
                      onSelectWorkshop={handleSelectWorkshop}
                    />
                  ) : (
                    <MechanicDashboard user={user} onUpgrade={() => setCurrentView('subscription')} />
                  )}
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
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
      {user && currentView !== 'sos' && (
        <BottomNav 
          currentView={currentView} 
          onNavigate={(view) => setCurrentView(view as ViewState)} 
        />
      )}
    </div>
  );
};

export default App;