'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Building2,
  Users,
  Handshake,
  CalendarCheck,
  Settings,
  Building,
  Receipt,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Properties', href: '/dashboard/properties', icon: Building2 },
  { label: 'Builders', href: '/dashboard/builders', icon: Building },
  { label: 'Clients', href: '/dashboard/clients', icon: Users },
  { label: 'Leads', href: '/dashboard/leads', icon: Handshake },
  { label: 'Site Visits', href: '/dashboard/site-visits', icon: CalendarCheck },
  { label: 'Invoices', href: '/dashboard/invoices', icon: Receipt },
  { label: 'Settings', href: '/dashboard/settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 shrink-0 border-r border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-950 md:flex md:flex-col">
      <div className="mb-8 px-2 py-2">
        <span className="text-lg font-semibold tracking-tight text-neutral-900 dark:text-white">
          Real Estate OS
        </span>
      </div>

      <nav className="flex flex-1 flex-col gap-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-neutral-100 text-neutral-900 dark:bg-neutral-900 dark:text-white'
                  : 'text-neutral-500 hover:bg-neutral-50 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-900 dark:hover:text-white'
              )}
            >
              <Icon size={18} />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}