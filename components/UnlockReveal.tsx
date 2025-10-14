'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useGlobalStore } from '@/store/globalStore';

// Generate smoke particles with random positions from center
const generateSmokeParticles = (count: number) => {
  return Array.from({ length: count }, (_, i) => {
    const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5; // Distribute evenly in circle
    const distance = Math.random() * 300 + 200; // Distance from center
    return {
      id: i,
      x: Math.cos(angle) * distance, // X position based on angle
      y: Math.sin(angle) * distance - Math.random() * 200, // Y position (slightly upward bias)
      scale: Math.random() * 1.2 + 0.8, // Particle size variation
      rotation: Math.random() * 360,
      delay: Math.random() * 0.1,
    };
  });
};

export default function UnlockReveal() {
  const lockerState = useGlobalStore((state) => state.lockerState);
  const [showContent, setShowContent] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [smokeParticles] = useState(() => generateSmokeParticles(20));
  const contentRef = useRef<HTMLDivElement>(null);
  const hasShownOnce = useRef(false);
  
  // Show modal immediately when unlocked (including on page load)
  useEffect(() => {
    if (lockerState?.is_unlocked && !hasShownOnce.current) {
      setShowContent(true);
      hasShownOnce.current = true;
    }
  }, [lockerState?.is_unlocked]);
  
  // Focus management - move focus to revealed content for accessibility
  useEffect(() => {
    if (showContent && contentRef.current) {
      contentRef.current.focus();
    }
  }, [showContent]);
  
  const handleClose = () => {
    setIsClosing(true);
    // Wait for animation to complete before hiding
    setTimeout(() => {
      setShowContent(false);
      setIsClosing(false);
    }, 1000);
  };
  
  if (!lockerState?.is_unlocked || !showContent) {
    return null;
  }

  return (
    <motion.div
      key="unlock-reveal-modal"
      initial={{ opacity: 0 }}
      animate={{ opacity: isClosing ? 0 : 1 }}
      transition={{ duration: 0.4 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/95 backdrop-blur-xl"
      role="dialog"
      aria-modal="true"
      aria-labelledby="unlock-title"
    >
      {/* Smoke Particles - only show when closing, ABOVE modal */}
      {isClosing && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none flex items-center justify-center z-20">
          {smokeParticles.map((particle) => (
            <motion.div
              key={particle.id}
              initial={{
                x: 0,
                y: 0,
                scale: 0,
                opacity: 0,
              }}
              animate={{
                x: particle.x,
                y: particle.y,
                scale: [0, particle.scale * 1.5, particle.scale * 3],
                opacity: [0, 1, 0],
                rotate: particle.rotation,
              }}
              transition={{
                duration: 1.2,
                delay: 0.1 + particle.delay, // Start after modal begins shrinking
                ease: [0.22, 1, 0.36, 1],
              }}
              className="absolute w-56 h-56 rounded-full"
              style={{
                background: 'radial-gradient(circle, rgba(255, 255, 255, 0.9) 0%, rgba(203, 213, 225, 0.6) 40%, rgba(148, 163, 184, 0.2) 100%)',
                filter: 'blur(20px)',
                boxShadow: '0 0 40px rgba(255, 255, 255, 0.3)',
              }}
            />
          ))}
        </div>
      )}
        
        <motion.div
          ref={contentRef}
          initial={{ scale: 0.8, opacity: 0, y: 50 }}
          animate={
            isClosing
              ? {
                  scale: [1, 0.98, 0.85, 0.6, 0.2],
                  opacity: [1, 1, 0.8, 0.4, 0],
                  y: [0, 0, 5, 15, 30],
                  rotateZ: [0, -1, 1, -2, 3],
                  filter: [
                    'blur(0px) brightness(1)',
                    'blur(0px) brightness(1)',
                    'blur(3px) brightness(0.9)',
                    'blur(8px) brightness(0.6)',
                    'blur(15px) brightness(0.3)',
                  ],
                }
              : { scale: 1, opacity: 1, y: 0, rotateZ: 0, filter: 'blur(0px) brightness(1)' }
          }
          exit={{ scale: 0.2, opacity: 0, y: 30 }}
          transition={
            isClosing
              ? {
                  duration: 0.7,
                  ease: [0.4, 0, 0.6, 1],
                  times: [0, 0.15, 0.4, 0.7, 1],
                }
              : {
                  type: 'spring',
                  stiffness: 200,
                  damping: 20,
                  duration: 0.6,
                }
          }
          className="max-w-2xl mx-4 p-8 sm:p-12 bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-md rounded-3xl border-2 border-amber-500/40 shadow-2xl shadow-amber-500/30 relative z-10"
          tabIndex={-1}
        >
          <div className="text-center">
            {/* Celebratory Icon with Gold Glow */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{
                type: "spring",
                stiffness: 200,
                damping: 15,
                delay: 0.2
              }}
              className="mb-8"
            >
              <div className="inline-block p-6 bg-gradient-to-br from-amber-500/30 to-yellow-500/30 rounded-full mb-4 relative">
                {/* Pulsing glow effect */}
                <motion.div
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.5, 0.8, 0.5]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="absolute inset-0 bg-gradient-to-br from-amber-400/40 to-yellow-400/40 rounded-full blur-xl"
                />
                
                {/* Unlocked padlock icon */}
                <svg
                  width="80"
                  height="80"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="relative z-10 text-amber-300"
                  style={{
                    filter: 'drop-shadow(0 0 16px rgba(251, 191, 36, 0.8))',
                  }}
                >
                  {/* Open shackle */}
                  <path
                    d="M8 10V7C8 5.34315 9.34315 4 11 4H13C14.6569 4 16 5.34315 16 7V8"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    className="text-amber-400"
                  />
                  {/* Lock body */}
                  <rect
                    x="6"
                    y="10"
                    width="12"
                    height="10"
                    rx="2"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    fill="currentColor"
                    fillOpacity="0.2"
                    className="text-amber-400"
                  />
                  {/* Keyhole */}
                  <circle
                    cx="12"
                    cy="15"
                    r="2"
                    fill="currentColor"
                    className="text-amber-300"
                  />
                </svg>
              </div>
            </motion.div>
            
            {/* Title with gradient */}
            <motion.h2
              id="unlock-title"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-4xl sm:text-5xl font-bold mb-6 bg-gradient-to-r from-amber-300 via-yellow-300 to-amber-400 bg-clip-text text-transparent"
            >
              Congratulations!
            </motion.h2>
            
            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-lg sm:text-xl text-slate-200 mb-8 leading-relaxed"
            >
              The global unlock goal has been reached!<br />
              Your exclusive content is now available.
            </motion.p>
            
            {/* Content Card with Course Link */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="p-8 bg-slate-800/60 backdrop-blur-sm rounded-2xl border border-amber-500/30 mb-8 shadow-lg shadow-amber-500/10"
            >
              <p className="text-slate-300 mb-6 text-lg">
                🎓 Your exclusive course is now available
              </p>
              <a
                href="#"
                className="inline-block px-8 py-4 bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-900 font-bold text-lg rounded-xl hover:from-amber-400 hover:to-yellow-400 transition-all duration-300 shadow-xl hover:shadow-amber-500/50 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-amber-500/50"
              >
                Access Course Now
              </a>
            </motion.div>
            
            {/* Close button */}
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              onClick={handleClose}
              disabled={isClosing}
              className="text-sm text-slate-400 hover:text-slate-200 transition-colors underline focus:outline-none focus:ring-2 focus:ring-amber-500/50 rounded px-2 py-1 disabled:opacity-50"
            >
              Close
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
  );
}
