-- =============================================
-- SCHEMA: Diagnóstico Rentabilidad para Gestorías
-- =============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- ENUM TYPES
-- =============================================

CREATE TYPE user_role AS ENUM ('admin', 'advisor');
CREATE TYPE submission_grade AS ENUM ('A', 'B', 'C');
CREATE TYPE urgency_level AS ENUM ('high', 'medium', 'low');

-- =============================================
-- TABLES
-- =============================================

-- Tenants (Gestorías)
CREATE TABLE tenants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    brand_color VARCHAR(7) DEFAULT '#2563eb',
    webhook_url TEXT,
    send_contact_to_make BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Users (Advisors and Admins)
CREATE TABLE users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    role user_role NOT NULL DEFAULT 'advisor',
    tenant_id UUID REFERENCES tenants(id) ON DELETE SET NULL,
    full_name VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Submissions (Diagnósticos completados)
CREATE TABLE submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    company_name VARCHAR(255) NOT NULL,
    sector VARCHAR(100),
    revenue_range VARCHAR(50),
    employees_range VARCHAR(50),
    email VARCHAR(255),
    phone VARCHAR(50),
    answers JSONB NOT NULL DEFAULT '{}',
    scores JSONB NOT NULL DEFAULT '{}',
    grade submission_grade NOT NULL,
    urgency urgency_level NOT NULL,
    triggers TEXT[] DEFAULT '{}',
    opt_in_help BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- VIEWS
-- =============================================

-- Tenant aggregates view (for admin)
CREATE VIEW tenant_aggregates AS
SELECT
    t.id AS tenant_id,
    t.slug,
    t.name,
    t.brand_color,
    t.is_active,
    COUNT(s.id) AS total_submissions,
    COUNT(CASE WHEN s.grade = 'A' THEN 1 END) AS grade_a_count,
    COUNT(CASE WHEN s.grade = 'B' THEN 1 END) AS grade_b_count,
    COUNT(CASE WHEN s.grade = 'C' THEN 1 END) AS grade_c_count,
    COUNT(CASE WHEN s.urgency = 'high' THEN 1 END) AS high_urgency_count,
    COUNT(CASE WHEN s.urgency = 'medium' THEN 1 END) AS medium_urgency_count,
    COUNT(CASE WHEN s.urgency = 'low' THEN 1 END) AS low_urgency_count,
    COUNT(CASE WHEN s.created_at >= NOW() - INTERVAL '7 days' THEN 1 END) AS submissions_last_7_days,
    COUNT(CASE WHEN s.created_at >= NOW() - INTERVAL '30 days' THEN 1 END) AS submissions_last_30_days,
    t.created_at AS tenant_created_at
FROM tenants t
LEFT JOIN submissions s ON t.id = s.tenant_id
GROUP BY t.id, t.slug, t.name, t.brand_color, t.is_active, t.created_at;

-- Daily aggregates view (for admin analytics)
CREATE VIEW tenant_daily_aggregates AS
SELECT
    t.id AS tenant_id,
    t.slug,
    t.name,
    DATE(s.created_at) AS submission_date,
    COUNT(s.id) AS completed_count,
    COUNT(CASE WHEN s.grade = 'A' THEN 1 END) AS grade_a_count,
    COUNT(CASE WHEN s.grade = 'B' THEN 1 END) AS grade_b_count,
    COUNT(CASE WHEN s.grade = 'C' THEN 1 END) AS grade_c_count,
    COUNT(CASE WHEN s.urgency = 'high' THEN 1 END) AS high_urgency_count,
    COUNT(CASE WHEN (s.scores->>'control')::int < 45 THEN 1 END) AS control_red_count,
    COUNT(CASE WHEN (s.scores->>'precios')::int < 45 THEN 1 END) AS precios_red_count,
    COUNT(CASE WHEN (s.scores->>'operaciones')::int < 45 THEN 1 END) AS operaciones_red_count,
    COUNT(CASE WHEN (s.scores->>'ventas')::int < 45 THEN 1 END) AS ventas_red_count
FROM tenants t
INNER JOIN submissions s ON t.id = s.tenant_id
GROUP BY t.id, t.slug, t.name, DATE(s.created_at);

-- Top pain points view (most common triggers)
CREATE VIEW tenant_top_triggers AS
SELECT
    t.id AS tenant_id,
    t.slug,
    unnest(s.triggers) AS trigger_name,
    COUNT(*) AS trigger_count
