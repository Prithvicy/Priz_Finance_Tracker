'use client';

// ============================================
// Radial Progress Component - Stunning Animated Rings
// Beautiful circular progress indicators for goals
// ============================================

import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/cn';

// ============================================
// Types
// ============================================

interface RadialProgressProps {
  percentage: number;
  targetPercentage?: number;
  size?: number;
  strokeWidth?: number;
  color: string;
  backgroundColor?: string;
  label?: string;
  sublabel?: string;
  showPercentage?: boolean;
  animate?: boolean;
  className?: string;
}

interface MultiRadialProgressProps {
  items: Array<{
    percentage: number;
    color: string;
    label: string;
  }>;
  size?: number;
  strokeWidth?: number;
  className?: string;
}

// ============================================
// Animated Counter Hook
// ============================================

const useAnimatedValue = (end: number, duration = 1000) => {
  const [value, setValue] = useState(0);
  const startTime = useRef<number | null>(null);
  const animationRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    const start = 0;
    const diff = end - start;

    const animate = (timestamp: number) => {
      if (!startTime.current) startTime.current = timestamp;
      const progress = Math.min((timestamp - startTime.current) / duration, 1);

      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(start + diff * eased);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [end, duration]);

  return value;
};

// ============================================
// Single Radial Progress
// ============================================

const RadialProgress = ({
  percentage,
  targetPercentage,
  size = 120,
  strokeWidth = 10,
  color,
  backgroundColor = 'rgba(148, 163, 184, 0.2)',
  label,
  sublabel,
  showPercentage = true,
  animate = true,
  className,
}: RadialProgressProps) => {
  const animatedPercentage = useAnimatedValue(animate ? percentage : 0, 1500);
  const displayPercentage = animate ? animatedPercentage : percentage;

  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (Math.min(displayPercentage, 100) / 100) * circumference;

  // Target line position
  const targetOffset = targetPercentage
    ? circumference - (Math.min(targetPercentage, 100) / 100) * circumference
    : null;

  return (
    <div className={cn('relative inline-flex flex-col items-center', className)}>
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={backgroundColor}
          strokeWidth={strokeWidth}
        />

        {/* Glow effect */}
        <defs>
          <filter id={`glow-${color.replace('#', '')}`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <linearGradient id={`gradient-${color.replace('#', '')}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={color} stopOpacity={1} />
            <stop offset="100%" stopColor={color} stopOpacity={0.6} />
          </linearGradient>
        </defs>

        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={`url(#gradient-${color.replace('#', '')})`}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          filter={`url(#glow-${color.replace('#', '')})`}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
        />

        {/* Target indicator */}
        {targetPercentage && targetOffset !== null && (
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="white"
            strokeWidth={2}
            strokeLinecap="round"
            strokeDasharray={`4 ${circumference - 4}`}
            strokeDashoffset={targetOffset}
            opacity={0.8}
          />
        )}
      </svg>

      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {showPercentage && (
          <motion.span
            className="text-2xl font-bold text-gray-900 dark:text-white"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5, type: 'spring' }}
          >
            {Math.round(displayPercentage)}%
          </motion.span>
        )}
        {label && (
          <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {label}
          </span>
        )}
      </div>

      {/* Sublabel below */}
      {sublabel && (
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 mt-3">
          {sublabel}
        </span>
      )}
    </div>
  );
};

// ============================================
// Multi-Ring Radial Progress
// ============================================

const MultiRadialProgress = ({
  items,
  size = 200,
  strokeWidth = 12,
  className,
}: MultiRadialProgressProps) => {
  const gap = 4;
  const totalItems = items.length;

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)}>
      <svg width={size} height={size} className="transform -rotate-90">
        <defs>
          {items.map((item, i) => (
            <linearGradient
              key={`gradient-multi-${i}`}
              id={`gradient-multi-${i}`}
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop offset="0%" stopColor={item.color} stopOpacity={1} />
              <stop offset="100%" stopColor={item.color} stopOpacity={0.5} />
            </linearGradient>
          ))}
        </defs>

        {items.map((item, index) => {
          const radius = (size - strokeWidth) / 2 - (strokeWidth + gap) * index;
          const circumference = radius * 2 * Math.PI;
          const offset = circumference - (Math.min(item.percentage, 100) / 100) * circumference;

          return (
            <g key={index}>
              {/* Background */}
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke="rgba(148, 163, 184, 0.1)"
                strokeWidth={strokeWidth}
              />
              {/* Progress */}
              <motion.circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke={`url(#gradient-multi-${index})`}
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset: offset }}
                transition={{
                  duration: 1.5,
                  delay: index * 0.2,
                  ease: 'easeOut',
                }}
              />
            </g>
          );
        })}
      </svg>

      {/* Center content */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <span className="text-3xl font-bold text-gray-900 dark:text-white">
            {Math.round(items.reduce((sum, i) => sum + i.percentage, 0) / items.length)}%
          </span>
          <p className="text-xs text-gray-500 dark:text-gray-400">Average</p>
        </div>
      </div>

      {/* Legend */}
      <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 flex gap-4">
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <div
              className="w-2 h-2 rounded-full"
              style={{ background: item.color }}
            />
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ============================================
// Financial Health Score Ring
// ============================================

interface HealthScoreRingProps {
  score: number;
  size?: number;
  className?: string;
}

const HealthScoreRing = ({ score, size = 180, className }: HealthScoreRingProps) => {
  const animatedScore = useAnimatedValue(score, 2000);

  // Determine color based on score
  const getScoreColor = (s: number) => {
    if (s >= 80) return { color: '#22c55e', label: 'Excellent', bg: 'from-green-500/20 to-emerald-500/20' };
    if (s >= 60) return { color: '#3b82f6', label: 'Good', bg: 'from-blue-500/20 to-indigo-500/20' };
    if (s >= 40) return { color: '#f59e0b', label: 'Fair', bg: 'from-amber-500/20 to-orange-500/20' };
    return { color: '#ef4444', label: 'Needs Work', bg: 'from-red-500/20 to-rose-500/20' };
  };

  const { color, label, bg } = getScoreColor(score);
  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (animatedScore / 100) * circumference;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className={cn('relative inline-flex items-center justify-center', className)}
    >
      {/* Glow background */}
      <div
        className={cn(
          'absolute inset-4 rounded-full bg-gradient-to-br blur-2xl opacity-50',
          bg
        )}
      />

      <svg width={size} height={size} className="transform -rotate-90 relative z-10">
        <defs>
          <linearGradient id="healthGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={color} stopOpacity={1} />
            <stop offset="50%" stopColor={color} stopOpacity={0.8} />
            <stop offset="100%" stopColor={color} stopOpacity={0.5} />
          </linearGradient>
          <filter id="healthGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(148, 163, 184, 0.15)"
          strokeWidth={strokeWidth}
        />

        {/* Progress arc */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="url(#healthGradient)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          filter="url(#healthGlow)"
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 2, ease: 'easeOut' }}
        />
      </svg>

      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
        <motion.span
          className="text-4xl font-bold"
          style={{ color }}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.8, type: 'spring', stiffness: 200 }}
        >
          {Math.round(animatedScore)}
        </motion.span>
        <span className="text-sm text-gray-500 dark:text-gray-400">out of 100</span>
        <motion.span
          className="text-xs font-medium mt-2 px-3 py-1 rounded-full"
          style={{ backgroundColor: `${color}20`, color }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
        >
          {label}
        </motion.span>
      </div>
    </motion.div>
  );
};

export { RadialProgress, MultiRadialProgress, HealthScoreRing };
