import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft,
  Heart,
  Share2,
  MapPin,
  Star,
  ShieldCheck,
  CheckCircle2,
  Phone,
  MessageSquare,
  Mail,
  Building,
  Wifi,
  Droplets,
  Zap,
  Car,
  Shield,
  Dog,
  Sparkles,
  Video,
  Edit,
  SlidersHorizontal,
  Trash2,
  X,
  AlertTriangle,
  Sun,
  Moon,
  BedDouble,
  WalletCards,
  FileText,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import type { Id } from '../../convex/_generated/dataModel';
import { EstimatedMoveInCost } from '../components/EstimatedMoveInCost';
import { ReviewList } from '../components/ReviewList';
import { ContactListerModal } from '../components/ContactListerModal';
import { PropertyDetailMap } from '../components/PropertyDetailMap';
import { VacancyManagerModal } from '../components/VacancyManagerModal';

export const PropertyDetailView: React.FC = () => {
  const {
    selectedPropertyId,
    setSelectedPropertyId,
    setSelectedListerId,
    targetReviewId,
    setTargetReviewId,
    properties,
    previousView,
    setCurrentView,
    currentUser,
    seekerEnquiries,
    sendEnquiry,
    setTargetEnquiryId,
    isPropertySaved,
    toggleSaveProperty,
    resolvedTheme,
    toggleTheme,
    setEditingPropertyId,
    deletePropertyListing
  } = useApp();
  const recordView = useMutation(api.properties.recordView);
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);
  const [selectedUnitId, setSelectedUnitId] = useState<string | null>(null);
  const galleryRef = useRef<HTMLDivElement | null>(null);
  const [overviewExpanded, setOverviewExpanded] = useState(false);
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [videoLoadError, setVideoLoadError] = useState(false);
  const [vacancyModalOpen, setVacancyModalOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const property =
    properties.find((p) => p.id === selectedPropertyId) ||
    (selectedPropertyId
      ? properties.find((p) => p.id.toLowerCase() === selectedPropertyId.toLowerCase())
      : null) ||
    (!selectedPropertyId && properties.length > 0 ? properties[0] : null);

  const mixedUnitRecords = useQuery(
    api.propertyUnitTypes.getByProperty,
    property?.type === 'Mixed Units'
      ? { propertyId: property.id as Id<'properties'> }
      : 'skip'
  );

  const saveCount = property?.saveCount ?? 0;
  const listerListingCount = property?.lister?.id ? properties.filter((p) => p.lister?.id === property.lister?.id).length : 0;
  // Check if current user is the owner/lister of this property
  const handleDirectEnquiry = async () => {
    if (!property) return;

    if (!currentUser) {
      setCurrentView('login');
      return;
    }

    // If this seeker already has a conversation for this property,
    // open that existing conversation instead of creating another one.
    const existingEnquiry = seekerEnquiries.find(
      (enquiry) => enquiry.propertyId === property.id
    );

    if (existingEnquiry) {
      setTargetEnquiryId(existingEnquiry.id);
      setCurrentView('seeker-enquiries');
      return;
    }

    const defaultMessage =
      `Hello ${property.lister.name}, I am interested in viewing the available ` +
      `${property.type} at ${property.name}. When can we schedule a walkthrough?`;

    try {
      const newEnquiryId = await sendEnquiry(
        property.id,
        currentUser.name || 'Seeker',
        currentUser.phone || '',
        currentUser.email || '',
        defaultMessage
      );

      setTargetEnquiryId(newEnquiryId);
      setCurrentView('seeker-enquiries');
    } catch (error) {
      console.error('Failed to start enquiry:', error);
    }
  };
  const isOwner = Boolean(
    currentUser &&
    currentUser.role === 'lister' &&
    property?.lister?.id &&
    currentUser.id === property.lister.id
  );

  useEffect(() => {
    if (!property?.id || currentUser?.role !== 'seeker') {
      return;
    }

    void recordView({
      propertyId: property.id as any,
    }).catch((error) => {
      console.error('Failed to record property view:', error);
    });
  }, [property?.id, currentUser?.id, currentUser?.role, recordView]);

  // Reset video error state when property or video source changes
  // Reset video error state when property or video source changes
  useEffect(() => {
    setVideoLoadError(false);
  }, [property?.id, property?.video]);

  const hasValidVideo = Boolean(
    property?.video &&
    typeof property.video === 'string' &&
    property.video.trim().length > 0 &&
    !videoLoadError
  );

  // Guarantee scroll position is at top only when NOT deep-linking to a specific review
  useEffect(() => {
    if (targetReviewId) return;

    const scrollToTop = () => {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      if (document.documentElement) document.documentElement.scrollTop = 0;
      if (document.body) document.body.scrollTop = 0;

      // Also reset any scrollable container divs / main wrappers in case preview is in a scrollable frame
      const scrollableElements = document.querySelectorAll(
        'main, #root, #root > div, .overflow-y-auto, .overflow-auto'
      );
      scrollableElements.forEach((el) => {
        if (el instanceof HTMLElement) {
          el.scrollTop = 0;
        }
      });
    };

    // Immediate reset
    scrollToTop();

    // Secondary reset on next animation frame
    const frameId = requestAnimationFrame(scrollToTop);

    // Delayed fallback to prevent asynchronous map/image layout shifts from pulling scroll down
    const timerId = setTimeout(scrollToTop, 60);

    return () => {
      cancelAnimationFrame(frameId);
      clearTimeout(timerId);
    };
  }, [selectedPropertyId, property?.id, targetReviewId]);

  const handleBack = () => {
    if (
      previousView &&
      previousView !== 'property-detail' &&
      previousView !== 'welcome' &&
      previousView !== 'login' &&
      previousView !== 'signup'
    ) {
      setCurrentView(previousView);
    } else {
      setCurrentView('tenant-home');
    }
  };

  const handleEditListing = () => {
    if (!property) return;
    setEditingPropertyId(property.id);
    setCurrentView('add-property');
  };

  const handleUpdateAvailability = () => {
    setVacancyModalOpen(true);
  };

  const handleDeleteListingClick = () => {
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!property) return;
    deletePropertyListing(property.id);
    setDeleteConfirmOpen(false);
    if (previousView === 'lister-dashboard') {
      setCurrentView('lister-dashboard');
    } else {
      setCurrentView('my-listings');
    }
  };

  const getBackLabel = () => {
    switch (previousView) {
      case 'map-explore':
        return 'Back to Live Map';
      case 'my-listings':
        return 'Back to My Listings';
      case 'lister-dashboard':
        return 'Back to Lister Dashboard';
      case 'saved':
        return 'Back to Saved Properties';
      case 'admin-dashboard':
      case 'admin-properties':
      case 'admin-pending':
        return 'Back to Admin Portal';
      case 'lister-enquiries':
        return 'Back to Enquiries';
      default:
        return 'Back to Discovery';
    }
  };

  if (!property) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-[#fafafa] dark:bg-black flex items-center justify-center p-6 text-center transition-colors">
        <div className="bg-white dark:bg-[#111111] p-8 sm:p-12 rounded-3xl border border-neutral-200 dark:border-[#292929] shadow-sm max-w-md w-full space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-neutral-100 dark:bg-[#181818] flex items-center justify-center mx-auto text-neutral-400 dark:text-[#7D7D7D]">
            <Building className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-editorial font-semibold text-neutral-950 dark:text-[#F5F5F5]">Property Not Found</h2>
          <p className="text-xs text-neutral-500 dark:text-[#8A8A8A] font-sans leading-relaxed">
            The requested rental property listing is not available or has been removed.
          </p>
          <button
            type="button"
            onClick={handleBack}
            className="w-full py-3 bg-black dark:bg-white hover:bg-neutral-800 dark:hover:bg-neutral-200 text-white dark:text-black rounded-xl text-xs font-bold font-sans transition-colors cursor-pointer"
          >
            {getBackLabel()}
          </button>
        </div>
      </div>
    );
  }

  const isSaved = isPropertySaved(property.id);
  const isAvailable = property.vacancies > 0;

  const handleShare = () => {
    navigator.clipboard?.writeText?.(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // Map icon helper for amenities
  const getAmenityIcon = (amenity: string) => {
    const name = amenity.toLowerCase();

    if (name.includes('water') || name.includes('borehole'))
      return <Droplets className="w-4 h-4 text-sky-500 dark:text-sky-400" />;

    if (name.includes('electricity') || name.includes('token'))
      return <Zap className="w-4 h-4 text-amber-500 dark:text-amber-400" />;

    if (name.includes('fibre') || name.includes('wifi') || name.includes('internet'))
      return <Wifi className="w-4 h-4 text-violet-500 dark:text-violet-400" />;

    if (name.includes('security') || name.includes('cctv') || name.includes('guard'))
      return <Shield className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />;

    if (name.includes('parking'))
      return <Car className="w-4 h-4 text-sky-600 dark:text-sky-400" />;

    if (name.includes('pet'))
      return <Dog className="w-4 h-4 text-rose-500 dark:text-rose-400" />;

    if (name.includes('balcony'))
      return <Building className="w-4 h-4 text-teal-500 dark:text-teal-400" />;

    if (name.includes('gated'))
      return <Shield className="w-4 h-4 text-[var(--rentike-bronze)]" />;

    return <CheckCircle2 className="w-4 h-4 text-[var(--rentike-bronze)]" />;
  };
  const getAmenityLabel = (amenity: string) => {
    const name = amenity.toLowerCase();

    if (name.includes('water') || name.includes('borehole')) return 'Water';
    if (name.includes('electricity') || name.includes('token')) return 'Prepaid Token';
    if (name.includes('fibre') || name.includes('wifi') || name.includes('internet')) return 'WiFi';
    if (name.includes('cctv') || name.includes('security') || name.includes('guard')) return 'Security';
    if (name.includes('parking')) return 'Parking';
    if (name.includes('balcony')) return 'Balcony';
    if (name.includes('pet')) return 'Pet Friendly';
    if (name.includes('wardrobe')) return 'Wardrobes';
    if (name.includes('gated')) return 'Gated';
    if (name.includes('tile')) return 'Tiles';
    if (name.includes('perimeter')) return 'Perimeter Wall';

    return amenity;
  };

  // Location strings derived consistently from the same property object
  const locationHierarchy = [
    property.location.estate,
    property.location.ward,
    property.location.subCounty,
    property.location.county
  ]
    .filter(Boolean)
    .join(', ');

  const locationBadge = [
    property.location.estate || property.location.ward,
    property.location.subCounty || property.location.county
  ]
    .filter(Boolean)
    .join(', ');

  const locationSubtitle = property.location.address
    ? `${property.location.address} • ${locationHierarchy}`
    : locationHierarchy;

  // Standalone property vs multi-unit vacancy wording
  const isStandaloneHome = [
    'bungalow',
    'villa',
    'standalone house',
    'entire house',
    'maisonette',
    'townhouse',
    'commercial building'
  ].some((t) => property.type.toLowerCase().includes(t));

  const getVacancyBadgeText = () => {
    if (property.vacancies <= 0) {
      return 'Fully Occupied';
    }
    if (isStandaloneHome && property.vacancies === 1) {
      return 'Available for Rent';
    }
    return `${property.vacancies} ${property.vacancies === 1 ? 'unit available' : 'units available'}`;
  };

  return (
    <div className="min-h-screen bg-[var(--rentike-bg)] pb-24 text-neutral-900 dark:text-[#F5F5F5] w-full max-w-full overflow-x-hidden sm:overflow-x-clip transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-5 lg:pt-6 space-y-5 sm:space-y-6 w-full min-w-0">
        {/* Top Breadcrumb & Actions Bar */}
        <div className="fixed top-0 left-0 right-0 z-50 px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-3 bg-[var(--rentike-bg)] dark:bg-black border-b border-[#E7DED2]/60 dark:border-neutral-800">

          <button
            type="button"
            onClick={toggleTheme}
            aria-label={
              resolvedTheme === 'dark'
                ? 'Switch to light mode'
                : 'Switch to dark mode'
            }
            className="flex items-center rounded-full border border-[#E2D3C2] dark:border-neutral-700 bg-[#F7F3EC] dark:bg-[#151515] p-1 shadow-[4px_4px_10px_rgba(28,22,16,0.10),-4px_-4px_10px_rgba(255,255,255,0.9)] dark:shadow-[4px_4px_10px_rgba(0,0,0,0.45),-3px_-3px_8px_rgba(255,255,255,0.03)]"
          >
            <span
              className={`w-8 h-8 rounded-full flex items-center justify-center ${resolvedTheme !== 'dark'
                ? 'bg-white text-neutral-600 shadow-sm'
                : 'text-neutral-500'
                }`}
            >
              <Sun className="w-4 h-4" />
            </span>

            <span
              className={`w-8 h-8 rounded-full flex items-center justify-center ${resolvedTheme === 'dark'
                ? 'bg-[#C49A6C] text-white shadow-sm'
                : 'text-[#B8792B]'
                }`}
            >
              <Moon className="w-4 h-4" />
            </span>
          </button>
        </div>

        {/* Owner Management Banner (Dedicated Toolbar for Property Owners) */}
        {isOwner && (
          <div className="bg-neutral-900 dark:bg-[#0D0D0D] text-white rounded-2xl border border-neutral-800 dark:border-[#262626] animate-in fade-in p-3 sm:px-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs font-medium font-sans text-neutral-300 dark:text-[#C5C5C5]">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0"></span>
              <span>
                <strong className="text-white font-semibold">Owner Management Mode:</strong> You are viewing your own property listing.
                <span className="ml-3 inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-neutral-800 border border-neutral-700 text-white font-semibold">
                  ♡ {saveCount} {saveCount === 1 ? 'save' : 'saves'}
                </span>
              </span>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={handleEditListing}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-white dark:bg-[#F5F5F5] hover:bg-neutral-100 text-neutral-950 font-bold font-sans rounded-lg text-xs transition-all shadow-xs cursor-pointer"
              >
                <Edit className="w-3.5 h-3.5 text-neutral-900" />
                <span>
                  {property.status === 'Rejected' ? 'Edit & Resubmit' : 'Edit Listing'}
                </span>
              </button>

              <button
                type="button"
                onClick={handleUpdateAvailability}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-neutral-800 dark:bg-[#1E1E1E] hover:bg-neutral-700 dark:hover:bg-[#2A2A2A] text-white font-bold font-sans rounded-lg text-xs transition-all border border-neutral-700 dark:border-[#333333] cursor-pointer"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>Update Availability</span>
              </button>

              <button
                type="button"
                onClick={handleDeleteListingClick}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-neutral-800 dark:bg-[#1E1E1E] hover:bg-red-950/80 text-red-400 hover:text-red-300 border border-neutral-700 dark:border-red-900/60 font-bold font-sans rounded-lg text-xs transition-all cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Listing</span>
              </button>
            </div>
          </div>
        )}

        {/* Pending / Rejected Moderation Alert Banner */}
        {property.status === 'Pending' && (
          <div className="bg-amber-500/10 dark:bg-amber-500/10 text-amber-200 px-4 py-3 rounded-2xl border border-amber-500/30">
            <div className="flex items-center gap-2">
              <span className="font-bold uppercase tracking-wider bg-amber-500 text-black border border-amber-400 px-2 py-0.5 rounded text-[10px]">
                Pending Admin Review
              </span>

              <span className="text-amber-100">
                This property's latest edits are currently in the admin moderation queue. Once approved by MakaoHub moderation, the updated details will be live across discovery search and map.
              </span>
            </div>
          </div>
        )}

        {property.status === 'Rejected' && (
          <div className="bg-rose-50 dark:bg-rose-950/30 text-rose-900 dark:text-rose-200 px-4 py-3 rounded-2xl border border-rose-200 dark:border-rose-900/50 font-medium font-sans text-xs">
            <div className="flex items-center gap-2">
              <span className="font-bold uppercase tracking-wider bg-rose-600 text-white px-2 py-0.5 rounded text-[10px]">
                Listing Rejected
              </span>
              <span>
                Reason: {property.rejectionReason || 'Please review property details and update the listing before resubmitting.'}
              </span>
            </div>
          </div>
        )}

        {/* Title, Badges, Location & Pricing Header */}
        <div className="pt-2 sm:pt-2.5 flex flex-col md:flex-row md:items-start justify-between gap-5 sm:gap-6 pb-5 sm:pb-6 border-b border-neutral-200 dark:border-[#262626]">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2 font-sans mb-2">
              {/* Property Type */}
              <span
                className="
    inline-flex items-center gap-2
    px-3.5 py-2 rounded-2xl
    bg-[#F7F3EC] dark:bg-[#151515]
    border border-[#E7DED2] dark:border-neutral-800
    text-xs font-semibold text-neutral-800 dark:text-[#F5F5F5]
    shadow-[5px_5px_12px_rgba(28,22,16,0.10),-5px_-5px_12px_rgba(255,255,255,0.92)]
    dark:shadow-[5px_5px_12px_rgba(0,0,0,0.45),-3px_-3px_8px_rgba(255,255,255,0.03)]
  "
              >
                <BedDouble className="w-4 h-4 text-[var(--rentike-bronze)]" />
                <span>{property.type}</span>
              </span>

              {/* Location */}
              <span
                className="
    inline-flex items-center gap-2
    px-3.5 py-2 rounded-2xl
    bg-[#F7F3EC] dark:bg-[#151515]
    border border-[#E7DED2] dark:border-neutral-800
    text-xs font-medium text-neutral-700 dark:text-[#D5D5D5]
    shadow-[5px_5px_12px_rgba(28,22,16,0.08),-5px_-5px_12px_rgba(255,255,255,0.90)]
    dark:shadow-[5px_5px_12px_rgba(0,0,0,0.40),-3px_-3px_8px_rgba(255,255,255,0.03)]
  "
              >
                <MapPin className="w-4 h-4 text-[var(--rentike-bronze)]" />
                <span>{locationBadge || property.location.county}</span>
              </span>
              {property.featured && (
                <span className="bg-neutral-900 dark:bg-[#1E1E1E] text-white text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1 border border-transparent dark:border-[#333333]">
                  <Sparkles className="w-3 h-3 text-white" /> Featured
                </span>
              )}
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-[42px] font-editorial font-semibold">
              <span className="text-neutral-950 dark:text-white">
                {property.name.split(' ')[0]}
              </span>

              {property.name.split(' ').length > 1 && (
                <>
                  {' '}
                  <span className="text-[var(--rentike-bronze)]">
                    {property.name.split(' ').slice(1).join(' ')}
                  </span>
                </>
              )}
            </h1>

            <div className="mt-1.5 flex items-center gap-2 text-sm sm:text-base text-neutral-600 dark:text-[#A3A3A3] font-sans font-medium min-w-0">
              <MapPin className="w-4 h-4 text-neutral-400 dark:text-[#7D7D7D] shrink-0" />
              <span className="truncate">
                {locationSubtitle}
              </span>
            </div>
          </div>

          {/* Pricing & Vacancies Callout */}
          {/* Pricing & Vacancies Callout */}
          {property.type !== 'Mixed Units' && (
            <div
              className="
    bg-[#F7F3EC] dark:bg-[#151515]
    p-5 sm:p-6
   rounded-3xl md:h-[242px]
border border-[#E7DED2] dark:border-neutral-800
    shadow-[8px_8px_18px_rgba(28,22,16,0.10),-8px_-8px_18px_rgba(255,255,255,0.92)]
    dark:shadow-[8px_8px_18px_rgba(0,0,0,0.45),-4px_-4px_10px_rgba(255,255,255,0.03)]
  "
            >
              <div className="flex items-center gap-2 text-[var(--rentike-bronze)]">
                <WalletCards className="w-5 h-5" />

                <span className="text-xs font-bold uppercase tracking-[0.14em]">
                  Monthly Rent
                </span>
              </div>

              <div className="mt-3 flex items-end gap-2 flex-wrap">
                <span className="text-3xl sm:text-4xl font-editorial font-semibold text-neutral-950 dark:text-[#F5F5F5] leading-none">
                  KSh {property.monthlyRent.toLocaleString()}
                </span>

                <span className="text-xs sm:text-sm text-neutral-500 dark:text-[#8A8A8A] mb-1">
                  / month
                </span>
              </div>

              <div className="mt-4">
                {isAvailable ? (
                  <span className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 text-xs font-semibold border border-emerald-200 dark:border-emerald-900/50">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    {getVacancyBadgeText()}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 text-xs font-semibold border border-red-200 dark:border-red-900/50">
                    <span className="w-2 h-2 rounded-full bg-red-500" />
                    {getVacancyBadgeText()}
                  </span>
                )}
              </div>



            </div>
          )}

          {/* Desktop and tablet lister profile */}
          <div className="hidden md:block md:h-[242px] bg-[#F7F3EC] dark:bg-[#151515] p-5 rounded-2xl border border-[#E7DED2] dark:border-neutral-800 shadow-[4px_4px_10px_rgba(28,22,16,0.06)]">
            <div className="flex items-center gap-2 text-[var(--rentike-bronze)]">
              <Building className="h-4 w-4" />
              <span className="text-xs font-semibold tracking-wide">
                Listed by
              </span>
            </div>

            <div className="mt-3 flex items-center gap-3">
              <img
                src={property.lister?.avatar || 'https://images.unsplash.com/photo-1573496359142-bd9f2c3dd45a'}
                alt={property.lister?.name || 'Lister'}
                className="h-11 w-11 shrink-0 rounded-full object-cover"
              />

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-neutral-900 dark:text-white">
                  {property.lister?.name || 'Property Owner'}
                </p>
                <p className="text-xs text-neutral-600 dark:text-neutral-400">
                  Caretaker
                </p>
                <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                  {listerListingCount} active {listerListingCount === 1 ? 'listing' : 'listings'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                if (!property?.lister?.id) return;
                setSelectedListerId(property.lister.id);
                setCurrentView('public-lister-profile');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="mt-3 flex w-full items-center justify-between rounded-xl border border-[#E7DED2] dark:border-neutral-700 bg-[#F8F3EC] dark:bg-[#24201B] px-4 py-2.5 text-sm font-semibold text-[var(--rentike-bronze)] shadow-[3px_3px_7px_rgba(28,22,16,0.08)] transition-colors hover:bg-[#EFE7DC] dark:hover:bg-[#302820]"
            >
              <span>View Profile</span>
              <span>→</span>
            </button>

          </div>

        </div>

        {/* MEDIA & PHOTO GALLERY */}
        <section className="space-y-3 w-full min-w-0">
          <div className="relative rounded-3xl overflow-hidden bg-neutral-100 dark:bg-[#181818]">

            <div
              ref={galleryRef}
              className="flex overflow-x-auto no-scrollbar snap-x snap-mandatory"
              onScroll={(e) => {
                const gallery = e.currentTarget;

                const index = Math.round(
                  gallery.scrollLeft / gallery.clientWidth
                );

                setActivePhotoIdx(index);
              }}
            >
              {property.images.map((img, index) => (
                <div
                  key={index}
                  className="flex-none w-full snap-start aspect-16/9 sm:aspect-21/9"
                >
                  <img
                    src={img}
                    alt={`${property.name} photo ${index + 1}`}
                    draggable={false}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src =
                        'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00';
                    }}
                  />
                </div>
              ))}
            </div>
            {/* Saved Heart - Top Left */}
            {!isOwner && (
              <button
                type="button"
                onClick={() => toggleSaveProperty(property.id)}
                aria-label={isSaved ? 'Remove from saved properties' : 'Save property'}
                className={`
      absolute top-3 left-3
      w-10 h-10 rounded-full
      flex items-center justify-center
      backdrop-blur-md border
      transition-all
      ${isSaved
                    ? 'bg-red-500 text-white border-red-500'
                    : 'bg-[#F7F3EC]/90 dark:bg-[#151515]/85 text-[var(--rentike-bronze)] border-white/60 dark:border-neutral-700'
                  }
      shadow-[4px_4px_12px_rgba(0,0,0,0.16)]
    `}
              >
                <Heart className={`w-5 h-5 ${isSaved ? 'fill-current' : ''}`} />
              </button>
            )}

            {/* Photo Dots */}
            {property.images.length > 1 && (
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-black/35 backdrop-blur-md">
                {property.images.map((_, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => {
                      const gallery = galleryRef.current;
                      if (!gallery) return;

                      gallery.scrollTo({
                        left: index * gallery.clientWidth,
                        behavior: 'smooth',
                      });
                    }}
                    aria-label={`View photo ${index + 1}`}
                    className={`h-2 rounded-full transition-all duration-200 ${activePhotoIdx === index
                      ? 'w-5 bg-white'
                      : 'w-2 bg-white/55'
                      }`}
                  />
                ))}
              </div>
            )}
          </div>


        </section>

        {/* PROPERTY VIDEO TOUR */}
        {hasValidVideo && property.video && (
          <section
            id="property-video-tour-section"
            className="bg-[#F7F3EC] dark:bg-[#151515] p-5 sm:p-6 rounded-2xl border border-[#E7DED2] dark:border-neutral-800 shadow-[5px_5px_12px_rgba(28,22,16,0.10),-5px_-5px_12px_rgba(255,255,255,0.92)] dark:shadow-[5px_5px_12px_rgba(0,0,0,0.45),-3px_-3px_8px_rgba(255,255,255,0.03)]"
          >
            <div className="mb-5">


              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[var(--rentike-bronze)]/12 flex items-center justify-center">
                  <Video className="w-4 h-4 text-[var(--rentike-bronze)]" />
                </div>

                <h3 className="text-2xl sm:text-[28px] font-editorial font-semibold tracking-tight">
                  <span className="text-neutral-950 dark:text-[#F5F5F5]">
                    House{' '}
                  </span>
                  <span className="text-[var(--rentike-bronze)]">
                    Tour
                  </span>
                </h3>
              </div>

              <p className="mt-2 text-sm text-neutral-500 dark:text-[#8A8A8A] font-sans">
                Take a quick look inside
              </p>
            </div>

            <div className="relative rounded-2xl overflow-hidden bg-black aspect-16/9 sm:aspect-21/9 border border-black/10 dark:border-white/10 shadow-[0_10px_24px_rgba(28,22,16,0.14)]">
              <video
                key={property.video}
                src={property.video}
                controls
                autoPlay={false}
                playsInline
                preload="metadata"
                className="w-full h-full object-cover bg-black"
                onError={() => setVideoLoadError(true)}
              >
                Your browser does not support the video tag.
              </video>
            </div>
          </section>
        )}

        {/* Main Details Grid: Left Content & Right Sticky Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 w-full min-w-0">
          {/* Left Column (8 cols) */}
          <div className="lg:col-span-8 space-y-8 sm:space-y-10 min-w-0 w-full">
            {/* PROPERTY DESCRIPTION */}
            <section className="bg-[#F7F3EC] dark:bg-[#151515] p-5 sm:p-6 rounded-2xl border border-[#E7DED2] dark:border-neutral-800 shadow-[5px_5px_12px_rgba(28,22,16,0.10),-5px_-5px_12px_rgba(255,255,255,0.92)] dark:shadow-[5px_5px_12px_rgba(0,0,0,0.45),-3px_-3px_8px_rgba(255,255,255,0.03)] space-y-4">
              {/* Overview Header */}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 shrink-0 rounded-2xl bg-[#F7F3EC] dark:bg-[#1A1714] flex items-center justify-center text-[var(--rentike-bronze)]">
                  <FileText className="w-5 h-5" />
                </div>

                <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--rentike-bronze)]">
                  About This Home
                </span>
              </div>

              {/* Title */}
              <h3 className="text-2xl sm:text-[26px] font-editorial font-semibold tracking-tight mb-4">
                <span className="text-neutral-950 dark:text-[#F5F5F5]">
                  Property{' '}
                </span>
                <span className="text-[var(--rentike-bronze)]">
                  Overview
                </span>
              </h3>

              {/* Description */}
              <div className="flex gap-4">
                <div className="w-[3px] self-stretch shrink-0 rounded-full bg-[var(--rentike-bronze)]/80" />

                <div className="min-w-0">
                  <p className="text-neutral-600 dark:text-[#A3A3A3] font-sans leading-7 text-sm sm:text-base font-normal">
                    {overviewExpanded || (property.description?.length ?? 0) <= 180
                      ? property.description
                      : `${property.description?.slice(0, 180).trim()}…`}
                  </p>

                  {(property.description?.length ?? 0) > 180 && (
                    <button
                      type="button"
                      onClick={() => setOverviewExpanded((prev) => !prev)}
                      className="mt-4 text-sm font-semibold text-[var(--rentike-bronze)] hover:opacity-75 transition-opacity"
                    >
                      {overviewExpanded ? 'Show less ↑' : 'Read more →'}
                    </button>
                  )}
                </div>
              </div>


              {/* Unit configurations for Mixed Units */}
              {property.type === 'Mixed Units' ? (
                <div className="pt-4 border-t border-[#E7DED2] dark:border-neutral-800">
                  <h4 className="text-sm font-semibold text-neutral-900 dark:text-[#F5F5F5] mb-4">
                    Available Unit Types
                  </h4>

                  {mixedUnitRecords === undefined ? (
                    <p className="text-sm text-neutral-500">
                      Loading unit types...
                    </p>
                  ) : mixedUnitRecords.length === 0 ? (
                    <p className="text-sm text-neutral-500">
                      No unit types found for this building.
                    </p>
                  ) : (
                    <div className="space-y-4">

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                        {mixedUnitRecords.map((unit) => (
                          <div key={unit._id} className="min-w-0 sm:col-span-2 space-y-3">
                            <button


                              type="button"
                              onClick={() =>
                                setSelectedUnitId((previous) =>
                                  previous === unit._id ? null : unit._id
                                )
                              }
                              aria-expanded={selectedUnitId === unit._id}

                              className={`w-full text-left rounded-2xl border p-4 space-y-3 cursor-pointer transition-colors ${selectedUnitId === unit._id
                                ? 'border-[#C49A6C] bg-[#EFE4D5] dark:bg-[#24201C]'
                                : 'border-[#E7DED2] dark:border-neutral-800 bg-[#F8F5EF] dark:bg-[#151515]'
                                }`}

                            >
                              <h5 className="font-semibold text-neutral-900 dark:text-[#F5F5F5]">
                                {unit.type}
                              </h5>

                              <p className="text-xl font-semibold text-[var(--rentike-bronze)]">
                                KSh {unit.monthlyRent.toLocaleString()}
                                <span className="text-xs text-neutral-500 font-normal">
                                  {' '}/month
                                </span>
                              </p>

                              <div className="flex flex-wrap gap-3 text-xs text-neutral-600 dark:text-neutral-300">
                                <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 font-semibold ${unit.vacancies > 0
                                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400'
                                  : 'bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400'
                                  }`}>
                                  <span className={`h-2 w-2 rounded-full ${unit.vacancies > 0 ? 'bg-emerald-500' : 'bg-red-500'}`} />
                                  {unit.vacancies > 0
                                    ? `${unit.vacancies} ${unit.vacancies === 1 ? 'unit' : 'units'} available`
                                    : 'Fully Occupied'}
                                </span>
                              </div>

                              <div className="flex items-center justify-between pt-2 border-t border-[#E7DED2] dark:border-neutral-700">
                                <span className="text-sm font-semibold text-[var(--rentike-bronze)]">
                                  {selectedUnitId === unit._id ? 'Hide Details' : 'View Details'}
                                </span>
                                <span className="text-[var(--rentike-bronze)]">
                                  {selectedUnitId === unit._id ? '−' : '→'}
                                </span>
                              </div>

                            </button>

                            {selectedUnitId === unit._id && (
                              <div
                                className="rounded-2xl border border-[#E7DED2] dark:border-neutral-800 bg-[#F7F3EC] dark:bg-[#151515] p-4 sm:p-5 space-y-5"
                              >


                                <div>
                                  <h4 className="text-xl font-semibold text-neutral-900 dark:text-[#F5F5F5]">
                                    {unit.type} Details
                                  </h4>
                                  <p className="text-sm text-neutral-500">
                                    {unit.vacancies} {unit.vacancies === 1 ? 'unit' : 'units'} available
                                  </p>
                                </div>

                                {/* Individual unit photos */}
                                <div className="space-y-3">
                                  <h5 className="font-semibold text-neutral-900 dark:text-[#F5F5F5]">
                                    Photos
                                  </h5>

                                  {unit.resolvedImages.length > 0 ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                      {unit.resolvedImages.map((url, index) => (
                                        <img
                                          key={`${unit._id}-${index}`}
                                          src={url}
                                          alt={`${unit.type} photo ${index + 1}`}
                                          loading="lazy"
                                          className="w-full aspect-video object-cover rounded-xl"
                                        />
                                      ))}
                                    </div>
                                  ) : (
                                    <p className="text-sm text-neutral-500">
                                      No photos available for this unit.
                                    </p>
                                  )}
                                </div>

                                {/* Individual House Tour */}
                                {unit.resolvedVideo && (
                                  <div className="space-y-3">
                                    <h5 className="font-semibold text-neutral-900 dark:text-[#F5F5F5]">
                                      House Tour
                                    </h5>
                                    <video
                                      key={unit._id}
                                      src={unit.resolvedVideo}
                                      controls
                                      playsInline
                                      preload="metadata"
                                      className="w-full aspect-video rounded-xl bg-black"
                                    />
                                  </div>
                                )}

                                {/* Individual unit pricing */}
                                <div className="space-y-3">
                                  <h5 className="font-semibold text-neutral-900 dark:text-[#F5F5F5]">
                                    Pricing & Charges
                                  </h5>

                                  <div className="divide-y divide-[#E7DED2] dark:divide-neutral-800 text-sm">
                                    {[
                                      ['Monthly Rent', unit.monthlyRent],
                                      ['Security Deposit', unit.deposit],
                                      ['Service Charge', unit.serviceCharge],
                                      ['Water Deposit', unit.waterDeposit],
                                      ['Electricity Deposit', unit.electricityDeposit],
                                      ['Agent Fee', unit.agentFee],
                                      ['Viewing Fee', unit.viewingFee],
                                    ]
                                      .filter(([, amount]) => typeof amount === 'number' && amount > 0)
                                      .map(([label, amount]) => (
                                        <div
                                          key={label}
                                          className="flex items-center justify-between gap-4 py-3"
                                        >
                                          <span className="text-neutral-600 dark:text-neutral-300">
                                            {label}
                                          </span>
                                          <span className="font-semibold text-neutral-900 dark:text-[#F5F5F5]">
                                            KSh {Number(amount).toLocaleString()}
                                          </span>
                                        </div>
                                      ))}
                                  </div>
                                </div>

                                {/* Automatic Estimated Move-In Total */}
                                <div className="rounded-2xl border border-[#E7DED2] dark:border-neutral-700 bg-[#F2E7D8] dark:bg-[#24201C] p-4 sm:p-5">
                                  <p className="text-xs font-bold uppercase tracking-wider text-[var(--rentike-bronze)]">
                                    Estimated Total Move-In Cost
                                  </p>

                                  <p className="mt-2 text-2xl sm:text-3xl font-semibold text-neutral-950 dark:text-[#F5F5F5]">
                                    KSh {(
                                      unit.monthlyRent +
                                      unit.deposit +
                                      (unit.serviceCharge ?? 0) +
                                      (unit.waterDeposit ?? 0) +
                                      (unit.electricityDeposit ?? 0) +
                                      (unit.agentFee ?? 0) +
                                      (unit.viewingFee ?? 0)
                                    ).toLocaleString()}
                                  </p>

                                  <p className="mt-2 text-xs text-neutral-500 dark:text-neutral-400">
                                    Estimated upfront cost based on the listed charges.
                                  </p>
                                </div>



                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (


                property.unitGroups && property.unitGroups.length > 0 && (
                  <div className="pt-4 border-t border-neutral-100 dark:border-[#262626]">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-[#8A8A8A] mb-3">
                      Available Unit Configurations in this Building:
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {property.unitGroups.map((g, idx) => (
                        <div key={idx} className="p-3 bg-neutral-50 dark:bg-[#151515] rounded-xl border border-neutral-200 dark:border-[#292929] text-xs">
                          <div className="font-bold text-neutral-900 dark:text-[#F5F5F5]">{g.type}</div>
                          <div className="text-neutral-600 dark:text-[#A3A3A3] font-semibold mt-0.5">
                            KSh {g.rent.toLocaleString()}
                          </div>
                          <div className="text-[11px] text-neutral-500 dark:text-[#7D7D7D] mt-1">
                            {g.vacant > 0 ? `${g.vacant} Vacant` : 'Fully Occupied'}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              )}

            </section>

            {/* PROPERTY AMENITIES */}
            <section className="bg-[#F7F3EC] dark:bg-[#151515] p-5 sm:p-6 rounded-2xl border border-[#E7DED2] dark:border-[#2A2A2A] shadow-[5px_5px_12px_rgba(28,22,16,0.10),-5px_-5px_12px_rgba(255,255,255,0.92)] dark:shadow-[5px_5px_12px_rgba(0,0,0,0.45),-3px_-3px_8px_rgba(255,255,255,0.03)]">
              <h3 className="text-2xl sm:text-[26px] font-editorial font-semibold text-neutral-950 dark:text-[#F5F5F5] tracking-tight">Included Amenities</h3>
              <div className="grid grid-cols-3 gap-3">
                {property.amenities.map((amenity, idx) => (
                  <div
                    key={idx}
                    className="min-h-[88px] flex flex-col items-center justify-center gap-2 p-3 rounded-2xl bg-[#F7F3EC] dark:bg-[#151515] border border-[#E7DED2] dark:border-neutral-800 shadow-[4px_4px_10px_rgba(28,22,16,0.08),-4px_-4px_10px_rgba(255,255,255,0.85)] dark:shadow-[4px_4px_10px_rgba(0,0,0,0.35),-3px_-3px_8px_rgba(255,255,255,0.03)]"
                  >
                    <div className="w-8 h-8 rounded-lg bg-white dark:bg-[#1F1F1F] border border-neutral-200 dark:border-[#303030] flex items-center justify-center shrink-0 shadow-2xs">
                      {getAmenityIcon(amenity)}
                    </div>
                    <span className="text-[11px] font-medium text-center leading-tight text-neutral-700 dark:text-neutral-300">
                      {getAmenityLabel(amenity)}
                    </span>
                  </div>
                ))}
              </div>
            </section>

            {/* ESTIMATED MOVE-IN COST CALCULATOR */}
            <section className="w-full min-w-0">
              {property.type !== 'Mixed Units' && (
                <EstimatedMoveInCost property={property} />
              )}
            </section>

            {/* PROPERTY LOCATION MAP */}
            <section className="bg-[#F7F3EC] dark:bg-[#151515] p-5 sm:p-6 rounded-2xl border border-[#E7DED2] dark:border-neutral-800 shadow-[5px_5px_12px_rgba(28,22,16,0.10),-5px_-5px_12px_rgba(255,255,255,0.92)] dark:shadow-[5px_5px_12px_rgba(0,0,0,0.45),-3px_-3px_8px_rgba(255,255,255,0.03)]">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl sm:text-[26px] font-editorial font-semibold text-neutral-950 dark:text-[#F5F5F5] tracking-tight">Property Location</h3>
                  <p className="text-xs text-neutral-500 dark:text-[#8A8A8A] font-sans">
                    Situated in {locationHierarchy}
                  </p>
                </div>
                <div className="text-xs font-semibold font-sans text-neutral-600 dark:text-[#D5D5D5] bg-neutral-100 dark:bg-[#181818] px-3 py-1.5 rounded-lg border border-neutral-200 dark:border-[#292929]">
                  <MapPin className="w-3.5 h-3.5 inline mr-1 text-black dark:text-[#F5F5F5]" />
                  <span>{property.location.estate || property.location.ward || property.location.subCounty || property.location.county}</span>
                </div>
              </div>

              {/* Seeker Read-Only Property Location Map */}
              <PropertyDetailMap
                property={property}
                className="h-80 w-full"
              />
            </section>

            {/* PROPERTY REVIEWS SECTION */}
            <section id="tenant-reviews-section" className="w-full min-w-0">
              <ReviewList property={property} />
            </section>
          </div>

          {/* Right Column / Sticky Sidebar (4 cols) */}
          <div className="lg:col-span-4 space-y-6 min-w-0 w-full">
            {/* PROPERTY LISTER INFORMATION CARD */}
            <div className="md:hidden bg-[#F7F3EC] dark:bg-[#151515] p-5 sm:p-6 rounded-2xl border border-[#E7DED2] dark:border-neutral-800 shadow-[5px_5px_12px_rgba(28,22,16,0.10),-5px_-5px_12px_rgba(255,255,255,0.92)] dark:shadow-[5px_5px_12px_rgba(0,0,0,0.45),-3px_-3px_8px_rgba(255,255,255,0.03)]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 shrink-0 rounded-2xl bg-[#F2E7D8] dark:bg-[#24201C] flex items-center justify-center text-[var(--rentike-bronze)] shadow-[inset_2px_2px_5px_rgba(28,22,16,0.08),inset_-2px_-2px_5px_rgba(255,255,255,0.75)]">
                  <Building className="w-5 h-5" />
                </div>

                <div className="min-w-0">
                  <span className="text-sm font-semibold tracking-[0.06em] text-[var(--rentike-bronze)] font-sans">
                    Listed by
                  </span>


                </div>
              </div>
              {/* Lister Profile */}
              <div className="mt-3 flex flex-wrap items-center gap-3.5 rounded-2xl bg-[#FBF8F2] dark:bg-[#1B1B1B] border border-[#E7DED2] dark:border-neutral-800 p-4 shadow-[3px_3px_8px_rgba(28,22,16,0.07),-3px_-3px_8px_rgba(255,255,255,0.75)] dark:shadow-[3px_3px_8px_rgba(0,0,0,0.28)]">
                <img
                  src={property.lister?.avatar || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80'}
                  alt={property.lister?.name || 'Lister'}
                  className="w-14 h-14 rounded-full object-cover border-2 border-[#F7F3EC] dark:border-[#292929] shadow-sm shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 font-sans">
                    <span className="font-bold text-sm text-neutral-950 dark:text-[#F5F5F5] truncate">
                      {property.lister?.name || 'Property Owner'}
                    </span>
                  </div>

                  <span className="text-xs font-semibold text-neutral-600 dark:text-[#A3A3A3] font-sans block">
                    Caretaker
                  </span>
                  <span className="mt-0.5 text-[11px] text-neutral-500 dark:text-neutral-400 font-sans block">
                    {listerListingCount} active {listerListingCount === 1 ? 'listing' : 'listings'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (!property?.lister?.id) return;
                    setSelectedListerId(property.lister.id);
                    setCurrentView('public-lister-profile');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="w-full mt-4 flex items-center justify-between px-4 py-3 rounded-xl border border-[#E7DED2] bg-[#F7F3EC] text-[var(--rentike-bronze)] shadow-[3px_3px_7px_rgba(0,0,0,0.08)] transition-all hover:shadow-md active:scale-[0.99] dark:border-[#343434] dark:bg-[#202020] dark:shadow-[3px_3px_8px_rgba(0,0,0,0.35)]"
                >
                  <span className="font-semibold text-sm text-[var(--rentike-bronze)]">
                    View Profile
                  </span>

                  <span className="text-lg text-[var(--rentike-bronze)]">
                    →
                  </span>
                </button>
              </div>



            </div>
          </div>
        </div>
      </div>

      {/* Floating desktop and tablet contact buttons */}
      {!isOwner && (
        <div className="hidden md:flex fixed bottom-6 right-6 z-[900] items-center gap-3">
          <button
            type="button"
            onClick={() => {
              if (property.lister.phone) {
                window.location.href = `tel:${property.lister.phone}`;
              }
            }}
            disabled={!property.lister.phone}
            aria-label="Call Lister"
            title="Call Lister"
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-[#E7DED2] bg-[#F8F3EB] text-neutral-900 shadow-[4px_5px_12px_rgba(28,22,16,0.20)] transition-all duration-200 hover:bg-white active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 dark:border-[#493D32] dark:bg-[#24201B] dark:text-white"
          >
            <Phone className="h-5 w-5" />
          </button>

          <button
            type="button"
            onClick={handleDirectEnquiry}
            className="flex h-12 items-center justify-center gap-2 rounded-full bg-[#B8895E] px-5 text-xs font-semibold text-white shadow-[4px_5px_12px_rgba(82,49,24,0.28)] transition-all duration-200 hover:bg-[#A67950] active:scale-95"
          >
            <MessageSquare className="h-4 w-4" />
            <span>Send Enquiry</span>
          </button>
        </div>
      )}

      {/* Mobile Property Action Bar */}
      {!isOwner && (
        <div className="md:hidden fixed bottom-14 left-0 right-0 z-[9999] bg-[#F8F3EB]/95 dark:bg-[#111111]/95 backdrop-blur-xl border-t border-[#E4D8C8] dark:border-[#2A2A2A] px-3 pt-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))]">
          <div className="flex items-center gap-3 max-w-xl mx-auto">

            <button
              type="button"
              onClick={() => {
                if (property.lister.phone) {
                  window.location.href = `tel:${property.lister.phone}`;
                }
              }}
              disabled={!property.lister.phone}

              className="flex-1 h-10 rounded-xl flex items-center justify-center gap-2 text-xs font-semibold text-[#8B6B43] dark:text-[#C49A6C] bg-[#F7F3EC] dark:bg-[#1C1C1C] border border-[#E7DED2] dark:border-neutral-700 shadow-[3px_3px_7px_rgba(28,22,16,0.12),-3px_-3px_7px_rgba(255,255,255,0.95)] dark:shadow-[3px_3px_7px_rgba(0,0,0,0.45),-2px_-2px_5px_rgba(255,255,255,0.03)] active:shadow-inner active:scale-[0.98] transition-all disabled:opacity-40"

            >
              <Phone className="w-5 h-5" />
              <span>Call</span>
            </button>

            <button
              type="button"
              onClick={handleDirectEnquiry}

              className="flex-1 h-10 rounded-xl flex items-center justify-center gap-2 text-xs font-semibold text-[#8B6B43] dark:text-[#C49A6C] bg-[#F7F3EC] dark:bg-[#1C1C1C] border border-[#E7DED2] dark:border-neutral-700 shadow-[3px_3px_7px_rgba(28,22,16,0.12),-3px_-3px_7px_rgba(255,255,255,0.95)] dark:shadow-[3px_3px_7px_rgba(0,0,0,0.45),-2px_-2px_5px_rgba(255,255,255,0.03)] active:shadow-inner active:scale-[0.98] transition-all"

            >
              <MessageSquare className="w-5 h-5" />
              <span>Send Enquiry</span>
            </button>

          </div>
        </div>
      )}
      {/* Contact Lister Modal */}
      {!isOwner && contactModalOpen && (
        <ContactListerModal
          property={property}
          onClose={() => setContactModalOpen(false)}
        />
      )}

      {/* Vacancy Manager Modal (Owner Availability Editor) */}
      {vacancyModalOpen && (
        <VacancyManagerModal
          property={property}
          onClose={() => setVacancyModalOpen(false)}
        />
      )}

      {/* Delete Listing Confirmation Modal */}
      {deleteConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white dark:bg-[#111111] rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-neutral-200 dark:border-[#292929] relative animate-in zoom-in-95">
            <button
              type="button"
              onClick={() => setDeleteConfirmOpen(false)}
              className="absolute top-5 right-5 text-neutral-400 hover:text-black dark:hover:text-white p-1 rounded-full hover:bg-neutral-100 dark:hover:bg-[#1E1E1E] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-100 dark:border-red-900/50 flex items-center justify-center text-red-600 dark:text-red-400">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="space-y-2 font-sans">
              <h3 className="text-2xl font-editorial font-semibold text-neutral-950 dark:text-[#F5F5F5]">Delete this listing?</h3>
              <p className="text-xs sm:text-sm text-neutral-600 dark:text-[#A3A3A3] leading-relaxed">
                This property will be removed from your listings and public discovery.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2 font-sans">
              <button
                type="button"
                onClick={() => setDeleteConfirmOpen(false)}
                className="px-5 py-2.5 rounded-xl border border-neutral-300 dark:border-[#383838] text-neutral-700 dark:text-[#D5D5D5] text-xs font-bold hover:bg-neutral-100 dark:hover:bg-[#1E1E1E] transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Listing</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
