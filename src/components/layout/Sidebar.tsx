'use client';

// ============================================
// Sidebar Component
// ============================================

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Receipt,
  Wallet,
  BarChart3,
  Settings,
  X,
  TrendingUp,
  Calendar,
  PieChart,
  Target,
} from 'lucide-react';
import { cn } from '@/lib/cn';
import { Button } from '@/components/ui';

// ============================================
// Types
// ============================================

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  children?: NavItem[];
}

// ============================================
// Navigation Items
// ============================================

const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Expenses', href: '/expenses', icon: Receipt },
  { label: 'Income', href: '/income', icon: Wallet },
  { label: 'Goals', href: '/goals', icon: Target },
  {
    label: 'Analytics',
    href: '/analytics',
    icon: BarChart3,
    children: [
      { label: 'Weekly', href: '/analytics/weekly', icon: Calendar },
      { label: 'Monthly', href: '/analytics/monthly', icon: TrendingUp },
      { label: 'Yearly', href: '/analytics/yearly', icon: PieChart },
    ],
  },
  { label: 'Settings', href: '/settings', icon: Settings },
];

// ============================================
// Nav Link Component
// ============================================

interface NavLinkProps {
  item: NavItem;
  isActive: boolean;
  onClick?: () => void;
}

const NavLink = ({ item, isActive, onClick }: NavLinkProps) => {
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      onClick={onClick}
      className={cn(
        'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200',
        'text-sm font-medium',
        isActive
          ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400'
          : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
      )}
    >
      <Icon className="h-5 w-5" />
      <span>{item.label}</span>
      {isActive && (
        <motion.div
          layoutId="activeIndicator"
          className="absolute left-0 w-1 h-6 bg-indigo-600 rounded-r-full"
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        />
      )}
    </Link>
  );
};

// ============================================
// Sidebar Content
// ============================================

const SidebarContent = ({ onItemClick }: { onItemClick?: () => void }) => {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === href;
    return pathname.startsWith(href);
  };

  return (
    <nav className="flex-1 overflow-y-auto px-3 py-4">
      <div className="space-y-1">
        {navItems.map((item) => (
          <div key={item.href} className="relative">
            <NavLink
              item={item}
              isActive={isActive(item.href)}
              onClick={onItemClick}
            />
            {item.children && isActive(item.href) && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="ml-8 mt-1 space-y-1"
              >
                {item.children.map((child) => (
                  <Link
                    key={child.href}
                    href={child.href}
                    onClick={onItemClick}
                    className={cn(
                      'flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors',
                      pathname === child.href
                        ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-900/20'
                        : 'text-gray-500 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                    )}
                  >
                    <child.icon className="h-4 w-4" />
                    {child.label}
                  </Link>
                ))}
              </motion.div>
            )}
          </div>
        ))}
      </div>
    </nav>
  );
};

// ============================================
// Main Sidebar Component
// ============================================

const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 lg:z-30 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800">
        {/* Logo */}
        <div className="flex items-center h-16 px-6 border-b border-gray-200 dark:border-gray-800">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">PF</span>
            </div>
            <span className="font-semibold text-gray-900 dark:text-white">
              Priz Finance
            </span>
          </Link>
        </div>

        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/50 lg:hidden"
              onClick={onClose}
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed inset-y-0 left-0 z-50 w-72 bg-white dark:bg-gray-900 lg:hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-gray-800">
                <Link href="/dashboard" className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                    <span className="text-white font-bold text-sm">PF</span>
                  </div>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    Priz Finance
                  </span>
                </Link>
                <Button variant="ghost" size="icon" onClick={onClose}>
                  <X className="h-5 w-5" />
                </Button>
              </div>

              <SidebarContent onItemClick={onClose} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export { Sidebar };
