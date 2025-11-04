'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

export default function CanceledPage() {
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
            <div className="text-sm text-slate-400">Payment Canceled</div>
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
          <div className="bg-slate-900/80 backdrop-blur-xl border-2 border-slate-700/50 rounded-3xl p-8 md:p-12 shadow-2xl shadow-slate-900/50">
            {/* Cancel Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="mb-8 flex justify-center"
            >
              <div className="w-24 h-24 bg-slate-800/50 rounded-full flex items-center justify-center border-4 border-slate-600/50">
                <svg
                  className="w-12 h-12 text-slate-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={3}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
            </motion.div>

            {/* Cancel Title */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-center mb-8"
            >
              <h2 className="text-4xl font-bold text-slate-300 mb-4">
                Payment Canceled
              </h2>
              <p className="text-slate-400 text-lg mb-2">
                Your payment was not processed
              </p>
              <p className="text-slate-500 text-sm">
                No charges have been made to your account
              </p>
            </motion.div>

            {/* Info Box */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mb-8 p-6 bg-slate-800/50 border border-slate-700 rounded-2xl"
            >
              <p className="text-slate-300 text-center mb-4">
                You can try again anytime to unlock premium benefits
              </p>
              <div className="space-y-2 text-sm text-slate-400">
                <div className="flex items-center gap-2">
                  <span>✓</span>
                  <span>Exclusive Gift Rewards</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>✓</span>
                  <span>Premium Picks</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>✓</span>
                  <span>VIP Telegram Channel</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>✓</span>
                  <span>Special Challenges & Rewards</span>
                </div>
              </div>
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="space-y-4"
            >
              <Link href="/join-now">
                <button className="w-full py-4 px-6 bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white font-bold text-lg rounded-xl shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 transition-all duration-300">
                  Try Again
                </button>
              </Link>
              
              <Link href="/">
                <button className="w-full py-4 px-6 bg-slate-800/50 hover:bg-slate-700/50 border border-slate-600 text-slate-300 font-semibold text-lg rounded-xl transition-all duration-300">
                  Return to Home
                </button>
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
