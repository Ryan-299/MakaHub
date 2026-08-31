import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import mobileDarkSplash from '../assets/Opening Screen Dark mode.png';
import mobileLightSplash from '../assets/Opening Screen Light mode.png';
import desktopDarkSplash from '../assets/MakaoDarkDesktop.png';
import desktopLightSplash from '../assets/MakaoLightDesktop.png';
import { ResolvedTheme } from '../types';

interface SplashScreenProps {
  isOpen: boolean;
  theme: ResolvedTheme;
  onComplete: () => void;
  durationMs?: number;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({
  isOpen,
  theme,
  onComplete,
  durationMs = 5000
}) => {
  // Capture initial startup theme so splash never switches mid-animation if theme toggles
  const initialThemeRef = useRef<ResolvedTheme>(theme);
  const isDark = initialThemeRef.current === 'dark';

  // Track responsive breakpoint (768px)
  const [isDesktop, setIsDesktop] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 768;
    }
    return true;
  });

  // Lock body scrolling during splash display
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mediaQuery = window.matchMedia('(min-width: 768px)');
    
    const handler = (e: MediaQueryListEvent) => {
      setIsDesktop(e.matches);
    };

    setIsDesktop(mediaQuery.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // Auto-dismiss automatically after durationMs (~5.0s prototype visibility)
  useEffect(() => {
    if (!isOpen) return;

    const timer = setTimeout(() => {
      onComplete();
    }, durationMs);

    return () => clearTimeout(timer);
  }, [isOpen, durationMs, onComplete]);

  // Asset selection based on theme and device
  const mobileSplashImage = isDark ? mobileDarkSplash : mobileLightSplash;
  const desktopSplashImage = isDark ? desktopDarkSplash : desktopLightSplash;
  const currentSplashImage = isDesktop ? desktopSplashImage : mobileSplashImage;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          id="makaohub-splash-screen"
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
          className={`fixed inset-0 z-[99999] w-screen h-screen flex items-center justify-center select-none overflow-hidden ${
            isDark ? 'bg-[#000000]' : 'bg-white'
          }`}
          style={{
            backgroundColor: isDark ? '#000000' : '#FFFFFF'
          }}
        >
          {/* Full-bleed Responsive Splash Display without any overlay or obstruction */}
          <div className="relative w-full h-full flex items-center justify-center p-0 m-0 overflow-hidden">
            <picture className="w-full h-full flex items-center justify-center">
              {/* Desktop source for >= 768px viewport */}
              <source
                media="(min-width: 768px)"
                srcSet={desktopSplashImage}
              />
              {/* Mobile fallback image for < 768px viewport */}
              <img
                src={currentSplashImage}
                alt={isDark ? 'MakaoHub Dark Splash Screen' : 'MakaoHub Light Splash Screen'}
                className={`w-full h-full pointer-events-none select-none ${
  isDesktop && !isDark ? 'object-cover' : 'object-contain'
}`}
                draggable={false}
              />
            </picture>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
