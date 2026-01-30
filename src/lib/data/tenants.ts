import { cache } from 'react';
import { unstable_cache } from 'next/cache';
import { createServiceRoleClient } from '@/lib/supabase/server';
import { Tenant } from '@/types';

// React cache() - deduplicates within same request
// unstable_cache() - caches across requests for 60 seconds

const getTenantFromDb = async (slug: string): Promise<Tenant | null> => {
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
};

// Cache tenant for 60 seconds across requests
// Revalidate on tenant update via revalidateTag('tenant-{slug}')
const getCachedTenant = unstable_cache(
  getTenantFromDb,
  ['tenant-by-slug'],
  {
    revalidate: 60, // 60 seconds
    tags: ['tenants'],
  }
);

// Deduplicate within same request + cache across requests
export const getTenantBySlug = cache(async (slug: string): Promise<Tenant | null> => {
  return getCachedTenant(slug);
});

// Get tenant with submission count (for landing page counter)
export const getTenantWithStats = cache(async (slug: string): Promise<{
  tenant: Tenant;
  submissionCount: number;
} | null> => {
  const supabase = createServiceRoleClient();

  const { data: tenant, error: tenantError } = await supabase
    .from('tenants')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .single();

  if (tenantError || !tenant) {
    return null;
  }

  const { count } = await supabase
    .from('submissions')
    .select('*', { count: 'exact', head: true })
    .eq('tenant_id', tenant.id);

  return {
    tenant: tenant as Tenant,
    submissionCount: count || 0,
  };
});

// Invalidate tenant cache (call after tenant update)
export async function invalidateTenantCache(slug: string) {
  const { revalidateTag } = await import('next/cache');
  revalidateTag('tenants');
  revalidateTag(`tenant-${slug}`);
}
