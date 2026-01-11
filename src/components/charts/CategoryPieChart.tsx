'use client';

// ============================================
// Category Breakdown Pie Chart
// ============================================

import { useState, useEffect, useMemo, useCallback } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { CategoryBreakdown } from '@/types';
import { CATEGORIES } from '@/lib/utils/constants';
import { formatPercentage } from '@/lib/utils/formatters';
import { useSettings, useCategories } from '@/hooks';
import { ChartContainer } from './ChartContainer';

// ============================================
// Responsive Dimensions Hook
// ============================================

const useResponsivePieSize = () => {
  const [dimensions, setDimensions] = useState({ inner: 60, outer: 100, isMobile: false });

  useEffect(() => {
    const checkWidth = () => {
      const isMobile = window.innerWidth < 640;
      setDimensions(isMobile
        ? { inner: 50, outer: 85, isMobile: true }
        : { inner: 60, outer: 100, isMobile: false }
      );
    };

    checkWidth();
    window.addEventListener('resize', checkWidth);
    return () => window.removeEventListener('resize', checkWidth);
  }, []);

  return dimensions;
};

// ============================================
// Types
// ============================================

interface CategoryPieChartProps {
  data: CategoryBreakdown[];
  isLoading?: boolean;
  totalAmount?: number;
}

// ============================================
// Custom Tooltip
// ============================================

interface TooltipProps {
  active?: boolean;
  payload?: Array<{ payload: CategoryBreakdown & { fill: string; name: string } }>;
  formatCurrency: (cents: number, showCents?: boolean) => string;
}

const CustomTooltip = ({ active, payload, formatCurrency }: TooltipProps) => {
  if (!active || !payload?.length) return null;

  const data = payload[0].payload;

  return (
    <div className="bg-white dark:bg-gray-800 px-4 py-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
      <div className="flex items-center gap-2 mb-1">
        <div
          className="w-3 h-3 rounded-full"
          style={{ backgroundColor: data.fill }}
        />
        <p className="text-sm font-medium text-gray-900 dark:text-white">
          {data.name}
        </p>
      </div>
      <p className="text-lg font-bold text-gray-900 dark:text-white">
        {formatCurrency(data.amount)}
      </p>
      <p className="text-xs text-gray-500 dark:text-gray-400">
        {formatPercentage(data.percentage)} of total
      </p>
    </div>
  );
};

// ============================================
// Custom Legend
// ============================================

interface LegendProps {
  payload?: Array<{ value: string; color: string; payload: CategoryBreakdown & { name: string; fill: string } }>;
}

const CustomLegend = ({ payload }: LegendProps) => {
  if (!payload) return null;

  return (
    <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mt-4">
      {payload.map((entry, index) => {
        return (
          <div key={index} className="flex items-center gap-1.5">
            <div
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: entry.payload.fill }}
            />
            <span className="text-xs text-gray-600 dark:text-gray-400">
              {entry.payload.name}
            </span>
          </div>
        );
      })}
    </div>
  );
};

// ============================================
// Component
// ============================================

const CategoryPieChart = ({ data, isLoading, totalAmount }: CategoryPieChartProps) => {
  const pieSize = useResponsivePieSize();
  const { formatCurrency } = useSettings();
  const { getCategoryById } = useCategories();

  // Helper to get category info (supports both default and custom categories)
  const getCategoryInfo = useCallback((categoryId: string) => {
    // First try to get from unified categories (includes custom)
    const unified = getCategoryById(categoryId);
    if (unified) {
      return { name: unified.name, color: unified.color };
    }
    // Fallback to default categories
    if (categoryId in CATEGORIES) {
      const config = CATEGORIES[categoryId as keyof typeof CATEGORIES];
      return { name: config.name, color: config.color };
    }
    // Ultimate fallback for unknown categories
    return { name: categoryId, color: '#6B7280' };
  }, [getCategoryById]);

  // Prepare chart data with colors (supports custom categories)
  const chartData = useMemo(() =>
    data.map((item) => {
      const info = getCategoryInfo(item.category as string);
      return {
        ...item,
        name: info.name,
        fill: info.color,
      };
    }),
    [data, getCategoryInfo]
  );

  return (
    <ChartContainer
      title="Spending by Category"
      isLoading={isLoading}
      isEmpty={chartData.length === 0}
      height={320}
      mobileHeight={280}
    >
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="42%"
          innerRadius={pieSize.inner}
          outerRadius={pieSize.outer}
          paddingAngle={2}
          dataKey="amount"
          animationBegin={0}
          animationDuration={800}
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.fill} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip formatCurrency={formatCurrency} />} />
        <Legend content={<CustomLegend />} verticalAlign="bottom" />
        {/* Center Label */}
        {totalAmount !== undefined && (
          <text
            x="50%"
            y="40%"
            textAnchor="middle"
            dominantBaseline="middle"
            className="fill-gray-900 dark:fill-white"
          >
            <tspan
              x="50%"
              dy="-0.3em"
              className="fill-gray-500"
              style={{ fontSize: pieSize.isMobile ? '10px' : '14px' }}
            >
              Total
            </tspan>
            <tspan
              x="50%"
              dy="1.4em"
              className="font-bold"
              style={{ fontSize: pieSize.isMobile ? '14px' : '20px' }}
            >
              {formatCurrency(totalAmount, false)}
            </tspan>
          </text>
        )}
      </PieChart>
    </ChartContainer>
  );
};

export { CategoryPieChart };
