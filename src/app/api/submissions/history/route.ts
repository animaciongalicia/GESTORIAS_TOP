import { NextRequest, NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase/server';

// Get previous submissions for the same company (by email or company name)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tenantId = searchParams.get('tenant_id');
    const currentSubmissionId = searchParams.get('current_id');
    const email = searchParams.get('email');
    const companyName = searchParams.get('company_name');

    if (!tenantId || !currentSubmissionId) {
      return NextResponse.json(
        { error: 'tenant_id and current_id are required' },
        { status: 400 }
      );
    }

    if (!email && !companyName) {
      return NextResponse.json(
        { error: 'email or company_name is required' },
        { status: 400 }
      );
    }

    const supabase = createServiceRoleClient();

    // Build query to find previous submissions
    let query = supabase
      .from('submissions')
      .select('*')
      .eq('tenant_id', tenantId)
      .neq('id', currentSubmissionId)
      .order('created_at', { ascending: false })
      .limit(5);

    // Match by email first (more reliable), then by company name
    if (email) {
      query = query.eq('email', email);
    } else if (companyName) {
      query = query.ilike('company_name', companyName);
    }

    const { data: submissions, error } = await query;

    if (error) {
      console.error('Error fetching history:', error);
      return NextResponse.json(
        { error: 'Failed to fetch history' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      submissions: submissions || [],
      has_history: (submissions?.length || 0) > 0,
    });
  } catch (error) {
    console.error('History API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
