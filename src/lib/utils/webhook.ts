import { createServiceRoleClient } from '@/lib/supabase/server';
import { WebhookPayload } from '@/types';

interface WebhookResult {
  success: boolean;
  statusCode?: number;
  error?: string;
}

interface WebhookOptions {
  maxRetries?: number;
  initialDelayMs?: number;
}

const DEFAULT_OPTIONS: Required<WebhookOptions> = {
  maxRetries: 3,
  initialDelayMs: 1000,
};

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function sendWebhookAttempt(
  url: string,
  payload: WebhookPayload
): Promise<WebhookResult> {
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'DiagnosticoRentabilidad/1.0',
      },
      body: JSON.stringify(payload),
    });

    return {
      success: response.ok,
      statusCode: response.status,
      error: response.ok ? undefined : `HTTP ${response.status}`,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

async function logWebhookAttempt(params: {
  tenantId: string;
  submissionId: string;
  webhookUrl: string;
  payload: WebhookPayload;
  statusCode?: number;
  errorMessage?: string;
  attemptNumber: number;
  success: boolean;
}): Promise<void> {
  try {
    const supabase = createServiceRoleClient();

    await supabase.from('webhook_logs').insert({
      tenant_id: params.tenantId,
      submission_id: params.submissionId,
      webhook_url: params.webhookUrl,
      payload: params.payload,
      status_code: params.statusCode,
      error_message: params.errorMessage,
      attempt_number: params.attemptNumber,
      success: params.success,
    });
  } catch (error) {
    console.error('Failed to log webhook attempt:', error);
  }
}

export async function sendWebhookWithRetry(params: {
  tenantId: string;
  submissionId: string;
  webhookUrl: string;
  payload: WebhookPayload;
  options?: WebhookOptions;
}): Promise<WebhookResult> {
  const { tenantId, submissionId, webhookUrl, payload, options } = params;
  const opts = { ...DEFAULT_OPTIONS, ...options };

  let lastResult: WebhookResult = { success: false };

  for (let attempt = 1; attempt <= opts.maxRetries; attempt++) {
    lastResult = await sendWebhookAttempt(webhookUrl, payload);

    // Log this attempt
    await logWebhookAttempt({
      tenantId,
      submissionId,
      webhookUrl,
      payload,
      statusCode: lastResult.statusCode,
      errorMessage: lastResult.error,
      attemptNumber: attempt,
      success: lastResult.success,
    });

    if (lastResult.success) {
      return lastResult;
    }

    // Don't retry on client errors (4xx) except 429 (rate limit)
    if (lastResult.statusCode && lastResult.statusCode >= 400 && lastResult.statusCode < 500 && lastResult.statusCode !== 429) {
      break;
    }

    // Wait before retry with exponential backoff
    if (attempt < opts.maxRetries) {
      const delay = opts.initialDelayMs * Math.pow(2, attempt - 1);
      await sleep(delay);
    }
  }

  return lastResult;
}

// Fire-and-forget wrapper that doesn't block
export function fireWebhookAsync(params: {
  tenantId: string;
  submissionId: string;
  webhookUrl: string;
  payload: WebhookPayload;
}): void {
  sendWebhookWithRetry(params).catch((error) => {
    console.error('Webhook fire-and-forget error:', error);
  });
}
