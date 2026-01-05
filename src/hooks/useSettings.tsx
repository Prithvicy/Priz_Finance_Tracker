'use client';

// ============================================
// Settings Hook with Context
// ============================================

import { useState, useEffect, useCallback, createContext, useContext, ReactNode } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db, isDevMode, isFirebaseConfigured } from '@/services/firebase';
import { useAuth } from './useAuth';
import { CurrencyCode, CURRENCIES, DEFAULT_CURRENCY } from '@/lib/utils/constants';

// ============================================
// Types
// ============================================

export interface UserSettings {
  currency: CurrencyCode;
  theme: 'light' | 'dark' | 'system';
  dateFormat: 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD';
  defaultSalary: number;
  payFrequency: 'weekly' | 'biweekly' | 'monthly';
}

interface SettingsContextType {
  settings: UserSettings;
  isLoading: boolean;
  updateSettings: (updates: Partial<UserSettings>) => Promise<void>;
  formatCurrency: (cents: number, showCents?: boolean) => string;
  currencySymbol: string;
}

const defaultSettings: UserSettings = {
  currency: DEFAULT_CURRENCY as CurrencyCode,
  theme: 'system',
  dateFormat: 'MM/DD/YYYY',
  defaultSalary: 244800,
  payFrequency: 'biweekly',
};

// ============================================
// Context
// ============================================

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

// ============================================
// Provider Component
// ============================================

interface SettingsProviderProps {
  children: ReactNode;
}

export const SettingsProvider = ({ children }: SettingsProviderProps) => {
  const { user, isAuthenticated } = useAuth();
  const [settings, setSettings] = useState<UserSettings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch settings on mount
  useEffect(() => {
    const fetchSettings = async () => {
      if (!isAuthenticated || !user) {
        setSettings(defaultSettings);
        setIsLoading(false);
        return;
      }

      if (isDevMode || !isFirebaseConfigured()) {
        // Load from localStorage in dev mode
        const stored = localStorage.getItem('priz-settings');
        if (stored) {
          try {
            setSettings({ ...defaultSettings, ...JSON.parse(stored) });
          } catch {
            setSettings(defaultSettings);
          }
        }
        setIsLoading(false);
        return;
      }

      try {
        const settingsRef = doc(db, 'users', user.uid, 'settings', 'preferences');
        const snapshot = await getDoc(settingsRef);

        if (snapshot.exists()) {
          setSettings({ ...defaultSettings, ...snapshot.data() as Partial<UserSettings> });
        }
      } catch (error) {
        console.error('Failed to fetch settings:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, [user, isAuthenticated]);

  // Update settings
  const updateSettings = useCallback(async (updates: Partial<UserSettings>) => {
    const newSettings = { ...settings, ...updates };
    setSettings(newSettings);

    if (isDevMode || !isFirebaseConfigured()) {
      // Save to localStorage in dev mode
      localStorage.setItem('priz-settings', JSON.stringify(newSettings));
      return;
    }

    if (!user) return;

    try {
      const settingsRef = doc(db, 'users', user.uid, 'settings', 'preferences');
      await setDoc(settingsRef, newSettings, { merge: true });
    } catch (error) {
      console.error('Failed to save settings:', error);
      throw error;
    }
  }, [settings, user]);

  // Format currency based on current settings
  const formatCurrency = useCallback((cents: number, showCents = true): string => {
    const config = CURRENCIES[settings.currency];
    const dollars = cents / 100;

    return new Intl.NumberFormat(config.locale, {
      style: 'currency',
      currency: config.code,
      minimumFractionDigits: showCents ? config.decimals : 0,
      maximumFractionDigits: showCents ? config.decimals : 0,
    }).format(dollars);
  }, [settings.currency]);

  // Get the currency symbol
  const currencySymbol = CURRENCIES[settings.currency]?.symbol || '$';

  const value: SettingsContextType = {
    settings,
    isLoading,
    updateSettings,
    formatCurrency,
    currencySymbol,
  };

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
};

// ============================================
// Hook
// ============================================

export const useSettings = (): SettingsContextType => {
  const context = useContext(SettingsContext);

  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }

  return context;
};
