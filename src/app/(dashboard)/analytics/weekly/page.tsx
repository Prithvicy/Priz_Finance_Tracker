'use client';

// ============================================
// Weekly Analytics Page
// ============================================

import { useMemo } from 'react';
import { format, startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns';
import { PageContainer, PageSection, Grid } from '@/components/layout';
import { Card, CardHeader, CardTitle, CardContent, Badge } from '@/components/ui';
import { WeeklyTrendLine } from '@/components/charts';
import { useExpenses, useAnalytics, useSettings } from '@/hooks';
import { getDateRange } from '@/lib/utils/dateUtils';
import { formatDateSmart } from '@/lib/utils/formatters';
import { CATEGORIES } from '@/lib/utils/constants';
import { cn } from '@/lib/cn';

export default function WeeklyAnalyticsPage() {
  const { expenses, isLoading } = useExpenses();
  const { formatCurrency } = useSettings();

  const dateRange = useMemo(() => {
    const now = new Date();
    return {
      start: startOfWeek(now, { weekStartsOn: 0 }),
      end: endOfWeek(now, { weekStartsOn: 0 }),
    };
  }, []);

  const analytics = useAnalytics({
    expenses,
    income: [],
    dateRange,
  });

  // Get expenses grouped by day
  const dailyExpenses = useMemo(() => {
    const days = eachDayOfInterval(dateRange);
    return days.map((day) => {
      const dayExpenses = expenses.filter((e) => {
        const expDate = e.date.toDate();
        return (
          expDate.getFullYear() === day.getFullYear() &&
          expDate.getMonth() === day.getMonth() &&
          expDate.getDate() === day.getDate()
        );
      });
      const total = dayExpenses.reduce((sum, e) => sum + e.amount, 0);
      return { day, expenses: dayExpenses, total };
    });
  }, [expenses, dateRange]);

  return (
    <PageContainer
      title="Weekly Analytics"
      description={`${format(dateRange.start, 'MMM d')} - ${format(dateRange.end, 'MMM d, yyyy')}`}
    >
      {/* Summary Stats */}
      <PageSection>
        <Grid cols={4} gap="md">
          <Card className="p-4">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Total Spent</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {formatCurrency(analytics.totalExpenses)}
            </p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Daily Average</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {formatCurrency(analytics.averageDailySpending)}
            </p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Transactions</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {analytics.expenseCount}
            </p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Top Category</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {analytics.topCategory
                ? CATEGORIES[analytics.topCategory.category].name
                : '--'}
            </p>
          </Card>
        </Grid>
      </PageSection>

      {/* Weekly Trend */}
      <PageSection title="Spending Trend">
        <WeeklyTrendLine data={analytics.weeklyTrend} isLoading={isLoading} />
      </PageSection>

      {/* Daily Breakdown */}
      <PageSection title="Daily Breakdown">
        <div className="space-y-4">
          {dailyExpenses.map(({ day, expenses: dayExp, total }) => (
            <Card key={day.toISOString()} className="overflow-hidden">
              <CardHeader className="bg-gray-50 dark:bg-gray-800/50 py-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                      <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
                        {format(day, 'd')}
                      </span>
                    </div>
                    <div>
                      <CardTitle className="text-base">{format(day, 'EEEE')}</CardTitle>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {format(day, 'MMMM d, yyyy')}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      {formatCurrency(total)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {dayExp.length} transaction{dayExp.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
              </CardHeader>
              {dayExp.length > 0 && (
                <CardContent className="divide-y divide-gray-100 dark:divide-gray-800">
                  {dayExp.map((expense) => {
                    const category = CATEGORIES[expense.category];
                    return (
                      <div
                        key={expense.id}
                        className="flex items-center justify-between py-3"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="h-8 w-8 rounded-lg flex items-center justify-center"
                            style={{ backgroundColor: `${category.color}15` }}
                          >
                            <span style={{ color: category.color }}>
                              {category.name.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {category.name}
                            </p>
                            {expense.description && (
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {expense.description}
                              </p>
                            )}
                          </div>
                        </div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {formatCurrency(expense.amount)}
                        </p>
                      </div>
                    );
                  })}
                </CardContent>
              )}
              {dayExp.length === 0 && (
                <CardContent>
                  <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-4">
                    No expenses
                  </p>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      </PageSection>
    </PageContainer>
  );
}
