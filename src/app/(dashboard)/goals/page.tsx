'use client';

// ============================================
// Goals Page - Financial Goals & Progress Tracking
// ============================================

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Target,
  Settings2,
  TrendingUp,
  TrendingDown,
  Lightbulb,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  RotateCcw,
  Save,
  PiggyBank,
  Home,
  ShoppingBag,
  CreditCard,
  Shield,
} from 'lucide-react';
import { PageContainer, PageSection, Grid } from '@/components/layout';
import { Card, CardContent, Button, Input } from '@/components/ui';
import { GoalsRadarChart, HealthScoreRing, RadialProgress } from '@/components/charts';
import { useGoals, useExpenses, useIncome, useToast, useSettings } from '@/hooks';
import { getDateRange } from '@/lib/utils/dateUtils';
import { GOAL_CATEGORIES } from '@/lib/utils/constants';
import { GoalCategory, GoalAllocation, GoalInsight } from '@/types';
import { cn } from '@/lib/cn';

// ============================================
// Icon Map
// ============================================

const iconMap: Record<string, React.ElementType> = {
  PiggyBank,
  TrendingUp,
  Home,
  ShoppingBag,
  CreditCard,
  Shield,
};

// ============================================
// Goal Allocation Slider Component
// ============================================

interface AllocationSliderProps {
  allocation: GoalAllocation;
  onChange: (value: number) => void;
  disabled?: boolean;
}

const AllocationSlider = ({ allocation, onChange, disabled }: AllocationSliderProps) => {
  const Icon = iconMap[allocation.icon] || Target;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="glass-card rounded-xl p-4"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div
            className="p-2 rounded-lg"
            style={{ backgroundColor: `${allocation.color}20` }}
          >
            <Icon className="h-4 w-4" style={{ color: allocation.color }} />
          </div>
          <div>
            <p className="font-medium text-gray-900 dark:text-white text-sm">
              {allocation.name}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {allocation.description}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span
            className="text-lg font-bold"
            style={{ color: allocation.color }}
          >
            {allocation.targetPercentage}%
          </span>
        </div>
      </div>

      {/* Slider */}
      <div className="relative">
        <input
          type="range"
          min="0"
          max="100"
          value={allocation.targetPercentage}
          onChange={(e) => onChange(parseInt(e.target.value))}
          disabled={disabled}
          className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer
                     [&::-webkit-slider-thumb]:appearance-none
                     [&::-webkit-slider-thumb]:w-5
                     [&::-webkit-slider-thumb]:h-5
                     [&::-webkit-slider-thumb]:rounded-full
                     [&::-webkit-slider-thumb]:cursor-pointer
                     [&::-webkit-slider-thumb]:shadow-lg
                     [&::-webkit-slider-thumb]:transition-transform
                     [&::-webkit-slider-thumb]:hover:scale-110"
          style={{
            // @ts-expect-error CSS custom property
            '--thumb-color': allocation.color,
          }}
        />
        {/* Progress fill */}
        <div
          className="absolute top-0 left-0 h-2 rounded-lg pointer-events-none"
          style={{
            width: `${allocation.targetPercentage}%`,
            backgroundColor: allocation.color,
            opacity: 0.5,
          }}
        />
      </div>
    </motion.div>
  );
};

// ============================================
// Insight Card Component
// ============================================

const InsightCard = ({ insight }: { insight: GoalInsight }) => {
  const icons = {
    warning: AlertTriangle,
    success: CheckCircle2,
    tip: Lightbulb,
  };
  const colors = {
    warning: 'text-amber-500 bg-amber-500/10',
    success: 'text-emerald-500 bg-emerald-500/10',
    tip: 'text-blue-500 bg-blue-500/10',
  };

  const Icon = icons[insight.type];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-start gap-3 p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50"
    >
      <div className={cn('p-2 rounded-lg', colors[insight.type])}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1">
        <p className="text-sm text-gray-700 dark:text-gray-300">{insight.message}</p>
        {insight.action && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {insight.action}
          </p>
        )}
      </div>
    </motion.div>
  );
};

// ============================================
// Progress Card Component
// ============================================

interface ProgressCardProps {
  category: GoalCategory;
  targetPercentage: number;
  actualPercentage: number;
  targetAmount: number;
  actualAmount: number;
  status: 'on_track' | 'behind' | 'ahead';
}

