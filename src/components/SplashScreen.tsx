import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import rentikeDarkLogo from '../assets/2D light mode.webp';
import rentikeLightLogo from '../assets/2D dark (1).webp';
import shenPeacock from '../assets/peacock.png';
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



  // Auto-dismiss automatically after durationMs (~5.0s prototype visibility)
  useEffect(() => {
    if (!isOpen) return;

    const timer = setTimeout(() => {
      onComplete();
    }, durationMs);

    return () => clearTimeout(timer);
  }, [isOpen, durationMs, onComplete]);

  // Select logo based only on theme
  const currentSplashImage = isDark ? rentikeLightLogo : rentikeDarkLogo;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          id="rentike-splash-screen"
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
          className={`fixed inset-0 z-[99999] w-full h-[100dvh] flex items-center justify-center select-none overflow-hidden ${isDark ? 'bg-[#000000]' : 'bg-white'
            }`}
          style={{
            backgroundColor: isDark ? '#000000' : '#F7F5F1',
          }}

        >
          {/* Full-bleed Responsive Splash Display without any overlay or obstruction */}
          <div className="relative w-full h-full flex flex-col items-center justify-center">
            <div className="flex flex-col items-center xl:scale-[0.84] xl:-translate-y-6">
              <motion.div
                className="flex items-end justify-center h-[230px] sm:h-[260px] md:h-[320px] lg:h-[340px] xl:h-[240px]"
                initial={{ opacity: 0, y: 16, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{
                  duration: 0.7,
                  ease: [0.22, 1, 0.36, 1],
                }}
              >

                <img
                  src={currentSplashImage}
                  alt="Rentike"
                  className="
        pointer-events-none
        select-none
        object-contain
        h-full
        w-auto
      "
                  style={{
                    transform: 'translateY(0) scale(1)',
                    transformOrigin: 'center',
                  }}
                  draggable={false}
                />
              </motion.div>

              <h1
                className="font-anurati text-[3.6rem] md:max-xl:text-[5.6rem] xl:text-[5rem]"
                style={{
                  marginTop: '10px',
                  marginBottom: 0,

                  fontWeight: 400,
                  letterSpacing: '0.14em',
                  lineHeight: 1,
                  background: isDark
                    ? 'linear-gradient(180deg, #FFFFFF 0%, #E8E8E8 38%, #AFAFAF 70%, #F2F2F2 100%)'
                    : 'linear-gradient(180deg, #111111 0%, #3A3A3A 45%, #080808 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  textAlign: 'center',
                }}
              >
                RENTIKE
              </h1>

              <motion.p
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.45,
                  delay: 0.55,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="text-[0.56rem] md:max-xl:text-[0.88rem] xl:text-[0.75rem]"
                style={{
                  marginTop: '10px',
                  marginBottom: 0,
                  fontWeight: 500,
                  letterSpacing: '0.28em',
                  color: isDark ? '#C49A6C' : '#9B6A3D',
                  textAlign: 'center',
                }}
              >
                FIND YOUR NEXT HOME
              </motion.p>
            </div>

            {/* Powered by Shen Studios */}
            <div
              style={{
                position: 'absolute',
                bottom: 'max(65px, env(safe-area-inset-bottom, 0px))',
                left: '50%',
                transform: 'translateX(-50%)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}
            >
              <span
                style={{
                  fontSize: 'clamp(0.48rem, 0.75vw, 0.62rem)',
                  fontWeight: 500,
                  letterSpacing: '0.28em',
                  color: isDark ? '#8F8F8F' : '#777777',
                  marginBottom: '12px',
                }}
              >
                POWERED BY
              </span>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '11px',
                }}
              >
                <img
                  src={shenPeacock}
                  alt="Shen Studios"
                  style={{
                    width: 'clamp(27px, 3vw, 36px)',
                    height: 'auto',
                    objectFit: 'contain',
                  }}
                  draggable={false}
                />

                <div
                  style={{
                    width: '1px',
                    height: '30px',
                    backgroundColor: isDark ? '#C49A6C' : '#9B6A3D',
                  }}
                />

                <span
                  className="font-anurati text-[3.2rem] sm:text-[3.6rem] md:text-[5rem] lg:text-[5.6rem]"
                  style={{
                    fontSize: 'clamp(0.78rem, 1.35vw, 1.08rem)',
                    letterSpacing: '0.10em',
                    color: isDark ? '#E8E8E8' : '#171717',
                    whiteSpace: 'nowrap',
                  }}
                >
                  SHEN STUDIOS
                </span>
              </div>
            </div>

          </div>
        </motion.div>
      )
      }
    </AnimatePresence >
  );
};
