import React from 'react';
import { Calculator, ShieldCheck } from 'lucide-react';
import { PropertyListing } from '../types';

interface EstimatedMoveInCostProps {
  property: PropertyListing;
}

export const EstimatedMoveInCost: React.FC<EstimatedMoveInCostProps> = ({ property }) => {
  const {
    monthlyRent = 0,
    deposit,
    serviceCharge,
    waterDeposit,
    agentFee,
    otherFees
  } = property;

  // Build accurate breakdown strictly from defined, actual listing charges (> 0)
  const applicableFees: { label: string; amount: number; sublabel?: string }[] = [];

  if (typeof monthlyRent === 'number' && monthlyRent > 0) {
    applicableFees.push({
      label: 'First Month Rent',
      amount: monthlyRent
    });
  }

  if (typeof deposit === 'number' && deposit > 0) {
    applicableFees.push({
      label: 'Security Deposit (Refundable)',
      amount: deposit
    });
  }

  if (typeof serviceCharge === 'number' && serviceCharge > 0) {
    applicableFees.push({
      label: 'Service Charge (Garbage, Security & Caretaker)',
      amount: serviceCharge
    });
  }

  if (typeof waterDeposit === 'number' && waterDeposit > 0) {
    applicableFees.push({
      label: 'Water Meter Deposit',
      amount: waterDeposit
    });
  }

  if (typeof agentFee === 'number' && agentFee > 0) {
    applicableFees.push({
      label: 'Agent Facilitation Fee',
      amount: agentFee
    });
  }

  if (typeof otherFees === 'number' && otherFees > 0) {
    applicableFees.push({
      label: 'Key & Security Access Badge Deposit',
      amount: otherFees
    });
  }

  // Calculate accurate mathematical sum of all applicable listing charges
  const totalMoveIn = applicableFees.reduce((sum, item) => sum + item.amount, 0);

  return (
    <div
      id="estimated-move-in-card"
      className="bg-[#F7F3EC] dark:bg-[#151515] text-neutral-950 dark:text-[#F5F5F5] rounded-2xl p-5 sm:p-6 border border-[#E7DED2] dark:border-neutral-800 shadow-[5px_5px_12px_rgba(28,22,16,0.10),-5px_-5px_12px_rgba(255,255,255,0.92)] dark:shadow-[5px_5px_12px_rgba(0,0,0,0.45),-3px_-3px_8px_rgba(255,255,255,0.03)]"
    >
      <div className="flex items-start gap-3 pb-5 border-b border-[#E7DED2] dark:border-neutral-800">
        <div className="w-9 h-9 shrink-0 rounded-xl bg-[#F2E7D8] dark:bg-[#24201C] border border-[#E7DED2] dark:border-neutral-800 flex items-center justify-center text-[var(--rentike-bronze)]">
          <Calculator className="w-4 h-4" />
        </div>

        <div className="min-w-0">
          <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--rentike-bronze)] font-sans">
            Move-In Cost
          </span>

          <h3 className="mt-1 text-2xl sm:text-[26px] font-editorial font-semibold tracking-tight">
            Estimated Move-In Cost
          </h3>


        </div>
      </div>

      {/* Breakdown Items */}
      <div className="py-5 space-y-3 text-sm font-sans">
        {applicableFees.length === 0 ? (
          <div className="text-xs text-neutral-400 italic">
            Rent details to be confirmed with lister.
          </div>
        ) : (
          applicableFees.map((fee, idx) => (
            <div
              key={idx}
              className="flex items-start justify-between gap-3 py-3 border-b border-[#E7DED2] dark:border-neutral-800 last:border-b-0"
            >
              <div className="min-w-0">
                <span className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  {fee.label}
                </span>

                {fee.sublabel && (
                  <span className="block mt-0.5 text-[10px] text-neutral-500 dark:text-neutral-500">
                    {fee.sublabel}
                  </span>
                )}
              </div>

              <span className="font-bold text-sm text-neutral-950 dark:text-[#F5F5F5] shrink-0 whitespace-nowrap">
                KSh {fee.amount.toLocaleString()}
              </span>
            </div>
          ))
        )}
      </div>

      {/* Prominent Calculated Total */}
      <div className="mt-4 pt-4 border-t border-[#E7DED2] dark:border-neutral-800">

        <div className="rounded-2xl bg-[#F2E7D8]/70 dark:bg-[#1C1917] border border-[#E7DED2] dark:border-neutral-800 p-4">
          <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-neutral-500 dark:text-neutral-400 font-sans">
            Estimated Total
          </span>

          <div className="mt-1 flex items-baseline gap-1 font-editorial font-semibold">
            <span className="text-2xl text-neutral-950 dark:text-[#F5F5F5]">
              KSh
            </span>

            <span className="text-3xl sm:text-4xl font-bold text-[var(--rentike-bronze)]">
              {totalMoveIn.toLocaleString()}
            </span>
          </div>

          <p className="mt-1 text-[11px] text-neutral-500 dark:text-neutral-400 font-sans">
            Estimated amount required before move-in.
          </p>
        </div>

        <div className="mt-4 flex items-start gap-2 rounded-xl border border-[#E7DED2] dark:border-neutral-800 bg-white/40 dark:bg-white/[0.03] px-3 py-3">
          <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />

          <span className="text-[10px] leading-relaxed text-neutral-600 dark:text-neutral-400 font-sans">
            Verify all charges and the property before making any payment.
          </span>
        </div>

      </div>
    </div>
  );
};

