'use client';

// ============================================
// Income Page
// ============================================

import Link from 'next/link';
import { Plus } from 'lucide-react';
import { PageContainer } from '@/components/layout';
import { Button, Card, CardContent } from '@/components/ui';
import { IncomeList } from '@/components/features/income';
import { useIncome, useToast, useSettings } from '@/hooks';

export default function IncomePage() {
  const { income, isLoading, deleteIncome, totalAmount } = useIncome();
  const toast = useToast();
  const { formatCurrency } = useSettings();

  const handleDelete = async (id: string) => {
    try {
      await deleteIncome(id);
      toast.success('Income deleted');
    } catch (error) {
      toast.error('Failed to delete income');
    }
  };

  return (
    <PageContainer
      title="Income"
      description="Track your earnings and payments"
      action={
        <Link href="/income/add">
          <Button leftIcon={<Plus className="h-4 w-4" />}>Add Income</Button>
        </Link>
      }
    >
      {/* Summary Card */}
      <Card className="mb-6">
        <CardContent className="flex items-center justify-between py-4">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Total Income</p>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              {formatCurrency(totalAmount)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500 dark:text-gray-400">Entries</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {income.length}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Income List */}
      <IncomeList
        income={income}
        isLoading={isLoading}
        onDelete={handleDelete}
      />
    </PageContainer>
  );
}
