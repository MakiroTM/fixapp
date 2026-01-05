import React, { useEffect, useState } from 'react';
import { Wrench } from 'lucide-react';

interface SplashScreenProps {
  onFinish: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const [isExiting, setIsExiting] = useState(false);
  const [showIcon, setShowIcon] = useState(false);

  useEffect(() => {
    // 1. Letras voam imediatamente ao montar
    
    // 2. Ícone aparece logo depois que as letras se juntam
    const iconTimer = setTimeout(() => {
        setShowIcon(true);
    }, 600);

    // 3. Iniciar saída da tela
    const exitTriggerTimer = setTimeout(() => {
      setIsExiting(true);
    }, 2400);

    // 4. Desmontar
    const unmountTimer = setTimeout(() => {
      onFinish();
    }, 3000);

    return () => {
      clearTimeout(iconTimer);
      clearTimeout(exitTriggerTimer);
      clearTimeout(unmountTimer);
    };
  }, [onFinish]);

  return (
    <div 
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-indigo-600 dark:bg-zinc-950 transition-all duration-700 ease-in-out ${
        isExiting 
          ? 'opacity-0 scale-110 pointer-events-none' 
          : 'opacity-100 scale-100'
      }`}
    >
      <div className="flex flex-col items-center justify-center relative">
        
        {/* Ícone (Wrench) - Aparece depois do texto */}
        <div className={`absolute -top-24 transition-opacity duration-300 ${showIcon ? 'opacity-100' : 'opacity-0'}`}>
          <div className="bg-white text-indigo-600 p-4 rounded-2xl shadow-xl animate-pop-in">
             <Wrench size={48} strokeWidth={2.5} />
          </div>
        </div>

        {/* Container do Texto FIX */}
        <div className="flex items-center justify-center gap-1 overflow-visible">
          {/* F - Vem da Esquerda Inferior */}
          <h1 className="text-8xl font-black text-white tracking-tighter animate-fly-in-left drop-shadow-lg">
            F
          </h1>
          
          {/* I - Vem de Cima */}
          <h1 className="text-8xl font-black text-white tracking-tighter animate-fly-in-top drop-shadow-lg">
            I
          </h1>
          
          {/* X - Vem da Direita Superior */}
          <h1 className="text-8xl font-black text-white tracking-tighter animate-fly-in-right drop-shadow-lg">
            X
          </h1>
        </div>

        <div className={`mt-4 transition-all duration-700 delay-700 ${showIcon ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <p className="text-indigo-100 dark:text-zinc-500 font-bold tracking-[0.5em] text-xs uppercase">
            Mecânica Rápida
          </p>
        </div>

      </div>

      <div className="absolute bottom-10 text-white/30 text-[10px] font-medium tracking-widest uppercase">
        Versão 1.0
      </div>
    </div>
  );
};