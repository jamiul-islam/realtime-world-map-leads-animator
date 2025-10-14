'use client';

import { useGlobalStore } from '@/store/globalStore';

export default function UnlockReveal() {
  const lockerState = useGlobalStore((state) => state.lockerState);
  
  if (!lockerState?.is_unlocked) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/90 backdrop-blur-xl">
      <div className="max-w-2xl mx-4 p-8 bg-gradient-to-br from-navy-800/80 to-navy-900/80 backdrop-blur-md rounded-2xl border border-cyan-500/30 shadow-2xl shadow-cyan-500/20">
        <div className="text-center">
          <div className="mb-6">
            <div className="inline-block p-4 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 rounded-full mb-4">
              <svg
                width="64"
                height="64"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="text-cyan-300"
                style={{
                  filter: 'drop-shadow(0 0 12px rgba(34, 211, 238, 0.6))',
                }}
              >
                <path
                  d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
                  fill="currentColor"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>
          
          <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-cyan-300 via-purple-300 to-cyan-400 bg-clip-text text-transparent">
            Congratulations!
          </h2>
          
          <p className="text-lg text-slate-200 mb-6">
            The global unlock goal has been reached! 
            Access your exclusive content below.
          </p>
          
          <div className="p-6 bg-navy-800/50 backdrop-blur-sm rounded-lg border border-cyan-500/20 mb-6">
            <p className="text-slate-300 mb-4">
              Your exclusive course is now available:
            </p>
            <a
              href="#"
              className="inline-block px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-semibold rounded-lg hover:from-cyan-400 hover:to-purple-400 transition-all duration-300 shadow-lg hover:shadow-cyan-500/50"
            >
              Access Course
            </a>
          </div>
          
          <button
            onClick={() => {
              // This will be handled by parent component or store action
              window.location.reload();
            }}
            className="text-sm text-slate-400 hover:text-slate-200 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
