'use client';

// ============================================
// Yearly Analytics Page
// ============================================

import { useMemo, useCallback } from 'react';
import { format, getYear } from 'date-fns';
import { PageContainer, PageSection, Grid } from '@/components/layout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import { MonthlyBarChart, IncomeExpenseChart, CategoryPieChart } from '@/components/charts';
import { useExpenses, useIncome, useAnalytics, useSettings, useCategories } from '@/hooks';
import { getDateRange } from '@/lib/utils/dateUtils';
import { formatPercentage } from '@/lib/utils/formatters';
import { CATEGORIES, MONTHS_SHORT } from '@/lib/utils/constants';

export default function YearlyAnalyticsPage() {
  const { expenses, isLoading: expensesLoading } = useExpenses();
  const { income, isLoading: incomeLoading } = useIncome();
  const { formatCurrency } = useSettings();
  const { getCategoryById } = useCategories();

  // Helper to get category info (supports both default and custom)
  const getCategoryInfo = useCallback((categoryId: string) => {
    const unified = getCategoryById(categoryId);
    if (unified) {
      return { name: unified.name, color: unified.color };
    }
    if (categoryId in CATEGORIES) {
      const config = CATEGORIES[categoryId as keyof typeof CATEGORIES];
      return { name: config.name, color: config.color };
    }
    return { name: categoryId, color: '#6B7280' };
  }, [getCategoryById]);

  const dateRange = useMemo(() => getDateRange('year'), []);

  const analytics = useAnalytics({
    expenses,
    income,
    dateRange,
  });

  const isLoading = expensesLoading || incomeLoading;

  // Calculate yearly summary
  const yearlyStats = useMemo(() => {
    const totalIncome = income.reduce((sum, i) => sum + i.amount, 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
    const avgMonthlyExpense = analytics.monthlyTotals.length > 0
      ? analytics.monthlyTotals.reduce((sum, m) => sum + m.total, 0) / analytics.monthlyTotals.length
      : 0;

    // Find best and worst months
    const sortedMonths = [...analytics.monthlyTotals].sort((a, b) => a.total - b.total);
    const bestMonth = sortedMonths[0];
    const worstMonth = sortedMonths[sortedMonths.length - 1];

    return {
      totalIncome,
      totalExpenses,
      avgMonthlyExpense,
      bestMonth,
      worstMonth,
    };
  }, [income, expenses, analytics.monthlyTotals]);

  return (
    <PageContainer
      title="Yearly Analytics"
      description={`${getYear(new Date())} Annual Summary`}
    >
      {/* Summary Stats */}
      <PageSection>
        <Grid cols={4} gap="md">
          <Card className="p-4">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Annual Income</p>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              {formatCurrency(yearlyStats.totalIncome)}
            </p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Annual Expenses</p>
            <p className="text-2xl font-bold text-red-600 dark:text-red-400">
              {formatCurrency(yearlyStats.totalExpenses)}
            </p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Net Savings</p>
            <p
              className={`text-2xl font-bold ${
                yearlyStats.totalIncome - yearlyStats.totalExpenses >= 0
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-red-600 dark:text-red-400'
              }`}
            >
              {formatCurrency(yearlyStats.totalIncome - yearlyStats.totalExpenses)}
            </p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Monthly Average</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {formatCurrency(yearlyStats.avgMonthlyExpense)}
            </p>
          </Card>
        </Grid>
      </PageSection>

      {/* Best/Worst Months */}
      <PageSection>
        <Grid cols={2} gap="md">
          <Card className="p-4 border-l-4 border-l-green-500">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
              Best Month (Lowest Spending)
            </p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">
              {yearlyStats.bestMonth
                ? `${yearlyStats.bestMonth.month} ${yearlyStats.bestMonth.year}`
                : '--'}
            </p>
            <p className="text-sm text-green-600 dark:text-green-400">
              {yearlyStats.bestMonth ? formatCurrency(yearlyStats.bestMonth.total) : '--'}
            </p>
          </Card>
          <Card className="p-4 border-l-4 border-l-red-500">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
              Highest Spending Month
            </p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">
              {yearlyStats.worstMonth
                ? `${yearlyStats.worstMonth.month} ${yearlyStats.worstMonth.year}`
                : '--'}
            </p>
            <p className="text-sm text-red-600 dark:text-red-400">
              {yearlyStats.worstMonth ? formatCurrency(yearlyStats.worstMonth.total) : '--'}
            </p>
          </Card>
        </Grid>
      </PageSection>

      {/* Monthly Trend */}
      <PageSection title="Monthly Spending Trend">
        <MonthlyBarChart data={analytics.monthlyTotals} isLoading={isLoading} />
      </PageSection>

      {/* Income vs Expenses */}
      <PageSection title="Income vs Expenses by Month">
        <IncomeExpenseChart data={analytics.incomeVsExpenses} isLoading={isLoading} />
      </PageSection>

      {/* Category Breakdown */}
      <PageSection title="Annual Category Breakdown">
        <Grid cols={2} gap="lg">
          <CategoryPieChart
            data={analytics.categoryBreakdown}
            totalAmount={yearlyStats.totalExpenses}
            isLoading={isLoading}
          />
          <Card>
            <CardHeader>
              <CardTitle>Category Rankings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.categoryBreakdown.slice(0, 8).map((cat, index) => {
                  const config = getCategoryInfo(cat.category as string);
                  return (
                    <div key={cat.category} className="flex items-center gap-4">
                      <span className="text-lg font-bold text-gray-400 w-6">
                        {index + 1}
                      </span>
                      <div
                        className="h-10 w-10 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: `${config.color}15` }}
                      >
                        <span style={{ color: config.color }} className="font-medium">
                          {config.name.charAt(0)}
                        </span>
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 dark:text-white">
                          {config.name}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {cat.count} transactions
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-900 dark:text-white">
                          {formatCurrency(cat.amount)}
                        </p>
                        <p className="text-sm text-gray-500">
                          {formatPercentage(cat.percentage)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </Grid>
      </PageSection>
    </PageContainer>
  );
}
