'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGlobalStore } from '@/store/globalStore';

export default function Toast() {
  const { ui, dismissToast } = useGlobalStore();
  const toast = ui.toast;

  useEffect(() => {
    if (toast && toast.type === 'success') {
      const timer = setTimeout(() => {
        dismissToast();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toast, dismissToast]);

  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className="fixed top-4 right-4 z-50 max-w-md"
        >
          <div
            className={`px-6 py-4 rounded-lg shadow-xl backdrop-blur-sm border ${
              toast.type === 'success'
                ? 'bg-green-500/90 border-green-400 text-white'
                : toast.type === 'error'
                ? 'bg-red-500/90 border-red-400 text-white'
                : 'bg-blue-500/90 border-blue-400 text-white'
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <p className="font-medium">{toast.message}</p>
              </div>
              {toast.type === 'error' && (
                <button
                  onClick={dismissToast}
                  className="text-white hover:text-gray-200 transition-colors"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
