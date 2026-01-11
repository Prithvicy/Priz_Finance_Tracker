'use client';

// ============================================
// Header Component
// ============================================

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Bell, Settings, LogOut, User, Sparkles, Plus } from 'lucide-react';
import { cn } from '@/lib/cn';
import { Button } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';

// ============================================
// Notification Storage Key
// ============================================

const NOTIFICATION_STORAGE_KEY = 'priz-notification-read-v1';

// ============================================
// Types
// ============================================

interface HeaderProps {
  onMenuClick?: () => void;
  showMenuButton?: boolean;
}

// ============================================
// Component
// ============================================

const Header = ({ onMenuClick, showMenuButton = true }: HeaderProps) => {
  const { user, logout, isAuthenticated } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [hasUnreadNotification, setHasUnreadNotification] = useState(false);

  // Check localStorage for notification read status on mount
  useEffect(() => {
    const isRead = localStorage.getItem(NOTIFICATION_STORAGE_KEY);
    setHasUnreadNotification(!isRead);
  }, []);

  // Handle notification click
  const handleNotificationClick = () => {
    setShowNotification(!showNotification);
    if (hasUnreadNotification) {
      localStorage.setItem(NOTIFICATION_STORAGE_KEY, 'true');
      setHasUnreadNotification(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    setShowUserMenu(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
      <div className="flex items-center justify-between h-16 px-4 md:px-6">
        {/* Left Side */}
        <div className="flex items-center gap-4">
          {showMenuButton && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onMenuClick}
              className="lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </Button>
          )}

          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">PF</span>
            </div>
            <span className="hidden sm:block font-semibold text-gray-900 dark:text-white">
              Priz Finance
            </span>
          </Link>
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-2">
          {/* Notifications */}
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              className="relative"
              onClick={handleNotificationClick}
            >
              <Bell className="h-5 w-5" />
              {hasUnreadNotification && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-1 right-1 h-2.5 w-2.5 bg-red-500 rounded-full ring-2 ring-white dark:ring-gray-900"
                />
              )}
            </Button>

            {/* Notification Popup */}
            <AnimatePresence>
              {showNotification && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowNotification(false)}
                  />
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    className={cn(
                      'absolute right-0 top-full mt-2 w-80 py-3 px-4 z-50',
                      'bg-white dark:bg-gray-900 rounded-xl shadow-xl',
                      'border border-gray-200 dark:border-gray-800'
                    )}
                  >
                    {/* New Feature Badge */}
                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex items-center gap-1.5 px-2 py-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full">
                        <Sparkles className="h-3 w-3 text-white" />
                        <span className="text-xs font-semibold text-white">New Feature</span>
                      </div>
                    </div>

                    {/* Feature Title */}
                    <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-2">
                      Custom Categories
                    </h3>

                    {/* Feature Description */}
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      You can now create your own expense categories! Tap the{' '}
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-indigo-100 dark:bg-indigo-900/50 rounded text-indigo-600 dark:text-indigo-400 font-medium">
                        <Plus className="h-3 w-3" />
                        Add New
                      </span>{' '}
                      button when adding an expense to create custom categories with your choice of icon and color.
                    </p>

                    {/* Features List */}
                    <ul className="text-sm text-gray-500 dark:text-gray-400 space-y-1.5 mb-3">
                      <li className="flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
                        Custom icons and colors
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-purple-500" />
                        Automatic chart integration
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-pink-500" />
                        Easy edit & delete options
                      </li>
                    </ul>

                    {/* Close Button */}
                    <button
                      onClick={() => setShowNotification(false)}
                      className="w-full py-2 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-colors"
                    >
                      Got it!
                    </button>

                    {/* Credit Line */}
                    <p className="mt-2 text-[10px] text-gray-400 dark:text-gray-500 text-right">
                      — thanks for the idea Jazz
                    </p>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          {/* Settings */}
          <Link href="/settings">
            <Button variant="ghost" size="icon">
              <Settings className="h-5 w-5" />
            </Button>
          </Link>

          {/* User Menu */}
          {isAuthenticated && (
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <div className="h-8 w-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center">
                  <User className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                </div>
                <span className="hidden md:block text-sm font-medium text-gray-700 dark:text-gray-300 max-w-[120px] truncate">
                  {user?.displayName || 'User'}
                </span>
              </button>

              {/* Dropdown Menu */}
              {showUserMenu && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowUserMenu(false)}
                  />
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    className={cn(
                      'absolute right-0 top-full mt-2 w-48 py-1 z-50',
                      'bg-white dark:bg-gray-900 rounded-lg shadow-lg',
                      'border border-gray-200 dark:border-gray-800'
                    )}
                  >
                    <div className="px-3 py-2 border-b border-gray-100 dark:border-gray-800">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                        {user?.displayName}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {user?.email}
                      </p>
                    </div>

                    <Link
                      href="/settings"
                      className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <Settings className="h-4 w-4" />
                      Settings
                    </Link>

                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 w-full"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign out
                    </button>
                  </motion.div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export { Header };
