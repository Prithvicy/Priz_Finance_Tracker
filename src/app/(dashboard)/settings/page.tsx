'use client';

// ============================================
// Settings Page
// ============================================

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User, CreditCard, Bell, Palette, Shield, LogOut, Check } from 'lucide-react';
import { PageContainer, PageSection } from '@/components/layout';
import { Card, CardHeader, CardTitle, CardContent, Button, Input, Select, CurrencyInput } from '@/components/ui';
import { useAuth, useToast, useSettings } from '@/hooks';
import { CurrencyCode, CURRENCIES } from '@/lib/utils/constants';
import { isDevMode } from '@/services/firebase';

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const { settings, updateSettings, isLoading: settingsLoading } = useSettings();
  const toast = useToast();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Local state for form
  const [currency, setCurrency] = useState<CurrencyCode>(settings.currency);
  const [theme, setTheme] = useState(settings.theme);
  const [dateFormat, setDateFormat] = useState(settings.dateFormat);
  const [defaultSalary, setDefaultSalary] = useState((settings.defaultSalary / 100).toFixed(2));
  const [payFrequency, setPayFrequency] = useState(settings.payFrequency);

  // Notification settings (local storage for now)
  const [budgetWarnings, setBudgetWarnings] = useState(true);
  const [weeklySummary, setWeeklySummary] = useState(true);
  const [paydayReminder, setPaydayReminder] = useState(true);

  // Update local state when settings load
  useEffect(() => {
    if (!settingsLoading) {
      setCurrency(settings.currency);
      setTheme(settings.theme);
      setDateFormat(settings.dateFormat);
      setDefaultSalary((settings.defaultSalary / 100).toFixed(2));
      setPayFrequency(settings.payFrequency);
    }
  }, [settings, settingsLoading]);

  const handleSaveFinancial = async () => {
    setIsSaving(true);
    try {
      await updateSettings({
        currency,
        defaultSalary: Math.round(parseFloat(defaultSalary) * 100),
        payFrequency,
      });
      toast.success('Financial settings saved');
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveAppearance = async () => {
    setIsSaving(true);
    try {
      await updateSettings({
        theme,
        dateFormat,
      });
      toast.success('Appearance settings saved');
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      router.push('/login');
    } catch (error) {
      toast.error('Failed to log out');
    } finally {
      setIsLoggingOut(false);
    }
  };

  const currencyOptions = Object.values(CURRENCIES).map((c) => ({
    value: c.code,
    label: `${c.code} (${c.symbol}) - ${c.name}`,
  }));

  return (
    <PageContainer title="Settings" description="Manage your preferences">
      {/* Profile Section */}
      <PageSection>
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                <User className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <CardTitle>Profile</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Display Name"
                defaultValue={user?.displayName || 'User'}
                disabled={isDevMode}
              />
              <Input
                label="Email"
                type="email"
                defaultValue={user?.email || 'dev@example.com'}
                disabled
              />
            </div>
            {isDevMode && (
              <p className="text-sm text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-3 py-2 rounded-lg">
                Development mode is enabled. Profile editing is disabled.
              </p>
            )}
          </CardContent>
        </Card>
      </PageSection>

      {/* Financial Settings */}
      <PageSection>
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <CreditCard className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <CardTitle>Financial Settings</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <CurrencyInput
                label="Default Salary"
                value={defaultSalary}
                onChange={(e) => setDefaultSalary(e.target.value)}
                helperText="Your bi-weekly salary amount"
              />
              <Select
                label="Pay Frequency"
                options={[
                  { value: 'weekly', label: 'Weekly' },
                  { value: 'biweekly', label: 'Bi-weekly' },
                  { value: 'monthly', label: 'Monthly' },
                ]}
                value={payFrequency}
                onChange={(e) => setPayFrequency(e.target.value as 'weekly' | 'biweekly' | 'monthly')}
              />
            </div>
            <Select
              label="Currency"
              options={currencyOptions}
              value={currency}
              onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
            />
            <Button
              variant="primary"
              onClick={handleSaveFinancial}
              isLoading={isSaving}
              leftIcon={<Check className="h-4 w-4" />}
            >
              Save Financial Settings
            </Button>
          </CardContent>
        </Card>
      </PageSection>

      {/* Appearance */}
      <PageSection>
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                <Palette className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <CardTitle>Appearance</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Select
              label="Theme"
              options={[
                { value: 'system', label: 'System' },
                { value: 'light', label: 'Light' },
                { value: 'dark', label: 'Dark' },
              ]}
              value={theme}
              onChange={(e) => setTheme(e.target.value as 'light' | 'dark' | 'system')}
            />
            <Select
              label="Date Format"
              options={[
                { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY' },
                { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY' },
                { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD' },
              ]}
              value={dateFormat}
              onChange={(e) => setDateFormat(e.target.value as 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD')}
            />
            <Button
              variant="primary"
              onClick={handleSaveAppearance}
              isLoading={isSaving}
              leftIcon={<Check className="h-4 w-4" />}
            >
              Save Appearance Settings
            </Button>
          </CardContent>
        </Card>
      </PageSection>

      {/* Notifications */}
      <PageSection>
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <Bell className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <CardTitle>Notifications</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Budget Warnings</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Get notified when approaching budget limits
                </p>
              </div>
              <input
                type="checkbox"
                checked={budgetWarnings}
                onChange={(e) => setBudgetWarnings(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
            </div>
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Weekly Summary</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Receive a weekly spending summary
                </p>
              </div>
              <input
                type="checkbox"
                checked={weeklySummary}
                onChange={(e) => setWeeklySummary(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
            </div>
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Payday Reminder</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Remind me to log income on payday
                </p>
              </div>
              <input
                type="checkbox"
                checked={paydayReminder}
                onChange={(e) => setPaydayReminder(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
            </div>
          </CardContent>
        </Card>
      </PageSection>

      {/* Security & Account */}
      <PageSection>
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <Shield className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
              <CardTitle>Security & Account</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {!isDevMode && (
              <Button variant="outline" className="w-full justify-start">
                Change Password
              </Button>
            )}
            <Button
              variant="danger"
              className="w-full"
              onClick={handleLogout}
              isLoading={isLoggingOut}
              leftIcon={<LogOut className="h-4 w-4" />}
            >
              Sign Out
            </Button>
          </CardContent>
        </Card>
      </PageSection>

      {/* Version Info */}
      <div className="text-center text-sm text-gray-400 dark:text-gray-600 mt-8">
        <p>Priz Finance Tracker v1.0.0</p>
        {isDevMode && <p className="text-amber-500">Development Mode</p>}
      </div>
    </PageContainer>
  );
}
