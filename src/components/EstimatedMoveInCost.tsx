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
    <div id="estimated-move-in-card" className="bg-neutral-900 dark:bg-[#111111] text-white rounded-3xl p-6 sm:p-7 shadow-xl w-full min-w-0 border border-neutral-800 dark:border-[#292929] transition-colors">
      <div className="flex items-center justify-between pb-4 border-b border-neutral-800 dark:border-[#262626] gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-neutral-800 dark:bg-[#1E1E1E] flex items-center justify-center text-white shrink-0 border border-transparent dark:border-[#333333]">
            <Calculator className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h3 className="text-2xl sm:text-[26px] font-editorial font-semibold text-white tracking-tight truncate">
              Estimated Move-In Cost
            </h3>
            <p className="text-xs text-neutral-400 font-sans truncate">Total upfront payment required before key handover</p>
          </div>
        </div>
        <span className="text-xs font-semibold font-sans px-2.5 py-1 bg-neutral-800 dark:bg-[#1E1E1E] rounded-full text-neutral-300 border border-neutral-700 dark:border-[#333333] shrink-0 hidden sm:inline-block">
          Kenyan Shillings (KSh)
        </span>
      </div>

      {/* Breakdown Items */}
      <div className="py-5 space-y-3 text-sm font-sans">
        {applicableFees.length === 0 ? (
          <div className="text-xs text-neutral-400 italic">
            Rent details to be confirmed with lister.
          </div>
        ) : (
          applicableFees.map((fee, idx) => (
            <div key={idx} className="flex items-center justify-between gap-3 text-neutral-300">
              <span className="truncate">{fee.label}</span>
              <span className="font-semibold text-white shrink-0 whitespace-nowrap">
                KSh {fee.amount.toLocaleString()}
              </span>
            </div>
          ))
        )}
      </div>

      {/* Prominent Calculated Total */}
      <div className="pt-4 border-t border-neutral-800 dark:border-[#262626] flex items-baseline justify-between gap-3">
        <div className="min-w-0 font-sans">
          <span className="text-xs font-bold uppercase tracking-wider text-neutral-400 block truncate">
            Total Move-In Estimate
          </span>
          <span className="text-xs text-neutral-500">Payable directly upon lease agreement</span>
        </div>
        <div className="text-right shrink-0">
          <span className="text-3xl sm:text-4xl font-editorial font-semibold text-white tracking-tight">
            KSh {totalMoveIn.toLocaleString()}
          </span>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-neutral-800/60 dark:border-[#262626]/80 flex items-center gap-2 text-[11px] font-sans text-neutral-400">
        <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
        <span>No unofficial viewing fees. Always verify the premises before paying deposits.</span>
      </div>
    </div>
  );
};

