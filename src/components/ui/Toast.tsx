"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircleIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';

interface Toast {
  id: string;
  message: string;
  type?: 'success' | 'error' | 'info';
  duration?: number;
  icon?: React.ReactNode;
}

interface ToastContextType {
  showToast: (toast: Omit<Toast, 'id'>) => void;
  hideToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { ...toast, id }]);
  }, []);

  const hideToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast, hideToast }}>
      {children}
      <ToastContainer toasts={toasts} hideToast={hideToast} />
    </ToastContext.Provider>
  );
};

const ToastContainer: React.FC<{ toasts: Toast[]; hideToast: (id: string) => void }> = ({
  toasts,
  hideToast,
}) => {
  return (
    <div className="fixed bottom-8 right-8 z-[9999] pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} hideToast={hideToast} />
        ))}
      </AnimatePresence>
    </div>
  );
};

const ToastItem: React.FC<{ toast: Toast; hideToast: (id: string) => void }> = ({
  toast,
  hideToast,
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      hideToast(toast.id);
    }, toast.duration || 5000);

    return () => clearTimeout(timer);
  }, [toast.id, toast.duration, hideToast]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.9 }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 25,
      }}
      className="pointer-events-auto mb-4"
    >
      <div
        className={cn(
          "relative overflow-hidden rounded-2xl px-6 py-4 shadow-2xl",
          "backdrop-blur-2xl backdrop-saturate-200",
          "border border-white/20",
          "bg-gradient-to-br from-white/95 via-white/90 to-white/85",
          "dark:from-gray-900/95 dark:via-gray-900/90 dark:to-gray-800/85",
          "before:absolute before:inset-0 before:rounded-2xl",
          "before:bg-gradient-to-br before:from-white/50 before:via-transparent before:to-transparent",
          "dark:before:from-white/10",
          "after:absolute after:inset-0 after:rounded-2xl",
          "after:bg-gradient-to-t after:from-transparent after:via-white/5 after:to-white/20",
          "transform-gpu"
        )}
      >
        {/* Liquid glass effect overlay */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-cyan-500/10 via-purple-500/10 to-pink-500/10 animate-pulse" />
        
        {/* Inner glow */}
        <div className="absolute -inset-px rounded-2xl bg-gradient-to-br from-cyan-400/20 via-transparent to-purple-400/20 blur-xl" />
        
        <div className="relative flex items-center gap-3">
          {toast.icon || (
            toast.type === 'success' && (
              <motion.div
                initial={{ rotate: -90, scale: 0 }}
                animate={{ rotate: 0, scale: 1 }}
                transition={{ type: "spring", duration: 0.6 }}
              >
                <CheckCircleIcon className="h-6 w-6 text-emerald-500 drop-shadow-lg" />
              </motion.div>
            )
          )}
          
          <div className="flex-1 pr-8">
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {toast.message}
            </p>
          </div>
          
          <button
            onClick={() => hideToast(toast.id)}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
          >
            <XMarkIcon className="h-4 w-4" />
          </button>
        </div>
        
        {/* Progress bar */}
        <motion.div
          className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500"
          initial={{ width: "100%" }}
          animate={{ width: "0%" }}
          transition={{ duration: (toast.duration || 5000) / 1000, ease: "linear" }}
        />
      </div>
    </motion.div>
  );
};