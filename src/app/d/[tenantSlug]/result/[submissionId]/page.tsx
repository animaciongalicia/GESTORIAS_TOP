import { cache } from 'react';
import { notFound } from 'next/navigation';
import { createServiceRoleClient } from '@/lib/supabase/server';
import { getTenantBySlug } from '@/lib/data/tenants';
import { ResultView } from '@/components/wizard/ResultView';
import { Submission, Tenant } from '@/types';

interface PageProps {
  params: Promise<{ tenantSlug: string; submissionId: string }>;
}

// Cache submission query within same request
const getSubmission = cache(async (
  submissionId: string,
  tenantId: string
): Promise<Submission | null> => {
  const supabase = createServiceRoleClient();

  const { data, error } = await supabase
    .from('submissions')
    .select('*')
    .eq('id', submissionId)
    .eq('tenant_id', tenantId)
    .single();

  if (error || !data) {
    return null;
  }

  return data as Submission;
});

// Get both tenant and submission with caching
const getSubmissionAndTenant = cache(async (
  tenantSlug: string,
  submissionId: string
): Promise<{ submission: Submission; tenant: Tenant } | null> => {
  const tenant = await getTenantBySlug(tenantSlug);

  if (!tenant) {
    return null;
  }

  const submission = await getSubmission(submissionId, tenant.id);

  if (!submission) {
    return null;
  }

  return { submission, tenant };
});

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
