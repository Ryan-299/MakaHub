import React, { useState, useMemo } from 'react';
import {
  User,
  Building,
  ShieldCheck,
  Mail,
  Phone,
  Calendar,
  ArrowRight,
  LogOut,
  CreditCard,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles,
  RefreshCw,
  Sliders,
  ChevronRight,
  Info,
  CircleHelp,
  Building2,
  Check,
  Lock,
  Layers,
  ArrowUpRight,
  Sun,
  Moon,
  Pencil,
  HardHat,
  Briefcase,
  Users,

} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { SUBSCRIPTION_PLANS, DEFAULT_MARY_SUBSCRIPTION } from '../data/subscriptionPlans';
import { ListerSubscriptionPlan, SubscriptionTier, SubscriptionStatus } from '../types';
import { SubscriptionCheckoutModal } from '../components/SubscriptionCheckoutModal';
import { ContactPortfolioModal } from '../components/ContactPortfolioModal';
import { CancelSubscriptionModal } from '../components/CancelSubscriptionModal';
import { useUser, useSession } from '@clerk/react';
import { HelpAndLegalModals, HelpLegalModalType } from '../components/HelpAndLegalModals';
export const UserProfileView: React.FC = () => {
  const { user: clerkUser } = useUser();
  const { session } = useSession();
  const [activeHelpModal, setActiveHelpModal] = useState<HelpLegalModalType>(null);

  const {
    currentUser,
    switchUserMode,
    logoutUser,
    deleteAccount,
    updateCurrentUserName,
    setCurrentView,
    resolvedTheme,
    toggleTheme,
    previousView,
    properties = [],
    listerListings = []
  } = useApp();
  const isDark = resolvedTheme === 'dark';
  const handleDeleteAccount = () => {
    setDeleteModalOpen(true);
  };

  const confirmDeleteAccount = async () => {
    if (!session) {
      setDeleteVerificationError(
        'Your session is unavailable. Please sign in again.'
      );
      return;
    }

    try {
      setIsDeletingAccount(true);
      setDeleteVerificationError('');

      const verification = await session.startVerification({
        level: 'first_factor',
      });

      const emailFactor = verification.supportedFirstFactors?.find(
        (factor) => factor.strategy === 'email_code'
      );

      if (!emailFactor || !('emailAddressId' in emailFactor)) {
        throw new Error('Email verification is not available for this account.');
      }

      await session.prepareFirstFactorVerification({
        strategy: 'email_code',
        emailAddressId: emailFactor.emailAddressId,
      });

      setDeleteModalOpen(false);
      setDeleteVerificationOpen(true);
    } catch (error) {
      console.error('Failed to start deletion verification:', error);
      setDeleteVerificationError(
        'We could not send a verification code. Please try again.'
      );
    } finally {
      setIsDeletingAccount(false);
    }
  };
  const completeDeleteVerification = async () => {
    if (!session) return;

    if (!deleteVerificationCode.trim()) {
      setDeleteVerificationError('Enter the verification code sent to your email.');
      return;
    }

    try {
      setIsDeletingAccount(true);
      setDeleteVerificationError('');

      const verificationResult = await session.attemptFirstFactorVerification({
        strategy: 'email_code',
        code: deleteVerificationCode.trim(),
      });

      if (verificationResult.status !== 'complete') {
        throw new Error('Verification was not completed.');
      }

      await deleteAccount();
    } catch (error) {
      console.error('Account deletion verification failed:', error);
      setDeleteVerificationError(
        'The verification code is incorrect or has expired. Please try again.'
      );
      setIsDeletingAccount(false);
    }
  };
  const handleBack = () => {
    if (previousView && previousView !== 'profile') {
      setCurrentView(previousView);
      return;
    }

    if (currentUser?.role === 'admin') {
      setCurrentView('admin-dashboard');
    } else if (currentUser?.role === 'lister') {
      setCurrentView('lister-dashboard');
    } else {
      setCurrentView('tenant-home');
    }
  };

  const [activeTab, setActiveTab] = useState<'details' | 'billing' | 'settings'>(() => {
    const requestedTab = sessionStorage.getItem('makaohub-profile-tab');

    sessionStorage.removeItem('makaohub-profile-tab');

    return requestedTab === 'settings' || requestedTab === 'billing'
      ? requestedTab
      : 'details';
  });
  const [subscription, setSubscription] = useState(DEFAULT_MARY_SUBSCRIPTION);
  const [selectedPlanForCheckout, setSelectedPlanForCheckout] = useState<ListerSubscriptionPlan | null>(null);
  const [portfolioModalOpen, setPortfolioModalOpen] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [downgradeWarningPlan, setDowngradeWarningPlan] = useState<ListerSubscriptionPlan | null>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [deleteVerificationOpen, setDeleteVerificationOpen] = useState(false);
  const [deleteVerificationCode, setDeleteVerificationCode] = useState('');
  const [deleteVerificationError, setDeleteVerificationError] = useState('');
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState(currentUser?.name || '');
  const [isSavingName, setIsSavingName] = useState(false);
  const [nameError, setNameError] = useState<string | null>(null);
  const handleAvatarChange = async (

    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];

    if (!file || !clerkUser) return;

    if (!file.type.startsWith('image/')) {
      setAvatarError('Please choose an image file.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setAvatarError('Profile picture must be smaller than 5 MB.');
      return;
    }

    try {
      setIsUploadingAvatar(true);
      setAvatarError(null);

      await clerkUser.setProfileImage({ file });
      await clerkUser.reload();
    } catch (error) {
      console.error('Failed to update profile picture:', error);
      setAvatarError('Could not update profile picture. Please try again.');
    } finally {
      setIsUploadingAvatar(false);
      e.target.value = '';
    }
  };
  const handleSaveName = async () => {
    const trimmedName = nameDraft.trim();

    if (!trimmedName) {
      setNameError('Name / company cannot be empty.');
      return;
    }

    if (trimmedName.length > 80) {
      setNameError('Name / company must be 80 characters or fewer.');
      return;
    }

    if (trimmedName === currentUser?.name) {
      setNameError(null);
      setIsEditingName(false);
      return;
    }

    try {
      setIsSavingName(true);
      setNameError(null);

      await updateCurrentUserName(trimmedName);

      setNameDraft(trimmedName);
      setIsEditingName(false);
    } catch (error) {
      console.error('Failed to update name:', error);
      setNameError(
        error instanceof Error
          ? error.message
          : 'Could not update your name. Please try again.'
      );
    } finally {
      setIsSavingName(false);
    }
  };
  // Dynamic calculation of active listings belonging to the current user

  const activeListingsCount = useMemo(() => {
    if (!currentUser) return 0;
    // Count listings authored by currentUser where status === 'Approved'
    const myListings = properties.filter((p) => p.lister?.id === currentUser.id);
    return myListings.filter((p) => p.status === 'Approved').length;
  }, [properties, currentUser]);

  // Current active plan object
  const currentPlan = useMemo(() => {
    return (
      SUBSCRIPTION_PLANS.find((plan) => plan.id === subscription.planId) ||
      SUBSCRIPTION_PLANS[1] // fallback to Growth
    );
  }, [subscription.planId]);

  // Usage percentage & slots calculation
  const listingLimit = currentPlan.maxListings;
  const remainingSlots = Math.max(0, listingLimit - activeListingsCount);
  const usagePercentage = Math.min(100, Math.round((activeListingsCount / listingLimit) * 100));
  const isAtOrOverLimit = activeListingsCount >= listingLimit;

  if (!currentUser) {
    return (
      <div className="max-w-md mx-auto py-20 text-center space-y-4">
        <p className="text-sm text-neutral-600">Please sign in to view your account.</p>
        <button
          type="button"
          onClick={() => setCurrentView('login')}
          className="px-4 py-2 bg-black text-white text-xs font-bold rounded-xl cursor-pointer hover:bg-neutral-800"
        >
          Sign In
        </button>
      </div>
    );
  }

  const isLister = currentUser.role === 'lister';
  const isAdmin = currentUser.role === 'admin';
  const isSeeker = currentUser.role === 'seeker';

  const handleSelectPlan = (plan: ListerSubscriptionPlan) => {
    if (plan.id === subscription.planId) {
      // Already on this plan
      return;
    }

    // Check if downgrade violates current active listings count
    if (activeListingsCount > plan.maxListings) {
      setDowngradeWarningPlan(plan);
      return;
    }

    setDowngradeWarningPlan(null);
    setSelectedPlanForCheckout(plan);
  };

  const handleToggleAutoRenew = () => {
    setSubscription((prev) => ({
      ...prev,
      autoRenew: !prev.autoRenew
    }));
  };

  const handleConfirmCancel = () => {
    setSubscription((prev) => ({
      ...prev,
      autoRenew: false,
      status: 'Cancelled'
    }));
    setCancelModalOpen(false);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)]bg-[#F7F3EC] dark:bg-black pb-24 text-neutral-900 dark:text-[#F5F5F5] font-sans transition-colors duration-200">

      <div className="max-w-5xl mx-auto px-3 sm:px-6 lg:px-8 pt-8 space-y-8">

        {/* Header with Title & Account Identity */}
        <div className="pb-6 border-b border-neutral-200 dark:border-[#262626]">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs font-sans text-neutral-600 dark:text-neutral-400 mb-2">
              My Account
            </p>


            <button
              type="button"
              onClick={toggleTheme}
              aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              className="sm:hidden shrink-0 flex items-center rounded-full border border-[#E2D3C2] dark:border-neutral-700 bg-[#F7F3EC] dark:bg-[#181818] p-1 shadow-[0_4px_12px_rgba(0,0,0,0.08)]"
            >
              <span
                className={`w-8 h-8 rounded-full flex items-center justify-center ${!isDark
                  ? 'bg-white text-neutral-600 shadow-sm'
                  : 'text-neutral-500'
                  }`}
              >
                <Sun className="w-4 h-4" />
              </span>

              <span
                className={`w-8 h-8 rounded-full flex items-center justify-center ${isDark
                  ? 'bg-[#C49A6C] text-white shadow-sm'
                  : 'text-[#B8792B]'
                  }`}
              >
                <Moon className="w-4 h-4" />
              </span>
            </button>
          </div>
          <h1 className="mt-3 text-[22px] font-editorial font-medium text-neutral-900 dark:text-white">
            Manage your <span className="text-[var(--rentike-bronze)] font-bold">Account</span>
          </h1>



          {/* Quick action: Switch Mode */}
          <div className="flex items-center gap-2 font-sans">
            {isAdmin && (
              <button
                type="button"
                onClick={() => setCurrentView('admin-dashboard')}
                className="px-3.5 py-2 text-xs font-bold bg-white dark:bg-[#111111] text-neutral-800 dark:text-[#F5F5F5] border border-neutral-200 dark:border-[#303030] hover:border-black dark:hover:border-white rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                <span>Admin Dashboard</span>
              </button>
            )}
            {isLister && (
              <button
                type="button"
                onClick={() => setCurrentView('lister-dashboard')}
                className="px-3.5 py-2 text-xs font-bold bg-white dark:bg-[#111111] text-neutral-800 dark:text-[#F5F5F5] border border-neutral-200 dark:border-[#303030] hover:border-black dark:hover:border-white rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>Lister Dashboard</span>
              </button>
            )}

          </div>
        </div>


        {/* ======================================================== */}
        {/* TAB 1: ACCOUNT DETAILS                                   */}
        {/* ======================================================== */}
        {activeTab === 'details' && (
          <div className="space-y-6 animate-in fade-in duration-150 font-sans">
            {/* Primary Profile Card */}
            <div className="bg-[#F7F3EC] dark:bg-[#151515] p-4 rounded-2xl border border-[#E7DED2] dark:border-neutral-800 shadow-[8px_8px_18px_rgba(28,22,16,0.12),-8px_-8px_18px_rgba(255,255,255,0.95)] dark:shadow-[8px_8px_18px_rgba(0,0,0,0.50),-5px_-5px_12px_rgba(255,255,255,0.035)]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div className="flex items-center gap-5">
                  <div className="relative shrink-0">
                    <img
                      src={clerkUser?.imageUrl || currentUser.avatar}
                      alt={currentUser.name}
                      className="w-16 h-16 rounded-full object-cover border-2 border-neutral-100 dark:border-neutral-800"
                    />

                    <input
                      id="profile-avatar-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      disabled={isUploadingAvatar}
                      className="hidden"
                    />

                    <label
                      htmlFor="profile-avatar-upload"
                      title="Change profile picture"
                      className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 flex items-center justify-center shadow-md cursor-pointer hover:scale-110 transition-transform"
                    >
                      {isUploadingAvatar ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin text-neutral-900 dark:text-white" />
                      ) : (
                        <Pencil className="w-3.5 h-3.5 text-neutral-900 dark:text-white" />
                      )}
                    </label>
                  </div>
                  <div className="space-y-1 flex-1 min-w-0">
                    <div className="flex flex-col items-start gap-2">
                      {isEditingName ? (
                        <div className="flex flex-col gap-2 w-full min-w-0">
                          <div className="flex flex-wrap items-center gap-2 min-w-0">
                            <input
                              type="text"
                              value={nameDraft}
                              onChange={(e) => {
                                setNameDraft(e.target.value);
                                setNameError(null);
                              }}
                              maxLength={80}
                              autoFocus
                              className="w-full min-w-0 px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#181818] text-neutral-900 dark:text-white outline-none"
                            />

                            <button
                              type="button"
                              onClick={handleSaveName}
                              disabled={isSavingName}
                              className="px-3 py-2 rounded-lg bg-black dark:bg-white text-white dark:text-black text-xs font-bold disabled:opacity-50"
                            >
                              {isSavingName ? 'Saving...' : 'Save'}
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                setNameDraft(currentUser.name);
                                setNameError(null);
                                setIsEditingName(false);
                              }}
                              disabled={isSavingName}
                              className="px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 text-xs font-bold"
                            >
                              Cancel
                            </button>
                          </div>

                          {nameError && (
                            <p className="text-xs text-red-600 dark:text-red-400">
                              {nameError}
                            </p>
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 min-w-0">
                          <h2 className="min-w-0 text-base sm:text-lg font-semibold font-sans text-neutral-950 dark:text-white leading-tight">
                            {currentUser.name}
                          </h2>

                          <button
                            type="button"
                            onClick={() => {
                              setNameDraft(currentUser.name);
                              setNameError(null);
                              setIsEditingName(true);
                            }}
                            title="Edit name / company"
                            className="w-7 h-7 rounded-full flex items-center justify-center border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}


                      <div className="mt-2">
                        {(() => {
                          const roleStyles = {
                            'Landlord / Property Owner': {
                              Icon: User,
                              color: '#B8895E',
                              background: 'rgba(184,137,94,0.12)',
                            },
                            Caretaker: {
                              Icon: HardHat,
                              color: '#438D80',
                              background: 'rgba(67,141,128,0.12)',
                            },
                            'Property Manager': {
                              Icon: Briefcase,
                              color: '#547AB0',
                              background: 'rgba(84,122,176,0.12)',
                            },
                            'Real Estate Agent': {
                              Icon: Users,
                              color: '#8E70AB',
                              background: 'rgba(142,112,171,0.12)',
                            },
                            'Property Agency': {
                              Icon: Building2,
                              color: '#BD8550',
                              background: 'rgba(189,133,80,0.12)',
                            },
                            'Property Company': {
                              Icon: Building,
                              color: '#718397',
                              background: 'rgba(113,131,151,0.12)',
                            },
                            'Property Developer': {
                              Icon: ShieldCheck,
                              color: '#B07A87',
                              background: 'rgba(176,122,135,0.12)',
                            },
                          };

                          if (currentUser.role !== 'lister') {
                            return (
                              <div className="inline-flex items-center gap-1.5 rounded-full bg-[#B8895E] px-3 py-1.5 text-xs font-semibold text-white">
                                <User className="h-3.5 w-3.5" />
                                {currentUser.role === 'admin'
                                  ? 'Platform Administrator'
                                  : 'Property Seeker'}
                              </div>
                            );
                          }

                          const subtype = currentUser.listerSubtype || 'Landlord / Property Owner';
                          const style = roleStyles[subtype] || roleStyles['Landlord / Property Owner'];
                          const RoleIcon = style.Icon;

                          return (
                            <div
                              className="inline-flex max-w-full items-center gap-1.5 rounded-full px-3 py-1.5"
                              style={{ backgroundColor: style.background, color: style.color }}
                            >
                              <RoleIcon className="h-3.5 w-3.5 shrink-0" />
                              <span className="min-w-0 text-[11px] font-semibold leading-snug">
                                {subtype}
                              </span>
                            </div>
                          );
                        })()}
                      </div>

                    </div>
                  </div>
                </div>


              </div>


            </div>
            {/* Lister My Profile Card */}
            {currentUser?.role === 'lister' && (
              <div className="bg-[#F7F3EC] dark:bg-[#151515] p-4 rounded-2xl border border-[#E7DED2] dark:border-neutral-800 shadow-[6px_8px_18px_rgba(0,0,0,0.08)] mb-6">
                <button
                  type="button"
                  onClick={() => {
                    setCurrentView('my-profile');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="w-full flex items-center justify-between gap-4 rounded-2xl px-4 py-4 text-left transition-colors hover:bg-black/5 dark:hover:bg-white/5"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-11 h-11 shrink-0 rounded-2xl flex items-center justify-center bg-[#F2E8DA] dark:bg-[#29221B] text-[#B8895E]">
                      <User className="w-5 h-5" />
                    </div>

                    <div className="min-w-0">
                      <h3 className="text-sm font-semibold text-neutral-950 dark:text-white">
                        My Profile
                      </h3>
                      <p className="mt-0.5 text-xs text-neutral-500 dark:text-[#8A8A8A]">
                        Edit your public profile
                      </p>
                    </div>
                  </div>

                  <ChevronRight className="w-4 h-4 shrink-0 text-[var(--rentike-bronze)]" />
                </button>
              </div>
            )}
            {/* Mode Switching Card */}
            <div className="bg-[#F7F3EC] dark:bg-[#151515] p-4 rounded-2xl border border-[#E7DED2] dark:border-neutral-800 shadow-[8px_8px_18px_rgba(28,22,16,0.12),-8px_-8px_18px_rgba(255,255,255,0.95)] dark:shadow-[8px_8px_18px_rgba(0,0,0,0.50),-5px_-5px_12px_rgba(255,255,255,0.035)]">
              <button
                type="button"
                onClick={() => {
                  if (currentUser?.role === 'lister') {
                    setCurrentView('add-property');
                  } else {
                    setCurrentView('role-selection');
                  }

                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="w-full flex items-center justify-between gap-4 rounded-2xl px-4 py-4 text-left transition-all hover:bg-black/5 dark:hover:bg-white/5"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-11 h-11 shrink-0 rounded-2xl flex items-center justify-center bg-[rgba(196,154,108,0.12)] text-[var(--rentike-bronze)]">
                    <Building2 className="w-5 h-5" />
                  </div>

                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold text-neutral-950 dark:text-white">
                      Switch to Lister
                    </h3>

                    <p className="mt-0.5 text-xs text-neutral-500 dark:text-[#8A8A8A]">
                      Manage listings and enquiries.
                    </p>
                  </div>
                </div>

                <ChevronRight className="w-4 h-4 shrink-0 text-[var(--rentike-bronze)]" />
              </button>
            </div>

            <button
              type="button"
              onClick={() => {
                setActiveTab('settings');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="w-full bg-[#F7F3EC] dark:bg-[#151515] p-4 rounded-2xl border border-[#E7DED2] dark:border-neutral-800 shadow-[8px_8px_18px_rgba(28,22,16,0.12),-8px_-8px_18px_rgba(255,255,255,0.95)] dark:shadow-[8px_8px_18px_rgba(0,0,0,0.50),-5px_-5px_12px_rgba(255,255,255,0.035)] flex items-center justify-between gap-4 text-left transition-all"
            >
              <div className="flex items-center gap-4 min-w-0">
                <div className="w-11 h-11 shrink-0 rounded-2xl bg-[#F2E7D8] dark:bg-[#24201C] text-[#B8792B] flex items-center justify-center">
                  <Sliders className="w-5 h-5" />
                </div>

                <div className="min-w-0">
                  <h3 className="text-sm font-semibold text-neutral-950 dark:text-white">
                    Account Settings
                  </h3>

                  <p className="mt-0.5 text-xs text-neutral-500 dark:text-[#8A8A8A]">
                    Manage your contact information and security.
                  </p>
                </div>
              </div>

              <ChevronRight className="w-4 h-4 shrink-0 text-[var(--rentike-bronze)]" />
            </button>
            {/* Billing & Subscription */}
            <button
              type="button"
              onClick={() => {
                setActiveTab('billing');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="w-full bg-[#F7F3EC] dark:bg-[#151515] p-4 rounded-2xl border border-[#E7DED2] dark:border-neutral-800 shadow-[8px_8px_18px_rgba(28,22,16,0.12),-8px_-8px_18px_rgba(255,255,255,0.95)] dark:shadow-[8px_8px_18px_rgba(0,0,0,0.50),-5px_-5px_12px_rgba(255,255,255,0.035)] flex items-center justify-between gap-4 text-left transition-all"
            >
              <div className="flex items-center gap-4 min-w-0">
                <div className="w-11 h-11 shrink-0 rounded-2xl bg-[#F2E7D8] dark:bg-[#24201C] text-[#B8792B] flex items-center justify-center">
                  <CreditCard className="w-5 h-5" />
                </div>

                <div className="min-w-0">
                  <h3 className="text-sm font-semibold text-neutral-950 dark:text-white">
                    Billing & Subscription
                  </h3>

                  <p className="mt-0.5 text-xs text-neutral-500 dark:text-[#8A8A8A]">
                    Manage your plan, usage and payments.
                  </p>
                </div>
              </div>

              <ChevronRight className="w-4 h-4 shrink-0 text-[var(--rentike-bronze)]" />
            </button>


            {/* Terms of Service */}
            <button
              type="button"
              onClick={() => {
                window.location.href = '/terms';
              }}
              className="w-full bg-[#F7F3EC] dark:bg-[#151515] p-4 rounded-2xl border border-[#E7DED2] dark:border-neutral-800 shadow-[8px_8px_18px_rgba(28,22,16,0.12),-8px_-8px_18px_rgba(255,255,255,0.95)] dark:shadow-[8px_8px_18px_rgba(0,0,0,0.50),-5px_-5px_12px_rgba(255,255,255,0.035)] flex items-center justify-between gap-4 text-left transition-all"
            >
              <div className="flex items-center gap-4 min-w-0">
                <div className="w-11 h-11 shrink-0 rounded-2xl bg-[#F2E7D8] dark:bg-[#24201C] text-[#B8792B] flex items-center justify-center">
                  <Info className="w-5 h-5" />
                </div>

                <div className="min-w-0">
                  <h3 className="text-sm font-semibold text-neutral-950 dark:text-white">
                    Terms of Service
                  </h3>
                  <p className="mt-0.5 text-xs text-neutral-500 dark:text-[#8A8A8A]">
                    Read our terms and conditions.
                  </p>
                </div>
              </div>

              <ChevronRight className="w-4 h-4 shrink-0 text-[var(--rentike-bronze)]" />
            </button>
            {/* Privacy Policy */}
            <button
              type="button"
              onClick={() => {
                window.location.href = '/privacy';
              }}
              className="w-full bg-[#F7F3EC] dark:bg-[#151515] p-4 rounded-2xl border border-[#E7DED2] dark:border-neutral-800 shadow-[8px_8px_18px_rgba(28,22,16,0.12),-8px_-8px_18px_rgba(255,255,255,0.95)] dark:shadow-[8px_8px_18px_rgba(0,0,0,0.50),-5px_-5px_12px_rgba(255,255,255,0.035)] flex items-center justify-between gap-4 text-left transition-all"
            >
              <div className="flex items-center gap-4 min-w-0">
                <div className="w-11 h-11 shrink-0 rounded-2xl bg-[#F2E7D8] dark:bg-[#24201C] text-[#B8792B] flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>

                <div className="min-w-0">
                  <h3 className="text-sm font-semibold text-neutral-950 dark:text-white">
                    Privacy Policy
                  </h3>

                  <p className="mt-0.5 text-xs text-neutral-500 dark:text-[#8A8A8A]">
                    How we collect and use your information.
                  </p>
                </div>
              </div>

              <ChevronRight className="w-4 h-4 shrink-0 text-[var(--rentike-bronze)]" />
            </button>
            {/* Help & Support */}
            <button
              type="button"
              onClick={() => setActiveHelpModal('faq')}
              className="w-full bg-[#F7F3EC] dark:bg-[#151515] p-4 rounded-2xl border border-[#E7DED2] dark:border-neutral-800 shadow-[8px_8px_18px_rgba(28,22,16,0.12),-8px_-8px_18px_rgba(255,255,255,0.95)] dark:shadow-[8px_8px_18px_rgba(0,0,0,0.50),-5px_-5px_12px_rgba(255,255,255,0.035)] flex items-center justify-between gap-4 text-left transition-all"
            >
              <div className="flex items-center gap-4 min-w-0">
                <div className="w-11 h-11 shrink-0 rounded-2xl bg-[#F2E7D8] dark:bg-[#24201C] text-[#B8792B] flex items-center justify-center">
                  <CircleHelp className="w-5 h-5" />
                </div>

                <div className="min-w-0">
                  <h3 className="text-sm font-semibold text-neutral-950 dark:text-white">
                    Help & Support
                  </h3>

                  <p className="mt-0.5 text-xs text-neutral-500 dark:text-[#8A8A8A]">
                    Get help or browse frequently asked questions.
                  </p>
                </div>
              </div>

              <ChevronRight className="w-4 h-4 shrink-0 text-[var(--rentike-bronze)]" />
            </button>
            {/* Contact Us */}
            <button
              type="button"
              onClick={() => setActiveHelpModal('contact')}
              className="w-full bg-[#F7F3EC] dark:bg-[#151515] p-4 rounded-2xl border border-[#E7DED2] dark:border-neutral-800 shadow-[8px_8px_18px_rgba(28,22,16,0.12),-8px_-8px_18px_rgba(255,255,255,0.95)] dark:shadow-[8px_8px_18px_rgba(0,0,0,0.50),-5px_-5px_12px_rgba(255,255,255,0.035)] flex items-center justify-between gap-4 text-left transition-all"
            >
              <div className="flex items-center gap-4 min-w-0">
                <div className="w-11 h-11 shrink-0 rounded-2xl bg-[#F2E7D8] dark:bg-[#24201C] text-[#B8792B] flex items-center justify-center">
                  <Mail className="w-5 h-5" />
                </div>

                <div className="min-w-0">
                  <h3 className="text-sm font-semibold text-neutral-950 dark:text-white">
                    Contact Us
                  </h3>

                  <p className="mt-0.5 text-xs text-neutral-500 dark:text-[#8A8A8A]">
                    Send us a message.
                  </p>
                </div>
              </div>

              <ChevronRight className="w-4 h-4 shrink-0 text-[var(--rentike-bronze)]" />
            </button>

            {/* Log Out */}
            <button
              type="button"
              onClick={logoutUser}
              className="w-full bg-[#F7F3EC] dark:bg-[#151515] p-4 rounded-2xl border border-red-200 dark:border-red-900/50 shadow-[8px_8px_18px_rgba(28,22,16,0.12),-8px_-8px_18px_rgba(255,255,255,0.95)] dark:shadow-[8px_8px_18px_rgba(0,0,0,0.50),-5px_-5px_12px_rgba(255,255,255,0.035)] flex items-center justify-between gap-4 text-left transition-all"
            >
              <div className="flex items-center gap-4 min-w-0">
                <div className="w-11 h-11 shrink-0 rounded-2xl bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 flex items-center justify-center">
                  <LogOut className="w-5 h-5" />
                </div>

                <div className="min-w-0">
                  <h3 className="text-sm font-semibold text-red-600 dark:text-red-400">
                    Log out
                  </h3>

                  <p className="mt-0.5 text-xs text-neutral-500 dark:text-[#8A8A8A]">
                    Sign out of your Rentike account.
                  </p>
                </div>
              </div>

              <ChevronRight className="w-4 h-4 shrink-0 text-red-500" />
            </button>
          </div>
        )}
        {/* ======================================================== */}
        {/* TAB 2: BILLING & SUBSCRIPTION                            */}
        {/* ======================================================== */}
        {activeTab === 'billing' && (
          <div className="space-y-8 animate-in fade-in duration-150 font-sans">
            {/* Seeker / Admin Account Notice */}
            {!isLister ? (
              <div className="relative bg-[#F7F3EC] dark:bg-[#151515] rounded-2xl border border-[#E7DED2] dark:border-neutral-800 shadow-[8px_8px_18px_rgba(28,22,16,0.12),-8px_-8px_18px_rgba(255,255,255,0.95)] dark:shadow-[8px_8px_18px_rgba(0,0,0,0.50),-5px_-5px_12px_rgba(255,255,255,0.035)] px-5 py-6 text-center">

                {/* Close */}
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('details');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  aria-label="Close billing"
                  className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center text-neutral-500 dark:text-neutral-400 hover:bg-black/5 dark:hover:bg-white/5"
                >
                  <span className="text-lg leading-none">×</span>
                </button>

                <div className="w-12 h-12 mx-auto rounded-2xl bg-[#F2E7D8] dark:bg-[#24201C] text-[#B8792B] flex items-center justify-center">
                  <CreditCard className="w-5 h-5" />
                </div>

                <h2 className="mt-4 text-lg font-editorial font-semibold text-neutral-950 dark:text-white">
                  Billing & Subscription
                </h2>

                <p className="mt-2 text-xs leading-relaxed text-neutral-500 dark:text-[#8A8A8A] max-w-[260px] mx-auto">
                  Subscription management is available in Lister mode.
                </p>

                <button
                  type="button"
                  onClick={() => switchUserMode('lister')}
                  className="mt-5 w-full flex items-center justify-center gap-2 rounded-xl bg-[#B8792B] px-4 py-3 text-xs font-bold text-white transition-opacity hover:opacity-90"
                >
                  <span>Switch to Lister</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <>
                {/* 1. CURRENT PLAN SUMMARY CARD */}
                <div className="bg-white dark:bg-[#111111] rounded-3xl p-6 sm:p-8 border border-neutral-200 dark:border-[#262626] shadow-xs space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-neutral-100 dark:border-[#222222]">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold uppercase tracking-wider bg-black dark:bg-white text-white dark:text-black px-2.5 py-0.5 rounded">
                          Current Plan
                        </span>
                        <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-900/50">
                          Subscription: {subscription.status}
                        </span>
                      </div>
                      <h2 className="text-2xl sm:text-3xl font-editorial font-semibold text-neutral-950 dark:text-[#F5F5F5] tracking-tight mt-1">
                        {currentPlan.name} Plan
                      </h2>
                      <p className="text-xs text-neutral-500 dark:text-[#A3A3A3]">
                        {currentPlan.minListings}–{currentPlan.maxListings} Active Listings Allowance • KSh {currentPlan.monthlyPrice.toLocaleString()} / month
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        id="btn-manage-plan"
                        onClick={() => setSelectedPlanForCheckout(currentPlan)}
                        className="px-4 py-2 bg-white dark:bg-[#181818] text-black dark:text-white font-bold text-xs rounded-xl border border-neutral-300 dark:border-[#333333] hover:border-black dark:hover:border-white transition-all cursor-pointer shadow-2xs"
                      >
                        Manage Plan
                      </button>
                      <button
                        type="button"
                        id="btn-cancel-plan-trigger"
                        onClick={() => setCancelModalOpen(true)}
                        className="px-3.5 py-2 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 font-bold text-xs rounded-xl border border-neutral-200 dark:border-[#303030] transition-all cursor-pointer"
                      >
                        Cancel Plan
                      </button>
                    </div>
                  </div>

                  {/* ACTIVE LISTING USAGE PROGRESS */}
                  <div className="space-y-3 p-5 bg-neutral-50 dark:bg-[#161616] rounded-2xl border border-neutral-200 dark:border-[#292929]">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <div>
                        <span className="text-xs font-bold text-neutral-900 dark:text-[#F5F5F5] uppercase tracking-wider block">
                          Active Listings Used
                        </span>
                        <span className="text-xl sm:text-2xl font-black text-neutral-950 dark:text-[#F5F5F5]">
                          {activeListingsCount} of {listingLimit} active listings used
                        </span>
                      </div>
                      <div className="text-sm font-bold text-neutral-600 dark:text-[#D5D5D5] sm:text-right">
                        {remainingSlots > 0 ? (
                          <span className="text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-lg border border-emerald-200 dark:border-emerald-900/50 inline-block">
                            {remainingSlots} listing slots remaining
                          </span>
                        ) : (
                          <span className="text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 px-2.5 py-1 rounded-lg border border-rose-200 dark:border-rose-900/50 inline-block">
                            Listing capacity reached
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-2.5 bg-neutral-200 dark:bg-[#2A2A2A] rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${isAtOrOverLimit ? 'bg-rose-600 dark:bg-rose-500' : 'bg-black dark:bg-white'
                          }`}
                        style={{ width: `${Math.max(5, usagePercentage)}%` }}
                      />
                    </div>

                    {isAtOrOverLimit && (
                      <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                        <span className="font-semibold text-rose-700 dark:text-rose-400">
                          You have reached your plan's active listing limit.
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            const businessPlan = SUBSCRIPTION_PLANS.find((p) => p.id === 'business');
                            if (businessPlan) setSelectedPlanForCheckout(businessPlan);
                          }}
                          className="font-bold text-black dark:text-white hover:underline cursor-pointer flex items-center gap-1"
                        >
                          <span>Upgrade to Business Plan</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Billing Details & Auto-Renew Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 text-xs">
                    <div className="p-4 bg-white dark:bg-[#161616] rounded-2xl border border-neutral-200 dark:border-[#292929] space-y-1">
                      <span className="text-neutral-500 dark:text-[#8A8A8A] font-medium block">Monthly Price</span>
                      <span className="text-lg font-black text-neutral-950 dark:text-[#F5F5F5] block">
                        KSh {currentPlan.monthlyPrice.toLocaleString()}
                      </span>
                      <span className="text-[10px] text-neutral-400 dark:text-[#7D7D7D]">Billed monthly</span>
                    </div>

                    <div className="p-4 bg-white dark:bg-[#161616] rounded-2xl border border-neutral-200 dark:border-[#292929] space-y-1">
                      <span className="text-neutral-500 dark:text-[#8A8A8A] font-medium block">Next Renewal Date</span>
                      <span className="text-base font-bold text-neutral-950 dark:text-[#F5F5F5] block">
                        {subscription.renewalDate}
                      </span>
                      <span className="text-[10px] text-neutral-400 dark:text-[#7D7D7D]">
                        Renewal reminder: 2 days before billing date ({subscription.reminderDate})
                      </span>
                    </div>

                    <div className="p-4 bg-white dark:bg-[#161616] rounded-2xl border border-neutral-200 dark:border-[#292929] space-y-2 flex flex-col justify-between">
                      <div>
                        <span className="text-neutral-500 dark:text-[#8A8A8A] font-medium block">Auto-Renew Status</span>
                        <span className="text-sm font-bold text-neutral-950 dark:text-[#F5F5F5] block">
                          {subscription.autoRenew ? 'Enabled (Automatic)' : 'Disabled'}
                        </span>
                      </div>
                      <label className="flex items-center gap-2 cursor-pointer pt-1 border-t border-neutral-100 dark:border-[#262626]">
                        <input
                          type="checkbox"
                          checked={subscription.autoRenew}
                          onChange={handleToggleAutoRenew}
                          className="w-4 h-4 rounded text-black focus:ring-black accent-black cursor-pointer"
                        />
                        <span className="text-[11px] font-semibold text-neutral-700 dark:text-[#D5D5D5]">
                          Automatically renew subscription
                        </span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Downgrade Warning Notice if user selected a lower capacity */}
                {downgradeWarningPlan && (
                  <div className="p-4 bg-neutral-50 dark:bg-[#181818] border border-neutral-300 dark:border-[#333333] rounded-3xl flex items-start gap-3 text-xs text-neutral-900 dark:text-[#F5F5F5] animate-in fade-in">
                    <AlertTriangle className="w-5 h-5 text-neutral-700 dark:text-[#D5D5D5] shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <h4 className="font-bold text-sm text-neutral-950 dark:text-[#F5F5F5]">
                        Cannot Switch to {downgradeWarningPlan.name} (Active Listings Exceeded)
                      </h4>
                      <p className="text-neutral-700 dark:text-[#A3A3A3] leading-relaxed">
                        You currently have <strong>{activeListingsCount} active listings</strong>.{' '}
                        {downgradeWarningPlan.name} supports up to{' '}
                        <strong>{downgradeWarningPlan.maxListings} active listings</strong>.
                        You will need to reduce your active listings before switching to {downgradeWarningPlan.name}.
                      </p>
                      <button
                        type="button"
                        onClick={() => setDowngradeWarningPlan(null)}
                        className="text-[11px] font-bold text-neutral-900 dark:text-white underline mt-1 cursor-pointer"
                      >
                        Dismiss Notice
                      </button>
                    </div>
                  </div>
                )}

                {/* 2. THREE SUBSCRIPTION PLAN CARDS */}
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xl font-editorial font-semibold text-neutral-950 dark:text-[#F5F5F5]">Subscription Plans</h3>
                    <p className="text-xs text-neutral-500 dark:text-[#8A8A8A]">
                      Choose the capacity tier that fits your Kenyan property portfolio.
                    </p>
                  </div>

                  {/* Desktop: 3 Cards Side-by-Side horizontally, Mobile: Stacked */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {SUBSCRIPTION_PLANS.map((plan) => {
                      const isCurrent = plan.id === subscription.planId;

                      return (
                        <div
                          key={plan.id}
                          id={`plan-card-${plan.id}`}
                          className={`rounded-3xl p-6 sm:p-7 border flex flex-col justify-between transition-all relative ${isCurrent
                            ? 'bg-neutral-950 dark:bg-[#181818] text-white border-neutral-950 dark:border-white ring-2 ring-neutral-950/20 dark:ring-white/20 shadow-lg'
                            : plan.popular
                              ? 'bg-white dark:bg-[#131313] text-neutral-900 dark:text-[#F5F5F5] border-neutral-900 dark:border-neutral-400 shadow-md'
                              : 'bg-white dark:bg-[#111111] text-neutral-900 dark:text-[#F5F5F5] border-neutral-200 dark:border-[#2A2A2A] shadow-xs hover:border-neutral-400 dark:hover:border-neutral-500'
                            }`}
                        >
                          {/* Top Badges */}
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <span
                                className={`text-xs font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md ${isCurrent
                                  ? 'bg-white dark:bg-white text-black dark:text-black'
                                  : 'bg-neutral-100 dark:bg-[#202020] text-neutral-800 dark:text-[#E5E5E5]'
                                  }`}
                              >
                                {plan.name}
                              </span>

                              {isCurrent ? (
                                <span className="bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                                  Current Plan
                                </span>
                              ) : plan.popular ? (
                                <span className="bg-black dark:bg-white text-white dark:text-black text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                                  Most Popular
                                </span>
                              ) : null}
                            </div>

                            {/* Allowance & Price */}
                            <div>
                              <div className="text-xs font-bold uppercase tracking-wide opacity-75">
                                {plan.minListings}–{plan.maxListings} Active Listings
                              </div>
                              <div className="mt-2 flex items-baseline gap-1">
                                <span className="text-3xl font-black tracking-tight font-editorial">
                                  KSh {plan.monthlyPrice.toLocaleString()}
                                </span>
                                <span className="text-xs opacity-75 font-sans">/ month</span>
                              </div>
                            </div>

                            {/* Suitable for */}
                            <div className="pt-3 border-t border-current/10 space-y-1.5">
                              <span className="text-[11px] font-bold uppercase tracking-wider opacity-60 block">
                                Suitable for:
                              </span>
                              <ul className="text-xs space-y-1">
                                {plan.suitableFor.map((item, idx) => (
                                  <li key={idx} className="flex items-center gap-1.5">
                                    <Check className="w-3.5 h-3.5 shrink-0 opacity-80" />
                                    <span>{item}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>

                          {/* Action Button */}
                          <div className="pt-6 mt-6 border-t border-current/10 font-sans">
                            {isCurrent ? (
                              <button
                                type="button"
                                disabled
                                className="w-full py-3 px-4 rounded-xl font-bold text-xs bg-white/20 text-white cursor-default text-center flex items-center justify-center gap-1.5"
                              >
                                <Check className="w-4 h-4" />
                                <span>Active Current Plan</span>
                              </button>
                            ) : (
                              <button
                                type="button"
                                id={`btn-choose-${plan.id}`}
                                onClick={() => handleSelectPlan(plan)}
                                className={`w-full py-3 px-4 rounded-xl font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 ${plan.popular
                                  ? 'bg-black dark:bg-white hover:bg-neutral-800 dark:hover:bg-neutral-200 text-white dark:text-black shadow-sm'
                                  : 'bg-neutral-100 dark:bg-[#202020] hover:bg-neutral-200 dark:hover:bg-[#2A2A2A] text-neutral-900 dark:text-[#F5F5F5]'
                                  }`}
                              >
                                <span>Choose {plan.name}</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Portfolio Enterprise Callout under Business card */}
                  <div className="p-6 bg-white dark:bg-[#111111] rounded-3xl border border-neutral-200 dark:border-[#262626] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-neutral-700 dark:text-[#D5D5D5]" />
                        <h4 className="text-sm font-bold text-neutral-950 dark:text-[#F5F5F5]">
                          Managing more than 50 active listings?
                        </h4>
                      </div>
                      <p className="text-xs text-neutral-500 dark:text-[#A3A3A3]">
                        Get custom portfolio pricing, automated billing invoices, and multi-caretaker sub-accounts.
                      </p>
                    </div>

                    <button
                      type="button"
                      id="btn-contact-makaohub"
                      onClick={() => setPortfolioModalOpen(true)}
                      className="px-4 py-2.5 bg-neutral-100 dark:bg-[#1C1C1C] hover:bg-neutral-200 dark:hover:bg-[#282828] text-neutral-900 dark:text-[#F5F5F5] font-bold rounded-xl text-xs transition-all cursor-pointer whitespace-nowrap self-start sm:self-auto flex items-center gap-1.5 border border-neutral-200 dark:border-[#2E2E2E]"
                    >
                      <span>Contact MakaoHub</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* 3. ACTIVE LISTING DEFINITION EXPLAINER */}
                <div className="p-5 bg-neutral-50 dark:bg-[#141414] rounded-3xl border border-neutral-200 dark:border-[#262626] space-y-2 text-xs text-neutral-600 dark:text-[#A3A3A3]">
                  <div className="flex items-center gap-2 font-bold text-neutral-900 dark:text-[#F5F5F5]">
                    <Info className="w-4 h-4 text-neutral-500 dark:text-[#8A8A8A] shrink-0" />
                    <span>How Active Listing Limits Work on MakaoHub</span>
                  </div>
                  <p className="leading-relaxed">
                    Subscription allowances are calculated based on <strong>Active Published Listings</strong>.
                    A single building listing with multiple vacant units (e.g. 20 bedsitters or 8 one-bedrooms)
                    counts as <strong>ONE listing</strong>. Archived or draft properties do not consume plan slots.
                  </p>
                </div>

                {/* 4. PAYMENT HISTORY SECTION */}
                <div className="bg-white dark:bg-[#111111] rounded-3xl p-6 sm:p-8 border border-neutral-200 dark:border-[#262626] shadow-xs space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-[#222222]">
                    <div>
                      <h3 className="text-base font-bold text-neutral-950 dark:text-[#F5F5F5]">Payment History</h3>
                      <p className="text-xs text-neutral-500 dark:text-[#8A8A8A]">
                        Invoices, transaction references, and renewal receipts
                      </p>
                    </div>
                  </div>

                  <div className="p-8 text-center bg-neutral-50 dark:bg-[#161616] rounded-2xl border border-neutral-200 dark:border-[#262626] space-y-2">
                    <div className="w-10 h-10 rounded-full bg-white dark:bg-[#202020] border border-neutral-200 dark:border-[#303030] flex items-center justify-center mx-auto text-neutral-400 dark:text-[#7D7D7D]">
                      <CreditCard className="w-4 h-4" />
                    </div>
                    <div className="font-bold text-neutral-800 dark:text-[#F5F5F5] text-xs">
                      No payment history yet.
                    </div>
                    <p className="text-[11px] text-neutral-500 dark:text-[#8A8A8A] max-w-sm mx-auto">
                      Later backend integration will populate: date, amount, plan, payment method, transaction reference, and downloadable PDF receipts.
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 3: SETTINGS                                          */}
        {/* ======================================================== */}
        {activeTab === 'settings' && (
          <div className="space-y-6 animate-in fade-in duration-150 font-sans">


            <button
              type="button"
              onClick={() => {
                setActiveTab('details');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="inline-flex items-center gap-2 text-xs font-medium text-neutral-600 dark:text-neutral-300 hover:text-[var(--rentike-bronze)] transition-colors"
            >
              <span className="text-base leading-none">←</span>
              Back
            </button>

            {/* Account Settings Header */}
            {/* Account Settings Header */}
            <div className="pb-2">
              <h2 className="text-[22px] font-editorial font-medium text-neutral-950 dark:text-white">
                Account Settings
              </h2>
              <p className="mt-1 text-xs text-neutral-500 dark:text-[#8A8A8A]">
                Manage your contact information and security.
              </p>
            </div>

            {/* Account Information */}
            <div className="bg-[#F7F3EC] dark:bg-[#151515] rounded-2xl border border-[#E7DED2] dark:border-neutral-800 shadow-[8px_8px_18px_rgba(28,22,16,0.12),-8px_-8px_18px_rgba(255,255,255,0.95)] dark:shadow-[8px_8px_18px_rgba(0,0,0,0.50),-5px_-5px_12px_rgba(255,255,255,0.035)] overflow-hidden">

              {/* Email */}
              <div className="flex items-center justify-between gap-4 px-4 py-4 border-b border-[#E7DED2] dark:border-neutral-800">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 shrink-0 rounded-xl bg-[#F2E7D8] dark:bg-[#24201C] text-[#B8792B] flex items-center justify-center">
                    <Mail className="w-4 h-4" />
                  </div>

                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-neutral-900 dark:text-white">
                      Email Address
                    </p>
                    <p className="mt-0.5 text-xs text-neutral-500 dark:text-[#8A8A8A] truncate">
                      {currentUser.email}
                    </p>
                  </div>
                </div>

                <ChevronRight className="w-4 h-4 shrink-0 text-neutral-400" />
              </div>

              {/* Phone */}
              <div className="flex items-center justify-between gap-4 px-4 py-4 border-b border-[#E7DED2] dark:border-neutral-800">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 shrink-0 rounded-xl bg-[#F2E7D8] dark:bg-[#24201C] text-[#B8792B] flex items-center justify-center">
                    <Phone className="w-4 h-4" />
                  </div>

                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-neutral-900 dark:text-white">
                      Phone Number
                    </p>
                    <p className="mt-0.5 text-xs text-neutral-500 dark:text-[#8A8A8A]">
                      {currentUser.phone || 'Not added'}
                    </p>
                  </div>
                </div>

                <ChevronRight className="w-4 h-4 shrink-0 text-neutral-400" />
              </div>

              {/* Password */}
              <div className="flex items-center justify-between gap-4 px-4 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 shrink-0 rounded-xl bg-[#F2E7D8] dark:bg-[#24201C] text-[#B8792B] flex items-center justify-center">
                    <Lock className="w-4 h-4" />
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-neutral-900 dark:text-white">
                      Change Password
                    </p>
                    <p className="mt-0.5 text-xs text-neutral-500 dark:text-[#8A8A8A]">
                      Keep your account secure
                    </p>
                  </div>
                </div>

                <ChevronRight className="w-4 h-4 shrink-0 text-neutral-400" />
              </div>
            </div>

            {/* Delete Account */}
            {currentUser?.role !== 'admin' && (
              <button
                type="button"
                onClick={handleDeleteAccount}
                className="w-full bg-[#F7F3EC] dark:bg-[#151515] rounded-2xl border border-red-200 dark:border-red-900/50 shadow-[8px_8px_18px_rgba(28,22,16,0.10),-8px_-8px_18px_rgba(255,255,255,0.90)] dark:shadow-[8px_8px_18px_rgba(0,0,0,0.45),-5px_-5px_12px_rgba(255,255,255,0.03)] px-4 py-4 flex items-center justify-between gap-4 text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 shrink-0 rounded-xl bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 flex items-center justify-center">
                    <AlertTriangle className="w-4 h-4" />
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-red-600 dark:text-red-400">
                      Delete Account
                    </p>
                    <p className="mt-0.5 text-xs text-neutral-500 dark:text-[#8A8A8A]">
                      Permanently remove your account
                    </p>
                  </div>
                </div>

                <ChevronRight className="w-4 h-4 shrink-0 text-red-500" />
              </button>
            )}
          </div>
        )}
      </div>
      <HelpAndLegalModals
        activeModal={activeHelpModal}
        onClose={() => setActiveHelpModal(null)}
      />
      {/* Delete Account Modal */}
      {
        deleteModalOpen && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center px-4">
            <div
              className="absolute inset-0 bg-black/75 backdrop-blur-sm"
              onClick={() => {
                if (!isDeletingAccount) setDeleteModalOpen(false);
              }}
            />

            <div className="relative w-full max-w-md rounded-2xl border border-red-900/60 bg-[#111111] p-6 shadow-2xl">
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-full border border-red-800 bg-red-950/70">
                <AlertTriangle className="h-6 w-6 text-red-500" />
              </div>

              <h2 className="text-xl font-editorial font-semibold text-white">
                Delete Account?
              </h2>

              <p className="mt-2 text-sm leading-6 text-neutral-400">
                This action is permanent and cannot be undone.
              </p>

              {currentUser?.role === 'lister' && (
                <div className="mt-4 rounded-xl border border-red-900/50 bg-red-950/20 p-4">
                  <p className="text-sm leading-6 text-red-300">
                    All property listings associated with your account will also be
                    permanently deleted.
                  </p>
                </div>
              )}

              <div className="mt-6 flex gap-3">
                <button
                  type="button"
                  disabled={isDeletingAccount}
                  onClick={() => setDeleteModalOpen(false)}
                  className="flex-1 rounded-xl border border-neutral-700 px-4 py-3 text-sm font-semibold text-white hover:bg-neutral-800 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  disabled={isDeletingAccount}
                  onClick={confirmDeleteAccount}
                  className="flex-1 rounded-xl bg-red-600 px-4 py-3 text-sm font-semibold text-white hover:bg-red-700 transition-colors disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isDeletingAccount ? 'Deleting...' : 'Delete Account'}
                </button>
              </div>
            </div>
          </div>
        )
      }


      {/* Account Deletion Verification Modal */}
      {
        deleteVerificationOpen && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center px-4">
            <div
              className="absolute inset-0 bg-black/75 backdrop-blur-sm"
              onClick={() => {
                if (!isDeletingAccount) {
                  setDeleteVerificationOpen(false);
                  setDeleteVerificationCode('');
                  setDeleteVerificationError('');
                }
              }}
            />

            <div className="relative w-full max-w-md rounded-2xl border border-red-900/60 bg-[#111111] p-6 shadow-2xl">
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-full border border-red-800 bg-red-950/70">
                <Lock className="h-6 w-6 text-red-500" />
              </div>

              <h2 className="text-xl font-editorial font-semibold text-white">
                Verify Your Identity
              </h2>

              <p className="mt-2 text-sm leading-6 text-neutral-400">
                We sent a verification code to your email. Enter it below to continue
                deleting your account.
              </p>

              <input
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                value={deleteVerificationCode}
                onChange={(e) => {
                  setDeleteVerificationCode(e.target.value);
                  setDeleteVerificationError('');
                }}
                placeholder="Enter verification code"
                disabled={isDeletingAccount}
                className="mt-5 w-full rounded-xl border border-neutral-700 bg-[#181818] px-4 py-3 text-white outline-none transition focus:border-red-500 disabled:opacity-50"
              />

              {deleteVerificationError && (
                <p className="mt-3 text-sm text-red-400">
                  {deleteVerificationError}
                </p>
              )}

              <div className="mt-6 flex gap-3">
                <button
                  type="button"
                  disabled={isDeletingAccount}
                  onClick={() => {
                    setDeleteVerificationOpen(false);
                    setDeleteVerificationCode('');
                    setDeleteVerificationError('');
                  }}
                  className="flex-1 rounded-xl border border-neutral-700 px-4 py-3 text-sm font-semibold text-white hover:bg-neutral-800 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  disabled={isDeletingAccount}
                  onClick={completeDeleteVerification}
                  className="flex-1 rounded-xl bg-red-600 px-4 py-3 text-sm font-semibold text-white hover:bg-red-700 transition-colors disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isDeletingAccount ? 'Verifying...' : 'Verify & Delete'}
                </button>
              </div>
            </div>
          </div>
        )
      }
      {/* Checkout Modal */}
      {
        selectedPlanForCheckout && (
          <SubscriptionCheckoutModal
            isOpen={Boolean(selectedPlanForCheckout)}
            onClose={() => setSelectedPlanForCheckout(null)}
            selectedPlan={selectedPlanForCheckout}
            currentActiveListings={activeListingsCount}
            userName={currentUser.name}
            userPhone={currentUser.phone}
          />
        )
      }



      {/* Portfolio Enterprise Modal */}
      {
        portfolioModalOpen && (
          <ContactPortfolioModal
            isOpen={portfolioModalOpen}
            onClose={() => setPortfolioModalOpen(false)}
            userName={currentUser.name}
            userEmail={currentUser.email}
            userPhone={currentUser.phone}
          />
        )
      }

      {/* Cancel Subscription Modal */}
      {
        cancelModalOpen && (
          <CancelSubscriptionModal
            isOpen={cancelModalOpen}
            onClose={() => setCancelModalOpen(false)}
            planName={currentPlan.name}
            renewalDate={subscription.renewalDate}
            onConfirmCancel={handleConfirmCancel}
          />
        )
      }
    </div >
  );
};
