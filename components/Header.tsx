'use client';

import { useGlobalStore } from '@/store/globalStore';

export default function Header() {
  const lockerState = useGlobalStore((state) => state.lockerState);
  
  const energyPercentage = lockerState?.energy_percentage ?? 0;
  
  // Calculate progress ring properties
  const radius = 16;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (energyPercentage / 100) * circumference;
  
  return (
    <header className="w-full bg-navy-900/60 backdrop-blur-md border-b border-cyan-500/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between py-4 gap-4">
          {/* Title */}
          <div className="flex items-center gap-3">
            <h1 className="text-xl sm:text-2xl font-semibold bg-gradient-to-r from-cyan-300 via-purple-300 to-cyan-400 bg-clip-text text-transparent">
              Global Unlock
            </h1>
          </div>
          
          {/* Global Percentage Display with Mini Locker Icon */}
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-sm text-slate-300 font-medium">
                Global Progress
              </div>
              <div className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                {energyPercentage}%
              </div>
            </div>
            
            {/* Mini Locker Icon with Progress Ring */}
            <div className="relative">
              {/* Progress Ring SVG */}
              <svg
                className="transform -rotate-90"
                width="48"
                height="48"
                viewBox="0 0 48 48"
              >
                {/* Background circle */}
                <circle
                  cx="24"
                  cy="24"
                  r={radius}
                  stroke="currentColor"
                  strokeWidth="3"
                  fill="none"
                  className="text-slate-700"
                />
                {/* Progress circle */}
                <circle
                  cx="24"
                  cy="24"
                  r={radius}
                  stroke="currentColor"
                  strokeWidth="3"
                  fill="none"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  className="text-cyan-400 transition-all duration-500 ease-out"
                  style={{
                    filter: energyPercentage > 0 ? 'drop-shadow(0 0 6px rgba(34, 211, 238, 0.8))' : 'none',
                  }}
                />
              </svg>
              
              {/* Mini Locker Icon */}
              <div className="absolute inset-0 flex items-center justify-center">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="transition-all duration-300"
                  style={{
                    filter: energyPercentage > 50 
                      ? `drop-shadow(0 0 ${Math.min(energyPercentage / 10, 8)}px rgba(34, 211, 238, ${Math.min(energyPercentage / 100, 0.9)}))` 
                      : 'none',
                  }}
                >
                  {/* Locker body */}
                  <rect
                    x="6"
                    y="10"
                    width="12"
                    height="10"
                    rx="1"
                    stroke="currentColor"
                    strokeWidth="2"
                    fill="none"
                    className={
                      energyPercentage >= 75
                        ? 'text-cyan-300'
                        : energyPercentage >= 50
                        ? 'text-cyan-400'
                        : energyPercentage >= 25
                        ? 'text-cyan-500'
                        : 'text-slate-500'
                    }
                  />
                  {/* Shackle */}
                  <path
                    d="M8 10V7C8 5.34315 9.34315 4 11 4H13C14.6569 4 16 5.34315 16 7V10"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    className={
                      energyPercentage >= 75
                        ? 'text-cyan-300'
                        : energyPercentage >= 50
                        ? 'text-cyan-400'
                        : energyPercentage >= 25
                        ? 'text-cyan-500'
                        : 'text-slate-500'
                    }
                  />
                  {/* Keyhole */}
                  <circle
                    cx="12"
                    cy="14"
                    r="1.5"
                    fill="currentColor"
                    className={
                      energyPercentage >= 75
                        ? 'text-cyan-300'
                        : energyPercentage >= 50
                        ? 'text-cyan-400'
                        : energyPercentage >= 25
                        ? 'text-cyan-500'
                        : 'text-slate-500'
                    }
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
