"use client";

import { useState, useMemo, useEffect, useRef, memo } from "react";
import WorldMap from "react-svg-worldmap";
import { CountryState } from "@/types";
import { AnimatePresence } from "framer-motion";
import CountryTooltip from "@/components/CountryTooltip";
import { COUNTRY_NAMES } from "@/lib/countryNames";

interface WorldMapContainerProps {
  countryStates: Map<string, CountryState>;
  onCountryHover?: (countryCode: string | null) => void;
}

function WorldMapContainer({
  countryStates,
  onCountryHover,
}: WorldMapContainerProps) {
  const [hoveredCountry, setHoveredCountry] = useState<{
    code: string;
    name: string;
    count: number;
    x: number;
    y: number;
  } | null>(null);
  const [tapTimeout, setTapTimeout] = useState<NodeJS.Timeout | null>(null);
  const [animatingCountries, setAnimatingCountries] = useState<Set<string>>(
    new Set()
  );
  const previousStatesRef = useRef<Map<string, number>>(new Map());
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Detect if mounted (client-side only)
  useEffect(() => {
    setIsMounted(true);
    setIsTouchDevice("ontouchstart" in window);
  }, []);

  // Detect reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  // Track country state changes and trigger animations
  useEffect(() => {
    const newAnimating = new Set<string>();

    countryStates.forEach((state, code) => {
      const previousBand = previousStatesRef.current.get(code);

      // If glow_band changed, trigger animation
      if (previousBand !== undefined && previousBand !== state.glow_band) {
        newAnimating.add(code.toLowerCase());
      }

      // Update previous state
      previousStatesRef.current.set(code, state.glow_band);
    });

    if (newAnimating.size > 0 && !prefersReducedMotion) {
      setAnimatingCountries(newAnimating);

      // Clear animation state after animation completes
      const timeout = setTimeout(() => {
        setAnimatingCountries(new Set());
      }, 1000); // Match animation duration

      return () => clearTimeout(timeout);
    }
  }, [countryStates, prefersReducedMotion]);

  // Convert country states to react-svg-worldmap data format
  const mapData = useMemo(() => {
    const data: Array<{ country: string; value: number }> = [];

    countryStates.forEach((state, code) => {
      // Map to lowercase for react-svg-worldmap compatibility
      data.push({
        country: code.toLowerCase(),
        value: state.glow_band,
      });
    });

    return data;
  }, [countryStates]);

  // Map glow_band to color
  const getColorForBand = (band: number): string => {
    switch (band) {
      case 0:
        return "#334155"; // slate-700 (off)
      case 1:
        return "rgba(251, 191, 36, 0.4)"; // amber-600/40 (warm)
      case 2:
        return "rgba(245, 158, 11, 0.7)"; // amber-500/70 (bright)
      case 3:
        return "#fbbf24"; // amber-400 (radiant)
      default:
        return "#334155";
    }
  };

  const handleCountryClick = (event: any, countryCode: string) => {
    const code = countryCode.toUpperCase();
    const state = countryStates.get(code);

    if (!state) return;

    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX || rect.left + rect.width / 2;
    const y = event.clientY || rect.top + rect.height / 2;

    // Clear any existing timeout
    if (tapTimeout) {
      clearTimeout(tapTimeout);
    }

    setHoveredCountry({
      code,
      name: COUNTRY_NAMES[code] || code,
      count: state.activation_count,
      x,
      y,
    });

    onCountryHover?.(code);

    // Auto-dismiss after 3 seconds on mobile
    const timeout = setTimeout(() => {
      setHoveredCountry(null);
      onCountryHover?.(null);
    }, 3000);

    setTapTimeout(timeout);
  };

  const handleCountryHover = (event: any, countryCode: string) => {
    // Only handle hover on desktop (not touch devices)
    if (!isMounted || isTouchDevice) return;

    const code = countryCode.toUpperCase();
    const state = countryStates.get(code);

    if (!state) return;

    setHoveredCountry({
      code,
      name: COUNTRY_NAMES[code] || code,
      count: state.activation_count,
      x: event.clientX,
      y: event.clientY,
    });

    onCountryHover?.(code);
  };

  const handleCountryLeave = () => {
    // Only handle on desktop
    if (!isMounted || isTouchDevice) return;

    setHoveredCountry(null);
    onCountryHover?.(null);
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (tapTimeout) {
        clearTimeout(tapTimeout);
      }
    };
  }, [tapTimeout]);

  // Don't render map on server to avoid hydration mismatch
  if (!isMounted) {
    return (
      <div className="relative w-full max-w-5xl mx-auto">
        <div className="relative w-full h-[480px] flex items-center justify-center bg-slate-900/20 rounded-lg">
          <div className="text-slate-500 text-sm">Loading map...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full max-w-6xl mx-auto">
      <div
        className="relative w-full bg-transparent rounded-xl overflow-hidden"
        style={{
          // Remove white background from the map container
          background: "transparent",
        }}
        onMouseMove={(e) => {
          // Track mouse position for hover tooltips
          const target = e.target as HTMLElement;
          if (
            target.tagName === "path" &&
            target.getAttribute("data-country")
          ) {
            const countryCode = target.getAttribute("data-country") || "";
            handleCountryHover(e, countryCode);
          }
        }}
        onMouseLeave={handleCountryLeave}
        onClick={(e) => {
          // Handle tap/click for mobile
          const target = e.target as HTMLElement;
          if (
            target.tagName === "path" &&
            target.getAttribute("data-country")
          ) {
            const countryCode = target.getAttribute("data-country") || "";
            handleCountryClick(e, countryCode);
          }
        }}
      >
        <div className="worldmap-wrapper">
          <WorldMap
            color="#334155"
            value-suffix="band"
            size="responsive"
            data={mapData}
            styleFunction={(context: any) => {
              const band = context.countryValue || 0;
              const color = getColorForBand(band);
              const isAnimating = animatingCountries.has(context.countryCode);

              // Base styles
              const baseStyles: any = {
                fill: color,
                stroke: "#1e293b",
                strokeWidth: 0.5,
                cursor: "pointer",
                transition: "fill 0.3s ease",
              };

              // Add breathe animation if country state changed
              if (isAnimating && !prefersReducedMotion) {
                baseStyles.animation = "breathe-pulse 1s ease-out";
                baseStyles.filter =
                  "drop-shadow(0 0 8px rgba(251, 191, 36, 0.6))";
              }

              return baseStyles;
            }}
          />
        </div>
      </div>

      {/* Tooltip */}
      <AnimatePresence>
        {hoveredCountry && (
          <CountryTooltip
            countryCode={hoveredCountry.code}
            countryName={hoveredCountry.name}
            activationCount={hoveredCountry.count}
            position={{ x: hoveredCountry.x, y: hoveredCountry.y }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// Memoize component to prevent unnecessary re-renders
export default memo(WorldMapContainer, (prevProps, nextProps) => {
  // Custom comparison: only re-render if countryStates Map has changed
  if (prevProps.countryStates.size !== nextProps.countryStates.size) {
    return false;
  }
  
  // Check if any country state values have changed
  for (const [code, state] of nextProps.countryStates) {
    const prevState = prevProps.countryStates.get(code);
    if (!prevState || 
        prevState.activation_count !== state.activation_count ||
        prevState.glow_band !== state.glow_band) {
      return false;
    }
  }
  
  // onCountryHover function reference comparison
  return prevProps.onCountryHover === nextProps.onCountryHover;
});
