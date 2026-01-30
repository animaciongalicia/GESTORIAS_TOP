import { NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase/server';
import { unstable_cache } from 'next/cache';

// Cache the count for 5 minutes
const getCachedCount = unstable_cache(
  async () => {
    const supabase = createServiceRoleClient();

    const { count, error } = await supabase
      .from('submissions')
      .select('*', { count: 'exact', head: true });

    if (error) {
      console.error('Error fetching count:', error);
      return 0;
    }

    return count || 0;
  },
  ['total-submissions-count'],
  { revalidate: 300, tags: ['submissions'] }
);

export async function GET() {
  try {
    const count = await getCachedCount();

    return NextResponse.json({
      total_submissions: count,
    });
  } catch (error) {
    console.error('Stats API error:', error);
    return NextResponse.json(
      { error: 'Error fetching stats' },
      { status: 500 }
    );
  }
}
