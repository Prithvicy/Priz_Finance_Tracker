'use client';

// ============================================
// Chart Container Component
// ============================================

import { ReactNode, useState, useEffect } from 'react';
import { ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';
import { cn } from '@/lib/cn';
import { Card, CardHeader, CardTitle, CardContent, Skeleton } from '@/components/ui';

// ============================================
// Types
// ============================================

interface ChartContainerProps {
  title?: string;
  action?: ReactNode;
  height?: number;
  mobileHeight?: number;
  children: ReactNode;
  className?: string;
  isLoading?: boolean;
  isEmpty?: boolean;
  emptyMessage?: string;
}

// ============================================
// Hook for responsive height
// ============================================

const useResponsiveHeight = (height: number, mobileHeight?: number) => {
  const [responsiveHeight, setResponsiveHeight] = useState(height);

  useEffect(() => {
    const checkWidth = () => {
      const isMobile = window.innerWidth < 640;
      setResponsiveHeight(isMobile ? (mobileHeight || Math.min(height, 240)) : height);
    };

    checkWidth();
    window.addEventListener('resize', checkWidth);
    return () => window.removeEventListener('resize', checkWidth);
  }, [height, mobileHeight]);

  return responsiveHeight;
};

// ============================================
// Component
// ============================================

const ChartContainer = ({
  title,
  action,
  height = 300,
  mobileHeight,
  children,
  className,
  isLoading = false,
  isEmpty = false,
  emptyMessage = 'No data available',
}: ChartContainerProps) => {
  const responsiveHeight = useResponsiveHeight(height, mobileHeight);

  return (
    <Card glass className={cn('overflow-hidden', className)}>
      {title && (
        <CardHeader action={action}>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
      )}
      <CardContent className="p-3 sm:p-4 pt-0">
        {isLoading ? (
          <div className="flex items-end gap-2" style={{ height: responsiveHeight }}>
            {Array.from({ length: 7 }).map((_, i) => (
              <Skeleton
                key={i}
                className="flex-1 rounded-t"
                style={{ height: `${Math.random() * 60 + 20}%` }}
              />
            ))}
          </div>
        ) : isEmpty ? (
          <div
            className="flex items-center justify-center text-gray-500 dark:text-gray-400"
            style={{ height: responsiveHeight }}
          >
            <p>{emptyMessage}</p>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            style={{ height: responsiveHeight }}
          >
            <ResponsiveContainer width="100%" height="100%">
              {children}
            </ResponsiveContainer>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
};

export { ChartContainer };
