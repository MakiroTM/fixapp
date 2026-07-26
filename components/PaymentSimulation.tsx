import React, { useState } from 'react';
import { 
  CreditCard, 
  QrCode, 
  DollarSign, 
  CheckCircle2, 
  Copy, 
  Check, 
  ShieldCheck, 
  Lock, 
  Receipt, 
  ArrowRight, 
  ChevronDown, 
  ChevronUp,
  Sparkles,
  Wallet
} from 'lucide-react';
import { PaymentMethod, PaymentStatus } from '../types';

interface PaymentSimulationProps {
  servicePrice?: number;
  paymentStatus?: PaymentStatus;
  paymentMethod?: PaymentMethod;
  receiptId?: string;
  onPaymentSuccess: (method: PaymentMethod, receiptId: string) => void;
  mechanicName?: string;
  serviceType?: string;
}

export const PaymentSimulation: React.FC<PaymentSimulationProps> = ({
  servicePrice = 180.00,
  paymentStatus = 'UNPAID',
  paymentMethod: initialMethod = 'PIX',
  receiptId: initialReceiptId,
  onPaymentSuccess,
  mechanicName = 'Socorrista Técnico',
  serviceType = 'Socorro Mecânico'
}) => {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>(initialMethod);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [status, setStatus] = useState<PaymentStatus>(paymentStatus);
  const [receipt, setReceipt] = useState<string | undefined>(initialReceiptId);
  const [copiedPix, setCopiedPix] = useState<boolean>(false);

  // Card form mock state
  const [cardNumber, setCardNumber] = useState<string>('4532 •••• •••• 8821');
  const [cardName, setCardName] = useState<string>('CLIENTE NOME');
  const [cardExpiry, setCardExpiry] = useState<string>('12/28');
  const [cardCvv, setCardCvv] = useState<string>('888');

  const pixKey = "00020126580014BR.GOV.BCB.PIX0136fix-socorro-auto-24h-pix-key-8829";

  const handleCopyPix = () => {
    navigator.clipboard.writeText(pixKey);
    setCopiedPix(true);
    setTimeout(() => setCopiedPix(false), 2500);
  };

  const handleSimulatePayment = () => {
    setIsProcessing(true);

    setTimeout(() => {
      const generatedReceipt = 'FIX-REC-' + Math.floor(100000 + Math.random() * 900000);
      setIsProcessing(false);
      setStatus('PAID');
      setReceipt(generatedReceipt);
      onPaymentSuccess(selectedMethod, generatedReceipt);
    }, 1800);
  };

  const formatPrice = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  // If already paid, show high-contrast Receipt Card
  if (status === 'PAID') {
    return (
      <div className="bg-emerald-950/40 border border-emerald-500/50 rounded-xl p-4 text-emerald-100 shadow-xl space-y-3 animate-pop-in">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-600 text-white rounded-lg shadow-sm">
              <CheckCircle2 size={20} />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400">Pagamento Confirmado</span>
              <h4 className="text-sm font-bold text-white">Comprovante de Serviço</h4>
            </div>
          </div>
          <span className="text-xs font-mono font-extrabold text-emerald-300 bg-emerald-900/60 px-2.5 py-1 rounded-md border border-emerald-700/60">
            {receipt || 'FIX-REC-982121'}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs bg-zinc-950/70 p-3 rounded-lg border border-emerald-800/40">
          <div>
            <p className="text-zinc-400">Valor Pago:</p>
            <p className="text-sm font-black text-emerald-400">{formatPrice(servicePrice)}</p>
          </div>
          <div>
            <p className="text-zinc-400">Forma de Pagamento:</p>
            <p className="font-bold text-white uppercase">
              {selectedMethod === 'PIX' ? 'PIX Instantâneo' : selectedMethod === 'CREDIT_CARD' ? 'Cartão de Crédito' : selectedMethod === 'DEBIT_CARD' ? 'Cartão de Débito' : 'Dinheiro na Entrega'}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between text-[11px] text-emerald-300/80 pt-1">
          <span className="flex items-center gap-1">
            <ShieldCheck size={14} className="text-emerald-400" /> Transação segura FIX Pagamentos
          </span>
          <span>{new Date().toLocaleDateString('pt-BR')}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden shadow-xl transition-all">
      {/* Header bar */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 flex items-center justify-between bg-gradient-to-r from-zinc-900 via-zinc-900 to-indigo-950/40 hover:bg-zinc-800/80 transition-colors text-left"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-600/30 border border-indigo-500/50 text-indigo-300 rounded-lg">
            <Wallet size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white">Pagamento do Serviço</span>
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                PENDENTE
              </span>
            </div>
            <p className="text-xs text-zinc-400">
              Valor estimado: <strong className="text-emerald-400 font-extrabold">{formatPrice(servicePrice)}</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-bold text-indigo-400">
          <span>{isExpanded ? 'Ocultar Opções' : 'Pagar Agora'}</span>
          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </button>

      {/* Expanded Payment Simulation Form */}
      {isExpanded && (
        <div className="p-4 border-t border-zinc-800 space-y-4 animate-fade-in bg-zinc-900/40">
          
          {/* Method Tabs */}
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => setSelectedMethod('PIX')}
              className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all ${
                selectedMethod === 'PIX'
                  ? 'bg-emerald-950/60 border-emerald-500 text-emerald-300 ring-2 ring-emerald-500/30'
                  : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700'
              }`}
            >
              <QrCode size={18} />
              <span>PIX (5% off)</span>
            </button>

            <button
              onClick={() => setSelectedMethod('CREDIT_CARD')}
              className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all ${
                selectedMethod === 'CREDIT_CARD'
                  ? 'bg-indigo-950/60 border-indigo-500 text-indigo-300 ring-2 ring-indigo-500/30'
                  : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700'
              }`}
            >
              <CreditCard size={18} />
              <span>Cartão Crédito</span>
            </button>

            <button
              onClick={() => setSelectedMethod('CASH')}
              className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all ${
                selectedMethod === 'CASH'
                  ? 'bg-amber-950/60 border-amber-500 text-amber-300 ring-2 ring-amber-500/30'
                  : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700'
              }`}
            >
              <DollarSign size={18} />
              <span>No Local</span>
            </button>
          </div>

          {/* PIX Payment view */}
          {selectedMethod === 'PIX' && (
            <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                  <Sparkles size={14} /> PIX com Desconto de Aceleração
                </span>
                <span className="text-sm font-black text-emerald-400">{formatPrice(servicePrice * 0.95)}</span>
              </div>

              {/* QR code simulation graphic */}
              <div className="flex flex-col sm:flex-row items-center gap-4 bg-zinc-900/80 p-3 rounded-lg border border-zinc-800">
                <div className="w-24 h-24 bg-white p-2 rounded-lg flex items-center justify-center flex-shrink-0">
                  <div className="w-full h-full border-4 border-zinc-950 p-1 grid grid-cols-4 gap-0.5">
                    <div className="bg-zinc-950"></div>
                    <div className="bg-zinc-950"></div>
                    <div></div>
                    <div className="bg-zinc-950"></div>
                    <div></div>
                    <div className="bg-zinc-950"></div>
                    <div className="bg-zinc-950"></div>
                    <div></div>
                    <div className="bg-zinc-950"></div>
                    <div></div>
                    <div className="bg-zinc-950"></div>
                    <div className="bg-zinc-950"></div>
                    <div className="bg-zinc-950"></div>
                    <div className="bg-zinc-950"></div>
                    <div></div>
                    <div className="bg-zinc-950"></div>
                  </div>
                </div>

                <div className="flex-1 space-y-2 text-center sm:text-left">
                  <p className="text-xs text-zinc-300 font-medium leading-relaxed">
                    Copie a chave Pix abaixo ou escaneie o código no aplicativo do seu banco:
                  </p>
                  <button
                    onClick={handleCopyPix}
                    className="w-full sm:w-auto bg-zinc-800 hover:bg-zinc-700 text-zinc-200 px-3 py-1.5 rounded-lg text-xs font-bold border border-zinc-700 flex items-center justify-center gap-2 transition-colors"
                  >
                    {copiedPix ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                    <span>{copiedPix ? 'Chave PIX Copiada!' : 'Copiar Chave PIX'}</span>
                  </button>
                </div>
              </div>

              <button
                onClick={handleSimulatePayment}
                disabled={isProcessing}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-3 rounded-xl text-sm shadow-lg shadow-emerald-900/40 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Confirmando Pagamento PIX...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={16} />
                    <span>SIMULAR CONFIRMAÇÃO PIX ({formatPrice(servicePrice * 0.95)})</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* Credit Card view */}
          {selectedMethod === 'CREDIT_CARD' && (
            <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 space-y-3 text-xs">
              <div>
                <label className="block text-zinc-400 mb-1 font-medium">Número do Cartão:</label>
                <input
                  type="text"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-zinc-400 mb-1 font-medium">Validade:</label>
                  <input
                    type="text"
                    value={cardExpiry}
                    onChange={(e) => setCardExpiry(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1 font-medium">CVV:</label>
                  <input
                    type="text"
                    value={cardCvv}
                    onChange={(e) => setCardCvv(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <button
                onClick={handleSimulatePayment}
                disabled={isProcessing}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black py-3 rounded-xl text-sm shadow-lg shadow-indigo-900/40 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Processando Cartão...</span>
                  </>
                ) : (
                  <>
                    <Lock size={16} />
                    <span>PAGAR COM CARTÃO ({formatPrice(servicePrice)})</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* Cash / Local Payment view */}
          {selectedMethod === 'CASH' && (
            <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 space-y-3">
              <p className="text-xs text-zinc-300 leading-relaxed">
                Você optou por pagar diretamente ao profissional no momento do atendimento via <strong>Maquininha de Cartão</strong> ou <strong>Dinheiro em Espécie</strong>.
              </p>

              <button
                onClick={handleSimulatePayment}
                disabled={isProcessing}
                className="w-full bg-amber-600 hover:bg-amber-500 text-white font-black py-3 rounded-xl text-sm shadow-lg shadow-amber-900/40 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Registrando Opção no Local...</span>
                  </>
                ) : (
                  <>
                    <DollarSign size={16} />
                    <span>CONFIRMAR PAGAMENTO DIRETO AO SOCORRISTA</span>
                  </>
                )}
              </button>
            </div>
          )}

          <div className="flex items-center justify-center gap-1.5 text-[11px] text-zinc-500 pt-1">
            <Lock size={12} className="text-emerald-400" />
            <span>Ambiente seguro e criptografado de simulação de pagamento FIX</span>
          </div>

        </div>
      )}
    </div>
  );
};
