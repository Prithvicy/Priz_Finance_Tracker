'use client';

// ============================================
// Monthly Spending Bar Chart
// ============================================

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { MonthlyTotal } from '@/types';
import { useSettings } from '@/hooks';
import { ChartContainer } from './ChartContainer';

// ============================================
// Types
// ============================================

interface MonthlyBarChartProps {
  data: MonthlyTotal[];
  isLoading?: boolean;
  budget?: number;
}

// ============================================
// Custom Tooltip
// ============================================

interface TooltipProps {
  active?: boolean;
  payload?: Array<{ value: number; payload: MonthlyTotal }>;
  label?: string;
  formatCurrency: (cents: number) => string;
}

const CustomTooltip = ({ active, payload, label, formatCurrency }: TooltipProps) => {
  if (!active || !payload?.length) return null;

  const data = payload[0].payload;

  return (
    <div className="bg-white dark:bg-gray-800 px-4 py-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
      <p className="text-sm font-medium text-gray-900 dark:text-white">
        {label} {data.year}
      </p>
      <p className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
        {formatCurrency(data.total)}
      </p>
      <p className="text-xs text-gray-500 dark:text-gray-400">
        {data.count} transactions
      </p>
    </div>
  );
};

// ============================================
// Component
// ============================================

const MonthlyBarChart = ({ data, isLoading, budget }: MonthlyBarChartProps) => {
  const { formatCurrency, settings } = useSettings();
  const currencySymbol = settings.currency === 'INR' ? '₹' : '$';

  // Get last 6 months
  const chartData = data.slice(-6);

  return (
    <ChartContainer
      title="Monthly Spending"
      isLoading={isLoading}
      isEmpty={chartData.length === 0}
      height={280}
      mobileHeight={220}
    >
      <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
        <XAxis
          dataKey="month"
          tickLine={false}
          axisLine={false}
          tick={{ fill: '#6b7280', fontSize: 12 }}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tick={{ fill: '#6b7280', fontSize: 12 }}
          tickFormatter={(value) => `${currencySymbol}${(value / 100).toLocaleString()}`}
        />
        <Tooltip
          content={({ active, payload, label }) => (
            <CustomTooltip
              active={active}
              payload={payload as Array<{ value: number; payload: MonthlyTotal }>}
              label={label as string}
              formatCurrency={formatCurrency}
            />
          )}
          cursor={{ fill: 'rgba(99, 102, 241, 0.1)' }}
        />
        {budget && (
          <CartesianGrid
            horizontal={false}
            vertical={false}
            strokeDasharray="5 5"
            stroke="#ef4444"
          />
        )}
        <Bar dataKey="total" radius={[6, 6, 0, 0]} maxBarSize={60}>
          {chartData.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={budget && entry.total > budget ? '#ef4444' : '#6366f1'}
            />
          ))}
        </Bar>
      </BarChart>
    </ChartContainer>
  );
};

export { MonthlyBarChart };
