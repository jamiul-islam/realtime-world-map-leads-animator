'use client';

import { useGlobalStore } from '@/store/globalStore';
import WorldMapContainer from '@/components/WorldMapContainer';

export default function HeroSection() {
  const countryStates = useGlobalStore((state) => state.countryStates);
  const setHoveredCountry = useGlobalStore((state) => state.setHoveredCountry);

  return (
    <section className="flex-1 flex items-center justify-center px-4 sm:px-8 pt-24 pb-6">
      {/* World Map - Now takes full available space */}
      <div className="w-full max-w-7xl flex items-center justify-center">
        <WorldMapContainer
          countryStates={countryStates}
          onCountryHover={setHoveredCountry}
        />
      </div>
    </section>
  );
}
