import { createServerSupabaseClient } from '@/lib/supabase/server';
import { AdminDashboard } from '@/components/admin/AdminDashboard';
import { EvolutionChart } from '@/components/admin/EvolutionChart';

export default async function AdminPage() {
  const supabase = await createServerSupabaseClient();

  // Get tenant aggregates using the secure function
  const { data: aggregates, error } = await supabase.rpc('get_admin_tenant_aggregates');

  if (error) {
    console.error('Error fetching aggregates:', error);
  }

  // Get daily aggregates for evolution chart (last 30 days)
  const { data: dailyData, error: dailyError } = await supabase.rpc('get_admin_daily_aggregates', {
    p_tenant_id: null,
    p_days: 30,
  });

  if (dailyError) {
    console.error('Error fetching daily aggregates:', dailyError);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Métricas por Tenant</h1>
        <p className="text-gray-600">
          Vista agregada de todos los diagnósticos (sin acceso a datos individuales)
        </p>
      </div>

      {/* Evolution Chart */}
      <EvolutionChart
        data={dailyData || []}
        title="Evolución últimos 30 días"
        days={30}
      />

      <AdminDashboard aggregates={aggregates || []} />
    </div>
  );
}
