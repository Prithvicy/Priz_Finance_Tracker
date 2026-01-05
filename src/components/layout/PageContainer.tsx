'use client';

// ============================================
// Page Container Component
// ============================================

import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/cn';

// ============================================
// Types
// ============================================

interface PageContainerProps {
  children: ReactNode;
  title?: string;
  description?: string;
  action?: ReactNode;
  className?: string;
  fullWidth?: boolean;
}

// ============================================
// Animation Variants
// ============================================

const pageVariants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
};

// ============================================
// Component
// ============================================

const PageContainer = ({
  children,
  title,
  description,
  action,
  className,
  fullWidth = false,
}: PageContainerProps) => {
  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.2 }}
      className={cn(
        'px-4 py-6 md:px-6 lg:px-8',
        className
      )}
    >
      <div className={cn('mx-auto', !fullWidth && 'max-w-7xl')}>
        {/* Page Header */}
        {(title || action) && (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              {title && (
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {title}
                </h1>
              )}
              {description && (
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {description}
                </p>
              )}
            </div>
            {action && <div className="flex-shrink-0">{action}</div>}
          </div>
        )}

        {/* Page Content */}
        {children}
      </div>
    </motion.div>
  );
};

// ============================================
// Section Component for Page Sections
// ============================================

interface PageSectionProps {
  children: ReactNode;
  title?: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

const PageSection = ({
  children,
  title,
  description,
  action,
  className,
}: PageSectionProps) => {
  return (
    <section className={cn('mb-6 sm:mb-8', className)}>
      {(title || action) && (
        <div className="flex items-center justify-between mb-4">
          <div>
            {title && (
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {title}
              </h2>
            )}
            {description && (
              <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
                {description}
              </p>
            )}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      {children}
    </section>
  );
};

// ============================================
// Grid Components
// ============================================

interface GridProps {
  children: ReactNode;
  cols?: 1 | 2 | 3 | 4;
  gap?: 'sm' | 'md' | 'lg';
  className?: string;
}

const colClasses = {
  1: 'grid-cols-1',
  2: 'grid-cols-1 sm:grid-cols-2',
  3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
  4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
};

const gapClasses = {
  sm: 'gap-3',
  md: 'gap-4',
  lg: 'gap-6',
};

const Grid = ({ children, cols = 3, gap = 'md', className }: GridProps) => {
  return (
    <div className={cn('grid', colClasses[cols], gapClasses[gap], className)}>
      {children}
    </div>
  );
};

// ============================================
// Exports
// ============================================

export { PageContainer, PageSection, Grid };
