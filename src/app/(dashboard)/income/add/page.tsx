'use client';

// ============================================
// Add Income Page
// ============================================

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { PageContainer } from '@/components/layout';
import { Card, CardContent, Button, Input, CurrencyInput, Select, DatePicker } from '@/components/ui';
import { useIncome, useToast } from '@/hooks';
import { incomeFormSchema, IncomeFormSchema } from '@/lib/utils/validators';
import { INCOME_TYPES, DEFAULT_SALARY } from '@/lib/utils/constants';
import { IncomeType } from '@/types';
import { formatDateForInput } from '@/lib/utils/formatters';

export default function AddIncomePage() {
  const router = useRouter();
  const { addIncome } = useIncome();
  const toast = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors },
  } = useForm<IncomeFormSchema>({
    resolver: zodResolver(incomeFormSchema),
    defaultValues: {
      amount: '',
      type: 'salary',
      source: 'Primary Job',
      date: formatDateForInput(new Date()),
      isRegular: true,
      note: '',
    },
  });

  const incomeType = watch('type');

  const typeOptions = Object.entries(INCOME_TYPES).map(([value, config]) => ({
    value,
    label: config.name,
  }));

  // Quick fill for salary
  const handleQuickFillSalary = () => {
    setValue('amount', (DEFAULT_SALARY / 100).toFixed(2));
    setValue('type', 'salary');
    setValue('source', 'Primary Job');
    setValue('isRegular', true);
  };

  const onSubmit = async (data: IncomeFormSchema) => {
    setIsSubmitting(true);
    try {
      await addIncome({
        amount: parseFloat(data.amount) * 100, // Convert to cents
        type: data.type as IncomeType,
        source: data.source,
        date: new Date(data.date),
        isRegular: data.isRegular,
        note: data.note,
      });
      toast.success('Income added successfully');
      router.push('/income');
    } catch (error) {
      toast.error('Failed to add income');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageContainer title="Add Income" description="Record your earnings">
      <Card className="max-w-lg mx-auto">
        <CardContent>
          {/* Quick Actions */}
          <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
            <p className="text-sm font-medium text-green-800 dark:text-green-300 mb-3">
              Quick Add
            </p>
            <Button
              type="button"
              variant="secondary"
              onClick={handleQuickFillSalary}
              className="w-full"
            >
              Add Bi-weekly Salary ($2,448.00)
            </Button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Amount */}
            <CurrencyInput
              label="Amount"
              placeholder="0.00"
              error={errors.amount?.message}
              {...register('amount')}
            />

            {/* Type */}
            <Select
              label="Type"
              options={typeOptions}
              error={errors.type?.message}
              {...register('type')}
            />

            {/* Source */}
            <Input
              label="Source"
              placeholder="Where did this income come from?"
              error={errors.source?.message}
              {...register('source')}
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

            {/* Note */}
            <Input
              label="Note (Optional)"
              placeholder="Additional details"
              error={errors.note?.message}
              {...register('note')}
            />

            {/* Regular Toggle */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="isRegular"
                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                {...register('isRegular')}
              />
              <label
                htmlFor="isRegular"
                className="text-sm text-gray-700 dark:text-gray-300"
              >
                This is regular income (salary, recurring payment)
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
                Add Income
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
