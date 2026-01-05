'use client';

// ============================================
// Dashboard Layout with Sidebar
// ============================================

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Header, Sidebar, MobileNav } from '@/components/layout';
import { SplashScreen } from '@/components/ui';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { loading, isAuthenticated } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [loading, isAuthenticated, router]);

  if (loading) {
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

  // Show nothing while redirecting to login
  if (!isAuthenticated) {
    return null;
  }

  return (
    <SplashScreen>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        {/* Sidebar */}
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* Main Content */}
        <div className="lg:pl-64">
          {/* Header */}
          <Header
            onMenuClick={() => setSidebarOpen(true)}
            showMenuButton={true}
          />

          {/* Page Content */}
          <main className="min-h-[calc(100vh-4rem)]">{children}</main>
        </div>

        {/* Mobile Bottom Navigation */}
        <MobileNav />
      </div>
    </SplashScreen>
  );
}
