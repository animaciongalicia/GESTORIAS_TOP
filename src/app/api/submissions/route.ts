import { NextRequest, NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase/server';
import { calculateFullResult } from '@/lib/utils/scoring';
import { validateAnswers, validateEmail, validatePhone, sanitizeString } from '@/lib/utils/validation';
import { fireWebhookAsync } from '@/lib/utils/webhook';
import { sendHighUrgencyEmailAsync } from '@/lib/utils/email';
import { CreateSubmissionPayload, WebhookPayload, AreaCategory } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body: CreateSubmissionPayload = await request.json();

    // Validate required fields
    if (!body.tenant_slug || !body.company_name) {
      return NextResponse.json(
        { error: 'Missing required fields: tenant_slug and company_name are required' },
        { status: 400 }
      );
    }

    // Validate answers (all 14 questions with values 1-5)
    const answersValidation = validateAnswers(body.answers);
    if (!answersValidation.valid) {
      return NextResponse.json(
        { error: answersValidation.error },
        { status: 400 }
      );
    }

    // Validate optional email format
    if (body.email && !validateEmail(body.email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate optional phone format
    if (body.phone && !validatePhone(body.phone)) {
      return NextResponse.json(
        { error: 'Invalid phone format' },
        { status: 400 }
      );
    }

    // Sanitize string inputs
    const companyName = sanitizeString(body.company_name, 255);
    const sector = body.sector ? sanitizeString(body.sector, 100) : null;
    const revenueRange = body.revenue_range ? sanitizeString(body.revenue_range, 50) : null;
    const employeesRange = body.employees_range ? sanitizeString(body.employees_range, 50) : null;
    const email = body.email ? sanitizeString(body.email, 255) : null;
    const phone = body.phone ? sanitizeString(body.phone, 50) : null;

    if (!companyName) {
      return NextResponse.json(
        { error: 'company_name cannot be empty' },
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
        company_name: companyName,
        sector,
        revenue_range: revenueRange,
        employees_range: employeesRange,
        email,
        phone,
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

    // Fire webhook if configured (with retry logic and logging)
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
        if (email) webhookPayload.email = email;
        if (phone) webhookPayload.phone = phone;
      }

      // Fire webhook asynchronously with retry and logging
      fireWebhookAsync({
        tenantId: tenant.id,
        submissionId: submission.id,
        webhookUrl: tenant.webhook_url,
        payload: webhookPayload,
      });
    }

    // Send email notification for high urgency if configured
    if (
      result.urgency === 'high' &&
      tenant.notify_high_urgency !== false &&
      tenant.notification_email
    ) {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://tudominio.com';
      sendHighUrgencyEmailAsync(tenant.notification_email, {
        tenantName: tenant.name,
        companyName: companyName,
        grade: result.grade,
        urgency: result.urgency,
        submissionId: submission.id,
        dashboardUrl: `${baseUrl}/dashboard/submission/${submission.id}`,
        triggers: result.triggers,
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
