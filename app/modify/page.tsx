'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useGlobalStore } from '@/store/globalStore';
import CountryUpdateForm from '@/components/CountryUpdateForm';
import Toast from '@/components/Toast';
import { CountryUpdate } from '@/types';

export default function ModifyPage() {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState<string>('');
  const { lockerState, fetchInitialData, showToast } = useGlobalStore();

  useEffect(() => {
    // Fetch initial data
    fetchInitialData();

    // Get current user
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email) {
        setUserEmail(user.email);
      }
    };
    getUser();
  }, [fetchInitialData]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const handleCountryUpdate = async (update: CountryUpdate) => {
    try {
      const response = await fetch('/api/admin/update-country', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(update),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        showToast({
          type: 'error',
          message: result.error || 'Failed to update country',
        });
        throw new Error(result.error);
      }

      // Show success toast with updated values
      const { activation_count, glow_band } = result.data;
      showToast({
        type: 'success',
        message: `Country updated! Activation count: ${activation_count}, Glow band: ${glow_band}`,
      });

      // Refresh data to show updated state
      await fetchInitialData();
    } catch (error) {
      console.error('Error updating country:', error);
      // Error toast already shown above
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-navy-950 via-navy-900 to-purple-950">
      {/* Admin Header - Matching homepage style */}
      <header className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-6xl px-4">
        <div className="bg-slate-900/80 backdrop-blur-xl border border-cyan-500/30 rounded-full px-6 py-3 shadow-2xl shadow-cyan-500/20">
          <div className="flex items-center justify-between gap-6">
            {/* Title */}
            <div className="flex items-center gap-4">
              <h1 className="text-lg sm:text-xl font-semibold bg-gradient-to-r from-cyan-300 via-purple-300 to-cyan-400 bg-clip-text text-transparent whitespace-nowrap">
                Admin Control Panel
              </h1>
              <span className="hidden sm:block text-xs text-slate-400">
                {userEmail}
              </span>
            </div>

            {/* Current State Display */}
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-xs text-slate-400 font-medium">Global Energy</div>
                <div className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                  {lockerState?.energy_percentage ?? 0}%
                </div>
              </div>

              {lockerState?.is_unlocked && (
                <div className="text-amber-400 text-xl">🔓</div>
              )}

              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 hover:from-cyan-500/30 hover:to-purple-500/30 border border-cyan-400/30 hover:border-cyan-400/50 text-cyan-300 rounded-full transition-all duration-300 text-sm font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Country Update Form */}
          <div className="bg-slate-900/80 backdrop-blur-xl border border-cyan-500/30 rounded-3xl p-8 shadow-2xl shadow-cyan-500/20">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-300 via-purple-300 to-cyan-400 bg-clip-text text-transparent mb-6">
              Update Country
            </h2>
            <CountryUpdateForm onSubmit={handleCountryUpdate} />
          </div>

          {/* Global Energy Form - Will be implemented in task 12 */}
          <div className="bg-slate-900/80 backdrop-blur-xl border border-cyan-500/30 rounded-3xl p-8 shadow-2xl shadow-cyan-500/20">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-300 via-purple-300 to-cyan-400 bg-clip-text text-transparent mb-6">
              Update Global Energy
            </h2>
            <p className="text-slate-400">Global energy form coming soon...</p>
          </div>
        </div>
      </main>

      {/* Toast Notifications */}
      <Toast />
    </div>
  );
}
