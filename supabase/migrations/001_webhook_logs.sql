-- =============================================
-- WEBHOOK LOGS TABLE
-- =============================================

-- Table to track webhook delivery attempts
CREATE TABLE IF NOT EXISTS webhook_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    submission_id UUID NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
    webhook_url TEXT NOT NULL,
    payload JSONB NOT NULL,
    status_code INTEGER,
    response_body TEXT,
    error_message TEXT,
    attempt_number INTEGER NOT NULL DEFAULT 1,
    success BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for efficient querying
CREATE INDEX idx_webhook_logs_tenant_id ON webhook_logs(tenant_id);
CREATE INDEX idx_webhook_logs_submission_id ON webhook_logs(submission_id);
CREATE INDEX idx_webhook_logs_created_at ON webhook_logs(created_at DESC);
CREATE INDEX idx_webhook_logs_success ON webhook_logs(success);

-- RLS Policies
ALTER TABLE webhook_logs ENABLE ROW LEVEL SECURITY;

-- Advisors can view webhook logs for their tenant
CREATE POLICY "Advisors can view their tenant webhook logs"
ON webhook_logs FOR SELECT
USING (
    tenant_id = get_user_tenant_id(auth.uid())
);

-- Service role can insert/update
CREATE POLICY "Service role can manage webhook logs"
ON webhook_logs FOR ALL
USING (true)
WITH CHECK (true);
