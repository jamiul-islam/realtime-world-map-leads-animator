'use client';

import { useState, useEffect, useRef, memo } from 'react';
import { useGlobalStore } from '@/store/globalStore';
import { motion, AnimatePresence } from 'framer-motion';

function Header() {
  const lockerState = useGlobalStore((state) => state.lockerState);
  const [showLockerModal, setShowLockerModal] = useState(false);
  const [isUnlocking, setIsUnlocking] = useState(false);
  const previousPercentage = useRef(0);
  
  const energyPercentage = lockerState?.energy_percentage ?? 0;
  const isUnlocked = lockerState?.is_unlocked ?? false;
  
  // Detect unlock trigger (when percentage reaches 100%)
  useEffect(() => {
    if (energyPercentage === 100 && previousPercentage.current < 100 && !isUnlocking) {
      // Trigger unlock animation sequence
      setIsUnlocking(true);
      
      // Reset after animation completes (2000ms as per design)
      const timer = setTimeout(() => {
        setIsUnlocking(false);
      }, 2000);
      
      return () => clearTimeout(timer);
    }
    previousPercentage.current = energyPercentage;
  }, [energyPercentage, isUnlocking]);
  
  return (
    <>
      <header className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-4xl px-4">
        {/* Capsule Navigation Bar */}
        <div className="bg-slate-900/80 backdrop-blur-xl border border-cyan-500/30 rounded-full px-6 py-3 shadow-2xl shadow-cyan-500/20">
          <div className="flex items-center justify-between gap-6">
            {/* Title */}
            <h1 className="text-lg sm:text-xl font-semibold bg-gradient-to-r from-cyan-300 via-purple-300 to-cyan-400 bg-clip-text text-transparent whitespace-nowrap">
              Global Unlock
            </h1>
            
            {/* Progress Display */}
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-xs text-slate-400 font-medium">Progress</div>
                <div className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                  {energyPercentage}%
                </div>
              </div>
              
              {/* Locker Button with Unlock Animation */}
              <motion.button
                onClick={() => setShowLockerModal(true)}
                className="relative group p-2 rounded-full bg-gradient-to-br from-cyan-500/20 to-purple-500/20 hover:from-cyan-500/30 hover:to-purple-500/30 transition-all duration-300 border border-cyan-400/30 hover:border-cyan-400/50"
                aria-label="View Locker"
                animate={isUnlocking ? {
                  scale: [1, 1.3, 1.2, 1.4, 1],
                  rotate: [0, -10, 10, -5, 0],
                } : {
                  scale: 1,
                  rotate: 0
                }}
                transition={isUnlocking ? {
                  duration: 2,
                  ease: "easeInOut"
                } : {}}
              >
                <motion.svg
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="transition-all duration-300 group-hover:scale-110"
                  style={{
                    filter: isUnlocked || isUnlocking
                      ? 'drop-shadow(0 0 12px rgba(251, 191, 36, 0.9))'
                      : energyPercentage > 50 
                      ? `drop-shadow(0 0 ${Math.min(energyPercentage / 10, 8)}px rgba(34, 211, 238, ${Math.min(energyPercentage / 100, 0.9)}))` 
                      : 'drop-shadow(0 0 4px rgba(34, 211, 238, 0.4))',
                  }}
                  animate={isUnlocking ? {
                    opacity: [1, 0.5, 1, 0.5, 1]
                  } : {}}
                  transition={isUnlocking ? {
                    duration: 2,
                    ease: "easeInOut"
                  } : {}}
                >
                  {/* Lock body */}
                  <rect
                    x="6"
                    y="10"
                    width="12"
                    height="10"
                    rx="1"
                    stroke="currentColor"
                    strokeWidth="2"
                    fill="none"
                    className={isUnlocked || isUnlocking ? "text-amber-400" : "text-cyan-400"}
                  />
                  
                  {/* Shackle - open when unlocked */}
                  {isUnlocked ? (
                    <motion.path
                      initial={{ d: "M8 10V7C8 5.34315 9.34315 4 11 4H13C14.6569 4 16 5.34315 16 7V10" }}
                      animate={{ d: "M8 10V7C8 5.34315 9.34315 4 11 4H13C14.6569 4 16 5.34315 16 7V8" }}
                      transition={{ duration: 0.5 }}
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      className="text-amber-400"
                    />
                  ) : (
                    <path
                      d="M8 10V7C8 5.34315 9.34315 4 11 4H13C14.6569 4 16 5.34315 16 7V10"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      className={isUnlocking ? "text-amber-400" : "text-cyan-400"}
                    />
                  )}
                  
                  {/* Keyhole */}
                  <circle
                    cx="12"
                    cy="14"
                    r="1.5"
                    fill="currentColor"
                    className={isUnlocked || isUnlocking ? "text-amber-400" : "text-cyan-400"}
                  />
                </motion.svg>
              </motion.button>
            </div>
          </div>
        </div>
      </header>

      {/* Locker Modal */}
      <AnimatePresence>
        {showLockerModal && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowLockerModal(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            />
            
            {/* Locker Modal */}
            <motion.div
              initial={{ scale: 0, opacity: 0, y: -100 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ 
                scale: 0, 
                opacity: 0,
                y: -50,
                transition: { 
                  duration: 0.3,
                  ease: [0.32, 0, 0.67, 0]
                }
              }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 25
              }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-2xl mx-4"
            >
              <div className={`bg-gradient-to-br from-slate-900/95 to-slate-800/95 backdrop-blur-2xl border-2 rounded-3xl p-8 shadow-2xl ${
                isUnlocked 
                  ? 'border-amber-500/40 shadow-amber-500/30' 
                  : 'border-cyan-500/40 shadow-cyan-500/30'
              }`}>
                <div className="text-center">
                  <h2 className={`text-3xl font-bold bg-gradient-to-r bg-clip-text text-transparent mb-4 ${
                    isUnlocked 
                      ? 'from-amber-300 to-yellow-400' 
                      : 'from-cyan-300 to-purple-400'
                  }`}>
                    {isUnlocked ? 'Unlocked!' : 'Central Locker'}
                  </h2>
                  <p className="text-slate-300 mb-6">
                    {isUnlocked 
                      ? 'The global goal has been achieved!' 
                      : 'Track global progress toward unlock'}
                  </p>
                  <div className={`text-6xl font-bold bg-gradient-to-r bg-clip-text text-transparent ${
                    isUnlocked 
                      ? 'from-amber-400 to-yellow-400' 
                      : 'from-cyan-400 to-purple-400'
                  }`}>
                    {energyPercentage}%
                  </div>
                  
                  {isUnlocked && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="mt-6"
                    >
                      <p className="text-amber-300 text-lg">
                        ✨ Goal Complete ✨
                      </p>
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

// Memoize component to prevent unnecessary re-renders
// Only re-render when locker state changes
export default memo(Header);
