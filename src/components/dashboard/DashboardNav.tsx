'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { User, Tenant } from '@/types';
import { cn } from '@/lib/utils';

interface DashboardNavProps {
  user: User;
  tenant: Tenant | null;
}

export function DashboardNav({ user, tenant }: DashboardNavProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
  };

  const navItems = [
    { href: '/dashboard', label: 'Diagnósticos', icon: '📋' },
    { href: '/dashboard/analytics', label: 'Estadísticas', icon: '📊' },
    { href: '/dashboard/settings', label: 'Configuración', icon: '⚙️' },
  ];

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo / Tenant name */}
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="font-semibold text-lg"
              style={{ color: tenant?.brand_color || '#2563eb' }}
            >
              {tenant?.name || 'Dashboard'}
            </Link>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                  pathname === item.href
                    ? 'bg-gray-100 text-gray-900'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                )}
              >
                <span className="mr-2">{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </nav>

          {/* User menu */}
          <div className="flex items-center gap-4">
            {tenant && (
              <Link
                href={`/d/${tenant.slug}`}
                target="_blank"
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Ver wizard →
              </Link>
            )}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">{user.email}</span>
              <button
                onClick={handleLogout}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Salir
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
