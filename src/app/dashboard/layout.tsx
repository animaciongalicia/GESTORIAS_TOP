import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { DashboardNav } from '@/components/dashboard/DashboardNav';
import { Tenant } from '@/types';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createServerSupabaseClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Get user data with tenant
  const { data: userData } = await supabase
    .from('users')
    .select('*, tenant:tenants(*)')
    .eq('id', user.id)
    .single();

  if (!userData) {
    redirect('/login');
  }

  // Admin should go to /admin
  if (userData.role === 'admin') {
    redirect('/admin');
  }

  // Extract tenant
  const tenant = userData.tenant as Tenant | null;

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardNav user={userData} tenant={tenant} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
