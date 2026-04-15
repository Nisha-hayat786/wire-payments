'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, Receipt, Settings, BarChart3, LogOut, Zap, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { createClient } from '@/utils/supabase/client';
import { toast } from 'sonner';
import { MerchantProvider } from './merchant-context';

export default function DashboardClient({ 
  children, 
  user, 
  merchant 
}: { 
  children: React.ReactNode, 
  user: any, 
  merchant: any 
}) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success('Logged out successfully');
    router.push('/login');
    router.refresh();
  };

  const navGroups = [
    {
      label: 'Financials',
      items: [
        { title: 'Overview', href: '/dashboard', icon: LayoutDashboard },
        { title: 'Invoices', href: '/dashboard/invoices', icon: Receipt },
        { title: 'Payments', href: '/dashboard/payments', icon: BarChart3 },
        { title: 'Balances', href: '/dashboard/balances', icon: Activity },
        { title: 'Payouts', href: '/dashboard/payouts', icon: Zap },
        { title: 'Customers', href: '/dashboard/customers', icon: Activity },
      ]
    },
    {
      label: 'Developers',
      items: [
        { title: 'API Keys', href: '/dashboard/developers/api-keys', icon: Zap },
        { title: 'Webhooks', href: '/dashboard/developers/webhooks', icon: Activity },
        { title: 'API Logs', href: '/dashboard/developers/logs', icon: Activity },
      ]
    },
    {
      label: 'Management',
      items: [
        { title: 'Settings', href: '/dashboard/settings', icon: Settings },
      ]
    }
  ];

  return (
    <MerchantProvider user={user} merchant={merchant}>
      <div className="flex h-screen bg-[#f6f9fc] font-sans antialiased selection:bg-stripe-purple/10 selection:text-stripe-purple">
        {/* Sidebar */}
        <aside className="w-72 border-r border-soft-blue bg-white hidden md:flex flex-col">
          <div className="p-8 flex-1 overflow-y-auto custom-scrollbar">
            <div className="flex items-center gap-3 mb-12">
              <img src="/logo.png" alt="WirePayments" className="h-8 w-auto" />
              <span className="text-xl font-bold tracking-tight text-deep-navy uppercase">WirePayments</span>
            </div>

            <nav className="space-y-8">
              {navGroups.map((group) => (
                <div key={group.label} className="space-y-3">
                  <h3 className="px-4 text-[10px] font-extrabold uppercase tracking-[0.2em] text-slate opacity-60">
                    {group.label}
                  </h3>
                  <div className="nav-items-container space-y-1">
                    {group.items.map((item) => (
                      <Link key={item.href} href={item.href}>
                        <span className={cn(
                          "flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                          pathname === item.href 
                            ? "bg-stripe-purple/10 text-stripe-purple" 
                            : "text-slate hover:bg-muted/50 hover:text-deep-navy"
                        )}>
                          <item.icon className="w-4 h-4" />
                          {item.title}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </nav>
          </div>
          
          <div className="mt-auto p-8 border-t border-soft-blue space-y-4">
              <div className="flex items-center gap-3 px-2">
                  <div className="w-10 h-10 rounded-full bg-stripe-purple/10 flex items-center justify-center text-stripe-purple text-[12px] font-bold">
                      {merchant?.business_name?.[0] || user?.email?.[0].toUpperCase()}
                  </div>
                  <div className="flex flex-col overflow-hidden">
                      <span className="text-sm font-bold text-deep-navy truncate">{merchant?.business_name || 'Merchant'}</span>
                      <span className="text-[10px] text-slate truncate font-medium">{user?.email}</span>
                  </div>
              </div>
              <Button 
                  onClick={handleLogout}
                  variant="ghost" 
                  className="w-full justify-start text-slate hover:text-red-500 hover:bg-red-50 px-4 h-10 rounded-lg transition-colors font-medium text-[10px] uppercase tracking-widest"
              >
                <LogOut className="w-4 h-4 mr-3" />
                Sign out
              </Button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-[#f6f9fc]">
          <header className="h-16 bg-white/80 backdrop-blur-md border-b border-soft-blue flex items-center justify-between px-10 sticky top-0 z-10">
            <div className="flex items-center gap-2">
               <div className="w-1.5 h-1.5 rounded-full bg-success-green animate-pulse" />
               <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate opacity-60">
                  Network: Wirefluid Testnet
               </h2>
            </div>
            <div className="flex items-center gap-4">
               <div className="px-3 py-1 rounded-full border border-soft-blue text-stripe-purple font-bold text-[10px] bg-white">
                 LIVE STATUS: OPTIMAL
               </div>
            </div>
          </header>
          
          <div className="p-10 max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </MerchantProvider>
  );
}
