'use client';

// ============================================
// Dashboard Page
// ============================================

import { useMemo } from 'react';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { PageContainer, PageSection, Grid } from '@/components/layout';
import { Button } from '@/components/ui';
import { QuickStats, RecentActivity } from '@/components/features/dashboard';
import { QuickAdd } from '@/components/features/expenses';
import { CategoryPieChart, MonthlyBarChart } from '@/components/charts';
import { useExpenses, useIncome, useAnalytics, useToast, useSettings } from '@/hooks';
import { getDateRange, getDaysUntilPayday } from '@/lib/utils/dateUtils';
import { addDays, endOfMonth, addMonths } from 'date-fns';

export default function DashboardPage() {
  const { expenses, isLoading: expensesLoading, addExpense, deleteExpense } = useExpenses();
  const { income, isLoading: incomeLoading } = useIncome();
  const toast = useToast();

  // Date range for current month
  const dateRange = useMemo(() => getDateRange('month'), []);

  // Analytics
  const analytics = useAnalytics({
    expenses,
    income,
    dateRange,
  });

  const { settings } = useSettings();

  // Calculate days until next payday based on pay frequency setting
  const daysUntilPayday = useMemo(() => {
    const today = new Date();
    const payFrequency = settings.payFrequency;

    // For monthly pay (common for INR/salaried employees)
    if (payFrequency === 'monthly') {
      // Assume payday is last day of month or 1st of next month
      const endOfCurrentMonth = endOfMonth(today);
      const daysToEndOfMonth = getDaysUntilPayday(endOfCurrentMonth);

      // If we're past the 28th, show days to end of next month
      if (daysToEndOfMonth <= 2) {
        return getDaysUntilPayday(endOfMonth(addMonths(today, 1)));
      }
      return daysToEndOfMonth;
    }

    // For weekly/bi-weekly, use last salary income to calculate
    const salaryIncome = income
      .filter((i) => i.type === 'salary')
      .sort((a, b) => b.date.toMillis() - a.date.toMillis());

    if (salaryIncome.length > 0) {
      const lastPayday = salaryIncome[0].date.toDate();
      const daysToAdd = payFrequency === 'weekly' ? 7 : 14;
      let nextPayday = addDays(lastPayday, daysToAdd);

      // If next payday is in the past, keep adding until it's in the future
      while (nextPayday < today) {
        nextPayday = addDays(nextPayday, daysToAdd);
      }

      return getDaysUntilPayday(nextPayday);
    }

    // No salary data yet - return undefined to show "--"
    return undefined;
  }, [income, settings.payFrequency]);

  const handleAddExpense = async (expense: Parameters<typeof addExpense>[0]) => {
    try {
      await addExpense(expense);
      toast.success('Expense added successfully');
    } catch (error) {
      toast.error('Failed to add expense');
    }
  };

  const handleDeleteExpense = async (id: string) => {
    try {
      await deleteExpense(id);
      toast.success('Expense deleted');
    } catch (error) {
      toast.error('Failed to delete expense');
    }
  };

  const isLoading = expensesLoading || incomeLoading;

  return (
    <PageContainer
      title="Dashboard"
      description="Your financial overview at a glance"
      action={
        <Link href="/expenses/add">
          <Button leftIcon={<Plus className="h-4 w-4" />}>Add Expense</Button>
        </Link>
      }
    >
      {/* Quick Stats */}
      <PageSection>
        <QuickStats
          totalIncome={analytics.totalIncome}
          totalExpenses={analytics.totalExpenses}
          netAmount={analytics.netAmount}
          savingsRate={analytics.savingsRate}
          momChange={analytics.momChange}
          daysUntilPayday={daysUntilPayday}
          isLoading={isLoading}
        />
      </PageSection>

      {/* Quick Add */}
      <PageSection title="Quick Add Expense">
        <QuickAdd onAdd={handleAddExpense} isLoading={expensesLoading} />
      </PageSection>

      {/* Charts */}
      <PageSection title="Spending Overview">
        <Grid cols={2} gap="lg">
          <CategoryPieChart
            data={analytics.categoryBreakdown}
            totalAmount={analytics.totalExpenses}
            isLoading={expensesLoading}
          />
          <MonthlyBarChart
            data={analytics.monthlyTotals}
            isLoading={expensesLoading}
          />
        </Grid>
      </PageSection>

      {/* Recent Activity */}
      <PageSection>
        <RecentActivity
          expenses={expenses}
          isLoading={expensesLoading}
          onDelete={handleDeleteExpense}
        />
      </PageSection>
    </PageContainer>
  );
}
