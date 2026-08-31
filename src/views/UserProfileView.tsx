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
  Building2,
  Check,
  Lock,
  Layers,
  ArrowUpRight
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { SUBSCRIPTION_PLANS, DEFAULT_MARY_SUBSCRIPTION } from '../data/subscriptionPlans';
import { ListerSubscriptionPlan, SubscriptionTier, SubscriptionStatus } from '../types';
import { SubscriptionCheckoutModal } from '../components/SubscriptionCheckoutModal';
import { ContactPortfolioModal } from '../components/ContactPortfolioModal';
import { CancelSubscriptionModal } from '../components/CancelSubscriptionModal';

export const UserProfileView: React.FC = () => {
  const {
    currentUser,
    switchUserMode,
    logoutUser,
    setCurrentView,
    properties = [],
    listerListings = []
  } = useApp();

  const [activeTab, setActiveTab] = useState<'details' | 'billing' | 'settings'>('details');
  const [subscription, setSubscription] = useState(DEFAULT_MARY_SUBSCRIPTION);
  const [selectedPlanForCheckout, setSelectedPlanForCheckout] = useState<ListerSubscriptionPlan | null>(null);
  const [portfolioModalOpen, setPortfolioModalOpen] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [downgradeWarningPlan, setDowngradeWarningPlan] = useState<ListerSubscriptionPlan | null>(null);

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
    <div className="min-h-[calc(100vh-4rem)] bg-white dark:bg-black pb-24 text-neutral-900 dark:text-[#F5F5F5] font-sans transition-colors duration-200">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        {/* Header with Title & Account Identity */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-neutral-200 dark:border-[#262626]">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider bg-black dark:bg-white text-white dark:text-black px-2.5 py-0.5 rounded">
                My Account
              </span>
              <span className="text-xs text-neutral-500 dark:text-[#8A8A8A] font-semibold">
                ID: {currentUser.id}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-editorial font-semibold text-neutral-950 dark:text-[#F5F5F5] tracking-tight mt-1">
              Account & Subscription
            </h1>
            <p className="text-xs sm:text-sm text-neutral-500 dark:text-[#A3A3A3] mt-0.5">
              Manage your profile credentials, listing plan allowances, and billing preferences
            </p>
          </div>

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
            {isSeeker && (
              <button
                type="button"
                onClick={() => setCurrentView('tenant-home')}
                className="px-3.5 py-2 text-xs font-bold bg-white dark:bg-[#111111] text-neutral-800 dark:text-[#F5F5F5] border border-neutral-200 dark:border-[#303030] hover:border-black dark:hover:border-white rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <span>Find Rentals</span>
              </button>
            )}
          </div>
        </div>

        {/* Section Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-neutral-200 dark:border-[#262626] overflow-x-auto no-scrollbar pb-px font-sans">
          <button
            type="button"
            id="tab-account-details"
            onClick={() => setActiveTab('details')}
            className={`px-4 py-2.5 text-xs font-bold transition-all border-b-2 flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              activeTab === 'details'
                ? 'border-black dark:border-white text-black dark:text-white'
                : 'border-transparent text-neutral-500 dark:text-[#8A8A8A] hover:text-black dark:hover:text-white hover:border-neutral-300 dark:hover:border-neutral-700'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Account Details</span>
          </button>

          {/* Billing & Subscription Tab - Prominent for Listers */}
          {isLister && (
            <button
              type="button"
              id="tab-billing-subscription"
              onClick={() => setActiveTab('billing')}
              className={`px-4 py-2.5 text-xs font-bold transition-all border-b-2 flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                activeTab === 'billing'
                  ? 'border-black dark:border-white text-black dark:text-white'
                  : 'border-transparent text-neutral-500 dark:text-[#8A8A8A] hover:text-black dark:hover:text-white hover:border-neutral-300 dark:hover:border-neutral-700'
              }`}
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>Billing & Subscription</span>
              <span className="text-[10px] font-bold bg-neutral-100 dark:bg-[#1C1C1C] px-2 py-0.5 rounded-full text-neutral-800 dark:text-[#D5D5D5] border border-neutral-200 dark:border-[#2E2E2E]">
                {activeListingsCount} / {listingLimit} Used
              </span>
            </button>
          )}

          {/* For Seekers or Admins, show Billing as info tab */}
          {!isLister && (
            <button
              type="button"
              id="tab-billing-subscription-info"
              onClick={() => setActiveTab('billing')}
              className={`px-4 py-2.5 text-xs font-bold transition-all border-b-2 flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                activeTab === 'billing'
                  ? 'border-black dark:border-white text-black dark:text-white'
                  : 'border-transparent text-neutral-500 dark:text-[#8A8A8A] hover:text-black dark:hover:text-white hover:border-neutral-300 dark:hover:border-neutral-700'
              }`}
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>Billing & Subscriptions</span>
            </button>
          )}

          <button
            type="button"
            id="tab-account-settings"
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-2.5 text-xs font-bold transition-all border-b-2 flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              activeTab === 'settings'
                ? 'border-black dark:border-white text-black dark:text-white'
                : 'border-transparent text-neutral-500 dark:text-[#8A8A8A] hover:text-black dark:hover:text-white hover:border-neutral-300 dark:hover:border-neutral-700'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Settings</span>
          </button>
        </div>

        {/* ======================================================== */}
        {/* TAB 1: ACCOUNT DETAILS                                   */}
        {/* ======================================================== */}
        {activeTab === 'details' && (
          <div className="space-y-6 animate-in fade-in duration-150 font-sans">
            {/* Primary Profile Card */}
            <div className="bg-white dark:bg-[#111111] rounded-3xl p-6 sm:p-8 border border-neutral-200 dark:border-[#262626] shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div className="flex items-center gap-5">
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="w-20 h-20 rounded-2xl object-cover border-2 border-neutral-100 dark:border-[#2A2A2A] shadow-xs"
                  />
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl sm:text-2xl font-editorial font-semibold text-neutral-950 dark:text-[#F5F5F5]">
                        {currentUser.name}
                      </h2>
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-900/50">
                        <CheckCircle2 className="w-3 h-3" />
                        Verified
                      </span>
                    </div>
                    <div className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-[#8A8A8A]">
                      User ID:{' '}
                      <span className="font-mono text-neutral-800 dark:text-[#D5D5D5] bg-neutral-100 dark:bg-[#1A1A1A] px-1.5 py-0.5 rounded border border-neutral-200 dark:border-[#2C2C2C]">
                        {currentUser.id}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="sm:text-right space-y-1">
                  <span className="text-[11px] font-bold text-neutral-400 dark:text-[#7D7D7D] uppercase tracking-wider block">
                    Account Role
                  </span>
                  <div className="inline-block text-xs font-bold uppercase tracking-wider bg-black dark:bg-white text-white dark:text-black px-3 py-1 rounded-lg">
                    {currentUser.role === 'lister'
                      ? (currentUser.listerSubtype || 'Property Lister / Landlord')
                      : currentUser.role === 'admin'
                      ? 'Platform Administrator'
                      : 'Property Seeker'}
                  </div>
                </div>
              </div>

              {/* Contact & Status Information Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-neutral-100 dark:border-[#222222] text-sm">
                <div className="p-4 bg-neutral-50 dark:bg-[#161616] rounded-2xl border border-neutral-200 dark:border-[#292929] space-y-1">
                  <div className="flex items-center gap-2 text-neutral-500 dark:text-[#8A8A8A] text-xs">
                    <Mail className="w-3.5 h-3.5" />
                    <span>Email Address</span>
                  </div>
                  <div className="font-bold text-neutral-950 dark:text-[#F5F5F5] truncate text-sm">
                    {currentUser.email}
                  </div>
                  <span className="text-[10px] text-neutral-400 dark:text-[#7D7D7D] block">Primary communication</span>
                </div>

                <div className="p-4 bg-neutral-50 dark:bg-[#161616] rounded-2xl border border-neutral-200 dark:border-[#292929] space-y-1">
                  <div className="flex items-center gap-2 text-neutral-500 dark:text-[#8A8A8A] text-xs">
                    <Phone className="w-3.5 h-3.5" />
                    <span>Phone Number</span>
                  </div>
                  <div className="font-bold text-neutral-950 dark:text-[#F5F5F5] text-sm">
                    {currentUser.phone || '+254 712 345 678'}
                  </div>
                  <span className="text-[10px] text-neutral-400 dark:text-[#7D7D7D] block">Safaricom M-PESA registered</span>
                </div>

                <div className="p-4 bg-neutral-50 dark:bg-[#161616] rounded-2xl border border-neutral-200 dark:border-[#292929] space-y-1">
                  <div className="flex items-center gap-2 text-neutral-500 dark:text-[#8A8A8A] text-xs">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Account Status</span>
                  </div>
                  <div className="font-bold text-neutral-950 dark:text-[#F5F5F5] text-sm">
                    Active & Good Standing
                  </div>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold block">Full platform privileges</span>
                </div>
              </div>
            </div>

            {/* Mode Switching Card */}
            <div className="bg-white dark:bg-[#111111] rounded-3xl p-6 sm:p-8 border border-neutral-200 dark:border-[#262626] shadow-xs space-y-4">
              <div>
                <h3 className="text-lg font-editorial font-semibold text-neutral-950 dark:text-[#F5F5F5]">Switch Account Experience</h3>
                <p className="text-xs text-neutral-500 dark:text-[#8A8A8A]">
                  Switch seamlessly between searching for rentals and managing your properties.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                <button
                  type="button"
                  onClick={() => switchUserMode('seeker')}
                  className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                    currentUser.role === 'seeker'
                      ? 'bg-neutral-100 dark:bg-[#1C1C1C] border-black dark:border-white ring-1 ring-black dark:ring-white'
                      : 'bg-white dark:bg-[#151515] hover:bg-neutral-50 dark:hover:bg-[#1C1C1C] border-neutral-200 dark:border-[#2A2A2A]'
                  }`}
                >
                  <div>
                    <span className="text-xs font-bold text-neutral-500 dark:text-[#8A8A8A] uppercase tracking-wider block">
                      Mode 1
                    </span>
                    <span className="font-bold text-neutral-900 dark:text-[#F5F5F5] text-sm">Find a Home (Seeker)</span>
                    <span className="text-xs text-neutral-500 dark:text-[#8A8A8A] block mt-0.5">Explore & save rentals</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-neutral-400 dark:text-[#7D7D7D]" />
                </button>

                <button
                  type="button"
                  onClick={() => switchUserMode('lister')}
                  className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                    currentUser.role === 'lister'
                      ? 'bg-neutral-100 dark:bg-[#1C1C1C] border-black dark:border-white ring-1 ring-black dark:ring-white'
                      : 'bg-white dark:bg-[#151515] hover:bg-neutral-50 dark:hover:bg-[#1C1C1C] border-neutral-200 dark:border-[#2A2A2A]'
                  }`}
                >
                  <div>
                    <span className="text-xs font-bold text-neutral-500 dark:text-[#8A8A8A] uppercase tracking-wider block">
                      Mode 2
                    </span>
                    <span className="font-bold text-neutral-900 dark:text-[#F5F5F5] text-sm">Manage Properties (Lister)</span>
                    <span className="text-xs text-neutral-500 dark:text-[#8A8A8A] block mt-0.5">Listings & vacancy manager</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-neutral-400 dark:text-[#7D7D7D]" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 2: BILLING & SUBSCRIPTION                            */}
        {/* ======================================================== */}
        {activeTab === 'billing' && (
          <div className="space-y-8 animate-in fade-in duration-150 font-sans">
            {/* Seeker / Admin Account Notice */}
            {!isLister ? (
              <div className="bg-white dark:bg-[#111111] rounded-3xl p-8 border border-neutral-200 dark:border-[#262626] shadow-xs text-center space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-neutral-100 dark:bg-[#1A1A1A] text-neutral-800 dark:text-[#F5F5F5] flex items-center justify-center mx-auto border border-neutral-200 dark:border-[#2C2C2C]">
                  <Building2 className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-xl font-editorial font-semibold text-neutral-950 dark:text-[#F5F5F5]">
                    Lister Subscription Plans
                  </h3>
                  <p className="text-xs text-neutral-500 dark:text-[#A3A3A3] max-w-md mx-auto">
                    Subscription plans are designed for Property Landlords, Caretakers, and Property Managers managing rental vacancies in Kenya.
                  </p>
                </div>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => switchUserMode('lister')}
                    className="px-5 py-2.5 bg-black dark:bg-white text-white dark:text-black text-xs font-bold rounded-xl hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-all cursor-pointer inline-flex items-center gap-2"
                  >
                    <span>Switch to Lister Mode to View Plans</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
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
                        className={`h-full transition-all duration-300 ${
                          isAtOrOverLimit ? 'bg-rose-600 dark:bg-rose-500' : 'bg-black dark:bg-white'
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
                          className={`rounded-3xl p-6 sm:p-7 border flex flex-col justify-between transition-all relative ${
                            isCurrent
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
                                className={`text-xs font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md ${
                                  isCurrent
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
                                className={`w-full py-3 px-4 rounded-xl font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                                  plan.popular
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
            {/* Preferences Card */}
            <div className="bg-white dark:bg-[#111111] rounded-3xl p-6 sm:p-8 border border-neutral-200 dark:border-[#262626] shadow-xs space-y-6">
              <div className="pb-4 border-b border-neutral-100 dark:border-[#222222]">
                <h3 className="text-lg font-editorial font-semibold text-neutral-950 dark:text-[#F5F5F5]">Account Preferences</h3>
                <p className="text-xs text-neutral-500 dark:text-[#8A8A8A]">
                  Manage notification reminders and session security
                </p>
              </div>

              <div className="space-y-4 text-xs">
                {isLister && (
                  <div className="flex items-center justify-between p-4 bg-neutral-50 dark:bg-[#161616] rounded-2xl border border-neutral-200 dark:border-[#292929]">
                    <div>
                      <span className="font-bold text-neutral-900 dark:text-[#F5F5F5] block">
                        Subscription Auto-Renew
                      </span>
                      <span className="text-neutral-500 dark:text-[#8A8A8A]">
                        Automatically renews plan on {subscription.renewalDate}
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={subscription.autoRenew}
                      onChange={handleToggleAutoRenew}
                      className="w-4 h-4 rounded text-black focus:ring-black accent-black cursor-pointer"
                    />
                  </div>
                )}

                <div className="flex items-center justify-between p-4 bg-neutral-50 dark:bg-[#161616] rounded-2xl border border-neutral-200 dark:border-[#292929]">
                  <div>
                    <span className="font-bold text-neutral-900 dark:text-[#F5F5F5] block">
                      Enquiry SMS & Email Alerts
                    </span>
                    <span className="text-neutral-500 dark:text-[#8A8A8A]">
                      Receive instant alerts when seekers inquire about your rentals
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    defaultChecked
                    className="w-4 h-4 rounded text-black focus:ring-black accent-black cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-neutral-50 dark:bg-[#161616] rounded-2xl border border-neutral-200 dark:border-[#292929]">
                  <div>
                    <span className="font-bold text-neutral-900 dark:text-[#F5F5F5] block">
                      Renewal Reminder Notifications
                    </span>
                    <span className="text-neutral-500 dark:text-[#8A8A8A]">
                      Alert me 2 days before any scheduled subscription renewal
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    defaultChecked
                    className="w-4 h-4 rounded text-black focus:ring-black accent-black cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Sign Out Card */}
            <div className="bg-white dark:bg-[#111111] rounded-3xl p-6 border border-neutral-200 dark:border-[#262626] shadow-xs space-y-4">
              <div>
                <h3 className="text-base font-editorial font-semibold text-neutral-950 dark:text-[#F5F5F5]">Sign Out</h3>
                <p className="text-xs text-neutral-500 dark:text-[#8A8A8A]">
                  Safely sign out of your current session on this device
                </p>
              </div>

              <button
                type="button"
                id="btn-sign-out"
                onClick={logoutUser}
                className="w-full py-3.5 bg-neutral-100 dark:bg-[#1A1A1A] hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 font-bold rounded-2xl border border-neutral-200 dark:border-[#303030] transition-colors flex items-center justify-center gap-2 cursor-pointer text-xs"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out of MakaoHub</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Checkout Modal */}
      {selectedPlanForCheckout && (
        <SubscriptionCheckoutModal
          isOpen={Boolean(selectedPlanForCheckout)}
          onClose={() => setSelectedPlanForCheckout(null)}
          selectedPlan={selectedPlanForCheckout}
          currentActiveListings={activeListingsCount}
          userName={currentUser.name}
          userPhone={currentUser.phone}
        />
      )}

      {/* Portfolio Enterprise Modal */}
      {portfolioModalOpen && (
        <ContactPortfolioModal
          isOpen={portfolioModalOpen}
          onClose={() => setPortfolioModalOpen(false)}
          userName={currentUser.name}
          userEmail={currentUser.email}
          userPhone={currentUser.phone}
        />
      )}

      {/* Cancel Subscription Modal */}
      {cancelModalOpen && (
        <CancelSubscriptionModal
          isOpen={cancelModalOpen}
          onClose={() => setCancelModalOpen(false)}
          planName={currentPlan.name}
          renewalDate={subscription.renewalDate}
          onConfirmCancel={handleConfirmCancel}
        />
      )}
    </div>
  );
};
