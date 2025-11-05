'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';

function SuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [isVerifying, setIsVerifying] = useState(true);
  const [syncError, setSyncError] = useState<string | null>(null);

  useEffect(() => {
    const syncPaymentStatus = async () => {
      if (!sessionId) {
        setIsVerifying(false);
        return;
      }

      try {
        const response = await fetch('/api/sync-payment-status', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ sessionId }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to sync payment status');
        }

        console.log('Payment status synced:', data.status);
      } catch (error: any) {
        console.error('Error syncing payment:', error);
        setSyncError(error.message);
      } finally {
        setIsVerifying(false);
      }
    };

    // Sync payment status after a short delay
    const timer = setTimeout(() => {
      syncPaymentStatus();
    }, 1000);

    return () => clearTimeout(timer);
  }, [sessionId]);

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
            <div className="text-sm text-slate-400">Payment Success</div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 pt-24">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-2xl"
        >
          <div className="bg-slate-900/80 backdrop-blur-xl border-2 border-cyan-500/40 rounded-3xl p-8 md:p-12 shadow-2xl shadow-cyan-500/30">
            {isVerifying ? (
              <div className="text-center py-12">
                <div className="inline-block w-16 h-16 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin mb-6"></div>
                <p className="text-slate-300 text-lg">Verifying your payment...</p>
              </div>
            ) : (
              <>
                {/* Success Icon */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                  className="mb-8 flex justify-center"
                >
                  <div className="w-24 h-24 bg-gradient-to-br from-cyan-500/30 to-purple-500/30 rounded-full flex items-center justify-center border-4 border-cyan-400/50 shadow-lg shadow-cyan-500/50">
                    <svg
                      className="w-12 h-12 text-cyan-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                </motion.div>

                {/* Success Title */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-center mb-8"
                >
                  <h2 className="text-4xl font-bold bg-gradient-to-r from-cyan-300 via-purple-300 to-cyan-400 bg-clip-text text-transparent mb-4">
                    Payment Successful!
                  </h2>
                  <p className="text-slate-300 text-lg mb-2">
                    Welcome to Premium Membership
                  </p>
                  <p className="text-slate-400 text-sm">
                    Your payment has been processed successfully
                  </p>
                </motion.div>

                {/* Benefits Reminder */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="mb-8 p-6 bg-gradient-to-br from-cyan-500/10 to-purple-500/10 border border-cyan-500/30 rounded-2xl"
                >
                  <h3 className="text-cyan-300 font-semibold mb-4 text-center">
                    You now have access to:
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-slate-300">
                      <span className="text-xl">🎁</span>
                      <span>Exclusive Gift Rewards</span>
                    </div>
                    <div className="flex items-center gap-3 text-slate-300">
                      <span className="text-xl">⭐</span>
                      <span>Premium Picks</span>
                    </div>
                    <div className="flex items-center gap-3 text-slate-300">
                      <span className="text-xl">💬</span>
                      <span>VIP Telegram Channel</span>
                    </div>
                    <div className="flex items-center gap-3 text-slate-300">
                      <span className="text-xl">🏆</span>
                      <span>Special Challenges & Rewards</span>
                    </div>
                  </div>
                </motion.div>

                {/* Session Info */}
                {sessionId && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="mb-8 p-4 bg-slate-800/50 border border-slate-700 rounded-xl"
                  >
                    <p className="text-slate-400 text-xs mb-1">Transaction ID:</p>
                    <p className="text-slate-300 text-sm font-mono break-all">{sessionId}</p>
                  </motion.div>
                )}

                {/* Action Button */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <Link href="/">
                    <button className="w-full py-4 px-6 bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white font-bold text-lg rounded-xl shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 transition-all duration-300">
                      Return to Home
                    </button>
                  </Link>
                </motion.div>

                {/* Footer Note */}
                <div className="mt-6 text-center">
                  <p className="text-xs text-slate-500">
                    A confirmation email has been sent to your inbox
                  </p>
                </div>
              </>
            )}
          </div>
        </motion.div>
      </main>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-navy-950 via-navy-900 to-purple-950">
        <div className="text-cyan-400">Loading...</div>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}
