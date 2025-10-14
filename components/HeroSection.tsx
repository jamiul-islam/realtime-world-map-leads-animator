'use client';

import { useGlobalStore } from '@/store/globalStore';
import CentralLocker from './CentralLocker';

export default function HeroSection() {
  const lockerState = useGlobalStore((state) => state.lockerState);

  return (
    <section className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8 gap-8">
      {/* Central Locker */}
      <div className="flex-shrink-0">
        <CentralLocker
          energyPercentage={lockerState?.energy_percentage ?? 0}
          isUnlocked={lockerState?.is_unlocked ?? false}
          onUnlockComplete={() => {
            console.log('Unlock sequence complete!');
          }}
        />
      </div>

      {/* World Map Placeholder */}
      <div className="text-center">
        <div className="text-slate-400 text-lg">
          WorldMap will go here
        </div>
      </div>
    </section>
  );
}
