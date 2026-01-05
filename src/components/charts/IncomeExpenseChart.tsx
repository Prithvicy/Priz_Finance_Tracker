'use client';

// ============================================
// Income vs Expenses Comparison Chart
// ============================================

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceLine,
} from 'recharts';
import { IncomeVsExpense } from '@/types';
import { formatPercentage } from '@/lib/utils/formatters';
import { useSettings } from '@/hooks';
import { ChartContainer } from './ChartContainer';

// ============================================
// Types
// ============================================

interface IncomeExpenseChartProps {
  data: IncomeVsExpense[];
  isLoading?: boolean;
}

// ============================================
// Custom Tooltip
// ============================================

interface TooltipProps {
  active?: boolean;
  payload?: Array<{ value: number; dataKey: string; payload: IncomeVsExpense }>;
  label?: string;
}

const CustomTooltip = ({ active, payload, label, formatCurrency }: TooltipProps & { formatCurrency: (cents: number) => string }) => {
  if (!active || !payload?.length) return null;

  const data = payload[0].payload;

  return (
    <div className="bg-white dark:bg-gray-800 px-4 py-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 min-w-[180px]">
      <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">
        {label}
      </p>
      <div className="space-y-1.5">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
            <span className="text-xs text-gray-500">Income</span>
          </div>
          <span className="text-sm font-medium text-green-600">
            {formatCurrency(data.income)}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
            <span className="text-xs text-gray-500">Expenses</span>
          </div>
          <span className="text-sm font-medium text-red-600">
            {formatCurrency(data.expenses)}
          </span>
        </div>
        <div className="pt-1.5 mt-1.5 border-t border-gray-100 dark:border-gray-700">
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-500">Net</span>
            <span
              className={`text-sm font-bold ${
                data.net >= 0 ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {data.net >= 0 ? '+' : ''}
              {formatCurrency(data.net)}
            </span>
          </div>
          <div className="flex justify-between items-center mt-0.5">
            <span className="text-xs text-gray-500">Savings Rate</span>
            <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
              {formatPercentage(Math.max(0, data.savingsRate))}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================
// Component
// ============================================

const IncomeExpenseChart = ({ data, isLoading }: IncomeExpenseChartProps) => {
  const { formatCurrency, settings } = useSettings();

  // Data already contains exactly 6 months from the calculation
  const chartData = data;

  // Currency symbol for axis
  const currencySymbol = settings.currency === 'INR' ? '₹' : '$';

  return (
    <ChartContainer
      title="Income vs Expenses"
      isLoading={isLoading}
      isEmpty={chartData.length === 0}
      height={300}
    >
      <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
        <XAxis
          dataKey="period"
          tickLine={false}
          axisLine={false}
          tick={{ fill: '#6b7280', fontSize: 12 }}
          tickFormatter={(value) => value.split(' ')[0]} // Just show month
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tick={{ fill: '#6b7280', fontSize: 12 }}
          tickFormatter={(value) => `${currencySymbol}${(value / 100 / 1000).toFixed(0)}k`}
        />
        <Tooltip content={<CustomTooltip formatCurrency={formatCurrency} />} cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }} />
        <Legend
          iconType="circle"
          iconSize={8}
          wrapperStyle={{ paddingTop: 16 }}
          formatter={(value) => (
            <span className="text-xs text-gray-600 dark:text-gray-400">
              {value.charAt(0).toUpperCase() + value.slice(1)}
            </span>
          )}
        />
        <ReferenceLine y={0} stroke="#e5e7eb" />
        <Bar dataKey="income" fill="#22c55e" radius={[4, 4, 0, 0]} maxBarSize={40} />
        <Bar dataKey="expenses" fill="#ef4444" radius={[4, 4, 0, 0]} maxBarSize={40} />
      </BarChart>
    </ChartContainer>
  );
};

export { IncomeExpenseChart };
