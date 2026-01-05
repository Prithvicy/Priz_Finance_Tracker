'use client';

// ============================================
// Expenses Page
// ============================================

import Link from 'next/link';
import { Plus } from 'lucide-react';
import { PageContainer } from '@/components/layout';
import { Button, Card, CardContent } from '@/components/ui';
import { ExpenseList } from '@/components/features/expenses';
import { useExpenses, useToast, useSettings } from '@/hooks';

export default function ExpensesPage() {
  const { expenses, isLoading, deleteExpense, totalAmount } = useExpenses();
  const toast = useToast();
  const { formatCurrency } = useSettings();

  const handleDelete = async (id: string) => {
    try {
      await deleteExpense(id);
      toast.success('Expense deleted');
    } catch (error) {
      toast.error('Failed to delete expense');
    }
  };

  return (
    <PageContainer
      title="Expenses"
      description="Track and manage your spending"
      action={
        <Link href="/expenses/add">
          <Button leftIcon={<Plus className="h-4 w-4" />}>Add Expense</Button>
        </Link>
      }
    >
      {/* Summary Card */}
      <Card className="mb-6">
        <CardContent className="flex items-center justify-between py-4">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Total Expenses</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {formatCurrency(totalAmount)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500 dark:text-gray-400">Transactions</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {expenses.length}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Expense List */}
      <ExpenseList
        expenses={expenses}
        isLoading={isLoading}
        onDelete={handleDelete}
      />
    </PageContainer>
  );
}
