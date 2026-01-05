'use client';

// ============================================
// Toast Notification Hook
// ============================================

import { useState, useCallback, createContext, useContext, ReactNode } from 'react';
import { Toast } from '@/types';
import { TOAST_DURATION } from '@/lib/utils/constants';

// ============================================
// Types
// ============================================

interface ToastContextType {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  warning: (message: string) => void;
  info: (message: string) => void;
}

// ============================================
// Context
// ============================================

const ToastContext = createContext<ToastContextType | undefined>(undefined);

// ============================================
// Provider
// ============================================

interface ToastProviderProps {
  children: ReactNode;
}

export const ToastProvider = ({ children }: ToastProviderProps) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const addToast = useCallback(
    (toast: Omit<Toast, 'id'>) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const newToast: Toast = { ...toast, id };

      setToasts((prev) => [...prev, newToast]);

      // Auto-remove after duration
      const duration = toast.duration || TOAST_DURATION;
      setTimeout(() => {
        removeToast(id);
      }, duration);
    },
    [removeToast]
  );

  const success = useCallback(
    (message: string) => {
      addToast({ type: 'success', message });
    },
    [addToast]
  );

  const error = useCallback(
    (message: string) => {
      addToast({ type: 'error', message });
    },
    [addToast]
  );

  const warning = useCallback(
    (message: string) => {
      addToast({ type: 'warning', message });
    },
    [addToast]
  );

  const info = useCallback(
    (message: string) => {
      addToast({ type: 'info', message });
    },
    [addToast]
  );

  const value: ToastContextType = {
    toasts,
    addToast,
    removeToast,
    success,
    error,
    warning,
    info,
  };

  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>;
};

// ============================================
// Hook
// ============================================

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);

  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }

  return context;
};
