
import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import rentikeLogo from '../assets/2D light mode.webp';
import { ResolvedTheme } from '../types';

interface SplashScreenProps {
  isOpen: boolean;
  theme: ResolvedTheme;
  onComplete: () => void;
  durationMs?: number;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({
  isOpen,
  onComplete,
  durationMs = 5000
}) => {

  // Preserve original scroll-lock behaviour
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

  // Preserve original completion behaviour
  useEffect(() => {
    if (!isOpen) return;

    const timer = setTimeout(() => {
      onComplete();
    }, durationMs);

    return () => clearTimeout(timer);
  }, [isOpen, durationMs, onComplete]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          id="rentike-splash-screen"
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{
            duration: 0.45,
            ease: [0.4, 0, 0.2, 1]
          }}
          className="fixed inset-0 z-[99999] w-full h-[100dvh] flex items-center justify-center select-none overflow-hidden"
          style={{
            backgroundColor: '#F7F3EC'
          }}
        >
          <motion.img
            src={rentikeLogo}
            alt="Rentike"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              duration: 0.7,
              ease: [0.22, 1, 0.36, 1]
            }}
            className="pointer-events-none select-none object-contain w-40 h-40 sm:w-48 sm:h-48"
            draggable={false}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};
