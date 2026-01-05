'use client';

// ============================================
// Mobile Bottom Navigation Component - Premium Design
// ============================================

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Receipt,
  Plus,
  Target,
  MoreHorizontal,
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
}

// ============================================
// Navigation Items
// ============================================

const navItems: NavItem[] = [
  { label: 'Home', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Expenses', href: '/expenses', icon: Receipt },
  { label: 'Add', href: '/expenses/add', icon: Plus, isAction: true },
  { label: 'Goals', href: '/goals', icon: Target },
  { label: 'More', href: '/settings', icon: MoreHorizontal },
];

// ============================================
// Component
// ============================================

const MobileNav = () => {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === href;
    if (href === '/expenses/add') return false; // Action button never shows as active
    return pathname.startsWith(href.split('/')[1] ? `/${href.split('/')[1]}` : href);
  };

  return (
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
              <Link
                key={item.href}
                href={item.href}
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
                  <Icon className="h-6 w-6 text-white" />
                  {/* Pulse effect */}
                  <motion.div
                    className="absolute inset-0 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500"
                    animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                </motion.div>
              </Link>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
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
  );
};

export { MobileNav };
