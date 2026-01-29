import { notFound } from 'next/navigation';
import { createServiceRoleClient } from '@/lib/supabase/server';
import { Wizard } from '@/components/wizard/Wizard';
import { Tenant } from '@/types';

interface PageProps {
  params: Promise<{ tenantSlug: string }>;
}

async function getTenant(slug: string): Promise<Tenant | null> {
  const supabase = createServiceRoleClient();

  const { data, error } = await supabase
    .from('tenants')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .single();

  if (error || !data) {
    return null;
  }

  return data as Tenant;
}

export default async function TenantWizardPage({ params }: PageProps) {
  const { tenantSlug } = await params;
  const tenant = await getTenant(tenantSlug);

  if (!tenant) {
    notFound();
  }

  return <Wizard tenant={tenant} />;
}

export async function generateMetadata({ params }: PageProps) {
  const { tenantSlug } = await params;
  const tenant = await getTenant(tenantSlug);

  if (!tenant) {
    return {
      title: 'No encontrado',
    };
  }

  return {
    title: `Diagnóstico de Rentabilidad | ${tenant.name}`,
    description: `Descubre en 5 minutos dónde se te escapa el dinero de tu negocio. Diagnóstico ofrecido por ${tenant.name}.`,
  };
}
