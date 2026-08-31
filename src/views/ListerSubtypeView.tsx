import React, { useState } from 'react';
import { Building, ShieldCheck, User, Users, Briefcase, Building2, HardHat, ArrowLeft, Sun, Moon } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ListerSubtype } from '../types';

const LISTER_SUBTYPES: { title: ListerSubtype; description: string; icon: any }[] = [
  {
    title: 'Landlord / Property Owner',
    description: 'Individual owner managing their own residential rental properties.',
    icon: User
  },
  {
    title: 'Caretaker',
    description: 'On-site building supervisor in charge of tenant onboarding & viewing.',
    icon: HardHat
  },
  {
    title: 'Property Manager',
    description: 'Professional property management company or manager managing properties on behalf of landlords.',
    icon: Briefcase
  },
  {
    title: 'Real Estate Agent',
    description: 'Licensed real estate broker or agent listing available rentals.',
    icon: Users
  },
  {
    title: 'Property Agency',
    description: 'Registered real estate agency managing multiple property portfolios.',
    icon: Building2
  },
  {
    title: 'Property Company',
    description: 'Corporate property holding firm or institutional residential owner.',
    icon: Building
  },
  {
    title: 'Property Developer',
    description: 'Residential developer letting newly constructed apartment complexes.',
    icon: ShieldCheck
  }
];

export const ListerSubtypeView: React.FC = () => {
  const { assignListerSubtype, setCurrentView, resolvedTheme, setTheme } = useApp();
  const isDark = resolvedTheme === 'dark';
  const [selectedSubtype, setSelectedSubtype] = useState<ListerSubtype>('Landlord / Property Owner');

  const handleContinue = (subtype: ListerSubtype) => {
    setSelectedSubtype(subtype);
    assignListerSubtype(subtype);
  };

  const toggleThemeMode = () => {
    if (resolvedTheme === 'dark') {
      setTheme('light');
    } else {
      setTheme('dark');
    }
  };

  return (
    <main
      id="makaohub-lister-subtype-screen"
      className={`min-h-screen w-full flex flex-col justify-between items-center px-6 py-6 sm:py-10 transition-colors duration-200 relative ${
        isDark ? 'bg-black text-white' : 'bg-white text-neutral-900'
      }`}
      style={{
        backgroundColor: isDark ? '#000000' : '#FFFFFF'
      }}
    >
      {/* Top Bar Controls */}
      <header className="w-full max-w-5xl mx-auto flex items-center justify-between z-20">
        <button
          type="button"
          id="lister-subtype-back-btn"
          onClick={() => setCurrentView('role-selection')}
          aria-label="Back to Role Selection"
          className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl transition-all cursor-pointer ${
            isDark
              ? 'text-neutral-400 hover:text-white hover:bg-neutral-900'
              : 'text-neutral-600 hover:text-black hover:bg-neutral-100'
          }`}
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="font-body hidden sm:inline">Back</span>
        </button>

        <button
          type="button"
          id="lister-subtype-theme-toggle-btn"
          onClick={toggleThemeMode}
          title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          className={`p-2.5 rounded-full transition-all cursor-pointer border focus:outline-none focus:ring-2 ${
            isDark
              ? 'bg-neutral-900/90 hover:bg-neutral-800 border-neutral-800 text-neutral-200 hover:text-white focus:ring-white'
              : 'bg-neutral-100 hover:bg-neutral-200 border-neutral-200 text-neutral-700 hover:text-black focus:ring-black'
          }`}
        >
          {isDark ? (
            <Sun className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
          ) : (
            <Moon className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
          )}
        </button>
      </header>

      {/* Main Content Column */}
      <div className="max-w-2xl w-full text-center space-y-6 animate-in fade-in duration-300 my-auto py-6">
        <div>
          <div
            className={`inline-block text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full mb-3 ${
              isDark ? 'bg-white text-black' : 'bg-black text-white'
            }`}
          >
            Lister Profile Setup
          </div>
          <h1
            className={`font-editorial text-3xl sm:text-4xl font-normal tracking-tight mb-2 ${
              isDark ? 'text-white' : 'text-neutral-950'
            }`}
            style={{
              fontFamily: "'Cormorant Garamond', Georgia, Cambria, 'Times New Roman', Times, serif"
            }}
          >
            What best describes you?
          </h1>
          <p
            className={`font-body text-sm sm:text-base max-w-md mx-auto leading-relaxed ${
              isDark ? 'text-neutral-400' : 'text-neutral-600'
            }`}
            style={{
              fontFamily: "'Manrope', 'Plus Jakarta Sans', system-ui, sans-serif"
            }}
          >
            Choose your lister profile category. This will be displayed on your property listings to build trust with tenants.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left font-body">
          {LISTER_SUBTYPES.map((item) => {
            const Icon = item.icon;
            const isSelected = selectedSubtype === item.title;
            return (
              <button
                key={item.title}
                type="button"
                onClick={() => handleContinue(item.title)}
                className={`p-4 rounded-2xl border text-left transition-all duration-150 cursor-pointer flex items-start gap-3.5 select-none ${
                  isSelected
                    ? isDark
                      ? 'bg-neutral-900 text-white border-white shadow-md scale-[1.01]'
                      : 'bg-white text-black border-black shadow-md scale-[1.01]'
                    : isDark
                      ? 'bg-neutral-950/80 hover:bg-neutral-900 text-neutral-300 border-neutral-800 hover:border-neutral-700'
                      : 'bg-neutral-50/70 hover:bg-neutral-100 text-neutral-800 border-neutral-200 hover:border-neutral-300'
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                    isSelected
                      ? isDark
                        ? 'bg-white text-black'
                        : 'bg-black text-white'
                      : isDark
                        ? 'bg-neutral-900 text-neutral-300'
                        : 'bg-neutral-200/80 text-neutral-800'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h4
                    className={`text-sm font-bold leading-snug ${
                      isSelected
                        ? isDark
                          ? 'text-white'
                          : 'text-black'
                        : isDark
                          ? 'text-neutral-100'
                          : 'text-neutral-900'
                    }`}
                  >
                    {item.title}
                  </h4>
                  <p
                    className={`text-xs mt-0.5 leading-relaxed ${
                      isSelected
                        ? isDark
                          ? 'text-neutral-300'
                          : 'text-neutral-700'
                        : isDark
                          ? 'text-neutral-400'
                          : 'text-neutral-500'
                    }`}
                  >
                    {item.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom spacer */}
      <footer className="w-full py-2 flex justify-center opacity-0 pointer-events-none">
        <span className="text-[10px]">MakaoHub</span>
      </footer>
    </main>
  );
};
