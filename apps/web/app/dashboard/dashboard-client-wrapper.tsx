'use client';

import { MerchantProvider } from './merchant-context';
import { DashboardSidebar } from '@/components/dashboard/sidebar';
import { ReactNode } from 'react';
import { UserMenu } from '@/components/dashboard/user-menu';

interface DashboardClientWrapperProps {
  children: ReactNode;
  merchant: any;
  user: any;
}

export function DashboardClientWrapper({ children, merchant, user }: DashboardClientWrapperProps) {
  return (
    <MerchantProvider merchant={merchant} user={user}>
      <div className="flex h-screen bg-gray-50">
        {/* Sidebar */}
        <DashboardSidebar merchant={merchant} />

        {/* Main content area - takes remaining width */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-6 shrink-0">
            <div className="lg:hidden flex items-center gap-2">
              <div className="w-8 h-8 bg-linear-to-br from-blue-600 to-indigo-600 rounded-lg" />
              <span className="font-bold text-lg text-gray-900">WirePayments</span>
            </div>
            <div className="ml-auto">
              <UserMenu user={user.email ? { email: user.email, user_metadata: user.user_metadata } : { email: user.id, user_metadata: user.user_metadata }} />
            </div>
          </header>

          {/* Page content - scrollable */}
          <main className="flex-1 overflow-auto p-6">
            {children}
          </main>
        </div>
      </div>
    </MerchantProvider>
  );
}
