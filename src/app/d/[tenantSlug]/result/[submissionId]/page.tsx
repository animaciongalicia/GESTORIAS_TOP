import { notFound } from 'next/navigation';
import { createServiceRoleClient } from '@/lib/supabase/server';
import { ResultView } from '@/components/wizard/ResultView';
import { Submission, Tenant } from '@/types';

interface PageProps {
  params: Promise<{ tenantSlug: string; submissionId: string }>;
}

async function getSubmissionAndTenant(
  tenantSlug: string,
  submissionId: string
): Promise<{ submission: Submission; tenant: Tenant } | null> {
  const supabase = createServiceRoleClient();

  // Get tenant first
  const { data: tenant, error: tenantError } = await supabase
    .from('tenants')
    .select('*')
    .eq('slug', tenantSlug)
    .eq('is_active', true)
    .single();

  if (tenantError || !tenant) {
    return null;
  }

  // Get submission
  const { data: submission, error: submissionError } = await supabase
    .from('submissions')
    .select('*')
    .eq('id', submissionId)
    .eq('tenant_id', tenant.id)
    .single();

  if (submissionError || !submission) {
    return null;
  }

  return {
    submission: submission as Submission,
    tenant: tenant as Tenant,
  };
}

export default async function ResultPage({ params }: PageProps) {
  const { tenantSlug, submissionId } = await params;
  const data = await getSubmissionAndTenant(tenantSlug, submissionId);

  if (!data) {
    notFound();
  }

  return <ResultView submission={data.submission} tenant={data.tenant} />;
}

export async function generateMetadata({ params }: PageProps) {
  const { tenantSlug, submissionId } = await params;
  const data = await getSubmissionAndTenant(tenantSlug, submissionId);

  if (!data) {
    return {
      title: 'Resultado no encontrado',
    };
  }

  return {
    title: `Resultado del Diagnóstico | ${data.tenant.name}`,
    description: `Resultado del diagnóstico de rentabilidad para ${data.submission.company_name}`,
  };
}
