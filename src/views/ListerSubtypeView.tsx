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
  const { currentUser, assignListerSubtype, setCurrentView, resolvedTheme, setTheme } = useApp();
  const isDark = resolvedTheme === 'dark';
  const [selectedSubtype, setSelectedSubtype] = useState<ListerSubtype>('Landlord / Property Owner');

  const [error, setError] = useState('');

  const handleContinue = async () => {
    setError('');

    try {
      await assignListerSubtype(selectedSubtype);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to save your lister category. Please try again.'
      );
    }
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
      className={`min-h-screen w-full flex flex-col justify-between items-center px-6 py-6 sm:py-10 transition-colors duration-200 relative ${isDark ? 'bg-black text-white' : 'bg-white text-neutral-900'
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
          onClick={() => {
            if (currentUser?.role === 'seeker') {
              setCurrentView('tenant-home');
            } else {
              setCurrentView('role-selection');
            }
          }}
          aria-label="Back to Role Selection"
          className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl transition-all cursor-pointer ${isDark
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
          className={`p-2.5 rounded-full transition-all cursor-pointer border focus:outline-none focus:ring-2 ${isDark
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
      <div
        className="w-[calc(100%-32px)] sm:w-full max-w-[760px] mx-auto text-center space-y-6 rounded-[28px] px-4 sm:px-8 md:px-10 py-7 sm:py-9 border animate-in fade-in"
        style={{
          backgroundColor: isDark ? '#0D0D0D' : '#FCFAF7',
          borderColor: isDark
            ? 'rgba(196, 154, 108, 0.65)'
            : 'rgba(196, 154, 108, 0.45)',
          boxShadow: isDark
            ? '0 18px 50px rgba(0, 0, 0, 0.35)'
            : '0 18px 50px rgba(28, 22, 16, 0.08)',
        }}
      >
        <div
          className={`inline-block text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full mb-3 ${isDark ? 'bg-white text-black' : 'bg-black text-white'
            }`}
        >
          Lister Profile Setup
        </div>
        <h1
          className={`font-editorial text-3xl sm:text-4xl font-normal tracking-tight mb-2 ${isDark ? 'text-white' : 'text-neutral-950'
            }`}
          style={{
            fontFamily: "'Cormorant Garamond', Georgia, Cambria, 'Times New Roman', Times, serif"
          }}
        >
          What best describes you?
        </h1>
        <p
          className={`font-body text-sm sm:text-base max-w-md mx-auto leading-relaxed ${isDark ? 'text-neutral-400' : 'text-neutral-600'
            }`}
          style={{
            fontFamily: "'Manrope', 'Plus Jakarta Sans', system-ui, sans-serif"
          }}
        >
          Choose your lister profile category. This will be displayed on your property listings to build trust with tenants.
        </p>


        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left font-body">
          {LISTER_SUBTYPES.map((item) => {
            const Icon = item.icon;
            const isSelected = selectedSubtype === item.title;

            const roleColors: Record<string, string> = {
              'Landlord / Property Owner': '#B8895E',
              'Caretaker': '#438D80',
              'Property Manager': '#547AB0',
              'Real Estate Agent': '#8E70AB',
              'Property Agency': '#BD8550',
              'Property Company': '#718397',
              'Property Developer': '#B07A87',
            };

            const accent = roleColors[item.title] || '#B8895E';

            return (
              <button
                key={item.title}
                type="button"
                aria-pressed={isSelected}
                onClick={() => setSelectedSubtype(item.title)}
                className="relative flex w-full min-h-[116px] items-start gap-3.5 rounded-2xl border px-4 py-4 text-left cursor-pointer transition-colors duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                style={{
                  backgroundColor: isSelected
                    ? `${accent}${isDark ? '1A' : '0D'}`
                    : isDark
                      ? '#171717'
                      : '#FFFFFF',
                  borderColor: isSelected
                    ? accent
                    : isDark
                      ? '#343434'
                      : '#E7DED2',
                  outlineColor: accent,
                }}
              >
                {/* Role icon */}
                <div
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
                  style={{
                    backgroundColor: `${accent}${isDark ? '26' : '1A'}`,
                    color: accent,
                  }}
                >
                  <Icon className="h-5 w-5" strokeWidth={2} />
                </div>

                {/* Role information */}
                <div className="min-w-0 flex-1 pr-5">
                  <h4
                    className={`text-sm font-semibold leading-snug ${isDark ? 'text-white' : 'text-neutral-950'
                      }`}
                  >
                    {item.title}
                  </h4>

                  <p
                    className={`mt-1 text-xs leading-relaxed ${isDark ? 'text-neutral-400' : 'text-neutral-500'
                      }`}
                  >
                    {item.description}
                  </p>
                </div>

                {/* Selected indicator */}
                {isSelected && (
                  <span
                    aria-hidden="true"
                    className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold text-white"
                    style={{ backgroundColor: accent }}
                  >
                    ✓
                  </span>
                )}
              </button>
            );
          })}
        </div>


        <div className="mt-8 w-full max-w-md mx-auto">
          {error && (
            <p className="mb-3 text-sm text-red-500">
              {error}
            </p>
          )}

          <button
            type="button"
            onClick={handleContinue}
            className="w-full mt-5 py-3 rounded-xl bg-black text-white font-semibold"
          >
            Continue
          </button>
        </div>

      </div>


      {/* Bottom spacer */}
      <footer className="w-full py-2 flex justify-center opacity-0 pointer-events-none">
        <span className="text-[10px]">Rentike</span>
      </footer>
    </main >
  );
};
