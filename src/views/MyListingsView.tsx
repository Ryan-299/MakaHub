import React, { useState, useMemo } from 'react';
import {
  Building2,
  PlusCircle,
  Key,
  Eye,
  Edit,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  SlidersHorizontal,
  ExternalLink,
  Video,
  Trash2,
  AlertOctagon,
  X
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PropertyListing } from '../types';
import { VacancyManagerModal } from '../components/VacancyManagerModal';

export const MyListingsView: React.FC = () => {
  const {
    listerListings = [],
    listerListingsFilter = 'all',
    setListerListingsFilter,
    setCurrentView,
    setSelectedPropertyId,
    setEditingPropertyId,
    deletePropertyListing,
    deleteAllMyListings
  } = useApp();

  const [selectedForVacancy, setSelectedForVacancy] = useState<PropertyListing | null>(null);
  const [propertyToDelete, setPropertyToDelete] = useState<PropertyListing | null>(null);
  const [showDeleteAllConfirm, setShowDeleteAllConfirm] = useState(false);

  const activeCount = useMemo(
    () => listerListings.filter((p) => p.status === 'Approved').length,
    [listerListings]
  );
  const vacantCount = useMemo(
    () => listerListings.filter((p) => p.vacancies > 0).length,
    [listerListings]
  );

  const displayedListings = useMemo(() => {
    if (listerListingsFilter === 'active') {
      return listerListings.filter((p) => p.status === 'Approved');
    }
    if (listerListingsFilter === 'vacancies') {
      return listerListings.filter((p) => p.vacancies > 0);
    }
    return listerListings;
  }, [listerListings, listerListingsFilter]);

  const handleEdit = (propId: string) => {
    setEditingPropertyId(propId);
    setCurrentView('add-property');
  };

  const handleAddNew = () => {
    setEditingPropertyId(null);
    setCurrentView('add-property');
  };

  const confirmDeleteOne = () => {
    if (propertyToDelete) {
      deletePropertyListing(propertyToDelete.id);
      setPropertyToDelete(null);
    }
  };

  const confirmDeleteAll = () => {
    deleteAllMyListings();
    setShowDeleteAllConfirm(false);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-white dark:bg-[#000000] pb-24 text-neutral-900 dark:text-[#F5F5F5] font-sans transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-6 sm:pt-8 space-y-6 sm:space-y-8">
        {/* Header (Section 36) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-neutral-200 dark:border-[#262626]">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setCurrentView('lister-dashboard')}
              className="p-2 rounded-xl border border-neutral-200 dark:border-[#292929] hover:border-black dark:hover:border-white text-neutral-600 dark:text-[#A3A3A3] hover:text-black dark:hover:text-white transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h1 className="text-2xl sm:text-3xl font-editorial font-semibold text-neutral-950 dark:text-[#F5F5F5] tracking-tight">
                My Properties & Vacancy Manager
              </h1>
              <p className="text-xs sm:text-sm text-neutral-500 dark:text-[#8A8A8A]">
                Manage unit occupancy, availability, and rental pricing ({listerListings.length}{' '}
                {listerListings.length === 1 ? 'property' : 'properties'})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap self-start sm:self-auto">
            {listerListings.length > 0 && (
              <button
                type="button"
                onClick={() => setShowDeleteAllConfirm(true)}
                className="border border-red-200 dark:border-red-900/60 hover:border-red-500 dark:hover:border-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 text-red-600 dark:text-red-400 font-bold px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete All My Listings</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleAddNew}
              className="bg-black hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200 text-white font-bold px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs transition-all shadow-sm flex items-center gap-2 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>+ Add New Listing</span>
            </button>
          </div>
        </div>

        {/* Filter Tabs */}
        {listerListings.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <button
              type="button"
              id="filter-tab-all"
              onClick={() => setListerListingsFilter('all')}
              className={`px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                listerListingsFilter === 'all'
                  ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs'
                  : 'bg-neutral-100 dark:bg-[#181818] text-neutral-600 dark:text-[#A3A3A3] hover:text-black dark:hover:text-white border border-neutral-200 dark:border-[#292929]'
              }`}
            >
              All Listings ({listerListings.length})
            </button>

            <button
              type="button"
              id="filter-tab-active"
              onClick={() => setListerListingsFilter('active')}
              className={`px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                listerListingsFilter === 'active'
                  ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs'
                  : 'bg-neutral-100 dark:bg-[#181818] text-neutral-600 dark:text-[#A3A3A3] hover:text-black dark:hover:text-white border border-neutral-200 dark:border-[#292929]'
              }`}
            >
              Active / Approved ({activeCount})
            </button>

            <button
              type="button"
              id="filter-tab-vacancies"
              onClick={() => setListerListingsFilter('vacancies')}
              className={`px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                listerListingsFilter === 'vacancies'
                  ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs'
                  : 'bg-neutral-100 dark:bg-[#181818] text-neutral-600 dark:text-[#A3A3A3] hover:text-black dark:hover:text-white border border-neutral-200 dark:border-[#292929]'
              }`}
            >
              Has Vacancies ({vacantCount})
            </button>
          </div>
        )}

        {/* Listings 2-Column Grid */}
        <div>
          {listerListings.length === 0 ? (
            <div className="bg-white dark:bg-[#111111] rounded-3xl p-12 text-center border border-neutral-200 dark:border-[#292929] space-y-4">
              <Building2 className="w-12 h-12 text-neutral-400 dark:text-[#7D7D7D] mx-auto" />
              <h3 className="text-lg font-bold text-neutral-900 dark:text-[#F5F5F5]">No properties listed yet</h3>
              <p className="text-xs text-neutral-500 dark:text-[#8A8A8A] max-w-sm mx-auto">
                You currently have 0 active listings. List your first residential property to start receiving verified tenant enquiries.
              </p>
              <button
                type="button"
                onClick={handleAddNew}
                className="px-5 py-2.5 bg-black dark:bg-white text-white dark:text-black text-xs font-bold rounded-xl hover:bg-neutral-800 dark:hover:bg-neutral-200 cursor-pointer"
              >
                Create First Listing
              </button>
            </div>
          ) : displayedListings.length === 0 ? (
            <div className="bg-white dark:bg-[#111111] rounded-3xl p-12 text-center border border-neutral-200 dark:border-[#292929] space-y-4">
              <Building2 className="w-12 h-12 text-neutral-400 dark:text-[#7D7D7D] mx-auto" />
              <h3 className="text-lg font-bold text-neutral-900 dark:text-[#F5F5F5]">
                {listerListingsFilter === 'active' ? 'No active listings found' : 'No vacant listings found'}
              </h3>
              <p className="text-xs text-neutral-500 dark:text-[#8A8A8A] max-w-sm mx-auto">
                {listerListingsFilter === 'active'
                  ? 'None of your properties are currently in Approved status.'
                  : 'All of your properties are currently fully occupied (0 vacancies).'}
              </p>
              <button
                type="button"
                onClick={() => setListerListingsFilter('all')}
                className="px-5 py-2.5 bg-black dark:bg-white text-white dark:text-black text-xs font-bold rounded-xl hover:bg-neutral-800 dark:hover:bg-neutral-200 cursor-pointer"
              >
                Show All Listings
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:gap-5">
              {displayedListings.map((prop) => {
                const isAvailable = prop.vacancies > 0;

                return (
                  <div
                    key={prop.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => {
                      setSelectedPropertyId(prop.id);
                      setCurrentView('property-detail');
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setSelectedPropertyId(prop.id);
                        setCurrentView('property-detail');
                      }
                    }}
                    className="bg-white dark:bg-[#111111] rounded-2xl sm:rounded-3xl p-3 sm:p-5 border border-neutral-200 dark:border-[#292929] hover:border-black dark:hover:border-white shadow-xs hover:shadow-md transition-all flex flex-col justify-between gap-3 sm:gap-4 cursor-pointer group focus:outline-hidden focus:ring-2 focus:ring-black dark:focus:ring-white"
                  >
                    {/* Top: Property Media & Title */}
                    <div className="space-y-2.5 sm:space-y-3">
                      {/* Property Image with 4:3 aspect ratio */}
                      <div className="relative rounded-xl sm:rounded-2xl overflow-hidden aspect-4/3 w-full bg-neutral-100 dark:bg-[#181818] border border-neutral-200 dark:border-[#292929]">
                        <img
                          src={
                            prop.coverPhoto ||
                            prop.images?.[0] ||
                            'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=600&q=80'
                          }
                          alt={prop.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src =
                              'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=600&q=80';
                          }}
                        />
                        <span className="absolute bottom-2 left-2 bg-black/80 dark:bg-black/90 text-white text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded shadow-xs">
                          {prop.type}
                        </span>
                        {prop.video && (
                          <span className="absolute top-2 right-2 bg-black/80 dark:bg-black/90 text-white text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded flex items-center gap-1 shadow-xs">
                            <Video className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                            <span className="hidden sm:inline">Tour</span>
                          </span>
                        )}
                      </div>

                      {/* Name, Status, Location, Rent */}
                      <div className="space-y-1 sm:space-y-1.5">
                        <div className="flex items-start justify-between gap-1.5 flex-wrap">
                          <h3 className="text-xs sm:text-base font-bold text-neutral-950 dark:text-[#F5F5F5] group-hover:text-neutral-700 dark:group-hover:text-white transition-colors line-clamp-2 leading-tight">
                            {prop.name}
                          </h3>
                          {prop.status === 'Approved' && (
                            <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider bg-black dark:bg-white text-white dark:text-black px-1.5 sm:px-2 py-0.5 rounded shrink-0">
                              Approved
                            </span>
                          )}
                          {prop.status === 'Pending' && (
                            <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider bg-neutral-100 dark:bg-[#181818] text-neutral-800 dark:text-[#E0E0E0] border border-neutral-300 dark:border-[#333333] px-1.5 sm:px-2 py-0.5 rounded shrink-0">
                              Pending
                            </span>
                          )}
                          {prop.status === 'Suspended' && (
                            <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-400 border border-red-300 dark:border-red-900/60 px-1.5 sm:px-2 py-0.5 rounded shrink-0">
                              Suspended
                            </span>
                          )}
                        </div>

                        <p className="text-[10px] sm:text-xs text-neutral-500 dark:text-[#8A8A8A] line-clamp-1">
                          {prop.location.estate}, {prop.location.ward}, {prop.location.subCounty}
                        </p>

                        <p className="text-xs sm:text-sm font-extrabold text-neutral-950 dark:text-[#F5F5F5] pt-0.5">
                          KSh {prop.monthlyRent.toLocaleString()}
                          <span className="text-[10px] sm:text-xs font-normal text-neutral-500 dark:text-[#8A8A8A] ml-1">/ mo</span>
                        </p>
                      </div>

                      {/* 37. UNIT VACANCY METRICS (Vacant, Occupied, Under Repair) */}
                      <div className="bg-neutral-50 dark:bg-[#151515] group-hover:bg-neutral-100/70 dark:group-hover:bg-[#1E1E1E] transition-colors p-2 sm:p-3 rounded-xl sm:rounded-2xl border border-neutral-200 dark:border-[#292929] grid grid-cols-3 gap-1 sm:gap-2 text-center">
                        <div>
                          <span className="text-[8px] sm:text-[10px] font-bold text-neutral-400 dark:text-[#7D7D7D] uppercase tracking-wider block">
                            Vacant
                          </span>
                          <span
                            className={`text-xs sm:text-sm md:text-base font-extrabold ${
                              isAvailable ? 'text-black dark:text-white font-bold' : 'text-neutral-400 dark:text-[#7D7D7D]'
                            }`}
                          >
                            {prop.vacancies}
                          </span>
                        </div>

                        <div className="border-x border-neutral-200 dark:border-[#292929]">
                          <span className="text-[8px] sm:text-[10px] font-bold text-neutral-400 dark:text-[#7D7D7D] uppercase tracking-wider block">
                            Occupied
                          </span>
                          <span className="text-xs sm:text-sm md:text-base font-extrabold text-neutral-800 dark:text-[#F5F5F5]">
                            {prop.occupied}
                          </span>
                        </div>

                        <div>
                          <span className="text-[8px] sm:text-[10px] font-bold text-neutral-400 dark:text-[#7D7D7D] uppercase tracking-wider block">
                            Repair
                          </span>
                          <span className="text-xs sm:text-sm md:text-base font-extrabold text-neutral-700 dark:text-[#A3A3A3]">
                            {prop.underRepair}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Bottom: Action Controls */}
                    <div
                      className="pt-2 border-t border-neutral-100 dark:border-[#202020] space-y-2"
                      onClick={(e) => e.stopPropagation()}
                      onKeyDown={(e) => e.stopPropagation()}
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 sm:gap-2">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(prop.id);
                          }}
                          className="flex items-center justify-center gap-1 px-2 py-1.5 sm:py-2 bg-white dark:bg-[#151515] hover:bg-neutral-100 dark:hover:bg-[#1E1E1E] text-neutral-900 dark:text-[#F5F5F5] rounded-xl text-[10px] sm:text-xs font-bold transition-all border border-neutral-300 dark:border-[#292929] shadow-xs cursor-pointer truncate"
                          title="Edit Listing"
                        >
                          <Edit className="w-3 h-3 text-neutral-700 dark:text-[#A3A3A3] shrink-0" />
                          <span className="truncate">Edit Listing</span>
                        </button>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedForVacancy(prop);
                          }}
                          className="flex items-center justify-center gap-1 px-2 py-1.5 sm:py-2 bg-black hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200 text-white rounded-xl text-[10px] sm:text-xs font-bold transition-all shadow-xs cursor-pointer truncate"
                          title="Update Availability"
                        >
                          <SlidersHorizontal className="w-3 h-3 shrink-0" />
                          <span className="truncate">Availability</span>
                        </button>
                      </div>

                      <div className="flex items-center justify-between gap-2 pt-0.5">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedPropertyId(prop.id);
                            setCurrentView('property-detail');
                          }}
                          className="flex items-center gap-1 text-[10px] sm:text-xs text-neutral-500 dark:text-[#8A8A8A] hover:text-black dark:hover:text-white font-bold cursor-pointer transition-colors"
                        >
                          <span>Public Preview</span>
                          <ExternalLink className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                        </button>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setPropertyToDelete(prop);
                          }}
                          className="flex items-center justify-center p-1.5 bg-white dark:bg-[#151515] hover:bg-red-50 dark:hover:bg-red-950/40 text-neutral-400 hover:text-red-600 dark:hover:text-red-400 rounded-lg text-xs font-bold transition-all border border-neutral-200 dark:border-[#292929] hover:border-red-300 dark:hover:border-red-800 cursor-pointer"
                          title="Delete Listing"
                        >
                          <Trash2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Vacancy Manager Modal */}
      {selectedForVacancy && (
        <VacancyManagerModal
          property={selectedForVacancy}
          onClose={() => setSelectedForVacancy(null)}
        />
      )}

      {/* Delete Single Property Confirmation Modal */}
      {propertyToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white dark:bg-[#111111] rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-neutral-200 dark:border-[#292929] relative animate-in zoom-in-95">
            <button
              type="button"
              onClick={() => setPropertyToDelete(null)}
              className="absolute top-5 right-5 text-neutral-400 dark:text-[#7D7D7D] hover:text-black dark:hover:text-white p-1 rounded-full hover:bg-neutral-100 dark:hover:bg-[#181818] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-red-50 dark:bg-red-950/50 border border-red-100 dark:border-red-900/60 flex items-center justify-center text-red-600 dark:text-red-400">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-bold text-neutral-950 dark:text-[#F5F5F5]">Delete this listing?</h3>
              <p className="text-xs sm:text-sm text-neutral-600 dark:text-[#A3A3A3] leading-relaxed">
                This will remove <strong>"{propertyToDelete.name}"</strong> from your listings, lister dashboard, and public search.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setPropertyToDelete(null)}
                className="px-5 py-2.5 rounded-xl border border-neutral-300 dark:border-[#292929] text-neutral-700 dark:text-[#E0E0E0] text-xs font-bold hover:bg-neutral-100 dark:hover:bg-[#181818] transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={confirmDeleteOne}
                className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Listing</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete All Listings Confirmation Modal */}
      {showDeleteAllConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white dark:bg-[#111111] rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-neutral-200 dark:border-[#292929] relative animate-in zoom-in-95">
            <button
              type="button"
              onClick={() => setShowDeleteAllConfirm(false)}
              className="absolute top-5 right-5 text-neutral-400 dark:text-[#7D7D7D] hover:text-black dark:hover:text-white p-1 rounded-full hover:bg-neutral-100 dark:hover:bg-[#181818] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-red-50 dark:bg-red-950/50 border border-red-100 dark:border-red-900/60 flex items-center justify-center text-red-600 dark:text-red-400">
              <AlertOctagon className="w-6 h-6" />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-bold text-neutral-950 dark:text-[#F5F5F5]">Delete all listings?</h3>
              <p className="text-xs sm:text-sm text-neutral-600 dark:text-[#A3A3A3] leading-relaxed">
                This will permanently delete all <strong>{listerListings.length}</strong> listings belonging to your account. This action cannot be undone.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteAllConfirm(false)}
                className="px-5 py-2.5 rounded-xl border border-neutral-300 dark:border-[#292929] text-neutral-700 dark:text-[#E0E0E0] text-xs font-bold hover:bg-neutral-100 dark:hover:bg-[#181818] transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={confirmDeleteAll}
                className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete All Listings</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
