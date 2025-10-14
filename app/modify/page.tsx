'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ModifyPage() {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        setUserEmail(session.user.email || null);
      }
      
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-navy-950 via-navy-900 to-purple-950">
        <div className="text-cyan-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-navy-950 via-navy-900 to-purple-950">
      {/* Header */}
      <header className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-4xl px-4">
        <div className="bg-slate-900/80 backdrop-blur-xl border border-cyan-500/30 rounded-full px-6 py-3 shadow-2xl shadow-cyan-500/20">
          <div className="flex items-center justify-between gap-6">
            <Link href="/">
              <h1 className="text-lg sm:text-xl font-semibold bg-gradient-to-r from-cyan-300 via-purple-300 to-cyan-400 bg-clip-text text-transparent whitespace-nowrap cursor-pointer hover:opacity-80 transition-opacity">
                Global Unlock
              </h1>
            </Link>
            <div className="flex items-center gap-4">
              <div className="text-sm text-slate-400">
                {userEmail}
              </div>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg text-sm transition-all border border-red-500/30"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 pt-24">
        <div className="w-full max-w-4xl">
          <div className="bg-slate-900/80 backdrop-blur-xl border border-cyan-500/30 rounded-3xl p-8 shadow-2xl shadow-cyan-500/20">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-cyan-300 via-purple-300 to-cyan-400 bg-clip-text text-transparent mb-4">
              Admin Panel
            </h2>
            <p className="text-slate-400 mb-6">
              Welcome to the admin panel. This page is protected and only accessible to authenticated admins.
            </p>
            <div className="p-4 bg-cyan-500/10 border border-cyan-500/30 rounded-xl">
              <p className="text-cyan-300 text-sm">
                ✓ Authentication successful
              </p>
              <p className="text-slate-400 text-sm mt-2">
                Logged in as: <span className="text-cyan-300">{userEmail}</span>
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
