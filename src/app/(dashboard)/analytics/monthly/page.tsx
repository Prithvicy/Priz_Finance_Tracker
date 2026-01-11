'use client';

// ============================================
// Monthly Analytics Page
// ============================================

import { useMemo, useCallback } from 'react';
import { format } from 'date-fns';
import { PageContainer, PageSection, Grid } from '@/components/layout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import { CategoryPieChart, MonthlyBarChart, IncomeExpenseChart } from '@/components/charts';
import { useExpenses, useIncome, useAnalytics, useSettings, useCategories } from '@/hooks';
import { getDateRange, getLastNMonths } from '@/lib/utils/dateUtils';
import { formatPercentage } from '@/lib/utils/formatters';
import { CATEGORIES } from '@/lib/utils/constants';

export default function MonthlyAnalyticsPage() {
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

  const dateRange = useMemo(() => getDateRange('month'), []);

  const analytics = useAnalytics({
    expenses,
    income,
    dateRange,
  });

  const isLoading = expensesLoading || incomeLoading;

  return (
    <PageContainer
      title="Monthly Analytics"
      description={format(new Date(), 'MMMM yyyy')}
    >
      {/* Summary Stats */}
      <PageSection>
        <Grid cols={4} gap="md">
          <Card className="p-4">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Income</p>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              {formatCurrency(analytics.totalIncome)}
            </p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Expenses</p>
            <p className="text-2xl font-bold text-red-600 dark:text-red-400">
              {formatCurrency(analytics.totalExpenses)}
            </p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Net</p>
            <p
              className={`text-2xl font-bold ${
                analytics.netAmount >= 0
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-red-600 dark:text-red-400'
              }`}
            >
              {analytics.netAmount >= 0 ? '+' : ''}
              {formatCurrency(analytics.netAmount)}
            </p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Savings Rate</p>
            <p
              className={`text-2xl font-bold ${
                analytics.savingsRate >= 0
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-red-600 dark:text-red-400'
              }`}
            >
              {formatPercentage(Math.abs(analytics.savingsRate))}
            </p>
          </Card>
        </Grid>
      </PageSection>

      {/* Charts */}
      <PageSection title="Spending by Category">
        <Grid cols={2} gap="lg">
          <CategoryPieChart
            data={analytics.categoryBreakdown}
            totalAmount={analytics.totalExpenses}
            isLoading={isLoading}
          />
          <Card>
            <CardHeader>
              <CardTitle>Category Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analytics.categoryBreakdown.map((cat) => {
                  const config = getCategoryInfo(cat.category as string);
                  return (
                    <div key={cat.category} className="flex items-center gap-3">
                      <div
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: config.color }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {config.name}
                          </span>
                          <span className="text-sm text-gray-500">
                            {formatCurrency(cat.amount)}
                          </span>
                        </div>
                        <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${cat.percentage}%`,
                              backgroundColor: config.color,
                            }}
                          />
                        </div>
                      </div>
                      <span className="text-xs text-gray-500 w-12 text-right">
                        {formatPercentage(cat.percentage, 0)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </Grid>
      </PageSection>

      <PageSection title="Income vs Expenses Trend">
        <IncomeExpenseChart data={analytics.incomeVsExpenses} isLoading={isLoading} />
      </PageSection>

      <PageSection title="6-Month History">
        <MonthlyBarChart data={analytics.monthlyTotals} isLoading={isLoading} />
      </PageSection>
    </PageContainer>
  );
}
