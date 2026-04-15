'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Home, FileText, CreditCard, Users, Wallet, Code, Settings, ChevronLeft, ChevronRight } from 'lucide-react'
import { useState } from 'react'

const navItems = [
  { name: 'Overview', href: '/dashboard', icon: Home },
  { name: 'Invoices', href: '/dashboard/invoices', icon: FileText },
  { name: 'Payments', href: '/dashboard/payments', icon: CreditCard },
  { name: 'Customers', href: '/dashboard/customers', icon: Users },
  { name: 'Payouts', href: '/dashboard/payouts', icon: Wallet },
  { name: 'Developers', href: '/dashboard/developers', icon: Code },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
]

interface DashboardSidebarProps {
  merchant?: {
    business_name?: string
  }
}

export function DashboardSidebar({ merchant }: DashboardSidebarProps) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  return (
    <aside
      className={cn(
        "hidden lg:flex flex-col bg-white border-r border-gray-200 shrink-0 transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="h-16 flex items-center px-4 border-b border-gray-200 shrink-0">
        {!collapsed ? (
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-linear-to-br from-blue-600 to-indigo-600 rounded-lg shrink-0" />
            <span className="font-bold text-lg text-gray-900">WirePayments</span>
          </Link>
        ) : (
          <Link href="/dashboard" className="flex items-center justify-center w-full">
            <div className="w-8 h-8 bg-linear-to-br from-blue-600 to-indigo-600 rounded-lg shrink-0" />
          </Link>
        )}
      </div>

      {/* Collapse button */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 w-6 h-6 bg-white border border-gray-200 rounded-full flex items-center justify-center shadow-sm hover:bg-gray-50 z-10"
      >
        {collapsed ? (
          <ChevronRight className="w-3 h-3 text-gray-500" />
        ) : (
          <ChevronLeft className="w-3 h-3 text-gray-500" />
        )}
      </button>

      {/* Navigation */}
      <nav className="p-3 space-y-1 flex-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(item.href + '/')
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              )}
              title={collapsed ? item.name : undefined}
            >
              <item.icon className="w-5 h-5 shrink-0" />
              {!collapsed && <span>{item.name}</span>}
            </Link>
          )
        })}
      </nav>

      {/* Merchant info */}
      {!collapsed && merchant?.business_name && (
        <div className="p-3 border-t border-gray-200">
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-500">Account</p>
            <p className="text-sm font-medium text-gray-900 truncate">{merchant.business_name}</p>
          </div>
        </div>
      )}
    </aside>
  )
}
