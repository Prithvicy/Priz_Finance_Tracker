'use client';

// ============================================
// Button Component
// ============================================

import { forwardRef, ButtonHTMLAttributes } from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/cn';

// ============================================
// Types
// ============================================

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg' | 'icon';

interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onAnimationStart' | 'onDrag' | 'onDragEnd' | 'onDragStart'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

// ============================================
// Styles
// ============================================

const baseStyles = `
  inline-flex items-center justify-center font-medium rounded-lg
  transition-colors duration-200 focus:outline-none focus:ring-2
  focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none
`;

const variantStyles: Record<ButtonVariant, string> = {
  primary: `
    bg-indigo-600 text-white hover:bg-indigo-700
    focus:ring-indigo-500 active:bg-indigo-800
  `,
  secondary: `
    bg-gray-100 text-gray-900 hover:bg-gray-200
    focus:ring-gray-500 active:bg-gray-300
    dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700
  `,
  outline: `
    border border-gray-300 bg-transparent text-gray-700 hover:bg-gray-50
    focus:ring-gray-500 active:bg-gray-100
    dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800
  `,
  ghost: `
    bg-transparent text-gray-600 hover:bg-gray-100 hover:text-gray-900
    focus:ring-gray-500 active:bg-gray-200
    dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100
  `,
  danger: `
    bg-red-600 text-white hover:bg-red-700
    focus:ring-red-500 active:bg-red-800
  `,
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-sm gap-1.5',
  md: 'h-10 px-4 text-sm gap-2',
  lg: 'h-12 px-6 text-base gap-2',
  icon: 'h-10 w-10 p-0',
};

// ============================================
// Component
// ============================================

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    return (
      <motion.button
        ref={ref}
        className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)}
        disabled={disabled || isLoading}
        whileTap={{ scale: 0.98 }}
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.1 }}
        {...(props as HTMLMotionProps<'button'>)}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          leftIcon
        )}
        {children}
        {!isLoading && rightIcon}
      </motion.button>
    );
  }
);

Button.displayName = 'Button';

export { Button };
export type { ButtonProps, ButtonVariant, ButtonSize };
