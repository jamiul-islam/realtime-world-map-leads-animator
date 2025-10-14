'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface CentralLockerProps {
  energyPercentage: number;
  isUnlocked: boolean;
  onUnlockComplete?: () => void;
}

type LockerStage = 'dark' | 'warming' | 'golden' | 'radiant' | 'unlocked';

function getLockerStage(percentage: number, isUnlocked: boolean): LockerStage {
  if (isUnlocked) return 'unlocked';
  if (percentage >= 75) return 'radiant';
  if (percentage >= 50) return 'golden';
  if (percentage >= 25) return 'warming';
  return 'dark';
}

export default function CentralLocker({ 
  energyPercentage, 
  isUnlocked,
  onUnlockComplete 
}: CentralLockerProps) {
  const prefersReducedMotion = useReducedMotion();
  const [stage, setStage] = useState<LockerStage>('dark');
  const [previousPercentage, setPreviousPercentage] = useState(energyPercentage);
  const [showMicroPulse, setShowMicroPulse] = useState(false);
  const [showThresholdPulse, setShowThresholdPulse] = useState(false);
  const [isUnlocking, setIsUnlocking] = useState(false);

  // Update stage when percentage changes
  useEffect(() => {
    const newStage = getLockerStage(energyPercentage, isUnlocked);
    setStage(newStage);

    // Detect percentage increment
    if (energyPercentage > previousPercentage) {
      // Trigger micro-pulse
      setShowMicroPulse(true);
      setTimeout(() => setShowMicroPulse(false), 300);

      // Check for threshold crossing (25%, 50%, 75%)
      const thresholds = [25, 50, 75];
      const crossedThreshold = thresholds.some(
        threshold => previousPercentage < threshold && energyPercentage >= threshold
      );

      if (crossedThreshold) {
        setShowThresholdPulse(true);
        setTimeout(() => setShowThresholdPulse(false), 600);
      }
    }

    // Trigger unlock sequence
    if (!isUnlocked && energyPercentage >= 100) {
      setIsUnlocking(true);
      setTimeout(() => {
        setIsUnlocking(false);
        onUnlockComplete?.();
      }, 2000);
    }

    setPreviousPercentage(energyPercentage);
  }, [energyPercentage, isUnlocked, previousPercentage, onUnlockComplete]);

  // Stage-based styling
  const getStageStyles = () => {
    switch (stage) {
      case 'dark':
        return {
          opacity: 0.4,
          glow: 'drop-shadow(0 0 10px rgba(100, 116, 139, 0.3))',
          fillPrimary: '#475569', // slate-600
          fillSecondary: '#334155', // slate-700
        };
      case 'warming':
        return {
          opacity: 0.6,
          glow: 'drop-shadow(0 0 20px rgba(6, 182, 212, 0.4))',
          fillPrimary: '#06b6d4', // cyan-500
          fillSecondary: '#0891b2', // cyan-600
        };
      case 'golden':
        return {
          opacity: 0.8,
          glow: 'drop-shadow(0 0 30px rgba(251, 191, 36, 0.6))',
          fillPrimary: '#fbbf24', // amber-400
          fillSecondary: '#f59e0b', // amber-500
        };
      case 'radiant':
        return {
          opacity: 1,
          glow: 'drop-shadow(0 0 40px rgba(168, 85, 247, 0.8)) drop-shadow(0 0 60px rgba(6, 182, 212, 0.6))',
          fillPrimary: '#a855f7', // purple-500
          fillSecondary: '#06b6d4', // cyan-500
        };
      case 'unlocked':
        return {
          opacity: 1,
          glow: 'drop-shadow(0 0 50px rgba(251, 191, 36, 1)) drop-shadow(0 0 80px rgba(168, 85, 247, 0.8))',
          fillPrimary: '#fbbf24', // amber-400
          fillSecondary: '#a855f7', // purple-500
        };
    }
  };

  const styles = getStageStyles();

  // Get current animation based on state
  const getCurrentAnimation = () => {
    if (isUnlocking) {
      return prefersReducedMotion
        ? { opacity: [1, 0.5, 1] }
        : {
            scale: [1, 1.3, 1.1],
            rotate: [0, 360],
            opacity: [1, 0.8, 1],
            transition: {
              duration: 2,
              ease: [0.42, 0, 0.58, 1] as const,
            },
          };
    }
    
    if (showThresholdPulse) {
      return prefersReducedMotion
        ? { opacity: [styles.opacity, styles.opacity * 1.2, styles.opacity] }
        : {
            scale: [1, 1.1, 1],
            opacity: [styles.opacity, styles.opacity * 1.2, styles.opacity],
            transition: {
              duration: 0.6,
              ease: [0.4, 0, 1, 1] as const,
            },
          };
    }
    
    if (showMicroPulse) {
      return prefersReducedMotion
        ? { opacity: [styles.opacity, styles.opacity * 1.1, styles.opacity] }
        : {
            scale: [1, 1.05, 1],
            opacity: [styles.opacity, styles.opacity * 1.1, styles.opacity],
            transition: {
              duration: 0.3,
              ease: [0.4, 0, 1, 1] as const,
            },
          };
    }
    
    // Default hum animation
    return prefersReducedMotion
      ? {}
      : {
          scale: [1, 1.02, 1],
          transition: {
            duration: 2,
            repeat: Infinity,
            ease: [0.42, 0, 0.58, 1] as const,
          },
        };
  };

  return (
    <div className="flex items-center justify-center">
      <motion.div
        animate={getCurrentAnimation()}
        style={{
          opacity: styles.opacity,
          filter: styles.glow,
        }}
        className="relative"
      >
        {/* Locker SVG */}
        <svg
          width="200"
          height="240"
          viewBox="0 0 200 240"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-48 h-auto sm:w-64 md:w-80"
        >
          {/* Locker body */}
          <rect
            x="40"
            y="80"
            width="120"
            height="140"
            rx="8"
            fill={styles.fillSecondary}
            stroke={styles.fillPrimary}
            strokeWidth="3"
          />
          
          {/* Shackle */}
          <path
            d="M 70 80 Q 70 30, 100 30 Q 130 30, 130 80"
            fill="none"
            stroke={styles.fillPrimary}
            strokeWidth="12"
            strokeLinecap="round"
          />
          
          {/* Keyhole */}
          <circle
            cx="100"
            cy="140"
            r="15"
            fill={styles.fillPrimary}
          />
          <rect
            x="95"
            y="140"
            width="10"
            height="30"
            rx="2"
            fill={styles.fillPrimary}
          />
          
          {/* Energy indicator bars */}
          {[0, 1, 2, 3, 4].map((i) => {
            const barPercentage = (i + 1) * 20;
            const isActive = energyPercentage >= barPercentage;
            return (
              <rect
                key={i}
                x="50"
                y={190 - i * 20}
                width="100"
                height="8"
                rx="4"
                fill={isActive ? styles.fillPrimary : '#1e293b'}
                opacity={isActive ? 1 : 0.3}
              />
            );
          })}
        </svg>

        {/* Percentage display */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center mt-8">
            <div 
              className="text-4xl sm:text-5xl font-bold"
              style={{ color: styles.fillPrimary }}
            >
              {energyPercentage}%
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
