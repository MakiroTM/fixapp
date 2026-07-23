import React from 'react';
import { ServiceStatus } from '../types';
import { Clock, Navigation, Wrench, CheckCircle2, XCircle, ArrowRight } from 'lucide-react';

interface StatusIndicatorProps {
  status: ServiceStatus;
  variant?: 'badge' | 'full' | 'compact';
  onStatusChange?: (newStatus: ServiceStatus) => void;
  isEditable?: boolean;
}

export const STATUS_CONFIG: Record<ServiceStatus, {
  label: string;
  shortLabel: string;
  description: string;
  color: string;
  bgColor: string;
  borderColor: string;
  textColor: string;
  icon: React.ElementType;
  step: number;
}> = {
  PENDING: {
    label: 'Pendente / Solicitado',
    shortLabel: 'Pendente',
    description: 'Solicitação enviada. Aguardando aceitação do profissional.',
    color: 'bg-amber-500',
    bgColor: 'bg-amber-50 dark:bg-amber-900/20',
    borderColor: 'border-amber-200 dark:border-amber-800',
    textColor: 'text-amber-700 dark:text-amber-300',
    icon: Clock,
    step: 1
  },
  EN_ROUTE: {
    label: 'A Caminho',
    shortLabel: 'A Caminho',
    description: 'O mecânico/guincho está em deslocamento até o local.',
    color: 'bg-blue-500',
    bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    borderColor: 'border-blue-200 dark:border-blue-800',
    textColor: 'text-blue-700 dark:text-blue-300',
    icon: Navigation,
    step: 2
  },
  IN_PROGRESS: {
    label: 'Em Atendimento',
    shortLabel: 'Em Atendimento',
    description: 'Profissional no local trabalhando no reparo do veículo.',
    color: 'bg-indigo-500',
    bgColor: 'bg-indigo-50 dark:bg-indigo-900/20',
    borderColor: 'border-indigo-200 dark:border-indigo-800',
    textColor: 'text-indigo-700 dark:text-indigo-300',
    icon: Wrench,
    step: 3
  },
  COMPLETED: {
    label: 'Concluído',
    shortLabel: 'Concluído',
    description: 'Serviço finalizado com sucesso.',
    color: 'bg-emerald-500',
    bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
    borderColor: 'border-emerald-200 dark:border-emerald-800',
    textColor: 'text-emerald-700 dark:text-emerald-300',
    icon: CheckCircle2,
    step: 4
  },
  CANCELLED: {
    label: 'Cancelado',
    shortLabel: 'Cancelado',
    description: 'Chamado cancelado pelo cliente ou profissional.',
    color: 'bg-zinc-500',
    bgColor: 'bg-zinc-100 dark:bg-zinc-800',
    borderColor: 'border-zinc-300 dark:border-zinc-700',
    textColor: 'text-zinc-600 dark:text-zinc-400',
    icon: XCircle,
    step: 0
  }
};

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  status,
  variant = 'badge',
  onStatusChange,
  isEditable = false
}) => {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.PENDING;
  const Icon = config.icon;

  if (variant === 'badge') {
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${config.bgColor} ${config.borderColor} ${config.textColor} shadow-xs`}>
        <span className={`w-2 h-2 rounded-full ${config.color} ${status !== 'COMPLETED' && status !== 'CANCELLED' ? 'animate-ping' : ''}`}></span>
        <Icon size={13} />
        <span>{config.shortLabel}</span>
      </span>
    );
  }

  if (variant === 'compact') {
    return (
      <div className={`p-2.5 rounded-xl border ${config.bgColor} ${config.borderColor} flex items-center justify-between gap-3`}>
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded-lg ${config.color} text-white`}>
            <Icon size={16} />
          </div>
          <div>
            <p className={`text-xs font-bold ${config.textColor}`}>{config.label}</p>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400">{config.description}</p>
          </div>
        </div>

        {isEditable && onStatusChange && status !== 'COMPLETED' && status !== 'CANCELLED' && (
          <div className="flex items-center gap-1">
            {status === 'PENDING' && (
              <button
                onClick={() => onStatusChange('EN_ROUTE')}
                className="px-2 py-1 text-[10px] font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all flex items-center gap-1 shadow-xs"
              >
                <span>A Caminho</span>
                <ArrowRight size={10} />
              </button>
            )}
            {status === 'EN_ROUTE' && (
              <button
                onClick={() => onStatusChange('IN_PROGRESS')}
                className="px-2 py-1 text-[10px] font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-all flex items-center gap-1 shadow-xs"
              >
                <span>Iniciar Reparo</span>
                <ArrowRight size={10} />
              </button>
            )}
            {status === 'IN_PROGRESS' && (
              <button
                onClick={() => onStatusChange('COMPLETED')}
                className="px-2 py-1 text-[10px] font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-all flex items-center gap-1 shadow-xs"
              >
                <span>Finalizar</span>
                <CheckCircle2 size={10} />
              </button>
            )}
          </div>
        )}
      </div>
    );
  }

  // Full Stepper Progress Bar
  const steps: ServiceStatus[] = ['PENDING', 'EN_ROUTE', 'IN_PROGRESS', 'COMPLETED'];
  const currentStepNum = config.step;

  return (
    <div className="bg-white dark:bg-zinc-800/90 border border-zinc-200 dark:border-zinc-700 rounded-2xl p-4 shadow-sm space-y-4">
      {/* Header Info */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`p-2 rounded-xl ${config.color} text-white shadow-sm`}>
            <Icon size={18} />
          </div>
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-zinc-400">Status Atual do Serviço</span>
            <h4 className={`text-sm sm:text-base font-extrabold ${config.textColor}`}>{config.label}</h4>
          </div>
        </div>

        {isEditable && onStatusChange && (
          <div className="flex items-center gap-1">
            <select
              value={status}
              onChange={(e) => onStatusChange(e.target.value as ServiceStatus)}
              className="bg-zinc-100 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-100 text-xs font-bold px-2 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-600 focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              <option value="PENDING">1. Pendente</option>
              <option value="EN_ROUTE">2. A Caminho</option>
              <option value="IN_PROGRESS">3. Em Atendimento</option>
              <option value="COMPLETED">4. Concluído</option>
              <option value="CANCELLED">Cancelado</option>
            </select>
          </div>
        )}
      </div>

      <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed bg-zinc-50 dark:bg-zinc-900/50 p-2.5 rounded-xl border border-zinc-100 dark:border-zinc-800">
        {config.description}
      </p>

      {/* Progress Bar / Stepper */}
      {status !== 'CANCELLED' && (
        <div className="pt-2">
          <div className="relative flex items-center justify-between max-w-md mx-auto">
            {/* Connecting line */}
            <div className="absolute left-4 right-4 top-1/2 -translate-y-1/2 h-1 bg-zinc-200 dark:bg-zinc-700 -z-0 rounded-full">
              <div 
                className="h-full bg-gradient-to-r from-amber-500 via-blue-500 to-emerald-500 rounded-full transition-all duration-500"
                style={{ 
                  width: `${((Math.max(1, currentStepNum) - 1) / (steps.length - 1)) * 100}%` 
                }}
              ></div>
            </div>

            {steps.map((stepKey, idx) => {
              const stepConf = STATUS_CONFIG[stepKey];
              const StepIcon = stepConf.icon;
              const isPassed = currentStepNum >= stepConf.step;
              const isCurrent = currentStepNum === stepConf.step;

              return (
                <div key={stepKey} className="relative z-10 flex flex-col items-center group">
                  <button
                    onClick={() => isEditable && onStatusChange && onStatusChange(stepKey)}
                    disabled={!isEditable}
                    className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-300 ${
                      isCurrent
                        ? `${stepConf.color} text-white ring-4 ring-indigo-500/20 scale-110 shadow-md`
                        : isPassed
                        ? 'bg-emerald-500 text-white'
                        : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-400 dark:text-zinc-500'
                    }`}
                  >
                    <StepIcon size={16} />
                  </button>
                  <span className={`text-[10px] font-bold mt-1.5 transition-colors text-center ${
                    isCurrent ? stepConf.textColor : isPassed ? 'text-emerald-600 dark:text-emerald-400' : 'text-zinc-400'
                  }`}>
                    {stepConf.shortLabel}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
