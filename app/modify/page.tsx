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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Admin Header */}
      <header className="border-b border-slate-700/50 bg-slate-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">Admin Control Panel</h1>
              <p className="text-sm text-slate-400 mt-1">
                Logged in as: <span className="text-cyan-400">{userEmail}</span>
              </p>
            </div>
            
            {/* Current State Display */}
            <div className="flex items-center gap-6">
              <div className="text-right">
                <p className="text-xs text-slate-400 uppercase tracking-wide">Global Energy</p>
                <p className="text-2xl font-bold text-cyan-400">
                  {lockerState?.energy_percentage ?? 0}%
                </p>
                {lockerState?.is_unlocked && (
                  <p className="text-xs text-amber-400 mt-1">🔓 Unlocked</p>
                )}
              </div>
              
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors duration-200 text-sm font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Country Update Form */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 p-6">
            <h2 className="text-xl font-semibold text-white mb-6">Update Country</h2>
            <CountryUpdateForm onSubmit={handleCountryUpdate} />
          </div>

          {/* Global Energy Form - Will be implemented in task 12 */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Update Global Energy</h2>
            <p className="text-slate-400">Global energy form coming soon...</p>
          </div>
        </div>
      </main>

      {/* Toast Notifications */}
      <Toast />
    </div>
  );
}
