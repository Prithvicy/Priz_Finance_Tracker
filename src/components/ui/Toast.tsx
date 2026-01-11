'use client';

// ============================================
// Toast Notification Component
// ============================================

import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { cn } from '@/lib/cn';
import { Toast as ToastType } from '@/types';

// ============================================
// Toast Item
// ============================================

interface ToastItemProps extends ToastType {
  onClose: (id: string) => void;
}

const icons = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

const styles = {
  success: 'bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-200',
  error: 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-200',
  warning: 'bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-900/20 dark:border-amber-800 dark:text-amber-200',
  info: 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-200',
};

const iconStyles = {
  success: 'text-green-500',
  error: 'text-red-500',
  warning: 'text-amber-500',
  info: 'text-blue-500',
};

const ToastItem = ({ id, type, message, onClose }: ToastItemProps) => {
  const Icon = icons[type];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: 100, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className={cn(
        'flex items-center gap-3 px-4 py-3 rounded-lg border shadow-lg',
        'w-[calc(100vw-2rem)] sm:w-auto sm:min-w-[300px] sm:max-w-[400px]',
        styles[type]
      )}
    >
      <Icon className={cn('h-5 w-5 flex-shrink-0', iconStyles[type])} />
      <p className="flex-1 text-sm font-medium">{message}</p>
      <button
        onClick={() => onClose(id)}
        className="flex-shrink-0 p-1 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
      >
        <X className="h-4 w-4" />
      </button>
    </motion.div>
  );
};

// ============================================
// Toast Container
// ============================================

interface ToastContainerProps {
  toasts: ToastType[];
  onClose: (id: string) => void;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
}

const positionStyles = {
  'top-right': 'top-4 left-4 right-4 sm:left-auto sm:right-4',
  'top-left': 'top-4 left-4 right-4 sm:right-auto sm:left-4',
  'bottom-right': 'bottom-4 left-4 right-4 sm:left-auto sm:right-4',
  'bottom-left': 'bottom-4 left-4 right-4 sm:right-auto sm:left-4',
};

const ToastContainer = ({
  toasts,
  onClose,
  position = 'top-right',
}: ToastContainerProps) => {
  return (
    <div
      className={cn(
        'fixed z-[100] flex flex-col gap-2',
        positionStyles[position]
      )}
    >
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} {...toast} onClose={onClose} />
        ))}
      </AnimatePresence>
    </div>
  );
};

// ============================================
// Exports
// ============================================

export { ToastItem, ToastContainer };
export type { ToastItemProps, ToastContainerProps };
