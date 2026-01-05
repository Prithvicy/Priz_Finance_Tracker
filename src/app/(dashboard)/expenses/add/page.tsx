'use client';

// ============================================
// Add Expense Page
// ============================================

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { PageContainer } from '@/components/layout';
import { Card, CardContent, Button, Input, CurrencyInput, Select, DatePicker } from '@/components/ui';
import { useExpenses, useToast, useSettings } from '@/hooks';
import { expenseFormSchema, ExpenseFormSchema } from '@/lib/utils/validators';
import { CATEGORIES } from '@/lib/utils/constants';
import { ExpenseCategory } from '@/types';
import { formatDateForInput } from '@/lib/utils/formatters';

export default function AddExpensePage() {
  const router = useRouter();
  const { addExpense } = useExpenses();
  const toast = useToast();
  const { currencySymbol } = useSettings();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<ExpenseFormSchema>({
    resolver: zodResolver(expenseFormSchema),
    defaultValues: {
      amount: '',
      category: undefined,
      description: '',
      date: formatDateForInput(new Date()),
      isRecurring: false,
    },
  });

  const categoryOptions = Object.entries(CATEGORIES).map(([value, config]) => ({
    value,
    label: config.name,
  }));

  const onSubmit = async (data: ExpenseFormSchema) => {
    setIsSubmitting(true);
    try {
      await addExpense({
        amount: parseFloat(data.amount) * 100, // Convert to cents
        category: data.category as ExpenseCategory,
        description: data.description,
        date: new Date(data.date),
        isRecurring: data.isRecurring,
      });
      toast.success('Expense added successfully');
      router.push('/expenses');
    } catch (error) {
      toast.error('Failed to add expense');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageContainer title="Add Expense" description="Record a new expense">
      <Card className="max-w-lg mx-auto">
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Amount */}
            <CurrencyInput
              label="Amount"
              placeholder="0.00"
              currency={currencySymbol}
              error={errors.amount?.message}
              {...register('amount')}
            />

            {/* Category */}
            <Select
              label="Category"
              options={categoryOptions}
              placeholder="Select a category"
              error={errors.category?.message}
              {...register('category')}
            />

            {/* Date */}
            <Controller
              name="date"
              control={control}
              render={({ field }) => (
                <DatePicker
                  label="Date"
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  error={errors.date?.message}
                  maxDate={new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)}
                />
              )}
            />

            {/* Description */}
            <Input
              label="Description (Optional)"
              placeholder="What was this expense for?"
              error={errors.description?.message}
              {...register('description')}
            />

            {/* Recurring Toggle */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="isRecurring"
                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                {...register('isRecurring')}
              />
              <label
                htmlFor="isRecurring"
                className="text-sm text-gray-700 dark:text-gray-300"
              >
                This is a recurring expense
              </label>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="secondary"
                onClick={() => router.back()}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                isLoading={isSubmitting}
                className="flex-1"
              >
                Add Expense
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
