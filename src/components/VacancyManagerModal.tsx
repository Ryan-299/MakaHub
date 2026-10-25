
import React, { useState } from 'react';
import {
  X,
  CheckCircle2,
  AlertTriangle,
  Save,
  Loader2,
  Home,
  KeyRound,
  Wrench,
  Building2
} from 'lucide-react';
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
      setErrorMsg(
        err?.message ||
        'Failed to update availability. Please try again.'
      );
    } finally {
      setIsSaving(false);
    }
  };

  const inputClassName = `
    w-full min-w-0
    rounded-xl
    px-3 py-2.5
    bg-[#F7F3EC] dark:bg-[#151515]
    border border-[#E2D3C2] dark:border-[#40362E]
    text-[#242424] dark:text-[#F5F1E8]
    text-base font-extrabold
    shadow-[inset_2px_2px_5px_rgba(104,73,43,0.08)]
    dark:shadow-[inset_2px_2px_5px_rgba(0,0,0,0.35)]
    focus:outline-none
    focus:border-[#C49A6C]
    focus:ring-2 focus:ring-[#C49A6C]/25
    transition-all
    disabled:opacity-50
  `;

  const fieldClassName = `
    rounded-2xl
    p-3 sm:p-3.5
    bg-[#F7F3EC] dark:bg-[#202020]
    border border-[#E9DCCE] dark:border-[#38322D]
    shadow-[3px_3px_8px_rgba(0,0,0,0.06),-2px_-2px_7px_rgba(255,255,255,0.85)]
    dark:shadow-[3px_3px_9px_rgba(0,0,0,0.4)]
  `;

  return (
    <div
      className="
        fixed inset-0 z-50
        flex items-center justify-center
        overflow-y-auto
        p-3 sm:p-5
        bg-black/65 backdrop-blur-sm
        font-manrope
      "
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="vacancy-modal-title"
        className="
          w-full max-w-md
          max-h-[calc(100dvh-1.5rem)]
          overflow-y-auto
          rounded-[24px]
          bg-[#F7F3EC] dark:bg-[#181818]
          text-[#242424] dark:text-[#F5F1E8]
          border border-[#E5D6C5] dark:border-[#39312A]
          shadow-[0_24px_70px_rgba(0,0,0,0.25)]
          dark:shadow-[0_24px_70px_rgba(0,0,0,0.65)]
          p-4 sm:p-6
          animate-in zoom-in-95 duration-150
        "
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 pb-4 border-b border-[#E5D6C5] dark:border-[#38322D]">
          <div className="min-w-0">
            <h3
              id="vacancy-modal-title"
              className="
                text-2xl sm:text-[28px]
                font-editorial font-semibold
                leading-tight
                text-[#242424] dark:text-[#F5F1E8]
              "
            >
              Update <span className="text-[#946B46] dark:text-[#C49A6C]">Availability</span>
            </h3>

            <p className="mt-1 text-[11px] sm:text-xs text-[#77716C] dark:text-[#A3A3A3] truncate">
              {property.name} · {property.type}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            aria-label="Close availability editor"
            className="
              shrink-0
              w-9 h-9
              flex items-center justify-center
              rounded-full
              bg-[#F7F3EC] dark:bg-[#242424]
              border border-[#E2D3C2] dark:border-[#40362E]
              text-[#77716C] dark:text-[#A3A3A3]
              hover:text-[#242424] dark:hover:text-white
              shadow-[2px_2px_6px_rgba(0,0,0,0.08),-2px_-2px_6px_rgba(255,255,255,0.8)]
              dark:shadow-[2px_2px_6px_rgba(0,0,0,0.4)]
              transition-all cursor-pointer
              disabled:opacity-50
            "
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {saved ? (
          /* Success state */
          <div className="py-10 text-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-[#E3F3E8] dark:bg-[#173B2B] flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8 text-[#267147] dark:text-[#79D6A2]" />
            </div>

            <h4 className="text-2xl font-editorial font-semibold">
              Availability Updated!
            </h4>

            <p className="text-xs leading-relaxed text-[#77716C] dark:text-[#A3A3A3] max-w-xs mx-auto">
              {vacant === 0
                ? 'Status is now "Fully Occupied" (hidden from public tenant map).'
                : `Active with ${vacant} units available for rent.`}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-3.5 pt-4">

            {errorMsg && (
              <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Vacant units */}
            <div className={fieldClassName}>
              <label
                htmlFor="vacant-units"
                className="flex items-center gap-2 mb-2 text-xs font-bold text-[#242424] dark:text-[#F5F1E8]"
              >
                <Home className="w-4 h-4 text-[#267147] dark:text-[#79D6A2]" />
                Vacant Units
              </label>

              <input
                id="vacant-units"
                type="number"
                min="0"
                value={vacant}
                onChange={(e) =>
                  setVacant(Math.max(0, parseInt(e.target.value) || 0))
                }
                className={inputClassName}
                required
                disabled={isSaving}
              />

              <p className="text-[10px] mt-2 text-[#77716C] dark:text-[#A3A3A3]">
                Available for rent
              </p>
            </div>

            {/* Occupied units */}
            <div className={fieldClassName}>
              <label
                htmlFor="occupied-units"
                className="flex items-center gap-2 mb-2 text-xs font-bold text-[#242424] dark:text-[#F5F1E8]"
              >
                <KeyRound className="w-4 h-4 text-[#946B46] dark:text-[#C49A6C]" />
                Occupied Units
              </label>

              <input
                id="occupied-units"
                type="number"
                min="0"
                value={occupied}
                onChange={(e) =>
                  setOccupied(Math.max(0, parseInt(e.target.value) || 0))
                }
                className={inputClassName}
                required
                disabled={isSaving}
              />

              <p className="text-[10px] mt-2 text-[#77716C] dark:text-[#A3A3A3]">
                Currently rented
              </p>
            </div>

            {/* Units under repair */}
            <div className={fieldClassName}>
              <label
                htmlFor="repair-units"
                className="flex items-center gap-2 mb-2 text-xs font-bold text-[#242424] dark:text-[#F5F1E8]"
              >
                <Wrench className="w-4 h-4 text-[#77716C] dark:text-[#A3A3A3]" />
                Under Repair
              </label>

              <input
                id="repair-units"
                type="number"
                min="0"
                value={underRepair}
                onChange={(e) =>
                  setUnderRepair(
                    Math.max(0, parseInt(e.target.value) || 0)
                  )
                }
                className={inputClassName}
                required
                disabled={isSaving}
              />

              <p className="text-[10px] mt-2 text-[#77716C] dark:text-[#A3A3A3]">
                Under maintenance or unavailable
              </p>
            </div>

            {/* Total capacity */}
            <div
              className="
                flex items-center justify-between gap-3
                px-3.5 py-3
                rounded-xl
                bg-[#EBDFD0] dark:bg-[#352A21]
                border border-[#D8BFA5] dark:border-[#57402D]
              "
            >
              <div className="flex items-center gap-2 min-w-0">
                <Building2 className="w-4 h-4 shrink-0 text-[#946B46] dark:text-[#C49A6C]" />
                <span className="text-xs font-semibold text-[#65513F] dark:text-[#D9C1A8]">
                  Total Property Capacity
                </span>
              </div>

              <span className="text-sm font-extrabold text-[#946B46] dark:text-[#C49A6C] whitespace-nowrap">
                {totalUnits} Units
              </span>
            </div>

            {/* Fully occupied warning */}
            {vacant === 0 && (
              <div
                className="
                  flex items-start gap-2.5
                  p-3 rounded-xl
                  bg-[#FFF0D4] dark:bg-[#3C2D16]
                  border border-[#F0DBB4] dark:border-[#66502B]
                  text-[#986615] dark:text-[#E8BE75]
                  text-[11px] leading-relaxed
                "
              >
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />

                <span>
                  Setting vacant units to 0 marks this property as{' '}
                  <strong>Fully Occupied</strong> and removes it from
                  public search results.
                </span>
              </div>
            )}

            {/* Footer actions */}
            <div className="grid grid-cols-3 gap-2.5 pt-4 border-t border-[#E5D6C5] dark:border-[#38322D]">
              <button
                type="button"
                onClick={onClose}
                disabled={isSaving}
                className="
                  col-span-1
                  rounded-xl
                  px-3 py-2.5
                  bg-[#F7F3EC] dark:bg-[#242424]
                  text-[#65513F] dark:text-[#D9C1A8]
                  border border-[#E2D3C2] dark:border-[#40362E]
                  shadow-[3px_3px_7px_rgba(0,0,0,0.07),-2px_-2px_6px_rgba(255,255,255,0.8)]
                  dark:shadow-[3px_3px_8px_rgba(0,0,0,0.4)]
                  text-xs font-bold
                  hover:border-[#C49A6C]
                  transition-all cursor-pointer
                  disabled:opacity-50
                "
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSaving}
                className="
                  col-span-2
                  flex items-center justify-center gap-2
                  rounded-xl
                  px-3 py-2.5
                 bg-[#946B46] dark:bg-[#805B3B]
text-white dark:text-white
                  border border-[#805B3B] dark:border-[#C49A6C]
                  shadow-[3px_4px_9px_rgba(104,73,43,0.22)]
                  dark:shadow-[3px_4px_9px_rgba(0,0,0,0.45)]
                  hover:bg-[#805B3B] dark:hover:bg-[#946B46]
                  active:scale-[0.98]
                  transition-all
                  text-xs font-bold
                  cursor-pointer
                  disabled:opacity-60
                "
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 shrink-0" />
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
