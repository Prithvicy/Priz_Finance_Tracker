'use client';

// ============================================
// Weekly Spending Trend Line Chart
// ============================================

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Line,
} from 'recharts';
import { WeeklyTrend } from '@/types';
import { useSettings } from '@/hooks';
import { format } from 'date-fns';
import { ChartContainer } from './ChartContainer';

// ============================================
// Types
// ============================================

interface WeeklyTrendLineProps {
  data: WeeklyTrend[];
  isLoading?: boolean;
}

// ============================================
// Custom Tooltip
// ============================================

interface TooltipProps {
  active?: boolean;
  payload?: Array<{ value: number; payload: WeeklyTrend }>;
  label?: string;
  formatCurrency: (cents: number) => string;
}

const CustomTooltip = ({ active, payload, formatCurrency }: TooltipProps) => {
  if (!active || !payload?.length) return null;

  const data = payload[0].payload;

  return (
    <div className="bg-white dark:bg-gray-800 px-4 py-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
      <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
        Week {data.week}
      </p>
      <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
        {format(data.weekStart, 'MMM d')} - {format(data.weekEnd, 'MMM d')}
      </p>
      <div className="flex items-center gap-3">
        <div>
          <p className="text-xs text-gray-500">Spent</p>
          <p className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
            {formatCurrency(data.amount)}
          </p>
        </div>
        <div className="border-l border-gray-200 dark:border-gray-700 pl-3">
          <p className="text-xs text-gray-500">Average</p>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
            {formatCurrency(data.average)}
          </p>
        </div>
      </div>
    </div>
  );
};

// ============================================
// Component
// ============================================

const WeeklyTrendLine = ({ data, isLoading }: WeeklyTrendLineProps) => {
  const { formatCurrency, settings } = useSettings();
  const currencySymbol = settings.currency === 'INR' ? '₹' : '$';

  // Format data for chart
  const chartData = data.map((week) => ({
    ...week,
    label: `W${week.week}`,
  }));

  return (
    <ChartContainer
      title="Weekly Trend"
      isLoading={isLoading}
      isEmpty={chartData.length === 0}
      height={280}
    >
      <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
        <XAxis
          dataKey="label"
          tickLine={false}
          axisLine={false}
          tick={{ fill: '#6b7280', fontSize: 12 }}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tick={{ fill: '#6b7280', fontSize: 12 }}
          tickFormatter={(value) => `${currencySymbol}${(value / 100).toFixed(0)}`}
        />
        <Tooltip
          content={({ active, payload, label }) => (
            <CustomTooltip
              active={active}
              payload={payload as Array<{ value: number; payload: WeeklyTrend }>}
              label={label as string}
              formatCurrency={formatCurrency}
            />
          )}
        />
        <Area
          type="monotone"
          dataKey="amount"
          stroke="#6366f1"
          strokeWidth={2}
          fillOpacity={1}
          fill="url(#colorAmount)"
        />
        <Line
          type="monotone"
          dataKey="average"
          stroke="#9ca3af"
          strokeWidth={2}
          strokeDasharray="5 5"
          dot={false}
        />
      </AreaChart>
    </ChartContainer>
  );
};

export { WeeklyTrendLine };
