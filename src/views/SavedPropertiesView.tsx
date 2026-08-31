import React from 'react';
import { Heart, ArrowLeft, Search, Building } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PropertyCard } from '../components/PropertyCard';

export const SavedPropertiesView: React.FC = () => {
  const { savedProperties = [], setCurrentView } = useApp();

  return (
    <div id="saved-properties-view" className="min-h-[calc(100vh-4rem)] bg-white dark:bg-black pb-24 text-neutral-900 dark:text-[#F5F5F5] font-sans transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 space-y-6 sm:space-y-8">
        {/* Header Bar */}
        <div className="flex items-center justify-between pb-4 border-b border-neutral-200 dark:border-[#262626]">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setCurrentView('tenant-home')}
              className="p-2.5 rounded-xl border border-neutral-200 dark:border-[#303030] hover:border-black dark:hover:border-white text-neutral-600 dark:text-[#F5F5F5] hover:text-black bg-white dark:bg-[#111111] transition-colors cursor-pointer shadow-2xs"
              title="Back to Discover Homes"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-editorial font-semibold text-neutral-950 dark:text-[#F5F5F5] tracking-tight">
                Saved Properties
              </h1>
              <p className="text-xs sm:text-sm font-sans text-neutral-500 dark:text-[#A3A3A3] mt-0.5">
                {savedProperties.length} saved rental {savedProperties.length === 1 ? 'property' : 'properties'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setCurrentView('tenant-home')}
            className="hidden sm:flex items-center gap-2 px-4 py-2 bg-white dark:bg-[#111111] text-neutral-900 dark:text-[#F5F5F5] border border-neutral-300 dark:border-[#303030] text-xs font-bold font-sans rounded-xl hover:border-black dark:hover:border-white transition-all cursor-pointer shadow-2xs"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Discover More Homes</span>
          </button>
        </div>

        {/* Empty State */}
        {savedProperties.length === 0 ? (
          <div className="bg-white dark:bg-[#111111] rounded-3xl p-12 sm:p-16 text-center border border-neutral-200 dark:border-[#2A2A2A] max-w-lg mx-auto space-y-4 shadow-xs font-sans">
            <div className="w-14 h-14 rounded-2xl bg-neutral-100 dark:bg-[#181818] border border-neutral-200 dark:border-[#303030] flex items-center justify-center mx-auto text-neutral-400 dark:text-[#F5F5F5]">
              <Heart className="w-7 h-7" />
            </div>
            <h3 className="text-2xl font-editorial font-semibold text-neutral-950 dark:text-[#F5F5F5]">No saved homes yet</h3>
            <p className="text-xs sm:text-sm font-sans text-neutral-500 dark:text-[#A3A3A3] leading-relaxed">
              Tap the heart icon on any rental property card to save it for quick comparison and easy access.
            </p>
            <button
              type="button"
              onClick={() => setCurrentView('tenant-home')}
              className="px-6 py-3 bg-black dark:bg-[#F5F5F5] hover:bg-neutral-800 dark:hover:bg-white text-white dark:text-[#111111] text-xs sm:text-sm font-bold font-sans rounded-xl transition-all shadow-md inline-flex items-center gap-2 cursor-pointer"
            >
              <Building className="w-4 h-4" />
              <span>Browse Available Rentals</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-5 lg:gap-6 font-sans">
            {savedProperties.map((prop) => (
              <PropertyCard key={prop.id} property={prop} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
