'use client';

// ============================================
// Quick Stats Component - Premium Design
// ============================================

import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus, DollarSign, CreditCard, PiggyBank, Calendar, Sparkles } from 'lucide-react';
import { cn } from '@/lib/cn';
import { formatPercentage, formatChange } from '@/lib/utils/formatters';
import { useSettings } from '@/hooks';

// ============================================
// Types
// ============================================

interface QuickStatsProps {
  totalIncome: number;
  totalExpenses: number;
  netAmount: number;
  savingsRate: number;
  momChange?: number;
  daysUntilPayday?: number;
  isLoading?: boolean;
}

interface StatCardProps {
  label: string;
  value: number;
  prefix?: string;
  suffix?: string;
  change?: number;
  changeLabel?: string;
  icon: React.ElementType;
  gradient: string;
  glowColor: string;
  delay?: number;
  isCurrency?: boolean;
}

// ============================================
// Animated Counter Hook
// ============================================

const useAnimatedCounter = (end: number, duration = 1000) => {
  const [count, setCount] = useState(0);
  const countRef = useRef(0);
  const startTime = useRef<number | null>(null);

  useEffect(() => {
    const start = countRef.current;
    const diff = end - start;

    const animate = (timestamp: number) => {
      if (!startTime.current) startTime.current = timestamp;
      const progress = Math.min((timestamp - startTime.current) / duration, 1);

      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const current = start + diff * easeOutQuart;

      setCount(current);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        countRef.current = end;
        startTime.current = null;
      }
    };

    requestAnimationFrame(animate);
  }, [end, duration]);

  return count;
};

// ============================================
// Stat Card Component
// ============================================

const StatCard = ({
  label,
  value,
  prefix = '',
  suffix = '',
  change,
  changeLabel,
  icon: Icon,
  gradient,
  glowColor,
  delay = 0,
  isCurrency = true,
}: StatCardProps) => {
  const { formatCurrency } = useSettings();
  const animatedValue = useAnimatedCounter(value, 1200);
  const isPositive = change !== undefined && change > 0;
  const isNegative = change !== undefined && change < 0;
  const TrendIcon = isPositive ? TrendingUp : isNegative ? TrendingDown : Minus;

  const displayValue = isCurrency
    ? formatCurrency(Math.round(animatedValue))
    : `${prefix}${Math.round(animatedValue)}${suffix}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay, duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
      className="h-full"
    >
      <div
        className={cn(
          'relative h-full rounded-2xl p-4 sm:p-5 stat-card',
          'glass-card overflow-hidden'
        )}
      >
        {/* Gradient accent line */}
        <div
          className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl"
          style={{ background: gradient }}
        />

        {/* Glow effect */}
        <div
          className="absolute -top-20 -right-20 w-40 h-40 rounded-full opacity-20 blur-3xl"
          style={{ background: glowColor }}
        />

        {/* Content */}
        <div className="relative z-10 flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <span className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 truncate pr-2">
              {label}
            </span>
            <div
              className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl flex-shrink-0"
              style={{ background: `${glowColor}20` }}
            >
              <Icon className="h-4 w-4 sm:h-5 sm:w-5" style={{ color: glowColor }} />
            </div>
          </div>

          {/* Value */}
          <div className="flex-1">
            <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
              {displayValue}
            </p>
          </div>

          {/* Change indicator */}
          <div className="mt-2 sm:mt-3 min-h-[20px] sm:min-h-[24px]">
            {change !== undefined ? (
              <div className="flex items-center gap-1 sm:gap-1.5 flex-wrap">
                <div
                  className={cn(
                    'flex items-center gap-0.5 sm:gap-1 px-1.5 sm:px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-medium',
                    isPositive && 'bg-green-500/10 text-green-500',
                    isNegative && 'bg-red-500/10 text-red-500',
                    !isPositive && !isNegative && 'bg-gray-500/10 text-gray-500'
                  )}
                >
                  <TrendIcon className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                  {formatChange(change)}
                </div>
                {changeLabel && (
                  <span className="text-[10px] sm:text-xs text-gray-400 dark:text-gray-500 hidden sm:inline">
                    {changeLabel}
                  </span>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-1 sm:gap-1.5 text-[10px] sm:text-xs text-gray-400">
                <Sparkles className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                <span>This month</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// ============================================
// Loading Skeleton
// ============================================

const StatCardSkeleton = ({ delay = 0 }: { delay?: number }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ delay }}
    className="h-full"
  >
    <div className="relative h-full rounded-2xl p-5 glass-card overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl bg-gray-200 dark:bg-gray-800 animate-pulse" />
      <div className="relative z-10 flex flex-col h-full">
        <div className="flex items-center justify-between mb-3">
          <div className="h-4 w-20 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
          <div className="h-9 w-9 bg-gray-200 dark:bg-gray-800 rounded-xl animate-pulse" />
        </div>
        <div className="flex-1">
          <div className="h-8 w-32 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
        </div>
        <div className="mt-3">
          <div className="h-5 w-24 bg-gray-200 dark:bg-gray-800 rounded-full animate-pulse" />
        </div>
      </div>
    </div>
  </motion.div>
);

// ============================================
// Main Component
// ============================================

const QuickStats = ({
  totalIncome,
  totalExpenses,
  netAmount,
  savingsRate,
  momChange,
  daysUntilPayday,
  isLoading,
}: QuickStatsProps) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 auto-rows-fr">
        {[0, 0.1, 0.2, 0.3].map((delay, i) => (
          <StatCardSkeleton key={i} delay={delay} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 auto-rows-fr">
      <StatCard
        label="Total Income"
        value={totalIncome}
        icon={DollarSign}
        gradient="linear-gradient(135deg, #11998e 0%, #38ef7d 100%)"
        glowColor="#22c55e"
        delay={0}
      />
      <StatCard
        label="Total Expenses"
        value={totalExpenses}
        change={momChange}
        changeLabel="vs last month"
        icon={CreditCard}
        gradient="linear-gradient(135deg, #eb3349 0%, #f45c43 100%)"
        glowColor="#ef4444"
        delay={0.1}
      />
      <StatCard
        label="Net Savings"
        value={Math.abs(netAmount)}
        prefix={netAmount < 0 ? '-' : ''}
        change={totalIncome > 0 ? (netAmount >= 0 ? savingsRate : -Math.abs(savingsRate)) : undefined}
        changeLabel={totalIncome > 0 ? "savings rate" : undefined}
        icon={PiggyBank}
        gradient={netAmount >= 0
          ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
          : "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
        }
        glowColor={netAmount >= 0 ? "#8b5cf6" : "#f97316"}
        delay={0.2}
      />
      <StatCard
        label="Next Payday"
        value={daysUntilPayday ?? 0}
        prefix=""
        suffix={daysUntilPayday !== undefined ? " days" : ""}
        icon={Calendar}
        gradient="linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)"
        glowColor="#06b6d4"
        delay={0.3}
        isCurrency={false}
      />
    </div>
  );
};

export { QuickStats };