const ProgressCard = ({
  category,
  targetPercentage,
  actualPercentage,
  targetAmount,
  actualAmount,
  status,
}: ProgressCardProps) => {
  const { formatCurrency } = useSettings();
  const config = GOAL_CATEGORIES[category];
  const Icon = iconMap[config.icon] || Target;

  const statusConfig = {
    on_track: { label: 'On Track', color: 'text-emerald-500 bg-emerald-500/10' },
    behind: { label: 'Behind', color: 'text-amber-500 bg-amber-500/10' },
    ahead: { label: 'Ahead', color: 'text-blue-500 bg-blue-500/10' },
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="glass-card rounded-xl p-4 h-full"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className="p-2 rounded-xl"
            style={{ backgroundColor: `${config.color}20` }}
          >
            <Icon className="h-5 w-5" style={{ color: config.color }} />
          </div>
          <div>
            <p className="font-semibold text-gray-900 dark:text-white">{config.name}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Target: {targetPercentage}%
            </p>
          </div>
        </div>
        <span className={cn('text-xs font-medium px-2 py-1 rounded-full', statusConfig[status].color)}>
          {statusConfig[status].label}
        </span>
      </div>

      {/* Progress ring */}
      <div className="flex justify-center mb-4">
        <RadialProgress
          percentage={Math.min((actualPercentage / targetPercentage) * 100, 150)}
          size={100}
          strokeWidth={8}
          color={config.color}
          showPercentage={false}
        />
      </div>

      {/* Stats */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-500 dark:text-gray-400">Actual</span>
          <span className="font-medium text-gray-900 dark:text-white">
            {actualPercentage.toFixed(1)}% ({formatCurrency(actualAmount)})
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500 dark:text-gray-400">Target</span>
          <span className="font-medium text-gray-500">
            {targetPercentage}% ({formatCurrency(targetAmount)})
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500 dark:text-gray-400">Difference</span>
          <span
            className={cn(
              'font-medium',
              actualAmount >= targetAmount ? 'text-emerald-500' : 'text-amber-500'
            )}
          >
            {actualAmount >= targetAmount ? '+' : ''}
            {formatCurrency(actualAmount - targetAmount)}
          </span>
        </div>
      </div>
    </motion.div>
  );
};

// ============================================
// Main Page Component
// ============================================

export default function GoalsPage() {
  const [showSettings, setShowSettings] = useState(false);
  const [editedAllocations, setEditedAllocations] = useState<GoalAllocation[] | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const toast = useToast();
  const { formatCurrency } = useSettings();

  // Get current month data
  const dateRange = useMemo(() => getDateRange('month'), []);
  const { expenses, isLoading: expensesLoading } = useExpenses({ dateRange });
  const { income, isLoading: incomeLoading } = useIncome({ dateRange });

  const { goals, analytics, isLoading: goalsLoading, saveGoals, resetGoals } = useGoals({
    expenses,
    income,
  });

  const isLoading = expensesLoading || incomeLoading || goalsLoading;

  // Calculate total percentage
  const totalPercentage = useMemo(() => {
    const allocations = editedAllocations || goals?.allocations || [];
    return allocations.reduce((sum, a) => sum + a.targetPercentage, 0);
  }, [editedAllocations, goals?.allocations]);

  const isValidTotal = totalPercentage === 100;

  // Handle allocation change
  const handleAllocationChange = (category: GoalCategory, value: number) => {
    const current = editedAllocations || goals?.allocations || [];
    setEditedAllocations(
      current.map((a) => (a.category === category ? { ...a, targetPercentage: value } : a))
    );
  };

  // Save changes
  const handleSave = async () => {
    if (!editedAllocations || !goals) return;

    if (!isValidTotal) {
      toast.error('Total allocation must equal 100%');
      return;
    }

    setIsSaving(true);
    try {
      await saveGoals(editedAllocations, goals.monthlyIncomeTarget);
      toast.success('Goals saved successfully');
      setEditedAllocations(null);
      setShowSettings(false);
    } catch {
      toast.error('Failed to save goals');
    } finally {
      setIsSaving(false);
    }
  };

  // Reset to defaults
  const handleReset = async () => {
    try {
      await resetGoals();
      setEditedAllocations(null);
      toast.success('Goals reset to defaults');
    } catch {
      toast.error('Failed to reset goals');
    }
  };

  const currentAllocations = editedAllocations || goals?.allocations || [];

  return (
    <PageContainer
      title="Financial Goals"
      description="Track your progress towards financial freedom"
      action={
        <Button
          variant={showSettings ? 'primary' : 'outline'}
          leftIcon={<Settings2 className="h-4 w-4" />}
          onClick={() => setShowSettings(!showSettings)}
        >
          {showSettings ? 'View Progress' : 'Edit Goals'}
        </Button>
      }
    >
      <AnimatePresence mode="wait">
        {showSettings ? (
          // Settings View
          <motion.div
            key="settings"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <PageSection title="Set Your Allocation Targets">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                Adjust how you want to allocate your income. Total must equal 100%.
              </p>

              {/* Total indicator */}
              <div className={cn(
                'mb-6 p-4 rounded-xl flex items-center justify-between',
                isValidTotal
                  ? 'bg-emerald-500/10 border border-emerald-500/20'
                  : 'bg-amber-500/10 border border-amber-500/20'
              )}>
                <div className="flex items-center gap-2">
                  {isValidTotal ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  ) : (
                    <AlertTriangle className="h-5 w-5 text-amber-500" />
                  )}
                  <span className={cn(
                    'font-medium',
                    isValidTotal ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'
                  )}>
                    Total: {totalPercentage}%
                  </span>
                </div>
                {!isValidTotal && (
                  <span className="text-sm text-amber-600 dark:text-amber-400">
                    {totalPercentage > 100 ? `${totalPercentage - 100}% over` : `${100 - totalPercentage}% remaining`}
                  </span>
                )}
              </div>

              {/* Allocation sliders */}
              <div className="space-y-4 mb-6">
                {currentAllocations.map((allocation) => (
                  <AllocationSlider
                    key={allocation.category}
                    allocation={allocation}
                    onChange={(value) => handleAllocationChange(allocation.category, value)}
                  />
                ))}
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <Button
                  variant="secondary"
                  leftIcon={<RotateCcw className="h-4 w-4" />}
                  onClick={handleReset}
                >
                  Reset to Defaults
                </Button>
                <Button
                  variant="primary"
                  leftIcon={<Save className="h-4 w-4" />}
                  onClick={handleSave}
                  isLoading={isSaving}
                  disabled={!isValidTotal || !editedAllocations}
                >
                  Save Changes
                </Button>
              </div>
            </PageSection>
          </motion.div>
        ) : (
          // Progress View
          <motion.div
            key="progress"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
          >
            {/* Health Score & Overview */}
            <PageSection>
              <Grid cols={2} gap="lg">
                {/* Health Score */}
                <Card glass className="p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20">
                      <Sparkles className="h-5 w-5 text-emerald-500" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Financial Health Score
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Based on your goal progress
                      </p>
                    </div>
                  </div>
                  <div className="flex justify-center">
                    <HealthScoreRing score={analytics?.overallScore || 0} size={200} />
                  </div>
                </Card>

                {/* Radar Chart */}
                <GoalsRadarChart
                  progress={analytics?.progress || []}
                  isLoading={isLoading}
                />
              </Grid>
            </PageSection>

            {/* Individual Progress Cards */}
            <PageSection title="Category Progress">
              <Grid cols={3} gap="md">
                {analytics?.progress.map((p) => (
                  <ProgressCard
                    key={p.category}
                    category={p.category}
                    targetPercentage={p.targetPercentage}
                    actualPercentage={p.actualPercentage}
                    targetAmount={p.targetAmount}
                    actualAmount={p.actualAmount}
                    status={p.status}
                  />
                ))}
              </Grid>
            </PageSection>

            {/* Insights */}
            {analytics?.insights && analytics.insights.length > 0 && (
              <PageSection title="Smart Insights">
                <Card glass className="p-6">
                  <div className="space-y-3">
                    {analytics.insights.map((insight, i) => (
                      <InsightCard key={i} insight={insight} />
                    ))}
                  </div>
                </Card>
              </PageSection>
            )}

            {/* Quick Stats */}
            <PageSection title="This Month Summary">
              <Grid cols={3} gap="md">
                <Card glass className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-emerald-500/10">
                      <TrendingUp className="h-5 w-5 text-emerald-500" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Total Income</p>
                      <p className="text-xl font-bold text-gray-900 dark:text-white">
                        {formatCurrency(analytics?.totalIncome || 0)}
                      </p>
                    </div>
                  </div>
                </Card>
                <Card glass className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-red-500/10">
                      <TrendingDown className="h-5 w-5 text-red-500" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Total Spent</p>
                      <p className="text-xl font-bold text-gray-900 dark:text-white">
                        {formatCurrency(analytics?.totalAllocated || 0)}
                      </p>
                    </div>
                  </div>
                </Card>
                <Card glass className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-indigo-500/10">
                      <Target className="h-5 w-5 text-indigo-500" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Goals On Track</p>
                      <p className="text-xl font-bold text-gray-900 dark:text-white">
                        {analytics?.progress.filter((p) => p.status !== 'behind').length || 0}/{analytics?.progress.length || 0}
                      </p>
                    </div>
                  </div>
                </Card>
              </Grid>
            </PageSection>
          </motion.div>
        )}
      </AnimatePresence>
    </PageContainer>
  );
}
