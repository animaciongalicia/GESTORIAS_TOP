import { NextRequest, NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase/server';
import { calculateFullResult } from '@/lib/utils/scoring';
import { CreateSubmissionPayload, WebhookPayload, AreaCategory } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body: CreateSubmissionPayload = await request.json();

    // Validate required fields
    if (!body.tenant_slug || !body.company_name || !body.answers) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const supabase = createServiceRoleClient();

    // Get tenant by slug
    const { data: tenant, error: tenantError } = await supabase
      .from('tenants')
      .select('*')
      .eq('slug', body.tenant_slug)
      .eq('is_active', true)
      .single();

    if (tenantError || !tenant) {
      return NextResponse.json(
        { error: 'Tenant not found' },
        { status: 404 }
      );
    }

    // Calculate scores, grade, urgency, triggers, etc.
    const result = calculateFullResult(body.answers);

    // Insert submission
    const { data: submission, error: insertError } = await supabase
      .from('submissions')
      .insert({
        tenant_id: tenant.id,
        company_name: body.company_name,
        sector: body.sector || null,
        revenue_range: body.revenue_range || null,
        employees_range: body.employees_range || null,
        email: body.email || null,
        phone: body.phone || null,
        answers: body.answers,
        scores: result.scores,
        grade: result.grade,
        urgency: result.urgency,
        triggers: result.triggers,
        opt_in_help: false,
      })
      .select()
      .single();

    if (insertError) {
      console.error('Insert error:', insertError);
      return NextResponse.json(
        { error: 'Failed to save submission' },
        { status: 500 }
      );
    }

    // Fire webhook if configured
    if (tenant.webhook_url) {
      const redAreas: AreaCategory[] = (Object.entries(result.trafficLights) as [AreaCategory, string][])
        .filter(([, light]) => light === 'red')
        .map(([area]) => area);

      const webhookPayload: WebhookPayload = {
        tenant_slug: tenant.slug,
        submission_id: submission.id,
        grade: result.grade,
        urgency: result.urgency,
        red_areas: redAreas,
        created_at: submission.created_at,
      };

      // Only include contact info if tenant has send_contact_to_make enabled
      if (tenant.send_contact_to_make) {
        if (body.email) webhookPayload.email = body.email;
        if (body.phone) webhookPayload.phone = body.phone;
      }

      // Fire webhook asynchronously (don't await)
      fetch(tenant.webhook_url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(webhookPayload),
      }).catch((err) => {
        console.error('Webhook error:', err);
      });
    }

    return NextResponse.json({
      success: true,
      submission_id: submission.id,
    });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
