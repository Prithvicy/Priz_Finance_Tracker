'use client';

// ============================================
// Goals Radar Chart - Stunning Visualization
// Shows target vs actual allocation across all goal categories
// ============================================

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { Target, TrendingUp } from 'lucide-react';
import { GoalProgress } from '@/types';
import { GOAL_CATEGORIES } from '@/lib/utils/constants';
import { useSettings } from '@/hooks';
import { cn } from '@/lib/cn';

// ============================================
// Types
// ============================================

interface GoalsRadarChartProps {
  progress: GoalProgress[];
  isLoading?: boolean;
}

// ============================================
// Custom Tooltip
// ============================================

const CustomTooltip = ({
  active,
  payload,
  formatCurrency,
}: {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    dataKey: string;
    payload: { category: string; target: number; actual: number; targetAmount: number; actualAmount: number };
  }>;
  formatCurrency: (cents: number) => string;
}) => {
  if (!active || !payload?.length) return null;

  const data = payload[0].payload;
  const categoryConfig = GOAL_CATEGORIES[data.category as keyof typeof GOAL_CATEGORIES];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass-card rounded-xl p-4 min-w-[200px]"
    >
      <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-200 dark:border-gray-700">
        <div
          className="w-3 h-3 rounded-full"
          style={{ background: categoryConfig.color }}
        />
        <p className="text-sm font-semibold text-gray-900 dark:text-white">
          {categoryConfig.name}
        </p>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500 flex items-center gap-1">
            <Target className="h-3 w-3" /> Target
          </span>
          <span className="text-sm font-medium text-indigo-600 dark:text-indigo-400">
            {data.target.toFixed(1)}% ({formatCurrency(data.targetAmount)})
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500 flex items-center gap-1">
            <TrendingUp className="h-3 w-3" /> Actual
          </span>
          <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
            {data.actual.toFixed(1)}% ({formatCurrency(data.actualAmount)})
          </span>
        </div>
      </div>

      <div className="mt-3 pt-2 border-t border-gray-200 dark:border-gray-700">
        <div
          className={cn(
            'text-xs font-medium px-2 py-1 rounded-full inline-block',
            data.actual <= data.target
              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
              : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
          )}
        >
          {data.actual <= data.target ? 'On Track' : 'Over Budget'}
        </div>
      </div>
    </motion.div>
  );
};

// ============================================
// Custom Legend
// ============================================

const CustomLegend = () => {
  return (
    <div className="flex justify-center gap-6 mt-4">
      <div className="flex items-center gap-2">
        <div className="w-4 h-1 rounded-full bg-indigo-500" />
        <span className="text-xs text-gray-500 dark:text-gray-400">Target</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-4 h-1 rounded-full bg-emerald-500" />
        <span className="text-xs text-gray-500 dark:text-gray-400">Actual</span>
      </div>
    </div>
  );
};

// ============================================
// Loading Skeleton
// ============================================

const LoadingSkeleton = () => (
  <div className="glass-card rounded-2xl p-6">
    <div className="h-6 w-48 bg-gray-200 dark:bg-gray-800 rounded animate-pulse mb-4" />
    <div className="h-[350px] flex items-center justify-center">
      <div className="w-48 h-48 rounded-full border-8 border-gray-200 dark:border-gray-800 animate-pulse" />
    </div>
  </div>
);

// ============================================
// Main Component
// ============================================

const GoalsRadarChart = ({ progress, isLoading }: GoalsRadarChartProps) => {
  const { formatCurrency } = useSettings();

  // Transform data for radar chart
  const chartData = useMemo(() => {
    return progress.map((p) => ({
      category: p.category,
      name: GOAL_CATEGORIES[p.category].name,
      target: p.targetPercentage,
      actual: p.actualPercentage,
      targetAmount: p.targetAmount,
      actualAmount: p.actualAmount,
      fullMark: 100,
    }));
  }, [progress]);

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="glass-card rounded-2xl p-6"
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20">
          <Target className="h-5 w-5 text-indigo-500" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Goal Allocation Overview
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Target vs Actual spending distribution
          </p>
        </div>
      </div>

      {/* Chart */}
      <div className="h-[350px]">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="70%" data={chartData}>
            <defs>
              <linearGradient id="targetGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#6366f1" stopOpacity={0.8} />
                <stop offset="100%" stopColor="#6366f1" stopOpacity={0.2} />
              </linearGradient>
              <linearGradient id="actualGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity={0.8} />
                <stop offset="100%" stopColor="#10b981" stopOpacity={0.2} />
              </linearGradient>
            </defs>
            <PolarGrid
              stroke="rgba(148, 163, 184, 0.2)"
              strokeDasharray="3 3"
            />
            <PolarAngleAxis
              dataKey="name"
              tick={{
                fill: '#94a3b8',
                fontSize: 12,
                fontWeight: 500,
              }}
              tickLine={false}
            />
            <PolarRadiusAxis
              angle={30}
              domain={[0, 'auto']}
              tick={{ fill: '#94a3b8', fontSize: 10 }}
              tickFormatter={(value) => `${value}%`}
              axisLine={false}
            />
            <Radar
              name="Target"
              dataKey="target"
              stroke="#6366f1"
              strokeWidth={2}
              fill="url(#targetGradient)"
              fillOpacity={0.3}
              animationDuration={1000}
            />
            <Radar
              name="Actual"
              dataKey="actual"
              stroke="#10b981"
              strokeWidth={2}
              fill="url(#actualGradient)"
              fillOpacity={0.3}
              animationDuration={1200}
              animationBegin={200}
            />
            <Tooltip
              content={({ active, payload }) => (
                <CustomTooltip
                  active={active}
                  payload={payload as Array<{
                    name: string;
                    value: number;
                    dataKey: string;
                    payload: { category: string; target: number; actual: number; targetAmount: number; actualAmount: number };
                  }>}
                  formatCurrency={formatCurrency}
                />
              )}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Custom Legend */}
      <CustomLegend />
    </motion.div>
  );
};

export { GoalsRadarChart };
