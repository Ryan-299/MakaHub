import React, { useState } from 'react';
import { Sparkles, User, Building2, ShieldCheck, X, Sun, Moon } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const DemoToolbar: React.FC = () => {
  const {
    runSeekerDemo,
    runListerDemo,
    runAdminDemo,
    currentUser,
    currentView,
    resolvedTheme,
    toggleTheme
  } = useApp();
  const [collapsed, setCollapsed] = useState(false);

  // Derive the active flow based on current role and current view hierarchy
  const getActiveFlow = (): 'seeker' | 'lister' | 'admin' => {
    if (currentView === 'admin-dashboard' || currentUser?.role === 'admin') {
      return 'admin';
    }

    const listerViews = [
      'lister-dashboard',
      'my-listings',
      'add-property',
      'lister-enquiries',
      'lister-reviews',
      'lister-subtype'
    ];

    if (listerViews.includes(currentView)) {
      return 'lister';
    }

    if (currentUser?.role === 'lister') {
      return 'lister';
    }

    return 'seeker';
  };

  const activeFlow = getActiveFlow();

  if (collapsed) {
    return (
      <button
        onClick={() => setCollapsed(false)}
        className="fixed bottom-4 right-4 z-40 bg-black text-white text-xs font-bold px-3.5 py-2 rounded-full shadow-2xl border border-neutral-700 flex items-center gap-2 hover:bg-neutral-800 transition-all cursor-pointer"
        title="Show Prototype Flow Switcher"
      >
        <Sparkles className="w-3.5 h-3.5 text-white" />
        <span>Flow Switcher</span>
      </button>
    );
  }

  return (
    <div
      id="makaohub-demo-helper"
      className="bg-black text-white px-4 py-2 text-xs border-b border-neutral-800 flex flex-wrap items-center justify-between gap-3 sticky top-0 z-50 shadow-md"
    >
      <div className="flex items-center gap-2.5">
        <span className="font-extrabold uppercase tracking-wider text-[10px] bg-neutral-800 text-neutral-200 px-2 py-0.5 rounded border border-neutral-700">
          Prototype Demo Flows
        </span>
        <span className="text-neutral-400 hidden sm:inline text-[11px]">
          Active view: <strong className="text-white capitalize">{currentView.replace('-', ' ')}</strong>
        </span>
        {currentUser && (
          <span className="text-neutral-400 hidden md:inline text-[11px]">
            • Role: <strong className="text-white capitalize">{currentUser.role}</strong>
          </span>
        )}
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        {/* 1. Find a Property (Seeker Flow) */}
        <button
          type="button"
          onClick={runSeekerDemo}
          aria-pressed={activeFlow === 'seeker'}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            activeFlow === 'seeker'
              ? 'bg-white text-black border border-white shadow-xs'
              : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white border border-neutral-700'
          }`}
          title="Find a Property (Seeker Flow - Search & Explore Rentals)"
        >
          <User className={`w-3.5 h-3.5 ${activeFlow === 'seeker' ? 'text-black' : 'text-neutral-300'}`} />
          <span>Find a Property</span>
        </button>

        {/* 2. List a Property (Lister Flow) */}
        <button
          type="button"
          onClick={runListerDemo}
          aria-pressed={activeFlow === 'lister'}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            activeFlow === 'lister'
              ? 'bg-white text-black border border-white shadow-xs'
              : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white border border-neutral-700'
          }`}
          title="List a Property (Lister Flow - Dashboard, My Listings & Vacancy Manager)"
        >
          <Building2 className={`w-3.5 h-3.5 ${activeFlow === 'lister' ? 'text-black' : 'text-neutral-300'}`} />
          <span>List a Property</span>
        </button>

        {/* 3. Admin Flow */}
        <button
          type="button"
          onClick={runAdminDemo}
          aria-pressed={activeFlow === 'admin'}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            activeFlow === 'admin'
              ? 'bg-white text-black border border-white shadow-xs'
              : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white border border-neutral-700'
          }`}
          title="Admin Flow - Moderation, Approvals & Verification Portal"
        >
          <ShieldCheck className={`w-3.5 h-3.5 ${activeFlow === 'admin' ? 'text-black' : 'text-neutral-300'}`} />
          <span>Admin</span>
        </button>

        <div className="h-4 w-px bg-neutral-800 mx-1 hidden sm:block" />

        {/* 4. Theme Switcher (Light / Dark Mode) */}
        <button
          type="button"
          id="toolbar-theme-toggle"
          onClick={toggleTheme}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white border border-neutral-700 transition-all cursor-pointer"
          title={`Currently ${resolvedTheme === 'dark' ? 'Dark' : 'Light'} Mode. Click to switch.`}
        >
          {resolvedTheme === 'dark' ? (
            <Sun className="w-3.5 h-3.5 text-amber-400" />
          ) : (
            <Moon className="w-3.5 h-3.5 text-blue-300" />
          )}
          <span className="capitalize">{resolvedTheme === 'dark' ? 'Dark Mode' : 'Light Mode'}</span>
        </button>

        <button
          type="button"
          onClick={() => setCollapsed(true)}
          className="text-neutral-400 hover:text-white p-1 rounded-md hover:bg-neutral-800 transition-colors cursor-pointer ml-1"
          title="Hide toolbar"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

