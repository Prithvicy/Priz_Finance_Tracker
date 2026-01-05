'use client';

// ============================================
// Mobile Bottom Navigation Component - Premium Design
// ============================================

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Receipt,
  Plus,
  Wallet,
  MoreHorizontal,
  X,
  Target,
  Settings,
} from 'lucide-react';
import { cn } from '@/lib/cn';

// ============================================
// Types
// ============================================

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  isAction?: boolean;
  isMore?: boolean;
}

// ============================================
// Navigation Items
// ============================================

const navItems: NavItem[] = [
  { label: 'Home', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Expenses', href: '/expenses', icon: Receipt },
  { label: 'Add', href: '#', icon: Plus, isAction: true },
  { label: 'Income', href: '/income', icon: Wallet },
  { label: 'More', href: '#', icon: MoreHorizontal, isMore: true },
];

// ============================================
// Component
// ============================================

const MobileNav = () => {
  const pathname = usePathname();
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === href;
    if (href === '#') return false; // Action button never shows as active
    return pathname.startsWith(href.split('/')[1] ? `/${href.split('/')[1]}` : href);
  };

  const closeAllMenus = () => {
    setShowAddMenu(false);
    setShowMoreMenu(false);
  };

  return (
    <>
      {/* Overlay for any open menu */}
      <AnimatePresence>
        {(showAddMenu || showMoreMenu) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={closeAllMenus}
          />
        )}
      </AnimatePresence>

      {/* Add Menu */}
      <AnimatePresence>
        {showAddMenu && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-28 left-1/2 -translate-x-1/2 z-50 lg:hidden"
          >
            <div className="flex flex-col gap-3 items-center">
              <Link
                href="/income/add"
                onClick={closeAllMenus}
                className="flex items-center gap-3 px-6 py-3 bg-green-500 text-white rounded-full shadow-lg shadow-green-500/30 font-medium"
              >
                <Wallet className="h-5 w-5" />
                Add Income
              </Link>
              <Link
                href="/expenses/add"
                onClick={closeAllMenus}
                className="flex items-center gap-3 px-6 py-3 bg-red-500 text-white rounded-full shadow-lg shadow-red-500/30 font-medium"
              >
                <Receipt className="h-5 w-5" />
                Add Expense
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* More Menu */}
      <AnimatePresence>
        {showMoreMenu && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-28 right-4 z-50 lg:hidden"
          >
            <div className="flex flex-col gap-2 bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-2 min-w-[160px]">
              <Link
                href="/goals"
                onClick={closeAllMenus}
                className="flex items-center gap-3 px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
              >
                <Target className="h-5 w-5 text-purple-500" />
                <span className="font-medium text-gray-900 dark:text-white">Goals</span>
              </Link>
              <Link
                href="/settings"
                onClick={closeAllMenus}
                className="flex items-center gap-3 px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
              >
                <Settings className="h-5 w-5 text-gray-500" />
                <span className="font-medium text-gray-900 dark:text-white">Settings</span>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <nav className={cn(
        'fixed bottom-0 left-0 right-0 z-40 lg:hidden',
        'glass-card border-t-0 rounded-t-3xl',
        'pb-safe'
      )}>
        {/* Gradient glow effect */}
        <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />

        <div className="flex items-center justify-around h-18 px-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);

            if (item.isAction) {
              return (
                <button
                  key="add-action"
                  onClick={() => {
                    setShowMoreMenu(false);
                    setShowAddMenu(!showAddMenu);
                  }}
                  className="relative -mt-8"
                >
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={cn(
                      'flex items-center justify-center',
                      'h-14 w-14 rounded-2xl',
                      'bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500',
                      'shadow-xl shadow-indigo-500/40',
                      'ring-4 ring-white/20 dark:ring-gray-900/20'
                    )}
                  >
                    <motion.div
                      animate={{ rotate: showAddMenu ? 45 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      {showAddMenu ? <X className="h-6 w-6 text-white" /> : <Icon className="h-6 w-6 text-white" />}
                    </motion.div>
                    {/* Pulse effect */}
                    {!showAddMenu && (
                      <motion.div
                        className="absolute inset-0 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500"
                        animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0, 0.5] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                    )}
                  </motion.div>
                </button>
              );
            }

            // More button with popup menu
            if (item.isMore) {
              return (
                <button
                  key="more-action"
                  onClick={() => {
                    setShowAddMenu(false);
                    setShowMoreMenu(!showMoreMenu);
                  }}
                  className="flex flex-col items-center justify-center flex-1 h-full min-h-[64px] touch-manipulation"
                >
                  <motion.div
                    whileTap={{ scale: 0.9 }}
                    className="flex flex-col items-center gap-1 py-2"
                  >
                    <div className={cn(
                      'relative p-2 rounded-xl transition-all duration-300',
                      showMoreMenu
                        ? 'bg-gradient-to-br from-indigo-500/20 to-purple-500/20'
                        : 'hover:bg-gray-100/50 dark:hover:bg-gray-800/50'
                    )}>
                      <Icon className={cn(
                        'h-5 w-5 transition-all duration-300',
                        showMoreMenu
                          ? 'text-indigo-600 dark:text-indigo-400'
                          : 'text-gray-500 dark:text-gray-400'
                      )} />
                    </div>
                    <span className={cn(
                      'text-[11px] font-medium transition-all duration-300',
                      showMoreMenu
                        ? 'text-indigo-600 dark:text-indigo-400'
                        : 'text-gray-500 dark:text-gray-400'
                    )}>
                      {item.label}
                    </span>
                  </motion.div>
                </button>
              );
            }

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={closeAllMenus}
              className="flex flex-col items-center justify-center flex-1 h-full min-h-[64px] touch-manipulation"
            >
              <motion.div
                whileTap={{ scale: 0.9 }}
                className="flex flex-col items-center gap-1 py-2"
              >
                <div
                  className={cn(
                    'relative p-2 rounded-xl transition-all duration-300',
                    active
                      ? 'bg-gradient-to-br from-indigo-500/20 to-purple-500/20'
                      : 'hover:bg-gray-100/50 dark:hover:bg-gray-800/50'
                  )}
                >
                  <Icon
                    className={cn(
                      'h-5 w-5 transition-all duration-300',
                      active
                        ? 'text-indigo-600 dark:text-indigo-400 scale-110'
                        : 'text-gray-500 dark:text-gray-400'
                    )}
                  />
                  {active && (
                    <motion.div
                      layoutId="mobileNavIndicator"
                      className="absolute inset-0 rounded-xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 -z-10"
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    />
                  )}
                </div>
                <span
                  className={cn(
                    'text-[11px] font-medium transition-all duration-300',
                    active
                      ? 'text-indigo-600 dark:text-indigo-400'
                      : 'text-gray-500 dark:text-gray-400'
                  )}
                >
                  {item.label}
                </span>
              </motion.div>
            </Link>
          );
        })}
      </div>
    </nav>
    </>
  );
};

export { MobileNav };
