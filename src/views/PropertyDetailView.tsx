import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Heart,
  Share2,
  MapPin,
  Star,
  ShieldCheck,
  CheckCircle2,
  Phone,
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
  AlertTriangle
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { EstimatedMoveInCost } from '../components/EstimatedMoveInCost';
import { ReviewList } from '../components/ReviewList';
import { ContactListerModal } from '../components/ContactListerModal';
import { PropertyDetailMap } from '../components/PropertyDetailMap';
import { VacancyManagerModal } from '../components/VacancyManagerModal';

export const PropertyDetailView: React.FC = () => {
  const {
    selectedPropertyId,
    setSelectedPropertyId,
    targetReviewId,
    setTargetReviewId,
    properties,
    previousView,
    setCurrentView,
    currentUser,
    isPropertySaved,
    toggleSaveProperty,
    setEditingPropertyId,
    deletePropertyListing
  } = useApp();

  const [activePhotoIdx, setActivePhotoIdx] = useState(0);
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

  // Check if current user is the owner/lister of this property
  const isOwner = Boolean(
    currentUser &&
    currentUser.role === 'lister' &&
    property?.lister?.id &&
    currentUser.id === property.lister.id
  );

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
  const getAmenityIcon = (name: string) => {
    if (name.includes('Water')) return <Droplets className="w-4 h-4 text-black dark:text-[#F5F5F5]" />;
    if (name.includes('Fibre')) return <Wifi className="w-4 h-4 text-black dark:text-[#F5F5F5]" />;
    if (name.includes('Parking')) return <Car className="w-4 h-4 text-black dark:text-[#F5F5F5]" />;
    if (name.includes('Security')) return <Shield className="w-4 h-4 text-black dark:text-[#F5F5F5]" />;
    if (name.includes('Electricity')) return <Zap className="w-4 h-4 text-black dark:text-[#F5F5F5]" />;
    if (name.includes('Pet')) return <Dog className="w-4 h-4 text-black dark:text-[#F5F5F5]" />;
    return <CheckCircle2 className="w-4 h-4 text-black dark:text-[#F5F5F5]" />;
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
    <div className="min-h-screen bg-white dark:bg-black pb-24 text-neutral-900 dark:text-[#F5F5F5] w-full max-w-full overflow-x-hidden sm:overflow-x-clip transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-5 lg:pt-6 space-y-5 sm:space-y-6 w-full min-w-0">
        {/* Top Breadcrumb & Actions Bar */}
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleBack}
            className="flex items-center gap-2 text-xs font-bold font-sans text-neutral-700 dark:text-[#C5C5C5] hover:text-black dark:hover:text-white transition-colors cursor-pointer shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{getBackLabel()}</span>
          </button>

          <div className="flex items-center gap-2 flex-wrap justify-end">
            {/* Desktop Owner Action Shortcuts in the Top Bar */}
            {isOwner && (
              <div className="hidden sm:flex items-center gap-2 mr-1">
                <button
                  type="button"
                  onClick={handleEditListing}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black dark:bg-white hover:bg-neutral-800 dark:hover:bg-neutral-200 text-white dark:text-black text-xs font-bold font-sans transition-all shadow-xs cursor-pointer"
                >
                  <Edit className="w-3.5 h-3.5" />
                  <span>Edit Listing</span>
                </button>

                <button
                  type="button"
                  onClick={handleUpdateAvailability}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-[#383838] hover:border-black dark:hover:border-white bg-white dark:bg-[#151515] text-neutral-800 dark:text-[#E5E5E5] hover:text-black dark:hover:text-white text-xs font-bold font-sans transition-all cursor-pointer shadow-2xs"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  <span>Update Availability</span>
                </button>

                <button
                  type="button"
                  onClick={handleDeleteListingClick}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neutral-200 dark:border-[#292929] hover:border-red-300 dark:hover:border-red-500/60 hover:bg-red-50 dark:hover:bg-red-950/40 text-neutral-500 dark:text-[#999999] hover:text-red-600 dark:hover:text-red-400 text-xs font-bold font-sans transition-all cursor-pointer"
                  title="Delete Listing"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>

                <div className="h-4 w-px bg-neutral-200 dark:bg-[#292929] mx-1"></div>
              </div>
            )}

            <button
              type="button"
              onClick={handleShare}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neutral-200 dark:border-[#303030] hover:border-black dark:hover:border-white text-xs font-bold font-sans transition-all cursor-pointer bg-white dark:bg-[#151515] text-neutral-800 dark:text-[#E5E5E5] hover:text-black dark:hover:text-white"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>{copiedLink ? 'Link Copied!' : 'Share'}</span>
            </button>

            <button
              type="button"
              onClick={() => toggleSaveProperty(property.id)}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border text-xs font-bold font-sans transition-all cursor-pointer ${
                isSaved
                  ? 'bg-black dark:bg-white text-white dark:text-black border-black dark:border-white'
                  : 'bg-white dark:bg-[#151515] text-neutral-800 dark:text-[#E5E5E5] border-neutral-200 dark:border-[#303030] hover:border-black dark:hover:border-white hover:bg-neutral-50 dark:hover:bg-[#1E1E1E]'
              }`}
            >
              <Heart className={`w-3.5 h-3.5 ${isSaved ? 'fill-current' : ''}`} />
              <span>{isSaved ? 'Saved' : 'Save Property'}</span>
            </button>
          </div>
        </div>

        {/* Owner Management Banner (Dedicated Toolbar for Property Owners) */}
        {isOwner && (
          <div className="bg-neutral-900 dark:bg-[#0D0D0D] text-white rounded-2xl border border-neutral-800 dark:border-[#262626] animate-in fade-in p-3 sm:px-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs font-medium font-sans text-neutral-300 dark:text-[#C5C5C5]">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0"></span>
              <span>
                <strong className="text-white font-semibold">Owner Management Mode:</strong> You are viewing your own property listing.
              </span>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={handleEditListing}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-white dark:bg-[#F5F5F5] hover:bg-neutral-100 text-neutral-950 font-bold font-sans rounded-lg text-xs transition-all shadow-xs cursor-pointer"
              >
                <Edit className="w-3.5 h-3.5 text-neutral-900" />
                <span>Edit Listing</span>
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
          <div className="bg-neutral-900 dark:bg-[#0D0D0D] text-white px-4 py-3 rounded-2xl border border-neutral-800 dark:border-[#262626] font-medium font-sans text-xs flex items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-2">
              <span className="font-bold uppercase tracking-wider bg-neutral-800 dark:bg-[#1E1E1E] text-white border border-neutral-700 dark:border-[#333333] px-2 py-0.5 rounded text-[10px]">
                Pending Admin Review
              </span>
              <span className="text-neutral-300 dark:text-[#C5C5C5]">
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
              <span className="bg-black dark:bg-white text-white dark:text-black text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                {property.type}
              </span>
              <span className="bg-neutral-100 dark:bg-[#181818] text-neutral-800 dark:text-[#D5D5D5] text-xs font-semibold px-2.5 py-1 rounded-full border border-neutral-200 dark:border-[#292929]">
                {locationBadge || property.location.county}
              </span>
              {property.featured && (
                <span className="bg-neutral-900 dark:bg-[#1E1E1E] text-white text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1 border border-transparent dark:border-[#333333]">
                  <Sparkles className="w-3 h-3 text-white" /> Featured
                </span>
              )}
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-[42px] font-editorial font-semibold text-neutral-950 dark:text-[#F5F5F5] tracking-tight leading-[1.15] break-words">
              {property.name}
            </h1>

            <div className="mt-1.5 flex items-center gap-2 text-sm sm:text-base text-neutral-600 dark:text-[#A3A3A3] font-sans font-medium min-w-0">
              <MapPin className="w-4 h-4 text-neutral-400 dark:text-[#7D7D7D] shrink-0" />
              <span className="truncate">
                {locationSubtitle}
              </span>
            </div>
          </div>

          {/* Pricing & Vacancies Callout */}
          <div className="bg-white dark:bg-[#111111] p-5 sm:p-6 rounded-2xl border border-neutral-200 dark:border-[#292929] shadow-sm flex flex-col sm:items-end justify-center shrink-0">
            <div className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-[#8A8A8A] font-sans">Monthly Rent</div>
            <div className="text-3xl sm:text-4xl font-editorial font-semibold text-neutral-950 dark:text-[#F5F5F5]">
              KSh {property.monthlyRent.toLocaleString()}
              <span className="text-xs font-normal text-neutral-500 dark:text-[#8A8A8A] font-sans ml-1">/ month</span>
            </div>
            <div className="mt-2 text-xs font-bold font-sans">
              {isAvailable ? (
                <span className="text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-md border border-emerald-200 dark:border-emerald-800/60">
                  {getVacancyBadgeText()}
                </span>
              ) : (
                <span className="text-neutral-500 dark:text-[#8A8A8A] bg-neutral-100 dark:bg-[#181818] px-2.5 py-1 rounded-md border border-neutral-200 dark:border-[#292929]">
                  Fully Occupied
                </span>
              )}
            </div>
          </div>
        </div>

        {/* MEDIA & PHOTO GALLERY */}
        <section className="space-y-3 w-full min-w-0">
          <div className="relative rounded-3xl overflow-hidden aspect-16/9 sm:aspect-21/9 bg-neutral-100 dark:bg-[#111111] border border-neutral-200 dark:border-[#292929] shadow-lg w-full">
            <img
              src={property.images[activePhotoIdx] || property.images[0] || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80'}
              alt={`${property.name} photo`}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80';
              }}
            />
            <div className="absolute bottom-4 right-4 bg-black/80 dark:bg-black/90 backdrop-blur-md text-white text-xs font-bold font-sans px-3 py-1.5 rounded-xl border border-white/10">
              Photo {activePhotoIdx + 1} of {property.images.length}
            </div>
          </div>

          {/* Photo Thumbnails */}
          {property.images.length > 1 && (
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
              {property.images.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActivePhotoIdx(idx)}
                  className={`relative rounded-xl overflow-hidden aspect-4/3 border-2 transition-all cursor-pointer ${
                    activePhotoIdx === idx ? 'border-black dark:border-white ring-2 ring-black dark:ring-white' : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </section>

        {/* PROPERTY VIDEO TOUR */}
        {hasValidVideo && property.video && (
          <section id="property-video-tour-section" className="bg-white dark:bg-[#111111] p-6 sm:p-8 rounded-3xl border border-neutral-200 dark:border-[#292929] shadow-xs space-y-4 w-full min-w-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-neutral-100 dark:bg-[#181818] flex items-center justify-center text-neutral-900 dark:text-[#F5F5F5] border border-neutral-200 dark:border-[#292929] shrink-0">
                  <Video className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-2xl sm:text-[26px] font-editorial font-semibold text-neutral-950 dark:text-[#F5F5F5] tracking-tight">Property Video Tour</h3>
                  {property.videoName && (
                    <p className="text-xs text-neutral-500 dark:text-[#8A8A8A] font-sans font-medium">{property.videoName}</p>
                  )}
                </div>
              </div>
              <span className="text-[11px] font-bold font-sans uppercase tracking-wider bg-black dark:bg-white text-white dark:text-black px-3 py-1 rounded-full shadow-xs">
                Video Walkthrough
              </span>
            </div>

            <div className="relative rounded-2xl overflow-hidden bg-black aspect-16/9 sm:aspect-21/9 border border-neutral-200 dark:border-[#292929] shadow-md flex items-center justify-center w-full">
              <video
                key={property.video}
                src={property.video}
                controls
                autoPlay={false}
                playsInline
                preload="metadata"
                className="w-full h-full object-contain bg-black"
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
            <section className="bg-white dark:bg-[#111111] p-6 sm:p-8 rounded-3xl border border-neutral-200 dark:border-[#292929] shadow-xs space-y-4">
              <h3 className="text-2xl sm:text-[26px] font-editorial font-semibold text-neutral-950 dark:text-[#F5F5F5] tracking-tight">Property Overview</h3>
              <p className="text-neutral-700 dark:text-[#A3A3A3] font-sans leading-relaxed text-sm sm:text-base font-normal">
                {property.description}
              </p>

              {/* Group summary if building has multiple types */}
              {property.unitGroups && property.unitGroups.length > 0 && (
                <div className="pt-4 border-t border-neutral-100 dark:border-[#262626]">
                  <h4 className="text-xs font-bold uppercase tracking-wider font-sans text-neutral-500 dark:text-[#8A8A8A] mb-3">
                    Available Unit Configurations in this Building:
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {property.unitGroups.map((g, idx) => (
                      <div key={idx} className="p-3 bg-neutral-50 dark:bg-[#151515] rounded-xl border border-neutral-200 dark:border-[#292929] text-xs font-sans">
                        <div className="font-bold text-neutral-900 dark:text-[#F5F5F5]">{g.type}</div>
                        <div className="text-neutral-600 dark:text-[#A3A3A3] font-semibold mt-0.5">KSh {g.rent.toLocaleString()}</div>
                        <div className="text-[11px] text-neutral-500 dark:text-[#7D7D7D] mt-1">
                          {g.vacant > 0 ? `${g.vacant} Vacant` : 'Fully Occupied'}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </section>

            {/* PROPERTY AMENITIES */}
            <section className="bg-white dark:bg-[#111111] p-6 sm:p-8 rounded-3xl border border-neutral-200 dark:border-[#292929] shadow-xs space-y-5">
              <h3 className="text-2xl sm:text-[26px] font-editorial font-semibold text-neutral-950 dark:text-[#F5F5F5] tracking-tight">Included Amenities</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {property.amenities.map((amenity, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-3 p-3.5 rounded-xl bg-neutral-50 dark:bg-[#151515] border border-neutral-200 dark:border-[#292929] text-xs font-semibold font-sans text-neutral-800 dark:text-[#D5D5D5]"
                  >
                    <div className="w-8 h-8 rounded-lg bg-white dark:bg-[#1F1F1F] border border-neutral-200 dark:border-[#303030] flex items-center justify-center shrink-0 shadow-2xs">
                      {getAmenityIcon(amenity)}
                    </div>
                    <span>{amenity}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* ESTIMATED MOVE-IN COST CALCULATOR */}
            <section className="w-full min-w-0">
              <EstimatedMoveInCost property={property} />
            </section>

            {/* PROPERTY LOCATION MAP */}
            <section className="bg-white dark:bg-[#111111] p-6 sm:p-8 rounded-3xl border border-neutral-200 dark:border-[#292929] shadow-xs space-y-4 w-full min-w-0">
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
            <section id="tenant-reviews-section" className="bg-white dark:bg-[#111111] p-6 sm:p-8 rounded-3xl border border-neutral-200 dark:border-[#292929] shadow-xs w-full min-w-0">
              <ReviewList property={property} />
            </section>
          </div>

          {/* Right Column / Sticky Sidebar (4 cols) */}
          <div className="lg:col-span-4 space-y-6 min-w-0 w-full">
            {/* PROPERTY LISTER INFORMATION CARD */}
            <div className="bg-white dark:bg-[#111111] p-6 sm:p-7 rounded-3xl border border-neutral-200 dark:border-[#292929] shadow-md sticky top-32 space-y-6 w-full min-w-0">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider font-sans text-neutral-400 dark:text-[#7D7D7D] block mb-1">
                  Property Contact
                </span>
                <h3 className="text-2xl font-editorial font-semibold text-neutral-950 dark:text-[#F5F5F5]">
                  Listed by {property.lister?.name || 'Property Owner'}
                </h3>
              </div>

              {/* Lister Profile */}
              <div className="flex items-center gap-3.5 p-3.5 bg-neutral-50 dark:bg-[#151515] rounded-2xl border border-neutral-200 dark:border-[#292929]">
                <img
                  src={property.lister?.avatar || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80'}
                  alt={property.lister?.name || 'Lister'}
                  className="w-13 h-13 rounded-full object-cover border-2 border-white dark:border-[#292929] shadow-xs shrink-0"
                />
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 font-sans">
                    <span className="font-bold text-sm text-neutral-950 dark:text-[#F5F5F5] truncate">{property.lister?.name || 'Property Owner'}</span>
                    {property.lister?.verified && (
                      <ShieldCheck className="w-4 h-4 text-black dark:text-white shrink-0" />
                    )}
                  </div>
                  <span className="text-xs font-semibold text-neutral-600 dark:text-[#A3A3A3] font-sans block truncate">{property.lister?.type || 'Landlord / Property Owner'}</span>
                  <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold font-sans flex items-center gap-1 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Verified Contact
                  </span>
                </div>
              </div>

              {/* Contact Button Action */}
              <button
                type="button"
                onClick={() => setContactModalOpen(true)}
                className="w-full bg-black dark:bg-white hover:bg-neutral-800 dark:hover:bg-neutral-200 text-white dark:text-black font-bold font-sans py-3.5 px-4 rounded-xl text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-98"
              >
                <Phone className="w-4 h-4" />
                <span>Contact Lister</span>
              </button>

              <div className="space-y-2 pt-2 border-t border-neutral-100 dark:border-[#262626] text-xs font-sans text-neutral-500 dark:text-[#8A8A8A]">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-black dark:text-[#F5F5F5] shrink-0" />
                  <span>Transparent rental guidelines</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-black dark:text-[#F5F5F5] shrink-0" />
                  <span>Physical viewing coordinated directly</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Lister Modal */}
      {contactModalOpen && (
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
