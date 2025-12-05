'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@kapital/ui';
import {
  LayoutDashboard,
  ArrowLeftRight,
  Wallet,
  FileText,
  Target,
  Repeat,
  Settings,
  HelpCircle,
} from 'lucide-react';

const navigation = [
  { name: '대시보드', href: '/dashboard', icon: LayoutDashboard },
  { name: '거래내역', href: '/transactions', icon: ArrowLeftRight },
  { name: '계정관리', href: '/accounts', icon: Wallet },
  { name: '반복거래', href: '/recurring', icon: Repeat },
  { name: '재무제표', href: '/reports', icon: FileText },
  { name: '예산', href: '/budgets', icon: Target },
  { name: '설정', href: '/settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-64 lg:flex-col">
      <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r bg-white px-6 pb-4">
        {/* Logo */}
        <div className="flex h-16 shrink-0 items-center">
          <Link href="/dashboard" className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-primary">Kapital</span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex flex-1 flex-col">
          <ul role="list" className="flex flex-1 flex-col gap-y-7">
            <li>
              <ul role="list" className="-mx-2 space-y-1">
                {navigation.map((item) => {
                  const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                  return (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className={cn(
                          'group flex gap-x-3 rounded-md p-2 text-sm font-medium leading-6 transition-colors',
                          isActive
                            ? 'bg-primary text-white'
                            : 'text-gray-700 hover:bg-gray-100'
                        )}
                      >
                        <item.icon
                          className={cn(
                            'h-5 w-5 shrink-0',
                            isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-600'
                          )}
                        />
                        {item.name}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </li>

            {/* Help Link */}
            <li className="mt-auto">
              <Link
                href="/help"
                className="group -mx-2 flex gap-x-3 rounded-md p-2 text-sm font-medium leading-6 text-gray-700 hover:bg-gray-100"
              >
                <HelpCircle className="h-5 w-5 shrink-0 text-gray-400 group-hover:text-gray-600" />
                도움말
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
}
