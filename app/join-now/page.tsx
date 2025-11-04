'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export default function JoinNowPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);

    try {
      // Create checkout session
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session');
      }

      // Redirect to Stripe Checkout URL
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (error: any) {
      console.error('Payment error:', error);
      setError(error.message || 'Failed to process payment. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

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
            <div className="text-sm text-slate-400">Premium Membership</div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 pt-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-2xl"
        >
          <div className="bg-slate-900/80 backdrop-blur-xl border border-cyan-500/30 rounded-3xl p-8 md:p-12 shadow-2xl shadow-cyan-500/20">
            {/* Title */}
            <div className="text-center mb-8">
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.3 }}
                className="mb-4"
              >
                <span className="text-5xl">🚀</span>
              </motion.div>
              <h2 className="text-4xl font-bold bg-gradient-to-r from-cyan-300 via-purple-300 to-cyan-400 bg-clip-text text-transparent mb-4">
                Premium Membership
              </h2>
              <p className="text-slate-300 text-lg">
                Unlock exclusive benefits and rewards
              </p>
            </div>

            {/* Benefits */}
            <div className="mb-8 space-y-4">
              <div className="flex items-start gap-3 p-4 bg-cyan-500/10 border border-cyan-500/20 rounded-xl">
                <span className="text-2xl">🎁</span>
                <div>
                  <h3 className="text-cyan-300 font-semibold mb-1">Exclusive Gift Rewards</h3>
                  <p className="text-slate-400 text-sm">Receive special gifts and bonuses</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-purple-500/10 border border-purple-500/20 rounded-xl">
                <span className="text-2xl">⭐</span>
                <div>
                  <h3 className="text-purple-300 font-semibold mb-1">Premium Picks</h3>
                  <p className="text-slate-400 text-sm">Access to curated premium content</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-cyan-500/10 border border-cyan-500/20 rounded-xl">
                <span className="text-2xl">💬</span>
                <div>
                  <h3 className="text-cyan-300 font-semibold mb-1">VIP Telegram Channel</h3>
                  <p className="text-slate-400 text-sm">Join our exclusive community</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-purple-500/10 border border-purple-500/20 rounded-xl">
                <span className="text-2xl">🏆</span>
                <div>
                  <h3 className="text-purple-300 font-semibold mb-1">Special Challenges & Rewards</h3>
                  <p className="text-slate-400 text-sm">Compete and earn rewards for sharing</p>
                </div>
              </div>
            </div>

            {/* Pricing */}
            <div className="mb-8 text-center p-6 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border-2 border-cyan-400/40 rounded-2xl">
              <div className="text-slate-400 text-sm mb-2">Launch Offer</div>
              <div className="text-6xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-2">
                $2
              </div>
              <div className="text-amber-400 text-sm font-semibold">
                ⚡ Limited Time Entry Price
              </div>
              <div className="text-slate-400 text-xs mt-2">
                Price will increase after launch period
              </div>
            </div>

            {/* Email Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  disabled={isLoading}
                  className="w-full px-4 py-3 bg-slate-800/50 border border-cyan-500/30 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  autoComplete="email"
                />
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 rounded-xl border bg-red-500/10 border-red-500/30 text-red-300"
                >
                  <p className="text-sm">{error}</p>
                </motion.div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 px-6 bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white font-bold text-lg rounded-xl shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:from-cyan-500 disabled:hover:to-purple-500"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg
                      className="animate-spin h-5 w-5"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Processing...
                  </span>
                ) : (
                  'Get Premium Membership'
                )}
              </button>
            </form>

            {/* Footer Note */}
            <div className="mt-6 text-center">
              <p className="text-xs text-slate-500">
                Secure payment powered by Stripe
              </p>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