FROM tenants t
INNER JOIN submissions s ON t.id = s.tenant_id
WHERE s.created_at >= NOW() - INTERVAL '30 days'
GROUP BY t.id, t.slug, unnest(s.triggers)
ORDER BY t.id, trigger_count DESC;

-- =============================================
-- INDEXES
-- =============================================

CREATE INDEX idx_submissions_tenant_id ON submissions(tenant_id);
CREATE INDEX idx_submissions_created_at ON submissions(created_at DESC);
CREATE INDEX idx_submissions_grade ON submissions(grade);
CREATE INDEX idx_submissions_urgency ON submissions(urgency);
CREATE INDEX idx_submissions_tenant_created ON submissions(tenant_id, created_at DESC);
CREATE INDEX idx_users_tenant_id ON users(tenant_id);
CREATE INDEX idx_tenants_slug ON tenants(slug);

-- =============================================
-- FUNCTIONS
-- =============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_tenants_updated_at
    BEFORE UPDATE ON tenants
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Function to get user role
CREATE OR REPLACE FUNCTION get_user_role(user_id UUID)
RETURNS user_role AS $$
DECLARE
    u_role user_role;
BEGIN
    SELECT role INTO u_role FROM users WHERE id = user_id;
    RETURN u_role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user tenant_id
CREATE OR REPLACE FUNCTION get_user_tenant_id(user_id UUID)
RETURNS UUID AS $$
DECLARE
    t_id UUID;
BEGIN
    SELECT tenant_id INTO t_id FROM users WHERE id = user_id;
    RETURN t_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function for admin to get tenant aggregates (bypasses RLS)
CREATE OR REPLACE FUNCTION get_admin_tenant_aggregates()
RETURNS TABLE (
    tenant_id UUID,
    slug VARCHAR,
    name VARCHAR,
    brand_color VARCHAR,
    is_active BOOLEAN,
    total_submissions BIGINT,
    grade_a_count BIGINT,
    grade_b_count BIGINT,
    grade_c_count BIGINT,
    high_urgency_count BIGINT,
    medium_urgency_count BIGINT,
    low_urgency_count BIGINT,
    submissions_last_7_days BIGINT,
    submissions_last_30_days BIGINT,
    tenant_created_at TIMESTAMPTZ
) AS $$
BEGIN
    -- Only admin can call this function
    IF get_user_role(auth.uid()) != 'admin' THEN
        RAISE EXCEPTION 'Access denied: Admin only';
    END IF;

    RETURN QUERY SELECT * FROM tenant_aggregates;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function for admin to get daily aggregates
CREATE OR REPLACE FUNCTION get_admin_daily_aggregates(p_tenant_id UUID DEFAULT NULL, p_days INT DEFAULT 30)
RETURNS TABLE (
    tenant_id UUID,
    slug VARCHAR,
    name VARCHAR,
    submission_date DATE,
    completed_count BIGINT,
    grade_a_count BIGINT,
    grade_b_count BIGINT,
    grade_c_count BIGINT,
    high_urgency_count BIGINT,
    control_red_count BIGINT,
    precios_red_count BIGINT,
    operaciones_red_count BIGINT,
    ventas_red_count BIGINT
) AS $$
BEGIN
    -- Only admin can call this function
    IF get_user_role(auth.uid()) != 'admin' THEN
        RAISE EXCEPTION 'Access denied: Admin only';
    END IF;

    RETURN QUERY
    SELECT tda.*
    FROM tenant_daily_aggregates tda
    WHERE (p_tenant_id IS NULL OR tda.tenant_id = p_tenant_id)
      AND tda.submission_date >= CURRENT_DATE - p_days;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function for admin to get top triggers
CREATE OR REPLACE FUNCTION get_admin_top_triggers(p_tenant_id UUID DEFAULT NULL)
RETURNS TABLE (
    tenant_id UUID,
    slug VARCHAR,
    trigger_name TEXT,
    trigger_count BIGINT
) AS $$
BEGIN
    -- Only admin can call this function
    IF get_user_role(auth.uid()) != 'admin' THEN
        RAISE EXCEPTION 'Access denied: Admin only';
    END IF;

    RETURN QUERY
    SELECT ttt.*
    FROM tenant_top_triggers ttt
    WHERE p_tenant_id IS NULL OR ttt.tenant_id = p_tenant_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
