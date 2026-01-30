import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { AnalyticsCards } from '@/components/dashboard/AnalyticsCards';

export default async function AnalyticsPage() {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Get user's tenant
  const { data: userData } = await supabase
    .from('users')
    .select('tenant_id, tenant:tenants(*)')
    .eq('id', user.id)
    .single();

  if (!userData?.tenant_id) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No tienes un tenant asignado.</p>
      </div>
    );
  }

  // Get all submissions for this tenant
  const { data: submissions, error } = await supabase
    .from('submissions')
    .select('*')
    .eq('tenant_id', userData.tenant_id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching submissions:', error);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Estadísticas</h1>
        <p className="text-gray-600">Analítica de uso de tu diagnóstico</p>
      </div>

      <AnalyticsCards submissions={submissions || []} />
    </div>
  );
}
