import React, { useState } from 'react';
import { X, CheckCircle2, AlertTriangle, Save, Loader2 } from 'lucide-react';
import { PropertyListing } from '../types';
import { useApp } from '../context/AppContext';

interface VacancyManagerModalProps {
  property: PropertyListing;
  onClose: () => void;
}

export const VacancyManagerModal: React.FC<VacancyManagerModalProps> = ({
  property,
  onClose
}) => {
  const { updatePropertyVacancies } = useApp();
  const [vacant, setVacant] = useState(property.vacancies);
  const [occupied, setOccupied] = useState(property.occupied);
  const [underRepair, setUnderRepair] = useState(property.underRepair);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const totalUnits = vacant + occupied + underRepair;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsSaving(true);

    try {
      const v = Math.max(0, parseInt(String(vacant), 10) || 0);
      const o = Math.max(0, parseInt(String(occupied), 10) || 0);
      const r = Math.max(0, parseInt(String(underRepair), 10) || 0);

      await updatePropertyVacancies(property.id, v, o, r);
      setSaved(true);
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err: any) {
      console.error('Failed to save availability:', err);
      setErrorMsg(err?.message || 'Failed to update availability. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs font-sans">
      <div className="bg-white dark:bg-[#111111] rounded-2xl max-w-md w-full p-6 shadow-2xl border border-neutral-200 dark:border-[#292929] animate-in zoom-in-95 duration-150 text-neutral-900 dark:text-[#F5F5F5]">
        <div className="flex items-center justify-between pb-4 border-b border-neutral-200 dark:border-[#262626]">
          <div>
            <h3 className="text-xl font-editorial font-semibold text-neutral-950 dark:text-[#F5F5F5] tracking-tight">
              Update Vacancy & Units
            </h3>
            <p className="text-xs text-neutral-500 dark:text-[#8A8A8A] font-sans">{property.name} ({property.type})</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="w-8 h-8 rounded-full hover:bg-neutral-100 dark:hover:bg-[#1E1E1E] flex items-center justify-center text-neutral-400 hover:text-neutral-900 dark:hover:text-white cursor-pointer disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {saved ? (
          <div className="py-8 text-center space-y-2 font-sans">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto animate-bounce" />
            <h4 className="text-2xl font-editorial font-semibold text-neutral-900 dark:text-[#F5F5F5]">Unit Counts Updated!</h4>
            <p className="text-xs text-neutral-500 dark:text-[#8A8A8A]">
              {vacant === 0
                ? 'Status is now "Fully Occupied" (hidden from public tenant map).'
                : `Active with ${vacant} units available for rent.`}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-4 pt-4 font-sans">
            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Vacant Count */}
            <div>
              <label className="block text-xs font-bold text-neutral-800 dark:text-[#E0E0E0] mb-1">
                Vacant Units (Available for Rent)
              </label>
              <input
                type="number"
                min="0"
                value={vacant}
                onChange={(e) => setVacant(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full px-3.5 py-2.5 bg-white dark:bg-[#151515] border border-neutral-300 dark:border-[#383838] rounded-xl text-base font-bold text-neutral-900 dark:text-[#F5F5F5] focus:ring-2 focus:ring-black dark:focus:ring-white focus:outline-none"
                required
                disabled={isSaving}
              />
              <p className="text-[11px] text-neutral-500 dark:text-[#8A8A8A] mt-1">
                When set to 0, property automatically becomes <strong>Fully Occupied</strong> and disappears from public search results.
              </p>
            </div>

            {/* Occupied Count */}
            <div>
              <label className="block text-xs font-bold text-neutral-800 dark:text-[#E0E0E0] mb-1">
                Occupied Units (Tenanted)
              </label>
              <input
                type="number"
                min="0"
                value={occupied}
                onChange={(e) => setOccupied(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full px-3.5 py-2.5 bg-white dark:bg-[#151515] border border-neutral-300 dark:border-[#383838] rounded-xl text-base font-bold text-neutral-900 dark:text-[#F5F5F5] focus:ring-2 focus:ring-black dark:focus:ring-white focus:outline-none"
                required
                disabled={isSaving}
              />
            </div>

            {/* Under Repair Count */}
            <div>
              <label className="block text-xs font-bold text-neutral-800 dark:text-[#E0E0E0] mb-1">
                Units Under Repair / Maintenance
              </label>
              <input
                type="number"
                min="0"
                value={underRepair}
                onChange={(e) => setUnderRepair(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full px-3.5 py-2.5 bg-white dark:bg-[#151515] border border-neutral-300 dark:border-[#383838] rounded-xl text-base font-bold text-neutral-900 dark:text-[#F5F5F5] focus:ring-2 focus:ring-black dark:focus:ring-white focus:outline-none"
                required
                disabled={isSaving}
              />
            </div>

            {/* Summary Box */}
            <div className="bg-neutral-100 dark:bg-[#181818] border border-neutral-200 dark:border-[#292929] p-3.5 rounded-xl flex items-center justify-between text-xs font-semibold">
              <span className="text-neutral-600 dark:text-[#A3A3A3]">Total Building Capacity:</span>
              <span className="text-sm font-bold text-black dark:text-white">{totalUnits} Units</span>
            </div>

            {vacant === 0 && (
              <div className="bg-neutral-50 dark:bg-[#181818] border border-neutral-300 dark:border-[#383838] text-neutral-900 dark:text-[#F5F5F5] p-3 rounded-xl flex items-center gap-2.5 text-xs">
                <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400" />
                <span>
                  Notice: Setting Vacant to 0 marks this listing as <strong>Fully Occupied</strong>.
                </span>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-100 dark:border-[#262626]">
              <button
                type="button"
                onClick={onClose}
                disabled={isSaving}
                className="px-4 py-2 text-xs font-bold text-neutral-600 dark:text-[#A3A3A3] hover:text-black dark:hover:text-white transition-colors cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-5 py-2.5 text-xs font-bold bg-black dark:bg-white text-white dark:text-black rounded-xl hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-all flex items-center gap-2 shadow-sm cursor-pointer disabled:opacity-60"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Saving to Convex...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Availability</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
