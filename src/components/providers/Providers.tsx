'use client';

// ============================================
// Application Providers
// ============================================

import { ReactNode } from 'react';
import { AuthProvider } from '@/hooks/useAuth';
import { ToastProvider, useToast } from '@/hooks/useToast';
import { SettingsProvider } from '@/hooks/useSettings';
import { ToastContainer } from '@/components/ui';

// ============================================
// Toast Display Component
// ============================================

const ToastDisplay = () => {
  const { toasts, removeToast } = useToast();

  return <ToastContainer toasts={toasts} onClose={removeToast} />;
};

// ============================================
// Main Providers Wrapper
// ============================================

interface ProvidersProps {
  children: ReactNode;
}

const Providers = ({ children }: ProvidersProps) => {
  return (
    <AuthProvider>
      <SettingsProvider>
        <ToastProvider>
          {children}
          <ToastDisplay />
        </ToastProvider>
      </SettingsProvider>
    </AuthProvider>
  );
};

export { Providers };
