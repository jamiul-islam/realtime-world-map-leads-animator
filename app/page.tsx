'use client';

import { useEffect } from 'react';
import { useGlobalStore } from '@/store/globalStore';
import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import UnlockReveal from '@/components/UnlockReveal';

export default function Home() {
  const fetchInitialData = useGlobalStore((state) => state.fetchInitialData);
  const subscribeToRealtime = useGlobalStore((state) => state.subscribeToRealtime);
  const unsubscribeFromRealtime = useGlobalStore((state) => state.unsubscribeFromRealtime);

  useEffect(() => {
    // Fetch initial data on mount
    fetchInitialData();
    
    // Subscribe to real-time updates
    subscribeToRealtime();
    
    // Cleanup on unmount
    return () => {
      unsubscribeFromRealtime();
    };
  }, [fetchInitialData, subscribeToRealtime, unsubscribeFromRealtime]);

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-navy-950 via-navy-900 to-purple-950">
      {/* Header */}
      <Header />
      
      {/* Main Content - 100vh layout */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Hero Section with Map */}
        <HeroSection />
      </main>
      
      {/* Conditional Unlock Reveal */}
      <UnlockReveal />
    </div>
  );
}
