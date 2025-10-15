'use client';

import { motion } from 'framer-motion';
import { useEffect, useState, memo } from 'react';

interface CountryTooltipProps {
  countryCode: string | null;
  countryName: string;
  activationCount: number;
  position: { x: number; y: number };
}

function CountryTooltip({
  countryCode,
  countryName,
  activationCount,
  position,
}: CountryTooltipProps) {
  const [adjustedPosition, setAdjustedPosition] = useState(position);

  useEffect(() => {
    // Adjust position to keep tooltip within viewport
    const tooltipWidth = 200;
    const tooltipHeight = 80;
    const padding = 16;

    let x = position.x + 12; // Offset from cursor
    let y = position.y + 12;

    // Check right edge
    if (x + tooltipWidth > window.innerWidth - padding) {
      x = position.x - tooltipWidth - 12;
    }

    // Check bottom edge
    if (y + tooltipHeight > window.innerHeight - padding) {
      y = position.y - tooltipHeight - 12;
    }

    // Check left edge
    if (x < padding) {
      x = padding;
    }

    // Check top edge
    if (y < padding) {
      y = padding;
    }

    setAdjustedPosition({ x, y });
  }, [position]);

  if (!countryCode) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className="fixed z-50 pointer-events-none"
      style={{
        left: adjustedPosition.x,
        top: adjustedPosition.y,
      }}
    >
      <div className="bg-slate-900/95 backdrop-blur-md border border-amber-500/30 rounded-lg shadow-2xl px-4 py-3 min-w-[180px]">
        {/* Country Name */}
        <div className="text-white font-semibold text-sm mb-1">
          {countryName}
        </div>
        
        {/* Country Code */}
        <div className="text-slate-400 text-xs mb-2">
          {countryCode}
        </div>
        
        {/* Activation Count */}
        <div className="flex items-center gap-2">
          <div className="text-amber-400 text-xs font-medium">
            Activations:
          </div>
          <div className="text-white text-lg font-bold">
            {activationCount}
          </div>
        </div>
        
        {/* Glow indicator */}
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-amber-400 rounded-full blur-sm opacity-60" />
      </div>
    </motion.div>
  );
}

// Memoize component to prevent unnecessary re-renders
export default memo(CountryTooltip);
