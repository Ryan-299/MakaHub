import React, { useState } from 'react';
import { X, Smartphone, CreditCard, ShieldCheck, AlertTriangle, Info, Check, Sparkles } from 'lucide-react';
import { ListerSubscriptionPlan, PaymentMethodOption } from '../types';

interface SubscriptionCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPlan: ListerSubscriptionPlan;
  currentActiveListings: number;
  userPhone?: string;
  userName?: string;
}

export const SubscriptionCheckoutModal: React.FC<SubscriptionCheckoutModalProps> = ({
  isOpen,
  onClose,
  selectedPlan,
  currentActiveListings,
  userPhone = '',
  userName = 'Mary Wanjiku'
}) => {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodOption>('mpesa');
  const [phoneNumber, setPhoneNumber] = useState(() => {
    const cleaned = userPhone.replace(/\s+/g, '');

    if (cleaned.startsWith('+254')) {
      return `0${cleaned.slice(4)}`;
    }

    if (cleaned.startsWith('254')) {
      return `0${cleaned.slice(3)}`;
    }

    return cleaned;
  });
  const [cardHolder, setCardHolder] = useState(userName);
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [promptSentNotice, setPromptSentNotice] = useState<string | null>(null);

  if (!isOpen) return null;

  const isDowngradeExcess = currentActiveListings > selectedPlan.maxListings;

  const handleMpesaPrompt = (e: React.FormEvent) => {
    e.preventDefault();
    setPromptSentNotice(
      'Payment integration will be connected during backend development.'
    );
  };

  const handleCardPayment = (e: React.FormEvent) => {
    e.preventDefault();
    setPromptSentNotice(
      'Payment integration will be connected during backend development.'
    );
  };

  return (
    <div
      id="subscription-checkout-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto font-sans"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white dark:bg-[#111111] rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-neutral-200 dark:border-[#292929] relative my-8 text-neutral-900 dark:text-[#F5F5F5] animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-neutral-400 dark:text-[#8A8A8A] hover:text-black dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-[#1E1E1E] transition-colors cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="space-y-1 pb-4 border-b border-neutral-100 dark:border-[#222222] pr-8">
          <div className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider bg-neutral-100 dark:bg-[#1E1E1E] text-neutral-800 dark:text-[#D5D5D5] px-2.5 py-0.5 rounded-md border border-neutral-200 dark:border-[#303030]">
            <span>Checkout Prototype</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-editorial font-semibold text-neutral-950 dark:text-[#F5F5F5] tracking-tight">
            Subscribe to {selectedPlan.name} Plan
          </h2>
          <p className="text-xs text-neutral-500 dark:text-[#8A8A8A]">
            Frontend demonstration of MakaoHub's landlord subscription flow
          </p>
        </div>

        {/* Plan Summary Card */}
        <div className="mt-4 p-4.5 bg-neutral-50 dark:bg-[#161616] rounded-2xl border border-neutral-200 dark:border-[#292929] space-y-3">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base text-neutral-950 dark:text-[#F5F5F5] uppercase tracking-wide">
                  {selectedPlan.name} Plan
                </span>
                {selectedPlan.popular && (
                  <span className="bg-black dark:bg-white text-white dark:text-black text-[10px] font-bold px-2 py-0.5 rounded-full">
                    Most Popular
                  </span>
                )}
              </div>
              <p className="text-xs text-neutral-600 dark:text-[#A3A3A3] mt-0.5">
                {selectedPlan.minListings}–{selectedPlan.maxListings} active listings allowance
              </p>
            </div>
            <div className="text-right">
              <div className="text-lg font-black font-editorial text-neutral-950 dark:text-[#F5F5F5]">
                KSh {selectedPlan.monthlyPrice.toLocaleString()}
              </div>
              <span className="text-[11px] text-neutral-500 dark:text-[#8A8A8A]">/ month</span>
            </div>
          </div>

          <div className="pt-2.5 border-t border-neutral-200/80 dark:border-[#262626] flex items-center justify-between text-xs font-semibold">
            <span className="text-neutral-600 dark:text-[#A3A3A3]">Amount Due Today:</span>
            <span className="text-neutral-950 dark:text-[#F5F5F5] font-bold text-sm">
              KSh {selectedPlan.monthlyPrice.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Downgrade Limit Warning */}
        {isDowngradeExcess && (
          <div className="mt-4 p-3.5 bg-neutral-50 dark:bg-[#1A1A1A] border border-neutral-300 dark:border-[#383838] rounded-2xl flex items-start gap-2.5 text-xs text-neutral-900 dark:text-[#F5F5F5]">
            <AlertTriangle className="w-4 h-4 text-neutral-700 dark:text-[#D5D5D5] shrink-0 mt-0.5" />
            <div>
              <strong className="block font-bold">Active Listings Exceed Plan Capacity</strong>
              <p className="text-neutral-700 dark:text-[#A3A3A3] mt-0.5">
                You currently have {currentActiveListings} active listings. {selectedPlan.name} supports up to{' '}
                {selectedPlan.maxListings} active listings. You will need to reduce your active listings before switching to {selectedPlan.name}.
              </p>
            </div>
          </div>
        )}

        {/* Payment Method Selector */}
        <div className="mt-6 space-y-3">
          <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-[#8A8A8A]">
            Select Payment Method
          </label>

          <div className="grid grid-cols-3 gap-2">
            {/* 1. M-PESA */}
            <button
              type="button"
              id="payment-method-mpesa"
              onClick={() => {
                setPaymentMethod('mpesa');
                setPromptSentNotice(null);
              }}
              className={`p-3 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1.5 ${paymentMethod === 'mpesa'
                  ? 'bg-neutral-950 dark:bg-[#1E1E1E] text-white border-neutral-950 dark:border-white ring-2 ring-neutral-950/20 dark:ring-white/20 shadow-xs'
                  : 'bg-white dark:bg-[#141414] text-neutral-700 dark:text-[#D5D5D5] border-neutral-200 dark:border-[#2A2A2A] hover:border-neutral-400 dark:hover:border-neutral-500 hover:bg-neutral-50 dark:hover:bg-[#1A1A1A]'
                }`}
            >
              <Smartphone className="w-4 h-4" />
              <span className="text-xs font-bold">M-PESA</span>
              <span className={`text-[9px] px-1.5 py-0.2 rounded font-semibold ${paymentMethod === 'mpesa' ? 'bg-emerald-500 text-white' : 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-400'
                }`}>
                Recommended
              </span>
            </button>

            {/* 2. Debit / Credit Card */}
            <button
              type="button"
              id="payment-method-card"
              onClick={() => {
                setPaymentMethod('card');
                setPromptSentNotice(null);
              }}
              className={`p-3 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1.5 ${paymentMethod === 'card'
                  ? 'bg-neutral-950 dark:bg-[#1E1E1E] text-white border-neutral-950 dark:border-white ring-2 ring-neutral-950/20 dark:ring-white/20 shadow-xs'
                  : 'bg-white dark:bg-[#141414] text-neutral-700 dark:text-[#D5D5D5] border-neutral-200 dark:border-[#2A2A2A] hover:border-neutral-400 dark:hover:border-neutral-500 hover:bg-neutral-50 dark:hover:bg-[#1A1A1A]'
                }`}
            >
              <CreditCard className="w-4 h-4" />
              <span className="text-xs font-bold">Card</span>
              <span className="text-[9px] text-neutral-400 dark:text-[#7D7D7D] font-normal">Visa / MC</span>
            </button>

            {/* 3. Google Pay */}
            <button
              type="button"
              id="payment-method-gpay"
              onClick={() => {
                setPaymentMethod('google_pay');
                setPromptSentNotice(null);
              }}
              className={`p-3 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1.5 ${paymentMethod === 'google_pay'
                  ? 'bg-neutral-950 dark:bg-[#1E1E1E] text-white border-neutral-950 dark:border-white ring-2 ring-neutral-950/20 dark:ring-white/20 shadow-xs'
                  : 'bg-white dark:bg-[#141414] text-neutral-700 dark:text-[#D5D5D5] border-neutral-200 dark:border-[#2A2A2A] hover:border-neutral-400 dark:hover:border-neutral-500 hover:bg-neutral-50 dark:hover:bg-[#1A1A1A]'
                }`}
            >
              <Sparkles className="w-4 h-4" />
              <span className="text-xs font-bold">Google Pay</span>
              <span className="text-[9px] text-neutral-400 dark:text-[#7D7D7D] font-normal">Provider Ready</span>
            </button>
          </div>
        </div>

        {/* Method Detail Section */}
        <div className="mt-5 pt-4 border-t border-neutral-100 dark:border-[#222222]">
          {/* Method 1: M-PESA Form */}
          {paymentMethod === 'mpesa' && (
            <form onSubmit={handleMpesaPrompt} className="space-y-4">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-neutral-800 dark:text-[#D5D5D5]">
                    Safaricom M-PESA Phone Number
                  </label>
                  <span className="text-[10px] text-neutral-500 dark:text-[#8A8A8A] font-medium">Kenya (07XX / 01XX)</span>
                </div>
                <div className="relative">
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="0712 345 678"
                    className="w-full px-4 py-2.5 bg-white dark:bg-[#151515] border border-neutral-300 dark:border-[#383838] text-neutral-900 dark:text-[#F5F5F5] rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                    required
                  />
                </div>
                <p className="text-[11px] text-neutral-500 dark:text-[#8A8A8A]">
                  Pay using your Safaricom M-PESA number. An STK push prompt will appear on your phone.
                </p>
              </div>

              <button
                type="submit"
                id="btn-send-mpesa-prompt"
                disabled={isDowngradeExcess}
                className={`w-full py-3 px-4 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer ${isDowngradeExcess
                    ? 'bg-neutral-200 dark:bg-[#252525] text-neutral-400 dark:text-[#666666] cursor-not-allowed'
                    : 'bg-black dark:bg-white hover:bg-neutral-800 dark:hover:bg-neutral-200 text-white dark:text-black shadow-sm'
                  }`}
              >
                <Smartphone className="w-4 h-4" />
                <span>Send M-PESA Payment Prompt (KSh {selectedPlan.monthlyPrice.toLocaleString()})</span>
              </button>
            </form>
          )}

          {/* Method 2: Debit / Credit Card Form */}
          {paymentMethod === 'card' && (
            <form onSubmit={handleCardPayment} className="space-y-3">
              <div className="flex items-center justify-between pb-1">
                <span className="text-xs text-neutral-500 dark:text-[#8A8A8A] font-semibold">Accepted Cards:</span>
                <div className="flex items-center gap-2 text-xs font-bold">
                  <span className="bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300 px-2 py-0.5 rounded border border-blue-200 dark:border-blue-900/50">Visa</span>
                  <span className="bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-900/50">Mastercard</span>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-neutral-700 dark:text-[#D5D5D5]">Cardholder Name</label>
                <input
                  type="text"
                  value={cardHolder}
                  onChange={(e) => setCardHolder(e.target.value)}
                  placeholder="Name on card"
                  className="w-full px-3.5 py-2 bg-white dark:bg-[#151515] border border-neutral-300 dark:border-[#383838] text-neutral-900 dark:text-[#F5F5F5] rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-neutral-700 dark:text-[#D5D5D5]">Card Number</label>
                <input
                  type="text"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  placeholder="4000 1234 5678 9010"
                  maxLength={19}
                  className="w-full px-3.5 py-2 bg-white dark:bg-[#151515] border border-neutral-300 dark:border-[#383838] text-neutral-900 dark:text-[#F5F5F5] rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-neutral-700 dark:text-[#D5D5D5]">Expiry (MM/YY)</label>
                  <input
                    type="text"
                    value={cardExpiry}
                    onChange={(e) => setCardExpiry(e.target.value)}
                    placeholder="08/28"
                    maxLength={5}
                    className="w-full px-3.5 py-2 bg-white dark:bg-[#151515] border border-neutral-300 dark:border-[#383838] text-neutral-900 dark:text-[#F5F5F5] rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-neutral-700 dark:text-[#D5D5D5]">CVV</label>
                  <input
                    type="password"
                    value={cardCvv}
                    onChange={(e) => setCardCvv(e.target.value)}
                    placeholder="123"
                    maxLength={4}
                    className="w-full px-3.5 py-2 bg-white dark:bg-[#151515] border border-neutral-300 dark:border-[#383838] text-neutral-900 dark:text-[#F5F5F5] rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                  />
                </div>
              </div>

              <p className="text-[10px] text-neutral-400 dark:text-[#7D7D7D]">
                Visual prototype fields only. Card details are never stored or processed.
              </p>

              <button
                type="submit"
                id="btn-pay-card"
                disabled={isDowngradeExcess}
                className={`w-full py-3 px-4 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer ${isDowngradeExcess
                    ? 'bg-neutral-200 dark:bg-[#252525] text-neutral-400 dark:text-[#666666] cursor-not-allowed'
                    : 'bg-black dark:bg-white hover:bg-neutral-800 dark:hover:bg-neutral-200 text-white dark:text-black shadow-sm'
                  }`}
              >
                <CreditCard className="w-4 h-4" />
                <span>Pay KSh {selectedPlan.monthlyPrice.toLocaleString()} with Card</span>
              </button>
            </form>
          )}

          {/* Method 3: Google Pay */}
          {paymentMethod === 'google_pay' && (
            <div className="space-y-4 py-2">
              <div className="p-4 bg-neutral-50 dark:bg-[#161616] rounded-2xl border border-neutral-200 dark:border-[#292929] text-center space-y-2">
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white dark:bg-[#222222] border border-neutral-200 dark:border-[#333333] shadow-2xs">
                  <Sparkles className="w-5 h-5 text-neutral-800 dark:text-white" />
                </div>
                <h4 className="font-bold text-sm text-neutral-950 dark:text-[#F5F5F5]">Google Pay</h4>
                <p className="text-xs text-neutral-600 dark:text-[#A3A3A3]">
                  Available when supported by the payment provider.
                </p>
                <p className="text-[11px] text-neutral-400 dark:text-[#7D7D7D]">
                  Fast, encrypted checkout will activate when production provider tokens are initialized.
                </p>
              </div>

              <button
                type="button"
                id="btn-pay-gpay"
                disabled={isDowngradeExcess}
                onClick={() =>
                  setPromptSentNotice(
                    'Payment integration will be connected during backend development.'
                  )
                }
                className={`w-full py-3 px-4 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer ${isDowngradeExcess
                    ? 'bg-neutral-200 dark:bg-[#252525] text-neutral-400 dark:text-[#666666] cursor-not-allowed'
                    : 'bg-black dark:bg-white hover:bg-neutral-800 dark:hover:bg-neutral-200 text-white dark:text-black shadow-sm'
                  }`}
              >
                <span>Continue with Google Pay</span>
              </button>
            </div>
          )}
        </div>

        {/* Development Prototype Feedback Notice */}
        {promptSentNotice && (
          <div
            id="checkout-prototype-notice"
            className="mt-4 p-4 bg-neutral-900 dark:bg-[#1C1C1C] text-white rounded-2xl space-y-2 animate-in fade-in border border-neutral-800 dark:border-[#333333]"
          >
            <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
              <Info className="w-4 h-4 shrink-0" />
              <span>Prototype Flow Notice</span>
            </div>
            <p className="text-xs text-neutral-200 dark:text-[#D5D5D5] leading-relaxed font-medium">
              {promptSentNotice}
            </p>
            <div className="pt-2 border-t border-neutral-800 dark:border-[#2C2C2C] flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className="text-xs font-bold bg-white text-black px-3.5 py-1.5 rounded-lg hover:bg-neutral-100 transition-colors cursor-pointer"
              >
                Close Window
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
