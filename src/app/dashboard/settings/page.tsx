import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { TenantSettings } from '@/components/dashboard/TenantSettings';
import { Tenant } from '@/types';

export default async function SettingsPage() {
  const supabase = await createServerSupabaseClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Get user's tenant
  const { data: userData } = await supabase
    .from('users')
    .select('tenant_id, tenant:tenants(*)')
    .eq('id', user.id)
    .single();

  // Extract tenant
  const tenant = userData?.tenant as Tenant | null;

  if (!tenant) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No tienes un tenant asignado.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Configuración</h1>
        <p className="text-gray-600">Personaliza tu diagnóstico</p>
      </div>

      <TenantSettings tenant={tenant} />
    </div>
  );
}
