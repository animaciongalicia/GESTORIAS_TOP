import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { SubmissionDetail } from '@/components/dashboard/SubmissionDetail';
import { Tenant } from '@/types';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function SubmissionDetailPage({ params }: PageProps) {
  const { id } = await params;
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
    redirect('/dashboard');
  }

  // Extract tenant (Supabase returns it as array for relations)
  const tenantData = userData.tenant;
  const tenant = (Array.isArray(tenantData) ? tenantData[0] : tenantData) as Tenant | null;

  // Get submission (RLS ensures only tenant's submissions are visible)
  const { data: submission, error } = await supabase
    .from('submissions')
    .select('*')
    .eq('id', id)
    .eq('tenant_id', userData.tenant_id)
    .single();

  if (error || !submission) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard"
          className="text-gray-500 hover:text-gray-700"
        >
          ← Volver
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          {submission.company_name}
        </h1>
      </div>

      <SubmissionDetail
        submission={submission}
        tenantSlug={tenant?.slug || ''}
      />
    </div>
  );
}
