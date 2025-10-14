'use client';

import { useGlobalStore } from '@/store/globalStore';
import WorldMapContainer from '@/components/WorldMapContainer';

export default function HeroSection() {
  const countryStates = useGlobalStore((state) => state.countryStates);
  const setHoveredCountry = useGlobalStore((state) => state.setHoveredCountry);

  return (
    <section className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8 gap-8">
      {/* Central Locker - Placeholder for now */}
      <div className="text-center">
        <div className="text-slate-400 text-lg">
          CentralLocker will go here
        </div>
      </div>

      {/* World Map */}
      <div className="w-full max-w-6xl">
        <WorldMapContainer
          countryStates={countryStates}
          onCountryHover={setHoveredCountry}
        />
      </div>
    </section>
  );
}
