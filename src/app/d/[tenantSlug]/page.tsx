import { notFound } from 'next/navigation';
import { getTenantBySlug } from '@/lib/data/tenants';
import { Wizard } from '@/components/wizard/Wizard';

interface PageProps {
  params: Promise<{ tenantSlug: string }>;
}

export default async function TenantWizardPage({ params }: PageProps) {
  const { tenantSlug } = await params;
  const tenant = await getTenantBySlug(tenantSlug);

  if (!tenant) {
    notFound();
  }

  return <Wizard tenant={tenant} />;
}

export async function generateMetadata({ params }: PageProps) {
  const { tenantSlug } = await params;
  const tenant = await getTenantBySlug(tenantSlug);

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
