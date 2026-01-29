import { createServerSupabaseClient } from '@/lib/supabase/server';
import { AdminDashboard } from '@/components/admin/AdminDashboard';

export default async function AdminPage() {
  const supabase = await createServerSupabaseClient();

  // Get tenant aggregates using the secure function
  const { data: aggregates, error } = await supabase.rpc('get_admin_tenant_aggregates');

  if (error) {
    console.error('Error fetching aggregates:', error);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Métricas por Tenant</h1>
        <p className="text-gray-600">
          Vista agregada de todos los diagnósticos (sin acceso a datos individuales)
        </p>
      </div>

      <AdminDashboard aggregates={aggregates || []} />
    </div>
  );
}
