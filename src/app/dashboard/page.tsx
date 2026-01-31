import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { SubmissionsList } from '@/components/dashboard/SubmissionsList';
import { Tenant } from '@/types';

export default async function DashboardPage() {
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

  if (!userData?.tenant_id) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No tienes un tenant asignado.</p>
      </div>
    );
  }

  // Extract tenant (Supabase returns it as array or object depending on relationship)
  const tenant = userData.tenant as Tenant | null;

  // Get submissions for this tenant
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Diagnósticos</h1>
          <p className="text-gray-600">
            {submissions?.length || 0} diagnósticos completados
          </p>
        </div>
      </div>

      <SubmissionsList
        submissions={submissions || []}
        tenantSlug={tenant?.slug || ''}
      />
    </div>
  );
}
