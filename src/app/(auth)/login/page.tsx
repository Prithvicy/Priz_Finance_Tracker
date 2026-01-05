'use client';

// ============================================
// Login / Register Page
// ============================================

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Lock, Mail, User } from 'lucide-react';
import { Card, CardContent, Button, Input } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';
import { loginSchema, LoginSchema, registerSchema, RegisterSchema } from '@/lib/utils/validators';
import { isDevMode } from '@/services/firebase';

type AuthMode = 'login' | 'register';

export default function LoginPage() {
  const router = useRouter();
  const { login, register: registerUser, isAuthenticated, loading: authLoading } = useAuth();
  const [mode, setMode] = useState<AuthMode>('login');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Login form
  const loginForm = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
  });

  // Register form
  const registerForm = useForm<RegisterSchema>({
    resolver: zodResolver(registerSchema),
  });

  // Redirect if already authenticated or dev mode
  useEffect(() => {
    if (authLoading) return;
    if (isAuthenticated || isDevMode) {
      router.replace('/dashboard');
    }
  }, [isAuthenticated, authLoading, router]);

  const onLogin = async (data: LoginSchema) => {
    setIsSubmitting(true);
    setError(null);

    try {
      await login(data.email, data.password);
      router.push('/dashboard');
    } catch (err) {
      setError('Invalid email or password. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const onRegister = async (data: RegisterSchema) => {
    setIsSubmitting(true);
    setError(null);

    try {
      await registerUser(data.email, data.password, data.displayName);
      router.push('/dashboard');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Registration failed';
      if (message.includes('email-already-in-use')) {
        setError('This email is already registered. Please sign in instead.');
      } else if (message.includes('weak-password')) {
        setError('Password is too weak. Please use a stronger password.');
      } else {
        setError('Registration failed. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const switchMode = () => {
    setMode(mode === 'login' ? 'register' : 'login');
    setError(null);
    loginForm.reset();
    registerForm.reset();
  };

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center animate-pulse">
            <span className="text-white font-bold text-lg">PF</span>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex h-16 w-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 items-center justify-center mb-4 shadow-lg shadow-indigo-500/30">
            <span className="text-white font-bold text-2xl">PF</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Priz Finance Tracker
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            {mode === 'login' ? 'Sign in to manage your finances' : 'Create your account'}
          </p>
        </div>

        <Card className="shadow-xl">
          <CardContent className="pt-6">
            <AnimatePresence mode="wait">
              {mode === 'login' ? (
                <motion.form
                  key="login"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.2 }}
                  onSubmit={loginForm.handleSubmit(onLogin)}
                  className="space-y-6"
                >
                  {/* Error Message */}
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
                    >
                      <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                    </motion.div>
                  )}

                  {/* Email */}
                  <Input
                    label="Email"
                    type="email"
                    placeholder="you@example.com"
                    leftIcon={<Mail className="h-4 w-4" />}
                    error={loginForm.formState.errors.email?.message}
                    {...loginForm.register('email')}
                  />

                  {/* Password */}
                  <div className="relative">
                    <Input
                      label="Password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      leftIcon={<Lock className="h-4 w-4" />}
                      rightIcon={
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      }
                      error={loginForm.formState.errors.password?.message}
                      {...loginForm.register('password')}
                    />
                  </div>

                  {/* Submit */}
                  <Button
                    type="submit"
                    variant="primary"
                    className="w-full"
                    isLoading={isSubmitting}
                  >
                    Sign In
                  </Button>
                </motion.form>
              ) : (
                <motion.form
                  key="register"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  onSubmit={registerForm.handleSubmit(onRegister)}
                  className="space-y-5"
                >
                  {/* Error Message */}
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
                    >
                      <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                    </motion.div>
                  )}

                  {/* Display Name */}
                  <Input
                    label="Name"
                    type="text"
                    placeholder="John Doe"
                    leftIcon={<User className="h-4 w-4" />}
                    error={registerForm.formState.errors.displayName?.message}
                    {...registerForm.register('displayName')}
                  />

                  {/* Email */}
                  <Input
                    label="Email"
                    type="email"
                    placeholder="you@example.com"
                    leftIcon={<Mail className="h-4 w-4" />}
                    error={registerForm.formState.errors.email?.message}
                    {...registerForm.register('email')}
                  />

                  {/* Password */}
                  <Input
                    label="Password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    leftIcon={<Lock className="h-4 w-4" />}
                    rightIcon={
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    }
                    error={registerForm.formState.errors.password?.message}
                    {...registerForm.register('password')}
                  />

                  {/* Confirm Password */}
                  <Input
                    label="Confirm Password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    leftIcon={<Lock className="h-4 w-4" />}
                    error={registerForm.formState.errors.confirmPassword?.message}
                    {...registerForm.register('confirmPassword')}
                  />

                  {/* Submit */}
                  <Button
                    type="submit"
                    variant="primary"
                    className="w-full"
                    isLoading={isSubmitting}
                  >
                    Create Account
                  </Button>
                </motion.form>
              )}
            </AnimatePresence>

            {/* Switch Mode */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
                <button
                  type="button"
                  onClick={switchMode}
                  className="text-indigo-600 dark:text-indigo-400 font-medium hover:underline"
                >
                  {mode === 'login' ? 'Sign up' : 'Sign in'}
                </button>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center text-xs text-gray-400 dark:text-gray-600 mt-8">
          Enterprise-grade personal finance tracking
        </p>
      </motion.div>
    </div>
  );
}
