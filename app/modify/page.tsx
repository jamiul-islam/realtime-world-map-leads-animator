'use client';

import dynamic from 'next/dynamic';
import { Suspense } from 'react';

// Lazy load the modify page content with code-splitting
const ModifyPageContent = dynamic(() => import('@/components/ModifyPageContent'), {
  loading: () => (
    <div className="min-h-screen bg-gradient-to-br from-navy-950 via-navy-900 to-purple-950 flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block w-12 h-12 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin mb-4"></div>
        <p className="text-slate-400 text-sm">Loading admin panel...</p>
      </div>
    </div>
  ),
  ssr: false, // Disable SSR for admin page (requires authentication)
});

export default function ModifyPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-navy-950 via-navy-900 to-purple-950 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin mb-4"></div>
          <p className="text-slate-400 text-sm">Loading admin panel...</p>
        </div>
      </div>
    }>
      <ModifyPageContent />
    </Suspense>
  );
}
