'use client';

// ============================================
// Analytics Overview Page
// ============================================

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ChevronRight, TrendingUp, TrendingDown, DollarSign, PieChart } from 'lucide-react';
import { PageContainer, PageSection, Grid } from '@/components/layout';
import { Card, CardHeader, CardTitle, CardContent, Button, Badge } from '@/components/ui';
import { CategoryPieChart, MonthlyBarChart, WeeklyTrendLine, IncomeExpenseChart, CategoryStreamChart } from '@/components/charts';
import { useExpenses, useIncome, useAnalytics, useSettings } from '@/hooks';
import { getDateRange, getLastNMonths } from '@/lib/utils/dateUtils';
import { formatPercentage, formatChange } from '@/lib/utils/formatters';
import { CATEGORIES } from '@/lib/utils/constants';
import { cn } from '@/lib/cn';

export default function AnalyticsPage() {
  const [period, setPeriod] = useState<'month' | 'quarter' | 'year'>('month');
  const { expenses, isLoading: expensesLoading } = useExpenses();
  const { income, isLoading: incomeLoading } = useIncome();
  const { formatCurrency } = useSettings();

  const dateRange = useMemo(() => getDateRange(period), [period]);

  const analytics = useAnalytics({
    expenses,
    income,
    dateRange,
  });

  const isLoading = expensesLoading || incomeLoading;

  return (
    <PageContainer
      title="Analytics"
      description="Insights into your financial habits"
    >
      {/* Period Selector */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {(['month', 'quarter', 'year'] as const).map((p) => (
          <Button
            key={p}
            variant={period === p ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setPeriod(p)}
            className="capitalize"
          >
            This {p}
          </Button>
        ))}
      </div>

      {/* Key Insights */}
      <PageSection title="Key Insights">
        <Grid cols={3} gap="md">
          {/* Savings Rate */}
          <Card className="p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-500 dark:text-gray-400">Savings Rate</p>
              <div
                className={cn(
                  'p-2 rounded-lg',
                  analytics.savingsRate > 0
                    ? 'bg-green-100 dark:bg-green-900/30'
                    : 'bg-red-100 dark:bg-red-900/30'
                )}
              >
                {analytics.savingsRate > 0 ? (
                  <TrendingUp className="h-4 w-4 text-green-600" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-600" />
                )}
              </div>
            </div>
            <p
              className={cn(
                'text-2xl font-bold',
                analytics.savingsRate > 0
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-red-600 dark:text-red-400'
              )}
            >
              {formatPercentage(Math.abs(analytics.savingsRate))}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {analytics.savingsRate > 0 ? 'of income saved' : 'overspending'}
            </p>
          </Card>

          {/* Top Category */}
          <Card className="p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-500 dark:text-gray-400">Top Category</p>
              <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-900/30">
                <PieChart className="h-4 w-4 text-indigo-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {analytics.topCategory
                ? CATEGORIES[analytics.topCategory.category].name
                : '--'}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {analytics.topCategory
                ? `${formatCurrency(analytics.topCategory.amount)} (${formatPercentage(analytics.topCategory.percentage)})`
                : 'No expenses'}
            </p>
          </Card>

          {/* Average Daily */}
          <Card className="p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-500 dark:text-gray-400">Daily Average</p>
              <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                <DollarSign className="h-4 w-4 text-purple-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {formatCurrency(analytics.averageDailySpending)}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">per day</p>
          </Card>
        </Grid>
      </PageSection>

      {/* Charts */}
      <PageSection title="Spending Breakdown">
        <Grid cols={2} gap="lg">
          <CategoryPieChart
            data={analytics.categoryBreakdown}
            totalAmount={analytics.totalExpenses}
            isLoading={isLoading}
          />
          <WeeklyTrendLine data={analytics.weeklyTrend} isLoading={isLoading} />
        </Grid>
      </PageSection>

      {/* New: Category Stream Chart */}
      <PageSection title="">
        <CategoryStreamChart expenses={expenses} isLoading={isLoading} />
      </PageSection>

      <PageSection title="Income vs Expenses">
        <IncomeExpenseChart
          data={analytics.incomeVsExpenses}
          isLoading={isLoading}
        />
      </PageSection>

      <PageSection title="Monthly Overview">
        <MonthlyBarChart data={analytics.monthlyTotals} isLoading={isLoading} />
      </PageSection>

      {/* Quick Links */}
      <PageSection title="Detailed Reports">
        <Grid cols={3} gap="md">
          <Link href="/analytics/weekly">
            <Card hover className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Weekly</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Day-by-day breakdown
                  </p>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-400" />
              </div>
            </Card>
          </Link>

          <Link href="/analytics/monthly">
            <Card hover className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Monthly</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Month-over-month trends
                  </p>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-400" />
              </div>
            </Card>
          </Link>

          <Link href="/analytics/yearly">
            <Card hover className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Yearly</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Annual summary
                  </p>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-400" />
              </div>
            </Card>
          </Link>
        </Grid>
      </PageSection>
    </PageContainer>
  );
}
